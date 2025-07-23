import React, { useState, useRef } from "react";

const Sup_EditStudent = ({ closeEditModal, student, onStudentUpdated, onStudentDeleted }) => {
  const [studentName, setStudentName] = useState(student.name);
  const [email, setEmail] = useState(student.email);
  const [mobile, setMobile] = useState(student.mobile || student.phone);
  const [department, setDepartment] = useState(student.branch || student.department);
  const [year, setYear] = useState(student.year || "FE");
  const [rollno, setRollno] = useState(student.rollno || "");

  const [loading, setLoading] = useState(false);
  const requestRef = useRef(false);

  const handleSaveStudent = async () => {
    if (requestRef.current) return;
    requestRef.current = true;
    setLoading(true);

    const updatedStudent = {
      ...student,
      name: studentName,
      email: email,
      mobile: mobile,
      phone: mobile,
      branch: department,
      department: department,
      rollno: Number(rollno),
      year: year,
    };

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Student updated successfully!");
      if (onStudentUpdated) {
        onStudentUpdated(updatedStudent);
      }
      closeEditModal();
    } catch (error) {
      console.error("Error updating student:", error);
      alert("Failed to update student. Please try again.");
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Student deleted successfully!");
      if (onStudentDeleted) {
        onStudentDeleted(student.id);
      }
      closeEditModal();
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Student reset mail sent successfully!");
      closeEditModal();
    } catch (error) {
      console.error("Error resetting student:", error);
      alert("Failed to reset student. Please try again.");
    } finally {
      requestRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border w-[554px] px-6 py-6 mx-4 shadow-2xl">
        <h1 className="text-xl font-medium">Edit Student</h1>
        <hr className="my-4 border-black" />

        {/* Name Field */}
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

        {/* Email Field */}
        <div id="Email" className="mb-4">
          <h1 className="mb-2">Email</h1>
          <input
            className="h-10 w-full border border-gray-300 rounded-lg pl-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* Mobile Field */}
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

        {/* Department and Year Fields */}
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

        {/* Roll Number Field */}
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

        {/* Action Buttons */}
        <div className="flex justify-between mt-7">
          <button
            onClick={handleDelete}
            disabled={loading}
            className="h-10 px-2 bg-red-200 text-[#E94A47] font-bold rounded-lg flex items-center text-center hover:bg-red-300 transition-colors"
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
            className="h-10 px-2 bg-blue-200 text-blue-700 font-bold rounded-lg flex items-center text-center hover:bg-blue-300 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
              <path d="M21 3v5h-5"/>
              <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
              <path d="M3 21v-5h5"/>
            </svg>
          </button>
          
          <div>
            <button
              onClick={closeEditModal}
              disabled={loading}
              className="h-10 px-6 border border-gray-400 rounded-lg mr-5 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveStudent}
              disabled={loading}
              className={`h-10 px-6 rounded-lg transition-colors ${
                loading 
                  ? "bg-gray-400 text-gray-600" 
                  : "bg-purple-200 text-purple-700 hover:bg-purple-300"
              }`}
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sup_EditStudent;
