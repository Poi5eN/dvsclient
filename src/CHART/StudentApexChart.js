import React from 'react'

const StudentApexChart = () => {
  return (
    <div>StudentApexChart</div>
  )
}

export default StudentApexChart


// import React, { useState, useEffect } from "react";
// import ReactApexChart from "react-apexcharts";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { useStateContext } from "../contexts/ContextProvider";

// const authToken = Cookies.get("token");

// const StudentApexChart = () => {
//   const { currentColor } = useStateContext();
//   const [loading, setLoading] = useState(true);
//   const [series, setSeries] = useState([]);
//   const [options, setOptions] = useState({
//     chart: {
//       type: "pie",
//       width: '100%', // Use full width
//     },
//     labels: ["Boys", "Girls"],
//     responsive: [
//       {
//         breakpoint: 480,
//         options: {
//           chart: {
//             width: 300 //Adjusting chart size on mobile screens
//           },
//           legend: {
//             position: "bottom",
//           },
//         },
//       },
//     ],
//   });

//   const student = JSON.parse(sessionStorage.response);
//   const classTeacherClass = student.classTeacher;
//   const classTeacherSection = student.section;

//   useEffect(() => {
//     const fetchData = async () => {
//       setLoading(true); // Set loading to true before fetching
//       try {
//         const response = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents",
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );

//         if (Array.isArray(response.data.allStudent)) {
//           const filteredStudents = response.data.allStudent.filter(
//             (student) =>
//               student.class === classTeacherClass &&
//               student.section === classTeacherSection
//           );
//           localStorage.setItem('studentsData', JSON.stringify(filteredStudents));

//           const boysCount = filteredStudents.filter(
//             (student) => student.gender === "MALE"
//           ).length;
//           const girlsCount = filteredStudents.length - boysCount;
//           setSeries([boysCount, girlsCount]);
//         } else {
//           console.error("Data format is not as expected:", response.data);
//         }
//       } catch (error) {
//         console.error("Error fetching student data:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [classTeacherClass, classTeacherSection]);

//   return (
//     <div
//       id="chart"
//       className="dark:text-white dark:bg-secondary-dark-bg  rounded-md "
//     >
//       {loading ? (
//         <div className="text-center py-6">Loading...</div>
//       ) : (
//         <>
//           <h1
//             className="font-bold mb-2 text-center md:text-left ml-2"
//             style={{ color: currentColor }}
//           >
//             All Student : {series[1] + series[0]}
//           </h1>
//           <div className="flex justify-center">
//              <ReactApexChart
//               options={options}
//               series={series}
//               type="pie"
//               width={'90%'}
//              />
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default StudentApexChart;

// // import React, { useState, useEffect } from "react";
// // import ReactApexChart from "react-apexcharts";
// // import axios from "axios";
// // import Cookies from "js-cookie";
// // import { useStateContext } from "../contexts/ContextProvider";
// // const authToken = Cookies.get("token");

// // const StudentApexChart = () => {
// //     const { currentColor } = useStateContext();

// //   const [loading, setLoading] = useState(true);
// //   const [series, setSeries] = useState([]);
// //   const [options, setOptions] = useState({
// //     chart: {
// //       width: 280,
// //       type: "pie",
// //     },
// //     labels: ["Boys", "Girls"],
// //     responsive: [
// //       {
// //         breakpoint: 480,
// //         options: {
// //           chart: {
// //             width: 400,
// //           },
// //           legend: {
// //             position: "bottom",
// //           },
// //         },
// //       },
// //     ],
// //   });

// //   const student = JSON.parse(sessionStorage.response);
// //   const classTeacherClass = student.classTeacher;
// //   const classTeacherSection = student.section;

// //   useEffect(() => {
// //     const fetchData = async () => {
// //       try {
// //         const response = await axios.get(
// //           "https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents",
// //           {
// //             withCredentials: true,
// //             headers: {
// //               Authorization: `Bearer ${authToken}`,
// //             },
// //           }
// //         );

// //         if (Array.isArray(response.data.allStudent)) {
// //           const filteredStudents = response.data.allStudent.filter(
// //             (student) =>
// //               student.class === classTeacherClass &&
// //               student.section === classTeacherSection
// //           );
// //           localStorage.setItem('studentsData', JSON.stringify(filteredStudents));
// //           const boysCount = filteredStudents.filter(
// //             (student) => student.gender === "MALE"
// //           ).length;
// //           const girlsCount = filteredStudents.length - boysCount;
        
// //           setSeries([boysCount, girlsCount]);
// //           setLoading(false);
// //         } else {
// //           console.error("Data format is not as expected:", response.data);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching student data:", error);
// //       }
// //     };

// //     fetchData();
// //   }, []);

// //   return (
// //     <div id="chart" className="dark:text-white dark:bg-secondary-dark-bg">
// //       {loading ? (
// //         <div>Loading...</div>
// //       ) : (
// //         <>
// //           <h1 className=" dark:text-white dark:bg-secondary-dark-bg font-bold"
// //           style={{
// //             color:currentColor
// //           }}
// //           >
// //             All Student : {series[1] + series[0]}{" "}
// //           </h1>
// //           <ReactApexChart
// //             options={options}
// //             series={series}
// //             type="pie"
// //             width={220}
// //           />
// //         </>
// //       )}
// //     </div>
// //   );
// // };

// // export default StudentApexChart;
