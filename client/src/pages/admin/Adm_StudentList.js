import React, { useState, useEffect } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Filter from '../../components/admin/Adm_Filter';
import AddStudent from '../../components/admin/Adm_AddStudent';

const StudentList = () => {
    const [showFilter, setShowFilter] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(undefined);
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fetch data from API
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const response = await axios.get('/api/users');
                // Filter only students
                const studentData = response.data.users.filter(user => user.role === 'Student');
                setStudents(studentData);
                setFilteredStudents(studentData);
            } catch (error) {
                console.error("Error fetching students:", error);
            }
        };
        fetchStudents();
    }, []);

    const toggleFilter = () => {
        setShowFilter(!showFilter);
    };

    const handleFilterChange = (department) => {
        setSelectedDepartment(department);
        const filtered = students.filter(student => 
            department ? student.department === department : true
        );
        setFilteredStudents(filtered);
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    return (
        <div className='flex h-screen'>
            <Adm_Sidebar />
            <div id="main-section" className='ml-64 flex-grow bg-gray-100 h-max'>
                <div className='bg-white h-14 border-b border-gray-300'></div>
                <div className='flex items-center bg-white h-24 my-6 mx-10 rounded-lg border border-gray-300'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54" fill="none" className='ml-9'>
                        <rect width="54" height="54" rx="27" fill="#E6F3FF" />
                        <path d="..." fill="#3B35C3" />
                    </svg>
                    <div className="ml-9">
                        <h1 className="text-[#9C9C9C] font-poppins text-[18px] font-medium leading-normal">
                            Import Students
                        </h1>
                        <h1 className="text-black font-poppins text-[18px] font-medium leading-normal">
                            Register students to gain access to aptitude tests
                        </h1>
                    </div>
                    <div className='flex ml-auto mr-9'>
                        <div className="bg-[#533FCC] w-40 h-14 rounded-xl flex items-center justify-center mr-5">
                            <h1 className='text-white font-poppins text-lg font-medium leading-normal'>Import Excel</h1>
                        </div>
                        <div onClick={openModal} className="bg-[#533FCC] w-40 h-14 rounded-xl flex items-center justify-center">
                            <h1 className='text-white font-poppins text-lg font-medium leading-normal'>Add Student</h1>
                        </div>
                    </div>
                </div>
                <div id="listSection" className='bg-white my-6 mx-10 pt-5 pb-5 pl-9 pr-9 rounded-lg border border-gray-300'>
                    <div id="headerBar" className="flex justify-between items-center w-full mb-5">
                        <h1 className='text-black font-roboto text-[22px] font-semibold leading-normal'>Students List</h1>
                        <div className='flex ml-auto'>
                            <div id="searchBar" className='w-52 h-7 border border-gray-300 rounded-sm flex items-center justify-left pl-5 mr-6'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="..." stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <h1 className='ml-1 text-md'>Search</h1>
                            </div>
                            <div className='relative'>
                                <div id="filterButton" 
                                    onClick={toggleFilter} 
                                    className='cursor-pointer w-20 h-7 border border-gray-300 rounded-sm flex items-center justify-center'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                        <path d="..." stroke="#0A0A0A" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    <h1 className='ml-1 text-md'>Filter</h1>
                                </div>
                                {showFilter && <Filter toggleFilter={toggleFilter} handleFilter={handleFilterChange}/>}
                            </div>
                        </div>
                    </div>
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="text-left text-gray-600 uppercase text-sm border-t border-gray-300">
                                <th className="py-3"></th>
                                <th className="py-3">Name</th>
                                <th className="py-3">Email</th>
                                <th className="py-3">Mobile</th>
                                <th className="py-3">Department</th>
                                <th className="py-3 text-center">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={student.user_id} className="hover:bg-gray-50">
                                    <td className='py-4 px-5'>{index + 1}</td>
                                    <td className="py-4">{student.name}</td>
                                    <td className="py-4">{student.email}</td>
                                    <td className="py-4">{student.mobile || "N/A"}</td>
                                    <td className="py-4">{student.department || "N/A"}</td>
                                    <td className="py-4 text-center">
                                        <i className="fas fa-user-edit text-gray-500 cursor-pointer hover:text-indigo-600"></i>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <AddStudent closeModal={closeModal} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentList;
