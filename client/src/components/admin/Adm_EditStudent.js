import React, { useState } from "react";
import axios from "axios";

const EditStudent = ({ closeEdit }) => {
    return (
        <div className='flex h-screen'>
            <Adm_Sidebar />
            <div id="main-section" className='ml-64 flex-grow bg-gray-100 h-max'>
                <div className='bg-white h-14 border-b border-gray-300'></div>
                <div className='flex items-center bg-white h-24 my-6 mx-10 rounded-lg border border-gray-300'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54" fill="none" className="ml-9">
                        <rect width="54" height="54" rx="27" fill="#E6F3FF" />
                        <path d="M21.7305 26.5637C23.2123 26.5637 24.6335 25.9675 25.6813 24.9063C26.7291 23.8451 27.3177 22.4057 27.3177 20.9049C27.3177 19.4041 26.7291 17.9648 25.6813 16.9035C24.6335 15.8423 23.2123 15.2461 21.7305 15.2461C20.2487 15.2461 18.8276 15.8423 17.7798 16.9035C16.732 17.9648 16.1433 19.4041 16.1433 20.9049C16.1433 22.4057 16.732 23.8451 17.7798 24.9063C18.8276 25.9675 20.2487 26.5637 21.7305 26.5637ZM31.5072 35.5221C32.4184 35.8999 33.5771 36.1402 35.0521 36.1402C41.9286 36.1402 41.9286 30.9167 41.9286 30.9167C41.9286 30.2243 41.6572 29.5603 41.1739 29.0705C40.6907 28.5808 40.0352 28.3054 39.3516 28.3049H31.3955C32.0711 29.1337 32.4768 30.1941 32.4768 31.352V31.9718C32.4732 32.1184 32.4634 32.2648 32.4476 32.4106C32.3305 33.4983 32.0104 34.5539 31.5072 35.5221ZM39.3516 22.2108C39.3516 23.3653 38.8988 24.4725 38.0928 25.2888C37.2868 26.1051 36.1937 26.5637 35.0538 26.5637C33.9139 26.5637 32.8208 26.1051 32.0148 25.2888C31.2088 24.4725 30.756 23.3653 30.756 22.2108C30.756 21.0563 31.2088 19.9491 32.0148 19.1328C32.8208 18.3165 33.9139 17.8579 35.0538 17.8579C36.1937 17.8579 37.2868 18.3165 38.0928 19.1328C38.8988 19.9491 39.3516 21.0563 39.3516 22.2108ZM12.7051 31.7873C12.7051 30.8637 13.0673 29.9779 13.7121 29.3249C14.3569 28.6718 15.2315 28.3049 16.1433 28.3049H27.3177C28.2296 28.3049 29.1041 28.6718 29.7489 29.3249C30.3937 29.9779 30.756 30.8637 30.756 31.7873C30.756 31.7873 30.756 38.752 21.7305 38.752C12.7051 38.752 12.7051 31.7873 12.7051 31.7873Z" fill="#3B35C3" />
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
                        <div onClick={openEdit} className="bg-[#533FCC] w-40 h-14 rounded-xl flex items-center justify-center">
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
                                {showFilter && <Filter toggleFilter={toggleFilter} handleFilter={handleFilterChange} />}
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
                                    <td className="py-4 text-center items-center justify-center flex">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="20" viewBox="0 0 25 20" fill="none">
                                            <g clip-path="url(#clip0_1384_6358)">
                                                <path d="M8.75 10C11.5117 10 13.75 7.76172 13.75 5C13.75 2.23828 11.5117 0 8.75 0C5.98828 0 3.75 2.23828 3.75 5C3.75 7.76172 5.98828 10 8.75 10ZM12.25 11.25H11.5977C10.7305 11.6484 9.76562 11.875 8.75 11.875C7.73438 11.875 6.77344 11.6484 5.90234 11.25H5.25C2.35156 11.25 0 13.6016 0 16.5V18.125C0 19.1602 0.839844 20 1.875 20H12.6133C12.5195 19.7344 12.4805 19.4531 12.5117 19.168L12.7773 16.7891L12.8242 16.3555L13.1328 16.0469L16.1523 13.0273C15.1953 11.9453 13.8086 11.25 12.25 11.25ZM14.0195 16.9258L13.7539 19.3086C13.7109 19.707 14.0469 20.043 14.4414 19.9961L16.8203 19.7305L22.207 14.3438L19.4062 11.543L14.0195 16.9258ZM24.7266 10.5039L23.2461 9.02344C22.8828 8.66016 22.2891 8.66016 21.9258 9.02344L20.4492 10.5L20.2891 10.6602L23.0938 13.4609L24.7266 11.8281C25.0898 11.4609 25.0898 10.8711 24.7266 10.5039Z" fill="#B4B4B4" />
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
                        <svg onClick={handlePrevPage} xmlns="http://www.w3.org/2000/svg" width="12" height="24" viewBox="0 0 12 24" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M1.84306 11.2884L7.50006 5.63137L8.91406 7.04537L3.96406 11.9954L8.91406 16.9454L7.50006 18.3594L1.84306 12.7024C1.65559 12.5148 1.55028 12.2605 1.55028 11.9954C1.55028 11.7302 1.65559 11.4759 1.84306 11.2884Z" fill="black" />
                        </svg>
                        <div className="flex">
                            {getPageNumbers().map((p) => (
                                <div
                                    key={p}
                                    className={`w-8 h-8 flex items-center justify-center mx-1 cursor-pointer ${page === p ? 'bg-blue-300 rounded-md' : 'bg-white'}`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </div>
                            ))}
                        </div>
                        <svg onClick={handleNextPage} xmlns="http://www.w3.org/2000/svg" width="12" height="24" viewBox="0 0 12 24" fill="none">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M10.1569 11.2884L4.49994 5.63137L3.08594 7.04537L8.03594 11.9954L3.08594 16.9454L4.49994 18.3594L10.1569 12.7024C10.3444 12.5148 10.4497 12.2605 10.4497 11.9954C10.4497 11.7302 10.3444 11.4759 10.1569 11.2884Z" fill="black" />
                        </svg>
                    </div>
                </div>
                {isEditOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                        <AddStudent closeEdit={closeEdit} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditStudent;
