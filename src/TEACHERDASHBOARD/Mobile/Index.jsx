import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice, FaMoneyBillAlt, FaSms, FaSearch, FaBookmark } from "react-icons/fa";
import { MdOutlineAssignment } from "react-icons/md";
import { IoMdApps, IoMdVideocam } from "react-icons/io";
import { PiExamFill } from "react-icons/pi";
import {
    AiOutlineCalendar, AiOutlineInfoCircle,
} from "react-icons/ai";
import {
    GiBus, GiBookshelf
} from "react-icons/gi";
import { FiUser } from 'react-icons/fi';
import MyStudent from "../MyStudent/MyStudent";
import Attendance from "../Attendance";
import AdmitCard from "../NewExam/AdmitCard";
import ReportCard from "../NewExam/ReportCard";
import Assignments from "../Assignments";
import Study from "../Study";
import AboutTeacher from "../AboutTeacher";
import AllotMarks from "../NewExam/AllotMarks";
import Lectures from "../Lectures";
import CreateExam from "../NewExam/CreateExam";
import { useStateContext } from "../../contexts/ContextProvider";

const Mobile = () => {
    const { currentColor } = useStateContext();
    const fullName = sessionStorage.getItem("fullName");
    const navigate = useNavigate();
    const [activeComponent, setActiveComponent] = useState(null);

    const buttonVariants = {
        hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
        tap: { scale: 0.95 },
        initial: { scale: 1 },
    };

    const menuItems = [
        {
            title: "Student",
            icon: <FaUserGraduate className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
        },
        {
            title: "Attendance",
            icon: <FaUsers className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
        },
        {
            title: "Exams",
            icon: <PiExamFill className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
        },
        {
            title: "Admit Card",
            icon: <FaFileAlt className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
        },
        {
            title: "Marks",
            icon: <FaStar className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
        },
        {
            title: "Report Card",
            icon: <FaFileInvoice className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
        },
        {
            title: "Assignments",
            icon: <MdOutlineAssignment className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
        },
        {
            title: "lectures",
            icon: <IoMdVideocam className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
        },
        {
            title: "Study Material",
            icon: <FaBook className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
        },
        {
            title: "About",
            icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
        },
        {
            title: "Calendar",
            icon: <AiOutlineCalendar className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
        },
        {
            title: "Books",
            icon: <GiBookshelf className="text-5xl mb-1" />,
            iconType: "component",
            colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
        },

    ];

    const fixedMenuItems = [
        {
            icon: <IoMdApps className="text-2xl " />,
            link: "/teacher",
        },

        {
            icon: <span>{fullName}</span>,
            // link: "/teacher", // old link
           link:"/teacher/AboutTeacher" //new Link
        },
        {
            icon: <FiUser className="text-2xl " />,
            // link: "/teacher", // old link
           link:"/teacher/AboutTeacher" //new Link
        },
    ];

    const handleClick = (link, title) => {
        if (title) {
            setActiveComponent(title);
        } else {
            setActiveComponent(null);
             if(link === "/teacher/AboutTeacher"){
                  setActiveComponent("About");
              }else{
                  navigate(link)
             }


        }
    };


    const renderActiveComponent = () => {
        switch (activeComponent) {
            case "Student":
                return <MyStudent />;
            case "Attendance":
                return <Attendance />;
            case "Exams":
                return <CreateExam />;
            case "Admit Card":
                return <AdmitCard />;
            case "Marks":
                return <AllotMarks />;
            case "Report Card":
                return <ReportCard />;
            case "Assignments":
                return <Assignments />;
            case "lectures":
                return <Lectures />;
            case "Study Material":
                return <Study />;
            case "About":
                return <AboutTeacher />;
            // case "Calendar":
            //     return <Calendar />;
            default:
                return null;
        }
    };

     return (
        <div className="flex flex-col h-[85.1vh] ">
        
            <div className="flex-grow overflow-y-auto">
                {!activeComponent ? (
                    <div className="p-4 ">
                        <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
                            {menuItems.map((item, index) => (
                                <motion.button
                                    key={index}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                    initial="initial"
                                    className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
                                    onClick={() => handleClick(item.link, item.title)}
                                >
                                    {item.icon}
                                    <p className="text-sm">{item.title}</p>
                                </motion.button>
                            ))}
                        </div>
                    </div>) : (
                    <div className="p-4"> {renderActiveComponent()}</div>
                )
                }
            </div>


            <div className="bg-gray-800 p-4 fixed bottom-0 w-full" 
            style={{background:currentColor}}
            >
                <div className="flex justify-around max-w-md mx-auto">
                    {fixedMenuItems.map((item, index) => (
                        <motion.button
                            key={index}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                            initial="initial"
                            className="text-gray-400 hover:text-white focus:outline-none"
                            onClick={() => handleClick(item.link)}
                        >
                           <span className="text-2xl"> {item.icon}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Mobile;



// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice, FaMoneyBillAlt, FaSms, FaSearch, FaBookmark } from "react-icons/fa";
// import { MdOutlineAssignment } from "react-icons/md";
// import { IoMdApps, IoMdVideocam } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import {
//     AiOutlineCalendar, AiOutlineInfoCircle,
// } from "react-icons/ai";
// import {
//     GiBus, GiBookshelf
// } from "react-icons/gi";
// import { FiUser } from 'react-icons/fi';
// import MyStudent from "../MyStudent/MyStudent";
// import Attendance from "../Attendance";
// import AdmitCard from "../NewExam/AdmitCard";
// import ReportCard from "../NewExam/ReportCard";
// import Assignments from "../Assignments";
// import Study from "../Study";
// import AboutTeacher from "../AboutTeacher";
// import AllotMarks from "../NewExam/AllotMarks";
// import Lectures from "../Lectures";
// import CreateExam from "../NewExam/CreateExam";
// import { useStateContext } from "../../contexts/ContextProvider";

// const Mobile = () => {
//     const { currentColor } = useStateContext();
//     const fullName = sessionStorage.getItem("fullName");
//     const navigate = useNavigate();
//     const [activeComponent, setActiveComponent] = useState(null);

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };

//     const menuItems = [
//         {
//             title: "Student",
//             icon: <FaUserGraduate className="text-5xl mb-1" />,
//             link: "/teacher/mystudents",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: <FaUsers className="text-5xl mb-1" />,
//             link: "/teacher/attendance",
//             iconType: "component",
//             colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//             iconType: "component",
//             colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//         {
//             title: "Admit Card",
//             icon: <FaFileAlt className="text-5xl mb-1" />,
//             link: "/teacher/admitcard",
//             iconType: "component",
//             colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//         {
//             title: "Marks",
//             icon: <FaStar className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//             iconType: "component",
//             colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <FaFileInvoice className="text-5xl mb-1" />,
//             link: "/teacher/reportscard",
//             iconType: "component",
//             colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <MdOutlineAssignment className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//             iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <IoMdVideocam className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//             iconType: "component",
//             colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//         {
//             title: "Study Material",
//             icon: <FaBook className="text-5xl mb-1" />,
//             link: "/teacher/study",
//             iconType: "component",
//             colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//         {
//             title: "About",
//             icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
//             link: "/teacher/AboutTeacher",
//             iconType: "component",
//             colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//         },
//         {
//             title: "Calendar",
//             icon: <AiOutlineCalendar className="text-5xl mb-1" />,
//             link: "/teacher/calendar",
//             iconType: "component",
//             colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//         {
//             title: "Books",
//             icon: <GiBookshelf className="text-5xl mb-1" />,
//             link: "/teacher/books",
//             iconType: "component",
//             colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },

//     ];

//     const fixedMenuItems = [
//         {
//             icon: <IoMdApps className="text-2xl " />,
//             link: "/teacher",
//         },

//         {
//             icon: <span>{fullName}</span>,
//             // link: "/teacher", // old link
//            link:"/teacher/AboutTeacher" //new Link
//         },
//         {
//             icon: <FiUser className="text-2xl " />,
//             // link: "/teacher", // old link
//            link:"/teacher/AboutTeacher" //new Link
//         },
//     ];

//     const handleClick = (link, title) => {
//         if (title) {
//             setActiveComponent(title);
//         } else {
//             setActiveComponent(null);
//              if(link === "/teacher/AboutTeacher"){
//                   setActiveComponent("About");
//               }else{
//                   navigate(link)
//              }


//         }
//     };


//     const renderActiveComponent = () => {
//         switch (activeComponent) {
//             case "Student":
//                 return <MyStudent />;
//             case "Attendance":
//                 return <Attendance />;
//             case "Exams":
//                 return <CreateExam />;
//             case "Admit Card":
//                 return <AdmitCard />;
//             case "Marks":
//                 return <AllotMarks />;
//             case "Report Card":
//                 return <ReportCard />;
//             case "Assignments":
//                 return <Assignments />;
//             case "lectures":
//                 return <Lectures />;
//             case "Study Material":
//                 return <Study />;
//             case "About":
//                 return <AboutTeacher />;
//             // case "Calendar":
//             //     return <Calendar />;
//             default:
//                 return null;
//         }
//     };

//      return (
//         <div className="flex flex-col h-[90.7vh]">
//             <div className="flex-grow overflow-y-auto">
//                 {!activeComponent ? (
//                     <div className="p-4 ">
//                         <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//                             {menuItems.map((item, index) => (
//                                 <motion.button
//                                     key={index}
//                                     variants={buttonVariants}
//                                     whileHover="hover"
//                                     whileTap="tap"
//                                     initial="initial"
//                                     className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                                     onClick={() => handleClick(item.link, item.title)}
//                                 >
//                                     {item.icon}
//                                     <p className="text-sm">{item.title}</p>
//                                 </motion.button>
//                             ))}
//                         </div>
//                     </div>) : (
//                     <div className="p-4"> {renderActiveComponent()}</div>
//                 )
//                 }
//             </div>


//             <div className="bg-gray-800 p-4" 
//             style={{background:currentColor}}
//             >
//                 <div className="flex justify-around max-w-md mx-auto">
//                     {fixedMenuItems.map((item, index) => (
//                         <motion.button
//                             key={index}
//                             variants={buttonVariants}
//                             whileHover="hover"
//                             whileTap="tap"
//                             initial="initial"
//                             className="text-gray-400 hover:text-white focus:outline-none"
//                             onClick={() => handleClick(item.link)}
//                         >
//                             {item.icon}
//                         </motion.button>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Mobile;

// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice, FaMoneyBillAlt, FaSms, FaSearch, FaBookmark } from "react-icons/fa";
// import { MdOutlineAssignment } from "react-icons/md";
// import { IoMdApps, IoMdVideocam } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import {
//     AiOutlineCalendar, AiOutlineInfoCircle,
// } from "react-icons/ai";
// import {
//     GiBus, GiBookshelf
// } from "react-icons/gi";
// import { FiUser } from 'react-icons/fi';
// import MyStudent from "../MyStudent/MyStudent";
// import Attendance from "../Attendance";
// import AdmitCard from "../NewExam/AdmitCard";

// import ReportCard from "../NewExam/ReportCard";
// import Assignments from "../Assignments";
// import Study from "../Study";
// import AboutTeacher from "../AboutTeacher";
// import AllotMarks from "../NewExam/AllotMarks";
// import Lectures from "../Lectures";

// const Mobile = () => {
//     const navigate = useNavigate();
//     const [activeComponent, setActiveComponent] = useState(null);

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };

//     const menuItems = [
//         {
//             title: "Student",
//             icon: <FaUserGraduate className="text-5xl mb-1" />,
//             link: "/teacher/mystudents",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: <FaUsers className="text-5xl mb-1" />,
//             link: "/teacher/attendance",
//              iconType: "component",
//             colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//          {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//              iconType: "component",
//             colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//          {
//             title: "Admit Card",
//             icon: <FaFileAlt className="text-5xl mb-1" />,
//             link: "/teacher/admitcard",
//              iconType: "component",
//             colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//          {
//             title: "Marks",
//             icon: <FaStar className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//               iconType: "component",
//             colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <FaFileInvoice className="text-5xl mb-1" />,
//             link: "/teacher/reportscard",
//             iconType: "component",
//             colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <MdOutlineAssignment className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//              iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <IoMdVideocam className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//              iconType: "component",
//             colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//         {
//             title: "Study Material",
//             icon: <FaBook className="text-5xl mb-1" />,
//             link: "/teacher/study",
//              iconType: "component",
//             colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//        {
//             title: "About",
//             icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
//             link: "/teacher/AboutTeacher",
//              iconType: "component",
//              colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//          },
//          {
//             title: "Calendar",
//             icon: <AiOutlineCalendar className="text-5xl mb-1" />,
//             link: "/teacher/calendar",
//              iconType: "component",
//             colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//         {
//             title: "Books",
//             icon: <GiBookshelf className="text-5xl mb-1" />,
//             link: "/teacher/books",
//              iconType: "component",
//             colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },

//     ];

//     const fixedMenuItems = [
//        {
//             icon: <IoMdApps  className="text-2xl " />,
//            link: "/teacher",
//         },
//         {
//              icon: <FaSearch className="text-2xl " />,
//             link: "/teacher",
//         },
//          {
//             icon: <FaBookmark className="text-2xl " />,
//             link: "/teacher",
//         },
//         {
//            icon: <FiUser className="text-2xl " />,
//         //   link: "/teacher",
//           link: "/teacher/AboutTeacher",
//        },
//     ];


//     const handleClick = (link, title) => {
//          if (title) {
//               setActiveComponent(title);
//         } else {
//               setActiveComponent(null);
//               navigate(link);

//         }
//     };


//      const renderActiveComponent = () => {
//         switch (activeComponent) {
//             case "Student":
//                 return <MyStudent />;
//              case "Attendance":
//                 return <Attendance />;
//             case "Exams":
//                 return <AllotMarks />;
//             case "Admit Card":
//                  return <AdmitCard/>;
//             case "Marks":
//                  return <Marks />;
//             case "Report Card":
//                  return <ReportCard />;
//              case "Assignments":
//                  return <Assignments />;
//              case "lectures":
//                 return <Lectures />;
//              case "Study Material":
//                return <Study />;
//               case "About":
//                   return <AboutTeacher />;
//             //   case "Calendar":
//             //        return <Calendar />;
//             default:
//                 return null;
//         }
//     };
//     return (
//         <div className="flex flex-col h-[90.7vh]">
//             <div className="flex-grow overflow-y-auto">
//               {!activeComponent ? (
//                 <div className="p-4 ">
//                     <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//                         {menuItems.map((item, index) => (
//                             <motion.button
//                                 key={index}
//                                 variants={buttonVariants}
//                                 whileHover="hover"
//                                 whileTap="tap"
//                                 initial="initial"
//                                 className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                                 onClick={() => handleClick(item.link, item.title)}
//                             >
//                                 {item.icon}
//                                 <p className="text-sm">{item.title}</p>
//                             </motion.button>
//                          ))}
//                      </div>
//                 </div>) : (
//                  <div className="p-4"> {renderActiveComponent()}</div>
//             )
//          }
//            </div>


//             <div className="bg-gray-800 p-4">
//                 <div className="flex justify-around max-w-md mx-auto">
//                     {fixedMenuItems.map((item, index) => (
//                         <motion.button
//                             key={index}
//                             variants={buttonVariants}
//                              whileHover="hover"
//                              whileTap="tap"
//                              initial="initial"
//                              className="text-gray-400 hover:text-white focus:outline-none"
//                             onClick={() => handleClick(item.link)}
//                         >
//                             {item.icon}
//                         </motion.button>
//                     ))}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Mobile;



// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice, FaMoneyBillAlt, FaSms, FaSearch, FaBookmark } from "react-icons/fa";
// import { MdOutlineAssignment } from "react-icons/md";
// import { IoMdApps, IoMdVideocam } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import {
//     AiOutlineCalendar, AiOutlineInfoCircle,
// } from "react-icons/ai";
// import {
//     GiBus, GiBookshelf
// } from "react-icons/gi";
// import { FiUser } from 'react-icons/fi';
// import MyStudent from "../MyStudent/MyStudent";

// const Mobile = () => {
//     const navigate = useNavigate();
//     const [showMyStudent, setShowMyStudent] = useState(false);

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };

//     const menuItems = [
//         {
//             title: "Student",
//             icon: <FaUserGraduate className="text-5xl mb-1" />,
//             link: "/teacher/mystudents",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: <FaUsers className="text-5xl mb-1" />,
//             link: "/teacher/attendance",
//             iconType: "component",
//             colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//             iconType: "component",
//             colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//         {
//             title: "Admit Card",
//             icon: <FaFileAlt className="text-5xl mb-1" />,
//             link: "/teacher/admitcard",
//             iconType: "component",
//             colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//         {
//             title: "Marks",
//             icon: <FaStar className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//             iconType: "component",
//             colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <FaFileInvoice className="text-5xl mb-1" />,
//             link: "/teacher/reportscard",
//             iconType: "component",
//             colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <MdOutlineAssignment className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//             iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <IoMdVideocam className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//             iconType: "component",
//             colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//         {
//             title: "Study Material",
//             icon: <FaBook className="text-5xl mb-1" />,
//             link: "/teacher/study",
//             iconType: "component",
//             colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//         {
//             title: "About",
//             icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
//             link: "/teacher/AboutTeacher",
//             iconType: "component",
//             colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//         },
//         {
//             title: "Calendar",
//             icon: <AiOutlineCalendar className="text-5xl mb-1" />,
//             link: "/teacher/calendar",
//             iconType: "component",
//             colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//         {
//             title: "Books",
//             icon: <GiBookshelf className="text-5xl mb-1" />,
//             link: "/teacher/books",
//             iconType: "component",
//             colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },
//     ];

//      const fixedMenuItems = [
//        {
//             icon: <IoMdApps  className="text-2xl " />,
//            link: "/teacher",
//         },
//         {
//              icon: <FaSearch className="text-2xl " />,
//             link: "/teacher",
//         },
//          {
//             icon: <FaBookmark className="text-2xl " />,
//             link: "/teacher",
//         },
//         {
//            icon: <FiUser className="text-2xl " />,
//           link: "/teacher",
//        },
//     ];


//     const handleClick = (link, title) => {
//         if (title === "Student") {
//            setShowMyStudent(true);
//         } else {
//             setShowMyStudent(false);

//             navigate(link);
//         }

//     };

//      return (
//         <div className="flex flex-col h-[90.7vh]">
//         <div className="flex-grow overflow-y-auto">
//            {!showMyStudent ? (
//                 <div className="p-4 ">
//                    <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//                     {menuItems.map((item, index) => (
//                        <motion.button
//                         key={index}
//                         variants={buttonVariants}
//                         whileHover="hover"
//                         whileTap="tap"
//                         initial="initial"
//                         className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                            onClick={() => handleClick(item.link, item.title)}
//                        >
//                         {item.icon}
//                        <p className="text-sm">{item.title}</p>
//                       </motion.button>
//                     ))}
//                   </div>
//                 </div>) : ( <div className="p-4"> <MyStudent/></div>)
//             }
//            </div>

//          <div className="bg-gray-800 p-4">
//             <div className="flex justify-around max-w-md mx-auto">
//               {fixedMenuItems.map((item, index) => (
//                <motion.button
//                   key={index}
//                   variants={buttonVariants}
//                    whileHover="hover"
//                    whileTap="tap"
//                    initial="initial"
//                    className="text-gray-400 hover:text-white focus:outline-none"
//                    onClick={() => handleClick(item.link)}
//                  >
//                     {item.icon}
//                  </motion.button>
//                  ))}
//             </div>
//            </div>
//         </div>
//     );
// };

// export default Mobile;



// import React, { useState } from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice, FaMoneyBillAlt, FaSms, FaSearch, FaBookmark } from "react-icons/fa";
// import { MdOutlineAssignment } from "react-icons/md";
// import { IoMdApps, IoMdVideocam } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import {
//     AiOutlineCalendar, AiOutlineInfoCircle,
// } from "react-icons/ai";
// import {
//     GiBus, GiBookshelf
// } from "react-icons/gi";
// import { FiUser } from 'react-icons/fi';
// import MyStudent from "../MyStudent/MyStudent";

// const Mobile = () => {
//     const navigate = useNavigate();
//     const [showMyStudent, setShowMyStudent] = useState(false);

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };

//      const menuItems = [
//         {
//             title: "Student",
//             icon: <FaUserGraduate className="text-5xl mb-1" />,
//             link: "/teacher/mystudents",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: <FaUsers className="text-5xl mb-1" />,
//             link: "/teacher/attendance",
//             iconType: "component",
//             colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//             iconType: "component",
//             colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//         {
//             title: "Admit Card",
//             icon: <FaFileAlt className="text-5xl mb-1" />,
//             link: "/teacher/admitcard",
//             iconType: "component",
//             colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//         {
//             title: "Marks",
//             icon: <FaStar className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//             iconType: "component",
//             colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <FaFileInvoice className="text-5xl mb-1" />,
//             link: "/teacher/reportscard",
//             iconType: "component",
//             colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <MdOutlineAssignment className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//             iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <IoMdVideocam className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//             iconType: "component",
//             colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//         {
//             title: "Study Material",
//             icon: <FaBook className="text-5xl mb-1" />,
//             link: "/teacher/study",
//             iconType: "component",
//             colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//         {
//             title: "About",
//             icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
//             link: "/teacher/AboutTeacher",
//             iconType: "component",
//             colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//         },
//         {
//             title: "Calendar",
//             icon: <AiOutlineCalendar className="text-5xl mb-1" />,
//             link: "/teacher/calendar",
//             iconType: "component",
//             colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//         {
//              title: "Books",
//              icon: <GiBookshelf className="text-5xl mb-1" />,
//              link: "/teacher/books",
//              iconType: "component",
//             colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },
//     ];

//     const fixedMenuItems = [
//        {
//             icon: <IoMdApps  className="text-2xl " />,
//            link: "/teacher",
//         },
//         {
//              icon: <FaSearch className="text-2xl " />,
//             link: "/teacher",
//         },
//          {
//             icon: <FaBookmark className="text-2xl " />,
//             link: "/teacher",
//         },
//         {
//            icon: <FiUser className="text-2xl " />,
//           link: "/teacher",
//        },
//     ];

//     const handleClick = (link, title) => {
//         if (title === "Student") {
//            setShowMyStudent(true);
//         } else {
//             setShowMyStudent(false);
            
//             navigate(link);
//         }

//     };


//    return (
//       <div className="flex flex-col h-[90.7vh]">
//        {!showMyStudent ? (    <div className="p-4 flex-grow overflow-y-auto">
         
//             <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//               {menuItems.map((item, index) => (
//                   <motion.button
//                       key={index}
//                       variants={buttonVariants}
//                       whileHover="hover"
//                       whileTap="tap"
//                       initial="initial"
//                       className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                          onClick={() => handleClick(item.link, item.title)}
//                   >
//                       {item.icon}
//                         <p className="text-sm">{item.title}</p>
//                   </motion.button>
//             ))}
//           </div>
//        </div>) : null}

//        <div className="flex flex-col h-[90.7vh]">
//        {showMyStudent && <MyStudent />}
//        </div>

//         <div className="bg-gray-800 p-4">
//           <div className="flex justify-around max-w-md mx-auto">
//             {fixedMenuItems.map((item, index) => (
//               <motion.button
//                   key={index}
//                   variants={buttonVariants}
//                   whileHover="hover"
//                   whileTap="tap"
//                   initial="initial"
//                   className="text-gray-400 hover:text-white focus:outline-none"
//                     onClick={() => handleClick(item.link)}
//                >
//                 {item.icon}
//               </motion.button>
//            ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Mobile;


// import React from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice, FaMoneyBillAlt, FaSms, FaSearch, FaBookmark } from "react-icons/fa";
// import { MdOutlineAssignment } from "react-icons/md";
// import { IoMdApps, IoMdVideocam } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import {
//     AiOutlineCalendar, AiOutlineInfoCircle,
// } from "react-icons/ai";
// import {
//     GiBus, GiBookshelf
// } from "react-icons/gi";
// import { FiUser } from 'react-icons/fi';
// import MyStudent from "../MyStudent/MyStudent";

// const Mobile = () => {
//     const navigate = useNavigate();

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };

