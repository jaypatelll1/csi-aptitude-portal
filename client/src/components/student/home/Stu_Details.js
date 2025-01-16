import React from "react";
import axios from "axios";
import { Navigate, useNavigate } from "react-router-dom";
import { clearUser } from "../../../redux/userSlice";
import { useSelector, useDispatch } from "react-redux";

const Details = () => {
  let user = useSelector((state) => state.user.user);
  console.log("user is ", user);

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    const response = await axios.post("/api/users/logout");
    dispatch(clearUser());
    navigate("/", { replace: true });
  };

  return (
    <div className="w-80 border border-gray-200 rounded-lg bg-white p-4 absolute z-50 right-5 top-12 shadow-lg">
      <h1 className="font-semibold text-xl text-gray-700">{user.name}</h1>
      <div className="text-sm text-gray-500 mt-3 space-y-1">
        <p>Email: {user.email}</p>
        <p>Mobile: {user.phone}</p>
        <p>Branch: {user.department}</p>
        <p>Year: {user.year}</p>
      </div>
      <div className="flex justify-end mt-4">
        <button
          className={`${
            user.role === "TPO"
              ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              : "bg-red-600 hover:bg-red-700 focus:ring-red-500"
          } text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2`}
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Details;
