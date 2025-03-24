import React, { useState } from "react";
import axios from "axios";
import DataTime from "./Adm_DataTime";
// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Adm_ScheduledTestCard = ({ test }) => {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledTime, setScheduledTime] = useState({ start: "", end: "" });
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSchedulingLoading, setIsSchedulingLoading] = useState(false);

  const examId = test.exam_id;

  const handlePublishClick = async (test) => {
    if (isPublishing) return; // Prevent multiple requests
    setIsPublishing(true);

    const start = new Date(Date.now());
    const start_time = String(start).split(" ")[4];
    const [hours, minutes] = start_time.split(":").map(Number);
    // console.log(hours, minutes, typeof hours);
    const startDateTime = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
      hours,
      minutes,
      0,
      0
    );

    const duration = parseInt(test.duration.split(" ")[0]);

    const end = new Date(startDateTime.getTime() + duration * 60000 + 30 * 60000).toISOString();
    const endDateTime = new Date(end);
    handleSchedule(startDateTime.toISOString(), endDateTime.toISOString());

    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      await axios.put(
        `${API_BASE_URL}/api/exams/live-exam/${test.exam_id}`,
        {},
        { withCredentials: true }
      );

      window.location.reload();
    } catch (error) {
      console.error("Error during POST request:", error);
    }
  };

  const handleSchedule = (start, end) => {
    if (isSchedulingLoading) return; // Prevent multiple requests
    setIsSchedulingLoading(true);
    setScheduledTime({ start, end });
    const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    axios
      .put(
        `${API_BASE_URL}/api/exams/publish/${examId}`,
        {
          start_time: start,
          end_time: end,
        },
        { withCredentials: true }
      )
      .then(() => {
        setIsScheduling(false);
      })
      .catch((err) => alert(`Error scheduling test: ${err.response?.data?.message || err.message}`))
      .finally(() => {
        setIsSchedulingLoading(false); // Re-enable the scheduling
      });
  };

  const handleCancel = () => {
    setIsScheduling(false);
  };

  return (
    <div className="bg-white rounded-lg w-[96%] p-4 ml-4 border border-gray-400 flex flex-col">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="flex items-center bg-gray-100 text-gray-900 border border-gray-700 opacity-90 text-sm px-2 py-1 rounded space-x-2">
          {/* SVG Icon */}
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.29398 3.33294L12.668 6.70627L6.04265 13.3329C5.8579 13.5177 5.62809 13.651 5.37598 13.7196L1.96598 14.6496C1.88098 14.6727 1.79139 14.6729 1.70628 14.6502C1.62117 14.6275 1.54357 14.5827 1.48132 14.5204C1.41907 14.4581 1.37439 14.3804 1.35179 14.2953C1.3292 14.2102 1.3295 14.1206 1.35265 14.0356L2.28198 10.6249C2.35072 10.3731 2.484 10.1435 2.66865 9.95894L9.29398 3.33294ZM4.35132 7.33294L3.35132 8.33294H1.83398C1.70138 8.33294 1.5742 8.28026 1.48043 8.18649C1.38666 8.09272 1.33398 7.96555 1.33398 7.83294C1.33398 7.70033 1.38666 7.57315 1.48043 7.47938C1.5742 7.38562 1.70138 7.33294 1.83398 7.33294H4.35132Z"
              fill="#797979"
            />
          </svg>
          <span>Schedule test</span>
        </span>

        <div className="text-right">
          <div className="flex flex-col items-center">
            <span className="text-gray-500 text-sm">Scheduled for: {test.date}</span>
            <span className="text-gray-500 text-xs">
              Branch: {test.target_years?.replace(/[{}]/g, "")} -{" "}
              {test.target_branches?.replace(/[{}]/g, "")}
            </span>
          </div>
        </div>
      </div>

      {/* Test Info */}
      <h2 className="text-lg font-bold text-gray-900">{test.title}</h2>
      <div className="text-gray-600 text-sm mt-4">
        <p className="mb-2 font-bold flex items-center">
          <h4>Number of Questions: {test ? test.questions : "Loading..."}</h4>
        </p>
        <p className="font-bold flex items-center">{test.duration}</p>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap justify-end space-x-2 mt-4">
        <button
          onClick={() => setIsScheduling(true)}
          className={`bg-gray-200 text-gray-900 px-3 py-1.5 text-sm rounded hover:bg-gray-300 border border-gray-700 opacity-90 hover:opacity-100 transition-all duration-200 ${isSchedulingLoading ? "cursor-not-allowed" : ""}`}
          disabled={isSchedulingLoading}
        >
          Edit Schedule
        </button>

        <button
          className={`text-[#1aab07] px-3 py-1.5 text-sm rounded hover:bg-green-300 border border-[#1AAB07] opacity-90 hover:opacity-100 transition-all duration-200 ${isPublishing ? "cursor-not-allowed" : ""}`}
          onClick={() => handlePublishClick(test)}
          disabled={isPublishing}
        >
          {isPublishing ? "Publishing..." : "Publish"}
        </button>
      </div>

      {/* Scheduled Time Display */}
      {scheduledTime.start && scheduledTime.end && (
        <div className="mt-4 text-sm text-gray-600">
          <p>
            Scheduled from:{" "}
            {new Date(scheduledTime.start)
              .toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .replace(",", "")}{" "}
            to{" "}
            {new Date(scheduledTime.end)
              .toLocaleString("en-GB", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })
              .replace(",", "")}
          </p>
        </div>
      )}

      <div className="relative">
        {/* Conditionally render the DataTime component for scheduling */}
        {isScheduling && (
          <DataTime onSchedule={handleSchedule} onCancel={handleCancel} duration={test.duration} />
        )}
      </div>
    </div>
  );
};

export default Adm_ScheduledTestCard;
