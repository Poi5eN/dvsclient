import axios from "axios";
import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
import Select from "react-select";
import { toast } from "react-toastify";
import {
    ActiveStudents,
    feescreateFeeStatus,
    LateFines,
    parentandchildwithID,
} from "../../Network/AdminApi";
import Button from "../../Dynamic/utils/Button";
import Modal from "../../Dynamic/Modal";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { useStateContext } from "../../contexts/ContextProvider";
import MonthFeeCard from "./MonthFeeCard";
import moment from "moment"; // Simplified import
import { FeeResponse } from "../../Dynamic/utils/Message";
import generatePdf from "../../Dynamic/utils/pdfGenerator"; // Assuming you might use this later

// Custom styles for react-select
const customSelectStyles = {
    option: (provided, state) => ({
        ...provided,
        // Display due amount in red if > 0 for regular fees
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

// --- Helper Function to fetch Additional Fees ---
const fetchAdditionalFeesForClass = async (className, authToken) => {
    try {
        const response = await axios.get(
            `https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true&className=${className}`, // Filter by class directly if API supports
            {
                withCredentials: true,
                headers: { Authorization: `Bearer ${authToken}` },
            }
        );
        if (response?.data?.success) {
            // Filter again client-side for safety if API doesn't strictly enforce filter
            const filteredFees = response.data.data.filter(fee => fee.className === className);
            return filteredFees.map((fee) => ({
                label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`, // More informative label
                value: fee.amount, // value might be better as fee._id or fee.name for uniqueness
                name: fee.name,
                type: fee.feeType,
                id: fee._id // Add identifier if needed
            }));
        } else {
            toast.error(`Failed to fetch additional fees for class ${className}.`);
            return [];
        }
    } catch (error) {
        toast.error(`Error fetching additional fees for class ${className}: ${error.message}`);
        return [];
    }
};
// ---

const CreateFees = () => {
    const session = JSON.parse(localStorage.getItem("session"));
    const { setIsLoader } = useStateContext();
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Renamed for clarity
    const [responseData, setResponseData] = useState(null); // Initialize as null
    const [showChildForms, setShowChildForms] = useState(false); // Use a more descriptive name instead of modalOpen
    const [selectedChildrenIndices, setSelectedChildrenIndices] = useState([]); // Store indices
    const [childFeeHistory, setChildFeeHistory] = useState(null); // Store history for ONE child shown below
    const [filteredStudents, setFilteredStudents] = useState([]);
    const [showFormFlags, setShowFormFlags] = useState([]); // Renamed for clarity
    const [triggerRefresh, setTriggerRefresh] = useState(false); // Renamed for clarity
    const [searchTerm, setSearchTerm] = useState("");
    const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
    const [parentData, setParentData] = useState([]);
    const [allStudent, setAllStudent] = useState([]);
    const [formData, setFormData] = useState([]); // Array to hold form data for each child
    const authToken = localStorage.getItem("token");
    const [pdfModalOpen, setPdfModalOpen] = useState(false); // Separate modal state for PDF/receipt

    const allMonths = [
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December", "January", "February", "March",
    ];

    // Fetch initial data for students
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
    }, [setIsLoader]); // Added dependencies

    useEffect(() => {
        getAllStudent();
    }, [getAllStudent, triggerRefresh]); // Added triggerRefresh

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
        setSearchTermbyadmissionNo(""); // Clear other search input
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
        setSearchTerm(""); // Clear other search input
    };

    // Fetch student fee info using getStudentFeeInfo API
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
                    `Fee info fetch failed for student ID ${studentId}: ${response.data.message || "Unknown error"}`
                );
                return null;
            }
        } catch (error) {
            toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
            return null;
        }
    };

    // Reset Function
    const resetState = () => {
        setSelectedChildrenIndices([]);
        setChildFeeHistory(null);
        setShowFormFlags([]);
        setParentData([]);
        setFormData([]);
        setSearchTerm("");
        setSearchTermbyadmissionNo("");
        setFilteredStudents([]);
        setShowChildForms(false); // Hide the forms section
        setResponseData(null);
        setIsMessageModalOpen(false);
        setPdfModalOpen(false);
    }

    // Modal and student selection
    const handleStudentClick = async (parentId) => {
        setIsLoader(true);
        setChildFeeHistory(null); // Clear previous history display
        try {
            const parentResponse = await parentandchildwithID(parentId);
            if (!parentResponse?.success) {
                toast.error(parentResponse?.message || "Failed to fetch parent/child data.");
                resetState(); // Reset state on failure
                return;
            }

            const children = parentResponse?.children || [];
            if (children.length === 0) {
                toast.info("No children found for this parent.");
                resetState();
                return;
            }

            setParentData(children);

            // --- Fetch fee info and additional fees CONCURRENTLY ---
            const promises = children.map(child => Promise.all([
                fetchStudentFeeInfo(child.studentId),
                fetchAdditionalFeesForClass(child.class, authToken) // Fetch additional fees per child's class
            ]));

            const results = await Promise.all(promises);
            // ---

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
                        className: child.class,
                        error: true, // Flag indicating data fetch error
                    });
                    return; // Skip to next child
                }

                const regularFeeAmount = feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
                const additionalFeesStructure = feeInfo.feeStructure?.additionalFees || [];
                const monthlyStatus = feeInfo.monthlyStatus || [];

                // Prepare regular fees with due amounts
                const regularFees = allMonths.map((month) => {
                    const monthData = monthlyStatus.find((m) => m.month === month);
                    const due = monthData?.regularFee?.due ?? regularFeeAmount; // Use ?? for nullish coalescing
                    const status = monthData?.regularFee?.status || "Unpaid";
                    return {
                        month,
                        paidAmount: "", // Input field (might be obsolete if not used)
                        dueAmount: status === "Paid" ? 0 : due, // If paid, due is 0
                        totalAmount: regularFeeAmount,
                        status: status,
                    };
                });

                // Prepare structured additional fees details from feeInfo (if needed for display, not selection)
                const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
                    name: fee.name,
                    type: fee.feeType,
                    amount: fee.amount,
                    months: allMonths.map((month) => {
                        const monthData = monthlyStatus.find((m) => m.month === month);
                        const addFee = monthData?.additionalFees.find((af) => af.name === fee.name);
                        const due = addFee?.due ?? fee.amount; // Default to full amount if no status
                        const status = addFee?.status || "Unpaid";
                        return {
                            month,
                            paidAmount: "", // Input field
                            dueAmount: status === "Paid" ? 0 : due,
                            totalAmount: fee.amount,
                            status: status,
                        };
                    }),
                }));


                initialFormData.push({
                    admissionNumber: child.admissionNumber,
                    studentId: child.studentId,
                    studentName: child.studentName, // Store name for easier reference
                    className: child.class,
                    classFee: regularFeeAmount,
                    totalAmount: "", // User input for payment
                    selectedMonths: [], // Array of { value: month, label: ..., due: ... }
                    selectedAdditionalFees: [], // Array of { name, amount, type }
                    paymentMode: "Cash",
                    transactionId: "",
                    chequeBookNo: "",
                    lateFine: feeInfo.feeStatus?.totalLateFines || 0,
                    concession: "",
                    date: moment().format("YYYY-MM-DD"), // Store in YYYY-MM-DD for input field compatibility
                    remarks: "",
                    monthlyDues: feeInfo.feeStatus?.monthlyDues || { regularDues: [], additionalDues: [] },
                    additionalFeeDetails: additionalFeeDetails, // Store detailed status if needed elsewhere
                    pastDues: feeInfo.feeStatus?.pastDues || 0,
                    totalDues: feeInfo.feeStatus?.dues || 0, // Overall due for display
                    regularFees, // Holds status and due amount per month
                    availableAdditionalFees: availableAdditionalFees, // <<< STORED PER CHILD
                    feeInfo, // Store the full fee info for reference or detailed display
                    error: false, // No error fetching data
                });
                initialShowFormFlags.push(false); // Initially hide form
            });

            setFormData(initialFormData);
            setSelectedChildrenIndices([]); // Clear previous selections
            setShowFormFlags(initialShowFormFlags);
            setShowChildForms(true); // Show the child forms section

        } catch (error) {
            toast.error("An error occurred while fetching student data.");
            console.error("Error in handleStudentClick:", error);
            resetState();
        } finally {
            setIsLoader(false);
        }
    };

    // Child selection within modal
    const handleChildSelection = (index) => {
        if (!formData[index] || formData[index].error) {
            toast.warn(`Cannot select ${parentData[index]?.studentName}. Fee data may be missing.`);
            return;
        }

        const isCurrentlySelected = selectedChildrenIndices.includes(index);
        const updatedSelectedChildren = isCurrentlySelected
            ? selectedChildrenIndices.filter(i => i !== index)
            : [...selectedChildrenIndices, index];

        const updatedShowFormFlags = [...showFormFlags];
        updatedShowFormFlags[index] = !isCurrentlySelected; // Toggle form visibility

        setSelectedChildrenIndices(updatedSelectedChildren);
        setShowFormFlags(updatedShowFormFlags);

        // Update fee history display
        if (!isCurrentlySelected) {
            setChildFeeHistory(formData[index].feeInfo); // Show history of newly opened form
        } else if (updatedSelectedChildren.length === 0) {
             setChildFeeHistory(null); // Clear history if no child is selected
        } else if (updatedSelectedChildren.length > 0 && !updatedSelectedChildren.includes(index)) {
             // If the deselected child was the one whose history was showing,
             // show the history of the *last* remaining selected child.
             const lastSelectedIndex = updatedSelectedChildren[updatedSelectedChildren.length - 1];
             setChildFeeHistory(formData[lastSelectedIndex]?.feeInfo || null);
        }
        // If multiple remain selected after deselecting one that wasn't shown, history remains as is.
    };


    // Form input handlers
    const handleInputChange = (index, field, value) => {
        const updatedFormData = [...formData];
        updatedFormData[index] = { ...updatedFormData[index], [field]: value };

        if (field === 'paymentMode') {
            if (value !== 'Online' && value !== 'Card') {
                updatedFormData[index].transactionId = '';
            }
            if (value !== 'Cheque') {
                updatedFormData[index].chequeBookNo = '';
            }
        }

        setFormData(updatedFormData);
    };

    // *** MODIFIED handleMonthSelection ***
    const handleMonthSelection = (index, selectedOptions) => {
        const selectedMonthsData = selectedOptions || [];
        const updatedFormData = [...formData]; // Get current form data state

        if (selectedMonthsData.length <= 1) {
            // Always valid if 0 or 1 month is selected
            updatedFormData[index].selectedMonths = selectedMonthsData;
            setFormData(updatedFormData); // Update the state
            return;
        }

        // More than one month selected, check for sequence
        const selectedMonthNames = selectedMonthsData.map(opt => opt.value);

        // Get indices in the master list and sort them
        const indicesInAllMonths = selectedMonthNames
            .map(month => allMonths.indexOf(month))
            .sort((a, b) => a - b); // Sort numerically

        let isSequential = true;
        // Check if each index is exactly one greater than the previous one
        for (let i = 1; i < indicesInAllMonths.length; i++) {
            if (indicesInAllMonths[i] !== indicesInAllMonths[i - 1] + 1) {
                isSequential = false;
                break;
            }
        }

        if (isSequential) {
            // Valid sequence: Update the state
            updatedFormData[index].selectedMonths = selectedMonthsData;
            setFormData(updatedFormData);
        } else {
            // Invalid sequence: Show warning and DO NOT update state
            toast.warn(`Please select months in a continuous sequence (e.g., April, May, June).`);
            // Do not call setFormData here. This keeps the previous valid state for formData[index].selectedMonths.
            // Note: The react-select component might visually show the invalid selection momentarily,
            // but the internal application state (formData) remains unchanged.
        }
    };
    // *** END MODIFIED handleMonthSelection ***

    const handleAdditionalFeesChange = (index, selectedOptions) => {
        const selectedFeesData = selectedOptions || [];
        const updatedFormData = [...formData];
        updatedFormData[index].selectedAdditionalFees = selectedFeesData.map(opt => ({
            name: opt.name,
            amount: opt.value, // This is the defined amount of the fee
            type: opt.type,
            // id: opt.id // Include id if needed by payload
        }));
        setFormData(updatedFormData);
    };


    const calculateNetPayableAmount = useCallback((index) => {
        const data = formData[index];
        if (!data || data.error) return 0;

        let total = 0;
        total += parseFloat(data.lateFine) || 0;
        total += parseFloat(data.pastDues) || 0; // Include past dues

        // Sum dues from selected regular fee months
        const regularFeeTotal = data.selectedMonths.reduce((sum, monthOption) => {
            const fee = data.regularFees.find((f) => f.month === monthOption.value);
            return sum + (fee?.dueAmount || 0);
        }, 0);
        total += regularFeeTotal;

        // Sum amounts from selected additional fees
        const additionalFeeTotal = data.selectedAdditionalFees.reduce((sum, fee) => {
            // Find the corresponding detail in availableAdditionalFees to get the correct amount if needed,
            // but we stored the correct amount directly in selectedAdditionalFees during selection.
            return sum + (fee?.amount || 0);
        }, 0);
        total += additionalFeeTotal;

        // Subtract concession
        total -= parseFloat(data.concession) || 0;

        return Math.max(0, total); // Ensure non-negative
    }, [formData]); // Dependency: formData

    // --- Auto Distribution Calculation (for display/confirmation) ---
    const calculateAutoDistribution = useCallback((index) => {
        const data = formData[index];
        const netPayable = calculateNetPayableAmount(index); // Total due for selected items
        const totalAmountPaid = parseFloat(data.totalAmount) || 0; // Amount user pays

        // This simplified version just calculates the final remaining dues.
        // Backend handles actual allocation.
        const remainingDues = Math.max(0, netPayable - totalAmountPaid);
        const remainingAfterDistribution = Math.max(0, totalAmountPaid - netPayable); // Overpayment

        return {
            remainingAfterDistribution,
            remainingDues,
        };
    }, [formData, calculateNetPayableAmount]); // Dependencies

    // --- PDF Generation and Messaging ---
    const handleDownloadPdf = (dataToUse) => {
        if (!dataToUse) {
            toast.error("No receipt data available to generate PDF.");
            return;
        }
        generatePdf(dataToUse); // Call your PDF generator function
        // Don't close/reset here, handleClosePdfModal will do it
    };

    const sendMessage = (dataToUse) => {
        if (!dataToUse) {
            toast.error("No receipt data available to send message.");
            return;
        }
        console.log("Sending message for data:", dataToUse);
        FeeResponse(dataToUse); // Call your message sending function
        // State reset is handled after this in the modal close logic
    };


    // --- Form Submission ---
    const handleSubmit = async (e, childIndex) => {
        e.preventDefault();
        e.stopPropagation();

        const childFormData = formData[childIndex];
        const child = parentData[childIndex];

        if (!childFormData || childFormData.error) {
            toast.error(`Cannot submit for ${child?.studentName || 'this student'} due to missing data.`);
            return;
        }

        // --- Validations ---
        const totalAmount = parseFloat(childFormData.totalAmount) || 0;
        if (totalAmount <= 0) {
            toast.warn(`Please enter a valid amount to pay for ${child.studentName}.`);
            return;
        }
        if (!childFormData.paymentMode) {
            toast.error(`Payment mode is required for ${child.studentName}.`);
            return;
        }
        if ((childFormData.paymentMode === "Online" || childFormData.paymentMode === "Card") && !childFormData.transactionId) {
            toast.error(`Transaction ID is required for Online/Card payment for ${child.studentName}.`);
            return;
        }
        if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
            toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}.`);
            return;
        }
        // Check if paying anything towards current fees requires selection
         if (totalAmount > 0 && childFormData.selectedMonths.length === 0 && childFormData.selectedAdditionalFees.length === 0) {
             // Check if the payment amount is ONLY covering past dues and/or late fines
             const duesAndFines = (parseFloat(childFormData.pastDues) || 0) + (parseFloat(childFormData.lateFine) || 0);
             if (totalAmount > duesAndFines) {
                toast.warn(`Please select at least one month or additional fee to cover the amount being paid for ${child.studentName}.`);
                return;
             }
             // Allow payment if it's only for past dues/fines and doesn't exceed their sum.
         }

        // --- Payload Construction ---
        setIsLoader(true);
        const payload = {
            studentId: child.studentId,
            session,
            // mode: "auto", // Backend likely determines distribution mode
            paymentDetails: {
                regularFees: childFormData.selectedMonths.map(opt => ({ month: opt.value })),
                additionalFees: childFormData.selectedAdditionalFees.map(fee => ({
                    name: fee.name,
                    amount: fee.amount // Send the fee's defined amount
                    // id: fee.id // Send ID if backend requires it
                })),
                pastDuesPaid: 0, // Let backend calculate distribution
                lateFinesPaid: 0, // Let backend calculate distribution
                concession: parseFloat(childFormData.concession) || 0,
                totalAmount: totalAmount,
                date: moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
                paymentMode: childFormData.paymentMode,
                transactionId: childFormData.transactionId || undefined,
                chequeNumber: childFormData.chequeBookNo || undefined,
                remark: childFormData.remarks || "",
            },
        };

        console.log("Submitting payload:", JSON.stringify(payload, null, 2));

        try {
            const response = await feescreateFeeStatus(payload);
            console.log("API Response:", response);

            if (response?.success) {
                toast.success(response?.message || `Fees submitted successfully for ${child.studentName}!`);
                setResponseData(response?.data); // Store response data for modals
                setIsMessageModalOpen(true); // Trigger message confirmation modal
                setTriggerRefresh(prev => !prev); // Trigger background data refresh
            } else {
                toast.error(response?.message || `Fee submission failed for ${child.studentName}.`);
            }
        } catch (error) {
            console.error("Fee Submission Error:", error);
            toast.error(`An error occurred during submission for ${child.studentName}: ${error.message}`);
        } finally {
            setIsLoader(false);
        }
    };

    // Close message modal and potentially trigger PDF modal or reset
    const handleCloseMessageModal = (sendMsg = false) => {
        setIsMessageModalOpen(false);
        if (sendMsg && responseData) {
            sendMessage(responseData);
            // After sending message, ask about PDF
             setPdfModalOpen(true);
        } else {
            // If user skips message, still ask about PDF
            setPdfModalOpen(true);
        }
    };

    // Close PDF modal and reset state
    const handleClosePdfModal = (downloadPdf = false) => {
        if (downloadPdf && responseData) {
            handleDownloadPdf(responseData);
        }
        setPdfModalOpen(false);
        // Reset state AFTER handling PDF generation/cancellation AND closing the modal
        resetState();
    };


    return (
        <div className="px-4 py-4"> {/* Added padding */}
            {/* Search Section */}
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

            {/* Search Results Dropdown */}
            {filteredStudents.length > 0 && (
                <div className="relative">
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                        {filteredStudents.map((student) => (
                            <div
                                key={student._id}
                                className="p-3 border-b cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
                                onClick={() => {
                                    handleStudentClick(student.parentId);
                                    setFilteredStudents([]); // Clear results after selection
                                    // Optional: fill search bars after click
                                    // setSearchTerm(student.studentName);
                                    // setSearchTermbyadmissionNo(student.admissionNumber);
                                }}
                            >
                                <span className="font-semibold text-gray-800">{student.studentName}</span>
                                <span className="text-sm text-gray-600 block sm:inline sm:ml-2">
                                    (Adm: {student.admissionNumber}, Class: {student.class}, Parent: {student.fatherName})
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Student Forms Section - Conditionally Rendered */}
            {showChildForms && parentData.length > 0 && (
                <div className="mt-6 border-t pt-4">
                    <h2 className="text-xl font-semibold mb-3 text-gray-700">Selected Student(s) Fee Payment</h2>
                    <div className="flex flex-col gap-4">
                        {parentData.map((child, index) => {
                            const currentFormData = formData[index];
                            if (!currentFormData || currentFormData.error) {
                                return (
                                    <div key={child._id || index} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                                        <strong className="font-bold">Error:</strong>
                                        <span className="block sm:inline"> Could not load fee data for {child.studentName} (Adm: {child.admissionNumber}).</span>
                                    </div>
                                );
                            }

                            const isSelected = selectedChildrenIndices.includes(index);
                            const showForm = showFormFlags[index];

                            return (
                                <div
                                    key={child._id || index}
                                    className={`bg-white rounded-lg shadow border transition-all duration-300 ${isSelected ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200"
                                        } overflow-hidden`}
                                >
                                    {/* Child Header */}
                                    <div className="flex items-center p-3 border-b bg-gray-50 cursor-pointer" onClick={() => handleChildSelection(index)}>
                                        <input
                                            type="checkbox"
                                            id={`child-checkbox-${index}`}
                                            checked={isSelected}
                                            onChange={() => handleChildSelection(index)}
                                            className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            aria-labelledby={`child-label-${index}`}
                                            onClick={(e) => e.stopPropagation()} // Prevent label click from double-triggering if checkbox clicked directly
                                        />
                                        <label
                                            id={`child-label-${index}`}
                                            htmlFor={`child-checkbox-${index}`}
                                            className="flex-grow cursor-pointer" // Ensure label is clickable
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-lg font-semibold text-blue-800">
                                                        {child.studentName}
                                                    </span>
                                                    <span className="text-sm text-gray-600 ml-2">
                                                        (Class: {child.class} / Adm#: {child.admissionNumber})
                                                    </span>
                                                </div>
                                                <span className={`text-sm font-medium px-2 py-0.5 rounded ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {isSelected ? 'Selected' : 'Select'}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap justify-start items-center gap-x-3 text-xs mt-1">
                                                <span className="text-red-600 font-medium">
                                                    Total Dues: ₹{currentFormData?.totalDues?.toFixed(2) || '0.00'}
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

                                    {/* Collapsible Form Area */}
                                    {showForm && (
                                        <div className="p-4 border-t md:flex md:gap-4">
                                            {/* Left Side: Inputs */}
                                            <form onSubmit={(e) => handleSubmit(e, index)} className="flex-grow md:w-2/3 space-y-4 mb-4 md:mb-0">

                                                {/* Regular Fees Selection */}
                                                <div className="border rounded p-3 bg-gray-50">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Select Months (Class Fee: ₹{currentFormData.classFee}/month)
                                                    </label>
                                                    <Select
                                                        isMulti
                                                        options={currentFormData.regularFees
                                                            .filter(fee => fee.status !== "Paid") // Only show unpaid/partially paid
                                                            .map(fee => ({
                                                                value: fee.month,
                                                                label: `${fee.month} (Due: ₹${fee.dueAmount.toFixed(2)})`,
                                                                due: fee.dueAmount,
                                                            }))
                                                        }
                                                        value={currentFormData.selectedMonths} // Bind to the validated state value
                                                        onChange={(opts) => handleMonthSelection(index, opts)}
                                                        placeholder="Select months to pay (Sequentially)..."
                                                        styles={customSelectStyles}
                                                        closeMenuOnSelect={false}
                                                    />
                                                </div>

                                                {/* Additional Fees Selection */}
                                                <div className="border rounded p-3 bg-gray-50">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Select Additional Fees
                                                    </label>
                                                    {/* {console.log("Rendering Select - availableAdditionalFees:", currentFormData.availableAdditionalFees)} */}
                                                    {/* {console.log("Rendering Select - selectedAdditionalFees:", currentFormData.selectedAdditionalFees)} */}
                                                    <Select
                                                        isMulti
                                                        options={currentFormData.availableAdditionalFees} // Use per-child options
                                                        value={currentFormData.availableAdditionalFees.filter(opt =>
                                                            currentFormData.selectedAdditionalFees.some(sel => sel.name === opt.name)
                                                        )}
                                                        onChange={(opts) => handleAdditionalFeesChange(index, opts)}
                                                        placeholder="Select additional fees..."
                                                        closeMenuOnSelect={false}
                                                    />
                                                </div>

                                                {/* Other Inputs in a Grid */}
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    <ReactInput
                                                        type="number"
                                                        label="Concession (-)"
                                                        value={currentFormData.concession}
                                                        onChange={(e) => handleInputChange(index, "concession", e.target.value)}
                                                        min="0"
                                                        step="0.01"
                                                    />
                                                    <ReactInput
                                                        type="number"
                                                        label="Total Amount to Pay (*)"
                                                        value={currentFormData.totalAmount}
                                                        onChange={(e) => handleInputChange(index, "totalAmount", e.target.value)}
                                                        min="0.01" // Minimum payable amount slightly > 0
                                                        step="0.01"
                                                        isRequired={true}
                                                    />
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700">Payment Mode (*)</label>
                                                        <select
                                                            value={currentFormData.paymentMode}
                                                            onChange={(e) => handleInputChange(index, "paymentMode", e.target.value)}
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
                                                        value={currentFormData.date} // Should be YYYY-MM-DD
                                                        onChange={(e) => handleInputChange(index, "date", e.target.value)}
                                                        isRequired={true}
                                                    />
                                                    {(currentFormData.paymentMode === "Online" || currentFormData.paymentMode === "Card") && (
                                                        <ReactInput
                                                            type="text"
                                                            label="Transaction ID (*)"
                                                            value={currentFormData.transactionId}
                                                            onChange={(e) => handleInputChange(index, "transactionId", e.target.value)}
                                                            isRequired={true}
                                                        />
                                                    )}
                                                    {currentFormData.paymentMode === "Cheque" && (
                                                        <ReactInput
                                                            type="text"
                                                            label="Cheque Number (*)"
                                                            value={currentFormData.chequeBookNo}
                                                            onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)}
                                                            isRequired={true}
                                                        />
                                                    )}
                                                </div>

                                                {/* Remarks */}
                                                <div className="sm:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700">Remarks</label>
                                                    <textarea
                                                        value={currentFormData.remarks}
                                                        onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                                        rows="2"
                                                        placeholder="Optional remarks..."
                                                    />
                                                </div>

                                                {/* Submit Button for this child */}
                                                <div className="flex justify-end pt-4 border-t">
                                                    <Button
                                                        type="submit"
                                                        name={`Submit Payment for ${child.studentName}`}
                                                        className="bg-blue-600 hover:bg-blue-700 text-white"
                                                    // Add disabled state based on loading
                                                    />
                                                </div>
                                            </form>

                                            {/* Right Side: Fee Details Summary */}
                                            <div className="flex-shrink-0 md:w-1/3 border rounded p-4 bg-blue-50 md:ml-4">
                                                <h3 className="text-lg font-semibold text-blue-900 mb-3 border-b pb-2">
                                                    Fee Summary
                                                </h3>
                                                <table className="w-full text-sm">
                                                    <tbody>
                                                        {/* Display calculated items based on selections */}
                                                        {currentFormData.lateFine > 0 && (
                                                            <tr className="border-b border-blue-100">
                                                                <td className="text-gray-700 py-1.5">Late Fines:</td>
                                                                <td className="font-medium text-orange-700 py-1.5 text-right">
                                                                    ₹{currentFormData.lateFine.toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        )}
                                                        {currentFormData.pastDues > 0 && (
                                                            <tr className="border-b border-blue-100">
                                                                <td className="text-gray-700 py-1.5">Past Dues:</td>
                                                                <td className="font-medium text-purple-700 py-1.5 text-right">
                                                                    ₹{currentFormData.pastDues.toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        )}

                                                        {/* Selected Regular Fees */}
                                                        {currentFormData.selectedMonths.length > 0 && (
                                                            <tr className="border-b border-blue-100">
                                                                <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-800">Selected Regular Fees:</td>
                                                            </tr>
                                                        )}
                                                        {currentFormData.selectedMonths.map((monthOption, i) => {
                                                            const fee = currentFormData.regularFees.find(f => f.month === monthOption.value);
                                                            return (
                                                                <tr key={`reg-${index}-${i}`} className="border-b border-blue-100">
                                                                    <td className="text-gray-600 py-1.5 pl-2">{monthOption.value}:</td>
                                                                    <td className="font-medium text-blue-700 py-1.5 text-right">
                                                                        ₹{(fee?.dueAmount || 0).toFixed(2)}
                                                                    </td>
                                                                </tr>
                                                            );
                                                        })}

                                                        {/* Selected Additional Fees */}
                                                        {currentFormData.selectedAdditionalFees.length > 0 && (
                                                            <tr className="border-b border-blue-100">
                                                                <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-800">Selected Additional Fees:</td>
                                                            </tr>
                                                        )}
                                                        {currentFormData.selectedAdditionalFees.map((fee, i) => (
                                                            <tr key={`add-${index}-${i}`} className="border-b border-blue-100">
                                                                <td className="text-gray-600 py-1.5 pl-2">{fee.name}:</td>
                                                                <td className="font-medium text-blue-700 py-1.5 text-right">
                                                                    ₹{(fee?.amount || 0).toFixed(2)}
                                                                </td>
                                                            </tr>
                                                        ))}

                                                        {/* Concession */}
                                                        {currentFormData.concession > 0 && (
                                                            <tr className="border-b border-blue-100">
                                                                <td className="text-green-700 py-1.5">Concession:</td>
                                                                <td className="font-medium text-green-700 py-1.5 text-right">
                                                                    - ₹{parseFloat(currentFormData.concession).toFixed(2)}
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
                                                        {/* Display Remaining Dues after Potential Payment */}
                                                        {(() => {
                                                            const distribution = calculateAutoDistribution(index);
                                                            return (
                                                                <>
                                                                    {parseFloat(currentFormData.totalAmount) > 0 && (
                                                                        <tr >
                                                                            <td className="text-gray-700 py-1.5">Amount Paying:</td>
                                                                            <td className="font-medium text-black py-1.5 text-right">
                                                                                ₹{parseFloat(currentFormData.totalAmount).toFixed(2)}
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
                                                                    {distribution.remainingAfterDistribution > 0 && (
                                                                        <tr>
                                                                            <td className="font-semibold text-green-700 py-1.5 text-sm">
                                                                                (Excess Paid):
                                                                            </td>
                                                                            <td className="font-semibold text-green-700 py-1.5 text-right text-sm">
                                                                                ₹{distribution.remainingAfterDistribution.toFixed(2)}
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

            {/* Fee History Display Area */}
            {showChildForms && childFeeHistory?.monthlyStatus?.length > 0 && (
                <div className="mt-6 border-t pt-4">
                    <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
                        Fee History for {childFeeHistory?.studentName || 'Selected Student'} ({childFeeHistory?.session || session})
                    </h2>
                    <div>
                        <MonthFeeCard childFeeHistory={childFeeHistory} />
                    </div>
                </div>
            )}

            {/* --- Modals --- */}
            {/* Message Confirmation Modal */}
            <Modal
                setIsOpen={setIsMessageModalOpen} // Let the modal control its visibility via handler
                isOpen={isMessageModalOpen}
                title="Send Confirmation?"
                maxWidth="sm"
            >
                <div className="p-4">
                    <p className="text-gray-700 mb-4">
                        Fee submitted successfully for {responseData?.student?.studentName}. Do you want to send an SMS confirmation to the parent ({responseData?.parent?.fatherPhone || 'N/A'})?
                    </p>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <Button
                            type="button"
                            name="Yes, Send SMS"
                            onClick={() => handleCloseMessageModal(true)} // Signal intent to send
                            className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2"
                        />
                        <Button
                            type="button"
                            name="No, Skip Message"
                            onClick={() => handleCloseMessageModal(false)} // Signal intent to skip
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
                        />
                    </div>
                </div>
            </Modal>

            {/* PDF / Receipt Modal */}
            <Modal
                setIsOpen={setPdfModalOpen} // Let modal control visibility
                isOpen={pdfModalOpen}
                title="Generate Receipt?"
                maxWidth="sm"
            >
                <div className="p-4">
                    <p className="text-gray-700 mb-4">
                        Do you want to download the fee receipt for {responseData?.student?.studentName}?
                    </p>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                        <Button
                            type="button"
                            name="Yes, Download PDF" // Changed name for consistency
                            onClick={() => handleClosePdfModal(true)} // Signal intent to download
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white sm:col-start-2"
                        />
                        <Button
                            type="button"
                            name="No, Finish" // Changed name for consistency
                            onClick={() => handleClosePdfModal(false)} // Signal intent to finish
                            className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
                        />
                    </div>
                </div>
            </Modal>

        </div> // End of main container
    );
};

export default CreateFees;




// import axios from "axios";
// import React, { useEffect, useState, useCallback } from "react"; // Added useCallback
// import Select from "react-select";
// import { toast } from "react-toastify";
// import {
//   ActiveStudents,
//   feescreateFeeStatus,
//   LateFines,
//   parentandchildwithID,
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
//   option: (provided, state) => ({
//     ...provided,
//     // Display due amount in red if > 0 for regular fees
//     color: state.data.due > 0 ? "red" : "black",
//     fontSize: "14px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };

// // --- Helper Function to fetch Additional Fees ---
// const fetchAdditionalFeesForClass = async (className, authToken) => {
//   try {
//     const response = await axios.get(
//       `https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true&className=${className}`, // Filter by class directly if API supports
//       {
//         withCredentials: true,
//         headers: { Authorization: `Bearer ${authToken}` },
//       }
//     );
//     if (response?.data?.success) {
//       // Assuming the API returns filtered data or we filter here
//       const filteredFees = response.data.data.filter(fee => fee.className === className);
//       return filteredFees.map((fee) => ({
//         label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`, // More informative label
//         value: fee.amount, // value might be better as fee._id or fee.name for uniqueness
//         name: fee.name,
//         type: fee.feeType,
//         // Add identifier if needed: id: fee._id
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
// // ---

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [isMessageModalOpen, setIsMessageModalOpen] = useState(false); // Renamed for clarity
//   const [responseData, setResponseData] = useState(null); // Initialize as null
//   // const [modalOpen, setModalOpen] = useState(false); // This seems to control the visibility of the child forms section
//   const [showChildForms, setShowChildForms] = useState(false); // Use a more descriptive name instead of modalOpen
//   const [selectedChildrenIndices, setSelectedChildrenIndices] = useState([]); // Store indices
//   const [childFeeHistory, setChildFeeHistory] = useState(null); // Store history for ONE child shown below
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showFormFlags, setShowFormFlags] = useState([]); // Renamed for clarity
//   const [triggerRefresh, setTriggerRefresh] = useState(false); // Renamed for clarity
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   // const [allLateFines, setAllLateFines] = useState([]); // Not directly used after fetch, consider removing if feeInfo has it
//   const [formData, setFormData] = useState([]); // Array to hold form data for each child
//   // const [monthlyDues, setMonthlyDues] = useState({}); // Appears unused, feeInfo has dues
//   // const [mode, setMode] = useState("auto"); // Mode is not used in payload, backend likely handles logic
//   const authToken = localStorage.getItem("token");
//   const [pdfModalOpen, setPdfModalOpen] = useState(false); // Separate modal state for PDF/receipt

//   const allMonths = [
//     "April", "May", "June", "July", "August", "September",
//     "October", "November", "December", "January", "February", "March",
//   ];

//   // Fetch initial data for students
//   const getAllStudent = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents();
//       setAllStudent(response?.students?.data || []);
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]); // Added dependencies

//   // Fetch late fines (if needed independently, otherwise rely on feeInfo)
//   // const getLateFinesData = useCallback(async () => {
//   //   try {
//   //     const response = await LateFines();
//   //     setAllLateFines(response?.data || []);
//   //   } catch (error) {
//   //     toast.error("Error fetching late fines.");
//   //     setAllLateFines([]);
//   //   }
//   // }, []); // Added dependencies

//   useEffect(() => {
//     getAllStudent();
//     // getLateFinesData(); // Uncomment if late fine data is needed separately
//   }, [getAllStudent, triggerRefresh]); // Added triggerRefresh

//   // Search handlers
//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
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
//      // Clear other search input
//      setSearchTermbyadmissionNo("");
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
//      // Clear other search input
//      setSearchTerm("");
//   };

//   // Fetch student fee info using getStudentFeeInfo API
//   const fetchStudentFeeInfo = async (studentId) => {
//     // Removed setIsLoader from here, will be handled in handleStudentClick
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         toast.error(
//           `Fee info fetch failed for student ID ${studentId}: ${response.data.message || "Unknown error"}`
//         );
//         return null;
//       }
//     } catch (error) {
//       toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
//       return null;
//     }
//   };

//   // Reset Function
//   const resetState = () => {
//       setSelectedChildrenIndices([]);
//       setChildFeeHistory(null);
//       setShowFormFlags([]);
//       setParentData([]);
//       setFormData([]);
//       setSearchTerm("");
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]);
//       setShowChildForms(false); // Hide the forms section
//       setResponseData(null);
//   }

//   // Modal and student selection
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     setChildFeeHistory(null); // Clear previous history display
//     try {
//       const parentResponse = await parentandchildwithID(parentId);
//       if (!parentResponse?.success) {
//         toast.error(parentResponse?.message || "Failed to fetch parent/child data.");
//         resetState(); // Reset state on failure
//         return;
//       }

//       const children = parentResponse?.children || [];
//       if (children.length === 0) {
//         toast.info("No children found for this parent.");
//         resetState();
//         return;
//       }

//       setParentData(children);

//       // --- Fetch fee info and additional fees CONCURRENTLY ---
//       const promises = children.map(child => Promise.all([
//           fetchStudentFeeInfo(child.studentId),
//           fetchAdditionalFeesForClass(child.class, authToken) // Fetch additional fees per child's class
//       ]));

//       const results = await Promise.all(promises);
//       // ---

//       const initialFormData = [];
//       const initialShowFormFlags = [];

//       results.forEach(([feeInfo, availableAdditionalFees], index) => {
//           const child = children[index];

//           if (!feeInfo) {
//               // Handle case where fee info fetch failed for a specific child
//               toast.error(`Could not load fee details for ${child.studentName}. Skipping.`);
//               initialShowFormFlags.push(false); // Don't show form for this child
//               // Optionally push a placeholder or skip adding to initialFormData
//               // For simplicity, we'll add basic data but maybe mark it as unusable
//               initialFormData.push({
//                   admissionNumber: child.admissionNumber,
//                   studentId: child.studentId,
//                   className: child.class,
//                   error: true, // Flag indicating data fetch error
//                   // Add other default fields as needed
//               });
//               return; // Skip to next child
//           }

//           const regularFeeAmount = feeInfo.feeStructure?.regularFees?.[0]?.amount || 0;
//           const additionalFeesStructure = feeInfo.feeStructure?.additionalFees || [];
//           const monthlyStatus = feeInfo.monthlyStatus || [];

//           // Prepare regular fees with due amounts
//           const regularFees = allMonths.map((month) => {
//               const monthData = monthlyStatus.find((m) => m.month === month);
//               const due = monthData?.regularFee?.due ?? regularFeeAmount; // Use ?? for nullish coalescing
//               const status = monthData?.regularFee?.status || "Unpaid";
//               return {
//                   month,
//                   paidAmount: "", // Input field
//                   dueAmount: status === "Paid" ? 0 : due, // If paid, due is 0
//                   totalAmount: regularFeeAmount,
//                   status: status,
//               };
//           });

//            // Prepare structured additional fees details from feeInfo (if needed for display, not selection)
//            const additionalFeeDetails = additionalFeesStructure.map((fee) => ({
//             name: fee.name,
//             type: fee.feeType,
//             amount: fee.amount,
//             months: allMonths.map((month) => {
//               const monthData = monthlyStatus.find((m) => m.month === month);
//               const addFee = monthData?.additionalFees.find((af) => af.name === fee.name);
//               const due = addFee?.due ?? fee.amount; // Default to full amount if no status
//               const status = addFee?.status || "Unpaid";
//               return {
//                 month,
//                 paidAmount: "", // Input field
//                 dueAmount: status === "Paid" ? 0 : due,
//                 totalAmount: fee.amount,
//                 status: status,
//               };
//             }),
//           }));


//           initialFormData.push({
//               admissionNumber: child.admissionNumber,
//               studentId: child.studentId,
//               studentName: child.studentName, // Store name for easier reference
//               className: child.class,
//               classFee: regularFeeAmount,
//               totalAmount: "", // User input for payment
//               selectedMonths: [],
//               selectedAdditionalFees: [], // Array of { name, amount, type }
//               paymentMode: "Cash",
//               transactionId: "",
//               chequeBookNo: "",
//               lateFine: feeInfo.feeStatus?.totalLateFines || 0,
//               concession: "",
//               duesPaid: "", // Input for paying past dues MANUALLY (if needed, else remove)
//               date: moment().format("YYYY-MM-DD"), // Store in YYYY-MM-DD for input field compatibility
//               remarks: "",
//               monthlyDues: feeInfo.feeStatus?.monthlyDues || { regularDues: [], additionalDues: [] },
//               additionalFeeDetails: additionalFeeDetails, // Store detailed status if needed elsewhere
//               pastDues: feeInfo.feeStatus?.pastDues || 0,
//               totalDues: feeInfo.feeStatus?.dues || 0, // Overall due for display
//               regularFees, // Holds status and due amount per month
//               // additionalFees: additionalFeesData, // Use additionalFeeDetails instead
//               availableAdditionalFees: availableAdditionalFees, // <<< STORED PER CHILD
//               feeInfo, // Store the full fee info for reference or detailed display
//               error: false, // No error fetching data
//           });
//           initialShowFormFlags.push(false); // Initially hide form
//       });

//       setFormData(initialFormData);
//       setSelectedChildrenIndices([]); // Clear previous selections
//       setShowFormFlags(initialShowFormFlags);
//       setShowChildForms(true); // Show the child forms section
//       // setModalOpen(true); // Show modal if 'modalOpen' controls the entire child section

//     } catch (error) {
//       toast.error("An error occurred while fetching student data.");
//       console.error("Error in handleStudentClick:", error);
//       resetState();
//     } finally {
//       setIsLoader(false);
//       // Don't reset search terms here, user might want to see the result list
//       // Reset search/filter only when explicitly cleared or on successful submission/cancel
//     }
//   };

//   // Child selection within modal
//   const handleChildSelection = (index) => {
//       // Only proceed if form data exists and no error occurred during fetch
//       if (!formData[index] || formData[index].error) {
//           toast.warn(`Cannot select ${parentData[index]?.studentName}. Fee data may be missing.`);
//           return;
//       }

//       const isCurrentlySelected = selectedChildrenIndices.includes(index);
//       const updatedSelectedChildren = isCurrentlySelected
//           ? selectedChildrenIndices.filter(i => i !== index)
//           : [...selectedChildrenIndices, index];

//       const updatedShowFormFlags = [...showFormFlags];
//       updatedShowFormFlags[index] = !isCurrentlySelected; // Toggle form visibility

//       setSelectedChildrenIndices(updatedSelectedChildren);
//       setShowFormFlags(updatedShowFormFlags);

//       // If a child is selected, set their fee history for display below
//       // If multiple are selected, maybe show the last selected one or none?
//       // Let's show the history of the child whose form was just opened.
//       if (!isCurrentlySelected) {
//           setChildFeeHistory(formData[index].feeInfo);
//       } else if (updatedSelectedChildren.length === 0) {
//            setChildFeeHistory(null); // Clear history if no child is selected
//       } else if (updatedSelectedChildren.length > 0 && !updatedSelectedChildren.includes(index)) {
//            // If the deselected child was the one whose history was showing,
//            // show the history of the *last* remaining selected child.
//            const lastSelectedIndex = updatedSelectedChildren[updatedSelectedChildren.length - 1];
//            setChildFeeHistory(formData[lastSelectedIndex]?.feeInfo || null);
//       }
//   };


//   // Form input handlers
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = { ...updatedFormData[index], [field]: value };

//     // Clear transaction/cheque fields if payment mode changes
//     if (field === 'paymentMode') {
//         if (value !== 'Online' && value !== 'Card') {
//             updatedFormData[index].transactionId = '';
//         }
//         if (value !== 'Cheque') {
//             updatedFormData[index].chequeBookNo = '';
//         }
//     }

//     setFormData(updatedFormData);
//   };

//   const handleMonthSelection = (index, selectedOptions) => {
//     // Store the full option objects { value: month, label: ..., due: ... }
//     const selectedMonthsData = selectedOptions || [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedMonths = selectedMonthsData; // Store array of selected month objects
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     // Store the full option objects { value: amount, label: ..., name: ..., type: ... }
//     const selectedFeesData = selectedOptions || [];
//     const updatedFormData = [...formData];
//     // Map to store the core details needed for the payload
//     updatedFormData[index].selectedAdditionalFees = selectedFeesData.map(opt => ({
//         name: opt.name,
//         amount: opt.value,
//         type: opt.type,
//     }));
//     setFormData(updatedFormData);
//   };


//  const calculateNetPayableAmount = useCallback((index) => {
//     const data = formData[index];
//     if (!data || data.error) return 0; // Return 0 if no data or error

//     let total = 0;
//     total += parseFloat(data.lateFine) || 0;
//     total += parseFloat(data.pastDues) || 0; // Include past dues

//     // Sum dues from selected regular fee months
//     const regularFeeTotal = data.selectedMonths.reduce((sum, monthOption) => {
//         // Find the corresponding fee detail using the month value
//         const fee = data.regularFees.find((f) => f.month === monthOption.value);
//         // Add the due amount for that month
//         return sum + (fee?.dueAmount || 0);
//     }, 0);
//     total += regularFeeTotal;

//     // Sum amounts from selected additional fees
//     const additionalFeeTotal = data.selectedAdditionalFees.reduce((sum, fee) => {
//         // Add the amount associated with the selected fee
//         return sum + (fee?.amount || 0); // amount is directly stored in selectedAdditionalFees
//     }, 0);
//     total += additionalFeeTotal;

//     // Subtract concession
//     total -= parseFloat(data.concession) || 0;

//     return Math.max(0, total); // Ensure it doesn't go below zero
//   }, [formData]); // Dependency: formData

//   // --- Auto Distribution Calculation (for display/confirmation) ---
//   const calculateAutoDistribution = useCallback((index) => {
//     const data = formData[index];
//     const netPayable = calculateNetPayableAmount(index); // Calculate total due for selected items
//     const totalAmountPaid = parseFloat(data.totalAmount) || 0; // Amount user intends to pay

//     // Initial remaining dues calculation
//     let remainingDues = netPayable;

//     // This function doesn't distribute the payment itself in this version,
//     // as the payload sends selected items. It mainly calculates the final
//     // remaining dues after considering the payment amount.
//     // The backend will handle the actual allocation based on selected items and amount paid.

//     remainingDues = Math.max(0, netPayable - totalAmountPaid); // Calculate remaining after payment

//     // You could add more detailed breakdown here if needed for display,
//     // but it might be complex and potentially differ from backend logic.
//     // For now, focus on the final remaining due.

//     return {
//       // Placeholder fields if you want to display potential distribution
//       lateFinesPaid: 0, // Example: Math.min(totalAmountPaid, data.lateFine || 0), etc.
//       pastDuesPaid: 0,
//       regularFeesPaid: [],
//       additionalFeesPaid: [],
//       remainingAfterDistribution: Math.max(0, totalAmountPaid - netPayable), // Amount paid over the calculated net payable
//       remainingDues, // The crucial part: dues left after this payment
//     };
//   }, [formData, calculateNetPayableAmount]); // Dependencies

//   // --- PDF Generation and Messaging ---
//   const handleDownloadPdf = (dataToUse) => {
//     // Use the responseData passed after successful submission
//     if (!dataToUse) {
//       toast.error("No receipt data available to generate PDF.");
//       return;
//     }
//     // Assuming generatePdf expects data in a specific format
//     generatePdf(dataToUse); // Call your PDF generator function
//     setPdfModalOpen(false); // Close the modal after initiating download
//   };

//   const sendMessage = (dataToUse) => {
//     if (!dataToUse) {
//       toast.error("No receipt data available to send message.");
//       return;
//     }
//     console.log("Sending message for data:", dataToUse);
//     FeeResponse(dataToUse); // Call your message sending function
//     setIsMessageModalOpen(false); // Close the message modal
//     resetState(); // Reset the main form state after sending message
//   };


//   // --- Form Submission ---
//   const handleSubmit = async (e, childIndex) => {
//     e.preventDefault(); // Prevent default form submission
//     e.stopPropagation(); // Stop propagation if nested buttons cause issues

//     const childFormData = formData[childIndex];
//     const child = parentData[childIndex]; // Get the original child data

//     if (!childFormData || childFormData.error) {
//         toast.error(`Cannot submit for ${child?.studentName || 'this student'} due to missing data.`);
//         return;
//     }

//     // --- Validations ---
//     const totalAmount = parseFloat(childFormData.totalAmount) || 0;
//     if (totalAmount <= 0) {
//       toast.warn(`Please enter a valid amount to pay for ${child.studentName}.`);
//       return;
//     }
//     if (!childFormData.paymentMode) {
//       toast.error(`Payment mode is required for ${child.studentName}.`);
//       return;
//     }
//      if ((childFormData.paymentMode === "Online" || childFormData.paymentMode === "Card") && !childFormData.transactionId) {
//         toast.error(`Transaction ID is required for Online/Card payment for ${child.studentName}.`);
//         return;
//       }
//       if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
//         toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}.`);
//         return;
//       }
//       // Basic check: Ensure at least one fee item is selected if paying
//        if (childFormData.selectedMonths.length === 0 && childFormData.selectedAdditionalFees.length === 0 && totalAmount > 0 && (childFormData.pastDues <= 0 && childFormData.lateFine <= 0)) {
//            toast.warn(`Please select at least one month or additional fee to pay for ${child.studentName}, or ensure paying towards past dues/fines.`);
//            // This check might need refinement based on whether paying *only* past dues/fines is allowed without selecting current fees.
//        }

//     // --- Payload Construction ---
//     setIsLoader(true);
//     const payload = {
//       studentId: child.studentId,
//       session,
//       // mode: "auto", // Send mode if backend expects it
//       paymentDetails: {
//         // Send selected regular fee months (just the month name)
//         regularFees: childFormData.selectedMonths.map(opt => ({ month: opt.value })),
//         // Send selected additional fees (name and amount)
//         additionalFees: childFormData.selectedAdditionalFees.map(fee => ({
//             name: fee.name,
//             amount: fee.amount // Send the fee's defined amount
//         })),
//         // Send amounts paid towards specific categories IF backend requires/supports it.
//         // Otherwise, backend might distribute totalAmount based on selections.
//         // Assuming backend distributes based on totalAmount and selections:
//         pastDuesPaid: 0, // Let backend calculate this if possible
//         lateFinesPaid: 0, // Let backend calculate this if possible
//         concession: parseFloat(childFormData.concession) || 0,
//         totalAmount: totalAmount, // The total amount entered by user
//         date: moment(childFormData.date, "YYYY-MM-DD").format("DD-MM-YYYY"), // Format date for API
//         paymentMode: childFormData.paymentMode,
//         transactionId: childFormData.transactionId || undefined, // Send only if exists
//         chequeNumber: childFormData.chequeBookNo || undefined, // Send only if exists
//         remark: childFormData.remarks || "",
//       },
//     };

//     console.log("Submitting payload:", JSON.stringify(payload, null, 2)); // Log payload for debugging

//     try {
//       const response = await feescreateFeeStatus(payload);
//       console.log("API Response:", response);

//       if (response?.success) {
//         toast.success(response?.message || `Fees submitted successfully for ${child.studentName}!`);
//         setResponseData(response?.data); // Store response data for modal/PDF/message
//         // Option 1: Close everything and show modals
//         // resetState(); // Reset form immediately
//         // setPdfModalOpen(true); // Or trigger message modal first

//         // Option 2: Keep the submitted child's form visible but disabled, update its status?
//         // This is more complex. Let's stick with resetting.

//         // --- Trigger Modals ---
//         setIsMessageModalOpen(true); // Ask user if they want to send message

//         // Refresh student list or fee info in background if needed
//         setTriggerRefresh(prev => !prev);

//       } else {
//         toast.error(response?.message || `Fee submission failed for ${child.studentName}.`);
//       }
//     } catch (error) {
//       console.error("Fee Submission Error:", error);
//       toast.error(`An error occurred during submission for ${child.studentName}: ${error.message}`);
//     } finally {
//       setIsLoader(false);
//       // Decide when to reset state - maybe after modals are closed? Handled in sendMessage/cancelModal.
//     }
//   };

//   // Close message modal and potentially trigger PDF modal or reset
//    const handleCloseMessageModal = (sendMsg = false) => {
//         setIsMessageModalOpen(false);
//         if (sendMsg && responseData) {
//             sendMessage(responseData); // This function now also resets the state
//         } else {
//             // If user cancels sending message, decide what to do.
//             // Maybe ask about PDF, or just reset.
//              setPdfModalOpen(true); // Let's ask about PDF next
//             // Or reset directly: resetState();
//         }
//     };

//   // Close PDF modal and reset state
//     const handleClosePdfModal = (downloadPdf = false) => {
//         setPdfModalOpen(false);
//         if (downloadPdf && responseData) {
//             handleDownloadPdf(responseData); // This function does NOT reset state
//         }
//         // Reset state AFTER handling PDF generation/cancellation
//         resetState();
//     };


//   return (
//     <div className="px-4 py-4"> {/* Added padding */}
//         {/* Search Section */}
//         <div className="flex flex-col sm:flex-row gap-4 mb-4">
//             <ReactInput
//             type="text"
//             label="Search by Name"
//             onChange={handleSearch}
//             value={searchTerm}
//             // placeholder="Enter student name..."
//             containerClassName="flex-1 min-w-[200px]"
//             />
//             <ReactInput
//             type="text"
//             label="Search by Adm. No"
//             onChange={handleSearchbyAdmissionNo}
//             value={searchTermbyadmissionNo}
//             // placeholder="Enter admission number..."
//             containerClassName="flex-1 min-w-[200px]"
//             />
//         </div>

//         {/* Search Results Dropdown */}
//         {filteredStudents.length > 0 && (
//             <div className="relative">
//                 <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
//                     {filteredStudents.map((student) => (
//                     <div
//                         key={student._id}
//                         className="p-3 border-b cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out"
//                         onClick={() => {
//                             handleStudentClick(student.parentId);
//                             setFilteredStudents([]); // Clear results after selection
//                             setSearchTerm(student.studentName); // Optionally fill search bar
//                             setSearchTermbyadmissionNo(student.admissionNumber);
//                         }}
//                     >
//                         <span className="font-semibold text-gray-800">{student.studentName}</span>
//                         <span className="text-sm text-gray-600 block sm:inline sm:ml-2">
//                          (Adm: {student.admissionNumber}, Class: {student.class}, Parent: {student.fatherName})
//                         </span>
//                     </div>
//                     ))}
//                 </div>
//              </div>
//         )}

//       {/* Student Forms Section - Conditionally Rendered */}
//       {showChildForms && parentData.length > 0 && (
//         <div className="mt-6 border-t pt-4">
//           <h2 className="text-xl font-semibold mb-3 text-gray-700">Selected Student(s) Fee Payment</h2>
//           <div className="flex flex-col gap-4"> {/* Changed to flex-col for better responsiveness */}
//             {parentData.map((child, index) => {
//               const currentFormData = formData[index]; // Get data for this child
//               // Skip rendering if there was an error fetching data for this child
//               if (!currentFormData || currentFormData.error) {
//                   return (
//                       <div key={child._id || index} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
//                           <strong className="font-bold">Error:</strong>
//                           <span className="block sm:inline"> Could not load fee data for {child.studentName} (Adm: {child.admissionNumber}).</span>
//                       </div>
//                   );
//               }

//               const isSelected = selectedChildrenIndices.includes(index);
//               const showForm = showFormFlags[index];

//               return (
//                 <div
//                   key={child._id || index} // Use unique key
//                   className={`bg-white rounded-lg shadow border transition-all duration-300 ${
//                     isSelected ? "border-blue-500 ring-1 ring-blue-300" : "border-gray-200"
//                   } overflow-hidden`} // Added overflow-hidden
//                 >
//                   {/* Child Header */}
//                   <div className="flex items-center p-3 border-b bg-gray-50 cursor-pointer" onClick={() => handleChildSelection(index)}>
//                     <input
//                       type="checkbox"
//                       id={`child-checkbox-${index}`}
//                       checked={isSelected}
//                       onChange={() => handleChildSelection(index)} // Let the div click handle it too
//                       className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                       aria-labelledby={`child-label-${index}`}
//                     />
//                     <label
//                       id={`child-label-${index}`}
//                       htmlFor={`child-checkbox-${index}`} // Ensures clicking label checks box
//                       className="flex-grow"
//                     >
//                       <div className="flex justify-between items-center">
//                           <div>
//                               <span className="text-lg font-semibold text-blue-800">
//                                   {child.studentName}
//                               </span>
//                               <span className="text-sm text-gray-600 ml-2">
//                                   (Class: {child.class} / Adm#: {child.admissionNumber})
//                               </span>
//                           </div>
//                            <span className={`text-sm font-medium px-2 py-0.5 rounded ${isSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
//                               {isSelected ? 'Selected' : 'Select'}
//                           </span>
//                       </div>

//                       <div className="flex justify-between text-xs mt-1">
//                           <span className="text-red-600 font-medium">
//                               Total Dues: ₹{currentFormData?.totalDues?.toFixed(2) || '0.00'}
//                           </span>
//                           {currentFormData?.lateFine > 0 && (
//                               <span className="text-orange-600 font-medium">
//                                   Late Fine: ₹{currentFormData?.lateFine?.toFixed(2)}
//                               </span>
//                           )}
//                            {currentFormData?.pastDues > 0 && (
//                               <span className="text-purple-600 font-medium ml-2">
//                                   Past Dues: ₹{currentFormData?.pastDues?.toFixed(2)}
//                               </span>
//                           )}
//                       </div>
//                     </label>
//                   </div>

//                   {/* Collapsible Form Area */}
//                   {showForm && (
//                     <div className="p-4 border-t md:flex md:gap-4"> {/* Use flex layout for side-by-side on medium+ screens */}

//                       {/* Left Side: Inputs */}
//                       <form onSubmit={(e) => handleSubmit(e, index)} className="flex-grow md:w-2/3 space-y-4 mb-4 md:mb-0">

//                           {/* Regular Fees Selection */}
//                            <div className="border rounded p-3 bg-gray-50">
//                               <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Select Months (Class Fee: ₹{currentFormData.classFee}/month)
//                               </label>
//                               <Select
//                                 isMulti
//                                 options={currentFormData.regularFees
//                                     .filter(fee => fee.status !== "Paid") // Only show unpaid/partially paid
//                                     .map(fee => ({
//                                         value: fee.month,
//                                         label: `${fee.month} (Due: ₹${fee.dueAmount.toFixed(2)})`,
//                                         due: fee.dueAmount, // Keep due info if needed by styles
//                                     }))
//                                 }
//                                 value={currentFormData.selectedMonths} // Bind to the array of selected month objects
//                                 onChange={(opts) => handleMonthSelection(index, opts)}
//                                 placeholder="Select months to pay..."
//                                 styles={customSelectStyles} // Apply custom styles
//                                 closeMenuOnSelect={false}
//                               />
//                           </div>

//                           {/* Additional Fees Selection */}
//                          <div className="border rounded p-3 bg-gray-50">
//                               <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Select Additional Fees
//                               </label>
//                               {console.log("Rendering Select - availableAdditionalFees:", currentFormData.availableAdditionalFees)}
//                               {console.log("Rendering Select - selectedAdditionalFees (names):", currentFormData.selectedAdditionalFees.map(f=>f.name))}
//                               <Select
//                                 isMulti
//                                 options={currentFormData.availableAdditionalFees} // Use per-child options
//                                 // Create value array based on stored selected fee names/details
//                                 value={currentFormData.availableAdditionalFees.filter(opt =>
//                                     currentFormData.selectedAdditionalFees.some(sel => sel.name === opt.name)
//                                 )}
//                                 onChange={(opts) => handleAdditionalFeesChange(index, opts)}
//                                 placeholder="Select additional fees..."
//                                 // styles={customSelectStyles} // Can use same or different styles
//                                 closeMenuOnSelect={false}
//                               />
//                           </div>

//                         {/* Other Inputs in a Grid */}
//                         <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                              <ReactInput
//                                 type="number"
//                                 label="Concession (-)"
//                                 value={currentFormData.concession}
//                                 onChange={(e) => handleInputChange(index, "concession", e.target.value)}
//                                 min="0"
//                                 step="0.01"
//                                 // placeholder="Enter concession amount"
//                              />
//                              <ReactInput
//                                 type="number"
//                                 label="Total Amount to Pay (*)"
//                                 value={currentFormData.totalAmount}
//                                 onChange={(e) => handleInputChange(index, "totalAmount", e.target.value)}
//                                 // placeholder="Enter amount..."
//                                 min="0"
//                                 step="0.01"
//                                 isRequired={true}
//                              />
//                             <div>
//                                 <label className="block text-sm font-medium text-gray-700">Payment Mode (*)</label>
//                                 <select
//                                 value={currentFormData.paymentMode}
//                                 onChange={(e) => handleInputChange(index, "paymentMode", e.target.value)}
//                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                                 required
//                                 >
//                                     <option value="Cash">Cash</option>
//                                     <option value="Online">Online</option>
//                                     <option value="Cheque">Cheque</option>
//                                     <option value="Card">Card</option>
//                                 </select>
//                             </div>
//                             <ReactInput
//                                 type="date"
//                                 label="Payment Date (*)"
//                                 value={currentFormData.date} // Should be YYYY-MM-DD
//                                 onChange={(e) => handleInputChange(index, "date", e.target.value)}
//                                 isRequired={true}
//                             />
//                             {(currentFormData.paymentMode === "Online" || currentFormData.paymentMode === "Card") && (
//                                 <ReactInput
//                                     type="text"
//                                     label="Transaction ID (*)"
//                                     value={currentFormData.transactionId}
//                                     onChange={(e) => handleInputChange(index, "transactionId", e.target.value)}
//                                     // placeholder="Enter transaction ID"
//                                     isRequired={true}
//                                 />
//                             )}
//                             {currentFormData.paymentMode === "Cheque" && (
//                                 <ReactInput
//                                     type="text"
//                                     label="Cheque Number (*)"
//                                     value={currentFormData.chequeBookNo}
//                                     onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)}
//                                     // placeholder="Enter cheque number"
//                                     isRequired={true}
//                                 />
//                             )}
//                         </div>

//                         {/* Remarks */}
//                          <div className="sm:col-span-2">
//                             <label className="block text-sm font-medium text-gray-700">Remarks</label>
//                             <textarea
//                                 value={currentFormData.remarks}
//                                 onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
//                                 className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
//                                 rows="2"
//                                 placeholder="Optional remarks..."
//                             />
//                         </div>

//                        {/* Submit Button for this child */}
//                         <div className="flex justify-end pt-4 border-t">
//                             <Button
//                             type="submit" // Changed to type submit for form handling
//                             name={`Submit Payment for ${child.studentName}`}
//                             className="bg-blue-600 hover:bg-blue-700 text-white"
//                             // Add disabled state based on loading or validation if needed
//                             />
//                         </div>
//                       </form>

//                      {/* Right Side: Fee Details Summary */}
//                      <div className="flex-shrink-0 md:w-1/3 border rounded p-4 bg-blue-50 md:ml-4">
//                         <h3 className="text-lg font-semibold text-blue-900 mb-3 border-b pb-2">
//                             Fee Summary
//                         </h3>
//                         <table className="w-full text-sm">
//                             <tbody>
//                                 {/* Display calculated items based on selections */}
//                                 {currentFormData.lateFine > 0 && (
//                                 <tr className="border-b border-blue-100">
//                                     <td className="text-gray-700 py-1.5">Late Fines:</td>
//                                     <td className="font-medium text-orange-700 py-1.5 text-right">
//                                     ₹{currentFormData.lateFine.toFixed(2)}
//                                     </td>
//                                 </tr>
//                                 )}
//                                 {currentFormData.pastDues > 0 && (
//                                 <tr className="border-b border-blue-100">
//                                     <td className="text-gray-700 py-1.5">Past Dues:</td>
//                                     <td className="font-medium text-purple-700 py-1.5 text-right">
//                                     ₹{currentFormData.pastDues.toFixed(2)}
//                                     </td>
//                                 </tr>
//                                 )}

//                                 {/* Selected Regular Fees */}
//                                 {currentFormData.selectedMonths.length > 0 && (
//                                      <tr className="border-b border-blue-100">
//                                          <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-800">Selected Regular Fees:</td>
//                                     </tr>
//                                 )}
//                                 {currentFormData.selectedMonths.map((monthOption, i) => {
//                                     const fee = currentFormData.regularFees.find(f => f.month === monthOption.value);
//                                     return (
//                                     <tr key={`reg-${index}-${i}`} className="border-b border-blue-100">
//                                         <td className="text-gray-600 py-1.5 pl-2">{monthOption.value}:</td>
//                                         <td className="font-medium text-blue-700 py-1.5 text-right">
//                                         ₹{(fee?.dueAmount || 0).toFixed(2)}
//                                         </td>
//                                     </tr>
//                                     );
//                                 })}

//                                 {/* Selected Additional Fees */}
//                                 {currentFormData.selectedAdditionalFees.length > 0 && (
//                                     <tr className="border-b border-blue-100">
//                                         <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-800">Selected Additional Fees:</td>
//                                     </tr>
//                                 )}
//                                 {currentFormData.selectedAdditionalFees.map((fee, i) => (
//                                     <tr key={`add-${index}-${i}`} className="border-b border-blue-100">
//                                     <td className="text-gray-600 py-1.5 pl-2">{fee.name}:</td>
//                                     <td className="font-medium text-blue-700 py-1.5 text-right">
//                                         ₹{(fee?.amount || 0).toFixed(2)}
//                                     </td>
//                                     </tr>
//                                 ))}

//                                 {/* Concession */}
//                                 {currentFormData.concession > 0 && (
//                                 <tr className="border-b border-blue-100">
//                                     <td className="text-green-700 py-1.5">Concession:</td>
//                                     <td className="font-medium text-green-700 py-1.5 text-right">
//                                     - ₹{parseFloat(currentFormData.concession).toFixed(2)}
//                                     </td>
//                                 </tr>
//                                 )}
//                             </tbody>
//                             <tfoot className="border-t-2 border-blue-200">
//                                 <tr>
//                                 <td className="pt-2 font-semibold text-blue-900 py-1.5">
//                                     Net Payable (Selected):
//                                 </td>
//                                 <td className="pt-2 font-semibold text-blue-900 py-1.5 text-right">
//                                     ₹{calculateNetPayableAmount(index).toFixed(2)}
//                                 </td>
//                                 </tr>
//                                 {/* Display Remaining Dues after Potential Payment */}
//                                 {(() => {
//                                     const distribution = calculateAutoDistribution(index);
//                                     return (
//                                         <>
//                                             {parseFloat(currentFormData.totalAmount) > 0 && (
//                                                  <tr >
//                                                     <td className="text-gray-700 py-1.5">Amount Paying:</td>
//                                                     <td className="font-medium text-black py-1.5 text-right">
//                                                         ₹{parseFloat(currentFormData.totalAmount).toFixed(2)}
//                                                     </td>
//                                                 </tr>
//                                             )}
//                                             <tr>
//                                                 <td className="font-semibold text-red-700 py-1.5">
//                                                     Remaining Dues:
//                                                 </td>
//                                                 <td className="font-semibold text-red-700 py-1.5 text-right">
//                                                 ₹{distribution.remainingDues.toFixed(2)}
//                                                 </td>
//                                             </tr>
//                                             {/* Optional: Show if overpaid */}
//                                             {distribution.remainingAfterDistribution > 0 && (
//                                                 <tr>
//                                                     <td className="font-semibold text-green-700 py-1.5 text-sm">
//                                                         (Excess Paid):
//                                                     </td>
//                                                     <td className="font-semibold text-green-700 py-1.5 text-right text-sm">
//                                                     ₹{distribution.remainingAfterDistribution.toFixed(2)}
//                                                     </td>
//                                                 </tr>
//                                             )}
//                                         </>
//                                     );
//                                 })()}
//                             </tfoot>
//                         </table>
//                      </div>
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       )}

//         {/* Fee History Display Area - Show only if one child's form is open */}
//          {showChildForms && childFeeHistory?.monthlyStatus?.length > 0 && (
//             <div className="mt-6 border-t pt-4">
//                 <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
//                    Fee History for {childFeeHistory?.studentName || 'Selected Student'} ({childFeeHistory?.session || session})
//                 </h2>
//                 <div>
//                     <MonthFeeCard childFeeHistory={childFeeHistory} />
//                 </div>
//             </div>
//         )}

//       {/* --- Modals --- */}
//       {/* Message Confirmation Modal */}
//        <Modal
//             setIsOpen={setIsMessageModalOpen} // Use the handler to control state
//             isOpen={isMessageModalOpen}
//             title="Send Confirmation?"
//             maxWidth="sm" // Adjust size: sm, md, lg, xl etc.
//         >
//             <div className="p-4">
//               <p className="text-gray-700 mb-4">
//                  Fee submitted successfully for {responseData?.student?.studentName}. Do you want to send an SMS confirmation to the parent ({responseData?.parent?.fatherPhone || 'N/A'})?
//               </p>
//               {/* Display key details from responseData if needed */}
//               {/* <p>Amount Paid: ₹{responseData?.transaction?.amountPaid}</p> */}
//               {/* <p>Receipt No: {responseData?.receipt?.receiptNo}</p> */}

//               <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//                 <Button
//                     type="button"
//                     name="Yes, Send SMS"
//                     onClick={() => handleCloseMessageModal(true)}
//                     className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2"
//                 />
//                 <Button
//                     type="button"
//                     name="No, Skip Message"
//                     onClick={() => handleCloseMessageModal(false)}
//                      className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
//                 />
//               </div>
//             </div>
//       </Modal>

//         {/* PDF / Receipt Modal */}
//        <Modal
//             setIsOpen={handleClosePdfModal} // Use handler
//             isOpen={pdfModalOpen}
//             title="Generate Receipt?"
//             maxWidth="sm"
//        >
//             <div className="p-4">
//                <p className="text-gray-700 mb-4">
//                    Do you want to download the fee receipt for {responseData?.student?.studentName}?
//                 </p>
//                  {/* Display key details from responseData if needed */}
//                 {/* <p>Amount Paid: ₹{responseData?.transaction?.amountPaid}</p> */}
//                 {/* <p>Receipt No: {responseData?.receipt?.receiptNo}</p> */}

//                 <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
//                     <Button
//                         type="button"
//                         label="Yes, Download PDF"
//                         onClick={() => handleClosePdfModal(true)}
//                         className="w-full bg-blue-600 hover:bg-blue-700 text-white sm:col-start-2"
//                         // Add disabled state if PDF generation is complex/async
//                     />
//                      <Button
//                         type="button"
//                         label="No, Finish"
//                         onClick={() => handleClosePdfModal(false)}
//                         className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
//                     />
//                 </div>
//             </div>
//         </Modal>

//     </div> // End of main container
//   );
// };

// export default CreateFees;




// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import {
//   ActiveStudents,
//   feescreateFeeStatus,
//   LateFines,
//   parentandchildwithID,
// } from "../../Network/AdminApi";
// import Button from "../../Dynamic/utils/Button";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import MonthFeeCard from "./MonthFeeCard";
// import moment from "moment/moment";
// import { FeeResponse } from "../../Dynamic/utils/Message";
// import generatePdf from "../../Dynamic/utils/pdfGenerator";

// // Custom styles for react-select to display dues in dropdown options
// const customSelectStyles = {
//   option: (provided, state) => ({
//     ...provided,
//     color: state.data.due > 0 ? "red" : "black",
//     fontSize: "14px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//     const [isModalOpen, setIsModalOpen] = useState(false);
//     const [responseData, setResponseData] = useState({});
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [childFeeHistory, setChildFeeHistory] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState();
//   // const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [allLateFines, setAllLateFines] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const [monthlyDues, setMonthlyDues] = useState({});
//   const [mode, setMode] = useState("auto"); // Toggle between auto and manual, default to auto
//   const authToken = localStorage.getItem("token");
//  const [credentialsModal, setCredentialsModal] = useState(false);
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

//   // Fetch initial data for students and late fines
//   const getAllStudent = async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//         setIsLoader(false);
//       } else {
//         setAllStudent([]);
//         setIsLoader(false);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   const getLateFinesData = async () => {
//     try {
//       const response = await LateFines();
//       if (response?.success) {
//         setAllLateFines(response.data || []);
//       } else {
//         toast.error(response?.message || "Failed to get late fine data.");
//         setAllLateFines([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching late fines.");
//       setAllLateFines([]);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//     getLateFinesData();
//   }, []);

//   // Search handlers
//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
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
//   };

//   // Fetch student fee info using getStudentFeeInfo API
//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch student fee info."
//         );
//         return null;
//       }
//     } catch (error) {
//       toast.error("Error fetching student fee info: " + error.message);
//       return null;
//     }
//   };

//   // Modal and student selection
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         // Initialize form data for each child
//         const initialFormData = [];
//         for (const child of children) {
//           const feeInfo = await fetchStudentFeeInfo(child.studentId);
//           console.log("feeInfo",feeInfo)
//           setChildFeeHistory(feeInfo)
//           if (!feeInfo) {
//             continue; // Skip if fee info fetch fails
//           }

//           const regularFeeAmount =feeInfo.feeStructure.regularFees[0]?.amount || 0;
//           const additionalFees = feeInfo.feeStructure.additionalFees || [];
//           const monthlyStatus = feeInfo.monthlyStatus || [];

//           // Prepare regular fees with due amounts
//           const regularFees = allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             return {
//               month,
//               paidAmount: "",
//               dueAmount: monthData?.regularFee.due || regularFeeAmount,
//               totalAmount: regularFeeAmount,
//               status: monthData?.regularFee.status || "Unpaid",
//             };
//           });

//           // Prepare additional fees with due amounts
//           const additionalFeesData = additionalFees.map((fee) => ({
//             name: fee.name,
//             type: fee.feeType,
//             amount: fee.amount,
//             months: allMonths.map((month) => {
//               const monthData = monthlyStatus.find((m) => m.month === month);
//               const addFee = monthData?.additionalFees.find(
//                 (af) => af.name === fee.name
//               );
//               return {
//                 month,
//                 paidAmount: "",
//                 dueAmount: addFee?.due || fee.amount,
//                 totalAmount: fee.amount,
//                 status: addFee?.status || "Unpaid",
//               };
//             }),
//           }));

//           initialFormData.push({
//             admissionNumber: child.admissionNumber,
//             studentId: child.studentId,
//             className: child.class,
//             classFee: regularFeeAmount,
//             totalAmount: "",
//             selectedMonths: [],
//             selectedAdditionalFees: [],
//             paymentMode: "Cash",
//             transactionId: "",
//             chequeBookNo: "",
//             // lateFine: feeInfo.feeStatus.totalLateFines || 0,
//             concession: "",
//             duesPaid: "",
//             date: moment(new Date)?.format("DD-MM-YYYY"),
//             remarks: "",
//             monthlyDues: feeInfo.feeStatus.monthlyDues || {
//               regularDues: [],
//               additionalDues: [],
//             },
//             additionalFeeDetails: additionalFeesData,
//             pastDues: feeInfo.feeStatus.pastDues || 0,
//             totalDues: feeInfo.feeStatus.dues || 0,
//             regularFees,
//             additionalFees: additionalFeesData,
//             feeInfo, // Store the full fee info for reference
//           });
//         }

//         setFormData(initialFormData);
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false));
//         setModalOpen(true);
//         setMonthlyDues({});
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm("");
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]);
//     }
//   };

//   // Child selection within modal
//   const handleChildSelection = async (child, index) => {
//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (isCurrentlySelected) {
//       const toBeRemovedIndex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(toBeRemovedIndex, 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;

//       // Fetch additional fees for the student's class
//       setIsLoader(true);
//       try {
//         const additionalFeesResponse = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         const feesData =
//           additionalFeesResponse?.data?.data
//             ?.filter((feeType) => feeType.className === child.class)
//             .map((fee) => ({
//               label: `${fee.name} (${fee.feeType})`,
//               value: fee.amount,
//               name: fee.name,
//               type: fee.feeType,
//             })) || [];
//         setAdditionalFeesOptions(feesData);
//       } catch (error) {
//         toast.error(
//           `Failed to fetch additional fees for ${child.studentName}.`
//         );
//       } finally {
//         setIsLoader(false);
//       }
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   // Form input handlers
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//     setFormData(updatedFormData);
//   };

//   const handleMonthSelection = (index, selectedOptions) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedMonths = selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedFees = selectedOptions
//       ? selectedOptions.map((opt) => ({
//           name: opt.name,
//           amount: opt.value,
//           type: opt.type,
//           months: [],
//         }))
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedFees;
//     setFormData(updatedFormData);
//   };


//   const calculateNetPayableAmount = (index) => {
//     const data = formData[index];
//     if (!data) return 0;
//     let total = 0;
//     total += parseFloat(data.lateFine) || 0;
//     total += parseFloat(data.pastDues) || 0;
//     const regularFeeTotal = data.selectedMonths.reduce((sum, month) => {
//       const fee = data.regularFees.find((f) => f.month === month);
//       return sum + (fee?.dueAmount || 0);
//     }, 0);
//     total += regularFeeTotal;

//     const additionalFeeTotal = data.selectedAdditionalFees.reduce((sum, fee) => {
//       return sum + (fee?.amount || 0);
//     }, 0);
//     total += additionalFeeTotal;
//     total -= parseFloat(data.concession) || 0;
//     return total;
//   };

//   // Auto mode payment distribution logic
//   const calculateAutoDistribution = (index) => {
//     const data = formData[index];
//     if (!data.totalAmount || parseFloat(data.totalAmount) <= 0) {
//       return {
//         lateFinesPaid: 0,
//         pastDuesPaid: 0,
//         regularFeesPaid: [],
//         additionalFeesPaid: [],
//         remainingAfterDistribution: 0,
//         remainingDues: calculateNetPayableAmount(index),
//       };
//     }

//     let remaining = parseFloat(data.totalAmount);
//     const lateFines = parseFloat(data.lateFine) || 0;
//     const pastDues = parseFloat(data.pastDues) || 0;

//     // Step 1: Pay late fines
//     const lateFinesPaid = Math.min(remaining, lateFines);
//     remaining -= lateFinesPaid;

//     // Step 2: Pay past dues
//     const pastDuesPaid = Math.min(remaining, pastDues);
//     remaining -= pastDuesPaid;

//     // Step 3: Pay regular fees for selected months
//     const regularFeesPaid = [];
//     data.selectedMonths.forEach((month) => {
//       if (remaining > 0) {
//         const fee = data.regularFees.find((f) => f.month === month);
//         const dueAmount = fee?.dueAmount || 0;
//         const payment = Math.min(remaining, dueAmount);
//         regularFeesPaid.push({ month, amount: payment });
//         remaining -= payment;
//       }
//     });

//     // Step 4: Pay additional fees for selected fees and months
//     const additionalFeesPaid = [];
//     data.selectedAdditionalFees.forEach((fee) => {
//       fee.months.forEach((month) => {
//         if (remaining > 0) {
//           const feeData = data.additionalFees.find((f) => f.name === fee.name);
//           const monthData = feeData?.months.find((m) => m.month === month);
//           const dueAmount = monthData?.dueAmount || 0;
//           const payment = Math.min(remaining, dueAmount);
//           additionalFeesPaid.push({ name: fee.name, month, amount: payment });
//           remaining -= payment;
//         }
//       });
//     });

//     // Calculate remaining dues
//     const netPayable = calculateNetPayableAmount(index);
//     const totalPaid = parseFloat(data.totalAmount);
//     const remainingDues = Math.max(0, netPayable - totalPaid);

//     return {
//       lateFinesPaid,
//       pastDuesPaid,
//       regularFeesPaid,
//       additionalFeesPaid,
//       remainingAfterDistribution: remaining,
//       remainingDues,
//     };
//   };
//   console.log("responseData",responseData)
//   const sendMessage=()=>{
//     console.log("responseData",responseData)
//     FeeResponse(responseData)
//   }






//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true);

//     if (selectedChildren.length === 0) {
//       toast.warn("Please select at least one student.");
//       setIsLoader(false);
//       return;
//     }

//     // Validate total amount against remaining dues
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       const netPayable = calculateNetPayableAmount(childIndex);
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;

//     }

//     const feePromises = [];
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];

//       if (!childFormData.paymentMode) {
//         toast.error(`Payment mode is required for ${child.studentName}`);
//         setIsLoader(false);
//         return;
//       }

//       const payload = {
//         studentId: child.studentId,
//         session,
//         // mode,
//         paymentDetails: {
//           regularFees:childFormData.selectedMonths.map((month) => ({
//                   month,
//                   // paidAmount: 0,
//                 }))
//              ,
//           additionalFees:
          
//                childFormData.selectedAdditionalFees.flatMap((fee) => ({
//                     name: fee.name,
//                     amount:fee?.amount,
//                     // paidAmount: 0,
//                   }))
//                 ,
              
//           pastDuesPaid: parseFloat(childFormData.duesPaid) || 0,
//           lateFinesPaid: parseFloat(childFormData.lateFine) || 0,
//           concession: parseFloat(childFormData.concession) || 0,
//           totalAmount: parseFloat(childFormData.totalAmount) || 0,
//           date:moment(childFormData?.date).format("DD-MM-YYYY"),
//           paymentMode: childFormData.paymentMode,
//           transactionId:
//             childFormData.paymentMode === "Online"
//               ? childFormData.transactionId
//               : "",
//           remark: childFormData.remarks || "",
//         },
//       };

//       try {
//         const response=await feescreateFeeStatus(payload)
//         if(response?.success){
//           setResponseData(response?.data)
//         setSelectedChildren([]); // Clear selected students
//         setChildFeeHistory([]); // Clear the history display
//         setShowForm([]); // Clear form visibility flags
//         setModalOpen(false); // Close the modal
//         setReload((prev) => !prev); // Trigger reload/refresh if needed

//          // Also reset search terms if you want the search cleared as well
//          setSearchTerm("");
//          setSearchTermbyadmissionNo("");
//          setFilteredStudents([]);
//          setIsLoader(false);
         
//          toast?.success(response?.message)
//          setCredentialsModal(true);
//          setIsModalOpen(true)
//         //  handleDownloadPdf()
//         }
// else{
//   toast?.error(response?.message)
//   setIsLoader(false);
// }
//       } catch (error) {
//         console.log("error",error)
//         setIsLoader(false);
//       }
//     }

//   };

//   return (
//     <div className="px-2">
   
//         <ReactInput
//           type="text"
//           label="Search by Name"
//           onChange={handleSearch}
//           value={searchTerm}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//         <ReactInput
//           type="text"
//           label="Search by Adm. No"
//           onChange={handleSearchbyAdmissionNo}
//           value={searchTermbyadmissionNo}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//       {filteredStudents.length > 0 && (
//         <div
//          >
//           <div 
//           >
//             {filteredStudents.map((student) => (
//               <div
//                 key={student._id}
//                 className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleStudentClick(student.parentId)}
//               >
//                 <span className="font-semibold">{student.studentName}</span>
//                 <span className="text-sm text-gray-600">
//                   , Class: {student.class}, AdmNo: {student.admissionNumber},
//                   Parent: {student.fatherName}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}    <div className="flex flex-col ">
//           <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto">
//             {parentData.map((child, index) => (
//               <div
//                 key={child._id}
//                 className={`bg-white rounded-lg shadow-md p-3 border ${
//                   selectedChildren.includes(index)
//                     ? "border-blue-500"
//                     : "border-gray-200"
//                 } h-full min-w-[300px] mb-3`}
//               >
//                 <div className="flex items-center border-b pb-2 mb-3">
//                   <input
//                     type="checkbox"
//                     id={`child-checkbox-${index}`}
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
//                   />
//                   <label
//                     htmlFor={`child-checkbox-${index}`}
//                     className="flex-grow cursor-pointer"
//                   >
//                     <span className="text-lg font-semibold text-blue-800">
//                       {child.studentName}
//                     </span>
//                     <span className="text-sm text-gray-700">
//                       {" / Class: "} {child.class} {" / Adm#: "}{" "}
//                       {child.admissionNumber}
//                     </span>
//                     <div className="flex justify-between text-sm mt-1">
//                       <span className="text-red-600 font-medium">
//                         Total Dues: ₹{formData[index]?.totalDues || 0}
//                       </span>
//                       {formData[index]?.lateFine > 0 && (
//                         <span className="text-orange-600 font-medium">
//                           Late Fine: ₹{formData[index]?.lateFine}
//                         </span>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {showForm[index] && formData[index] && (
//                   <div
//                    className="p-2"
//                    >
                   
//                       <div className="flex ">
//                        <div>
//                        <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Months for Regular Fees (₹
//                             {formData[index].classFee}/month)
//                           </label>
//                           <Select
//   isMulti
//   options={allMonths
//     .map((month) => {
//       const fee = formData[index].regularFees.find((f) => f.month === month);
//       if (fee?.status === "Paid") return null;

//       return {
//         value: month,
//         label: `${month} (₹${fee?.dueAmount || 0})`,
//         due: fee?.dueAmount || 0,
//       };
//     })
//     .filter(Boolean) // Null values hataane ke liye
//   }
//   value={formData[index].selectedMonths.map((m) => {
//     const fee = formData[index].regularFees.find((f) => f.month === m);
//     return {
//       value: m,
//       label: `${m} (₹${fee?.dueAmount || 0})`,
//       due: fee?.dueAmount || 0,
//     };
//   })}
//                             onChange={(opts) =>
//                               handleMonthSelection(index, opts)
//                             }
//                             placeholder="Select months..."
//                             styles={customSelectStyles}
//                           />
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Additional Fees
//                           </label>
//                           {console.log("additionalFeesOptions",additionalFeesOptions)}
//                           {console.log("formData[index].selectedAdditionalFees",formData[index].selectedAdditionalFees)}
//                           {console.log("formData[index].selectedAdditionalFees.map((f) =>",formData[index].selectedAdditionalFees)}
//                           <Select
//                             isMulti
//                             options={additionalFeesOptions}
//                             value={formData[index].selectedAdditionalFees.map(
//                               (f) => ({
//                                 label: `${f.name} (${f.amount})`,
//                                 value: f.amount,
//                                 name: f.name,
//                                 type: f.type,
//                               })
//                             )}
//                             onChange={(opts) =>
//                               handleAdditionalFeesChange(index, opts)
//                             }
//                             placeholder="Select additional fees..."
//                           />
                         
//                         </div>
//                         <div className="px-2  flex flex-wrap">
// <div className="">
//                         <label className="block text-sm font-medium text-gray-700">
//                           Concession
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].concession}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "concession",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>
//                         <div className=" ">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Total Amount to Pay
//                           </label>
//                           <input
//                             type="number"
//                             value={formData[index].totalAmount}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "totalAmount",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter amount..."
//                             min="0"
//                           />
//                         </div>
//                         <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index].paymentMode}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                         >
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                           <option value="Card">Card</option>
//                         </select>
//                       </div>

//                       {(formData[index].paymentMode === "Online" || formData[index].paymentMode === "Card") && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Transaction ID
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].transactionId}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "transactionId",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter transaction ID"
//                           />
//                         </div>
//                       )}

//                       {formData[index].paymentMode === "Cheque" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Cheque Number
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].chequeBookNo}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "chequeBookNo",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter cheque number"
//                           />
//                         </div>
//                       )}
//                       <div >
//                         <label className="block text-sm font-medium text-gray-700">
//                           Date
//                         </label>
//                         <input
//                           type="date"
//                           value={
//                             formData[index]?.date
//                             ? moment(formData[index].date).format("YYYY-MM-DD") // Format stored date
//                             : moment().format("YYYY-MM-DD") // Default to today
//                         }
//                           // value={moment(new Date()).format("MM-DD-YYYY")?moment(new Date()).format("MM-DD-YYYY"):formData[index].date}
//                           // value={formData[index].date?formData[index].date:moment(new Date()).format("MM-DD-YYYY")}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "date",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                           // min="0"
//                         />
//                       </div>
//                        <div className="sm:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700">
//                           Remarks
//                         </label>
//                         <textarea
//                           value={formData[index].remarks}
//                           onChange={(e) =>
//                             handleInputChange(index, "remarks", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           rows="2"
//                           placeholder="Optional remarks..."
//                         />
//                       </div>
// </div>
//                        </div>
//                         <div className="border border-white rounded px-3 "> {/* White border applied here */}
//   <table className="w-full text-sm">
//     {/* Table caption for accessibility and context */}
//     <caption className="text-lg font-semibold text-blue-900 mb-2 text-left">
//       Fee Details
//     </caption>

//     <tbody className="space-y-1"> {/* Adjusted spacing via tbody/tr margins if needed, or CSS */}

//       {formData[index].lateFine > 0 && (
//         <tr>
//           <td className="text-gray-700 py-1">Late Fines:</td>
//           <td className="font-medium text-blue-600 py-1 text-right">
//             ₹{formData[index].lateFine.toFixed(2)}
//           </td>
//         </tr>
//       )} 

//       {formData[index].pastDues > 0 && (
//         <tr>
//           <td className="text-gray-700 py-1">Past Dues:</td>
//           <td className="font-medium text-blue-600 py-1 text-right">
//             ₹{formData[index].pastDues.toFixed(2)}
//           </td>
//         </tr>
//       )}
//       {formData[index].selectedMonths.length > 1 && (
//            <tr>
//              <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-700">Regular Fees:</td>
//            </tr>
//       )}

//       {formData[index].selectedMonths.map((month, i) => {
//         const fee = formData[index].regularFees.find(
//           (f) => f.month === month
//         );
        
//         const label = formData[index].selectedMonths.length === 1
//             ? "Regular Fee:"
//             : `${month}:`; 

//         return (
//           <tr key={`reg-${index}-${i}`}>
//             <td className={`text-gray-700 py-1 ${formData[index].selectedMonths.length > 1 ? 'pl-2' : ''}`}>
//                 {label}
//             </td>
//             <td className="font-medium text-blue-600 py-1 text-right">
//               ₹{(fee?.dueAmount || 0).toFixed(2)}
//             </td>
//           </tr>
//         );
//       })}
//  {formData[index].selectedAdditionalFees.length > 0 && (
//          (formData[index].selectedAdditionalFees.reduce((sum, fee) => sum + fee.months.length, 0) > 1) && (
//            <tr>
//              <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-700">Additional Fees:</td>
//            </tr>
//          )
//        )}

// {formData[index].selectedAdditionalFees.map((val, i) => {

//   return (
//     <tr key={`add-${index}-${i}`}>
//       <td className={`text-gray-700 py-1 'pl-2`}>
//         {val?.name}
//       </td>
//       <td className="font-medium text-blue-600 py-1 text-right">
//         ₹{(val?.amount || 0).toFixed(2)}
       
//       </td>
//     </tr>
//   );
// })}

//       {formData[index].concession > 0 && (
//         <tr>
//           <td className="text-green-600 py-1">Concession:</td>
//           <td className="font-medium text-green-600 py-1 text-right">
//             ₹{formData[index].concession}.00
//           </td>
//         </tr>
//       )}
//     </tbody>

//     <tfoot className="border-t"> 
//       <tr>
//         <td className="pt-2 font-semibold text-blue-900 py-1">
//           Net Payable Amount:
//         </td>
//         <td className="pt-2 font-semibold text-blue-900 py-1 text-right">
//           ₹{calculateNetPayableAmount(index).toFixed(2)}
//         </td>
//       </tr>
//       {(() => {const distribution =  calculateAutoDistribution(index);return (  <>    <tr>
//         <td className="pt-2 font-semibold text-yellow-900 py-1">
//         Remaining Dues :
//         </td>
//         <td className="pt-2 font-semibold text-yellow-900 py-1 text-right">
//           ₹ {distribution.remainingDues.toFixed(2)}
//         </td>
//       </tr></>); })()}
//     </tfoot>
//   </table>
// </div>

//                       </div>
              
//                     <div className="flex justify-end gap-3 pt-2 border-t  sticky bottom-0">
//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Submit Fees
//             </button>
           
//           </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//         </div>
//         {console.log("childFeeHistory",childFeeHistory)}
//      {childFeeHistory?.monthlyStatus?.length>0 && 
     
//      <div className="px-4 mt-2 "> 
//      <h2 className="text-2xl font-bold text-center text-gray-800">
//        Student Fee Overview
//      </h2>
//      <div >
//          <MonthFeeCard childFeeHistory={childFeeHistory} />
      
      
//      </div>
//    </div>
//      }
     
//      {/* <Modal
//             setIsOpen={() => setIsModalOpen(false)}
//             isOpen={isModalOpen} title={"Addmission Successfully!"} maxWidth="100px">
//             <div className="bg-white p-6 rounded-lg shadow-lg">
//               <p>Do you want to send this</p>
//               <p> message to this number?</p>
//               <span className="text-indigo-800">{""}</span>
//               <span></span>
//               <div className="mt-4 flex justify-end space-x-4">
    
//                 <button
//                   onClick={() => sendMessage()}
//                   className="bg-green-500 text-white px-4 py-2 rounded w-full"
//                 >
//                   OK
//                 </button>
//                 <button
//                   onClick={() => setIsModalOpen(false)}
//                   className="bg-gray-500 text-white px-4 py-2 rounded w-full"
//                 >
//                   Cancel
//                 </button>
//               </div>
//             </div>
//           </Modal> */}

// <Modal isOpen={credentialsModal} setIsOpen={setCredentialsModal} title="Fee Receipt">
        
//       </Modal>
//     </div>
//   );
// };

// export default CreateFees;

// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import {
//   ActiveStudents,
//   LateFines,
//   parentandchildwithID,
// } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import MonthFeeCard from "./MonthFeeCard";
// import moment from "moment/moment";

// // Custom styles for react-select to display dues in dropdown options
// const customSelectStyles = {
//   option: (provided, state) => ({
//     ...provided,
//     color: state.data.due > 0 ? "red" : "black",
//     fontSize: "14px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [childFeeHistory, setChildFeeHistory] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState();
//   // const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [allLateFines, setAllLateFines] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const [monthlyDues, setMonthlyDues] = useState({});
//   const [mode, setMode] = useState("auto"); // Toggle between auto and manual, default to auto
//   const authToken = localStorage.getItem("token");

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

//   // Fetch initial data for students and late fines
//   const getAllStudent = async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//         setIsLoader(false);
//       } else {
//         setAllStudent([]);
//         setIsLoader(false);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   const getLateFinesData = async () => {
//     try {
//       const response = await LateFines();
//       if (response?.success) {
//         setAllLateFines(response.data || []);
//       } else {
//         toast.error(response?.message || "Failed to get late fine data.");
//         setAllLateFines([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching late fines.");
//       setAllLateFines([]);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//     getLateFinesData();
//   }, []);

//   // Search handlers
//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
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
//   };

//   // Fetch student fee info using getStudentFeeInfo API
//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch student fee info."
//         );
//         return null;
//       }
//     } catch (error) {
//       toast.error("Error fetching student fee info: " + error.message);
//       return null;
//     }
//   };

//   // Modal and student selection
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         // Initialize form data for each child
//         const initialFormData = [];
//         for (const child of children) {
//           const feeInfo = await fetchStudentFeeInfo(child.studentId);
//           console.log("feeInfo",feeInfo)
//           setChildFeeHistory(feeInfo)
//           if (!feeInfo) {
//             continue; // Skip if fee info fetch fails
//           }

//           const regularFeeAmount =feeInfo.feeStructure.regularFees[0]?.amount || 0;
//           const additionalFees = feeInfo.feeStructure.additionalFees || [];
//           const monthlyStatus = feeInfo.monthlyStatus || [];

//           // Prepare regular fees with due amounts
//           const regularFees = allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             return {
//               month,
//               paidAmount: "",
//               dueAmount: monthData?.regularFee.due || regularFeeAmount,
//               totalAmount: regularFeeAmount,
//               status: monthData?.regularFee.status || "Unpaid",
//             };
//           });

//           // Prepare additional fees with due amounts
//           const additionalFeesData = additionalFees.map((fee) => ({
//             name: fee.name,
//             type: fee.feeType,
//             amount: fee.amount,
//             months: allMonths.map((month) => {
//               const monthData = monthlyStatus.find((m) => m.month === month);
//               const addFee = monthData?.additionalFees.find(
//                 (af) => af.name === fee.name
//               );
//               return {
//                 month,
//                 paidAmount: "",
//                 dueAmount: addFee?.due || fee.amount,
//                 totalAmount: fee.amount,
//                 status: addFee?.status || "Unpaid",
//               };
//             }),
//           }));

//           initialFormData.push({
//             admissionNumber: child.admissionNumber,
//             studentId: child.studentId,
//             className: child.class,
//             classFee: regularFeeAmount,
//             totalAmount: "",
//             selectedMonths: [],
//             selectedAdditionalFees: [],
//             paymentMode: "Cash",
//             transactionId: "",
//             chequeBookNo: "",
//             // lateFine: feeInfo.feeStatus.totalLateFines || 0,
//             concession: "",
//             duesPaid: "",
//             date: moment(new Date)?.format("DD-MM-YYYY"),
//             remarks: "",
//             monthlyDues: feeInfo.feeStatus.monthlyDues || {
//               regularDues: [],
//               additionalDues: [],
//             },
//             additionalFeeDetails: additionalFeesData,
//             pastDues: feeInfo.feeStatus.pastDues || 0,
//             totalDues: feeInfo.feeStatus.dues || 0,
//             regularFees,
//             additionalFees: additionalFeesData,
//             feeInfo, // Store the full fee info for reference
//           });
//         }

//         setFormData(initialFormData);
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false));
//         setModalOpen(true);
//         setMonthlyDues({});
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm("");
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]);
//     }
//   };

