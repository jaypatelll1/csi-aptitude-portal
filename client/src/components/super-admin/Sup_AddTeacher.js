import React, { useState } from 'react';

const Sup_AddTeacher = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    branch: 'INFT'
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
    setFormData({ firstName: '', lastName: '', email: '', mobile: '', branch: 'INFT' });
  };

  const handleCancel = () => {
    onClose();
    setFormData({ firstName: '', lastName: '', email: '', mobile: '', branch: 'INFT' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Modal Header */}
        <h3 className="text-lg font-medium text-gray-900 mb-1">Adding Teacher</h3>
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
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleInputChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleInputChange}
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
              name="email"
              placeholder="forexample@gmail.com"
              value={formData.email}
              onChange={handleInputChange}
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
              name="mobile"
              placeholder="9930XXXXXX"
              value={formData.mobile}
              onChange={(e) => {
                const val = e.target.value;
                if (/^\d*$/.test(val) && val.length <= 10) {
                  setFormData({
                    ...formData,
                    mobile: val
                  });
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
              name="branch"
              value={formData.branch}
              onChange={handleInputChange}
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
            <button className="p-2 border border-red-300 rounded-md hover:bg-red-50 transition-colors">
              <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors">
              <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sup_AddTeacher;
