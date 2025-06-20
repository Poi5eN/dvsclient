// 🧠 Imports
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { MdOutlineCancel } from "react-icons/md";
import {
  AiOutlineMenu,
  AiOutlineDown,
  AiOutlineUp,
  // AiOutlineLeft, // Using emoji
  // AiOutlineRight, // Using emoji
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
  const [dropdownPosition, setDropdownPosition] = useState(null); // For desktop dropdown
  const [indicatorStyle, setIndicatorStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // ✨ State for mobile menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Refs ---
  const topbarRef = useRef(null);
  const openDropdownRef = useRef(null); // For desktop dropdown
  const navContainerRef = useRef(null);
  const navWrapperRef = useRef(null);

  // --- Hooks ---
  const location = useLocation();

  // --- Role-based Links Logic ---
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

  // --- Mobile Menu Toggle and Close ---
  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const closeMobileMenuAndDropdowns = useCallback(() => {
    setIsMobileMenuOpen(false);
    setOpenDropdownIndex(null);
    setDropdownPosition(null);
  }, []);

  // --- Body Scroll Lock for Mobile Menu ---
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto'; // Cleanup on unmount
    };
  }, [isMobileMenuOpen]);

  // --- Desktop Dropdown Logic ---
  useEffect(() => {
    // Close desktop dropdown on location change
    setOpenDropdownIndex(null);
    setDropdownPosition(null);
  }, [location]);

  const handleClickOutside = useCallback((event) => {
    if (
      openDropdownRef.current &&
      !openDropdownRef.current.contains(event.target) &&
      !event.target.closest("[data-dropdown-trigger]") &&
      !event.target.closest(".scroll-arrow")
    ) {
      setOpenDropdownIndex(null);
      setDropdownPosition(null);
    }
  }, []); // Removed setTimeout, not strictly necessary

  useEffect(() => {
    // Attach listener only for desktop dropdowns and when mobile menu is closed
    if (openDropdownIndex !== null && !isMobileMenuOpen && dropdownPosition) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openDropdownIndex, dropdownPosition, isMobileMenuOpen, handleClickOutside]);


  // --- Function to Update Scroll Button States ---
  const updateScrollButtonState = useCallback(() => {
    const container = navContainerRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;
    const scrollEndThreshold = 1;
    setCanScrollLeft(scrollLeft > scrollEndThreshold);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - scrollEndThreshold);
  }, []);


  // --- Effect: Horizontal Scroll, Indicator & Scroll Buttons Update (For Desktop Nav) ---
  useEffect(() => {
    const navContainer = navContainerRef.current;
    if (!navContainer) return; // Only proceed if desktop nav is rendered

    const handleWheelScroll = (event) => {
      const currentNavContainer = navContainerRef.current; // Re-check ref inside handler
      if (!currentNavContainer) return;
      const canScrollHorizontally = currentNavContainer.scrollWidth > currentNavContainer.clientWidth;
      if (event.deltaY !== 0 && canScrollHorizontally) {
        event.preventDefault();
        currentNavContainer.scrollLeft += event.deltaY;
      }
    };

    const handleScroll = () => requestAnimationFrame(updateScrollButtonState);
    
    const updateIndicatorPosition = () => {
        const currentNavContainer = navContainerRef.current; // Re-check ref
        if (!currentNavContainer) return;
        const activeLinkElement = currentNavContainer.querySelector('a.active-top-nav-link');
        if (activeLinkElement) {
            const newLeft = activeLinkElement.offsetLeft;
            const newWidth = activeLinkElement.offsetWidth;
            setIndicatorStyle({ left: newLeft, width: newWidth, opacity: 1 });
            const containerScrollLeft = currentNavContainer.scrollLeft;
            const containerWidth = currentNavContainer.clientWidth;
            const linkRightEdge = newLeft + newWidth;
            if (linkRightEdge > containerScrollLeft + containerWidth) {
                currentNavContainer.scrollTo({ left: linkRightEdge - containerWidth + 15, behavior: 'smooth' });
            } else if (newLeft < containerScrollLeft) {
                currentNavContainer.scrollTo({ left: newLeft - 15, behavior: 'smooth' });
            }
        } else {
            setIndicatorStyle(prev => ({ ...prev, opacity: 0, width: 0 }));
        }
    }

    const handleResize = () => {
        updateScrollButtonState();
        updateIndicatorPosition();
    };

    navContainer.addEventListener('wheel', handleWheelScroll, { passive: false });
    navContainer.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    updateIndicatorPosition();
    updateScrollButtonState();

    return () => {
      if (navContainer) {
        navContainer.removeEventListener('wheel', handleWheelScroll);
        navContainer.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [location, linksToDisplay, updateScrollButtonState, currentColor, isMobileMenuOpen]); // Re-run if mobile menu opens/closes (as navContainer might not exist)

  // --- Event Handlers for Dropdowns ---
  const handleDesktopDropdownToggle = (index, event) => {
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
        top: rect.bottom + window.scrollY + 4, // Use window.scrollY for fixed positioning
        left: rect.left + window.scrollX,
      });
    }
  };

  const handleMobileDropdownToggle = (index, event) => {
    event.stopPropagation();
    setOpenDropdownIndex(prevIndex => (prevIndex === index ? null : index));
    // No dropdownPosition for mobile accordion
  };

  // --- Scroll Arrow Click Handlers (Desktop) ---
  const handleScrollLeft = () => {
    const container = navContainerRef.current;
    if (!container) return;
    const scrollAmount = Math.min(container.clientWidth * 0.8, 300);
    container.scrollTo({ left: container.scrollLeft - scrollAmount, behavior: 'smooth' });
  };

  const handleScrollRight = () => {
    const container = navContainerRef.current;
    if (!container) return;
    const scrollAmount = Math.min(container.clientWidth * 0.8, 300);
    container.scrollTo({ left: container.scrollLeft + scrollAmount, behavior: 'smooth' });
  };

  // --- Link Styling Classes (Desktop) ---
  const activeLinkClass = `flex items-center gap-1 px-3 py-[2px] rounded-tl-md  rounded-tr-md text-[12px] uppercase whitespace-nowrap font-semibold active-top-nav-link`;
  const normalLinkClass = `flex items-center gap-1 px-3 py-[2px] rounded-tl-md  rounded-tr-md text-[12px] uppercase text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100 whitespace-nowrap`;

  // --- Render Links Functions ---
  const renderDesktopLinks = () =>
    linksToDisplay.map((item, index) => (
      <div key={`${item.name}-desktop-${index}`} className="flex-shrink-0 relative group">
        {item.children && item.children.length > 0 ? (
          <button
            data-dropdown-trigger
            data-index={index}
            onClick={(e) => handleDesktopDropdownToggle(index, e)}
            className={`${normalLinkClass} items-center w-full justify-between`}
            style={{
              backgroundColor: openDropdownIndex === index && !isMobileMenuOpen && dropdownPosition ? 'rgba(0,0,0,0.05)' : '',
              color: currentColor
            }}
          >
            <span className="flex items-center gap-1">
              {item.icon}
              {item.name}
            </span>
            {openDropdownIndex === index && !isMobileMenuOpen && dropdownPosition ? <AiOutlineUp className="ml-1 text-xs"/> : <AiOutlineDown className="ml-1 text-xs"/>}
          </button>
        ) : item.link || item.route ? (
          <NavLink
            to={item.link ? item.link : `/${item.route}`.replace('//', '/')}
            onClick={closeMobileMenuAndDropdowns} // Closes dropdowns & mobile menu
            style={({ isActive }) => ({
              color: isActive ? "white" : currentColor,
              backgroundColor: isActive ? currentColor :  '',
            })}
            className={({ isActive }) => `${isActive ? activeLinkClass : normalLinkClass}`}
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

  const renderMobileNavLinks = () =>
    linksToDisplay.map((item, index) => (
      <div key={`${item.name}-mobile-${index}`} className="mb-1">
        {item.children && item.children.length > 0 ? (
          <>
            <button
              onClick={(e) => handleMobileDropdownToggle(index, e)}
              className="flex items-center justify-between w-full p-3 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
              style={{ color: currentColor }}
            >
              <span className="flex items-center gap-3">
                {item.icon}
                <span className="uppercase font-medium text-gray-700 dark:text-gray-200">{item.name}</span>
              </span>
              {openDropdownIndex === index ? <AiOutlineUp className="text-xs text-gray-500 dark:text-gray-400"/> : <AiOutlineDown className="text-xs text-gray-500 dark:text-gray-400"/>}
            </button>
            {openDropdownIndex === index && (
              <ul className="pl-6 mt-1 space-y-1">
                {item.children.map((child) => (
                  <li key={child.name}>
                    <NavLink
                      to={child.link || '#'}
                      onClick={closeMobileMenuAndDropdowns}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? currentColor : "transparent",
                        color: isActive ? "white" : ( currentColor ), // Use theme color or specific text color
                      })}
                      className={({ isActive }) =>
                        `flex items-center gap-3 w-full px-3 py-2 text-xs rounded-md ${
                          isActive ? "font-semibold" : "text-gray-600 dark:text-gray-300"
                        } hover:bg-gray-50 dark:hover:bg-gray-600 whitespace-nowrap`
                      }
                    >
                      {child.icon}
                      <span className="uppercase">{child.name}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            )}
          </>
        ) : item.link || item.route ? (
          <NavLink
            to={item.link ? item.link : `/${item.route}`.replace('//', '/')}
            onClick={closeMobileMenuAndDropdowns}
            style={({ isActive }) => ({
              backgroundColor: isActive ? currentColor : "transparent",
              color: isActive ? "white" : currentColor,
            })}
            className={({ isActive }) =>
              `flex items-center gap-3 w-full p-3 text-sm rounded-md ${
                isActive ? "font-semibold" : "text-gray-700 dark:text-gray-200"
              } hover:bg-gray-100 dark:hover:bg-gray-700`
            }
          >
            {item.icon}
            <span className="uppercase font-medium">{item.name}</span>
          </NavLink>
        ) : (
          <span className="flex items-center gap-3 w-full p-3 text-sm text-gray-500 dark:text-gray-400 opacity-60 cursor-default">
            {item.icon}
            <span className="uppercase font-medium">{item.name || item.title}</span>
          </span>
        )}
      </div>
    ));

  // --- Component Return JSX ---
  return (
    <div ref={topbarRef} className="relative z-40"> {/* Increased z-index slightly */}
      {/* Main Visible Bar Area */}
      <div className="flex items-center justify-between py-1 bg-white dark:bg-main-dark-bg border-b dark:border-gray-700 shadow-sm px-2 sm:px-4">
      {/* <div className="flex items-center justify-between h-14 bg-white dark:bg-main-dark-bg border-b dark:border-gray-700 shadow-sm px-2 sm:px-4"> */}
        {/* Left Side: Hamburger (Mobile) */}
        <div className="flex-shrink-0 md:hidden">
          <button
            aria-label="Open navigation menu"
            onClick={toggleMobileMenu}
            className="p-2 text-2xl text-gray-700 dark:text-gray-200 hover:opacity-75"
            style={{ color: currentColor }}
          >
            <AiOutlineMenu />
          </button>
        </div>
        
        {/* Optional: Logo/Brand Name (Can be shown on mobile too if space allows) */}
        {/* <Link to="/" className="text-xl font-semibold hidden sm:block" style={{color: currentColor}}>ShikshMitra</Link> */}

        {/* Desktop Horizontal Scrollable Navigation - Hidden on Mobile, takes remaining space */}
        <div className="hidden md:flex flex-grow min-w-0 relative group h-full" ref={navWrapperRef}>
          <div
            ref={navContainerRef}
            className="flex-grow overflow-x-auto overflow-y-hidden px-8 scrollbar-hide h-full"
            style={{ scrollBehavior: "smooth" }}
          >
            <nav className="relative flex items-center gap-1 flex-nowrap h-full">
              {Array.isArray(linksToDisplay) && linksToDisplay.length > 0 ? (
                renderDesktopLinks()
              ) : (
                <div className="p-2 text-gray-500 text-xs whitespace-nowrap">No navigation links available.</div>
              )}
              <div
                className="absolute bottom-0 h-[3px] rounded-t-sm"
                style={{
                  ...indicatorStyle,
                  backgroundColor: currentColor,
                  transition: 'left 400ms ease-in-out, width 400ms ease-in-out, opacity 300ms ease-in-out',
                }}
              />
            </nav>
          </div>
          <button
            aria-label="Scroll Left"
            onClick={handleScrollLeft}
            className={`scroll-arrow absolute text-xl left-0 top-0 bottom-0 z-10 flex items-center justify-center px-1
                       bg-gradient-to-r from-white via-white dark:from-main-dark-bg dark:via-main-dark-bg to-transparent
                       text-orange-600 dark:text-gray-300 hover:text-black dark:hover:text-white
                       transition-opacity duration-200
                       ${canScrollLeft ? 'opacity-100 group-hover:opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
          >⬅️</button>
          <button
            aria-label="Scroll Right"
            onClick={handleScrollRight}
            className={`scroll-arrow text-xl absolute right-0 top-0 bottom-0 z-10 flex items-center justify-center px-1
                       bg-gradient-to-l from-white via-white dark:from-main-dark-bg dark:via-main-dark-bg to-transparent
                       text-orange-600 dark:text-gray-300 hover:text-black dark:hover:text-white
                       transition-opacity duration-200
                       ${canScrollRight ? 'opacity-100 group-hover:opacity-100 cursor-pointer' : 'opacity-0 pointer-events-none'}`}
          >➡️</button>
        </div>

        {/* Right Side Items (e.g., UserProfile, Notifications) - ensure it does not overlap with mobile hamburger */}
        <div className="flex items-center flex-shrink-0 ml-auto md:ml-2">
          {/* Example: <UserProfileIcon /> <NotificationBell /> */}
          {/* Add your existing right-side icons here */}
        </div>
      </div>

      {/* Mobile Sidebar & Overlay */}
      <>
        {/* Overlay */}
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden transition-opacity duration-300 ease-in-out
                     ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
          onClick={closeMobileMenuAndDropdowns}
          aria-hidden={!isMobileMenuOpen}
        />
        {/* Sidebar Content */}
        <div
          className={`fixed top-0 left-0 h-full w-64 sm:w-72 bg-white dark:bg-secondary-dark-bg shadow-xl z-50
                     transform transition-transform duration-300 ease-in-out md:hidden
                     ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-menu-title"
        >
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 h-14">
            <span id="mobile-menu-title" className="text-lg font-semibold" style={{ color: currentColor }}>
              Menu
            </span>
            <button
              aria-label="Close navigation menu"
              onClick={closeMobileMenuAndDropdowns}
              className="p-1 text-2xl text-gray-700 dark:text-gray-200 hover:opacity-75"
              style={{ color: currentColor }}
            >
              <MdOutlineCancel />
            </button>
          </div>
          <nav className="p-3 overflow-y-auto" style={{maxHeight: 'calc(100vh - 56px)'}}> {/* 56px = h-14 */}
            {Array.isArray(linksToDisplay) && linksToDisplay.length > 0 ? (
              renderMobileNavLinks()
            ) : (
              <div className="p-2 text-gray-500 text-sm">No links available.</div>
            )}
          </nav>
        </div>
      </>

      {/* Desktop Dropdown Menu Area */}
      {openDropdownIndex !== null && dropdownPosition && !isMobileMenuOpen && linksToDisplay[openDropdownIndex]?.children && (
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
                  onClick={closeMobileMenuAndDropdowns}
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

