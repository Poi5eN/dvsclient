import React, { useEffect, useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import FeeRecipt from "./FeeRecipt";
import NoDataFound from "../../NoDataFound";
import { format, parseISO } from "date-fns";
import { FaEye } from "react-icons/fa";
import FeeReceiptPDF from './FeeReceiptPDF';
import PrintHandler from "../Admission/PrintHandler";
import { FaShareAlt } from "react-icons/fa";

import { cancelFeePayment, feesfeeHistory } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import Modal from "../../Dynamic/Modal";
import Button from "../../Dynamic/utils/Button";
import moment from "moment";
import { FeeReceipt } from "../../Dynamic/utils/Message";
import generatePdf from "../../Dynamic/utils/pdfGenerator";
import { FaPrint, FaFileAlt } from "react-icons/fa"; 
const Table = ({ reLoad }) => {
  const user = JSON.parse(localStorage.getItem("user"))
  // console.log("user",user)
  const { currentColor,setIsLoader } = useStateContext();
  const [modalData, setModalData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [feeHistory, setFeeHistory] = useState([]);
  const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };
  const [cancel,setCencel]=useState(false)
  const [feeDetais,setFeeDetails]=useState([])
  const [startDate, setStartDate] = useState(getCurrentDate());
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
    setIsLoader(true)
    try {
      const response =await feesfeeHistory()
      if(response?.success){
        setFeeHistory(response?.data);
        setFilteredFeeHistory(response?.data);
        setIsLoader(false)
      }
      else{
        setIsLoader(false)
        toast?.error(response?.message)
      }
     
    } catch (error) {
      console.error("Error fetching fee history:", error);
    }
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const handleDateFilter = () => {
    const filteredData = feeHistory.filter((fee) => {
      const feeDate = moment(fee.date).format("DD-MM-YYYY");
      return feeDate >= moment(startDate).format("DD-MM-YYYY") && feeDate <= moment(endDate).format("DD-MM-YYYY");
    });

    setFilteredFeeHistory(filteredData);
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate(getCurrentDate());
    setFilteredFeeHistory(feeHistory);
  };

  // const { handlePrint } = PrintHandler(); // Use the hook
  // const handlePrintClick = (filteredFeeHistory) => {
  //   // setSelectStudent(filteredFeeHistory);
  //   setTimeout(() => {
  //     // Call the reusable handlePrint function and pass the content
  //     handlePrint(document.getElementById("printContent").innerHTML);
  //   }, 100);
  // };
 
  
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


    const columns = [
      { header: 'Rcpt No.', dataKey: 'feeReceiptNumber' },
      { header: 'Date', dataKey: 'date' },
      { header: 'Admission No.', dataKey: 'admissionNumber' },
      { header: 'Student', dataKey: 'studentName' },
      { header: 'Father Name', dataKey: 'fatherName' },
      { header: 'Class', dataKey: 'studentClass' },
      { header: 'Mode', dataKey: 'paymentMode' },
      { header: 'TID', dataKey: 'transactionId' },
      { header: 'Month', dataKey: 'month' },
      { header: 'Dues', dataKey: 'dues' },
      { header: 'Fee', dataKey: 'totalFeeAmount' },
      { header: 'Paid ', dataKey: 'totalAmountPaid' },
      { header: 'Status', dataKey: 'feeStatus' },
      // { header: 'Remark', dataKey: 'remark' },
    ];
    
useEffect(() => {
  if (Array.isArray(feeHistory)) {
    const updatedFeeHistory = filteredFeeHistory.map(item => ({
      ...item,
      month: item?.regularFees?.map(val => val?.month).join(', ') || '',
      feeStatus: item?.regularFees?.map(val => val?.status).join(', ') || ''

    }));
    setFeeDetails(updatedFeeHistory);
  }
}, [filteredFeeHistory]);
// useEffect(() => {
//   if (Array.isArray(feeHistory)) {
//     const updatedFeeHistory = feeHistory.map(item => ({
//       ...item,
//       month: item?.regularFees?.map(val => val?.month).join(', ') || '',
//       feeStatus: item?.regularFees?.map(val => val?.status).join(', ') || ''

//     }));
//     setFeeDetails(updatedFeeHistory);
//   }
// }, [feeHistory]);

const totalPaidAmountFromParent=filteredFeeHistory.reduce((sum,item)=>(
  sum+item.totalAmountPaid
),0);
const dues=filteredFeeHistory.reduce((sum,item)=>(
  sum+item.dues
),0);

    const handleDownloadPdf = () => {
    
      generatePdf(feeDetais,columns,totalPaidAmountFromParent,dues,'user-report.pdf'); // generatePdf ko call karein
      // generatePdf(tableData,'user-report.pdf'); // generatePdf ko call karein
    };
  

  return (
    <div className="md:min-h-screen mt-4">
      <div className="flex items-center gap-2 mb-2 flex-wrap">
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
              name="Filter"
             
            >
              
            </Button>
         
            <Button

  name="Clear"
              onClick={clearDateFilter} >
              
            </Button>
            <Button
 color="teal"
  name="PRINT"
   Icon={<FaFileAlt />}
              onClick={handleDownloadPdf} >
              
            </Button>
            <div
            //  id="printContent"
             >
          {/* <FeeReceiptPDF details={filteredFeeHistory} /> */}
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
                         <Button
                         name="Share"
                         color="green"
                            // onClick={() => shareOnWhatsAppBatched(fees, phoneNumbers, 5, 30)}
                            onClick={() => FeeReceipt(fees)}
                            // className="font-medium text-green-600 cursor-pointer dark:text-green-500 hover:underline"
                         >
                         
                         <FaShareAlt className="text-2xl"/>
                         </Button>
                       
                      </td>
                      <td className="px-4 py-4">
                         <Button
                         name="Cancel"
                              // onClick={() => setCencel(true)}
                            onClick={() => handleCancel(fees)}
                            className=" text-red-600 font-bold cursor-pointer dark:text-green-500 hover:underline"
                         >
                         
                        
                         </Button>
                      </td>
                    </tr>
                  ))
                : ""}
            </tbody>
          </table>
           
          <Modal
        setIsOpen={toggleModal}
        isOpen={isOpen} 
        title={"Addmission details pdf"} maxWidth="100px">
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
           name="Yes"
            onClick={() => cancelFee()}
                  >
                
                  </Button>
           <Button
           name="No"

                    onClick={() => setCencel(false)}
                  >
                   
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
