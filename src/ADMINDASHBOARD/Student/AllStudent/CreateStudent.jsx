// import React, { useState, useEffect, useRef } from "react";
// import { FaEdit } from "react-icons/fa";
// import { MdVisibility } from "react-icons/md";  // View Icon
// import moment from "moment";
// import Table from "../../../Dynamic/Table.jsx";
// import NoDataFound from "../../../NoDataFound.jsx";

// import StudentDetails from "./StudentDetails";  // New Component for Details
// import { getAllStudents } from "../../../Network/AdminApi.js";
// import { toast } from "react-toastify";
// // import Breadcrumbs from "../../../components/Breadcrumbs .jsx";
// function CreateStudent() {
//   const [submittedData, setSubmittedData] = useState([]); // All student data
//   const [filteredData, setFilteredData] = useState([]); // Filtered student data
//   const [edit, setEdit] = useState(false);
//   const [viewStudent, setViewStudent] = useState(null); // For viewing student details

//   const getAllStudent = async () => {
//     try {
//       const response = await getAllStudents();
//       if (response?.success) {
//         setSubmittedData(response?.students?.data?.reverse());
//         setFilteredData(response?.students?.data);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//   }, []);

//   const handleEdit = (val) => {
//     setEdit(true);
//     setViewStudent(null);
//   };

//   const handleView = (student) => {
//     setViewStudent(student);
//     setEdit(false);
//   };

//   const THEAD = [
//     { id: "SN", label: "S No." },
//     { id: "name", label: "Name" },
//     { id: "email", label: "Email" },
//     { id: "class", label: "Class" },
//     { id: "dateOfBirth", label: "DOB" },
//     { id: "contact", label: "Contact" },
//     { id: "status", label: "Status" },
//     { id: "action", label: "Action" },
//   ];

//   const tBody = filteredData?.map((val, ind) => ({
//     SN: ind + 1,
//     name: val.studentName,
//     email: val.email,
//     class: <span>{val.class} - {val?.section}</span>,
//     dateOfBirth: moment(val.dateOfBirth).format("DD-MMM-YYYY"),
//     contact: val.contact,
//     status: <span className={`font-bold ${val.status === "deactivated" ? "text-red-600" : "text-green-600"}`}>
//       {val.status === "deactivated" ? "Inactive" : "Active"}
//     </span>,
//     action: (
//       <div className="flex justify-center gap-3">
//         <FaEdit className="text-[20px] text-yellow-700 cursor-pointer" onClick={() => handleEdit(val)} />
//         <MdVisibility className="text-[20px] text-blue-700 cursor-pointer" onClick={() => handleView(val)} />
//       </div>
//     ),
//   }));

//   return (
//     <>
  //       {!edit && !viewStudent ? (
  //         <div className="mx-auto p-4">
  //           {/* <Breadcrumbs BreadItem={[{ title: "All Student", link: "/allstudent" }]} /> */}
  //           {filteredData.length > 0 ? <Table tHead={THEAD} tBody={tBody} isSearch={true} /> : <NoDataFound />}
  //         </div>
  //       ) : viewStudent ? (
  //         <StudentDetails student={viewStudent} setViewStudent={setViewStudent} />
  //       ) : null}
//     </>
//   );
// }

// export default CreateStudent;



// import React, { useState, useEffect, useRef } from "react";
// import "../../../Dynamic/Form/FormStyle.css";
// import { useStateContext } from "../../../contexts/ContextProvider.js";
// import './MUI.css'
// import NoDataFound from "../../../NoDataFound.jsx";
// import { useReactToPrint } from "react-to-print";
// import PrintTable from "./PrintTable"; // Import PrintTable component
// import ExportToExcel from "./ExportToExcel"; // Import ExportToExcel component
// import pdf from "../../../Icone/pdf.png";
// import Table from "../../../Dynamic/Table.jsx";
// import moment from "moment/moment.js";
// import { FaEdit } from "react-icons/fa";
// import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect.jsx";
// import Breadcrumbs from "../../../components/Breadcrumbs .jsx";
// import { MdDelete } from "react-icons/md";

// import {
//   AdminGetAllClasses,
//   getAllStudents,
//   studentsStatus,
// } from "../../../Network/AdminApi.js";
// import { toast } from "react-toastify";
// import EditStudent from "./EditStudent.jsx";
// import StudentDetails from "./StudentDetails.jsx";
// function CreateStudent() {
//   const {  setIsLoader } = useStateContext();
//   const [getClass, setGetClass] = useState([]); // All classes
//   const [selectedClass, setSelectedClass] = useState(""); // Selected class
//   const [selectedSection, setSelectedSection] = useState(""); // Selected section
//   const [availableSections, setAvailableSections] = useState([]); // Sections for selected class
//   const [submittedData, setSubmittedData] = useState([]); // All student data
//   const [filteredData, setFilteredData] = useState([]); // Filtered student data
//   const [edit,setEdit]=useState(false)
//   const [studentDetails,setStudentDetails]=useState([])
//   const [viewStudent, setViewStudent] = useState(null); // For viewing student details

