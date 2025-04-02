import React, { forwardRef } from "react";

// Forward ref to access this component in parent
const PrintTable = forwardRef(({ data, itemsPerPage = 20 }, ref) => {
  const paginatedData = [];
  for (let i = 0; i < data?.length; i += itemsPerPage) {
    paginatedData?.push(data?.slice(i, i + itemsPerPage));
  }
  // console.log("paginatedData",paginatedData)
  return (
    <div  className="mt-28">
    <div ref={ref}>
      {paginatedData?.map((pageData, pageIndex) => (
        <div key={pageIndex} className="page p-2">
          <div className="print-header">
            <h2>Students Report - Page {pageIndex + 1}</h2>
          </div>
          <table className="print-table">
            <thead>
              <tr className="whitespace-nowrap">
                <th>S.No</th>
                <th>Adm No.</th>
                <th>Class</th>
                <th>Name</th>
                <th>Father's Name</th>
                <th>Mother's Name</th>
                {/* <th>Email</th> */}
                <th>Contact</th>
                <th>Address</th>
                <th>Adm. Date</th>
              </tr>
            </thead>

            <tbody>
              {pageData?.map((student, index) => (
                <tr key={student?.email} className="whitespace-nowrap">
                  <td>{index + 1 + pageIndex * itemsPerPage}</td>
                  <td>{student?.admissionNumber}</td>
                  <td>{student?.class}</td>
                  <td>
                    {" "}
                    {student?.studentName?.length > 12
                      ? student?.studentName?.substring(0, 12) + "..."
                      : student?.studentName}
                  </td>

                  <td>
                    {" "}
                    {student?.fatherName?.length > 12
                      ? student?.fatherName?.substring(0, 12) + "..."
                      : student?.fatherName}
                  </td>
                  <td>
                    {" "}
                    {student?.motherName?.length > 12
                      ? student?.motherName?.substring(0, 12) + "..."
                      : student?.motherName}
                  </td>
                  {/* <td>
                    {" "}
                    {student?.email?.length > 8
                      ? student?.email?.substring(0, 8) + "."
                      : student?.email}
                  </td> */}
                  <td>{student?.contact}</td>
                  <td>{student?.address}</td>
                  <td>{student?.joiningDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
    </div>
  );
});

export default PrintTable;

// import React, { forwardRef } from "react";

// // Forward ref to access this component in parent
// const PrintTable = forwardRef(({ data, itemsPerPage = 20 }, ref) => {
//   const paginatedData = [];
//   for (let i = 0; i < data.length; i += itemsPerPage) {
//     paginatedData.push(data.slice(i, i + itemsPerPage));
//   }

//   return (
//     <div ref={ref}>
//       {paginatedData.map((pageData, pageIndex) => (
//         <div key={pageIndex} className="page">
//           <div className="print-header">
//             <h2>Students Report - Page {pageIndex + 1}</h2>
//           </div>
//           <table className="print-table">
//             <thead>
//               <tr>
//                 <th>S.No</th>
//                 <th>Name</th>
//                 <th>Email</th>
//                 <th>Class</th>
//                 <th>Section</th>
//               </tr>
//             </thead>
//             <tbody>
//               {pageData.map((student, index) => (
//                 <tr key={student.email}>
//                   <td>{index + 1 + pageIndex * itemsPerPage}</td>
//                   <td>{student.name}</td>
//                   <td>{student.email}</td>
//                   <td>{student.class}</td>
//                   <td>{student.section}</td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ))}
//     </div>
//   );
// });

// export default PrintTable;
