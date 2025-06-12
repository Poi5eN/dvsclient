import axios from "axios";
import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
// Cookies import is not used, can be removed if not needed elsewhere.
// import Cookies from "js-cookie";

const EarningChart = () => {
  const authToken = localStorage.getItem("token");
  const [incomeDataAll, setIncomeDataAll] = useState([]);
  const [expensesDataAll, setExpensesDataAll] = useState([]);

  // Fetch Income Data
  useEffect(() => {
    axios
      .get(
        "https://api.digitalvidyasaarthi.in/api/v1/fees/feeIncomeMonths",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        // Ensure response.data.data is an array before mapping
        const rawData = response?.data?.data;
        if (Array.isArray(rawData)) {
          const formattedData = rawData.map(value => parseFloat(value.toFixed(2)));
          setIncomeDataAll(formattedData);
        } else {
          console.error("Income API did not return an array in data.data:", rawData);
          setIncomeDataAll([]); // Set to empty array on unexpected format
        }
      })
      .catch((error) => {
        console.log("Error fetching income data:", error.message);
        setIncomeDataAll([]); // Set to empty array on error
      });
  }, [authToken]); // Add authToken as dependency if it can change

  // Fetch Expenses Data
  useEffect(() => {
    axios
      .get(
        "https://api.digitalvidyasaarthi.in/api/v1/employee/salaryExpensesMonths",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        // Ensure response.data.data is an array before mapping
        const rawData = response?.data?.data;
        if (Array.isArray(rawData)) {
          const formattedData = rawData.map(value => parseFloat(value.toFixed(2)));
          setExpensesDataAll(formattedData);
        } else {
          console.error("Expenses API did not return an array in data.data:", rawData);
          setExpensesDataAll([]); // Set to empty array on unexpected format
        }
      })
      .catch((error) => {
        console.log("Error fetching expenses data:", error.message);
        setExpensesDataAll([]); // Set to empty array on error
      });
  }, [authToken]); // Add authToken as dependency

  // console.log("incomeDataAll before chart update:", incomeDataAll);
  // console.log("expensesDataAll before chart update:", expensesDataAll);

  const [chartData, setChartData] = useState({
    series: [
      {
        name: "Income",
        data: [], // Initialize with empty arrays
      },
      {
        name: "Expenses",
        data: [], // Initialize with empty arrays
      },
    ],
    options: {
      chart: {
        type: "area",
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      stroke: {
        curve: "smooth",
      },
      xaxis: {
        // Assuming 12 months, adjust if your data has different category needs
        categories: [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
        ],
        // If your API returns data for specific months and not always all 12,
        // you might need to dynamically set categories based on the data length
        // or ensure your API always returns 12 data points (even if some are 0).
      },
      tooltip: {
        x: {
          // format: "MM", // This format expects datetime objects for x-axis values.
          // If categories are just month names, this might not be needed or
          // you might need to configure tooltip.x.formatter
        },
      },
      // Add y-axis formatting if desired
      yaxis: {
        labels: {
          formatter: function (value) {
            return "₹" + value.toFixed(2); // Example: Format as currency
          }
        }
      },
    },
  });

  // Unified useEffect to update chart series when income or expenses data changes
  useEffect(() => {
    setChartData((prevChartData) => ({
      ...prevChartData,
      series: [
        {
          name: "Income",
          data: incomeDataAll, // Use the array directly
        },
        {
          name: "Expenses",
          data: expensesDataAll, // Use the array directly
        },
      ],
    }));
  }, [incomeDataAll, expensesDataAll]);


  return (
    <div className="w-full ">
      <h2 className="dark:text-white text-[#01579b] dark:bg-secondary-dark-bg mx-auto text-base font-semibold mb-3 text-center"
      // style={{color:"red"}} // Use Tailwind for styling if possible
      >
        Monthly Income and Expenses
      </h2>
      <div id="chart">
        <ReactApexChart
          options={chartData.options}
          series={chartData.series}
          type="area"
          height={300} // Set a specific height or manage through CSS
        />
      </div>
    </div>
  );
};

export default EarningChart;




// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";
// import Cookies from "js-cookie";


// const EarningChart = () => {
//   const authToken = localStorage.getItem("token");
//   const [incomeDataAll, setIncomeDataAll] = useState([]);
//   const [expensesDataAll, setExpensesDataAll] = useState([]);

//   useEffect(() => {
//     axios
//       .get(
//         "https://api.digitalvidyasaarthi.in/api/v1/fees/feeIncomeMonths",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//          const formattedIncomeData = response?.data?.data?.map(value => parseFloat(value.toFixed(2)));
//         setIncomeDataAll(formattedIncomeData);
//         // console.log("first fee",response.data.data)
//       })
//       .catch((error) => {
//         console.log("error", error.message);
//       });
//   }, []);

//   useEffect(() => {
  
//     setChartData((prevChartData) => ({
//       ...prevChartData,
//       series: [
//         {
//           name: "Income",
//           data: incomeDataAll,
//         },
//         {
//           name: "Expenses",
//           data: expensesDataAll,
//         },
//       ],
//     }));
//   }, [incomeDataAll]);

