import React from 'react';
import { motion } from 'framer-motion';

const features = [
  {
    title: 'Student Management',
    image: 'https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e?auto=format&fit=crop&w=1080&q=80',
    link: '/tool/writey-ai',
    desc: `Easily manage student records, admissions, attendance, and performance with an all-in-one student management system. Keep track of personal details, academic progress, and disciplinary records in a centralized platform.`,
  },
  {
    title: 'Fee Management',
    image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1080&q=80',
    link: '#',
    desc: `Automate fee collection, track payments, and generate receipts effortlessly with a smart fee management system. Enable online payments, set reminders, and maintain accurate financial records.`,
  },
  {
    title: 'Exam Management',
    image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=1080&q=80',
    link: '#',
    desc: `Simplify exam planning, scheduling, and evaluation with an efficient exam management system. Automate question paper creation, conduct online/offline exams, and generate instant results.`,
  },
  {
    title: 'Library Management',
    image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=1080&q=80',
    link: '#',
    desc: `Streamline book tracking, borrowing, and returns with an advanced library management system. Easily manage inventory, issue books, and enhance accessibility with a digital catalog.`,
  },
  {
    title: 'Attendance Management',
    image: 'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?auto=format&fit=crop&w=1080&q=80',
    link: '#',
    desc: `Simplify and automate attendance tracking with a smart school management system. Teachers can mark attendance digitally and generate reports instantly.`,
  },
  {
    title: 'Assignment and Notes',
    image: 'https://images.unsplash.com/photo-1574192324001-ee41e18ed679?auto=format&fit=crop&w=1080&q=80',
    link: '#',
    desc: `Teachers can efficiently manage their tasks using a mobile app, enabling them to share assignments, notes, and updates. Improve communication and academic performance.`,
  },
];

