import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Dep_PresidentPastTestCard = ({ test, onClick }) => {

  const [result, setResult] = useState([]);
  const navigate = useNavigate();
  let user = useSelector((state) => state.user.user);

  const handleSubmit = async () => {
    try {
      if (onClick) {
        onClick(test.exam_id);
      }

      // Log the ID
      // console.log("Clicked test ID:", test.exam_id);
      // console.log("Clicked test duration:");
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.get(
        `${API_BASE_URL}/api/exams/results/all/${test.exam_id}?page=1&limit=3`,
        { withCredentials: true }
      );
      const fetchedResult = response.data.results;
      setResult(fetchedResult);
      
      // Navigate to the new route and pass the fetched result
      navigate("/president/test-students", {
        state: {
          name: test.title,
          duration: test.duration,
          examId: test.exam_id,
        },
      });
    } catch (error) {
      console.error("Error during POST request:", error);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 ml-4 w-[96%] border border-gray-400 flex flex-col">
      {/* Card Header */}
      <div className="flex justify-between items-center mb-4">
        <span className="bg-green-200 text-green-900 text-sm px-2 py-1 rounded font-sans border border-green-700 opacity-100">
          Finished
        </span>

        <div className="text-right">
          <div className="flex flex-col items-center">
            <span className="text-black-500 text-sm font-sans">
              Conducted on: {test.date}
            </span>
            <span className="text-black-500 text-xs mr-5">
              Branch: {test.target_years?.replace(/[{}]/g, "")} -{" "}
              {test.target_branches?.replace(/[{}]/g, "")
                .split(",")
                .find((branch) => branch.trim() === user.department) || "N/A"}
            </span>
          </div>
        </div>
      </div>

      {/* Test Info */}
      <h2 className="text-lg font-bold text-gray-900 font-sans">
        {test.title}
      </h2>
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
          {test.questions} Questions
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
      <div className="flex justify-end -mt-5 space-x-4">
        <button
          className="bg-gray-200 text-[#1349c5] px-4 py-2 rounded hover:bg-blue-300 border border-[#1349c5] opacity-90 hover:opacity-100"
          onClick={(testId) =>
            handleSubmit(test, (id) => console.log("Test clicked:", id))
          }
        >
          View Results
        </button>
      </div>
    </div>
  );
};

export default Dep_PresidentPastTestCard;
