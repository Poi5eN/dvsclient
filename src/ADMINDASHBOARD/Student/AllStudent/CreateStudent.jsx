import React, { useState, useEffect, useRef, useCallback } from "react";
import "../../../Dynamic/Form/FormStyle.css";
import { useStateContext } from "../../../contexts/ContextProvider.js";
import "./MUI.css";
import NoDataFound from "../../../NoDataFound.jsx";
import { useReactToPrint } from "react-to-print";
import PrintTable from "./PrintTable";
import ExportToExcel from "./ExportToExcel";
import pdf from "../../../Icone/pdf.png";
import Table from "../../../Dynamic/Table.jsx";
import moment from "moment/moment.js";
import { FaEdit, FaEye, FaUsersCog } from "react-icons/fa"; // Added FaUsersCog
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect.jsx";
import Breadcrumbs from "../../../components/Breadcrumbs .jsx";
import { MdDelete, MdToggleOn, MdToggleOff } from "react-icons/md";
import { useNavigate } from "react-router-dom"; // Added for navigation
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
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);
  const [availableSections, setAvailableSections] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [studentToView, setStudentToView] = useState(null);
  const navigate = useNavigate(); // Added for navigation

  const printRef = useRef();

  // --- Data Fetching ---
  const fetchAllStudents = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents();
      if (response?.success) {
        const students = response?.students?.data?.reverse() || [];
        setAllStudents(students);
      } else {
        toast.error(response?.message || "Failed to fetch students.");
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("An error occurred while fetching students.");
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader]);

  const fetchAllClasses = useCallback(async () => {
    try {
      const response = await AdminGetAllClasses();
      if (response?.success) {
        const classes = response.classes || [];
        setGetClass(classes);
      } else {
        toast.error(response?.message || "Failed to fetch classes.");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("An error occurred while fetching classes.");
    }
  }, []);

  useEffect(() => {
    fetchAllStudents();
    fetchAllClasses();
  }, [fetchAllStudents, fetchAllClasses]);

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
      const response = await studentsStatus(studentId);
      if (response?.success) {
        toast.success(
          response?.message || `Student status updated successfully.`
        );
        await fetchAllStudents();
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
    setSelectedSection(e.target.value);
  };
  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `@media print { @page { size: A4 landscape; margin: 15mm; } body { font-family: Arial, sans-serif; -webkit-print-color-adjust: exact; } .page { page-break-after: always; } .print-header { font-size: 20px; font-weight: bold; text-align: center; margin-bottom: 10px; } .print-table { width: 100%; border-collapse: collapse; } .print-table th, .print-table td { border: 1px solid black; padding: 5px; text-align: left; } .print-table th { background-color: #f2f2f2; } }`,
  });

  const handleEditClick = (student) => {
    setStudentToEdit(student);
    setIsEditing(true);
    setStudentToView(null);
  };

  const handleViewClick = (student) => {
    setStudentToView(student);
    setIsEditing(false);
  };

  const handleCloseEdit = (shouldRefetch = false) => {
    setIsEditing(false);
    setStudentToEdit(null);
    if (shouldRefetch) {
      fetchAllStudents();
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
    { id: "action", label: "Action" },
  ];

  const tBody = filteredData?.map((student, ind) => ({
    SN: ind + 1,
    photo: (
      <img
        src={
          student?.studentImage?.url ||
          "https://via.placeholder.com/40?text=No+Img"
        }
        alt="student"
        className="w-6 h-6 object-cover rounded-md mx-auto"
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
<<<<<<< HEAD
  
=======
>>>>>>> f83d0cbf8993d9523595f2a4f3a4aa9d1839b06f
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
          title="Deactivate"
          className={`p-1 rounded-full text-2xl text-red-600 hover:text-red-800`}
        >
          <MdDelete />
        </button>
      </div>
    ),
    rowClassName:
      student.status === "deactivated" || student.status === "inactive"
        ? "bg-gray-100 opacity-80"
        : "",
  }));

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));
  const DynamicSection = availableSections?.map((item) => ({
    label: item,
    value: item,
  }));

  const BreadItem = [{ title: "All Students", link: "/admin/allstudent" }];

  if (!isEditing && !studentToView) {
    return (
      <div className="mt-2">
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
            value={selectedSection}
            handleChange={handleSectionChange}
            label="Select a Section"
            dynamicOptions={DynamicSection}
          />
          {filteredData?.length > 0 && (
            <span className="text-green-700 text-[18px] font-bold">
              COUNT = {filteredData?.length}
            </span>
          )}
          <div className="flex gap-2 items-center ml-auto">
            <button
              onClick={handlePrint}
              className="p-2 rounded hover:bg-gray-200"
              title="Print Table"
            >
              <img src={pdf} alt="Print PDF" className="h-5 w-5" />
            </button>
            <ExportToExcel data={filteredData} fileName="Students_Report" />
            <button
              onClick={() => navigate("/admin/bulk-edit-students")}
              className="p-2 rounded hover:bg-gray-200"
              title="Bulk Edit Students"
            >
              <FaUsersCog className="h-5 w-5" />
            </button>
          </div>
        </div>

        {filteredData.length > 0 ? (
          <Table tHead={THEAD} tBody={tBody} isSearch={true} />
        ) : (
          <NoDataFound message="No students found matching the criteria." />
        )}
        <div className="hidden">
<<<<<<< HEAD
          <PrintTable ref={printRef} data={filteredData} itemsPerPage={1000} />{" "}
=======
          <PrintTable ref={printRef} data={filteredData} itemsPerPage={1000} />
>>>>>>> f83d0cbf8993d9523595f2a4f3a4aa9d1839b06f
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
      />
    );
  }
  return <NoDataFound message="Loading or error state." />;
}

export default CreateStudent;