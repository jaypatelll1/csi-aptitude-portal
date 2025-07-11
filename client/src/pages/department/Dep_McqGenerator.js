import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
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
  Trash2,
  Download,
  Eye,
  EyeOff,
} from "lucide-react";
import Dep_Sidebar from "../../components/department/Dep_Sidebar"; // Import the Dep_Sidebar component
import Dep_Navbar from "../../components/department/Dep_Navbar"; // Import the Dep_Navbar component
import McqSet from "../../components/mcqgenerator/McqSet"; // Import the McqSet component
import InputAreaComponent from "../../components/mcqgenerator/InputArea"; // Import the InputAreaComponent
import {
  setGenerating,
  setError,
  addMcqSet,
  deleteMcqSet,
  clearAllMcqSets,
} from "../../redux/mcqSlice";

const Dep_McqGenerator = ({ onClose }) => {
  const dispatch = useDispatch();
  const { mcqSets, isGenerating, error } = useSelector((state) => state.mcq);

  const [topic, setTopic] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [numQuestions, setNumQuestions] = useState(10);
  const [questionType, setQuestionType] = useState("academic");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSets, setCollapsedSets] = useState(new Set());
  const [testsData, setTestsData] = useState({
    drafted: [],
    scheduled: [],
    past: [],
    live: [],
  });
  const [selectedQuestions, setSelectedQuestions] = useState({}); // Track selected questions: { [setId]: Set(questionId) }
  const sidebarRef = useRef(null);

  console.log(mcqSets);
  console.log(selectedQuestions);

  const handleExport = async () => {
    const questions = [];

    mcqSets.forEach((set) => {
      const selected = selectedQuestions[set.id];
      if (selected && selected.size > 0) {
        set.mcqs.forEach((mcq) => {
          if (selected.has(mcq.id)) {
            questions.push({
              question_text: mcq.question,
              question_type: "single_choice", // assuming constant, or replace with `mcq.question_type` if dynamic
              options_a: mcq.options[0] || "",
              options_b: mcq.options[1] || "",
              options_c: mcq.options[2] || "",
              options_d: mcq.options[3] || "",
              correct_option: String.fromCharCode(97 + mcq.correct_answer),
              correct_options: null,
              image_url: mcq.image_url || "", // if available
              category: mcq.category, // fallback
            });
          }
        });
      }
    });

    const payload = { questions };

    try {
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const url = `${API_BASE_URL}/api/export/ai_generated_questions`;

      const response = await axios.post(url, payload, {
        withCredentials: true,
        responseType: "blob", // 👈 important for binary Excel file
      });

      // Create a blob from the response
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      // Create download link
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = "ai_mcq_export.xlsx"; // Set default filename
      document.body.appendChild(link);
      link.click();
      link.remove();

      console.log("Export successful and file downloaded.");
    } catch (error) {
      console.error("Export failed", error.response?.data || error.message);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type === "application/pdf") {
      if (file.size > 16 * 1024 * 1024) {
        dispatch(setError("File size must be less than 16MB"));
        return;
      }
      setUploadedFile(file);
      dispatch(setError(""));
    } else {
      dispatch(setError("Please upload a PDF file only"));
    }
  };

  const handleGenerate = async () => {
    if (!uploadedFile && !topic.trim()) {
      dispatch(setError("Please either upload a PDF file or enter a topic"));
      return;
    }

    if (numQuestions < 1 || numQuestions > 50) {
      dispatch(setError("Number of questions must be between 1 and 50"));
      return;
    }

    dispatch(setGenerating(true));
    dispatch(setError(""));

    try {
      let requestData;
      let headers = {};
      let apiEndpoint;

      if (uploadedFile) {
        // Use the PDF-specific endpoint
        apiEndpoint = "https://questiongen-pdf.onrender.com/generate_mcqs_from_pdf";

        const formData = new FormData();
        formData.append("pdf_file", uploadedFile);
        formData.append("difficulty", difficulty);
        formData.append("num_questions", numQuestions.toString());
        formData.append("question_type", questionType);

        // Add topic if provided
        if (topic.trim()) {
          formData.append("topic", topic);
        }

        requestData = formData;
        headers["Content-Type"] = "multipart/form-data";
      } else {
        // Use the existing topic-based endpoint
        apiEndpoint = "https://questiongen-pdf.onrender.com/generate_mcqs";

        requestData = {
          topic: topic.trim(),
          difficulty: difficulty,
          num_questions: numQuestions,
          question_type: questionType,
        };
        headers["Content-Type"] = "application/json";
      }

      const response = await axios.post(apiEndpoint, requestData, {
        headers: headers,
        timeout: 300000,
      });

      // Rest of the response handling code remains the same...
      let mcqData = null;

      // Handle different response formats
      if (Array.isArray(response.data)) {
        mcqData = response.data;
      } else if (
        response.data &&
        response.data.mcqs &&
        Array.isArray(response.data.mcqs)
      ) {
        mcqData = response.data.mcqs;
      } else if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        mcqData = response.data.data;
      } else if (
        response.data &&
        response.data.questions &&
        Array.isArray(response.data.questions)
      ) {
        mcqData = response.data.questions;
      } else if (response.data && typeof response.data === "object") {
        mcqData = [response.data];
      }

      if (mcqData && Array.isArray(mcqData) && mcqData.length > 0) {
        const transformedMCQs = mcqData.map((mcq, index) => {
          let options = [];
          if (mcq.options && typeof mcq.options === "object") {
            if (
              mcq.options.A &&
              mcq.options.B &&
              mcq.options.C &&
              mcq.options.D
            ) {
              options = [
                mcq.options.A,
                mcq.options.B,
                mcq.options.C,
                mcq.options.D,
              ];
            } else if (Array.isArray(mcq.options)) {
              options = mcq.options;
            }
          } else if (Array.isArray(mcq.options)) {
            options = mcq.options;
          }

          let correctAnswerIndex = 0;
          if (typeof mcq.correct_answer === "string") {
            const letter = mcq.correct_answer.toUpperCase();
            correctAnswerIndex =
              letter === "A"
                ? 0
                : letter === "B"
                  ? 1
                  : letter === "C"
                    ? 2
                    : letter === "D"
                      ? 3
                      : 0;
          } else if (typeof mcq.correct_answer === "number") {
            correctAnswerIndex = mcq.correct_answer;
          }
          const category = mcq.question_type;
          return {
            id: mcq.id || index + 1,
            question: mcq.question || "No question provided",
            options:
              options.length > 0
                ? options
                : ["Option A", "Option B", "Option C", "Option D"],
            correct_answer: correctAnswerIndex,
            explanation: mcq.explanation || "",
            bloom_level: mcq.bloom_level || "",
            estimated_time_seconds: mcq.estimated_time_seconds || 0,
            tags: mcq.tags || [],
            category: category,
          };
        });

        // Add new MCQ set to Redux store
        dispatch(
          addMcqSet({
            topic: topic.trim() || "PDF Content",
            difficulty,
            questionType,
            mcqs: transformedMCQs,
            fileName: uploadedFile?.name || null,
          })
        );

        // Clear form
        setTopic("");
        setUploadedFile(null);
      } else {
        throw new Error(`Invalid response format from server`);
      }
    } catch (error) {
      console.error("Error generating MCQs:", error);

      let errorMessage = "Failed to generate MCQs";
      if (error.response) {
        if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (
          error.response.data &&
          typeof error.response.data === "string"
        ) {
          errorMessage = error.response.data;
        } else {
          errorMessage = `Server responded with status ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = "No response from server. Please check your connection.";
      } else {
        errorMessage = error.message;
      }

      dispatch(setError(errorMessage));
    } finally {
      dispatch(setGenerating(false));
    }
  };

  const toggleSetCollapse = (setId) => {
    const newCollapsed = new Set(collapsedSets);
    if (newCollapsed.has(setId)) {
      newCollapsed.delete(setId);
    } else {
      newCollapsed.add(setId);
    }
    setCollapsedSets(newCollapsed);
  };

  const handleDeleteSet = (setId) => {
    if (window.confirm("Are you sure you want to delete this MCQ set?")) {
      dispatch(deleteMcqSet(setId));
    }
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all MCQ sets?")) {
      dispatch(clearAllMcqSets());
    }
  };

  // Toggle selection for a single question
  const handleQuestionCheckbox = (setId, questionId) => {
    setSelectedQuestions((prev) => {
      const setSelected = new Set(prev[setId] || []);
      if (setSelected.has(questionId)) {
        setSelected.delete(questionId);
      } else {
        setSelected.add(questionId);
      }
      return { ...prev, [setId]: setSelected };
    });
  };

  // Toggle select all for a set
  const handleSelectAllSet = (setId, allQuestionIds) => {
    setSelectedQuestions((prev) => {
      const setSelected = new Set(prev[setId] || []);
      if (setSelected.size === allQuestionIds.length) {
        // Unselect all
        return { ...prev, [setId]: new Set() };
      } else {
        // Select all
        return { ...prev, [setId]: new Set(allQuestionIds) };
      }
    });
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
    return minutes > 0
      ? `${minutes}m ${remainingSeconds}s`
      : `${remainingSeconds}s`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
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
          <Dep_Sidebar testsData={testsData} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Navbar */}
        <div className="bg-white">
          <Dep_Navbar setSidebarOpen={setSidebarOpen} />
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
          <div className="flex items-center gap-3">
            {mcqSets.length > 0 && (
              <button
                onClick={handleClearAll}
                className="text-red-600 hover:text-red-800 flex items-center space-x-1 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear All</span>
              </button>
            )}
            {/* Export Selected Button */}
            <button
              onClick={handleExport}
              className="ml-2 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded flex items-center text-sm"
              disabled={
                !Object.values(selectedQuestions).some(
                  (set) => set && set.size > 0
                )
              }
              title="Export selected questions as JSON"
            >
              <Download className="w-4 h-4 mr-1" />
              Export Selected
            </button>
          </div>
        </div>

        {/* MCQ Generator Content */}
        <div className="flex-1 flex flex-col bg-white mx-5 mb-5 rounded-lg shadow-sm">
          {/* Content Header */}
          <div className="bg-white shadow-sm border-b px-6 py-4 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <FileQuestion className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-800">
                  Generate MCQ Questions
                </h2>
              </div>
              {mcqSets.length > 0 && (
                <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                  {mcqSets.length} set{mcqSets.length !== 1 ? "s" : ""}{" "}
                  generated
                </span>
              )}
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
                  either upload a PDF file or provide a topic manually. All your
                  generated MCQ sets will be preserved here.
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

            {/* Generated MCQ Sets */}
            {mcqSets.map((mcqSet) => (
              <McqSet
                key={mcqSet.id}
                mcqSet={mcqSet}
                selectedQuestions={selectedQuestions}
                collapsedSets={collapsedSets}
                onQuestionCheckbox={handleQuestionCheckbox}
                onSelectAllSet={handleSelectAllSet}
                onToggleSetCollapse={toggleSetCollapse}
                onDeleteSet={handleDeleteSet}
                formatTime={formatTime}
                formatDate={formatDate}
              />
            ))}

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

          {/* Input Area Component */}
          <InputAreaComponent
            topic={topic}
            setTopic={setTopic}
            difficulty={difficulty}
            setDifficulty={setDifficulty}
            numQuestions={numQuestions}
            setNumQuestions={setNumQuestions}
            questionType={questionType}
            setQuestionType={setQuestionType}
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            isGenerating={isGenerating}
            handleFileUpload={handleFileUpload}
            handleGenerate={handleGenerate}
          />
        </div>
      </div>
    </div>
  );
};

export default Dep_McqGenerator;