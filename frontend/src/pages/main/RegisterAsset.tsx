import { useState, useRef } from "react";
import { Toaster, toast } from 'react-hot-toast';
import { v4 as uuidv4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js';

import AppNavbar from '@/components/AppNavbar';
import AppSidebar from '@/components/AppSideBar';
import LoadingScreen from "@/components/LoadingScreen";

const ALLOWED_TYPES = ['image/jpg', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_WIDTH = 2000;
const MAX_HEIGHT = 2000;

const uuid = uuidv4();

function RegisterAsset() {
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSetFile = (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error('Invalid file type. Only JPG, JPEG, PNG allowed.', {
        style: { borderRadius: '4px', background: '#1D1F26', color: '#fff' },
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Max 2MB allowed.', {
        style: { borderRadius: '4px', background: '#1D1F26', color: '#fff' },
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        if (img.width > MAX_WIDTH || img.height > MAX_HEIGHT) {
          toast.error(`Image too large. Max 2000x2000px. Got ${img.width}x${img.height}px`, {
            style: { borderRadius: '4px', background: '#1D1F26', color: '#fff' },
          });
          return;
        }
        setFile(file);
      };
      img.onerror = () => {
        toast.error('Could not read image dimensions.', {
          style: { borderRadius: '4px', background: '#1D1F26', color: '#fff' },
        });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const changeFilename = (file: File) => {
    const fileSplit = file.name.split('.');
    const ext = fileSplit[fileSplit.length - 1];
    const fileType = file.type;
    const newName = `${uuid}.${ext}`;

    const renamedFile = new File([file], newName, {
      type: fileType,
      lastModified: file.lastModified,
    });

    return { renamedFile, ext, fileType };
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);

    const { renamedFile, ext, fileType } = changeFilename(file);
    setFile(renamedFile);

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
      const { error } = await supabase.storage
        .from('uploads')
        .upload(`uploads/${uuid}.${ext}`, renamedFile);

      if (error) {
        console.error('Upload failed:', error.message);
        toast.error('Upload failed: ' + error.message, {
          style: { borderRadius: '4px', background: '#1D1F26', color: '#fff' },
        });
        setIsLoading(false);
        return;
      }

      toast.success('Upload successful!', {
        style: { borderRadius: '4px', background: '#1D1F26', color: '#fff' },
      });

      const { data: publicData } = await supabase
        .storage
        .from('uploads')
        .getPublicUrl(`uploads/${uuid}.${ext}`);

      navigate("/verify-c2pa/", {
        state: {
          publicURL: publicData.publicUrl,
          assetID: uuid,
          ext: ext,
          fileType: fileType
        }
      });

    } catch (err) {
      console.error("Upload error:", err);
      toast.error('Unexpected upload error.', {
        style: { borderRadius: '4px', background: '#1D1F26', color: '#fff' },
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="bottom-right" />
      <AppSidebar>
        <AppNavbar title="Register an IP" />
        {isLoading ? <LoadingScreen text={"Loading..."} /> : (
          <div className='flex justify-center m-5'>
            <div>
              <div className='flex justify-center'>
                <p className='text-2xl font-bold'>Upload your asset</p>
              </div>
              <br />
              <div className='flex justify-center'>
                <p className='text-md text-gray-400 font-semibold'>Upload your asset to register it on the Story Protocol</p>
              </div>

              <div className="w-full max-w-md mx-auto mt-10">
                <div
                  onClick={handleClick}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  className="border-2 border-dashed border-gray-400 p-15 text-center rounded-lg cursor-pointer transition hover:border-blue-500 bg-white dark:bg-gray-800"
                >
                  <input
                    type="file"
                    ref={inputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <p className="text-gray-500">
                    Drag & drop your file here, or <span className="text-blue-500 underline">click</span> to select
                  </p>
                </div>

                {file && (
                  <div className="mt-4 text-sm text-gray-700 dark:text-gray-300">
                    <strong>Selected file:</strong> {file.name}
                  </div>
                )}

                <div className="flex justify-center p-10">
                  <button
                    onClick={handleUpload}
                    disabled={!file}
                    className="mt-4 px-4 py-2"
                  >
                    <div className="flex p-5 bg-[#637AFA] text-white rounded-md hover:cursor-pointer">
                      <div className="pr-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                          viewBox="0 0 24 24" fill="none" stroke="currentColor"
                          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                          className="lucide lucide-arrow-up-from-line">
                          <path d="m18 9-6-6-6 6" />
                          <path d="M12 3v14" />
                          <path d="M5 21h14" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-l font-bold inline-block align-middle">
                          Upload Asset
                        </p>
                      </div>
                    </div>
                  </button>
                </div>

              </div>
            </div>
          </div>
        )}
      </AppSidebar>
    </>
  );
}

export default RegisterAsset;
