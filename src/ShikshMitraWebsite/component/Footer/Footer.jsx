
import React from 'react'
import Slider from '../Slider'



const Footer = () => {
  return (
    <div  className="bg-zinc-50 text-center text-surface dark:bg-neutral-700 dark:text-white">
    
      
       <div class="bg-black/5 p-4 text-center text-xl">
       Copyright © 2025  
    <a href="https://edaksha.netlify.app/"> DIGITALVIDYASAARTHI</a>
    
  </div>
  {/* <Slider/> */}
    </div>
  )
}

export default Footer




// import React from "react";
// import { Link } from "react-router-dom";

// export default function Footer() {
//   return (
//     <footer className="bg-[#19212c]">
//       <div className="flex items-center justify-center border-b-2 border-neutral-600 p-6 dark:border-neutral-500 lg:justify-between">
//         <div className="text-white mr-12 hidden lg:block">
//           <span>Get connected with us on social networks:</span>
//         </div>
//         {/* <!-- Social network icons container --> */}
//         <div className="flex justify-center">
//           <Link
//             to="https://www.facebook.com/profile.php?id=100095230572986"
//             className="mr-6 text-teal-500 hover:text-teal-500/75"
//           >
//             <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
//             </svg>
//           </Link>

//           <Link
//             to="https://www.instagram.com/corplyxtechnologies/"
//             className="mr-6 text-teal-500 hover:text-teal-500/75"
//           >
//             <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
//             </svg>
//           </Link>
//           <Link
//             to="https://mail.google.com/mail/u/1/?view=cm&fs=1&to=corplyxtechnologies@gmail.com&tf=1"
//             className="mr-6 text-teal-500 hover:text-teal-500/75"
//           >
//             <svg viewBox="0 0 24 24" fill="currentColor" className=" h-4 w-4">
//               <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
//               <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
//             </svg>
//           </Link>
//           <Link
//             to="https://www.linkedin.com/company/corplyx/"
//             className="mr-6 text-teal-500 hover:text-teal-500/75"
//           >
//             <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
//               <path d="M4.98 3.5c0 1.381-1.11 2.5-2.48 2.5s-2.48-1.119-2.48-2.5c0-1.38 1.11-2.5 2.48-2.5s2.48 1.12 2.48 2.5zm.02 4.5h-5v16h5v-16zm7.982 0h-4.968v16h4.969v-8.399c0-4.67 6.029-5.052 6.029 0v8.399h4.988v-10.131c0-7.88-8.922-7.593-11.018-3.714v-2.155z" />
//             </svg>
//           </Link>
//           <Link
//             to="https://twitter.com/CorplyxTech"
//             className="text-teal-500 hover:text-teal-500/75"
//           >
//             <svg
//               className="w-4 h-4"
//               fill="currentColor"
//               viewBox="0 0 24 24"
//               aria-hidden="true"
//             >
//               <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
//             </svg>
//           </Link>
//         </div>
//       </div>

//       {/* <!-- Main container div: holds the entire content of the footer, including four sections (TW Elements, Products, Useful links, and Contact), with responsive styling and appropriate padding/margins. --> */}
//       <div className="mx-6 py-10 text-center md:text-left">
//         <div className="grid-1 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
//           {/* <!-- TW Elements section --> */}
//           <div className="">
//             <div className="flex justify-center text-teal-300">
//               <Link to="/">
//                 <div className="w-[100px]">
//                   <img
//                     src={logo}
//                     alt="Logo"
//                     className="h-full w-full  scale-125 cursor-pointer  rounded-sm"
//                   />
//                 </div>
//               </Link>
//             </div>
//             <p className="max-w-md mx-auto justify-center leading-relaxed text-center text-gray-400 sm:max-w-xs  ">
//               A comprehensive institution management system designed to
//               streamline educational processes and enhance communication.
//             </p>
//           </div>
//           {/* <!-- Products section --> */}
//           <div className="text-white">
//             <h6 className="mb-4 flex justify-center font-semibold uppercase md:justify-start">
//               Our Services
//             </h6>
//             <p className="mb-4">
//               <a>Digital Marketing</a>
//             </p>
//             <p className="mb-4">
//               <a>Web Development</a>
//             </p>
//             <p className="mb-4">
//               <a>App Development</a>
//             </p>
//             <p>
//               <a>Social Media Optimization</a>
//             </p>
//           </div>
//           {/* <!-- Useful links section --> */}
//           <div>
//             <h6 className="text-white mb-4 flex justify-center font-semibold uppercase md:justify-start">
//               PRIVACY & POLICY
//             </h6>
//             <p className="mb-4">
//               <Link className="text-white transition" to="/privacyPolicy">
//                 T & C
//               </Link>
//             </p>
//             <p className="mb-4">
//               <Link className="text-white" to="/privacyPolicy">
//                 Legal
//               </Link>
//             </p>
//             <p className="mb-4">
//               <Link className="text-white" to="/privacyPolicy">
//                 Data
//               </Link>
//             </p>
//             <p>
//               <Link className="text-white" to="/privacyPolicy">
//                 Demo
//               </Link>
//             </p>
//           </div>
//           {/* <!-- Contact section --> */}
//           <div>
//             <h6 className=" text-white mb-4 flex justify-center font-semibold uppercase md:justify-start">
//               Contact
//             </h6>

//             <p className="text-white mb-4 flex items-center justify-center md:justify-start">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//                 className="mr-3 h-5 w-5"
//               >
//                 <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
//                 <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
//               </svg>
//               support@corplyxtechnologies.com
//             </p>
//             <p className="text-white mb-4 flex items-center justify-center md:justify-start">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//                 className="mr-3 h-5 w-5"
//               >
//                 <path
//                   fillRule="evenodd"
//                   d="M1.5 4.5a3 3 0 013-3h1.372c.86 0 1.61.586 1.819 1.42l1.105 4.423a1.875 1.875 0 01-.694 1.955l-1.293.97c-.135.101-.164.249-.126.352a11.285 11.285 0 006.697 6.697c.103.038.25.009.352-.126l.97-1.293a1.875 1.875 0 011.955-.694l4.423 1.105c.834.209 1.42.959 1.42 1.82V19.5a3 3 0 01-3 3h-2.25C8.552 22.5 1.5 15.448 1.5 6.75V4.5z"
//                   clipRule="evenodd"
//                 />
//               </svg>
//               +91 9650388201
//             </p>
//             <p className="text-white mb-4 flex items-center justify-center md:justify-start">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 24 24"
//                 fill="currentColor"
//                 className="mr-3 h-5 w-5"
//               >
//                 <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" />
//                 <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
//               </svg>
//               Unit-930,I-thum Tower, Noida, Uttar Pradesh
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* <!--Copyright section--> */}
//       <div className=" p-6 text-center border-t border-gray-800 text-gray-400 ">
//         <span>© 2023 Copyright : </span>
//         <a className="font-semibold ">eShikshaMitra</a>
//         <p className="font-semibold ">
//           All rights reserved by Corplyx Technologies.
//         </p>
//       </div>
//     </footer>
//   );
// }
