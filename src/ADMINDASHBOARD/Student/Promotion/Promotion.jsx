
import React, { useCallback, useEffect, useState } from "react";
import {
  ActiveStudents,
  AdminGetAllClasses,
  promotionOfStudent,
  getStudentsBySession,
} from "../../../Network/AdminApi";
import Table from "../../../Dynamic/Table";
import Button from "../../../Dynamic/utils/Button";
import { toast } from "react-toastify";
import { useStateContext } from "../../../contexts/ContextProvider";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import PageHeaderWithBreadcrumb from "../../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../../Dynamic/BreadcrumbList";

const Promotion = () => {
  const { setIsLoader } = useStateContext();
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [studentDetails, setStudentDetails] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [getClass, setGetClass] = useState([]);
  const [fromSections, setFromSections] = useState([]);
  const [toSections, setToSections] = useState([]);
  const [historicalStudents, setHistoricalStudents] = useState([]);
  const session=JSON.parse(localStorage.getItem("session"))
  const sessionOptions = [
    { label: "2024-2025", value: "2024-2025" },
    { label: "2025-2026", value: "2025-2026" },
  ];

  const [values, setValues] = useState({
    fromClass: "",
    fromSection: "",
    toClass: "",
    toSection: "",
    toSession: "",
  });

  const studentData = async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents(session);  
      if (response?.success) {
        setStudentDetails(response?.students?.data?.reverse() || []);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      toast.error("Error fetching students");
    } finally {
      setIsLoader(false);
    }
  };

  const fetchAllClasses = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await AdminGetAllClasses();
      if (response?.success) {
        setGetClass(response.classes || []);
      } else {
        toast.error("Failed to fetch classes");
      }
    } catch (error) {
      toast.error("Error fetching classes");
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader]);

  useEffect(() => {
    studentData();
    fetchAllClasses();
  }, [fetchAllClasses]);

  const filterStudents = (cls, sec) => {
    const filtered = studentDetails.filter((student) => {
      const matchClass = cls ? student.class === cls : true;
      const matchSection = sec ? student.section === sec : true;
      return matchClass && matchSection;
    });
    setFilteredStudents(filtered);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));

    if (name === "fromClass") {
      const classObj = getClass.find((cls) => cls.className === value);
      setFromSections(classObj?.sections || []);
      filterStudents(value, values.fromSection);
    } else if (name === "fromSection") {
      filterStudents(values.fromClass, value);
    } else if (name === "toClass") {
      const classObj = getClass.find((cls) => cls.className === value);
      setToSections(classObj?.sections || []);
    }
  };

  const handleSelectAllChange = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setSelectedStudent(newSelectAll ? filteredStudents.map((s) => s._id) : []);
  };

  const handleCheckboxChange = (studentId) => {
    setSelectedStudent((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handlePromoteClick = async () => {
    if (!selectedStudent.length) {
      toast.error("No students selected for promotion");
      return;
    }
    if (!values.fromClass || !values.fromSection || !values.toClass || !values.toSection || !values.toSession) {
      toast.error("Please fill all promotion fields");
      return;
    }

    setIsLoader(true);
    const dataToUpdate = {
      students: selectedStudent,
      promotedClass: values.toClass,
      promotedSection: values.toSection,
      promotedSession: values.toSession,
    };

    try {
      const response = await promotionOfStudent(dataToUpdate);
      if (response?.success) {
        toast.success(response.message || "Students promoted successfully");
        setValues({ fromClass: "", fromSection: "", toClass: "", toSection: "", toSession: "" });
        setFilteredStudents([]);
        setSelectedStudent([]);
        setSelectAll(false);
        await studentData(); // Refresh student list
      } else {
        toast.error(response.message || "Failed to promote students");
      }
    } catch (error) {
      toast.error("Error promoting students");
    } finally {
      setIsLoader(false);
    }
  };

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));
  const fromSectionOptions = fromSections.map((item) => ({
    label: item,
    value: item,
  }));
  const toSectionOptions = toSections.map((item) => ({
    label: item,
    value: item,
  }));

  const THEAD = [
    {
      id: "select",
      label: (
        <input type="checkbox" checked={selectAll} onChange={handleSelectAllChange} />
      ),
    },
    { id: "SN", label: "S No." },
    { id: "admissionNumber", label: "Admission No" },
    { id: "fullName", label: "Name" },
    { id: "class", label: "Class" },
    { id: "section", label: "Section" },
    { id: "session", label: "Session" },
  ];

  const tBody = filteredStudents.map((val, ind) => ({
    select: (
      <input
        type="checkbox"
        checked={selectedStudent.includes(val._id)}
        onChange={() => handleCheckboxChange(val._id)}
      />
    ),
    SN: ind + 1,
    admissionNumber: <span className="text-red-700 font-semibold">{val.admissionNumber}</span>,
    fullName: val.studentName,
    class: val.class,
    section: val.section,
    session: val.session,
  }));

  return (
    <div>
        <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Student Promote"/>
      <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap gap-8">
        <div>
          <span className="font-semibold">From</span>
          <ReactSelect
            name="fromClass"
            label="Select a Class"
            value={values.fromClass}
            handleChange={handleInputChange}
            dynamicOptions={dynamicOptions}
          />
          <ReactSelect
            name="fromSection"
            label="Section"
            value={values.fromSection}
            handleChange={handleInputChange}
            dynamicOptions={fromSectionOptions}
          />
        </div>
        <div>
          <span className="font-semibold">To</span>
          <ReactSelect
            name="toClass"
            label="Select a Class"
            value={values.toClass}
            handleChange={handleInputChange}
            dynamicOptions={dynamicOptions}
          />
          <ReactSelect
            name="toSection"
            label="Section"
            value={values.toSection}
            handleChange={handleInputChange}
            dynamicOptions={toSectionOptions}
          />
          <ReactSelect
            name="toSession"
            label="Session"
            value={values.toSession}
            handleChange={handleInputChange}
            dynamicOptions={sessionOptions}
          />
          <Button color="Green" name="Promote" onClick={handlePromoteClick} />
        </div>
      </div>

      <Table isSearch={false} tHead={THEAD} tBody={tBody} />
    </div>
  );
};

export default Promotion;