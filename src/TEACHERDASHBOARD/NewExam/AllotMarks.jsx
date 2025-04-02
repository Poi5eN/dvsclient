import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import {
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Checkbox
} from "@mui/material";
import axios from "axios";
import { toast } from "react-toastify";
import { getAllStudents } from "../../Network/TeacherApi";

const AllotMarks = () => {
    const { currentColor, setIsLoader } = useStateContext();
    const authToken = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user"));

    const [submittedData, setSubmittedData] = useState([]);
    const [selectedExam, setSelectedExam] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedAssessments, setSelectedAssessments] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [selectAll, setSelectAll] = useState(false);
    const [examData, setExamData] = useState([]);
    const [studentMarks, setStudentMarks] = useState({});

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
    }, []);

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
    }, []);


    const handleExamChange = (event) => {
        const selectedExamId = event.target.value;
        const exam = examData.find((e) => e.examId === selectedExamId);
        setSelectedExam(exam);
        setSelectedSubject(null);
        setSelectedAssessments([]);
        setSubjects(exam?.subjects || []);
        setStudentMarks({});
    };

    const handleSubjectChange = (event) => {
        const subjectName = event.target.value;
        const subject = selectedExam.subjects.find((s) => s.name === subjectName);
        setSelectedSubject(subject);
        setSelectedAssessments([]);
        setAssessments(subject?.assessments || []);
        setStudentMarks({});
    };

    const handleAssessmentsChange = (event) => {
        setSelectedAssessments(event.target.value);
    };

    const handleInputChange = (studentId, assessmentName, value) => {
        setStudentMarks(prev => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [assessmentName]: value
            }
        }));
    };

    const handleSelectAll = (event) => {
        setSelectAll(event.target.checked);
        const updatedData = submittedData.map(student => ({
            ...student,
            selected: event.target.checked
        }));
        setSubmittedData(updatedData);
    };

    const handleCheckboxChange = (index) => {
        const updatedData = [...submittedData];
        updatedData[index].selected = !updatedData[index].selected;
        setSubmittedData(updatedData);
        setSelectAll(updatedData.every(student => student.selected));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoader(true);

        const studentsMarks = [];

        for (const student of submittedData) {
            if (!student.selected) continue;

            const studentId = student.studentId;
            const assessmentsData = [];

            selectedAssessments.forEach(assessmentName => {
                const marksObtained = studentMarks[studentId]?.[assessmentName] || "";
                assessmentsData.push({
                    assessmentName: assessmentName,
                    marksObtained: marksObtained,
                });
            });

            studentsMarks.push({
                studentId: student.studentId,
                className: param.class,
                section: param.section,
                marks: [
                    {
                        subjectName: selectedSubject.name,
                        assessments: assessmentsData,
                    },
                ],
            });
        }

        if (studentsMarks.length === 0) {
            toast.warn("No students selected, or no marks entered.");
            setIsLoader(false);
            return;
        }

        const postData = {
            examId: selectedExam.examId,
            studentsMarks: studentsMarks,
        };

        try {
            const response = await axios.post(
                "https://dvsserver.onrender.com/api/v1/marks/marksbulkupload",
                postData,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response?.data) {
                toast.success("Marks submitted successfully!");
                setStudentMarks({});
            }
        } catch (error) {
            console.error("Error submitting marks:", error);
            toast.error("Error submitting marks.");
        } finally {
            setIsLoader(false);
        }
    };

    const renderTableHeaders = () => {
        return (
            <tr>
                <th style={{ width: '40px', padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                    <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                        size="small"
                    />
                </th>
                <th style={{ width: '80px', padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>ID</th>
                <th style={{ width: '150px', padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>NAME</th>
                <th style={{ width: '150px', padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>MARKS FOR {selectedSubject?.name?.toUpperCase()}</th>
                {selectedAssessments.map(assessmentName => (
                    <th
                        key={assessmentName}
                        style={{ width: '100px', padding: '8px', borderBottom: '2px solid #ddd', textAlign: 'left' }}
                    >
                        {assessmentName.toUpperCase()}
                    </th>
                ))}
            </tr>
        );
    };

    const renderTableRows = () => {
        return submittedData.map((student, index) => (
            <tr key={student.studentId} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                    <Checkbox
                        checked={student.selected || false}
                        onChange={() => handleCheckboxChange(index)}
                        size="small"
                    />
                </td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{student.admissionNumber}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>{student.studentName}</td>
                <td style={{ padding: '8px', borderBottom: '1px solid #ddd' }}></td>  {/* Empty cell under "MARKS FOR ENGLISH" */}
                {selectedAssessments.map(assessmentName => (
                    <td key={`${student.studentId}-${assessmentName}`} style={{ padding: '8px', borderBottom: '1px solid #ddd' }}>
                        <TextField
                            size="small"
                            type="number"
                            style={{ width: '80px' }}
                            value={studentMarks[student.studentId]?.[assessmentName] || ""}
                            onChange={(e) => handleInputChange(student.studentId, assessmentName, e.target.value)}
                        />
                    </td>
                ))}
            </tr>
        ));
    };

    return (
        <>
            <div className="mt-12 md:mt-0 p-4">
                {/* ... (Header and Selection Controls) ... */}
                <div
                    className="rounded-tl-lg border rounded-tr-lg text-white text-[12px] lg:text-lg py-2"
                    style={{
                        background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
                    }}
                >
                    <p className="px-5">Allot Marks</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
                    <FormControl fullWidth size="small">
                        <InputLabel id="exam-select-label">Select Exam</InputLabel>
                        <Select
                            labelId="exam-select-label"
                            id="examSelector"
                            value={selectedExam?.examId || ""}
                            label="Select Exam"
                            onChange={handleExamChange}
                        >
                            <MenuItem value="">-- Select an Exam --</MenuItem>
                            {examData?.map((exam) => (
                                <MenuItem key={exam.examId} value={exam.examId}>
                                    {exam.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel id="subject-select-label">Select Subject</InputLabel>
                        <Select
                            labelId="subject-select-label"
                            id="subjectSelector"
                            value={selectedSubject?.name || ""}
                            label="Select Subject"
                            onChange={handleSubjectChange}
                        >
                            <MenuItem value="">-- Select a Subject --</MenuItem>
                            {subjects?.map((subject) => (
                                <MenuItem key={subject.name} value={subject.name}>
                                    {subject.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel id="assessment-multiple-label">Select Assessments</InputLabel>
                        <Select
                            labelId="assessment-multiple-label"
                            id="assessmentSelector"
                            multiple
                            value={selectedAssessments}
                            label="Select Assessments"
                            onChange={handleAssessmentsChange}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {assessments?.map((assessment) => (
                                <MenuItem key={assessment.name} value={assessment.name}>
                                    <Checkbox checked={selectedAssessments.indexOf(assessment.name) > -1} size="small" />
                                    <span style={{ marginLeft: 8 }}>{assessment.name}</span>
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            {renderTableHeaders()}
                        </thead>
                        <tbody>
                            {renderTableRows()}
                        </tbody>
                    </table>
                </div>

                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSubmit}
                    style={{ marginTop: '20px', backgroundColor: currentColor }}
                >
                    Submit
                </Button>
            </div>
        </>
    );
};

export default AllotMarks;



// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Button, TextField, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText } from "@mui/material";
// import axios from "axios";
// import { toast } from "react-toastify";
// import { getAllStudents } from "../../Network/TeacherApi";

// const AllotMarks = () => {
//     const { currentColor, setIsLoader } = useStateContext();
//     const authToken = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));

//     const [submittedData, setSubmittedData] = useState([]);
//     const [selectedExam, setSelectedExam] = useState(null);
//     const [selectedSubject, setSelectedSubject] = useState(null);
//     const [selectedAssessments, setSelectedAssessments] = useState([]); // Changed to array
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
//                     `https://dvsserver.onrender.com/api/v1/exam/exams?className=${param?.class}&sectiion=${param?.section}`,
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
//         setSelectedAssessments([]); // Reset assessments
//         setSubjects(exam?.subjects || []);
//         setStudentMarks({});
//     };

//     const handleSubjectChange = (event) => {
//         const subjectName = event.target.value;
//         const subject = selectedExam.subjects.find((s) => s.name === subjectName);
//         setSelectedSubject(subject);
//         setSelectedAssessments([]);  // Reset assessments
//         setAssessments(subject?.assessments || []);
//         setStudentMarks({});

//     };

//     const handleAssessmentsChange = (event) => {
//         setSelectedAssessments(event.target.value);
//     };

//     const handleInputChange = (studentId, assessmentName, value) => {
//         setStudentMarks(prev => ({
//             ...prev,
//             [studentId]: {
//                 ...prev[studentId],  // Keep any existing marks for this student
//                 [assessmentName]: value // Set or update the mark for this assessment
//             }
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
//         setIsLoader(true)
//         e.preventDefault();

//         const studentsMarks = [];

//         for (const student of submittedData) {
//             if (!student.selected) continue;

//             const studentId = student.studentId;
//             const assessmentsData = [];

//             selectedAssessments.forEach(assessmentName => {
//                 const marksObtained = studentMarks[studentId]?.[assessmentName] || "";  // Get marks for this assessment, if any
//                 assessmentsData.push({
//                     assessmentName: assessmentName,
//                     marksObtained: marksObtained,
//                 });
//             });


//             studentsMarks.push({
//                 studentId: student.studentId,
//                 className: param.class,
//                 section: param.section,
//                 marks: [
//                     {
//                         subjectName: selectedSubject.name,
//                         assessments: assessmentsData,
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
//                 setIsLoader(false)
//             }
//         } catch (error) {
//             console.error("Error submitting marks:", error);
//             toast.error("Error submitting marks.");
//             setIsLoader(false)
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
//                         <FormControl fullWidth>
//                             <InputLabel id="exam-select-label">Select Exam</InputLabel>
//                             <Select
//                                 labelId="exam-select-label"
//                                 id="examSelector"
//                                 value={selectedExam?.examId || ""}
//                                 label="Select Exam"
//                                 onChange={handleExamChange}
//                             >
//                                 <MenuItem value="">-- Select an Exam --</MenuItem>
//                                 {examData?.map((exam) => (
//                                     <MenuItem key={exam.examId} value={exam.examId}>
//                                         {exam.name}
//                                     </MenuItem>
//                                 ))}
//                             </Select>
//                         </FormControl>
//                     </div>

//                     {/* Subject Selection */}
//                     {selectedExam && (
//                         <div className="flex flex-col">
//                             <FormControl fullWidth>
//                                 <InputLabel id="subject-select-label">Select Subject</InputLabel>
//                                 <Select
//                                     labelId="subject-select-label"
//                                     id="subjectSelector"
//                                     value={selectedSubject?.name || ""}
//                                     label="Select Subject"
//                                     onChange={handleSubjectChange}
//                                 >
//                                     <MenuItem value="">-- Select a Subject --</MenuItem>
//                                     {subjects?.map((subject) => (
//                                         <MenuItem key={subject.name} value={subject.name}>
//                                             {subject.name}
//                                         </MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
//                         </div>
//                     )}

//                     {/* Assessment Selection */}
//                     {selectedSubject && (
//                         <div className="flex flex-col">
//                             <FormControl fullWidth>
//                                 <InputLabel id="assessment-multiple-label">Select Assessments</InputLabel>
//                                 <Select
//                                     labelId="assessment-multiple-label"
//                                     id="assessmentSelector"
//                                     multiple
//                                     value={selectedAssessments}
//                                     label="Select Assessments"
//                                     onChange={handleAssessmentsChange}
//                                     renderValue={(selected) => selected.join(', ')} // Display selected as comma-separated string
//                                 >
//                                     {assessments?.map((assessment) => (
//                                         <MenuItem key={assessment.name} value={assessment.name}>
//                                             <Checkbox checked={selectedAssessments.indexOf(assessment.name) > -1} />
//                                             <ListItemText primary={assessment.name} />
//                                         </MenuItem>
//                                     ))}
//                                 </Select>
//                             </FormControl>
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

//                 {selectedAssessments.length > 0 && (
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
//                                     {/* Add a header for each selected assessment */}
//                                     {selectedAssessments.map(assessmentName => (
//                                         <th
//                                             key={assessmentName}
//                                             className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
//                                         >
//                                             {assessmentName}
//                                         </th>
//                                     ))}
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 {submittedData?.map((val, ind) => (
//                                     <tr key={ind} className="bg-white hover:bg-blue-gray-500">
//                                         <td className="px-5 py-2 border-b border-gray-200  bg-white text-sm">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={val.selected}
//                                                 onChange={(e) => handleCheckboxChange(ind, e.target.checked)}
//                                             />
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm ">
//                                             {val.admissionNumber}
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             {val.studentName}
//                                         </td>
//                                         {/* Add input fields for each selected assessment */}
//                                         {selectedAssessments.map(assessmentName => (
//                                             <td key={`${val.studentId}-${assessmentName}`} className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                                 <TextField
//                                                     type="number"
//                                                     value={studentMarks[val.studentId]?.[assessmentName] || ""}
//                                                     onChange={(e) => handleInputChange(val.studentId, assessmentName, e.target.value)}
//                                                     size="small"
//                                                 />
//                                             </td>
//                                         ))}
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
//         </>
//     );
// };

// export default AllotMarks;




// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Button, IconButton } from "@mui/material";
// import axios from "axios";
// import { toast } from "react-toastify";
// import StudentMarks from "./StudentMarks";
// import { getAllStudents } from "../../Network/TeacherApi";

// const AllotMarks = () => {
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
//                     `https://dvsserver.onrender.com/api/v1/exam/exams?className=${param?.class}&section=${param?.section}`,
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
//         setIsLoader(true)
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
//                 setIsLoader(false)
//             }
//         } catch (error) {
//             console.error("Error submitting marks:", error);
//             toast.error("Error submitting marks.");
//             setIsLoader(false)
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
//                                     <tr key={ind}  className="bg-white hover:bg-blue-gray-500">
//                                         <td className="px-5 py-2 border-b border-gray-200  bg-white text-sm">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={val.selected}
//                                                 onChange={(e) => handleCheckboxChange(ind, e.target.checked)}
//                                             />
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm ">
//                                             {val.admissionNumber}
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             {/* {val.fullName} */}
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
//             {/* <StudentMarks /> */}
//         </>
//     );
// };

// export default AllotMarks;



// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Button, IconButton } from "@mui/material";
// import axios from "axios";
// import { toast } from "react-toastify";
// import StudentMarks from "./StudentMarks";
// import { getAllStudents } from "../../Network/TeacherApi";

// const AllotMarks = () => {
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
//                     `https://dvsserver.onrender.com/api/v1/exam/exams?className=${param?.class}&section=${param?.section}`,
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
//         setIsLoader(true)
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
//                 setIsLoader(false)
//             }
//         } catch (error) {
//             console.error("Error submitting marks:", error);
//             toast.error("Error submitting marks.");
//             setIsLoader(false)
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
//                                     <tr key={ind}  className="bg-white hover:bg-blue-gray-500">
//                                         <td className="px-5 py-2 border-b border-gray-200  bg-white text-sm">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={val.selected}
//                                                 onChange={(e) => handleCheckboxChange(ind, e.target.checked)}
//                                             />
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm ">
//                                             {val.admissionNumber}
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             {/* {val.fullName} */}
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
//             {/* <StudentMarks /> */}
//         </>
//     );
// };

// export default AllotMarks;







// import React, { useState } from "react";
// // import { bulkUploadMarks } from "../../services/api";
// import {
//   TextField, Button, Box, Typography, Paper, Grid, IconButton
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";
// import { marksmarksbulkupload } from "../../Network/AdminApi";
// import { toast } from "react-toastify";

// const BulkUploadMarks = () => {
//   const [formData, setFormData] = useState({
//     examId: "",
//     studentsMarks: [{ 
//       studentId: "", 
//       className: "", 
//       section: "", 
//       marks: [{ subjectName: "", assessments: [{ assessmentName: "", marksObtained: 0 }] }] 
//     }],
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleStudentChange = (index, e) => {
//     const newStudents = [...formData.studentsMarks];
//     newStudents[index][e.target.name] = e.target.value;
//     setFormData({ ...formData, studentsMarks: newStudents });
//   };

//   const handleMarkChange = (studentIndex, markIndex, e) => {
//     const newStudents = [...formData.studentsMarks];
//     newStudents[studentIndex].marks[markIndex][e.target.name] = e.target.value;
//     setFormData({ ...formData, studentsMarks: newStudents });
//   };

//   const handleAssessmentChange = (studentIndex, markIndex, assIndex, e) => {
//     const newStudents = [...formData.studentsMarks];
//     newStudents[studentIndex].marks[markIndex].assessments[assIndex][e.target.name] = e.target.value;
//     setFormData({ ...formData, studentsMarks: newStudents });
//   };

//   const addStudent = () => {
//     setFormData({
//       ...formData,
//       studentsMarks: [...formData.studentsMarks, {
//         studentId: "", className: "", section: "",
//         marks: [{ subjectName: "", assessments: [{ assessmentName: "", marksObtained: 0 }] }]
//       }],
//     });
//   };

//   const removeStudent = (index) => {
//     setFormData({
//       ...formData,
//       studentsMarks: formData.studentsMarks.filter((_, i) => i !== index),
//     });
//   };

//   const addMark = (studentIndex) => {
//     const newStudents = [...formData.studentsMarks];
//     newStudents[studentIndex].marks.push({ subjectName: "", assessments: [{ assessmentName: "", marksObtained: 0 }] });
//     setFormData({ ...formData, studentsMarks: newStudents });
//   };

//   const removeMark = (studentIndex, markIndex) => {
//     const newStudents = [...formData.studentsMarks];
//     newStudents[studentIndex].marks = newStudents[studentIndex].marks.filter((_, i) => i !== markIndex);
//     setFormData({ ...formData, studentsMarks: newStudents });
//   };

//   const addAssessment = (studentIndex, markIndex) => {
//     const newStudents = [...formData.studentsMarks];
//     newStudents[studentIndex].marks[markIndex].assessments.push({ assessmentName: "", marksObtained: 0 });
//     setFormData({ ...formData, studentsMarks: newStudents });
//   };

//   const removeAssessment = (studentIndex, markIndex, assIndex) => {
//     const newStudents = [...formData.studentsMarks];
//     newStudents[studentIndex].marks[markIndex].assessments = newStudents[studentIndex].marks[markIndex].assessments.filter((_, i) => i !== assIndex);
//     setFormData({ ...formData, studentsMarks: newStudents });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//     //   await bulkUploadMarks(formData);
//     const response =await marksmarksbulkupload(formData)
//         if(response?.success){
//             toast.success(response?.success)
//             alert("Marks uploaded successfully!");
//         }
//         else{
//             toast.error(response?.error)
//         }
    
      
//     } catch (error) {
//       alert("Error uploading marks: " + error.response.data.message);
//     }
//   };

//   return (
//     <Box display="flex" justifyContent="center" mt={5}>
//       <Paper elevation={3} sx={{ padding: 4, maxWidth: 700 }}>
//         <Typography variant="h4" gutterBottom>Bulk Upload Marks</Typography>
//         <form onSubmit={handleSubmit}>
//           <TextField fullWidth label="Exam ID" name="examId" onChange={handleChange} sx={{ mb: 3 }} />

//           {formData.studentsMarks.map((student, sIndex) => (
//             <Box key={sIndex} mt={2} p={2} border={1} borderRadius={2}>
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={10}>
//                   <TextField fullWidth label="Student ID" name="studentId" value={student.studentId} onChange={(e) => handleStudentChange(sIndex, e)} />
//                 </Grid>
//                 <Grid item xs={2}>
//                   <IconButton color="error" onClick={() => removeStudent(sIndex)}>
//                     <RemoveIcon />
//                   </IconButton>
//                 </Grid>
//                 <Grid item xs={6}>
//                   <TextField fullWidth label="Class Name" name="className" value={student.className} onChange={(e) => handleStudentChange(sIndex, e)} />
//                 </Grid>
//                 <Grid item xs={6}>
//                   <TextField fullWidth label="Section" name="section" value={student.section} onChange={(e) => handleStudentChange(sIndex, e)} />
//                 </Grid>
//               </Grid>

//               {student.marks.map((mark, mIndex) => (
//                 <Box key={mIndex} mt={2} p={2} border={1} borderRadius={2}>
//                   <Grid container spacing={2} alignItems="center">
//                     <Grid item xs={10}>
//                       <TextField fullWidth label="Subject Name" name="subjectName" value={mark.subjectName} onChange={(e) => handleMarkChange(sIndex, mIndex, e)} />
//                     </Grid>
//                     <Grid item xs={2}>
//                       <IconButton color="error" onClick={() => removeMark(sIndex, mIndex)}>
//                         <RemoveIcon />
//                       </IconButton>
//                     </Grid>
//                   </Grid>

//                   {mark.assessments.map((ass, aIndex) => (
//                     <Grid container spacing={2} key={aIndex} alignItems="center" mt={1}>
//                       <Grid item xs={5}>
//                         <TextField fullWidth label="Assessment Name" name="assessmentName" value={ass.assessmentName} onChange={(e) => handleAssessmentChange(sIndex, mIndex, aIndex, e)} />
//                       </Grid>
//                       <Grid item xs={5}>
//                         <TextField fullWidth type="number" label="Marks Obtained" name="marksObtained" value={ass.marksObtained} onChange={(e) => handleAssessmentChange(sIndex, mIndex, aIndex, e)} />
//                       </Grid>
//                       <Grid item xs={2}>
//                         <IconButton color="error" onClick={() => removeAssessment(sIndex, mIndex, aIndex)}>
//                           <RemoveIcon />
//                         </IconButton>
//                       </Grid>
//                     </Grid>
//                   ))}

//                   <Button startIcon={<AddIcon />} variant="outlined" color="primary" size="small" sx={{ mt: 1 }} onClick={() => addAssessment(sIndex, mIndex)}>
//                     Add Assessment
//                   </Button>
//                 </Box>
//               ))}

//               <Button startIcon={<AddIcon />} variant="contained" color="secondary" sx={{ mt: 2 }} onClick={() => addMark(sIndex)}>
//                 Add Subject
//               </Button>
//             </Box>
//           ))}

//           <Button startIcon={<AddIcon />} variant="contained" color="secondary" sx={{ mt: 3 }} onClick={addStudent}>
//             Add Student
//           </Button>

//           <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
//             Upload Marks
//           </Button>
//         </form>
//       </Paper>
//     </Box>
//   );
// };

// export default BulkUploadMarks;





// import React, { useState } from "react";
// // import { addMark } from "../../services/api";
// import { 
//   TextField, Button, Box, Typography, Paper, Grid, IconButton 
// } from "@mui/material";
// import AddIcon from "@mui/icons-material/Add";
// import RemoveIcon from "@mui/icons-material/Remove";

// const AllotMarks = () => {
//   const [formData, setFormData] = useState({
//     studentId: "",
//     examId: "",
//     className: "",
//     section: "",
//     marks: [{ subjectName: "", assessments: [{ assessmentName: "", marksObtained: 0 }] }],
//     coScholasticMarks: [{ areaName: "", grade: "" }],
//   });

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleMarkChange = (index, e) => {
//     const newMarks = [...formData.marks];
//     newMarks[index][e.target.name] = e.target.value;
//     setFormData({ ...formData, marks: newMarks });
//   };

//   const handleAssessmentChange = (markIndex, assIndex, e) => {
//     const newMarks = [...formData.marks];
//     newMarks[markIndex].assessments[assIndex][e.target.name] = e.target.value;
//     setFormData({ ...formData, marks: newMarks });
//   };

//   const handleCoScholasticChange = (index, e) => {
//     const newCoScholastic = [...formData.coScholasticMarks];
//     newCoScholastic[index][e.target.name] = e.target.value;
//     setFormData({ ...formData, coScholasticMarks: newCoScholastic });
//   };

//   const addMark = () => {
//     setFormData({
//       ...formData,
//       marks: [...formData.marks, { subjectName: "", assessments: [{ assessmentName: "", marksObtained: 0 }] }],
//     });
//   };

//   const removeMark = (index) => {
//     const newMarks = formData.marks.filter((_, i) => i !== index);
//     setFormData({ ...formData, marks: newMarks });
//   };

//   const addAssessment = (markIndex) => {
//     const newMarks = [...formData.marks];
//     newMarks[markIndex].assessments.push({ assessmentName: "", marksObtained: 0 });
//     setFormData({ ...formData, marks: newMarks });
//   };

//   const removeAssessment = (markIndex, assIndex) => {
//     const newMarks = [...formData.marks];
//     newMarks[markIndex].assessments = newMarks[markIndex].assessments.filter((_, i) => i !== assIndex);
//     setFormData({ ...formData, marks: newMarks });
//   };

//   const addCoScholastic = () => {
//     setFormData({
//       ...formData,
//       coScholasticMarks: [...formData.coScholasticMarks, { areaName: "", grade: "" }],
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//     //   await addMark(formData);
//       alert("Marks added successfully!");
//     } catch (error) {
//       alert("Error adding marks: " + error.response.data.message);
//     }
//   };

//   return (
//     <Box display="flex" justifyContent="center" mt={5}>
//       <Paper elevation={3} sx={{ padding: 4, maxWidth: 600 }}>
//         <Typography variant="h4" gutterBottom>Allot Marks</Typography>
//         <form onSubmit={handleSubmit}>
//           <Grid container spacing={2}>
//             <Grid item xs={12}>
//               <TextField fullWidth label="Student ID" name="studentId" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField fullWidth label="Exam ID" name="examId" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField fullWidth label="Class Name" name="className" onChange={handleChange} />
//             </Grid>
//             <Grid item xs={12}>
//               <TextField fullWidth label="Section" name="section" onChange={handleChange} />
//             </Grid>
//           </Grid>

//           <Typography variant="h5" mt={3}>Marks</Typography>
//           {formData.marks.map((mark, mIndex) => (
//             <Box key={mIndex} mt={2} p={2} border={1} borderRadius={2}>
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={10}>
//                   <TextField fullWidth label="Subject Name" name="subjectName" value={mark.subjectName} onChange={(e) => handleMarkChange(mIndex, e)} />
//                 </Grid>
//                 <Grid item xs={2}>
//                   <IconButton color="error" onClick={() => removeMark(mIndex)}>
//                     <RemoveIcon />
//                   </IconButton>
//                 </Grid>
//               </Grid>

//               {mark.assessments.map((ass, aIndex) => (
//                 <Grid container spacing={2} key={aIndex} alignItems="center" mt={1}>
//                   <Grid item xs={5}>
//                     <TextField fullWidth label="Assessment Name" name="assessmentName" value={ass.assessmentName} onChange={(e) => handleAssessmentChange(mIndex, aIndex, e)} />
//                   </Grid>
//                   <Grid item xs={5}>
//                     <TextField fullWidth type="number" label="Marks Obtained" name="marksObtained" value={ass.marksObtained} onChange={(e) => handleAssessmentChange(mIndex, aIndex, e)} />
//                   </Grid>
//                   <Grid item xs={2}>
//                     <IconButton color="error" onClick={() => removeAssessment(mIndex, aIndex)}>
//                       <RemoveIcon />
//                     </IconButton>
//                   </Grid>
//                 </Grid>
//               ))}

//               <Button 
//                 startIcon={<AddIcon />} 
//                 variant="outlined" 
//                 color="primary" 
//                 size="small" 
//                 sx={{ mt: 1 }} 
//                 onClick={() => addAssessment(mIndex)}
//               >
//                 Add Assessment
//               </Button>
//             </Box>
//           ))}

//           <Button startIcon={<AddIcon />} variant="contained" color="secondary" sx={{ mt: 2 }} onClick={addMark}>
//             Add Subject
//           </Button>

//           <Typography variant="h5" mt={3}>Co-Scholastic Marks</Typography>
//           {formData.coScholasticMarks.map((co, cIndex) => (
//             <Box key={cIndex} mt={2}>
//               <Grid container spacing={2} alignItems="center">
//                 <Grid item xs={6}>
//                   <TextField fullWidth label="Area Name" name="areaName" value={co.areaName} onChange={(e) => handleCoScholasticChange(cIndex, e)} />
//                 </Grid>
//                 <Grid item xs={6}>
//                   <TextField fullWidth label="Grade" name="grade" value={co.grade} onChange={(e) => handleCoScholasticChange(cIndex, e)} />
//                 </Grid>
//               </Grid>
//             </Box>
//           ))}

//           <Button startIcon={<AddIcon />} variant="contained" color="secondary" sx={{ mt: 2 }} onClick={addCoScholastic}>
//             Add Co-Scholastic
//           </Button>

//           <Button type="submit" variant="contained" color="primary" fullWidth sx={{ mt: 3 }}>
//             Submit Marks
//           </Button>
//         </form>
//       </Paper>
//     </Box>
//   );
// };

// export default AllotMarks;


// import React, { useState } from 'react';
// import { addMark } from '../../services/api';

// const AllotMarks = () => {
//   const [formData, setFormData] = useState({
//     studentId: '',
//     examId: '',
//     className: '',
//     section: '',
//     marks: [{ subjectName: '', assessments: [{ assessmentName: '', marksObtained: 0 }] }],
//     coScholasticMarks: [{ areaName: '', grade: '' }],
//   });

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };

//   const handleMarkChange = (index, e) => {
//     const { name, value } = e.target;
//     const marks = [...formData.marks];
//     marks[index][name] = value;
//     setFormData({ ...formData, marks });
//   };

//   const handleAssessmentChange = (markIndex, assIndex, e) => {
//     const { name, value } = e.target;
//     const marks = [...formData.marks];
//     marks[markIndex].assessments[assIndex][name] = value;
//     setFormData({ ...formData, marks });
//   };

//   const handleCoScholasticChange = (index, e) => {
//     const { name, value } = e.target;
//     const coScholasticMarks = [...formData.coScholasticMarks];
//     coScholasticMarks[index][name] = value;
//     setFormData({ ...formData, coScholasticMarks });
//   };

//   const addMark = () => {
//     setFormData({
//       ...formData,
//       marks: [...formData.marks, { subjectName: '', assessments: [{ assessmentName: '', marksObtained: 0 }] }],
//     });
//   };

//   const addAssessment = (markIndex) => {
//     const marks = [...formData.marks];
//     marks[markIndex].assessments.push({ assessmentName: '', marksObtained: 0 });
//     setFormData({ ...formData, marks });
//   };

//   const addCoScholastic = () => {
//     setFormData({
//       ...formData,
//       coScholasticMarks: [...formData.coScholasticMarks, { areaName: '', grade: '' }],
//     });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await addMark(formData);
//       alert('Mark added successfully!');
//       console.log(response.data);
//     } catch (error) {
//       alert('Error adding mark: ' + error.response.data.message);
//     }
//   };

//   return (
//     <div className="add-mark">
//       <h2>Add Mark</h2>
//       <form onSubmit={handleSubmit}>
//         <input name="studentId" placeholder="Student ID" onChange={handleChange} />
//         <input name="examId" placeholder="Exam ID" onChange={handleChange} />
//         <input name="className" placeholder="Class Name" onChange={handleChange} />
//         <input name="section" placeholder="Section" onChange={handleChange} />

//         <h3>Marks</h3>
//         {formData.marks.map((mark, mIndex) => (
//           <div key={mIndex}>
//             <input name="subjectName" placeholder="Subject Name" value={mark.subjectName} onChange={(e) => handleMarkChange(mIndex, e)} />
//             {mark.assessments.map((ass, aIndex) => (
//               <div key={aIndex}>
//                 <input name="assessmentName" placeholder="Assessment Name" value={ass.assessmentName} onChange={(e) => handleAssessmentChange(mIndex, aIndex, e)} />
//                 <input name="marksObtained" type="number" placeholder="Marks Obtained" value={ass.marksObtained} onChange={(e) => handleAssessmentChange(mIndex, aIndex, e)} />
//               </div>
//             ))}
//             <button type="button" onClick={() => addAssessment(mIndex)}>Add Assessment</button>
//           </div>
//         ))}
//         <button type="button" onClick={addMark}>Add Subject</button>

//         <h3>Co-Scholastic Marks</h3>
//         {formData.coScholasticMarks.map((co, cIndex) => (
//           <div key={cIndex}>
//             <input name="areaName" placeholder="Area Name" value={co.areaName} onChange={(e) => handleCoScholasticChange(cIndex, e)} />
//             <input name="grade" placeholder="Grade" value={co.grade} onChange={(e) => handleCoScholasticChange(cIndex, e)} />
//           </div>
//         ))}
//         <button type="button" onClick={addCoScholastic}>Add Co-Scholastic</button>

//         <button type="submit">Add Mark</button>
//       </form>
//     </div>
//   );
// };



// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Button, IconButton } from "@mui/material";
// import axios from "axios";
// import { toast } from "react-toastify";
// import StudentMarks from "./StudentMarks";
// import { getAllStudents } from "../../Network/TeacherApi";

// const AllotMarks = () => {
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
//                     `https://dvsserver.onrender.com/api/v1/exam/exams?className=${param?.class}&section=${param?.section}`,
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
//         setIsLoader(true)
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
//                 setIsLoader(false)
//             }
//         } catch (error) {
//             console.error("Error submitting marks:", error);
//             toast.error("Error submitting marks.");
//             setIsLoader(false)
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
//                                     <tr key={ind}  className="bg-white hover:bg-blue-gray-500">
//                                         <td className="px-5 py-2 border-b border-gray-200  bg-white text-sm">
//                                             <input
//                                                 type="checkbox"
//                                                 checked={val.selected}
//                                                 onChange={(e) => handleCheckboxChange(ind, e.target.checked)}
//                                             />
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm ">
//                                             {val.admissionNumber}
//                                         </td>
//                                         <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                             {/* {val.fullName} */}
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
//             {/* <StudentMarks /> */}
//         </>
//     );
// };

// export default AllotMarks;









// export default AllotMarks;

// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Button, IconButton } from "@mui/material";
// import axios from "axios";
// import { toast } from "react-toastify";
// import StudentMarks from "./StudentMarks";
// import { getAllStudents } from "../../Network/TeacherApi";

// const AllotMarks = () => {
//     const { currentColor, setIsLoader } = useStateContext();
//     const authToken = localStorage.getItem("token");
//     const user = JSON.parse(localStorage.getItem("user"));

//     const [submittedData, setSubmittedData] = useState([]);
//     const [selectedExam, setSelectedExam] = useState(null); // Changed: Store the entire exam object
//     const [selectedSubject, setSelectedSubject] = useState(null); // Changed: Store the entire subject object
//     const [selectedAssessment, setSelectedAssessment] = useState(null); // New: State for selected assessment
//     const [subjects, setSubjects] = useState([]);
//     const [assessments, setAssessments] = useState([]);
//     const [selectAll, setSelectAll] = useState(false);
//     const [examData, setExamData] = useState([]);
//     const CO_SCHOLASTIC_OPTION = "Co-Scholastic";
//     const [globalActivityName, setGlobalActivityName] = useState("");
//     const [studentMarks, setStudentMarks] = useState({}); // Store marks against student ID

//     const param = {
//         class: user?.classTeacher,
//         section: user?.section
//     };

//     useEffect(() => {
//         const fetchExams = async () => {
//             try {
//                 const response = await axios.get(
//                     `https://dvsserver.onrender.com/api/v1/exam/exams?classNames=${param?.class}§ion=${param?.section}`,
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
//     // }, [authToken, param]);

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
//     // }, [setIsLoader, param]);

//     const handleExamChange = (event) => {
//         const selectedExamId = event.target.value;
//         const exam = examData.find((e) => e.examId === selectedExamId);
//         setSelectedExam(exam); // Store the whole exam object
//         setSelectedSubject(null); // Reset
//         setSelectedAssessment(null); // Reset
//         setSubjects(exam?.subjects || []); // Extract subjects from exam object

//         setStudentMarks({}); // Clear existing marks when exam changes
//     };

//     const handleSubjectChange = (event) => {
//         const subjectName = event.target.value;
//         const subject = selectedExam.subjects.find((s) => s.name === subjectName);
//         setSelectedSubject(subject); // Store the whole subject object
//         setSelectedAssessment(null); // Reset
//         setAssessments(subject?.assessments || []); // Extract assessments from subject
//         // setAssessments(event.target.value)
//         setStudentMarks({}); // Clear existing marks when subject changes

//     };
// const handleAssessmentsChange = (event) => {
//     const assessmentName = event.target.value;
//     const assessment = selectedSubject.assessments.find((a) => a.name === assessmentName);
//         setSelectedAssessment(assessment)
// }
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
// console.log(" studentMarks", studentMarks);
// // console.log(" submittedData", submittedData);
//     const handleSubmit = async (e) => {
//         e.preventDefault();

//         const marksData = [];

//         for (const student of submittedData) {
//             if (!student.selected) continue; // Skip unselected students

//             const studentId = student.studentId;
   
//             const assessmentData = {
//                 assessmentName: selectedAssessment.name,
//                 marksObtained: studentMarks[studentId],
//             };

//             marksData.push({
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

//         if (marksData.length === 0) {
//             toast.warn("No students selected, or no marks entered.");
//             return;
//         }

//         try {
//             const response = await axios.post(
//                 "https://dvsserver.onrender.com/api/v1/marks/marksbulkupload",
//                 marksData,
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
//                 setStudentMarks({}); // Clear the marks
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
//         selectedSubject && selectedSubject.name !== CO_SCHOLASTIC_OPTION ? `Marks for ${selectedSubject.name}` : null, // Dynamic header
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

// export default AllotMarks;

// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Button, IconButton } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import axios from "axios";

// import { toast } from "react-toastify";
// import Marks from "./Marks";
// import StudentMarks from "./StudentMarks";
// import { LastYearStudents } from "../../Network/AdminApi";
// import { getAllStudents } from "../../Network/TeacherApi";

// const AllotMarks = () => {
//     // const { currentColor, setIsLoader } = useStateContext();
//     const authToken = localStorage.getItem("token");
//     // const allStudent = JSON.parse(localStorage.getItem("studentsData"))?.map(
//     //     (student) => ({
//     //         ...student,
//     //         coScholasticMarks: [],
//     //     })
//     // );

//     const { currentColor, setIsLoader } = useStateContext();
//     const [submittedData, setSubmittedData] = useState([]);
//     console.log("submittedData",submittedData)
//     // const [submittedData, setSubmittedData] = useState(allStudent);
//     const [selectedExamId, setSelectedExamId] = useState("");
//     const [selectedSubject, setSelectedSubject] = useState("");
//     const [assessments, setAssessments] = useState("");
//     const [subjects, setSubjects] = useState([]);
//     console.log("subjects",subjects)
//     const [selectAll, setSelectAll] = useState(false);
//     const [examData, setExamData] = useState([]);
//     const CO_SCHOLASTIC_OPTION = "Co-Scholastic";
//     const [globalActivityName, setGlobalActivityName] = useState("");
//     const user = JSON.parse(localStorage.getItem("user"));
    
//     const param = {
//            class: user?.classTeacher,
//            section: user?.section
//        }
//     useEffect(() => {

//         const fetchExams = async () => {
//             try {
//                 const response = await axios.get(
                   
//                     `https://dvsserver.onrender.com/api/v1/exam/exams?classNames=${param?.class}&section=${param?.section}`,
//                     // "https://dvsserver.onrender.com/api/v1/exam/getExams",
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
//     }, [authToken]);
  


//     const allStudent = async () => {
//         setIsLoader(true)
//         try {
//             const response = await getAllStudents(param);

//             if (response?.success) {
//                 setIsLoader(false)
//                 setSubmittedData(response?.students?.data);
//             } else {
//                 toast.error(response?.message);

//             }
//         } catch (error) {
//             console.log("error", error);

//         }
//         finally {
//             setIsLoader(false)
//         }
//     };


//     useEffect(() => {
//         allStudent();
//     }, []);

//     const handleExamChange = (event) => {
//       // console.log("event",event.target)
//         const selectedId = event.target.value;

//         const exam = examData.find((e) => e.examId === selectedId);
//         // setSelectedExam(exam);
//         setSelectedExamId(exam);
// // console.log("examData",examData)
// // console.log("exam",exam)



//         // setSelectedExamId(examId);
//         setSelectedSubject(""); // Reset subject selection when exam changes
//         const selectedExam = examData?.find((exam) => exam.examId === selectedId);
//         console.log("selectedExamselectedExam anand",selectedExam.subjects?.map((item)=>item?.name))
//         // const selectedExam = examData?.find((exam) => exam._id === selectedId);
//         if (selectedExam) {
//             setSubjects(selectedExam.subjects?.map((item)=>item?.name) || []);
//             // setSubjects(selectedExam.subjects || []);
//         }
//     };

//     console.log("subjects",subjects)
//     const handleSubjectChange = (event) => {
//       console.log("event handleSubjectChange",event)
//         setSelectedSubject(event.target.value);
//         // setAssessments()
//     };


//     const handleInputChange = (index, field, value) => {
//         const newData = [...submittedData];
//         newData[index][field] = value;
//         setSubmittedData(newData);
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
//             toast.error("Please enter activity name")
//             return; // Don't add if the activity name is empty
//         }
//         const newData = submittedData.map(student => ({
//             ...student,
//             coScholasticMarks: [...student.coScholasticMarks, { activityName: globalActivityName, grade: "A" }]
//         }));
//         setSubmittedData(newData);
//         setGlobalActivityName(""); // Clear the global activity name input
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
//     const params = {
//       class: user?.classTeacher,
//       section: user?.section
//   }
//   console.log("selectedExamId",selectedExamId)
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         const selectedData = {
//             // examId: selectedExamId?.examId,
//             studentId: submittedData?.studentId,
//             "className": params?.classTeacher,
//             "section": params?.section,
//             marks: submittedData
//                 .filter((data) => data.selected)
//                 .map((data) => console.log("datadatadatadatadata",data)
                   
                    
//                       // studentId: data.studentId,
//                       //  // studentId: data._id,
//                       // "className": params?.classTeacher,
//                       // "section": params?.section,
//                       // marks:
                       
//                       //       [
//                       //           {
//                       //               subjectName: selectedSubject,
//                       //               "assessments": [
//                       //   {
//                       //  "assessmentName": data?.examType,
//                       // "marksObtained": data[selectedSubject]
//                       //   }
//                       //   ]
//                       //               // marks: data[selectedSubject] || 0,
//                       //               // totalMarks:
//                       //               //     subjects.find((sub) => sub.name === selectedSubject)
//                       //               //         ?.totalMarks || 100,
//                       //               // passingMarks:
//                       //               //     subjects.find((sub) => sub.name === selectedSubject)
//                       //               //         ?.passingMarks || 40,
//                       //               // isPassed:
//                       //               //     (data[selectedSubject] || 0) >=
//                       //               //     (subjects.find((sub) => sub.name === selectedSubject)
//                       //               //         ?.passingMarks || 40),
//                       //           },
//                       //       ]
//                             // : [],
//                          // coScholasticMarks:
//                          //     selectedSubject === CO_SCHOLASTIC_OPTION
//                          //         ? data.coScholasticMarks
//                          //         : [],
//                 // })
//               ),
                
//         };
//         console.log("selectedData", selectedData)

//         try {
//             let response = await axios.post(
//                 "https://dvsserver.onrender.com/api/v1/marks/marksbulkupload",
//                 // "https://dvsserver.onrender.com/api/v1/marks/marksbulkupload",
//                 selectedData,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );
//             // console.log("response",response)
//             if (response?.data) {
//                 // alert("Marks submitted successfully!");
//                 toast.success("Marks submitted successfully!");
//                 // setSubmittedData(allStudent);
//                 setSelectedSubject("");//reset the subject
//                 setGlobalActivityName("");//reset the global activity
//             }
//         } catch (error) {
//             console.error("Error submitting marks:", error);
//         }
//     };

//     const THEAD = [
//         <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />,
//         "ID",
//         "Name",
//         selectedSubject !== CO_SCHOLASTIC_OPTION ? selectedSubject : null,
//         selectedSubject === CO_SCHOLASTIC_OPTION ? "Co-Scholastic Marks" : null,
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

//                 <div className="grid grid-cols-2 gap-2">
//                     <div className=" flex flex-col">
//                         <label htmlFor="examSelector">Select Exam:</label>
//                         <select
//                             id="examSelector"
//                             className="outline-none border-2"
//                             value={selectedExamId?.examId}
//                             // value={selectedExamId}
//                             onChange={handleExamChange}
//                             style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
//                         >
//                             <option value="" >
//                                 {/* <option value="" disabled> */}
//                                 -- Select an Exam --
//                             </option>
//                             {console.log("first")}
//                             {examData?.map((exam) => (
//                                 // <option key={exam._id} value={exam}>
//                                 <option key={exam._id} value={exam?.examId}>
//                                 {/* <option key={exam._id} value={exam?._id}> */}
//                                     {exam?.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {selectedExamId?.examId && (
//                         <div className=" flex flex-col">
//                             <label htmlFor="subjectSelector">Select Subject:</label>
//                             <select
//                                 id="subjectSelector"
//                                 className="outline-none border-2"
//                                 value={selectedSubject}
//                                 onChange={handleSubjectChange}
//                                 style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
//                             >
//                                 <option value="" >
//                                     {/* <option value="" disabled> */}
//                                     -- Select a Subject --
//                                 </option>
//                                 <option key={CO_SCHOLASTIC_OPTION} value={CO_SCHOLASTIC_OPTION}>
//                                     {CO_SCHOLASTIC_OPTION}
//                                 </option>
//                                 {subjects?.map((subject) => (
//                                     <option key={subject} value={subject}>
//                                         {subject}
//                                     </option>
//                                     // <option key={subject.name} value={subject.name}>
//                                     //     {subject.name}
//                                     // </option>
//                                 ))}
//                             </select>
//                         </div>
//                     )}
//                     {assessments && (
//                         <div className=" flex flex-col">
//                             <label htmlFor="subjectSelector">Select assessments:</label>
//                             <select
//                                 id="subjectSelector"
//                                 className="outline-none border-2"
//                                 value={selectedSubject}
//                                 onChange={handleAssessmentsChange}
//                                 style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
//                             >
//                                 <option value="" >
//                                     {/* <option value="" disabled> */}
//                                     -- Select a assessments --
//                                 </option>
                                
//                                 {assessments?.map((val) => (
//                                     <option key={val} value={val}>
//                                         {val}
//                                     </option>
                                    
//                                 ))}
//                             </select>
//                         </div>
//                     )}
//                 </div>
//                 {selectedSubject === CO_SCHOLASTIC_OPTION && (
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

//                 {selectedExamId && (
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
//                                         {selectedSubject !== CO_SCHOLASTIC_OPTION && (
//                                             <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                                 <input
//                                                     className="border-2 outline-none w-[60px] px-2"
//                                                     type="number"
//                                                     value={val[selectedSubject] || ""}
//                                                     onChange={(e) =>
//                                                         handleInputChange(ind, selectedSubject, e.target.value)
//                                                     }
//                                                 />
//                                             </td>
//                                         )}
//                                         {selectedSubject === CO_SCHOLASTIC_OPTION && (
//                                             <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                                 <div>
//                                                     {val?.coScholasticMarks?.map((activity, activityIndex) => (

//                                                         <div className=" flex gap-2">
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

// export default AllotMarks;



// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Button, IconButton } from "@mui/material";
// import DeleteIcon from "@mui/icons-material/Delete";
// import axios from "axios";

// import { toast } from "react-toastify";
// import Marks from "./Marks";
// import StudentMarks from "./StudentMarks";
// import { LastYearStudents } from "../../Network/AdminApi";
// import { getAllStudents } from "../../Network/TeacherApi";

// const AllotMarks = () => {
//     // const { currentColor, setIsLoader } = useStateContext();
//     const authToken = localStorage.getItem("token");
//     // const allStudent = JSON.parse(localStorage.getItem("studentsData"))?.map(
//     //     (student) => ({
//     //         ...student,
//     //         coScholasticMarks: [],
//     //     })
//     // );

//     const { currentColor, setIsLoader } = useStateContext();
//     const [submittedData, setSubmittedData] = useState([]);
//     // const [submittedData, setSubmittedData] = useState(allStudent);
//     const [selectedExamId, setSelectedExamId] = useState("");
//     const [selectedSubject, setSelectedSubject] = useState("");
//     const [subjects, setSubjects] = useState([]);
//     const [selectAll, setSelectAll] = useState(false);
//     const [examData, setExamData] = useState([]);
//     const CO_SCHOLASTIC_OPTION = "Co-Scholastic";
//     const [globalActivityName, setGlobalActivityName] = useState("");
//     const user = JSON.parse(localStorage.getItem("user"));
    
//     const param = {
//            class: user?.classTeacher,
//            section: user?.section
//        }
//     useEffect(() => {

//         const fetchExams = async () => {
//             try {
//                 const response = await axios.get(
                   
//                     `https://dvsserver.onrender.com/api/v1/exam/exams?classNames=${param?.class}&section=${param?.section}`,
//                     // "https://dvsserver.onrender.com/api/v1/exam/getExams",
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
//     }, [authToken]);
  


//     const allStudent = async () => {
//         setIsLoader(true)
//         try {
//             const response = await getAllStudents(param);

//             if (response?.success) {
//                 setIsLoader(false)
//                 setSubmittedData(response?.students?.data);
//             } else {
//                 toast.error(response?.message);

//             }
//         } catch (error) {
//             console.log("error", error);

//         }
//         finally {
//             setIsLoader(false)
//         }
//     };


//     useEffect(() => {
//         allStudent();
//     }, []);

//     const handleExamChange = (event) => {
//         const examId = event.target.value;
//         setSelectedExamId(examId);
//         setSelectedSubject(""); // Reset subject selection when exam changes
//         const selectedExam = examData?.find((exam) => exam._id === examId);
//         if (selectedExam) {
//             setSubjects(selectedExam.subjects || []);
//         }
//     };

//     const handleSubjectChange = (event) => {
//         setSelectedSubject(event.target.value);
//     };


//     const handleInputChange = (index, field, value) => {
//         const newData = [...submittedData];
//         newData[index][field] = value;
//         setSubmittedData(newData);
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
//             toast.error("Please enter activity name")
//             return; // Don't add if the activity name is empty
//         }
//         const newData = submittedData.map(student => ({
//             ...student,
//             coScholasticMarks: [...student.coScholasticMarks, { activityName: globalActivityName, grade: "A" }]
//         }));
//         setSubmittedData(newData);
//         setGlobalActivityName(""); // Clear the global activity name input
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
//         const selectedData = {
//             examId: selectedExamId,
//             studentsMarks: submittedData
//                 .filter((data) => data.selected)
//                 .map((data) => ({
//                     studentId: data.studentId,
//                     // studentId: data._id,
//                     marks:
//                         selectedSubject && selectedSubject !== CO_SCHOLASTIC_OPTION
//                             ? [
//                                 {
//                                     subjectName: selectedSubject,
//                                     marks: data[selectedSubject] || 0,
//                                     totalMarks:
//                                         subjects.find((sub) => sub.name === selectedSubject)
//                                             ?.totalMarks || 100,
//                                     passingMarks:
//                                         subjects.find((sub) => sub.name === selectedSubject)
//                                             ?.passingMarks || 40,
//                                     isPassed:
//                                         (data[selectedSubject] || 0) >=
//                                         (subjects.find((sub) => sub.name === selectedSubject)
//                                             ?.passingMarks || 40),
//                                 },
//                             ]
//                             : [],
//                     coScholasticMarks:
//                         selectedSubject === CO_SCHOLASTIC_OPTION
//                             ? data.coScholasticMarks
//                             : [],
//                 })),
//         };
//         console.log("selectedData", selectedData)

//         try {
//             let response = await axios.post(
//                 "https://dvsserver.onrender.com/api/v1/marks/marksbulkupload",
//                 // "https://dvsserver.onrender.com/api/v1/marks/marksbulkupload",
//                 selectedData,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                         "Content-Type": "application/json",
//                     },
//                 }
//             );
//             // console.log("response",response)
//             if (response?.data) {
//                 // alert("Marks submitted successfully!");
//                 toast.success("Marks submitted successfully!");
//                 // setSubmittedData(allStudent);
//                 setSelectedSubject("");//reset the subject
//                 setGlobalActivityName("");//reset the global activity
//             }
//         } catch (error) {
//             console.error("Error submitting marks:", error);
//         }
//     };

//     const THEAD = [
//         <input type="checkbox" checked={selectAll} onChange={handleSelectAll} />,
//         "ID",
//         "Name",
//         selectedSubject !== CO_SCHOLASTIC_OPTION ? selectedSubject : null,
//         selectedSubject === CO_SCHOLASTIC_OPTION ? "Co-Scholastic Marks" : null,
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

//                 <div className="grid grid-cols-2 gap-2">
//                     <div className=" flex flex-col">
//                         <label htmlFor="examSelector">Select Exam:</label>
//                         <select
//                             id="examSelector"
//                             className="outline-none border-2"
//                             value={selectedExamId}
//                             onChange={handleExamChange}
//                             style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
//                         >
//                             <option value="" >
//                                 {/* <option value="" disabled> */}
//                                 -- Select an Exam --
//                             </option>
//                             {examData?.map((exam) => (
//                                 <option key={exam._id} value={exam?._id}>
//                                     {exam?.name}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     {selectedExamId && (
//                         <div className=" flex flex-col">
//                             <label htmlFor="subjectSelector">Select Subject:</label>
//                             <select
//                                 id="subjectSelector"
//                                 className="outline-none border-2"
//                                 value={selectedSubject}
//                                 onChange={handleSubjectChange}
//                                 style={{ padding: "8px", width: "100%", maxWidth: "300px" }}
//                             >
//                                 <option value="" >
//                                     {/* <option value="" disabled> */}
//                                     -- Select a Subject --
//                                 </option>
//                                 <option key={CO_SCHOLASTIC_OPTION} value={CO_SCHOLASTIC_OPTION}>
//                                     {CO_SCHOLASTIC_OPTION}
//                                 </option>
//                                 {subjects?.map((subject) => (
//                                     <option key={subject.name} value={subject.name}>
//                                         {subject.name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     )}
//                 </div>
//                 {selectedSubject === CO_SCHOLASTIC_OPTION && (
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

//                 {selectedExamId && (
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
//                                         {selectedSubject !== CO_SCHOLASTIC_OPTION && (
//                                             <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                                 <input
//                                                     className="border-2 outline-none w-[60px] px-2"
//                                                     type="number"
//                                                     value={val[selectedSubject] || ""}
//                                                     onChange={(e) =>
//                                                         handleInputChange(ind, selectedSubject, e.target.value)
//                                                     }
//                                                 />
//                                             </td>
//                                         )}
//                                         {selectedSubject === CO_SCHOLASTIC_OPTION && (
//                                             <td className="px-5 py-2 border-b border-gray-200 bg-white text-sm">
//                                                 <div>
//                                                     {val?.coScholasticMarks?.map((activity, activityIndex) => (

//                                                         <div className=" flex gap-2">
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
//                 {/* <Marks/> */}
//             </div>
//             <StudentMarks />
//         </>
//     );
// };

// export default AllotMarks;

