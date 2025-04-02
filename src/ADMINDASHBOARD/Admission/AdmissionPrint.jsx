import React, { useRef } from "react";

import { useReactToPrint } from "react-to-print";
function AdmissionPrint({ student }) {
  
  const user = JSON.parse(localStorage?.getItem("user"));

  const componentPDF = useRef();
  // const [student?, setstudent?] = useState({});
  const formattedDate = new Date(
    student?.dateOfBirth
  ).toLocaleDateString();
  const AdmissionDate = new Date(
    student?.joiningDate
  ).toLocaleDateString();

  // const generatePDF = useReactToPrint({
  //   content: () => componentPDF.current,
  //   documentTitle: `${student?.fullName},Admission form`,
  //   onAfterPrint: () => alert("Downloaded"),
  // });
  return (
    <>
        <div className="w-[210mm] h-[297mm] mx-auto  bg-white border border-gray-300 shadow-lg">
      <div class="flex justify-center items-center bg-gray-200">
        <div class="w-full bg-gradient-to-b from-red-600 to-red-700 text-white text-center p-6 border border-gray-800 shadow-lg relative">
          
          <h1 class="text-4xl font-extrabold uppercase mt-2">
            <span class="text-yellow-400">National Children Public School</span>
          </h1>
          <div className="flex justify-between">
            <div class="flex justify-center items-center ">
              <img
                src="https://placehold.co/100x100?text=LOGO"
                alt="School Logo"
                class="w-24 h-24 rounded-full border-4 border-yellow-400"
              />
            </div>
            <div>
              <p class="mt-2 bg-white text-black inline-block px-4 py-1 rounded-lg text-sm font-semibold">
                At. Khagra Ward No 32 Kishanganj, Dist. Kishanganj (Bihar)
              </p>

              <p class="mt-3 text-lg font-semibold text-yellow-300">
                (An English Medium Co-educational School)
              </p>

              <p class="mt-2 text-2xl font-bold">FOR CLASS NURSERY TO VIII</p>

              <p class="mt-3 text-xl bg-white text-black font-bold inline-block px-6 py-2 rounded-lg">
                APPLICATION FOR ADMISSION
              </p>
            </div>
            <div></div>
          </div>


          <div class=" relative">
            
            <div class="absolute right-0 -top-8 w-24 h-24 bg-yellow-400 flex justify-center items-center border-4 border-black">
                <img src="https://placehold.co/80x80/000000/FFFFFF?text=User" alt="User Profile Placeholder"/>
            </div>
        </div>
        </div>
      </div>

      <div className=" p-6 space-y-4 text-blue-900">
        <div className="flex">
          <strong className="whitespace-nowrap">1. Full Name: </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.StudentName}
          </span>
        </div>
        <div className="flex">
          <strong className="whitespace-nowrap">2. Father's Name: </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.fatherName}
          </span>
        </div>
        <div className="flex">
          <strong className="whitespace-nowrap">3. Mother's Name: </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.motherName}
          </span>
        </div>
        <div className="flex">
          <strong className="whitespace-nowrap">
            4. Father's Occupation:{" "}
          </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.fatherOccupation}
          </span>
        </div>
        <div>
          <strong>5. Age: </strong> {student?.age} &nbsp;
          <strong>Date of Birth: </strong> {student?.dob}
        </div>
        <div className="flex">
          <strong>6. Sex (M/F): </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.gender}
          </span>
          <strong>Nationality: </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.nationality}
          </span>
        </div>
        <div>
          <strong>7. Caste: </strong> {student?.caste} &nbsp;
          <strong>Religion: </strong> {student?.religion}
        </div>
        <div>
          <p className="text-center">8. Full Address:</p>
        </div>
        <div className="flex">
          <strong>Village: </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.village}
          </span>
          <strong>P.O.: </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.po}
          </span>
        </div>
        <div className="flex">
          <strong>Dist.: </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.district}
          </span>
          <strong>Pin: </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.pin}
          </span>
        </div>
        <div>
          <strong>9. Guardian Mob: </strong> {student?.guardianMobile}
        </div>
        <div>
          <strong>10. Admission in class: </strong> {student?.admissionClass}
        </div>
        <div>
          <strong>11. Admission for the session: </strong> {student?.session}
        </div>
        <div>
          <strong>12. </strong> I hereby declare that I will abide by the rules
          and regulations of the institution.
        </div>

        <div className="bg-blue-500 text-white text-center font-semibold py-1">
          DECLARATION BY THE STUDENT
        </div>
        <div>
          <strong>13. </strong> I declare that it is my own responsibility to
          bring the child to school.
        </div>

        <div className="bg-blue-500 text-white text-center font-semibold py-1">
          DECLARATION BY THE GUARDIAN
        </div>

        <div className="flex justify-between mt-4">
          <span>Principal Seal & Sign</span>
          <span>Full Sign of Guardian / Thumb</span>
        </div>
      </div>

     
    </div>
    </>
  );
}

