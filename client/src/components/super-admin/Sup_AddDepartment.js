import React, { useState } from 'react';

const Sup_AddDepartment = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    duration: '',
    shortForm: ''
  });

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.duration || !formData.shortForm) {
      alert('Please fill in all fields');
      return;
    }
    
    onSave(formData);
    onClose();
    setFormData({ name: '', duration: '', shortForm: '' });
  };

  const handleCancel = () => {
    onClose();
    setFormData({ name: '', duration: '', shortForm: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Modal Header */}
        <h3 className="text-lg font-medium text-gray-900 mb-6">Adding Department</h3>
        
        {/* Form Fields */}
        <div className="space-y-4">
          {/* Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Department Name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Duration Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration (in years)
            </label>
            <input
              type="number"
              name="duration"
              placeholder="4"
              value={formData.duration}
              onChange={handleInputChange}
              min="1"
              max="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Short Form Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Short Form
            </label>
            <input
              type="text"
              name="shortForm"
              placeholder="EXTC"
              value={formData.shortForm}
              onChange={handleInputChange}
              maxLength="10"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
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
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sup_AddDepartment;
