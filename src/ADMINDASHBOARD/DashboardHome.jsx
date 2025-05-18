// import React, { useEffect, useState } from "react";
// import PieChart from "../pages/Charts/PieChart";
// import { useStateContext } from "../contexts/ContextProvider";
// import { format } from "date-fns";
// import EarningChart from "../CHART/EarningChart";
// import TeacherNotice from "../TEACHERDASHBOARD/TeacherNotice";
// import Welcome from "../Dynamic/Welcome";
// import {
//   feeIncomeMonths,
//   GetAdmissions,
//   getAllStudents,
//   getAllTeachers,
// } from "../Network/AdminApi";
// import { toast } from "react-toastify";
// import BirthdayCarousel from "./BirthdayCarousel";
// import { motion } from "framer-motion"; // Import motion

// const DashboardHome = () => {
//   const [teacherCount, setTeacherCount] = useState(0);
//   const [admissionCount, setAdmissionCount] = useState(0);
//   const [monthlyFee, setMonthlyFee] = useState();
//   const { setIsLoader } = useStateContext();

//   const [allBday, setAllBday] = useState([]);
//   const [allStudents, setAllStudents] = useState([]);
//   const today = new Date();
//   const todayDay = String(today.getDate()).padStart(2, "0");
//   const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
//   const formattedToday = `${todayDay}-${todayMonth}`;

