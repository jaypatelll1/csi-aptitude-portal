import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Dep_PresidentSidebar from "../../components/depPresident/Dep_PresidentSidebar";
import { useLocation } from "react-router-dom";
import Dep_PresidentNavbar from "../../components/depPresident/Dep_PresidentNavbar";
import { useNavigate } from "react-router-dom";

// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Dep_PresidentTestTeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [userDetails, setUserDetails] = useState([]); // Store fetched user details
  const location = useLocation();
  const [status, setStatus] = useState("");
  const navigate = useNavigate();

  const name = location.state?.name;
  const duration = location.state?.duration;
  const examId = location.state?.examId;
  const exam_name = location.state?.exam_name;

  // Function to handle CSV download
  // const handleExportCSV = async () => {
  //   try {
  //     let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
  //     const response = await axios.get(
  //       `${API_BASE_URL}/api/export/teacher/result/csv/${examId}`,
  //       {
  //         responseType: "blob", // Important for downloading files
  //         withCredentials: true, // Make sure the cookie is sent with the request
  //       }
  //     );

  //     // Create a URL for the file blob and trigger download
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "teacher_results.csv"); // Specify file name
  //     document.body.appendChild(link);
  //     link.click();

  //     // Clean up the URL object after download
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Error downloading CSV:", error);
  //   }
  // };

  // Function to handle Excel download
  // const handleExportExcel = async () => {
  //   try {
  //     let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
  //     const response = await axios.get(
  //       `${API_BASE_URL}/api/export/teacher/result/excel/${examId}`,
  //       {
  //         responseType: "blob", // Important for downloading files
  //         withCredentials: true, // Make sure the cookie is sent with the request
  //       }
  //     );

  //     // Create a URL for the file blob and trigger download
  //     const url = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement("a");
  //     link.href = url;
  //     link.setAttribute("download", "teacher_results.xlsx"); // Specify file name
  //     document.body.appendChild(link);
  //     link.click();

  //     // Clean up the URL object after download
  //     window.URL.revokeObjectURL(url);
  //   } catch (error) {
  //     console.error("Error downloading Excel:", error);
  //   }
  // };

  const handleSearch = (e) => {
    setPage(1);
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const searchResults = term
      ? teachers.filter(
          (teacher) =>
            teacher.teacher_name?.toLowerCase().includes(term) ||
            teacher.teacher_email?.toLowerCase().includes(term) ||
            teacher.Date?.toLowerCase().includes(term) ||
            teacher.status?.toLowerCase().includes(term)
        )
      : teachers;

    setFilteredTeachers(searchResults);
  };

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const response = await axios.get(
          `${API_BASE_URL}/api/exams/teacher-responses/${examId}`,
          {
            withCredentials: true, // Make sure the cookie is sent with the request
          }
        );
        const data = response.data.responses;
        console.log(response.data);

        // Ensure data is an array
        const normalizedData = Array.isArray(data) ? data : data ? [data] : [];

        setUserDetails(normalizedData);
        setTeachers(normalizedData);
        setFilteredTeachers(normalizedData);

        console.log("Teacher Data:", normalizedData);
      } catch (error) {
        console.error("Error fetching teacher data:", error);

        // Set empty arrays in case of an error
        setUserDetails([]);
        setTeachers([]);
        setFilteredTeachers([]);
      }
    };
    fetchTeacherDetails();
  }, [examId]);
  const handleClick= (teacher, exam_id, exam_name) => {
    navigate(`/president/result`, { state: { teacher, exam_id, exam_name } });
  };

  // Remove or comment out the student fetch since we're now fetching teachers
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

  const numberofpages = Math.ceil(filteredTeachers.length / limit);
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
        <Dep_PresidentSidebar />
      </div>
      <div className="flex-grow bg-gray-100 h-max">
        <div className="bg-white h-14 border-b border-gray-300 flex items-center justify-end px-6 space-x-4">
          <Dep_PresidentNavbar />
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
        <div className="bg-white my-6 mx-10 p-6 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center w-full mb-5">
            <h2 className="text-xl font-semibold text-gray-800">
              Teachers who took the exam: {name}
            </h2>
            <div className="flex space-x-4 items-center">
              <div className="relative w-64">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-10 h-10 text-sm border border-gray-300 rounded-md bg-transparent focus:outline-none"
                  placeholder="Search"
                />
                <svg
                  className="absolute left-3 top-3 text-gray-400"
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
              <button className="flex items-center px-4 h-10 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100">
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="16" y2="12" />
                  <line x1="10" y1="18" x2="14" y2="18" />
                </svg>
                Filters
              </button>
            </div>
          </div>
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="text-left text-gray-600 uppercase text-sm border-b border-gray-300">
                <th className="py-4 px-4">#</th>
                <th className="py-4 px-4">Name</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Mobile No.</th>
                <th className="py-4 px-4">Attempted</th>
                <th className="py-4 px-4">PDF</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers
                .slice((page - 1) * limit, page * limit)
                .map((teacher, index) => (
                  <tr
                    key={teacher.result_id || index}
                    className="hover:bg-gray-50"
                  >
                    <td className="py-4 px-4">{index + 1}</td>
                    <td className="py-4 px-4">{teacher.name}</td>
                    <td className="py-4 px-4">{teacher.email}</td>
                    <td className="py-4 px-4">{teacher.phone}</td>
                    <td className="py-4 px-4">
                      <button
                        onClick={(e) =>
                          handleClick(teacher, examId, exam_name)
                        }
                        className="p-2"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M7 17l9.2-9.2M17 17V8h-9" />
                        </svg>
                      </button>
                    </td>
                    <td className="py-4 px-4">
                      <svg
                        className="w-5 h-5 text-gray-600 cursor-pointer"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2L12 15M12 2L16 6M12 2L8 6" />
                        <rect x="4" y="6" width="16" height="14" rx="2" />
                      </svg>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>

          {/* Pagination */}
          {numberofpages > 1 && (
            <div className="flex justify-center mt-6">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className={`px-3 py-1 mx-1 rounded ${
                  page === 1
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                &lt;
              </button>
              {pageNumbers.map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  className={`px-3 py-1 mx-1 rounded ${
                    page === pageNum
                      ? "bg-blue-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() => setPage(Math.min(numberofpages, page + 1))}
                disabled={page === numberofpages}
                className={`px-3 py-1 mx-1 rounded ${
                  page === numberofpages
                    ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dep_PresidentTestTeacherList;
