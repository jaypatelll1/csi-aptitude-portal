import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

const DataTime = ({ onCancel, onSchedule, duration }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");

  const calculateEndTime = (startDateTime) => {
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);
    return endDateTime;
  };

  const handleSchedule = () => {
    if (!selectedDate || !selectedTime) {
      alert("Please select both a date and a time!");
      return;
    }
  
    const startDateTime = new Date(selectedDate);
    const [hours, minutes] = selectedTime.split(":").map(Number);
    startDateTime.setHours(hours, minutes);
  
    const endDateTime = calculateEndTime(startDateTime);
  
    // Trigger the callback with the start and end times
    if (onSchedule) {
      onSchedule(startDateTime.toISOString(), endDateTime.toISOString());
    }
  };
  

  const handleCancel = () => {
    setSelectedDate(null);
    setSelectedTime("");

    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-auto">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Schedule Test</h2>
        <div className="flex space-x-4 mb-6">
          {/* Date Picker */}
          <div className="flex-1">
            <label className="block text-gray-600 text-sm mb-2">Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              className="w-full px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholderText="Select a date"
              dateFormat="MMMM d, yyyy"
            />
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
            Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTime;
