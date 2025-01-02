import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

const DataTime = ({ onCancel }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both date and time!");
      return;
    }
    alert(`Test scheduled on ${selectedDate.toLocaleDateString()} at ${selectedTime}`);
  };

  const handleCancel = () => {
    setSelectedDate(null);
    setSelectedTime("");

    // Trigger the onCancel callback if provided
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-auto bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Schedule Test</h2>
        <div className="flex space-x-4 mb-6">
          {/* Custom Styled Date Picker */}
          <div className="flex-1 relative">
            <label className="block text-gray-600 text-sm mb-2">Date</label>
            <div className="relative">
              <DatePicker
                selected={selectedDate}
                onChange={(date) => setSelectedDate(date)}
                className="w-full px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                calendarClassName="absolute z-10 mt-1 rounded-lg shadow-lg border bg-white"
                dateFormat="MMMM d, yyyy"
                placeholderText="Select date"
              />
            </div>
          </div>
          {/* Time Input */}
          <div className="flex-1">
            <label className="block text-gray-600 text-sm mb-2">Time</label>
            <input
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <button
            onClick={handleCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleSchedule}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Schedule Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTime;
