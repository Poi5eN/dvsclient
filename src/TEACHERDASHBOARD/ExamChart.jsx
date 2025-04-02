import React, { useState, useEffect } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import axios from "axios";


ChartJS.register(ArcElement, Tooltip, Legend);



export function ExamChart() {
  const authToken = localStorage.getItem("token");
  const [data, setData] = useState({
    labels: ['Concluded', 'Upcoming'],
    datasets: [
      {
        data: [0, 0],
        backgroundColor: ['#10B981', '#F59E0B'],
        borderColor: ['#059669', '#D97706'],
        borderWidth: 1,
      },
    ],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          `https://dvsserver.onrender.com/api/v1/exam/getAllExams`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        const currentDate = new Date().toLocaleDateString("en-GB");
        const student = JSON.parse(sessionStorage.response);
        const classTeacherClass = student.classTeacher;

        const filteredExamData = response.data.examData
          .filter(item => item.className === classTeacherClass)
          .map(item => ({
            ...item,
            examInfo: item.examInfo.length,
            allDates: item.examInfo.map(date => new Date(date.examDate).toLocaleDateString("en-GB"))
          }));

        const totalConcludedExams = filteredExamData.reduce(
          (acc, item) => acc + item.allDates.filter(date => date < currentDate).length,
          0
        );
        const totalUpcomingExams = filteredExamData.reduce(
          (acc, item) => acc + item.allDates.filter(date => date > currentDate).length,
          0
        );

        setData({
          ...data,
          datasets: [
            {
              ...data.datasets[0],
              data: [totalConcludedExams, totalUpcomingExams],
            },
          ],
        });
        setLoading(false);
      } catch (error) {
        console.error("Error fetching exam data:", error);
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
        text: 'Exam Status Distribution',
      },
    },
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div className="flex flex-col items-center">
      <div className="text-center mb-4 text-lg font-semibold">
        Total Exams: {data.datasets[0].data.reduce((a, b) => a + b, 0)}
      </div>
      <Doughnut data={data} options={options} />
    </div>
  );
}

