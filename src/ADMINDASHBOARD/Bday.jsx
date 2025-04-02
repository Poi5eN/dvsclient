


import React from 'react'

const Bday = () => {
  return (
    <div>Bday</div>
  )
}

export default Bday
// import React from "react";
// import { format } from "date-fns";
// import { useStateContext } from "../contexts/ContextProvider";

// const Bday = ({ studentData }) => {
//   const today = new Date();

//   const year = today.getFullYear();
//   console.log("Year:", year);
//   // Format today's date as "dd-MM"
//   const todayDay = String(today.getDate()).padStart(2, "0");
//   const todayMonth = String(today.getMonth() + 1).padStart(2, "0");
//   const formattedToday = `${todayDay}-${todayMonth}`;
//   const nowDate = `${todayDay}-${todayMonth}`;
//   //   console.log('Formatted Today:', formattedToday);

//   // Filter students whose DOB matches today
//   const matchingStudents = studentData?.allStudent?.filter((student) => {
//     const studentDOB = format(new Date(student.dateOfBirth), "dd-MM");
//     return studentDOB === formattedToday;
//   });

//   const { currentColor } = useStateContext();

//   return (
//     <div>
//       <h1 className="font-bold" style={{ color: currentColor }}>
//         Student's Birthdays Today 🎂🎂
//       </h1>
//       <div className="overflow-auto max-h-[150px] ">
//       {matchingStudents && matchingStudents.length > 0 ? (
//         matchingStudents.map((student) => (
//          <>
//           <div
//             key={student.admissionNumber}
//             className="flex justify-between"
//             style={{
//               border: "1px solid #ccc",
//               margin: "1px",
//               padding: "5px",
//             }}
//           >
//             <div className="flex gap-10">
//               {console.log("student", student)}
//               <img
//                 src={student.image?.url}
//                 alt={`${student.fullName}'s Profile`}
//                 style={{
//                   width: "30px",
//                   height: "30px",
//                   objectFit: "cover",
//                   borderRadius: "50%",
//                 }}
//               />
//               <h2 className="text-xl font-bold uppercase">
//                 {student.fullName}
//               </h2>
//               <h2 className="text-xl ">
//                 {`${year - format(new Date(student.dateOfBirth), "yyyy")}`}th
//                 B.day 🎂🎂
//               </h2>
//               {/* <h2 className='text-xl font-bold uppercase'>{`${format(new Date(student.dateOfBirth)}`} 🎂🎂</h2>   */}
//             </div>
//             <p>
//               Class: {student.class}-{student.section}
//             </p>
//           </div>
          
//          </>
//         ))
//       ) : (
//         <p>No birthdays today!</p>
//       )}
//     </div>
//     </div>
//   );
// };

// export default Bday;

// import React from 'react';
// import { format } from 'date-fns';

// const Bday = ({ studentData }) => {

//   const today = new Date();

//   // Extract today's day and month
//   const todayDay = String(today.getDate()).padStart(2, '0');
//   const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
//   const formattedToday = `${todayDay}-${todayMonth}`;
//   console.log('formattedToday',String(formattedToday))
// console.log('studentData',studentData?.allStudent)

//    const dob= studentData?.allStudent?.map((item)=>{
//         return  format(new Date(item.dateOfBirth), 'dd-MM')
//     }

// )
//         console.log("dob",dob?.filter((item)=>`${item}` === formattedToday))

//   return (
//     <div>
//         <h1>Birthdays Today</h1>

//     </div>
//   );
// };

// export default Bday;

// import React from 'react'
// import { format } from 'date-fns';
// const Bday = (studentData) => {
//     const today = new Date();

//     const day = String(today.getDate()).padStart(2, '0');
//     const month = String(today.getMonth() + 1).padStart(2, '0');
//     const formattedDate = `${day}-${month}`;
//   return (
//     <div>
//         {
//         studentData?.studentData?.allStudent?.map((item)=>(
//            <>
//             <span>
//                 {format(new Date(item.dateOfBirth), 'dd-MM-yyyy')}

//                  </span>
//                  <br />
//            </>

//         ))

//         }
//     </div>
//   )
// }

// export default Bday
