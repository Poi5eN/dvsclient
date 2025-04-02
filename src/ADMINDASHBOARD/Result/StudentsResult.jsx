import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../contexts/ContextProvider";
import { MdDownload } from "react-icons/md";
import axios from "axios";
import { toast } from "react-toastify";

const StudentsResult = () => {
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
  const [classes, setClasses] = useState([]);
    const schoolImage = sessionStorage.getItem("schoolImage");
    const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));
  
    const { currentColor } = useStateContext();
    const componentPDF = useRef();
    const authToken = localStorage.getItem("token");
  
    const generatePDF = useReactToPrint({
      content: () => componentPDF.current,
      documentTitle: `${selectedStudent?.fullName || "Student"}_Report_Card`,
      onAfterPrint: () => toast.success("Downloaded successfully"),
    });
  
  
    const getAllStudents = async () => {
      setLoading(true);
      try {
          const response = await axios.get(
              "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
              {
                  withCredentials: true,
                  headers: {
                      Authorization: `Bearer ${authToken}`,
                  },
              }
          );
          setLoading(false);
          // setAllStudents(response.data.allStudent);
          setAllStudents(response.data.allStudent || []);
      } catch (error) {
          console.error("Error fetching exams:", error);
          setLoading(false);
      }
  };

  useEffect(() => {
    axios
        .get(
            `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
            {
                withCredentials: true,
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        )
        .then((response) => {
            //remove duplicate class name
            console.log("response.data.classList",response.data.classList)
            const uniqueClasses = response.data.classList.reduce((acc, curr) => {
                const classExist = acc.find(
                    (x) => x.className === curr.className && x.sections === curr.sections
                );
                if (!classExist) {
                    acc.push(curr);
                }
                return acc;
            }, []);
            setClasses(uniqueClasses);

        })
        .catch((error) => {
            console.error("Error fetching data:", error);
        });
}, []);



    const getResult = async () => {
      setLoading(true)
      try {
        const response = await axios.get(
          
          "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        setMarks(response.data.marks);
      } catch (error) {
        console.error("Error fetching marks:", error);
      }finally{
        setLoading(false)
      }
    };
  
    useEffect(() => {
      getResult();
      getAllStudents()
    }, []);
  
    useEffect(() => {
      const fetchExams = async () => {
        try {
          const response = await axios.get(
            "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          setExamData(response.data.exams);
        } catch (error) {
          console.error("Error fetching exams:", error);
        }
      };
      fetchExams();
    }, [authToken]);
  

    useEffect(() => {
      axios
          .get(
              `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
              {
                  withCredentials: true,
                  headers: {
                      Authorization: `Bearer ${authToken}`,
                  },
              }
          )
          .then((response) => {
              //remove duplicate class name
              const uniqueClasses = response.data.classList.reduce((acc, curr) => {
                  const classExist = acc.find(
                      (x) => x.className === curr.className && x.sections === curr.sections
                  );
                  if (!classExist) {
                      acc.push(curr);
                  }
                  return acc;
              }, []);
              setClasses(uniqueClasses);
          })
          .catch((error) => {
              console.error("Error fetching data:", error);
          });
  }, []);
  
    useEffect(() => {
      if (!selectedStudent || marks.length === 0) {
          setExamResults([]);
          setCoScholasticMarks([]);
          setOverallData({});
          return;
      }
  
      const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
      const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));
  
  
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
  
       // Update coScholastic marks to only show last selected
       const lastSelectedExamId = selectedExams[selectedExams.length - 1];
       const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);
     
       const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
       setCoScholasticMarks(coScholasticData);
  
       //set overall data
        const overAll = lastSelectedExamMarks ? 
          {totalMarks :lastSelectedExamMarks.totalMarks, 
          percentage: lastSelectedExamMarks.percentage,
          isPassed: lastSelectedExamMarks.isPassed,
          grade: lastSelectedExamMarks.grade}
        :{}
        setOverallData(overAll);

       // Update exam names with newly selected exam
       const updatedExamNames = examData
       .filter((ex) => selectedExams.includes(ex._id))
       .map((ex) => ex.name);
      setExamName(updatedExamNames);
    }, [marks, selectedStudent,selectedExams]);
  
  
  
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
  
    const calculateGrade = (percentage) => {
      if (percentage >= 90) return "A+";
      if (percentage >= 80) return "A";
      if (percentage >= 70) return "B+";
      if (percentage >= 60) return "B";
      if (percentage >= 50) return "C";
      return "F";
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
          <div className="w-full flex">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Select Student</h3>
              <select
                className="p-2 border rounded"
                onChange={(e) => {
                  const selected = allStudents.find(
                    (student) => student?._id === e.target.value
                  );
                  setSelectedStudent(selected);
                }}
              >
                <option value="">Select a student</option>
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
              <form className="flex gap-4 items-center justify-center border-2 p-2">
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
                    <label htmlFor={exam._id}>{exam.name}</label>
                  </div>
                ))}
              </form>
            </div>
          </div>
        </div>
  
        <div className="w-full flex justify-center">
          <div className="a4">
            <div className="content border-2 m-1">
              <div ref={componentPDF} className="p-12">
                <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-[70px] w-[70px]">
                      <img
                        src={schoolImage}
                        alt="School Logo"
                        className="w-full object-contain"
                      />
                    </div>
                    <div className="text-center">
                      <h1 className="text-red-600 font-bold text-3xl">
                        {SchoolDetails?.schoolName}
                      </h1>
                      <p className="text-blue-600 text-xl">
                        {SchoolDetails?.address}
                      </p>
                      <p className="text-green-600 text-sm font-bold">
                        {SchoolDetails?.email}
                      </p>
                      <p className="text-green-600 text-sm font-bold">
                        {SchoolDetails?.contact}
                      </p>
                    </div>
                    <div className="w-[70px]"></div>
                  </div>
  
                  <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
                    <div>
                      <table className=" text-sm">
                        <tbody>
                          <tr>
                            <td className="font-semibold py-1 whitespace-nowrap">
                              Admission No. :
                            </td>
                            <td className="whitespace-nowrap to-blue-700 font-semibold">
                              {selectedStudent?.admissionNumber || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-semibold py-1 whitespace-nowrap">
                              Student's Name :
                            </td>
                            <td className="whitespace-nowrap">
                              {selectedStudent?.fullName || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-semibold py-1 whitespace-nowrap">
                              Father's Name :
                            </td>
                            <td className="whitespace-nowrap">
                              {selectedStudent?.fatherName || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-semibold py-1 whitespace-nowrap">
                              Mother's Name :
                            </td>
                            <td className="whitespace-nowrap">
                              {selectedStudent?.motherName || "N/A"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
  
                    <div>
                      <table className="ml-3 text-sm">
                        <tbody>
                          <tr>
                            <td className="font-semibold py-1 whitespace-nowrap">
                              Class :
                            </td>
                            <td>
                              {selectedStudent?.class || "N/A"}-
                              {selectedStudent?.section || ""}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-semibold py-1 whitespace-nowrap">
                              Roll No. :
                            </td>
                            <td className="whitespace-nowrap">
                              {selectedStudent?.rollNo || "N/A"}
                            </td>
                          </tr>
                          <tr>
                            <td className="font-semibold py-1">DOB :</td>
                            <td>
                              {selectedStudent?.dateOfBirth
                                ? new Date(
                                    selectedStudent.dateOfBirth
                                  ).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "2-digit",
                                    year: "numeric",
                                  })
                                : "N/A"}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
  
                    <div className="flex justify-end ">
                      <img
                        src={
                          selectedStudent?.image?.url ||
                          "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                        }
                        alt="Student"
                        className="w-24 h-24 object-cover border border-gray-300 "
                      />
                    </div>
                  </div>
  
                  <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-2">SUBJECTS</th>
                        {examName.map((name) => (
                          <th key={name} className="border border-gray-300 p-2">
                            {name}
                          </th>
                        ))}
                        <th className="border border-gray-300 p-2">TOTAL</th>
                        <th className="border border-gray-300 p-2">%</th>
                        <th className="border border-gray-300 p-2">GRADE</th>
                      </tr>
                    </thead>
                    <tbody>
                      {examResults?.marks?.map((subject, index) => {
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
                            <td className="border border-gray-300 p-2">
                              {subject?.subjectName}
                            </td>
                            {examName?.map((name) => {
                              const examResult = subject?.examResults?.find(
                                (result) =>
                                  examData?.find((exam) => exam.name === name)
                                    ?._id === result.examId
                              );
                              return (
                                <td
                                  key={name}
                                  className="border border-gray-300 p-2 text-center"
                                >
                                  {examResult
                                    ? `${examResult?.marks}/${examResult?.totalMarks}`
                                    : "-/-"}
                                </td>
                              );
                            })}
                            <td className="border border-gray-300 p-2 text-center">
                              {totalMarks}/{totalPossible}
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {percentage?.toFixed(2)}%
                            </td>
                            <td className="border border-gray-300 p-2 text-center">
                              {calculateGrade(percentage)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
  
                  <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border border-gray-300 p-2">Activity</th>
                        <th className="border border-gray-300 p-2">Grade</th>
                      </tr>
                    </thead>
                  
                    <tbody>
                      {coScholasticMarks?.map((activity, index) => (
                        <tr key={index}>
                          <td className="border border-gray-300 p-2">
                            {activity?.activityName}
                          </td>
                          <td className="border border-gray-300 p-2 text-center">
                            {activity?.grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {Object.keys(overallData).length > 0 && (
                    <div className="mt-2">
                    <p><b>Total Marks:</b> {overallData.totalMarks}</p>
                    <p><b>Percentage:</b> {overallData.percentage}%</p>
                    <p><b>Result:</b> {overallData.isPassed ? "Passed" : "Failed"}</p>
                    {/* <p><b>Grade:</b> {overallData.grade}</p> */}
                   </div>)}
                  <div className="mb-6">
                    {/* <div className="mb-4">
                      <h4 className="font-semibold mb-1">Discipline</h4>
                      <p>Grade: A</p>
                    </div> */}
                    <div>
                      <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
                      <p>Excellent performance. Keep up the good work!</p>
                    </div>
                  </div>
                  <div className="mt-8 flex justify-between text-sm">
                    <div>
                      <div className="mb-8"></div>
                      <div>Class Teacher's Signature</div>
                    </div>
                    <div>
                      <div className="mb-8"></div>
                      <div>Principal's Signature</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
            <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
          </div>}
      </>
    );
  };
  
  export default StudentsResult;
// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const StudentsResult = () => {
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//   const [classes, setClasses] = useState([]);
//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));
  
//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");
  
//     const generatePDF = useReactToPrint({
//       content: () => componentPDF.current,
//       documentTitle: `${selectedStudent?.fullName || "Student"}_Report_Card`,
//       onAfterPrint: () => toast.success("Downloaded successfully"),
//     });
  
  
//     const getAllStudents = async () => {
//       setLoading(true);
//       try {
//           const response = await axios.get(
//               "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//               {
//                   withCredentials: true,
//                   headers: {
//                       Authorization: `Bearer ${authToken}`,
//                   },
//               }
//           );
//           setLoading(false);
//           // setAllStudents(response.data.allStudent);
//           setAllStudents(response.data.allStudent || []);
//       } catch (error) {
//           console.error("Error fetching exams:", error);
//           setLoading(false);
//       }
//   };

//   useEffect(() => {
//     axios
//         .get(
//             `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
//             {
//                 withCredentials: true,
//                 headers: {
//                     Authorization: `Bearer ${authToken}`,
//                 },
//             }
//         )
//         .then((response) => {
//             //remove duplicate class name
//             console.log("response.data.classList",response.data.classList)
//             const uniqueClasses = response.data.classList.reduce((acc, curr) => {
//                 const classExist = acc.find(
//                     (x) => x.className === curr.className && x.sections === curr.sections
//                 );
//                 if (!classExist) {
//                     acc.push(curr);
//                 }
//                 return acc;
//             }, []);
//             setClasses(uniqueClasses);

//         })
//         .catch((error) => {
//             console.error("Error fetching data:", error);
//         });
// }, []);



//     const getResult = async () => {
//       setLoading(true)
//       try {
//         const response = await axios.get(
          
//           "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setMarks(response.data.marks);
//       } catch (error) {
//         console.error("Error fetching marks:", error);
//       }finally{
//         setLoading(false)
//       }
//     };
  
//     useEffect(() => {
//       getResult();
//       getAllStudents()
//     }, []);
  
//     useEffect(() => {
//       const fetchExams = async () => {
//         try {
//           const response = await axios.get(
//             "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           );
//           setExamData(response.data.exams);
//         } catch (error) {
//           console.error("Error fetching exams:", error);
//         }
//       };
//       fetchExams();
//     }, [authToken]);
  
  
//     useEffect(() => {
//       if (!selectedStudent || marks.length === 0) {
//           setExamResults([]);
//           setCoScholasticMarks([]);
//           setOverallData({});
//           return;
//       }
  
//       const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//       const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));
  
  
//       const combinedResults = filteredMarks.reduce((acc, curr) => {
//         curr.marks.forEach((mark) => {
//           const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//           if (!existingMark) {
//             acc?.push({
//               ...mark,
//               examResults: [
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ],
//             });
//           } else {
//             existingMark.examResults = [
//               ...existingMark.examResults,
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ];
//           }
//         });
//         return acc;
//       }, []);
  
//       setExamResults({ marks: combinedResults });
  
//        // Update coScholastic marks to only show last selected
//        const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//        const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);
     
//        const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
//        setCoScholasticMarks(coScholasticData);
  
//        //set overall data
//         const overAll = lastSelectedExamMarks ? 
//           {totalMarks :lastSelectedExamMarks.totalMarks, 
//           percentage: lastSelectedExamMarks.percentage,
//           isPassed: lastSelectedExamMarks.isPassed,
//           grade: lastSelectedExamMarks.grade}
//         :{}
//         setOverallData(overAll);

//        // Update exam names with newly selected exam
//        const updatedExamNames = examData
//        .filter((ex) => selectedExams.includes(ex._id))
//        .map((ex) => ex.name);
//       setExamName(updatedExamNames);
//     }, [marks, selectedStudent,selectedExams]);
  
  
  
//     const handleCheckboxChange = (exam) => {
//       setSelectedExams((prevSelected) => {
//         const isExamSelected = prevSelected.includes(exam._id);
//         let updatedSelectedExams;
    
//         if (isExamSelected) {
//           updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//         } else {
//           updatedSelectedExams = [...prevSelected, exam._id];
//         }
//         return updatedSelectedExams;
//       });
//     };
  
//     const calculateGrade = (percentage) => {
//       if (percentage >= 90) return "A+";
//       if (percentage >= 80) return "A";
//       if (percentage >= 70) return "B+";
//       if (percentage >= 60) return "B";
//       if (percentage >= 50) return "C";
//       return "F";
//     };
  
//     return (
//       <>
//         <div className="mb-4 mx-auto">
//           <div
//             className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//             style={{
//               background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//             }}
//           >
//             <p className="text-lg">Report Card</p>
//             <MdDownload
//               onClick={generatePDF}
//               className="text-2xl cursor-pointer"
//             />
//           </div>
//           <div className="w-full flex">
//             <div className="mb-4">
//               <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//               <select
//                 className="p-2 border rounded"
//                 onChange={(e) => {
//                   const selected = allStudents.find(
//                     (student) => student?._id === e.target.value
//                   );
//                   setSelectedStudent(selected);
//                 }}
//               >
//                 <option value="">Select a student</option>
//                 {allStudents.map((student) => (
//                   <option key={student?._id} value={student?._id}>
//                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                     (Roll No: {student?.rollNo})
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div>
//               <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//               <form className="flex gap-4 items-center justify-center border-2 p-2">
//                 {examData?.map((exam) => (
//                   <div key={exam._id} className="flex items-center">
//                     <input
//                       type="checkbox"
//                       id={exam?._id}
//                       value={exam?._id}
//                       checked={selectedExams.includes(exam?._id)}
//                       onChange={() => handleCheckboxChange(exam)}
//                       className="mr-2"
//                     />
//                     <label htmlFor={exam._id}>{exam.name}</label>
//                   </div>
//                 ))}
//               </form>
//             </div>
//           </div>
//         </div>
  
//         <div className="w-full flex justify-center">
//           <div className="a4">
//             <div className="content border-2 m-1">
//               <div ref={componentPDF} className="p-12">
//                 <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                   <div className="flex items-center justify-between mb-6">
//                     <div className="h-[70px] w-[70px]">
//                       <img
//                         src={schoolImage}
//                         alt="School Logo"
//                         className="w-full object-contain"
//                       />
//                     </div>
//                     <div className="text-center">
//                       <h1 className="text-red-600 font-bold text-3xl">
//                         {SchoolDetails?.schoolName}
//                       </h1>
//                       <p className="text-blue-600 text-xl">
//                         {SchoolDetails?.address}
//                       </p>
//                       <p className="text-green-600 text-sm font-bold">
//                         {SchoolDetails?.email}
//                       </p>
//                       <p className="text-green-600 text-sm font-bold">
//                         {SchoolDetails?.contact}
//                       </p>
//                     </div>
//                     <div className="w-[70px]"></div>
//                   </div>
  
//                   <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                     <div>
//                       <table className=" text-sm">
//                         <tbody>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Admission No. :
//                             </td>
//                             <td className="whitespace-nowrap to-blue-700 font-semibold">
//                               {selectedStudent?.admissionNumber || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Student's Name :
//                             </td>
//                             <td className="whitespace-nowrap">
//                               {selectedStudent?.fullName || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Father's Name :
//                             </td>
//                             <td className="whitespace-nowrap">
//                               {selectedStudent?.fatherName || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Mother's Name :
//                             </td>
//                             <td className="whitespace-nowrap">
//                               {selectedStudent?.motherName || "N/A"}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
  
//                     <div>
//                       <table className="ml-3 text-sm">
//                         <tbody>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Class :
//                             </td>
//                             <td>
//                               {selectedStudent?.class || "N/A"}-
//                               {selectedStudent?.section || ""}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1 whitespace-nowrap">
//                               Roll No. :
//                             </td>
//                             <td className="whitespace-nowrap">
//                               {selectedStudent?.rollNo || "N/A"}
//                             </td>
//                           </tr>
//                           <tr>
//                             <td className="font-semibold py-1">DOB :</td>
//                             <td>
//                               {selectedStudent?.dateOfBirth
//                                 ? new Date(
//                                     selectedStudent.dateOfBirth
//                                   ).toLocaleDateString("en-GB", {
//                                     day: "2-digit",
//                                     month: "2-digit",
//                                     year: "numeric",
//                                   })
//                                 : "N/A"}
//                             </td>
//                           </tr>
//                         </tbody>
//                       </table>
//                     </div>
  
//                     <div className="flex justify-end ">
//                       <img
//                         src={
//                           selectedStudent?.image?.url ||
//                           "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                         }
//                         alt="Student"
//                         className="w-24 h-24 object-cover border border-gray-300 "
//                       />
//                     </div>
//                   </div>
  
//                   <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                     <thead>
//                       <tr className="bg-gray-200">
//                         <th className="border border-gray-300 p-2">SUBJECTS</th>
//                         {examName.map((name) => (
//                           <th key={name} className="border border-gray-300 p-2">
//                             {name}
//                           </th>
//                         ))}
//                         <th className="border border-gray-300 p-2">TOTAL</th>
//                         <th className="border border-gray-300 p-2">%</th>
//                         <th className="border border-gray-300 p-2">GRADE</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {examResults?.marks?.map((subject, index) => {
//                         const totalMarks = subject?.examResults?.reduce(
//                           (sum, result) => sum + (result?.marks || 0),
//                           0
//                         );
//                         const totalPossible = subject?.examResults?.reduce(
//                           (sum, result) => sum + (result?.totalMarks || 0),
//                           0
//                         );
//                         const percentage =
//                           totalPossible > 0
//                             ? (totalMarks / totalPossible) * 100
//                             : 0;
  
//                         return (
//                           <tr
//                             key={index}
//                             className={index % 2 === 0 ? "bg-gray-100" : ""}
//                           >
//                             <td className="border border-gray-300 p-2">
//                               {subject?.subjectName}
//                             </td>
//                             {examName?.map((name) => {
//                               const examResult = subject?.examResults?.find(
//                                 (result) =>
//                                   examData?.find((exam) => exam.name === name)
//                                     ?._id === result.examId
//                               );
//                               return (
//                                 <td
//                                   key={name}
//                                   className="border border-gray-300 p-2 text-center"
//                                 >
//                                   {examResult
//                                     ? `${examResult?.marks}/${examResult?.totalMarks}`
//                                     : "-/-"}
//                                 </td>
//                               );
//                             })}
//                             <td className="border border-gray-300 p-2 text-center">
//                               {totalMarks}/{totalPossible}
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               {percentage?.toFixed(2)}%
//                             </td>
//                             <td className="border border-gray-300 p-2 text-center">
//                               {calculateGrade(percentage)}
//                             </td>
//                           </tr>
//                         );
//                       })}
//                     </tbody>
//                   </table>
  
//                   <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                     <thead>
//                       <tr className="bg-gray-200">
//                         <th className="border border-gray-300 p-2">Activity</th>
//                         <th className="border border-gray-300 p-2">Grade</th>
//                       </tr>
//                     </thead>
                  
//                     <tbody>
//                       {coScholasticMarks?.map((activity, index) => (
//                         <tr key={index}>
//                           <td className="border border-gray-300 p-2">
//                             {activity?.activityName}
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {activity?.grade}
//                           </td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                   {Object.keys(overallData).length > 0 && (
//                     <div className="mt-2">
//                     <p><b>Total Marks:</b> {overallData.totalMarks}</p>
//                     <p><b>Percentage:</b> {overallData.percentage}%</p>
//                     <p><b>Result:</b> {overallData.isPassed ? "Passed" : "Failed"}</p>
//                     {/* <p><b>Grade:</b> {overallData.grade}</p> */}
//                    </div>)}
//                   <div className="mb-6">
//                     {/* <div className="mb-4">
//                       <h4 className="font-semibold mb-1">Discipline</h4>
//                       <p>Grade: A</p>
//                     </div> */}
//                     <div>
//                       <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                       <p>Excellent performance. Keep up the good work!</p>
//                     </div>
//                   </div>
//                   <div className="mt-8 flex justify-between text-sm">
//                     <div>
//                       <div className="mb-8"></div>
//                       <div>Class Teacher's Signature</div>
//                     </div>
//                     <div>
//                       <div className="mb-8"></div>
//                       <div>Principal's Signature</div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//         {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//             <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//           </div>}
//       </>
//     );
//   };
  
//   export default StudentsResult;




// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const ReportCard = () => {
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [selectedClass, setSelectedClass] = useState("");
//     const [selectedSection, setSelectedSection] = useState("");
//     const [filteredStudents, setFilteredStudents] = useState([]);
//     const [classes, setClasses] = useState([]);

//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${selectedStudent?.fullName || "Student"}_Report_Card`,
//         onAfterPrint: () => toast.success("Downloaded successfully"),
//     });

//     useEffect(() => {
//         const fetchStudents = async () => {
//             try {
//                 const response = await axios.get(
//                     "https://eserver-i5sm.onrender.com/api/v1/student/getStudents",
//                     {
//                         withCredentials: true,
//                         headers: {
//                             Authorization: `Bearer ${authToken}`,
//                         },
//                     }
//                 );
//                 setAllStudents(response.data.students);
//             } catch (error) {
//                 console.error("Error fetching students:", error);
//             }
//         };
//         fetchStudents();
//     }, [authToken]);
    
//     useEffect(() => {
//         const filtered = allStudents.filter(exam => {
//             if (selectedClass && selectedSection) {
//                 return exam.className === selectedClass && exam.section === selectedSection;
//             } else if (selectedClass) {
//                 return exam.className === selectedClass;
//             }
//             return true;
//         });
//         setFilteredStudents(filtered);
//         setSelectedStudent(null);
//     }, [selectedClass, selectedSection, allStudents])
//     useEffect(() => {
//         axios
//             .get(
//                 `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                     },
//                 }
//             )
//             .then((response) => {
//                 //remove duplicate class name
//                 const uniqueClasses = response.data.classList.reduce((acc, curr) => {
//                     const classExist = acc.find(
//                         (x) => x.className === curr.className && x.sections === curr.sections
//                     );
//                     if (!classExist) {
//                         acc.push(curr);
//                     }
//                     return acc;
//                 }, []);
//                 setClasses(uniqueClasses);
//             })
//             .catch((error) => {
//                 console.error("Error fetching data:", error);
//             });
//     }, [authToken]);

//     const getResult = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setMarks(response.data.marks);
//         } catch (error) {
//             console.error("Error fetching marks:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         getResult();
//     }, []);

//     useEffect(() => {
//         const fetchExams = async () => {
//             try {
//                 const response = await axios.get(
//                     "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//                     {
//                         withCredentials: true,
//                         headers: { Authorization: `Bearer ${authToken}` },
//                     }
//                 );
//                 setExamData(response.data.exams);
//             } catch (error) {
//                 console.error("Error fetching exams:", error);
//             }
//         };
//         fetchExams();
//     }, [authToken]);

//     useEffect(() => {
//         if (!selectedStudent || marks.length === 0) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//         const filteredMarks = studentMarks.filter((mark) => selectedExams.includes(mark.examId));

//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//             curr.marks.forEach((mark) => {
//                 const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//                 if (!existingMark) {
//                     acc?.push({
//                         ...mark,
//                         examResults: [
//                             {
//                                 examId: curr.examId,
//                                 marks: mark.marks,
//                                 totalMarks: mark.totalMarks,
//                             },
//                         ],
//                     });
//                 } else {
//                     existingMark.examResults = [
//                         ...existingMark.examResults,
//                         {
//                             examId: curr.examId,
//                             marks: mark.marks,
//                             totalMarks: mark.totalMarks,
//                         },
//                     ];
//                 }
//             });
//             return acc;
//         }, []);

//         setExamResults({ marks: combinedResults });

//         // Update coScholastic marks to only show last selected
//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find((mark) => mark.examId === lastSelectedExamId);

//         const coScholasticData = lastSelectedExamMarks
//             ? lastSelectedExamMarks.coScholasticMarks
//             : [];
//         setCoScholasticMarks(coScholasticData);

//         //set overall data
//         const overAll = lastSelectedExamMarks
//             ? {
//                 totalMarks: lastSelectedExamMarks.totalMarks,
//                 percentage: lastSelectedExamMarks.percentage,
//                 isPassed: lastSelectedExamMarks.isPassed,
//                 grade: lastSelectedExamMarks.grade,
//             }
//             : {};
//         setOverallData(overAll);

//         // Update exam names with newly selected exam
//         const updatedExamNames = examData
//             .filter((ex) => selectedExams.includes(ex._id))
//             .map((ex) => ex.name);
//         setExamName(updatedExamNames);
//     }, [marks, selectedStudent, selectedExams, examData]);

//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//                 updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//                 updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };

//     const calculateGrade = (percentage) => {
//         if (percentage >= 90) return "A+";
//         if (percentage >= 80) return "A";
//         if (percentage >= 70) return "B+";
//         if (percentage >= 60) return "B";
//         if (percentage >= 50) return "C";
//         return "F";
//     };

//     // Function to handle printing report cards for all students
//     const handlePrintAll = () => {
//         if (filteredStudents.length === 0) {
//             toast.error("No students in selected class/section to print.");
//             return;
//         }

//         filteredStudents.forEach((student) => {
//             setSelectedStudent(student);
//             setTimeout(()=>{
//                 generatePDF()
//             },200)
//         });
//     };

//     const handleClassChange = (e) => {
//         setSelectedClass(e.target.value);
//         setSelectedSection(""); // Reset section when class changes
//     };

//     const handleSectionChange = (e) => {
//         setSelectedSection(e.target.value);
//     };

//     const uniqueClasses = classes.map((cls) => cls.className);
//     const uniqueSections = selectedClass
//         ? classes.find((cls) => cls.className === selectedClass)?.sections || []
//         : [];
//     return (
//         <>
//             <div className="mb-4 mx-auto">
//                 <div
//                     className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="text-lg">Report Card</p>
//                     <div className="flex items-center gap-2">
//                         <button
//                             onClick={handlePrintAll}
//                             className="bg-white text-black px-3 py-1 rounded-md hover:bg-gray-100 transition duration-200"
//                         >
//                             Print All
//                         </button>
//                         <MdDownload
//                             onClick={generatePDF}
//                             className="text-2xl cursor-pointer"
//                         />
//                     </div>
//                 </div>
//                 <div className="w-full flex gap-2 mb-3">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Class</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleClassChange}
//                             value={selectedClass}
//                         >
//                             <option value="">Select a class</option>
//                             {uniqueClasses.map((cls) => (
//                                 <option key={cls} value={cls}>
//                                     {cls}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Section</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleSectionChange}
//                             value={selectedSection}
//                             disabled={!selectedClass}
//                         >
//                             <option value="">Select a section</option>
//                             {Array.isArray(uniqueSections) &&
//                                 uniqueSections.map((section) => (
//                                     <option key={section} value={section}>
//                                         {section}
//                                     </option>
//                                 ))}
//                         </select>
//                     </div>
//                 </div>
//                 <div className="w-full flex">
                   
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={(e) => {
//                                 const selected = filteredStudents.find(
//                                     (student) => student?._id === e.target.value
//                                 );
//                                 setSelectedStudent(selected);
//                             }}
//                             value={selectedStudent?._id || ""}
//                         >
//                             <option value="">Select a student</option>
//                             {filteredStudents.map((student) => (
//                                 <option key={student?._id} value={student?._id}>
//                                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                                     (Roll No: {student?.rollNo})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//                         <form className="flex gap-4 items-center justify-center border-2 p-2">
//                             {examData?.map((exam) => (
//                                 <div key={exam._id} className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id={exam?._id}
//                                         value={exam?._id}
//                                         checked={selectedExams.includes(exam?._id)}
//                                         onChange={() => handleCheckboxChange(exam)}
//                                         className="mr-2"
//                                     />
//                                     <label htmlFor={exam._id}>{exam.name}</label>
//                                 </div>
//                             ))}
//                         </form>
//                     </div>
//                 </div>
//             </div>

//             <div className="w-full flex justify-center">
//                 <div className="a4">
//                     <div className="content border-2 m-1">
//                         <div ref={componentPDF} className="p-12">
//                             <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                                 <div className="flex items-center justify-between mb-6">
//                                     <div className="h-[70px] w-[70px]">
//                                         <img
//                                             src={schoolImage}
//                                             alt="School Logo"
//                                             className="w-full object-contain"
//                                         />
//                                     </div>
//                                     <div className="text-center">
//                                         <h1 className="text-red-600 font-bold text-3xl">
//                                             {SchoolDetails?.schoolName}
//                                         </h1>
//                                         <p className="text-blue-600 text-xl">
//                                             {SchoolDetails?.address}
//                                         </p>
//                                         <p className="text-green-600 text-sm font-bold">
//                                             {SchoolDetails?.email}
//                                         </p>
//                                         <p className="text-green-600 text-sm font-bold">
//                                             {SchoolDetails?.contact}
//                                         </p>
//                                     </div>
//                                     <div className="w-[70px]"></div>
//                                 </div>

//                                 <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                                     <div>
//                                         <table className=" text-sm">
//                                             <tbody>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Admission No. :
//                                                     </td>
//                                                     <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                                         {selectedStudent?.admissionNumber || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Student's Name :
//                                                     </td>
//                                                     <td className="whitespace-nowrap">
//                                                         {selectedStudent?.fullName || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Father's Name :
//                                                     </td>
//                                                     <td className="whitespace-nowrap">
//                                                         {selectedStudent?.fatherName || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Mother's Name :
//                                                     </td>
//                                                     <td className="whitespace-nowrap">
//                                                         {selectedStudent?.motherName || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                             </tbody>
//                                         </table>
//                                     </div>

//                                     <div>
//                                         <table className="ml-3 text-sm">
//                                             <tbody>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Class :
//                                                     </td>
//                                                     <td>
//                                                         {selectedStudent?.class || "N/A"}-
//                                                         {selectedStudent?.section || ""}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Roll No. :
//                                                     </td>
//                                                     <td className="whitespace-nowrap">
//                                                         {selectedStudent?.rollNo || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1">DOB :</td>
//                                                     <td>
//                                                         {selectedStudent?.dateOfBirth
//                                                             ? new Date(
//                                                                 selectedStudent.dateOfBirth
//                                                             ).toLocaleDateString("en-GB", {
//                                                                 day: "2-digit",
//                                                                 month: "2-digit",
//                                                                 year: "numeric",
//                                                             })
//                                                             : "N/A"}
//                                                     </td>
//                                                 </tr>
//                                             </tbody>
//                                         </table>
//                                     </div>

//                                     <div className="flex justify-end ">
//                                         <img
//                                             src={
//                                                 selectedStudent?.image?.url ||
//                                                 "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                                             }
//                                             alt="Student"
//                                             className="w-24 h-24 object-cover border border-gray-300 "
//                                         />
//                                     </div>
//                                 </div>

//                                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                     <thead>
//                                         <tr className="bg-gray-200">
//                                             <th className="border border-gray-300 p-2">SUBJECTS</th>
//                                             {examName.map((name) => (
//                                                 <th key={name} className="border border-gray-300 p-2">
//                                                     {name}
//                                                 </th>
//                                             ))}
//                                             <th className="border border-gray-300 p-2">TOTAL</th>
//                                             <th className="border border-gray-300 p-2">%</th>
//                                             <th className="border border-gray-300 p-2">GRADE</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {examResults?.marks?.map((subject, index) => {
//                                             const totalMarks = subject?.examResults?.reduce(
//                                                 (sum, result) => sum + (result?.marks || 0),
//                                                 0
//                                             );
//                                             const totalPossible = subject?.examResults?.reduce(
//                                                 (sum, result) => sum + (result?.totalMarks || 0),
//                                                 0
//                                             );
//                                             const percentage =
//                                                 totalPossible > 0
//                                                     ? (totalMarks / totalPossible) * 100
//                                                     : 0;

//                                             return (
//                                                 <tr
//                                                     key={index}
//                                                     className={index % 2 === 0 ? "bg-gray-100" : ""}
//                                                 >
//                                                     <td className="border border-gray-300 p-2">
//                                                         {subject?.subjectName}
//                                                     </td>
//                                                     {examName?.map((name) => {
//                                                         const examResult = subject?.examResults?.find(
//                                                             (result) =>
//                                                                 examData?.find((exam) => exam.name === name)
//                                                                     ?._id === result.examId
//                                                         );
//                                                         return (
//                                                             <td
//                                                                 key={name}
//                                                                 className="border border-gray-300 p-2 text-center"
//                                                             >
//                                                                 {examResult
//                                                                     ? `${examResult?.marks}/${examResult?.totalMarks}`
//                                                                     : "-/-"}
//                                                             </td>
//                                                         );
//                                                     })}
//                                                     <td className="border border-gray-300 p-2 text-center">
//                                                         {totalMarks}/{totalPossible}
//                                                     </td>
//                                                     <td className="border border-gray-300 p-2 text-center">
//                                                         {percentage?.toFixed(2)}%
//                                                     </td>
//                                                     <td className="border border-gray-300 p-2 text-center">
//                                                         {calculateGrade(percentage)}
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })}
//                                     </tbody>
//                                 </table>

//                                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                     <thead>
//                                         <tr className="bg-gray-200">
//                                             <th className="border border-gray-300 p-2">Activity</th>
//                                             <th className="border border-gray-300 p-2">Grade</th>
//                                         </tr>
//                                     </thead>

//                                     <tbody>
//                                         {coScholasticMarks?.map((activity, index) => (
//                                             <tr key={index}>
//                                                 <td className="border border-gray-300 p-2">
//                                                     {activity?.activityName}
//                                                 </td>
//                                                 <td className="border border-gray-300 p-2 text-center">
//                                                     {activity?.grade}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                                   {Object.keys(overallData).length > 0 && (
//                                         <div className="mt-2">
//                                         <p><b>Total Marks:</b> {overallData.totalMarks}</p>
//                                         <p><b>Percentage:</b> {overallData.percentage}%</p>
//                                         <p><b>Result:</b> {overallData.isPassed ? "Passed" : "Failed"}</p>
//                                          {/* <p><b>Grade:</b> {overallData.grade}</p> */}
//                                     </div>)}
//                                 <div className="mb-6">
//                                     <div>
//                                         <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                                         <p>Excellent performance. Keep up the good work!</p>
//                                     </div>
//                                 </div>
//                                 <div className="mt-8 flex justify-between text-sm">
//                                     <div>
//                                         <div className="mb-8"></div>
//                                         <div>Class Teacher's Signature</div>
//                                     </div>
//                                     <div>
//                                         <div className="mb-8"></div>
//                                         <div>Principal's Signature</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             {loading && (
//                 <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//                     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>
//             )}
//         </>
//     );
// };

// export default ReportCard;



// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const ReportCard = () => {
//     const [allStudents, setAllStudents] = useState([]);
//     const [examName, setExamName] = useState([]);
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const [examResults, setExamResults] = useState([]);
//     const [marks, setMarks] = useState([]);
//     const [examData, setExamData] = useState([]);
//     const [selectedExams, setSelectedExams] = useState([]);
//     const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//     const [overallData, setOverallData] = useState({});
//     const [loading, setLoading] = useState(false);
//     const [selectedClass, setSelectedClass] = useState("");
//     const [selectedSection, setSelectedSection] = useState("");
//     const [filteredStudents, setFilteredStudents] = useState([]);
//     const [classes, setClasses] = useState([]);

//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//     const { currentColor } = useStateContext();
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${
//             selectedStudent?.fullName || "Student"
//         }_Report_Card`,
//         onAfterPrint: () => toast.success("Downloaded successfully"),
//     });

//     useEffect(() => {
//         const students = JSON.parse(localStorage.getItem("studentsData"));
//         setAllStudents(students || []);
//     }, []);

//     useEffect(() => {
//         // Filter students based on selected class and section
//         let filtered = allStudents;
//         if (selectedClass) {
//             filtered = filtered.filter((student) => student.class === selectedClass);
//         }
//         if (selectedSection) {
//             filtered = filtered.filter((student) => student.section === selectedSection);
//         }
//         setFilteredStudents(filtered);
//         // Reset selected student when class/section changes
//         setSelectedStudent(null);
//     }, [selectedClass, selectedSection, allStudents]);

//      useEffect(() => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         //remove duplicate class name
//         const uniqueClasses = response.data.classList.reduce((acc, curr) => {
//           const classExist = acc.find(
//             (x) => x.className === curr.className && x.sections === curr.sections
//           );
//           if (!classExist) {
//             acc.push(curr);
//           }
//           return acc;
//         }, []);
//         setClasses(uniqueClasses);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, [authToken]);
//     const getResult = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             setMarks(response.data.marks);
//         } catch (error) {
//             console.error("Error fetching marks:", error);
//         } finally {
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         getResult();
//     }, []);

//     useEffect(() => {
//         const fetchExams = async () => {
//             try {
//                 const response = await axios.get(
//                     "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//                     {
//                         withCredentials: true,
//                         headers: { Authorization: `Bearer ${authToken}` },
//                     }
//                 );
//                 setExamData(response.data.exams);
//             } catch (error) {
//                 console.error("Error fetching exams:", error);
//             }
//         };
//         fetchExams();
//     }, [authToken]);


//     useEffect(() => {
//         if (!selectedStudent || marks.length === 0) {
//             setExamResults([]);
//             setCoScholasticMarks([]);
//             setOverallData({});
//             return;
//         }

//         const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//         const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));


//         const combinedResults = filteredMarks.reduce((acc, curr) => {
//             curr.marks.forEach((mark) => {
//                 const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//                 if (!existingMark) {
//                     acc?.push({
//                         ...mark,
//                         examResults: [
//                             {
//                                 examId: curr.examId,
//                                 marks: mark.marks,
//                                 totalMarks: mark.totalMarks,
//                             },
//                         ],
//                     });
//                 } else {
//                     existingMark.examResults = [
//                         ...existingMark.examResults,
//                         {
//                             examId: curr.examId,
//                             marks: mark.marks,
//                             totalMarks: mark.totalMarks,
//                         },
//                     ];
//                 }
//             });
//             return acc;
//         }, []);

//         setExamResults({ marks: combinedResults });

//         // Update coScholastic marks to only show last selected
//         const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//         const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);

//         const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
//         setCoScholasticMarks(coScholasticData);

//         //set overall data
//         const overAll = lastSelectedExamMarks ?
//             {
//                 totalMarks: lastSelectedExamMarks.totalMarks,
//                 percentage: lastSelectedExamMarks.percentage,
//                 isPassed: lastSelectedExamMarks.isPassed,
//                 grade: lastSelectedExamMarks.grade
//             }
//             : {}
//         setOverallData(overAll);

//         // Update exam names with newly selected exam
//         const updatedExamNames = examData
//             .filter((ex) => selectedExams.includes(ex._id))
//             .map((ex) => ex.name);
//         setExamName(updatedExamNames);
//     }, [marks, selectedStudent, selectedExams, examData]);

//     const handleCheckboxChange = (exam) => {
//         setSelectedExams((prevSelected) => {
//             const isExamSelected = prevSelected.includes(exam._id);
//             let updatedSelectedExams;

//             if (isExamSelected) {
//                 updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//             } else {
//                 updatedSelectedExams = [...prevSelected, exam._id];
//             }
//             return updatedSelectedExams;
//         });
//     };

//     const calculateGrade = (percentage) => {
//         if (percentage >= 90) return "A+";
//         if (percentage >= 80) return "A";
//         if (percentage >= 70) return "B+";
//         if (percentage >= 60) return "B";
//         if (percentage >= 50) return "C";
//         return "F";
//     };

//     // Function to handle printing report cards for all students
//     const handlePrintAll = () => {
//         if (filteredStudents.length === 0) {
//             toast.error("No students in selected class/section to print.");
//             return;
//         }

//         filteredStudents.forEach((student) => {
//             setSelectedStudent(student);
//             setTimeout(()=>{
//                 generatePDF()
//             },200)
           
//         });
//     };

//     const handleClassChange = (e) => {
//         setSelectedClass(e.target.value);
//         setSelectedSection(""); // Reset section when class changes
//     };

//     const handleSectionChange = (e) => {
//         setSelectedSection(e.target.value);
//     };


//     const uniqueClasses =  classes.map((cls) => cls.className)
//     const uniqueSections = selectedClass
//         ? classes.find((cls) => cls.className === selectedClass)?.sections || []
//         : [];
//     return (
//         <>
//             <div className="mb-4 mx-auto">
//                 <div
//                     className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                     style={{
//                         background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                     }}
//                 >
//                     <p className="text-lg">Report Card</p>
//                      <div className="flex items-center gap-2">
//                          <button
//                            onClick={handlePrintAll}
//                             className="bg-white text-black px-3 py-1 rounded-md hover:bg-gray-100 transition duration-200"
//                             >Print All</button>
//                        <MdDownload
//                         onClick={generatePDF}
//                         className="text-2xl cursor-pointer"
//                     />
//                 </div>
//                 </div>
//                  <div className="w-full flex gap-2 mb-3">
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Class</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleClassChange}
//                             value={selectedClass}
//                         >
//                             <option value="">Select a class</option>
//                             {uniqueClasses.map((cls) => (
//                                 <option key={cls} value={cls}>
//                                     {cls}
//                                 </option>
//                             ))}
//                         </select>
//                     </div>

//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Section</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={handleSectionChange}
//                             value={selectedSection}
//                             disabled={!selectedClass}
//                         >
//                             <option value="">Select a section</option>
//                              {Array.isArray(uniqueSections) &&
//                                     uniqueSections.map((section) => (
//                                         <option key={section} value={section}>
//                                             {section}
//                                         </option>
//                                     ))
//                              }
//                         </select>
//                     </div>
//                 </div>
//                 <div className="w-full flex">
                   
//                     <div className="mb-4">
//                         <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//                         <select
//                             className="p-2 border rounded"
//                             onChange={(e) => {
//                                 const selected = filteredStudents.find(
//                                     (student) => student?._id === e.target.value
//                                 );
//                                 setSelectedStudent(selected);
//                             }}
//                             value={selectedStudent?._id || ""}
//                         >
//                             <option value="">Select a student</option>
//                             {filteredStudents.map((student) => (
//                                 <option key={student?._id} value={student?._id}>
//                                     {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                                     (Roll No: {student?.rollNo})
//                                 </option>
//                             ))}
//                         </select>
//                     </div>
//                     <div>
//                         <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//                         <form className="flex gap-4 items-center justify-center border-2 p-2">
//                             {examData?.map((exam) => (
//                                 <div key={exam._id} className="flex items-center">
//                                     <input
//                                         type="checkbox"
//                                         id={exam?._id}
//                                         value={exam?._id}
//                                         checked={selectedExams.includes(exam?._id)}
//                                         onChange={() => handleCheckboxChange(exam)}
//                                         className="mr-2"
//                                     />
//                                     <label htmlFor={exam._id}>{exam.name}</label>
//                                 </div>
//                             ))}
//                         </form>
//                     </div>
//                 </div>
//             </div>

//             <div className="w-full flex justify-center">
//                 <div className="a4">
//                     <div className="content border-2 m-1">
//                         <div ref={componentPDF} className="p-12">
//                             <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                                 <div className="flex items-center justify-between mb-6">
//                                     <div className="h-[70px] w-[70px]">
//                                         <img
//                                             src={schoolImage}
//                                             alt="School Logo"
//                                             className="w-full object-contain"
//                                         />
//                                     </div>
//                                     <div className="text-center">
//                                         <h1 className="text-red-600 font-bold text-3xl">
//                                             {SchoolDetails?.schoolName}
//                                         </h1>
//                                         <p className="text-blue-600 text-xl">
//                                             {SchoolDetails?.address}
//                                         </p>
//                                         <p className="text-green-600 text-sm font-bold">
//                                             {SchoolDetails?.email}
//                                         </p>
//                                         <p className="text-green-600 text-sm font-bold">
//                                             {SchoolDetails?.contact}
//                                         </p>
//                                     </div>
//                                     <div className="w-[70px]"></div>
//                                 </div>

//                                 <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                                     <div>
//                                         <table className=" text-sm">
//                                             <tbody>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Admission No. :
//                                                     </td>
//                                                     <td className="whitespace-nowrap to-blue-700 font-semibold">
//                                                         {selectedStudent?.admissionNumber || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Student's Name :
//                                                     </td>
//                                                     <td className="whitespace-nowrap">
//                                                         {selectedStudent?.fullName || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Father's Name :
//                                                     </td>
//                                                     <td className="whitespace-nowrap">
//                                                         {selectedStudent?.fatherName || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Mother's Name :
//                                                     </td>
//                                                     <td className="whitespace-nowrap">
//                                                         {selectedStudent?.motherName || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                             </tbody>
//                                         </table>
//                                     </div>

//                                     <div>
//                                         <table className="ml-3 text-sm">
//                                             <tbody>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Class :
//                                                     </td>
//                                                     <td>
//                                                         {selectedStudent?.class || "N/A"}-
//                                                         {selectedStudent?.section || ""}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1 whitespace-nowrap">
//                                                         Roll No. :
//                                                     </td>
//                                                     <td className="whitespace-nowrap">
//                                                         {selectedStudent?.rollNo || "N/A"}
//                                                     </td>
//                                                 </tr>
//                                                 <tr>
//                                                     <td className="font-semibold py-1">DOB :</td>
//                                                     <td>
//                                                         {selectedStudent?.dateOfBirth
//                                                             ? new Date(
//                                                                 selectedStudent.dateOfBirth
//                                                             ).toLocaleDateString("en-GB", {
//                                                                 day: "2-digit",
//                                                                 month: "2-digit",
//                                                                 year: "numeric",
//                                                             })
//                                                             : "N/A"}
//                                                     </td>
//                                                 </tr>
//                                             </tbody>
//                                         </table>
//                                     </div>

//                                     <div className="flex justify-end ">
//                                         <img
//                                             src={
//                                                 selectedStudent?.image?.url ||
//                                                 "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                                             }
//                                             alt="Student"
//                                             className="w-24 h-24 object-cover border border-gray-300 "
//                                         />
//                                     </div>
//                                 </div>

//                                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                     <thead>
//                                         <tr className="bg-gray-200">
//                                             <th className="border border-gray-300 p-2">SUBJECTS</th>
//                                             {examName.map((name) => (
//                                                 <th key={name} className="border border-gray-300 p-2">
//                                                     {name}
//                                                 </th>
//                                             ))}
//                                             <th className="border border-gray-300 p-2">TOTAL</th>
//                                             <th className="border border-gray-300 p-2">%</th>
//                                             <th className="border border-gray-300 p-2">GRADE</th>
//                                         </tr>
//                                     </thead>
//                                     <tbody>
//                                         {examResults?.marks?.map((subject, index) => {
//                                             const totalMarks = subject?.examResults?.reduce(
//                                                 (sum, result) => sum + (result?.marks || 0),
//                                                 0
//                                             );
//                                             const totalPossible = subject?.examResults?.reduce(
//                                                 (sum, result) => sum + (result?.totalMarks || 0),
//                                                 0
//                                             );
//                                             const percentage =
//                                                 totalPossible > 0
//                                                     ? (totalMarks / totalPossible) * 100
//                                                     : 0;

//                                             return (
//                                                 <tr
//                                                     key={index}
//                                                     className={index % 2 === 0 ? "bg-gray-100" : ""}
//                                                 >
//                                                     <td className="border border-gray-300 p-2">
//                                                         {subject?.subjectName}
//                                                     </td>
//                                                     {examName?.map((name) => {
//                                                         const examResult = subject?.examResults?.find(
//                                                             (result) =>
//                                                                 examData?.find((exam) => exam.name === name)
//                                                                     ?._id === result.examId
//                                                         );
//                                                         return (
//                                                             <td
//                                                                 key={name}
//                                                                 className="border border-gray-300 p-2 text-center"
//                                                             >
//                                                                 {examResult
//                                                                     ? `${examResult?.marks}/${examResult?.totalMarks}`
//                                                                     : "-/-"}
//                                                             </td>
//                                                         );
//                                                     })}
//                                                     <td className="border border-gray-300 p-2 text-center">
//                                                         {totalMarks}/{totalPossible}
//                                                     </td>
//                                                     <td className="border border-gray-300 p-2 text-center">
//                                                         {percentage?.toFixed(2)}%
//                                                     </td>
//                                                     <td className="border border-gray-300 p-2 text-center">
//                                                         {calculateGrade(percentage)}
//                                                     </td>
//                                                 </tr>
//                                             );
//                                         })}
//                                     </tbody>
//                                 </table>

//                                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                                     <thead>
//                                         <tr className="bg-gray-200">
//                                             <th className="border border-gray-300 p-2">Activity</th>
//                                             <th className="border border-gray-300 p-2">Grade</th>
//                                         </tr>
//                                     </thead>

//                                     <tbody>
//                                         {coScholasticMarks?.map((activity, index) => (
//                                             <tr key={index}>
//                                                 <td className="border border-gray-300 p-2">
//                                                     {activity?.activityName}
//                                                 </td>
//                                                 <td className="border border-gray-300 p-2 text-center">
//                                                     {activity?.grade}
//                                                 </td>
//                                             </tr>
//                                         ))}
//                                     </tbody>
//                                 </table>
//                                   {Object.keys(overallData).length > 0 && (
//                                         <div className="mt-2">
//                                         <p><b>Total Marks:</b> {overallData.totalMarks}</p>
//                                         <p><b>Percentage:</b> {overallData.percentage}%</p>
//                                         <p><b>Result:</b> {overallData.isPassed ? "Passed" : "Failed"}</p>
//                                         {/* <p><b>Grade:</b> {overallData.grade}</p> */}
//                                     </div>)}
//                                 <div className="mb-6">
//                                     <div>
//                                         <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                                         <p>Excellent performance. Keep up the good work!</p>
//                                     </div>
//                                 </div>
//                                 <div className="mt-8 flex justify-between text-sm">
//                                     <div>
//                                         <div className="mb-8"></div>
//                                         <div>Class Teacher's Signature</div>
//                                     </div>
//                                     <div>
//                                         <div className="mb-8"></div>
//                                         <div>Principal's Signature</div>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//              {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//                     <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//                 </div>}
//         </>
//     );
// };

// export default ReportCard;


// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";

// const StudentsResult = () => {
//   const [allStudents, setAllStudents] = useState([]);
//   const [examName, setExamName] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [examResults, setExamResults] = useState([]);
//   const [marks, setMarks] = useState([]);
//   const [examData, setExamData] = useState([]);
//   const [selectedExams, setSelectedExams] = useState([]);
//   const [coScholasticMarks, setCoScholasticMarks] = useState([]);
//   const [overallData, setOverallData] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [filteredStudents, setFilteredStudents] = useState([]);

//   const schoolImage = sessionStorage.getItem("schoolImage");
//   const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));

//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const authToken = Cookies.get("token");

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${
//       selectedStudent?.fullName || "Student"
//     }_Report_Card`,
//     onAfterPrint: () => toast.success("Downloaded successfully"),
//   });

//   useEffect(() => {
//     const students = JSON.parse(localStorage.getItem("studentsData"));
//     setAllStudents(students || []);
//   }, []);

//   useEffect(() => {
//     // Filter students based on selected class and section
//     let filtered = allStudents;
//     if (selectedClass) {
//       filtered = filtered.filter((student) => student.class === selectedClass);
//     }
//     if (selectedSection) {
//       filtered = filtered.filter((student) => student.section === selectedSection);
//     }
//     setFilteredStudents(filtered);
//     // Reset selected student when class/section changes
//     setSelectedStudent(null);
//   }, [selectedClass, selectedSection, allStudents]);

//   const getResult = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(
//         "https://eserver-i5sm.onrender.com/api/v1/marks/getmarks",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       setMarks(response.data.marks);
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getResult();
//   }, []);

//   useEffect(() => {
//     const fetchExams = async () => {
//       try {
//         const response = await axios.get(
//           "https://eserver-i5sm.onrender.com/api/v1/exam/getExams",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         setExamData(response.data.exams);
//       } catch (error) {
//         console.error("Error fetching exams:", error);
//       }
//     };
//     fetchExams();
//   }, [authToken]);


//   useEffect(() => {
//       if (!selectedStudent || marks.length === 0) {
//           setExamResults([]);
//           setCoScholasticMarks([]);
//           setOverallData({});
//           return;
//       }

//       const studentMarks = marks.filter((mark) => mark?.studentId?._id === selectedStudent?._id);
//       const filteredMarks = studentMarks.filter(mark => selectedExams.includes(mark.examId));


//       const combinedResults = filteredMarks.reduce((acc, curr) => {
//         curr.marks.forEach((mark) => {
//           const existingMark = acc?.find((m) => m?.subjectName === mark?.subjectName);
//           if (!existingMark) {
//             acc?.push({
//               ...mark,
//               examResults: [
//                 {
//                   examId: curr.examId,
//                   marks: mark.marks,
//                   totalMarks: mark.totalMarks,
//                 },
//               ],
//             });
//           } else {
//             existingMark.examResults = [
//               ...existingMark.examResults,
//               {
//                 examId: curr.examId,
//                 marks: mark.marks,
//                 totalMarks: mark.totalMarks,
//               },
//             ];
//           }
//         });
//         return acc;
//       }, []);

//       setExamResults({ marks: combinedResults });

//        // Update coScholastic marks to only show last selected
//        const lastSelectedExamId = selectedExams[selectedExams.length - 1];
//        const lastSelectedExamMarks = filteredMarks.find(mark => mark.examId === lastSelectedExamId);
     
//        const coScholasticData = lastSelectedExamMarks ? lastSelectedExamMarks.coScholasticMarks : [];
//        setCoScholasticMarks(coScholasticData);
  
//        //set overall data
//         const overAll = lastSelectedExamMarks ? 
//           {totalMarks :lastSelectedExamMarks.totalMarks, 
//           percentage: lastSelectedExamMarks.percentage,
//           isPassed: lastSelectedExamMarks.isPassed,
//           grade: lastSelectedExamMarks.grade}
//         :{}
//         setOverallData(overAll);

//        // Update exam names with newly selected exam
//        const updatedExamNames = examData
//        .filter((ex) => selectedExams.includes(ex._id))
//        .map((ex) => ex.name);
//       setExamName(updatedExamNames);
//     }, [marks, selectedStudent,selectedExams,examData]);

//   const handleCheckboxChange = (exam) => {
//     setSelectedExams((prevSelected) => {
//       const isExamSelected = prevSelected.includes(exam._id);
//       let updatedSelectedExams;

//       if (isExamSelected) {
//         updatedSelectedExams = prevSelected.filter((id) => id !== exam._id);
//       } else {
//         updatedSelectedExams = [...prevSelected, exam._id];
//       }
//       return updatedSelectedExams;
//     });
//   };

//   const calculateGrade = (percentage) => {
//     if (percentage >= 90) return "A+";
//     if (percentage >= 80) return "A";
//     if (percentage >= 70) return "B+";
//     if (percentage >= 60) return "B";
//     if (percentage >= 50) return "C";
//     return "F";
//   };

//     // Function to handle printing report cards for all students
//   const handlePrintAll = () => {
//     if (filteredStudents.length === 0) {
//         toast.error("No students in selected class/section to print.");
//         return;
//     }

//     filteredStudents.forEach((student) => {
//       setSelectedStudent(student);
//       setTimeout(()=>{
//           generatePDF()
//       },200)
      
//     });
//   };

//     const handleClassChange = (e) => {
//         setSelectedClass(e.target.value);
//         setSelectedSection(""); // Reset section when class changes
//     };

//     const handleSectionChange = (e) => {
//         setSelectedSection(e.target.value);
//     };

//     const uniqueClasses = [...new Set(allStudents.map((student) => student.class))];
//     const uniqueSections = selectedClass
//         ? [...new Set(allStudents.filter((student) => student.class === selectedClass).map((student) => student.section))]
//         : [];

//   return (
//     <>
//       <div className="mb-4 mx-auto">
//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//           style={{
//             background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//           }}
//         >
//           <p className="text-lg">Report Card</p>
//           <div className="flex items-center gap-2">
//              <button 
//                onClick={handlePrintAll}
//                 className="bg-white text-black px-3 py-1 rounded-md hover:bg-gray-100 transition duration-200"
//                 >Print All</button>
//            <MdDownload
//               onClick={generatePDF}
//               className="text-2xl cursor-pointer"
//             />
//           </div>
//         </div>
//          <div className="w-full flex gap-2 mb-3">
//             <div className="mb-4">
//                 <h3 className="text-lg font-semibold mb-2">Select Class</h3>
//                 <select
//                     className="p-2 border rounded"
//                     onChange={handleClassChange}
//                     value={selectedClass}
//                 >
//                     <option value="">Select a class</option>
//                     {uniqueClasses.map((cls) => (
//                         <option key={cls} value={cls}>
//                             {cls}
//                         </option>
//                     ))}
//                 </select>
//             </div>

//             <div className="mb-4">
//                 <h3 className="text-lg font-semibold mb-2">Select Section</h3>
//                 <select
//                     className="p-2 border rounded"
//                     onChange={handleSectionChange}
//                     value={selectedSection}
//                     disabled={!selectedClass}
//                 >
//                     <option value="">Select a section</option>
//                     {uniqueSections.map((section) => (
//                         <option key={section} value={section}>
//                             {section}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//         </div>
//         <div className="w-full flex">
           
//           <div className="mb-4">
//             <h3 className="text-lg font-semibold mb-2">Select Student</h3>
//             <select
//               className="p-2 border rounded"
//               onChange={(e) => {
//                 const selected = filteredStudents.find(
//                   (student) => student?._id === e.target.value
//                 );
//                 setSelectedStudent(selected);
//               }}
//               value={selectedStudent?._id || ""}
//             >
//               <option value="">Select a student</option>
//               {filteredStudents.map((student) => (
//                 <option key={student?._id} value={student?._id}>
//                   {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                   (Roll No: {student?.rollNo})
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div>
//             <h3 className="text-lg font-semibold mb-2">Select Exams</h3>
//             <form className="flex gap-4 items-center justify-center border-2 p-2">
//               {examData?.map((exam) => (
//                 <div key={exam._id} className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id={exam?._id}
//                     value={exam?._id}
//                     checked={selectedExams.includes(exam?._id)}
//                     onChange={() => handleCheckboxChange(exam)}
//                     className="mr-2"
//                   />
//                   <label htmlFor={exam._id}>{exam.name}</label>
//                 </div>
//               ))}
//             </form>
//           </div>
//         </div>
//       </div>

//       <div className="w-full flex justify-center">
//         <div className="a4">
//           <div className="content border-2 m-1">
//             <div ref={componentPDF} className="p-12">
//               <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                 <div className="flex items-center justify-between mb-6">
//                   <div className="h-[70px] w-[70px]">
//                     <img
//                       src={schoolImage}
//                       alt="School Logo"
//                       className="w-full object-contain"
//                     />
//                   </div>
//                   <div className="text-center">
//                     <h1 className="text-red-600 font-bold text-3xl">
//                       {SchoolDetails?.schoolName}
//                     </h1>
//                     <p className="text-blue-600 text-xl">
//                       {SchoolDetails?.address}
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       {SchoolDetails?.email}
//                     </p>
//                     <p className="text-green-600 text-sm font-bold">
//                       {SchoolDetails?.contact}
//                     </p>
//                   </div>
//                   <div className="w-[70px]"></div>
//                 </div>

//                 <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                   <div>
//                     <table className=" text-sm">
//                       <tbody>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Admission No. :
//                           </td>
//                           <td className="whitespace-nowrap to-blue-700 font-semibold">
//                             {selectedStudent?.admissionNumber || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Student's Name :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.fullName || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Father's Name :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.fatherName || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Mother's Name :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.motherName || "N/A"}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div>
//                     <table className="ml-3 text-sm">
//                       <tbody>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Class :
//                           </td>
//                           <td>
//                             {selectedStudent?.class || "N/A"}-
//                             {selectedStudent?.section || ""}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1 whitespace-nowrap">
//                             Roll No. :
//                           </td>
//                           <td className="whitespace-nowrap">
//                             {selectedStudent?.rollNo || "N/A"}
//                           </td>
//                         </tr>
//                         <tr>
//                           <td className="font-semibold py-1">DOB :</td>
//                           <td>
//                             {selectedStudent?.dateOfBirth
//                               ? new Date(
//                                   selectedStudent.dateOfBirth
//                                 ).toLocaleDateString("en-GB", {
//                                   day: "2-digit",
//                                   month: "2-digit",
//                                   year: "numeric",
//                                 })
//                               : "N/A"}
//                           </td>
//                         </tr>
//                       </tbody>
//                     </table>
//                   </div>

//                   <div className="flex justify-end ">
//                     <img
//                       src={
//                         selectedStudent?.image?.url ||
//                         "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                       }
//                       alt="Student"
//                       className="w-24 h-24 object-cover border border-gray-300 "
//                     />
//                   </div>
//                 </div>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="border border-gray-300 p-2">SUBJECTS</th>
//                       {examName.map((name) => (
//                         <th key={name} className="border border-gray-300 p-2">
//                           {name}
//                         </th>
//                       ))}
//                       <th className="border border-gray-300 p-2">TOTAL</th>
//                       <th className="border border-gray-300 p-2">%</th>
//                       <th className="border border-gray-300 p-2">GRADE</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {examResults?.marks?.map((subject, index) => {
//                       const totalMarks = subject?.examResults?.reduce(
//                         (sum, result) => sum + (result?.marks || 0),
//                         0
//                       );
//                       const totalPossible = subject?.examResults?.reduce(
//                         (sum, result) => sum + (result?.totalMarks || 0),
//                         0
//                       );
//                       const percentage =
//                         totalPossible > 0
//                           ? (totalMarks / totalPossible) * 100
//                           : 0;

//                       return (
//                         <tr
//                           key={index}
//                           className={index % 2 === 0 ? "bg-gray-100" : ""}
//                         >
//                           <td className="border border-gray-300 p-2">
//                             {subject?.subjectName}
//                           </td>
//                           {examName?.map((name) => {
//                             const examResult = subject?.examResults?.find(
//                               (result) =>
//                                 examData?.find((exam) => exam.name === name)
//                                   ?._id === result.examId
//                             );
//                             return (
//                               <td
//                                 key={name}
//                                 className="border border-gray-300 p-2 text-center"
//                               >
//                                 {examResult
//                                   ? `${examResult?.marks}/${examResult?.totalMarks}`
//                                   : "-/-"}
//                               </td>
//                             );
//                           })}
//                           <td className="border border-gray-300 p-2 text-center">
//                             {totalMarks}/{totalPossible}
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {percentage?.toFixed(2)}%
//                           </td>
//                           <td className="border border-gray-300 p-2 text-center">
//                             {calculateGrade(percentage)}
//                           </td>
//                         </tr>
//                       );
//                     })}
//                   </tbody>
//                 </table>

//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                   <thead>
//                     <tr className="bg-gray-200">
//                       <th className="border border-gray-300 p-2">Activity</th>
//                       <th className="border border-gray-300 p-2">Grade</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {coScholasticMarks?.map((activity, index) => (
//                       <tr key={index}>
//                         <td className="border border-gray-300 p-2">
//                           {activity?.activityName}
//                         </td>
//                         <td className="border border-gray-300 p-2 text-center">
//                           {activity?.grade}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                  {Object.keys(overallData).length > 0 && (
//                     <div className="mt-2">
//                     <p><b>Total Marks:</b> {overallData.totalMarks}</p>
//                     <p><b>Percentage:</b> {overallData.percentage}%</p>
//                     <p><b>Result:</b> {overallData.isPassed ? "Passed" : "Failed"}</p>
//                     {/* <p><b>Grade:</b> {overallData.grade}</p> */}
//                    </div>)}
//                 <div className="mb-6">
//                   <div>
//                     <h4 className="font-semibold mb-1">Teacher's Remarks</h4>
//                     <p>Excellent performance. Keep up the good work!</p>
//                   </div>
//                 </div>
//                 <div className="mt-8 flex justify-between text-sm">
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Class Teacher's Signature</div>
//                   </div>
//                   <div>
//                     <div className="mb-8"></div>
//                     <div>Principal's Signature</div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//        {loading && <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
//             <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
//           </div>}
//     </>
//   );
// };

// export default StudentsResult;





// import React, { useState, useEffect } from 'react';

// import axios from 'axios';
// import DynamicDataTable from './DataTable';
// import Cookies from 'js-cookie';
// import { useStateContext } from "../../contexts/ContextProvider";
// import Heading from '../../Dynamic/Heading';
// const authToken = Cookies.get('token');

// const StudentsResult = () => {
//   const { currentColor } = useStateContext();
//   const modalStyle = {
//     content: {
//       // width: "80%",
//       // top: "50%",
//       // left: "50%",
//       // right: "auto",
//       // bottom: "auto",
//       // marginRight: "-50%",
//       // transform: "translate(-50%, -50%)",
//       zIndex: 1000,
//       // background:currentColor
//     },
//   };
//   const [students, setStudents] = useState([]);
//   const [submittedData, setSubmittedData] = useState([]);

//   useEffect(() => {
//     axios.get("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents", {

//       withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//     })
//       .then((response) => {
//         const allStudent = response.data.allStudent;
//     console.log("first",allStudent)
//         setSubmittedData();
//         setStudents(allStudent);
//       })
//       .catch((error) => {
//         console.error(error);
//       });
//   }, []);

//   return (
//     <div className=" mt-12 md:mt-1  mx-auto p-3 ">
//     {/* <h1 
//     className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
//     style={{color:currentColor}}

//     >All result</h1> */}
//    <Heading Name="All result" />

//       <DynamicDataTable data={students} />


//     </div>
//   );
// };

// export default StudentsResult;