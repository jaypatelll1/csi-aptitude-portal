import React from "react";
import axios  from "axios";
import { Navigate, useNavigate } from "react-router-dom";

const Details = (props) => {

const navigate = useNavigate()
    const handleLogout = async() => {
    const response= await axios.post("/api/users/logout");
    // console.log('response is ', response);

    // window.location.reload();

    navigate("/");
    
      };

    // console.log(props);
    return (
        <div className="w-80 border border-gray-200 rounded-lg bg-white p-4 absolute z-50 right-5 top-12 shadow-lg  ">
            <h1 className="font-semibold text-xl text-gray-700">{props.name}</h1>
            <div className="text-sm text-gray-500 mt-3 space-y-1">
                <p>Email: {props.email}</p>
                <p>Mobile: {props.mobile}</p>
                <p>Branch: {props.branch}</p>
                <p>Year: {props.year}</p>
            </div>
            <div>
                <button className="bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500" onClick={handleLogout}>Logout</button>
            </div>
        </div>
    )
}

export default Details;