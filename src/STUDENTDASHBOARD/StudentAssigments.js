import React, { useState, useEffect } from "react";
import axios from "axios";

import { useStateContext } from "../contexts/ContextProvider";


const StudentAssigments = () => {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [assignmentData, setAssignmentsData] = useState([]);
  const [studentData, setStudentData] = useState([]);
  const email = sessionStorage.getItem("email");
  useEffect(() => {
    // GET Request to fetch existing notices
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        // console.log("Yes---->", response.data.allStudent);
        setStudentData(response.data.allStudent[0]);
        // console.log("StudentDashBoard--->", response.data.allStudent[0]);
      })
      .catch((error) => {
        console.error("Error fetching notices:", error);
      });
  }, []);
  useEffect(() => {
    if (studentData.class) {
      axios
        .get(
          `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllAssignment?className=${studentData.class}&section=${studentData.section}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )
        .then((response) => {
          console.log("DATA-->", response.data);
          const { allAssignment } = response.data;
          console.log("GetALLCLASS--->", allAssignment);
          setAssignmentsData(allAssignment);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }, [studentData.class]);
  console.log("CurriculumData--->", assignmentData);

  return (
    <div className="mt-4 p-3">
      <h2
        className="text-4xl font-bold mb-4 uppercase text-center dark:text-white  hover-text "
        style={{ color: currentColor }}
      >
        Created Assignments
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full  rounded-md border-collapse">
          <thead className=" bg-cyan-600 text-white ">
            <tr className="border" style={{ background: currentColor }}>
              <th className="p-4 border">Title</th>
              <th className="p-4 border">Description</th>
              <th className="p-4 border">Due Date</th>
              <th className="p-4 border">Class</th>
              <th className="p-4 border">Section</th>
              <th className="p-4 border">Subject</th>
              <th className="border border-blue-500 px-4 py-2">File</th>
            </tr>
          </thead>
          <tbody>
            {assignmentData.map((item, index) => (
              <tr key={index} className="border text-center">
                <td className="p-4 border">{item.title}</td>
                <td className="p-4 border">{item.description}</td>
                <td className="p-4 border">
                  {item.dueDate ? item.dueDate.split("T")[0] : ""}
                </td>
                <td className="p-4 border">{item.className}</td>
                <td className="p-4 border">{item.section}</td>
                <td className="p-4 border">{item.subject}</td>
                <td className="border border-blue-500 px-4 py-2">
                  <a
                    href={item.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-lg"
                  >
                    View PDF
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAssigments;
