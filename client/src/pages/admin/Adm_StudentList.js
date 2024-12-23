import React ,{useState}from 'react';
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";
import Filter from '../../components/admin/Adm_Filter';

const students = [
    { id: 1, name: 'Shree Shinde', email: 'shreeshinde-inft@atharvacoe.ac.in', mobile: '9501956750', branch: 'INFT' },
    { id: 2, name: 'Shravani P.', email: 'shravani-pawar-inft@atharvacoe.ac.in', mobile: '7725068610', branch: 'INFT' },
    { id: 3, name: 'Wade Warren', email: 'WadeWarren-inft@atharvacoe.ac.in', mobile: '0367871221', branch: 'CMPN' },
    { id: 4, name: 'Guy Hawkins', email: 'GuyHawkins-inft@atharvacoe.ac.in', mobile: '3954212189', branch: 'EXTC' },
    { id: 5, name: 'Robert Fox', email: 'RobertFox-inft@atharvacoe.ac.in', mobile: '3910793817', branch: 'INFT' },
];



const StudentList = () => {
    const [showFilter, setShowFilter] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(undefined);

    const toggleFilter = () => {
        setShowFilter(!showFilter);
    };
    const handleFilterChange = (department) => {
        setSelectedDepartment(department);
    };
    const filteredStudents = students.filter(student => 
        selectedDepartment ? student.branch === selectedDepartment : true 
    );

    console.log('Selected Dept:',selectedDepartment);
    return (
        <div className='flex h-screen'>
            <Adm_Sidebar />
            <div id="main-section" className='ml-64 flex-grow bg-gray-100'>
                <div className='bg-white h-14 border-b border-gray-300'></div>
                <div className='flex items-center bg-white h-24 my-6 mx-10  rounded-lg border border-gray-300'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="54" height="54" viewBox="0 0 54 54" fill="none" className='ml-9'>
                        <rect width="54" height="54" rx="27" fill="#E6F3FF" />
                        <path d="M21.7305 26.5637C23.2123 26.5637 24.6335 25.9675 25.6813 24.9063C26.7291 23.8451 27.3177 22.4057 27.3177 20.9049C27.3177 19.4041 26.7291 17.9648 25.6813 16.9035C24.6335 15.8423 23.2123 15.2461 21.7305 15.2461C20.2487 15.2461 18.8276 15.8423 17.7798 16.9035C16.732 17.9648 16.1433 19.4041 16.1433 20.9049C16.1433 22.4057 16.732 23.8451 17.7798 24.9063C18.8276 25.9675 20.2487 26.5637 21.7305 26.5637ZM31.5072 35.5221C32.4184 35.8999 33.5771 36.1402 35.0521 36.1402C41.9286 36.1402 41.9286 30.9167 41.9286 30.9167C41.9286 30.2243 41.6572 29.5603 41.1739 29.0705C40.6907 28.5808 40.0352 28.3054 39.3516 28.3049H31.3955C32.0711 29.1337 32.4768 30.1941 32.4768 31.352V31.9718C32.4732 32.1184 32.4634 32.2648 32.4476 32.4106C32.3305 33.4983 32.0104 34.5539 31.5072 35.5221ZM39.3516 22.2108C39.3516 23.3653 38.8988 24.4725 38.0928 25.2888C37.2868 26.1051 36.1937 26.5637 35.0538 26.5637C33.9139 26.5637 32.8208 26.1051 32.0148 25.2888C31.2088 24.4725 30.756 23.3653 30.756 22.2108C30.756 21.0563 31.2088 19.9491 32.0148 19.1328C32.8208 18.3165 33.9139 17.8579 35.0538 17.8579C36.1937 17.8579 37.2868 18.3165 38.0928 19.1328C38.8988 19.9491 39.3516 21.0563 39.3516 22.2108ZM12.7051 31.7873C12.7051 30.8637 13.0673 29.9779 13.7121 29.3249C14.3569 28.6718 15.2315 28.3049 16.1433 28.3049H27.3177C28.2296 28.3049 29.1041 28.6718 29.7489 29.3249C30.3937 29.9779 30.756 30.8637 30.756 31.7873C30.756 31.7873 30.756 38.752 21.7305 38.752C12.7051 38.752 12.7051 31.7873 12.7051 31.7873Z" fill="#3B35C3" />
                    </svg>
                    <div class="ml-9">
                        <h1 class="text-[#9C9C9C] font-poppins text-[18px] font-medium leading-normal">Import Students</h1>
                        <h1 class="text-black font-poppins text-[18px] font-medium leading-normal">Register students to gain access to aptitude tests</h1>
                    </div>
                    <div className='flex ml-auto mr-9'>
                        <div class="bg-[#533FCC] w-40 h-14 rounded-xl flex items-center justify-center mr-5">
                            <h1 className='text-white font-poppins text-lg font-medium leading-normal'>Import Excel</h1>
                        </div>
                        <div class="bg-[#533FCC] w-40 h-14 rounded-xl flex items-center justify-center">
                            <h1 className='text-white font-poppins text-lg font-medium leading-normal'>Add Student</h1>
                        </div>
                    </div>
                </div>
                <div id="listSection" className='bg-white my-6 mx-10 pt-5 pb-5 pl-9 pr-9  rounded-lg border border-gray-300'>
                    <div id="headerBar" className=" flex justify-between items-center w-full mb-5">
                        <h1 className='text-black font-roboto text-[22px] font-semibold leading-normal'>Students List</h1>
                        <div className=' flex ml-auto'>
                            <div id="searchBar" className='w-52 h-7 border border-gray-300 rounded-sm  flex items-center justify-left pl-5 mr-6'>
                                <svg  className="" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="M11.9665 11.9837L14.1482 14.1654M13.459 8.14453C13.459 9.55349 12.8993 10.9047 11.903 11.901C10.9067 12.8973 9.55545 13.457 8.14648 13.457C6.73752 13.457 5.38627 12.8973 4.38998 11.901C3.39369 10.9047 2.83398 9.55349 2.83398 8.14453C2.83398 6.73557 3.39369 5.38431 4.38998 4.38803C5.38627 3.39174 6.73752 2.83203 8.14648 2.83203C9.55545 2.83203 10.9067 3.39174 11.903 4.38803C12.8993 5.38431 13.459 6.73557 13.459 8.14453Z" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <h1 className='ml-1 text-md'>Search</h1>
                            </div>
                            <div className='relative'>
                            <div id="filterButton" 
                                onClick={toggleFilter} 
                                className='cursor-pointer w-20 h-7 border border-gray-300 rounded-sm flex items-center justify-center'>
                                <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                                    <path d="M14.1673 3.96536C14.1673 3.5687 14.1673 3.37036 14.0894 3.21878C14.0217 3.08561 13.9136 2.97727 2413.7806 2.90924C13.629 2.83203 13.4306 2.83203 13.034 2.83203H3.96732C3.57065 2.83203 3.37232 2.83203 3.22073 2.90924C3.08746 2.97715 2.9791 3.08551 2.91119 3.21878C2.83398 3.37036 2.83398 3.5687 2.83398 3.96536V4.48741C2.83398 4.66095 2.83398 4.74736 2.85382 4.82882C2.87116 4.90134 2.89985 4.97067 2.93882 5.03424C2.98203 5.10507 3.04365 5.1667 3.16548 5.28924L6.75178 8.87482C6.87432 8.99736 6.93594 9.05899 6.97915 9.12982C7.01835 9.19404 7.04668 9.26252 7.06415 9.33524C7.08398 9.41599 7.08398 9.5017 7.08398 9.67099V13.0398C7.08398 13.6469 7.08398 13.9507 7.21148 14.1335C7.2668 14.2125 7.33768 14.2794 7.41978 14.3301C7.50187 14.3808 7.59345 14.4141 7.6889 14.4282C7.90919 14.4607 8.18119 14.3254 8.72378 14.0534L9.29044 13.7701C9.51853 13.6568 9.63186 13.6001 9.71473 13.5151C9.78825 13.44 9.84414 13.3495 9.87836 13.2502C9.91732 13.1383 9.91732 13.0108 9.91732 12.7565V9.67666C9.91732 9.50311 9.91732 9.4167 9.93715 9.33524C9.9545 9.26272 9.98318 9.19339 10.0222 9.12982C10.0647 9.05899 10.1263 8.99807 10.2467 8.87766L10.2495 8.87482L13.8358 5.28924C13.9576 5.1667 14.0186 5.10507 14.0625 5.03424C14.1017 4.97002 14.13 4.90154 14.1475 4.82882C14.1673 4.74878 14.1673 4.66236 14.1673 4.49307V3.96536Z" stroke="#0A0A0A" stroke-linecap="round" stroke-linejoin="round" />
                                </svg>
                                <h1 className='ml-1 text-md'>Filter</h1></div>
                                {showFilter && <Filter toggleFilter={toggleFilter} handleFilter={handleFilterChange}/>}
                        </div>
                        </div>
                    </div>
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="text-left text-gray-600 uppercase text-sm border-t border-gray-300">
                                <th className="py-3"></th>
                                <th className="py-3 ">Name</th>
                                <th className="py-3 ">Email</th>
                                <th className="py-3 ">Mobile</th>
                                <th className="py-3 ">Branch</th>
                                <th className="py-3  text-center">Edit</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents.map((student, index) => (
                                <tr key={student.id} className="hover:bg-gray-50">
                                    <td className='py-4 px-5'>{index + 1}</td>
                                    <td className="py-4 ">{student.name}</td>
                                    <td className="py-4 ">{student.email}</td>
                                    <td className="py-4 ">{student.mobile}</td>
                                    <td className="py-4 ">{student.branch}</td>
                                    <td className="py-4  text-center">
                                        <i className="fas fa-user-edit text-gray-500 cursor-pointer hover:text-indigo-600"></i>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            
            </div>
        </div>
    );
};

export default StudentList;