//      const menuItems = [
//         {
//             title: "Student",
//             icon: <FaUserGraduate className="text-5xl mb-1" />,
//             link: "/teacher/mystudents",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: <FaUsers className="text-5xl mb-1" />,
//             link: "/teacher/attendance",
//             iconType: "component",
//             colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//             iconType: "component",
//             colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//         {
//             title: "Admit Card",
//             icon: <FaFileAlt className="text-5xl mb-1" />,
//             link: "/teacher/admitcard",
//             iconType: "component",
//             colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//         {
//             title: "Marks",
//             icon: <FaStar className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//             iconType: "component",
//             colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <FaFileInvoice className="text-5xl mb-1" />,
//             link: "/teacher/reportscard",
//             iconType: "component",
//             colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <MdOutlineAssignment className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//             iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <IoMdVideocam className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//             iconType: "component",
//             colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//         {
//             title: "Study Material",
//             icon: <FaBook className="text-5xl mb-1" />,
//             link: "/teacher/study",
//             iconType: "component",
//             colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//         {
//             title: "About",
//             icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
//             link: "/teacher/AboutTeacher",
//             iconType: "component",
//             colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//         },
//         {
//             title: "Calendar",
//             icon: <AiOutlineCalendar className="text-5xl mb-1" />,
//             link: "/teacher/calendar",
//             iconType: "component",
//             colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//         {
//              title: "Books",
//              icon: <GiBookshelf className="text-5xl mb-1" />,
//              link: "/teacher/books",
//              iconType: "component",
//             colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },
//         // {
//         //     title: "Pay Now",
//         //     icon: <FaMoneyBillAlt className="text-5xl mb-1" />,
//         //     link: "/teacher/pay",
//         //     iconType: "component",
//         //     colors: { text: "text-pink-500", hoverBg: "hover:bg-pink-50" },
//         // },
//         // {
//         //     title: "Web Sms",
//         //     icon: <FaSms className="text-5xl mb-1" />,
//         //     link: "/teacher/sms",
//         //     iconType: "component",
//         //     colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         // },
//         // {
//         //     title: "Bus",
//         //     icon: <GiBus className="text-5xl mb-1" />,
//         //     link: "/teacher/bus",
//         //     iconType: "component",
//         //     colors: { text: "text-yellow-600", hoverBg: "hover:bg-yellow-50" },
//         // },
//     ];

