import React, { useState, useEffect } from "react";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import {
  Routes,
  Route,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { Navbar, Footer, Sidebar, ThemeSettings } from "../components";
import ".././App.css";

import { useStateContext } from "../contexts/ContextProvider";
import { Studentlinks } from "../data/dummy";

const StudentDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    setCurrentColor,
    setCurrentMode,
    currentMode,
    activeMenu,
    currentColor,
    themeSettings,
    setThemeSettings,
    userRole, // Get userRole from context
  } = useStateContext();


  useEffect(() => {
    const currentThemeColor = sessionStorage.getItem("colorMode");
    const currentThemeMode = sessionStorage.getItem("themeMode");
    if (currentThemeColor && currentThemeMode) {
      setCurrentColor(currentThemeColor);
      setCurrentMode(currentThemeMode);
    }
  }, []);


  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      {userRole === "student" && ( // Use userRole
        <>
          <div className="flex relative dark:bg-main-dark-bg">
            <div className="fixed right-4 bottom-4" style={{ zIndex: "1000" }}>
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
            </div>
            {activeMenu ? (
              <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white "
              style={{zIndex:"99999999"}}
              >
                <Sidebar 

              
                /> 
              </div>
            ) : (
              <div className="w-0 dark:bg-secondary-dark-bg"
              style={{zIndex:"99999999"}}
              >
                <Sidebar 
                
               
                /> 
              </div>
            )}
            <div
              className={
                activeMenu
                  ? "dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  "
                  : "bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 "
              }
            >
              <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
                <Navbar />
              </div>
              <div>
                {themeSettings && <ThemeSettings />}
                <Outlet />
              </div>
              <Footer />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default StudentDashboard;



// import React, { useState, useEffect } from "react";
// import { FiSettings } from "react-icons/fi";
// import { TooltipComponent } from "@syncfusion/ej2-react-popups";
// import {
//   Routes,
//   Route,
//   Outlet,
//   useNavigate,
//   useLocation,
// } from "react-router-dom";

// import { Navbar, Footer, Sidebar, ThemeSettings } from "../components";
// import ".././App.css";

// import { useStateContext } from "../contexts/ContextProvider";

// const StudentDashboard = () => {
//   const location = useLocation();
//   const navigate = useNavigate();
//   const {
//     setCurrentColor,
//     setCurrentMode,
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
//     const currentThemeColor = sessionStorage.getItem("colorMode");
//     const currentThemeMode = sessionStorage.getItem("themeMode");
//     if (currentThemeColor && currentThemeMode) {
//       setCurrentColor(currentThemeColor);
//       setCurrentMode(currentThemeMode);
//     }
//   }, []);

//   if (singleLog) {
//     setisLoggedIn(singleLog);
//   }

//   return (
//     <div className={currentMode === "Dark" ? "dark" : ""}>
//       {isLoggedIn == "student" && singleLog == "student" && (
//         <>
//           <div className="flex relative dark:bg-main-dark-bg">
//             <div className="fixed right-4 bottom-4" style={{ zIndex: "1000" }}>
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
//               <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
//                 <Sidebar />
//               </div>
//             ) : (
//               <div className="w-0 dark:bg-secondary-dark-bg">
//                 <Sidebar />
//               </div>
//             )}
//             <div
//               className={
//                 activeMenu
//                   ? "dark:bg-main-dark-bg  bg-main-bg min-h-screen md:ml-72 w-full  "
//                   : "bg-main-bg dark:bg-main-dark-bg  w-full min-h-screen flex-2 "
//               }
//             >
//               <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
//                 <Navbar />
//               </div>
//               <div>
//                 {themeSettings && <ThemeSettings />}
//                 <Outlet />
//               </div>
//               <Footer />
//             </div>
//           </div>
//         </>
//       )}
//     </div>
//   );
// };

// export default StudentDashboard;
