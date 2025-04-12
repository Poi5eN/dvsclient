import React, { useEffect } from "react";
import { AiOutlineMenu } from "react-icons/ai";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { useStateContext } from "../contexts/ContextProvider";
import { FiSettings } from "react-icons/fi";
import "./style.css";
import { VscSymbolColor } from "react-icons/vsc";
import { MdFullscreen, MdFullscreenExit, MdLogout } from "react-icons/md";
// import logo from "../../src/ShikshMitraWebsite/white logo.jpg"; // Verify path
// import logo from "../../src/ShikshMitraWebsite/digitalvidya.png"; // Verify path
// import logo from "../../src/ShikshMitraWebsite/DIGITALVIDYASAARTHI LOGO.png"; // Verify path
import logo from "../../src/ShikshMitraWebsite/DIGITALV-removebg-preview.png"; // Verify path
// import logo from "../../src/ShikshMitraWebsite/digital.png"; // Verify path
import { Link } from "react-router-dom";

const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
  <TooltipComponent 
  // content={title} 
  position="BottomCenter">
    <button
      type="button"
      onClick={customFunc}
      style={{ color }}
      className="relative text-xl rounded-full p-3 hover:bg-light-gray"
    >
      {dotColor && (
        <span
          style={{ background: dotColor }}
          className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2 text-white"
        />
      )}
      {icon}
    </button>
  </TooltipComponent>
);

