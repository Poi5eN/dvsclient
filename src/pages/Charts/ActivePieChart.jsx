
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


const ActivePieChart = ({allStudents}) => {
 
  const [data, setData] = useState({
    datasets: [
      {
        data: [],
        backgroundColor: ["#1e4db7", "#880e4f"],
      },
    ],
    labels: ["Boys", "Girls"],
    options: {
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
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
      cutout: '80%', // Adjust the cutout value to change the inner radius of the pie chart
    },
  });

  useEffect(()=>{
    if (Array.isArray(allStudents)) {
      const Active = allStudents.filter(student => student.status === 'active').length;
      const InActive = allStudents.length - Active;
      setData({
        datasets: [
          {
            data: [Active, InActive],
            backgroundColor: ["#00e676", "#fbc02d"],
          },
        ],
        labels: [`Active : ${Active}` , `InActive : ${InActive}`],
        options: {
          ...data.options,
          cutout: '70%', // Adjust the cutout value to change the inner radius of the pie chart
        },
      });
    }
  },[allStudents])
  return (
    <>
      <h1 className="text-center text-[12px] text-cyan-700 font-semibold">Active Students</h1>
      <div className=" rounded-sm flex justify-center items-center ">
        <div className=" ">
          <Pie data={data} options={data.options} />
        </div>
      </div>
    </>
  );
};

export default ActivePieChart;