//   const getAllStudent = async () => {
//     setIsLoader(true)
//     try {
//       const response = await getAllStudents();
//       if (response?.success) {
//         setIsLoader(false)
//         setSubmittedData(response?.students?.data?.reverse());
//         setFilteredData(response?.students?.data);
//         // setSubmittedData(filterApproved);
//         // setFilteredData(filterApproved);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   };
//   const toggle=async(ID)=>{
  
//     try {
//       const response= await studentsStatus(ID)
//       if(response?.success){
//         toast.success(response?.message)
//         getAllStudent()
//       }
//       else{
//         toast?.error(response?.message)
//       }
//     } catch (error) {
//       console.log("error",error)
//     }
//   }
//   const GetAllClasses = async () => {
//     setIsLoader(true)
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setIsLoader(false)
//         let classes = response.classes;
//         setGetClass(classes.sort((a, b) => a - b));
//        } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   };
//   useEffect(() => {
//     getAllStudent();
//     GetAllClasses();
//   }, [edit]);
//   const printRef = useRef();
//   useEffect(() => {
//     let filtered = submittedData;

//     if (selectedClass) {
//       filtered = filtered.filter((student) => student.class === selectedClass);
//     }

//     if (selectedSection) {
//       filtered = filtered.filter(
//         (student) => student.section === selectedSection
//       );
//     }

//     setFilteredData(filtered);
//   }, [selectedClass, selectedSection, submittedData]);

  
//   // const handleView = (student) => {
//   //   setViewStudent(student);
//   //   setEdit(false);
//   // };
//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass?.find(
//       (cls) => cls.className === selectedClassName
//     );
//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections);
    
//     } else {
//       setAvailableSections([]);
//     }
//   };
//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value); // Update the selectedSection state
//   };

//   const handlePrint = useReactToPrint({
//     content: () => printRef.current,
//     pageStyle: `
//       @media print {
//         @page {
//           size: A4 landscape;
//           margin: 15mm;
//         }
//         body {
//           font-family: Arial, sans-serif;
//           -webkit-print-color-adjust: exact;
//         }
//         .page {
//           page-break-after: always;
//         }
//         .print-header {
//           font-size: 20px;
//           font-weight: bold;
//           text-align: center;
//           margin-bottom: 10px;
//         }
//         .print-table {
//           width: 100%;
//           border-collapse: collapse;
//         }
//         .print-table th, .print-table td {
//           border: 1px solid black;
//           padding: 5px;
//           text-align: left;
//         }
//         .print-table th {
//           background-color: #f2f2f2;
//         }
//       }
//     `,
//   });

//   const handleEdit = (val) => {
//     setEdit(true);
//     setViewStudent(null);
//   };

//   const handleView = (student) => {
//     setViewStudent(student);
//     setEdit(false);
//   };
//   const THEAD = [
//     { id: "SN", label: "S No.",width:"5"},
//     { id: "photo", label: "Photo",width:"7"},
//     { id: "admissionNo", label: "Admission No" },
//     { id: "name", label: "Name" },
//     { id: "email", label: "Email" },
//     { id: "fatherName", label: "Father Name" },
//     // { id: "motherName", label: "Mother Name" },
//     { id: "class", label: "Class" },
//     { id: "dateOfBirth", label: "DOB" },
//     { id: "contact", label: "Contact" },
//     // { id: "joiningDate", label: "Adm. Date" },
//     { id: "gender", label: "Gender" },
//     // { id: "address", label: "Address" },
//     { id: "status", label: "Status" },
//     { id: "action", label: "Action" },
//   ];
//   const tBody = filteredData?.map((val, ind) => ({
//     SN: ind + 1,
//     photo: (
//       <img
//         src={
//           val?.studentImage?.url ||
//           "https://www.stcroixstoves.com/wp-content/uploads/2020/04/no.png"
//         }
//         alt="photo"
//         className="w-5 h-5 object-cover rounded-md"
//       />
//     ),
//     admissionNo: (
//       <span className="text-green-800 font-semibold">
//         {val.admissionNumber}
//       </span>
//     ),
    
//     name: val.studentName,
//     email: val.email,
//     fatherName: val.fatherName,
//     // motherName: val.motherName,
//     class: <span>{val.class} - {val?.section}</span>,
//     dateOfBirth: moment(val.dateOfBirth).format("DD-MMM-YYYY"),
//     contact: val.contact,
//     // joiningDate: moment(val.joiningDate).format("DD-MMM-YYYY"),
//     gender: val.gender,
//     // address: val.address,
//     status:<span 
//     className={`${
//       val.status === "deactivated" 
//         ? "text-red-700  bg-gray-300" 
//         : "bg-green-600 text-white "
//     } cursor-pointer p-1 rounded-md font-bold font-serif`}
//     onClick={() => toggle(val?.studentId)}
//   >
//     {/* {val.status} */}
//     {val.status === "deactivated"?"Inactive":"Active" }
//   </span>,  
//     // ActiveStatus: <span  className={`${val.status==="deactivated"?"text-red-700  font-bold":""}`}>{val.status}</span>,
//     action: (
//       <div className="flex justify-center gap-5">
//         {/* <Link to={`/admin/allstudent/editstudent/edit-profile/${val?._id}`}> */}
//           <span className="cursor-pointer">
//           <MdVisibility className="text-[20px] text-blue-700 cursor-pointer" onClick={() => handleView(val)} />
//             <FaEdit className="text-[20px] text-yellow-700" onClick={()=>handleEdit(val)} />
//           </span>
         
       
//       </div>
//     ),
//     rowClassName: val.status === "deactivated" ? "bg-blue-gray-100" : "",  // Add this line
//   }));

