import React from "react";

const Details = (props) => {
    console.log(props);
    return (
        <div className="w-80 border border-gray-200 rounded-lg bg-white p-4 absolute z-50 right-5 top-12 shadow-lg">
            <h1 className="font-semibold text-xl text-gray-700">{props.name}</h1>
            <div className="text-sm text-gray-500 mt-3 space-y-1">
                <p>Email: {props.email}</p>
                <p>Mobile: {props.mobile}</p>
                <p>Branch: {props.branch}</p>
            </div>
        </div>
    )
}

export default Details;