import React, { useState } from "react";
import axios from "axios";

const EditStudent = ({ closeEditModal , student
}) => {
    
    const getStudent = async () => {
        try {
            
        } catch (error) {
            console.error("Error fetching student data:", error);
        }
    }
    
    
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [department, setDepartment] = useState('INFT');
    const [year, setYear] = useState('FE');
    const [rollno, setRollno] = useState();
    const [claass, setClaass] = useState("");



    const handleSaveStudent = async () => {
        const password = generatePassword();

        const newStudent = {
            name: `${firstName} ${lastName}`,
            email: `${email}`,
            phone: `${mobile}`,
            department: `${department}`,
            rollno: Number(rollno),
            role: "Student",
            year: `${year}`,
        };

        try {
            const response = await axios.post("/api/users/register", newStudent);
            console.log("Student registered successfully:", response.data);
            alert("Student registered successfully!");
            closeModal(); // Close modal after successful registration
        } catch (error) {
            console.error("Error registering student:", error);
            alert("Failed to register student. Please try again.");
        }
    };
    return (
        <div className="bg-white rounded-lg border w-[554px] px-6 py-6 mb-10 ml-10">
            <h1 className="text-xl font-medium">Add Student</h1>
            <hr className="my-4 border-black" />

            <div id="NameBoxes" className="mb-4">
                <h1 className="mb-2">Name</h1>
                <div className="flex space-x-4">
                    <input
                        className="h-10 w-full border border-gray-300 rounded-lg pl-2"
                        placeholder="First Name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                    <input
                        className="h-10 w-full border border-gray-300 rounded-lg pl-2"
                        placeholder="Last Name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
            </div>

            <div id="Email" className="mb-4">
                <h1 className="mb-2">Email</h1>
                <input
                    className="h-10 w-full border border-gray-300 rounded-lg pl-2"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </div>

            <div id="MobileNo" className="mb-4">
                <h1 className="mb-2">Mobile No.</h1>
                <input
                    className="h-10 w-full border border-gray-300 rounded-lg pl-2"
                    placeholder="Mobile Number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                />
            </div>

            <div id="Department" className="mb-4">
                <h1 className="mb-2">Department</h1>
                <div className="flex space-x-4">
                    <select
                        className="h-10 w-full border border-gray-300 bg-white rounded-lg pl-2"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                    >
                        <option value="INFT">INFT</option>
                        <option value="CMPN">CMPN</option>
                        <option value="ECS">ECS</option>
                        <option value="EXTC">EXTC</option>
                        <option value="ELEC">ELEC</option>
                    </select>
                    <select
                        className="h-10 w-full border border-gray-300 bg-white rounded-lg pl-2"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                    >
                        <option value="FE">FE</option>
                        <option value="BE">BE</option>
                        <option value="TE">TE</option>
                        <option value="BE">BE</option>
                    </select>
                </div>
            </div>
            <div id="ClassBoxes" className="mb-7">
                <h1 className="mb-2">Class and Roll Number</h1>
                <div className="flex space-x-4">
                    <input
                        className="h-10 w-full border border-gray-300 rounded-lg pl-2"
                        placeholder="Class"
                        value={claass}
                        onChange={(e) => setClaass(e.target.value)}

                    />
                    <input
                        className="h-10 w-full border border-gray-300 rounded-lg pl-2"
                        placeholder="Roll Number"
                        value={rollno}
                        onChange={(e) => setRollno(e.target.value)}
                        type="number"
                    />
                </div>
            </div>


            <div className="flex justify-between">
                <button
                    onClick={closeEditModal}
                    className="h-10 px-6 border border-gray-400 rounded-lg"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSaveStudent}
                    className="h-10 px-6 bg-purple-200 text-purple-700 rounded-lg"
                >
                    Save Student
                </button>
            </div>
        </div>
    );
};

export default EditStudent;
