import React, { useState, useEffect, useRef } from "react";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
import { Toaster, toast } from "react-hot-toast";
import right from "../../assets/right.svg";
import leftwifi from "../../assets/leftwifi.svg";
import rigthwifi from "../../assets/rightwifi.svg";
import clip from "../../assets/clipboard.svg";
import blackclip from "../../assets/blackclip.svg";
import greenright from "../../assets/greenright.svg";
import { useLocation } from "react-router-dom";
import Loader from "../../components/Loader";

// Dummy data for students
const dummyStudentData = [
  {
    student_id: 1,
    name: "John Smith",
    email: "john.smith@example.com",
    response_status: "submitted"
  },
  {
    student_id: 2,
    name: "Emma Johnson",
    email: "emma.johnson@example.com",
    response_status: "submitted"
  },
  {
    student_id: 3,
    name: "Michael Brown",
    email: "michael.brown@example.com",
    response_status: "in_progress"
  },
  {
    student_id: 4,
    name: "Sarah Davis",
    email: "sarah.davis@example.com",
    response_status: "submitted"
  },
  {
    student_id: 5,
    name: "David Wilson",
    email: "david.wilson@example.com",
    response_status: "not_started"
  },
  {
    student_id: 6,
    name: "Lisa Garcia",
    email: "lisa.garcia@example.com",
    response_status: "submitted"
  }
];

function AdminLiveTestList() {
  const sidebarRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [retestStates, setRetestStates] = useState({});
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const location = useLocation();
  const exam_id = location.state?.exam_id;
  const name = location.state?.name || "Sample Test";

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

  // Simulate data fetching with dummy data
  const fetchStudentData = async () => {
    try {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Set dummy data
      setTestData(dummyStudentData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching student data:", error);
      setError("Failed to load Student List!");
      toast.error("Failed to fetch student data", {
        duration: 5000,
        position: "top-right",
      });
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, []);

  const handleRetest = async (student_id) => {
    try {
      // Disable the retest button
      setRetestStates((prev) => ({ ...prev, [student_id]: true }));
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Simulate different responses
      const responses = [
        "Student is attempting this exam.",
        "Test is Now Ready to re-attempt. This will be the LAST re-attempt.",
        "Student has already re-attempted this exam"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // Check if student has already re-attempted
      if (randomResponse === "Student has already re-attempted this exam") {
        toast.error(randomResponse, {
          duration: 5000,
          position: "top-right",
        });
        return;
      }

      // Prevent duplicate toasts
      const toastId = `retest-${student_id}`;

      toast.custom(
        (t) => (
          <div
            className={`relative flex items-center bg-white text-black p-4 rounded-lg shadow-lg ${
              t.visible ? "animate-fadeIn" : "animate-fadeOut"
            }`}
            style={{ width: "320px" }}
          >
            {randomResponse === "Student is attempting this exam." ? (
              <span className="text-sm font-semibold">
                Student is attempting this exam.
              </span>
            ) : (
              <span className="text-sm font-semibold">
                Test is Now Ready to re-attempt. This will be the LAST
                re-attempt.
              </span>
            )}
            <button
              onClick={() => toast.dismiss(t.id)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              ✖
            </button>
            {/* Green progress bar */}
            <div className="absolute bottom-0 left-0 h-1 bg-green-500 animate-progress" />
          </div>
        ),
        { id: toastId, duration: 3000 },
      );
    } catch (error) {
      console.error("Error retesting student:", error);
      toast.error("Failed to initiate retest", {
        duration: 5000,
        position: "top-right",
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <Toaster position="top-right" />

      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-100 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Adm_Sidebar />
      </div>

      <div className="flex-1 bg-gray-100">
        <Adm_Navbar setSidebarOpen={setSidebarOpen} />

        <div className="flex items-center justify-between mt-5 px-5">
          <button
            className="xl:hidden text-gray-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg
              className="w-7 h-8"
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

        {/* Loader while fetching data */}
        {loading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader />
          </div>
        ) : error ? (
          <p className="text-red-500 text-center mt-8">{error}</p>
        ) : testData.length === 0 ? (
          <p className="text-center mt-8 text-gray-600">
            No students have attempted the test yet.
          </p>
        ) : (
          <>
            <div className="p-5">
              <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="flex items-center justify-between">
                  <div className="flex items-center justify-center">
                    <h1 className="text-3xl font-bold text-[#3160CC] py-8 ml-4">
                      Attempted
                    </h1>
                    <h1 className="text-lg mt-2">- {name}</h1>
                  </div>

                  <div className="flex items-center justify-center mr-10">
                    <img src={leftwifi} alt="leftwifi" className="w-6 h-6" />
                    <h2 className="text-2xl font-bold text-red-600 text-center">
                      Live Test
                    </h2>
                    <img src={rigthwifi} alt="rigthwifi" className="w-6 h-6" />
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-white border-b">
                    <tr>
                      <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Sr. No
                      </th>
                      <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Attempted
                      </th>
                      <th className="p-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Re-Test
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {testData.map((user, index) => (
                      <tr key={user.student_id}>
                        <td className="p-3 text-center whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          {user.name}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          {user.email}
                        </td>

                        {/* ✅ If the user has attempted, show green check */}
                        <td className="p-3 flex justify-center">
                          <img
                            src={
                              user.response_status !== "submitted" ||
                              retestStates[user.student_id]
                                ? right
                                : greenright
                            }
                            alt="right"
                            className="w-7 h-7"
                          />
                        </td>

                        <td className="p-3 text-center">
                          <div className="flex justify-center items-center">
                            <button
                              onClick={() => handleRetest(user.student_id)}
                              className={`px-4 py-2 rounded transition-colors duration-300 flex justify-center items-center ${
                                user.response_status !== "submitted" ||
                                retestStates[user.student_id]
                                  ? "bg-gray-400 text-gray-700 cursor-default"
                                  : "bg-blue-500 text-white hover:bg-blue-600"
                              }`} // Disable button if user has not attempted
                              disabled={
                                user.response_status !== "submitted" ||
                                retestStates[user.student_id]
                              }
                            >
                              {/* ✅ Change clip icon when clicked */}
                              <img
                                src={
                                  user.response_status !== "submitted" ||
                                  retestStates[user.student_id]
                                    ? blackclip
                                    : clip
                                }
                                alt="clip"
                                className="w-5 h-5 mr-2"
                              />
                              Test Again
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AdminLiveTestList;