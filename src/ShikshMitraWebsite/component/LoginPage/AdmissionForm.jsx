

import moment from "moment";
import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";

const AdmissionForm = (selectStudent ) => {
  // console.log("student",selectStudent)
  const student=selectStudent?.selectStudent
  console.log("student",student)
  const user=JSON.parse(localStorage.getItem("user"))
  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Admission_Form",
  });
// }
  return (
    <>
     <button className="bg-blue-600 text-white p-1 rounded-lg shadow hover:bg-blue-700 px-3" onClick={handlePrint}>
        Print
      </button>
    <div ref={componentRef} className="w-[210mm] h-[297mm] mx-auto  bg-white border border-gray-300 shadow-lg">
      <div class="flex justify-center items-center bg-gray-200">
        <div class="w-full bg-gradient-to-b from-red-600 to-red-700 text-white text-center p-6 border border-gray-800 shadow-lg relative">
          
          <h1 class="text-4xl font-extrabold uppercase mt-2">
            <span class="text-yellow-400">{user?.schoolName}</span>
          </h1>
          <div className="flex justify-between">
            <div class="flex justify-center items-center ">
              <img
                src={user?.image?.url}
                alt="School Logo"
                class="w-24 h-24 rounded-full border-4 border-yellow-400"
              />
            </div>
            <div>
              <p class="mt-2 bg-white text-black inline-block px-4 py-1 rounded-lg text-sm font-semibold">
                {/* At. Khagra Ward No 32 Kishanganj, Dist. Kishanganj (Bihar) */}
                {user?.address},{user?.schoolCity},{user?.pincode}
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
            
            <div class="absolute right-0 -top-8 w-24 h-24 bg-yellow-400 flex justify-center items-center ">
                <img src={student?.studentImage?.url} alt="Student"/>
            </div>
        </div>
        </div>
      </div>

      <div className=" p-6 space-y-4 text-blue-900">
        <div className="flex">
          <strong className="whitespace-nowrap">1. Full Name: </strong>{" "}
          <span className="ml-4 border-b-2 border-dotted w-full">
            {student?.studentName}
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
          <strong>5. DOB: </strong> {moment(student?.dateOfBirth).format("DD-MMM-YYYY")} &nbsp;
          <strong>Date of Birth: </strong>  {moment(student?.dateOfBirth).format("DD-MMM-YYYY")}
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
            {student?.address}
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
          <strong>10. Admission in class: </strong> {student?.class}
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

      {/* Print Button */}
      {/* <div className="text-center mt-6">
        <button
          className="bg-blue-600 text-white px-6 py-2 rounded-lg shadow hover:bg-blue-700"
          onClick={() => window.print()}
        >
          Print Form
        </button>
      </div> */}
    </div>
    </>
  );
};

export default AdmissionForm;