//   // Child selection within modal
//   const handleChildSelection = async (child, index) => {
//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (isCurrentlySelected) {
//       const toBeRemovedIndex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(toBeRemovedIndex, 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;

//       // Fetch additional fees for the student's class
//       setIsLoader(true);
//       try {
//         const additionalFeesResponse = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         const feesData =
//           additionalFeesResponse?.data?.data
//             ?.filter((feeType) => feeType.className === child.class)
//             .map((fee) => ({
//               label: `${fee.name} (${fee.feeType})`,
//               value: fee.amount,
//               name: fee.name,
//               type: fee.feeType,
//             })) || [];
//         setAdditionalFeesOptions(feesData);
//       } catch (error) {
//         toast.error(
//           `Failed to fetch additional fees for ${child.studentName}.`
//         );
//       } finally {
//         setIsLoader(false);
//       }
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   // Form input handlers
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//     setFormData(updatedFormData);
//   };

//   const handleMonthSelection = (index, selectedOptions) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedMonths = selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedFees = selectedOptions
//       ? selectedOptions.map((opt) => ({
//           name: opt.name,
//           amount: opt.value,
//           type: opt.type,
//           months: [],
//         }))
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedFees;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeMonthSelection = (
//     index,
//     feeIndex,
//     selectedOptions
//   ) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees[feeIndex].months =
//       selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const calculateNetPayableAmount = (index) => {
//     const data = formData[index];
//     if (!data) return 0;
//     let total = 0;
//     total += parseFloat(data.lateFine) || 0;
//     total += parseFloat(data.pastDues) || 0;
//     const regularFeeTotal = data.selectedMonths.reduce((sum, month) => {
//       const fee = data.regularFees.find((f) => f.month === month);
//       return sum + (fee?.dueAmount || 0);
//     }, 0);
//     total += regularFeeTotal;

//     // Add additional fees for selected fees and months (only remaining dues)
//     const additionalFeeTotal = data.selectedAdditionalFees.reduce(
//       (sum, fee) => {
//         const feeData = data.additionalFees.find((f) => f.name === fee.name);
//         const monthsTotal = fee.months.reduce((monthSum, month) => {
//           const monthData = feeData?.months.find((m) => m.month === month);
//           return monthSum + (monthData?.dueAmount || 0);
//         }, 0);
//         return sum + monthsTotal;
//       },
//       0
//     );
//     total += additionalFeeTotal;
//     total -= parseFloat(data.concession) || 0;
//     return total;
//   };

//   // Auto mode payment distribution logic
//   const calculateAutoDistribution = (index) => {
//     const data = formData[index];
//     if (!data.totalAmount || parseFloat(data.totalAmount) <= 0) {
//       return {
//         lateFinesPaid: 0,
//         pastDuesPaid: 0,
//         regularFeesPaid: [],
//         additionalFeesPaid: [],
//         remainingAfterDistribution: 0,
//         remainingDues: calculateNetPayableAmount(index),
//       };
//     }

//     let remaining = parseFloat(data.totalAmount);
//     const lateFines = parseFloat(data.lateFine) || 0;
//     const pastDues = parseFloat(data.pastDues) || 0;

//     // Step 1: Pay late fines
//     const lateFinesPaid = Math.min(remaining, lateFines);
//     remaining -= lateFinesPaid;

//     // Step 2: Pay past dues
//     const pastDuesPaid = Math.min(remaining, pastDues);
//     remaining -= pastDuesPaid;

//     // Step 3: Pay regular fees for selected months
//     const regularFeesPaid = [];
//     data.selectedMonths.forEach((month) => {
//       if (remaining > 0) {
//         const fee = data.regularFees.find((f) => f.month === month);
//         const dueAmount = fee?.dueAmount || 0;
//         const payment = Math.min(remaining, dueAmount);
//         regularFeesPaid.push({ month, amount: payment });
//         remaining -= payment;
//       }
//     });

//     // Step 4: Pay additional fees for selected fees and months
//     const additionalFeesPaid = [];
//     data.selectedAdditionalFees.forEach((fee) => {
//       fee.months.forEach((month) => {
//         if (remaining > 0) {
//           const feeData = data.additionalFees.find((f) => f.name === fee.name);
//           const monthData = feeData?.months.find((m) => m.month === month);
//           const dueAmount = monthData?.dueAmount || 0;
//           const payment = Math.min(remaining, dueAmount);
//           additionalFeesPaid.push({ name: fee.name, month, amount: payment });
//           remaining -= payment;
//         }
//       });
//     });

//     // Calculate remaining dues
//     const netPayable = calculateNetPayableAmount(index);
//     const totalPaid = parseFloat(data.totalAmount);
//     const remainingDues = Math.max(0, netPayable - totalPaid);

//     return {
//       lateFinesPaid,
//       pastDuesPaid,
//       regularFeesPaid,
//       additionalFeesPaid,
//       remainingAfterDistribution: remaining,
//       remainingDues,
//     };
//   };

//   // Calculate total for display
//   const calculateTotalForChild = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     const total =
//      ( parseFloat(data.totalAmount || 0) +
//       parseFloat(data.lateFine || 0) +
//       parseFloat(data.duesPaid || 0))
  
//     return total < 0 ? 0 : total;
    
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true);

