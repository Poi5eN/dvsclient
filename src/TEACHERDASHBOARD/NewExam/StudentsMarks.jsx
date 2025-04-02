import React, { useEffect, useState } from "react";
import { getAllStudents, marksmarks } from "../../Network/TeacherApi";
import { useStateContext } from "../../contexts/ContextProvider";

const StudentsMarks = () => {
  const { setIsLoader } = useStateContext();
  const [marksData, setMarksData] = useState([]);
  const [studentLookup, setStudentLookup] = useState({});
  const [error, setError] = useState(null); // State for error messages

  const user = JSON.parse(localStorage.getItem("user"));
  const param = {
    class: user?.classTeacher,
    section: user?.section,
  };

  const getMarks = async () => {
    try {
      const response = await marksmarks(param);
      if (response.success) {
        setMarksData(response.marks);
      } else {
        setError(response.message || "Failed to fetch marks."); // Handle API error message
        console.error("Failed to fetch marks:", response.message);
      }
    } catch (error) {
      setError("Error fetching marks. Please check the console.");
      console.error("Error fetching marks:", error);
    }
  };

  const allStudent = async () => {
    setIsLoader(true);
    try {
      const response = await getAllStudents(param);
      if (response?.success) {
        const lookup = {};
        response.students.data.forEach((student) => {
          lookup[student.studentId] = student.studentName;
        });
        setStudentLookup(lookup);
      } else {
        setError(response.message || "Failed to fetch students.");
        console.error("Failed to fetch students:", response.message);
      }
    } catch (error) {
      setError("Error fetching students. Please check the console.");
      console.error("Error fetching students:", error);
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    getMarks();
    allStudent();
  }, []);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
        Students Marks
      </h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-blue-600 text-white uppercase text-sm">
            <tr>
              <th className="p-3 text-left">Student Name</th>
              <th className="p-3 text-left">Class</th>
              <th className="p-3 text-left">Section</th>
              <th className="p-3 text-left">Subject</th>
              <th className="p-3 text-left">Assessment</th>
              <th className="p-3 text-left">Marks Obtained</th>
              <th className="p-3 text-left">Total Marks</th>
              <th className="p-3 text-left">Grade</th>
            </tr>
          </thead>
          <tbody className="text-gray-700">
            {marksData.map((student) =>
              student.marks.map((subject) =>
                subject.assessments.map((assessment) => (
                  <tr
                    key={assessment._id}
                    className="border-b hover:bg-gray-100 transition"
                  >
                    <td className="p-3 font-semibold text-blue-700">
                      {studentLookup[student.studentId] || "Unknown"}
                    </td>
                    <td className="p-3">{student.className}</td>
                    <td className="p-3">{student.section}</td>
                    <td className="p-3">{subject.subjectName}</td>
                    <td className="p-3">{assessment.assessmentName}</td>
                    <td className="p-3 font-semibold text-green-600">
                      {assessment.marksObtained}
                    </td>
                    <td className="p-3">{assessment.totalMarks}</td>
                    <td className="p-3 font-bold text-indigo-600">
                      {subject.grade}
                    </td>
                  </tr>
                ))
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsMarks;



// import React, { useEffect, useState } from "react";
// import { getAllStudents, marksmarks } from "../../Network/TeacherApi";
// import { useStateContext } from "../../contexts/ContextProvider";

// const StudentsMarks = () => {
//   const { setIsLoader } = useStateContext();
//   const [marksData, setMarksData] = useState([]);
//   const [studentLookup, setStudentLookup] = useState({});

//   const user = JSON.parse(localStorage.getItem("user"));
//   const param = {
//     class: user?.classTeacher,
//     section: user?.section,
//   };

//   // 🟢 Fetch Marks Data
//   const getMarks = async () => {
//     try {
//       const response = await marksmarks(param);
//       if (response.success) {
//         setMarksData(response.marks);
//       }
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     }
//   };

//   // 🟢 Fetch Students Data and Create Lookup Table
//   const allStudent = async () => {
//     setIsLoader(true);
//     try {
//       const response = await getAllStudents(param);
//       if (response?.success) {
//         setIsLoader(false);

//         // 🔹 Create a lookup dictionary: { studentId: studentName }
//         const lookup = {};
//         response.students.data.forEach((student) => {
//           lookup[student.studentId] = student.studentName;
//         });

//         setStudentLookup(lookup);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   useEffect(() => {
//     getMarks();
//     allStudent();
//   }, []);

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
//         Students Marks
//       </h2>
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
//           <thead className="bg-blue-600 text-white uppercase text-sm">
//             <tr>
//               {/* <th className="p-3 text-left">Student ID</th> */}
//               <th className="p-3 text-left">Student Name</th>
//               <th className="p-3 text-left">Class</th>
//               <th className="p-3 text-left">Section</th>
//               <th className="p-3 text-left">Subject</th>
//               <th className="p-3 text-left">Assessment</th>
//               <th className="p-3 text-left">Marks Obtained</th>
//               <th className="p-3 text-left">Total Marks</th>
//               <th className="p-3 text-left">Grade</th>
//             </tr>
//           </thead>
//           <tbody className="text-gray-700">
//             {marksData.map((student) =>
//               student.marks.map((subject) =>
//                 subject.assessments.map((assessment) => (
//                   <tr
//                     key={assessment._id}
//                     className="border-b hover:bg-gray-100 transition"
//                   >
//                     {/* <td className="p-3">{student.studentId}</td> */}
//                     <td className="p-3 font-semibold text-blue-700">
//                       {studentLookup[student.studentId] || "Unknown"}
//                     </td>
//                     <td className="p-3">{student.className}</td>
//                     <td className="p-3">{student.section}</td>
//                     <td className="p-3">{subject.subjectName}</td>
//                     <td className="p-3">{assessment.assessmentName}</td>
//                     <td className="p-3 font-semibold text-green-600">
//                       {assessment.marksObtained}
//                     </td>
//                     <td className="p-3">{assessment.totalMarks}</td>
//                     <td className="p-3 font-bold text-indigo-600">
//                       {subject.grade}
//                     </td>
//                   </tr>
//                 ))
//               )
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default StudentsMarks;



// import React, { useEffect, useState } from "react";
// import { getAllStudents, marksmarks } from "../../Network/TeacherApi";
// import { useStateContext } from "../../contexts/ContextProvider";

// const StudentsMarks = () => {
//     const { currentColor,setIsLoader  } = useStateContext();
//   const [marksData, setMarksData] = useState([]);
//   const user = JSON.parse(localStorage.getItem("user"));
//   const param = {
//     class: user?.classTeacher,
//     section: user?.section
// }
//   const getMarks = async () => {
//     try {
//       const response = await marksmarks(param);
//       if (response.success) {
//         setMarksData(response.marks);
//       }
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     }
//   };

//   const allStudent = async () => {
//               setIsLoader(true)
//               try {
//                   const response = await getAllStudents(param);
      
//                   if (response?.success) {
//                       setIsLoader(false)
//                       setSubmittedData(response?.students?.data);
//                   } else {
//                       toast.error(response?.message);
      
//                   }
//               } catch (error) {
//                   console.log("error", error);
      
//               }
//               finally {
//                   setIsLoader(false)
//               }
//           };
          

//   useEffect(() => {
//     getMarks();
//     allStudent();
//   }, []);

//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">
//         Students Marks
//       </h2>
//       <div className="overflow-x-auto">
//         <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden">
//           <thead className="bg-blue-600 text-white uppercase text-sm">
//             <tr>
//               <th className="p-3 text-left">Student ID</th>
//               <th className="p-3 text-left">Class</th>
//               <th className="p-3 text-left">Section</th>
//               <th className="p-3 text-left">Subject</th>
//               <th className="p-3 text-left">Assessment</th>
//               <th className="p-3 text-left">Marks Obtained</th>
//               <th className="p-3 text-left">Total Marks</th>
//               <th className="p-3 text-left">Grade</th>
//             </tr>
//           </thead>
//           <tbody className="text-gray-700">
//             {marksData.map((student) =>
//               student.marks.map((subject) =>
//                 subject.assessments.map((assessment) => (
//                   <tr
//                     key={assessment._id}
//                     className="border-b hover:bg-gray-100 transition"
//                   >
//                     <td className="p-3">{student.studentId}</td>
//                     <td className="p-3">{student.className}</td>
//                     <td className="p-3">{student.section}</td>
//                     <td className="p-3">{subject.subjectName}</td>
//                     <td className="p-3">{assessment.assessmentName}</td>
//                     <td className="p-3 font-semibold text-green-600">
//                       {assessment.marksObtained}
//                     </td>
//                     <td className="p-3">{assessment.totalMarks}</td>
//                     <td className="p-3 font-bold text-indigo-600">
//                       {subject.grade}
//                     </td>
//                   </tr>
//                 ))
//               )
//             )}
//           </tbody>
//         </table>
//       </div>
//     </div>
//   );
// };

// export default StudentsMarks;



// import React, { useEffect, useState } from "react";
// import { marksmarks } from "../../Network/TeacherApi";

// const StudentsMarks = () => {
//   const [marksData, setMarksData] = useState([]);

//   const getMarks = async () => {
//     try {
//       const response = await marksmarks();
//       if (response.success) {
//         setMarksData(response.marks);
//       }
//     } catch (error) {
//       console.error("Error fetching marks:", error);
//     }
//   };

//   useEffect(() => {
//     getMarks();
//   }, []);

//   return (
//     <div>
//       <h2>Students Marks</h2>
//       <table border="1" cellPadding="10" cellSpacing="0">
//         <thead>
//           <tr>
//             <th>Student ID</th>
//             <th>Class</th>
//             <th>Section</th>
//             <th>Subject</th>
//             <th>Assessment</th>
//             <th>Marks Obtained</th>
//             <th>Total Marks</th>
//             <th>Grade</th>
//           </tr>
//         </thead>
//         <tbody>
//           {marksData.map((student) =>
//             student.marks.map((subject, index) =>
//               subject.assessments.map((assessment) => (
//                 <tr key={assessment._id}>
//                   <td>{student.studentId}</td>
//                   <td>{student.className}</td>
//                   <td>{student.section}</td>
//                   <td>{subject.subjectName}</td>
//                   <td>{assessment.assessmentName}</td>
//                   <td>{assessment.marksObtained}</td>
//                   <td>{assessment.totalMarks}</td>
//                   <td>{subject.grade}</td>
//                 </tr>
//               ))
//             )
//           )}
//         </tbody>
//       </table>
//     </div>
//   );
// };

// export default StudentsMarks;




// import React from 'react'
// import { marksmarks } from '../../Network/TeacherApi'
// import { useEffect } from 'react'

// const StudentsMarks = () => {
//     const getmarks=async()=>{
//         const response=await marksmarks()
//         console.log("responseresponseresponse",response)
//     }
//     useEffect(()=>{
//         getmarks()
//     },[])
//   return (
//     <div>StudentsMarks</div>
//   )
// }

// export default StudentsMarks