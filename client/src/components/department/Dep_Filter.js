import React, { useState } from 'react';

const Dep_Filter = ({ toggleFilter, handleFilter }) => {
    const [selectedOption, setSelectedOption] = useState('');

    const handleSelectChange = (event) => {
        setSelectedOption(event.target.value);
    };

    const handleSaveFilter = () => {
        handleFilter(selectedOption);
        toggleFilter();
    };

    const handleCancelFilter = () => {
        setSelectedOption('');
        handleFilter('');
        toggleFilter();
    };

    return (
        <div className='absolute z-50 mt-4 w-80 p-5 border border-gray-300 rounded-xl bg-white shadow-lg right-0'>
            <h1 className='text-md text-[#877575] mb-2 ml-1'>Performance</h1>
            <select
                className="h-8 w-full rounded-lg border border-gray-300 bg-white pl-4 text-md"
                value={selectedOption}
                onChange={handleSelectChange}
            >
                <option value="">Select Option</option>
                <option value="top_performers">Top Performers</option>
                <option value="bottom_performers">Bottom Performers</option>
            </select>
            <div className='flex'>
            <button
                className='w-32 mt-4 px-5 py-1 bg-blue-600 rounded-sm text-white text-md'
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

export default Dep_Filter;