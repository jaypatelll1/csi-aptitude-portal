import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Dep_PresidentSidebar from "../../components/depPresident/Dep_PresidentSidebar";
import Filter from "../../components/depPresident/Dep_PresidentFilter";
import AddTeacher from "../../components/depPresident/Dep_PresidentAddTeacher";
import EditTeacher from "../../components/depPresident/Dep_PresidentEditTeacher";
import UploadModal from "../../upload/UploadModal";
import Dep_PresidentNavbar from "../../components/depPresident/Dep_PresidentNavbar";
import { useSelector } from "react-redux";
import Loader from "../../components/Loader"; // Added Loader import

const Dep_PresidentTeacherList = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [filteredTeacher, setFilteredTeacher] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numberofpages, setNumberofpages] = useState(14);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deletedUsers, setDeletedUsers] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);
  const [ModalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const currentUser = useSelector((state) => state.user.user);

  // Existing method for file handling
  const handleFileChange = (event) => {
    const file = event.target.files ? event.target.files[0] : null;

    if (!file) {
      console.error("No file selected");
      return;
    }

    const allowedTypes = [
      "application/vnd.ms-excel",
      "text/csv", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (!allowedTypes.includes(file.type)) {
      alert("Invalid file type. Please upload a .csv or .xls file.");
      return;
    }

    setSelectedFile(file);
  };

  // Existing method for user submit
  const handleUserSubmit = async (event) => {
    event.preventDefault();

    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }
    setIsUploading(true);
    const formData = new FormData();
    formData.append("Files", selectedFile);

    try {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

      let response = await axios.post(`${API_BASE_URL}/api/users/upload?role=Teacher`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        withCredentials: true,
      });

      if (response.data.status === "success") {
        if (response.data.warnings && response.data.warnings.length > 0) {
          alert(`Warnings:\n${response.data.warnings.join("\n")}`);
        } else {
          alert("No warnings, data processed successfully.");
        }
      } else {
        alert(`Error: ${response.data.message}`);
      }
      alert("File uploaded successfully!");
      setModalOpen(false);
    } catch (error) {
      console.error("Error uploading file:", error.response ? error.response.data : error.message);
      alert("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false);
    }
  };

  // Existing methods...

  // Fetch data from API (modified to set loading state)
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setIsLoading(true); // Set loading to true before fetch
        let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;

        let url = `${API_BASE_URL}/api/users?role=Teacher`;

        const response = await axios.get(url, {
          withCredentials: true,
        });

        const teacherData = response.data.users;
        setTeachers(teacherData);
      } catch (error) {
        console.error("Error fetching teachers:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetch
      }
    };
    fetchTeachers();
  }, [limit, deletedUsers, useSelector((state) => state.user.user)]);

  // Existing methods...

  return (
    <div className="min-h-screen flex">
      {/* Sidebar Section */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
      >
        <Dep_PresidentSidebar />
      </div>
      <div id="main-section" className=" flex-grow bg-gray-100 h-max">
        <div className="bg-white h-14 border-b border-gray-300 items-end">
          <Dep_PresidentNavbar />
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

        {/* Rest of the existing content */}
        {isLoading ? (
          <div className="flex items-center justify-center h-screen">
            <Loader />
          </div>
        ) : (
          <>
            <div className="flex items-center bg-white h-24 my-6 mx-10 rounded-lg border border-gray-300">
              {/* Existing header content */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="54"
                height="54"
                viewBox="0 0 54 54"
                fill="none"
                className="ml-9"
              >
                <rect width="54" height="54" rx="27" fill="#E6F3FF" />
                <path
                  d="M21.7305 26.5637C23.2123 26.5637 24.6335 25.9675 25.6813 24.9063C26.7291 23.8451 27.3177 22.4057 27.3177 20.9049C27.3177 19.4041 26.7291 17.9648 25.6813 16.9035C24.6335 15.8423 23.2123 15.2461 21.7305 15.2461C20.2487 15.2461 18.8276 15.8423 17.7798 16.9035C16.732 17.9648 16.1433 19.4041 16.1433 20.9049C16.1433 22.4057 16.732 23.8451 17.7798 24.9063C18.8276 25.9675 20.2487 26.5637 21.7305 26.5637ZM31.5072 35.5221C32.4184 35.8999 33.5771 36.1402 35.0521 36.1402C41.9286 36.1402 41.9286 30.9167 41.9286 30.9167C41.9286 30.2243 41.6572 29.5603 41.1739 29.0705C40.6907 28.5808 40.0352 28.3054 39.3516 28.3049H31.3955C32.0711 29.1337 32.4768 30.1941 32.4768 31.352V31.9718C32.4732 32.1184 32.4634 32.2648 32.4476 32.4106C32.3305 33.4983 32.0104 34.5539 31.5072 35.5221ZM39.3516 22.2108C39.3516 23.3653 38.8988 24.4725 38.0928 25.2888C37.2868 26.1051 36.1937 26.5637 35.0538 26.5637C33.9139 26.5637 32.8208 26.1051 32.0148 25.2888C31.2088 24.4725 30.756 23.3653 30.756 22.2108C30.756 21.0563 31.2088 19.9491 32.0148 19.1328C32.8208 18.3165 33.9139 17.8579 35.0538 17.8579C36.1937 17.8579 37.2868 18.3165 38.0928 19.1328C38.8988 19.9491 39.3516 21.0563 39.3516 22.2108ZM12.7051 31.7873C12.7051 30.8637 13.0673 29.9779 13.7121 29.3249C14.3569 28.6718 15.2315 28.3049 16.1433 28.3049H27.3177C28.2296 28.3049 29.1041 28.6718 29.7489 29.3249C30.3937 29.9779 30.756 30.8637 30.756 31.7873C30.756 31.7873 30.756 38.752 21.7305 38.752C12.7051 38.752 12.7051 31.7873 12.7051 31.7873Z"
                  fill="#3B35C3"
                />
              </svg>
              {/* Remaining header content */}
            </div>

            <div
              id="listSection"
              className="bg-white my-6 mx-10 pt-5 pb-5 pl-9 pr-9 rounded-lg border border-gray-300"
            >
              {/* Existing table and pagination content */}
              <div id="headerBar" className="flex justify-between items-center w-full mb-5">
                <h1 className="text-black font-roboto text-[22px] font-semibold leading-normal">
                  Teacher List
                </h1>
                <div className="flex ml-auto">
                  {/* Search input */}
                  <div className="w-full max-w-md ">
                    <div className="relative flex items-center mr-7  rounded-sm hover:scale-110 hover:bg-gray-100 transition-transform duration-100">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        className="w-full pl-10 h-7 text-sm border border-gray-300 bg-transparent "
                      />
                      <svg
                        className="absolute left-3 text-gray-400"
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
              </div>

              {/* Table and rest of the existing content */}
              <table className="min-w-full leading-normal">
                {/* Existing table headers and rows */}
                <thead>
                  <tr className="text-left text-gray-600 uppercase text-sm border-t border-gray-300">
                    <th className="py-4 w-1/8  ">User ID</th>
                    <th className="py-4 w-1/5">Name</th>
                    <th className="py-4 w-1/4">Email</th>
                    <th className="py-4 w-1/5">Mobile</th>
                    <th className="py-4  w-1/8 text-center">Edit</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeacher.slice((page - 1) * limit, page * limit).map((teacher, index) => (
                    <tr key={teacher.user_id} className="hover:bg-gray-50">
                      {/* Existing table row content */}
                      <td className="py-4">
                        {(page - 1) * limit + index + 1}
                      </td>
                      <td className="py-4">{teacher.name}</td>
                      <td className="py-4">{teacher.email}</td>
                      <td className="py-4">{teacher.phone || "N/A"}</td>
                      <td className="py-4 text-center items-center justify-center flex">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="25"
                          height="20"
                          viewBox="0 0 25 20"
                          fill="none"
                          className="cursor-pointer fill-[#B4B4B4] hover:fill-gray-500 hover:scale-150 transition-transform duration-10"
                          onClick={() => handleEditOpen(teacher)()}
                        >
                          {/* Existing SVG content */}
                        </svg>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {getPageNumbers().length > 1 && (
                <div className="flex justify-center items-center mt-5">
                  {/* Existing pagination content */}
                </div>
              )}
            </div>
          </>
        )}

        {/* Existing modal components */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <AddTeacher closeModal={closeModal} />
          </div>
        )}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <EditTeacher
              isEditModalOpen={isEditModalOpen}
              closeEditModal={closeEditModal}
              student={selectedStudent}
              counter={deletedUsersCounter}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dep_PresidentTeacherList;