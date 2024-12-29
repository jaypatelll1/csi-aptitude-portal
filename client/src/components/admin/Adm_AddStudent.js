import React, { useState } from "react";
import axios from "axios";

const AddStudent = ({ closeModal }) => {
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [mobile, setMobile] = useState("");
    const [department, setDepartment] = useState("INFT");

    // Generate a random password
    const generatePassword = () => {
        return Math.random().toString(36).slice(-8); // Generate an 8-character random string
    };

    // Constant roll number
    const rollNumber = "123456";

    const handleSaveStudent = async () => {
        const password = generatePassword();

        const newStudent = {
            name: `${firstName} ${lastName}`,
            email,
            //mobile,
            department,
            rollno: rollNumber,
            role: "Student",
            password,
            year: "BE",
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
            </div>

            <div className="flex justify-between">
                <button
                    onClick={closeModal}
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

export default AddStudent;
