

import React from 'react'

const FeeChart = () => {
  return (
    <div>FeeChart</div>
  )
}

export default FeeChart
// // FeeChart
// import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";
// import axios from 'axios';
// import Cookies from 'js-cookie';

// const authToken = Cookies.get('token');

// const FeeChart = () => {
//   const [regularFee, setRegularFee] = useState(0);
//   const [additionalFees, setAdditionalFees] = useState(0);
//   const [totalDues, setTotalDues] = useState(0);
//   const [chartData, setChartData] = useState({ categories: [], series: [] });
//   const [totalPaidAmount, setTotalPaidAmount] = useState(regularFee + additionalFees);

//   useEffect(() => {
//     axios
//       .get(
//         `https://dvsserver.onrender.com/api/v1/fees/getFeeStatus`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         let regularFee = 0;
//         let additionalFees = 0;

//         response.data?.data.forEach((data) => {
//           data.feeHistory.forEach((fees) => {
//             if (fees?.regularFees.length > 0) {
//               const feeTotal = fees?.regularFees.reduce((total, paid) => {
//                 const paidAmount = Number(paid.paidAmount) || 0;
//                 return total + paidAmount;
//               }, 0);
//               regularFee += feeTotal;
//             }
//           });
//         });

//         response.data?.data.forEach((data) => {
//           data.feeHistory.forEach((fees) => {
//             if (fees?.additionalFees.length > 0) {
//               const feeTotal = fees?.additionalFees.reduce((total, paid) => {
//                 const paidAmount = Number(paid.paidAmount) || 0;
//                 return total + paidAmount;
//               }, 0);
//               additionalFees += feeTotal;
//             }
//           });
//         });

//         let totalDues = response.data?.data.reduce((total, paid) => {
//           const paidAmount = Number(paid.dues) || 0;
//           return total + paidAmount;
//         }, 0);

//         // Calculate total paid amount
//         const totalPaid = regularFee + additionalFees;
//         setTotalPaidAmount(totalPaid);
//         setTotalDues(totalDues);

//         setChartData({
//           categories: ['Total Fee', 'Total Dues'],
//           series: [
//             { name: 'Amount', data: [totalPaid, totalDues] }, // Show totalPaidAmount and totalDues
//           ],
         
//         });
//       })
//       .catch((error) => {
//         console.error("Error fetching Fees data: ", error);
//       });
//   }, []);

//   // const options = {
//   //   series: chartData.series || [],
//   //   chart: {
//   //     type: 'bar',
//   //     height: 350,
//   //   },
//   //   xaxis: {
//   //     categories: chartData.categories || [],
//   //   },
//   //   fill: {
//   //     opacity: 1,
//   //   },
//   //   legend: {
//   //     position: 'right',
//   //     offsetX: 0,
//   //     offsetY: 50,
//   //   },
//   //   colors: ['#1E90FF', '#FF4500'], 
//   // };
//   const options = {
//     series: chartData.series || [],
//     chart: {
//       type: 'bar',
//       height: 350,
//     },
//     xaxis: {
//       categories: chartData.categories || [],
//     },
//     plotOptions: {
//       bar: {
//         distributed: true, // Use distributed to assign colors automatically
//       },
//     },
//     fill: {
//       opacity: 1,
//     },
//     legend: {
//       position: 'right',
//       offsetX: 0,
//       offsetY: 50,
//     },
//     colors: ['#1E90FF', '#FF4500'], // First value will be blue for totalPaid, second will be orange for totalDues
//   };

//   return (
//     <div id="chart">
//       <h1 className="dark:text-white dark:bg-secondary-dark-bg text-xl py-2">Fees</h1>
//       <ReactApexChart options={options} series={options.series} type="bar" height={350} />
//     </div>
//   );
// };

// export default FeeChart;


// // // FeeChart
// // import React, { useEffect, useState } from "react";
// // import ReactApexChart from "react-apexcharts";
// // import axios from 'axios';
// // import Cookies from 'js-cookie';

// // const authToken = Cookies.get('token');

// // const FeeChart = () => {

// // const [regularFee,setRegularFee]=useState(0)
// // const [additionalFees,setAdditionalFees]=useState(0)
// // const [totalDues, setTotalDues] = useState(0);
// //   const [chartData, setChartData] = useState({ categories: [], series: [] });
// //   const [totalPaidAmount, setTotalPaidAmount] = useState(regularFee+additionalFees);
 

// //   useEffect(() => {
// //     axios
// //       .get(
// //         `https://dvsserver.onrender.com/api/v1/fees/getFeeStatus`,
// //         {
// //           withCredentials: true,
// //       headers: {
// //         Authorization: `Bearer ${authToken}`,
// //       },
// //         }
// //       )
// //       .then((response) => {
        

// //         let regularFee = 0;
// //         let additionalFees = 0;

// //         response.data?.data.forEach((data) => {
// //           data.feeHistory.forEach((fees) => {
// //             if (fees?.regularFees.length > 0) {
// //               const feeTotal = fees?.regularFees.reduce((total, paid) => {
// //                 const paidAmount = Number(paid.paidAmount) || 0;
// //                 return total + paidAmount;
// //               }, 0);
// //               regularFee += feeTotal;
// //             }
// //           });
// //         });

