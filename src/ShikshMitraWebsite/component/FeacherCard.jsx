import Inventry from "../assets/Inventry.png";
import Fee from "../assets/Fee.png";
import ParentPortal from "../assets/ParentPortal.png";
import Reportcard from "../assets/Reportcard.png";
import Transport from "../assets/Transport.png";
import Student from "../assets/Student database.png";
import 'aos/dist/aos.css';
import AOS from 'aos';
import { useEffect } from "react";

export default function DashboardCards() {
  const cards = [
    {
      title: "STUDENT INFORMATION DATABASE",
      image: Student,
      desc: `Easily manage student records, admissions, attendance, and performance with an all-in-one student management system. Keep track of personal details, academic progress, and disciplinary records in a centralized platform.`,
    },
    {
      title: "FEE MANAGEMENT",
      image: Fee,
      desc: `Automate fee collection, track payments, and generate receipts effortlessly with a smart fee management system. Enable online payments, set reminders, and maintain accurate financial records.`,
    },
    {
      title: "REPORT CARD MANAGEMENT",
      image: Reportcard,
      desc: `Design, generate, and manage report cards with customizable grading systems. Ensure transparency and accuracy in student performance evaluation.`,
    },
    {
      title: "INVENTORY MANAGEMENT",
      image: Inventry,
      desc: `Track and manage school assets including books, uniforms, lab equipment, and more with real-time inventory monitoring and alerts.`,
    },
    {
      title: "TRANSPORT MANAGEMENT",
      image: Transport,
      desc: `Efficiently manage school transportation with route planning, vehicle tracking, driver management, and student safety features.`,
    },
    {
      title: "PARENT PORTAL",
      image: ParentPortal,
      desc: `Empower parents with access to their child’s academic records, attendance, fee status, and real-time communication with the school.`,
    },
  ];

  useEffect(() => {
    AOS.init({ duration: 1000 });
  }, []);

  return (
    <>
      <div className="bg-white px-4 py-12 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-[#ee5828]">School ERP</h2>
        <div className="w-20 h-1 bg-indigo-500 mx-auto my-4 rounded-full"></div>
        <h3 className="text-lg font-semibold text-[#29abe2]">
          A complete school management solution powered by cutting-edge technology and dependable support
        </h3>
        <p className="mt-4 text-gray-700">
          Easily streamline school operations — from fee processing and attendance tracking to parent communication and performance monitoring. 
          Save time on daily administrative tasks and stay focused on delivering a quality educational experience. 
          Gain instant access to essential insights for managing finances, student progress, and institutional growth — all from one centralized system.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
      {cards.map((card, index) => (
  <div
    key={index}
    data-aos="flip-left"
    data-aos-delay={index * 200}  // ⏱️ 200ms delay per index
    className="bg-white shadow-md rounded-2xl p-6 py-20 flex flex-col items-center hover:shadow-xl transition duration-300"
  >
    <img src={card.image} alt={card.title} className="h-40 mb-4" />
    <h2 className="text-center text-lg font-semibold text-[#29abe2]">
      {card.title}
    </h2>
    <p className="text-gray-600 text-sm text-center mt-2">{card.desc}</p>
  </div>
))}

      </div>
    </>
  );
}



// import { motion } from "framer-motion";
// import Inventry from "../assets/Inventry.png";
// import Fee from "../assets/Fee.png";
// import ParentPortal from "../assets/ParentPortal.png";
// import Reportcard from "../assets/Reportcard.png";
// import Transport from "../assets/Transport.png";
// import Student from "../assets/Student database.png";
// import 'aos/dist/aos.css';
// import AOS from 'aos';
// import { useEffect } from "react";
// export default function DashboardCards() {
//   const cards = [
//     {
//       title: "STUDENT INFORMATION DATABASE",
//       image: Student,
//       desc: `Easily manage student records, admissions, attendance, and performance with an all-in-one student management system. Keep track of personal details, academic progress, and disciplinary records in a centralized platform.`,
//     },
//     {
//       title: "FEE MANAGEMENT",
//       image: Fee,
//       desc: `Automate fee collection, track payments, and generate receipts effortlessly with a smart fee management system. Enable online payments, set reminders, and maintain accurate financial records.`,
//     },
//     {
//       title: "REPORT CARD MANAGEMENT",
//       image: Reportcard,
//       desc: `Design, generate, and manage report cards with customizable grading systems. Ensure transparency and accuracy in student performance evaluation.`,
//     },
//     {
//       title: "INVENTORY MANAGEMENT",
//       image: Inventry,
//       desc: `Track and manage school assets including books, uniforms, lab equipment, and more with real-time inventory monitoring and alerts.`,
//     },
//     {
//       title: "TRANSPORT MANAGEMENT",
//       image: Transport,
//       desc: `Efficiently manage school transportation with route planning, vehicle tracking, driver management, and student safety features.`,
//     },
//     {
//       title: "PARENT PORTAL",
//       image: ParentPortal,
//       desc: `Empower parents with access to their child’s academic records, attendance, fee status, and real-time communication with the school.`,
//     },
//   ];
//   useEffect(() => {
//     AOS.init({
//       duration: 1000,
//     });
//   }, []);