export default AdmissionPrint;



// import React, { useRef } from "react";

// import { useReactToPrint } from "react-to-print";
// function AdmissionPrint({ studentValues }) {
//   const user = JSON.parse(localStorage?.getItem("user"));

//   const componentPDF = useRef();
//   // const [studentValues?, setstudentValues?] = useState({});
//   const formattedDate = new Date(
//     studentValues?.dateOfBirth
//   ).toLocaleDateString();
//   const AdmissionDate = new Date(
//     studentValues?.joiningDate
//   ).toLocaleDateString();

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `${studentValues?.fullName},Admission form`,
//     onAfterPrint: () => alert("Downloaded"),
//   });
//   return (
//     <>
//       <div className="content border ">
//         <div ref={componentPDF} className="p-2 ">
//           <div className="border border-red-500 p-5 relative">
//             <div className=" absolute  left-5 ">
//               <img
//                 src={
//                   user?.image?.url ||
//                   "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"
//                 }
//                 style={{ height: "100px", width: "100px" }}
//                 alt="Citi Ford School Logo"
//               />
//             </div>
//             <div className="flex  justify-center inset-0 rounded-md z-50">
//               <div className="md:w-7/12 w-10/12 text-center">
//                 <h1 className="md:text-3xl text-lg font-bold  text-center text-black ">
//                   {user?.schoolName}
//                 </h1>
//                 <div className="text- leading-5 ">
//                   <span className="block text-center  ">{user?.address}</span>
//                   <p>
//                     {user?.schoolCity},{user?.schoolState},{user?.pincode}
//                   </p>
//                   <span className="block text-center">
//                     Email:- {user?.email}
//                     <br />
//                     Contact :- {user?.contact}
//                   </span>
//                 </div>
//               </div>
//             </div>
//             <center>
//               <h3 className="text-red-700 font-bold underline">
//                 [ENGLISH MEDIUM]
//               </h3>
//             </center>
//             <center>
//               <span className="text-[12px ]">Session : 2024-25</span>
//             </center>
//             <div className="mb-1 rounded-md flex justify-between">
//               <div className="flex flex-col justify-between">
//                 <p className="border border-black w-52 p-2 mb-4">
//                   Admission No :-{" "}
//                   <span className="text-blue-800 font-bold">
//                     {studentValues?.admissionNumber}
//                   </span>
//                 </p>
//                 <span className="border bg-green-800 text-white p-2">
//                   APPLICATION FORM RECEIPT
//                 </span>
//               </div>
//               {console.log("studentValues", studentValues)}
//               <div className=" border-black w-36 h-36 flex items-center justify-center border-2 p-1">
//                 <img
//                   src={studentValues?.studentImage?.url}
//                   alt="img"
//                   className="w-full h-full object-contain"
//                 />
//               </div>
//             </div>
//             <div className=" text-[16px]">
//               <div className="mb-3">
//                 <tr className="">
//                   <th
//                     scope="row"
//                     className=" font-semibold    whitespace-nowrap"
//                   >
//                     Name of Student :
//                   </th>
//                   <td className=" border-b-2 border-dashed w-full">
//                     &nbsp;{studentValues?.fullName}
//                   </td>
//                 </tr>
//               </div>

