import React, { useState } from "react";
import DataTime from "./Adm_DataTime";
import axios from "axios";

const Adm_DraftedTestCard = ({ test }) => {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledTime, setScheduledTime] = useState({ start: "", end: "" });
  const [requestInProgress, setRequestInProgress] = useState(false);

  const examId = test.exam_id;

  const handlePublishClick = async () => {
    if (requestInProgress) return; // Prevent multiple requests
    setRequestInProgress(true); // Set request state to true

    try {
      await axios.put(`/api/exams/live-exam/${examId}`);
      window.location.reload();
    } catch (error) {
      console.error("Error during Put request:", error);
    } finally {
      setRequestInProgress(false); // Reset request state
    }
  };

  const handleSchedule = async (start, end) => {
    if (requestInProgress) return; // Prevent multiple requests
    setRequestInProgress(true); // Set request state to true

    try {
      await axios.put(`/api/exams/publish/${examId}`, {
        start_time: start,
        end_time: end,
      });
      setScheduledTime({ start, end });
      setIsScheduling(false);
    } catch (err) {
      alert(`Error scheduling test: ${err.response?.data?.message || err.message}`);
    } finally {
      setRequestInProgress(false); // Reset request state
    }
  };

  const handleCancel = () => {
    setIsScheduling(false);
  };

  return (
    <div className="bg-white rounded-lg w-[96%] p-4 ml-4  border border-gray-400 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <span className="flex items-center bg-gray-100 text-gray-900 border border-gray-700 opacity-90 text-sm px-2 py-1 rounded space-x-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.29398 3.33294L12.668 6.70627L6.04265 13.3329C5.8579 13.5177 5.62809 13.651 5.37598 13.7196L1.96598 14.6496C1.88098 14.6727 1.79139 14.6729 1.70628 14.6502C1.62117 14.6275 1.54357 14.5827 1.48132 14.5204C1.41907 14.4581 1.37439 14.3804 1.35179 14.2953C1.3292 14.2102 1.3295 14.1206 1.35265 14.0356L2.28198 10.6249C2.35072 10.3731 2.484 10.1435 2.66865 9.95894L9.29398 3.33294ZM4.35132 7.33294L3.35132 8.33294H1.83398C1.70138 8.33294 1.5742 8.28026 1.48043 8.18649C1.38666 8.09272 1.33398 7.96555 1.33398 7.83294C1.33398 7.70033 1.38666 7.57315 1.48043 7.47938C1.5742 7.38562 1.70138 7.33294 1.83398 7.33294H4.35132ZM13.9193 1.8836L14.0213 1.9796L14.118 2.0816C14.522 2.53656 14.7369 3.12862 14.719 3.73679C14.701 4.34495 14.4515 4.9233 14.0213 5.35361L13.3747 5.99961L10.0006 2.62627L10.6473 1.9796C11.0777 1.54956 11.6561 1.30012 12.2643 1.28228C12.8724 1.26443 13.4644 1.47953 13.9193 1.8836ZM7.01798 4.66627L6.01798 5.66627H1.83398C1.70138 5.66627 1.5742 5.61359 1.48043 5.51982C1.38666 5.42606 1.33398 5.29888 1.33398 5.16627C1.33398 5.03366 1.38666 4.90649 1.48043 4.81272C1.5742 4.71895 1.70138 4.66627 1.83398 4.66627H7.01798ZM9.68465 1.9996L8.68465 2.9996H1.83398C1.70138 2.9996 1.5742 2.94693 1.48043 2.85316C1.38666 2.75939 1.33398 2.63221 1.33398 2.4996C1.33398 2.367 1.38666 2.23982 1.48043 2.14605C1.5742 2.05228 1.70138 1.9996 1.83398 1.9996H9.68465Z"
              fill="#797979"
            />
          </svg>
          <span>Edit test</span>
        </span>
        <span className="text-black-500 text-sm">Created on: {test.date}</span>
      </div>

      <h2 className="text-lg font-bold text-gray-900">{test.title}</h2>
      <div className="text-gray-600 text-sm mt-4">
        <p className="mb-2 font-bold flex items-center">
          Number of Questions: {test ? test.questions : "Loading..."}
        </p>
        <p className="font-bold flex items-center">{test.duration}</p>
      </div>

      <div className="flex justify-end space-x-4 -mt-5">
        <button
          className=" text-[#1aab07] px-3 lg:px-4 py-2 rounded border border-[#1aab07] opacity-90 hover:opacity-100"
          onClick={handlePublishClick}
          disabled={requestInProgress}
        >
          {requestInProgress ? "Publishing..." : "Publish"}
        </button>
        <button
          onClick={() => setIsScheduling(true)}
          className="bg-gray-200 text-gray-900 px-3 py-2 rounded hover:bg-gray-300 border border-gray-700 opacity-90 hover:opacity-100"
          disabled={requestInProgress}
        >
          Schedule
        </button>
      </div>
      {isScheduling && (
        <DataTime onSchedule={handleSchedule} onCancel={handleCancel} />
      )}
    </div>
  );
};

export default Adm_DraftedTestCard;
