import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import axios from "axios";


const TeacherCart = () => {
  const authToken = localStorage.getItem("token");
  // Initialize state variables at the top of the component
  const [data, setData] = useState({
    boys: null,
    girls: null
  });
  const [loading, setLoading] = useState(true);
  const [series, setSeries] = useState([]);
  const [options, setOptions] = useState({
    chart: {
      width: 280,
      type: "pie",
    

    },
    labels: ["Sir ", "Ma'am"],
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 400
          },
          legend: {
            position: "bottom"
          }
        }
      }
    ]
  });

  // Use useEffect for side effects like data fetching
  useEffect(() => {
    const fetchData = async () => {
      try {
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
          const boysCount = response.data.allStudent.filter(
            student => student.studentGender === "Male"
          ).length;
          const girlsCount = response.data.allStudent.length - boysCount;

          setData({
            boys: boysCount,
            girls: girlsCount,
          });

        //   setSeries([boysCount+3 , girlsCount+5]);
          setSeries([boysCount+40 , girlsCount+20]);
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

  return (
    <div id="chart">
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
        <h1 className="text-[#4f6583]">All Teacher :{series[1]+series[0]} </h1>
        <ReactApexChart options={options} series={series} type="pie" 
        width={230} 
        />
        </>
      )}
    </div>
  );
};

export default TeacherCart;

