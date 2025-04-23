import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import {
  ActiveStudents,
  feescreateFeeStatus,
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
import DynamicMultiSelect from "../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";

// Helper to fetch additional fees
const fetchAdditionalFeesForClass = async (className, authToken) => {
  try {
    const response = await axios.get(
      `${
        process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
      }/api/v1/adminRoute/fees/?additional=true&className=${className}`,
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
        frequency: fee.frequency,
      }));
    } else {
      console.error(
        `Failed to fetch additional fees for class ${className}:`,
        response?.data?.message
      );
      toast.error(`Failed to fetch additional fees for class ${className}.`);
      return [];
    }
  } catch (error) {
    console.error(
      `Error fetching additional fees for class ${className}:`,
      error
    );
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
  }, [setIsLoader]);

  useEffect(() => {
    getAllStudent();
  }, [getAllStudent, triggerRefresh]);

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

  const fetchStudentFeeInfo = async (studentId) => {
    try {
      const response = await axios.get(
        `${
          process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
        }/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.data.success) {
        return response.data.data;
      } else {
        console.error(
          `Fee info fetch failed for student ID ${studentId}:`,
          response.data.message || "Unknown error"
        );
        toast.error(
          `Fee info fetch failed for student ID ${studentId}: ${
            response.data.message || "Unknown error"
          }`
        );
        return null;
      }
    } catch (error) {
      console.error(
        `Error fetching fee info for student ID ${studentId}:`,
        error
      );
      toast.error(
        `Error fetching fee info for student ID ${studentId}: ${error.message}`
      );
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
    console.log(`handleStudentClick called for parentId: ${parentId}`);
    setIsLoader(true);
    resetState();
    try {
      const parentResponse = await parentandchildwithID(parentId);
      if (!parentResponse?.success) {
        console.error(
          "Failed to fetch parent/child data:",
          parentResponse?.message
        );
        toast.error(
          parentResponse?.message || "Failed to fetch parent/child data."
        );
        setIsLoader(false);
        return;
      }

      const children = parentResponse?.children || [];
      console.log("Fetched children:", children);
      if (children.length === 0) {
        toast.info("No children found for this parent.");
        setIsLoader(false);
        return;
      }

      setParentData(children);

      console.log("Fetching fee info and additional fees for all children...");
      const promises = children.map((child) =>
        Promise.all([
          fetchStudentFeeInfo(child.studentId),
          fetchAdditionalFeesForClass(child.class, authToken),
        ])
      );

      const results = await Promise.all(promises);
      console.log(
        "Results from fee info and additional fees fetches:",
        results
      );

      const initialFormData = [];
      const initialShowFormFlags = [];

      results.forEach(([feeInfo, availableAdditionalFees], index) => {
        const child = children[index];
        console.log(
          `Processing child ${index}: ${child.studentName} (ID: ${child.studentId})`
        );

        if (!feeInfo) {
          console.warn(
            `Could not load fee details for ${child.studentName}. Setting error flag.`
          );
          toast.error(
            `Could not load fee details for ${child.studentName}. Skipping.`
          );
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

        const regularFeeAmount =
          feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
        const additionalFeesStructure =
          feeInfo.feeStructure?.additionalFees || [];
        const monthlyStatus = feeInfo.monthlyStatus || [];
        const feeHistory = feeInfo.feeStatus?.feeHistory || [];
        const monthlyDues = feeInfo.feeStatus?.monthlyDues || {
          regularDues: [],
          additionalDues: [],
        };
        const oneTimeAdditionalDues = feeInfo.oneTimeAdditionalDues || [];

        // Prepare regular fee status for all months
        const regularFees = allMonths.map((month) => {
          const monthData = monthlyStatus.find((m) => m.month === month);
          const dueData = monthlyDues.regularDues.find(
            (d) => d.month === month
          );
          const due = dueData
            ? dueData.dueAmount
            : monthData?.regularFee?.status === "Paid"
            ? 0
            : regularFeeAmount;
          const status = dueData
            ? dueData.status
            : monthData?.regularFee?.status || "Unpaid";
          return {
            month,
            paidAmount:
              dueData?.paidAmount || monthData?.regularFee?.paid || "",
            dueAmount: due,
            totalAmount: regularFeeAmount,
            status,
            label: `${month} (Due: ₹${due.toFixed(2)})`,
          };
        });

        // Pre-select regular fees with dues from monthlyStatus, validated by monthlyDues
        const preSelectedMonths = [];
        monthlyStatus.forEach((monthData) => {
          if (
            monthData.regularFee.due > 0 &&
            monthData.regularFee.status !== "Paid"
          ) {
            const dueData = monthlyDues.regularDues.find(
              (d) => d.month === monthData.month
            );
            if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
              const originalFee = regularFees.find(
                (rf) => rf.month === monthData.month
              );
              if (originalFee) {
                preSelectedMonths.push({
                  value: monthData.month,
                  label: originalFee.label,
                  due: dueData.dueAmount,
                });
              }
            }
          }
        });

        // Prepare additional fee details
        const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
          name: fee.name,
          type: fee.feeType,
          frequency: fee.frequency,
          amount: fee.amount,
          months: allMonths.map((month) => {
            const monthData = monthlyStatus.find((m) => m.month === month);
            const addFee = monthData?.additionalFees?.find(
              (af) => af.name === fee.name
            );
            const dueData = monthlyDues.additionalDues.find(
              (d) => d.name === fee.name && d.month === month
            );
            const due = dueData
              ? dueData.dueAmount
              : addFee?.status === "Paid"
              ? 0
              : fee.amount;
            const status = dueData
              ? dueData.status
              : addFee?.status || "Unpaid";
            return {
              month,
              paidAmount: dueData?.paidAmount || addFee?.paid || "",
              dueAmount: due,
              totalAmount: fee.amount,
              status,
            };
          }),
        }));

        // Pre-select additional monthly fees with dues from monthlyStatus, validated by monthlyDues
        const preSelectedAdditionalFees = [];
        monthlyStatus.forEach((monthData) => {
          monthData.additionalFees?.forEach((fee) => {
            if (
              fee.due > 0 &&
              fee.status !== "Paid" &&
              fee.frequency === "monthly"
            ) {
              const dueData = monthlyDues.additionalDues.find(
                (d) => d.name === fee.name && d.month === monthData.month
              );
              if (
                dueData &&
                dueData.dueAmount > 0 &&
                dueData.status !== "Paid"
              ) {
                const feeStructure = additionalFeesStructure.find(
                  (fs) => fs.name === fee.name && fs.frequency === "monthly"
                );
                if (feeStructure) {
                  const availableFeeOption = availableAdditionalFees.find(
                    (opt) =>
                      opt.name === fee.name && opt.frequency === "monthly"
                  );
                  if (availableFeeOption) {
                    const existingFee = preSelectedAdditionalFees.find(
                      (pf) => pf.name === fee.name && pf.frequency === "monthly"
                    );
                    if (existingFee) {
                      if (!existingFee.dueMonths.includes(monthData.month)) {
                        existingFee.dueMonths.push(monthData.month);
                        existingFee.amount += dueData.dueAmount;
                      }
                    } else {
                      preSelectedAdditionalFees.push({
                        id: availableFeeOption.id,
                        name: availableFeeOption.name,
                        amount: dueData.dueAmount,
                        type: availableFeeOption.type,
                        frequency: availableFeeOption.frequency,
                        dueMonths: [monthData.month],
                      });
                    }
                  }
                }
              }
            }
          });
        });

        // Pre-select one-time fees with dues from oneTimeAdditionalDues only
        const preSelectedOneTimeFees = [];
        oneTimeAdditionalDues.forEach((fee) => {
          if (fee.dueAmount > 0 && fee.status !== "Paid") {
            const feeStructure = additionalFeesStructure.find(
              (fs) => fs.name === fee.name && fs.frequency === "one-time"
            );
            if (feeStructure) {
              preSelectedOneTimeFees.push({
                name: fee.name,
                dueAmount: fee.dueAmount,
                frequency: feeStructure.frequency,
              });
            }
          }
        });

        // Prepare one-time fee options (for dropdown, excluding fully paid, using oneTimeAdditionalDues)
        const oneTimeFeeOptions = additionalFeesStructure
          .filter((fee) => fee.frequency === "one-time")
          .filter((fee) => {
            const dueFee = oneTimeAdditionalDues.find(
              (d) => d.name === fee.name
            );
            return dueFee && dueFee.dueAmount > 0 && dueFee.status !== "Paid";
          })
          .map((fee) => {
            const dueFee = oneTimeAdditionalDues.find(
              (d) => d.name === fee.name
            );
            const dueAmount = dueFee ? dueFee.dueAmount : fee.amount;
            return {
              label: `${fee.name} (Due: ₹${dueAmount.toFixed(2)})`,
              name: fee.name,
              code: fee.name,
              dueAmount,
              type: fee.feeType,
              frequency: fee.frequency,
            };
          });

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
          monthlyDues,
          additionalFeeDetails,
          pastDues: feeInfo.feeStatus?.pastDues || 0,
          totalDues: feeInfo.feeStatus?.dues || 0,
          regularFees,
          availableAdditionalFees: availableAdditionalFees || [],
          oneTimeFeeOptions,
          feeInfo,
          error: false,
        };
        console.log(
          `Generated initial form data for ${child.studentName}:`,
          childFormData
        );
        initialFormData.push(childFormData);
        initialShowFormFlags.push(false);
      });

      console.log("Setting final formData state:", initialFormData);
      console.log("Setting final showFormFlags state:", initialShowFormFlags);
      setFormData(initialFormData);
      setShowFormFlags(initialShowFormFlags);
      setShowChildForms(true);
      console.log("Child forms should now be visible.");
    } catch (error) {
      console.error("An error occurred during handleStudentClick:", error);
      toast.error("An error occurred while fetching student data.");
    } finally {
      setIsLoader(false);
    }
  };

  const handleChildSelection = (index) => {
    console.log(`handleChildSelection called for index: ${index}`);
    if (!formData || index < 0 || index >= formData.length) {
      console.error(
        `Invalid index or formData for selection: index=${index}, formData length=${formData?.length}`
      );
      toast.error("An internal error occurred. Please try again.");
      return;
    }
    const currentChildData = formData[index];
    console.log("Current formData[index]:", currentChildData);

    if (!currentChildData || currentChildData.error) {
      toast.warn(
        `Cannot select ${
          parentData[index]?.studentName || "this student"
        }. Fee data may be missing or failed to load.`
      );
      console.warn("Selection blocked due to missing data or error flag.");
      return;
    }

    const isCurrentlySelected = selectedChildrenIndices.includes(index);
    console.log("Is currently selected:", isCurrentlySelected);

    let updatedSelectedChildren;
    let updatedShowFormFlags = [...showFormFlags];

    if (isCurrentlySelected) {
      updatedSelectedChildren = selectedChildrenIndices.filter(
        (i) => i !== index
      );
      updatedShowFormFlags[index] = false;
      console.log("Deselecting child.");
    } else {
      updatedSelectedChildren = [...selectedChildrenIndices, index];
      updatedShowFormFlags[index] = true;
      console.log("Selecting child.");
    }

    updatedSelectedChildren.sort((a, b) => a - b);

    console.log("Updating selected indices to:", updatedSelectedChildren);
    console.log("Updating showFormFlags to:", updatedShowFormFlags);

    setSelectedChildrenIndices(updatedSelectedChildren);
    setShowFormFlags(updatedShowFormFlags);

    if (updatedSelectedChildren.length > 0) {
      const firstSelectedIndex = updatedSelectedChildren[0];
      console.log("Updating fee history for index:", firstSelectedIndex);
      setChildFeeHistory(formData[firstSelectedIndex]?.feeInfo || null);
    } else {
      console.log("Clearing fee history.");
      setChildFeeHistory(null);
    }
  };

  const handleInputChange = (index, field, value) => {
    const updatedFormData = [...formData];
    if (updatedFormData[index]) {
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
    } else {
      console.error(
        `Attempted to handle input change for invalid index: ${index}`
      );
    }
  };

  const handleMonthMultiSelectChange = (index, name, selectedOptions) => {
    console.log(`Month selection changed for index ${index}:`, selectedOptions);
    const selectedOptionsData = selectedOptions || [];
    const updatedFormData = [...formData];
    if (!updatedFormData[index]) {
      console.error(
        `Cannot handle month change, formData missing for index: ${index}`
      );
      return;
    }
    const currentChildData = updatedFormData[index];

    const selectedMonthNames = selectedOptionsData.map((opt) => opt.code);
    if (selectedMonthNames.length > 1) {
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
      if (!isSequential) {
        toast.warn(
          `Please select months in a continuous sequence (e.g., April, May, June). Deselect and reselect if needed.`
        );
        return;
      }
    }

    const newSelectedMonths = selectedOptionsData
      .map((opt) => {
        const originalFee = currentChildData.regularFees.find(
          (fee) => fee.month === opt.code
        );
        if (!originalFee) {
          console.error(
            `Could not find original fee data for month: ${opt.code}`
          );
          return null;
        }
        return {
          value: originalFee.month,
          label: originalFee.label,
          due: originalFee.dueAmount,
        };
      })
      .filter(Boolean);

    updatedFormData[index].selectedMonths = newSelectedMonths;

    // Auto-select monthly additional fees for selected months
    const newSelectedAdditionalFees = [];
    const structuredMonthlyAddFees =
      currentChildData.feeInfo?.feeStructure?.additionalFees?.filter(
        (fee) => fee.frequency === "monthly"
      ) || [];

    structuredMonthlyAddFees.forEach((fee) => {
      const availableFeeOption = currentChildData.availableAdditionalFees.find(
        (opt) => opt.name === fee.name && opt.frequency === "monthly"
      );
      if (availableFeeOption) {
        const feeDetail = currentChildData.additionalFeeDetails.find(
          (fd) => fd.name === fee.name && fd.frequency === "monthly"
        );
        if (!feeDetail) {
          console.warn(`No fee detail found for ${fee.name}`);
          return;
        }
        const dueMonths = newSelectedMonths
          .map((m) => {
            const monthData = feeDetail.months.find(
              (fm) => fm.month === m.value
            );
            if (monthData && monthData.dueAmount > 0) {
              return monthData.month;
            }
            return null;
          })
          .filter(Boolean);

        if (dueMonths.length > 0) {
          // Calculate total amount for the selected months
          const totalAmount = dueMonths.reduce((sum, month) => {
            const monthData = feeDetail.months.find((fm) => fm.month === month);
            return sum + (monthData?.dueAmount || 0);
          }, 0);

          newSelectedAdditionalFees.push({
            id: availableFeeOption.id,
            name: availableFeeOption.name,
            amount: totalAmount,
            type: availableFeeOption.type,
            frequency: availableFeeOption.frequency,
            dueMonths,
          });
        }
      }
    });

    // Preserve one-time additional fees that were manually selected
    const existingOneTimeFees = currentChildData.selectedAdditionalFees.filter(
      (fee) => fee.frequency === "one-time"
    );

    updatedFormData[index].selectedAdditionalFees = [
      ...newSelectedAdditionalFees,
      ...existingOneTimeFees,
    ];

    setFormData(updatedFormData);
  };

  const handleDynamicMultiSelectChange = (index, field, selectedOptions) => {
    console.log(
      `Dynamic multiselect changed for index ${index}, field ${field}:`,
      selectedOptions
    );
    const updatedFormData = [...formData];
    if (!updatedFormData[index]) {
      console.error(
        `Cannot handle dynamic multiselect change, formData missing for index: ${index}`
      );
      return;
    }
    const currentChildData = updatedFormData[index];

    if (field === "selectedAdditionalFees") {
      const newSelectedAdditionalFees = (selectedOptions || [])
        .map((opt) => {
          const originalFee = currentChildData.availableAdditionalFees.find(
            (fee) => fee.id === opt.code && fee.frequency === "monthly"
          );
          if (originalFee) {
            return {
              id: originalFee.id,
              name: originalFee.name,
              amount: originalFee.value,
              type: originalFee.type,
              frequency: originalFee.frequency,
              dueMonths:
                originalFee.frequency === "monthly"
                  ? currentChildData.selectedMonths.map((m) => m.value)
                  : [],
            };
          }
          console.warn(
            "Could not find original additional fee details for option code:",
            opt.code
          );
          return null;
        })
        .filter(Boolean);

      // Preserve one-time fees
      const existingFees = currentChildData.selectedAdditionalFees.filter(
        (fee) => fee.frequency === "one-time"
      );

      updatedFormData[index].selectedAdditionalFees = [
        ...newSelectedAdditionalFees,
        ...existingFees,
      ];
    } else if (field === "selectedOneTimeFees") {
      const newSelectedOneTimeFees = (selectedOptions || [])
        .map((opt) => {
          const originalFee = currentChildData.oneTimeFeeOptions.find(
            (fee) => fee.code === opt.code
          );
          if (originalFee) {
            return {
              name: originalFee.name,
              dueAmount: originalFee.dueAmount,
              frequency: originalFee.frequency,
            };
          }
          console.warn(
            "Could not find original one-time fee details for option code:",
            opt.code
          );
          return null;
        })
        .filter(Boolean);

      updatedFormData[index].selectedOneTimeFees = newSelectedOneTimeFees;
    }

    setFormData(updatedFormData);
  };

  const calculateNetPayableAmount = useCallback(
    (index) => {
      const data = formData[index];
      if (!data || data.error) return 0;
      let total = 0;
      total += parseFloat(data.pastDues) || 0;
      total += parseFloat(data.lateFine) || 0;

      // Add regular fees for selected months
      total += data.selectedMonths.reduce(
        (sum, monthState) => sum + (monthState?.due || 0),
        0
      );

      // Add additional fees, respecting due amounts for selected months
      total += data.selectedAdditionalFees.reduce((sum, fee) => {
        if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
          // For monthly fees, sum the due amounts for each selected month
          return (
            sum +
            fee.dueMonths.reduce((monthSum, month) => {
              const feeDetail = data.additionalFeeDetails.find(
                (fd) => fd.name === fee.name && fd.frequency === "monthly"
              );
              if (feeDetail) {
                const monthData = feeDetail.months.find(
                  (m) => m.month === month
                );
                return monthSum + (monthData?.dueAmount || 0);
              }
              return monthSum;
            }, 0)
          );
        }
        // For one-time fees, use the fee amount directly
        return sum + (parseFloat(fee?.amount) || 0);
      }, 0);

      // Add one-time fees
      total += data.selectedOneTimeFees.reduce(
        (sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0),
        0
      );

      // Subtract concession
      total -= parseFloat(data.concession) || 0;
      return Math.max(0, total);
    },
    [formData]
  );

  const calculateAutoDistribution = useCallback(
    (index) => {
      const data = formData[index];
      if (!data || data.error)
        return { remainingAfterDistribution: 0, remainingDues: 0 };
      const netPayable = calculateNetPayableAmount(index);
      const totalAmountPaid = parseFloat(data.totalAmount) || 0;
      const remainingDues = Math.max(0, netPayable - totalAmountPaid);
      const remainingAfterDistribution = Math.max(
        0,
        totalAmountPaid - netPayable
      );
      return { remainingAfterDistribution, remainingDues };
    },
    [formData, calculateNetPayableAmount]
  );

  const fetchReceiptData = async (receiptNumber, isUnified = false) => {
    setIsPreviewReady(false);
    setIsLoader(true);
    try {
      const url = isUnified
        ? `${
            process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
          }/api/v1/fees/unified-receipts?unifiedReceiptNumber=${receiptNumber}`
        : `${
            process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
          }/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.success) {
        setReceiptData(response.data);
        setIsPreviewReady(true);
        return response.data;
      } else {
        console.error(
          `Failed to fetch receipt data ${receiptNumber}:`,
          response.data.message
        );
        toast.error(
          `Failed to fetch receipt data: ${
            response.data.message || "Unknown error"
          }`
        );
        return null;
      }
    } catch (error) {
      console.error(`Error fetching receipt data ${receiptNumber}:`, error);
      if (isUnified && error.response?.status === 404) {
        // Fallback to single receipt if unified receipt fails
        try {
          const fallbackResponse = await axios.get(
            `${
              process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
            }/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          if (fallbackResponse.data.success) {
            setReceiptData(fallbackResponse.data);
            setIsPreviewReady(true);
            return fallbackResponse.data;
          } else {
            toast.error(
              `Fallback receipt fetch failed: ${
                fallbackResponse.data.message || "Unknown error"
              }`
            );
            return null;
          }
        } catch (fallbackError) {
          console.error(
            `Error fetching fallback receipt data ${receiptNumber}:`,
            fallbackError
          );
          toast.error("Error fetching receipt data: " + fallbackError.message);
          return null;
        }
      } else {
        toast.error("Error fetching receipt data: " + error.message);
        return null;
      }
    } finally {
      setIsLoader(false);
    }
  };

  const validateFormData = (childFormData, child, isUnified = false) => {
    console.log(
      `Validating form data for ${child?.studentName}`,
      childFormData
    );
    if (!childFormData || childFormData.error) {
      toast.error(
        `Cannot submit for ${
          child?.studentName || "this student"
        } due to missing or failed data loading.`
      );
      return false;
    }
    const totalAmount = parseFloat(childFormData.totalAmount) || 0;
    if (totalAmount <= 0) {
      toast.warn(
        `Please enter a valid amount (> 0) to pay for ${child.studentName}.`
      );
      return false;
    }
    if (!childFormData.paymentMode) {
      toast.error(`Payment mode is required for ${child.studentName}.`);
      return false;
    }
    if (
      (childFormData.paymentMode === "Online" ||
        childFormData.paymentMode === "Card") &&
      !childFormData.transactionId
    ) {
      toast.error(
        `Transaction ID is required for Online/Card payment for ${child.studentName}.`
      );
      return false;
    }
    if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
      toast.error(
        `Cheque Number is required for Cheque payment for ${child.studentName}.`
      );
      return false;
    }
    if (
      !childFormData.date ||
      !moment(childFormData.date, "YYYY-MM-DD", true).isValid()
    ) {
      toast.error(
        `Please select a valid payment date for ${child.studentName}.`
      );
      return false;
    }

    const payableExcludingDuesFines =
      calculateNetPayableAmount(
        formData.findIndex((fd) => fd.studentId === child.studentId)
      ) -
      (parseFloat(childFormData.pastDues) || 0) -
      (parseFloat(childFormData.lateFine) || 0);
    const onlyPayingDuesAndFines =
      (parseFloat(childFormData.pastDues) || 0) +
      (parseFloat(childFormData.lateFine) || 0);

    if (
      totalAmount > 0 &&
      childFormData.selectedMonths.length === 0 &&
      childFormData.selectedAdditionalFees.length === 0 &&
      childFormData.selectedOneTimeFees.length === 0 &&
      totalAmount > onlyPayingDuesAndFines
    ) {
      toast.warn(
        `Amount paid for ${child.studentName} (₹${totalAmount.toFixed(
          2
        )}) exceeds past dues and late fines (Total ₹${onlyPayingDuesAndFines.toFixed(
          2
        )}), but no specific month or other fee is selected. Please select the items being paid for or adjust the amount. If this is an advance payment, please add a remark.`
      );
    }
    return true;
  };

  const handleUnifiedFeePayment = async () => {
    console.log("Attempting unified fee payment...");
    if (selectedChildrenIndices.length < 2) {
      toast.warn("Please select at least two students for unified payment.");
      return;
    }

    let isValid = true;
    let totalUnifiedAmount = 0;
    const studentsPayload = [];

    for (const index of selectedChildrenIndices) {
      const childFormData = formData[index];
      const child = parentData[index];

      if (!validateFormData(childFormData, child, true)) {
        isValid = false;
        break;
      }

      const amountForThisChild = parseFloat(childFormData.totalAmount) || 0;
      if (amountForThisChild <= 0) {
        toast.warn(
          `Please enter an amount (> 0) to pay for ${child.studentName} in the unified payment.`
        );
        isValid = false;
        break;
      }
      totalUnifiedAmount += amountForThisChild;

      const additionalFeesPayload = [];
      const selectedMonthNames = childFormData.selectedMonths.map(
        (m) => m.value
      );

      childFormData.selectedAdditionalFees.forEach((fee) => {
        if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
          fee.dueMonths.forEach((monthName) => {
            const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(
              (m) => m.month === monthName
            );
            const isFeeDueForThisMonth = monthStatus?.additionalFees?.some(
              (mf) => mf.name === fee.name && mf.status !== "Paid"
            );
            if (isFeeDueForThisMonth) {
              additionalFeesPayload.push({ name: fee.name, month: monthName });
            }
          });
        } else if (fee.frequency === "one-time") {
          additionalFeesPayload.push({ name: fee.name });
        }
      });

      childFormData.selectedOneTimeFees.forEach((fee) => {
        additionalFeesPayload.push({ name: fee.name });
      });

      studentsPayload.push({
        studentId: child.studentId,
        paymentDetails: {
          regularFees: childFormData.selectedMonths.map((monthState) => ({
            month: monthState.value,
          })),
          additionalFees: additionalFeesPayload,
          pastDuesPaid: 0,
          lateFinesPaid: 0,
          concession: parseFloat(childFormData.concession) || 0,
          totalAmount: amountForThisChild,
        },
      });
    }

    if (!isValid || studentsPayload.length !== selectedChildrenIndices.length) {
      console.error("Unified payment validation failed or payload mismatch.");
      return;
    }

    const firstChildIndex = selectedChildrenIndices[0];
    const firstChildFormData = formData[firstChildIndex];

    if (!firstChildFormData.paymentMode) {
      toast.error(
        `Payment mode is required (using details from ${parentData[firstChildIndex].studentName}).`
      );
      return;
    }
    if (
      (firstChildFormData.paymentMode === "Online" ||
        firstChildFormData.paymentMode === "Card") &&
      !firstChildFormData.transactionId
    ) {
      toast.error(
        `Transaction ID is required for Online/Card payment (using details from ${parentData[firstChildIndex].studentName}).`
      );
      return;
    }
    if (
      firstChildFormData.paymentMode === "Cheque" &&
      !firstChildFormData.chequeBookNo
    ) {
      toast.error(
        `Cheque Number is required for Cheque payment (using details from ${parentData[firstChildIndex].studentName}).`
      );
      return;
    }
    if (
      !firstChildFormData.date ||
      !moment(firstChildFormData.date, "YYYY-MM-DD", true).isValid()
    ) {
      toast.error(
        `Please select a valid payment date (using details from ${parentData[firstChildIndex].studentName}).`
      );
      return false;
    }

    const unifiedPaymentDetails = {
      paymentMode: firstChildFormData.paymentMode,
      transactionId: firstChildFormData.transactionId || undefined,
      chequeNumber: firstChildFormData.chequeBookNo || undefined,
      date: moment(firstChildFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
      remark: firstChildFormData.remarks || "",
    };

    const payload = {
      students: studentsPayload,
      session,
      unifiedPaymentDetails,
    };

    console.log("Unified Payload:", JSON.stringify(payload, null, 2));

    setIsLoader(true);
    try {
      const response = await feescreateUnifiedFeeStatus(payload);
      if (response.success) {
        toast.success(
          response.message || "Unified fees submitted successfully!"
        );
        setUnifiedReceiptData(response.data);
        setIsMessageModalOpen(true);
      } else {
        toast.error(response.message || "Unified fee submission failed.");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(`Error during unified submission: ${errorMsg}`);
      console.error("Unified Submission Error:", error.response || error);
    } finally {
      setIsLoader(false);
    }
  };

  const handleSubmit = async (e, childIndex) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`Attempting single submission for index: ${childIndex}`);
    const childFormData = formData[childIndex];
    const child = parentData[childIndex];

    if (!validateFormData(childFormData, child)) {
      return;
    }

    setIsLoader(true);

    const additionalFeesPayload = [];
    const selectedMonthNames = childFormData.selectedMonths.map((m) => m.value);

    childFormData.selectedAdditionalFees.forEach((fee) => {
      if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
        fee.dueMonths.forEach((monthName) => {
          const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(
            (m) => m.month === monthName
          );
          const isFeeDueForThisMonth = monthStatus?.additionalFees?.some(
            (mf) => mf.name === fee.name && mf.status !== "Paid"
          );
          if (isFeeDueForThisMonth) {
            additionalFeesPayload.push({
              name: fee.name,
              month: monthName,
            });
          }
        });
      } else if (fee.frequency === "one-time") {
        additionalFeesPayload.push({
          name: fee.name,
        });
      }
    });

    childFormData.selectedOneTimeFees.forEach((fee) => {
      additionalFeesPayload.push({
        name: fee.name,
      });
    });

    const payload = {
      studentId: child.studentId,
      session,
      paymentDetails: {
        regularFees: childFormData.selectedMonths.map((monthState) => ({
          month: monthState.value,
        })),
        additionalFees: additionalFeesPayload,
        pastDuesPaid: 0,
        lateFinesPaid: 0,
        concession: parseFloat(childFormData.concession) || 0,
        totalAmount: parseFloat(childFormData.totalAmount) || 0,
        date: moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
        paymentMode: childFormData.paymentMode,
        transactionId: childFormData.transactionId || undefined,
        chequeNumber: childFormData.chequeBookNo || undefined,
        remark: childFormData.remarks || "",
      },
    };

    console.log("Single Submission Payload:", JSON.stringify(payload, null, 2));

    try {
      const response = await feescreateFeeStatus(payload);
      if (response?.success) {
        toast.success(
          response?.message ||
            `Fees submitted successfully for ${child.studentName}!`
        );
        setResponseData(response?.data);
        setIsMessageModalOpen(true);
      } else {
        toast.error(
          response?.message || `Fee submission failed for ${child.studentName}.`
        );
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      toast.error(
        `An error occurred during submission for ${child.studentName}: ${errorMsg}`
      );
      console.error("Single Submission Error:", error.response || error);
    } finally {
      setIsLoader(false);
    }
  };

  const handleCloseMessageModal = async (sendMsg = false) => {
    console.log(`Closing message modal, sendMsg=${sendMsg}`);
    setIsMessageModalOpen(false);
    let receiptNumber = null;
    let isUnified = false;
    let dataForActions = null;

    if (responseData) {
      receiptNumber = responseData.feeReceiptNumber;
      isUnified = false;
      dataForActions = responseData;
    } else if (unifiedReceiptData) {
      receiptNumber = unifiedReceiptData.unifiedReceiptNumber;
      isUnified = true;
      dataForActions = unifiedReceiptData;
    }

    if (sendMsg && dataForActions) {
      if (isUnified) {
        sendUnifiedMessage(dataForActions);
      } else {
        sendMessage(dataForActions);
      }
    }

    const tempReceiptNumber = receiptNumber;
    const tempIsUnified = isUnified;
    const tempParentId =
      responseData?.student?.parentId || unifiedReceiptData?.parentId || null;

    resetState();
    setResponseData(null);
    setUnifiedReceiptData(null);

    if (tempParentId) {
      console.log(
        `Refreshing data for parentId: ${tempParentId} after submission.`
      );
      await handleStudentClick(tempParentId);
    } else {
      setTriggerRefresh((prev) => !prev);
    }

    if (tempReceiptNumber) {
      const fetchedReceiptData = await fetchReceiptData(
        tempReceiptNumber,
        tempIsUnified
      );
      if (fetchedReceiptData) {
        if (tempIsUnified) {
          setUnifiedReceiptModalOpen(true);
        } else {
          setPdfModalOpen(true);
        }
      }
    }
  };

  const handleClosePdfModal = (action = null) => {
    console.log(`Closing PDF modal, action=${action}`);
    if (action === "download" && receiptData) {
      handleDownloadPdf(receiptData);
    } else if (action === "print" && receiptData) {
      handlePrintReceipt(receiptData);
    }
    setPdfModalOpen(false);
    setReceiptData(null);
    setIsPreviewReady(false);
  };

  const handleCloseUnifiedReceiptModal = (action = null) => {
    console.log(`Closing Unified PDF modal, action=${action}`);
    if (action === "download" && receiptData) {
      handleDownloadUnifiedPdf(receiptData);
    } else if (action === "print" && receiptData) {
      handlePrintUnifiedReceipt(receiptData);
    }
    setUnifiedReceiptModalOpen(false);
    setReceiptData(null);
    setIsPreviewReady(false);
  };

  const handleDownloadPdf = (dataToUse) => {
    if (!dataToUse?.data) {
      toast.error("No receipt data available to generate PDF.");
      return;
    }
    generatePdf(
      dataToUse.data,
      [],
      0,
      0,
      0,
      0,
      0,
      0,
      `fee-receipt-${dataToUse.data?.feeReceiptNumber}.pdf`
    );
  };

  const handlePrintReceipt = (dataToUse) => {
    if (!dataToUse?.data) {
      toast.error("No receipt data available to print.");
      return;
    }
    console.log(
      "Print action triggered for single receipt:",
      dataToUse.data?.feeReceiptNumber
    );
    toast.info(
      "Print functionality placeholder: would print receipt " +
        dataToUse.data?.feeReceiptNumber
    );
  };

  const sendMessage = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No receipt data available to send message.");
      return;
    }
    console.log("Sending SINGLE fee response message:", dataToUse);
    try {
      FeeResponse(dataToUse);
      toast.info(`SMS function called for ${dataToUse?.student?.studentName}`);
    } catch (error) {
      console.error("Error calling FeeResponse for single payment:", error);
      toast.error("Failed to initiate SMS sending.");
    }
  };

  const handleDownloadUnifiedPdf = (dataToUse) => {
    if (!dataToUse?.data) {
      toast.error("No unified receipt data available to generate PDF.");
      return;
    }
    generatePdf(
      dataToUse.data,
      [],
      0,
      0,
      0,
      0,
      0,
      0,
      `unified-receipt-${dataToUse.data?.unifiedReceiptNumber}.pdf`
    );
  };

  const handlePrintUnifiedReceipt = (dataToUse) => {
    if (!dataToUse?.data) {
      toast.error("No unified receipt data available to print.");
      return;
    }
    console.log(
      "Print action triggered for unified receipt:",
      dataToUse.data?.unifiedReceiptNumber
    );
    toast.info(
      "Print functionality placeholder: would print unified receipt " +
        dataToUse.data?.unifiedReceiptNumber
    );
  };

  const sendUnifiedMessage = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No unified receipt data available to send message.");
      return;
    }
    console.log("Sending UNIFIED fee response message:", dataToUse);
    try {
      FeeResponse(dataToUse);
      const studentNames =
        dataToUse?.students?.map((s) => s.studentName).join(", ") ||
        "selected students";
      toast.info(`SMS function called for ${studentNames}`);
    } catch (error) {
      console.error("Error calling FeeResponse for unified payment:", error);
      toast.error("Failed to initiate SMS sending.");
    }
  };

  return (
    <div className="px-4 pb-2 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <ReactInput
            type="text"
            label="Search by Name"
            onChange={handleSearch}
            value={searchTerm}
            containerClassName="flex-1 min-w-[200px]"
            className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
          <ReactInput
            type="text"
            label="Search by Adm. No"
            onChange={handleSearchbyAdmissionNo}
            value={searchTermbyadmissionNo}
            containerClassName="flex-1 min-w-[200px]"
            className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {filteredStudents.length > 0 && (
          <div className="relative">
            <div className="absolute z-30 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto w-full">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-20">
                  <tr>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                      Student Name
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                      Admission No.
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                      Class
                    </th>
                    <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                      Parent Name
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr
                      key={student._id}
                      className="cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out border-b border-gray-300"
                      onClick={() => {
                        console.log(
                          `Search result clicked: ${student.studentName} (ParentID: ${student.parentId})`
                        );
                        handleStudentClick(student.parentId);
                        setFilteredStudents([]);
                      }}
                    >
                      <td className="p-3 font-semibold text-gray-800">
                        {student.studentName}
                      </td>
                      <td className="p-3 text-sm text-grey-600">
                        {student.admissionNumber}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {student.class}
                      </td>
                      <td className="p-3 text-sm text-gray-600">
                        {student.fatherName}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showChildForms && parentData.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800">
                Selected Student(s) Fee Payment
              </h2>
              {selectedChildrenIndices.length > 1 && (
                <Button
                  name="Pay for Siblings Together"
                  onClick={handleUnifiedFeePayment}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                />
              )}
            </div>

            <div className="grid grid-cols-1 gap-6">
              {parentData.map((child, index) => {
                const currentFormData = formData[index];

                if (!currentFormData || currentFormData.error) {
                  return (
                    <div
                      key={child._id || index}
                      className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md"
                      role="alert"
                    >
                      <strong className="font-bold">Error:</strong>
                      <span className="block sm:inline ml-2">
                        Could not load fee data for{" "}
                        {child.studentName || "this student"} (Adm:{" "}
                        {child.admissionNumber || "N/A"}). Please try searching
                        again or contact support.
                      </span>
                    </div>
                  );
                }

                const isSelected = selectedChildrenIndices.includes(index);
                const showForm = showFormFlags[index];

                const monthOptions = currentFormData.regularFees
                  .filter((fee) => fee.dueAmount > 0)
                  .map((fee) => ({ name: fee.label, code: fee.month }));
                const selectedMonthValues = currentFormData.selectedMonths.map(
                  (monthState) => ({
                    name: monthState.label,
                    code: monthState.value,
                  })
                );

                const additionalFeeOptions =
                  currentFormData.availableAdditionalFees
                    .filter((fee) => fee.frequency === "monthly")
                    .map((item) => ({ name: item.label, code: item.id }));
                const selectedAdditionalFeeValues =
                  currentFormData.selectedAdditionalFees
                    .filter((fee) => fee.frequency === "monthly")
                    .map((selectedFee) => {
                      const availableOption = additionalFeeOptions.find(
                        (opt) => opt.code === selectedFee.id
                      );
                      return {
                        name: availableOption
                          ? availableOption.name
                          : `${selectedFee.name} (${selectedFee.type}) - ₹${selectedFee.amount}`,
                        code: selectedFee.id,
                      };
                    });

                const oneTimeFeeOptions = currentFormData.oneTimeFeeOptions.map(
                  (item) => ({ name: item.label, code: item.code })
                );
                const selectedOneTimeFeeValues =
                  currentFormData.selectedOneTimeFees.map((fee) => {
                    const availableOption = oneTimeFeeOptions.find(
                      (opt) => opt.code === fee.name
                    );
                    return {
                      name: availableOption
                        ? availableOption.name
                        : `${fee.name} (Due: ₹${fee.dueAmount.toFixed(2)})`,
                      code: fee.name,
                    };
                  });

                return (
                  <div
                    key={child._id || index}
                    className={`bg-white rounded-lg shadow-md border transition-all duration-300 ${
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : "border-gray-200 hover:border-gray-300"
                    } overflow-hidden`}
                  >
                    <div
                      className={`flex items-center px-4 py-3 border-b ${
                        isSelected ? "bg-blue-50" : "bg-gray-50"
                      } cursor-pointer`}
                      onClick={() => {
                        console.log(`DIV clicked for index: ${index}`);
                        handleChildSelection(index);
                      }}
                    >
                      <input
                        type="checkbox"
                        id={`child-checkbox-${index}`}
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          console.log(`CHECKBOX changed for index: ${index}`);
                          handleChildSelection(index);
                        }}
                        className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                        aria-labelledby={`child-label-${index}`}
                      />
                      <label
                        id={`child-label-${index}`}
                        className="flex-grow cursor-pointer"
                        htmlFor={`child-checkbox-${index}`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="text-base font-semibold text-blue-800">
                              {child.studentName}
                            </span>
                            <span className="text-sm text-gray-600 ml-2">
                              (Class: {child.class} / Adm#:{" "}
                              {child.admissionNumber})
                            </span>
                          </div>
                          <span
                            className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                              isSelected
                                ? "bg-blue-200 text-blue-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {isSelected ? "SELECTED" : "SELECT"}
                          </span>
                        </div>
                        <div className="flex flex-wrap justify-start items-center gap-x-4 text-xs mt-1">
                          <span className="text-red-600 font-medium">
                            Total Dues: ₹
                            {currentFormData?.totalDues?.toFixed(2) || "0.00"}
                          </span>
                          {currentFormData?.pastDues > 0 && (
                            <span className="text-purple-600 font-medium">
                              Past Dues: ₹
                              {currentFormData?.pastDues?.toFixed(2)}
                            </span>
                          )}
                          {currentFormData?.lateFine > 0 && (
                            <span className="text-orange-600 font-medium">
                              Late Fine: ₹
                              {currentFormData?.lateFine?.toFixed(2)}
                            </span>
                          )}
                          <span className="text-gray-600 font-medium">
                            Base Monthly Fee: ₹
                            {currentFormData?.classFee?.toFixed(2) || "0.00"}
                          </span>
                        </div>
                      </label>
                    </div>

                    <div
                      className={`transition-all duration-500 ease-in-out overflow-hidden ${
                        showForm
                          ? "max-h-[2000px] opacity-100"
                          : "max-h-0 opacity-0"
                      }`}
                    >
                      {showForm && (
                        <div className="px-4 py-4 border-t flex flex-col lg:flex-row gap-6 bg-white">
                          <form
                            onSubmit={(e) => handleSubmit(e, index)}
                            className="flex-grow lg:w-2/3 space-y-5 mb-6 lg:mb-0"
                            noValidate
                          >
                            <div className="border rounded-md p-3 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Regular Monthly Fees
                                </label>
                                <DynamicMultiSelect
                                  name={`regularFees-${index}`}
                                  searchable={false}
                                  placeholderName="Select month(s)..."
                                  dynamicOptions={monthOptions}
                                  handleChange={(name, opts) =>
                                    handleMonthMultiSelectChange(
                                      index,
                                      name,
                                      opts
                                    )
                                  }
                                  value={selectedMonthValues}
                                  requiredClassName={"required-fields"}
                                  containerClassName="w-full"
                                  menuClassName="w-full min-w-[200px] whitespace-normal"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Select consecutive months with dues.
                                </p>
                              </div>
                              <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  Additional Fees (Monthly)
                                </label>
                                <DynamicMultiSelect
                                  name={`additionalFees-${index}`}
                                  searchable={true}
                                  placeholderName="Select monthly fee(s)..."
                                  dynamicOptions={additionalFeeOptions}
                                  handleChange={(name, opts) =>
                                    handleDynamicMultiSelectChange(
                                      index,
                                      "selectedAdditionalFees",
                                      opts
                                    )
                                  }
                                  value={selectedAdditionalFeeValues}
                                  requiredClassName={"required-fields"}
                                  containerClassName="w-full"
                                  menuClassName="w-full min-w-[200px] whitespace-normal"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Monthly fees auto-selected with months.
                                </p>
                              </div>
                              <div className="md:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                  One-Time / Due Fees
                                </label>
                                <DynamicMultiSelect
                                  name={`oneTimeFees-${index}`}
                                  searchable={true}
                                  placeholderName="Select one-time fee(s)..."
                                  dynamicOptions={oneTimeFeeOptions}
                                  handleChange={(name, opts) =>
                                    handleDynamicMultiSelectChange(
                                      index,
                                      "selectedOneTimeFees",
                                      opts
                                    )
                                  }
                                  value={selectedOneTimeFeeValues}
                                  requiredClassName={"required-fields"}
                                  containerClassName="w-full"
                                  menuClassName="w-full min-w-[200px] whitespace-normal"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                  Select one-time fees currently due.
                                </p>
                              </div>
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
                                containerClassName="sm:col-span-1"
                                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <ReactInput
                                type="number"
                                label={`Total Amount to Pay (*) ${
                                  selectedChildrenIndices.length > 1
                                    ? `(for ${child.studentName})`
                                    : ""
                                }`}
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
                                containerClassName="sm:col-span-1"
                                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                                  handleInputChange(
                                    index,
                                    "date",
                                    e.target.value
                                  )
                                }
                                isRequired={true}
                                max={moment().format("YYYY-MM-DD")}
                                className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                                  className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                                  className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
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
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                rows="2"
                                placeholder="Optional remarks about payment..."
                              />
                            </div>

                            {selectedChildrenIndices.length <= 1 && (
                              <div className="flex justify-end pt-4 mt-4 border-t">
                                <Button
                                  type="submit"
                                  name={`Submit Payment for ${child.studentName}`}
                                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                                />
                              </div>
                            )}
                          </form>

                          <div className="flex-shrink-0 lg:w-1/3 border rounded-md p-4 bg-blue-50 lg:ml-4 mt-4 lg:mt-0">
                            <h3 className="text-base font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-3">
                              Payment Summary
                            </h3>
                            <table className="w-full text-sm">
                              <tbody>
                                {currentFormData.pastDues > 0 && (
                                  <tr className="border-b border-blue-100">
                                    <td className="text-gray-700 py-1.5">
                                      Past Dues
                                    </td>
                                    <td className="font-medium text-purple-700 py-1.5 text-right">
                                      ₹{currentFormData.pastDues.toFixed(2)}
                                    </td>
                                  </tr>
                                )}
                                {currentFormData.lateFine > 0 && (
                                  <tr className="border-b border-blue-100">
                                    <td className="text-gray-700 py-1.5">
                                      Late Fines
                                    </td>
                                    <td className="font-medium text-orange-700 py-1.5 text-right">
                                      ₹{currentFormData.lateFine.toFixed(2)}
                                    </td>
                                  </tr>
                                )}
                                {currentFormData.selectedMonths.length > 0 && (
                                  <>
                                    <tr className="border-b border-blue-100 font-medium text-gray-800">
                                      <td colSpan="2" className="py-1.5">
                                        Regular Fees
                                      </td>
                                    </tr>
                                    {currentFormData.selectedMonths.map(
                                      (monthState, i) => (
                                        <tr
                                          key={`reg-sum-${index}-${i}`}
                                          className="border-b border-blue-100"
                                        >
                                          <td className="text-gray-600 py-1 pl-3">
                                            {monthState.value}
                                          </td>
                                          <td className="font-medium text-blue-700 py-1 text-right">
                                            ₹{(monthState?.due || 0).toFixed(2)}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </>
                                )}
                                {currentFormData.selectedAdditionalFees.length >
                                  0 && (
                                  <>
                                    <tr className="border-b border-blue-100 font-medium text-gray-800">
                                      <td colSpan="2" className="pt-2 pb-1">
                                        Additional Fees
                                      </td>
                                    </tr>
                                    {currentFormData.selectedAdditionalFees.map(
                                      (fee, i) => (
                                        <tr
                                          key={`add-sum-${index}-${i}`}
                                          className="border-b border-blue-100"
                                        >
                                          <td className="text-gray-600 py-1 pl-3">
                                            {fee.name}{" "}
                                            {fee.frequency === "monthly"
                                              ? `(${fee.type}, ${
                                                  fee.dueMonths?.join(", ") ||
                                                  "Selected Months"
                                                })`
                                              : `(${fee.type})`}
                                          </td>
                                          <td className="font-medium text-blue-700 py-1 text-right">
                                            ₹{fee.amount.toFixed(2)}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </>
                                )}
                                {currentFormData.selectedOneTimeFees.length >
                                  0 && (
                                  <>
                                    <tr className="border-b border-blue-100 font-medium text-gray-800">
                                      <td colSpan="2" className="pt-2 pb-1">
                                        One-Time Fees
                                      </td>
                                    </tr>
                                    {currentFormData.selectedOneTimeFees.map(
                                      (fee, i) => (
                                        <tr
                                          key={`one-time-sum-${index}-${i}`}
                                          className="border-b border-blue-100"
                                        >
                                          <td className="text-gray-600 py-1 pl-3">
                                            {fee.name}
                                          </td>
                                          <td className="font-medium text-blue-700 py-1 text-right">
                                            ₹{(fee?.dueAmount || 0).toFixed(2)}
                                          </td>
                                        </tr>
                                      )
                                    )}
                                  </>
                                )}
                                {currentFormData.concession > 0 && (
                                  <tr className="border-b border-blue-100">
                                    <td className="text-green-700 py-1.5">
                                      Concession
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
                              <tfoot className="border-t-2 border-blue-200 mt-2 pt-2">
                                <tr>
                                  <td className="pt-2 font-semibold text-blue-900 py-1.5">
                                    Total Payable
                                  </td>
                                  <td className="pt-2 font-bold text-blue-900 py-1.5 text-right">
                                    ₹
                                    {calculateNetPayableAmount(index).toFixed(
                                      2
                                    )}
                                  </td>
                                </tr>
                                {parseFloat(currentFormData.totalAmount) >
                                  0 && (
                                  <>
                                    <tr>
                                      <td className="text-gray-700 py-1.5">
                                        Amount Paying
                                      </td>
                                      <td className="font-medium text-black py-1.5 text-right">
                                        ₹
                                        {parseFloat(
                                          currentFormData.totalAmount
                                        ).toFixed(2)}
                                      </td>
                                    </tr>
                                    <tr>
                                      <td className="font-semibold text-red-700 py-1.5">
                                        Remaining Dues
                                      </td>
                                      <td className="font-bold text-red-700 py-1.5 text-right">
                                        ₹
                                        {calculateAutoDistribution(
                                          index
                                        ).remainingDues.toFixed(2)}
                                      </td>
                                    </tr>
                                    {calculateAutoDistribution(index)
                                      .remainingAfterDistribution > 0 && (
                                      <tr>
                                        <td className="font-semibold text-green-700 py-1 text-xs">
                                          Advance/Excess
                                        </td>
                                        <td className="font-semibold text-green-700 py-1 text-right text-xs">
                                          ₹
                                          {calculateAutoDistribution(
                                            index
                                          ).remainingAfterDistribution.toFixed(
                                            2
                                          )}
                                        </td>
                                      </tr>
                                    )}
                                  </>
                                )}
                              </tfoot>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {showChildForms &&
          childFeeHistory?.monthlyStatus?.length > 0 &&
          selectedChildrenIndices.length > 0 && (
            <div className="mt-8 border-t border-gray-300 pt-6">
              <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                Fee History for{" "}
                {childFeeHistory?.studentName || "Selected Student"} (
                {childFeeHistory?.session || session})
              </h2>
              <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow">
                <MonthFeeCard childFeeHistory={childFeeHistory} />
              </div>
            </div>
          )}

        <Modal
          setIsOpen={setIsMessageModalOpen}
          isOpen={isMessageModalOpen}
          title="Send Confirmation?"
          maxWidth="md"
        >
          <div className="p-5">
            <p className="text-gray-700 mb-4 text-center">
              Fee submitted successfully for{" "}
              <span className="font-semibold">
                {responseData?.student?.studentName ||
                  unifiedReceiptData?.students
                    ?.map((s) => s.studentName)
                    .join(", ") ||
                  "student(s)"}
              </span>
              .
              <br />
              Receipt Number:{" "}
              <span className="font-semibold">
                {responseData?.feeReceiptNumber ||
                  unifiedReceiptData?.unifiedReceiptNumber ||
                  "N/A"}
              </span>
              <br />
              Do you want to send an SMS confirmation to the parent?
              <br />(
              <span className="font-mono text-sm">
                {responseData?.parent?.fatherPhone ||
                  unifiedReceiptData?.parent?.fatherPhone ||
                  "Phone number not available"}
              </span>
              )
            </p>
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
              <Button
                type="button"
                name="Yes, Send SMS & View Receipt"
                onClick={() => handleCloseMessageModal(true)}
                className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2"
              />
              <Button
                type="button"
                name="No, Just View Receipt"
                onClick={() => handleCloseMessageModal(false)}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
              />
            </div>
          </div>
        </Modal>

        <Modal
          setIsOpen={setPdfModalOpen}
          isOpen={pdfModalOpen}
          title="Fee Receipt Preview"
          maxWidth="lg"
        >
          <div className="p-1">
            {!isPreviewReady || !receiptData ? (
              <p className="text-center p-10 text-gray-600">
                Loading receipt preview...
              </p>
            ) : (
              <FeeRecipt
                modalData={receiptData}
                handleCloseModal={() => handleClosePdfModal()}
                handlePrint={() => handleClosePdfModal("print")}
                handleDownload={() => handleClosePdfModal("download")}
                isPreviewReady={isPreviewReady}
                isUnified={false}
              />
            )}
          </div>
        </Modal>

        <Modal
          setIsOpen={setUnifiedReceiptModalOpen}
          isOpen={unifiedReceiptModalOpen}
          title="Unified Fee Receipt Preview"
          maxWidth="lg"
        >
          <div className="p-1">
            {!isPreviewReady || !receiptData ? (
              <p className="text-center p-10 text-gray-600">
                Loading unified receipt preview...
              </p>
            ) : (
              <FeeRecipt
                modalData={receiptData}
                handleCloseModal={() => handleCloseUnifiedReceiptModal()}
                handlePrint={() => handleCloseUnifiedReceiptModal("print")}
                handleDownload={() =>
                  handleCloseUnifiedReceiptModal("download")
                }
                isPreviewReady={isPreviewReady}
                isUnified={true}
              />
            )}
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default CreateFees;
