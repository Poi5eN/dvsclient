import React, { useEffect, useState } from "react";
import {
  Chart as ChartsJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Pie } from "react-chartjs-2";
ChartsJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);
const PieChart = ({allStudents}) => {
 
  const [data, setData] = useState({
    datasets: [
      {
        data: [],
        backgroundColor: ["#00796b", "#880e4f"],
      },
    ],
    labels: ["Boys", "Girls"],
    options: {
      plugins: {
        legend: {
          display: true,
          position: "bottom",
        },
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
          borderWidth: 0,
        },
      },
      responsive: true,
      maintainAspectRatio: false,
      aspectRatio: 1, // Adjust this value to your desired aspect ratio
      cutout: "80%", // Adjust the cutout value to change the inner radius of the pie chart
    },
  });


  useEffect(()=>{
    const boysCount = allStudents.filter(
      (student) => student.gender === "Male"
    ).length;
    const girlsCount = allStudents.length - boysCount;
    setData({
      datasets: [
        {
          data: [boysCount, girlsCount],
          backgroundColor: ["#29b6f6", "#f06292"],
        },
      ],
      labels: [`Boys : ${boysCount}`, `Girls : ${girlsCount}`],
      options: {
        ...data.options,
        cutout: "70%", // Adjust the cutout value to change the inner radius of the pie chart
      },
    });
  },[allStudents])

  return (
    <>
      <h1 className="text-center text-[12px] text-cyan-700 font-semibold">
        All Students
      </h1>
      <div className=" rounded-sm flex justify-center items-center ">
        <div className=" ">
          <Pie data={data} options={data.options} />
        </div>
      </div>
    </>
  );
};

export default PieChart;
