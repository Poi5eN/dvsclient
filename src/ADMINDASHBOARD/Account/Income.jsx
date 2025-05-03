import React, { useEffect, useState } from "react";
import { DropDownListComponent } from "@syncfusion/ej2-react-dropdowns";
import { dropdownData } from "../../data/dummy";
// import logo from "../../ShikshMitraWebsite/assets/logo/download-removebg-preview.png";
import {
  FcConferenceCall,
  FcBusinesswoman,
  FcCurrencyExchange,
} from "react-icons/fc";
import { BiMaleFemale, BiSolidStoreAlt } from "react-icons/bi";
import { useNavigate, useLocation } from "react-router-dom";

import axios from "axios";
import IncomeChart from "./IncomeChart";
import FeeChart from "./FeeChart";
import AllIncomeChart from "./Income/AllIncomeChart";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";


// const DropDown = ({ currentMode }) => (
//   <div className="w-28 border-1 border-color px-2 py-1 rounded-md">
//     <DropDownListComponent
//       id="time"
//       fields={{ text: "Time", value: "Id" }}
//       style={{ border: "none", color: currentMode === "Dark" && "white" }}
//       value="1"
//       dataSource={dropdownData}
//       popupHeight="220px"
//       popupWidth="120px"
//     />
//   </div>
// );
const Income = () => {
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [teacherCount, setTeacherCount] = useState([]);
  const [studentCount, setStudentCount] = useState([]);
  const [parentCount, setParentCount] = useState([]);
  const [earningData, setEarningData] = useState([]);
  const [schoolInfo, setSchoolInfo] = useState({
    schoolImage: "",
    schoolName: "",
  });

  // Fetch Admin Info
  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAdminInfo",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          }, // Set withCredentials to true
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
        // Handle any errors that occur during the logout process
        console.error("badal Response error", error.message);
      });
  }, []);

  // Fetch teacher count
  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getTeachers",
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

  // Fetch student count
  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents",
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
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAllParents",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          }, // Set withCredentials to true
        }
      )
      .then((response) => {
        setParentCount(response.data.allParent.length);
       
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  useEffect(() => {
    const newEarningData = [
      {
        icon: <FcConferenceCall />,
        amount: `${studentCount}`,
        percentage: "-4%",
        title: "Students",
        iconColor: "#03C9D7",
        iconBg: "#E5FAFB",
        pcColor: "red-600",
      },
      {
        icon: <FcBusinesswoman />,
        amount: `${teacherCount}`,
        percentage: "+23%",
        title: "Teachers",
        iconColor: "rgb(255, 244, 229)",
        iconBg: "rgb(254, 201, 15)",
        pcColor: "green-600",
      },
      {
        icon: <FcCurrencyExchange />,
        amount: "423,39",
        percentage: "+38%",
        title: "Earning",
        iconColor: "rgb(228, 106, 118)",
        iconBg: "rgb(255, 244, 229)",
        pcColor: "green-600",
      },
      {
        icon: <BiMaleFemale />,
        amount: `${parentCount}`,
        percentage: "-12%",
        title: "Parents",
        iconColor: "rgb(0, 194, 146)",
        iconBg: "rgb(235, 250, 242)",
        pcColor: "red-600",
      },
    ];
    setEarningData(newEarningData);
  }, [teacherCount, studentCount, parentCount]);


  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
      }
    };

    const handlePopstate = () => {
      navigate(location.href);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("popstate", handlePopstate);

    // Cleanup event listeners on component unmount
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("popstate", handlePopstate);
    };
  }, [location.pathname]);
  const Income = [
    {
      name: "Inventry",
      // Count: admissionCount,
      // logo: admission,
    },
    {
      name: "Transport",
      // Count: allStudents?.length,
      // logo: student,
    },
    {
      name: "Regular Fee",
      // Count: teacherCount,
      // logo: teacherlogo,
    },
    {
      name: "Additional Fee",
      // Count: `₹ ${monthlyFee?.reduce((acc, num) => acc + num, 0) || 0}`,
      // logo: fees,
    },
  ];
  const Expanse = [
    {
      name: "Inventry Purchase",
      // Count: admissionCount,
      // logo: admission,
    },
    {
      name: "Teacher Salary",
      // Count: allStudents?.length,
      // logo: student,
    },
    {
      name: "Staff Salary",
      // Count: teacherCount,
      // logo: teacherlogo,
    },
    {
      name: "Extra Purchase",
      // Count: `₹ ${monthlyFee?.reduce((acc, num) => acc + num, 0) || 0}`,
      // logo: fees,
    },
  ];
  return (
    <div className="mt-12">
       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Income"/>
       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Income?.map((val) => (
              <div class="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-lg">
                <div class="flex items-start justify-between">
                  <div class="flex flex-col space-y-2">
                    <span class="text-[#33ace0] font-bold">{val?.name}</span>
                    <span class="text-lg font-semibold text-[#f05a28]">
                      {val?.Count}
                    </span>
                  </div>
                  <div class="rounded-md  ">
                    <img src={val?.logo} alt="" className=" h-20" />
                  </div>
                </div>   
              </div>
            ))}
       </div>
       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Expanse"/>
       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {Expanse?.map((val) => (
              <div class="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-lg">
                <div class="flex items-start justify-between">
                  <div class="flex flex-col space-y-2">
                    <span class="text-[#33ace0] font-bold">{val?.name}</span>
                    <span class="text-lg font-semibold text-[#f05a28]">
                      {val?.Count}
                    </span>
                  </div>
                  <div class="rounded-md  ">
                    <img src={val?.logo} alt="" className=" h-20" />
                  </div>
                </div>   
              </div>
            ))}
       </div>
 

      <div className="grid sm:grid-cols-1 md:grid-cols-2  gap-2 p-3">
        {/* <div className="bg-white  dark:text-gray-200 dark:bg-secondary-dark-bg  rounded-2xl p-3"> */}
          
          <div>
          <PageHeaderWithBreadcrumb title="Monthly Expanse"/>
          <AllIncomeChart />
          </div>
          <div>
          <PageHeaderWithBreadcrumb title="Monthly Income"/>
          <AllIncomeChart />
          </div>
          <div>
          <PageHeaderWithBreadcrumb title="Monthly Expanse %"/>
          <AllIncomeChart />
          </div>
          <div>
          <PageHeaderWithBreadcrumb title="Monthly Fee Dues"/>
          <AllIncomeChart />
          </div>
         

        {/* </div> */}
        {/* <div className="bg-white  dark:text-gray-200 dark:bg-secondary-dark-bg   rounded-2xl p-3"> */}
          {/* <FeeChart /> */}
        {/* </div> */}
        {/* <Calendar /> */}

        {/* <div className="bg-white  dark:text-gray-200 dark:bg-secondary-dark-bg   rounded-2xl p-3">
        </div> */}
      </div>
    </div>
  );
};

export default Income;


// import React from 'react'
// import Create_Income from './Create_Income'

// function Income() {
//   return (
//     <div>
//     <Create_Income/>
//     </div>
//   )
// }

// export default Income