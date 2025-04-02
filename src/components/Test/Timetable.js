// import React from 'react';
// import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';

// const Timetable = () => {
//   const tableData = [
//     // You can provide your data here
//     ['Time/Days', 'Row 2 D1', 'Row 2 D2', 'Row 2 D3', 'Row 2 D4', 'Row 2 D5', 'Row 2 D6', 'Row 2 D7', 'Row 2 D8', 'Row 2 D9'],
//     ['Row 3 D1', 'Value', 'Value', 'Value', 'Value', 'Value', 'Value', 'Value', 'Value', 'Value'],
//     // Add more rows here
//   ];

//   function Submitform(){
//     console.log( "")
//   }

//   function myFunction(){
//     console.log("h")
//   }
//   return (
//     <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
//       <div className="time_table_c2">
//         <h6 style={{ padding: '10px' }}>Time Table</h6>
//         <div style={{ minHeight: '100vh', backgroundColor: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
//       <div className="time_table_c2">
//         <h6 style={{ padding: '10px' }}>Time Table</h6>
//         <TableContainer component={Paper}>
//           <Table style={{ border: '1px solid #ccc' }}>
//             <TableHead>
//               <TableRow>
//                 {tableData[0].map((header, index) => (
//                   <TableCell key={index} colSpan={10} style={{ border: '1px solid #ccc' }}>
//                     {header}
//                   </TableCell>
//                 ))}
//               </TableRow>
//             </TableHead>
//             <TableBody>
//               {tableData.slice(1).map((rowData, rowIndex) => (
//                 <TableRow key={rowIndex}>
//                   {rowData.map((cell, cellIndex) => (
//                     <TableCell key={cellIndex} style={{ border: '1px solid #ccc' }}>
//                       {cell}
//                     </TableCell>
//                   ))}
//                 </TableRow>
//               ))}
//             </TableBody>
//           </Table>
//         </TableContainer>
//         <Button variant="contained" color="success" className="no-print" onClick={myFunction}>Print Time Table</Button>
//         <Button variant="contained" color="primary" className="no-print" onClick={Submitform}>Upload To Server</Button>
//       </div>
//     </div>
// </div>

// </div>
//   );
// };

// export default Timetable;


import React from 'react'

function Timetable() {
  return (
    <div>Timetable</div>
  )
}

export default Timetable