//               <div className="">
//                 <div className="mb-3 flex w-full justify-between">
//                   <tr className="w-full">
//                     <th
//                       scope="row"
//                       className=" font-semibold   whitespace-nowrap"
//                     >
//                       Gender :
//                     </th>
//                     <td className=" border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.gender}
//                     </td>
//                   </tr>
//                   <tr className="w-full ">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Date of Birth :
//                     </th>
//                     <td className="  border-b-2 border-dashed w-full">
//                       &nbsp; {formattedDate}
//                     </td>
//                   </tr>
//                 </div>

//                 <div className="mb-3">
//                   <tr className="">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Email :
//                     </th>
//                     <td className=" border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.email}
//                     </td>
//                   </tr>
//                 </div>
//                 <div className="mb-3 flex w-full justify-between">
//                   <tr className="w-full">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Father :
//                     </th>
//                     <td className=" border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.fatherName}
//                     </td>
//                   </tr>
//                   <tr className="w-full ">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Mother :
//                     </th>
//                     <td className="  border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.motherName}
//                     </td>
//                   </tr>
//                 </div>

//                 <div className="mb-3">
//                   <tr className="">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Occupation Father :
//                     </th>
//                     <td className=" border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.fatherName}
//                     </td>
//                   </tr>
//                 </div>
//                 <div className="mb-3">
//                   <tr className="">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Address :
//                     </th>
//                     <td className=" border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.address},{studentValues?.city},
//                       {studentValues?.state},
//                       <span className=" font-bold">
//                         {studentValues?.pincode}
//                       </span>
//                     </td>
//                   </tr>
//                 </div>
//                 <div className="mb-3">
//                   <tr className="">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Mobile No. :
//                     </th>
//                     <td className=" border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.contact}
//                     </td>
//                   </tr>
//                 </div>
//                 <div className="mb-3 flex w-full justify-between">
//                   <tr className="w-full ">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Caste :
//                     </th>
//                     <td className="  border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.caste}
//                     </td>
//                   </tr>
//                   <tr className="w-full">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Religion :
//                     </th>
//                     <td className=" border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.religion}
//                     </td>
//                   </tr>
//                 </div>
//                 <div className="mb-3 flex w-full justify-between">
//                   <tr className="w-full ">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Country :
//                     </th>
//                     <td className="  border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.country}
//                     </td>
//                   </tr>
//                   <tr className="w-full">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Nationality :
//                     </th>
//                     <td className=" border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.nationality}
//                     </td>
//                   </tr>
//                 </div>
//                 <div className="mb-3">
//                   <tr className="">
//                     <th
//                       scope="row"
//                       className=" font-semibold    whitespace-nowrap"
//                     >
//                       Class in which admission sought
//                     </th>
//                     <td className=" border-b-2 border-dashed w-full">
//                       &nbsp; {studentValues?.class}-{studentValues?.section}
//                     </td>
//                   </tr>
//                 </div>
//                 <div className=" flex justify-start mt-4 ">
//                   <tr className="">
//                     <th
//                       scope="row"
//                       className=" font-semibold  text-gray-700  whitespace-nowrap"
//                     >
//                       Admission Date : &nbsp; {AdmissionDate}
//                     </th>
//                   </tr>
//                 </div>
//                 <div className=" flex justify-end ">
//                   <tr className="mt-10">
//                     <th
//                       scope="row"
//                       className=" font-semibold  text-gray-700  whitespace-nowrap"
//                     >
//                       Principal
//                     </th>
//                   </tr>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default AdmissionPrint;
