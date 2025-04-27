// import React, { useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import moment from "moment";
// import FeeForm from "./FeeForm";
// import FeeHistory from "./FeeHistory";
// import UnifiedPaymentButton from "./UnifiedPaymentButton";

// const allMonths = [
//   "April",
//   "May",
//   "June",
//   "July",
//   "August",
//   "September",
//   "October",
//   "November",
//   "December",
//   "January",
//   "February",
//   "March",
// ];

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
//       }));
//     } else {
//       toast.error(`Failed to fetch additional fees for class ${className}.`);
//       return [];
//     }
//   } catch (error) {
//     toast.error(`Error fetching additional fees for class ${className}: ${error.message}`);
//     return [];
//   }
// };

// const fetchStudentFeeInfo = async (studentId, session, authToken) => {
//   try {
//     const response = await axios.get(
//       `${
//         process.env.REACT_APP_BASE_URL || "https://dvsserver.onrender.com"
//       }/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//       {
//         withCredentials: true,
//         headers: { Authorization: `Bearer ${authToken}` },
//       }
//     );
//     if (response.data.success) {
//       return response.data.data;
//     } else {
//       toast.error(`Fee info fetch failed for student ID ${studentId}: ${response.data.message}`);
//       return null;
//     }
//   } catch (error) {
//     toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
//     return null;
//   }
// };

// const ChildSelector = ({
//   parentData,
//   formData,
//   setFormData,
//   selectedChildrenIndices,
//   setSelectedChildrenIndices,
//   showFormFlags,
//   setShowFormFlags,
//   setChildFeeHistory,
//   setResponseData,
//   setUnifiedReceiptData,
//   setIsMessageModalOpen,
//   authToken,
//   session,
//   onUnifiedPayment,
// }) => {
//   useEffect(() => {
//     const initializeFormData = async () => {
//       const promises = parentData.map((child) =>
//         Promise.all([
//           fetchStudentFeeInfo(child.studentId, session, authToken),
//           fetchAdditionalFeesForClass(child.class, authToken),
//         ])
//       );

//       const results = await Promise.all(promises);
//       const initialFormData = [];
//       const initialShowFormFlags = [];

//       results.forEach(([feeInfo, availableAdditionalFees], index) => {
//         const child = parentData[index];
//         if (!feeInfo) {
//           toast.error(`Could not load fee details for ${child.studentName}. Skipping.`);
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

//         const regularFeeAmount = feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
//         const additionalFeesStructure = feeInfo.feeStructure?.additionalFees || [];
//         const monthlyStatus = feeInfo.monthlyStatus || [];
//         const oneTimeAdditionalDues = feeInfo.oneTimeAdditionalDues || [];
//         const feeHistory = feeInfo.feeStatus?.feeHistory?.[0] || {};

//         const regularFees = allMonths.map((month) => {
//           const monthData = monthlyStatus.find((m) => m.month === month);
//           const due = monthData?.regularFee?.due ?? regularFeeAmount;
//           const status = monthData?.regularFee?.status || "Unpaid";
//           return {
//             month,
//             paidAmount: "",
//             dueAmount: status === "Paid" ? 0 : due,
//             totalAmount: regularFeeAmount,
//             status,
//             label: `${month} (Due: ₹${(status === "Paid" ? 0 : due).toFixed(2)})`,
//           };
//         });

//         const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
//           name: fee.name,
//           type: fee.feeType,
//           amount: fee.amount,
//           months: allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             const addFee = monthData?.additionalFees.find((af) => af.name === fee.name);
//             const due = addFee?.due ?? fee.amount;
//             const status = addFee?.status || "Unpaid";
//             return {
//               month,
//               paidAmount: "",
//               dueAmount: status === "Paid" ? 0 : due,
//               totalAmount: fee.amount,
//               status,
//             };
//           }),
//         }));

//         const oneTimeFeeOptions = oneTimeAdditionalDues
//           .filter((d) => d.dueAmount > 0)
//           .map((d) => ({
//             label: `${d.name} (Due: ₹${d.dueAmount.toFixed(2)})`,
//             name: d.name,
//             code: d.name,
//             dueAmount: d.dueAmount,
//             type: "One-Time",
//           }));

