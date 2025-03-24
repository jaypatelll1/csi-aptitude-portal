import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Filter from "../../components/admin/Adm_Filter";

import Adm_Navbar from "../../components/admin/Adm_Navbar";
import { useNavigate } from "react-router-dom";
import { getOrdinalSuffix } from "../../ordinalSuffix";

// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const Adm_StudentAnalysis = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(undefined);
  const [selectedRank, setSelectedRank] = useState("");
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  // const [isModalOpen, setIsModalOpen] = useState(false);
  const [numberofpages, setNumberofpages] = useState(14);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  // const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  // const [selectedStudent, setSelectedStudent] = useState(null);
  const [deletedUsers, setDeletedUsers] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);
  const [setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [setIsUploading] = useState(false);
  const navigate = useNavigate();

  const handleAnalyticsClick = (user_id) => {
    navigate(`/admin/student-analytics`, { state: { user_id } });
  };

  //    Handle file change and validate file type
  const handleFileChange = (event) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (!file) {
      console.error("No file selected");
      return;
    }

    // Optional: Check the file type (e.g., .csv, .xls, .xlsx)
    const allowedTypes = [
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a .csv or .xls file.");
      return;
    }

    setSelectedFile(file); // If valid, set the file
  };

  // Handle form submission (upload file)
  const handleUserSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("Files", selectedFile); // Appending the file to formData

    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

      let response = await axios.post(`${API_BASE_URL}/api/users/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true, // Make sure the cookie is sent with the request
      });

      if (response.data.status === "success") {
        // If there are warnings, display them to the user
        if (response.data.warnings && response.data.warnings.length > 0) {
          alert(`Warnings:\n${response.data.warnings.join("\n")}`);
        } else {
          alert("No warnings, data processed successfully.");
        }
      } else {
        alert(`Error: ${response.data.message}`);
      }
      alert("File uploaded successfully!"); // Notify the user of success
      setModalOpen(false); // Close modal after successful upload
    } catch (error) {
      console.error("Error uploading file:", error.response ? error.response.data : error.message);
      alert("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false); // Unlock the upload button after the process finishes
    }
  };

  // const deletedUsersCounter = () => {
  //   setDeletedUsers(deletedUsers + 1);
  // };

  const handleSearch = (e) => {
    setPage(1);
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      const searchResults = students.filter(
        (student) =>
          student.name.toLowerCase().includes(term.toLowerCase()) ||
          student.email.toLowerCase().includes(term.toLowerCase()) ||
          student.department?.toLowerCase().includes(term.toLowerCase()) ||
          student.phone?.toString().includes(term) ||
          student.user_id.toString().includes(term)
      );
      setFilteredStudents(searchResults);
    } else {
      // If search term is empty, show all students (with department filter if active)
      const filtered = students.filter((student) =>
        selectedDepartment ? student.department === selectedDepartment : true
      );
      setFilteredStudents(filtered);
    }
  };

  // Fetch data from API
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        const response = await axios.get(`${API_BASE_URL}/api/users/?role=Student`, {
          withCredentials: true, // Make sure the cookie is sent with the request
        });
        const studentData = response.data.users;
        setStudents(studentData);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    // fetchStudents();
  }, [limit, deletedUsers]);

  useEffect(() => {
    let filtered = students;

    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter((student) => student.department === selectedDepartment);
    }

    // Apply rank filter
    // if (selectedRank) {
    //   if (selectedRank === 'top') {
    //     // Sort all students by rank in ascending order (lower rank number = higher performer)
    //     filtered.sort((a, b) => a.rank - b.rank);
    //     // No slicing, keeps all students but in ascending rank order
    //   } else if (selectedRank === 'bottom') {
    //     // Sort all students by rank in descending order (higher rank number = lower performer)
    //     filtered.sort((a, b) => b.rank - a.rank);
    //     // No slicing, keeps all students but in descending rank order
    //   } else if (selectedRank.includes('+')) {
    //     // Handle "501+" case
    //     const minRank = parseInt(selectedRank.split('+')[0]);
    //     filtered = filtered.filter((student) => student.rank >= minRank);
    //   } else {
    //     // Handle range cases like "1-10"
    //     const [minRank, maxRank] = selectedRank.split('-').map(Number);
    //     filtered = filtered.filter(
    //       (student) => student.rank >= minRank && student.rank <= maxRank
    //     );
    //   }
    // }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.phone?.toString().includes(searchTerm) ||
          student.user_id.toString().includes(searchTerm)
      );
    }

    setFilteredStudents(filtered);
    const totalPages = Math.ceil(filtered.length / limit);
    setNumberofpages(totalPages);
  }, [selectedDepartment, selectedRank, students, limit, searchTerm]);

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
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.get(`${API_BASE_URL}/api/rank/generate-rank-order`, {
        withCredentials: true,
        params: {
          filter: rank === "" ? "all" : rank,
          department,
        },
      });
      if (response) {
        setFilteredStudents(response.data);
        const totalPages = Math.ceil(response.data.length / limit);
        setNumberofpages(totalPages);
      }
    } catch (error) {
      console.log("Error fetching student ranks in asc order", error);
    }
    // setSelectedDepartment(department);
    // setSelectedRank(rank);
  };

  // const openModal = () => setIsModalOpen(true);
  // const closeModal = () => setIsModalOpen(false);

  // const openEditModal = () => setIsEditModalOpen(true);
  // const closeEditModal = () => setIsEditModalOpen(false);

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
    handleFilterChange("", "all");
  }, []);

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
      <div id="main-section" className=" flex-grow bg-gray-100 h-max">
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
                    ? "M6 18L18 6M6 6l12 12" // Cross icon for "close"
                    : "M4 6h16M4 12h16M4 18h16" // Burger icon for "open"
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
              </div>
              <div className="relative">
                <div
                  id="filterButton"
                  onClick={toggleFilter}
                  className="cursor-pointer pl-3 pr-4 py-2 border rounded-lg w-28 flex items-center justify-center text-center hover:bg-gray-100 hover:scale-110 transition-transform duration-100"
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
                      d="M16.3333 8.33333C16.3333 7.86667 16.3333 7.63333 16.2417 7.455C16.162 7.29833 16.0348 7.17087 15.8783 7.09083C15.7 7 15.4667 7 15 7H4.33333C3.86667 7 3.63333 7 3.455 7.09083C3.29821 7.17073 3.17073 7.29821 3.09083 7.455C3 7.63333 3 7.86667 3 8.33333V8.9475C3 9.15167 3 9.25333 3.02333 9.34917C3.04374 9.43448 3.07749 9.51604 3.12333 9.59083C3.17417 9.67417 3.24667 9.74667 3.39 9.89083L7.60917 14.1092C7.75333 14.2533 7.82583 14.3258 7.87667 14.4092C7.92278 14.4847 7.95611 14.5653 7.97667 14.6508C8 14.7458 8 14.8467 8 15.0458V19.0092C8 19.7233 8 20.0808 8.15 20.2958C8.21508 20.3888 8.29847 20.4675 8.39505 20.5271C8.49163 20.5868 8.59937 20.626 8.71167 20.6425C8.97083 20.6808 9.29083 20.5217 9.92917 20.2017L10.5958 19.8683C10.8642 19.735 10.9975 19.6683 11.095 19.5683C11.1815 19.48 11.2472 19.3735 11.2875 19.2567C11.3333 19.125 11.3333 18.975 11.3333 18.6758V15.0525C11.3333 14.8483 11.3333 14.7467 11.3567 14.6508C11.3771 14.5655 11.4108 14.484 11.4567 14.4092C11.5067 14.3258 11.5792 14.2542 11.7208 14.1125L11.7242 14.1092L15.9433 9.89083C16.0867 9.74667 16.1583 9.67417 16.21 9.59083C16.2561 9.51528 16.2894 9.43472 16.31 9.34917C16.3333 9.255 16.3333 9.15333 16.3333 8.95417V8.33333Z"
                      stroke="#787676"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <h1 className="ml-1 text-sm text-gray-500">Filter</h1>
                </div>
                {showFilter && (
                  <Filter toggleFilter={toggleFilter} handleFilter={handleFilterChange} />
                )}
              </div>
            </div>
          </div>
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
              {filteredStudents && filteredStudents.length > 0 ? ( // Ensure filteredStudents is not null or empty
                filteredStudents.slice((page - 1) * limit, page * limit).map((student) => (
                  <tr key={student.user_id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">{student.student_id}</td>
                    <td className="py-4 px-4">{student.student_name}</td>
                    <td className="py-4 px-4">{student.department_name || "N/A"}</td>
                    <td className="py-4 px-4 text-center">
                      {getOrdinalSuffix(student.department_rank)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {getOrdinalSuffix(student.overall_rank)}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={(e) => handleAnalyticsClick(student.student_id)}
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
                  </tr>
                ))
              ) : (
                // If there is no data, render this row:
                <tr>
                  <td colSpan="6" className="text-center py-6 text-gray-500">
                    No data available {/* This cell spans all columns and displays the message */}
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
        </div>
      </div>
    </div>
  );
};

export default Adm_StudentAnalysis;
