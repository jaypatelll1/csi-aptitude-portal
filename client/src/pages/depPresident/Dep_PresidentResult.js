import React, { useState, useRef, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import Dep_PresidentViewResult from '../../components/depPresident/Dep_PresidentViewResult';
import Dep_PresidentNavbar from '../../components/depPresident/Dep_PresidentNavbar';
import Dep_PresidentSidebar from '../../components/depPresident/Dep_PresidentSidebar';
import Details from '../../components/NavbarDetails';

function Dep_PresidentResult() {
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [comment, setComment] = useState("");
    const [selectedOption, setSelectedOption] = useState("a");
    const [selectedMark, setSelectedMark] = useState(1);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);
    const detailsRef = useRef(null);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    
    const openDetails = () => setIsDetailsOpen(true);
    const closeDetails = () => setIsDetailsOpen(false);

    const [questions, setQuestions] = useState([
        {
            question_id: 60,
            questionText: "What is React.js and which domain is it used in?",
            options: {
                a: "Library, Web Dev",
                b: "Software, UI/UX",
                c: "Library, AI",
                d: "Framework, App Dev"
            },
            correctAnswer: "a"
        },
        // Additional questions would be added here
    ]);
    const [error, setError] = useState(null);

    const handleCommentChange = (e) => {
        setComment(e.target.value);
    };

    const handleOptionChange = (e) => {
        setSelectedOption(e.target.value);
    };

    const handleMarkSelection = (mark) => {
        setSelectedMark(mark);
    };

    const handleNextQuestion = () => {
        if (currentQuestionIndex < questions.length - 1) {
            // Save current question data
            console.log("Option selected:", selectedOption);
            console.log("Mark assigned:", selectedMark);
            console.log("Comment:", comment);
            
            // Move to next question
            setCurrentQuestionIndex(prev => prev + 1);
            
            // Reset form for next question
            setSelectedOption("a");
            setSelectedMark(1);
            setComment("");
        } else {
            alert("This is the last question. Data saved.");
        }
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

    useEffect(() => {
        // Close the Details component when clicking outside
        function handleClickOutside(event) {
            if (detailsRef.current && !detailsRef.current.contains(event.target)) {
                closeDetails();
            }
        }
    
        // Add event listener
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            // Cleanup the listener
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);
    
    const handlePreviousQuestion = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
            // Reset form for previous question
            setSelectedOption("a");
            setSelectedMark(1);
            setComment("");
        }
    };

    const handleQuestionNavigation = (index) => {
        setCurrentQuestionIndex(index);
        // Reset form for the selected question
        setSelectedOption("a");
        setSelectedMark(1);
        setComment("");
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

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className={`flex h-screen`}>
            {/* Sidebar */}
            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full bg-white text-white z-50 transform ${
                    sidebarOpen ? "translate-x-0" : "-translate-x-full xl:translate-x-0"
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
                <div className="h-screen w-full pt-2  px-8 mx-auto overflow-y-hidden bg-[#F5F6F8]">
                <div className="flex justify-between px-10 items-center mb-4">
                                <div className="flex items-center">
                                    <span className="font-semibold mr-2">Name:</span>
                                    <span>Shree Shinde</span>
                                </div>
                                <div className="flex items-center mt-1">
                                    <span className="font-semibold mr-2">Email-Id:</span>
                                    <span>shreeshinde-intf@dtharvacoe.ac.in</span>
                                </div>
                                <div>
                                    <div className="flex items-center">
                                        <span className="font-semibold mr-2">Branch:</span>
                                        <span>INFT</span>
                                    </div>
                                </div>
                            </div>
                            <h1 className="text-xl font-bold text-black px-10  mb-1">General Knowledge</h1>
                    <div className="px-1 py-2 h-full flex ">
                        {/* Main content area */}
                        
                        <div className="w-full md:w-9/12 h-screen px-6  bg-[#F5F6F8]">
                           
                        
                            
                            
                            <div className="bg-white p-6 rounded-lg shadow-md h-5/6 mt-2 overflow-hidden">
                                {questions.length > 0 ? (
                                    <>
                                        <h2 className="text-lg font-semibold text-black select-none mb-6">
                                            {currentQuestion.question_id}. {currentQuestion.questionText}
                                        </h2>
                                        
                                        <div className="space-y-4 mb-8">
                                            {currentQuestion.options && 
                                            Object.entries(currentQuestion.options).map(([key, value]) => {
                                                const isSelected = selectedOption === key;
                                                
                                                let circleClass = "w-5 h-5 inline-block mr-2 rounded-full border border-gray-400 flex justify-center items-center";
                                                let optionClass = "flex items-center p-2 rounded-lg hover:bg-gray-100 transition";
                                                let symbol = "";

                                                if (isSelected) {
                                                    circleClass = "w-5 h-5 inline-block mr-2 rounded-full bg-blue-500 text-white flex justify-center items-center";
                                                    symbol = "✓";
                                                    optionClass += " bg-blue-50";
                                                }

                                                return (
                                                    <div key={key} className={optionClass}>
                                                        <input 
                                                            type="radio" 
                                                            id={`option-${key}`} 
                                                            name="question-option" 
                                                            value={key}
                                                            checked={isSelected}
                                                            onChange={handleOptionChange}
                                                            className="hidden" 
                                                        />
                                                        <label htmlFor={`option-${key}`} className="flex items-center w-full cursor-pointer">
                                                            <span className={circleClass}>
                                                                <span className="text-xs font-bold">{symbol}</span>
                                                            </span>
                                                            <span className="ml-2">{value}</span>
                                                        </label>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        
                                        {/* Comment and Marks sections side by side */}
                                        <div className="flex justify-end items-end mt-16 mb-2">
                                            {/* Comment section (left) */}
                                            <div className="flex-grow mr-4">
                                                <p className="font-bold mb-2">Comment:</p>
                                                <textarea 
                                                    className="w-full border border-gray-300 rounded-xl p-2" 
                                                    rows="3"
                                                    placeholder="Type your comment here ..."
                                                    value={comment}
                                                    onChange={handleCommentChange}
                                                ></textarea>
                                            </div>
                                            
                                            {/* Marks section (right) */}
                                            <div className="text-center">
                                                <p className="font-bold pt-20 text-center">Marks</p>
                                                <div className="space-y-2">
                                                    {[1, 2, 3, 4, 5].map((mark) => (
                                                        <button 
                                                            key={mark}
                                                            className={`w-12 h-10 rounded mx-auto block ${selectedMark === mark ? 'bg-blue-600 text-white' : 'bg-gray-200 text-black'}`}
                                                            onClick={() => handleMarkSelection(mark)}
                                                        >
                                                            {mark}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="flex justify-between mt-8">
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
                                                Save and Next
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <p>No questions available for this exam.</p>
                                        <button 
                                            onClick={() => setQuestions([...questions])}
                                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                                        >
                                            Retry Loading Questions
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Right sidebar for question navigation */}
                        <div className="hidden md:block pl-4 pt-2 md:w-3/12">
                            <Dep_PresidentViewResult 
                                questions={questions}
                                currentIndex={currentQuestionIndex}
                                onQuestionClick={handleQuestionNavigation}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dep_PresidentResult;