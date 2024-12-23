import React, { useState } from 'react';

const Filter = ({ toggleFilter, handleFilter }) => {
    const [selectedDepartment, setSelectedDepartment] = useState('');

    const handleSelectChange = (event) => {
        setSelectedDepartment(event.target.value);
    };

    const handleSaveFilter = () => {
        handleFilter(selectedDepartment);
        toggleFilter();
    };

    const handleCancelFilter = () => {
        setSelectedDepartment('');
        handleFilter('');
        toggleFilter();
    };

    return (
        <div className='absolute z-50 mt-4 w-80 p-5 border border-gray-300 rounded-xl bg-white shadow-lg right-0'>
            <h1 className='text-md text-[#877575] mb-2 ml-1'>Department</h1>
            <select
                className="h-8 w-full rounded-lg border border-gray-300 bg-white pl-4 text-md"
                value={selectedDepartment}
                onChange={handleSelectChange}
            >
                <option value="">Set Department</option>
                <option value="INFT">INFT</option>
                <option value="CMPN">CMPN</option>
                <option value="ECS">ECS</option>
                <option value="EXTC">EXTC</option>
                <option value="ELEC">ELEC</option>
            </select>
            <div className='flex'>
            <button
                className=' w-32 mt-4 px-5 py-1 bg-blue-600 rounded-sm text-white text-md'
                onClick={handleSaveFilter}
            >
                Save Filter
            </button>
            <button
                className='w-32 mt-4 ml-3 px-5 py-1 bg-gray-300 rounded-sm text-md'
                onClick={handleCancelFilter}
            >
                Cancel
            </button>
            </div>
        </div>
    );
};

export default Filter;