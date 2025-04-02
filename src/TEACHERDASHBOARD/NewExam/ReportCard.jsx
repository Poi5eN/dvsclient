import React, { useEffect, useRef, useState, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../contexts/ContextProvider";
import { MdDownload } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const calculateGrade = (percentage) => {
  if (percentage >= 90) return "A+";
  if (percentage >= 80) return "A";
  if (percentage >= 70) return "B+";
  if (percentage >= 60) return "B";
  if (percentage >= 50) return "C";
  return "F";
};

const ReportCard = () => {
  const [allStudents, setAllStudents] = useState([]);

  const [selectedStudent, setSelectedStudent] = useState(null);
 
  const [marks, setMarks] = useState([]);
  const [examData, setExamData] = useState([]);
  const [selectedExams, setSelectedExams] = useState([]);

  const [loading, setLoading] = useState(false);
  const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);

  const schoolImage = sessionStorage.getItem("schoolImage");
  const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

  const { currentColor } = useStateContext();
  const componentPDF = useRef();
  const authToken = localStorage.getItem("token");

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: `${
      isAllStudentsSelected
        ? "All_Students_Report_Cards"
        : selectedStudent?.fullName || "Student"
    }_Report_Card`,
    onAfterPrint: () => toast.success("Downloaded successfully"),
    pageStyle: "@page { size: A4; margin: 1cm; }", // Add this line for A4 size and margins
  });

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

  // Function to calculate overall result data
  const calculateOverallData = useCallback((filteredMarks) => {
    if (!filteredMarks || filteredMarks.length === 0) {
      return {};
    }

    const overall = filteredMarks.reduce(
      (acc, curr) => {
        if (curr && curr.marks) {
          curr.marks.forEach((mark) => {
            acc.totalMarks = (acc.totalMarks || 0) + mark.marks;
            acc.totalPossibleMarks =
              (acc.totalPossibleMarks || 0) + mark.totalMarks;
          });
        }

        return acc;
      },
      { totalMarks: 0, totalPossibleMarks: 0 }
    );

    const percentage =
      overall.totalPossibleMarks > 0
        ? (overall.totalMarks / overall.totalPossibleMarks) * 100
        : 0;
    const grade = calculateGrade(percentage);

    return {
      totalMarks: overall.totalMarks,
      totalPossibleMarks: overall.totalPossibleMarks,
      percentage,
      grade,
      isPassed: percentage >= 35,
    };
  }, []);

  useEffect(() => {
    if (!selectedStudent || marks.length === 0) {
     
 
  
      return;
    }

    if (isAllStudentsSelected) {

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
        const existingMark = acc?.find(
          (m) => m?.subjectName === mark?.subjectName
        );
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

   

    const lastSelectedExamId = selectedExams[selectedExams.length - 1];
    const lastSelectedExamMarks = filteredMarks.find(
      (mark) => mark.examId === lastSelectedExamId
    );

    const coScholasticData = lastSelectedExamMarks
      ? lastSelectedExamMarks.coScholasticMarks
      : [];

    const updatedExamNames = examData
      .filter((ex) => selectedExams.includes(ex._id))
      .map((ex) => ex.name);
 
  }, [
    marks,
    selectedStudent,
    selectedExams,
    isAllStudentsSelected,
    calculateOverallData,
    examData,
  ]);

  const handleCheckboxChange = (exam) => {
    setSelectedExams((prevSelected) => {
      const isExamSelected = prevSelected.includes(exam._id);
      let updatedSelectedExams;

      if (isExamSelected) {
        updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
      } else {
        updatedSelectedExams = [...prevSelected, exam._id];
      }
      return updatedSelectedExams;
    });
  };

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

  const renderReportCard = (student) => {
    const studentMarks = marks.filter(
      (mark) => mark?.studentId?._id === student?._id
    );
    const filteredMarks = studentMarks.filter((mark) =>
      selectedExams.includes(mark.examId)
    );

    const combinedResults = filteredMarks.reduce((acc, curr) => {
      curr.marks.forEach((mark) => {
        const existingMark = acc?.find(
          (m) => m?.subjectName === mark?.subjectName
        );
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

    const examResultsData = { marks: combinedResults };

    const lastSelectedExamId = selectedExams[selectedExams.length - 1];
    const lastSelectedExamMarks = filteredMarks.find(
      (mark) => mark.examId === lastSelectedExamId
    );

    const coScholasticData = lastSelectedExamMarks
      ? lastSelectedExamMarks.coScholasticMarks
      : [];

    const overAll = calculateOverallData(filteredMarks);

    const term1Exams = selectedExams.slice(0, 3);
    const term2Exams = selectedExams.slice(3, 6);
    const showTerm2 = selectedExams.length >= 4;
    // Calculate overall totals
    let overallTotalMarks = 0;
    let overallTotalPossibleMarks = 0;
    examResultsData?.marks?.forEach((subject) => {
      const subjectTotalMarks = subject?.examResults?.reduce(
        (sum, result) => sum + (result?.marks || 0),
        0
      );
      const subjectTotalPossible = subject?.examResults?.reduce(
        (sum, result) => sum + (result?.totalMarks || 0),
        0
      );
      overallTotalMarks += subjectTotalMarks;
      overallTotalPossibleMarks += subjectTotalPossible;
    });
    const overallPercentage =
      overallTotalPossibleMarks > 0
        ? (overallTotalMarks / overallTotalPossibleMarks) * 100
        : 0;
    const overallGrade = calculateGrade(overallPercentage);

    // Calculate overall term totals
    let term1OverallTotalMarks = 0;
    let term1OverallTotalPossibleMarks = 0;
    term1Exams.forEach((examId) => {
      examResultsData?.marks?.forEach((subject) => {
        const examResult = subject.examResults.find((res) => res.examId === examId);
        if (examResult) {
          term1OverallTotalMarks += examResult.marks;
          term1OverallTotalPossibleMarks += examResult.totalMarks;
        }
      });
    });
    let term2OverallTotalMarks = 0;
    let term2OverallTotalPossibleMarks = 0;
    term2Exams.forEach((examId) => {
      examResultsData?.marks?.forEach((subject) => {
        const examResult = subject.examResults.find((res) => res.examId === examId);
        if (examResult) {
          term2OverallTotalMarks += examResult.marks;
          term2OverallTotalPossibleMarks += examResult.totalMarks;
        }
      });
    });
    return (
      <div
        className="flex justify-center items-center p-2 sm:p-3"
        key={student?._id}
        style={{ width: "210mm", height: "297mm", margin: "0 auto" }} // Ensure A4 size
      >
        <div className="w-[190mm] sm:w-[210mm] mx-auto">
          <div className="bg-white border-2 border-black py-1 sm:py-2  px-1 sm:px-3">
            <div className="  px-1 py-2 sm:py-8">
              <div className="flex items-center justify-between mb-2 sm:mb-6 flex-wrap">
                <div className="h-[50px] w-[50px] sm:h-[70px] sm:w-[70px]">
                  <img
                    src={schoolImage}
                    alt="School Logo"
                    className="w-full object-contain"
                  />
                </div>
                <div className="text-center flex-1">
                  <h1 className="text-red-600 font-bold text-xl sm:text-3xl">
                    {SchoolDetails?.schoolName}
                  </h1>
                  <p className="text-blue-600 text-sm sm:text-xl">
                    {SchoolDetails?.address}
                  </p>
                  <p className="text-green-600 text-xs sm:text-sm font-bold">
                    {SchoolDetails?.email}
                  </p>
                  <p className="text-green-600 text-xs sm:text-sm font-bold">
                    {SchoolDetails?.contact}
                  </p>
                </div>
                <div className="w-[50px] sm:w-[70px]"></div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 border p-1 sm:p-2 mb-1">
                <div>
                  <table className=" text-xs sm:text-sm">
                    <tbody>
                      <tr>
                        <td className="font-semibold py-1 whitespace-nowrap">
                          Admission No. :
                        </td>
                        <td className="whitespace-nowrap to-blue-700 font-semibold">
                          {student?.admissionNumber || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1 whitespace-nowrap">
                          Student's Name :
                        </td>
                        <td className="whitespace-nowrap">
                          {student?.fullName || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1 whitespace-nowrap">
                          Father's Name :
                        </td>
                        <td className="whitespace-nowrap">
                          {student?.fatherName || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1 whitespace-nowrap">
                          Mother's Name :
                        </td>
                        <td className="whitespace-nowrap">
                          {student?.motherName || "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div>
                  <table className="ml-3 text-xs sm:text-sm">
                    <tbody>
                      <tr>
                        <td className="font-semibold py-1 whitespace-nowrap">
                          Class :
                        </td>
                        <td>
                          {student?.class || "N/A"}-
                          {student?.section || ""}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1 whitespace-nowrap">
                          Roll No. :
                        </td>
                        <td className="whitespace-nowrap">
                          {student?.rollNo || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1">DOB :</td>
                        <td>
                          {student?.dateOfBirth
                            ? new Date(student.dateOfBirth).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                }
                              )
                            : "N/A"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end ">
                  <img
                    src={
                      student?.image?.url ||
                      "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                    }
                    alt="Student"
                    className="w-20 h-20 sm:w-24 sm:h-24 object-cover border border-gray-300 "
                  />
                </div>
              </div>

              <table className="w-full mb-1 text-xs sm:text-sm border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th></th>
                    <th
                      colSpan="4"
                      className="border border-l border-gray-300 p-1 sm:p-2 text-center"
                    >
                      TERM-I
                    </th>
                    {showTerm2 && (
                      <th
                        colSpan="4"
                        className="border border-gray-300 p-1 sm:p-2 text-center"
                      >
                        TERM-II
                      </th>
                    )}
                    <th
                      colSpan={term1Exams.length}
                      className="border border-gray-300 p-1 sm:p-2 text-center"
                    >
                      GRAND TOTAL
                    </th>
                  </tr>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-1 sm:p-2">
                      SUBJECTS
                    </th>
                    {term1Exams.map((examId) => {
                      const exam = examData.find((ex) => ex._id === examId);
                      return (
                        exam && (
                          <th
                            key={examId}
                            className="border border-gray-300 p-1 sm:p-2"
                          >
                            {exam.name}
                          </th>
                        )
                      );
                    })}
                    {term1Exams.length > 0 ? (
                      <th className="border border-gray-300 p-1 sm:p-2">
                        TOTAL
                      </th>
                    ) : null}
                    {showTerm2 &&
                      term2Exams.map((examId) => {
                        const exam = examData.find((ex) => ex._id === examId);
                        return (
                          exam && (
                            <th
                              key={examId}
                              className="border border-gray-300 p-1 sm:p-2"
                            >
                              {exam.name}
                            </th>
                          )
                        );
                      })}
                    {showTerm2 && term2Exams.length > 0 ? (
                      <th className="border border-gray-300 p-1 sm:p-2">
                        TOTAL
                      </th>
                    ) : null}
                    <th className="border border-gray-300 p-1 sm:p-2">
                      TOTAL
                    </th>
                    <th className="border border-gray-300 p-1 sm:p-2">%</th>
                    <th className="border border-gray-300 p-1 sm:p-2">
                      GRADE
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {examResultsData?.marks?.map((subject, index) => {
                    let term1TotalMarks = 0;
                    let term1TotalPossibleMarks = 0;
                    term1Exams.forEach((examId) => {
                      const examResult = subject.examResults.find(
                        (res) => res.examId === examId
                      );
                      if (examResult) {
                        term1TotalMarks += examResult.marks;
                        term1TotalPossibleMarks += examResult.totalMarks;
                      }
                    });
                    let term2TotalMarks = 0;
                    let term2TotalPossibleMarks = 0;
                    term2Exams.forEach((examId) => {
                      const examResult = subject.examResults.find(
                        (res) => res.examId === examId
                      );
                      if (examResult) {
                        term2TotalMarks += examResult.marks;
                        term2TotalPossibleMarks += examResult.totalMarks;
                      }
                    });
                    const totalMarks = subject?.examResults?.reduce(
                      (sum, result) => sum + (result?.marks || 0),
                      0
                    );
                    const totalPossible = subject?.examResults?.reduce(
                      (sum, result) => sum + (result?.totalMarks || 0),
                      0
                    );
                    const percentage =
                      totalPossible > 0
                        ? (totalMarks / totalPossible) * 100
                        : 0;

                    return (
                      <tr
                        key={index}
                        className={index % 2 === 0 ? "bg-gray-100" : ""}
                      >
                        <td className="border border-gray-300 p-1 sm:p-2">
                          {subject?.subjectName}
                        </td>
                        {term1Exams.map((examId) => {
                          const examResult = subject?.examResults?.find(
                            (result) => result.examId === examId
                          );
                          return (
                            <td
                              key={examId}
                              className="border border-gray-300 p-1 sm:p-2 text-center"
                            >
                              {examResult ? `${examResult?.marks} ` : "-/-"}
                            </td>
                          );
                        })}
                        {term1Exams.length > 0 ? (
                          <td className="border border-gray-300 p-1 sm:p-2 text-center">
                            {term1TotalMarks} / {term1TotalPossibleMarks}
                          </td>
                        ) : null}
                        {showTerm2 &&
                          term2Exams.map((examId) => {
                            const examResult = subject?.examResults?.find(
                              (result) => result.examId === examId
                            );
                            return (
                              <td
                                key={examId}
                                className="border border-gray-300 p-1 sm:p-2 text-center"
                              >
                                {examResult ? `${examResult?.marks} ` : "-/-"}
                              </td>
                            );
                          })}
                        {showTerm2 && term2Exams.length > 0 ? (
                          <td className="border border-gray-300 p-1 sm:p-2 text-center">
                            {term2TotalMarks} / {term2TotalPossibleMarks}
                          </td>
                        ) : null}
                        <td className="border border-gray-300 p-1 sm:p-2 text-center">
                          {totalMarks}
                        </td>
                        <td className="border border-gray-300 p-1 sm:p-2 text-center">
                          {percentage?.toFixed(2)}%
                        </td>
                        <td className="border border-gray-300 p-1 sm:p-2 text-center">
                          {calculateGrade(percentage)}
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="font-semibold bg-gray-200">
                    <td className="border border-gray-300 p-1 sm:p-2">
                      Obtain Marks
                    </td>
                    {term1Exams.length > 0 ? (
                      <td
                        className="border border-gray-300 p-1 sm:p-2 text-center"
                        colSpan={term1Exams.length}
                      >
                        {term1OverallTotalMarks}/{term1OverallTotalPossibleMarks}
                      </td>
                    ) : null}
                    {term1Exams.length > 0 ? (
                      <td className="border border-gray-300 p-1 sm:p-2 text-center">
                        {term1OverallTotalMarks}/{term1OverallTotalPossibleMarks}
                      </td>
                    ) : null}
                    {showTerm2 && term2Exams.length > 0 ? (
                      <td
                        className="border border-gray-300 p-1 sm:p-2 text-center"
                        colSpan={term2Exams.length}
                      >
                        {term2OverallTotalMarks}/{term2OverallTotalPossibleMarks}
                      </td>
                    ) : null}
                    {showTerm2 && term2Exams.length > 0 ? (
                      <td className="border border-gray-300 p-1 sm:p-2 text-center">
                        {term2OverallTotalMarks}/{term2OverallTotalPossibleMarks}
                      </td>
                    ) : null}
                    <td className="border border-gray-300 p-1 sm:p-2 text-center">
                      {overallTotalMarks}
                    </td>
                    <td className="border border-gray-300 p-1 sm:p-2 text-center">
                      {overallPercentage.toFixed(2)}%
                    </td>
                    <td className="border border-gray-300 p-1 sm:p-2 text-center">
                      {overallGrade}
                    </td>
                  </tr>
                </tbody>
              </table>
              <table className="w-full mb-1 text-xs sm:text-sm border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border border-gray-300 p-1">Activity</th>
                    <th className="border border-gray-300 p-1">Grade</th>
                  </tr>
                </thead>
                <tbody>
                  {coScholasticData?.map((activity, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-1">
                        {activity?.activityName}
                      </td>
                      <td className="border border-gray-300 p-1 text-center">
                        {activity?.grade}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {Object.keys(overAll).length > 0 && (
                <div className="mt-2 text-xs sm:text-sm">
                  <p>
                    Total Marks :{" "}
                    <b>
                      {overAll.totalMarks}/{overAll.totalPossibleMarks}
                    </b>
                  </p>
                  <p>
                    Percentage :<b>{overAll.percentage?.toFixed(2)}%</b>
                  </p>
                  <p>
                    Grade : <b>{overAll.grade}</b>
                  </p>
                  <p>
                    Result: <b>{overAll.isPassed ? "Passed" : "Failed"}</b>
                  </p>
                </div>
              )}
              <div className="mt-1 sm:mt-4">
                <div>
                  <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
                  <p className="text-xs sm:text-sm">
                    Excellent performance. Keep up the good work!
                  </p>
                </div>
              </div>
              <div className="mt-2 sm:mt-8 flex justify-between text-xs sm:text-sm">
                <div>
                  <div className="mb-4 sm:mb-8"></div>
                  <div>Class Teacher's Signature</div>
                </div>
                <div>
                  <div className="mb-4 sm:mb-8"></div>
                  <div>Principal's Signature</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
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
          <p className="text-lg">Report Card</p>
          <MdDownload
            onClick={generatePDF}
            className="text-2xl cursor-pointer"
          />
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-2">
          <div className="mb-4 w-full sm:w-auto">
            <h3 className="text-lg font-semibold mb-2">Select Student</h3>
            <select
              className="p-2 border rounded w-full sm:w-auto"
              onChange={handleStudentChange}
              value={isAllStudentsSelected ? "all" : selectedStudent?._id || ""}
            >
              <option value="">Select a student</option>
              <option value="all">All Students</option>
              {allStudents.map((student) => (
                <option key={student?._id} value={student?._id}>
                  {student?.fullName} - Class {student?.class}{" "}
                  {student?.section} (Roll No: {student?.rollNo})
                </option>
              ))}
            </select>
          </div>
          <div className=" w-full sm:w-auto">
            <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
            <div className="border-2 p-2 overflow-x-auto">
              <form className="flex gap-2  items-center justify-center flex-wrap">
                {examData?.map((exam) => (
                  <div key={exam._id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={exam?._id}
                      value={exam?._id}
                      checked={selectedExams.includes(exam?._id)}
                      onChange={() => handleCheckboxChange(exam)}
                      className="mr-2"
                    />
                    <label htmlFor={exam._id} className="text-xs sm:text-sm">
                      {exam.name}
                    </label>
                  </div>
                ))}
              </form>
            </div>
          </div>
        </div>
      </div>

      <div ref={componentPDF} className="">
        {isAllStudentsSelected ? (
          allStudents.map((student) => (
            <div key={student._id} style={{ pageBreakAfter: "always" }}>
              {renderReportCard(student)}
            </div>
          ))
        ) : (
          selectedStudent && renderReportCard(selectedStudent)
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

export default ReportCard;