//     const fixedMenuItems = [
//        {
//             icon: <IoMdApps  className="text-2xl " />,
//            link: "/teacher/menu",
//         },
//         {
//              icon: <FaSearch className="text-2xl " />,
//             link: "/teacher/search",
//         },
//          {
//             icon: <FaBookmark className="text-2xl " />,
//             link: "/teacher/bookmark",
//         },
//         {
//            icon: <FiUser className="text-2xl " />,
//           link: "/teacher/profile",
//        },
//     ];

//     const handleClick = (link) => {
//         navigate(link);
//     };

//    return (
//       <div className="flex flex-col h-[90.7vh]">
//           <div className="p-4 flex-grow overflow-y-auto">
//             <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//               {menuItems.map((item, index) => (
//                   <motion.button
//                       key={index}
//                       variants={buttonVariants}
//                       whileHover="hover"
//                       whileTap="tap"
//                       initial="initial"
//                       className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                         onClick={() => handleClick(item.link)}
//                   >
//                       {item.icon}
//                         <p className="text-sm">{item.title}</p>
//                   </motion.button>
//             ))}
//           </div>
//        </div>

// <MyStudent/>
//         <div className="bg-gray-800 p-4">
//           <div className="flex justify-around max-w-md mx-auto">
//             {fixedMenuItems.map((item, index) => (
//               <motion.button
//                   key={index}
//                   variants={buttonVariants}
//                   whileHover="hover"
//                   whileTap="tap"
//                   initial="initial"
//                   className="text-gray-400 hover:text-white focus:outline-none"
//                     onClick={() => handleClick(item.link)}
//                >
//                 {item.icon}
//               </motion.button>
//            ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Mobile;



