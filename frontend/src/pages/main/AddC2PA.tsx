import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { useAccount } from "wagmi";

import AppNavbar from '@/components/AppNavbar';
import AppSidebar from '@/components/AppSideBar';
import LoadingScreen from '@/components/LoadingScreen';


async function embedAsset(path: string, mimeType: string, assetID: string, ext: string, hash: string, phash: string, walletID: string, setLoading: Function, setData: Function){
    const backendURL = import.meta.env.VITE_BACKEND_URL;

    try{
        const response = await axios.post(`${backendURL}/add-c2pa`, {
            "publicURL" : path, "fileType": mimeType, assetID, ext, hash, phash, walletID
        })

        if(response.data){
            setLoading(false);
            setData(response.data);
            console.log(response.data);
        }
    }
    catch (error) {
        console.error("Embedding watermark error:", error);
    } finally {
        setLoading(false);
    }
}

function AddC2PA() {

  const [data, setData] = useState();
  const [isLoading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state == null) {
      navigate("/dashboard/");
    }
  }, [location, navigate]);
  
  const { assetID, ext, fileType, manifest, watermarkedURL, hash, phash, w_phash_vector } = location.state;
  
  const {address} = useAccount(); 
  
    useEffect(() => {
      embedAsset(watermarkedURL, fileType, assetID, ext, hash, phash, address as string, setLoading,setData);
    }, []);
  
  const navigateToNextPage= () => {

    const {publicURL, signedManifest} = data as any;

    console.log(data);

    navigate("/register-on-story/", {
        state: {
          publicURL, 
          assetID, 
          ext, 
          fileType,
          manifest,
          signedManifest,
          watermarkedURL,
          c2paURL: publicURL,
          hash,
          phash,
          w_phash_vector
        }})
  };

  return (
    <AppSidebar>
      <AppNavbar title="Add C2PA" />
        
      <div className='flex justify-center m-5'>
        <div className='w-full max-w-screen-lg'>

            {isLoading ? <LoadingScreen text="Adding C2PA into your asset..."/> : (
              <>
                <div className="w-full flex justify-center overflow-hidden">
                    <img
                      src={location.state?.publicURL}
                      alt="Uploaded asset"
                      className="object-cover max-w-[400px] h-[300px] border rounded-lg shadow-md"
                    />
                </div>
                <div className='flex justify-center m-10'>
                  <p className='text-3xl text-green-500 font-bold'>
                    Successfully embeded C2PA!
                  </p>
                </div>
                <div className='m-10 flex justify-center'>
                  <div className="flex p-5 bg-[#637AFA] text-white rounded-md hover:cursor-pointer" onClick={navigateToNextPage}>
                    <div className="pr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="lucide lucide-shield-check-icon lucide-shield-check" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-l font-bold">Register on Story</p>
                    </div>
                  </div>
                </div>
                </>
            )}
          

        </div>
      </div>
    </AppSidebar>
  );
}

export default AddC2PA;
