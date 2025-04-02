import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "tailwindcss/tailwind.css";
import { useStateContext } from "../contexts/ContextProvider";
import { toast } from "react-toastify";
import Modal from "../Dynamic/Modal";
import Button from "../Dynamic/utils/Button";
import { getAllStudents } from "../Network/TeacherApi";
import moment from "moment/moment";

const Attendance = () => {
  const authToken = localStorage.getItem("token");
  const [loading, setLoading] = useState(false);
  const { currentColor,setIsLoader  } = useStateContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(getFormattedDate(new Date()));
  const [isEditing, setIsEditing] = useState(true);
  const [daysInMonth, setDaysInMonth] = useState(getDaysInMonth(new Date()));
  const [currentDate, setCurrentDate] = useState("");
  const [studentAttendance, setStudentAttendance] = useState([]);
  const [studentTotalPresents, setStudentTotalPresents] = useState([]);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [hoverMessage, setHoverMessage] = useState(""); // State to store the hover message
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      if (studentTotalPresents) {
        setStudentTotalPresents(
          Array(students.length).fill(studentTotalPresents)
        );
      } else {
        setStudentTotalPresents(Array(students.length).fill(0));
      }
      isFirstRender.current = false;
    }
  }, []);

 const user = JSON.parse(localStorage.getItem("user"));
     const param = {
            class: user?.classTeacher,
            section: user?.section
        }
        const allStudent = async () => {
            setIsLoader(true)
            try {
                const response = await getAllStudents(param);
    
                if (response?.success) {
                    setIsLoader(false)
                    setStudents(response?.students?.data?.reverse());
                } else {
                    toast.error(response?.message);
    
                }
            } catch (error) {
                console.log("error", error);
    
            }
            finally {
                setIsLoader(false)
            }
        };
          useEffect(() => {
            allStudent();
        }, []);
        const toggleAttendance = (studentId) => {
          setStudents((prevStudents) =>
            prevStudents.map((student) =>
              student.id === studentId
                ? { ...student, attendance: !student.attendance } // Sirf selected student ka attendance change hoga
                : student
            )
          );
        };
        

  // const toggleAttendance = (studentId) => {
  //   setStudents((prevStudents) =>
  //     prevStudents.map((student) =>
  //       student.id === studentId
  //         ? { ...student, attendance: !student.attendance }
  //         : student
  //     )
  //   );
  // };

  useEffect(() => {
    setDataAvailable(true);
    fetchData();
  }, [date]);

  const fetchData = async () => {
    const selectedDate = new Date(date);
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth() + 1;
    try {
      const response = await axios.get(
        "https://dvsserver.onrender.com/api/v1/teacher/getAttendance",
        {
          params: {
            year: year,
            month: month,
          },
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (response.data && response.data.data) {
        const attendanceData = response.data.data;
        if (attendanceData.length > 0) {
          // console.log(attendanceData);
          const updatedStudentTotalPresents = attendanceData.map(
            (studentData) => {
              const studentId = studentData.studentId;
              const totalAttendance = studentData.attendanceData.reduce(
                (total, data) => total + data.present,
                0
              );
             
              return totalAttendance;
            }
          );
          setStudentAttendance(attendanceData);
          setStudentTotalPresents(updatedStudentTotalPresents);
        } else {
          console.log("No student attendance data found in the response.");
          setDataAvailable(false);
        }
      } else {
        console.log("No attendance data found in the response.");
        setDataAvailable(false); 
      }

    } catch (error) {
      console.error("Error while fetching attendance data:", error);
      setDataAvailable(false); 
    }
  };

  useEffect(() => {
    setDaysInMonth(getDaysInMonth(new Date(date)));
  }, [date]);
  const handleSubmit = async () => {

    setLoading(true)
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, "0");
    const day = today.getDate().toString().padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}`;
    const studentInfo = students.map((student) => ({
      studentId: student.id,
      rollNo: student.rollNo,
      present: student.attendance,
      date: formattedDate,
      className: student.className,
      section: student.section,
    }));

    try {
      let response = await axios.post(
        "https://dvsserver.onrender.com/api/v1/teacher/createAttendance",
        {
          attendanceRecords: studentInfo,
        },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      ).then((response) => {
        setStudents((prevStudents) =>
          prevStudents.map((student) => ({
            ...student,
            attendance: false,
          }))
        )
        if (response) {
          fetchData()
          setLoading(false)
          setModalOpen(false)
        }

      }).catch((error) => {
        fetchData();

        setLoading(false);
        toast.error(error.response.data.message)
      })

    } catch (error) {
      console.error("Error sending attendance data:", error);

    }
  };
  useEffect(() => {
    fetchData();
  }, []);
 
  function getFormattedDate(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    return `${year}-${month}`;
  }

  function getDaysInMonth(date) {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  useEffect(() => {
    setCurrentDate(moment(new Date()).format("DD-MMM-YYYY"));
  }, []);

  const dateLabels = Array.from({ length: daysInMonth }, (_, day) => {
    const date = new Date(new Date().setDate(day + 1));
    const formattedDate = date.getDate().toString().padStart(2, "0");
    return formattedDate;
  });

  const studentRows = students.map((student, index) => {
    return (
      <tr key={student.id}>
        <td className="px-2 py-1 border">{index + 1}</td>
        <td className="px-2 py-1 border whitespace-nowrap">{student.studentName}</td>
        {/* Issue */}
        {dateLabels.map((dateLabel, dateIndex) => {
          const attendanceData = studentAttendance.find(
            (data) => data.studentId === student.id
          );

          const formattedResponseDate = (responseDate) => {
            const dateObject = new Date(responseDate);
            const day = dateObject.getDate(); 
            return day.toString().padStart(2, "0");
          };

          const cellContent = () => {
            if (attendanceData) {
              const matchingDateData = attendanceData.attendanceData.find(
                (data) =>
                  formattedResponseDate(data.date) === dateLabel.toString()
              );

              if (matchingDateData) {
                const inputDate = new Date(matchingDateData.date);
                const year = inputDate.getFullYear();
                const month = (inputDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0");
                const day = inputDate.getDate().toString().padStart(2, "0");
                const formatDate = `${day}-${month}-${year}`;

                return (
                  <td
                    key={dateIndex}
                    className="px-2 py-1  border text-center"
                    onMouseEnter={() =>
                      handleMouseEnter(student.name, formatDate, dateLabel)
                    }
                  >
                    <span
                      className={
                        matchingDateData.present
                          ? "text-green-600" 
                          : "text-red-600"
                      }
                    >
                      {matchingDateData.present ? "✅" : "❌"}
                    </span>
                  </td>
                );
              } else {
                return (
                  <td key={dateIndex} className="px-2 py-1 border text-center">

                  </td>
                ); // Render an empty cell if no data is available for the specific date label
              }
            }
          };

          return cellContent();
        })}
        <td className="px-2 py-1 border">{studentTotalPresents[index]}</td>{" "}
        {/* Issue */}
      </tr>
    );
  });

  const handleMouseEnter = (studentName, date, dateLabel) => {
    const message = `Student Name: ${studentName}, Date: ${date} `;
    setHoverMessage(message); // Update the state with the message
    document.body.style.cursor = "pointer";
  };

  const handleMouseLeave = () => {
    setHoverMessage("");
  };

  return (
    <div className="px-5 ">
      <h5 className="text-xl font-bold mb-4 uppercase text-center  hover-text"
        style={{ color: currentColor }}
      >
        Student Attendance
      </h5>

      <Button name="Mark Attendance" onClick={() => setModalOpen(true)} />
      <Modal
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        title={`Mark Attendance for ${currentDate}`}
      >
        <div className="bg-gray-50 p-2">

          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-1 px-4 text-left">S No.</th>
                <th className="py-1 px-4 text-left">Student</th>
                <th className="py-1 px-4 text-left">Roll No.</th>
                <th className="py-1 px-4 text-left">Present</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student,ind) => (
                <tr key={student.id} className="border-b">

                  <td className="py-1 px-4 ">{ind+1}</td>
                  <td className="py-1 px-4">{student.studentName}</td>
                  <td className="py-1 px-4">{student.rollNo}</td>
                  <td className="py-1 px-4">
                    <input
                      type="checkbox"
                      checked={student.attendance}
                      onChange={() => toggleAttendance(student.id)}
                      className="form-checkbox h-5 w-5 text-blue-500"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-4 flex flex-col md:flex-row justify-center gap-2">
            <Button loading={loading} name="Submit" onClick={handleSubmit} width="full" />
            <Button name="Cancel" onClick={() => setModalOpen(false)}  width="full" />
          </div>
        </div>
      </Modal>

      <div className="grid mx-auto mt-1 overflow-hidden">
        <div className="mb-4">
          <label className="mr-2">Month:</label>
          <input
            type="month"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={!isEditing}
            className="rounded p-2 border border-gray-300"
          />
          {hoverMessage && (
            <div className="mt-4">
              <p>{hoverMessage}</p>
            </div>
          )}
        </div>
        <div className="overflow-x-auto w-full flex justify-center">
          <div
            className="w-full overflow-scroll"
            onMouseLeave={handleMouseLeave}
          >
            {dataAvailable ? (
              <table className="table-auto">
                <thead>
                  <tr className="bg-cyan-700 text-white">
                    <th className="px-2 py-1  border ">S.N</th>
                    <th className="px-2 py-1  border ">Student</th>
                    {dateLabels.map((dateLabel, dateIndex) => (
                      <th key={dateIndex} className="px-2 py-1  border ">
                        {dateLabel}
                      </th>
                    ))}
                    <th className="px-2 py-1  border ">Presents</th>
                  </tr>
                </thead>
                <tbody>{studentRows}</tbody>
              </table>
            ) : (
              <h1>No Records found for the {date}.</h1>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Attendance;

