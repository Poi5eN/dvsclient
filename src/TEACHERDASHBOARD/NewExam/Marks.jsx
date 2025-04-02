import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";

import { useStateContext } from "../../contexts/ContextProvider";
import { MdDownload } from "react-icons/md";
import * as XLSX from 'xlsx';
import { toast } from "react-toastify";

const Marks = () => {
    const [allStudents, setAllStudents] = useState([]);
    const [examName, setExamName] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [examResults, setExamResults] = useState([]);
    const [marks, setMarks] = useState([]);
    const [examData, setExamData] = useState([]);
    const [selectedExams, setSelectedExams] = useState([]);
    const [coScholasticMarks, setCoScholasticMarks] = useState([]);
    const [overallData, setOverallData] = useState({});
    const [loading, setLoading] = useState(false);
    const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);
    const [tableData, setTableData] = useState([]);

    const { currentColor } = useStateContext();
    const authToken = localStorage.getItem("token");

    useEffect(() => {
        const students = JSON.parse(localStorage.getItem("studentsData"));
        setAllStudents(students || []);
    }, []);

    const getResult = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                "https://dvsserver.onrender.com/api/v1/marks/getmarks",
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );
             setMarks(response.data.marks);
        } catch (error) {
            console.error("Error fetching marks:", error);
        } finally {
            setLoading(false);
        }
    }, [authToken]);

    useEffect(() => {
        getResult();
    }, [getResult]);

    const fetchExams = useCallback(async () => {
        try {
            const response = await axios.get(
                "https://dvsserver.onrender.com/api/v1/exam/getExams",
                {
                    withCredentials: true,
                    headers: { Authorization: `Bearer ${authToken}` },
                }
            );
            setExamData(response.data.exams);
        } catch (error) {
            console.error("Error fetching exams:", error);
        }
    }, [authToken]);
    useEffect(() => {
        fetchExams();
    }, [fetchExams]);


     useEffect(() => {
        if (!selectedStudent || marks.length === 0) {
            setExamResults([]);
            setCoScholasticMarks([]);
            setOverallData({});
            return;
        }

        if (isAllStudentsSelected) {
            setExamResults([]);
            setCoScholasticMarks([]);
            setOverallData({});
            return;
        }

        const studentMarks = marks.filter(
            (mark) => mark?.studentId?._id === selectedStudent?._id
        );

        const filteredMarks = studentMarks.filter((mark) =>
            selectedExams.includes(mark.examId)
        );

        const combinedResults = filteredMarks.reduce((acc, curr) => {
            curr.marks.forEach((mark) => {
                const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
                if (!existingMark) {
                    acc?.push({
                        ...mark,
                        examResults: [
                            {
                                examId: curr.examId,
                                marks: mark.marks,
                                totalMarks: mark.totalMarks,
                            },
                        ],
                    });
                } else {
                    existingMark.examResults = [
                        ...existingMark.examResults,
                        {
                            examId: curr.examId,
                            marks: mark.marks,
                            totalMarks: mark.totalMarks,
                        },
                    ];
                }
            });
            return acc;
        }, []);

        setExamResults({ marks: combinedResults });

        const lastSelectedExamId = selectedExams[selectedExams.length - 1];
        const lastSelectedExamMarks = filteredMarks.find(
            (mark) => mark.examId === lastSelectedExamId
        );

        const coScholasticData = lastSelectedExamMarks
            ? lastSelectedExamMarks.coScholasticMarks
            : [];

        setCoScholasticMarks(coScholasticData);
        setOverallData({});

        const updatedExamNames = examData
            .filter((ex) => selectedExams.includes(ex._id))
            .map((ex) => ex.name);
        setExamName(updatedExamNames.reverse());

    }, [marks, selectedStudent, selectedExams, isAllStudentsSelected, examData]);

    const handleExamChange = (e) => {
        const selectedValues = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedExams(selectedValues);
    };

   const prepareTableData = useCallback(() => {
        if (!marks || marks.length === 0 || selectedExams.length === 0) {
            setTableData([]);
            return;
        }

        const studentData = isAllStudentsSelected ? allStudents : [selectedStudent];

         const headerRow = [
            "Admission No.",
            "Student Name",
            "Class",
            "Section",
            "Roll No.",
             ...examName.flatMap(name => [`${name} Marks`, `${name} Total Marks`]),
             "Total Marks"
        ];

      const rows = marks.filter(mark => studentData.some(student => student._id === mark.studentId._id) && selectedExams.includes(mark.examId)).map(mark => {
            const student = mark.studentId;

            let rowData = [
              student?.rollNo || "N/A",
               student?.fullName || "N/A",
                mark?.className || "N/A",
                mark?.section || "N/A",
                 student?.rollNo || "N/A",
            ];
    
         examName.forEach((examName) => {
              let examMarks = 0;
                 let examTotalMarks = 0;
            mark.marks.forEach(subject => {
                examMarks =  subject.marks || 0;
                examTotalMarks = subject.totalMarks || 0;
          
            })
             rowData.push(examMarks || "N/A",examTotalMarks || "N/A");
        });
      
          rowData.push(mark?.totalMarks || "N/A")
             return rowData;
        });


        setTableData([headerRow, ...rows]);
    }, [marks, allStudents, selectedStudent, selectedExams, isAllStudentsSelected, examName]);

    useEffect(() => {
        prepareTableData();
    }, [prepareTableData]);

    const handleStudentChange = (e) => {
        const selectedValue = e.target.value;
        if (selectedValue === "all") {
            setSelectedStudent(null);
            setIsAllStudentsSelected(true);
        } else {
            const selected = allStudents.find(
                (student) => student?._id === selectedValue
            );
            setSelectedStudent(selected);
            setIsAllStudentsSelected(false);
        }
    };

    const downloadExcel = () => {
        if (tableData.length === 0) {
            toast.error("No data to download");
            return;
        }

        const worksheet = XLSX.utils.aoa_to_sheet(tableData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Marks");
        XLSX.writeFile(workbook, "marks_data.xlsx");
          toast.success("Downloaded successfully");
    };

    return (
        <>
            <div className="mb-4 mx-auto">
                <div
                    className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
                    style={{
                        background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
                    }}
                >
                    <p className="text-lg">Marks Data</p>
                    {/* <MdDownload
                        onClick={downloadExcel}
                        className="text-2xl cursor-pointer"
                    /> */}
                </div>
                <div className="w-full flex">
                    <div className="mb-4">
                        <h3 className="text-lg font-semibold mb-2">Select Student</h3>
                        <select
                            className="p-2 border rounded"
                            onChange={handleStudentChange}
                            value={
                                isAllStudentsSelected ? "all" : selectedStudent?._id || ""
                            }
                        >
                            <option value="">Select a student</option>
                            <option value="all">All Students</option>
                            {allStudents.map((student) => (
                                <option key={student?._id} value={student?._id}>
                                    {student?.fullName} - Class {student?.class} {student?.section}{" "}
                                    (Roll No: {student?.rollNo})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
                        <select
                            className="p-2 border rounded"
                            onChange={handleExamChange}
                            multiple
                            value={selectedExams}
                        >
                            {examData?.map((exam) => (
                                <option key={exam?._id} value={exam?._id}>
                                    {exam.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                {tableData.length > 0 && (
                    <table className="min-w-full border-collapse border border-gray-300">
                        <thead>
                            <tr>
                                {tableData[0].map((header, index) => (
                                    <th key={index}
                                        className="border border-gray-300 p-2 bg-gray-200 text-left whitespace-nowrap">
                                        {header}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {tableData.slice(1).map((row, rowIndex) => (
                                <tr key={rowIndex} className={rowIndex % 2 === 0 ? "bg-gray-100" : ""}>
                                    {row.map((cell, cellIndex) => (
                                        <td key={cellIndex}
                                            className="border border-gray-300 p-2 whitespace-nowrap">
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {loading && (
                <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            )}
        </>
    );
};

export default Marks;


