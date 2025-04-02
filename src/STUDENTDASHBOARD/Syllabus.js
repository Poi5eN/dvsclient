import { useState, useEffect } from "react";
import React from "react";
import axios from "axios";

import { useStateContext } from "../contexts/ContextProvider";


const Syllabus = () => {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [curriculumData, setCurriculumData] = useState([]);

  const handleDeleteCurriculum = (id) => {};
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
          }, // Set withCredentials to true
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

  // console.log("jsjscgjsfchckjajcg", studentData);

  useEffect(() => {
    if (studentData.class) {
      axios
        .get(
          `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllCurriculum?className=${studentData.class}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )
        .then((response) => {
          // console.log("CurriculumDATA-->", response.data);
          const { allCurriculum } = response.data;
          // console.log("GetALLCLASS--->", allCurriculum);
          setCurriculumData(allCurriculum);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }, [studentData.class]);

  // console.log("CurriculumData--->", curriculumData);

  return (
    <div className="mt-4 w-full">
      <h2
        className="text-4xl font-bold mb-4 uppercase text-center dark:text-white  hover-text "
        style={{ color: currentColor }}
      >
        Curriculum
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-500">
          <thead>
            <tr
              style={{ background: currentColor }}
              className="bg-cyan-600 text-white"
            >
              <th className="w-1/4 p-2 border border-gray-500 whitespace-nowrap">
                Academic Year
              </th>
              <th className="w-1/4 p-2 border border-gray-500">Class</th>
              <th className="w-1/4 p-2 border border-gray-500">Files</th>
            </tr>
          </thead>
          <tbody>
            {curriculumData.map((item, index) => (
              <tr
                key={index}
                className="border border-gray-500 text-center dark:text-white dark:bg-secondary-dark-bg  "
              >
                <td className="p-2 border border-gray-500 whitespace-nowrap">
                  {item.academicYear}
                </td>
                <td className="p-2 border border-gray-500">{item.className}</td>
                <td className="p-2 border border-gray-500">
                  {item.file && (
                    <a
                      href={item.file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      View
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Syllabus;
