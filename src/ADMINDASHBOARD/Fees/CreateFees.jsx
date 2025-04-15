import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import {
  ActiveStudents,
  feescreateFeeStatus,
  LateFines,
  parentandchildwithID,
  feescreateUnifiedFeeStatus,
} from "../../Network/AdminApi";
import Button from "../../Dynamic/utils/Button";
import Modal from "../../Dynamic/Modal";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { useStateContext } from "../../contexts/ContextProvider";
import MonthFeeCard from "./MonthFeeCard";
import moment from "moment";
import { FeeResponse } from "../../Dynamic/utils/Message";
import generatePdf from "../../Dynamic/utils/pdfGenerator";
import FeeRecipt from "./FeeRecipt";

// Custom styles for react-select
const customSelectStyles = {
  option: (provided, state) => ({
    ...provided,
    color: state.data.due > 0 ? "red" : "black",
    fontSize: "14px",
  }),
  multiValue: (provided) => ({
    ...provided,
    backgroundColor: "#e0f7fa",
  }),
  multiValueLabel: (provided) => ({
    ...provided,
    color: "#006064",
  }),
};

// Helper to fetch additional fees
const fetchAdditionalFeesForClass = async (className, authToken) => {
  try {
    const response = await axios.get(
      `https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true&className=${className}`,
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      }
    );
    if (response?.data?.success) {
      const filteredFees = response.data.data.filter(
        (fee) => fee.className === className
      );
      return filteredFees.map((fee) => ({
        label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`,
        value: fee.amount,
        name: fee.name,
        type: fee.feeType,
        id: fee._id,
      }));
    } else {
      toast.error(`Failed to fetch additional fees for class ${className}.`);
      return [];
    }
  } catch (error) {
    toast.error(
      `Error fetching additional fees for class ${className}: ${error.message}`
    );
    return [];
  }
};

const CreateFees = () => {
  const session = JSON.parse(localStorage.getItem("session"));
  const { setIsLoader } = useStateContext();
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [responseData, setResponseData] = useState(null);
  const [showChildForms, setShowChildForms] = useState(false);
  const [selectedChildrenIndices, setSelectedChildrenIndices] = useState([]);
  const [childFeeHistory, setChildFeeHistory] = useState(null);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showFormFlags, setShowFormFlags] = useState([]);
  const [triggerRefresh, setTriggerRefresh] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
  const [parentData, setParentData] = useState([]);
  const [allStudent, setAllStudent] = useState([]);
  const [formData, setFormData] = useState([]);
  const authToken = localStorage.getItem("token");
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [unifiedReceiptModalOpen, setUnifiedReceiptModalOpen] = useState(false);
  const [unifiedReceiptData, setUnifiedReceiptData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  const allMonths = [
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
    "January",
    "February",
    "March",
  ];

  // Fetch students
  const getAllStudent = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents();
      setAllStudent(response?.students?.data || []);
    } catch (error) {
      toast.error("Failed to fetch student list.");
      setAllStudent([]);
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader]);

  useEffect(() => {
    getAllStudent();
  }, [getAllStudent, triggerRefresh]);

  // Search handlers
  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredStudents([]);
    } else {
      const filtered = allStudent.filter(
        (student) =>
          student.studentName &&
          student.studentName.toLowerCase().includes(searchValue)
      );
      setFilteredStudents(filtered);
    }
    setSearchTermbyadmissionNo("");
  };

  const handleSearchbyAdmissionNo = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTermbyadmissionNo(searchValue);
    if (searchValue === "") {
      setFilteredStudents([]);
    } else {
      const filtered = allStudent.filter(
        (student) =>
          student.admissionNumber &&
          student.admissionNumber.toLowerCase().includes(searchValue)
      );
      setFilteredStudents(filtered);
    }
    setSearchTerm("");
  };

  // Fetch student fee info
  const fetchStudentFeeInfo = async (studentId) => {
    try {
      const response = await axios.get(
        `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(
          `Fee info fetch failed for student ID ${studentId}: ${
            response.data.message || "Unknown error"
          }`
        );
        return null;
      }
    } catch (error) {
      toast.error(
        `Error fetching fee info for student ID ${studentId}: ${error.message}`
      );
      return null;
    }
  };

  // Reset state
  const resetState = () => {
    setSelectedChildrenIndices([]);
    setChildFeeHistory(null);
    setShowFormFlags([]);
    setParentData([]);
    setFormData([]);
    setSearchTerm("");
    setSearchTermbyadmissionNo("");
    setFilteredStudents([]);
    setShowChildForms(false);
    setResponseData(null);
    setIsMessageModalOpen(false);
    setPdfModalOpen(false);
    setUnifiedReceiptModalOpen(false);
    setUnifiedReceiptData(null);
    setReceiptData(null);
    setIsPreviewReady(false);
  };

  // Handle student selection
  const handleStudentClick = async (parentId) => {
    setIsLoader(true);
    setChildFeeHistory(null);
    try {
      const parentResponse = await parentandchildwithID(parentId);
      if (!parentResponse?.success) {
        toast.error(
          parentResponse?.message || "Failed to fetch parent/child data."
        );
        resetState();
        return;
      }

      const children = parentResponse?.children || [];
      if (children.length === 0) {
        toast.info("No children found for this parent.");
        resetState();
        return;
      }

      setParentData(children);

      const promises = children.map((child) =>
        Promise.all([
          fetchStudentFeeInfo(child.studentId),
          fetchAdditionalFeesForClass(child.class, authToken),
        ])
      );

      const results = await Promise.all(promises);
      const initialFormData = [];
      const initialShowFormFlags = [];

      results.forEach(([feeInfo, availableAdditionalFees], index) => {
        const child = children[index];

        if (!feeInfo) {
          toast.error(
            `Could not load fee details for ${child.studentName}. Skipping.`
          );
          initialShowFormFlags.push(false);
          initialFormData.push({
            admissionNumber: child.admissionNumber,
            studentId: child.studentId,
            className: child.class,
            error: true,
          });
          return;
        }

        const regularFeeAmount =
          feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
        const additionalFeesStructure =
          feeInfo.feeStructure?.additionalFees || [];
        const monthlyStatus = feeInfo.monthlyStatus || [];

        const regularFees = allMonths.map((month) => {
          const monthData = monthlyStatus.find((m) => m.month === month);
          const due = monthData?.regularFee?.due ?? regularFeeAmount;
          const status = monthData?.regularFee?.status || "Unpaid";
          return {
            month,
            paidAmount: "",
            dueAmount: status === "Paid" ? 0 : due,
            totalAmount: regularFeeAmount,
            status: status,
          };
        });

        const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
          name: fee.name,
          type: fee.feeType,
          amount: fee.amount,
          months: allMonths.map((month) => {
            const monthData = monthlyStatus.find((m) => m.month === month);
            const addFee = monthData?.additionalFees.find(
              (af) => af.name === fee.name
            );
            const due = addFee?.due ?? fee.amount;
            const status = addFee?.status || "Unpaid";
            return {
              month,
              paidAmount: "",
              dueAmount: status === "Paid" ? 0 : due,
              totalAmount: fee.amount,
              status: status,
            };
          }),
        }));

        initialFormData.push({
          admissionNumber: child.admissionNumber,
          studentId: child.studentId,
          studentName: child.studentName,
          className: child.class,
          classFee: regularFeeAmount,
          totalAmount: "",
          selectedMonths: [],
          selectedAdditionalFees: [],
          paymentMode: "Cash",
          transactionId: "",
          chequeBookNo: "",
          lateFine: feeInfo.feeStatus?.totalLateFines || 0,
          concession: "",
          date: moment().format("YYYY-MM-DD"),
          remarks: "",
          monthlyDues: feeInfo.feeStatus?.monthlyDues || {
            regularDues: [],
            additionalDues: [],
          },
          additionalFeeDetails: additionalFeeDetails,
          pastDues: feeInfo.feeStatus?.pastDues || 0,
          totalDues: feeInfo.feeStatus?.dues || 0,
          regularFees,
          availableAdditionalFees: availableAdditionalFees,
          feeInfo,
          error: false,
        });
        initialShowFormFlags.push(false);
      });

      setFormData(initialFormData);
      setSelectedChildrenIndices([]);
      setShowFormFlags(initialShowFormFlags);
      setShowChildForms(true);
    } catch (error) {
      toast.error("An error occurred while fetching student data.");
      console.error("Error in handleStudentClick:", error);
      resetState();
    } finally {
      setIsLoader(false);
    }
  };

  // Handle child selection
  const handleChildSelection = (index) => {
    if (!formData[index] || formData[index].error) {
      toast.warn(
        `Cannot select ${parentData[index]?.studentName}. Fee data may be missing.`
      );
      return;
    }

    const isCurrentlySelected = selectedChildrenIndices.includes(index);
    const updatedSelectedChildren = isCurrentlySelected
      ? selectedChildrenIndices.filter((i) => i !== index)
      : [...selectedChildrenIndices, index];

    const updatedShowFormFlags = [...showFormFlags];
    updatedShowFormFlags[index] = !isCurrentlySelected;

    setSelectedChildrenIndices(updatedSelectedChildren);
    setShowFormFlags(updatedShowFormFlags);

    if (!isCurrentlySelected) {
      setChildFeeHistory(formData[index].feeInfo);
    } else if (updatedSelectedChildren.length === 0) {
      setChildFeeHistory(null);
    } else if (
      updatedSelectedChildren.length > 0 &&
      !updatedSelectedChildren.includes(index)
    ) {
      const lastSelectedIndex =
        updatedSelectedChildren[updatedSelectedChildren.length - 1];
      setChildFeeHistory(formData[lastSelectedIndex]?.feeInfo || null);
    }
  };

  // Form input handlers
  const handleInputChange = (index, field, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index] = { ...updatedFormData[index], [field]: value };

    if (field === "paymentMode") {
      if (value !== "Online" && value !== "Card") {
        updatedFormData[index].transactionId = "";
      }
      if (value !== "Cheque") {
        updatedFormData[index].chequeBookNo = "";
      }
    }

    setFormData(updatedFormData);
  };

  const handleMonthSelection = (index, selectedOptions) => {
    const selectedMonthsData = selectedOptions || [];
    const updatedFormData = [...formData];

    if (selectedMonthsData.length <= 1) {
      updatedFormData[index].selectedMonths = selectedMonthsData;
      setFormData(updatedFormData);
      return;
    }

    const selectedMonthNames = selectedMonthsData.map((opt) => opt.value);
    const indicesInAllMonths = selectedMonthNames
      .map((month) => allMonths.indexOf(month))
      .sort((a, b) => a - b);

    let isSequential = true;
    for (let i = 1; i < indicesInAllMonths.length; i++) {
      if (indicesInAllMonths[i] !== indicesInAllMonths[i - 1] + 1) {
        isSequential = false;
        break;
      }
    }

    if (isSequential) {
      updatedFormData[index].selectedMonths = selectedMonthsData;
      setFormData(updatedFormData);
    } else {
      toast.warn(
        `Please select months in a continuous sequence (e.g., April, May, June).`
      );
    }
  };

  const handleAdditionalFeesChange = (index, selectedOptions) => {
    const selectedFeesData = selectedOptions || [];
    const updatedFormData = [...formData];
    updatedFormData[index].selectedAdditionalFees = selectedFeesData.map(
      (opt) => ({
        name: opt.name,
        amount: opt.value,
        type: opt.type,
      })
    );
    setFormData(updatedFormData);
  };

  const calculateNetPayableAmount = useCallback(
    (index) => {
      const data = formData[index];
      if (!data || data.error) return 0;

      let total = 0;
      total += parseFloat(data.lateFine) || 0;
      total += parseFloat(data.pastDues) || 0;

      const regularFeeTotal = data.selectedMonths.reduce((sum, monthOption) => {
        const fee = data.regularFees.find((f) => f.month === monthOption.value);
        return sum + (fee?.dueAmount || 0);
      }, 0);
      total += regularFeeTotal;

      const additionalFeeTotal = data.selectedAdditionalFees.reduce(
        (sum, fee) => {
          return sum + (fee?.amount || 0);
        },
        0
      );
      total += additionalFeeTotal;

      total -= parseFloat(data.concession) || 0;

      return Math.max(0, total);
    },
    [formData]
  );

  const calculateAutoDistribution = useCallback(
    (index) => {
      const data = formData[index];
      const netPayable = calculateNetPayableAmount(index);
      const totalAmountPaid = parseFloat(data.totalAmount) || 0;

      const remainingDues = Math.max(0, netPayable - totalAmountPaid);
      const remainingAfterDistribution = Math.max(
        0,
        totalAmountPaid - netPayable
      );

      return {
        remainingAfterDistribution,
        remainingDues,
      };
    },
    [formData, calculateNetPayableAmount]
  );

  // Fetch receipt data
  const fetchReceiptData = async (receiptNumber, isUnified = false) => {
    try {
      const response = await axios.get(
        `https://dvsserver.onrender.com/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.data.success) {
        setReceiptData(response.data);
        setIsPreviewReady(true);
        return response.data;
      } else {
        toast.error("Failed to fetch receipt data.");
        setIsPreviewReady(false);
        return null;
      }
    } catch (error) {
      toast.error("Error fetching receipt data: " + error.message);
      setIsPreviewReady(false);
      return null;
    }
  };

  // Handle unified fee payment
  const handleUnifiedFeePayment = async () => {
    if (selectedChildrenIndices.length < 2) {
      toast.warn("Please select at least two students for unified payment.");
      return;
    }

    setIsLoader(true);
    const students = selectedChildrenIndices.map((index) => {
      const childFormData = formData[index];
      const child = parentData[index];

      if (!childFormData || childFormData.error) {
        toast.error(
          `Cannot submit for ${
            child?.studentName || "this student"
          } due to missing data.`
        );
        return null;
      }

      const totalAmount = parseFloat(childFormData.totalAmount) || 0;
      if (totalAmount <= 0) {
        toast.warn(
          `Please enter a valid amount to pay for ${child.studentName}.`
        );
        return null;
      }
      if (!childFormData.paymentMode) {
        toast.error(`Payment mode is required for ${child.studentName}.`);
        return null;
      }
      if (
        (childFormData.paymentMode === "Online" ||
          childFormData.paymentMode === "Card") &&
        !childFormData.transactionId
      ) {
        toast.error(
          `Transaction ID is required for Online/Card payment for ${child.studentName}.`
        );
        return null;
      }
      if (
        childFormData.paymentMode === "Cheque" &&
        !childFormData.chequeBookNo
      ) {
        toast.error(
          `Cheque Number is required for Cheque payment for ${child.studentName}.`
        );
        return null;
      }
      if (
        totalAmount > 0 &&
        childFormData.selectedMonths.length === 0 &&
        childFormData.selectedAdditionalFees.length === 0
      ) {
        const duesAndFines =
          (parseFloat(childFormData.pastDues) || 0) +
          (parseFloat(childFormData.lateFine) || 0);
        if (totalAmount > duesAndFines) {
          toast.warn(
            `Please select at least one month or additional fee to cover the amount being paid for ${child.studentName}.`
          );
          return null;
        }
      }

      return {
        studentId: child.studentId,
        paymentDetails: {
          regularFees: childFormData.selectedMonths.map((opt) => ({
            month: opt.value,
          })),
          additionalFees: childFormData.selectedAdditionalFees.map((fee) => ({
            name: fee.name,
            amount: fee.amount,
          })),
          pastDuesPaid: 0,
          lateFinesPaid: 0,
          concession: parseFloat(childFormData.concession) || 0,
          totalAmount: totalAmount,
        },
      };
    });

    if (students.includes(null)) {
      setIsLoader(false);
      return;
    }

    const firstChildFormData = formData[selectedChildrenIndices[0]];
    const unifiedPaymentDetails = {
      paymentMode: firstChildFormData.paymentMode,
      transactionId: firstChildFormData.transactionId || undefined,
      chequeNumber: firstChildFormData.chequeBookNo || undefined,
      date: moment(firstChildFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
      remark: firstChildFormData.remarks || "",
    };

    const payload = {
      students,
      session,
      unifiedPaymentDetails,
    };

    try {
      const response = await feescreateUnifiedFeeStatus(payload);

      if (response.success) {
        toast.success(
          response.message || "Unified fees submitted successfully!"
        );
        setUnifiedReceiptData(response.data);
        setIsMessageModalOpen(true);
        setTriggerRefresh((prev) => !prev);
      } else {
        toast.error(response.message || "Unified fee submission failed.");
        setIsPreviewReady(false);
      }
    } catch (error) {
      toast.error(
        `Error during unified submission: ${
          error.message || "Something went wrong"
        }`
      );
      setIsPreviewReady(false);
    } finally {
      setIsLoader(false);
    }
  };

  // Handle single student submission
  const handleSubmit = async (e, childIndex) => {
    e.preventDefault();
    e.stopPropagation();

    const childFormData = formData[childIndex];
    const child = parentData[childIndex];

    if (!childFormData || childFormData.error) {
      toast.error(
        `Cannot submit for ${
          child?.studentName || "this student"
        } due to missing data.`
      );
      return;
    }

    const totalAmount = parseFloat(childFormData.totalAmount) || 0;
    if (totalAmount <= 0) {
      toast.warn(
        `Please enter a valid amount to pay for ${child.studentName}.`
      );
      return;
    }
    if (!childFormData.paymentMode) {
      toast.error(`Payment mode is required for ${child.studentName}.`);
      return;
    }
    if (
      (childFormData.paymentMode === "Online" ||
        childFormData.paymentMode === "Card") &&
      !childFormData.transactionId
    ) {
      toast.error(
        `Transaction ID is required for Online/Card payment for ${child.studentName}.`
      );
      return;
    }
    if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
      toast.error(
        `Cheque Number is required for Cheque payment for ${child.studentName}.`
      );
      return;
    }
    if (
      totalAmount > 0 &&
      childFormData.selectedMonths.length === 0 &&
      childFormData.selectedAdditionalFees.length === 0
    ) {
      const duesAndFines =
        (parseFloat(childFormData.pastDues) || 0) +
        (parseFloat(childFormData.lateFine) || 0);
      if (totalAmount > duesAndFines) {
        toast.warn(
          `Please select at least one month or additional fee to cover the amount being paid for ${child.studentName}.`
        );
      }
    }

    setIsLoader(true);
    const payload = {
      studentId: child.studentId,
      session,
      paymentDetails: {
        regularFees: childFormData.selectedMonths.map((opt) => ({
          month: opt.value,
        })),
        additionalFees: childFormData.selectedAdditionalFees.map((fee) => ({
          name: fee.name,
          amount: fee.amount,
        })),
        pastDuesPaid: 0,
        lateFinesPaid: 0,
        concession: parseFloat(childFormData.concession) || 0,
        totalAmount: totalAmount,
        date: moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
        paymentMode: childFormData.paymentMode,
        transactionId: childFormData.transactionId || undefined,
        chequeNumber: childFormData.chequeBookNo || undefined,
        remark: childFormData.remarks || "",
      },
    };

    try {
      const response = await feescreateFeeStatus(payload);
      if (response?.success) {
        toast.success(
          response?.message ||
            `Fees submitted successfully for ${child.studentName}!`
        );
        setResponseData(response?.data);
        setIsMessageModalOpen(true);
        setTriggerRefresh((prev) => !prev);
      } else {
        toast.error(
          response?.message || `Fee submission failed for ${child.studentName}.`
        );
        setIsPreviewReady(false);
      }
    } catch (error) {
      toast.error(
        `An error occurred during submission for ${child.studentName}: ${error.message}`
      );
      setIsPreviewReady(false);
    } finally {
      setIsLoader(false);
    }
  };

  // Modal handlers
  const handleCloseMessageModal = async (sendMsg = false) => {
    setIsMessageModalOpen(false);
    if (sendMsg && responseData) {
      sendMessage(responseData);
      const receipt = await fetchReceiptData(responseData.feeReceiptNumber);
      if (receipt) {
        setPdfModalOpen(true);
      }
    } else if (sendMsg && unifiedReceiptData) {
      sendUnifiedMessage(unifiedReceiptData);
      const receipt = await fetchReceiptData(unifiedReceiptData.unifiedReceiptNumber, true);
      if (receipt) {
        setUnifiedReceiptModalOpen(true);
      }
    } else {
      if (responseData) {
        const receipt = await fetchReceiptData(responseData.feeReceiptNumber);
        if (receipt) {
          setPdfModalOpen(true);
        }
      } else if (unifiedReceiptData) {
        const receipt = await fetchReceiptData(unifiedReceiptData.unifiedReceiptNumber, true);
        if (receipt) {
          setUnifiedReceiptModalOpen(true);
        }
      }
    }
  };

  const handleClosePdfModal = (action = null) => {
    if (action === "download" && receiptData) {
      handleDownloadPdf(receiptData);
    } else if (action === "print" && receiptData) {
      handlePrintReceipt(receiptData);
    }
    setPdfModalOpen(false);
    setIsPreviewReady(false);
    resetState();
  };

  const handleCloseUnifiedReceiptModal = (action = null) => {
    if (action === "download" && receiptData) {
      handleDownloadUnifiedPdf(receiptData);
    } else if (action === "print" && receiptData) {
      handlePrintUnifiedReceipt(receiptData);
    }
    setUnifiedReceiptModalOpen(false);
    setIsPreviewReady(false);
    resetState();
  };

  // PDF and message handlers
  const handleDownloadPdf = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No receipt data available to generate PDF.");
      return;
    }
    generatePdf(dataToUse.data, [], 0, 0, 0, 0, 0, 0, "fee-receipt.pdf");
  };

  const handlePrintReceipt = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No receipt data available to print.");
      return;
    }
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Receipt</title>
          <style>
            @media print {
              body { margin: 0; }
              .receipt-container { display: flex; justify-content: space-around; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container" id="receipt-content"></div>
          <script>
            // This would be handled by FeeRecipt's useReactToPrint
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sendMessage = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No receipt data available to send message.");
      return;
    }
    FeeResponse(dataToUse);
  };

  const handleDownloadUnifiedPdf = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No unified receipt data available to generate PDF.");
      return;
    }
    generatePdf(dataToUse.data, [], 0, 0, 0, 0, 0, 0, "unified-receipt.pdf");
  };

  const handlePrintUnifiedReceipt = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No unified receipt data available to print.");
      return;
    }
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>Print Unified Receipt</title>
          <style>
            @media print {
              body { margin: 0; }
              .receipt-container { display: flex; justify-content: space-around; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-container" id="receipt-content"></div>
          <script>
            window.print();
            window.close();
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const sendUnifiedMessage = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No unified receipt data available to send message.");
      return;
    }
    FeeResponse(dataToUse);
  };

  return (
    <div className="px-4 py-4">
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <ReactInput
          type="text"
          label="Search by Name"
          onChange={handleSearch}
          value={searchTerm}
          containerClassName="flex-1 min-w-[200px]"
        />
        <ReactInput
          type="text"
          label="Search by Adm. No"
          onChange={handleSearchbyAdmissionNo}
          value={searchTermbyadmissionNo}
          containerClassName="flex-1 min-w-[200px]"
        />
      </div>
      {filteredStudents.length > 0 && (
        <div className="relative">
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="p-3 border-b cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
                onClick={() => {
                  handleStudentClick(student.parentId);
                  setFilteredStudents([]);
                }}
              >
                <span className="font-semibold text-gray-800">
                  {student.studentName}
                </span>
                <span className="text-sm text-gray-600 block sm:inline sm:ml-2">
                  (Adm: {student.admissionNumber}, Class: {student.class},
                  Parent: {student.fatherName})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      {showChildForms && parentData.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-700">
              Selected Student(s) Fee Payment
            </h2>
            {selectedChildrenIndices.length > 1 && (
              <Button
                name="Siblings Fee Payment"
                onClick={handleUnifiedFeePayment}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              />
            )}
          </div>
          <div className="flex flex-col gap-4">
            {parentData.map((child, index) => {
              const currentFormData = formData[index];
              if (!currentFormData || currentFormData.error) {
                return (
                  <div
                    key={child._id || index}
                    className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
                    role="alert"
                  >
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline">
                      Could not load fee data for {child.studentName} (Adm:{" "}
                      {child.admissionNumber}).
                    </span>
                  </div>
                );
              }

              const isSelected = selectedChildrenIndices.includes(index);
              const showForm = showFormFlags[index];

              return (
                <div
                  key={child._id || index}
                  className={`bg-white rounded-lg shadow border transition-all duration-300 ${
                    isSelected
                      ? "border-blue-500 ring-1 ring-blue-300"
                      : "border-gray-200"
                  } overflow-hidden`}
                >
                  <div
                    className="flex items-center p-3 border-b bg-gray-50 cursor-pointer"
                    onClick={() => handleChildSelection(index)}
                  >
                    <input
                      type="checkbox"
                      id={`child-checkbox-${index}`}
                      checked={isSelected}
                      onChange={() => handleChildSelection(index)}
                      className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      aria-labelledby={`child-label-${index}`}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <label
                      id={`child-label-${index}`}
                      htmlFor={`child-checkbox-${index}`}
                      className="flex-grow cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-lg font-semibold text-blue-800">
                            {child.studentName}
                          </span>
                          <span className="text-sm text-gray-600 ml-2">
                            (Class: {child.class} / Adm#:{" "}
                            {child.admissionNumber})
                          </span>
                        </div>
                        <span
                          className={`text-sm font-medium px-2 py-0.5 rounded ${
                            isSelected
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </div>
                      <div className="flex flex-wrap justify-start items-center gap-x-3 text-xs mt-1">
                        <span className="text-red-600 font-medium">
                          Total Dues: ₹
                          {currentFormData?.totalDues?.toFixed(2) || "0.00"}
                        </span>
                        {currentFormData?.lateFine > 0 && (
                          <span className="text-orange-600 font-medium">
                            Late Fine: ₹{currentFormData?.lateFine?.toFixed(2)}
                          </span>
                        )}
                        {currentFormData?.pastDues > 0 && (
                          <span className="text-purple-600 font-medium">
                            Past Dues: ₹{currentFormData?.pastDues?.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </label>
                  </div>

                  {showForm && (
                    <div className="p-4 border-t md:flex md:gap-4">
                      <form
                        onSubmit={(e) => handleSubmit(e, index)}
                        className="flex-grow md:w-2/3 space-y-4 mb-4 md:mb-0"
                      >
                        <div className="border rounded p-3 bg-gray-50">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Months (Class Fee: ₹
                            {currentFormData.classFee}/month)
                          </label>
                          <Select
                            isMulti
                            options={currentFormData.regularFees
                              .filter((fee) => fee.status !== "Paid")
                              .map((fee) => ({
                                value: fee.month,
                                label: `${
                                  fee.month
                                } (Due: ₹${fee.dueAmount.toFixed(2)})`,
                                due: fee.dueAmount,
                              }))}
                            value={currentFormData.selectedMonths}
                            onChange={(opts) =>
                              handleMonthSelection(index, opts)
                            }
                            placeholder="Select months to pay (Sequentially)..."
                            styles={customSelectStyles}
                            closeMenuOnSelect={false}
                          />
                        </div>

                        <div className="border rounded p-3 bg-gray-50">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Additional Fees
                          </label>
                          <Select
                            isMulti
                            options={currentFormData.availableAdditionalFees}
                            value={currentFormData.availableAdditionalFees.filter(
                              (opt) =>
                                currentFormData.selectedAdditionalFees.some(
                                  (sel) => sel.name === opt.name
                                )
                            )}
                            onChange={(opts) =>
                              handleAdditionalFeesChange(index, opts)
                            }
                            placeholder="Select additional fees..."
                            closeMenuOnSelect={false}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <ReactInput
                            type="number"
                            label="Concession (-)"
                            value={currentFormData.concession}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "concession",
                                e.target.value
                              )
                            }
                            min="0"
                            step="0.01"
                          />
                          <ReactInput
                            type="number"
                            label="Total Amount to Pay (*)"
                            value={currentFormData.totalAmount}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "totalAmount",
                                e.target.value
                              )
                            }
                            min="0.01"
                            step="0.01"
                            isRequired={true}
                          />
                          <div>
                            <label className="block text-sm font-medium text-gray-700">
                              Payment Mode (*)
                            </label>
                            <select
                              value={currentFormData.paymentMode}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "paymentMode",
                                  e.target.value
                                )
                              }
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              required
                            >
                              <option value="Cash">Cash</option>
                              <option value="Online">Online</option>
                              <option value="Cheque">Cheque</option>
                              <option value="Card">Card</option>
                            </select>
                          </div>
                          <ReactInput
                            type="date"
                            label="Payment Date (*)"
                            value={currentFormData.date}
                            onChange={(e) =>
                              handleInputChange(index, "date", e.target.value)
                            }
                            isRequired={true}
                          />
                          {(currentFormData.paymentMode === "Online" ||
                            currentFormData.paymentMode === "Card") && (
                            <ReactInput
                              type="text"
                              label="Transaction ID (*)"
                              value={currentFormData.transactionId}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "transactionId",
                                  e.target.value
                                )
                              }
                              isRequired={true}
                            />
                          )}
                          {currentFormData.paymentMode === "Cheque" && (
                            <ReactInput
                              type="text"
                              label="Cheque Number (*)"
                              value={currentFormData.chequeBookNo}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "chequeBookNo",
                                  e.target.value
                                )
                              }
                              isRequired={true}
                            />
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Remarks
                          </label>
                          <textarea
                            value={currentFormData.remarks}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "remarks",
                                e.target.value
                              )
                            }
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            rows="2"
                            placeholder="Optional remarks..."
                          />
                        </div>

                        <div className="flex justify-end pt-4 border-t">
                          <Button
                            type="submit"
                            name={`Submit Payment for ${child.studentName}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          />
                        </div>
                      </form>

                      <div className="flex-shrink-0 md:w-1/3 border rounded p-4 bg-blue-50 md:ml-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-3 border-b pb-2">
                          Fee Summary
                        </h3>
                        <table className="w-full text-sm">
                          <tbody>
                            {currentFormData.lateFine > 0 && (
                              <tr className="border-b border-blue-100">
                                <td className="text-gray-700 py-1.5">
                                  Late Fines:
                                </td>
                                <td className="font-medium text-orange-700 py-1.5 text-right">
                                  ₹{currentFormData.lateFine.toFixed(2)}
                                </td>
                              </tr>
                            )}
                            {currentFormData.pastDues > 0 && (
                              <tr className="border-b border-blue-100">
                                <td className="text-gray-700 py-1.5">
                                  Past Dues:
                                </td>
                                <td className="font-medium text-purple-700 py-1.5 text-right">
                                  ₹{currentFormData.pastDues.toFixed(2)}
                                </td>
                              </tr>
                            )}
                            {currentFormData.selectedMonths.length > 0 && (
                              <tr className="border-b border-blue-100">
                                <td
                                  colSpan="2"
                                  className="pt-2 pb-1 font-medium text-gray-800"
                                >
                                  Selected Regular Fees:
                                </td>
                              </tr>
                            )}
                            {currentFormData.selectedMonths.map(
                              (monthOption, i) => {
                                const fee = currentFormData.regularFees.find(
                                  (f) => f.month === monthOption.value
                                );
                                return (
                                  <tr
                                    key={`reg-${index}-${i}`}
                                    className="border-b border-blue-100"
                                  >
                                    <td className="text-gray-600 py-1.5 pl-2">
                                      {monthOption.value}:
                                    </td>
                                    <td className="font-medium text-blue-700 py-1.5 text-right">
                                      ₹{(fee?.dueAmount || 0).toFixed(2)}
                                    </td>
                                  </tr>
                                );
                              }
                            )}
                            {currentFormData.selectedAdditionalFees.length >
                              0 && (
                              <tr className="border-b border-blue-100">
                                <td
                                  colSpan="2"
                                  className="pt-2 pb-1 font-medium text-gray-800"
                                >
                                  Selected Additional Fees:
                                </td>
                              </tr>
                            )}
                            {currentFormData.selectedAdditionalFees.map(
                              (fee, i) => (
                                <tr
                                  key={`add-${index}-${i}`}
                                  className="border-b border-blue-100"
                                >
                                  <td className="text-gray-600 py-1.5 pl-2">
                                    {fee.name}:
                                  </td>
                                  <td className="font-medium text-blue-700 py-1.5 text-right">
                                    ₹{(fee?.amount || 0).toFixed(2)}
                                  </td>
                                </tr>
                              )
                            )}
                            {currentFormData.concession > 0 && (
                              <tr className="border-b border-blue-100">
                                <td className="text-green-700 py-1.5">
                                  Concession:
                                </td>
                                <td className="font-medium text-green-700 py-1.5 text-right">
                                  - ₹
                                  {parseFloat(
                                    currentFormData.concession
                                  ).toFixed(2)}
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot className="border-t-2 border-blue-200">
                            <tr>
                              <td className="pt-2 font-semibold text-blue-900 py-1.5">
                                Net Payable (Selected):
                              </td>
                              <td className="pt-2 font-semibold text-blue-900 py-1.5 text-right">
                                ₹{calculateNetPayableAmount(index).toFixed(2)}
                              </td>
                            </tr>
                            {(() => {
                              const distribution =
                                calculateAutoDistribution(index);
                              return (
                                <>
                                  {parseFloat(currentFormData.totalAmount) >
                                    0 && (
                                    <tr>
                                      <td className="text-gray-700 py-1.5">
                                        Amount Paying:
                                      </td>
                                      <td className="font-medium text-black py-1.5 text-right">
                                        ₹
                                        {parseFloat(
                                          currentFormData.totalAmount
                                        ).toFixed(2)}
                                      </td>
                                    </tr>
                                  )}
                                  <tr>
                                    <td className="font-semibold text-red-700 py-1.5">
                                      Remaining Dues:
                                    </td>
                                    <td className="font-semibold text-red-700 py-1.5 text-right">
                                      ₹{distribution.remainingDues.toFixed(2)}
                                    </td>
                                  </tr>
                                  {distribution.remainingAfterDistribution >
                                    0 && (
                                    <tr>
                                      <td className="font-semibold text-green-700 py-1.5 text-sm">
                                        (Excess Paid):
                                      </td>
                                      <td className="font-semibold text-green-700 py-1.5 text-right text-sm">
                                        ₹
                                        {distribution.remainingAfterDistribution.toFixed(
                                          2
                                        )}
                                      </td>
                                    </tr>
                                  )}
                                </>
                              );
                            })()}
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {showChildForms && childFeeHistory?.monthlyStatus?.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
            Fee History for {childFeeHistory?.studentName || "Selected Student"}{" "}
            ({childFeeHistory?.session || session})
          </h2>
          <div>
            <MonthFeeCard childFeeHistory={childFeeHistory} />
          </div>
        </div>
      )}
      <Modal
        setIsOpen={setIsMessageModalOpen}
        isOpen={isMessageModalOpen}
        title="Send Confirmation?"
        maxWidth="sm"
      >
        <div className="p-4">
          <p className="text-gray-700 mb-4">
            Fee submitted successfully for{" "}
            {responseData?.student?.studentName ||
              unifiedReceiptData?.students
                ?.map((s) => s.studentName)
                .join(", ") ||
              "student(s)"}
            . Do you want to send an SMS confirmation to the parent (
            {responseData?.parent?.fatherPhone ||
              unifiedReceiptData?.parent?.fatherPhone ||
              "N/A"}
            )?
          </p>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <Button
              type="button"
              name="Yes, Send SMS"
              onClick={() => handleCloseMessageModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2"
            />
            <Button
              type="button"
              name="No, Skip Message"
              onClick={() => handleCloseMessageModal(false)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
            />
          </div>
        </div>
      </Modal>
      <Modal
        setIsOpen={setPdfModalOpen}
        isOpen={pdfModalOpen}
        title="Single Receipt Preview"
        maxWidth="lg"
      >
        <div className="p-4">
          {receiptData && isPreviewReady ? (
            <FeeRecipt
              modalData={receiptData}
              handleCloseModal={() => handleClosePdfModal()}
            />
          ) : (
            <p>Loading receipt preview...</p>
          )}
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
            <Button
              type="button"
              name="Print Receipt"
              onClick={() => handleClosePdfModal("print")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!isPreviewReady}
            />
            <Button
              type="button"
              name="Download PDF"
              onClick={() => handleClosePdfModal("download")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!isPreviewReady}
            />
            <Button
              type="button"
              name="Close"
              onClick={() => handleClosePdfModal()}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white"
            />
          </div>
        </div>
      </Modal>
      <Modal
        setIsOpen={setUnifiedReceiptModalOpen}
        isOpen={unifiedReceiptModalOpen}
        title="Unified Receipt Preview"
        maxWidth="lg"
      >
        <div className="p-4">
          {receiptData && isPreviewReady ? (
            <FeeRecipt
              modalData={receiptData}
              handleCloseModal={() => handleCloseUnifiedReceiptModal()}
            />
          ) : (
            <p>Loading unified receipt preview...</p>
          )}
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-3 sm:gap-3">
            <Button
              type="button"
              name="Print Receipt"
              onClick={() => handleCloseUnifiedReceiptModal("print")}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!isPreviewReady}
            />
            <Button
              type="button"
              name="Download PDF"
              onClick={() => handleCloseUnifiedReceiptModal("download")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!isPreviewReady}
            />
            <Button
              type="button"
              name="Close"
              onClick={() => handleCloseUnifiedReceiptModal()}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CreateFees;





// import axios from "axios";
// import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
// import Select from "react-select";
// import { toast } from "react-toastify";
// import {
//     ActiveStudents,
//     feescreateFeeStatus,
//     LateFines,
//     parentandchildwithID,
// } from "../../Network/AdminApi";
// import Button from "../../Dynamic/utils/Button";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import MonthFeeCard from "./MonthFeeCard";
// import moment from "moment"; // Simplified import
// import { FeeResponse } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator"; // Assuming you might use this later

// // Custom styles for react-select
// const customSelectStyles = {
//     option: (provided, state) => ({
//         ...provided,
//         // Display due amount in red if > 0 for regular fees
//         color: state.data.due > 0 ? "red" : "black",
//         fontSize: "14px",
//     }),
//     multiValue: (provided) => ({
//         ...provided,
//         backgroundColor: "#e0f7fa",
//     }),
//     multiValueLabel: (provided) => ({
//         ...provided,
//         color: "#006064",
//     }),
// };

// // --- Helper Function to fetch Additional Fees ---
// const fetchAdditionalFeesForClass = async (className, authToken) => {
//     try {
//         const response = await axios.get(
//             `https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true&className=${className}`, // Filter by class directly if API supports
//             {
//                 withCredentials: true,
//                 headers: { Authorization: `Bearer ${authToken}` },
//             }
//         );
//         if (response?.data?.success) {
//             // Filter again client-side for safety if API doesn't strictly enforce filter
//             const filteredFees = response.data.data.filter(fee => fee.className === className);
//             return filteredFees.map((fee) => ({
//                 label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`, // More informative label
//                 value: fee.amount, // value might be better as fee._id or fee.name for uniqueness
//                 name: fee.name,
//                 type: fee.feeType,
//                 id: fee._id // Add identifier if needed
//             }));
//         } else {
//             toast.error(`Failed to fetch additional fees for class ${className}.`);
//             return [];
//         }
//     } catch (error) {
//         toast.error(`Error fetching additional fees for class ${className}: ${error.message}`);
//         return [];
//     }
// };
// // ---

// const CreateFees = () => {
//     const session = JSON.parse(localStorage.getItem("session"));
//     const { setIsLoader } = useStateContext();
//     const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Renamed for clarity
//     const [responseData, setResponseData] = useState(null); // Initialize as null
//     const [showChildForms, setShowChildForms] = useState(false); // Use a more descriptive name instead of modalOpen
//     const [selectedChildrenIndices, setSelectedChildrenIndices] = useState([]); // Store indices
//     const [childFeeHistory, setChildFeeHistory] = useState(null); // Store history for ONE child shown below
//     const [filteredStudents, setFilteredStudents] = useState([]);
//     const [showFormFlags, setShowFormFlags] = useState([]); // Renamed for clarity
//     const [triggerRefresh, setTriggerRefresh] = useState(false); // Renamed for clarity
//     const [searchTerm, setSearchTerm] = useState("");
//     const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//     const [parentData, setParentData] = useState([]);
//     const [allStudent, setAllStudent] = useState([]);
//     const [formData, setFormData] = useState([]); // Array to hold form data for each child
//     const authToken = localStorage.getItem("token");
//     const [pdfModalOpen, setPdfModalOpen] = useState(false); // Separate modal state for PDF/receipt

//     const allMonths = [
//         "April", "May", "June", "July", "August", "September",
//         "October", "November", "December", "January", "February", "March",
//     ];

//     // Fetch initial data for students
//     const getAllStudent = useCallback(async () => {
//         setIsLoader(true);
//         try {
//             const response = await ActiveStudents();
//             setAllStudent(response?.students?.data || []);
//         } catch (error) {
//             toast.error("Failed to fetch student list.");
//             setAllStudent([]);
//         } finally {
//             setIsLoader(false);
//         }
//     }, [setIsLoader]); // Added dependencies

//     useEffect(() => {
//         getAllStudent();
//     }, [getAllStudent, triggerRefresh]); // Added triggerRefresh

//     // Search handlers
//     const handleSearch = (event) => {
//         const searchValue = event.target.value.toLowerCase().trim();
//         setSearchTerm(searchValue);
//         if (searchValue === "") {
//             setFilteredStudents([]);
//         } else {
//             const filtered = allStudent.filter(
//                 (student) =>
//                     student.studentName &&
//                     student.studentName.toLowerCase().includes(searchValue)
//             );
//             setFilteredStudents(filtered);
//         }
//         setSearchTermbyadmissionNo(""); // Clear other search input
//     };

//     const handleSearchbyAdmissionNo = (event) => {
//         const searchValue = event.target.value.toLowerCase().trim();
//         setSearchTermbyadmissionNo(searchValue);
//         if (searchValue === "") {
//             setFilteredStudents([]);
//         } else {
//             const filtered = allStudent.filter(
//                 (student) =>
//                     student.admissionNumber &&
//                     student.admissionNumber.toLowerCase().includes(searchValue)
//             );
//             setFilteredStudents(filtered);
//         }
//         setSearchTerm(""); // Clear other search input
//     };

//     // Fetch student fee info using getStudentFeeInfo API
//     const fetchStudentFeeInfo = async (studentId) => {
//         try {
//             const response = await axios.get(
//                 `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//                 {
//                     withCredentials: true,
//                     headers: { Authorization: `Bearer ${authToken}` },
//                 }
//             );
//             if (response.data.success) {
//                 return response.data.data;
//             } else {
//                 toast.error(
//                     `Fee info fetch failed for student ID ${studentId}: ${response.data.message || "Unknown error"}`
//                 );
//                 return null;
//             }
//         } catch (error) {
//             toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
//             return null;
//         }
//     };

//     // Reset Function
//     const resetState = () => {
//         setSelectedChildrenIndices([]);
//         setChildFeeHistory(null);
//         setShowFormFlags([]);
//         setParentData([]);
//         setFormData([]);
//         setSearchTerm("");
//         setSearchTermbyadmissionNo("");
//         setFilteredStudents([]);
//         setShowChildForms(false); // Hide the forms section
//         setResponseData(null);
//         setIsMessageModalOpen(false);
//         setPdfModalOpen(false);
//     }

//     // Modal and student selection
//     const handleStudentClick = async (parentId) => {
//         setIsLoader(true);
//         setChildFeeHistory(null); // Clear previous history display
//         try {
//             const parentResponse = await parentandchildwithID(parentId);
//             if (!parentResponse?.success) {
//                 toast.error(parentResponse?.message || "Failed to fetch parent/child data.");
//                 resetState(); // Reset state on failure
//                 return;
//             }

//             const children = parentResponse?.children || [];
//             if (children.length === 0) {
//                 toast.info("No children found for this parent.");
//                 resetState();
//                 return;
//             }

//             setParentData(children);

//             // --- Fetch fee info and additional fees CONCURRENTLY ---
//             const promises = children.map(child => Promise.all([
//                 fetchStudentFeeInfo(child.studentId),
//                 fetchAdditionalFeesForClass(child.class, authToken) // Fetch additional fees per child's class
//             ]));

//             const results = await Promise.all(promises);
//             // ---

//             const initialFormData = [];
//             const initialShowFormFlags = [];

//             results.forEach(([feeInfo, availableAdditionalFees], index) => {
//                 const child = children[index];

//                 if (!feeInfo) {
//                     toast.error(`Could not load fee details for ${child.studentName}. Skipping.`);
//                     initialShowFormFlags.push(false);
//                     initialFormData.push({
//                         admissionNumber: child.admissionNumber,
//                         studentId: child.studentId,
//                         className: child.class,
//                         error: true, // Flag indicating data fetch error
//                     });
//                     return; // Skip to next child
//                 }

//                 const regularFeeAmount = feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
//                 const additionalFeesStructure = feeInfo.feeStructure?.additionalFees || [];
//                 const monthlyStatus = feeInfo.monthlyStatus || [];

//                 // Prepare regular fees with due amounts
//                 const regularFees = allMonths.map((month) => {
//                     const monthData = monthlyStatus.find((m) => m.month === month);
//                     const due = monthData?.regularFee?.due ?? regularFeeAmount; // Use ?? for nullish coalescing
//                     const status = monthData?.regularFee?.status || "Unpaid";
//                     return {
//                         month,
//                         paidAmount: "", // Input field (might be obsolete if not used)
//                         dueAmount: status === "Paid" ? 0 : due, // If paid, due is 0
//                         totalAmount: regularFeeAmount,
//                         status: status,
//                     };
//                 });

//                 // Prepare structured additional fees details from feeInfo (if needed for display, not selection)
//                 const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
//                     name: fee.name,
//                     type: fee.feeType,
//                     amount: fee.amount,
//                     months: allMonths.map((month) => {
//                         const monthData = monthlyStatus.find((m) => m.month === month);
//                         const addFee = monthData?.additionalFees.find((af) => af.name === fee.name);
//                         const due = addFee?.due ?? fee.amount; // Default to full amount if no status
//                         const status = addFee?.status || "Unpaid";
//                         return {
//                             month,
//                             paidAmount: "", // Input field
//                             dueAmount: status === "Paid" ? 0 : due,
//                             totalAmount: fee.amount,
//                             status: status,
//                         };
//                     }),
//                 }));


//                 initialFormData.push({
//                     admissionNumber: child.admissionNumber,
//                     studentId: child.studentId,
//                     studentName: child.studentName, // Store name for easier reference
//                     className: child.class,
//                     classFee: regularFeeAmount,
//                     totalAmount: "", // User input for payment
//                     selectedMonths: [], // Array of { value: month, label: ..., due: ... }
//                     selectedAdditionalFees: [], // Array of { name, amount, type }
//                     paymentMode: "Cash",
//                     transactionId: "",
//                     chequeBookNo: "",
//                     lateFine: feeInfo.feeStatus?.totalLateFines || 0,
//                     concession: "",
//                     date: moment().format("YYYY-MM-DD"), // Store in YYYY-MM-DD for input field compatibility
//                     remarks: "",
//                     monthlyDues: feeInfo.feeStatus?.monthlyDues || { regularDues: [], additionalDues: [] },
//                     additionalFeeDetails: additionalFeeDetails, // Store detailed status if needed elsewhere
//                     pastDues: feeInfo.feeStatus?.pastDues || 0,
//                     totalDues: feeInfo.feeStatus?.dues || 0, // Overall due for display
//                     regularFees, // Holds status and due amount per month
//                     availableAdditionalFees: availableAdditionalFees, // <<< STORED PER CHILD
//                     feeInfo, // Store the full fee info for reference or detailed display
//                     error: false, // No error fetching data
//                 });
//                 initialShowFormFlags.push(false); // Initially hide form
//             });

//             setFormData(initialFormData);
//             setSelectedChildrenIndices([]); // Clear previous selections
//             setShowFormFlags(initialShowFormFlags);
//             setShowChildForms(true); // Show the child forms section

//         } catch (error) {
//             toast.error("An error occurred while fetching student data.");
//             console.error("Error in handleStudentClick:", error);
//             resetState();
//         } finally {
//             setIsLoader(false);
//         }
//     };

//     // Child selection within modal
//     const handleChildSelection = (index) => {
//         if (!formData[index] || formData[index].error) {
//             toast.warn(`Cannot select ${parentData[index]?.studentName}. Fee data may be missing.`);
//             return;
//         }

//         const isCurrentlySelected = selectedChildrenIndices.includes(index);
//         const updatedSelectedChildren = isCurrentlySelected
//             ? selectedChildrenIndices.filter(i => i !== index)
//             : [...selectedChildrenIndices, index];

//         const updatedShowFormFlags = [...showFormFlags];
//         updatedShowFormFlags[index] = !isCurrentlySelected; // Toggle form visibility

//         setSelectedChildrenIndices(updatedSelectedChildren);
//         setShowFormFlags(updatedShowFormFlags);

//         // Update fee history display
//         if (!isCurrentlySelected) {
//             setChildFeeHistory(formData[index].feeInfo); // Show history of newly opened form
//         } else if (updatedSelectedChildren.length === 0) {
//              setChildFeeHistory(null); // Clear history if no child is selected
//         } else if (updatedSelectedChildren.length > 0 && !updatedSelectedChildren.includes(index)) {
//              // If the deselected child was the one whose history was showing,
//              // show the history of the *last* remaining selected child.
//              const lastSelectedIndex = updatedSelectedChildren[updatedSelectedChildren.length - 1];
//              setChildFeeHistory(formData[lastSelectedIndex]?.feeInfo || null);
//         }
//         // If multiple remain selected after deselecting one that wasn't shown, history remains as is.
//     };


//     // Form input handlers
//     const handleInputChange = (index, field, value) => {
//         const updatedFormData = [...formData];
//         updatedFormData[index] = { ...updatedFormData[index], [field]: value };

//         if (field === 'paymentMode') {
//             if (value !== 'Online' && value !== 'Card') {
//                 updatedFormData[index].transactionId = '';
//             }
//             if (value !== 'Cheque') {
//                 updatedFormData[index].chequeBookNo = '';
//             }
//         }

//         setFormData(updatedFormData);
//     };

//     // *** MODIFIED handleMonthSelection ***
//     const handleMonthSelection = (index, selectedOptions) => {
//         const selectedMonthsData = selectedOptions || [];
//         const updatedFormData = [...formData]; // Get current form data state

//         if (selectedMonthsData.length <= 1) {
//             // Always valid if 0 or 1 month is selected
//             updatedFormData[index].selectedMonths = selectedMonthsData;
//             setFormData(updatedFormData); // Update the state
//             return;
//         }

//         // More than one month selected, check for sequence
//         const selectedMonthNames = selectedMonthsData.map(opt => opt.value);

//         // Get indices in the master list and sort them
//         const indicesInAllMonths = selectedMonthNames
//             .map(month => allMonths.indexOf(month))
//             .sort((a, b) => a - b); // Sort numerically

//         let isSequential = true;
//         // Check if each index is exactly one greater than the previous one
//         for (let i = 1; i < indicesInAllMonths.length; i++) {
//             if (indicesInAllMonths[i] !== indicesInAllMonths[i - 1] + 1) {
//                 isSequential = false;
//                 break;
//             }
//         }

//         if (isSequential) {
//             // Valid sequence: Update the state
//             updatedFormData[index].selectedMonths = selectedMonthsData;
//             setFormData(updatedFormData);
//         } else {
//             // Invalid sequence: Show warning and DO NOT update state
//             toast.warn(`Please select months in a continuous sequence (e.g., April, May, June).`);
//             // Do not call setFormData here. This keeps the previous valid state for formData[index].selectedMonths.
//             // Note: The react-select component might visually show the invalid selection momentarily,
//             // but the internal application state (formData) remains unchanged.
//         }
//     };
//     // *** END MODIFIED handleMonthSelection ***

//     const handleAdditionalFeesChange = (index, selectedOptions) => {
//         const selectedFeesData = selectedOptions || [];
//         const updatedFormData = [...formData];
//         updatedFormData[index].selectedAdditionalFees = selectedFeesData.map(opt => ({
//             name: opt.name,
//             amount: opt.value, // This is the defined amount of the fee
//             type: opt.type,
//             // id: opt.id // Include id if needed by payload
//         }));
//         setFormData(updatedFormData);
//     };


//     const calculateNetPayableAmount = useCallback((index) => {
//         const data = formData[index];
//         if (!data || data.error) return 0;

//         let total = 0;
//         total += parseFloat(data.lateFine) || 0;
//         total += parseFloat(data.pastDues) || 0; // Include past dues

//         // Sum dues from selected regular fee months
//         const regularFeeTotal = data.selectedMonths.reduce((sum, monthOption) => {
//             const fee = data.regularFees.find((f) => f.month === monthOption.value);
//             return sum + (fee?.dueAmount || 0);
//         }, 0);
//         total += regularFeeTotal;

//         // Sum amounts from selected additional fees
//         const additionalFeeTotal = data.selectedAdditionalFees.reduce((sum, fee) => {
//             // Find the corresponding detail in availableAdditionalFees to get the correct amount if needed,
//             // but we stored the correct amount directly in selectedAdditionalFees during selection.
//             return sum + (fee?.amount || 0);
//         }, 0);
//         total += additionalFeeTotal;

//         // Subtract concession
//         total -= parseFloat(data.concession) || 0;

//         return Math.max(0, total); // Ensure non-negative
//     }, [formData]); // Dependency: formData

//     // --- Auto Distribution Calculation (for display/confirmation) ---
//     const calculateAutoDistribution = useCallback((index) => {
//         const data = formData[index];
//         const netPayable = calculateNetPayableAmount(index); // Total due for selected items
//         const totalAmountPaid = parseFloat(data.totalAmount) || 0; // Amount user pays

//         // This simplified version just calculates the final remaining dues.
//         // Backend handles actual allocation.
//         const remainingDues = Math.max(0, netPayable - totalAmountPaid);
//         const remainingAfterDistribution = Math.max(0, totalAmountPaid - netPayable); // Overpayment

//         return {
//             remainingAfterDistribution,
//             remainingDues,
//         };
//     }, [formData, calculateNetPayableAmount]); // Dependencies

//     // --- PDF Generation and Messaging ---
//     const handleDownloadPdf = (dataToUse) => {
//         if (!dataToUse) {
//             toast.error("No receipt data available to generate PDF.");
//             return;
//         }
//         generatePdf(dataToUse); // Call your PDF generator function
//         // Don't close/reset here, handleClosePdfModal will do it
//     };

//     const sendMessage = (dataToUse) => {
//         if (!dataToUse) {
//             toast.error("No receipt data available to send message.");
//             return;
//         }
//         console.log("Sending message for data:", dataToUse);
//         FeeResponse(dataToUse); // Call your message sending function
//         // State reset is handled after this in the modal close logic
//     };


//     // --- Form Submission ---
//     const handleSubmit = async (e, childIndex) => {
//         e.preventDefault();
//         e.stopPropagation();

//         const childFormData = formData[childIndex];
//         const child = parentData[childIndex];

//         if (!childFormData || childFormData.error) {
//             toast.error(`Cannot submit for ${child?.studentName || 'this student'} due to missing data.`);
//             return;
//         }

//         // --- Validations ---
//         const totalAmount = parseFloat(childFormData.totalAmount) || 0;
//         if (totalAmount <= 0) {
//             toast.warn(`Please enter a valid amount to pay for ${child.studentName}.`);
//             return;
//         }
//         if (!childFormData.paymentMode) {
//             toast.error(`Payment mode is required for ${child.studentName}.`);
//             return;
//         }
//         if ((childFormData.paymentMode === "Online" || childFormData.paymentMode === "Card") && !childFormData.transactionId) {
//             toast.error(`Transaction ID is required for Online/Card payment for ${child.studentName}.`);
//             return;
//         }
//         if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
//             toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}.`);
//             return;
//         }
//         // Check if paying anything towards current fees requires selection
//          if (totalAmount > 0 && childFormData.selectedMonths.length === 0 && childFormData.selectedAdditionalFees.length === 0) {
//              // Check if the payment amount is ONLY covering past dues and/or late fines
//              const duesAndFines = (parseFloat(childFormData.pastDues) || 0) + (parseFloat(childFormData.lateFine) || 0);
//              if (totalAmount > duesAndFines) {
//                 toast.warn(`Please select at least one month or additional fee to cover the amount being paid for ${child.studentName}.`);
//                 return;
//              }
//              // Allow payment if it's only for past dues/fines and doesn't exceed their sum.
//          }

//         // --- Payload Construction ---
//         setIsLoader(true);
//         const payload = {
//             studentId: child.studentId,
//             session,
//             // mode: "auto", // Backend likely determines distribution mode
//             paymentDetails: {
//                 regularFees: childFormData.selectedMonths.map(opt => ({ month: opt.value })),
//                 additionalFees: childFormData.selectedAdditionalFees.map(fee => ({
//                     name: fee.name,
//                     amount: fee.amount // Send the fee's defined amount
//                     // id: fee.id // Send ID if backend requires it
//                 })),
//                 pastDuesPaid: 0, // Let backend calculate distribution
//                 lateFinesPaid: 0, // Let backend calculate distribution
//                 concession: parseFloat(childFormData.concession) || 0,
//                 totalAmount: totalAmount,
//                 date: moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
//                 paymentMode: childFormData.paymentMode,
//                 transactionId: childFormData.transactionId || undefined,
//                 chequeNumber: childFormData.chequeBookNo || undefined,
//                 remark: childFormData.remarks || "",
//             },
//         };

//         console.log("Submitting payload:", JSON.stringify(payload, null, 2));

//         try {
//             const response = await feescreateFeeStatus(payload);
//             console.log("API Response:", response);

//             if (response?.success) {
//                 toast.success(response?.message || `Fees submitted successfully for ${child.studentName}!`);
//                 setResponseData(response?.data); // Store response data for modals
//                 setIsMessageModalOpen(true); // Trigger message confirmation modal
//                 setTriggerRefresh(prev => !prev); // Trigger background data refresh
//             } else {
//                 toast.error(response?.message || `Fee submission failed for ${child.studentName}.`);
//             }
//         } catch (error) {
//             console.error("Fee Submission Error:", error);
//             toast.error(`An error occurred during submission for ${child.studentName}: ${error.message}`);
//         } finally {
//             setIsLoader(false);
//         }
//     };

//     // Close message modal and potentially trigger PDF modal or reset
//     const handleCloseMessageModal = (sendMsg = false) => {
//         setIsMessageModalOpen(false);
//         if (sendMsg && responseData) {
//             sendMessage(responseData);
//             // After sending message, ask about PDF
//              setPdfModalOpen(true);
//         } else {
//             // If user skips message, still ask about PDF
//             setPdfModalOpen(true);
//         }
//     };

//     // Close PDF modal and reset state
//     const handleClosePdfModal = (downloadPdf = false) => {
//         if (downloadPdf && responseData) {
//             handleDownloadPdf(responseData);
//         }
//         setPdfModalOpen(false);
//         // Reset state AFTER handling PDF generation/cancellation AND closing the modal
//         resetState();
//     };


//     return (
//         <div className="px-4 py-4"> {/* Added padding */}
//             {/* Search Section */}
//             <div className="flex flex-col sm:flex-row gap-4 mb-4">
//                 <ReactInput
//                     type="text"
//                     label="Search by Name"
//                     onChange={handleSearch}
//                     value={searchTerm}
//                     containerClassName="flex-1 min-w-[200px]"
//                 />
//                 <ReactInput
//                     type="text"
//                     label="Search by Adm. No"
//                     onChange={handleSearchbyAdmissionNo}
//                     value={searchTermbyadmissionNo}
//                     containerClassName="flex-1 min-w-[200px]"
//                 />
//             </div>

//             {/* Search Results Dropdown */}
//             {filteredStudents.length > 0 && (
//                 <div className="relative">
//                     <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                         {filteredStudents.map((student) => (
//                             <div
//                                 key={student._id}
//                                 className="p-3 border-b cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
//                                 onClick={() => {
//                                     handleStudentClick(student.parentId);
//                                     setFilteredStudents([]); // Clear results after selection
//                                     // Optional: fill search bars after click
//                                     // setSearchTerm(student.studentName);
//                                     // setSearchTermbyadmissionNo(student.admissionNumber);
//                                 }}
//                             >
//                                 <span className="font-semibold text-gray-800">{student.studentName}</span>
//                                 <span className="text-sm text-gray-600 block sm:inline sm:ml-2">
//                                     (Adm: {student.admissionNumber}, Class: {student.class}, Parent: {student.fatherName})
//                                 </span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//             )}

//             {/* Student Forms Section - Conditionally Rendered */}
//             {showChildForms && parentData.length > 0 && (
//                 <div className="mt-6 border-t pt-4">
//                     <h2 className="text-xl font-semibold mb-3 text-gray-700">Selected Student(s) Fee Payment</h2>
//                     <div className="flex flex-col gap-4">
//                         {parentData.map((child, index) => {
//                             const currentFormData = formData[index];
//                             if (!currentFormData || currentFormData.error) {
//                                 return (
//                                     <div key={child._id || index} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//                                         <strong className="font-bold">Error:</strong>
//                                         <span className="block sm:inline"> Could not load fee data for {child.studentName} (Adm: {child.admissionNumber}).</span>
//                                     </div>
//                                 );
//                             }

//                             const isSelected = selectedChildrenIndices.includes(index);
//                             const showForm = showFormFlags[index];

//                             return (
//                                 <div
//                                     key={child._id || index}
//                                     className={`bg-white rounded-lg shadow border transition-all duration-300 ${isSelected ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200"
//                                         } overflow-hidden`}
//                                 >
//                                     {/* Child Header */}
//                                     <div className="flex items-center p-3 border-b bg-gray-50 cursor-pointer" onClick={() => handleChildSelection(index)}>
//                                         <input
//                                             type="checkbox"
//                                             id={`child-checkbox-${index}`}
//                                             checked={isSelected}
//                                             onChange={() => handleChildSelection(index)}
//                                             className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                                             aria-labelledby={`child-label-${index}`}
//                                             onClick={(e) => e.stopPropagation()} // Prevent label click from double-triggering if checkbox clicked directly
//                                         />
//                                         <label
//                                             id={`child-label-${index}`}
//                                             htmlFor={`child-checkbox-${index}`}
//                                             className="flex-grow cursor-pointer" // Ensure label is clickable
//                                         >
//                                             <div className="flex justify-between items-center">
//                                                 <div>
//                                                     <span className="text-lg font-semibold text-blue-800">
//                                                         {child.studentName}
//                                                     </span>
//                                                     <span className="text-sm text-gray-600 ml-2">
//                                                         (Class: {child.class} / Adm#: {child.admissionNumber})
//                                                     </span>
//                                                 </div>
//                                                 <span className={`text-sm font-medium px-2 py-0.5 rounded ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
//                                                     {isSelected ? 'Selected' : 'Select'}
//                                                 </span>
//                                             </div>
//                                             <div className="flex flex-wrap justify-start items-center gap-x-3 text-xs mt-1">
//                                                 <span className="text-red-600 font-medium">
//                                                     Total Dues: ₹{currentFormData?.totalDues?.toFixed(2) || '0.00'}
//                                                 </span>
//                                                 {currentFormData?.lateFine > 0 && (
//                                                     <span className="text-orange-600 font-medium">
//                                                         Late Fine: ₹{currentFormData?.lateFine?.toFixed(2)}
//                                                     </span>
//                                                 )}
//                                                 {currentFormData?.pastDues > 0 && (
//                                                     <span className="text-purple-600 font-medium">
//                                                         Past Dues: ₹{currentFormData?.pastDues?.toFixed(2)}
//                                                     </span>
//                                                 )}
//                                             </div>
//                                         </label>
//                                     </div>

//                                     {/* Collapsible Form Area */}
//                                     {showForm && (
//                                         <div className="p-4 border-t md:flex md:gap-4">
//                                             {/* Left Side: Inputs */}
//                                             <form onSubmit={(e) => handleSubmit(e, index)} className="flex-grow md:w-2/3 space-y-4 mb-4 md:mb-0">

//                                                 {/* Regular Fees Selection */}
//                                                 <div className="border rounded p-3 bg-gray-50">
//                                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                         Select Months (Class Fee: ₹{currentFormData.classFee}/month)
//                                                     </label>
//                                                     <Select
//                                                         isMulti
//                                                         options={currentFormData.regularFees
//                                                             .filter(fee => fee.status !== "Paid") // Only show unpaid/partially paid
//                                                             .map(fee => ({
//                                                                 value: fee.month,
//                                                                 label: `${fee.month} (Due: ₹${fee.dueAmount.toFixed(2)})`,
//                                                                 due: fee.dueAmount,
//                                                             }))
//                                                         }
//                                                         value={currentFormData.selectedMonths} // Bind to the validated state value
//                                                         onChange={(opts) => handleMonthSelection(index, opts)}
//                                                         placeholder="Select months to pay (Sequentially)..."
//                                                         styles={customSelectStyles}
//                                                         closeMenuOnSelect={false}
//                                                     />
//                                                 </div>

//                                                 {/* Additional Fees Selection */}
//                                                 <div className="border rounded p-3 bg-gray-50">
//                                                     <label className="block text-sm font-medium text-gray-700 mb-1">
//                                                         Select Additional Fees
//                                                     </label>
//                                                     {/* {console.log("Rendering Select - availableAdditionalFees:", currentFormData.availableAdditionalFees)} */}
//                                                     {/* {console.log("Rendering Select - selectedAdditionalFees:", currentFormData.selectedAdditionalFees)} */}
//                                                     <Select
//                                                         isMulti
//                                                         options={currentFormData.availableAdditionalFees} // Use per-child options
//                                                         value={currentFormData.availableAdditionalFees.filter(opt =>
//                                                             currentFormData.selectedAdditionalFees.some(sel => sel.name === opt.name)
//                                                         )}
//                                                         onChange={(opts) => handleAdditionalFeesChange(index, opts)}
//                                                         placeholder="Select additional fees..."
//                                                         closeMenuOnSelect={false}
//                                                     />
//                                                 </div>

//                                                 {/* Other Inputs in a Grid */}
//                                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                                                     <ReactInput
//                                                         type="number"
//                                                         label="Concession (-)"
//                                                         value={currentFormData.concession}
//                                                         onChange={(e) => handleInputChange(index, "concession", e.target.value)}
//                                                         min="0"
//                                                         step="0.01"
//                                                     />
//                                                     <ReactInput
//                                                         type="number"
//                                                         label="Total Amount to Pay (*)"
//                                                         value={currentFormData.totalAmount}
//                                                         onChange={(e) => handleInputChange(index, "totalAmount", e.target.value)}
//                                                         min="0.01" // Minimum payable amount slightly > 0
//                                                         step="0.01"
//                                                         isRequired={true}
//                                                     />
//                                                     <div>
//                                                         <label className="block text-sm font-medium text-gray-700">Payment Mode (*)</label>
//                                                         <select
//                                                             value={currentFormData.paymentMode}
//                                                             onChange={(e) => handleInputChange(index, "paymentMode", e.target.value)}
//                                                             className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                                                             required
//                                                         >
//                                                             <option value="Cash">Cash</option>
//                                                             <option value="Online">Online</option>
//                                                             <option value="Cheque">Cheque</option>
//                                                             <option value="Card">Card</option>
//                                                         </select>
//                                                     </div>
//                                                     <ReactInput
//                                                         type="date"
//                                                         label="Payment Date (*)"
//                                                         value={currentFormData.date} // Should be YYYY-MM-DD
//                                                         onChange={(e) => handleInputChange(index, "date", e.target.value)}
//                                                         isRequired={true}
//                                                     />
//                                                     {(currentFormData.paymentMode === "Online" || currentFormData.paymentMode === "Card") && (
//                                                         <ReactInput
//                                                             type="text"
//                                                             label="Transaction ID (*)"
//                                                             value={currentFormData.transactionId}
//                                                             onChange={(e) => handleInputChange(index, "transactionId", e.target.value)}
//                                                             isRequired={true}
//                                                         />
//                                                     )}
//                                                     {currentFormData.paymentMode === "Cheque" && (
//                                                         <ReactInput
//                                                             type="text"
//                                                             label="Cheque Number (*)"
//                                                             value={currentFormData.chequeBookNo}
//                                                             onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)}
//                                                             isRequired={true}
//                                                         />
//                                                     )}
//                                                 </div>

//                                                 {/* Remarks */}
//                                                 <div className="sm:col-span-2">
//                                                     <label className="block text-sm font-medium text-gray-700">Remarks</label>
//                                                     <textarea
//                                                         value={currentFormData.remarks}
//                                                         onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
//                                                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                                                         rows="2"
//                                                         placeholder="Optional remarks..."
//                                                     />
//                                                 </div>

//                                                 {/* Submit Button for this child */}
//                                                 <div className="flex justify-end pt-4 border-t">
//                                                     <Button
//                                                         type="submit"
//                                                         name={`Submit Payment for ${child.studentName}`}
//                                                         className="bg-blue-600 hover:bg-blue-700 text-white"
//                                                     // Add disabled state based on loading
//                                                     />
//                                                 </div>
//                                             </form>

//                                             {/* Right Side: Fee Details Summary */}
//                                             <div className="flex-shrink-0 md:w-1/3 border rounded p-4 bg-blue-50 md:ml-4">
//                                                 <h3 className="text-lg font-semibold text-blue-900 mb-3 border-b pb-2">
//                                                     Fee Summary
//                                                 </h3>
//                                                 <table className="w-full text-sm">
//                                                     <tbody>
//                                                         {/* Display calculated items based on selections */}
//                                                         {currentFormData.lateFine > 0 && (
//                                                             <tr className="border-b border-blue-100">
//                                                                 <td className="text-gray-700 py-1.5">Late Fines:</td>
//                                                                 <td className="font-medium text-orange-700 py-1.5 text-right">
//                                                                     ₹{currentFormData.lateFine.toFixed(2)}
//                                                                 </td>
//                                                             </tr>
//                                                         )}
//                                                         {currentFormData.pastDues > 0 && (
//                                                             <tr className="border-b border-blue-100">
//                                                                 <td className="text-gray-700 py-1.5">Past Dues:</td>
//                                                                 <td className="font-medium text-purple-700 py-1.5 text-right">
//                                                                     ₹{currentFormData.pastDues.toFixed(2)}
//                                                                 </td>
//                                                             </tr>
//                                                         )}

//                                                         {/* Selected Regular Fees */}
//                                                         {currentFormData.selectedMonths.length > 0 && (
//                                                             <tr className="border-b border-blue-100">
//                                                                 <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-800">Selected Regular Fees:</td>
//                                                             </tr>
//                                                         )}
//                                                         {currentFormData.selectedMonths.map((monthOption, i) => {
//                                                             const fee = currentFormData.regularFees.find(f => f.month === monthOption.value);
//                                                             return (
//                                                                 <tr key={`reg-${index}-${i}`} className="border-b border-blue-100">
//                                                                     <td className="text-gray-600 py-1.5 pl-2">{monthOption.value}:</td>
//                                                                     <td className="font-medium text-blue-700 py-1.5 text-right">
//                                                                         ₹{(fee?.dueAmount || 0).toFixed(2)}
//                                                                     </td>
//                                                                 </tr>
//                                                             );
//                                                         })}

//                                                         {/* Selected Additional Fees */}
//                                                         {currentFormData.selectedAdditionalFees.length > 0 && (
//                                                             <tr className="border-b border-blue-100">
//                                                                 <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-800">Selected Additional Fees:</td>
//                                                             </tr>
//                                                         )}
//                                                         {currentFormData.selectedAdditionalFees.map((fee, i) => (
//                                                             <tr key={`add-${index}-${i}`} className="border-b border-blue-100">
//                                                                 <td className="text-gray-600 py-1.5 pl-2">{fee.name}:</td>
//                                                                 <td className="font-medium text-blue-700 py-1.5 text-right">
//                                                                     ₹{(fee?.amount || 0).toFixed(2)}
//                                                                 </td>
//                                                             </tr>
//                                                         ))}

//                                                         {/* Concession */}
//                                                         {currentFormData.concession > 0 && (
//                                                             <tr className="border-b border-blue-100">
//                                                                 <td className="text-green-700 py-1.5">Concession:</td>
//                                                                 <td className="font-medium text-green-700 py-1.5 text-right">
//                                                                     - ₹{parseFloat(currentFormData.concession).toFixed(2)}
//                                                                 </td>
//                                                             </tr>
//                                                         )}
//                                                     </tbody>
//                                                     <tfoot className="border-t-2 border-blue-200">
//                                                         <tr>
//                                                             <td className="pt-2 font-semibold text-blue-900 py-1.5">
//                                                                 Net Payable (Selected):
//                                                             </td>
//                                                             <td className="pt-2 font-semibold text-blue-900 py-1.5 text-right">
//                                                                 ₹{calculateNetPayableAmount(index).toFixed(2)}
//                                                             </td>
//                                                         </tr>
//                                                         {/* Display Remaining Dues after Potential Payment */}
//                                                         {(() => {
//                                                             const distribution = calculateAutoDistribution(index);
//                                                             return (
//                                                                 <>
//                                                                     {parseFloat(currentFormData.totalAmount) > 0 && (
//                                                                         <tr >
//                                                                             <td className="text-gray-700 py-1.5">Amount Paying:</td>
//                                                                             <td className="font-medium text-black py-1.5 text-right">
//                                                                                 ₹{parseFloat(currentFormData.totalAmount).toFixed(2)}
//                                                                             </td>
//                                                                         </tr>
//                                                                     )}
//                                                                     <tr>
//                                                                         <td className="font-semibold text-red-700 py-1.5">
//                                                                             Remaining Dues:
//                                                                         </td>
//                                                                         <td className="font-semibold text-red-700 py-1.5 text-right">
//                                                                             ₹{distribution.remainingDues.toFixed(2)}
//                                                                         </td>
//                                                                     </tr>
//                                                                     {distribution.remainingAfterDistribution > 0 && (
//                                                                         <tr>
//                                                                             <td className="font-semibold text-green-700 py-1.5 text-sm">
//                                                                                 (Excess Paid):
//                                                                             </td>
//                                                                             <td className="font-semibold text-green-700 py-1.5 text-right text-sm">
//                                                                                 ₹{distribution.remainingAfterDistribution.toFixed(2)}
//                                                                             </td>
//                                                                         </tr>
//                                                                     )}
//                                                                 </>
//                                                             );
//                                                         })()}
//                                                     </tfoot>
//                                                 </table>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             )}

//             {/* Fee History Display Area */}
//             {showChildForms && childFeeHistory?.monthlyStatus?.length > 0 && (
//                 <div className="mt-6 border-t pt-4">
//                     <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
//                         Fee History for {childFeeHistory?.studentName || 'Selected Student'} ({childFeeHistory?.session || session})
//                     </h2>
//                     <div>
//                         <MonthFeeCard childFeeHistory={childFeeHistory} />
//                     </div>
//                 </div>
//             )}

//             {/* --- Modals --- */}
//             {/* Message Confirmation Modal */}
//             <Modal
//                 setIsOpen={setIsMessageModalOpen} // Let the modal control its visibility via handler
//                 isOpen={isMessageModalOpen}
//                 title="Send Confirmation?"
//                 maxWidth="sm"
//             >
//                 <div className="p-4">
//                     <p className="text-gray-700 mb-4">
//                         Fee submitted successfully for {responseData?.student?.studentName}. Do you want to send an SMS confirmation to the parent ({responseData?.parent?.fatherPhone || 'N/A'})?
//                     </p>
//                     <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//                         <Button
//                             type="button"
//                             name="Yes, Send SMS"
//                             onClick={() => handleCloseMessageModal(true)} // Signal intent to send
//                             className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2"
//                         />
//                         <Button
//                             type="button"
//                             name="No, Skip Message"
//                             onClick={() => handleCloseMessageModal(false)} // Signal intent to skip
//                             className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
//                         />
//                     </div>
//                 </div>
//             </Modal>

//             {/* PDF / Receipt Modal */}
//             <Modal
//                 setIsOpen={setPdfModalOpen} // Let modal control visibility
//                 isOpen={pdfModalOpen}
//                 title="Generate Receipt?"
//                 maxWidth="sm"
//             >
//                 <div className="p-4">
//                     <p className="text-gray-700 mb-4">
//                         Do you want to download the fee receipt for {responseData?.student?.studentName}?
//                     </p>
//                     <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//                         <Button
//                             type="button"
//                             name="Yes, Download PDF" // Changed name for consistency
//                             onClick={() => handleClosePdfModal(true)} // Signal intent to download
//                             className="w-full bg-blue-600 hover:bg-blue-700 text-white sm:col-start-2"
//                         />
//                         <Button
//                             type="button"
//                             name="No, Finish" // Changed name for consistency
//                             onClick={() => handleClosePdfModal(false)} // Signal intent to finish
//                             className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
//                         />
//                     </div>
//                 </div>
//             </Modal>

//         </div> // End of main container
//     );
// };

// export default CreateFees;