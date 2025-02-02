import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Filter from "../../components/admin/Adm_Filter";
import AddStudent from "../../components/admin/Adm_AddStudent";
import EditStudent from "../../components/admin/Adm_EditStudent";
import UploadModal from "../../upload/UploadModal";
import Adm_Navbar from "../../components/admin/Adm_Navbar";
// const API_BASE_URL = process.env.BACKEND_BASE_URL;

const StudentList = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(undefined);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [numberofpages, setNumberofpages] = useState(14);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deletedUsers, setDeletedUsers] = useState(1);
  const [sidebarOpen, setSidebarOpen] = useState(false); // State for toggling sidebar
  const sidebarRef = useRef(null);
  const [ModalOpen, setModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

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
     
      let response = await axios.post(
        `${API_BASE_URL}/api/users/upload`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true, // Make sure the cookie is sent with the request
        }
      );

      console.log("Response:", response.data); // You can inspect the response

      if (response.data.status === 'success') {
        console.log("File processed successfully");

        // If there are warnings, display them to the user
        if (response.data.warnings && response.data.warnings.length > 0) {
            alert(`Warnings:\n${response.data.warnings.join('\n')}`);
        } else {
            alert('No warnings, data processed successfully.');
        }
        
    } else {
        alert(`Error: ${response.data.message}`);
    }
      alert("File uploaded successfully!"); // Notify the user of success
      setModalOpen(false); // Close modal after successful upload
    } catch (error) {
      console.error(
        "Error uploading file:",
        error.response ? error.response.data : error.message
      );
      alert("An error occurred while uploading the file.");
    } finally {
      setIsUploading(false); // Unlock the upload button after the process finishes
    }
  };

  const deletedUsersCounter = () => {
    setDeletedUsers(deletedUsers + 1);
  };

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
        const response = await axios.get(
          `${API_BASE_URL}/api/users/?page=1&role=Student&limit=1000`,
          {
            withCredentials: true, // Make sure the cookie is sent with the request
          }
        );
        const studentData = response.data.users;
        setStudents(studentData);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    fetchStudents();
  }, [limit, deletedUsers]);

  useEffect(() => {
    let filtered = students;

    // Apply department filter
    if (selectedDepartment) {
      filtered = filtered.filter(
        (student) => student.department === selectedDepartment
      );
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.department
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          student.phone?.toString().includes(searchTerm) ||
          student.user_id.toString().includes(searchTerm)
      );
    }

    setFilteredStudents(filtered);
    const totalPages = Math.ceil(filtered.length / limit);
    setNumberofpages(totalPages);
  }, [selectedDepartment, students, limit, searchTerm]);

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
  const handleFilterChange = (department) => {
    setSelectedDepartment(department);
  };

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const openEditModal = () => setIsEditModalOpen(true);
  const closeEditModal = () => setIsEditModalOpen(false);

  const handleEditOpen = (student) => {
    return () => {
      console.log("hehe", student);
      setSelectedStudent(student);
      openEditModal();
    };
  };
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
        <div className="flex items-center bg-white h-24 my-6 mx-10 rounded-lg border border-gray-300">
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
          <div className="ml-9">
            <h1 className="text-[#9C9C9C] font-poppins text-[18px] font-medium leading-normal">
              Import Students
            </h1>
            <h1 className="text-black font-poppins text-[18px] font-medium leading-normal">
              Register students to gain access to aptitude tests
            </h1>
          </div>
          <div className="flex ml-auto mr-9">
            <div className="bg-[#533FCC] w-32 xl:w-40 h-14 rounded-xl flex items-center justify-center mr-5 hover:bg-[#2d2170] transition-all duration-200 cursor-pointer">
              <button
                className="text-white font-poppins text-lg font-medium leading-normal "
                onClick={() => setModalOpen(true)} // Open modal
              >
                Import Excel
              </button>

              <UploadModal
                isOpen={ModalOpen}
                check="Upload Students"
                closeModal={() => setModalOpen(false)} // Close modal
                onFileChange={handleFileChange}
                onSubmit={handleUserSubmit}
                isUploading={isUploading} // Pass isUploading state to the modal
              />
            </div>
            <div
              onClick={openModal}
              className="bg-[#533FCC] w-32 xl:w-40 h-14 rounded-xl flex items-center justify-center hover:bg-[#2d2170] transition-all duration-200 cursor-pointer"
            >
              <h1 className="text-white font-poppins text-lg font-medium leading-nor cursor-pointermal ">
                Add Student
              </h1>
            </div>
          </div>
        </div>
        <div
          id="listSection"
          className="bg-white my-6 mx-10 pt-5 pb-5 pl-9 pr-9 rounded-lg border border-gray-300"
        >
          <div
            id="headerBar"
            className="flex justify-between items-center w-full mb-5"
          >
            <h1 className="text-black font-roboto text-[22px] font-semibold leading-normal">
              Students List
            </h1>
            <div className="flex ml-auto">
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
              <div className="relative">
                <div
                  id="filterButton"
                  onClick={toggleFilter}
                  className="cursor-pointer w-20 h-7 border border-gray-300 rounded-sm flex items-center justify-center text-center hover:bg-gray-100 hover:scale-110 transition-transform duration-100"
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
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                  <h1 className="ml-1 text-sm text-gray-500">Filter</h1>
                </div>
                {showFilter && (
                  <Filter
                    toggleFilter={toggleFilter}
                    handleFilter={handleFilterChange}
                  />
                )}
              </div>
            </div>
          </div>
          <table className="min-w-full leading-normal">
            <thead>
              <tr className="text-left text-gray-600 uppercase text-sm border-t border-gray-300">
                {/* <th className="py-3"></th> */}
                <th className="py-4 w-1/8  ">User ID</th>
                <th className="py-4 w-1/5">Name</th>
                <th className="py-4 w-1/4">Email</th>
                <th className="py-4 w-1/5">Mobile</th>
                <th className="py-4 w-1/8">Department</th>
                <th className="py-4  w-1/8 text-center">Edit</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents
                .slice((page - 1) * limit, page * limit)
                .map((student, index) => (
                  <tr key={student.user_id} className="hover:bg-gray-50">
                    {/* <td className='py-4 px-5 text-blue-700 font-bold'>{index + 1}</td> */}
                    <td className="py-4">{index+1}</td>
                    <td className="py-4">{student.name}</td>
                    <td className="py-4">{student.email}</td>
                    <td className="py-4">{student.phone || "N/A"}</td>
                    <td className="py-4">{student.department || "N/A"}</td>
                    <td className="py-4 text-center items-center justify-center flex">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="25"
                        height="20"
                        viewBox="0 0 25 20"
                        fill="none"
                        className="cursor-pointer fill-[#B4B4B4] hover:fill-gray-500 hover:scale-150 transition-transform duration-10"
                        onClick={() => handleEditOpen(student)()}
                      >
                        <g clip-path="url(#clip0_1384_6358)">
                          <path d="M8.75 10C11.5117 10 13.75 7.76172 13.75 5C13.75 2.23828 11.5117 0 8.75 0C5.98828 0 3.75 2.23828 3.75 5C3.75 7.76172 5.98828 10 8.75 10ZM12.25 11.25H11.5977C10.7305 11.6484 9.76562 11.875 8.75 11.875C7.73438 11.875 6.77344 11.6484 5.90234 11.25H5.25C2.35156 11.25 0 13.6016 0 16.5V18.125C0 19.1602 0.839844 20 1.875 20H12.6133C12.5195 19.7344 12.4805 19.4531 12.5117 19.168L12.7773 16.7891L12.8242 16.3555L13.1328 16.0469L16.1523 13.0273C15.1953 11.9453 13.8086 11.25 12.25 11.25ZM14.0195 16.9258L13.7539 19.3086C13.7109 19.707 14.0469 20.043 14.4414 19.9961L16.8203 19.7305L22.207 14.3438L19.4062 11.543L14.0195 16.9258ZM24.7266 10.5039L23.2461 9.02344C22.8828 8.66016 22.2891 8.66016 21.9258 9.02344L20.4492 10.5L20.2891 10.6602L23.0938 13.4609L24.7266 11.8281C25.0898 11.4609 25.0898 10.8711 24.7266 10.5039Z" />
                        </g>
                        <defs>
                          <clipPath id="clip0_1384_6358">
                            <rect width="25" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
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
                fill-rule="evenodd"
                clip-rule="evenodd"
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
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M10.1569 11.2884L4.49994 5.63137L3.08594 7.04537L8.03594 11.9954L3.08594 16.9454L4.49994 18.3594L10.1569 12.7024C10.3444 12.5148 10.4497 12.2605 10.4497 11.9954C10.4497 11.7302 10.3444 11.4759 10.1569 11.2884Z"
                fill="black"
              />
            </svg>
          </div>
        </div>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <AddStudent closeModal={closeModal} />
          </div>
        )}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <EditStudent
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

export default StudentList;
