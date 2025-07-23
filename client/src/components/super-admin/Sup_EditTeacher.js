import React, { useState, useRef } from "react";

const Sup_EditTeacher = ({ closeEditModal, teacher, onTeacherUpdated, onTeacherDeleted }) => {
  const [firstName, setFirstName] = useState(teacher.name.split(' ')[0] || '');
  const [lastName, setLastName] = useState(teacher.name.split(' ').slice(1).join(' ') || '');
  const [email, setEmail] = useState(teacher.email);
  const [mobile, setMobile] = useState(teacher.mobile);
  const [branch, setBranch] = useState(teacher.branch);

  const [loading, setLoading] = useState(false);
  const requestRef = useRef(false);

  const handleSaveTeacher = async () => {
    if (requestRef.current) return;
    requestRef.current = true;
    setLoading(true);

    const updatedTeacher = {
      ...teacher,
      name: `${firstName} ${lastName}`.trim(),
      email: email,
      mobile: mobile,
      branch: branch
    };

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Teacher updated successfully!");
      if (onTeacherUpdated) {
        onTeacherUpdated(updatedTeacher);
      }
      closeEditModal();
    } catch (error) {
      console.error("Error updating teacher:", error);
      alert("Failed to update teacher. Please try again.");
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
      
      alert("Teacher deleted successfully!");
      if (onTeacherDeleted) {
        onTeacherDeleted(teacher.id);
      }
      closeEditModal();
    } catch (error) {
      console.error("Error deleting teacher:", error);
      alert("Failed to delete teacher. Please try again.");
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
      
      alert("Teacher reset mail sent successfully!");
      closeEditModal();
    } catch (error) {
      console.error("Error resetting teacher:", error);
      alert("Failed to reset teacher. Please try again.");
    } finally {
      requestRef.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Modal Header */}
        <h3 className="text-lg font-medium text-gray-900 mb-1">Edit Teacher</h3>
        <hr className="border-gray-300 mb-6" />

        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name Fields */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              placeholder="forexample@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Mobile Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mobile No.
            </label>
            <input
              type="tel"
              placeholder="9930XXXXXX"
              value={mobile}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val) && val.length <= 10) {
                  setMobile(val);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>

          {/* Branch Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Branch
            </label>
            <select
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
            >
              <option value="INFT">INFT</option>
              <option value="CMPN">CMPN</option>
              <option value="EXTC">EXTC</option>
              <option value="ELEC">ELEC</option>
              <option value="Elec">Elec</option>
            </select>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between mt-6">
          <div className="flex gap-2">
            <button 
              onClick={handleDelete}
              disabled={loading}
              className="p-2 border border-red-300 rounded-md hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              onClick={handleReset}
              disabled={loading}
              className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={closeEditModal}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveTeacher}
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                loading 
                  ? "bg-gray-400" 
                  : "bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
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

export default Sup_EditTeacher;
