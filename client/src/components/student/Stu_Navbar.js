import React, { useState, useRef, useEffect } from "react";
import Details from "../../components/NavbarDetails";

function Stu_Navbar({ hideTitle = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const detailsRef = useRef(null);

  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);
  
  useEffect(() => {
      const handleClickOutside = (event) => {
        if (detailsRef.current && !detailsRef.current.contains(event.target)) {
          closeDetails();
        }
      };
  
      // Attach event listener to detect clicks outside the component
      document.addEventListener("mousedown", handleClickOutside);
  
      // Cleanup the event listener on component unmount
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, []);

  return (
    <div >
      <div
        id="main-section"
        className={` bg-white w-full overflow-hidden transition-all duration-300 pl-0 xl:pl-64 `}
      >
        {/* Top Bar */}
        <div className=" bg-white h-14 border-b border-gray-200 flex items-center">
          {/* Burger Icon Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden text-gray-800 focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  sidebarOpen
                    ? "M6 18L18 6M6 6l12 12" // Cross icon for "close"
                    : "M4 6h16M4 12h16M4 18h16" // Burger icon for "open"
                }
              />
            </svg>
          </button>
          {!hideTitle && (
          <h1 className="text-xl font-medium text-gray-800 ml-5 sm:ml-60 xl:ml-5">
            Dashboard
          </h1>
          )}
          <div
            className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
            onClick={openDetails}
          >
            AM
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>
      </div>
    </div>
  );
}

export default Stu_Navbar;


