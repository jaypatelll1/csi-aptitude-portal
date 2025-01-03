import React, { useState, useEffect, useRef } from "react";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";

const InputQuestions = () => {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("single");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [toggles, setToggles] = useState([false, false, false, false]);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  // Safely destructure location.state, fallback to empty object if undefined
  const {
    questionId,
    questionText,
    questionOptions = {},
    exam_id,
  } = location.state || {};

  // Pre-fill the form when the component loads (for editing)
  useEffect(() => {
    if (questionText && questionOptions) {
      setQuestion(questionText);

      // Check if the necessary options exist to prevent errors
      const { a = "", b = "", c = "", d = "" } = questionOptions;
      setOptions([a, b, c, d]);

      // Ensure the correct_option exists before attempting to use it
      const correctOptionIndex = ["a", "b", "c", "d"].indexOf(
        questionOptions.correct_option
      );
      setToggles(
        [false, false, false, false].map(
          (_, index) => index === correctOptionIndex
        )
      );
    }
  }, [questionText, questionOptions]);

  const viewquestions = () => {
    navigate("/admin/viewquestions"); // Navigate to /admin/viewquestions page
  };

  const examId = useSelector((state) => state.exam.examId);

  const handleAddAnswer = () => {
    if (options.length < 4) {
      setOptions([...options, ""]);
      setToggles([...toggles, false]);
    }
  };

  const handleAnswerChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleRemoveAnswer = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    const newToggles = toggles.filter((_, i) => i !== index);
    setOptions(newOptions);
    setToggles(newToggles);
  };

  const handleToggleChange = (index) => {
    const newToggles = [...toggles];
    if (questionType === "single") {
      newToggles.fill(false);
      newToggles[index] = true;
    } else {
      newToggles[index] = !newToggles[index];
    }
    setToggles(newToggles);
  };

  const handleSubmit = async () => {
    if (question && options.every((option) => option.trim() !== "")) {
      console.log({ question, questionType, options, toggles });

      if (!toggles.includes(true)) {
        alert("Please select at least one correct answer.");
        return;
      }

      const findTrueIndex = () => {
        var a = toggles.findIndex((toggle) => toggle === true);
        return a !== -1 ? a : "No true value found";
      };

      let b = findTrueIndex();
      const correctOption = String.fromCharCode(96 + b);

      const payload = {
        question_text: `${question}`,
        options: {
          a: `${options[0]}`,
          b: `${options[1]}`,
          c: `${options[2]}`,
          d: `${options[3]}`,
        },
        correct_option: `${correctOption}`,
      };

      try {
        if (!questionId) {
          const response = await axios.post(
            `/api/exams/questions/${examId}`,
            payload
          );
          console.log("Question created successfully:", response.data);
          setQuestion("");
          setOptions(["", "", "", ""]);
          setToggles([false, false, false, false]);
        } else {
          const response = await axios.put(
            `/api/exams/questions/${examId}/${questionId}`,
            payload
          );
          console.log("Question created successfully:", response.data);
          setQuestion("");
          setOptions(["", "", "", ""]);
          setToggles([false, false, false, false]);
          navigate("/admin/viewquestions");
        }
      } catch (error) {
        console.error(
          "Error creating test:",
          error.response?.data || error.message
        );
      }
    } else {
      alert("Please fill in all fields before submitting.");
    }
  };

  const handleCancel = () => {
    setQuestion("");
    setOptions(["", "", "", ""]);
    setToggles([false, false, false, false]);
  };
  useEffect(() => {
    // Close the sidebar if clicked outside
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };

    // Attach event listener to the document
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Section */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      {/* Main Content Section */}
      <div className="flex-grow w-5/6 p-9 bg-gray-100 overflow-y-auto m-0">
        <div className="flex items-center  mb-4 sm:mb-6">
          {/* Burger Icon Button */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden text-gray-800 focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  sidebarOpen
                    ? "M6 18L18 6M6 6l12 12" // Cross icon for "close"
                    : "M4 6h16M4 12h16M4 18h16" // Burger icon for "open"
                }
              />
            </svg>
          </button>
          {/* Title Section */}
          <h1 className="text-2xl font-semibold text-center text-gray-800 ml-52 xl:ml-0">
            Create Aptitude Test
          </h1>
        </div>

        {/* Navigation Section */}
        <div className="flex justify-between items-center mb-6">
          <button
            className="text-xl text-blue-500 hover:underline flex items-center"
            onClick={viewquestions}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth="1.5"
              stroke="currentColor"
              className="w-5 h-5 mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.75 19.5L8.25 12l7.5-7.5"
              />
            </svg>
            View Questions
          </button>
          <span className="text-xl text-gray-500 font-medium">
            Question 1/30
          </span>
        </div>

        {/* Main Form Section */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label
              htmlFor="question"
              className="text-xl block text-gray-700 font-medium mb-2"
            >
              Enter Question:
            </label>
            <textarea
              id="question"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter question description..."
              className="w-full p-4 h-24 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="answer-type"
              className="text-xl block text-gray-700 font-medium mb-2"
            >
              Answer Type:
            </label>
            <select
              id="answer-type"
              value={questionType}
              onChange={(e) => setQuestionType(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="single">Single Choice</option>
            </select>
          </div>

          <div>
            <label className="text-xl block text-gray-700 font-medium mb-2">
              Options:
            </label>
            {options.map((answer, index) => (
              <div
                key={index}
                className="group flex items-center gap-4 mb-4 p-3 border border-gray-300 rounded-lg bg-gray-50 hover:shadow-md"
              >
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  placeholder={`Enter option ${index + 1}`}
                  className="flex-grow p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  onClick={() => handleToggleChange(index)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 ${
                    toggles[index] ? "bg-[#449800]" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 transform ${
                      toggles[index] ? "translate-x-6" : "translate-x-0"
                    }`}
                  />
                </button>

                <button
                  onClick={() => handleRemoveAnswer(index)}
                  className="text-red-500 hover:text-red-700 ml-2"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {options.length < 4 && (
              <button
                onClick={handleAddAnswer}
                className="bg-white text-black px-4 py-2 rounded-lg mt-2 hover:border border-grey-100 transition-all duration-300"
              >
                + Add Answer
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-4 justify-between">
          <button
            onClick={handleSubmit}
            className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
          >
            Save and Add Next
          </button>
          <button
            className="bg-gray-400 text-white py-2 px-4 rounded-lg hover:bg-gray-500"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputQuestions;
