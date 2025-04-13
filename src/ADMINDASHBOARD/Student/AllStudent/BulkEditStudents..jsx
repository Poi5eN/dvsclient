import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { ActiveStudents, AdminGetAllClasses } from "../../../Network/AdminApi";
// Import the components property from react-select
import Select, { components } from "react-select";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useNavigate } from "react-router-dom";

// Custom option component to include checkboxes
const CheckboxOption = (props) => {
  return (
    <components.Option {...props}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <input
          type="checkbox"
          checked={props.isSelected}
          onChange={() => null}
          style={{ marginRight: 8 }}
        />
        <span>{props.label}</span>
      </div>
    </components.Option>
  );
};

const editableFields = [
  { label: "Email", value: "email" },
  { label: "Date of Birth", value: "dateOfBirth" },
  { label: "Mother Name", value: "motherName" },
  { label: "Father Name", value: "fatherName" },
  { label: "Guardian Name", value: "guardianName" },
  { label: "Remarks", value: "remarks" },
  { label: "Transport", value: "transport" },
  { label: "Parent Contact", value: "parentContact" },
  { label: "Roll No", value: "rollNo" },
  { label: "Gender", value: "gender" },
  { label: "Joining Date", value: "joiningDate" },
  { label: "Address", value: "address" },
  { label: "Contact", value: "contact" },
  { label: "Country", value: "country" },
  { label: "Religion", value: "religion" },
  { label: "Caste", value: "caste" },
  { label: "Nationality", value: "nationality" },
  { label: "Pincode", value: "pincode" },
  { label: "State", value: "state" },
  { label: "City", value: "city" },
];

