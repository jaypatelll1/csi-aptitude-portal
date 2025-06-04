import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Filter from "../../components/admin/Adm_Filter";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import Loader from "../../components/Loader";
import { useNavigate } from "react-router-dom";
import { getOrdinalSuffix } from "../../ordinalSuffix";

const Adm_StudentAnalysis = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(undefined);
  const [selectedRank, setSelectedRank] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [numberofpages, setNumberofpages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [searchTerm, setSearchTerm] = useState("");
  const [deletedUsers, setDeletedUsers] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyticsClick = (user_id) => {
    navigate(`/admin/student-analytics`, { state: { user_id } });
  };

  const handleSearch = (e) => {
    setPage(1);
    const term = e.target.value;
    setSearchTerm(term);
  };

  // Fetch students data with ranks from API
  useEffect(() => {
    const fetchStudentsWithRanks = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        
        // First try to get ranked data (which includes all students with ranks)
        const rankedResponse = await axios.get(`${API_BASE_URL}/api/rank/generate-rank-order`, {
          withCredentials: true,
          params: {
            filter: "all",
            department: "", // Get all departments
          },
        });
        
        if (rankedResponse && rankedResponse.data) {
          const rankedData = Array.isArray(rankedResponse.data) ? rankedResponse.data : [];
          setStudents(rankedData);
          console.log("Fetched students with ranks:", rankedData);
        } else {
          // Fallback to regular student fetch if rank endpoint fails
          const response = await axios.get(`${API_BASE_URL}/api/users/?role=Student`, {
            withCredentials: true,
          });
          const studentData = response.data.users || response.data;
          setStudents(Array.isArray(studentData) ? studentData : []);
          console.log("Fetched students (no ranks):", studentData);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        // Try fallback method if rank endpoint fails
        try {
          const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
          const response = await axios.get(`${API_BASE_URL}/api/users/?role=Student`, {
            withCredentials: true,
          });
          const studentData = response.data.users || response.data;
          setStudents(Array.isArray(studentData) ? studentData : []);
        } catch (fallbackError) {
          console.error("Fallback fetch also failed:", fallbackError);
          setStudents([]);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudentsWithRanks();
  }, [deletedUsers]);

  // Filter students based on search term and department
  useEffect(() => {
    let filtered = [...students];

    // Apply department filter (only if a specific department is selected)
    if (selectedDepartment && selectedDepartment !== "" && selectedDepartment !== "all") {
      filtered = filtered.filter((student) => {
        const studentDept = student.department || student.department_name;
        return studentDept === selectedDepartment;
      });
    }

    // Apply search filter
    if (searchTerm && searchTerm.trim() !== "") {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((student) => {
        const name = (student.name || student.student_name || "").toLowerCase();
        const email = (student.email || "").toLowerCase();
        const department = (student.department || student.department_name || "").toLowerCase();
        const phone = (student.phone || "").toString();
        const userId = (student.user_id || student.student_id || "").toString();
        
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
  }, [selectedDepartment, students, searchTerm, limit, page]);

  const toggleFilter = () => {
    setShowFilter(!showFilter);
  };

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

  const handleFilterChange = async (department, rank) => {
    try {
      setLoading(true);
      const API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      
      // Always fetch fresh ranked data when filter changes
      const response = await axios.get(`${API_BASE_URL}/api/rank/generate-rank-order`, {
        withCredentials: true,
        params: {
          filter: rank === "" || rank === "all" ? "all" : rank,
          department: department === "" ? "" : department, // Send empty string for all departments
        },
      });
      
      if (response && response.data) {
        const rankedData = Array.isArray(response.data) ? response.data : [];
        setStudents(rankedData); // Update base students data with fresh ranked data
        setSelectedDepartment(department);
        setSelectedRank(rank);
        setPage(1); // Reset to first page
        
        // Clear search term when applying filters to avoid confusion
        setSearchTerm("");
        
        console.log("Applied filter - Department:", department, "Rank:", rank, "Data:", rankedData);
      }
    } catch (error) {
      console.error("Error fetching student ranks:", error);
      // Don't clear existing data on filter error, just show error
      alert("Failed to apply filter. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Close sidebar when clicking outside
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

  // Initial load - fetch all students with ranks
  useEffect(() => {
    // Don't call handleFilterChange on initial load if we already have data
    if (students.length === 0) {
      handleFilterChange("", "all");
    }
  }, []); // Empty dependency array for initial load only

  // Get current page data
  const getCurrentPageData = () => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    return filteredStudents.slice(startIndex, endIndex);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Section */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>
      
      <div id="main-section" className="flex-grow bg-gray-100 h-max">
        <div className="bg-white h-14 border-b border-gray-300 items-end">
          <Adm_Navbar />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden text-gray-800 focus:outline-none"
          >
            <svg
              className="w-8 h-8 items-center ml-4 mt-3"
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
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>
        
        <div
          id="listSection"
          className="bg-white my-6 mx-10 pt-5 pb-5 pl-9 pr-9 rounded-lg border border-gray-300"
        >
          <div id="headerBar" className="flex justify-between items-center w-full mb-5">
            <h1 className="text-blue-600 text-2xl font-bold">Students Wise Analysis</h1>
            <div className="flex ml-auto">
              <div className="flex items-center gap-4 mr-5">
                <div className="relative flex items-center mr-7 rounded-sm hover:scale-110 hover:bg-gray-100 transition-transform duration-100">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search here"
                    className="pl-10 pr-4 py-2 border rounded-lg w-64"
                    disabled={loading}
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
              </div>
              <div className="relative">
                <div
                  id="filterButton"
                  onClick={loading ? null : toggleFilter}
                  className={`cursor-pointer pl-3 pr-4 py-2 border rounded-lg w-28 flex items-center justify-center text-center hover:bg-gray-100 hover:scale-110 transition-transform duration-100 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="24"
                    viewBox="0 0 20 24"
                    fill="none"
                    className="mb-1 w-5 h-5"
                  >
                    <path
                      d="M16.3333 8.33333C16.3333 7.86667 16.3333 7.63333 16.2417 7.455C16.162 7.29833 16.0348 7.17087 15.8783 7.09083C15.7 7 15.4667 7 15 7H4.33333C3.86667 7 3.63333 7 3.455 7.09083C3.29821 7.17073 3.17073 7.29821 3.09083 7.455C3 7.63333 3 7.86667 3 8.33333V8.9475C3 9.15167 3 9.25333 3.02333 9.34917C3.04374 9.43448 3.07749 9.51604 3.12333 9.59083C3.17417 9.67417 3.24667 9.74667 3.39 9.89083L7.60917 14.1092C7.75333 14.2533 7.82583 14.3258 7.87667 14.4092C7.92278 14.4847 7.95611 14.5653 7.97667 14.6508C8 14.7458 8 14.8467 8 15.0458V19.0092C8 19.7233 8 20.0808 8.15 20.2958C8.21508 20.3888 8.29847 20.4675 8.39505 20.5271C8.49163 20.5868 8.59937 20.626 8.71167 20.6425C8.97083 20.6808 9.29083 20.5217 9.92917 20.2017L10.5958 19.8683C8.8642 19.735 10.9975 19.6683 11.095 19.5683C11.1815 19.48 11.2472 19.3735 11.2875 19.2567C11.3333 19.125 11.3333 18.975 11.3333 18.6758V15.0525C11.3333 14.8483 11.3333 14.7467 11.3567 14.6508C11.3771 14.5655 11.4108 14.484 11.4567 14.4092C11.5067 14.3258 11.5792 14.2542 11.7208 14.1125L11.7242 14.1092L15.9433 9.89083C16.0867 9.74667 16.1583 9.67417 16.21 9.59083C16.2561 9.51528 16.2894 9.43472 16.31 9.34917C16.3333 9.255 16.3333 9.15333 16.3333 8.95417V8.33333Z"
                      stroke="#787676"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h1 className="ml-1 text-sm text-gray-500">Filter</h1>
                </div>
                {showFilter && !loading && (
                  <Filter toggleFilter={toggleFilter} handleFilter={handleFilterChange} />
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
                    <th className="text-center py-4 px-4">Dept. Rank</th>
                    <th className="text-center py-4 px-4">Overall Rank</th>
                    <th className="text-center py-4 px-4">Analytics</th>
                  </tr>
                </thead>
                <tbody>
                  {getCurrentPageData().length > 0 ? (
                    getCurrentPageData().map((student, index) => (
                      <tr key={student.user_id || student.student_id || index} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4">{student.student_id || student.user_id}</td>
                        <td className="py-4 px-4">{student.student_name || student.name}</td>
                        <td className="py-4 px-4">{student.department_name || student.department || "N/A"}</td>
                        <td className="py-4 px-4 text-center">
                          {student.department_rank ? getOrdinalSuffix(parseInt(student.department_rank)) : "N/A"}
                        </td>
                        <td className="py-4 px-4 text-center">
                          {student.overall_rank ? getOrdinalSuffix(parseInt(student.overall_rank)) : "N/A"}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <button
                            onClick={() => handleAnalyticsClick(student.student_id || student.user_id)}
                            className="p-2 hover:bg-gray-100 rounded"
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
                      <td colSpan="6" className="text-center py-6 text-gray-500">
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
                    className={`cursor-pointer mr-2 ${page === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                          page === p ? "bg-blue-300 rounded-md" : "bg-white hover:bg-gray-100 rounded-md"
                        }`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </div>
                    ))}
                  </div>
                  <svg
                    onClick={handleNextPage}
                    className={`cursor-pointer ml-2 ${page === numberofpages ? 'opacity-50 cursor-not-allowed' : ''}`}
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

export default Adm_StudentAnalysis;