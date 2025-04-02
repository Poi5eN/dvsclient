import React from 'react'

const AttendenceCart = () => {
  return (
    <div>AttendenceCart</div>
  )
}

export default AttendenceCart


// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import ReactApexChart from "react-apexcharts";
// import { useStateContext } from "../../contexts/ContextProvider";

// const AttendanceCart = () => {
//     const { currentColor } = useStateContext();
//     const [series, setSeries] = useState([]); // Renamed to series
//     const [loading, setLoading] = useState(true);
//     const [options, setOptions] = useState({
//         chart: {
//             type: "pie",
//             width: "100%",
//         },
//         labels: ["Present", "Absent"],
//         colors: ["#00E396", "#FF4560"],
//         responsive: [
//             {
//                 breakpoint: 480,
//                 options: {
//                     chart: {
//                         width: 300, // Adjusted width for mobile
//                     },
//                     legend: {
//                         position: "bottom",
//                     },
//                 },
//             },
//         ],
//     });

//     const fetchData = async () => {
//         setLoading(true);
//         const authToken = Cookies.get("token");
//         const date = new Date(); // Current date
//         const selectedDate = new Date(date);
//         const year = selectedDate.getFullYear();
//         const month = selectedDate.getMonth() + 1;

//         try {
//             const response = await axios.get(
//                 "https://eserver-i5sm.onrender.com/api/v1/teacher/getAttendance",
//                 {
//                     params: {
//                         year: year,
//                         month: month,
//                     },
//                     withCredentials: true,
//                     headers: {
//                         Authorization: `Bearer ${authToken}`,
//                     },
//                 }
//             );

//             if (response.data && response.data.data) {
//                 const fetchedData = response.data.data;
//                 let present = 0;
//                 let absent = 0;

//                 fetchedData.forEach((student) => {
//                   if (student.attendanceData && student.attendanceData.length > 0) {
//                         const isPresent = student.attendanceData[0]?.present === true;
//                       if (isPresent) {
//                           present += 1;
//                       } else {
//                           absent += 1;
//                       }
//                    }
//                 });
//                 setSeries([present, absent]);
//             } else {
//                 console.log("No attendance data found in the response.");
//             }
//         } catch (error) {
//             console.error("Error while fetching attendance data:", error);
//         } finally {
//           setLoading(false);
//         }
//     };

//     useEffect(() => {
//         fetchData();
//     }, []);

//     return (
//         <div className="dark:text-white dark:bg-secondary-dark-bg  rounded-md ">
//           {loading ? (
//             <div className="text-center py-6">Loading...</div>
//           ) : (
//             <>
//               <h1
//                 className="font-bold mb-2 text-center md:text-left ml-2"
//                 style={{ color: currentColor }}
//               >
//                 Attendance
//               </h1>
//              <div className='flex justify-center'>
//                  <ReactApexChart
//                   options={options}
//                    series={series}
//                     type="pie"
//                      width={'90%'}
//                  />
//             </div>
//            </>
//           )}
//         </div>
//     );
// };

// export default AttendanceCart;


// // import axios from 'axios';
// // import React, { useEffect, useState } from 'react';
// // import Cookies from "js-cookie";
// // import ReactApexChart from 'react-apexcharts';
// // import { useStateContext } from '../../contexts/ContextProvider';
// // const AttendanceCart = () => {
// //     const { currentColor } = useStateContext();
// //     const [presetion, setPresetion] = useState([])
// //     const [options, setOptions] = useState({
// //         chart: {
// //             type: "pie",
// //         },
// //         labels: ["Present", "Absent"],
// //         colors: ["#00E396", "#FF4560"],
// //         responsive: [
// //             {
// //                 breakpoint: 480,
// //                 options: {
// //                     chart: {
// //                         width: 400,
// //                     },
// //                     legend: {
// //                         position: "bottom",
// //                     },
// //                 },
// //             },
// //         ],
// //     });
// //     console.log("presetion", presetion)
// //     const fetchData = async () => {
// //         const authToken = Cookies.get("token");
// //         const date = new Date(); // Replace this with the actual date if it's dynamic
// //         const selectedDate = new Date(date);
// //         const year = selectedDate.getFullYear();
// //         const month = selectedDate.getMonth() + 1;

// //         try {
// //             const response = await axios.get(
// //                 "https://eserver-i5sm.onrender.com/api/v1/teacher/getAttendance",
// //                 {
// //                     params: {
// //                         year: year,
// //                         month: month,
// //                     },
// //                     withCredentials: true,
// //                     headers: {
// //                         Authorization: `Bearer ${authToken}`,
// //                     },
// //                 }
// //             );

// //             if (response.data && response.data.data) {
// //                 const fetchedData = response.data.data;
// //                 let present = 0;
// //                 let absent = 0;

// //                 fetchedData.forEach((student) => {
// //                     const isPresent = student.attendanceData[0]?.present === true;

// //                     if (isPresent) {
// //                         present += 1;
// //                     } else {
// //                         absent += 1;
// //                     }
// //                 });
// //                 setPresetion([present, absent])
                
// //             } else {
// //                 console.log("No attendance data found in the response.");
// //             }
// //         } catch (error) {
// //             console.error("Error while fetching attendance data:", error);
// //         }
// //     };

// //     useEffect(() => {
// //         fetchData();
// //     }, []);

// //     return (
// //         <div>
// //             <h1 className=" dark:text-white dark:bg-secondary-dark-bg font-bold"
// //                 style={{
// //                     color: currentColor
// //                 }}
// //             >
// //                 Attendance
// //             </h1>
// //             <ReactApexChart
// //                 options={options}
// //                 series={presetion}
// //                 type="pie"
// //                 width={220}
// //             />
// //         </div>
// //     );
// // };

// // export default AttendanceCart;
