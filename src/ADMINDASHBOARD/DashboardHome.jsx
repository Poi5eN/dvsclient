import React, { useEffect, useState } from "react";
import PieChart from "../pages/Charts/PieChart";
import { useStateContext } from "../contexts/ContextProvider";
import { format } from "date-fns";
import Calendar from "../pages/Calendar";
import ActivePieChart from "../pages/Charts/ActivePieChart";
import EarningChart from "../CHART/EarningChart";
import TeacherNotice from "../TEACHERDASHBOARD/TeacherNotice";
import Marquee from "../Marque/Marquee";
import Welcome from "../Dynamic/Welcome";
import Mobile from "./Mobile/Index";
import { feeIncomeMonths, GetAdmissions, getAllStudents, getAllTeachers } from "../Network/AdminApi";
import { toast } from "react-toastify";
import teacherlogo from '../ShikshMitraWebsite/assets/teacher logo.png'
import fees from '../ShikshMitraWebsite/assets/fees.jpg'
import moment from "moment";
const DashboardHome = () => {
  
  const [teacherCount, setTeacherCount] = useState(0);
  const [admissionCount, setAdmissionCount] = useState(0);
 const [monthlyFee,setMonthlyFee]=useState()
  const { setIsLoader } = useStateContext();

  const [allBday, setAllBday] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const today = new Date();
  const todayDay = String(today.getDate()).padStart(2, "0");
  const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
  const formattedToday = `${todayDay}-${todayMonth}`;

  const getTeachers=async()=>{
    setIsLoader(true)
    try {
      const response= await getAllTeachers()
      if(response?.success){
        setTeacherCount(response?.data?.length || 0);
        
      }
      else{
        toast.error(response?.message)
      
      }
    } catch (error) {
      console.log("error",error)
    }
    finally{
      setIsLoader(false)
    }
  }
  const getAllStudent=async()=>{
    try {
      const response= await getAllStudents()
      if(response?.success){
         setAllStudents(response?.students?.data)
      }
      else{
        toast.error(response?.message)
       
      }
    } catch (error) {
      console.log("error",error)
    }
  }
  const monthlyFeeIncome=async()=>{
    try {
      const response= await feeIncomeMonths()
      if(response?.success){
        setMonthlyFee(response?.data)
      }
      else{
        toast.error(response?.message)
       
      }
    } catch (error) {
      console.log("error",error)
    }
  }
  const newAdmission=async()=>{
    setIsLoader(true)
    try {
      const response= await GetAdmissions()
      if(response?.success){
      
        setAdmissionCount(response?.newAdmissions?.data?.length);
      }
      else{
        toast.error(response?.message)
      }
    } catch (error) {
      console.log("error",error)
    }
    finally{
      setIsLoader(false)
    }
  }
useEffect(()=>{
  const matchingStudents = allStudents?.filter((student) => {
    const studentDOB = format(new Date(student?.dateOfBirth), "dd-MM");
    // console.log("firststudentDOB",studentDOB)
    return studentDOB === formattedToday;
  });
  setAllBday(matchingStudents);
},[allStudents])

  useEffect(()=>{
    newAdmission()
    getTeachers()
    getAllStudent()
    monthlyFeeIncome()
  },[])



useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

const details=[
  {
    name:"ADMISSION",
    Count:admissionCount,
    logo:"https://static.vecteezy.com/system/resources/thumbnails/008/154/360/small/student-logo-vector.jpg"
  },
  {
    name:"STUDENTS",
    Count:allStudents?.length,
    logo:"https://static.vecteezy.com/system/resources/thumbnails/008/154/360/small/student-logo-vector.jpg"
  
  },
  {
    name:"TEACHER",
    Count:teacherCount,
    logo:teacherlogo
  },
  {
    name:"FEES",
    Count:`₹ ${monthlyFee?.reduce((acc,num)=>acc+num,0)}`,
    logo:fees
  },
]
console.log("allBday",allBday)
  return (
    <>
     <div className="sm:block md:hidden">
        <Mobile />
      </div>
      <div className="mt:0 sm:hidden hidden md:block px-2">
      <div className="sm:mt-20 mt-20 md:mt-0  dark:bg-main-dark-bg">
      <div class="grid grid-cols-1 gap-2 mt-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* <template x-for="i in 4"> */}
            {
              details?.map((val)=>(
                <div class="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-lg">
                <div class="flex items-start justify-between">
                  <div class="flex flex-col space-y-2">
                    <span class="text-[#33ace0] font-bold">{val?.name}</span>
                    <span class="text-lg font-semibold text-[#f05a28]">{val?.Count}</span>
                  </div>
                  <div class="rounded-md  ">
                    <img src={val?.logo} alt="" className=" h-20" />
                  </div>
                </div>
                {/* <div>
                  <span class="inline-block px-2 text-sm text-white bg-green-300 rounded">14%</span>
                  <span>from 2019</span>
                </div> */}
              </div>
              ))
            }

          </div>
        
        <div className="grid gap-3 p-2 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
     
        <Welcome />
     
     <div
       style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
       className="p-2 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
     >
      <h1 className="text-[#33ace0] font-bold">Today Birthday</h1>
        <Marquee list={allBday} time={6} height={"130px"}>
                {allBday?.map((item, index) => (
                  <div class=" items-center gap-4 p-1 border rounded-sm shadow-sm bg-white my-[1px] mx-1 ">
                    <span class="px-2 py-1  text-gray-800 text-[10px] font-semibold rounded">
                      {item.role}
                    </span>

                    <div class="flex justify-between w-full">
                      <div>
                        <h4 class=" font-bold text-[12px] text-start"> {item.studentName}</h4>
                        <p class="text-gray-600 font-bold text-[10px] text-start">
                          {" "}
                          Class : {item.class}-{item.section}{" "}
                        </p>
                        <p class="text-gray-600 text-lg">
                         <span className="text-blue-800"> {`${Number(moment(today).format("YYYY"))-Number(moment(item.dateOfBirth).format("YYYY"))}th`}</span> Birthday 🎂 🎉
                        </p>
                      </div>

                      <div>
                        <img
                          class="w-10 h-10 rounded-full"
                          src={item?.studentImage?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"}
                          alt="User Avatar"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </Marquee>
     </div>
     <div
       style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
       className="p-2 rounded-md text-center bg-white dark:text-white dark:bg-secondary-dark-bg"
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
            className="bg-white dark:text-gray-200 dark:bg-secondary-dark-bg rounded-md  p-3 gap-2 flex justify-center items-center flex-col"
            style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
          >
            <PieChart allStudents={allStudents} />
           
            <ActivePieChart allStudents={allStudents} />
          </div>
          {/* <div
            className="bg-white dark:text-white dark:bg-secondary-dark-bg rounded-md  p-3"
            style={{ boxShadow: "rgba(0, 0, 0, 0.16) 0px 1px 4px" }}
          >
            <Calendar />
          </div> */}
        </div>
      </div>
      </div>
     
      {/* <Footer /> */}
    </>
  );
};

export default DashboardHome;