//     if (selectedChildren.length === 0) {
//       toast.warn("Please select at least one student.");
//       setIsLoader(false);
//       return;
//     }

//     // Validate total amount against remaining dues
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       const netPayable = calculateNetPayableAmount(childIndex);
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;

//       if (totalAmount > netPayable) {
//         toast.error(
//           `Total amount (₹${totalAmount}) for ${child.studentName} exceeds remaining dues (₹${netPayable}).`
//         );
//         setIsLoader(false);
//         return;
//       }
//     }

//     const feePromises = [];
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];

//       if (!childFormData.paymentMode) {
//         toast.error(`Payment mode is required for ${child.studentName}`);
//         setIsLoader(false);
//         return;
//       }

//       const payload = {
//         studentId: child.studentId,
//         session,
//         // mode,
//         paymentDetails: {
//           regularFees:childFormData.selectedMonths.map((month) => ({
//                   month,
//                   // paidAmount: 0,
//                 }))
//              ,
//           additionalFees:
          
//                childFormData.selectedAdditionalFees.flatMap((fee) =>
//                   fee.months.map((month) => ({
//                     name: fee.name,
//                     month,
//                     // paidAmount: 0,
//                   }))
//                 ),
//           pastDuesPaid: parseFloat(childFormData.duesPaid) || 0,
//           lateFinesPaid: parseFloat(childFormData.lateFine) || 0,
//           concession: parseFloat(childFormData.concession) || 0,
//           totalAmount: parseFloat(childFormData.totalAmount) || 0,
//           date:moment(childFormData?.date).format("DD-MM-YYYY"),
//           paymentMode: childFormData.paymentMode,
//           transactionId:
//             childFormData.paymentMode === "Online"
//               ? childFormData.transactionId
//               : "",
//           remark: childFormData.remarks || "",
//         },
//       };

//       feePromises.push(
//         axios
//           .post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus",
//             payload,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then((response) => ({
//             success: true,
//             studentName: child.studentName,
//             message: response.data.message,
//           }))
//           .catch((error) => ({
//             success: false,
//             studentName: child.studentName,
//             message: error.response?.data?.message || "Server error",
//           }))
//       );
//     }

//     try {
//       const results = await Promise.all(feePromises);
//       let allSuccess = true;

//       results.forEach((result) => {
//         if (result.success) {
//           toast.success(
//             `Fee created for ${result.studentName}: ${result.message}`
//           );
//            setSelectedChildren([])
//         setChildFeeHistory([])
//         } else {
//           toast.error(`Error for ${result.studentName}: ${result.message}`);
//           allSuccess = false;
//         }
//       });

//       if (allSuccess) {
//         setModalOpen(false);
//         setReload((prev) => !prev);
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred during submission.");
//     } finally {
//       setIsLoader(false);

//     }
//   };

//   return (
//     <div className="px-2">
    
//         <ReactInput
//           type="text"
//           label="Search by Name"
//           onChange={handleSearch}
//           value={searchTerm}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//         <ReactInput
//           type="text"
//           label="Search by Adm. No"
//           onChange={handleSearchbyAdmissionNo}
//           value={searchTermbyadmissionNo}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//       {filteredStudents.length > 0 && (
//         <div
//          >
//           <div 
//           >
//             {filteredStudents.map((student) => (
//               <div
//                 key={student._id}
//                 className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleStudentClick(student.parentId)}
//               >
//                 <span className="font-semibold">{student.studentName}</span>
//                 <span className="text-sm text-gray-600">
//                   , Class: {student.class}, AdmNo: {student.admissionNumber},
//                   Parent: {student.fatherName}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}    <div className="flex flex-col ">
//           <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto">
//             {parentData.map((child, index) => (
//               <div
//                 key={child._id}
//                 className={`bg-white rounded-lg shadow-md p-3 border ${
//                   selectedChildren.includes(index)
//                     ? "border-blue-500"
//                     : "border-gray-200"
//                 } h-full min-w-[300px] mb-3`}
//               >
//                 <div className="flex items-center border-b pb-2 mb-3">
//                   <input
//                     type="checkbox"
//                     id={`child-checkbox-${index}`}
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
//                   />
//                   <label
//                     htmlFor={`child-checkbox-${index}`}
//                     className="flex-grow cursor-pointer"
//                   >
//                     <span className="text-lg font-semibold text-blue-800">
//                       {child.studentName}
//                     </span>
//                     <span className="text-sm text-gray-700">
//                       {" / Class: "} {child.class} {" / Adm#: "}{" "}
//                       {child.admissionNumber}
//                     </span>
//                     <div className="flex justify-between text-sm mt-1">
//                       <span className="text-red-600 font-medium">
//                         Total Dues: ₹{formData[index]?.totalDues || 0}
//                       </span>
//                       {formData[index]?.lateFine > 0 && (
//                         <span className="text-orange-600 font-medium">
//                           Late Fine: ₹{formData[index]?.lateFine}
//                         </span>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {showForm[index] && formData[index] && (
//                   <div
//                    className="p-2"
//                    >
                   
//                       <div className="flex ">
//                        <div>
//                        <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Months for Regular Fees (₹
//                             {formData[index].classFee}/month)
//                           </label>
//                           <Select
//   isMulti
//   options={allMonths
//     .map((month) => {
//       const fee = formData[index].regularFees.find((f) => f.month === month);
//       if (fee?.status === "Paid") return null;

//       return {
//         value: month,
//         label: `${month} (₹${fee?.dueAmount || 0})`,
//         due: fee?.dueAmount || 0,
//       };
//     })
//     .filter(Boolean) // Null values hataane ke liye
//   }
//   value={formData[index].selectedMonths.map((m) => {
//     const fee = formData[index].regularFees.find((f) => f.month === m);
//     return {
//       value: m,
//       label: `${m} (₹${fee?.dueAmount || 0})`,
//       due: fee?.dueAmount || 0,
//     };
//   })}
//                             onChange={(opts) =>
//                               handleMonthSelection(index, opts)
//                             }
//                             placeholder="Select months..."
//                             styles={customSelectStyles}
//                           />
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Additional Fees
//                           </label>
//                           <Select
//                             isMulti
//                             options={additionalFeesOptions}
//                             value={formData[index].selectedAdditionalFees.map(
//                               (f) => ({
//                                 label: `${f.name} (${f.type})`,
//                                 value: f.amount,
//                                 name: f.name,
//                                 type: f.type,
//                               })
//                             )}
//                             onChange={(opts) =>
//                               handleAdditionalFeesChange(index, opts)
//                             }
//                             placeholder="Select additional fees..."
//                           />
//                           {formData[index].selectedAdditionalFees.map(
//                             (fee, feeIndex) => (
//                               <div key={feeIndex} className="mt-2">
//                                 <label className="text-sm text-gray-600">
//                                   {fee.name} (₹{fee.amount}) - Select Months
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allMonths
//                                     .map((month) => {
//                                       const feeData = formData[index].additionalFees.find((f) => f.name === fee.name
//                                       );
//                                       const monthData = feeData?.months.find((m) => m.month === month);
                                     
//                                       if(monthData?.status==="Paid") return null
//                                       return {
//                                         value: month,
//                                         label: `${month} (₹${
//                                           monthData?.dueAmount || 0
//                                         })`,
//                                         due: monthData?.dueAmount || 0,
//                                       };
//                                     })
//                                     .filter(Boolean)} 
//                                     // .filter((opt) => opt.due > 0)} 
//                                     // Filter out fully paid months
//                                   value={fee.months.map((m) => {
//                                     const feeData = formData[
//                                       index
//                                     ].additionalFees.find(
//                                       (f) => f.name === fee.name
//                                     );
//                                     const monthData = feeData?.months.find(
//                                       (md) => md.month === m
//                                     );
//                                     return {
//                                       value: m,
//                                       label: `${m} (₹${
//                                         monthData?.dueAmount || 0
//                                       })`,
//                                       due: monthData?.dueAmount || 0,
//                                     };
//                                   })}
//                                   onChange={(opts) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       opts
//                                     )
//                                   }
//                                   placeholder={`Months for ${fee.name}...`}
//                                   styles={customSelectStyles}
//                                 />
//                               </div>
//                             )
//                           )}
//                         </div>
//                        </div>
//                         <div className="border border-white rounded p-3 "> {/* White border applied here */}
//   <table className="w-full text-sm">
//     {/* Table caption for accessibility and context */}
//     <caption className="text-lg font-semibold text-blue-900 mb-2 text-left">
//       Fee Breakdown
//     </caption>

//     <tbody className="space-y-1"> {/* Adjusted spacing via tbody/tr margins if needed, or CSS */}

//       {formData[index].lateFine > 0 && (
//         <tr>
//           <td className="text-gray-700 py-1">Late Fines:</td>
//           <td className="font-medium text-blue-600 py-1 text-right">
//             ₹{formData[index].lateFine.toFixed(2)}
//           </td>
//         </tr>
//       )}

      

//       {formData[index].pastDues > 0 && (
//         <tr>
//           <td className="text-gray-700 py-1">Past Dues:</td>
//           <td className="font-medium text-blue-600 py-1 text-right">
//             ₹{formData[index].pastDues.toFixed(2)}
//           </td>
//         </tr>
//       )}
//       {formData[index].selectedMonths.length > 1 && (
//            <tr>
//              <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-700">Regular Fees:</td>
//            </tr>
//       )}

//       {formData[index].selectedMonths.map((month, i) => {
//         const fee = formData[index].regularFees.find(
//           (f) => f.month === month
//         );
        
//         const label = formData[index].selectedMonths.length === 1
//             ? "Regular Fee:"
//             : `${month}:`; 

//         return (
//           <tr key={`reg-${index}-${i}`}>
//             <td className={`text-gray-700 py-1 ${formData[index].selectedMonths.length > 1 ? 'pl-2' : ''}`}>
//                 {label}
//             </td>
//             <td className="font-medium text-blue-600 py-1 text-right">
//               ₹{(fee?.dueAmount || 0).toFixed(2)}
//             </td>
//           </tr>
//         );
//       })}
//  {formData[index].selectedAdditionalFees.length > 0 && (
//          (formData[index].selectedAdditionalFees.reduce((sum, fee) => sum + fee.months.length, 0) > 1) && (
//            <tr>
//              <td colSpan="2" className="pt-2 pb-1 font-medium text-gray-700">Additional Fees:</td>
//            </tr>
//          )
//        )}


//       {formData[index].selectedAdditionalFees.map((fee, i) => (
//         // No extra div needed here, map directly to rows
//           fee.months.map((month, j) => {
//             const feeData = formData[index].additionalFees.find(
//               (f) => f.name === fee.name
//             );
//             const monthData = feeData?.months.find(
//               (m) => m.month === month
//             );
//             // Handle case where only one additional fee exists or integrate label
//             const isOnlyAdditionalFee = formData[index].selectedAdditionalFees.length === 1 && fee.months.length === 1;
//              const label = isOnlyAdditionalFee
//                 ? `${fee.name}:`
//                 : `${fee.name} (${month}):`;

