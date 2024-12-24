import React from "react";

const AddStudent = ({closeModal}) => {
    return(
        <div className="bg-white rounded-lg border w-[554px] px-6 py-6 mb-10 ml-10">
            <h1 className="text-xl font-medium">Add Student</h1>
            <hr className="my-4 border-black" />
            
            <div id="NameBoxes" className="mb-4">
                <h1 className="mb-2">First Name</h1>
                <div className="flex space-x-4">
                    <input className="h-10 w-full border border-gray-300 rounded-lg pl-2" placeholder="First Name" />
                    <input className="h-10 w-full border border-gray-300 rounded-lg pl-2" placeholder="Last Name" />  
                </div>
            </div>

            <div id="Email" className="mb-4">
                <h1 className="mb-2">Email</h1>
                <input className="h-10 w-full border border-gray-300 rounded-lg pl-2" placeholder="Email" />
            </div>

            <div id="MobileNo" className="mb-4">
                <h1 className="mb-2">Mobile No.</h1>
                <input className="h-10 w-full border border-gray-300 rounded-lg pl-2" placeholder="Mobile Number" />
            </div>

            <div id="Department" className="mb-4">
                <h1 className="mb-2">Department</h1>
                <select className="h-10 w-full border border-gray-300 bg-white rounded-lg pl-2">
                    <option value="INFT">INFT</option>
                    <option value="CMPN">CMPN</option>
                    <option value="ECS">ECS</option>
                    <option value="EXTC">EXTC</option>
                    <option value="ELEC">ELEC</option>
                </select>
            </div>  
            <div className="flex justify-between">
                <button onClick={closeModal} className="h-10 px-6 border border-gray-400 rounded-lg">Cancel</button>
                <button className="h-10 px-6 bg-purple-200 text-purple-700 rounded-lg">Save Student</button>
            </div>  
        </div>
    );
};

export default AddStudent;
