import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import AppNavbar from '@/components/AppNavbar';
import AppSidebar from '@/components/AppSideBar';
import LoadingScreen from '@/components/LoadingScreen';

async function embedAsset(publicURL: string, assetID: string, setLoading: Function, setData: Function){
    const backendURL = import.meta.env.VITE_WATERMARKING_URL;

    try{
        const response = await axios.post(`${backendURL}/watermark`, {
            "image_url": publicURL,
            "text": assetID,
            "redundancy_percent": 50,
            "Q": 85,
            "margin_blocks": 0
        })

        if(response.data.success){
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

function EmbedWatermark() {

  const [data, setData] = useState();
  const [isLoading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (location.state == null) {
      navigate("/dashboard/");
    }
  }, [location, navigate]);
  
  
  const { publicURL, assetID, ext, fileType, manifest } = location.state;

  useEffect(() => {
    embedAsset(publicURL, assetID, setLoading,setData);
  }, []);

  const navigateToNextPage= () => {

    const {watermarked_url, hash, w_phash, w_phash_vector} = data as any;
    console.log(data);
    navigate("/add-c2pa/", {
        state: {
          publicURL, 
          assetID, 
          ext, 
          fileType,
          manifest,
          watermarkedURL: watermarked_url,
          hash,
          phash: w_phash,
          w_phash_vector
        }})
  };
  

  return (
    <AppSidebar>
      <AppNavbar title="Embed Watermark" />
      <div className='flex justify-center m-5'>
        <div className='w-full max-w-screen-lg'>

            {isLoading ? <LoadingScreen text="Embedding watermark into your asset..."/> : (
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
                    Successfully embeded watermark!
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
                      <p className="text-l font-bold">Embedd C2PA</p>
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

export default EmbedWatermark;