// import React from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice, FaMoneyBillAlt, FaSms, FaSearch, FaBookmark } from "react-icons/fa";
// import { MdOutlineAssignment } from "react-icons/md";
// import { IoMdApps, IoMdVideocam } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import {
//     AiOutlineCalendar, AiOutlineInfoCircle,
// } from "react-icons/ai";
// import {
//     GiBus, GiBookshelf
// } from "react-icons/gi";
// import { FiUser } from 'react-icons/fi';

// const Mobile = () => {
//     const navigate = useNavigate();

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };

//      const menuItems = [
//         {
//             title: "Student",
//             icon: <FaUserGraduate className="text-5xl mb-1" />,
//             link: "/teacher/mystudents",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: <FaUsers className="text-5xl mb-1" />,
//             link: "/teacher/attendance",
//             iconType: "component",
//             colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//             iconType: "component",
//             colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//         {
//             title: "Admit Card",
//             icon: <FaFileAlt className="text-5xl mb-1" />,
//             link: "/teacher/admitcard",
//             iconType: "component",
//             colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//         {
//             title: "Marks",
//             icon: <FaStar className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//             iconType: "component",
//             colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <FaFileInvoice className="text-5xl mb-1" />,
//             link: "/teacher/reportscard",
//             iconType: "component",
//             colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <MdOutlineAssignment className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//             iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <IoMdVideocam className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//             iconType: "component",
//             colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//         {
//             title: "Study Material",
//             icon: <FaBook className="text-5xl mb-1" />,
//             link: "/teacher/study",
//             iconType: "component",
//             colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//         {
//             title: "About",
//             icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
//             link: "/teacher/AboutTeacher",
//             iconType: "component",
//             colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//         },
//         {
//             title: "Calendar",
//             icon: <AiOutlineCalendar className="text-5xl mb-1" />,
//             link: "/teacher/calendar",
//             iconType: "component",
//             colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//         {
//              title: "Books",
//              icon: <GiBookshelf className="text-5xl mb-1" />,
//              link: "/teacher/books",
//              iconType: "component",
//             colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },
//         // {
//         //     title: "Pay Now",
//         //     icon: <FaMoneyBillAlt className="text-5xl mb-1" />,
//         //     link: "/teacher/pay",
//         //     iconType: "component",
//         //     colors: { text: "text-pink-500", hoverBg: "hover:bg-pink-50" },
//         // },
//         // {
//         //     title: "Web Sms",
//         //     icon: <FaSms className="text-5xl mb-1" />,
//         //     link: "/teacher/sms",
//         //     iconType: "component",
//         //     colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         // },
//         // {
//         //     title: "Bus",
//         //     icon: <GiBus className="text-5xl mb-1" />,
//         //     link: "/teacher/bus",
//         //     iconType: "component",
//         //     colors: { text: "text-yellow-600", hoverBg: "hover:bg-yellow-50" },
//         // },
//     ];

//     const fixedMenuItems = [
//        {
//             icon: <IoMdApps  className="text-2xl " />,
//            link: "/teacher/menu",
//         },
//         {
//              icon: <FaSearch className="text-2xl " />,
//             link: "/teacher/search",
//         },
//          {
//             icon: <FaBookmark className="text-2xl " />,
//             link: "/teacher/bookmark",
//         },
//         {
//            icon: <FiUser className="text-2xl " />,
//           link: "/teacher/profile",
//        },
//     ];

//     const handleClick = (link) => {
//         navigate(link);
//     };

//    return (
//       <div className="flex flex-col h-[90.7vh]">
//           <div className="p-4 flex-grow overflow-y-auto">
//             <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//               {menuItems.map((item, index) => (
//                   <motion.button
//                       key={index}
//                       variants={buttonVariants}
//                       whileHover="hover"
//                       whileTap="tap"
//                       initial="initial"
//                       className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                         onClick={() => handleClick(item.link)}
//                   >
//                       {item.icon}
//                         <p className="text-sm">{item.title}</p>
//                   </motion.button>
//             ))}
//           </div>
//        </div>


//         <div className="bg-gray-800 p-4">
//           <div className="flex justify-around max-w-md mx-auto">
//             {fixedMenuItems.map((item, index) => (
//               <motion.button
//                   key={index}
//                   variants={buttonVariants}
//                   whileHover="hover"
//                   whileTap="tap"
//                   initial="initial"
//                   className="text-gray-400 hover:text-white focus:outline-none"
//                     onClick={() => handleClick(item.link)}
//                >
//                 {item.icon}
//               </motion.button>
//            ))}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Mobile;


// import React from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice, FaMoneyBillAlt, FaSms, FaSearch, FaBookmark } from "react-icons/fa";
// import { MdOutlineAssignment } from "react-icons/md";
// import { IoMdApps, IoMdVideocam } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import {
//     AiOutlineCalendar, AiOutlineInfoCircle,
// } from "react-icons/ai";
// import {
//     GiBus, GiBookshelf
// } from "react-icons/gi";
// import {  FiUser } from 'react-icons/fi';

// const Mobile = () => {
//     const navigate = useNavigate();

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };

