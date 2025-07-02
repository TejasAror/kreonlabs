import { ConnectButton } from "@tomo-inc/tomo-evm-kit";
import type { ReactNode } from "react";
import { Link } from "react-router";

export default function AppSidebar({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-5">
      <div className=" float-left h-svh overflow-hidden border-b-gray-900 border-1 col-span-1">
        <div>
          <div className="w-full p-2 border-b-1">
            <p className="text-2xl pb-3 pt-5 font-bold flex justify-center">
              <img
                src="/logo.png"
                alt="Kreon Logo"
                width={150}
                height="auto"
              />
            </p>
          </div>

          <div className="p-4 flex justify-center border-b-1">
            <Link to="/register-asset">
              <div className="flex p-5 bg-[#637AFA] text-white rounded-md hover:cursor-pointer">
                <div className="pr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-plus-icon lucide-plus"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                </div>
                <div>
                  <p className="text-l font-bold inline-block align-middle">
                    Register an IP
                  </p>
                </div>
              </div>
            </Link>
          </div>


          <div className="p-5 border-b-1">
            {/* Menu Buttons */}
            <Link to="/dashboard">
            
              <div className="flex p-5 hover:text-[#637AFA] hover:bg-[#1D1F26] rounded-md">
                <div className="pr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-layout-dashboard-icon lucide-layout-dashboard"
                  >
                    <rect width="7" height="9" x="3" y="3" rx="1" />
                    <rect width="7" height="5" x="14" y="3" rx="1" />
                    <rect width="7" height="9" x="14" y="12" rx="1" />
                    <rect width="7" height="5" x="3" y="16" rx="1" />
                  </svg>
                </div>
                <div>
                  <p className="text-l font-bold inline-block align-middle">
                    Dashboard
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/dashboard">
            
              <div className="flex p-5 hover:text-[#637AFA] hover:bg-[#1D1F26] rounded-md">
                <div className="pr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-image-icon lucide-image"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <div>
                  <p className="text-l font-bold inline-block align-middle">
                    Assets
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/scanners">
              <div className="flex p-5 hover:text-[#637AFA] hover:bg-[#1D1F26] rounded-md">
                <div className="pr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-shield-alert-icon lucide-shield-alert"
                  >
                    <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-l font-bold inline-block align-middle">
                    Scanner
                  </p>
                </div>
              </div>
            </Link>

            <Link to="/watermarking">
            
              <div className="flex p-5 hover:text-[#637AFA] hover:bg-[#1D1F26] rounded-md">
                <div className="pr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-scan-eye-icon lucide-scan-eye"
                  >
                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                    <circle cx="12" cy="12" r="1" />
                    <path d="M18.944 12.33a1 1 0 0 0 0-.66 7.5 7.5 0 0 0-13.888 0 1 1 0 0 0 0 .66 7.5 7.5 0 0 0 13.888 0" />
                  </svg>
                </div>
                <div>
                  <p className="text-l font-bold inline-block align-middle">
                    Watermarking
                  </p>
                </div>
              </div>
            </Link>


            <Link to="/c2pa">
            
              <div className="flex p-5 hover:text-[#637AFA] hover:bg-[#1D1F26] rounded-md">
                <div className="pr-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-aperture-icon lucide-aperture"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="m14.31 8 5.74 9.94" />
                    <path d="M9.69 8h11.48" />
                    <path d="m7.38 12 5.74-9.94" />
                    <path d="M9.69 16 3.95 6.06" />
                    <path d="M14.31 16H2.83" />
                    <path d="m16.62 12-5.74 9.94" />
                  </svg>
                </div>
                <div>
                  <p className="text-l font-bold inline-block align-middle">
                    C2PA
                  </p>
                </div>
              </div>
            </Link>

            <div className="flex p-5 hover:text-[#637AFA] hover:bg-[#1D1F26] rounded-md">
              <div className="pr-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-settings2-icon lucide-settings-2"
                >
                  <path d="M20 7h-9" />
                  <path d="M14 17H5" />
                  <circle cx="17" cy="17" r="3" />
                  <circle cx="7" cy="7" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-l font-bold inline-block align-middle">
                  Settings
                </p>
              </div>
            </div>
          </div>

          <div className="border-b-1">
            <div className="pt-5 pb-5 flex justify-center-safe">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-4">{children}</div>
    </div>
  );
}
