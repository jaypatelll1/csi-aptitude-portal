import React, { useState, useRef, useEffect } from "react";
import Sup_Sidebar from "../../components/super-admin/Sup_Sidebar";
import Sup_Navbar from "../../components/super-admin/Sup_Navbar";
import AddDepartmentModal from "../../components/super-admin/Sup_AddDepartment";

const Sup_ViewDepartment = () => {
  const sidebarRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddDepartment, setShowAddDepartment] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [departments, setDepartments] = useState([
    {
      id: 1,
      name: 'Bachelor of Technology in Information Technology',
      duration: 4,
      shortForm: 'INFT'
    },
    {
      id: 2,
      name: 'Bachelor of Technology in Computer Science',
      duration: 4,
      shortForm: 'CMPN'
    },
    {
      id: 3,
      name: 'Bachelor of Technology in Civil Engineering',
      duration: 4,
      shortForm: 'CIVIL'
    },
    {
      id: 4,
      name: 'Bachelor of Technology in Electrical Engineering',
      duration: 4,
      shortForm: 'ELEC'
    },
    {
      id: 5,
      name: 'Bachelor of Technology in Electronics and Telecommunication Engineering',
      duration: 4,
      shortForm: 'EXTC'
    },
    {
      id: 6,
      name: 'Bachelor of Technology in Electronics and Computer Science',
      duration: 4,
      shortForm: 'ECS'
    },
    {
      id: 7,
      name: 'Bachelor of Technology in Electronics and Computer Science',
      duration: 4,
      shortForm: 'ECS'
    },
    {
      id: 8,
      name: 'Bachelor of Technology in Electronics and Computer Science',
      duration: 3,
      shortForm: 'ECS'
    },
    {
      id: 9,
      name: 'Bachelor of Technology in Electronics and Computer Science',
      duration: 4,
      shortForm: 'ECS'
    },
    {
      id: 10,
      name: 'Bachelor of Technology in Electronics and Computer Science',
      duration: 4,
      shortForm: 'ECS'
    }
  ]);

  const handleAddDepartment = (departmentData) => {
    const newDepartment = {
      id: departments.length + 1,
      name: departmentData.name,
      duration: parseInt(departmentData.duration),
      shortForm: departmentData.shortForm
    };
    setDepartments([...departments, newDepartment]);
  };

  const filteredDepartments = departments.filter(department =>
    department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    department.shortForm.toLowerCase().includes(searchTerm.toLowerCase())
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
          {/* Header Section */}
          <div className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">Branch List</h1>
              <button
                onClick={() => setShowAddDepartment(true)}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Department
              </button>
            </div>
          </div>

          {/* Department List Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-center py-4 px-6 font-medium text-gray-700 text-sm border-b border-gray-200 w-20">
                      Sr. No
                    </th>
                    <th className="text-center py-4 px-6 font-medium text-gray-700 text-md border-b border-gray-200">
                      Branch / Course Name
                    </th>
                    <th className="py-4 px-6 font-medium text-gray-700 text-sm border-b border-gray-200 w-32 text-center">
                      Duration (in Years)
                    </th>
                    <th className="py-4 px-6 font-medium text-gray-700 text-sm border-b border-gray-200 w-32 text-center">
                      Short Form
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDepartments.map((department, index) => (
                    <tr key={department.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6 text-sm text-gray-900 border-b border-gray-100 text-center">
                        {index + 1}
                      </td>
                      <td className="py-4 px-6 text-md text-gray-900 border-b border-gray-100 text-center">
                        {department.name}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-b border-gray-100 text-center">
                        {department.duration}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-900 border-b border-gray-100 text-center">
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {department.shortForm}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={showAddDepartment}
        onClose={() => setShowAddDepartment(false)}
        onSave={handleAddDepartment}
      />
    </div>
  );
};

export default Sup_ViewDepartment;
