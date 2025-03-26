import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Dep_PresidentSidebar from "../../components/depPresident/Dep_PresidentSidebar";
import { useLocation } from "react-router-dom";
import Dep_PresidentNavbar from "../../components/depPresident/Dep_PresidentNavbar";
import { useNavigate } from "react-router-dom";
import pdf from "../../assets/pdf.svg";
import right from "../../assets/right.svg";
import Loader from "../../components/Loader";

const Dep_PresidentTestTeacherList = () => {
  const [teachers, setTeachers] = useState([]);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [userDetails, setUserDetails] = useState([]); 
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const navigate = useNavigate();

  const name = location.state?.name;
  const duration = location.state?.duration;
  const examId = location.state?.examId;
  const exam_name = location.state?.exam_name;

  const handleSearch = (e) => {
    setPage(1);
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);

    const searchResults = term
      ? teachers.filter(
          (teacher) =>
            teacher.name?.toLowerCase().includes(term) ||
            teacher.email?.toLowerCase().includes(term) ||
            teacher.phone?.toLowerCase().includes(term),
        )
      : teachers;

    setFilteredTeachers(searchResults);
  };

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        setIsLoading(true); // Set loading to true before fetch
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const response = await axios.get(
          `${API_BASE_URL}/api/exams/teacher-responses/attempted-teachers/${examId}`,
          {
            withCredentials: true,
          },
        );
        const data = response.data;

        // Ensure data is an array
        const normalizedData = Array.isArray(data) ? data : data ? [data] : [];

        setUserDetails(normalizedData);
        setTeachers(normalizedData);
        setFilteredTeachers(normalizedData);
      } catch (error) {
        console.error("Error fetching teacher data:", error);

        // Set empty arrays in case of an error
        setUserDetails([]);
        setTeachers([]);
        setFilteredTeachers([]);
      } finally {
        setIsLoading(false); // Set loading to false after fetch
      }
    };
    fetchTeacherDetails();
  }, [examId]);

  const handleClick = (teacher, exam_id, exam_name) => {
    navigate(`/president/result`, { state: { teacher, exam_id, exam_name } });
  };

  const handlePdfClick = async (teacher, exam_id) => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.get(
        `${API_BASE_URL}/generate-pdf/${teacher.teacher_id}/${exam_id}`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );
  
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
  
      // Create a link element and trigger a download
      const a = document.createElement("a");
      a.href = url;
      a.download = `Teacher_Report_${teacher.name}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up the URL object
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error generating PDF:", error);
    }
  };

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
    (_, i) => startPage + i,
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

        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader />
          </div>
        ) : (
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
                          onClick={(e) => handleClick(teacher, examId, exam_name)}
                          className="p-2"
                        >
                          <img
                            src={right}
                            alt="right"
                            className="w-8 h-8 text-gray-600 cursor-pointer"
                          />
                        </button>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          className="p-2"
                          onClick={(e) => handlePdfClick(teacher, examId)}
                        >
                          <img src={pdf} alt="pdf" className="w-8 h-8 text-gray-600 cursor-pointer" />
                        </button>
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
        )}
      </div>
    </div>
  );
};

export default Dep_PresidentTestTeacherList;