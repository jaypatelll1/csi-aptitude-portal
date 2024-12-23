import React from 'react';
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";

const Adm_StudentList = () => {
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
                        <div class="bg-[#533FCC] w-[160px] h-14 rounded-xl flex items-center justify-center mr-5">
                            <h1 className='text-white font-poppins text-[18px] font-medium leading-normal'>Import Excel</h1>
                        </div>
                        <div class="bg-[#533FCC] w-[160px] h-14 rounded-xl flex items-center justify-center">
                            <h1 className='text-white font-poppins text-[18px] font-medium leading-normal'>Add Student</h1>
                        </div>
                    </div>
                </div>
                <div id="listSection" className='flex bg-white my-6 mx-10  rounded-lg border border-gray-300'>
                    <div id="headerBar" className="pt-5 pb-5 pl-9 flex items-center justify-between">
                        <h1 className='text-black font-roboto text-[22px] font-semibold leading-normal'>Students List</h1>
                        <div id="filterButton" className='w-16 h-6 border border-gray-300 rounded-sm '>FIlter</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Adm_StudentList;