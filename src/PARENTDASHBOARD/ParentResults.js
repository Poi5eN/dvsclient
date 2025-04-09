import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useStateContext } from "../contexts/ContextProvider";
import { usePDF } from "react-to-pdf";


const ParentResults = () => {
  const authToken = localStorage.getItem("token");
  // const targetPDF = useRef();
  const { currentColor} = useStateContext();
  const { toPDF, targetRef } = usePDF({ filename: "Student Results" });

  const [selectedExam, setSelectedExam] = useState("");
  const [examData, setExamData] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [studentMarks, setStudentMarks] = useState({});
  const [maximumMarks, setMaximumMarks] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [totalMarks, setTotalMarks] = useState("");
  const [admindata, setAdminData] = useState({});
  const [loading, setLoading] = useState(false);

  const userData = JSON.parse(sessionStorage.getItem("response"));
  console.log("userData", userData);
  // const userId = userData ? userData._id : null;
  const [studentData, setStudentData] = useState({});
  const [classs, setClass] = useState("");
  const userId = studentData ? studentData._id : null;
  console.log("firstClassSets", classs);

  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/myKids`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        console.log("My KIds ", response.data);
        const data = response.data.data[0].class;
        const data1 = response.data.data[0];
        setStudentData(data1);
        console.log("ParentDashBoard--->", data);
        setClass(data);
        {
          console.log("classSet", classs);
        }
        // setLoading(false); // Set loading to false once data is received
      })
      .catch((error) => {
        console.error("Error fetching Student data:", error);
        // setLoading(false); // Set loading to false in case of an error
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/exam/getAllExams",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const classTeacher = JSON.parse(sessionStorage.response);

        const filteredData = response.data.examData.filter(
          (exam) => exam.className == classs
        );
        console.log("Data--->", filteredData);

        // const examData = response.data.examData;
        setExamData(filteredData);
        console.log("Exam-Data--->", examData);

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
  }, [selectedExam, classs]);

  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/getAdminInfo`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        // console.log("Data student ", response.data.admin.schoolName);
        setAdminData(response.data.admin);
        setLoading(false); // Set loading to false once data is received
      })
      .catch((error) => {
        console.error("Error fetching  data:", error);
        setLoading(false); // Set loading to false in case of an error
      });
  }, []);

  const handleExamChange = (e) => {
    console.log("chaya", e);
    setSelectedExam(e.target.value);
  };

  useEffect(() => {
    if (selectedExam && userId) {
      {
        console.log("first", selectedExam && userId);
      }
      axios
        .get(
          `https://dvsserver.onrender.com/api/v1/results/getResults?examName=${selectedExam}&studentId=${userId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )
        .then((response) => {
          const data = response.data.data; // Assuming 'data' is the property containing the array
          setResultData(data);
          console.log("ResultData--->", data);
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
          console.log(studentMarks);
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
    console.log(totalMaxMarks);
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

    console.log(totalMarks);
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
  console.log(examData);

  const handleDownload = () => {
    toPDF();
    document.getElementById("studentResults");
  };

  const [academicYear, setAcademicYear] = useState("");

  const getCurrentAcademicYear = () => {
    const currentYear = new Date().getFullYear();
    const nextYear = currentYear + 1;
    console.log(currentYear);
    console.log(nextYear);
    return `${currentYear}-${nextYear}`;
  };

  useEffect(() => {
    const year = getCurrentAcademicYear();
    setAcademicYear(year);
  }, []);

  return (
    <div className="mt-12">
      <div className="mt-2 md:mt-10">
        <select
          className="ml-2 p-2 mb-2 border rounded-md w-full md:w-1/4 "
          onChange={handleExamChange}
          value={selectedExam}
        >
          <option value="">Select Exam</option>
          {examData.map((exam) => (
            <option key={exam._id} value={exam.examName}>
              {exam.examName}
            </option>
          ))}
        </select>
        <button
          className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 neu-btn border-2 ml-12"
          style={{border:`2px solid ${currentColor} `,color:currentColor}}
          onClick={handleDownload}
        >
          Download Results
        </button>
      </div>

      {/* p-4 border border-gray-300 rounded-lg max-w-xl mx-auto bg-white shadow-md */}
      <div
        ref={targetRef}
        className="p-4 border border-gray-300 rounded-lg max-w-xl mx-auto bg-white shadow-md"
      >
        <div className="flex flex-wrap "></div>
        <div className="text-center mb-4">
          {/* <img src={school} alt="School Logo" className="w-16 h-16 mx-auto" /> */}
          <h1 className="text-3xl font-semibold mt-2">
            {admindata.schoolName}{" "}
          </h1>
          <p className="text-sm text-gray-600">{admindata.address}</p>
        </div>
        <div className="flex justify-between">
          <div>
            {/* <p className="text-sm text-gray-600">Sr. No: 12345</p> */}
          </div>
          <div>
            {/* <p className="text-sm text-gray-600">Date: Exam Date</p> */}
          </div>
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg font-semibold">Report Card</p>
          <p>Exam: {selectedExam}</p>
          <p className="text-md">Academic Year:{academicYear}</p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Student Details</h2>
          <p className="text-sm">Name:{studentData.fullName}</p>
          <p className="text-sm">Class:{studentData.class}</p>
          <p className="text-sm">Section: {studentData.section}</p>
          <p className="text-sm">Roll Number: {studentData.rollNo}</p>
        </div>
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-1">Results</h2>
          <table className="w-full border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 p-2">Subject</th>
                <th className="border border-gray-300 p-2">Marks</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {resultData.map((item) => {
                  return item.subjects.map((data) => (
                    <tr>
                      <td key={data.subjectId} className="p-2">
                        {data.subjectName}
                      </td>
                    </tr>
                  ));
                })}

                <td className="border border-gray-300 p-2">
                  {resultData.map((item) => {
                    return item.subjects.map((data) => (
                      <tr>
                        {" "}
                        <td key={data.subjectId} className="p-2">
                          {data.marks}
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

export default ParentResults;
