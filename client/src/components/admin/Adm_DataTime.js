import React, { useState } from "react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";

const DataTime = ({ onCancel, onSchedule, duration = 60 }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [feedback, setFeedback] = useState("");

  const handleSchedule = () => {
    setFeedback("");
  
    if (!selectedDate || !/^\d{2}:\d{2}$/.test(selectedTime)) {
      setFeedback("Please select a valid date and time!");
      return;
    }
  
    const [hours, minutes] = selectedTime.split(":").map(Number);
  
    // Combine selectedDate and time without offset
    const startDateTime = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      hours,
      minutes,
      0,
      0
    );
  
    // Manually adjust for the 6:30 hours discrepancy
    startDateTime.setHours(startDateTime.getHours() - 6);
    startDateTime.setMinutes(startDateTime.getMinutes() - 30);
  
    const endDateTime = new Date(startDateTime);
    endDateTime.setMinutes(endDateTime.getMinutes() + duration);
  
    if (onSchedule) {
      onSchedule(startDateTime.toISOString(), endDateTime.toISOString());
      setFeedback(
        `Test scheduled successfully!\nStart: ${formatDateTime(
          startDateTime
        )}\nEnd: ${formatDateTime(endDateTime)}`
      );
    }
  
    resetInputs();
  };
  
  const formatDateTime = (date) =>
    date.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const resetInputs = () => {
    setSelectedDate(null);
    setSelectedTime("");
    setFeedback("");
  };

  const handleCancel = () => {
    resetInputs();
    if (onCancel) onCancel();
  };

  return (
    <div className="absolute z-50 items-center justify-center ">
      <div className="bg-white p-3 rounded-lg shadow-md w-96">
        <h2 className="text-xl font-bold text-gray-800 mb-6">Schedule Test</h2>
        <div className="flex space-x-4 mb-6">
          {/* Date Picker */}
          <div className="flex-1">
            <label
              htmlFor="date-picker"
              className="block text-gray-600 text-sm mb-2"
            >
              Date
            </label>
            <DatePicker
              id="date-picker"
              selected={selectedDate}
              onChange={setSelectedDate}
              className="w-full px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholderText="Select a date"
              dateFormat="MMMM d, yyyy"
            />
          </div>
          {/* Time Input */}
          <div className="flex-1">
            <label
              htmlFor="time-input"
              className="block text-gray-600 text-sm mb-2"
            >
              Time
            </label>
            <input
              id="time-input"
              type="time"
              value={selectedTime}
              onChange={(e) => setSelectedTime(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>
        {feedback && (
          <div className="text-sm text-red-500 mb-4">{feedback}</div>
        )}
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
