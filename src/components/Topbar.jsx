

// 🧠 Imports (add arrow icons)
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";
import {
  AiOutlineMenu,
  AiOutlineDown,
  AiOutlineUp,
  AiOutlineLeft, // <-- Import Left Arrow
  AiOutlineRight, // <-- Import Right Arrow
} from "react-icons/ai";
import { links as adminLinks, Thirdpartylinks } from "../data/dummy";
import { Studentlinks, Teacherslinks, Parentslinks } from "../data/dummy";
import { useStateContext } from "../contexts/ContextProvider";
// import { BiSolidSchool } from "react-icons/bi";
// import logo from "../../src/ShikshMitraWebsite/digitalvidya.png";

// ========================================================================
// Topbar Component
// ========================================================================
const Topbar = () => {
  // --- State and Context ---
  const { currentColor, userRole } = useStateContext();
  const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  // ✨ State for scroll arrow visibility/disabling
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // --- Refs ---
  const topbarRef = useRef(null);
  const openDropdownRef = useRef(null);
  const navContainerRef = useRef(null); // Ref for the scrollable navigation container *itself*
  const navWrapperRef = useRef(null); // ✨ Ref for the wrapper containing nav and arrows

  // --- Hooks ---
  const location = useLocation();

  // --- Role-based Links Logic (Keep As Is) ---
  let linksToDisplay = [];
  if (userRole === "student") {
    linksToDisplay = Studentlinks[0]?.links || [];
  } else if (userRole === "teacher") {
    linksToDisplay = Teacherslinks[0]?.links || [];
  } else if (userRole === "parent") {
    linksToDisplay = Parentslinks[0]?.links || [];
  } else if (userRole === "thirdparty") {
    linksToDisplay = Thirdpartylinks[0]?.links || [];
  } else {
    linksToDisplay = adminLinks[0]?.links || adminLinks || [];
  }
  // --- End Role-based Links ---

  // --- Dropdown Logic (Keep As Is) ---
  useEffect(() => {
    setOpenDropdownIndex(null);
    setDropdownPosition(null);
  }, [location]);

  const handleClickOutside = useCallback((event) => {
    if (
      openDropdownRef.current &&
      !openDropdownRef.current.contains(event.target) &&
      !event.target.closest("[data-dropdown-trigger]") &&
      !event.target.closest(".scroll-arrow") // ✨ Don't close dropdown if clicking scroll arrow
    ) {
      setTimeout(() => {
        setOpenDropdownIndex(null);
        setDropdownPosition(null);
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (openDropdownIndex !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownIndex, handleClickOutside]);
  // --- End Dropdown Logic ---


  // --- ✨ Function to Update Scroll Button States ---
  const updateScrollButtonState = useCallback(() => {
    const container = navContainerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const scrollEndThreshold = 1; // Small tolerance for floating point inaccuracies

    setCanScrollLeft(scrollLeft > scrollEndThreshold);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - scrollEndThreshold);
  }, []); // No dependency needed as it reads directly from the ref


  // --- Effect: Horizontal Scroll, Indicator & Scroll Buttons Update ---
  useEffect(() => {
    const navContainer = navContainerRef.current;
    if (!navContainer) return;

    // --- Wheel Scroll Logic ---
    const handleWheelScroll = (event) => {
      const currentNavContainer = navContainerRef.current;
      if (!currentNavContainer) return;
      const canScrollHorizontally = currentNavContainer.scrollWidth > currentNavContainer.clientWidth;
      if (event.deltaY !== 0 && canScrollHorizontally) {
        event.preventDefault();
        currentNavContainer.scrollLeft += event.deltaY;
        // No need to call updateScrollButtonState here, scroll event handler below does it
      }
    };

    // --- Scroll Event Listener (for updating buttons) ---
    const handleScroll = () => {
      // Use requestAnimationFrame to avoid layout thrashing during scroll
      requestAnimationFrame(updateScrollButtonState);
    };

    // --- Resize Event Listener (for updating buttons) ---
    const handleResize = () => {
        updateScrollButtonState();
        // Also recalculate indicator on resize as link positions might change
        updateIndicatorPosition();
    };

    // --- Function to Update Indicator --- (Extracted for reuse)
    const updateIndicatorPosition = () => {
        const activeLinkElement = navContainer.querySelector('a.active-top-nav-link');
        if (activeLinkElement) {
            const newLeft = activeLinkElement.offsetLeft;
            const newWidth = activeLinkElement.offsetWidth;
            setIndicatorStyle({ left: newLeft, width: newWidth, opacity: 1 });

            // Scroll into view logic remains important
            const containerScrollLeft = navContainer.scrollLeft;
            const containerWidth = navContainer.clientWidth;
            const linkRightEdge = newLeft + newWidth;
            if (linkRightEdge > containerScrollLeft + containerWidth) {
                navContainer.scrollTo({ left: linkRightEdge - containerWidth + 15, behavior: 'smooth' });
            } else if (newLeft < containerScrollLeft) {
                navContainer.scrollTo({ left: newLeft - 15, behavior: 'smooth' });
            }
        } else {
            setIndicatorStyle(prev => ({ ...prev, opacity: 0, width: 0 }));
        }
    }

    // --- Initial Setup & Event Listeners ---
    navContainer.addEventListener('wheel', handleWheelScroll, { passive: false });
    navContainer.addEventListener('scroll', handleScroll, { passive: true }); // Use passive for scroll
    window.addEventListener('resize', handleResize);

    // Initial calculations
    updateIndicatorPosition(); // Calculate indicator position based on current route
    updateScrollButtonState(); // Calculate initial button states

    // --- Cleanup ---
    return () => {
      if (navContainer) {
        navContainer.removeEventListener('wheel', handleWheelScroll);
        navContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
    // Dependencies: location (for indicator), linksToDisplay (affects scrollWidth/links),
    // updateScrollButtonState (stable callback), currentColor (might affect layout indirectly)
  }, [location, linksToDisplay, updateScrollButtonState, currentColor]);


  // --- Event Handlers ---
  const handleDropdownToggle = (index, event) => {
    event.stopPropagation();
    const isOpen = openDropdownIndex === index;
    if (isOpen) {
      setOpenDropdownIndex(null);
      setDropdownPosition(null);
    } else {
      const button = event.currentTarget;
      const rect = button.getBoundingClientRect();
      setOpenDropdownIndex(index);
      setDropdownPosition({
        top: rect.bottom + 4,
        left: rect.left,
      });
    }
  };

  const closeMenus = () => {
    setOpenDropdownIndex(null);
    setDropdownPosition(null);
  };

  // ✨ Scroll Arrow Click Handlers
  const handleScrollLeft = () => {
    const container = navContainerRef.current;
    if (!container) return;
    const scrollAmount = Math.min(container.clientWidth * 0.8, 300); // Scroll by 80% of viewport or max 300px
    container.scrollTo({
        left: container.scrollLeft - scrollAmount,
        behavior: 'smooth'
    });
  };

  const handleScrollRight = () => {
    const container = navContainerRef.current;
    if (!container) return;
    const scrollAmount = Math.min(container.clientWidth * 0.8, 300);
    container.scrollTo({
        left: container.scrollLeft + scrollAmount,
        behavior: 'smooth'
    });
  };

  // --- Link Styling Classes (Keep As Is) ---
  const activeLinkClass = `flex items-center gap-1 px-3 py-1 rounded-md text-[12px] uppercase whitespace-nowrap font-semibold active-top-nav-link`; // Added padding x-3 for better spacing
  const normalLinkClass = `flex items-center gap-1 px-3 py-1 rounded-md text-[12px] uppercase text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100 whitespace-nowrap`;

  // --- Render Links Function (Keep As Is, except for key/class adjustments if needed) ---
  const renderLinks = () =>
    linksToDisplay.map((item, index) => (
      <div key={item.name || `toplink-${index}`} className="flex-shrink-0 relative group">
        {item.children && item.children.length > 0 ? (
          <button
            data-dropdown-trigger
            data-index={index}
            onClick={(e) => handleDropdownToggle(index, e)}
            className={`${normalLinkClass} items-center w-full justify-between`}
            style={{
              backgroundColor: openDropdownIndex === index ? 'rgba(0,0,0,0.05)' : '',
              color: currentColor
            }}
          >
            <span className="flex items-center gap-1">
              {item.icon}
              {item.name}
            </span>
            {openDropdownIndex === index ? <AiOutlineUp className="ml-1 text-xs"/> : <AiOutlineDown className="ml-1 text-xs"/>}
          </button>
        ) : item.link || item.route ? (
          <NavLink
            to={item.link ? item.link : `/${item.route}`.replace('//', '/')}
            onClick={closeMenus}
            style={({ isActive }) => ({
              color: isActive ? "white" : currentColor,
              backgroundColor: isActive ? currentColor :  '',
            })}
            className={({ isActive }) =>
              `${isActive ? activeLinkClass : normalLinkClass}`
            }
          >
            {item.icon}
            {item.name}
          </NavLink>
        ) : (
          <span className={`${normalLinkClass} opacity-50 cursor-default`} style={{ color: currentColor }}>
            {item.icon}
            {item.name || item.title}
          </span>
        )}
      </div>
    ));

  // --- Component Return JSX ---
  return (
    <div
      ref={topbarRef}
      className="relative flex flex-col pt-1 bg-white dark:bg-main-dark-bg border-b dark:border-gray-700 z-30 shadow-sm"
    >
      {/* ✨ Wrapper for Nav container + Arrows */}
      <div ref={navWrapperRef} className="relative w-full group"> {/* group for hover effects on arrows */}

        {/* Scrollable Navigation Container */}
        <div
          ref={navContainerRef}
          // ✨ Added overflow-hidden to clip content, padding for arrow space
          className="w-full overflow-x-auto overflow-y-hidden px-8 scrollbar-hide" // scrollbar-hide needs tailwind plugin or custom CSS
          style={{ scrollBehavior: "smooth" }} // Ensure smooth scrolling for programmatic scrolls
        >
          {/* Navigation Items Wrapper */}
          <nav className="relative flex items-center gap-1 flex-nowrap pb-[5px]"> {/* Use gap-1 or adjust as needed */}
            {Array.isArray(linksToDisplay) && linksToDisplay.length > 0 ? (
               renderLinks()
            ) : (
               <div className="p-2 text-gray-500 text-xs whitespace-nowrap">No navigation links available.</div>
            )}

            {/* ✨ Animated Active Link Indicator Bar - Enhanced Transition */}
            <div
              className="absolute bottom-0 h-[3px] rounded-t-sm"
              style={{
                ...indicatorStyle,
                backgroundColor: currentColor,
                // ✨ Smoother/longer transition
                transition: 'left 400ms ease-in-out, width 400ms ease-in-out, opacity 300ms ease-in-out',
              }}
            />
          </nav>
        </div> {/* End Scrollable Container */}

        {/* ✨ Left Scroll Arrow */}
        <button
            aria-label="Scroll Left"
            onClick={handleScrollLeft}
            // ✨ Conditional styling: hidden if cannot scroll left, visible otherwise
            className={`scroll-arrow absolute text-xl left-0 top-0 bottom-[5px] z-10 flex items-center justify-center px-1
                       bg-gradient-to-r from-white via-white dark:from-main-dark-bg dark:via-main-dark-bg to-transparent
                       text-orange-700 dark:text-gray-300 hover:text-black dark:hover:text-white
                       transition-opacity duration-200
                       ${canScrollLeft ? 'opacity-100 group-hover:opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
        >
            {/* <AiOutlineLeft size={16} /> */}
            ⬅️
        </button>

        {/* ✨ Right Scroll Arrow */}
        <button
            aria-label="Scroll Right"
            onClick={handleScrollRight}
             // ✨ Conditional styling: hidden if cannot scroll right, visible otherwise
             className={`scroll-arrow text-xl absolute right-0 top-0 bottom-[5px] z-10 flex items-center justify-center px-1
                       bg-gradient-to-l from-white via-white dark:from-main-dark-bg dark:via-main-dark-bg to-transparent
                       text-orange-700 dark:text-gray-300 hover:text-black dark:hover:text-white
                       transition-opacity duration-200
                       ${canScrollRight ? 'opacity-100 group-hover:opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
        >
            {/* <AiOutlineRight size={16} />
            <AiOutlineRight size={16} /> */}
            ➡️
        </button>

      </div> {/* End Nav Wrapper */}


      {/* Dropdown Menu Area (Keep As Is) */}
      {openDropdownIndex !== null && dropdownPosition && linksToDisplay[openDropdownIndex]?.children && (
        <div
          ref={openDropdownRef}
          className="absolute bg-white dark:bg-secondary-dark-bg rounded-md shadow-xl z-50 border dark:border-gray-700 overflow-hidden"
           style={{
                position: "fixed",
                top: `${dropdownPosition.top}px`,
                left: `${dropdownPosition.left}px`,
                minWidth: "200px",
            }}
        >
          <ul className="py-1 max-h-72 overflow-y-auto">
            {linksToDisplay[openDropdownIndex].children.map((child) => (
              <li key={child.name}>
                <NavLink
                   to={child.link || '#'}
                   onClick={closeMenus}
                   style={({ isActive }) => ({
                     backgroundColor: isActive ? currentColor : "",
                     color: isActive ? "white" : "",
                   })}
                  className={({ isActive }) =>
                    `flex items-center gap-3 w-full px-4 py-2 text-sm ${
                      isActive ? "text-white font-semibold" : "text-gray-700 dark:text-gray-200"
                    } hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap`
                  }
                >
                  {child.icon}
                  <span className="uppercase">{child.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Topbar;











// // 🧠 Imports remain the same
// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import { MdOutlineCancel } from "react-icons/md";
// import { AiOutlineMenu, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
// import { links as adminLinks, Thirdpartylinks } from "../data/dummy";
// import { Studentlinks, Teacherslinks, Parentslinks } from "../data/dummy";
// import { useStateContext } from "../contexts/ContextProvider";
// import { BiSolidSchool } from "react-icons/bi";
// import logo from "../../src/ShikshMitraWebsite/digitalvidya.png"; // Ensure path is correct

// const Topbar = () => {
//   const { currentColor, screenSize, userRole } = useStateContext();
//   const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
//   const [dropdownPosition, setDropdownPosition] = useState(null);
//   const topbarRef = useRef(null);
//   const openDropdownRef = useRef(null);
//   const navContainerRef = useRef(null);
//   const location = useLocation();

//   // ✨ State for the active link indicator's style
//   const [indicatorStyle, setIndicatorStyle] = useState({
//     left: 0,
//     width: 0,
//     opacity: 0, // Start hidden
//   });

//   // --- Role-based Links --- (Keep existing logic)
//   let linksToDisplay = [];
//   let dashboardPath = "/"; // You might not need dashboardPath here if it's only used for initial setup
//   if (userRole === "student") {
//     linksToDisplay = Studentlinks[0]?.links || [];
//   } else if (userRole === "teacher") {
//     linksToDisplay = Teacherslinks[0]?.links || [];
//   } else if (userRole === "parent") {
//     linksToDisplay = Parentslinks[0]?.links || [];
//   } else if (userRole === "thirdparty") {
//     linksToDisplay = Thirdpartylinks[0]?.links || [];
//   } else {
//     linksToDisplay = adminLinks[0]?.links || adminLinks || [];
//   }
//   // --- End Role-based Links ---

//   // --- Close Dropdowns --- (Keep existing logic)
//   useEffect(() => {
//     setOpenDropdownIndex(null);
//     setDropdownPosition(null);
//   }, [location]);

//   const handleClickOutside = useCallback((event) => {
//     if (
//       openDropdownRef.current &&
//       !openDropdownRef.current.contains(event.target) &&
//       !event.target.closest('[data-dropdown-trigger]')
//     ) {
//       setTimeout(() => {
//         setOpenDropdownIndex(null);
//         setDropdownPosition(null);
//       }, 0);
//     }
//   }, []);

//   useEffect(() => {
//     if (openDropdownIndex !== null) {
//       document.addEventListener("mousedown", handleClickOutside);
//     } else {
//       document.removeEventListener("mousedown", handleClickOutside);
//     }
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [openDropdownIndex, handleClickOutside]);
//   // --- End Close Dropdowns ---

//   // --- Horizontal Scroll --- (Keep existing logic)
//   useEffect(() => {
//     const navContainer = navContainerRef.current;
//     if (!navContainer) return;

//     const handleWheelScroll = (event) => {
//         const currentNavContainer = navContainerRef.current;
//         if (!currentNavContainer) return;
//         const canScrollHorizontally = currentNavContainer.scrollWidth > currentNavContainer.clientWidth;
//         if (event.deltaY !== 0 && canScrollHorizontally) {
//             event.preventDefault();
//             currentNavContainer.scrollLeft += event.deltaY;
//         }
//     };

//     navContainer.addEventListener('wheel', handleWheelScroll, { passive: false });
//     // console.log("Horizontal scroll: Wheel listener attached."); // Keep console logs for debugging if needed

//     return () => {
//       if (navContainer) { // Check if navContainer exists before removing listener
//         navContainer.removeEventListener('wheel', handleWheelScroll);
//         // console.log("Horizontal scroll: Wheel listener removed.");
//       }
//     };
//   }, [linksToDisplay]); // Re-run if links change
//   // --- End Horizontal Scroll ---

//   // ✨ Effect to update the indicator position on route change
//   useEffect(() => {
//     const navContainer = navContainerRef.current;
//     if (!navContainer) return;

//     // Find the active NavLink *directly* within the nav container
//     // We added the 'active-top-nav-link' class specifically for this query
//     const activeLinkElement = navContainer.querySelector('a.active-top-nav-link');

//     if (activeLinkElement) {
//       const newLeft = activeLinkElement.offsetLeft;
//       const newWidth = activeLinkElement.offsetWidth;

//       // Ensure the active link is scrolled into view if the container overflows
//       const containerScrollLeft = navContainer.scrollLeft;
//       const containerWidth = navContainer.clientWidth;
//       const linkRightEdge = newLeft + newWidth;

//       // Scroll right if link's right edge is outside view
//       if (linkRightEdge > containerScrollLeft + containerWidth) {
//           navContainer.scrollTo({ left: linkRightEdge - containerWidth + 10, behavior: 'smooth' }); // Add some padding
//       }
//       // Scroll left if link's left edge is outside view
//       else if (newLeft < containerScrollLeft) {
//           navContainer.scrollTo({ left: newLeft - 10, behavior: 'smooth' }); // Add some padding
//       }

//       setIndicatorStyle({ left: newLeft, width: newWidth, opacity: 1 });

//     } else {
//       // If no top-level link is active, hide the indicator smoothly
//        setIndicatorStyle(prev => ({ ...prev, opacity: 0, width: 0 })); // Animate width to 0 too
//     }
//   }, [location, linksToDisplay]); // Re-run when location or links change


//   // --- Dropdown Toggle Logic --- (Keep existing logic)
//   const handleDropdownToggle = (index, event) => {
//     event.stopPropagation();
//     const isOpen = openDropdownIndex === index;
//     if (isOpen) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     } else {
//       const button = event.currentTarget;
//       const rect = button.getBoundingClientRect();
//       setOpenDropdownIndex(index);
//       setDropdownPosition({
//         top: rect.bottom + 2,
//         left: rect.left,
//       });
//     }
//   };

//   const closeMenus = () => {
//     setOpenDropdownIndex(null);
//     setDropdownPosition(null);
//   };
//   // --- End Dropdown Toggle ---

//   // --- Link Styles --- (Adjust active style)
//   // ✨ Removed background from activeLinkClass, indicator handles it
//   const activeLinkClass = `flex items-center gap-1 px-2 py-1 rounded-md text-[12px] uppercase whitespace-nowrap font-semibold active-top-nav-link`; // Added specific class
//   const normalLinkClass = `flex items-center gap-1 px-2 py-1 rounded-md text-[12px] uppercase text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap`;

//   // --- Render Links Function ---
//   const renderLinks = () =>
//     linksToDisplay.map((item, index) => (
//         <div key={item.name || `toplink-${index}`} className="flex-shrink-0 relative group"> {/* Add relative and group for potential hover effects */}
//             {item.children && item.children.length > 0 ? (
//             <button
//                 data-dropdown-trigger
//                 data-index={index}
//                 onClick={(e) => handleDropdownToggle(index, e)}
//                 // ✨ Use normal class, maybe add subtle active state if needed
//                 className={`${normalLinkClass} items-center w-full justify-between`}
//                 style={{
//                     backgroundColor: openDropdownIndex === index ? 'rgba(0,0,0,0.05)' : '', // Keep subtle bg for open dropdown trigger
//                     color: currentColor // Apply currentColor to button text
//                 }}
//             >
//                 <span className="flex items-center gap-1">
//                     {item.icon}
//                     {item.name}
//                 </span>
//                 {openDropdownIndex === index ? <AiOutlineUp className="ml-1"/> : <AiOutlineDown className="ml-1"/>}
//             </button>
//             ) : item.link || item.route ? (
//                 <NavLink
//                     to={item.link ? item.link : `/${item.route}`.replace('//', '/')}
//                     onClick={closeMenus}
//                     // ✨ Style callback now mainly sets text color based on isActive
//                     style={({ isActive }) => ({
//                         color: isActive ? currentColor : (currentColor || '#333'), // Use theme color for active text
//                         // background: 'transparent' // Ensure no background is set here
//                     })}
//                     className={({ isActive }) =>
//                         `${isActive ? activeLinkClass : normalLinkClass}` // Use updated classes
//                     }
//                 >
//                     {item.icon}
//                     {item.name}
//                     {/* Optional: Add subtle hover underline using group */}
//                     {/* <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-current opacity-50 group-hover:w-full group-hover:opacity-100 transition-all duration-200"></span> */}
//                 </NavLink>
//             ) : (
//                 <span className={`${normalLinkClass} opacity-50 cursor-default`} style={{ color: currentColor }}>
//                     {item.icon}
//                     {item.name || item.title}
//                 </span>
//             )}
//         </div>
//     ));
//   // --- End Render Links ---


//   return (
//     <div
//       ref={topbarRef}
//       className="relative flex flex-col pt-1 bg-white dark:bg-main-dark-bg border-b dark:border-gray-700 z-30 shadow-sm" // Added subtle shadow
//     >
//       {/* Logo Section (Optional - keep if needed) */}
//       {/* <div className="flex justify-between items-center px-2 py-1"> ... </div> */}

//       {/* 🔄 Unified nav section */}
//       <div
//         ref={navContainerRef}
//         className="w-full overflow-x-auto px-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800"
//       >
//         {/* ✨ Added relative positioning to the nav */}
//         <nav className="relative flex items-center gap-1 flex-nowrap pb-[4px]"> {/* Increased padding-bottom slightly for indicator space */}
//           {Array.isArray(linksToDisplay) && linksToDisplay.length > 0 ? (
//              renderLinks()
//           ) : (
//              <div className="p-2 text-gray-500 text-xs whitespace-nowrap">No navigation links available.</div>
//           )}

//           {/* ✨ Animated Indicator Bar */}
//           <div
//             className="absolute bottom-0 h-[3px] rounded-t-sm" // Indicator appearance
//             style={{
//               ...indicatorStyle,
//               backgroundColor: currentColor, // Use theme color for indicator
//               transition: 'left 300ms ease-out, width 300ms ease-out, opacity 200ms ease-in-out', // Smooth transitions
//             }}
//           />
//         </nav>
//       </div>

//       {/* 🔽 Dropdown */}
//       {openDropdownIndex !== null && dropdownPosition && linksToDisplay[openDropdownIndex]?.children && (
//         <div
//           ref={openDropdownRef}
//           className="absolute bg-white dark:bg-secondary-dark-bg rounded-md shadow-xl z-50 border dark:border-gray-700"
//            style={{
//                 position: "fixed",
//                 top: `${dropdownPosition.top}px`,
//                 left: `${dropdownPosition.left}px`,
//                 minWidth: "200px",
//                 // ✨ Optional: Add subtle fade-in animation to dropdown
//                 // animation: 'fadeIn 200ms ease-out', // Requires defining fadeIn keyframes in CSS/Tailwind config
//             }}
//         >
//           <ul className="py-1 max-h-72 overflow-y-auto">
//             {linksToDisplay[openDropdownIndex].children.map((child) => (
//               <li key={child.name}>
//                 <NavLink
//                    to={child.link || '#'}
//                    onClick={closeMenus}
//                    style={({ isActive }) => ({
//                      backgroundColor: isActive ? currentColor : "",
//                      color: isActive ? "white" : "",
//                    })}
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 w-full px-4 py-2 text-sm ${
//                       isActive ? "text-white font-semibold" : "text-gray-700 dark:text-gray-200"
//                     } hover:bg-light-gray dark:hover:bg-gray-600 whitespace-nowrap` // Adjusted hover class potentially
//                   }
//                 >
//                   {child.icon}
//                   <span className="capitalize">{child.name}</span>
//                 </NavLink>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//        {/* Optional: Define keyframes if needed for dropdown animation */}
//        {/* <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: translateY(-5px); }
//           to { opacity: 1; transform: translateY(0); }
//         }
//       `}</style> */}
//     </div>
//   );
// };

// export default Topbar;




// // 🧠 Imports remain the same
// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import { MdOutlineCancel } from "react-icons/md";
// import { AiOutlineMenu, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
// // TooltipComponent import seems unused, remove if not needed elsewhere
// // import { TooltipComponent } from "@syncfusion/ej2-react-popups";
// import { links as adminLinks, Thirdpartylinks } from "../data/dummy";
// import { Studentlinks, Teacherslinks, Parentslinks } from "../data/dummy";
// import { useStateContext } from "../contexts/ContextProvider";
// import { BiSolidSchool } from "react-icons/bi";
// // Make sure this path is correct relative to Topbar.js
// import logo from "../../src/ShikshMitraWebsite/digitalvidya.png";

// const Topbar = () => {
//   const { currentColor, screenSize, userRole } = useStateContext();
//   const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
//   const [dropdownPosition, setDropdownPosition] = useState(null);
//   const topbarRef = useRef(null);
//   const openDropdownRef = useRef(null);
//   const navContainerRef = useRef(null); // Ref for the scrollable nav container
//   const location = useLocation();

//   // --- Role-based Links ---
//   // Ensure consistency: access the 'links' array within the first object
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
//   } else if (userRole === "thirdparty") {
//     linksToDisplay = Thirdpartylinks[0]?.links || [];
//     dashboardPath = "/thirdparty";
//   } else {
//      // Assuming adminLinks might also follow the [{ title: '...', links: [...] }] structure
//     linksToDisplay = adminLinks[0]?.links || adminLinks || []; // Handle both structures
//     dashboardPath = "/admin";
//   }
//   // --- End Role-based Links ---


//   // Close dropdown on location change
//   useEffect(() => {
//     setOpenDropdownIndex(null);
//     setDropdownPosition(null);
//   }, [location]);


//   // Close dropdown on click outside
//   const handleClickOutside = useCallback((event) => {
//      // Check if the click is outside the dropdown AND outside the topbar triggers
//     if (
//       openDropdownRef.current &&
//       !openDropdownRef.current.contains(event.target) &&
//       !event.target.closest('[data-dropdown-trigger]') // Check if click was on a trigger
//     ) {
//        // Use timeout to ensure any state updates from trigger clicks happen first
//        setTimeout(() => {
//             setOpenDropdownIndex(null);
//             setDropdownPosition(null);
//        }, 0);
//     }
//   }, []); // No dependencies needed if it only uses refs


//   useEffect(() => {
//     // Only add listener if a dropdown is potentially open
//     if (openDropdownIndex !== null) {
//         document.addEventListener("mousedown", handleClickOutside);
//     } else {
//         document.removeEventListener("mousedown", handleClickOutside); // Clean up if no dropdown is open
//     }
//     // Cleanup on unmount or when dropdown closes
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [openDropdownIndex, handleClickOutside]); // Re-run when dropdown state changes


//   // --- Horizontal Scroll with Vertical Mouse Wheel ---
//   useEffect(() => {
//     const navContainer = navContainerRef.current;

//     if (!navContainer) {
//       console.warn("Horizontal scroll: Nav container ref not found.");
//       return; // Exit if the ref isn't attached yet
//     }

//     // --- Debugging: Check initial scroll dimensions ---
//     console.log('Horizontal scroll: Initial check - ScrollWidth:', navContainer.scrollWidth, 'ClientWidth:', navContainer.clientWidth);
//     if (navContainer.scrollWidth <= navContainer.clientWidth) {
//         console.warn("Horizontal scroll: Content does not overflow. Scrolling disabled.");
//         // Optional: Add a visual indicator if needed
//         // navContainer.style.border = '1px solid orange'; // Example: highlight non-scrollable
//     }
//     // --- End Debugging ---

//     const handleWheelScroll = (event) => {
//       // Ensure the ref is still valid inside the handler
//       const currentNavContainer = navContainerRef.current;
//       if (!currentNavContainer) return;

//       // Check if the container *actually* has horizontal overflow
//       const canScrollHorizontally = currentNavContainer.scrollWidth > currentNavContainer.clientWidth;

//       // Only act on vertical scroll (deltaY) and if horizontal scroll is possible
//       if (event.deltaY !== 0 && canScrollHorizontally) {
//         // console.log('Wheel event:', event.deltaY, 'scrollLeft before:', currentNavContainer.scrollLeft); // Debug log
//         event.preventDefault(); // Prevent default vertical page scroll
//         // Adjust scrollLeft. DeltaY might be positive (down) or negative (up).
//         // Scrolling down (positive deltaY) should move scrollLeft right (increase).
//         currentNavContainer.scrollLeft += event.deltaY;
//         // console.log('scrollLeft after:', currentNavContainer.scrollLeft); // Debug log
//       }
//        // Optional: Handle horizontal wheel scroll (deltaX) if needed
//        // else if (event.deltaX !== 0 && canScrollHorizontally) {
//        //    // Allow default horizontal scroll or handle manually:
//        //    // currentNavContainer.scrollLeft += event.deltaX; // (Default usually handles this)
//        // }
//     };

//     // Add the listener with passive: false to allow preventDefault
//     navContainer.addEventListener('wheel', handleWheelScroll, { passive: false });
//     console.log("Horizontal scroll: Wheel listener attached.");

//     // Cleanup function
//     return () => {
//       navContainer.removeEventListener('wheel', handleWheelScroll);
//       console.log("Horizontal scroll: Wheel listener removed.");
//        // Optional: Remove visual indicator on cleanup
//        // if (navContainer.style.border === '1px solid orange') navContainer.style.border = '';
//     };
//   }, [linksToDisplay]); // Re-run if links change, as content width might change
//   // --- End Horizontal Scroll ---


//   const handleDropdownToggle = (index, event) => {
//     event.stopPropagation(); // Prevent triggering handleClickOutside immediately
//     const isOpen = openDropdownIndex === index;
//     if (isOpen) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     } else {
//       const button = event.currentTarget;
//       const rect = button.getBoundingClientRect();
//       // Close any previously open dropdown first
//       setOpenDropdownIndex(index);
//       // Position relative to the viewport using fixed positioning
//       setDropdownPosition({
//         top: rect.bottom + 2, // Add a small gap below the button
//         left: rect.left,
//       });
//     }
//   };

//   const closeMenus = () => {
//     setOpenDropdownIndex(null);
//     setDropdownPosition(null);
//   };

//   // --- Link Styles --- (Keep as they are)
//   const activeLinkClass = `flex items-center gap-1 px-2 py-1 rounded-md text-white text-[12px] uppercase whitespace-nowrap`;
//   const normalLinkClass = `flex items-center gap-1 px-2 py-1 rounded-md text-[12px] uppercase text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap`;

//   // --- Render Links Function ---
//   const renderLinks = () =>
//     linksToDisplay.map((item, index) => (
//         // Use item.name or generate a unique key if name isn't guaranteed
//         <div key={item.name || `toplink-${index}`} className="flex-shrink-0">
//             {item.children && item.children.length > 0 ? (
//             <button
//                 data-dropdown-trigger // Important for click outside logic
//                 data-index={index}
//                 onClick={(e) => handleDropdownToggle(index, e)}
//                 className={`${normalLinkClass} items-center w-full justify-between`}
//                 style={{
//                     backgroundColor: openDropdownIndex === index ? 'rgba(0,0,0,0.05)' : '',
//                     color: currentColor // Apply currentColor to button text
//                 }}
//             >
//                 <span className="flex items-center gap-1">
//                 {item.icon}
//                 {item.name}
//                 </span>
//                 {openDropdownIndex === index ? <AiOutlineUp className="ml-1"/> : <AiOutlineDown className="ml-1"/>}
//             </button>
//             ) : item.link || item.route ? (
//                 <NavLink
//                     to={item.link ? item.link : `/${item.route}`.replace('//', '/')}
//                     onClick={closeMenus} // Close dropdowns when a direct link is clicked
//                     style={({ isActive }) => ({
//                     backgroundColor: isActive ? currentColor : "",
//                     color: isActive ? "white" : currentColor,
//                     })}
//                     className={({ isActive }) =>
//                     `${isActive ? activeLinkClass : normalLinkClass}`
//                     }
//                 >
//                     {item.icon}
//                     {item.name}
//                 </NavLink>
//             ) : ( // Fallback for items without links/children (e.g., titles)
//                 <span className={`${normalLinkClass} opacity-50 cursor-default`} style={{ color: currentColor }}>
//                     {item.icon}
//                     {item.name || item.title}
//                 </span>
//             )}
//         </div>
//     ));
//   // --- End Render Links ---


//   return (
//     <div
//       ref={topbarRef}
//       className="relative flex flex-col pt-1 bg-white dark:bg-main-dark-bg border-b dark:border-gray-700 z-30"
//     >
//       {/* Optional Logo Section */}
//        {/* <div className="flex justify-between items-center px-2 py-1"> ... </div> */}

//       {/* 🔄 Unified nav section */}
//       <div
//         ref={navContainerRef} // Attach ref here
//         className="w-full overflow-x-auto px-2 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800" // Added more specific scrollbar styles
//       >
//         <nav className="flex items-center gap-1 flex-nowrap pb-[2px]">
//           {/* Ensure linksToDisplay is actually an array before mapping */}
//           {Array.isArray(linksToDisplay) && linksToDisplay.length > 0 ? (
//              renderLinks()
//           ) : (
//              <div className="p-2 text-gray-500 text-xs whitespace-nowrap">No navigation links available for this role.</div>
//           )}
//         </nav>
//       </div>

//       {/* 🔽 Dropdown */}
//       {openDropdownIndex !== null && dropdownPosition && linksToDisplay[openDropdownIndex]?.children && (
//         <div
//           ref={openDropdownRef}
//           className="absolute bg-white dark:bg-secondary-dark-bg rounded-md shadow-xl z-50 border dark:border-gray-700"
//            style={{
//                 position: "fixed", // Use fixed for viewport positioning
//                 top: `${dropdownPosition.top}px`,
//                 left: `${dropdownPosition.left}px`,
//                 minWidth: "200px",
//                 // Optional: Limit max width if needed on small screens
//                 // maxWidth: screenSize <= 640 ? "calc(100vw - 20px)" : "300px",
//             }}
//         >
//           <ul className="py-1 max-h-72 overflow-y-auto"> {/* Increased max-height */}
//             {linksToDisplay[openDropdownIndex].children.map((child) => (
//               <li key={child.name}>
//                 <NavLink
//                    to={child.link || '#'} // Provide fallback '#' if link missing
//                    onClick={closeMenus} // Close dropdown on item click
//                    style={({ isActive }) => ({
//                      backgroundColor: isActive ? currentColor : "",
//                      color: isActive ? "white" : "",
//                    })}
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 w-full px-4 py-2 text-sm ${
//                       isActive ? "text-white font-semibold" : "text-gray-700 dark:text-gray-200"
//                     } hover:bg-gray-100 dark:hover:bg-gray-600 whitespace-nowrap`
//                   }
//                 >
//                   {child.icon}
//                   <span className="capitalize">{child.name}</span>
//                 </NavLink>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Topbar;





// // 🧠 Imports remain the same
// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import { MdOutlineCancel } from "react-icons/md";
// import { AiOutlineMenu, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
// import { TooltipComponent } from "@syncfusion/ej2-react-popups";
// import { links as adminLinks, Thirdpartylinks } from "../data/dummy";
// import { Studentlinks, Teacherslinks, Parentslinks } from "../data/dummy";
// import { useStateContext } from "../contexts/ContextProvider";
// import { BiSolidSchool } from "react-icons/bi";
// import logo from "../../src/ShikshMitraWebsite/digitalvidya.png";

// const Topbar = () => {
//   const { currentColor, screenSize, userRole } = useStateContext();
//   const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
//   const [dropdownPosition, setDropdownPosition] = useState(null);
//   const topbarRef = useRef(null);
//   const openDropdownRef = useRef(null);
//   const location = useLocation();

//   // Role-based Links
//   let linksToDisplay = [];
//   let dashboardPath = "/";
//   if (userRole === "student") {
//     linksToDisplay = Studentlinks[0]?.links || [];
//     dashboardPath = "/student";
//   } else if (userRole === "teacher") {
//     linksToDisplay = Teacherslinks[0]?.links || [];
//     dashboardPath = "/teacher";
//   } 
//   else if (userRole === "parent") {
//     linksToDisplay = Parentslinks[0]?.links || [];
//     dashboardPath = "/parent";
//   }
//   else if (userRole === "thirdparty") {
//     linksToDisplay = Thirdpartylinks[0]?.links || [];
//     // dashboardPath = "/school-details";///
//     dashboardPath = "/thirdparty";
//   }
//    else {
//     linksToDisplay = adminLinks;
//     dashboardPath = "/admin";
//   }

//   useEffect(() => {
//     setOpenDropdownIndex(null);
//     setDropdownPosition(null);
//   }, [location]);

//   const handleClickOutside = useCallback((event) => {
//     setTimeout(() => {
//       if (
//         openDropdownRef.current &&
//         !openDropdownRef.current.contains(event.target) &&
//         !event.target.closest("[data-dropdown-trigger]")
//       ) {
//         setOpenDropdownIndex(null);
//         setDropdownPosition(null);
//       }
//     }, 100);
//   }, []);

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [handleClickOutside]);

//   const handleDropdownToggle = (index, event) => {
//     event.stopPropagation();
//     const isOpen = openDropdownIndex === index;
//     if (isOpen) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     } else {
//       const button = event.currentTarget;
//       const rect = button.getBoundingClientRect();
//       setOpenDropdownIndex(index);
//       setDropdownPosition({
//         top: rect.bottom + window.scrollY,
//         left: rect.left + window.scrollX,
//       });
//     }
//   };

//   const closeMenus = () => {
//     setOpenDropdownIndex(null);
//     setDropdownPosition(null);
//   };

//   const activeLinkClass = `flex items-center gap-1 px-2 py-1 rounded-md text-white text-[12px] uppercase whitespace-nowrap`;
//   const normalLinkClass = `flex items-center gap-1 px-2 py-1 rounded-md text-[12px] uppercase text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap`;

//   const renderLinks = () =>
//     linksToDisplay.map((item, index) => (
//       <div key={item.name || item.title || index} className="flex-shrink-0">
//         {item.children ? (
//           <button
//             data-dropdown-trigger
//             data-index={index}
//             onClick={(e) => handleDropdownToggle(index, e)}
//             className={`${normalLinkClass} items-center w-full`}
//             style={{ backgroundColor: openDropdownIndex === index ? "rgba(0,0,0,0.05)" : "" }}
//           >
//             <span className="flex items-center gap-2"
//             style={{color:currentColor}}
//             >
//               {item.icon}
//               {item.name}
//             </span>
//             {openDropdownIndex === index ? <AiOutlineUp /> : <AiOutlineDown />}
//           </button>
//         ) : (
//           <NavLink
//             to={item.link || `/${item.route}`}
//             onClick={closeMenus}
//             style={({ isActive }) => ({
//               backgroundColor: isActive ? currentColor : "",
//               color: isActive ? "white" : currentColor,
//             })}
//             className={({ isActive }) => `${isActive ? activeLinkClass : normalLinkClass}`}
//           >
//             {item.icon}
//             {item.name}
//           </NavLink>
//         )}
//       </div>
//     ));

//   return (
//     <div
//       ref={topbarRef}
//       className="relative flex flex-col pt-1 bg-white dark:bg-main-dark-bg border-b dark:border-gray-700 z-30"
//     >
//       {/* <div className="flex justify-between items-center px-2 py-1">
//         <Link to={dashboardPath} onClick={closeMenus} className="flex items-center">
//           {logo ? (
//             <img src={logo} alt="Logo" className="h-8 w-auto" />
//           ) : (
//             <BiSolidSchool className="text-2xl text-blue-600" />
//           )}
//         </Link>
//       </div> */}

//       {/* 🔄 Unified nav section for all screen sizes */}
//       <div className="w-full overflow-x-auto px-2">
//         <nav className="flex items-center gap-1 flex-nowrap pb-[2px]">
//           {renderLinks()}
//         </nav>
//       </div>

//       {/* 🔽 Dropdown */}
//       {openDropdownIndex !== null && dropdownPosition && (
//         <div
//           ref={openDropdownRef}
//           className="absolute bg-white dark:bg-secondary-dark-bg rounded-md shadow-xl z-50 border dark:border-gray-700"
//           style={{
//             position: "fixed",
//             top: `${dropdownPosition.top}px`,
//             left: `${dropdownPosition.left}px`,
//             width: screenSize <= 640 ? "90%" : "auto",
//             minWidth: "200px",
//           }}
//         >
//           <ul className="py-1">
//             {linksToDisplay[openDropdownIndex]?.children.map((child) => (
//               <li key={child.name}>
//                 <NavLink
//                   to={child.link}
//                   onClick={closeMenus}
//                   style={({ isActive }) => ({
//                     backgroundColor: isActive ? currentColor : "",
//                     color: isActive ? "white" : "",
//                   })}
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 w-full px-4 py-2 text-sm ${
//                       isActive ? "text-white font-semibold" : "text-gray-700 dark:text-gray-200"
//                     } hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black whitespace-nowrap`
//                   }
//                 >
//                   {child.icon}
//                   <span className="capitalize">{child.name}</span>
//                 </NavLink>
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Topbar;





// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import { GiExplosiveMaterials } from "react-icons/gi";
// import { MdOutlineCancel } from "react-icons/md";
// import { AiOutlineMenu, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
// import { TooltipComponent } from "@syncfusion/ej2-react-popups";
// import { links as adminLinks } from "../data/dummy";
// import { Studentlinks } from "../data/dummy";
// import { Teacherslinks } from "../data/dummy";
// import { Parentslinks } from "../data/dummy";
// import { useStateContext } from "../contexts/ContextProvider";
// import { BiSolidSchool } from "react-icons/bi";
// import logo from "../../src/ShikshMitraWebsite/digitalvidya.png";

// // --- Constants ---
// const TOPBAR_HEIGHT_APPROX = "65px";

// const Topbar = () => {
//   // --- State ---
//   const { currentColor, activeMenu, setActiveMenu, screenSize, userRole } = useStateContext();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
//   const [dropdownPosition, setDropdownPosition] = useState(null);

//   // --- Refs ---
//   const topbarRef = useRef(null);
//   const openDropdownRef = useRef(null);

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
//   useEffect(() => {
//     // Close desktop dropdown if screen becomes mobile
//     if (openDropdownIndex !== null && screenSize <= 900) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     }
//     // Close mobile drawer if screen becomes desktop
//     if (isMobileMenuOpen && screenSize > 900) {
//       setIsMobileMenuOpen(false);
//     }
//   }, [screenSize, openDropdownIndex, isMobileMenuOpen]);

//   // Close dropdown on clicking outside
//   const handleClickOutside = useCallback((event) => {
//     if (
//       openDropdownRef.current &&
//       !openDropdownRef.current.contains(event.target) &&
//       !event.target.closest("[data-dropdown-trigger]")
//     ) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     }
//   }, []);

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [handleClickOutside]);

//   const handleScroll = useCallback(() => {
//     if (openDropdownIndex !== null && dropdownPosition !== null) {
//       // Attempt to reposition based on button's current location
//       const triggerButton = topbarRef.current?.querySelector(
//         `[data-dropdown-trigger][data-index="${openDropdownIndex}"]`
//       );
//       if (triggerButton) {
//         const rect = triggerButton.getBoundingClientRect();
//         setDropdownPosition({
//           top: rect.bottom + window.scrollY,
//           left: rect.left + window.scrollX,
//         });
//       } else {
//         // Fallback: close if button not found
//         setOpenDropdownIndex(null);
//         setDropdownPosition(null);
//       }
//     }
//   }, [openDropdownIndex, dropdownPosition]);

//   useEffect(() => {
//     window.addEventListener("scroll", handleScroll, true);
//     return () => window.removeEventListener("scroll", handleScroll, true);
//   }, [handleScroll]);

//   const handleMobileMenuToggle = () => {
//     setIsMobileMenuOpen(!isMobileMenuOpen);
//     // Close dropdown if mobile menu is opened
//     if (!isMobileMenuOpen) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     }
//   };

//   const handleAdminDropdownToggle = (index, event) => {
//     event.stopPropagation();

//     const currentlyOpen = openDropdownIndex === index;

//     if (currentlyOpen) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     } else {
//       setOpenDropdownIndex(index);
//       const buttonElement = event.currentTarget;
//       const rect = buttonElement.getBoundingClientRect();
//       setDropdownPosition({
//         top: rect.bottom + window.scrollY,
//         left: rect.left + window.scrollX,
//       });
//     }
//   };

//   const closeAllMenus = () => {
//     setIsMobileMenuOpen(false);
//     setOpenDropdownIndex(null);
//     setDropdownPosition(null);
//   };

//   // --- Style Classes ---
//   const topbarActiveLink = `flex items-center gap-1 px-2 py-1 rounded-md text-white text-[12px] uppercase whitespace-nowrap`;
//   const topbarNormalLink = `flex items-center gap-1 px-2 py-1 rounded-md text-[12px] uppercase text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap`;

//   const renderTopbarItems = () => {
//     return linksToDisplay.map((item, index) => (
//       <div key={item.name || item.title || index} className="flex-shrink-0">
//         {item.children ? (
//           // --- Item HAS Children ---
//           <>
//             <button
//               data-dropdown-trigger
//               data-index={index}
//               onClick={(e) => handleAdminDropdownToggle(index, e)}
//               className={`${topbarNormalLink} items-center w-full`}
//               style={{
//                 backgroundColor: openDropdownIndex === index ? "rgba(0,0,0,0.05)" : "",
//               }}
//             >
//               <span className="flex items-center gap-2">
//                 {item.icon}
//                 {item.name}
//               </span>
//               {openDropdownIndex === index ? <AiOutlineUp /> : <AiOutlineDown />}
//             </button>
//           </>
//         ) : (
//           // --- Regular Link Item (NO Children) ---
//           <NavLink
//             to={item.link || `/${item.route}`}
//             onClick={closeAllMenus}
//             style={({ isActive }) => ({
//               backgroundColor: isActive ? currentColor : "",
//               color: isActive ? "white" : "",
//             })}
//             className={({ isActive }) => `${isActive ? topbarActiveLink : topbarNormalLink}`}
//           >
//             {item.icon}
//             {item.name}
//           </NavLink>
//         )}
//       </div>
//     ));
//   };

//   // --- Component Return ---
//   return (
//     <div
//       ref={topbarRef}
//       className="relative flex flex-col pt-1 bg-white dark:bg-main-dark-bg border-b dark:border-gray-700 z-30 print:hidden"
//     >
//       {/* Top Section with Logo and Mobile Menu Toggle */}
//       <div className="flex justify-between items-center px-2 py-1">
//         {/* Logo Section */}
//         <div className="flex-shrink-0">
//           <Link to={dashboardPath} className="flex items-center" onClick={closeAllMenus}>
//             {logo ? (
//               <img src={logo} alt="Logo" className="h-8 w-auto" />
//             ) : (
//               <BiSolidSchool className="text-2xl text-blue-600" />
//             )}
//           </Link>
//         </div>

//         {/* Mobile Menu Toggle Button */}
//         <div className="md:hidden">
//           <TooltipComponent position="BottomCenter">
//             <button
//               type="button"
//               onClick={handleMobileMenuToggle}
//               style={{ color: currentColor }}
//               className="text-xl rounded-full p-2 hover:bg-light-gray dark:hover:bg-gray-600"
//             >
//               {isMobileMenuOpen ? <MdOutlineCancel /> : <AiOutlineMenu />}
//             </button>
//           </TooltipComponent>
//         </div>
//       </div>

//       {/* Desktop Navigation - Always visible on desktop */}
//       <div className="hidden md:block overflow-hidden">
//         <nav className="flex items-center gap-1 overflow-x-auto flex-nowrap pb-[2px] px-2">
//           {renderTopbarItems()}
//         </nav>
//       </div>

//       {/* Mobile Navigation - Consistent with desktop but toggleable */}
//       <div className={`md:hidden overflow-hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
//         <nav className="flex items-center gap-1 overflow-x-auto flex-nowrap pb-[2px] px-2">
//           {renderTopbarItems()}
//         </nav>
//       </div>

//       {/* Dropdown for both desktop and mobile */}
//       {openDropdownIndex !== null && dropdownPosition && (
//         <div
//           ref={openDropdownRef}
//           className="absolute bg-white dark:bg-secondary-dark-bg rounded-md shadow-xl z-50 border dark:border-gray-700"
//           style={{ 
//             position: "fixed", 
//             top: `${dropdownPosition.top}px`, 
//             left: `${dropdownPosition.left}px`,
//             width: screenSize <= 640 ? "90%" : "auto",
//             minWidth: "200px" 
//           }}
//         >
//           {linksToDisplay[openDropdownIndex]?.children && (
//             <ul className="py-1">
//               {linksToDisplay[openDropdownIndex].children.map((child) => (
//                 <li key={child.name}>
//                   <NavLink
//                     to={child.link}
//                     onClick={closeAllMenus}
//                     style={({ isActive }) => ({
//                       backgroundColor: isActive ? currentColor : "",
//                       color: isActive ? "white" : "",
//                     })}
//                     className={({ isActive }) =>
//                       `flex items-center gap-3 w-full px-4 py-2 text-sm ${
//                         isActive ? "text-white font-semibold" : "text-gray-700 dark:text-gray-200"
//                       } hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black whitespace-nowrap`
//                     }
//                   >
//                     {child.icon}
//                     <span className="capitalize">{child.name}</span>
//                   </NavLink>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default Topbar;



// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { Link, NavLink, useLocation } from "react-router-dom";
// import { GiExplosiveMaterials } from "react-icons/gi";
// import { MdOutlineCancel } from "react-icons/md";
// import { AiOutlineMenu, AiOutlineDown, AiOutlineUp } from "react-icons/ai";
// import { TooltipComponent } from "@syncfusion/ej2-react-popups";
// import { links as adminLinks } from "../data/dummy";
// import { Studentlinks } from "../data/dummy";
// import { Teacherslinks } from "../data/dummy";
// import { Parentslinks } from "../data/dummy";
// import { useStateContext } from "../contexts/ContextProvider";
// import { BiSolidSchool } from "react-icons/bi";
// import logo from "../../src/ShikshMitraWebsite/digitalvidya.png";

// // --- Constants ---
// const TOPBAR_HEIGHT_APPROX = "65px";

// const Topbar = () => {
//   // --- State ---
//   const { currentColor, activeMenu, setActiveMenu, screenSize, userRole } = useStateContext();
//   const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
//   const [openDropdownIndex, setOpenDropdownIndex] = useState(null);
//   const [dropdownPosition, setDropdownPosition] = useState(null);

//   // --- Refs ---
//   const topbarRef = useRef(null);
//   const openDropdownRef = useRef(null);

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
//   useEffect(() => {
//     // Close desktop dropdown if screen becomes mobile
//     if (openDropdownIndex !== null && screenSize <= 900) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     }
//     // Close mobile drawer if screen becomes desktop
//     if (isMobileMenuOpen && screenSize > 900) {
//       setIsMobileMenuOpen(false);
//     }
//   }, [screenSize, openDropdownIndex, isMobileMenuOpen]);

//   // Close DESKTOP dropdown on clicking outside
//   const handleClickOutside = useCallback((event) => {
//     // Close Desktop Dropdown
//     if (
//       openDropdownRef.current &&
//       !openDropdownRef.current.contains(event.target) &&
//       !event.target.closest("[data-dropdown-trigger]")
//     ) {
//       setOpenDropdownIndex(null);
//       setDropdownPosition(null);
//     }
//   }, []);

//   useEffect(() => {
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, [handleClickOutside]);

//   const handleScroll = useCallback(() => {
//     if (openDropdownIndex !== null && dropdownPosition !== null && screenSize > 900) {
//       // Attempt to reposition based on button's current location
//       const triggerButton = topbarRef.current?.querySelector(
//         `[data-dropdown-trigger][data-index="${openDropdownIndex}"]`
//       );
//       if (triggerButton) {
//         const rect = triggerButton.getBoundingClientRect();
//         setDropdownPosition({
//           top: rect.bottom + window.scrollY,
//           left: rect.left + window.scrollX,
//         });
//       } else {
//         // Fallback: close if button not found
//         setOpenDropdownIndex(null);
//         setDropdownPosition(null);
//       }
//     }
//   }, [openDropdownIndex, dropdownPosition, screenSize]);

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
//     event.stopPropagation();

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
//       // --- Mobile Logic ---
//       setOpenDropdownIndex(currentlyOpen ? null : index);
//       setDropdownPosition(null);
//     }
//   };

//   const closeAllMenus = () => {
//     setIsMobileMenuOpen(false);
//     setOpenDropdownIndex(null);
//     setDropdownPosition(null);
//   };

//   // --- Style Classes ---
//   const topbarActiveLink = `flex items-center gap-1 px-2 py-1 rounded-md text-white text-[10px] uppercase whitespace-nowrap`;
//   const topbarNormalLink = `flex items-center gap-1 px-2 py-1 rounded-md text-[10px] uppercase text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700 whitespace-nowrap`;
  
//   // Enhanced mobile styles for better readability and tap targets
//   const mobileActiveLink = `flex items-center gap-2 pl-4 pr-2 py-3 rounded-lg text-white text-md font-medium`;
//   const mobileNormalLink = `flex items-center gap-2 pl-4 pr-2 py-3 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray`;

//   const renderTopbarItems = (linkStyleType) => {
//     const isMobile = linkStyleType === "mobile";
//     const activeStyle = isMobile ? mobileActiveLink : topbarActiveLink;
//     const normalStyle = isMobile ? mobileNormalLink : topbarNormalLink;

//     return linksToDisplay.map((item, index) => (
//       <div key={item.name || item.title || index} className={`${isMobile ? "w-full" : "flex-shrink-0"}`}>
//         {item.children ? (
//           // --- Item HAS Children ---
//           <>
//             <button
//               data-dropdown-trigger
//               data-index={index}
//               onClick={(e) => handleAdminDropdownToggle(index, e)}
//               className={`${normalStyle} items-center w-full ${isMobile ? "justify-between" : ""}`}
//               style={{
//                 backgroundColor: !isMobile && openDropdownIndex === index ? "rgba(0,0,0,0.05)" : "",
//               }}
//             >
//               <span className="flex items-center gap-2">
//                 {item.icon && <span className={`${isMobile ? "text-lg" : ""}`}>{item.icon}</span>}
//                 <span className={`${isMobile ? "font-medium" : ""}`}>{item.name}</span>
//               </span>
//               {openDropdownIndex === index ? (
//                 <AiOutlineUp className={isMobile ? "text-lg" : ""} />
//               ) : (
//                 <AiOutlineDown className={isMobile ? "text-lg" : ""} />
//               )}
//             </button>

//             {/* --- Mobile Accordion Content (Rendered inline within mobile drawer) --- */}
//             {isMobile && openDropdownIndex === index && item.children && (
//               <div className="pl-5 border-l-2 border-gray-200 dark:border-gray-600 ml-4 my-1">
//                 <ul>
//                   {item.children.map((child) => (
//                     <li key={child.name}>
//                       <NavLink
//                         to={child.link}
//                         onClick={closeAllMenus}
//                         style={({ isActive }) => ({
//                           backgroundColor: isActive ? currentColor : "",
//                           color: isActive ? "white" : "",
//                         })}
//                         className={({ isActive }) =>
//                           `${
//                             isActive ? mobileActiveLink : mobileNormalLink
//                           } py-2.5 text-sm pl-2 mb-1 flex items-center`
//                         }
//                       >
//                         {child.icon && <span className="text-lg mr-2">{child.icon}</span>}
//                         <span className="capitalize">{child.name}</span>
//                       </NavLink>
//                     </li>
//                   ))}
//                 </ul>
//               </div>
//             )}
//           </>
//         ) : (
//           // --- Regular Link Item (NO Children) ---
//           <NavLink
//             to={item.link || `/${item.route}`}
//             onClick={closeAllMenus}
//             style={({ isActive }) => ({
//               backgroundColor: isActive ? currentColor : "",
//               color: isActive ? "white" : "",
//             })}
//             className={({ isActive }) => `${isActive ? activeStyle : normalStyle}`}
//           >
//             {item.icon && <span className={`${isMobile ? "text-lg" : ""}`}>{item.icon}</span>}
//             <span className={`capitalize ${isMobile ? "font-medium" : ""}`}>{item.name}</span>
//           </NavLink>
//         )}
//       </div>
//     ));
//   };

//   // --- Component Return ---
//   return (
//     <div
//       ref={topbarRef}
//       className="relative flex justify-between items-center pt-1 bg-white dark:bg-main-dark-bg border-b dark:border-gray-700 z-30 print:hidden"
//     >
//       {/* Logo Section (optional) */}
//       <div className="flex-shrink-0 ml-2">
//         <Link to={dashboardPath} className="flex items-center" onClick={closeAllMenus}>
//           {logo ? (
//             <img src={logo} alt="Logo" className="h-8 w-auto" />
//           ) : (
//             <BiSolidSchool className="text-2xl text-blue-600" />
//           )}
//         </Link>
//       </div>

//       {/* Desktop Navigation */}
//       <div className="flex-1 min-w-0 overflow-hidden mx-2 hidden md:block">
//         <nav className={`flex items-center gap-1 overflow-x-auto flex-nowrap pb-[2px]`}>
//           {renderTopbarItems("desktop")}
//         </nav>
//       </div>

//       {/* Mobile Menu Toggle Button */}
//       <div className="flex items-center gap-2 flex-shrink-0">
//         <div className="md:hidden ml-1 sm:ml-2">
//           <TooltipComponent position="BottomCenter">
//             <button
//               type="button"
//               onClick={handleMobileMenuToggle}
//               style={{ color: currentColor }}
//               className="text-xl rounded-full p-3 hover:bg-light-gray dark:hover:bg-gray-600"
//             >
//               {isMobileMenuOpen ? <MdOutlineCancel /> : <AiOutlineMenu />}
//             </button>
//           </TooltipComponent>
//         </div>
//       </div>

//       {/* Desktop Dropdown */}
//       {openDropdownIndex !== null && !isMobileMenuOpen && dropdownPosition && screenSize > 900 && (
//         <div
//           ref={openDropdownRef}
//           className="absolute w-52 bg-white dark:bg-secondary-dark-bg rounded-md shadow-xl z-50 border dark:border-gray-700"
//           style={{ position: "fixed", top: `${70}px`, left: `${dropdownPosition.left}px` }}
//         >
//           {linksToDisplay[openDropdownIndex]?.children && (
//             <ul className="py-1">
//               {linksToDisplay[openDropdownIndex].children.map((child) => (
//                 <li key={child.name}>
//                   <NavLink
//                     to={child.link}
//                     onClick={closeAllMenus}
//                     style={({ isActive }) => ({
//                       backgroundColor: isActive ? currentColor : "",
//                       color: isActive ? "white" : "",
//                     })}
//                     className={({ isActive }) =>
//                       `flex items-center gap-3 w-full px-4 py-2 text-sm ${
//                         isActive ? "text-white font-semibold" : "text-gray-700 dark:text-gray-200"
//                       } hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-black whitespace-nowrap`
//                     }
//                   >
//                     {child.icon}
//                     <span className="capitalize">{child.name}</span>
//                   </NavLink>
//                 </li>
//               ))}
//             </ul>
//           )}
//         </div>
//       )}

//       {/* Mobile Menu Drawer */}
//       {isMobileMenuOpen && screenSize <= 900 && (
//         <div
//           className={`
//             fixed top-[65px] left-0 w-full bg-white dark:bg-secondary-dark-bg
//             shadow-lg z-40 md:hidden border-t dark:border-gray-700
//             overflow-y-auto transition-all duration-300 ease-in-out
//             h-[calc(100vh-65px)]
//           `}
//         >
//           {/* Mobile Header */}
//           <div className="flex items-center justify-between px-4 py-3 border-b dark:border-gray-700">
//             <span className="text-lg font-medium text-gray-800 dark:text-gray-200">Menu</span>
//             <button
//               onClick={handleCloseMobileMenu}
//               className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
//             >
//               <MdOutlineCancel className="text-xl" />
//             </button>
//           </div>
          
//           {/* Mobile Navigation Items */}
//           <nav className="flex flex-col gap-1.5 px-4 pt-3 pb-6">
//             {renderTopbarItems("mobile")}
//           </nav>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Topbar;




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
// // import '../App.css'
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


//   const topbarActiveLink = `flex items-center gap-1 px-2 py-1 rounded-md text-white text-[10px] uppercase  whitespace-nowrap`;
//   const topbarNormalLink = `flex items-center gap-1 px-2 py-1 rounded-md text-[10px] uppercase text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-gray-100 dark:hover:bg-gray-700  whitespace-nowrap`;
//   const mobileActiveLink = `flex items-center gap-1 pl-4 pr-2 py-2.5 rounded-lg text-white text-md `; // Added 
//   const mobileNormalLink = `flex items-center gap-1 pl-4 pr-2 py-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray`;

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
//            {item.name}
//             {/* <span className="capitalize cursor-pointer">{item.name}</span> */}
//           </NavLink>
//         )}
//       </div>
//     ));
//   };

//   // --- Component Return ---
//   return (
//     <div 
//     ref={topbarRef} 
//     className="relative flex justify-between items-center pt-1 bg-white dark:bg-main-dark-bg  border-b dark:border-gray-700 z-30 print:hidden">


//       <div className="flex-1 min-w-0 overflow-hidden mx-2  hidden md:block">
//         <nav className={`
//             flex items-center gap-1  overflow-x-auto flex-nowrap pb-[2px]
           
//         `}>
        
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
//           overflow-y-auto 
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
