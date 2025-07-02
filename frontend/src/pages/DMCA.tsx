import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

import AppNavbar from "@/components/AppNavbar";
import AppSidebar from "@/components/AppSideBar";
import LoadingScreen from "@/components/LoadingScreen";

const backendURL = import.meta.env.VITE_BACKEND_URL;

function DMCA() {
  const location = useLocation();
  const { complaint } = location.state || {};
  const [dmcaText, setDmcaText] = useState("");
  const [downloadLink, setDownloadLink] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!complaint) {
      setError("No complaint data provided.");
      setIsLoading(false);
      return;
    }

    async function generateDMCA() {
      try {
        const response = await axios.post(`${backendURL}/generate-dmca`, {
          createdAt: complaint.created_at,
          assetID: complaint.assetID,
          title: complaint.asset?.title || "Untitled Asset",
          description: complaint.asset?.description || "No description",
          originalImageURL: complaint.asset?.publicurl || "",
          complaintImageURL: complaint.complaintImage,
          similarityScore: complaint.similarityScore,
          sourceURL: complaint.link,
          ipAssetID: complaint.asset?.ipassetid || "",
          storyProofURL: `https://aeneid.explorer.story.foundation/ipa/${complaint.asset?.ipassetid}`,
        });

        setDmcaText(response.data.text);
        setDownloadLink(`${backendURL}${response.data.downloadURL}`);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to generate DMCA");
      } finally {
        setIsLoading(false);
      }
    }

    generateDMCA();
  }, [complaint]);

  return (
    <AppSidebar>
      <AppNavbar title="Generated DMCA Takedown Notice" />

      <div className="p-6 space-y-6 text-sm text-gray-200 min-h-screen">
        {isLoading ? (
          <LoadingScreen text="Generating DMCA..." />
        ) : error ? (
          <div className="text-red-400 text-lg">{error}</div>
        ) : (
          <>
            {/* Complaint Metadata */}
            {complaint && (
              <div className="overflow-x-auto border border-gray-700 rounded-md">
                <table className="min-w-full table-auto text-left text-sm">
                  <thead>
                    <tr className="bg-gray-800 text-gray-100">
                      <th className="px-4 py-2 border border-gray-700">Field</th>
                      <th className="px-4 py-2 border border-gray-700">Value</th>
                    </tr>
                  </thead>
                  <tbody className="text-gray-300">
                    <tr><td className="border px-4 py-2">Created At</td><td className="border px-4 py-2">{complaint.created_at}</td></tr>
                    <tr><td className="border px-4 py-2">Asset ID</td><td className="border px-4 py-2">{complaint.assetID}</td></tr>
                    <tr><td className="border px-4 py-2">Title</td><td className="border px-4 py-2">{complaint.asset?.title || "Untitled"}</td></tr>
                    <tr><td className="border px-4 py-2">Description</td><td className="border px-4 py-2">{complaint.asset?.description || "No description"}</td></tr>
                    <tr><td className="border px-4 py-2">Original Image</td><td className="border px-4 py-2"><a href={complaint.asset?.publicurl} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">{complaint.asset?.publicurl}</a></td></tr>
                    <tr><td className="border px-4 py-2">Complaint Image</td><td className="border px-4 py-2"><a href={complaint.complaintImage} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">{complaint.complaintImage}</a></td></tr>
                    <tr><td className="border px-4 py-2">Similarity Score</td><td className="border px-4 py-2">{complaint.similarityScore}</td></tr>
                    <tr><td className="border px-4 py-2">Source URL</td><td className="border px-4 py-2"><a href={complaint.link} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">{complaint.link}</a></td></tr>
                    <tr><td className="border px-4 py-2">IP Asset ID</td><td className="border px-4 py-2">{complaint.asset?.ipassetid || "N/A"}</td></tr>
                    <tr><td className="border px-4 py-2">Story Explorer</td><td className="border px-4 py-2"><a href={`https://aeneid.explorer.story.foundation/ipa/${complaint.asset?.ipassetid}`} className="text-blue-400 underline" target="_blank" rel="noopener noreferrer">View on Story Explorer</a></td></tr>
                  </tbody>
                </table>
              </div>
            )}

            {/* Generated DMCA Content */}
            <div className="bg-gray-900 border border-gray-700 p-6 rounded-lg font-mono text-sm whitespace-pre-wrap max-h-[70vh] overflow-auto shadow-lg">
              {dmcaText}
            </div>

            {/* Download Button */}
            {downloadLink && (
              <div className="mt-4 flex justify-center">
                <a
                  href={downloadLink}
                  download
                  className="inline-flex items-center px-4 py-2 rounded-md shadow-sm transition-all duration-200"
                >
                  <div className="flex p-5 bg-[#637AFA] text-white rounded-md hover:cursor-pointer" >
                    <div className="pr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-download-icon lucide-download"><path d="M12 15V3"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/></svg>
                    </div>
                    <div>
                      <p className="text-l font-bold">Download PDF</p>
                    </div>
                  </div>
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </AppSidebar>
  );
}

export default DMCA;
