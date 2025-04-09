import React, { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../../contexts/ContextProvider";
import { MdDownload } from "react-icons/md";
import axios from "axios";
import { AdminGetAllClasses, getAdminRouteExams, ActiveStudents } from "../../../Network/AdminApi";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import { toast } from "react-toastify";


const AdmitCardUi = () => {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const { currentColor ,setIsLoader} = useStateContext();
    const [selectedClass, setSelectedClass] = useState(""); // Selected class
    console.log("selectedClass",selectedClass)
    const [selectedSection, setSelectedSection] = useState(""); // Selected section
    const [availableSections, setAvailableSections] = useState([]); // Sections for selected class
      const [getClass, setGetClass] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allStudents, setAllStudents] = useState([]);
  const [examData, setExamData] = useState([]);
  const [filteredExamData, setFilteredExamData] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState("");
  const [resultPublishDate, setResultPublishDate] = useState(null);
  const schoolImage = sessionStorage.getItem("schoolImage");
  const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));
  const componentPDF = useRef();
  const authToken = localStorage.getItem("token");

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    const selectedClassObj = getClass?.find(
      (cls) => cls.className === selectedClassName
    );
    if (selectedClassObj) {
      setAvailableSections(selectedClassObj.sections);
    
    } else {
      setAvailableSections([]);
    }
  };
  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value); // Update the selectedSection state
  };
  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));
  const DynamicSection = availableSections?.map((item) => ({
    label: item,
    value: item,
  }));

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: `${selectedStudent?.fullName || "Student"}_Admit_Card`,
    onAfterPrint: () => alert("Downloaded successfully"),
  });

 

   const getExams = async () => {
      try {
        const response = await getAdminRouteExams()
        if (response?.success) {
          // setExamData(response?.exams);
          console.log("response?.exams",response?.exams)
          const filteredExams = response?.exams?.filter(exam => {
            return selectedClass === exam.className || selectedSection === exam.section
          // const filteredExams = response?.exams?.filter(exam => {
          //   return classes.some(cls => cls.className === exam.className && cls.sections === exam.section)
         })
         console.log("first filteredExams",filteredExams)
        setExamData(filteredExams);
        }
      } catch (error) {
        console.log("error", error)
      }
    }

  // const getResult = async () => {
  //   setLoading(true);
  //   try {
  //     const response = await axios.get(
  //       "https://dvsserver.onrender.com/api/v1/exam/getExams",
  //       {
  //         withCredentials: true,
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     );
  //       setLoading(false);
  //       const filteredExams = response.data.exams.filter(exam => {
  //          return classes.some(cls => cls.className === exam.className && cls.sections === exam.section)
  //       })
  //      setExamData(filteredExams);

  //   } catch (error) {
  //     console.error("Error fetching exams:", error);
  //     setLoading(false);
  //   }
  // };
 

   const GetAllClasses = async () => {
      setIsLoader(true)
      try {
        const response = await AdminGetAllClasses();
        if (response?.success) {
          setIsLoader(false)
          let classes = response.classes;
          setGetClass(classes.sort((a, b) => a - b));
         } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    const lastYearStudent = async () => {
      // setLoading(true);
      setIsLoader(true)
      try {
        const response = await ActiveStudents();

        // let filterApproved=response?.data?.students?.data
        // let filterApproved=response?.allStudent?.filter((val)=>val.approvalStatus!=="pending")
  
        if (response?.success) {
          setIsLoader(false)
         
          // setModalOpen(true);
        
          setAllStudents(response?.data?.students?.data);
          // setLoading(false);
  
        } else {
          toast.error(response?.message);
          // setLoading(false);
        }
      } catch (error) {
        console.log("error", error);
        // setLoading(false); // Ensure loading is set to false on error
      }
      finally{
        setIsLoader(false)
      }
    };
  
   
    useEffect(() => {
      GetAllClasses()
   
  
    }, []);
  useEffect(() => {
    // getResult();
    getExams()
    lastYearStudent();
    // getAllStudents();
  }, [selectedClass]);
  // }, [classes]);

    useEffect(()=>{
          const filteredExams = examData.filter(exam => {
              if (selectedClass && selectedSection) {
                  return exam.className === selectedClass && exam.section === selectedSection;
              } else if (selectedClass) {
                  return exam.className === selectedClass;
              }
              return true;
          });
          setFilteredExamData(filteredExams)
    },[selectedClass, selectedSection, examData])

  const handleTermChange = (event) => {
    setSelectedTerm(event.target.value);
    //Update the resultPublishDate state when term is changed
    const selectedExam = filteredExamData.find((exam) => exam._id === event.target.value);
    if (selectedExam) {
      setResultPublishDate(selectedExam.resultPublishDate);
    } else {
      setResultPublishDate(null); //Reset if nothing selected.
    }
  };

  const getDay = (date) => {
    const day = new Date(date).toLocaleDateString("en-US", { weekday: "long" });
    return day;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatIssueDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    const [hours, minutes] = time.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10));
    date.setMinutes(parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  // Filter exams by class and section
    const filteredExamsByClassSection = filteredExamData.filter((exam) => {
        if (selectedClass && selectedSection) {
            return exam.className === selectedClass && exam.section === selectedSection;
        } else if (selectedClass) {
            return exam.className === selectedClass;
        }
        return true;
    });
  const renderExamTable = () => {
    if (!examData || examData.length === 0) {
      return <p>No exams scheduled.</p>;
    }

      let filteredExams = selectedTerm
          ? filteredExamsByClassSection.filter((exam) => exam._id === selectedTerm)
          : filteredExamsByClassSection;


    return filteredExams?.map((exam) => (
      <div className="mb-4 border-2" key={exam._id}>
        <h4 className="font-bold text-lg  p-2">{exam.name}</h4>
        <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
          <thead>
            <tr className="">
              <th className="border border-gray-300 p-2">Subject</th>
              <th className="border border-gray-300 p-2">Examination Date</th>
              <th className="border border-gray-300 p-2">Day</th>
              <th className="border border-gray-300 p-2">Timing</th>
              <th className="border border-gray-300 p-2">Checked By</th>
            </tr>
          </thead>
          <tbody>
            {exam?.subjects?.map((subject) => (
              <tr key={subject._id}>
                <td className="border border-gray-300 p-2">{subject.name}</td>
                <td className="border border-gray-300 p-2">
                  {formatDate(subject.examDate)}
                </td>
                <td className="border border-gray-300 p-2">
                  {getDay(subject.examDate)}
                </td>
                <td className="border border-gray-300 p-2">
                  {formatTime(subject.startTime)} to {formatTime(subject.endTime)}
                </td>
                <td className="border border-gray-300 p-2">
                  ....................
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ));
  };

  // Filter Students based on class and section
  const filteredStudents = allStudents?.filter((student) => {
    if (selectedClass && selectedSection) {
      return student.class === selectedClass && student.section === selectedSection;
    } else if (selectedClass) {
      return student.class === selectedClass;
    }

    return true;
  });
  return (
    <div>
      <div
        className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
        style={{
          background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
        }}
      >
        <p className="text-lg">Admit Card</p>
        <MdDownload onClick={generatePDF} className="text-2xl cursor-pointer" />
      </div>
      <div className="flex w-full mt-3">
         <ReactSelect
                  name="studentClass"
                  value={selectedClass}
                  handleChange={handleClassChange}
                  label="Select a Class"
                  dynamicOptions={dynamicOptions}
                />
                <ReactSelect
                  name="studentSection"
                  value={selectedSection} // Use selectedSection state
                  handleChange={handleSectionChange} // Use the handleSectionChange function
                  label="Select a Section"
                  dynamicOptions={DynamicSection}
                />
        {/* <div className="">
        
          <select
            className="p-2 border rounded mr-2"
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setSelectedSection("");
              setSelectedStudent("");
            }}
          >
            <option value="">Select Class</option>
            {classes?.map((cls) => (
              <option key={cls._id} value={cls.className}>
                {cls.className}
              </option>
            ))}
          </select>
        </div>
        {selectedClass && (
          <div className="">
            
            <select
              className="p-2 border rounded mr-2"
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedStudent("");
              }}
            >
              <option value="">Select Section</option>
              {classes
                ?.filter((cls) => cls.className === selectedClass)
                ?.map((cls) => (
                  <option key={cls._id} value={cls.sections}>
                    {cls.sections}
                  </option>
                ))}
            </select>
          </div>
        )} */}
        <div className="">
          {/* Student Dropdown */}
          <select
            className="p-2 border rounded mr-2"
            onChange={(e) => {
              const selected = allStudents.find(
                (student) => student?._id === e.target.value
              );
              setSelectedStudent(selected);
            }}
            disabled={!selectedClass}
          >
            <option value="">Select a student</option>
            {filteredStudents?.map((student) => (
              <option key={student?._id} value={student?._id}>
                {student?.studentName} - Class {student?.class} {student?.section}{" "}
                (Roll No: {student?.rollNo})
              </option>
            ))}
          </select>
        </div>
         <div className="">
           {
             filteredExamData?.length > 0 ?
           
         
            (
                <select
                    className="p-2 border rounded"
                    value={selectedTerm}
                    onChange={handleTermChange}
                >
                  <option value="">All terms</option>
                  {filteredExamData?.map((exam) => (
                    <option key={exam?._id} value={exam?._id}>
                      {exam?.name}
                    </option>
                  ))}
                </select>
                
            )
                 :  <p className="p-2">No data found</p>
           }
        </div>
      </div>
      <div className="w-full flex justify-center">
        <div className="a4">
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
                        <td className="whitespace-nowrap text-blue-700 font-semibold">
                          {selectedStudent?.admissionNumber || "N/A"}
                        </td>
                      </tr>
                      <tr>
                        <td className="font-semibold py-1 whitespace-nowrap">
                          Student's Name :
                        </td>
                        <td className="whitespace-nowrap">
                          {selectedStudent?.studentName || "N/A"}
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
                            ? new Date(selectedStudent.dateOfBirth).toLocaleDateString(
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
                      selectedStudent?.image?.url ||
                      "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                    }
                    alt="Student"
                    className="w-24 h-24 object-cover border border-gray-300 "
                  />
                </div>
              </div>

              {renderExamTable()}

              {/* General Instructions */}
              <div className="mb-4 mt-4 text-[12px]">
                <h4 className="font-semibold mb-1 ">
                  General/Exam Instructions for Students
                </h4>
                <ol className="list-decimal pl-5">
                  <li>Check the exam timetable carefully.</li>
                  <li>Students must bring their own lunch to school.</li>
                  <li>
                    Students must bring the "
                    <span className="font-semibold">Admit Card</span>" and show it
                    to the invigilator(s) on duty and should preserve it for
                    future requirements.
                  </li>
                  <li>
                    Mobile Phone, Calculator, Digital Watch or any Electronic
                    Device is <span className="font-semibold">NOT ALLOWED</span>.
                  </li>
                  <li>
                    Arrive at the School at least 15 minutes before the start of
                    the examination.
                  </li>
                  <li>
                    Student is barred from entering the examination hall 15
                    minutes after the written examination starts.
                  </li>
                  <li>
                    Ensure that you use the washroom before arriving for your exam
                    as you will not be permitted to leave during the first hour.
                  </li>
                  <li>
                    Normally, you are required to answer questions using blue or
                    black ink. Make sure you bring some spare pens with you.
                  </li>
                  <li>
                    Keep your eyes on your own paper. Remember, copying is
                    cheating!
                  </li>
                  <li>
                    You must remain silent until after you have exited the school
                    building.
                  </li>
                </ol>
              </div>

              <div className="flex justify-between mt-6 text-sm">
                <div className="text-center">
                  <p className="font-semibold">Date of Issue</p>
                  <p className="border-t pt-1">{formatIssueDate(resultPublishDate)}</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">Signature of the Guardian</p>
                  <p className="border-t pt-1">............................</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">Class Teacher</p>
                  <p className="border-t pt-1">............................</p>
                </div>
                <div className="text-center">
                  <p className="font-semibold">Principal</p>
                  <p className="border-t pt-1">{SchoolDetails?.fullName}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdmitCardUi;



// import React, { useEffect, useRef, useState } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import axios from "axios";
// import Cookies from "js-cookie";

// const AdmitCardUi = () => {
//     const [selectedStudent, setSelectedStudent] = useState(null);
//     const { currentColor } = useStateContext();
//      const [classes, setClasses] = useState([]);
//      console.log("classes",classes)
//     const [loading, setLoading] = useState(false);
//     const [allStudents, setAllStudents] = useState([]);
//     // console.log("allStudents",allStudents)
//     const [examData, setExamData] = useState([]);
//     console.log("examData",examData)
//     const [selectedTerm, setSelectedTerm] = useState("");
//     const [resultPublishDate, setResultPublishDate] = useState(null); // New state for result publish date
//     const schoolImage = sessionStorage.getItem("schoolImage");
//     const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));
//     const componentPDF = useRef();
//     const authToken = Cookies.get("token");

//     const generatePDF = useReactToPrint({
//         content: () => componentPDF.current,
//         documentTitle: `${selectedStudent?.fullName || "Student"}_Admit_Card`,
//         onAfterPrint: () => alert("Downloaded successfully"),
//     });

//   useEffect(() => {
//     axios
//       .get(
//         `https://dvsserver.onrender.com/api/v1/adminRoute/getAllClasses`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setClasses(response.data.classList);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);
//     const getResult = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://dvsserver.onrender.com/api/v1/exam/getExams",
               
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                     },
//                 }
//             );
//             setLoading(false);
//             setExamData(response.data.exams);
//             console.log("examsexamsexamsexamsexamsexams",response.data.exams)
//         } catch (error) {
//             console.error("Error fetching exams:", error);
//             setLoading(false);
//         }
//     };
//     const getAllStudents = async () => {
//         setLoading(true);
//         try {
//             const response = await axios.get(
//                 "https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents",
//                 {
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                     },
//                 }
//             );
//             setLoading(false);
//             setAllStudents(response.data.allStudent);
//         } catch (error) {
//             console.error("Error fetching exams:", error);
//             setLoading(false);
//         }
//     };

//     useEffect(() => {
//         getResult();
//         getAllStudents()
//     }, []);



//     const handleTermChange = (event) => {
//         setSelectedTerm(event.target.value);
//         //Update the resultPublishDate state when term is changed
//         const selectedExam = examData.find((exam) => exam._id === event.target.value);
//         if(selectedExam){
//             setResultPublishDate(selectedExam.resultPublishDate);
//         }else{
//              setResultPublishDate(null); //Reset if nothing selected.
//         }
//     };

//     const getDay = (date) => {
//         const day = new Date(date).toLocaleDateString("en-US", { weekday: 'long' })
//         return day
//     }

//     const formatDate = (date) => {
//         return new Date(date).toLocaleDateString("en-GB", {
//             day: "2-digit",
//             month: "2-digit",
//             year: "numeric",
//         });
//     }

//       const formatIssueDate = (date) => { //function for date of issue
//     if (!date) return "N/A";
//     return new Date(date).toLocaleDateString("en-GB", {
//         day: "2-digit",
//         month: "short",
//         year: "numeric",
//       });
//   };


//     const formatTime = (time) => {
//         const [hours, minutes] = time.split(':');
//         const date = new Date();
//         date.setHours(parseInt(hours, 10))
//         date.setMinutes(parseInt(minutes, 10))
//         return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', });
//     }

//     const renderExamTable = () => {
//         if (!examData || examData.length === 0) {
//             return <p>No exams scheduled.</p>;
//         }

//         const filteredExams = selectedTerm
//             ? examData.filter((exam) => exam._id === selectedTerm)
//             : examData;

//         return filteredExams?.map((exam) => (
//             <div className="mb-4 border-2" key={exam._id}>
//                 <h4 className="font-bold text-lg  p-2">{exam.name}</h4>
//                 <table className="w-full mb-1 text-sm border-collapse border border-gray-300">
//                     <thead>
//                         <tr className="">
//                             <th className="border border-gray-300 p-2">Subject</th>
//                             <th className="border border-gray-300 p-2">Examination Date</th>
//                             <th className="border border-gray-300 p-2">Day</th>
//                             <th className="border border-gray-300 p-2">Timing</th>
//                             <th className="border border-gray-300 p-2">Checked By</th>
//                         </tr>
//                     </thead>
//                     <tbody>
//                         {exam?.subjects?.map((subject) => (
//                             <tr key={subject._id}>
//                                 <td className="border border-gray-300 p-2">{subject.name}</td>
//                                 <td className="border border-gray-300 p-2">
//                                     {formatDate(subject.examDate)}
//                                 </td>
//                                 <td className="border border-gray-300 p-2">
//                                     {getDay(subject.examDate)}
//                                 </td>
//                                 <td className="border border-gray-300 p-2">
//                                     {formatTime(subject.startTime)} to {formatTime(subject.endTime)}
//                                 </td>
//                                 <td className="border border-gray-300 p-2">
//                                     ....................
//                                 </td>
//                             </tr>
//                         ))}
//                     </tbody>
//                 </table>
//             </div>
//         ));
//     };

//     return (
//         <div>
//             <div
//                 className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white  py-2 px-2"
//                 style={{
//                     background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)`,
//                 }}
//             >
//                 <p className="text-lg">Admit Card</p>
//                 <MdDownload onClick={generatePDF} className="text-2xl cursor-pointer" />
//             </div>
//            <div className="flex w-full">
//            <div className="">
//                 {/* <h3 className="text-lg font-semibold mb-2">Select Student</h3> */}
//                 <select
//                     className="p-2 border rounded"
//                     onChange={(e) => {
//                         const selected = allStudents.find(
//                             (student) => student?._id === e.target.value
//                         );
//                         setSelectedStudent(selected);
//                     }}
//                 >
//                     <option value="">Select a student</option>
//                     {allStudents?.map((student) => (
//                         <option key={student?._id} value={student?._id}>
//                             {student?.fullName} - Class {student?.class} {student?.section}{" "}
//                             (Roll No: {student?.rollNo})
//                         </option>
//                     ))}
//                 </select>
//             </div>
//             <div className="">
//                 {/* <h3 className="text-lg font-semibold mb-2">Select Term</h3> */}
//                 <select
//                     className="p-2 border rounded"
//                     value={selectedTerm}
//                     onChange={handleTermChange}
//                 >
//                     <option value="">All terms</option>
//                     {examData?.map((exam) => (
//                         <option key={exam?._id} value={exam?._id}>
//                             {exam?.name}
//                         </option>
//                     ))}
//                 </select>
//             </div>
//            </div>
//             <div className="w-full flex justify-center">
//                 <div className="a4">
//                     <div ref={componentPDF} className="p-12">
//                         <div className="bg-white border-2 rounded-md p-6 max-w-4xl mx-auto mb-6">
//                             <div className="flex items-center justify-between mb-6">
//                                 <div className="h-[70px] w-[70px]">
//                                     <img
//                                         src={schoolImage}
//                                         alt="School Logo"
//                                         className="w-full object-contain"
//                                     />
//                                 </div>
//                                 <div className="text-center">
//                                     <h1 className="text-red-600 font-bold text-3xl">
//                                         {SchoolDetails?.schoolName}
//                                     </h1>
//                                     <p className="text-blue-600 text-xl">
//                                         {SchoolDetails?.address}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.email}
//                                     </p>
//                                     <p className="text-green-600 text-sm font-bold">
//                                         {SchoolDetails?.contact}
//                                     </p>
//                                 </div>
//                                 <div className="w-[70px]"></div>
//                             </div>

//                             <div className="grid grid-cols-3 gap-4 border p-2 mb-1">
//                                 <div>
//                                     <table className=" text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Admission No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap text-blue-700 font-semibold">
//                                                     {selectedStudent?.admissionNumber || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Student's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {selectedStudent?.fullName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Father's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {selectedStudent?.fatherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Mother's Name :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {selectedStudent?.motherName || "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div>
//                                     <table className="ml-3 text-sm">
//                                         <tbody>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Class :
//                                                 </td>
//                                                 <td>
//                                                     {selectedStudent?.class || "N/A"}-
//                                                     {selectedStudent?.section || ""}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1 whitespace-nowrap">
//                                                     Roll No. :
//                                                 </td>
//                                                 <td className="whitespace-nowrap">
//                                                     {selectedStudent?.rollNo || "N/A"}
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td className="font-semibold py-1">DOB :</td>
//                                                 <td>
//                                                     {selectedStudent?.dateOfBirth
//                                                         ? new Date(
//                                                             selectedStudent.dateOfBirth
//                                                         ).toLocaleDateString("en-GB", {
//                                                             day: "2-digit",
//                                                             month: "2-digit",
//                                                             year: "numeric",
//                                                         })
//                                                         : "N/A"}
//                                                 </td>
//                                             </tr>
//                                         </tbody>
//                                     </table>
//                                 </div>

//                                 <div className="flex justify-end ">
//                                     <img
//                                         src={
//                                             selectedStudent?.image?.url ||
//                                             "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
//                                         }
//                                         alt="Student"
//                                         className="w-24 h-24 object-cover border border-gray-300 "
//                                     />
//                                 </div>
//                             </div>

//                             {renderExamTable()}

//                             {/* General Instructions */}
//                             <div className="mb-4 mt-4 text-[12px]">
//                                 <h4 className="font-semibold mb-1 ">
//                                     General/Exam Instructions for Students
//                                 </h4>
//                                 <ol className="list-decimal pl-5">
//                                     <li>Check the exam timetable carefully.</li>
//                                     <li>Students must bring their own lunch to school.</li>
//                                     <li>
//                                         Students must bring the '
//                                         <span className="font-semibold">Admit Card</span>' and show it
//                                         to the invigilator(s) on duty and should preserve it for
//                                         future requirements.
//                                     </li>
//                                     <li>
//                                         Mobile Phone, Calculator, Digital Watch or any Electronic
//                                         Device is <span className="font-semibold">NOT ALLOWED</span>.
//                                     </li>
//                                     <li>Arrive at the School at least 15 minutes before the start of the examination.</li>
//                                     <li>
//                                         Student is barred from entering the examination hall 15
//                                         minutes after the written examination starts.
//                                     </li>
//                                     <li>
//                                         Ensure that you use the washroom before arriving for your exam
//                                         as you will not be permitted to leave during the first hour.
//                                     </li>
//                                     <li>
//                                         Normally, you are required to answer questions using blue or
//                                         black ink. Make sure you bring some spare pens with you.
//                                     </li>
//                                     <li>Keep your eyes on your own paper. Remember, copying is cheating!</li>
//                                     <li>
//                                         You must remain silent until after you have exited the school
//                                         building.
//                                     </li>
                                    
//                                 </ol>
//                             </div>

//                             <div className="flex justify-between mt-6 text-sm">
//                                 <div className="text-center">
//                                     <p className="font-semibold">Date of Issue</p>
//                                     <p className="border-t pt-1">{formatIssueDate(resultPublishDate)}</p> {/* Use formatted date */}
//                                 </div>
//                                 <div className="text-center">
//                                     <p className="font-semibold">Signature of the Guardian</p>
//                                     <p className="border-t pt-1">............................</p>
//                                 </div>
//                                 <div className="text-center">
//                                     <p className="font-semibold">Class Teacher</p>
//                                     <p className="border-t pt-1">............................</p>
//                                 </div>
                              
//                                 <div className="text-center">
//                     <p className="font-semibold">Principal</p>
//                     <p className="border-t pt-1">{SchoolDetails?.fullName}</p>
//                    </div>
//                             </div>

//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default AdmitCardUi;




// import React, { useEffect, useState, useRef } from "react";
// import PropTypes from "prop-types";
// import SwipeableViews from "react-swipeable-views";
// import { useTheme } from "@mui/material/styles";
// import AppBar from "@mui/material/AppBar";
// import Tabs from "@mui/material/Tabs";
// import Tab from "@mui/material/Tab";
// import Typography from "@mui/material/Typography";
// import Box from "@mui/material/Box";
// import { useParams } from "react-router-dom";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import Loading from "../../../Loading";
// import SomthingwentWrong from "../../../SomthingwentWrong";
// import useCustomQuery from "../../../useCustomQuery";
// import axios from "axios";
// import "./printSize.css";
// import Cookies from "js-cookie";
// import { useReactToPrint } from "react-to-print";
// import {
//   Button,
//   FormControl,
//   Grid,
//   InputLabel,
//   MenuItem,
//   Select,
//   TextField,
// } from "@mui/material";
// import Card from "./Card";
// const authToken = Cookies.get("token");

// function TabPanel(props) {
//   const { children, value, index, ...other } = props;

//   return (
//     <Typography
//       component="div"
//       role="tabpanel"
//       hidden={value !== index}
//       id={`action-tabpanel-${index}`}
//       aria-labelledby={`action-tab-${index}`}
//       {...other}
//     >
//       {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
//     </Typography>
//   );
// }

// TabPanel.propTypes = {
//   children: PropTypes.node,
//   index: PropTypes.number.isRequired,
//   value: PropTypes.number.isRequired,
// };

// function a11yProps(index) {
//   return {
//     id: `action-tab-${index}`,
//     "aria-controls": `action-tabpanel-${index}`,
//   };
// }

// const AdmitCardUi = () => {
//   const { currentColor } = useStateContext();
//   const [filterName, setFilterName] = useState("");
//   const [filterClass, setFilterClass] = useState("");
//   const [filteredStudentData, setFilterdStudentData] = useState([]);
//   const componentPDF = useRef();
 
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     onBeforeGetContent: () => {
//       document.title = `All Admit Card`;
//     },
//     onAfterPrint: () => {
//       alert("modalData saved in PDF");
//       setTimeout(() => {
//         document.title = "OriginalTitle";
//       }, 100);
//     },
//   });

//   const [examData, setExamData] = useState([]);
//   const [selectedExam, setSelectedExam] = useState("");
//   const [total, SetTotal] = useState(0);
//   const { email } = useParams();
//   const [studentData, setStudentData] = useState([]);

//   const {
//     queryData: admitCard,
//     loading: admitCardLoading,
//     error: admitCardError,
//   } = useCustomQuery(
//     "https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents"
//   );
// // console.log("firstadmitCard".admitCard)
//   const {
//     queryData: allExam,
//     loading: allExamLoading,
//     error: allExamError,
//   } = useCustomQuery(
//     "https://dvsserver.onrender.com/api/v1/exam/getAllExams"
//   );

//   useEffect(() => {
//     if (admitCard) {
//       setStudentData(admitCard.allStudent);
//       setFilterdStudentData(admitCard.allStudent);
//     }
//   }, [admitCard]);
//   useEffect(() => {
//     if (allExam) {
//       setExamData(allExam.examData);
//       SetTotal(allExam.examData.length);
//     }
//   }, [allExam]);
  



//   const handleExamChange = (e) => {
//     setSelectedExam(e.target.value);
//   };

//   const selectedExamData = examData.find(
//     (exam) => exam.examName === selectedExam
//   );

//   const getDayOfWeek = (dateString) => {
//     const daysOfWeek = [
//       "Sunday",
//       "Monday",
//       "Tuesday",
//       "Wednesday",
//       "Thursday",
//       "Friday",
//       "Saturday",
//     ];
//     const date = new Date(dateString);
//     const dayIndex = date.getDay();
//     return daysOfWeek[dayIndex];
//   };
//   const formatExamDate = (examDate) => {
//     const date = new Date(examDate);
//     return date.toISOString().split("T")[0];
//   };

//   const handleFilterbyname = (e) => {
//     const value = e.target.value;
//     setFilterName(value);
//     filterStudents(filterClass, value);
//   };
//   const handleFilterByClass = (e) => {
//     let value = e.target.value;
//     setFilterClass(value);
//     filterStudents(value, filterName);
//   };
//   const filterStudents = (filterClass, nameFilter) => {
//     let filteredData = studentData;

//     if (filterClass) {
//       filteredData = filteredData.filter((student) =>
//         student.class.includes(filterClass.toLowerCase())
//       );
//     }
//     // if (nameFilter) {
//     //   filteredData = filteredData.filter((student) =>
//     //     student.fullName.includes(nameFilter.toLowerCase())
//     //   );
//     // }
//     if (nameFilter) {
//       const nameFilterRegex = new RegExp(nameFilter, 'i'); // 'i' makes it case-insensitive
//       filteredData = filteredData.filter((student) =>
//         nameFilterRegex.test(student.fullName)
//       );
//     }
    
//     setFilterdStudentData(filteredData);
//     SetTotal(filteredData.length);
//   };

//   const theme = useTheme();
//   const [value, setValue] = React.useState(0);

//   const handleChange = (event, newValue) => {
//     setValue(newValue);
//   };

//   const handleChangeIndex = (index) => {
//     setValue(index);
//   };

 

//   if (admitCardLoading) {
//     return <Loading />;
//   }

//   if (admitCardError) {
//     return <SomthingwentWrong />;
//   }
//   if (allExamLoading) {
//     return <Loading />;
//   }

//   if (allExamError) {
//     return <SomthingwentWrong />;
//   }
//   return (
//     <>
//       <div className="">
//         <div className="mb-5">
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={3}>
//               <FormControl
//                 variant="standard"
//                 sx={{ m: 1, minWidth: 80, width: "100%" }}
//               >
//                 <InputLabel id="demo-simple-select-standard-label">
//                   Select Exam
//                 </InputLabel>
//                 <Select
//                   labelId="demo-simple-select-standard-label"
//                   id="demo-simple-select-standard"
//                   value={selectedExam}
//                   onChange={handleExamChange}
//                   label="Select Exam"
//                 >
//                   {examData.map((exam) => (
//                     <MenuItem key={exam._id} value={exam.examName}>
//                       {exam.examName} - class:{exam.className}
//                       {exam.section}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <TextField
//                 id="filled-basic"
//                 label="searchBy class"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterByClass}
//                 value={filterClass}
//                 fullWidth
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={3}>
//               <TextField
//                 id="filled-basic"
//                 label="filterBy Name"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterbyname}
//                 value={filterName}
//                 fullWidth
//               />
//             </Grid>
//             <Grid item xs={12} sm={12} md={3}>
//               <Button
//                 variant="contained"
//                 onClick={generatePDF}
//                 style={{ backgroundColor: currentColor, width: "100%" }}
//                 className="h-12"
//               >
//                 Download
//               </Button>
//             </Grid>
//           </Grid>
//         </div>

//         <Box
//           sx={{
//             bgcolor: "background.paper",
//             position: "relative",
//             minHeight: 200,
//           }}
//         >
//           <AppBar position="static" color="default">
//             <Tabs
//               value={value}
//               onChange={handleChange}
//               indicatorColor="primary"
//               textColor="primary"
//               variant="fullWidth"
//               aria-label="action tabs example"
//             >
//               <Tab label="Theme One" {...a11yProps(0)} />
//               <Tab label="Theme Two" {...a11yProps(1)} />
//               <Tab label="Theme Three" {...a11yProps(2)} />
//             </Tabs>
//           </AppBar>
//           <SwipeableViews
//             axis={theme.direction === "rtl" ? "x-reverse" : "x"}
//             index={value}
//             onChangeIndex={handleChangeIndex}
//           >
//             <TabPanel value={value} index={0} dir={theme.direction}>
//               <Card
//                 filteredStudentData={filteredStudentData}
//                 componentPDF={componentPDF}
//                 selectedExamData={selectedExamData}
//                 formatExamDate={formatExamDate}
//                 getDayOfWeek={getDayOfWeek}
//                 total={total}
//               />
//             </TabPanel>
//             <TabPanel value={value} index={1} dir={theme.direction}>
//               Comming soon.....
//             </TabPanel>
//             <TabPanel value={value} index={2} dir={theme.direction}>
//               Comming soon.....
//             </TabPanel>
//           </SwipeableViews>
         
//         </Box>
       
//       </div>
//     </>
//   );
// };

// export default AdmitCardUi;
