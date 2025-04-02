import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "axios";


const ExamChart = () => {
  const authToken = localStorage.getItem("token");
  // Initialize state variables at the top of the component
  const [examData, setExamData] = useState([]);
  const [lessDates, setLessDates] = useState([]);
  const [moreDates, setMoreDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([]);
  const [totalExams, setTotalExams] = useState(0); // State for total exams
  const [concludedExams, setConcludedExams] = useState(0); // New state for concluded exams
  const [options, setOptions] = useState({
    chart: {
      width: 280,
      type: "pie",
    },
    labels: ["Concluded", "Upcoming"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 400,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  });

  // Use useEffect for side effects like data fetching

  useEffect(() => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/exam/getAllExams`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        // Set examData with modified examInfo property and calculate total exams
        const currentDate = new Date().toLocaleDateString("en-GB");
        const promises = response.data.examData.map(async (item) => {
          const allDates = await Promise.all(
            item.examInfo.map(async (date) => {
              const dates = date.examDate;
              const formattedDate = new Date(dates).toLocaleDateString("en-GB");
              return formattedDate;
            })
          );

          const lessDates = allDates.filter(
            (formattedDate) => formattedDate < currentDate
          ).length;
          const moreDates = allDates.filter(
            (formattedDate) => formattedDate > currentDate
          ).length;

        
          const examInfoLength = item.examInfo.length;

          const student = JSON.parse(sessionStorage.response);
          const classTeacherClass = student.classTeacher;

          // Check the className and set examData based on a condition
          if (item.className === classTeacherClass) {
            return {
              ...item,
              examInfo: examInfoLength,
              allDates: allDates,
            };
          } else {
            return null; // If the className doesn't match, exclude it from examData
          }
        });

        Promise.all(promises).then((updatedExamData) => {
          // Filter out null values (entries with className not matching classTeacherClass)
          const filteredExamData = updatedExamData.filter(
            (item) => item !== null
          );

         
          setExamData(filteredExamData);

          // Calculate total exams after all promises resolve
          const totalExams = filteredExamData.reduce(
            (acc, item) => acc + item.examInfo,
            0
          );
          setTotalExams(totalExams);

          // Calculate total concluded and upcoming exams
          const totalConcludedExams = filteredExamData.reduce(
            (acc, item) =>
              acc + item.allDates.filter((date) => date < currentDate).length,
            0
          );
          const totalUpcomingExams = filteredExamData.reduce(
            (acc, item) =>
              acc + item.allDates.filter((date) => date > currentDate).length,
            0
          );

          setSeries([totalConcludedExams, totalUpcomingExams]);
          setLoading(false);
        });
      })
      .catch((error) => {
        console.error("Error fetching exam data:", error);
      });
  }, []);

  return (
    <div id="chart">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          <h1 className="text-[#4f6583]">Total Exam : {totalExams}</h1>
          <ReactApexChart
            options={options}
            series={series}
            type="pie"
            width={230}
          />
        </>
      )}
    </div>
  );
};

export default ExamChart;