//     const menuItems = [
//         {
//             title: "Student",
//             icon: <FaUserGraduate className="text-5xl mb-1" />,
//             link: "/teacher/mystudents",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: <FaUsers className="text-5xl mb-1" />,
//             link: "/teacher/attendance",
//             iconType: "component",
//             colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//             iconType: "component",
//             colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//         {
//             title: "Admit Card",
//             icon: <FaFileAlt className="text-5xl mb-1" />,
//             link: "/teacher/admitcard",
//             iconType: "component",
//             colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//         {
//             title: "Marks",
//             icon: <FaStar className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//             iconType: "component",
//             colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <FaFileInvoice className="text-5xl mb-1" />,
//             link: "/teacher/reportscard",
//             iconType: "component",
//             colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <MdOutlineAssignment className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//             iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <IoMdVideocam className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//             iconType: "component",
//             colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//         {
//             title: "Study Material",
//             icon: <FaBook className="text-5xl mb-1" />,
//             link: "/teacher/study",
//             iconType: "component",
//             colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//         {
//             title: "About",
//             icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
//             link: "/teacher/AboutTeacher",
//             iconType: "component",
//             colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//         },
//         {
//             title: "Calendar",
//             icon: <AiOutlineCalendar className="text-5xl mb-1" />,
//             link: "/teacher/calendar",
//             iconType: "component",
//             colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//         {
//             title: "Books",
//             icon: <GiBookshelf className="text-5xl mb-1" />,
//             link: "/teacher/books",
//             iconType: "component",
//             colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },
//         // {
//         //     title: "Pay Now",
//         //     icon: <FaMoneyBillAlt className="text-5xl mb-1" />,
//         //     link: "/teacher/pay",
//         //     iconType: "component",
//         //     colors: { text: "text-pink-500", hoverBg: "hover:bg-pink-50" },
//         // },
//         // {
//         //     title: "Web Sms",
//         //     icon: <FaSms className="text-5xl mb-1" />,
//         //     link: "/teacher/sms",
//         //     iconType: "component",
//         //     colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         // },
//         // {
//         //     title: "Bus",
//         //     icon: <GiBus className="text-5xl mb-1" />,
//         //     link: "/teacher/bus",
//         //     iconType: "component",
//         //     colors: { text: "text-yellow-600", hoverBg: "hover:bg-yellow-50" },
//         // },
//     ];

//      const fixedMenuItems = [
//        {
//             icon: <IoMdApps  className="text-2xl " />,
//            link: "/teacher/menu",
//         },
//         {
//              icon: <FaSearch className="text-2xl " />,
//             link: "/teacher/search",
//         },
//          {
//             icon: <FaBookmark className="text-2xl " />,
//             link: "/teacher/bookmark",
//         },
//         {
//            icon: <FiUser className="text-2xl " />,
//           link: "/teacher/profile",
//        },

//     ];


//     const handleClick = (link) => {
//         navigate(link);
//     };

//     return (
//        <div className="flex flex-col ">
//       <div className="p-4 flex-grow overflow-y-auto">
//                 <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//                     {menuItems.map((item, index) => (
//                         <motion.button
//                             key={index}
//                             variants={buttonVariants}
//                             whileHover="hover"
//                             whileTap="tap"
//                             initial="initial"
//                             className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                             onClick={() => handleClick(item.link)}
//                         >
//                             {item.icon}
//                             <p className="text-sm">{item.title}</p>
//                         </motion.button>
//                     ))}
//                 </div>
//             </div>


//         <div className="bg-gray-800 p-4  ">
//             <div className="flex justify-around max-w-md mx-auto">
//                 {fixedMenuItems.map((item, index) => (
//                     <motion.button
//                         key={index}
//                         variants={buttonVariants}
//                          whileHover="hover"
//                         whileTap="tap"
//                         initial="initial"
//                         className="text-gray-400 hover:text-white focus:outline-none"
//                           onClick={() => handleClick(item.link)}
//                     >
//                       {item.icon}
//                     </motion.button>
//                 ))}
//             </div>
//         </div>
//     </div>
//     );
// };

// export default Mobile;



// import React from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice, FaMoneyBillAlt, FaSms } from "react-icons/fa";
// import { MdOutlineAssignment } from "react-icons/md";
// import { IoMdApps, IoMdVideocam } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import {
//     AiOutlineCalendar, AiOutlineInfoCircle,
// } from "react-icons/ai";
// import {
//     GiBus, GiBookshelf
// } from "react-icons/gi";

// const Mobile = () => {
//     const navigate = useNavigate();

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };

//      const menuItems = [
//         {
//             title: "Student",
//             icon: <FaUserGraduate className="text-5xl mb-1" />,
//             link: "/teacher/mystudents",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: <FaUsers className="text-5xl mb-1" />,
//             link: "/teacher/attendance",
//             iconType: "component",
//             colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//             iconType: "component",
//             colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//         {
//             title: "Admit Card",
//             icon: <FaFileAlt className="text-5xl mb-1"/>,
//             link: "/teacher/admitcard",
//             iconType: "component",
//             colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//         {
//             title: "Marks",
//             icon: <FaStar className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//             iconType: "component",
//             colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <FaFileInvoice className="text-5xl mb-1"/>,
//             link: "/teacher/reportscard",
//             iconType: "component",
//             colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <MdOutlineAssignment className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//             iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <IoMdVideocam className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//             iconType: "component",
//             colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//          {
//             title: "Study Material",
//              icon: <FaBook className="text-5xl mb-1" />,
//              link: "/teacher/study",
//             iconType: "component",
//             colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//          {
//              title: "About",
//                icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
//              link: "/teacher/AboutTeacher",
//              iconType: "component",
//              colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//          },
//         {
//             title: "Calendar",
//              icon: <AiOutlineCalendar className="text-5xl mb-1" />,
//              link: "/teacher/calendar",
//             iconType: "component",
//             colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//          {
//              title: "Books",
//              icon: <GiBookshelf className="text-5xl mb-1" />,
//              link: "/teacher/books",
//              iconType: "component",
//             colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },
//          {
//             title: "Pay Now",
//              icon: <FaMoneyBillAlt className="text-3xl mb-1" />,
//              link: "/teacher/pay",
//             iconType: "component",
//              colors: { text: "text-pink-500", hoverBg: "hover:bg-pink-50" },
//         },
//          {
//             title: "Web Sms",
//              icon: <FaSms className="text-3xl mb-1" />,
//              link: "/teacher/sms",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Bus",
//             icon: <GiBus className="text-3xl mb-1" />,
//              link: "/teacher/bus",
//             iconType: "component",
//             colors: { text: "text-yellow-600", hoverBg: "hover:bg-yellow-50" },
//         },
//     ];

//     const handleClick = (link) => {
//         navigate(link);
//     };

//     return (
//         <div className="p-4">
//             <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//                 {menuItems.map((item, index) => (
//                     <motion.button
//                         key={index}
//                         variants={buttonVariants}
//                         whileHover="hover"
//                         whileTap="tap"
//                         initial="initial"
//                         className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                         onClick={() => handleClick(item.link)}
//                     >
//                         {item.icon}
//                         <p className="text-sm">{item.title}</p>
//                     </motion.button>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Mobile;



// import React from "react";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";
// import { FaUserGraduate, FaUsers, FaBook, FaStar, FaFileAlt, FaFileInvoice } from "react-icons/fa";
// import { MdOutlineAssignment } from "react-icons/md";
// import { IoMdApps, IoMdVideocam } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import {
//     AiOutlineCalendar, AiOutlineInfoCircle, AiOutlineFilePdf
// } from "react-icons/ai";
// import {
//     GiUmbrella, GiHotMeal, GiBus
// } from "react-icons/gi";

// const Mobile = () => {
//     const navigate = useNavigate();

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };

