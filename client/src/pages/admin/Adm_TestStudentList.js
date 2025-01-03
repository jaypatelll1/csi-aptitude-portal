import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Adm_Sidebar from "../../components/admin/Adm_Sidebar";


const TestStudentList = () => {
    const sampleStudents = [
        { user_id: 1, name: "John Doe", date: "20/DEC/2024", email: "johndoe-cmpn@atharvacoe.ac.in", results: "Passed", marks: "18/20", time: "25min" },
        { user_id: 2, name: "Jane Smith", date: "20/DEC/2024", email: "janesmith-inft@atharvacoe.ac.in", results: "Failed", marks: "10/20", time: "30min" },
        { user_id: 3, name: "Alice Johnson", date: "20/DEC/2024", email: "alicejohnson-ecs@atharvacoe.ac.in", results: "Passed", marks: "15/20", time: "20min" },
        { user_id: 4, name: "Bob Brown", date: "20/DEC/2024", email: "bobbrown-elec@atharvacoe.ac.in", results: "Passed", marks: "20/20", time: "22min" },
        { user_id: 5, name: "Charlie Davis", date: "20/DEC/2024", email: "charliedavis-extc@atharvacoe.ac.in", results: "Failed", marks: "12/20", time: "28min" },
        { user_id: 6, name: "David Evans", date: "20/DEC/2024", email: "davidevans-cmpn@atharvacoe.ac.in", results: "Passed", marks: "17/20", time: "24min" },
        { user_id: 7, name: "Eve Foster", date: "21/DEC/2024", email: "evefoster-inft@atharvacoe.ac.in", results: "Failed", marks: "9/20", time: "30min" },
        { user_id: 8, name: "Frank Green", date: "22/DEC/2024", email: "frankgreen-ecs@atharvacoe.ac.in", results: "Passed", marks: "16/20", time: "26min" },
        { user_id: 9, name: "Grace Harris", date: "23/DEC/2024", email: "graceharris-elec@atharvacoe.ac.in", results: "Passed", marks: "19/20", time: "23min" },
        { user_id: 10, name: "Hank Irving", date: "24/DEC/2024", email: "hankirving-extc@atharvacoe.ac.in", results: "Failed", marks: "11/20", time: "29min" },
        { user_id: 11, name: "Ivy Johnson", date: "25/DEC/2024", email: "ivyjohnson-cmpn@atharvacoe.ac.in", results: "Passed", marks: "14/20", time: "21min" },
        { user_id: 12, name: "Jack King", date: "26/DEC/2024", email: "jackking-inft@atharvacoe.ac.in", results: "Passed", marks: "20/20", time: "20min" },
        { user_id: 13, name: "Karen Lee", date: "27/DEC/2024", email: "karenlee-ecs@atharvacoe.ac.in", results: "Failed", marks: "13/20", time: "27min" },
        { user_id: 14, name: "Leo Martin", date: "28/DEC/2024", email: "leomartin-elec@atharvacoe.ac.in", results: "Passed", marks: "18/20", time: "25min" },
        { user_id: 15, name: "Mia Nelson", date: "29/DEC/2024", email: "mianelson-extc@atharvacoe.ac.in", results: "Failed", marks: "10/20", time: "30min" },
        { user_id: 16, name: "Nina Owens", date: "30/DEC/2024", email: "ninaowens-cmpn@atharvacoe.ac.in", results: "Passed", marks: "15/20", time: "20min" },
        { user_id: 17, name: "Oscar Perez", date: "31/DEC/2024", email: "oscarperez-inft@atharvacoe.ac.in", results: "Passed", marks: "20/20", time: "22min" },
        { user_id: 18, name: "Paul Quinn", date: "01/JAN/2025", email: "paulquinn-ecs@atharvacoe.ac.in", results: "Failed", marks: "12/20", time: "28min" },
        { user_id: 19, name: "Quincy Roberts", date: "02/JAN/2025", email: "quincyroberts-elec@atharvacoe.ac.in", results: "Passed", marks: "17/20", time: "24min" },
        { user_id: 20, name: "Rachel Scott", date: "03/JAN/2025", email: "rachelscott-extc@atharvacoe.ac.in", results: "Failed", marks: "9/20", time: "30min" },
        { user_id: 21, name: "Sam Taylor", date: "04/JAN/2025", email: "samtaylor-cmpn@atharvacoe.ac.in", results: "Passed", marks: "16/20", time: "26min" },
        { user_id: 22, name: "Tina Underwood", date: "05/JAN/2025", email: "tinaunderwood-inft@atharvacoe.ac.in", results: "Passed", marks: "19/20", time: "23min" },
        { user_id: 23, name: "Uma Vance", date: "06/JAN/2025", email: "umavance-ecs@atharvacoe.ac.in", results: "Failed", marks: "11/20", time: "29min" },
        { user_id: 24, name: "Victor White", date: "07/JAN/2025", email: "victorwhite-elec@atharvacoe.ac.in", results: "Passed", marks: "14/20", time: "21min" },
        { user_id: 25, name: "Wendy Xander", date: "08/JAN/2025", email: "wendyxander-extc@atharvacoe.ac.in", results: "Passed", marks: "20/20", time: "20min" },
        { user_id: 26, name: "Xander Young", date: "09/JAN/2025", email: "xanderyoung-cmpn@atharvacoe.ac.in", results: "Failed", marks: "13/20", time: "27min" },
        { user_id: 27, name: "Yara Zane", date: "10/JAN/2025", email: "yarazane-inft@atharvacoe.ac.in", results: "Passed", marks: "18/20", time: "25min" },
        { user_id: 28, name: "Zane Adams", date: "11/JAN/2025", email: "zaneadams-ecs@atharvacoe.ac.in", results: "Failed", marks: "10/20", time: "30min" },
        { user_id: 29, name: "Amy Baker", date: "12/JAN/2025", email: "amybaker-elec@atharvacoe.ac.in", results: "Passed", marks: "15/20", time: "20min" },
        { user_id: 30, name: "Brian Clark", date: "13/JAN/2025", email: "brianclark-extc@atharvacoe.ac.in", results: "Passed", marks: "20/20", time: "22min" },
        { user_id: 31, name: "Cathy Davis", date: "14/JAN/2025", email: "cathydavis-cmpn@atharvacoe.ac.in", results: "Failed", marks: "12/20", time: "28min" },
        { user_id: 32, name: "Derek Evans", date: "15/JAN/2025", email: "derekevans-inft@atharvacoe.ac.in", results: "Passed", marks: "17/20", time: "24min" },
        { user_id: 33, name: "Ella Foster", date: "16/JAN/2025", email: "ellafoster-ecs@atharvacoe.ac.in", results: "Failed", marks: "9/20", time: "30min" },
        { user_id: 34, name: "Fred Green", date: "17/JAN/2025", email: "fredgreen-elec@atharvacoe.ac.in", results: "Passed", marks: "16/20", time: "26min" },
        { user_id: 35, name: "Gina Harris", date: "18/JAN/2025", email: "ginaharris-extc@atharvacoe.ac.in", results: "Passed", marks: "19/20", time: "23min" },
        { user_id: 36, name: "Holly Irving", date: "19/JAN/2025", email: "hollyirving-cmpn@atharvacoe.ac.in", results: "Failed", marks: "11/20", time: "29min" },
        { user_id: 37, name: "Ian Johnson", date: "20/JAN/2025", email: "ianjohnson-inft@atharvacoe.ac.in", results: "Passed", marks: "14/20", time: "21min" },
        { user_id: 38, name: "Jill King", date: "21/JAN/2025", email: "jillking-ecs@atharvacoe.ac.in", results: "Passed", marks: "20/20", time: "20min" },
        { user_id: 39, name: "Kyle Lee", date: "22/JAN/2025", email: "kylelee-elec@atharvacoe.ac.in", results: "Failed", marks: "13/20", time: "27min" },
        { user_id: 40, name: "Liam Martin", date: "23/JAN/2025", email: "liammartin-extc@atharvacoe.ac.in", results: "Passed", marks: "18/20", time: "25min" },
        { user_id: 41, name: "Mona Nelson", date: "24/JAN/2025", email: "monanelson-cmpn@atharvacoe.ac.in", results: "Failed", marks: "10/20", time: "30min" },
        { user_id: 42, name: "Nate Owens", date: "25/JAN/2025", email: "nateowens-inft@atharvacoe.ac.in", results: "Passed", marks: "15/20", time: "20min" },
        { user_id: 43, name: "Olivia Perez", date: "26/JAN/2025", email: "oliviaperez-ecs@atharvacoe.ac.in", results: "Passed", marks: "20/20", time: "22min" },
        { user_id: 44, name: "Pete Quinn", date: "27/JAN/2025", email: "petequinn-elec@atharvacoe.ac.in", results: "Failed", marks: "12/20", time: "28min" },
        { user_id: 45, name: "Quinn Roberts", date: "28/JAN/2025", email: "quinnroberts-extc@atharvacoe.ac.in", results: "Passed", marks: "17/20", time: "24min" },
        { user_id: 46, name: "Rita Scott", date: "29/JAN/2025", email: "ritascott-cmpn@atharvacoe.ac.in", results: "Failed", marks: "9/20", time: "30min" },
        { user_id: 47, name: "Steve Taylor", date: "30/JAN/2025", email: "stevetaylor-inft@atharvacoe.ac.in", results: "Passed", marks: "16/20", time: "26min" },
        { user_id: 48, name: "Tara Underwood", date: "31/JAN/2025", email: "taraunderwood-ecs@atharvacoe.ac.in", results: "Passed", marks: "19/20", time: "23min" },
        { user_id: 49, name: "Uma Vance", date: "01/FEB/2025", email: "umavance-elec@atharvacoe.ac.in", results: "Failed", marks: "11/20", time: "29min" },
        { user_id: 50, name: "Vince White", date: "02/FEB/2025", email: "vincewhite-extc@atharvacoe.ac.in", results: "Passed", marks: "14/20", time: "21min" },
    ];
    const [students, setStudents] = useState([]);
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(50);
    const [searchTerm, setSearchTerm] = useState("");
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const sidebarRef = useRef(null);

    const handleSearch = (e) => {
        setPage(1);
        const term = e.target.value.toLowerCase();
        setSearchTerm(term);

        const searchResults = term
            ? students.filter(student =>
                student.name.toLowerCase().includes(term) ||
                student.email.toLowerCase().includes(term) ||
                student.date.toLowerCase().includes(term) ||
                student.results?.toLowerCase().includes(term) ||
                student.marks?.toString().includes(term) ||
                student.time.toString().includes(term)
            )
            : students;

        setFilteredStudents(searchResults);
    };

    const formatEmail = (email) => {
        const [firstPart, domain] = email.split('@');
        return (
            <div className="font-medium">
                {firstPart}
                <br />
                @{domain}
            </div>
        );
    };

    const getResultStyle = (result) => {
        return result === "Passed"
            ? "bg-green-100 text-green-800 rounded-full px-2 py-1 text-sm font-medium"
            : "bg-red-100 text-red-800 rounded-full px-2 py-1 text-sm font-medium";
    };

    useEffect(() => {
        setStudents(sampleStudents);
        setFilteredStudents(sampleStudents);
    }, []);
    // useEffect(() => {
    //     const fetchStudents = async () => {
    //         try {
    //             const { data } = await axios.get(`/api/users?role=Student`);
    //             setStudents(data.users);
    //             setFilteredStudents(data.users);
    //         } catch (error) {
    //             console.error("Error fetching students:", error);
    //         }
    //     };
    //     fetchStudents();
    // }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const numberofpages = Math.ceil(filteredStudents.length / limit);
    const startPage = Math.max(1, page - 3);
    const endPage = Math.min(numberofpages, page + 3);
    const pageNumbers = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
        <div className="min-h-screen flex">
            <div
                ref={sidebarRef}
                className={`fixed top-0 left-0 h-full bg-gray-50 text-white z-50 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    } transition-transform duration-300 ease-in-out w-64 xl:static xl:translate-x-0`}
            >
                <Adm_Sidebar />
            </div>
            <div className="flex-grow bg-gray-100 h-max">
                <div className="bg-white h-14 border-b border-gray-300">
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
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d={sidebarOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                            />
                        </svg>
                    </button>
                </div>
                <h1 className="ml-10 mt-6">
                    <span className="font-bold text-lg">Test - Logical reasoning </span>
                    <span>(20 Dec 2024)</span>
                </h1>
                <div className="bg-white my-6 mx-10 pt-5 pb-5 pl-9 pr-9 rounded-lg border border-gray-300">
                    <div className="flex justify-between items-center w-full mb-5">
                        <h1 className="text-black font-roboto text-[22px] font-semibold">Students List</h1>
                        <div className="relative flex items-center max-w-md ml-auto">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={handleSearch}
                                className="w-full pl-10 h-7 text-sm border border-gray-300 bg-transparent"
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
                    <table className="min-w-full leading-normal">
                        <thead>
                            <tr className="text-left text-gray-600 uppercase text-sm border-t border-gray-300">
                                <th className="py-4 w-1/5">Name</th>
                                <th className="py-4 w-1/5">Email</th>
                                <th className="py-4 w-1/6">Date</th>
                                <th className="py-4 w-1/6">Results</th>
                                <th className="py-4 w-1/6">Marks</th>
                                <th className="py-4 w-1/6">Time</th>
                                <th className="py-3 w-1/6"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredStudents
                                .slice((page - 1) * limit, page * limit)
                                .map((student) => (
                                    <tr key={student.user_id} className="hover:bg-gray-50">
                                        <td className="py-4 w-1/5">{student.name}</td>
                                        <td className="py-4 w-1/5">
                                            {formatEmail(student.email)}
                                        </td>
                                        <td className="py-4 w-1/6">{student.date}</td>
                                        <td className="py-4 w-1/6">
                                            <span className={getResultStyle(student.results)}>
                                                {student.results}
                                            </span>
                                        </td>
                                        <td className="py-4 w-1/6">{student.marks}</td>
                                        <td className="py-4 w-1/6">{student.time}</td>
                                        <td className="py-4 w-1/6  text-blue-600 whitespace-nowrap text-sm cursor-pointer">
                                            view more
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                    <div className="flex justify-center items-center mt-5">
                        <svg
                            onClick={() => page > 1 && setPage(page - 1)}
                            className="cursor-pointer mr-2"
                            width="12"
                            height="24"
                            viewBox="0 0 12 24"
                            fill="none"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M1.84306 11.2884L7.50006 5.63137L8.91406 7.04537L3.96406 11.9954L8.91406 16.9454L7.50006 18.3594L1.84306 12.7024C1.65559 12.5148 1.55028 12.2605 1.55028 11.9954C1.55028 11.7302 1.65559 11.4759 1.84306 11.2884Z"
                                fill="black"
                            />
                        </svg>
                        <div className="flex">
                            {pageNumbers.map((p) => (
                                <div
                                    key={p}
                                    className={`w-8 h-8 flex items-center justify-center mx-1 cursor-pointer ${page === p ? "bg-blue-300 rounded-md" : "bg-white"
                                        }`}
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </div>
                            ))}
                        </div>
                        <svg
                            onClick={() => page < numberofpages && setPage(page + 1)}
                            className="cursor-pointer ml-2"
                            width="12"
                            height="24"
                            viewBox="0 0 12 24"
                            fill="none"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M10.1569 11.2884L4.49994 5.63137L3.08594 7.04537L8.03594 11.9954L3.08594 16.9454L4.49994 18.3594L10.1569 12.7024C10.3444 12.5148 10.4497 12.2605 10.4497 11.9954C10.4497 11.7302 10.3444 11.4759 10.1569 11.2884Z"
                                fill="black"
                            />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestStudentList;