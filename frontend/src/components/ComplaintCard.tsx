
function ComplaintCard({
  complaintImage,
  assetID,
  similarityScore,
  createdAt,
  
}: {
  complaintImage: string;
  assetID: string;
  similarityScore: number;
  createdAt: string | Date;
  link: string;
}) {
 
  function formatDate(date: Date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }

  return (
    <div className="m-2 p-5 bg-[rgb(30,30,30)] rounded-xl flex items-start relative">
      <div className="w-40 h-40 overflow-hidden rounded-xl">
        <img
          src={complaintImage || "src/assets/default_img.png"}
          alt="Complaint"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="ml-4 flex-1">
        <p className="text-white text-xl font-semibold">Asset ID: {assetID}</p>
        <p className="text-gray-400">Similarity Score: {similarityScore.toFixed(2)}</p>
        <p className="text-gray-500 text-sm mb-2">
          Created at {formatDate(new Date(createdAt))}
        </p>

      </div>
    </div>
  );
}

export default ComplaintCard;
