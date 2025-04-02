



import React, { useEffect, useRef, useState, useCallback } from "react";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../contexts/ContextProvider";
import { MdDownload } from "react-icons/md";
import { toast } from "react-toastify";
import { ActiveStudents, AdminGetAllClasses, examresult, Allexamresult } from "../../Network/AdminApi";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import logo from "../../ShikshMitraWebsite/assets/school logo.jpg";
import sign from "../../ShikshMitraWebsite/assets/sign.png";
const ReportCard = () => {
  const { setIsLoader, currentColor } = useStateContext();
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [allStudents, setAllStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);
  const [dataToReport, setDataToReport] = useState({});
  const componentPDF = useRef();
  const user = JSON.parse(localStorage.getItem("user"));

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: `${
      isAllStudentsSelected
        ? "All_Students_Report_Cards"
        : selectedStudent?.studentName || "Student"
    }_Report_Card`,
    onAfterPrint: () => toast.success("Downloaded successfully"),
  });

  const fetchFullReportCard = useCallback(async (studentId = "") => {
    setIsLoader(true);
    try {
      let response;
      if (studentId === "all") {
        response = await Allexamresult(selectedClass, selectedSection);
      } else {
        response = await examresult(studentId);
      }

      if (response?.success) {
        setIsLoader(false);
        toast.success(response?.success);
        setDataToReport(studentId === "all" ? response?.reportCards || [] : response?.reportCard || {});
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error fetching full report card:", error);
      toast.error("Error fetching report card: " + (error.response?.data?.message || error.message));
    } finally {
      setIsLoader(false);
    }
  }, [selectedClass, selectedSection]);

  const allStudent = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents();
      if (response?.students?.data) {
        const filterStudent = response?.students?.data?.filter(
          (val) => val.class === selectedClass && val.section === selectedSection
        );
        setAllStudents(filterStudent || response.students.data);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students.");
    } finally {
      setIsLoader(false);
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    allStudent();
  }, [allStudent]);

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    const selectedClassObj = getClass.find((cls) => cls.className === selectedClassName);
    setAvailableSections(selectedClassObj ? selectedClassObj.sections : []);
    setSelectedSection("");
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  const getAllClass = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await AdminGetAllClasses();
      if (response?.success) {
        setIsLoader(false);
        setGetClass(response.classes.sort((a, b) => a - b));
      } else {
        toast.error(response?.message || "Failed to fetch classes.");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Error fetching classes.");
    } finally {
      setIsLoader(false);
    }
  }, []);

  useEffect(() => {
    getAllClass();
  }, [getAllClass]);

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));

  const DynamicSection = availableSections.map((item) => ({
    label: item,
    value: item,
  }));

  const handleStudentChange = useCallback(async (e) => {
    const selectedValue = e.target.value;
    setDataToReport({});
    setSelectedStudent(null);
    setIsAllStudentsSelected(false);

    if (selectedValue === "all") {
      setIsAllStudentsSelected(true);
      await fetchFullReportCard("all");
    } else if (selectedValue) {
      const selected = allStudents.find((student) => student?.studentId === selectedValue);
      setSelectedStudent(selected);
      if (selected?.studentId) {
        await fetchFullReportCard(selected.studentId);
      }
    }
  }, [allStudents, fetchFullReportCard]);

  const renderReportCard = (studentData = dataToReport) => {
    // Extract unique term keys dynamically from subjects
    const termKeys = new Set();
    studentData?.subjects?.forEach((subject) => {
      Object.keys(subject).forEach((key) => {
        if (key !== "name" && key !== "overallPercentage" && key !== "overallGrade") termKeys.add(key);
      });
    });
    const terms = Array.from(termKeys);

    // Extract unique assessment names dynamically for each term
    const assessmentMap = new Map();
    studentData?.subjects?.forEach((subject) => {
      terms.forEach((term) => {
        if (subject[term]) {
          const assessments = new Set(
            Object.keys(subject[term]).filter((key) => key !== "total" && key !== "grade" && key !== "percentage" && key !== "totalPossibleMarks" && key !== "totalMarks")
          );
          assessmentMap.set(term, assessments);
        }
      });
    });

    const getPerformanceLabel = (percentage) => {
      if (percentage >= 90 && percentage <= 100) return "Excellent, Performance! Keep it up" ;
      if (percentage >= 70 && percentage < 90) return "Very Good,Performance! Keep it up ";
      if (percentage >= 50 && percentage < 70) return "Good, Performance! Keep it up ";
      if (percentage >= 40 &&  percentage < 50) return "Fair, Performance! Keep it up";
      if (percentage >= 0 &&  percentage < 50) return "More focus is required. Have the potential to grow";
      if ( percentage < 40) return "More focus is required. Have the potential to grow";
      // if (percentage >= 60 &&  percentage < 70) return "Fair, Performance! Keep it up";
      // return "Needs Improvement";
    };
    
    // Extract unique co-scholastic area names dynamically
    const coScholasticAreas = new Set();
    studentData?.coScholastic?.forEach((row) => {
      Object.keys(row).forEach((key) => {
        if (key !== "term" && key !== "remarks") coScholasticAreas.add(key);
      });
    });
    const coScholasticHeaders = ["Term", ...Array.from(coScholasticAreas).map(area =>
      area.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
    )];

    return (
      <div className="flex justify-center items-center p-2">
        <div className=" px-2 pt-2 border-8 bg-blue-800   w-[210mm] h-[290mm] mx-auto ">
       <div className="rounded-3xl bg-white p-2 relative pt-5 h-[280mm]"
       
      //  style={{
      //   backgroundImage: `url(${logo})`,  // Background image set karna
      //   backgroundSize: "cover",           // Pure div ko cover karega
      //   backgroundPosition: "center",       // Image center me rahegi
      //   backgroundRepeat: "no-repeat",      // Repeat na ho
      //   opacity: 0.5,                       // Opacity kam karna (yahan 0.5 hai)
      // }}

       >
        <span className="absolute top-0 font-semibold left-1/2 text-blue-800">RECOGNISED</span>
        <span className="absolute top-0 font-semibold right-3 text-blue-800">School Code : 22751</span>
         <div className="flex gap-10">
            <div className="text-center mb-2 h-28 w-28 object-contain">
            {/* <div className="text-center mb-4 h-24 w-24 object-contain"> */}
              <img
              className="scale-100"
                src={logo || "https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg"}
                alt=""
              />
            </div>
            <div className="text-center mb-4">
              <h2 className="text-[40px] font-extrabold text-red-800 uppercase font-serif">Tagore Convent School</h2>
              <p className="text-base font-semibold">{user?.address}</p>
          <p className="text-lg font-semibold  text-blue-800">MOB : +918860686739</p>

              <span className="text-lg font-semibold bg-[#a52a2a] px-2 py-1 text-white">PROGRESS REPORT CARD</span>
             
              <p className="text-[18px] font-semibold  text-blue-800"> SESSION 2024-2025</p>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <table className="w-full border border-black   text-sm bg-[#d4ede5]">
              <tbody>
                <tr className="border border-black">
                  <td className="p-1 border border-black uppercase text-[14px]  font-semibold w-[140px]">Student Name</td>
                  <td className="p-1 border border-black font-semibold text-[14px] uppercase">{studentData?.name}</td>
                </tr>
                <tr className="border border-black">
                  <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Class-Sec</td>
                  <td className="p-1 border border-black font-semibold text-[14px]uppercase ">{studentData?.class}</td>
                </tr>
                <tr className="border border-black">
                  <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Adm No</td>
                  <td className="p-1 border border-black font-semibold text-[14px]  text-blue-900 uppercase">
                    {/* {studentData?.admNo} */}
                    </td>
                </tr>
              </tbody>
            </table>
            <table className="w-full border border-black  text-sm bg-[#d4ede5]">
              <tbody>
                <tr className="border border-black">
                  <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Date of Birth</td>
                  <td className="p-1 border border-black font-semibold text-[14px] ">
                    {studentData?.dob ? new Date(studentData.dob).toLocaleDateString() : "--"}
                  </td>
                </tr>
                <tr className="border border-black">
                  <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Mother's Name</td>
                  <td className="p-1 border border-black font-semibold text-[14px] uppercase ">{studentData?.motherName}</td>
                </tr>
                <tr className="border border-black">
                  <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Father's Name</td>
                  <td className="p-1 border border-black font-semibold text-[14px] uppercase ">{studentData?.fatherName}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <h1 className="uppercase p-[6px] font-bold bg-[#d3a9a9] text-white w-full">Scholastic Exam</h1>
          <table className="w-full border border-black text-center text-sm mb-4">
            <thead>
              <tr>
                <th rowSpan="2" className="border border-black bg-blue-800 text-white p-1">SUBJECT</th>
                {terms.map((term) => (
                  <th
                    key={term}
                    colSpan={(assessmentMap.get(term)?.size || 0) + 2}
                    className="border border-black p-1 bg-blue-800 text-white uppercase"
                  >
                    {term.toUpperCase().replace(/term/i, "TERM ")}
                  </th>
                ))}
                <th rowSpan="2" className="border border-black p-1 bg-blue-800 text-white">FINAL GRADE</th>
              </tr>
              <tr>
                {terms.map((term) => (
                  <React.Fragment key={term}>
                    {Array.from(assessmentMap.get(term) || []).map((header) => (
                      <th key={header} className="border border-black p-1 bg-blue-800 text-white">
                        {header}
                        <div className="text-xs uppercase">({studentData?.subjects?.[0]?.[term]?.[header]?.totalMarks || '--'})</div>
                      </th>
                    ))}
                    <th className="border border-black p-1 bg-blue-800 text-white">
                     TOTAL
                      <div className="text-xs">({studentData?.subjects?.[0]?.[term]?.totalPossibleMarks || '--'})</div>
                    </th>
                    <th className="border border-black p-1 bg-blue-800 text-white">GRADE</th>
                  </React.Fragment>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentData?.subjects?.map((subject, idx) => (
                <tr key={idx} className="border border-black">
                  <td className="p-1 border border-black bg-[#ffdada]">{subject.name}</td>
                  {terms.map((term) => (
                    <React.Fragment key={term}>
                      {Array.from(assessmentMap.get(term) || []).map((header) => (
                        <td key={header} className="p-1 border border-black">
                          {subject[term]?.[header]?.marksObtained ?? "--"}
                        </td>
                      ))}
                      <td className="p-1 border border-black bg-[#f6ede2]">{subject[term]?.total ?? "--"}</td>
                      <td className="p-1 border border-black bg-[#f6ede2]">{subject[term]?.grade ?? "--"}</td>
                    </React.Fragment>
                  ))}
                  <td className="p-1 border border-black bg-[#f0f8ff]">
                    {subject.overallGrade || subject[terms[terms.length - 1]]?.grade || "--"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h1 className="uppercase p-[6px] font-bold bg-[#d3a9a9] text-white w-full">Co Scholastic Exam</h1>
          <table className="w-full border border-black text-center text-sm mb-4">
            <thead>
              <tr>
                {coScholasticHeaders.map((heading, i) => (
                  <th key={i} className="border border-black p-1  bg-blue-800 text-white uppercase">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {studentData?.coScholastic?.map((row, idx) => (
                <tr key={idx} className="border border-black">
                  <td className="p-1 border border-black whitespace-nowrap ">{row.term}</td>
                  {Array.from(coScholasticAreas).map((area) => (
                    <td key={area} className="p-1 border border-black whitespace-nowrap">
                      {row[area] ?? "--"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          <h1 className="uppercase p-[6px] font-bold bg-[#d3a9a9] text-white w-full">Overall Performance</h1>
          <table className="w-full border border-black text-center text-sm mb-4">
            <tbody>
              <tr>
                <th className="border border-black p-1 text-start">Total Marks Obtained</th>
                <td className="border border-black p-1">{(studentData?.overallTotals?.totalMarksObtained)}</td>
              </tr>
              <tr>
                <th className="border border-black p-1 text-start">Total Marks</th>
                <td className="border border-black p-1">{(studentData?.overallTotals?.totalPossibleMarks)}</td>
              </tr>
              <tr>
                <th className="border border-black p-1 text-start">Overall Percentage</th>
                <td className="border border-black p-1">{studentData?.overallPercentage}</td>
              </tr>
              <tr>
                <th className="border border-black p-1 text-start">Overall Grade</th>
                <td className="border border-black p-1">{studentData?.overallGrade}</td>
              </tr>
            </tbody>
          </table>
 <p className="text-center font-bold text-sm mb-4 text-green-900 uppercase">RESULT: Promoted to Class __________________</p>
          <div className="flex text-sm font-semibold mb-4">
          <div className="text-center flex">
            <span>Class Teacher Remarks : </span>
            <p className="border-b-2 border-dotted border-black text-blue-800"> {getPerformanceLabel(studentData?.overallPercentage)}</p>
            </div>
          </div>
          {/* <div className="flex justify-around text-sm font-semibold mt-6"> */}
            <div className="text-center absolute left-2 bottom-2">
             
            <img src={sign} alt="" className="absolute left-2 bottom-7  ml-4 h-[35px]"/>
              <p>__________________</p>
              <p>Class Teacher</p>
             
            </div>
            <div className="text-center invisible">
              <p>__________________</p>
              <p>Exam I/C</p>
             
            </div>
            <div className="text-center absolute right-2 bottom-2">
            <img src={sign} alt="" className="absolute left-2 bottom-7 ml-4 h-[35px]"/>
              <p>__________________</p>
              <p>Principal</p>
             
            </div>
          </div>
       </div>
        {/* </div> */}
      </div>
    );
  };

  return (
    <>
      <div className="mb-4 mx-auto ">
        <div
          className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white py-2 px-2"
          style={{ background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)` }}
        >
          <p className="text-lg">Report Card</p>
          <MdDownload onClick={generatePDF} className="text-2xl cursor-pointer" />
        </div>
        <div className="w-full flex flex-col sm:flex-row gap-2 p-4">
          <ReactSelect
            required={true}
            name="studentClass"
            value={selectedClass}
            handleChange={handleClassChange}
            label="Select a Class"
            dynamicOptions={dynamicOptions}
          />
          <ReactSelect
            name="studentSection"
            value={selectedSection}
            handleChange={handleSectionChange}
            label="Select a Section"
            dynamicOptions={DynamicSection}
          />
          <div className="mb-4 w-full sm:w-auto">
            <select
              className="p-2 border rounded w-full sm:w-auto"
              onChange={handleStudentChange}
              value={isAllStudentsSelected ? "all" : selectedStudent?.studentId || ""}
            >
              <option value="">Select a student</option>
              <option value="all">All Students</option>
              {allStudents.map((student) => (
                <option key={student?.studentId} value={student?.studentId}>
                  {student?.studentName} - Class {student?.class} {student?.section} (Roll No: {student?.rollNo})
                </option>
              ))}
            </select>
          </div>
         
        </div>
       <div ref={componentPDF}>
         {isAllStudentsSelected ? (
           Array.isArray(dataToReport) ? (
             dataToReport?.map((student, index) => (
               <div key={index} style={{ pageBreakAfter: "always" }}>
                 {renderReportCard(student)}
               </div>
             ))
           ) : (
             <div>No data to display.</div>
           )
         ) : (
           dataToReport && Object.keys(dataToReport).length > 0 ? (
             renderReportCard(dataToReport)
           ) : (
             <div>No data to display.</div>
           )
         )}
       </div>
      </div>
    </>
  );
};

export default ReportCard;




// import React, { useEffect, useRef, useState, useCallback } from "react";
// import { useReactToPrint } from "react-to-print";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { MdDownload } from "react-icons/md";
// import { toast } from "react-toastify";
// import { LastYearStudents, AdminGetAllClasses, examresult, Allexamresult } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import logo from "../../ShikshMitraWebsite/assets/school logo.jpg";
// import sign from "../../ShikshMitraWebsite/assets/sign.png";
// const ReportCard = () => {
//   const { setIsLoader, currentColor } = useStateContext();
//   const [getClass, setGetClass] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);
//   const [selectedSection, setSelectedSection] = useState("");
//   const [allStudents, setAllStudents] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState(null);
//   const [isAllStudentsSelected, setIsAllStudentsSelected] = useState(false);
//   const [dataToReport, setDataToReport] = useState({});
//   const componentPDF = useRef();
//   const user = JSON.parse(localStorage.getItem("user"));

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${
//       isAllStudentsSelected
//         ? "All_Students_Report_Cards"
//         : selectedStudent?.studentName || "Student"
//     }_Report_Card`,
//     onAfterPrint: () => toast.success("Downloaded successfully"),
//   });

//   const fetchFullReportCard = useCallback(async (studentId = "") => {
//     setIsLoader(true);
//     try {
//       let response;
//       if (studentId === "all") {
//         response = await Allexamresult(selectedClass, selectedSection);
//       } else {
//         response = await examresult(studentId);
//       }

//       if (response?.success) {
//         setIsLoader(false);
//         toast.success(response?.success);
//         setDataToReport(studentId === "all" ? response?.reportCards || [] : response?.reportCard || {});
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.error("Error fetching full report card:", error);
//       toast.error("Error fetching report card: " + (error.response?.data?.message || error.message));
//     } finally {
//       setIsLoader(false);
//     }
//   }, [selectedClass, selectedSection]);

//   const allStudent = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await LastYearStudents();
//       if (response?.students?.data) {
//         const filterStudent = response?.students?.data?.filter(
//           (val) => val.class === selectedClass && val.section === selectedSection
//         );
//         setAllStudents(filterStudent || response.students.data);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("Error fetching students.");
//     } finally {
//       setIsLoader(false);
//     }
//   }, [selectedClass, selectedSection]);

//   useEffect(() => {
//     allStudent();
//   }, [allStudent]);

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass.find((cls) => cls.className === selectedClassName);
//     setAvailableSections(selectedClassObj ? selectedClassObj.sections : []);
//     setSelectedSection("");
//   };

//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value);
//   };

//   const getAllClass = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         setIsLoader(false);
//         setGetClass(response.classes.sort((a, b) => a - b));
//       } else {
//         toast.error(response?.message || "Failed to fetch classes.");
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("Error fetching classes.");
//     } finally {
//       setIsLoader(false);
//     }
//   }, []);

//   useEffect(() => {
//     getAllClass();
//   }, [getAllClass]);

//   const dynamicOptions = getClass.map((cls) => ({
//     label: cls.className,
//     value: cls.className,
//   }));

//   const DynamicSection = availableSections.map((item) => ({
//     label: item,
//     value: item,
//   }));

//   const handleStudentChange = useCallback(async (e) => {
//     const selectedValue = e.target.value;
//     setDataToReport({});
//     setSelectedStudent(null);
//     setIsAllStudentsSelected(false);

//     if (selectedValue === "all") {
//       setIsAllStudentsSelected(true);
//       await fetchFullReportCard("all");
//     } else if (selectedValue) {
//       const selected = allStudents.find((student) => student?.studentId === selectedValue);
//       setSelectedStudent(selected);
//       if (selected?.studentId) {
//         await fetchFullReportCard(selected.studentId);
//       }
//     }
//   }, [allStudents, fetchFullReportCard]);

//   const renderReportCard = (studentData = dataToReport) => {
//     // Extract unique term keys dynamically from subjects
//     const termKeys = new Set();
//     studentData?.subjects?.forEach((subject) => {
//       Object.keys(subject).forEach((key) => {
//         if (key !== "name" && key !== "overallPercentage" && key !== "overallGrade") termKeys.add(key);
//       });
//     });
//     const terms = Array.from(termKeys);

//     // Extract unique assessment names dynamically for each term
//     const assessmentMap = new Map();
//     studentData?.subjects?.forEach((subject) => {
//       terms.forEach((term) => {
//         if (subject[term]) {
//           const assessments = new Set(
//             Object.keys(subject[term]).filter((key) => key !== "total" && key !== "grade" && key !== "percentage" && key !== "totalPossibleMarks" && key !== "totalMarks")
//           );
//           assessmentMap.set(term, assessments);
//         }
//       });
//     });

//     const getPerformanceLabel = (percentage) => {
//       if (percentage >= 90 && percentage <= 100) return "Excellent, Performance! Keep it up" ;
//       if (percentage >= 70 && percentage < 90) return "Very Good,Performance! Keep it up ";
//       if (percentage >= 50 && percentage < 70) return "Good, Performance! Keep it up ";
//       if (percentage >= 40 &&  percentage < 50) return "Fair, Performance! Keep it up";
//       if (percentage >= 0 &&  percentage < 50) return "More focus is required. Have the potential to grow";
//       if ( percentage < 40) return "More focus is required. Have the potential to grow";
//       // if (percentage >= 60 &&  percentage < 70) return "Fair, Performance! Keep it up";
//       // return "Needs Improvement";
//     };
    
//     // Extract unique co-scholastic area names dynamically
//     const coScholasticAreas = new Set();
//     studentData?.coScholastic?.forEach((row) => {
//       Object.keys(row).forEach((key) => {
//         if (key !== "term" && key !== "remarks") coScholasticAreas.add(key);
//       });
//     });
//     const coScholasticHeaders = ["Term", ...Array.from(coScholasticAreas).map(area =>
//       area.split(/(?=[A-Z])/).map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
//     )];

//     return (
//       <div className="flex justify-center items-center p-2">
//         <div className=" px-2 pt-2 border-8 bg-blue-800   w-[210mm] h-[290mm] mx-auto ">
//        <div className="rounded-3xl bg-white p-2 relative pt-5"
       
//       //  style={{
//       //   backgroundImage: `url(${logo})`,  // Background image set karna
//       //   backgroundSize: "cover",           // Pure div ko cover karega
//       //   backgroundPosition: "center",       // Image center me rahegi
//       //   backgroundRepeat: "no-repeat",      // Repeat na ho
//       //   opacity: 0.5,                       // Opacity kam karna (yahan 0.5 hai)
//       // }}

//        >
//         <span className="absolute top-0 font-semibold left-1/2 text-blue-800">RECOGNISED</span>
//         <span className="absolute top-0 font-semibold right-3 text-blue-800">School Code : 22751</span>
//          <div className="flex gap-10">
//             <div className="text-center mb-2 h-28 w-28 object-contain">
//             {/* <div className="text-center mb-4 h-24 w-24 object-contain"> */}
//               <img
//               className="scale-100"
//                 src={logo || "https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg"}
//                 alt=""
//               />
//             </div>
//             <div className="text-center mb-4">
//               <h2 className="text-[40px] font-extrabold text-red-800 uppercase font-serif">Tagore Convent School</h2>
//               <p className="text-base font-semibold">{user?.address}</p>
//           <p className="text-lg font-semibold  text-blue-800">MOB : +918860686739</p>

//               <span className="text-lg font-semibold bg-[#a52a2a] px-2 py-1 text-white">PROGRESS REPORT CARD</span>
             
//               <p className="text-[18px] font-semibold  text-blue-800"> SESSION 2024-2025</p>
//             </div>
//           </div>

//           <div className="flex gap-4 mb-4">
//             <table className="w-full border border-black   text-sm bg-[#d4ede5]">
//               <tbody>
//                 <tr className="border border-black">
//                   <td className="p-1 border border-black uppercase text-[14px]  font-semibold w-[140px]">Student Name</td>
//                   <td className="p-1 border border-black font-semibold text-[14px] uppercase">{studentData?.name}</td>
//                 </tr>
//                 <tr className="border border-black">
//                   <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Class-Sec</td>
//                   <td className="p-1 border border-black font-semibold text-[14px]uppercase ">{studentData?.class}</td>
//                 </tr>
//                 <tr className="border border-black">
//                   <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Adm No</td>
//                   <td className="p-1 border border-black font-semibold text-[14px]  text-blue-900 uppercase">
//                     {/* {studentData?.admNo} */}
//                     </td>
//                 </tr>
//               </tbody>
//             </table>
//             <table className="w-full border border-black  text-sm bg-[#d4ede5]">
//               <tbody>
//                 <tr className="border border-black">
//                   <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Date of Birth</td>
//                   <td className="p-1 border border-black font-semibold text-[14px] ">
//                     {studentData?.dob ? new Date(studentData.dob).toLocaleDateString() : "--"}
//                   </td>
//                 </tr>
//                 <tr className="border border-black">
//                   <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Mother's Name</td>
//                   <td className="p-1 border border-black font-semibold text-[14px] uppercase ">{studentData?.motherName}</td>
//                 </tr>
//                 <tr className="border border-black">
//                   <td className="p-1 border border-black font-semibold uppercase text-[14px]  w-[140px]">Father's Name</td>
//                   <td className="p-1 border border-black font-semibold text-[14px] uppercase ">{studentData?.fatherName}</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <h1 className="uppercase p-[6px] font-bold bg-[#d3a9a9] text-white w-full">Scholastic Exam</h1>
//           <table className="w-full border border-black text-center text-sm mb-4">
//             <thead>
//               <tr>
//                 <th rowSpan="2" className="border border-black bg-blue-800 text-white p-1">SUBJECT</th>
//                 {terms.map((term) => (
//                   <th
//                     key={term}
//                     colSpan={(assessmentMap.get(term)?.size || 0) + 2}
//                     className="border border-black p-1 bg-blue-800 text-white uppercase"
//                   >
//                     {term.toUpperCase().replace(/term/i, "TERM ")}
//                   </th>
//                 ))}
//                 <th rowSpan="2" className="border border-black p-1 bg-blue-800 text-white">FINAL GRADE</th>
//               </tr>
//               <tr>
//                 {terms.map((term) => (
//                   <React.Fragment key={term}>
//                     {Array.from(assessmentMap.get(term) || []).map((header) => (
//                       <th key={header} className="border border-black p-1 bg-blue-800 text-white">
//                         {header}
//                         <div className="text-xs uppercase">({studentData?.subjects?.[0]?.[term]?.[header]?.totalMarks || '--'})</div>
//                       </th>
//                     ))}
//                     <th className="border border-black p-1 bg-blue-800 text-white">
//                      TOTAL
//                       <div className="text-xs">({studentData?.subjects?.[0]?.[term]?.totalPossibleMarks || '--'})</div>
//                     </th>
//                     <th className="border border-black p-1 bg-blue-800 text-white">GRADE</th>
//                   </React.Fragment>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {studentData?.subjects?.map((subject, idx) => (
//                 <tr key={idx} className="border border-black">
//                   <td className="p-1 border border-black bg-[#ffdada]">{subject.name}</td>
//                   {terms.map((term) => (
//                     <React.Fragment key={term}>
//                       {Array.from(assessmentMap.get(term) || []).map((header) => (
//                         <td key={header} className="p-1 border border-black">
//                           {subject[term]?.[header]?.marksObtained ?? "--"}
//                         </td>
//                       ))}
//                       <td className="p-1 border border-black bg-[#f6ede2]">{subject[term]?.total ?? "--"}</td>
//                       <td className="p-1 border border-black bg-[#f6ede2]">{subject[term]?.grade ?? "--"}</td>
//                     </React.Fragment>
//                   ))}
//                   <td className="p-1 border border-black bg-[#f0f8ff]">
//                     {subject.overallGrade || subject[terms[terms.length - 1]]?.grade || "--"}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h1 className="uppercase p-[6px] font-bold bg-[#d3a9a9] text-white w-full">Co Scholastic Exam</h1>
//           <table className="w-full border border-black text-center text-sm mb-4">
//             <thead>
//               <tr>
//                 {coScholasticHeaders.map((heading, i) => (
//                   <th key={i} className="border border-black p-1  bg-blue-800 text-white uppercase">{heading}</th>
//                 ))}
//               </tr>
//             </thead>
//             <tbody>
//               {studentData?.coScholastic?.map((row, idx) => (
//                 <tr key={idx} className="border border-black">
//                   <td className="p-1 border border-black whitespace-nowrap ">{row.term}</td>
//                   {Array.from(coScholasticAreas).map((area) => (
//                     <td key={area} className="p-1 border border-black whitespace-nowrap">
//                       {row[area] ?? "--"}
//                     </td>
//                   ))}
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           <h1 className="uppercase p-[6px] font-bold bg-[#d3a9a9] text-white w-full">Overall Performance</h1>
//           <table className="w-full border border-black text-center text-sm mb-4">
//             <tbody>
//               <tr>
//                 <th className="border border-black p-1 text-start">Total Marks Obtained</th>
//                 <td className="border border-black p-1">{(studentData?.overallTotals?.totalMarksObtained)}</td>
//               </tr>
//               <tr>
//                 <th className="border border-black p-1 text-start">Total Marks</th>
//                 <td className="border border-black p-1">{(studentData?.overallTotals?.totalPossibleMarks)}</td>
//               </tr>
//               <tr>
//                 <th className="border border-black p-1 text-start">Overall Percentage</th>
//                 <td className="border border-black p-1">{studentData?.overallPercentage}</td>
//               </tr>
//               <tr>
//                 <th className="border border-black p-1 text-start">Overall Grade</th>
//                 <td className="border border-black p-1">{studentData?.overallGrade}</td>
//               </tr>
//             </tbody>
//           </table>
//  <p className="text-center font-bold text-sm mb-4 text-green-900 uppercase">RESULT: Promoted to Class __________________</p>
//           <div className="flex text-sm font-semibold mb-4">
//           <div className="text-center flex">
//             <span>Class Teacher Remarks : </span>
//             <p className="border-b-2 border-dotted border-black text-blue-800"> {getPerformanceLabel(studentData?.overallPercentage)}</p>
//             </div>
//           </div>
//           <div className="flex justify-around text-sm font-semibold mt-6">
//             <div className="text-center">
             
              
//               <p>__________________</p>
//               <p>Class Teacher</p>
             
//             </div>
//             <div className="text-center invisible">
//               <p>__________________</p>
//               <p>Exam I/C</p>
             
//             </div>
//             <div className="text-center">
//             <img src={sign} alt="" className="border-b-2 border-solid border-black h-[35px]"/>
//               {/* <p>__________________</p> */}
//               <p>Principal</p>
             
//             </div>
//           </div>
//        </div>
//         </div>
//       </div>
//     );
//   };

//   return (
//     <>
//       <div className="mb-4 mx-auto ">
//         <div
//           className="rounded-tl-lg rounded-tr-lg border flex justify-between text-white py-2 px-2"
//           style={{ background: `linear-gradient(to bottom, ${currentColor}, #8d8b8b)` }}
//         >
//           <p className="text-lg">Report Card</p>
//           <MdDownload onClick={generatePDF} className="text-2xl cursor-pointer" />
//         </div>
//         <div className="w-full flex flex-col sm:flex-row gap-2 p-4">
//           <ReactSelect
//             required={true}
//             name="studentClass"
//             value={selectedClass}
//             handleChange={handleClassChange}
//             label="Select a Class"
//             dynamicOptions={dynamicOptions}
//           />
//           <ReactSelect
//             name="studentSection"
//             value={selectedSection}
//             handleChange={handleSectionChange}
//             label="Select a Section"
//             dynamicOptions={DynamicSection}
//           />
//           <div className="mb-4 w-full sm:w-auto">
//             <select
//               className="p-2 border rounded w-full sm:w-auto"
//               onChange={handleStudentChange}
//               value={isAllStudentsSelected ? "all" : selectedStudent?.studentId || ""}
//             >
//               <option value="">Select a student</option>
//               <option value="all">All Students</option>
//               {allStudents.map((student) => (
//                 <option key={student?.studentId} value={student?.studentId}>
//                   {student?.studentName} - Class {student?.class} {student?.section} (Roll No: {student?.rollNo})
//                 </option>
//               ))}
//             </select>
//           </div>
         
//         </div>
//        <div ref={componentPDF}>
//          {isAllStudentsSelected ? (
//            Array.isArray(dataToReport) ? (
//              dataToReport?.map((student, index) => (
//                <div key={index} style={{ pageBreakAfter: "always" }}>
//                  {renderReportCard(student)}
//                </div>
//              ))
//            ) : (
//              <div>No data to display.</div>
//            )
//          ) : (
//            dataToReport && Object.keys(dataToReport).length > 0 ? (
//              renderReportCard(dataToReport)
//            ) : (
//              <div>No data to display.</div>
//            )
//          )}
//        </div>
//       </div>
//     </>
//   );
// };

// export default ReportCard;
