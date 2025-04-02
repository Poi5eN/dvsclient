// import React from 'react'

// const EarningChart = () => {
//   return (
//     <div>EarningChart</div>
//   )
// }

// export default EarningChart


import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import Cookies from "js-cookie";


const EarningChart = () => {
  const authToken = localStorage.getItem("token");
  const [incomeDataAll, setIncomeDataAll] = useState([]);
  const [expensesDataAll, setExpensesDataAll] = useState([]);

  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/fees/feeIncomeMonths",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        setIncomeDataAll(response.data.data);
        console.log("first fee",response.data.data)
      })
      .catch((error) => {
        console.log("error", error.message);
      });
  }, []);

  useEffect(() => {
  
    setChartData((prevChartData) => ({
      ...prevChartData,
      series: [
        {
          name: "Income",
          data: incomeDataAll,
        },
        {
          name: "Expenses",
          data: expensesDataAll,
        },
      ],
    }));
  }, [incomeDataAll]);

  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/employee/salaryExpensesMonths",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        setExpensesDataAll(response.data.data);
        // console.log("setExpensesDataAll",response.data.data)
      })
      .catch((error) => {
        console.log("error", error.message);
      });
  }, []);

  useEffect(() => {
    // Update chartData when dataAll changes
    setChartData((prevChartData) => ({
      ...prevChartData,
      series: [
        {
          name: "Income",
          data: incomeDataAll,
        },
        {
          name: "Expenses",
          data: expensesDataAll,
        },
      ],
    }));
  }, [expensesDataAll]);

  // const [chartData, setChartData] = useState({
  //   series: [
  //     {
  //       name: "Income",
  //       data: incomeDataAll,
  //       // data: [
  //       //   10, 40, 60, 40, 28, 19, 39, 37, 363, 337, 637, 363
  //       // ],
  //     },
  //     {
  //       name: "Expenses",
  //       data: expensesDataAll,
  //     },
  //   ],
  //   options: {
  //     chart: {
  //       height: 350,
  //       type: "area",
  //     },
  //     dataLabels: {
  //       enabled: false,
  //     },
  //     stroke: {
  //       curve: "smooth",
  //     },
  //     xaxis: {
  //       categories: [
  //         "1",
  //         "2",
  //         "3",
  //         "4",
  //         "5",
  //         "6",
  //         "7",
  //         "8",
  //         "9",
  //         "10",
  //         "11",
  //         "12",
  //       ],
  //     },
  //     tooltip: {
  //       x: {
  //         format: "MM",
  //       },
  //     },
  //   },
  // });

  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Income",
        data: incomeDataAll,
      },
      {
        name: "Expenses",
        data: expensesDataAll,
      },
    ],
    options: {
      chart: {
        // height: 200,
        // height: 350,
        type: "area",
        toolbar: {
          show: false, // Disable the toolbar
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        categories: [
          "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
        ],
      },
      tooltip: {
        x: {
          format: "MM",
        },
      },
    },
  });
  

  return (
    <div className="w-full">
    <h2 className="dark:text-white text-[#01579b] dark:bg-secondary-dark-bg  mx-auto  text-base font-thin"
    // style={{color:"red"}}
    >
      Income and Expenses According to Months
      </h2>
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="area"
          // height={250}
          // height={350}
        />
      </div>
    </div>
  );
};

export default EarningChart;


// // import axios from "axios";
// // import React, { useEffect, useState } from "react";
// // import ReactApexChart from "react-apexcharts";
// // import Cookies from "js-cookie";


// // const EarningChart = () => {
// //   const authToken = Cookies.get("token");
// //   const [incomeDataAll, setIncomeDataAll] = useState([]);
// //   const [expensesDataAll, setExpensesDataAll] = useState([]);

// //   useEffect(() => {
// //     axios
// //       .get(
// //         "https://eserver-i5sm.onrender.com/api/v1/fees/feeIncomeMonths",
// //         {
// //           withCredentials: true,
// //           headers: {
// //             Authorization: `Bearer ${authToken}`,
// //           },
// //         }
// //       )
// //       .then((response) => {
// //         setIncomeDataAll(response.data.data);
// //         console.log("first",response.data.data)
// //       })
// //       .catch((error) => {
// //         console.log("error", error.message);
// //       });
// //   }, []);

// //   useEffect(() => {
  
// //     setChartData((prevChartData) => ({
// //       ...prevChartData,
// //       series: [
// //         {
// //           name: "Income",
// //           data: incomeDataAll,
// //         },
// //         {
// //           name: "Expenses",
// //           data: expensesDataAll,
// //         },
// //       ],
// //     }));
// //   }, [incomeDataAll]);

// //   useEffect(() => {
// //     axios
// //       .get(
// //         "https://eserver-i5sm.onrender.com/api/v1/employee/salaryExpensesMonths",
// //         {
// //           withCredentials: true,
// //           headers: {
// //             Authorization: `Bearer ${authToken}`,
// //           },
// //         }
// //       )
// //       .then((response) => {
// //         setExpensesDataAll(response.data.data);
// //         console.log("setExpensesDataAll",response.data.data)
// //       })
// //       .catch((error) => {
// //         console.log("error", error.message);
// //       });
// //   }, []);

// //   useEffect(() => {
// //     // Update chartData when dataAll changes
// //     setChartData((prevChartData) => ({
// //       ...prevChartData,
// //       series: [
// //         {
// //           name: "Income",
// //           data: incomeDataAll,
// //         },
// //         {
// //           name: "Expenses",
// //           data: expensesDataAll,
// //         },
// //       ],
// //     }));
// //   }, [expensesDataAll]);

// //   const [chartData, setChartData] = useState({
// //     series: [
// //       {
// //         name: "Income",
// //         data: incomeDataAll,
// //         // data: [
// //         //   10, 40, 60, 40, 28, 19, 39, 37, 363, 337, 637, 363
// //         // ],
// //       },
// //       {
// //         name: "Expenses",
// //         data: expensesDataAll,
// //       },
// //     ],
// //     options: {
// //       chart: {
// //         height: 350,
// //         type: "area",
// //       },
// //       dataLabels: {
// //         enabled: false,
// //       },
// //       stroke: {
// //         curve: "smooth",
// //       },
// //       xaxis: {
// //         categories: [
// //           "1",
// //           "2",
// //           "3",
// //           "4",
// //           "5",
// //           "6",
// //           "7",
// //           "8",
// //           "9",
// //           "10",
// //           "11",
// //           "12",
// //         ],
// //       },
// //       tooltip: {
// //         x: {
// //           format: "MM",
// //         },
// //       },
// //     },
// //   });



// //   return (
// //     <div className="w-full">
// //     <h2 className="dark:text-white text-[#01579b] dark:bg-secondary-dark-bg  mx-auto  text-base font-thin"
// //     // style={{color:"red"}}
// //     >
// //       Income and Expenses According to Months
// //       </h2>
// //       <div id="chart">
// //         <ReactApexChart
// //           options={chartData.options}
// //           series={chartData.series}
// //           type="area"
// //           height={350}
// //         />
// //       </div>
// //     </div>
// //   );
// // };

// // export default EarningChart;
