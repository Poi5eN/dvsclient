import React, { useRef, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { GiExplosiveMaterials } from "react-icons/gi";
import { MdOutlineCancel } from "react-icons/md";
import { TooltipComponent } from "@syncfusion/ej2-react-popups";
import { links } from "../data/dummy";
import { Studentlinks } from "../data/dummy";
import { Teacherslinks } from "../data/dummy";
import { Parentslinks } from "../data/dummy";
import { useStateContext } from "../contexts/ContextProvider";
import { BiSolidSchool } from "react-icons/bi";
import logo from "../../src/ShikshMitraWebsite/digitalvidya.png";

const Sidebar = () => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const refs = useRef([]);
  const [openIndex, setOpenIndex] = useState(null);
  const handleMenuClick = (index) => {
    setOpenIndex(openIndex === index ? null : index);
    setSelectedIndex(index);
  };

  const { currentColor, activeMenu, setActiveMenu, screenSize, userRole } =
    useStateContext();  // Use userRole
  const [selectedId, setSelectedId] = useState(0);

  const handleCloseSideBar = (id) => {
    if (selectedId === id) {
      setSelectedId(0);
    } else {
      setSelectedId(id);
    }

    if (activeMenu !== undefined && screenSize <= 900) {
      setActiveMenu(false);
    }
  };

  const activeLink =
    "flex items-center gap-5  pl-4 pt-3 pb-2.5 rounded-lg  text-white  text-md m-2 duration-1000 cursor-pointer";
  const normalLink =
    "flex flex items-center hover:bg-white hover:shadow-lg gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2 duration-700 cursor-pointer";

  if (userRole === "student") { // Use userRole
    return (
      <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 bg-blend-overlay  dark:bg-main-dark-bg">
        {activeMenu && (
          <>
            <div className="flex justify-between items-center ">
              <Link
                style={{ color: currentColor }}
                to="/student"
                onClick={handleCloseSideBar}
                className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-full  flex justify-center items-center">
                    <img
                      src={logo}
                      alt="logo"
                      // className="h-[60px]  object-contain scale-125 "
                    />
                  </div>
                  <span className="text-blue-900 text-xl">Student</span>
                </div>
              </Link>
              <TooltipComponent content="Menu" position="BottomCenter">
                <button
                  type="button"
                  onClick={() => setActiveMenu(!activeMenu)}
                  style={{ color: currentColor }}
                  className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
                >
                  <MdOutlineCancel />
                </button>
              </TooltipComponent>
            </div>
            <div className="mt-10 overflow-x-scroll dark:bg-main-dark-bg">
              {Studentlinks.map((item) => (
                <div key={item.title}>
                  <Link
                    to="/student"
                    className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase"
                  >
                    {item.title}
                  </Link>
                  {item.links.map((link) => (
                    <NavLink
                      to={`/${link.route}`}
                      key={link.name}
                      onClick={handleCloseSideBar}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? currentColor : "",
                      })}
                      className={({ isActive }) =>
                        isActive ? activeLink : normalLink
                      }
                    >
                      {link.icon}
                      <span className="capitalize cursor-pointer ">
                        {link.name}
                      </span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  } else if (userRole === "teacher") { // Use userRole
    return (
      <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 bg-blend-overlay dark:bg-main-dark-bg">
        {activeMenu && (
          <>
            <div className="flex justify-between items-center ">
              <Link
                to="/teacher"
                style={{ color: currentColor }}
                onClick={handleCloseSideBar}
                className="items-center gap-3 ml-4  flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
                // className="items-center gap-3 ml-4 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-full  flex justify-center items-center">
                    {/* <img
                      src={logo}
                      className="h-[60px]  object-contain scale-125 "
                      alt="logo"
                    /> */}
                      <img
                      src={logo}
                      className="w-32  object-contain"
                      alt="logo"
                      // className="h-[60px]  object-contain scale-125 "
                    />
                  </div>
                  {/* <span style={{ color: currentColor }}>Teacher</span> */}
                </div>
              </Link>
              <TooltipComponent content="Menu" position="BottomCenter">
                <button
                  type="button"
                  onClick={() => setActiveMenu(!activeMenu)}
                  style={{ color: currentColor }}
                  className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
                >
                  <MdOutlineCancel />
                </button>
              </TooltipComponent>
            </div>
            <div className="">
              {/* <div className="mt-10"> */}
              {Teacherslinks.map((item) => (
                <div key={item.title}>
                  {/* <Link
                    to="/teacher"
                    style={{ color: currentColor }}
                    className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase  cursor-pointer"
                  >
                    {item.title}
                  </Link> */}
                  {item.links.map((link) => (
                    <NavLink
                      to={`/${link.route}`}
                      key={link.name}
                      onClick={handleCloseSideBar}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? currentColor : "",
                      })}
                      className={({ isActive }) =>
                        isActive ? activeLink : normalLink
                      }
                    >
                      {link.icon}
                      <span className="capitalize cursor-pointer ">
                        {link.name}
                      </span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  } else if (userRole === "parent") { // Use userRole
    return (
      <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 bg-blend-overlay dark:bg-main-dark-bg">
        {activeMenu && (
          <>
            <div className="flex justify-between items-center ">
              <Link
                style={{ color: currentColor }}
                to="/parent"
                onClick={handleCloseSideBar}
                className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
              >
                <div className="flex items-center space-x-2">
                  <GiExplosiveMaterials className="text-red-500 text-2xl" />
                  <span className=" text-xl" style={{ color: currentColor }}>
                    Parent
                  </span>
                </div>
              </Link>
              <TooltipComponent content="Menu" position="BottomCenter">
                <button
                  type="button"
                  onClick={() => setActiveMenu(!activeMenu)}
                  style={{ color: currentColor }}
                  className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
                >
                  <MdOutlineCancel />
                </button>
              </TooltipComponent>
            </div>
            <div className="mt-10 ">
              {Parentslinks.map((item) => (
                <div key={item.title}>
                  <Link
                    style={{ color: currentColor }}
                    to="/parent"
                    className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase"
                  >
                    {item.title}
                  </Link>
                  {item.links.map((link) => (
                    <NavLink
                      to={`/${link.route}`}
                      key={link.name}
                      onClick={handleCloseSideBar}
                      style={({ isActive }) => ({
                        backgroundColor: isActive ? currentColor : "",
                      })}
                      className={({ isActive }) =>
                        isActive ? activeLink : normalLink
                      }
                    >
                      {link.icon}
                      <span className="capitalize cursor-pointer ">
                        {link.name}
                      </span>
                    </NavLink>
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  } else {
    return (
      <div className="overflow-auto h-screen w-full bg-white dark:bg-main-dark-bg">
        {activeMenu && (
          <>
            <div className=" w-full flex justify-between items-center dark:bg-main-dark-bg">
              <Link
                to="/admin"
                onClick={handleCloseSideBar}
                className="w-full"
              >
                <div className="w-[full]  ">
                  <div className="w-full  flex justify-center items-center mt-1">
                    <img
                      src={logo}
                      className="w-32  object-contain"
                      alt="logo"
                      // className="h-[60px]  object-contain scale-125 "
                    />
                  </div>
                  <div className="flex items-center pl-4  gap-2 hover:bg-slate-100">
                    <BiSolidSchool
                      style={{
                        color: "#ec6031",
                      }}
                    />
                    <span className=" flex text-[#ec6031] f text-[14px]  font-bold text-center flex-col   py-1 rounded-sm  text-md mb-1  cursor-pointer">
                      ADMIN DASHBOARD
                    </span>
                  </div>
                </div>
              </Link>
              <TooltipComponent content="Menu" position="BottomCenter">
                <button
                  type="button"
                  onClick={() => setActiveMenu(!activeMenu)}
                  style={{ color: currentColor }}
                  className="text-xl rounded-full p-3 hover-bg-light-gray mt-4 block md:hidden"
                >
                  <MdOutlineCancel />
                </button>
              </TooltipComponent>
            </div>

            <div className="">
              {links.map((item, index) => (
                <div
                  key={index}
                  className={`text-[14px] flex font-serif flex-col hover:bg-white hover:shadow-md dark:bg-secondary-dark-bg py-1 pl-4 rounded-sm text-md mb-[2px] mx-[2px] cursor-pointer ${
                    selectedIndex === index ? "bg-white shadow-md" : ""
                  }`}
                  style={{
                    color: currentColor,
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    handleMenuClick(index);
                  }}
                >
                  {item.children ? (
                    <>
                      <div
                        className={`text-[14px] w-full flex items-center gap-3 font-serif ${
                          selectedIndex === index ? "bg-gray-200" : ""
                        }`}
                      >
                        {item.icon}
                        {item.name}
                      </div>
                      <div
                        ref={(el) => (refs.current[index] = el)}
                        style={{
                          height:
                            openIndex === index
                              ? `${refs.current[index]?.scrollHeight}px`
                              : "0px",
                          overflow: "hidden",
                          transition: "height 0.5s ease-in-out",
                        }}
                      >
                        <ul className="w-full  ">
                          {item.children.map((child, childIndex) => (
                            <Link
                              key={childIndex}
                              to={child.link}
                              style={{ backgroundColor: currentColor }}
                              className={`flex items-center gap-2 ml-1 font-serif my-2 py-1 pl-2 mx-2 text-white text-md  cursor-pointer bg-[${currentColor}]`}
                            >
                              {child.icon}
                              {child.name}
                            </Link>
                          ))}
                        </ul>
                      </div>
                    </>
                  ) : (
                    <Link
                      to={item.link}
                      style={{
                        backgroundColor:
                          selectedId === item.link?.id ? currentColor : "",
                      }}
                      className="w-full flex items-center gap-3 font-serif"
                    >
                      {item.icon}
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  }
};

export default Sidebar;


// import React, {  useRef, useState } from "react";
// import { Link, NavLink } from "react-router-dom";
// import { GiExplosiveMaterials } from "react-icons/gi";
// import { MdOutlineCancel } from "react-icons/md";
// import { TooltipComponent } from "@syncfusion/ej2-react-popups";
// import { links } from "../data/dummy";
// import { Studentlinks } from "../data/dummy";
// import { Teacherslinks } from "../data/dummy";
// import { Parentslinks } from "../data/dummy";
// import { useStateContext } from "../contexts/ContextProvider";
// import { BiSolidSchool } from "react-icons/bi";
// import logo from "../../src/ShikshMitraWebsite/digitalvidya.png";
// const Sidebar = () => {
//   const [selectedIndex, setSelectedIndex] = useState(null);
//   const refs = useRef([]);
//   const [openIndex, setOpenIndex] = useState(null);
//   const handleMenuClick = (index) => {
//     setOpenIndex(openIndex === index ? null : index);
//     setSelectedIndex(index);
//   };

//   const { currentColor, activeMenu, setActiveMenu, screenSize, isLoggedIn } =
//     useStateContext();
//   const [selectedId, setSelectedId] = useState(0);

//   let mainLink = null;
//   if (isLoggedIn === "student") {
//     mainLink = Studentlinks;
//   } else if (isLoggedIn === "teacher") {
//     mainLink = Teacherslinks;
//   }

//   const handleCloseSideBar = (id) => {
//     if (selectedId === id) {
//       setSelectedId(0);
//     } else {
//       setSelectedId(id);
//     }

//     if (activeMenu !== undefined && screenSize <= 900) {
//       setActiveMenu(false);
//     }
//   };

//   const activeLink =
//     "flex items-center gap-5  pl-4 pt-3 pb-2.5 rounded-lg  text-white  text-md m-2 duration-1000 cursor-pointer";
//   const normalLink =
//     "flex flex items-center hover:bg-white hover:shadow-lg gap-5 pl-4 pt-3 pb-2.5 rounded-lg text-md text-gray-700 dark:text-gray-200 dark:hover:text-black hover:bg-light-gray m-2 duration-700 cursor-pointer";

//   {
//     if (isLoggedIn === "student") {
//       return (
//         <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 bg-blend-overlay  dark:bg-main-dark-bg">
//           {activeMenu && (
//             <>
//               <div className="flex justify-between items-center ">
//                 <Link
//                   style={{ color: currentColor }}
//                   to="/student"
//                   onClick={handleCloseSideBar}
//                   className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <div className="w-full  flex justify-center items-center">
//                       <img
//                         src={logo}
                        
//                         // className="h-[60px]  object-contain scale-125 "
//                       />
//                     </div>
//                     <span className="text-blue-900 text-xl">Student</span>
//                   </div>
//                 </Link>
//                 <TooltipComponent content="Menu" position="BottomCenter">
//                   <button
//                     type="button"
//                     onClick={() => setActiveMenu(!activeMenu)}
//                     style={{ color: currentColor }}
//                     className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
//                   >
//                     <MdOutlineCancel />
//                   </button>
//                 </TooltipComponent>
//               </div>
//               <div className="mt-10 overflow-x-scroll dark:bg-main-dark-bg">
//                 {Studentlinks.map((item) => (
//                   <div key={item.title}>
//                     <Link
//                       to="/student"
//                       className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase"
//                     >
//                       {item.title}
//                     </Link>
//                     {item.links.map((link) => (
//                       <NavLink
//                         to={`/${link.route}`}
//                         key={link.name}
//                         onClick={handleCloseSideBar}
//                         style={({ isActive }) => ({
//                           backgroundColor: isActive ? currentColor : "",
//                         })}
//                         className={({ isActive }) =>
//                           isActive ? activeLink : normalLink
//                         }
//                       >
//                         {link.icon}
//                         <span className="capitalize cursor-pointer ">
//                           {link.name}
//                         </span>
//                       </NavLink>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       );
//     } else if (isLoggedIn === "teacher") {
//       return (
//         <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 bg-blend-overlay dark:bg-main-dark-bg">
//           {activeMenu && (
//             <>
//               <div className="flex justify-between items-center ">
//                 <Link
//                   to="/teacher"
//                   style={{ color: currentColor }}
//                   onClick={handleCloseSideBar}
//                   className="items-center gap-3 ml-4  flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
//                   // className="items-center gap-3 ml-4 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
//                   >
//                   <div className="flex items-center space-x-2">
//                     <div className="w-full  flex justify-center items-center">
//                       <img
//                         src={logo}
//                         className="h-[60px]  object-contain scale-125 "
//                       />
//                     </div>
//                     <span style={{ color: currentColor }}>Teacher</span>
//                   </div>
//                 </Link>
//                 <TooltipComponent content="Menu" position="BottomCenter">
//                   <button
//                     type="button"
//                     onClick={() => setActiveMenu(!activeMenu)}
//                     style={{ color: currentColor }}
//                     className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
//                   >
//                     <MdOutlineCancel />
//                   </button>
//                 </TooltipComponent>
//               </div>
//               <div className="">
//               {/* <div className="mt-10"> */}
//                 {Teacherslinks.map((item) => (
//                   <div key={item.title}>
//                     <Link
//                       to="/teacher"
//                       style={{ color: currentColor }}
//                       className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase  cursor-pointer"
//                     >
//                       {item.title}
//                     </Link>
//                     {item.links.map((link) => (
//                       <NavLink
//                         to={`/${link.route}`}
//                         key={link.name}
//                         onClick={handleCloseSideBar}
//                         style={({ isActive }) => ({
//                           backgroundColor: isActive ? currentColor : "",
//                         })}
//                         className={({ isActive }) =>
//                           isActive ? activeLink : normalLink
//                         }
//                       >
//                         {link.icon}
//                         <span className="capitalize cursor-pointer ">
//                           {link.name}
//                         </span>
//                       </NavLink>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       );
//     } else if (isLoggedIn === "parent") {
//       return (
//         <div className="ml-3 h-screen md:overflow-hidden overflow-auto md:hover:overflow-auto pb-10 bg-blend-overlay dark:bg-main-dark-bg">
//           {activeMenu && (
//             <>
//               <div className="flex justify-between items-center ">
//                 <Link
//                   style={{ color: currentColor }}
//                   to="/parent"
//                   onClick={handleCloseSideBar}
//                   className="items-center gap-3 ml-3 mt-4 flex text-xl font-extrabold tracking-tight dark:text-white text-slate-900"
//                 >
//                   <div className="flex items-center space-x-2">
//                     <GiExplosiveMaterials className="text-red-500 text-2xl" />
//                     <span className=" text-xl" style={{ color: currentColor }}>
//                       Parent
//                     </span>
//                   </div>
//                 </Link>
//                 <TooltipComponent content="Menu" position="BottomCenter">
//                   <button
//                     type="button"
//                     onClick={() => setActiveMenu(!activeMenu)}
//                     style={{ color: currentColor }}
//                     className="text-xl rounded-full p-3 hover:bg-light-gray mt-4 block md:hidden"
//                   >
//                     <MdOutlineCancel />
//                   </button>
//                 </TooltipComponent>
//               </div>
//               <div className="mt-10 ">
//                 {Parentslinks.map((item) => (
//                   <div key={item.title}>
//                     <Link
//                       style={{ color: currentColor }}
//                       to="/parent"
//                       className="text-gray-400 dark:text-gray-400 m-3 mt-4 uppercase"
//                     >
//                       {item.title}
//                     </Link>
//                     {item.links.map((link) => (
//                       <NavLink
//                         to={`/${link.route}`}
//                         key={link.name}
//                         onClick={handleCloseSideBar}
//                         style={({ isActive }) => ({
//                           backgroundColor: isActive ? currentColor : "",
//                         })}
//                         className={({ isActive }) =>
//                           isActive ? activeLink : normalLink
//                         }
//                       >
//                         {link.icon}
//                         <span className="capitalize cursor-pointer ">
//                           {link.name}
//                         </span>
//                       </NavLink>
//                     ))}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       );
//     } else {
//       return (
//         <div className="overflow-auto h-screen w-full bg-[#f3f4f6] dark:bg-main-dark-bg">
//           {activeMenu && (
//             <>
//               <div className=" w-full flex justify-between items-center dark:bg-main-dark-bg">
//                 <Link
//                   to="/admin"
//                   onClick={handleCloseSideBar}
//                   className="w-full"
//                 >
//                   <div className="w-[full]  ">
//                     <div className="w-full  flex justify-center items-center mt-3">
//                       <img
//                         src={logo}
//                         className="w-40  object-contain  "
//                         // className="h-[60px]  object-contain scale-125 "
//                       />
//                     </div>
//                     <div className="flex items-center justify-center hover:bg-slate-100">
//                       <BiSolidSchool
//                         style={{
//                           color: "#616161",
//                         }}
//                       />
//                       <span className=" flex text-[#616161] font-serif text-[12px]  text-center flex-col   py-1 rounded-sm  text-md mb-1 mx-[2px] cursor-pointer">
//                         ADMIN DASHBOARD
//                       </span>
//                     </div>
//                   </div>
//                 </Link>
//                 <TooltipComponent content="Menu" position="BottomCenter">
//                   <button
//                     type="button"
//                     onClick={() => setActiveMenu(!activeMenu)}
//                     style={{ color: currentColor }}
//                     className="text-xl rounded-full p-3 hover-bg-light-gray mt-4 block md:hidden"
//                   >
//                     <MdOutlineCancel />
//                   </button>
//                 </TooltipComponent>
//               </div>

//               <div className="">
//                 {links.map((item, index) => (
//                   <div
//                     key={index}
//                     className={`text-[14px] flex font-serif flex-col hover:bg-white hover:shadow-md dark:bg-secondary-dark-bg py-1 pl-4 rounded-sm text-md mb-[2px] mx-[2px] cursor-pointer ${
//                       selectedIndex === index ? "bg-white shadow-md" : ""
//                     }`}
//                     style={{
//                       color: currentColor,
//                     }}
//                     onClick={(e) => {
//                       e.preventDefault();
//                       handleMenuClick(index);
//                     }}
//                   >
//                     {item.children ? (
//                       <>
//                         <div
//                           className={`text-[14px] w-full flex items-center gap-3 font-serif ${
//                             selectedIndex === index ? "bg-gray-200" : ""
//                           }`}
//                         >
//                           {item.icon}
//                           {item.name}
//                         </div>
//                         <div
//                           ref={(el) => (refs.current[index] = el)}
//                           style={{
//                             height:
//                               openIndex === index
//                                 ? `${refs.current[index]?.scrollHeight}px`
//                                 : "0px",
//                             overflow: "hidden",
//                             transition: "height 0.5s ease-in-out",
//                           }}
//                         >
//                           <ul className="w-full  ">
//                             {item.children.map((child, childIndex) => (
//                               <Link
//                                 key={childIndex}
//                                 to={child.link}
//                                 style={{ backgroundColor: currentColor }}
//                                 className={`flex items-center gap-2 ml-1 font-serif my-2 py-1 pl-2 mx-2 text-white text-md  cursor-pointer bg-[${currentColor}]`}
//                               >
//                                 {child.icon}
//                                 {child.name}
//                               </Link>
//                             ))}
//                           </ul>
//                         </div>
//                       </>
//                     ) : (
//                       <Link
//                         to={item.link}
//                         style={{
//                           backgroundColor:
//                             selectedId === item.link?.id ? currentColor : "",
//                         }}
//                         className="w-full flex items-center gap-3 font-serif"
//                       >
//                         {item.icon}
//                         {item.name}
//                       </Link>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       );
//     }
//   }
// };

// export default Sidebar;
