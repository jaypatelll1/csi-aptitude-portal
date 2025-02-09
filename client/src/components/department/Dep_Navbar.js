import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Details from "../student/home/Stu_Details";

function Dep_Navbar() {
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

    // Attach event listener to detect clicks outside the component
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="bg-white h-14 border-b border-gray-200 flex items-center">
      <div
        className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
        onClick={openDetails}
      >
        AM
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

export default Dep_Navbar;
