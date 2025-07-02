import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { createClient } from "@supabase/supabase-js";
import {  useNavigate } from "react-router-dom";

import AppNavbar from "@/components/AppNavbar";
import AppSidebar from "@/components/AppSideBar";
import LoadingScreen from "@/components/LoadingScreen";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!
);

function shortenAssetID(assetID: string) {
  return assetID.length <= 10
    ? assetID
    : `${assetID.slice(0, 5)}...${assetID.slice(-5)}`;
}

function Scanner() {
  const { address, isDisconnected } = useAccount();
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    async function fetchComplaintsWithAssets() {
      if (!address || isDisconnected) {
        setComplaints([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      const { data: complaintsData, error: complaintsError } = await supabase
        .from("complaints")
        .select("*")
        .eq("walletID", address)
        .order("created_at", { ascending: false });

      if (complaintsError) {
        console.error("Error fetching complaints:", complaintsError);
        setComplaints([]);
        setIsLoading(false);
        return;
      }

      const enrichedComplaints = await Promise.all(
        (complaintsData || []).map(async (complaint) => {
          const { data: assetData } = await supabase
            .from("assets")
            .select("title, description, publicurl, assetid, ipassetid")
            .eq("assetid", complaint.assetID)
            .single();

          return { ...complaint, asset: assetData || null };
        })
      );

      setComplaints(enrichedComplaints);
      setIsLoading(false);
    }

    fetchComplaintsWithAssets();
  }, [address, isDisconnected]);

  function handleWriteDMCA(c: any) {
    console.log("Write DMCA for:", c);
    navigate("/dmca", {
      state: {
        complaint: c
      }
    })
  }

  return (
    <AppSidebar>
      <AppNavbar title="IP Infringement Report" />
      {isLoading ? (
        <LoadingScreen text="Loading..." />
      ) : (
        <div className="p-5 flex justify-center">
          {complaints.length === 0 ? (
            <p className="text-gray-400">No complaints found for your assets.</p>
          ) : (
            <div className="overflow-x-auto rounded-lg">
              <table className="min-w-full bg-[rgb(25,25,25)] text-gray-200 border border-gray-700 text-sm">
                <thead className="bg-gray-800 uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-2 border border-gray-700">#</th>
                    <th className="px-4 py-2 border border-gray-700">Created At</th>
                    <th className="px-4 py-2 border border-gray-700">Asset ID</th>
                    <th className="px-4 py-2 border border-gray-700">Title</th>
                    <th className="px-4 py-2 border border-gray-700">Description</th>
                    <th className="px-4 py-2 border border-gray-700">Original Image</th>
                    <th className="px-4 py-2 border border-gray-700">Complaint Image</th>
                    <th className="px-4 py-2 border border-gray-700">Similarity</th>
                    <th className="px-4 py-2 border border-gray-700">Source</th>
                    <th className="px-4 py-2 border border-gray-700">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((c, index) => (
                    <tr key={c.id} className="hover:bg-gray-700 transition">
                      <td className="px-4 py-2 border border-gray-700">{index + 1}</td>
                      <td className="px-4 py-2 border border-gray-700">
                        {new Date(c.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {c.asset?.ipassetid ? (
                          <a
                            href={`https://aeneid.explorer.story.foundation/ipa/${c.asset.ipassetid}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            {shortenAssetID(c.asset.assetid)}
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {c.asset?.title || <span className="text-gray-500">N/A</span>}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {c.asset?.description || <span className="text-gray-500">N/A</span>}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {c.asset?.publicurl ? (
                          <a
                            href={c.asset.publicurl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            Open
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {c.complaintImage ? (
                          <a
                            href={c.complaintImage}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            View
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {c.similarityScore ? c.similarityScore.toFixed(2) + " %" : "N/A"}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        {c.link ? (
                          <a
                            href={c.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 underline"
                          >
                            Source
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td>
                      <td className="px-4 py-2 border border-gray-700">
                        <button
                          onClick={() => handleWriteDMCA(c)}
                          className="bg-[#637AFA] cursor-pointer text-white text-xs px-3 py-1 rounded"
                        >
                          File DMCA Takedown
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </AppSidebar>
  );
}

export default Scanner;
