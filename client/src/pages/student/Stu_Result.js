import React, { useEffect, useState } from 'react';
import Stu_SidebarViewResult from '../../components/student/viewresult/Stu_SidebarViewResult';
import Stu_Sidebar from '../../components/student/Stu_Sidebar';
import Stu_Navbar from '../../components/student/Stu_Navbar';
import axios from 'axios';

function Stu_Result() {
    const [loading, setLoading] = useState(true);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState([]);
    const [exam, setExam] = useState([]);
    const [examId, setExamId] = useState(74); // Default value as in your API call
    const [userEmail, setUserEmail] = useState('');
    const [totalMarks, setTotalMarks] = useState(0);
    const [obtainedMarks, setObtainedMarks] = useState(0);
    const [isPassed, setIsPassed] = useState(false);
    const [userName, setUserName] = useState('');
    const [error, setError] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const student_id = 524;
            const currentExamId = 74;
            const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
            
            console.log('Fetching data from:', `${API_BASE_URL}/api/exams/results/correct-incorrect/${currentExamId}/${student_id}`);
            
            const res = await axios.get(
                `${API_BASE_URL}/api/exams/results/correct-incorrect/${currentExamId}/${student_id}`,
                { withCredentials: true }
            );
            
            console.log('API Response:', res.data);
            
            if (!res.data) {
                throw new Error('No data received from the API');
            }
            
            // Process and enhance the questions data with selected and correct options
            let processedQuestions = [];
            
            if (res.data.questions && Array.isArray(res.data.questions)) {
                processedQuestions = res.data.questions.map(question => {
                    // Ensure the question has selected_option and correct_option properties
                    return {
                        ...question,
                        selectedOption: question.selected_option || question.selectedOption || question.selectedAnswer,
                        correctAnswer: question.correct_option || question.correctAnswer || question.correctOption
                    };
                });
                setQuestions(processedQuestions);
            } else if (Array.isArray(res.data)) {
                // If the API returns an array directly
                processedQuestions = res.data.map(question => {
                    return {
                        ...question,
                        selectedOption: question.selected_option || question.selectedOption || question.selectedAnswer,
                        correctAnswer: question.correct_option || question.correctAnswer || question.correctOption
                    };
                });
                setQuestions(processedQuestions);
            } else {
                console.error('Unexpected API response format:', res.data);
                setError('Unexpected data format received from the server');
                setQuestions([]);
            }
            
            // Set other data from response if available
            if (res.data.exam) setExam(Array.isArray(res.data.exam) ? res.data.exam : [res.data.exam]);
            if (res.data.examId) setExamId(res.data.examId);
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
    
    useEffect(() => {
        fetchData();
    }, []);

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };
    
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    const handleQuestionNavigation = (index) => {
        setCurrentQuestionIndex(index);
    };

    const examName = exam.find(e => e.exam_id === Number(examId))?.exam_name || "Test";

    // Debug output
    console.log('Current state:', {
        loading,
        questionsCount: questions.length,
        currentQuestionIndex,
        currentQuestion: questions[currentQuestionIndex],
        error
    });

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
                    <button 
                        onClick={fetchData}
                        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (<>
    <div className='h-screen  overflow-y-hidden'>
    
    <div>
        <Stu_Navbar hideTitle={true} />
        </div>
      
        <div className="flex overflow-y-hidden ">
            
            <Stu_Sidebar />

            <div className="w-9/12 h-screen px-8 py-6 bg-[#F5F6F8] ml-64">
                <button className="text-blue-500 flex items-center hover:text-blue-700 mr-4">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                {exam
                    ?.filter((examItem) => examItem.exam_id === Number(examId))
                    .map((examItem) => (
                        <h1
                            key={examItem.exam_id}
                            className="text-xl font-bold text-gray-800 mb-4"
                        >
                            {examItem.exam_name}
                        </h1>
                    ))}
                <div className="relative bg-white p-6 rounded-xl shadow-lg h-5/6 mt-8 overflow-hidden">
                    
                    {questions.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-semibold text-black select-none">
                                    {currentQuestionIndex + 1}.{" "}
                                    {questions[currentQuestionIndex]?.question_text || 
                                     questions[currentQuestionIndex]?.questionText || 
                                     "Question not available"}
                                </h2>
                            </div>
                            <div className="space-y-4">
                                {questions[currentQuestionIndex]?.options && 
                                 Object.entries(questions[currentQuestionIndex].options).map(([key, value]) => {
                                    const currentQuestion = questions[currentQuestionIndex];
                                    const isSelected = currentQuestion?.selectedOption === key;
                                    const isCorrectAnswer = key === currentQuestion?.correctAnswer;
                                    const selectedWrongAnswer = isSelected && !isCorrectAnswer;
                                    
                                    let circleClass = "w-5 h-5 inline-block mr-2 rounded-full border border-gray-400 flex justify-center items-center";
                                    let symbol = "";

                                    if (isSelected) {
                                        if (isCorrectAnswer) {
                                            circleClass = circleClass.replace("border-gray-400", "bg-green-500 text-white");
                                            symbol = "✓";
                                        } else {
                                            circleClass = circleClass.replace("border-gray-400", "bg-red-500 text-white");
                                            symbol = "✗";
                                        }
                                    } else if (isCorrectAnswer && currentQuestion?.selectedOption && currentQuestion?.selectedOption !== key) {
                                        // Show correct answer if user selected wrong
                                        circleClass = circleClass.replace("border-gray-400", "bg-green-500 text-white");
                                        symbol = "✓";
                                    }

                                    return (
                                        <div
                                            key={key}
                                            className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition cursor-default"
                                        >
                                            <span className={circleClass}>
                                                <span className="text-xs">{symbol}</span>
                                            </span>
                                            <span className="ml-2">{value}</span>
                                            {isCorrectAnswer && currentQuestion?.selectedOption && currentQuestion?.selectedOption !== key && (
                                                <span className="ml-2 text-sm text-green-600 font-medium">
                                                    (Correct Answer)
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                                
                                {/* If options are not in the expected format, try alternatives */}
                                {(!questions[currentQuestionIndex]?.options && 
                                  questions[currentQuestionIndex]?.optionA) && (
                                    ['A', 'B', 'C', 'D'].map(optionKey => {
                                        const optionProperty = `option${optionKey}`;
                                        if (!questions[currentQuestionIndex][optionProperty]) return null;
                                        
                                        const currentQuestion = questions[currentQuestionIndex];
                                        const isSelected = currentQuestion?.selectedOption === optionKey || 
                                                          currentQuestion?.selectedAnswer === optionKey;
                                        const isCorrectAnswer = optionKey === currentQuestion?.correctAnswer;
                                        const selectedWrongAnswer = isSelected && !isCorrectAnswer;
                                        
                                        let circleClass = "w-5 h-5 inline-block mr-2 rounded-full border border-gray-400 flex justify-center items-center";
                                        let symbol = "";

                                        if (isSelected) {
                                            if (isCorrectAnswer) {
                                                circleClass = circleClass.replace("border-gray-400", "bg-green-500 text-white");
                                                symbol = "✓";
                                            } else {
                                                circleClass = circleClass.replace("border-gray-400", "bg-red-500 text-white");
                                                symbol = "✗";
                                            }
                                        } else if (isCorrectAnswer && currentQuestion?.selectedOption && currentQuestion?.selectedOption !== optionKey) {
                                            circleClass = circleClass.replace("border-gray-400", "bg-green-500 text-white");
                                            symbol = "✓";
                                        }

                                        return (
                                            <div
                                                key={optionKey}
                                                className="flex items-center p-2 rounded-lg hover:bg-gray-100 transition cursor-default"
                                            >
                                                <span className={circleClass}>
                                                    <span className="text-xs">{symbol}</span>
                                                </span>
                                                <span className="ml-2">{questions[currentQuestionIndex][optionProperty]}</span>
                                                {isCorrectAnswer && currentQuestion?.selectedOption && currentQuestion?.selectedOption !== optionKey && (
                                                    <span className="ml-2 text-sm text-green-600 font-medium">
                                                        (Correct Answer)
                                                    </span>
                                                )}
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                            <div className="absolute bottom-5 w-full flex justify-between">
                                <button
                                    className="px-4 py-2 bg-gray-500 text-white rounded-lg disabled:bg-gray-300"
                                    disabled={currentQuestionIndex === 0}
                                    onClick={handlePreviousQuestion}
                                >
                                    Previous
                                </button>
                                <button
                                    className="px-4 py-2 mr-10 bg-blue-500 text-white rounded-lg disabled:bg-gray-300"
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
            />
        </div>
        </div>
        </>
    );
}

export default Stu_Result;