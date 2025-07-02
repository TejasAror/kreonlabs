import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount, useWalletClient } from "wagmi";
import { PinataSDK } from "pinata-web3";
import { Toaster, toast } from 'react-hot-toast';
import { custom } from 'viem';
import { StoryClient } from "@story-protocol/core-sdk";
import type { StoryConfig } from "@story-protocol/core-sdk";

import AppNavbar from '@/components/AppNavbar';
import AppSidebar from '@/components/AppSideBar';
import LoadingScreen from '@/components/LoadingScreen';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

const pinata = new PinataSDK({
  pinataJwt: import.meta.env.VITE_PINATA_JWT!
});

export async function uploadJSONToIPFS(jsonMetadata: any): Promise<string> {
  const { IpfsHash } = await pinata.upload.json(jsonMetadata);
  return IpfsHash;
}

async function computeSHA256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input || '');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function findAssertions(manifest: any) {
  const mainAssetAssertions = manifest.assertions;
  if (!mainAssetAssertions) return [];
  return mainAssetAssertions.filter(
    (element: any) => element.label === "com.kreon-labs.story-registration"
  );
}

function findCreators(manifest: any) {
  const originalMetadata = findAssertions(manifest);
  let ingredientMetadataList: any[] = [];

  function recurseIngredients(ingredients: any[]) {
    ingredients.forEach((element: any) => {
      if (!element.manifest) return;

      const creator = findAssertions(element.manifest);
      if (creator.length > 0) {
        ingredientMetadataList.push(...creator);
      }

      if (element.manifest.ingredients) {
        recurseIngredients(element.manifest.ingredients);
      }
    });
  }

  if (manifest.ingredients) {
    recurseIngredients(manifest.ingredients);
  }

  return { originalMetadata, ingredientMetadataList };
}

function hammingDistance(hash1: string, hash2: string): number {
  const bin1 = BigInt("0x" + hash1).toString(2).padStart(64, "0");
  const bin2 = BigInt("0x" + hash2).toString(2).padStart(64, "0");
  return [...bin1].filter((bit, i) => bit !== bin2[i]).length;
}

function findAllCreatorsWithContribution(manifest: any) {
  const { originalMetadata, ingredientMetadataList } = findCreators(manifest);
  const finalPHash = originalMetadata[0]?.data?.pHash;
  if (!finalPHash) return [];

  const similarityMap: Record<string, {
    name: string;
    address: string;
    description: string;
    similarity: number;
  }> = {};

  for (const ingredient of ingredientMetadataList) {
    const pHash = ingredient.data?.pHash;
    const address = ingredient.data?.wallet;
    if (!pHash || !address) continue;

    const dist = hammingDistance(finalPHash, pHash);
    const maxLength = finalPHash.length * 4;
    const similarity = ((maxLength - dist) / maxLength) * 100;

    if (similarityMap[address]) {
      similarityMap[address].similarity += similarity;
    } else {
      similarityMap[address] = {
        name: "",
        address,
        description: "",
        similarity,
      };
    }
  }

  const creatorsRaw = Object.values(similarityMap);
  const totalSimilarity = creatorsRaw.reduce((sum, c) => sum + c.similarity, 0);

  const creators = creatorsRaw.map((c) => ({
    name: c.name,
    address: c.address,
    description: c.description,
    contributionPercent:
      totalSimilarity > 0
        ? parseFloat(((c.similarity / totalSimilarity) * 100).toFixed(2))
        : 0,
  }));

  const originalCreator = originalMetadata[0];
  const final = {
    name: "",
    address: originalCreator?.data?.wallet || "",
    description: "",
    contributionPercent: totalSimilarity > 0 ? 0 : 100,
  };

  return [final, ...creators];
}