const BulkEditStudents = () => {
  const { setIsLoader } = useStateContext();
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  // We'll store an array of field value strings
  const [selectedFields, setSelectedFields] = useState([]);
  const [studentsData, setStudentsData] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    const fetchClasses = async () => {
      setIsLoader(true);
      try {
        const response = await AdminGetAllClasses();
        if (response.success) {
          setClasses(response.classes || []);
        } else {
          toast.error("Failed to fetch classes");
        }
      } catch (error) {
        toast.error("Error fetching classes");
      } finally {
        setIsLoader(false);
      }
    };
    fetchClasses();
  }, [setIsLoader]);

  const handleClassChange = (e) => {
    const className = e.target.value;
    setSelectedClass(className);
    const classObj = classes.find((cls) => cls.className === className);
    setSections(classObj ? classObj.sections : []);
    setSelectedSection("");
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  // Update this handler to work with react-select directly.
  const handleFieldsChange = (selectedOptions) => {
    const values = selectedOptions ? selectedOptions.map(option => option.value) : [];
    setSelectedFields(values);
  };

  const handleApply = async () => {
    if (!selectedClass || !selectedSection || selectedFields.length === 0) {
      toast.error("Please select class, section, and at least one field");
      return;
    }
    setIsLoader(true);
    try {
      const response = await ActiveStudents({
        class: selectedClass,
        section: selectedSection,
      });
      if (response.success) {
        setStudentsData(response.students.data || []);
        setSelectedStudents([]);
        setSelectAll(false);
      } else {
        toast.error("Failed to fetch students");
      }
    } catch (error) {
      toast.error("Error fetching students");
    } finally {
      setIsLoader(false);
    }
  };

  const handleInputChange = (studentId, field, value) => {
    setStudentsData((prev) =>
      prev.map((student) =>
        student.studentId === studentId ? { ...student, [field]: value } : student
      )
    );
  };

  const handleStudentSelect = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(studentsData.map((student) => student.studentId));
    }
    setSelectAll(!selectAll);
  };

  const handleSave = async () => {
    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student to update");
      return;
    }

    // Include default fields by default
    const fieldsToSend = ["studentName", "class", "section", "admissionNumber", ...selectedFields];
    const updates = studentsData
      .filter((student) => selectedStudents.includes(student.studentId))
      .map((student) => ({
        studentId: student.studentId,
        fields: fieldsToSend.reduce((acc, field) => {
          acc[field] = student[field];
          return acc;
        }, {}),
      }));

    setIsLoader(true);
    try {
      const response = await fetch("https://dvsserver.onrender.com/api/v1/adminRoute/studentparent/many", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ updates }),
      });
      const data = await response.json();
      if (data.success) {
        toast.success("Students updated successfully");
        setSelectedStudents([]);
        setSelectAll(false);
      } else {
        toast.error(data.message || "Failed to update students");
      }
    } catch (error) {
      toast.error("Error updating students");
    } finally {
      setIsLoader(false);
    }
  };

  const handleCancel = () => {
    navigate("/admin/allstudent");
  };

  const classOptions = classes.map((cls) => ({ label: cls.className, value: cls.className }));
  const sectionOptions = sections.map((sec) => ({ label: sec, value: sec }));
  const fieldOptions = editableFields.map((field) => ({
    label: field.label,
    value: field.value,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Bulk Edit Students</h2>
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              {/* Assuming your ReactSelect supports onChange like a normal select */}
              <select
                name="class"
                value={selectedClass}
                onChange={handleClassChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Class</option>
                {classOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              <select
                name="section"
                value={selectedSection}
                onChange={handleSectionChange}
                className="w-full p-2 border rounded-lg"
              >
                <option value="">Select Section</option>
                {sectionOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 min-w-[200px]">
              {/* Use the react-select component directly with your custom Option */}
              <Select
                name="fields"
                placeholder="Select Fields"
                value={fieldOptions.filter(option => selectedFields.includes(option.value))}
                onChange={handleFieldsChange}
                options={fieldOptions}
                isMulti
                closeMenuOnSelect={false}
                components={{ Option: CheckboxOption }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleApply}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 shadow-md"
              >
                Apply
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-300 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors duration-200 shadow-md"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>

        {studentsData.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                    <th className="p-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                        title="Select All"
                      />
                    </th>
                    <th className="p-3 text-left font-semibold">Student Name</th>
                    <th className="p-3 text-left font-semibold">Class</th>
                    <th className="p-3 text-left font-semibold">Section</th>
                    <th className="p-3 text-left font-semibold">Admission Number</th>
                    {selectedFields.map((field) => (
                      <th
                        key={field}
                        className="p-3 text-left font-semibold bg-blue-100 text-blue-800"
                      >
                        {editableFields.find((f) => f.value === field)?.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((student, index) => (
                    <tr
                      key={student.studentId}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } hover:bg-blue-50 transition-colors duration-150`}
                    >
                      <td className="p-3">
                        <input
                          type="checkbox"
                          checked={selectedStudents.includes(student.studentId)}
                          onChange={() => handleStudentSelect(student.studentId)}
                          className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={student.studentName || ""}
                          onChange={(e) =>
                            handleInputChange(student.studentId, "studentName", e.target.value)
                          }
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={student.class || ""}
                          onChange={(e) =>
                            handleInputChange(student.studentId, "class", e.target.value)
                          }
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={student.section || ""}
                          onChange={(e) =>
                            handleInputChange(student.studentId, "section", e.target.value)
                          }
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="p-3">
                        <input
                          type="text"
                          value={student.admissionNumber || ""}
                          onChange={(e) =>
                            handleInputChange(student.studentId, "admissionNumber", e.target.value)
                          }
                          className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      {selectedFields.map((field) => (
                        <td key={field} className="p-3 bg-blue-50">
                          <input
                            type="text"
                            value={student[field] || ""}
                            onChange={(e) =>
                              handleInputChange(student.studentId, field, e.target.value)
                            }
                            className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="fixed bottom-6 right-6 flex gap-4">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 shadow-lg"
              >
                Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-red-500 text-white px-8 py-3 rounded-lg hover:bg-red-600 transition-colors duration-200 shadow-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BulkEditStudents;
