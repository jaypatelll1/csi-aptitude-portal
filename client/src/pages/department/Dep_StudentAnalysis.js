import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Dep_Sidebar from "../../components/department/Dep_Sidebar";
import Dep_Navbar from "../../components/department/Dep_Navbar";
import Dep_Filter from "../../components/department/Dep_Filter";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";

const Dep_StudentAnalysis = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filterPref, setfilterPref] = useState("");
  const [limit] = useState(20);
  const [numberofpages, setNumberofpages] = useState(1);
  const [loading, setLoading] = useState(true);
  const currentUser = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  
  // Fixed: Pass both user_id and year to analytics
  const handleAnalyticsClick = (student) => {
    navigate(`/department/student-analytics`, { 
      state: { 
        user_id: student.student_id, // Use student_id as user_id
        year: student.year ,
        student_name: student.student_name,
        department_name: student.department_name
      } 
    });
  };

  const handleSearch = (e) => {
    setPage(1);
    const term = e.target.value;
    setSearchTerm(term);
  };

  const toggleFilter = () => {
    setFilterOpen(!filterOpen);
  };

  const handleFilter = async (filter) => {
    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.get(`${API_BASE_URL}/api/analysis/dept-student-analysis`, {
        withCredentials: true,
        params: {
          department_name: currentUser?.department,
          filter: filter === "" ? "all" : filter,
        },
      });
      console.log("Filter Response:", response.data);
      if (response && response.data) {
        // Check if response.data has results property (based on your API structure)
        let studentsData = [];
        if (response.data.results && Array.isArray(response.data.results)) {
          studentsData = response.data.results;
        } else if (Array.isArray(response.data)) {
          studentsData = response.data;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          studentsData = response.data.data;
        } else if (response.data.students && Array.isArray(response.data.students)) {
          studentsData = response.data.students;
        } else {
          console.log("Unexpected response structure:", response.data);
          studentsData = [];
        }
        
        setStudents(studentsData);
        setNumberofpages(Math.ceil(studentsData.length / limit));
      }
    } catch (error) {
      console.log("Error fetching student analysis data", error);
      setStudents([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on search term
  useEffect(() => {
    // Ensure students is an array before proceeding
    if (!Array.isArray(students)) {
      setFilteredStudents([]);
      setNumberofpages(1);
      return;
    }

    let filtered = [...students];

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((student) => {
        const name = (student.student_name || student.name || "").toLowerCase();
        const email = (student.email || "").toLowerCase();
        const department = (student.department_name || student.department || "").toLowerCase();
        const phone = (student.phone || "").toString();
        const userId = (student.student_id || student.user_id || "").toString();
        
        return (
          name.includes(searchLower) ||
          email.includes(searchLower) ||
          department.includes(searchLower) ||
          phone.includes(searchTerm) ||
          userId.includes(searchTerm)
        );
      });
    }

    setFilteredStudents(filtered);
    const totalPages = Math.ceil(filtered.length / limit);
    setNumberofpages(Math.max(1, totalPages));
    
    // Reset to page 1 if current page is beyond the new total pages
    if (page > totalPages && totalPages > 0) {
      setPage(1);
    }
  }, [students, searchTerm, limit, page]);

  useEffect(() => {
    handleFilter(filterPref);
  }, [currentUser, limit, filterPref]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (page < numberofpages) {
      setPage(page + 1);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const startPage = Math.max(1, page - 3);
    const endPage = Math.min(numberofpages, page + 3);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredStudents.slice(startIndex, endIndex);
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

  return (
    <div className="min-h-screen flex">
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Dep_Sidebar />
      </div>

      <div className="flex-grow bg-gray-100 h-max">
        <div className="bg-white h-14 border-b border-gray-300">
          <Dep_Navbar setSidebarOpen={setSidebarOpen} />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden text-gray-800 focus:outline-none"
          >
            <svg
              className="w-8 h-8 items-center ml-3 -mt-16"
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
        </div>

        <div className="bg-white my-6 mx-10 p-6 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-blue-600 text-2xl font-bold">Student wise Analysis</h1>
            <div className="flex items-center gap-4">
              <div className="relative flex items-center mr-7  rounded-sm hover:scale-110 hover:bg-gray-100 transition-transform duration-100">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search here"
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
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
              <div className="relative">
                <button
                  onClick={toggleFilter}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-md text-gray-600 hover:bg-gray-50"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
                  </svg>
                  <span>Filter</span>
                </button>
                {filterOpen && (
                  <Dep_Filter toggleFilter={toggleFilter} handleFilter={handleFilter} />
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader />
            </div>
          ) : (
            <>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-4 px-4">User ID.</th>
                    <th className="text-left py-4 px-4">Name</th>
                    <th className="text-left py-4 px-4">Department</th>
                    <th className="text-left py-4 px-4">Rank</th>
                    <th className="text-center py-4 px-4">Analytics</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().length > 0 ? (
                    getCurrentPageData().map((student) => (
                      <tr key={student.student_id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">{student.student_id}</td>
                        <td className="py-4 px-4">{student.student_name}</td>
                        <td className="py-4 px-4">{student.department_name || "N/A"}</td>
                        <td className="py-4 px-4">{student.department_rank}</td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleAnalyticsClick(student)}
                            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
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
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-6 text-gray-500">
                        {searchTerm ? `No students found matching "${searchTerm}"` : "No data available"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              {getPageNumbers().length > 1 && (
                <div className="flex justify-center items-center mt-5">
                  <svg
                    onClick={handlePrevPage}
                    className="cursor-pointer mr-2"
                    xmlns="http://www.w3.org/2000/svg"
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
                    {getPageNumbers().map((p) => (
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
                    onClick={handleNextPage}
                    className="cursor-pointer ml-2"
                    xmlns="http://www.w3.org/2000/svg"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dep_StudentAnalysis;