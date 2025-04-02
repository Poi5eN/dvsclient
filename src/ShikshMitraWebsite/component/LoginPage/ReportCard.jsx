import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import logo from '../../assets/school logo.jpg'
const ReportCard = () => {
  const reportRef = useRef(); // Reference for printing

  const handlePrint = useReactToPrint({
    content: () => reportRef.current,
    documentTitle: "Student Report Card",
  });

  const student = {
    name: "Abhinav Kumar Singh",
    dob: "20-03-2008",
    class: "7 - A",
    gender: "Boy",
    admNo: "005857",
    rollNo: "---",
    motherName: "Gunja Kumari",
    fatherName: "Shambhu Kumar Singh",
    subjects: [
      { name: "Hindi", term1: { pt: 9.5, pf: 9.5, hye: 51, total: 70, grade: "A1" }, term2: { pt: 9.5, pf: 9.5, see: 51, total: 70, grade: "A1" } },
      { name: "English", term1: { pt: 9.0, pf: 9.0, hye: 50, total: 68, grade: "A2" }, term2: { pt: 9.0, pf: 9.0, see: 50, total: 68, grade: "A2" } },
      { name: "Science", term1: { pt: 8.5, pf: 8.5, hye: 48, total: 65, grade: "B1" }, term2: { pt: 8.5, pf: 8.5, see: 48, total: 65, grade: "B1" } },
      { name: "Social Sci", term1: { pt: 9.0, pf: 9.0, hye: 50, total: 68, grade: "A2" }, term2: { pt: 9.0, pf: 9.0, see: 50, total: 68, grade: "A2" } },
      { name: "Math", term1: { pt: 9.5, pf: 9.5, hye: 55, total: 74, grade: "A1" }, term2: { pt: 9.5, pf: 9.5, see: 55, total: 74, grade: "A1" } },
      { name: "Sanskrit", term1: { pt: 8.0, pf: 8.0, hye: 47, total: 63, grade: "B1" }, term2: { pt: 8.0, pf: 8.0, see: 47, total: 63, grade: "B1" } }
    ],
    coScholastic: [
      { term: "Term-1", workEdu: "C", artEdu: "A", yoga: "A", discipline: "A", scouts: "--", attendance: "100%", ict: "A" },
      { term: "Term-2", workEdu: "A", artEdu: "A", yoga: "A", discipline: "A", scouts: "--", attendance: "96.5%", ict: "A" }
    ]
  };

  return (
 <>
 
 <button
    onClick={handlePrint}
    className="mb-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md"
  >
    Download PDF
  </button>
    <div className="flex justify-center items-center min-h-screen bg-gray-100 mt-10">
      <div ref={reportRef} className="bg-white p-2  border  w-[210mm] h-[297mm] mx-auto print:w-full print:h-full ">
       <div className="p-2 border-2 border-black">
       <div className="flex justify-between">
       <div className="text-center mb-4 h-24 w-24 object-contain">
          <img src= { logo|| "https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg"} alt="" />
        </div>
        <div className="text-center mb-4">
          <h2 className="text-[40px] text-red-700 font-extrabold ">TAGORE CONVENT SCHOOL</h2>
          <h3 className="text-lg font-semibold text-blue-900">RECOGNISED</h3>
          <p className="text-[14px] font-semibold  text-blue-900">[ ENGLISH MEDIUM ]</p>
          <h3 className="text-[16px">SHIV DURGA VIHAR SURAJKUND FARIDABAD </h3>
          <h3 className="text-lg font-semibold text-red-700">MOB : 886068639</h3>
        </div>
        <div className="text-center mb-4 h-24 w-24 object-contain  ">
          <img
           className="invisible"
          src="https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg" alt="" />
        </div>
       </div>

        {/* Student Info */}
        <div className="flex gap-10">
  <table className="w-full border border-black mb-4 text-sm">
    <tbody>
      {[
        ["Student Name", student.name, "Date of Birth", student.dob],
        ["Class-Sec", student.class, "Gender", student.gender],
        ["Adm No", student.admNo, "Roll No", student.rollNo],
        ["Mother's Name", student.motherName, "Father's Name", student.fatherName]
      ].map((row, idx) => (
        <tr key={idx} className="border border-black">
          {row.slice(0, 2).map((cell, i) => (
            <td key={i} className="p-1 border border-black font-semibold">{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>

  <table className="w-full border border-black mb-4 text-sm">
    <tbody>
      {[
        ["Date of Birth", student.dob],
        ["Gender", student.gender],
        ["Mother's Name", student.motherName],
        ["Father's Name", student.fatherName]
      ].map((row, idx) => (
        <tr key={idx} className="border border-black">
          {row.map((cell, i) => (
            <td key={i} className="p-1 border border-black font-semibold">{cell}</td>
          ))}
        </tr>
      ))}
    </tbody>
  </table>
</div>

        
        <h1 className="uppercase p-2 bg-cyan-500 text-white w-full">Scholastic Exam</h1>
        <table className="w-full border border-black text-center text-sm mb-4">

          <thead>
            {/* <tr className="bg-cyan-300 w-full"  rowSpan="12">
              <h1 className="uppercase p-2 bg-cyan-300 w-full">scholastic exam</h1>
            </tr> */}
            <tr>
              <th rowSpan="2" className="border border-black p-1">Subjects</th>
              <th colSpan="5" className="border border-black p-1">TERM - 1</th>
              <th colSpan="5" className="border border-black p-1">TERM - 2</th>
              <th rowSpan="2" className="border border-black p-1">Final Grade</th>
            </tr>
            <tr>
              {["PT-1", "PF-1", "HYE", "Total", "Grade", "PT-2", "PF-2", "SEE", "Total", "Grade"].map((heading, i) => (
                <th key={i} className="border border-black p-1">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>

            {student.subjects.map((subject, idx) => (
              <tr key={idx} className="border border-black">
                <td className="p-1 border border-black">{subject.name}</td>
                {Object.values(subject.term1).map((val, i) => (
                  <td key={i} className="p-1 border border-black">{val}</td>
                ))}
                {Object.values(subject.term2).map((val, i) => (
                  <td key={i} className="p-1 border border-black">{val}</td>
                ))}
                <td className="p-1 border border-black">{subject.term1.grade}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Co-Scholastic Areas */}
        <h1 className="uppercase p-2 bg-cyan-500 text-white w-full"> Co Scholastic Exam</h1>
        <table className="w-full border border-black text-center text-sm mb-4">

          <thead>
          <tr>
              <th className="uppercase whitespace-nowrap py-2 px-2"> co scholastic exam</th>
            </tr>
            <tr>
              {["Term", "Work Education", "Art Education", "PHE/Yoga", "Discipline", "Scouts & Guides", "Attendance", "Computer (ICT)"].map((heading, i) => (
                <th key={i} className="border border-black p-1">{heading}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {student.coScholastic.map((row, idx) => (
              <tr key={idx} className="border border-black">
                {Object.values(row).map((val, i) => (
                  <td key={i} className="p-1 border border-black whitespace-nowrap">{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <p className="text-center font-bold text-sm mb-6">Result: Promoted to Class 8-A</p>

        {/* Signatures */}
        <div className="flex text-sm font-semibold mt-10">
          <div className="text-center">
            <span>Class Teacher Remarks</span>
            <span> ____________________________________</span>
            </div>
          </div>
        <div className="flex justify-around text-sm font-semibold mt-20">
          <div className="text-center">
            <p>__________________</p>
            <p>Class Teacher</p>
            <p>(Provakar Nandi)</p>
          </div>
          <div className="text-center">
            <p>__________________</p>
            <p>Exam I/C</p>
            <p>(A. K. Singh)</p>
          </div>
          <div className="text-center">
            <p>__________________</p>
            <p>Principal</p>
            <p>(Sanjib Sinha)</p>
          </div>
        </div>

       </div>
      </div>
    </div>
 </>
  );
};

export default ReportCard;
// import React from "react";

// const ReportCard = () => {
//   const student = {
//     name: "Abhinav Kumar Singh",
//     dob: "20-03-2008",
//     class: "7 - A",
//     gender: "Boy",
//     admNo: "005857",
//     rollNo: "---",
//     motherName: "Gunja Kumari",
//     fatherName: "Shambhu Kumar Singh",
//     subjects: [
//       { name: "Hindi", term1: { pt: 9.5, pf: 9.5, hye: 51, total: 70, grade: "A1" }, term2: { pt: 9.5, pf: 9.5, see: 51, total: 70, grade: "A1" } },
//       { name: "English", term1: { pt: 9.0, pf: 9.0, hye: 50, total: 68, grade: "A2" }, term2: { pt: 9.0, pf: 9.0, see: 50, total: 68, grade: "A2" } },
//       { name: "Science", term1: { pt: 8.5, pf: 8.5, hye: 48, total: 65, grade: "B1" }, term2: { pt: 8.5, pf: 8.5, see: 48, total: 65, grade: "B1" } },
//       { name: "Social Sci", term1: { pt: 9.0, pf: 9.0, hye: 50, total: 68, grade: "A2" }, term2: { pt: 9.0, pf: 9.0, see: 50, total: 68, grade: "A2" } },
//       { name: "Math", term1: { pt: 9.5, pf: 9.5, hye: 55, total: 74, grade: "A1" }, term2: { pt: 9.5, pf: 9.5, see: 55, total: 74, grade: "A1" } },
//       { name: "Sanskrit", term1: { pt: 8.0, pf: 8.0, hye: 47, total: 63, grade: "B1" }, term2: { pt: 8.0, pf: 8.0, see: 47, total: 63, grade: "B1" } }
//     ],
//     coScholastic: [
//       { term: "Term-1", workEdu: "C", artEdu: "A", yoga: "A", discipline: "A", scouts: "--", attendance: "100%", ict: "A" },
//       { term: "Term-2", workEdu: "A", artEdu: "A", yoga: "A", discipline: "A", scouts: "--", attendance: "96.5%", ict: "A" }
//     ]
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100 mt-20">
//       <div className="bg-white shadow-lg p-6 border border-black w-[210mm] h-[297mm] mx-auto print:w-full print:h-full">
//        <div className="flex justify-between">
//        <div className="text-center mb-4 h-24 w-24 object-contain">
//           <img src="https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg" alt="" />
//         </div>
//         <div className="text-center mb-4">
//           <h2 className="text-xl font-bold">Kendriya Vidyalaya CRPF Durgapur</h2>
//           <h3 className="text-lg font-semibold">FINAL REPORT CARD [2019-20]</h3>
//         </div>
//         <div className="text-center mb-4 h-24 w-24 object-contain">
//           <img src="https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg" alt="" />
//         </div>
//        </div>

//         {/* Student Info */}
//         <div className="flex gap-10">
//   <table className="w-full border border-black mb-4 text-sm">
//     <tbody>
//       {[
//         ["Student Name", student.name, "Date of Birth", student.dob],
//         ["Class-Sec", student.class, "Gender", student.gender],
//         ["Adm No", student.admNo, "Roll No", student.rollNo],
//         ["Mother's Name", student.motherName, "Father's Name", student.fatherName]
//       ].map((row, idx) => (
//         <tr key={idx} className="border border-black">
//           {row.slice(0, 2).map((cell, i) => (
//             <td key={i} className="p-1 border border-black font-semibold">{cell}</td>
//           ))}
//         </tr>
//       ))}
//     </tbody>
//   </table>

//   <table className="w-full border border-black mb-4 text-sm">
//     <tbody>
//       {[
//         ["Date of Birth", student.dob],
//         ["Gender", student.gender],
//         ["Mother's Name", student.motherName],
//         ["Father's Name", student.fatherName]
//       ].map((row, idx) => (
//         <tr key={idx} className="border border-black">
//           {row.map((cell, i) => (
//             <td key={i} className="p-1 border border-black font-semibold">{cell}</td>
//           ))}
//         </tr>
//       ))}
//     </tbody>
//   </table>
// </div>

//         {/* <table className="w-full border border-black mb-4 text-sm">
//           <tbody>
//             {[
//               ["Student Name", student.name, "Date of Birth", student.dob],
//               ["Class-Sec", student.class, "Gender", student.gender],
//               ["Adm No", student.admNo, "Roll No", student.rollNo],
//               ["Mother's Name", student.motherName, "Father's Name", student.fatherName]
//             ].map((row, idx) => (
//               <tr key={idx} className="border border-black">
//                 {row.map((cell, i) => (
//                   <td key={i} className="p-1 border border-black font-semibold">{cell}</td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table> */}

//         {/* Marks Table */}
//         <table className="w-full border border-black text-center text-sm mb-4">
//           <thead>
//             <tr>
//               <th rowSpan="2" className="border border-black p-1">Subjects</th>
//               <th colSpan="5" className="border border-black p-1">TERM - 1</th>
//               <th colSpan="5" className="border border-black p-1">TERM - 2</th>
//               <th rowSpan="2" className="border border-black p-1">Final Grade</th>
//             </tr>
//             <tr>
//               {["PT-1", "PF-1", "HYE", "Total", "Grade", "PT-2", "PF-2", "SEE", "Total", "Grade"].map((heading, i) => (
//                 <th key={i} className="border border-black p-1">{heading}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {student.subjects.map((subject, idx) => (
//               <tr key={idx} className="border border-black">
//                 <td className="p-1 border border-black">{subject.name}</td>
//                 {Object.values(subject.term1).map((val, i) => (
//                   <td key={i} className="p-1 border border-black">{val}</td>
//                 ))}
//                 {Object.values(subject.term2).map((val, i) => (
//                   <td key={i} className="p-1 border border-black">{val}</td>
//                 ))}
//                 <td className="p-1 border border-black">{subject.term1.grade}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Co-Scholastic Areas */}
//         <table className="w-full border border-black text-center text-sm mb-4">
//           <thead>
//             <tr>
//               {["Term", "Work Education", "Art Education", "PHE/Yoga", "Discipline", "Scouts & Guides", "Attendance", "Computer (ICT)"].map((heading, i) => (
//                 <th key={i} className="border border-black p-1">{heading}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {student.coScholastic.map((row, idx) => (
//               <tr key={idx} className="border border-black">
//                 {Object.values(row).map((val, i) => (
//                   <td key={i} className="p-1 border border-black whitespace-nowrap">{val}</td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <p className="text-center font-bold text-sm mb-6">Result: Promoted to Class 8-A</p>

//         {/* Signatures */}
//         <div className="flex justify-around text-sm font-semibold mt-20">
//           <div className="text-center">
//             <p>__________________</p>
//             <p>Class Teacher</p>
//             <p>(Provakar Nandi)</p>
//           </div>
//           <div className="text-center">
//             <p>__________________</p>
//             <p>Exam I/C</p>
//             <p>(A. K. Singh)</p>
//           </div>
//           <div className="text-center">
//             <p>__________________</p>
//             <p>Principal</p>
//             <p>(Sanjib Sinha)</p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ReportCard;



// import React from "react";

// const ReportCard = () => {
//   const student = {
//     name: "Abhinav Kumar Singh",
//     dob: "20-03-2008",
//     class: "7 - A",
//     gender: "Boy",
//     admNo: "005857",
//     rollNo: "---",
//     motherName: "Gunja Kumari",
//     fatherName: "Shambhu Kumar Singh",
//     subjects: [
//       { name: "Hindi", term1: { pt: 9.5, pf: 9.5, hye: 51, total: 70, grade: "A1" }, term2: { pt: 9.5, pf: 9.5, see: 51, total: 70, grade: "A1" } },
//       { name: "English", term1: { pt: 9.0, pf: 9.0, hye: 50, total: 68, grade: "A2" }, term2: { pt: 9.0, pf: 9.0, see: 50, total: 68, grade: "A2" } },
//       { name: "Science", term1: { pt: 8.5, pf: 8.5, hye: 48, total: 65, grade: "B1" }, term2: { pt: 8.5, pf: 8.5, see: 48, total: 65, grade: "B1" } },
//       { name: "Social Sci", term1: { pt: 9.0, pf: 9.0, hye: 50, total: 68, grade: "A2" }, term2: { pt: 9.0, pf: 9.0, see: 50, total: 68, grade: "A2" } },
//       { name: "Math", term1: { pt: 9.5, pf: 9.5, hye: 55, total: 74, grade: "A1" }, term2: { pt: 9.5, pf: 9.5, see: 55, total: 74, grade: "A1" } },
//       { name: "Sanskrit", term1: { pt: 8.0, pf: 8.0, hye: 47, total: 63, grade: "B1" }, term2: { pt: 8.0, pf: 8.0, see: 47, total: 63, grade: "B1" } }
//     ]
//   };

//   return (
//     <div className="flex justify-center items-center min-h-screen bg-gray-100 mt-20">
//       <div className="bg-white shadow-lg p-6 border border-black w-[210mm] h-[297mm] mx-auto print:w-full print:h-full">
//         <div className="text-center mb-4">
//           <h2 className="text-xl font-bold">Kendriya Vidyalaya CRPF Durgapur</h2>
//           <h3 className="text-lg font-semibold">FINAL REPORT CARD [2019-20]</h3>
//         </div>

//         {/* Student Info */}
//         <table className="w-full border border-black mb-4 text-sm">
//           <tbody>
//             {[
//               ["Student Name", student.name, "Date of Birth", student.dob],
//               ["Class-Sec", student.class, "Gender", student.gender],
//               ["Adm No", student.admNo, "Roll No", student.rollNo],
//               ["Mother's Name", student.motherName, "Father's Name", student.fatherName]
//             ].map((row, idx) => (
//               <tr key={idx} className="border border-black">
//                 {row.map((cell, i) => (
//                   <td key={i} className="p-1 border border-black font-semibold">{cell}</td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         {/* Marks Table */}
//         <table className="w-full border border-black text-center text-sm mb-4">
//           <thead>
//             <tr>
//               <th rowSpan="2" className="border border-black p-1">Subjects</th>
//               <th colSpan="5" className="border border-black p-1">TERM - 1</th>
//               <th colSpan="5" className="border border-black p-1">TERM - 2</th>
//               <th rowSpan="2" className="border border-black p-1">Final Grade</th>
//             </tr>
//             <tr>
//               {["PT-1", "PF-1", "HYE", "Total", "Grade", "PT-2", "PF-2", "SEE", "Total", "Grade"].map((heading, i) => (
//                 <th key={i} className="border border-black p-1">{heading}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {student.subjects.map((subject, idx) => (
//               <tr key={idx} className="border border-black">
//                 <td className="p-1 border border-black">{subject.name}</td>
//                 {Object.values(subject.term1).map((val, i) => (
//                   <td key={i} className="p-1 border border-black">{val}</td>
//                 ))}
//                 {Object.values(subject.term2).map((val, i) => (
//                   <td key={i} className="p-1 border border-black">{val}</td>
//                 ))}
//                 <td className="p-1 border border-black">{subject.term1.grade}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>

//         <p className="text-center font-bold text-sm">Result: Promoted to Class 8-A</p>
//       </div>
//     </div>
//   );
// };

// export default ReportCard;



// import React from "react";

// const ReportCard = () => {
//   const student = {
//     name: "Abhinav Kumar Singh",
//     dob: "20-03-2008",
//     class: "7 - A",
//     gender: "Boy",
//     admNo: "005857",
//     rollNo: "---",
//     motherName: "Gunja Kumari",
//     fatherName: "Shambhu Kumar Singh",
//     subjects: [
//       { name: "Hindi", term1: { pt: 9.5, pf: 9.5, hye: 51, total: 70, grade: "A1" }, term2: { pt: 9.5, pf: 9.5, see: 51, total: 70, grade: "A1" } },
//       { name: "English", term1: { pt: 9.0, pf: 9.0, hye: 50, total: 68, grade: "A2" }, term2: { pt: 9.0, pf: 9.0, see: 50, total: 68, grade: "A2" } },
//       { name: "Science", term1: { pt: 8.5, pf: 8.5, hye: 48, total: 65, grade: "B1" }, term2: { pt: 8.5, pf: 8.5, see: 48, total: 65, grade: "B1" } },
//       { name: "Social Sci", term1: { pt: 9.0, pf: 9.0, hye: 50, total: 68, grade: "A2" }, term2: { pt: 9.0, pf: 9.0, see: 50, total: 68, grade: "A2" } },
//       { name: "Math", term1: { pt: 9.5, pf: 9.5, hye: 55, total: 74, grade: "A1" }, term2: { pt: 9.5, pf: 9.5, see: 55, total: 74, grade: "A1" } },
//       { name: "Sanskrit", term1: { pt: 8.0, pf: 8.0, hye: 47, total: 63, grade: "B1" }, term2: { pt: 8.0, pf: 8.0, see: 47, total: 63, grade: "B1" } }
//     ],
//     coScholastic: {
//       workEducation: "A",
//       artEducation: "A",
//       yoga: "A",
//       scouts: "A",
//       attendance: "96.5%",
//       computer: "A"
//     }
//   };

//   return (
//     <div className="max-w-5xl mx-auto p-6 border border-gray-900 shadow-md mt-20">
//       <div className="text-center mb-6">
//         <h2 className="text-xl font-bold">Kendriya Vidyalaya CRPF Durgapur</h2>
//         <h3 className="text-lg font-semibold">FINAL REPORT CARD [2019-20]</h3>
//       </div>

//       {/* Student Info */}
//       <table className="w-full border border-black mb-4">
//         <tbody>
//           {[
//             ["Student Name", student.name, "Date of Birth", student.dob],
//             ["Class-Sec", student.class, "Gender", student.gender],
//             ["Adm No", student.admNo, "Roll No", student.rollNo],
//             ["Mother's Name", student.motherName, "Father's Name", student.fatherName]
//           ].map((row, idx) => (
//             <tr key={idx} className="border border-black">
//               {row.map((cell, i) => (
//                 <td key={i} className="p-2 border border-black font-semibold">{cell}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Marks Table */}
//       <table className="w-full border border-black text-center mb-4">
//         <thead>
//           <tr>
//             <th rowSpan="2" className="border border-black p-2">Subjects</th>
//             <th colSpan="5" className="border border-black p-2">TERM - 1</th>
//             <th colSpan="5" className="border border-black p-2">TERM - 2</th>
//             <th rowSpan="2" className="border border-black p-2">Final Grade</th>
//           </tr>
//           <tr>
//             {["PT-1", "PF-1", "HYE", "Total", "Grade", "PT-2", "PF-2", "SEE", "Total", "Grade"].map((heading, i) => (
//               <th key={i} className="border border-black p-2">{heading}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {student.subjects.map((subject, idx) => (
//             <tr key={idx} className="border border-black">
//               <td className="p-2 border border-black">{subject.name}</td>
//               {Object.values(subject.term1).map((val, i) => (
//                 <td key={i} className="p-2 border border-black">{val}</td>
//               ))}
//               {Object.values(subject.term2).map((val, i) => (
//                 <td key={i} className="p-2 border border-black">{val}</td>
//               ))}
//               <td className="p-2 border border-black">{subject.term1.grade}</td>
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       {/* Co-Scholastic Areas */}
//       <div className="text-center font-semibold mb-2">CO-SCHOLASTIC AREAS</div>
//       <table className="w-full border border-black text-center mb-4">
//         <thead>
//           <tr>
//             {["Term", "Work Education", "Art Education", "PHE/Yoga", "Scouts & Guides", "Attendance", "Computer"].map((heading, i) => (
//               <th key={i} className="border border-black p-2">{heading}</th>
//             ))}
//           </tr>
//         </thead>
//         <tbody>
//           {["Term-1", "Term-2"].map((term, idx) => (
//             <tr key={idx} className="border border-black">
//               <td className="p-2 border border-black">{term}</td>
//               {Object.values(student.coScholastic).map((val, i) => (
//                 <td key={i} className="p-2 border border-black">{val}</td>
//               ))}
//             </tr>
//           ))}
//         </tbody>
//       </table>

//       <p className="text-center font-bold">Result: Promoted to Class 8-A</p>
//     </div>
//   );
// };

// export default ReportCard;




// import React from 'react'
// import './Report.css'
// const ReportCard = () => {
//   return (
//     <div className='mt-20'>
//           <div class="header">
//         <h2>Kendriya Vidyalaya CRPF Durgapur</h2>
//         <h3>FINAL REPORT CARD [2019-20]</h3>
//     </div>

//     <div class="student-info">
//         <table>
//             <tr>
//                 <td class="bold">Student Name:</td>
//                 <td>Abhinav Kumar Singh</td>
//                 <td class="bold">Date of Birth:</td>
//                 <td>20-03-2008</td>
//             </tr>
//             <tr>
//                 <td class="bold">Class-Sec:</td>
//                 <td>7 - A</td>
//                 <td class="bold">Gender:</td>
//                 <td>Boy</td>
//             </tr>
//             <tr>
//                 <td class="bold">Adm No:</td>
//                 <td>005857</td>
//                 <td class="bold">Roll No:</td>
//                 <td>---</td>
//             </tr>
//             <tr>
//                 <td class="bold">Mother's Name:</td>
//                 <td>Gunja Kumari</td>
//                 <td class="bold">Father's Name:</td>
//                 <td>Shambhu Kumar Singh</td>
//             </tr>
//         </table>
//     </div>

//     <table class="report-card">
//         <tr>
//             <th rowspan="2">Subjects</th>
//             <th colspan="5">TERM - 1</th>
//             <th colspan="5">TERM - 2</th>
//             <th rowspan="2">Final Grade</th>
//         </tr>
//         <tr>
//             <th>PT-1</th><th>PF-1</th><th>HYE</th><th>Total</th><th>Grade</th>
//             <th>PT-2</th><th>PF-2</th><th>SEE</th><th>Total</th><th>Grade</th>
//         </tr>
//         <tr>
//             <td>Hindi</td> <td>9.5</td> <td>9.5</td> <td>51</td> <td>70</td> <td>A1</td>
//             <td>9.5</td> <td>9.5</td> <td>51</td> <td>70</td> <td>A1</td> <td>A1</td>
//         </tr>
//         <tr>
//             <td>English</td> <td>9.0</td> <td>9.0</td> <td>50</td> <td>68</td> <td>A2</td>
//             <td>9.0</td> <td>9.0</td> <td>50</td> <td>68</td> <td>A2</td> <td>A2</td>
//         </tr>
//         <tr>
//             <td>Science</td> <td>8.5</td> <td>8.5</td> <td>48</td> <td>65</td> <td>B1</td>
//             <td>8.5</td> <td>8.5</td> <td>48</td> <td>65</td> <td>B1</td> <td>B1</td>
//         </tr>
//         <tr>
//             <td>Social Sci</td> <td>9.0</td> <td>9.0</td> <td>50</td> <td>68</td> <td>A2</td>
//             <td>9.0</td> <td>9.0</td> <td>50</td> <td>68</td> <td>A2</td> <td>A2</td>
//         </tr>
//         <tr>
//             <td>Math</td> <td>9.5</td> <td>9.5</td> <td>55</td> <td>74</td> <td>A1</td>
//             <td>9.5</td> <td>9.5</td> <td>55</td> <td>74</td> <td>A1</td> <td>A1</td>
//         </tr>
//         <tr>
//             <td>Sanskrit</td> <td>8.0</td> <td>8.0</td> <td>47</td> <td>63</td> <td>B1</td>
//             <td>8.0</td> <td>8.0</td> <td>47</td> <td>63</td> <td>B1</td> <td>B1</td>
//         </tr>
//     </table>

//     <div class="co-scholastic">
//         <h3>CO-SCHOLASTIC AREAS</h3>
//         <table>
//             <tr>
//                 <th>Term</th>
//                 <th>Work Education</th>
//                 <th>Art Education</th>
//                 <th>PHE / Yoga</th>
//                 <th>Scouts & Guides</th>
//                 <th>Attendance</th>
//                 <th>Computer (ICT)</th>
//             </tr>
//             <tr>
//                 <td>Term-1</td>
//                 <td>A</td>
//                 <td>A</td>
//                 <td>A</td>
//                 <td>A</td>
//                 <td>96.5%</td>
//                 <td>A</td>
//             </tr>
//             <tr>
//                 <td>Term-2</td>
//                 <td>A</td>
//                 <td>A</td>
//                 <td>A</td>
//                 <td>A</td>
//                 <td>96.5%</td>
//                 <td>A</td>
//             </tr>
//         </table>
//     </div>

//     <p style="text-align: center; font-weight: bold;">Result: Promoted to Class 8-A</p>

//     </div>
//   )
// }

// export default ReportCard