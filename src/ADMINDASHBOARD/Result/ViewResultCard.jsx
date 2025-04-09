import React, { useEffect, useState } from "react";
import {  useParams } from "react-router-dom";
// import school from '../../ShikshMitraWebsite/assets/student.png';
import axios from "axios";
import { usePDF } from "react-to-pdf";
import { useStateContext } from "../../contexts/ContextProvider";
import { Page, View } from "@react-pdf/renderer";


const ViewResultCard = () => {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const { toPDF, targetRef } = usePDF({ filename: "Student Admit Card" });
  const { email } = useParams();

  const [studentData, setStudentData] = useState({});

  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.allStudent[0];
        setStudentData(data);
      })
      .catch((error) => {
        console.error("Error fetching Student data:", error);
      });
  }, [email]);
  const userId = studentData._id;
  const [selectedExam, setSelectedExam] = useState("");
  const [examData, setExamData] = useState([]);
  const [resultData, setResultData] = useState([]);
  const [studentMarks, setStudentMarks] = useState({});
  const [maximumMarks, setMaximumMarks] = useState({});
  const [subjects, setSubjects] = useState([]);
  const [totalMarks, setTotalMarks] = useState("");

  const [schoolData, setSchoolData] = useState([]);
  console.log("first", maximumMarks);
  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAdminInfo",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      .then((response) => {
        const data = response.data.admin;

        setSchoolData(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  useEffect(() => {
    axios
      .get("https://dvsserver.onrender.com/api/v1/exam/getAllExams", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const examData = response.data.examData;
        setExamData(examData);

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
          const data = response.data.data;

          setResultData(data);

          const newStudentMarks = {};
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

  return (
    <>
      <div className=" w-full   flex items-center justify-center pt-10 ">
        <div className="   gap-2 sm:p-4 md:p-4 lg:p-4 p-2 pt-16  shadow-[rgba(0,0,_0,_0.25)_0px_25px_50px-12px]   overflow-y-auto">
          <div className="mt-12 ">
            <select
              className="p-2 mb-2 border rounded-md w-full"
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
              onClick={handleDownload}
              className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 "
              style={{
                border: `2px solid ${currentColor} `,
                color: currentColor,
              }}
            >
              Download
            </button>
          </div>
          <div ref={targetRef}>
            <Page size="A4">
              <View
                style={{
                  textAlign: "center",
                  marginLeft: 30,
                  marginRight: 30,
                  height: 150,
                  width: 150,
                }}
              >
                {/* <div className="p-4 border border-gray-300 rounded-lg max-w-xl mx-auto bg-white shadow-md">
                  <div className="text-center">
                    <h1 className="text-3xl font-semibold mt-2">
                      {schoolData.schoolName}
                    </h1>
                    <p className="text-sm text-gray-600">
                      {schoolData.address}
                    </p>
                  </div>
                  <div className="mt-4 text-center">
                    <h2 className="text-xl font-semibold">Report Card</h2>
                    <p>Exam: {selectedExam}</p>
                    <p>Academic Year: 2023-2024</p>
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center items-center">
                    {studentData.image && (
                      <img
                        src={studentData.image.url}
                        alt="Student Photo"
                        className="w-24 h-24 mr-6"
                      />
                    )}
                    <div className="mt-4 w-full md:w-1/2 text-center md:text-left">
                      <p className="font-semibold">Student Details</p>
                      <p>Name: {studentData.fullName}</p>
                      <p>Class:{studentData.class} Grade</p>
                      <p>Section: {studentData.section}</p>
                      <p>Roll Number: {studentData.rollNo}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="font-semibold"></p>

                    <table className="w-full border border-gray-300 mt-5">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(theader).map((key) => (
                            <th
                              key={key}
                              className="border border-gray-300 p-2"
                            >
                              {theader[key]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {resultData.map((item) => {
                          return item.subjects.map((data) => (
                            <tr key={data.subjectId}>
                              <td className="border border-gray-300 p-2">
                                {data.subjectName}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {data.marks}
                              </td>
                            </tr>
                          ));
                        })}
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
                        <p className="font-semibold">
                          Remarks: Excellent performance.
                        </p>
                      </div>
                      <div>
                        <p className="font-semibold">Principal's Signature</p>
                      </div>
                    </div>
                  </div>
                </div> */}
                <div className="max-w-5xl mx-auto bg-[#daf2c3] border-2 border-green-400 rounded-lg shadow-md">
                  <h1 className="text-5xl font-extrabold text-center text-gray-800 pt-6 mb-4 shadow-md">
                    <span className="drop-shadow-md">Student Report Card</span>
                  </h1>

                  <div className="  border p-4 px-5 pl-7">
                    <h2 className="text-center text-lg font-bold text-pink-500">
                      Annual Result Session : 2023-24
                    </h2>

                    <div className="flex mt-4">
                      <div className="w-full">
                        <table className="w-2/3 text-left text-sm">
                          <tbody>
                            <tr className="">
                              <td className="font-semibold py-1">
                                Student's Name:
                              </td>
                              <td className="py-1">
                                {studentData.fullName?.toUpperCase()}
                              </td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-1">
                                Father's Name:
                              </td>
                              <td className="py-1">
                                {studentData.fatherName?.toUpperCase()}
                              </td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-1">
                                Mother's Name:
                              </td>
                              <td className="py-1">
                                {studentData.motherName?.toUpperCase()}
                              </td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-1">Class:</td>
                              <td className="py-1">
                                {studentData.class}-{studentData.section}
                              </td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-1">Medium:</td>
                              <td className="py-1">{studentData.medium}</td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-1">
                                Scholar No.:
                              </td>
                              <td className="py-1">
                                {studentData.scholarNumber}
                              </td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-1">DOB:</td>
                              <td className="py-1">
                                {new Date(
                                  studentData.dateOfBirth
                                ).toLocaleDateString("en-US")}
                              </td>
                            </tr>
                            <tr>
                              <td className="font-semibold py-1">
                                DOB (in Words):
                              </td>
                              {/* <td className="py-1">{convertDateToWords(studentData.dateOfBirth)}</td> */}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="w-1/3 flex justify-center items-start">
                        {studentData.image && studentData.image.url ? (
                          <img
                            className="w-24 h-24 object-cover border border-gray-300 rounded-md"
                            src={studentData.image.url}
                            alt="Student"
                          />
                        ) : (
                          <img
                            className="w-24 h-24 object-cover border border-gray-300 rounded-md"
                            src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png"
                            alt="No Image Available"
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto px-6 pb-6">
                    <table className="w-full border-collapse text-center text-gray-800">
                      <thead>
                        <tr className="bg-[#b8e194] text-gray-800">
                          <th className="border border-green-500 py-2 px-2">
                            Subjects
                          </th>
                          <th
                            colSpan="3"
                            className="border border-green-500 py-2 px-2"
                          >
                            1st Term Exam
                          </th>
                          <th
                            colSpan="3"
                            className="border border-green-500 py-2 px-2"
                          >
                            2nd Term Exam
                          </th>
                          <th
                            colSpan="3"
                            className="border border-green-500 py-2 px-2"
                          >
                            Final Term Exam
                          </th>
                        </tr>
                        <tr className="bg-[#b8e194]">
                          <th className="border border-green-500 py-1 px-1"></th>
                          <th className="border border-green-500 py-1 px-1">
                            Total Marks
                          </th>
                          <th className="border border-green-500 py-1 px-1">
                            Obt Marks
                          </th>
                          <th className="border border-green-500 py-1 px-1">
                            Status
                          </th>
                          <th className="border border-green-500 py-1 px-1">
                            Total Marks
                          </th>
                          <th className="border border-green-500 py-1 px-1">
                            Obt Marks
                          </th>
                          <th className="border border-green-500 py-1 px-1">
                            Status
                          </th>
                          <th className="border border-green-500 py-1 px-1">
                            Total Marks
                          </th>
                          <th className="border border-green-500 py-1 px-1">
                            Obt Marks
                          </th>
                          <th className="border border-green-500 py-1 px-1">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {console.log("resultData", resultData)}
                        {resultData.map((item) => {
                          return item.subjects.map((data) => (
                            <tr key={data.subjectId}>
                              <td className="border border-green-400 py-2 px-2">
                                {data.subjectName}
                              </td>
                              <td className="border border-green-400">100</td>
                              <td className="border border-green-400">
                                {data.marks}
                              </td>
                              <td className="border border-green-400">
                                {data.marks >= 40 ? "Pass" : "Fail"}
                              </td>
                              {/* Repeat for other terms */}
                            </tr>
                          ));
                        })}
                      </tbody>
                    </table>
                  </div>
                  <div class="grid grid-cols-3 px-6 py-6 gap-4">
                    <div>
                      <p class="text-sm font-semibold">Incharge Sign:</p>
                      <div class="border-t border-gray-500 mt-4"></div>
                    </div>
                    <div>
                      <p class="text-sm font-semibold">
                        Principal/Headmaster Sign:
                      </p>
                      <div class="border-t border-gray-500 mt-4"></div>
                    </div>
                    <div>
                      <p class="text-sm font-semibold">Guardian Sign:</p>
                      <div class="border-t border-gray-500 mt-4"></div>
                    </div>
                  </div>
                </div>
              </View>
            </Page>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewResultCard;

// import React, { useEffect, useState, useRef } from "react";
// import { Link, useParams } from "react-router-dom";
// // import school from '../../ShikshMitraWebsite/assets/student.png';
// import axios from "axios";
// import { usePDF } from "react-to-pdf";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { Page, Text, View, doc } from "@react-pdf/renderer";
// import Cookies from "js-cookie";
// const authToken = Cookies.get("token");

// const theader = {
//   subject: "Subject",
//   marks: "Marks",
//   // day: "Day",
// };

// const ViewResultCard = () => {
//   const { currentColor } = useStateContext();
//   const { toPDF, targetRef } = usePDF({ filename: "Student Admit Card" });
//   const { email } = useParams();

//   const [studentData, setStudentData] = useState({});

//   useEffect(() => {
//     axios
//       .get(
//         `https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const data = response.data.allStudent[0];
//         setStudentData(data);
//       })
//       .catch((error) => {
//         console.error("Error fetching Student data:", error);
//       });
//   }, [email]);
//   const userId = studentData._id;
//   const [selectedExam, setSelectedExam] = useState("");
//   const [examData, setExamData] = useState([]);
//   const [resultData, setResultData] = useState([]);
//   const [studentMarks, setStudentMarks] = useState({});
//   const [maximumMarks, setMaximumMarks] = useState({});
//   const [subjects, setSubjects] = useState([]);
//   const [totalMarks, setTotalMarks] = useState("");

//   const [schoolData, setSchoolData] = useState([]);
// console.log("first",maximumMarks)
//   useEffect(() => {
//     axios
//       .get(
//         "https://dvsserver.onrender.com/api/v1/adminRoute/getAdminInfo",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )

//       .then((response) => {
//         const data = response.data.admin;

//         setSchoolData(data);
//       })
//       .catch((error) => {
//         console.log(error.message);
//       });
//   }, []);

//   useEffect(() => {
//     axios
//       .get("https://dvsserver.onrender.com/api/v1/exam/getAllExams", {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const examData = response.data.examData;
//         setExamData(examData);

//         const maxMarks = {};
//         const examSubjects = [];

//         if (examData) {
//           examData.forEach((exam) => {
//             if (exam.examInfo) {
//               exam.examInfo.forEach((item) => {
//                 maxMarks[item._id] = item.subjectTotalMarks;
//                 examSubjects.push(item.subjectName);
//               });
//             }
//           });
//         }

//         setMaximumMarks(maxMarks);
//         setSubjects(examSubjects);
//       })
//       .catch((error) => {
//         console.log(error.message);
//       });
//   }, [selectedExam]);

//   const handleExamChange = (e) => {
//     setSelectedExam(e.target.value);
//   };

//   useEffect(() => {
//     if (selectedExam && userId) {
//       {
//         console.log("first", selectedExam && userId);
//       }
//       axios
//         .get(
//           `https://dvsserver.onrender.com/api/v1/results/getResults?examName=${selectedExam}&studentId=${userId}`,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           const data = response.data.data;

//           setResultData(data);

//           const newStudentMarks = {};
//           response.data.data.forEach((result) => {
//             newStudentMarks[result.studentId] = {};
//             result.subjects.forEach((subject) => {
//               newStudentMarks[result.studentId][subject.subjectName] =
//                 subject.marks;
//             });
//           });
//           setStudentMarks(newStudentMarks);
//         })
//         .catch((error) => {
//           console.log(error.message);
//         });
//     }
//   }, [selectedExam, userId]);

//   const calculateTotalMarksForStudent = (studentId) => {
//     if (selectedExam) {
//       const exam = examData.find((exam) => exam.examName === selectedExam);
//       if (exam) {
//         let total = 0;
//         exam.examInfo.forEach((item) => {
//           total = item.subjectTotalMarks;
//         });
//         const subjectsCount = exam.examInfo.length;
//         return `${total} * ${subjectsCount} = ${total * subjectsCount}`;
//       }
//     }
//     return 0;
//   };

//   const calculateMaximumMarksForStudent = () => {
//     let totalMaxMarks = 0;
//     if (maximumMarks) {
//       Object.values(maximumMarks).forEach((subjectTotalMarks) => {
//         totalMaxMarks += subjectTotalMarks;
//       });
//     }

//     return totalMaxMarks;
//   };

//   const calculateMarksStudent = (studentId) => {
//     if (!selectedExam) {
//       return 0;
//     }

//     const studentMarkData = studentMarks[studentId];
//     if (!studentMarkData) {
//       return 0;
//     }

//     const filteredSubjects = subjects.filter((subject) => {
//       const selectedExamData = examData.find(
//         (exam) => exam.examName === selectedExam
//       );
//       return selectedExamData?.examInfo.some(
//         (info) => info.subjectName === subject
//       );
//     });

//     const totalMarks = filteredSubjects.reduce((acc, subject) => {
//       return acc + (studentMarkData[subject] || 0);
//     }, 0);

//     return totalMarks;
//   };

//   const calculatePercentageForStudent = (studentId) => {
//     if (!selectedExam) {
//       return 0;
//     }

//     const studentMarkData = studentMarks[studentId];
//     if (!studentMarkData) {
//       return 0;
//     }

//     const totalMarks = Object.values(studentMarkData).reduce(
//       (acc, subjectMark) => {
//         return acc + (subjectMark || 0);
//       },
//       0
//     );

//     const totalMaxMarks = calculateMaximumMarksForStudent();
//     const percentage = ((totalMarks / totalMaxMarks) * 100).toFixed(2);
//     return `${percentage}%`;
//   };

//   const calculateSumOfSubjectTotalMarks = () => {
//     if (selectedExam) {
//       const exam = examData.find((exam) => exam.examName === selectedExam);
//       if (exam) {
//         let total = 0;
//         exam.examInfo.forEach((item) => {
//           const subjectMarks = studentMarks[item._id];
//           if (subjectMarks) {
//             total += subjectMarks[item.subjectName] || 0;
//           }
//         });
//         return total;
//       }
//     }
//     return 0;
//   };

//   const handleDownload = () => {
//     toPDF();
//     document.getElementById("studentResults");
//   };

//   return (
//     <>
//       <div className=" w-full   flex items-center justify-center pt-10 ">
//         <div className="   gap-2 sm:p-4 md:p-4 lg:p-4 p-2 pt-16  shadow-[rgba(0,0,_0,_0.25)_0px_25px_50px-12px]   overflow-y-auto">
//           <div className="mt-12 ">
//             <select
//               className="p-2 mb-2 border rounded-md w-full"
//               onChange={handleExamChange}
//               value={selectedExam}
//             >
//               <option value="">Select Exam</option>
//               {examData.map((exam) => (
//                 <option key={exam._id} value={exam.examName}>
//                   {exam.examName}
//                 </option>
//               ))}
//             </select>

//             <button
//               onClick={handleDownload}
//               className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 "
//               style={{
//                 border: `2px solid ${currentColor} `,
//                 color: currentColor,
//               }}
//             >
//               Download
//             </button>
//           </div>
//           <div ref={targetRef}>
//             <Page size="A4">
//               <View
//                 style={{
//                   textAlign: "center",
//                   marginLeft: 30,
//                   marginRight: 30,
//                   height: 150,
//                   width: 150,
//                 }}
//               >
//                 <div className="p-4 border border-gray-300 rounded-lg max-w-xl mx-auto bg-white shadow-md">
//                   <div className="text-center">
//                     <h1 className="text-3xl font-semibold mt-2">
//                       {schoolData.schoolName}
//                     </h1>
//                     <p className="text-sm text-gray-600">
//                       {schoolData.address}
//                     </p>
//                   </div>
//                   <div className="mt-4 text-center">
//                     <h2 className="text-xl font-semibold">Report Card</h2>
//                     <p>Exam: {selectedExam}</p>
//                     <p>Academic Year: 2023-2024</p>
//                   </div>
//                   <div className="mt-8 flex flex-wrap justify-center items-center">
//                     {studentData.image && (
//                       <img
//                         src={studentData.image.url}
//                         alt="Student Photo"
//                         className="w-24 h-24 mr-6"
//                       />
//                     )}
//                     <div className="mt-4 w-full md:w-1/2 text-center md:text-left">
//                       <p className="font-semibold">Student Details</p>
//                       <p>Name: {studentData.fullName}</p>
//                       <p>Class:{studentData.class} Grade</p>
//                       <p>Section: {studentData.section}</p>
//                       <p>Roll Number: {studentData.rollNo}</p>
//                     </div>
//                   </div>
//                   <div className="mt-6">
//                     <p className="font-semibold"></p>

//                     <table className="w-full border border-gray-300 mt-5">
//                       <thead className="bg-gray-100">
//                         <tr>
//                           {Object.keys(theader).map((key) => (
//                             <th
//                               key={key}
//                               className="border border-gray-300 p-2"
//                             >
//                               {theader[key]}
//                             </th>
//                           ))}
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {resultData.map((item) => {
//                           return item.subjects.map((data) => (
//                             <tr key={data.subjectId}>
//                               <td className="border border-gray-300 p-2">
//                                 {data.subjectName}
//                               </td>
//                               <td className="border border-gray-300 p-2">
//                                 {data.marks}
//                               </td>
//                             </tr>
//                           ));
//                         })}
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="mt-4">
//                     {selectedExam ? (
//                       <p className="font-semibold">
//                         Percentage: {calculatePercentageForStudent(userId)}
//                       </p>
//                     ) : (
//                       <p className="font-semibold">Percentage: </p>
//                     )}

//                     <p className="font-semibold">Grade: A</p>
//                   </div>

//                   <div className="mt-4">
//                     <div className="flex justify-between">
//                       <div>
//                         <p className="font-semibold">
//                           Remarks: Excellent performance.
//                         </p>
//                       </div>
//                       <div>
//                         <p className="font-semibold">Principal's Signature</p>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </View>
//             </Page>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// };

// export default ViewResultCard;
