import axios from "axios";
import React, { useEffect, useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import FeeRecipt from "./FeeRecipt";
import NoDataFound from "../../NoDataFound";
import { format, parseISO } from "date-fns";
import { Button } from "@mui/material";
import { FaEye } from "react-icons/fa";
import FeeReceiptPDF from './FeeReceiptPDF';
import PrintHandler from "../Admission/PrintHandler";
import { FaShareAlt } from "react-icons/fa";

import { cancelFeePayment } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import Modal from "../../Dynamic/Modal";
const Table = ({ reLoad }) => {
  const user = JSON.parse(localStorage.getItem("user"))
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [modalData, setModalData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [feeHistory, setFeeHistory] = useState([]);
  const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const [cancel,setCencel]=useState(false)
  
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(getCurrentDate());
 
  const toggleModal = () => setIsOpen(!isOpen);
  const [cancelData,setCancelData]=useState({})
  // console.log("first cancelData",cancelData)
  const handleOpenModal = (rowData) => {
    setModalData(rowData);
    setIsOpen(true);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of items per page

  useEffect(() => {
    getFeeHistory();
  }, [reLoad]);

  const getFeeHistory = async () => {
    try {
      const response = await axios.get(
        // "https://dvsserver.onrender.com/api/v1/fees/getFeeStatus",
        "https://dvsserver.onrender.com/api/v1/fees/feeHistory",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setFeeHistory(response.data.data);
      setFilteredFeeHistory(response.data.data);
    } catch (error) {
      console.error("Error fetching fee history:", error);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const handleDateFilter = () => {
    const filteredData = feeHistory.filter((fee) => {
      const feeDate = new Date(fee.date);
      return feeDate >= new Date(startDate) && feeDate <= new Date(endDate);
    });
    setFilteredFeeHistory(filteredData);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate(getCurrentDate());
    setFilteredFeeHistory(feeHistory);
  };

  const { handlePrint } = PrintHandler(); // Use the hook
  const handlePrintClick = (filteredFeeHistory) => {
    // setSelectStudent(filteredFeeHistory);
    setTimeout(() => {
      // Call the reusable handlePrint function and pass the content
      handlePrint(document.getElementById("printContent").innerHTML);
    }, 100);
  };
  // const phoneNumbers = [
  //   "7905710965", "7079771102", "9525678043", "9507386757", "9873993957", "8920377548","9795769820",,"9026631059" // ... up to 50 numbers
  // ];

  // const shareOnWhatsAppBatched = (fee, phoneNumbers, batchSize = 5, delaySeconds = 30) => {
  //   const receiptCard = `
  // ------------------------------------
  // ✨ Fee Receipt ✨
  // ------------------------------------
  // Admission No: ${fee.admissionNumber}
  // Name: ${fee.studentName}
  // Class: ${fee.studentClass}
  // Receipt No: ${fee.feeReceiptNumber}
  // Pay Date: ${format(parseISO(fee.date), "dd/MM/yyyy")}
  // Total Amount Paid: ${fee.totalAmountPaid}
  // Dues: ${fee.dues}
  // Remarks: ${fee.remark}
  // ------------------------------------
  // Thank you!
  // ------------------------------------
  // `;
  
  //   const message = `Check out this fee receipt:\n\n${receiptCard}`;
  //   const encodedMessage = encodeURIComponent(message);
  
  //   const sendBatch = (batch) => {
  //     batch.forEach(phoneNumber => {
  //       const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
  //       window.open(whatsappURL, "_blank");
  //     });
  //   };
  
  //   const batchCount = Math.ceil(phoneNumbers.length / batchSize);
  
  //   const sendWithDelay = async () => {
  //     for (let i = 0; i < batchCount; i++) {
  //       const start = i * batchSize;
  //       const end = start + batchSize;
  //       const batch = phoneNumbers.slice(start, end);
  
  //       sendBatch(batch); // Send current batch
  //       if (i < batchCount - 1) {
  //           await new Promise(resolve => setTimeout(resolve, delaySeconds * 1000)); // Wait before next batch
  //       }
  //     }
  //   };
  
  //   sendWithDelay(); // Start the process
  // };
  const shareOnWhatsApp = (fee) => { // Add phoneNumber as an argument
    // Build the "card" as a string (styled with bold and monospace)
    const receiptCard = `
  ------------------------------------
      ✨ *Fee Receipt* ✨
  ------------------------------------
  *Admission No:* \`${fee.admissionNumber}\`
  *Name:* \`${fee.studentName}\`
  *Class:* \`${fee.studentClass}\`
  *Receipt No:* \`${fee.feeReceiptNumber}\`
  *Pay Date:* \`${format(parseISO(fee.date), "dd/MM/yyyy")}\`
  *Total Amount Paid:* \`₹${fee.totalAmountPaid}\`
  *Month:* \`${fee.regularFees?.map((val)=>val?.month)}\`
  *Dues:* \`₹${fee.dues}\`
  *Remarks:* _${fee.remark || 'N/A'}_
  ------------------------------------
              *Thank you!* 🙏
 If there are any issues, please contact the accountant.
  ------------------------------------
  `;
  
    const message = `*${user?.schoolName}*\n${user?.address}\n${"+91 XXXXXXXXXX"}\n${receiptCard}`; // Add intro text
  
    const encodedMessage = encodeURIComponent(message);
  
    // Construct the WhatsApp URL to open a chat with the specified number
    const whatsappURL = `https://wa.me/${fee?.parentContact}?text=${encodedMessage}`;
  
    window.open(whatsappURL, "_blank");
  };
  
  const cancelFee=async()=>{
    const payload={
      "studentId": cancelData?.studentId,
      "feeReceiptNumber": cancelData?.feeReceiptNumber
    }
try {
  const response =await cancelFeePayment(payload)
  if(response?.success){
    setCencel(false)
    toast.success(response?.message)
  }
  else{
    toast.error(response?.message)
  }
} catch (error) {
  console.log("error",error)
}
  }

  const handleCancel=(val)=>{
    // console.log("first valvalvalval",val)
    setCancelData(val)
    setCencel(true)

  }
  return (
    <div className="md:min-h-screen">
      <div className="flex items-center gap-5 mb-5 flex-wrap">
         <ReactInput
                      type="date"
                      name="studentDateOfBirth"
                      // required={true}
                      label="Start Date"
                      onChange={(e) => setStartDate(e.target.value)}
                      value={startDate}
                      />
         <ReactInput
                      type="date"
                      name="studentDateOfBirth"
                      // required={true}
                      label="End Date"
                      onChange={(e) => setEndDate(e.target.value)}
                      value={endDate}
                      />
       
            <Button
              onClick={handleDateFilter}
              variant="contained"
              style={{ backgroundColor: currentColor, color: "white" }}
             
            >
              Filter
            </Button>
         
            <Button
              variant="contained"

              onClick={clearDateFilter}
              style={{ backgroundColor: "#424242", color: "white" }}
             
            >
              Clear
            </Button>
            <div id="printContent">
          <FeeReceiptPDF details={filteredFeeHistory} />
        </div>
         
      </div>
     
      
      {feeHistory.length > 0 ? (
        <div className="relative  md:max-h-screen overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
            <thead
            style={{background:currentColor, color:"white",whiteSpace:"nowrap"}}
            className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="px-6 py-3">
                  S No.
                </th>
                <th scope="col" className="px-6 py-3">
                  Adm No.
                </th>
                <th scope="col" className="px-6 py-3">
                  Name
                </th>
                <th scope="col" className="px-6 py-3">
                  Class
                </th>
                <th scope="col" className="px-6 py-3">
                  Receipt No.
                </th>

                <th scope="col" className="px-6 py-3">
                  Regular Fee
                </th>

                <th scope="col" className="px-2 py-3">
                  Pay Date
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Remarks
                </th> */}

                <th scope="col" className="px-6 py-3">
                  Dues
                </th>
                <th scope="col" className="px-6 py-3">
                  Paid
                </th>
                {/* <th scope="col" className="px-6 py-3">
                  Status
                </th> */}

                <th scope="col" className="px-1 py-3">
                  Action
                </th>
                 <th scope="col" className="px-1 py-3" >
                 
                  Share
                </th>
                 <th scope="col" className="px-1 py-3" >
                 
                  Cancel Fee
                </th>
              </tr>
            </thead>
            <tbody>
              {/* {console.log("filteredFeeHistory",filteredFeeHistory)} */}
              {filteredFeeHistory
                ? filteredFeeHistory.slice(indexOfFirstItem, indexOfLastItem).map((fees, index) => (
                    <tr className={`${fees.status=="canceled"? "bg-[#a53c3c66] ":""}border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`}
                    style={{color:"black"}}
                    >
                      <td className="px-6 py-4 text-bold">
                        {index + 1 + (currentPage - 1) * itemsPerPage}
                      </td>
                      <td className="px-6 py-4">{fees.admissionNumber}</td>
                      <td className="px-6 py-4">{fees.studentName}</td>
                      <td className="px-6 py-4">{fees.studentClass}</td>
                      <td className="px-6 py-4">{fees.feeReceiptNumber}</td>

                      <td className="px-2">
                        <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                          <div class="inline-block min-w-full  rounded-lg overflow-hidden">
                            {fees.regularFees.length > 0 ||
                            fees.additionalFees.length > 0 ? (
                              <table class="min-w-full leading-normal">
                                <thead>
                                  <tr>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Name
                                    </th>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Month
                                    </th>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Amount
                                    </th>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Dues
                                    </th>
                                    <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                                      Status
                                    </th>
                                    {/* <th class="p-1  border-b-2 border-gray-200 bg-gray-50"></th> */}
                                  </tr>
                                </thead>
                                <tbody>
                                  {fees.regularFees &&
                                    fees.regularFees.map((addFee) => (
                                      <tr>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <p class="text-gray-900 whitespace-no-wrap whitespace-nowrap ">
                                            Class Fee
                                          </p>
                                        </td>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <p class="text-gray-900 whitespace-no-wrap">
                                            {addFee.month}
                                          </p>
                                        </td>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <p class="text-gray-900 whitespace-no-wrap">
                                            {addFee.paidAmount}
                                          </p>
                                        </td>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <p class="text-gray-900 whitespace-no-wrap">
                                            {addFee.dueAmount}
                                          </p>
                                        </td>
                                        <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                          <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                            <span
                                              aria-hidden
                                              class="absolute inset-0  opacity-50 rounded-full"
                                            ></span>
                                            <span
                                              class={`${
                                                addFee.status === "Paid"
                                                  ? "text-green-600"
                                                  : "text-red-600"
                                              }`}
                                            >
                                              {addFee.status}
                                            </span>
                                          </span>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                                <tbody>
                                  {fees.additionalFees.map((addFee, index) => (
                                    <tr key={index}>
                                      <td class="px-1  border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                          {addFee.name}
                                        </p>
                                      </td>
                                      <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                          {addFee.month}
                                        </p>
                                      </td>
                                      <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                          {addFee.paidAmount}
                                        </p>
                                      </td>
                                      <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                        <p class="text-gray-900 whitespace-no-wrap">
                                          {addFee.dueAmount}
                                        </p>
                                      </td>
                                      <td class="px-1 border-b border-gray-200 bg-white text-sm">
                                        <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                          <span
                                            aria-hidden
                                            class="absolute inset-0  opacity-50 rounded-full"
                                          ></span>
                                          <span
                                            class={`${
                                              addFee.status === "Paid"
                                                ? "text-green-600"
                                                : "text-red-600"
                                            }`}
                                          >
                                            {addFee.status}
                                          </span>
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <h1 className="text-center">No Fee</h1>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-2 py-4">
                        {format(parseISO(fees.date), "dd/MM/yyyy")}
                      </td>
                      {/* <td className="px-6 py-4">
                        <p className="max-w-[150px] break-words">
                          {fees.remark}
                        </p>
                      </td> */}
                      <td className="px-6 py-4">{fees.dues}</td>
                      <td className="px-6 py-4">{fees.totalAmountPaid}</td>
                      {/* <td className="px-6 py-4 ">{fees.status}</td> */}
                      <td className="px-4 py-4 ">
                        <a
                          onClick={() => handleOpenModal(fees)}
                          className="font-bold text-green-700 flex align-middle  cursor-pointer hover:underline mr-2"
                        >
                         <span >
                         <FaEye className="text-2xl"/>
                         </span>
                        </a>
                      </td>
                      <td className="px-4 py-4">
                         <button
                         title="Share"
                            // onClick={() => shareOnWhatsAppBatched(fees, phoneNumbers, 5, 30)}
                            onClick={() => shareOnWhatsApp(fees)}
                            className="font-medium text-green-600 cursor-pointer dark:text-green-500 hover:underline"
                         >
                         
                         <FaShareAlt className="text-2xl"/>
                         </button>
                       
                      </td>
                      <td className="px-4 py-4">
                         <button
                         title="Cancel"
                            // onClick={() => setCencel(true)}
                            onClick={() => handleCancel(fees)}
                            className=" text-red-600 font-bold cursor-pointer dark:text-green-500 hover:underline"
                         >
                         Cancel
                         {/* <FaShareAlt className="text-2xl"/> */}
                         </button>
                      </td>
                    </tr>
                  ))
                : ""}
            </tbody>
          </table>
           




          <Modal
        setIsOpen={toggleModal}
        // setIsOpen={() => setViewAdmision(false)}
        isOpen={isOpen} title={"Addmission details pdf"} maxWidth="100px">
 <FeeRecipt
                      modalData={modalData}
                      handleCloseModal={toggleModal}
                    />
      </Modal>


          <Modal  
          setIsOpen={() => setCencel(false)} 
          isOpen={cancel} title={"Cancel Fees"} maxWidth="100px">
         <div className="p-4">
          
         <p className="text-red-700">
          "Do you want to cancel the fees?"
          </p>
           <div className="w-full flex justify-around">
           <Button
                    variant="contained"
                    // style={{ backgroundColor: currentColor }}
                    onClick={() => cancelFee()}
                  >
                  OK
                  </Button>
           <Button
           style={{background:"gray"}}
                    variant="contained"
                    // style={{ backgroundColor: currentColor }}
                    onClick={() => setCencel(false)}
                  >
                   Cancel
                  </Button>
       
           </div>
         </div>
            </Modal> 
        </div>
      ) : (
        <NoDataFound />
      )}
    </div>
  );
};

export default Table;