//             return (
//               <tr key={`add-${index}-${i}-${j}`}>
//                  {/* Indent slightly if needed using padding */}
//                 <td className={`text-gray-700 py-1 ${!isOnlyAdditionalFee ? 'pl-2' : ''}`}>
//                    {label}
//                 </td>
//                 <td className="font-medium text-blue-600 py-1 text-right">
//                   ₹{(monthData?.dueAmount || 0).toFixed(2)}
//                 </td>
//               </tr>
//             );
//           })
//       ))}
//       {formData[index].concession > 0 && (
//         <tr>
//           <td className="text-green-600 py-1">Concession:</td>
//           <td className="font-medium text-green-600 py-1 text-right">
//             ₹{formData[index].concession}.00
//           </td>
//         </tr>
//       )}
//     </tbody>

//     <tfoot className="border-t"> {/* Note: This top border will be the default color (likely gray) */}
//       <tr>
//         <td className="pt-2 font-semibold text-blue-900 py-1">
//           Net Payable Amount:
//         </td>
//         <td className="pt-2 font-semibold text-blue-900 py-1 text-right">
//           ₹{calculateNetPayableAmount(index).toFixed(2)}
//         </td>
//       </tr>
//       <tr>
//         <td className="pt-2 font-semibold text-blue-900 py-1">
//           Net Payable Amount:
//         </td>
//         <td className="pt-2 font-semibold text-blue-900 py-1 text-right">
//           ₹{calculateNetPayableAmount(index).toFixed(2)}
//         </td>
//       </tr>
//     </tfoot>
//   </table>
// </div>

// <div className="px-2">
// <div >
//                         <label className="block text-sm font-medium text-gray-700">
//                           Concession
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].concession}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "concession",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>
//                         <div className=" ">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Total Amount to Pay
//                           </label>
//                           <input
//                             type="number"
//                             value={formData[index].totalAmount}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "totalAmount",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter amount..."
//                             min="0"
//                           />
//                         </div>
//                         <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index].paymentMode}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                         >
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                           <option value="Card">Card</option>
//                         </select>
//                       </div>

//                       {(formData[index].paymentMode === "Online" || formData[index].paymentMode === "Card") && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Transaction ID
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].transactionId}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "transactionId",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter transaction ID"
//                           />
//                         </div>
//                       )}

//                       {formData[index].paymentMode === "Cheque" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Cheque Number
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].chequeBookNo}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "chequeBookNo",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter cheque number"
//                           />
//                         </div>
//                       )}
//                       <div >
//                         <label className="block text-sm font-medium text-gray-700">
//                           Date
//                         </label>
//                         <input
//                           type="date"
//                           value={formData[index].date}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "date",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>
//                        <div className="sm:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700">
//                           Remarks
//                         </label>
//                         <textarea
//                           value={formData[index].remarks}
//                           onChange={(e) =>
//                             handleInputChange(index, "remarks", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           rows="2"
//                           placeholder="Optional remarks..."
//                         />
//                       </div>
// </div>

                      
//                         {formData[index].totalAmount &&
//                           parseFloat(formData[index].totalAmount) > 0 && (
//                             <div className="border rounded p-3 bg-blue-50">
//                               <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                                 Payment Distribution Breakdown
//                               </h3>
//                               <div className="space-y-2">
//                                 {(() => {
//                                   const distribution =
//                                     calculateAutoDistribution(index);
//                                   return (
//                                     <>
//                                       {distribution.lateFinesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Late Fines Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.lateFinesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.pastDuesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Past Dues Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.pastDuesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.regularFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Regular Fees Paid:
//                                           </span>
//                                           {distribution.regularFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>{fee.month}:</span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.additionalFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Additional Fees Paid:
//                                           </span>
//                                           {distribution.additionalFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>
//                                                   {fee.name} ({fee.month}):
//                                                 </span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.remainingAfterDistribution >
//                                         0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Amount (Not Used):
//                                           </span>
//                                           <span className="font-medium text-orange-600">
//                                             ₹
//                                             {distribution.remainingAfterDistribution.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.remainingDues > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Dues (Added to Total
//                                             Dues):
//                                           </span>
//                                           <span className="font-medium text-red-600">
//                                             ₹
//                                             {distribution.remainingDues.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                     </>
//                                   );
//                                 })()}
//                               </div>
//                             </div>
//                           )}
//                       </div>
              
//                     <div className="flex justify-end gap-3 pt-2 border-t  sticky bottom-0">
//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Submit Fees
//             </button>
//             <button
//               type="button"
//               onClick={() => setModalOpen(false)}
//               className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//         </div>
//       {/* </Modal> */}
//       <div className="p-4 sm:p-6 bg-gray-50 "> {/* Added background */}
//       <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
//         Student Fee Overview
//       </h2>
//       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"> {/* Responsive Grid */}
//         {childFeeHistory?.monthlyStatus?.map((month) => (
//           <MonthFeeCard key={month.month} monthData={month} />
//         ))}
//       </div>
//     </div>
//     </div>
//   );
// };

// export default CreateFees;








// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import {
//   ActiveStudents,
//   LateFines,
//   parentandchildwithID,
// } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// // Custom styles for react-select to display dues in dropdown options
// const customSelectStyles = {
//   option: (provided, state) => ({
//     ...provided,
//     color: state.data.due > 0 ? "red" : "black",
//     fontSize: "14px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState();
//   // const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [allLateFines, setAllLateFines] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const [monthlyDues, setMonthlyDues] = useState({});
//   const [mode, setMode] = useState("auto"); // Toggle between auto and manual, default to auto
//   const authToken = localStorage.getItem("token");

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

//   // Fetch initial data for students and late fines
//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//       } else {
//         setAllStudent([]);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   const getLateFinesData = async () => {
//     try {
//       const response = await LateFines();
//       if (response?.success) {
//         setAllLateFines(response.data || []);
//       } else {
//         toast.error(response?.message || "Failed to get late fine data.");
//         setAllLateFines([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching late fines.");
//       setAllLateFines([]);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//     getLateFinesData();
//   }, []);

//   // Search handlers
//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
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
//   };

//   // Fetch student fee info using getStudentFeeInfo API
//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch student fee info."
//         );
//         return null;
//       }
//     } catch (error) {
//       toast.error("Error fetching student fee info: " + error.message);
//       return null;
//     }
//   };

//   // Modal and student selection
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         // Initialize form data for each child
//         const initialFormData = [];
//         for (const child of children) {
//           const feeInfo = await fetchStudentFeeInfo(child.studentId);
//           console.log("feeInfo",feeInfo)
//           if (!feeInfo) {
//             continue; // Skip if fee info fetch fails
//           }

//           const regularFeeAmount =feeInfo.feeStructure.regularFees[0]?.amount || 0;
//           const additionalFees = feeInfo.feeStructure.additionalFees || [];
//           const monthlyStatus = feeInfo.monthlyStatus || [];

//           // Prepare regular fees with due amounts
//           const regularFees = allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             return {
//               month,
//               paidAmount: "",
//               dueAmount: monthData?.regularFee.due || regularFeeAmount,
//               totalAmount: regularFeeAmount,
//               status: monthData?.regularFee.status || "Unpaid",
//             };
//           });

//           // Prepare additional fees with due amounts
//           const additionalFeesData = additionalFees.map((fee) => ({
//             name: fee.name,
//             type: fee.feeType,
//             amount: fee.amount,
//             months: allMonths.map((month) => {
//               const monthData = monthlyStatus.find((m) => m.month === month);
//               const addFee = monthData?.additionalFees.find(
//                 (af) => af.name === fee.name
//               );
//               return {
//                 month,
//                 paidAmount: "",
//                 dueAmount: addFee?.due || fee.amount,
//                 totalAmount: fee.amount,
//                 status: addFee?.status || "Unpaid",
//               };
//             }),
//           }));

//           initialFormData.push({
//             admissionNumber: child.admissionNumber,
//             studentId: child.studentId,
//             className: child.class,
//             classFee: regularFeeAmount,
//             totalAmount: "",
//             selectedMonths: [],
//             selectedAdditionalFees: [],
//             paymentMode: "Cash",
//             transactionId: "",
//             chequeBookNo: "",
//             // lateFine: feeInfo.feeStatus.totalLateFines || 0,
//             concession: "",
//             duesPaid: "",
//             remarks: "",
//             monthlyDues: feeInfo.feeStatus.monthlyDues || {
//               regularDues: [],
//               additionalDues: [],
//             },
//             additionalFeeDetails: additionalFeesData,
//             pastDues: feeInfo.feeStatus.pastDues || 0,
//             totalDues: feeInfo.feeStatus.dues || 0,
//             regularFees,
//             additionalFees: additionalFeesData,
//             feeInfo, // Store the full fee info for reference
//           });
//         }

//         setFormData(initialFormData);
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false));
//         setModalOpen(true);
//         setMonthlyDues({});
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm("");
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]);
//     }
//   };

//   // Child selection within modal
//   const handleChildSelection = async (child, index) => {
//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (isCurrentlySelected) {
//       const toBeRemovedIndex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(toBeRemovedIndex, 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;

//       // Fetch additional fees for the student's class
//       setIsLoader(true);
//       try {
//         const additionalFeesResponse = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         const feesData =
//           additionalFeesResponse?.data?.data
//             ?.filter((feeType) => feeType.className === child.class)
//             .map((fee) => ({
//               label: `${fee.name} (${fee.feeType})`,
//               value: fee.amount,
//               name: fee.name,
//               type: fee.feeType,
//             })) || [];
//         setAdditionalFeesOptions(feesData);
//       } catch (error) {
//         toast.error(
//           `Failed to fetch additional fees for ${child.studentName}.`
//         );
//       } finally {
//         setIsLoader(false);
//       }
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   // Form input handlers
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//     setFormData(updatedFormData);
//   };

//   const handleMonthSelection = (index, selectedOptions) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedMonths = selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedFees = selectedOptions
//       ? selectedOptions.map((opt) => ({
//           name: opt.name,
//           amount: opt.value,
//           type: opt.type,
//           months: [],
//         }))
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedFees;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeMonthSelection = (
//     index,
//     feeIndex,
//     selectedOptions
//   ) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees[feeIndex].months =
//       selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const calculateNetPayableAmount = (index) => {
//     const data = formData[index];
//     if (!data) return 0;
//     let total = 0;
//     total += parseFloat(data.lateFine) || 0;
//     total += parseFloat(data.pastDues) || 0;
//     const regularFeeTotal = data.selectedMonths.reduce((sum, month) => {
//       const fee = data.regularFees.find((f) => f.month === month);
//       return sum + (fee?.dueAmount || 0);
//     }, 0);
//     total += regularFeeTotal;

//     // Add additional fees for selected fees and months (only remaining dues)
//     const additionalFeeTotal = data.selectedAdditionalFees.reduce(
//       (sum, fee) => {
//         const feeData = data.additionalFees.find((f) => f.name === fee.name);
//         const monthsTotal = fee.months.reduce((monthSum, month) => {
//           const monthData = feeData?.months.find((m) => m.month === month);
//           return monthSum + (monthData?.dueAmount || 0);
//         }, 0);
//         return sum + monthsTotal;
//       },
//       0
//     );
//     total += additionalFeeTotal;

//     return total;
//   };

//   // Auto mode payment distribution logic
//   const calculateAutoDistribution = (index) => {
//     const data = formData[index];
//     if (!data.totalAmount || parseFloat(data.totalAmount) <= 0) {
//       return {
//         lateFinesPaid: 0,
//         pastDuesPaid: 0,
//         regularFeesPaid: [],
//         additionalFeesPaid: [],
//         remainingAfterDistribution: 0,
//         remainingDues: calculateNetPayableAmount(index),
//       };
//     }

//     let remaining = parseFloat(data.totalAmount);
//     const lateFines = parseFloat(data.lateFine) || 0;
//     const pastDues = parseFloat(data.pastDues) || 0;

//     // Step 1: Pay late fines
//     const lateFinesPaid = Math.min(remaining, lateFines);
//     remaining -= lateFinesPaid;

//     // Step 2: Pay past dues
//     const pastDuesPaid = Math.min(remaining, pastDues);
//     remaining -= pastDuesPaid;

//     // Step 3: Pay regular fees for selected months
//     const regularFeesPaid = [];
//     data.selectedMonths.forEach((month) => {
//       if (remaining > 0) {
//         const fee = data.regularFees.find((f) => f.month === month);
//         const dueAmount = fee?.dueAmount || 0;
//         const payment = Math.min(remaining, dueAmount);
//         regularFeesPaid.push({ month, amount: payment });
//         remaining -= payment;
//       }
//     });

//     // Step 4: Pay additional fees for selected fees and months
//     const additionalFeesPaid = [];
//     data.selectedAdditionalFees.forEach((fee) => {
//       fee.months.forEach((month) => {
//         if (remaining > 0) {
//           const feeData = data.additionalFees.find((f) => f.name === fee.name);
//           const monthData = feeData?.months.find((m) => m.month === month);
//           const dueAmount = monthData?.dueAmount || 0;
//           const payment = Math.min(remaining, dueAmount);
//           additionalFeesPaid.push({ name: fee.name, month, amount: payment });
//           remaining -= payment;
//         }
//       });
//     });

//     // Calculate remaining dues
//     const netPayable = calculateNetPayableAmount(index);
//     const totalPaid = parseFloat(data.totalAmount);
//     const remainingDues = Math.max(0, netPayable - totalPaid);

//     return {
//       lateFinesPaid,
//       pastDuesPaid,
//       regularFeesPaid,
//       additionalFeesPaid,
//       remainingAfterDistribution: remaining,
//       remainingDues,
//     };
//   };

//   // Calculate total for display
//   const calculateTotalForChild = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     const total =
//      ( parseFloat(data.totalAmount || 0) +
//       parseFloat(data.lateFine || 0) +
//       parseFloat(data.duesPaid || 0))
//       -
//       parseFloat(data.concession || 0) ;
//     return total < 0 ? 0 : total;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true);

//     if (selectedChildren.length === 0) {
//       toast.warn("Please select at least one student.");
//       setIsLoader(false);
//       return;
//     }

//     // Validate total amount against remaining dues
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       const netPayable = calculateNetPayableAmount(childIndex);
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;

//       if (totalAmount > netPayable) {
//         toast.error(
//           `Total amount (₹${totalAmount}) for ${child.studentName} exceeds remaining dues (₹${netPayable}).`
//         );
//         setIsLoader(false);
//         return;
//       }
//     }

//     const feePromises = [];
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];

//       if (!childFormData.paymentMode) {
//         toast.error(`Payment mode is required for ${child.studentName}`);
//         setIsLoader(false);
//         return;
//       }

//       const payload = {
//         studentId: child.studentId,
//         session,
//         // mode,
//         paymentDetails: {
//           regularFees:childFormData.selectedMonths.map((month) => ({
//                   month,
//                   // paidAmount: 0,
//                 }))
//              ,
//           additionalFees:
          
//                childFormData.selectedAdditionalFees.flatMap((fee) =>
//                   fee.months.map((month) => ({
//                     name: fee.name,
//                     month,
//                     // paidAmount: 0,
//                   }))
//                 ),
//           pastDuesPaid: parseFloat(childFormData.duesPaid) || 0,
//           lateFinesPaid: parseFloat(childFormData.lateFine) || 0,
//           concession: parseFloat(childFormData.concession) || 0,
//           totalAmount: parseFloat(childFormData.totalAmount) || 0,
//           paymentMode: childFormData.paymentMode,
//           transactionId:
//             childFormData.paymentMode === "Online"
//               ? childFormData.transactionId
//               : "",
//           remark: childFormData.remarks || "",
//         },
//       };

//       feePromises.push(
//         axios
//           .post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus",
//             payload,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then((response) => ({
//             success: true,
//             studentName: child.studentName,
//             message: response.data.message,
//           }))
//           .catch((error) => ({
//             success: false,
//             studentName: child.studentName,
//             message: error.response?.data?.message || "Server error",
//           }))
//       );
//     }

//     try {
//       const results = await Promise.all(feePromises);
//       let allSuccess = true;

//       results.forEach((result) => {
//         if (result.success) {
//           toast.success(
//             `Fee created for ${result.studentName}: ${result.message}`
//           );
//         } else {
//           toast.error(`Error for ${result.studentName}: ${result.message}`);
//           allSuccess = false;
//         }
//       });

//       if (allSuccess) {
//         setModalOpen(false);
//         setReload((prev) => !prev);
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred during submission.");
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   return (
//     <div className="md:min-h-screen py-4">
//       {/* Search Inputs */}
//       <div className="flex flex-col sm:flex-row gap-2 mb-2">
//         <ReactInput
//           type="text"
//           label="Search by Name"
//           onChange={handleSearch}
//           value={searchTerm}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//         <ReactInput
//           type="text"
//           label="Search by Adm. No"
//           onChange={handleSearchbyAdmissionNo}
//           value={searchTermbyadmissionNo}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//       </div>

//       {/* Search Results Dropdown */}
//       {filteredStudents.length > 0 && (
//         <div className="relative">
//           <div className="absolute z-10 w-full md:w-1/2 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
//             {filteredStudents.map((student) => (
//               <div
//                 key={student._id}
//                 className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleStudentClick(student.parentId)}
//               >
//                 <span className="font-semibold">{student.studentName}</span>
//                 <span className="text-sm text-gray-600">
//                   , Class: {student.class}, AdmNo: {student.admissionNumber},
//                   Parent: {student.fatherName}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Fee Creation Modal */}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title="Create Fees">
//         <div className="flex flex-col max-h-[80vh]">
//           <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto">
//             {parentData.map((child, index) => (
//               <div
//                 key={child._id}
//                 className={`bg-white rounded-lg shadow-md p-3 border ${
//                   selectedChildren.includes(index)
//                     ? "border-blue-500"
//                     : "border-gray-200"
//                 } h-full min-w-[300px] mb-3`}
//               >
//                 <div className="flex items-center border-b pb-2 mb-3">
//                   <input
//                     type="checkbox"
//                     id={`child-checkbox-${index}`}
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
//                   />
//                   <label
//                     htmlFor={`child-checkbox-${index}`}
//                     className="flex-grow cursor-pointer"
//                   >
//                     <span className="text-lg font-semibold text-blue-800">
//                       {child.studentName}
//                     </span>
//                     <span className="text-sm text-gray-700">
//                       {" / Class: "} {child.class} {" / Adm#: "}{" "}
//                       {child.admissionNumber}
//                     </span>
//                     <div className="flex justify-between text-sm mt-1">
//                       <span className="text-red-600 font-medium">
//                         Total Dues: ₹{formData[index]?.totalDues || 0}
//                       </span>
//                       {formData[index]?.lateFine > 0 && (
//                         <span className="text-orange-600 font-medium">
//                           Late Fine: ₹{formData[index]?.lateFine}
//                         </span>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {showForm[index] && formData[index] && (
//                   <div className="space-y-4">
                   
//                       <>
//                         {/* Auto Mode UI */}
//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Months for Regular Fees (₹
//                             {formData[index].classFee}/month)
//                           </label>
//                           <Select
//   isMulti
//   options={allMonths
//     .map((month) => {
//       console.log("month month", month);
//       const fee = formData[index].regularFees.find((f) => f.month === month);

//       // Status "Paid" waale months hata rahe hain
//       if (fee?.status === "Paid") return null;

//       return {
//         value: month,
//         label: `${month} (₹${fee?.dueAmount || 0})`,
//         due: fee?.dueAmount || 0,
//       };
//     })
//     .filter(Boolean) // Null values hataane ke liye
//   }
//   value={formData[index].selectedMonths.map((m) => {
//     const fee = formData[index].regularFees.find((f) => f.month === m);
//     return {
//       value: m,
//       label: `${m} (₹${fee?.dueAmount || 0})`,
//       due: fee?.dueAmount || 0,
//     };
//   })}
//                             onChange={(opts) =>
//                               handleMonthSelection(index, opts)
//                             }
//                             placeholder="Select months..."
//                             styles={customSelectStyles}
//                           />
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Additional Fees
//                           </label>
//                           <Select
//                             isMulti
//                             options={additionalFeesOptions}
//                             value={formData[index].selectedAdditionalFees.map(
//                               (f) => ({
//                                 label: `${f.name} (${f.type})`,
//                                 value: f.amount,
//                                 name: f.name,
//                                 type: f.type,
//                               })
//                             )}
//                             onChange={(opts) =>
//                               handleAdditionalFeesChange(index, opts)
//                             }
//                             placeholder="Select additional fees..."
//                           />
//                           {formData[index].selectedAdditionalFees.map(
//                             (fee, feeIndex) => (
//                               <div key={feeIndex} className="mt-2">
//                                 <label className="text-sm text-gray-600">
//                                   {fee.name} (₹{fee.amount}) - Select Months
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allMonths
//                                     .map((month) => {
//                                       const feeData = formData[index].additionalFees.find((f) => f.name === fee.name
//                                       );
//                                       const monthData = feeData?.months.find((m) => m.month === month);
//                                       console.log("first monthData",monthData)
//                                       if(monthData?.status==="Paid") return null
//                                       return {
//                                         value: month,
//                                         label: `${month} (₹${
//                                           monthData?.dueAmount || 0
//                                         })`,
//                                         due: monthData?.dueAmount || 0,
//                                       };
//                                     })
//                                     .filter(Boolean)} 
//                                     // .filter((opt) => opt.due > 0)} 
//                                     // Filter out fully paid months
//                                   value={fee.months.map((m) => {
//                                     const feeData = formData[
//                                       index
//                                     ].additionalFees.find(
//                                       (f) => f.name === fee.name
//                                     );
//                                     const monthData = feeData?.months.find(
//                                       (md) => md.month === m
//                                     );
//                                     return {
//                                       value: m,
//                                       label: `${m} (₹${
//                                         monthData?.dueAmount || 0
//                                       })`,
//                                       due: monthData?.dueAmount || 0,
//                                     };
//                                   })}
//                                   onChange={(opts) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       opts
//                                     )
//                                   }
//                                   placeholder={`Months for ${fee.name}...`}
//                                   styles={customSelectStyles}
//                                 />
//                               </div>
//                             )
//                           )}
//                         </div>

//                         {/* Fee Breakdown Before Payment */}
//                         <div className="border rounded p-3 bg-blue-50">
//                           <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                             Fee Breakdown
//                           </h3>
//                           <div className="space-y-2">
//                             {formData[index].lateFine > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Late Fines:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].lateFine.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].pastDues > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Past Dues:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].pastDues.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].selectedMonths.length > 0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Regular Fees:
//                                 </span>
//                                 {formData[index].selectedMonths.map(
//                                   (month, i) => {
//                                     const fee = formData[
//                                       index
//                                     ].regularFees.find(
//                                       (f) => f.month === month
//                                     );
//                                     return (
//                                       <div
//                                         key={i}
//                                         className="flex justify-between text-sm ml-2"
//                                       >
//                                         <span>{month}:</span>
//                                         <span className="font-medium text-blue-600">
//                                           ₹{(fee?.dueAmount || 0).toFixed(2)}
//                                         </span>
//                                       </div>
//                                     );
//                                   }
//                                 )}
//                               </div>
//                             )}
//                             {formData[index].selectedAdditionalFees.length >
//                               0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Additional Fees:
//                                 </span>
//                                 {formData[index].selectedAdditionalFees.map(
//                                   (fee, i) => (
//                                     <div key={i}>
//                                       {fee.months.map((month, j) => {
//                                         const feeData = formData[
//                                           index
//                                         ].additionalFees.find(
//                                           (f) => f.name === fee.name
//                                         );
//                                         const monthData = feeData?.months.find(
//                                           (m) => m.month === month
//                                         );
//                                         return (
//                                           <div
//                                             key={j}
//                                             className="flex justify-between text-sm ml-2"
//                                           >
//                                             <span>
//                                               {fee.name} ({month}):
//                                             </span>
//                                             <span className="font-medium text-blue-600">
//                                               ₹
//                                               {(
//                                                 monthData?.dueAmount || 0
//                                               ).toFixed(2)}
//                                             </span>
//                                           </div>
//                                         );
//                                       })}
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             )}
//                             <div className="flex justify-between text-sm font-semibold border-t pt-2">
//                               <span className="text-gray-700">
//                                 Net Payable Amount:
//                               </span>
//                               <span className="text-blue-900">
//                                 ₹{calculateNetPayableAmount(index).toFixed(2)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Total Amount to Pay
//                           </label>
//                           <input
//                             type="number"
//                             value={formData[index].totalAmount}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "totalAmount",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter amount..."
//                             min="0"
//                           />
//                         </div>

//                         {/* Auto Mode Payment Distribution */}
//                         {formData[index].totalAmount &&
//                           parseFloat(formData[index].totalAmount) > 0 && (
//                             <div className="border rounded p-3 bg-blue-50">
//                               <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                                 Payment Distribution Breakdown
//                               </h3>
//                               <div className="space-y-2">
//                                 {(() => {
//                                   const distribution =
//                                     calculateAutoDistribution(index);
//                                   return (
//                                     <>
//                                       {distribution.lateFinesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Late Fines Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.lateFinesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.pastDuesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Past Dues Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.pastDuesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.regularFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Regular Fees Paid:
//                                           </span>
//                                           {distribution.regularFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>{fee.month}:</span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.additionalFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Additional Fees Paid:
//                                           </span>
//                                           {distribution.additionalFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>
//                                                   {fee.name} ({fee.month}):
//                                                 </span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.remainingAfterDistribution >
//                                         0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Amount (Not Used):
//                                           </span>
//                                           <span className="font-medium text-orange-600">
//                                             ₹
//                                             {distribution.remainingAfterDistribution.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.remainingDues > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Dues (Added to Total
//                                             Dues):
//                                           </span>
//                                           <span className="font-medium text-red-600">
//                                             ₹
//                                             {distribution.remainingDues.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                     </>
//                                   );
//                                 })()}
//                               </div>
//                             </div>
//                           )}
//                       </>
                   

//                     {/* Common Fields */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index].paymentMode}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                         >
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                         </select>
//                       </div>

//                       {formData[index].paymentMode === "Online" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Transaction ID
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].transactionId}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "transactionId",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter transaction ID"
//                           />
//                         </div>
//                       )}

//                       {formData[index].paymentMode === "Cheque" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Cheque Number
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].chequeBookNo}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "chequeBookNo",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter cheque number"
//                           />
//                         </div>
//                       )}

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Late Fine
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].lateFine}
//                           onChange={(e) =>
//                             handleInputChange(index, "lateFine", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Concession
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].concession}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "concession",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Dues Paid
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].duesPaid}
//                           onChange={(e) =>
//                             handleInputChange(index, "duesPaid", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div className="sm:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700">
//                           Remarks
//                         </label>
//                         <textarea
//                           value={formData[index].remarks}
//                           onChange={(e) =>
//                             handleInputChange(index, "remarks", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           rows="2"
//                           placeholder="Optional remarks..."
//                         />
//                       </div>

//                       <div className="sm:col-span-2 p-2 bg-blue-50 rounded border border-blue-200">
//                         <label className="block text-lg font-semibold text-blue-900">
//                           Net Amount Payable: ₹{" "}
//                           {calculateTotalForChild(index).toFixed(2)}
//                         </label>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0">
//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Submit Fees
//             </button>
//             <button
//               type="button"
//               onClick={() => setModalOpen(false)}
//               className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </Modal>

//     </div>
//   );
// };

// export default CreateFees;






// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// // Assuming Table component exists but is not shown/modified here
// // import Table from "./Table";
// import {
//   ActiveStudents,
//   LateFines, // Assuming this fetches overall late fine settings, not student specific
//   parentandchildwithID,
// } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Table from "./Table";

// // Custom styles for react-select
// const customSelectStyles = {
//   option: (provided, state) => ({
//     ...provided,
//     // Keep due styling for regular fees, remove for additional
//     color: state.data.due > 0 ? "red" : "black",
//     fontSize: "14px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };

// // Custom styles for additional fees select (no due coloring needed)
// const additionalFeeSelectStyles = {
//    option: (provided) => ({
//     ...provided,
//     fontSize: "14px",
//   }),
//    multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };


// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false); // Keep reload state
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState(""); // Initialize as empty string
//   // const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]); // Now stored per student in formData
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   // const [allLateFines, setAllLateFines] = useState([]); // Keep if needed for general late fine rules
//   const [formData, setFormData] = useState([]);
//   // const [monthlyDues, setMonthlyDues] = useState({}); // Likely less relevant now for additional fees
//   const mode = "auto"; // Hardcoded to auto as per previous structure
//   const authToken = localStorage.getItem("token");

//   const allMonths = [
//     "April", "May", "June", "July", "August", "September",
//     "October", "November", "December", "January", "February", "March",
//   ];

//   // Fetch initial data for students
//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//       } else {
//         setAllStudent([]);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   // Fetch Late Fine Rules (if needed, otherwise can be removed)
//   // const getLateFinesData = async () => { ... };

//   useEffect(() => {
//     getAllStudent();
//     // getLateFinesData(); // Call if needed
//   }, [reLoad]); // Add reLoad dependency if needed to refresh student list after submit

//   // Search handlers (Unchanged)
//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
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
//           String(student.admissionNumber).toLowerCase().includes(searchValue) // Ensure string comparison
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   // Fetch student fee info using getStudentFeeInfo API (Still needed for regular fees, past dues, etc.)
//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         toast.error(
//           response.data.message || `Failed to fetch fee info for student ID ${studentId}.`
//         );
//         return null;
//       }
//     } catch (error) {
//       console.error("Error fetching student fee info:", error);
//       toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
//       return null;
//     }
//   };

//   // Fetch class-specific additional fee definitions
//   const fetchAdditionalFeeDefinitions = async (className) => {
//     try {
//       const response = await axios.get(
//         "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       const feesData = response?.data?.data
//         ?.filter((feeType) => feeType.className === className)
//         .map((fee) => ({
//           label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`, // Show amount in label
//           value: fee.amount, // The standard amount
//           name: fee.name,
//           type: fee.feeType,
//         })) || [];
//       return feesData;
//     } catch (error) {
//       toast.error(`Failed to fetch additional fee definitions for class ${className}.`);
//       return [];
//     }
//   };


//   // Modal and student selection
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         const initialFormData = [];
//         const classSpecificFees = {}; // Cache for additional fee options per class

//         for (const child of children) {
//           const feeInfo = await fetchStudentFeeInfo(child.studentId);
//           if (!feeInfo) {
//             toast.warn(`Could not fetch fee details for ${child.studentName}. Some calculations might be inaccurate.`);
//             // Continue with default values or skip? Let's continue with defaults.
//           }

//           // Fetch additional fee definitions for the child's class if not already fetched
//           if (!classSpecificFees[child.class]) {
//              classSpecificFees[child.class] = await fetchAdditionalFeeDefinitions(child.class);
//           }

//           const regularFeeAmount = feeInfo?.feeStructure?.regularFees?.[0]?.amount || 0;
//           const monthlyStatus = feeInfo?.monthlyStatus || [];

//           // Prepare regular fees with due amounts (from feeInfo)
//           const regularFees = allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             return {
//               month,
//               paidAmount: "", // Will be calculated in auto mode
//               dueAmount: monthData?.regularFee?.due ?? regularFeeAmount, // Use ?? for nullish coalescing
//               totalAmount: regularFeeAmount,
//               status: monthData?.regularFee?.status || "Unpaid",
//             };
//           });

//           initialFormData.push({
//             admissionNumber: child.admissionNumber,
//             studentId: child.studentId,
//             className: child.class,
//             classFee: regularFeeAmount,
//             totalAmount: "", // User input
//             selectedMonths: [], // For regular fees
//             selectedAdditionalFees: [], // Holds { name, type, amount, months: [] }
//             availableAdditionalFees: classSpecificFees[child.class] || [], // Options for Select
//             paymentMode: "Cash",
//             transactionId: "",
//             chequeBookNo: "",
//             // These come from feeInfo and are fixed for the calculation base
//             lateFine: feeInfo?.feeStatus?.totalLateFines || 0,
//             pastDues: feeInfo?.feeStatus?.pastDues || 0,
//             totalDues: feeInfo?.feeStatus?.dues || 0, // Overall current due from API
//             concession: "", // User input
//             remarks: "",
//             regularFees, // Store regular fee details (with dues)
//             // No longer storing detailed additional fee status from feeInfo here
//           });
//         }

//         setFormData(initialFormData);
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false)); // Initially hide forms
//         setModalOpen(true);
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       console.error("Error in handleStudentClick:", error);
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm("");
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]);
//     }
//   };

//  // Child selection within modal
//   const handleChildSelection = (child, index) => {
//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm]; // Not strictly needed if we show all selected forms

//     if (isCurrentlySelected) {
//       const toBeRemovedIndex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(toBeRemovedIndex, 1);
//       // updatedShowForm[index] = false; // Keep track if needed

//       // Optionally clear data when unchecking (depends on desired UX)
//       // const updatedFormData = [...formData];
//       // updatedFormData[index] = { ...updatedFormData[index], selectedMonths: [], selectedAdditionalFees: [], totalAmount: "", concession: "", remarks: "" };
//       // setFormData(updatedFormData);

//     } else {
//       updatedSelectedChildren.push(index);
//        // Ensure form data is ready (already done in handleStudentClick)
//       // updatedShowForm[index] = true; // Keep track if needed
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     // setShowForm(updatedShowForm); // Update if using showForm state
//   };


