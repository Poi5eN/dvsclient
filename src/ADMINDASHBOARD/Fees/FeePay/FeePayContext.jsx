import React, { createContext, useContext, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ActiveStudents, parentandchildwithID } from "../../../Network/AdminApi";
import moment from "moment";
import { fetchAdditionalFeesForClass } from "./utils";

const FeePayContext = createContext();

export const FeePayProvider = ({ children }) => {
  const session = JSON.parse(localStorage.getItem("session"));
  const authToken = localStorage.getItem("token");
  const [isLoader, setIsLoader] = useState(false);
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
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [unifiedReceiptModalOpen, setUnifiedReceiptModalOpen] = useState(false);
  const [unifiedReceiptData, setUnifiedReceiptData] = useState(null);
  const [receiptData, setReceiptData] = useState(null);
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  const allMonths = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March",
  ];

  const getAllStudent = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents();
      setAllStudent(response?.students?.data || []);
    } catch (error) {
      console.error("Failed to fetch student list:", error);
      toast.error("Failed to fetch student list.");
      setAllStudent([]);
    } finally {
      setIsLoader(false);
    }
  }, []);

  const fetchStudentFeeInfo = async (studentId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BASE_URL || "https://api.digitalvidyasaarthi.in"}/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.data.success) {
        return response.data.data;
      } else {
        toast.error(`Fee info fetch failed: ${response.data.message || "Unknown error"}`);
        return null;
      }
    } catch (error) {
      toast.error(`Error fetching fee info: ${error.message}`);
      return null;
    }
  };

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

  const handleStudentClick = async (parentId) => {
    setIsLoader(true);
    resetState();
    try {
      const parentResponse = await parentandchildwithID(parentId);
      if (!parentResponse?.success) {
        toast.error(parentResponse?.message || "Failed to fetch parent/child data.");
        setIsLoader(false);
        return;
      }

      const children = parentResponse?.children || [];
      if (children.length === 0) {
        toast.info("No children found for this parent.");
        setIsLoader(false);
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
          toast.error(`Could not load fee details for ${child.studentName}. Skipping.`);
          initialShowFormFlags.push(false);
          initialFormData.push({
            admissionNumber: child.admissionNumber,
            studentId: child.studentId,
            studentName: child.studentName,
            className: child.class,
            error: true,
          });
          return;
        }

        const regularFeeAmount = feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
        const additionalFeesStructure = feeInfo.feeStructure?.additionalFees || [];
        const monthlyStatus = feeInfo.monthlyStatus || [];
        const oneTimeAdditionalDues = feeInfo.oneTimeAdditionalDues || [];
        const feeHistory = feeInfo.feeStatus?.feeHistory?.[0] || {};

        const regularFees = allMonths.map((month) => {
          const monthData = monthlyStatus.find((m) => m.month === month);
          const due = monthData?.regularFee?.due ?? regularFeeAmount;
          const status = monthData?.regularFee?.status || "Unpaid";
          return {
            month,
            paidAmount: "",
            dueAmount: status === "Paid" ? 0 : due,
            totalAmount: regularFeeAmount,
            status,
            label: `${month} (Due: ₹${(status === "Paid" ? 0 : due).toFixed(2)})`,
          };
        });

        const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
          name: fee.name,
          type: fee.feeType,
          amount: fee.amount,
          months: allMonths.map((month) => {
            const monthData = monthlyStatus.find((m) => m.month === month);
            const addFee = monthData?.additionalFees.find((af) => af.name === fee.name);
            const due = addFee?.due ?? fee.amount;
            const status = addFee?.status || "Unpaid";
            return { month, paidAmount: "", dueAmount: status === "Paid" ? 0 : due, totalAmount: fee.amount, status };
          }),
        }));

        const oneTimeFeeOptions = oneTimeAdditionalDues
          .filter((d) => d.dueAmount > 0)
          .map((d) => ({
            label: `${d.name} (Due: ₹${d.dueAmount.toFixed(2)})`,
            name: d.name,
            code: d.name,
            dueAmount: d.dueAmount,
            type: "One-Time",
          }));

        const preSelectedMonths = feeHistory?.regularFees
          ?.filter((fee) => fee.dueAmount > 0 && fee.status === "Unpaid")
          .map((fee) => {
            const originalFee = regularFees.find((rf) => rf.month === fee.month);
            return {
              value: fee.month,
              label: originalFee?.label || `${fee.month} (Due: ₹${fee.dueAmount.toFixed(2)})`,
              due: fee.dueAmount,
            };
          }) || [];

        const preSelectedAdditionalFees = [];
        feeHistory?.additionalFees
          ?.filter((fee) => fee.dueAmount > 0 && fee.status === "Unpaid")
          .forEach((fee) => {
            const availableFeeOption = availableAdditionalFees.find((opt) => opt.name === fee.name && opt.type === "Monthly");
            if (availableFeeOption) {
              const existingFee = preSelectedAdditionalFees.find((pf) => pf.name === fee.name && pf.type === "Monthly");
              if (existingFee) {
                existingFee.dueMonths.push(fee.month);
                existingFee.amount += fee.dueAmount;
              } else {
                preSelectedAdditionalFees.push({
                  id: availableFeeOption.id,
                  name: availableFeeOption.name,
                  amount: fee.dueAmount,
                  type: availableFeeOption.type,
                  dueMonths: [fee.month],
                });
              }
            }
          });

        const preSelectedOneTimeFees = oneTimeFeeOptions.map((opt) => ({
          name: opt.name,
          dueAmount: opt.dueAmount,
        }));

        const childFormData = {
          admissionNumber: child.admissionNumber,
          studentId: child.studentId,
          studentName: child.studentName,
          className: child.class,
          classFee: regularFeeAmount,
          totalAmount: "",
          selectedMonths: preSelectedMonths,
          selectedAdditionalFees: preSelectedAdditionalFees,
          selectedOneTimeFees: preSelectedOneTimeFees,
          paymentMode: "Cash",
          transactionId: "",
          chequeBookNo: "",
          lateFine: feeInfo.feeStatus?.totalLateFines || 0,
          concession: "",
          date: moment().format("YYYY-MM-DD"),
          remarks: "",
          monthlyDues: feeInfo.feeStatus?.monthlyDues || { regularDues: [], additionalDues: [] },
          additionalFeeDetails,
          pastDues: feeInfo.feeStatus?.pastDues || 0,
          totalDues: feeInfo.feeStatus?.dues || 0,
          regularFees,
          availableAdditionalFees: availableAdditionalFees || [],
          oneTimeFeeOptions,
          feeInfo,
          error: false,
        };
        initialFormData.push(childFormData);
        initialShowFormFlags.push(false);
      });

      setFormData(initialFormData);
      setShowFormFlags(initialShowFormFlags);
      setShowChildForms(true);
    } catch (error) {
      toast.error("An error occurred while fetching student data.");
    } finally {
      setIsLoader(false);
    }
  };

  const value = {
    session,
    authToken,
    isLoader,
    setIsLoader,
    isMessageModalOpen,
    setIsMessageModalOpen,
    responseData,
    setResponseData,
    showChildForms,
    setShowChildForms,
    selectedChildrenIndices,
    setSelectedChildrenIndices,
    childFeeHistory,
    setChildFeeHistory,
    filteredStudents,
    setFilteredStudents,
    showFormFlags,
    setShowFormFlags,
    triggerRefresh,
    setTriggerRefresh,
    searchTerm,
    setSearchTerm,
    searchTermbyadmissionNo,
    setSearchTermbyadmissionNo,
    parentData,
    setParentData,
    allStudent,
    setAllStudent,
    formData,
    setFormData,
    pdfModalOpen,
    setPdfModalOpen,
    unifiedReceiptModalOpen,
    setUnifiedReceiptModalOpen,
    unifiedReceiptData,
    setUnifiedReceiptData,
    receiptData,
    setReceiptData,
    isPreviewReady,
    setIsPreviewReady,
    allMonths,
    getAllStudent,
    handleStudentClick,
    resetState,
  };

  return <FeePayContext.Provider value={value}>{children}</FeePayContext.Provider>;
};

export const useFeePayContext = () => useContext(FeePayContext);