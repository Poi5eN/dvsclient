import { useStateContext } from "../contexts/ContextProvider";
import { Navbar, Sidebar, ThemeSettings } from "../components";
import { Outlet } from "react-router-dom";
import { FiSettings } from "react-icons/fi";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import Topbar from "../components/Topbar";
import "../../src/App.css";
const ThirdPartyDashboard = () => {
  const {
    currentMode,
    activeMenu,
    currentColor,
    themeSettings,
    setThemeSettings,
    isLoggedIn,
    setIsLoggedIn,
  } = useStateContext();

  return (
    <div className={currentMode === "Dark" ? "dark" : ""}>
      <div className="flex relative dark:bg-main-dark-bg bg-white h-screen">
        {/* {activeMenu && (
          <div
            className="w-56 fixed sidebar dark:bg-main-dark-bg bg-white"
            style={{ zIndex: "99999999" }}
          >
            <Sidebar />
          </div>
        )} */}

        <div
          className={
            activeMenu
              ? "dark:bg-main-dark-bg w-full overflow-x-hidden"
              // ? "dark:bg-main-dark-bg md:ml-56 w-full overflow-x-hidden"
              : "dark:bg-main-dark-bg w-full flex-2"
          }
        >
          {/* Fixed Navbar */}
          <div className="fixed top-0 w-full z-50 ">
            <Navbar />
            <Topbar/>
          </div>

          {/* Padding to push content below the fixed navbar */}
          <div className="mt-[75px] px-1">
            {themeSettings && <ThemeSettings />}
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThirdPartyDashboard;





// import React, { useEffect } from "react";

// import { useStateContext } from "../contexts/ContextProvider";
// import Home from "./Home";

// const ThirdPartyDashboard = () => {

//   const {
//     setCurrentColor,
//     setCurrentMode,
//     currentMode,
//     userRole, // Get userRole from context
//   } = useStateContext();

//   useEffect(() => {
//     const currentThemeColor = sessionStorage.getItem("colorMode");
//     const currentThemeMode = sessionStorage.getItem("themeMode");
//     if (currentThemeColor && currentThemeMode) {
//       setCurrentColor(currentThemeColor);
//       setCurrentMode(currentThemeMode);
//     }
//   }, []);


//   return (
//     <div className={currentMode === "Dark" ? "dark" : ""}>
//       {userRole === "thirdparty" && ( // Use userRole
//         <>
//          <Home/>       
//         </>
//       )}
//     </div>
//   );
// };

// export default ThirdPartyDashboard;


