
import React, { useState, useEffect } from "react";




import CanvasJSReact from "@canvasjs/react-charts";
import axios from "axios";
import Cookies from 'js-cookie';
const authToken = Cookies.get('token');
const CanvasJSChart = CanvasJSReact.CanvasJSChart;

const StudentChart = () => {


    const [data, setData] = useState({});
    const [arr, setArr] = useState([]);
    const boys = arr[0];
    const girls = arr[1];
   

    useEffect(() => {
        const fetchData = async () => {
          try {
            const response = await axios.get(
              "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
              {
                withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
              }
            );
    
            if (Array.isArray(response.data.allStudent)) {
              // Filter students by gender
              const boysCount = response.data.allStudent.filter(
                (student) => student.studentGender === "Male"
              ).length;
              const girlsCount = response.data.allStudent.length - boysCount;
    
              setArr([boysCount, girlsCount]);
              setData(boysCount, girlsCount);
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
        animationEnabled: true,
        exportEnabled: true,
        // theme: "dark2", // "light1", "dark1", "dark2"
        title: {
          text: "Student",
        },
        data: [
          {
            type: "pie",
            indexLabel: "{label}: {y}",
            startAngle: -90,
            dataPoints: [
              { y: boys, label: "Boys" },
              { y: girls, label: "Girls" },
              // { y:12 , label: "Student" },
              // { y: boys+girls, label: "Student" },
              // { y: 14, label: "Transportation" },
              // { y: 12, label: "Activities" },
              { y: boys + girls, label: "All Student" },
              // { y: 10, label: "Misc" }
            ],
          },
        ],
      };
  return (
 <>
    {/* <div>StudentChart</div> */}
    {/* <CanvasJSChart options={options} /> */}
    <CanvasJSChart options={options}  width={530} height={200} />

 </>
  )
}

export default StudentChart