//   // Form input handlers
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) { // Check if index exists
//         updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//         setFormData(updatedFormData);
//     } else {
//         console.error(`Attempted to update non-existent formData index: ${index}`);
//     }
//   };

//   const handleMonthSelection = (index, selectedOptions) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//      if (updatedFormData[index]) {
//         updatedFormData[index].selectedMonths = selectedMonths;
//         setFormData(updatedFormData);
//      }
//   };

//   // Handles selecting/deselecting the *types* of additional fees
//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedFees = selectedOptions
//       ? selectedOptions.map((opt) => ({
//           name: opt.name,
//           amount: opt.value, // The standard amount from the option
//           type: opt.type,
//           // Preserve existing month selections for this fee if it was already selected
//           months: formData[index]?.selectedAdditionalFees.find(f => f.name === opt.name)?.months || [],
//         }))
//       : [];
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) {
//         updatedFormData[index].selectedAdditionalFees = selectedFees;
//         setFormData(updatedFormData);
//     }
//   };

//   // Handles selecting/deselecting *months* for a *specific* selected additional fee
//   const handleAdditionalFeeMonthSelection = (index, feeName, selectedMonthOptions) => {
//     const selectedMonths = selectedMonthOptions ? selectedMonthOptions.map(opt => opt.value) : [];
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) {
//         const feeIndexToUpdate = updatedFormData[index].selectedAdditionalFees.findIndex(f => f.name === feeName);
//         if (feeIndexToUpdate !== -1) {
//           updatedFormData[index].selectedAdditionalFees[feeIndexToUpdate].months = selectedMonths;
//           setFormData(updatedFormData);
//         }
//     }
//   };


//   // Calculate Net Payable Amount for Auto Mode
//   // This calculates the maximum amount the user *could* pay based on selections & existing dues
//   const calculateNetPayableAmount = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     let total = 0;
//     total += parseFloat(data.lateFine) || 0;
//     total += parseFloat(data.pastDues) || 0;

//     const regularFeeTotal = data.selectedMonths.reduce((sum, month) => {
//       const fee = data.regularFees.find((f) => f.month === month);
//       return sum + (fee?.dueAmount || 0); // Use due amount here
//     }, 0);
//     total += regularFeeTotal;

//     const additionalFeeTotal = data.selectedAdditionalFees.reduce((sum, fee) => {
//         const feeTotalForMonths = (parseFloat(fee.amount) || 0) * fee.months.length;
//         return sum + feeTotalForMonths; // Use standard amount * number of months
//       }, 0);
//     total += additionalFeeTotal;

//     return total;
//   };

//   // Auto mode payment distribution logic
//   const calculateAutoDistribution = (index) => {
//     const data = formData[index];
//     const totalAmountToPay = parseFloat(data.totalAmount) || 0;
//     const totalConcession = parseFloat(data.concession) || 0;

//     const distributionResult = {
//       lateFinesPaid: 0,
//       pastDuesPaid: 0,
//       additionalFeesPaid: [], // [{ name, month, amount }]
//       regularFeesPaid: [], // [{ month, amount }]
//       remainingAfterDistribution: 0, // Amount left over from totalAmountToPay after applying to selections
//       totalApplied: 0, // Total amount successfully applied to dues/fees
//       remainingDuesAfterPayment: 0, // Estimated dues remaining after this payment + concession
//     };

//     if (!data) return distributionResult; // Return default if no data

//     // Amount available to apply towards dues/fees = Amount Paid - Concession
//     // But distribution happens first on Amount Paid, then concession is subtracted from remaining due.
//     let remainingToApply = totalAmountToPay +totalConcession;
//     // let remainingToApply = totalAmountToPay;

//     const lateFinesDue = parseFloat(data.lateFine) || 0;
//     const pastDuesDue = parseFloat(data.pastDues) || 0;

//     // --- Distribution Order ---
//     // 1. Pay Late Fines
//     // if (remainingToApply > 0 && lateFinesDue > 0) {
//     //   const payment = Math.min(remainingToApply, lateFinesDue);
//     //   distributionResult.lateFinesPaid = payment;
//     //   remainingToApply -= payment;
//     //   distributionResult.totalApplied += payment;
//     // }
//     // // 2. Pay Past Dues
//     // if (remainingToApply > 0 && pastDuesDue > 0) {
//     //   const payment = Math.min(remainingToApply, pastDuesDue);
//     //   distributionResult.pastDuesPaid = payment;
//     //   remainingToApply -= payment;
//     //   distributionResult.totalApplied += payment;
//     // }
//     // 3. Pay Regular Fees (Selected Months, based on their *due* amounts, sorted by month order)
//      const sortedSelectedMonths = [...data.selectedMonths].sort((a, b) => allMonths.indexOf(a) - allMonths.indexOf(b));
    
//      for (const fee of data.selectedAdditionalFees) {
//       const standardAmount = parseFloat(fee.amount) || 0;
//       if (standardAmount <= 0) continue;
//       const sortedFeeMonths = [...fee.months].sort((a, b) => allMonths.indexOf(a) - allMonths.indexOf(b));
//       for (const month of sortedFeeMonths) {
//           if (remainingToApply <= 0) break;
//           // Pay up to the standard amount for this month instance
//           const payment = Math.min(remainingToApply, standardAmount);
//           distributionResult.additionalFeesPaid.push({ name: fee.name, month, amount: payment });
//           remainingToApply -= payment;
//           distributionResult.totalApplied += payment;
//       }
//       if (remainingToApply <= 0) break;
//   }
    
    
//      for (const month of sortedSelectedMonths) {
//          if (remainingToApply <= 0) break;
//          const fee = data.regularFees.find((f) => f.month === month);
//          const dueAmount = fee?.dueAmount || 0;
//          if (dueAmount > 0) {
//              const payment = Math.min(remainingToApply, dueAmount);
//              distributionResult.regularFeesPaid.push({ month, amount: payment });
//              remainingToApply -= payment;
//              distributionResult.totalApplied += payment;
//          }
//      }
//     // 4. Pay Additional Fees (Selected Fees/Months, based on *standard* amount per month, sorted by month)
     

//     distributionResult.remainingAfterDistribution = remainingToApply;

//     // Calculate remaining dues *after* this potential payment and concession
//     const netPayableBefore = calculateNetPayableAmount(index); // Total potential due based on selections + history
//     // Remaining Due = Total Potential Due - Amount Applied - Concession
//     // distributionResult.remainingDuesAfterPayment = Math.max(0, netPayableBefore - distributionResult.totalApplied);
//     distributionResult.remainingDuesAfterPayment = Math.max(0, netPayableBefore - distributionResult.totalApplied - totalConcession);

//     return distributionResult;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (selectedChildren.length === 0) {
//       toast.warn("Please select at least one student and fill their details.");
//       return;
//     }

//     setIsLoader(true);
//     const feePromises = [];

//     for (const childIndex of selectedChildren) {
//       // Find the actual index in parentData/formData corresponding to the selected ID/index
//        const actualIndex = parentData.findIndex((p, idx) => idx === childIndex); // Assuming selectedChildren stores the index directly
//        if (actualIndex === -1 || !formData[actualIndex]) {
//            toast.error(`Internal error: Could not find data for selected child index ${childIndex}.`);
//            continue; // Skip this child
//        }

//       const child = parentData[actualIndex];
//       const childFormData = formData[actualIndex];
//       const totalAmountEntered = parseFloat(childFormData.totalAmount) || 0;
//       const concession = parseFloat(childFormData.concession) || 0;

//       if (totalAmountEntered <= 0 && concession <= 0) {
//           toast.warn(`Amount or concession must be greater than zero for ${child.studentName}.`);
//           if (!(totalAmountEntered >= 0 && (totalAmountEntered > 0 || concession > 0))) {
//              toast.warn(`Please enter a valid amount to pay or concession for ${child.studentName}.`);
//              setIsLoader(false); // Don't proceed if invalid input for any selected child
//              return;
//           }
//       }
//       if (!childFormData.paymentMode) {
//         toast.error(`Payment mode is required for ${child.studentName}`);
//         setIsLoader(false); return;
//       }
//       if (childFormData.paymentMode === "Online" && !childFormData.transactionId) {
//          toast.error(`Transaction ID is required for Online payment for ${child.studentName}`);
//          setIsLoader(false); return;
//        }
//       if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
//          toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}`);
//          setIsLoader(false); return;
//        }

//       // Calculate distribution based on the entered amount
//       const distribution = calculateAutoDistribution(actualIndex); // Use actualIndex

   
//       const additionalFeesPayload = distribution.additionalFeesPaid.map(fee => ({
//         name: fee.name,
//         month: fee.month,
//         // paidAmount: fee.amount,
//       }));
//          // --- Payload Preparation ---
//          const regularFeesPayload = distribution.regularFeesPaid.map(fee => ({
//           month: fee.month,
//           // paidAmount: fee.amount,
//         }));

//       const payload = {
//         studentId: child.studentId,
//         session,
//         // mode: "auto",
//         paymentDetails: {
//           regularFees: regularFeesPayload,
//           additionalFees: additionalFeesPayload,
//           pastDuesPaid: distribution.pastDuesPaid,
//           lateFinesPaid: distribution.lateFinesPaid,
//           concession: concession,
//           totalAmount: totalAmountEntered, // Send the actual amount received
//           paymentMode: childFormData.paymentMode,
//           transactionId: childFormData.paymentMode === "Online" ? childFormData.transactionId : undefined,
//           chequeNumber: childFormData.paymentMode === "Cheque" ? childFormData.chequeBookNo : undefined, // Match backend if needed
//           remark: childFormData.remarks || "",
//         },
//       };

//       // console.log("Submitting Payload for", child.studentName, JSON.stringify(payload, null, 2)); // Debugging

//       feePromises.push(
//         axios.post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus",
//             payload,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then((response) => ({
//             success: true,
//             studentName: child.studentName,
//             message: response.data.message,
//              receiptData: response.data.receiptData // Assuming backend sends this
//           }))
//           .catch((error) => {
//              console.error("Submission Error for", child.studentName, error.response?.data || error.message);
//             return {
//               success: false,
//               studentName: child.studentName,
//               message: error.response?.data?.message || "Server error occurred",
//             };
//           })
//       );
//     } // End loop through selectedChildren

//     if (feePromises.length === 0 && selectedChildren.length > 0) {
//         // This case might happen if validation fails early for all selected children
//         setIsLoader(false);
//         return;
//     }

//     try {
//       const results = await Promise.all(feePromises);
//       let allSuccess = true;

//       results.forEach((result) => {
//         if (result.success) {
//           toast.success(
//             `Fee created for ${result.studentName}. ${result.message || ''}`
//           );
//           // TODO: Handle receipt generation/display if needed using result.receiptData
//           // e.g., openReceiptInNewTab(result.receiptData);
//         } else {
//           toast.error(`Error for ${result.studentName}: ${result.message}`);
//           allSuccess = false;
//         }
//       });

//       if (allSuccess) {
//         setModalOpen(false); // Close modal on full success
//         setReload((prev) => !prev); // Trigger reload or data refresh
//       }
//     } catch (error) {
//        console.error("Error processing submission results:", error);
//       toast.error("An unexpected error occurred during submission processing.");
//     } finally {
//       setIsLoader(false);
//     }
//   };


//   return (
//     <div className="md:min-h-screen py-4 px-2 md:px-4"> {/* Added padding */}
//       {/* Search Inputs */}
//       <div className="flex flex-col sm:flex-row gap-2 mb-3"> {/* Increased bottom margin */}
//         <ReactInput
//           type="text"
//           label="Search by Name"
//           onChange={handleSearch}
//           value={searchTerm}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//         <ReactInput
//           type="text"
//           label="Search by Adm. No"
//           onChange={handleSearchbyAdmissionNo}
//           value={searchTermbyadmissionNo}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//       </div>

//       {/* Search Results Dropdown */}
//       {filteredStudents.length > 0 && (
//         <div className="relative mb-4"> {/* Added bottom margin */}
//           <div className="absolute z-10 w-full md:w-1/3 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
//             {filteredStudents.map((student) => (
//               <div
//                 key={student._id}
//                 className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleStudentClick(student.parentId)}
//               >
//                 <span className="font-semibold">{student.studentName}</span>
//                 <span className="text-sm text-gray-600">
//                   , Class: {student.class}, AdmNo: {student.admissionNumber},
//                   Parent: {student.fatherName}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//        {/* Placeholder or Table can go here */}
//        {/* <Table data={someData} columns={columns} /> */}
//        {!modalOpen && (
//          <div className="text-center text-gray-500 mt-10">
//            Search for a student by name or admission number to create fees.
//          </div>
//        )}
// {
//   modalOpen &&

//   <form onSubmit={handleSubmit}>
//           <div className="flex flex-col "> {/* Increased max height slightly */}

//             {/* Student Selection Area */}
//             <div className="flex flex-wrap gap-3 w-full p-4 border-b "> {/* Added flex-wrap and max-height */}
//                {parentData.length === 0 && <p className="w-full text-center text-gray-500">No students found for the selected parent.</p>}
//               {parentData.map((child, index) => (
//                 <div
//                   key={child._id}
//                   className={`bg-white rounded-lg shadow-md p-1 border ${
//                     selectedChildren.includes(index)
//                       ? "border-blue-500 ring-2 ring-blue-300" // Enhanced highlight
//                       : "border-gray-200 hover:border-gray-400"
//                   } w-full sm:w-auto sm:min-w-[220px] cursor-pointer flex-shrink-0`} // Responsive width
//                    onClick={() => handleChildSelection(child, index)} // Select on click
//                 >
//                   <div className="flex items-start">
//                     <input
//                       type="checkbox"
//                       id={`child-checkbox-${index}`}
//                       checked={selectedChildren.includes(index)}
//                       onChange={(e) => {
//                          e.stopPropagation(); // Prevent card click when clicking checkbox
//                          handleChildSelection(child, index);
//                         }}
//                       className="mr-3 h-4 w-4  text-blue-600 border-gray-300 rounded mt-1 focus:ring-blue-500"
//                     />
//                     <label
//                       htmlFor={`child-checkbox-${index}`}
//                       className="flex items-center gap-2 cursor-pointer"
//                        onClick={(e) => e.stopPropagation()} // Prevent card click
//                     >
//                       <span className="text-lg font-semibold text-blue-800 block">
//                         {child.studentName}
//                       </span>
//                       <span className="text-sm text-gray-700 block">
//                         Class: {child.class} / Adm#: {child.admissionNumber}
//                       </span>
//                       <div className="flex justify-between text-sm mt-1">
//                         <span className="text-red-600 font-medium">
//                           Total Dues: ₹{formData[index]?.totalDues?.toFixed(2) || '0.00'}
//                         </span>
//                         {formData[index]?.lateFine > 0 && (
//                           <span className="text-orange-600 font-medium ml-2">
//                             Late Fine: ₹{formData[index]?.lateFine?.toFixed(2)}
//                           </span>
//                         )}
//                       </div>
//                     </label>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Form Area - Scrolls if content overflows */}
//             <div className="flex-grow">
//               {selectedChildren.length === 0 && (
//                   <div className="text-center text-gray-500">
//                       Select one or more students above to enter fee details.
//                   </div>
//               )}

//               {selectedChildren.map((selectedIndex) => {
//                  // Find the correct index in parentData/formData
//                  const index = parentData.findIndex((p, idx) => idx === selectedIndex);
//                  if (index === -1 || !formData[index]) {
//                      console.warn(`Data mismatch for selected index: ${selectedIndex}`);
//                      return null; // Skip rendering if data isn't found
//                  }

//                  const child = parentData[index];
//                  const childFormData = formData[index];
//                  const distribution = calculateAutoDistribution(index); // Calculate for display
//                  const netPayable = calculateNetPayableAmount(index);

//                  return (
//                     <div key={child._id} className="border rounded-lg p-4 shadow bg-white last:mb-0">
                      
//                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                               {/* Regular Fees Selection */}
//                               <div className="border rounded p-3 bg-gray-50">
//                                  <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Select Months for Regular Fees (₹{childFormData.classFee}/month)
//                                   </label>
//                                  <Select
//                                     isMulti
//                                     options={allMonths
//                                         .map((month) => {
//                                         const fee = childFormData.regularFees.find((f) => f.month === month);
//                                         if (!fee || fee.status === "Paid") return null;
//                                         return {
//                                             value: month,
//                                             label: `${month} (Due: ₹${fee.dueAmount?.toFixed(2) || '0.00'})`,
//                                             due: fee.dueAmount || 0,
//                                         };
//                                         })
//                                         .filter(Boolean)}
//                                     value={childFormData.selectedMonths.map((m) => {
//                                         const fee = childFormData.regularFees.find((f) => f.month === m);
//                                         return {
//                                             value: m,
//                                             label: `${m} (Due: ₹${fee?.dueAmount?.toFixed(2) || '0.00'})`,
//                                             due: fee?.dueAmount || 0,
//                                         };
//                                     })}
//                                     onChange={(opts) => handleMonthSelection(index, opts)}
//                                     placeholder="Select unpaid months..."
//                                     styles={customSelectStyles}
//                                     />
//                                 </div>

//                                 <div className="border rounded p-3 bg-gray-50">
//                                    <label className="block text-sm font-medium text-gray-700 mb-1">
//                                       Select Additional Fees
//                                     </label>
//                                    <Select
//                                       isMulti
//                                       options={childFormData.availableAdditionalFees}
//                                       value={childFormData.selectedAdditionalFees.map(f => ({
//                                           label: `${f.name} (${f.type}) - ₹${f.amount}`,
//                                           value: f.amount, name: f.name, type: f.type,
//                                       }))}
//                                       onChange={(opts) => handleAdditionalFeesChange(index, opts)}
//                                       placeholder="Select applicable fees..."
//                                        styles={additionalFeeSelectStyles}
//                                     />
//                                     {childFormData.selectedAdditionalFees.map((fee, feeIndex) => (
//                                         <div key={`${fee.name}-${feeIndex}`} className="mt-3">
//                                           <label className="text-sm text-gray-600 block mb-1">
//                                             Months for {fee.name} (₹{fee.amount}/month)
//                                           </label>
//                                           <Select
//                                             isMulti
//                                             options={allMonths.map(month => ({ value: month, label: month }))}
//                                             value={fee.months.map(m => ({ value: m, label: m }))}
//                                             onChange={(opts) => handleAdditionalFeeMonthSelection(index, fee.name, opts)}
//                                             placeholder={`Select months...`}
//                                              styles={additionalFeeSelectStyles}
//                                           />
//                                         </div>
//                                       ))}
//                                 </div>
//                            </div>
//                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                                 <div className="border rounded p-3 bg-blue-50 space-y-1 text-sm">
//                                    <h3 className="text-md font-semibold text-blue-900 border-b pb-1">
//                                       Selected Fees 
//                                     </h3>
//                                     {childFormData.lateFine > 0 && (
//                                       <div className="flex justify-between"><span>Late Fines:</span><span className="font-medium text-blue-700">₹{childFormData.lateFine.toFixed(2)}</span></div>
//                                     )}
//                                     {childFormData.pastDues > 0 && (
//                                       <div className="flex justify-between"><span>Past Dues:</span><span className="font-medium text-blue-700">₹{childFormData.pastDues.toFixed(2)}</span></div>
//                                     )}
//                                      {childFormData.selectedMonths.length > 0 && (
//                                       <div className="mt-1">
//                                         <span className="font-medium text-gray-700 block whitespace-nowrap">Regular Fees:</span>
//                                         {childFormData.selectedMonths.map((month, i) => {
//                                             const fee = childFormData.regularFees.find(f => f.month === month);
//                                             return <div key={i} className="flex justify-between ml-2"><span>{month}:</span><span className="font-medium text-blue-700">₹{(fee?.dueAmount || 0).toFixed(2)}</span></div>;
//                                         })}
//                                       </div>
//                                     )}
//                                     {childFormData.selectedAdditionalFees.length > 0 && (
//                                       <div className="mt-1">
//                                           <span className="font-medium text-gray-700 block">Additional Fees:</span>
//                                           {childFormData.selectedAdditionalFees.map((fee, i) => (
//                                             fee.months.length > 0 && (
//                                                 <div key={i} className="ml-2">
//                                                     <span className="italic">{fee.name} (₹{fee.amount}/mo):</span>
//                                                     {fee.months.map((month, j) => (
//                                                         <div key={j} className="flex justify-between ml-2"><span>{month}:</span><span className="font-medium text-blue-700">₹{(fee.amount || 0).toFixed(2)}</span></div>
//                                                     ))}
//                                                 </div>
//                                             )
//                                           ))}
//                                       </div>
//                                     )}
//                                     <div className="flex justify-between font-semibold border-t pt-2 mt-2 text-md">
//                                         <span className="text-gray-800">Total Selected Due:</span>
//                                         <span className="text-blue-900">₹{netPayable.toFixed(2)}</span>
//                                     </div>
//                                 </div>
//                                 <div className="border rounded px-3 flex flex-wrap pb-1 bg-green-50 gap-2">
                                 
//                                      <div>
//                                        <label className="block text-sm font-medium text-gray-700 mb-1">
//                                           Concession Amount
//                                         </label>
//                                        <input
//                                           type="number"
//                                           value={childFormData.concession}
//                                           onChange={(e) => handleInputChange(index, "concession", e.target.value)}
//                                           className="w-full border rounded p-2 focus:ring-yellow-500 focus:border-yellow-500"
//                                           placeholder="Enter concession..."
//                                           min="0"
//                                           step="0.01"
//                                         />
//                                     </div>
//                                    <div>
//                                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Total Amount to Pay
//                                       </label>
//                                       <input
//                                         type="number"
//                                         value={childFormData.totalAmount}
//                                         onChange={(e) => handleInputChange(index, "totalAmount", e.target.value)}
//                                         className="w-full border rounded p-2 focus:ring-green-500 focus:border-green-500"
//                                         placeholder="Enter amount..."
//                                         min="0"
//                                         step="0.01"
//                                         required // Make required if payment > 0 or concession = 0
//                                       />
//                                     </div>
//                                     <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
//                                 <select
//                                   value={childFormData.paymentMode}
//                                   onChange={(e) => handleInputChange(index, "paymentMode", e.target.value)}
//                                   className="w-full border rounded p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
//                                   required
//                                 >
//                                   <option value="Cash">Cash</option>
//                                   <option value="Online">Online</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {childFormData.paymentMode === "Online" && (
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
//                                   <input
//                                     type="text"
//                                     value={childFormData.transactionId}
//                                     onChange={(e) => handleInputChange(index, "transactionId", e.target.value)}
//                                     className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="Enter transaction ID"
//                                     required
//                                   />
//                                 </div>
//                               )}
//                               {childFormData.paymentMode === "Cheque" && (
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
//                                   <input
//                                     type="text" // Use text for cheque numbers (can have leading zeros or dashes)
//                                     value={childFormData.chequeBookNo}
//                                     onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)}
//                                     className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="Enter cheque number"
//                                     required
//                                   />
//                                 </div>
//                               )}

//                               <div className="sm:col-span-2">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
//                                 <textarea
//                                   value={childFormData.remarks}
//                                   onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
//                                   className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
//                                   rows="2"
//                                   placeholder="Optional remarks..."
//                                 />
//                               </div>
//                                 </div>
//                            </div>

//                            {/* Auto Mode Payment Distribution Display */}
//                            {(parseFloat(childFormData.totalAmount) > 0 || parseFloat(childFormData.concession) > 0) && ( // Show if amount or concession entered
//                               <div className="border rounded p-3 bg-indigo-50 mb-4 text-sm">
//                                 <h3 className="text-md font-semibold text-indigo-900 mb-2 border-b pb-1">
//                                   Payment Application Breakdown
//                                 </h3>
//                                 <div className="space-y-1">
//                                    {distribution.lateFinesPaid > 0 && (
//                                       <div className="flex justify-between"><span>Late Fines Paid:</span><span className="font-medium text-green-700">₹{distribution.lateFinesPaid.toFixed(2)}</span></div>
//                                     )}
//                                     {distribution.pastDuesPaid > 0 && (
//                                       <div className="flex justify-between"><span>Past Dues Paid:</span><span className="font-medium text-green-700">₹{distribution.pastDuesPaid.toFixed(2)}</span></div>
//                                     )}
//                                     {distribution.regularFeesPaid.length > 0 && (
//                                       <div className="mt-1">
//                                         <span className="font-medium text-gray-700 block">Regular Fees Paid:</span>
//                                         {distribution.regularFeesPaid.map((fee, i) => (
//                                           <div key={i} className="flex justify-between ml-2"><span>{fee.month}:</span><span className="font-medium text-green-700">₹{fee.amount.toFixed(2)}</span></div>
//                                         ))}
//                                       </div>
//                                     )}
//                                     {distribution.additionalFeesPaid.length > 0 && (
//                                       <div className="mt-1">
//                                         <span className="font-medium text-gray-700 block">Additional Fees Paid:</span>
//                                         {distribution.additionalFeesPaid.map((fee, i) => (
//                                           <div key={i} className="flex justify-between ml-2"><span>{fee.name} ({fee.month}):</span><span className="font-medium text-green-700">₹{fee.amount.toFixed(2)}</span></div>
//                                         ))}
//                                       </div>
//                                     )}
//                                      <div className="flex justify-between border-t pt-1 mt-1">
//                                         <span className="font-medium text-gray-700">Total Amount Applied:</span>
//                                         <span className="font-semibold text-indigo-800">₹{distribution.totalApplied.toFixed(2)}</span>
//                                      </div>
//                                       {parseFloat(childFormData.concession) > 0 && (
//                                         <div className="flex justify-between">
//                                             <span className="font-medium text-gray-700">Concession Applied:</span>
//                                             <span className="font-semibold text-yellow-700">₹{(parseFloat(childFormData.concession) || 0).toFixed(2)}</span>
//                                         </div>
//                                       )}
//                                       {distribution.remainingAfterDistribution > 0 && (
//                                         <div className="flex justify-between">
//                                             <span className="font-medium text-gray-700">Amount Left Over (Not Applied):</span>
//                                             <span className="font-semibold text-orange-600">₹{distribution.remainingAfterDistribution.toFixed(2)}</span>
//                                         </div>
//                                       )}
//                                      <div className="flex justify-between font-bold text-md border-t pt-2 mt-2">
//                                          <span className="text-gray-800">Estimated Remaining Dues:</span>
//                                          <span className="text-red-700">₹{distribution.remainingDuesAfterPayment.toFixed(2)}</span>
//                                      </div>
//                                 </div>
//                               </div>
//                             )}


//                       </div> 
//                  );
//                })} 
//             </div> 

//             {/* Modal Footer with Buttons - Sticky */}
//             <div className="flex justify-end gap-3 p-4 border-t bg-gray-100 sticky bottom-0">
//               <button
//                 type="submit" // Changed to submit
//                 // disabled={selectedChildren.length === 0 || setIsLoader} // Disable if no selection or loading
//                 className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//               >
//                 Submit Fees
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setModalOpen(false)}
//                 className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div> 
//         </form> 
// }

//     </div> 
//   );
// };

// export default CreateFees;






// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// // Assuming Table component exists but is not shown/modified here
// // import Table from "./Table";
// import {
//   ActiveStudents,
//   LateFines, // Assuming this fetches overall late fine settings, not student specific
//   parentandchildwithID,
// } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Table from "./Table";

// // Custom styles for react-select
// const customSelectStyles = {
//   option: (provided, state) => ({
//     ...provided,
//     // Keep due styling for regular fees, remove for additional
//     color: state.data.due > 0 ? "red" : "black",
//     fontSize: "14px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };

// // Custom styles for additional fees select (no due coloring needed)
// const additionalFeeSelectStyles = {
//    option: (provided) => ({
//     ...provided,
//     fontSize: "14px",
//   }),
//    multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };


// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false); // Keep reload state
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState(""); // Initialize as empty string
//   // const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]); // Now stored per student in formData
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   // const [allLateFines, setAllLateFines] = useState([]); // Keep if needed for general late fine rules
//   const [formData, setFormData] = useState([]);
//   // const [monthlyDues, setMonthlyDues] = useState({}); // Likely less relevant now for additional fees
//   const mode = "auto"; // Hardcoded to auto as per previous structure
//   const authToken = localStorage.getItem("token");

//   const allMonths = [
//     "April", "May", "June", "July", "August", "September",
//     "October", "November", "December", "January", "February", "March",
//   ];

//   // Fetch initial data for students
//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//       } else {
//         setAllStudent([]);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   // Fetch Late Fine Rules (if needed, otherwise can be removed)
//   // const getLateFinesData = async () => { ... };

//   useEffect(() => {
//     getAllStudent();
//     // getLateFinesData(); // Call if needed
//   }, [reLoad]); // Add reLoad dependency if needed to refresh student list after submit

//   // Search handlers (Unchanged)
//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
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
//           String(student.admissionNumber).toLowerCase().includes(searchValue) // Ensure string comparison
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   // Fetch student fee info using getStudentFeeInfo API (Still needed for regular fees, past dues, etc.)
//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         toast.error(
//           response.data.message || `Failed to fetch fee info for student ID ${studentId}.`
//         );
//         return null;
//       }
//     } catch (error) {
//       console.error("Error fetching student fee info:", error);
//       toast.error(`Error fetching fee info for student ID ${studentId}: ${error.message}`);
//       return null;
//     }
//   };

//   // Fetch class-specific additional fee definitions
//   const fetchAdditionalFeeDefinitions = async (className) => {
//     try {
//       const response = await axios.get(
//         "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       const feesData = response?.data?.data
//         ?.filter((feeType) => feeType.className === className)
//         .map((fee) => ({
//           label: `${fee.name} (${fee.feeType}) - ₹${fee.amount}`, // Show amount in label
//           value: fee.amount, // The standard amount
//           name: fee.name,
//           type: fee.feeType,
//         })) || [];
//       return feesData;
//     } catch (error) {
//       toast.error(`Failed to fetch additional fee definitions for class ${className}.`);
//       return [];
//     }
//   };


//   // Modal and student selection
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         const initialFormData = [];
//         const classSpecificFees = {}; // Cache for additional fee options per class

//         for (const child of children) {
//           const feeInfo = await fetchStudentFeeInfo(child.studentId);
//           if (!feeInfo) {
//             toast.warn(`Could not fetch fee details for ${child.studentName}. Some calculations might be inaccurate.`);
//             // Continue with default values or skip? Let's continue with defaults.
//           }

//           // Fetch additional fee definitions for the child's class if not already fetched
//           if (!classSpecificFees[child.class]) {
//              classSpecificFees[child.class] = await fetchAdditionalFeeDefinitions(child.class);
//           }

//           const regularFeeAmount = feeInfo?.feeStructure?.regularFees?.[0]?.amount || 0;
//           const monthlyStatus = feeInfo?.monthlyStatus || [];

//           // Prepare regular fees with due amounts (from feeInfo)
//           const regularFees = allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             return {
//               month,
//               paidAmount: "", // Will be calculated in auto mode
//               dueAmount: monthData?.regularFee?.due ?? regularFeeAmount, // Use ?? for nullish coalescing
//               totalAmount: regularFeeAmount,
//               status: monthData?.regularFee?.status || "Unpaid",
//             };
//           });

//           initialFormData.push({
//             admissionNumber: child.admissionNumber,
//             studentId: child.studentId,
//             className: child.class,
//             classFee: regularFeeAmount,
//             totalAmount: "", // User input
//             selectedMonths: [], // For regular fees
//             selectedAdditionalFees: [], // Holds { name, type, amount, months: [] }
//             availableAdditionalFees: classSpecificFees[child.class] || [], // Options for Select
//             paymentMode: "Cash",
//             transactionId: "",
//             chequeBookNo: "",
//             // These come from feeInfo and are fixed for the calculation base
//             lateFine: feeInfo?.feeStatus?.totalLateFines || 0,
//             pastDues: feeInfo?.feeStatus?.pastDues || 0,
//             totalDues: feeInfo?.feeStatus?.dues || 0, // Overall current due from API
//             concession: "", // User input
//             remarks: "",
//             regularFees, // Store regular fee details (with dues)
//             // No longer storing detailed additional fee status from feeInfo here
//           });
//         }

//         setFormData(initialFormData);
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false)); // Initially hide forms
//         setModalOpen(true);
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       console.error("Error in handleStudentClick:", error);
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm("");
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]);
//     }
//   };

//  // Child selection within modal
//   const handleChildSelection = (child, index) => {
//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm]; // Not strictly needed if we show all selected forms

//     if (isCurrentlySelected) {
//       const toBeRemovedIndex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(toBeRemovedIndex, 1);
//       // updatedShowForm[index] = false; // Keep track if needed

//       // Optionally clear data when unchecking (depends on desired UX)
//       // const updatedFormData = [...formData];
//       // updatedFormData[index] = { ...updatedFormData[index], selectedMonths: [], selectedAdditionalFees: [], totalAmount: "", concession: "", remarks: "" };
//       // setFormData(updatedFormData);

//     } else {
//       updatedSelectedChildren.push(index);
//        // Ensure form data is ready (already done in handleStudentClick)
//       // updatedShowForm[index] = true; // Keep track if needed
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     // setShowForm(updatedShowForm); // Update if using showForm state
//   };


