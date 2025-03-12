import React, { useState } from 'react';
import Stu_SidebarViewResult from '../../components/student/viewresult/Stu_SidebarViewResult';

// First define the questions array separately
const questionsData = [
    {
        question_id: 1,
        question_text: "What is the capital city of Brazil?",
        options: { A: "Rio de Janeiro", B: "São Paulo", C: "Brasília", D: "Salvador" },
        correctAnswer: "C"
    },
    {
        question_id: 2,
        question_text: "Which planet is known as the Red Planet?",
        options: { A: "Venus", B: "Mars", C: "Jupiter", D: "Saturn" },
        correctAnswer: "B"
    },
    {
        question_id: 3,
        question_text: "Who painted the Mona Lisa?",
        options: { A: "Vincent van Gogh", B: "Pablo Picasso", C: "Leonardo da Vinci", D: "Michelangelo" },
        correctAnswer: "C"
    },
    {
        question_id: 4,
        question_text: "What is the largest ocean on Earth?",
        options: { A: "Atlantic", B: "Indian", C: "Arctic", D: "Pacific" },
        correctAnswer: "D"
    },
    {
        question_id: 5,
        question_text: "In which year did World War II end?",
        options: { A: "1942", B: "1945", C: "1947", D: "1950" },
        correctAnswer: "B"
    },
    {
        question_id: 6,
        question_text: "What is the chemical symbol for gold?",
        options: { A: "Au", B: "Ag", C: "Fe", D: "Cu" },
        correctAnswer: "A"
    },
    {
        question_id: 7,
        question_text: "Which country is home to the kangaroo?",
        options: { A: "New Zealand", B: "South Africa", C: "Australia", D: "India" },
        correctAnswer: "C"
    },
    {
        question_id: 8,
        question_text: "Who wrote 'Romeo and Juliet'?",
        options: { A: "Charles Dickens", B: "William Shakespeare", C: "Jane Austen", D: "Mark Twain" },
        correctAnswer: "B"
    },
    {
        question_id: 9,
        question_text: "What is the tallest mountain in the world?",
        options: { A: "K2", B: "Everest", C: "Kilimanjaro", D: "Denali" },
        correctAnswer: "B"
    },
    {
        question_id: 10,
        question_text: "Which gas is most abundant in Earth's atmosphere?",
        options: { A: "Oxygen", B: "Carbon Dioxide", C: "Nitrogen", D: "Hydrogen" },
        correctAnswer: "C"
    },
    {
        question_id: 11,
        question_text: "What is the currency of Japan?",
        options: { A: "Yuan", B: "Yen", C: "Won", D: "Dollar" },
        correctAnswer: "B"
    },
    {
        question_id: 12,
        question_text: "Which element has the atomic number 1?",
        options: { A: "Helium", B: "Hydrogen", C: "Lithium", D: "Oxygen" },
        correctAnswer: "B"
    },
    {
        question_id: 13,
        question_text: "Who discovered penicillin?",
        options: { A: "Alexander Fleming", B: "Louis Pasteur", C: "Marie Curie", D: "Gregor Mendel" },
        correctAnswer: "A"
    },
    {
        question_id: 14,
        question_text: "What is the largest desert in the world?",
        options: { A: "Sahara", B: "Gobi", C: "Antarctic", D: "Kalahari" },
        correctAnswer: "C"
    },
    {
        question_id: 15,
        question_text: "Which river is the longest in the world?",
        options: { A: "Amazon", B: "Nile", C: "Yangtze", D: "Mississippi" },
        correctAnswer: "B"
    },
    {
        question_id: 16,
        question_text: "What is the main ingredient in guacamole?",
        options: { A: "Tomato", B: "Avocado", C: "Pepper", D: "Onion" },
        correctAnswer: "B"
    },
    {
        question_id: 17,
        question_text: "Which country hosted the 2016 Summer Olympics?",
        options: { A: "China", B: "Brazil", C: "UK", D: "USA" },
        correctAnswer: "B"
    },
    {
        question_id: 18,
        question_text: "What is the smallest country in the world?",
        options: { A: "Monaco", B: "Vatican City", C: "Liechtenstein", D: "San Marino" },
        correctAnswer: "B"
    },
    {
        question_id: 19,
        question_text: "Who invented the telephone?",
        options: { A: "Thomas Edison", B: "Alexander Graham Bell", C: "Nikola Tesla", D: "Guglielmo Marconi" },
        correctAnswer: "B"
    },
    {
        question_id: 20,
        question_text: "What is the primary source of energy for Earth?",
        options: { A: "Moon", B: "Sun", C: "Wind", D: "Geothermal" },
        correctAnswer: "B"
    },
    {
        question_id: 21,
        question_text: "Which continent is the largest by land area?",
        options: { A: "Africa", B: "Asia", C: "Australia", D: "Europe" },
        correctAnswer: "B"
    },
    {
        question_id: 22,
        question_text: "What gas do plants primarily use for photosynthesis?",
        options: { A: "Oxygen", B: "Carbon Dioxide", C: "Nitrogen", D: "Hydrogen" },
        correctAnswer: "B"
    },
    {
        question_id: 23,
        question_text: "Who was the first person to walk on the moon?",
        options: { A: "Buzz Aldrin", B: "Neil Armstrong", C: "Yuri Gagarin", D: "John Glenn" },
        correctAnswer: "B"
    },
    {
        question_id: 24,
        question_text: "What is the hardest natural substance known?",
        options: { A: "Gold", B: "Iron", C: "Diamond", D: "Quartz" },
        correctAnswer: "C"
    },
    {
        question_id: 25,
        question_text: "Which country has the most population?",
        options: { A: "India", B: "China", C: "USA", D: "Russia" },
        correctAnswer: "A"
    },
    {
        question_id: 26,
        question_text: "What is the boiling point of water in Celsius?",
        options: { A: "0", B: "50", C: "100", D: "150" },
        correctAnswer: "C"
    },
    {
        question_id: 27,
        question_text: "Which animal is known as the 'King of the Jungle'?",
        options: { A: "Tiger", B: "Lion", C: "Elephant", D: "Gorilla" },
        correctAnswer: "B"
    },
    {
        question_id: 28,
        question_text: "What is the largest organ in the human body?",
        options: { A: "Liver", B: "Skin", C: "Heart", D: "Brain" },
        correctAnswer: "B"
    },
    {
        question_id: 29,
        question_text: "Which scientist proposed the theory of relativity?",
        options: { A: "Isaac Newton", B: "Albert Einstein", C: "Galileo Galilei", D: "Stephen Hawking" },
        correctAnswer: "B"
    },
    {
        question_id: 30,
        question_text: "What is the capital of France?",
        options: { A: "Paris", B: "London", C: "Berlin", D: "Madrid" },
        correctAnswer: "A"
    }
].map(q => {
    const options = ['A', 'B', 'C', 'D'];
    const isAnswerCorrect = Math.random() > 0.5; // 50% chance of correct/incorrect
    let selectedOption = null;
    let isCorrect = false;
    let isIncorrect = false;

    if (isAnswerCorrect) {
        selectedOption = q.correctAnswer;
        isCorrect = true;
    } else {
        const wrongOptions = options.filter(opt => opt !== q.correctAnswer);
        selectedOption = wrongOptions[Math.floor(Math.random() * 3)];
        isIncorrect = true;
    }

    return {
        ...q,
        selectedOption,
        isCorrect,
        isIncorrect
    };
});

