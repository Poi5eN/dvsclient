import React, { useEffect, useState } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import Calendar from "../pages/Calendar";
import axios from "axios";
import StudentApexChart from "../CHART/StudentApexChart";
import TeacherNotice from "./TeacherNotice";

import Welcome from "../Dynamic/Welcome";
import AttendanceCart from "./DashBoard/AttendenceCart";
import ExamSystem from "./NewExam/ExamSystem";
import Mobile from "./Mobile/Index";


const TeacherHome = () => {
  const authToken = localStorage.getItem("token");
  const {  teacherRoleData } = useStateContext();
  const [teacherCount, setTeacherCount] = useState([]);
  const [parentCount, setParentCount] = useState([]);

  useEffect(() => {
    axios
      .get("https://dvsserver.onrender.com/api/v1/adminRoute/getTeachers", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        if (Array.isArray(response.data.data)) {
          setTeacherCount(response.data.data.length);
        } else {
          console.error("Data format is not as expected:", response.data);
        }
      })
      .catch((error) => {
        console.error("Error fetching teacher count:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAllParents",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        setParentCount(response.data.allParent.length);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {}, [teacherCount, parentCount]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
      }
    };
    const handlePopstate = (event) => {
      event.preventDefault();
      window.history.pushState(null, null, window.location.pathname);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopstate);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopstate);
    };
  }, []);

  return (
    <>
      <div className="sm:block md:hidden">
        <Mobile />
      </div>
      <div className="mt:0 sm:hidden hidden md:block">
        <div className="grid gap-3 p-3 sm:grid-cols-1 md:grid-cols-2 lg:flex">
          <div
            style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-2xl p-3 md:w-full lg:w-1/2"
          >
            <ExamSystem />
          </div>

          <div
            style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-2xl p-3 md:w-full lg:w-1/2"
          >
            <TeacherNotice />
          </div>
        </div>
        <div className="grid p-3 gap-3 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
          <Welcome teacherRoleData={teacherRoleData} />

          <div
            style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
            className=" rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
          >
            <StudentApexChart />
          </div>
          <div
            style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
            className=" rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
          >
            <AttendanceCart />
          </div>
        </div>

        <div
          style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
          className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-2xl p-3"
        >
          <Calendar />
        </div>
      </div>
    </>
  );
};

export default TeacherHome;
