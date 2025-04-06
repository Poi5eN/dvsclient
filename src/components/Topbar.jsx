
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { GiExplosiveMaterials } from "react-icons/gi";
import { MdOutlineCancel } from "react-icons/md"; // Needed again for mobile close
import { AiOutlineMenu, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { links as adminLinks } from "../data/dummy"; // Renamed import
import { Studentlinks } from "../data/dummy";
import { Teacherslinks } from "../data/dummy";
import { Parentslinks } from "../data/dummy";
import { useStateContext } from "../contexts/ContextProvider";
import { BiSolidSchool } from "react-icons/bi";
import logo from "../../src/ShikshMitraWebsite/digitalvidya.png"; // Verify path

// --- Constants ---
const TOPBAR_HEIGHT_APPROX = '65px'; // Adjust if needed

const Topbar = () => {
  // --- State ---
  const { currentColor, activeMenu, setActiveMenu, screenSize, userRole } = useStateContext();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <<< RE-ADDED for mobile drawer
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // Used for BOTH desktop dropdown and mobile accordion
  const [dropdownPosition, setDropdownPosition] = useState(null); // For DESKTOP fixed position

  // --- Refs ---
  const topbarRef = useRef(null);
  const openDropdownRef = useRef(null); // Ref for DESKTOP dropdown

  // --- Hooks ---
  const location = useLocation();

  // --- Role and Link Logic ---
  let linksToDisplay = [];
  let dashboardPath = "/";
  if (userRole === "student") {
    linksToDisplay = Studentlinks[0]?.links || [];
    dashboardPath = "/student";
  } else if (userRole === "teacher") {
    linksToDisplay = Teacherslinks[0]?.links || [];
    dashboardPath = "/teacher";
  } else if (userRole === "parent") {
    linksToDisplay = Parentslinks[0]?.links || [];
    dashboardPath = "/parent";
  } else {
    linksToDisplay = adminLinks;
    dashboardPath = "/admin";
  }

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdownIndex(null);
    setDropdownPosition(null);
  }, [location]);

  // Handle screen resizing
   useEffect(() => {
     // Close desktop dropdown if screen becomes mobile
     if (openDropdownIndex !== null && screenSize <= 900 ) {
       setOpenDropdownIndex(null);
       setDropdownPosition(null);
     }
     // Close mobile drawer if screen becomes desktop
     if (isMobileMenuOpen && screenSize > 900) {
         setIsMobileMenuOpen(false);
     }
   }, [screenSize, openDropdownIndex, isMobileMenuOpen]);

  // Close DESKTOP dropdown on clicking outside
  const handleClickOutside = useCallback((event) => {
    // Close Desktop Dropdown
    if (
      openDropdownRef.current &&
      !openDropdownRef.current.contains(event.target) &&
      !event.target.closest('[data-dropdown-trigger]')
    ) {
      setOpenDropdownIndex(null);
      setDropdownPosition(null);
    }

  }, []); // Removed isMobileMenuOpen dependency for simplicity

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const handleScroll = useCallback(() => {
    if (openDropdownIndex !== null && dropdownPosition !== null && screenSize > 900) {
      // Attempt to reposition based on button's current location
       const triggerButton = topbarRef.current?.querySelector(`[data-dropdown-trigger][data-index="${openDropdownIndex}"]`);
        if (triggerButton) {
            const rect = triggerButton.getBoundingClientRect();
            setDropdownPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
            });
        } else {
            // Fallback: close if button not found
            setOpenDropdownIndex(null);
            setDropdownPosition(null);
        }
    }
  }, [openDropdownIndex, dropdownPosition, screenSize]); // Add screenSize dependency

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, true);
    return () => window.removeEventListener("scroll", handleScroll, true);
  }, [handleScroll]);


  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Close desktop dropdown if mobile menu is opened
    if (!isMobileMenuOpen) {
      setOpenDropdownIndex(null);
      setDropdownPosition(null);
    }
  };

  const handleCloseMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleAdminDropdownToggle = (index, event) => {
    event.stopPropagation(); // Important!

    const currentlyOpen = openDropdownIndex === index;

    if (screenSize > 900) {
      // --- Desktop Logic ---
      if (currentlyOpen) {
        setOpenDropdownIndex(null);
        setDropdownPosition(null);
      } else {
        setOpenDropdownIndex(index);
        const buttonElement = event.currentTarget;
        const rect = buttonElement.getBoundingClientRect();
        setDropdownPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
    } else {
    
      setOpenDropdownIndex(currentlyOpen ? null : index);
      setDropdownPosition(null); // Ensure no fixed position on mobile
    }
  };

  const closeAllMenus = () => {
      setIsMobileMenuOpen(false);
      setOpenDropdownIndex(null);
      setDropdownPosition(null);
  }


  const topbarActiveLink = `flex items-center gap-1 px-2 py-1 rounded-md text-white text-[10px] uppercase font-semibold whitespace-nowrap`;
  const topbarNormalLink = `flex items-center gap-1 px-2 py-1 rounded-md text-[10px] uppercase text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold whitespace-nowrap`;
  const mobileActiveLink = `flex items-center gap-1 pl-4 pr-2 py-2.5 rounded-lg text-white text-md font-semibold`; // Added font-semibold
  const mobileNormalLink = `flex items-center gap-1 pl-4 pr-2 py-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray`;

  const renderTopbarItems = (linkStyleType) => {
    const isMobile = linkStyleType === 'mobile';
    const activeStyle = isMobile ? mobileActiveLink : topbarActiveLink;
    const normalStyle = isMobile ? mobileNormalLink : topbarNormalLink;

    return linksToDisplay.map((item, index) => (
      <div key={item.name || item.title || index} className={`${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
        {item.children ? (
           // --- Item HAS Children ---
           <>
             <button
               data-dropdown-trigger
               data-index={index} // Needed for scroll repositioning
               onClick={(e) => handleAdminDropdownToggle(index, e)}
               className={`${normalStyle} items-center w-full ${isMobile ? 'justify-between' : ''}`}
               style={{backgroundColor: !isMobile && openDropdownIndex === index ? 'rgba(0,0,0,0.05)' : ''}}
             >
               <span className="flex items-center gap-2">
                 {item.icon}
                 {item.name}
               </span>
               {/* Arrow indicates open state */}
               { openDropdownIndex === index ? <AiOutlineUp /> : <AiOutlineDown /> }
             </button>

             {/* --- Mobile Accordion Content (Rendered inline within mobile drawer) --- */}
             {isMobile && openDropdownIndex === index && item.children && (
               <div className="pl-5 border-l-2 border-gray-200 dark:border-gray-600 ml-2 my-1 bg-red-700">
                 <ul>
                   {item.children.map((child) => (
                     <li key={child.name}>
                       <NavLink
                         to={child.link}
                         onClick={closeAllMenus} // Close drawer when child link is clicked
                         style={({ isActive }) => ({
                            backgroundColor: isActive ? currentColor : "",
                            color: isActive ? 'white' : '',
                         })}
                         className={({ isActive }) =>
                           `${isActive ? mobileActiveLink : mobileNormalLink} py-1.5 text-sm pl-2` // Adjust style for sub-items
                         }
                       >
                         {child.icon}
                         <span className="capitalize">{child.name}</span>
                       </NavLink>
                     </li>
                   ))}
                 </ul>
               </div>
             )}
           </>
        ) : (
          // --- Regular Link Item (NO Children) ---
          <NavLink
            to={item.link || `/${item.route}`}
            onClick={closeAllMenus} // Close menus on link click
            style={({ isActive }) => ({
              backgroundColor: isActive ? currentColor : "",
              color: isActive ? 'white': '',
            })}
            className={({ isActive }) => `${isActive ? activeStyle : normalStyle}`}
          >
            {item.icon}
           {item.name}
            {/* <span className="capitalize cursor-pointer">{item.name}</span> */}
          </NavLink>
        )}
      </div>
    ));
  };

  // --- Component Return ---
  return (
    <div ref={topbarRef} className="relative flex justify-between items-center pt-1 bg-white dark:bg-main-dark-bg shadow-md border-b dark:border-gray-700 z-30 print:hidden">


      <div className="flex-1 min-w-0 overflow-hidden mx-2  hidden md:block">
        <nav className={`
            flex items-center gap-1  overflow-x-auto flex-nowrap pb-[2px]
           
        `}>
        {/* <nav className={`
            flex items-center gap-1  overflow-x-auto flex-nowrap pb-[2px]
            scrollbar scrollbar-h-[2px]
            scrollbar-thumb-gray-400 scrollbar-track-gray-100
            dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800
            scrollbar-thumb-rounded-md scrollbar-track-rounded-md
        `}> */}
             {/* Render desktop items ONLY */}
             {renderTopbarItems('desktop')}
        </nav>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
         <div className="md:hidden ml-1 sm:ml-2"> {/* <<< RE-ADDED */}
            <TooltipComponent
            //  content="Navigation"
              position="BottomCenter">
            <button
                type="button"
                onClick={handleMobileMenuToggle} // Toggles the drawer
                style={{ color: currentColor }}
                className="text-xl rounded-full p-3 hover:bg-light-gray dark:hover:bg-gray-600"
            >
               
                {isMobileMenuOpen ? <MdOutlineCancel /> : <AiOutlineMenu /> }
            </button>
            </TooltipComponent>
        </div>
      </div>
      {openDropdownIndex !== null && !isMobileMenuOpen && dropdownPosition && screenSize > 900 && (
         <div
            ref={openDropdownRef}
            className="absolute w-52 bg-white dark:bg-secondary-dark-bg rounded-md shadow-xl z-50 border dark:border-gray-700"
            style={{ position: 'fixed', top: `${70}px`, left: `${dropdownPosition.left}px` }}
            // style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
         >
             {linksToDisplay[openDropdownIndex]?.children && (
                 <ul className="py-1">
                   {linksToDisplay[openDropdownIndex].children.map((child) => (
                     <li key={child.name}>
                       <NavLink
                         to={child.link}
                         onClick={closeAllMenus}
                         style={({ isActive }) => ({ backgroundColor: isActive ? currentColor : "", color: isActive ? 'white': '' })}
                         className={({ isActive }) => `flex items-center gap-3 w-full px-4 py-2 text-sm ${isActive ? 'text-white font-semibold' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black whitespace-nowrap`}
                       >
                         {child.icon}
                         <span className="capitalize">{child.name}</span>
                       </NavLink>
                     </li>
                   ))}
                 </ul>
             )}
         </div>
      )}
      {isMobileMenuOpen && screenSize <= 900 && ( // <<< RE-ADDED
        <div className={`
          absolute top-full left-0 w-full bg-white dark:bg-secondary-dark-bg
          shadow-lg z-40 md:hidden border-t dark:border-gray-700
          overflow-y-auto 
          `}
          style={{ maxHeight: `calc(100vh - ${TOPBAR_HEIGHT_APPROX})` }}
        >
          <nav className="flex flex-col gap-1 px-4 pt-2 pb-4">
             {renderTopbarItems('mobile')}
          </nav>
        </div>
      )}

    </div> // End Topbar Main Div
  );
};

export default Topbar;

// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import { GiExplosiveMaterials } from "react-icons/gi";
// import { MdOutlineCancel } from "react-icons/md"; // Needed again for mobile close
// import { AiOutlineMenu, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
// import { TooltipComponent } from "@syncfusion/ej2-react-popups";
// import { links as adminLinks } from "../data/dummy"; // Renamed import
// import { Studentlinks } from "../data/dummy";
// import { Teacherslinks } from "../data/dummy";
// import { Parentslinks } from "../data/dummy";
// import { useStateContext } from "../contexts/ContextProvider";
// import { BiSolidSchool } from "react-icons/bi";
// import logo from "../../src/ShikshMitraWebsite/digitalvidya.png"; // Verify path

// // --- Constants ---
// const TOPBAR_HEIGHT_APPROX = '65px'; // Adjust if needed

// const Topbar = () => {
//   // --- State ---
//   const { currentColor, activeMenu, setActiveMenu, screenSize, userRole } = useStateContext();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // <<< RE-ADDED for mobile drawer
//   const [openDropdownIndex, setOpenDropdownIndex] = useState(null); // Used for BOTH desktop dropdown and mobile accordion
//   const [dropdownPosition, setDropdownPosition] = useState(null); // For DESKTOP fixed position

//   // --- Refs ---
//   const topbarRef = useRef(null);
//   const openDropdownRef = useRef(null); // Ref for DESKTOP dropdown

//   // --- Hooks ---
//   const location = useLocation();

//   // --- Role and Link Logic ---
//   let linksToDisplay = [];
//   let dashboardPath = "/";
//   if (userRole === "student") {
//     linksToDisplay = Studentlinks[0]?.links || [];
//     dashboardPath = "/student";
//   } else if (userRole === "teacher") {
//     linksToDisplay = Teacherslinks[0]?.links || [];
//     dashboardPath = "/teacher";
//   } else if (userRole === "parent") {
//     linksToDisplay = Parentslinks[0]?.links || [];
//     dashboardPath = "/parent";
//   } else {
//     linksToDisplay = adminLinks;
//     dashboardPath = "/admin";
//   }

//   useEffect(() => {
//     setIsMobileMenuOpen(false);
//     setOpenDropdownIndex(null);
//     setDropdownPosition(null);
//   }, [location]);

//   // Handle screen resizing
//    useEffect(() => {
//      // Close desktop dropdown if screen becomes mobile
//      if (openDropdownIndex !== null && screenSize <= 900 ) {
//        setOpenDropdownIndex(null);
//        setDropdownPosition(null);
//      }
//      // Close mobile drawer if screen becomes desktop
//      if (isMobileMenuOpen && screenSize > 900) {
//          setIsMobileMenuOpen(false);
//      }
//    }, [screenSize, openDropdownIndex, isMobileMenuOpen]);

//   // Close DESKTOP dropdown on clicking outside
//   const handleClickOutside = useCallback((event) => {
//     // Close Desktop Dropdown
//     if (
//       openDropdownRef.current &&
//       !openDropdownRef.current.contains(event.target) &&
//       !event.target.closest('[data-dropdown-trigger]')
//     ) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     }

//   }, []); // Removed isMobileMenuOpen dependency for simplicity

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [handleClickOutside]);

//   const handleScroll = useCallback(() => {
//     if (openDropdownIndex !== null && dropdownPosition !== null && screenSize > 900) {
//       // Attempt to reposition based on button's current location
//        const triggerButton = topbarRef.current?.querySelector(`[data-dropdown-trigger][data-index="${openDropdownIndex}"]`);
//         if (triggerButton) {
//             const rect = triggerButton.getBoundingClientRect();
//             setDropdownPosition({
//                 top: rect.bottom + window.scrollY,
//                 left: rect.left + window.scrollX,
//             });
//         } else {
//             // Fallback: close if button not found
//             setOpenDropdownIndex(null);
//             setDropdownPosition(null);
//         }
//     }
//   }, [openDropdownIndex, dropdownPosition, screenSize]); // Add screenSize dependency

//   useEffect(() => {
//     window.addEventListener("scroll", handleScroll, true);
//     return () => window.removeEventListener("scroll", handleScroll, true);
//   }, [handleScroll]);


//   const handleMobileMenuToggle = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//     // Close desktop dropdown if mobile menu is opened
//     if (!isMobileMenuOpen) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     }
//   };

//   const handleCloseMobileMenu = () => {
//     setIsMobileMenuOpen(false);
//   };

//   const handleAdminDropdownToggle = (index, event) => {
//     event.stopPropagation(); // Important!

//     const currentlyOpen = openDropdownIndex === index;

//     if (screenSize > 900) {
//       // --- Desktop Logic ---
//       if (currentlyOpen) {
//         setOpenDropdownIndex(null);
//         setDropdownPosition(null);
//       } else {
//         setOpenDropdownIndex(index);
//         const buttonElement = event.currentTarget;
//         const rect = buttonElement.getBoundingClientRect();
//         setDropdownPosition({
//           top: rect.bottom + window.scrollY,
//           left: rect.left + window.scrollX,
//         });
//       }
//     } else {
    
//       setOpenDropdownIndex(currentlyOpen ? null : index);
//       setDropdownPosition(null); // Ensure no fixed position on mobile
//     }
//   };

//   const closeAllMenus = () => {
//       setIsMobileMenuOpen(false);
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//   }


//   const topbarActiveLink = `flex items-center px-2 py-1 rounded-md text-white text-sm font-semibold whitespace-nowrap`;
//   const topbarNormalLink = `flex items-center  px-2 py-1 rounded-md text-sm text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700 font-semibold whitespace-nowrap`;
//   const mobileActiveLink = `flex items-center gap-3 pl-4 pr-2 py-2.5 rounded-lg text-white text-md font-semibold`; // Added font-semibold
//   const mobileNormalLink = `flex items-center gap-3 pl-4 pr-2 py-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray`;

//   const renderTopbarItems = (linkStyleType) => {
//     const isMobile = linkStyleType === 'mobile';
//     const activeStyle = isMobile ? mobileActiveLink : topbarActiveLink;
//     const normalStyle = isMobile ? mobileNormalLink : topbarNormalLink;

//     return linksToDisplay.map((item, index) => (
//       <div key={item.name || item.title || index} className={`${isMobile ? 'w-full' : 'flex-shrink-0'}`}>
//         {item.children ? (
//            // --- Item HAS Children ---
//            <>
//              <button
//                data-dropdown-trigger
//                data-index={index} // Needed for scroll repositioning
//                onClick={(e) => handleAdminDropdownToggle(index, e)}
//                className={`${normalStyle} items-center w-full ${isMobile ? 'justify-between' : ''}`}
//                style={{backgroundColor: !isMobile && openDropdownIndex === index ? 'rgba(0,0,0,0.05)' : ''}}
//              >
//                <span className="flex items-center gap-2">
//                  {item.icon}
//                  {item.name}
//                </span>
//                {/* Arrow indicates open state */}
//                { openDropdownIndex === index ? <AiOutlineUp /> : <AiOutlineDown /> }
//              </button>

//              {/* --- Mobile Accordion Content (Rendered inline within mobile drawer) --- */}
//              {isMobile && openDropdownIndex === index && item.children && (
//                <div className="pl-5 border-l-2 border-gray-200 dark:border-gray-600 ml-2 my-1 bg-red-700">
//                  <ul>
//                    {item.children.map((child) => (
//                      <li key={child.name}>
//                        <NavLink
//                          to={child.link}
//                          onClick={closeAllMenus} // Close drawer when child link is clicked
//                          style={({ isActive }) => ({
//                             backgroundColor: isActive ? currentColor : "",
//                             color: isActive ? 'white' : '',
//                          })}
//                          className={({ isActive }) =>
//                            `${isActive ? mobileActiveLink : mobileNormalLink} py-1.5 text-sm pl-2` // Adjust style for sub-items
//                          }
//                        >
//                          {child.icon}
//                          <span className="capitalize">{child.name}</span>
//                        </NavLink>
//                      </li>
//                    ))}
//                  </ul>
//                </div>
//              )}
//            </>
//         ) : (
//           // --- Regular Link Item (NO Children) ---
//           <NavLink
//             to={item.link || `/${item.route}`}
//             onClick={closeAllMenus} // Close menus on link click
//             style={({ isActive }) => ({
//               backgroundColor: isActive ? currentColor : "",
//               color: isActive ? 'white': '',
//             })}
//             className={({ isActive }) => `${isActive ? activeStyle : normalStyle}`}
//           >
//             {item.icon}
//             <span className="capitalize cursor-pointer">{item.name}</span>
//           </NavLink>
//         )}
//       </div>
//     ));
//   };

//   // --- Component Return ---
//   return (
//     <div ref={topbarRef} className="relative flex justify-between items-center pt-1 bg-white dark:bg-main-dark-bg shadow-md border-b dark:border-gray-700 z-30 print:hidden">


//       <div className="flex-1 min-w-0 overflow-hidden mx-2  hidden md:block">
//         <nav className={`
//             flex items-center gap-1  overflow-x-auto flex-nowrap pb-[2px]
//             scrollbar scrollbar-h-[2px]
//             scrollbar-thumb-gray-400 scrollbar-track-gray-100
//             dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800
//             scrollbar-thumb-rounded-md scrollbar-track-rounded-md
//         `}>
//              {/* Render desktop items ONLY */}
//              {renderTopbarItems('desktop')}
//         </nav>
//       </div>
//       <div className="flex items-center gap-2 flex-shrink-0">
//          <div className="md:hidden ml-1 sm:ml-2"> {/* <<< RE-ADDED */}
//             <TooltipComponent
//             //  content="Navigation"
//               position="BottomCenter">
//             <button
//                 type="button"
//                 onClick={handleMobileMenuToggle} // Toggles the drawer
//                 style={{ color: currentColor }}
//                 className="text-xl rounded-full p-3 hover:bg-light-gray dark:hover:bg-gray-600"
//             >
               
//                 {isMobileMenuOpen ? <MdOutlineCancel /> : <AiOutlineMenu /> }
//             </button>
//             </TooltipComponent>
//         </div>
//       </div>
//       {openDropdownIndex !== null && !isMobileMenuOpen && dropdownPosition && screenSize > 900 && (
//          <div
//             ref={openDropdownRef}
//             className="absolute w-52 bg-white dark:bg-secondary-dark-bg rounded-md shadow-xl z-50 border dark:border-gray-700"
//             style={{ position: 'fixed', top: `${70}px`, left: `${dropdownPosition.left}px` }}
//             // style={{ position: 'fixed', top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
//          >
//              {linksToDisplay[openDropdownIndex]?.children && (
//                  <ul className="py-1">
//                    {linksToDisplay[openDropdownIndex].children.map((child) => (
//                      <li key={child.name}>
//                        <NavLink
//                          to={child.link}
//                          onClick={closeAllMenus}
//                          style={({ isActive }) => ({ backgroundColor: isActive ? currentColor : "", color: isActive ? 'white': '' })}
//                          className={({ isActive }) => `flex items-center gap-3 w-full px-4 py-2 text-sm ${isActive ? 'text-white font-semibold' : 'text-gray-700 dark:text-gray-200'} hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black whitespace-nowrap`}
//                        >
//                          {child.icon}
//                          <span className="capitalize">{child.name}</span>
//                        </NavLink>
//                      </li>
//                    ))}
//                  </ul>
//              )}
//          </div>
//       )}
//       {isMobileMenuOpen && screenSize <= 900 && ( // <<< RE-ADDED
//         <div className={`
//           absolute top-full left-0 w-full bg-white dark:bg-secondary-dark-bg
//           shadow-lg z-40 md:hidden border-t dark:border-gray-700
//           overflow-y-auto /* <<< ENABLE VERTICAL SCROLL */
//           `}
//           style={{ maxHeight: `calc(100vh - ${TOPBAR_HEIGHT_APPROX})` }}
//         >
//           <nav className="flex flex-col gap-1 px-4 pt-2 pb-4">
//              {renderTopbarItems('mobile')}
//           </nav>
//         </div>
//       )}

//     </div> // End Topbar Main Div
//   );
// };

// export default Topbar;