//   // Form input handlers
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) { // Check if index exists
//         updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//         setFormData(updatedFormData);
//     } else {
//         console.error(`Attempted to update non-existent formData index: ${index}`);
//     }
//   };

//   const handleMonthSelection = (index, selectedOptions) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//      if (updatedFormData[index]) {
//         updatedFormData[index].selectedMonths = selectedMonths;
//         setFormData(updatedFormData);
//      }
//   };

//   // Handles selecting/deselecting the *types* of additional fees
//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedFees = selectedOptions
//       ? selectedOptions.map((opt) => ({
//           name: opt.name,
//           amount: opt.value, // The standard amount from the option
//           type: opt.type,
//           // Preserve existing month selections for this fee if it was already selected
//           months: formData[index]?.selectedAdditionalFees.find(f => f.name === opt.name)?.months || [],
//         }))
//       : [];
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) {
//         updatedFormData[index].selectedAdditionalFees = selectedFees;
//         setFormData(updatedFormData);
//     }
//   };

//   // Handles selecting/deselecting *months* for a *specific* selected additional fee
//   const handleAdditionalFeeMonthSelection = (index, feeName, selectedMonthOptions) => {
//     const selectedMonths = selectedMonthOptions ? selectedMonthOptions.map(opt => opt.value) : [];
//     const updatedFormData = [...formData];
//     if (updatedFormData[index]) {
//         const feeIndexToUpdate = updatedFormData[index].selectedAdditionalFees.findIndex(f => f.name === feeName);
//         if (feeIndexToUpdate !== -1) {
//           updatedFormData[index].selectedAdditionalFees[feeIndexToUpdate].months = selectedMonths;
//           setFormData(updatedFormData);
//         }
//     }
//   };


//   // Calculate Net Payable Amount for Auto Mode
//   // This calculates the maximum amount the user *could* pay based on selections & existing dues
//   const calculateNetPayableAmount = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     let total = 0;
//     total += parseFloat(data.lateFine) || 0;
//     total += parseFloat(data.pastDues) || 0;

//     const regularFeeTotal = data.selectedMonths.reduce((sum, month) => {
//       const fee = data.regularFees.find((f) => f.month === month);
//       return sum + (fee?.dueAmount || 0); // Use due amount here
//     }, 0);
//     total += regularFeeTotal;

//     const additionalFeeTotal = data.selectedAdditionalFees.reduce((sum, fee) => {
//         const feeTotalForMonths = (parseFloat(fee.amount) || 0) * fee.months.length;
//         return sum + feeTotalForMonths; // Use standard amount * number of months
//       }, 0);
//     total += additionalFeeTotal;

//     return total;
//   };

//   // Auto mode payment distribution logic
//   const calculateAutoDistribution = (index) => {
//     const data = formData[index];
//     const totalAmountToPay = parseFloat(data.totalAmount) || 0;
//     const totalConcession = parseFloat(data.concession) || 0;

//     const distributionResult = {
//       lateFinesPaid: 0,
//       pastDuesPaid: 0,
//       additionalFeesPaid: [], // [{ name, month, amount }]
//       regularFeesPaid: [], // [{ month, amount }]
//       remainingAfterDistribution: 0, // Amount left over from totalAmountToPay after applying to selections
//       totalApplied: 0, // Total amount successfully applied to dues/fees
//       remainingDuesAfterPayment: 0, // Estimated dues remaining after this payment + concession
//     };

//     if (!data) return distributionResult; // Return default if no data

//     // Amount available to apply towards dues/fees = Amount Paid - Concession
//     // But distribution happens first on Amount Paid, then concession is subtracted from remaining due.
//     let remainingToApply = totalAmountToPay +totalConcession;
//     // let remainingToApply = totalAmountToPay;

//     const lateFinesDue = parseFloat(data.lateFine) || 0;
//     const pastDuesDue = parseFloat(data.pastDues) || 0;

//     // --- Distribution Order ---
//     // 1. Pay Late Fines
//     // if (remainingToApply > 0 && lateFinesDue > 0) {
//     //   const payment = Math.min(remainingToApply, lateFinesDue);
//     //   distributionResult.lateFinesPaid = payment;
//     //   remainingToApply -= payment;
//     //   distributionResult.totalApplied += payment;
//     // }
//     // // 2. Pay Past Dues
//     // if (remainingToApply > 0 && pastDuesDue > 0) {
//     //   const payment = Math.min(remainingToApply, pastDuesDue);
//     //   distributionResult.pastDuesPaid = payment;
//     //   remainingToApply -= payment;
//     //   distributionResult.totalApplied += payment;
//     // }
//     // 3. Pay Regular Fees (Selected Months, based on their *due* amounts, sorted by month order)
//      const sortedSelectedMonths = [...data.selectedMonths].sort((a, b) => allMonths.indexOf(a) - allMonths.indexOf(b));
    
//      for (const fee of data.selectedAdditionalFees) {
//       const standardAmount = parseFloat(fee.amount) || 0;
//       if (standardAmount <= 0) continue;
//       const sortedFeeMonths = [...fee.months].sort((a, b) => allMonths.indexOf(a) - allMonths.indexOf(b));
//       for (const month of sortedFeeMonths) {
//           if (remainingToApply <= 0) break;
//           // Pay up to the standard amount for this month instance
//           const payment = Math.min(remainingToApply, standardAmount);
//           distributionResult.additionalFeesPaid.push({ name: fee.name, month, amount: payment });
//           remainingToApply -= payment;
//           distributionResult.totalApplied += payment;
//       }
//       if (remainingToApply <= 0) break;
//   }
    
    
//      for (const month of sortedSelectedMonths) {
//          if (remainingToApply <= 0) break;
//          const fee = data.regularFees.find((f) => f.month === month);
//          const dueAmount = fee?.dueAmount || 0;
//          if (dueAmount > 0) {
//              const payment = Math.min(remainingToApply, dueAmount);
//              distributionResult.regularFeesPaid.push({ month, amount: payment });
//              remainingToApply -= payment;
//              distributionResult.totalApplied += payment;
//          }
//      }
//     // 4. Pay Additional Fees (Selected Fees/Months, based on *standard* amount per month, sorted by month)
     

//     distributionResult.remainingAfterDistribution = remainingToApply;

//     // Calculate remaining dues *after* this potential payment and concession
//     const netPayableBefore = calculateNetPayableAmount(index); // Total potential due based on selections + history
//     // Remaining Due = Total Potential Due - Amount Applied - Concession
//     // distributionResult.remainingDuesAfterPayment = Math.max(0, netPayableBefore - distributionResult.totalApplied);
//     distributionResult.remainingDuesAfterPayment = Math.max(0, netPayableBefore - distributionResult.totalApplied - totalConcession);

//     return distributionResult;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (selectedChildren.length === 0) {
//       toast.warn("Please select at least one student and fill their details.");
//       return;
//     }

//     setIsLoader(true);
//     const feePromises = [];

//     for (const childIndex of selectedChildren) {
//       // Find the actual index in parentData/formData corresponding to the selected ID/index
//        const actualIndex = parentData.findIndex((p, idx) => idx === childIndex); // Assuming selectedChildren stores the index directly
//        if (actualIndex === -1 || !formData[actualIndex]) {
//            toast.error(`Internal error: Could not find data for selected child index ${childIndex}.`);
//            continue; // Skip this child
//        }

//       const child = parentData[actualIndex];
//       const childFormData = formData[actualIndex];
//       const totalAmountEntered = parseFloat(childFormData.totalAmount) || 0;
//       const concession = parseFloat(childFormData.concession) || 0;

//       if (totalAmountEntered <= 0 && concession <= 0) {
//           toast.warn(`Amount or concession must be greater than zero for ${child.studentName}.`);
//           // Allow submission if only concession is entered? Yes.
//           // Let's refine: allow if totalAmount >= 0 and (totalAmount > 0 or concession > 0)
//           if (!(totalAmountEntered >= 0 && (totalAmountEntered > 0 || concession > 0))) {
//              toast.warn(`Please enter a valid amount to pay or concession for ${child.studentName}.`);
//              setIsLoader(false); // Don't proceed if invalid input for any selected child
//              return;
//           }
//       }
//       if (!childFormData.paymentMode) {
//         toast.error(`Payment mode is required for ${child.studentName}`);
//         setIsLoader(false); return;
//       }
//       if (childFormData.paymentMode === "Online" && !childFormData.transactionId) {
//          toast.error(`Transaction ID is required for Online payment for ${child.studentName}`);
//          setIsLoader(false); return;
//        }
//       if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
//          toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}`);
//          setIsLoader(false); return;
//        }

//       // Calculate distribution based on the entered amount
//       const distribution = calculateAutoDistribution(actualIndex); // Use actualIndex

   
//       const additionalFeesPayload = distribution.additionalFeesPaid.map(fee => ({
//         name: fee.name,
//         month: fee.month,
//         paidAmount: fee.amount,
//       }));
//          // --- Payload Preparation ---
//          const regularFeesPayload = distribution.regularFeesPaid.map(fee => ({
//           month: fee.month,
//           paidAmount: fee.amount,
//         }));

//       const payload = {
//         studentId: child.studentId,
//         session,
//         // mode: "auto",
//         paymentDetails: {
//           regularFees: regularFeesPayload,
//           additionalFees: additionalFeesPayload,
//           pastDuesPaid: distribution.pastDuesPaid,
//           lateFinesPaid: distribution.lateFinesPaid,
//           concession: concession,
//           totalAmount: totalAmountEntered, // Send the actual amount received
//           paymentMode: childFormData.paymentMode,
//           transactionId: childFormData.paymentMode === "Online" ? childFormData.transactionId : undefined,
//           chequeNumber: childFormData.paymentMode === "Cheque" ? childFormData.chequeBookNo : undefined, // Match backend if needed
//           remark: childFormData.remarks || "",
//         },
//       };

//       // console.log("Submitting Payload for", child.studentName, JSON.stringify(payload, null, 2)); // Debugging

//       feePromises.push(
//         axios.post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus",
//             payload,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then((response) => ({
//             success: true,
//             studentName: child.studentName,
//             message: response.data.message,
//              receiptData: response.data.receiptData // Assuming backend sends this
//           }))
//           .catch((error) => {
//              console.error("Submission Error for", child.studentName, error.response?.data || error.message);
//             return {
//               success: false,
//               studentName: child.studentName,
//               message: error.response?.data?.message || "Server error occurred",
//             };
//           })
//       );
//     } // End loop through selectedChildren

//     if (feePromises.length === 0 && selectedChildren.length > 0) {
//         // This case might happen if validation fails early for all selected children
//         setIsLoader(false);
//         return;
//     }

//     try {
//       const results = await Promise.all(feePromises);
//       let allSuccess = true;

//       results.forEach((result) => {
//         if (result.success) {
//           toast.success(
//             `Fee created for ${result.studentName}. ${result.message || ''}`
//           );
//           // TODO: Handle receipt generation/display if needed using result.receiptData
//           // e.g., openReceiptInNewTab(result.receiptData);
//         } else {
//           toast.error(`Error for ${result.studentName}: ${result.message}`);
//           allSuccess = false;
//         }
//       });

//       if (allSuccess) {
//         setModalOpen(false); // Close modal on full success
//         setReload((prev) => !prev); // Trigger reload or data refresh
//       }
//     } catch (error) {
//        console.error("Error processing submission results:", error);
//       toast.error("An unexpected error occurred during submission processing.");
//     } finally {
//       setIsLoader(false);
//     }
//   };


//   return (
//     <div className="md:min-h-screen py-4 px-2 md:px-4"> {/* Added padding */}
//       {/* Search Inputs */}
//       <div className="flex flex-col sm:flex-row gap-2 mb-3"> {/* Increased bottom margin */}
//         <ReactInput
//           type="text"
//           label="Search by Name"
//           onChange={handleSearch}
//           value={searchTerm}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//         <ReactInput
//           type="text"
//           label="Search by Adm. No"
//           onChange={handleSearchbyAdmissionNo}
//           value={searchTermbyadmissionNo}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//       </div>

//       {/* Search Results Dropdown */}
//       {filteredStudents.length > 0 && (
//         <div className="relative mb-4"> {/* Added bottom margin */}
//           <div className="absolute z-10 w-full md:w-1/3 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
//             {filteredStudents.map((student) => (
//               <div
//                 key={student._id}
//                 className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleStudentClick(student.parentId)}
//               >
//                 <span className="font-semibold">{student.studentName}</span>
//                 <span className="text-sm text-gray-600">
//                   , Class: {student.class}, AdmNo: {student.admissionNumber},
//                   Parent: {student.fatherName}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//        {/* Placeholder or Table can go here */}
//        {/* <Table data={someData} columns={columns} /> */}
//        {!modalOpen && (
//          <div className="text-center text-gray-500 mt-10">
//            Search for a student by name or admission number to create fees.
//          </div>
//        )}
// {
//   modalOpen &&

//   <form onSubmit={handleSubmit}>
//           <div className="flex flex-col "> {/* Increased max height slightly */}

//             {/* Student Selection Area */}
//             <div className="flex flex-wrap gap-3 w-full p-4 border-b "> {/* Added flex-wrap and max-height */}
//                {parentData.length === 0 && <p className="w-full text-center text-gray-500">No students found for the selected parent.</p>}
//               {parentData.map((child, index) => (
//                 <div
//                   key={child._id}
//                   className={`bg-white rounded-lg shadow-md p-1 border ${
//                     selectedChildren.includes(index)
//                       ? "border-blue-500 ring-2 ring-blue-300" // Enhanced highlight
//                       : "border-gray-200 hover:border-gray-400"
//                   } w-full sm:w-auto sm:min-w-[220px] cursor-pointer flex-shrink-0`} // Responsive width
//                    onClick={() => handleChildSelection(child, index)} // Select on click
//                 >
//                   <div className="flex items-start">
//                     <input
//                       type="checkbox"
//                       id={`child-checkbox-${index}`}
//                       checked={selectedChildren.includes(index)}
//                       onChange={(e) => {
//                          e.stopPropagation(); // Prevent card click when clicking checkbox
//                          handleChildSelection(child, index);
//                         }}
//                       className="mr-3 h-4 w-4  text-blue-600 border-gray-300 rounded mt-1 focus:ring-blue-500"
//                     />
//                     <label
//                       htmlFor={`child-checkbox-${index}`}
//                       className="flex items-center gap-2 cursor-pointer"
//                        onClick={(e) => e.stopPropagation()} // Prevent card click
//                     >
//                       <span className="text-lg font-semibold text-blue-800 block">
//                         {child.studentName}
//                       </span>
//                       <span className="text-sm text-gray-700 block">
//                         Class: {child.class} / Adm#: {child.admissionNumber}
//                       </span>
//                       <div className="flex justify-between text-sm mt-1">
//                         <span className="text-red-600 font-medium">
//                           Total Dues: ₹{formData[index]?.totalDues?.toFixed(2) || '0.00'}
//                         </span>
//                         {formData[index]?.lateFine > 0 && (
//                           <span className="text-orange-600 font-medium ml-2">
//                             Late Fine: ₹{formData[index]?.lateFine?.toFixed(2)}
//                           </span>
//                         )}
//                       </div>
//                     </label>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Form Area - Scrolls if content overflows */}
//             <div className="flex-grow">
//               {selectedChildren.length === 0 && (
//                   <div className="text-center text-gray-500">
//                       Select one or more students above to enter fee details.
//                   </div>
//               )}

//               {selectedChildren.map((selectedIndex) => {
//                  // Find the correct index in parentData/formData
//                  const index = parentData.findIndex((p, idx) => idx === selectedIndex);
//                  if (index === -1 || !formData[index]) {
//                      console.warn(`Data mismatch for selected index: ${selectedIndex}`);
//                      return null; // Skip rendering if data isn't found
//                  }

//                  const child = parentData[index];
//                  const childFormData = formData[index];
//                  const distribution = calculateAutoDistribution(index); // Calculate for display
//                  const netPayable = calculateNetPayableAmount(index);

//                  return (
//                     <div key={child._id} className="border rounded-lg p-4 shadow bg-white last:mb-0">
//                          {/* <h2 className="text-xl font-bold text-center text-gray-800  border-b">
//                            Fee Details for {child.studentName} (Class: {child.class})
//                          </h2> */}

//                          {/* Fee Selection Section */}
//                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                               {/* Regular Fees Selection */}
//                               <div className="border rounded p-3 bg-gray-50">
//                                  <label className="block text-sm font-medium text-gray-700 mb-1">
//                                     Select Months for Regular Fees (₹{childFormData.classFee}/month)
//                                   </label>
//                                  <Select
//                                     isMulti
//                                     options={allMonths
//                                         .map((month) => {
//                                         const fee = childFormData.regularFees.find((f) => f.month === month);
//                                         if (!fee || fee.status === "Paid") return null;
//                                         return {
//                                             value: month,
//                                             label: `${month} (Due: ₹${fee.dueAmount?.toFixed(2) || '0.00'})`,
//                                             due: fee.dueAmount || 0,
//                                         };
//                                         })
//                                         .filter(Boolean)}
//                                     value={childFormData.selectedMonths.map((m) => {
//                                         const fee = childFormData.regularFees.find((f) => f.month === m);
//                                         return {
//                                             value: m,
//                                             label: `${m} (Due: ₹${fee?.dueAmount?.toFixed(2) || '0.00'})`,
//                                             due: fee?.dueAmount || 0,
//                                         };
//                                     })}
//                                     onChange={(opts) => handleMonthSelection(index, opts)}
//                                     placeholder="Select unpaid months..."
//                                     styles={customSelectStyles}
//                                     />
//                                 </div>

//                                 {/* Additional Fees Selection */}
//                                 <div className="border rounded p-3 bg-gray-50">
//                                    <label className="block text-sm font-medium text-gray-700 mb-1">
//                                       Select Additional Fees
//                                     </label>
//                                    <Select
//                                       isMulti
//                                       options={childFormData.availableAdditionalFees}
//                                       value={childFormData.selectedAdditionalFees.map(f => ({
//                                           label: `${f.name} (${f.type}) - ₹${f.amount}`,
//                                           value: f.amount, name: f.name, type: f.type,
//                                       }))}
//                                       onChange={(opts) => handleAdditionalFeesChange(index, opts)}
//                                       placeholder="Select applicable fees..."
//                                        styles={additionalFeeSelectStyles}
//                                     />
//                                     {childFormData.selectedAdditionalFees.map((fee, feeIndex) => (
//                                         <div key={`${fee.name}-${feeIndex}`} className="mt-3">
//                                           <label className="text-sm text-gray-600 block mb-1">
//                                             Months for {fee.name} (₹{fee.amount}/month)
//                                           </label>
//                                           <Select
//                                             isMulti
//                                             options={allMonths.map(month => ({ value: month, label: month }))}
//                                             value={fee.months.map(m => ({ value: m, label: m }))}
//                                             onChange={(opts) => handleAdditionalFeeMonthSelection(index, fee.name, opts)}
//                                             placeholder={`Select months...`}
//                                              styles={additionalFeeSelectStyles}
//                                           />
//                                         </div>
//                                       ))}
//                                 </div>
//                            </div>

//                            {/* Fee Breakdown & Payment Input Section */}
//                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
//                                 {/* Fee Breakdown Before Payment */}
//                                 <div className="border rounded p-3 bg-blue-50 space-y-1 text-sm">
//                                    <h3 className="text-md font-semibold text-blue-900 border-b pb-1">
//                                       Selected Fees 
//                                     </h3>
//                                     {childFormData.lateFine > 0 && (
//                                       <div className="flex justify-between"><span>Late Fines:</span><span className="font-medium text-blue-700">₹{childFormData.lateFine.toFixed(2)}</span></div>
//                                     )}
//                                     {childFormData.pastDues > 0 && (
//                                       <div className="flex justify-between"><span>Past Dues:</span><span className="font-medium text-blue-700">₹{childFormData.pastDues.toFixed(2)}</span></div>
//                                     )}
//                                      {childFormData.selectedMonths.length > 0 && (
//                                       <div className="mt-1">
//                                         <span className="font-medium text-gray-700 block whitespace-nowrap">Regular Fees:</span>
//                                         {childFormData.selectedMonths.map((month, i) => {
//                                             const fee = childFormData.regularFees.find(f => f.month === month);
//                                             return <div key={i} className="flex justify-between ml-2"><span>{month}:</span><span className="font-medium text-blue-700">₹{(fee?.dueAmount || 0).toFixed(2)}</span></div>;
//                                         })}
//                                       </div>
//                                     )}
//                                     {childFormData.selectedAdditionalFees.length > 0 && (
//                                       <div className="mt-1">
//                                           <span className="font-medium text-gray-700 block">Additional Fees:</span>
//                                           {childFormData.selectedAdditionalFees.map((fee, i) => (
//                                             fee.months.length > 0 && (
//                                                 <div key={i} className="ml-2">
//                                                     <span className="italic">{fee.name} (₹{fee.amount}/mo):</span>
//                                                     {fee.months.map((month, j) => (
//                                                         <div key={j} className="flex justify-between ml-2"><span>{month}:</span><span className="font-medium text-blue-700">₹{(fee.amount || 0).toFixed(2)}</span></div>
//                                                     ))}
//                                                 </div>
//                                             )
//                                           ))}
//                                       </div>
//                                     )}
//                                     <div className="flex justify-between font-semibold border-t pt-2 mt-2 text-md">
//                                         <span className="text-gray-800">Total Selected Due:</span>
//                                         <span className="text-blue-900">₹{netPayable.toFixed(2)}</span>
//                                     </div>
//                                 </div>

//                                 {/* Payment Input Fields */}
//                                 <div className="border rounded px-3 flex flex-wrap pb-1 bg-green-50 gap-2">
//                                    {/* <h3 className="text-md font-semibold text-green-900 border-b pb-1">
//                                       Payment Details
//                                     </h3> */}
//                                      <div>
//                                        <label className="block text-sm font-medium text-gray-700 mb-1">
//                                           Concession Amount
//                                         </label>
//                                        <input
//                                           type="number"
//                                           value={childFormData.concession}
//                                           onChange={(e) => handleInputChange(index, "concession", e.target.value)}
//                                           className="w-full border rounded p-2 focus:ring-yellow-500 focus:border-yellow-500"
//                                           placeholder="Enter concession..."
//                                           min="0"
//                                           step="0.01"
//                                         />
//                                     </div>
//                                    <div>
//                                       <label className="block text-sm font-medium text-gray-700 mb-1">
//                                         Total Amount to Pay
//                                       </label>
//                                       <input
//                                         type="number"
//                                         value={childFormData.totalAmount}
//                                         onChange={(e) => handleInputChange(index, "totalAmount", e.target.value)}
//                                         className="w-full border rounded p-2 focus:ring-green-500 focus:border-green-500"
//                                         placeholder="Enter amount..."
//                                         min="0"
//                                         step="0.01"
//                                         required // Make required if payment > 0 or concession = 0
//                                       />
//                                     </div>
//                                     <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
//                                 <select
//                                   value={childFormData.paymentMode}
//                                   onChange={(e) => handleInputChange(index, "paymentMode", e.target.value)}
//                                   className="w-full border rounded p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
//                                   required
//                                 >
//                                   <option value="Cash">Cash</option>
//                                   <option value="Online">Online</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {childFormData.paymentMode === "Online" && (
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
//                                   <input
//                                     type="text"
//                                     value={childFormData.transactionId}
//                                     onChange={(e) => handleInputChange(index, "transactionId", e.target.value)}
//                                     className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="Enter transaction ID"
//                                     required
//                                   />
//                                 </div>
//                               )}
//                               {childFormData.paymentMode === "Cheque" && (
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
//                                   <input
//                                     type="text" // Use text for cheque numbers (can have leading zeros or dashes)
//                                     value={childFormData.chequeBookNo}
//                                     onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)}
//                                     className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="Enter cheque number"
//                                     required
//                                   />
//                                 </div>
//                               )}

//                               <div className="sm:col-span-2">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
//                                 <textarea
//                                   value={childFormData.remarks}
//                                   onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
//                                   className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
//                                   rows="2"
//                                   placeholder="Optional remarks..."
//                                 />
//                               </div>
//                                 </div>
//                            </div>

//                            {/* Auto Mode Payment Distribution Display */}
//                            {(parseFloat(childFormData.totalAmount) > 0 || parseFloat(childFormData.concession) > 0) && ( // Show if amount or concession entered
//                               <div className="border rounded p-3 bg-indigo-50 mb-4 text-sm">
//                                 <h3 className="text-md font-semibold text-indigo-900 mb-2 border-b pb-1">
//                                   Payment Application Breakdown
//                                 </h3>
//                                 <div className="space-y-1">
//                                    {distribution.lateFinesPaid > 0 && (
//                                       <div className="flex justify-between"><span>Late Fines Paid:</span><span className="font-medium text-green-700">₹{distribution.lateFinesPaid.toFixed(2)}</span></div>
//                                     )}
//                                     {distribution.pastDuesPaid > 0 && (
//                                       <div className="flex justify-between"><span>Past Dues Paid:</span><span className="font-medium text-green-700">₹{distribution.pastDuesPaid.toFixed(2)}</span></div>
//                                     )}
//                                     {distribution.regularFeesPaid.length > 0 && (
//                                       <div className="mt-1">
//                                         <span className="font-medium text-gray-700 block">Regular Fees Paid:</span>
//                                         {distribution.regularFeesPaid.map((fee, i) => (
//                                           <div key={i} className="flex justify-between ml-2"><span>{fee.month}:</span><span className="font-medium text-green-700">₹{fee.amount.toFixed(2)}</span></div>
//                                         ))}
//                                       </div>
//                                     )}
//                                     {distribution.additionalFeesPaid.length > 0 && (
//                                       <div className="mt-1">
//                                         <span className="font-medium text-gray-700 block">Additional Fees Paid:</span>
//                                         {distribution.additionalFeesPaid.map((fee, i) => (
//                                           <div key={i} className="flex justify-between ml-2"><span>{fee.name} ({fee.month}):</span><span className="font-medium text-green-700">₹{fee.amount.toFixed(2)}</span></div>
//                                         ))}
//                                       </div>
//                                     )}
//                                      <div className="flex justify-between border-t pt-1 mt-1">
//                                         <span className="font-medium text-gray-700">Total Amount Applied:</span>
//                                         <span className="font-semibold text-indigo-800">₹{distribution.totalApplied.toFixed(2)}</span>
//                                      </div>
//                                       {parseFloat(childFormData.concession) > 0 && (
//                                         <div className="flex justify-between">
//                                             <span className="font-medium text-gray-700">Concession Applied:</span>
//                                             <span className="font-semibold text-yellow-700">₹{(parseFloat(childFormData.concession) || 0).toFixed(2)}</span>
//                                         </div>
//                                       )}
//                                       {distribution.remainingAfterDistribution > 0 && (
//                                         <div className="flex justify-between">
//                                             <span className="font-medium text-gray-700">Amount Left Over (Not Applied):</span>
//                                             <span className="font-semibold text-orange-600">₹{distribution.remainingAfterDistribution.toFixed(2)}</span>
//                                         </div>
//                                       )}
//                                      <div className="flex justify-between font-bold text-md border-t pt-2 mt-2">
//                                          <span className="text-gray-800">Estimated Remaining Dues:</span>
//                                          <span className="text-red-700">₹{distribution.remainingDuesAfterPayment.toFixed(2)}</span>
//                                      </div>
//                                 </div>
//                               </div>
//                             )}


//                             {/* Common Fields Section */}
//                             {/* <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                               <div>
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode</label>
//                                 <select
//                                   value={childFormData.paymentMode}
//                                   onChange={(e) => handleInputChange(index, "paymentMode", e.target.value)}
//                                   className="w-full border rounded p-2 bg-white focus:ring-blue-500 focus:border-blue-500"
//                                   required
//                                 >
//                                   <option value="Cash">Cash</option>
//                                   <option value="Online">Online</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {childFormData.paymentMode === "Online" && (
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-1">Transaction ID</label>
//                                   <input
//                                     type="text"
//                                     value={childFormData.transactionId}
//                                     onChange={(e) => handleInputChange(index, "transactionId", e.target.value)}
//                                     className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="Enter transaction ID"
//                                     required
//                                   />
//                                 </div>
//                               )}
//                               {childFormData.paymentMode === "Cheque" && (
//                                 <div>
//                                   <label className="block text-sm font-medium text-gray-700 mb-1">Cheque Number</label>
//                                   <input
//                                     type="text" // Use text for cheque numbers (can have leading zeros or dashes)
//                                     value={childFormData.chequeBookNo}
//                                     onChange={(e) => handleInputChange(index, "chequeBookNo", e.target.value)}
//                                     className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
//                                     placeholder="Enter cheque number"
//                                     required
//                                   />
//                                 </div>
//                               )}

//                               <div className="sm:col-span-2">
//                                 <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
//                                 <textarea
//                                   value={childFormData.remarks}
//                                   onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
//                                   className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
//                                   rows="2"
//                                   placeholder="Optional remarks..."
//                                 />
//                               </div>
//                             </div> */}
//                       </div> // End student form container
//                  );
//                })} {/* End map selectedChildren */}
//             </div> {/* End Form Area scrollable div */}

//             {/* Modal Footer with Buttons - Sticky */}
//             <div className="flex justify-end gap-3 p-4 border-t bg-gray-100 sticky bottom-0">
//               <button
//                 type="submit" // Changed to submit
//                 // disabled={selectedChildren.length === 0 || setIsLoader} // Disable if no selection or loading
//                 className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
//               >
//                 Submit Fees
//               </button>
//               <button
//                 type="button"
//                 onClick={() => setModalOpen(false)}
//                 className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div> {/* End flex container */}
//         </form> 
// }

//       {/* Fee Creation Modal */}
//       {/* <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title="Create Fees">
     
//       </Modal> */}
// {/* <Table/> */}
//     </div> // End main container
//   );
// };

// export default CreateFees;




// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import {
//   ActiveStudents,
//   LateFines,
//   parentandchildwithID,
// } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// // Custom styles for react-select to display dues in dropdown options
// const customSelectStyles = {
//   option: (provided, state) => ({
//     ...provided,
//     color: state.data.due > 0 ? "red" : "black",
//     fontSize: "14px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState();
//   // const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [allLateFines, setAllLateFines] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const [monthlyDues, setMonthlyDues] = useState({});
//   const [mode, setMode] = useState("auto"); // Toggle between auto and manual, default to auto
//   const authToken = localStorage.getItem("token");

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

//   // Fetch initial data for students and late fines
//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//       } else {
//         setAllStudent([]);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   const getLateFinesData = async () => {
//     try {
//       const response = await LateFines();
//       if (response?.success) {
//         setAllLateFines(response.data || []);
//       } else {
//         toast.error(response?.message || "Failed to get late fine data.");
//         setAllLateFines([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching late fines.");
//       setAllLateFines([]);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//     getLateFinesData();
//   }, []);

//   // Search handlers
//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
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
//   };

//   // Fetch student fee info using getStudentFeeInfo API
//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch student fee info."
//         );
//         return null;
//       }
//     } catch (error) {
//       toast.error("Error fetching student fee info: " + error.message);
//       return null;
//     }
//   };

//   // Modal and student selection
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         // Initialize form data for each child
//         const initialFormData = [];
//         for (const child of children) {
//           const feeInfo = await fetchStudentFeeInfo(child.studentId);
//           console.log("feeInfo",feeInfo)
//           if (!feeInfo) {
//             continue; // Skip if fee info fetch fails
//           }

//           const regularFeeAmount =
//             feeInfo.feeStructure.regularFees[0]?.amount || 0;
//           const additionalFees = feeInfo.feeStructure.additionalFees || [];
//           const monthlyStatus = feeInfo.monthlyStatus || [];

//           // Prepare regular fees with due amounts
//           const regularFees = allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             return {
//               month,
//               paidAmount: "",
//               dueAmount: monthData?.regularFee.due || regularFeeAmount,
//               totalAmount: regularFeeAmount,
//               status: monthData?.regularFee.status || "Unpaid",
//             };
//           });

//           // Prepare additional fees with due amounts
//           const additionalFeesData = additionalFees.map((fee) => ({
//             name: fee.name,
//             type: fee.feeType,
//             amount: fee.amount,
//             months: allMonths.map((month) => {
//               const monthData = monthlyStatus.find((m) => m.month === month);
//               const addFee = monthData?.additionalFees.find(
//                 (af) => af.name === fee.name
//               );
//               return {
//                 month,
//                 paidAmount: "",
//                 dueAmount: addFee?.due || fee.amount,
//                 totalAmount: fee.amount,
//                 status: addFee?.status || "Unpaid",
//               };
//             }),
//           }));

//           initialFormData.push({
//             admissionNumber: child.admissionNumber,
//             studentId: child.studentId,
//             className: child.class,
//             classFee: regularFeeAmount,
//             totalAmount: "",
//             selectedMonths: [],
//             selectedAdditionalFees: [],
//             paymentMode: "Cash",
//             transactionId: "",
//             chequeBookNo: "",
//             lateFine: feeInfo.feeStatus.totalLateFines || 0,
//             concession: "",
//             duesPaid: "",
//             remarks: "",
//             monthlyDues: feeInfo.feeStatus.monthlyDues || {
//               regularDues: [],
//               additionalDues: [],
//             },
//             additionalFeeDetails: additionalFeesData,
//             pastDues: feeInfo.feeStatus.pastDues || 0,
//             totalDues: feeInfo.feeStatus.dues || 0,
//             regularFees,
//             additionalFees: additionalFeesData,
//             feeInfo, // Store the full fee info for reference
//           });
//         }

//         setFormData(initialFormData);
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false));
//         setModalOpen(true);
//         setMonthlyDues({});
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm("");
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]);
//     }
//   };

//   // Child selection within modal
//   const handleChildSelection = async (child, index) => {



//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (isCurrentlySelected) {
//       const toBeRemovedIndex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(toBeRemovedIndex, 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;

//       // Fetch additional fees for the student's class
//       setIsLoader(true);
//       try {
//         const additionalFeesResponse = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         const feesData =
//           additionalFeesResponse?.data?.data
//             ?.filter((feeType) => feeType.className === child.class)
//             .map((fee) => ({
//               label: `${fee.name} (${fee.feeType})`,
//               value: fee.amount,
//               name: fee.name,
//               type: fee.feeType,
//             })) || [];
//         setAdditionalFeesOptions(feesData);
//       } catch (error) {
//         toast.error(
//           `Failed to fetch additional fees for ${child.studentName}.`
//         );
//       } finally {
//         setIsLoader(false);
//       }
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   // Form input handlers
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//     setFormData(updatedFormData);
//   };

//   const handleMonthSelection = (index, selectedOptions) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedMonths = selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedFees = selectedOptions
//       ? selectedOptions.map((opt) => ({
//           name: opt.name,
//           amount: opt.value,
//           type: opt.type,
//           months: [],
//         }))
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedFees;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeMonthSelection = (
//     index,
//     feeIndex,
//     selectedOptions
//   ) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees[feeIndex].months =
//       selectedMonths;
//     setFormData(updatedFormData);
//   };

//   // Manual mode handlers
//   const handleRegularFeeChange = (index, monthIndex, value) => {
//     const updatedFormData = [...formData];
//     const dueAmount = updatedFormData[index].regularFees[monthIndex].dueAmount;
//     const paidAmount = parseFloat(value) || 0;

//     if (paidAmount > dueAmount) {
//       toast.error(
//         `Payment for ${updatedFormData[index].regularFees[monthIndex].month} (₹${paidAmount}) exceeds remaining dues (₹${dueAmount}).`
//       );
//       return;
//     }

//     updatedFormData[index].regularFees[monthIndex].paidAmount = value;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeChange = (index, feeIndex, monthIndex, value) => {
//     const updatedFormData = [...formData];
//     const dueAmount =
//       updatedFormData[index].additionalFees[feeIndex].months[monthIndex]
//         .dueAmount;
//     const paidAmount = parseFloat(value) || 0;

//     if (paidAmount > dueAmount) {
//       toast.error(
//         `Payment for ${updatedFormData[index].additionalFees[feeIndex].name} (${updatedFormData[index].additionalFees[feeIndex].months[monthIndex].month}) (₹${paidAmount}) exceeds remaining dues (₹${dueAmount}).`
//       );
//       return;
//     }

//     updatedFormData[index].additionalFees[feeIndex].months[
//       monthIndex
//     ].paidAmount = value;
//     setFormData(updatedFormData);
//   };

//   // Calculate Net Payable Amount for Auto Mode
//   const calculateNetPayableAmount = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     let total = 0;

//     // Add late fines
//     total += parseFloat(data.lateFine) || 0;

//     // Add past dues
//     total += parseFloat(data.pastDues) || 0;

//     // Add regular fees for selected months (only remaining dues)
//     const regularFeeTotal = data.selectedMonths.reduce((sum, month) => {
//       const fee = data.regularFees.find((f) => f.month === month);
//       return sum + (fee?.dueAmount || 0);
//     }, 0);
//     total += regularFeeTotal;

//     // Add additional fees for selected fees and months (only remaining dues)
//     const additionalFeeTotal = data.selectedAdditionalFees.reduce(
//       (sum, fee) => {
//         const feeData = data.additionalFees.find((f) => f.name === fee.name);
//         const monthsTotal = fee.months.reduce((monthSum, month) => {
//           const monthData = feeData?.months.find((m) => m.month === month);
//           return monthSum + (monthData?.dueAmount || 0);
//         }, 0);
//         return sum + monthsTotal;
//       },
//       0
//     );
//     total += additionalFeeTotal;

//     return total;
//   };

//   // Auto mode payment distribution logic
//   const calculateAutoDistribution = (index) => {
//     const data = formData[index];
//     if (!data.totalAmount || parseFloat(data.totalAmount) <= 0) {
//       return {
//         lateFinesPaid: 0,
//         pastDuesPaid: 0,
//         regularFeesPaid: [],
//         additionalFeesPaid: [],
//         remainingAfterDistribution: 0,
//         remainingDues: calculateNetPayableAmount(index),
//       };
//     }

//     let remaining = parseFloat(data.totalAmount);
//     const lateFines = parseFloat(data.lateFine) || 0;
//     const pastDues = parseFloat(data.pastDues) || 0;

//     // Step 1: Pay late fines
//     const lateFinesPaid = Math.min(remaining, lateFines);
//     remaining -= lateFinesPaid;

//     // Step 2: Pay past dues
//     const pastDuesPaid = Math.min(remaining, pastDues);
//     remaining -= pastDuesPaid;

//     // Step 3: Pay regular fees for selected months
//     const regularFeesPaid = [];
//     data.selectedMonths.forEach((month) => {
//       if (remaining > 0) {
//         const fee = data.regularFees.find((f) => f.month === month);
//         const dueAmount = fee?.dueAmount || 0;
//         const payment = Math.min(remaining, dueAmount);
//         regularFeesPaid.push({ month, amount: payment });
//         remaining -= payment;
//       }
//     });

//     // Step 4: Pay additional fees for selected fees and months
//     const additionalFeesPaid = [];
//     data.selectedAdditionalFees.forEach((fee) => {
//       fee.months.forEach((month) => {
//         if (remaining > 0) {
//           const feeData = data.additionalFees.find((f) => f.name === fee.name);
//           const monthData = feeData?.months.find((m) => m.month === month);
//           const dueAmount = monthData?.dueAmount || 0;
//           const payment = Math.min(remaining, dueAmount);
//           additionalFeesPaid.push({ name: fee.name, month, amount: payment });
//           remaining -= payment;
//         }
//       });
//     });

//     // Calculate remaining dues
//     const netPayable = calculateNetPayableAmount(index);
//     const totalPaid = parseFloat(data.totalAmount);
//     const remainingDues = Math.max(0, netPayable - totalPaid);

//     return {
//       lateFinesPaid,
//       pastDuesPaid,
//       regularFeesPaid,
//       additionalFeesPaid,
//       remainingAfterDistribution: remaining,
//       remainingDues,
//     };
//   };

//   // Calculate total for display
//   const calculateTotalForChild = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     const total =
//      ( parseFloat(data.totalAmount || 0) +
//       parseFloat(data.lateFine || 0) +
//       parseFloat(data.duesPaid || 0))
//       -
//       parseFloat(data.concession || 0) ;
//     return total < 0 ? 0 : total;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true);

//     if (selectedChildren.length === 0) {
//       toast.warn("Please select at least one student.");
//       setIsLoader(false);
//       return;
//     }

//     // Validate total amount against remaining dues
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       const netPayable = calculateNetPayableAmount(childIndex);
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;

//       if (totalAmount > netPayable) {
//         toast.error(
//           `Total amount (₹${totalAmount}) for ${child.studentName} exceeds remaining dues (₹${netPayable}).`
//         );
//         setIsLoader(false);
//         return;
//       }
//     }

//     const feePromises = [];
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];

//       if (!childFormData.paymentMode) {
//         toast.error(`Payment mode is required for ${child.studentName}`);
//         setIsLoader(false);
//         return;
//       }

//       const payload = {
//         studentId: child.studentId,
//         session,
//         mode,
//         paymentDetails: {
//           regularFees:
//             mode === "auto"
//               ? childFormData.selectedMonths.map((month) => ({
//                   month,
//                   paidAmount: 0,
//                 }))
//               : childFormData.regularFees
//                   .filter(
//                     (fee) => fee.paidAmount && parseFloat(fee.paidAmount) > 0
//                   )
//                   .map((fee) => ({
//                     month: fee.month,
//                     paidAmount: parseFloat(fee.paidAmount),
//                   })),
//           additionalFees:
//             mode === "auto"
//               ? childFormData.selectedAdditionalFees.flatMap((fee) =>
//                   fee.months.map((month) => ({
//                     name: fee.name,
//                     month,
//                     paidAmount: 0,
//                   }))
//                 )
//               : childFormData.additionalFees.flatMap((fee) =>
//                   fee.months
//                     .filter((m) => m.paidAmount && parseFloat(m.paidAmount) > 0)
//                     .map((m) => ({
//                       name: fee.name,
//                       month: m.month,
//                       paidAmount: parseFloat(m.paidAmount),
//                     }))
//                 ),
//           pastDuesPaid: parseFloat(childFormData.duesPaid) || 0,
//           lateFinesPaid: parseFloat(childFormData.lateFine) || 0,
//           concession: parseFloat(childFormData.concession) || 0,
//           totalAmount: parseFloat(childFormData.totalAmount) || 0,
//           paymentMode: childFormData.paymentMode,
//           transactionId:
//             childFormData.paymentMode === "Online"
//               ? childFormData.transactionId
//               : "",
//           remark: childFormData.remarks || "",
//         },
//       };

//       feePromises.push(
//         axios
//           .post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus",
//             payload,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then((response) => ({
//             success: true,
//             studentName: child.studentName,
//             message: response.data.message,
//           }))
//           .catch((error) => ({
//             success: false,
//             studentName: child.studentName,
//             message: error.response?.data?.message || "Server error",
//           }))
//       );
//     }

//     try {
//       const results = await Promise.all(feePromises);
//       let allSuccess = true;

//       results.forEach((result) => {
//         if (result.success) {
//           toast.success(
//             `Fee created for ${result.studentName}: ${result.message}`
//           );
//         } else {
//           toast.error(`Error for ${result.studentName}: ${result.message}`);
//           allSuccess = false;
//         }
//       });

//       if (allSuccess) {
//         setModalOpen(false);
//         setReload((prev) => !prev);
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred during submission.");
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   return (
//     <div className="md:min-h-screen py-4">
//       {/* Search Inputs */}
//       <div className="flex flex-col sm:flex-row gap-2 mb-2">
//         <ReactInput
//           type="text"
//           label="Search by Name"
//           onChange={handleSearch}
//           value={searchTerm}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//         <ReactInput
//           type="text"
//           label="Search by Adm. No"
//           onChange={handleSearchbyAdmissionNo}
//           value={searchTermbyadmissionNo}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//       </div>

//       {/* Search Results Dropdown */}
//       {filteredStudents.length > 0 && (
//         <div className="relative">
//           <div className="absolute z-10 w-full md:w-1/2 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
//             {filteredStudents.map((student) => (
//               <div
//                 key={student._id}
//                 className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleStudentClick(student.parentId)}
//               >
//                 <span className="font-semibold">{student.studentName}</span>
//                 <span className="text-sm text-gray-600">
//                   , Class: {student.class}, AdmNo: {student.admissionNumber},
//                   Parent: {student.fatherName}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Fee Creation Modal */}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title="Create Fees">
//         <div className="flex flex-col max-h-[80vh]">
//           <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto">
//             {parentData.map((child, index) => (
//               <div
//                 key={child._id}
//                 className={`bg-white rounded-lg shadow-md p-3 border ${
//                   selectedChildren.includes(index)
//                     ? "border-blue-500"
//                     : "border-gray-200"
//                 } h-full min-w-[300px] mb-3`}
//               >
//                 <div className="flex items-center border-b pb-2 mb-3">
//                   <input
//                     type="checkbox"
//                     id={`child-checkbox-${index}`}
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
//                   />
//                   <label
//                     htmlFor={`child-checkbox-${index}`}
//                     className="flex-grow cursor-pointer"
//                   >
//                     <span className="text-lg font-semibold text-blue-800">
//                       {child.studentName}
//                     </span>
//                     <span className="text-sm text-gray-700">
//                       {" / Class: "} {child.class} {" / Adm#: "}{" "}
//                       {child.admissionNumber}
//                     </span>
//                     <div className="flex justify-between text-sm mt-1">
//                       <span className="text-red-600 font-medium">
//                         Total Dues: ₹{formData[index]?.totalDues || 0}
//                       </span>
//                       {formData[index]?.lateFine > 0 && (
//                         <span className="text-orange-600 font-medium">
//                           Late Fine: ₹{formData[index]?.lateFine}
//                         </span>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {showForm[index] && formData[index] && (
//                   <div className="space-y-4">
                   
//                       <>
//                         {/* Auto Mode UI */}
//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Months for Regular Fees (₹
//                             {formData[index].classFee}/month)
//                           </label>
//                           <Select
//   isMulti
//   options={allMonths
//     .map((month) => {
//       console.log("month month", month);
//       const fee = formData[index].regularFees.find((f) => f.month === month);

//       // Status "Paid" waale months hata rahe hain
//       if (fee?.status === "Paid") return null;

//       return {
//         value: month,
//         label: `${month} (₹${fee?.dueAmount || 0})`,
//         due: fee?.dueAmount || 0,
//       };
//     })
//     .filter(Boolean) // Null values hataane ke liye
//   }
//   value={formData[index].selectedMonths.map((m) => {
//     const fee = formData[index].regularFees.find((f) => f.month === m);
//     return {
//       value: m,
//       label: `${m} (₹${fee?.dueAmount || 0})`,
//       due: fee?.dueAmount || 0,
//     };
//   })}
//                             onChange={(opts) =>
//                               handleMonthSelection(index, opts)
//                             }
//                             placeholder="Select months..."
//                             styles={customSelectStyles}
//                           />
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Additional Fees
//                           </label>
//                           <Select
//                             isMulti
//                             options={additionalFeesOptions}
//                             value={formData[index].selectedAdditionalFees.map(
//                               (f) => ({
//                                 label: `${f.name} (${f.type})`,
//                                 value: f.amount,
//                                 name: f.name,
//                                 type: f.type,
//                               })
//                             )}
//                             onChange={(opts) =>
//                               handleAdditionalFeesChange(index, opts)
//                             }
//                             placeholder="Select additional fees..."
//                           />
//                           {formData[index].selectedAdditionalFees.map(
//                             (fee, feeIndex) => (
//                               <div key={feeIndex} className="mt-2">
//                                 <label className="text-sm text-gray-600">
//                                   {fee.name} (₹{fee.amount}) - Select Months
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allMonths
//                                     .map((month) => {
//                                       const feeData = formData[
//                                         index
//                                       ].additionalFees.find(
//                                         (f) => f.name === fee.name
//                                       );
//                                       const monthData = feeData?.months.find(
//                                         (m) => m.month === month
//                                       );
//                                       return {
//                                         value: month,
//                                         label: `${month} (₹${
//                                           monthData?.dueAmount || 0
//                                         })`,
//                                         due: monthData?.dueAmount || 0,
//                                       };
//                                     })
//                                     .filter((opt) => opt.due > 0)} // Filter out fully paid months
//                                   value={fee.months.map((m) => {
//                                     const feeData = formData[
//                                       index
//                                     ].additionalFees.find(
//                                       (f) => f.name === fee.name
//                                     );
//                                     const monthData = feeData?.months.find(
//                                       (md) => md.month === m
//                                     );
//                                     return {
//                                       value: m,
//                                       label: `${m} (₹${
//                                         monthData?.dueAmount || 0
//                                       })`,
//                                       due: monthData?.dueAmount || 0,
//                                     };
//                                   })}
//                                   onChange={(opts) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       opts
//                                     )
//                                   }
//                                   placeholder={`Months for ${fee.name}...`}
//                                   styles={customSelectStyles}
//                                 />
//                               </div>
//                             )
//                           )}
//                         </div>

//                         {/* Fee Breakdown Before Payment */}
//                         <div className="border rounded p-3 bg-blue-50">
//                           <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                             Fee Breakdown
//                           </h3>
//                           <div className="space-y-2">
//                             {formData[index].lateFine > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Late Fines:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].lateFine.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].pastDues > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Past Dues:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].pastDues.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].selectedMonths.length > 0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Regular Fees:
//                                 </span>
//                                 {formData[index].selectedMonths.map(
//                                   (month, i) => {
//                                     const fee = formData[
//                                       index
//                                     ].regularFees.find(
//                                       (f) => f.month === month
//                                     );
//                                     return (
//                                       <div
//                                         key={i}
//                                         className="flex justify-between text-sm ml-2"
//                                       >
//                                         <span>{month}:</span>
//                                         <span className="font-medium text-blue-600">
//                                           ₹{(fee?.dueAmount || 0).toFixed(2)}
//                                         </span>
//                                       </div>
//                                     );
//                                   }
//                                 )}
//                               </div>
//                             )}
//                             {formData[index].selectedAdditionalFees.length >
//                               0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Additional Fees:
//                                 </span>
//                                 {formData[index].selectedAdditionalFees.map(
//                                   (fee, i) => (
//                                     <div key={i}>
//                                       {fee.months.map((month, j) => {
//                                         const feeData = formData[
//                                           index
//                                         ].additionalFees.find(
//                                           (f) => f.name === fee.name
//                                         );
//                                         const monthData = feeData?.months.find(
//                                           (m) => m.month === month
//                                         );
//                                         return (
//                                           <div
//                                             key={j}
//                                             className="flex justify-between text-sm ml-2"
//                                           >
//                                             <span>
//                                               {fee.name} ({month}):
//                                             </span>
//                                             <span className="font-medium text-blue-600">
//                                               ₹
//                                               {(
//                                                 monthData?.dueAmount || 0
//                                               ).toFixed(2)}
//                                             </span>
//                                           </div>
//                                         );
//                                       })}
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             )}
//                             <div className="flex justify-between text-sm font-semibold border-t pt-2">
//                               <span className="text-gray-700">
//                                 Net Payable Amount:
//                               </span>
//                               <span className="text-blue-900">
//                                 ₹{calculateNetPayableAmount(index).toFixed(2)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Total Amount to Pay
//                           </label>
//                           <input
//                             type="number"
//                             value={formData[index].totalAmount}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "totalAmount",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter amount..."
//                             min="0"
//                           />
//                         </div>

