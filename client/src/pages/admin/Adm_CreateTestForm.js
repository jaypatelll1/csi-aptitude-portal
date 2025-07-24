import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setExamId } from "../../redux/ExamSlice";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import Loader from "../../components/Loader";

const Adm_CreateTestPage = () => {
  const userData = useSelector((state) => state.user);
  const [testName, setTestName] = useState("");
  const [duration, setDuration] = useState("");
  const [branch, setBranch] = useState([]);
  const years = userData?.user?.year ? [userData.user.year] : [];
  const [year, setYear] = useState(years);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  
  const [Loading, setLoading] = useState(false);

  const sidebarRef = useRef(null);
  const branchRef = useRef(null);
  const yearRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const branches = ["CMPN", "INFT", "EXTC", "ELEC", "ECS"];

  const handleCreateQuestions = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!testName || !duration || branch.length === 0 || year.length === 0) {
      alert("Please fill in all the fields.");
      return;
    }

    const payload = {
      name: testName,
      duration: duration,
      target_years: year,
      target_branches: branch,
    };

    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      const response = await axios.post(`${API_BASE_URL}/api/exams`, payload, {
        withCredentials: true,
      });
      const examId = response.data.newExam.exam_id;
      dispatch(setExamId(examId));
      navigate("/admin/input");
    } catch (error) {
      alert("Invalid Input");
      console.error("Error creating test:", error.response?.data || error.message);
    }
    setLoading(false);
  };

  const handleBranchChange = (selectedBranch) => {
    if (selectedBranch === "All") {
      setBranch(branch.length === branches.length ? [] : [...branches]);
    } else {
      const newBranches = branch.includes(selectedBranch)
        ? branch.filter((b) => b !== selectedBranch)
        : [...branch, selectedBranch];
      setBranch(newBranches);
    }
  };

  const handleTestNameChange = (e) => {
    const value = e.target.value;
    // Capitalize the first letter of the entire string
    const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1);
    setTestName(capitalizedValue);
  };

  const handleClear = () => {
    setTestName("");
    setDuration("");
    setBranch([]);
    setYear(years);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setSidebarOpen(false);
      }
      if (branchRef.current && !branchRef.current.contains(event.target)) {
        setShowBranchDropdown(false);
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
        <Adm_Sidebar />
      </div>

      <div className="flex-1 bg-gray-100">
        <Adm_Navbar />
        <div className="flex items-center">
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
                d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
              />
            </svg>
          </button>
          <h1 className="text-xl sm:text-2xl font-bold ml-52 xl:m-6">Create Aptitude Test</h1>
        </div>

        <div className="flex items-center mb-6 ml-5">
          <button
            onClick={handleGoBack}
            className="flex items-center text-gray-600 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-300 mr-4"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-lg font-semibold text-gray-700">Basic create test info.</h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-5 ml-5 w-[96%]">
          <form>
            <div className="grid grid-cols-2 gap-4 my-5">
              {/* Branch Dropdown */}
              <div ref={branchRef}>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
                <div className="relative">
                  <div
                    onClick={() => setShowBranchDropdown(!showBranchDropdown)}
                    className="cursor-pointer border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {branch.length === 0 ? (
                      <span className="text-gray-500">Select branches</span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {branch.length === branches.length || branch.includes("All") ? (
                          <span className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded">
                            All Branches
                          </span>
                        ) : (
                          branch.map((b) => (
                            <span
                              key={b}
                              className="bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded"
                            >
                              {b}
                            </span>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {showBranchDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                      <div className="p-2">
                        <label className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={branch.length === branches.length}
                            onChange={() => handleBranchChange("All")}
                            className="text-blue-500 rounded focus:ring-blue-500"
                          />
                          <span className="text-md">All Branches</span>
                        </label>
                        {branches.map((b) => (
                          <label
                            key={b}
                            className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={branch.includes(b)}
                              onChange={() => handleBranchChange(b)}
                              value={branch.toString()}
                              className="text-blue-500 rounded focus:ring-blue-500"
                            />
                            <span className="text-md">{b}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

            
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
                <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                    {userData?.user?.year || "N/A"}   
                </div>
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="testName" className="block text-sm font-medium text-gray-700 mb-2">
                Test name
              </label>
              <input
                type="text"
                id="testName"
                placeholder="Eg. Numerical reasoning test"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={testName}
                onChange={handleTestNameChange}
                required
              />
            </div>

            <div className="mb-6">
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                Duration (in minutes)
              </label>
              <input
                type="number"
                id="duration"
                placeholder="Eg. 30"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={duration === 0 ? "" : duration}
                onChange={(e) => {
                  const value = e.target.value === "" ? "" : Math.max(0, Number(e.target.value));
                  setDuration(value);
                }}
                onBlur={() => {
                  if (duration === "") setDuration(0);
                }}
                min="0"
                required
              />
            </div>
          </form>
        </div>

        <div className="flex items-center space-x-4 mt-9 ml-6">
          <button
            type="submit"
            className="bg-[#1349C5] text-white px-3 lg:px-4 py-2 rounded hover:bg-[#4d75d2] border-[#2c54b2] opacity-90 hover:opacity-100"
            onClick={handleCreateQuestions}
          >
            {Loading ? <Loader /> : "Create Questions"}
          </button>
          <button
            type="button"
            className="bg-white text-gray-900 px-3 py-2 rounded hover:bg-gray-300 border border-gray-700 opacity-90 hover:opacity-100"
            onClick={handleClear}
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};

export default Adm_CreateTestPage;