// Now define dummyData using the processed questions
const dummyData = {
    questions: questionsData,
    exam: [
        { exam_id: 1, exam_name: "General Knowledge" }
    ],
    examId: "1",
    userEmail: "akshay.manjrekar@example.com",
    totalMarks: 30,
    obtainedMarks: questionsData.reduce((acc, q) => acc + (q.isCorrect ? 1 : q.isIncorrect ? -0.5 : 0), 0),
    isPassed: questionsData.filter(q => q.isCorrect).length / 30 >= 0.5
};

function Stu_Result({ data = dummyData }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions] = useState(data.questions);
    const [exam] = useState(data.exam);
    const [examId] = useState(data.examId);
    const [userEmail] = useState(data.userEmail);
    const [totalMarks] = useState(data.totalMarks);
    const [obtainedMarks] = useState(data.obtainedMarks);
    const [isPassed] = useState(data.isPassed);

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

    return (
        <div className="flex">
            <div className="w-9/12 h-screen px-8 py-6 bg-[#F5F6F8]">
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
                    <div className="watermark-overlay">
                        {Array.from({ length: 300 }).map((_, index) => (
                            <div key={index} className="watermark-text">
                                {userEmail}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-semibold text-black select-none">
                            {currentQuestionIndex + 1}.{" "}
                            {questions[currentQuestionIndex]?.question_text || "Loading..."}
                        </h2>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(
                            questions[currentQuestionIndex]?.options || {}
                        ).map(([key, value]) => {
                            const isSelected = questions[currentQuestionIndex]?.selectedOption === key;
                            let circleClass = "w-5 h-5 inline-block mr-2 rounded-full border border-gray-400";
                            let symbol = "";

                            if (isSelected) {
                                if (questions[currentQuestionIndex].isCorrect) {
                                    circleClass += " bg-green-500 text-white";
                                    symbol = "✓";
                                } else if (questions[currentQuestionIndex].isIncorrect) {
                                    circleClass += " bg-red-500 text-white";
                                    symbol = "✗";
                                }
                            }

                            return (
                                <div
                                    key={key}
                                    className="block p-2 rounded-lg hover:bg-gray-100 transition cursor-default"
                                >
                                    <span className={circleClass}>
                                        {symbol && <span className="text-center text-xs">{symbol}</span>}
                                    </span>
                                    {value}
                                </div>
                            );
                        })}
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
                userName="Akshay Manjrekar"
            />
        </div>
    );
}

export default Stu_Result;