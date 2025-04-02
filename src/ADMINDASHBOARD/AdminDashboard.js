import { useStateContext } from "../contexts/ContextProvider";
import { Navbar, Sidebar, ThemeSettings } from "../components";
import { Outlet, useNavigate } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";

const AdminDashboard = () => {
  const { currentMode, activeMenu, currentColor, themeSettings, setThemeSettings, isLoggedIn, setIsLoggedIn } = useStateContext();
    return (
      
        <div className={currentMode === "Dark" ? "dark" : ""}>
        <div className="flex relative dark:bg-main-dark-bg bg-white">
          {/* <div className="fixed right-4 bottom-4" style={{ zIndex: "1000" }}>
            <TooltipComponent content="Settings" position="Top">
              <button
                type="button"
                onClick={() => setThemeSettings(true)}
                style={{ background: currentColor, borderRadius: "50%" }}
                className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
              >
                <FiSettings />
              </button>
            </TooltipComponent>
          </div> */}
  
          {activeMenu && (
            <div className="w-56 fixed sidebar dark:bg-main-dark-bg bg-white "
            style={{zIndex:"99999999"}}
            >
              <Sidebar />
            </div>
          )}
  
          <div className={activeMenu ? "dark:bg-main-dark-bg md:ml-56 w-full overflow-x-hidden ]" : "dark:bg-main-dark-bg w-full flex-2"}>
            <Navbar />
            <div>{themeSettings && <ThemeSettings />}</div>
            <Outlet /> {/* ✅ Ensures child routes load */}
          </div>
        </div>
      </div>
    );
};

export default AdminDashboard;



// import React, { useEffect, useState } from "react";
// import { Routes, Route, Outlet } from "react-router-dom";
// import { FiSettings } from "react-icons/fi";
// import { TooltipComponent } from "@syncfusion/ej2-react-popups";

// import { Navbar, Footer, Sidebar, ThemeSettings } from "../components";
// import "../App.css";
// import { useStateContext } from "../contexts/ContextProvider";


// const AdminDashboard = () => {
//   const [schoolInfo, setSchoolInfo] = useState({
//     schoolName: "",
//     role: "",
//     schoolImage: "",
//   });
//   const {
    
//     currentMode,
//     activeMenu,
//     currentColor,
//     themeSettings,
//     setThemeSettings,
//     isLoggedIn,
//     setisLoggedIn,
//   } = useStateContext();

//   const [singleLog, setSingleLog] = useState(
//     sessionStorage.getItem("userRole")
//   );

//   useEffect(() => {
//     if (singleLog === "admin") {
//       setisLoggedIn(true);
//     }
//   }, [singleLog, setisLoggedIn]);

//   return (
//     <div className={currentMode === "Dark" ? "dark" : ""}>
//       {isLoggedIn && (isLoggedIn === "admin" || singleLog === "admin") && (
//         <>
//           <div className="flex relative dark:bg-main-dark-bg  bg-white">
//             <div className="fixed right-4 bottom-4 " style={{ zIndex: "1000" }}>
//               <TooltipComponent content="Settings" position="Top">
//                 <button
//                   type="button"
//                   onClick={() => setThemeSettings(true)}
//                   style={{ background: currentColor, borderRadius: "50%" }}
//                   className="text-3xl text-white p-3 hover:drop-shadow-xl hover:bg-light-gray"
//                 >
//                   <FiSettings />
//                 </button>
//               </TooltipComponent>
//             </div>
//             {activeMenu ? (
//               <div className="w-56 fixed sidebar dark:bg-main-dark-bg bg-white">
//               {/* <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white"> */}
//                 <Sidebar />
//               </div>
//             ) : (
//               <div className="w-0 dark:bg-secondary-dark-bg">
//                 <Sidebar />
//               </div>
//             )}
//             <div
//               // className={
//               //   activeMenu
//               //     ? "dark:bg-main-dark-bg md:ml-72 w-full overflow-x-hidden bg-[#fafbfb]"
//               //     : "dark:bg-main-dark-bg w-full  flex-2 overflow-x-hidden bg-[#fafbfb]"
//               // }
//               className={
//                 activeMenu
//                   ? "dark:bg-main-dark-bg  md:ml-56 w-full overflow-x-hidden"
//                   // ? "dark:bg-main-dark-bg  md:ml-72 w-full  bg-[#fafbfb]"
//                   : // ? "dark:bg-main-dark-bg min-h-screen md:ml-72 w-full overflow-x-hidden bg-[#fafbfb]"
//                     "dark:bg-main-dark-bg w-full  flex-2  bg-[#fafbfb]"
//                     // "dark:bg-main-dark-bg w-full  flex-2 overflow-x-hidden bg-[#fafbfb]"
//                 // : "dark:bg-main-dark-bg w-full min-h-screen flex-2 overflow-x-hidden bg-[#fafbfb]"
//               }
//             >
//               <div
//               //  className="fixed md:static   dark:bg-main-dark-bg navbar w-full "
//                >
//                 {/* <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full "> */}
//                 <Navbar />
//               </div>
//               <div>{themeSettings && <ThemeSettings />}</div>
//               {/* <div className=" "> */}
//                 <div 
//                 // className="mt-12 md:mt-0"
//                 >
//                 {/* <div className="mt-24  md:mt-1"> */}
//                 <Outlet />
//               </div>
//               {/* <Footer /> */}
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default AdminDashboard;
