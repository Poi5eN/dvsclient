import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { Button } from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";

import { getAllStudents } from "../../Network/TeacherApi";

const CoScholasticMarks = () => {
    const { currentColor, setIsLoader } = useStateContext();
    const authToken = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const [submittedData, setSubmittedData] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [examData, setExamData] = useState([]);
    const [newActivity, setNewActivity] = useState("");
    const [selectedStudents, setSelectedStudents] = useState([]); // Track selected students

    const param = {
        class: user?.classTeacher,
        section: user?.section
    };

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const response = await axios.get(
                    `https://dvsserver.onrender.com/api/v1/exam/exams?className=${param?.class}&section=${param?.section}`,
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
                setExamData(response?.data?.exams);
            } catch (error) {
                console.error("Error fetching exams:", error);
            }
        };
        fetchExams();
    }, [authToken, param?.class, param?.section]);

    useEffect(() => {
        const fetchStudents = async () => {
            setIsLoader(true);
            try {
                const response = await getAllStudents(param);
                if (response?.success) {
                    setSubmittedData(response?.students?.data);
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                setIsLoader(false);
            }
        };

        fetchStudents();
    }, [getAllStudents]);

    const handleExamChange = (event) => {
        const selectedExamId = event.target.value;
        const exam = examData.find((e) => e.examId === selectedExamId);
        setSelectedExam(exam);
    };

    // ✅ Function to Add New Activity to All Students
    const handleAddActivity = () => {
        if (!newActivity.trim()) {
            toast.error("Please enter an activity name.");
            return;
        }

        const newData = submittedData.map(student => ({
            ...student,
            coScholasticMarks: [
                ...(student.coScholasticMarks || []),
                { areaName: newActivity, grade: "A" }
            ]
        }));

        setSubmittedData(newData);
        setNewActivity("");
        toast.success(`"${newActivity}" added to all students!`);
    };

    // ✅ Function to Change Grades for Individual Students
    const handleGradeChange = (studentIndex, activityIndex, newGrade) => {
        const newData = [...submittedData];
        newData[studentIndex].coScholasticMarks[activityIndex].grade = newGrade;
        setSubmittedData(newData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!selectedExam) {
            toast.error("Please select an exam before submitting.");
            return;
        }

        // Filter out unselected students
        const filteredStudents = submittedData.filter((_, index) => selectedStudents.includes(index));

        // Construct the payload
        const formattedData = {
            examId: selectedExam.examId, // Placing examId at root level
            studentsMarks: filteredStudents.map(student => ({
                studentId: student.studentId,
                className: param.class,
                section: param.section,
                coScholasticMarks: student.coScholasticMarks || [] // Ensure this is always an array
            }))
        };

        if (formattedData.studentsMarks.length === 0) {
            toast.warn("No students found to submit co-scholastic marks.");
            return;
        }

        console.log("🚀 Sending Co-Scholastic Data to API:", JSON.stringify(formattedData, null, 2));

        try {
            const response = await axios.put(
                "https://dvsserver.onrender.com/api/v1/marks/marksbulkupload",
                formattedData,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response?.data?.success) {
                toast.success("Co-Scholastic Marks updated successfully!");
            }
        } catch (error) {
            console.error("❌ Error submitting co-scholastic marks:", error);
            toast.error("Error submitting co-scholastic marks: " + (error.response?.data?.message || error.message));
        }
    };

    // Checkbox Handlers
    const handleSelectAll = (event) => {
        if (event.target.checked) {
            setSelectedStudents(submittedData.map((_, index) => index)); // Select all indices
        } else {
            setSelectedStudents([]); // Clear selection
        }
    };

    const handleStudentSelect = (index) => {
        if (selectedStudents.includes(index)) {
            setSelectedStudents(selectedStudents.filter((i) => i !== index)); // Deselect
        } else {
            setSelectedStudents([...selectedStudents, index]); // Select
        }
    };

    return (
        <>
            <div className="mt-12 md:mt-0 p-4">
                <div
                    className="rounded-tl-lg border rounded-tr-lg text-white text-[12px] lg:text-lg py-2"
                    style={{
                        background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
                    }}
                >
                    <p className="px-5">Allot Co-Scholastic Marks</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {/* Exam Selection */}
                    <div className="flex flex-col">
                        <label htmlFor="examSelector">Select Exam:</label>
                        <select
                            id="examSelector"
                            className="outline-none border-2"
                            value={selectedExam?.examId || ""}
                            onChange={handleExamChange}
                            style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
                        >
                            <option value="">-- Select an Exam --</option>
                            {examData?.map((exam) => (
                                <option key={exam.examId} value={exam.examId}>
                                    {exam.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Input Field & Button to Add Activity */}
                <div className="flex gap-2 mt-5">
                    <input
                        type="text"
                        placeholder="Enter Activity Name"
                        value={newActivity}
                        onChange={(e) => setNewActivity(e.target.value)}
                        className="border px-2 py-1 outline-none"
                    />
                    <Button
                        onClick={handleAddActivity}
                        style={{ background: currentColor, color: "white" }}
                    >
                        Add Activity
                    </Button>
                </div>

                {/* Students Table */}
                {selectedExam && (
                    <div className="overflow-x-auto mt-5">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            onChange={handleSelectAll}
                                            checked={selectedStudents.length === submittedData.length}
                                        />
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Roll No
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                        Co-Scholastic Marks
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {submittedData?.map((val, ind) => (
                                    <tr key={ind}>
                                        <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                                            <input
                                                type="checkbox"
                                                checked={selectedStudents.includes(ind)}
                                                onChange={() => handleStudentSelect(ind)}
                                            />
                                        </td>
                                        <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                                            {val.rollNo}
                                        </td>
                                        <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                                            {val.studentName}
                                        </td>
                                        <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
                                            {val.coScholasticMarks?.map((activity, activityIndex) => (
                                                <div key={activityIndex} className="flex gap-2">
                                                    <span>{activity.areaName}</span>
                                                    <input
                                                        type="text"
                                                        value={activity.grade}
                                                        onChange={(e) =>
                                                            handleGradeChange(ind, activityIndex, e.target.value)
                                                        }
                                                        className="border px-2 outline-none w-16" // Adjust width as needed
                                                    />
                                                </div>
                                            ))}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <Button onClick={handleSubmit} style={{ background: currentColor, color: "white" }}>
                            Submit Co-Scholastic Marks
                        </Button>
                    </div>
                )}
            </div>
           
        </>
    );
};

export default CoScholasticMarks;


// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Button } from "@mui/material";
// import axios from "axios";
// import { toast } from "react-toastify";

// import { getAllStudents } from "../../Network/TeacherApi";

// const CoScholasticMarks = () => {
//     const { currentColor, setIsLoader } = useStateContext();
//     const authToken = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));

//     const [submittedData, setSubmittedData] = useState([]);
//     const [selectedExam, setSelectedExam] = useState(null);
//     const [examData, setExamData] = useState([]);
//     const [newActivity, setNewActivity] = useState("");

//     const param = {
//         class: user?.classTeacher,
//         section: user?.section
//     };

//     useEffect(() => {
//         const fetchExams = async () => {
//             try {
//                 const response = await axios.get(
//                     `https://dvsserver.onrender.com/api/v1/exam/exams?classNames=${param?.class}&section=${param?.section}`,
//                     {
//                         withCredentials: true,
//                         headers: {
//                             Authorization: `Bearer ${authToken}`,
//                         },
//                     }
//                 );
//                 setExamData(response?.data?.exams);
//             } catch (error) {
//                 console.error("Error fetching exams:", error);
//             }
//         };
//         fetchExams();
//     }, []);

//     useEffect(() => {
//         const fetchStudents = async () => {
//             setIsLoader(true);
//             try {
//                 const response = await getAllStudents(param);
//                 if (response?.success) {
//                     setSubmittedData(response?.students?.data);
//                 } else {
//                     toast.error(response?.message);
//                 }
//             } catch (error) {
//                 console.error("Error fetching students:", error);
//             } finally {
//                 setIsLoader(false);
//             }
//         };

//         fetchStudents();
//     }, []);

//     const handleExamChange = (event) => {
//         const selectedExamId = event.target.value;
//         const exam = examData.find((e) => e.examId === selectedExamId);
//         setSelectedExam(exam);
//     };

//     // ✅ Function to Add New Activity to All Students
//     const handleAddActivity = () => {
//         if (!newActivity.trim()) {
//             toast.error("Please enter an activity name.");
//             return;
//         }

//         const newData = submittedData.map(student => ({
//             ...student,
//             coScholasticMarks: [
//                 ...(student.coScholasticMarks || []),
//                 { areaName: newActivity, grade: "A" }
//             ]
//         }));

//         setSubmittedData(newData);
//         setNewActivity("");
//         toast.success(`"${newActivity}" added to all students!`);
//     };

//     // ✅ Function to Change Grades for Individual Students
//     const handleGradeChange = (studentIndex, activityIndex, newGrade) => {
//         const newData = [...submittedData];
//         newData[studentIndex].coScholasticMarks[activityIndex].grade = newGrade;
//         setSubmittedData(newData);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
    
//         if (!selectedExam) {
//             toast.error("Please select an exam before submitting.");
//             return;
//         }
    
//         // Construct the payload
//         const formattedData = {
//             examId: selectedExam.examId, // Placing examId at root level
//             studentsMarks: submittedData.map(student => ({
//                 studentId: student.studentId,
//                 className: param.class,
//                 section: param.section,
//                 coScholasticMarks: student.coScholasticMarks || [] // Ensure this is always an array
//             }))
//         };
    
//         if (formattedData.studentsMarks.length === 0) {
//             toast.warn("No students found to submit co-scholastic marks.");
//             return;
//         }
    
//         console.log("🚀 Sending Co-Scholastic Data to API:", JSON.stringify(formattedData, null, 2));
    
//         try {
//             const response = await axios.put(
//                 "https://dvsserver.onrender.com/api/v1/marks/marksbulkupload",
//                 formattedData,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );
    
//             if (response?.data?.success) {
//                 toast.success("Co-Scholastic Marks updated successfully!");
//             }
//         } catch (error) {
//             console.error("❌ Error submitting co-scholastic marks:", error);
//             toast.error("Error submitting co-scholastic marks: " + (error.response?.data?.message || error.message));
//         }
//     };
    
//     return (
//         <>
//             <div className="mt-12 md:mt-0 p-4">
//                 <div
//                     className="rounded-tl-lg border rounded-tr-lg text-white text-[12px] lg:text-lg py-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="px-5">Allot Co-Scholastic Marks</p>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//                     {/* Exam Selection */}
//                     <div className="flex flex-col">
//                         <label htmlFor="examSelector">Select Exam:</label>
//                         <select
//                             id="examSelector"
//                             className="outline-none border-2"
//                             value={selectedExam?.examId || ""}
//                             onChange={handleExamChange}
//                             style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
//                         >
//                             <option value="">-- Select an Exam --</option>
//                             {examData?.map((exam) => (
//                                 <option key={exam.examId} value={exam.examId}>
//                                     {exam.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                 </div>

//                 {/* Input Field & Button to Add Activity */}
//                 <div className="flex gap-2 mt-5">
//                     <input
//                         type="text"
//                         placeholder="Enter Activity Name"
//                         value={newActivity}
//                         onChange={(e) => setNewActivity(e.target.value)}
//                         className="border px-2 py-1 outline-none"
//                     />
//                     <Button
//                         onClick={handleAddActivity}
//                         style={{ background: currentColor, color: "white" }}
//                     >
//                         Add Activity
//                     </Button>
//                 </div>

//                 {/* Students Table */}
//                 {selectedExam && (
//                     <div className="overflow-x-auto mt-5">
//                         <table className="min-w-full leading-normal">
//                             <thead>
//                                 <tr>
//                                     <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         ID
//                                     </th>
//                                     <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Name
//                                     </th>
//                                     <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                         Co-Scholastic Marks
//                                     </th>
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {submittedData?.map((val, ind) => (
//                                     <tr key={ind}>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             {val.admissionNumber}
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             {val.studentName}
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             {val.coScholasticMarks?.map((activity, activityIndex) => (
//                                                 <div key={activityIndex} className="flex gap-2">
//                                                     <span>{activity.areaName}</span>
//                                                     <select
//                                                         value={activity.grade}
//                                                         onChange={(e) =>
//                                                             handleGradeChange(ind, activityIndex, e.target.value)
//                                                         }
//                                                         className="border px-2 outline-none"
//                                                     >
//                                                         <option value="A">A</option>
//                                                         <option value="B">B</option>
//                                                         <option value="C">C</option>
//                                                         <option value="D">D</option>
//                                                         <option value="D">E</option>
//                                                         <option value="D">F</option>
//                                                     </select>
//                                                 </div>
//                                             ))}
//                                         </td>
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>

//                         <Button onClick={handleSubmit} style={{ background: currentColor, color: "white" }}>
//                             Submit Co-Scholastic Marks
//                         </Button>
//                     </div>
//                 )}
//             </div>
           
//         </>
//     );
// };

// export default CoScholasticMarks;




// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Button, IconButton } from "@mui/material";
// import axios from "axios";
// import { toast } from "react-toastify";
// import StudentMarks from "./StudentMarks";
// import { getAllStudents } from "../../Network/TeacherApi";

// const CoScholasticMarks = () => {
//     const { currentColor, setIsLoader } = useStateContext();
//     const authToken = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));

//     const [submittedData, setSubmittedData] = useState([]);
//     const [selectedExam, setSelectedExam] = useState(null);
//     const [selectedSubject, setSelectedSubject] = useState(null);
//     const [selectedAssessment, setSelectedAssessment] = useState(null);
//     const [subjects, setSubjects] = useState([]);
//     const [assessments, setAssessments] = useState([]);
//     const [selectAll, setSelectAll] = useState(false);
//     const [examData, setExamData] = useState([]);
//     const CO_SCHOLASTIC_OPTION = "Co-Scholastic";
//     const [globalActivityName, setGlobalActivityName] = useState("");
//     const [studentMarks, setStudentMarks] = useState({});

//     const param = {
//         class: user?.classTeacher,
//         section: user?.section
//     };

//     useEffect(() => {
//         const fetchExams = async () => {
//             try {
//                 const response = await axios.get(
//                     `https://dvsserver.onrender.com/api/v1/exam/exams?classNames=${param?.class}&section=${param?.section}`,
//                     {
//                         withCredentials: true,
//                         headers: {
//                             Authorization: `Bearer ${authToken}`,
//                         },
//                     }
//                 );
//                 setExamData(response?.data?.exams);
//             } catch (error) {
//                 console.error("Error fetching exams:", error);
//             }
//         };
//         fetchExams();
//     }, []);

//     useEffect(() => {
//         const fetchStudents = async () => {
//             setIsLoader(true);
//             try {
//                 const response = await getAllStudents(param);
//                 if (response?.success) {
//                     setSubmittedData(response?.students?.data);
//                 } else {
//                     toast.error(response?.message);
//                 }
//             } catch (error) {
//                 console.error("Error fetching students:", error);
//             } finally {
//                 setIsLoader(false);
//             }
//         };

//         fetchStudents();
//     }, []);


//     const handleExamChange = (event) => {
//         const selectedExamId = event.target.value;
//         const exam = examData.find((e) => e.examId === selectedExamId);
//         setSelectedExam(exam);
//         setSelectedSubject(null);
//         setSelectedAssessment(null);
//         setSubjects(exam?.subjects || []);
//         setStudentMarks({});
//     };

//     const handleSubjectChange = (event) => {
//         const subjectName = event.target.value;
//         const subject = selectedExam.subjects.find((s) => s.name === subjectName);
//         setSelectedSubject(subject);
//         setSelectedAssessment(null);
//         setAssessments(subject?.assessments || []);
//         setStudentMarks({});

//     };
//     const handleAssessmentsChange = (event) => {
//         const assessmentName = event.target.value;
//         const assessment = selectedSubject.assessments.find((a) => a.name === assessmentName);
//         setSelectedAssessment(assessment)
//     }
//     const handleInputChange = (studentId, value) => {

//         setStudentMarks(prev => ({
//             ...prev,
//             [studentId]: value
//         }));
//     };

//     const handleSelectAll = () => {
//         const newSelectAll = !selectAll;
//         const newData = submittedData.map((data) => ({
//             ...data,
//             selected: newSelectAll,
//         }));
//         setSubmittedData(newData);
//         setSelectAll(newSelectAll);
//     };

//     const handleCheckboxChange = (index, isChecked) => {
//         const newData = [...submittedData];
//         newData[index].selected = isChecked;
//         setSubmittedData(newData);

//         const allSelected = newData.every((data) => data.selected);
//         setSelectAll(allSelected);
//     };

//     const handleGlobalActivityChange = (event) => {
//         setGlobalActivityName(event.target.value);
//     };

//     const handleAddCoScholastic = () => {
//         if (globalActivityName.trim() === "") {
//             toast.error("Please enter activity name");
//             return;
//         }
//         const newData = submittedData.map((student) => ({
//             ...student,
//             coScholasticMarks: [
//                 ...student.coScholasticMarks,
//                 { activityName: globalActivityName, grade: "A" },
//             ],
//         }));
//         setSubmittedData(newData);
//         setGlobalActivityName("");
//     };

//     const handleCoScholasticChange = (studentIndex, activityIndex, field, value) => {
//         const newData = [...submittedData];
//         newData[studentIndex].coScholasticMarks[activityIndex][field] = value;
//         setSubmittedData(newData);
//     };

//     const handleRemoveCoScholastic = (studentIndex, activityIndex) => {
//         const newData = [...submittedData];
//         newData[studentIndex].coScholasticMarks.splice(activityIndex, 1);
//         setSubmittedData(newData);
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const studentsMarks = [];

//         for (const student of submittedData) {
//             if (!student.selected) continue;

//             const studentId = student.studentId;

//             const assessmentData = {
//                 assessmentName: selectedAssessment.name,
//                 marksObtained: studentMarks[studentId],
//             };

//             studentsMarks.push({
//                 studentId: student.studentId,
//                 className: param.class,
//                 section: param.section,
//                 marks: [
//                     {
//                         subjectName: selectedSubject.name,
//                         assessments: [assessmentData],
//                     },
//                 ],
//             });
//         }

//         if (studentsMarks.length === 0) {
//             toast.warn("No students selected, or no marks entered.");
//             return;
//         }

//         const postData = {
//             examId: selectedExam.examId,
//             studentsMarks: studentsMarks,
//         };

//         try {
//             const response = await axios.post(
//                 "https://dvsserver.onrender.com/api/v1/marks/marksbulkupload",
//                 postData,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );

//             if (response?.data) {
//                 toast.success("Marks submitted successfully!");
//                 setStudentMarks({});
//             }
//         } catch (error) {
//             console.error("Error submitting marks:", error);
//             toast.error("Error submitting marks.");
//         }
//     };

//     const THEAD = [
//         <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />,
//         "ID",
//         "Name",
//         selectedSubject && selectedSubject.name !== CO_SCHOLASTIC_OPTION ? `Marks for ${selectedSubject.name}` : null,
//         selectedSubject && selectedSubject.name === CO_SCHOLASTIC_OPTION ? "Co-Scholastic Marks" : null,
//     ].filter(Boolean);

//     return (
//         <>
//             <div className="mt-12 md:mt-0 p-4">
//                 <div
//                     className="rounded-tl-lg border rounded-tr-lg text-white text-[12px] lg:text-lg py-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="px-5">Allot Marks</p>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
//                     {/* Exam Selection */}
//                     <div className="flex flex-col">
//                         <label htmlFor="examSelector">Select Exam:</label>
//                         <select
//                             id="examSelector"
//                             className="outline-none border-2"
//                             value={selectedExam?.examId || ""}
//                             onChange={handleExamChange}
//                             style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
//                         >
//                             <option value="">-- Select an Exam --</option>
//                             {examData?.map((exam) => (
//                                 <option key={exam.examId} value={exam.examId}>
//                                     {exam.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {/* Subject Selection */}
//                     {selectedExam && (
//                         <div className="flex flex-col">
//                             <label htmlFor="subjectSelector">Select Subject:</label>
//                             <select
//                                 id="subjectSelector"
//                                 className="outline-none border-2"
//                                 value={selectedSubject?.name || ""}
//                                 onChange={handleSubjectChange}
//                                 style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
//                             >
//                                 <option value="">-- Select a Subject --</option>
//                                 {/*<option key={CO_SCHOLASTIC_OPTION} value={CO_SCHOLASTIC_OPTION}>*/}
//                                 {/*    {CO_SCHOLASTIC_OPTION}*/}
//                                 {/*</option>*/}
//                                 {subjects?.map((subject) => (
//                                     <option key={subject.name} value={subject.name}>
//                                         {subject.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     )}

//                     {/* Assessment Selection */}
//                     {selectedSubject && (
//                         <div className="flex flex-col">
//                             <label htmlFor="assessmentSelector">Select Assessment:</label>
//                             <select
//                                 id="assessmentSelector"
//                                 className="outline-none border-2"
//                                 value={selectedAssessment?.name || ""}
//                                 onChange={handleAssessmentsChange}
//                                 style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
//                             >
//                                 <option value="">-- Select an Assessment --</option>
//                                 {assessments?.map((assessment) => (
//                                     <option key={assessment.name} value={assessment.name}>
//                                         {assessment.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     )}
//                 </div>

//                 {selectedSubject && selectedSubject.name === CO_SCHOLASTIC_OPTION && (
//                     <div className="p-2">
//                         <label htmlFor="globalActivity">Activity Name:</label>
//                         <input
//                             type="text"
//                             id="globalActivity"
//                             placeholder="Enter Activity Name"
//                             value={globalActivityName}
//                             onChange={handleGlobalActivityChange}
//                             className="border px-2 py-1  outline-none w-[180px]"
//                         />
//                         <Button
//                             onClick={handleAddCoScholastic}
//                             style={{ background: currentColor, color: "white", marginLeft: "5px" }}
//                         >
//                             Add Activity
//                         </Button>
//                     </div>
//                 )}

//                 {selectedAssessment && (
//                     <div className="overflow-x-auto">
//                         <table className="min-w-full leading-normal">
//                             <thead>
//                                 <tr>
//                                     {THEAD?.map((header, index) => (
//                                         <th
//                                             key={index}
//                                             className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
//                                         >
//                                             {header}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {submittedData?.map((val, ind) => (
//                                     <tr key={ind}>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={val.selected}
//                                                 onChange={(e) => handleCheckboxChange(ind, e.target.checked)}
//                                             />
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             {val.admissionNumber}
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             {val.studentName}
//                                         </td>
//                                         {selectedSubject && selectedSubject.name !== CO_SCHOLASTIC_OPTION && (
//                                             <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                                 <input
//                                                     className="border-2 outline-none w-[60px] px-2"
//                                                     type="number"
//                                                     value={studentMarks[val.studentId] || ""}
//                                                     onChange={(e) => handleInputChange(val.studentId, e.target.value)}
//                                                 />
//                                             </td>
//                                         )}
//                                         {selectedSubject && selectedSubject.name === CO_SCHOLASTIC_OPTION && (
//                                             <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                                 <div>
//                                                     {val?.coScholasticMarks?.map((activity, activityIndex) => (
//                                                         <div className="flex gap-2" key={activityIndex}>
//                                                             <span>{activity.activityName}</span>
//                                                             <select
//                                                                 value={activity.grade}
//                                                                 onChange={(e) =>
//                                                                     handleCoScholasticChange(
//                                                                         ind,
//                                                                         activityIndex,
//                                                                         "grade",
//                                                                         e.target.value
//                                                                     )
//                                                                 }
//                                                                 className="border px-2   outline-none "
//                                                             >
//                                                                 <option value="A">A</option>
//                                                                 <option value="B">B</option>
//                                                                 <option value="C">C</option>
//                                                                 <option value="D">D</option>
//                                                             </select>
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </td>
//                                         )}
//                                     </tr>
//                                 ))}
//                             </tbody>
//                         </table>

//                         <Button
//                             className="w-full"
//                             onClick={handleSubmit}
//                             style={{
//                                 marginTop: "10px",
//                                 background: currentColor,
//                                 color: "white",
//                             }}
//                         >
//                             Submit
//                         </Button>
//                     </div>
//                 )}
//             </div>
//             <StudentMarks />
//         </>
//     );
// };

// export default CoScholasticMarks;

