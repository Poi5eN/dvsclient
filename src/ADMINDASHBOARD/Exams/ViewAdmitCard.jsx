import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { FcLeft } from "react-icons/fc";
// import school from '../../ShikshMitraWebsite/assets/student.png';
import axios from "axios";
import { usePDF } from "react-to-pdf";
import { Page, Text, View, doc } from "@react-pdf/renderer";


const theader = {
  exam: "Exam",
  date: "Date",
  day: "Day",
};

const ViewAdmitCard = () => {
  const authToken = localStorage.getItem("token");
  const { toPDF, targetRef } = usePDF({ filename: "Student Admit Card" });

  const [examData, setExamData] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");

  const { email } = useParams();
  const [studentData, setStudentData] = useState({});

  useEffect(() => {
    axios
      .get(
        // `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents`,
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.allStudent[0];
       
        setStudentData(data);
      })
      .catch((error) => {
        console.error("Error fetching Student data:", error);
      });
  }, [email]);

  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/exam/getAllExams",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const examData = response.data.examData;
        setExamData(examData);
       
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, [selectedExam]);

  const handleExamChange = (e) => {
    setSelectedExam(e.target.value);
  };

  const selectedExamData = examData.find(
    (exam) => exam.examName === selectedExam
  );

  const handleDownload = () => {
    toPDF();
    document.getElementById("studentResults");
  };

  const getDayOfWeek = (dateString) => {
    const daysOfWeek = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const date = new Date(dateString);
    const dayIndex = date.getDay();
    return daysOfWeek[dayIndex];
  };
  // Function to format date as "YYYY-MM-DD"
  const formatExamDate = (examDate) => {
    const date = new Date(examDate);
    return date.toISOString().split("T")[0];
  };

  return (
    <>
      <div className=" w-full  flex items-center justify-center pt-10 ">
        <div className="  gap-2 sm:p-4 md:p-4 lg:p-4 p-2 pt-16  shadow-[rgba(0,_0,_0,_0.25)_0px_25px_50px_-12px]   overflow-y-auto">
          {/* <div className="absolute bg-white w-[50px] h-[50px] rounded-full flex justify-center items-center shadow-2xl">
            <Link to="/admin/admitcard" className=" text-blue-500 text-3xl">
              <FcLeft />
            </Link>
          </div> */}

          <div className="mt-12">
            <select
              className="p-2  border rounded-md w-full md:w-1/4"
              onChange={handleExamChange}
              value={selectedExam}
            >
              <option value="">Select Exam</option>
              {examData.map((exam) => (
                <option key={exam._id} value={exam.examName}>
                  {exam.examName}
                </option>
              ))}
            </select>

            <button
              onClick={handleDownload}
              className="ml-2  w-full 
            md:w-1/4 bg-indigo-500 text-white p-2 rounded-md font-semibold
             hover:bg-indigo-600 focus:outline-none"
            >
              Download
            </button>
          </div>
          <div ref={targetRef}>
            <Page size="A4">
              <View
                style={{
                  textAlign: "center",
                  marginLeft: 30,
                  marginRight: 30,
                  height: 150,
                  width: 150,
                }}
              >
                <div className="p-4 border border-gray-300 rounded-lg max-w-xl mx-auto bg-white shadow-md">
                  <div className="text-center">
                    <h1 className="text-3xl font-semibold">
                      Corplyx Public School
                    </h1>
                    <p>School Address</p>
                  </div>
                  <div className="mt-4 text-center">
                    <h2 className="text-xl font-semibold">Admit Card</h2>
                    <p>Exam: {selectedExam}</p>
                    <p>Academic Year: 2023-2024</p>
                  </div>
                  <div className="mt-8 flex flex-wrap justify-center items-center">
                    {studentData.image && (
                      <img
                        src={studentData.image.url}
                        alt="Student Photo"
                        className="w-24 h-24 mr-6"
                      />
                    )}
                    {/* { <img src={studentData.image.url} alt="Student Photo" className="w-24 h-24 mr-6" /> } */}
                    <div className="mt-4 w-full md:w-1/2 text-center md:text-left">
                      <p className="font-semibold">Student Details</p>
                      <p>Name: {studentData.fullName}</p>
                      <p>Class:{studentData.class} Grade</p>
                      <p>Section: {studentData.section}</p>
                      {/* <p>Admission Number: {studentData.fullName}</p> */}
                      <p>Roll Number: {studentData.rollNo}</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="font-semibold">Exam Schedule:</p>

                    <table className="w-full border border-gray-300 mt-2">
                      <thead className="bg-gray-100">
                        <tr>
                          {Object.keys(theader).map((key) => (
                            <th
                              key={key}
                              className="border border-gray-300 p-2"
                            >
                              {theader[key]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {selectedExamData &&
                          selectedExamData.examInfo.map((data) => (
                            <tr key={data.subjectName}>
                              <td className="border border-gray-300 p-2">
                                {data.subjectName}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {formatExamDate(data.examDate)}
                              </td>
                              <td className="border border-gray-300 p-2">
                                {getDayOfWeek(data.examDate)}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold">Important Instructions:</p>
                    <ul className="list-disc list-inside text-sm">
                      <li>
                        Please arrive at the exam center 30 minutes before the
                        exam.
                      </li>
                      <li>
                        Bring this admit card and a valid ID for verification.
                      </li>
                      {/* Add more instructions as needed */}
                    </ul>
                  </div>
                  <div className="mt-4">
                    <p className="font-semibold">Signature:</p>
                    <div className="border border-gray-300 w-1/2 mx-auto h-8"></div>
                  </div>
                </div>
              </View>
            </Page>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewAdmitCard;
