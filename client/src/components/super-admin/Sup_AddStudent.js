import React, { useState } from 'react';

const Sup_AddStudent = ({ isOpen, onClose, onSave }) => {
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [department, setDepartment] = useState("INFT");
  const [year, setYear] = useState("FE");
  const [rollno, setRollno] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSaveStudent = () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Generate a random password (matching admin functionality)
    const password = Math.random().toString(36).slice(-8);

    const studentData = {
      name: studentName,
      email: email,
      phone: mobile,
      department: department,
      rollno: Number(rollno),
      role: "Student",
      password: password,
      year: year,
    };

    // Call the parent's onSave function
    onSave(studentData);
    
    // Reset form and close modal
    handleCancel();
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    onClose();
    setStudentName("");
    setEmail("");
    setMobile("");
    setDepartment("INFT");
    setYear("FE");
    setRollno("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg border w-[554px] px-6 py-6 mx-4 shadow-2xl">
        {/* Modal Header */}
        <h1 className="text-xl font-medium">Add Student</h1>
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

        {/* Action Buttons */}
        <div className="flex justify-between">
          <button 
            onClick={handleCancel} 
            className="h-10 px-6 border border-gray-400 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveStudent}
            className={`h-10 px-6 text-white rounded-lg ${isSubmitting ? "bg-gray-400" : "bg-purple-500"}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving..." : "Save Student"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sup_AddStudent;
