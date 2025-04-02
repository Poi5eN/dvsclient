import React from "react";

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

const ReportCard = () => {
  return (
    <div className="w-[210mm] h-[297mm] mx-auto p-8 bg-white border border-gray-300 shadow-lg">
      {/* Header */}
      <div className="relative text-center pb-4">
        <div className="absolute left-0 top-0 w-20 h-20">
          <img src="https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg" alt="Left Logo" className="w-full" />
        </div>
        <h1 className="text-xl font-bold">केंद्रीय विद्यालय औरंगाबाद</h1>
        <h2 className="text-lg font-semibold">KENDRIYA VIDYALAYA AURANGABAD CANTT S-1</h2>
        <p className="text-sm">CHAWANI</p>
        <p className="text-sm">E-mail: shift1kvaurangabad@gmail.com | Website: www.kvaurangabad.org</p>
        <h3 className="text-md font-bold mt-2">FINAL REPORT CARD</h3>
        <p className="text-sm font-semibold">Academic Session 2020-21</p>
        <div className="absolute right-0 top-0 w-20 h-20">
          <img src="https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg" alt="Right Logo" className="w-full" />
        </div>
      </div>

      {/* Student Details */}
      {/* <div className="grid grid-cols-3 gap-4 mt-4 text-sm border-b-2 border-yellow-500 pb-2">
        <p><b>Name :</b> {student.name}</p>
        <p><b>Class & Sec:</b> {student.class}</p>
        <p><b>Father's Name:</b> {student.fatherName}</p>
        <p><b>Mother's Name:</b> {student.motherName}</p>
        <p><b>Roll No:</b> {student.rollNo}</p>
        <p><b>Admin No:</b> {student.admNo}</p>
        <p><b>DOB:</b> {student.dob}</p>
      </div> */}
<table className="w-full mt-4 text-sm">
  <tbody>
    <tr>
      <td className="px-2 py-1  whitespace-nowrap"><b>Name:</b></td>
      <td className="px-2 py-1  whitespace-nowrap">{student.name}</td>
      <td className="px-2 py-1  whitespace-nowrap"><b>Class & Sec:</b></td>
      <td className="px-2 py-1  whitespace-nowrap">{student.class}</td>
      <td className="px-2 py-1  whitespace-nowrap"><b>Roll No:</b></td>
      <td className="px-2 py-1  whitespace-nowrap">{student.rollNo}</td>
    </tr>
    <tr>
     
      <td className="px-2 py-1  whitespace-nowrap"><b>Mother's Name:</b></td>
      <td className="px-2 py-1  whitespace-nowrap">{student.motherName}</td>
      <td className="px-2 py-1  whitespace-nowrap"><b>Admin No:</b></td>
      <td className="px-2 py-1  whitespace-nowrap">{student.admNo}</td>
    </tr>
    <tr>
     
      <td className="px-2 py-1  whitespace-nowrap"><b>Father's Name:</b></td>
      <td className="px-2 py-1  whitespace-nowrap">{student.fatherName}</td>
      <td className="px-2 py-1  whitespace-nowrap"><b>Admin No:</b></td>
      <td className="px-2 py-1  whitespace-nowrap">{student.admNo}</td>
      <td className="px-2 py-1  whitespace-nowrap"><b>Contact No:</b></td>
      <td className="px-2 py-1  whitespace-nowrap">{student.admNo}</td>
    </tr>
    <tr>
      <td className="px-2 py-1  whitespace-nowrap"><b>Address:</b></td>
      <td className="px-2 py-1  whitespace-nowrap">{student.dob}</td>
    </tr>
  </tbody>
</table>

      {/* Scholastic Table */}
      <div className="border-2 p-2 bg-yellow-400 border-black mt-2">
     <h2 className=" font-semibold text-lg ">Scholastic Areas</h2>
     </div>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-yellow-400 text-black border ">
            <th className="border  border-black p-2">Subjects</th>
            <th className="border border-black  p-2">PT (10)</th>
            <th className="border border-black  p-2">Portfolio (10)</th>
            <th className="border border-black  p-2">Half Yearly/SEE (80)</th>
            <th className="border border-black  p-2">Total (100)</th>
            <th className="border border-black  p-2">Grade</th>
          </tr>
        </thead>
        <tbody className="mt-2">
          {student.subjects.map((subject, index) => (
            <tr key={index} className="border border-black ">
              <td className="border border-black p-2">{subject.name}</td>
              <td className="border border-black p-2">{subject.term2.pt}</td>
              <td className="border border-black p-2">{subject.term2.pf}</td>
              <td className="border border-black p-2">{subject.term2.see}</td>
              <td className="border border-black p-2 bg-green-300">{subject.term2.total}</td>
              <td className="border border-black p-2 bg-green-300">{subject.term2.grade}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Co-Scholastic Areas */}
     <div className="border-2 p-2 bg-yellow-400 border-black mt-4">
     <h2 className=" font-semibold text-lg ">Co-Scholastic Areas</h2>
     </div>
      <table className="w-full border text-sm">
        <thead>
          <tr className="bg-yellow-400 text-black">
            <th className="border border-black p-2">Activity</th>
            <th className="border border-black p-2">Grade</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(student.coScholastic[1]).map(([key, value], index) =>
            key !== "term" && key !== "attendance" ? (
              <tr key={index} className="border">
                <td className="border border-black px-2">{key.replace(/([A-Z])/g, " $1")}</td>
                <td className="border border-black px-2">{value}</td>
              </tr>
            ) : null
          )}
        </tbody>
      </table>

      {/* Attendance */}
      <p className="mt-4"><b>Overall Attendance:</b> {student.coScholastic[1].attendance}</p>

      {/* Result */}
      <h2 className="mt-4 text-lg font-semibold">RESULT: PASSED</h2>
      <p>Promoted to Class: 8-A</p>

      {/* Signatures */}
      <div className="mt-6 flex justify-between text-sm">
        <p>Class Teacher: ______</p>
        <p>Principal: ______</p>
      </div>
    </div>
  );
};

export default ReportCard;



// import React from "react";

// const ReportCard = () => {
//   return (
//     <div className="w-[210mm] h-[297mm] mx-auto p-8 bg-white border border-gray-300 shadow-lg">
//       {/* Header */}


//       <div className="relative text-center border-b-4 border-gray-300 pb-4">


//         <div className="absolute left-0 top-0 w-20 h-20">
//           <img src="https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg" alt="Left Logo" className="w-full" />
//         </div>
//         <h1 className="text-xl font-bold">केंद्रीय विद्यालय औरंगाबाद</h1>
//         <h2 className="text-lg font-semibold">KENDRIYA VIDYALAYA AURANGABAD CANTT S-1</h2>
//         <p className="text-sm">CHAWANI</p>
//         <p className="text-sm">E-mail: shift1kvaurangabad@gmail.com | Website: www.kvaurangabad.org</p>
//         <h3 className="text-md font-bold mt-2">FINAL REPORT CARD</h3>
//         <p className="text-sm font-semibold">academic session 2020-21</p>
//         <div className="absolute right-0 top-0 w-20 h-20">
//           <img src="https://logowik.com/content/uploads/images/cbse-central-board-of-secondary-education-colored7663.jpg" alt="Right Logo" className="w-full" />
//         </div>
//       </div>

//       {/* Student Details */}
//       <div className="grid grid-cols-3 gap-4 mt-4 text-sm border-b-2 border-yellow-500 pb-2">
//         <p><b>Name of Student:</b> Anujika Gawane</p>
//         <p><b>Class & Sec:</b> 8-B</p>
//         <p><b>Father's Name:</b> Gajanan</p>
//         <p><b>Mother's Name:</b> Suman</p>
//         <p><b>Address:</b> Pl no 42 RADHASWAMI colony, Harul</p>
//         <p><b>Roll No:</b> 923</p>
//         <p><b>Blood Group:</b> AB+</p>
//         <p><b>Contact No:</b> 9673125448</p>
//         <p><b>Admin No:</b> 10320</p>
//         <p><b>DOB:</b> 21-Sep-06</p>
//       </div>

//       {/* Scholastic Table */}
//       <table className="w-full mt-4 border text-sm">
//         <thead>
//           <tr className="bg-yellow-400 text-black">
//             <th className="border p-2">Subjects</th>
//             <th className="border p-2">PT (5)</th>
//             <th className="border p-2">Portfolio (5)</th>
//             <th className="border p-2">Sub Enrich (5)</th>
//             <th className="border p-2">Annual Exam (100)</th>
//             <th className="border p-2">Total (100)</th>
//             <th className="border p-2">Grade</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="border">
//             <td className="border p-2">Math</td>
//             <td className="border p-2">5</td>
//             <td className="border p-2">5</td>
//             <td className="border p-2">5</td>
//             <td className="border p-2">92</td>
//             <td className="border p-2 bg-green-300">97</td>
//             <td className="border p-2">A1</td>
//           </tr>
//           {/* Add more subjects similarly */}
//         </tbody>
//       </table>

//       {/* Co-Scholastic Areas */}
//       <h2 className="mt-4 font-semibold text-lg">Co-Scholastic Areas</h2>
//       <table className="w-full mt-2 border text-sm">
//         <thead>
//           <tr className="bg-yellow-400 text-black">
//             <th className="border p-2">Activity</th>
//             <th className="border p-2">Grade</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="border">
//             <td className="border p-2">Work Education</td>
//             <td className="border p-2">A</td>
//           </tr>
//           {/* Add more activities */}
//         </tbody>
//       </table>

//       {/* Miscellaneous Info */}
//       <div className="mt-4 text-sm">
//         <p><b>Overall Attendance:</b> 435 / 436</p>
//         <p><b>Height:</b> 215.0 cm</p>
//         <p><b>Weight:</b> 48.0 kg</p>
//       </div>

//       {/* Result */}
//       <h2 className="mt-4 text-lg font-semibold">RESULT: PASSED</h2>
//       <p>Promoted to Class: 9-B</p>

//       {/* Signatures */}
//       <div className="mt-6 flex justify-between text-sm">
//         <p>Class Teacher: ______</p>
//         <p>Principal: ______</p>
//       </div>
//     </div>
//   );
// };

// export default ReportCard;


// import React from "react";

// const Report2 = () => {
//   return (
//     <div className="w-[210mm] h-[297mm] mx-auto p-8 bg-white border border-gray-300 shadow-lg">
//       {/* Header */}
//       <div className="text-center">
//         <h1 className="text-xl font-bold">KENDRIYA VIDYALAYA AURANGABAD CANTT S-1</h1>
//         <p className="text-sm">FINAL REPORT CARD - Academic Session 2020-21</p>
//       </div>

//       {/* Student Details */}
//       <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
//         <p><b>Name:</b> Anujika Gawane</p>
//         <p><b>Class:</b> 8-B</p>
//         <p><b>Roll No:</b> 923</p>
//         <p><b>Blood Group:</b> A+</p>
//         <p><b>DOB:</b> 12-Sep-06</p>
//       </div>

//       {/* Scholastic Table */}
//       <table className="w-full mt-4 border text-sm">
//         <thead>
//           <tr className="bg-yellow-400 text-black">
//             <th className="border p-2">Subjects</th>
//             <th className="border p-2">PT (5)</th>
//             <th className="border p-2">Portfolio (5)</th>
//             <th className="border p-2">Sub Enrich (5)</th>
//             <th className="border p-2">Annual Exam (100)</th>
//             <th className="border p-2">Total (100)</th>
//             <th className="border p-2">Grade</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="border">
//             <td className="border p-2">Math</td>
//             <td className="border p-2">5</td>
//             <td className="border p-2">5</td>
//             <td className="border p-2">5</td>
//             <td className="border p-2">92</td>
//             <td className="border p-2 bg-green-300">97</td>
//             <td className="border p-2">A1</td>
//           </tr>
//           {/* Add more subjects similarly */}
//         </tbody>
//       </table>

//       {/* Co-Scholastic Areas */}
//       <h2 className="mt-4 font-semibold text-lg">Co-Scholastic Areas</h2>
//       <table className="w-full mt-2 border text-sm">
//         <thead>
//           <tr className="bg-yellow-400 text-black">
//             <th className="border p-2">Activity</th>
//             <th className="border p-2">Grade</th>
//           </tr>
//         </thead>
//         <tbody>
//           <tr className="border">
//             <td className="border p-2">Work Education</td>
//             <td className="border p-2">A</td>
//           </tr>
//           {/* Add more activities */}
//         </tbody>
//       </table>

//       {/* Miscellaneous Info */}
//       <div className="mt-4 text-sm">
//         <p><b>Overall Attendance:</b> 435 / 436</p>
//         <p><b>Height:</b> 215.0 cm</p>
//         <p><b>Weight:</b> 48.0 kg</p>
//       </div>

//       {/* Result */}
//       <h2 className="mt-4 text-lg font-semibold">RESULT: PASSED</h2>
//       <p>Promoted to Class: 9-B</p>

//       {/* Signatures */}
//       <div className="mt-6 flex justify-between text-sm">
//         <p>Class Teacher: ______</p>
//         <p>Principal: ______</p>
//       </div>
//     </div>
//   );
// };

// export default Report2;
