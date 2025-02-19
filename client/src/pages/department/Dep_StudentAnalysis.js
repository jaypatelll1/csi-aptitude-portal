import React, { useState, useEffect } from "react";
import axios from "axios";
import Dep_Sidebar from "../../components/department/Dep_Sidebar";
import Dep_Navbar from "../../components/department/Dep_Navbar";
import { useSelector } from "react-redux";

const Dep_StudentAnalysis = () => {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [numberofpages, setNumberofpages] = useState(1);
  const currentUser = useSelector((state) => state.user.user);

  const handleSearch = (e) => {
    setPage(1);
    const term = e.target.value;
    setSearchTerm(term);

    if (term) {
      const searchResults = students.filter(
        (student) =>
          student.name.toLowerCase().includes(term.toLowerCase()) ||
          student.department?.toLowerCase().includes(term.toLowerCase()) ||
          student.user_id.toString().includes(term)
      );
      setFilteredStudents(searchResults);
    } else {
      setFilteredStudents(students);
    }
  };

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
        let url = `${API_BASE_URL}/api/users?role=Student`;

        if (currentUser?.role === "Department" && currentUser?.department) {
          url += `&department=${currentUser.department}`;
        }

        const response = await axios.get(url, {
          withCredentials: true,
        });

        const studentData = response.data.users;
        setStudents(studentData);
        setFilteredStudents(studentData);
        setNumberofpages(Math.ceil(studentData.length / limit));
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [currentUser, limit]);

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

  return (
    <div className="min-h-screen flex">
      <div className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}>
        <Dep_Sidebar />
      </div>
      
      <div className="flex-grow bg-gray-100 h-max">
        <div className="bg-white h-14 border-b border-gray-300">
          <Dep_Navbar />
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="xl:hidden text-gray-800 focus:outline-none"
          >
            <svg className="w-8 h-8 ml-4 mt-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>
        </div>

        <div className="bg-white my-6 mx-10 p-6 rounded-lg border border-gray-300">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-blue-600 text-2xl font-bold">Student wise Analysis</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search here"
                  className="pl-10 pr-4 py-2 border rounded-lg w-64"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 4h18v2H3zm0 7h18v2H3zm0 7h18v2H3z" />
                </svg>
              </button>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-4 px-4">User ID.</th>
                <th className="text-left py-4 px-4">Name</th>
                <th className="text-left py-4 px-4">Department</th>
                <th className="text-center py-4 px-4">Analytics</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents
                .slice((page - 1) * limit, page * limit)
                .map((student) => (
                  <tr key={student.user_id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-4">{student.user_id}</td>
                    <td className="py-4 px-4">{student.name}</td>
                    <td className="py-4 px-4">{student.department || "N/A"}</td>
                    <td className="py-4 px-4 text-center">
                      <button className="hover:scale-110 transition-transform">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17l9.2-9.2M17 17V8h-9" />
                        </svg>
                      </button>
                    </td>
                  </tr>
              ))}
            </tbody>
          </table>

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
        </div>
      </div>
    </div>
  );
};

export default Dep_StudentAnalysis;