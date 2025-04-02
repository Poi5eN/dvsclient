import React from "react";
import "./Loading.css";
import logo from "../src/ShikshMitraWebsite/digitalvidya.png";
const Loading = () => {
  return (
    <div className="fixed top-0 left-0 z-[999999] w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70"
    style={{zIndex:"99999999999999"}}
    >
  <div className="relative flex justify-center items-center z-[999999]">
    <div className="w-28 h-28 rounded-full animate-spin border-4 border-dashed border-[#f25d2b] border-t-transparent">
    </div>

    <img
      src={logo}
      className="absolute h-[50px] "
      alt="Logo"
    />
  </div>
</div>

//       <div className="fixed top-0 left-0 z-[999999] w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 ">
//         {/* <div class="flex"> */}
//     <div class="relative">
       
//         {/* <div class="w-28 h-28 rounded-full absolute
//     border-4 border-solid border-gray-200"></div> */}
//  <img src={logo} alt="" />
// <div class="w-28 h-28 rounded-full animate-spin
//                     border-4 border-dashed border-[#f25d2b] border-t-transparent">
                     
//                     </div>
       
// </div>
//       </div>
    //   <div className="fixed top-0 left-0 z-[999999] w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 ">
    //       {/* <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div> */}
    //       <svg width="100" height="100" fill="currentColor" class="mr-2 animate-spin" viewBox="0 0 1792 1792" xmlns="http://www.w3.org/2000/svg">
    //     <path d="M526 1394q0 53-37.5 90.5t-90.5 37.5q-52 0-90-38t-38-90q0-53 37.5-90.5t90.5-37.5 90.5 37.5 37.5 90.5zm498 206q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-704-704q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm1202 498q0 52-38 90t-90 38q-53 0-90.5-37.5t-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-964-996q0 66-47 113t-113 47-113-47-47-113 47-113 113-47 113 47 47 113zm1170 498q0 53-37.5 90.5t-90.5 37.5-90.5-37.5-37.5-90.5 37.5-90.5 90.5-37.5 90.5 37.5 37.5 90.5zm-640-704q0 80-56 136t-136 56-136-56-56-136 56-136 136-56 136 56 56 136zm530 206q0 93-66 158.5t-158 65.5q-93 0-158.5-65.5t-65.5-158.5q0-92 65.5-158t158.5-66q92 0 158 66t66 158z">
    //     </path>
    // </svg>
    //   </div>
  
  //     <div class="relative">


  // <div class="absolute bg-white bg-opacity-60 z-10 h-full w-full flex items-center justify-center">
  //   <div class="flex items-center">
  //     <span class="text-3xl mr-4">Loading</span>
  //     <svg class="animate-spin h-8 w-8 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none"
  //       viewBox="0 0 24 24">
  //       <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
  //       <path class="opacity-75" fill="currentColor"
  //         d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
  //       </path>
  //     </svg>
  //   </div>
  // </div>
  // </div>
    // <div className="flex justify-center items-center w-full bg-transparent ">
    //   <center className="mt-10 bg-transparent ">
    //     <br />
    //     <br />
    //     <br />
    //     <div class="loader" id="loader"></div>
    //     <div class="loader" id="loader2"></div>
    //     <div class="loader" id="loader3"></div>
    //     <div class="loader" id="loader4"></div>
    //     <span id="text">
    //       <img className="w-[150px] h-auto object-contain" src={logo} alt="" />
    //     </span>
    //     <br />
    //   </center>
    // </div>
  );
};

export default Loading;
