import React from "react";
import {
  Chart as ChartsJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from "chart.js";
import { PolarArea } from "react-chartjs-2";

ChartsJS?.register(Title, Tooltip, Legend, ArcElement, RadialLinearScale);

const PieChart = ({
  chartTitle = "",
  data = [],
  labels = [],
  colors = [],
}) => {
  const backgroundColors =
    colors.length > 0
      ? colors.map((color) => `${color}B3`) // Adding opacity to hex
      : [
          "rgba(41, 182, 246, 0.7)",
          "rgba(240, 98, 146, 0.7)",
          "rgba(255, 202, 40, 0.7)",
          "rgba(66, 165, 245, 0.7)",
        ];

  const borderColors =
    colors.length > 0
      ? colors.map((color) => color)
      : [
          "rgba(41, 182, 246, 1)",
          "rgba(240, 98, 146, 1)",
          "rgba(255, 202, 40, 1)",
          "rgba(66, 165, 245, 1)",
        ];

  const chartData = {
    datasets: [
      {
        data: data.length > 0 ? data : [0],
        backgroundColor: backgroundColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
    labels: labels.length > 0 ? labels : ["No Data"],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      title: {
        display: !!chartTitle,
        text: chartTitle,
      },
    },
    layout: {
      padding: 20,
    },
    scales: {
      r: {
        beginAtZero: true,
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
      },
    },
  };

  return (
    <>
      {/* <h1 className="text-center text-[12px] text-cyan-700 font-semibold">
        {chartTitle}
      </h1> */}
      <div
       style={{ height: "400px", width: "400px" }}
        // className="shadow-lg"
        >
        <div style={{ position: "relative", height: "100%", width: "100%" }}>
          <PolarArea data={chartData} options={chartOptions} />
        </div>
      </div>
    </>
  );
};

export default PieChart;





// import React, { useEffect, useState } from "react";
// import {
//   Chart as ChartsJS,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
//   RadialLinearScale, 
// } from "chart.js";
// import { PolarArea } from "react-chartjs-2"; 

// ChartsJS?.register(
//   Title,
//   Tooltip,
//   Legend, 
//   ArcElement,
//   RadialLinearScale 
// );

// const PieChart = ({ allStudents }) => { 
//   const [chartData, setChartData] = useState({
//     datasets: [
//       {
//         data: [],
//         backgroundColor: [
//           "rgba(0, 121, 107, 0.7)", // #00796b with some opacity
//           "rgba(136, 14, 79, 0.7)",  // #880e4f with some opacity
//         ],
//         borderColor: [ 
//           "rgba(0, 121, 107, 1)",
//           "rgba(136, 14, 79, 1)",
//         ],
//         borderWidth: 1,
//       },
//     ],
//     labels: ["Boys", "Girls",],
//   });

//   const [chartOptions, setChartOptions] = useState({
//     responsive: true,
//     maintainAspectRatio: false,
//     // aspectRatio: 1, // You can adjust this if needed, or remove for default behavior
//     plugins: {
//       legend: {
//         display: true,
//         position: "bottom",
//       },
//       title: { // Optional: Add a chart title directly via options
//         display: false, // Set to true if you want to use this
//         text: 'Student Gender Distribution'
//       }
//     },
//     layout: {
//       padding: {
//         top: 20,
//         bottom: 20,
//         left: 20,
//         right: 20,
//       },
//     },
//     elements: {
//       arc: {
//         borderWidth: 0, 
//       },
//     },
//     scales: { 
//       r: {
//         beginAtZero: true,
       
//         angleLines: {
//           display: true,
//         },
//         suggestedMin: 0,
       
//       },
//     },
//   });

//   useEffect(() => {
//     if (allStudents && allStudents?.length > 0) {
//        const boysCount= allStudents?.filter(s => s.gender ===  "Male" && s.status === "active").length;

     
// const ActiveStudent= allStudents?.filter(
//         (student) => student.status === "active"
//       ).length || 0
// const DeactiveStudent= allStudents.length-ActiveStudent || 0
//        const girlsCount = ActiveStudent - boysCount;
//       setChartData({
//         datasets: [
//           {
//             data: [boysCount, girlsCount,ActiveStudent,DeactiveStudent],
//             backgroundColor: [
//               "rgba(41, 182, 246, 0.7)",  // #29b6f6 with opacity
//               "rgba(240, 98, 146, 0.7)", // #f06292 with opacity
//               "rgba(140, 109, 146, 0.9)", // #f06292 with opacity
//               "rgba(0, 0, 0, 0.9)", // #f06292 with opacity
//             ],
//             borderColor: [
//               "rgba(41, 182, 246, 1)",
//               "rgba(240, 98, 146, 1)",
//                "rgba(140, 109, 146, 0.9)",
//                "rgba(0, 0, 0, 0.9)",
//             ],
//             borderWidth: 1,
     
//           },
//         ],
//         labels: [`Boys: ${boysCount}`, `Girls: ${girlsCount}`,`Active Student:${ActiveStudent}`, `Deactive Student:${DeactiveStudent}`,],
//       });
//     } else {
//       // Handle case with no students, e.g., set empty data
//       setChartData({
//         datasets: [
//           {
//             data: [0, 0],
//             backgroundColor: [
//               "rgba(41, 182, 246, 0.7)",
//               "rgba(240, 98, 146, 0.7)",
//               "rgba(240, 98, 146, 0.7)",
//               "rgba(340, 98, 146, 0.7)",
//             ],
//             borderColor: [
//               "rgba(41, 182, 246, 1)",
//               "rgba(240, 98, 146, 1)",
//               "rgba(140, 109, 146, 1)",
//               "rgba(340, 109, 146, 1)",
//             ],
//             borderWidth: 1,
//           },
//         ],
//         labels: ["Boys: 0", "Girls: 0","ActiveStudent:0"],
//       });
//     }
//   }, [allStudents]);

//   return (
//     <>
//       <h1 className="text-center text-[12px] text-cyan-700 font-semibold">
//         All Students (Gender Distribution)
//       </h1>
//       <div 

//        style={{ height: '400px', width: '400px' }}
//       > 
//         <div style={{ position: 'relative', height: '100%', width: '100%' }}>
//           <PolarArea data={chartData} options={chartOptions} />
//         </div>
//       </div>
//     </>
//   );
// };

// export default PieChart;





// import React, { useEffect, useState } from "react";
// import {
//   Chart as ChartsJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement,
// } from "chart.js";
// import { Pie } from "react-chartjs-2";
// ChartsJS.register(
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
//   ArcElement
// );
// const PieChart = ({allStudents}) => {
 
//   const [data, setData] = useState({
//     datasets: [
//       {
//         data: [],
//         backgroundColor: ["#00796b", "#880e4f"],
//       },
//     ],
//     labels: ["Boys", "Girls"],
//     options: {
//       plugins: {
//         legend: {
//           display: true,
//           position: "bottom",
//         },
//       },
//       layout: {
//         padding: {
//           top: 20,
//           bottom: 20,
//           left: 20,
//           right: 20,
//         },
//       },
//       elements: {
//         arc: {
//           borderWidth: 0,
//         },
//       },
//       responsive: true,
//       maintainAspectRatio: false,
//       aspectRatio: 1, // Adjust this value to your desired aspect ratio
//       cutout: "80%", // Adjust the cutout value to change the inner radius of the pie chart
//     },
//   });


//   useEffect(()=>{
//     const boysCount = allStudents.filter(
//       (student) => student.gender === "Male"
//     ).length;
//     const girlsCount = allStudents.length - boysCount;
//     setData({
//       datasets: [
//         {
//           data: [boysCount, girlsCount],
//           backgroundColor: ["#29b6f6", "#f06292"],
//         },
//       ],
//       labels: [`Boys : ${boysCount}`, `Girls : ${girlsCount}`],
//       options: {
//         ...data.options,
//         cutout: "70%", // Adjust the cutout value to change the inner radius of the pie chart
//       },
//     });
//   },[allStudents])

//   return (
//     <>
//       <h1 className="text-center text-[12px] text-cyan-700 font-semibold">
//         All Students
//       </h1>
//       <div className=" rounded-sm flex justify-center items-center ">
//         <div className=" ">
//           <Pie data={data} options={data.options} />
//         </div>
//       </div>
//     </>
//   );
// };

// export default PieChart;