// //         response.data?.data.forEach((data) => {
// //           data.feeHistory.forEach((fees) => {
// //             if (fees?.additionalFees.length > 0) {
// //               const feeTotal = fees?.additionalFees.reduce((total, paid) => {
// //                 const paidAmount = Number(paid.paidAmount) || 0;
// //                 return total + paidAmount;
// //               }, 0);
// //               additionalFees += feeTotal;
// //             }
// //           });
// //         });
// //         let totalDues = response.data?.data.reduce((total, paid) => {
// //           const paidAmount = Number(paid.dues) || 0;
// //           return total + paidAmount;
// //         }, 0);
 
// //         // const categories = Object.keys(monthlyPaidAmounts);
// //         // const paidSeries = Object.values(monthlyPaidAmounts).map((data) => data.paid);
// //         // const duesSeries = Object.values(monthlyPaidAmounts).map((data) => data.dues);
        

    
// //         setChartData({
// //           categories,
// //           series: [
// //             { name: 'Paid', data: paidSeries },
// //             { name: 'Dues', data: duesSeries },
// //           ],
// //         });

// //         const totalPaid = paidSeries.reduce((total, amount) => total + amount, 0);
// //         setTotalPaidAmount(totalPaid);
// //         const totalDue = duesSeries.reduce((total, amount) => total + amount, 0);
// //         setTotalDues(totalDue);
      
// //       })
// //       .catch((error) => {
// //         console.error("Error fetching Fees data: ", error);
// //       });
// //   }, []);

// //   const options = {
// //     series: chartData.series || [],
// //     chart: {
// //       type: 'bar',
// //       height: 350,
// //     },

// //     xaxis: {
// //       categories: chartData.categories || [],
// //     },
// //     fill: {
// //       opacity: 1,
// //     },
// //     legend: {
// //       position: 'right',
// //       offsetX: 0,
// //       offsetY: 50,
// //     },
// //   };

// //   return (
// //     <div id="chart">
// //       <h1 className="dark:text-white dark:bg-secondary-dark-bg text-xl py-2">Fees</h1>
// //       <ReactApexChart options={options} series={options.series} type="bar" height={350} />
// //     </div>
// //   );
// // };

// // export default FeeChart;



// // // FeeChart
// // import React, { useEffect, useState } from "react";
// // import ReactApexChart from "react-apexcharts";
// // import axios from 'axios';
// // import Cookies from 'js-cookie';
// // const authToken = Cookies.get('token');

// // const FeeChart = () => {
// //   const [chartData, setChartData] = useState({ categories: [], series: [] });
// //   const [totalPaidAmount, setTotalPaidAmount] = useState(0);
// //   const [totalDues, setTotalDues] = useState(0);

// //   useEffect(() => {
// //     axios
// //       .get(
// //         `https://dvsserver.onrender.com/api/v1/fees/getFeeStatus`,
// //         {
// //           withCredentials: true,
// //       headers: {
// //         Authorization: `Bearer ${authToken}`,
// //       },
// //         }
// //       )
// //       .then((response) => {
// //         const totalAmount = response.data.data;

// //         let monthlyPaidAmounts = {};

// //         totalAmount.forEach((total) => {
// //           if (total.feeHistory && total.feeHistory.length > 0) {
// //             total.feeHistory.forEach((fee) => {
// //               const paidAmount = Number(fee.paidAmount || 0);
// //               const month = fee.month; // Assuming there's a 'month' property in fee

// //               // Initialize the sum for the month if it doesn't exist
// //               if (!monthlyPaidAmounts[month]) {
// //                 monthlyPaidAmounts[month] = { paid: 0, dues: 0 };
// //               }

// //               // Add the paidAmount and dues to the sum for the month
// //               monthlyPaidAmounts[month].paid += paidAmount;
// //               monthlyPaidAmounts[month].dues += total.dues || 0;
// //             });
// //           }
// //         });

// //         const categories = Object.keys(monthlyPaidAmounts);
// //         const paidSeries = Object.values(monthlyPaidAmounts).map((data) => data.paid);
// //         const duesSeries = Object.values(monthlyPaidAmounts).map((data) => data.dues);
        

// //         setChartData({
// //           categories,
// //           series: [
// //             { name: 'Paid', data: paidSeries },
// //             { name: 'Dues', data: duesSeries },
// //           ],
// //         });

// //         const totalPaid = paidSeries.reduce((total, amount) => total + amount, 0);
// //         setTotalPaidAmount(totalPaid);
// //         const totalDue = duesSeries.reduce((total, amount) => total + amount, 0);
// //         setTotalDues(totalDue);
      
// //       })
// //       .catch((error) => {
// //         console.error("Error fetching Fees data: ", error);
// //       });
// //   }, []);

// //   const options = {
// //     series: chartData.series || [],
// //     chart: {
// //       type: 'bar',
// //       height: 350,
// //     },
// //     // title: {
// //     //   text: "Fees",
// //     //   className: "text-2xl font-bold text-cyan-700",
// //     // },
// //     xaxis: {
// //       categories: chartData.categories || [],
// //     },
// //     fill: {
// //       opacity: 1,
// //     },
// //     legend: {
// //       position: 'right',
// //       offsetX: 0,
// //       offsetY: 50,
// //     },
// //   };

// //   return (
// //     <div id="chart">
// //       <h1 className="dark:text-white dark:bg-secondary-dark-bg text-xl py-2">Fees</h1>
// //       <ReactApexChart options={options} series={options.series} type="bar" height={350} />
// //     </div>
// //   );
// // };

// // export default FeeChart;