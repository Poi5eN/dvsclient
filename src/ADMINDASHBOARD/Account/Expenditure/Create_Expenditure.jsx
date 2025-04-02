import React, { useEffect, useState } from "react";

import {
  FcConferenceCall,
  FcBusinesswoman,
  FcCurrencyExchange,
} from "react-icons/fc";
import { BiMaleFemale } from "react-icons/bi";

import axios from "axios";

import InventoryStock from "./InventoryStock";
import EmployeeChart from "./EmployeeChart";
import ExpensesChart from "./ExpensesChart";



const Create_Expenditure = () => {
  const authToken = localStorage.getItem("token");
  const [teacherCount, setTeacherCount] = useState([]);
  const [studentCount, setStudentCount] = useState([]);
  const [parentCount, setParentCount] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState({
    schoolImage: "",
    schoolName: "",
  });

  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdminInfo",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          }, 
        }
      )
      .then((response) => {
       
        const schoolImage = response.data.admin.image.url;
        const schoolName = response.data.admin.fullName;
        setSchoolInfo({
          schoolImage,
          schoolName,
        });
      })
      .catch((error) => {
        console.error(" Here Response error", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getTeachers",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
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
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        if (Array.isArray(response.data.allStudent)) {
          setStudentCount(response.data.allStudent.length);
        } else {
          console.error("Data format is not as expected:", response.allStudent);
        }
      })
      .catch((error) => {
        console.error("Error fetching student count:", error);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllParents",
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
        console.error("Error  int fetching data:", error);
      });
  }, []);

  useEffect(() => {
  
  }, [teacherCount, studentCount, parentCount]);



  return (
    <div className="mt-12">
      <div className="grid gap-3 xl:grid-cols-4 lg:grid-cols-2 md:grid-cols-2 sm:grid-cols-1  p-3">
        <div
          className={`p-2 rounded-md  bg-white w-full flex flex-col justify-center col-span-2`}
        >
          <div className="flex justify-center items-center  w-full h-[150px]">
            <div className="w-[150px] h-[150px] rounded-full overflow-hidden ">
              {schoolInfo.schoolImage ? (
                <img
                  src={schoolInfo.schoolImage}
                  alt="no img"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>No Image Available</span>
              )}
            </div>
          </div>
          <h2 className="text-center mt-4 border-b-4 border-cyan-700 text-2xl font-bold text-sky-800">
            {schoolInfo.schoolName}
          </h2>
        </div>
        <div className=" p-2  rounded-md sm:w-full text-center bg-white col-span-2">
          <InventoryStock />
        </div>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 p-3">
        <div className="bg-white  dark:text-gray-200 dark:bg-secondary-dark-bg  rounded-2xl p-3">
          {/* <EarningChart /> */}
          <ExpensesChart />
        </div>
        <div className="bg-white  dark:text-gray-200 dark:bg-secondary-dark-bg   rounded-2xl p-3">
          <EmployeeChart />
        
        </div>
       
      </div>
    </div>
  );
};

export default Create_Expenditure;