const Related = () => {
  return (
    <div className="max-w-7xl mx-auto my-8 px-4">
      <div className="text-center text-2xl md:text-3xl font-bold text-[#ee582c] mb-8">
        Our Features
      </div>

      <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((item, idx) => (
          <motion.li
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.1 }}
            viewport={{ once: true, amount: 0.2 }}
            className="bg-white flex flex-col justify-between border rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <a href={item.link}>
              <img
                className="rounded-t-lg w-full object-cover aspect-video"
                src={item.image}
                alt={item.title}
                loading="lazy"
              />
            </a>
            <div className="flex flex-col gap-3 px-4 py-4">
              <a
                href={item.link}
                className="text-xl font-semibold text-teal-700 text-center hover:text-[#2fa7db]"
              >
                {item.title}
              </a>
              <p className="text-gray-600 text-sm text-center">{item.desc}</p>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default Related;



// import React from 'react';
// import { motion } from 'framer-motion';

// const features = [
//   {
//     title: 'Student Management',
//     image: 'https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e?auto=format&fit=crop&w=1080&q=80',
//     link: '/tool/writey-ai',
//     desc: `Easily manage student records, admissions, attendance, and performance with an all-in-one student management system...`,
//   },
//   {
//     title: 'Fee Management',
//     image: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=1080&q=80',
//     link: '#',
//     desc: `Automate fee collection, track payments, and generate receipts effortlessly with a smart fee management system...`,
//   },
//   {
//     title: 'Exam Management',
//     image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=1080&q=80',
//     link: '#',
//     desc: `Simplify exam planning, scheduling, and evaluation with an efficient exam management system...`,
//   },
//   {
//     title: 'Library Management',
//     image: 'https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?auto=format&fit=crop&w=1080&q=80',
//     link: '#',
//     desc: `Streamline book tracking, borrowing, and returns with an advanced library management system...`,
//   },
//   {
//     title: 'Attendance Management',
//     image: 'https://images.unsplash.com/photo-1555532538-dcdbd01d373d?auto=format&fit=crop&w=1080&q=80',
//     link: '#',
//     desc: `Simplify and automate attendance tracking with a smart school management system...`,
//   },
//   {
//     title: 'Assignment and Notes',
//     image: 'https://images.unsplash.com/photo-1574192324001-ee41e18ed679?auto=format&fit=crop&w=1080&q=80',
//     link: '#',
//     desc: `Teachers can efficiently manage their tasks using a mobile application...`,
//   },
// ];

// const Related = () => {
//   return (
//     <div className="max-w-7xl mx-auto my-8 px-4">
//       <div className="text-center text-2xl md:text-3xl font-bold text-[#ee582c] mb-8">
//         Our Features
//       </div>

//       <ul className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
//         {features.map((item, idx) => (
//           <motion.li
//             key={idx}
//             initial={{ opacity: 0, scale: 0.95 }}
//             whileInView={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.6, delay: idx * 0.1 }}
//             viewport={{ once: true }}
//             className="bg-white flex flex-col justify-between border rounded-lg shadow-md hover:shadow-lg transition-shadow"
//           >
//             <a href={item.link}>
//               <img
//                 className="rounded-t-lg w-full object-cover aspect-video"
//                 src={item.image}
//                 alt={item.title}
//                 loading="lazy"
//               />
//             </a>
//             <div className="flex flex-col gap-3 px-4 py-4">
//               <a
//                 href={item.link}
//                 className="text-xl font-semibold text-teal-700 text-center hover:text-[#2fa7db]"
//               >
//                 {item.title}
//               </a>
//               <p className="text-gray-600 text-sm">{item.desc}</p>
//             </div>
//           </motion.li>
//         ))}
//       </ul>
//     </div>
//   );
// };

// export default Related;





// import React from 'react'

// const Related = () => {
//   return (
//     <div>
//       <div class="max-w-7xl mx-auto my-8 px-2">

// <div class="flex justify-center text-2xl md:text-3xl font-bold text-[#ee582c]  ">
// Our Features
// </div>

// <ul class="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 p-2 xl:p-5">

//     <li class="relative bg-white flex flex-col justify-between border rounded shadow-md hover:shadow-teal-400">

//         <a class="relative" href="/tool/writey-ai">
//             <img class="rounded relative w-full object-cover aspect-video"
//                 src="https://images.unsplash.com/photo-1529236183275-4fdcf2bc987e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxfHxrZXlib2FyZHxlbnwwfDB8fHwxNjk5NTI1MDAzfDA&ixlib=rb-4.0.3&q=80&w=1080" alt="Writey A.I" loading="lazy"/>
//         </a>


//         <div class="flex flex-col justify-beetween gap-3 px-4 py-2">
//             <a href="/tool/writey-ai"
//                 class="flex justify-center items-center text-xl font-semibold text-teal-700 hover:text-teal-800 two-lines text-ellipsis">
//                 <span>Student Management</span>
//             </a>

//             <p class="text-gray-600 two-lines">
//             Easily manage student records, admissions, attendance, and performance with an all-in-one student management system. Keep track of personal details, academic progress, and disciplinary records in a centralized platform. Enhance communication between teachers, students, and parents, ensuring a well-organized and efficient educational environment.
//             </p>

        
//         </div>

//     </li>

//     <li class="relative bg-white flex flex-col justify-between border rounded shadow-md hover:shadow-teal-400">

//         <a class="relative" >
//             <img class="rounded relative w-full object-cover aspect-video"
//                 src="https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw1fHxrZXlib2FyZHxlbnwwfDB8fHwxNjk5NTI1MDAzfDA&ixlib=rb-4.0.3&q=80&w=1080" alt="WriteMe.ai" loading="lazy"/>
//         </a>


//         <div class="flex flex-col justify-beetween gap-3 px-4 py-2">
//             <a 
//                 class="flex justify-center items-center text-xl font-semibold text-teal-700 hover:text-[#2fa7db] two-lines text-ellipsis">
//                 <span>Fee Management</span>

//             </a>

//             <p class="text-gray-600 two-lines">
//             Automate fee collection, track payments, and generate receipts effortlessly with a smart fee management system. Enable online payments, set reminders, and maintain accurate financial records. Reduce manual errors, enhance transparency, and simplify financial operations for schools, ensuring a seamless and efficient fee management process.
//             </p>

//         </div>

//     </li>

//     <li class="relative bg-white flex flex-col justify-between border rounded shadow-md hover:shadow-teal-400">

//         <a class="relative" >
//             <img class="rounded relative w-full object-cover aspect-video"
//                 src="https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw3fHxrZXlib2FyZHxlbnwwfDB8fHwxNjk5NTI1MDAzfDA&ixlib=rb-4.0.3&q=80&w=1080" alt="Publer" loading="lazy"/>
//         </a>


//         <div class="flex flex-col justify-beetween gap-3 px-4 py-2">
//             <a 
//                 class="flex justify-center items-center text-xl font-semibold text-teal-700 hover:text-teal-800 two-lines text-ellipsis">
//                 <span>Exam Management</span>
//             </a>

//             <p class="text-gray-600 two-lines">
//             Simplify exam planning, scheduling, and evaluation with an efficient exam management system. Automate question paper creation, conduct online/offline exams, and generate instant results. Ensure smooth coordination, reduce administrative workload, and enhance accuracy in assessments for a seamless examination process in schools and educational institutions.
//             </p>

           
//         </div>

//     </li>

//     <li class="relative bg-white flex flex-col justify-between border rounded shadow-md hover:shadow-teal-400">

//         <a class="relative" >
//             <img class="rounded relative w-full object-cover aspect-video"
//                 src="https://images.unsplash.com/photo-1515378960530-7c0da6231fb1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw3fHxrZXlib2FyZHxlbnwwfDB8fHwxNjk5NTI1MDAzfDA&ixlib=rb-4.0.3&q=80&w=1080" alt="Anyword" loading="lazy"/>
//         </a>


//         <div class="flex flex-col justify-beetween gap-3 px-4 py-2">
//             <a 
//                 class="flex justify-center items-center text-xl font-semibold text-teal-700 hover:text-teal-800 two-lines text-ellipsis">
//                 <span>Library Management</span>

//             </a>

//             <p class="text-gray-600 two-lines">
//             Streamline book tracking, borrowing, and returns with an advanced library management system. Easily manage inventory, issue books, track due dates, and generate reports. Enhance accessibility for students and staff with a digital catalog, reducing manual work while improving efficiency and organization in your educational institution’s library.
//             </p>

           
//         </div>

//     </li>

//     <li class="relative bg-white flex flex-col justify-between border rounded shadow-md hover:shadow-teal-400">

//         <a class="relative" >
//             <img class="rounded relative w-full object-cover aspect-video"
//                 src="https://images.unsplash.com/photo-1555532538-dcdbd01d373d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHw0fHxrZXlib2FyZHxlbnwwfDB8fHwxNjk5NTI1MDAzfDA&ixlib=rb-4.0.3&q=80&w=1080" alt="BlogSEO AI" loading="lazy"/>
//         </a>


//         <div class="flex flex-col justify-beetween gap-3 px-4 py-2">
//             <a 
//                 class="flex justify-center items-center text-xl font-semibold text-teal-700 hover:text-teal-800 two-lines text-ellipsis">
//                 <span>Attendance Management</span>

//             </a>

//             <p class="text-gray-600 two-lines">
//             Simplify and automate attendance tracking with a smart school management system. Teachers can mark attendance digitally, generate reports instantly, and monitor student presence efficiently. Real-time updates ensure accuracy, reduce paperwork, and enhance productivity, making attendance management seamless for schools, colleges, and educational institutions.
//             </p>

           
//         </div>

//     </li>

//     <li class="relative bg-white flex flex-col justify-between border rounded shadow-md hover:shadow-teal-400">

//         <a class="relative" >
//             <img class="rounded relative w-full object-cover aspect-video"
//                 src="https://images.unsplash.com/photo-1574192324001-ee41e18ed679?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w0NzEyNjZ8MHwxfHNlYXJjaHwxNXx8a2V5Ym9hcmR8ZW58MHwwfHx8MTY5OTUyNTAwM3ww&ixlib=rb-4.0.3&q=80&w=1080" alt="Typewise" loading="lazy"/>
//         </a>

//         <div class="flex flex-col justify-beetween gap-3 px-4 py-2">
//             <a 
//                 class="flex justify-center items-center text-xl font-semibold text-teal-700 hover:text-teal-800 two-lines text-ellipsis">
//                 <span>Assignment and Notes</span>

//                 {/* <small class="font-medium text-sm">- AI Communication Assistant</small> */}
//             </a>

//             <p class="text-gray-600 two-lines">
//             Teachers can efficiently manage their tasks using a mobile application, enabling them to share assignments, notes, and important updates with students. The app also allows teachers to review, assess, and provide feedback on student work, fostering better communication, organization, and engagement in the learning process while enhancing overall academic performance.   </p>

//         </div>

//     </li>

// </ul>

// </div>
//     </div>
//   )
// }

// export default Related