//         const preSelectedMonths =
//           feeHistory?.regularFees
//             ?.filter((fee) => fee.dueAmount > 0 && fee.status === "Unpaid")
//             .map((fee) => {
//               const originalFee = regularFees.find((rf) => rf.month === fee.month);
//               return {
//                 value: fee.month,
//                 label: originalFee?.label || `${fee.month} (Due: ₹${fee.dueAmount.toFixed(2)})`,
//                 due: fee.dueAmount,
//               };
//             }) || [];

//         const preSelectedAdditionalFees = [];
//         feeHistory?.additionalFees
//           ?.filter((fee) => fee.dueAmount > 0 && fee.status === "Unpaid")
//           .forEach((fee) => {
//             const availableFeeOption = availableAdditionalFees.find(
//               (opt) => opt.name === fee.name && opt.type === "Monthly"
//             );
//             if (availableFeeOption) {
//               const existingFee = preSelectedAdditionalFees.find(
//                 (pf) => pf.name === fee.name && pf.type === "Monthly"
//               );
//               if (existingFee) {
//                 existingFee.dueMonths.push(fee.month);
//                 existingFee.amount += fee.dueAmount;
//               } else {
//                 preSelectedAdditionalFees.push({
//                   id: availableFeeOption.id,
//                   name: availableFeeOption.name,
//                   amount: fee.dueAmount,
//                   type: availableFeeOption.type,
//                   dueMonths: [fee.month],
//                 });
//               }
//             }
//           });

//         const preSelectedOneTimeFees = oneTimeFeeOptions.map((opt) => ({
//           name: opt.name,
//           dueAmount: opt.dueAmount,
//         }));

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
//           date: moment().format("YYYY-MM-DD"),
//           remarks: "",
//           monthlyDues: feeInfo.feeStatus?.monthlyDues || {
//             regularDues: [],
//             additionalDues: [],
//           },
//           additionalFeeDetails,
//           pastDues: feeInfo.feeStatus?.pastDues || 0,
//           totalDues: feeInfo.feeStatus?.dues || 0,
//           regularFees,
//           availableAdditionalFees: availableAdditionalFees || [],
//           oneTimeFeeOptions,
//           feeInfo,
//           error: false,
//         };

//         initialFormData.push(childFormData);
//         initialShowFormFlags.push(false);
//       });

//       setFormData(initialFormData);
//       setShowFormFlags(initialShowFormFlags);
//     };

//     initializeFormData();
//   }, [parentData, session, authToken, setFormData, setShowFormFlags]);

//   const handleChildSelection = (index) => {
//     if (!formData || index < 0 || index >= formData.length) {
//       toast.error("An internal error occurred. Please try again.");
//       return;
//     }
//     const currentChildData = formData[index];
//     if (!currentChildData || currentChildData.error) {
//       toast.warn(
//         `Cannot select ${parentData[index]?.studentName || "this student"}. Fee data may be missing or failed to load.`
//       );
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

//     if (updatedSelectedChildren.length > 0) {
//       setChildFeeHistory(formData[updatedSelectedChildren[0]]?.feeInfo || null);
//     } else {
//       setChildFeeHistory(null);
//     }
//   };

//   return (
//     <div className="mt-6 pt-4 border-t border-gray-200">
//       <div className="flex justify-between items-center mb-4">
//         <h2 className="text-lg font-semibold text-gray-800">
//           Selected Student(s) Fee Payment
//         </h2>
//         <UnifiedPaymentButton
//           selectedChildrenIndices={selectedChildrenIndices}
//           onUnifiedPayment={onUnifiedPayment}
//         />
//       </div>
//       <div className="grid grid-cols-1 gap-6">
//         {parentData.map((child, index) => (
//           <FeeForm
//             key={child._id || index}
//             child={child}
//             index={index}
//             formData={formData[index]}
//             setFormData={setFormData}
//             isSelected={selectedChildrenIndices.includes(index)}
//             showForm={showFormFlags[index]}
//             handleChildSelection={handleChildSelection}
//             setResponseData={setResponseData}
//             setIsMessageModalOpen={setIsMessageModalOpen}
//             authToken={authToken}
//             session={session}
//             isUnifiedPayment={selectedChildrenIndices.length > 1}
//           />
//         ))}
//       </div>
//       {showFormFlags.some((flag) => flag) && childFeeHistory?.monthlyStatus?.length > 0 && (
//         <FeeHistory
//           childFeeHistory={childFeeHistory}
//           session={session}
//         />
//       )}
//     </div>
//   );
// };

// export default ChildSelector;