import React, { useEffect, useState } from "react";
import {
  Chart as ChartsJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale, // Added for PolarArea chart
} from "chart.js";
import { PolarArea } from "react-chartjs-2"; // Changed from Pie to PolarArea

// Register the necessary components for PolarArea
ChartsJS?.register(
  Title,
  Tooltip,
  Legend, 
  ArcElement,
  RadialLinearScale // Ensure RadialLinearScale is registered
);

const PieChart = ({ allStudents }) => { // Renamed component for clarity
  const [chartData, setChartData] = useState({
    datasets: [
      {
        data: [],
        backgroundColor: [
          "rgba(0, 121, 107, 0.7)", // #00796b with some opacity
          "rgba(136, 14, 79, 0.7)",  // #880e4f with some opacity
        ],
        borderColor: [ // Optional: add borders for better visual separation
          "rgba(0, 121, 107, 1)",
          "rgba(136, 14, 79, 1)",
        ],
        borderWidth: 1,
      },
    ],
    labels: ["Boys", "Girls",],
  });

  const [chartOptions, setChartOptions] = useState({
    responsive: true,
    maintainAspectRatio: false,
    // aspectRatio: 1, // You can adjust this if needed, or remove for default behavior
    plugins: {
      legend: {
        display: true,
        position: "bottom",
      },
      title: { // Optional: Add a chart title directly via options
        display: false, // Set to true if you want to use this
        text: 'Student Gender Distribution'
      }
    },
    layout: {
      padding: {
        top: 20,
        bottom: 20,
        left: 20,
        right: 20,
      },
    },
    elements: {
      arc: {
        borderWidth: 0, // Can be overridden by dataset.borderWidth
      },
    },
    scales: { // Specific to PolarArea for the radial axis
      r: {
        beginAtZero: true,
        // You can add more configuration for the radial scale here
        // e.g., ticks, grid lines
        angleLines: {
          display: true,
        },
        suggestedMin: 0,
        // suggestedMax: can be set if you know the max value, or let it auto-calculate
      },
    },
  });

  useEffect(() => {
    if (allStudents && allStudents?.length > 0) {
       const boysCount= allStudents?.filter(s => s.gender ===  "Male" && s.status === "active").length;

     
const ActiveStudent= allStudents?.filter(
        (student) => student.status === "active"
      ).length || 0
const DeactiveStudent= allStudents.length-ActiveStudent || 0
       const girlsCount = ActiveStudent - boysCount;
      setChartData({
        datasets: [
          {
            data: [boysCount, girlsCount,ActiveStudent,DeactiveStudent],
            backgroundColor: [
              "rgba(41, 182, 246, 0.7)",  // #29b6f6 with opacity
              "rgba(240, 98, 146, 0.7)", // #f06292 with opacity
              "rgba(140, 109, 146, 0.9)", // #f06292 with opacity
              "rgba(0, 0, 0, 0.9)", // #f06292 with opacity
            ],
            borderColor: [
              "rgba(41, 182, 246, 1)",
              "rgba(240, 98, 146, 1)",
               "rgba(140, 109, 146, 0.9)",
               "rgba(0, 0, 0, 0.9)",
            ],
            borderWidth: 1,
            // label: 'Number of Students' // Optional: label for the dataset
          },
        ],
        labels: [`Boys: ${boysCount}`, `Girls: ${girlsCount}`,`Active Student:${ActiveStudent}`, `Deactive Student:${DeactiveStudent}`,],
      });
    } else {
      // Handle case with no students, e.g., set empty data
      setChartData({
        datasets: [
          {
            data: [0, 0],
            backgroundColor: [
              "rgba(41, 182, 246, 0.7)",
              "rgba(240, 98, 146, 0.7)",
              "rgba(240, 98, 146, 0.7)",
              "rgba(340, 98, 146, 0.7)",
            ],
            borderColor: [
              "rgba(41, 182, 246, 1)",
              "rgba(240, 98, 146, 1)",
              "rgba(140, 109, 146, 1)",
              "rgba(340, 109, 146, 1)",
            ],
            borderWidth: 1,
          },
        ],
        labels: ["Boys: 0", "Girls: 0","ActiveStudent:0"],
      });
    }
  }, [allStudents]);

  return (
    <>
      <h1 className="text-center text-[12px] text-cyan-700 font-semibold">
        All Students (Gender Distribution)
      </h1>
      <div 
      // className="rounded-sm flex justify-center items-center"
       style={{ height: '400px', width: '400px' }}
      > {/* Example fixed size */}
        {/* You might need to adjust the container size for PolarArea to display well */}
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
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
