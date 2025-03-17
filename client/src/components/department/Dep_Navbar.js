import React, { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import Details from "../NavbarDetails";

const Dep_Navbar = ({ setSidebarOpen }) => {
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

  // Function to extract initials (first letter of first and last name)
  const getInitials = (name) => {
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    const firstInitial = nameParts[0]?.charAt(0) || "";
    const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1].charAt(0) : "";
    return (firstInitial + lastInitial).toUpperCase();
  };

  return (
    <div className="bg-white h-14 border-b border-gray-200 flex items-center px-4">
      <div className="ml-auto flex items-center">
        <div
          className="h-9 w-9 rounded-full bg-blue-300 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
          onClick={openDetails}
        >
          {getInitials(userData.name)}
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
};

export default Dep_Navbar;
