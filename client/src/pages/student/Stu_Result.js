import React, { useEffect, useState } from "react";
import Stu_SidebarViewResult from "../../components/student/viewresult/Stu_SidebarViewResult";
import Stu_Sidebar from "../../components/student/Stu_Sidebar";
import Stu_Navbar from "../../components/student/Stu_Navbar";
import axios from "axios";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

function Stu_Result() {
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState([]);
  const [exam, setExam] = useState([]);
  const [exam_id, setExamId] = useState(null);
  const [userEmail, setUserEmail] = useState("");
  const [totalMarks, setTotalMarks] = useState(0);
  const [obtainedMarks, setObtainedMarks] = useState(0);
  const [isPassed, setIsPassed] = useState(false);
  const [userName, setUserName] = useState("");
  const [error, setError] = useState(null);

  // Remove the single category state since we'll show per-question category

  // Fix the useLocation hook implementation
  const location = useLocation();
  const student_id = useSelector((state) => state.user.user.id);

  useEffect(() => {
    // Get the exam_id from location state
    if (location.state && location.state.exam_id) {
      setExamId(location.state.exam_id);
    }
  }, [location]);

  useEffect(() => {
    // Only fetch data when exam_id is available
    if (exam_id) {
      fetchData();
    }
  }, [exam_id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!student_id) {
        throw new Error("Student ID not found. Please log in again.");
      }

      const currentExamId = exam_id;
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

      const res = await axios.get(
        `${API_BASE_URL}/api/exams/results/correct-incorrect/${currentExamId}/${student_id}`,
        { withCredentials: true }
      );
      console.log(
        "Fetching data from:",
        `${API_BASE_URL}/api/exams/results/correct-incorrect/${currentExamId}/${student_id}`
      );
      console.log("API Response:", res.data);

      if (!res.data) {
        throw new Error("No data received from the API");
      }

      // Process the questions data but maintain original order
      let processedQuestions = [];

      if (res.data.questions && Array.isArray(res.data.questions)) {
        processedQuestions = res.data.questions.map(processQuestion);
        setQuestions(processedQuestions);
      } else if (Array.isArray(res.data)) {
        // If the API returns an array directly
        processedQuestions = res.data.map(processQuestion);
        setQuestions(processedQuestions);
      } else {
        console.error("Unexpected API response format:", res.data);
        setError("Unexpected data format received from the server");
        setQuestions([]);
      }

      // Set other data from response if available
      if (res.data.exam) setExam(Array.isArray(res.data.exam) ? res.data.exam : [res.data.exam]);
      if (res.data.exam_id) setExamId(res.data.exam_id);
      if (res.data.userEmail) setUserEmail(res.data.userEmail);
      if (res.data.totalMarks !== undefined) setTotalMarks(res.data.totalMarks);
      if (res.data.obtainedMarks !== undefined) setObtainedMarks(res.data.obtainedMarks);
      if (res.data.isPassed !== undefined) setIsPassed(res.data.isPassed);
      if (res.data.userName) setUserName(res.data.userName);

      // If we have questions, make sure currentQuestionIndex is in range
      if (processedQuestions.length > 0) {
        setCurrentQuestionIndex(0);
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      setError(`Failed to load data: ${error.message}`);
      setQuestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Process question data without changing order
  const processQuestion = (question) => {
    // Preserve the original question and just add necessary fields
    const processed = { ...question };

    // Ensure questionText is available
    processed.questionText = question.question_text || question.questionText;

    // Ensure question_id is available
    processed.question_id = question.question_id || question.questionId || question.id || 0;

    // Ensure category is preserved from the original question
    processed.category = question.category || "TEST";

    // Determine the question type
    processed.questionType = question.question_type || question.questionType || "mcq";

    // For text type questions
    if (processed.questionType === "text") {
      processed.textAnswer = question.text_answer || question.textAnswer || "";
      processed.correctTextAnswer =
        question.correct_text_answer || question.correctTextAnswer || "";

      // Use isCorrect from backend if available, otherwise fall back to comparison
      processed.isCorrect =
        question.isCorrect !== undefined
          ? question.isCorrect
          : processed.textAnswer.trim().toLowerCase() ===
            processed.correctTextAnswer.trim().toLowerCase();

      // Mark as unanswered if textAnswer is empty
      processed.isUnanswered = !processed.textAnswer || processed.textAnswer.trim() === "";

      return processed;
    }

    // Determine if this is a multiple answer question
    processed.isMultipleAnswer =
      question.isMultipleAnswer ||
      question.is_multiple_answer ||
      Array.isArray(question.correct_answer) ||
      Array.isArray(question.correctAnswer);

    // Handle selected option(s)
    if (processed.isMultipleAnswer) {
      // Handle multiple answers - ensure it's always an array
      if (Array.isArray(question.selected_response)) {
        processed.selectedOptions = question.selected_response;
      } else if (Array.isArray(question.selectedOption)) {
        processed.selectedOptions = question.selectedOption;
      } else if (Array.isArray(question.selectedAnswer)) {
        processed.selectedOptions = question.selectedAnswer;
      } else if (question.selected_response) {
        // Convert single response to array for consistency
        processed.selectedOptions = [question.selected_response];
      } else if (question.selectedOption) {
        processed.selectedOptions = [question.selectedOption];
      } else if (question.selectedAnswer) {
        processed.selectedOptions = [question.selectedAnswer];
      } else {
        processed.selectedOptions = [];
      }
    } else {
      // Single answer question
      processed.selectedOption =
        question.selected_response !== undefined
          ? question.selected_response
          : question.selectedOption !== undefined
            ? question.selectedOption
            : question.selectedAnswer;
    }

    // Ensure correct handling of unanswered questions
    if (processed.isMultipleAnswer) {
      processed.isUnanswered = !processed.selectedOptions || processed.selectedOptions.length === 0;
    } else {
      processed.isUnanswered =
        processed.selectedOption === null ||
        processed.selectedOption === undefined ||
        processed.selectedOption === "";
    }

    // Handle correct answer(s)
    if (processed.isMultipleAnswer) {
      // For multiple answer questions
      if (Array.isArray(question.correct_answer)) {
        processed.correctAnswers = question.correct_answer;
      } else if (Array.isArray(question.correctAnswer)) {
        processed.correctAnswers = question.correctAnswer;
      } else if (Array.isArray(question.correctOptions)) {
        processed.correctAnswers = question.correctOptions;
      } else {
        // Fallback to empty array if no correct answers found
        processed.correctAnswers = [];
        console.warn("Multiple answer question without correct answers array:", question);
      }
    } else {
      // For single answer questions
      processed.correctAnswer =
        question.correct_answer !== undefined
          ? question.correct_answer
          : question.correctAnswer !== undefined
            ? question.correctAnswer
            : question.correctOption;
    }

    // Handle options - convert array to object if needed
    if (!processed.options && question.options && Array.isArray(question.options)) {
      const optionsObj = {};
      // Map numeric array to letter keys: [92, 96, 98, 100] → {'a': 92, 'b': 96, ...}
      question.options.forEach((value, index) => {
        const key = String.fromCharCode(97 + index); // 'a', 'b', 'c', 'd'
        optionsObj[key] = value;
      });
      processed.options = optionsObj;
    }

    return processed;
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleQuestionNavigation = (index) => {
    setCurrentQuestionIndex(index);
  };

  const examName = exam.find((e) => e.exam_id === Number(exam_id))?.exam_name || "Test";

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading results...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500">
          <p>Error: {error}</p>
          <button onClick={fetchData} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-screen overflow-y-hidden">
        <div>
          <Stu_Navbar hideTitle={true} />
        </div>

        <div className="flex">
          <Stu_Sidebar />

          <div className="w-9/12 h-screen px-8 py-6 bg-[#F5F6F8] ml-0 md:ml-64">
            <div className="flex flex-start ">
            <button
              className="text-blue-500 flex items-center hover:text-blue-700 mr-4 mt-0 mb-2"
              onClick={() => window.history.back()}
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
             
            </button>
            {/* Display the category of the current question, not a global category */}
            {questions.length > 0 && (
              <h1 className="text-5xl font-bold text-black sm:text-base  uppercase mb-2">
                {questions[currentQuestionIndex]?.category || "TEST"}
              </h1>
            )}
           </div>

            {exam
              ?.filter((examItem) => examItem.exam_id === Number(exam_id))
              .map((examItem) => (
                <h1 key={examItem.exam_id} className="text-xl font-bold text-gray-800 mb-4">
                  {examItem.exam_name}
                </h1>
              ))}
            <div className="relative bg-white p-6 rounded-xl shadow-lg h-5/6 mt-4 overflow-hidden">
              {questions.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-black select-none">
                      {currentQuestionIndex + 1}.{" "}
                      {questions[currentQuestionIndex]?.questionText ||
                        questions[currentQuestionIndex]?.question_text ||
                        "Question not available"}
                    </h2>
                    {questions[currentQuestionIndex]?.isMultipleAnswer && (
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Multiple Answer Question
                      </span>
                    )}
                    {questions[currentQuestionIndex]?.questionType === "text" && (
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Text Answer Question
                      </span>
                    )}
                  </div>

                  {/* Text type question display */}
                  {questions[currentQuestionIndex]?.questionType === "text" ? (
                    <div className="space-y-4">
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Your Answer:
                        </label>
                        <div className="p-3 bg-gray-50 rounded-lg border border-gray-300 min-h-[100px]">
                          {questions[currentQuestionIndex].textAnswer ? (
                            <p className="text-gray-900">
                              {questions[currentQuestionIndex].textAnswer}
                            </p>
                          ) : (
                            <p className="text-gray-400 italic">No answer provided</p>
                          )}
                        </div>
                      </div>

                      <div
                        className={`p-3 rounded-lg border flex items-center ${
                          questions[currentQuestionIndex].isUnanswered
                            ? "bg-gray-50 border-gray-300 text-gray-700"
                            : questions[currentQuestionIndex].isCorrect
                              ? "bg-green-50 border-green-300 text-green-700"
                              : "bg-red-50 border-red-300 text-red-700"
                        }`}
                      >
                        {questions[currentQuestionIndex].isUnanswered ? (
                          <>
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            <span>You did not answer this question</span>
                          </>
                        ) : questions[currentQuestionIndex].isCorrect ? (
                          <>
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            <span>Your answer is correct!</span>
                          </>
                        ) : (
                          <>
                            <svg
                              className="w-5 h-5 mr-2"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              ></path>
                            </svg>
                            <span>Your answer is incorrect</span>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {questions[currentQuestionIndex]?.options &&
                        Object.entries(questions[currentQuestionIndex].options).map(
                          ([key, value]) => {
                            const currentQuestion = questions[currentQuestionIndex];

                            // Handle display logic differently based on question type
                            if (currentQuestion.isMultipleAnswer) {
                              // Multiple answer question
                              const isSelected =
                                currentQuestion.selectedOptions &&
                                currentQuestion.selectedOptions.includes(key);
                              const isCorrectAnswer =
                                currentQuestion.correctAnswers &&
                                currentQuestion.correctAnswers.includes(key);

                              let checkboxClass =
                                "w-5 h-5 inline-block mr-2 rounded border border-gray-400 flex justify-center items-center";
                              let optionClass =
                                "flex items-center p-2 rounded-lg hover:bg-gray-100 transition cursor-default";
                              let symbol = "";

                              if (isSelected) {
                                if (isCorrectAnswer) {
                                  checkboxClass =
                                    "w-5 h-5 inline-block mr-2 rounded bg-green-500 text-white flex justify-center items-center";
                                  symbol = "✓";
                                  optionClass += " bg-green-50";
                                } else {
                                  checkboxClass =
                                    "w-5 h-5 inline-block mr-2 rounded bg-red-500 text-white flex justify-center items-center";
                                  symbol = "✗";
                                  optionClass += " bg-red-50";
                                }
                              } else if (isCorrectAnswer) {
                                // Highlight missed correct answers
                                checkboxClass =
                                  "w-5 h-5 inline-block mr-2 rounded bg-green-500 text-white flex justify-center items-center opacity-70";
                                symbol = "✓";
                                optionClass += " bg-green-50";
                              }

                              return (
                                <div key={key} className={optionClass}>
                                  <span className={checkboxClass}>
                                    <span className="text-xs font-bold">{symbol}</span>
                                  </span>
                                  <span className="ml-2">{value}</span>
                                  {isCorrectAnswer && !isSelected && (
                                    <span className="ml-2 text-sm text-green-600 font-medium">
                                      (Correct Answer - Missed)
                                    </span>
                                  )}
                                </div>
                              );
                            } else {
                              // Single answer question (existing logic)
                              const isSelected =
                                String(currentQuestion?.selectedOption) === String(key);
                              const isCorrectAnswer =
                                String(key) === String(currentQuestion?.correctAnswer);

                              let circleClass =
                                "w-5 h-5 inline-block mr-2 rounded-full border border-gray-400 flex justify-center items-center";
                              let optionClass =
                                "flex items-center p-2 rounded-lg hover:bg-gray-100 transition cursor-default";
                              let symbol = "";

                              if (isSelected) {
                                if (isCorrectAnswer) {
                                  circleClass =
                                    "w-5 h-5 inline-block mr-2 rounded-full bg-green-500 text-white flex justify-center items-center";
                                  symbol = "✓";
                                  optionClass += " bg-green-50";
                                } else {
                                  circleClass =
                                    "w-5 h-5 inline-block mr-2 rounded-full bg-red-500 text-white flex justify-center items-center";
                                  symbol = "✗";
                                  optionClass += " bg-red-50";
                                }
                              } else if (isCorrectAnswer) {
                                // Always highlight the correct answer
                                circleClass =
                                  "w-5 h-5 inline-block mr-2 rounded-full bg-green-500 text-white flex justify-center items-center";
                                symbol = "✓";
                                optionClass += " bg-green-50";
                              }

                              return (
                                <div key={key} className={optionClass}>
                                  <span className={circleClass}>
                                    <span className="text-xs font-bold">{symbol}</span>
                                  </span>
                                  <span className="ml-2">{value}</span>
                                  {isCorrectAnswer && !isSelected && (
                                    <span className="ml-2 text-sm text-green-600 font-medium">
                                      (Correct Answer)
                                    </span>

                                  )}
                                </div>
                              );
                            }
                          }
                        )}
                    </div>
                  )}

                  {/* Question type explanation */}
                  {questions[currentQuestionIndex]?.isMultipleAnswer && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        <strong>Note:</strong> This question requires multiple correct answers. All
                        correct answers are highlighted in green.
                      </p>
                    </div>
                  )}

                 

                  <div className="absolute bottom-5 w-full left-0 flex justify-between px-6">
                    <button
                      className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300"
                      disabled={currentQuestionIndex === 0}
                      onClick={handlePreviousQuestion}
                    >
                      Previous
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
                      disabled={currentQuestionIndex === questions.length - 1}
                      onClick={handleNextQuestion}
                    >
                      Next
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <p>No questions available for this exam.</p>
                  <button
                    onClick={fetchData}
                    className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                  >
                    Retry Loading Questions
                  </button>
                </div>
              )}
            </div>
          </div>

          <Stu_SidebarViewResult
            name={examName}
            questions={questions}
            currentIndex={currentQuestionIndex}
            onQuestionClick={handleQuestionNavigation}
            totalMarks={totalMarks}
            obtainedMarks={obtainedMarks}
            isPassed={isPassed}
            userName={userName || "Student"}
            currentExamId={exam_id}
            student_id={student_id}
            API_BASE_URL={process.env.REACT_APP_BACKEND_BASE_URL}
          />
        </div>
      </div>
    </>
  );
}

export default Stu_Result;