//                         {/* Auto Mode Payment Distribution */}
//                         {formData[index].totalAmount &&
//                           parseFloat(formData[index].totalAmount) > 0 && (
//                             <div className="border rounded p-3 bg-blue-50">
//                               <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                                 Payment Distribution Breakdown
//                               </h3>
//                               <div className="space-y-2">
//                                 {(() => {
//                                   const distribution =
//                                     calculateAutoDistribution(index);
//                                   return (
//                                     <>
//                                       {distribution.lateFinesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Late Fines Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.lateFinesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.pastDuesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Past Dues Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.pastDuesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.regularFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Regular Fees Paid:
//                                           </span>
//                                           {distribution.regularFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>{fee.month}:</span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.additionalFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Additional Fees Paid:
//                                           </span>
//                                           {distribution.additionalFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>
//                                                   {fee.name} ({fee.month}):
//                                                 </span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.remainingAfterDistribution >
//                                         0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Amount (Not Used):
//                                           </span>
//                                           <span className="font-medium text-orange-600">
//                                             ₹
//                                             {distribution.remainingAfterDistribution.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.remainingDues > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Dues (Added to Total
//                                             Dues):
//                                           </span>
//                                           <span className="font-medium text-red-600">
//                                             ₹
//                                             {distribution.remainingDues.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                     </>
//                                   );
//                                 })()}
//                               </div>
//                             </div>
//                           )}
//                       </>
                   

//                     {/* Common Fields */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index].paymentMode}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                         >
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                         </select>
//                       </div>

//                       {formData[index].paymentMode === "Online" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Transaction ID
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].transactionId}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "transactionId",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter transaction ID"
//                           />
//                         </div>
//                       )}

//                       {formData[index].paymentMode === "Cheque" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Cheque Number
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].chequeBookNo}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "chequeBookNo",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter cheque number"
//                           />
//                         </div>
//                       )}

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Late Fine
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].lateFine}
//                           onChange={(e) =>
//                             handleInputChange(index, "lateFine", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Concession
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].concession}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "concession",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Dues Paid
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].duesPaid}
//                           onChange={(e) =>
//                             handleInputChange(index, "duesPaid", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div className="sm:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700">
//                           Remarks
//                         </label>
//                         <textarea
//                           value={formData[index].remarks}
//                           onChange={(e) =>
//                             handleInputChange(index, "remarks", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           rows="2"
//                           placeholder="Optional remarks..."
//                         />
//                       </div>

//                       <div className="sm:col-span-2 p-2 bg-blue-50 rounded border border-blue-200">
//                         <label className="block text-lg font-semibold text-blue-900">
//                           Net Amount Payable: ₹{" "}
//                           {calculateTotalForChild(index).toFixed(2)}
//                         </label>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0">
//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Submit Fees
//             </button>
//             <button
//               type="button"
//               onClick={() => setModalOpen(false)}
//               className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </Modal>

//     </div>
//   );
// };

// export default CreateFees;



// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import {
//   ActiveStudents,
//   LateFines,
//   parentandchildwithID,
// } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// // Custom styles for react-select to display dues in dropdown options
// const customSelectStyles = {
//   option: (provided, state) => ({
//     ...provided,
//     color: state.data.due > 0 ? "red" : "black",
//     fontSize: "14px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState();
//   // const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [allLateFines, setAllLateFines] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const [monthlyDues, setMonthlyDues] = useState({});
//   const [mode, setMode] = useState("auto"); // Toggle between auto and manual, default to auto
//   const authToken = localStorage.getItem("token");

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

//   // Fetch initial data for students and late fines
//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//       } else {
//         setAllStudent([]);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   const getLateFinesData = async () => {
//     try {
//       const response = await LateFines();
//       if (response?.success) {
//         setAllLateFines(response.data || []);
//       } else {
//         toast.error(response?.message || "Failed to get late fine data.");
//         setAllLateFines([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching late fines.");
//       setAllLateFines([]);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//     getLateFinesData();
//   }, []);

//   // Search handlers
//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
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
//   };

//   // Fetch student fee info using getStudentFeeInfo API
//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch student fee info."
//         );
//         return null;
//       }
//     } catch (error) {
//       toast.error("Error fetching student fee info: " + error.message);
//       return null;
//     }
//   };

//   // Modal and student selection
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         // Initialize form data for each child
//         const initialFormData = [];
//         for (const child of children) {
//           const feeInfo = await fetchStudentFeeInfo(child.studentId);
//           console.log("feeInfo",feeInfo)
//           if (!feeInfo) {
//             continue; // Skip if fee info fetch fails
//           }

//           const regularFeeAmount =
//             feeInfo.feeStructure.regularFees[0]?.amount || 0;
//           const additionalFees = feeInfo.feeStructure.additionalFees || [];
//           const monthlyStatus = feeInfo.monthlyStatus || [];

//           // Prepare regular fees with due amounts
//           const regularFees = allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             return {
//               month,
//               paidAmount: "",
//               dueAmount: monthData?.regularFee.due || regularFeeAmount,
//               totalAmount: regularFeeAmount,
//               status: monthData?.regularFee.status || "Unpaid",
//             };
//           });

//           // Prepare additional fees with due amounts
//           const additionalFeesData = additionalFees.map((fee) => ({
//             name: fee.name,
//             type: fee.feeType,
//             amount: fee.amount,
//             months: allMonths.map((month) => {
//               const monthData = monthlyStatus.find((m) => m.month === month);
//               const addFee = monthData?.additionalFees.find(
//                 (af) => af.name === fee.name
//               );
//               return {
//                 month,
//                 paidAmount: "",
//                 dueAmount: addFee?.due || fee.amount,
//                 totalAmount: fee.amount,
//                 status: addFee?.status || "Unpaid",
//               };
//             }),
//           }));

//           initialFormData.push({
//             admissionNumber: child.admissionNumber,
//             studentId: child.studentId,
//             className: child.class,
//             classFee: regularFeeAmount,
//             totalAmount: "",
//             selectedMonths: [],
//             selectedAdditionalFees: [],
//             paymentMode: "Cash",
//             transactionId: "",
//             chequeBookNo: "",
//             lateFine: feeInfo.feeStatus.totalLateFines || 0,
//             concession: "",
//             duesPaid: "",
//             remarks: "",
//             monthlyDues: feeInfo.feeStatus.monthlyDues || {
//               regularDues: [],
//               additionalDues: [],
//             },
//             additionalFeeDetails: additionalFeesData,
//             pastDues: feeInfo.feeStatus.pastDues || 0,
//             totalDues: feeInfo.feeStatus.dues || 0,
//             regularFees,
//             additionalFees: additionalFeesData,
//             feeInfo, // Store the full fee info for reference
//           });
//         }

//         setFormData(initialFormData);
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false));
//         setModalOpen(true);
//         setMonthlyDues({});
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm("");
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]);
//     }
//   };

//   // Child selection within modal
//   const handleChildSelection = async (child, index) => {



//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (isCurrentlySelected) {
//       const toBeRemovedIndex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(toBeRemovedIndex, 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;

//       // Fetch additional fees for the student's class
//       setIsLoader(true);
//       try {
//         const additionalFeesResponse = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         const feesData =
//           additionalFeesResponse?.data?.data
//             ?.filter((feeType) => feeType.className === child.class)
//             .map((fee) => ({
//               label: `${fee.name} (${fee.feeType})`,
//               value: fee.amount,
//               name: fee.name,
//               type: fee.feeType,
//             })) || [];
//         setAdditionalFeesOptions(feesData);
//       } catch (error) {
//         toast.error(
//           `Failed to fetch additional fees for ${child.studentName}.`
//         );
//       } finally {
//         setIsLoader(false);
//       }
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   // Form input handlers
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//     setFormData(updatedFormData);
//   };

//   const handleMonthSelection = (index, selectedOptions) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedMonths = selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedFees = selectedOptions
//       ? selectedOptions.map((opt) => ({
//           name: opt.name,
//           amount: opt.value,
//           type: opt.type,
//           months: [],
//         }))
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedFees;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeMonthSelection = (
//     index,
//     feeIndex,
//     selectedOptions
//   ) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees[feeIndex].months =
//       selectedMonths;
//     setFormData(updatedFormData);
//   };

//   // Manual mode handlers
//   const handleRegularFeeChange = (index, monthIndex, value) => {
//     const updatedFormData = [...formData];
//     const dueAmount = updatedFormData[index].regularFees[monthIndex].dueAmount;
//     const paidAmount = parseFloat(value) || 0;

//     if (paidAmount > dueAmount) {
//       toast.error(
//         `Payment for ${updatedFormData[index].regularFees[monthIndex].month} (₹${paidAmount}) exceeds remaining dues (₹${dueAmount}).`
//       );
//       return;
//     }

//     updatedFormData[index].regularFees[monthIndex].paidAmount = value;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeChange = (index, feeIndex, monthIndex, value) => {
//     const updatedFormData = [...formData];
//     const dueAmount =
//       updatedFormData[index].additionalFees[feeIndex].months[monthIndex]
//         .dueAmount;
//     const paidAmount = parseFloat(value) || 0;

//     if (paidAmount > dueAmount) {
//       toast.error(
//         `Payment for ${updatedFormData[index].additionalFees[feeIndex].name} (${updatedFormData[index].additionalFees[feeIndex].months[monthIndex].month}) (₹${paidAmount}) exceeds remaining dues (₹${dueAmount}).`
//       );
//       return;
//     }

//     updatedFormData[index].additionalFees[feeIndex].months[
//       monthIndex
//     ].paidAmount = value;
//     setFormData(updatedFormData);
//   };

//   // Calculate Net Payable Amount for Auto Mode
//   const calculateNetPayableAmount = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     let total = 0;

//     // Add late fines
//     total += parseFloat(data.lateFine) || 0;

//     // Add past dues
//     total += parseFloat(data.pastDues) || 0;

//     // Add regular fees for selected months (only remaining dues)
//     const regularFeeTotal = data.selectedMonths.reduce((sum, month) => {
//       const fee = data.regularFees.find((f) => f.month === month);
//       return sum + (fee?.dueAmount || 0);
//     }, 0);
//     total += regularFeeTotal;

//     // Add additional fees for selected fees and months (only remaining dues)
//     const additionalFeeTotal = data.selectedAdditionalFees.reduce(
//       (sum, fee) => {
//         const feeData = data.additionalFees.find((f) => f.name === fee.name);
//         const monthsTotal = fee.months.reduce((monthSum, month) => {
//           const monthData = feeData?.months.find((m) => m.month === month);
//           return monthSum + (monthData?.dueAmount || 0);
//         }, 0);
//         return sum + monthsTotal;
//       },
//       0
//     );
//     total += additionalFeeTotal;

//     return total;
//   };

//   // Auto mode payment distribution logic
//   const calculateAutoDistribution = (index) => {
//     const data = formData[index];
//     if (!data.totalAmount || parseFloat(data.totalAmount) <= 0) {
//       return {
//         lateFinesPaid: 0,
//         pastDuesPaid: 0,
//         regularFeesPaid: [],
//         additionalFeesPaid: [],
//         remainingAfterDistribution: 0,
//         remainingDues: calculateNetPayableAmount(index),
//       };
//     }

//     let remaining = parseFloat(data.totalAmount);
//     const lateFines = parseFloat(data.lateFine) || 0;
//     const pastDues = parseFloat(data.pastDues) || 0;

//     // Step 1: Pay late fines
//     const lateFinesPaid = Math.min(remaining, lateFines);
//     remaining -= lateFinesPaid;

//     // Step 2: Pay past dues
//     const pastDuesPaid = Math.min(remaining, pastDues);
//     remaining -= pastDuesPaid;

//     // Step 3: Pay regular fees for selected months
//     const regularFeesPaid = [];
//     data.selectedMonths.forEach((month) => {
//       if (remaining > 0) {
//         const fee = data.regularFees.find((f) => f.month === month);
//         const dueAmount = fee?.dueAmount || 0;
//         const payment = Math.min(remaining, dueAmount);
//         regularFeesPaid.push({ month, amount: payment });
//         remaining -= payment;
//       }
//     });

//     // Step 4: Pay additional fees for selected fees and months
//     const additionalFeesPaid = [];
//     data.selectedAdditionalFees.forEach((fee) => {
//       fee.months.forEach((month) => {
//         if (remaining > 0) {
//           const feeData = data.additionalFees.find((f) => f.name === fee.name);
//           const monthData = feeData?.months.find((m) => m.month === month);
//           const dueAmount = monthData?.dueAmount || 0;
//           const payment = Math.min(remaining, dueAmount);
//           additionalFeesPaid.push({ name: fee.name, month, amount: payment });
//           remaining -= payment;
//         }
//       });
//     });

//     // Calculate remaining dues
//     const netPayable = calculateNetPayableAmount(index);
//     const totalPaid = parseFloat(data.totalAmount);
//     const remainingDues = Math.max(0, netPayable - totalPaid);

//     return {
//       lateFinesPaid,
//       pastDuesPaid,
//       regularFeesPaid,
//       additionalFeesPaid,
//       remainingAfterDistribution: remaining,
//       remainingDues,
//     };
//   };

//   // Calculate total for display
//   const calculateTotalForChild = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     const total =
//       parseFloat(data.totalAmount || 0) -
//       parseFloat(data.concession || 0) +
//       parseFloat(data.lateFine || 0) +
//       parseFloat(data.duesPaid || 0);
//     return total < 0 ? 0 : total;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true);

//     if (selectedChildren.length === 0) {
//       toast.warn("Please select at least one student.");
//       setIsLoader(false);
//       return;
//     }

//     // Validate total amount against remaining dues
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       const netPayable = calculateNetPayableAmount(childIndex);
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;

//       if (totalAmount > netPayable) {
//         toast.error(
//           `Total amount (₹${totalAmount}) for ${child.studentName} exceeds remaining dues (₹${netPayable}).`
//         );
//         setIsLoader(false);
//         return;
//       }
//     }

//     const feePromises = [];
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];

//       if (!childFormData.paymentMode) {
//         toast.error(`Payment mode is required for ${child.studentName}`);
//         setIsLoader(false);
//         return;
//       }

//       const payload = {
//         studentId: child.studentId,
//         session,
//         mode,
//         paymentDetails: {
//           regularFees:
//             mode === "auto"
//               ? childFormData.selectedMonths.map((month) => ({
//                   month,
//                   paidAmount: 0,
//                 }))
//               : childFormData.regularFees
//                   .filter(
//                     (fee) => fee.paidAmount && parseFloat(fee.paidAmount) > 0
//                   )
//                   .map((fee) => ({
//                     month: fee.month,
//                     paidAmount: parseFloat(fee.paidAmount),
//                   })),
//           additionalFees:
//             mode === "auto"
//               ? childFormData.selectedAdditionalFees.flatMap((fee) =>
//                   fee.months.map((month) => ({
//                     name: fee.name,
//                     month,
//                     paidAmount: 0,
//                   }))
//                 )
//               : childFormData.additionalFees.flatMap((fee) =>
//                   fee.months
//                     .filter((m) => m.paidAmount && parseFloat(m.paidAmount) > 0)
//                     .map((m) => ({
//                       name: fee.name,
//                       month: m.month,
//                       paidAmount: parseFloat(m.paidAmount),
//                     }))
//                 ),
//           pastDuesPaid: parseFloat(childFormData.duesPaid) || 0,
//           lateFinesPaid: parseFloat(childFormData.lateFine) || 0,
//           concession: parseFloat(childFormData.concession) || 0,
//           totalAmount: parseFloat(childFormData.totalAmount) || 0,
//           paymentMode: childFormData.paymentMode,
//           transactionId:
//             childFormData.paymentMode === "Online"
//               ? childFormData.transactionId
//               : "",
//           remark: childFormData.remarks || "",
//         },
//       };

//       feePromises.push(
//         axios
//           .post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus",
//             payload,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then((response) => ({
//             success: true,
//             studentName: child.studentName,
//             message: response.data.message,
//           }))
//           .catch((error) => ({
//             success: false,
//             studentName: child.studentName,
//             message: error.response?.data?.message || "Server error",
//           }))
//       );
//     }

//     try {
//       const results = await Promise.all(feePromises);
//       let allSuccess = true;

//       results.forEach((result) => {
//         if (result.success) {
//           toast.success(
//             `Fee created for ${result.studentName}: ${result.message}`
//           );
//         } else {
//           toast.error(`Error for ${result.studentName}: ${result.message}`);
//           allSuccess = false;
//         }
//       });

//       if (allSuccess) {
//         setModalOpen(false);
//         setReload((prev) => !prev);
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred during submission.");
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   return (
//     <div className="md:min-h-screen py-4">
//       {/* Search Inputs */}
//       <div className="flex flex-col sm:flex-row gap-2 mb-2">
//         <ReactInput
//           type="text"
//           label="Search by Name"
//           onChange={handleSearch}
//           value={searchTerm}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//         <ReactInput
//           type="text"
//           label="Search by Adm. No"
//           onChange={handleSearchbyAdmissionNo}
//           value={searchTermbyadmissionNo}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//       </div>

//       {/* Search Results Dropdown */}
//       {filteredStudents.length > 0 && (
//         <div className="relative">
//           <div className="absolute z-10 w-full md:w-1/2 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
//             {filteredStudents.map((student) => (
//               <div
//                 key={student._id}
//                 className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleStudentClick(student.parentId)}
//               >
//                 <span className="font-semibold">{student.studentName}</span>
//                 <span className="text-sm text-gray-600">
//                   , Class: {student.class}, AdmNo: {student.admissionNumber},
//                   Parent: {student.fatherName}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Fee Creation Modal */}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title="Create Fees">
//         <div className="flex flex-col max-h-[80vh]">
//           <div className="flex justify-between p-4 border-b">
//             <h2 className="text-lg font-semibold">Fee Payment</h2>
//             <div>
//               <label className="mr-2">Mode:</label>
//               <select
//                 value={mode}
//                 onChange={(e) => setMode(e.target.value)}
//                 className="border rounded p-1"
//               >
//                 <option value="auto">Auto</option>
//                 <option value="manual">Manual</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto">
//             {parentData.map((child, index) => (
//               <div
//                 key={child._id}
//                 className={`bg-white rounded-lg shadow-md p-3 border ${
//                   selectedChildren.includes(index)
//                     ? "border-blue-500"
//                     : "border-gray-200"
//                 } h-full min-w-[300px] mb-3`}
//               >
//                 <div className="flex items-center border-b pb-2 mb-3">
//                   <input
//                     type="checkbox"
//                     id={`child-checkbox-${index}`}
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
//                   />
//                   <label
//                     htmlFor={`child-checkbox-${index}`}
//                     className="flex-grow cursor-pointer"
//                   >
//                     <span className="text-lg font-semibold text-blue-800">
//                       {child.studentName}
//                     </span>
//                     <span className="text-sm text-gray-700">
//                       {" / Class: "} {child.class} {" / Adm#: "}{" "}
//                       {child.admissionNumber}
//                     </span>
//                     <div className="flex justify-between text-sm mt-1">
//                       <span className="text-red-600 font-medium">
//                         Total Dues: ₹{formData[index]?.totalDues || 0}
//                       </span>
//                       {formData[index]?.lateFine > 0 && (
//                         <span className="text-orange-600 font-medium">
//                           Late Fine: ₹{formData[index]?.lateFine}
//                         </span>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {showForm[index] && formData[index] && (
//                   <div className="space-y-4">
//                     {mode === "auto" ? (
//                       <>
//                         {/* Auto Mode UI */}
//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Months for Regular Fees (₹
//                             {formData[index].classFee}/month)
//                           </label>
//                           <Select
//   isMulti
//   options={allMonths
//     .map((month) => {
//       console.log("month month", month);
//       const fee = formData[index].regularFees.find((f) => f.month === month);

//       // Status "Paid" waale months hata rahe hain
//       if (fee?.status === "Paid") return null;

//       return {
//         value: month,
//         label: `${month} (₹${fee?.dueAmount || 0})`,
//         due: fee?.dueAmount || 0,
//       };
//     })
//     .filter(Boolean) // Null values hataane ke liye
//   }
//   value={formData[index].selectedMonths.map((m) => {
//     const fee = formData[index].regularFees.find((f) => f.month === m);
//     return {
//       value: m,
//       label: `${m} (₹${fee?.dueAmount || 0})`,
//       due: fee?.dueAmount || 0,
//     };
//   })}
//                             onChange={(opts) =>
//                               handleMonthSelection(index, opts)
//                             }
//                             placeholder="Select months..."
//                             styles={customSelectStyles}
//                           />
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Additional Fees
//                           </label>
//                           <Select
//                             isMulti
//                             options={additionalFeesOptions}
//                             value={formData[index].selectedAdditionalFees.map(
//                               (f) => ({
//                                 label: `${f.name} (${f.type})`,
//                                 value: f.amount,
//                                 name: f.name,
//                                 type: f.type,
//                               })
//                             )}
//                             onChange={(opts) =>
//                               handleAdditionalFeesChange(index, opts)
//                             }
//                             placeholder="Select additional fees..."
//                           />
//                           {formData[index].selectedAdditionalFees.map(
//                             (fee, feeIndex) => (
//                               <div key={feeIndex} className="mt-2">
//                                 <label className="text-sm text-gray-600">
//                                   {fee.name} (₹{fee.amount}) - Select Months
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allMonths
//                                     .map((month) => {
//                                       const feeData = formData[
//                                         index
//                                       ].additionalFees.find(
//                                         (f) => f.name === fee.name
//                                       );
//                                       const monthData = feeData?.months.find(
//                                         (m) => m.month === month
//                                       );
//                                       return {
//                                         value: month,
//                                         label: `${month} (₹${
//                                           monthData?.dueAmount || 0
//                                         })`,
//                                         due: monthData?.dueAmount || 0,
//                                       };
//                                     })
//                                     .filter((opt) => opt.due > 0)} // Filter out fully paid months
//                                   value={fee.months.map((m) => {
//                                     const feeData = formData[
//                                       index
//                                     ].additionalFees.find(
//                                       (f) => f.name === fee.name
//                                     );
//                                     const monthData = feeData?.months.find(
//                                       (md) => md.month === m
//                                     );
//                                     return {
//                                       value: m,
//                                       label: `${m} (₹${
//                                         monthData?.dueAmount || 0
//                                       })`,
//                                       due: monthData?.dueAmount || 0,
//                                     };
//                                   })}
//                                   onChange={(opts) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       opts
//                                     )
//                                   }
//                                   placeholder={`Months for ${fee.name}...`}
//                                   styles={customSelectStyles}
//                                 />
//                               </div>
//                             )
//                           )}
//                         </div>

//                         {/* Fee Breakdown Before Payment */}
//                         <div className="border rounded p-3 bg-blue-50">
//                           <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                             Fee Breakdown
//                           </h3>
//                           <div className="space-y-2">
//                             {formData[index].lateFine > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Late Fines:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].lateFine.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].pastDues > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Past Dues:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].pastDues.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].selectedMonths.length > 0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Regular Fees:
//                                 </span>
//                                 {formData[index].selectedMonths.map(
//                                   (month, i) => {
//                                     const fee = formData[
//                                       index
//                                     ].regularFees.find(
//                                       (f) => f.month === month
//                                     );
//                                     return (
//                                       <div
//                                         key={i}
//                                         className="flex justify-between text-sm ml-2"
//                                       >
//                                         <span>{month}:</span>
//                                         <span className="font-medium text-blue-600">
//                                           ₹{(fee?.dueAmount || 0).toFixed(2)}
//                                         </span>
//                                       </div>
//                                     );
//                                   }
//                                 )}
//                               </div>
//                             )}
//                             {formData[index].selectedAdditionalFees.length >
//                               0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Additional Fees:
//                                 </span>
//                                 {formData[index].selectedAdditionalFees.map(
//                                   (fee, i) => (
//                                     <div key={i}>
//                                       {fee.months.map((month, j) => {
//                                         const feeData = formData[
//                                           index
//                                         ].additionalFees.find(
//                                           (f) => f.name === fee.name
//                                         );
//                                         const monthData = feeData?.months.find(
//                                           (m) => m.month === month
//                                         );
//                                         return (
//                                           <div
//                                             key={j}
//                                             className="flex justify-between text-sm ml-2"
//                                           >
//                                             <span>
//                                               {fee.name} ({month}):
//                                             </span>
//                                             <span className="font-medium text-blue-600">
//                                               ₹
//                                               {(
//                                                 monthData?.dueAmount || 0
//                                               ).toFixed(2)}
//                                             </span>
//                                           </div>
//                                         );
//                                       })}
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             )}
//                             <div className="flex justify-between text-sm font-semibold border-t pt-2">
//                               <span className="text-gray-700">
//                                 Net Payable Amount:
//                               </span>
//                               <span className="text-blue-900">
//                                 ₹{calculateNetPayableAmount(index).toFixed(2)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Total Amount to Pay
//                           </label>
//                           <input
//                             type="number"
//                             value={formData[index].totalAmount}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "totalAmount",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter amount..."
//                             min="0"
//                           />
//                         </div>

//                         {/* Auto Mode Payment Distribution */}
//                         {formData[index].totalAmount &&
//                           parseFloat(formData[index].totalAmount) > 0 && (
//                             <div className="border rounded p-3 bg-blue-50">
//                               <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                                 Payment Distribution Breakdown
//                               </h3>
//                               <div className="space-y-2">
//                                 {(() => {
//                                   const distribution =
//                                     calculateAutoDistribution(index);
//                                   return (
//                                     <>
//                                       {distribution.lateFinesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Late Fines Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.lateFinesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.pastDuesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Past Dues Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.pastDuesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.regularFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Regular Fees Paid:
//                                           </span>
//                                           {distribution.regularFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>{fee.month}:</span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.additionalFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Additional Fees Paid:
//                                           </span>
//                                           {distribution.additionalFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>
//                                                   {fee.name} ({fee.month}):
//                                                 </span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.remainingAfterDistribution >
//                                         0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Amount (Not Used):
//                                           </span>
//                                           <span className="font-medium text-orange-600">
//                                             ₹
//                                             {distribution.remainingAfterDistribution.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.remainingDues > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Dues (Added to Total
//                                             Dues):
//                                           </span>
//                                           <span className="font-medium text-red-600">
//                                             ₹
//                                             {distribution.remainingDues.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                     </>
//                                   );
//                                 })()}
//                               </div>
//                             </div>
//                           )}
//                       </>
//                     ) : (
//                       <>
//                         {/* Manual Mode UI with Dropdowns */}
//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Months for Regular Fees (₹
//                             {formData[index].classFee}/month)
//                           </label>
//                           <Select
//                             isMulti
//                             options={allMonths
//                               .map((month) => {
//                                 const fee = formData[index].regularFees.find(
//                                   (f) => f.month === month
//                                 );
//                                 return {
//                                   value: month,
//                                   label: `${month} (₹${fee?.dueAmount || 0})`,
//                                   due: fee?.dueAmount || 0,
//                                 };
//                               })
//                               .filter((opt) => opt.due > 0)} // Filter out fully paid months
//                             value={formData[index].selectedMonths.map((m) => {
//                               const fee = formData[index].regularFees.find(
//                                 (f) => f.month === m
//                               );
//                               return {
//                                 value: m,
//                                 label: `${m} (₹${fee?.dueAmount || 0})`,
//                                 due: fee?.dueAmount || 0,
//                               };
//                             })}
//                             onChange={(opts) =>
//                               handleMonthSelection(index, opts)
//                             }
//                             placeholder="Select months..."
//                             styles={customSelectStyles}
//                           />
//                           {formData[index].selectedMonths.length > 0 && (
//                             <div className="mt-2">
//                               <span className="text-sm font-medium text-gray-700">
//                                 Enter Payment for Selected Months:
//                               </span>
//                               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
//                                 {formData[index].selectedMonths.map(
//                                   (month, monthIndex) => {
//                                     const feeIndex = formData[
//                                       index
//                                     ].regularFees.findIndex(
//                                       (f) => f.month === month
//                                     );
//                                     return (
//                                       <div
//                                         key={monthIndex}
//                                         className="flex items-center gap-2"
//                                       >
//                                         <span className="text-sm">
//                                           {month}:
//                                         </span>
//                                         <input
//                                           type="number"
//                                           value={
//                                             formData[index].regularFees[
//                                               feeIndex
//                                             ].paidAmount
//                                           }
//                                           onChange={(e) =>
//                                             handleRegularFeeChange(
//                                               index,
//                                               feeIndex,
//                                               e.target.value
//                                             )
//                                           }
//                                           className="w-20 border rounded p-1"
//                                           placeholder="0"
//                                           min="0"
//                                         />
//                                       </div>
//                                     );
//                                   }
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Additional Fees
//                           </label>
//                           <Select
//                             isMulti
//                             options={additionalFeesOptions}
//                             value={formData[index].selectedAdditionalFees.map(
//                               (f) => ({
//                                 label: `${f.name} (${f.type})`,
//                                 value: f.amount,
//                                 name: f.name,
//                                 type: f.type,
//                               })
//                             )}
//                             onChange={(opts) =>
//                               handleAdditionalFeesChange(index, opts)
//                             }
//                             placeholder="Select additional fees..."
//                           />
//                           {formData[index].selectedAdditionalFees.map(
//                             (fee, feeIndex) => (
//                               <div key={feeIndex} className="mt-2">
//                                 <label className="text-sm text-gray-600">
//                                   {fee.name} (₹{fee.amount}) - Select Months
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allMonths
//                                     .map((month) => {
//                                       const feeData = formData[
//                                         index
//                                       ].additionalFees.find(
//                                         (f) => f.name === fee.name
//                                       );
//                                       const monthData = feeData?.months.find(
//                                         (m) => m.month === month
//                                       );
//                                       return {
//                                         value: month,
//                                         label: `${month} (₹${
//                                           monthData?.dueAmount || 0
//                                         })`,
//                                         due: monthData?.dueAmount || 0,
//                                       };
//                                     })
//                                     .filter((opt) => opt.due > 0)} // Filter out fully paid months
//                                   value={fee.months.map((m) => {
//                                     const feeData = formData[
//                                       index
//                                     ].additionalFees.find(
//                                       (f) => f.name === fee.name
//                                     );
//                                     const monthData = feeData?.months.find(
//                                       (md) => md.month === m
//                                     );
//                                     return {
//                                       value: m,
//                                       label: `${m} (₹${
//                                         monthData?.dueAmount || 0
//                                       })`,
//                                       due: monthData?.dueAmount || 0,
//                                     };
//                                   })}
//                                   onChange={(opts) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       opts
//                                     )
//                                   }
//                                   placeholder={`Months for ${fee.name}...`}
//                                   styles={customSelectStyles}
//                                 />
//                                 {fee.months.length > 0 && (
//                                   <div className="mt-2">
//                                     <span className="text-sm font-medium text-gray-600">
//                                       Enter Payment for {fee.name}:
//                                     </span>
//                                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
//                                       {fee.months.map((month, monthIndex) => {
//                                         const feeData = formData[
//                                           index
//                                         ].additionalFees.find(
//                                           (f) => f.name === fee.name
//                                         );
//                                         const monthDataIndex =
//                                           feeData?.months.findIndex(
//                                             (m) => m.month === month
//                                           );
//                                         return (
//                                           <div
//                                             key={monthIndex}
//                                             className="flex items-center gap-2"
//                                           >
//                                             <span className="text-sm">
//                                               {month}:
//                                             </span>
//                                             <input
//                                               type="number"
//                                               value={
//                                                 feeData?.months[monthDataIndex]
//                                                   .paidAmount
//                                               }
//                                               onChange={(e) =>
//                                                 handleAdditionalFeeChange(
//                                                   index,
//                                                   feeIndex,
//                                                   monthDataIndex,
//                                                   e.target.value
//                                                 )
//                                               }
//                                               className="w-20 border rounded p-1"
//                                               placeholder="0"
//                                               min="0"
//                                             />
//                                           </div>
//                                         );
//                                       })}
//                                     </div>
//                                   </div>
//                                 )}
//                               </div>
//                             )
//                           )}
//                         </div>

//                         {/* Manual Mode Fee Breakdown */}
//                         <div className="border rounded p-3 bg-blue-50">
//                           <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                             Fee Breakdown (Manual Mode)
//                           </h3>
//                           <div className="space-y-2">
//                             {formData[index].lateFine > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Late Fines:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].lateFine.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].pastDues > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Past Dues:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].pastDues.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].selectedMonths.length > 0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Regular Fees Paid:
//                                 </span>
//                                 {formData[index].selectedMonths.map(
//                                   (month, i) => {
//                                     const fee = formData[
//                                       index
//                                     ].regularFees.find(
//                                       (f) => f.month === month
//                                     );
//                                     return (
//                                       <div
//                                         key={i}
//                                         className="flex justify-between text-sm ml-2"
//                                       >
//                                         <span>{month}:</span>
//                                         <span className="font-medium text-blue-600">
//                                           ₹
//                                           {(
//                                             parseFloat(fee?.paidAmount) || 0
//                                           ).toFixed(2)}
//                                         </span>
//                                       </div>
//                                     );
//                                   }
//                                 )}
//                               </div>
//                             )}
//                             {formData[index].selectedAdditionalFees.length >
//                               0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Additional Fees Paid:
//                                 </span>
//                                 {formData[index].selectedAdditionalFees.map(
//                                   (fee, i) => (
//                                     <div key={i}>
//                                       {fee.months.map((month, j) => {
//                                         const feeData = formData[
//                                           index
//                                         ].additionalFees.find(
//                                           (f) => f.name === fee.name
//                                         );
//                                         const monthData = feeData?.months.find(
//                                           (m) => m.month === month
//                                         );
//                                         return (
//                                           <div
//                                             key={j}
//                                             className="flex justify-between text-sm ml-2"
//                                           >
//                                             <span>
//                                               {fee.name} ({month}):
//                                             </span>
//                                             <span className="font-medium text-blue-600">
//                                               ₹
//                                               {(
//                                                 parseFloat(
//                                                   monthData?.paidAmount
//                                                 ) || 0
//                                               ).toFixed(2)}
//                                             </span>
//                                           </div>
//                                         );
//                                       })}
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Total Amount to Pay
//                           </label>
//                           <input
//                             type="number"
//                             value={formData[index].totalAmount}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "totalAmount",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter amount..."
//                             min="0"
//                           />
//                         </div>
//                       </>
//                     )}