const Navbar = () => {
  // Extracting from Context
  const {
    currentColor,
    setActiveMenu,
    handleClick,
    setScreenSize,
    screenSize,
    isFullScreen,
    setIsFullScreen,
    themeSettings, setThemeSettings,
  } = useStateContext();
  // const { currentMode, activeMenu, currentColor, themeSettings, setThemeSettings, isLoggedIn, setIsLoggedIn } = useStateContext()
  const user = JSON.parse(localStorage.getItem("user"))
  const session = JSON.parse(localStorage.getItem("session"))
  // State for User Info
  // const [user, setUser] = useState({});
  const fullName = user?.fullName || "User";
  const image = user?.image?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s";

  useEffect(() => {
    const handleResize = () => setScreenSize(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize on mount

    return () => window.removeEventListener("resize", handleResize);
  }, [setScreenSize]);

  // Handle active menu visibility based on screen size
  useEffect(() => {
    setActiveMenu(screenSize > 900);
  }, [screenSize, setActiveMenu]);

  // Toggle Fullscreen Mode
  const toggleFullScreen = () => {
    if (!isFullScreen) {
      const element = document.documentElement; // Full screen for entire app
      if (element.requestFullscreen) element.requestFullscreen();
      else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
      else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
      else if (element.msRequestFullscreen) element.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };

  // Handle Logout Function
  const handleLogout = () => {
    localStorage.clear();
    setTimeout(() => (window.location.href = "/login"), 100); // Ensure navigation after storage is cleared
  };
  let dashboardPath = "/";

  return (
    <div className="flex justify-between items-center relative  dark:bg-main-dark-bg shadow-xl"
    style={{background:currentColor}}
    >
      {/* Left: Menu Button */}
      <div className="flex items-center">
        {/* <NavButton
          // title="Menu"
          customFunc={() => setActiveMenu((prev) => !prev)}
          color={currentColor}
          icon={<AiOutlineMenu className="text-white" />}
        /> */}
         <Link to={dashboardPath} 
        //  onClick={closeAllMenus}
          className="flex items-center gap-2 flex-shrink-0 ml-2">
           <img src={logo} alt="logo" className="h-8 object-contain " />
         </Link>
      </div>

      {/* Center: School Name */}
      <div className="flex-1 text-center dark:text-white">
        <p
          className="text-[10px] md:text-[16px] font-semibold hidden md:block"
          style={{ color: "white" }}
        >
          {user?.schoolName } ( {session } )
        </p>
        {/* <span
          className="text-[10px] md:text-[10px] text-[#f15b25] font-semibold block"
          style={{ color: "white" }}
        >
          {session }
        </span> */}
      </div>


      <div className="flex items-center gap-2">
       
        <div
        
        >
         
              <button
                type="button"
                onClick={() => setThemeSettings(true)}
                style={{ background: currentColor,  }}
                className="h-4 w-4 mr-1 flex justify-center items-center hover:drop-shadow-xl hover:bg-light-gray"
              > <span 
                // style={{background:currentColor,}}
                >
                  <VscSymbolColor className="text-[25px] text-white"/>
                </span>
              </button>
            
            {/* </TooltipComponent> */}
        </div>
        <div
          onClick={handleLogout}
          className="cursor-pointer text-white"
          title="Logout"
        >
          <MdLogout className="text-2xl font-bold" />
        </div>

        {/* Fullscreen Toggle */}
        <button onClick={toggleFullScreen} className="" style={{ color: currentColor }}>
          {isFullScreen ? (
            <MdFullscreenExit
              className="text-[30px] text-white"
              title="Exit Fullscreen"
            />
          ) : (
            <MdFullscreen
              className="text-[30px] text-white"
              title="Enter Fullscreen"
            />
          )}
        </button>
        <TooltipComponent
          position="BottomCenter">
          <div
            className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-800"
            onClick={() => handleClick("userProfile")}
          >
            <img
              className="rounded-full w-[25px] h-[25px]"
              src={image}
              alt="user-profile"
            />
            <p className="text-white font-semibold text-[16px] hidden md:block mr-2">
              {fullName}
            </p>
          </div>
        </TooltipComponent>
      </div>
    </div>
  );
};

export default Navbar;
// import React, { useEffect } from "react";
// import { AiOutlineMenu } from "react-icons/ai";
// import { TooltipComponent } from "@syncfusion/ej2-react-popups";
// import { useStateContext } from "../contexts/ContextProvider";
// import { FiSettings } from "react-icons/fi";
// import "./style.css";
// import { VscSymbolColor } from "react-icons/vsc";
// import { MdFullscreen, MdFullscreenExit, MdLogout } from "react-icons/md";

// const NavButton = ({ title, customFunc, icon, color, dotColor }) => (
//   <TooltipComponent 
//   // content={title} 
//   position="BottomCenter">
//     <button
//       type="button"
//       onClick={customFunc}
//       style={{ color }}
//       className="relative text-xl rounded-full p-3 hover:bg-light-gray"
//     >
//       {dotColor && (
//         <span
//           style={{ background: dotColor }}
//           className="absolute inline-flex rounded-full h-2 w-2 right-2 top-2 text-white"
//         />
//       )}
//       {icon}
//     </button>
//   </TooltipComponent>
// );

// const Navbar = () => {
//   // Extracting from Context
//   const {
//     currentColor,
//     setActiveMenu,
//     handleClick,
//     setScreenSize,
//     screenSize,
//     isFullScreen,
//     setIsFullScreen,
//     themeSettings, setThemeSettings,
//   } = useStateContext();
//   // const { currentMode, activeMenu, currentColor, themeSettings, setThemeSettings, isLoggedIn, setIsLoggedIn } = useStateContext()
//   const user = JSON.parse(localStorage.getItem("user"))
//   const session = JSON.parse(localStorage.getItem("session"))
//   // State for User Info
//   // const [user, setUser] = useState({});
//   const fullName = user?.fullName || "User";
//   const image = user?.image?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s";

//   useEffect(() => {
//     const handleResize = () => setScreenSize(window.innerWidth);
//     window.addEventListener("resize", handleResize);
//     handleResize(); // Initialize on mount

//     return () => window.removeEventListener("resize", handleResize);
//   }, [setScreenSize]);

//   // Handle active menu visibility based on screen size
//   useEffect(() => {
//     setActiveMenu(screenSize > 900);
//   }, [screenSize, setActiveMenu]);

//   // Toggle Fullscreen Mode
//   const toggleFullScreen = () => {
//     if (!isFullScreen) {
//       const element = document.documentElement; // Full screen for entire app
//       if (element.requestFullscreen) element.requestFullscreen();
//       else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
//       else if (element.mozRequestFullScreen) element.mozRequestFullScreen();
//       else if (element.msRequestFullscreen) element.msRequestFullscreen();
//     } else {
//       if (document.exitFullscreen) document.exitFullscreen();
//       else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
//       else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
//       else if (document.msExitFullscreen) document.msExitFullscreen();
//     }
//     setIsFullScreen(!isFullScreen);
//   };

//   // Handle Logout Function
//   const handleLogout = () => {
//     localStorage.clear();
//     setTimeout(() => (window.location.href = "/login"), 100); // Ensure navigation after storage is cleared
//   };


//   return (
//     <div className="flex justify-between items-center relative  dark:bg-main-dark-bg shadow-xl"
//     style={{background:currentColor}}
//     >
//       {/* Left: Menu Button */}
//       <div className="flex items-center">
//         <NavButton
//           // title="Menu"
//           customFunc={() => setActiveMenu((prev) => !prev)}
//           color={currentColor}
//           icon={<AiOutlineMenu className="text-white" />}
//         />
//       </div>

//       {/* Center: School Name */}
//       <div className="flex-1 text-center dark:text-white">
//         <span
//           className="text-[10px] md:text-[16px] font-semibold block"
//           style={{ color: "white" }}
//         >
//           {user?.schoolName }
//         </span>
//         <span
//           className="text-[10px] md:text-[10px] text-[#f15b25] font-semibold block"
//           style={{ color: "white" }}
//         >
//           {session }
//         </span>
//       </div>

//       {/* Right: Fullscreen, Logout, Profile */}
//       <div className="flex items-center gap-2">
//         {/* Logout Button */}
//         <div
//           // onClick={handleLogout}
//           // className="cursor-pointer text-white"
//           // title="Logout"
//         >
//           {/* <MdLogout className="text-2xl font-bold" /> */}
//           {/* <TooltipComponent content="Settings" position="Top"> */}
//               <button
//                 type="button"
//                 onClick={() => setThemeSettings(true)}
//                 style={{ background: currentColor,  }}
//                 className="h-4 w-4 mr-1 flex justify-center items-center hover:drop-shadow-xl hover:bg-light-gray"
//               >
//                 {/* <FiSettings /> */}
//                 <span 
//                 // style={{background:currentColor,}}
//                 >
//                   <VscSymbolColor className="text-[25px] text-white"/>
//                 </span>
//               </button>
            
//             {/* </TooltipComponent> */}
//         </div>
//         <div
//           onClick={handleLogout}
//           className="cursor-pointer text-white"
//           title="Logout"
//         >
//           <MdLogout className="text-2xl font-bold" />
//         </div>

//         {/* Fullscreen Toggle */}
//         <button onClick={toggleFullScreen} className="py-2" style={{ color: currentColor }}>
//           {isFullScreen ? (
//             <MdFullscreenExit
//               className="text-[30px] text-white"
//               title="Exit Fullscreen"
//             />
//           ) : (
//             <MdFullscreen
//               className="text-[30px] text-white"
//               title="Enter Fullscreen"
//             />
//           )}
//         </button>

//         {/* User Profile */}
//         <TooltipComponent
//         //  content="Profile"
//           position="BottomCenter">
//           <div
//             className="flex items-center gap-2 cursor-pointer dark:hover:bg-gray-800"
//             onClick={() => handleClick("userProfile")}
//           >
//             <img
//               className="rounded-full w-[30px] h-[30px]"
//               src={image}
//               alt="user-profile"
//             />
//             <p className="text-white font-semibold text-[16px] hidden md:block mr-2">
//               {fullName}
//             </p>
//           </div>
//         </TooltipComponent>
//       </div>
//     </div>
//   );
// };

// export default Navbar;