//     const menuItems = [
//         {
//             title: "Student",
//             icon: <FaUserGraduate className="text-5xl mb-1" />,
//             link: "/teacher/mystudents",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: <FaUsers className="text-5xl mb-1" />,
//             link: "/teacher/attendance",
//             iconType: "component",
//             colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//             iconType: "component",
//             colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//         {
//             title: "Admit Card",
//             icon: <FaFileAlt className="text-5xl mb-1"/>,
//             link: "/teacher/admitcard",
//             iconType: "component",
//             colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//         {
//             title: "Marks",
//             icon: <FaStar className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//             iconType: "component",
//             colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <FaFileInvoice className="text-5xl mb-1"/>,
//             link: "/teacher/reportscard",
//             iconType: "component",
//             colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <MdOutlineAssignment className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//             iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <IoMdVideocam className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//             iconType: "component",
//             colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//         {
//             title: "Study Material",
//              icon: <FaBook className="text-5xl mb-1" />,
//              link: "/teacher/study",
//             iconType: "component",
//             colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//          {
//              title: "About",
//                icon: <AiOutlineInfoCircle className="text-5xl mb-1" />,
//              link: "/teacher/AboutTeacher",
//              iconType: "component",
//              colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//          },
//         {
//             title: "Calendar",
//              icon: <AiOutlineCalendar className="text-5xl mb-1" />,
//              link: "/teacher/calendar",
//             iconType: "component",
//             colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//         {
//             title: "Books",
//             icon: <IoMdApps className="text-5xl mb-1" />,
//             link: "/teacher",
//             iconType: "component",
//             colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Pay Now",
//              icon: <GiUmbrella className="text-3xl mb-1" />,
//             link: "/teacher",
//             iconType: "component",
//              colors: { text: "text-pink-500", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "Web Sms",
//             icon: <GiHotMeal className="text-3xl mb-1" />,
//             link: "/teacher",
//             iconType: "component",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Bus",
//             icon: <GiBus className="text-3xl mb-1" />,
//              link: "/teacher",
//             iconType: "component",
//             colors: { text: "text-yellow-600", hoverBg: "hover:bg-yellow-50" },
//         },
//     ];

//     const handleClick = (link) => {
//         navigate(link);
//     };

//     return (
//         <div className="p-4">
//             <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//                 {menuItems.map((item, index) => (
//                     <motion.button
//                         key={index}
//                         variants={buttonVariants}
//                         whileHover="hover"
//                         whileTap="tap"
//                         initial="initial"
//                         className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                          onClick={() => handleClick(item.link)}
//                     >
//                         {item.icon}
//                         <p className="text-sm">{item.title}</p>
//                     </motion.button>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Mobile;




// import React from "react";
// import student from "../../Icone/icons8-student-48.png";
// import attendance from "../../Icone/icons8-attendance-45.png";
// import { IoMdApps } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom";

// const Mobile = () => {
//     const navigate = useNavigate();

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };
//     const menuItems = [
//         {
//             title: "Student",
//             icon: student,
//             alt: "student",
//             link: "/teacher/mystudents",
//             iconType: "image",
//             colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Attendance",
//             icon: attendance,
//             alt: "attendance",
//             link: "/teacher/attendance",
//             iconType: "image",
//              colors: { text: "text-blue-600", hoverBg: "hover:bg-blue-50" },
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams",
//             iconType: "component",
//               colors: { text: "text-red-600", hoverBg: "hover:bg-red-50" },
//         },
//         {
//             title: "Admit Card",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/admitcard",
//             iconType: "component",
//              colors: { text: "text-purple-600", hoverBg: "hover:bg-purple-50" },
//         },
//         {
//             title: "Marks",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/allotmaks",
//             iconType: "component",
//              colors: { text: "text-teal-600", hoverBg: "hover:bg-teal-50" },
//         },
//         {
//             title: "Report Card",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/reportscard",
//             iconType: "component",
//               colors: { text: "text-indigo-600", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Assignments",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/assignments",
//             iconType: "component",
//             colors: { text: "text-pink-600", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "lectures",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/lectures",
//             iconType: "component",
//              colors: { text: "text-lime-600", hoverBg: "hover:bg-lime-50" },
//         },
//         {
//             title: "Study Material",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/study",
//             iconType: "component",
//              colors: { text: "text-orange-600", hoverBg: "hover:bg-orange-50" },
//         },
//         {
//             title: "About",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/AboutTeacher",
//             iconType: "component",
//               colors: { text: "text-cyan-600", hoverBg: "hover:bg-cyan-50" },
//         },
//         {
//             title: "Calendar",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/calendar",
//             iconType: "component",
//              colors: { text: "text-rose-600", hoverBg: "hover:bg-rose-50" },
//         },
//         {
//             title: "Hills",
//             icon: <IoMdApps className="text-5xl mb-1" />,
//             link: "/teacher/hills",
//             iconType: "component",
//              colors: { text: "text-indigo-500", hoverBg: "hover:bg-indigo-50" },
//         },
//         {
//             title: "Beach",
//             icon: <i className="far fa-umbrella-beach text-3xl mb-1"></i>,
//             link: "/teacher/beach",
//             iconType: "component",
//                colors: { text: "text-pink-500", hoverBg: "hover:bg-pink-50" },
//         },
//         {
//             title: "Hotel",
//             icon: <i className="far fa-hotel text-3xl mb-1"></i>,
//             link: "/teacher/hotel",
//             iconType: "component",
//              colors: { text: "text-green-600", hoverBg: "hover:bg-green-50" },
//         },
//         {
//             title: "Bus",
//             icon: <i className="far fa-bus text-3xl mb-1"></i>,
//             link: "/teacher/bus",
//             iconType: "component",
//               colors: { text: "text-yellow-600", hoverBg: "hover:bg-yellow-50" },
//         },
//     ];
//     const handleClick = (link) => {
//         navigate(link);
//     };


//     return (
//         <div className="p-4">
//             <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//                 {menuItems.map((item, index) => (
//                     <motion.button
//                         key={index}
//                         variants={buttonVariants}
//                         whileHover="hover"
//                         whileTap="tap"
//                         initial="initial"
//                         className={`flex flex-col items-center justify-center rounded-2xl shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.colors.text} ${item.colors.hoverBg}`}
//                         onClick={() => handleClick(item.link)}
//                     >
//                         {item.iconType === "image" ? (
//                          <img src={item.icon} alt={item.alt} className="h-10 w-10 mb-1" />
//                         ) : (
//                             item.icon
//                         )}
//                         <p className="text-sm">{item.title}</p>
//                     </motion.button>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Mobile;


// import React from "react";
// import student from "../../Icone/icons8-student-48.png";
// import attendance from "../../Icone/icons8-attendance-45.png";
// import { IoMdApps } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import { motion } from "framer-motion";
// import { useNavigate } from "react-router-dom"; // Import useNavigate


// const Mobile = () => {
//     const navigate = useNavigate(); // Initialize useNavigate

//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//     };
//     const menuItems = [
//         {
//             title: "Student",
//             icon: student,
//             alt: "student",
//             link: "/teacher/mystudents", // Add link
//             iconType: "image",
//             color: "text-green-600",
//             hoverBg: "hover:bg-green-50"
//         },
//         {
//             title: "Attendance",
//             icon: attendance,
//             alt: "attendance",
//             link: "/teacher/attendance",  // Add link
//             iconType: "image",
//             color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//         },
//         {
//             title: "Exams",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/exams", // Add link
//             iconType: "component",
//             color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//         },
//           {
//             title: "Admit Card",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/admitcard", // Add link
//              iconType: "component",
//             color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//         },
//           {
//             title: "Marks",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//               link: "/teacher/allotmaks", // Add link
//               iconType: "component",
//             color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//         },
//           {
//             title: "Report Card",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//               link: "/teacher/reportscard", // Add link
//               iconType: "component",
//             color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//         },
//          {
//             title: "Assignments",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//             link: "/teacher/assignments", // Add link
//               iconType: "component",
//             color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//         },
//         {
//             title: "lectures",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//              link: "/teacher/lectures", // Add link
//              iconType: "component",
//             color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//         },
//         {
//              title: "Study Material",
//              icon: <PiExamFill className="text-5xl mb-1" />,
//               link: "/teacher/study", // Add link
//              iconType: "component",
//              color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//          },
//          {
//             title: "About",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//              link: "/teacher/AboutTeacher", // Add link
//              iconType: "component",
//              color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//          },
//            {
//             title: "Calendar",
//             icon: <PiExamFill className="text-5xl mb-1" />,
//              link: "/teacher/calendar", // Add link
//               iconType: "component",
//             color: "text-green-600",
//              hoverBg: "hover:bg-green-50"
//          },