//   const getTeachers = async () => {
//     setIsLoader(true);
//     try {
//       const response = await getAllTeachers();
//       if (response?.success) {
//         setTeacherCount(response?.data?.length || 0);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error getting teachers", error); // Added context to log
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const getAllStudent = async () => {
//     // Removed setIsLoader(true) from here if getTeachers already handles it for page load
//     try {
//       const response = await getAllStudents();
//       if (response?.success) {
//         setAllStudents(response?.students?.data);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error getting all students", error); // Added context to log
//     }
//     // Removed setIsLoader(false)
//   };

//   const monthlyFeeIncome = async () => {
//     try {
//       const response = await feeIncomeMonths();
//       if (response?.success) {
//         setMonthlyFee(response?.data);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) { // <<< --- CORRECTED THIS BLOCK
//       console.log("error getting monthly fee", error); // Added context to log
//     }
//   };

//   const newAdmission = async () => {
//     // Removed setIsLoader(true) from here if getTeachers already handles it for page load
//     try {
//       const response = await GetAdmissions();
//       if (response?.success) {
//         setAdmissionCount(response?.newAdmissions?.data?.length || 0); // Added || 0
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error getting new admissions", error); // Added context to log
//     }
//     // Removed setIsLoader(false)
//   };

//   useEffect(() => {
//     const matchingStudents = allStudents?.filter((student) => {
//       const studentDOB = student?.dateOfBirth
//         ? format(new Date(student?.dateOfBirth), "dd-MM")
//         : "";
//       return studentDOB === formattedToday;
//     });
//     setAllBday(matchingStudents || []); // Ensure allBday is always an array
//   }, [allStudents, formattedToday]);

//   useEffect(() => {
//     // Group related async calls for initial load
//     const loadInitialData = async () => {
//       setIsLoader(true); // Set loader once at the beginning
//       await Promise.all([ // Fetch in parallel
//         newAdmission(),
//         getTeachers(), // getTeachers also sets loader, consider consolidating loader logic
//         getAllStudent(),
//         monthlyFeeIncome(),
//       ]);
//       // setIsLoader(false); // Set loader false after all promises resolve if not handled by individual funcs
//       // Note: getTeachers and newAdmission already handle their own setIsLoader.
//       // For simplicity, if getTeachers is the first to set it true and last to set it false, it might work.
//       // Or, have a dedicated loading state for the entire dashboard.
//     };
//     loadInitialData();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []); // setIsLoader could be a dependency if it changes and should re-trigger

//   useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
//         event.preventDefault();
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

//   const statsData = [
//     {
//       id: 1,
//       value: admissionCount,
//       label: "ADMISSION",
//       gradient: "bg-gradient-to-br from-blue-400 to-indigo-500",
//       sparklineSvgPath: "M5 28 Q15 18, 25 22 T45 15 Q55 5, 65 10 T85 8 Q95 12, 100 10",
//     },
//     {
//       id: 2,
//       value: allStudents?.length || 0,
//       label: "STUDENTS",
//       gradient: "bg-gradient-to-r from-blue-200 to-blue-500 ",
//       sparklineSvgPath: "M5 25 Q15 20, 25 12 T45 10 Q55 5, 65 15 T85 22 Q95 18, 100 20",
//     },
//     {
//       id: 3,
//       value: teacherCount,
//       label: "TEACHER",
//       gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
//       sparklineSvgPath: "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18",
//     },
//     {
//       id: 4,
//       value: ` ₹ ${
//         monthlyFee && monthlyFee.length > 0
//           ? parseFloat(monthlyFee.reduce((acc, num) => acc + num, 0)).toFixed(2)
//           : "0.00"
//       }`,
//       label: "FEES",
//       gradient: "bg-gradient-to-br from-pink-400 to-red-500",
//       sparklineSvgPath: "M5 22 Q15 8, 25 20 T45 10 Q55 30, 65 15 T85 25 Q95 12, 100 20",
//     },
//   ];

//   const StatsCard = ({ value, label, gradient, sparklineSvgPath }) => {
//     return (
//       <div
//         className={`p-5 rounded-md text-white ${gradient} w-full h-[120px] flex items-center justify-between shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out`}
//       >
//         <div className="flex flex-col space-y-0.5">
//           <span className="text-3xl font-bold leading-tight">{value}</span>
//           <span className="text-sm uppercase tracking-wider font-medium">
//             {label}
//           </span>
//         </div>
//         <div className="w-[80px] h-[40px]">
//           <svg
//             viewBox="0 0 100 35"
//             xmlns="http://www.w3.org/2000/svg"
//             className="w-full h-full"
//           >
//             <path
//               d={sparklineSvgPath}
//               stroke="white"
//               strokeWidth="3.5"
//               fill="none"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               style={{ filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.3))" }}
//             />
//           </svg>
//         </div>
//       </div>
//     );
//   };

//   // Animation variants
//   const sectionVariants = { // For main sections like Welcome, Charts
//     hidden: { opacity: 0, y: 30 },
//     visible: {
//       opacity: 1,
//       y: 0,
//       transition: {
//         duration: 0.7,
//         ease: "easeOut",
//       },
//     },
//   };

//   const listContainerVariants = { // For the container of items to be staggered (e.g., Stats Cards grid)
//     hidden: { opacity: 0 },
//     visible: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1, // Stagger animation of children
//         delayChildren: 0.1,   // Optional: delay before children start animating
//       },
//     },
//   };

//   const itemVariants = { // For individual items within a staggered list
//     hidden: { y: 20, opacity: 0 },
//     visible: {
//       y: 0,
//       opacity: 1,
//       transition: {
//         duration: 0.5,
//         ease: "easeOut",
//       },
//     },
//   };

//   return (
//     <>
//       <div className="sm:mt-20 mt-20 md:mt-0 dark:bg-main-dark-bg">
//         {/* Stats Cards Section - Staggered */}
//         <motion.div
//           className="grid grid-cols-1 gap-2 mt-6 sm:grid-cols-2 lg:grid-cols-4 px-2"
//           variants={listContainerVariants}
//           initial="hidden"
//           animate="visible"
//         >
//           {statsData.map((card) => (
//             <motion.div key={card.id} variants={itemVariants}> {/* Each card animates */}
//               <StatsCard
//                 value={card.value}
//                 label={card.label}
//                 gradient={card.gradient}
//                 sparklineSvgPath={card.sparklineSvgPath}
//               />
//             </motion.div>
//           ))}
//         </motion.div>

//         {/* Welcome, Birthday, Notice Section */}
//         <motion.div
//           className="grid gap-3 p-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mt-4"
//           variants={sectionVariants} // This whole section animates in
//           initial="hidden"
//           animate="visible"
//           // If you want individual items here to animate, you'd make this a listContainer
//           // and wrap each child in motion.div with itemVariants. For now, section animates.
//         >
//           {/* You can wrap these in motion.div with itemVariants if the parent grid uses listContainerVariants */}
//           <Welcome />
//           <BirthdayCarousel allBday={allBday} today={today} />
//           <div
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//             className="rounded-md bg-white dark:text-white dark:bg-secondary-dark-bg p-2" // Added p-2 for consistency
//           >
//             <TeacherNotice />
//           </div>
//         </motion.div>

//         {/* Charts Section */}
//         <motion.div
//           className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 px-3 mt-4"
//           variants={sectionVariants} // This whole section animates in
//           initial="hidden"
//           animate="visible"
//           // transition={{ delay: 0.2 }} // Example: Add a slight delay for this section
//         >
//           <div // If you want individual chart animation, wrap in motion.div with itemVariants
//             className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md p-3"
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             <EarningChart />
//           </div>
//           <div // If you want individual chart animation, wrap in motion.div with itemVariants
//             className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md p-3 gap-2 flex justify-center items-center flex-col"
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             <PieChart allStudents={allStudents} />
//           </div>
//         </motion.div>
//       </div>
//     </>
//   );
// };

// export default DashboardHome;

import React, { useEffect, useState } from "react";
import PieChart from "../pages/Charts/PieChart";
import { useStateContext } from "../contexts/ContextProvider";
import { format } from "date-fns";
import EarningChart from "../CHART/EarningChart";
import TeacherNotice from "../TEACHERDASHBOARD/TeacherNotice";
import Welcome from "../Dynamic/Welcome";
import {
  feeIncomeMonths,
  GetAdmissions,
  getAllStudents,
  getAllTeachers,
} from "../Network/AdminApi";
import { toast } from "react-toastify";
import BirthdayCarousel from "./BirthdayCarousel";
import UseCountUp from "../Dynamic/UseCountUp";
const DashboardHome = () => {
  const [teacherCount, setTeacherCount] = useState(0);
  const [admissionCount, setAdmissionCount] = useState(0);
  const [monthlyFee, setMonthlyFee] = useState();
  const { setIsLoader } = useStateContext();

  const [allBday, setAllBday] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const today = new Date();
  const todayDay = String(today.getDate()).padStart(2, "0");
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
  const formattedToday = `${todayDay}-${todayMonth}`;

  const getTeachers = async () => {
    try {
      const response = await getAllTeachers();
      if (response?.success) {
        setTeacherCount(response?.data?.length || 0);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
    }
  };
  const getAllStudent = async () => {
    setIsLoader(true);
    try {
      const response = await getAllStudents();
      if (response?.success) {
        setAllStudents(response?.students?.data);
      } else {
        toast.error(response?.message);
        setIsLoader(false);
      }
    } catch (error) {
      console.log("error", error);
      setIsLoader(false);
    }
  };
  const monthlyFeeIncome = async () => {
    setIsLoader(true);
    try {
      const response = await feeIncomeMonths();
      if (response?.success) {
        setIsLoader(false);
        setMonthlyFee(response?.data);
      } else {
        toast.error(response?.message);
        setIsLoader(false);
      }
    } catch (error) {
      console.log("error", error);
      setIsLoader(false);
    }
  };
  const newAdmission = async () => {
    setIsLoader(true);
    try {
      const response = await GetAdmissions();
      if (response?.success) {
        setAdmissionCount(response?.newAdmissions?.data?.length);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoader(false);
    }
  };
  useEffect(() => {
    const matchingStudents = allStudents?.filter((student) => {
      const studentDOB = student?.dateOfBirth
        ? format(new Date(student?.dateOfBirth), "dd-MM")
        : "";
      // console.log("firststudentDOB",studentDOB)
      return studentDOB === formattedToday;
    });
    setAllBday(matchingStudents);
  }, [allStudents]);

  useEffect(() => {
    newAdmission();
    getTeachers();
    getAllStudent();
    monthlyFeeIncome();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const active = allStudents?.filter((s) => s.status === "active").length;
  const deactive = allStudents?.length - active;
  const boys = allStudents.filter(
    (s) => s.gender === "Male" && s.status === "active"
  ).length;
  const girls = active - boys;

  const statsData = [
    {
      id: 1,
      value: admissionCount,
      label: "ADMISSION",
      // Original image was blueish. Let's use a nice blue gradient that isn't sky.
      gradient: "bg-gradient-to-br from-blue-400 to-indigo-500",
      sparklineSvgPath:
        "M5 28 Q15 18, 25 22 T45 15 Q55 5, 65 10 T85 8 Q95 12, 100 10",
      // sparklineSvgPath: "M5 20 Q15 10, 25 20 T45 15 Q55 25, 65 18 T85 12 Q95 22, 100 15"
    },
    {
      id: 2,
      value: allStudents?.length,
      label: "STUDENTS",
      // Original image was cyan/teal. Let's go for a green.
      // gradient: "bg-gradient-to-br from-emerald-400 to-green-500",
      gradient: "bg-gradient-to-r from-blue-200 to-blue-500 ",
      sparklineSvgPath:
        "M5 25 Q15 20, 25 12 T45 10 Q55 5, 65 15 T85 22 Q95 18, 100 20",
    },
    {
      id: 3,
      value: teacherCount,
      label: "TEACHER",
      // Original image was orange/red. Let's use a warm amber/orange.
      gradient: "bg-gradient-to-br from-amber-400 to-orange-500",
      sparklineSvgPath:
        "M5 15 Q15 28, 25 12 T45 20 Q55 5, 65 22 T85 10 Q95 25, 100 18",
    },
    // {
    //   id: 4,
    //   value: ` ₹ ${monthlyFee && monthlyFee.length > 0
    //       ? parseFloat(monthlyFee.reduce((acc, num) => acc + num, 0)).toFixed(2)
    //       : '0.00'}`,
    //   label: "FEES",
    //   // Original image was purple/fuchsia. Let's use a rose/red, avoiding fuchsia.
    //   gradient: "bg-gradient-to-br from-pink-400 to-red-500",
    //   sparklineSvgPath: "M5 22 Q15 8, 25 20 T45 10 Q55 30, 65 15 T85 25 Q95 12, 100 20"
    // }
  ];
  const statsDatafee = [
    {
      id: 4,
      value: ` ₹ ${
        monthlyFee && monthlyFee.length > 0
          ? parseFloat(monthlyFee.reduce((acc, num) => acc + num, 0)).toFixed(2)
          : "0.00"
      }`,
      label: "FEES",
      // Original image was purple/fuchsia. Let's use a rose/red, avoiding fuchsia.
      gradient: "bg-gradient-to-br from-pink-400 to-red-500",
      sparklineSvgPath:
        "M5 22 Q15 8, 25 20 T45 10 Q55 30, 65 15 T85 25 Q95 12, 100 20",
    },
  ];

  const StatsCard = ({ value, label, gradient, sparklineSvgPath }) => {
    const numericValue =
      typeof value === "number"
        ? value
        : parseFloat(value?.toString().replace(/[^\d.-]/g, "")) || 0;
    const animatedCount = UseCountUp(numericValue, 1000);

    return (
      <div
        className={`p-5 rounded-md text-white ${gradient} w-full h-[120px] flex items-center justify-between shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col space-y-0.5">
          <span className="text-3xl font-bold leading-tight">
            {typeof value === "string" && value.includes("₹")
              ? `₹ ${animatedCount.toLocaleString("en-IN")}`
              : animatedCount}
          </span>
          <span className="text-sm uppercase tracking-wider font-medium">
            {label}
          </span>
        </div>

        <div className="w-[80px] h-[40px]">
          <svg
            viewBox="0 0 100 35"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              d={sparklineSvgPath}
              stroke="white"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.3))" }}
            />
          </svg>
        </div>
      </div>
    );
  };

  const StatsCardFee = ({ value, label, gradient, sparklineSvgPath }) => {
    return (
      <div
        className={`p-5 rounded-md text-white ${gradient} w-full h-[120px] flex items-center justify-between shadow-lg transform hover:scale-105 transition-transform duration-200 ease-in-out`}
      >
        <div className="flex flex-col space-y-0.5">
          <span className="text-3xl font-bold leading-tight">{value}</span>
          <span className="text-sm uppercase tracking-wider font-medium">
            {label}
          </span>
        </div>

        <div className="w-[80px] h-[40px]">
          <svg
            viewBox="0 0 100 35"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full"
          >
            <path
              d={sparklineSvgPath}
              stroke="white"
              strokeWidth="3.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ filter: "drop-shadow(0 1px 1.5px rgba(0,0,0,0.3))" }}
            />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <>
      <div>
        <div className="sm:mt-20 mt-20 md:mt-0  dark:bg-main-dark-bg">
          <div class="grid grid-cols-1 gap-2 mt-6 sm:grid-cols-2 lg:grid-cols-4 px-2">
            {statsData.map((card) => (
              <StatsCard
                key={card.id}
                value={card.value}
                label={card.label}
                gradient={card.gradient}
                sparklineSvgPath={card.sparklineSvgPath}
              />
            ))}
            {statsDatafee.map((card) => (
              <StatsCardFee
                key={card.id}
                value={card.value}
                label={card.label}
                gradient={card.gradient}
                sparklineSvgPath={card.sparklineSvgPath}
              />
            ))}
          </div>

          <div className="grid gap-3 p-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
            <Welcome />
            <BirthdayCarousel allBday={allBday} today={today} />
            <div
              style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
              // className="w-full h-full p-2 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
            >
              <TeacherNotice />
            </div>
          </div>

          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 px-3">
            <div
              className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3"
              style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
            >
              <EarningChart />
            </div>

            <div
              className="bg-white shadow-lg dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3 gap-2 flex justify-center items-center flex-col"
              // style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
            >
              {/* <PieChart allStudents={allStudents} /> */}
              <PieChart
                chartTitle=" Students Distribution"
                // data={[active, deactive]}
                // labels={[`Active: ${active}`, `Deactive: ${deactive}`]}
                // colors={["#1d8348", "#1c2833"]}
                data={[active, deactive, boys, girls]}
                labels={[
                  `Active: ${active}`,
                  `Deactive: ${deactive}`,
                  `Boys: ${boys}`,
                  `Girls: ${girls}`,
                ]}
                colors={["#1d8348", "#1c2833", "#2874a6", "#DE3163"]}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardHome;


// import React, { useEffect, useState } from "react";
// import PieChart from "../pages/Charts/PieChart";
// import { useStateContext } from "../contexts/ContextProvider";
// import { format } from "date-fns";
// import Calendar from "../pages/Calendar";
// import ActivePieChart from "../pages/Charts/ActivePieChart";
// import EarningChart from "../CHART/EarningChart";
// import TeacherNotice from "../TEACHERDASHBOARD/TeacherNotice";
// import Marquee from "../Marque/Marquee";
// import Welcome from "../Dynamic/Welcome";
// import Mobile from "./Mobile/Index";
// import { feeIncomeMonths, GetAdmissions, getAllStudents, getAllTeachers } from "../Network/AdminApi";
// import { toast } from "react-toastify";
// import teacherlogo from '../ShikshMitraWebsite/assets/teacher logo.png'
// import fees from '../ShikshMitraWebsite/assets/fees.jpg'
// import student from '../ShikshMitraWebsite/assets/student.png'
// import admission from '../ShikshMitraWebsite/assets/admission.png'
// import moment from "moment";
// const DashboardHome = () => {

//   const [teacherCount, setTeacherCount] = useState(0);
//   const [admissionCount, setAdmissionCount] = useState(0);
//  const [monthlyFee,setMonthlyFee]=useState()
//   const { setIsLoader } = useStateContext();

//   const [allBday, setAllBday] = useState([]);
//   const [allStudents, setAllStudents] = useState([]);
//   const today = new Date();
//   const todayDay = String(today.getDate()).padStart(2, "0");
//   const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
//   const formattedToday = `${todayDay}-${todayMonth}`;

//   const getTeachers=async()=>{
//     setIsLoader(true)
//     try {
//       const response= await getAllTeachers()
//       if(response?.success){
//         setTeacherCount(response?.data?.length || 0);

//       }
//       else{
//         toast.error(response?.message)

//       }
//     } catch (error) {
//       console.log("error",error)
//     }
//     finally{
//       setIsLoader(false)
//     }
//   }
//   const getAllStudent=async()=>{
//     try {
//       const response= await getAllStudents()
//       if(response?.success){
//          setAllStudents(response?.students?.data)
//       }
//       else{
//         toast.error(response?.message)

//       }
//     } catch (error) {
//       console.log("error",error)
//     }
//   }
//   const monthlyFeeIncome=async()=>{
//     try {
//       const response= await feeIncomeMonths()
//       if(response?.success){
//         setMonthlyFee(response?.data)
//       }
//       else{
//         toast.error(response?.message)

//       }
//     } catch (error) {
//       console.log("error",error)
//     }
//   }
//   const newAdmission=async()=>{
//     setIsLoader(true)
//     try {
//       const response= await GetAdmissions()
//       if(response?.success){

//         setAdmissionCount(response?.newAdmissions?.data?.length);
//       }
//       else{
//         toast.error(response?.message)
//       }
//     } catch (error) {
//       console.log("error",error)
//     }
//     finally{
//       setIsLoader(false)
//     }
//   }
// useEffect(()=>{
//   const matchingStudents = allStudents?.filter((student) => {
//     const studentDOB = format(new Date(student?.dateOfBirth), "dd-MM");
//     // console.log("firststudentDOB",studentDOB)
//     return studentDOB === formattedToday;
//   });
//   setAllBday(matchingStudents);
// },[allStudents])

//   useEffect(()=>{
//     newAdmission()
//     getTeachers()
//     getAllStudent()
//     monthlyFeeIncome()
//   },[])

// useEffect(() => {
//     const handleKeyDown = (event) => {
//       if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
//         event.preventDefault();
//       }
//     };
//     window.addEventListener("keydown", handleKeyDown);
//     return () => window.removeEventListener("keydown", handleKeyDown);
//   }, []);

// const details=[
//   {
//     name:"ADMISSION",
//     Count:admissionCount,
//     logo:admission
//   },
//   {
//     name:"STUDENTS",
//     Count:allStudents?.length,
//     logo:student

//   },
//   {
//     name:"TEACHER",
//     Count:teacherCount,
//     logo:teacherlogo
//   },
//   {
//     name:"FEES",
//     Count:`₹ ${monthlyFee?.reduce((acc,num)=>acc+num,0) || 0}`,
//     logo:fees
//   },
// ]

//   return (
//     <>
//      <div
//     //  className="sm:block md:hidden"
//      >
//         {/* <Mobile /> */}
//       </div>
//       <div
//       // className="mt:0 sm:hidden hidden md:block px-2"
//       >
//       <div className="sm:mt-20 mt-20 md:mt-0  dark:bg-main-dark-bg">
//       <div class="grid grid-cols-1 gap-2 mt-6 sm:grid-cols-2 lg:grid-cols-4">
//             {/* <template x-for="i in 4"> */}
//             {
//               details?.map((val)=>(
//                 <div class="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-lg">
//                 <div class="flex items-start justify-between">
//                   <div class="flex flex-col space-y-2">
//                     <span class="text-[#33ace0] font-bold">{val?.name}</span>
//                     <span class="text-lg font-semibold text-[#f05a28]">{val?.Count}</span>
//                   </div>
//                   <div class="rounded-md  ">
//                     <img src={val?.logo} alt="" className=" h-20" />
//                   </div>
//                 </div>
//                 {/* <div>
//                   <span class="inline-block px-2 text-sm text-white bg-green-300 rounded">14%</span>
//                   <span>from 2019</span>
//                 </div> */}
//               </div>
//               ))
//             }

//           </div>

//         <div className="grid gap-3 p-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">

//         <Welcome />

//      <div
//        style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//        className="p-2 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
//      >
//       <h1 className="text-[#33ace0] font-bold">TODAY BIRTHDAY</h1>
//         <Marquee list={allBday} time={6} height={"130px"}>
//                 {allBday?.map((item, index) => (
//                   <div class=" items-center gap-4 p-1 border rounded-sm shadow-sm bg-white my-[1px] mx-1 ">
//                     <span class="px-2 py-1  text-gray-800 text-[10px] font-semibold rounded">
//                       {item.role}
//                     </span>

//                     <div class="flex justify-between w-full">
//                       <div>
//                         <h4 class=" font-bold text-[12px] text-start"> {item.studentName}</h4>
//                         <p class="text-gray-600 font-bold text-[10px] text-start">
//                           {" "}
//                           Class : {item.class}-{item.section}{" "}
//                         </p>
//                         <p class="text-gray-600 text-lg">
//                          <span className="text-blue-800"> {`${Number(moment(today).format("YYYY"))-Number(moment(item.dateOfBirth).format("YYYY"))}th`}</span> Birthday 🎂 🎉
//                         </p>
//                       </div>

//                       <div>
//                         <img
//                           class="w-10 h-10 rounded-full"
//                           src={item?.studentImage?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"}
//                           alt="User Avatar"
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 ))}
//               </Marquee>
//      </div>
//      <div
//        style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//        className="p-2 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
//      >
//        <TeacherNotice />
//      </div>
//    </div>

//         <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-2 px-3">
//           <div
//             className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3"
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             <EarningChart />
//           </div>

//           <div
//             className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3 gap-2 flex justify-center items-center flex-col"
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             <PieChart allStudents={allStudents} />

//             <ActivePieChart allStudents={allStudents} />
//           </div>
//           {/* <div
//             className="bg-white dark:text-white dark:bg-secondary-dark-bg rounded-md  p-3"
//             style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
//           >
//             <Calendar />
//           </div> */}
//         </div>
//       </div>
//       </div>

//       {/* <Footer /> */}
//     </>
//   );
// };

// export default DashboardHome;
