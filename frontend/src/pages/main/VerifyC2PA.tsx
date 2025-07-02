import axios from 'axios';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from "react-router-dom";

import AppNavbar from '@/components/AppNavbar';
import AppSidebar from '@/components/AppSideBar';
import C2PAViewer from '@/components/C2PAViewer';
import LoadingScreen from '@/components/LoadingScreen';

function VerifyC2PA() {
  const [data, setData] = useState({});
  const [isLoading, setLoading] = useState(true);

  const location = useLocation();
  const navigate = useNavigate();

  const backendURL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    if (location.state == null) {
      navigate("/dashboard/");
    }
  }, [location, navigate]);
  
  const { publicURL, assetID, ext, fileType } = location.state;

  useEffect(() => {
    if (!location.state) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(`${backendURL}/verify-c2pa/`, {
          params: { publicURL, assetID, ext, fileType },
        });

        console.log(response.data)
        setData(response.data);
      } catch (error) {
        console.error("C2PA verification error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location]);

  const navigateToNextPage = () => {

      navigate("/embed-watermark/", {
        state: {
          publicURL, 
          assetID, 
          ext, 
          fileType,
          manifest: data || ""
        }})
  };


  return (
    <AppSidebar>
      <AppNavbar title="Verify C2PA" />
      <div className='flex justify-center m-5'>
        <div className='w-full max-w-screen-lg'>

          {isLoading ? (
            <LoadingScreen text={"Checking C2PA metadata..."}/>
          ) : (
            JSON.stringify(data) === "{}" ? (
              <>
                <div className='flex justify-center mb-10'>
                  <p className='text-3xl font-bold text-red-500'>
                    No C2PA Manifest found.
                  </p>
                </div>
                <div className="w-full flex justify-center overflow-hidden">
                    <img
                      src={location.state?.publicURL}
                      alt="Uploaded asset"
                      className="object-cover max-w-[400px] h-[300px] border rounded-lg shadow-md"
                    />
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
                      <p className="text-l font-bold">Protect your Asset</p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div>
                <div className='flex justify-center mb-10'>
                  <p className='text-3xl text-green-500 font-bold'>
                    Active C2PA Manifest found!
                  </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-6 items-start justify-center">
                  <div>
                    <div className="w-full max-w-[400px] h-[300px] border rounded-lg overflow-hidden shadow-md">
                      <img
                        src={location.state?.publicURL}
                        alt="Uploaded asset"
                        className="object-cover w-full h-full"
                      />
                    </div>
                                    <div className='mt-15 flex justify-center'>
                  <div className="flex p-5 bg-[#637AFA] text-white rounded-md hover:cursor-pointer" onClick={navigateToNextPage}>
                    <div className="pr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="lucide lucide-shield-check-icon lucide-shield-check" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-l font-bold">Protect your Asset</p>
                    </div>
                  </div>
                </div>
                  </div>

                  <div className="flex-1 min-w-[300px]">
                    <C2PAViewer manifest={data} />
                  </div>
                  
                </div>
              </div>
            )
          )}

        </div>
      </div>
    </AppSidebar>
  );
}

export default VerifyC2PA;
