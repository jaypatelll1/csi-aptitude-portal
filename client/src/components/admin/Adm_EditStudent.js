import React, { useState, useRef } from "react";
import axios from "axios";
// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Adm_EditStudent = ({ closeEditModal, student, counter ,onStudentUpdated, onStudentDeleted }) => {
  
  const studentname = student.name.split(" ")[0];


  const user_id = student.user_id;

  const [studentName, setStudentName] = useState(student.name);
  
  const [email, setEmail] = useState(student.email);
  const [mobile, setMobile] = useState(student.phone);
  const [department, setDepartment] = useState(student.department);
  const [year, setYear] = useState(student.year);
  const [rollno, setRollno] = useState(student.rollno);

  const [loading, setLoading] = useState(false); // Disable buttons during request
  const requestRef = useRef(false);

  const handleSaveStudent = async () => {
    if (requestRef.current) return; // Prevent multiple clicks
    requestRef.current = true;
    setLoading(true);

    const newStudent = {
      name: `${studentName} `,
      email: `${email}`,
      phone: `${mobile}`,
      department: `${department}`,
      rollno: Number(rollno),
      role: "Student",
      year: `${year}`,
    };

    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      await axios.put(`${API_BASE_URL}/api/users/update/${student.user_id}`, newStudent, {
        withCredentials: true, // Make sure the cookie is sent with the request
      });

      alert("Student updated successfully!");
      if (onStudentUpdated) {
        onStudentUpdated({ ...student, ...newStudent });
      }
      closeEditModal(); // Close modal after successful registration
    } catch (error) {
      console.error("Error registering student:", error);
      alert("Failed to register student. Please try again.");
    } finally {
      requestRef.current = false;
      setLoading(false);
    }
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (requestRef.current) return;
    requestRef.current = true;
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      await axios.delete(`${API_BASE_URL}/api/users/delete/${student.user_id}`, {
        withCredentials: true, // Make sure the cookie is sent with the request
      });

      alert("Student deleted successfully!");
      counter();
      if (onStudentDeleted) {
        onStudentDeleted(student.user_id);
      }
      closeEditModal(); // Close modal after successful registration
    } catch (error) {
      console.error("Error deleting student:", error);
      alert("Failed to delete student. Please try again.");
    } finally {
      requestRef.current = false;
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.stopPropagation();
    if (requestRef.current) return;
    requestRef.current = true;
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      await axios.post(
        `${API_BASE_URL}/api/users/send-reset-mail`,
        { student },
        {
          withCredentials: true, // Make sure the cookie is sent with the request
        }
      );

      alert("Student reset mail sent successfully!");
      closeEditModal(); // Close modal after successful registration
    } catch (error) {
      console.error("Error resetting student:", error);
      alert("Failed to reset student. Please try again.");
    } finally {
      requestRef.current = false;
      setLoading(false);
    }
  };
  return (
    <div className="bg-white rounded-lg border w-[554px] px-6 py-6 mb-10 ml-10">
      <h1 className="text-xl font-medium">Edit Student</h1>
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
            <option value="SE">SE</option>
            <option value="TE">TE</option>
            <option value="BE">BE</option>
          </select>
        </div>
      </div>
      <div id="ClassBoxes" className="mb-7">
        <h1 className="mb-2">Roll Number</h1>
        <div className="flex space-x-4">
          
          <input
            className="h-10 w-48px border border-gray-300 rounded-lg pl-2"
            placeholder="Roll Number"
            value={rollno}
            onChange={(e) => setRollno(e.target.value)}
            type="number"
          />
        </div>
      </div>

      <hr className="my-4 border-black" />
      <div className="flex justify-between mt-7">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="h-10 px-2 bg-red-200 text-[#E94A47] font-bold rounded-lg flex items-center text-center"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
              fill="#E94A47"
            />
          </svg>
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="h-10 px-2 bg-blue-200 text-blue-700 font-bold rounded-lg flex items-center text-center"
        >
          <img src="/reset.svg" alt="Reset" className="w-6 h-6" />
        </button>
        <div>
          <button
            onClick={closeEditModal}
            className="h-10 px-6 border border-gray-400 rounded-lg mr-5"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveStudent}
            className="h-10 px-6 bg-purple-200 text-purple-700 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Adm_EditStudent;
