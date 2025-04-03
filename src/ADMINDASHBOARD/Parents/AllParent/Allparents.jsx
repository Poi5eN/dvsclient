


import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../../Dynamic/Form/FormStyle.css";
import { useStateContext } from "../../../contexts/ContextProvider.js";
import './MUI.css'
import NoDataFound from "../../../NoDataFound.jsx";
import { useReactToPrint } from "react-to-print";
import PrintTable from "./PrintTable"; // Import PrintTable component
import ExportToExcel from "./ExportToExcel"; // Import ExportToExcel component
import pdf from "../../../Icone/pdf.png";
import Table from "../../../Dynamic/Table.jsx";
import moment from "moment/moment.js";
import { FaEdit, FaEye } from "react-icons/fa"; // Changed MdVisibility to FaEye for consistency
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect.jsx"; // Assuming this is your custom wrapper or react-select itself
import Breadcrumbs from "../../../components/Breadcrumbs .jsx";
import { MdDelete, MdToggleOn, MdToggleOff } from "react-icons/md"; // Added toggle icons

import {
    ActiveStudents,
    AdminGetAllClasses,
    getAllStudents,
    studentsStatus,
} from "../../../Network/AdminApi.js";
import { toast } from "react-toastify";
import EditStudent from "./EditStudent.jsx";
import StudentDetails from "./StudentDetails.jsx";

