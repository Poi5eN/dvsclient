import React, { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { format, parseISO } from "date-fns";

import DownloadIcon from "@mui/icons-material/Download";
import { useStateContext } from "../../contexts/ContextProvider.js";
import { toWords } from "number-to-words";

import "./Print.css"
const FeeRecipt = ({ modalData, handleCloseModal }) => {
  const user = JSON.parse(localStorage.getItem("user"))

 
  // const SchoolImage = sessionStorage.getItem("image");
  const componentPDF = useRef();

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    onBeforeGetContent: () => {
      document.title = `${modalData.studentName}'s FeeReceipt`;
    },
    onAfterPrint: () => {
      alert("modalData saved in PDF");
      handleCloseModal();
      setTimeout(() => {
        document.title = "OriginalTitle";
      }, 100);
    },
  });
  const Repees = () => {
    return modalData.totalAmountPaid;
  };
  const date = () => {
    let newDate = parseISO(modalData.date);
    return format(newDate, "dd/MM/yyyy");
  };

  return (
    <div >
      <a
        // variant="contained"
        onClick={generatePDF}
      
        className="text-black absolute right-20 top-1  cursor-pointer "
       
      >
      <DownloadIcon className="text-2xl" />
      </a>
        <div className=" flex flex-1 p-2 " ref={componentPDF} >
          <div className="w-[400px] pe-[15px] border-r border-dashed border-gray-800   rounded-sm dark:text-white">
            <div className="flex justify-between ">
              <div className=" h-auto w-[150px]  dark:text-white  ">
                <img
                  className="h-12 w-12 rounded-full "
                  src={user?.image?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"}
                  alt="logo"
                />
              </div>
              <div className="text-end  dark:text-white">
                <h1 className="font-semibold whitespace-nowrap">{user?.schoolName}</h1>
                <p className="text-sm">Address: {user?.address || "N/A"}   </p>
                <p className="text-sm">Contact: {user?.contact || "N/A"}</p>
              </div>
            </div>
            <div className="bg-gray-300 text-center  border-b-2 border-red-500 ">
              <h3 class="font-bold text-[9px] scale-125">Fee receipt :</h3>
            </div>
            <div className="flex justify-between text-[12px] dark:text-white">
              <div>
                <div className="text-[12px]">
                  Rec.No.: <strong>{modalData.feeReceiptNumber}</strong>
                </div>
                <div className="text-[12px]">
                  Name: <strong>{modalData.studentName}</strong>
                </div>
                <div className="text-[12px]">
                  Class: <strong> {modalData.studentClass}</strong>
                </div>
                <div className="text-[12px]">
                  S/D. of: <strong>......</strong>
                </div>
                {
                modalData.transactionId.length>4 &&  <div className="text-[12px]">
                checkBook/transactionId: <strong>{modalData.transactionId}</strong>
               </div>
                }
               
              </div>
              <div>
                <div className="text-[12px]">
                  Date: <strong>{date()}</strong>
                </div>
                <div className="text-[12px]">
                  Adm No: <strong>{modalData.admissionNumber}</strong>
                </div>
                <div className="text-[12px]">
                  Mode: <strong>{modalData.paymentMode}</strong>
                </div>
               
              </div>
            </div>
            {(modalData.regularFees.length > 0  || modalData.additionalFees.length > 0) ? (
              <table class="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th class="border border-gray-500 pl-2 text-[12px]">Name</th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Month
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Amount
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Dues
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Status{" "}
                    </th>
                  </tr>
                </thead>

                {modalData.regularFees.length > 0 && (
                  <tbody>
                    {modalData.regularFees.map((addFee) => (
                      <tr>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          MONTHLY FEE{" "}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.month}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.paidAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.dueAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
                {modalData.additionalFees.length > 0 && (
                  <tbody>
                    {modalData.additionalFees.map((addFee) => (
                      <tr>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.name}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.month}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.paidAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.dueAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            ) : (
              <h1 className="text-center">No Fee</h1>
            )}

            <div class="mt-1">
              <table class="w-full border border-gray-500 text-[12px]">
                <tbody>
                <tr>
                    <td class="border border-gray-500 pl-2">Total Fee Amount.</td>
                    <td class="border border-gray-500 pl-2"> ₹ {modalData.totalFeeAmount}</td>
                  </tr>
                 
                  <tr>
                    <td class="border border-gray-500 pl-2">Concession Amount </td>
                    <td class="border border-gray-500 pl-2"> ₹ {modalData.concessionFee}</td>
                  </tr>
                  
                  <tr>
                    <td class="border border-gray-500 pl-2">Paid Amount</td>
                    <td class="border border-gray-500 pl-2">
                    {/* ₹  {modalData.totalAmountPaid} */}
                    ₹  {modalData.newPaidAmount}
                    </td>
                  </tr>
                  <tr>
                    <td class="border border-gray-500 pl-2">Total Dues</td>
                    <td class="border border-gray-500 pl-2 text-red-600">
                    {/* ₹  {modalData.totalAmountPaid} */}
                    ₹  {modalData.totalDues}
                    </td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Paid Amount</td>
                    <td class="border border-gray-500 pl-2">
                      {modalData.totalAmountPaid}
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>

            <p class="mt-2 text-[12px]">{toWords(Repees()).toUpperCase()} ONLY</p>
            <p className="text-[9px]">
              {" "}
              Remarks:{" "}
              <strong className="">{modalData.remark}</strong>
            </p>
            <div class="flex justify-between text-[9px]">
              <div>Fee Collected: ................</div>
              <div>Authorised sign</div>
            </div>

            <div class=" text-[9px]">
              <p>Note:</p>
              <ol class="list-decimal ml-5">
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
          <div className="w-[400px] ps-[15px] rounded-sm dark:text-white">
            <div className="flex justify-between ">
              <div className=" h-auto w-[150px]  dark:text-white  ">
                <img
                  className="h-12 w-12 rounded-full "
                  src={user?.image?.url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTUW0u5Eiiy3oM6wcpeEE6sXCzlh8G-tX1_Iw&s"}
                  alt="logo"
                />
              </div>
              <div className="text-end  dark:text-white">
                <h1 className="font-semibold whitespace-nowrap">{user?.schoolName}</h1>
                <p className="text-sm">Address: {user?.address || "N/A"}   </p>
                <p className="text-sm">Contact: {user?.contact || "N/A"}</p>
              </div>
            </div>
            <div className="bg-gray-300 text-center  border-b-2 border-red-500 ">
              <h3 class="font-bold text-[9px] scale-125">Fee receipt :</h3>
            </div>
            <div className="flex justify-between text-[12px] dark:text-white">
              <div>
                <div className="text-[12px]">
                  Rec.No.: <strong>{modalData.feeReceiptNumber}</strong>
                </div>
                <div className="text-[12px]">
                  Name: <strong>{modalData.studentName}</strong>
                </div>
                <div className="text-[12px]">
                  Class: <strong> {modalData.studentClass}</strong>
                </div>
                <div className="text-[12px]">
                  S/D. of: <strong>......</strong>
                </div>
                {
                modalData.transactionId.length>4 &&  <div className="text-[12px]">
                checkBook/transactionId: <strong>{modalData.transactionId}</strong>
               </div>
                }
               
              </div>
              <div>
                <div className="text-[12px]">
                  Date: <strong>{date()}</strong>
                </div>
                <div className="text-[12px]">
                  Adm No: <strong>{modalData.admissionNumber}</strong>
                </div>
                <div className="text-[12px]">
                  Mode: <strong>{modalData.paymentMode}</strong>
                </div>
               
              </div>
            </div>
            {(modalData.regularFees.length > 0  || modalData.additionalFees.length > 0) ? (
              <table class="min-w-full leading-normal">
                <thead>
                  <tr>
                    <th class="border border-gray-500 pl-2 text-[12px]">Name</th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Month
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Amount
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Dues
                    </th>
                    <th class="border border-gray-500 pl-2 text-[12px]">
                      {" "}
                      Status{" "}
                    </th>
                  </tr>
                </thead>

                {modalData.regularFees.length > 0 && (
                  <tbody>
                    {modalData.regularFees.map((addFee) => (
                      <tr>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          MONTHLY FEE{" "}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.month}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.paidAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.dueAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
                {modalData.additionalFees.length > 0 && (
                  <tbody>
                    {modalData.additionalFees.map((addFee) => (
                      <tr>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.name}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.month}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {" "}
                          {addFee.paidAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.dueAmount}
                        </td>
                        <td class="border border-gray-500 pl-2 text-[12px]">
                          {addFee.status}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                )}
              </table>
            ) : (
              <h1 className="text-center">No Fee</h1>
            )}

            <div class="mt-1">
              <table class="w-full border border-gray-500 text-[12px]">
                <tbody>
                <tr>
                    <td class="border border-gray-500 pl-2">Total Fee Amount.</td>
                    <td class="border border-gray-500 pl-2"> ₹ {modalData.totalFeeAmount}</td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">
                     
                      Late Fine
                      </td>
                    <td class="border border-gray-500 pl-2">
                    ₹ {modalData.previousDues}
                    </td>
                  </tr> */}
                 
                  <tr>
                    <td class="border border-gray-500 pl-2">Concession Amount </td>
                    <td class="border border-gray-500 pl-2"> ₹ {modalData.concessionFee}</td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Total fee after Concession.</td>
                    <td class="border border-gray-500 pl-2">₹  {modalData.paidAfterConcession}</td>
                  </tr> */}
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Total Fee Amount.</td>
                    <td class="border border-gray-500 pl-2">{modalData.totalFeeAmount}</td>
                  </tr> */}
                  
                  <tr>
                    <td class="border border-gray-500 pl-2">Paid Amount</td>
                    <td class="border border-gray-500 pl-2">
                    {/* ₹  {modalData.totalAmountPaid} */}
                    ₹  {modalData.newPaidAmount}
                    </td>
                  </tr>
                  <tr>
                    <td class="border border-gray-500 pl-2">Total Dues</td>
                    <td class="border border-gray-500 pl-2 text-red-600">
                    {/* ₹  {modalData.totalAmountPaid} */}
                    ₹  {modalData.totalDues}
                    </td>
                  </tr>
                  {/* <tr>
                    <td class="border border-gray-500 pl-2">Paid Amount</td>
                    <td class="border border-gray-500 pl-2">
                      {modalData.totalAmountPaid}
                    </td>
                  </tr> */}
                </tbody>
              </table>
            </div>

            <p class="mt-2 text-[12px]">{toWords(Repees()).toUpperCase()} ONLY</p>
            <p className="text-[9px]">
              {" "}
              Remarks:{" "}
              <strong className="">{modalData.remark}</strong>
            </p>
            <div class="flex justify-between text-[9px]">
              <div>Fee Collected: ................</div>
              <div>Authorised sign</div>
            </div>

            <div class=" text-[9px]">
              <p>Note:</p>
              <ol class="list-decimal ml-5">
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
        </div>
     
    </div>
  );
};

export default FeeRecipt;

