import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useStateContext } from "../contexts/ContextProvider";import { usePDF } from "react-to-pdf";


const StudentResults = () => {
  const {currentColor} = useStateContext();
  const authToken = localStorage.getItem("token");
  const { toPDF, targetRef } = usePDF({ filename: "Student Results" });

  const [selectedExam, setSelectedExam] = useState("");
  const [examData, setExamData] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [studentMarks, setStudentMarks] = useState({});
  const [maximumMarks, setMaximumMarks] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [totalMarks, setTotalMarks] = useState("");

  const userData = JSON.parse(sessionStorage.getItem("response"));
  // console.log("userData P2 ", userData);
  const userId = userData ? userData._id : null;
  // console.log("userId-->", userId);

  const [schoolData, setSchoolData] = useState([]);

  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdminInfo",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      .then((response) => {
        const data = response.data.admin;

        // console.log("AdminInfo---ResultData--->", response.data.admin);
        setSchoolData(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);
  // console.log(schoolData);

  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/exam/getAllExams",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const classTeacher = JSON.parse(sessionStorage.response).class;

        const filteredData = response.data.examData.filter(
          (exam) => exam.className === classTeacher
        );
        setExamData(filteredData);
        // console.log("Exam-Data--->", examData);

        const maxMarks = {};
        const examSubjects = [];

        if (examData) {
          examData.forEach((exam) => {
            if (exam.examInfo) {
              exam.examInfo.forEach((item) => {
                maxMarks[item._id] = item.subjectTotalMarks;
                examSubjects.push(item.subjectName);
              });
            }
          });
        }

        setMaximumMarks(maxMarks);
        setSubjects(examSubjects);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [selectedExam]);

  const handleExamChange = (e) => {
    
    setSelectedExam(e.target.value);
  };

  
  useEffect(() => {
    
    if (selectedExam && userId) {
      axios
        .get(
          `https://eserver-i5sm.onrender.com/api/v1/results/getResults?examName=${selectedExam}&studentId=${userId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )
        .then((response) => {
          const data = response.data.data;
         
          setResultData(data);
          const newStudentMarks = {};

          // Iterate through the response data and populate newStudentMarks
          response.data.data.forEach((result) => {
            newStudentMarks[result.studentId] = {};
            result.subjects.forEach((subject) => {
              newStudentMarks[result.studentId][subject.subjectName] =
                subject.marks;
            });
          });
          setStudentMarks(newStudentMarks);
          
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }, [selectedExam, userId]);

  const calculateTotalMarksForStudent = (studentId) => {
    if (selectedExam) {
      const exam = examData.find((exam) => exam.examName === selectedExam);
      if (exam) {
        let total = 0;
        exam.examInfo.forEach((item) => {
          total = item.subjectTotalMarks;
        });
        const subjectsCount = exam.examInfo.length;
        return `${total} * ${subjectsCount} = ${total * subjectsCount}`;
      }
    }
    return 0;
  };

  const calculateMaximumMarksForStudent = () => {
    let totalMaxMarks = 0;
    if (maximumMarks) {
      Object.values(maximumMarks).forEach((subjectTotalMarks) => {
        totalMaxMarks += subjectTotalMarks;
      });
    }
   
    return totalMaxMarks;
  };

  const calculateMarksStudent = (studentId) => {
    if (!selectedExam) {
      return 0;
    }

    const studentMarkData = studentMarks[studentId];
    if (!studentMarkData) {
      return 0;
    }

    const filteredSubjects = subjects.filter((subject) => {
      const selectedExamData = examData.find(
        (exam) => exam.examName === selectedExam
      );
      return selectedExamData?.examInfo.some(
        (info) => info.subjectName === subject
      );
    });

    const totalMarks = filteredSubjects.reduce((acc, subject) => {
      return acc + (studentMarkData[subject] || 0);
    }, 0);

   
    return totalMarks;
  };

  const calculatePercentageForStudent = (studentId) => {
    if (!selectedExam) {
      return 0;
    }

    const studentMarkData = studentMarks[studentId];
    if (!studentMarkData) {
      return 0;
    }

    const totalMarks = Object.values(studentMarkData).reduce(
      (acc, subjectMark) => {
        return acc + (subjectMark || 0);
      },
      0
    );

    const totalMaxMarks = calculateMaximumMarksForStudent();
    const percentage = ((totalMarks / totalMaxMarks) * 100).toFixed(2);
    return `${percentage}%`;
  };

  const calculateSumOfSubjectTotalMarks = () => {
    if (selectedExam) {
      const exam = examData.find((exam) => exam.examName === selectedExam);
      if (exam) {
        let total = 0;
        exam.examInfo.forEach((item) => {
          const subjectMarks = studentMarks[item._id];
          if (subjectMarks) {
            total += subjectMarks[item.subjectName] || 0;
          }
        });
        return total;
      }
    }
    return 0;
  };
 

  const handleDownload = () => {
    toPDF();
    document.getElementById("studentResults");
  };
  const [academicYear, setAcademicYear] = useState("");

  const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
   
    return `${currentYear}-${nextYear}`;
  };

  useEffect(() => {
    const year = getCurrentAcademicYear();
    setAcademicYear(year);
  }, []);

 
  return (
    <div className="mt-12">
      <div className="mt-2 md:mt-10 w-[60%] mx-auto">
        <select
          className="ml-2 p-2 mb-2 border rounded-md w-full md:w-1/4  dark:text-white dark:bg-secondary-dark-bg text-gray-800 "
          onChange={handleExamChange}
          value={selectedExam}
        >
          <option value="">Select Exam</option>
          {examData.map((exam) => (
            <option key={exam?._id} value={exam?.examName}>
              {exam?.examName}
            </option>
          ))}
        </select>
        <button
          className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 ml-2 neu-btn border-2 "
          style={{ border: `2px solid ${currentColor} `, color: currentColor }}
          onClick={handleDownload}
        >
          Download Results
        </button>
      </div>

      <div
        ref={targetRef}
        className="  dark:text-white dark:bg-secondary-dark-bg text-gray-800 p-4 border border-gray-300 rounded-lg max-w-xl mx-auto bg-white shadow-md"
      >
        <div className="text-center mb-4">
          <h1 className="text-3xl font-semibold mt-2">
            {schoolData?.schoolName}
          </h1>
          <p className="text-sm text-gray-600">{schoolData?.address}</p>
        </div>
        <div className="flex justify-between">
          <div>
          </div>
          <div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">Report Card</p>
          <p className="text-md">Academic Year : {academicYear}</p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Student Details</h2>
          <p className="text-sm">Name:{userData?.fullName}</p>
          <p className="text-sm">Class:{userData?.class}</p>
          <p className="text-sm">Section: {userData?.section}</p>
          <p className="text-sm">Roll Number: {userData?.rollNo}</p>
        </div>
        <div className="mt-6  ">
          <h2 className="text-xl font-semibold mb-1">Results</h2>
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100 dark:text-white dark:bg-secondary-dark-bg text-gray-800  ">
              <tr
              style={{background : currentColor}} 
               >
                <th className="border border-gray-300 p-2">Subject</th>
                <th className="border border-gray-300 p-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {resultData?.map((item) => {
                  return item?.subjects.map((data) => (
                    <tr>
                      <td key={data?.subjectId} className="p-2">
                        {data?.subjectName}
                      </td>
                    </tr>
                  ));
                })}

                <td className="border border-gray-300 p-2">
                  {resultData.map((item) => {
                    return item.subjects.map((data) => (
                      <tr>
                        {" "}
                        <td key={data?.subjectId} className="p-2">
                          {data?.marks}
                        </td>
                      </tr>
                    ));
                  })}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          {selectedExam ? (
            <p className="font-semibold">
              Percentage: {calculatePercentageForStudent(userId)}
            </p>
          ) : (
            <p className="font-semibold">Percentage: </p>
          )}

          <p className="font-semibold">Grade: A</p>
        </div>

        <div className="mt-4">
          <div className="flex justify-between">
            <div>
              <p className="font-semibold">Remarks: Excellent performance.</p>
            </div>
            <div>
              <p className="font-semibold">Principal's Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentResults;