import React, { useEffect } from "react";

import { useStateContext } from "../contexts/ContextProvider";
import Home from "./Home";

const ThirdPartyDashboard = () => {

  const {
    setCurrentColor,
    setCurrentMode,
    currentMode,
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
      {userRole === "thirdparty" && ( // Use userRole
        <>
         <Home/>       
        </>
      )}
    </div>
  );
};

export default ThirdPartyDashboard;


