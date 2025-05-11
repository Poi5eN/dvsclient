import React, { useEffect, useState, useCallback } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import FeeRecipt from "./FeeRecipt";
import NoDataFound from "../../NoDataFound";
import { format, parseISO } from "date-fns";
import { FaEye, FaPrint, FaFileAlt, FaShareAlt } from "react-icons/fa";
import { cancelFeePayment, feesfeeHistory } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import Modal from "../../Dynamic/Modal";
import Button from "../../Dynamic/utils/Button";
import moment from "moment";
import { FeeReceipt } from "../../Dynamic/utils/Message";
import generatePdf from "../../Dynamic/utils/pdfGenerator";
import axios from "axios";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";

const Table = ({ reLoad }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const { currentColor, setIsLoader } = useStateContext();
  const [modalData, setModalData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [feeHistory, setFeeHistory] = useState([]);
  const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
  const [unifiedFeeHistory, setUnifiedFeeHistory] = useState([]);
  const [filteredUnifiedFeeHistory, setFilteredUnifiedFeeHistory] = useState(
    []
  );
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const authToken = localStorage.getItem("token");
  const [activeTab, setActiveTab] = useState("single");
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [session, setSession] = useState(user?.session || "");

  // Date filter state
  const getCurrentDate = useCallback(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  }, []);

  const [cancel, setCancel] = useState(false);
  // const [feeDetails, setFeeDetails] = useState([]); // Unused state
  // const [unifiedFeeDetails, setUnifiedFeeDetails] = useState([]); // Unused state
  const [startDate, setStartDate] = useState(getCurrentDate());
  const [endDate, setEndDate] = useState(getCurrentDate());
  const [cancelData, setCancelData] = useState({});

  // Payment Mode Filter
  const [paymentModeFilter, setPaymentModeFilter] = useState("");
  const paymentModeOptions = [
    { value: "", label: "All Modes" },
    { value: "cash", label: "Cash" },
    { value: "online", label: "Online" },
    { value: "cheque", label: "Cheque" },
    { value: "card", label: "Card" },
    // { value: "other", label: "Other" }, // Add if 'other' is a filterable mode
  ];

  // Modal toggles
  const toggleModal = () => setIsOpen(!isOpen);
  // const toggleReceiptModal = () => setReceiptModalOpen(!receiptModalOpen); // Original, replaced by handleCloseReceiptModal

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Fetch data on reload or session change
  useEffect(() => {
    // getFeeHistory(); // This was commented out, implying single receipts are loaded on demand
    getUnifiedFeeHistory();
  }, [reLoad, session]); // getUnifiedFeeHistory doesn't take session, but session change implies potential re-fetch

  const getFeeHistory = async (pStartDate, pEndDate, pSession) => {
    setIsLoader(true);
    try {
      const response = await feesfeeHistory(pStartDate, pEndDate, pSession);
      if (response?.success) {
        const singleReceipts = response?.data.filter((fee) => !fee.isUnified);
        setFeeHistory(singleReceipts);
        // setFilteredFeeHistory(singleReceipts); // Filtering will be handled by the central useEffect
      } else {
        toast.error(response?.message || "Failed to fetch single receipts");
        setFeeHistory([]); // Clear on error
      }
    } catch (error) {
      console.error("Error fetching single receipts:", error);
      toast.error("Error fetching single receipts: " + error.message);
      setFeeHistory([]); // Clear on error
    } finally {
      setIsLoader(false);
    }
  };

  const getUnifiedFeeHistory = async () => {
    // setIsLoader(true); // Consider enabling if it's a long operation
    try {
      const response = await axios.get(
        `https://dvsserver.onrender.com/api/v1/fees/unified-receipts?session=${session}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
          withCredentials: true,
        }
      );
      if (response.data.success) {
        setUnifiedFeeHistory(response.data.data);
        // setFilteredUnifiedFeeHistory(response.data.data); // Filtering will be handled by the central useEffect
      } else {
        toast.error(
          response.data.message || "Failed to fetch unified receipts"
        );
        setUnifiedFeeHistory([]); // Clear on error
      }
    } catch (error) {
      console.error("Error fetching unified receipts:", error);
      toast.error("Error fetching unified receipts: " + error.message);
      setUnifiedFeeHistory([]); // Clear on error
    } finally {
      // setIsLoader(false);
    }
  };

  // Central useEffect for all filtering
  useEffect(() => {
    // Filter single fee history (already date-filtered by API if handleDateFilter was called)
    let tempFilteredSingle = feeHistory;
    if (paymentModeFilter) {
      tempFilteredSingle = tempFilteredSingle.filter(
        (item) => item.paymentMode?.toLowerCase() === paymentModeFilter.toLowerCase()
      );
    }
    setFilteredFeeHistory(tempFilteredSingle);

    // Filter unified fee history (client-side for date and payment mode)
    let tempFilteredUnified = unifiedFeeHistory;

    // Date filtering for unified
    if (startDate && endDate) {
      const filterStartDateMoment = moment(startDate).startOf('day');
      const filterEndDateMoment = moment(endDate).endOf('day');
      tempFilteredUnified = tempFilteredUnified.filter(item => {
          if (!item.date) return false;
          const itemDateMoment = moment(item.date).startOf('day');
          return itemDateMoment.isSameOrAfter(filterStartDateMoment) && itemDateMoment.isSameOrBefore(filterEndDateMoment);
      });
    }

    // Payment mode filter for unified
    if (paymentModeFilter) {
      tempFilteredUnified = tempFilteredUnified.filter(
        (item) => item.paymentMode?.toLowerCase() === paymentModeFilter.toLowerCase()
      );
    }
    setFilteredUnifiedFeeHistory(tempFilteredUnified);
    setCurrentPage(1); // Reset to first page on any filter change
  }, [feeHistory, unifiedFeeHistory, startDate, endDate, paymentModeFilter, session]);


  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Date filtering
  const handleDateFilter = () => {
    // getFeeHistory is called with current startDate, endDate, and session
    getFeeHistory(startDate, endDate, session);
    // The central useEffect will then handle paymentModeFilter and update unifiedFeeHistory as well
  };
 
  const clearDateFilter = () => {
    setStartDate(getCurrentDate());
    setEndDate(getCurrentDate());
    setPaymentModeFilter(""); // Reset payment mode filter

    setFeeHistory([]); // As per original logic, this clears the single receipts table
    // setFilteredFeeHistory([]); // Explicitly set, or let useEffect handle it from feeHistory=[]

    // For unified, it will be filtered by useEffect based on reset dates (today) and no payment mode
    // No need to setFilteredUnifiedFeeHistory(unifiedFeeHistory) here, as useEffect will manage it.
    setCurrentPage(1);
  };

  // Cancel fee logic
  const cancelFee = async () => {
    setIsLoader(true);
    const payload = {
      studentId: cancelData?.studentId,
      feeReceiptNumber:
        cancelData?.feeReceiptNumber || cancelData?.unifiedReceiptNumber,
    };
    try {
      const response = await cancelFeePayment(payload);
      if (response?.success) {
        setCancel(false);
        toast.success(response?.message);
        // Re-fetch data to reflect cancellation
        if (activeTab === "single" && startDate && endDate) {
            getFeeHistory(startDate, endDate, session); // Re-fetch current view for single
        } else {
            getFeeHistory(null, null, session); // Or re-fetch all if no specific date filter active
        }
        getUnifiedFeeHistory(); // Always re-fetch unified
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error cancelling fee:", error);
      toast.error("Error cancelling fee: " + error.message);
    } finally {
        setIsLoader(false);
    }
  };

  const handleCancel = (val) => {
    setCancelData(val);
    setCancel(true);
  };

  // Fetch and display receipt
  const handleViewReceipt = async (fees) => {
    setIsLoader(true);
    try {
      const receiptNumber = fees.feeReceiptNumber || fees.unifiedReceiptNumber;
      const response = await axios.get(
        `https://dvsserver.onrender.com/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.data.success) {
        setReceiptData(response.data);
        setIsPreviewReady(true);
        setReceiptModalOpen(true);
      } else {
        toast.error("Failed to fetch receipt data.");
        setIsPreviewReady(false);
      }
    } catch (error) { // Corrected line: removed underscore
      console.error("Error fetching receipt:", error);
      toast.error("Error fetching receipt data: " + error.message);
      setIsPreviewReady(false);
    } finally {
        setIsLoader(false);
    }
  };
  // Handle receipt modal close
  const handleCloseReceiptModal = () => {
    setReceiptModalOpen(false);
    setReceiptData(null);
    setIsPreviewReady(false);
  };

  const totalsByMode = (data) => {
    return data.reduce(
      (accumulator, item) => {
        const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
        const mode = item?.paymentMode?.toLowerCase() || "other";
        switch (mode) {
          case "cash":
            accumulator.cash += amountPaid;
            break;
          case "online":
            accumulator.online += amountPaid;
            break;
          case "cheque":
            accumulator.cheque += amountPaid;
            break;
          case "card":
            accumulator.card += amountPaid;
            break;
          default:
            accumulator.other += amountPaid; // Includes "other" and any null/undefined modes
            break;
        }
        return accumulator;
      },
      { cash: 0, online: 0, cheque: 0, card: 0, other: 0 }
    );
  };

  const overallTotalPaid = (data) => {
    return data.reduce((sum, item) => {
      const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
      return sum + amountPaid;
    }, 0);
  };

  const overallTotalDuesSum = (data) => {
    return data.reduce((sum, item) => {
      const duesValue = parseFloat(item?.totalDues) || 0;
      return sum + duesValue;
    }, 0);
  };

  const currentFilteredData = activeTab === "single" ? filteredFeeHistory : filteredUnifiedFeeHistory;
  const currentTotals = totalsByMode(currentFilteredData);

  // Download report as PDF
    const handleDownloadPdf = () => {
      const dataToExport = activeTab === "single" 
        ? filteredFeeHistory.map((val) => ({
            ...val,
            date: val.date ? format(parseISO(val.date), "dd/MM/yyyy") : "N/A",
            month: val.regularFees?.map((item) => item.month).join('\n') || 'N/A',
            feeStatus: val.regularFees?.map((item) => item.status).join('\n') || 'N/A'
          }))
        : filteredUnifiedFeeHistory.map(val => ({
            ...val,
            date: val.date ? format(parseISO(val.date), "dd/MM/yyyy") : "N/A",
            // Unified receipts might not have `regularFees` in the same structure for month/status breakdown. Adjust if necessary.
            // Assuming unified receipts directly provide relevant info or it's handled by generic keys.
            // For simplicity, if unified structure is different, these month/feeStatus might be N/A or need specific mapping.
            month: val.students?.map(s => s.admissionNumber).join(', ') || 'N/A', // Placeholder for unified month if applicable
            feeStatus: val.status || 'N/A' // General status for unified
        }));
      
      const columns = [
        {
          header: "Rcpt.No.",
          dataKey:
            activeTab === "single" ? "feeReceiptNumber" : "unifiedReceiptNumber",
        },
        { header: "Date", dataKey: "date" },
        { header: "Admission No.", dataKey: "admissionNumber" },
        { header: "Student", dataKey: "studentName" },
        {
          header: "Parent Name",
          dataKey: activeTab === "single" ? "fatherName" : "parentName",
        },
        { header: "Class", dataKey: "studentClass" },
        { header: "Mode", dataKey: "paymentMode" },
        { header: "TID", dataKey: "transactionId" },
        { header: "Month", dataKey: "month" }, // Changed header for clarity
        { header: "Fee Amount", dataKey: "totalFeeAmount" },
       
        { header: "Paid", dataKey: "totalAmountPaid" },
        { header: "Dues", dataKey: "totalDues" },
        { header: "Status", dataKey: "feeStatus" }, // Changed header for clarity
      ];
const  filename="Student Fee Receipt Details"
      generatePdf(
        dataToExport,
        columns,
        overallTotalPaid(currentFilteredData),
        overallTotalDuesSum(currentFilteredData),
        currentTotals.cash,
        currentTotals.online,
        currentTotals.cheque,
        currentTotals.card,
        activeTab === "single" ? "single-receipts-report.pdf" : "unified-receipts-report.pdf",
        filename
      );
    };

  // Render table for single or unified receipts
  const renderTable = (data, isUnified = false) => (
    <div className="relative md:max-h-screen overflow-x-auto shadow-md sm:rounded-lg mt-4">
      {
        data?.length>0 ?
        <table className="w-full border text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
        <thead
          style={{
            background: currentColor,
            color: "white",
            whiteSpace: "nowrap",
          }}
          className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
        >
          <tr>
            <th scope="col" className="px-1 py-1">S No.</th>
            <th scope="col" className="px-1 py-1">Adm No.</th>
            <th scope="col" className="px-1 py-1">Name</th>
            <th scope="col" className="px-1 py-1">Parent Name</th>
            <th scope="col" className="px-1 py-1">Class</th>
            <th scope="col" className="px-1 py-1">Receipt No.</th>
            <th scope="col" className="px-1 py-1">Pay Date</th>
           
            <th scope="col" className="px-1 py-1">Fee Amount</th>
            <th scope="col" className="px-1 py-1">Paid</th>
            <th scope="col" className="px-1 py-1">Mode</th>
            <th scope="col" className="px-1 py-1">Concession</th>
            <th scope="col" className="px-1 py-1">Dues</th>
            <th scope="col" className="px-1 py-1">Status</th>
            <th scope="col" className="px-1 py-1">Action</th>
            <th scope="col" className="px-1 py-1">Share</th>
            <th scope="col" className="px-1 py-1">Cancel Fee</th>
            <th scope="col" className="px-1 py-1">Receipt</th>
          </tr>
        </thead>
        <tbody>
          {data &&
            // data.slice(indexOfFirstItem, indexOfLastItem).map((fees, index) => ( // Uncomment for pagination
            data.map((fees, index) => (
              <tr
                key={fees._id || index} // Use a unique key like fees._id if available
                className={`${
                  fees.status === "canceled" ? "bg-[#a53c3c66]" : ""
                } border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`}
                style={{ color: "black" }}
              >
                <td className="px-1 py-1 border font-bold">
                  {/* {index + 1 + indexOfFirstItem} // For pagination */}
                  {index + 1}
                </td>
                <td className="px-1 py-1 border">
                  {isUnified
                    ? fees.students?.map((s) => s.admissionNumber).join(", ") || "N/A"
                    : fees.admissionNumber || "N/A"}
                </td>
                <td className="px-1 py-1 border">
                  {isUnified
                    ? fees.students?.map((s) => s.studentName).join(", ") || "N/A"
                    : fees.studentName || "N/A"}
                </td>
                <td className="px-1 py-1 border">
                  {isUnified
                    ? fees.parentName || "N/A"
                    : fees.fatherName || "N/A"}
                </td>
                <td className="px-1 py-1 border">
                  {isUnified
                    ? fees.students?.map((s) => s.class).join(", ") || "N/A"
                    : fees.studentClass || "N/A"}
                </td>
                <td className="px-1 py-1 border">
                  {isUnified
                    ? fees.unifiedReceiptNumber
                    : fees.feeReceiptNumber}
                </td>
                
                <td className="px-2 py-4"> {/* Kept original px-2 py-4 here */}
                  {fees.date
                    ? format(parseISO(fees.date), "dd/MM/yyyy")
                    : "N/A"}
                </td>
               
                <td className="px-1 py-1 border ">{fees.totalFeeAmount || 0}</td>
                <td className="px-1 py-1 border">{parseFloat(fees.totalAmountPaid || 0)}</td>
                <td className="px-1 py-1 border ">{fees.paymentMode || 0}</td>
                <td className="px-1 py-1 border">{fees.concessionApplied || 0}</td>
               
                <td className="px-1 py-1 border">
                  {parseFloat(fees.totalDues || 0).toFixed(1)}
                </td>
                 <td className="px-1 py-1 border">{fees.status }</td>
                <td className="px-1 py-1">
                  <button // Changed to button for accessibility
                    onClick={() => {
                      setModalData(fees);
                      toggleModal();
                    }}
                    className="font-bold text-green-700 flex items-center cursor-pointer hover:underline mr-2"
                    aria-label="View Details"
                  >
                    <FaEye className="text-2xl" />
                  </button>
                </td>
                <td className="px-1 py-1">
                  <Button
                    name="Share" // Removed name to just show icon
                    color="green"
                    onClick={() => FeeReceipt(fees)} // Assuming FeeReceipt handles disabled state or it's checked before calling
                    disabled={fees.status === "canceled"}
                    className="p-1" // Adjust padding for icon button
                    aria-label="Share Receipt"
                  >
                    <FaShareAlt className="text-xl" /> {/* Adjusted size */}
                  </Button>
                </td>
                <td className="px-1 py-1">
                  <Button
                    name="Cancel"
                    onClick={() => handleCancel(fees)}
                    className={`text-red-600 font-bold cursor-pointer dark:text-red-500 hover:underline ${
                      fees.status === "canceled"
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    disabled={fees.status === "canceled"}
                    color="red"
                  />
                </td>
                <td className="px-1 py-1">
                  <Button
                    name="View Receipt" // Removed name to just show icon
                    color="blue"
                    onClick={() => handleViewReceipt(fees)}
                    className="p-1" // Adjust padding for icon button
                    aria-label="View Receipt Document"
                    // disabled={fees.status === "canceled"} // Allow viewing canceled receipts
                  >
                    <FaFileAlt className="text-xl" /> {/* Adjusted size */}
                  </Button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      : (
        <div className="p-4 text-center">
          <p className="text-xl text-orange-800">
            { (startDate !== getCurrentDate() || endDate !== getCurrentDate() || paymentModeFilter !== "") && feeHistory.length === 0 && activeTab==="single"
              ? "No single receipts found for the selected filters."
              : (startDate !== getCurrentDate() || endDate !== getCurrentDate() || paymentModeFilter !== "") && unifiedFeeHistory.length === 0 && activeTab==="unified"
              ? "No unified receipts found for the selected filters."
              : activeTab === "single" && feeHistory.length === 0 ? "Apply date filter to see single receipts."
              : <NoDataFound />
            }
          </p>
        </div>
      )
      }
    </div>
  );

  // const totalItems = activeTab === "single" ? filteredFeeHistory.length : filteredUnifiedFeeHistory.length;
  // const totalPages = Math.ceil(totalItems / itemsPerPage);
  // console.log("totalPages",totalPages) // For pagination controls if implemented
 
  return (
    <div className="">
        <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Fee History"/>
     <div className="bg-white p-2 rounded-lg shadow border border-gray-200 mb-4">
     <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "single"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => {
              setActiveTab("single");
              setCurrentPage(1); // Reset pagination
            }}
          >
            Single Receipts
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === "unified"
                ? "border-b-2 border-blue-500 text-blue-600"
                : "text-gray-600 hover:text-blue-500"
            }`}
            onClick={() => {
              setActiveTab("unified");
              setCurrentPage(1); // Reset pagination
            }}
          >
            Unified Receipts
          </button>
        </div>
      </div>

      {/* Filters: Date and Payment Mode */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-2 items-end">
        <ReactInput
          type="date"
          label="Start Date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          containerClassName="flex-1 min-w-[150px]"
        />
        <ReactInput
          type="date"
          label="End Date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          containerClassName="flex-1 min-w-[150px]"
        />
       
        <div className="flex gap-2 items-end md:col-span-2 lg:col-span-2 flex-wrap"> {/* Adjusted col-span for responsiveness */}
          <Button
            name="Filter"
            onClick={handleDateFilter}
            color="green"
            className="bg-green-600 hover:bg-blue-700 text-white px-4 py-2 rounded h-10"
          />
           <Button
            name="Clear"
            color="gray"
            onClick={clearDateFilter}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded h-10"
          />
           <div className="flex-1 min-w-[100px]">
            {/* <label htmlFor="paymentMode" className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label> */}
            <select
                id="paymentMode"
                name="paymentMode"
                value={paymentModeFilter}
                onChange={(e) => setPaymentModeFilter(e.target.value)}
                className="mt-1 block w-full py-1 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
                {paymentModeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
         
          <Button
            name="Download Report"
            onClick={handleDownloadPdf}
            className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded h-10"
            icon={<FaFileAlt className="mr-2"/>} // Added margin to icon
          />
        </div>
      </div>
     </div>

      {/* Payment Summary Section */}
      <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-4">
        <h3 className="text-lg font-semibold mb-3 text-gray-800">Payment Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Cash</p>
            <p className="font-medium text-gray-900">₹{currentTotals.cash.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Online</p>
            <p className="font-medium text-gray-900">₹{currentTotals.online.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Cheque</p>
            <p className="font-medium text-gray-900">₹{currentTotals.cheque.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Card</p>
            <p className="font-medium text-gray-900">₹{currentTotals.card.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-gray-600">Other</p>
            <p className="font-medium text-gray-900">₹{currentTotals.other.toFixed(2)}</p>
          </div>
          <div className="text-green-600">
            <p className="text-gray-600">Total Paid</p>
            <p className="font-semibold text-xl">
              ₹{overallTotalPaid(currentFilteredData).toFixed(2)}
            </p>
          </div>
          <div className="text-red-600">
            <p className="text-gray-600">Total Dues</p>
            <p className="font-semibold text-xl">
              ₹{overallTotalDuesSum(currentFilteredData).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {activeTab === "single"
        ? renderTable(filteredFeeHistory, false)
        : renderTable(filteredUnifiedFeeHistory, true)}

      <Modal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        title="Fee Details"
        maxWidth="lg"
      >
        <div className="p-4">
          {modalData && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">Student Information</h3>
                <p><strong>Name:</strong> {modalData.studentName || modalData.students?.map((s) => s.studentName).join(", ") || "N/A"}</p>
                <p><strong>Admission No:</strong> {modalData.admissionNumber || modalData.students?.map((s) => s.admissionNumber).join(", ") || "N/A"}</p>
                <p><strong>Parent Name:</strong> {modalData.parentName || modalData.fatherName || "N/A"}</p>
                <p><strong>Class:</strong> {modalData.studentClass || modalData.students?.map((s) => s.class).join(", ") || "N/A"}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Payment Details</h3>
                <p><strong>Receipt No:</strong> {modalData.feeReceiptNumber || modalData.unifiedReceiptNumber || "N/A"}</p>
                <p><strong>Date:</strong> {modalData.date ? format(parseISO(modalData.date), "dd/MM/yyyy") : "N/A"}</p>
                <p><strong>Payment Mode:</strong> {modalData.paymentMode || "N/A"}</p>
                <p><strong>Transaction ID:</strong> {modalData.transactionId || "N/A"}</p>
                <p><strong>Total Paid:</strong> ₹{modalData.totalAmountPaid || 0}</p>
                <p><strong>Total Dues:</strong> ₹{modalData.totalDues || 0}</p>
              </div>
              <div>
                <h3 className="font-semibold text-lg">Fee Breakdown</h3>
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 border text-left">Type</th>
                      <th className="p-2 border text-left">Month</th>
                      <th className="p-2 border text-left">Amount</th>
                      <th className="p-2 border text-left">Dues</th>
                      <th className="p-2 border text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {modalData.regularFees?.map((fee, index) => (
                      <tr key={`reg-${index}`}>
                        <td className="p-2 border">Class Fee</td>
                        <td className="p-2 border">{fee.month || "N/A"}</td>
                        <td className="p-2 border">₹{fee.paidAmount || 0}</td>
                        <td className="p-2 border">₹{fee.dueAmount || 0}</td>
                        <td className="p-2 border">{fee.status || "Unknown"}</td>
                      </tr>
                    ))}
                    {modalData.additionalFees?.map((fee, index) => (
                      <tr key={`add-${index}`}>
                        <td className="p-2 border">{fee.name || "N/A"}</td>
                        <td className="p-2 border">{fee.month || "N/A"}</td> {/* Assuming additional fees can have month */}
                        <td className="p-2 border">₹{fee.paidAmount || 0}</td>
                        <td className="p-2 border">₹{fee.dueAmount || 0}</td>
                        <td className="p-2 border">{fee.status || "Unknown"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="mt-6 flex justify-end">
            <Button name="Close" onClick={toggleModal} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"/>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={cancel}
        setIsOpen={setCancel}
        title="Confirm Cancellation"
        maxWidth="sm"
      >
        <div className="p-4">
          <p className="mb-4 text-gray-700">
            Are you sure you want to cancel the fee payment for receipt{" "}
            <strong>{cancelData?.feeReceiptNumber || cancelData?.unifiedReceiptNumber || "N/A"}</strong>?
          </p>
          <div className="flex gap-4 justify-end">
            <Button name="Confirm" onClick={cancelFee} className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"/>
            <Button name="Cancel" onClick={() => setCancel(false)} className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"/>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={receiptModalOpen}
        setIsOpen={setReceiptModalOpen} // Use this prop to control modal
        title={receiptData?.data?.isUnified ? "Unified Receipt Preview" : "Single Receipt Preview"}
        maxWidth="lg"
        onClose={handleCloseReceiptModal} // Ensure modal closes when clicking outside or pressing Esc
      >
        <div className="p-4">
          {receiptData && isPreviewReady ? (
            <FeeRecipt
              modalData={receiptData}
              isUnified={receiptData.data.isUnified}
              handleCloseModal={handleCloseReceiptModal} // Pass this for FeeRecipt to call on its own close/print/download
            />
          ) : (
            <p className="text-gray-600">Loading receipt preview...</p>
          )}
          {/* The print/download buttons in FeeRecipt component are primary. These are fallbacks or explicit controls. */}
           <div className="mt-5 sm:mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
            <Button
              type="button"
              name="Print Receipt"
              onClick={() => {
                const printButtonInChild = document.getElementById('fee-receipt-print-button'); // Ensure FeeRecipt has a button with this ID
                if (printButtonInChild) printButtonInChild.click();
                else console.warn("Print button not found in FeeRecipt component. Ensure it has id='fee-receipt-print-button'.");
                // handleCloseReceiptModal(); // Close after initiating print, or let FeeRecipt handle it
              }}
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
              disabled={!isPreviewReady}
            />
            <Button
              type="button"
              name="Download PDF"
               onClick={() => {
                const downloadButtonInChild = document.getElementById('fee-receipt-download-button'); // Ensure FeeRecipt has a button with this ID
                if (downloadButtonInChild) downloadButtonInChild.click();
                else console.warn("Download button not found in FeeRecipt component. Ensure it has id='fee-receipt-download-button'.");
                // handleCloseReceiptModal(); // Close after initiating download, or let FeeRecipt handle it
              }}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
              disabled={!isPreviewReady}
            />
            <Button
              type="button"
              name="Close"
              onClick={handleCloseReceiptModal}
              className="w-full sm:w-auto bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Table;



// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import FeeRecipt from "./FeeRecipt";
// import NoDataFound from "../../NoDataFound";
// import { format, parseISO } from "date-fns";
// import { FaEye, FaPrint, FaFileAlt, FaShareAlt } from "react-icons/fa";
// import { cancelFeePayment, feesfeeHistory } from "../../Network/AdminApi";
// import { toast } from "react-toastify";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import Modal from "../../Dynamic/Modal";
// import Button from "../../Dynamic/utils/Button";
// import moment from "moment";
// import { FeeReceipt } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";
// import axios from "axios";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// const Table = ({ reLoad }) => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const { currentColor, setIsLoader } = useStateContext();
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const [unifiedFeeHistory, setUnifiedFeeHistory] = useState([]);
//   const [filteredUnifiedFeeHistory, setFilteredUnifiedFeeHistory] = useState(
//     []
//   );
//   const [receiptModalOpen, setReceiptModalOpen] = useState(false);
//   const [receiptData, setReceiptData] = useState(null);
//   const authToken = localStorage.getItem("token");
//   const [activeTab, setActiveTab] = useState("single");
//   const [isPreviewReady, setIsPreviewReady] = useState(false);
//   const [session, setSession] = useState(user?.session || "");

//   // Date filter state
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [cancel, setCancel] = useState(false);
//   const [feeDetails, setFeeDetails] = useState([]);
//   const [unifiedFeeDetails, setUnifiedFeeDetails] = useState([]);
//   const [startDate, setStartDate] = useState(getCurrentDate());
//   const [endDate, setEndDate] = useState(getCurrentDate());
//   const [cancelData, setCancelData] = useState({});

//   // Modal toggles
//   const toggleModal = () => setIsOpen(!isOpen);
//   const toggleReceiptModal = () => setReceiptModalOpen(!receiptModalOpen);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   // Fetch data on reload or session change
//   useEffect(() => {
//     // getFeeHistory();
//     getUnifiedFeeHistory();
//   }, [reLoad, session]);

//   const getFeeHistory = async (startDate,endDate,session) => {
//     setIsLoader(true);
//     try {
//       const response = await feesfeeHistory(startDate,endDate,session);
//       if (response?.success) {
//         const singleReceipts = response?.data.filter((fee) => !fee.isUnified);
//         setFeeHistory(singleReceipts);
//         setFilteredFeeHistory(singleReceipts);
//       } else {
//         toast.error(response?.message || "Failed to fetch single receipts");
//       }
//     } catch (error) {
//       console.error("Error fetching single receipts:", error);
//       toast.error("Error fetching single receipts: " + error.message);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const getUnifiedFeeHistory = async () => {
//     // setIsLoader(true);  
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/unified-receipts?session=${session}`,
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//           withCredentials: true,
//         }
//       );
//       if (response.data.success) {
//         setUnifiedFeeHistory(response.data.data);
//         setFilteredUnifiedFeeHistory(response.data.data);
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch unified receipts"
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching unified receipts:", error);
//       toast.error("Error fetching unified receipts: " + error.message);
//     } finally {
//       // setIsLoader(false);
//     }
//   };

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   // Date filtering
//   const handleDateFilter = () => {
//     getFeeHistory(startDate,endDate)
//   };
 
//   const clearDateFilter = () => {
//     setStartDate(getCurrentDate());
//     setEndDate(getCurrentDate());
//     setFeeHistory([])
//     setFilteredFeeHistory(feeHistory);
//     setFilteredUnifiedFeeHistory(unifiedFeeHistory);
//     // setCurrentPage(1);
//   };

//   // Cancel fee logic
//   const cancelFee = async () => {
//     const payload = {
//       studentId: cancelData?.studentId,
//       feeReceiptNumber:
//         cancelData?.feeReceiptNumber || cancelData?.unifiedReceiptNumber,
//     };
//     try {
//       const response = await cancelFeePayment(payload);
//       if (response?.success) {
//         setCancel(false);
//         toast.success(response?.message);
//         // getFeeHistory();
//         getUnifiedFeeHistory();
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.error("Error cancelling fee:", error);
//       toast.error("Error cancelling fee: " + error.message);
//     }
//   };

//   const handleCancel = (val) => {
//     setCancelData(val);
//     setCancel(true);
//   };

//   // Fetch and display receipt
//   const handleViewReceipt = async (fees) => {
//     try {
//       const receiptNumber = fees.feeReceiptNumber || fees.unifiedReceiptNumber;
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`,
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         // Store the full response object, including 'success' and 'data'
//         setReceiptData(response.data);
//         setIsPreviewReady(true);
//         setReceiptModalOpen(true);
//       } else {
//         toast.error("Failed to fetch receipt data.");
//         setIsPreviewReady(false);
//       }
//     } catch (error) {
//       console.error("Error fetching receipt:", error);
//       toast.error("Error fetching receipt data: " + error.message);
//       setIsPreviewReady(false);
//     }
//   };

//   // Handle receipt modal close
//   const handleCloseReceiptModal = () => {
//     // Simply close the modal; FeeRecipt handles print/download internally
//     setReceiptModalOpen(false);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//   };

//   const totalsByMode = (data) => {
//     return data.reduce(
//       (accumulator, item) => {
//         const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
//         const mode = item?.paymentMode?.toLowerCase() || "other";
//         switch (mode) {
//           case "cash":
//             accumulator.cash += amountPaid;
//             break;
//           case "online":
//             accumulator.online += amountPaid;
//             break;
//           case "cheque":
//             accumulator.cheque += amountPaid;
//             break;
//           case "card":
//             accumulator.card += amountPaid;
//             break;
//           default:
//             accumulator.other += amountPaid;
//             break;
//         }
//         return accumulator;
//       },
//       { cash: 0, online: 0, cheque: 0, card: 0, other: 0 }
//     );
//   };

//   const overallTotalPaid = (data) => {
//     return data.reduce((sum, item) => {
//       const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
//       return sum + amountPaid;
//     }, 0);
//   };

//   const overallTotalDuesSum = (data) => {
//     return data.reduce((sum, item) => {
//       const duesValue = parseFloat(item?.totalDues) || 0;
//       return sum + duesValue;
//     }, 0);
//   };

//   const singleTotals = totalsByMode(filteredFeeHistory);
//   const unifiedTotals = totalsByMode(filteredUnifiedFeeHistory);
//   const cashPayment =
//     activeTab === "single" ? singleTotals.cash : unifiedTotals.cash;
//   const onlinePayment =
//     activeTab === "single" ? singleTotals.online : unifiedTotals.online;
//   const chequePayment =
//     activeTab === "single" ? singleTotals.cheque : unifiedTotals.cheque;
//   const cardPayment =
//     activeTab === "single" ? singleTotals.card : unifiedTotals.card;
//   const otherPayment =
//     activeTab === "single" ? singleTotals.other : unifiedTotals.other;

//   // Download report as PDF
//     const handleDownloadPdf = () => {
//       const feedata = filteredFeeHistory.map((val) => ({
//         ...val,
//         month: val.regularFees.map((item) => item.month).join('\n'),
//         // Map to get the status values, then join them with newline characters
//         feeStatus: val.regularFees.map((item) => item.status).join('\n')
//         // month: val.regularFees.map((item) => item.month),
//         // feeStatus: val.regularFees.map((item) => item.status)
//       }));
      
      

//       const data = activeTab === "single" ? feedata : filteredUnifiedFeeHistory;
//       const columns = [
//         {
//           header: "Rcpt.No.",
//           dataKey:
//             activeTab === "single" ? "feeReceiptNumber" : "unifiedReceiptNumber",
//         },
//         { header: "Date", dataKey: "date" },
//         { header: "Admission No.", dataKey: "admissionNumber" },
//         { header: "Student", dataKey: "studentName" },
//         {
//           header: "Parent Name",
//           dataKey: activeTab === "single" ? "fatherName" : "parentName",
//         },
//         { header: "Class", dataKey: "studentClass" },
//         { header: "Mode", dataKey: "paymentMode" },
//         { header: "TID", dataKey: "transactionId" },
//         { header: "Month", dataKey: "month" },
//         { header: "Fee Amount", dataKey: "totalFeeAmount" },
       
//         { header: "Paid", dataKey: "totalAmountPaid" },
//         { header: "Dues", dataKey: "totalDues" },
//         { header: "Status", dataKey: "feeStatus" },
//       ];
//       generatePdf(
//         data,
//         columns,
//         overallTotalPaid(
//           activeTab === "single" ? filteredFeeHistory : filteredUnifiedFeeHistory
//         ),
//         overallTotalDuesSum(
//           activeTab === "single" ? filteredFeeHistory : filteredUnifiedFeeHistory
//         ),
//         cashPayment,
//         onlinePayment,
//         chequePayment,
//         cardPayment,
//         activeTab === "single" ? "single-report.pdf" : "unified-report.pdf"
//       );
//     };

//   // Render table for single or unified receipts
//   const renderTable = (data, isUnified = false) => (
//     <div className="relative md:max-h-screen overflow-x-auto shadow-md sm:rounded-lg">
//       {
//         data?.length>0 &&
//         <table className="w-full border text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//         <thead
//           style={{
//             background: currentColor,
//             color: "white",
//             whiteSpace: "nowrap",
//           }}
//           className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
//         >
//           <tr>
//             <th scope="col" className="px-1 py-1">
//               S No.
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Adm No.
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Name
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Parent Name
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Class
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Receipt No.
//             </th>
//             {/* <th scope="col" className="px-1 py-1">
//               Regular Fee
//             </th> */}
//             <th scope="col" className="px-1 py-1">
//               Pay Date
//             </th>
//             <th scope="col" className="px-1 py-1">
//             Fee Amount
//             </th>
          
            
//             <th scope="col" className="px-1 py-1">
//               Paid
//             </th>
//             <th scope="col" className="px-1 py-1">
//             Concession
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Dues
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Action
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Share
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Cancel Fee
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Receipt
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {data &&
//             data?.map((fees, index) => (
//             // data.slice(indexOfFirstItem, indexOfLastItem).map((fees, index) => (
//               <tr
//                 key={index}
//                 className={`${
//                   fees.status === "canceled" ? "bg-[#a53c3c66]" : ""
//                 } border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`}
//                 style={{ color: "black" }}
//               >
//                 <td className="px-1 py-1 border font-bold">
//                   {index + 1 + (currentPage - 1) * itemsPerPage}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.admissionNumber).join(", ") ||
//                       "N/A"
//                     : fees.admissionNumber || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.studentName).join(", ") ||
//                       "N/A"
//                     : fees.studentName || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.parentName || "N/A"
//                     : fees.fatherName || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.class).join(", ") || "N/A"
//                     : fees.studentClass || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.unifiedReceiptNumber
//                     : fees.feeReceiptNumber}
//                 </td>
                
//                 <td className="px-2 py-4">
//                   {fees.date
//                     ? format(parseISO(fees.date), "dd/MM/yyyy")
//                     : "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border ">{fees.totalFeeAmount || 0}</td>
//                 <td className="px-1 py-1 border">{parseFloat(fees.totalAmountPaid || 0)}</td>
//                 <td className="px-1 py-1 border">{fees.concessionApplied || 0}</td>
//                 {/* <td className="px-1 py-1 border">{parseFloat(fees.totalDues || 0)}</td> */}
//                 <td className="px-1 py-1 border">
//   {parseFloat(fees.totalDues || 0).toFixed(2)}
// </td>

//                 <td className="px-1 py-1">
//                   <a
//                     onClick={() => {
//                       setModalData(fees);
//                       toggleModal();
//                     }}
//                     className="font-bold text-green-700 flex align-middle cursor-pointer hover:underline mr-2"
//                   >
//                     <FaEye className="text-2xl" />
//                   </a>
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="Share"
//                     color="green"
//                     onClick={() => FeeReceipt(fees)}
//                     disabled={fees.status === "canceled"}
//                   >
//                     <FaShareAlt className="text-2xl" />
//                   </Button>
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="Cancel"
//                     onClick={() => handleCancel(fees)}
//                     className={`text-red-600 font-bold cursor-pointer dark:text-red-500 hover:underline ${
//                       fees.status === "canceled"
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                     disabled={fees.status === "canceled"}
//                     color="red"
//                   />
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="View Receipt"
//                     color="blue"
//                     onClick={() => handleViewReceipt(fees)}
//                     // disabled={fees.status === "canceled"}
//                   >
//                     <FaFileAlt className="text-2xl" />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//         </tbody>
//       </table>
//       }
//       {data.length === 0 && (
//         <div className="p-4">
//           {/* <NoDataFound /> */}
//           <p className="text-xl text-orange-800">Please apply the filter based on the selected date.</p>
//         </div>
//       )}
//     </div>
//   );

//   const totalItems =
//     activeTab === "single"
//       ? filteredFeeHistory.length
//       : filteredUnifiedFeeHistory.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
// console.log("totalPages",totalPages)
 
//   return (
//     <div className="">
//         <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Fee History"/>
//       {/* Tabs for Single and Unified Receipts */}
//      <div className="bg-white p-2 rounded-lg shadow border border-gray-200">
//      <div className="mb-4">
//         <div className="flex border-b border-gray-200">
//           <button
//             className={`px-4 py-2 font-medium ${
//               activeTab === "single"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => {
//               setActiveTab("single");
//               setCurrentPage(1);
//             }}
//           >
//             Single Receipts
//           </button>
//           <button
//             className={`px-4 py-2 font-medium ${
//               activeTab === "unified"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => {
//               setActiveTab("unified");
//               setCurrentPage(1);
//             }}
//           >
//             Unified Receipts
//           </button>
//         </div>
//       </div>

//       {/* Date Filters and Buttons */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-2">
//         <ReactInput
//           type="date"
//           label="Start Date"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//           containerClassName="flex-1 min-w-[150px]"
//         />
//         <ReactInput
//           type="date"
//           label="End Date"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//           containerClassName="flex-1 min-w-[150px]"
//         />
//         <div className="flex gap-2 items-end">
//           <Button
//             name="Filter"
//             onClick={handleDateFilter}
//             color="green"
//             className="bg-green-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//           />
//           <Button
//             name="Clear"
//             color="gray"
//             onClick={clearDateFilter}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//           />
//           <Button
//             name="Download Report"
//             onClick={handleDownloadPdf}
//             className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
//             icon={<FaFileAlt />}
//           />
//         </div>
//       </div>
//      </div>

//       {/* Payment Summary Section */}
//       <div className="bg-white p-2 rounded-lg shadow border border-gray-200">
//         <h3 className="text-sm font-semibold mb-2">Payment Summary</h3>
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
//           <div>
//             <p className="text-sm text-gray-600">Cash</p>
//             <p className="font-medium">₹{cashPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Online</p>
//             <p className="font-medium">₹{onlinePayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Cheque</p>
//             <p className="font-medium">₹{chequePayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Card</p>
//             <p className="font-medium">₹{cardPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Other</p>
//             <p className="font-medium">₹{otherPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Paid</p>
//             <p className="font-semibold text-green-600">
//               ₹
//               {overallTotalPaid(
//                 activeTab === "single"
//                   ? filteredFeeHistory
//                   : filteredUnifiedFeeHistory
//               ).toFixed(2)}
//             </p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Dues</p>
//             <p className="font-semibold text-red-600">
//               ₹
//               {overallTotalDuesSum(
//                 activeTab === "single"
//                   ? filteredFeeHistory
//                   : filteredUnifiedFeeHistory
//               ).toFixed(2)}
//             </p>
//           </div>
//         </div>
       
       
//       </div>

//       {activeTab === "single"
//         ? renderTable(filteredFeeHistory, false)
//         : renderTable(filteredUnifiedFeeHistory, true)}

//       <Modal
//         isOpen={isOpen}
//         setIsOpen={setIsOpen}
//         title="Fee Details"
//         maxWidth="lg"
//       >
//         <div className="p-4">
//           {modalData && (
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-semibold text-lg">Student Information</h3>
//                 <p>
//                   <strong>Name:</strong>{" "}
//                   {modalData.studentName ||
//                     modalData.students?.map((s) => s.studentName).join(", ") ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Admission No:</strong>{" "}
//                   {modalData.admissionNumber ||
//                     modalData.students
//                       ?.map((s) => s.admissionNumber)
//                       .join(", ") ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Parent Name:</strong>{" "}
//                   {modalData.parentName || modalData.fatherName || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Class:</strong>{" "}
//                   {modalData.studentClass ||
//                     modalData.students?.map((s) => s.class).join(", ") ||
//                     "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-lg">Payment Details</h3>
//                 <p>
//                   <strong>Receipt No:</strong>{" "}
//                   {modalData.feeReceiptNumber ||
//                     modalData.unifiedReceiptNumber ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Date:</strong>{" "}
//                   {modalData.date
//                     ? format(parseISO(modalData.date), "dd/MM/yyyy")
//                     : "N/A"}
//                 </p>
//                 <p>
//                   <strong>Payment Mode:</strong>{" "}
//                   {modalData.paymentMode || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Transaction ID:</strong>{" "}
//                   {modalData.transactionId || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Total Paid:</strong> ₹{modalData.totalAmountPaid || 0}
//                 </p>
//                 <p>
//                   <strong>Total Dues:</strong> ₹{modalData.totalDues || 0}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-lg">Fee Breakdown</h3>
//                 <table className="w-full text-sm border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="p-2 border">Type</th>
//                       <th className="p-2 border">Month</th>
//                       <th className="p-2 border">Amount</th>
//                       <th className="p-2 border">Dues</th>
//                       <th className="p-2 border">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {modalData.regularFees?.map((fee, index) => (
//                       <tr key={`reg-${index}`}>
//                         <td className="p-2 border">Class Fee</td>
//                         <td className="p-2 border">{fee.month || "N/A"}</td>
//                         <td className="p-2 border">₹{fee.paidAmount || 0}</td>
//                         <td className="p-2 border">₹{fee.dueAmount || 0}</td>
//                         <td className="p-2 border">
//                           {fee.status || "Unknown"}
//                         </td>
//                       </tr>
//                     ))}
//                     {modalData.additionalFees?.map((fee, index) => (
//                       <tr key={`add-${index}`}>
//                         <td className="p-2 border">{fee.name || "N/A"}</td>
//                         <td className="p-2 border">{fee.month || "N/A"}</td>
//                         <td className="p-2 border">₹{fee.paidAmount || 0}</td>
//                         <td className="p-2 border">₹{fee.dueAmount || 0}</td>
//                         <td className="p-2 border">
//                           {fee.status || "Unknown"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//           <div className="mt-6 flex justify-end">
//             <Button
//               name="Close"
//               onClick={toggleModal}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>
//       <Modal
//         isOpen={cancel}
//         setIsOpen={setCancel}
//         title="Confirm Cancellation"
//         maxWidth="sm"
//       >
//         <div className="p-4">
//           <p className="mb-4 text-gray-700">
//             Are you sure you want to cancel the fee payment for receipt{" "}
//             <strong>
//               {cancelData?.feeReceiptNumber ||
//                 cancelData?.unifiedReceiptNumber ||
//                 "N/A"}
//             </strong>
//             ?
//           </p>
//           <div className="flex gap-4 justify-end">
//             <Button
//               name="Confirm"
//               onClick={cancelFee}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
//             />
//             <Button
            
//               name="Cancel"
//               onClick={() => setCancel(false)}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* Receipt Preview Modal */}
//       <Modal
//         isOpen={receiptModalOpen}
//         setIsOpen={setReceiptModalOpen}
//         title={
//           activeTab === "single"
//             ? "Single Receipt Preview"
//             : "Unified Receipt Preview"
//         }
//         maxWidth="lg"
//       >
//         <div className="p-4">
//           {receiptData && isPreviewReady ? (
//             <FeeRecipt
//               modalData={receiptData} // Pass full response object
//               isUnified={receiptData.data.isUnified} // Pass isUnified flag
//               handleCloseModal={handleCloseReceiptModal}
//             />
//           ) : (
//             <p className="text-gray-600">Loading receipt preview...</p>
//           )}
//           {/* Additional controls for consistency, though FeeRecipt handles printing */}
//           <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
//             <Button
//               type="button"
//               name="Print Receipt"
//               onClick={() => {
//                 // Trigger FeeRecipt's internal print; modal closes via handleCloseModal
//                 document.querySelector(".print-button")?.click();
//               }}
//               className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//               disabled={!isPreviewReady}
//             />
//             <Button
//               type="button"
//               name="Download PDF"
//               onClick={() => {
//                 // Trigger FeeRecipt's internal download; modal closes via handleCloseModal
//                 document.querySelector(".print-button")?.click();
//               }}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//               disabled={!isPreviewReady}
//             />
//             <Button
//               type="button"
//               name="Close"
//               onClick={handleCloseReceiptModal}
//               className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Table;




// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import FeeRecipt from "./FeeRecipt";
// import NoDataFound from "../../NoDataFound";
// import { format, parseISO } from "date-fns";
// import { FaEye, FaPrint, FaFileAlt, FaShareAlt } from "react-icons/fa";
// import { cancelFeePayment, feesfeeHistory } from "../../Network/AdminApi";
// import { toast } from "react-toastify";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import Modal from "../../Dynamic/Modal";
// import Button from "../../Dynamic/utils/Button";
// import moment from "moment";
// import { FeeReceipt } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";
// import axios from "axios";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// const Table = ({ reLoad }) => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const { currentColor, setIsLoader } = useStateContext();
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const [unifiedFeeHistory, setUnifiedFeeHistory] = useState([]);
//   const [filteredUnifiedFeeHistory, setFilteredUnifiedFeeHistory] = useState(
//     []
//   );
//   const [receiptModalOpen, setReceiptModalOpen] = useState(false);
//   const [receiptData, setReceiptData] = useState(null);
//   const authToken = localStorage.getItem("token");
//   const [activeTab, setActiveTab] = useState("single");
//   const [isPreviewReady, setIsPreviewReady] = useState(false);
//   const [session, setSession] = useState(user?.session || "");

//   // Date filter state
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [cancel, setCancel] = useState(false);
//   const [feeDetails, setFeeDetails] = useState([]);
//   const [unifiedFeeDetails, setUnifiedFeeDetails] = useState([]);
//   const [startDate, setStartDate] = useState(getCurrentDate());
//   const [endDate, setEndDate] = useState(getCurrentDate());
//   const [cancelData, setCancelData] = useState({});

//   // Modal toggles
//   const toggleModal = () => setIsOpen(!isOpen);
//   const toggleReceiptModal = () => setReceiptModalOpen(!receiptModalOpen);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   // Fetch data on reload or session change
//   useEffect(() => {
//     // getFeeHistory();
//     getUnifiedFeeHistory();
//   }, [reLoad, session]);

//   const getFeeHistory = async (startDate,endDate,session) => {
//     setIsLoader(true);
//     try {
//       const response = await feesfeeHistory(startDate,endDate,session);
//       if (response?.success) {
//         const singleReceipts = response?.data.filter((fee) => !fee.isUnified);
//         setFeeHistory(singleReceipts);
//         setFilteredFeeHistory(singleReceipts);
//       } else {
//         toast.error(response?.message || "Failed to fetch single receipts");
//       }
//     } catch (error) {
//       console.error("Error fetching single receipts:", error);
//       toast.error("Error fetching single receipts: " + error.message);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const getUnifiedFeeHistory = async () => {
//     // setIsLoader(true);  
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/unified-receipts?session=${session}`,
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//           withCredentials: true,
//         }
//       );
//       if (response.data.success) {
//         setUnifiedFeeHistory(response.data.data);
//         setFilteredUnifiedFeeHistory(response.data.data);
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch unified receipts"
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching unified receipts:", error);
//       toast.error("Error fetching unified receipts: " + error.message);
//     } finally {
//       // setIsLoader(false);
//     }
//   };

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   // Date filtering
//   const handleDateFilter = () => {
//     getFeeHistory(startDate,endDate)
//   };
//   // const handleDateFilter = () => {
//   //   const filteredSingle = feeHistory.filter((fee) => {
//   //     const feeDate = moment(fee.date).format("DD-MM-YYYY");
//   //     return (
//   //       feeDate >= moment(startDate).format("DD-MM-YYYY") &&
//   //       feeDate <= moment(endDate).format("DD-MM-YYYY")
//   //     );
//   //   });
//   //   const filteredUnified = unifiedFeeHistory.filter((fee) => {
//   //     const feeDate = moment(fee.date).format("DD-MM-YYYY");
//   //     return (
//   //       feeDate >= moment(startDate).format("DD-MM-YYYY") &&
//   //       feeDate <= moment(endDate).format("DD-MM-YYYY")
//   //     );
//   //   });
//   //   setFilteredFeeHistory(filteredSingle);
//   //   setFilteredUnifiedFeeHistory(filteredUnified);
//   //   setCurrentPage(1);
//   // };

//   const clearDateFilter = () => {
//     setStartDate(getCurrentDate());
//     setEndDate(getCurrentDate());
//     setFeeHistory([])
//     setFilteredFeeHistory(feeHistory);
//     setFilteredUnifiedFeeHistory(unifiedFeeHistory);
//     // setCurrentPage(1);
//   };

//   // Cancel fee logic
//   const cancelFee = async () => {
//     const payload = {
//       studentId: cancelData?.studentId,
//       feeReceiptNumber:
//         cancelData?.feeReceiptNumber || cancelData?.unifiedReceiptNumber,
//     };
//     try {
//       const response = await cancelFeePayment(payload);
//       if (response?.success) {
//         setCancel(false);
//         toast.success(response?.message);
//         // getFeeHistory();
//         getUnifiedFeeHistory();
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.error("Error cancelling fee:", error);
//       toast.error("Error cancelling fee: " + error.message);
//     }
//   };

//   const handleCancel = (val) => {
//     setCancelData(val);
//     setCancel(true);
//   };

//   // Fetch and display receipt
//   const handleViewReceipt = async (fees) => {
//     try {
//       const receiptNumber = fees.feeReceiptNumber || fees.unifiedReceiptNumber;
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`,
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         // Store the full response object, including 'success' and 'data'
//         setReceiptData(response.data);
//         setIsPreviewReady(true);
//         setReceiptModalOpen(true);
//       } else {
//         toast.error("Failed to fetch receipt data.");
//         setIsPreviewReady(false);
//       }
//     } catch (error) {
//       console.error("Error fetching receipt:", error);
//       toast.error("Error fetching receipt data: " + error.message);
//       setIsPreviewReady(false);
//     }
//   };

//   // Handle receipt modal close
//   const handleCloseReceiptModal = () => {
//     // Simply close the modal; FeeRecipt handles print/download internally
//     setReceiptModalOpen(false);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//   };

//   // Format fee details for display
//   // useEffect(() => {
//   //   if (Array.isArray(feeHistory)) {
//   //     const updatedFeeHistory = filteredFeeHistory.map((item) => ({
//   //       ...item,
//   //       month: item?.regularFees?.map((val) => val?.month).join(", ") || "",
//   //       feeStatus:
//   //         item?.regularFees?.map((val) => val?.status).join(", ") || "",
//   //     }));
//   //     setFeeDetails(updatedFeeHistory);
//   //   }
//   //   if (Array.isArray(unifiedFeeHistory)) {
//   //     const updatedUnifiedFeeHistory = filteredUnifiedFeeHistory.map(
//   //       (item) => ({
//   //         ...item,
//   //         month: item?.regularFees?.map((val) => val?.month).join(", ") || "",
//   //         feeStatus:
//   //           item?.regularFees?.map((val) => val?.status).join(", ") || "",
//   //         studentName:
//   //           item?.students?.map((s) => s.studentName).join(", ") || "",
//   //         admissionNumber:
//   //           item?.students?.map((s) => s.admissionNumber).join(", ") || "",
//   //         studentClass: item?.students?.map((s) => s.class).join(", ") || "",
//   //       })
//   //     );
//   //     setUnifiedFeeDetails(updatedUnifiedFeeHistory);
//   //   }
//   // }, [filteredFeeHistory, filteredUnifiedFeeHistory]);

//   // Payment totals calculation
//   const totalsByMode = (data) => {
//     return data.reduce(
//       (accumulator, item) => {
//         const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
//         const mode = item?.paymentMode?.toLowerCase() || "other";
//         switch (mode) {
//           case "cash":
//             accumulator.cash += amountPaid;
//             break;
//           case "online":
//             accumulator.online += amountPaid;
//             break;
//           case "cheque":
//             accumulator.cheque += amountPaid;
//             break;
//           case "card":
//             accumulator.card += amountPaid;
//             break;
//           default:
//             accumulator.other += amountPaid;
//             break;
//         }
//         return accumulator;
//       },
//       { cash: 0, online: 0, cheque: 0, card: 0, other: 0 }
//     );
//   };

//   const overallTotalPaid = (data) => {
//     return data.reduce((sum, item) => {
//       const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
//       return sum + amountPaid;
//     }, 0);
//   };

//   const overallTotalDuesSum = (data) => {
//     return data.reduce((sum, item) => {
//       const duesValue = parseFloat(item?.totalDues) || 0;
//       return sum + duesValue;
//     }, 0);
//   };

//   const singleTotals = totalsByMode(filteredFeeHistory);
//   const unifiedTotals = totalsByMode(filteredUnifiedFeeHistory);
//   const cashPayment =
//     activeTab === "single" ? singleTotals.cash : unifiedTotals.cash;
//   const onlinePayment =
//     activeTab === "single" ? singleTotals.online : unifiedTotals.online;
//   const chequePayment =
//     activeTab === "single" ? singleTotals.cheque : unifiedTotals.cheque;
//   const cardPayment =
//     activeTab === "single" ? singleTotals.card : unifiedTotals.card;
//   const otherPayment =
//     activeTab === "single" ? singleTotals.other : unifiedTotals.other;

//   // Download report as PDF
//   const handleDownloadPdf = () => {
//     const feedata = filteredFeeHistory.map((val) => ({
//       ...val,
//       month: val.regularFees.map((item) => item.month),
//       feeStatus: val.regularFees.map((item) => item.status)
//     }));
    
    

//     const data = activeTab === "single" ? feedata : filteredUnifiedFeeHistory;
//     const columns = [
//       {
//         header: "Rcpt.No.",
//         dataKey:
//           activeTab === "single" ? "feeReceiptNumber" : "unifiedReceiptNumber",
//       },
//       { header: "Date", dataKey: "date" },
//       { header: "Admission No.", dataKey: "admissionNumber" },
//       { header: "Student", dataKey: "studentName" },
//       {
//         header: "Parent Name",
//         dataKey: activeTab === "single" ? "fatherName" : "parentName",
//       },
//       { header: "Class", dataKey: "studentClass" },
//       { header: "Mode", dataKey: "paymentMode" },
//       { header: "TID", dataKey: "transactionId" },
//       { header: "Month", dataKey: "month" },
//       { header: "Fee Amount", dataKey: "totalFeeAmount" },
//       { header: "Dues", dataKey: "totalDues" },
//       { header: "Paid", dataKey: "totalAmountPaid" },
//       { header: "Status", dataKey: "feeStatus" },
//     ];
//     generatePdf(
//       data,
//       columns,
//       overallTotalPaid(
//         activeTab === "single" ? filteredFeeHistory : filteredUnifiedFeeHistory
//       ),
//       overallTotalDuesSum(
//         activeTab === "single" ? filteredFeeHistory : filteredUnifiedFeeHistory
//       ),
//       cashPayment,
//       onlinePayment,
//       chequePayment,
//       cardPayment,
//       activeTab === "single" ? "single-report.pdf" : "unified-report.pdf"
//     );
//   };

//   // Render table for single or unified receipts
//   const renderTable = (data, isUnified = false) => (
//     <div className="relative md:max-h-screen overflow-x-auto shadow-md sm:rounded-lg">
//       {
//         data?.length>0 &&
//         <table className="w-full border text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//         <thead
//           style={{
//             background: currentColor,
//             color: "white",
//             whiteSpace: "nowrap",
//           }}
//           className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
//         >
//           <tr>
//             <th scope="col" className="px-1 py-1">
//               S No.
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Adm No.
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Name
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Parent Name
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Class
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Receipt No.
//             </th>
//             {/* <th scope="col" className="px-1 py-1">
//               Regular Fee
//             </th> */}
//             <th scope="col" className="px-1 py-1">
//               Pay Date
//             </th>
//             <th scope="col" className="px-1 py-1">
//             Fee Amount
//             </th>
          
            
//             <th scope="col" className="px-1 py-1">
//               Paid
//             </th>
//             <th scope="col" className="px-1 py-1">
//             Concession
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Dues
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Action
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Share
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Cancel Fee
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Receipt
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {data &&
//             data?.map((fees, index) => (
//             // data.slice(indexOfFirstItem, indexOfLastItem).map((fees, index) => (
//               <tr
//                 key={index}
//                 className={`${
//                   fees.status === "canceled" ? "bg-[#a53c3c66]" : ""
//                 } border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`}
//                 style={{ color: "black" }}
//               >
//                 <td className="px-1 py-1 border font-bold">
//                   {index + 1 + (currentPage - 1) * itemsPerPage}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.admissionNumber).join(", ") ||
//                       "N/A"
//                     : fees.admissionNumber || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.studentName).join(", ") ||
//                       "N/A"
//                     : fees.studentName || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.parentName || "N/A"
//                     : fees.fatherName || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.class).join(", ") || "N/A"
//                     : fees.studentClass || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.unifiedReceiptNumber
//                     : fees.feeReceiptNumber}
//                 </td>
//                 {/* <td className="px-2">
//                   <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-1 overflow-x-auto">
//                     <div className="inline-block min-w-full rounded-lg overflow-hidden">
//                       {fees.regularFees?.length > 0 ||
//                       fees.additionalFees?.length > 0 ? (
//                         <table className="min-w-full leading-normal">
//                           <thead>
//                             <tr>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Name
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Month
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Amount
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Dues
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Status
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {fees.regularFees?.map((addFee, i) => (
//                               <tr key={`reg-${index}-${i}`}>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     Class Fee
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.month || "N/A"}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.paidAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.dueAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                     <span
//                                       aria-hidden
//                                       className="absolute inset-0 opacity-50 rounded-full"
//                                     ></span>
//                                     <span
//                                       className={`${
//                                         addFee.status === "Paid"
//                                           ? "text-green-600"
//                                           : "text-red-600"
//                                       }`}
//                                     >
//                                       {addFee.status || "Unknown"}
//                                     </span>
//                                   </span>
//                                 </td>
//                               </tr>
//                             ))}
//                             {fees.additionalFees?.map((addFee, i) => (
//                               <tr key={`add-${index}-${i}`}>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.name || "N/A"}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
                                 
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.paidAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.dueAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                     <span
//                                       aria-hidden
//                                       className="absolute inset-0 opacity-50 rounded-full"
//                                     ></span>
//                                     <span
//                                       className={`${
//                                         addFee.status === "Paid"
//                                           ? "text-green-600"
//                                           : "text-red-600"
//                                       }`}
//                                     >
//                                       {addFee.status || "Unknown"}
//                                     </span>
//                                   </span>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       ) : (
//                         <h1 className="text-center text-gray-600">
//                           No Fee Details
//                         </h1>
//                       )}
//                     </div>
//                   </div>
//                 </td> */}
//                 <td className="px-2 py-4">
//                   {fees.date
//                     ? format(parseISO(fees.date), "dd/MM/yyyy")
//                     : "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border ">{fees.totalFeeAmount || 0}</td>
//                 <td className="px-1 py-1 border">{parseFloat(fees.totalAmountPaid || 0)}</td>
//                 <td className="px-1 py-1 border">{fees.concessionApplied || 0}</td>
//                 {/* <td className="px-1 py-1 border">{parseFloat(fees.totalDues || 0)}</td> */}
//                 <td className="px-1 py-1 border">
//   {parseFloat(fees.totalDues || 0).toFixed(2)}
// </td>

//                 <td className="px-1 py-1">
//                   <a
//                     onClick={() => {
//                       setModalData(fees);
//                       toggleModal();
//                     }}
//                     className="font-bold text-green-700 flex align-middle cursor-pointer hover:underline mr-2"
//                   >
//                     <FaEye className="text-2xl" />
//                   </a>
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="Share"
//                     color="green"
//                     onClick={() => FeeReceipt(fees)}
//                     disabled={fees.status === "canceled"}
//                   >
//                     <FaShareAlt className="text-2xl" />
//                   </Button>
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="Cancel"
//                     onClick={() => handleCancel(fees)}
//                     className={`text-red-600 font-bold cursor-pointer dark:text-red-500 hover:underline ${
//                       fees.status === "canceled"
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                     disabled={fees.status === "canceled"}
//                     color="red"
//                   />
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="View Receipt"
//                     color="blue"
//                     onClick={() => handleViewReceipt(fees)}
//                     // disabled={fees.status === "canceled"}
//                   >
//                     <FaFileAlt className="text-2xl" />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//         </tbody>
//       </table>
//       }
//       {data.length === 0 && (
//         <div className="p-4">
//           {/* <NoDataFound /> */}
//           <p className="text-xl text-orange-800">Please apply the filter based on the selected date.</p>
//         </div>
//       )}
//     </div>
//   );

//   // Pagination controls
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const totalItems =
//     activeTab === "single"
//       ? filteredFeeHistory.length
//       : filteredUnifiedFeeHistory.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
// console.log("totalPages",totalPages)
//   // const renderPagination = () => (
//   //   <div className="flex justify-center mt-4">
//   //     <button
//   //       onClick={() => handlePageChange(currentPage - 1)}
//   //       disabled={currentPage === 1}
//   //       className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//   //     >
//   //       Previous
//   //     </button>
//   //     {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//   //       <button
//   //         key={page}
         
//   //         onClick={() => handlePageChange(page)}
//   //         className={`px-3 py-1 mx-1 rounded ${
//   //           currentPage === page
//   //             ? "bg-blue-500 text-white"
//   //             : "bg-gray-200 hover:bg-gray-300"
//   //         }`}
//   //       > {console.log("page",page)}
//   //         {page}
//   //       </button>
//   //     ))}
//   //     <button
//   //       onClick={() => handlePageChange(currentPage + 1)}
//   //       disabled={currentPage === totalPages}
//   //       className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//   //     >
//   //       Next
//   //     </button>
//   //   </div>
//   // );

//   return (
//     <div className="">
//         <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Fee History"/>
//       {/* Tabs for Single and Unified Receipts */}
//      <div className="bg-white p-2 rounded-lg shadow border border-gray-200">
//      <div className="mb-4">
//         <div className="flex border-b border-gray-200">
//           <button
//             className={`px-4 py-2 font-medium ${
//               activeTab === "single"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => {
//               setActiveTab("single");
//               setCurrentPage(1);
//             }}
//           >
//             Single Receipts
//           </button>
//           <button
//             className={`px-4 py-2 font-medium ${
//               activeTab === "unified"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => {
//               setActiveTab("unified");
//               setCurrentPage(1);
//             }}
//           >
//             Unified Receipts
//           </button>
//         </div>
//       </div>

//       {/* Date Filters and Buttons */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-2">
//         <ReactInput
//           type="date"
//           label="Start Date"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//           containerClassName="flex-1 min-w-[150px]"
//         />
//         <ReactInput
//           type="date"
//           label="End Date"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//           containerClassName="flex-1 min-w-[150px]"
//         />
//         <div className="flex gap-2 items-end">
//           <Button
//             name="Filter"
//             onClick={handleDateFilter}
//             color="green"
//             className="bg-green-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//           />
//           <Button
//             name="Clear"
//             color="gray"
//             onClick={clearDateFilter}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//           />
//           <Button
//             name="Download Report"
//             onClick={handleDownloadPdf}
//             className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
//             icon={<FaFileAlt />}
//           />
//         </div>
//       </div>
//      </div>

//       {/* Payment Summary Section */}
//       <div className="bg-white p-2 rounded-lg shadow border border-gray-200">
//         <h3 className="text-sm font-semibold mb-2">Payment Summary</h3>
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
//           <div>
//             <p className="text-sm text-gray-600">Cash</p>
//             <p className="font-medium">₹{cashPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Online</p>
//             <p className="font-medium">₹{onlinePayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Cheque</p>
//             <p className="font-medium">₹{chequePayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Card</p>
//             <p className="font-medium">₹{cardPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Other</p>
//             <p className="font-medium">₹{otherPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Paid</p>
//             <p className="font-semibold text-green-600">
//               ₹
//               {overallTotalPaid(
//                 activeTab === "single"
//                   ? filteredFeeHistory
//                   : filteredUnifiedFeeHistory
//               ).toFixed(2)}
//             </p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Dues</p>
//             <p className="font-semibold text-red-600">
//               ₹
//               {overallTotalDuesSum(
//                 activeTab === "single"
//                   ? filteredFeeHistory
//                   : filteredUnifiedFeeHistory
//               ).toFixed(2)}
//             </p>
//           </div>
//         </div>
       
       
//       </div>

//       {/* Render Table Based on Active Tab */}
//       {activeTab === "single"
//         ? renderTable(filteredFeeHistory, false)
//         : renderTable(filteredUnifiedFeeHistory, true)}

//       {/* Pagination */}
//       {/* {totalItems > 0 && renderPagination()} */}

//       {/* Fee Details Modal */}
//       <Modal
//         isOpen={isOpen}
//         setIsOpen={setIsOpen}
//         title="Fee Details"
//         maxWidth="lg"
//       >
//         <div className="p-4">
//           {modalData && (
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-semibold text-lg">Student Information</h3>
//                 <p>
//                   <strong>Name:</strong>{" "}
//                   {modalData.studentName ||
//                     modalData.students?.map((s) => s.studentName).join(", ") ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Admission No:</strong>{" "}
//                   {modalData.admissionNumber ||
//                     modalData.students
//                       ?.map((s) => s.admissionNumber)
//                       .join(", ") ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Parent Name:</strong>{" "}
//                   {modalData.parentName || modalData.fatherName || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Class:</strong>{" "}
//                   {modalData.studentClass ||
//                     modalData.students?.map((s) => s.class).join(", ") ||
//                     "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-lg">Payment Details</h3>
//                 <p>
//                   <strong>Receipt No:</strong>{" "}
//                   {modalData.feeReceiptNumber ||
//                     modalData.unifiedReceiptNumber ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Date:</strong>{" "}
//                   {modalData.date
//                     ? format(parseISO(modalData.date), "dd/MM/yyyy")
//                     : "N/A"}
//                 </p>
//                 <p>
//                   <strong>Payment Mode:</strong>{" "}
//                   {modalData.paymentMode || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Transaction ID:</strong>{" "}
//                   {modalData.transactionId || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Total Paid:</strong> ₹{modalData.totalAmountPaid || 0}
//                 </p>
//                 <p>
//                   <strong>Total Dues:</strong> ₹{modalData.totalDues || 0}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-lg">Fee Breakdown</h3>
//                 <table className="w-full text-sm border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="p-2 border">Type</th>
//                       <th className="p-2 border">Month</th>
//                       <th className="p-2 border">Amount</th>
//                       <th className="p-2 border">Dues</th>
//                       <th className="p-2 border">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {modalData.regularFees?.map((fee, index) => (
//                       <tr key={`reg-${index}`}>
//                         <td className="p-2 border">Class Fee</td>
//                         <td className="p-2 border">{fee.month || "N/A"}</td>
//                         <td className="p-2 border">₹{fee.paidAmount || 0}</td>
//                         <td className="p-2 border">₹{fee.dueAmount || 0}</td>
//                         <td className="p-2 border">
//                           {fee.status || "Unknown"}
//                         </td>
//                       </tr>
//                     ))}
//                     {modalData.additionalFees?.map((fee, index) => (
//                       <tr key={`add-${index}`}>
//                         <td className="p-2 border">{fee.name || "N/A"}</td>
//                         <td className="p-2 border">{fee.month || "N/A"}</td>
//                         <td className="p-2 border">₹{fee.paidAmount || 0}</td>
//                         <td className="p-2 border">₹{fee.dueAmount || 0}</td>
//                         <td className="p-2 border">
//                           {fee.status || "Unknown"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//           <div className="mt-6 flex justify-end">
//             <Button
//               name="Close"
//               onClick={toggleModal}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* Cancel Confirmation Modal */}
//       <Modal
//         isOpen={cancel}
//         setIsOpen={setCancel}
//         title="Confirm Cancellation"
//         maxWidth="sm"
//       >
//         <div className="p-4">
//           <p className="mb-4 text-gray-700">
//             Are you sure you want to cancel the fee payment for receipt{" "}
//             <strong>
//               {cancelData?.feeReceiptNumber ||
//                 cancelData?.unifiedReceiptNumber ||
//                 "N/A"}
//             </strong>
//             ?
//           </p>
//           <div className="flex gap-4 justify-end">
//             <Button
//               name="Confirm"
//               onClick={cancelFee}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
//             />
//             <Button
            
//               name="Cancel"
//               onClick={() => setCancel(false)}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* Receipt Preview Modal */}
//       <Modal
//         isOpen={receiptModalOpen}
//         setIsOpen={setReceiptModalOpen}
//         title={
//           activeTab === "single"
//             ? "Single Receipt Preview"
//             : "Unified Receipt Preview"
//         }
//         maxWidth="lg"
//       >
//         <div className="p-4">
//           {receiptData && isPreviewReady ? (
//             <FeeRecipt
//               modalData={receiptData} // Pass full response object
//               isUnified={receiptData.data.isUnified} // Pass isUnified flag
//               handleCloseModal={handleCloseReceiptModal}
//             />
//           ) : (
//             <p className="text-gray-600">Loading receipt preview...</p>
//           )}
//           {/* Additional controls for consistency, though FeeRecipt handles printing */}
//           <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
//             <Button
//               type="button"
//               name="Print Receipt"
//               onClick={() => {
//                 // Trigger FeeRecipt's internal print; modal closes via handleCloseModal
//                 document.querySelector(".print-button")?.click();
//               }}
//               className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//               disabled={!isPreviewReady}
//             />
//             <Button
//               type="button"
//               name="Download PDF"
//               onClick={() => {
//                 // Trigger FeeRecipt's internal download; modal closes via handleCloseModal
//                 document.querySelector(".print-button")?.click();
//               }}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//               disabled={!isPreviewReady}
//             />
//             <Button
//               type="button"
//               name="Close"
//               onClick={handleCloseReceiptModal}
//               className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Table;







// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import FeeRecipt from "./FeeRecipt";
// import NoDataFound from "../../NoDataFound";
// import { format, parseISO } from "date-fns";
// import { FaEye, FaPrint, FaFileAlt, FaShareAlt } from "react-icons/fa";
// import { cancelFeePayment, feesfeeHistory } from "../../Network/AdminApi";
// import { toast } from "react-toastify";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import Modal from "../../Dynamic/Modal";
// import Button from "../../Dynamic/utils/Button";
// import moment from "moment";
// import { FeeReceipt } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";
// import axios from "axios";

// const Table = ({ reLoad }) => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { currentColor, setIsLoader } = useStateContext();
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const [unifiedFeeHistory, setUnifiedFeeHistory] = useState([]);
//   const [filteredUnifiedFeeHistory, setFilteredUnifiedFeeHistory] = useState(
//     []
//   );
//   console.log("feeHistory",feeHistory)
//   // console.log("filteredUnifiedFeeHistory",filteredUnifiedFeeHistory)
//   const [receiptModalOpen, setReceiptModalOpen] = useState(false);
//   const [totalPage, setTotalPage] = useState(false);
//   const [receiptData, setReceiptData] = useState(null);
//   const authToken = localStorage.getItem("token");
//   const [activeTab, setActiveTab] = useState("single");
//   const [isPreviewReady, setIsPreviewReady] = useState(false);
//   // const [session, setSession] = useState(user?.session || "");

//   // Date filter state
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [cancel, setCancel] = useState(false);
//   const [feeDetails, setFeeDetails] = useState([]);
//   const [unifiedFeeDetails, setUnifiedFeeDetails] = useState([]);
//   const [startDate, setStartDate] = useState(getCurrentDate());
//   const [endDate, setEndDate] = useState(getCurrentDate());
//   const [cancelData, setCancelData] = useState({});

//   // Modal toggles
//   const toggleModal = () => setIsOpen(!isOpen);
//   const toggleReceiptModal = () => setReceiptModalOpen(!receiptModalOpen);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   // Fetch data on reload or session change
//   useEffect(() => {
//     getFeeHistory();
//     getUnifiedFeeHistory();
//   }, [reLoad, session]);

//   const getFeeHistory = async (currentPage=1) => {
//     setIsLoader(true);
//     const page=2
//     let limit=30
//     try {
//       const response = await feesfeeHistory(currentPage,limit);
//       if (response?.success) {
       
//         setTotalPage(response?.totalPages)
//         console.log("response",response)
//         const singleReceipts = response?.data.filter((fee) => !fee.isUnified);
//         setFeeHistory(singleReceipts);
//         setFilteredFeeHistory(singleReceipts);
//       } else {
//         toast.error(response?.message || "Failed to fetch single receipts");
//       }
//     } catch (error) {
//       console.error("Error fetching single receipts:", error);
//       toast.error("Error fetching single receipts: " + error.message);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const getUnifiedFeeHistory = async () => {
//     // setIsLoader(true);  
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/unified-receipts?session=${session}`,
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//           withCredentials: true,
//         }
//       );
//       if (response.data.success) {
//         setUnifiedFeeHistory(response.data.data);
//         setFilteredUnifiedFeeHistory(response.data.data);
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch unified receipts"
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching unified receipts:", error);
//       toast.error("Error fetching unified receipts: " + error.message);
//     } finally {
//       // setIsLoader(false);
//     }
//   };

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   // Date filtering
//   const handleDateFilter = () => {
//     const filteredSingle = feeHistory.filter((fee) => {
//       const feeDate = moment(fee.date).format("DD-MM-YYYY");
//       return (
//         feeDate >= moment(startDate).format("DD-MM-YYYY") &&
//         feeDate <= moment(endDate).format("DD-MM-YYYY")
//       );
//     });
//     const filteredUnified = unifiedFeeHistory.filter((fee) => {
//       const feeDate = moment(fee.date).format("DD-MM-YYYY");
//       return (
//         feeDate >= moment(startDate).format("DD-MM-YYYY") &&
//         feeDate <= moment(endDate).format("DD-MM-YYYY")
//       );
//     });
//     setFilteredFeeHistory(filteredSingle);
//     setFilteredUnifiedFeeHistory(filteredUnified);
//     setCurrentPage(1);
//   };

//   const clearDateFilter = () => {
//     setStartDate(getCurrentDate());
//     setEndDate(getCurrentDate());
//     setFilteredFeeHistory(feeHistory);
//     setFilteredUnifiedFeeHistory(unifiedFeeHistory);
//     setCurrentPage(1);
//   };

//   // Cancel fee logic
//   const cancelFee = async () => {
//     const payload = {
//       studentId: cancelData?.studentId,
//       feeReceiptNumber:
//         cancelData?.feeReceiptNumber || cancelData?.unifiedReceiptNumber,
//     };
//     try {
//       const response = await cancelFeePayment(payload);
//       if (response?.success) {
//         setCancel(false);
//         toast.success(response?.message);
//         getFeeHistory();
//         getUnifiedFeeHistory();
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.error("Error cancelling fee:", error);
//       toast.error("Error cancelling fee: " + error.message);
//     }
//   };

//   const handleCancel = (val) => {
//     setCancelData(val);
//     setCancel(true);
//   };

//   // Fetch and display receipt
//   const handleViewReceipt = async (fees) => {
//     try {
//       const receiptNumber = fees.feeReceiptNumber || fees.unifiedReceiptNumber;
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`,
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         // Store the full response object, including 'success' and 'data'
//         setReceiptData(response.data);
//         setIsPreviewReady(true);
//         setReceiptModalOpen(true);
//       } else {
//         toast.error("Failed to fetch receipt data.");
//         setIsPreviewReady(false);
//       }
//     } catch (error) {
//       console.error("Error fetching receipt:", error);
//       toast.error("Error fetching receipt data: " + error.message);
//       setIsPreviewReady(false);
//     }
//   };

//   // Handle receipt modal close
//   const handleCloseReceiptModal = () => {
//     // Simply close the modal; FeeRecipt handles print/download internally
//     setReceiptModalOpen(false);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//   };

//   // Format fee details for display
//   useEffect(() => {
//     if (Array.isArray(feeHistory)) {
//       const updatedFeeHistory = filteredFeeHistory.map((item) => ({
//         ...item,
//         month: item?.regularFees?.map((val) => val?.month).join(", ") || "",
//         feeStatus:
//           item?.regularFees?.map((val) => val?.status).join(", ") || "",
//       }));
//       setFeeDetails(updatedFeeHistory);
//     }
//     if (Array.isArray(unifiedFeeHistory)) {
//       const updatedUnifiedFeeHistory = filteredUnifiedFeeHistory.map(
//         (item) => ({
//           ...item,
//           month: item?.regularFees?.map((val) => val?.month).join(", ") || "",
//           feeStatus:
//             item?.regularFees?.map((val) => val?.status).join(", ") || "",
//           studentName:
//             item?.students?.map((s) => s.studentName).join(", ") || "",
//           admissionNumber:
//             item?.students?.map((s) => s.admissionNumber).join(", ") || "",
//           studentClass: item?.students?.map((s) => s.class).join(", ") || "",
//         })
//       );
//       setUnifiedFeeDetails(updatedUnifiedFeeHistory);
//     }
//   }, [filteredFeeHistory, filteredUnifiedFeeHistory]);

//   // Payment totals calculation
//   const totalsByMode = (data) => {
//     return data.reduce(
//       (accumulator, item) => {
//         const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
//         const mode = item?.paymentMode?.toLowerCase() || "other";
//         switch (mode) {
//           case "cash":
//             accumulator.cash += amountPaid;
//             break;
//           case "online":
//             accumulator.online += amountPaid;
//             break;
//           case "cheque":
//             accumulator.cheque += amountPaid;
//             break;
//           case "card":
//             accumulator.card += amountPaid;
//             break;
//           default:
//             accumulator.other += amountPaid;
//             break;
//         }
//         return accumulator;
//       },
//       { cash: 0, online: 0, cheque: 0, card: 0, other: 0 }
//     );
//   };

//   const overallTotalPaid = (data) => {
//     return data.reduce((sum, item) => {
//       const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
//       return sum + amountPaid;
//     }, 0);
//   };

//   const overallTotalDuesSum = (data) => {
//     return data.reduce((sum, item) => {
//       const duesValue = parseFloat(item?.totalDues) || 0;
//       return sum + duesValue;
//     }, 0);
//   };

//   const singleTotals = totalsByMode(filteredFeeHistory);
//   const unifiedTotals = totalsByMode(filteredUnifiedFeeHistory);
//   const cashPayment =
//     activeTab === "single" ? singleTotals.cash : unifiedTotals.cash;
//   const onlinePayment =
//     activeTab === "single" ? singleTotals.online : unifiedTotals.online;
//   const chequePayment =
//     activeTab === "single" ? singleTotals.cheque : unifiedTotals.cheque;
//   const cardPayment =
//     activeTab === "single" ? singleTotals.card : unifiedTotals.card;
//   const otherPayment =
//     activeTab === "single" ? singleTotals.other : unifiedTotals.other;

//   // Download report as PDF
//   const handleDownloadPdf = () => {
//     const data = activeTab === "single" ? feeDetails : unifiedFeeDetails;
//     const columns = [
//       {
//         header: "Rcpt No.",
//         dataKey:
//           activeTab === "single" ? "feeReceiptNumber" : "unifiedReceiptNumber",
//       },
//       { header: "Date", dataKey: "date" },
//       { header: "Admission No.", dataKey: "admissionNumber" },
//       { header: "Student", dataKey: "studentName" },
//       {
//         header: "Parent Name",
//         dataKey: activeTab === "single" ? "fatherName" : "parentName",
//       },
//       { header: "Class", dataKey: "studentClass" },
//       { header: "Mode", dataKey: "paymentMode" },
//       { header: "TID", dataKey: "transactionId" },
//       { header: "Month", dataKey: "month" },
//       { header: "Fee Amount", dataKey: "totalFeeAmount" },
      
//       { header: "Paid", dataKey: "totalAmountPaid" },
      
//       { header: "Dues", dataKey: "totalDues" },
//       { header: "Status", dataKey: "feeStatus" },
//     ];
//     generatePdf(
//       data,
//       columns,
//       overallTotalPaid(
//         activeTab === "single" ? filteredFeeHistory : filteredUnifiedFeeHistory
//       ),
//       overallTotalDuesSum(
//         activeTab === "single" ? filteredFeeHistory : filteredUnifiedFeeHistory
//       ),
//       cashPayment,
//       onlinePayment,
//       chequePayment,
//       cardPayment,
//       activeTab === "single" ? "single-report.pdf" : "unified-report.pdf"
//     );
//   };

//   // Render table for single or unified receipts
//   const renderTable = (data, isUnified = false) => (
//     <div className="relative md:max-h-screen overflow-x-auto shadow-md sm:rounded-lg">
//       <table className="w-full border text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//         <thead
//           style={{
//             background: currentColor,
//             color: "white",
//             whiteSpace: "nowrap",
//           }}
//           className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
//         >
//           <tr>
//             <th scope="col" className="px-1 py-1">
//               S No.
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Adm No.
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Name
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Parent Name
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Class
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Receipt No.
//             </th>
//             {/* <th scope="col" className="px-1 py-1">
//               Regular Fee
//             </th> */}
//             <th scope="col" className="px-1 py-1">
//               Pay Date
//             </th>
//             <th scope="col" className="px-1 py-1">
//             Fee Amount
//             </th>
          
            
//             <th scope="col" className="px-1 py-1">
//               Paid
//             </th>
//             <th scope="col" className="px-1 py-1">
//             Concession
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Dues
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Action
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Share
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Cancel Fee
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Receipt
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {data &&
//             data.slice(indexOfFirstItem, indexOfLastItem).map((fees, index) => (
//               <tr
//                 key={index}
//                 className={`${
//                   fees.status === "canceled" ? "bg-[#a53c3c66]" : ""
//                 } border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`}
//                 style={{ color: "black" }}
//               >
//                 <td className="px-1 py-1 border font-bold">
//                   {index + 1 + (currentPage - 1) * itemsPerPage}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.admissionNumber).join(", ") ||
//                       "N/A"
//                     : fees.admissionNumber || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.studentName).join(", ") ||
//                       "N/A"
//                     : fees.studentName || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.parentName || "N/A"
//                     : fees.fatherName || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.class).join(", ") || "N/A"
//                     : fees.studentClass || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.unifiedReceiptNumber
//                     : fees.feeReceiptNumber}
//                 </td>
//                 {/* <td className="px-2">
//                   <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-1 overflow-x-auto">
//                     <div className="inline-block min-w-full rounded-lg overflow-hidden">
//                       {fees.regularFees?.length > 0 ||
//                       fees.additionalFees?.length > 0 ? (
//                         <table className="min-w-full leading-normal">
//                           <thead>
//                             <tr>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Name
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Month
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Amount
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Dues
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Status
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {fees.regularFees?.map((addFee, i) => (
//                               <tr key={`reg-${index}-${i}`}>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     Class Fee
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.month || "N/A"}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.paidAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.dueAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                     <span
//                                       aria-hidden
//                                       className="absolute inset-0 opacity-50 rounded-full"
//                                     ></span>
//                                     <span
//                                       className={`${
//                                         addFee.status === "Paid"
//                                           ? "text-green-600"
//                                           : "text-red-600"
//                                       }`}
//                                     >
//                                       {addFee.status || "Unknown"}
//                                     </span>
//                                   </span>
//                                 </td>
//                               </tr>
//                             ))}
//                             {fees.additionalFees?.map((addFee, i) => (
//                               <tr key={`add-${index}-${i}`}>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.name || "N/A"}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
                                 
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.paidAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.dueAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                     <span
//                                       aria-hidden
//                                       className="absolute inset-0 opacity-50 rounded-full"
//                                     ></span>
//                                     <span
//                                       className={`${
//                                         addFee.status === "Paid"
//                                           ? "text-green-600"
//                                           : "text-red-600"
//                                       }`}
//                                     >
//                                       {addFee.status || "Unknown"}
//                                     </span>
//                                   </span>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       ) : (
//                         <h1 className="text-center text-gray-600">
//                           No Fee Details
//                         </h1>
//                       )}
//                     </div>
//                   </div>
//                 </td> */}
//                 <td className="px-2 py-4">
//                   {fees.date
//                     ? format(parseISO(fees.date), "dd/MM/yyyy")
//                     : "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border ">{fees.totalFeeAmount || 0}</td>
//                 <td className="px-1 py-1 border">{fees.totalAmountPaid || 0}</td>
//                 <td className="px-1 py-1 border">{fees.concessionApplied || 0}</td>
//                 <td className="px-1 py-1 border">{fees.totalDues || 0}</td>
             
//                 <td className="px-1 py-1">
//                   <a
//                     onClick={() => {
//                       setModalData(fees);
//                       toggleModal();
//                     }}
//                     className="font-bold text-green-700 flex align-middle cursor-pointer hover:underline mr-2"
//                   >
//                     <FaEye className="text-2xl" />
//                   </a>
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="Share"
//                     color="green"
//                     onClick={() => FeeReceipt(fees)}
//                     disabled={fees.status === "canceled"}
//                   >
//                     <FaShareAlt className="text-2xl" />
//                   </Button>
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="Cancel"
//                     onClick={() => handleCancel(fees)}
//                     className={`text-red-600 font-bold cursor-pointer dark:text-red-500 hover:underline ${
//                       fees.status === "canceled"
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                     disabled={fees.status === "canceled"}
//                     color="red"
//                   />
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="View Receipt"
//                     color="blue"
//                     onClick={() => handleViewReceipt(fees)}
//                     // disabled={fees.status === "canceled"}
//                   >
//                     <FaFileAlt className="text-2xl" />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//         </tbody>
//       </table>
//       {data.length === 0 && (
//         <div className="p-4">
//           <NoDataFound />
//         </div>
//       )}
//     </div>
//   );

//   // Pagination controls
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//     getFeeHistory(pageNumber)
    
//   };

//   const totalItems =
//     activeTab === "single"
//       ? filteredFeeHistory.length
//       : filteredUnifiedFeeHistory.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
// console.log("totalPages",totalPages)
//   const renderPagination = () => (
//     <div className="flex justify-center mt-4">
//       <button
//         onClick={() => handlePageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//       >
//         Previous
//       </button>
//       {Array.from({ length: totalPage }, (_, i) => i + 1).map((page) => (
//       // {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//         <button
//           key={page}
         
//           onClick={() => handlePageChange(page)}
//           className={`px-3 py-1 mx-1 rounded ${
//             currentPage === page
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 hover:bg-gray-300"
//           }`}
//         > {console.log("page",page)}
//           {page}
//         </button>
//       ))}
//       <button
//         onClick={() => handlePageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//       >
//         Next
//       </button>
//     </div>
//   );

//   return (
//     <div className="px-4">
//       {/* Tabs for Single and Unified Receipts */}
//       <div className="mb-4">
//         <div className="flex border-b border-gray-200">
//           <button
//             className={`px-4 py-2 font-medium ${
//               activeTab === "single"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => {
//               setActiveTab("single");
//               setCurrentPage(1);
//             }}
//           >
//             Single Receipts
//           </button>
//           <button
//             className={`px-4 py-2 font-medium ${
//               activeTab === "unified"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => {
//               setActiveTab("unified");
//               setCurrentPage(1);
//             }}
//           >
//             Unified Receipts
//           </button>
//         </div>
//       </div>

//       {/* Date Filters and Buttons */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-2">
//         <ReactInput
//           type="date"
//           label="Start Date"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//           containerClassName="flex-1 min-w-[150px]"
//         />
//         <ReactInput
//           type="date"
//           label="End Date"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//           containerClassName="flex-1 min-w-[150px]"
//         />
//         <div className="flex gap-2 items-end">
//           <Button
//             name="Filter"
//             onClick={handleDateFilter}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//           />
//           <Button
//             name="Clear"
//             onClick={clearDateFilter}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//           />
//           <Button
//             name="Download Report"
//             onClick={handleDownloadPdf}
//             className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
//             icon={<FaFileAlt />}
//           />
//         </div>
//       </div>

//       {/* Payment Summary Section */}
//       <div className="mb-4 rounded-lg">
//         <h3 className="text-sm font-semibold mb-2">Payment Summary</h3>
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
//           <div>
//             <p className="text-sm text-gray-600">Cash</p>
//             <p className="font-medium">₹{cashPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Online</p>
//             <p className="font-medium">₹{onlinePayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Cheque</p>
//             <p className="font-medium">₹{chequePayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Card</p>
//             <p className="font-medium">₹{cardPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Other</p>
//             <p className="font-medium">₹{otherPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Paid</p>
//             <p className="font-semibold text-green-600">
//               ₹
//               {overallTotalPaid(
//                 activeTab === "single"
//                   ? filteredFeeHistory
//                   : filteredUnifiedFeeHistory
//               ).toFixed(2)}
//             </p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Dues</p>
//             <p className="font-semibold text-red-600">
//               ₹
//               {overallTotalDuesSum(
//                 activeTab === "single"
//                   ? filteredFeeHistory
//                   : filteredUnifiedFeeHistory
//               ).toFixed(2)}
//             </p>
//           </div>
//         </div>
       
       
//       </div>

//       {/* Render Table Based on Active Tab */}
//       {activeTab === "single"
//         ? renderTable(filteredFeeHistory, false)
//         : renderTable(filteredUnifiedFeeHistory, true)}

//       {/* Pagination */}
//       {totalItems > 0 && renderPagination()}

//       {/* Fee Details Modal */}
//       <Modal
//         isOpen={isOpen}
//         setIsOpen={setIsOpen}
//         title="Fee Details"
//         maxWidth="lg"
//       >
//         <div className="p-4">
//           {modalData && (
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-semibold text-lg">Student Information</h3>
//                 <p>
//                   <strong>Name:</strong>{" "}
//                   {modalData.studentName ||
//                     modalData.students?.map((s) => s.studentName).join(", ") ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Admission No:</strong>{" "}
//                   {modalData.admissionNumber ||
//                     modalData.students
//                       ?.map((s) => s.admissionNumber)
//                       .join(", ") ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Parent Name:</strong>{" "}
//                   {modalData.parentName || modalData.fatherName || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Class:</strong>{" "}
//                   {modalData.studentClass ||
//                     modalData.students?.map((s) => s.class).join(", ") ||
//                     "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-lg">Payment Details</h3>
//                 <p>
//                   <strong>Receipt No:</strong>{" "}
//                   {modalData.feeReceiptNumber ||
//                     modalData.unifiedReceiptNumber ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Date:</strong>{" "}
//                   {modalData.date
//                     ? format(parseISO(modalData.date), "dd/MM/yyyy")
//                     : "N/A"}
//                 </p>
//                 <p>
//                   <strong>Payment Mode:</strong>{" "}
//                   {modalData.paymentMode || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Transaction ID:</strong>{" "}
//                   {modalData.transactionId || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Total Paid:</strong> ₹{modalData.totalAmountPaid || 0}
//                 </p>
//                 <p>
//                   <strong>Total Dues:</strong> ₹{modalData.totalDues || 0}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-lg">Fee Breakdown</h3>
//                 <table className="w-full text-sm border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="p-2 border">Type</th>
//                       <th className="p-2 border">Month</th>
//                       <th className="p-2 border">Amount</th>
//                       <th className="p-2 border">Dues</th>
//                       <th className="p-2 border">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {modalData.regularFees?.map((fee, index) => (
//                       <tr key={`reg-${index}`}>
//                         <td className="p-2 border">Class Fee</td>
//                         <td className="p-2 border">{fee.month || "N/A"}</td>
//                         <td className="p-2 border">₹{fee.paidAmount || 0}</td>
//                         <td className="p-2 border">₹{fee.dueAmount || 0}</td>
//                         <td className="p-2 border">
//                           {fee.status || "Unknown"}
//                         </td>
//                       </tr>
//                     ))}
//                     {modalData.additionalFees?.map((fee, index) => (
//                       <tr key={`add-${index}`}>
//                         <td className="p-2 border">{fee.name || "N/A"}</td>
//                         <td className="p-2 border">{fee.month || "N/A"}</td>
//                         <td className="p-2 border">₹{fee.paidAmount || 0}</td>
//                         <td className="p-2 border">₹{fee.dueAmount || 0}</td>
//                         <td className="p-2 border">
//                           {fee.status || "Unknown"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//           <div className="mt-6 flex justify-end">
//             <Button
//               name="Close"
//               onClick={toggleModal}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* Cancel Confirmation Modal */}
//       <Modal
//         isOpen={cancel}
//         setIsOpen={setCancel}
//         title="Confirm Cancellation"
//         maxWidth="sm"
//       >
//         <div className="p-4">
//           <p className="mb-4 text-gray-700">
//             Are you sure you want to cancel the fee payment for receipt{" "}
//             <strong>
//               {cancelData?.feeReceiptNumber ||
//                 cancelData?.unifiedReceiptNumber ||
//                 "N/A"}
//             </strong>
//             ?
//           </p>
//           <div className="flex gap-4 justify-end">
//             <Button
//               name="Confirm"
//               onClick={cancelFee}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
//             />
//             <Button
            
//               name="Cancel"
//               onClick={() => setCancel(false)}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* Receipt Preview Modal */}
//       <Modal
//         isOpen={receiptModalOpen}
//         setIsOpen={setReceiptModalOpen}
//         title={
//           activeTab === "single"
//             ? "Single Receipt Preview"
//             : "Unified Receipt Preview"
//         }
//         maxWidth="lg"
//       >
//         <div className="p-4">
//           {receiptData && isPreviewReady ? (
//             <FeeRecipt
//               modalData={receiptData} // Pass full response object
//               isUnified={receiptData.data.isUnified} // Pass isUnified flag
//               handleCloseModal={handleCloseReceiptModal}
//             />
//           ) : (
//             <p className="text-gray-600">Loading receipt preview...</p>
//           )}
//           {/* Additional controls for consistency, though FeeRecipt handles printing */}
//           <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
//             <Button
//               type="button"
//               name="Print Receipt"
//               onClick={() => {
//                 // Trigger FeeRecipt's internal print; modal closes via handleCloseModal
//                 document.querySelector(".print-button")?.click();
//               }}
//               className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//               disabled={!isPreviewReady}
//             />
//             <Button
//               type="button"
//               name="Download PDF"
//               onClick={() => {
//                 // Trigger FeeRecipt's internal download; modal closes via handleCloseModal
//                 document.querySelector(".print-button")?.click();
//               }}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//               disabled={!isPreviewReady}
//             />
//             <Button
//               type="button"
//               name="Close"
//               onClick={handleCloseReceiptModal}
//               className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Table;


// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import FeeRecipt from "./FeeRecipt";
// import NoDataFound from "../../NoDataFound";
// import { format, parseISO } from "date-fns";
// import { FaEye, FaPrint, FaFileAlt, FaShareAlt } from "react-icons/fa";
// import { cancelFeePayment, feesfeeHistory } from "../../Network/AdminApi";
// import { toast } from "react-toastify";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import Modal from "../../Dynamic/Modal";
// import Button from "../../Dynamic/utils/Button";
// import moment from "moment";
// import { FeeReceipt } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";
// import axios from "axios";

// const Table = ({ reLoad }) => {
//   const user = JSON.parse(localStorage.getItem("user"));
//   const { currentColor, setIsLoader } = useStateContext();
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const [unifiedFeeHistory, setUnifiedFeeHistory] = useState([]);
//   const [filteredUnifiedFeeHistory, setFilteredUnifiedFeeHistory] = useState(
//     []
//   );
//   const [receiptModalOpen, setReceiptModalOpen] = useState(false);
//   const [receiptData, setReceiptData] = useState(null);
//   const authToken = localStorage.getItem("token");
//   const [activeTab, setActiveTab] = useState("single");
//   const [isPreviewReady, setIsPreviewReady] = useState(false);
//   const [session, setSession] = useState(user?.session || "");

//   // Date filter state
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const [cancel, setCancel] = useState(false);
//   const [feeDetails, setFeeDetails] = useState([]);
//   const [unifiedFeeDetails, setUnifiedFeeDetails] = useState([]);
//   const [startDate, setStartDate] = useState(getCurrentDate());
//   const [endDate, setEndDate] = useState(getCurrentDate());
//   const [cancelData, setCancelData] = useState({});

//   // Modal toggles
//   const toggleModal = () => setIsOpen(!isOpen);
//   const toggleReceiptModal = () => setReceiptModalOpen(!receiptModalOpen);

//   // Pagination state
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   // Fetch data on reload or session change
//   useEffect(() => {
//     getFeeHistory();
//     getUnifiedFeeHistory();
//   }, [reLoad, session]);

//   const getFeeHistory = async () => {
//     setIsLoader(true);
//     try {
//       const response = await feesfeeHistory();
//       if (response?.success) {
//         const singleReceipts = response?.data.filter((fee) => !fee.isUnified);
//         setFeeHistory(singleReceipts);
//         setFilteredFeeHistory(singleReceipts);
//       } else {
//         toast.error(response?.message || "Failed to fetch single receipts");
//       }
//     } catch (error) {
//       console.error("Error fetching single receipts:", error);
//       toast.error("Error fetching single receipts: " + error.message);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const getUnifiedFeeHistory = async () => {
//     // setIsLoader(true);  
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/unified-receipts?session=${session}`,
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//           withCredentials: true,
//         }
//       );
//       if (response.data.success) {
//         setUnifiedFeeHistory(response.data.data);
//         setFilteredUnifiedFeeHistory(response.data.data);
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch unified receipts"
//         );
//       }
//     } catch (error) {
//       console.error("Error fetching unified receipts:", error);
//       toast.error("Error fetching unified receipts: " + error.message);
//     } finally {
//       // setIsLoader(false);
//     }
//   };

//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;

//   // Date filtering
//   const handleDateFilter = () => {
//     const filteredSingle = feeHistory.filter((fee) => {
//       const feeDate = moment(fee.date).format("DD-MM-YYYY");
//       return (
//         feeDate >= moment(startDate).format("DD-MM-YYYY") &&
//         feeDate <= moment(endDate).format("DD-MM-YYYY")
//       );
//     });
//     const filteredUnified = unifiedFeeHistory.filter((fee) => {
//       const feeDate = moment(fee.date).format("DD-MM-YYYY");
//       return (
//         feeDate >= moment(startDate).format("DD-MM-YYYY") &&
//         feeDate <= moment(endDate).format("DD-MM-YYYY")
//       );
//     });
//     setFilteredFeeHistory(filteredSingle);
//     setFilteredUnifiedFeeHistory(filteredUnified);
//     setCurrentPage(1);
//   };

//   const clearDateFilter = () => {
//     setStartDate(getCurrentDate());
//     setEndDate(getCurrentDate());
//     setFilteredFeeHistory(feeHistory);
//     setFilteredUnifiedFeeHistory(unifiedFeeHistory);
//     setCurrentPage(1);
//   };

//   // Cancel fee logic
//   const cancelFee = async () => {
//     const payload = {
//       studentId: cancelData?.studentId,
//       feeReceiptNumber:
//         cancelData?.feeReceiptNumber || cancelData?.unifiedReceiptNumber,
//     };
//     try {
//       const response = await cancelFeePayment(payload);
//       if (response?.success) {
//         setCancel(false);
//         toast.success(response?.message);
//         getFeeHistory();
//         getUnifiedFeeHistory();
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.error("Error cancelling fee:", error);
//       toast.error("Error cancelling fee: " + error.message);
//     }
//   };

//   const handleCancel = (val) => {
//     setCancelData(val);
//     setCancel(true);
//   };

//   // Fetch and display receipt
//   const handleViewReceipt = async (fees) => {
//     try {
//       const receiptNumber = fees.feeReceiptNumber || fees.unifiedReceiptNumber;
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`,
//         {
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         // Store the full response object, including 'success' and 'data'
//         setReceiptData(response.data);
//         setIsPreviewReady(true);
//         setReceiptModalOpen(true);
//       } else {
//         toast.error("Failed to fetch receipt data.");
//         setIsPreviewReady(false);
//       }
//     } catch (error) {
//       console.error("Error fetching receipt:", error);
//       toast.error("Error fetching receipt data: " + error.message);
//       setIsPreviewReady(false);
//     }
//   };

//   // Handle receipt modal close
//   const handleCloseReceiptModal = () => {
//     // Simply close the modal; FeeRecipt handles print/download internally
//     setReceiptModalOpen(false);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//   };

//   // Format fee details for display
//   useEffect(() => {
//     if (Array.isArray(feeHistory)) {
//       const updatedFeeHistory = filteredFeeHistory.map((item) => ({
//         ...item,
//         month: item?.regularFees?.map((val) => val?.month).join(", ") || "",
//         feeStatus:
//           item?.regularFees?.map((val) => val?.status).join(", ") || "",
//       }));
//       setFeeDetails(updatedFeeHistory);
//     }
//     if (Array.isArray(unifiedFeeHistory)) {
//       const updatedUnifiedFeeHistory = filteredUnifiedFeeHistory.map(
//         (item) => ({
//           ...item,
//           month: item?.regularFees?.map((val) => val?.month).join(", ") || "",
//           feeStatus:
//             item?.regularFees?.map((val) => val?.status).join(", ") || "",
//           studentName:
//             item?.students?.map((s) => s.studentName).join(", ") || "",
//           admissionNumber:
//             item?.students?.map((s) => s.admissionNumber).join(", ") || "",
//           studentClass: item?.students?.map((s) => s.class).join(", ") || "",
//         })
//       );
//       setUnifiedFeeDetails(updatedUnifiedFeeHistory);
//     }
//   }, [filteredFeeHistory, filteredUnifiedFeeHistory]);

//   // Payment totals calculation
//   const totalsByMode = (data) => {
//     return data.reduce(
//       (accumulator, item) => {
//         const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
//         const mode = item?.paymentMode?.toLowerCase() || "other";
//         switch (mode) {
//           case "cash":
//             accumulator.cash += amountPaid;
//             break;
//           case "online":
//             accumulator.online += amountPaid;
//             break;
//           case "cheque":
//             accumulator.cheque += amountPaid;
//             break;
//           case "card":
//             accumulator.card += amountPaid;
//             break;
//           default:
//             accumulator.other += amountPaid;
//             break;
//         }
//         return accumulator;
//       },
//       { cash: 0, online: 0, cheque: 0, card: 0, other: 0 }
//     );
//   };

//   const overallTotalPaid = (data) => {
//     return data.reduce((sum, item) => {
//       const amountPaid = parseFloat(item?.totalAmountPaid) || 0;
//       return sum + amountPaid;
//     }, 0);
//   };

//   const overallTotalDuesSum = (data) => {
//     return data.reduce((sum, item) => {
//       const duesValue = parseFloat(item?.totalDues) || 0;
//       return sum + duesValue;
//     }, 0);
//   };

//   const singleTotals = totalsByMode(filteredFeeHistory);
//   const unifiedTotals = totalsByMode(filteredUnifiedFeeHistory);
//   const cashPayment =
//     activeTab === "single" ? singleTotals.cash : unifiedTotals.cash;
//   const onlinePayment =
//     activeTab === "single" ? singleTotals.online : unifiedTotals.online;
//   const chequePayment =
//     activeTab === "single" ? singleTotals.cheque : unifiedTotals.cheque;
//   const cardPayment =
//     activeTab === "single" ? singleTotals.card : unifiedTotals.card;
//   const otherPayment =
//     activeTab === "single" ? singleTotals.other : unifiedTotals.other;

//   // Download report as PDF
//   const handleDownloadPdf = () => {
//     const data = activeTab === "single" ? feeDetails : unifiedFeeDetails;
//     const columns = [
//       {
//         header: "Rcpt No.",
//         dataKey:
//           activeTab === "single" ? "feeReceiptNumber" : "unifiedReceiptNumber",
//       },
//       { header: "Date", dataKey: "date" },
//       { header: "Admission No.", dataKey: "admissionNumber" },
//       { header: "Student", dataKey: "studentName" },
//       {
//         header: "Parent Name",
//         dataKey: activeTab === "single" ? "fatherName" : "parentName",
//       },
//       { header: "Class", dataKey: "studentClass" },
//       { header: "Mode", dataKey: "paymentMode" },
//       { header: "TID", dataKey: "transactionId" },
//       { header: "Month", dataKey: "month" },
//       { header: "Fee Amount", dataKey: "totalFeeAmount" },
//       { header: "Dues", dataKey: "totalDues" },
//       { header: "Paid", dataKey: "totalAmountPaid" },
//       { header: "Status", dataKey: "feeStatus" },
//     ];
//     generatePdf(
//       data,
//       columns,
//       overallTotalPaid(
//         activeTab === "single" ? filteredFeeHistory : filteredUnifiedFeeHistory
//       ),
//       overallTotalDuesSum(
//         activeTab === "single" ? filteredFeeHistory : filteredUnifiedFeeHistory
//       ),
//       cashPayment,
//       onlinePayment,
//       chequePayment,
//       cardPayment,
//       activeTab === "single" ? "single-report.pdf" : "unified-report.pdf"
//     );
//   };

//   // Render table for single or unified receipts
//   const renderTable = (data, isUnified = false) => (
//     <div className="relative md:max-h-screen overflow-x-auto shadow-md sm:rounded-lg">
//       <table className="w-full border text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//         <thead
//           style={{
//             background: currentColor,
//             color: "white",
//             whiteSpace: "nowrap",
//           }}
//           className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
//         >
//           <tr>
//             <th scope="col" className="px-1 py-1">
//               S No.
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Adm No.
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Name
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Parent Name
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Class
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Receipt No.
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Regular Fee
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Pay Date
//             </th>
//             <th scope="col" className="px-1 py-1">
//             Fee Amount
//             </th>
          
            
//             <th scope="col" className="px-1 py-1">
//               Paid
//             </th>
//             <th scope="col" className="px-1 py-1">
//             Concession
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Dues
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Action
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Share
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Cancel Fee
//             </th>
//             <th scope="col" className="px-1 py-1">
//               Receipt
//             </th>
//           </tr>
//         </thead>
//         <tbody>
//           {data &&
//             data.slice(indexOfFirstItem, indexOfLastItem).map((fees, index) => (
//               <tr
//                 key={index}
//                 className={`${
//                   fees.status === "canceled" ? "bg-[#a53c3c66]" : ""
//                 } border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`}
//                 style={{ color: "black" }}
//               >
//                 <td className="px-1 py-1 border font-bold">
//                   {index + 1 + (currentPage - 1) * itemsPerPage}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.admissionNumber).join(", ") ||
//                       "N/A"
//                     : fees.admissionNumber || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.studentName).join(", ") ||
//                       "N/A"
//                     : fees.studentName || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.parentName || "N/A"
//                     : fees.fatherName || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.students?.map((s) => s.class).join(", ") || "N/A"
//                     : fees.studentClass || "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border">
//                   {isUnified
//                     ? fees.unifiedReceiptNumber
//                     : fees.feeReceiptNumber}
//                 </td>
//                 <td className="px-2">
//                   <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-1 overflow-x-auto">
//                     <div className="inline-block min-w-full rounded-lg overflow-hidden">
//                       {fees.regularFees?.length > 0 ||
//                       fees.additionalFees?.length > 0 ? (
//                         <table className="min-w-full leading-normal">
//                           <thead>
//                             <tr>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Name
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Month
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Amount
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Dues
//                               </th>
//                               <th className="p-1 border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                 Status
//                               </th>
//                             </tr>
//                           </thead>
//                           <tbody>
//                             {fees.regularFees?.map((addFee, i) => (
//                               <tr key={`reg-${index}-${i}`}>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     Class Fee
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.month || "N/A"}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.paidAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.dueAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                     <span
//                                       aria-hidden
//                                       className="absolute inset-0 opacity-50 rounded-full"
//                                     ></span>
//                                     <span
//                                       className={`${
//                                         addFee.status === "Paid"
//                                           ? "text-green-600"
//                                           : "text-red-600"
//                                       }`}
//                                     >
//                                       {addFee.status || "Unknown"}
//                                     </span>
//                                   </span>
//                                 </td>
//                               </tr>
//                             ))}
//                             {fees.additionalFees?.map((addFee, i) => (
//                               <tr key={`add-${index}-${i}`}>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.name || "N/A"}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   {/* <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.month || "N/A"}
//                                   </p> */}
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.paidAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <p className="text-gray-900 whitespace-no-wrap">
//                                     {addFee.dueAmount || 0}
//                                   </p>
//                                 </td>
//                                 <td className="px-1 border-b border-gray-200 bg-white text-sm">
//                                   <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                     <span
//                                       aria-hidden
//                                       className="absolute inset-0 opacity-50 rounded-full"
//                                     ></span>
//                                     <span
//                                       className={`${
//                                         addFee.status === "Paid"
//                                           ? "text-green-600"
//                                           : "text-red-600"
//                                       }`}
//                                     >
//                                       {addFee.status || "Unknown"}
//                                     </span>
//                                   </span>
//                                 </td>
//                               </tr>
//                             ))}
//                           </tbody>
//                         </table>
//                       ) : (
//                         <h1 className="text-center text-gray-600">
//                           No Fee Details
//                         </h1>
//                       )}
//                     </div>
//                   </div>
//                 </td>
//                 <td className="px-2 py-4">
//                   {fees.date
//                     ? format(parseISO(fees.date), "dd/MM/yyyy")
//                     : "N/A"}
//                 </td>
//                 <td className="px-1 py-1 border ">{fees.totalFeeAmount || 0}</td>
//                 <td className="px-1 py-1 border">{fees.totalAmountPaid || 0}</td>
//                 <td className="px-1 py-1 border">{fees.concessionApplied || 0}</td>
//                 <td className="px-1 py-1 border">{fees.totalDues || 0}</td>
             
//                 <td className="px-1 py-1">
//                   <a
//                     onClick={() => {
//                       setModalData(fees);
//                       toggleModal();
//                     }}
//                     className="font-bold text-green-700 flex align-middle cursor-pointer hover:underline mr-2"
//                   >
//                     <FaEye className="text-2xl" />
//                   </a>
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="Share"
//                     color="green"
//                     onClick={() => FeeReceipt(fees)}
//                     disabled={fees.status === "canceled"}
//                   >
//                     <FaShareAlt className="text-2xl" />
//                   </Button>
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="Cancel"
//                     onClick={() => handleCancel(fees)}
//                     className={`text-red-600 font-bold cursor-pointer dark:text-red-500 hover:underline ${
//                       fees.status === "canceled"
//                         ? "opacity-50 cursor-not-allowed"
//                         : ""
//                     }`}
//                     disabled={fees.status === "canceled"}
//                     color="red"
//                   />
//                 </td>
//                 <td className="px-1 py-1">
//                   <Button
//                     name="View Receipt"
//                     color="blue"
//                     onClick={() => handleViewReceipt(fees)}
//                     // disabled={fees.status === "canceled"}
//                   >
//                     <FaFileAlt className="text-2xl" />
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//         </tbody>
//       </table>
//       {data.length === 0 && (
//         <div className="p-4">
//           <NoDataFound />
//         </div>
//       )}
//     </div>
//   );

//   // Pagination controls
//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const totalItems =
//     activeTab === "single"
//       ? filteredFeeHistory.length
//       : filteredUnifiedFeeHistory.length;
//   const totalPages = Math.ceil(totalItems / itemsPerPage);
// console.log("totalPages",totalPages)
//   const renderPagination = () => (
//     <div className="flex justify-center mt-4">
//       <button
//         onClick={() => handlePageChange(currentPage - 1)}
//         disabled={currentPage === 1}
//         className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//       >
//         Previous
//       </button>
//       {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
//         <button
//           key={page}
         
//           onClick={() => handlePageChange(page)}
//           className={`px-3 py-1 mx-1 rounded ${
//             currentPage === page
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 hover:bg-gray-300"
//           }`}
//         > {console.log("page",page)}
//           {page}
//         </button>
//       ))}
//       <button
//         onClick={() => handlePageChange(currentPage + 1)}
//         disabled={currentPage === totalPages}
//         className="px-3 py-1 mx-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
//       >
//         Next
//       </button>
//     </div>
//   );

//   return (
//     <div className="px-4">
//       {/* Tabs for Single and Unified Receipts */}
//       <div className="mb-4">
//         <div className="flex border-b border-gray-200">
//           <button
//             className={`px-4 py-2 font-medium ${
//               activeTab === "single"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => {
//               setActiveTab("single");
//               setCurrentPage(1);
//             }}
//           >
//             Single Receipts
//           </button>
//           <button
//             className={`px-4 py-2 font-medium ${
//               activeTab === "unified"
//                 ? "border-b-2 border-blue-500 text-blue-600"
//                 : "text-gray-600"
//             }`}
//             onClick={() => {
//               setActiveTab("unified");
//               setCurrentPage(1);
//             }}
//           >
//             Unified Receipts
//           </button>
//         </div>
//       </div>

//       {/* Date Filters and Buttons */}
//       <div className="flex flex-col sm:flex-row gap-4 mb-2">
//         <ReactInput
//           type="date"
//           label="Start Date"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//           containerClassName="flex-1 min-w-[150px]"
//         />
//         <ReactInput
//           type="date"
//           label="End Date"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//           containerClassName="flex-1 min-w-[150px]"
//         />
//         <div className="flex gap-2 items-end">
//           <Button
//             name="Filter"
//             onClick={handleDateFilter}
//             className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//           />
//           <Button
//             name="Clear"
//             onClick={clearDateFilter}
//             className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//           />
//           <Button
//             name="Download Report"
//             onClick={handleDownloadPdf}
//             className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded"
//             icon={<FaFileAlt />}
//           />
//         </div>
//       </div>

//       {/* Payment Summary Section */}
//       <div className="mb-4 rounded-lg">
//         <h3 className="text-sm font-semibold mb-2">Payment Summary</h3>
//         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 gap-4">
//           <div>
//             <p className="text-sm text-gray-600">Cash</p>
//             <p className="font-medium">₹{cashPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Online</p>
//             <p className="font-medium">₹{onlinePayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Cheque</p>
//             <p className="font-medium">₹{chequePayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Card</p>
//             <p className="font-medium">₹{cardPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Other</p>
//             <p className="font-medium">₹{otherPayment.toFixed(2)}</p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Paid</p>
//             <p className="font-semibold text-green-600">
//               ₹
//               {overallTotalPaid(
//                 activeTab === "single"
//                   ? filteredFeeHistory
//                   : filteredUnifiedFeeHistory
//               ).toFixed(2)}
//             </p>
//           </div>
//           <div>
//             <p className="text-sm text-gray-600">Total Dues</p>
//             <p className="font-semibold text-red-600">
//               ₹
//               {overallTotalDuesSum(
//                 activeTab === "single"
//                   ? filteredFeeHistory
//                   : filteredUnifiedFeeHistory
//               ).toFixed(2)}
//             </p>
//           </div>
//         </div>
       
       
//       </div>

//       {/* Render Table Based on Active Tab */}
//       {activeTab === "single"
//         ? renderTable(filteredFeeHistory, false)
//         : renderTable(filteredUnifiedFeeHistory, true)}

//       {/* Pagination */}
//       {totalItems > 0 && renderPagination()}

//       {/* Fee Details Modal */}
//       <Modal
//         isOpen={isOpen}
//         setIsOpen={setIsOpen}
//         title="Fee Details"
//         maxWidth="lg"
//       >
//         <div className="p-4">
//           {modalData && (
//             <div className="space-y-4">
//               <div>
//                 <h3 className="font-semibold text-lg">Student Information</h3>
//                 <p>
//                   <strong>Name:</strong>{" "}
//                   {modalData.studentName ||
//                     modalData.students?.map((s) => s.studentName).join(", ") ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Admission No:</strong>{" "}
//                   {modalData.admissionNumber ||
//                     modalData.students
//                       ?.map((s) => s.admissionNumber)
//                       .join(", ") ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Parent Name:</strong>{" "}
//                   {modalData.parentName || modalData.fatherName || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Class:</strong>{" "}
//                   {modalData.studentClass ||
//                     modalData.students?.map((s) => s.class).join(", ") ||
//                     "N/A"}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-lg">Payment Details</h3>
//                 <p>
//                   <strong>Receipt No:</strong>{" "}
//                   {modalData.feeReceiptNumber ||
//                     modalData.unifiedReceiptNumber ||
//                     "N/A"}
//                 </p>
//                 <p>
//                   <strong>Date:</strong>{" "}
//                   {modalData.date
//                     ? format(parseISO(modalData.date), "dd/MM/yyyy")
//                     : "N/A"}
//                 </p>
//                 <p>
//                   <strong>Payment Mode:</strong>{" "}
//                   {modalData.paymentMode || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Transaction ID:</strong>{" "}
//                   {modalData.transactionId || "N/A"}
//                 </p>
//                 <p>
//                   <strong>Total Paid:</strong> ₹{modalData.totalAmountPaid || 0}
//                 </p>
//                 <p>
//                   <strong>Total Dues:</strong> ₹{modalData.totalDues || 0}
//                 </p>
//               </div>
//               <div>
//                 <h3 className="font-semibold text-lg">Fee Breakdown</h3>
//                 <table className="w-full text-sm border-collapse">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="p-2 border">Type</th>
//                       <th className="p-2 border">Month</th>
//                       <th className="p-2 border">Amount</th>
//                       <th className="p-2 border">Dues</th>
//                       <th className="p-2 border">Status</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {modalData.regularFees?.map((fee, index) => (
//                       <tr key={`reg-${index}`}>
//                         <td className="p-2 border">Class Fee</td>
//                         <td className="p-2 border">{fee.month || "N/A"}</td>
//                         <td className="p-2 border">₹{fee.paidAmount || 0}</td>
//                         <td className="p-2 border">₹{fee.dueAmount || 0}</td>
//                         <td className="p-2 border">
//                           {fee.status || "Unknown"}
//                         </td>
//                       </tr>
//                     ))}
//                     {modalData.additionalFees?.map((fee, index) => (
//                       <tr key={`add-${index}`}>
//                         <td className="p-2 border">{fee.name || "N/A"}</td>
//                         <td className="p-2 border">{fee.month || "N/A"}</td>
//                         <td className="p-2 border">₹{fee.paidAmount || 0}</td>
//                         <td className="p-2 border">₹{fee.dueAmount || 0}</td>
//                         <td className="p-2 border">
//                           {fee.status || "Unknown"}
//                         </td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             </div>
//           )}
//           <div className="mt-6 flex justify-end">
//             <Button
//               name="Close"
//               onClick={toggleModal}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* Cancel Confirmation Modal */}
//       <Modal
//         isOpen={cancel}
//         setIsOpen={setCancel}
//         title="Confirm Cancellation"
//         maxWidth="sm"
//       >
//         <div className="p-4">
//           <p className="mb-4 text-gray-700">
//             Are you sure you want to cancel the fee payment for receipt{" "}
//             <strong>
//               {cancelData?.feeReceiptNumber ||
//                 cancelData?.unifiedReceiptNumber ||
//                 "N/A"}
//             </strong>
//             ?
//           </p>
//           <div className="flex gap-4 justify-end">
//             <Button
//               name="Confirm"
//               onClick={cancelFee}
//               className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
//             />
//             <Button
            
//               name="Cancel"
//               onClick={() => setCancel(false)}
//               className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>

//       {/* Receipt Preview Modal */}
//       <Modal
//         isOpen={receiptModalOpen}
//         setIsOpen={setReceiptModalOpen}
//         title={
//           activeTab === "single"
//             ? "Single Receipt Preview"
//             : "Unified Receipt Preview"
//         }
//         maxWidth="lg"
//       >
//         <div className="p-4">
//           {receiptData && isPreviewReady ? (
//             <FeeRecipt
//               modalData={receiptData} // Pass full response object
//               isUnified={receiptData.data.isUnified} // Pass isUnified flag
//               handleCloseModal={handleCloseReceiptModal}
//             />
//           ) : (
//             <p className="text-gray-600">Loading receipt preview...</p>
//           )}
//           {/* Additional controls for consistency, though FeeRecipt handles printing */}
//           <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
//             <Button
//               type="button"
//               name="Print Receipt"
//               onClick={() => {
//                 // Trigger FeeRecipt's internal print; modal closes via handleCloseModal
//                 document.querySelector(".print-button")?.click();
//               }}
//               className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
//               disabled={!isPreviewReady}
//             />
//             <Button
//               type="button"
//               name="Download PDF"
//               onClick={() => {
//                 // Trigger FeeRecipt's internal download; modal closes via handleCloseModal
//                 document.querySelector(".print-button")?.click();
//               }}
//               className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
//               disabled={!isPreviewReady}
//             />
//             <Button
//               type="button"
//               name="Close"
//               onClick={handleCloseReceiptModal}
//               className="w-full bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
//             />
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default Table;






// import React, { useEffect, useState } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import FeeRecipt from "./FeeRecipt";
// import NoDataFound from "../../NoDataFound";
// import { format, parseISO } from "date-fns";
// import { FaEye } from "react-icons/fa";
// import FeeReceiptPDF from './FeeReceiptPDF';
// import PrintHandler from "../Admission/PrintHandler";
// import { FaShareAlt } from "react-icons/fa";

// import { cancelFeePayment, feesfeeHistory } from "../../Network/AdminApi";
// import { toast } from "react-toastify";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import Modal from "../../Dynamic/Modal";
// import Button from "../../Dynamic/utils/Button";
// import moment from "moment";
// import { FeeReceipt } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";
// import { FaPrint, FaFileAlt } from "react-icons/fa"; 
// const Table = ({ reLoad }) => {
//   const user = JSON.parse(localStorage.getItem("user"))
//   // console.log("user",user)
//   const { currentColor,setIsLoader } = useStateContext();
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [feeHistory, setFeeHistory] = useState([]);
//   const [filteredFeeHistory, setFilteredFeeHistory] = useState([]);
//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };
//   const [cancel,setCencel]=useState(false)
//   const [feeDetais,setFeeDetails]=useState([])
//   const [startDate, setStartDate] = useState(getCurrentDate());
//   const [endDate, setEndDate] = useState(getCurrentDate());
 
//   const toggleModal = () => setIsOpen(!isOpen);
//   const [cancelData,setCancelData]=useState({})
//   // console.log("first cancelData",cancelData)
//   const handleOpenModal = (rowData) => {
//     setModalData(rowData);
//     setIsOpen(true);
//   };

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10); // Number of items per page

//   useEffect(() => {
//     getFeeHistory();
//   }, [reLoad]);

//   const getFeeHistory = async () => {
//     setIsLoader(true)
//     try {
//       const response =await feesfeeHistory()
//       if(response?.success){
//         setFeeHistory(response?.data);
//         setFilteredFeeHistory(response?.data);
//         setIsLoader(false)
//       }
//       else{
//         setIsLoader(false)
//         toast?.error(response?.message)
//       }
     
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//     }
//   };

//   // Pagination Logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const handleDateFilter = () => {
//     const filteredData = feeHistory.filter((fee) => {
//       const feeDate = moment(fee.date).format("DD-MM-YYYY");
//       return feeDate >= moment(startDate).format("DD-MM-YYYY") && feeDate <= moment(endDate).format("DD-MM-YYYY");
//     });

//     setFilteredFeeHistory(filteredData);
//   };

//   const clearDateFilter = () => {
//     setStartDate("");
//     setEndDate(getCurrentDate());
//     setFilteredFeeHistory(feeHistory);
//   };

//   // const { handlePrint } = PrintHandler(); // Use the hook
//   // const handlePrintClick = (filteredFeeHistory) => {
//   //   // setSelectStudent(filteredFeeHistory);
//   //   setTimeout(() => {
//   //     // Call the reusable handlePrint function and pass the content
//   //     handlePrint(document.getElementById("printContent").innerHTML);
//   //   }, 100);
//   // };
 
  
//   const cancelFee=async()=>{
//     const payload={
//       "studentId": cancelData?.studentId,
//       "feeReceiptNumber": cancelData?.feeReceiptNumber
//     }
// try {
//   const response =await cancelFeePayment(payload)
//   if(response?.success){
//     setCencel(false)
//     toast.success(response?.message)
//   }
//   else{
//     toast.error(response?.message)
//   }
// } catch (error) {
//   console.log("error",error)
// }
//   }

//   const handleCancel=(val)=>{
//     // console.log("first valvalvalval",val)
//     setCancelData(val)
//     setCencel(true)

//   }


//     const columns = [
//       { header: 'Rcpt No.', dataKey: 'feeReceiptNumber' },
//       { header: 'Date', dataKey: 'date' },
//       { header: 'Admission No.', dataKey: 'admissionNumber' },
//       { header: 'Student', dataKey: 'studentName' },
//       { header: 'Father Name', dataKey: 'fatherName' },
//       { header: 'Class', dataKey: 'studentClass' },
//       { header: 'Mode', dataKey: 'paymentMode' },
//       { header: 'TID', dataKey: 'transactionId' },
//       { header: 'Month', dataKey: 'month' },
//       { header: 'Dues', dataKey: 'dues' },
//       { header: 'Fee', dataKey: 'totalFeeAmount' },
//       { header: 'Paid ', dataKey: 'totalAmountPaid' },
//       { header: 'Status', dataKey: 'feeStatus' },
//       // { header: 'Remark', dataKey: 'remark' },
//     ];
    
// useEffect(() => {
//   if (Array.isArray(feeHistory)) {
//     const updatedFeeHistory = filteredFeeHistory.map(item => ({
//       ...item,
//       month: item?.regularFees?.map(val => val?.month).join(', ') || '',
//       feeStatus: item?.regularFees?.map(val => val?.status).join(', ') || ''

//     }));
//     setFeeDetails(updatedFeeHistory);
//   }
// }, [filteredFeeHistory]);


// const totalsByMode = filteredFeeHistory.reduce((accumulator, item) => {
//   // Safely parse the amount paid, default to 0 if invalid
//   const amountPaid = parseFloat(item?.totalAmountPaid);
//   const validAmount = isNaN(amountPaid) ? 0 : amountPaid;

//   // Get mode, convert to lower case for consistent matching
//   const mode = item?.paymentMode?.toLowerCase();

//   switch (mode) {
//       case 'cash':
//           accumulator.cash += validAmount;
//           break;
//       case 'online':
//           accumulator.online += validAmount;
//           break;
//       case 'cheque': // Added Cheque
//           accumulator.cheque += validAmount;
//           break;
//       case 'card':   // Added Card
//           accumulator.card += validAmount;
//           break;
//       // Remove 'bank' case if it's no longer used or group it into 'other'
//       // case 'bank':
//       //     accumulator.bank += validAmount;
//       //     break;
//       default:
//           // Includes null, undefined, 'Bank', or any other unexpected modes
//           accumulator.other += validAmount;
//           break;
//   }
//   return accumulator; // Return the updated accumulator

// }, { // Updated Initial accumulator object
//   cash: 0,
//   online: 0,
//   cheque: 0, // Added
//   card: 0,   // Added
//   // bank: 0, // Remove if not needed
//   other: 0
// });

// // 2. Calculate Overall Total Paid Amount (Robustly) - No change needed here
// const overallTotalPaid = filteredFeeHistory.reduce((sum, item) => {
//   const amountPaid = parseFloat(item?.totalAmountPaid);
//   return sum + (isNaN(amountPaid) ? 0 : amountPaid);
// }, 0);

// // 3. Calculate Overall Sum of 'Total Dues' field (Robustly) - No change needed here
// const overallTotalDuesSum = filteredFeeHistory.reduce((sum, item) => {
//   const duesValue = parseFloat(item?.totalDues);
//   return sum + (isNaN(duesValue) ? 0 : duesValue);
// }, 0);


// // --- Assign values to variables ---
// const cashPayment = totalsByMode.cash;
// const onlinePayment = totalsByMode.online;
// const chequePayment = totalsByMode.cheque; // Added
// const cardPayment = totalsByMode.card;     // Added
// // const bankPayment = totalsByMode.bank; // Remove if bank mode is removed/grouped
// const otherPayment = totalsByMode.other;   // Optional: capture any other modes


//     const handleDownloadPdf = () => {
    
//       generatePdf(feeDetais,columns,overallTotalPaid,overallTotalDuesSum,cashPayment,onlinePayment,chequePayment,cardPayment,'user-report.pdf'); // generatePdf ko call karein
//       // generatePdf(tableData,'user-report.pdf'); // generatePdf ko call karein
//     };
  

//   return (
//     <div className="md:min-h-screen mt-4">
//       <div className="flex items-center gap-2 mb-2 flex-wrap">
//          <ReactInput
//                       type="date"
//                       name="studentDateOfBirth"
//                       // required={true}
//                       label="Start Date"
//                       onChange={(e) => setStartDate(e.target.value)}
//                       value={startDate}
//                       />
//          <ReactInput
//                       type="date"
//                       name="studentDateOfBirth"
//                       // required={true}
//                       label="End Date"
//                       onChange={(e) => setEndDate(e.target.value)}
//                       value={endDate}
//                       />
       
//             <Button
//               onClick={handleDateFilter}
//               name="Filter"
             
//             >
              
//             </Button>
         
//             <Button

//   name="Clear"
//               onClick={clearDateFilter} >
              
//             </Button>
//             <Button
//  color="teal"
//   name="PRINT"
//    Icon={<FaFileAlt />}
//               onClick={handleDownloadPdf} >
              
//             </Button>
//             <div
//             //  id="printContent"
//              >
//           {/* <FeeReceiptPDF details={filteredFeeHistory} /> */}
//         </div>
         
//       </div>
     
      
//       {feeHistory.length > 0 ? (
//         <div className="relative  md:max-h-screen overflow-x-auto shadow-md sm:rounded-lg">
//           <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
//             <thead
//             style={{background:currentColor, color:"white",whiteSpace:"nowrap"}}
//             className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
//               <tr>
//                 <th scope="col" className="px-1 py-1">
//                   S No.
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                   Adm No.
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                   Name
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                   Class
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                   Receipt No.
//                 </th>

//                 <th scope="col" className="px-6 py-3">
//                   Regular Fee
//                 </th>

//                 <th scope="col" className="px-2 py-3">
//                   Pay Date
//                 </th>
//                 {/* <th scope="col" className="px-6 py-3">
//                   Remarks
//                 </th> */}

//                 <th scope="col" className="px-6 py-3">
//                   Dues
//                 </th>
//                 <th scope="col" className="px-6 py-3">
//                   Paid
//                 </th>
//                 {/* <th scope="col" className="px-6 py-3">
//                   Status
//                 </th> */}

//                 <th scope="col" className="px-1 py-3">
//                   Action
//                 </th>
//                  <th scope="col" className="px-1 py-3" >
                 
//                   Share
//                 </th>
//                  <th scope="col" className="px-1 py-3" >
                 
//                   Cancel Fee
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               {/* {console.log("filteredFeeHistory",filteredFeeHistory)} */}
//               {filteredFeeHistory
//                 ? filteredFeeHistory.slice(indexOfFirstItem, indexOfLastItem).map((fees, index) => (
//                     <tr className={`${fees.status=="canceled"? "bg-[#a53c3c66] ":""}border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600`}
//                     style={{color:"black"}}
//                     >
//                       <td className="px-6 py-4 text-bold">
//                         {index + 1 + (currentPage - 1) * itemsPerPage}
//                       </td>
//                       <td className="px-6 py-4">{fees.admissionNumber}</td>
//                       <td className="px-6 py-4">{fees.studentName}</td>
//                       <td className="px-6 py-4">{fees.studentClass}</td>
//                       <td className="px-6 py-4">{fees.feeReceiptNumber}</td>

//                       <td className="px-2">
//                         <div class="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
//                           <div class="inline-block min-w-full  rounded-lg overflow-hidden">
//                             {fees.regularFees.length > 0 ||
//                             fees.additionalFees.length > 0 ? (
//                               <table class="min-w-full leading-normal">
//                                 <thead>
//                                   <tr>
//                                     <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                       Name
//                                     </th>
//                                     <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                       Month
//                                     </th>
//                                     <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                       Amount
//                                     </th>
//                                     <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                       Dues
//                                     </th>
//                                     <th class="p-1  border-b-2 border-gray-200 bg-gray-50 text-xs font-semibold text-gray-700 uppercase tracking-wider">
//                                       Status
//                                     </th>
//                                     {/* <th class="p-1  border-b-2 border-gray-200 bg-gray-50"></th> */}
//                                   </tr>
//                                 </thead>
//                                 <tbody>
//                                   {fees.regularFees &&
//                                     fees.regularFees.map((addFee) => (
//                                       <tr>
//                                         <td class="px-1 border-b border-gray-200 bg-white text-sm">
//                                           <p class="text-gray-900 whitespace-no-wrap whitespace-nowrap ">
//                                             Class Fee
//                                           </p>
//                                         </td>
//                                         <td class="px-1 border-b border-gray-200 bg-white text-sm">
//                                           <p class="text-gray-900 whitespace-no-wrap">
//                                             {addFee.month}
//                                           </p>
//                                         </td>
//                                         <td class="px-1 border-b border-gray-200 bg-white text-sm">
//                                           <p class="text-gray-900 whitespace-no-wrap">
//                                             {addFee.paidAmount}
//                                           </p>
//                                         </td>
//                                         <td class="px-1 border-b border-gray-200 bg-white text-sm">
//                                           <p class="text-gray-900 whitespace-no-wrap">
//                                             {addFee.dueAmount}
//                                           </p>
//                                         </td>
//                                         <td class="px-1 border-b border-gray-200 bg-white text-sm">
//                                           <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                             <span
//                                               aria-hidden
//                                               class="absolute inset-0  opacity-50 rounded-full"
//                                             ></span>
//                                             <span
//                                               class={`${
//                                                 addFee.status === "Paid"
//                                                   ? "text-green-600"
//                                                   : "text-red-600"
//                                               }`}
//                                             >
//                                               {addFee.status}
//                                             </span>
//                                           </span>
//                                         </td>
//                                       </tr>
//                                     ))}
//                                 </tbody>
//                                 <tbody>
//                                   {fees.additionalFees.map((addFee, index) => (
//                                     <tr key={index}>
//                                       <td class="px-1  border-b border-gray-200 bg-white text-sm">
//                                         <p class="text-gray-900 whitespace-no-wrap">
//                                           {addFee.name}
//                                         </p>
//                                       </td>
//                                       <td class="px-1 border-b border-gray-200 bg-white text-sm">
//                                         <p class="text-gray-900 whitespace-no-wrap">
//                                           {addFee.month}
//                                         </p>
//                                       </td>
//                                       <td class="px-1 border-b border-gray-200 bg-white text-sm">
//                                         <p class="text-gray-900 whitespace-no-wrap">
//                                           {addFee.paidAmount}
//                                         </p>
//                                       </td>
//                                       <td class="px-1 border-b border-gray-200 bg-white text-sm">
//                                         <p class="text-gray-900 whitespace-no-wrap">
//                                           {addFee.dueAmount}
//                                         </p>
//                                       </td>
//                                       <td class="px-1 border-b border-gray-200 bg-white text-sm">
//                                         <span class="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
//                                           <span
//                                             aria-hidden
//                                             class="absolute inset-0  opacity-50 rounded-full"
//                                           ></span>
//                                           <span
//                                             class={`${
//                                               addFee.status === "Paid"
//                                                 ? "text-green-600"
//                                                 : "text-red-600"
//                                             }`}
//                                           >
//                                             {addFee.status}
//                                           </span>
//                                         </span>
//                                       </td>
//                                     </tr>
//                                   ))}
//                                 </tbody>
//                               </table>
//                             ) : (
//                               <h1 className="text-center">No Fee</h1>
//                             )}
//                           </div>
//                         </div>
//                       </td>

//                       <td className="px-2 py-4">
//                         {format(parseISO(fees.date), "dd/MM/yyyy")}
//                       </td>
//                       {/* <td className="px-6 py-4">
//                         <p className="max-w-[150px] break-words">
//                           {fees.remark}
//                         </p>
//                       </td> */}
//                       <td className="px-6 py-4">{fees.dues}</td>
//                       <td className="px-6 py-4">{fees.totalAmountPaid}</td>
//                       {/* <td className="px-6 py-4 ">{fees.status}</td> */}
//                       <td className="px-4 py-4 ">
//                         <a
//                           onClick={() => handleOpenModal(fees)}
//                           className="font-bold text-green-700 flex align-middle  cursor-pointer hover:underline mr-2"
//                         >
//                          <span >
//                          <FaEye className="text-2xl"/>
//                          </span>
//                         </a>
//                       </td>
//                       <td className="px-4 py-4">
//                          <Button
//                          name="Share"
//                          color="green"
//                             // onClick={() => shareOnWhatsAppBatched(fees, phoneNumbers, 5, 30)}
//                             onClick={() => FeeReceipt(fees)}
//                             // className="font-medium text-green-600 cursor-pointer dark:text-green-500 hover:underline"
//                          >
                         
//                          <FaShareAlt className="text-2xl"/>
//                          </Button>
                       
//                       </td>
//                       <td className="px-4 py-4">
//                          <Button
//                          name="Cancel"
//                               // onClick={() => setCencel(true)}
//                             onClick={() => handleCancel(fees)}
//                             className=" text-red-600 font-bold cursor-pointer dark:text-green-500 hover:underline"
//                          >
                         
                        
//                          </Button>
//                       </td>
//                     </tr>
//                   ))
//                 : ""}
//             </tbody>
//           </table>
           
//           <Modal
//         setIsOpen={toggleModal}
//         isOpen={isOpen} 
//         title={"Addmission details pdf"} maxWidth="100px">
//  <FeeRecipt
//                       modalData={modalData}
//                       handleCloseModal={toggleModal}
//                     />
//       </Modal>


//           <Modal  
//           setIsOpen={() => setCencel(false)} 
//           isOpen={cancel} title={"Cancel Fees"} maxWidth="100px">
//          <div className="p-4">
          
//          <p className="text-red-700">
//           "Do you want to cancel the fees?"
//           </p>
//            <div className="w-full flex justify-around">
//            <Button
//            name="Yes"
//             onClick={() => cancelFee()}
//                   >
                
//                   </Button>
//            <Button
//            name="No"

//                     onClick={() => setCencel(false)}
//                   >
                   
//                   </Button>
       
//            </div>
//          </div>
//             </Modal> 
//         </div>
//       ) : (
//         <NoDataFound />
//       )}
//     </div>
//   );
// };

// export default Table;
