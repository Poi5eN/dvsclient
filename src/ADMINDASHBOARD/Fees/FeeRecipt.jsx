import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { format, parseISO } from "date-fns";

import DownloadIcon from "@mui/icons-material/Download";
import { useStateContext } from "../../contexts/ContextProvider.js";
import { toWords } from "number-to-words";

import "./Print.css";
import Button from "../../Dynamic/utils/Button.jsx";
import moment from "moment";

const FeeRecipt = ({ modalData, handleCloseModal }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const componentPDF = useRef();

  // Normalize modalData to handle both original and new API structures
  const normalizedData = modalData?.data || modalData || {};
  const isUnified = normalizedData.isUnified || false;
  const students = normalizedData.students || [];
  const receiptData = students.length > 0 ? students[0] : {};

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    onBeforeGetContent: () => {
      let title = "Fee Receipt";
      if (isUnified) {
        title = "Unified Fee Receipt";
      } else if (receiptData.studentName) {
        title = `${receiptData.studentName}'s FeeReceipt`;
      } else if (receiptData.studentNames) {
        title = "Unified Fee Receipt";
      }
      document.title = title;
    },
    onAfterPrint: () => {
      alert("Receipt saved in PDF");
      handleCloseModal();
      setTimeout(() => {
        document.title = "OriginalTitle";
      }, 100);
    },
  });

  const Repees = () => {
    return normalizedData.totalAmountPaid || 0;
  };

  const date = () => {
    try {
      let newDate = parseISO(normalizedData.date);
      return format(newDate, "dd/MM/yyyy");
    } catch {
      return "N/A";
    }
  };

  const renderReceipt = (isLeftCopy = true) => {
    // Fallbacks for original data structure
    const studentName =
      receiptData.studentName || modalData.studentName || "N/A";
    const studentClass = receiptData.class || modalData.studentClass || "N/A";
    const admissionNumber =
      receiptData.admissionNumber || modalData.admissionNumber || "N/A";
    const fatherName =
      normalizedData.parentDetails?.fatherName || modalData.fatherName || "N/A";
    const feeReceiptNumber =
      normalizedData.receiptNumber || modalData.feeReceiptNumber || "N/A";
    const paymentMode =
      normalizedData.paymentMode || modalData.paymentMode || "N/A";
    const transactionId =
      normalizedData.transactionId || modalData.transactionId || "N/A";
    const totalFeeAmount =
      receiptData.feeDetails?.totalFeeAmount || modalData.totalFeeAmount || 0;
    const concessionApplied =
      receiptData.feeDetails?.concessionApplied ||
      modalData.concessionApplied ||
      0;
    const totalAmountPaid =
      normalizedData.totalAmountPaid || modalData.totalAmountPaid || 0;
    const totalDues = normalizedData.totalDues || modalData.totalDues || 0;
    const remark = normalizedData.remark || modalData.remark || "N/A";
    const regularFees =
      receiptData.feeDetails?.regularFees || modalData.regularFees || [];
    const additionalFees =
      receiptData.feeDetails?.additionalFees || modalData.additionalFees || [];

    // Unified receipt data
    const unifiedStudentNames = receiptData.studentNames || studentName;
    const unifiedClasses = receiptData.classes || studentClass;
    const unifiedAdmissionNumbers =
      receiptData.admissionNumbers || admissionNumber;

    return (
      <div className="w-[400px] p-1 border-black border-1 rounded-sm dark:text-white">
        <div className="flex justify-between">
          <div className="h-auto w-[150px] dark:text-white">
            <img
              className="h-14 w-14 rounded-full"
              src={
                user?.image?.url ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"
              }
              alt="logo"
            />
          </div>
          <div className="text-center dark:text-white">
            <h1 className="font-bold whitespace-nowrap text-[17px]">
              {user?.schoolName || "N/A"}
            </h1>
            <p className="text-sm">
              <span className="font-semibold">Address </span> :{" "}
              {user?.address || "N/A"}
            </p>
            <p className="text-sm">
              <span className="font-semibold">Contact </span> :{" "}
              {user?.contact || "N/A"}
            </p>
          </div>
        </div>
        <div className="bg-gray-300 text-center border-b-2 border-red-500">
          <h3 className="font-bold text-[13px] scale-125">Fee receipt :</h3>
        </div>
        <div className="flex justify-between text-[12px] dark:text-white">
          <div>
            <div className="text-[14px]">
              Rec.No.: <strong>{feeReceiptNumber}</strong>
            </div>
            <div className="text-[14px]">
              Name:{" "}
              <strong>{isUnified ? unifiedStudentNames?.toUpperCase() : studentName?.toUpperCase()}</strong>
            </div>
            <div className="text-[14px]">
              Class:{" "}
              <strong>{isUnified ? unifiedClasses : studentClass}</strong>
            </div>
            <div className="text-[14px]">
              S/D. of: <strong>{fatherName?.toUpperCase()}</strong>
            </div>
            {transactionId.length > 4 && (
              <div className="text-[14px]">
                checkBook/transactionId: <strong>{transactionId}</strong>
              </div>
            )}
          </div>
          <div>
            <div className="text-[14px]">
              Date: <strong>{moment(normalizedData.date).format("DD-MM-YYYY")}</strong>
              {/* Date: <strong>{date()}</strong> */}
            </div>
            <div className="text-[14px]">
              Adm No:{" "}
              <strong>
                {isUnified ? unifiedAdmissionNumbers : admissionNumber}
              </strong>
            </div>
            <div className="text-[14px]">
              Mode: <strong>{paymentMode}</strong>
            </div>
            <div className="text-[14px]">
              Month: <strong>{regularFees.map((addFee, index) => (addFee?.month))}</strong>
            </div>
          </div>
        </div>
        {regularFees.length > 0 || additionalFees.length > 0 ? (
          <table className="min-w-full leading-normal">
            <thead>
              <tr>
                <th className="border border-black pl-2 text-[14px] text-start">FEE HEAD</th>
                {/* <th className="border border-black pl-2 text-[14px]">Month</th> */}
                <th className="border border-black pl-2 text-[14px] text-start">AMOUNT (Rs.)</th>
                {/* <th className="border border-black pl-2 text-[14px] text-start">DUES</th> */}
                {/* <th className="border border-black pl-2 text-[14px] text-start">STATUS</th> */}
              </tr>
            </thead>
            {regularFees.length > 0 && (
              <tbody>
                {regularFees.map((addFee, index) => (
                  <tr key={`reg-${index}`}>
                    <td className="border border-black pl-2 text-[14px]">
                      FEE
                    </td>
                    {/* <td className="border border-black pl-2 text-[14px]">
                      {addFee.month || "N/A"}
                    </td> */}
                    <td className="border border-black pl-2 text-[14px]">
                      {addFee.feeStructureAmount || 0}
                      {/* {addFee.paidAmount || 0} */}
                    </td>
                    {/* <td className="border border-black pl-2 text-[14px]">
                      {addFee.dueAmount || 0}
                    </td> */}
                    {/* <td className="border border-black pl-2 text-[14px]">
                      {addFee.status || "N/A"}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            )}
            {additionalFees.length > 0 && (
              <tbody>
                {additionalFees.map((addFee, index) => (
                  <tr key={`add-${index}`}>
                    <td className="border border-black pl-2 text-[14px]">
                      {addFee.name || "N/A"}
                    </td>
                    {/* <td className="border border-black pl-2 text-[14px]">
                      {addFee.month || "N/A"}
                    </td> */}
                    <td className="border border-black pl-2 text-[14px]">
                      {addFee.feeStructureAmount || 0}
                      {/* {addFee.paidAmount || 0} */}
                    </td>
                    {/* <td className="border border-black pl-2 text-[14px]">
                      {addFee.dueAmount || 0}
                    </td> */}
                    {/* <td className="border border-black pl-2 text-[14px]">
                      {addFee.status || "N/A"}
                    </td> */}
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        ) : (
          <h1 className="text-center">No Fee</h1>
        )}
        <div className="mt-1">
          <table className="w-full border border-black text-[14px]">
            <tbody>
              <tr>
                <td className="border border-black pl-2">Total Fee Amount.</td>
                <td className="border border-black pl-2">₹ {totalFeeAmount}</td>
              </tr>
              <tr>
                <td className="border border-black pl-2">Concession Amount</td>
                <td className="border border-black pl-2">
                  ₹ {concessionApplied ? concessionApplied : "0"}
                </td>
              </tr>
              <tr>
                <td className="border border-black pl-2">Paid Amount</td>
                <td className="border border-black pl-2">
                  ₹ {totalAmountPaid}
                </td>
              </tr>
              <tr>
                <td className="border border-black pl-2">Total Dues</td>
                <td className="border border-black pl-2 text-red-600">
                  ₹ {totalDues}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="border-black p-2 border-1 my-2">
          <p className="text-[14px] font-bold">
            Rupees {toWords(Repees()).toUpperCase()} ONLY
          </p>
          <p className="text-[14px]">
            Remarks: <strong>{remark}</strong>
          </p>
          <div className="flex justify-between text-[14px]">
            <div>Fee Collected: ................</div>
            <div>Authorised sign</div>
          </div>
        </div>
        <div className="text-[10px] border-1 border-black p-2">
          <p className="text-15px font-bold">Note:</p>
          <ol className="list-decimal ml-5">
            <li>
              Cheque is subject to the realization. Rs.500/- Extra will be
              charged in case of cheque dishonour.
            </li>
            <li>
              Fee receipt and Fee card both should be kept in safe place for
              future.
            </li>
            <li>
              Please check the entry made by fee clerk in fee Card and fee
              Receipt
            </li>
          </ol>
        </div>
      </div>
    );
  };

  // Early return if no valid data
  if (!normalizedData || (!students.length && !modalData.studentName)) {
    return <div>Error: No receipt data available</div>;
  }

  return (
    <div>
      <a
        onClick={generatePDF}
        className="text-black absolute right-20 top-1 cursor-pointer"
      >
        <Button Icon={<DownloadIcon className="text-2xl" />} name="PRINT" />
      </a>
      <div
        className="w-full mx-auto flex justify-around p-2 pt-5 gap-2"
        ref={componentPDF}
      >
        {renderReceipt(true)}
        {renderReceipt(false)}
      </div>
    </div>
  );
};

export default FeeRecipt;






// import React, { useRef } from "react";
// import { useReactToPrint } from "react-to-print";
// import { format, parseISO } from "date-fns";

// import DownloadIcon from "@mui/icons-material/Download";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import { toWords } from "number-to-words";

// import "./Print.css"
// import Button from "../../Dynamic/utils/Button.jsx";
// const FeeRecipt = ({ modalData, handleCloseModal }) => {
//   const user = JSON.parse(localStorage.getItem("user"))

 
//   // const SchoolImage = sessionStorage.getItem("image");
//   const componentPDF = useRef();

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     onBeforeGetContent: () => {
//       document.title = `${modalData.studentName}'s FeeReceipt`;
//     },
//     onAfterPrint: () => {
//       alert("modalData saved in PDF");
//       handleCloseModal();
//       setTimeout(() => {
//         document.title = "OriginalTitle";
//       }, 100);
//     },
//   });
//   const Repees = () => {
//     return modalData.totalAmountPaid;
//   };
//   const date = () => {
//     let newDate = parseISO(modalData.date);
//     return format(newDate, "dd/MM/yyyy");
//   };

//   return (
//     <div >
//       <a
//         // variant="contained"
//         onClick={generatePDF}
      
//         className="text-black absolute right-20 top-1  cursor-pointer "
       
//       >
      
//       <Button Icon={<DownloadIcon className="text-2xl"/>} name="PRINT"/>
//       </a>
//         <div className="w-full mx-auto flex justify-around p-2 pt-5 gap-2  " ref={componentPDF} >
//           <div className="w-[400px]  p-1 border-black border-1   rounded-sm dark:text-white">
//             <div className="flex justify-between ">
//               <div className=" h-auto w-[150px]  dark:text-white  ">
//                 <img
//                   className="h-14 w-14 rounded-full "
//                   src={user?.image?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"}
//                   alt="logo"
//                 />
//               </div>
//               <div className="text-center  dark:text-white">
//                 <h1 className="font-bold whitespace-nowrap text-[17px]">{user?.schoolName}</h1>
//                 <p className="text-sm"><span className="font-semibold">Address </span> : {user?.address || "N/A"}   </p>
//                 <p className="text-sm"> <span className="font-semibold">Contact </span> : {user?.contact || "N/A"}</p>
//               </div>
//             </div>
//             <div className="bg-gray-300 text-center  border-b-2 border-red-500 ">
//               <h3 class="font-bold text-[13px] scale-125">Fee receipt :</h3>
//             </div>
//             <div className="flex justify-between text-[12px] dark:text-white">
//               <div>
//                 <div className="text-[14px]">
//                   Rec.No.: <strong>{modalData.feeReceiptNumber}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   Name: <strong>{modalData.studentName}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   Class: <strong> {modalData.studentClass}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   S/D. of: <strong>{modalData?.fatherName}</strong>
//                 </div>
//                 {
//                 modalData.transactionId.length>4 &&  <div className="text-[14px]">
//                 checkBook/transactionId: <strong>{modalData.transactionId}</strong>
//                </div>
//                 }
               
//               </div>
//               <div>
//                 <div className="text-[14px]">
//                   Date: <strong>{date()}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   Adm No: <strong>{modalData.admissionNumber}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   Mode: <strong>{modalData.paymentMode}</strong>
//                 </div>
               
//               </div>
//             </div>
//             {(modalData.regularFees.length > 0  || modalData.additionalFees.length > 0) ? (
//               <table class="min-w-full leading-normal">
//                 <thead>
//                   <tr>
//                     <th class="border border-black pl-2 text-[14px]">Name</th>
//                     <th class="border border-black pl-2 text-[14px]">
//                       {" "}
//                       Month
//                     </th>
//                     <th class="border border-black pl-2 text-[14px]">
//                       {" "}
//                       Amount
//                     </th>
//                     <th class="border border-black pl-2 text-[14px]">
//                       {" "}
//                       Dues
//                     </th>
//                     <th class="border border-black pl-2 text-[14px]">
//                       {" "}
//                       Status{" "}
//                     </th>
//                   </tr>
//                 </thead>

//                 {modalData.regularFees.length > 0 && (
//                   <tbody>
//                     {modalData.regularFees.map((addFee) => (
//                       <tr>
//                         <td class="border border-black pl-2 text-[14px]">
//                           FEE{" "}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {" "}
//                           {addFee.month}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {" "}
//                           {addFee.paidAmount}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {" "}
//                           {addFee.dueAmount}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.status}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//                 {modalData.additionalFees.length > 0 && (
//                   <tbody>
//                     {modalData.additionalFees.map((addFee) => (
//                       <tr>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.name}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.month}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {" "}
//                           {addFee.paidAmount}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.dueAmount}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.status}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//               </table>
//             ) : (
//               <h1 className="text-center">No Fee</h1>
//             )}

//             <div class="mt-1">
//               <table class="w-full border border-black text-[14px]">
//                 <tbody>
//                 <tr>
//                     <td class="border border-black pl-2">Total Fee Amount.</td>
//                     <td class="border border-black pl-2"> ₹ {modalData.totalFeeAmount}</td>
//                   </tr>
                 
//                   <tr>
//                     <td class="border border-black pl-2">Concession Amount </td>
//                     <td class="border border-black pl-2"> ₹ {modalData.concessionApplied?modalData.concessionApplied:"0"}</td>
//                   </tr>
                  
//                   <tr>
//                     <td class="border border-black pl-2">Paid Amount</td>
//                     <td class="border border-black pl-2">
//                     {/* ₹  {modalData.totalAmountPaid} */}
//                     ₹  {modalData.totalAmountPaid}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td class="border border-black pl-2">Total Dues</td>
//                     <td class="border border-black pl-2 text-red-600">
//                     {/* ₹  {modalData.totalAmountPaid} */}
//                     ₹  {modalData.totalDues}
//                     </td>
//                   </tr>
//                   {/* <tr>
//                     <td class="border border-black pl-2">Paid Amount</td>
//                     <td class="border border-black pl-2">
//                       {modalData.totalAmountPaid}
//                     </td>
//                   </tr> */}
//                 </tbody>
//               </table>
//             </div>

//            <div className="border-black p-1 border-1 my-2">
//            <p class="text-[14px] font-bold">Rupees {toWords(Repees()).toUpperCase()} ONLY</p>
//             <p className="text-[14px]">
//               {" "}
//               Remarks:{" "}
//               <strong className="">{modalData.remark}</strong>
//             </p>
//             <div class="flex justify-between text-[14px]">
//               <div>Fee Collected: ................</div>
//               <div>Authorised sign</div>
//             </div>
//            </div>

//             <div class=" text-[10px] border-1 border-black p-2">
//               <p className="tetx-15px font-bold">Note:</p>
//               <ol class="list-decimal ml-5">
//                 <li>
//                   Cheque is subject to the realization. Rs.500/- Extra will be
//                   charged in case of cheque dishonour.
//                 </li>
//                 <li>
//                   Fee receipt and Fee card both should be kept in safe place for
//                   future.
//                 </li>
//                 <li>
//                   Please check the entry made by fee clerk in fee Card and fee
//                   Receipt
//                 </li>
//               </ol>
//             </div>
//           </div>
//           <div className="w-[400px]  p-1 border-black border-1   rounded-sm dark:text-white">
//             <div className="flex justify-between ">
//               <div className=" h-auto w-[150px]  dark:text-white  ">
//                 <img
//                   className="h-14 w-14 rounded-full "
//                   src={user?.image?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"}
//                   alt="logo"
//                 />
//               </div>
//               <div className="text-center  dark:text-white">
//                 <h1 className="font-bold whitespace-nowrap text-[17px]">{user?.schoolName}</h1>
//                 <p className="text-sm"><span className="font-semibold">Address </span> : {user?.address || "N/A"}   </p>
//                 <p className="text-sm"> <span className="font-semibold">Contact </span> : {user?.contact || "N/A"}</p>
//               </div>
//             </div>
//             <div className="bg-gray-300 text-center  border-b-2 border-red-500 ">
//               <h3 class="font-bold text-[13px] scale-125">Fee receipt :</h3>
//             </div>
//             <div className="flex justify-between text-[12px] dark:text-white">
//               <div>
//                 <div className="text-[14px]">
//                   Rec.No.: <strong>{modalData.feeReceiptNumber}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   Name: <strong>{modalData.studentName}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   Class: <strong> {modalData.studentClass}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   S/D. of: <strong>{modalData?.fatherName}</strong>
//                 </div>
//                 {
//                 modalData.transactionId.length>4 &&  <div className="text-[14px]">
//                 checkBook/transactionId: <strong>{modalData.transactionId}</strong>
//                </div>
//                 }
               
//               </div>
//               <div>
//                 <div className="text-[14px]">
//                   Date: <strong>{date()}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   Adm No: <strong>{modalData.admissionNumber}</strong>
//                 </div>
//                 <div className="text-[14px]">
//                   Mode: <strong>{modalData.paymentMode}</strong>
//                 </div>
               
//               </div>
//             </div>
//             {(modalData.regularFees.length > 0  || modalData.additionalFees.length > 0) ? (
//               <table class="min-w-full leading-normal">
//                 <thead>
//                   <tr>
//                     <th class="border border-black pl-2 text-[14px]">Name</th>
//                     <th class="border border-black pl-2 text-[14px]">
//                       {" "}
//                       Month
//                     </th>
//                     <th class="border border-black pl-2 text-[14px]">
//                       {" "}
//                       Amount
//                     </th>
//                     <th class="border border-black pl-2 text-[14px]">
//                       {" "}
//                       Dues
//                     </th>
//                     <th class="border border-black pl-2 text-[14px]">
//                       {" "}
//                       Status{" "}
//                     </th>
//                   </tr>
//                 </thead>

//                 {modalData.regularFees.length > 0 && (
//                   <tbody>
//                     {modalData.regularFees.map((addFee) => (
//                       <tr>
//                         <td class="border border-black pl-2 text-[14px]">
//                           FEE{" "}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {" "}
//                           {addFee.month}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {" "}
//                           {addFee.paidAmount}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {" "}
//                           {addFee.dueAmount}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.status}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//                 {modalData.additionalFees.length > 0 && (
//                   <tbody>
//                     {modalData.additionalFees.map((addFee) => (
//                       <tr>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.name}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.month}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {" "}
//                           {addFee.paidAmount}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.dueAmount}
//                         </td>
//                         <td class="border border-black pl-2 text-[14px]">
//                           {addFee.status}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 )}
//               </table>
//             ) : (
//               <h1 className="text-center">No Fee</h1>
//             )}

//             <div class="mt-1">
//               <table class="w-full border border-black text-[14px]">
//                 <tbody>
//                 <tr>
//                     <td class="border border-black pl-2">Total Fee Amount.</td>
//                     <td class="border border-black pl-2"> ₹ {modalData.totalFeeAmount}</td>
//                   </tr>
                 
//                   <tr>
//                     <td class="border border-black pl-2">Concession Amount </td>
//                     <td class="border border-black pl-2"> ₹ {modalData.concessionApplied?modalData.concessionApplied:"0"}</td>
//                   </tr>
                  
//                   <tr>
//                     <td class="border border-black pl-2">Paid Amount</td>
//                     <td class="border border-black pl-2">
//                     {/* ₹  {modalData.totalAmountPaid} */}
//                     ₹  {modalData.totalAmountPaid}
//                     </td>
//                   </tr>
//                   <tr>
//                     <td class="border border-black pl-2">Total Dues</td>
//                     <td class="border border-black pl-2 text-red-600">
//                     {/* ₹  {modalData.totalAmountPaid} */}
//                     ₹  {modalData.totalDues}
//                     </td>
//                   </tr>
//                   {/* <tr>
//                     <td class="border border-black pl-2">Paid Amount</td>
//                     <td class="border border-black pl-2">
//                       {modalData.totalAmountPaid}
//                     </td>
//                   </tr> */}
//                 </tbody>
//               </table>
//             </div>

//            <div className="border-black p-2 border-1 my-2">
//            <p class="text-[14px] font-bold">Rupees {toWords(Repees()).toUpperCase()} ONLY</p>
//             <p className="text-[14px]">
//               {" "}
//               Remarks:{" "}
//               <strong className="">{modalData.remark}</strong>
//             </p>
//             <div class="flex justify-between text-[14px]">
//               <div>Fee Collected: ................</div>
//               <div>Authorised sign</div>
//             </div>
//            </div>

//             <div class=" text-[10px] border-1 border-black p-2">
//               <p className="tetx-15px font-bold">Note:</p>
//               <ol class="list-decimal ml-5">
//                 <li>
//                   Cheque is subject to the realization. Rs.500/- Extra will be
//                   charged in case of cheque dishonour.
//                 </li>
//                 <li>
//                   Fee receipt and Fee card both should be kept in safe place for
//                   future.
//                 </li>
//                 <li>
//                   Please check the entry made by fee clerk in fee Card and fee
//                   Receipt
//                 </li>
//               </ol>
//             </div>
//           </div>
         
//         </div>
     
//     </div>
//   );
// };

// export default FeeRecipt;