//   useEffect(() => {
//     axios
//       .get(
//         "https://api.digitalvidyasaarthi.in/api/v1/employee/salaryExpensesMonths",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const formattedIncomeData = response?.data?.data?.map(value => parseFloat(value.toFixed(2)));
//         setExpensesDataAll(formattedIncomeData);
//         // console.log("setExpensesDataAll",response.data.data)
//       })
//       .catch((error) => {
//         console.log("error", error.message);
//       });
//   }, []);
// console?.log("incomeDataAll",incomeDataAll)
//   useEffect(() => {
//     // Update chartData when dataAll changes
//     setChartData((prevChartData) => ({
//       ...prevChartData,
//       series: [
//         {
//           name: "Income",
//           data:  parseFloat(incomeDataAll),
//         },
//         {
//           name: "Expenses",
//           data:  parseFloat(expensesDataAll),
//         },
//       ],
//     }));
//   }, [expensesDataAll]);

//   const [chartData, setChartData] = useState({
//     series: [
//       {
//         name: "Income",
//         data: incomeDataAll,
//       },
//       {
//         name: "Expenses",
//         data: expensesDataAll,
//       },
//     ],
//     options: {
//       chart: {
       
//         type: "area",
//         toolbar: {
//           show: false, // Disable the toolbar
//         },
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       stroke: {
//         curve: "smooth",
//       },
//       xaxis: {
//         categories: [
//           "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"
//         ],
//       },
//       tooltip: {
//         x: {
//           format: "MM",
//         },
//       },
//     },
//   });
  

//   return (
//     <div className="w-full">
//     <h2 className="dark:text-white text-[#01579b] dark:bg-secondary-dark-bg  mx-auto  text-base font-thin"
//     // style={{color:"red"}}
//     >
//       Income and Expenses According to Months
//       </h2>
//       <div id="chart">
//         <ReactApexChart
//           options={chartData.options}
//           series={chartData.series}
//           type="area"
//           // height={250}
//           // height={350}
//         />
//       </div>
//     </div>
//   );
// };

// export default EarningChart;


// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import ReactApexChart from "react-apexcharts";
// import Cookies from "js-cookie";


// const EarningChart = () => {
//   const authToken = localStorage.getItem("token");
//   const [incomeDataAll, setIncomeDataAll] = useState([]);
//   const [expensesDataAll, setExpensesDataAll] = useState([]);

//   useEffect(() => {
//     axios
//       .get(
//         "https://api.digitalvidyasaarthi.in/api/v1/fees/feeIncomeMonths",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setIncomeDataAll(response.data.data);
//         console.log("first",response.data.data)
//       })
//       .catch((error) => {
//         console.log("error", error.message);
//       });
//   }, []);

//   useEffect(() => {
  
//     setChartData((prevChartData) => ({
//       ...prevChartData,
//       series: [
//         {
//           name: "Income",
//           data: incomeDataAll,
//         },
//         {
//           name: "Expenses",
//           data: expensesDataAll,
//         },
//       ],
//     }));
//   }, [incomeDataAll]);

//   useEffect(() => {
//     axios
//       .get(
//         "https://api.digitalvidyasaarthi.in/api/v1/employee/salaryExpensesMonths",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setExpensesDataAll(response.data.data);
//         console.log("setExpensesDataAll",response.data.data)
//       })
//       .catch((error) => {
//         console.log("error", error.message);
//       });
//   }, []);

//   useEffect(() => {
//     // Update chartData when dataAll changes
//     setChartData((prevChartData) => ({
//       ...prevChartData,
//       series: [
//         {
//           name: "Income",
//           data: incomeDataAll,
//         },
//         {
//           name: "Expenses",
//           data: expensesDataAll,
//         },
//       ],
//     }));
//   }, [expensesDataAll]);

//   const [chartData, setChartData] = useState({
//     series: [
//       {
//         name: "Income",
//         data: incomeDataAll,
//         // data: [
//         //   10, 40, 60, 40, 28, 19, 39, 37, 363, 337, 637, 363
//         // ],
//       },
//       {
//         name: "Expenses",
//         data: expensesDataAll,
//       },
//     ],
//     options: {
//       chart: {
//         height: 350,
//         type: "area",
//       },
//       dataLabels: {
//         enabled: false,
//       },
//       stroke: {
//         curve: "smooth",
//       },
//       xaxis: {
//         categories: [
//           "1",
//           "2",
//           "3",
//           "4",
//           "5",
//           "6",
//           "7",
//           "8",
//           "9",
//           "10",
//           "11",
//           "12",
//         ],
//       },
//       tooltip: {
//         x: {
//           format: "MM",
//         },
//       },
//     },
//   });



//   return (
//     <div className="w-full">
//     <h2 className="dark:text-white text-[#01579b] dark:bg-secondary-dark-bg  mx-auto  text-base font-thin"
//     // style={{color:"red"}}
//     >
//       Income and Expenses According to Months
//       </h2>
//       <div id="chart">
//         <ReactApexChart
//           options={chartData.options}
//           series={chartData.series}
//           type="area"
//           height={350}
//         />
//       </div>
//     </div>
//   );
// };

// export default EarningChart;
