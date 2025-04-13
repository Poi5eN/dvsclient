import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../../Dynamic/Form/FormStyle.css";
import { useStateContext } from "../../../contexts/ContextProvider.js";
import "./MUI.css";
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
    // setIsLoader(true); // Potentially set loader again or manage it globally
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
      // setIsLoader(false);
    }
  }, []); // Include dependencies

  useEffect(() => {
    fetchAllStudents();
    fetchAllClasses();
  }, [fetchAllStudents, fetchAllClasses]); // Use the useCallback functions

  // --- Filtering Logic ---

  useEffect(() => {
    let filtered = allStudents;
    if (selectedClass) {
      filtered = filtered.filter((student) => student.class === selectedClass);
    }

    if (selectedSection) {
      filtered = filtered.filter(
        (student) => student.section === selectedSection
      );
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
        toast.success(
          response?.message || `Student status updated successfully.`
        );
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
    setIsEditing(true); // Enter edit mode
    setStudentToView(null); // Ensure view mode is off
  };

  const handleViewClick = (student) => {
    setStudentToView(student); // Set the student to view
    setIsEditing(false); // Ensure edit mode is off
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
  const THEAD = [
    { id: "SN", label: "S No.", width: "2%" },

    { id: "photo", label: "Photo", width: "7", width: "2%" },
    { id: "admissionNo", label: "Adm No", width: "2%" },
    { id: "name", label: "Name", width: "10%" },
    { id: "email", label: "Email", width: "10%" },
    { id: "fatherName", label: "F Name" },
    { id: "class", label: "Class" },
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
        src={
          student?.studentImage?.url ||
          "https://via.placeholder.com/40?text=No+Img"
        } // Placeholder
        alt="student"
        className="w-6 h-6 object-cover rounded-md mx-auto" // Centered and slightly larger
      />
    ),
    admissionNo: (
      <span className="text-indigo-700 font-semibold">
        {student.admissionNumber || "N/A"}
      </span>
    ),
    name: student.studentName || "N/A",
    email: student.email || "N/A",
    fatherName: student.fatherName || "N/A",
    class: (
      <span>
        {student.class || "N/A"} - {student?.section || "N/A"}
      </span>
    ),
    dateOfBirth: student.dateOfBirth
      ? moment(student.dateOfBirth).format("DD-MMM-YYYY")
      : "N/A",
    contact: student.contact || "N/A",
    gender: student.gender || "N/A",
  
    action: (
      <div className="flex justify-center items-center gap-3">
        <button
          title="View Details"
          onClick={() => handleViewClick(student)}
          className="text-blue-600 hover:text-blue-800 text-lg"
        >
          <FaEye />
        </button>
        <button
          title="Edit Student"
          onClick={() => handleEditClick(student)}
          className="text-yellow-600 hover:text-yellow-800 text-lg"
        >
          <FaEdit />
        </button>
        <button
        onClick={() => handleToggleStatus(student?.studentId, student.status)}
        // title={
        //   student.status === "active"
        //     ? "Deactivate Student"
        //     : "Activate Student"
        // }
        title="Deactivate"
        className={`p-1 rounded-full text-2xl text-red-600 hover:text-red-800`}
      >
        {" "}
        <MdDelete />
      </button>
      </div>
    ),
    rowClassName:
      student.status === "deactivated" || student.status === "inactive"
        ? "bg-gray-100 opacity-80"
        : "", // Adjust class for inactive
  }));
  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));
  const DynamicSection = availableSections?.map((item) => ({
    label: item,
    value: item,
  }));

  const BreadItem = [{ title: "All Students", link: "/admin/allstudent" }]; // Make sure link is correct

  if (!isEditing && !studentToView) {
    return (
      <div className="mt-2">
        {/* <Breadcrumbs BreadItem={BreadItem} /> */}
        <div className="flex flex-wrap items-center gap-1  bg-white rounded  ">
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
{
          filteredData?.length>0 && <span className="text-green-700 text-[18px] font-bold">COUNT = {filteredData?.length} 
          </span>
        }
          <div className="flex gap-2 items-center ml-auto">
            {" "}
            {/* Actions */}
            <button
              onClick={handlePrint}
              className="p-2 rounded hover:bg-gray-200"
              title="Print Table"
            >
              <img src={pdf} alt="Print PDF" className="h-5 w-5" />
            </button>
            <ExportToExcel data={filteredData} fileName="Students_Report" />
            
          </div>
        </div>

        {filteredData.length > 0 ? (
          <Table tHead={THEAD} tBody={tBody} isSearch={true} />
        ) : (
          <NoDataFound message="No students found matching the criteria." />
        )}
        <div className="hidden">
          <PrintTable ref={printRef} data={filteredData} itemsPerPage={1000} />{" "}
        </div>
      </div>
    );
  }
  if (studentToView) {
    return <StudentDetails student={studentToView} onBack={handleCloseView} />;
  }

  if (isEditing && studentToEdit) {
    return (
      <EditStudent
        studentDetails={studentToEdit}
        onFinished={handleCloseEdit}
      /> // Pass callback to handle closing/refetching
    );
  }

  return <NoDataFound message="Loading or error state." />;
}

export default CreateStudent;