//   return (
//  <>
//     <div className="bg-white px-4 py-12 text-center max-w-4xl mx-auto">
//   <h2 className="text-3xl font-bold text-[#ee5828]">School ERP</h2>
//   <div className="w-20 h-1 bg-indigo-500 mx-auto my-4 rounded-full"></div>
//   <h3 className="text-lg font-semibold text-[#29abe2]">
//     A complete school management solution powered by cutting-edge technology and dependable support
//   </h3>
//   <p className="mt-4 text-gray-700">
//     Easily streamline school operations — from fee processing and attendance tracking to parent communication and performance monitoring. 
//     Save time on daily administrative tasks and stay focused on delivering a quality educational experience. 
//     Gain instant access to essential insights for managing finances, student progress, and institutional growth — all from one centralized system.
//   </p>
// </div>

//     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
        
//       {/* {cards.map((card, index) => (
//         <motion.div
//           key={index}
//           initial={{ opacity: 0, y: 50 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6, delay: index * 0.1 }}
//           viewport={{ once: true }}
//           className="bg-white shadow-md rounded-2xl p-6 py-20 flex flex-col items-center hover:shadow-xl transition duration-300"
//         >
//           <img src={card.image} alt={card.title} className="h-40 mb-4" />
//           <h2 className="text-center text-lg font-semibold text-[#29abe2]">
//             {card.title}
//           </h2>
//           <p className="text-gray-600 text-sm text-center mt-2">{card.desc}</p>
//         </motion.div>
//       ))} */}
//       {cards.map((card, index) => (
//   <motion.div
//     key={index}
//     data-aos="flip-left"
//     initial={{ opacity: 0, y: 50 }}
//     whileInView={{ opacity: 1, y: 0 }}
//     transition={{ duration: 0.6, delay: index * 0.1 }}
//     viewport={{ once: true }}
//     className="bg-white shadow-md rounded-2xl p-6 py-20 flex flex-col items-center hover:shadow-xl transition duration-300"
//   >
//     <img src={card.image} alt={card.title} className="h-40 mb-4" />
//     <h2 className="text-center text-lg font-semibold text-[#29abe2]">
//       {card.title}
//     </h2>
//     <p className="text-gray-600 text-sm text-center mt-2">{card.desc}</p>
//   </motion.div>
// ))}

//     </div>
//  </>
//   );
// }






// import Inventry from '../assets/Inventry.png'
// import Fee from '../assets/Fee.png'
// import ParentPortal from '../assets/ParentPortal.png'
// import Reportcard from '../assets/Reportcard.png'
// import Transport from '../assets/Transport.png'
// import Student from '../assets/Student database.png'


// export default function DashboardCards() {
//     const cards = [
//       {
//         title: "STUDENT INFORMATION DATABASE",
//         image: Student,
//         desc: `Easily manage student records, admissions, attendance, and performance with an all-in-one student management system. Keep track of personal details, academic progress, and disciplinary records in a centralized platform.`,
 
//       },
//       {
//         title: "FEE MANAGEMENT",
//         image:Fee,
//         desc: `Automate fee collection, track payments, and generate receipts effortlessly with a smart fee management system. Enable online payments, set reminders, and maintain accurate financial records.`,
  
//       },
//       {
//         title: "REPORT CARD MANAGEMENT",
//         image: Reportcard,
//         desc: `Design, generate, and manage report cards with customizable grading systems. Ensure transparency and accuracy in student performance evaluation.`,
//       },
//       {
//         title: "INVENTORY MANAGEMENT",
//         image: Inventry,
//         desc: `Track and manage school assets including books, uniforms, lab equipment, and more with real-time inventory monitoring and alerts.`,
//       },
//       {
//         title: "TRANSPORT MANAGEMENT",
//         image: Transport,
//         desc: `Efficiently manage school transportation with route planning, vehicle tracking, driver management, and student safety features.`,
//       },
//       {
//         title: "PARENT PORTAL",
//         image: ParentPortal,
//         desc: `Empower parents with access to their child’s academic records, attendance, fee status, and real-time communication with the school.`,
//       }
      
//     ];
  
//     return (
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-6">
//         {cards.map((card, index) => (
//           <div
//             key={index}
//             className="bg-white shadow-md rounded-2xl p-6 py-20 flex flex-col items-center hover:shadow-xl transition duration-300"
//           >
//             <img src={card.image} alt={card.title} className="h-40 mb-4" />
//             <h2 className="text-center text-lg font-semibold text-[#29abe2]">
//               {card.title}
//             </h2>
//             <p className="text-gray-600 text-sm text-center">{card?.desc}</p>
//           </div>
//         ))}
//       </div>
//     );
//   }
  