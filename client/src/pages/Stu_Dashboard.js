import React, { useState, useRef, useEffect } from "react";
import MSidebar from "../components/student/home/MSidebar";
import Stu_TestCard from "../components/student/home/Stu_TestCard";
import Stu_PastTestCard from "../components/student/home/Stu_PastTestCard";
import Details from "../components/student/home/Stu_Details";

const testData = [
  {
    testName: "General Knowledge",
    questionCount: 40,
    duration: "30 min",
    lastDate: "20 Dec 2024",
  },
  {
    testName: "Science Quiz",
    questionCount: 30,
    duration: "20 min",
    lastDate: "15 Jan 2025",
  },
  {
    testName: "Mathematics Quiz",
    questionCount: 25,
    duration: "15 min",
    lastDate: "10 Jan 2025",
  },
  {
    testName: "General Knowledge",
    questionCount: 40,
    duration: "30 min",
    lastDate: "20 Dec 2024",
  },
  {
    testName: "Science Quiz",
    questionCount: 30,
    duration: "20 min",
    lastDate: "15 Jan 2025",
  },
  {
    testName: "Mathematics Quiz",
    questionCount: 25,
    duration: "15 min",
    lastDate: "10 Jan 2025",
  },
  

];

const pastTests = [
  {
    testName: "General Knowledge",
    submittedOn: "21 Dec 2024",
    marks: 35,
    time: "30 min",
    status: "Passed",
  },
  {
    testName: "Science Quiz",
    submittedOn: "16 Jan 2025",
    marks: 25,
    time: "20 min",
    status: "Failed",
  },
  {
    testName: "Mathematics Quiz",
    submittedOn: "11 Jan 2025",
    marks: 20,
    time: "15 min",
    status: "Passed",
  },
  {
    testName: "General Knowledge",
    submittedOn: "21 Dec 2024",
    marks: 35,
    time: "30 min",
    status: "Passed",
  },
  {
    testName: "Science Quiz",
    submittedOn: "16 Jan 2025",
    marks: 25,
    time: "20 min",
    status: "Failed",
  },
  {
    testName: "Mathematics Quiz",
    submittedOn: "11 Jan 2025",
    marks: 20,
    time: "15 min",
    status: "Passed",
  },
];

const student = {
  Name: "Atharva Modi",
  Email: "atharvamodi@atharvacoe.ac.in",
  Mobile: "1234567890",
  Branch: "Computer Engineering",

}


function StudentDashboard() {

  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const detailsRef = useRef(null);


  const openDetails = () => setIsDetailsOpen(true);
  const closeDetails = () => setIsDetailsOpen(false);

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

  return (
    <div className="flex h-screen">
      <MSidebar />
      <div id="main-section" className='ml-64 flex-grow bg-white h-max overflow-hidden'>
        <div className='bg-gray-100 h-14 border-b border-gray-200 flex items-center'>
          <h1 className="text-xl font-medium text-gray-800 ml-5">Dashboard</h1>
          <div className="h-9 w-9 rounded-full bg-blue-300 ml-auto mr-5 flex items-center justify-center text-blue-700 text-sm" onCl onClick={openDetails}>AM</div>
          <div ref={detailsRef}>
          {isDetailsOpen && <Details name={student.Name} email={student.Email}  mobile={student.Mobile} branch={student.Branch} />}</div>
        </div>
        <h1 className="text-blue-700 text-2xl ml-10 mt-10 font-medium">Welcome to Atharva college Aptitude Portal</h1>
        <div className="flex border-b border-gray-200 mx-10 mt-5 pb-3 items-center">
          <select className="bg-white px-3 py-1 focus:outline-none font-medium text-black">
            <option value="all">All tests</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <h1 className="font-semibold text-blue-700 text-xs ml-auto mr-3">view all</h1>
        </div>
        <div className="grid-cols-3 gap-5 grid  mx-10 mt-5 px-5">
          {testData.map((test, index) => (
            <Stu_TestCard 
            key={index}
              testName={test.testName}
              questionCount={test.questionCount}
              duration={test.duration}
              lastDate={test.lastDate} />
          ))}
        </div>
        <div className="flex border-b border-gray-200 mx-10 mt-5 pb-3 items-center">
          <h1 className="font-semibold text-black text-lg ml-3 mt-5">Analytics</h1>
        </div>
        
        <div className=" mx-10 mt-5 flex overflow-x-auto space-x-4 pb-3" 
    style={{ scrollbarWidth: 'none' }}>
          {pastTests.map((test, index) => (
            <div className="flex-shrink-0">
            <Stu_PastTestCard 
              key={index}
              testName={test.testName}
              submittedOn={test.submittedOn}
              time={test.time}
              marks={test.marks}
              status={test.status} /></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default StudentDashboard;
