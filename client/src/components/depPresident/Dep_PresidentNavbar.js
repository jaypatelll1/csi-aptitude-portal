import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Details from "../NavbarDetails";

const Dep_PresidentNavbar = ({ setSidebarOpen }) => {
  const userData = useSelector((state) => state.user.user);
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

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
 
  // useEffect(() => {
  //   setSidebarOpen((prev) => prev);
  // }, [setSidebarOpen]);

  return (
    // <div className="bg-white h-14 border-b border-gray-200 flex items-center px-4">
    //   {/* Sidebar Toggle Button */}
    //   <button
    //     className="text-gray-800 mr-4 xl:hidden"
    //     onClick={() => setSidebarOpen((prev) => !prev)}
    //   >
    <div className="bg-white h-14 border-b border-gray-200 flex items-center px-4">
      {/*  Sidebar Toggle Button - This correctly toggles sidebar state */}
      {/* <button
        className="text-gray-800 mr-4 xl:hidden"
        onClick={() => setSidebarOpen((prev) => !prev)} //  FIXED: Sidebar toggling works correctly
      > */}
        {/* <svg className="w-7 h-8"
         fill="none" 
         stroke="currentColor"
         strokeWidth={2}
         viewBox="0 0 24 24"
         xmlns="http://www.w3.org/2000/svg">
          <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M4 6h16M4 12h16M4 18h16" />
        </svg> */}
      {/* </button> */}

      <div className="ml-auto flex items-center">
        <div className="h-9 w-9 rounded-full bg-blue-300 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer" onClick={openDetails}>
          AM
        </div>
      </div>

      <div ref={detailsRef}>
        {isDetailsOpen && (
          <Details
            name={userData.name}
            email={userData.email}
            mobile={userData.phone}
            branch={userData.department}
            year={userData.year}
          />
        )}
      </div>
    </div>
  );
}

export default Dep_PresidentNavbar;