//         {
//             title: "Hills",
//             icon: <IoMdApps className="text-5xl mb-1" />,
//             link: "/teacher/hills", // Add link
//             iconType: "component",
//             color: "text-indigo-500",
//             hoverBg: "hover:bg-indigo-50"
//         },
//          {
//             title: "Beach",
//             icon: <i className="far fa-umbrella-beach text-3xl mb-1"></i>,
//             link: "/teacher/beach",
//             iconType: "component",
//             color: "text-pink-500",
//               hoverBg: "hover:bg-pink-50"
//           },
//         {
//             title: "Hotel",
//             icon: <i className="far fa-hotel text-3xl mb-1"></i>,
//             link: "/teacher/hotel",
//             iconType: "component",
//             color: "text-green-600",
//               hoverBg: "hover:bg-green-50"
//         },
//          {
//             title: "Bus",
//             icon: <i className="far fa-bus text-3xl mb-1"></i>,
//              link: "/teacher/bus",
//              iconType: "component",
//             color: "text-yellow-600",
//             hoverBg: "hover:bg-yellow-50"
//         },
//     ];
//     const handleClick = (link) => {
//         navigate(link);
//     };


//     return (
//         <div className="p-4">
//             <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//                 {menuItems.map((item, index) => (
//                     <motion.button
//                         key={index}
//                         variants={buttonVariants}
//                         whileHover="hover"
//                         whileTap="tap"
//                         initial="initial"
//                         className={`flex flex-col items-center justify-center rounded-2xl  shadow-md cursor-pointer p-2 bg-white transition-all duration-300 transform-gpu ${item.color} ${item.hoverBg}`}
//                          onClick={() => handleClick(item.link)}
//                     >
//                        {item.iconType === "image" ? (
//                          <img src={item.icon} alt={item.alt} className="h-10 w-10 mb-1" />
//                         ) : (
//                          item.icon
//                            )}

//                         <p className="text-sm">{item.title}</p>
//                     </motion.button>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default Mobile;




// import React from "react";
// import student from "../../Icone/icons8-student-48.png";
// import attendance from "../../Icone/icons8-attendance-45.png";
// import { IoMdApps } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import { motion } from "framer-motion"; // Import framer-motion for animations

// const Mobile = () => {
//     const buttonVariants = {
//         hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//         tap: { scale: 0.95 },
//         initial: { scale: 1 },
//       };

//     return (
//         <div className="p-4">
//         <div className="grid grid-cols-3 gap-4 sm:grid-cols-4 mx-auto w-full max-w-md">
//             {/* The rest of your items */}
//             <motion.button
//              link="/teacher/exams"
//               variants={buttonVariants}
//               whileHover="hover"
//               whileTap="tap"
//               initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <img src={student} alt="student" className="h-10 w-10 mb-1" />
//                 <p className="text-sm">Student</p>
//             </motion.button>
//             <motion.button
//               variants={buttonVariants}
//               whileHover="hover"
//               whileTap="tap"
//               initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <img src={attendance} alt="student" className="h-10 w-10 mb-1" />
//                 <p className="text-sm">Attendance</p>
//             </motion.button>
//             <motion.button
//                variants={buttonVariants}
//                whileHover="hover"
//                whileTap="tap"
//                initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <PiExamFill className="text-5xl mb-1" />
//                 <p className="text-sm">Exams</p>
//             </motion.button>
//             <motion.button
//               variants={buttonVariants}
//               whileHover="hover"
//               whileTap="tap"
//               initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <PiExamFill className="text-5xl mb-1" />
//                 <p className="text-sm">Admit Card</p>
//             </motion.button>
//             <motion.button
//                 variants={buttonVariants}
//                 whileHover="hover"
//                 whileTap="tap"
//                 initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <PiExamFill className="text-5xl mb-1" />
//                 <p className="text-sm">Marks</p>
//             </motion.button>
//             <motion.button
//                  variants={buttonVariants}
//                  whileHover="hover"
//                  whileTap="tap"
//                  initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <PiExamFill className="text-5xl mb-1" />
//                 <p className="text-sm">Report Card</p>
//             </motion.button>
//             <motion.button
//                 variants={buttonVariants}
//                 whileHover="hover"
//                 whileTap="tap"
//                 initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <PiExamFill className="text-5xl mb-1" />
//                 <p className="text-sm">Assignments</p>
//             </motion.button>
//             <motion.button
//                  variants={buttonVariants}
//                  whileHover="hover"
//                  whileTap="tap"
//                  initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <PiExamFill className="text-5xl mb-1" />
//                 <p className="text-sm">lectures</p>
//             </motion.button>
//             <motion.button
//                  variants={buttonVariants}
//                  whileHover="hover"
//                  whileTap="tap"
//                  initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <PiExamFill className="text-5xl mb-1" />
//                 <p className="text-sm">Study Material</p>
//             </motion.button>
//             <motion.button
//                 variants={buttonVariants}
//                 whileHover="hover"
//                 whileTap="tap"
//                 initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <PiExamFill className="text-5xl mb-1" />
//                 <p className="text-sm">About</p>
//             </motion.button>
//             <motion.button
//                  variants={buttonVariants}
//                  whileHover="hover"
//                  whileTap="tap"
//                  initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <PiExamFill className="text-5xl mb-1" />
//                 <p className="text-sm">Calendar</p>
//             </motion.button>

//             <motion.button
//               variants={buttonVariants}
//               whileHover="hover"
//               whileTap="tap"
//               initial="initial"
//                 className="flex flex-col items-center justify-center  rounded-2xl text-indigo-500 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-indigo-50 transform-gpu"
//             >
//                 <IoMdApps className="text-5xl mb-1" />
//                 <p className="text-sm">Hills</p>
//             </motion.button>
//              <motion.button
//                  variants={buttonVariants}
//                  whileHover="hover"
//                  whileTap="tap"
//                  initial="initial"
//                  className="flex flex-col items-center justify-center  rounded-2xl text-pink-500 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-pink-50 transform-gpu"
//             >
//                 <i className="far fa-umbrella-beach text-3xl mb-1"></i>
//                 <p className="text-sm">Beach</p>
//             </motion.button>
//             <motion.button
//                 variants={buttonVariants}
//                 whileHover="hover"
//                 whileTap="tap"
//                 initial="initial"
//                  className="flex flex-col items-center justify-center  rounded-2xl text-green-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//             >
//                 <i className="far fa-hotel text-3xl mb-1"></i>
//                 <p className="text-sm">Hotel</p>
//             </motion.button>
//             <motion.button
//                 variants={buttonVariants}
//                 whileHover="hover"
//                 whileTap="tap"
//                 initial="initial"
//                  className="flex flex-col items-center justify-center  rounded-2xl text-yellow-600 shadow-md cursor-pointer p-2 bg-white transition-all duration-300 hover:bg-yellow-50 transform-gpu"
//             >
//                 <i className="far fa-bus text-3xl mb-1"></i>
//                 <p className="text-sm">Bus</p>
//             </motion.button>
//         </div>
//     </div>
//     );
// };

// export default Mobile;


// import React from "react";
// import student from "../../Icone/icons8-student-48.png";
// import attendance from "../../Icone/icons8-attendance-45.png";
// import { IoMdApps } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// import { motion } from "framer-motion"; // Import framer-motion for animations

// const Mobile = () => {
//   const buttonVariants = {
//     hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
//     tap: { scale: 0.95 },
//     initial: { scale: 1 },
//   };

