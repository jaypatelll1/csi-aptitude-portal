import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  MessageCircle,
  Upload,
  Send,
  X,
  FileText,
  Settings,
  ChevronDown,
  FileQuestion,
  Clock,
  Tag,
} from "lucide-react";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_Navbar from "../../components/admin/Adm_Navbar";

const Adm_McqGenerator = ({ onClose }) => {
  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionType, setQuestionType] = useState("academic");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [generatedMCQs, setGeneratedMCQs] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [error, setError] = useState("");
  const [testsData, setTestsData] = useState({
    drafted: [],
    scheduled: [],
    past: [],
    live: [],
  });
  const sidebarRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 16 * 1024 * 1024) {
        setError("File size must be less than 16MB");
        return;
      }
      setUploadedFile(file);
      setError("");
    } else {
      setError("Please upload a PDF file only");
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile && !topic.trim()) {
      setError("Please either upload a PDF file or enter a topic");
      return;
    }

    if (numQuestions < 1 || numQuestions > 50) {
      setError("Number of questions must be between 1 and 50");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      let requestData;
      let headers = {};

      if (uploadedFile) {
        // If file is uploaded, use FormData
        const formData = new FormData();
        formData.append("pdf_file", uploadedFile);
        
        if (topic.trim()) {
          formData.append("topic", topic);
        }
        
        formData.append("difficulty", difficulty);
        formData.append("num_questions", numQuestions.toString());
        formData.append("question_type", questionType);

        requestData = formData;
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // If no file, send JSON data
        requestData = {
          topic: topic.trim(),
          difficulty: difficulty,
          num_questions: numQuestions,
          question_type: questionType
        };
        headers["Content-Type"] = "application/json";
      }

      // Log request data for debugging
      console.log("Request data:", requestData);

      const response = await axios.post(
        "https://ai.csipl.xyz/generate_mcqs",
        requestData,
        {
          headers: headers,
          timeout: 300000, // 5 minutes timeout
        }
      );

      console.log("Full Response:", response);
      console.log("Response Data:", response.data);
      console.log("Response Data Type:", typeof response.data);
      console.log("Is Array?", Array.isArray(response.data));

      let mcqData = null;

      // Check multiple possible response formats
      if (Array.isArray(response.data)) {
        // Direct array response
        mcqData = response.data;
        console.log("Using direct array format");
      } else if (response.data && response.data.mcqs && Array.isArray(response.data.mcqs)) {
        // Wrapped in mcqs property
        mcqData = response.data.mcqs;
        console.log("Using wrapped mcqs format");
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        // Wrapped in data property
        mcqData = response.data.data;
        console.log("Using wrapped data format");
      } else if (response.data && response.data.questions && Array.isArray(response.data.questions)) {
        // Wrapped in questions property
        mcqData = response.data.questions;
        console.log("Using wrapped questions format");
      } else if (response.data && typeof response.data === 'object') {
        // Single object response, convert to array
        mcqData = [response.data];
        console.log("Using single object format");
      }

      if (mcqData && Array.isArray(mcqData) && mcqData.length > 0) {
        console.log("MCQ Data found:", mcqData);
        console.log("First MCQ sample:", mcqData[0]);

        // Transform the API response to match our component's expected format
        const transformedMCQs = mcqData.map((mcq, index) => {
          console.log(`Processing MCQ ${index + 1}:`, mcq);
          
          // Handle different option formats
          let options = [];
          if (mcq.options && typeof mcq.options === 'object') {
            if (mcq.options.A && mcq.options.B && mcq.options.C && mcq.options.D) {
              // Object format: {A: "...", B: "...", C: "...", D: "..."}
              options = [mcq.options.A, mcq.options.B, mcq.options.C, mcq.options.D];
            } else if (Array.isArray(mcq.options)) {
              // Array format
              options = mcq.options;
            }
          } else if (Array.isArray(mcq.options)) {
            options = mcq.options;
          }

          // Handle correct answer conversion
          let correctAnswerIndex = 0;
          if (typeof mcq.correct_answer === 'string') {
            const letter = mcq.correct_answer.toUpperCase();
            correctAnswerIndex = letter === 'A' ? 0 : 
                               letter === 'B' ? 1 : 
                               letter === 'C' ? 2 : 
                               letter === 'D' ? 3 : 0;
          } else if (typeof mcq.correct_answer === 'number') {
            correctAnswerIndex = mcq.correct_answer;
          }

          return {
            id: mcq.id || index + 1,
            question: mcq.question || "No question provided",
            options: options.length > 0 ? options : ["Option A", "Option B", "Option C", "Option D"],
            correct_answer: correctAnswerIndex,
            explanation: mcq.explanation || "",
            bloom_level: mcq.bloom_level || "",
            estimated_time_seconds: mcq.estimated_time_seconds || 0,
            tags: mcq.tags || []
          };
        });
        
        console.log("Transformed MCQs:", transformedMCQs);
        setGeneratedMCQs(transformedMCQs);
      } else {
        console.error("No valid MCQ data found in response");
        console.log("Available response keys:", Object.keys(response.data || {}));
        throw new Error(`Invalid response format from server. Response structure: ${JSON.stringify(response.data, null, 2)}`);
      }
    } catch (error) {
      console.error("Error generating MCQs:", error);
      
      let errorMessage = "Failed to generate MCQs";
      if (error.response) {
        // Server responded with error status
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data && typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else {
          errorMessage = `Server responded with status ${error.response.status}`;
        }
      } else if (error.request) {
        // Request was made but no response
        errorMessage = "No response from server. Please check your connection.";
      } else {
        // Other errors
        errorMessage = error.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
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

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return minutes > 0 ? `${minutes}m ${remainingSeconds}s` : `${remainingSeconds}s`;
  };

  return (
    <div className="min-h-screen flex bg-white">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-100 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <div>
          <Adm_Sidebar testsData={testsData} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="bg-white">
          <Adm_Navbar setSidebarOpen={setSidebarOpen} />
        </div>

        {/* Header with Mobile Menu */}
        <div className="flex items-center justify-between p-5 bg-gray-100">
          <button
            className="xl:hidden text-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-7 h-8"
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
          <h1 className="text-2xl font-bold text-gray-700">MCQ Generator</h1>
          <div className="w-8"></div>
        </div>

        {/* MCQ Generator Content */}
        <div className="flex-1 flex flex-col bg-white mx-5 mb-5 rounded-lg shadow-sm">
          {/* Content Header */}
          <div className="bg-white shadow-sm border-b px-6 py-4 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <FileQuestion className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">
                Generate MCQ Questions
              </h2>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {/* Welcome Message */}
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                <FileQuestion className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-blue-50 rounded-lg px-4 py-3 shadow-sm border border-blue-200 max-w-2xl">
                <p className="text-gray-700">
                  Hi! I'm here to help you generate MCQ questions. You can
                  either upload a PDF file or provide a topic manually. Please
                  fill in the details below to get started.
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <X className="w-4 h-4 text-red-600" />
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3 max-w-2xl">
                  <p className="text-red-700">{error}</p>
                </div>
              </div>
            )}

            {/* Generated MCQs */}
            {generatedMCQs.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <FileQuestion className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="bg-green-50 rounded-lg px-4 py-3 shadow-sm border border-green-200 flex-1">
                    <p className="text-gray-700 mb-4 font-medium">
                      🎉 Here are your generated MCQ questions:
                    </p>
                    <div className="space-y-6">
                      {generatedMCQs.map((mcq, index) => (
                        <div
                          key={mcq.id || index}
                          className="bg-white border rounded-lg p-5 shadow-sm"
                        >
                          {/* Question Header */}
                          <div className="flex items-start justify-between mb-4">
                            <h3 className="font-semibold text-gray-800 text-lg flex-1">
                              Question {index + 1}: {mcq.question}
                            </h3>
                            <div className="flex items-center space-x-2 ml-4">
                              {mcq.estimated_time_seconds && (
                                <div className="flex items-center space-x-1 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                  <Clock className="w-3 h-3" />
                                  <span>{formatTime(mcq.estimated_time_seconds)}</span>
                                </div>
                              )}
                              {mcq.bloom_level && (
                                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">
                                  {mcq.bloom_level.charAt(0).toUpperCase() + mcq.bloom_level.slice(1)}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Options */}
                          <div className="space-y-3 mb-4">
                            {mcq.options.map((option, optIndex) => (
                              <div
                                key={optIndex}
                                className="flex items-center space-x-3"
                              >
                                <div
                                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold ${
                                    optIndex === mcq.correct_answer
                                      ? "bg-green-100 border-green-500 text-green-700"
                                      : "border-gray-300 text-gray-600 bg-gray-50"
                                  }`}
                                >
                                  {String.fromCharCode(65 + optIndex)}
                                </div>
                                <span
                                  className={`text-base flex-1 ${
                                    optIndex === mcq.correct_answer
                                      ? "text-green-700 font-semibold"
                                      : "text-gray-700"
                                  }`}
                                >
                                  {option}
                                </span>
                                {optIndex === mcq.correct_answer && (
                                  <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                                    Correct Answer
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Explanation */}
                          {mcq.explanation && (
                            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                              <p className="text-sm text-blue-800">
                                <strong>💡 Explanation:</strong>{" "}
                                {mcq.explanation}
                              </p>
                            </div>
                          )}

                          {/* Tags */}
                          {mcq.tags && mcq.tags.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <Tag className="w-4 h-4 text-gray-500" />
                              <div className="flex flex-wrap gap-1">
                                {mcq.tags.map((tag, tagIndex) => (
                                  <span
                                    key={tagIndex}
                                    className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <div className="flex items-start space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <FileQuestion className="w-4 h-4 text-blue-600 animate-spin" />
                </div>
                <div className="bg-blue-50 rounded-lg px-4 py-3 shadow-sm border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      ></div>
                    </div>
                    <span className="text-blue-700 text-sm font-medium">
                      Generating MCQs... Please wait
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="bg-gray-50 border-t px-6 py-4 rounded-b-lg">
            <div className="flex flex-col lg:flex-row items-end space-y-3 lg:space-y-0 lg:space-x-3">
              {/* Form Controls */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                {/* Topic Input */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Topic{" "}
                    {!uploadedFile && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter topic (optional if PDF uploaded)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Difficulty Dropdown */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Difficulty
                  </label>
                  <div className="relative">
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                    >
                      <option value="easy">Easy</option>
                      <option value="medium">Medium</option>
                      <option value="hard">Hard</option>
                      <option value="expert">Expert</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Number of Questions */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Questions (1-50)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={numQuestions}
                    onChange={(e) =>
                      setNumQuestions(parseInt(e.target.value) || 10)
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Question Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Type
                  </label>
                  <div className="relative">
                    <select
                      value={questionType}
                      onChange={(e) => setQuestionType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm appearance-none bg-white"
                    >
                      <option value="academic">Academic</option>
                      <option value="practical">Practical</option>
                      <option value="conceptual">Conceptual</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* File Upload and Send Button */}
              <div className="flex items-end space-x-3">
                {/* File Upload */}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    PDF Upload (Max 16MB)
                  </label>
                  <label className="flex items-center justify-center w-10 h-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Upload size={18} className="text-gray-400" />
                    <input
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Send Button */}
                <div>
                  <label className="block text-xs font-medium text-transparent mb-1">
                    Send
                  </label>
                  <button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-10 h-10 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg flex items-center justify-center transition-colors shadow-md hover:shadow-lg"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* File Upload Status */}
            {uploadedFile && (
              <div className="mt-3 flex items-center space-x-2 text-sm text-gray-600 bg-white p-3 rounded-lg border">
                <FileText size={16} className="text-blue-600" />
                <span>
                  Uploaded: <strong>{uploadedFile.name}</strong> (
                  {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB)
                </span>
                <button
                  onClick={() => setUploadedFile(null)}
                  className="text-red-500 hover:text-red-700 ml-auto"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Adm_McqGenerator;