//   const dynamicOptions = getClass.map((cls) => ({
//     label: cls.className,
//     value: cls.className,
//   }));
//   const DynamicSection = availableSections?.map((item) => ({
//     label: item,
//     value: item,
//   }));
//   const BreadItem = [
//     {
//       title: "All Student",
//       link: "/allstudent",
//     },
//   ];
//   return (
//   <>
//   {!edit?(  <div className="  mx-auto p-1 overflow-hidden">
//       <Breadcrumbs BreadItem={BreadItem} />
//       <div className="flex gap-2">
//         <ReactSelect
//           name="studentClass"
//           value={selectedClass}
//           handleChange={handleClassChange}
//           label="Select a Class"
//           dynamicOptions={dynamicOptions}
//         />
//         <ReactSelect
//           name="studentSection"
//           value={selectedSection} // Use selectedSection state
//           handleChange={handleSectionChange} // Use the handleSectionChange function
//           label="Select a Section"
//           dynamicOptions={DynamicSection}
//         />
//          <img
//             src={pdf}
//             alt=""
//             className="h-6 cursor-pointer"
//             onClick={handlePrint}
//           />
//           <ExportToExcel data={filteredData} fileName="Students_Report"  />
// </div>
// )}
//       {/* </div> */}
//       {/* {filteredData?.length > 0 ? (
//         <Table tHead={THEAD} tBody={tBody} isSearch={true} />
//       ) : (
//         <NoDataFound />
//       )}
//       <div className="hidden">
//         <PrintTable ref={printRef} data={filteredData} itemsPerPage={25} />
//       </div>
//     </div>
//   ):(<EditStudent studentDetails={studentDetails} setEdit={setEdit}/>)} */}
//  {!edit && !viewStudent ? (
//         <div className="mx-auto p-4">
//           {filteredData.length > 0 ? <Table tHead={THEAD} tBody={tBody} isSearch={true} /> : <NoDataFound />}
//         </div>
//       ) : viewStudent ? (
//         <StudentDetails student={viewStudent} setViewStudent={setViewStudent} />
//       ) : (
//         <EditStudent studentDetails={studentDetails} setEdit={setEdit} />
//       )}
//   </>
//   );
// }

// export default CreateStudent;

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
    AdminGetAllClasses,
    getAllStudents,
    studentsStatus,
} from "../../../Network/AdminApi.js";
import { toast } from "react-toastify";
import EditStudent from "./EditStudent.jsx";
import StudentDetails from "./StudentDetails.jsx";

function CreateStudent() {
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
            const response = await getAllStudents();
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
console.log("selectedClass",selectedClass)
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
                className={`p-1 rounded-full text-2xl ${
                  student.status === "active" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"
                }`}
            >
                {student.status === "active" ? <MdToggleOn /> : <MdToggleOff />}
            </button>
             /* Alternative text/badge style:
             <span
                 className={`cursor-pointer p-1 px-2 rounded-md text-xs font-semibold ${
                     student.status === "active"
                         ? "bg-green-100 text-green-700"
                         : "bg-red-100 text-red-700"
                 }`}
                 onClick={() => handleToggleStatus(student?.studentId, student.status)}
             >
                 {student.status === "active" ? "Active" : "Inactive"}
             </span>
             */
        ),
        action: (
            <div className="flex justify-center items-center gap-3">
                <button title="View Details" onClick={() => handleViewClick(student)} className="text-blue-600 hover:text-blue-800 text-lg">
                    <FaEye />
                </button>
                <button title="Edit Student" onClick={() => handleEditClick(student)} className="text-yellow-600 hover:text-yellow-800 text-lg">
                    <FaEdit />
                </button>
                {/* Add Delete button if needed */}
                {/* <button title="Delete Student" onClick={() => handleDelete(student.studentId)} className="text-red-600 hover:text-red-800 text-lg">
                    <MdDelete />
                </button> */}
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
            <div className="mx-auto p-4 overflow-hidden">
                <Breadcrumbs BreadItem={BreadItem} />

                {/* Filter and Action Bar */}
                <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-white rounded shadow-md">
                   
               
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
                    
                    <div className="flex gap-2 items-center ml-auto"> {/* Actions */}
                        <button onClick={handlePrint} className="p-2 rounded hover:bg-gray-200" title="Print Table">
                            <img src={pdf} alt="Print PDF" className="h-5 w-5" />
                        </button>
                        <ExportToExcel data={filteredData} fileName="Students_Report" />
                    </div>
                </div>

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

export default CreateStudent;