import React, { useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";

const Dep_AddStudent = ({ closeModal, onStudentAdded }) => {
  var API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
  const [studentName, setStudentName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [year, setYear] = useState("FE");
  const [rollno, setRollno] = useState();

  const { department: userDepartment } = useSelector((state) => state.user.user);

  // Generate a random password
  const generatePassword = () => {
    return Math.random().toString(36).slice(-8); // Generate an 8-character random string
  };

  const handleSaveStudent = async () => {
    const password = generatePassword();

    const newStudent = {
      name: `${studentName}`,
      email: `${email}`,
      phone: `${mobile}`,
      department: userDepartment,
      rollno: Number(rollno),
      role: "Student",
      password: password,
      year: `${year}`,
    };

    try {
      const response = await axios.post(`${API_BASE_URL}/api/users/register`, newStudent, {
        withCredentials: true,
      });

      alert("Student registered successfully!");
      
      // Call the callback function to update parent component's state
      if (onStudentAdded) {
        onStudentAdded(response.data || newStudent);
      }
      
      closeModal();
    } catch (error) {
      alert(error?.response?.data?.errors[0].msg);
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
            placeholder="Name"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
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
         type="text"
          maxLength="10"
          onChange={(e) => {
            const val = e.target.value;
            if (/^\d*$/.test(val)) {
              setMobile(val);
            }
          }}
        />
      </div>

      <div id="Department" className="mb-4">
        <h1 className="mb-2">Department and Year</h1>
        <div className="flex space-x-4">
          {/* Show department name instead of dropdown */}
          <div className="h-10 w-full border border-gray-300 bg-white rounded-lg pl-2 flex items-center">
            {userDepartment}
          </div>
          <select
            className="h-10 w-full border border-gray-300 bg-white rounded-lg pl-2"
            value={year}
            onChange={(e) => setYear(e.target.value)}
          >
            <option value="FE">FE</option>
            <option value="SE">SE</option>
            <option value="TE">TE</option>
            <option value="BE">BE</option>
          </select>
        </div>
      </div>
      <div id="ClassBoxes" className="mb-7">
        <h1 className="mb-2">Roll Number</h1>
       
          
          <input
            className="h-10 w-48px border border-gray-300 rounded-lg pl-2"
            placeholder="Roll Number"
            value={rollno}
            onChange={(e) => setRollno(e.target.value)}
            type="number"
          />
        
      </div>

      <div className="flex justify-between">
        <button onClick={closeModal} className="h-10 px-6 border border-gray-400 rounded-lg">
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

export default Dep_AddStudent;