//   return (
//     <div className="p-3">
//       <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 mx-auto w-full">
//         {/* The rest of your items */}
//         <motion.button
//           variants={buttonVariants}
//           whileHover="hover"
//           whileTap="tap"
//           initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <img src={student} alt="student" className="h-10 w-10"/>
//           <p className="text-sm mt-1">Student</p>
//         </motion.button>
//         <motion.button
//           variants={buttonVariants}
//           whileHover="hover"
//           whileTap="tap"
//           initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <img src={attendance} alt="student" className="h-10 w-10"/>
//           <p className="text-sm mt-1">Attendance</p>
//         </motion.button>
//         <motion.button
//            variants={buttonVariants}
//            whileHover="hover"
//            whileTap="tap"
//            initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <PiExamFill className="text-5xl" />
//           <p className="text-sm mt-1">Exams</p>
//         </motion.button>
//         <motion.button
//           variants={buttonVariants}
//           whileHover="hover"
//           whileTap="tap"
//           initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <PiExamFill className="text-5xl" />
//           <p className="text-sm mt-1">Admit Card</p>
//         </motion.button>
//         <motion.button
//           variants={buttonVariants}
//           whileHover="hover"
//           whileTap="tap"
//           initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <PiExamFill className="text-5xl" />
//           <p className="text-sm mt-1">Marks</p>
//         </motion.button>
//         <motion.button
//            variants={buttonVariants}
//            whileHover="hover"
//            whileTap="tap"
//            initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <PiExamFill className="text-5xl" />
//           <p className="text-sm mt-1">Report Card</p>
//         </motion.button>
//         <motion.button
//            variants={buttonVariants}
//            whileHover="hover"
//            whileTap="tap"
//            initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <PiExamFill className="text-5xl" />
//           <p className="text-sm mt-1">Assignments</p>
//         </motion.button>
//         <motion.button
//            variants={buttonVariants}
//            whileHover="hover"
//            whileTap="tap"
//            initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <PiExamFill className="text-5xl" />
//           <p className="text-sm mt-1">lectures</p>
//         </motion.button>
//         <motion.button
//             variants={buttonVariants}
//             whileHover="hover"
//             whileTap="tap"
//             initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <PiExamFill className="text-5xl" />
//           <p className="text-sm mt-1">Study Material</p>
//         </motion.button>
//         <motion.button
//             variants={buttonVariants}
//             whileHover="hover"
//             whileTap="tap"
//             initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <PiExamFill className="text-5xl" />
//           <p className="text-sm mt-1">About</p>
//         </motion.button>
//         <motion.button
//             variants={buttonVariants}
//             whileHover="hover"
//             whileTap="tap"
//             initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <PiExamFill className="text-5xl" />
//           <p className="text-sm mt-1">Calendar</p>
//         </motion.button>

//         <motion.button
//           variants={buttonVariants}
//           whileHover="hover"
//           whileTap="tap"
//           initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-indigo-500 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-indigo-50 transform-gpu"
//         >
//           <IoMdApps className="text-5xl" />
//           <p className="text-sm mt-1">Hills</p>
//         </motion.button>
//          <motion.button
//             variants={buttonVariants}
//             whileHover="hover"
//             whileTap="tap"
//             initial="initial"
//            className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-pink-500 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-pink-50 transform-gpu"
//         >
//           <i className="far fa-umbrella-beach text-3xl"></i>
//           <p className="text-sm mt-1">Beach</p>
//         </motion.button>
//         <motion.button
//             variants={buttonVariants}
//             whileHover="hover"
//             whileTap="tap"
//             initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-green-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-green-50 transform-gpu"
//         >
//           <i className="far fa-hotel text-3xl"></i>
//           <p className="text-sm mt-1">Hotel</p>
//         </motion.button>
//         <motion.button
//             variants={buttonVariants}
//             whileHover="hover"
//             whileTap="tap"
//             initial="initial"
//           className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl text-yellow-600 shadow-md cursor-pointer mb-2 p-1 bg-white transition-all duration-300 hover:bg-yellow-50 transform-gpu"
//         >
//           <i className="far fa-bus text-3xl"></i>
//           <p className="text-sm mt-1">Bus</p>
//         </motion.button>
//       </div>
//     </div>
//   );
// };

// export default Mobile;


// import React from "react";
// import student from "../../Icone/icons8-student-48.png";
// import attendance from "../../Icone/icons8-attendance-45.png";
// import exam from "../../Icone/exams.png";
// import { IoMdApps } from "react-icons/io";
// import { PiExamFill } from "react-icons/pi";
// const Mobile = () => {
//   return (
//     <div className="p-3">
//       <div className="grid grid-cols-3 gap-1 sm:grid-cols-4 mx-auto w-full">
//         {/* The rest of your items */}
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <img src={student} alt="student" />
//           <p className="text-sm mt-1">Student</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <img src={attendance} alt="student" />
//           <p className="text-sm mt-1">Attendance</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           {/* <img src={exam} alt="student" /> */}
//           <PiExamFill className="text-5xl"/>
//           <p className="text-sm mt-1">Exams</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <PiExamFill className="text-5xl"/>
//           <p className="text-sm mt-1">Admit Card</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <PiExamFill className="text-5xl"/>
//           <p className="text-sm mt-1">Marks</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <PiExamFill className="text-5xl"/>
//           <p className="text-sm mt-1">Report Card</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <PiExamFill className="text-5xl"/>
//           <p className="text-sm mt-1">Assignments</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <PiExamFill className="text-5xl"/>
//           <p className="text-sm mt-1">lectures</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <PiExamFill className="text-5xl"/>
//           <p className="text-sm mt-1">Study Material</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <PiExamFill className="text-5xl"/>
//           <p className="text-sm mt-1">About</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <PiExamFill className="text-5xl"/>
//           <p className="text-sm mt-1">Calendar</p>
//         </button>
       
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-indigo-200  rounded-2xl  text-indigo-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           {/* <i className="far fa-mountains"></i> */}
//           <IoMdApps className="text-5xl"/>
//           <p className="text-sm mt-1">Hills</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-pink-200   rounded-2xl text-pink-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <i className="far fa-umbrella-beach"></i>
//           <p className="text-sm mt-1">Beach</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <i className="far fa-hotel"></i>
//           <p className="text-sm mt-1">Hotel</p>
//         </button>
//         <button className="flex flex-col items-center justify-center w-20  h-20  bg-yellow-200 rounded-2xl text-yellow-600  shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//           <i className="far fa-bus"></i>
//           <p className="text-sm mt-1">Bus</p>
//         </button>

//       </div>
//     </div>
//   );
// };

// export default Mobile;

// import React from 'react'

// const Mobile = () => {
//   return (
// <div className='p-5'>
// <div class="grid grid-cols-3 mx-auto w-full">
// {/* <div class="flex items-center flex-col justify-between overflow-y-scroll text-gray-500 cursor-pointer space-x-3"> */}
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-hotel"></i>
//         <p class="text-sm mt-1">Hotel</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-yellow-200 rounded-2xl text-yellow-600  shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-bus"></i>
//         <p class="text-sm mt-1">Bus</p>
//     </div>

//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-indigo-200  rounded-2xl  text-indigo-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-mountains"></i>
//         <p class="text-sm mt-1">Hills</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-pink-200   rounded-2xl text-pink-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-umbrella-beach"></i>
//         <p class="text-sm mt-1">Beach</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-hotel"></i>
//         <p class="text-sm mt-1">Hotel</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-yellow-200 rounded-2xl text-yellow-600  shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-bus"></i>
//         <p class="text-sm mt-1">Bus</p>
//     </div>

//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-indigo-200  rounded-2xl  text-indigo-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-mountains"></i>
//         <p class="text-sm mt-1">Hills</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-pink-200   rounded-2xl text-pink-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-umbrella-beach"></i>
//         <p class="text-sm mt-1">Beach</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-hotel"></i>
//         <p class="text-sm mt-1">Hotel</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-yellow-200 rounded-2xl text-yellow-600  shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-bus"></i>
//         <p class="text-sm mt-1">Bus</p>
//     </div>

//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-indigo-200  rounded-2xl  text-indigo-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-mountains"></i>
//         <p class="text-sm mt-1">Hills</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-pink-200   rounded-2xl text-pink-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-umbrella-beach"></i>
//         <p class="text-sm mt-1">Beach</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-hotel"></i>
//         <p class="text-sm mt-1">Hotel</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-yellow-200 rounded-2xl text-yellow-600  shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-bus"></i>
//         <p class="text-sm mt-1">Bus</p>
//     </div>

//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-indigo-200  rounded-2xl  text-indigo-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-mountains"></i>
//         <p class="text-sm mt-1">Hills</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-pink-200   rounded-2xl text-pink-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-umbrella-beach"></i>
//         <p class="text-sm mt-1">Beach</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-green-200 rounded-2xl text-green-600 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-hotel"></i>
//         <p class="text-sm mt-1">Hotel</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-yellow-200 rounded-2xl text-yellow-600  shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-bus"></i>
//         <p class="text-sm mt-1">Bus</p>
//     </div>

//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-indigo-200  rounded-2xl  text-indigo-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-mountains"></i>
//         <p class="text-sm mt-1">Hills</p>
//     </div>
//     <div
//         class="flex flex-col items-center justify-center w-20  h-20  bg-pink-200   rounded-2xl text-pink-500 shadow hover:shadow-md cursor-pointer mb-2 p-1 bg-white transition ease-in duration-300">
//         <i class="far fa-umbrella-beach"></i>
//         <p class="text-sm mt-1">Beach</p>
//     </div>
// </div>
// </div>
//   )
// }

// export default Mobile