//                     {/* Common Fields */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index].paymentMode}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                         >
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                         </select>
//                       </div>

//                       {formData[index].paymentMode === "Online" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Transaction ID
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].transactionId}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "transactionId",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter transaction ID"
//                           />
//                         </div>
//                       )}

//                       {formData[index].paymentMode === "Cheque" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Cheque Number
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].chequeBookNo}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "chequeBookNo",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter cheque number"
//                           />
//                         </div>
//                       )}

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Late Fine
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].lateFine}
//                           onChange={(e) =>
//                             handleInputChange(index, "lateFine", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Concession
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].concession}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "concession",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Dues Paid
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].duesPaid}
//                           onChange={(e) =>
//                             handleInputChange(index, "duesPaid", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div className="sm:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700">
//                           Remarks
//                         </label>
//                         <textarea
//                           value={formData[index].remarks}
//                           onChange={(e) =>
//                             handleInputChange(index, "remarks", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           rows="2"
//                           placeholder="Optional remarks..."
//                         />
//                       </div>

//                       <div className="sm:col-span-2 p-2 bg-blue-50 rounded border border-blue-200">
//                         <label className="block text-lg font-semibold text-blue-900">
//                           Net Amount Payable: ₹{" "}
//                           {calculateTotalForChild(index).toFixed(2)}
//                         </label>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0">
//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Submit Fees
//             </button>
//             <button
//               type="button"
//               onClick={() => setModalOpen(false)}
//               className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </Modal>

//     </div>
//   );
// };

// export default CreateFees;



// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import {
//   ActiveStudents,
//   LateFines,
//   parentandchildwithID,
// } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// // Custom styles for react-select to display dues in dropdown options
// const customSelectStyles = {
//   option: (provided, state) => ({
//     ...provided,
//     color: state.data.due > 0 ? "red" : "black",
//     fontSize: "14px",
//   }),
//   multiValue: (provided) => ({
//     ...provided,
//     backgroundColor: "#e0f7fa",
//   }),
//   multiValueLabel: (provided) => ({
//     ...provided,
//     color: "#006064",
//   }),
// };

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState();
//   // const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [allLateFines, setAllLateFines] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const [monthlyDues, setMonthlyDues] = useState({});
//   const [mode, setMode] = useState("auto"); // Toggle between auto and manual, default to auto
//   const authToken = localStorage.getItem("token");

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

//   // Fetch initial data for students and late fines
//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//       } else {
//         setAllStudent([]);
//       }
//     } catch (error) {
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   const getLateFinesData = async () => {
//     try {
//       const response = await LateFines();
//       if (response?.success) {
//         setAllLateFines(response.data || []);
//       } else {
//         toast.error(response?.message || "Failed to get late fine data.");
//         setAllLateFines([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching late fines.");
//       setAllLateFines([]);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//     getLateFinesData();
//   }, []);

//   // Search handlers
//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
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
//   };

//   // Fetch student fee info using getStudentFeeInfo API
//   const fetchStudentFeeInfo = async (studentId) => {
//     try {
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/fees/getStudentFeeInfo?studentId=${studentId}&session=${session}`,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${authToken}` },
//         }
//       );
//       if (response.data.success) {
//         return response.data.data;
//       } else {
//         toast.error(
//           response.data.message || "Failed to fetch student fee info."
//         );
//         return null;
//       }
//     } catch (error) {
//       toast.error("Error fetching student fee info: " + error.message);
//       return null;
//     }
//   };

//   // Modal and student selection
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         // Initialize form data for each child
//         const initialFormData = [];
//         for (const child of children) {
//           const feeInfo = await fetchStudentFeeInfo(child.studentId);
//           console.log("feeInfo",feeInfo)
//           if (!feeInfo) {
//             continue; // Skip if fee info fetch fails
//           }

//           const regularFeeAmount =
//             feeInfo.feeStructure.regularFees[0]?.amount || 0;
//           const additionalFees = feeInfo.feeStructure.additionalFees || [];
//           const monthlyStatus = feeInfo.monthlyStatus || [];

//           // Prepare regular fees with due amounts
//           const regularFees = allMonths.map((month) => {
//             const monthData = monthlyStatus.find((m) => m.month === month);
//             return {
//               month,
//               paidAmount: "",
//               dueAmount: monthData?.regularFee.due || regularFeeAmount,
//               totalAmount: regularFeeAmount,
//               status: monthData?.regularFee.status || "Unpaid",
//             };
//           });

//           // Prepare additional fees with due amounts
//           const additionalFeesData = additionalFees.map((fee) => ({
//             name: fee.name,
//             type: fee.feeType,
//             amount: fee.amount,
//             months: allMonths.map((month) => {
//               const monthData = monthlyStatus.find((m) => m.month === month);
//               const addFee = monthData?.additionalFees.find(
//                 (af) => af.name === fee.name
//               );
//               return {
//                 month,
//                 paidAmount: "",
//                 dueAmount: addFee?.due || fee.amount,
//                 totalAmount: fee.amount,
//                 status: addFee?.status || "Unpaid",
//               };
//             }),
//           }));

//           initialFormData.push({
//             admissionNumber: child.admissionNumber,
//             studentId: child.studentId,
//             className: child.class,
//             classFee: regularFeeAmount,
//             totalAmount: "",
//             selectedMonths: [],
//             selectedAdditionalFees: [],
//             paymentMode: "Cash",
//             transactionId: "",
//             chequeBookNo: "",
//             lateFine: feeInfo.feeStatus.totalLateFines || 0,
//             concession: "",
//             duesPaid: "",
//             remarks: "",
//             monthlyDues: feeInfo.feeStatus.monthlyDues || {
//               regularDues: [],
//               additionalDues: [],
//             },
//             additionalFeeDetails: additionalFeesData,
//             pastDues: feeInfo.feeStatus.pastDues || 0,
//             totalDues: feeInfo.feeStatus.dues || 0,
//             regularFees,
//             additionalFees: additionalFeesData,
//             feeInfo, // Store the full fee info for reference
//           });
//         }

//         setFormData(initialFormData);
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false));
//         setModalOpen(true);
//         setMonthlyDues({});
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm("");
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]);
//     }
//   };

//   // Child selection within modal
//   const handleChildSelection = async (child, index) => {



//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (isCurrentlySelected) {
//       const toBeRemovedIndex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(toBeRemovedIndex, 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;

//       // Fetch additional fees for the student's class
//       setIsLoader(true);
//       try {
//         const additionalFeesResponse = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         const feesData =
//           additionalFeesResponse?.data?.data
//             ?.filter((feeType) => feeType.className === child.class)
//             .map((fee) => ({
//               label: `${fee.name} (${fee.feeType})`,
//               value: fee.amount,
//               name: fee.name,
//               type: fee.feeType,
//             })) || [];
//         setAdditionalFeesOptions(feesData);
//       } catch (error) {
//         toast.error(
//           `Failed to fetch additional fees for ${child.studentName}.`
//         );
//       } finally {
//         setIsLoader(false);
//       }
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   // Form input handlers
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = { ...updatedFormData[index], [field]: value };
//     setFormData(updatedFormData);
//   };

//   const handleMonthSelection = (index, selectedOptions) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedMonths = selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedFees = selectedOptions
//       ? selectedOptions.map((opt) => ({
//           name: opt.name,
//           amount: opt.value,
//           type: opt.type,
//           months: [],
//         }))
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedFees;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeMonthSelection = (
//     index,
//     feeIndex,
//     selectedOptions
//   ) => {
//     const selectedMonths = selectedOptions
//       ? selectedOptions.map((opt) => opt.value)
//       : [];
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees[feeIndex].months =
//       selectedMonths;
//     setFormData(updatedFormData);
//   };

//   // Manual mode handlers
//   const handleRegularFeeChange = (index, monthIndex, value) => {
//     const updatedFormData = [...formData];
//     const dueAmount = updatedFormData[index].regularFees[monthIndex].dueAmount;
//     const paidAmount = parseFloat(value) || 0;

//     if (paidAmount > dueAmount) {
//       toast.error(
//         `Payment for ${updatedFormData[index].regularFees[monthIndex].month} (₹${paidAmount}) exceeds remaining dues (₹${dueAmount}).`
//       );
//       return;
//     }

//     updatedFormData[index].regularFees[monthIndex].paidAmount = value;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeChange = (index, feeIndex, monthIndex, value) => {
//     const updatedFormData = [...formData];
//     const dueAmount =
//       updatedFormData[index].additionalFees[feeIndex].months[monthIndex]
//         .dueAmount;
//     const paidAmount = parseFloat(value) || 0;

//     if (paidAmount > dueAmount) {
//       toast.error(
//         `Payment for ${updatedFormData[index].additionalFees[feeIndex].name} (${updatedFormData[index].additionalFees[feeIndex].months[monthIndex].month}) (₹${paidAmount}) exceeds remaining dues (₹${dueAmount}).`
//       );
//       return;
//     }

//     updatedFormData[index].additionalFees[feeIndex].months[
//       monthIndex
//     ].paidAmount = value;
//     setFormData(updatedFormData);
//   };

//   // Calculate Net Payable Amount for Auto Mode
//   const calculateNetPayableAmount = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     let total = 0;

//     // Add late fines
//     total += parseFloat(data.lateFine) || 0;

//     // Add past dues
//     total += parseFloat(data.pastDues) || 0;

//     // Add regular fees for selected months (only remaining dues)
//     const regularFeeTotal = data.selectedMonths.reduce((sum, month) => {
//       const fee = data.regularFees.find((f) => f.month === month);
//       return sum + (fee?.dueAmount || 0);
//     }, 0);
//     total += regularFeeTotal;

//     // Add additional fees for selected fees and months (only remaining dues)
//     const additionalFeeTotal = data.selectedAdditionalFees.reduce(
//       (sum, fee) => {
//         const feeData = data.additionalFees.find((f) => f.name === fee.name);
//         const monthsTotal = fee.months.reduce((monthSum, month) => {
//           const monthData = feeData?.months.find((m) => m.month === month);
//           return monthSum + (monthData?.dueAmount || 0);
//         }, 0);
//         return sum + monthsTotal;
//       },
//       0
//     );
//     total += additionalFeeTotal;

//     return total;
//   };

//   // Auto mode payment distribution logic
//   const calculateAutoDistribution = (index) => {
//     const data = formData[index];
//     if (!data.totalAmount || parseFloat(data.totalAmount) <= 0) {
//       return {
//         lateFinesPaid: 0,
//         pastDuesPaid: 0,
//         regularFeesPaid: [],
//         additionalFeesPaid: [],
//         remainingAfterDistribution: 0,
//         remainingDues: calculateNetPayableAmount(index),
//       };
//     }

//     let remaining = parseFloat(data.totalAmount);
//     const lateFines = parseFloat(data.lateFine) || 0;
//     const pastDues = parseFloat(data.pastDues) || 0;

//     // Step 1: Pay late fines
//     const lateFinesPaid = Math.min(remaining, lateFines);
//     remaining -= lateFinesPaid;

//     // Step 2: Pay past dues
//     const pastDuesPaid = Math.min(remaining, pastDues);
//     remaining -= pastDuesPaid;

//     // Step 3: Pay regular fees for selected months
//     const regularFeesPaid = [];
//     data.selectedMonths.forEach((month) => {
//       if (remaining > 0) {
//         const fee = data.regularFees.find((f) => f.month === month);
//         const dueAmount = fee?.dueAmount || 0;
//         const payment = Math.min(remaining, dueAmount);
//         regularFeesPaid.push({ month, amount: payment });
//         remaining -= payment;
//       }
//     });

//     // Step 4: Pay additional fees for selected fees and months
//     const additionalFeesPaid = [];
//     data.selectedAdditionalFees.forEach((fee) => {
//       fee.months.forEach((month) => {
//         if (remaining > 0) {
//           const feeData = data.additionalFees.find((f) => f.name === fee.name);
//           const monthData = feeData?.months.find((m) => m.month === month);
//           const dueAmount = monthData?.dueAmount || 0;
//           const payment = Math.min(remaining, dueAmount);
//           additionalFeesPaid.push({ name: fee.name, month, amount: payment });
//           remaining -= payment;
//         }
//       });
//     });

//     // Calculate remaining dues
//     const netPayable = calculateNetPayableAmount(index);
//     const totalPaid = parseFloat(data.totalAmount);
//     const remainingDues = Math.max(0, netPayable - totalPaid);

//     return {
//       lateFinesPaid,
//       pastDuesPaid,
//       regularFeesPaid,
//       additionalFeesPaid,
//       remainingAfterDistribution: remaining,
//       remainingDues,
//     };
//   };

//   // Calculate total for display
//   const calculateTotalForChild = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     const total =
//       parseFloat(data.totalAmount || 0) -
//       parseFloat(data.concession || 0) +
//       parseFloat(data.lateFine || 0) +
//       parseFloat(data.duesPaid || 0);
//     return total < 0 ? 0 : total;
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setIsLoader(true);

//     if (selectedChildren.length === 0) {
//       toast.warn("Please select at least one student.");
//       setIsLoader(false);
//       return;
//     }

//     // Validate total amount against remaining dues
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       const netPayable = calculateNetPayableAmount(childIndex);
//       const totalAmount = parseFloat(childFormData.totalAmount) || 0;

//       if (totalAmount > netPayable) {
//         toast.error(
//           `Total amount (₹${totalAmount}) for ${child.studentName} exceeds remaining dues (₹${netPayable}).`
//         );
//         setIsLoader(false);
//         return;
//       }
//     }

//     const feePromises = [];
//     for (const childIndex of selectedChildren) {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];

//       if (!childFormData.paymentMode) {
//         toast.error(`Payment mode is required for ${child.studentName}`);
//         setIsLoader(false);
//         return;
//       }

//       const payload = {
//         studentId: child.studentId,
//         session,
//         mode,
//         paymentDetails: {
//           regularFees:
//             mode === "auto"
//               ? childFormData.selectedMonths.map((month) => ({
//                   month,
//                   paidAmount: 0,
//                 }))
//               : childFormData.regularFees
//                   .filter(
//                     (fee) => fee.paidAmount && parseFloat(fee.paidAmount) > 0
//                   )
//                   .map((fee) => ({
//                     month: fee.month,
//                     paidAmount: parseFloat(fee.paidAmount),
//                   })),
//           additionalFees:
//             mode === "auto"
//               ? childFormData.selectedAdditionalFees.flatMap((fee) =>
//                   fee.months.map((month) => ({
//                     name: fee.name,
//                     month,
//                     paidAmount: 0,
//                   }))
//                 )
//               : childFormData.additionalFees.flatMap((fee) =>
//                   fee.months
//                     .filter((m) => m.paidAmount && parseFloat(m.paidAmount) > 0)
//                     .map((m) => ({
//                       name: fee.name,
//                       month: m.month,
//                       paidAmount: parseFloat(m.paidAmount),
//                     }))
//                 ),
//           pastDuesPaid: parseFloat(childFormData.duesPaid) || 0,
//           lateFinesPaid: parseFloat(childFormData.lateFine) || 0,
//           concession: parseFloat(childFormData.concession) || 0,
//           totalAmount: parseFloat(childFormData.totalAmount) || 0,
//           paymentMode: childFormData.paymentMode,
//           transactionId:
//             childFormData.paymentMode === "Online"
//               ? childFormData.transactionId
//               : "",
//           remark: childFormData.remarks || "",
//         },
//       };

//       feePromises.push(
//         axios
//           .post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus",
//             payload,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then((response) => ({
//             success: true,
//             studentName: child.studentName,
//             message: response.data.message,
//           }))
//           .catch((error) => ({
//             success: false,
//             studentName: child.studentName,
//             message: error.response?.data?.message || "Server error",
//           }))
//       );
//     }

//     try {
//       const results = await Promise.all(feePromises);
//       let allSuccess = true;

//       results.forEach((result) => {
//         if (result.success) {
//           toast.success(
//             `Fee created for ${result.studentName}: ${result.message}`
//           );
//         } else {
//           toast.error(`Error for ${result.studentName}: ${result.message}`);
//           allSuccess = false;
//         }
//       });

//       if (allSuccess) {
//         setModalOpen(false);
//         setReload((prev) => !prev);
//       }
//     } catch (error) {
//       toast.error("An unexpected error occurred during submission.");
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   return (
//     <div className="md:min-h-screen py-4">
//       {/* Search Inputs */}
//       <div className="flex flex-col sm:flex-row gap-2 mb-2">
//         <ReactInput
//           type="text"
//           label="Search by Name"
//           onChange={handleSearch}
//           value={searchTerm}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//         <ReactInput
//           type="text"
//           label="Search by Adm. No"
//           onChange={handleSearchbyAdmissionNo}
//           value={searchTermbyadmissionNo}
//           containerClassName="flex-1 min-w-[200px]"
//         />
//       </div>

//       {/* Search Results Dropdown */}
//       {filteredStudents.length > 0 && (
//         <div className="relative">
//           <div className="absolute z-10 w-full md:w-1/2 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
//             {filteredStudents.map((student) => (
//               <div
//                 key={student._id}
//                 className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                 onClick={() => handleStudentClick(student.parentId)}
//               >
//                 <span className="font-semibold">{student.studentName}</span>
//                 <span className="text-sm text-gray-600">
//                   , Class: {student.class}, AdmNo: {student.admissionNumber},
//                   Parent: {student.fatherName}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}

//       {/* Fee Creation Modal */}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title="Create Fees">
//         <div className="flex flex-col max-h-[80vh]">
//           <div className="flex justify-between p-4 border-b">
//             <h2 className="text-lg font-semibold">Fee Payment</h2>
//             <div>
//               <label className="mr-2">Mode:</label>
//               <select
//                 value={mode}
//                 onChange={(e) => setMode(e.target.value)}
//                 className="border rounded p-1"
//               >
//                 <option value="auto">Auto</option>
//                 <option value="manual">Manual</option>
//               </select>
//             </div>
//           </div>

//           <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto">
//             {parentData.map((child, index) => (
//               <div
//                 key={child._id}
//                 className={`bg-white rounded-lg shadow-md p-3 border ${
//                   selectedChildren.includes(index)
//                     ? "border-blue-500"
//                     : "border-gray-200"
//                 } h-full min-w-[300px] mb-3`}
//               >
//                 <div className="flex items-center border-b pb-2 mb-3">
//                   <input
//                     type="checkbox"
//                     id={`child-checkbox-${index}`}
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
//                   />
//                   <label
//                     htmlFor={`child-checkbox-${index}`}
//                     className="flex-grow cursor-pointer"
//                   >
//                     <span className="text-lg font-semibold text-blue-800">
//                       {child.studentName}
//                     </span>
//                     <span className="text-sm text-gray-700">
//                       {" / Class: "} {child.class} {" / Adm#: "}{" "}
//                       {child.admissionNumber}
//                     </span>
//                     <div className="flex justify-between text-sm mt-1">
//                       <span className="text-red-600 font-medium">
//                         Total Dues: ₹{formData[index]?.totalDues || 0}
//                       </span>
//                       {formData[index]?.lateFine > 0 && (
//                         <span className="text-orange-600 font-medium">
//                           Late Fine: ₹{formData[index]?.lateFine}
//                         </span>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {showForm[index] && formData[index] && (
//                   <div className="space-y-4">
//                     {mode === "auto" ? (
//                       <>
//                         {/* Auto Mode UI */}
//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Months for Regular Fees (₹
//                             {formData[index].classFee}/month)
//                           </label>
//                           <Select
//                             isMulti
//                             options={allMonths
//                               .map((month) => {
//                                 const fee = formData[index].regularFees.find(
//                                   (f) => f.month === month
//                                 );
//                                 return {
//                                   value: month,
//                                   label: `${month} (₹${fee?.dueAmount || 0})`,
//                                   due: fee?.dueAmount || 0,
//                                 };
//                               })
//                               .filter((opt) => opt.due > 0)} // Filter out fully paid months
//                             value={formData[index].selectedMonths.map((m) => {
//                               const fee = formData[index].regularFees.find(
//                                 (f) => f.month === m
//                               );
//                               return {
//                                 value: m,
//                                 label: `${m} (₹${fee?.dueAmount || 0})`,
//                                 due: fee?.dueAmount || 0,
//                               };
//                             })}
//                             onChange={(opts) =>
//                               handleMonthSelection(index, opts)
//                             }
//                             placeholder="Select months..."
//                             styles={customSelectStyles}
//                           />
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Additional Fees
//                           </label>
//                           <Select
//                             isMulti
//                             options={additionalFeesOptions}
//                             value={formData[index].selectedAdditionalFees.map(
//                               (f) => ({
//                                 label: `${f.name} (${f.type})`,
//                                 value: f.amount,
//                                 name: f.name,
//                                 type: f.type,
//                               })
//                             )}
//                             onChange={(opts) =>
//                               handleAdditionalFeesChange(index, opts)
//                             }
//                             placeholder="Select additional fees..."
//                           />
//                           {formData[index].selectedAdditionalFees.map(
//                             (fee, feeIndex) => (
//                               <div key={feeIndex} className="mt-2">
//                                 <label className="text-sm text-gray-600">
//                                   {fee.name} (₹{fee.amount}) - Select Months
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allMonths
//                                     .map((month) => {
//                                       const feeData = formData[
//                                         index
//                                       ].additionalFees.find(
//                                         (f) => f.name === fee.name
//                                       );
//                                       const monthData = feeData?.months.find(
//                                         (m) => m.month === month
//                                       );
//                                       return {
//                                         value: month,
//                                         label: `${month} (₹${
//                                           monthData?.dueAmount || 0
//                                         })`,
//                                         due: monthData?.dueAmount || 0,
//                                       };
//                                     })
//                                     .filter((opt) => opt.due > 0)} // Filter out fully paid months
//                                   value={fee.months.map((m) => {
//                                     const feeData = formData[
//                                       index
//                                     ].additionalFees.find(
//                                       (f) => f.name === fee.name
//                                     );
//                                     const monthData = feeData?.months.find(
//                                       (md) => md.month === m
//                                     );
//                                     return {
//                                       value: m,
//                                       label: `${m} (₹${
//                                         monthData?.dueAmount || 0
//                                       })`,
//                                       due: monthData?.dueAmount || 0,
//                                     };
//                                   })}
//                                   onChange={(opts) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       opts
//                                     )
//                                   }
//                                   placeholder={`Months for ${fee.name}...`}
//                                   styles={customSelectStyles}
//                                 />
//                               </div>
//                             )
//                           )}
//                         </div>

//                         {/* Fee Breakdown Before Payment */}
//                         <div className="border rounded p-3 bg-blue-50">
//                           <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                             Fee Breakdown
//                           </h3>
//                           <div className="space-y-2">
//                             {formData[index].lateFine > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Late Fines:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].lateFine.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].pastDues > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Past Dues:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].pastDues.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].selectedMonths.length > 0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Regular Fees:
//                                 </span>
//                                 {formData[index].selectedMonths.map(
//                                   (month, i) => {
//                                     const fee = formData[
//                                       index
//                                     ].regularFees.find(
//                                       (f) => f.month === month
//                                     );
//                                     return (
//                                       <div
//                                         key={i}
//                                         className="flex justify-between text-sm ml-2"
//                                       >
//                                         <span>{month}:</span>
//                                         <span className="font-medium text-blue-600">
//                                           ₹{(fee?.dueAmount || 0).toFixed(2)}
//                                         </span>
//                                       </div>
//                                     );
//                                   }
//                                 )}
//                               </div>
//                             )}
//                             {formData[index].selectedAdditionalFees.length >
//                               0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Additional Fees:
//                                 </span>
//                                 {formData[index].selectedAdditionalFees.map(
//                                   (fee, i) => (
//                                     <div key={i}>
//                                       {fee.months.map((month, j) => {
//                                         const feeData = formData[
//                                           index
//                                         ].additionalFees.find(
//                                           (f) => f.name === fee.name
//                                         );
//                                         const monthData = feeData?.months.find(
//                                           (m) => m.month === month
//                                         );
//                                         return (
//                                           <div
//                                             key={j}
//                                             className="flex justify-between text-sm ml-2"
//                                           >
//                                             <span>
//                                               {fee.name} ({month}):
//                                             </span>
//                                             <span className="font-medium text-blue-600">
//                                               ₹
//                                               {(
//                                                 monthData?.dueAmount || 0
//                                               ).toFixed(2)}
//                                             </span>
//                                           </div>
//                                         );
//                                       })}
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             )}
//                             <div className="flex justify-between text-sm font-semibold border-t pt-2">
//                               <span className="text-gray-700">
//                                 Net Payable Amount:
//                               </span>
//                               <span className="text-blue-900">
//                                 ₹{calculateNetPayableAmount(index).toFixed(2)}
//                               </span>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Total Amount to Pay
//                           </label>
//                           <input
//                             type="number"
//                             value={formData[index].totalAmount}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "totalAmount",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter amount..."
//                             min="0"
//                           />
//                         </div>

//                         {/* Auto Mode Payment Distribution */}
//                         {formData[index].totalAmount &&
//                           parseFloat(formData[index].totalAmount) > 0 && (
//                             <div className="border rounded p-3 bg-blue-50">
//                               <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                                 Payment Distribution Breakdown
//                               </h3>
//                               <div className="space-y-2">
//                                 {(() => {
//                                   const distribution =
//                                     calculateAutoDistribution(index);
//                                   return (
//                                     <>
//                                       {distribution.lateFinesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Late Fines Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.lateFinesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.pastDuesPaid > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Past Dues Paid:
//                                           </span>
//                                           <span className="font-medium text-green-600">
//                                             ₹
//                                             {distribution.pastDuesPaid.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.regularFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Regular Fees Paid:
//                                           </span>
//                                           {distribution.regularFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>{fee.month}:</span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.additionalFeesPaid.length >
//                                         0 && (
//                                         <div>
//                                           <span className="text-sm font-medium text-gray-700">
//                                             Additional Fees Paid:
//                                           </span>
//                                           {distribution.additionalFeesPaid.map(
//                                             (fee, i) => (
//                                               <div
//                                                 key={i}
//                                                 className="flex justify-between text-sm ml-2"
//                                               >
//                                                 <span>
//                                                   {fee.name} ({fee.month}):
//                                                 </span>
//                                                 <span className="font-medium text-green-600">
//                                                   ₹{fee.amount.toFixed(2)}
//                                                 </span>
//                                               </div>
//                                             )
//                                           )}
//                                         </div>
//                                       )}
//                                       {distribution.remainingAfterDistribution >
//                                         0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Amount (Not Used):
//                                           </span>
//                                           <span className="font-medium text-orange-600">
//                                             ₹
//                                             {distribution.remainingAfterDistribution.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                       {distribution.remainingDues > 0 && (
//                                         <div className="flex justify-between text-sm">
//                                           <span className="text-gray-700">
//                                             Remaining Dues (Added to Total
//                                             Dues):
//                                           </span>
//                                           <span className="font-medium text-red-600">
//                                             ₹
//                                             {distribution.remainingDues.toFixed(
//                                               2
//                                             )}
//                                           </span>
//                                         </div>
//                                       )}
//                                     </>
//                                   );
//                                 })()}
//                               </div>
//                             </div>
//                           )}
//                       </>
//                     ) : (
//                       <>
//                         {/* Manual Mode UI with Dropdowns */}
//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Months for Regular Fees (₹
//                             {formData[index].classFee}/month)
//                           </label>
//                           <Select
//                             isMulti
//                             options={allMonths
//                               .map((month) => {
//                                 const fee = formData[index].regularFees.find(
//                                   (f) => f.month === month
//                                 );
//                                 return {
//                                   value: month,
//                                   label: `${month} (₹${fee?.dueAmount || 0})`,
//                                   due: fee?.dueAmount || 0,
//                                 };
//                               })
//                               .filter((opt) => opt.due > 0)} // Filter out fully paid months
//                             value={formData[index].selectedMonths.map((m) => {
//                               const fee = formData[index].regularFees.find(
//                                 (f) => f.month === m
//                               );
//                               return {
//                                 value: m,
//                                 label: `${m} (₹${fee?.dueAmount || 0})`,
//                                 due: fee?.dueAmount || 0,
//                               };
//                             })}
//                             onChange={(opts) =>
//                               handleMonthSelection(index, opts)
//                             }
//                             placeholder="Select months..."
//                             styles={customSelectStyles}
//                           />
//                           {formData[index].selectedMonths.length > 0 && (
//                             <div className="mt-2">
//                               <span className="text-sm font-medium text-gray-700">
//                                 Enter Payment for Selected Months:
//                               </span>
//                               <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
//                                 {formData[index].selectedMonths.map(
//                                   (month, monthIndex) => {
//                                     const feeIndex = formData[
//                                       index
//                                     ].regularFees.findIndex(
//                                       (f) => f.month === month
//                                     );
//                                     return (
//                                       <div
//                                         key={monthIndex}
//                                         className="flex items-center gap-2"
//                                       >
//                                         <span className="text-sm">
//                                           {month}:
//                                         </span>
//                                         <input
//                                           type="number"
//                                           value={
//                                             formData[index].regularFees[
//                                               feeIndex
//                                             ].paidAmount
//                                           }
//                                           onChange={(e) =>
//                                             handleRegularFeeChange(
//                                               index,
//                                               feeIndex,
//                                               e.target.value
//                                             )
//                                           }
//                                           className="w-20 border rounded p-1"
//                                           placeholder="0"
//                                           min="0"
//                                         />
//                                       </div>
//                                     );
//                                   }
//                                 )}
//                               </div>
//                             </div>
//                           )}
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Select Additional Fees
//                           </label>
//                           <Select
//                             isMulti
//                             options={additionalFeesOptions}
//                             value={formData[index].selectedAdditionalFees.map(
//                               (f) => ({
//                                 label: `${f.name} (${f.type})`,
//                                 value: f.amount,
//                                 name: f.name,
//                                 type: f.type,
//                               })
//                             )}
//                             onChange={(opts) =>
//                               handleAdditionalFeesChange(index, opts)
//                             }
//                             placeholder="Select additional fees..."
//                           />
//                           {formData[index].selectedAdditionalFees.map(
//                             (fee, feeIndex) => (
//                               <div key={feeIndex} className="mt-2">
//                                 <label className="text-sm text-gray-600">
//                                   {fee.name} (₹{fee.amount}) - Select Months
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allMonths
//                                     .map((month) => {
//                                       const feeData = formData[
//                                         index
//                                       ].additionalFees.find(
//                                         (f) => f.name === fee.name
//                                       );
//                                       const monthData = feeData?.months.find(
//                                         (m) => m.month === month
//                                       );
//                                       return {
//                                         value: month,
//                                         label: `${month} (₹${
//                                           monthData?.dueAmount || 0
//                                         })`,
//                                         due: monthData?.dueAmount || 0,
//                                       };
//                                     })
//                                     .filter((opt) => opt.due > 0)} // Filter out fully paid months
//                                   value={fee.months.map((m) => {
//                                     const feeData = formData[
//                                       index
//                                     ].additionalFees.find(
//                                       (f) => f.name === fee.name
//                                     );
//                                     const monthData = feeData?.months.find(
//                                       (md) => md.month === m
//                                     );
//                                     return {
//                                       value: m,
//                                       label: `${m} (₹${
//                                         monthData?.dueAmount || 0
//                                       })`,
//                                       due: monthData?.dueAmount || 0,
//                                     };
//                                   })}
//                                   onChange={(opts) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       opts
//                                     )
//                                   }
//                                   placeholder={`Months for ${fee.name}...`}
//                                   styles={customSelectStyles}
//                                 />
//                                 {fee.months.length > 0 && (
//                                   <div className="mt-2">
//                                     <span className="text-sm font-medium text-gray-600">
//                                       Enter Payment for {fee.name}:
//                                     </span>
//                                     <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
//                                       {fee.months.map((month, monthIndex) => {
//                                         const feeData = formData[
//                                           index
//                                         ].additionalFees.find(
//                                           (f) => f.name === fee.name
//                                         );
//                                         const monthDataIndex =
//                                           feeData?.months.findIndex(
//                                             (m) => m.month === month
//                                           );
//                                         return (
//                                           <div
//                                             key={monthIndex}
//                                             className="flex items-center gap-2"
//                                           >
//                                             <span className="text-sm">
//                                               {month}:
//                                             </span>
//                                             <input
//                                               type="number"
//                                               value={
//                                                 feeData?.months[monthDataIndex]
//                                                   .paidAmount
//                                               }
//                                               onChange={(e) =>
//                                                 handleAdditionalFeeChange(
//                                                   index,
//                                                   feeIndex,
//                                                   monthDataIndex,
//                                                   e.target.value
//                                                 )
//                                               }
//                                               className="w-20 border rounded p-1"
//                                               placeholder="0"
//                                               min="0"
//                                             />
//                                           </div>
//                                         );
//                                       })}
//                                     </div>
//                                   </div>
//                                 )}
//                               </div>
//                             )
//                           )}
//                         </div>

//                         {/* Manual Mode Fee Breakdown */}
//                         <div className="border rounded p-3 bg-blue-50">
//                           <h3 className="text-lg font-semibold text-blue-900 mb-2">
//                             Fee Breakdown (Manual Mode)
//                           </h3>
//                           <div className="space-y-2">
//                             {formData[index].lateFine > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Late Fines:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].lateFine.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].pastDues > 0 && (
//                               <div className="flex justify-between text-sm">
//                                 <span className="text-gray-700">
//                                   Past Dues:
//                                 </span>
//                                 <span className="font-medium text-blue-600">
//                                   ₹{formData[index].pastDues.toFixed(2)}
//                                 </span>
//                               </div>
//                             )}
//                             {formData[index].selectedMonths.length > 0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Regular Fees Paid:
//                                 </span>
//                                 {formData[index].selectedMonths.map(
//                                   (month, i) => {
//                                     const fee = formData[
//                                       index
//                                     ].regularFees.find(
//                                       (f) => f.month === month
//                                     );
//                                     return (
//                                       <div
//                                         key={i}
//                                         className="flex justify-between text-sm ml-2"
//                                       >
//                                         <span>{month}:</span>
//                                         <span className="font-medium text-blue-600">
//                                           ₹
//                                           {(
//                                             parseFloat(fee?.paidAmount) || 0
//                                           ).toFixed(2)}
//                                         </span>
//                                       </div>
//                                     );
//                                   }
//                                 )}
//                               </div>
//                             )}
//                             {formData[index].selectedAdditionalFees.length >
//                               0 && (
//                               <div>
//                                 <span className="text-sm font-medium text-gray-700">
//                                   Additional Fees Paid:
//                                 </span>
//                                 {formData[index].selectedAdditionalFees.map(
//                                   (fee, i) => (
//                                     <div key={i}>
//                                       {fee.months.map((month, j) => {
//                                         const feeData = formData[
//                                           index
//                                         ].additionalFees.find(
//                                           (f) => f.name === fee.name
//                                         );
//                                         const monthData = feeData?.months.find(
//                                           (m) => m.month === month
//                                         );
//                                         return (
//                                           <div
//                                             key={j}
//                                             className="flex justify-between text-sm ml-2"
//                                           >
//                                             <span>
//                                               {fee.name} ({month}):
//                                             </span>
//                                             <span className="font-medium text-blue-600">
//                                               ₹
//                                               {(
//                                                 parseFloat(
//                                                   monthData?.paidAmount
//                                                 ) || 0
//                                               ).toFixed(2)}
//                                             </span>
//                                           </div>
//                                         );
//                                       })}
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         <div className="border rounded p-3 bg-gray-50">
//                           <label className="block text-sm font-medium text-gray-700 mb-1">
//                             Total Amount to Pay
//                           </label>
//                           <input
//                             type="number"
//                             value={formData[index].totalAmount}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "totalAmount",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter amount..."
//                             min="0"
//                           />
//                         </div>
//                       </>
//                     )}

//                     {/* Common Fields */}
//                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index].paymentMode}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                         >
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                         </select>
//                       </div>

//                       {formData[index].paymentMode === "Online" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Transaction ID
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].transactionId}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "transactionId",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter transaction ID"
//                           />
//                         </div>
//                       )}

//                       {formData[index].paymentMode === "Cheque" && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700">
//                             Cheque Number
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index].chequeBookNo}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "chequeBookNo",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border rounded p-2"
//                             placeholder="Enter cheque number"
//                           />
//                         </div>
//                       )}

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Late Fine
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].lateFine}
//                           onChange={(e) =>
//                             handleInputChange(index, "lateFine", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Concession
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].concession}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "concession",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div>
//                         <label className="block text-sm font-medium text-gray-700">
//                           Dues Paid
//                         </label>
//                         <input
//                           type="number"
//                           value={formData[index].duesPaid}
//                           onChange={(e) =>
//                             handleInputChange(index, "duesPaid", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           min="0"
//                         />
//                       </div>

//                       <div className="sm:col-span-2">
//                         <label className="block text-sm font-medium text-gray-700">
//                           Remarks
//                         </label>
//                         <textarea
//                           value={formData[index].remarks}
//                           onChange={(e) =>
//                             handleInputChange(index, "remarks", e.target.value)
//                           }
//                           className="w-full border rounded p-2"
//                           rows="2"
//                           placeholder="Optional remarks..."
//                         />
//                       </div>

//                       <div className="sm:col-span-2 p-2 bg-blue-50 rounded border border-blue-200">
//                         <label className="block text-lg font-semibold text-blue-900">
//                           Net Amount Payable: ₹{" "}
//                           {calculateTotalForChild(index).toFixed(2)}
//                         </label>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0">
//             <button
//               type="button"
//               onClick={handleSubmit}
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               Submit Fees
//             </button>
//             <button
//               type="button"
//               onClick={() => setModalOpen(false)}
//               className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
//             >
//               Cancel
//             </button>
//           </div>
//         </div>
//       </Modal>

//       <Table reLoad={reLoad} />
//     </div>
//   );
// };

// export default CreateFees;