function Allparents() {
    const { setIsLoader } = useStateContext();
    const [getClass, setGetClass] = useState([]); // All classes { className: string, sections: string[] }[]
    const [selectedClass, setSelectedClass] = useState(null); // Store selected class object { value: string, label: string } | null
    const [selectedSection, setSelectedSection] = useState(null); // Store selected section object { value: string, label: string } | null
    const [availableSections, setAvailableSections] = useState([]); // Sections for selected class [{ value: string, label: string }]
    const [allStudents, setAllStudents] = useState([]); // Raw student data from API
    const [filteredData, setFilteredData] = useState([]); // Filtered student data for display
    const [isEditing, setIsEditing] = useState(false); // State for edit mode
    const [studentToEdit, setStudentToEdit] = useState(null); // Student data for editing
    const [studentToView, setStudentToView] = useState(null); // Student data for viewing details

    const printRef = useRef();

    // --- Data Fetching ---

    const fetchAllStudents = useCallback(async () => {
        setIsLoader(true);
        try {
            const response = await ActiveStudents();
            // const response = await getAllStudents();
            if (response?.success) {
                // Assuming response.students.data is the array of students
                const students = response?.students?.data?.reverse() || [];
                setAllStudents(students);
                // Initial filter applied when data is fetched
                // setFilteredData(students); // Filtering is now handled by useEffect
            } else {
                toast.error(response?.message || "Failed to fetch students.");
            }
        } catch (error) {
            console.error("Error fetching students:", error);
            toast.error("An error occurred while fetching students.");
        } finally {
            setIsLoader(false);
        }
    }, [setIsLoader]); // Include dependencies

    const fetchAllClasses = useCallback(async () => {
        setIsLoader(true); // Potentially set loader again or manage it globally
        try {
            const response = await AdminGetAllClasses();
            if (response?.success) {
                const classes = response.classes || [];
                // Sort classes if needed, e.g., numerically or alphabetically
                // Example: classes.sort((a, b) => a.className.localeCompare(b.className));
                setGetClass(classes);
            } else {
                toast.error(response?.message || "Failed to fetch classes.");
            }
        } catch (error) {
            console.error("Error fetching classes:", error);
            toast.error("An error occurred while fetching classes.");
        } finally {
           // Consider loader management if fetchAllStudents is also setting it
           setIsLoader(false);
        }
    }, [setIsLoader]); // Include dependencies

    useEffect(() => {
        fetchAllStudents();
        fetchAllClasses();
    }, [fetchAllStudents, fetchAllClasses]); // Use the useCallback functions

    // --- Filtering Logic ---

    useEffect(() => {
        let filtered = allStudents;

        if (selectedClass) {
            filtered = filtered.filter(student => student.class === selectedClass);
        }

        if (selectedSection) {
            filtered = filtered.filter(student => student.section === selectedSection);
        }

        setFilteredData(filtered);
    }, [selectedClass, selectedSection, allStudents]);

    // --- Event Handlers ---

    const handleToggleStatus = async (studentId, currentStatus) => {
        const action = currentStatus === "active" ? "deactivate" : "activate";
        if (!window.confirm(`Are you sure you want to ${action} this student?`)) {
            return;
        }

        setIsLoader(true);
        try {
            const response = await studentsStatus(studentId); // API endpoint likely toggles status
            if (response?.success) {
                toast.success(response?.message || `Student status updated successfully.`);
                // Optimistic update (optional) or refetch
                // setAllStudents(prev =>
                //     prev.map(s => s.studentId === studentId ? { ...s, status: response.newStatus } : s) // Assuming API returns new status
                // );
                await fetchAllStudents(); // Refetch to ensure data consistency
            } else {
                toast.error(response?.message || "Failed to update student status.");
            }
        } catch (error) {
            console.error("Error updating student status:", error);
            toast.error("An error occurred while updating status.");
        } finally {
            setIsLoader(false);
        }
    };


    const handleClassChange = (e) => {
      const selectedClassName = e.target.value;
      setSelectedClass(selectedClassName);
      const selectedClassObj = getClass?.find(
        (cls) => cls.className === selectedClassName
      );
      if (selectedClassObj) {
        setAvailableSections(selectedClassObj.sections);
      
      } else {
        setAvailableSections([]);
      }
    };
    const handleSectionChange = (e) => {
      setSelectedSection(e.target.value); // Update the selectedSection state
    };
    const handlePrint = useReactToPrint({
        content: () => printRef.current,
        pageStyle: `@media print { @page { size: A4 landscape; margin: 15mm; } body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; } .page { page-break-after: always; } .print-header { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 10px; } .print-table { width: 100%; border-collapse: collapse; } .print-table th, .print-table td { border: 1px solid black; padding: 5px; text-align: left; } .print-table th { background-color: #f2f2f2; } }`,
    });

    const handleEditClick = (student) => {
        setStudentToEdit(student); // Set the student data to be passed to EditStudent
        setIsEditing(true);        // Enter edit mode
        setStudentToView(null);    // Ensure view mode is off
    };

    const handleViewClick = (student) => {
        setStudentToView(student); // Set the student to view
        setIsEditing(false);       // Ensure edit mode is off
    };

    const handleCloseEdit = (shouldRefetch = false) => {
        setIsEditing(false);
        setStudentToEdit(null);
        if (shouldRefetch) {
            fetchAllStudents(); // Refetch if changes were made
        }
    };

    const handleCloseView = () => {
        setStudentToView(null);
    };


    // --- Table Definition ---

    const THEAD = [
        { id: "SN", label: "S No.", width: "5" },
        { id: "photo", label: "Photo", width: "7" },
        { id: "admissionNo", label: "Admission No" },
        { id: "name", label: "Name" },
        { id: "email", label: "Email" },
        { id: "fatherName", label: "Father Name" },
        { id: "class", label: "Class" },
        { id: "dateOfBirth", label: "DOB" },
        { id: "contact", label: "Contact" },
        { id: "gender", label: "Gender" },
        { id: "status", label: "Status" },
        { id: "action", label: "Action" },
    ];

    const tBody = filteredData?.map((student, ind) => ({
        SN: ind + 1,
        photo: (
            <img
                src={student?.studentImage?.url || "https://via.placeholder.com/40?text=No+Img"} // Placeholder
                alt="student"
                className="w-6 h-6 object-cover rounded-md mx-auto" // Centered and slightly larger
            />
        ),
        admissionNo: (
            <span className="text-indigo-700 font-semibold">
                {student.admissionNumber || 'N/A'}
            </span>
        ),
        name: student.studentName || 'N/A',
        email: student.email || 'N/A',
        fatherName: student.fatherName || 'N/A',
        class: <span>{student.class || 'N/A'} - {student?.section || 'N/A'}</span>,
        dateOfBirth: student.dateOfBirth ? moment(student.dateOfBirth).format("DD-MMM-YYYY") : 'N/A',
        contact: student.contact || 'N/A',
        gender: student.gender || 'N/A',
        status: (
            <button
                onClick={() => handleToggleStatus(student?.studentId, student.status)}
                title={student.status === "active" ? "Deactivate Student" : "Activate Student"}
                // className={`p-1 rounded-full text-2xl ${
                //   student.status === "active" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"
                // }`}
                className={`p-1 rounded-full text-2xl text-red-600 hover:text-red-800`}
            >
                {/* {student.status === "active" ? <MdToggleOn /> : <MdToggleOff />}   */}
                <MdDelete/>
            </button>
            
        ),
        action: (
            <div className="flex justify-center items-center gap-3">
                <button title="View Details" onClick={() => handleViewClick(student)} className="text-blue-600 hover:text-blue-800 text-lg">
                    <FaEye />
                </button>
                <button title="Edit Student" onClick={() => handleEditClick(student)} className="text-yellow-600 hover:text-yellow-800 text-lg">
                    <FaEdit />
                </button>
               
            </div>
        ),
        rowClassName: student.status === "deactivated" || student.status === "inactive" ? "bg-gray-100 opacity-80" : "", // Adjust class for inactive
    }));

    // --- Options for ReactSelect ---



    const dynamicOptions = getClass.map((cls) => ({
      label: cls.className,
      value: cls.className,
    }));
    const DynamicSection = availableSections?.map((item) => ({
      label: item,
      value: item,
    }));
    // --- Breadcrumbs ---
    const BreadItem = [{ title: "All Students", link: "/admin/allstudent" }]; // Make sure link is correct

    // --- Render Logic ---

    // View: List of students
    if (!isEditing && !studentToView) {
        return (
            <div className="mx-auto px-4 overflow-hidden">
                {/* <Breadcrumbs BreadItem={BreadItem} />

                <div className="flex flex-wrap items-center gap-4 mb-2 bg-white rounded ">
                   
               
        <ReactSelect
          name="studentClass"
          value={selectedClass}
          handleChange={handleClassChange}
          label="Select a Class"
          dynamicOptions={dynamicOptions}
        />
        <ReactSelect
          name="studentSection"
          value={selectedSection} // Use selectedSection state
          handleChange={handleSectionChange} // Use the handleSectionChange function
          label="Select a Section"
          dynamicOptions={DynamicSection}
        />
                    
                    <div className="flex gap-2 items-center ml-auto"> 
                        <button onClick={handlePrint} className="p-2 rounded hover:bg-gray-200" title="Print Table">
                            <img src={pdf} alt="Print PDF" className="h-5 w-5" />
                        </button>
                        <ExportToExcel data={filteredData} fileName="Students_Report" />
                    </div>
                </div> */}

                {/* Student Table */}
                {filteredData.length > 0 ? (
                    <Table tHead={THEAD} tBody={tBody} isSearch={true} />
                ) : (
                    <NoDataFound message="No students found matching the criteria." />
                )}

                {/* Hidden Print Component */}
                <div className="hidden">
                    <PrintTable ref={printRef} data={filteredData} itemsPerPage={1000} /> {/* Adjust itemsPerPage if needed */}
                </div>
            </div>
        );
    }

    // View: Student Details
    if (studentToView) {
        return (
             // Add a wrapper div if needed for layout/styling
            <StudentDetails student={studentToView} onBack={handleCloseView} />
        );
    }

    // View: Edit Student Form
    if (isEditing && studentToEdit) {
        return (
             // Add a wrapper div if needed for layout/styling
            <EditStudent studentDetails={studentToEdit} onFinished={handleCloseEdit} /> // Pass callback to handle closing/refetching
        );
    }

    // Fallback (should ideally not be reached if logic is correct)
    return <NoDataFound message="Loading or error state." />;
}

export default Allparents;




// import React from 'react'


// import CreateParents from './CreateParents';

// const Allparents = () => {
//   return (
//     <>
//      <div>
//      <CreateParents/>
//      </div>

//     </>
   
//   )
// }

// export default Allparents;
