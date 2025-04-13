import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css"; // Ensure this path is correct
import { useStateContext } from "../contexts/ContextProvider"; // Ensure path is correct
import { toast } from "react-toastify";
import Modal from "../Dynamic/Modal"; // Ensure path is correct
import Button from "../Dynamic/utils/Button"; // Ensure path is correct
import { getAllStudents } from "../Network/TeacherApi"; // Ensure path is correct
import moment from "moment";
import { createAttendance } from "../Network/ThirdPartyApi";

// Helper function to get formatted date YYYY-MM
function getFormattedDate(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

// Helper function to get days in a month
function getDaysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

const Attendance = () => {
  const authToken = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const session =JSON.parse(localStorage.getItem("session"))
  // const [loading, setLoading] = useState(false);
  const { currentColor, setIsLoader } = useStateContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(getFormattedDate(new Date()));
  const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(new Date()));
  const [currentDate, setCurrentDate] = useState("");
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [studentTotalPresents, setStudentTotalPresents] = useState({});
  const [dataAvailable, setDataAvailable] = useState(false);
  const [hoverMessage, setHoverMessage] = useState("");

  // --- Fetch Students ---
  useEffect(() => {
    const fetchInitialStudents = async () => {
      if (!user?.classTeacher || !user?.section) {
        console.warn("User classTeacher or section not found in localStorage.");
        setStudents([]);
        return;
      }

      setIsLoader(true);
      const params = {
        class: user.classTeacher,
        section: user.section,
      };

      try {
        const response = await getAllStudents(params);
        // Use optional chaining and check if data exists and is an array
        if (response?.success && Array.isArray(response?.students?.data)) {
           // Ensure studentId exists before adding to state
          const studentsWithAttendance = response.students.data
            .filter(student => student.studentId) // Filter out students without studentId
            .map((student) => ({
              ...student,
              attendance: false, // Initialize attendance state for modal checkbox
            }))
            // Reversing might not be necessary unless you specifically want newest students first
            // .reverse();
          setStudents(studentsWithAttendance);
        } else {
          toast.error(response?.message || "Failed to fetch students or no student data found.");
          setStudents([]);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("An error occurred while fetching students.");
        setStudents([]);
      } finally {
        setIsLoader(false);
      }
    };

    fetchInitialStudents();
     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setIsLoader, user?.classTeacher, user?.section]); // Dependencies remain the same

   // --- Fetch Attendance Data for the Selected Month ---
   const fetchDataForMonth = useCallback(async () => {
    if (!authToken) {
      console.error("Auth token not found for fetching attendance.");
      toast.error("Authentication error. Please log in again.");
      setDataAvailable(false);
      setStudentAttendance([]);
      setStudentTotalPresents({});
      return;
    }

    const selectedMonthDate = new Date(date + "-01T00:00:00");
    if (isNaN(selectedMonthDate.getTime())) {
      console.error("Invalid date selected:", date);
      toast.error("Invalid month selected.");
      setDataAvailable(false);
      setStudentAttendance([]);
      setStudentTotalPresents({});
      return;
    }

    const year = selectedMonthDate.getFullYear();
    const month = selectedMonthDate.getMonth() + 1;

    try {
      const response = await axios.get(
        "https://dvsserver.onrender.com/api/v1/teacher/getAttendance",
        {
          params: { year, month },
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data?.success && Array.isArray(response.data?.data)) {
        const attendanceData = response.data.data;
        setStudentAttendance(attendanceData);

        if (attendanceData.length > 0) {
          const totals = {};
          attendanceData.forEach((studentData) => {
            // Ensure studentId exists on the attendance record
            if (studentData.studentId && Array.isArray(studentData.attendanceData)) {
              const total = studentData.attendanceData.reduce(
                (sum, record) => sum + (record.present ? 1 : 0),
                0
              );
              totals[studentData.studentId] = total; // Use studentId as key
            } else {
               if(studentData.studentId) totals[studentData.studentId] = 0; // Initialize if array missing
            }
          });
          setStudentTotalPresents(totals);
          setDataAvailable(true);
        } else {
          setStudentAttendance([]);
          setStudentTotalPresents({});
          setDataAvailable(false);
        }
      } else {
        setStudentAttendance([]);
        setStudentTotalPresents({});
        setDataAvailable(false);
      }
    } catch (error) {
      console.error("Error while fetching attendance data:", error);
       if (error.response?.status === 404) {
            // Handle 404 gracefully - means no records for the month
            setStudentAttendance([]);
            setStudentTotalPresents({});
            setDataAvailable(false);
            // Optionally toast.info("No attendance records found for this month.");
        }
      else if (error.response) {
        toast.error(`Error fetching attendance: ${error.response.data?.message || error.response.statusText}`);
      } else if (error.request) {
        toast.error("Network error: Could not reach server to fetch attendance.");
      } else {
        toast.error("An error occurred while preparing to fetch attendance.");
      }
      // Ensure state is reset on error too
      setStudentAttendance([]);
      setStudentTotalPresents({});
      setDataAvailable(false);
    }
  }, [date, authToken]); // Dependencies for useCallback

  // Effect to call the memoized fetch function when dependencies change
  useEffect(() => {
    fetchDataForMonth();
  }, [fetchDataForMonth]);


  // --- Update Days in Month Display when Selected Month (date state) Changes ---
  useEffect(() => {
    const selectedMonthDate = new Date(date + "-01T00:00:00");
     if (!isNaN(selectedMonthDate.getTime())) {
         setDaysInMonth(getDaysInMonth(selectedMonthDate));
     } else {
         setDaysInMonth(30); // Default or handle error
     }
  }, [date]);

  // --- Set Current Date String for Modal Title (runs once on mount) ---
  useEffect(() => {
    setCurrentDate(moment(new Date()).format("DD-MMM-YYYY"));
  }, []);

  // --- Toggle Attendance State for a Single Student in Modal ---
  const toggleAttendance = (studentIdToToggle) => { // Use the correct identifier
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        // *** CHANGE: Compare using student.studentId ***
        student.studentId === studentIdToToggle
          ? { ...student, attendance: !student.attendance }
          : student
      )
    );
  };

  // --- Handle Submission of Today's Attendance from Modal ---
  // const handleSubmit = async () => {
  //   if (!authToken) {
  //      toast.error("Authentication error. Cannot submit attendance.");
  //      return;
  //   }
  //    if (students.length === 0) {
  //       toast.warn("No students loaded to submit attendance for.");
  //       return;
  //   }

  //   setLoading(true);

  //   const today = new Date();
  //   const formattedDate = moment(today).format("YYYY-MM-DD");

  //   const studentInfo = students.map((student) => ({
  //     // *** CHANGE: Use student.studentId ***
  //     studentId: student.studentId,
  //     rollNo: student.rollNo,
  //     present: student.attendance,
  //     date: formattedDate,
  //     className: student.class || user?.classTeacher, // Use 'class' if available on student, else fallback
  //     section: student.section || user?.section,
  //   }));

  //   if (!studentInfo.length || !studentInfo[0].className || !studentInfo[0].section) {
  //       toast.error("Cannot submit attendance. Class or Section information is missing.");
  //       setLoading(false);
  //       return;
  //   }


  //   try {
  //     const response = await axios.post(
  //       "https://dvsserver.onrender.com/api/v1/teacher/createAttendance",
  //       { attendanceRecords: studentInfo },
  //       {
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );

  //     if (response.data?.success) {
  //       toast.success("Attendance marked successfully!");
  //       setStudents((prevStudents) =>
  //         prevStudents.map((student) => ({
  //           ...student,
  //           attendance: false, // Reset checkboxes
  //         }))
  //       );
  //       setModalOpen(false);

  //       const currentMonthFormatted = getFormattedDate(new Date());
  //       if (date === currentMonthFormatted) {
  //           fetchDataForMonth();
  //       } else {
  //            toast.info("Attendance submitted. View the current month to see today's record.");
  //       }
  //     } else {
  //        toast.error(response.data?.message || "Failed to submit attendance. Please try again.");
  //     }

  //   } catch (error) {
  //     console.error("Error sending attendance data:", error);
  //     if (error.response?.data?.message) {
  //       toast.error(`Submission failed: ${error.response.data.message}`);
  //     } else if (error.response?.status === 401) {
  //         toast.error("Authentication failed. Please log in again.");
  //     } else {
  //       toast.error("A network or server error occurred while submitting attendance.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleSubmit = async () => {

    setIsLoader(true)
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const studentInfo = {
      attendanceRecords:students.map((student) => ({
      session:session,
      studentId: student.studentId,
      rollNo: student.rollNo,
      present: student.attendance,
      date: formattedDate,
      className: student.className,
      section: student.section,
    }))}

    try {
      const response=await createAttendance(studentInfo)
      if(response?.success){
        toast.success(response?.message)
        setStudents((prevStudents) =>
          prevStudents.map((student) => ({
            ...student,
            attendance: false,
          })))
          // fetchData()
          setIsLoader(false)
          setModalOpen(false)
      }
      else{
        setIsLoader(false)
        toast.error(response?.message)
      }
      // let response = await axios.post(
      //   "https://dvsserver.onrender.com/api/v1/teacher/createAttendance",
      //   {
      //     attendanceRecords: studentInfo,
      //   },
      //   {
      //     withCredentials: true,
      //     headers: {
      //       Authorization: `Bearer ${authToken}`,
      //     },
      //   }
      // ).then((response) => {
      //   setStudents((prevStudents) =>
      //     prevStudents.map((student) => ({
      //       ...student,
      //       attendance: false,
      //     }))
      //   )
      //   if (response) {
      //     fetchData()
      //     setIsLoader(false)
      //     setModalOpen(false)
      //   }

      // }).catch((error) => {
      //   fetchData();

      //   setIsLoader(false);
      //   toast.error(error.response.data.message)
      // })

    } catch (error) {
      console.error("Error sending attendance data:", error);
      setIsLoader(false);
    }
  };
  // --- Prepare Date Labels (Day numbers) for Monthly Grid Header ---
  const dateLabels = Array.from({ length: daysInMonth }, (_, dayIndex) => {
    return (dayIndex + 1).toString().padStart(2, "0");
  });

   // --- Prepare Student Rows for the Monthly Attendance Grid ---
   const studentRows = React.useMemo(() => students.map((student, index) => {
    const studentMonthData = studentAttendance.find(
      // *** CHANGE: Find using student.studentId ***
      (data) => data.studentId === student.studentId
    );

    return (
      // *** CHANGE: Use student.studentId for key ***
      <tr key={student.studentId} className="hover:bg-gray-50">
        <td className="px-2 py-1 border text-center">{index + 1}</td>
        <td className="px-2 py-1 border whitespace-nowrap sticky left-0 bg-white hover:bg-gray-50 z-10 min-w-[150px]">
            {student.studentName}
        </td>
        {dateLabels.map((dayLabel) => {
          let cellContent = null;
          let cellDateStr = "";

          if (studentMonthData && Array.isArray(studentMonthData.attendanceData)) {
            const recordForDay = studentMonthData.attendanceData.find(
              (record) => {
                 try {
                    // Ensure record.date exists before trying to format
                    if (record.date) {
                        const recordDay = moment(record.date).format('DD');
                        return recordDay === dayLabel;
                    }
                    return false;
                 } catch (e) {
                     console.warn("Could not parse date from record:", record.date, e);
                     return false;
                 }
              }
            );

            if (recordForDay) {
              try {
                cellDateStr = recordForDay.date ? moment(recordForDay.date).format('DD-MM-YYYY') : "Invalid Date";
              } catch (e) {
                 cellDateStr = "Invalid Date";
                 console.warn("Could not format date for display:", recordForDay.date, e);
              }
              cellContent = (
                <span
                  className={recordForDay.present ? "text-green-600" : "text-red-600"}
                  onMouseEnter={() => handleMouseEnter(student.studentName, cellDateStr)}
                  onMouseLeave={handleMouseLeave}
                  style={{ cursor: 'help' }}
                >
                  {recordForDay.present ? "✅" : "❌"}
                </span>
              );
            }
          }
          // *** CHANGE: Use student.studentId in key ***
          return (
            <td key={`${student.studentId}-${dayLabel}`} className="px-2 py-1 border text-center">
              {cellContent ?? '-'} {/* Show '-' if no record */}
            </td>
          );
        })}
        <td className="px-2 py-1 border text-center font-semibold">
          {/* *** CHANGE: Access total using student.studentId *** */}
          {studentTotalPresents[student.studentId] ?? 0}
        </td>
      </tr>
    );
  // Dependencies for useMemo
  }), [students, studentAttendance, dateLabels, studentTotalPresents /* hover handlers are stable */]);


  // --- Hover Handlers for Grid Cells ---
  const handleMouseEnter = (studentName, formattedDate) => {
    const message = `Student: ${studentName}, Date: ${formattedDate}`;
    setHoverMessage(message);
  };

  const handleMouseLeave = () => {
    setHoverMessage("");
  };

  // --- Render the Component UI ---
  return (
    <div className="m-2 md:m-5 mt-5 p-2 md:p-5 bg-white rounded-3xl shadow-lg">
      <h5
        className="text-xl font-bold mb-6 uppercase text-center tracking-wide"
        style={{ color: currentColor }}
      >
        Student Attendance Management
      </h5>

       <div className="mb-6 flex justify-start">
         <Button
            name="Mark Today's Attendance"
            onClick={() => setModalOpen(true)}
            // bgColor={currentColor}
            color="green"
            borderRadius="10px"
            size="md"
            // disabled={students.length === 0}
         />
       </div>

      {/* --- Attendance Marking Modal --- */}
      <Modal
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        title={`Mark Attendance for ${currentDate}`}
        widthClass="max-w-2xl"
      >
        <div className="p-5">
          {students.length > 0 ? (
            <>
              <div className="max-h-[60vh] overflow-y-auto mb-5 border rounded-md">
                <table className="w-full border-collapse text-sm">
                  <thead className="sticky top-0 bg-gray-100 z-10">
                    <tr className="border-b">
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">S.No.</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">Student Name</th>
                      <th className="py-2 px-3 text-left font-semibold text-gray-600">Roll No.</th>
                      <th className="py-2 px-3 text-center font-semibold text-gray-600">Present</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                     {students.map((student, ind) => (
                        // *** CHANGE: Use student.studentId for key ***
                        <tr key={student.studentId} className="border-b hover:bg-gray-50 transition-colors duration-150">
                            <td className="py-2 px-3 text-gray-700">{ind + 1}</td>
                            <td className="py-2 px-3 text-gray-700">{student.studentName}</td>
                            <td className="py-2 px-3 text-gray-700">{student.rollNo}</td>
                            <td className="py-2 px-3 text-center">
                            <input
                                type="checkbox"
                                checked={student.attendance}
                                // *** CHANGE: Pass student.studentId to toggle function ***
                                onChange={() => toggleAttendance(student.studentId)}
                                className="form-checkbox h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer transition duration-150 ease-in-out"
                                aria-label={`Mark ${student.studentName} as present`}
                            />
                            </td>
                        </tr>
                        ))}
                  </tbody>
                </table>
              </div>
               <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
                 <Button
                    name="Cancel"
                    onClick={() => setModalOpen(false)}
                    // bgColor="bg-gray-400" // Use explicit color class
                    color="gray"
                    borderRadius="8px"
                 />
                 <Button
                    // loading={loading}
                    name="Submit Attendance"
                    onClick={handleSubmit}
                    // bgColor={currentColor}
                    color="green"
                    borderRadius="8px"
                 />
              </div>
            </>
          ) : (
            <p className="text-center text-gray-500 py-10">
              No students found for your assigned class/section, or still loading.
            </p>
          )}
        </div>
      </Modal>

      {/* --- Monthly Attendance Grid Section --- */}
      <div className="mt-8 border-t pt-6">
        <h6 className="text-lg font-semibold mb-4" style={{ color: currentColor }}>
          Monthly Attendance Overview
        </h6>
        <div className="flex flex-wrap items-center gap-4 mb-5 p-3 bg-gray-50 rounded-md">
          <label htmlFor="month-picker" className="font-medium text-gray-700">Select Month:</label>
          <input
            id="month-picker"
            type="month"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded p-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-cyan-500 shadow-sm"
          />
           {hoverMessage && (
            <div className="text-sm p-2 bg-blue-50 border border-blue-200 rounded shadow-sm ml-auto">
                <p className="font-mono text-blue-800">{hoverMessage}</p>
            </div>
            )}
        </div>

        <div className="overflow-x-auto w-full shadow-md rounded-lg border border-gray-200">
           {students.length > 0 ? (
            dataAvailable ? (
              <table className="w-full table-auto border-collapse text-xs md:text-sm">
                <thead>
                  <tr className="bg-gray-200 text-gray-600 uppercase text-xs tracking-wider">
                    <th className="px-2 py-2 border border-gray-300 text-center">S.N</th>
                    <th className="px-2 py-2 border border-gray-300 text-left sticky left-0 bg-gray-200 z-20 min-w-[150px]">Student</th>
                    {dateLabels.map((dateLabel) => (
                      <th key={`header-${dateLabel}`} className="px-2 py-2 border border-gray-300 text-center min-w-[40px]">
                        {dateLabel}
                      </th>
                    ))}
                    <th className="px-2 py-2 border border-gray-300 text-center min-w-[60px]">Total P</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                    {studentRows} {/* Render the memoized rows */}
                </tbody>
              </table>
            ) : (
               <p className="text-center py-6 text-gray-500">
                 No attendance records found for {moment(date + '-01T00:00:00').isValid() ? moment(date + '-01T00:00:00').format("MMMM YYYY") : "the selected month"}.
               </p>
            )
          ) : (
            <p className="text-center py-6 text-gray-500">Loading student list or no students assigned...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Attendance;


// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import "tailwindcss/tailwind.css";
// import { useStateContext } from "../contexts/ContextProvider";
// import { toast } from "react-toastify";
// import Modal from "../Dynamic/Modal";
// import Button from "../Dynamic/utils/Button";
// import { getAllStudents } from "../Network/TeacherApi";
// import moment from "moment/moment";

// const Attendance = () => {
//   const authToken = localStorage.getItem("token");
//   const [loading, setLoading] = useState(false);
//   const { currentColor,setIsLoader  } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [students, setStudents] = useState([]);
//   const [date, setDate] = useState(getFormattedDate(new Date()));
//   const [isEditing, setIsEditing] = useState(true);
//   const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(new Date()));
//   const [currentDate, setCurrentDate] = useState("");
//   const [studentAttendance, setStudentAttendance] = useState([]);
//   const [studentTotalPresents, setStudentTotalPresents] = useState([]);
//   const [dataAvailable, setDataAvailable] = useState(false);
//   const [hoverMessage, setHoverMessage] = useState(""); // State to store the hover message
//   const isFirstRender = useRef(true);
//   useEffect(() => {
//     if (isFirstRender.current) {
//       if (studentTotalPresents) {
//         setStudentTotalPresents(
//           Array(students.length).fill(studentTotalPresents)
//         );
//       } else {
//         setStudentTotalPresents(Array(students.length).fill(0));
//       }
//       isFirstRender.current = false;
//     }
//   }, []);

//  const user = JSON.parse(localStorage.getItem("user"));
//      const param = {
//             class: user?.classTeacher,
//             section: user?.section
//         }
//         const allStudent = async () => {
//             setIsLoader(true)
//             try {
//                 const response = await getAllStudents(param);
    
//                 if (response?.success) {
//                     setIsLoader(false)
//                     setStudents(response?.students?.data?.reverse());
//                 } else {
//                     toast.error(response?.message);
    
//                 }
//             } catch (error) {
//                 console.log("error", error);
    
//             }
//             finally {
//                 setIsLoader(false)
//             }
//         };
//           useEffect(() => {
//             allStudent();
//         }, []);
//         const toggleAttendance = (studentId) => {
//           setStudents((prevStudents) =>
//             prevStudents.map((student) =>
//               student.id === studentId
//                 ? { ...student, attendance: !student.attendance } // Sirf selected student ka attendance change hoga
//                 : student
//             )
//           );
//         };
        

//   // const toggleAttendance = (studentId) => {
//   //   setStudents((prevStudents) =>
//   //     prevStudents.map((student) =>
//   //       student.id === studentId
//   //         ? { ...student, attendance: !student.attendance }
//   //         : student
//   //     )
//   //   );
//   // };

//   useEffect(() => {
//     setDataAvailable(true);
//     fetchData();
//   }, [date]);

//   const fetchData = async () => {
//     const selectedDate = new Date(date);
//     const year = selectedDate.getFullYear();
//     const month = selectedDate.getMonth() + 1;
//     try {
//       const response = await axios.get(
//         "https://dvsserver.onrender.com/api/v1/teacher/getAttendance",
//         {
//           params: {
//             year: year,
//             month: month,
//           },
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       );

//       if (response.data && response.data.data) {
//         const attendanceData = response.data.data;
//         if (attendanceData.length > 0) {
//           // console.log(attendanceData);
//           const updatedStudentTotalPresents = attendanceData.map(
//             (studentData) => {
//               const studentId = studentData.studentId;
//               const totalAttendance = studentData.attendanceData.reduce(
//                 (total, data) => total + data.present,
//                 0
//               );
             
//               return totalAttendance;
//             }
//           );
//           setStudentAttendance(attendanceData);
//           setStudentTotalPresents(updatedStudentTotalPresents);
//         } else {
//           console.log("No student attendance data found in the response.");
//           setDataAvailable(false);
//         }
//       } else {
//         console.log("No attendance data found in the response.");
//         setDataAvailable(false); 
//       }

//     } catch (error) {
//       console.error("Error while fetching attendance data:", error);
//       setDataAvailable(false); 
//     }
//   };

//   useEffect(() => {
//     setDaysInMonth(getDaysInMonth(new Date(date)));
//   }, [date]);
//   const handleSubmit = async () => {

//     setLoading(true)
//     const today = new Date();
//     const year = today.getFullYear();
//     const month = (today.getMonth() + 1).toString().padStart(2, "0");
//     const day = today.getDate().toString().padStart(2, "0");
//     const formattedDate = `${year}-${month}-${day}`;
//     const studentInfo = students.map((student) => ({
//       studentId: student.id,
//       rollNo: student.rollNo,
//       present: student.attendance,
//       date: formattedDate,
//       className: student.className,
//       section: student.section,
//     }));

//     try {
//       let response = await axios.post(
//         "https://dvsserver.onrender.com/api/v1/teacher/createAttendance",
//         {
//           attendanceRecords: studentInfo,
//         },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       ).then((response) => {
//         setStudents((prevStudents) =>
//           prevStudents.map((student) => ({
//             ...student,
//             attendance: false,
//           }))
//         )
//         if (response) {
//           fetchData()
//           setLoading(false)
//           setModalOpen(false)
//         }

//       }).catch((error) => {
//         fetchData();

//         setLoading(false);
//         toast.error(error.response.data.message)
//       })

//     } catch (error) {
//       console.error("Error sending attendance data:", error);

//     }
//   };
//   useEffect(() => {
//     fetchData();
//   }, []);
 
//   function getFormattedDate(date) {
//     const year = date.getFullYear();
//     const month = (date.getMonth() + 1).toString().padStart(2, "0");
//     return `${year}-${month}`;
//   }

//   function getDaysInMonth(date) {
//     return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
//   }

//   useEffect(() => {
//     setCurrentDate(moment(new Date()).format("DD-MMM-YYYY"));
//   }, []);

//   const dateLabels = Array.from({ length: daysInMonth }, (_, day) => {
//     const date = new Date(new Date().setDate(day + 1));
//     const formattedDate = date.getDate().toString().padStart(2, "0");
//     return formattedDate;
//   });

//   const studentRows = students.map((student, index) => {
//     return (
//       <tr key={student.id}>
//         <td className="px-2 py-1 border">{index + 1}</td>
//         <td className="px-2 py-1 border whitespace-nowrap">{student.studentName}</td>
//         {/* Issue */}
//         {dateLabels.map((dateLabel, dateIndex) => {
//           const attendanceData = studentAttendance.find(
//             (data) => data.studentId === student.id
//           );

//           const formattedResponseDate = (responseDate) => {
//             const dateObject = new Date(responseDate);
//             const day = dateObject.getDate(); 
//             return day.toString().padStart(2, "0");
//           };

//           const cellContent = () => {
//             if (attendanceData) {
//               const matchingDateData = attendanceData.attendanceData.find(
//                 (data) =>
//                   formattedResponseDate(data.date) === dateLabel.toString()
//               );

//               if (matchingDateData) {
//                 const inputDate = new Date(matchingDateData.date);
//                 const year = inputDate.getFullYear();
//                 const month = (inputDate.getMonth() + 1)
//                   .toString()
//                   .padStart(2, "0");
//                 const day = inputDate.getDate().toString().padStart(2, "0");
//                 const formatDate = `${day}-${month}-${year}`;

//                 return (
//                   <td
//                     key={dateIndex}
//                     className="px-2 py-1  border text-center"
//                     onMouseEnter={() =>
//                       handleMouseEnter(student.name, formatDate, dateLabel)
//                     }
//                   >
//                     <span
//                       className={
//                         matchingDateData.present
//                           ? "text-green-600" 
//                           : "text-red-600"
//                       }
//                     >
//                       {matchingDateData.present ? "✅" : "❌"}
//                     </span>
//                   </td>
//                 );
//               } else {
//                 return (
//                   <td key={dateIndex} className="px-2 py-1 border text-center">

//                   </td>
//                 ); // Render an empty cell if no data is available for the specific date label
//               }
//             }
//           };

//           return cellContent();
//         })}
//         <td className="px-2 py-1 border">{studentTotalPresents[index]}</td>{" "}
//         {/* Issue */}
//       </tr>
//     );
//   });

//   const handleMouseEnter = (studentName, date, dateLabel) => {
//     const message = `Student Name: ${studentName}, Date: ${date} `;
//     setHoverMessage(message); // Update the state with the message
//     document.body.style.cursor = "pointer";
//   };

//   const handleMouseLeave = () => {
//     setHoverMessage("");
//   };

//   return (
//     <div className="px-5 ">
//       <h5 className="text-xl font-bold mb-4 uppercase text-center  hover-text"
//         style={{ color: currentColor }}
//       >
//         Student Attendance
//       </h5>

//       <Button name="Mark Attendance" onClick={() => setModalOpen(true)} />
//       <Modal
//         isOpen={modalOpen}
//         setIsOpen={setModalOpen}
//         title={`Mark Attendance for ${currentDate}`}
//       >
//         <div className="bg-gray-50 p-2">

//           <table className="w-full border-collapse">
//             <thead>
//               <tr className="border-b">
//                 <th className="py-1 px-4 text-left">S No.</th>
//                 <th className="py-1 px-4 text-left">Student</th>
//                 <th className="py-1 px-4 text-left">Roll No.</th>
//                 <th className="py-1 px-4 text-left">Present</th>
//               </tr>
//             </thead>
//             <tbody>
//               {students.map((student,ind) => (
//                 <tr key={student.id} className="border-b">

//                   <td className="py-1 px-4 ">{ind+1}</td>
//                   <td className="py-1 px-4">{student.studentName}</td>
//                   <td className="py-1 px-4">{student.rollNo}</td>
//                   <td className="py-1 px-4">
//                     <input
//                       type="checkbox"
//                       checked={student.attendance}
//                       onChange={() => toggleAttendance(student.id)}
//                       className="form-checkbox h-5 w-5 text-blue-500"
//                     />
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//           <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
//             <Button loading={loading} name="Submit" onClick={handleSubmit} width="full" />
//             <Button name="Cancel" onClick={() => setModalOpen(false)}  width="full" />
//           </div>
//         </div>
//       </Modal>

//       <div className="grid mx-auto mt-1 overflow-hidden">
//         <div className="mb-4">
//           <label className="mr-2">Month:</label>
//           <input
//             type="month"
//             value={date}
//             onChange={(e) => setDate(e.target.value)}
//             disabled={!isEditing}
//             className="rounded p-2 border border-gray-300"
//           />
//           {hoverMessage && (
//             <div className="mt-4">
//               <p>{hoverMessage}</p>
//             </div>
//           )}
//         </div>
//         <div className="overflow-x-auto w-full flex justify-center">
//           <div
//             className="w-full overflow-scroll"
//             onMouseLeave={handleMouseLeave}
//           >
//             {dataAvailable ? (
//               <table className="table-auto">
//                 <thead>
//                   <tr className="bg-cyan-700 text-white">
//                     <th className="px-2 py-1  border ">S.N</th>
//                     <th className="px-2 py-1  border ">Student</th>
//                     {dateLabels.map((dateLabel, dateIndex) => (
//                       <th key={dateIndex} className="px-2 py-1  border ">
//                         {dateLabel}
//                       </th>
//                     ))}
//                     <th className="px-2 py-1  border ">Presents</th>
//                   </tr>
//                 </thead>
//                 <tbody>{studentRows}</tbody>
//               </table>
//             ) : (
//               <h1>No Records found for the {date}.</h1>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Attendance;

