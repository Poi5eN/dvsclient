import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from "axios";


ChartJS.register(ArcElement, Tooltip, Legend);

const authToken = localStorage.getItem("token");

export function StudentChart() {
  const [data, setData] = useState({
    labels: ['Boys', 'Girls'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#3B82F6', '#EC4899'],
        borderColor: ['#2563EB', '#DB2777'],
        borderWidth: 1,
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const student = JSON.parse(sessionStorage.response);
        const classTeacherClass = student.classTeacher;
        const classTeacherSection = student.section;

        const response = await axios.get(
          "https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        if (Array.isArray(response.data.allStudent)) {
          const filteredStudents = response.data.allStudent.filter(
            (student) =>
              student.class === classTeacherClass &&
              student.section === classTeacherSection
          );

          const boysCount = filteredStudents.filter(
            (student) => student.gender === "Male"
          ).length;
          const girlsCount = filteredStudents.length - boysCount;

          setData({
            ...data,
            datasets: [
              {
                ...data.datasets[0],
                data: [boysCount, girlsCount],
              },
            ],
          });
          setLoading(false);
        } else {
          console.error("Data format is not as expected:", response.data);
        }
      } catch (error) {
        console.error("Error fetching student data:", error);
      }
    };

    fetchData();
  }, []);

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
      },
      title: {
        display: true,
        text: 'Student Gender Distribution',
      },
    },
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4 text-lg font-semibold">
        Total Students: {data.datasets[0].data.reduce((a, b) => a + b, 0)}
      </div>
      <Pie data={data} options={options} />
    </div>
  );
}

