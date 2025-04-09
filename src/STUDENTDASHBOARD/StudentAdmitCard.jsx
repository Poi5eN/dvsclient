import React, { useEffect, useState } from "react";
import axios from "axios";
import { usePDF } from "react-to-pdf";
import { useStateContext } from "../contexts/ContextProvider";
import { Page,View } from "@react-pdf/renderer";


const theader = {
  exam: "Exam",
  date: "Date",
  day: "Day",
  startTime: "Start Time",
  endTime: "End Time",
};

const StudentAdmitCard = () => {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const { toPDF, targetRef } = usePDF({ filename: "Student Admit Card" });

  const [examData, setExamData] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [newexamName, setExamName] = useState("");
  const studentData = JSON.parse(sessionStorage.getItem("response"));
  const [schoolData, setSchoolData] = useState([]);

  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAdminInfo",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )

      .then((response) => {
        const data = response.data.admin;

        setSchoolData(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  useEffect(() => {
    axios
      .get("https://dvsserver.onrender.com/api/v1/exam/getAllExams", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const classTeacher = JSON.parse(sessionStorage.response).class;
        const filteredData = response.data.examData.filter(
          (exam) => exam.className === classTeacher
        );
        const name = filteredData[0].examName;
        setExamName(name);
        setExamData(filteredData);
       

      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  const handleExamChange = (e) => {
    setSelectedExam(e.target.value);
    setExamName(e.target.value);
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

  return (
    <div>
      <div className="mt-12 w-[60%] mx-auto">
        <select
          className="p-2 mb-2 border rounded-md w-full md:w-1/4
          dark:text-white dark:bg-secondary-dark-bg 
          "
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
          className="dark:text-white dark:bg-secondary-dark-bg text-gray-800 ml-2 neu-btn border-2 "
          style={{ border: `2px solid ${currentColor} `, color: currentColor }}
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
            <div
              className="p-4 border border-gray-300 rounded-lg max-w-xl mx-auto bg-white shadow-md
            dark:text-white dark:bg-secondary-dark-bg    
            "
            >
              <div className="text-center">
                <h1 className="text-3xl font-semibold">
                  {schoolData.schoolName}
                </h1>
                <p>{schoolData.address}</p>
              </div>
              <div className="mt-4 text-center">
                <h2 className="text-xl font-semibold">Admit Card</h2>
                <p>Exam: {newexamName}</p>
                <p>Academic Year: 2023-2024</p>
              </div>
              <div className="mt-8 flex flex-wrap justify-center items-center">
               <div   className="w-24 h-24 object-contain" > <img
                  src={studentData.image.url}
                  alt="Student Photo"
                
                /></div>

                <div className="mt-4 w-full md:w-1/2 text-center md:text-left">
                  <p className="font-semibold">Student Details</p>
                  <p>Name: {studentData.fullName}</p>
                  <p>Class:{studentData.class} Grade</p>
                  <p>Section: {studentData.section}</p>
                  <p>Roll Number: {studentData.rollNo}</p>
                </div>
              </div>
              <div className="mt-6">
                <p className="font-semibold">Exam Schedule:</p>

                <table className="w-full border border-gray-300 mt-2">
                  <thead className="bg-gray-100">
                    <tr style={{ background: currentColor }}>
                      {Object.keys(theader).map((key) => (
                        <th key={key} className="border border-gray-300 p-2">
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
                            {data.examDate ? data.examDate.split("T")[0] : ""}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {getDayOfWeek(data.examDate)}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {data.startTime}
                          </td>
                          <td className="border border-gray-300 p-2">
                            {data.endTime}
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
                    Please arrive at the exam center 30 minutes before the exam.
                  </li>
                  <li>
                    Bring this admit card and a valid ID for verification.
                  </li>
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
  );
};

export default StudentAdmitCard;
