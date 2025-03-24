import React, { useState, useEffect } from "react";
import DataTime from "./Dep_DataTime";
import axios from "axios";
import { setExamId } from "../.././redux/ExamSlice";
import { useDispatch, useSelector } from "react-redux";
import { replace, useNavigate } from "react-router-dom";
// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Dep_DraftedTestCard = ({ test }) => {
  const [isScheduling, setIsScheduling] = useState(false);
  const [scheduledTime, setScheduledTime] = useState({ start: "", end: "" });
  const [questions, setQuestions] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10); // You can set the default limit to 10 or any number
  const [totalPages, setTotalPages] = useState(1); // Total number of pages from the backend
  const [loading, setLoading] = useState(false);

  const [requestInProgress, setRequestInProgress] = useState(false);
  let user = useSelector((state) => state.user.user);

  const examId = test.exam_id;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle page change
  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  // Handle limit change (optional)
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page whenever the limit changes
  };

  const handlePublishClick = async () => {
    if (requestInProgress) return; // Prevent multiple requests
    setRequestInProgress(true); // Set request state to true

    try {
      dispatch(setExamId(examId));

      navigate("/department/input", { replace: true });

      // const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      // await axios.put(
      //   `${API_BASE_URL}/api/exams/live-exam/${examId}`,
      //   {},
      //   { withCredentials: true }
      // );
      // window.location.reload();
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
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      await axios.put(
        `${API_BASE_URL}/api/exams/publish/${examId}`,
        {
          start_time: start,
          end_time: end,
        },
        { withCredentials: true }
      );
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
          {/* SVG Icon */}
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
          <span>Draft test</span>
        </span>
        <div className="text-right">
          <div className="flex flex-col ">
            <span className="text-black-500 text-sm">Created on: {test.date}</span>
            <span className="text-black-500 text-xs mr-5">
              Branch: {test.target_years?.replace(/[{}]/g, "")} -{" "}
              {test.target_branches
                ?.replace(/[{}]/g, "")
                .split(",")
                .find((branch) => branch.trim() === user.department) || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Test Info */}
      <h2 className="text-lg font-bold text-gray-900">{test.title}</h2>
      <div className="text-gray-600 text-sm mt-4">
        <p className="mb-2 font-bold flex items-center">
          <svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.4054 15.5596H7.78711C7.40761 15.5596 7.09961 15.2516 7.09961 14.8721C7.09961 14.4926 7.40761 14.1846 7.78711 14.1846H14.4054C14.7849 14.1846 15.0929 14.4926 15.0929 14.8721C15.0929 15.2516 14.7849 15.5596 14.4054 15.5596"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.4054 11.7217H7.78711C7.40761 11.7217 7.09961 11.4137 7.09961 11.0342C7.09961 10.6547 7.40761 10.3467 7.78711 10.3467H14.4054C14.7849 10.3467 15.0929 10.6547 15.0929 11.0342C15.0929 11.4137 14.7849 11.7217 14.4054 11.7217"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.3125 7.89355H7.78711C7.40761 7.89355 7.09961 7.58555 7.09961 7.20605C7.09961 6.82655 7.40761 6.51855 7.78711 6.51855H10.3125C10.692 6.51855 11 6.82655 11 7.20605C11 7.58555 10.692 7.89355 10.3125 7.89355"
              fill="black"
            />
            <mask
              id="mask0_343_4870"
              style={{ maskType: "luminance" }}
              maskUnits="userSpaceOnUse"
              x="2"
              y="1"
              width="18"
              height="20"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M2.75 1.83398H19.401V20.0846H2.75V1.83398Z"
                fill="white"
              />
            </mask>
            <g mask="url(#mask0_343_4870)">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M14.5832 3.20898L7.535 3.21265C5.401 3.22548 4.125 4.54548 4.125 6.74457V15.1742C4.125 17.388 5.41292 18.7098 7.568 18.7098L14.6162 18.7071C16.7502 18.6942 18.0262 17.3724 18.0262 15.1742V6.74457C18.0262 4.53082 16.7392 3.20898 14.5832 3.20898ZM7.56892 20.0848C4.68692 20.0848 2.75 18.1112 2.75 15.1742V6.74457C2.75 3.78098 4.62642 1.85507 7.53042 1.83765L14.5823 1.83398H14.5833C17.4653 1.83398 19.4013 3.80757 19.4013 6.74457V15.1742C19.4013 18.1369 17.5248 20.0637 14.6208 20.0821L7.56892 20.0848Z"
                fill="black"
              />
            </g>
          </svg>
          {/* Display the question count */}

          <h4>Number of Questions: {test ? test.questions : "Loading..."}</h4>
        </p>
        <p className="font-bold flex items-center">
          <svg
            width="22"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-1"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.0007 2.20801C5.70423 2.20801 2.20898 5.70326 2.20898 9.99967C2.20898 14.2961 5.70423 17.7913 10.0007 17.7913C14.2971 17.7913 17.7923 14.2961 17.7923 9.99967C17.7923 5.70326 14.2971 2.20801 10.0007 2.20801M10.0007 19.1663C4.94615 19.1663 0.833984 15.0542 0.833984 9.99967C0.833984 4.94517 4.94615 0.833008 10.0007 0.833008C15.0552 0.833008 19.1673 4.94517 19.1673 9.99967C19.1673 15.0542 15.0552 19.1663 10.0007 19.1663"
              fill="black"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M13.1453 13.3845C13.0252 13.3845 12.9042 13.3533 12.7933 13.2882L9.33745 11.2267C9.13029 11.102 9.00195 10.8774 9.00195 10.6354V6.19141C9.00195 5.81191 9.30995 5.50391 9.68945 5.50391C10.0699 5.50391 10.377 5.81191 10.377 6.19141V10.2449L13.4982 12.1057C13.8236 12.301 13.9309 12.7227 13.7365 13.049C13.6073 13.2644 13.379 13.3845 13.1453 13.3845"
              fill="black"
            />
          </svg>
          {test.duration}
        </p>
      </div>
      <br />

      {/* Buttons */}
      <div className="flex justify-end space-x-4 -mt-5">
        <button
          className="text-[#1aab07] px-3 lg:px-4 py-2 rounded border border-[#1aab07] opacity-90 hover:bg-[#a9f4a1] hover:text-[#1aab07] hover:opacity-100"
          onClick={handlePublishClick}
          disabled={requestInProgress}
        >
          Edit
        </button>
        <button
          onClick={() => setIsScheduling(true)}
          className="bg-gray-200 text-gray-900 px-3 py-2 rounded hover:bg-gray-300 border border-gray-700 opacity-90 hover:opacity-100"
          disabled={requestInProgress}
        >
          Schedule
        </button>
      </div>
      <div className="relative">
        {/* Conditionally render the DataTime component for scheduling */}
        {isScheduling && (
          <DataTime onSchedule={handleSchedule} onCancel={handleCancel} duration={test.duration} />
        )}

        {/* Display scheduled time */}
        {scheduledTime.start && scheduledTime.end && (
          <div className="mt-4 text-sm text-gray-600">
            <p>
              Scheduled from: {new Date(scheduledTime.start).toLocaleString()} to{" "}
              {new Date(scheduledTime.end).toLocaleString()}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dep_DraftedTestCard;