function RegisterOnStory() {
  const [isLoading, setLoading] = useState(false);
  const [isRegistered, setRegistered] = useState(false);
  const [registeredIpId, setRegisteredIpId] = useState<string | null>(null);

  const [ipForm, setIpForm] = useState({
    title: '',
    description: '',
    creatorName: '',
    creatorAddress: '',
    creatorDescription: '',
  });

  const [creators, setCreators] = useState<
    { name: string; address: string; description: string; contributionPercent: number }[]
  >([]);

  const location = useLocation();
  const navigate = useNavigate();
  const { data: wallet } = useWalletClient();
  const { isDisconnected, address } = useAccount();

  useEffect(() => {
    if (!location.state) {
      navigate("/dashboard/");
    } else {
      const creators = findAllCreatorsWithContribution(location.state.signedManifest);
      setCreators(creators);
    }
  }, [location, navigate]);

  if (!location.state) return null;

  const {
    publicURL,
    assetID,
    ext,
    fileType,
    signedManifest,
    watermarkedURL,
    c2paURL,
    hash,
    phash,
    w_phash_vector
  } = location.state;

  console.log("PHAsh", location.state.phash);

  async function setupStoryClient(): Promise<StoryClient> {
    const config: StoryConfig = {
      wallet: wallet!,
      transport: custom(wallet!.transport),
      chainId: "aeneid",
    };
    return StoryClient.newClient(config);
  }

  const handleSubmit = async () => {
    if (isDisconnected) {
      toast.error('Wallet not connected');
      return;
    }

    setLoading(true);
    try {
      let finalCreators = creators;
      if (finalCreators.length === 0) {
        finalCreators = [{
          name: ipForm.creatorName,
          address: address || '',
          description: ipForm.creatorDescription,
          contributionPercent: 100,
        }];
      }

      const ipMetadata = {
        title: ipForm.title,
        description: ipForm.description,
        image: publicURL,
        imageHash: hash,
        mediaUrl: c2paURL,
        mediaHash: hash,
        mediaType: c2paURL,
        c2paManifest: signedManifest,
        pHash: phash,
        creators: finalCreators,
      };

      const nftMetadata = {
        name: `Ownership of ${ipMetadata.title}`,
        description: `NFT representing ownership of IP titled: ${ipMetadata.description}`,
        image: ipMetadata.image,
      };

      const ipIpfsHash = await uploadJSONToIPFS(ipMetadata);
      const nftIpfsHash = await uploadJSONToIPFS(nftMetadata);

      const ipHash = await computeSHA256(JSON.stringify(ipMetadata));
      const nftHash = await computeSHA256(JSON.stringify(nftMetadata));

      const client = await setupStoryClient();

      const response = await client.ipAsset.mintAndRegisterIp({
        spgNftContract: "0xc32A8a0FF3beDDDa58393d022aF433e78739FAbc",
        ipMetadata: {
          ipMetadataURI: `https://ipfs.io/ipfs/${ipIpfsHash}`,
          ipMetadataHash: `0x${ipHash}`,
          nftMetadataURI: `https://ipfs.io/ipfs/${nftIpfsHash}`,
          nftMetadataHash: `0x${nftHash}`,
        },
      });

      setRegistered(true);
      setRegisteredIpId(response.ipId as string);

      const { error } = await supabase.from("assets").insert([
        {
          publicurl: publicURL,
          assetid: assetID,
          ext,
          filetype: fileType,
          signedmanifest: JSON.stringify(signedManifest),
          watermarkedurl: watermarkedURL,
          c2paurl: c2paURL,
          hash,
          phash,
          title: ipForm.title,
          description: ipForm.description,
          ipassetid: response.ipId,
          ipipfshash: ipIpfsHash,
          nftipfshash: nftHash,
          walletid: address,
          phash_embedding: w_phash_vector
        }
      ]);

      if (error) {
        console.error("Error inserting into Supabase:", error);
        toast.error("Database insert failed");
      }

    } catch (error) {
      console.error("Error during registration:", error);
      toast.error("Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const updateIpForm = (field: string, value: string) => {
    setIpForm((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AppSidebar>
      <AppNavbar title="Register on Story" />
      <Toaster position="bottom-right" />
      <div className="flex justify-center m-6">
        <div className="w-full max-w-screen-lg grid grid-cols-1 md:grid-cols-2 gap-8">
          {isLoading ? (
            <div className="col-span-2">
              <LoadingScreen text="Registering on Story Protocol..." />
            </div>
          ) : isRegistered ? (
            <div className="col-span-2 flex flex-col items-center justify-center p-8 border-1 rounded-md shadow-md">
              <h2 className="text-2xl font-bold mb-2 text-center">Successfully Registered on Story Protocol!</h2>
              <p className="text-center text-muted-foreground mb-4">
                Your IP asset has been registered with ID: {registeredIpId}
              </p>
              <a
                href={`https://aeneid.explorer.story.foundation/ipa/${registeredIpId}`}
                target="_blank"
                rel="noopener noreferrer"
                className=" hover:text-blue-800"
              >
                <div className="flex m-5 p-5 bg-[#637AFA] text-white rounded-md hover:cursor-pointer ">
                  <p className="text-l font-bold inline-block align-middle">View on Story Explorer</p>
                </div>
              </a>
              

              <div className='flex m-10'>
                <a download={watermarkedURL} href={watermarkedURL} target="_blank" rel="noopener noreferrer">
                  <div className="flex m-5 p-5 bg-gray-400 text-white rounded-md hover:cursor-pointer">
                    <p className="text-l font-bold inline-block align-middle">Download Watermarked Image</p>
                  </div>
                </a>
                <a download={c2paURL} href={c2paURL} target="_blank" rel="noopener noreferrer">
                  <div className="flex m-5 p-5 bg-gray-400 text-white rounded-md hover:cursor-pointer">
                    <p className="text-l font-bold inline-block align-middle">Download C2PA Embedded Image</p>
                  </div>
                </a>
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">IP Metadata</h2>

                <input
                  className="w-full p-2 border rounded-md"
                  placeholder="Title"
                  onChange={(e) => updateIpForm('title', e.target.value)}
                />
                <textarea
                  className="w-full p-2 border rounded-md"
                  placeholder="Description"
                  rows={3}
                  onChange={(e) => updateIpForm('description', e.target.value)}
                />

                <h3 className="text-lg font-medium pt-4">Creator Info</h3>
                <input
                  className="w-full p-2 border rounded-md"
                  placeholder="Creator Name"
                  onChange={(e) => updateIpForm('creatorName', e.target.value)}
                />
                <input
                  className="w-full p-2 border rounded-md"
                  placeholder="Creator Description"
                  onChange={(e) => updateIpForm('creatorDescription', e.target.value)}
                />

                <div
                  className="flex justify-center p-5 bg-[#637AFA] text-white rounded-md hover:cursor-pointer"
                  onClick={handleSubmit}
                >
                  <p className="text-l font-bold">Register on Story</p>
                </div>
              </div>

              <div className="w-full flex-col justify-center items-start overflow-hidden">
                <div className='flex justify-center'>
                  <img
                    src={publicURL}
                    alt="Uploaded asset"
                    className="object-cover max-w-[600px] h-[300px] border rounded-lg shadow-md"
                  />
                </div>
                {creators.length > 0 && (
                  <div className="pt-6 mt-6 px-6 py-6 border rounded-md shadow-sm max-w-lg w-full">
                    <h4 className="text-lg font-semibold mb-4"> Detected Creator Contributions</h4>
                    <ul className=" space-y-2 text-sm">
                      {creators.map((c, i) => (
                        <li
                          key={i}
                          className="flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {c.address.slice(0, 10)}...{c.address.slice(-10)} {c.address == address && "(You)"}
                            </span>
                            {c.name && <span className="text-xs text-gray-500">{c.name}</span>}
                          </div>
                          <span className="font-semibold text-green-500">
                            {c.contributionPercent}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AppSidebar>
  );
}

export default RegisterOnStory;
