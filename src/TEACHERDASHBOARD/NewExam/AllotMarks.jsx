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
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";

const AllotMarks = () => {
    const session = JSON.parse(localStorage.getItem("session"))
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
             setIsLoader(true);
            try {
                const response = await axios.get(
                    `https://api.digitalvidyasaarthi.in/api/v1/exam/exams?className=${param?.class}&section=${param?.section}`,
                    {
                        withCredentials: true,
                        headers: {
                            Authorization: `Bearer ${authToken}`,
                        },
                    }
                );
                setExamData(response?.data?.exams);
            } catch (error) {
                 setIsLoader(false);
                console.error("Error fetching exams:", error);
            }
            setIsLoader(false);
        };
        fetchExams();
    }, []);

    useEffect(() => {
        const fetchStudents = async () => {
            // setIsLoader(true);
            try {
                const response = await getAllStudents(param,session);
                if (response?.success) {
                    setSubmittedData(response?.students?.data);
                } else {
                    toast.error(response?.message);
                }
            } catch (error) {
                console.error("Error fetching students:", error);
            } finally {
                // setIsLoader(false);
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
                "https://api.digitalvidyasaarthi.in/api/v1/marks/marksbulkupload",
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
                <th style={{ width: '40px', padding: '2px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>
                    {/* <Checkbox
                        checked={selectAll}
                        onChange={handleSelectAll}
                        size="small"
                    /> */}
                    <input type="checkbox"  checked={selectAll}
                        onChange={handleSelectAll} />
                </th>
                <th style={{ width: '80px', padding: '2px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>ID</th>
                <th style={{ width: '150px', padding: '2px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>NAME</th>
                <th style={{ width: '150px', padding: '2px', borderBottom: '2px solid #ddd', textAlign: 'left' }}>MARKS FOR {selectedSubject?.name?.toUpperCase()}</th>
                {selectedAssessments.map(assessmentName => (
                    <th
                        key={assessmentName}
                        style={{ width: '100px', padding: '2px', borderBottom: '2px solid #ddd', textAlign: 'left' }}
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
                <td style={{ padding: '2px', borderBottom: '1px solid #ddd' }}>
                    {/* <Checkbox
                        checked={student.selected || false}
                        onChange={() => handleCheckboxChange(index)}
                        size="small"
                    /> */}
                    <input type="checkbox"  checked={student.selected || false}
                        onChange={() => handleCheckboxChange(index)}  />
                </td>
                <td style={{ padding: '2px', borderBottom: '1px solid #ddd' }}>{student.admissionNumber}</td>
                <td style={{ padding: '2px', borderBottom: '1px solid #ddd' }}>{student.studentName}</td>
                <td style={{ padding: '2px', borderBottom: '1px solid #ddd' }}></td>  {/* Empty cell under "MARKS FOR ENGLISH" */}
                {selectedAssessments.map(assessmentName => (
                    <td key={`${student.studentId}-${assessmentName}`} style={{ padding: '2px', borderBottom: '1px solid #ddd' }}>
                        {/* <TextField
                            size="small"
                            type="number"
                            style={{ width: '80px' }}
                            value={studentMarks[student.studentId]?.[assessmentName] || ""}
                            onChange={(e) => handleInputChange(student.studentId, assessmentName, e.target.value)}
                        /> */}
                        <input type="number"  className="outline-none border-none bg-green-600 text-white px-3 w-[50px]"  value={studentMarks[student.studentId]?.[assessmentName] || ""}
                            onChange={(e) => handleInputChange(student.studentId, assessmentName, e.target.value)}
                     />
                    </td>
                ))}
            </tr>
        ));
    };

    return (
        <>
            <div className="">

            <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.teacherDashboard} title="Allot Marks" />


                <div className="bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
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

