import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Dep_PresidentViewResult from "../../components/depPresident/Dep_PresidentViewResult";
import Dep_PresidentSidebar from "../../components/depPresident/Dep_PresidentSidebar";
import Details from "../../components/NavbarDetails";
import axios from "axios";
import { Loader } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { FetchTeacherExam } from "../../redux/TeacherExamSlice";
import { storeComments } from "../../redux/TeacherExamSlice";

function Dep_PresidentResult() {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [comment, setComment] = useState("");
  const [selectedOption, setSelectedOption] = useState("a");
  const [selectedMark, setSelectedMark] = useState(1);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [Saving, setSaving] = useState(false);
  const [savedQuestions, setSavedQuestions] = useState([]);
  const sidebarRef = useRef(null);
  const detailsRef = useRef(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);
  const commentRef = useRef(null);

  const teacher_id = location.state?.teacher.teacher_id;
  const exam_id = location.state?.exam_id;
  const exam_name = location.state?.exam_name;
  const [teacherData, setTeacherData] = useState({});
  const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
  const ExamData = useSelector((state) => state.teacherExam.AllExams);
  const AllComments = useSelector((state) => state.teacherExam.comments);

  const dispatch = useDispatch();

  useEffect(() => {
    if (location.state?.teacher) {
      setTeacherData(location.state.teacher);
    }
  }, [location.state?.teacher]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await dispatch(FetchTeacherExam({ exam_id, teacher_id })).unwrap();
    } catch (error) {
      setError("An error occurred. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teacher_id && exam_id) {
      fetchData();
    }
  }, [teacher_id, exam_id, ExamData.length === 0]);

  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value);
  };

  const handleMarkSelection = (mark) => {
    setSelectedMark(mark);
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex >= ExamData.length) {
      alert("This is the last question. Data saved.");
      return;
    }

    const currentQuestion = ExamData[currentQuestionIndex];

    let marksAllotted = 0;

    if (currentQuestion.question_type === "text") {
      marksAllotted = selectedMark;
    } else {
      const correctAnswer = currentQuestion.correct_answer;
      const selectedResponse = currentQuestion.selected_response;

      const areEqual = (a, b) => {
        if (a === null || b === null) return false;
        if (typeof a === "string" && typeof b === "string") return a === b;
        if (Array.isArray(a) && Array.isArray(b))
          return a.length === b.length && a.sort().join(",") === b.sort().join(",");
        if (typeof a === "string" && Array.isArray(b)) return b.includes(a);
        if (typeof b === "string" && Array.isArray(a)) return a.includes(b);
        return false;
      };

      marksAllotted = areEqual(correctAnswer, selectedResponse) ? 1 : 0;
    }

    try {
      setSaving(true);
      const response = await axios.post(
        `${API_BASE_URL}/api/exams/teacher-results/create-result/${exam_id}/${currentQuestion.question_id}`,
        {
          teacher_id,
          marks_allotted: marksAllotted,
          max_score: currentQuestion.question_type === "text" ? 5 : 1,
          comments: comment,
        },
        { withCredentials: true }
      );

      // Add the current question to saved questions
      setSavedQuestions(prev => [...prev, currentQuestion.question_id]);

      dispatch(storeComments({ question_id: currentQuestion.question_id, comment: comment }));
    } catch (error) {
      console.error("Error submitting response:", error);
    } finally {
      setSaving(false);
    }

    if (currentQuestionIndex === ExamData.length - 1) {
      alert("This was the last question. Data saved.");
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedMark(1);
    setComment("");
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

  useEffect(() => {
    function handleClickOutside(event) {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        closeDetails();
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setSelectedOption("a");
      setSelectedMark(1);
      setComment("");
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
    setSelectedOption("a");
    setSelectedMark(1);
    setComment("");
  };

  useEffect(() => {
    const existingComment = AllComments.find((c) => c.question_id === currentQuestion?.question_id);
    setComment(existingComment ? existingComment.comment : "");
  }, [currentQuestionIndex]);

  const renderQuestionOptions = () => {
    // For text questions, return null
    if (currentQuestion.question_type === "text") {
      return null;
    }

    // Ensure we have options to render for non-text questions
    if (!currentQuestion.options) {
      return (
        <div className="text-red-500 font-semibold">
          No options available for this question
        </div>
      );
    }

    return Object.entries(currentQuestion.options).map(([key, value]) => {
      const correctAnswers = Array.isArray(currentQuestion.correct_answer)
        ? currentQuestion.correct_answer
        : [currentQuestion.correct_answer];

      const selectedResponses = Array.isArray(currentQuestion.selected_response)
        ? currentQuestion.selected_response
        : [currentQuestion.selected_response];

      // Determine option status
      const isCorrect = correctAnswers.includes(key);
      const isSelected = selectedResponses.includes(key);
      const isUnattempted = !currentQuestion.selected_response;

      // Set classes based on option status
      let circleClass = "w-5 h-5 inline-block mr-2 rounded-full border border-gray-400 flex justify-center items-center";
      let optionClass = "flex items-center p-2 rounded-lg hover:bg-gray-100 transition";
      let symbol = "";

      // Styling for correct answer
      if (isCorrect) {
        circleClass = "w-5 h-5 inline-block mr-2 rounded-full bg-green-500 text-white flex justify-center items-center";
        symbol = "✓";
        optionClass += " bg-green-50";
      }

      // Styling for incorrect selected answer
      if (isSelected && !isCorrect) {
        circleClass = "w-5 h-5 inline-block mr-2 rounded-full bg-red-500 text-white flex justify-center items-center";
        symbol = "✗";
        optionClass += " bg-red-50";
      }

      // Additional styling for unattempted questions
      if (isUnattempted) {
        optionClass += " opacity-50";
      }

      return (
        <div key={key} className={optionClass}>
          <input
            type={currentQuestion.question_type === "multiple_choice" ? "checkbox" : "radio"}
            id={`option-${key}`}
            name="question-option"
            value={key}
            readOnly
            checked={isSelected}
            className="hidden"
          />
          <label
            htmlFor={`option-${key}`}
            className="flex items-center w-full cursor-pointer"
          >
            <span className={circleClass}>
              <span className="text-xs font-bold">{symbol}</span>
            </span>
            <span className="ml-2">{value}</span>
          </label>
        </div>
      );
    });
  };

  const renderQuestionStatus = () => {
    // For text questions, handle attempted/not attempted status
    if (currentQuestion.question_type === "text") {
      if (!currentQuestion.selected_response || currentQuestion.selected_response.trim() === '') {
        return (
          <div className="mb-4 text-red-600 font-semibold">
            Not Attempted
          </div>
        );
      }
      return (
        <div className="mb-4 text-green-600 font-semibold">
          Answer: {currentQuestion.selected_response}
        </div>
      );
    }
    
    // For non-text questions, keep existing logic
    const { selected_response, correct_answer } = currentQuestion;
    
    if (!selected_response) {
      return (
        <div className="mb-4 text-red-600 font-semibold">
          Unattempted Question
        </div>
      );
    }

    // Check if the selected response matches the correct answer
    const correctAnswers = Array.isArray(correct_answer)
      ? correct_answer
      : [correct_answer];
    const selectedResponses = Array.isArray(selected_response)
      ? selected_response
      : [selected_response];

    const isCorrect = correctAnswers.some(ans =>
      selectedResponses.includes(ans)
    );

    return (
      <div className={`mb-4 font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
        {isCorrect ? 'Correct Answer' : 'Incorrect Answer'}
      </div>
    );
  };

  const renderCorrectAnswer = () => {
    const { correct_answer, options, question_type, selected_response } = currentQuestion;

    // Handle different types of correct answers
    if (question_type === "text") {
      return;
    }

    if (!correct_answer) return;

    // Multiple or single choice
    if (Array.isArray(correct_answer)) {
      return correct_answer
        .map(ans => options[ans] || ans)
        .join(", ");
    }

    return options[correct_answer] || correct_answer;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading questions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">
          <p>Error: {error}</p>
          <button
            onClick={() => setError(null)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = ExamData[currentQuestionIndex];

  return (
    <div className={`flex h-screen`}>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-white text-white z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
          } transition-transform duration-300 w-64 xl:block`}
      >
        <Dep_PresidentSidebar />
      </div>

      {/* Main Section */}
      <div
        id="main-section"
        className={`bg-white h-max w-full overflow-hidden transition-all duration-300 xl:ml-64`}
      >
        {/* Top Bar */}
        <div className="bg-white h-14 border-b border-gray-200 flex items-center">
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
          <div
            className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm hover:cursor-pointer"
            onClick={openDetails}
          >
            AM
          </div>
          <div ref={detailsRef}>{isDetailsOpen && <Details />}</div>
        </div>

        {/* Main Content - always full width */}
        <div className="h-screen w-full pt-2 px-8 mx-auto overflow-y-hidden bg-[#F5F6F8]">
          <div className="flex justify-between px-10 items-center my-2">
            <div className="flex items-center">
              <span className="font-semibold mr-2">Name:</span>
              <span>{teacherData.name}</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-black px-10 mb-1">{exam_name}</h1>
            </div>
            <div className="flex items-center mt-1">
              <span className="font-semibold mr-2">Email-Id:</span>
              <span>{teacherData.email}</span>
            </div>
          </div>

          <div className="px-1 py-2 h-full flex">
            {/* Main content area */}
            <div className="w-full md:w-9/12 h-screen px-6 bg-[#F5F6F8]">
              <div className="bg-white p-6 rounded-lg shadow-md h-5/6 mt-2 overflow-hidden flex flex-col">
                {ExamData.length > 0 ? (
                  <>
                    {/* Question and options section */}
                    <div className="flex-grow overflow-auto">
                      <h2 className="text-lg font-semibold text-black select-none mb-6">
                        {currentQuestionIndex + 1}. {currentQuestion.question_text}
                      </h2>

                      {/* Add question status indicator */}
                      {renderQuestionStatus()}

                      <div className="space-y-4 mb-8">
                        {renderQuestionOptions()}
                      </div>

                      {/* Conditionally show correct answer only for unattempted or incorrect questions */}
                      {(currentQuestion.question_type !== "text" && 
                        (!currentQuestion.selected_response ||
                        (currentQuestion.selected_response &&
                          !renderQuestionStatus()?.props?.className?.includes('text-green-600')))) ? (
                            <div className="mt-4 text-green-600">
                              <strong>Correct Answer:</strong> {renderCorrectAnswer()}
                            </div>
                         
                      ) : null}
                    </div>

                    {/* Comment section - only for text questions */}
                    {currentQuestion.question_type === "text" && (
                      <div className="mt-4 flex justify-end items-end">
                        {/* Comment section (left) */}
                        <div className="flex-grow mr-4 relative">
                          <p className="font-bold mb-2">Comment:</p>
                          <textarea
                            ref={commentRef}
                            className="w-full border border-gray-300 rounded-xl p-2 resize-y max-h-[350px] min-h-[250px]"
                            rows="3"
                            placeholder="Type your comment here ..."
                            value={comment}
                            onChange={handleCommentChange}
                          ></textarea>
                        </div>

                        {/* Marks section (right, vertical) */}
                        <div className="flex flex-col ml-4">
                          <p className="font-bold mb-2">Allot Marks:</p>
                          <div className="flex flex-col space-y-2">
                            {[0,1, 2, 3, 4, 5].map((mark) => (
                              <button
                                key={mark}
                                className={`px-3 py-2 rounded-lg text-white transition w-full ${selectedMark == mark ? "bg-blue-700" : "bg-blue-500"
                                  }`}
                                onClick={() => setSelectedMark(mark)}
                              >
                                {mark}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Navigation buttons - now fixed at bottom */}
                    <div className="flex justify-between mt-4 mb-2">
                      <button
                        className="px-4 py-2 bg-gray-300 text-black rounded-lg"
                        onClick={handlePreviousQuestion}
                        disabled={currentQuestionIndex === 0}
                      >
                        Previous
                      </button>
                      <button
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg"
                        onClick={handleNextQuestion}
                      >
                        {Saving ? (
                          <div className="flex items-center">
                            <Loader className="animate-spin mr-2" /> Saving...
                          </div>
                        ) : (
                          "Save & Next"
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <p>No questions available for this exam.</p>
                    <button
                      onClick={() => fetchData()}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                      Retry Loading Questions
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="hidden md:block pl-4 pt-2 md:w-3/12">
              <Dep_PresidentViewResult
                questions={ExamData}
                currentIndex={currentQuestionIndex}
                onQuestionClick={handleQuestionNavigation}
                currentExamId={exam_id}
                teacher_id={teacher_id}
                API_BASE_URL={API_BASE_URL}
                name={exam_name}
                savedQuestions={savedQuestions}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dep_PresidentResult;