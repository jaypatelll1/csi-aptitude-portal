import React, { useState, useRef, useEffect } from "react";
import Sup_Sidebar from "../../components/super-admin/Sup_Sidebar";
import Sup_Navbar from "../../components/super-admin/Sup_Navbar";
import AddTeacherModal from "../../components/super-admin/Sup_AddTeacher";
import Sup_EditTeacher from "../../components/super-admin/Sup_EditTeacher"; // Add this import

const Sup_ViewTeacher = () => {
  const sidebarRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddTeacher, setShowAddTeacher] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Edit Teacher Modal States
  const [showEditTeacher, setShowEditTeacher] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [teachers, setTeachers] = useState([
    {
      id: 1,
      name: "Shree Shinde",
      email: "shreeshinde-inft@atharvacoe.ac.in",
      mobile: "9501856750",
      branch: "INFT",
    },
    {
      id: 2,
      name: "Shravani P.",
      email: "shravanipawar-inft@atharvacoe.ac.in",
      mobile: "7725068610",
      branch: "INFT",
    },
    {
      id: 3,
      name: "Wade Warren",
      email: "WadeWarren-inft@atharvacoe.ac.in",
      mobile: "0367871221",
      branch: "CMPN",
    },
    {
      id: 4,
      name: "Guy Hawkins",
      email: "GuyHawkins-inft@atharvacoe.ac.in",
      mobile: "3954212189",
      branch: "EXTC",
    },
    {
      id: 5,
      name: "Robert Fox",
      email: "RobertFox-inft@atharvacoe.ac.in",
      mobile: "3910793817",
      branch: "INFT",
    },
    {
      id: 6,
      name: "Jacob Jones",
      email: "JacobJones-inft@atharvacoe.ac.in",
      mobile: "5101345246",
      branch: "CMPN",
    },
    {
      id: 7,
      name: "Albert Flores",
      email: "AlbertFlores-inft@atharvacoe.ac.in",
      mobile: "6557000265",
      branch: "CMPN",
    },
    {
      id: 8,
      name: "Cody Fisher",
      email: "CodyFisher-inft@atharvacoe.ac.in",
      mobile: "6221376671",
      branch: "Elec",
    },
  ]);

  const handleAddTeacher = (teacherData) => {
    const newTeacher = {
      id: teachers.length + 1,
      name: `${teacherData.firstName} ${teacherData.lastName}`,
      email: teacherData.email,
      mobile: teacherData.mobile,
      branch: teacherData.branch,
    };
    setTeachers([...teachers, newTeacher]);
  };

  // Edit Teacher Functions
  const handleEditTeacher = (teacher) => {
    setSelectedTeacher(teacher);
    setShowEditTeacher(true);
  };

  const handleTeacherUpdated = (updatedTeacher) => {
    setTeachers(
      teachers.map((teacher) =>
        teacher.id === updatedTeacher.id ? updatedTeacher : teacher,
      ),
    );
  };

  const handleTeacherDeleted = (teacherId) => {
    setTeachers(teachers.filter((teacher) => teacher.id !== teacherId));
  };

  const closeEditModal = () => {
    setShowEditTeacher(false);
    setSelectedTeacher(null);
  };

  const filteredTeachers = teachers.filter(
    (teacher) =>
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.branch.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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
    <div className="min-h-screen flex bg-white">
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-100 text-white z-50 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Sup_Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-gray-100">
        {/* Navbar */}
        <Sup_Navbar setSidebarOpen={setSidebarOpen} />

        {/* Mobile Menu Button */}
        <div className="flex items-center justify-between -mt-10 px-5 xl:hidden">
          <button
            className="text-gray-800"
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

        {/* Page Content */}
        <div className="p-6">
          {/* Import Teachers Section */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center">
                  <svg
                    className="w-7 h-7 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">
                    Import teachers
                  </h2>
                  <p className="text-gray-600 text-sm">
                    Register Teachers to gain access to aptitude tests
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddTeacher(true)}
                  className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
                >
                  Add Teacher
                </button>
              </div>
            </div>
          </div>

          {/* Teachers List Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  Teacher List
                </h3>
                <div className="flex items-center gap-3">
                  {/* Search Box */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                    <svg
                      className="w-4 h-4 text-gray-400 absolute left-3 top-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm border-b border-gray-200">
                      Sr. No.
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm border-b border-gray-200">
                      Name
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm border-b border-gray-200">
                      Email
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm border-b border-gray-200">
                      Mobile
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm border-b border-gray-200">
                      Branch
                    </th>
                    <th className="text-left py-4 px-6 font-medium text-gray-700 text-sm border-b border-gray-200">
                      Edit
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher, index) => (
                    <tr
                      key={teacher.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm text-gray-900 border-b border-gray-100">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-gray-900 border-b border-gray-100">
                        {teacher.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 border-b border-gray-100">
                        {teacher.email}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-b border-gray-100">
                        {teacher.mobile}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-b border-gray-100">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {teacher.branch}
                        </span>
                      </td>
                      <td className="py-4 px-6 border-b border-gray-100">
                        <button
                          onClick={() => handleEditTeacher(teacher)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between text-sm text-gray-700">
                <span>
                  Showing {filteredTeachers.length} of {teachers.length}{" "}
                  teachers
                </span>
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    Previous
                  </button>
                  <button className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors">
                    1
                  </button>
                  <button className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors">
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Teacher Modal */}
      <AddTeacherModal
        isOpen={showAddTeacher}
        onClose={() => setShowAddTeacher(false)}
        onSave={handleAddTeacher}
      />

      {/* Edit Teacher Modal */}
      {showEditTeacher && selectedTeacher && (
        <Sup_EditTeacher
          closeEditModal={closeEditModal}
          teacher={selectedTeacher}
          onTeacherUpdated={handleTeacherUpdated}
          onTeacherDeleted={handleTeacherDeleted}
        />
      )}
    </div>
  );
};

export default Sup_ViewTeacher;
