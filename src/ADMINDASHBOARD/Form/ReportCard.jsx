import React from "react";

function ReportCardUI() {
  return (
    <div className="w-full max-w-4xl mx-auto p-8 bg-white shadow-lg rounded-lg">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Student Report Card</h1>
        <p className="text-gray-600 text-sm">Academic Year: 2023 - 2024</p>
      </div>

      {/* Student Details */}
      <div className="mb-6 border-b pb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-700">
              <span className="font-bold">Name:</span> Jane Doe
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Roll No:</span> 2023401
            </p>
          </div>
          <div>
            <p className="text-gray-700">
              <span className="font-bold">Class:</span> 8th Grade
            </p>
            <p className="text-gray-700">
              <span className="font-bold">Section:</span> B
            </p>
          </div>
        </div>
      </div>

      {/* Result Table */}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200 text-gray-700">
              <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Semester 1</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Semester 2</th>
              <th className="border border-gray-300 px-4 py-2 text-center">Semester 3</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-left">Mathematics</td>
              <td className="border border-gray-300 px-4 py-2 text-center">85</td>
              <td className="border border-gray-300 px-4 py-2 text-center">89</td>
              <td className="border border-gray-300 px-4 py-2 text-center">92</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-left">Science</td>
              <td className="border border-gray-300 px-4 py-2 text-center">78</td>
              <td className="border border-gray-300 px-4 py-2 text-center">82</td>
              <td className="border border-gray-300 px-4 py-2 text-center">88</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-left">English</td>
              <td className="border border-gray-300 px-4 py-2 text-center">90</td>
              <td className="border border-gray-300 px-4 py-2 text-center">94</td>
              <td className="border border-gray-300 px-4 py-2 text-center">96</td>
            </tr>
            <tr>
              <td className="border border-gray-300 px-4 py-2 text-left">History</td>
              <td className="border border-gray-300 px-4 py-2 text-center">84</td>
              <td className="border border-gray-300 px-4 py-2 text-center">88</td>
              <td className="border border-gray-300 px-4 py-2 text-center">91</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-8">
        <div className="text-center">
          <p className="font-semibold">Teacher's Signature</p>
          <div className="mt-4 w-32 border-t-2 border-gray-400 mx-auto"></div>
        </div>
        <div className="text-center">
          <p className="font-semibold">Parent's Signature</p>
          <div className="mt-4 w-32 border-t-2 border-gray-400 mx-auto"></div>
        </div>
      </div>
    </div>
  );
}

export default ReportCardUI;


// import React from "react";

// function ReportCard() {
//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-lg">
//       {/* Header */}
//       <div className="text-center mb-6">
//         <img
//           src="https://via.placeholder.com/80" // Replace with school logo
//           alt="School Logo"
//           className="mx-auto mb-2"
//         />
//         <h1 className="text-2xl font-bold text-gray-800">Student Report Card</h1>
//         <p className="text-gray-600">Academic Year: 2023-2024</p>
//       </div>

//       {/* Student Information */}
//       <div className="border-t border-b py-4 mb-6">
//         <div className="flex justify-between text-gray-700">
//           <div>
//             <p><span className="font-semibold">Name:</span> John Doe</p>
//             <p><span className="font-semibold">Roll Number:</span> 12345</p>
//           </div>
//           <div>
//             <p><span className="font-semibold">Class:</span> 10th Grade</p>
//             <p><span className="font-semibold">Section:</span> A</p>
//           </div>
//         </div>
//       </div>

//       {/* Results Table */}
//       <div className="overflow-x-auto">
//         <table className="min-w-full border-collapse border border-gray-300">
//           <thead>
//             <tr className="bg-gray-100">
//               <th className="border border-gray-300 px-4 py-2 text-left">Subject</th>
//               <th className="border border-gray-300 px-4 py-2 text-center">Semester 1</th>
//               <th className="border border-gray-300 px-4 py-2 text-center">Semester 2</th>
//               <th className="border border-gray-300 px-4 py-2 text-center">Semester 3</th>
//             </tr>
//           </thead>
//           <tbody>
//             {/* Example Row */}
//             <tr>
//               <td className="border border-gray-300 px-4 py-2 text-left">Math</td>
//               <td className="border border-gray-300 px-4 py-2 text-center">85</td>
//               <td className="border border-gray-300 px-4 py-2 text-center">88</td>
//               <td className="border border-gray-300 px-4 py-2 text-center">90</td>
//             </tr>
//             <tr>
//               <td className="border border-gray-300 px-4 py-2 text-left">Science</td>
//               <td className="border border-gray-300 px-4 py-2 text-center">78</td>
//               <td className="border border-gray-300 px-4 py-2 text-center">82</td>
//               <td className="border border-gray-300 px-4 py-2 text-center">85</td>
//             </tr>
//             <tr>
//               <td className="border border-gray-300 px-4 py-2 text-left">English</td>
//               <td className="border border-gray-300 px-4 py-2 text-center">90</td>
//               <td className="border border-gray-300 px-4 py-2 text-center">92</td>
//               <td className="border border-gray-300 px-4 py-2 text-center">94</td>
//             </tr>
//           </tbody>
//         </table>
//       </div>

//       {/* Footer */}
//       <div className="mt-6 flex justify-between text-gray-700">
//         <div className="text-center">
//           <p className="font-semibold">Teacher's Signature</p>
//           <div className="border-t-2 border-gray-300 mt-4 w-32 mx-auto"></div>
//         </div>
//         <div className="text-center">
//           <p className="font-semibold">Parent's Signature</p>
//           <div className="border-t-2 border-gray-300 mt-4 w-32 mx-auto"></div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default ReportCard;
