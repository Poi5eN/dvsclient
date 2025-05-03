// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload, MdEdit } from "react-icons/md";

// import { toast } from "react-toastify";
// import {
//   LastYearStudents,
//   AdminGetAllClasses,
//   examresult,
//   Allexamresult,
//   updateExam,
//   updateReportCard,
// } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import logo from "../../ShikshMitraWebsite/assets/school logo.jpg";

// const EditRportCard = () => {
//   const { setIsLoader, currentColor } = useStateContext();
//   const [getClass, setGetClass] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);
//   const [selectedSection, setSelectedSection] = useState("");
//   const [allStudents, setAllStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);
//   const [dataToReport, setDataToReport] = useState([]); // Array to hold all student reports
//   const [editingStudentIndex, setEditingStudentIndex] = useState(null); // Track the student being edited
//   const [editableData, setEditableData] = useState([]); // Array to hold editable reports
//   const componentPDF = useRef();

//   const user = JSON.parse(localStorage.getItem("user"));

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${
//       isAllStudentsSelected
//         ? "All_Students_Report_Cards"
//         : selectedStudent?.studentName || "Student"
//     }_Report_Card`,
//     onAfterPrint: () => toast.success("Downloaded successfully"),
//   });

//   const fetchFullReportCard = async (studentId = "") => {
//     setIsLoader(true);
//     try {
//       let response;
//       if (studentId === "all") {
//         response = await Allexamresult(selectedClass, selectedSection);
//         if (response?.success) {
//           setIsLoader(false);
//           toast.success(response?.success);
//           setDataToReport(response?.reportCards || []);
//           setEditableData(response?.reportCards ? JSON.parse(JSON.stringify(response.reportCards)) : []);
//         } else {
//           toast.error(response?.message);
//         }
//       } else {
//         response = await examresult(studentId);
//         if (response?.success) {
//           toast.success(response?.success);
//           setDataToReport([response?.reportCard] || []);
//           setEditableData(response?.reportCard ? JSON.parse(JSON.stringify([response.reportCard])) : []);
//         } else {
//           toast.error(response?.message);
//         }
//       }
//     } catch (error) {
//       console.error("Error fetching full report card:", error);
//       alert(
//         "Error fetching full report card: " +
//           (error.response?.data?.message || error.message)
//       );
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const allStudent = async () => {
//     setIsLoader(true);
//     try {
//       const response = await LastYearStudents();
//       if (response?.students?.data) {
//         const filterStudent = response?.students?.data?.filter(
//           (val) =>
//             val.class === selectedClass && val.section === selectedSection
//         );
//         setAllStudents(filterStudent || response.students.data);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   useEffect(() => {
//     allStudent();
//   }, [selectedClass, selectedSection]);

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass.find(
//       (cls) => cls.className === selectedClassName
//     );
//     setAvailableSections(selectedClassObj ? selectedClassObj.sections : []);
//   };

//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value);
//   };

//   const getAllClass = async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setIsLoader(false);
//         setGetClass(response.classes.sort((a, b) => a - b));
//       }
//     } catch (error) {
//       console.log("error");
//     }
//   };

//   useEffect(() => {
//     getAllClass();
//   }, []);

//   const dynamicOptions = getClass.map((cls) => ({
//     label: cls.className,
//     value: cls.className,
//   }));

//   const DynamicSection = availableSections.map((item) => ({
//     label: item,
//     value: item,
//   }));

//   const handleStudentChange = async (e) => {
//     const selectedValue = e.target.value;
//     setDataToReport([]); // Clear previous data
//     setEditingStudentIndex(null); // Reset editing state

//     if (selectedValue === "all") {
//       setSelectedStudent(null);
//       setIsAllStudentsSelected(true);
//       await fetchFullReportCard("all");
//     } else {
//       const selected = allStudents.find(
//         (student) => student?.studentId === selectedValue
//       );
//       setSelectedStudent(selected);
//       setIsAllStudentsSelected(false);
//       if (selected?.studentId) {
//         await fetchFullReportCard(selected.studentId);
//       }
//     }
//   };

//   const handleEditToggle = (index) => {
//     if (editingStudentIndex === null) {
//       try {
//         const editData = JSON.parse(JSON.stringify(dataToReport));
//         setEditableData(editData);
//         setEditingStudentIndex(index);
//       } catch (error) {
//         console.error("Error while deep copying dataToReport:", error);
//         toast.error("Error preparing data for editing.");
//         return; // Exit if deep copy fails
//       }
//     } else {
//         setEditingStudentIndex(null);
//     }
//   };

//   const handleMarksChange = (studentIndex, subjectIndex, termKey, assessmentName, value) => {
//     setEditableData((prevData) => {
//       const updatedData = [...prevData]; // Create a copy
//       if (!updatedData[studentIndex]) {
//           console.warn(`Student at index ${studentIndex} not found in editableData`);
//           return prevData;
//       }
//       const updatedStudent = { ...updatedData[studentIndex] };
//       const updatedSubjects = [...updatedStudent.subjects];

//       const updatedSubject = { ...updatedSubjects[subjectIndex] };

//       if (!updatedSubject[termKey]) {
//         updatedSubject[termKey] = {};
//       }

//       updatedSubject[termKey] = {
//         ...updatedSubject[termKey],
//         [assessmentName]: {
//           ...updatedSubject[termKey][assessmentName],
//           marksObtained: parseFloat(value) || 0,
//         },
//       };
//       updatedSubjects[subjectIndex] = updatedSubject;
//       updatedStudent.subjects = updatedSubjects;
//       updatedData[studentIndex] = updatedStudent;
//       return updatedData;
//     });
//   };

//   const handleUpdateMarks = async (studentIndex) => {
//       setIsLoader(true);
//       try {
//           const studentData = editableData[studentIndex];
//           const studentId = isAllStudentsSelected ? allStudents[studentIndex].studentId : selectedStudent.studentId;

//           const updatePayload = {
//               "reportCard": {
//                   subjects: studentData.subjects.map((subject) => {
//                       const subjectUpdate = {
//                           name: subject.name,
//                       };
//                       Object.keys(subject).forEach((term) => {
//                           if (
//                               term !== "name" &&
//                               term !== "overallPercentage" &&
//                               term !== "overallGrade"
//                           ) {
//                               subjectUpdate[term] = {};
//                               Object.keys(subject[term]).forEach((assessment) => {
//                                   if (
//                                       assessment !== "total" &&
//                                       assessment !== "grade" &&
//                                       assessment !== "percentage" &&
//                                       assessment !== "totalPossibleMarks"
//                                   ) {
//                                       subjectUpdate[term][assessment] = {
//                                           marksObtained:
//                                               subject[term][assessment]?.marksObtained || 0,
//                                           totalMarks: subject[term][assessment]?.totalMarks || 0,
//                                           passingMarks: subject[term][assessment]?.passingMarks || 0
//                                       };
//                                   }
//                               });
//                           }
//                       });
//                       return subjectUpdate;
//                   }),
//                   coScholastic: []
//               }
//           };

//           const response = await updateReportCard(updatePayload, studentId);

//           if (response?.success) {
//               toast.success(`Marks updated successfully for ${studentData.name}!`);
//               await fetchFullReportCard(isAllStudentsSelected ? 'all' : selectedStudent.studentId);
//               setEditingStudentIndex(null);
//           } else {
//               console.error("Update response:", response);
//               toast.error(`Failed to update marks for ${studentData.name}.`);
//           }
//       } catch (error) {
//           console.error("Error updating marks:", error);
//           toast.error("Error updating marks");
//       } finally {
//           setIsLoader(false);
//       }
//   };

//   const renderReportCard = (studentData, studentIndex) => {
//     if (!studentData || !studentData.subjects) {
//       return <p>No data available for this report card.</p>;
//     }
//     const termKeys = new Set();
//     studentData?.subjects?.forEach((subject) => {
//       Object.keys(subject).forEach((key) => {
//         if (
//           key !== "name" &&
//           key !== "overallPercentage" &&
//           key !== "overallGrade"
//         )
//           termKeys.add(key);
//       });
//     });
//     const terms = Array.from(termKeys);

//     const assessmentMap = new Map();
//     studentData?.subjects?.forEach((subject) => {
//       terms.forEach((term) => {
//         if (subject[term]) {
//           const assessments = new Set(
//             Object.keys(subject[term]).filter(
//               (key) =>
//                 key !== "total" &&
//                 key !== "grade" &&
//                 key !== "percentage" &&
//                 key !== "totalPossibleMarks"
//             )
//           );
//           assessmentMap.set(term, assessments);
//         }
//       });
//     });

//     const coScholasticAreas = new Set();
//     studentData?.coScholastic?.forEach((row) => {
//       Object.keys(row).forEach((key) => {
//         if (key !== "term" && key !== "remarks") coScholasticAreas.add(key);
//       });
//     });
//     const coScholasticHeaders = [
//       "Term",
//       ...Array.from(coScholasticAreas).map((area) =>
//         area
//           .split(/(?=[A-Z])/)
//           .map(
//             (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
//           )
//           .join(" ")
//       ),
//     ];

//     const renderSubjectRows = () => {
//       return (studentData?.subjects || []).map((subject, subjectIndex) => (
//         <tr key={subjectIndex} className="border border-black">
//           <td className="p-1 border border-black">{subject.name}</td>
//           {terms.map((term) => (
//             <React.Fragment key={term}>
//               {Array.from(assessmentMap.get(term) || []).map((header) => (
//                 <td key={header} className="p-1 border border-black">
//                   {editingStudentIndex === studentIndex ? (
//                     <input
//                       type="number"
//                       step="0.1"
//                       value={
//                         editableData[studentIndex]?.subjects[subjectIndex][term]?.[header]
//                           ?.marksObtained ?? ""
//                       }
//                       onChange={(e) =>
//                         handleMarksChange(
//                           studentIndex,
//                           subjectIndex,
//                           term,
//                           header,
//                           e.target.value
//                         )
//                       }
//                       className="w-full text-center border rounded"
//                     />
//                   ) : (
//                     subject[term]?.[header]?.marksObtained ?? "--"
//                   )}
//                 </td>
//               ))}
//               <td className="p-1 border border-black">
//                 {subject[term]?.total ?? "--"}
//               </td>
//               <td className="p-1 border border-black">
//                 {subject[term]?.grade ?? "--"}
//               </td>
//             </React.Fragment>
//           ))}
//           <td className="p-1 border border-black">
//             {subject.overallGrade ||
//               subject[terms[terms.length - 1]]?.grade ||
//               "--"}
//           </td>
//         </tr>
//       ));
//     };

//     return (
//       <div className="flex justify-center items-center p-2">
//         <div className="bg-white shadow-lg px-6 pt-6 border-2 border-black w-[210mm] h-[275mm] mx-auto ">
//           <div className="p-4 border-2 border-black">
//             <div className="flex gap-10">
//               <div className="text-center mb-4 h-24 w-24 object-contain">
//                 <img
//                   src={
//                     logo ||
//                     "https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg"
//                   }
//                   alt=""
//                 />
//               </div>
//               <div className="text-center mb-4">
//                 <h2 className="text-[40px] font-extrabold text-red-800 uppercase">
//                   Tagore Convent School
//                 </h2>
//                 <h3 className="text-lg font-semibold text-blue-900">
//                   RECOGNISED
//                 </h3>
//                 <p className="text-[14px] font-semibold  text-blue-900">
//                   [ ENGLISH MEDIUM ]
//                 </p>

//                 <p className="text-base font-semibold">{user?.address}</p>
//                 <h3 className="text-lg font-semibold">
//                   FINAL REPORT CARD [2024-25]
//                 </h3>
//               </div>
//             </div>

//             <div className="flex gap-10">
//               <table className="w-full border border-black mb-4  text-sm">
//                 <tbody>
//                   <tr className="border border-black">
//                     <td className="p-1 border border-black font-semibold">
//                       Student Name
//                     </td>
//                     <td className="p-1 border border-black font-semibold">
//                       {studentData?.name}
//                     </td>
//                   </tr>
//                   <tr className="border border-black">
//                     <td className="p-1 border border-black font-semibold">
//                       Class-Sec
//                     </td>
//                     <td className="p-1 border border-black font-semibold">
//                       {studentData?.class}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//               <table className="w-full border border-black mb-4 text-sm">
//                 <tbody>
//                   <tr className="border border-black">
//                     <td className="p-1 border border-black font-semibold">
//                       Gender
//                     </td>
//                     <td className="p-1 border border-black font-semibold">
//                       {studentData?.gender}
//                     </td>
//                   </tr>

//                   <tr className="border border-black">
//                     <td className="p-1 border border-black font-semibold">
//                       Father's Name
//                     </td>
//                     <td className="p-1 border border-black font-semibold">
//                       {studentData?.fatherName}
//                     </td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>

//            <div className="flex justify-end mb-2">
//                 {editingStudentIndex === studentIndex ? (
//                     <div className="flex gap-2">
//                         <button
//                             onClick={() => handleUpdateMarks(studentIndex)}
//                             className="bg-green-500 text-white px-4 py-2 rounded"
//                         >
//                             Save Changes
//                         </button>
//                         <button
//                             onClick={() => handleEditToggle(studentIndex)}
//                             className="bg-red-500 text-white px-4 py-2 rounded"
//                         >
//                             Cancel
//                         </button>
//                     </div>
//                 ) : (
//                     <button
//                         onClick={() => handleEditToggle(studentIndex)}
//                         className="bg-blue-500 text-white px-4 py-2 rounded flex items-center print_btn"
//                     >
//                         <MdEdit className="mr-2" /> Edit Marks
//                     </button>
//                 )}
//             </div>

//             <h1 className="uppercase p-2 font-bold bg-cyan-500 text-white w-full">
//               Scholastic Exam
//             </h1>
//             <table className="w-full border border-black text-center text-sm mb-4">
//               <thead>
//                 <tr>
//                   <th rowSpan="2" className="border border-black p-1">
//                     Subjects
//                   </th>
//                   {terms.map((term) => (
//                     <th
//                       key={term}
//                       colSpan={(assessmentMap.get(term)?.size || 0) + 2}
//                       className="border border-black p-1"
//                     >
//                       {term.toUpperCase().replace(/term/i, "TERM ")}
//                     </th>
//                   ))}
//                   <th rowSpan="2" className="border border-black p-1">
//                     Final Grade
//                   </th>
//                 </tr>
//                 <tr>
//                   {terms.map((term) => (
//                     <React.Fragment key={term}>
//                       {Array.from(assessmentMap.get(term) || []).map(
//                         (header) => (
//                           <th key={header} className="border border-black p-1">
//                             {header}
//                           </th>
//                         )
//                       )}
//                       <th className="border border-black p-1">Total</th>
//                       <th className="border border-black p-1">Grade</th>
//                     </React.Fragment>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>{renderSubjectRows()}</tbody>
//             </table>

//             <h1 className="uppercase p-2 font-bold bg-cyan-500 text-white w-full">
//               Co Scholastic Exam
//             </h1>
//             <table className="w-full border border-black text-center text-sm mb-4">
//               <thead>
//                 <tr>
//                   {coScholasticHeaders.map((heading, i) => (
//                     <th key={i} className="border border-black p-1">
//                       {heading}
//                     </th>
//                   ))}
//                 </tr>
//               </thead>
//               <tbody>
//                 {studentData?.coScholastic?.map((row, idx) => (
//                   <tr key={idx} className="border border-black">
//                     <td className="p-1 border border-black whitespace-nowrap">
//                       {row.term}
//                     </td>
//                     {Array.from(coScholasticAreas).map((area) => (
//                       <td
//                         key={area}
//                         className="p-1 border border-black whitespace-nowrap"
//                       >
//                         {row[area] ?? "--"}
//                       </td>
//                     ))}
//                   </tr>
//                 ))}
//               </tbody>
//             </table>

//             <p className="text-center font-bold text-sm mb-6">
//               Result: Promoted to Class{" "}
//             </p>

//             <div className="flex text-sm font-semibold mt-10">
//               <div className="text-center">
//                 <span>Class Teacher Remarks</span>
//                 <span> ____________________________________</span>
//               </div>
//             </div>
//             <div className="flex justify-around text-sm font-semibold mt-20">
//               <div className="text-center">
//                 <p>__________________</p>
//                 <p>Class Teacher</p>
//               </div>
//               <div className="text-center">
//                 <p>__________________</p>
//                 <p>Exam I/C</p>
//               </div>
//               <div className="text-center">
//                 <p>__________________</p>
//                 <p>Principal</p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto ">
//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload
//             onClick={generatePDF}
//             className="text-2xl cursor-pointer"
//           />
//         </div>
//         <div className="w-full flex flex-col sm:flex-row gap-2 p-4">
//           <ReactSelect
//             required={true}
//             name="studentClass"
//             value={selectedClass}
//             handleChange={handleClassChange}
//             label="Select a Class"
//             dynamicOptions={dynamicOptions}
//           />
//           <ReactSelect
//             name="studentSection"
//             value={selectedSection}
//             handleChange={handleSectionChange}
//             label="Select a Section"
//             dynamicOptions={DynamicSection}
//           />
//           <div className="mb-4 w-full sm:w-auto">
//             <select
//               className="p-2 border rounded w-full sm:w-auto"
//               onChange={handleStudentChange}
//               value={
//                 isAllStudentsSelected ? "all" : selectedStudent?.studentId || ""
//               }
//             >
//               <option value="">Select a student</option>
//               <option value="all">All Students</option>
//               {allStudents.map((student) => (
//                 <option key={student?.studentId} value={student?.studentId}>
//                   {student?.studentName} - Class {student?.class}{" "}
//                   {student?.section} (Roll No: {student?.rollNo})
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>

//         <div ref={componentPDF}>
//             {dataToReport && dataToReport.length > 0 ? (
//                 dataToReport.map((student, index) => (
//                     <div key={index} style={{ pageBreakAfter: "always" }}>
//                         {renderReportCard(student, index)}
//                     </div>
//                 ))
//             ) : (
//                 <p>No report card data available.</p>
//             )}
//         </div>
//       </div>
//     </>
//   );
// };

// export default EditRportCard;





import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../contexts/ContextProvider";
import { MdDownload, MdEdit } from "react-icons/md";

import { toast } from "react-toastify";
import {
  ActiveStudents,
  AdminGetAllClasses,
  examresult,
  Allexamresult,
  updateExam,
  updateReportCard,
} from "../../Network/AdminApi";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import logo from "../../ShikshMitraWebsite/assets/school logo.jpg";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import Button from "../../Dynamic/utils/Button";

const EditRportCard = () => {

  const session = JSON.parse(localStorage.getItem("session"));
  const { setIsLoader, currentColor } = useStateContext();
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);
  const [dataToReport, setDataToReport] = useState([]); // Array to hold all student reports
  const [editingStudentIndex, setEditingStudentIndex] = useState(null); // Track the student being edited
  const [editableData, setEditableData] = useState([]); // Array to hold editable reports
  const componentPDF = useRef();

  const user = JSON.parse(localStorage.getItem("user"));

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: `${
      isAllStudentsSelected
        ? "All_Students_Report_Cards"
        : selectedStudent?.studentName || "Student"
    }_Report_Card`,
    onAfterPrint: () => toast.success("Downloaded successfully"),
  });

  const fetchFullReportCard = async (studentId = "") => {
    setIsLoader(true);
    try {
      let response;
      if (studentId === "all") {
        response = await Allexamresult(selectedClass, selectedSection);
        if (response?.success) {
          setIsLoader(false);
          toast.success(response?.success);
          setDataToReport(response?.reportCards || []);
          setEditableData(
            response?.reportCards
              ? JSON.parse(JSON.stringify(response?.reportCards))
              : []
          );
        } else {
          toast.error(response?.message);
        }
      } else {
        response = await examresult(studentId);
        if (response?.success) {
          toast.success(response?.success);
          setDataToReport([response?.reportCard] || []);
          setEditableData(
            response?.reportCard
              ? JSON.parse(JSON.stringify([response.reportCard]))
              : []
          );
        } else {
          toast.error(response?.message);
        }
      }
    } catch (error) {
      console.error("Error fetching full report card:", error);
      alert(
        "Error fetching full report card: " +
          (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoader(false);
    }
  };

  const allStudent = async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents(session);
      if (response?.students?.data) {
        const filterStudent = response?.students?.data?.filter(
          (val) =>
            val.class === selectedClass && val.section === selectedSection
        );
        setAllStudents(filterStudent || response.students.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    allStudent();
  }, [selectedClass, selectedSection]);

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    const selectedClassObj = getClass.find(
      (cls) => cls.className === selectedClassName
    );
    setAvailableSections(selectedClassObj ? selectedClassObj.sections : []);
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const getAllClass = async () => {
    setIsLoader(true);
    try {
      const response = await AdminGetAllClasses();
      if (response?.success) {
        setIsLoader(false);
        setGetClass(response.classes.sort((a, b) => a - b));
      }
    } catch (error) {
      console.log("error");
    }
  };

  useEffect(() => {
    getAllClass();
  }, []);

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));

  const DynamicSection = availableSections.map((item) => ({
    label: item,
    value: item,
  }));

  const handleStudentChange = async (e) => {
    const selectedValue = e.target.value;
    setDataToReport([]); // Clear previous data
    setEditingStudentIndex(null); // Reset editing state

    if (selectedValue === "all") {
      setSelectedStudent(null);
      setIsAllStudentsSelected(true);
      await fetchFullReportCard("all");
    } else {
      const selected = allStudents.find(
        (student) => student?.studentId === selectedValue
      );
      setSelectedStudent(selected);
      setIsAllStudentsSelected(false);
      if (selected?.studentId) {
        await fetchFullReportCard(selected.studentId);
      }
    }
  };

  const handleEditToggle = (index) => {
    if (editingStudentIndex === null) {
      try {
        // Deep copy both subjects and coScholastic data
        const editData = JSON.parse(JSON.stringify(dataToReport));
        setEditableData(editData);
        setEditingStudentIndex(index);
      } catch (error) {
        console.error("Error while deep copying dataToReport:", error);
        toast.error("Error preparing data for editing.");
        return; // Exit if deep copy fails
      }
    } else {
      setEditingStudentIndex(null);
    }
  };

  const handleMarksChange = (studentIndex, section, itemName, value) => {
    setEditableData((prevData) => {
      const updatedData = [...prevData];

      // Check if studentIndex is valid
      if (studentIndex < 0 || studentIndex >= updatedData.length) {
        console.error(`Invalid studentIndex: ${studentIndex}`);
        return prevData;
      }

      const student = updatedData[studentIndex];

      if (section === "subjects") {
        const [subjectIndex, termKey, assessmentName] = itemName.split(".");

        // Ensure subjectIndex is within bounds
        if (subjectIndex < 0 || subjectIndex >= student.subjects.length) {
          console.error(`Invalid subjectIndex: ${subjectIndex}`);
          return prevData;
        }

        // Deeply clone subjects array
        const updatedSubjects = JSON.parse(JSON.stringify(student.subjects));
        const subject = updatedSubjects[subjectIndex];
        subject[termKey][assessmentName].marksObtained =
          parseFloat(value) || 0;

        // Replace old subject with new subject
        updatedSubjects[subjectIndex] = subject;
        student.subjects = updatedSubjects;
      } else if (section === "coScholastic") {
        // Deeply clone coScholastic array
        const updatedCoScholastic = JSON.parse(
          JSON.stringify(student.coScholastic)
        );
        const [rowIndex, area] = itemName.split(".");
        updatedCoScholastic[rowIndex][area] = value;
        student.coScholastic = updatedCoScholastic;
      }

      updatedData[studentIndex] = student;

      return updatedData;
    });
  };

  const handleUpdateMarks = async (studentIndex) => {
    setIsLoader(true);
    try {
      const studentData = editableData[studentIndex];
      const studentId = isAllStudentsSelected
        ? allStudents[studentIndex].studentId
        : selectedStudent.studentId;

      const updatePayload = {
        reportCard: {
          subjects: studentData.subjects.map((subject) => {
            const subjectUpdate = {
              name: subject.name,
            };
            Object.keys(subject).forEach((term) => {
              if (
                term !== "name" &&
                term !== "overallPercentage" &&
                term !== "overallGrade"
              ) {
                subjectUpdate[term] = {};
                Object.keys(subject[term]).forEach((assessment) => {
                  if (
                    assessment !== "total" &&
                    assessment !== "grade" &&
                    assessment !== "percentage" &&
                    assessment !== "totalPossibleMarks"
                  ) {
                    subjectUpdate[term][assessment] = {
                      marksObtained:
                        subject[term][assessment]?.marksObtained || 0,
                      totalMarks: subject[term][assessment]?.totalMarks || 0,
                      passingMarks: subject[term][assessment]?.passingMarks || 0,
                    };
                  }
                });
              }
            });
            return subjectUpdate;
          }),
          // coScholastic: []
          coScholastic:studentData.coScholastic.map((item) => {
            return {
              term: item.term,
              remarks: item.remarks,
              ...Object.fromEntries(
                Object.entries(item).filter(
                  ([key]) => key !== "term" && key !== "remarks"
                )
              ),
            };
          }),
        },
      };

      const response = await updateReportCard(updatePayload, studentId);

      if (response?.success) {
        toast.success(`Marks updated successfully for ${studentData.name}!`);
        await fetchFullReportCard(
          isAllStudentsSelected ? "all" : selectedStudent.studentId
        );
        setEditingStudentIndex(null);
      } else {
        console.error("Update response:", response);
        toast.error(`Failed to update marks for ${studentData.name}.`);
      }
    } catch (error) {
      console.error("Error updating marks:", error);
      toast.error("Error updating marks");
    } finally {
      setIsLoader(false);
    }
  };

  const renderReportCard = (studentData, studentIndex) => {
    if (!studentData || !studentData.subjects) {
      return <p>No data available for this report card.</p>;
    }
    const termKeys = new Set();
    studentData?.subjects?.forEach((subject) => {
      Object.keys(subject).forEach((key) => {
        if (
          key !== "name" &&
          key !== "overallPercentage" &&
          key !== "overallGrade"
        )
          termKeys.add(key);
      });
    });
    const terms = Array.from(termKeys);

    const assessmentMap = new Map();
    studentData?.subjects?.forEach((subject) => {
      terms.forEach((term) => {
        if (subject[term]) {
          const assessments = new Set(
            Object.keys(subject[term]).filter(
              (key) =>
                key !== "total" &&
                key !== "grade" &&
                key !== "percentage" &&
                key !== "totalPossibleMarks"
            )
          );
          assessmentMap.set(term, assessments);
        }
      });
    });

    const coScholasticAreas = new Set();
    studentData?.coScholastic?.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "term" && key !== "remarks") coScholasticAreas.add(key);
      });
    });
    const coScholasticHeaders = [
      "Term",
      ...Array.from(coScholasticAreas).map((area) =>
        area
          .split(/(?=[A-Z])/)
          .map(
            (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
          )
          .join(" ")
      ),
    ];

    const renderSubjectRows = () => {
      return (studentData?.subjects || []).map((subject, subjectIndex) => (
        <tr key={subjectIndex} className="border border-black">
          <td className="p-1 border border-black">{subject.name}</td>
          {terms.map((term) => (
            <React.Fragment key={term}>
              {Array.from(assessmentMap.get(term) || []).map((header) => (
                <td key={header} className="p-1 border border-black">
                  {editingStudentIndex === studentIndex ? (
                    <input
                      type="number"
                      step="0.1"
                      value={
                        editableData[studentIndex]?.subjects[subjectIndex][term]?.[
                          header
                        ]?.marksObtained ?? ""
                      }
                      onChange={(e) =>
                        handleMarksChange(
                          studentIndex,
                          "subjects",
                          `${subjectIndex}.${term}.${header}`,
                          e.target.value
                        )
                      }
                      className="w-full text-center border rounded"
                    />
                  ) : (
                    subject[term]?.[header]?.marksObtained ?? "--"
                  )}
                </td>
              ))}
              <td className="p-1 border border-black">
                {subject[term]?.total ?? "--"}
              </td>
              <td className="p-1 border border-black">
                {subject[term]?.grade ?? "--"}
              </td>
            </React.Fragment>
          ))}
          <td className="p-1 border border-black">
            {subject.overallGrade ||
              subject[terms[terms.length - 1]]?.grade ||
              "--"}
          </td>
        </tr>
      ));
    };

    const renderCoScholasticRows = () => {
      return studentData?.coScholastic?.map((row, rowIndex) => (
        <tr key={rowIndex} className="border border-black">
          <td className="p-1 border border-black whitespace-nowrap">
            {row.term}
          </td>
          {Array.from(coScholasticAreas).map((area) => (
            <td key={area} className="p-1 border border-black whitespace-nowrap">
              {editingStudentIndex === studentIndex ? (
                <input
                  type="text"
                  value={
                    editableData[studentIndex]?.coScholastic[rowIndex]?.[area] ??
                    ""
                  }
                  onChange={(e) =>
                    handleMarksChange(
                      studentIndex,
                      "coScholastic",
                      `${rowIndex}.${area}`,
                      e.target.value
                    )
                  }
                  className="w-full text-center border rounded"
                />
              ) : (
                row[area] ?? "--"
              )}
            </td>
          ))}
        </tr>
      ));
    };

    return (
      <div className="flex justify-center items-center p-2">
        <div className="bg-white shadow-lg px-6 pt-6 border-2 border-black w-[210mm] h-[275mm] mx-auto ">
          <div className="p-4 border-2 border-black">
            <div className="flex gap-10">
              <div className="text-center mb-4 h-24 w-24 object-contain">
                <img
                  src={
                    user?.logoImage?.url ||
                    "https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg"
                  }
                  alt=""
                />
              </div>
              <div className="text-center mb-4">
                <h2 className="text-[40px] font-extrabold text-red-800 uppercase">
                {user?.schoolName}
                </h2>
                <h3 className="text-lg font-semibold text-blue-900">
                  RECOGNISED
                </h3>
                <p className="text-[14px] font-semibold  text-blue-900">
                  [ ENGLISH MEDIUM ]
                </p>

                <p className="text-base font-semibold">{user?.address}</p>
                <h3 className="text-lg font-semibold">
                  FINAL REPORT CARD [{session}]
                </h3>
              </div>
            </div>

            <div className="flex gap-10">
              <table className="w-full border border-black mb-4  text-sm">
                <tbody>
                  <tr className="border border-black">
                    <td className="p-1 border border-black font-semibold">
                      Student Name
                    </td>
                    <td className="p-1 border border-black font-semibold">
                      {studentData?.name}
                    </td>
                  </tr>
                  <tr className="border border-black">
                    <td className="p-1 border border-black font-semibold">
                      Class-Sec
                    </td>
                    <td className="p-1 border border-black font-semibold">
                      {studentData?.class}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="w-full border border-black mb-4 text-sm">
                <tbody>
                  <tr className="border border-black">
                    <td className="p-1 border border-black font-semibold">
                      Gender
                    </td>
                    <td className="p-1 border border-black font-semibold">
                      {studentData?.gender}
                    </td>
                  </tr>

                  <tr className="border border-black">
                    <td className="p-1 border border-black font-semibold">
                      Father's Name
                    </td>
                    <td className="p-1 border border-black font-semibold">
                      {studentData?.fatherName}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mb-2">
              {editingStudentIndex === studentIndex ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleUpdateMarks(studentIndex)}
                    className="bg-green-500 text-white px-4 py-2 rounded"
                  >
                    Save Changes
                  </button>
                  <button
                    onClick={() => handleEditToggle(studentIndex)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => handleEditToggle(studentIndex)}
                  className="bg-blue-500 text-white px-4 py-2 rounded flex items-center print_btn"
                >
                  <MdEdit className="mr-2" /> Edit Marks
                </button>
              )}
            </div>

            <h1 className="uppercase p-2 font-bold bg-cyan-500 text-white w-full">
              Scholastic Exam
            </h1>
            <table className="w-full border border-black text-center text-sm mb-4">
              <thead>
                <tr>
                  <th rowSpan="2" className="border border-black p-1">
                    Subjects
                  </th>
                  {terms.map((term) => (
                    <th
                      key={term}
                      colSpan={(assessmentMap.get(term)?.size || 0) + 2}
                      className="border border-black p-1"
                    >
                      {term.toUpperCase().replace(/term/i, "TERM ")}
                    </th>
                  ))}
                  <th rowSpan="2" className="border border-black p-1">
                    Final Grade
                  </th>
                </tr>
                <tr>
                  {terms.map((term) => (
                    <React.Fragment key={term}>
                      {Array.from(assessmentMap.get(term) || []).map(
                        (header) => (
                          <th key={header} className="border border-black p-1">
                            {header}
                          </th>
                        )
                      )}
                      <th className="border border-black p-1">Total</th>
                      <th className="border border-black p-1">Grade</th>
                    </React.Fragment>
                  ))}
                </tr>
              </thead>
              <tbody>{renderSubjectRows()}</tbody>
            </table>

            <h1 className="uppercase p-2 font-bold bg-cyan-500 text-white w-full">
              Co Scholastic Exam
            </h1>
            <table className="w-full border border-black text-center text-sm mb-4">
              <thead>
                <tr>
                  {coScholasticHeaders.map((heading, i) => (
                    <th key={i} className="border border-black p-1">
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>{renderCoScholasticRows()}</tbody>
            </table>

            <p className="text-center font-bold text-sm mb-6">
              Result: Promoted to Class{" "}
            </p>

            <div className="flex text-sm font-semibold mt-10">
              <div className="text-center">
                <span>Class Teacher Remarks</span>
                <span> ____________________________________</span>
              </div>
            </div>
            <div className="flex justify-around text-sm font-semibold mt-20">
              <div className="text-center">
                <p>__________________</p>
                <p>Class Teacher</p>
              </div>
              <div className="text-center">
                <p>__________________</p>
                <p>Exam I/C</p>
              </div>
              <div className="text-center">
                <p>__________________</p>
                <p>Principal</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
    <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Report Card"/>
      <div className="bg-white p-2 rounded-lg shadow border border-gray-200 gap-2">
      
        <div className="w-full flex flex-col sm:flex-row gap-2 p-4">
          <ReactSelect
            required={true}
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
          <div className="mb-4 w-full sm:w-auto">
            <select
              className="p-2 border rounded w-full sm:w-auto"
              onChange={handleStudentChange}
              value={
                isAllStudentsSelected ? "all" : selectedStudent?.studentId || ""
              }
            >
              <option value="">Select a student</option>
              <option value="all">All Students</option>
              {allStudents.map((student) => (
                <option key={student?.studentId} value={student?.studentId}>
                  {student?.studentName} - Class {student?.class}{" "}
                  {student?.section} (Roll No: {student?.rollNo})
                </option>
              ))}
            </select>
          </div>
          <Button  onClick={generatePDF} name="Print" icon={<MdDownload />} color={"green"}/>
        </div>

        <div ref={componentPDF}>
          {dataToReport && dataToReport.length > 0 ? (
            dataToReport.map((student, index) => (
              <div key={index} style={{ pageBreakAfter: "always" }}>
                {renderReportCard(student, index)}
              </div>
            ))
          ) : (
            <p>No report card data available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default EditRportCard;
