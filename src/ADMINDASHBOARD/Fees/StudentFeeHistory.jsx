import React, { useState, useEffect } from 'react';
import { ActiveStudents, getStudentFeeInfo } from '../../Network/AdminApi'; // Adjust path if necessary
import { toast } from 'react-toastify';
import { FaSpinner } from 'react-icons/fa'; // Optional: for a nicer loader icon

const StudentFeeHistory = () => {
    const session = JSON.parse(localStorage.getItem("session")); // Be cautious with direct localStorage access in SSR frameworks

    const [isStudentListLoading, setIsStudentListLoading] = useState(false);
    const [isFeeHistoryLoading, setIsFeeHistoryLoading] = useState(false);
    const [allStudents, setAllStudents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStudentId, setSelectedStudentId] = useState(null);
    const [selectedStudentName, setSelectedStudentName] = useState(''); // Store name for display
    const [feeHistoryData, setFeeHistoryData] = useState(null); // Store the entire fee status object

    // Function to fetch active students
    const fetchAllStudents = async () => {
        setIsStudentListLoading(true);
        try {
            const response = await ActiveStudents();
            if (response?.success) {
                // Ensure data is an array, default to empty array if not
                const students = Array.isArray(response?.students?.data) ? response.students.data.reverse() : [];
                setAllStudents(students);
            } else {
                toast.error(response?.message || "Failed to fetch students.");
                setAllStudents([]); // Set to empty array on error
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("An error occurred while fetching students.");
            setAllStudents([]); // Set to empty array on catch
        } finally {
            setIsStudentListLoading(false);
        }
    };

    // Function to fetch fee history of a selected student
    const fetchFeeHistory = async (studentId, studentName) => {
        if (!studentId) return;
        setSelectedStudentId(studentId);
        setSelectedStudentName(studentName); // Store name
        setFeeHistoryData(null); // Clear previous history
        setIsFeeHistoryLoading(true);

        // Validate session existence
        if (!session) {
             toast.error("Session not found. Please log in again.");
             setIsFeeHistoryLoading(false);
             return;
        }

        try {
            const response = await getStudentFeeInfo(studentId, session);
            console.log("Fee Info Response:", response); // Log the full response
            if (response?.success) {
                 // Ensure feeStatus exists and defaults if not
                setFeeHistoryData(response?.data?.feeStatus || { dues: 0, feeHistory: [] });
            } else {
                toast.error(response?.message || "Failed to fetch fee history.");
                setFeeHistoryData({ dues: 0, feeHistory: [] }); // Set default empty state on error
            }
        } catch (error) {
            console.error("Error fetching fee info:", error);
            toast.error("An error occurred while fetching fee history.");
            setFeeHistoryData({ dues: 0, feeHistory: [] }); // Set default empty state on catch
        } finally {
            setIsFeeHistoryLoading(false);
        }
    };

    // Function to handle search input
    const handleSearch = (e) => {
        setSearchQuery(e.target.value);
    };

    // Filter students based on search query
    const filteredStudents = allStudents.filter(student =>
        (student?.admissionNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (student?.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
        (student?.fatherName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    // Fetch students on component mount
    useEffect(() => {
        fetchAllStudents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Dependency array is empty, runs only once on mount

    // Helper to format date
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-GB'); // Example: dd/mm/yyyy
        } catch (e) {
            return 'Invalid Date';
        }
    };

     // Helper to format currency (optional)
     const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
     };

    return (
        <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Student Fee History</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Column 1: Student Search and List */}
                <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Search Active Students</h3>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder="Search by Adm No, Name, Father's Name..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />

                    {isStudentListLoading ? (
                        <div className="flex items-center justify-center p-4 text-gray-500">
                             <FaSpinner className="animate-spin mr-2" /> Loading students...
                        </div>
                    ) : (
                        <div className="max-h-96 overflow-y-auto border rounded-md">
                            {filteredStudents.length > 0 ? (
                                <ul className="divide-y divide-gray-200">
                                    {filteredStudents.map((student) => (
                                        <li
                                            key={student._id} // Use _id if it's the unique identifier from MongoDB
                                            onClick={() => fetchFeeHistory(student.studentId, student.studentName)}
                                            className={`p-3 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out ${selectedStudentId === student.studentId ? 'bg-blue-100 font-semibold' : ''}`}
                                        >
                                            <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                                            <div className="text-xs text-gray-500">Adm No: {student.admissionNumber}</div>
                                            <div className="text-xs text-gray-500">Father: {student.fatherName}</div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="p-4 text-center text-gray-500">No students found matching your search.</p>
                            )}
                        </div>
                    )}
                </div>

                {/* Column 2: Fee History Details */}
                <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
                    {selectedStudentId ? (
                        <>
                            <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                Fee History for: <span className="text-blue-600">{selectedStudentName} </span>
                            </h3>

                             {/* Display Dues */}
                             {feeHistoryData?.dues !== undefined && (
                                <div className="mb-4 p-1 bg-red-100 border border-red-300 rounded-md">
                                    <p className="text-lg font-semibold text-red-700">
                                        Outstanding Dues: {formatCurrency(feeHistoryData.dues)}
                                    </p>
                                </div>
                             )}


                            {isFeeHistoryLoading ? (
                                <div className="flex items-center justify-center p-6 text-gray-500">
                                    <FaSpinner className="animate-spin mr-2" /> Loading fee history...
                                </div>
                            ) : (
                                feeHistoryData && feeHistoryData.feeHistory && feeHistoryData.feeHistory.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
                                            <thead className="bg-gray-100">
                                                <tr>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Date</th>
                                                    {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Status</th> */}
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Details</th>
                                                    {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Additional Fees</th> */}
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Amount</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Paid</th>
                                                    <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Dues</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {feeHistoryData.feeHistory.map((history, index) => (
                                                    <tr key={index} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">{formatDate(history.date)}</td>
                                                        {/* <td className="px-4 py-3 whitespace-nowrap text-sm border-r">
                                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                                history.status === 'Paid' ? 'bg-green-100 text-green-800' :
                                                                history.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800' // Assuming 'Due' or other statuses
                                                            }`}>
                                                                {history.status}
                                                            </span>
                                                        </td> */}
                                                        <td className="px-4 py-3 text-sm text-gray-700 border-r">
                                                             {/* Combined Fee Details */}
                                                             {history.regularFees?.map((fee, idx) => (
                                                                <div key={`reg-${idx}`} className="text-xs mb-1">{fee.month}: {formatCurrency(fee.paidAmount)} <span className="text-gray-500">(Regular)</span></div>
                                                             ))}
                                                             {history.additionalFees?.map((fee, idx) => (
                                                                <div key={`add-${idx}`} className="text-xs mb-1">{fee.name} ({fee.month}): {formatCurrency(fee.paidAmount)} <span className="text-gray-500">(Additional)</span></div>
                                                             ))}
                                                             {(history.regularFees?.length === 0 && history.additionalFees?.length === 0) && <span className='text-xs text-gray-400'>No specific breakdown</span>}
                                                        </td>
                                                        {/* <td className="px-4 py-3 text-sm text-gray-700 border-r">
                                                            {history.additionalFees?.map((fee, idx) => (
                                                                <div key={idx} className="text-xs">{fee.name} ({fee.month}): {formatCurrency(fee.paidAmount)} Paid</div>
                                                            ))}
                                                            {history.additionalFees?.length === 0 && <span className='text-xs text-gray-400'>N/A</span>}
                                                        </td> */}
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">{formatCurrency(history.totalFeeAmount)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(history.totalAmountPaid)}</td>
                                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(history.totalDues)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                     <p className="p-4 text-center text-gray-500">
                                        {feeHistoryData === null ? "Select a student to view history." : "No fee history found for this student."}
                                     </p>
                                )
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                             <p className="text-gray-500 text-center">Please select a student from the list to view their fee history.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentFeeHistory;


// import React, { useState, useEffect } from 'react';
// import { ActiveStudents, getStudentFeeInfo } from '../../Network/AdminApi'; // Adjust path if necessary
// import { toast } from 'react-toastify';
// import { FaSpinner } from 'react-icons/fa'; // Optional: for a nicer loader icon

// const StudentFeeHistory = () => {
//     const session = JSON.parse(localStorage.getItem("session")); // Be cautious with direct localStorage access in SSR frameworks

//     const [isStudentListLoading, setIsStudentListLoading] = useState(false);
//     const [isFeeHistoryLoading, setIsFeeHistoryLoading] = useState(false);
//     const [allStudents, setAllStudents] = useState([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedStudentId, setSelectedStudentId] = useState(null);
//     const [selectedStudentName, setSelectedStudentName] = useState(''); // Store name for display
//     const [feeHistoryData, setFeeHistoryData] = useState(null); // Store the entire fee status object

//     // Function to fetch active students
//     const fetchAllStudents = async () => {
//         setIsStudentListLoading(true);
//         try {
//             const response = await ActiveStudents();
//             if (response?.success) {
//                 // Ensure data is an array, default to empty array if not
//                 const students = Array.isArray(response?.students?.data) ? response.students.data.reverse() : [];
//                 setAllStudents(students);
//             } else {
//                 toast.error(response?.message || "Failed to fetch students.");
//                 setAllStudents([]); // Set to empty array on error
//             }
//         } catch (error) {
//             console.error("Error fetching students:", error);
//             toast.error("An error occurred while fetching students.");
//             setAllStudents([]); // Set to empty array on catch
//         } finally {
//             setIsStudentListLoading(false);
//         }
//     };

//     // Function to fetch fee history of a selected student
//     const fetchFeeHistory = async (studentId, studentName) => {
//         if (!studentId) return;
//         setSelectedStudentId(studentId);
//         setSelectedStudentName(studentName); // Store name
//         setFeeHistoryData(null); // Clear previous history
//         setIsFeeHistoryLoading(true);

//         // Validate session existence
//         if (!session) {
//              toast.error("Session not found. Please log in again.");
//              setIsFeeHistoryLoading(false);
//              return;
//         }

//         try {
//             const response = await getStudentFeeInfo(studentId, session);
//             console.log("Fee Info Response:", response); // Log the full response
//             if (response?.success) {
//                  // Ensure feeStatus exists and defaults if not
//                 setFeeHistoryData(response?.data?.feeStatus || { dues: 0, feeHistory: [] });
//             } else {
//                 toast.error(response?.message || "Failed to fetch fee history.");
//                 setFeeHistoryData({ dues: 0, feeHistory: [] }); // Set default empty state on error
//             }
//         } catch (error) {
//             console.error("Error fetching fee info:", error);
//             toast.error("An error occurred while fetching fee history.");
//             setFeeHistoryData({ dues: 0, feeHistory: [] }); // Set default empty state on catch
//         } finally {
//             setIsFeeHistoryLoading(false);
//         }
//     };

//     // Function to handle search input
//     const handleSearch = (e) => {
//         setSearchQuery(e.target.value);
//     };

//     // Filter students based on search query
//     const filteredStudents = allStudents.filter(student =>
//         (student?.admissionNumber?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
//         (student?.studentName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
//         (student?.fatherName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
//     );

//     // Fetch students on component mount
//     useEffect(() => {
//         fetchAllStudents();
//         // eslint-disable-next-line react-hooks/exhaustive-deps
//     }, []); // Dependency array is empty, runs only once on mount

//     // Helper to format date
//     const formatDate = (dateString) => {
//         if (!dateString) return 'N/A';
//         try {
//             return new Date(dateString).toLocaleDateString('en-GB'); // Example: dd/mm/yyyy
//         } catch (e) {
//             return 'Invalid Date';
//         }
//     };

//      // Helper to format currency (optional)
//      const formatCurrency = (amount) => {
//         return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
//      };

//     return (
//         <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
//             <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6">Student Fee History</h2>

//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//                 {/* Column 1: Student Search and List */}
//                 <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow">
//                     <h3 className="text-lg font-semibold text-gray-700 mb-4">Search Active Students</h3>
//                     <input
//                         type="text"
//                         value={searchQuery}
//                         onChange={handleSearch}
//                         placeholder="Search by Adm No, Name, Father's Name..."
//                         className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                     />

//                     {isStudentListLoading ? (
//                         <div className="flex items-center justify-center p-4 text-gray-500">
//                              <FaSpinner className="animate-spin mr-2" /> Loading students...
//                         </div>
//                     ) : (
//                         <div className="max-h-96 overflow-y-auto border rounded-md">
//                             {filteredStudents.length > 0 ? (
//                                 <ul className="divide-y divide-gray-200">
//                                     {filteredStudents.map((student) => (
//                                         <li
//                                             key={student._id} // Use _id if it's the unique identifier from MongoDB
//                                             onClick={() => fetchFeeHistory(student.studentId, student.studentName)}
//                                             className={`p-3 cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out ${selectedStudentId === student.studentId ? 'bg-blue-100 font-semibold' : ''}`}
//                                         >
//                                             <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
//                                             <div className="text-xs text-gray-500">Adm No: {student.admissionNumber}</div>
//                                             <div className="text-xs text-gray-500">Father: {student.fatherName}</div>
//                                         </li>
//                                     ))}
//                                 </ul>
//                             ) : (
//                                 <p className="p-4 text-center text-gray-500">No students found matching your search.</p>
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 {/* Column 2: Fee History Details */}
//                 <div className="lg:col-span-2 bg-white p-4 rounded-lg shadow">
//                     {selectedStudentId ? (
//                         <>
//                             <h3 className="text-xl font-semibold text-gray-800 mb-2">
//                                 Fee History for: <span className="text-blue-600">{selectedStudentName} </span>
//                             </h3>

//                              {/* Display Dues */}
//                              {feeHistoryData?.dues !== undefined && (
//                                 <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-md">
//                                     <p className="text-lg font-semibold text-red-700">
//                                         Outstanding Dues: {formatCurrency(feeHistoryData.dues)}
//                                     </p>
//                                 </div>
//                              )}


//                             {isFeeHistoryLoading ? (
//                                 <div className="flex items-center justify-center p-6 text-gray-500">
//                                     <FaSpinner className="animate-spin mr-2" /> Loading fee history...
//                                 </div>
//                             ) : (
//                                 feeHistoryData && feeHistoryData.feeHistory && feeHistoryData.feeHistory.length > 0 ? (
//                                     <div className="overflow-x-auto">
//                                         <table className="min-w-full divide-y divide-gray-200 border border-gray-300">
//                                             <thead className="bg-gray-100">
//                                                 <tr>
//                                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Date</th>
//                                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Status</th>
//                                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Fees Paid Details</th>
//                                                     {/* <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Additional Fees</th> */}
//                                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r">Total Defined Fee</th>
//                                                     <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">Total Amount Paid</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody className="bg-white divide-y divide-gray-200">
//                                                 {feeHistoryData.feeHistory.map((history, index) => (
//                                                     <tr key={index} className="hover:bg-gray-50">
//                                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">{formatDate(history.date)}</td>
//                                                         <td className="px-4 py-3 whitespace-nowrap text-sm border-r">
//                                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
//                                                                 history.status === 'Paid' ? 'bg-green-100 text-green-800' :
//                                                                 history.status === 'Partial' ? 'bg-yellow-100 text-yellow-800' :
//                                                                 'bg-red-100 text-red-800' // Assuming 'Due' or other statuses
//                                                             }`}>
//                                                                 {history.status}
//                                                             </span>
//                                                         </td>
//                                                         <td className="px-4 py-3 text-sm text-gray-700 border-r">
//                                                              {/* Combined Fee Details */}
//                                                              {history.regularFees?.map((fee, idx) => (
//                                                                 <div key={`reg-${idx}`} className="text-xs mb-1">{fee.month}: {formatCurrency(fee.paidAmount)} <span className="text-gray-500">(Regular)</span></div>
//                                                              ))}
//                                                              {history.additionalFees?.map((fee, idx) => (
//                                                                 <div key={`add-${idx}`} className="text-xs mb-1">{fee.name} ({fee.month}): {formatCurrency(fee.paidAmount)} <span className="text-gray-500">(Additional)</span></div>
//                                                              ))}
//                                                              {(history.regularFees?.length === 0 && history.additionalFees?.length === 0) && <span className='text-xs text-gray-400'>No specific breakdown</span>}
//                                                         </td>
//                                                         {/* <td className="px-4 py-3 text-sm text-gray-700 border-r">
//                                                             {history.additionalFees?.map((fee, idx) => (
//                                                                 <div key={idx} className="text-xs">{fee.name} ({fee.month}): {formatCurrency(fee.paidAmount)} Paid</div>
//                                                             ))}
//                                                             {history.additionalFees?.length === 0 && <span className='text-xs text-gray-400'>N/A</span>}
//                                                         </td> */}
//                                                         <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 border-r">{formatCurrency(history.totalFeeAmount)}</td>
//                                                         <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formatCurrency(history.totalAmountPaid)}</td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 ) : (
//                                      <p className="p-4 text-center text-gray-500">
//                                         {feeHistoryData === null ? "Select a student to view history." : "No fee history found for this student."}
//                                      </p>
//                                 )
//                             )}
//                         </>
//                     ) : (
//                         <div className="flex items-center justify-center h-full">
//                              <p className="text-gray-500 text-center">Please select a student from the list to view their fee history.</p>
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default StudentFeeHistory;




// import React, { useState, useEffect } from 'react'
// import { ActiveStudents, getStudentFeeInfo } from '../../Network/AdminApi';
// import { toast } from 'react-toastify';

// const StudentFeeHistory = () => {
//     const session = JSON.parse(localStorage.getItem("session"));
    
//     const [isLoader, setIsLoader] = useState(false);
//     const [allStudents, setAllStudents] = useState([]);
//     const [searchQuery, setSearchQuery] = useState('');
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [feeHistory, setFeeHistory] = useState([]);
    
//     // Function to fetch active students
//     const allStudent = async () => {
//         setIsLoader(true);
//         try {
//             const response = await ActiveStudents();
//             if (response?.success) {
//                 setIsLoader(false);
//                 const students = response?.students?.data?.reverse() || [];
//                 setAllStudents(students);
//             } else {
//                 toast.error(response?.message);
//             }
//         } catch (error) {
//             console.log("Error fetching students", error);
//         } finally {
//             setIsLoader(false);
//         }
//     };

//     // Function to fetch fee history of a selected student
//     const getFeeHistory = async (studentId) => {
//         setIsLoader(true);
//         try {
//             const feeInfo = await getStudentFeeInfo(studentId, session);
//             console.log("feeInfofeeInfofeeInfofeeInfo",feeInfo)
//             if (feeInfo?.success) {
//                 setIsLoader(false);
//                 setFeeHistory(feeInfo?.data?.feeStatus || []);
//                 // setFeeHistory(feeInfo?.feeStatus?.feeHistory || []);
//             } else {
//                 toast.error(feeInfo?.message);
//             }
//         } catch (error) {
//             console.log("Error fetching fee info", error);
//         } finally {
//             setIsLoader(false);
//         }
//     };

//     // Function to handle search input
//     const handleSearch = (e) => {
//         setSearchQuery(e.target.value);
//     };

//     // Filter students based on search query
//     const filteredStudents = allStudents.filter(student => 
//         student.admissionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         student.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
//         student.fatherName.toLowerCase().includes(searchQuery.toLowerCase())
//     );

//     // Handle student click to fetch fee info
//     const handleStudentClick = (studentId) => {
//         setSelectedStudent(studentId);
//         getFeeHistory(studentId);
//     };

//     // Fetch students on component mount
//     useEffect(() => {
//         allStudent();
//     }, []);
    
//     return (
//         <div>
//             <h2>Student Fee History</h2>
            
//             {/* Search Input */}
//             <input 
//                 type="text" 
//                 value={searchQuery} 
//                 onChange={handleSearch} 
//                 placeholder="Search by Admission No, Name, or Father's Name" 
//             />
            
//             {/* Student List */}
//             {isLoader ? (
//                 <p>Loading...</p>
//             ) : (
//                 <div>
//                     <h3>Active Students</h3>
//                     <ul>
//                         {filteredStudents.map((student) => (
//                             <li 
//                                 key={student._id} 
//                                 onClick={() => handleStudentClick(student.studentId)}
//                                 style={{ cursor: 'pointer', margin: '10px 0' }}
//                             >
//                                 {student.studentName} - {student.admissionNumber}
//                             </li>
//                         ))}
//                     </ul>
//                 </div>
//             )}
            
//             {/* Display Fee History for the selected student */}
//             {selectedStudent   && (
//                 <div>
//                     <h3>Fee History for {selectedStudent}</h3>
//                     <h2>{feeHistory?.dues}</h2>
//                     <table border="1">
//                         <thead>
//                             <tr>
//                                 <th>Date</th>
//                                 <th>Status</th>
//                                 <th>Regular Fees</th>
//                                 <th>Additional Fees</th>
//                                 <th>Total Fee Amount</th>
//                                 <th>Amount Paid</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {feeHistory?.feeHistory?.map((history, index) => (
//                                 <tr key={index}>
//                                     <td>{new Date(history.date).toLocaleDateString()}</td>
//                                     <td>{history.status}</td>
//                                     <td>
//                                         {history.regularFees.map((fee, idx) => (
//                                             <div key={idx}>{fee.month}: {fee.paidAmount} Paid</div>
//                                         ))}
//                                     </td>
//                                     <td>
//                                         {history.additionalFees.map((fee, idx) => (
//                                             <div key={idx}>{fee.name} ({fee.month}): {fee.paidAmount} Paid</div>
//                                         ))}
//                                     </td>
//                                     <td>{history.totalFeeAmount}</td>
//                                     <td>{history.totalAmountPaid}</td>
//                                 </tr>
//                             ))}
//                         </tbody>
//                     </table>
//                 </div>
//             )}
//         </div>
//     );
// };

// export default StudentFeeHistory;





// import React, { useEffect } from 'react'
// import { ActiveStudents, getStudentFeeInfo } from '../../Network/AdminApi';

// const StudentFeeHistory = () => {
//     const session=JSON.parse(localStorage.getItem("session"))
//     const StudentFeeInfo = async (studentId) => {
//             setIsLoader(true)
//             try {
//                 // const response = await ActiveStudents();
//                 const feeInfo = await getStudentFeeInfo(studentId,session);
//                 if (feeInfo?.success) {
//                     setIsLoader(false)
//                     const students = feeInfo?.students?.data?.reverse() || [];
//                     FeeHistory(students); 
//                 } else {
//                     toast.error(feeInfo?.message)
//                 }
//             } catch (error) {
//                 console.log("error", error);
    
//             }
//             finally {
//                 setIsLoader(false)
//             }
//         };

//      const allStudent = async () => {
//             setIsLoader(true)
//             try {
//                 const response = await ActiveStudents();
//                 if (response?.success) {
//                     setIsLoader(false)
//                     const students = response?.students?.data?.reverse() || [];
//                     setAllStudents(students); 
//                 } else {
//                     toast.error(response?.message)
//                 }
//             } catch (error) {
//                 console.log("error", error);
    
//             }
//             finally {
//                 setIsLoader(false)
//             }
//         };
//         useEffect(()=>{
//             allStudent()
//         },[])
//   return (
//     <div>StudentFeeHistory</div>
//   )
// }

// export default StudentFeeHistory