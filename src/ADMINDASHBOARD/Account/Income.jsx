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
import Button from "../../Dynamic/utils/Button";
import DatePicker from "../../Dynamic/DatePicker/DatePicker";
import EarningChart from "../../CHART/EarningChart";
import PieChart from "../../pages/Charts/PieChart";


const Income = () => {
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();
  const [teacherCount, setTeacherCount] = useState([]);
  const [studentCount, setStudentCount] = useState([]);
  const [parentCount, setParentCount] = useState([]);
  const [earningData, setEarningData] = useState([]);
  const [values,setValues]=useState(
    {
fromDate:new Date(),
toDate:new Date(),
    }
  )
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
    const handleDateCange = (dateValue, name) => {
    console.log(`Updating state for ${name}:`, dateValue); // For debugging
    setValues((prevFormData) => ({
        ...prevFormData,
        [name]: dateValue, // Update the state with the received date object (or null)
    }));
};
const formatCurrency = (value) => {
    if (typeof value === 'number') {
      return `₹${value.toFixed(2)}`; // Example: $10.00
    }
    return value; // If it's already a string (e.g., "$1,200")
  };
const Income = [
  {
    name: "Inventory",
    total: 10,
    paid: 4,
    dues: 6,
    gradient: "from-pink-400 to-pink-600",
    sparklineSvgPath: "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18"
  },
  {
    name: "Transport",
    total: 10,
    paid: 4,
    dues: 6,
    gradient: "from-blue-400 to-blue-600",
    sparklineSvgPath: "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18"
  },
  {
    name: "Regular Fee",
    total: 10,
    paid: 4,
    dues: 6,
    gradient: "from-green-400 to-green-600",
    sparklineSvgPath: "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18"
  },
  {
    name: "Additional Fee",
    total: 10,
    paid: 4,
    dues: 6,
    gradient: "from-purple-400 to-purple-600",
    sparklineSvgPath: "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18"
  }
];
 const Expanse = [
  {
    name: "Inventry Purchase",
    total: 10,
    paid: 4,
    dues: 6,
    gradient: "from-red-500 to-red-700", // Example gradient for expenses
    sparklineSvgPath: "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18"
  },
  {
    name: "Teacher Salary",
    total: 10, // Assuming these are in some currency unit
    paid: 4,
    dues: 6,
    gradient: "from-orange-500 to-orange-700", // Different gradient
    sparklineSvgPath: "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18"
  },
  {
    name: "Staff Salary",
    total: 10,
    paid: 4,
    dues: 6,
    gradient: "from-amber-500 to-amber-700", // Yet another gradient
    sparklineSvgPath: "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18"
  },
  {
    name: "Extra Purchase",
    total: 10,
    paid: 4,
    dues: 6,
    gradient: "from-cyan-500 to-cyan-700", // And another
    sparklineSvgPath: "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18"
  },
];
  return (
    <div className="mt-12">
       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Income"/>
                       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2">
     <DatePicker
                            className="custom-calendar"
                            placeholder="" // Can be left empty, DatePicker default is DD/MM/YYYY
                            label={"From Date"} // Corrected typo
                            respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
                            name="fromDate"
                            id="fromDate"
                             value={values?.fromDate ? new Date(values.fromDate) : null}
                            handleChange={(e) => handleDateCange(e.value, "fromDate")}
                            // showaTime // Pass prop
                            hourFormat="12" // Pass prop
                           
                        />
     <DatePicker
                            className="custom-calendar"
                            placeholder="" // Can be left empty, DatePicker default is DD/MM/YYYY
                            label={"To Date"} // Corrected typo
                            respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
                            name="toDate"
                            id="toDate"
                             value={values?.toDate ? new Date(values.toDate) : null}
                            handleChange={(e) => handleDateCange(e.value, "toDate")}
                            // showaTime // Pass prop
                            hourFormat="12" // Pass prop
                           
                        />
      <Button name="Search" 
      // onClick={openModal}
       />
</div>
       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
           
         {Income.map((val, idx) => (
        <div
          key={idx}
          className={`p-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 bg-gradient-to-br ${val.gradient} w-full max-w-xs sm:max-w-none sm:w-auto md:w-64 lg:w-72 flex flex-col justify-between`} // Added max-width and some responsive width
        >
          {/* Top section: Name and Sparkline */}
          <div className="flex items-start justify-between mb-3">
            <h2 className="text-md font-semibold tracking-tight">{val.name}</h2>
            <div className="w-16 h-8 ml-2 flex-shrink-0"> {/* Reduced SVG size */}
              <svg
                viewBox="0 0 100 35" // Keep viewBox for scaling
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <path
                  d={val.sparklineSvgPath}
                  stroke="rgba(255,255,255,0.8)" // Slightly less opaque stroke
                  strokeWidth="2.5" // Slightly thinner stroke
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }} // Softer shadow
                />
              </svg>
            </div>
          </div>

          {/* Bottom section: Stats */}
          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-200">Total :</span>
              <span className="text-sm font-bold">{formatCurrency(val.total)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-200">Paid :</span>
              <span className="text-sm font-bold">{formatCurrency(val.paid)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-200">Dues :</span>
              <span className="text-sm font-bold text-red-300">{formatCurrency(val.dues)}</span> {/* Example: Dues in a different color */}
            </div>
          </div>
        </div>
      ))}
       </div>
       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Expanse"/>
       <div className="bg-white p-2 rounded-lg shadow border border-gray-200 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            
             {Expanse.map((item, idx) => (
         <div
      className={`p-4 text-white rounded-xl shadow-lg transition-transform transform hover:scale-105 bg-gradient-to-br ${item.gradient} w-full max-w-xs sm:max-w-none sm:w-auto md:w-64 lg:w-72 flex flex-col justify-between`}
    >
      {/* Top section: Name and Sparkline */}
      <div className="flex items-start justify-between mb-3">
        <h2 className="text-md font-semibold tracking-tight">{item.name}</h2>
        <div className="w-16 h-8 ml-2 flex-shrink-0">
          <svg
            viewBox="0 0 100 35"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              d={item.sparklineSvgPath}
              stroke="rgba(255,255,255,0.8)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))" }}
            />
          </svg>
        </div>
      </div>

      {/* Bottom section: Stats */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-200">Total :</span>
          <span className="text-sm font-bold">{formatCurrency(item.total)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-200">Paid :</span>
          <span className="text-sm font-bold">{formatCurrency(item.paid)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="font-medium text-gray-200">Dues :</span>
          <span className={`text-sm font-bold ${item.dues > 0 ? 'text-red-300' : 'text-green-300'}`}>
            {formatCurrency(item.dues)}
          </span>
        </div>
      </div>
    </div>
      ))}
       </div>
 

      <div className="grid sm:grid-cols-1 md:grid-cols-3  gap-2 p-3">
        {/* <div className="bg-white  dark:text-gray-200 dark:bg-secondary-dark-bg  rounded-2xl p-3"> */}
          <div>
          <PageHeaderWithBreadcrumb title="Overall"/>
          {/* <AllIncomeChart /> */}
          <PieChart
            // chartTitle=" Students Distribution"
            data={[80,100]}
            labels={[`Income: ${80}`, `Expanse: ${100}`]}
            colors={["#008080", "#DE3163"]}
          />
          </div>
          <div>
          <PageHeaderWithBreadcrumb title="Income / Expanse"/>
         <EarningChart />
          </div>
          <div>
          <PageHeaderWithBreadcrumb title="Fees"/>
          <AllIncomeChart />
          </div>
          <div>
          <PageHeaderWithBreadcrumb title="Inventry %"/>
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
