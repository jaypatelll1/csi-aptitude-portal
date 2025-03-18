import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import { useLocation } from "react-router-dom";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Adm_TestStudentList = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [ userDetails, setUserDetails] = useState([]); // Store fetched user details
  // const [examName, setExamName] = useState(""); // Store the exam name
  const location = useLocation();
  // const [status, setStatus] = useState("");

  const name = location.state?.name;
  const duration = location.state?.duration;
  const examId = location.state?.examId;


  // Function to handle CSV download
  // const handleExportCSV = async () => {
  //   try {
  //     let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
  //     const response = await axios.get(
  //       `${API_BASE_URL}/api/export/result/csv/${examId}`,
  //       {
  //         responseType: "blob", // Important for downloading files
  //         withCredentials: true, // Make sure the cookie is sent with the request
  //       }
  //     );

  //     // Create a URL for the file blob and trigger download
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "result.csv"); // Specify file name
  //     document.body.appendChild(link);
  //     link.click();

  //     // Clean up the URL object after download
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Error downloading CSV:", error);
  //   }
  // };

  // Function to handle Excel download
  const handleExportExcel = async () => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.get(
        `${API_BASE_URL}/api/export/result/excel/${examId}`,
        {
          responseType: "blob", // Important for downloading files
          withCredentials: true, // Make sure the cookie is sent with the request
        }
      );

      // Create a URL for the file blob and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "result.xlsx"); // Specify file name
      document.body.appendChild(link);
      link.click();

      // Clean up the URL object after download
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading Excel:", error);
    }
  };

  const handleSearch = (e) => {
    setPage(1);
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);


    const searchResults = term
      ? students.filter(
          (student) =>
            student.student_name.toLowerCase().includes(term) ||
            student.student_email.toLowerCase().includes(term) ||
            student.Date.toLowerCase().includes(term) ||
            student.status.toLowerCase().includes(term)
          // student.total_score.toLowerCase().includes(term)
        )
      : students;

    setFilteredStudents(searchResults);
  };

  const getResultStyle = (result) => {
    return result === "Passed"
      ? "bg-green-100 text-green-800 rounded-full px-2 py-1 text-sm font-medium"
      : "bg-red-100 text-red-800 rounded-full px-2 py-1 text-sm font-medium";
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const response = await axios.get(
          `${API_BASE_URL}/api/exams/results/allpast/${examId}`,
          {
            params: { page: 1, limit : 1000 },
            withCredentials: true, // Make sure the cookie is sent with the request
          },
         
        );
        const data = response.data.response;


        // Ensure data is an array
        const normalizedData = Array.isArray(data) ? data : data ? [data] : [];

        setUserDetails(normalizedData);
        setStudents(normalizedData);
        setFilteredStudents(normalizedData);


       
      } catch (error) {
        console.error("Error fetching data:", error);

        // Set empty arrays in case of an error
        setUserDetails([]);
        setStudents([]);
        setFilteredStudents([]);
      }
    };
    fetchUserDetails();
  }, [examId, setUserDetails]);

  // useEffect(() => {
  //     const fetchStudents = async () => {
  //         try {
  //             const { data } = await axios.get(`/api/users?role=Student`);
  //             setStudents(data.users);
  //             setFilteredStudents(data.users);
  //         } catch (error) {
  //             console.error("Error fetching students:", error);
  //         }
  //     };
  //     fetchStudents();
  // }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const numberofpages = Math.ceil(filteredStudents.length / limit);
  const startPage = Math.max(1, page - 3);
  const endPage = Math.min(numberofpages, page + 3);
  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return (
    <div className="min-h-screen flex">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>
      <div className="flex-grow bg-gray-100 h-max">
        <div className="bg-white h-14 border-b border-gray-300">
          <Adm_Navbar />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden text-gray-800 focus:outline-none mt-4"
          >
            <svg
              className="w-8 h-8 items-center ml-4 mt-3"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
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
        </div>
        <h1 className="ml-12 mt-7 flex flex-row justify-between">
          <div className="font-bold text-2xl">Test: {name} </div>
          <div className="flex flex-row justify-between">
            {/* <button onClick={handleExportCSV} className=" px-3 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600">
                        Export to CSV
                    </button> */}
            <button
              onClick={handleExportExcel}
              className=" px-3 mx-4 py-3 bg-[#533fcc] text-white rounded-md hover:bg-purple-800"
            >
              Export to Excel
            </button>
          </div>
        </h1>
        <div className="bg-white my-6 mx-10 pt-5 pb-5 pl-9 pr-9 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center w-full mb-5">
            <h1 className="text-black font-roboto text-[22px] font-semibold">
              Students List
            </h1>
            <div className="flex ml-auto"></div>
            <div className="w-full max-w-md "></div>
            <div className="relative flex items-center mr-7  rounded-sm hover:scale-110 hover:bg-gray-100 transition-transform duration-100">
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-10 h-7 text-sm border border-gray-300 bg-transparent"
              />
              <svg
                className="absolute left-3 text-gray-400"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
          </div>
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="text-left text-gray-600 uppercase text-sm border-t border-gray-300">
                <th className="py-4 w-1/5">Name</th>
                <th className="py-4 w-1/5">Email</th>
                <th className="py-4 w-1/6">Date</th>
                <th className="py-4 w-1/6">Results</th>
                <th className="py-4 w-1/6">Marks</th>
                <th className="py-4 w-1/6">Time</th>
                {/* <th className="py-3 w-1/6"></th> */}
              </tr>
            </thead>

            <tbody>
              {filteredStudents
                .slice((page - 1) * limit, page * limit)
                .map((student) => (
                  <tr key={student.result_id} className="hover:bg-gray-50">
                    {/* Loop through the user details of the student if users is an array */}
                    <td className="py-4 w-1/5">{student.student_name}</td>
                    <td className="py-4 w-1/5">{student.student_email}</td>

                    {/* Other student properties like date, results, etc. */}
                    <td className="py-4 w-1/6">{student.Date}</td>
                    <td className="py-4 w-1/6">
                      <span className={getResultStyle(student.status)}>
                        {student.status === "Passed" ? "Passed" : "Failed"}
                      </span>
                    </td>
                    <td className="py-4 w-1/6">
                      {student.total_score}/{student.max_score}
                    </td>
                    <td className="py-4 w-1/6">{duration}</td>
                    {/* <td className="py-4 w-1/6 text-blue-600 whitespace-nowrap text-sm cursor-pointer">
                                            view more
                                        </td> */}
                  </tr>
                ))}
            </tbody>
          </table>
          {numberofpages > 1 && (
          <div className="flex justify-center items-center mt-5">
            <svg
              onClick={() => page > 1 && setPage(page - 1)}
              className="cursor-pointer mr-2"
              width="12"
              height="24"
              viewBox="0 0 12 24"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M1.84306 11.2884L7.50006 5.63137L8.91406 7.04537L3.96406 11.9954L8.91406 16.9454L7.50006 18.3594L1.84306 12.7024C1.65559 12.5148 1.55028 12.2605 1.55028 11.9954C1.55028 11.7302 1.65559 11.4759 1.84306 11.2884Z"
                fill="black"
              />
            </svg>
            <div className="flex">
              {pageNumbers.map((p) => (
                <div
                  key={p}
                  className={`w-8 h-8 flex items-center justify-center mx-1 cursor-pointer ${
                    page === p ? "bg-blue-300 rounded-md" : "bg-white"
                  }`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </div>
              ))}
            </div>
            <svg
              onClick={() => page < numberofpages && setPage(page + 1)}
              className="cursor-pointer ml-2"
              width="12"
              height="24"
              viewBox="0 0 12 24"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.1569 11.2884L4.49994 5.63137L3.08594 7.04537L8.03594 11.9954L3.08594 16.9454L4.49994 18.3594L10.1569 12.7024C10.3444 12.5148 10.4497 12.2605 10.4497 11.9954C10.4497 11.7302 10.3444 11.4759 10.1569 11.2884Z"
                fill="black"
              />
            </svg>
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Adm_TestStudentList;
