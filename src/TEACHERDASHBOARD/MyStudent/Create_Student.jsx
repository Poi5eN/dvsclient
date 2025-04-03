import React, { useState, useEffect, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider.js";
import NoDataFound from "../../NoDataFound.jsx";
import Table from "../../Dynamic/Table.jsx";
import moment from "moment/moment.js";
import { FaEdit, FaEye } from "react-icons/fa"; // Changed MdVisibility to FaEye for consistency
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect.jsx"; // Assuming this is your custom wrapper or react-select itself
import Breadcrumbs from "../../components/Breadcrumbs .jsx";

import {getAllStudents} from "../../Network/TeacherApi.js";
import { toast } from "react-toastify";
import StudentDetails from "../../ADMINDASHBOARD/Student/AllStudent/StudentDetails.jsx";


function CreateStudent() {
    const { setIsLoader } = useStateContext();
    const [selectedClass, setSelectedClass] = useState(null); // Store selected class object { value: string, label: string } | null
    const [selectedSection, setSelectedSection] = useState(null); // Store selected section object { value: string, label: string } | null
    const [availableSections, setAvailableSections] = useState([]); // Sections for selected class [{ value: string, label: string }]
    const [allStudents, setAllStudents] = useState([]); // Raw student data from API
    const [filteredData, setFilteredData] = useState([]); // Filtered student data for display
    const [isEditing, setIsEditing] = useState(false);  const [studentToView, setStudentToView] = useState(null); // Student data for viewing details

   
    const user = JSON.parse(localStorage.getItem("user"));
     const param = {
            class: user?.classTeacher,
            section: user?.section
        }


    const allStudent = async () => {
        setIsLoader(true)
        try {
            const response = await getAllStudents(param);

            if (response?.success) {
                setIsLoader(false)
                // setSubmittedData(response?.students?.data);
                const students = response?.students?.data?.reverse() || [];
                setAllStudents(students); 
            } else {
                toast.error(response?.message);

            }
        } catch (error) {
            console.log("error", error);

        }
        finally {
            setIsLoader(false)
        }
    };
      useEffect(() => {
        allStudent();
    }, []);
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

    const handleClassChange = (e) => {
      const selectedClassName = e.target.value;
      setSelectedClass(selectedClassName);
     
     
    };
    const handleSectionChange = (e) => {
      setSelectedSection(e.target.value); // Update the selectedSection state
    };
  
 
    const handleViewClick = (student) => {
        setStudentToView(student); // Set the student to view
        setIsEditing(false);       // Ensure edit mode is off
    };

  

    const handleCloseView = () => {
        setStudentToView(null);
    };

    const THEAD = [
        { id: "SN", label: "S No.", width: "5" },
        { id: "photo", label: "Photo", width: "7" },
        { id: "admissionNo", label: "Admission No" },
        { id: "name", label: "Name" },
        { id: "email", label: "Email" },
        { id: "fatherName", label: "Father Name" },
        // { id: "class", label: "Class" },
        { id: "dateOfBirth", label: "DOB" },
        { id: "contact", label: "Contact" },
        { id: "gender", label: "Gender" },
        // { id: "status", label: "Status" },
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
        // class: <span>{student.class || 'N/A'} - {student?.section || 'N/A'}</span>,
        dateOfBirth: student.dateOfBirth ? moment(student.dateOfBirth).format("DD-MMM-YYYY") : 'N/A',
        contact: student.contact || 'N/A',
        gender: student.gender || 'N/A',
        // status: (
        //     <button
        //         onClick={() => handleToggleStatus(student?.studentId, student.status)}
        //         title={student.status === "active" ? "Deactivate Student" : "Activate Student"}
        //         className={`p-1 rounded-full text-2xl ${
        //           student.status === "active" ? "text-green-600 hover:text-green-800" : "text-red-600 hover:text-red-800"
        //         }`}
        //     >
        //         {student.status === "active" ? <MdToggleOn /> : <MdToggleOff />}
        //     </button>
             
        // ),
        action: (
            <div className="flex justify-center items-center gap-3">
                <button title="View Details" onClick={() => handleViewClick(student)} className="text-blue-600 hover:text-blue-800 text-lg">
                    <FaEye />
                </button>
                {/* <button title="Edit Student" onClick={() => handleEditClick(student)} className="text-yellow-600 hover:text-yellow-800 text-lg">
                    <FaEdit />
                </button> */}
               
            </div>
        ),
        rowClassName: student.status === "deactivated" || student.status === "inactive" ? "bg-gray-100 opacity-80" : "", // Adjust class for inactive
    }));

    if (!isEditing && !studentToView) {
        return (
            <div className="mx-auto p-4 overflow-hidden">
                All student

                {/* Student Table */}
                {filteredData.length > 0 ? (
                    <Table tHead={THEAD} tBody={tBody} isSearch={true} />
                ) : (
                    <NoDataFound message="No students found matching the criteria." />
                )}

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
 return <NoDataFound message="Loading or error state." />;
}

export default CreateStudent;



// import React, { useState, useEffect, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { getStudentData_TeacherColumns } from "../../Dynamic/utils/TableUtils";
// import NoDataFound from "../../NoDataFound";
// import DynamicDataTable from "../../Dynamic/DynamicDataTable";
// import { getAllStudents } from "../../Network/TeacherApi";
// import { toast } from "react-toastify";

// function Create_Student() {
//     const { currentColor,setIsLoader  } = useStateContext();
//     const [submittedData, setSubmittedData] = useState([]);
//     const tableRef = useRef(); // Ref for printing
//     const isMobile = window.innerWidth <= 768;
//     const user = JSON.parse(localStorage.getItem("user"));
//      const param = {
//             class: user?.classTeacher,
//             section: user?.section
//         }
//         const allStudent = async () => {
//             setIsLoader(true)
//             try {
//                 const response = await getAllStudents(param);
    
//                 if (response?.success) {
//                     setIsLoader(false)
//                     setSubmittedData(response?.students?.data);
//                 } else {
//                     toast.error(response?.message);
    
//                 }
//             } catch (error) {
//                 console.log("error", error);
    
//             }
//             finally {
//                 setIsLoader(false)
//             }
//         };
//           useEffect(() => {
//             allStudent();
//         }, []);
    


//      const renderMobileStudentCards = () => {
//          return (
//              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
//                 {submittedData.map((student, index) => (
//                      <div key={index} className="bg-white rounded-lg shadow-md p-4 relative transition-transform hover:scale-105">
//                             <img
//                             src={student?.image?.url}
//                             alt="Student"
//                              className="absolute top-2 right-2 h-8 w-8 rounded-full object-cover"
//                           />
//                             <h3 className="text-lg font-semibold mb-2">{student.studentName}</h3>
//                             <p><strong>Roll No:</strong> {student.rollNo}</p>
//                             <p><strong>Adm No:</strong> {student.admissionNumber}</p>
                           
//                             <p><strong>Father's Name:</strong> {student.fatherName}</p>
//                             <p><strong>Mother's Name:</strong> {student.motherName}</p>
//                             <p><strong>Contact:</strong> {student.contact}</p>
//                         </div>
//                     ))}
//             </div>
//         );
//     };

//     return (
//         <div className="">
//           <h1 className="text-xl text-center font-bold uppercase" 
//           style={{color:currentColor}}
//           >Student</h1>
//             {/* <Heading2 title={"Students"} /> */}
//              {/* <Button name="Print" onClick={handlePrint}  /> */}
//             <div ref={tableRef}>
//             {isMobile ? (
//                    submittedData.length > 0 ? (
//                     renderMobileStudentCards()
//                     ) : (
//                        <NoDataFound />
//                      )
//                ) : (
//                     <>
//                       {submittedData.length > 0 ? (
//                             <DynamicDataTable
//                                 data={submittedData}
//                                 columns={getStudentData_TeacherColumns()}
//                                 className="w-full overflow-auto"
//                                 itemsPerPage={15}
//                             />
//                          ) : (
//                             <NoDataFound />
//                          )}
//                     </>
//                 )}
//           </div>
//         </div>
//     );
// }

// export default Create_Student;


