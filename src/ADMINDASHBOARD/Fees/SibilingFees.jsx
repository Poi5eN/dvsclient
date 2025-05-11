// import axios from "axios";
// import React, { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
// import {
//   ActiveStudents,
//   feescreateFeeStatus,
//   parentandchildwithID,
//   feescreateUnifiedFeeStatus,
// } from "../../Network/AdminApi";
// import Button from "../../Dynamic/utils/Button";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import MonthFeeCard from "./MonthFeeCard";
// import moment from "moment";
// import { FeeResponse, FeeResponseSibling } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";
// import FeeRecipt from "./FeeRecipt";
// import DynamicMultiSelect from "../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// const ExemptionToggle = ({ isExempt, onChange, studentName }) => {
//   return (
//     <label className="flex items-center gap-2 cursor-pointer">
//       <div className="relative">
//         <input
//           type="checkbox"
//           checked={isExempt}
//           onChange={(e) => onChange(e.target.checked)}
//           className="sr-only peer"
//         />
//         <div
//           className={`relative w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${
//             isExempt ? "bg-light-blue-800" : "bg-gray-300"
//           } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-light-blue-500`}
//         >
//           <div
//             className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform ${
//               isExempt ? "translate-x-5" : "translate-x-0"
//             }`}
//           />
//         </div>
//       </div>
//       <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[150px] text-left">
//         {isExempt ? `Exempt` : `Exempt`}
//       </span>
//     </label>
//   );
// };

// const fetchAdditionalFeesForClass = async (className, authToken) => {
//   try {
//     const response = await axios.get(
//       `${
//         process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//       }/api/v1/adminRoute/fees/?additional=true&className=${className}`,
//       {
//         withCredentials: true,
//         headers: { Authorization: `Bearer ${authToken}` },
//       }
//     );
//     if (response?.data?.success) {
//       const filteredFees = response.data.data.filter(
//         (fee) => fee.className === className
//       );
//       return filteredFees.map((fee) => ({
//         label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`,
//         value: fee.amount,
//         name: fee.name,
//         type: fee.feeType,
//         id: fee._id,
//         frequency: fee.frequency,
//       }));
//     } else {
//       console.error(`Failed to fetch additional fees for class ${className}:`, response?.data?.message);
//       toast.error(`Failed to fetch additional fees for class ${className}.`);
//       return [];
//     }
//   } catch (error) {
//     console.error(`Error fetching additional fees for class ${className}:`, error);
//     toast.error(`Error fetching additional fees for class ${className}: ${error.message}`);
//     return [];
//   }
// };

// // Helper function to build the paymentDetails object conditionally
// const buildPaymentDetailsObject = (details, isSinglePaymentContext = false) => {
//   const paymentDetails = {};

//   paymentDetails.pastDuesPaid = details.pastDuesPaid || 0;
//   paymentDetails.lateFinesPaid = details.lateFinesPaid || 0;
//   if (details.totalAmount !== undefined) {
//     paymentDetails.totalAmount = parseFloat(details.totalAmount);
//   }

//   if (details.regularFees && details.regularFees.length > 0) {
//     paymentDetails.regularFees = details.regularFees;
//   }
//   if (details.additionalFees && details.additionalFees.length > 0) {
//     paymentDetails.additionalFees = details.additionalFees;
//   }

//   if (details.concession && parseFloat(details.concession) !== 0) {
//     paymentDetails.concession = parseFloat(details.concession);
//   }
//   if (details.exemption && parseFloat(details.exemption) !== 0) {
//     paymentDetails.exemption = parseFloat(details.exemption);
//   }

//   if (isSinglePaymentContext) {
//     if (details.date) paymentDetails.date = details.date;
//     if (details.paymentMode) paymentDetails.paymentMode = details.paymentMode;
//     if (details.transactionId) paymentDetails.transactionId = details.transactionId;
//     if (details.chequeNumber) paymentDetails.chequeNumber = details.chequeNumber;
//     if (details.remark && details.remark.trim() !== "") paymentDetails.remark = details.remark.trim();
//   }
//   return paymentDetails;
// };


// const SibilingFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
//   const [responseData, setResponseData] = useState(null);
//   const [showChildForms, setShowChildForms] = useState(false);
//   const [selectedChildrenIndices, setSelectedChildrenIndices] = useState([]);
//   const [childFeeHistory, setChildFeeHistory] = useState(null);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showFormFlags, setShowFormFlags] = useState([]);
//   const [triggerRefresh, setTriggerRefresh] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const authToken = localStorage.getItem("token");
//   const [pdfModalOpen, setPdfModalOpen] = useState(false);
//   const [unifiedReceiptModalOpen, setUnifiedReceiptModalOpen] = useState(false);
//   const [unifiedReceiptData, setUnifiedReceiptData] = useState(null);
//   const [receiptData, setReceiptData] = useState(null);
//   const [isPreviewReady, setIsPreviewReady] = useState(false);

//   const [isUnifiedMode, setIsUnifiedMode] = useState(false);
//   const [unifiedPaymentData, setUnifiedPaymentData] = useState({
//     totalAmount: "", concession: "", date: moment().format("YYYY-MM-DD"),
//     paymentMode: "Cash", transactionId: "", chequeBookNo: "", remarks: "",
//   });

//   const allMonths = [
//     "April", "May", "June", "July", "August", "September",
//     "October", "November", "December", "January", "February", "March",
//   ];

//   const getAllStudent = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       setAllStudent(response?.students?.data || []);
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader, session]);

//   useEffect(() => {
//     getAllStudent();
//   }, [getAllStudent, triggerRefresh]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) => student.studentName && student.studentName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//     setSearchTermbyadmissionNo("");
//   };

//   const handleSearchbyAdmissionNo = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTermbyadmissionNo(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) => student.admissionNumber && student.admissionNumber.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//     setSearchTerm("");
//   };

//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `${ process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com" }/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         { withCredentials: true, headers: { Authorization: `Bearer ${authToken}` } }
//       );
//       if (response.data.success) return response.data.data;
//       else {
//         toast.error(`Fee info fetch failed for student ID ${studentId}: ${response.data.message || "Unknown error"}`);
//         return null;
//       }
//     } catch (error) {
//       toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
//       return null;
//     }
//   };

//   const resetState = () => {
//     setSelectedChildrenIndices([]);
//     setChildFeeHistory(null);
//     setShowFormFlags([]);
//     setParentData([]);
//     setFormData([]);
//     setSearchTerm("");
//     setSearchTermbyadmissionNo("");
//     setFilteredStudents([]);
//     setShowChildForms(false);
//     setResponseData(null);
//     setIsMessageModalOpen(false);
//     setPdfModalOpen(false);
//     setUnifiedReceiptModalOpen(false);
//     setUnifiedReceiptData(null);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//     setIsUnifiedMode(false);
//     setUnifiedPaymentData({
//       totalAmount: "", concession: "", date: moment().format("YYYY-MM-DD"),
//       paymentMode: "Cash", transactionId: "", chequeBookNo: "", remarks: "",
//     });
//   };
  
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     resetState(); 
//     try {
//       const parentResponse = await parentandchildwithID(parentId);
//       if (!parentResponse?.success) {
//         toast.error(parentResponse?.message || "Failed to fetch parent/child data.");
//         setIsLoader(false); return;
//       }
//       const children = parentResponse?.children || [];
//       if (children.length === 0) {
//         toast.info("No children found for this parent.");
//         setIsLoader(false); return;
//       }
//       setParentData(children);
//       const promises = children.map((child) =>
//         Promise.all([ fetchStudentFeeInfo(child.studentId), fetchAdditionalFeesForClass(child.class, authToken) ])
//       );
//       const results = await Promise.all(promises);
//       const initialFormData = [];
//       results.forEach(([feeInfo, availableAdditionalFees], index) => {
//         const child = children[index];
//         if (!feeInfo) {
//           initialFormData.push({ admissionNumber: child.admissionNumber, studentId: child.studentId, studentName: child.studentName, className: child.class, error: true });
//           return;
//         }
//         const regularFeeAmount = feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
//         const additionalFeesStructure = feeInfo.feeStructure?.additionalFees || [];
//         const monthlyStatus = feeInfo.monthlyStatus || [];
//         const feeHistory = feeInfo.feeStatus?.feeHistory || [];
//         const monthlyDues = feeInfo.feeStatus?.monthlyDues || { regularDues: [], additionalDues: [] };
//         const oneTimeAdditionalDues = feeInfo.oneTimeAdditionalDues || [];
//         const regularFees = allMonths.map((month) => {
//           const monthData = monthlyStatus.find((m) => m.month === month);
//           const dueData = monthlyDues.regularDues.find((d) => d.month === month);
//           const due = dueData ? dueData.dueAmount : (monthData?.regularFee?.status === "Paid" ? 0 : regularFeeAmount);
//           const status = dueData ? dueData.status : (monthData?.regularFee?.status || "Unpaid");
//           return { month, paidAmount: dueData?.paidAmount || monthData?.regularFee?.paid || "", dueAmount: due, totalAmount: regularFeeAmount, status, label: `${month} (Due: ₹${due.toFixed(2)})` };
//         });
//         const preSelectedMonths = [];
//         monthlyStatus.forEach((monthData) => {
//           if (monthData.regularFee.due > 0 && monthData.regularFee.status !== "Paid") {
//             const dueData = monthlyDues.regularDues.find((d) => d.month === monthData.month);
//             if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
//               const originalFee = regularFees.find((rf) => rf.month === monthData.month);
//               if (originalFee) preSelectedMonths.push({ value: monthData.month, label: originalFee.label, due: dueData.dueAmount });
//             }
//           }
//         });
//         const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
//           name: fee.name, type: fee.feeType, frequency: fee.frequency, amount: fee.amount,
//           months: allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             const addFee = monthData?.additionalFees?.find((af) => af.name === fee.name);
//             const dueData = monthlyDues.additionalDues.find((d) => d.name === fee.name && d.month === month);
//             const due = dueData ? dueData.dueAmount : (addFee?.status === "Paid" ? 0 : fee.amount);
//             const status = dueData ? dueData.status : (addFee?.status || "Unpaid");
//             return { month, paidAmount: dueData?.paidAmount || addFee?.paid || "", dueAmount: due, totalAmount: fee.amount, status };
//           }),
//         }));
//         const preSelectedAdditionalFees = [];
//         monthlyStatus.forEach((monthData) => {
//           monthData.additionalFees?.forEach((fee) => {
//             if (fee.due > 0 && fee.status !== "Paid" && fee.frequency === "monthly") {
//               const dueData = monthlyDues.additionalDues.find((d) => d.name === fee.name && d.month === monthData.month);
//               if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
//                 const feeStructure = additionalFeesStructure.find((fs) => fs.name === fee.name && fs.frequency === "monthly");
//                 if (feeStructure) {
//                   const availableFeeOption = availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
//                   if (availableFeeOption) {
//                     const isMonthPreSelected = preSelectedMonths.some((m) => m.value === monthData.month);
//                     if (isMonthPreSelected) {
//                       const existingFee = preSelectedAdditionalFees.find((pf) => pf.name === fee.name && pf.frequency === "monthly");
//                       if (existingFee) {
//                         if (!existingFee.dueMonths.includes(monthData.month)) { existingFee.dueMonths.push(monthData.month); existingFee.amount += dueData.dueAmount; }
//                       } else preSelectedAdditionalFees.push({ id: availableFeeOption.id, name: availableFeeOption.name, amount: dueData.dueAmount, type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths: [monthData.month] });
//                     }
//                   }
//                 }
//               }
//             }
//           });
//         });
//         const preSelectedOneTimeFees = [];
//         oneTimeAdditionalDues.forEach((fee) => {
//           if (fee.dueAmount > 0 && fee.status !== "Paid") {
//             const feeStructure = additionalFeesStructure.find((fs) => fs.name === fee.name && fs.frequency === "one-time");
//             if (feeStructure) preSelectedOneTimeFees.push({ name: fee.name, dueAmount: fee.dueAmount, frequency: feeStructure.frequency });
//           }
//         });
//         const oneTimeFeeOptions = additionalFeesStructure
//           .filter((fee) => fee.feeType === "One Time" && fee.frequency === "one-time")
//           .filter((fee) => {
//             const isPaidInHistory = feeHistory.some((h) => h.additionalFees.some((af) => af.name === fee.name && af.status === "Paid" && af.dueAmount === 0));
//             const isPaidInDues = monthlyDues.additionalDues.some((d) => d.name === fee.name && d.status === "Paid" && d.dueAmount === 0);
//             const isExemptInDues = monthlyDues.additionalDues.some((d) => d.name === fee.name && d.status === "Exempt" && d.dueAmount === 0);
//             return !isPaidInHistory && !isPaidInDues && !isExemptInDues;
//           })
//           .map((fee) => {
//             const dueFee = oneTimeAdditionalDues.find((d) => d.name === fee.name);
//             const dueAmount = dueFee ? dueFee.dueAmount : fee.amount;
//             return { label: `${fee.name} (Due: ₹${dueAmount.toFixed(2)})`, name: fee.name, code: fee.name, dueAmount, type: fee.feeType, frequency: fee.frequency };
//           });
//         initialFormData.push({
//           admissionNumber: child.admissionNumber, studentId: child.studentId, studentName: child.studentName, className: child.class, classFee: regularFeeAmount,
//           totalAmount: "", selectedMonths: preSelectedMonths, selectedAdditionalFees: preSelectedAdditionalFees, selectedOneTimeFees: preSelectedOneTimeFees,
//           paymentMode: "Cash", transactionId: "", chequeBookNo: "", lateFine: feeInfo.feeStatus?.totalLateFines || 0, concession: "", exemption: "", isExempt: false,
//           date: moment().format("YYYY-MM-DD"), remarks: "", monthlyDues, additionalFeeDetails, pastDues: feeInfo.feeStatus?.pastDues || 0,
//           totalDues: feeInfo.feeStatus?.dues || 0, regularFees, availableAdditionalFees: availableAdditionalFees || [], oneTimeFeeOptions, feeInfo, error: false,
//         });
//       });
//       setFormData(initialFormData);
//       if (children.length > 0) {
//         const allIndices = children.map((_, i) => i);
//         const allFormsVisible = children.map(() => true);
//         setSelectedChildrenIndices(allIndices); 
//         setShowFormFlags(allFormsVisible);     
//         if (initialFormData.length > 0 && initialFormData[0] && !initialFormData[0].error) {
//             setChildFeeHistory(initialFormData[0]?.feeInfo || null);
//         }
//         if (children.length > 1) {
//             setIsUnifiedMode(true);
//             const updatedInitialFormData = initialFormData.map(fd => ({...fd, concession: "" }));
//             setFormData(updatedInitialFormData);
//             const firstChildData = updatedInitialFormData.length > 0 && updatedInitialFormData[0] && !updatedInitialFormData[0].error ? updatedInitialFormData[0] : {};
//             setUnifiedPaymentData({
//                 totalAmount: "", concession: "", date: firstChildData.date || moment().format("YYYY-MM-DD"),
//                 paymentMode: firstChildData.paymentMode || "Cash", transactionId: firstChildData.transactionId || "",
//                 chequeBookNo: firstChildData.chequeBookNo || "", remarks: firstChildData.remarks || "",
//             });
//         } else setIsUnifiedMode(false);
//       }
//       setShowChildForms(true);
//     } catch (error) {
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const handleChildSelection = (index) => {
//     if (!formData || index < 0 || index >= formData.length) { toast.error("An internal error occurred."); return; }
//     const currentChildData = formData[index];
//     if (!currentChildData || currentChildData.error) { toast.warn(`Cannot select ${parentData[index]?.studentName || "this student"}.`); return; }
//     const isCurrentlySelected = selectedChildrenIndices.includes(index);
//     let updatedSelectedChildren;
//     let updatedShowFormFlags = [...showFormFlags];
//     if (isCurrentlySelected) {
//       updatedSelectedChildren = selectedChildrenIndices.filter((i) => i !== index);
//       updatedShowFormFlags[index] = false;
//     } else {
//       updatedSelectedChildren = [...selectedChildrenIndices, index];
//       updatedShowFormFlags[index] = true;
//     }
//     updatedSelectedChildren.sort((a, b) => a - b);
//     setSelectedChildrenIndices(updatedSelectedChildren);
//     setShowFormFlags(updatedShowFormFlags);
//     const newIsUnifiedMode = updatedSelectedChildren.length > 1;
//     if (isUnifiedMode !== newIsUnifiedMode) {
//         setIsUnifiedMode(newIsUnifiedMode);
//         if (newIsUnifiedMode) {
//             const clearedFormData = formData.map(fd => ({...fd, concession: ""}));
//             setFormData(clearedFormData);
//             if (updatedSelectedChildren.length > 0) {
//                 const firstSelectedChildIndex = updatedSelectedChildren[0];
//                 const firstChildData = clearedFormData[firstSelectedChildIndex];
//                 if (firstChildData && !firstChildData.error) {
//                      setUnifiedPaymentData(prev => ({ ...prev, date: firstChildData.date || moment().format("YYYY-MM-DD"),
//                         paymentMode: firstChildData.paymentMode || "Cash", transactionId: firstChildData.transactionId || "",
//                         chequeBookNo: firstChildData.chequeBookNo || "", remarks: firstChildData.remarks || "" }));
//                 }
//             }
//         } else setUnifiedPaymentData(prev => ({...prev, concession: ""}));
//     }
//     if (updatedSelectedChildren.length > 0) setChildFeeHistory(formData[updatedSelectedChildren[0]]?.feeInfo || null);
//     else setChildFeeHistory(null);
//   };
  
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) {
//       updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//       if (field === "paymentMode") {
//         if (value !== "Online" && value !== "Card") updatedFormData[index].transactionId = "";
//         if (value !== "Cheque") updatedFormData[index].chequeBookNo = "";
//       }
//       if (field === "isExempt") {
//         if (value) { 
//           const data = updatedFormData[index]; let total = 0;
//           total += parseFloat(data.pastDues) || 0; total += parseFloat(data.lateFine) || 0;
//           total += data.selectedMonths.reduce((sum, monthState) => sum + (monthState?.due || 0), 0);
//           total += data.selectedAdditionalFees.reduce((sum, fee) => {
//             if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//               return sum + fee.dueMonths.reduce((monthSum, month) => {
//                 const feeDetail = data.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//                 if (feeDetail) { const monthData = feeDetail.months.find((m) => m.month === month); return monthSum + (monthData?.dueAmount || 0); }
//                 return monthSum;
//               }, 0);
//             } else if (fee.frequency === "one-time") {
//               const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find((d) => d.name === fee.name);
//               return sum + (oneTimeDue ? oneTimeDue.dueAmount : parseFloat(fee.amount) || 0);
//             } return sum;
//           }, 0);
//           total += data.selectedOneTimeFees.reduce((sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0), 0);
//           const selectedMonthNames = data.selectedMonths.map((m) => m.value);
//           const selectedAdditionalFeeDues = data.selectedAdditionalFees.filter((fee) => fee.frequency === "monthly").flatMap((fee) => fee.dueMonths.map((month) => ({ name: fee.name, month })));
//           const remainingDues = data.monthlyDues.additionalDues.filter((due) => {
//             const feeStructure = data.feeInfo?.feeStructure?.additionalFees?.find((fs) => fs.name === due.name);
//             return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some((s) => s.name === due.name && s.month === due.month) && feeStructure?.frequency === "monthly");
//           }).reduce((sum, due) => sum + due.dueAmount, 0);
//           total += remainingDues; total -= parseFloat(data.concession) || 0; 
//           updatedFormData[index].exemption = Math.max(0, total).toFixed(2);
//           updatedFormData[index].totalAmount = "0"; 
//         } else updatedFormData[index].exemption = "";
//       }
//       setFormData(updatedFormData);
//     }
//   };

//   const handleUnifiedInputChange = (field, value) => {
//     setUnifiedPaymentData(prev => {
//         const newState = { ...prev, [field]: value };
//         if (field === "paymentMode") {
//             if (value !== "Online" && value !== "Card") newState.transactionId = "";
//             if (value !== "Cheque") newState.chequeBookNo = "";
//         }
//         return newState;
//     });
//   };

//   const handleMonthMultiSelectChange = (index, name, selectedOptions) => {
//     const selectedOptionsData = selectedOptions || [];
//     let updatedFormData = [...formData]; 
//     if (!updatedFormData[index]) return;
//     const currentChildData = updatedFormData[index];
//     const selectedMonthNames = selectedOptionsData.map((opt) => opt.code);
//     if (selectedMonthNames.length > 1) {
//       const indicesInAllMonths = selectedMonthNames.map((month) => allMonths.indexOf(month)).sort((a, b) => a - b);
//       let isSequential = true;
//       for (let i = 1; i < indicesInAllMonths.length; i++) { if (indicesInAllMonths[i] !== indicesInAllMonths[i - 1] + 1) { isSequential = false; break; } }
//       if (!isSequential) { toast.warn("Please select months in a continuous sequence."); return; }
//     }
//     const newSelectedMonths = selectedOptionsData.map((opt) => {
//       const originalFee = currentChildData.regularFees.find((fee) => fee.month === opt.code);
//       if (!originalFee) return null;
//       return { value: originalFee.month, label: originalFee.label, due: originalFee.dueAmount };
//     }).filter(Boolean);
//     updatedFormData[index].selectedMonths = newSelectedMonths;
//     const newSelectedAdditionalFees = [];
//     const structuredMonthlyAddFees = currentChildData.feeInfo?.feeStructure?.additionalFees?.filter((fee) => fee.frequency === "monthly") || [];
//     structuredMonthlyAddFees.forEach((fee) => {
//       const availableFeeOption = currentChildData.availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
//       if (availableFeeOption) {
//         const feeDetail = currentChildData.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//         if (!feeDetail) return;
//         const dueMonths = newSelectedMonths.map((m) => {
//           const monthData = feeDetail.months.find((fm) => fm.month === m.value);
//           if (monthData && monthData.dueAmount > 0) return monthData.month;
//           return null;
//         }).filter(Boolean);
//         if (dueMonths.length > 0) {
//           const totalAmount = dueMonths.reduce((sum, month) => { const mData = feeDetail.months.find((fm) => fm.month === month); return sum + (mData?.dueAmount || 0); }, 0);
//           newSelectedAdditionalFees.push({ id: availableFeeOption.id, name: availableFeeOption.name, amount: totalAmount, type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths });
//         }
//       }
//     });
//     const existingOneTimeFees = currentChildData.selectedAdditionalFees.filter((fee) => fee.frequency === "one-time");
//     updatedFormData[index].selectedAdditionalFees = [...newSelectedAdditionalFees, ...existingOneTimeFees];
//     if (isUnifiedMode && selectedChildrenIndices.length > 1) {
//         selectedChildrenIndices.forEach(siblingIndex => {
//             if (siblingIndex !== index && updatedFormData[siblingIndex] && !updatedFormData[siblingIndex].error) {
//                 const siblingCurrentData = updatedFormData[siblingIndex];
//                 const synchronizedSiblingMonths = newSelectedMonths.map(masterMonth => {
//                     const siblingMonthFeeData = siblingCurrentData.regularFees.find(rf => rf.month === masterMonth.value);
//                     if (siblingMonthFeeData && siblingMonthFeeData.dueAmount > 0) return { value: siblingMonthFeeData.month, label: siblingMonthFeeData.label, due: siblingMonthFeeData.dueAmount };
//                     return null;
//                 }).filter(Boolean);
//                 updatedFormData[siblingIndex].selectedMonths = synchronizedSiblingMonths;
//                 const newSelectedAdditionalFeesSibling = [];
//                 const structuredMonthlyAddFeesSibling = siblingCurrentData.feeInfo?.feeStructure?.additionalFees?.filter((f) => f.frequency === "monthly") || [];
//                 structuredMonthlyAddFeesSibling.forEach((fee) => {
//                     const availableFeeOption = siblingCurrentData.availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
//                     if (availableFeeOption) {
//                         const feeDetail = siblingCurrentData.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//                         if (!feeDetail) return;
//                         const dueMonths = synchronizedSiblingMonths.map((m) => {
//                             const monthData = feeDetail.months.find((fm) => fm.month === m.value);
//                             if (monthData && monthData.dueAmount > 0) return monthData.month;
//                             return null;
//                         }).filter(Boolean);
//                         if (dueMonths.length > 0) {
//                             const totalAmount = dueMonths.reduce((sum, month) => { const mData = feeDetail.months.find((fm) => fm.month === month); return sum + (mData?.dueAmount || 0); }, 0);
//                             newSelectedAdditionalFeesSibling.push({ id: availableFeeOption.id, name: availableFeeOption.name, amount: totalAmount, type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths });
//                         }
//                     }
//                 });
//                 const existingOneTimeFeesSibling = siblingCurrentData.selectedAdditionalFees.filter((f) => f.frequency === "one-time");
//                 updatedFormData[siblingIndex].selectedAdditionalFees = [...newSelectedAdditionalFeesSibling, ...existingOneTimeFeesSibling];
//             }
//         });
//     }
//     setFormData(updatedFormData);
//   };

//   const handleDynamicMultiSelectChange = (index, field, selectedOptions) => {
//     const updatedFormData = [...formData];
//     if (!updatedFormData[index]) return;
//     const currentChildData = updatedFormData[index];
//     if (field === "selectedAdditionalFees") {
//       const newSelectedAdditionalFees = (selectedOptions || []).map((opt) => {
//         const originalFee = currentChildData.availableAdditionalFees.find((fee) => fee.id === opt.code && fee.frequency === "monthly");
//         if (originalFee) return { id: originalFee.id, name: originalFee.name, amount: originalFee.value, type: originalFee.type, frequency: originalFee.frequency, dueMonths: originalFee.frequency === "monthly" ? currentChildData.selectedMonths.map((m) => m.value) : [] };
//         return null;
//       }).filter(Boolean);
//       const existingFees = currentChildData.selectedAdditionalFees.filter((fee) => fee.frequency === "one-time");
//       updatedFormData[index].selectedAdditionalFees = [...newSelectedAdditionalFees, ...existingFees];
//     } else if (field === "selectedOneTimeFees") {
//       const newSelectedOneTimeFees = (selectedOptions || []).map((opt) => {
//         const originalFee = currentChildData.oneTimeFeeOptions.find((fee) => fee.code === opt.code);
//         if (originalFee) return { name: originalFee.name, dueAmount: originalFee.dueAmount, frequency: originalFee.frequency };
//         return null;
//       }).filter(Boolean);
//       updatedFormData[index].selectedOneTimeFees = newSelectedOneTimeFees;
//     }
//     setFormData(updatedFormData);
//   };

//   const calculateNetPayableAmount = useCallback((index) => {
//     const data = formData[index];
//     if (!data || data.error) return 0;
//     let total = 0;
//     total += parseFloat(data.pastDues) || 0; total += parseFloat(data.lateFine) || 0;
//     total += data.selectedMonths.reduce((sum, monthState) => sum + (monthState?.due || 0), 0);
//     total += data.selectedAdditionalFees.reduce((sum, fee) => {
//       if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//         return sum + fee.dueMonths.reduce((monthSum, month) => {
//           const feeDetail = data.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//           if (feeDetail) { const monthData = feeDetail.months.find((m) => m.month === month); return monthSum + (monthData?.dueAmount || 0); }
//           return monthSum;
//         }, 0);
//       } else if (fee.frequency === "one-time") {
//         const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find((d) => d.name === fee.name);
//         return sum + (oneTimeDue ? oneTimeDue.dueAmount : parseFloat(fee.amount) || 0);
//       } return sum;
//     }, 0);
//     total += data.selectedOneTimeFees.reduce((sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0), 0);
//     const selectedMonthNames = data.selectedMonths.map((m) => m.value);
//     const selectedAdditionalFeeDues = data.selectedAdditionalFees.filter((fee) => fee.frequency === "monthly").flatMap((fee) => fee.dueMonths.map((month) => ({ name: fee.name, month })));
//     const remainingDues = data.monthlyDues.additionalDues.filter((due) => {
//       const feeStructure = data.feeInfo?.feeStructure?.additionalFees?.find((fs) => fs.name === due.name);
//       return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some((s) => s.name === due.name && s.month === due.month) && feeStructure?.frequency === "monthly");
//     }).reduce((sum, due) => sum + due.dueAmount, 0);
//     total += remainingDues;
//     if (!isUnifiedMode) total -= parseFloat(data.concession) || 0;
//     total -= parseFloat(data.exemption) || 0;
//     return Math.max(0, total);
//   }, [formData, isUnifiedMode]); 

//   const calculateTotalUnifiedPayable = useCallback(() => {
//     if (!isUnifiedMode || selectedChildrenIndices.length === 0) return 0;
//     let totalUnifiedPayable = 0;
//     selectedChildrenIndices.forEach(index => {
//       if (formData[index] && !formData[index].error) {
//         totalUnifiedPayable += calculateNetPayableAmount(index);
//       }
//     });
//     return totalUnifiedPayable;
//   }, [isUnifiedMode, selectedChildrenIndices, formData, calculateNetPayableAmount]);

//   const calculateAutoDistribution = useCallback((index, amountPaidOverride = null) => {
//     const data = formData[index];
//     if (!data || data.error) return { remainingAfterDistribution: 0, remainingDues: 0 };
//     const netPayable = calculateNetPayableAmount(index); 
//     const totalAmountPaid = amountPaidOverride !== null ? amountPaidOverride : (parseFloat(data.totalAmount) || 0);
//     const remainingDues = Math.max(0, netPayable - totalAmountPaid);
//     const remainingAfterDistribution = Math.max(0, totalAmountPaid - netPayable);
//     return { remainingAfterDistribution, remainingDues };
//   }, [formData, calculateNetPayableAmount, isUnifiedMode]);

//   const fetchReceiptData = async (receiptNumber, isUnifiedRec = false) => {
//     setIsPreviewReady(false); setIsLoader(true);
//     try {
//       const url = isUnifiedRec ? `${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/unified-receipts?unifiedReceiptNumber=${receiptNumber}`
//                               : `${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`;
//       const response = await axios.get(url, { headers: { Authorization: `Bearer ${authToken}` } });
//       if (response.data.success) { setReceiptData(response.data); setIsPreviewReady(true); return response.data; }
//       else { toast.error(`Failed to fetch receipt data: ${response.data.message || "Unknown error"}`); return null; }
//     } catch (error) {
//       if (isUnifiedRec && error.response?.status === 404) {
//         try {
//           const fallbackResponse = await axios.get(`${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`, { headers: { Authorization: `Bearer ${authToken}` } });
//           if (fallbackResponse.data.success) { setReceiptData(fallbackResponse.data); setIsPreviewReady(true); return fallbackResponse.data; }
//           else { toast.error(`Fallback receipt fetch failed: ${fallbackResponse.data.message || "Unknown error"}`); return null; }
//         } catch (fallbackError) { toast.error("Error fetching receipt data: " + fallbackError.message); return null; }
//       } else { toast.error("Error fetching receipt data: " + error.message); return null; }
//     } finally { setIsLoader(false); }
//   };

//   const validateFormData = (childFormData, child, isUnifiedValidation = false) => {
//     if (!childFormData || childFormData.error) { toast.error(`Cannot submit for ${child?.studentName || "this student"} due to missing data.`); return false; }
//     if (childFormData.isExempt) {
//       const tempIndex = formData.findIndex(fd => fd.studentId === child.studentId);
//       const netPayableForExemption = calculateNetPayableAmount(tempIndex); 
//       childFormData.exemption = netPayableForExemption.toFixed(2);
//     } else if (!isUnifiedValidation) { 
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;
//       if (totalAmount <= 0) { toast.warn(`Please enter a valid amount (> 0) to pay for ${child.studentName}.`); return false; }
//     }
//     const paymentDataSource = isUnifiedValidation ? unifiedPaymentData : childFormData;
//     if (!paymentDataSource.paymentMode) { toast.error(`Payment mode is required for ${child.studentName}.`); return false; }
//     if ((paymentDataSource.paymentMode === "Online" || paymentDataSource.paymentMode === "Card") && !paymentDataSource.transactionId) { toast.error(`Transaction ID is required for Online/Card payment for ${child.studentName}.`); return false; }
//     if (paymentDataSource.paymentMode === "Cheque" && !paymentDataSource.chequeBookNo) { toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}.`); return false; }
//     if (!paymentDataSource.date || !moment(paymentDataSource.date, "YYYY-MM-DD", true).isValid()) { toast.error(`Please select a valid payment date for ${child.studentName}.`); return false; }
//     const concession = isUnifiedValidation ? 0 : (parseFloat(childFormData.concession) || 0); 
//     const exemption = parseFloat(childFormData.exemption) || 0;
//     if (concession < 0) { toast.warn(`Concession amount cannot be negative for ${child.studentName}.`); return false; }
//     if (exemption < 0) { toast.warn(`Exemption amount cannot be negative for ${child.studentName}.`); return false; }
//     if (!isUnifiedValidation && !childFormData.isExempt && parseFloat(childFormData.totalAmount) > 0 && childFormData.selectedMonths.length === 0 && childFormData.selectedAdditionalFees.length === 0 && childFormData.selectedOneTimeFees.length === 0) {
//         const tempIndex = formData.findIndex(fd => fd.studentId === child.studentId);
//         const onlyPayingDuesAndFines = (parseFloat(formData[tempIndex].pastDues) || 0) + (parseFloat(formData[tempIndex].lateFine) || 0);
//         if (parseFloat(childFormData.totalAmount) > onlyPayingDuesAndFines) {
//             toast.warn(`Amount paid for ${child.studentName} exceeds past dues/fines, but no specific month/fee selected. Select items or add remark for advance.`);
//             return false;
//         }
//     }
//     return true;
//   };

//   const handleSubmit = async (e, childIndex) => {
//     e.preventDefault(); e.stopPropagation();
//     const childFormData = formData[childIndex];
//     const child = parentData[childIndex];
//     if (!validateFormData(childFormData, child, false)) return;
//     setIsLoader(true);
//     const selectedMonthNames = childFormData.selectedMonths.map((m) => m.value);
//     const selectedOneTimeFeeNames = childFormData.selectedOneTimeFees.map(fee => fee.name);
//     const monthlyFeesPayload = []; const oneTimeFeesPayload = [];
//     childFormData.selectedAdditionalFees.forEach((fee) => {
//       if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//         fee.dueMonths.forEach((monthName) => {
//           const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(m => m.month === monthName);
//           const isFeeDueForThisMonth = monthStatus?.additionalFees?.some(mf => mf.name === fee.name && mf.status !== "Paid");
//           if (isFeeDueForThisMonth) monthlyFeesPayload.push({ name: fee.name, month: monthName });
//         });
//       }
//     });
//     const selectedAdditionalFeeDues = childFormData.selectedAdditionalFees.filter(fee => fee.frequency === "monthly").flatMap(fee => fee.dueMonths.map(month => ({ name: fee.name, month })));
//     const remainingDues = childFormData.monthlyDues.additionalDues.filter(due => {
//         const feeStructure = childFormData.feeInfo?.feeStructure?.additionalFees?.find(fs => fs.name === due.name);
//         return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some(s => s.name === due.name && s.month === due.month) && feeStructure?.frequency === "monthly" && !selectedOneTimeFeeNames.includes(due.name));
//       }).map(due => ({ name: due.name, month: due.month }));
//     monthlyFeesPayload.push(...remainingDues);
//     childFormData.selectedOneTimeFees.forEach((fee) => oneTimeFeesPayload.push({ name: fee.name }));
//     const additionalFeesPayload = [...monthlyFeesPayload, ...oneTimeFeesPayload];
//     let exemptionAmount = parseFloat(childFormData.exemption) || 0;
//     if (childFormData.isExempt) exemptionAmount = calculateNetPayableAmount(childIndex);
//     const rawPaymentDetails = {
//       regularFees: childFormData.selectedMonths.map((ms) => ({ month: ms.value })), additionalFees: additionalFeesPayload,
//       pastDuesPaid: 0, lateFinesPaid: 0, concession: parseFloat(childFormData.concession) || 0, exemption: exemptionAmount,
//       totalAmount: childFormData.isExempt ? 0 : (parseFloat(childFormData.totalAmount) || 0),
//       date: childFormData.date ? moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY") : moment(new Date()).format("DD-MM-YYYY"),
//       paymentMode: childFormData.paymentMode, transactionId: childFormData.transactionId || undefined, 
//       chequeNumber: childFormData.chequeBookNo || undefined, remark: childFormData.remarks || "",
//     };
//     const finalPaymentDetails = buildPaymentDetailsObject(rawPaymentDetails, true);
//     const payload = { studentId: child.studentId, session, paymentDetails: finalPaymentDetails };
//     console.log("Single Submission Payload:", JSON.stringify(payload, null, 2));
//     try {
//       const response = await feescreateFeeStatus(payload);
//       if (response?.success) { toast.success(response?.message || `Fees submitted for ${child.studentName}!`); setResponseData(response?.data); setIsMessageModalOpen(true); }
//       else toast.error(response?.message || `Fee submission failed for ${child.studentName}.`);
//     } catch (error) { toast.error(`Error during submission for ${child.studentName}: ${error.response?.data?.message || error.message}`);
//     } finally { setIsLoader(false); }
//   };

//   const handleUnifiedFeePayment = async () => {
//     if (!isUnifiedMode || selectedChildrenIndices.length < 2) { toast.warn("Select at least two students."); return; }
//     if (!unifiedPaymentData.paymentMode) { toast.error("Unified Payment mode is required."); return; }
//     if ((unifiedPaymentData.paymentMode === "Online" || unifiedPaymentData.paymentMode === "Card") && !unifiedPaymentData.transactionId) { toast.error("Unified Transaction ID is required."); return; }
//     if (unifiedPaymentData.paymentMode === "Cheque" && !unifiedPaymentData.chequeBookNo) { toast.error("Unified Cheque Number is required."); return; }
//     if (!unifiedPaymentData.date || !moment(unifiedPaymentData.date, "YYYY-MM-DD", true).isValid()) { toast.error("Select a valid unified payment date."); return; }
//     const unifiedTotalAmountPaidNum = parseFloat(unifiedPaymentData.totalAmount) || 0;
//     const unifiedConcessionNum = parseFloat(unifiedPaymentData.concession) || 0;
//     if (unifiedConcessionNum < 0) { toast.error("Unified concession cannot be negative."); return; }
//     const anyExempt = selectedChildrenIndices.some(index => formData[index].isExempt);
//     if (!anyExempt && unifiedTotalAmountPaidNum <= 0 && unifiedConcessionNum <= 0) { toast.warn("Enter total amount (>0) or concession for siblings."); return; }
//     if (unifiedTotalAmountPaidNum < 0 && !anyExempt) { toast.warn("Enter total amount (>=0) for siblings."); return; }

//     const studentsPaymentInfo = []; let overallValidationPassed = true;
//     for (const index of selectedChildrenIndices) {
//         const childFormData = formData[index]; const child = parentData[index];
//         if (!validateFormData(childFormData, child, true)) { overallValidationPassed = false; break; }
//         let netPayableForChild = calculateNetPayableAmount(index); 
//         let exemptionAmountForPayload = parseFloat(childFormData.exemption) || 0;
//         if (childFormData.isExempt) { exemptionAmountForPayload = netPayableForChild; netPayableForChild = 0; }
//         studentsPaymentInfo.push({ index, studentId: child.studentId, childFormData, netPayableForDistribution: netPayableForChild, exemptionAmountForPayload, isExempt: childFormData.isExempt, allocatedAmount: 0 });
//     }
//     if (!overallValidationPassed) return;
//     let amountToDistribute = unifiedTotalAmountPaidNum - unifiedConcessionNum;
//     amountToDistribute = Math.max(0, amountToDistribute); 
//     for (const studentInfo of studentsPaymentInfo) {
//         if (studentInfo.isExempt || studentInfo.netPayableForDistribution <= 0) { studentInfo.allocatedAmount = 0; continue; }
//         if (amountToDistribute <= 0) break; 
//         const canAllocate = Math.min(studentInfo.netPayableForDistribution, amountToDistribute);
//         studentInfo.allocatedAmount = canAllocate; amountToDistribute -= canAllocate;
//     }
//     const studentsApiPayload = [];
//     for (const studentInfo of studentsPaymentInfo) {
//       const { childFormData, studentId, allocatedAmount, exemptionAmountForPayload } = studentInfo;
//       const additionalFeesPayloadForStudent = [];
//       const selectedMonthNames = childFormData.selectedMonths.map(m => m.value); 
//       const selectedOneTimeFeeNames = childFormData.selectedOneTimeFees.map(f => f.name);
//       childFormData.selectedAdditionalFees.forEach((fee) => {
//         if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//             fee.dueMonths.forEach((monthName) => {
//                 const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(m => m.month === monthName);
//                 const isFeeDue = monthStatus?.additionalFees?.some(mf => mf.name === fee.name && mf.status !== "Paid" && mf.status !== "Exempt");
//                 if (isFeeDue) additionalFeesPayloadForStudent.push({ name: fee.name, month: monthName });
//             });
//         }
//       });
//       const selectedAdditionalFeeDues = additionalFeesPayloadForStudent.map(f => ({ name: f.name, month: f.month }));
//       const remainingMonthlyDues = childFormData.monthlyDues.additionalDues.filter(due => {
//             const feeStructure = childFormData.feeInfo?.feeStructure?.additionalFees?.find(fs => fs.name === due.name);
//             return (due.dueAmount > 0 && feeStructure?.frequency === "monthly" && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some(s => s.name === due.name && s.month === due.month) && !selectedOneTimeFeeNames.includes(due.name));
//         }).map(due => ({ name: due.name, month: due.month }));
//       additionalFeesPayloadForStudent.push(...remainingMonthlyDues);
//       childFormData.selectedOneTimeFees.forEach((fee) => {
//          const oneTimeDue = childFormData.feeInfo?.oneTimeAdditionalDues?.find(d => d.name === fee.name && d.status !== "Paid" && d.status !== "Exempt");
//          if(oneTimeDue) additionalFeesPayloadForStudent.push({ name: fee.name });
//       });
//       const rawStudentPaymentDetails = { regularFees: childFormData.selectedMonths.map(ms => ({ month: ms.value })), additionalFees: additionalFeesPayloadForStudent, pastDuesPaid: 0, lateFinesPaid: 0, concession: 0, exemption: exemptionAmountForPayload, totalAmount: allocatedAmount };
//       const finalStudentPaymentDetails = buildPaymentDetailsObject(rawStudentPaymentDetails, false);
//       const hasRegFees = finalStudentPaymentDetails.regularFees && finalStudentPaymentDetails.regularFees.length > 0;
//       const hasAddFees = finalStudentPaymentDetails.additionalFees && finalStudentPaymentDetails.additionalFees.length > 0;
//       const hasExmp = finalStudentPaymentDetails.exemption && parseFloat(finalStudentPaymentDetails.exemption) !== 0;
//       const hasTotalAmt = (finalStudentPaymentDetails.totalAmount !== undefined && parseFloat(finalStudentPaymentDetails.totalAmount) > 0) || (hasExmp && finalStudentPaymentDetails.totalAmount !== undefined && parseFloat(finalStudentPaymentDetails.totalAmount) === 0);
//       if (hasRegFees || hasAddFees || hasExmp || hasTotalAmt) {
//         studentsApiPayload.push({ studentId, paymentDetails: finalStudentPaymentDetails });
//       }
//     }
//     if (studentsApiPayload.length === 0 && unifiedConcessionNum <= 0) { toast.info("No payment actions for selected students."); setIsLoader(false); return; }
//     const finalUnifiedPaymentDetailsAPI = {
//         paymentMode: unifiedPaymentData.paymentMode, transactionId: unifiedPaymentData.transactionId || undefined,
//         chequeNumber: unifiedPaymentData.chequeBookNo || undefined, date: moment(unifiedPaymentData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
//         remark: (unifiedPaymentData.remarks && unifiedPaymentData.remarks.trim() !== "") ? unifiedPaymentData.remarks.trim() : undefined,
//         ...(unifiedConcessionNum > 0 && { globalConcession: unifiedConcessionNum })
//     };
//     const payload = { students: studentsApiPayload, session, unifiedPaymentDetails: finalUnifiedPaymentDetailsAPI };
//     console.log("Unified Payload:", JSON.stringify(payload, null, 2));
//     setIsLoader(true);
//     try {
//       const response = await feescreateUnifiedFeeStatus(payload);
//       if (response.success) { toast.success(response.message || "Unified fees submitted!"); setUnifiedReceiptData(response.data); setIsMessageModalOpen(true); }
//       else toast.error(response.message || "Unified fee submission failed.");
//     } catch (error) { toast.error(`Error during unified submission: ${error.response?.data?.message || error.message}`);
//     } finally { setIsLoader(false); }
//   };
  
//   const handleCloseMessageModal = async (sendMsg = false) => {
//     setIsMessageModalOpen(false); let receiptNumber = null; let isUnifiedRec = false; 
//     let dataForActions = null; let parentIdForRefresh = null;
//     if (responseData) { receiptNumber = responseData.feeReceiptNumber; isUnifiedRec = false; dataForActions = responseData; parentIdForRefresh = responseData?.student?.parentId; }
//     else if (unifiedReceiptData) { receiptNumber = unifiedReceiptData.unifiedReceiptNumber; isUnifiedRec = true; dataForActions = unifiedReceiptData; parentIdForRefresh = unifiedReceiptData?.parentId || (unifiedReceiptData?.students?.[0]?.parentId); }
//     if (sendMsg && dataForActions) { if (isUnifiedRec) sendUnifiedMessage(dataForActions); else sendMessage(dataForActions); }
//     const tempReceiptNumber = receiptNumber; const tempIsUnified = isUnifiedRec;
//     const currentSearchTerm = searchTerm; const currentSearchTermAdm = searchTermbyadmissionNo; const currentFiltered = filteredStudents;
//     resetState(); 
//     setSearchTerm(currentSearchTerm); setSearchTermbyadmissionNo(currentSearchTermAdm); setFilteredStudents(currentFiltered);
//     if (parentIdForRefresh) await handleStudentClick(parentIdForRefresh); 
//     else setTriggerRefresh((prev) => !prev); 
//     if (tempReceiptNumber) {
//       const fetchedReceiptData = await fetchReceiptData(tempReceiptNumber, tempIsUnified);
//       if (fetchedReceiptData) { if (tempIsUnified) setUnifiedReceiptModalOpen(true); else setPdfModalOpen(true); }
//     }
//   };

//   const handleClosePdfModal = (action = null) => {
//     if (action === "download" && receiptData) handleDownloadPdf(receiptData);
//     else if (action === "print" && receiptData) handlePrintReceipt(receiptData);
//     setPdfModalOpen(false); setReceiptData(null); setIsPreviewReady(false);
//   };
//   const handleCloseUnifiedReceiptModal = (action = null) => {
//     if (action === "download" && receiptData) handleDownloadUnifiedPdf(receiptData);
//     else if (action === "print" && receiptData) handlePrintUnifiedReceipt(receiptData);
//     setUnifiedReceiptModalOpen(false); setReceiptData(null); setIsPreviewReady(false);
//   };
//   const handleDownloadPdf = (dataToUse) => {
//     if (!dataToUse?.data) { toast.error("No receipt data for PDF."); return; }
//     generatePdf(dataToUse.data, [], 0,0,0,0,0,0, `fee-receipt-${dataToUse.data?.feeReceiptNumber}.pdf`);
//   };
//   const handlePrintReceipt = (dataToUse) => {
//     if (!dataToUse?.data) { toast.error("No receipt data to print."); return; }
//     toast.info("Print placeholder: " + dataToUse.data?.feeReceiptNumber);
//   };
//   const sendMessage = (dataToUse) => {
//     if (!dataToUse) { toast.error("No receipt data for SMS."); return; }
//     try { FeeResponse(dataToUse); toast.info(`SMS called for ${dataToUse?.student?.studentName}`); }
//     catch (error) { toast.error("Failed to initiate SMS."); }
//   };
//   const handleDownloadUnifiedPdf = (dataToUse) => {
//     if (!dataToUse?.data) { toast.error("No unified receipt data for PDF."); return; }
//     generatePdf(dataToUse.data, [], 0,0,0,0,0,0, `unified-receipt-${dataToUse.data?.unifiedReceiptNumber}.pdf`);
//   };
//   const handlePrintUnifiedReceipt = (dataToUse) => {
//     if (!dataToUse?.data) { toast.error("No unified receipt data to print."); return; }
//     toast.info("Print placeholder: " + dataToUse.data?.unifiedReceiptNumber);
//   };
//   const sendUnifiedMessage = (dataToUse) => {
//     if (!dataToUse) { toast.error("No unified receipt data for SMS."); return; }
//     try { FeeResponseSibling(dataToUse?.feeReceipts);
//       const studentNames = dataToUse?.students?.map((s) => s.studentName).join(", ") || "selected students";
//       toast.info(`SMS called for ${studentNames}`);
//     } catch (error) { toast.error("Failed to initiate SMS."); }
//   };

//   return (
//     <div className="">
//       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Create Fee" />
//       <div className=" mx-auto">
//         <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row gap-4 ">
//           <ReactInput type="text" label="Search by Name" onChange={handleSearch} value={searchTerm} containerClassName="flex-1 min-w-[200px]" />
//           <ReactInput type="text" label="Search by Adm. No" onChange={handleSearchbyAdmissionNo} value={searchTermbyadmissionNo} containerClassName="flex-1 min-w-[200px]" />
//         </div>

//         {filteredStudents.length > 0 && (
//           <div className="relative">
//             <div className="absolute z-30 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ">
//               <table className="w-full border-collapse">
//                 <thead className="bg-gray-100 sticky top-0 z-20">
//                   <tr>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Adm No.</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Student Name</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Class</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Parent Name</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Contact</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredStudents.map((student) => (
//                     <tr key={student._id} className="cursor-pointer hover:bg-gray-100 border-b"
//                       onClick={() => { handleStudentClick(student.parentId); setFilteredStudents([]); }}>
//                       <td className="p-1 text-[13px]">{student.admissionNumber}</td>
//                       <td className="p-1 font-semibold text-[13px]">{student.studentName}</td>
//                       <td className="p-1 text-[13px]">{student.class}</td>
//                       <td className="p-1 text-[13px]">{student.fatherName}</td>
//                       <td className="p-1 text-[13px]">{student?.parentContact}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {showChildForms && parentData.length > 0 && (
//           <div className=" pt-2 border-t border-gray-200">
//             <div className="flex justify-between items-center mb-4">
//               <h5 className="text-sm font-semibold text-gray-800">Selected Student(s) Fee Payment</h5>
//               {/* {isUnifiedMode && selectedChildrenIndices.length > 1 && (
//                 <Button name="Pay for Siblings Together" onClick={handleUnifiedFeePayment} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm" />
//               )} */}
//             </div>

//             {isUnifiedMode && selectedChildrenIndices.length > 1 && (
//                 <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50 shadow">
//                     <div className="flex justify-between items-center mb-3">
//                         <h3 className="text-lg font-semibold text-blue-700">Unified Payment Details</h3>
//                         <div className="text-right">
//                             <span className="text-md font-medium text-gray-800">Total Payable (All Selected): </span>
//                             <span className="text-lg font-bold text-green-600">
//                                 ₹{calculateTotalUnifiedPayable().toFixed(2)}
//                             </span>
//                         </div>
//                     </div>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <ReactInput type="number" label="Total Amount to Pay (Unified)" value={unifiedPaymentData.totalAmount} onChange={(e) => handleUnifiedInputChange("totalAmount", e.target.value)} min="0" step="0.01" isRequired={true} />
//                         <ReactInput type="number" label="Unified Concession" value={unifiedPaymentData.concession} onChange={(e) => handleUnifiedInputChange("concession", e.target.value)} min="0" step="0.01" />
//                          <DatePicker className="custom-calendar" label="Payment Date (Unified)" name="unifiedDate" id="unifiedDate" value={unifiedPaymentData.date ? new Date(unifiedPaymentData.date) : new Date()} handleChange={(e) => handleUnifiedInputChange("date", e.target.value)} />
//                         <ReactSelect name="unifiedPaymentMode" label="Payment Mode (Unified)" value={unifiedPaymentData.paymentMode} handleChange={(e) => handleUnifiedInputChange("paymentMode", e.target.value)}
//                             dynamicOptions={[ { label: "Cash", value: "Cash" }, { label: "Online", value: "Online" }, { label: "Cheque", value: "Cheque" }, { label: "Card", value: "Card" } ]} />
//                         {(unifiedPaymentData.paymentMode === "Online" || unifiedPaymentData.paymentMode === "Card") && ( <ReactInput type="text" label="Transaction ID (Unified)" value={unifiedPaymentData.transactionId} onChange={(e) => handleUnifiedInputChange("transactionId", e.target.value)} isRequired={true} /> )}
//                         {unifiedPaymentData.paymentMode === "Cheque" && ( <ReactInput type="text" label="Cheque Number (Unified)" value={unifiedPaymentData.chequeBookNo} onChange={(e) => handleUnifiedInputChange("chequeBookNo", e.target.value)} isRequired={true} /> )}
//                          {/* <div className="md:col-span-2 lg:col-span-1"> */}
//                             {/* <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Unified)</label> */}
//                             <textarea value={unifiedPaymentData.remarks} onChange={(e) => handleUnifiedInputChange("remarks", e.target.value)} className="block w-full border rounded-md shadow-sm py-2 px-3" rows="1" placeholder="Optional remarks..." />
//                         {/* </div> */}
//                          {isUnifiedMode && selectedChildrenIndices.length > 1 && (
//                 <Button name="Pay for Siblings Together" onClick={handleUnifiedFeePayment} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm" />
//               )}
//                     </div>
//                 </div>
//             )}

//             <div className="flex flex-col gap-2">
//               {parentData.map((child, index) => {
//                 const currentFormData = formData[index];
//                 if (!currentFormData || currentFormData.error) {
//                   return ( <div key={child._id || index} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md" role="alert"> <strong className="font-bold">Error:</strong> <span className="block sm:inline ml-2">Could not load fee data for {child.studentName || "this student"}.</span> </div> );
//                 }
//                 const isSelected = selectedChildrenIndices.includes(index);
//                 const showForm = showFormFlags[index];
//                 const monthOptions = currentFormData.regularFees.filter(f => f.dueAmount > 0).map(f => ({ name: f.label, code: f.month }));
//                 const selectedMonthValues = currentFormData.selectedMonths.map(ms => ({ name: ms.label, code: ms.value }));
//                 const additionalFeeOptions = currentFormData.availableAdditionalFees.filter(f => f.frequency === "monthly").map(item => ({ name: item.label, code: item.id }));
//                 const selectedAdditionalFeeValues = currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly").map(sf => { const opt = additionalFeeOptions.find(o => o.code === sf.id); return { name: opt ? opt.name : `${sf.name} (${sf.type}) - ₹${sf.amount}`, code: sf.id }; });
//                 const oneTimeFeeOptions = currentFormData.oneTimeFeeOptions.map(item => ({ name: item.label, code: item.code }));
//                 const selectedOneTimeFeeValues = currentFormData.selectedOneTimeFees.map(f => { const opt = oneTimeFeeOptions.find(o => o.code === f.name); return { name: opt ? opt.name : `${f.name} (Due: ₹${f.dueAmount.toFixed(2)})`, code: f.name }; });
//                 const showIndividualPaymentFields = !isUnifiedMode || selectedChildrenIndices.length <= 1;

//                 return (
//                   <div key={child._id || index} className={`bg-white rounded-lg shadow-md border transition-all duration-300 ${isSelected ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200 hover:border-gray-300"} overflow-hidden`}>
//                     <div className={`flex items-center px-4 py-1 border-b cursor-pointer`} onClick={() => handleChildSelection(index)}>
//                       <input type="checkbox" id={`child-checkbox-${index}`} checked={isSelected} onChange={(e) => { e.stopPropagation(); handleChildSelection(index); }} className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" />
//                       <label id={`child-label-${index}`} className="flex-grow cursor-pointer" htmlFor={`child-checkbox-${index}`}>
//                         <div className="flex justify-between items-center">
//                           <div><span className="text-base font-semibold text-blue-800">{child.studentName}</span> <span className="text-sm text-gray-600 ml-2">(Class: {child.class} / Adm#: {child.admissionNumber})</span></div>
//                           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-700"}`}>{isSelected ? "SELECTED" : "SELECT"}</span>
//                         </div>
//                         <div className="flex flex-wrap justify-start items-center gap-x-4 text-xs mt-1">
//                           <span className="text-red-600 font-medium">Total Dues: ₹{currentFormData?.totalDues?.toFixed(2) || "0.00"}</span>
//                           {currentFormData?.pastDues > 0 && <span className="text-purple-600 font-medium">Past Dues: ₹{currentFormData?.pastDues?.toFixed(2)}</span>}
//                           {currentFormData?.lateFine > 0 && <span className="text-orange-600 font-medium">Late Fine: ₹{currentFormData?.lateFine?.toFixed(2)}</span>}
//                           <span className="text-gray-600 font-medium">Base Fee: ₹{currentFormData?.classFee?.toFixed(2) || "0.00"}</span>
//                         </div>
//                       </label>
//                     </div>
//                     <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
//                       {showForm && (
//                         <div className="px-1 py-1 border-t flex flex-col lg:flex-row gap-1 bg-white">
//                           <form onSubmit={(e) => handleSubmit(e, index)} className="flex-grow lg:w-2/3 space-y-5 mb-6 lg:mb-0" noValidate>
//                              <div className="border rounded-md p-1 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
//                               <div><label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fees</label><DynamicMultiSelect name={`regularFees-${index}`} searchable={false} placeholderName="Select month(s)..." dynamicOptions={monthOptions} value={selectedMonthValues} handleChange={(name, opts) => handleMonthMultiSelectChange(index, name, opts)} /></div>
//                               <div><label className="block text-sm font-medium text-gray-700 mb-1">Additional (Monthly)</label><DynamicMultiSelect name={`additionalFees-${index}`} searchable={true} placeholderName="Select monthly fee(s)..." dynamicOptions={additionalFeeOptions} value={selectedAdditionalFeeValues} handleChange={(name, opts) => handleDynamicMultiSelectChange(index, "selectedAdditionalFees", opts)} /></div>
//                               <div><label className="block text-sm font-medium text-gray-700 mb-1">One-Time Fees</label><DynamicMultiSelect name={`oneTimeFees-${index}`} searchable={true} placeholderName="Select one-time fee(s)..." dynamicOptions={oneTimeFeeOptions} value={selectedOneTimeFeeValues} handleChange={(name, opts) => handleDynamicMultiSelectChange(index, "selectedOneTimeFees", opts)} /></div>
//                             </div>
//                             <div className="flex flex-wrap gap-4 items-center">
//                                 <ExemptionToggle isExempt={currentFormData.isExempt} onChange={(value) => handleInputChange(index, "isExempt", value)} studentName={child.studentName} />
//                                 {currentFormData.isExempt && <ReactInput type="number" label="Exemption" value={currentFormData.exemption} onChange={(e) => handleInputChange(index, "exemption", e.target.value)} min="0" step="0.01" disabled={!currentFormData.isExempt} />}
//                                 <div className="p-2 border rounded-md bg-gray-50"> {/* Kept child's individual net payable for context */}
//                                     <div className="text-sm font-medium text-gray-700">Child's Net Payable: <span className="font-semibold text-blue-700">₹ {calculateNetPayableAmount(index).toFixed(2)}</span></div>
//                                 </div>
//                             </div>
//                             {showIndividualPaymentFields && (
//                                 <>
//                                     <div className="flex gap-4">
//                                         <ReactInput type="number" label="Concession" value={currentFormData.concession} onChange={(e) => handleInputChange(index, "concession", e.target.value)} min="0" step="0.01" />
//                                         <DatePicker className="custom-calendar" label="Payment Date" name="date" id={`date-${index}`} value={currentFormData.date ? new Date(currentFormData.date) : new Date()} handleChange={(e) => handleInputChange(index, "date", e.target.value)} />
//                                     </div>
//                                     <div className="flex gap-4">
//                                         <ReactSelect name={`paymentMode-${index}`} value={currentFormData.paymentMode} handleChange={(e) => handleInputChange(index, "paymentMode", e.target.value)} label="Payment Mode" dynamicOptions={[ { label: "Cash", value: "Cash" }, { label: "Online", value: "Online" }, { label: "Cheque", value: "Cheque" }, { label: "Card", value: "Card" } ]}/>
//                                         {(currentFormData.paymentMode === "Online" || currentFormData.paymentMode === "Card") && ( <ReactInput type="text" label="Transaction ID" value={currentFormData.transactionId} onChange={(e) => handleInputChange(index, "transactionId", e.target.value)} isRequired={true}/> )}
//                                         {currentFormData.paymentMode === "Cheque" && ( <ReactInput type="text" label="Cheque Number" value={currentFormData.chequeBookNo} onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)} isRequired={true}/> )}
//                                     </div>
//                                     <div className="flex flex-wrap gap-4 items-end">
//                                          <ReactInput type="number" label={`Amount to Pay`} value={currentFormData.totalAmount} onChange={(e) => handleInputChange(index, "totalAmount", e.target.value)} min="0.01" step="0.01" isRequired={!currentFormData.isExempt} disabled={currentFormData.isExempt} containerClassName="flex-1 min-w-[150px]" />
//                                         {showIndividualPaymentFields && (
//                                             <div className="ml-2 pb-1"> 
//                                                 <span className="text-sm font-medium text-gray-700">Payable: </span>
//                                                 <span className="text-sm font-bold text-blue-700">₹{calculateNetPayableAmount(index).toFixed(2)}</span>
//                                             </div>
//                                         )}
//                                         <div className="flex-1 min-w-[200px]"> 
//                                             <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
//                                             <textarea value={currentFormData.remarks} onChange={(e) => handleInputChange(index, "remarks", e.target.value)} className="block w-full border rounded-md shadow-sm py-2 px-3" rows="1" placeholder="Optional remarks..." />
//                                         </div>
//                                     </div>
//                                 </>
//                             )}
//                             {showIndividualPaymentFields && (<div className="flex justify-end"><Button type="submit" name={`Submit for ${child.studentName}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm" /></div>)}
//                           </form>
//                           <div className="flex-shrink-0 lg:w-1/3 border rounded-md p-1 bg-blue-50 lg:ml-4 lg:mt-0">
//                             <h3 className="text-sm font-semibold text-blue-900 border-b border-blue-200">Payment Summary</h3>
//                             <div className="overflow-y-auto max-h-52 scrollbar-thin">
//                                 <table className="w-full text-sm"><tbody>
//                                     {currentFormData.pastDues > 0 && (<tr className="border-b"><td className="py-1">Past Dues</td><td className="font-medium text-purple-700 py-1 text-right">₹{currentFormData.pastDues.toFixed(2)}</td></tr>)}
//                                     {currentFormData.lateFine > 0 && (<tr className="border-b"><td className="py-1">Late Fines</td><td className="font-medium text-orange-700 py-1 text-right">₹{currentFormData.lateFine.toFixed(2)}</td></tr>)}
//                                     {(() => { /* ... existing logic for remaining dues ... */
//                                         const selMonths = currentFormData.selectedMonths.map(m => m.value);
//                                         const selAddFees = currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly").flatMap(f => f.dueMonths.map(m => ({ name: f.name, month: m })));
//                                         const remDuesList = currentFormData.monthlyDues.additionalDues.filter(d => { const fs = currentFormData.feeInfo?.feeStructure?.additionalFees?.find(s => s.name === d.name); return (d.dueAmount > 0 && !selMonths.includes(d.month) && !selAddFees.some(s => s.name === d.name && s.month === d.month) && fs?.frequency === "monthly"); }).reduce((acc, due) => {const ex = acc.find(i=>i.name === due.name && i.month === due.month); if(ex) ex.amount += due.dueAmount; else acc.push({name:due.name, month:due.month, amount:due.dueAmount}); return acc;}, []);
//                                         if (remDuesList.length > 0) return (<> <tr className="border-b font-medium"><td colSpan="2" className="py-1">Remaining Dues (Prev. Months)</td></tr> {remDuesList.map((d, i) => ( <tr key={`rem-sum-${index}-${i}`} className="border-b"><td className="py-1 pl-3">{d.name} ({d.month})</td><td className="font-medium text-blue-700 py-1 text-right">₹{d.amount.toFixed(2)}</td></tr>))} </>); return null;
//                                     })()}
//                                     {currentFormData.selectedMonths.length > 0 && (<> <tr className="border-b font-medium"><td colSpan="2" className="py-[2px]">Regular Fees</td></tr> {currentFormData.selectedMonths.map((ms, i) => (<tr key={`reg-sum-${index}-${i}`} className="border-b"><td className="py-[2px] pl-3">{ms.value}</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{(ms?.due || 0).toFixed(2)}</td></tr>))} </>)}
//                                     {currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly" && f.dueMonths.some(m => currentFormData.selectedMonths.map(sm => sm.value).includes(m))).length > 0 && (<>  <tr className="border-b font-medium"><td colSpan="2" className="pt-2 pb-1">Additional Fees</td></tr> {currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly" && f.dueMonths.some(m => currentFormData.selectedMonths.map(sm => sm.value).includes(m))).map((fee, i) => (<tr key={`add-sum-${index}-${i}`} className="border-b"><td className="py-[2px] pl-3">{fee.name} ({fee.type}, {fee.dueMonths.join(", ")})</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{fee.amount.toFixed(2)}</td></tr>))} </>)}
//                                     {currentFormData.selectedOneTimeFees.length > 0 && (<> <tr className="border-b font-medium"><td colSpan="2" className="pt-2 pb-1">One-Time Fees</td></tr> {currentFormData.selectedOneTimeFees.map((fee, i) => (<tr key={`one-time-sum-${index}-${i}`} className="border-b"><td className="py-[2px] pl-3">{fee.name}</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{(fee?.dueAmount || 0).toFixed(2)}</td></tr>))} </>)}
//                                     {currentFormData.exemption > 0 && (<tr className="border-b"><td className="text-green-700 py-[2px]">Exemption</td><td className="font-medium text-green-700 py-[2px] text-right">- ₹{parseFloat(currentFormData.exemption).toFixed(2)}</td></tr>)}
//                                     {!isUnifiedMode && currentFormData.concession > 0 && (<tr className="border-b"><td className="text-green-700 py-[2px]">Concession</td><td className="font-medium text-green-700 py-[2px] text-right">- ₹{parseFloat(currentFormData.concession).toFixed(2)}</td></tr>)}
//                                 </tbody></table>
//                             </div>
//                             <tfoot className="border-t-2 border-blue-200 mt-2 pt-2">
//                                 {/* Row for "Total Payable (Child)" removed as per new display logic */}
//                                 {showIndividualPaymentFields && parseFloat(currentFormData.totalAmount) > 0 && !currentFormData.isExempt && ( <>
//                                     <tr><td className="py-[2px]">Amount Paying</td><td className="font-medium text-black py-[2px] text-right">₹{parseFloat(currentFormData.totalAmount).toFixed(2)}</td></tr>
//                                     <tr><td className="font-semibold text-red-700 py-[2px]">Remaining Dues</td><td className="font-bold text-red-700 py-[2px] text-right">₹{calculateAutoDistribution(index).remainingDues.toFixed(2)}</td></tr>
//                                     {calculateAutoDistribution(index).remainingAfterDistribution > 0 && (<tr><td className="font-semibold text-green-700 py-1 text-xs">Advance/Excess</td><td className="font-semibold text-green-700 py-1 text-right text-xs">₹{calculateAutoDistribution(index).remainingAfterDistribution.toFixed(2)}</td></tr>)}
//                                 </>)}
//                             </tfoot>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {showChildForms && childFeeHistory?.monthlyStatus?.length > 0 && selectedChildrenIndices.length > 0 && (
//             <div className=" mt-2 border-t border-gray-300 "><h2 className="text-xl font-semibold text-center text-gray-800">Fee History for {childFeeHistory?.studentName || "Selected Student"} ({childFeeHistory?.session || session})</h2><div className="max-w-4xl mx-auto bg-white p-4 rounded shadow"><MonthFeeCard childFeeHistory={childFeeHistory} /></div></div>
//         )}
//         <Modal setIsOpen={setIsMessageModalOpen} isOpen={isMessageModalOpen} title="Send Confirmation?" maxWidth="md">
//              <div className="p-5">
//                 <p className="text-gray-700 mb-4 text-center">Fee submitted for <span className="font-semibold">{responseData?.student?.studentName || unifiedReceiptData?.students?.map(s => s.studentName).join(", ") || "student(s)"}</span>.<br />Receipt No: <span className="font-semibold">{responseData?.feeReceiptNumber || unifiedReceiptData?.unifiedReceiptNumber || "N/A"}</span><br />Send SMS to parent?<br />(<span className="font-mono text-sm">{responseData?.parent?.fatherPhone || unifiedReceiptData?.parent?.fatherPhone || "N/A"}</span>)</p>
//                 <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//                     <Button type="button" name="Yes, Send SMS & View Receipt" onClick={() => handleCloseMessageModal(true)} className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2" />
//                     <Button type="button" name="No, Just View Receipt" onClick={() => handleCloseMessageModal(false)} className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1" />
//                 </div>
//             </div>
//         </Modal>
//         <Modal setIsOpen={setPdfModalOpen} isOpen={pdfModalOpen} title="Fee Receipt Preview" maxWidth="lg">
//             <div className="p-1">{!isPreviewReady || !receiptData ? <p className="text-center p-10">Loading preview...</p> : <FeeRecipt modalData={receiptData} handleCloseModal={() => handleClosePdfModal()} handlePrint={() => handleClosePdfModal("print")} handleDownload={() => handleClosePdfModal("download")} isPreviewReady={isPreviewReady} isUnified={false} />}</div>
//         </Modal>
//         <Modal setIsOpen={setUnifiedReceiptModalOpen} isOpen={unifiedReceiptModalOpen} title="Unified Fee Receipt Preview" maxWidth="lg">
//              <div className="p-1">{!isPreviewReady || !receiptData ? <p className="text-center p-10">Loading preview...</p> : <FeeRecipt modalData={receiptData} handleCloseModal={() => handleCloseUnifiedReceiptModal()} handlePrint={() => handleCloseUnifiedReceiptModal("print")} handleDownload={() => handleCloseUnifiedReceiptModal("download")} isPreviewReady={isPreviewReady} isUnified={true} />}</div>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default SibilingFees;





import axios from "axios";
import React, { useEffect, useState, useCallback, useMemo } from "react"; // Added useMemo
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
import { FeeResponse, FeeResponseSibling } from "../../Dynamic/utils/Message";
import generatePdf from "../../Dynamic/utils/pdfGenerator";
import FeeRecipt from "./FeeRecipt";
import DynamicMultiSelect from "../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import DatePicker from "../../Dynamic/DatePicker/DatePicker";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";

const ExemptionToggle = ({ isExempt, onChange, studentName }) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          checked={isExempt}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only peer"
        />
        <div
          className={`relative w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${
            isExempt ? "bg-light-blue-800" : "bg-gray-300"
          } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-light-blue-500`}
        >
          <div
            className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform ${
              isExempt ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </div>
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[150px] text-left">
        {isExempt ? `Exempt` : `Exempt`}
      </span>
    </label>
  );
};

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
      console.error(`Failed to fetch additional fees for class ${className}:`, response?.data?.message);
      toast.error(`Failed to fetch additional fees for class ${className}.`);
      return [];
    }
  } catch (error) {
    console.error(`Error fetching additional fees for class ${className}:`, error);
    toast.error(`Error fetching additional fees for class ${className}: ${error.message}`);
    return [];
  }
};

// Helper function to build the paymentDetails object conditionally
const buildPaymentDetailsObject = (details, isSinglePaymentContext = false) => {
  const paymentDetails = {};

  paymentDetails.pastDuesPaid = details.pastDuesPaid || 0;
  paymentDetails.lateFinesPaid = details.lateFinesPaid || 0;
  if (details.totalAmount !== undefined) {
    paymentDetails.totalAmount = parseFloat(details.totalAmount);
  }

  if (details.regularFees && details.regularFees.length > 0) {
    paymentDetails.regularFees = details.regularFees;
  }
  if (details.additionalFees && details.additionalFees.length > 0) {
    paymentDetails.additionalFees = details.additionalFees;
  }

  if (details.concession && parseFloat(details.concession) !== 0) {
    paymentDetails.concession = parseFloat(details.concession);
  }
  if (details.exemption && parseFloat(details.exemption) !== 0) {
    paymentDetails.exemption = parseFloat(details.exemption);
  }

  if (isSinglePaymentContext) {
    if (details.date) paymentDetails.date = details.date;
    if (details.paymentMode) paymentDetails.paymentMode = details.paymentMode;
    if (details.transactionId) paymentDetails.transactionId = details.transactionId;
    if (details.chequeNumber) paymentDetails.chequeNumber = details.chequeNumber;
    if (details.remark && details.remark.trim() !== "") paymentDetails.remark = details.remark.trim();
  }
  return paymentDetails;
};


const SibilingFees = () => {
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

  const [isUnifiedMode, setIsUnifiedMode] = useState(false);
  const [unifiedPaymentData, setUnifiedPaymentData] = useState({
    totalAmount: "", concession: "", date: moment().format("YYYY-MM-DD"),
    paymentMode: "Cash", transactionId: "", chequeBookNo: "", remarks: "",
  });

  const allMonths = [
    "April", "May", "June", "July", "August", "September",
    "October", "November", "December", "January", "February", "March",
  ];

  const getAllStudent = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents(session);
      setAllStudent(response?.students?.data || []);
    } catch (error) {
      toast.error("Failed to fetch student list.");
      setAllStudent([]);
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader, session]);

  useEffect(() => {
    getAllStudent();
  }, [getAllStudent, triggerRefresh]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase();
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredStudents([]);
    } else {
      const filtered = allStudent.filter(
        (student) => student.studentName && student.studentName.toLowerCase().includes(searchValue)
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
        (student) => student.admissionNumber && student.admissionNumber.toLowerCase().includes(searchValue)
      );
      setFilteredStudents(filtered);
    }
    setSearchTerm("");
  };

  const fetchStudentFeeInfo = async (studentId) => {
    try {
      const response = await axios.get(
        `${ process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com" }/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
        { withCredentials: true, headers: { Authorization: `Bearer ${authToken}` } }
      );
      if (response.data.success) return response.data.data;
      else {
        toast.error(`Fee info fetch failed for student ID ${studentId}: ${response.data.message || "Unknown error"}`);
        return null;
      }
    } catch (error) {
      toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
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
    setIsUnifiedMode(false);
    setUnifiedPaymentData({
      totalAmount: "", concession: "", date: moment().format("YYYY-MM-DD"),
      paymentMode: "Cash", transactionId: "", chequeBookNo: "", remarks: "",
    });
  };
  
  const handleStudentClick = async (parentId) => {
    setIsLoader(true);
    resetState(); 
    try {
      const parentResponse = await parentandchildwithID(parentId);
      if (!parentResponse?.success) {
        toast.error(parentResponse?.message || "Failed to fetch parent/child data.");
        setIsLoader(false); return;
      }
      const children = parentResponse?.children || [];
      if (children.length === 0) {
        toast.info("No children found for this parent.");
        setIsLoader(false); return;
      }
      setParentData(children);
      const promises = children.map((child) =>
        Promise.all([ fetchStudentFeeInfo(child.studentId), fetchAdditionalFeesForClass(child.class, authToken) ])
      );
      const results = await Promise.all(promises);
      const initialFormData = [];
      results.forEach(([feeInfo, availableAdditionalFees], index) => {
        const child = children[index];
        if (!feeInfo) {
          initialFormData.push({ admissionNumber: child.admissionNumber, studentId: child.studentId, studentName: child.studentName, className: child.class, error: true });
          return;
        }
        const regularFeeAmount = feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
        const additionalFeesStructure = feeInfo.feeStructure?.additionalFees || [];
        const monthlyStatus = feeInfo.monthlyStatus || [];
        const feeHistory = feeInfo.feeStatus?.feeHistory || [];
        const monthlyDues = feeInfo.feeStatus?.monthlyDues || { regularDues: [], additionalDues: [] };
        const oneTimeAdditionalDues = feeInfo.oneTimeAdditionalDues || [];
        const regularFees = allMonths.map((month) => {
          const monthData = monthlyStatus.find((m) => m.month === month);
          const dueData = monthlyDues.regularDues.find((d) => d.month === month);
          const due = dueData ? dueData.dueAmount : (monthData?.regularFee?.status === "Paid" ? 0 : regularFeeAmount);
          const status = dueData ? dueData.status : (monthData?.regularFee?.status || "Unpaid");
          return { month, paidAmount: dueData?.paidAmount || monthData?.regularFee?.paid || "", dueAmount: due, totalAmount: regularFeeAmount, status, label: `${month} (Due: ₹${due.toFixed(2)})` };
        });
        const preSelectedMonths = [];
        monthlyStatus.forEach((monthData) => {
          if (monthData.regularFee.due > 0 && monthData.regularFee.status !== "Paid") {
            const dueData = monthlyDues.regularDues.find((d) => d.month === monthData.month);
            if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
              const originalFee = regularFees.find((rf) => rf.month === monthData.month);
              if (originalFee) preSelectedMonths.push({ value: monthData.month, label: originalFee.label, due: dueData.dueAmount });
            }
          }
        });
        const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
          name: fee.name, type: fee.feeType, frequency: fee.frequency, amount: fee.amount,
          months: allMonths.map((month) => {
            const monthData = monthlyStatus.find((m) => m.month === month);
            const addFee = monthData?.additionalFees?.find((af) => af.name === fee.name);
            const dueData = monthlyDues.additionalDues.find((d) => d.name === fee.name && d.month === month);
            const due = dueData ? dueData.dueAmount : (addFee?.status === "Paid" ? 0 : fee.amount);
            const status = dueData ? dueData.status : (addFee?.status || "Unpaid");
            return { month, paidAmount: dueData?.paidAmount || addFee?.paid || "", dueAmount: due, totalAmount: fee.amount, status };
          }),
        }));
        const preSelectedAdditionalFees = [];
        monthlyStatus.forEach((monthData) => {
          monthData.additionalFees?.forEach((fee) => {
            if (fee.due > 0 && fee.status !== "Paid" && fee.frequency === "monthly") {
              const dueData = monthlyDues.additionalDues.find((d) => d.name === fee.name && d.month === monthData.month);
              if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
                const feeStructure = additionalFeesStructure.find((fs) => fs.name === fee.name && fs.frequency === "monthly");
                if (feeStructure) {
                  const availableFeeOption = availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
                  if (availableFeeOption) {
                    const isMonthPreSelected = preSelectedMonths.some((m) => m.value === monthData.month);
                    if (isMonthPreSelected) {
                      const existingFee = preSelectedAdditionalFees.find((pf) => pf.name === fee.name && pf.frequency === "monthly");
                      if (existingFee) {
                        if (!existingFee.dueMonths.includes(monthData.month)) { existingFee.dueMonths.push(monthData.month); existingFee.amount += dueData.dueAmount; }
                      } else preSelectedAdditionalFees.push({ id: availableFeeOption.id, name: availableFeeOption.name, amount: dueData.dueAmount, type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths: [monthData.month] });
                    }
                  }
                }
              }
            }
          });
        });
        const preSelectedOneTimeFees = [];
        oneTimeAdditionalDues.forEach((fee) => {
          if (fee.dueAmount > 0 && fee.status !== "Paid") {
            const feeStructure = additionalFeesStructure.find((fs) => fs.name === fee.name && fs.frequency === "one-time");
            if (feeStructure) preSelectedOneTimeFees.push({ name: fee.name, dueAmount: fee.dueAmount, frequency: feeStructure.frequency });
          }
        });
        const oneTimeFeeOptions = additionalFeesStructure
          .filter((fee) => fee.feeType === "One Time" && fee.frequency === "one-time")
          .filter((fee) => {
            const isPaidInHistory = feeHistory.some((h) => h.additionalFees.some((af) => af.name === fee.name && af.status === "Paid" && af.dueAmount === 0));
            const isPaidInDues = monthlyDues.additionalDues.some((d) => d.name === fee.name && d.status === "Paid" && d.dueAmount === 0);
            const isExemptInDues = monthlyDues.additionalDues.some((d) => d.name === fee.name && d.status === "Exempt" && d.dueAmount === 0);
            return !isPaidInHistory && !isPaidInDues && !isExemptInDues;
          })
          .map((fee) => {
            const dueFee = oneTimeAdditionalDues.find((d) => d.name === fee.name);
            const dueAmount = dueFee ? dueFee.dueAmount : fee.amount;
            return { label: `${fee.name} (Due: ₹${dueAmount.toFixed(2)})`, name: fee.name, code: fee.name, dueAmount, type: fee.feeType, frequency: fee.frequency };
          });
        initialFormData.push({
          admissionNumber: child.admissionNumber, studentId: child.studentId, studentName: child.studentName, className: child.class, classFee: regularFeeAmount,
          totalAmount: "", selectedMonths: preSelectedMonths, selectedAdditionalFees: preSelectedAdditionalFees, selectedOneTimeFees: preSelectedOneTimeFees,
          paymentMode: "Cash", transactionId: "", chequeBookNo: "", lateFine: feeInfo.feeStatus?.totalLateFines || 0, concession: "", exemption: "", isExempt: false,
          date: moment().format("YYYY-MM-DD"), remarks: "", monthlyDues, additionalFeeDetails, pastDues: feeInfo.feeStatus?.pastDues || 0,
          totalDues: feeInfo.feeStatus?.dues || 0, regularFees, availableAdditionalFees: availableAdditionalFees || [], oneTimeFeeOptions, feeInfo, error: false,
        });
      });
      setFormData(initialFormData);
      if (children.length > 0) {
        const allIndices = children.map((_, i) => i);
        const allFormsVisible = children.map(() => true);
        setSelectedChildrenIndices(allIndices); 
        setShowFormFlags(allFormsVisible);     
        if (initialFormData.length > 0 && initialFormData[0] && !initialFormData[0].error) {
            setChildFeeHistory(initialFormData[0]?.feeInfo || null);
        }
        if (children.length > 1) {
            setIsUnifiedMode(true);
            const updatedInitialFormData = initialFormData.map(fd => ({...fd, concession: "" }));
            setFormData(updatedInitialFormData);
            const firstChildData = updatedInitialFormData.length > 0 && updatedInitialFormData[0] && !updatedInitialFormData[0].error ? updatedInitialFormData[0] : {};
            setUnifiedPaymentData({
                totalAmount: "", concession: "", date: firstChildData.date || moment().format("YYYY-MM-DD"),
                paymentMode: firstChildData.paymentMode || "Cash", transactionId: firstChildData.transactionId || "",
                chequeBookNo: firstChildData.chequeBookNo || "", remarks: firstChildData.remarks || "",
            });
        } else setIsUnifiedMode(false);
      }
      setShowChildForms(true);
    } catch (error) {
      toast.error("An error occurred while fetching student data.");
    } finally {
      setIsLoader(false);
    }
  };

  const handleChildSelection = (index) => {
    if (!formData || index < 0 || index >= formData.length) { toast.error("An internal error occurred."); return; }
    const currentChildData = formData[index];
    if (!currentChildData || currentChildData.error) { toast.warn(`Cannot select ${parentData[index]?.studentName || "this student"}.`); return; }
    const isCurrentlySelected = selectedChildrenIndices.includes(index);
    let updatedSelectedChildren;
    let updatedShowFormFlags = [...showFormFlags];
    if (isCurrentlySelected) {
      updatedSelectedChildren = selectedChildrenIndices.filter((i) => i !== index);
      updatedShowFormFlags[index] = false;
    } else {
      updatedSelectedChildren = [...selectedChildrenIndices, index];
      updatedShowFormFlags[index] = true;
    }
    updatedSelectedChildren.sort((a, b) => a - b);
    setSelectedChildrenIndices(updatedSelectedChildren);
    setShowFormFlags(updatedShowFormFlags);
    const newIsUnifiedMode = updatedSelectedChildren.length > 1;
    if (isUnifiedMode !== newIsUnifiedMode) {
        setIsUnifiedMode(newIsUnifiedMode);
        if (newIsUnifiedMode) {
            const clearedFormData = formData.map(fd => ({...fd, concession: ""}));
            setFormData(clearedFormData);
            if (updatedSelectedChildren.length > 0) {
                const firstSelectedChildIndex = updatedSelectedChildren[0];
                const firstChildData = clearedFormData[firstSelectedChildIndex];
                if (firstChildData && !firstChildData.error) {
                     setUnifiedPaymentData(prev => ({ ...prev, date: firstChildData.date || moment().format("YYYY-MM-DD"),
                        paymentMode: firstChildData.paymentMode || "Cash", transactionId: firstChildData.transactionId || "",
                        chequeBookNo: firstChildData.chequeBookNo || "", remarks: firstChildData.remarks || "" }));
                }
            }
        } else setUnifiedPaymentData(prev => ({...prev, concession: ""}));
    }
    if (updatedSelectedChildren.length > 0) setChildFeeHistory(formData[updatedSelectedChildren[0]]?.feeInfo || null);
    else setChildFeeHistory(null);
  };
  
  const handleInputChange = (index, field, value) => {
    const updatedFormData = [...formData];
    if (updatedFormData[index]) {
      updatedFormData[index] = { ...updatedFormData[index], [field]: value };
      if (field === "paymentMode") {
        if (value !== "Online" && value !== "Card") updatedFormData[index].transactionId = "";
        if (value !== "Cheque") updatedFormData[index].chequeBookNo = "";
      }
      if (field === "isExempt") {
        if (value) { 
          const data = updatedFormData[index]; let total = 0;
          total += parseFloat(data.pastDues) || 0; total += parseFloat(data.lateFine) || 0;
          total += data.selectedMonths.reduce((sum, monthState) => sum + (monthState?.due || 0), 0);
          total += data.selectedAdditionalFees.reduce((sum, fee) => {
            if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
              return sum + fee.dueMonths.reduce((monthSum, month) => {
                const feeDetail = data.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
                if (feeDetail) { const monthData = feeDetail.months.find((m) => m.month === month); return monthSum + (monthData?.dueAmount || 0); }
                return monthSum;
              }, 0);
            } else if (fee.frequency === "one-time") {
              const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find((d) => d.name === fee.name);
              return sum + (oneTimeDue ? oneTimeDue.dueAmount : parseFloat(fee.amount) || 0);
            } return sum;
          }, 0);
          total += data.selectedOneTimeFees.reduce((sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0), 0);
          const selectedMonthNames = data.selectedMonths.map((m) => m.value);
          const selectedAdditionalFeeDues = data.selectedAdditionalFees.filter((fee) => fee.frequency === "monthly").flatMap((fee) => fee.dueMonths.map((month) => ({ name: fee.name, month })));
          const remainingDues = data.monthlyDues.additionalDues.filter((due) => {
            const feeStructure = data.feeInfo?.feeStructure?.additionalFees?.find((fs) => fs.name === due.name);
            return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some((s) => s.name === due.name && s.month === due.month) && feeStructure?.frequency === "monthly");
          }).reduce((sum, due) => sum + due.dueAmount, 0);
          total += remainingDues; total -= parseFloat(data.concession) || 0; 
          updatedFormData[index].exemption = Math.max(0, total).toFixed(2);
          updatedFormData[index].totalAmount = "0"; 
        } else updatedFormData[index].exemption = "";
      }
      setFormData(updatedFormData);
    }
  };

  const handleUnifiedInputChange = (field, value) => {
    setUnifiedPaymentData(prev => {
        const newState = { ...prev, [field]: value };
        if (field === "paymentMode") {
            if (value !== "Online" && value !== "Card") newState.transactionId = "";
            if (value !== "Cheque") newState.chequeBookNo = "";
        }
        return newState;
    });
  };

  const handleMonthMultiSelectChange = (index, name, selectedOptions) => {
    const selectedOptionsData = selectedOptions || [];
    let updatedFormData = [...formData]; 
    if (!updatedFormData[index]) return;
    const currentChildData = updatedFormData[index];
    const selectedMonthNames = selectedOptionsData.map((opt) => opt.code);
    if (selectedMonthNames.length > 1) {
      const indicesInAllMonths = selectedMonthNames.map((month) => allMonths.indexOf(month)).sort((a, b) => a - b);
      let isSequential = true;
      for (let i = 1; i < indicesInAllMonths.length; i++) { if (indicesInAllMonths[i] !== indicesInAllMonths[i - 1] + 1) { isSequential = false; break; } }
      if (!isSequential) { toast.warn("Please select months in a continuous sequence."); return; }
    }
    const newSelectedMonths = selectedOptionsData.map((opt) => {
      const originalFee = currentChildData.regularFees.find((fee) => fee.month === opt.code);
      if (!originalFee) return null;
      return { value: originalFee.month, label: originalFee.label, due: originalFee.dueAmount };
    }).filter(Boolean);
    updatedFormData[index].selectedMonths = newSelectedMonths;
    const newSelectedAdditionalFees = [];
    const structuredMonthlyAddFees = currentChildData.feeInfo?.feeStructure?.additionalFees?.filter((fee) => fee.frequency === "monthly") || [];
    structuredMonthlyAddFees.forEach((fee) => {
      const availableFeeOption = currentChildData.availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
      if (availableFeeOption) {
        const feeDetail = currentChildData.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
        if (!feeDetail) return;
        const dueMonths = newSelectedMonths.map((m) => {
          const monthData = feeDetail.months.find((fm) => fm.month === m.value);
          if (monthData && monthData.dueAmount > 0) return monthData.month;
          return null;
        }).filter(Boolean);
        if (dueMonths.length > 0) {
          const totalAmount = dueMonths.reduce((sum, month) => { const mData = feeDetail.months.find((fm) => fm.month === month); return sum + (mData?.dueAmount || 0); }, 0);
          newSelectedAdditionalFees.push({ id: availableFeeOption.id, name: availableFeeOption.name, amount: totalAmount, type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths });
        }
      }
    });
    const existingOneTimeFees = currentChildData.selectedAdditionalFees.filter((fee) => fee.frequency === "one-time");
    updatedFormData[index].selectedAdditionalFees = [...newSelectedAdditionalFees, ...existingOneTimeFees];
    if (isUnifiedMode && selectedChildrenIndices.length > 1) {
        selectedChildrenIndices.forEach(siblingIndex => {
            if (siblingIndex !== index && updatedFormData[siblingIndex] && !updatedFormData[siblingIndex].error) {
                const siblingCurrentData = updatedFormData[siblingIndex];
                const synchronizedSiblingMonths = newSelectedMonths.map(masterMonth => {
                    const siblingMonthFeeData = siblingCurrentData.regularFees.find(rf => rf.month === masterMonth.value);
                    if (siblingMonthFeeData && siblingMonthFeeData.dueAmount > 0) return { value: siblingMonthFeeData.month, label: siblingMonthFeeData.label, due: siblingMonthFeeData.dueAmount };
                    return null;
                }).filter(Boolean);
                updatedFormData[siblingIndex].selectedMonths = synchronizedSiblingMonths;
                const newSelectedAdditionalFeesSibling = [];
                const structuredMonthlyAddFeesSibling = siblingCurrentData.feeInfo?.feeStructure?.additionalFees?.filter((f) => f.frequency === "monthly") || [];
                structuredMonthlyAddFeesSibling.forEach((fee) => {
                    const availableFeeOption = siblingCurrentData.availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
                    if (availableFeeOption) {
                        const feeDetail = siblingCurrentData.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
                        if (!feeDetail) return;
                        const dueMonths = synchronizedSiblingMonths.map((m) => {
                            const monthData = feeDetail.months.find((fm) => fm.month === m.value);
                            if (monthData && monthData.dueAmount > 0) return monthData.month;
                            return null;
                        }).filter(Boolean);
                        if (dueMonths.length > 0) {
                            const totalAmount = dueMonths.reduce((sum, month) => { const mData = feeDetail.months.find((fm) => fm.month === month); return sum + (mData?.dueAmount || 0); }, 0);
                            newSelectedAdditionalFeesSibling.push({ id: availableFeeOption.id, name: availableFeeOption.name, amount: totalAmount, type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths });
                        }
                    }
                });
                const existingOneTimeFeesSibling = siblingCurrentData.selectedAdditionalFees.filter((f) => f.frequency === "one-time");
                updatedFormData[siblingIndex].selectedAdditionalFees = [...newSelectedAdditionalFeesSibling, ...existingOneTimeFeesSibling];
            }
        });
    }
    setFormData(updatedFormData);
  };

  const handleDynamicMultiSelectChange = (index, field, selectedOptions) => {
    const updatedFormData = [...formData];
    if (!updatedFormData[index]) return;
    const currentChildData = updatedFormData[index];
    if (field === "selectedAdditionalFees") {
      const newSelectedAdditionalFees = (selectedOptions || []).map((opt) => {
        const originalFee = currentChildData.availableAdditionalFees.find((fee) => fee.id === opt.code && fee.frequency === "monthly");
        if (originalFee) return { id: originalFee.id, name: originalFee.name, amount: originalFee.value, type: originalFee.type, frequency: originalFee.frequency, dueMonths: originalFee.frequency === "monthly" ? currentChildData.selectedMonths.map((m) => m.value) : [] };
        return null;
      }).filter(Boolean);
      const existingFees = currentChildData.selectedAdditionalFees.filter((fee) => fee.frequency === "one-time");
      updatedFormData[index].selectedAdditionalFees = [...newSelectedAdditionalFees, ...existingFees];
    } else if (field === "selectedOneTimeFees") {
      const newSelectedOneTimeFees = (selectedOptions || []).map((opt) => {
        const originalFee = currentChildData.oneTimeFeeOptions.find((fee) => fee.code === opt.code);
        if (originalFee) return { name: originalFee.name, dueAmount: originalFee.dueAmount, frequency: originalFee.frequency };
        return null;
      }).filter(Boolean);
      updatedFormData[index].selectedOneTimeFees = newSelectedOneTimeFees;
    }
    setFormData(updatedFormData);
  };

  const calculateNetPayableAmount = useCallback((index) => {
    const data = formData[index];
    if (!data || data.error) return 0;
    let total = 0;
    total += parseFloat(data.pastDues) || 0; total += parseFloat(data.lateFine) || 0;
    total += data.selectedMonths.reduce((sum, monthState) => sum + (monthState?.due || 0), 0);
    total += data.selectedAdditionalFees.reduce((sum, fee) => {
      if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
        return sum + fee.dueMonths.reduce((monthSum, month) => {
          const feeDetail = data.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
          if (feeDetail) { const monthData = feeDetail.months.find((m) => m.month === month); return monthSum + (monthData?.dueAmount || 0); }
          return monthSum;
        }, 0);
      } else if (fee.frequency === "one-time") {
        const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find((d) => d.name === fee.name);
        return sum + (oneTimeDue ? oneTimeDue.dueAmount : parseFloat(fee.amount) || 0);
      } return sum;
    }, 0);
    total += data.selectedOneTimeFees.reduce((sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0), 0);
    const selectedMonthNames = data.selectedMonths.map((m) => m.value);
    const selectedAdditionalFeeDues = data.selectedAdditionalFees.filter((fee) => fee.frequency === "monthly").flatMap((fee) => fee.dueMonths.map((month) => ({ name: fee.name, month })));
    const remainingDues = data.monthlyDues.additionalDues.filter((due) => {
      const feeStructure = data.feeInfo?.feeStructure?.additionalFees?.find((fs) => fs.name === due.name);
      return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some((s) => s.name === due.name && s.month === due.month) && feeStructure?.frequency === "monthly");
    }).reduce((sum, due) => sum + due.dueAmount, 0);
    total += remainingDues;
    if (!isUnifiedMode) total -= parseFloat(data.concession) || 0;
    total -= parseFloat(data.exemption) || 0;
    return Math.max(0, total);
  }, [formData, isUnifiedMode]); 

  const calculateAutoDistribution = useCallback((index, amountPaidOverride = null) => {
    const data = formData[index];
    if (!data || data.error) return { remainingAfterDistribution: 0, remainingDues: 0 };
    const netPayable = calculateNetPayableAmount(index); 
    const totalAmountPaid = amountPaidOverride !== null ? amountPaidOverride : (parseFloat(data.totalAmount) || 0);
    const remainingDues = Math.max(0, netPayable - totalAmountPaid);
    const remainingAfterDistribution = Math.max(0, totalAmountPaid - netPayable);
    return { remainingAfterDistribution, remainingDues };
  }, [formData, calculateNetPayableAmount, isUnifiedMode]); // Removed isUnifiedMode as it's already in calculateNetPayableAmount

  // Unified calculations
  const overallNetPayableBeforeUnifiedActions = useMemo(() => {
    if (!isUnifiedMode || selectedChildrenIndices.length < 2) return 0;
    return selectedChildrenIndices.reduce((sum, index) => {
        return sum + calculateNetPayableAmount(index);
    }, 0);
  }, [isUnifiedMode, selectedChildrenIndices, calculateNetPayableAmount]);

  const overallRemainingDuesAfterUnifiedActions = useMemo(() => {
      if (!isUnifiedMode || selectedChildrenIndices.length < 2) return 0;
      const netPayable = overallNetPayableBeforeUnifiedActions;
      const unifiedAmountPaid = parseFloat(unifiedPaymentData.totalAmount) || 0;
      const unifiedConcession = parseFloat(unifiedPaymentData.concession) || 0;
      return Math.max(0, netPayable - unifiedAmountPaid - unifiedConcession);
  }, [overallNetPayableBeforeUnifiedActions, unifiedPaymentData.totalAmount, unifiedPaymentData.concession, isUnifiedMode, selectedChildrenIndices.length]);

  const overallExcessOrAdvanceAfterUnifiedActions = useMemo(() => {
      if (!isUnifiedMode || selectedChildrenIndices.length < 2) return 0;
      const netPayable = overallNetPayableBeforeUnifiedActions;
      const unifiedAmountPaid = parseFloat(unifiedPaymentData.totalAmount) || 0;
      const unifiedConcession = parseFloat(unifiedPaymentData.concession) || 0;
      const amountToCover = Math.max(0, netPayable - unifiedConcession);
      return Math.max(0, unifiedAmountPaid - amountToCover);
  }, [overallNetPayableBeforeUnifiedActions, unifiedPaymentData.totalAmount, unifiedPaymentData.concession, isUnifiedMode, selectedChildrenIndices.length]);


  const fetchReceiptData = async (receiptNumber, isUnifiedRec = false) => {
    debugger
    setIsPreviewReady(false); setIsLoader(true);
    try {
      const url =`${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`;
      // const url = isUnifiedRec ? `${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/unified-receipts?unifiedReceiptNumber=${receiptNumber}`
      //                         : `${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${authToken}` } });
      if (response.data.success) { setReceiptData(response.data); setIsPreviewReady(true); return response.data; }
      else { toast.error(`Failed to fetch receipt data: ${response.data.message || "Unknown error"}`); return null; }
    } catch (error) {
      if (isUnifiedRec && error.response?.status === 404) {
        try {
          const fallbackResponse = await axios.get(`${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`, { headers: { Authorization: `Bearer ${authToken}` } });
          if (fallbackResponse.data.success) { setReceiptData(fallbackResponse.data); setIsPreviewReady(true); return fallbackResponse.data; }
          else { toast.error(`Fallback receipt fetch failed: ${fallbackResponse.data.message || "Unknown error"}`); return null; }
        } catch (fallbackError) { toast.error("Error fetching receipt data: " + fallbackError.message); return null; }
      } else { toast.error("Error fetching receipt data: " + error.message); return null; }
    } finally { setIsLoader(false); }
  };

  const validateFormData = (childFormData, child, isUnifiedValidation = false) => {
    if (!childFormData || childFormData.error) { toast.error(`Cannot submit for ${child?.studentName || "this student"} due to missing data.`); return false; }
    if (childFormData.isExempt) {
      const tempIndex = formData.findIndex(fd => fd.studentId === child.studentId);
      const netPayableForExemption = calculateNetPayableAmount(tempIndex); 
      childFormData.exemption = netPayableForExemption.toFixed(2);
    } else if (!isUnifiedValidation) { 
      const totalAmount = parseFloat(childFormData.totalAmount) || 0;
      if (totalAmount <= 0) { toast.warn(`Please enter a valid amount (> 0) to pay for ${child.studentName}.`); return false; }
    }
    const paymentDataSource = isUnifiedValidation ? unifiedPaymentData : childFormData;
    if (!paymentDataSource.paymentMode) { toast.error(`Payment mode is required for ${child.studentName}.`); return false; }
    if ((paymentDataSource.paymentMode === "Online" || paymentDataSource.paymentMode === "Card") && !paymentDataSource.transactionId) { toast.error(`Transaction ID is required for Online/Card payment for ${child.studentName}.`); return false; }
    if (paymentDataSource.paymentMode === "Cheque" && !paymentDataSource.chequeBookNo) { toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}.`); return false; }
    if (!paymentDataSource.date || !moment(paymentDataSource.date, "YYYY-MM-DD", true).isValid()) { toast.error(`Please select a valid payment date for ${child.studentName}.`); return false; }
    const concession = isUnifiedValidation ? 0 : (parseFloat(childFormData.concession) || 0); 
    const exemption = parseFloat(childFormData.exemption) || 0;
    if (concession < 0) { toast.warn(`Concession amount cannot be negative for ${child.studentName}.`); return false; }
    if (exemption < 0) { toast.warn(`Exemption amount cannot be negative for ${child.studentName}.`); return false; }
    if (!isUnifiedValidation && !childFormData.isExempt && parseFloat(childFormData.totalAmount) > 0 && childFormData.selectedMonths.length === 0 && childFormData.selectedAdditionalFees.length === 0 && childFormData.selectedOneTimeFees.length === 0) {
        const tempIndex = formData.findIndex(fd => fd.studentId === child.studentId);
        const onlyPayingDuesAndFines = (parseFloat(formData[tempIndex].pastDues) || 0) + (parseFloat(formData[tempIndex].lateFine) || 0);
        // if (parseFloat(childFormData.totalAmount) > onlyPayingDuesAndFines) {
        //     toast.warn(`Amount paid for ${child.studentName} exceeds past dues/fines, but no specific month/fee selected. Select items or add remark for advance.`);
        //     return false;
        // }
    }
    return true;
  };

  const handleSubmit = async (e, childIndex) => {
    e.preventDefault(); e.stopPropagation();
    const childFormData = formData[childIndex];
    const child = parentData[childIndex];
    if (!validateFormData(childFormData, child, false)) return;
    setIsLoader(true);
    const selectedMonthNames = childFormData.selectedMonths.map((m) => m.value);
    const selectedOneTimeFeeNames = childFormData.selectedOneTimeFees.map(fee => fee.name);
    const monthlyFeesPayload = []; const oneTimeFeesPayload = [];
    childFormData.selectedAdditionalFees.forEach((fee) => {
      if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
        fee.dueMonths.forEach((monthName) => {
          const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(m => m.month === monthName);
          const isFeeDueForThisMonth = monthStatus?.additionalFees?.some(mf => mf.name === fee.name && mf.status !== "Paid");
          if (isFeeDueForThisMonth) monthlyFeesPayload.push({ name: fee.name, month: monthName });
        });
      }
    });
    const selectedAdditionalFeeDues = childFormData.selectedAdditionalFees.filter(fee => fee.frequency === "monthly").flatMap(fee => fee.dueMonths.map(month => ({ name: fee.name, month })));
    const remainingDues = childFormData.monthlyDues.additionalDues.filter(due => {
        const feeStructure = childFormData.feeInfo?.feeStructure?.additionalFees?.find(fs => fs.name === due.name);
        return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some(s => s.name === due.name && s.month === due.month) && feeStructure?.frequency === "monthly" && !selectedOneTimeFeeNames.includes(due.name));
      }).map(due => ({ name: due.name, month: due.month }));
    monthlyFeesPayload.push(...remainingDues);
    childFormData.selectedOneTimeFees.forEach((fee) => oneTimeFeesPayload.push({ name: fee.name }));
    const additionalFeesPayload = [...monthlyFeesPayload, ...oneTimeFeesPayload];
    let exemptionAmount = parseFloat(childFormData.exemption) || 0;
    if (childFormData.isExempt) exemptionAmount = calculateNetPayableAmount(childIndex);
    const rawPaymentDetails = {
      regularFees: childFormData.selectedMonths.map((ms) => ({ month: ms.value })), additionalFees: additionalFeesPayload,
      pastDuesPaid: 0, lateFinesPaid: 0, concession: parseFloat(childFormData.concession) || 0, exemption: exemptionAmount,
      totalAmount: childFormData.isExempt ? 0 : (parseFloat(childFormData.totalAmount) || 0),
      date: childFormData.date ? moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY") : moment(new Date()).format("DD-MM-YYYY"),
      paymentMode: childFormData.paymentMode, transactionId: childFormData.transactionId || undefined, 
      chequeNumber: childFormData.chequeBookNo || undefined, remark: childFormData.remarks || "",
    };
    const finalPaymentDetails = buildPaymentDetailsObject(rawPaymentDetails, true);
    const payload = { studentId: child.studentId, session, paymentDetails: finalPaymentDetails };
    console.log("Single Submission Payload:", JSON.stringify(payload, null, 2));
    try {
      const response = await feescreateFeeStatus(payload);
      if (response?.success) { toast.success(response?.message || `Fees submitted for ${child.studentName}!`); setResponseData(response?.data); setIsMessageModalOpen(true); }
      else toast.error(response?.message || `Fee submission failed for ${child.studentName}.`);
    } catch (error) { toast.error(`Error during submission for ${child.studentName}: ${error.response?.data?.message || error.message}`);
    } finally { setIsLoader(false); }
  };

  const handleUnifiedFeePayment = async () => {
    if (!isUnifiedMode || selectedChildrenIndices.length < 2) { toast.warn("Select at least two students."); return; }
    if (!unifiedPaymentData.paymentMode) { toast.error("Unified Payment mode is required."); return; }
    if ((unifiedPaymentData.paymentMode === "Online" || unifiedPaymentData.paymentMode === "Card") && !unifiedPaymentData.transactionId) { toast.error("Unified Transaction ID is required."); return; }
    if (unifiedPaymentData.paymentMode === "Cheque" && !unifiedPaymentData.chequeBookNo) { toast.error("Unified Cheque Number is required."); return; }
    if (!unifiedPaymentData.date || !moment(unifiedPaymentData.date, "YYYY-MM-DD", true).isValid()) { toast.error("Select a valid unified payment date."); return; }
    const unifiedTotalAmountPaidNum = parseFloat(unifiedPaymentData.totalAmount) || 0;
    const unifiedConcessionNum = parseFloat(unifiedPaymentData.concession) || 0;
    if (unifiedConcessionNum < 0) { toast.error("Unified concession cannot be negative."); return; }
    const anyExempt = selectedChildrenIndices.some(index => formData[index].isExempt);
    if (!anyExempt && unifiedTotalAmountPaidNum <= 0 && unifiedConcessionNum <= 0) { toast.warn("Enter total amount (>0) or concession for siblings."); return; }
    if (unifiedTotalAmountPaidNum < 0 && !anyExempt) { toast.warn("Enter total amount (>=0) for siblings."); return; }

    const studentsPaymentInfo = []; let overallValidationPassed = true;
    for (const index of selectedChildrenIndices) {
        const childFormData = formData[index]; const child = parentData[index];
        if (!validateFormData(childFormData, child, true)) { overallValidationPassed = false; break; }
        let netPayableForChild = calculateNetPayableAmount(index); 
        let exemptionAmountForPayload = parseFloat(childFormData.exemption) || 0;
        if (childFormData.isExempt) { exemptionAmountForPayload = netPayableForChild; netPayableForChild = 0; }
        studentsPaymentInfo.push({ index, studentId: child.studentId, childFormData, netPayableForDistribution: netPayableForChild, exemptionAmountForPayload, isExempt: childFormData.isExempt, allocatedAmount: 0 });
    }
    if (!overallValidationPassed) return;
    let amountToDistribute = unifiedTotalAmountPaidNum - unifiedConcessionNum;
    amountToDistribute = Math.max(0, amountToDistribute); 
    for (const studentInfo of studentsPaymentInfo) {
        if (studentInfo.isExempt || studentInfo.netPayableForDistribution <= 0) { studentInfo.allocatedAmount = 0; continue; }
        if (amountToDistribute <= 0) break; 
        const canAllocate = Math.min(studentInfo.netPayableForDistribution, amountToDistribute);
        studentInfo.allocatedAmount = canAllocate; amountToDistribute -= canAllocate;
    }
    const studentsApiPayload = [];
    for (const studentInfo of studentsPaymentInfo) {
      const { childFormData, studentId, allocatedAmount, exemptionAmountForPayload } = studentInfo;
      const additionalFeesPayloadForStudent = [];
      const selectedMonthNames = childFormData.selectedMonths.map(m => m.value); 
      const selectedOneTimeFeeNames = childFormData.selectedOneTimeFees.map(f => f.name);
      childFormData.selectedAdditionalFees.forEach((fee) => {
        if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
            fee.dueMonths.forEach((monthName) => {
                const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(m => m.month === monthName);
                const isFeeDue = monthStatus?.additionalFees?.some(mf => mf.name === fee.name && mf.status !== "Paid" && mf.status !== "Exempt");
                if (isFeeDue) additionalFeesPayloadForStudent.push({ name: fee.name, month: monthName });
            });
        }
      });
      const selectedAdditionalFeeDues = additionalFeesPayloadForStudent.map(f => ({ name: f.name, month: f.month }));
      const remainingMonthlyDues = childFormData.monthlyDues.additionalDues.filter(due => {
            const feeStructure = childFormData.feeInfo?.feeStructure?.additionalFees?.find(fs => fs.name === due.name);
            return (due.dueAmount > 0 && feeStructure?.frequency === "monthly" && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some(s => s.name === due.name && s.month === due.month) && !selectedOneTimeFeeNames.includes(due.name));
        }).map(due => ({ name: due.name, month: due.month }));
      additionalFeesPayloadForStudent.push(...remainingMonthlyDues);
      childFormData.selectedOneTimeFees.forEach((fee) => {
         const oneTimeDue = childFormData.feeInfo?.oneTimeAdditionalDues?.find(d => d.name === fee.name && d.status !== "Paid" && d.status !== "Exempt");
         if(oneTimeDue) additionalFeesPayloadForStudent.push({ name: fee.name });
      });
      const rawStudentPaymentDetails = { regularFees: childFormData.selectedMonths.map(ms => ({ month: ms.value })), additionalFees: additionalFeesPayloadForStudent, pastDuesPaid: 0, lateFinesPaid: 0, concession: 0, exemption: exemptionAmountForPayload, totalAmount: allocatedAmount };
      const finalStudentPaymentDetails = buildPaymentDetailsObject(rawStudentPaymentDetails, false);
      const hasRegFees = finalStudentPaymentDetails.regularFees && finalStudentPaymentDetails.regularFees.length > 0;
      const hasAddFees = finalStudentPaymentDetails.additionalFees && finalStudentPaymentDetails.additionalFees.length > 0;
      const hasExmp = finalStudentPaymentDetails.exemption && parseFloat(finalStudentPaymentDetails.exemption) !== 0;
      const hasTotalAmt = (finalStudentPaymentDetails.totalAmount !== undefined && parseFloat(finalStudentPaymentDetails.totalAmount) > 0) || (hasExmp && finalStudentPaymentDetails.totalAmount !== undefined && parseFloat(finalStudentPaymentDetails.totalAmount) === 0);
      if (hasRegFees || hasAddFees || hasExmp || hasTotalAmt) {
        studentsApiPayload.push({ studentId, paymentDetails: finalStudentPaymentDetails });
      }
    }
    if (studentsApiPayload.length === 0 && unifiedConcessionNum <= 0) { toast.info("No payment actions for selected students."); setIsLoader(false); return; }
    const finalUnifiedPaymentDetailsAPI = {
        paymentMode: unifiedPaymentData.paymentMode, transactionId: unifiedPaymentData.transactionId || undefined,
        chequeNumber: unifiedPaymentData.chequeBookNo || undefined, date: moment(unifiedPaymentData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
        remark: (unifiedPaymentData.remarks && unifiedPaymentData.remarks.trim() !== "") ? unifiedPaymentData.remarks.trim() : undefined,
        ...(unifiedConcessionNum > 0 && { globalConcession: unifiedConcessionNum })
    };
    const payload = { students: studentsApiPayload, session, unifiedPaymentDetails: finalUnifiedPaymentDetailsAPI };
    console.log("Unified Payload:", JSON.stringify(payload, null, 2));
    setIsLoader(true);
    try {
      const response = await feescreateUnifiedFeeStatus(payload);
      if (response.success) { toast.success(response.message || "Unified fees submitted!"); setUnifiedReceiptData(response.data); setIsMessageModalOpen(true); }
      else toast.error(response.message || "Unified fee submission failed.");
    } catch (error) { toast.error(`Error during unified submission: ${error.response?.data?.message || error.message}`);
    } finally { setIsLoader(false); }
  };
  
  const handleCloseMessageModal = async (sendMsg = false) => {
    setIsMessageModalOpen(false); let receiptNumber = null; let isUnifiedRec = false; 
    let dataForActions = null; let parentIdForRefresh = null;
    if (responseData) { receiptNumber = responseData.feeReceiptNumber; isUnifiedRec = false; dataForActions = responseData; parentIdForRefresh = responseData?.student?.parentId; }
    else if (unifiedReceiptData) { receiptNumber = unifiedReceiptData.unifiedReceiptNumber; isUnifiedRec = true; dataForActions = unifiedReceiptData; parentIdForRefresh = unifiedReceiptData?.parentId || (unifiedReceiptData?.students?.[0]?.parentId); }
    if (sendMsg && dataForActions) { if (isUnifiedRec) sendUnifiedMessage(dataForActions); else sendMessage(dataForActions); }
    const tempReceiptNumber = receiptNumber; const tempIsUnified = isUnifiedRec;
    const currentSearchTerm = searchTerm; const currentSearchTermAdm = searchTermbyadmissionNo; const currentFiltered = filteredStudents;
    resetState(); 
    setSearchTerm(currentSearchTerm); setSearchTermbyadmissionNo(currentSearchTermAdm); setFilteredStudents(currentFiltered);
    if (parentIdForRefresh) await handleStudentClick(parentIdForRefresh); 
    else setTriggerRefresh((prev) => !prev); 
    if (tempReceiptNumber) {
      const fetchedReceiptData = await fetchReceiptData(tempReceiptNumber, tempIsUnified);
      if (fetchedReceiptData) { if (tempIsUnified) setUnifiedReceiptModalOpen(true); else setPdfModalOpen(true); }
    }
  };

  const handleClosePdfModal = (action = null) => {
    if (action === "download" && receiptData) handleDownloadPdf(receiptData);
    else if (action === "print" && receiptData) handlePrintReceipt(receiptData);
    setPdfModalOpen(false); setReceiptData(null); setIsPreviewReady(false);
  };
  const handleCloseUnifiedReceiptModal = (action = null) => {
    if (action === "download" && receiptData) handleDownloadUnifiedPdf(receiptData);
    else if (action === "print" && receiptData) handlePrintUnifiedReceipt(receiptData);
    setUnifiedReceiptModalOpen(false); setReceiptData(null); setIsPreviewReady(false);
  };
  const handleDownloadPdf = (dataToUse) => {
    if (!dataToUse?.data) { toast.error("No receipt data for PDF."); return; }
    generatePdf(dataToUse.data, [], 0,0,0,0,0,0, `fee-receipt-${dataToUse.data?.feeReceiptNumber}.pdf`);
  };
  const handlePrintReceipt = (dataToUse) => {
    if (!dataToUse?.data) { toast.error("No receipt data to print."); return; }
    toast.info("Print placeholder: " + dataToUse.data?.feeReceiptNumber);
  };
  const sendMessage = (dataToUse) => {
    if (!dataToUse) { toast.error("No receipt data for SMS."); return; }
    try { FeeResponse(dataToUse); toast.info(`SMS called for ${dataToUse?.student?.studentName}`); }
    catch (error) { toast.error("Failed to initiate SMS."); }
  };
  const handleDownloadUnifiedPdf = (dataToUse) => {
    if (!dataToUse?.data) { toast.error("No unified receipt data for PDF."); return; }
    generatePdf(dataToUse.data, [], 0,0,0,0,0,0, `unified-receipt-${dataToUse.data?.unifiedReceiptNumber}.pdf`);
  };
  const handlePrintUnifiedReceipt = (dataToUse) => {
    if (!dataToUse?.data) { toast.error("No unified receipt data to print."); return; }
    toast.info("Print placeholder: " + dataToUse.data?.unifiedReceiptNumber);
  };
  const sendUnifiedMessage = (dataToUse) => {
    if (!dataToUse) { toast.error("No unified receipt data for SMS."); return; }
    try { FeeResponseSibling(dataToUse?.feeReceipts);
      const studentNames = dataToUse?.students?.map((s) => s.studentName).join(", ") || "selected students";
      toast.info(`SMS called for ${studentNames}`);
    } catch (error) { toast.error("Failed to initiate SMS."); }
  };

  return (
    <div className="">
      <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Create Fee" />
      <div className=" mx-auto">
        <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row gap-4 ">
          <ReactInput type="text" label="Search by Name" onChange={handleSearch} value={searchTerm} containerClassName="flex-1 min-w-[200px]" />
          <ReactInput type="text" label="Search by Adm. No" onChange={handleSearchbyAdmissionNo} value={searchTermbyadmissionNo} containerClassName="flex-1 min-w-[200px]" />
        </div>

        {filteredStudents.length > 0 && (
          <div className="relative">
            <div className="absolute z-30 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ">
              <table className="w-full border-collapse">
                <thead className="bg-gray-100 sticky top-0 z-20">
                  <tr>
                    <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Adm No.</th>
                    <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Student Name</th>
                    <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Class</th>
                    <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Parent Name</th>
                    <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Contact</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="cursor-pointer hover:bg-gray-100 border-b"
                      onClick={() => { handleStudentClick(student.parentId); setFilteredStudents([]); }}>
                      <td className="p-1 text-[13px]">{student.admissionNumber}</td>
                      <td className="p-1 font-semibold text-[13px]">{student.studentName}</td>
                      <td className="p-1 text-[13px]">{student.class}</td>
                      <td className="p-1 text-[13px]">{student.fatherName}</td>
                      <td className="p-1 text-[13px]">{student?.parentContact}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showChildForms && parentData.length > 0 && (
          <div className=" pt-2 border-t border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h5 className="text-sm font-semibold text-gray-800">Selected Student(s) Fee Payment</h5>
              {/* Main Pay for Siblings button if needed at top, currently handled within unified section */}
            </div>

            {isUnifiedMode && selectedChildrenIndices.length > 1 && (
                <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50 shadow">
                    <h3 className="text-lg font-semibold text-blue-700 mb-3">Unified Payment Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <ReactInput type="number" label="Total Amount to Pay (Unified)" value={unifiedPaymentData.totalAmount} onChange={(e) => handleUnifiedInputChange("totalAmount", e.target.value)} min="0" step="0.01" isRequired={true} />
                        <ReactInput type="number" label="Unified Concession" value={unifiedPaymentData.concession} onChange={(e) => handleUnifiedInputChange("concession", e.target.value)} min="0" step="0.01" />
                         <DatePicker className="custom-calendar" label="Payment Date (Unified)" name="unifiedDate" id="unifiedDate" value={unifiedPaymentData.date ? new Date(unifiedPaymentData.date) : new Date()} handleChange={(e) => handleUnifiedInputChange("date", e.target.value)} />
                        <ReactSelect name="unifiedPaymentMode" label="Payment Mode (Unified)" value={unifiedPaymentData.paymentMode} handleChange={(e) => handleUnifiedInputChange("paymentMode", e.target.value)}
                            dynamicOptions={[ { label: "Cash", value: "Cash" }, { label: "Online", value: "Online" }, { label: "Cheque", value: "Cheque" }, { label: "Card", value: "Card" } ]} />
                        {(unifiedPaymentData.paymentMode === "Online" || unifiedPaymentData.paymentMode === "Card") && ( <ReactInput type="text" label="Transaction ID (Unified)" value={unifiedPaymentData.transactionId} onChange={(e) => handleUnifiedInputChange("transactionId", e.target.value)} isRequired={true} /> )}
                        {unifiedPaymentData.paymentMode === "Cheque" && ( <ReactInput type="text" label="Cheque Number (Unified)" value={unifiedPaymentData.chequeBookNo} onChange={(e) => handleUnifiedInputChange("chequeBookNo", e.target.value)} isRequired={true} /> )}
                        
                        <div className="md:col-span-2 lg:col-span-1">
                           <label htmlFor="unifiedRemarks" className="block text-sm font-medium text-gray-700 mb-1">Remarks (Unified)</label>
                           <textarea id="unifiedRemarks" value={unifiedPaymentData.remarks} onChange={(e) => handleUnifiedInputChange("remarks", e.target.value)} className="block w-full border rounded-md shadow-sm py-2 px-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" rows="1" placeholder="Optional remarks..." />
                        </div>
                    </div>
                    {/* Unified Summary Display */}
                    <div className="mt-4 p-3 border rounded-md bg-blue-100 space-y-1">
                        <div className="text-md font-medium text-gray-800">
                            Total Siblings' Payable (before unified actions): 
                            <span className="font-bold text-blue-700 ml-2">₹ {overallNetPayableBeforeUnifiedActions.toFixed(2)}</span>
                        </div>
                        {(parseFloat(unifiedPaymentData.totalAmount) > 0 || parseFloat(unifiedPaymentData.concession) > 0 || overallNetPayableBeforeUnifiedActions > 0) && (
                            <>
                                {parseFloat(unifiedPaymentData.concession) > 0 && (
                                    <div className="text-sm font-medium text-green-600">
                                        Unified Concession Applied: 
                                        <span className="font-semibold ml-2">- ₹ {(parseFloat(unifiedPaymentData.concession) || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="text-sm font-medium text-gray-700">
                                    Net Payable After Concession: 
                                    <span className="font-semibold ml-2">₹ {Math.max(0, overallNetPayableBeforeUnifiedActions - (parseFloat(unifiedPaymentData.concession) || 0)).toFixed(2)}</span>
                                </div>

                                {parseFloat(unifiedPaymentData.totalAmount) > 0 && (
                                    <div className="text-sm font-medium text-gray-700">
                                        Amount Paying (Unified): 
                                        <span className="font-semibold ml-2">₹ {(parseFloat(unifiedPaymentData.totalAmount) || 0).toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="text-md font-medium text-red-700 mt-1">
                                    Total Remaining Dues (Siblings): 
                                    <span className="font-bold ml-2">₹ {overallRemainingDuesAfterUnifiedActions.toFixed(2)}</span>
                                </div>
                                {overallExcessOrAdvanceAfterUnifiedActions > 0 && (
                                    <div className="text-sm font-medium text-green-700">
                                        Unified Excess/Advance: 
                                        <span className="font-semibold ml-2">₹ {overallExcessOrAdvanceAfterUnifiedActions.toFixed(2)}</span>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="mt-4 flex justify-end">
                        <Button name="Pay for Siblings Together" onClick={handleUnifiedFeePayment} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm" />
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-2">
              {parentData.map((child, index) => {
                const currentFormData = formData[index];
                if (!currentFormData || currentFormData.error) {
                  return ( <div key={child._id || index} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md" role="alert"> <strong className="font-bold">Error:</strong> <span className="block sm:inline ml-2">Could not load fee data for {child.studentName || "this student"}.</span> </div> );
                }
                const isSelected = selectedChildrenIndices.includes(index);
                const showForm = showFormFlags[index];
                const monthOptions = currentFormData.regularFees.filter(f => f.dueAmount > 0).map(f => ({ name: f.label, code: f.month }));
                const selectedMonthValues = currentFormData.selectedMonths.map(ms => ({ name: ms.label, code: ms.value }));
                const additionalFeeOptions = currentFormData.availableAdditionalFees.filter(f => f.frequency === "monthly").map(item => ({ name: item.label, code: item.id }));
                const selectedAdditionalFeeValues = currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly").map(sf => { const opt = additionalFeeOptions.find(o => o.code === sf.id); return { name: opt ? opt.name : `${sf.name} (${sf.type}) - ₹${sf.amount}`, code: sf.id }; });
                const oneTimeFeeOptions = currentFormData.oneTimeFeeOptions.map(item => ({ name: item.label, code: item.code }));
                const selectedOneTimeFeeValues = currentFormData.selectedOneTimeFees.map(f => { const opt = oneTimeFeeOptions.find(o => o.code === f.name); return { name: opt ? opt.name : `${f.name} (Due: ₹${f.dueAmount.toFixed(2)})`, code: f.name }; });
                const showIndividualPaymentFields = !isUnifiedMode || selectedChildrenIndices.length <= 1;

                return (
                  <div key={child._id || index} className={`bg-white rounded-lg shadow-md border transition-all duration-300 ${isSelected ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200 hover:border-gray-300"} overflow-hidden`}>
                    <div className={`flex items-center px-4 py-1 border-b cursor-pointer`} onClick={() => handleChildSelection(index)}>
                      <input type="checkbox" id={`child-checkbox-${index}`} checked={isSelected} onChange={(e) => { e.stopPropagation(); handleChildSelection(index); }} className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" />
                      <label id={`child-label-${index}`} className="flex-grow cursor-pointer" htmlFor={`child-checkbox-${index}`}>
                        <div className="flex justify-between items-center">
                          <div><span className="text-base font-semibold text-blue-800">{child.studentName}</span> <span className="text-sm text-gray-600 ml-2">(Class: {child.class} / Adm#: {child.admissionNumber})</span></div>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-700"}`}>{isSelected ? "SELECTED" : "SELECT"}</span>
                        </div>
                        <div className="flex flex-wrap justify-start items-center gap-x-4 text-xs mt-1">
                          <span className="text-red-600 font-medium">Total Dues: ₹{currentFormData?.totalDues?.toFixed(2) || "0.00"}</span>
                          {currentFormData?.pastDues > 0 && <span className="text-purple-600 font-medium">Past Dues: ₹{currentFormData?.pastDues?.toFixed(2)}</span>}
                          {currentFormData?.lateFine > 0 && <span className="text-orange-600 font-medium">Late Fine: ₹{currentFormData?.lateFine?.toFixed(2)}</span>}
                          <span className="text-gray-600 font-medium">Base Fee: ₹{currentFormData?.classFee?.toFixed(2) || "0.00"}</span>
                        </div>
                      </label>
                    </div>
                    <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
                      {showForm && (
                        <div className="px-1 py-1 border-t flex flex-col lg:flex-row gap-1 bg-white">
                          <form onSubmit={(e) => handleSubmit(e, index)} className="flex-grow lg:w-2/3 space-y-5 mb-6 lg:mb-0" noValidate>
                             <div className="border rounded-md p-1 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div><label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fees</label><DynamicMultiSelect name={`regularFees-${index}`} searchable={false} placeholderName="Select month(s)..." dynamicOptions={monthOptions} value={selectedMonthValues} handleChange={(name, opts) => handleMonthMultiSelectChange(index, name, opts)} /></div>
                              <div><label className="block text-sm font-medium text-gray-700 mb-1">Additional (Monthly)</label><DynamicMultiSelect name={`additionalFees-${index}`} searchable={true} placeholderName="Select monthly fee(s)..." dynamicOptions={additionalFeeOptions} value={selectedAdditionalFeeValues} handleChange={(name, opts) => handleDynamicMultiSelectChange(index, "selectedAdditionalFees", opts)} /></div>
                              <div><label className="block text-sm font-medium text-gray-700 mb-1">One-Time Fees</label><DynamicMultiSelect name={`oneTimeFees-${index}`} searchable={true} placeholderName="Select one-time fee(s)..." dynamicOptions={oneTimeFeeOptions} value={selectedOneTimeFeeValues} handleChange={(name, opts) => handleDynamicMultiSelectChange(index, "selectedOneTimeFees", opts)} /></div>
                            </div>
                            <div className="flex flex-wrap gap-4 items-center">
                                <ExemptionToggle isExempt={currentFormData.isExempt} onChange={(value) => handleInputChange(index, "isExempt", value)} studentName={child.studentName} />
                                {currentFormData.isExempt && <ReactInput type="number" label="Exemption" value={currentFormData.exemption} onChange={(e) => handleInputChange(index, "exemption", e.target.value)} min="0" step="0.01" disabled={!currentFormData.isExempt} />}
                                <div className="p-2 border rounded-md bg-gray-50">
                                    <div className="text-sm font-medium text-gray-700">Child's Net Payable: <span className="font-semibold text-blue-700">₹ {calculateNetPayableAmount(index).toFixed(2)}</span></div>
                                    {showIndividualPaymentFields && currentFormData.totalAmount > 0 && (<div className="text-sm font-medium text-red-700">Child's Dues After Payment: <span className="font-semibold">₹ {calculateAutoDistribution(index).remainingDues.toFixed(2)}</span></div>)}
                                </div>
                            </div>
                            {showIndividualPaymentFields && (
                                <>
                                    <div className="flex gap-4">
                                        <ReactInput type="number" label="Concession" value={currentFormData.concession} onChange={(e) => handleInputChange(index, "concession", e.target.value)} min="0" step="0.01" />
                                        <DatePicker className="custom-calendar" label="Payment Date" name="date" id={`date-${index}`} value={currentFormData.date ? new Date(currentFormData.date) : new Date()} handleChange={(e) => handleInputChange(index, "date", e.target.value)} />
                                    </div>
                                    <div className="flex gap-4">
                                        <ReactSelect name={`paymentMode-${index}`} value={currentFormData.paymentMode} handleChange={(e) => handleInputChange(index, "paymentMode", e.target.value)} label="Payment Mode" dynamicOptions={[ { label: "Cash", value: "Cash" }, { label: "Online", value: "Online" }, { label: "Cheque", value: "Cheque" }, { label: "Card", value: "Card" } ]}/>
                                        {(currentFormData.paymentMode === "Online" || currentFormData.paymentMode === "Card") && ( <ReactInput type="text" label="Transaction ID" value={currentFormData.transactionId} onChange={(e) => handleInputChange(index, "transactionId", e.target.value)} isRequired={true}/> )}
                                        {currentFormData.paymentMode === "Cheque" && ( <ReactInput type="text" label="Cheque Number" value={currentFormData.chequeBookNo} onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)} isRequired={true}/> )}
                                    </div>
                                    <div className="flex gap-4">
                                         <ReactInput type="number" label={`Amount to Pay`} value={currentFormData.totalAmount} onChange={(e) => handleInputChange(index, "totalAmount", e.target.value)} min="0.01" step="0.01" isRequired={!currentFormData.isExempt} disabled={currentFormData.isExempt} />
                                        <textarea value={currentFormData.remarks} onChange={(e) => handleInputChange(index, "remarks", e.target.value)} className="block w-full border rounded-md shadow-sm py-2 px-3" rows="1" placeholder="Optional remarks..." />
                                    </div>
                                </>
                            )}
                            {showIndividualPaymentFields && (<div className="flex justify-end"><Button type="submit" name={`Submit for ${child.studentName}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm" /></div>)}
                          </form>
                          <div className="flex-shrink-0 lg:w-1/3 border rounded-md p-1 bg-blue-50 lg:ml-4 lg:mt-0">
                            <h3 className="text-sm font-semibold text-blue-900 border-b border-blue-200">Payment Summary</h3>
                            <div className="overflow-y-auto max-h-52 scrollbar-thin">
                                <table className="w-full text-sm"><tbody>
                                    {currentFormData.pastDues > 0 && (<tr className="border-b"><td className="py-1">Past Dues</td><td className="font-medium text-purple-700 py-1 text-right">₹{currentFormData.pastDues.toFixed(2)}</td></tr>)}
                                    {currentFormData.lateFine > 0 && (<tr className="border-b"><td className="py-1">Late Fines</td><td className="font-medium text-orange-700 py-1 text-right">₹{currentFormData.lateFine.toFixed(2)}</td></tr>)}
                                    {(() => {
                                        const selMonths = currentFormData.selectedMonths.map(m => m.value);
                                        const selAddFees = currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly").flatMap(f => f.dueMonths.map(m => ({ name: f.name, month: m })));
                                        const remDuesList = currentFormData.monthlyDues.additionalDues.filter(d => { const fs = currentFormData.feeInfo?.feeStructure?.additionalFees?.find(s => s.name === d.name); return (d.dueAmount > 0 && !selMonths.includes(d.month) && !selAddFees.some(s => s.name === d.name && s.month === d.month) && fs?.frequency === "monthly"); }).reduce((acc, due) => {const ex = acc.find(i=>i.name === due.name && i.month === due.month); if(ex) ex.amount += due.dueAmount; else acc.push({name:due.name, month:due.month, amount:due.dueAmount}); return acc;}, []);
                                        if (remDuesList.length > 0) return (<> <tr className="border-b font-medium"><td colSpan="2" className="py-1">Remaining Dues (Prev. Months)</td></tr> {remDuesList.map((d, i) => ( <tr key={`rem-sum-${index}-${i}`} className="border-b"><td className="py-1 pl-3">{d.name} ({d.month})</td><td className="font-medium text-blue-700 py-1 text-right">₹{d.amount.toFixed(2)}</td></tr>))} </>); return null;
                                    })()}
                                    {currentFormData.selectedMonths.length > 0 && (<> <tr className="border-b font-medium"><td colSpan="2" className="py-[2px]">Regular Fees</td></tr> {currentFormData.selectedMonths.map((ms, i) => (<tr key={`reg-sum-${index}-${i}`} className="border-b"><td className="py-[2px] pl-3">{ms.value}</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{(ms?.due || 0).toFixed(2)}</td></tr>))} </>)}
                                    {currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly" && f.dueMonths.some(m => currentFormData.selectedMonths.map(sm => sm.value).includes(m))).length > 0 && (<>  <tr className="border-b font-medium"><td colSpan="2" className="pt-2 pb-1">Additional Fees</td></tr> {currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly" && f.dueMonths.some(m => currentFormData.selectedMonths.map(sm => sm.value).includes(m))).map((fee, i) => (<tr key={`add-sum-${index}-${i}`} className="border-b"><td className="py-[2px] pl-3">{fee.name} ({fee.type}, {fee.dueMonths.join(", ")})</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{fee.amount.toFixed(2)}</td></tr>))} </>)}
                                    {currentFormData.selectedOneTimeFees.length > 0 && (<> <tr className="border-b font-medium"><td colSpan="2" className="pt-2 pb-1">One-Time Fees</td></tr> {currentFormData.selectedOneTimeFees.map((fee, i) => (<tr key={`one-time-sum-${index}-${i}`} className="border-b"><td className="py-[2px] pl-3">{fee.name}</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{(fee?.dueAmount || 0).toFixed(2)}</td></tr>))} </>)}
                                    {currentFormData.exemption > 0 && (<tr className="border-b"><td className="text-green-700 py-[2px]">Exemption</td><td className="font-medium text-green-700 py-[2px] text-right">- ₹{parseFloat(currentFormData.exemption).toFixed(2)}</td></tr>)}
                                    {!isUnifiedMode && currentFormData.concession > 0 && (<tr className="border-b"><td className="text-green-700 py-[2px]">Concession</td><td className="font-medium text-green-700 py-[2px] text-right">- ₹{parseFloat(currentFormData.concession).toFixed(2)}</td></tr>)}
                                </tbody></table>
                            </div>
                            <tfoot className="border-t-2 border-blue-200 mt-2 pt-2">
                                <tr><td className="pt-2 font-semibold text-blue-900 py-[2px]">Total Payable (Child)</td><td className="pt-2 font-bold text-blue-900 py-[2px] text-right">₹{calculateNetPayableAmount(index).toFixed(2)}</td></tr>
                                {showIndividualPaymentFields && parseFloat(currentFormData.totalAmount) > 0 && !currentFormData.isExempt && ( <>
                                    <tr><td className="py-[2px]">Amount Paying</td><td className="font-medium text-black py-[2px] text-right">₹{parseFloat(currentFormData.totalAmount).toFixed(2)}</td></tr>
                                    <tr><td className="font-semibold text-red-700 py-[2px]">Remaining Dues</td><td className="font-bold text-red-700 py-[2px] text-right">₹{calculateAutoDistribution(index).remainingDues.toFixed(2)}</td></tr>
                                    {calculateAutoDistribution(index).remainingAfterDistribution > 0 && (<tr><td className="font-semibold text-green-700 py-1 text-xs">Advance/Excess</td><td className="font-semibold text-green-700 py-1 text-right text-xs">₹{calculateAutoDistribution(index).remainingAfterDistribution.toFixed(2)}</td></tr>)}
                                </>)}
                            </tfoot>
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

        {showChildForms && childFeeHistory?.monthlyStatus?.length > 0 && selectedChildrenIndices.length > 0 && (
            <div className=" mt-2 border-t border-gray-300 "><h2 className="text-xl font-semibold text-center text-gray-800">Fee History for {childFeeHistory?.studentName || "Selected Student"} ({childFeeHistory?.session || session})</h2><div className="max-w-4xl mx-auto bg-white p-4 rounded shadow"><MonthFeeCard childFeeHistory={childFeeHistory} /></div></div>
        )}
        <Modal setIsOpen={setIsMessageModalOpen} isOpen={isMessageModalOpen} title="Send Confirmation?" maxWidth="md">
             <div className="p-5">
                <p className="text-gray-700 mb-4 text-center">Fee submitted for <span className="font-semibold">{responseData?.student?.studentName || unifiedReceiptData?.students?.map(s => s.studentName).join(", ") || "student(s)"}</span>.<br />Receipt No: <span className="font-semibold">{responseData?.feeReceiptNumber || unifiedReceiptData?.unifiedReceiptNumber || "N/A"}</span><br />Send SMS to parent?<br />(<span className="font-mono text-sm">{responseData?.parent?.fatherPhone || unifiedReceiptData?.parent?.fatherPhone || "N/A"}</span>)</p>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                    <Button type="button" name="Yes, Send SMS & View Receipt" onClick={() => handleCloseMessageModal(true)} className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2" />
                    <Button type="button" name="No, Just View Receipt" onClick={() => handleCloseMessageModal(false)} className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1" />
                </div>
            </div>
        </Modal>
        <Modal setIsOpen={setPdfModalOpen} isOpen={pdfModalOpen} title="Fee Receipt Preview" maxWidth="lg">
            <div className="p-1">{!isPreviewReady || !receiptData ? <p className="text-center p-10">Loading preview...</p> : <FeeRecipt modalData={receiptData} handleCloseModal={() => handleClosePdfModal()} handlePrint={() => handleClosePdfModal("print")} handleDownload={() => handleClosePdfModal("download")} isPreviewReady={isPreviewReady} isUnified={false} />}</div>
        </Modal>
        <Modal setIsOpen={setUnifiedReceiptModalOpen} isOpen={unifiedReceiptModalOpen} title="Unified Fee Receipt Preview" maxWidth="lg">
             <div className="p-1">{!isPreviewReady || !receiptData ? <p className="text-center p-10">Loading preview...</p> : <FeeRecipt modalData={receiptData} handleCloseModal={() => handleCloseUnifiedReceiptModal()} handlePrint={() => handleCloseUnifiedReceiptModal("print")} handleDownload={() => handleCloseUnifiedReceiptModal("download")} isPreviewReady={isPreviewReady} isUnified={true} />}</div>
        </Modal>
      </div>
    </div>
  );
};

export default SibilingFees;






// import axios from "axios";
// import React, { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
// import {
//   ActiveStudents,
//   feescreateFeeStatus,
//   parentandchildwithID,
//   feescreateUnifiedFeeStatus,
// } from "../../Network/AdminApi";
// import Button from "../../Dynamic/utils/Button";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import MonthFeeCard from "./MonthFeeCard";
// import moment from "moment";
// import { FeeResponse, FeeResponseSibling } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";
// import FeeRecipt from "./FeeRecipt";
// import DynamicMultiSelect from "../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// const ExemptionToggle = ({ isExempt, onChange, studentName }) => {
//   return (
//     <label className="flex items-center gap-2 cursor-pointer">
//       <div className="relative">
//         <input
//           type="checkbox"
//           checked={isExempt}
//           onChange={(e) => onChange(e.target.checked)}
//           className="sr-only peer"
//         />
//         <div
//           className={`relative w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${
//             isExempt ? "bg-light-blue-800" : "bg-gray-300"
//           } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-light-blue-500`}
//         >
//           <div
//             className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform ${
//               isExempt ? "translate-x-5" : "translate-x-0"
//             }`}
//           />
//         </div>
//       </div>
//       <span className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[150px] text-left">
//         {isExempt ? `Exempt` : `Exempt`}
//       </span>
//     </label>
//   );
// };

// const fetchAdditionalFeesForClass = async (className, authToken) => {
//   try {
//     const response = await axios.get(
//       `${
//         process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//       }/api/v1/adminRoute/fees/?additional=true&className=${className}`,
//       {
//         withCredentials: true,
//         headers: { Authorization: `Bearer ${authToken}` },
//       }
//     );
//     if (response?.data?.success) {
//       const filteredFees = response.data.data.filter(
//         (fee) => fee.className === className
//       );
//       return filteredFees.map((fee) => ({
//         label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`,
//         value: fee.amount,
//         name: fee.name,
//         type: fee.feeType,
//         id: fee._id,
//         frequency: fee.frequency,
//       }));
//     } else {
//       console.error(`Failed to fetch additional fees for class ${className}:`, response?.data?.message);
//       toast.error(`Failed to fetch additional fees for class ${className}.`);
//       return [];
//     }
//   } catch (error) {
//     console.error(`Error fetching additional fees for class ${className}:`, error);
//     toast.error(`Error fetching additional fees for class ${className}: ${error.message}`);
//     return [];
//   }
// };

// // Helper function to build the paymentDetails object conditionally
// const buildPaymentDetailsObject = (details, isSinglePaymentContext = false) => {
//   const paymentDetails = {};

//   paymentDetails.pastDuesPaid = details.pastDuesPaid || 0;
//   paymentDetails.lateFinesPaid = details.lateFinesPaid || 0;
//   if (details.totalAmount !== undefined) {
//     paymentDetails.totalAmount = parseFloat(details.totalAmount);
//   }

//   if (details.regularFees && details.regularFees.length > 0) {
//     paymentDetails.regularFees = details.regularFees;
//   }
//   if (details.additionalFees && details.additionalFees.length > 0) {
//     paymentDetails.additionalFees = details.additionalFees;
//   }

//   if (details.concession && parseFloat(details.concession) !== 0) {
//     paymentDetails.concession = parseFloat(details.concession);
//   }
//   if (details.exemption && parseFloat(details.exemption) !== 0) {
//     paymentDetails.exemption = parseFloat(details.exemption);
//   }

//   if (isSinglePaymentContext) {
//     if (details.date) paymentDetails.date = details.date;
//     if (details.paymentMode) paymentDetails.paymentMode = details.paymentMode;
//     if (details.transactionId) paymentDetails.transactionId = details.transactionId;
//     if (details.chequeNumber) paymentDetails.chequeNumber = details.chequeNumber;
//     if (details.remark && details.remark.trim() !== "") paymentDetails.remark = details.remark.trim();
//   }
//   return paymentDetails;
// };


// const SibilingFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
//   const [responseData, setResponseData] = useState(null);
//   const [showChildForms, setShowChildForms] = useState(false);
//   const [selectedChildrenIndices, setSelectedChildrenIndices] = useState([]);
//   const [childFeeHistory, setChildFeeHistory] = useState(null);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showFormFlags, setShowFormFlags] = useState([]);
//   const [triggerRefresh, setTriggerRefresh] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const authToken = localStorage.getItem("token");
//   const [pdfModalOpen, setPdfModalOpen] = useState(false);
//   const [unifiedReceiptModalOpen, setUnifiedReceiptModalOpen] = useState(false);
//   const [unifiedReceiptData, setUnifiedReceiptData] = useState(null);
//   const [receiptData, setReceiptData] = useState(null);
//   const [isPreviewReady, setIsPreviewReady] = useState(false);

//   const [isUnifiedMode, setIsUnifiedMode] = useState(false);
//   const [unifiedPaymentData, setUnifiedPaymentData] = useState({
//     totalAmount: "", concession: "", date: moment().format("YYYY-MM-DD"),
//     paymentMode: "Cash", transactionId: "", chequeBookNo: "", remarks: "",
//   });

//   const allMonths = [
//     "April", "May", "June", "July", "August", "September",
//     "October", "November", "December", "January", "February", "March",
//   ];

//   const getAllStudent = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       setAllStudent(response?.students?.data || []);
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader, session]);

//   useEffect(() => {
//     getAllStudent();
//   }, [getAllStudent, triggerRefresh]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) => student.studentName && student.studentName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//     setSearchTermbyadmissionNo("");
//   };

//   const handleSearchbyAdmissionNo = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTermbyadmissionNo(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) => student.admissionNumber && student.admissionNumber.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//     setSearchTerm("");
//   };

//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `${ process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com" }/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         { withCredentials: true, headers: { Authorization: `Bearer ${authToken}` } }
//       );
//       if (response.data.success) return response.data.data;
//       else {
//         toast.error(`Fee info fetch failed for student ID ${studentId}: ${response.data.message || "Unknown error"}`);
//         return null;
//       }
//     } catch (error) {
//       toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
//       return null;
//     }
//   };

//   const resetState = () => {
//     setSelectedChildrenIndices([]);
//     setChildFeeHistory(null);
//     setShowFormFlags([]);
//     setParentData([]);
//     setFormData([]);
//     setSearchTerm("");
//     setSearchTermbyadmissionNo("");
//     setFilteredStudents([]);
//     setShowChildForms(false);
//     setResponseData(null);
//     setIsMessageModalOpen(false);
//     setPdfModalOpen(false);
//     setUnifiedReceiptModalOpen(false);
//     setUnifiedReceiptData(null);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//     setIsUnifiedMode(false);
//     setUnifiedPaymentData({
//       totalAmount: "", concession: "", date: moment().format("YYYY-MM-DD"),
//       paymentMode: "Cash", transactionId: "", chequeBookNo: "", remarks: "",
//     });
//   };
  
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     resetState(); 
//     try {
//       const parentResponse = await parentandchildwithID(parentId);
//       if (!parentResponse?.success) {
//         toast.error(parentResponse?.message || "Failed to fetch parent/child data.");
//         setIsLoader(false); return;
//       }
//       const children = parentResponse?.children || [];
//       if (children.length === 0) {
//         toast.info("No children found for this parent.");
//         setIsLoader(false); return;
//       }
//       setParentData(children);
//       const promises = children.map((child) =>
//         Promise.all([ fetchStudentFeeInfo(child.studentId), fetchAdditionalFeesForClass(child.class, authToken) ])
//       );
//       const results = await Promise.all(promises);
//       const initialFormData = [];
//       results.forEach(([feeInfo, availableAdditionalFees], index) => {
//         const child = children[index];
//         if (!feeInfo) {
//           initialFormData.push({ admissionNumber: child.admissionNumber, studentId: child.studentId, studentName: child.studentName, className: child.class, error: true });
//           return;
//         }
//         const regularFeeAmount = feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
//         const additionalFeesStructure = feeInfo.feeStructure?.additionalFees || [];
//         const monthlyStatus = feeInfo.monthlyStatus || [];
//         const feeHistory = feeInfo.feeStatus?.feeHistory || [];
//         const monthlyDues = feeInfo.feeStatus?.monthlyDues || { regularDues: [], additionalDues: [] };
//         const oneTimeAdditionalDues = feeInfo.oneTimeAdditionalDues || [];
//         const regularFees = allMonths.map((month) => {
//           const monthData = monthlyStatus.find((m) => m.month === month);
//           const dueData = monthlyDues.regularDues.find((d) => d.month === month);
//           const due = dueData ? dueData.dueAmount : (monthData?.regularFee?.status === "Paid" ? 0 : regularFeeAmount);
//           const status = dueData ? dueData.status : (monthData?.regularFee?.status || "Unpaid");
//           return { month, paidAmount: dueData?.paidAmount || monthData?.regularFee?.paid || "", dueAmount: due, totalAmount: regularFeeAmount, status, label: `${month} (Due: ₹${due.toFixed(2)})` };
//         });
//         const preSelectedMonths = [];
//         monthlyStatus.forEach((monthData) => {
//           if (monthData.regularFee.due > 0 && monthData.regularFee.status !== "Paid") {
//             const dueData = monthlyDues.regularDues.find((d) => d.month === monthData.month);
//             if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
//               const originalFee = regularFees.find((rf) => rf.month === monthData.month);
//               if (originalFee) preSelectedMonths.push({ value: monthData.month, label: originalFee.label, due: dueData.dueAmount });
//             }
//           }
//         });
//         const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
//           name: fee.name, type: fee.feeType, frequency: fee.frequency, amount: fee.amount,
//           months: allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             const addFee = monthData?.additionalFees?.find((af) => af.name === fee.name);
//             const dueData = monthlyDues.additionalDues.find((d) => d.name === fee.name && d.month === month);
//             const due = dueData ? dueData.dueAmount : (addFee?.status === "Paid" ? 0 : fee.amount);
//             const status = dueData ? dueData.status : (addFee?.status || "Unpaid");
//             return { month, paidAmount: dueData?.paidAmount || addFee?.paid || "", dueAmount: due, totalAmount: fee.amount, status };
//           }),
//         }));
//         const preSelectedAdditionalFees = [];
//         monthlyStatus.forEach((monthData) => {
//           monthData.additionalFees?.forEach((fee) => {
//             if (fee.due > 0 && fee.status !== "Paid" && fee.frequency === "monthly") {
//               const dueData = monthlyDues.additionalDues.find((d) => d.name === fee.name && d.month === monthData.month);
//               if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
//                 const feeStructure = additionalFeesStructure.find((fs) => fs.name === fee.name && fs.frequency === "monthly");
//                 if (feeStructure) {
//                   const availableFeeOption = availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
//                   if (availableFeeOption) {
//                     const isMonthPreSelected = preSelectedMonths.some((m) => m.value === monthData.month);
//                     if (isMonthPreSelected) {
//                       const existingFee = preSelectedAdditionalFees.find((pf) => pf.name === fee.name && pf.frequency === "monthly");
//                       if (existingFee) {
//                         if (!existingFee.dueMonths.includes(monthData.month)) { existingFee.dueMonths.push(monthData.month); existingFee.amount += dueData.dueAmount; }
//                       } else preSelectedAdditionalFees.push({ id: availableFeeOption.id, name: availableFeeOption.name, amount: dueData.dueAmount, type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths: [monthData.month] });
//                     }
//                   }
//                 }
//               }
//             }
//           });
//         });
//         const preSelectedOneTimeFees = [];
//         oneTimeAdditionalDues.forEach((fee) => {
//           if (fee.dueAmount > 0 && fee.status !== "Paid") {
//             const feeStructure = additionalFeesStructure.find((fs) => fs.name === fee.name && fs.frequency === "one-time");
//             if (feeStructure) preSelectedOneTimeFees.push({ name: fee.name, dueAmount: fee.dueAmount, frequency: feeStructure.frequency });
//           }
//         });
//         const oneTimeFeeOptions = additionalFeesStructure
//           .filter((fee) => fee.feeType === "One Time" && fee.frequency === "one-time")
//           .filter((fee) => {
//             const isPaidInHistory = feeHistory.some((h) => h.additionalFees.some((af) => af.name === fee.name && af.status === "Paid" && af.dueAmount === 0));
//             const isPaidInDues = monthlyDues.additionalDues.some((d) => d.name === fee.name && d.status === "Paid" && d.dueAmount === 0);
//             const isExemptInDues = monthlyDues.additionalDues.some((d) => d.name === fee.name && d.status === "Exempt" && d.dueAmount === 0);
//             return !isPaidInHistory && !isPaidInDues && !isExemptInDues;
//           })
//           .map((fee) => {
//             const dueFee = oneTimeAdditionalDues.find((d) => d.name === fee.name);
//             const dueAmount = dueFee ? dueFee.dueAmount : fee.amount;
//             return { label: `${fee.name} (Due: ₹${dueAmount.toFixed(2)})`, name: fee.name, code: fee.name, dueAmount, type: fee.feeType, frequency: fee.frequency };
//           });
//         initialFormData.push({
//           admissionNumber: child.admissionNumber, studentId: child.studentId, studentName: child.studentName, className: child.class, classFee: regularFeeAmount,
//           totalAmount: "", selectedMonths: preSelectedMonths, selectedAdditionalFees: preSelectedAdditionalFees, selectedOneTimeFees: preSelectedOneTimeFees,
//           paymentMode: "Cash", transactionId: "", chequeBookNo: "", lateFine: feeInfo.feeStatus?.totalLateFines || 0, concession: "", exemption: "", isExempt: false,
//           date: moment().format("YYYY-MM-DD"), remarks: "", monthlyDues, additionalFeeDetails, pastDues: feeInfo.feeStatus?.pastDues || 0,
//           totalDues: feeInfo.feeStatus?.dues || 0, regularFees, availableAdditionalFees: availableAdditionalFees || [], oneTimeFeeOptions, feeInfo, error: false,
//         });
//       });
//       setFormData(initialFormData);
//       if (children.length > 0) {
//         const allIndices = children.map((_, i) => i);
//         const allFormsVisible = children.map(() => true);
//         setSelectedChildrenIndices(allIndices); 
//         setShowFormFlags(allFormsVisible);     
//         if (initialFormData.length > 0 && initialFormData[0] && !initialFormData[0].error) {
//             setChildFeeHistory(initialFormData[0]?.feeInfo || null);
//         }
//         if (children.length > 1) {
//             setIsUnifiedMode(true);
//             const updatedInitialFormData = initialFormData.map(fd => ({...fd, concession: "" }));
//             setFormData(updatedInitialFormData);
//             const firstChildData = updatedInitialFormData.length > 0 && updatedInitialFormData[0] && !updatedInitialFormData[0].error ? updatedInitialFormData[0] : {};
//             setUnifiedPaymentData({
//                 totalAmount: "", concession: "", date: firstChildData.date || moment().format("YYYY-MM-DD"),
//                 paymentMode: firstChildData.paymentMode || "Cash", transactionId: firstChildData.transactionId || "",
//                 chequeBookNo: firstChildData.chequeBookNo || "", remarks: firstChildData.remarks || "",
//             });
//         } else setIsUnifiedMode(false);
//       }
//       setShowChildForms(true);
//     } catch (error) {
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const handleChildSelection = (index) => {
//     if (!formData || index < 0 || index >= formData.length) { toast.error("An internal error occurred."); return; }
//     const currentChildData = formData[index];
//     if (!currentChildData || currentChildData.error) { toast.warn(`Cannot select ${parentData[index]?.studentName || "this student"}.`); return; }
//     const isCurrentlySelected = selectedChildrenIndices.includes(index);
//     let updatedSelectedChildren;
//     let updatedShowFormFlags = [...showFormFlags];
//     if (isCurrentlySelected) {
//       updatedSelectedChildren = selectedChildrenIndices.filter((i) => i !== index);
//       updatedShowFormFlags[index] = false;
//     } else {
//       updatedSelectedChildren = [...selectedChildrenIndices, index];
//       updatedShowFormFlags[index] = true;
//     }
//     updatedSelectedChildren.sort((a, b) => a - b);
//     setSelectedChildrenIndices(updatedSelectedChildren);
//     setShowFormFlags(updatedShowFormFlags);
//     const newIsUnifiedMode = updatedSelectedChildren.length > 1;
//     if (isUnifiedMode !== newIsUnifiedMode) {
//         setIsUnifiedMode(newIsUnifiedMode);
//         if (newIsUnifiedMode) {
//             const clearedFormData = formData.map(fd => ({...fd, concession: ""}));
//             setFormData(clearedFormData);
//             if (updatedSelectedChildren.length > 0) {
//                 const firstSelectedChildIndex = updatedSelectedChildren[0];
//                 const firstChildData = clearedFormData[firstSelectedChildIndex];
//                 if (firstChildData && !firstChildData.error) {
//                      setUnifiedPaymentData(prev => ({ ...prev, date: firstChildData.date || moment().format("YYYY-MM-DD"),
//                         paymentMode: firstChildData.paymentMode || "Cash", transactionId: firstChildData.transactionId || "",
//                         chequeBookNo: firstChildData.chequeBookNo || "", remarks: firstChildData.remarks || "" }));
//                 }
//             }
//         } else setUnifiedPaymentData(prev => ({...prev, concession: ""}));
//     }
//     if (updatedSelectedChildren.length > 0) setChildFeeHistory(formData[updatedSelectedChildren[0]]?.feeInfo || null);
//     else setChildFeeHistory(null);
//   };
  
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) {
//       updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//       if (field === "paymentMode") {
//         if (value !== "Online" && value !== "Card") updatedFormData[index].transactionId = "";
//         if (value !== "Cheque") updatedFormData[index].chequeBookNo = "";
//       }
//       if (field === "isExempt") {
//         if (value) { 
//           const data = updatedFormData[index]; let total = 0;
//           total += parseFloat(data.pastDues) || 0; total += parseFloat(data.lateFine) || 0;
//           total += data.selectedMonths.reduce((sum, monthState) => sum + (monthState?.due || 0), 0);
//           total += data.selectedAdditionalFees.reduce((sum, fee) => {
//             if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//               return sum + fee.dueMonths.reduce((monthSum, month) => {
//                 const feeDetail = data.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//                 if (feeDetail) { const monthData = feeDetail.months.find((m) => m.month === month); return monthSum + (monthData?.dueAmount || 0); }
//                 return monthSum;
//               }, 0);
//             } else if (fee.frequency === "one-time") {
//               const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find((d) => d.name === fee.name);
//               return sum + (oneTimeDue ? oneTimeDue.dueAmount : parseFloat(fee.amount) || 0);
//             } return sum;
//           }, 0);
//           total += data.selectedOneTimeFees.reduce((sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0), 0);
//           const selectedMonthNames = data.selectedMonths.map((m) => m.value);
//           const selectedAdditionalFeeDues = data.selectedAdditionalFees.filter((fee) => fee.frequency === "monthly").flatMap((fee) => fee.dueMonths.map((month) => ({ name: fee.name, month })));
//           const remainingDues = data.monthlyDues.additionalDues.filter((due) => {
//             const feeStructure = data.feeInfo?.feeStructure?.additionalFees?.find((fs) => fs.name === due.name);
//             return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some((s) => s.name === due.name && s.month === due.month) && feeStructure?.frequency === "monthly");
//           }).reduce((sum, due) => sum + due.dueAmount, 0);
//           total += remainingDues; total -= parseFloat(data.concession) || 0; 
//           updatedFormData[index].exemption = Math.max(0, total).toFixed(2);
//           updatedFormData[index].totalAmount = "0"; 
//         } else updatedFormData[index].exemption = "";
//       }
//       setFormData(updatedFormData);
//     }
//   };

//   const handleUnifiedInputChange = (field, value) => {
//     setUnifiedPaymentData(prev => {
//         const newState = { ...prev, [field]: value };
//         if (field === "paymentMode") {
//             if (value !== "Online" && value !== "Card") newState.transactionId = "";
//             if (value !== "Cheque") newState.chequeBookNo = "";
//         }
//         return newState;
//     });
//   };

//   const handleMonthMultiSelectChange = (index, name, selectedOptions) => {
//     const selectedOptionsData = selectedOptions || [];
//     let updatedFormData = [...formData]; 
//     if (!updatedFormData[index]) return;
//     const currentChildData = updatedFormData[index];
//     const selectedMonthNames = selectedOptionsData.map((opt) => opt.code);
//     if (selectedMonthNames.length > 1) {
//       const indicesInAllMonths = selectedMonthNames.map((month) => allMonths.indexOf(month)).sort((a, b) => a - b);
//       let isSequential = true;
//       for (let i = 1; i < indicesInAllMonths.length; i++) { if (indicesInAllMonths[i] !== indicesInAllMonths[i - 1] + 1) { isSequential = false; break; } }
//       if (!isSequential) { toast.warn("Please select months in a continuous sequence."); return; }
//     }
//     const newSelectedMonths = selectedOptionsData.map((opt) => {
//       const originalFee = currentChildData.regularFees.find((fee) => fee.month === opt.code);
//       if (!originalFee) return null;
//       return { value: originalFee.month, label: originalFee.label, due: originalFee.dueAmount };
//     }).filter(Boolean);
//     updatedFormData[index].selectedMonths = newSelectedMonths;
//     const newSelectedAdditionalFees = [];
//     const structuredMonthlyAddFees = currentChildData.feeInfo?.feeStructure?.additionalFees?.filter((fee) => fee.frequency === "monthly") || [];
//     structuredMonthlyAddFees.forEach((fee) => {
//       const availableFeeOption = currentChildData.availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
//       if (availableFeeOption) {
//         const feeDetail = currentChildData.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//         if (!feeDetail) return;
//         const dueMonths = newSelectedMonths.map((m) => {
//           const monthData = feeDetail.months.find((fm) => fm.month === m.value);
//           if (monthData && monthData.dueAmount > 0) return monthData.month;
//           return null;
//         }).filter(Boolean);
//         if (dueMonths.length > 0) {
//           const totalAmount = dueMonths.reduce((sum, month) => { const mData = feeDetail.months.find((fm) => fm.month === month); return sum + (mData?.dueAmount || 0); }, 0);
//           newSelectedAdditionalFees.push({ id: availableFeeOption.id, name: availableFeeOption.name, amount: totalAmount, type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths });
//         }
//       }
//     });
//     const existingOneTimeFees = currentChildData.selectedAdditionalFees.filter((fee) => fee.frequency === "one-time");
//     updatedFormData[index].selectedAdditionalFees = [...newSelectedAdditionalFees, ...existingOneTimeFees];
//     if (isUnifiedMode && selectedChildrenIndices.length > 1) {
//         selectedChildrenIndices.forEach(siblingIndex => {
//             if (siblingIndex !== index && updatedFormData[siblingIndex] && !updatedFormData[siblingIndex].error) {
//                 const siblingCurrentData = updatedFormData[siblingIndex];
//                 const synchronizedSiblingMonths = newSelectedMonths.map(masterMonth => {
//                     const siblingMonthFeeData = siblingCurrentData.regularFees.find(rf => rf.month === masterMonth.value);
//                     if (siblingMonthFeeData && siblingMonthFeeData.dueAmount > 0) return { value: siblingMonthFeeData.month, label: siblingMonthFeeData.label, due: siblingMonthFeeData.dueAmount };
//                     return null;
//                 }).filter(Boolean);
//                 updatedFormData[siblingIndex].selectedMonths = synchronizedSiblingMonths;
//                 const newSelectedAdditionalFeesSibling = [];
//                 const structuredMonthlyAddFeesSibling = siblingCurrentData.feeInfo?.feeStructure?.additionalFees?.filter((f) => f.frequency === "monthly") || [];
//                 structuredMonthlyAddFeesSibling.forEach((fee) => {
//                     const availableFeeOption = siblingCurrentData.availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
//                     if (availableFeeOption) {
//                         const feeDetail = siblingCurrentData.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//                         if (!feeDetail) return;
//                         const dueMonths = synchronizedSiblingMonths.map((m) => {
//                             const monthData = feeDetail.months.find((fm) => fm.month === m.value);
//                             if (monthData && monthData.dueAmount > 0) return monthData.month;
//                             return null;
//                         }).filter(Boolean);
//                         if (dueMonths.length > 0) {
//                             const totalAmount = dueMonths.reduce((sum, month) => { const mData = feeDetail.months.find((fm) => fm.month === month); return sum + (mData?.dueAmount || 0); }, 0);
//                             newSelectedAdditionalFeesSibling.push({ id: availableFeeOption.id, name: availableFeeOption.name, amount: totalAmount, type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths });
//                         }
//                     }
//                 });
//                 const existingOneTimeFeesSibling = siblingCurrentData.selectedAdditionalFees.filter((f) => f.frequency === "one-time");
//                 updatedFormData[siblingIndex].selectedAdditionalFees = [...newSelectedAdditionalFeesSibling, ...existingOneTimeFeesSibling];
//             }
//         });
//     }
//     setFormData(updatedFormData);
//   };

//   const handleDynamicMultiSelectChange = (index, field, selectedOptions) => {
//     const updatedFormData = [...formData];
//     if (!updatedFormData[index]) return;
//     const currentChildData = updatedFormData[index];
//     if (field === "selectedAdditionalFees") {
//       const newSelectedAdditionalFees = (selectedOptions || []).map((opt) => {
//         const originalFee = currentChildData.availableAdditionalFees.find((fee) => fee.id === opt.code && fee.frequency === "monthly");
//         if (originalFee) return { id: originalFee.id, name: originalFee.name, amount: originalFee.value, type: originalFee.type, frequency: originalFee.frequency, dueMonths: originalFee.frequency === "monthly" ? currentChildData.selectedMonths.map((m) => m.value) : [] };
//         return null;
//       }).filter(Boolean);
//       const existingFees = currentChildData.selectedAdditionalFees.filter((fee) => fee.frequency === "one-time");
//       updatedFormData[index].selectedAdditionalFees = [...newSelectedAdditionalFees, ...existingFees];
//     } else if (field === "selectedOneTimeFees") {
//       const newSelectedOneTimeFees = (selectedOptions || []).map((opt) => {
//         const originalFee = currentChildData.oneTimeFeeOptions.find((fee) => fee.code === opt.code);
//         if (originalFee) return { name: originalFee.name, dueAmount: originalFee.dueAmount, frequency: originalFee.frequency };
//         return null;
//       }).filter(Boolean);
//       updatedFormData[index].selectedOneTimeFees = newSelectedOneTimeFees;
//     }
//     setFormData(updatedFormData);
//   };

//   const calculateNetPayableAmount = useCallback((index) => {
//     const data = formData[index];
//     if (!data || data.error) return 0;
//     let total = 0;
//     total += parseFloat(data.pastDues) || 0; total += parseFloat(data.lateFine) || 0;
//     total += data.selectedMonths.reduce((sum, monthState) => sum + (monthState?.due || 0), 0);
//     total += data.selectedAdditionalFees.reduce((sum, fee) => {
//       if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//         return sum + fee.dueMonths.reduce((monthSum, month) => {
//           const feeDetail = data.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//           if (feeDetail) { const monthData = feeDetail.months.find((m) => m.month === month); return monthSum + (monthData?.dueAmount || 0); }
//           return monthSum;
//         }, 0);
//       } else if (fee.frequency === "one-time") {
//         const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find((d) => d.name === fee.name);
//         return sum + (oneTimeDue ? oneTimeDue.dueAmount : parseFloat(fee.amount) || 0);
//       } return sum;
//     }, 0);
//     total += data.selectedOneTimeFees.reduce((sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0), 0);
//     const selectedMonthNames = data.selectedMonths.map((m) => m.value);
//     const selectedAdditionalFeeDues = data.selectedAdditionalFees.filter((fee) => fee.frequency === "monthly").flatMap((fee) => fee.dueMonths.map((month) => ({ name: fee.name, month })));
//     const remainingDues = data.monthlyDues.additionalDues.filter((due) => {
//       const feeStructure = data.feeInfo?.feeStructure?.additionalFees?.find((fs) => fs.name === due.name);
//       return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some((s) => s.name === due.name && s.month === due.month) && feeStructure?.frequency === "monthly");
//     }).reduce((sum, due) => sum + due.dueAmount, 0);
//     total += remainingDues;
//     if (!isUnifiedMode) total -= parseFloat(data.concession) || 0;
//     total -= parseFloat(data.exemption) || 0;
//     return Math.max(0, total);
//   }, [formData, isUnifiedMode]); 

//   const calculateAutoDistribution = useCallback((index, amountPaidOverride = null) => {
//     const data = formData[index];
//     if (!data || data.error) return { remainingAfterDistribution: 0, remainingDues: 0 };
//     const netPayable = calculateNetPayableAmount(index); 
//     const totalAmountPaid = amountPaidOverride !== null ? amountPaidOverride : (parseFloat(data.totalAmount) || 0);
//     const remainingDues = Math.max(0, netPayable - totalAmountPaid);
//     const remainingAfterDistribution = Math.max(0, totalAmountPaid - netPayable);
//     return { remainingAfterDistribution, remainingDues };
//   }, [formData, calculateNetPayableAmount, isUnifiedMode]);

//   const fetchReceiptData = async (receiptNumber, isUnifiedRec = false) => {
//     setIsPreviewReady(false); setIsLoader(true);
//     try {
//       const url = isUnifiedRec ? `${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/unified-receipts?unifiedReceiptNumber=${receiptNumber}`
//                               : `${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`;
//       const response = await axios.get(url, { headers: { Authorization: `Bearer ${authToken}` } });
//       if (response.data.success) { setReceiptData(response.data); setIsPreviewReady(true); return response.data; }
//       else { toast.error(`Failed to fetch receipt data: ${response.data.message || "Unknown error"}`); return null; }
//     } catch (error) {
//       if (isUnifiedRec && error.response?.status === 404) {
//         try {
//           const fallbackResponse = await axios.get(`${process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"}/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`, { headers: { Authorization: `Bearer ${authToken}` } });
//           if (fallbackResponse.data.success) { setReceiptData(fallbackResponse.data); setIsPreviewReady(true); return fallbackResponse.data; }
//           else { toast.error(`Fallback receipt fetch failed: ${fallbackResponse.data.message || "Unknown error"}`); return null; }
//         } catch (fallbackError) { toast.error("Error fetching receipt data: " + fallbackError.message); return null; }
//       } else { toast.error("Error fetching receipt data: " + error.message); return null; }
//     } finally { setIsLoader(false); }
//   };

//   const validateFormData = (childFormData, child, isUnifiedValidation = false) => {
//     if (!childFormData || childFormData.error) { toast.error(`Cannot submit for ${child?.studentName || "this student"} due to missing data.`); return false; }
//     if (childFormData.isExempt) {
//       const tempIndex = formData.findIndex(fd => fd.studentId === child.studentId);
//       const netPayableForExemption = calculateNetPayableAmount(tempIndex); 
//       childFormData.exemption = netPayableForExemption.toFixed(2);
//     } else if (!isUnifiedValidation) { 
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;
//       if (totalAmount <= 0) { toast.warn(`Please enter a valid amount (> 0) to pay for ${child.studentName}.`); return false; }
//     }
//     const paymentDataSource = isUnifiedValidation ? unifiedPaymentData : childFormData;
//     if (!paymentDataSource.paymentMode) { toast.error(`Payment mode is required for ${child.studentName}.`); return false; }
//     if ((paymentDataSource.paymentMode === "Online" || paymentDataSource.paymentMode === "Card") && !paymentDataSource.transactionId) { toast.error(`Transaction ID is required for Online/Card payment for ${child.studentName}.`); return false; }
//     if (paymentDataSource.paymentMode === "Cheque" && !paymentDataSource.chequeBookNo) { toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}.`); return false; }
//     if (!paymentDataSource.date || !moment(paymentDataSource.date, "YYYY-MM-DD", true).isValid()) { toast.error(`Please select a valid payment date for ${child.studentName}.`); return false; }
//     const concession = isUnifiedValidation ? 0 : (parseFloat(childFormData.concession) || 0); 
//     const exemption = parseFloat(childFormData.exemption) || 0;
//     if (concession < 0) { toast.warn(`Concession amount cannot be negative for ${child.studentName}.`); return false; }
//     if (exemption < 0) { toast.warn(`Exemption amount cannot be negative for ${child.studentName}.`); return false; }
//     if (!isUnifiedValidation && !childFormData.isExempt && parseFloat(childFormData.totalAmount) > 0 && childFormData.selectedMonths.length === 0 && childFormData.selectedAdditionalFees.length === 0 && childFormData.selectedOneTimeFees.length === 0) {
//         const tempIndex = formData.findIndex(fd => fd.studentId === child.studentId);
//         const onlyPayingDuesAndFines = (parseFloat(formData[tempIndex].pastDues) || 0) + (parseFloat(formData[tempIndex].lateFine) || 0);
//         if (parseFloat(childFormData.totalAmount) > onlyPayingDuesAndFines) {
//             toast.warn(`Amount paid for ${child.studentName} exceeds past dues/fines, but no specific month/fee selected. Select items or add remark for advance.`);
//             return false;
//         }
//     }
//     return true;
//   };

//   const handleSubmit = async (e, childIndex) => {
//     e.preventDefault(); e.stopPropagation();
//     const childFormData = formData[childIndex];
//     const child = parentData[childIndex];
//     if (!validateFormData(childFormData, child, false)) return;
//     setIsLoader(true);
//     const selectedMonthNames = childFormData.selectedMonths.map((m) => m.value);
//     const selectedOneTimeFeeNames = childFormData.selectedOneTimeFees.map(fee => fee.name);
//     const monthlyFeesPayload = []; const oneTimeFeesPayload = [];
//     childFormData.selectedAdditionalFees.forEach((fee) => {
//       if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//         fee.dueMonths.forEach((monthName) => {
//           const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(m => m.month === monthName);
//           const isFeeDueForThisMonth = monthStatus?.additionalFees?.some(mf => mf.name === fee.name && mf.status !== "Paid");
//           if (isFeeDueForThisMonth) monthlyFeesPayload.push({ name: fee.name, month: monthName });
//         });
//       }
//     });
//     const selectedAdditionalFeeDues = childFormData.selectedAdditionalFees.filter(fee => fee.frequency === "monthly").flatMap(fee => fee.dueMonths.map(month => ({ name: fee.name, month })));
//     const remainingDues = childFormData.monthlyDues.additionalDues.filter(due => {
//         const feeStructure = childFormData.feeInfo?.feeStructure?.additionalFees?.find(fs => fs.name === due.name);
//         return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some(s => s.name === due.name && s.month === due.month) && feeStructure?.frequency === "monthly" && !selectedOneTimeFeeNames.includes(due.name));
//       }).map(due => ({ name: due.name, month: due.month }));
//     monthlyFeesPayload.push(...remainingDues);
//     childFormData.selectedOneTimeFees.forEach((fee) => oneTimeFeesPayload.push({ name: fee.name }));
//     const additionalFeesPayload = [...monthlyFeesPayload, ...oneTimeFeesPayload];
//     let exemptionAmount = parseFloat(childFormData.exemption) || 0;
//     if (childFormData.isExempt) exemptionAmount = calculateNetPayableAmount(childIndex);
//     const rawPaymentDetails = {
//       regularFees: childFormData.selectedMonths.map((ms) => ({ month: ms.value })), additionalFees: additionalFeesPayload,
//       pastDuesPaid: 0, lateFinesPaid: 0, concession: parseFloat(childFormData.concession) || 0, exemption: exemptionAmount,
//       totalAmount: childFormData.isExempt ? 0 : (parseFloat(childFormData.totalAmount) || 0),
//       date: childFormData.date ? moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY") : moment(new Date()).format("DD-MM-YYYY"),
//       paymentMode: childFormData.paymentMode, transactionId: childFormData.transactionId || undefined, 
//       chequeNumber: childFormData.chequeBookNo || undefined, remark: childFormData.remarks || "",
//     };
//     const finalPaymentDetails = buildPaymentDetailsObject(rawPaymentDetails, true);
//     const payload = { studentId: child.studentId, session, paymentDetails: finalPaymentDetails };
//     console.log("Single Submission Payload:", JSON.stringify(payload, null, 2));
//     try {
//       const response = await feescreateFeeStatus(payload);
//       if (response?.success) { toast.success(response?.message || `Fees submitted for ${child.studentName}!`); setResponseData(response?.data); setIsMessageModalOpen(true); }
//       else toast.error(response?.message || `Fee submission failed for ${child.studentName}.`);
//     } catch (error) { toast.error(`Error during submission for ${child.studentName}: ${error.response?.data?.message || error.message}`);
//     } finally { setIsLoader(false); }
//   };

//   const handleUnifiedFeePayment = async () => {
//     if (!isUnifiedMode || selectedChildrenIndices.length < 2) { toast.warn("Select at least two students."); return; }
//     if (!unifiedPaymentData.paymentMode) { toast.error("Unified Payment mode is required."); return; }
//     if ((unifiedPaymentData.paymentMode === "Online" || unifiedPaymentData.paymentMode === "Card") && !unifiedPaymentData.transactionId) { toast.error("Unified Transaction ID is required."); return; }
//     if (unifiedPaymentData.paymentMode === "Cheque" && !unifiedPaymentData.chequeBookNo) { toast.error("Unified Cheque Number is required."); return; }
//     if (!unifiedPaymentData.date || !moment(unifiedPaymentData.date, "YYYY-MM-DD", true).isValid()) { toast.error("Select a valid unified payment date."); return; }
//     const unifiedTotalAmountPaidNum = parseFloat(unifiedPaymentData.totalAmount) || 0;
//     const unifiedConcessionNum = parseFloat(unifiedPaymentData.concession) || 0;
//     if (unifiedConcessionNum < 0) { toast.error("Unified concession cannot be negative."); return; }
//     const anyExempt = selectedChildrenIndices.some(index => formData[index].isExempt);
//     if (!anyExempt && unifiedTotalAmountPaidNum <= 0 && unifiedConcessionNum <= 0) { toast.warn("Enter total amount (>0) or concession for siblings."); return; }
//     if (unifiedTotalAmountPaidNum < 0 && !anyExempt) { toast.warn("Enter total amount (>=0) for siblings."); return; }

//     const studentsPaymentInfo = []; let overallValidationPassed = true;
//     for (const index of selectedChildrenIndices) {
//         const childFormData = formData[index]; const child = parentData[index];
//         if (!validateFormData(childFormData, child, true)) { overallValidationPassed = false; break; }
//         let netPayableForChild = calculateNetPayableAmount(index); 
//         let exemptionAmountForPayload = parseFloat(childFormData.exemption) || 0;
//         if (childFormData.isExempt) { exemptionAmountForPayload = netPayableForChild; netPayableForChild = 0; }
//         studentsPaymentInfo.push({ index, studentId: child.studentId, childFormData, netPayableForDistribution: netPayableForChild, exemptionAmountForPayload, isExempt: childFormData.isExempt, allocatedAmount: 0 });
//     }
//     if (!overallValidationPassed) return;
//     let amountToDistribute = unifiedTotalAmountPaidNum - unifiedConcessionNum;
//     amountToDistribute = Math.max(0, amountToDistribute); 
//     for (const studentInfo of studentsPaymentInfo) {
//         if (studentInfo.isExempt || studentInfo.netPayableForDistribution <= 0) { studentInfo.allocatedAmount = 0; continue; }
//         if (amountToDistribute <= 0) break; 
//         const canAllocate = Math.min(studentInfo.netPayableForDistribution, amountToDistribute);
//         studentInfo.allocatedAmount = canAllocate; amountToDistribute -= canAllocate;
//     }
//     const studentsApiPayload = [];
//     for (const studentInfo of studentsPaymentInfo) {
//       const { childFormData, studentId, allocatedAmount, exemptionAmountForPayload } = studentInfo;
//       const additionalFeesPayloadForStudent = [];
//       const selectedMonthNames = childFormData.selectedMonths.map(m => m.value); 
//       const selectedOneTimeFeeNames = childFormData.selectedOneTimeFees.map(f => f.name);
//       childFormData.selectedAdditionalFees.forEach((fee) => {
//         if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//             fee.dueMonths.forEach((monthName) => {
//                 const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(m => m.month === monthName);
//                 const isFeeDue = monthStatus?.additionalFees?.some(mf => mf.name === fee.name && mf.status !== "Paid" && mf.status !== "Exempt");
//                 if (isFeeDue) additionalFeesPayloadForStudent.push({ name: fee.name, month: monthName });
//             });
//         }
//       });
//       const selectedAdditionalFeeDues = additionalFeesPayloadForStudent.map(f => ({ name: f.name, month: f.month }));
//       const remainingMonthlyDues = childFormData.monthlyDues.additionalDues.filter(due => {
//             const feeStructure = childFormData.feeInfo?.feeStructure?.additionalFees?.find(fs => fs.name === due.name);
//             return (due.dueAmount > 0 && feeStructure?.frequency === "monthly" && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some(s => s.name === due.name && s.month === due.month) && !selectedOneTimeFeeNames.includes(due.name));
//         }).map(due => ({ name: due.name, month: due.month }));
//       additionalFeesPayloadForStudent.push(...remainingMonthlyDues);
//       childFormData.selectedOneTimeFees.forEach((fee) => {
//          const oneTimeDue = childFormData.feeInfo?.oneTimeAdditionalDues?.find(d => d.name === fee.name && d.status !== "Paid" && d.status !== "Exempt");
//          if(oneTimeDue) additionalFeesPayloadForStudent.push({ name: fee.name });
//       });
//       const rawStudentPaymentDetails = { regularFees: childFormData.selectedMonths.map(ms => ({ month: ms.value })), additionalFees: additionalFeesPayloadForStudent, pastDuesPaid: 0, lateFinesPaid: 0, concession: 0, exemption: exemptionAmountForPayload, totalAmount: allocatedAmount };
//       const finalStudentPaymentDetails = buildPaymentDetailsObject(rawStudentPaymentDetails, false);
//       const hasRegFees = finalStudentPaymentDetails.regularFees && finalStudentPaymentDetails.regularFees.length > 0;
//       const hasAddFees = finalStudentPaymentDetails.additionalFees && finalStudentPaymentDetails.additionalFees.length > 0;
//       const hasExmp = finalStudentPaymentDetails.exemption && parseFloat(finalStudentPaymentDetails.exemption) !== 0;
//       const hasTotalAmt = (finalStudentPaymentDetails.totalAmount !== undefined && parseFloat(finalStudentPaymentDetails.totalAmount) > 0) || (hasExmp && finalStudentPaymentDetails.totalAmount !== undefined && parseFloat(finalStudentPaymentDetails.totalAmount) === 0);
//       if (hasRegFees || hasAddFees || hasExmp || hasTotalAmt) {
//         studentsApiPayload.push({ studentId, paymentDetails: finalStudentPaymentDetails });
//       }
//     }
//     if (studentsApiPayload.length === 0 && unifiedConcessionNum <= 0) { toast.info("No payment actions for selected students."); setIsLoader(false); return; }
//     const finalUnifiedPaymentDetailsAPI = {
//         paymentMode: unifiedPaymentData.paymentMode, transactionId: unifiedPaymentData.transactionId || undefined,
//         chequeNumber: unifiedPaymentData.chequeBookNo || undefined, date: moment(unifiedPaymentData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
//         remark: (unifiedPaymentData.remarks && unifiedPaymentData.remarks.trim() !== "") ? unifiedPaymentData.remarks.trim() : undefined,
//         ...(unifiedConcessionNum > 0 && { globalConcession: unifiedConcessionNum })
//     };
//     const payload = { students: studentsApiPayload, session, unifiedPaymentDetails: finalUnifiedPaymentDetailsAPI };
//     console.log("Unified Payload:", JSON.stringify(payload, null, 2));
//     setIsLoader(true);
//     try {
//       const response = await feescreateUnifiedFeeStatus(payload);
//       if (response.success) { toast.success(response.message || "Unified fees submitted!"); setUnifiedReceiptData(response.data); setIsMessageModalOpen(true); }
//       else toast.error(response.message || "Unified fee submission failed.");
//     } catch (error) { toast.error(`Error during unified submission: ${error.response?.data?.message || error.message}`);
//     } finally { setIsLoader(false); }
//   };
  
//   const handleCloseMessageModal = async (sendMsg = false) => {
//     setIsMessageModalOpen(false); let receiptNumber = null; let isUnifiedRec = false; 
//     let dataForActions = null; let parentIdForRefresh = null;
//     if (responseData) { receiptNumber = responseData.feeReceiptNumber; isUnifiedRec = false; dataForActions = responseData; parentIdForRefresh = responseData?.student?.parentId; }
//     else if (unifiedReceiptData) { receiptNumber = unifiedReceiptData.unifiedReceiptNumber; isUnifiedRec = true; dataForActions = unifiedReceiptData; parentIdForRefresh = unifiedReceiptData?.parentId || (unifiedReceiptData?.students?.[0]?.parentId); }
//     if (sendMsg && dataForActions) { if (isUnifiedRec) sendUnifiedMessage(dataForActions); else sendMessage(dataForActions); }
//     const tempReceiptNumber = receiptNumber; const tempIsUnified = isUnifiedRec;
//     const currentSearchTerm = searchTerm; const currentSearchTermAdm = searchTermbyadmissionNo; const currentFiltered = filteredStudents;
//     resetState(); 
//     setSearchTerm(currentSearchTerm); setSearchTermbyadmissionNo(currentSearchTermAdm); setFilteredStudents(currentFiltered);
//     if (parentIdForRefresh) await handleStudentClick(parentIdForRefresh); 
//     else setTriggerRefresh((prev) => !prev); 
//     if (tempReceiptNumber) {
//       const fetchedReceiptData = await fetchReceiptData(tempReceiptNumber, tempIsUnified);
//       if (fetchedReceiptData) { if (tempIsUnified) setUnifiedReceiptModalOpen(true); else setPdfModalOpen(true); }
//     }
//   };

//   const handleClosePdfModal = (action = null) => {
//     if (action === "download" && receiptData) handleDownloadPdf(receiptData);
//     else if (action === "print" && receiptData) handlePrintReceipt(receiptData);
//     setPdfModalOpen(false); setReceiptData(null); setIsPreviewReady(false);
//   };
//   const handleCloseUnifiedReceiptModal = (action = null) => {
//     if (action === "download" && receiptData) handleDownloadUnifiedPdf(receiptData);
//     else if (action === "print" && receiptData) handlePrintUnifiedReceipt(receiptData);
//     setUnifiedReceiptModalOpen(false); setReceiptData(null); setIsPreviewReady(false);
//   };
//   const handleDownloadPdf = (dataToUse) => {
//     if (!dataToUse?.data) { toast.error("No receipt data for PDF."); return; }
//     generatePdf(dataToUse.data, [], 0,0,0,0,0,0, `fee-receipt-${dataToUse.data?.feeReceiptNumber}.pdf`);
//   };
//   const handlePrintReceipt = (dataToUse) => {
//     if (!dataToUse?.data) { toast.error("No receipt data to print."); return; }
//     toast.info("Print placeholder: " + dataToUse.data?.feeReceiptNumber);
//   };
//   const sendMessage = (dataToUse) => {
//     if (!dataToUse) { toast.error("No receipt data for SMS."); return; }
//     try { FeeResponse(dataToUse); toast.info(`SMS called for ${dataToUse?.student?.studentName}`); }
//     catch (error) { toast.error("Failed to initiate SMS."); }
//   };
//   const handleDownloadUnifiedPdf = (dataToUse) => {
//     if (!dataToUse?.data) { toast.error("No unified receipt data for PDF."); return; }
//     generatePdf(dataToUse.data, [], 0,0,0,0,0,0, `unified-receipt-${dataToUse.data?.unifiedReceiptNumber}.pdf`);
//   };
//   const handlePrintUnifiedReceipt = (dataToUse) => {
//     if (!dataToUse?.data) { toast.error("No unified receipt data to print."); return; }
//     toast.info("Print placeholder: " + dataToUse.data?.unifiedReceiptNumber);
//   };
//   const sendUnifiedMessage = (dataToUse) => {
//     if (!dataToUse) { toast.error("No unified receipt data for SMS."); return; }
//     try { FeeResponseSibling(dataToUse?.feeReceipts);
//       const studentNames = dataToUse?.students?.map((s) => s.studentName).join(", ") || "selected students";
//       toast.info(`SMS called for ${studentNames}`);
//     } catch (error) { toast.error("Failed to initiate SMS."); }
//   };

//   return (
//     <div className="">
//       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Create Fee" />
//       <div className=" mx-auto">
//         <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row gap-4 ">
//           <ReactInput type="text" label="Search by Name" onChange={handleSearch} value={searchTerm} containerClassName="flex-1 min-w-[200px]" />
//           <ReactInput type="text" label="Search by Adm. No" onChange={handleSearchbyAdmissionNo} value={searchTermbyadmissionNo} containerClassName="flex-1 min-w-[200px]" />
//         </div>

//         {filteredStudents.length > 0 && (
//           <div className="relative">
//             <div className="absolute z-30 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ">
//               <table className="w-full border-collapse">
//                 <thead className="bg-gray-100 sticky top-0 z-20">
//                   <tr>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Adm No.</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Student Name</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Class</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Parent Name</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b">Contact</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredStudents.map((student) => (
//                     <tr key={student._id} className="cursor-pointer hover:bg-gray-100 border-b"
//                       onClick={() => { handleStudentClick(student.parentId); setFilteredStudents([]); }}>
//                       <td className="p-1 text-[13px]">{student.admissionNumber}</td>
//                       <td className="p-1 font-semibold text-[13px]">{student.studentName}</td>
//                       <td className="p-1 text-[13px]">{student.class}</td>
//                       <td className="p-1 text-[13px]">{student.fatherName}</td>
//                       <td className="p-1 text-[13px]">{student?.parentContact}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {showChildForms && parentData.length > 0 && (
//           <div className=" pt-2 border-t border-gray-200">
//             <div className="flex justify-between items-center mb-4">
//               <h5 className="text-sm font-semibold text-gray-800">Selected Student(s) Fee Payment</h5>
//               {isUnifiedMode && selectedChildrenIndices.length > 1 && (
//                 <Button name="Pay for Siblings Together" onClick={handleUnifiedFeePayment} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm" />
//               )}
//             </div>

//             {isUnifiedMode && selectedChildrenIndices.length > 1 && (
//                 <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50 shadow">
//                     <h3 className="text-lg font-semibold text-blue-700 mb-3">Unified Payment Details</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <ReactInput type="number" label="Total Amount to Pay (Unified)" value={unifiedPaymentData.totalAmount} onChange={(e) => handleUnifiedInputChange("totalAmount", e.target.value)} min="0" step="0.01" isRequired={true} />
//                         <ReactInput type="number" label="Unified Concession" value={unifiedPaymentData.concession} onChange={(e) => handleUnifiedInputChange("concession", e.target.value)} min="0" step="0.01" />
//                          <DatePicker className="custom-calendar" label="Payment Date (Unified)" name="unifiedDate" id="unifiedDate" value={unifiedPaymentData.date ? new Date(unifiedPaymentData.date) : new Date()} handleChange={(e) => handleUnifiedInputChange("date", e.target.value)} />
//                         <ReactSelect name="unifiedPaymentMode" label="Payment Mode (Unified)" value={unifiedPaymentData.paymentMode} handleChange={(e) => handleUnifiedInputChange("paymentMode", e.target.value)}
//                             dynamicOptions={[ { label: "Cash", value: "Cash" }, { label: "Online", value: "Online" }, { label: "Cheque", value: "Cheque" }, { label: "Card", value: "Card" } ]} />
//                         {(unifiedPaymentData.paymentMode === "Online" || unifiedPaymentData.paymentMode === "Card") && ( <ReactInput type="text" label="Transaction ID (Unified)" value={unifiedPaymentData.transactionId} onChange={(e) => handleUnifiedInputChange("transactionId", e.target.value)} isRequired={true} /> )}
//                         {unifiedPaymentData.paymentMode === "Cheque" && ( <ReactInput type="text" label="Cheque Number (Unified)" value={unifiedPaymentData.chequeBookNo} onChange={(e) => handleUnifiedInputChange("chequeBookNo", e.target.value)} isRequired={true} /> )}
                        
//                          {/* <div className="md:col-span-2 lg:col-span-1"> */}
//                             {/* <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Unified)</label> */}
//                             <textarea value={unifiedPaymentData.remarks} onChange={(e) => handleUnifiedInputChange("remarks", e.target.value)} className="block w-full border rounded-md shadow-sm py-2 px-3" rows="1" placeholder="Optional remarks..." />
//                         {/* </div> */}
//                          {isUnifiedMode && selectedChildrenIndices.length > 1 && (
//                 <Button name="Pay for Siblings Together" onClick={handleUnifiedFeePayment} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm" />
//               )}
//                     </div>
//                 </div>
//             )}

//             <div className="flex flex-col gap-2">
//               {parentData.map((child, index) => {
//                 const currentFormData = formData[index];
//                 if (!currentFormData || currentFormData.error) {
//                   return ( <div key={child._id || index} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md" role="alert"> <strong className="font-bold">Error:</strong> <span className="block sm:inline ml-2">Could not load fee data for {child.studentName || "this student"}.</span> </div> );
//                 }
//                 const isSelected = selectedChildrenIndices.includes(index);
//                 const showForm = showFormFlags[index];
//                 const monthOptions = currentFormData.regularFees.filter(f => f.dueAmount > 0).map(f => ({ name: f.label, code: f.month }));
//                 const selectedMonthValues = currentFormData.selectedMonths.map(ms => ({ name: ms.label, code: ms.value }));
//                 const additionalFeeOptions = currentFormData.availableAdditionalFees.filter(f => f.frequency === "monthly").map(item => ({ name: item.label, code: item.id }));
//                 const selectedAdditionalFeeValues = currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly").map(sf => { const opt = additionalFeeOptions.find(o => o.code === sf.id); return { name: opt ? opt.name : `${sf.name} (${sf.type}) - ₹${sf.amount}`, code: sf.id }; });
//                 const oneTimeFeeOptions = currentFormData.oneTimeFeeOptions.map(item => ({ name: item.label, code: item.code }));
//                 const selectedOneTimeFeeValues = currentFormData.selectedOneTimeFees.map(f => { const opt = oneTimeFeeOptions.find(o => o.code === f.name); return { name: opt ? opt.name : `${f.name} (Due: ₹${f.dueAmount.toFixed(2)})`, code: f.name }; });
//                 const showIndividualPaymentFields = !isUnifiedMode || selectedChildrenIndices.length <= 1;

//                 return (
//                   <div key={child._id || index} className={`bg-white rounded-lg shadow-md border transition-all duration-300 ${isSelected ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200 hover:border-gray-300"} overflow-hidden`}>
//                     <div className={`flex items-center px-4 py-1 border-b cursor-pointer`} onClick={() => handleChildSelection(index)}>
//                       <input type="checkbox" id={`child-checkbox-${index}`} checked={isSelected} onChange={(e) => { e.stopPropagation(); handleChildSelection(index); }} className="mr-3 h-5 w-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" />
//                       <label id={`child-label-${index}`} className="flex-grow cursor-pointer" htmlFor={`child-checkbox-${index}`}>
//                         <div className="flex justify-between items-center">
//                           <div><span className="text-base font-semibold text-blue-800">{child.studentName}</span> <span className="text-sm text-gray-600 ml-2">(Class: {child.class} / Adm#: {child.admissionNumber})</span></div>
//                           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-700"}`}>{isSelected ? "SELECTED" : "SELECT"}</span>
//                         </div>
//                         <div className="flex flex-wrap justify-start items-center gap-x-4 text-xs mt-1">
//                           <span className="text-red-600 font-medium">Total Dues: ₹{currentFormData?.totalDues?.toFixed(2) || "0.00"}</span>
//                           {currentFormData?.pastDues > 0 && <span className="text-purple-600 font-medium">Past Dues: ₹{currentFormData?.pastDues?.toFixed(2)}</span>}
//                           {currentFormData?.lateFine > 0 && <span className="text-orange-600 font-medium">Late Fine: ₹{currentFormData?.lateFine?.toFixed(2)}</span>}
//                           <span className="text-gray-600 font-medium">Base Fee: ₹{currentFormData?.classFee?.toFixed(2) || "0.00"}</span>
//                         </div>
//                       </label>
//                     </div>
//                     <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
//                       {showForm && (
//                         <div className="px-1 py-1 border-t flex flex-col lg:flex-row gap-1 bg-white">
//                           <form onSubmit={(e) => handleSubmit(e, index)} className="flex-grow lg:w-2/3 space-y-5 mb-6 lg:mb-0" noValidate>
//                              <div className="border rounded-md p-1 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
//                               <div><label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fees</label><DynamicMultiSelect name={`regularFees-${index}`} searchable={false} placeholderName="Select month(s)..." dynamicOptions={monthOptions} value={selectedMonthValues} handleChange={(name, opts) => handleMonthMultiSelectChange(index, name, opts)} /></div>
//                               <div><label className="block text-sm font-medium text-gray-700 mb-1">Additional (Monthly)</label><DynamicMultiSelect name={`additionalFees-${index}`} searchable={true} placeholderName="Select monthly fee(s)..." dynamicOptions={additionalFeeOptions} value={selectedAdditionalFeeValues} handleChange={(name, opts) => handleDynamicMultiSelectChange(index, "selectedAdditionalFees", opts)} /></div>
//                               <div><label className="block text-sm font-medium text-gray-700 mb-1">One-Time Fees</label><DynamicMultiSelect name={`oneTimeFees-${index}`} searchable={true} placeholderName="Select one-time fee(s)..." dynamicOptions={oneTimeFeeOptions} value={selectedOneTimeFeeValues} handleChange={(name, opts) => handleDynamicMultiSelectChange(index, "selectedOneTimeFees", opts)} /></div>
//                             </div>
//                             <div className="flex flex-wrap gap-4 items-center">
//                                 <ExemptionToggle isExempt={currentFormData.isExempt} onChange={(value) => handleInputChange(index, "isExempt", value)} studentName={child.studentName} />
//                                 {currentFormData.isExempt && <ReactInput type="number" label="Exemption" value={currentFormData.exemption} onChange={(e) => handleInputChange(index, "exemption", e.target.value)} min="0" step="0.01" disabled={!currentFormData.isExempt} />}
//                                 <div className="p-2 border rounded-md bg-gray-50">
//                                     <div className="text-sm font-medium text-gray-700">Child's Net Payable: <span className="font-semibold text-blue-700">₹ {calculateNetPayableAmount(index).toFixed(2)}</span></div>
//                                     {showIndividualPaymentFields && currentFormData.totalAmount > 0 && (<div className="text-sm font-medium text-red-700">Child's Dues After Payment: <span className="font-semibold">₹ {calculateAutoDistribution(index).remainingDues.toFixed(2)}</span></div>)}
//                                 </div>
//                             </div>
//                             {showIndividualPaymentFields && (
//                                 <>
//                                     <div className="flex gap-4">
//                                         <ReactInput type="number" label="Concession" value={currentFormData.concession} onChange={(e) => handleInputChange(index, "concession", e.target.value)} min="0" step="0.01" />
//                                         <DatePicker className="custom-calendar" label="Payment Date" name="date" id={`date-${index}`} value={currentFormData.date ? new Date(currentFormData.date) : new Date()} handleChange={(e) => handleInputChange(index, "date", e.target.value)} />
//                                     </div>
//                                     <div className="flex gap-4">
//                                         <ReactSelect name={`paymentMode-${index}`} value={currentFormData.paymentMode} handleChange={(e) => handleInputChange(index, "paymentMode", e.target.value)} label="Payment Mode" dynamicOptions={[ { label: "Cash", value: "Cash" }, { label: "Online", value: "Online" }, { label: "Cheque", value: "Cheque" }, { label: "Card", value: "Card" } ]}/>
//                                         {(currentFormData.paymentMode === "Online" || currentFormData.paymentMode === "Card") && ( <ReactInput type="text" label="Transaction ID" value={currentFormData.transactionId} onChange={(e) => handleInputChange(index, "transactionId", e.target.value)} isRequired={true}/> )}
//                                         {currentFormData.paymentMode === "Cheque" && ( <ReactInput type="text" label="Cheque Number" value={currentFormData.chequeBookNo} onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)} isRequired={true}/> )}
//                                     </div>
//                                     <div className="flex gap-4">
//                                          <ReactInput type="number" label={`Amount to Pay`} value={currentFormData.totalAmount} onChange={(e) => handleInputChange(index, "totalAmount", e.target.value)} min="0.01" step="0.01" isRequired={!currentFormData.isExempt} disabled={currentFormData.isExempt} />
//                                         <textarea value={currentFormData.remarks} onChange={(e) => handleInputChange(index, "remarks", e.target.value)} className="block w-full border rounded-md shadow-sm py-2 px-3" rows="1" placeholder="Optional remarks..." />
//                                     </div>
//                                 </>
//                             )}
//                             {showIndividualPaymentFields && (<div className="flex justify-end"><Button type="submit" name={`Submit for ${child.studentName}`} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm" /></div>)}
//                           </form>
//                           <div className="flex-shrink-0 lg:w-1/3 border rounded-md p-1 bg-blue-50 lg:ml-4 lg:mt-0">
//                             <h3 className="text-sm font-semibold text-blue-900 border-b border-blue-200">Payment Summary</h3>
//                             <div className="overflow-y-auto max-h-52 scrollbar-thin">
//                                 <table className="w-full text-sm"><tbody>
//                                     {currentFormData.pastDues > 0 && (<tr className="border-b"><td className="py-1">Past Dues</td><td className="font-medium text-purple-700 py-1 text-right">₹{currentFormData.pastDues.toFixed(2)}</td></tr>)}
//                                     {currentFormData.lateFine > 0 && (<tr className="border-b"><td className="py-1">Late Fines</td><td className="font-medium text-orange-700 py-1 text-right">₹{currentFormData.lateFine.toFixed(2)}</td></tr>)}
//                                     {(() => {
//                                         const selMonths = currentFormData.selectedMonths.map(m => m.value);
//                                         const selAddFees = currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly").flatMap(f => f.dueMonths.map(m => ({ name: f.name, month: m })));
//                                         const remDuesList = currentFormData.monthlyDues.additionalDues.filter(d => { const fs = currentFormData.feeInfo?.feeStructure?.additionalFees?.find(s => s.name === d.name); return (d.dueAmount > 0 && !selMonths.includes(d.month) && !selAddFees.some(s => s.name === d.name && s.month === d.month) && fs?.frequency === "monthly"); }).reduce((acc, due) => {const ex = acc.find(i=>i.name === due.name && i.month === due.month); if(ex) ex.amount += due.dueAmount; else acc.push({name:due.name, month:due.month, amount:due.dueAmount}); return acc;}, []);
//                                         if (remDuesList.length > 0) return (<> <tr className="border-b font-medium"><td colSpan="2" className="py-1">Remaining Dues (Prev. Months)</td></tr> {remDuesList.map((d, i) => ( <tr key={`rem-sum-${index}-${i}`} className="border-b"><td className="py-1 pl-3">{d.name} ({d.month})</td><td className="font-medium text-blue-700 py-1 text-right">₹{d.amount.toFixed(2)}</td></tr>))} </>); return null;
//                                     })()}
//                                     {currentFormData.selectedMonths.length > 0 && (<> <tr className="border-b font-medium"><td colSpan="2" className="py-[2px]">Regular Fees</td></tr> {currentFormData.selectedMonths.map((ms, i) => (<tr key={`reg-sum-${index}-${i}`} className="border-b"><td className="py-[2px] pl-3">{ms.value}</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{(ms?.due || 0).toFixed(2)}</td></tr>))} </>)}
//                                     {currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly" && f.dueMonths.some(m => currentFormData.selectedMonths.map(sm => sm.value).includes(m))).length > 0 && (<>  <tr className="border-b font-medium"><td colSpan="2" className="pt-2 pb-1">Additional Fees</td></tr> {currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly" && f.dueMonths.some(m => currentFormData.selectedMonths.map(sm => sm.value).includes(m))).map((fee, i) => (<tr key={`add-sum-${index}-${i}`} className="border-b"><td className="py-[2px] pl-3">{fee.name} ({fee.type}, {fee.dueMonths.join(", ")})</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{fee.amount.toFixed(2)}</td></tr>))} </>)}
//                                     {currentFormData.selectedOneTimeFees.length > 0 && (<> <tr className="border-b font-medium"><td colSpan="2" className="pt-2 pb-1">One-Time Fees</td></tr> {currentFormData.selectedOneTimeFees.map((fee, i) => (<tr key={`one-time-sum-${index}-${i}`} className="border-b"><td className="py-[2px] pl-3">{fee.name}</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{(fee?.dueAmount || 0).toFixed(2)}</td></tr>))} </>)}
//                                     {currentFormData.exemption > 0 && (<tr className="border-b"><td className="text-green-700 py-[2px]">Exemption</td><td className="font-medium text-green-700 py-[2px] text-right">- ₹{parseFloat(currentFormData.exemption).toFixed(2)}</td></tr>)}
//                                     {!isUnifiedMode && currentFormData.concession > 0 && (<tr className="border-b"><td className="text-green-700 py-[2px]">Concession</td><td className="font-medium text-green-700 py-[2px] text-right">- ₹{parseFloat(currentFormData.concession).toFixed(2)}</td></tr>)}
//                                 </tbody></table>
//                             </div>
//                             <tfoot className="border-t-2 border-blue-200 mt-2 pt-2">
//                                 <tr><td className="pt-2 font-semibold text-blue-900 py-[2px]">Total Payable (Child)</td><td className="pt-2 font-bold text-blue-900 py-[2px] text-right">₹{calculateNetPayableAmount(index).toFixed(2)}</td></tr>
//                                 {showIndividualPaymentFields && parseFloat(currentFormData.totalAmount) > 0 && !currentFormData.isExempt && ( <>
//                                     <tr><td className="py-[2px]">Amount Paying</td><td className="font-medium text-black py-[2px] text-right">₹{parseFloat(currentFormData.totalAmount).toFixed(2)}</td></tr>
//                                     <tr><td className="font-semibold text-red-700 py-[2px]">Remaining Dues</td><td className="font-bold text-red-700 py-[2px] text-right">₹{calculateAutoDistribution(index).remainingDues.toFixed(2)}</td></tr>
//                                     {calculateAutoDistribution(index).remainingAfterDistribution > 0 && (<tr><td className="font-semibold text-green-700 py-1 text-xs">Advance/Excess</td><td className="font-semibold text-green-700 py-1 text-right text-xs">₹{calculateAutoDistribution(index).remainingAfterDistribution.toFixed(2)}</td></tr>)}
//                                 </>)}
//                             </tfoot>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {showChildForms && childFeeHistory?.monthlyStatus?.length > 0 && selectedChildrenIndices.length > 0 && (
//             <div className=" mt-2 border-t border-gray-300 "><h2 className="text-xl font-semibold text-center text-gray-800">Fee History for {childFeeHistory?.studentName || "Selected Student"} ({childFeeHistory?.session || session})</h2><div className="max-w-4xl mx-auto bg-white p-4 rounded shadow"><MonthFeeCard childFeeHistory={childFeeHistory} /></div></div>
//         )}
//         <Modal setIsOpen={setIsMessageModalOpen} isOpen={isMessageModalOpen} title="Send Confirmation?" maxWidth="md">
//              <div className="p-5">
//                 <p className="text-gray-700 mb-4 text-center">Fee submitted for <span className="font-semibold">{responseData?.student?.studentName || unifiedReceiptData?.students?.map(s => s.studentName).join(", ") || "student(s)"}</span>.<br />Receipt No: <span className="font-semibold">{responseData?.feeReceiptNumber || unifiedReceiptData?.unifiedReceiptNumber || "N/A"}</span><br />Send SMS to parent?<br />(<span className="font-mono text-sm">{responseData?.parent?.fatherPhone || unifiedReceiptData?.parent?.fatherPhone || "N/A"}</span>)</p>
//                 <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//                     <Button type="button" name="Yes, Send SMS & View Receipt" onClick={() => handleCloseMessageModal(true)} className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2" />
//                     <Button type="button" name="No, Just View Receipt" onClick={() => handleCloseMessageModal(false)} className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1" />
//                 </div>
//             </div>
//         </Modal>
//         <Modal setIsOpen={setPdfModalOpen} isOpen={pdfModalOpen} title="Fee Receipt Preview" maxWidth="lg">
//             <div className="p-1">{!isPreviewReady || !receiptData ? <p className="text-center p-10">Loading preview...</p> : <FeeRecipt modalData={receiptData} handleCloseModal={() => handleClosePdfModal()} handlePrint={() => handleClosePdfModal("print")} handleDownload={() => handleClosePdfModal("download")} isPreviewReady={isPreviewReady} isUnified={false} />}</div>
//         </Modal>
//         <Modal setIsOpen={setUnifiedReceiptModalOpen} isOpen={unifiedReceiptModalOpen} title="Unified Fee Receipt Preview" maxWidth="lg">
//              <div className="p-1">{!isPreviewReady || !receiptData ? <p className="text-center p-10">Loading preview...</p> : <FeeRecipt modalData={receiptData} handleCloseModal={() => handleCloseUnifiedReceiptModal()} handlePrint={() => handleCloseUnifiedReceiptModal("print")} handleDownload={() => handleCloseUnifiedReceiptModal("download")} isPreviewReady={isPreviewReady} isUnified={true} />}</div>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default SibilingFees;







// import axios from "axios";
// import React, { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
// import {
//   ActiveStudents,
//   feescreateFeeStatus,
//   parentandchildwithID,
//   feescreateUnifiedFeeStatus,
// } from "../../Network/AdminApi";
// import Button from "../../Dynamic/utils/Button";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import MonthFeeCard from "./MonthFeeCard";
// import moment from "moment";
// import { FeeResponse, FeeResponseSibling } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";
// import FeeRecipt from "./FeeRecipt";
// import DynamicMultiSelect from "../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// // ExemptionToggle and fetchAdditionalFeesForClass remain the same

// const ExemptionToggle = ({ isExempt, onChange, studentName }) => {
  
//   return (
//     <label className="flex items-center gap-2 cursor-pointer">
//       <div className="relative">
//         {/* Screen-reader only checkbox */}
//         <input
//           type="checkbox"
//           checked={isExempt}
//           onChange={(e) => onChange(e.target.checked)}
//           className="sr-only peer" // Added peer class for potential future styling
//         />
//         {/* Switch Track */}
//         <div
//           className={`relative w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${
//             isExempt ? "bg-light-blue-800" : "bg-gray-300" // Use your actual blue color class
//           } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-light-blue-500`} // Added focus ring for accessibility
//         >
//           {/* Switch Handle */}
//           <div
//             className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform ${
//               isExempt ? "translate-x-5" : "translate-x-0" // Adjusted positioning slightly if needed (top/left-[2px])
//             }`}
//           />
//         </div>
//       </div>

//       {/* Text Label - Added min-width */}
//       <span
//         className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[150px] text-left" // <-- Add min-w-[value] and text-left
//         // Adjust min-w-[150px] based on the longest expected student name + "Exempt for " text
//       >
//         {isExempt ? `Exempt` : `Exempt`}
//         {/* {isExempt ? `Exempt for ${studentName}` : `Exempt`} */}
//       </span>
//     </label>

//   );
// };

// // Helper to fetch additional fees
// const fetchAdditionalFeesForClass = async (className, authToken) => {
//   try {
//     const response = await axios.get(
//       `${
//         process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//       }/api/v1/adminRoute/fees/?additional=true&className=${className}`,
//       {
//         withCredentials: true,
//         headers: { Authorization: `Bearer ${authToken}` },
//       }
//     );
//     if (response?.data?.success) {
//       const filteredFees = response.data.data.filter(
//         (fee) => fee.className === className
//       );
//       return filteredFees.map((fee) => ({
//         label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`,
//         value: fee.amount,
//         name: fee.name,
//         type: fee.feeType,
//         id: fee._id,
//         frequency: fee.frequency,
//       }));
//     } else {
//       console.error(
//         `Failed to fetch additional fees for class ${className}:`,
//         response?.data?.message
//       );
//       toast.error(`Failed to fetch additional fees for class ${className}.`);
//       return [];
//     }
//   } catch (error) {
//     console.error(
//       `Error fetching additional fees for class ${className}:`,
//       error
//     );
//     toast.error(
//       `Error fetching additional fees for class ${className}: ${error.message}`
//     );
//     return [];
//   }
// };


// const SibilingFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
//   const [responseData, setResponseData] = useState(null);
//   const [showChildForms, setShowChildForms] = useState(false);
//   const [selectedChildrenIndices, setSelectedChildrenIndices] = useState([]);
//   const [childFeeHistory, setChildFeeHistory] = useState(null);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showFormFlags, setShowFormFlags] = useState([]);
//   const [triggerRefresh, setTriggerRefresh] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const authToken = localStorage.getItem("token");
//   const [pdfModalOpen, setPdfModalOpen] = useState(false);
//   const [unifiedReceiptModalOpen, setUnifiedReceiptModalOpen] = useState(false);
//   const [unifiedReceiptData, setUnifiedReceiptData] = useState(null);
//   const [receiptData, setReceiptData] = useState(null);
//   const [isPreviewReady, setIsPreviewReady] = useState(false);

//   // --- NEW STATE FOR UNIFIED PAYMENT ---
//   const [isUnifiedMode, setIsUnifiedMode] = useState(false);
//   const [unifiedPaymentData, setUnifiedPaymentData] = useState({
//     totalAmount: "",
//     concession: "",
//     date: moment().format("YYYY-MM-DD"),
//     paymentMode: "Cash",
//     transactionId: "",
//     chequeBookNo: "",
//     remarks: "",
//   });
//   // --- END NEW STATE ---

//   const allMonths = [
//     "April", "May", "June", "July", "August", "September",
//     "October", "November", "December", "January", "February", "March",
//   ];

//   const getAllStudent = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       setAllStudent(response?.students?.data || []);
//     } catch (error) {
//       console.error("Failed to fetch student list:", error);
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader, session]);

//   useEffect(() => {
//     getAllStudent();
//   }, [getAllStudent, triggerRefresh]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.studentName &&
//           student.studentName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//     setSearchTermbyadmissionNo("");
//   };

//   const handleSearchbyAdmissionNo = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTermbyadmissionNo(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.admissionNumber &&
//           student.admissionNumber.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//     setSearchTerm("");
//   };

//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `${
//           process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//         }/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         console.error(`Fee info fetch failed for student ID ${studentId}:`, response.data.message || "Unknown error");
//         toast.error(`Fee info fetch failed for student ID ${studentId}: ${response.data.message || "Unknown error"}`);
//         return null;
//       }
//     } catch (error) {
//       console.error(`Error fetching fee info for student ID ${studentId}:`, error);
//       toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
//       return null;
//     }
//   };

//   const resetState = () => {
//     setSelectedChildrenIndices([]);
//     setChildFeeHistory(null);
//     setShowFormFlags([]);
//     setParentData([]);
//     setFormData([]);
//     setSearchTerm("");
//     setSearchTermbyadmissionNo("");
//     setFilteredStudents([]);
//     setShowChildForms(false);
//     setResponseData(null);
//     setIsMessageModalOpen(false);
//     setPdfModalOpen(false);
//     setUnifiedReceiptModalOpen(false);
//     setUnifiedReceiptData(null);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//     // --- RESET UNIFIED STATE ---
//     setIsUnifiedMode(false);
//     setUnifiedPaymentData({
//       totalAmount: "", concession: "", date: moment().format("YYYY-MM-DD"),
//       paymentMode: "Cash", transactionId: "", chequeBookNo: "", remarks: "",
//     });
//     // --- END RESET UNIFIED STATE ---
//   };
  
//   const handleStudentClick = async (parentId) => {
//     console.log(`handleStudentClick called for parentId: ${parentId}`);
//     setIsLoader(true);
//     resetState(); 
//     try {
//       const parentResponse = await parentandchildwithID(parentId);
//       if (!parentResponse?.success) {
//         console.error("Failed to fetch parent/child data:", parentResponse?.message);
//         toast.error(parentResponse?.message || "Failed to fetch parent/child data.");
//         setIsLoader(false);
//         return;
//       }

//       const children = parentResponse?.children || [];
//       if (children.length === 0) {
//         toast.info("No children found for this parent.");
//         setIsLoader(false);
//         return;
//       }

//       setParentData(children);

//       const promises = children.map((child) =>
//         Promise.all([
//           fetchStudentFeeInfo(child.studentId),
//           fetchAdditionalFeesForClass(child.class, authToken),
//         ])
//       );

//       const results = await Promise.all(promises);
     
//       const initialFormData = [];
//       //const initialShowFormFlags = []; // Will be set later based on default selection

//       results.forEach(([feeInfo, availableAdditionalFees], index) => {
//         const child = children[index];
//         if (!feeInfo) {
//           initialFormData.push({
//             admissionNumber: child.admissionNumber, studentId: child.studentId,
//             studentName: child.studentName, className: child.class, error: true,
//           });
//           return;
//         }

//         const regularFeeAmount = feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
//         const additionalFeesStructure = feeInfo.feeStructure?.additionalFees || [];
//         const monthlyStatus = feeInfo.monthlyStatus || [];
//         const feeHistory = feeInfo.feeStatus?.feeHistory || [];
//         const monthlyDues = feeInfo.feeStatus?.monthlyDues || { regularDues: [], additionalDues: [] };
//         const oneTimeAdditionalDues = feeInfo.oneTimeAdditionalDues || [];

//         const regularFees = allMonths.map((month) => {
//           const monthData = monthlyStatus.find((m) => m.month === month);
//           const dueData = monthlyDues.regularDues.find((d) => d.month === month);
//           const due = dueData ? dueData.dueAmount : (monthData?.regularFee?.status === "Paid" ? 0 : regularFeeAmount);
//           const status = dueData ? dueData.status : (monthData?.regularFee?.status || "Unpaid");
//           return {
//             month, paidAmount: dueData?.paidAmount || monthData?.regularFee?.paid || "",
//             dueAmount: due, totalAmount: regularFeeAmount, status,
//             label: `${month} (Due: ₹${due.toFixed(2)})`,
//           };
//         });

//         const preSelectedMonths = [];
//         monthlyStatus.forEach((monthData) => {
//           if (monthData.regularFee.due > 0 && monthData.regularFee.status !== "Paid") {
//             const dueData = monthlyDues.regularDues.find((d) => d.month === monthData.month);
//             if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
//               const originalFee = regularFees.find((rf) => rf.month === monthData.month);
//               if (originalFee) {
//                 preSelectedMonths.push({ value: monthData.month, label: originalFee.label, due: dueData.dueAmount });
//               }
//             }
//           }
//         });
        
//         const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
//           name: fee.name, type: fee.feeType, frequency: fee.frequency, amount: fee.amount,
//           months: allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             const addFee = monthData?.additionalFees?.find((af) => af.name === fee.name);
//             const dueData = monthlyDues.additionalDues.find((d) => d.name === fee.name && d.month === month);
//             const due = dueData ? dueData.dueAmount : (addFee?.status === "Paid" ? 0 : fee.amount);
//             const status = dueData ? dueData.status : (addFee?.status || "Unpaid");
//             return { month, paidAmount: dueData?.paidAmount || addFee?.paid || "", dueAmount: due, totalAmount: fee.amount, status };
//           }),
//         }));

//         const preSelectedAdditionalFees = [];
//         monthlyStatus.forEach((monthData) => {
//           monthData.additionalFees?.forEach((fee) => {
//             if (fee.due > 0 && fee.status !== "Paid" && fee.frequency === "monthly") {
//               const dueData = monthlyDues.additionalDues.find((d) => d.name === fee.name && d.month === monthData.month);
//               if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
//                 const feeStructure = additionalFeesStructure.find((fs) => fs.name === fee.name && fs.frequency === "monthly");
//                 if (feeStructure) {
//                   const availableFeeOption = availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
//                   if (availableFeeOption) {
//                     const isMonthPreSelected = preSelectedMonths.some((m) => m.value === monthData.month);
//                     if (isMonthPreSelected) {
//                       const existingFee = preSelectedAdditionalFees.find((pf) => pf.name === fee.name && pf.frequency === "monthly");
//                       if (existingFee) {
//                         if (!existingFee.dueMonths.includes(monthData.month)) {
//                           existingFee.dueMonths.push(monthData.month);
//                           existingFee.amount += dueData.dueAmount;
//                         }
//                       } else {
//                         preSelectedAdditionalFees.push({
//                           id: availableFeeOption.id, name: availableFeeOption.name, amount: dueData.dueAmount,
//                           type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths: [monthData.month],
//                         });
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           });
//         });
        
//         const preSelectedOneTimeFees = [];
//         oneTimeAdditionalDues.forEach((fee) => {
//           if (fee.dueAmount > 0 && fee.status !== "Paid") {
//             const feeStructure = additionalFeesStructure.find((fs) => fs.name === fee.name && fs.frequency === "one-time");
//             if (feeStructure) {
//               preSelectedOneTimeFees.push({ name: fee.name, dueAmount: fee.dueAmount, frequency: feeStructure.frequency });
//             }
//           }
//         });

//         const oneTimeFeeOptions = additionalFeesStructure
//           .filter((fee) => fee.feeType === "One Time" && fee.frequency === "one-time")
//           .filter((fee) => {
//             const isPaidInHistory = feeHistory.some((history) => history.additionalFees.some((af) => af.name === fee.name && af.status === "Paid" && af.dueAmount === 0));
//             const isPaidInDues = monthlyDues.additionalDues.some((d) => d.name === fee.name && d.status === "Paid" && d.dueAmount === 0);
//             const isExemptInDues = monthlyDues.additionalDues.some((d) => d.name === fee.name && d.status === "Exempt" && d.dueAmount === 0);
//             return !isPaidInHistory && !isPaidInDues && !isExemptInDues;
//           })
//           .map((fee) => {
//             const dueFee = oneTimeAdditionalDues.find((d) => d.name === fee.name);
//             const dueAmount = dueFee ? dueFee.dueAmount : fee.amount;
//             return { label: `${fee.name} (Due: ₹${dueAmount.toFixed(2)})`, name: fee.name, code: fee.name, dueAmount, type: fee.feeType, frequency: fee.frequency };
//           });

//         initialFormData.push({
//           admissionNumber: child.admissionNumber, studentId: child.studentId, studentName: child.studentName,
//           className: child.class, classFee: regularFeeAmount, totalAmount: "",
//           selectedMonths: preSelectedMonths, selectedAdditionalFees: preSelectedAdditionalFees,
//           selectedOneTimeFees: preSelectedOneTimeFees, paymentMode: "Cash", transactionId: "",
//           chequeBookNo: "", lateFine: feeInfo.feeStatus?.totalLateFines || 0, concession: "", exemption: "",
//           isExempt: false, date: moment().format("YYYY-MM-DD"), remarks: "", monthlyDues,
//           additionalFeeDetails, pastDues: feeInfo.feeStatus?.pastDues || 0, totalDues: feeInfo.feeStatus?.dues || 0,
//           regularFees, availableAdditionalFees: availableAdditionalFees || [], oneTimeFeeOptions, feeInfo, error: false,
//         });
//       });
      
//       setFormData(initialFormData);

//       // --- MODIFIED FOR DEFAULT SELECTION & UNIFIED MODE ---
//       if (children.length > 0) {
//         const allIndices = children.map((_, i) => i);
//         const allFormsVisible = children.map(() => true);
        
//         setSelectedChildrenIndices(allIndices); // Select all children by default
//         setShowFormFlags(allFormsVisible);     // Show all forms by default
        
//         if (initialFormData.length > 0 && initialFormData[0] && !initialFormData[0].error) {
//             setChildFeeHistory(initialFormData[0]?.feeInfo || null);
//         }

//         if (children.length > 1) {
//             setIsUnifiedMode(true);
//             // Initialize unifiedPaymentData from the first child or defaults
//             // Clear individual concessions if in unified mode as per new logic
//             const updatedInitialFormData = initialFormData.map(fd => ({...fd, concession: "" }));
//             setFormData(updatedInitialFormData);

//             const firstChildData = updatedInitialFormData.length > 0 && updatedInitialFormData[0] && !updatedInitialFormData[0].error ? updatedInitialFormData[0] : {};
//             setUnifiedPaymentData({
//                 totalAmount: "", // User will input this for all
//                 concession: "", // Unified concession
//                 date: firstChildData.date || moment().format("YYYY-MM-DD"),
//                 paymentMode: firstChildData.paymentMode || "Cash",
//                 transactionId: firstChildData.transactionId || "",
//                 chequeBookNo: firstChildData.chequeBookNo || "",
//                 remarks: firstChildData.remarks || "",
//             });
//         } else {
//             setIsUnifiedMode(false); // Single child, not unified mode
//         }
//       }
//       // --- END MODIFICATION ---
//       setShowChildForms(true);
//     } catch (error) {
//       console.error("An error occurred during handleStudentClick:", error);
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const handleChildSelection = (index) => {
//     if (!formData || index < 0 || index >= formData.length) {
//       toast.error("An internal error occurred. Please try again.");
//       return;
//     }
//     const currentChildData = formData[index];
//     if (!currentChildData || currentChildData.error) {
//       toast.warn(`Cannot select ${parentData[index]?.studentName || "this student"}. Fee data may be missing.`);
//       return;
//     }

//     const isCurrentlySelected = selectedChildrenIndices.includes(index);
//     let updatedSelectedChildren;
//     let updatedShowFormFlags = [...showFormFlags];

//     if (isCurrentlySelected) {
//       updatedSelectedChildren = selectedChildrenIndices.filter((i) => i !== index);
//       updatedShowFormFlags[index] = false;
//     } else {
//       updatedSelectedChildren = [...selectedChildrenIndices, index];
//       updatedShowFormFlags[index] = true;
//     }
//     updatedSelectedChildren.sort((a, b) => a - b);

//     setSelectedChildrenIndices(updatedSelectedChildren);
//     setShowFormFlags(updatedShowFormFlags);

//     // --- UPDATE UNIFIED MODE ---
//     const newIsUnifiedMode = updatedSelectedChildren.length > 1;
//     if (isUnifiedMode !== newIsUnifiedMode) {
//         setIsUnifiedMode(newIsUnifiedMode);
//         if (newIsUnifiedMode) {
//             // Entering unified mode: clear individual concessions, set unified ones
//             const clearedFormData = formData.map(fd => ({...fd, concession: ""}));
//             setFormData(clearedFormData);
            
//             // Optionally, re-initialize unifiedPaymentData from the first selected child
//             if (updatedSelectedChildren.length > 0) {
//                 const firstSelectedChildIndex = updatedSelectedChildren[0];
//                 const firstChildData = clearedFormData[firstSelectedChildIndex];
//                 if (firstChildData && !firstChildData.error) {
//                      setUnifiedPaymentData(prev => ({
//                         ...prev, // Keep existing totalAmount if user typed
//                         // concession: "", // This is now the unified concession field
//                         date: firstChildData.date || moment().format("YYYY-MM-DD"),
//                         paymentMode: firstChildData.paymentMode || "Cash",
//                         transactionId: firstChildData.transactionId || "",
//                         chequeBookNo: firstChildData.chequeBookNo || "",
//                         remarks: firstChildData.remarks || "",
//                     }));
//                 }
//             }
//         } else {
//              // Exiting unified mode: individual concessions might be re-enabled (UI logic)
//              // unifiedPaymentData.concession can be cleared or left as is
//              setUnifiedPaymentData(prev => ({...prev, concession: ""}));
//         }
//     }
//     // --- END UPDATE UNIFIED MODE ---

//     if (updatedSelectedChildren.length > 0) {
//       const firstSelectedIndex = updatedSelectedChildren[0];
//       setChildFeeHistory(formData[firstSelectedIndex]?.feeInfo || null);
//     } else {
//       setChildFeeHistory(null);
//     }
//   };
  
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) {
//       updatedFormData[index] = { ...updatedFormData[index], [field]: value };

//       if (field === "paymentMode") {
//         if (value !== "Online" && value !== "Card") updatedFormData[index].transactionId = "";
//         if (value !== "Cheque") updatedFormData[index].chequeBookNo = "";
//       }

//       if (field === "isExempt") {
//         if (value) { // Exempt is true
//           const data = updatedFormData[index];
//           let total = 0;
//           total += parseFloat(data.pastDues) || 0;
//           total += parseFloat(data.lateFine) || 0;
//           total += data.selectedMonths.reduce((sum, monthState) => sum + (monthState?.due || 0), 0);
//           total += data.selectedAdditionalFees.reduce((sum, fee) => {
//             if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//               return sum + fee.dueMonths.reduce((monthSum, month) => {
//                 const feeDetail = data.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//                 if (feeDetail) {
//                   const monthData = feeDetail.months.find((m) => m.month === month);
//                   return monthSum + (monthData?.dueAmount || 0);
//                 }
//                 return monthSum;
//               }, 0);
//             } else if (fee.frequency === "one-time") {
//               const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find((d) => d.name === fee.name);
//               return sum + (oneTimeDue ? oneTimeDue.dueAmount : parseFloat(fee.amount) || 0);
//             }
//             return sum;
//           }, 0);
//           total += data.selectedOneTimeFees.reduce((sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0), 0);
//           const selectedMonthNames = data.selectedMonths.map((m) => m.value);
//           const selectedAdditionalFeeDues = data.selectedAdditionalFees.filter((fee) => fee.frequency === "monthly").flatMap((fee) => fee.dueMonths.map((month) => ({ name: fee.name, month })));
//           const remainingDues = data.monthlyDues.additionalDues.filter((due) => {
//             const feeStructure = data.feeInfo?.feeStructure?.additionalFees?.find((fs) => fs.name === due.name);
//             return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) &&
//                     !selectedAdditionalFeeDues.some((selected) => selected.name === due.name && selected.month === due.month) &&
//                     feeStructure?.frequency === "monthly");
//           }).reduce((sum, due) => sum + due.dueAmount, 0);
//           total += remainingDues;
//           total -= parseFloat(data.concession) || 0; // Individual concession
//           updatedFormData[index].exemption = Math.max(0, total).toFixed(2);
//           updatedFormData[index].totalAmount = "0"; // If exempt, student pays 0
//         } else { // Exempt is false
//           updatedFormData[index].exemption = "";
//           // totalAmount might need recalculation or user input
//         }
//       }
//       setFormData(updatedFormData);
//     }
//   };

//   // --- NEW UNIFIED INPUT HANDLER ---
//   const handleUnifiedInputChange = (field, value) => {
//     setUnifiedPaymentData(prev => {
//         const newState = { ...prev, [field]: value };
//         if (field === "paymentMode") {
//             if (value !== "Online" && value !== "Card") newState.transactionId = "";
//             if (value !== "Cheque") newState.chequeBookNo = "";
//         }
//         return newState;
//     });
//   };
//   // --- END NEW UNIFIED INPUT HANDLER ---

//   const handleMonthMultiSelectChange = (index, name, selectedOptions) => {
//     const selectedOptionsData = selectedOptions || [];
//     let updatedFormData = [...formData]; // Use let for potential re-assignment

//     if (!updatedFormData[index]) return;
//     const currentChildData = updatedFormData[index];

//     const selectedMonthNames = selectedOptionsData.map((opt) => opt.code);
//     if (selectedMonthNames.length > 1) {
//       const indicesInAllMonths = selectedMonthNames.map((month) => allMonths.indexOf(month)).sort((a, b) => a - b);
//       let isSequential = true;
//       for (let i = 1; i < indicesInAllMonths.length; i++) {
//         if (indicesInAllMonths[i] !== indicesInAllMonths[i - 1] + 1) {
//           isSequential = false;
//           break;
//         }
//       }
//       if (!isSequential) {
//         toast.warn("Please select months in a continuous sequence.");
//         return;
//       }
//     }

//     const newSelectedMonths = selectedOptionsData.map((opt) => {
//       const originalFee = currentChildData.regularFees.find((fee) => fee.month === opt.code);
//       if (!originalFee) return null;
//       return { value: originalFee.month, label: originalFee.label, due: originalFee.dueAmount };
//     }).filter(Boolean);

//     updatedFormData[index].selectedMonths = newSelectedMonths;

//     // Auto-select monthly additional fees for the current child
//     const newSelectedAdditionalFees = [];
//     const structuredMonthlyAddFees = currentChildData.feeInfo?.feeStructure?.additionalFees?.filter((fee) => fee.frequency === "monthly") || [];
//     structuredMonthlyAddFees.forEach((fee) => {
//       const availableFeeOption = currentChildData.availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
//       if (availableFeeOption) {
//         const feeDetail = currentChildData.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//         if (!feeDetail) return;
//         const dueMonths = newSelectedMonths.map((m) => {
//           const monthData = feeDetail.months.find((fm) => fm.month === m.value);
//           if (monthData && monthData.dueAmount > 0) return monthData.month;
//           return null;
//         }).filter(Boolean);
//         if (dueMonths.length > 0) {
//           const totalAmount = dueMonths.reduce((sum, month) => {
//             const monthData = feeDetail.months.find((fm) => fm.month === month);
//             return sum + (monthData?.dueAmount || 0);
//           }, 0);
//           newSelectedAdditionalFees.push({
//             id: availableFeeOption.id, name: availableFeeOption.name, amount: totalAmount,
//             type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths,
//           });
//         }
//       }
//     });
//     const existingOneTimeFees = currentChildData.selectedAdditionalFees.filter((fee) => fee.frequency === "one-time");
//     updatedFormData[index].selectedAdditionalFees = [...newSelectedAdditionalFees, ...existingOneTimeFees];

//     // --- SYNCHRONIZE MONTHS FOR OTHER SELECTED SIBLINGS IN UNIFIED MODE ---
//     if (isUnifiedMode && selectedChildrenIndices.length > 1) {
//         selectedChildrenIndices.forEach(siblingIndex => {
//             if (siblingIndex !== index && updatedFormData[siblingIndex] && !updatedFormData[siblingIndex].error) {
//                 const siblingCurrentData = updatedFormData[siblingIndex];
                
//                 // Sync selectedMonths for sibling
//                 const synchronizedSiblingMonths = newSelectedMonths.map(masterMonth => {
//                     const siblingMonthFeeData = siblingCurrentData.regularFees.find(rf => rf.month === masterMonth.value);
//                     // Only select if the sibling has a due for that month
//                     if (siblingMonthFeeData && siblingMonthFeeData.dueAmount > 0) {
//                         return { value: siblingMonthFeeData.month, label: siblingMonthFeeData.label, due: siblingMonthFeeData.dueAmount };
//                     }
//                     return null;
//                 }).filter(Boolean);
//                 updatedFormData[siblingIndex].selectedMonths = synchronizedSiblingMonths;

//                 // Sync (auto-select) additional monthly fees for sibling
//                 const newSelectedAdditionalFeesSibling = [];
//                 const structuredMonthlyAddFeesSibling = siblingCurrentData.feeInfo?.feeStructure?.additionalFees?.filter((f) => f.frequency === "monthly") || [];
//                 structuredMonthlyAddFeesSibling.forEach((fee) => {
//                     const availableFeeOption = siblingCurrentData.availableAdditionalFees.find((opt) => opt.name === fee.name && opt.frequency === "monthly");
//                     if (availableFeeOption) {
//                         const feeDetail = siblingCurrentData.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//                         if (!feeDetail) return;
//                         const dueMonths = synchronizedSiblingMonths.map((m) => { // Use synced months for this sibling
//                             const monthData = feeDetail.months.find((fm) => fm.month === m.value);
//                             if (monthData && monthData.dueAmount > 0) return monthData.month;
//                             return null;
//                         }).filter(Boolean);
//                         if (dueMonths.length > 0) {
//                             const totalAmount = dueMonths.reduce((sum, month) => {
//                                 const monthData = feeDetail.months.find((fm) => fm.month === month);
//                                 return sum + (monthData?.dueAmount || 0);
//                             }, 0);
//                             newSelectedAdditionalFeesSibling.push({
//                                 id: availableFeeOption.id, name: availableFeeOption.name, amount: totalAmount,
//                                 type: availableFeeOption.type, frequency: availableFeeOption.frequency, dueMonths,
//                             });
//                         }
//                     }
//                 });
//                 const existingOneTimeFeesSibling = siblingCurrentData.selectedAdditionalFees.filter((f) => f.frequency === "one-time");
//                 updatedFormData[siblingIndex].selectedAdditionalFees = [...newSelectedAdditionalFeesSibling, ...existingOneTimeFeesSibling];
//             }
//         });
//     }
//     // --- END SYNCHRONIZATION ---
//     setFormData(updatedFormData);
//   };

//   const handleDynamicMultiSelectChange = (index, field, selectedOptions) => {
//     const updatedFormData = [...formData];
//     if (!updatedFormData[index]) return;
//     const currentChildData = updatedFormData[index];

//     if (field === "selectedAdditionalFees") {
//       const newSelectedAdditionalFees = (selectedOptions || []).map((opt) => {
//         const originalFee = currentChildData.availableAdditionalFees.find((fee) => fee.id === opt.code && fee.frequency === "monthly");
//         if (originalFee) {
//           return {
//             id: originalFee.id, name: originalFee.name, amount: originalFee.value,
//             type: originalFee.type, frequency: originalFee.frequency,
//             dueMonths: originalFee.frequency === "monthly" ? currentChildData.selectedMonths.map((m) => m.value) : [],
//           };
//         }
//         return null;
//       }).filter(Boolean);
//       const existingFees = currentChildData.selectedAdditionalFees.filter((fee) => fee.frequency === "one-time");
//       updatedFormData[index].selectedAdditionalFees = [...newSelectedAdditionalFees, ...existingFees];
//     } else if (field === "selectedOneTimeFees") {
//       const newSelectedOneTimeFees = (selectedOptions || []).map((opt) => {
//         const originalFee = currentChildData.oneTimeFeeOptions.find((fee) => fee.code === opt.code);
//         if (originalFee) {
//           return { name: originalFee.name, dueAmount: originalFee.dueAmount, frequency: originalFee.frequency };
//         }
//         return null;
//       }).filter(Boolean);
//       updatedFormData[index].selectedOneTimeFees = newSelectedOneTimeFees;
//     }
//     setFormData(updatedFormData);
//   };

//   const calculateNetPayableAmount = useCallback((index) => {
//     const data = formData[index];
//     if (!data || data.error) return 0;
//     let total = 0;
//     total += parseFloat(data.pastDues) || 0;
//     total += parseFloat(data.lateFine) || 0;
//     total += data.selectedMonths.reduce((sum, monthState) => sum + (monthState?.due || 0), 0);
//     total += data.selectedAdditionalFees.reduce((sum, fee) => {
//       if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//         return sum + fee.dueMonths.reduce((monthSum, month) => {
//           const feeDetail = data.additionalFeeDetails.find((fd) => fd.name === fee.name && fd.frequency === "monthly");
//           if (feeDetail) {
//             const monthData = feeDetail.months.find((m) => m.month === month);
//             return monthSum + (monthData?.dueAmount || 0);
//           }
//           return monthSum;
//         }, 0);
//       } else if (fee.frequency === "one-time") {
//         const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find((d) => d.name === fee.name);
//         return sum + (oneTimeDue ? oneTimeDue.dueAmount : parseFloat(fee.amount) || 0);
//       }
//       return sum;
//     }, 0);
//     total += data.selectedOneTimeFees.reduce((sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0), 0);
//     const selectedMonthNames = data.selectedMonths.map((m) => m.value);
//     const selectedAdditionalFeeDues = data.selectedAdditionalFees.filter((fee) => fee.frequency === "monthly").flatMap((fee) => fee.dueMonths.map((month) => ({ name: fee.name, month })));
//     const remainingDues = data.monthlyDues.additionalDues.filter((due) => {
//       const feeStructure = data.feeInfo?.feeStructure?.additionalFees?.find((fs) => fs.name === due.name);
//       return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) &&
//               !selectedAdditionalFeeDues.some((selected) => selected.name === due.name && selected.month === due.month) &&
//               feeStructure?.frequency === "monthly");
//     }).reduce((sum, due) => sum + due.dueAmount, 0);
//     total += remainingDues;
    
//     // In unified mode, individual concession is ignored (set to 0), global one applies before distribution.
//     // Otherwise, use individual concession.
//     if (!isUnifiedMode) {
//         total -= parseFloat(data.concession) || 0;
//     }
//     total -= parseFloat(data.exemption) || 0;
//     return Math.max(0, total);
//   }, [formData, isUnifiedMode]); // Added isUnifiedMode dependency

//   const calculateAutoDistribution = useCallback((index, amountPaidOverride = null) => {
//     const data = formData[index];
//     if (!data || data.error) return { remainingAfterDistribution: 0, remainingDues: 0 };
    
//     const netPayable = calculateNetPayableAmount(index); // This now respects isUnifiedMode for concession
    
//     // In unified mode, amountPaidOverride will be the distributed amount for this child.
//     // In single mode, it's null, so use data.totalAmount.
//     const totalAmountPaid = amountPaidOverride !== null ? amountPaidOverride : (parseFloat(data.totalAmount) || 0);
    
//     const remainingDues = Math.max(0, netPayable - totalAmountPaid);
//     const remainingAfterDistribution = Math.max(0, totalAmountPaid - netPayable);
//     return { remainingAfterDistribution, remainingDues };
//   }, [formData, calculateNetPayableAmount, isUnifiedMode]); // Added isUnifiedMode

//   const fetchReceiptData = async (receiptNumber, isUnifiedRec = false) => {
//     // ... (existing implementation)
//     setIsPreviewReady(false);
//     setIsLoader(true);
//     try {
//       const url = isUnifiedRec
//         ? `${
//             process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//           }/api/v1/fees/unified-receipts?unifiedReceiptNumber=${receiptNumber}`
//         : `${
//             process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//           }/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`;
//       const response = await axios.get(url, {
//         headers: { Authorization: `Bearer ${authToken}` },
//       });
//       if (response.data.success) {
//         setReceiptData(response.data);
//         setIsPreviewReady(true);
//         return response.data;
//       } else {
//         toast.error(`Failed to fetch receipt data: ${response.data.message || "Unknown error"}`);
//         return null;
//       }
//     } catch (error) {
//       // ... (existing error handling with fallback) ...
//       console.error(`Error fetching receipt data ${receiptNumber}:`, error);
//       if (isUnifiedRec && error.response?.status === 404) {
//         // Fallback to single receipt if unified receipt fails (though less likely for unified number)
//         try {
//           const fallbackResponse = await axios.get(
//             `${
//               process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//             }/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`, // This might be wrong if it was truly a unified #
//             { headers: { Authorization: `Bearer ${authToken}` } }
//           );
//           if (fallbackResponse.data.success) {
//             setReceiptData(fallbackResponse.data);
//             setIsPreviewReady(true);
//             return fallbackResponse.data;
//           } else {
//             toast.error(`Fallback receipt fetch failed: ${fallbackResponse.data.message || "Unknown error"}`);
//             return null;
//           }
//         } catch (fallbackError) {
//           toast.error("Error fetching receipt data: " + fallbackError.message);
//           return null;
//         }
//       } else {
//         toast.error("Error fetching receipt data: " + error.message);
//         return null;
//       }
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const validateFormData = (childFormData, child, isUnifiedValidation = false) => {
//     if (!childFormData || childFormData.error) {
//       toast.error(`Cannot submit for ${child?.studentName || "this student"} due to missing data.`);
//       return false;
//     }
  
//     // For unified validation, skip totalAmount check on childFormData
//     // Exemption logic is handled per child even in unified.
//     if (childFormData.isExempt) {
//       const tempIndex = formData.findIndex(fd => fd.studentId === child.studentId);
//       // This calculation needs to use the correct concession (individual or none if unified global exists)
//       const netPayableForExemption = calculateNetPayableAmount(tempIndex); 
//       childFormData.exemption = netPayableForExemption.toFixed(2);
//       // childFormData.totalAmount = "0"; // This is implicitly handled by allocatedAmount being 0 if exempt
//     } else if (!isUnifiedValidation) { // Only validate totalAmount if NOT unified child validation
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;
//       if (totalAmount <= 0) {
//         toast.warn(`Please enter a valid amount (> 0) to pay for ${child.studentName}.`);
//         return false;
//       }
//     }
    
//     // These validations apply to the source of payment details (child form or unified form)
//     const paymentDataSource = isUnifiedValidation ? unifiedPaymentData : childFormData;

//     if (!paymentDataSource.paymentMode) {
//       toast.error(`Payment mode is required for ${child.studentName}.`);
//       return false;
//     }
//     if ((paymentDataSource.paymentMode === "Online" || paymentDataSource.paymentMode === "Card") && !paymentDataSource.transactionId) {
//       toast.error(`Transaction ID is required for Online/Card payment for ${child.studentName}.`);
//       return false;
//     }
//     if (paymentDataSource.paymentMode === "Cheque" && !paymentDataSource.chequeBookNo) {
//       toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}.`);
//       return false;
//     }
//     if (!paymentDataSource.date || !moment(paymentDataSource.date, "YYYY-MM-DD", true).isValid()) {
//       toast.error(`Please select a valid payment date for ${child.studentName}.`);
//       return false;
//     }

//     // Concession and exemption validation (applies per child from their own data)
//     const concession = isUnifiedValidation ? 0 : (parseFloat(childFormData.concession) || 0); // Use 0 if global unified concession applies
//     const exemption = parseFloat(childFormData.exemption) || 0;
//     if (concession < 0) {
//         toast.warn(`Concession amount cannot be negative for ${child.studentName}.`);
//         return false;
//     }
//     if (exemption < 0) {
//       toast.warn(`Exemption amount cannot be negative for ${child.studentName}.`);
//       return false;
//     }
  
//     // This warning about paying more than dues without selection applies mainly to single payments
//     if (!isUnifiedValidation && !childFormData.isExempt && parseFloat(childFormData.totalAmount) > 0 &&
//         childFormData.selectedMonths.length === 0 &&
//         childFormData.selectedAdditionalFees.length === 0 &&
//         childFormData.selectedOneTimeFees.length === 0) {
        
//         const tempIndex = formData.findIndex(fd => fd.studentId === child.studentId);
//         const onlyPayingDuesAndFines = (parseFloat(formData[tempIndex].pastDues) || 0) + (parseFloat(formData[tempIndex].lateFine) || 0);
//         // if (parseFloat(childFormData.totalAmount) > onlyPayingDuesAndFines) {
//         //     toast.warn(`Amount paid for ${child.studentName} exceeds past dues/fines, but no specific month/fee selected. Select items or add remark for advance.`);
//         //     return false;
//         // }
//     }
//     return true;
//   };

//   const handleUnifiedFeePayment = async () => {
//     if (!isUnifiedMode || selectedChildrenIndices.length < 2) {
//       toast.warn("Please select at least two students for unified payment.");
//       return;
//     }

//     // Validate unified payment fields first
//     if (!unifiedPaymentData.paymentMode) { toast.error("Unified Payment mode is required."); return; }
//     if ((unifiedPaymentData.paymentMode === "Online" || unifiedPaymentData.paymentMode === "Card") && !unifiedPaymentData.transactionId) { toast.error("Unified Transaction ID is required."); return; }
//     if (unifiedPaymentData.paymentMode === "Cheque" && !unifiedPaymentData.chequeBookNo) { toast.error("Unified Cheque Number is required."); return; }
//     if (!unifiedPaymentData.date || !moment(unifiedPaymentData.date, "YYYY-MM-DD", true).isValid()) { toast.error("Please select a valid unified payment date."); return; }
    
//     const unifiedTotalAmountPaidNum = parseFloat(unifiedPaymentData.totalAmount) || 0;
//     const unifiedConcessionNum = parseFloat(unifiedPaymentData.concession) || 0;

//     if (unifiedConcessionNum < 0) { toast.error("Unified concession cannot be negative."); return; }

//     // Check if any student is exempt, if so total amount can be 0, otherwise must be > 0
//     const anyExempt = selectedChildrenIndices.some(index => formData[index].isExempt);
//     if (!anyExempt && unifiedTotalAmountPaidNum <= 0) {
//         toast.warn("Please enter a total amount (>0) to pay for the selected siblings.");
//         return;
//     }
//     if (unifiedTotalAmountPaidNum < unifiedConcessionNum) {
//         toast.error("Total amount paid cannot be less than the unified concession.");
//         return;
//     }

//     const studentsPaymentInfo = [];
//     let overallValidationPassed = true;

//     // Phase 1: Calculate net payables and handle exemptions for each selected child
//     for (const index of selectedChildrenIndices) {
//         const childFormData = formData[index];
//         const child = parentData[index];

//         if (!validateFormData(childFormData, child, true)) { // Pass true for unified context validation
//             overallValidationPassed = false;
//             break;
//         }
        
//         let netPayableForChild = calculateNetPayableAmount(index); // This uses child's exemption, and 0 for child's concession due to isUnifiedMode
//         let exemptionAmountForPayload = parseFloat(childFormData.exemption) || 0;

//         if (childFormData.isExempt) {
//             // If exempt, exemptionAmountForPayload is their full due, netPayable effectively becomes 0 for distribution.
//             exemptionAmountForPayload = netPayableForChild; 
//             netPayableForChild = 0; 
//         }
        
//         studentsPaymentInfo.push({
//             index,
//             studentId: child.studentId,
//             childFormData,
//             netPayableForDistribution: netPayableForChild, // Due after child's exemption
//             exemptionAmountForPayload, // Actual exemption value for API
//             isExempt: childFormData.isExempt,
//             allocatedAmount: 0,
//         });
//     }

//     if (!overallValidationPassed) return;

//     // Phase 2: Distribute the (Total Amount Paid - Unified Concession)
//     let amountToDistribute = unifiedTotalAmountPaidNum - unifiedConcessionNum;
//     amountToDistribute = Math.max(0, amountToDistribute); // Ensure non-negative

//     for (const studentInfo of studentsPaymentInfo) {
//         if (studentInfo.isExempt || studentInfo.netPayableForDistribution <= 0) {
//             studentInfo.allocatedAmount = 0; // No payment needed from distributable amount
//             continue;
//         }
//         if (amountToDistribute <= 0) break; // No more amount to distribute

//         const canAllocate = Math.min(studentInfo.netPayableForDistribution, amountToDistribute);
//         studentInfo.allocatedAmount = canAllocate;
//         amountToDistribute -= canAllocate;
//     }
    
//     // Phase 3: Construct payload
//     const studentsPayload = [];
//     for (const studentInfo of studentsPaymentInfo) {
//         const { childFormData, studentId, allocatedAmount, exemptionAmountForPayload } = studentInfo;

//         const additionalFeesPayload = [];
//         childFormData.selectedAdditionalFees.forEach((fee) => {
//             // Logic for what items are considered "paid" by the allocatedAmount is complex.
//             // Simplification: Send all selected items. API backend should sort out partials/full.
//             if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//                 fee.dueMonths.forEach((monthName) => {
//                     additionalFeesPayload.push({ name: fee.name, month: monthName });
//                 });
//             } else if (fee.frequency === "one-time") {
//                 additionalFeesPayload.push({ name: fee.name });
//             }
//         });
//         childFormData.selectedOneTimeFees.forEach((fee) => {
//             additionalFeesPayload.push({ name: fee.name });
//         });
        
//         studentsPayload.push({
//             studentId,
//             paymentDetails: {
//                 regularFees: childFormData.selectedMonths.map(ms => ({ month: ms.value })),
//                 additionalFees: additionalFeesPayload,
//                 pastDuesPaid: 0, // API likely recalculates this
//                 lateFinesPaid: 0, // API likely recalculates this
//                 concession: 0, // Individual concession is 0 in unified mode, global concession handled by total amount paid
//                 exemption: exemptionAmountForPayload,
//                 totalAmount: allocatedAmount, // Crucial: this is the distributed amount for THIS student
//             },
//         });
//     }
    
//     const finalUnifiedPaymentDetailsAPI = {
//         paymentMode: unifiedPaymentData.paymentMode,
//         transactionId: unifiedPaymentData.transactionId || undefined,
//         chequeNumber: unifiedPaymentData.chequeBookNo || undefined,
//         date: moment(unifiedPaymentData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
//         remark: unifiedPaymentData.remarks || "",
//         // The API needs to know the total concession applied if it's global
//         // Current feescreateUnifiedFeeStatus doesn't show a top-level concession.
//         // The effect of unified concession is already in the reduced `amountToDistribute`.
//         // The API must correctly reconcile (Sum of student totalAmounts) + unifiedConcession == unifiedTotalAmountPaid.
//     };

//     const payload = {
//         students: studentsPayload,
//         session,
//         unifiedPaymentDetails: finalUnifiedPaymentDetailsAPI,
//         // If API needs explicit total concession for the transaction:
//         // totalTransactionConcession: unifiedConcessionNum,
//     };

//     console.log("Unified Payload:", JSON.stringify(payload, null, 2));
//     setIsLoader(true);
//     try {
//       const response = await feescreateUnifiedFeeStatus(payload);
//       if (response.success) {
//         toast.success(response.message || "Unified fees submitted successfully!");
//         setUnifiedReceiptData(response.data);
//         setIsMessageModalOpen(true);
//       } else {
//         toast.error(response.message || "Unified fee submission failed.");
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || error.message;
//       toast.error(`Error during unified submission: ${errorMsg}`);
//     } finally {
//       setIsLoader(false);
//     }
//   };
  
//   const handleSubmit = async (e, childIndex) => {
//     e.preventDefault();
//     e.stopPropagation();
//     const childFormData = formData[childIndex];
//     const child = parentData[childIndex];
  
//     if (!validateFormData(childFormData, child, false)) { // Pass false for single payment validation
//       return;
//     }
//     setIsLoader(true);
  
//     const monthlyFeesPayload = [];
//     const oneTimeFeesPayload = [];
//     // ... (rest of existing handleSubmit logic for constructing additionalFeesPayload) ...
//     const selectedMonthNames = childFormData.selectedMonths.map((m) => m.value);
//     const selectedOneTimeFeeNames = childFormData.selectedOneTimeFees.map(fee => fee.name);
  
//     childFormData.selectedAdditionalFees.forEach((fee) => {
//       if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//         fee.dueMonths.forEach((monthName) => {
//           const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(m => m.month === monthName);
//           const isFeeDueForThisMonth = monthStatus?.additionalFees?.some(mf => mf.name === fee.name && mf.status !== "Paid");
//           if (isFeeDueForThisMonth) {
//             monthlyFeesPayload.push({ name: fee.name, month: monthName });
//           }
//         });
//       }
//     });
  
//     const selectedAdditionalFeeDues = childFormData.selectedAdditionalFees
//       .filter(fee => fee.frequency === "monthly")
//       .flatMap(fee => fee.dueMonths.map(month => ({ name: fee.name, month })));
//     const remainingDues = childFormData.monthlyDues.additionalDues
//       .filter(due => {
//         const feeStructure = childFormData.feeInfo?.feeStructure?.additionalFees?.find(fs => fs.name === due.name);
//         return (
//           due.dueAmount > 0 &&
//           !selectedMonthNames.includes(due.month) &&
//           !selectedAdditionalFeeDues.some(selected => selected.name === due.name && selected.month === due.month) &&
//           feeStructure?.frequency === "monthly" &&
//           !selectedOneTimeFeeNames.includes(due.name) 
//         );
//       })
//       .map(due => ({ name: due.name, month: due.month }));
//     monthlyFeesPayload.push(...remainingDues);
  
//     childFormData.selectedOneTimeFees.forEach((fee) => {
//       oneTimeFeesPayload.push({ name: fee.name });
//     });
//     const additionalFeesPayload = [...monthlyFeesPayload, ...oneTimeFeesPayload];
    
//     let exemptionAmount = parseFloat(childFormData.exemption) || 0;
//     if (childFormData.isExempt) { // Recalculate based on current selections if exempt
//       exemptionAmount = calculateNetPayableAmount(childIndex);
//     }
  
//     const payload = {
//       studentId: child.studentId,
//       session,
//       paymentDetails: {
//         regularFees: childFormData.selectedMonths.map((monthState) => ({ month: monthState.value })),
//         additionalFees: additionalFeesPayload,
//         pastDuesPaid: 0, 
//         lateFinesPaid: 0,
//         concession: parseFloat(childFormData.concession) || 0, // Individual concession
//         exemption: exemptionAmount,
//         totalAmount: childFormData.isExempt ? 0 : (parseFloat(childFormData.totalAmount) || 0),
//         date: childFormData.date ? moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY") : moment(new Date()).format("DD-MM-YYYY"),
//         paymentMode: childFormData.paymentMode,
//         transactionId: childFormData.transactionId || undefined,
//         chequeNumber: childFormData.chequeBookNo || undefined,
//         remark: childFormData.remarks || "",
//       },
//     };
  
//     console.log("Single Submission Payload:", JSON.stringify(payload, null, 2));
//     try {
//       const response = await feescreateFeeStatus(payload);
//       if (response?.success) {
//         toast.success(response?.message || `Fees submitted successfully for ${child.studentName}!`);
//         setResponseData(response?.data);
//         setIsMessageModalOpen(true);
//       } else {
//         toast.error(response?.message || `Fee submission failed for ${child.studentName}.`);
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || error.message;
//       toast.error(`An error occurred during submission for ${child.studentName}: ${errorMsg}`);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   // handleCloseMessageModal, handleClosePdfModal, handleCloseUnifiedReceiptModal,
//   // handleDownloadPdf, handlePrintReceipt, sendMessage,
//   // handleDownloadUnifiedPdf, handlePrintUnifiedReceipt, sendUnifiedMessage
//   // remain largely the same, but ensure parentId for refresh is correctly obtained.

//   const handleCloseMessageModal = async (sendMsg = false) => {
//     setIsMessageModalOpen(false);
//     let receiptNumber = null;
//     let isUnifiedRec = false; // Renamed to avoid conflict
//     let dataForActions = null;
//     let parentIdForRefresh = null;

//     if (responseData) { // Single payment
//       receiptNumber = responseData.feeReceiptNumber;
//       isUnifiedRec = false;
//       dataForActions = responseData;
//       parentIdForRefresh = responseData?.student?.parentId;
//     } else if (unifiedReceiptData) { // Unified payment
//       receiptNumber = unifiedReceiptData.unifiedReceiptNumber;
//       isUnifiedRec = true;
//       dataForActions = unifiedReceiptData;
//       // Assuming unifiedReceiptData contains parentId or first student's parentId
//       parentIdForRefresh = unifiedReceiptData?.parentId || (unifiedReceiptData?.students?.[0]?.parentId); 
//     }

//     if (sendMsg && dataForActions) {
//       if (isUnifiedRec) sendUnifiedMessage(dataForActions);
//       else sendMessage(dataForActions);
//     }

//     const tempReceiptNumber = receiptNumber;
//     const tempIsUnified = isUnifiedRec;
    
//     // Reset general state before potentially refreshing specific student data
//     const currentSearchTerm = searchTerm;
//     const currentSearchTermAdm = searchTermbyadmissionNo;
//     const currentFiltered = filteredStudents;
    
//     resetState(); // This now also resets unified mode state

//     // Restore search state if needed, or decide if refresh should clear it
//     setSearchTerm(currentSearchTerm);
//     setSearchTermbyadmissionNo(currentSearchTermAdm);
//     setFilteredStudents(currentFiltered);


//     if (parentIdForRefresh) {
//       await handleStudentClick(parentIdForRefresh); // This will repopulate and set unified mode if applicable
//     } else {
//       setTriggerRefresh((prev) => !prev); // Fallback to general refresh
//     }

//     if (tempReceiptNumber) {
//       const fetchedReceiptData = await fetchReceiptData(tempReceiptNumber, tempIsUnified);
//       if (fetchedReceiptData) {
//         if (tempIsUnified) setUnifiedReceiptModalOpen(true);
//         else setPdfModalOpen(true);
//       }
//     }
//   };

//   const handleClosePdfModal = (action = null) => { /* ... existing ... */ };
//   const handleCloseUnifiedReceiptModal = (action = null) => { /* ... existing ... */ };
//   const handleDownloadPdf = (dataToUse) => { /* ... existing ... */ };
//   const handlePrintReceipt = (dataToUse) => { /* ... existing ... */ };
//   const sendMessage = (dataToUse) => { /* ... existing ... */ };
//   const handleDownloadUnifiedPdf = (dataToUse) => { /* ... existing ... */ };
//   const handlePrintUnifiedReceipt = (dataToUse) => { /* ... existing ... */ };
//   const sendUnifiedMessage = (dataToUse) => { /* ... existing ... */ };


//   return (
//     <div className="">
//       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Create Fee" />
//       <div className=" mx-auto">
//         <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row gap-4 ">
//           {/* Search inputs ... */}
//           <ReactInput
//             type="text" label="Search by Name" onChange={handleSearch} value={searchTerm}
//             containerClassName="flex-1 min-w-[200px]" className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//           />
//           <ReactInput
//             type="text" label="Search by Adm. No" onChange={handleSearchbyAdmissionNo} value={searchTermbyadmissionNo}
//             containerClassName="flex-1 min-w-[200px]" className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>

//         {filteredStudents.length > 0 && (
//           // Search results table ...
//           <div className="relative">
//             <div className="absolute z-30 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ">
//               <table className="w-full border-collapse">
//                 <thead className="bg-gray-100 sticky top-0 z-20">
//                   <tr>
//                   <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Adm No.</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Student Name</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Class</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Parent Name</th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">Contact</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredStudents.map((student) => (
//                     <tr key={student._id} className="cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out border-b border-gray-300"
//                       onClick={() => { handleStudentClick(student.parentId); setFilteredStudents([]); }}>
//                       <td className="p-1 text-[13px] text-grey-600">{student.admissionNumber}</td>
//                       <td className="p-1 font-semibold text-[13px] text-gray-800">{student.studentName}</td>
//                       <td className="p-1 text-[13px]  text-gray-600">{student.class}</td>
//                       <td className="p-1 text-[13px]  text-gray-600">{student.fatherName}</td>
//                       <td className="p-1 text-[13px]  text-gray-600">{student?.parentContact}</td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {showChildForms && parentData.length > 0 && (
//           <div className=" pt-2 border-t border-gray-200">
//             <div className="flex justify-between items-center mb-4">
//               <h5 className="text-sm font-semibold text-gray-800">
//                 Selected Student(s) Fee Payment
//               </h5>
//               {/* Pay for Siblings button only if unified mode and more than 1 selected */}
//               {isUnifiedMode && selectedChildrenIndices.length > 1 && (
//                 <Button
//                   name="Pay for Siblings Together"
//                   onClick={handleUnifiedFeePayment}
//                   className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
//                 />
//               )}
//             </div>

//             {/* --- UNIFIED PAYMENT DETAILS SECTION --- */}
//             {isUnifiedMode && selectedChildrenIndices.length > 1 && (
//                 <div className="mb-6 p-4 border border-blue-300 rounded-lg bg-blue-50 shadow">
//                     <h3 className="text-lg font-semibold text-blue-700 mb-3">Unified Payment Details</h3>
//                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//                         <ReactInput
//                             type="number" label="Total Amount to Pay (Unified)" value={unifiedPaymentData.totalAmount}
//                             onChange={(e) => handleUnifiedInputChange("totalAmount", e.target.value)}
//                             min="0.01" step="0.01" isRequired={true}
//                             containerClassName="w-full" className="w-full"
//                         />
//                         <ReactInput
//                             type="number" label="Unified Concession" value={unifiedPaymentData.concession}
//                             onChange={(e) => handleUnifiedInputChange("concession", e.target.value)}
//                             min="0" step="0.01"
//                             containerClassName="w-full" className="w-full"
//                         />
//                          <DatePicker
//                             className="custom-calendar" label="Payment Date (Unified)"
//                             name="unifiedDate" id="unifiedDate"
//                             value={unifiedPaymentData.date ? new Date(unifiedPaymentData.date) : new Date()}
//                             handleChange={(e) => handleUnifiedInputChange("date", e.target.value)}
//                         />
//                         <ReactSelect
//                             name="unifiedPaymentMode" label="Payment Mode (Unified)"
//                             value={unifiedPaymentData.paymentMode}
//                             handleChange={(e) => handleUnifiedInputChange("paymentMode", e.target.value)}
//                             dynamicOptions={[
//                                 { label: "Cash", value: "Cash" }, { label: "Online", value: "Online" },
//                                 { label: "Cheque", value: "Cheque" }, { label: "Card", value: "Card" },
//                             ]}
//                             containerClassName="w-full"
//                         />
//                         {(unifiedPaymentData.paymentMode === "Online" || unifiedPaymentData.paymentMode === "Card") && (
//                             <ReactInput type="text" label="Transaction ID (Unified)" value={unifiedPaymentData.transactionId}
//                                 onChange={(e) => handleUnifiedInputChange("transactionId", e.target.value)} isRequired={true}
//                                 containerClassName="w-full" className="w-full" />
//                         )}
//                         {unifiedPaymentData.paymentMode === "Cheque" && (
//                             <ReactInput type="text" label="Cheque Number (Unified)" value={unifiedPaymentData.chequeBookNo}
//                                 onChange={(e) => handleUnifiedInputChange("chequeBookNo", e.target.value)} isRequired={true}
//                                 containerClassName="w-full" className="w-full" />
//                         )}
//                          <div className="md:col-span-2 lg:col-span-1">
//                             <label className="block text-sm font-medium text-gray-700 mb-1">Remarks (Unified)</label>
//                             <textarea value={unifiedPaymentData.remarks}
//                                 onChange={(e) => handleUnifiedInputChange("remarks", e.target.value)}
//                                 className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                                 rows="1" placeholder="Optional remarks for unified payment..." />
//                         </div>
//                     </div>
//                 </div>
//             )}
//             {/* --- END UNIFIED PAYMENT DETAILS SECTION --- */}


//             <div className="flex flex-col gap-2">
//               {parentData.map((child, index) => {
//                 const currentFormData = formData[index];
//                 if (!currentFormData || currentFormData.error) {
//                   return ( /* Error display ... */ 
//                     <div key={child._id || index} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md" role="alert">
//                       <strong className="font-bold">Error:</strong>
//                       <span className="block sm:inline ml-2">Could not load fee data for {child.studentName || "this student"} (Adm: {child.admissionNumber || "N/A"}).</span>
//                     </div>
//                   );
//                 }

//                 const isSelected = selectedChildrenIndices.includes(index);
//                 const showForm = showFormFlags[index];
//                 // Options for dropdowns...
//                 const monthOptions = currentFormData.regularFees.filter(fee => fee.dueAmount > 0).map(fee => ({ name: fee.label, code: fee.month }));
//                 const selectedMonthValues = currentFormData.selectedMonths.map(monthState => ({ name: monthState.label, code: monthState.value }));
//                 const additionalFeeOptions = currentFormData.availableAdditionalFees.filter(fee => fee.frequency === "monthly").map(item => ({ name: item.label, code: item.id }));
//                 const selectedAdditionalFeeValues = currentFormData.selectedAdditionalFees.filter(fee => fee.frequency === "monthly").map(selectedFee => {
//                     const availableOption = additionalFeeOptions.find(opt => opt.code === selectedFee.id);
//                     return { name: availableOption ? availableOption.name : `${selectedFee.name} (${selectedFee.type}) - ₹${selectedFee.amount}`, code: selectedFee.id };
//                 });
//                 const oneTimeFeeOptions = currentFormData.oneTimeFeeOptions.map(item => ({ name: item.label, code: item.code }));
//                 const selectedOneTimeFeeValues = currentFormData.selectedOneTimeFees.map(fee => {
//                     const availableOption = oneTimeFeeOptions.find(opt => opt.code === fee.name);
//                     return { name: availableOption ? availableOption.name : `${fee.name} (Due: ₹${fee.dueAmount.toFixed(2)})`, code: fee.name };
//                 });

//                 // Determine if individual payment fields should be shown
//                 const showIndividualPaymentFields = !isUnifiedMode || selectedChildrenIndices.length <= 1;

//                 return (
//                   <div key={child._id || index} className={`bg-white rounded-lg shadow-md border transition-all duration-300 ${isSelected ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200 hover:border-gray-300"} overflow-hidden`}>
//                     <div className={`flex items-center px-4 py-1 border-b cursor-pointer`} onClick={() => handleChildSelection(index)}>
//                       <input type="checkbox" id={`child-checkbox-${index}`} checked={isSelected}
//                         onChange={(e) => { e.stopPropagation(); handleChildSelection(index); }}
//                         className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer" aria-labelledby={`child-label-${index}`} />
//                       <label id={`child-label-${index}`} className="flex-grow cursor-pointer" htmlFor={`child-checkbox-${index}`}>
//                         {/* Child header info... */}
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <span className="text-base font-semibold text-blue-800">{child.studentName}</span>
//                             <span className="text-sm text-gray-600 ml-2">(Class: {child.class} / Adm#: {child.admissionNumber})</span>
//                           </div>
//                           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isSelected ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-700"}`}>
//                             {isSelected ? "SELECTED" : "SELECT"}
//                           </span>
//                         </div>
//                         <div className="flex flex-wrap justify-start items-center gap-x-4 text-xs mt-1">
//                           <span className="text-red-600 font-medium">Total Dues: ₹{currentFormData?.totalDues?.toFixed(2) || "0.00"}</span>
//                           {currentFormData?.pastDues > 0 && <span className="text-purple-600 font-medium">Past Dues: ₹{currentFormData?.pastDues?.toFixed(2)}</span>}
//                           {currentFormData?.lateFine > 0 && <span className="text-orange-600 font-medium">Late Fine: ₹{currentFormData?.lateFine?.toFixed(2)}</span>}
//                           <span className="text-gray-600 font-medium">Base Fee: ₹{currentFormData?.classFee?.toFixed(2) || "0.00"}</span>
//                         </div>
//                       </label>
//                     </div>

//                     <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"}`}>
//                       {showForm && (
//                         <div className="px-1 py-1 border-t flex flex-col lg:flex-row gap-1 bg-white">
//                           <form onSubmit={(e) => handleSubmit(e, index)} className="flex-grow lg:w-2/3 space-y-5 mb-6 lg:mb-0" noValidate>
//                             {/* Fee selection dropdowns ... */}
//                              <div className="border rounded-md p-1 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
//                               <div className="md:col-span-1">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Fees</label>
//                                 <DynamicMultiSelect name={`regularFees-${index}`} searchable={false} placeholderName="Select month(s)..."
//                                   dynamicOptions={monthOptions} value={selectedMonthValues}
//                                   handleChange={(name, opts) => handleMonthMultiSelectChange(index, name, opts)}
//                                   containerClassName="w-full" menuClassName="w-full min-w-[200px] whitespace-normal" />
//                               </div>
//                               <div className="md:col-span-1">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Additional (Monthly)</label>
//                                 <DynamicMultiSelect name={`additionalFees-${index}`} searchable={true} placeholderName="Select monthly fee(s)..."
//                                   dynamicOptions={additionalFeeOptions} value={selectedAdditionalFeeValues}
//                                   handleChange={(name, opts) => handleDynamicMultiSelectChange(index, "selectedAdditionalFees", opts)}
//                                   containerClassName="w-full" menuClassName="w-full min-w-[200px] whitespace-normal" />
//                               </div>
//                               <div className="md:col-span-1">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">One-Time Fees</label>
//                                 <DynamicMultiSelect name={`oneTimeFees-${index}`} searchable={true} placeholderName="Select one-time fee(s)..."
//                                   dynamicOptions={oneTimeFeeOptions} value={selectedOneTimeFeeValues}
//                                   handleChange={(name, opts) => handleDynamicMultiSelectChange(index, "selectedOneTimeFees", opts)}
//                                   containerClassName="w-full" menuClassName="w-full min-w-[200px] whitespace-normal" />
//                               </div>
//                             </div>
                            
//                             {/* Exemption Toggle and Amount (Always per child) */}
//                             <div className="flex flex-wrap gap-4 items-center">
//                                 <ExemptionToggle isExempt={currentFormData.isExempt}
//                                     onChange={(value) => handleInputChange(index, "isExempt", value)}
//                                     studentName={child.studentName} />
//                                 {currentFormData.isExempt && <ReactInput type="number" label="Exemption" value={currentFormData.exemption}
//                                     onChange={(e) => handleInputChange(index, "exemption", e.target.value)}
//                                     min="0" step="0.01" containerClassName="sm:col-span-1" disabled={!currentFormData.isExempt} />}
                                
//                                 {/* Individual Payable/Dues specific to this child - useful even in unified mode for context */}
//                                 <div className="p-2 border rounded-md bg-gray-50">
//                                     <div className="text-sm font-medium text-gray-700">
//                                         Child's Net Payable: <span className="font-semibold text-blue-700">₹ {calculateNetPayableAmount(index).toFixed(2)}</span>
//                                     </div>
//                                     {/* Show child's dues based on their individual totalAmount IF NOT UNIFIED, or based on allocated amount IF UNIFIED (this part is complex for pre-submit display) */}
//                                     {showIndividualPaymentFields && currentFormData.totalAmount > 0 && (
//                                         <div className="text-sm font-medium text-red-700">
//                                             Child's Dues After Payment: <span className="font-semibold">₹ {calculateAutoDistribution(index).remainingDues.toFixed(2)}</span>
//                                         </div>
//                                     )}
//                                 </div>
//                             </div>

//                             {/* Individual Payment Fields (Show if NOT Unified Mode or only one child selected) */}
//                             {showIndividualPaymentFields && (
//                                 <>
//                                     <div className="flex gap-4">
//                                         <ReactInput type="number" label="Concession" value={currentFormData.concession}
//                                             onChange={(e) => handleInputChange(index, "concession", e.target.value)}
//                                             min="0" step="0.01" containerClassName="sm:col-span-1" />
//                                         <DatePicker className="custom-calendar" label="Payment Date" name="date" id={`date-${index}`}
//                                             value={currentFormData.date ? new Date(currentFormData.date) : new Date()}
//                                             handleChange={(e) => handleInputChange(index, "date", e.target.value)} />
//                                     </div>
//                                     <div className="flex gap-4">
//                                         <ReactSelect name={`paymentMode-${index}`} value={currentFormData.paymentMode}
//                                             handleChange={(e) => handleInputChange(index, "paymentMode", e.target.value)}
//                                             label="Payment Mode"
//                                             dynamicOptions={[
//                                                 { label: "Cash", value: "Cash" }, { label: "Online", value: "Online" },
//                                                 { label: "Cheque", value: "Cheque" }, { label: "Card", value: "Card" },
//                                             ]}/>
//                                         {(currentFormData.paymentMode === "Online" || currentFormData.paymentMode === "Card") && (
//                                             <ReactInput type="text" label="Transaction ID" value={currentFormData.transactionId}
//                                                 onChange={(e) => handleInputChange(index, "transactionId", e.target.value)} isRequired={true}/>
//                                         )}
//                                         {currentFormData.paymentMode === "Cheque" && (
//                                             <ReactInput type="text" label="Cheque Number" value={currentFormData.chequeBookNo}
//                                                 onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)} isRequired={true}/>
//                                         )}
//                                     </div>
//                                     <div className="flex gap-4">
//                                          <ReactInput type="number" label={`Amount to Pay`} value={currentFormData.totalAmount}
//                                             onChange={(e) => handleInputChange(index, "totalAmount", e.target.value)}
//                                             min="0.01" step="0.01" isRequired={!currentFormData.isExempt}
//                                             disabled={currentFormData.isExempt} />
//                                         <textarea value={currentFormData.remarks}
//                                             onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
//                                             className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                                             rows="1" placeholder="Optional remarks..." />
//                                     </div>
//                                 </>
//                             )}
                            
//                             {/* Submit button for individual payment (show if NOT unified or only one selected) */}
//                             {showIndividualPaymentFields && (
//                                 <div className="flex justify-end">
//                                     <Button type="submit" name={`Submit for ${child.studentName}`}
//                                         className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium" />
//                                 </div>
//                             )}
//                           </form>

//                           {/* Payment Summary (always per child) */}
//                           <div className="flex-shrink-0 lg:w-1/3 border rounded-md p-1 bg-blue-50 lg:ml-4 lg:mt-0">
//                             <h3 className="text-sm font-semibold text-blue-900 border-b border-blue-200">Payment Summary</h3>
//                             <div className="overflow-y-auto max-h-52 scrollbar-thin">
//                                 <table className="w-full text-sm">
//                                     <tbody>
//                                         {/* Rows for pastDues, lateFine, remainingDues, regularFees, additionalFees, oneTimeFees, exemption, concession */}
//                                         {/* These will use currentFormData and calculateNetPayableAmount(index) */}
//                                         {currentFormData.pastDues > 0 && (
//                                             <tr className="border-b border-blue-100"><td className="text-gray-700 py-1">Past Dues</td><td className="font-medium text-purple-700 py-1 text-right">₹{currentFormData.pastDues.toFixed(2)}</td></tr>
//                                         )}
//                                         {currentFormData.lateFine > 0 && (
//                                             <tr className="border-b border-blue-100"><td className="text-gray-700 py-1">Late Fines</td><td className="font-medium text-orange-700 py-1 text-right">₹{currentFormData.lateFine.toFixed(2)}</td></tr>
//                                         )}
//                                         {/* Remaining Dues from Previous Months ... */}
//                                         {(() => {
//                                             const selectedMonthNames = currentFormData.selectedMonths.map(m => m.value);
//                                             const selectedAdditionalFeeDues = currentFormData.selectedAdditionalFees.filter(fee => fee.frequency === "monthly").flatMap(fee => fee.dueMonths.map(month => ({ name: fee.name, month })));
//                                             const remainingDuesList = currentFormData.monthlyDues.additionalDues.filter(due => {
//                                                 const feeStructure = currentFormData.feeInfo?.feeStructure?.additionalFees?.find(fs => fs.name === due.name);
//                                                 return (due.dueAmount > 0 && !selectedMonthNames.includes(due.month) && !selectedAdditionalFeeDues.some(selected => selected.name === due.name && selected.month === due.month) && feeStructure?.frequency === "monthly");
//                                             }).reduce((acc, due) => { /* ... existing reduce ... */ return acc; }, []);
//                                             if (remainingDuesList.length > 0) {
//                                                 return (<>
//                                                     <tr className="border-b border-blue-100 font-medium text-gray-800"><td colSpan="2" className="py-1">Remaining Dues from Previous Months</td></tr>
//                                                     {remainingDuesList.map((due, i) => ( <tr key={`rem-sum-${index}-${i}`} className="border-b border-blue-100"><td className="text-gray-600 py-1 pl-3">{due.name} ({due.month})</td><td className="font-medium text-blue-700 py-1 text-right">₹{due.amount.toFixed(2)}</td></tr>))}
//                                                 </>);
//                                             } return null;
//                                         })()}
//                                         {currentFormData.selectedMonths.length > 0 && (<>
//                                             <tr className="border-b border-blue-100 font-medium text-gray-800"><td colSpan="2" className="py-[2px]">Regular Fees</td></tr>
//                                             {currentFormData.selectedMonths.map((ms, i) => (<tr key={`reg-sum-${index}-${i}`} className="border-b border-blue-100"><td className="text-gray-600 py-[2px] pl-3">{ms.value}</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{(ms?.due || 0).toFixed(2)}</td></tr>))}
//                                         </>)}
//                                         {currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly" && f.dueMonths.some(m => currentFormData.selectedMonths.map(sm => sm.value).includes(m))).length > 0 && (<>
//                                              <tr className="border-b border-blue-100 font-medium text-gray-800"><td colSpan="2" className="pt-2 pb-1">Additional Fees</td></tr>
//                                              {currentFormData.selectedAdditionalFees.filter(f => f.frequency === "monthly" && f.dueMonths.some(m => currentFormData.selectedMonths.map(sm => sm.value).includes(m))).map((fee, i) => (<tr key={`add-sum-${index}-${i}`} className="border-b border-blue-100"><td className="text-gray-600 py-[2px] pl-3">{fee.name} ({fee.type}, {fee.dueMonths.join(", ")})</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{fee.amount.toFixed(2)}</td></tr>))}
//                                         </>)}
//                                         {currentFormData.selectedOneTimeFees.length > 0 && (<>
//                                             <tr className="border-b border-blue-100 font-medium text-gray-800"><td colSpan="2" className="pt-2 pb-1">One-Time Fees</td></tr>
//                                             {currentFormData.selectedOneTimeFees.map((fee, i) => (<tr key={`one-time-sum-${index}-${i}`} className="border-b border-blue-100"><td className="text-gray-600 py-[2px] pl-3">{fee.name}</td><td className="font-medium text-blue-700 py-[2px] text-right">₹{(fee?.dueAmount || 0).toFixed(2)}</td></tr>))}
//                                         </>)}
//                                         {currentFormData.exemption > 0 && (
//                                             <tr className="border-b border-blue-100"><td className="text-green-700 py-[2px]">Exemption</td><td className="font-medium text-green-700 py-[2px] text-right">- ₹{parseFloat(currentFormData.exemption).toFixed(2)}</td></tr>
//                                         )}
//                                         {!isUnifiedMode && currentFormData.concession > 0 && ( // Show individual concession only if not unified
//                                             <tr className="border-b border-blue-100"><td className="text-green-700 py-[2px]">Concession</td><td className="font-medium text-green-700 py-[2px] text-right">- ₹{parseFloat(currentFormData.concession).toFixed(2)}</td></tr>
//                                         )}
//                                     </tbody>
//                                 </table>
//                             </div>
//                             <tfoot className="border-t-2 border-blue-200 mt-2 pt-2">
//                                 <tr><td className="pt-2 font-semibold text-blue-900 py-[2px]">Total Payable (Child)</td><td className="pt-2 font-bold text-blue-900 py-[2px] text-right">₹{calculateNetPayableAmount(index).toFixed(2)}</td></tr>
//                                 {/* For individual payment summary, show amounts based on individual input */}
//                                 {showIndividualPaymentFields && parseFloat(currentFormData.totalAmount) > 0 && !currentFormData.isExempt && (
//                                     <>
//                                     <tr><td className="text-gray-700 py-[2px]">Amount Paying</td><td className="font-medium text-black py-[2px] text-right">₹{parseFloat(currentFormData.totalAmount).toFixed(2)}</td></tr>
//                                     <tr><td className="font-semibold text-red-700 py-[2px]">Remaining Dues</td><td className="font-bold text-red-700 py-[2px] text-right">₹{calculateAutoDistribution(index).remainingDues.toFixed(2)}</td></tr>
//                                     {calculateAutoDistribution(index).remainingAfterDistribution > 0 && (
//                                         <tr><td className="font-semibold text-green-700 py-1 text-xs">Advance/Excess</td><td className="font-semibold text-green-700 py-1 text-right text-xs">₹{calculateAutoDistribution(index).remainingAfterDistribution.toFixed(2)}</td></tr>
//                                     )}
//                                     </>
//                                 )}
//                                 {/* In unified mode, after submission, the API response will show allocated amounts. Pre-submission display of allocated amount per child here is complex. */}
//                             </tfoot>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Fee History and Modals ... */}
//         {showChildForms && childFeeHistory?.monthlyStatus?.length > 0 && selectedChildrenIndices.length > 0 && (
//             <div className=" mt-2 border-t border-gray-300 ">
//               <h2 className="text-xl font-semibold text-center text-gray-800">Fee History for {childFeeHistory?.studentName || "Selected Student"} ({childFeeHistory?.session || session})</h2>
//               <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow"><MonthFeeCard childFeeHistory={childFeeHistory} /></div>
//             </div>
//         )}
//         <Modal setIsOpen={setIsMessageModalOpen} isOpen={isMessageModalOpen} title="Send Confirmation?" maxWidth="md">
//             {/* ... existing modal content ... */}
//              <div className="p-5">
//                 <p className="text-gray-700 mb-4 text-center">
//                 Fee submitted successfully for <span className="font-semibold">{responseData?.student?.studentName || unifiedReceiptData?.students?.map(s => s.studentName).join(", ") || "student(s)"}</span>.
//                 <br />Receipt Number: <span className="font-semibold">{responseData?.feeReceiptNumber || unifiedReceiptData?.unifiedReceiptNumber || "N/A"}</span>
//                 <br />Do you want to send an SMS confirmation to the parent?
//                 <br />(<span className="font-mono text-sm">{responseData?.parent?.fatherPhone || unifiedReceiptData?.parent?.fatherPhone || "Phone number not available"}</span>)
//                 </p>
//                 <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//                 <Button type="button" name="Yes, Send SMS & View Receipt" onClick={() => handleCloseMessageModal(true)} className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2" />
//                 <Button type="button" name="No, Just View Receipt" onClick={() => handleCloseMessageModal(false)} className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1" />
//                 </div>
//             </div>
//         </Modal>
//         <Modal setIsOpen={setPdfModalOpen} isOpen={pdfModalOpen} title="Fee Receipt Preview" maxWidth="lg">
//             {/* ... existing modal content ... */}
//             <div className="p-1">
//                 {!isPreviewReady || !receiptData ? <p className="text-center p-10 text-gray-600">Loading receipt preview...</p> : 
//                 <FeeRecipt modalData={receiptData} handleCloseModal={() => handleClosePdfModal()} handlePrint={() => handleClosePdfModal("print")} handleDownload={() => handleClosePdfModal("download")} isPreviewReady={isPreviewReady} isUnified={false} />}
//             </div>
//         </Modal>
//         <Modal setIsOpen={setUnifiedReceiptModalOpen} isOpen={unifiedReceiptModalOpen} title="Unified Fee Receipt Preview" maxWidth="lg">
//             {/* ... existing modal content ... */}
//              <div className="p-1">
//                 {!isPreviewReady || !receiptData ? <p className="text-center p-10 text-gray-600">Loading unified receipt preview...</p> :
//                 <FeeRecipt modalData={receiptData} handleCloseModal={() => handleCloseUnifiedReceiptModal()} handlePrint={() => handleCloseUnifiedReceiptModal("print")} handleDownload={() => handleCloseUnifiedReceiptModal("download")} isPreviewReady={isPreviewReady} isUnified={true} />}
//             </div>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default SibilingFees;





// import axios from "axios";
// import React, { useEffect, useState, useCallback } from "react";
// import { toast } from "react-toastify";
// import {
//   ActiveStudents,
//   feescreateFeeStatus,
//   parentandchildwithID,
//   feescreateUnifiedFeeStatus,
// } from "../../Network/AdminApi";
// import Button from "../../Dynamic/utils/Button";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import MonthFeeCard from "./MonthFeeCard";
// import moment from "moment";
// import { FeeResponse, FeeResponseSibling } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";
// import FeeRecipt from "./FeeRecipt";
// import DynamicMultiSelect from "../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import DatePicker from "../../Dynamic/DatePicker/DatePicker";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";

// const ExemptionToggle = ({ isExempt, onChange, studentName }) => {
  
//   return (
//     <label className="flex items-center gap-2 cursor-pointer">
//       <div className="relative">
//         {/* Screen-reader only checkbox */}
//         <input
//           type="checkbox"
//           checked={isExempt}
//           onChange={(e) => onChange(e.target.checked)}
//           className="sr-only peer" // Added peer class for potential future styling
//         />
//         {/* Switch Track */}
//         <div
//           className={`relative w-10 h-5 rounded-full transition-colors duration-300 ease-in-out ${
//             isExempt ? "bg-light-blue-800" : "bg-gray-300" // Use your actual blue color class
//           } peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-offset-1 peer-focus:ring-light-blue-500`} // Added focus ring for accessibility
//         >
//           {/* Switch Handle */}
//           <div
//             className={`absolute top-[2px] left-[2px] w-4 h-4 bg-white rounded-full shadow transition-transform duration-300 ease-in-out transform ${
//               isExempt ? "translate-x-5" : "translate-x-0" // Adjusted positioning slightly if needed (top/left-[2px])
//             }`}
//           />
//         </div>
//       </div>

//       {/* Text Label - Added min-width */}
//       <span
//         className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap min-w-[150px] text-left" // <-- Add min-w-[value] and text-left
//         // Adjust min-w-[150px] based on the longest expected student name + "Exempt for " text
//       >
//         {isExempt ? `Exempt` : `Exempt`}
//         {/* {isExempt ? `Exempt for ${studentName}` : `Exempt`} */}
//       </span>
//     </label>

//   );
// };

// // Helper to fetch additional fees
// const fetchAdditionalFeesForClass = async (className, authToken) => {
//   try {
//     const response = await axios.get(
//       `${
//         process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//       }/api/v1/adminRoute/fees/?additional=true&className=${className}`,
//       {
//         withCredentials: true,
//         headers: { Authorization: `Bearer ${authToken}` },
//       }
//     );
//     if (response?.data?.success) {
//       const filteredFees = response.data.data.filter(
//         (fee) => fee.className === className
//       );
//       return filteredFees.map((fee) => ({
//         label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`,
//         value: fee.amount,
//         name: fee.name,
//         type: fee.feeType,
//         id: fee._id,
//         frequency: fee.frequency,
//       }));
//     } else {
//       console.error(
//         `Failed to fetch additional fees for class ${className}:`,
//         response?.data?.message
//       );
//       toast.error(`Failed to fetch additional fees for class ${className}.`);
//       return [];
//     }
//   } catch (error) {
//     console.error(
//       `Error fetching additional fees for class ${className}:`,
//       error
//     );
//     toast.error(
//       `Error fetching additional fees for class ${className}: ${error.message}`
//     );
//     return [];
//   }
// };

// const SibilingFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
//   const [responseData, setResponseData] = useState(null);
//   const [showChildForms, setShowChildForms] = useState(false);
//   const [selectedChildrenIndices, setSelectedChildrenIndices] = useState([]);
//   const [childFeeHistory, setChildFeeHistory] = useState(null);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showFormFlags, setShowFormFlags] = useState([]);
//   const [triggerRefresh, setTriggerRefresh] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const authToken = localStorage.getItem("token");
//   const [pdfModalOpen, setPdfModalOpen] = useState(false);
//   const [unifiedReceiptModalOpen, setUnifiedReceiptModalOpen] = useState(false);
//   const [unifiedReceiptData, setUnifiedReceiptData] = useState(null);
//   const [receiptData, setReceiptData] = useState(null);
//   const [isPreviewReady, setIsPreviewReady] = useState(false);

//   const allMonths = [
//     "April",
//     "May",
//     "June",
//     "July",
//     "August",
//     "September",
//     "October",
//     "November",
//     "December",
//     "January",
//     "February",
//     "March",
//   ];

//   const getAllStudent = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents(session);
//       setAllStudent(response?.students?.data || []);
//     } catch (error) {
//       console.error("Failed to fetch student list:", error);
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   useEffect(() => {
//     getAllStudent();
//   }, [getAllStudent, triggerRefresh]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase();
//     // const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.studentName &&
//           student.studentName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//     setSearchTermbyadmissionNo("");
//   };

//   const handleSearchbyAdmissionNo = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTermbyadmissionNo(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.admissionNumber &&
//           student.admissionNumber.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//     setSearchTerm("");
//   };

//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `${
//           process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//         }/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         console.error(
//           `Fee info fetch failed for student ID ${studentId}:`,
//           response.data.message || "Unknown error"
//         );
//         toast.error(
//           `Fee info fetch failed for student ID ${studentId}: ${
//             response.data.message || "Unknown error"
//           }`
//         );
//         return null;
//       }
//     } catch (error) {
//       console.error(
//         `Error fetching fee info for student ID ${studentId}:`,
//         error
//       );
//       toast.error(
//         `Error fetching fee info for student ID ${studentId}: ${error.message}`
//       );
//       return null;
//     }
//   };

//   const resetState = () => {
//     setSelectedChildrenIndices([]);
//     setChildFeeHistory(null);
//     setShowFormFlags([]);
//     setParentData([]);
//     setFormData([]);
//     setSearchTerm("");
//     setSearchTermbyadmissionNo("");
//     setFilteredStudents([]);
//     setShowChildForms(false);
//     setResponseData(null);
//     setIsMessageModalOpen(false);
//     setPdfModalOpen(false);
//     setUnifiedReceiptModalOpen(false);
//     setUnifiedReceiptData(null);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//   };


//   const calculateTotalOutstandingDues = (index) => {
//     const data = formData[index];
//     if (!data || data.error) return 0;
//     let total = 0;
//     total += parseFloat(data.pastDues) || 0;
//     total += parseFloat(data.lateFine) || 0;
//     total += data.monthlyDues.regularDues.reduce((sum, d) => sum + d.dueAmount, 0);
//     total += data.monthlyDues.additionalDues.reduce((sum, d) => sum + d.dueAmount, 0);
//     return total;
//   };

//   const handleStudentClick = async (parentId) => {
//     console.log(`handleStudentClick called for parentId: ${parentId}`);
//     setIsLoader(true);
//     resetState();
//     try {
//       const parentResponse = await parentandchildwithID(parentId);
//       if (!parentResponse?.success) {
//         console.error(
//           "Failed to fetch parent/child data:",
//           parentResponse?.message
//         );
//         toast.error(
//           parentResponse?.message || "Failed to fetch parent/child data."
//         );
//         setIsLoader(false);
//         return;
//       }

//       const children = parentResponse?.children || [];
//       if (children.length === 0) {
//         toast.info("No children found for this parent.");
//         setIsLoader(false);
//         return;
//       }

//       setParentData(children);

//       const promises = children.map((child) =>
//         Promise.all([
//           fetchStudentFeeInfo(child.studentId),
//           fetchAdditionalFeesForClass(child.class, authToken),
//         ])
//       );

//       const results = await Promise.all(promises);
     
//       const initialFormData = [];
//       const initialShowFormFlags = [];

//       results.forEach(([feeInfo, availableAdditionalFees], index) => {
//         const child = children[index];
//         console.log(
//           `Processing child ${index}: ${child.studentName} (ID: ${child.studentId})`
//         );

//         if (!feeInfo) {
//           console.warn(
//             `Could not load fee details for ${child.studentName}. Setting error flag.`
//           );
//           toast.error(
//             `Could not load fee details for ${child.studentName}. Skipping.`
//           );
//           initialShowFormFlags.push(false);
//           initialFormData.push({
//             admissionNumber: child.admissionNumber,
//             studentId: child.studentId,
//             studentName: child.studentName,
//             className: child.class,
//             error: true,
//           });
//           return;
//         }

//         const regularFeeAmount =
//           feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
//         const additionalFeesStructure =
//           feeInfo.feeStructure?.additionalFees || [];
//         const monthlyStatus = feeInfo.monthlyStatus || [];
//         const feeHistory = feeInfo.feeStatus?.feeHistory || [];
//         const monthlyDues = feeInfo.feeStatus?.monthlyDues || {
//           regularDues: [],
//           additionalDues: [],
//         };
//         const oneTimeAdditionalDues = feeInfo.oneTimeAdditionalDues || [];

//         // Prepare regular fee status for all months
//         const regularFees = allMonths.map((month) => {
//           const monthData = monthlyStatus.find((m) => m.month === month);
//           const dueData = monthlyDues.regularDues.find(
//             (d) => d.month === month
//           );
//           const due = dueData
//             ? dueData.dueAmount
//             : monthData?.regularFee?.status === "Paid"
//             ? 0
//             : regularFeeAmount;
//           const status = dueData
//             ? dueData.status
//             : monthData?.regularFee?.status || "Unpaid";
//           return {
//             month,
//             paidAmount:
//               dueData?.paidAmount || monthData?.regularFee?.paid || "",
//             dueAmount: due,
//             totalAmount: regularFeeAmount,
//             status,
//             label: `${month} (Due: ₹${due.toFixed(2)})`,
//           };
//         });

//         // Pre-select regular fees with dues from monthlyStatus, validated by monthlyDues
//         const preSelectedMonths = [];
//         monthlyStatus.forEach((monthData) => {
//           if (
//             monthData.regularFee.due > 0 &&
//             monthData.regularFee.status !== "Paid"
//           ) {
//             const dueData = monthlyDues.regularDues.find(
//               (d) => d.month === monthData.month
//             );
//             if (dueData && dueData.dueAmount > 0 && dueData.status !== "Paid") {
//               const originalFee = regularFees.find(
//                 (rf) => rf.month === monthData.month
//               );
//               if (originalFee) {
//                 preSelectedMonths.push({
//                   value: monthData.month,
//                   label: originalFee.label,
//                   due: dueData.dueAmount,
//                 });
//               }
//             }
//           }
//         });

//         // Prepare additional fee details
//         const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
//           name: fee.name,
//           type: fee.feeType,
//           frequency: fee.frequency,
//           amount: fee.amount,
//           months: allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             const addFee = monthData?.additionalFees?.find(
//               (af) => af.name === fee.name
//             );
//             const dueData = monthlyDues.additionalDues.find(
//               (d) => d.name === fee.name && d.month === month
//             );
//             const due = dueData
//               ? dueData.dueAmount
//               : addFee?.status === "Paid"
//               ? 0
//               : fee.amount;
//             const status = dueData
//               ? dueData.status
//               : addFee?.status || "Unpaid";
//             return {
//               month,
//               paidAmount: dueData?.paidAmount || addFee?.paid || "",
//               dueAmount: due,
//               totalAmount: fee.amount,
//               status,
//             };
//           }),
//         }));

//         // Pre-select additional monthly fees with dues from monthlyStatus, validated by monthlyDues
//         const preSelectedAdditionalFees = [];
//         monthlyStatus.forEach((monthData) => {
//           monthData.additionalFees?.forEach((fee) => {
//             if (
//               fee.due > 0 &&
//               fee.status !== "Paid" &&
//               fee.frequency === "monthly"
//             ) {
//               const dueData = monthlyDues.additionalDues.find(
//                 (d) => d.name === fee.name && d.month === monthData.month
//               );
//               if (
//                 dueData &&
//                 dueData.dueAmount > 0 &&
//                 dueData.status !== "Paid"
//               ) {
//                 const feeStructure = additionalFeesStructure.find(
//                   (fs) => fs.name === fee.name && fs.frequency === "monthly"
//                 );
//                 if (feeStructure) {
//                   const availableFeeOption = availableAdditionalFees.find(
//                     (opt) =>
//                       opt.name === fee.name && opt.frequency === "monthly"
//                   );
//                   if (availableFeeOption) {
//                     // Only pre-select if the month is also pre-selected in regular fees
//                     const isMonthPreSelected = preSelectedMonths.some(
//                       (m) => m.value === monthData.month
//                     );
//                     if (isMonthPreSelected) {
//                       const existingFee = preSelectedAdditionalFees.find(
//                         (pf) =>
//                           pf.name === fee.name && pf.frequency === "monthly"
//                       );
//                       if (existingFee) {
//                         if (!existingFee.dueMonths.includes(monthData.month)) {
//                           existingFee.dueMonths.push(monthData.month);
//                           existingFee.amount += dueData.dueAmount;
//                         }
//                       } else {
//                         preSelectedAdditionalFees.push({
//                           id: availableFeeOption.id,
//                           name: availableFeeOption.name,
//                           amount: dueData.dueAmount,
//                           type: availableFeeOption.type,
//                           frequency: availableFeeOption.frequency,
//                           dueMonths: [monthData.month],
//                         });
//                       }
//                     }
//                   }
//                 }
//               }
//             }
//           });
//         });

//         // Pre-select one-time fees with dues from oneTimeAdditionalDues only
//         const preSelectedOneTimeFees = [];
//         oneTimeAdditionalDues.forEach((fee) => {
//           if (fee.dueAmount > 0 && fee.status !== "Paid") {
//             const feeStructure = additionalFeesStructure.find(
//               (fs) => fs.name === fee.name && fs.frequency === "one-time"
//             );
//             if (feeStructure) {
//               preSelectedOneTimeFees.push({
//                 name: fee.name,
//                 dueAmount: fee.dueAmount,
//                 frequency: feeStructure.frequency,
//               });
//             }
//           }
//         });

//         // Prepare one-time fee options (for dropdown, including unpaid one-time fees from feeStructure)
//         const oneTimeFeeOptions = additionalFeesStructure
//   .filter(
//     (fee) => fee.feeType === "One Time" && fee.frequency === "one-time"
//   )
//   .filter((fee) => {
//     // Check if fee is paid in feeHistory
//     const isPaidInHistory = feeHistory.some((history) =>
//       history.additionalFees.some(
//         (af) =>
//           af.name === fee.name &&
//           af.status === "Paid" &&
//           af.dueAmount === 0
//       )
//     );
//     // Check if fee is paid in monthlyDues
//     const isPaidInDues = monthlyDues.additionalDues.some(
//       (d) =>
//         d.name === fee.name && d.status === "Paid" && d.dueAmount === 0
//     );
//     // Check if fee is exempt in monthlyDues
//     const isExemptInDues = monthlyDues.additionalDues.some(
//       (d) =>
//         d.name === fee.name && d.status === "Exempt" && d.dueAmount === 0
//     );
//     // Include fee if not fully paid or exempt
//     return !isPaidInHistory && !isPaidInDues && !isExemptInDues;
//   })
//   .map((fee) => {
//     const dueFee = oneTimeAdditionalDues.find(
//       (d) => d.name === fee.name
//     );
//     const dueAmount = dueFee ? dueFee.dueAmount : fee.amount;
//     return {
//       label: `${fee.name} (Due: ₹${dueAmount.toFixed(2)})`,
//       name: fee.name,
//       code: fee.name,
//       dueAmount,
//       type: fee.feeType,
//       frequency: fee.frequency,
//     };
//   });

//         const childFormData = {
//           admissionNumber: child.admissionNumber,
//           studentId: child.studentId,
//           studentName: child.studentName,
//           className: child.class,
//           classFee: regularFeeAmount,
//           totalAmount: "",
//           selectedMonths: preSelectedMonths,
//           selectedAdditionalFees: preSelectedAdditionalFees,
//           selectedOneTimeFees: preSelectedOneTimeFees,
//           paymentMode: "Cash",
//           transactionId: "",
//           chequeBookNo: "",
//           lateFine: feeInfo.feeStatus?.totalLateFines || 0,
//           concession: "",
//           exemption: "",
//           isExempt: false, // New field
//           date: moment().format("YYYY-MM-DD"),
//           remarks: "",
//           monthlyDues,
//           additionalFeeDetails,
//           pastDues: feeInfo.feeStatus?.pastDues || 0,
//           totalDues: feeInfo.feeStatus?.dues || 0,
//           regularFees,
//           availableAdditionalFees: availableAdditionalFees || [],
//           oneTimeFeeOptions,
//           feeInfo,
//           error: false,
//         };
//         console.log(
//           `Generated initial form data for ${child.studentName}:`,
//           childFormData
//         );
//         initialFormData.push(childFormData);
//         initialShowFormFlags.push(false);
//       });

      
//       setFormData(initialFormData);
//       setShowFormFlags(initialShowFormFlags);
//       setShowChildForms(true);
//       console.log("Child forms should now be visible.");
//     } catch (error) {
//       console.error("An error occurred during handleStudentClick:", error);
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const handleChildSelection = (index) => {
//     console.log(`handleChildSelection called for index: ${index}`);
//     if (!formData || index < 0 || index >= formData.length) {
//       console.error(
//         `Invalid index or formData for selection: index=${index}, formData length=${formData?.length}`
//       );
//       toast.error("An internal error occurred. Please try again.");
//       return;
//     }
//     const currentChildData = formData[index];
//     console.log("Current formData[index]:", currentChildData);

//     if (!currentChildData || currentChildData.error) {
//       toast.warn(
//         `Cannot select ${
//           parentData[index]?.studentName || "this student"
//         }. Fee data may be missing or failed to load.`
//       );
//       console.warn("Selection blocked due to missing data or error flag.");
//       return;
//     }

//     const isCurrentlySelected = selectedChildrenIndices.includes(index);
//     console.log("Is currently selected:", isCurrentlySelected);

//     let updatedSelectedChildren;
//     let updatedShowFormFlags = [...showFormFlags];

//     if (isCurrentlySelected) {
//       updatedSelectedChildren = selectedChildrenIndices.filter(
//         (i) => i !== index
//       );
//       updatedShowFormFlags[index] = false;
//       console.log("Deselecting child.");
//     } else {
//       updatedSelectedChildren = [...selectedChildrenIndices, index];
//       updatedShowFormFlags[index] = true;
//       console.log("Selecting child.");
//     }

//     updatedSelectedChildren.sort((a, b) => a - b);

//     console.log("Updating selected indices to:", updatedSelectedChildren);
//     console.log("Updating showFormFlags to:", updatedShowFormFlags);

//     setSelectedChildrenIndices(updatedSelectedChildren);
//     setShowFormFlags(updatedShowFormFlags);

//     if (updatedSelectedChildren.length > 0) {
//       const firstSelectedIndex = updatedSelectedChildren[0];
//       console.log("Updating fee history for index:", firstSelectedIndex);
//       setChildFeeHistory(formData[firstSelectedIndex]?.feeInfo || null);
//     } else {
//       console.log("Clearing fee history.");
//       setChildFeeHistory(null);
//     }
//   };

//   // Replace the handleInputChange function with this:
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) {
//       updatedFormData[index] = { ...updatedFormData[index], [field]: value };

//       if (field === "paymentMode") {
//         if (value !== "Online" && value !== "Card") {
//           updatedFormData[index].transactionId = "";
//         }
//         if (value !== "Cheque") {
//           updatedFormData[index].chequeBookNo = "";
//         }
//       }

//       if (field === "isExempt") {
//         if (value) {
//           // Calculate net payable without considering exemption
//           const data = updatedFormData[index];
//           let total = 0;
//           total += parseFloat(data.pastDues) || 0;
//           total += parseFloat(data.lateFine) || 0;

//           // Add regular fees for selected months
//           total += data.selectedMonths.reduce(
//             (sum, monthState) => sum + (monthState?.due || 0),
//             0
//           );

//           // Add additional fees
//           total += data.selectedAdditionalFees.reduce((sum, fee) => {
//             if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//               return (
//                 sum +
//                 fee.dueMonths.reduce((monthSum, month) => {
//                   const feeDetail = data.additionalFeeDetails.find(
//                     (fd) => fd.name === fee.name && fd.frequency === "monthly"
//                   );
//                   if (feeDetail) {
//                     const monthData = feeDetail.months.find(
//                       (m) => m.month === month
//                     );
//                     return monthSum + (monthData?.dueAmount || 0);
//                   }
//                   return monthSum;
//                 }, 0)
//               );
//             } else if (fee.frequency === "one-time") {
//               const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find(
//                 (d) => d.name === fee.name
//               );
//               return (
//                 sum +
//                 (oneTimeDue
//                   ? oneTimeDue.dueAmount
//                   : parseFloat(fee.amount) || 0)
//               );
//             }
//             return sum;
//           }, 0);

//           // Add one-time fees
//           total += data.selectedOneTimeFees.reduce(
//             (sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0),
//             0
//           );

//           // Add remaining dues from previous months
//           const selectedMonthNames = data.selectedMonths.map((m) => m.value);
//           const selectedAdditionalFeeDues = data.selectedAdditionalFees
//             .filter((fee) => fee.frequency === "monthly")
//             .flatMap((fee) =>
//               fee.dueMonths.map((month) => ({ name: fee.name, month }))
//             );
//           const remainingDues = data.monthlyDues.additionalDues
//             .filter((due) => {
//               const feeStructure =
//                 data.feeInfo?.feeStructure?.additionalFees?.find(
//                   (fs) => fs.name === due.name
//                 );
//               return (
//                 due.dueAmount > 0 &&
//                 !selectedMonthNames.includes(due.month) &&
//                 !selectedAdditionalFeeDues.some(
//                   (selected) =>
//                     selected.name === due.name && selected.month === due.month
//                 ) &&
//                 feeStructure?.frequency === "monthly"
//               );
//             })
//             .reduce((sum, due) => sum + due.dueAmount, 0);
//           total += remainingDues;

//           // Subtract concession
//           total -= parseFloat(data.concession) || 0;

//           // Set exemption to the calculated total
//           updatedFormData[index].exemption = Math.max(0, total).toFixed(2);
//           updatedFormData[index].totalAmount = "0";
//         } else {
//           updatedFormData[index].exemption = "";
//           updatedFormData[index].totalAmount = "";
//         }
//       }

//       setFormData(updatedFormData);
//     } else {
//       console.error(
//         `Attempted to handle input change for invalid index: ${index}`
//       );
//     }
//   };

//   const handleMonthMultiSelectChange = (index, name, selectedOptions) => {
//     console.log(`Month selection changed for index ${index}:`, selectedOptions);
//     const selectedOptionsData = selectedOptions || [];
//     const updatedFormData = [...formData];
//     if (!updatedFormData[index]) {
//       console.error(
//         `Cannot handle month change, formData missing for index: ${index}`
//       );
//       return;
//     }
//     const currentChildData = updatedFormData[index];

//     const selectedMonthNames = selectedOptionsData.map((opt) => opt.code);
//     if (selectedMonthNames.length > 1) {
//       const indicesInAllMonths = selectedMonthNames
//         .map((month) => allMonths.indexOf(month))
//         .sort((a, b) => a - b);
//       let isSequential = true;
//       for (let i = 1; i < indicesInAllMonths.length; i++) {
//         if (indicesInAllMonths[i] !== indicesInAllMonths[i - 1] + 1) {
//           isSequential = false;
//           break;
//         }
//       }
//       if (!isSequential) {
//         toast.warn(
//           `Please select months in a continuous sequence (e.g., April, May, June). Deselect and reselect if needed.`
//         );
//         return;
//       }
//     }

//     const newSelectedMonths = selectedOptionsData
//       .map((opt) => {
//         const originalFee = currentChildData.regularFees.find(
//           (fee) => fee.month === opt.code
//         );
//         if (!originalFee) {
//           console.error(
//             `Could not find original fee data for month: ${opt.code}`
//           );
//           return null;
//         }
//         return {
//           value: originalFee.month,
//           label: originalFee.label,
//           due: originalFee.dueAmount,
//         };
//       })
//       .filter(Boolean);

//     updatedFormData[index].selectedMonths = newSelectedMonths;

//     // Auto-select monthly additional fees for selected months
//     const newSelectedAdditionalFees = [];
//     const structuredMonthlyAddFees =
//       currentChildData.feeInfo?.feeStructure?.additionalFees?.filter(
//         (fee) => fee.frequency === "monthly"
//       ) || [];

//     structuredMonthlyAddFees.forEach((fee) => {
//       const availableFeeOption = currentChildData.availableAdditionalFees.find(
//         (opt) => opt.name === fee.name && opt.frequency === "monthly"
//       );
//       if (availableFeeOption) {
//         const feeDetail = currentChildData.additionalFeeDetails.find(
//           (fd) => fd.name === fee.name && fd.frequency === "monthly"
//         );
//         if (!feeDetail) {
//           console.warn(`No fee detail found for ${fee.name}`);
//           return;
//         }
//         const dueMonths = newSelectedMonths
//           .map((m) => {
//             const monthData = feeDetail.months.find(
//               (fm) => fm.month === m.value
//             );
//             if (monthData && monthData.dueAmount > 0) {
//               return monthData.month;
//             }
//             return null;
//           })
//           .filter(Boolean);

//         if (dueMonths.length > 0) {
//           // Calculate total amount for the selected months
//           const totalAmount = dueMonths.reduce((sum, month) => {
//             const monthData = feeDetail.months.find((fm) => fm.month === month);
//             return sum + (monthData?.dueAmount || 0);
//           }, 0);

//           newSelectedAdditionalFees.push({
//             id: availableFeeOption.id,
//             name: availableFeeOption.name,
//             amount: totalAmount,
//             type: availableFeeOption.type,
//             frequency: availableFeeOption.frequency,
//             dueMonths,
//           });
//         }
//       }
//     });

//     // Preserve one-time additional fees that were manually selected
//     const existingOneTimeFees = currentChildData.selectedAdditionalFees.filter(
//       (fee) => fee.frequency === "one-time"
//     );

//     updatedFormData[index].selectedAdditionalFees = [
//       ...newSelectedAdditionalFees,
//       ...existingOneTimeFees,
//     ];

//     setFormData(updatedFormData);
//   };

//   const handleDynamicMultiSelectChange = (index, field, selectedOptions) => {
//     console.log(
//       `Dynamic multiselect changed for index ${index}, field ${field}:`,
//       selectedOptions
//     );
//     const updatedFormData = [...formData];
//     if (!updatedFormData[index]) {
//       console.error(
//         `Cannot handle dynamic multiselect change, formData missing for index: ${index}`
//       );
//       return;
//     }
//     const currentChildData = updatedFormData[index];

//     if (field === "selectedAdditionalFees") {
//       const newSelectedAdditionalFees = (selectedOptions || [])
//         .map((opt) => {
//           const originalFee = currentChildData.availableAdditionalFees.find(
//             (fee) => fee.id === opt.code && fee.frequency === "monthly"
//           );
//           if (originalFee) {
//             return {
//               id: originalFee.id,
//               name: originalFee.name,
//               amount: originalFee.value,
//               type: originalFee.type,
//               frequency: originalFee.frequency,
//               dueMonths:
//                 originalFee.frequency === "monthly"
//                   ? currentChildData.selectedMonths.map((m) => m.value)
//                   : [],
//             };
//           }
//           console.warn(
//             "Could not find original additional fee details for option code:",
//             opt.code
//           );
//           return null;
//         })
//         .filter(Boolean);

//       // Preserve one-time fees
//       const existingFees = currentChildData.selectedAdditionalFees.filter(
//         (fee) => fee.frequency === "one-time"
//       );

//       updatedFormData[index].selectedAdditionalFees = [
//         ...newSelectedAdditionalFees,
//         ...existingFees,
//       ];
//     } else if (field === "selectedOneTimeFees") {
//       const newSelectedOneTimeFees = (selectedOptions || [])
//         .map((opt) => {
//           const originalFee = currentChildData.oneTimeFeeOptions.find(
//             (fee) => fee.code === opt.code
//           );
//           if (originalFee) {
//             return {
//               name: originalFee.name,
//               dueAmount: originalFee.dueAmount,
//               frequency: originalFee.frequency,
//             };
//           }
//           console.warn(
//             "Could not find original one-time fee details for option code:",
//             opt.code
//           );
//           return null;
//         })
//         .filter(Boolean);

//       updatedFormData[index].selectedOneTimeFees = newSelectedOneTimeFees;
//     }

//     setFormData(updatedFormData);
//   };

//   // Update calculateNetPayableAmount to account for exemption
//   const calculateNetPayableAmount = useCallback(
//     (index) => {
//       const data = formData[index];
//       if (!data || data.error) return 0;
//       let total = 0;
//       total += parseFloat(data.pastDues) || 0;
//       total += parseFloat(data.lateFine) || 0;

//       // Add regular fees for selected months
//       total += data.selectedMonths.reduce(
//         (sum, monthState) => sum + (monthState?.due || 0),
//         0
//       );

//       // Add additional fees, respecting due amounts for selected months
//       total += data.selectedAdditionalFees.reduce((sum, fee) => {
//         if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//           return (
//             sum +
//             fee.dueMonths.reduce((monthSum, month) => {
//               const feeDetail = data.additionalFeeDetails.find(
//                 (fd) => fd.name === fee.name && fd.frequency === "monthly"
//               );
//               if (feeDetail) {
//                 const monthData = feeDetail.months.find(
//                   (m) => m.month === month
//                 );
//                 return monthSum + (monthData?.dueAmount || 0);
//               }
//               return monthSum;
//             }, 0)
//           );
//         } else if (fee.frequency === "one-time") {
//           // For one-time fees in selectedAdditionalFees, use dueAmount from oneTimeAdditionalDues if available
//           const oneTimeDue = data.feeInfo?.oneTimeAdditionalDues?.find(
//             (d) => d.name === fee.name
//           );
//           return (
//             sum +
//             (oneTimeDue ? oneTimeDue.dueAmount : parseFloat(fee.amount) || 0)
//           );
//         }
//         return sum;
//       }, 0);

//       // Add one-time fees using dueAmount from selectedOneTimeFees
//       total += data.selectedOneTimeFees.reduce(
//         (sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0),
//         0
//       );

//       // Add remaining dues from previous months for additional fees, excluding those already in selectedAdditionalFees
//       const selectedMonthNames = data.selectedMonths.map((m) => m.value);
//       const selectedAdditionalFeeDues = data.selectedAdditionalFees
//         .filter((fee) => fee.frequency === "monthly")
//         .flatMap((fee) =>
//           fee.dueMonths.map((month) => ({ name: fee.name, month }))
//         );
//       const remainingDues = data.monthlyDues.additionalDues
//         .filter((due) => {
//           const feeStructure = data.feeInfo?.feeStructure?.additionalFees?.find(
//             (fs) => fs.name === due.name
//           );
//           return (
//             due.dueAmount > 0 &&
//             !selectedMonthNames.includes(due.month) &&
//             !selectedAdditionalFeeDues.some(
//               (selected) =>
//                 selected.name === due.name && selected.month === due.month
//             ) &&
//             feeStructure?.frequency === "monthly" // Only include monthly fees
//           );
//         })
//         .reduce((sum, due) => sum + due.dueAmount, 0);
//       total += remainingDues;

//       // Subtract concession and exemption
//       total -= parseFloat(data.concession) || 0;
//       total -= parseFloat(data.exemption) || 0; // New
//       return Math.max(0, total);
//     },
//     [formData]
//   );

//   const calculateAutoDistribution = useCallback(
//     (index) => {
//       const data = formData[index];
//       if (!data || data.error)
//         return { remainingAfterDistribution: 0, remainingDues: 0 };
//       const netPayable = calculateNetPayableAmount(index);
//       const totalAmountPaid = parseFloat(data.totalAmount) || 0;
//       const remainingDues = Math.max(0, netPayable - totalAmountPaid);
//       const remainingAfterDistribution = Math.max(
//         0,
//         totalAmountPaid - netPayable
//       );
//       return { remainingAfterDistribution, remainingDues };
//     },
//     [formData, calculateNetPayableAmount]
//   );

//   const fetchReceiptData = async (receiptNumber, isUnified = false) => {
//     setIsPreviewReady(false);
//     setIsLoader(true);
//     try {
//       const url = isUnified
//         ? `${
//             process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//           }/api/v1/fees/unified-receipts?unifiedReceiptNumber=${receiptNumber}`
//         : `${
//             process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//           }/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`;
//       const response = await axios.get(url, {
//         headers: { Authorization: `Bearer ${authToken}` },
//       });
//       if (response.data.success) {
//         setReceiptData(response.data);
//         setIsPreviewReady(true);
//         return response.data;
//       } else {
//         console.error(
//           `Failed to fetch receipt data ${receiptNumber}:`,
//           response.data.message
//         );
//         toast.error(
//           `Failed to fetch receipt data: ${
//             response.data.message || "Unknown error"
//           }`
//         );
//         return null;
//       }
//     } catch (error) {
//       console.error(`Error fetching receipt data ${receiptNumber}:`, error);
//       if (isUnified && error.response?.status === 404) {
//         // Fallback to single receipt if unified receipt fails
//         try {
//           const fallbackResponse = await axios.get(
//             `${
//               process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//             }/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`,
//             { headers: { Authorization: `Bearer ${authToken}` } }
//           );
//           if (fallbackResponse.data.success) {
//             setReceiptData(fallbackResponse.data);
//             setIsPreviewReady(true);
//             return fallbackResponse.data;
//           } else {
//             toast.error(
//               `Fallback receipt fetch failed: ${
//                 fallbackResponse.data.message || "Unknown error"
//               }`
//             );
//             return null;
//           }
//         } catch (fallbackError) {
//           console.error(
//             `Error fetching fallback receipt data ${receiptNumber}:`,
//             fallbackError
//           );
//           toast.error("Error fetching receipt data: " + fallbackError.message);
//           return null;
//         }
//       } else {
//         toast.error("Error fetching receipt data: " + error.message);
//         return null;
//       }
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const validateFormData = (childFormData, child, isUnified = false) => {
//     console.log(`Validating form data for ${child?.studentName}`, childFormData);
//     if (!childFormData || childFormData.error) {
//       toast.error(
//         `Cannot submit for ${
//           child?.studentName || "this student"
//         } due to missing or failed data loading.`
//       );
//       return false;
//     }
  
//     if (childFormData.isExempt) {
//       // If exempt, set exemption to net payable amount and skip total amount check
//       const netPayable = calculateNetPayableAmount(
//         formData.findIndex((fd) => fd.studentId === child.studentId)
//       );
//       childFormData.exemption = netPayable.toFixed(2);
//       childFormData.totalAmount = "0";
//     } else {
//       // Non-exempt: validate total amount
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;
//       if (totalAmount <= 0) {
//         toast.warn(
//           `Please enter a valid amount (> 0) to pay for ${child.studentName}.`
//         );
//         return false;
//       }
//     }
  
//     if (!childFormData.paymentMode) {
//       toast.error(`Payment mode is required for ${child.studentName}.`);
//       return false;
//     }
//     if (
//       (childFormData.paymentMode === "Online" ||
//         childFormData.paymentMode === "Card") &&
//       !childFormData.transactionId
//     ) {
//       toast.error(
//         `Transaction ID is required for Online/Card payment for ${child.studentName}.`
//       );
//       return false;
//     }
//     const exemption = parseFloat(childFormData.exemption) || 0;
//     if (exemption < 0) {
//       toast.warn(`Exemption amount cannot be negative for ${child.studentName}.`);
//       return false;
//     }
//     if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
//       toast.error(
//         `Cheque Number is required for Cheque payment for ${child.studentName}.`
//       );
//       return false;
//     }
//     if (
//       !childFormData.date ||
//       !moment(childFormData.date, "YYYY-MM-DD", true).isValid()
//     ) {
//       toast.error(`Please select a valid payment date for ${child.studentName}.`);
//       return false;
//     }
  
//     const payableExcludingDuesFines =
//       calculateNetPayableAmount(
//         formData.findIndex((fd) => fd.studentId === child.studentId)
//       ) -
//       (parseFloat(childFormData.pastDues) || 0) -
//       (parseFloat(childFormData.lateFine) || 0);
//     const onlyPayingDuesAndFines =
//       (parseFloat(childFormData.pastDues) || 0) +
//       (parseFloat(childFormData.lateFine) || 0);
  
//     if (
//       !childFormData.isExempt &&
//       parseFloat(childFormData.totalAmount) > 0 &&
//       childFormData.selectedMonths.length === 0 &&
//       childFormData.selectedAdditionalFees.length === 0 &&
//       childFormData.selectedOneTimeFees.length === 0 &&
//       parseFloat(childFormData.totalAmount) > onlyPayingDuesAndFines
//     ) {
//       toast.warn(
//         `Amount paid for ${child.studentName} (₹${parseFloat(
//           childFormData.totalAmount
//         ).toFixed(
//           2
//         )}) exceeds past dues and late fines (Total ₹${onlyPayingDuesAndFines.toFixed(
//           2
//         )}), but no specific month or other fee is selected. Please select the items being paid for or adjust the amount. If this is an advance payment, please add a remark.`
//       );
//       return false;
//     }
//     return true;
//   };

//   const handleUnifiedFeePayment = async () => {
//     console.log("Attempting unified fee payment...");
//     if (selectedChildrenIndices.length < 2) {
//       toast.warn("Please select at least two students for unified payment.");
//       return;
//     }
  
//     let isValid = true;
//     let totalUnifiedAmount = 0;
//     const studentsPayload = [];
  
//     for (const index of selectedChildrenIndices) {
//       const childFormData = formData[index];
//       const child = parentData[index];
  
//       if (childFormData.isExempt) {
//         // Calculate exemption amount based on net payable
//         const netPayable = calculateNetPayableAmount(index);
//         childFormData.exemption = netPayable.toFixed(2);
//         childFormData.totalAmount = "0";
//       }
  
//       if (!validateFormData(childFormData, child, true)) {
//         isValid = false;
//         break;
//       }
  
//       const amountForThisChild = parseFloat(childFormData.totalAmount) || 0;
//       if (!childFormData.isExempt && amountForThisChild <= 0) {
//         toast.warn(
//           `Please enter an amount (> 0) to pay for ${child.studentName} in the unified payment.`
//         );
//         isValid = false;
//         break;
//       }
//       totalUnifiedAmount += amountForThisChild;
  
//       const additionalFeesPayload = [];
//       const selectedMonthNames = childFormData.selectedMonths.map(
//         (m) => m.value
//       );
  
//       childFormData.selectedAdditionalFees.forEach((fee) => {
//         if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//           fee.dueMonths.forEach((monthName) => {
//             const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(
//               (m) => m.month === monthName
//             );
//             const isFeeDueForThisMonth = monthStatus?.additionalFees?.some(
//               (mf) => mf.name === fee.name && mf.status !== "Paid"
//             );
//             if (isFeeDueForThisMonth) {
//               additionalFeesPayload.push({ name: fee.name, month: monthName });
//             }
//           });
//         } else if (fee.frequency === "one-time") {
//           additionalFeesPayload.push({ name: fee.name });
//         }
//       });
  
//       childFormData.selectedOneTimeFees.forEach((fee) => {
//         additionalFeesPayload.push({ name: fee.name });
//       });
  
//       // Calculate exemption amount for payload
//       let exemptionAmount = parseFloat(childFormData.exemption) || 0;
//       if (childFormData.isExempt) {
//         exemptionAmount = calculateNetPayableAmount(index);
//       }
  
//       studentsPayload.push({
//         studentId: child.studentId,
//         paymentDetails: {
//           regularFees: childFormData.selectedMonths.map((monthState) => ({
//             month: monthState.value,
//           })),
//           additionalFees: additionalFeesPayload,
//           pastDuesPaid: 0,
//           lateFinesPaid: 0,
//           concession: parseFloat(childFormData.concession) || 0,
//           exemption: exemptionAmount,
//           totalAmount: childFormData.isExempt ? 0 : amountForThisChild,
//         },
//       });
//     }
  
//     if (!isValid || studentsPayload.length !== selectedChildrenIndices.length) {
//       console.error("Unified payment validation failed or payload mismatch.");
//       return;
//     }
  
//     const firstChildIndex = selectedChildrenIndices[0];
//     const firstChildFormData = formData[firstChildIndex];
  
//     if (!firstChildFormData.paymentMode) {
//       toast.error(
//         `Payment mode is required (using details from ${parentData[firstChildIndex].studentName}).`
//       );
//       return;
//     }
//     if (
//       (firstChildFormData.paymentMode === "Online" ||
//         firstChildFormData.paymentMode === "Card") &&
//       !firstChildFormData.transactionId
//     ) {
//       toast.error(
//         `Transaction ID is required for Online/Card payment (using details from ${parentData[firstChildIndex].studentName}).`
//       );
//       return;
//     }
//     if (
//       firstChildFormData.paymentMode === "Cheque" &&
//       !firstChildFormData.chequeBookNo
//     ) {
//       toast.error(
//         `Cheque Number is required for Cheque payment (using details from ${parentData[firstChildIndex].studentName}).`
//       );
//       return;
//     }
//     if (
//       !firstChildFormData.date ||
//       !moment(firstChildFormData.date, "YYYY-MM-DD", true).isValid()
//     ) {
//       toast.error(
//         `Please select a valid payment date (using details from ${parentData[firstChildIndex].studentName}).`
//       );
//       return false;
//     }
  
//     const unifiedPaymentDetails = {
//       paymentMode: firstChildFormData.paymentMode,
//       transactionId: firstChildFormData.transactionId || undefined,
//       chequeNumber: firstChildFormData.chequeBookNo || undefined,
//       date: moment(firstChildFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
//       remark: firstChildFormData.remarks || "",
//     };
  
//     const payload = {
//       students: studentsPayload,
//       session,
//       unifiedPaymentDetails,
//     };
  
//     console.log("Unified Payload:", JSON.stringify(payload, null, 2));
  
//     setIsLoader(true);
//     try {
//       const response = await feescreateUnifiedFeeStatus(payload);
//       if (response.success) {
//         toast.success(
//           response.message || "Unified fees submitted successfully!"
//         );
//         setUnifiedReceiptData(response.data);
//         setIsMessageModalOpen(true);
//       } else {
//         toast.error(response.message || "Unified fee submission failed.");
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || error.message;
//       toast.error(`Error during unified submission: ${errorMsg}`);
//       console.error("Unified Submission Error:", error.response || error);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const handleSubmit = async (e, childIndex) => {
//     e.preventDefault();
//     e.stopPropagation();
//     console.log(`Attempting single submission for index: ${childIndex}`);
//     const childFormData = formData[childIndex];
//     const child = parentData[childIndex];
  
//     if (!validateFormData(childFormData, child)) {
//       return;
//     }
  
//     setIsLoader(true);
  
//     const monthlyFeesPayload = [];
//     const oneTimeFeesPayload = [];
//     const selectedMonthNames = childFormData.selectedMonths.map((m) => m.value);
//     const selectedOneTimeFeeNames = childFormData.selectedOneTimeFees.map(
//       (fee) => fee.name
//     );
  
//     // Include selected additional fees for the current payment (monthly only)
//     childFormData.selectedAdditionalFees.forEach((fee) => {
//       if (fee.frequency === "monthly" && fee.dueMonths?.length > 0) {
//         fee.dueMonths.forEach((monthName) => {
//           const monthStatus = childFormData.feeInfo?.monthlyStatus?.find(
//             (m) => m.month === monthName
//           );
//           const isFeeDueForThisMonth = monthStatus?.additionalFees?.some(
//             (mf) => mf.name === fee.name && mf.status !== "Paid"
//           );
//           if (isFeeDueForThisMonth) {
//             monthlyFeesPayload.push({
//               name: fee.name,
//               month: monthName,
//             });
//           }
//         });
//       }
//     });
  
//     // Automatically include remaining dues from previous months (monthly fees only)
//     const selectedAdditionalFeeDues = childFormData.selectedAdditionalFees
//       .filter((fee) => fee.frequency === "monthly")
//       .flatMap((fee) =>
//         fee.dueMonths.map((month) => ({ name: fee.name, month }))
//       );
//     const remainingDues = childFormData.monthlyDues.additionalDues
//       .filter((due) => {
//         const feeStructure =
//           childFormData.feeInfo?.feeStructure?.additionalFees?.find(
//             (fs) => fs.name === due.name
//           );
//         return (
//           due.dueAmount > 0 &&
//           !selectedMonthNames.includes(due.month) &&
//           !selectedAdditionalFeeDues.some(
//             (selected) =>
//               selected.name === due.name && selected.month === due.month
//           ) &&
//           feeStructure?.frequency === "monthly" &&
//           !selectedOneTimeFeeNames.includes(due.name)
//         );
//       })
//       .map((due) => ({ name: due.name, month: due.month }));
  
//     monthlyFeesPayload.push(...remainingDues);
  
//     // Include selected one-time fees from selectedOneTimeFees
//     childFormData.selectedOneTimeFees.forEach((fee) => {
//       oneTimeFeesPayload.push({
//         name: fee.name,
//       });
//     });
  
//     // Combine payloads: monthly fees first, then one-time fees
//     const additionalFeesPayload = [
//       ...monthlyFeesPayload,
//       ...oneTimeFeesPayload,
//     ];
  
//     // Calculate exemption amount if isExempt is true
//     let exemptionAmount = parseFloat(childFormData.exemption) || 0;
//     if (childFormData.isExempt) {
//       exemptionAmount = calculateNetPayableAmount(childIndex);
//     }
  
//     const payload = {
//       studentId: child.studentId,
//       session,
//       paymentDetails: {
//         regularFees: childFormData.selectedMonths.map((monthState) => ({
//           month: monthState.value,
//         })),
//         additionalFees: additionalFeesPayload,
//         pastDuesPaid: 0,
//         lateFinesPaid: 0,
//         concession: parseFloat(childFormData.concession) || 0,
//         exemption: exemptionAmount,
//         totalAmount: childFormData.isExempt
//           ? 0
//           : parseFloat(childFormData.totalAmount) || 0,
//         date: childFormData.date?moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY") :moment(new Date()).format("DD-MM-YYYY"),
//         paymentMode: childFormData.paymentMode,
//         transactionId: childFormData.transactionId || undefined,
//         chequeNumber: childFormData.chequeBookNo || undefined,
//         remark: childFormData.remarks || "",
//       },
//     };
  
//     console.log("Single Submission Payload:", JSON.stringify(payload, null, 2));
  
//     try {
//       const response = await feescreateFeeStatus(payload);
//       if (response?.success) {
//         toast.success(
//           response?.message ||
//             `Fees submitted successfully for ${child.studentName}!`
//         );
//         setResponseData(response?.data);
//         setIsMessageModalOpen(true);
//       } else {
//         toast.error(
//           response?.message || `Fee submission failed for ${child.studentName}.`
//         );
//       }
//     } catch (error) {
//       const errorMsg = error.response?.data?.message || error.message;
//       toast.error(
//         `An error occurred during submission for ${child.studentName}: ${errorMsg}`
//       );
//       console.error("Single Submission Error:", error.response || error);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   const handleCloseMessageModal = async (sendMsg = false) => {
//     // console.log(`Closing message modal, sendMsg=${sendMsg}`);
//     setIsMessageModalOpen(false);
//     let receiptNumber = null;
//     let isUnified = false;
//     let dataForActions = null;

//     if (responseData) {
//       receiptNumber = responseData.feeReceiptNumber;
//       isUnified = false;
//       dataForActions = responseData;
//     } else if (unifiedReceiptData) {
//       receiptNumber = unifiedReceiptData.unifiedReceiptNumber;
//       isUnified = true;
//       dataForActions = unifiedReceiptData;
//     }

//     if (sendMsg && dataForActions) {
//       if (isUnified) {
//         sendUnifiedMessage(dataForActions);
//       } else {
//         sendMessage(dataForActions);
//       }
//     }

//     const tempReceiptNumber = receiptNumber;
//     const tempIsUnified = isUnified;
//     const tempParentId =
//       responseData?.student?.parentId || unifiedReceiptData?.parentId || null;

//     resetState();
//     setResponseData(null);
//     setUnifiedReceiptData(null);

//     if (tempParentId) {
//       console.log(
//         `Refreshing data for parentId: ${tempParentId} after submission.`
//       );
//       await handleStudentClick(tempParentId);
//     } else {
//       setTriggerRefresh((prev) => !prev);
//     }

//     if (tempReceiptNumber) {
//       const fetchedReceiptData = await fetchReceiptData(
//         tempReceiptNumber,
//         tempIsUnified
//       );
//       if (fetchedReceiptData) {
//         if (tempIsUnified) {
//           setUnifiedReceiptModalOpen(true);
//         } else {
//           setPdfModalOpen(true);
//         }
//       }
//     }
//   };

//   const handleClosePdfModal = (action = null) => {
//     console.log(`Closing PDF modal, action=${action}`);
//     if (action === "download" && receiptData) {
//       handleDownloadPdf(receiptData);
//     } else if (action === "print" && receiptData) {
//       handlePrintReceipt(receiptData);
//     }
//     setPdfModalOpen(false);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//   };

//   const handleCloseUnifiedReceiptModal = (action = null) => {
//     console.log(`Closing Unified PDF modal, action=${action}`);
//     if (action === "download" && receiptData) {
//       handleDownloadUnifiedPdf(receiptData);
//     } else if (action === "print" && receiptData) {
//       handlePrintUnifiedReceipt(receiptData);
//     }
//     setUnifiedReceiptModalOpen(false);
//     setReceiptData(null);
//     setIsPreviewReady(false);
//   };

//   const handleDownloadPdf = (dataToUse) => {
//     if (!dataToUse?.data) {
//       toast.error("No receipt data available to generate PDF.");
//       return;
//     }
//     generatePdf(
//       dataToUse.data,
//       [],
//       0,
//       0,
//       0,
//       0,
//       0,
//       0,
//       `fee-receipt-${dataToUse.data?.feeReceiptNumber}.pdf`
//     );
//   };

//   const handlePrintReceipt = (dataToUse) => {
//     if (!dataToUse?.data) {
//       toast.error("No receipt data available to print.");
//       return;
//     }
//     console.log(
//       "Print action triggered for single receipt:",
//       dataToUse.data?.feeReceiptNumber
//     );
//     toast.info(
//       "Print functionality placeholder: would print receipt " +
//         dataToUse.data?.feeReceiptNumber
//     );
//   };

//   const sendMessage = (dataToUse) => {
//     if (!dataToUse) {
//       toast.error("No receipt data available to send message.");
//       return;
//     }
//     console.log("Sending SINGLE fee response message:", dataToUse);
//     try {
//       FeeResponse(dataToUse);
//       toast.info(`SMS function called for ${dataToUse?.student?.studentName}`);
//     } catch (error) {
//       console.error("Error calling FeeResponse for single payment:", error);
//       toast.error("Failed to initiate SMS sending.");
//     }
//   };

//   const handleDownloadUnifiedPdf = (dataToUse) => {
//     if (!dataToUse?.data) {
//       toast.error("No unified receipt data available to generate PDF.");
//       return;
//     }
//     generatePdf(
//       dataToUse.data,
//       [],
//       0,
//       0,
//       0,
//       0,
//       0,
//       0,
//       `unified-receipt-${dataToUse.data?.unifiedReceiptNumber}.pdf`
//     );
//   };

//   const handlePrintUnifiedReceipt = (dataToUse) => {
//     if (!dataToUse?.data) {
//       toast.error("No unified receipt data available to print.");
//       return;
//     }
//     console.log(
//       "Print action triggered for unified receipt:",
//       dataToUse.data?.unifiedReceiptNumber
//     );
//     toast.info(
//       "Print functionality placeholder: would print unified receipt " +
//         dataToUse.data?.unifiedReceiptNumber
//     );
//   };

//   const sendUnifiedMessage = (dataToUse) => {
//     if (!dataToUse) {
//       toast.error("No unified receipt data available to send message.");
//       return;
//     }
//     console.log("Sending UNIFIED fee response message:", dataToUse);
//     try {
//       FeeResponseSibling(dataToUse?.feeReceipts);
//       const studentNames =
//         dataToUse?.students?.map((s) => s.studentName).join(", ") ||
//         "selected students";
//       toast.info(`SMS function called for ${studentNames}`);
//     } catch (error) {
//       console.error("Error calling FeeResponse for unified payment:", error);
//       toast.error("Failed to initiate SMS sending.");
//     }
//   };

//   return (
//     <div className="">
//        <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Create Fee" />
//       <div className=" mx-auto">
//         <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-col sm:flex-row gap-4 ">
//           <ReactInput
//             type="text"
//             label="Search by Name"
//             onChange={handleSearch}
//             value={searchTerm}
//             containerClassName="flex-1 min-w-[200px]"
//             className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//           />
//           <ReactInput
//             type="text"
//             label="Search by Adm. No"
//             onChange={handleSearchbyAdmissionNo}
//             value={searchTermbyadmissionNo}
//             containerClassName="flex-1 min-w-[200px]"
//             className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//           />
//         </div>

//         {filteredStudents.length > 0 && (
//           <div className="relative">
//             <div className="absolute z-30 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto ">
//               <table className="w-full border-collapse">
//                 <thead className="bg-gray-100 sticky top-0 z-20">
//                   <tr>
//                   <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
//                       Adm No.
//                     </th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
//                       Student Name
//                     </th>
                   
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
//                       Class
//                     </th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
//                       Parent Name
//                     </th>
//                     <th className="p-1 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
//                       Contact
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredStudents.map((student) => (
//                     <tr
//                       key={student._id}
//                       className="cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out border-b border-gray-300"
//                       onClick={() => {
//                         console.log(
//                           `Search result clicked: ${student.studentName} (ParentID: ${student.parentId})`
//                         );
//                         handleStudentClick(student.parentId);
//                         setFilteredStudents([]);
//                       }}
//                     >
//                       <td className="p-1 text-[13px] text-grey-600">
//                         {student.admissionNumber}
//                       </td>
//                       <td className="p-1 font-semibold text-[13px] text-gray-800">
//                         {student.studentName}
//                       </td>
                      
//                       <td className="p-1 text-[13px]  text-gray-600">
//                         {student.class}
//                       </td>
//                       <td className="p-1 text-[13px]  text-gray-600">
//                         {student.fatherName}
//                       </td>
//                       <td className="p-1 text-[13px]  text-gray-600">
//                         {student?.parentContact}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>
//         )}

//         {showChildForms && parentData.length > 0 && (
//           <div className=" pt-2 border-t border-gray-200">
//             <div className="flex justify-between items-center">
//               <h5 className="text-sm font-semibold text-gray-800">
//                 Selected Student(s) Fee Payment
//               </h5>
//               {selectedChildrenIndices.length > 1 && (
//                 <Button
//                   name="Pay for Siblings Together"
//                   onClick={handleUnifiedFeePayment}
//                   className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
//                 />
//               )}
//             </div>

//             {/* <div className="grid grid-cols-1 gap-6"> */}
//             <div className="flex flex-col gap-2">
//               {parentData.map((child, index) => {
//                 const currentFormData = formData[index];

//                 if (!currentFormData || currentFormData.error) {
//                   return (
//                     <div
//                       key={child._id || index}
//                       className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md"
//                       role="alert"
//                     >
//                       <strong className="font-bold">Error:</strong>
//                       <span className="block sm:inline ml-2">
//                         Could not load fee data for{" "}
//                         {child.studentName || "this student"} (Adm:{" "}
//                         {child.admissionNumber || "N/A"}). Please try searching
//                         again or contact support.
//                       </span>
//                     </div>
//                   );
//                 }

//                 const isSelected = selectedChildrenIndices.includes(index);
//                 const showForm = showFormFlags[index];

//                 const monthOptions = currentFormData.regularFees
//                   .filter((fee) => fee.dueAmount > 0)
//                   .map((fee) => ({ name: fee.label, code: fee.month }));
//                 const selectedMonthValues = currentFormData.selectedMonths.map(
//                   (monthState) => ({
//                     name: monthState.label,
//                     code: monthState.value,
//                   })
//                 );

//                 const additionalFeeOptions =
//                   currentFormData.availableAdditionalFees
//                     .filter((fee) => fee.frequency === "monthly")
//                     .map((item) => ({ name: item.label, code: item.id }));
//                 const selectedAdditionalFeeValues =
//                   currentFormData.selectedAdditionalFees
//                     .filter((fee) => fee.frequency === "monthly")
//                     .map((selectedFee) => {
//                       const availableOption = additionalFeeOptions.find(
//                         (opt) => opt.code === selectedFee.id
//                       );
//                       return {
//                         name: availableOption
//                           ? availableOption.name
//                           : `${selectedFee.name} (${selectedFee.type}) - ₹${selectedFee.amount}`,
//                         code: selectedFee.id,
//                       };
//                     });

//                 const oneTimeFeeOptions = currentFormData.oneTimeFeeOptions.map(
//                   (item) => ({ name: item.label, code: item.code })
//                 );
//                 const selectedOneTimeFeeValues =
//                   currentFormData.selectedOneTimeFees.map((fee) => {
//                     const availableOption = oneTimeFeeOptions.find(
//                       (opt) => opt.code === fee.name
//                     );
//                     return {
//                       name: availableOption
//                         ? availableOption.name
//                         : `${fee.name} (Due: ₹${fee.dueAmount.toFixed(2)})`,
//                       code: fee.name,
//                     };
//                   });

//                 return (
//                   <div
//                     key={child._id || index}
//                     className={`bg-white rounded-lg shadow-md border transition-all duration-300 ${
//                       isSelected
//                         ? "border-blue-500 ring-1 ring-blue-300"
//                         : "border-gray-200 hover:border-gray-300"
//                     } overflow-hidden`}
//                   >
//                     <div
//                       className={`flex items-center px-4 py-1 border-b ${
//                         isSelected ? "" : ""
//                         // isSelected ? "bg-blue-50" : "bg-gray-50"
//                       } cursor-pointer`}
//                       onClick={() => {
//                         console.log(`DIV clicked for index: ${index}`);
//                         handleChildSelection(index);
//                       }}
//                     >
//                       <input
//                         type="checkbox"
//                         id={`child-checkbox-${index}`}
//                         checked={isSelected}
//                         onChange={(e) => {
//                           e.stopPropagation();
//                           console.log(`CHECKBOX changed for index: ${index}`);
//                           handleChildSelection(index);
//                         }}
//                         className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
//                         aria-labelledby={`child-label-${index}`}
//                       />
//                       <label
//                         id={`child-label-${index}`}
//                         className="flex-grow cursor-pointer"
//                         htmlFor={`child-checkbox-${index}`}
//                       >
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <span className="text-base font-semibold text-blue-800">
//                               {child.studentName}
//                             </span>
//                             <span className="text-sm text-gray-600 ml-2">
//                               (Class: {child.class} / Adm#:{" "}
//                               {child.admissionNumber})
//                             </span>
//                           </div>
//                           <span
//                             className={`text-xs font-bold px-2 py-0.5 rounded-full ${
//                               isSelected
//                                 ? "bg-blue-200 text-blue-800"
//                                 : "bg-gray-200 text-gray-700"
//                             }`}
//                           >
//                             {isSelected ? "SELECTED" : "SELECT"}
//                           </span>
//                         </div>
//                         <div className="flex flex-wrap justify-start items-center gap-x-4 text-xs mt-1">
//                           <span className="text-red-600 font-medium">
//                             Total Dues: ₹
//                             {currentFormData?.totalDues?.toFixed(2) || "0.00"}
//                           </span>
//                           {currentFormData?.pastDues > 0 && (
//                             <span className="text-purple-600 font-medium">
//                               Past Dues: ₹
//                               {currentFormData?.pastDues?.toFixed(2)}
//                             </span>
//                           )}
//                           {currentFormData?.lateFine > 0 && (
//                             <span className="text-orange-600 font-medium">
//                               Late Fine: ₹
//                               {currentFormData?.lateFine?.toFixed(2)}
//                             </span>
//                           )}
//                           <span className="text-gray-600 font-medium">
//                             Base Monthly Fee: ₹
//                             {currentFormData?.classFee?.toFixed(2) || "0.00"}
//                           </span>
//                         </div>
//                       </label>
//                     </div>

//                     <div
//                       className={`transition-all duration-500 ease-in-out overflow-hidden ${
//                         showForm
//                           ? "max-h-[2000px] opacity-100"
//                           : "max-h-0 opacity-0"
//                       }`}
//                     >
//                       {showForm && (
//                         <div className="px-1 py-1 border-t flex flex-col lg:flex-row gap-1 bg-white">
//                           <form
//                             onSubmit={(e) => handleSubmit(e, index)}
//                             className="flex-grow lg:w-2/3 space-y-5 mb-6 lg:mb-0"
//                             noValidate
//                           >
//                             <div className="border rounded-md p-1 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
//                               <div className="md:col-span-1">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Monthly Fees
//                                 </label>
//                                 <DynamicMultiSelect
//                                 // style={{backgroundColor:"red"}}
//                                   name={`regularFees-${index}`}
//                                   searchable={false}
//                                   placeholderName="Select month(s)..."
//                                   dynamicOptions={monthOptions}
//                                   handleChange={(name, opts) =>
//                                     handleMonthMultiSelectChange(
//                                       index,
//                                       name,
//                                       opts
//                                     )
//                                   }
//                                   value={selectedMonthValues}
//                                   requiredClassName={"required-fields"}
//                                   containerClassName="w-full"
//                                   menuClassName="w-full min-w-[200px] whitespace-normal"
//                                 />
//                                 {/* <p className="text-xs text-gray-500 mt-1">
//                                   Select consecutive months with dues.
//                                 </p> */}
//                               </div>
//                               <div className="md:col-span-1">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                   Additional(Monthly)
//                                 </label>
//                                 <DynamicMultiSelect
//                                   name={`additionalFees-${index}`}
//                                   searchable={true}
//                                   placeholderName="Select monthly fee(s)..."
//                                   dynamicOptions={additionalFeeOptions}
//                                   handleChange={(name, opts) =>
//                                     handleDynamicMultiSelectChange(
//                                       index,
//                                       "selectedAdditionalFees",
//                                       opts
//                                     )
//                                   }
//                                   value={selectedAdditionalFeeValues}
//                                   requiredClassName={"required-fields"}
//                                   containerClassName="w-full"
//                                   menuClassName="w-full min-w-[200px] whitespace-normal"
//                                 />
//                                 {/* <p className="text-xs text-gray-500 mt-1">
//                                   Monthly fees auto-selected with months.
//                                 </p> */}
//                               </div>
//                               <div className="md:col-span-1">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">
//                                   One-Time
//                                 </label>
//                                 <DynamicMultiSelect
//                                   name={`oneTimeFees-${index}`}
//                                   searchable={true}
//                                   placeholderName="Select one-time fee(s)..."
//                                   dynamicOptions={oneTimeFeeOptions}
//                                   handleChange={(name, opts) =>
//                                     handleDynamicMultiSelectChange(
//                                       index,
//                                       "selectedOneTimeFees",
//                                       opts
//                                     )
//                                   }
//                                   value={selectedOneTimeFeeValues}
//                                   requiredClassName={"required-fields"}
//                                   containerClassName="w-full"
//                                   menuClassName="w-full min-w-[200px] whitespace-normal"
//                                 />
                               
//                               </div>
//                             </div>

//                             <div className="flex flex-wrap gap-4">
                            
//                                 <ExemptionToggle
//                                   isExempt={currentFormData.isExempt}
//                                   onChange={(value) =>
//                                     handleInputChange(index, "isExempt", value)
//                                   }
//                                   studentName={child.studentName}
//                                 />
//                                 {
//                                   currentFormData.isExempt && <ReactInput
//                                   type="number"
//                                   label="Exemption"
//                                   value={currentFormData.exemption}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "exemption",
//                                       e.target.value
//                                     )
//                                   }
//                                   min="0"
//                                   step="0.01"
//                                   containerClassName="sm:col-span-1"
//                                   className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//                                   disabled={!currentFormData.isExempt}
//                                 />
//                                 }
//                          <DatePicker
//                                                           className="custom-calendar"
//                                                           placeholder="" 
//                                                            label="Payment Date"
//                                                           respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
//                                                           name="date"
//                                                           id="date"
//                                                           value={currentFormData.date ? new Date(currentFormData.date) : new Date()}
//                                                           handleChange={(e) =>
//                                                             handleInputChange(
//                                                               index,
//                                                               "date",
//                                                               e.target.value
//                                                             )
//                                                           }
//                                                           // showaTime 
//                                                           hourFormat="12"
//                                                       />
//   {/* Add a top border to separate */}
//   <tr className="border-t bg-blue-50 rounded-md dark:border-gray-600 dark:bg-blue-900/20"> {/* Light blue background */}
//       <td className="px-4 py-1 text-sm font-medium text-gray-700 dark:text-gray-300"> {/* Slightly more vertical padding */}
//           Payable
//       </td>
//       <td className="px-4 py-1 text-sm font-semibold text-blue-700 dark:text-blue-400 text-right whitespace-nowrap">
//           ₹ {calculateNetPayableAmount(index).toFixed(2)}
//       </td>
//   </tr>

//   {
//     currentFormData.totalAmount>0 &&  <tr className="bg-red-50 rounded-md dark:bg-red-900/20"> {/* Light red background */}
//     <td className="px-4 py-1 text-sm font-medium text-gray-700 dark:text-gray-300">
//         Dues
//     </td>
//     <td className="px-4 py-1 text-sm font-semibold text-red-600 dark:text-red-400 text-right whitespace-nowrap">
//         ₹ {calculateAutoDistribution(index).remainingDues.toFixed(2)}
//     </td>
// </tr>
//   }
 
//                            </div>
//                             <div className="flex  gap-4">
//                               <ReactInput
//                                 type="number"
//                                 label="Concession"
//                                 value={currentFormData.concession}
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "concession",
//                                     e.target.value
//                                   )
//                                 }
//                                 min="0"
//                                 step="0.01"
//                                 containerClassName="sm:col-span-1"
//                                 className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//                               />
                              
//                                <ReactSelect
//                                         name="filterClass"
//                                         value={currentFormData.paymentMode}
//                                         handleChange={(e) =>
//                                           handleInputChange(
//                                             index,
//                                             "paymentMode",
//                                             e.target.value
//                                           )
//                                         }
//                                         label="Payment Mode "
//                                         dynamicOptions={[
//                                           { label: "Cash", value: "Cash" },
//                                           { label: "Online", value: "Online" },
//                                           { label: "Cheque", value: "Cheque" },
//                                           { label: "Card", value: "Card" },
//                                         ]}
//                                       />
                              
//                               {(currentFormData.paymentMode === "Online" ||
//                                 currentFormData.paymentMode === "Card") && (
//                                 <ReactInput
//                                   type="text"
//                                   label="Transaction ID "
//                                   value={currentFormData.transactionId}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "transactionId",
//                                       e.target.value
//                                     )
//                                   }
//                                   isRequired={true}
//                                   className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//                                 />
//                               )}
//                               {currentFormData.paymentMode === "Cheque" && (
//                                 <ReactInput
//                                   type="text"
//                                   label="Cheque Number"
//                                   value={currentFormData.chequeBookNo}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "chequeBookNo",
//                                       e.target.value
//                                     )
//                                   }
//                                   isRequired={true}
//                                   className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//                                 />
//                               )}
//                               <ReactInput
//                                 type="number"
                               
//                                 label={`Amount to Pay`}
//                                 value={currentFormData.totalAmount}
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "totalAmount",
//                                     e.target.value
//                                   )
//                                 }
//                                 min="0.01"
//                                 step="0.01"
//                                 isRequired={!currentFormData.isExempt}
//                                 containerClassName="sm:col-span-1"
//                                 className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
//                                 disabled={currentFormData.isExempt}
//                               />
                              
//                             </div>

//                             <div className="sm:col-span-2">
                              
//                               <textarea
//                                 value={currentFormData.remarks}
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "remarks",
//                                     e.target.value
//                                   )
//                                 }
//                                 className=" block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
//                                 rows="1"
//                                 placeholder="Optional remarks about payment..."
//                               />
//                             </div>

//                             {selectedChildrenIndices.length <= 1 && (
//                               <div className="flex justify-end ">
//                                 <Button
//                                   type="submit"
//                                   name={`Submit Payment for ${child.studentName}`}
//                                   className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
//                                 />
//                               </div>
//                             )}
//                           </form>

//                           <div className="flex-shrink-0 lg:w-1/3 border rounded-md p-1 bg-blue-50 lg:ml-4  lg:mt-0">
//                             <h3 className="text-sm font-semibold text-blue-900 border-b border-blue-200 ">
//                               Payment Summary
//                             </h3>
//                             <div className="overflow-y-auto max-h-52 scrollbar-thin scrollbar-thumb-gray-400 dark:scrollbar-thumb-gray-600 scrollbar-track-gray-100 dark:scrollbar-track-gray-800">
//                             <table className="w-full text-sm ">
//                               <tbody className="">
//                                 {currentFormData.pastDues > 0 && (
//                                   <tr className="border-b border-blue-100">
//                                     <td className="text-gray-700 py-1">
//                                       Past Dues
//                                     </td>
//                                     <td className="font-medium text-purple-700 py-1 text-right">
//                                       ₹{currentFormData.pastDues.toFixed(2)}
//                                     </td>
//                                   </tr>
//                                 )}
//                                 {currentFormData.lateFine > 0 && (
//                                   <tr className="border-b border-blue-100">
//                                     <td className="text-gray-700 py-1">
//                                       Late Fines
//                                     </td>
//                                     <td className="font-medium text-orange-700 py-1 text-right">
//                                       ₹{currentFormData.lateFine.toFixed(2)}
//                                     </td>
//                                   </tr>
//                                 )}
//                                 {/* Remaining Dues from Previous Months */}
//                                 {(() => {
//                                   const selectedMonthNames =
//                                     currentFormData.selectedMonths.map(
//                                       (m) => m.value
//                                     );
//                                   const selectedAdditionalFeeDues =
//                                     currentFormData.selectedAdditionalFees
//                                       .filter(
//                                         (fee) => fee.frequency === "monthly"
//                                       )
//                                       .flatMap((fee) =>
//                                         fee.dueMonths.map((month) => ({
//                                           name: fee.name,
//                                           month,
//                                         }))
//                                       );
//                                   // Filter out one-time fees from remaining dues
//                                   const remainingDues =
//                                     currentFormData.monthlyDues.additionalDues
//                                       .filter((due) => {
//                                         const feeStructure =
//                                           currentFormData.feeInfo?.feeStructure?.additionalFees?.find(
//                                             (fs) => fs.name === due.name
//                                           );
//                                         return (
//                                           due.dueAmount > 0 &&
//                                           !selectedMonthNames.includes(
//                                             due.month
//                                           ) &&
//                                           !selectedAdditionalFeeDues.some(
//                                             (selected) =>
//                                               selected.name === due.name &&
//                                               selected.month === due.month
//                                           ) &&
//                                           feeStructure?.frequency === "monthly" // Only include monthly fees
//                                         );
//                                       })
//                                       .reduce((acc, due) => {
//                                         const existing = acc.find(
//                                           (item) =>
//                                             item.name === due.name &&
//                                             item.month === due.month
//                                         );
//                                         if (existing) {
//                                           existing.amount += due.dueAmount;
//                                         } else {
//                                           acc.push({
//                                             name: due.name,
//                                             month: due.month,
//                                             amount: due.dueAmount,
//                                           });
//                                         }
//                                         return acc;
//                                       }, []);
//                                   if (remainingDues.length > 0) {
//                                     return (
//                                       <>
//                                         <tr className="border-b border-blue-100 font-medium text-gray-800">
//                                           <td colSpan="2" className="py-1">
//                                             Remaining Dues from Previous Months
//                                           </td>
//                                         </tr>
//                                         {remainingDues.map((due, i) => (
//                                           <tr
//                                             key={`remaining-due-${index}-${i}`}
//                                             className="border-b border-blue-100"
//                                           >
//                                             <td className="text-gray-600 py-1 pl-3">
//                                               {due.name} ({due.month})
//                                             </td>
//                                             <td className="font-medium text-blue-700 py-1 text-right">
//                                               ₹{due.amount.toFixed(2)}
//                                             </td>
//                                           </tr>
//                                         ))}
//                                       </>
//                                     );
//                                   }
//                                   return null;
//                                 })()}
//                                 {currentFormData.selectedMonths.length > 0 && (
//                                   <>
//                                     <tr className="border-b border-blue-100 font-medium text-gray-800">
//                                       <td colSpan="2" className="py-[2px]">
//                                         Regular Fees
//                                       </td>
//                                     </tr>
//                                     {currentFormData.selectedMonths.map(
//                                       (monthState, i) => (
//                                         <tr
//                                           key={`reg-sum-${index}-${i}`}
//                                           className="border-b border-blue-100"
//                                         >
//                                           <td className="text-gray-600 py-[2px] pl-3">
//                                             {monthState.value}
//                                           </td>
//                                           <td className="font-medium text-blue-700 py-[2px] text-right">
//                                             ₹{(monthState?.due || 0).toFixed(2)}
//                                           </td>
//                                         </tr>
//                                       )
//                                     )}
//                                   </>
//                                 )}
//                                 {currentFormData.selectedAdditionalFees.length >
//                                   0 && (
//                                   <>
//                                     <tr className="border-b border-blue-100 font-medium text-gray-800">
//                                       <td colSpan="2" className="pt-2 pb-1">
//                                         Additional Fees
//                                       </td>
//                                     </tr>
//                                     {currentFormData.selectedAdditionalFees
//                                       .filter(
//                                         (fee) =>
//                                           fee.frequency === "monthly" &&
//                                           fee.dueMonths.some((month) =>
//                                             currentFormData.selectedMonths
//                                               .map((m) => m.value)
//                                               .includes(month)
//                                           )
//                                       )
//                                       .map((fee, i) => (
//                                         <tr
//                                           key={`add-sum-${index}-${i}`}
//                                           className="border-b border-blue-100"
//                                         >
//                                           <td className="text-gray-600 py-[2px] pl-3">
//                                             {fee.name} ({fee.type},{" "}
//                                             {fee.dueMonths.join(", ")})
//                                           </td>
//                                           <td className="font-medium text-blue-700 py-[2px] text-right">
//                                             ₹{fee.amount.toFixed(2)}
//                                           </td>
//                                         </tr>
//                                       ))}
//                                   </>
//                                 )}
//                                 {currentFormData.selectedOneTimeFees.length >
//                                   0 && (
//                                   <>
//                                     <tr className="border-b border-blue-100 font-medium text-gray-800">
//                                       <td colSpan="2" className="pt-2 pb-1">
//                                         One-Time Fees
//                                       </td>
//                                     </tr>
//                                     {currentFormData.selectedOneTimeFees.map(
//                                       (fee, i) => (
//                                         <tr
//                                           key={`one-time-sum-${index}-${i}`}
//                                           className="border-b border-blue-100"
//                                         >
//                                           <td className="text-gray-600 py-[2px] pl-3">
//                                             {fee.name}
//                                           </td>
//                                           <td className="font-medium text-blue-700 py-[2px] text-right">
//                                             ₹{(fee?.dueAmount || 0).toFixed(2)}
//                                           </td>
//                                         </tr>
//                                       )
//                                     )}
//                                   </>
//                                 )}
//                                 {currentFormData.exemption > 0 && ( // New row
//                                   <tr className="border-b border-blue-100">
//                                     <td className="text-green-700 py-[2px]">
//                                       Exemption
//                                     </td>
//                                     <td className="font-medium text-green-700 py-[2px] text-right">
//                                       - ₹
//                                       {parseFloat(
//                                         currentFormData.exemption
//                                       ).toFixed(2)}
//                                     </td>
//                                   </tr>
//                                 )}
//                                 {currentFormData.concession > 0 && (
//                                   <tr className="border-b border-blue-100">
//                                     <td className="text-green-700 py-[2px]">
//                                       Concession
//                                     </td>
//                                     <td className="font-medium text-green-700 py-[2px] text-right">
//                                       - ₹
//                                       {parseFloat(
//                                         currentFormData.concession
//                                       ).toFixed(2)}
//                                     </td>
//                                   </tr>
//                                 )}
//                               </tbody>
                           
//                             </table>
//                           </div>
//                           <tfoot className="border-t-2 border-blue-200 mt-2 pt-2">
//                                 <tr>
//                                   <td className="pt-2 font-semibold text-blue-900 py-[2px]">
//                                     Total Payable
//                                   </td>
//                                   <td className="pt-2 font-bold text-blue-900 py-[2px] text-right">
//                                     ₹
//                                     {calculateNetPayableAmount(index).toFixed(
//                                       2
//                                     )}
//                                   </td>
//                                 </tr>
//                                 {parseFloat(currentFormData.totalAmount) >
//                                   0 && (
//                                   <>
//                                     <tr>
//                                       <td className="text-gray-700 py-[2px]">
//                                         Amount Paying
//                                       </td>
//                                       <td className="font-medium text-black py-[2px] text-right">
//                                         ₹
//                                         {parseFloat(
//                                           currentFormData.totalAmount
//                                         ).toFixed(2)}
//                                       </td>
//                                     </tr>
//                                     <tr>
//                                       <td className="font-semibold text-red-700 py-[2px]">
//                                         Remaining Dues
//                                       </td>
//                                       <td className="font-bold text-red-700 py-[2px] text-right">
//                                         ₹
//                                         {calculateAutoDistribution(
//                                           index
//                                         ).remainingDues.toFixed(2)}
//                                       </td>
//                                     </tr>
//                                     {calculateAutoDistribution(index)
//                                       .remainingAfterDistribution > 0 && (
//                                       <tr>
//                                         <td className="font-semibold text-green-700 py-1 text-xs">
//                                           Advance/Excess
//                                         </td>
//                                         <td className="font-semibold text-green-700 py-1 text-right text-xs">
//                                           ₹
//                                           {calculateAutoDistribution(
//                                             index
//                                           ).remainingAfterDistribution.toFixed(
//                                             2
//                                           )}
//                                         </td>
//                                       </tr>
//                                     )}
//                                   </>
//                                 )}
//                               </tfoot>
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {showChildForms &&
//           childFeeHistory?.monthlyStatus?.length > 0 &&
//           selectedChildrenIndices.length > 0 && (
//             <div className=" mt-2 border-t border-gray-300 ">
//               <h2 className="text-xl font-semibold text-center text-gray-800">
//                 Fee History for{" "}
//                 {childFeeHistory?.studentName || "Selected Student"} (
//                 {childFeeHistory?.session || session})
//               </h2>
//               <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow">
//                 <MonthFeeCard childFeeHistory={childFeeHistory} />
//               </div>
//             </div>
//           )}

//         <Modal
//           setIsOpen={setIsMessageModalOpen}
//           isOpen={isMessageModalOpen}
//           title="Send Confirmation?"
//           maxWidth="md"
//         >
//           <div className="p-5">
//             <p className="text-gray-700 mb-4 text-center">
//               Fee submitted successfully for{" "}
//               <span className="font-semibold">
//                 {responseData?.student?.studentName ||
//                   unifiedReceiptData?.students
//                     ?.map((s) => s.studentName)
//                     .join(", ") ||
//                   "student(s)"}
//               </span>
//               .
//               <br />
//               Receipt Number:{" "}
//               <span className="font-semibold">
//                 {responseData?.feeReceiptNumber ||
//                   unifiedReceiptData?.unifiedReceiptNumber ||
//                   "N/A"}
//               </span>
//               <br />
//               Do you want to send an SMS confirmation to the parent?
//               <br />(
//               <span className="font-mono text-sm">
//                 {responseData?.parent?.fatherPhone ||
//                   unifiedReceiptData?.parent?.fatherPhone ||
//                   "Phone number not available"}
//               </span>
//               )
//             </p>
//             <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//               <Button
//                 type="button"
//                 name="Yes, Send SMS & View Receipt"
//                 onClick={() => handleCloseMessageModal(true)}
//                 className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2"
//               />
//               <Button
//                 type="button"
//                 name="No, Just View Receipt"
//                 onClick={() => handleCloseMessageModal(false)}
//                 className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
//               />
//             </div>
//           </div>
//         </Modal>

//         <Modal
//           setIsOpen={setPdfModalOpen}
//           isOpen={pdfModalOpen}
//           title="Fee Receipt Preview"
//           maxWidth="lg"
//         >
//           <div className="p-1">
//             {!isPreviewReady || !receiptData ? (
//               <p className="text-center p-10 text-gray-600">
//                 Loading receipt preview...
//               </p>
//             ) : (
//               <FeeRecipt
//                 modalData={receiptData}
//                 handleCloseModal={() => handleClosePdfModal()}
//                 handlePrint={() => handleClosePdfModal("print")}
//                 handleDownload={() => handleClosePdfModal("download")}
//                 isPreviewReady={isPreviewReady}
//                 isUnified={false}
//               />
//             )}
//           </div>
//         </Modal>

//         <Modal
//           setIsOpen={setUnifiedReceiptModalOpen}
//           isOpen={unifiedReceiptModalOpen}
//           title="Unified Fee Receipt Preview"
//           maxWidth="lg"
//         >
//           <div className="p-1">
//             {!isPreviewReady || !receiptData ? (
//               <p className="text-center p-10 text-gray-600">
//                 Loading unified receipt preview...
//               </p>
//             ) : (
//               <FeeRecipt
//                 modalData={receiptData}
//                 handleCloseModal={() => handleCloseUnifiedReceiptModal()}
//                 handlePrint={() => handleCloseUnifiedReceiptModal("print")}
//                 handleDownload={() =>
//                   handleCloseUnifiedReceiptModal("download")
//                 }
//                 isPreviewReady={isPreviewReady}
//                 isUnified={true}
//               />
//             )}
//           </div>
//         </Modal>
//       </div>
//     </div>
//   );
// };

// export default SibilingFees;
