import React from 'react'

const EmployeeChart = () => {
  return (
    <div>EmployeeChart</div>
  )
}

export default EmployeeChart

// import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";
// import axios from 'axios';
// import Cookies from 'js-cookie';
// const authToken = Cookies.get('token');

// const EmployeeChart = () => {
//   const [chartData, setChartData] = useState({ categories: [], series: [] });

//   useEffect(() => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/teacher/getPaymentHistory`,
//         {
//           withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//         }
//       )
//       .then((teacherResponse) => {
//         const teacherSalaryData = teacherResponse.data.data;

//         // Extract month-wise paid amounts for teachers
//         const teacherPaidAmounts = {};
//         teacherSalaryData.forEach((entry) => {
//           entry.salaryHistory.forEach((historyEntry) => {
//             const month = historyEntry.month;
//             const paidAmount = historyEntry.paidAmount;

//             if (!teacherPaidAmounts[month]) {
//               teacherPaidAmounts[month] = 0;
//             }

//             teacherPaidAmounts[month] += paidAmount;
//           });
//         });

//         // Fetch and extract month-wise paid amounts for employees
//         axios
//           .get(
//             `https://eserver-i5sm.onrender.com/api/v1/employee/getPaymentHistory`,
//             {
//               withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//             }
//           )
//           .then((employeeResponse) => {
//             const employeeSalaryData = employeeResponse.data.data;

//             const employeePaidAmounts = {};
//             employeeSalaryData.forEach((entry) => {
//               entry.salaryHistory.forEach((historyEntry) => {
//                 const month = historyEntry.month;
//                 const paidAmount = historyEntry.paidAmount;

//                 if (!employeePaidAmounts[month]) {
//                   employeePaidAmounts[month] = 0;
//                 }

//                 employeePaidAmounts[month] += paidAmount;
//               });
//             });

//             // Combine paid amounts for both teachers and employees
//             const combinedPaidAmounts = {};
//             Object.keys(teacherPaidAmounts).forEach((month) => {
//               combinedPaidAmounts[month] = (combinedPaidAmounts[month] || 0) + teacherPaidAmounts[month];
//             });

//             Object.keys(employeePaidAmounts).forEach((month) => {
//               combinedPaidAmounts[month] = (combinedPaidAmounts[month] || 0) + employeePaidAmounts[month];
//             });

//             const categories = Object.keys(combinedPaidAmounts);
//             const series = categories.map((month) => combinedPaidAmounts[month]);

//             setChartData({ categories, series });
//           })
//           .catch((employeeError) => {
//             console.error("Error fetching Employee Salary data: ", employeeError);
//           });
//       })
//       .catch((teacherError) => {
//         console.error("Error fetching Teacher Salary data: ", teacherError);
//       });
//   }, []);

//   const options = {
//     series: [
//       {
//         name: 'Total Paid Amount',
//         data: chartData.series,
//       },
//     ],
//     chart: {
//       type: 'bar',
//       height: 350,
//     },
//     // title: {
//     //   text: "Employees",
//     //   className: "text-2xl font-bold text-sky-800",
//     // },
//     xaxis: {
//       categories: chartData.categories,
//     },
//     fill: {
//       opacity: 1,
//     },
//     legend: {
//       position: 'right',
//       offsetX: 0,
//       offsetY: 50,
//     },
//   };

//   return (
//     <div id="chart">
//       <h1 className="text-cyan-700 text-2xl font-bold">Employee</h1>
//       <ReactApexChart options={options} series={options.series} type="bar" height={350} />
//     </div>
//   );
// };

// export default EmployeeChart;