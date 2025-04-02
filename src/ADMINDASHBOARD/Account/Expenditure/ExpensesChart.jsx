import React from 'react'

const ExpensesChart = () => {
  return (
    <div>ExpensesChart</div>
  )
}

export default ExpensesChart

// import axios from 'axios';
// import React, { useState, useEffect } from 'react';
// import ReactApexChart from 'react-apexcharts';
// import Cookies from 'js-cookie';
// const authToken = Cookies.get('token');

// const ExpensesChart = () => {

//   const [dataAll, setDataAll] = useState([]);

//   useEffect(() => {

//     axios.get('https://eserver-i5sm.onrender.com/api/v1/employee/salaryExpensesMonths', 
//     {
//       withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       }
//     }
//     )
//     .then((response) => {
//       setDataAll(response.data.data);
//     })
//     .catch((error) => {
//       console.log("error", error.message);
//     })

//   }, []);

//   useEffect(() => {

//     // Update chartData when dataAll changes
//     setChartData(prevChartData => ({
//       ...prevChartData,
//       series: [
//         {
//           name: 'Income',
//           data: dataAll,
//         },
//       ],
//     }));

//   }, [dataAll]);



//   const [chartData, setChartData] = useState({
//     series: [
//       {
//         name: 'expense',
//         data: dataAll,
//         // data: [
//         //   10, 40, 60, 40, 28, 19, 39, 37, 363, 337, 637, 363
//         // ],
//       },
//     ],
//     options: {
//       chart: {
//         height: 350,
//         type: 'area',
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       stroke: {
//         curve: 'smooth',
//       },
//       xaxis: {
//         categories: [
//           '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'
//         ],
//       },
//       tooltip: {
//         x: {
//           format: 'MM',
//         },
//       },
//     },
//   });

//   return (
   
//     <div className="w-full">
//     <h2 className="text-2xl font-bold text-cyan-700 mb-4">Expenses Chart According to Months</h2>
//     <div id="chart">
//       <ReactApexChart
//         options={chartData.options}
//         series={chartData.series}
//         type="area"
//         height={350}
//       />
//     </div>
//   </div>
//   );
// };

// export default ExpensesChart;
