import { useState } from "react";

function AssetCard({
  imgPath,
  title,
  description,
  createdAt,
  c2paURL,
  watermarkedURL,
  storyExplorerURL
}: {
  imgPath: string;
  title: string;
  description: string;
  createdAt: Date | string;
  c2paURL: string;
  watermarkedURL: string;
  storyExplorerURL: string;
}) {
  const [showDropdown, setShowDropdown] = useState(false);

  function formatDate(date: Date) {
    const dd = String(date.getDate()).padStart(2, "0");
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${dd}/${mm}/${yy}`;
  }

  return (
    <>
      <div className="m-2 p-5 bg-[rgb(37,38,38)] rounded-xl flex relative">

        <div className="max-w-56 max-h-56 overflow-hidden rounded-xl">
          <img
            src={imgPath || "src/assets/default_img.png"}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>

        <div className="m-2 p-2 w-md">
          <p className="text-xl font-bold p-1">{title}</p>
          <p className="text-l text-gray-400 font-semibold p-1">
            {description}
          </p>
          <p className="text-sm text-gray-400 p-1">
            Created at {formatDate(new Date(createdAt))}
          </p>

         
        </div>
         {/* Dropdown toggle */}
          <div className="relative inline-block mt-4">
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Options
            </button>

            {showDropdown && (
              <div className="absolute mt-2 w-64 bg-gray-500 rounded shadow-lg z-10 text-sm text-white">
                <a
                  href={c2paURL}
                  target="_blank"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Download C2PA Image
                </a>
                <a
                  href={watermarkedURL}
                  target="_blank"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Download Watermarked Image
                </a>
                <a
                  href={storyExplorerURL}
                  target="_blank"
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  View on Story Explorer
                </a>
              
              </div>
            )}
          </div>
      </div>
    </>
  );
}

export default AssetCard;
