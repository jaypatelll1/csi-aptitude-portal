import React, { useState, useEffect, useRef } from "react";
import Dep_Sidebar from "../../components/department/Dep_Sidebar";
import axios from "axios";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import UploadModal from "../../upload/UploadModal";
import Dep_Navbar from "../../components/department/Dep_Navbar";
import UploadImageModal from "../../upload/UploadImageModal";
// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const validCategories = [
  "quantitative aptitude",
  "logical reasoning",
  "verbal ability",
  "technical",
  "general knowledge",
];

const Dep_InputQuestions = () => {
  const [question, setQuestion] = useState("");
  const [questionType, setQuestionType] = useState("single");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [toggles, setToggles] = useState([false, false, false, false]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);

// New state variables for image upload
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const questionData = location.state || {};
  const [category, setCategory] = useState(questionData.category || "");

  const examId = useSelector((state) => state.exam.examId);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    const allowedTypes = [
      "application/vnd.ms-excel",
      "text/csv",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a .csv or .xls file.");
      return;
    }
    setSelectedFile(file);
  };

  // New handler for image file changes
  const handleImageChange = (event) => {
    const file = event.target.files[0];
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/jpg",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a valid image file.");
      return;
    }
    setSelectedImage(file);
  };

  const handleQuestionSubmit = async (event) => {
    event.preventDefault();
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("questions", selectedFile);

    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.post(
        `${API_BASE_URL}/api/exams/${examId}/questions`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Make sure the cookie is sent with the request
        }
      );
      alert("File uploaded successfully!");
      setModalOpen(false);
    } catch (error) {
      alert("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Handler for image submission
    const handleImageSubmit = async (event) => {
      event.preventDefault();
    
      if (!selectedImage) {
        alert("Please select an image to upload.");
        return;
      }
    
      setIsImageUploading(true);
    
      const formData = new FormData();
      formData.append("image", selectedImage);
    
      try {
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
    
        // Upload the image and display it
        const response = await axios.post(
          `${API_BASE_URL}/api/upload-image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            withCredentials: true,
          }
        );
    
        console.log("Upload Response:", response.data);
    
        if (response.data && response.data.imageUrl) {
          setImageUrl(response.data.imageUrl); // Set the image URL for display
          alert("Image uploaded successfully!");
        } else {
          alert("Image uploaded but no URL was returned.");
        }
    
      } catch (error) {
        console.error("Upload error:", error);
        alert("An error occurred while uploading the image.");
      } finally {
        setIsImageUploading(false);
      }
    };

  const {
    questionId,
    questionsType,
    questionText,
    questionOptions = {},
    exam_id,
    correct_option,
    category: initialCategory,
  } = location.state || {};

  useEffect(() => {
    if (questionText && questionOptions) {
      setQuestion(questionText);
      const { a = "", b = "", c = "", d = "" } = questionOptions;
      setOptions([a, b, c, d]);
      const validOptions = ["a", "b", "c", "d"];
      const correctOptionIndex = validOptions.indexOf(
        questionOptions.correct_option
      );
      setToggles(
        validOptions.map(
          (option, index) =>
            index === (correctOptionIndex >= 0 ? correctOptionIndex : 0)
        )
      );
    }
  }, [questionText, questionOptions]);

  const viewquestions = () => {
    navigate("/department/viewquestions");
  };

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

  const handleRemoveImage = async () => {
    if (!questionId) {
      // alert("No question ID found");
      setImageUrl(""); 
      return;
    }
  
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      
      // Call backend to delete image
      const response = await axios.delete(`${API_BASE_URL}/api/delete-image/${questionId}`, {
        withCredentials: true,
      });
  
      if (response.data.success) {
      
        setImageUrl(""); // Clear image from UI
      } else {
        alert("Failed to delete image.");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      alert("An error occurred while deleting the image.");
    }
  };

  const handleSubmit = async () => {
    if (question && options.every((option) => option.trim() !== "")) {
      if (!toggles.includes(true)) {
        alert("Please select at least one correct answer.");
        return;
      }

      const findTrueIndex = () => {
        var a = toggles.findIndex((toggle) => toggle === true);
        return a !== -1 ? a : "No true value found";
      };

      let b = findTrueIndex();
      const correctOption = String.fromCharCode(97 + b);
      console.log(correctOption);
      const payload = {
        question_text: `${question}`,
        options: {
          a: `${options[0]}`,
          b: `${options[1]}`,
          c: `${options[2]}`,
          d: `${options[3]}`,
        },
        correct_option: `${correctOption}`,
        category: category,
      };

      try {
        if (!questionId) {
          let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
          await axios.post(
            `${API_BASE_URL}/api/exams/questions/${examId}`,
            payload,
            {
              withCredentials: true, // Make sure the cookie is sent with the request
            }
          );
          setQuestion("");
          setOptions(["", "", "", ""]);
          setToggles([false, false, false, false]);
          setCategory("");
          setQuestionCount((prevCount) => prevCount + 1);
          navigate("/department/input?category=");
        } else {
          let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
          await axios.put(
            `${API_BASE_URL}/api/exams/questions/${examId}/${questionId}`,
            payload,
            {
              withCredentials: true, // Make sure the cookie is sent with the request
            }
          );
          setQuestion("");
          setOptions(["", "", "", ""]);
          setToggles([false, false, false, false]);
          navigate("/department/viewquestions");
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
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Dep_Sidebar />
      </div>
      <div className="flex-1">
        <div>
          <Dep_Navbar />
        </div>
        <div className="flex-grow w-full p-9 bg-gray-100 overflow-y-auto m-0 ">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
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
                      ? "M6 18L18 6M6 6l12 12"
                      : "M4 6h16M4 12h16M4 18h16"
                  }
                />
              </svg>
            </button>
            <div className="text-2xl font-semibold text-center text-gray-800 ml-0 xl:ml-0">
              Create Aptitude Test
            </div>
            <div className="flex space-x-3">
              <button
                className="bg-blue-200 text-blue-900 px-4 py-2 rounded hover:bg-blue-300 border border-blue-700 opacity-90 hover:opacity-100"
                onClick={() => setModalOpen(true)}
              >
                Upload File
              </button>
              <button
                className="bg-blue-200 text-blue-900 px-4 py-2 rounded hover:bg-blue-300 border border-blue-700 opacity-90 hover:opacity-100"
                onClick={() => setImageModalOpen(true)}
              >
                Upload Image
              </button>

              <UploadModal
                isOpen={isModalOpen}
                check="Upload Questions"
                closeModal={() => setModalOpen(false)}
                onFileChange={handleFileChange}
                onSubmit={handleQuestionSubmit}
                isUploading={isUploading}
              />

              <UploadImageModal
                isOpen={isImageModalOpen}
                check="Upload Image"
                closeModal={() => setImageModalOpen(false)}
                onFileChange={handleImageChange}
                onSubmit={handleImageSubmit}
                isUploading={isImageUploading}
              />
            </div>
          </div>
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
              Question {questionCount}
            </span>
          </div>
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
              <label className="text-xl block text-gray-700 font-medium mb-2">
                Select Category:
              </label>
              <select
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="" hidden disabled className="text-gray-400">
                  {initialCategory || "Select a category"}{" "}
                  {/* Show the existing category if editing */}
                </option>
                {validCategories.map((cat, index) => (
                  <option key={index} value={cat} className="text-gray-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Display uploaded image if available */}
            {imageUrl && (
              <div className="mb-4">
                <label className="text-xl block text-gray-700 font-medium mb-2">
                  Uploaded Image:
                </label>
                <div className="border rounded-lg p-2 max-w-md">
                  <img
                    src={imageUrl}
                    alt="Question image"
                    className="max-w-full h-auto"
                  />
                </div>
                <button
                  onClick={handleRemoveImage}
                  className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-400"
                >
                  Remove Image
                </button>
              </div>
            )}
           
           {questionsType !== "text" && (
            <div>
              <label className="text-xl block text-gray-700 font-medium mb-2">
                Options:
              </label>
              {options.map((answer, index) => (
                <div
                  key={index}
                  className="group flex items-center gap-4 mb-2 p-3 rounded-lg "
                >
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    placeholder={`Enter option ${index + 1}`}
                    className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="bg-white text-black px-4 py-2 rounded-lg mt-2 hover:border border-black "
                >
                  + Add Answer
                </button>
              )}
            </div>
           )}
          </div>
          <div className="flex gap-4 justify-between">
            <button
              onClick={handleSubmit}
              className="bg-green-200 text-green-900 px-3 lg:px-4 py-2 rounded hover:bg-green-300 border border-green-700 opacity-90 hover:opacity-100"
            >
              Save and Add Next
            </button>
            <button
              className="bg-gray-200 text-gray-900 px-3 py-2 rounded hover:bg-gray-300 border border-gray-700 opacity-90 hover:opacity-100"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dep_InputQuestions;
