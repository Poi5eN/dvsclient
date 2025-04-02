import axios from "axios";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import Table from "./Table";
import { ActiveStudents, feesfeeHistory, getMonthlyDues, LateFines, parentandchildwithID } from "../../Network/AdminApi";
import Modal from "../../Dynamic/Modal";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { useStateContext } from "../../contexts/ContextProvider";

const CreateFees = () => {
  const session = JSON.parse(localStorage.getItem("session"));
  const { setIsLoader } = useStateContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showForm, setShowForm] = useState([]);
  const [reLoad, setReload] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
  const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]);
  const [parentData, setParentData] = useState([]);
  const [allStudent, setAllStudent] = useState([]);
  // const [prevFeeMonths, setPrevFeeMonths] = useState({}); // No longer needed, as we will get all dues information
  const [studentFeeHistory, setStudentFeeHistory] = useState([]);
  const [allLateFines, setAllLateFines] = useState([]);

  const [formData, setFormData] = useState([]);
  //New state variable to store all dues for each child
  const [monthlyDues, setMonthlyDues] = useState({});
console.log("monthlyDues",monthlyDues)
  const authToken = localStorage.getItem("token");

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  // --- Fetch Initial Data ---
  const getAllStudent = async () => {
    try {
      const response = await ActiveStudents();
      if (response?.students?.data) {
        setAllStudent(response.students.data);
      } else {
        console.warn("No student data found in ActiveStudents response:", response);
        setAllStudent([]);
      }
    } catch (error) {
      console.error("Error fetching active students:", error);
      toast.error("Failed to fetch student list.");
      setAllStudent([]);
    }
  };

  const getFeeHistory = async () => {
    // Removed. Not directly used anymore.  We fetch dues per child now.
  };

 const getLateFinesData = async () => {
    try {
      const response = await LateFines();
      if (response?.success) {
        setAllLateFines(response.data || []);
      } else {
        toast.error(response?.message || "Failed to get late fine data.");
        setAllLateFines([]);
      }
    } catch (error) {
      console.error("Error fetching late fines:", error);
      toast.error("Error fetching late fines.");
      setAllLateFines([]);
    }
  };

  useEffect(() => {
    getAllStudent();
    // getFeeHistory(); // Removed
    getLateFinesData();
  }, []);

  // --- Search Handlers ---
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
  };

  // --- Modal and Student Selection ---
  const handleStudentClick = async (parentId) => {
    setIsLoader(true);
    try {
      const response = await parentandchildwithID(parentId);
      if (response?.success) {
        const children = response?.children || [];
        setParentData(children);

        // Initialize formData with default values for each child
        const initialFormData = children.map((child) => ({
          admissionNumber: child.admissionNumber,
          studentId: child.studentId, // Store studentId for easier lookup
          className: child.class,     // Store class name
          classFee: 0,
          feeAmount: "",
          selectedMonths: [],
          monthFees: {},             // To store fee amount per selected month
          totalClassFee: 0,
          feeDate: getCurrentDate(),
          paymentMode: "Cash",
          selectedAdditionalFees: [], // Seems unused, additionalFeeValues is used
          additionalFeeValues: [],   // Stores selected additional fees { fee, value, selectedMonths, totalFee }
          additionalFee: 0,          // Total of selected additional fees
          amountSubmitted: 0,        // Seems unused, consider removing
          previousDues: child.dues || 0,
          concessionFee: "",         // Initialize concession
          duesPaid: "",              // Initialize discount
          lateFine: 0,               // Initialize lateFine (will be fetched)
          remarks: "",
          transactionId: "",
          chequeBookNo: "",          // Specific to Cheque payment
          includeClassFee: false,    // Control visibility of class fee section
          includeAdditionalFees: false, // Control visibility of additional fee section
          monthlyDues: {} // Add a field to store monthly dues for this child
        }));

        setFormData(initialFormData);
        // Reset selections for the new modal instance
        setSelectedChildren([]);
        setShowForm(Array(children.length).fill(false));
        setModalOpen(true);
         setMonthlyDues({}); // Clear dues before loading new data

      } else {
        toast.error(response?.message || "Failed to fetch parent/child data.");
      }
    } catch (error) {
      console.error("Error fetching parent/child data:", error);
      toast.error("An error occurred while fetching student data.");
    } finally {
      setIsLoader(false);
      setSearchTerm(""); // Clear search terms after selection
      // setSearchTermbyAdmissionNo("");
      setFilteredStudents([]); // Hide dropdown
    }
  };

  // --- Child Selection within Modal ---
  const handleChildSelection = async (child, index) => {
    const isCurrentlySelected = selectedChildren.includes(index);
    const updatedSelectedChildren = [...selectedChildren];
    const updatedShowForm = [...showForm];

    let studentMonthlyDues = {}; // Store the dues for this student

    // Fetch monthly dues
    try {
        const monthduesResponse = await getMonthlyDues(child?.studentId, session);
        if (monthduesResponse?.data) {
            studentMonthlyDues = monthduesResponse.data;

             // Store student-specific dues in monthlyDues state
             setMonthlyDues(prevDues => ({
                ...prevDues,
                [child.studentId]: monthduesResponse.data // Store the full response data for the student
             }));
        } else {
            console.warn("No monthly dues found for student:", child.studentId);
            studentMonthlyDues = { regularDues: [], additionalDues: [], lateFines: 0, pastDues: 0, totalDues: 0 }; // Set default
        }
    } catch (error) {
        console.error("Error fetching monthly dues:", error);
        toast.error("Error fetching monthly dues for student: " + child.studentName);
         studentMonthlyDues = { regularDues: [], additionalDues: [], lateFines: 0, pastDues: 0, totalDues: 0 }; // Set default
    }

    if (isCurrentlySelected) {
      // Deselecting
      const TobeRemovedindex = updatedSelectedChildren.indexOf(index);
      updatedSelectedChildren.splice(TobeRemovedindex, 1);
      updatedShowForm[index] = false;

    } else {
      // Selecting
      updatedSelectedChildren.push(index);
      updatedShowForm[index] = true;

      // --- Fetch data specific to this child when selected ---
       setIsLoader(true); // Show loader while fetching fees/fines
      try {
        const studentClass = child.class;
        const studentId = child.studentId;

         // 1. Determine Late Fine for this child's class
        const applicableFine = allLateFines.find(fineRule => fineRule.className === studentClass)?.amount || 0;

        // 2. Fetch Additional Fee Options for this child's class (if not already fetched globally)
        const additionalFeesResponse = await axios.get(
          "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const feesData = additionalFeesResponse?.data?.data
          ?.filter((feeType) => feeType.className === studentClass)
          .map((fee) => ({
            label: fee.name ? `${fee.name}` : "Unknown Fee",
            value: fee.amount || 0, // Store amount directly in value
            id: fee._id, // Keep id if needed
          })) || [];
        setAdditionalFeesOptions(feesData); // Set options for the dropdown

        // 3. Fetch Regular Class Fee Amount
         const classFeeResponse = await axios.get(`https://dvsserver.onrender.com/api/v1/adminRoute/fees`, {
            withCredentials: true,
            headers: { Authorization: `Bearer ${authToken}` },
          });
         const feeTypeArray = classFeeResponse?.data?.data;
         const studentFeeAmount = Array.isArray(feeTypeArray)
            ? feeTypeArray.find(feeType => feeType.className === studentClass)?.amount || 0
            : 0;

        // Update formData for the selected child
        const updatedFormData = [...formData];
        updatedFormData[index] = {
            ...updatedFormData[index],
            lateFine: applicableFine, // Set fetched late fine
            classFee: studentFeeAmount, // Set fetched class fee amount
             monthlyDues: studentMonthlyDues // Store dues
        };
        setFormData(updatedFormData);

      } catch (error) {
          console.error("Error fetching fee details for child:", error);
          toast.error(`Failed to fetch fee details for ${child.studentName}.`);

      } finally {
          setIsLoader(false);
      }
    }

    setSelectedChildren(updatedSelectedChildren);
    setShowForm(updatedShowForm);
  };

  // --- Form Input Handlers ---

  const handleInputChange = (index, field, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index] = {
      ...updatedFormData[index],
      [field]: value,
    };
    setFormData(updatedFormData);
  };

  // --- Month Selection Handlers ---
  const allMonths = [ "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];
  const handleMonthSelection = (selectedOptions, childIndex) => {
    const studentId = formData[childIndex]?.studentId;

    // Retrieve regular dues for this student
     const studentRegularDues = monthlyDues[studentId]?.regularDues || [];

     // Get the months that have already been fully paid
    const paidMonths = studentRegularDues.filter(fee => fee.status === "Paid").map(fee => fee.month);

    // Get the months that have a due amount remaining (partially paid or unpaid)
    const monthsWithDues = studentRegularDues.filter(fee => fee.dueAmount > 0).map(fee => fee.month);

    // Combine both lists to exclude months that are fully paid
    // We still want to be able to select months with dues, so don't exclude them from available months.
    const unavailableMonths = [...paidMonths];

    //This month will be selected by default
    const availableMonthsForStudent = allMonths.filter(
      (month) => !unavailableMonths.includes(month)
    );


    const selectedMonthValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
    const updatedFormData = [...formData];

    if (!updatedFormData[childIndex].monthFees) {
      updatedFormData[childIndex].monthFees = {};
    }

    // --- Sequential Check ---
    if (selectedMonthValues.length > 0) {
        const sortedSelectedMonths = selectedMonthValues.sort(
          (a, b) => availableMonthsForStudent.indexOf(a) - availableMonthsForStudent.indexOf(b)
        );

        const firstAvailableMonth = availableMonthsForStudent[0];
        const firstSelectedMonth = sortedSelectedMonths[0];

        // Check 1: Must start with the first available month if any month is selected
        if (firstSelectedMonth !== firstAvailableMonth) {
             toast.warn(`Selection must start from the first due month: ${firstAvailableMonth}`);
             // Optionally revert selection or just prevent update
             return; // Stop update if sequence is broken at the start
        }

        // Check 2: Check for gaps in the selected sequence relative to available months
        const lastSelectedIndex = availableMonthsForStudent.indexOf(sortedSelectedMonths[sortedSelectedMonths.length - 1]);
        const expectedSequence = availableMonthsForStudent.slice(0, lastSelectedIndex + 1);

        const isSequential = expectedSequence.every(month => sortedSelectedMonths.includes(month));

        if (!isSequential) {
            toast.warn("Fee months must be selected sequentially without gaps.");
            // Optionally revert selection or just prevent update
             return; // Stop update if sequence has gaps
        }
    }
     // --- End Sequential Check ---

    // Update monthFees based on current selection
    const newMonthFees = {};
    selectedMonthValues.forEach((month) => {
       // Retrieve regular dues for this student
       const studentRegularDues = monthlyDues[studentId]?.regularDues || [];
       const monthDues = studentRegularDues.find(dues => dues.month === month)

       newMonthFees[month] = monthDues?.dueAmount !== undefined ? monthDues.dueAmount : (updatedFormData[childIndex].classFee || 0);
    });


    updatedFormData[childIndex].selectedMonths = selectedMonthValues; // Store the values ['April', 'May']
    updatedFormData[childIndex].monthFees = newMonthFees; // Update the fee map
    updatedFormData[childIndex].totalClassFee =
      (updatedFormData[childIndex].classFee || 0) * selectedMonthValues.length;

    setFormData(updatedFormData);
  };

   const handleMonthFeeChange = (index, month, value) => {
    const updatedFormData = [...formData];
    if (updatedFormData[index] && updatedFormData[index].monthFees) {
        updatedFormData[index].monthFees[month] = parseFloat(value) || 0; // Ensure it's a number
        // No need to recalculate totalClassFee here, it's based on count * classFee
        setFormData(updatedFormData);
    }
  };


  // --- Additional Fees Handlers ---

  const handleAdditionalFeesChange = (index, selectedOptions) => {
    const selectedValues = selectedOptions ? selectedOptions.map(option => ({
        fee: option.label, // Name of the fee
        value: option.value, // Amount per month/instance for this fee
        selectedMonths: [], // Months selected *for this specific fee*
        monthFees: {}, // Amount paid per month *for this specific fee*
        totalFee: 0, // Total calculated for this fee based on selected months
    })) : [];


    // Calculate the initial total based on potentially pre-selected months (though usually starts empty)
     const totalAdditionalFee = selectedValues.reduce((total, fee) => {
        return total + (fee.totalFee || 0); // Sum up totals of each selected additional fee
     }, 0);


    const updatedFormData = [...formData];
    updatedFormData[index] = {
        ...updatedFormData[index],
        additionalFee: totalAdditionalFee, // Update total additional fee amount
        additionalFeeValues: selectedValues, // Replace the list of selected additional fees
    };
    setFormData(updatedFormData);
};


 const handleAdditionalFeeMonthSelection = (index, feeIndex, selectedOptions) => {
    const selectedMonthsData = selectedOptions ? selectedOptions.map(option => ({
        month: option.value, // e.g., "April"
        value: formData[index].additionalFeeValues[feeIndex].value // Default value for this fee type
    })) : [];

    const updatedFormData = [...formData];
    const currentFee = updatedFormData[index].additionalFeeValues[feeIndex];

    // Update selected months for *this specific* additional fee
    currentFee.selectedMonths = selectedMonthsData;

    // Calculate total for *this specific* additional fee
    currentFee.totalFee = currentFee.value * selectedMonthsData.length;

    // Recalculate the overall total additional fee for the student
    const newTotalAdditionalFee = updatedFormData[index].additionalFeeValues.reduce((sum, fee) => {
        return sum + (fee.totalFee || 0);
    }, 0);

    updatedFormData[index].additionalFee = newTotalAdditionalFee;

    setFormData(updatedFormData);
};

// Allow editing the amount for a specific month of a specific additional fee
const handleAdditionalFeeMonthValueChange = (index, feeIndex, month, newValue) => {
    const updatedFormData = [...formData];
    const feeEntry = updatedFormData[index]?.additionalFeeValues?.[feeIndex];
    if (!feeEntry) return;

    const monthEntry = feeEntry.selectedMonths?.find(m => m.month === month);
    if (monthEntry) {
        monthEntry.value = parseFloat(newValue) || 0; // Update the value for that specific month
    }
  feeEntry.totalFee = feeEntry.selectedMonths.reduce((sum, m) => sum + (m.value || 0), 0);


    // Recalculate the overall total additional fee for the student
    const newTotalAdditionalFee = updatedFormData[index].additionalFeeValues.reduce((sum, fee) => {
        return sum + (fee.totalFee || 0);
    }, 0);

    updatedFormData[index].additionalFee = newTotalAdditionalFee;

    setFormData(updatedFormData);
};

    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsLoader(true); // Start loader

      let errorsFound = false;
      const feePromises = []; // Store promises for API calls

      if (selectedChildren.length === 0) {
           toast.warn("Please select at least one student and fill their fee details.");
           setIsLoader(false);
           return;
       }


      for (const childIndex of selectedChildren) {
        const child = parentData[childIndex];
        const childFormData = formData[childIndex];

        // Basic Validations
         if (!childFormData.paymentMode) {
          toast.error(`Payment mode is required for ${child.studentName}`);
          errorsFound = true;
          continue;
        }
         if (childFormData.paymentMode === "Online" && !childFormData.transactionId) {
             toast.error(`Transaction ID is required for Online payment for ${child.studentName}`);
             errorsFound = true;
             continue;
         }
         if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
             toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}`);
             errorsFound = true;
             continue;
         }
          // Validation: Ensure numeric inputs are valid numbers (optional but recommended)
          const concessionVal = parseFloat(childFormData.concessionFee);
          const duesPaidVal = parseFloat(childFormData.duesPaid);
          const lateFineVal = parseFloat(childFormData.lateFine);

          if (isNaN(concessionVal) && childFormData.concessionFee !== "" && childFormData.concessionFee !== null) {
               toast.error(`Invalid Concession amount for ${child.studentName}`);
               errorsFound = true;
               continue;
          }
           if (isNaN(duesPaidVal) && childFormData.duesPaid !== "" && childFormData.duesPaid !== null) {
               toast.error(`Invalid Dues Paid amount for ${child.studentName}`);
               errorsFound = true;
               continue;
           }
           if (isNaN(lateFineVal) && childFormData.lateFine !== "" && childFormData.lateFine !== null) {
               toast.error(`Invalid Late Fine amount for ${child.studentName}`);
               errorsFound = true;
               continue;
           }


        // --- Prepare Payload Data ---

        // 1. Regular Fees (Based on actual entered amounts per month)
        const regularFeesPayload = childFormData.includeClassFee
          ? (childFormData.selectedMonths || []).map(month => ({
              month: month,
              paidAmount: Number(childFormData.monthFees?.[month]) || 0,
              // status: "Pending" // Backend likely determines status
            }))
          : []; // Empty array if class fee checkbox is off

        // 2. Additional Fees (Based on actual entered amounts per month per fee)
          const additionalFeesPayload = childFormData.includeAdditionalFees
            ? (childFormData.additionalFeeValues || []).flatMap(feeData => {
                return (feeData.selectedMonths || []).map(monthData => ({
                    name: feeData.fee,
                    month: monthData.month,
                    paidAmount: Number(monthData.value) || 0,
                    // status: "Pending" // Backend likely determines status
                }));
              })
            : []; // Empty array if additional fee checkbox is off


         // 3. Calculate Net Amount Payable using the updated function
         // This function now sums the actual *entered* amounts for fees
         const netAmountPayable = calculateTotalForChild(childIndex);

        // --- Construct the final payload for the API ---
        const newFeeData = {
          studentId: child.studentId,
          session: session, // Assuming session is available in scope
          paymentDetails: {
            regularFees: regularFeesPayload,
            additionalFees: additionalFeesPayload,
            paymentMode: childFormData.paymentMode,
            feeDate: childFormData.feeDate || getCurrentDate(),
            transactionId: childFormData.paymentMode === "Online" ? childFormData.transactionId : "", // Send only if Online
            // chequeNo: childFormData.paymentMode === "Cheque" ? childFormData.chequeBookNo : null,      // Send only if Cheque
            lateFinesPaid: parseFloat(childFormData.lateFine) || 0, // Use entered late fine
            concession: parseFloat(childFormData.concessionFee) || 0, // Use entered concession
            pastDuesPaid: parseFloat(childFormData.duesPaidVal) || 0, // Use the value from the 'Dues Amount' input field
            // pastDuesPaid: parseFloat(childFormData.previousDues) || 0, // Use the value from the 'Dues Amount' input field
            totalAmount: netAmountPayable, // Use the final calculated amount
            remark: childFormData.remarks || "",
             },
        };

        // Push the API call promise to the array
        feePromises.push(
          axios.post(
            "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus", // Use your correct endpoint
            newFeeData,
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${authToken}` },
            }
          )
          .then(response => ({ success: true, studentName: child.studentName, message: response.data.message }))
          .catch(error => ({
              success: false,
              studentName: child.studentName,
              message: error.response?.data?.message || error.response?.data?.error || "Server error"
          }))
        );
      } // End loop through selectedChildren

       if (errorsFound) {
          setIsLoader(false);
          // toast.error("Please fix the errors before submitting."); // Specific errors already shown
          return; // Stop submission if validation errors occurred
      }

      // --- Process all API calls ---
      try {
          const results = await Promise.all(feePromises);
          let allSuccess = true;

          results.forEach(result => {
              if (result.success) {
                  toast.success(`Fee created for ${result.studentName}: ${result.message || 'Success'}`);
              } else {
                  toast.error(`Error creating fee for ${result.studentName}: ${result.message}`);
                  allSuccess = false;
              }
          });

          if (allSuccess) {
              setModalOpen(false); // Close modal only if all succeed
              setReload(prev => !prev); // Trigger table reload
              // getFeeHistory(); // Refresh fee history to update paid months -- Removed because this is never called
              // Consider resetting formData here if needed
          }
           // Handle partial success/failure if needed
      } catch (error) {
          console.error("Error submitting fee data:", error);
          toast.error("An unexpected error occurred during submission.");
      } finally {
        setIsLoader(false); // Stop loader regardless of outcome
      }
    };

  const calculateTotalForChild = (index) => {
    const data = formData[index];
    if (!data) return 0;

    // Calculate actual sum from entered regular month fees
    let actualClassFeePaid = 0;
    if (data.includeClassFee && data.selectedMonths && data.monthFees) {
        actualClassFeePaid = data.selectedMonths.reduce((sum, month) => {
            return sum + (Number(data.monthFees[month]) || 0);
        }, 0);
    }

    // Calculate actual sum from entered additional fee month fees
    let actualAdditionalFeePaid = 0;
    if (data.includeAdditionalFees && data.additionalFeeValues) {
        actualAdditionalFeePaid = data.additionalFeeValues.reduce((totalSum, feeData) => {
            const feeMonthSum = (feeData.selectedMonths || []).reduce((monthSum, monthData) => {
                return monthSum + (Number(monthData.value) || 0);
            }, 0);
            return totalSum + feeMonthSum;
        }, 0);
    }

    // Other components (ensure they are numbers, default to 0)
    const prevDues = parseFloat(data.previousDues) || 0;
    const fine = parseFloat(data.lateFine) || 0;
    const concession = parseFloat(data.concessionFee) || 0;
    const duesPaid = parseFloat(data.duesPaid) || 0; // This seems like it should reduce the total, but following your formula for now. Or is it amount being paid towards past dues? Naming is a bit ambiguous. Let's assume it's an adjustment to be *added* as per your previous formula structure.

    // Final Calculation based on entered amounts and adjustments
    // Formula seems to be: ClassFee + AddlFee + PrevDues + DuesPaid + Fine - Concession
    const total = actualClassFeePaid + actualAdditionalFeePaid + prevDues + duesPaid + fine - concession;

    // Ensure total is not negative, although it might be possible with large concessions
    return total < 0 ? 0 : total;
};

  const formatTotalString = (index) => {
    const data = formData[index];
    if (!data) return "₹ 0";

    // Calculate actual sum from entered regular month fees
    let actualClassFeePaid = 0;
    if (data.includeClassFee && data.selectedMonths && data.monthFees) {
        actualClassFeePaid = data.selectedMonths.reduce((sum, month) => {
            return sum + (Number(data.monthFees[month]) || 0);
        }, 0);
    }

    // Calculate actual sum from entered additional fee month fees
    let actualAdditionalFeePaid = 0;
    if (data.includeAdditionalFees && data.additionalFeeValues) {
        actualAdditionalFeePaid = data.additionalFeeValues.reduce((totalSum, feeData) => {
            const feeMonthSum = (feeData.selectedMonths || []).reduce((monthSum, monthData) => {
                return monthSum + (Number(monthData.value) || 0);
            }, 0);
            return totalSum + feeMonthSum;
        }, 0);
    }

    // Other components
    const prevDues = parseFloat(data.previousDues) || 0;
    const fine = parseFloat(data.lateFine) || 0;
    const concession = parseFloat(data.concessionFee) || 0;
    // const disc = parseFloat(data.discount) || 0; // Original formatTotalString had 'disc', but state used 'duesPaid'. Using duesPaid.
    const duesPaidVal = parseFloat(data.duesPaid) || 0; // Using the value from the 'Dues Amount' input

    // Calculate final total using the updated calculateTotalForChild function
    const finalTotal = calculateTotalForChild(index);

    // Build the string piece by piece based on *actual entered amounts* > 0
    let parts = [];
    if (actualClassFeePaid > 0) parts.push(`${actualClassFeePaid.toFixed(2)} (Class)`);
    if (actualAdditionalFeePaid > 0) parts.push(`${actualAdditionalFeePaid.toFixed(2)} (Addl)`);
    if (prevDues > 0) parts.push(`${prevDues.toFixed(2)} (Prev Dues)`);
     // Add duesPaidVal if it's positive (representing an amount being paid/adjusted)
    if (duesPaidVal > 0) parts.push(`${duesPaidVal.toFixed(2)} (Dues Paid)`); // Adjusted label for clarity
    if (fine > 0) parts.push(`${fine.toFixed(2)} (Fine)`);

    let calculationString = parts.length > 0 ? parts.join(' + ') : '0'; // Start with '0' if no positive parts

    if (concession > 0) calculationString += ` - ${concession.toFixed(2)} (Conc)`;
    // if (disc > 0) calculationString += ` - ${disc.toFixed(2)} (Disc)`; // Removed as using duesPaid now

    // Ensure the result matches the calculation precisely
    return `${calculationString} = ₹ ${finalTotal.toFixed(2)}`;
}

  return (
    <div className="md:min-h-screen md:pl-0 md:px-0">
      {/* Search Inputs */}
      <div className="flex flex-col sm:flex-row gap-2 py-2 mb-2">
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
             <div className="absolute z-10 w-full md:w-1/2 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
                {filteredStudents.map((student, index) => (
                    <div // Changed to div for better structure
                    key={student._id || index} // Use a unique key like _id if available
                    className="p-2 border-b cursor-pointer hover:bg-gray-100"
                    onClick={() => handleStudentClick(student.parentId)}
                    >
                    <span className="font-semibold">{student.studentName || "No Name"}</span>
                    <span className="text-sm text-gray-600">
                        , Class: {student.class}, AdmNo: {student.admissionNumber}, Parent: {student.fatherName}
                    </span>
                    </div>
                ))}
             </div>
        </div>
      )}

      {/* Fee Creation Modal */}
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Create Fees`}>
        {/* Use a form tag here, but button type="button" unless it's the final submit */}
        <div className="flex flex-col max-h-[80vh] "> {/* Allow vertical scroll */}
          {/* Student Selection Area */}
          <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto"> {/* Make this section scrollable */}
            {parentData.map((child, index) => (
              <div key={child._id || index} className={`bg-white rounded-lg shadow-md p-3 border ${selectedChildren.includes(index) ? 'border-blue-500' : 'border-gray-200'} h-full min-w-[300px] mb-3`}> {/* Basic styling */}
                {/* Child Header */}
                <div className="flex items-center border-b pb-2 mb-3">
                  <input
                    type="checkbox"
                    id={`child-checkbox-${index}`}
                    checked={selectedChildren.includes(index)}
                    onChange={() => handleChildSelection(child, index)}
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor={`child-checkbox-${index}`} className="flex-grow cursor-pointer">
                    <span className="text-lg font-semibold text-blue-800">
                      {child.studentName}
                    </span>
                    <span className="text-sm text-gray-700">
                      {" / Class: "} {child.class}
                      {" / Adm#: "} {child.admissionNumber}
                    </span>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-red-600 font-medium">
                         Dues: ₹{formData[index]?.previousDues || 0}
                      </span>
                      {/* Display Late Fine if applicable */}
                      {formData[index]?.lateFine > 0 && (
                         <span className="text-orange-600 font-medium">
                            Late Fine: ₹{formData[index]?.lateFine}
                         </span>
                      )}
                    </div>
                  </label>
                </div>

                {/* Conditional Form Area */}
                {showForm[index] && formData[index] && ( // Ensure formData[index] exists
                  <div className="space-y-4"> {/* Add spacing between sections */}
                    {/* --- Class Fee Section --- */}
                    <div className="border rounded p-3 bg-gray-50">
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`include-class-fee-${index}`}
                          checked={formData[index].includeClassFee}
                          onChange={(e) => handleInputChange( index, "includeClassFee", e.target.checked )}
                          className="mr-2 h-4 w-4"
                        />
                        <label htmlFor={`include-class-fee-${index}`} className="font-semibold text-gray-700">
                          Regular Class Fee (₹{formData[index].classFee}/month)
                        </label>
                      </div>
                      {formData[index].includeClassFee && (
                        <div className="space-y-3 pl-6">
                           {/* Month Selector */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Select Months
                            </label>
                             <Select
                                options={(allMonths.filter(month => {
                                    const studentId = formData[index].studentId;
                                    const studentRegularDues = monthlyDues[studentId]?.regularDues || [];

                                    //Check if the month is present in the regualar dues
                                    const monthDues = studentRegularDues.find((dues) => dues.month === month)

                                    //Exclude the month if the status is paid or dueAmout exist
                                    return monthDues ? monthDues.status !== 'Paid' && monthDues.dueAmount > 0 : true

                                })).map(m => ({ value: m, label: m }))} // Filter out paid months for *this* student
                                value={formData[index].selectedMonths?.map(m => ({ value: m, label: m }))}
                                onChange={(selectedOptions) => handleMonthSelection(selectedOptions, index)}
                                isMulti
                                closeMenuOnSelect={false}
                                name={`months-class-${index}`}
                                className="basic-multi-select"
                                classNamePrefix="select"
                                placeholder="Select fee months..."
                             />

                             {/* Display Total Class Fee */}
                            <p className="text-sm font-medium text-gray-600 mt-2">
                                Total Class Fee Due: ₹{formData[index].totalClassFee || 0}
                            </p>
                          </div>

                          {/* Individual Month Fee Inputs */}
                           {formData[index].selectedMonths && formData[index].selectedMonths.length > 0 && (
                                <div className="mt-2 border-t pt-2">
                                    <label className="block text-xs font-medium text-gray-500 mb-1">Enter Amount Paid Per Month:</label>
                                    <div className="flex flex-wrap gap-2">
                                    {formData[index].selectedMonths.map( (month) => {
                                      const studentId = formData[index].studentId;
                                      const studentRegularDues = monthlyDues[studentId]?.regularDues || [];
                                      const monthDues = studentRegularDues.find((dues) => dues.month === month)

                                      //Get the initial value from the dues if exist otherwise get the amount from monthFees or 0
                                      const initialValue = monthDues ? monthDues.dueAmount : formData[index].monthFees?.[month] ?? 0
                                      return (
                                        <div key={month} className="flex items-center gap-1 bg-gray-200 p-1 rounded text-xs">
                                          <label htmlFor={`monthfee-${index}-${month}`} className="text-gray-700">{month}:</label>
                                          <input
                                              type="number"
                                              id={`monthfee-${index}-${month}`}
                                              className="w-16 border rounded p-1 text-xs"
                                              value={initialValue} // Use empty string if undefined/null
                                              onChange={(e) => handleMonthFeeChange( index, month, e.target.value )}
                                              placeholder="Amt"
                                              min="0" // Prevent negative numbers
                                          />
                                        </div>
                                      )
                                    })}
                                    </div>
                                </div>
                            )}
                        </div>
                      )}
                    </div>

                    {/* --- Additional Fees Section --- */}
                     <div className="border rounded p-3 bg-gray-50">
                        <div className="flex items-center mb-2">
                           <input
                                type="checkbox"
                                id={`include-addl-fee-${index}`}
                                checked={formData[index].includeAdditionalFees}
                                onChange={(e) => handleInputChange(index, "includeAdditionalFees", e.target.checked)}
                                className="mr-2 h-4 w-4"
                            />
                            <label htmlFor={`include-addl-fee-${index}`} className="font-semibold text-gray-700">
                                Additional Fees
                            </label>
                        </div>
                        {formData[index].includeAdditionalFees && (
                            <div className="space-y-3 pl-6">
                                {/* Additional Fee Type Selector */}
                                <Select
                                    isMulti
                                    options={additionalFeesOptions} // Use state variable holding options
                                    value={formData[index].additionalFeeValues?.map(f => ({ label: f.fee, value: f.value }))} // Map current selection back to options format
                                    onChange={(selectedOptions) => handleAdditionalFeesChange(index, selectedOptions)}
                                    closeMenuOnSelect={false}
                                    className="basic-multi-select"
                                    classNamePrefix="select"
                                    placeholder="Select additional fee types..."
                                />
                                {/* Display Total Additional Fee */}
                                <p className="text-sm font-medium text-gray-600 mt-2">
                                    Total Additional Fees Due: ₹{formData[index].additionalFee || 0}
                                </p>

                                {/* Details for each selected additional fee */}
                                {formData[index].additionalFeeValues?.map((feeData, feeIndex) => (
                                    <div key={feeIndex} className="border rounded p-2 mt-2 bg-white space-y-2">
                                        <p className="font-medium text-sm text-blue-700">{feeData.fee} (₹{feeData.value} each)</p>
                                        {/* Month Selector for this specific fee */}
                                        <Select
                                            isMulti
                                            options={allMonths.map(m => ({ value: m, label: m }))} // Assuming addl fees can apply to any month
                                            value={feeData.selectedMonths?.map(m => ({ value: m.month, label: m.month }))}
                                            onChange={(selectedOptions) => handleAdditionalFeeMonthSelection( index, feeIndex, selectedOptions )}
                                            closeMenuOnSelect={false}
                                            name={`months-addl-${index}-${feeIndex}`}
                                            className="basic-multi-select text-xs"
                                            classNamePrefix="select"
                                            placeholder="Select months for this fee..."
                                         />
                                         {/* Inputs for Amount Paid per Month for this fee */}
                                         {feeData.selectedMonths && feeData.selectedMonths.length > 0 && (
                                            <div className="mt-2 border-t pt-2">
                                                <label className="block text-xs font-medium text-gray-500 mb-1">Enter Amount Paid Per Month (for {feeData.fee}):</label>
                                                <div className="flex flex-wrap gap-2">
                                                    {feeData.selectedMonths.map((monthData) => (
                                                        <div key={monthData.month} className="flex items-center gap-1 bg-gray-200 p-1 rounded text-xs">
                                                            <label htmlFor={`monthfee-addl-${index}-${feeIndex}-${monthData.month}`} className="text-gray-700">{monthData.month}:</label>
                                                            <input
                                                                type="number"
                                                                id={`monthfee-addl-${index}-${feeIndex}-${monthData.month}`}
                                                                className="w-16 border rounded p-1 text-xs"
                                                                value={monthData.value ?? ''} // Use assigned value
                                                                onChange={(e) => handleAdditionalFeeMonthValueChange( index, feeIndex, monthData.month, e.target.value )}
                                                                placeholder="Amt"
                                                                min="0"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                         )}
                                    </div>
                                ))}
                            </div>
                        )}
                     </div>

                    {/* --- Payment Details & Adjustments --- */}
                     <div className="border rounded p-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Fee Date */}
                        <div>
                           <label htmlFor={`feeDate-${index}`} className="block text-sm font-medium text-gray-700">Fee Date</label>
                           <input
                                type="date"
                                id={`feeDate-${index}`}
                                value={formData[index].feeDate || getCurrentDate()}
                                onChange={(e) => handleInputChange(index, "feeDate", e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                            />
                        </div>

                        {/* Payment Mode */}
                         <div>
                            <label htmlFor={`paymentMode-${index}`} className="block text-sm font-medium text-gray-700">Payment Mode</label>
                            <select
                                id={`paymentMode-${index}`}
                                value={formData[index].paymentMode || "Cash"}
                                onChange={(e) => handleInputChange( index, "paymentMode", e.target.value )}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1.5"
                            >
                                <option value="Cash">Cash</option>
                                <option value="Online">Online</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                         </div>

                        {/* Transaction ID (Conditional) */}
                         {formData[index].paymentMode === "Online" && (
                            <div>
                                <label htmlFor={`transactionId-${index}`} className="block text-sm font-medium text-gray-700">Transaction ID</label>
                                <input
                                    type="text"
                                    id={`transactionId-${index}`}
                                    value={formData[index].transactionId || ""}
                                    onChange={(e) => handleInputChange( index, "transactionId", e.target.value )}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                                    placeholder="Enter online transaction ID"
                                />
                            </div>
                         )}

                        {/* Cheque No (Conditional) */}
                         {formData[index].paymentMode === "Cheque" && (
                             <div>
                                <label htmlFor={`chequeNo-${index}`} className="block text-sm font-medium text-gray-700">Cheque Number</label>
                                <input
                                    type="text"
                                    id={`chequeNo-${index}`}
                                    value={formData[index].chequeBookNo || ""} // Field name corrected in state
                                    onChange={(e) => handleInputChange( index, "chequeBookNo", e.target.value )} // Update correct state field
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                                    placeholder="Enter cheque number"
                                />
                            </div>
                         )}

                        {/* Late Fine (Display/Input) */}
                         <div>
                           <label htmlFor={`lateFine-${index}`} className="block text-sm font-medium text-gray-700">Late Fine Amount</label>
                           <input
                                type="number"
                                id={`lateFine-${index}`}
                                placeholder="Auto/Manual Fine"
                                value={formData[index].lateFine ?? ''} // Use ?? for null/undefined check
                                onChange={(e) => handleInputChange( index, "lateFine", e.target.value )} // Allow override if needed
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                                min="0"
                            />
                        </div>

                        {/* Concession */}
                        <div>
                           <label htmlFor={`concession-${index}`} className="block text-sm font-medium text-gray-700">Concession Amount</label>
                           <input
                                type="number"
                                id={`concession-${index}`}
                                placeholder="Enter concession"
                                value={formData[index].concessionFee ?? ''}
                                onChange={(e) => handleInputChange( index, "concessionFee", e.target.value )}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                                min="0"
                            />
                        </div>

                         {/* Discount - NEW FIELD */}
                        <div>
                           <label htmlFor={`duesPaid-${index}`} className="block text-sm font-medium text-gray-700">Past Dues </label>
                           <input
                                type="number"
                                id={`duesPaid-${index}`}
                                placeholder="Enter duesPaid"
                                value={formData[index].duesPaid ?? ''} // Use discount from state
                                onChange={(e) => handleInputChange( index, "duesPaid", e.target.value )} // Update discount state
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                                min="0"
                            />
                        </div>

                        {/* Remarks (span across cols potentially) */}
                        <div className="sm:col-span-2">
                           <label htmlFor={`remarks-${index}`} className="block text-sm font-medium text-gray-700">Remarks</label>
                           <textarea
                                id={`remarks-${index}`}
                                value={formData[index].remarks || ""}
                                onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
                                rows="2"
                                placeholder="Optional remarks..."
                            />
                        </div>

                        {/* Total Calculation Display (span across cols) */}
                        <div className="sm:col-span-2 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
                            <label className="block text-sm font-medium text-gray-800">Calculation:</label>
                            <p className="text-sm text-blue-900 break-words">{formatTotalString(index)}</p>
                            <label className="block text-lg font-semibold text-blue-900 mt-1">
                                Net Amount Payable: ₹ {calculateTotalForChild(index).toFixed(2)}
                             </label>
                        </div>

                     </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Modal Action Buttons */}
           <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0">
            <button
              type="button" // Important: prevent default form submission
              onClick={handleSubmit} // Trigger explicit submit handler
              // disabled={selectedChildren.length === 0 || setIsLoader} // Disable if no selection or loading
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {'Submit Fees'}
              {/* {setIsLoader ? 'Submitting...' : 'Submit Fees'} */}
            </button>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      {/* Fee History Table */}
      <Table reLoad={reLoad} />
    </div>
  );
};

export default CreateFees;




// import axios from "axios";
// import React, { useEffect, useState } from "react";
// // import Cookies from "js-cookie"; // Not used, can be removed unless needed elsewhere
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import { ActiveStudents, feesfeeHistory, getMonthlyDues, LateFines, parentandchildwithID } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   // const [isOpen, setIsOpen] = useState(false); // isOpen seems redundant if modalOpen is used
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]); // Renamed for clarity
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [prevFeeMonths, setPrevFeeMonths] = useState({}); // Store previous months per studentId
//   const [studentFeeHistory, setStudentFeeHistory] = useState([]);
//   const [allLateFines, setAllLateFines] = useState([]); // Store all late fine rules

//   // --- State for formData ---
//   // Initialize formData structure within handleStudentClick
//   const [formData, setFormData] = useState([]);

//   const authToken = localStorage.getItem("token");

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   // --- Fetch Initial Data ---
//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//       } else {
//         console.warn("No student data found in ActiveStudents response:", response);
//         setAllStudent([]);
//       }
//     } catch (error) {
//       console.error("Error fetching active students:", error);
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   const getFeeHistory = async () => {
//     try {
//       // const response = await feesfeeHistory();
//       // if (response?.success) {
//       //   setStudentFeeHistory(response.data);
//       //   // Process fee history to easily get paid months per student
//       //   const paidMonthsMap = {};
//       //   response.data.forEach(history => {
//       //     const paidMonths = history.regularFees
//       //       ?.find(fee => fee.status === "Paid")
//       //       // ?.filter(fee => fee.status === "Paid")
//       //       .map(fee => fee.month) || [];
//       //     paidMonthsMap[history.studentId] = paidMonths;
//       //   });
//       //   setPrevFeeMonths(paidMonthsMap);

//       // } else {
//       //   toast.error(response?.message || "Failed to get fee history.");
//       //   setStudentFeeHistory([]);
//       //    setPrevFeeMonths({});
//       // }
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//       toast.error("Error fetching fee history.");
//         setStudentFeeHistory([]);
//         setPrevFeeMonths({});
//     }
//   };

//  const getLateFinesData = async () => {
//     try {
//       const response = await LateFines();
//       if (response?.success) {
//         setAllLateFines(response.data || []);
//       } else {
//         toast.error(response?.message || "Failed to get late fine data.");
//         setAllLateFines([]);
//       }
//     } catch (error) {
//       console.error("Error fetching late fines:", error);
//       toast.error("Error fetching late fines.");
//       setAllLateFines([]);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//     getFeeHistory();
//     getLateFinesData(); // Fetch all late fines once
//   }, []);

//   // --- Search Handlers ---
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

//   // --- Modal and Student Selection ---
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         // Initialize formData with default values for each child
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           studentId: child.studentId, // Store studentId for easier lookup
//           className: child.class,     // Store class name
//           classFee: 0,               // Will be fetched later if needed
//           feeAmount: "",             // Seems unused, consider removing
//           selectedMonths: [],
//           monthFees: {},             // To store fee amount per selected month
//           totalClassFee: 0,
//           feeDate: getCurrentDate(),
//           paymentMode: "Cash",
//           selectedAdditionalFees: [], // Seems unused, additionalFeeValues is used
//           additionalFeeValues: [],   // Stores selected additional fees { fee, value, selectedMonths, totalFee }
//           additionalFee: 0,          // Total of selected additional fees
//           amountSubmitted: 0,        // Seems unused, consider removing
//           previousDues: child.dues || 0,
//           concessionFee: "",         // Initialize concession
//           duesPaid: "",              // Initialize discount
//           lateFine: 0,               // Initialize lateFine (will be fetched)
//           remarks: "",
//           transactionId: "",
//           chequeBookNo: "",          // Specific to Cheque payment
//           includeClassFee: false,    // Control visibility of class fee section
//           includeAdditionalFees: false, // Control visibility of additional fee section
//         }));

//         setFormData(initialFormData);
//         // Reset selections for the new modal instance
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false));
//         setModalOpen(true);
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       console.error("Error fetching parent/child data:", error);
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm(""); // Clear search terms after selection
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]); // Hide dropdown
//     }
//   };

//   // --- Child Selection within Modal ---
//   const handleChildSelection = async (child, index) => { // Make async to handle potential async operations
//    console.log("child",child)
//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     const monthdues=await getMonthlyDues(child?.studentId,session)
//     if(monthdues?.data?.regularDues?.length>0){
      
     
//       const paidMonths = monthdues?.data?.regularDues?.filter(fee => fee.status === "Paid")
//           .map(fee => fee.month) || [];
//           console.log("paidMonths",paidMonths)
//           setPrevFeeMonths(paidMonths);

//     }
//     if (isCurrentlySelected) {
//       // Deselecting
//       const TobeRemovedindex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(TobeRemovedindex, 1);
//       updatedShowForm[index] = false;
//     } else {
//       // Selecting
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;

//       // --- Fetch data specific to this child when selected ---
//        setIsLoader(true); // Show loader while fetching fees/fines
//       try {
//         const studentClass = child.class;
//         const studentId = child.studentId;

//          // 1. Determine Late Fine for this child's class
//         const applicableFine = allLateFines.find(fineRule => fineRule.className === studentClass)?.amount || 0;

//         // 2. Fetch Additional Fee Options for this child's class (if not already fetched globally)
//         // Using axios directly here, consider moving to Network/AdminApi if preferred
//         const additionalFeesResponse = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         const feesData = additionalFeesResponse?.data?.data
//           ?.filter((feeType) => feeType.className === studentClass)
//           .map((fee) => ({
//             label: fee.name ? `${fee.name}` : "Unknown Fee",
//             value: fee.amount || 0, // Store amount directly in value
//             id: fee._id, // Keep id if needed
//           })) || [];
//         setAdditionalFeesOptions(feesData); // Set options for the dropdown

//         // 3. Fetch Regular Class Fee Amount
//          const classFeeResponse = await axios.get(`https://dvsserver.onrender.com/api/v1/adminRoute/fees`, {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           });
//          const feeTypeArray = classFeeResponse?.data?.data;
//          const studentFeeAmount = Array.isArray(feeTypeArray)
//             ? feeTypeArray.find(feeType => feeType.className === studentClass)?.amount || 0
//             : 0;

//         // Update formData for the selected child
//         const updatedFormData = [...formData];
//         updatedFormData[index] = {
//             ...updatedFormData[index],
//             lateFine: applicableFine, // Set fetched late fine
//             classFee: studentFeeAmount, // Set fetched class fee amount
           
//         };
//         setFormData(updatedFormData);

//       } catch (error) {
//           console.error("Error fetching fee details for child:", error);
//           toast.error(`Failed to fetch fee details for ${child.studentName}.`);
          
//       } finally {
//           setIsLoader(false);
//       }
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   // --- Form Input Handlers ---

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setFormData(updatedFormData);
//   };

//   // --- Month Selection Handlers ---
//   const allMonths = [ "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const studentId = formData[childIndex]?.studentId;
//     const currentPrevFeeMonths = prevFeeMonths[studentId] || []; // Get paid months for *this* student
// console.log("currentPrevFeeMonths",currentPrevFeeMonths)
//     // Available months are allMonths excluding the ones already paid by this student
//     const availableMonthsForStudent = allMonths.filter(
//       (month) => !currentPrevFeeMonths.includes(month)
//     );

//     const selectedMonthValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
//     const updatedFormData = [...formData];

//     if (!updatedFormData[childIndex].monthFees) {
//       updatedFormData[childIndex].monthFees = {};
//     }

//     // --- Sequential Check ---
//     if (selectedMonthValues.length > 0) {
//         const sortedSelectedMonths = selectedMonthValues.sort(
//           (a, b) => availableMonthsForStudent.indexOf(a) - availableMonthsForStudent.indexOf(b)
//         );

//         const firstAvailableMonth = availableMonthsForStudent[0];
//         const firstSelectedMonth = sortedSelectedMonths[0];

//         // Check 1: Must start with the first available month if any month is selected
//         if (firstSelectedMonth !== firstAvailableMonth) {
//              toast.warn(`Selection must start from the first due month: ${firstAvailableMonth}`);
//              // Optionally revert selection or just prevent update
//              return; // Stop update if sequence is broken at the start
//         }

//         // Check 2: Check for gaps in the selected sequence relative to available months
//         const lastSelectedIndex = availableMonthsForStudent.indexOf(sortedSelectedMonths[sortedSelectedMonths.length - 1]);
//         const expectedSequence = availableMonthsForStudent.slice(0, lastSelectedIndex + 1);

//         const isSequential = expectedSequence.every(month => sortedSelectedMonths.includes(month));

//         if (!isSequential) {
//             toast.warn("Fee months must be selected sequentially without gaps.");
//             // Optionally revert selection or just prevent update
//              return; // Stop update if sequence has gaps
//         }
//     }
//      // --- End Sequential Check ---

//     // Update monthFees based on current selection
//     const newMonthFees = {};
//     selectedMonthValues.forEach((month) => {
//         // Keep existing value if present, otherwise default to classFee
//         newMonthFees[month] = updatedFormData[childIndex].monthFees[month] ?? (updatedFormData[childIndex].classFee || 0);
//     });


//     updatedFormData[childIndex].selectedMonths = selectedMonthValues; // Store the values ['April', 'May']
//     updatedFormData[childIndex].monthFees = newMonthFees; // Update the fee map
//     updatedFormData[childIndex].totalClassFee =
//       (updatedFormData[childIndex].classFee || 0) * selectedMonthValues.length;

//     setFormData(updatedFormData);
//   };


//    const handleMonthFeeChange = (index, month, value) => {
//     const updatedFormData = [...formData];
//     if (updatedFormData[index] && updatedFormData[index].monthFees) {
//         updatedFormData[index].monthFees[month] = parseFloat(value) || 0; // Ensure it's a number
//         // No need to recalculate totalClassFee here, it's based on count * classFee
//         setFormData(updatedFormData);
//     }
//   };


//   // --- Additional Fees Handlers ---

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedValues = selectedOptions ? selectedOptions.map(option => ({
//         fee: option.label, // Name of the fee
//         value: option.value, // Amount per month/instance for this fee
//         selectedMonths: [], // Months selected *for this specific fee*
//         monthFees: {}, // Amount paid per month *for this specific fee*
//         totalFee: 0, // Total calculated for this fee based on selected months
//     })) : [];


//     // Calculate the initial total based on potentially pre-selected months (though usually starts empty)
//      const totalAdditionalFee = selectedValues.reduce((total, fee) => {
//         return total + (fee.totalFee || 0); // Sum up totals of each selected additional fee
//      }, 0);


//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//         ...updatedFormData[index],
//         additionalFee: totalAdditionalFee, // Update total additional fee amount
//         additionalFeeValues: selectedValues, // Replace the list of selected additional fees
//     };
//     setFormData(updatedFormData);
// };


//  const handleAdditionalFeeMonthSelection = (index, feeIndex, selectedOptions) => {
//     const selectedMonthsData = selectedOptions ? selectedOptions.map(option => ({
//         month: option.value, // e.g., "April"
//         value: formData[index].additionalFeeValues[feeIndex].value // Default value for this fee type
//     })) : [];

//     const updatedFormData = [...formData];
//     const currentFee = updatedFormData[index].additionalFeeValues[feeIndex];

//     // Update selected months for *this specific* additional fee
//     currentFee.selectedMonths = selectedMonthsData;

//     // Calculate total for *this specific* additional fee
//     currentFee.totalFee = currentFee.value * selectedMonthsData.length;

//     // Recalculate the overall total additional fee for the student
//     const newTotalAdditionalFee = updatedFormData[index].additionalFeeValues.reduce((sum, fee) => {
//         return sum + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = newTotalAdditionalFee;

//     setFormData(updatedFormData);
// };

// // Allow editing the amount for a specific month of a specific additional fee
// const handleAdditionalFeeMonthValueChange = (index, feeIndex, month, newValue) => {
//     const updatedFormData = [...formData];
//     const feeEntry = updatedFormData[index]?.additionalFeeValues?.[feeIndex];
//     if (!feeEntry) return;

//     const monthEntry = feeEntry.selectedMonths?.find(m => m.month === month);
//     if (monthEntry) {
//         monthEntry.value = parseFloat(newValue) || 0; // Update the value for that specific month
//     }
//   feeEntry.totalFee = feeEntry.selectedMonths.reduce((sum, m) => sum + (m.value || 0), 0);


//     // Recalculate the overall total additional fee for the student
//     const newTotalAdditionalFee = updatedFormData[index].additionalFeeValues.reduce((sum, fee) => {
//         return sum + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = newTotalAdditionalFee;

//     setFormData(updatedFormData);
// };

//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       setIsLoader(true); // Start loader
  
//       let errorsFound = false;
//       const feePromises = []; // Store promises for API calls
  
//       if (selectedChildren.length === 0) {
//            toast.warn("Please select at least one student and fill their fee details.");
//            setIsLoader(false);
//            return;
//        }
  
  
//       for (const childIndex of selectedChildren) {
//         const child = parentData[childIndex];
//         const childFormData = formData[childIndex];
  
//         // Basic Validations
//          if (!childFormData.paymentMode) {
//           toast.error(`Payment mode is required for ${child.studentName}`);
//           errorsFound = true;
//           continue;
//         }
//          if (childFormData.paymentMode === "Online" && !childFormData.transactionId) {
//              toast.error(`Transaction ID is required for Online payment for ${child.studentName}`);
//              errorsFound = true;
//              continue;
//          }
//          if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
//              toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}`);
//              errorsFound = true;
//              continue;
//          }
//           // Validation: Ensure numeric inputs are valid numbers (optional but recommended)
//           const concessionVal = parseFloat(childFormData.concessionFee);
//           const duesPaidVal = parseFloat(childFormData.duesPaid);
//           const lateFineVal = parseFloat(childFormData.lateFine);
  
//           if (isNaN(concessionVal) && childFormData.concessionFee !== "" && childFormData.concessionFee !== null) {
//                toast.error(`Invalid Concession amount for ${child.studentName}`);
//                errorsFound = true;
//                continue;
//           }
//            if (isNaN(duesPaidVal) && childFormData.duesPaid !== "" && childFormData.duesPaid !== null) {
//                toast.error(`Invalid Dues Paid amount for ${child.studentName}`);
//                errorsFound = true;
//                continue;
//            }
//            if (isNaN(lateFineVal) && childFormData.lateFine !== "" && childFormData.lateFine !== null) {
//                toast.error(`Invalid Late Fine amount for ${child.studentName}`);
//                errorsFound = true;
//                continue;
//            }
  
  
//         // --- Prepare Payload Data ---
  
//         // 1. Regular Fees (Based on actual entered amounts per month)
//         const regularFeesPayload = childFormData.includeClassFee
//           ? (childFormData.selectedMonths || []).map(month => ({
//               month: month,
//               paidAmount: Number(childFormData.monthFees?.[month]) || 0,
//               // status: "Pending" // Backend likely determines status
//             }))
//           : []; // Empty array if class fee checkbox is off
  
//         // 2. Additional Fees (Based on actual entered amounts per month per fee)
//           const additionalFeesPayload = childFormData.includeAdditionalFees
//             ? (childFormData.additionalFeeValues || []).flatMap(feeData => {
//                 return (feeData.selectedMonths || []).map(monthData => ({
//                     name: feeData.fee,
//                     month: monthData.month,
//                     paidAmount: Number(monthData.value) || 0,
//                     // status: "Pending" // Backend likely determines status
//                 }));
//               })
//             : []; // Empty array if additional fee checkbox is off
  
  
//          // 3. Calculate Net Amount Payable using the updated function
//          // This function now sums the actual *entered* amounts for fees
//          const netAmountPayable = calculateTotalForChild(childIndex);
  
//         // --- Construct the final payload for the API ---
//         const newFeeData = {
//           studentId: child.studentId,
//           session: session, // Assuming session is available in scope
//           paymentDetails: {
//             regularFees: regularFeesPayload,
//             additionalFees: additionalFeesPayload,
//             paymentMode: childFormData.paymentMode,
//             feeDate: childFormData.feeDate || getCurrentDate(),
//             transactionId: childFormData.paymentMode === "Online" ? childFormData.transactionId : "", // Send only if Online
//             // chequeNo: childFormData.paymentMode === "Cheque" ? childFormData.chequeBookNo : null,      // Send only if Cheque
//             lateFinesPaid: parseFloat(childFormData.lateFine) || 0, // Use entered late fine
//             concession: parseFloat(childFormData.concessionFee) || 0, // Use entered concession
//             pastDuesPaid: parseFloat(childFormData.duesPaidVal) || 0, // Use the value from the 'Dues Amount' input field
//             // pastDuesPaid: parseFloat(childFormData.previousDues) || 0, // Use the value from the 'Dues Amount' input field
//             totalAmount: netAmountPayable, // Use the final calculated amount
//             remark: childFormData.remarks || "",
//              },
//         };
  
//         // Push the API call promise to the array
//         feePromises.push(
//           axios.post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus", // Use your correct endpoint
//             newFeeData,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then(response => ({ success: true, studentName: child.studentName, message: response.data.message }))
//           .catch(error => ({
//               success: false,
//               studentName: child.studentName,
//               message: error.response?.data?.message || error.response?.data?.error || "Server error"
//           }))
//         );
//       } // End loop through selectedChildren
  
//        if (errorsFound) {
//           setIsLoader(false);
//           // toast.error("Please fix the errors before submitting."); // Specific errors already shown
//           return; // Stop submission if validation errors occurred
//       }
  
//       // --- Process all API calls ---
//       try {
//           const results = await Promise.all(feePromises);
//           let allSuccess = true;
  
//           results.forEach(result => {
//               if (result.success) {
//                   toast.success(`Fee created for ${result.studentName}: ${result.message || 'Success'}`);
//               } else {
//                   toast.error(`Error creating fee for ${result.studentName}: ${result.message}`);
//                   allSuccess = false;
//               }
//           });
  
//           if (allSuccess) {
//               setModalOpen(false); // Close modal only if all succeed
//               setReload(prev => !prev); // Trigger table reload
//               getFeeHistory(); // Refresh fee history to update paid months
//               // Consider resetting formData here if needed
//           }
//            // Handle partial success/failure if needed
//       } catch (error) {
//           console.error("Error submitting fee data:", error);
//           toast.error("An unexpected error occurred during submission.");
//       } finally {
//         setIsLoader(false); // Stop loader regardless of outcome
//       }
//     };

//   const calculateTotalForChild = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     // Calculate actual sum from entered regular month fees
//     let actualClassFeePaid = 0;
//     if (data.includeClassFee && data.selectedMonths && data.monthFees) {
//         actualClassFeePaid = data.selectedMonths.reduce((sum, month) => {
//             return sum + (Number(data.monthFees[month]) || 0);
//         }, 0);
//     }

//     // Calculate actual sum from entered additional fee month fees
//     let actualAdditionalFeePaid = 0;
//     if (data.includeAdditionalFees && data.additionalFeeValues) {
//         actualAdditionalFeePaid = data.additionalFeeValues.reduce((totalSum, feeData) => {
//             const feeMonthSum = (feeData.selectedMonths || []).reduce((monthSum, monthData) => {
//                 return monthSum + (Number(monthData.value) || 0);
//             }, 0);
//             return totalSum + feeMonthSum;
//         }, 0);
//     }

//     // Other components (ensure they are numbers, default to 0)
//     const prevDues = parseFloat(data.previousDues) || 0;
//     const fine = parseFloat(data.lateFine) || 0;
//     const concession = parseFloat(data.concessionFee) || 0;
//     const duesPaid = parseFloat(data.duesPaid) || 0; // This seems like it should reduce the total, but following your formula for now. Or is it amount being paid towards past dues? Naming is a bit ambiguous. Let's assume it's an adjustment to be *added* as per your previous formula structure.

//     // Final Calculation based on entered amounts and adjustments
//     // Formula seems to be: ClassFee + AddlFee + PrevDues + DuesPaid + Fine - Concession
//     const total = actualClassFeePaid + actualAdditionalFeePaid + prevDues + duesPaid + fine - concession;

//     // Ensure total is not negative, although it might be possible with large concessions
//     return total < 0 ? 0 : total;
// };
 
//   const formatTotalString = (index) => {
//     const data = formData[index];
//     if (!data) return "₹ 0";

//     // Calculate actual sum from entered regular month fees
//     let actualClassFeePaid = 0;
//     if (data.includeClassFee && data.selectedMonths && data.monthFees) {
//         actualClassFeePaid = data.selectedMonths.reduce((sum, month) => {
//             return sum + (Number(data.monthFees[month]) || 0);
//         }, 0);
//     }

//     // Calculate actual sum from entered additional fee month fees
//     let actualAdditionalFeePaid = 0;
//     if (data.includeAdditionalFees && data.additionalFeeValues) {
//         actualAdditionalFeePaid = data.additionalFeeValues.reduce((totalSum, feeData) => {
//             const feeMonthSum = (feeData.selectedMonths || []).reduce((monthSum, monthData) => {
//                 return monthSum + (Number(monthData.value) || 0);
//             }, 0);
//             return totalSum + feeMonthSum;
//         }, 0);
//     }

//     // Other components
//     const prevDues = parseFloat(data.previousDues) || 0;
//     const fine = parseFloat(data.lateFine) || 0;
//     const concession = parseFloat(data.concessionFee) || 0;
//     // const disc = parseFloat(data.discount) || 0; // Original formatTotalString had 'disc', but state used 'duesPaid'. Using duesPaid.
//     const duesPaidVal = parseFloat(data.duesPaid) || 0; // Using the value from the 'Dues Amount' input

//     // Calculate final total using the updated calculateTotalForChild function
//     const finalTotal = calculateTotalForChild(index);

//     // Build the string piece by piece based on *actual entered amounts* > 0
//     let parts = [];
//     if (actualClassFeePaid > 0) parts.push(`${actualClassFeePaid.toFixed(2)} (Class)`);
//     if (actualAdditionalFeePaid > 0) parts.push(`${actualAdditionalFeePaid.toFixed(2)} (Addl)`);
//     if (prevDues > 0) parts.push(`${prevDues.toFixed(2)} (Prev Dues)`);
//      // Add duesPaidVal if it's positive (representing an amount being paid/adjusted)
//     if (duesPaidVal > 0) parts.push(`${duesPaidVal.toFixed(2)} (Dues Paid)`); // Adjusted label for clarity
//     if (fine > 0) parts.push(`${fine.toFixed(2)} (Fine)`);

//     let calculationString = parts.length > 0 ? parts.join(' + ') : '0'; // Start with '0' if no positive parts

//     if (concession > 0) calculationString += ` - ${concession.toFixed(2)} (Conc)`;
//     // if (disc > 0) calculationString += ` - ${disc.toFixed(2)} (Disc)`; // Removed as using duesPaid now

//     // Ensure the result matches the calculation precisely
//     return `${calculationString} = ₹ ${finalTotal.toFixed(2)}`;
// }

//   return (
//     <div className="md:min-h-screen md:pl-0 md:px-0">
//       {/* Search Inputs */}
//       <div className="flex flex-col sm:flex-row gap-2 py-2 mb-2">
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
//              <div className="absolute z-10 w-full md:w-1/2 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
//                 {filteredStudents.map((student, index) => (
//                     <div // Changed to div for better structure
//                     key={student._id || index} // Use a unique key like _id if available
//                     className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                     onClick={() => handleStudentClick(student.parentId)}
//                     >
//                     <span className="font-semibold">{student.studentName || "No Name"}</span>
//                     <span className="text-sm text-gray-600">
//                         , Class: {student.class}, AdmNo: {student.admissionNumber}, Parent: {student.fatherName}
//                     </span>
//                     </div>
//                 ))}
//              </div>
//         </div>
//       )}

//       {/* Fee Creation Modal */}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Create Fees`}>
//         {/* Use a form tag here, but button type="button" unless it's the final submit */}
//         <div className="flex flex-col max-h-[80vh] "> {/* Allow vertical scroll */}
//           {/* Student Selection Area */}
//           <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto"> {/* Make this section scrollable */}
//             {parentData.map((child, index) => (
//               <div key={child._id || index} className={`bg-white rounded-lg shadow-md p-3 border ${selectedChildren.includes(index) ? 'border-blue-500' : 'border-gray-200'} h-full min-w-[300px] mb-3`}> {/* Basic styling */}
//                 {/* Child Header */}
//                 <div className="flex items-center border-b pb-2 mb-3">
//                   <input
//                     type="checkbox"
//                     id={`child-checkbox-${index}`}
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor={`child-checkbox-${index}`} className="flex-grow cursor-pointer">
//                     <span className="text-lg font-semibold text-blue-800">
//                       {child.studentName}
//                     </span>
//                     <span className="text-sm text-gray-700">
//                       {" / Class: "} {child.class}
//                       {" / Adm#: "} {child.admissionNumber}
//                     </span>
//                     <div className="flex justify-between text-sm mt-1">
//                       <span className="text-red-600 font-medium">
//                          Dues: ₹{formData[index]?.previousDues || 0}
//                       </span>
//                       {/* Display Late Fine if applicable */}
//                       {formData[index]?.lateFine > 0 && (
//                          <span className="text-orange-600 font-medium">
//                             Late Fine: ₹{formData[index]?.lateFine}
//                          </span>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {/* Conditional Form Area */}
//                 {showForm[index] && formData[index] && ( // Ensure formData[index] exists
//                   <div className="space-y-4"> {/* Add spacing between sections */}
//                     {/* --- Class Fee Section --- */}
//                     <div className="border rounded p-3 bg-gray-50">
//                       <div className="flex items-center mb-2">
//                         <input
//                           type="checkbox"
//                           id={`include-class-fee-${index}`}
//                           checked={formData[index].includeClassFee}
//                           onChange={(e) => handleInputChange( index, "includeClassFee", e.target.checked )}
//                           className="mr-2 h-4 w-4"
//                         />
//                         <label htmlFor={`include-class-fee-${index}`} className="font-semibold text-gray-700">
//                           Regular Class Fee (₹{formData[index].classFee}/month)
//                         </label>
//                       </div>
//                       {formData[index].includeClassFee && (
//                         <div className="space-y-3 pl-6">
//                            {/* Month Selector */}
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Select Months
//                             </label>
//                              <Select
//                                 options={(allMonths.filter(month => !(prevFeeMonths[child.studentId] || []).includes(month))).map(m => ({ value: m, label: m }))} // Filter out paid months for *this* student
//                                 value={formData[index].selectedMonths?.map(m => ({ value: m, label: m }))}
//                                 onChange={(selectedOptions) => handleMonthSelection(selectedOptions, index)}
//                                 isMulti
//                                 closeMenuOnSelect={false}
//                                 name={`months-class-${index}`}
//                                 className="basic-multi-select"
//                                 classNamePrefix="select"
//                                 placeholder="Select fee months..."
//                              />

//                              {/* Display Total Class Fee */}
//                             <p className="text-sm font-medium text-gray-600 mt-2">
//                                 Total Class Fee Due: ₹{formData[index].totalClassFee || 0}
//                             </p>
//                           </div>
//                           {/* Individual Month Fee Inputs */}
//                            {formData[index].selectedMonths && formData[index].selectedMonths.length > 0 && (
//                                 <div className="mt-2 border-t pt-2">
//                                     <label className="block text-xs font-medium text-gray-500 mb-1">Enter Amount Paid Per Month:</label>
//                                     <div className="flex flex-wrap gap-2">
//                                     {formData[index].selectedMonths.map( (month) => (
//                                         <div key={month} className="flex items-center gap-1 bg-gray-200 p-1 rounded text-xs">
//                                         <label htmlFor={`monthfee-${index}-${month}`} className="text-gray-700">{month}:</label>
//                                         <input
//                                             type="number"
//                                             id={`monthfee-${index}-${month}`}
//                                             className="w-16 border rounded p-1 text-xs"
//                                             value={formData[index].monthFees?.[month] ?? ''} // Use empty string if undefined/null
//                                             onChange={(e) => handleMonthFeeChange( index, month, e.target.value )}
//                                             placeholder="Amt"
//                                             min="0" // Prevent negative numbers
//                                         />
//                                         </div>
//                                     ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                       )}
//                     </div>

//                     {/* --- Additional Fees Section --- */}
//                      <div className="border rounded p-3 bg-gray-50">
//                         <div className="flex items-center mb-2">
//                            <input
//                                 type="checkbox"
//                                 id={`include-addl-fee-${index}`}
//                                 checked={formData[index].includeAdditionalFees}
//                                 onChange={(e) => handleInputChange(index, "includeAdditionalFees", e.target.checked)}
//                                 className="mr-2 h-4 w-4"
//                             />
//                             <label htmlFor={`include-addl-fee-${index}`} className="font-semibold text-gray-700">
//                                 Additional Fees
//                             </label>
//                         </div>
//                         {formData[index].includeAdditionalFees && (
//                             <div className="space-y-3 pl-6">
//                                 {/* Additional Fee Type Selector */}
//                                 <Select
//                                     isMulti
//                                     options={additionalFeesOptions} // Use state variable holding options
//                                     value={formData[index].additionalFeeValues?.map(f => ({ label: f.fee, value: f.value }))} // Map current selection back to options format
//                                     onChange={(selectedOptions) => handleAdditionalFeesChange(index, selectedOptions)}
//                                     closeMenuOnSelect={false}
//                                     className="basic-multi-select"
//                                     classNamePrefix="select"
//                                     placeholder="Select additional fee types..."
//                                 />
//                                 {/* Display Total Additional Fee */}
//                                 <p className="text-sm font-medium text-gray-600 mt-2">
//                                     Total Additional Fees Due: ₹{formData[index].additionalFee || 0}
//                                 </p>

//                                 {/* Details for each selected additional fee */}
//                                 {formData[index].additionalFeeValues?.map((feeData, feeIndex) => (
//                                     <div key={feeIndex} className="border rounded p-2 mt-2 bg-white space-y-2">
//                                         <p className="font-medium text-sm text-blue-700">{feeData.fee} (₹{feeData.value} each)</p>
//                                         {/* Month Selector for this specific fee */}
//                                         <Select
//                                             isMulti
//                                             options={allMonths.map(m => ({ value: m, label: m }))} // Assuming addl fees can apply to any month
//                                             value={feeData.selectedMonths?.map(m => ({ value: m.month, label: m.month }))}
//                                             onChange={(selectedOptions) => handleAdditionalFeeMonthSelection( index, feeIndex, selectedOptions )}
//                                             closeMenuOnSelect={false}
//                                             name={`months-addl-${index}-${feeIndex}`}
//                                             className="basic-multi-select text-xs"
//                                             classNamePrefix="select"
//                                             placeholder="Select months for this fee..."
//                                          />
//                                          {/* Inputs for Amount Paid per Month for this fee */}
//                                          {feeData.selectedMonths && feeData.selectedMonths.length > 0 && (
//                                             <div className="mt-2 border-t pt-2">
//                                                 <label className="block text-xs font-medium text-gray-500 mb-1">Enter Amount Paid Per Month (for {feeData.fee}):</label>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {feeData.selectedMonths.map((monthData) => (
//                                                         <div key={monthData.month} className="flex items-center gap-1 bg-gray-200 p-1 rounded text-xs">
//                                                             <label htmlFor={`monthfee-addl-${index}-${feeIndex}-${monthData.month}`} className="text-gray-700">{monthData.month}:</label>
//                                                             <input
//                                                                 type="number"
//                                                                 id={`monthfee-addl-${index}-${feeIndex}-${monthData.month}`}
//                                                                 className="w-16 border rounded p-1 text-xs"
//                                                                 value={monthData.value ?? ''} // Use assigned value
//                                                                 onChange={(e) => handleAdditionalFeeMonthValueChange( index, feeIndex, monthData.month, e.target.value )}
//                                                                 placeholder="Amt"
//                                                                 min="0"
//                                                             />
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                          )}
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                      </div>

//                     {/* --- Payment Details & Adjustments --- */}
//                      <div className="border rounded p-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {/* Fee Date */}
//                         <div>
//                            <label htmlFor={`feeDate-${index}`} className="block text-sm font-medium text-gray-700">Fee Date</label>
//                            <input
//                                 type="date"
//                                 id={`feeDate-${index}`}
//                                 value={formData[index].feeDate || getCurrentDate()}
//                                 onChange={(e) => handleInputChange(index, "feeDate", e.target.value)}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                             />
//                         </div>

//                         {/* Payment Mode */}
//                          <div>
//                             <label htmlFor={`paymentMode-${index}`} className="block text-sm font-medium text-gray-700">Payment Mode</label>
//                             <select
//                                 id={`paymentMode-${index}`}
//                                 value={formData[index].paymentMode || "Cash"}
//                                 onChange={(e) => handleInputChange( index, "paymentMode", e.target.value )}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1.5"
//                             >
//                                 <option value="Cash">Cash</option>
//                                 <option value="Online">Online</option>
//                                 <option value="Cheque">Cheque</option>
//                             </select>
//                          </div>

//                         {/* Transaction ID (Conditional) */}
//                          {formData[index].paymentMode === "Online" && (
//                             <div>
//                                 <label htmlFor={`transactionId-${index}`} className="block text-sm font-medium text-gray-700">Transaction ID</label>
//                                 <input
//                                     type="text"
//                                     id={`transactionId-${index}`}
//                                     value={formData[index].transactionId || ""}
//                                     onChange={(e) => handleInputChange( index, "transactionId", e.target.value )}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                     placeholder="Enter online transaction ID"
//                                 />
//                             </div>
//                          )}

//                         {/* Cheque No (Conditional) */}
//                          {formData[index].paymentMode === "Cheque" && (
//                              <div>
//                                 <label htmlFor={`chequeNo-${index}`} className="block text-sm font-medium text-gray-700">Cheque Number</label>
//                                 <input
//                                     type="text"
//                                     id={`chequeNo-${index}`}
//                                     value={formData[index].chequeBookNo || ""} // Field name corrected in state
//                                     onChange={(e) => handleInputChange( index, "chequeBookNo", e.target.value )} // Update correct state field
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                     placeholder="Enter cheque number"
//                                 />
//                             </div>
//                          )}

//                         {/* Late Fine (Display/Input) */}
//                          <div>
//                            <label htmlFor={`lateFine-${index}`} className="block text-sm font-medium text-gray-700">Late Fine Amount</label>
//                            <input
//                                 type="number"
//                                 id={`lateFine-${index}`}
//                                 placeholder="Auto/Manual Fine"
//                                 value={formData[index].lateFine ?? ''} // Use ?? for null/undefined check
//                                 onChange={(e) => handleInputChange( index, "lateFine", e.target.value )} // Allow override if needed
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 min="0"
//                             />
//                         </div>

//                         {/* Concession */}
//                         <div>
//                            <label htmlFor={`concession-${index}`} className="block text-sm font-medium text-gray-700">Concession Amount</label>
//                            <input
//                                 type="number"
//                                 id={`concession-${index}`}
//                                 placeholder="Enter concession"
//                                 value={formData[index].concessionFee ?? ''}
//                                 onChange={(e) => handleInputChange( index, "concessionFee", e.target.value )}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 min="0"
//                             />
//                         </div>

//                          {/* Discount - NEW FIELD */}
//                         <div>
//                            <label htmlFor={`duesPaid-${index}`} className="block text-sm font-medium text-gray-700">Past Dues </label>
//                            <input
//                                 type="number"
//                                 id={`duesPaid-${index}`}
//                                 placeholder="Enter duesPaid"
//                                 value={formData[index].duesPaid ?? ''} // Use discount from state
//                                 onChange={(e) => handleInputChange( index, "duesPaid", e.target.value )} // Update discount state
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 min="0"
//                             />
//                         </div>

//                         {/* Remarks (span across cols potentially) */}
//                         <div className="sm:col-span-2">
//                            <label htmlFor={`remarks-${index}`} className="block text-sm font-medium text-gray-700">Remarks</label>
//                            <textarea
//                                 id={`remarks-${index}`}
//                                 value={formData[index].remarks || ""}
//                                 onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 rows="2"
//                                 placeholder="Optional remarks..."
//                             />
//                         </div>

//                         {/* Total Calculation Display (span across cols) */}
//                         <div className="sm:col-span-2 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
//                             <label className="block text-sm font-medium text-gray-800">Calculation:</label>
//                             <p className="text-sm text-blue-900 break-words">{formatTotalString(index)}</p>
//                             <label className="block text-lg font-semibold text-blue-900 mt-1">
//                                 Net Amount Payable: ₹ {calculateTotalForChild(index).toFixed(2)}
//                              </label>
//                         </div>

//                      </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Modal Action Buttons */}
//            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0">
//             <button
//               type="button" // Important: prevent default form submission
//               onClick={handleSubmit} // Trigger explicit submit handler
//               // disabled={selectedChildren.length === 0 || setIsLoader} // Disable if no selection or loading
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//             >
//               {'Submit Fees'}
//               {/* {setIsLoader ? 'Submitting...' : 'Submit Fees'} */}
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

//       {/* Fee History Table */}
//       <Table reLoad={reLoad} />
//     </div>
//   );
// };

// export default CreateFees;



// import axios from "axios";
// import React, { useEffect, useState } from "react";
// // import Cookies from "js-cookie"; // Not used, can be removed unless needed elsewhere
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import { ActiveStudents, feesfeeHistory, getMonthlyDues, LateFines, parentandchildwithID } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   // const [isOpen, setIsOpen] = useState(false); // isOpen seems redundant if modalOpen is used
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]); // Renamed for clarity
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [prevFeeMonths, setPrevFeeMonths] = useState({}); // Store previous months per studentId
//   const [studentFeeHistory, setStudentFeeHistory] = useState([]);
//   const [allLateFines, setAllLateFines] = useState([]); // Store all late fine rules

//   // --- State for formData ---
//   // Initialize formData structure within handleStudentClick
//   const [formData, setFormData] = useState([]);

//   const authToken = localStorage.getItem("token");

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   // --- Fetch Initial Data ---
//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//       } else {
//         console.warn("No student data found in ActiveStudents response:", response);
//         setAllStudent([]);
//       }
//     } catch (error) {
//       console.error("Error fetching active students:", error);
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   const getFeeHistory = async () => {
//     try {
//       const response = await feesfeeHistory();
//       if (response?.success) {
//         setStudentFeeHistory(response.data);
//         // Process fee history to easily get paid months per student
//         const paidMonthsMap = {};
//         response.data.forEach(history => {
//           const paidMonths = history.regularFees
//             ?.find(fee => fee.status === "Paid")
//             // ?.filter(fee => fee.status === "Paid")
//             .map(fee => fee.month) || [];
//           paidMonthsMap[history.studentId] = paidMonths;
//         });
//         setPrevFeeMonths(paidMonthsMap);

//       } else {
//         toast.error(response?.message || "Failed to get fee history.");
//         setStudentFeeHistory([]);
//          setPrevFeeMonths({});
//       }
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//       toast.error("Error fetching fee history.");
//         setStudentFeeHistory([]);
//         setPrevFeeMonths({});
//     }
//   };

//  const getLateFinesData = async () => {
//     try {
//       const response = await LateFines();
//       if (response?.success) {
//         setAllLateFines(response.data || []);
//       } else {
//         toast.error(response?.message || "Failed to get late fine data.");
//         setAllLateFines([]);
//       }
//     } catch (error) {
//       console.error("Error fetching late fines:", error);
//       toast.error("Error fetching late fines.");
//       setAllLateFines([]);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//     getFeeHistory();
//     getLateFinesData(); // Fetch all late fines once
//   }, []);

//   // --- Search Handlers ---
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

//   // --- Modal and Student Selection ---
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         // Initialize formData with default values for each child
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           studentId: child.studentId, // Store studentId for easier lookup
//           className: child.class,     // Store class name
//           classFee: 0,               // Will be fetched later if needed
//           feeAmount: "",             // Seems unused, consider removing
//           selectedMonths: [],
//           monthFees: {},             // To store fee amount per selected month
//           totalClassFee: 0,
//           feeDate: getCurrentDate(),
//           paymentMode: "Cash",
//           selectedAdditionalFees: [], // Seems unused, additionalFeeValues is used
//           additionalFeeValues: [],   // Stores selected additional fees { fee, value, selectedMonths, totalFee }
//           additionalFee: 0,          // Total of selected additional fees
//           amountSubmitted: 0,        // Seems unused, consider removing
//           previousDues: child.dues || 0,
//           concessionFee: "",         // Initialize concession
//           duesPaid: "",              // Initialize discount
//           lateFine: 0,               // Initialize lateFine (will be fetched)
//           remarks: "",
//           transactionId: "",
//           chequeBookNo: "",          // Specific to Cheque payment
//           includeClassFee: false,    // Control visibility of class fee section
//           includeAdditionalFees: false, // Control visibility of additional fee section
//         }));

//         setFormData(initialFormData);
//         // Reset selections for the new modal instance
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false));
//         setModalOpen(true);
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       console.error("Error fetching parent/child data:", error);
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm(""); // Clear search terms after selection
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]); // Hide dropdown
//     }
//   };

//   // --- Child Selection within Modal ---
//   const handleChildSelection = async (child, index) => { // Make async to handle potential async operations
//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (isCurrentlySelected) {
//       // Deselecting
//       const TobeRemovedindex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(TobeRemovedindex, 1);
//       updatedShowForm[index] = false;
//     } else {
//       // Selecting
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;

//       // --- Fetch data specific to this child when selected ---
//        setIsLoader(true); // Show loader while fetching fees/fines
//       try {
//         const studentClass = child.class;
//         const studentId = child.studentId;
// const monthdues=await getMonthlyDues(studentId,session)
// console.log("monthdues",monthdues)
//          // 1. Determine Late Fine for this child's class
//         const applicableFine = allLateFines.find(fineRule => fineRule.className === studentClass)?.amount || 0;

//         // 2. Fetch Additional Fee Options for this child's class (if not already fetched globally)
//         // Using axios directly here, consider moving to Network/AdminApi if preferred
//         const additionalFeesResponse = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         const feesData = additionalFeesResponse?.data?.data
//           ?.filter((feeType) => feeType.className === studentClass)
//           .map((fee) => ({
//             label: fee.name ? `${fee.name}` : "Unknown Fee",
//             value: fee.amount || 0, // Store amount directly in value
//             id: fee._id, // Keep id if needed
//           })) || [];
//         setAdditionalFeesOptions(feesData); // Set options for the dropdown

//         // 3. Fetch Regular Class Fee Amount
//          const classFeeResponse = await axios.get(`https://dvsserver.onrender.com/api/v1/adminRoute/fees`, {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           });
//          const feeTypeArray = classFeeResponse?.data?.data;
//          const studentFeeAmount = Array.isArray(feeTypeArray)
//             ? feeTypeArray.find(feeType => feeType.className === studentClass)?.amount || 0
//             : 0;

//         // Update formData for the selected child
//         const updatedFormData = [...formData];
//         updatedFormData[index] = {
//             ...updatedFormData[index],
//             lateFine: applicableFine, // Set fetched late fine
//             classFee: studentFeeAmount, // Set fetched class fee amount
//             // Reset dependent fields when selecting (optional, but can prevent stale data)
//             // selectedMonths: [],
//             // totalClassFee: 0,
//             // additionalFeeValues: [],
//             // additionalFee: 0,
//         };
//         setFormData(updatedFormData);

//       } catch (error) {
//           console.error("Error fetching fee details for child:", error);
//           toast.error(`Failed to fetch fee details for ${child.studentName}.`);
//            // Deselect if fetching fails? Or allow proceeding with defaults?
//            // For now, keep selected but show error.
//       } finally {
//           setIsLoader(false);
//       }
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   // --- Form Input Handlers ---

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setFormData(updatedFormData);
//   };

//   // --- Month Selection Handlers ---
//   const allMonths = [ "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const studentId = formData[childIndex]?.studentId;
//     const currentPrevFeeMonths = prevFeeMonths[studentId] || []; // Get paid months for *this* student

//     // Available months are allMonths excluding the ones already paid by this student
//     const availableMonthsForStudent = allMonths.filter(
//       (month) => !currentPrevFeeMonths.includes(month)
//     );

//     const selectedMonthValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
//     const updatedFormData = [...formData];

//     if (!updatedFormData[childIndex].monthFees) {
//       updatedFormData[childIndex].monthFees = {};
//     }

//     // --- Sequential Check ---
//     if (selectedMonthValues.length > 0) {
//         const sortedSelectedMonths = selectedMonthValues.sort(
//           (a, b) => availableMonthsForStudent.indexOf(a) - availableMonthsForStudent.indexOf(b)
//         );

//         const firstAvailableMonth = availableMonthsForStudent[0];
//         const firstSelectedMonth = sortedSelectedMonths[0];

//         // Check 1: Must start with the first available month if any month is selected
//         if (firstSelectedMonth !== firstAvailableMonth) {
//              toast.warn(`Selection must start from the first due month: ${firstAvailableMonth}`);
//              // Optionally revert selection or just prevent update
//              return; // Stop update if sequence is broken at the start
//         }

//         // Check 2: Check for gaps in the selected sequence relative to available months
//         const lastSelectedIndex = availableMonthsForStudent.indexOf(sortedSelectedMonths[sortedSelectedMonths.length - 1]);
//         const expectedSequence = availableMonthsForStudent.slice(0, lastSelectedIndex + 1);

//         const isSequential = expectedSequence.every(month => sortedSelectedMonths.includes(month));

//         if (!isSequential) {
//             toast.warn("Fee months must be selected sequentially without gaps.");
//             // Optionally revert selection or just prevent update
//              return; // Stop update if sequence has gaps
//         }
//     }
//      // --- End Sequential Check ---

//     // Update monthFees based on current selection
//     const newMonthFees = {};
//     selectedMonthValues.forEach((month) => {
//         // Keep existing value if present, otherwise default to classFee
//         newMonthFees[month] = updatedFormData[childIndex].monthFees[month] ?? (updatedFormData[childIndex].classFee || 0);
//     });


//     updatedFormData[childIndex].selectedMonths = selectedMonthValues; // Store the values ['April', 'May']
//     updatedFormData[childIndex].monthFees = newMonthFees; // Update the fee map
//     updatedFormData[childIndex].totalClassFee =
//       (updatedFormData[childIndex].classFee || 0) * selectedMonthValues.length;

//     setFormData(updatedFormData);
//   };


//    const handleMonthFeeChange = (index, month, value) => {
//     const updatedFormData = [...formData];
//     if (updatedFormData[index] && updatedFormData[index].monthFees) {
//         updatedFormData[index].monthFees[month] = parseFloat(value) || 0; // Ensure it's a number
//         // No need to recalculate totalClassFee here, it's based on count * classFee
//         setFormData(updatedFormData);
//     }
//   };


//   // --- Additional Fees Handlers ---

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedValues = selectedOptions ? selectedOptions.map(option => ({
//         fee: option.label, // Name of the fee
//         value: option.value, // Amount per month/instance for this fee
//         selectedMonths: [], // Months selected *for this specific fee*
//         monthFees: {}, // Amount paid per month *for this specific fee*
//         totalFee: 0, // Total calculated for this fee based on selected months
//     })) : [];


//     // Calculate the initial total based on potentially pre-selected months (though usually starts empty)
//      const totalAdditionalFee = selectedValues.reduce((total, fee) => {
//         return total + (fee.totalFee || 0); // Sum up totals of each selected additional fee
//      }, 0);


//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//         ...updatedFormData[index],
//         additionalFee: totalAdditionalFee, // Update total additional fee amount
//         additionalFeeValues: selectedValues, // Replace the list of selected additional fees
//     };
//     setFormData(updatedFormData);
// };


//  const handleAdditionalFeeMonthSelection = (index, feeIndex, selectedOptions) => {
//     const selectedMonthsData = selectedOptions ? selectedOptions.map(option => ({
//         month: option.value, // e.g., "April"
//         value: formData[index].additionalFeeValues[feeIndex].value // Default value for this fee type
//     })) : [];

//     const updatedFormData = [...formData];
//     const currentFee = updatedFormData[index].additionalFeeValues[feeIndex];

//     // Update selected months for *this specific* additional fee
//     currentFee.selectedMonths = selectedMonthsData;

//     // Calculate total for *this specific* additional fee
//     currentFee.totalFee = currentFee.value * selectedMonthsData.length;

//     // Recalculate the overall total additional fee for the student
//     const newTotalAdditionalFee = updatedFormData[index].additionalFeeValues.reduce((sum, fee) => {
//         return sum + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = newTotalAdditionalFee;

//     setFormData(updatedFormData);
// };

// // Allow editing the amount for a specific month of a specific additional fee
// const handleAdditionalFeeMonthValueChange = (index, feeIndex, month, newValue) => {
//     const updatedFormData = [...formData];
//     const feeEntry = updatedFormData[index]?.additionalFeeValues?.[feeIndex];
//     if (!feeEntry) return;

//     const monthEntry = feeEntry.selectedMonths?.find(m => m.month === month);
//     if (monthEntry) {
//         monthEntry.value = parseFloat(newValue) || 0; // Update the value for that specific month
//     }
//   feeEntry.totalFee = feeEntry.selectedMonths.reduce((sum, m) => sum + (m.value || 0), 0);


//     // Recalculate the overall total additional fee for the student
//     const newTotalAdditionalFee = updatedFormData[index].additionalFeeValues.reduce((sum, fee) => {
//         return sum + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = newTotalAdditionalFee;

//     setFormData(updatedFormData);
// };

//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       setIsLoader(true); // Start loader
  
//       let errorsFound = false;
//       const feePromises = []; // Store promises for API calls
  
//       if (selectedChildren.length === 0) {
//            toast.warn("Please select at least one student and fill their fee details.");
//            setIsLoader(false);
//            return;
//        }
  
  
//       for (const childIndex of selectedChildren) {
//         const child = parentData[childIndex];
//         const childFormData = formData[childIndex];
  
//         // Basic Validations
//          if (!childFormData.paymentMode) {
//           toast.error(`Payment mode is required for ${child.studentName}`);
//           errorsFound = true;
//           continue;
//         }
//          if (childFormData.paymentMode === "Online" && !childFormData.transactionId) {
//              toast.error(`Transaction ID is required for Online payment for ${child.studentName}`);
//              errorsFound = true;
//              continue;
//          }
//          if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
//              toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}`);
//              errorsFound = true;
//              continue;
//          }
//           // Validation: Ensure numeric inputs are valid numbers (optional but recommended)
//           const concessionVal = parseFloat(childFormData.concessionFee);
//           const duesPaidVal = parseFloat(childFormData.duesPaid);
//           const lateFineVal = parseFloat(childFormData.lateFine);
  
//           if (isNaN(concessionVal) && childFormData.concessionFee !== "" && childFormData.concessionFee !== null) {
//                toast.error(`Invalid Concession amount for ${child.studentName}`);
//                errorsFound = true;
//                continue;
//           }
//            if (isNaN(duesPaidVal) && childFormData.duesPaid !== "" && childFormData.duesPaid !== null) {
//                toast.error(`Invalid Dues Paid amount for ${child.studentName}`);
//                errorsFound = true;
//                continue;
//            }
//            if (isNaN(lateFineVal) && childFormData.lateFine !== "" && childFormData.lateFine !== null) {
//                toast.error(`Invalid Late Fine amount for ${child.studentName}`);
//                errorsFound = true;
//                continue;
//            }
  
  
//         // --- Prepare Payload Data ---
  
//         // 1. Regular Fees (Based on actual entered amounts per month)
//         const regularFeesPayload = childFormData.includeClassFee
//           ? (childFormData.selectedMonths || []).map(month => ({
//               month: month,
//               paidAmount: Number(childFormData.monthFees?.[month]) || 0,
//               // status: "Pending" // Backend likely determines status
//             }))
//           : []; // Empty array if class fee checkbox is off
  
//         // 2. Additional Fees (Based on actual entered amounts per month per fee)
//           const additionalFeesPayload = childFormData.includeAdditionalFees
//             ? (childFormData.additionalFeeValues || []).flatMap(feeData => {
//                 return (feeData.selectedMonths || []).map(monthData => ({
//                     name: feeData.fee,
//                     month: monthData.month,
//                     paidAmount: Number(monthData.value) || 0,
//                     // status: "Pending" // Backend likely determines status
//                 }));
//               })
//             : []; // Empty array if additional fee checkbox is off
  
  
//          // 3. Calculate Net Amount Payable using the updated function
//          // This function now sums the actual *entered* amounts for fees
//          const netAmountPayable = calculateTotalForChild(childIndex);
  
//         // --- Construct the final payload for the API ---
//         const newFeeData = {
//           studentId: child.studentId,
//           session: session, // Assuming session is available in scope
//           paymentDetails: {
//             regularFees: regularFeesPayload,
//             additionalFees: additionalFeesPayload,
//             paymentMode: childFormData.paymentMode,
//             feeDate: childFormData.feeDate || getCurrentDate(),
//             transactionId: childFormData.paymentMode === "Online" ? childFormData.transactionId : "", // Send only if Online
//             // chequeNo: childFormData.paymentMode === "Cheque" ? childFormData.chequeBookNo : null,      // Send only if Cheque
//             lateFinesPaid: parseFloat(childFormData.lateFine) || 0, // Use entered late fine
//             concession: parseFloat(childFormData.concessionFee) || 0, // Use entered concession
//             pastDuesPaid: parseFloat(childFormData.duesPaidVal) || 0, // Use the value from the 'Dues Amount' input field
//             // pastDuesPaid: parseFloat(childFormData.previousDues) || 0, // Use the value from the 'Dues Amount' input field
//             totalAmount: netAmountPayable, // Use the final calculated amount
//             remark: childFormData.remarks || "",
//              },
//         };
  
//         // Push the API call promise to the array
//         feePromises.push(
//           axios.post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus", // Use your correct endpoint
//             newFeeData,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then(response => ({ success: true, studentName: child.studentName, message: response.data.message }))
//           .catch(error => ({
//               success: false,
//               studentName: child.studentName,
//               message: error.response?.data?.message || error.response?.data?.error || "Server error"
//           }))
//         );
//       } // End loop through selectedChildren
  
//        if (errorsFound) {
//           setIsLoader(false);
//           // toast.error("Please fix the errors before submitting."); // Specific errors already shown
//           return; // Stop submission if validation errors occurred
//       }
  
//       // --- Process all API calls ---
//       try {
//           const results = await Promise.all(feePromises);
//           let allSuccess = true;
  
//           results.forEach(result => {
//               if (result.success) {
//                   toast.success(`Fee created for ${result.studentName}: ${result.message || 'Success'}`);
//               } else {
//                   toast.error(`Error creating fee for ${result.studentName}: ${result.message}`);
//                   allSuccess = false;
//               }
//           });
  
//           if (allSuccess) {
//               setModalOpen(false); // Close modal only if all succeed
//               setReload(prev => !prev); // Trigger table reload
//               getFeeHistory(); // Refresh fee history to update paid months
//               // Consider resetting formData here if needed
//           }
//            // Handle partial success/failure if needed
//       } catch (error) {
//           console.error("Error submitting fee data:", error);
//           toast.error("An unexpected error occurred during submission.");
//       } finally {
//         setIsLoader(false); // Stop loader regardless of outcome
//       }
//     };

//   const calculateTotalForChild = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     // Calculate actual sum from entered regular month fees
//     let actualClassFeePaid = 0;
//     if (data.includeClassFee && data.selectedMonths && data.monthFees) {
//         actualClassFeePaid = data.selectedMonths.reduce((sum, month) => {
//             return sum + (Number(data.monthFees[month]) || 0);
//         }, 0);
//     }

//     // Calculate actual sum from entered additional fee month fees
//     let actualAdditionalFeePaid = 0;
//     if (data.includeAdditionalFees && data.additionalFeeValues) {
//         actualAdditionalFeePaid = data.additionalFeeValues.reduce((totalSum, feeData) => {
//             const feeMonthSum = (feeData.selectedMonths || []).reduce((monthSum, monthData) => {
//                 return monthSum + (Number(monthData.value) || 0);
//             }, 0);
//             return totalSum + feeMonthSum;
//         }, 0);
//     }

//     // Other components (ensure they are numbers, default to 0)
//     const prevDues = parseFloat(data.previousDues) || 0;
//     const fine = parseFloat(data.lateFine) || 0;
//     const concession = parseFloat(data.concessionFee) || 0;
//     const duesPaid = parseFloat(data.duesPaid) || 0; // This seems like it should reduce the total, but following your formula for now. Or is it amount being paid towards past dues? Naming is a bit ambiguous. Let's assume it's an adjustment to be *added* as per your previous formula structure.

//     // Final Calculation based on entered amounts and adjustments
//     // Formula seems to be: ClassFee + AddlFee + PrevDues + DuesPaid + Fine - Concession
//     const total = actualClassFeePaid + actualAdditionalFeePaid + prevDues + duesPaid + fine - concession;

//     // Ensure total is not negative, although it might be possible with large concessions
//     return total < 0 ? 0 : total;
// };
 
//   const formatTotalString = (index) => {
//     const data = formData[index];
//     if (!data) return "₹ 0";

//     // Calculate actual sum from entered regular month fees
//     let actualClassFeePaid = 0;
//     if (data.includeClassFee && data.selectedMonths && data.monthFees) {
//         actualClassFeePaid = data.selectedMonths.reduce((sum, month) => {
//             return sum + (Number(data.monthFees[month]) || 0);
//         }, 0);
//     }

//     // Calculate actual sum from entered additional fee month fees
//     let actualAdditionalFeePaid = 0;
//     if (data.includeAdditionalFees && data.additionalFeeValues) {
//         actualAdditionalFeePaid = data.additionalFeeValues.reduce((totalSum, feeData) => {
//             const feeMonthSum = (feeData.selectedMonths || []).reduce((monthSum, monthData) => {
//                 return monthSum + (Number(monthData.value) || 0);
//             }, 0);
//             return totalSum + feeMonthSum;
//         }, 0);
//     }

//     // Other components
//     const prevDues = parseFloat(data.previousDues) || 0;
//     const fine = parseFloat(data.lateFine) || 0;
//     const concession = parseFloat(data.concessionFee) || 0;
//     // const disc = parseFloat(data.discount) || 0; // Original formatTotalString had 'disc', but state used 'duesPaid'. Using duesPaid.
//     const duesPaidVal = parseFloat(data.duesPaid) || 0; // Using the value from the 'Dues Amount' input

//     // Calculate final total using the updated calculateTotalForChild function
//     const finalTotal = calculateTotalForChild(index);

//     // Build the string piece by piece based on *actual entered amounts* > 0
//     let parts = [];
//     if (actualClassFeePaid > 0) parts.push(`${actualClassFeePaid.toFixed(2)} (Class)`);
//     if (actualAdditionalFeePaid > 0) parts.push(`${actualAdditionalFeePaid.toFixed(2)} (Addl)`);
//     if (prevDues > 0) parts.push(`${prevDues.toFixed(2)} (Prev Dues)`);
//      // Add duesPaidVal if it's positive (representing an amount being paid/adjusted)
//     if (duesPaidVal > 0) parts.push(`${duesPaidVal.toFixed(2)} (Dues Paid)`); // Adjusted label for clarity
//     if (fine > 0) parts.push(`${fine.toFixed(2)} (Fine)`);

//     let calculationString = parts.length > 0 ? parts.join(' + ') : '0'; // Start with '0' if no positive parts

//     if (concession > 0) calculationString += ` - ${concession.toFixed(2)} (Conc)`;
//     // if (disc > 0) calculationString += ` - ${disc.toFixed(2)} (Disc)`; // Removed as using duesPaid now

//     // Ensure the result matches the calculation precisely
//     return `${calculationString} = ₹ ${finalTotal.toFixed(2)}`;
// }

//   return (
//     <div className="md:min-h-screen md:pl-0 md:px-0">
//       {/* Search Inputs */}
//       <div className="flex flex-col sm:flex-row gap-2 py-2 mb-2">
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
//              <div className="absolute z-10 w-full md:w-1/2 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
//                 {filteredStudents.map((student, index) => (
//                     <div // Changed to div for better structure
//                     key={student._id || index} // Use a unique key like _id if available
//                     className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                     onClick={() => handleStudentClick(student.parentId)}
//                     >
//                     <span className="font-semibold">{student.studentName || "No Name"}</span>
//                     <span className="text-sm text-gray-600">
//                         , Class: {student.class}, AdmNo: {student.admissionNumber}, Parent: {student.fatherName}
//                     </span>
//                     </div>
//                 ))}
//              </div>
//         </div>
//       )}

//       {/* Fee Creation Modal */}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Create Fees`}>
//         {/* Use a form tag here, but button type="button" unless it's the final submit */}
//         <div className="flex flex-col max-h-[80vh] "> {/* Allow vertical scroll */}
//           {/* Student Selection Area */}
//           <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto"> {/* Make this section scrollable */}
//             {parentData.map((child, index) => (
//               <div key={child._id || index} className={`bg-white rounded-lg shadow-md p-3 border ${selectedChildren.includes(index) ? 'border-blue-500' : 'border-gray-200'} h-full min-w-[300px] mb-3`}> {/* Basic styling */}
//                 {/* Child Header */}
//                 <div className="flex items-center border-b pb-2 mb-3">
//                   <input
//                     type="checkbox"
//                     id={`child-checkbox-${index}`}
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor={`child-checkbox-${index}`} className="flex-grow cursor-pointer">
//                     <span className="text-lg font-semibold text-blue-800">
//                       {child.studentName}
//                     </span>
//                     <span className="text-sm text-gray-700">
//                       {" / Class: "} {child.class}
//                       {" / Adm#: "} {child.admissionNumber}
//                     </span>
//                     <div className="flex justify-between text-sm mt-1">
//                       <span className="text-red-600 font-medium">
//                          Dues: ₹{formData[index]?.previousDues || 0}
//                       </span>
//                       {/* Display Late Fine if applicable */}
//                       {formData[index]?.lateFine > 0 && (
//                          <span className="text-orange-600 font-medium">
//                             Late Fine: ₹{formData[index]?.lateFine}
//                          </span>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {/* Conditional Form Area */}
//                 {showForm[index] && formData[index] && ( // Ensure formData[index] exists
//                   <div className="space-y-4"> {/* Add spacing between sections */}
//                     {/* --- Class Fee Section --- */}
//                     <div className="border rounded p-3 bg-gray-50">
//                       <div className="flex items-center mb-2">
//                         <input
//                           type="checkbox"
//                           id={`include-class-fee-${index}`}
//                           checked={formData[index].includeClassFee}
//                           onChange={(e) => handleInputChange( index, "includeClassFee", e.target.checked )}
//                           className="mr-2 h-4 w-4"
//                         />
//                         <label htmlFor={`include-class-fee-${index}`} className="font-semibold text-gray-700">
//                           Regular Class Fee (₹{formData[index].classFee}/month)
//                         </label>
//                       </div>
//                       {formData[index].includeClassFee && (
//                         <div className="space-y-3 pl-6">
//                            {/* Month Selector */}
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Select Months
//                             </label>
//                              <Select
//                                 options={(allMonths.filter(month => !(prevFeeMonths[child.studentId] || []).includes(month))).map(m => ({ value: m, label: m }))} // Filter out paid months for *this* student
//                                 value={formData[index].selectedMonths?.map(m => ({ value: m, label: m }))}
//                                 onChange={(selectedOptions) => handleMonthSelection(selectedOptions, index)}
//                                 isMulti
//                                 closeMenuOnSelect={false}
//                                 name={`months-class-${index}`}
//                                 className="basic-multi-select"
//                                 classNamePrefix="select"
//                                 placeholder="Select fee months..."
//                              />

//                              {/* Display Total Class Fee */}
//                             <p className="text-sm font-medium text-gray-600 mt-2">
//                                 Total Class Fee Due: ₹{formData[index].totalClassFee || 0}
//                             </p>
//                           </div>
//                           {/* Individual Month Fee Inputs */}
//                            {formData[index].selectedMonths && formData[index].selectedMonths.length > 0 && (
//                                 <div className="mt-2 border-t pt-2">
//                                     <label className="block text-xs font-medium text-gray-500 mb-1">Enter Amount Paid Per Month:</label>
//                                     <div className="flex flex-wrap gap-2">
//                                     {formData[index].selectedMonths.map( (month) => (
//                                         <div key={month} className="flex items-center gap-1 bg-gray-200 p-1 rounded text-xs">
//                                         <label htmlFor={`monthfee-${index}-${month}`} className="text-gray-700">{month}:</label>
//                                         <input
//                                             type="number"
//                                             id={`monthfee-${index}-${month}`}
//                                             className="w-16 border rounded p-1 text-xs"
//                                             value={formData[index].monthFees?.[month] ?? ''} // Use empty string if undefined/null
//                                             onChange={(e) => handleMonthFeeChange( index, month, e.target.value )}
//                                             placeholder="Amt"
//                                             min="0" // Prevent negative numbers
//                                         />
//                                         </div>
//                                     ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                       )}
//                     </div>

//                     {/* --- Additional Fees Section --- */}
//                      <div className="border rounded p-3 bg-gray-50">
//                         <div className="flex items-center mb-2">
//                            <input
//                                 type="checkbox"
//                                 id={`include-addl-fee-${index}`}
//                                 checked={formData[index].includeAdditionalFees}
//                                 onChange={(e) => handleInputChange(index, "includeAdditionalFees", e.target.checked)}
//                                 className="mr-2 h-4 w-4"
//                             />
//                             <label htmlFor={`include-addl-fee-${index}`} className="font-semibold text-gray-700">
//                                 Additional Fees
//                             </label>
//                         </div>
//                         {formData[index].includeAdditionalFees && (
//                             <div className="space-y-3 pl-6">
//                                 {/* Additional Fee Type Selector */}
//                                 <Select
//                                     isMulti
//                                     options={additionalFeesOptions} // Use state variable holding options
//                                     value={formData[index].additionalFeeValues?.map(f => ({ label: f.fee, value: f.value }))} // Map current selection back to options format
//                                     onChange={(selectedOptions) => handleAdditionalFeesChange(index, selectedOptions)}
//                                     closeMenuOnSelect={false}
//                                     className="basic-multi-select"
//                                     classNamePrefix="select"
//                                     placeholder="Select additional fee types..."
//                                 />
//                                 {/* Display Total Additional Fee */}
//                                 <p className="text-sm font-medium text-gray-600 mt-2">
//                                     Total Additional Fees Due: ₹{formData[index].additionalFee || 0}
//                                 </p>

//                                 {/* Details for each selected additional fee */}
//                                 {formData[index].additionalFeeValues?.map((feeData, feeIndex) => (
//                                     <div key={feeIndex} className="border rounded p-2 mt-2 bg-white space-y-2">
//                                         <p className="font-medium text-sm text-blue-700">{feeData.fee} (₹{feeData.value} each)</p>
//                                         {/* Month Selector for this specific fee */}
//                                         <Select
//                                             isMulti
//                                             options={allMonths.map(m => ({ value: m, label: m }))} // Assuming addl fees can apply to any month
//                                             value={feeData.selectedMonths?.map(m => ({ value: m.month, label: m.month }))}
//                                             onChange={(selectedOptions) => handleAdditionalFeeMonthSelection( index, feeIndex, selectedOptions )}
//                                             closeMenuOnSelect={false}
//                                             name={`months-addl-${index}-${feeIndex}`}
//                                             className="basic-multi-select text-xs"
//                                             classNamePrefix="select"
//                                             placeholder="Select months for this fee..."
//                                          />
//                                          {/* Inputs for Amount Paid per Month for this fee */}
//                                          {feeData.selectedMonths && feeData.selectedMonths.length > 0 && (
//                                             <div className="mt-2 border-t pt-2">
//                                                 <label className="block text-xs font-medium text-gray-500 mb-1">Enter Amount Paid Per Month (for {feeData.fee}):</label>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {feeData.selectedMonths.map((monthData) => (
//                                                         <div key={monthData.month} className="flex items-center gap-1 bg-gray-200 p-1 rounded text-xs">
//                                                             <label htmlFor={`monthfee-addl-${index}-${feeIndex}-${monthData.month}`} className="text-gray-700">{monthData.month}:</label>
//                                                             <input
//                                                                 type="number"
//                                                                 id={`monthfee-addl-${index}-${feeIndex}-${monthData.month}`}
//                                                                 className="w-16 border rounded p-1 text-xs"
//                                                                 value={monthData.value ?? ''} // Use assigned value
//                                                                 onChange={(e) => handleAdditionalFeeMonthValueChange( index, feeIndex, monthData.month, e.target.value )}
//                                                                 placeholder="Amt"
//                                                                 min="0"
//                                                             />
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                          )}
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                      </div>

//                     {/* --- Payment Details & Adjustments --- */}
//                      <div className="border rounded p-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {/* Fee Date */}
//                         <div>
//                            <label htmlFor={`feeDate-${index}`} className="block text-sm font-medium text-gray-700">Fee Date</label>
//                            <input
//                                 type="date"
//                                 id={`feeDate-${index}`}
//                                 value={formData[index].feeDate || getCurrentDate()}
//                                 onChange={(e) => handleInputChange(index, "feeDate", e.target.value)}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                             />
//                         </div>

//                         {/* Payment Mode */}
//                          <div>
//                             <label htmlFor={`paymentMode-${index}`} className="block text-sm font-medium text-gray-700">Payment Mode</label>
//                             <select
//                                 id={`paymentMode-${index}`}
//                                 value={formData[index].paymentMode || "Cash"}
//                                 onChange={(e) => handleInputChange( index, "paymentMode", e.target.value )}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1.5"
//                             >
//                                 <option value="Cash">Cash</option>
//                                 <option value="Online">Online</option>
//                                 <option value="Cheque">Cheque</option>
//                             </select>
//                          </div>

//                         {/* Transaction ID (Conditional) */}
//                          {formData[index].paymentMode === "Online" && (
//                             <div>
//                                 <label htmlFor={`transactionId-${index}`} className="block text-sm font-medium text-gray-700">Transaction ID</label>
//                                 <input
//                                     type="text"
//                                     id={`transactionId-${index}`}
//                                     value={formData[index].transactionId || ""}
//                                     onChange={(e) => handleInputChange( index, "transactionId", e.target.value )}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                     placeholder="Enter online transaction ID"
//                                 />
//                             </div>
//                          )}

//                         {/* Cheque No (Conditional) */}
//                          {formData[index].paymentMode === "Cheque" && (
//                              <div>
//                                 <label htmlFor={`chequeNo-${index}`} className="block text-sm font-medium text-gray-700">Cheque Number</label>
//                                 <input
//                                     type="text"
//                                     id={`chequeNo-${index}`}
//                                     value={formData[index].chequeBookNo || ""} // Field name corrected in state
//                                     onChange={(e) => handleInputChange( index, "chequeBookNo", e.target.value )} // Update correct state field
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                     placeholder="Enter cheque number"
//                                 />
//                             </div>
//                          )}

//                         {/* Late Fine (Display/Input) */}
//                          <div>
//                            <label htmlFor={`lateFine-${index}`} className="block text-sm font-medium text-gray-700">Late Fine Amount</label>
//                            <input
//                                 type="number"
//                                 id={`lateFine-${index}`}
//                                 placeholder="Auto/Manual Fine"
//                                 value={formData[index].lateFine ?? ''} // Use ?? for null/undefined check
//                                 onChange={(e) => handleInputChange( index, "lateFine", e.target.value )} // Allow override if needed
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 min="0"
//                             />
//                         </div>

//                         {/* Concession */}
//                         <div>
//                            <label htmlFor={`concession-${index}`} className="block text-sm font-medium text-gray-700">Concession Amount</label>
//                            <input
//                                 type="number"
//                                 id={`concession-${index}`}
//                                 placeholder="Enter concession"
//                                 value={formData[index].concessionFee ?? ''}
//                                 onChange={(e) => handleInputChange( index, "concessionFee", e.target.value )}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 min="0"
//                             />
//                         </div>

//                          {/* Discount - NEW FIELD */}
//                         <div>
//                            <label htmlFor={`duesPaid-${index}`} className="block text-sm font-medium text-gray-700">Past Dues </label>
//                            <input
//                                 type="number"
//                                 id={`duesPaid-${index}`}
//                                 placeholder="Enter duesPaid"
//                                 value={formData[index].duesPaid ?? ''} // Use discount from state
//                                 onChange={(e) => handleInputChange( index, "duesPaid", e.target.value )} // Update discount state
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 min="0"
//                             />
//                         </div>

//                         {/* Remarks (span across cols potentially) */}
//                         <div className="sm:col-span-2">
//                            <label htmlFor={`remarks-${index}`} className="block text-sm font-medium text-gray-700">Remarks</label>
//                            <textarea
//                                 id={`remarks-${index}`}
//                                 value={formData[index].remarks || ""}
//                                 onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 rows="2"
//                                 placeholder="Optional remarks..."
//                             />
//                         </div>

//                         {/* Total Calculation Display (span across cols) */}
//                         <div className="sm:col-span-2 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
//                             <label className="block text-sm font-medium text-gray-800">Calculation:</label>
//                             <p className="text-sm text-blue-900 break-words">{formatTotalString(index)}</p>
//                             <label className="block text-lg font-semibold text-blue-900 mt-1">
//                                 Net Amount Payable: ₹ {calculateTotalForChild(index).toFixed(2)}
//                              </label>
//                         </div>

//                      </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Modal Action Buttons */}
//            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0">
//             <button
//               type="button" // Important: prevent default form submission
//               onClick={handleSubmit} // Trigger explicit submit handler
//               // disabled={selectedChildren.length === 0 || setIsLoader} // Disable if no selection or loading
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//             >
//               {'Submit Fees'}
//               {/* {setIsLoader ? 'Submitting...' : 'Submit Fees'} */}
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

//       {/* Fee History Table */}
//       <Table reLoad={reLoad} />
//     </div>
//   );
// };

// export default CreateFees;


// import axios from "axios";
// import React, { useEffect, useState } from "react";
// // import Cookies from "js-cookie"; // Not used, can be removed unless needed elsewhere
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import { ActiveStudents, feesfeeHistory, LateFines, parentandchildwithID } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// const CreateFees = () => {
//   const session = JSON.parse(localStorage.getItem("session"));
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   // const [isOpen, setIsOpen] = useState(false); // isOpen seems redundant if modalOpen is used
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFeesOptions, setAdditionalFeesOptions] = useState([]); // Renamed for clarity
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [prevFeeMonths, setPrevFeeMonths] = useState({}); // Store previous months per studentId
//   const [studentFeeHistory, setStudentFeeHistory] = useState([]);
//   const [allLateFines, setAllLateFines] = useState([]); // Store all late fine rules

//   // --- State for formData ---
//   // Initialize formData structure within handleStudentClick
//   const [formData, setFormData] = useState([]);

//   const authToken = localStorage.getItem("token");

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   // --- Fetch Initial Data ---
//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response?.students?.data) {
//         setAllStudent(response.students.data);
//       } else {
//         console.warn("No student data found in ActiveStudents response:", response);
//         setAllStudent([]);
//       }
//     } catch (error) {
//       console.error("Error fetching active students:", error);
//       toast.error("Failed to fetch student list.");
//       setAllStudent([]);
//     }
//   };

//   const getFeeHistory = async () => {
//     try {
//       const response = await feesfeeHistory();
//       if (response?.success) {
//         setStudentFeeHistory(response.data);
//         // Process fee history to easily get paid months per student
//         const paidMonthsMap = {};
//         response.data.forEach(history => {
//           const paidMonths = history.regularFees
//             ?.filter(fee => fee.status === "Paid")
//             .map(fee => fee.month) || [];
//           paidMonthsMap[history.studentId] = paidMonths;
//         });
//         setPrevFeeMonths(paidMonthsMap);

//       } else {
//         toast.error(response?.message || "Failed to get fee history.");
//         setStudentFeeHistory([]);
//          setPrevFeeMonths({});
//       }
//     } catch (error) {
//       console.error("Error fetching fee history:", error);
//       toast.error("Error fetching fee history.");
//         setStudentFeeHistory([]);
//         setPrevFeeMonths({});
//     }
//   };

//  const getLateFinesData = async () => {
//     try {
//       const response = await LateFines();
//       if (response?.success) {
//         setAllLateFines(response.data || []);
//       } else {
//         toast.error(response?.message || "Failed to get late fine data.");
//         setAllLateFines([]);
//       }
//     } catch (error) {
//       console.error("Error fetching late fines:", error);
//       toast.error("Error fetching late fines.");
//       setAllLateFines([]);
//     }
//   };

//   useEffect(() => {
//     getAllStudent();
//     getFeeHistory();
//     getLateFinesData(); // Fetch all late fines once
//   }, []);

//   // --- Search Handlers ---
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

//   // --- Modal and Student Selection ---
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true);
//     try {
//       const response = await parentandchildwithID(parentId);
//       if (response?.success) {
//         const children = response?.children || [];
//         setParentData(children);

//         // Initialize formData with default values for each child
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           studentId: child.studentId, // Store studentId for easier lookup
//           className: child.class,     // Store class name
//           classFee: 0,               // Will be fetched later if needed
//           feeAmount: "",             // Seems unused, consider removing
//           selectedMonths: [],
//           monthFees: {},             // To store fee amount per selected month
//           totalClassFee: 0,
//           feeDate: getCurrentDate(),
//           paymentMode: "Cash",
//           selectedAdditionalFees: [], // Seems unused, additionalFeeValues is used
//           additionalFeeValues: [],   // Stores selected additional fees { fee, value, selectedMonths, totalFee }
//           additionalFee: 0,          // Total of selected additional fees
//           amountSubmitted: 0,        // Seems unused, consider removing
//           previousDues: child.dues || 0,
//           concessionFee: "",         // Initialize concession
//           duesPaid: "",              // Initialize discount
//           lateFine: 0,               // Initialize lateFine (will be fetched)
//           remarks: "",
//           transactionId: "",
//           chequeBookNo: "",          // Specific to Cheque payment
//           includeClassFee: false,    // Control visibility of class fee section
//           includeAdditionalFees: false, // Control visibility of additional fee section
//         }));

//         setFormData(initialFormData);
//         // Reset selections for the new modal instance
//         setSelectedChildren([]);
//         setShowForm(Array(children.length).fill(false));
//         setModalOpen(true);
//       } else {
//         toast.error(response?.message || "Failed to fetch parent/child data.");
//       }
//     } catch (error) {
//       console.error("Error fetching parent/child data:", error);
//       toast.error("An error occurred while fetching student data.");
//     } finally {
//       setIsLoader(false);
//       setSearchTerm(""); // Clear search terms after selection
//       setSearchTermbyadmissionNo("");
//       setFilteredStudents([]); // Hide dropdown
//     }
//   };

//   // --- Child Selection within Modal ---
//   const handleChildSelection = async (child, index) => { // Make async to handle potential async operations
//     const isCurrentlySelected = selectedChildren.includes(index);
//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (isCurrentlySelected) {
//       // Deselecting
//       const TobeRemovedindex = updatedSelectedChildren.indexOf(index);
//       updatedSelectedChildren.splice(TobeRemovedindex, 1);
//       updatedShowForm[index] = false;
//     } else {
//       // Selecting
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;

//       // --- Fetch data specific to this child when selected ---
//        setIsLoader(true); // Show loader while fetching fees/fines
//       try {
//         const studentClass = child.class;
//         const studentId = child.studentId;

//          // 1. Determine Late Fine for this child's class
//         const applicableFine = allLateFines.find(fineRule => fineRule.className === studentClass)?.amount || 0;

//         // 2. Fetch Additional Fee Options for this child's class (if not already fetched globally)
//         // Using axios directly here, consider moving to Network/AdminApi if preferred
//         const additionalFeesResponse = await axios.get(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//           {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           }
//         );
//         const feesData = additionalFeesResponse?.data?.data
//           ?.filter((feeType) => feeType.className === studentClass)
//           .map((fee) => ({
//             label: fee.name ? `${fee.name}` : "Unknown Fee",
//             value: fee.amount || 0, // Store amount directly in value
//             id: fee._id, // Keep id if needed
//           })) || [];
//         setAdditionalFeesOptions(feesData); // Set options for the dropdown

//         // 3. Fetch Regular Class Fee Amount
//          const classFeeResponse = await axios.get(`https://dvsserver.onrender.com/api/v1/adminRoute/fees`, {
//             withCredentials: true,
//             headers: { Authorization: `Bearer ${authToken}` },
//           });
//          const feeTypeArray = classFeeResponse?.data?.data;
//          const studentFeeAmount = Array.isArray(feeTypeArray)
//             ? feeTypeArray.find(feeType => feeType.className === studentClass)?.amount || 0
//             : 0;

//         // Update formData for the selected child
//         const updatedFormData = [...formData];
//         updatedFormData[index] = {
//             ...updatedFormData[index],
//             lateFine: applicableFine, // Set fetched late fine
//             classFee: studentFeeAmount, // Set fetched class fee amount
//             // Reset dependent fields when selecting (optional, but can prevent stale data)
//             // selectedMonths: [],
//             // totalClassFee: 0,
//             // additionalFeeValues: [],
//             // additionalFee: 0,
//         };
//         setFormData(updatedFormData);

//       } catch (error) {
//           console.error("Error fetching fee details for child:", error);
//           toast.error(`Failed to fetch fee details for ${child.studentName}.`);
//            // Deselect if fetching fails? Or allow proceeding with defaults?
//            // For now, keep selected but show error.
//       } finally {
//           setIsLoader(false);
//       }
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   // --- Form Input Handlers ---

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setFormData(updatedFormData);
//   };

//   // --- Month Selection Handlers ---
//   const allMonths = [ "April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"];

//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const studentId = formData[childIndex]?.studentId;
//     const currentPrevFeeMonths = prevFeeMonths[studentId] || []; // Get paid months for *this* student

//     // Available months are allMonths excluding the ones already paid by this student
//     const availableMonthsForStudent = allMonths.filter(
//       (month) => !currentPrevFeeMonths.includes(month)
//     );

//     const selectedMonthValues = selectedOptions ? selectedOptions.map((option) => option.value) : [];
//     const updatedFormData = [...formData];

//     if (!updatedFormData[childIndex].monthFees) {
//       updatedFormData[childIndex].monthFees = {};
//     }

//     // --- Sequential Check ---
//     if (selectedMonthValues.length > 0) {
//         const sortedSelectedMonths = selectedMonthValues.sort(
//           (a, b) => availableMonthsForStudent.indexOf(a) - availableMonthsForStudent.indexOf(b)
//         );

//         const firstAvailableMonth = availableMonthsForStudent[0];
//         const firstSelectedMonth = sortedSelectedMonths[0];

//         // Check 1: Must start with the first available month if any month is selected
//         if (firstSelectedMonth !== firstAvailableMonth) {
//              toast.warn(`Selection must start from the first due month: ${firstAvailableMonth}`);
//              // Optionally revert selection or just prevent update
//              return; // Stop update if sequence is broken at the start
//         }

//         // Check 2: Check for gaps in the selected sequence relative to available months
//         const lastSelectedIndex = availableMonthsForStudent.indexOf(sortedSelectedMonths[sortedSelectedMonths.length - 1]);
//         const expectedSequence = availableMonthsForStudent.slice(0, lastSelectedIndex + 1);

//         const isSequential = expectedSequence.every(month => sortedSelectedMonths.includes(month));

//         if (!isSequential) {
//             toast.warn("Fee months must be selected sequentially without gaps.");
//             // Optionally revert selection or just prevent update
//              return; // Stop update if sequence has gaps
//         }
//     }
//      // --- End Sequential Check ---

//     // Update monthFees based on current selection
//     const newMonthFees = {};
//     selectedMonthValues.forEach((month) => {
//         // Keep existing value if present, otherwise default to classFee
//         newMonthFees[month] = updatedFormData[childIndex].monthFees[month] ?? (updatedFormData[childIndex].classFee || 0);
//     });


//     updatedFormData[childIndex].selectedMonths = selectedMonthValues; // Store the values ['April', 'May']
//     updatedFormData[childIndex].monthFees = newMonthFees; // Update the fee map
//     updatedFormData[childIndex].totalClassFee =
//       (updatedFormData[childIndex].classFee || 0) * selectedMonthValues.length;

//     setFormData(updatedFormData);
//   };


//    const handleMonthFeeChange = (index, month, value) => {
//     const updatedFormData = [...formData];
//     if (updatedFormData[index] && updatedFormData[index].monthFees) {
//         updatedFormData[index].monthFees[month] = parseFloat(value) || 0; // Ensure it's a number
//         // No need to recalculate totalClassFee here, it's based on count * classFee
//         setFormData(updatedFormData);
//     }
//   };


//   // --- Additional Fees Handlers ---

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const selectedValues = selectedOptions ? selectedOptions.map(option => ({
//         fee: option.label, // Name of the fee
//         value: option.value, // Amount per month/instance for this fee
//         selectedMonths: [], // Months selected *for this specific fee*
//         monthFees: {}, // Amount paid per month *for this specific fee*
//         totalFee: 0, // Total calculated for this fee based on selected months
//     })) : [];


//     // Calculate the initial total based on potentially pre-selected months (though usually starts empty)
//      const totalAdditionalFee = selectedValues.reduce((total, fee) => {
//         return total + (fee.totalFee || 0); // Sum up totals of each selected additional fee
//      }, 0);


//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//         ...updatedFormData[index],
//         additionalFee: totalAdditionalFee, // Update total additional fee amount
//         additionalFeeValues: selectedValues, // Replace the list of selected additional fees
//     };
//     setFormData(updatedFormData);
// };


//  const handleAdditionalFeeMonthSelection = (index, feeIndex, selectedOptions) => {
//     const selectedMonthsData = selectedOptions ? selectedOptions.map(option => ({
//         month: option.value, // e.g., "April"
//         value: formData[index].additionalFeeValues[feeIndex].value // Default value for this fee type
//     })) : [];

//     const updatedFormData = [...formData];
//     const currentFee = updatedFormData[index].additionalFeeValues[feeIndex];

//     // Update selected months for *this specific* additional fee
//     currentFee.selectedMonths = selectedMonthsData;

//     // Calculate total for *this specific* additional fee
//     currentFee.totalFee = currentFee.value * selectedMonthsData.length;

//     // Recalculate the overall total additional fee for the student
//     const newTotalAdditionalFee = updatedFormData[index].additionalFeeValues.reduce((sum, fee) => {
//         return sum + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = newTotalAdditionalFee;

//     setFormData(updatedFormData);
// };

// // Allow editing the amount for a specific month of a specific additional fee
// const handleAdditionalFeeMonthValueChange = (index, feeIndex, month, newValue) => {
//     const updatedFormData = [...formData];
//     const feeEntry = updatedFormData[index]?.additionalFeeValues?.[feeIndex];
//     if (!feeEntry) return;

//     const monthEntry = feeEntry.selectedMonths?.find(m => m.month === month);
//     if (monthEntry) {
//         monthEntry.value = parseFloat(newValue) || 0; // Update the value for that specific month
//     }
//   feeEntry.totalFee = feeEntry.selectedMonths.reduce((sum, m) => sum + (m.value || 0), 0);


//     // Recalculate the overall total additional fee for the student
//     const newTotalAdditionalFee = updatedFormData[index].additionalFeeValues.reduce((sum, fee) => {
//         return sum + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = newTotalAdditionalFee;

//     setFormData(updatedFormData);
// };

//     const handleSubmit = async (e) => {
//       e.preventDefault();
//       setIsLoader(true); // Start loader
  
//       let errorsFound = false;
//       const feePromises = []; // Store promises for API calls
  
//       if (selectedChildren.length === 0) {
//            toast.warn("Please select at least one student and fill their fee details.");
//            setIsLoader(false);
//            return;
//        }
  
  
//       for (const childIndex of selectedChildren) {
//         const child = parentData[childIndex];
//         const childFormData = formData[childIndex];
  
//         // Basic Validations
//          if (!childFormData.paymentMode) {
//           toast.error(`Payment mode is required for ${child.studentName}`);
//           errorsFound = true;
//           continue;
//         }
//          if (childFormData.paymentMode === "Online" && !childFormData.transactionId) {
//              toast.error(`Transaction ID is required for Online payment for ${child.studentName}`);
//              errorsFound = true;
//              continue;
//          }
//          if (childFormData.paymentMode === "Cheque" && !childFormData.chequeBookNo) {
//              toast.error(`Cheque Number is required for Cheque payment for ${child.studentName}`);
//              errorsFound = true;
//              continue;
//          }
//           // Validation: Ensure numeric inputs are valid numbers (optional but recommended)
//           const concessionVal = parseFloat(childFormData.concessionFee);
//           const duesPaidVal = parseFloat(childFormData.duesPaid);
//           const lateFineVal = parseFloat(childFormData.lateFine);
  
//           if (isNaN(concessionVal) && childFormData.concessionFee !== "" && childFormData.concessionFee !== null) {
//                toast.error(`Invalid Concession amount for ${child.studentName}`);
//                errorsFound = true;
//                continue;
//           }
//            if (isNaN(duesPaidVal) && childFormData.duesPaid !== "" && childFormData.duesPaid !== null) {
//                toast.error(`Invalid Dues Paid amount for ${child.studentName}`);
//                errorsFound = true;
//                continue;
//            }
//            if (isNaN(lateFineVal) && childFormData.lateFine !== "" && childFormData.lateFine !== null) {
//                toast.error(`Invalid Late Fine amount for ${child.studentName}`);
//                errorsFound = true;
//                continue;
//            }
  
  
//         // --- Prepare Payload Data ---
  
//         // 1. Regular Fees (Based on actual entered amounts per month)
//         const regularFeesPayload = childFormData.includeClassFee
//           ? (childFormData.selectedMonths || []).map(month => ({
//               month: month,
//               paidAmount: Number(childFormData.monthFees?.[month]) || 0,
//               // status: "Pending" // Backend likely determines status
//             }))
//           : []; // Empty array if class fee checkbox is off
  
//         // 2. Additional Fees (Based on actual entered amounts per month per fee)
//           const additionalFeesPayload = childFormData.includeAdditionalFees
//             ? (childFormData.additionalFeeValues || []).flatMap(feeData => {
//                 return (feeData.selectedMonths || []).map(monthData => ({
//                     name: feeData.fee,
//                     month: monthData.month,
//                     paidAmount: Number(monthData.value) || 0,
//                     // status: "Pending" // Backend likely determines status
//                 }));
//               })
//             : []; // Empty array if additional fee checkbox is off
  
  
//          // 3. Calculate Net Amount Payable using the updated function
//          // This function now sums the actual *entered* amounts for fees
//          const netAmountPayable = calculateTotalForChild(childIndex);
  
//         // --- Construct the final payload for the API ---
//         const newFeeData = {
//           studentId: child.studentId,
//           session: session, // Assuming session is available in scope
//           paymentDetails: {
//             regularFees: regularFeesPayload,
//             additionalFees: additionalFeesPayload,
//             paymentMode: childFormData.paymentMode,
//             feeDate: childFormData.feeDate || getCurrentDate(),
//             transactionId: childFormData.paymentMode === "Online" ? childFormData.transactionId : "", // Send only if Online
//             // chequeNo: childFormData.paymentMode === "Cheque" ? childFormData.chequeBookNo : null,      // Send only if Cheque
//             lateFinesPaid: parseFloat(childFormData.lateFine) || 0, // Use entered late fine
//             concession: parseFloat(childFormData.concessionFee) || 0, // Use entered concession
//             pastDuesPaid: parseFloat(childFormData.previousDues) || 0, // Use the value from the 'Dues Amount' input field
//             totalAmount: netAmountPayable, // Use the final calculated amount
//             remark: childFormData.remarks || "",
//              },
//         };
  
//         // Push the API call promise to the array
//         feePromises.push(
//           axios.post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus", // Use your correct endpoint
//             newFeeData,
//             {
//               withCredentials: true,
//               headers: { Authorization: `Bearer ${authToken}` },
//             }
//           )
//           .then(response => ({ success: true, studentName: child.studentName, message: response.data.message }))
//           .catch(error => ({
//               success: false,
//               studentName: child.studentName,
//               message: error.response?.data?.message || error.response?.data?.error || "Server error"
//           }))
//         );
//       } // End loop through selectedChildren
  
//        if (errorsFound) {
//           setIsLoader(false);
//           // toast.error("Please fix the errors before submitting."); // Specific errors already shown
//           return; // Stop submission if validation errors occurred
//       }
  
//       // --- Process all API calls ---
//       try {
//           const results = await Promise.all(feePromises);
//           let allSuccess = true;
  
//           results.forEach(result => {
//               if (result.success) {
//                   toast.success(`Fee created for ${result.studentName}: ${result.message || 'Success'}`);
//               } else {
//                   toast.error(`Error creating fee for ${result.studentName}: ${result.message}`);
//                   allSuccess = false;
//               }
//           });
  
//           if (allSuccess) {
//               setModalOpen(false); // Close modal only if all succeed
//               setReload(prev => !prev); // Trigger table reload
//               getFeeHistory(); // Refresh fee history to update paid months
//               // Consider resetting formData here if needed
//           }
//            // Handle partial success/failure if needed
//       } catch (error) {
//           console.error("Error submitting fee data:", error);
//           toast.error("An unexpected error occurred during submission.");
//       } finally {
//         setIsLoader(false); // Stop loader regardless of outcome
//       }
//     };

//   const calculateTotalForChild = (index) => {
//     const data = formData[index];
//     if (!data) return 0;

//     // Calculate actual sum from entered regular month fees
//     let actualClassFeePaid = 0;
//     if (data.includeClassFee && data.selectedMonths && data.monthFees) {
//         actualClassFeePaid = data.selectedMonths.reduce((sum, month) => {
//             return sum + (Number(data.monthFees[month]) || 0);
//         }, 0);
//     }

//     // Calculate actual sum from entered additional fee month fees
//     let actualAdditionalFeePaid = 0;
//     if (data.includeAdditionalFees && data.additionalFeeValues) {
//         actualAdditionalFeePaid = data.additionalFeeValues.reduce((totalSum, feeData) => {
//             const feeMonthSum = (feeData.selectedMonths || []).reduce((monthSum, monthData) => {
//                 return monthSum + (Number(monthData.value) || 0);
//             }, 0);
//             return totalSum + feeMonthSum;
//         }, 0);
//     }

//     // Other components (ensure they are numbers, default to 0)
//     const prevDues = parseFloat(data.previousDues) || 0;
//     const fine = parseFloat(data.lateFine) || 0;
//     const concession = parseFloat(data.concessionFee) || 0;
//     const duesPaid = parseFloat(data.duesPaid) || 0; // This seems like it should reduce the total, but following your formula for now. Or is it amount being paid towards past dues? Naming is a bit ambiguous. Let's assume it's an adjustment to be *added* as per your previous formula structure.

//     // Final Calculation based on entered amounts and adjustments
//     // Formula seems to be: ClassFee + AddlFee + PrevDues + DuesPaid + Fine - Concession
//     const total = actualClassFeePaid + actualAdditionalFeePaid + prevDues + duesPaid + fine - concession;

//     // Ensure total is not negative, although it might be possible with large concessions
//     return total < 0 ? 0 : total;
// };
 
//   const formatTotalString = (index) => {
//     const data = formData[index];
//     if (!data) return "₹ 0";

//     // Calculate actual sum from entered regular month fees
//     let actualClassFeePaid = 0;
//     if (data.includeClassFee && data.selectedMonths && data.monthFees) {
//         actualClassFeePaid = data.selectedMonths.reduce((sum, month) => {
//             return sum + (Number(data.monthFees[month]) || 0);
//         }, 0);
//     }

//     // Calculate actual sum from entered additional fee month fees
//     let actualAdditionalFeePaid = 0;
//     if (data.includeAdditionalFees && data.additionalFeeValues) {
//         actualAdditionalFeePaid = data.additionalFeeValues.reduce((totalSum, feeData) => {
//             const feeMonthSum = (feeData.selectedMonths || []).reduce((monthSum, monthData) => {
//                 return monthSum + (Number(monthData.value) || 0);
//             }, 0);
//             return totalSum + feeMonthSum;
//         }, 0);
//     }

//     // Other components
//     const prevDues = parseFloat(data.previousDues) || 0;
//     const fine = parseFloat(data.lateFine) || 0;
//     const concession = parseFloat(data.concessionFee) || 0;
//     // const disc = parseFloat(data.discount) || 0; // Original formatTotalString had 'disc', but state used 'duesPaid'. Using duesPaid.
//     const duesPaidVal = parseFloat(data.duesPaid) || 0; // Using the value from the 'Dues Amount' input

//     // Calculate final total using the updated calculateTotalForChild function
//     const finalTotal = calculateTotalForChild(index);

//     // Build the string piece by piece based on *actual entered amounts* > 0
//     let parts = [];
//     if (actualClassFeePaid > 0) parts.push(`${actualClassFeePaid.toFixed(2)} (Class)`);
//     if (actualAdditionalFeePaid > 0) parts.push(`${actualAdditionalFeePaid.toFixed(2)} (Addl)`);
//     if (prevDues > 0) parts.push(`${prevDues.toFixed(2)} (Prev Dues)`);
//      // Add duesPaidVal if it's positive (representing an amount being paid/adjusted)
//     if (duesPaidVal > 0) parts.push(`${duesPaidVal.toFixed(2)} (Dues Paid)`); // Adjusted label for clarity
//     if (fine > 0) parts.push(`${fine.toFixed(2)} (Fine)`);

//     let calculationString = parts.length > 0 ? parts.join(' + ') : '0'; // Start with '0' if no positive parts

//     if (concession > 0) calculationString += ` - ${concession.toFixed(2)} (Conc)`;
//     // if (disc > 0) calculationString += ` - ${disc.toFixed(2)} (Disc)`; // Removed as using duesPaid now

//     // Ensure the result matches the calculation precisely
//     return `${calculationString} = ₹ ${finalTotal.toFixed(2)}`;
// }

//   return (
//     <div className="md:min-h-screen md:pl-0 md:px-0">
//       {/* Search Inputs */}
//       <div className="flex flex-col sm:flex-row gap-2 py-2 mb-2">
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
//              <div className="absolute z-10 w-full md:w-1/2 max-h-60 overflow-y-auto border border-gray-300 rounded bg-white shadow-lg">
//                 {filteredStudents.map((student, index) => (
//                     <div // Changed to div for better structure
//                     key={student._id || index} // Use a unique key like _id if available
//                     className="p-2 border-b cursor-pointer hover:bg-gray-100"
//                     onClick={() => handleStudentClick(student.parentId)}
//                     >
//                     <span className="font-semibold">{student.studentName || "No Name"}</span>
//                     <span className="text-sm text-gray-600">
//                         , Class: {student.class}, AdmNo: {student.admissionNumber}, Parent: {student.fatherName}
//                     </span>
//                     </div>
//                 ))}
//              </div>
//         </div>
//       )}

//       {/* Fee Creation Modal */}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Create Fees`}>
//         {/* Use a form tag here, but button type="button" unless it's the final submit */}
//         <div className="flex flex-col max-h-[80vh] "> {/* Allow vertical scroll */}
//           {/* Student Selection Area */}
//           <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto"> {/* Make this section scrollable */}
//             {parentData.map((child, index) => (
//               <div key={child._id || index} className={`bg-white rounded-lg shadow-md p-3 border ${selectedChildren.includes(index) ? 'border-blue-500' : 'border-gray-200'} h-full min-w-[300px] mb-3`}> {/* Basic styling */}
//                 {/* Child Header */}
//                 <div className="flex items-center border-b pb-2 mb-3">
//                   <input
//                     type="checkbox"
//                     id={`child-checkbox-${index}`}
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
//                   />
//                   <label htmlFor={`child-checkbox-${index}`} className="flex-grow cursor-pointer">
//                     <span className="text-lg font-semibold text-blue-800">
//                       {child.studentName}
//                     </span>
//                     <span className="text-sm text-gray-700">
//                       {" / Class: "} {child.class}
//                       {" / Adm#: "} {child.admissionNumber}
//                     </span>
//                     <div className="flex justify-between text-sm mt-1">
//                       <span className="text-red-600 font-medium">
//                          Dues: ₹{formData[index]?.previousDues || 0}
//                       </span>
//                       {/* Display Late Fine if applicable */}
//                       {formData[index]?.lateFine > 0 && (
//                          <span className="text-orange-600 font-medium">
//                             Late Fine: ₹{formData[index]?.lateFine}
//                          </span>
//                       )}
//                     </div>
//                   </label>
//                 </div>

//                 {/* Conditional Form Area */}
//                 {showForm[index] && formData[index] && ( // Ensure formData[index] exists
//                   <div className="space-y-4"> {/* Add spacing between sections */}
//                     {/* --- Class Fee Section --- */}
//                     <div className="border rounded p-3 bg-gray-50">
//                       <div className="flex items-center mb-2">
//                         <input
//                           type="checkbox"
//                           id={`include-class-fee-${index}`}
//                           checked={formData[index].includeClassFee}
//                           onChange={(e) => handleInputChange( index, "includeClassFee", e.target.checked )}
//                           className="mr-2 h-4 w-4"
//                         />
//                         <label htmlFor={`include-class-fee-${index}`} className="font-semibold text-gray-700">
//                           Regular Class Fee (₹{formData[index].classFee}/month)
//                         </label>
//                       </div>
//                       {formData[index].includeClassFee && (
//                         <div className="space-y-3 pl-6">
//                            {/* Month Selector */}
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                               Select Months
//                             </label>
//                              <Select
//                                 options={(allMonths.filter(month => !(prevFeeMonths[child.studentId] || []).includes(month))).map(m => ({ value: m, label: m }))} // Filter out paid months for *this* student
//                                 value={formData[index].selectedMonths?.map(m => ({ value: m, label: m }))}
//                                 onChange={(selectedOptions) => handleMonthSelection(selectedOptions, index)}
//                                 isMulti
//                                 closeMenuOnSelect={false}
//                                 name={`months-class-${index}`}
//                                 className="basic-multi-select"
//                                 classNamePrefix="select"
//                                 placeholder="Select fee months..."
//                              />

//                              {/* Display Total Class Fee */}
//                             <p className="text-sm font-medium text-gray-600 mt-2">
//                                 Total Class Fee Due: ₹{formData[index].totalClassFee || 0}
//                             </p>
//                           </div>
//                           {/* Individual Month Fee Inputs */}
//                            {formData[index].selectedMonths && formData[index].selectedMonths.length > 0 && (
//                                 <div className="mt-2 border-t pt-2">
//                                     <label className="block text-xs font-medium text-gray-500 mb-1">Enter Amount Paid Per Month:</label>
//                                     <div className="flex flex-wrap gap-2">
//                                     {formData[index].selectedMonths.map( (month) => (
//                                         <div key={month} className="flex items-center gap-1 bg-gray-200 p-1 rounded text-xs">
//                                         <label htmlFor={`monthfee-${index}-${month}`} className="text-gray-700">{month}:</label>
//                                         <input
//                                             type="number"
//                                             id={`monthfee-${index}-${month}`}
//                                             className="w-16 border rounded p-1 text-xs"
//                                             value={formData[index].monthFees?.[month] ?? ''} // Use empty string if undefined/null
//                                             onChange={(e) => handleMonthFeeChange( index, month, e.target.value )}
//                                             placeholder="Amt"
//                                             min="0" // Prevent negative numbers
//                                         />
//                                         </div>
//                                     ))}
//                                     </div>
//                                 </div>
//                             )}
//                         </div>
//                       )}
//                     </div>

//                     {/* --- Additional Fees Section --- */}
//                      <div className="border rounded p-3 bg-gray-50">
//                         <div className="flex items-center mb-2">
//                            <input
//                                 type="checkbox"
//                                 id={`include-addl-fee-${index}`}
//                                 checked={formData[index].includeAdditionalFees}
//                                 onChange={(e) => handleInputChange(index, "includeAdditionalFees", e.target.checked)}
//                                 className="mr-2 h-4 w-4"
//                             />
//                             <label htmlFor={`include-addl-fee-${index}`} className="font-semibold text-gray-700">
//                                 Additional Fees
//                             </label>
//                         </div>
//                         {formData[index].includeAdditionalFees && (
//                             <div className="space-y-3 pl-6">
//                                 {/* Additional Fee Type Selector */}
//                                 <Select
//                                     isMulti
//                                     options={additionalFeesOptions} // Use state variable holding options
//                                     value={formData[index].additionalFeeValues?.map(f => ({ label: f.fee, value: f.value }))} // Map current selection back to options format
//                                     onChange={(selectedOptions) => handleAdditionalFeesChange(index, selectedOptions)}
//                                     closeMenuOnSelect={false}
//                                     className="basic-multi-select"
//                                     classNamePrefix="select"
//                                     placeholder="Select additional fee types..."
//                                 />
//                                 {/* Display Total Additional Fee */}
//                                 <p className="text-sm font-medium text-gray-600 mt-2">
//                                     Total Additional Fees Due: ₹{formData[index].additionalFee || 0}
//                                 </p>

//                                 {/* Details for each selected additional fee */}
//                                 {formData[index].additionalFeeValues?.map((feeData, feeIndex) => (
//                                     <div key={feeIndex} className="border rounded p-2 mt-2 bg-white space-y-2">
//                                         <p className="font-medium text-sm text-blue-700">{feeData.fee} (₹{feeData.value} each)</p>
//                                         {/* Month Selector for this specific fee */}
//                                         <Select
//                                             isMulti
//                                             options={allMonths.map(m => ({ value: m, label: m }))} // Assuming addl fees can apply to any month
//                                             value={feeData.selectedMonths?.map(m => ({ value: m.month, label: m.month }))}
//                                             onChange={(selectedOptions) => handleAdditionalFeeMonthSelection( index, feeIndex, selectedOptions )}
//                                             closeMenuOnSelect={false}
//                                             name={`months-addl-${index}-${feeIndex}`}
//                                             className="basic-multi-select text-xs"
//                                             classNamePrefix="select"
//                                             placeholder="Select months for this fee..."
//                                          />
//                                          {/* Inputs for Amount Paid per Month for this fee */}
//                                          {feeData.selectedMonths && feeData.selectedMonths.length > 0 && (
//                                             <div className="mt-2 border-t pt-2">
//                                                 <label className="block text-xs font-medium text-gray-500 mb-1">Enter Amount Paid Per Month (for {feeData.fee}):</label>
//                                                 <div className="flex flex-wrap gap-2">
//                                                     {feeData.selectedMonths.map((monthData) => (
//                                                         <div key={monthData.month} className="flex items-center gap-1 bg-gray-200 p-1 rounded text-xs">
//                                                             <label htmlFor={`monthfee-addl-${index}-${feeIndex}-${monthData.month}`} className="text-gray-700">{monthData.month}:</label>
//                                                             <input
//                                                                 type="number"
//                                                                 id={`monthfee-addl-${index}-${feeIndex}-${monthData.month}`}
//                                                                 className="w-16 border rounded p-1 text-xs"
//                                                                 value={monthData.value ?? ''} // Use assigned value
//                                                                 onChange={(e) => handleAdditionalFeeMonthValueChange( index, feeIndex, monthData.month, e.target.value )}
//                                                                 placeholder="Amt"
//                                                                 min="0"
//                                                             />
//                                                         </div>
//                                                     ))}
//                                                 </div>
//                                             </div>
//                                          )}
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                      </div>

//                     {/* --- Payment Details & Adjustments --- */}
//                      <div className="border rounded p-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
//                         {/* Fee Date */}
//                         <div>
//                            <label htmlFor={`feeDate-${index}`} className="block text-sm font-medium text-gray-700">Fee Date</label>
//                            <input
//                                 type="date"
//                                 id={`feeDate-${index}`}
//                                 value={formData[index].feeDate || getCurrentDate()}
//                                 onChange={(e) => handleInputChange(index, "feeDate", e.target.value)}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                             />
//                         </div>

//                         {/* Payment Mode */}
//                          <div>
//                             <label htmlFor={`paymentMode-${index}`} className="block text-sm font-medium text-gray-700">Payment Mode</label>
//                             <select
//                                 id={`paymentMode-${index}`}
//                                 value={formData[index].paymentMode || "Cash"}
//                                 onChange={(e) => handleInputChange( index, "paymentMode", e.target.value )}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1.5"
//                             >
//                                 <option value="Cash">Cash</option>
//                                 <option value="Online">Online</option>
//                                 <option value="Cheque">Cheque</option>
//                             </select>
//                          </div>

//                         {/* Transaction ID (Conditional) */}
//                          {formData[index].paymentMode === "Online" && (
//                             <div>
//                                 <label htmlFor={`transactionId-${index}`} className="block text-sm font-medium text-gray-700">Transaction ID</label>
//                                 <input
//                                     type="text"
//                                     id={`transactionId-${index}`}
//                                     value={formData[index].transactionId || ""}
//                                     onChange={(e) => handleInputChange( index, "transactionId", e.target.value )}
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                     placeholder="Enter online transaction ID"
//                                 />
//                             </div>
//                          )}

//                         {/* Cheque No (Conditional) */}
//                          {formData[index].paymentMode === "Cheque" && (
//                              <div>
//                                 <label htmlFor={`chequeNo-${index}`} className="block text-sm font-medium text-gray-700">Cheque Number</label>
//                                 <input
//                                     type="text"
//                                     id={`chequeNo-${index}`}
//                                     value={formData[index].chequeBookNo || ""} // Field name corrected in state
//                                     onChange={(e) => handleInputChange( index, "chequeBookNo", e.target.value )} // Update correct state field
//                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                     placeholder="Enter cheque number"
//                                 />
//                             </div>
//                          )}

//                         {/* Late Fine (Display/Input) */}
//                          <div>
//                            <label htmlFor={`lateFine-${index}`} className="block text-sm font-medium text-gray-700">Late Fine Amount</label>
//                            <input
//                                 type="number"
//                                 id={`lateFine-${index}`}
//                                 placeholder="Auto/Manual Fine"
//                                 value={formData[index].lateFine ?? ''} // Use ?? for null/undefined check
//                                 onChange={(e) => handleInputChange( index, "lateFine", e.target.value )} // Allow override if needed
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 min="0"
//                             />
//                         </div>

//                         {/* Concession */}
//                         <div>
//                            <label htmlFor={`concession-${index}`} className="block text-sm font-medium text-gray-700">Concession Amount</label>
//                            <input
//                                 type="number"
//                                 id={`concession-${index}`}
//                                 placeholder="Enter concession"
//                                 value={formData[index].concessionFee ?? ''}
//                                 onChange={(e) => handleInputChange( index, "concessionFee", e.target.value )}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 min="0"
//                             />
//                         </div>

//                          {/* Discount - NEW FIELD */}
//                         <div>
//                            <label htmlFor={`duesPaid-${index}`} className="block text-sm font-medium text-gray-700">Past Dues </label>
//                            <input
//                                 type="number"
//                                 id={`duesPaid-${index}`}
//                                 placeholder="Enter duesPaid"
//                                 value={formData[index].duesPaid ?? ''} // Use discount from state
//                                 onChange={(e) => handleInputChange( index, "duesPaid", e.target.value )} // Update discount state
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 min="0"
//                             />
//                         </div>

//                         {/* Remarks (span across cols potentially) */}
//                         <div className="sm:col-span-2">
//                            <label htmlFor={`remarks-${index}`} className="block text-sm font-medium text-gray-700">Remarks</label>
//                            <textarea
//                                 id={`remarks-${index}`}
//                                 value={formData[index].remarks || ""}
//                                 onChange={(e) => handleInputChange(index, "remarks", e.target.value)}
//                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-1"
//                                 rows="2"
//                                 placeholder="Optional remarks..."
//                             />
//                         </div>

//                         {/* Total Calculation Display (span across cols) */}
//                         <div className="sm:col-span-2 mt-2 p-2 bg-blue-50 rounded border border-blue-200">
//                             <label className="block text-sm font-medium text-gray-800">Calculation:</label>
//                             <p className="text-sm text-blue-900 break-words">{formatTotalString(index)}</p>
//                             <label className="block text-lg font-semibold text-blue-900 mt-1">
//                                 Net Amount Payable: ₹ {calculateTotalForChild(index).toFixed(2)}
//                              </label>
//                         </div>

//                      </div>
//                   </div>
//                 )}
//               </div>
//             ))}
//           </div>

//           {/* Modal Action Buttons */}
//            <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0">
//             <button
//               type="button" // Important: prevent default form submission
//               onClick={handleSubmit} // Trigger explicit submit handler
//               // disabled={selectedChildren.length === 0 || setIsLoader} // Disable if no selection or loading
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
//             >
//               {'Submit Fees'}
//               {/* {setIsLoader ? 'Submitting...' : 'Submit Fees'} */}
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

//       {/* Fee History Table */}
//       <Table reLoad={reLoad} />
//     </div>
//   );
// };

// export default CreateFees;





// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import { ActiveStudents, feesfeeHistory, LateFines, parentandchildwithID } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// const CreateFees = () => {
//   const session =JSON.parse(localStorage.getItem("session"))
//   const { setIsLoader } = useStateContext();
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFees, setAdditionalFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [prevFeeMonths, setPrevFeeMonths] = useState([]);
//   const [studentFeeHistory, setStudentFeeHistory] = useState([]);
//   const [lateFine, setLateFine] = useState(0);
// //  console.log("lateFine",lateFine)
//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeDate: "",
//       paymentMode: "Cash",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = localStorage.getItem("token");

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const getAllStudent = async () => {
//     try {
//       const response = await ActiveStudents();
//       if (response) {
//         // setAllStudent(response?.allStudent);
//         setAllStudent(response?.students?.data);
//       }
//       console.log("response all student", response?.allStudent);
//     } catch (error) {}
//   };
//   useEffect(() => {
//     getAllStudent();
//   }, []);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     console.log("searchValue", searchValue);
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

  
//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true)
//     try {
//       const response = await parentandchildwithID(parentId)
//       if (response?.success) {
//         setIsLoader(false)
//         const children = response?.children;
//         setParentData(children);

//        // Initialize formData with previousDues
//         const initialFormData = children?.map((child) => ({
//            admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [],
//           feeDate: getCurrentDate(),
//           paymentMode: "Cash",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           previousDues: child.dues || 0,  // Set initial value from child.dues
//         }));

//         setFormData(initialFormData);
//         setIsOpen(true);
//         setModalOpen(true);
//       }
//       else {
//         toast?.error(response?.message)
//       }
//     } catch (error) {
//       console.error("Error", error);
//     }

//   };

//   const getFeeHistory = async () => {
//     try {
//       const response = await feesfeeHistory()
//       console.log("getFeeHistory",response)
//       if (response?.success) {
//         setStudentFeeHistory(response?.data);
//       }
//       else {
//         toast?.error(response?.message)
//       }
   
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//   const getLateFine = async (className) => {
    
//     try {
//       const response = await LateFines()
      
//       if (response?.success) {
//         // setFeeHistory(response?.data);
//         let fine=response?.data?.filter((val)=>val?.className===className).map((val)=>val?.amount)[0]
//         console.log("first fine",fine)
//         setLateFine(fine)
//       }
//       else {
//         toast?.error(response?.message)
//       }
   
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   useEffect(()=>{
//     getFeeHistory()
//     // getLateFine()
//   },[])
//   const handleChildSelection = (child,index) => {
// console.log("studentFeeHistory",studentFeeHistory)
//     const matchStudent=studentFeeHistory?.filter((val)=>val?.studentId==child?.studentId)
//     // const allMonths=matchStudent?.flatMap((student)=>student?.regularFees?.map((fee)=>(fee?.month && fee?.status=="paid"))) || []
//     const allMonths = matchStudent?.flatMap((student) =>
//       student?.regularFees
//         ?.filter((fee) => fee?.status === "Paid") // Sirf Paid status wale filter honge
//         ?.map((fee) => fee?.month) // Sirf month extract hoga
//     ) || [];
    
//    console.log("allMonths",allMonths)
//     setPrevFeeMonths(allMonths);
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;
//     getLateFine(selectedChild.class)
//     axios
//       .get(
//         "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response?.data?.data?.filter((feeType) => feeType.className === studentClass)
//           .map((fee) => {
//             const label = fee.name ? `${fee.name}` : "Unknown Fee";
//             const value = fee.amount ? fee.amount : 0;
//             return {
//               label,
//               value,
//             };
//           });
//         console.log("feesData", feesData);
       
//         setAdditionalFees(feesData);
//       });

//     axios
//       .get(`https://dvsserver.onrender.com/api/v1/adminRoute/fees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         console.log("response fees",response)
//         const data = response?.data?.data;

//         if (Array.isArray(data)) {
//           const studentFeeAmount =
//             data
//               .filter((feeType) => feeType.className === studentClass)
//               .map((classData) => classData.amount)[0] || 0;
// console.log("studentFeeAmount",studentFeeAmount)
//           const updatedFormData = [...formData];
//           updatedFormData[index] = {
//             ...updatedFormData[index],
//             classFee: studentFeeAmount,
//             selectedMonths: updatedFormData[index]?.selectedMonths || [],
//             totalRegularFee:
//               studentFeeAmount *
//               (updatedFormData[index]?.selectedMonths.length || 1),
//             additionalFee: updatedFormData[index]?.additionalFee || 0,
//           };

//           setFormData(updatedFormData);
//         } else {
//           console.error("Invalid or undefined feeTypeArray");
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });

//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (updatedSelectedChildren.includes(index)) {
//       updatedSelectedChildren.splice(updatedSelectedChildren.indexOf(index), 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleMonthFeeChange = (index, month, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index].monthFees[month] = parseFloat(value);
//     const totalClassFee =
//       (updatedFormData[index].classFee || 0) *
//       updatedFormData[index].selectedMonths.length;
//     updatedFormData[index].totalClassFee = totalClassFee;

//     setFormData(updatedFormData);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeChange = (index, feeIndex, month, newValue) => {
//     const updatedFormData = [...formData];

//     if (!updatedFormData[index].additionalFeeValues) {
//       updatedFormData[index].additionalFeeValues = [];
//     }

//     const feeEntry = updatedFormData[index].additionalFeeValues[feeIndex];
//     if (feeEntry) {
//       const monthEntry = feeEntry.selectedMonths.find(
//         (monthData) => monthData.month === month
//       );

//       if (monthEntry) {
//         monthEntry.value = parseFloat(newValue) || 0;
//       } else {
//         console.error("Month entry not found.");
//       }
//     } else {
//       console.error("Additional fee entry not found.");
//     }

//     setFormData(updatedFormData);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       for (const childIndex of selectedChildren) {
//         const child = parentData[childIndex];
//         const childFormData = formData[childIndex] || {};
//         if (!childFormData.paymentMode) {
//           toast.error(`Payment mode is required for ${child.studentName}`);
//           continue;
//         }

//         const selectedMonthsData =
//           (childFormData.selectedMonths || []).map((month) => {
//             const paidAmount = Number(childFormData.monthFees?.[month]) || 0;

//             return {
//               month: month,
//               paidAmount: paidAmount,
//             };
//           }) || [];

//         const totalRegularPaidAmount = selectedMonthsData.reduce(
//           (acc, curr) => acc + curr.paidAmount,
//           0
//         );

//         const additionalFeesData = (
//           childFormData.additionalFeeValues || []
//         ).flatMap((feeData) => {
//           return (feeData.selectedMonths || []).map((month) => ({
//             name: feeData.fee,
//             month: month.month,
//             paidAmount: Number(month.value) || 0,
//           }));
//         });

//         const totalAdditionalPaidAmount = additionalFeesData.reduce(
//           (acc, curr) => acc + curr.paidAmount,
//           0
//         );

//         const totalPaidAmount =
//           totalRegularPaidAmount + totalAdditionalPaidAmount;

//         const totalClassFee = childFormData.totalClassFee || 0;
//         const totalAdditionalFees = childFormData.additionalFee || 0;
//         const totalFeeAmount = parseFloat(totalClassFee + totalAdditionalFees);
//         const concessionFee = parseFloat(childFormData.concessionFee) || 0;
//         const newPaidAmount = totalPaidAmount - concessionFee;
//         const TotalFeeAfterDiscount = concessionFee
//           ? totalFeeAmount - concessionFee
//           : totalFeeAmount;

//         const newFeeData = {
//           studentId: child?.studentId || "",
//           className: child?.class || "",
//           session:session,
//           feeHistory: {
//             regularFees: selectedMonthsData,
//             additionalFees: additionalFeesData,
//             status: childFormData.feeStatus || "Pending",
//             paymentMode: childFormData.paymentMode || "Cash",
//             transactionId: childFormData.transactionId,
//             previousDues: parseFloat(childFormData.previousDues) || 0,
//             remark: childFormData.remarks || "",
//             totalFeeAmount: totalFeeAmount,
//             concessionFee: parseFloat(childFormData.concessionFee || ""),
//             paidAfterConcession:
//               TotalFeeAfterDiscount + parseFloat(childFormData.previousDues) ||
//               0,
//             newPaidAmount: newPaidAmount,
//           },
//         };

//         if (childFormData.paymentMode === "Cheque") {
//           newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//         } else if (childFormData.paymentMode === "Online") {
//           newFeeData.transactionId = childFormData.transactionId || "";
//         }

//         try {
//           const response = await axios.post(
//             "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus",
//             newFeeData,
//             {
//               withCredentials: true,
//               headers: {
//                 Authorization: `Bearer ${authToken}`,
//               },
//             }
//           );

//           toast.success(
//             `Fee created for ${child.studentName}: ${response.data.message}`
//           );

//           setReload((preReload) => !preReload);
//           setIsOpen(false);
//           setModalOpen(false);
//         } catch (error) {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.studentName}: ${
//               error.response?.data?.error || "Server error"
//             }`
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Unhandled Error: ", error);
//       toast.error("An unexpected error occurred. Please try again later.");
//     } finally {
//     }
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//       selectedMonths: [],
//       monthFees: {},
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce((total, fee) => {
//       const monthCount = fee.selectedMonths.length;
//       const feeAmount = parseFloat(fee.value);
//       return total + feeAmount * monthCount;
//     }, 0);

//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       additionalFee: totalAdditionalFee,
//       additionalFeeValues: additionalFeeValues,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeMonthSelection = (
//     index,
//     feeIndex,
//     selectedOptions
//   ) => {
//     const selectedMonths = selectedOptions.map((option) => ({
//       month: option.value,
//       fee: formData[index].additionalFeeValues[feeIndex].fee,
//       value: formData[index].additionalFeeValues[feeIndex].value,
//     }));

//     const updatedFormData = [...formData];
//     updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
//       selectedMonths;

//     const feeValue = updatedFormData[index].additionalFeeValues[feeIndex].value;
//     const monthCount = selectedMonths.length;
//     const totalFeeForCurrent = feeValue * monthCount;
//     updatedFormData[index].additionalFeeValues[feeIndex].totalFee =
//       totalFeeForCurrent;

//     const totalAdditionalFee = updatedFormData[
//       index
//     ].additionalFeeValues.reduce((total, fee) => {
//       return total + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = totalAdditionalFee;
//     setFormData(updatedFormData);
//   };


  
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

//   // Filtered months (excluding previous fee months)
//   const availableMonths = allMonths?.filter(
//     (month) => !prevFeeMonths?.includes(month)
//   );
//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);
//     const updatedFormData = [...formData];
//     if (!updatedFormData[childIndex].monthFees) {
//       updatedFormData[childIndex].monthFees = {};
//     }

//     const sortedMonths = selectedMonths.sort(
//       (a, b) => availableMonths.indexOf(a) - availableMonths.indexOf(b)
//     );
//     const lastSelectedIndex = availableMonths.indexOf(
//       sortedMonths[sortedMonths.length - 1]
//     );
//     const expectedMonths = availableMonths.slice(0, lastSelectedIndex + 1);
//     const isValidSelection = expectedMonths.every((month) =>
//       selectedMonths.includes(month)
//     );

//     if (!isValidSelection) {
//       toast.warn(
//         "You must select months in sequential order starting from the beginning!"
//       );
//       return; // Stop further execution if invalid selection
//     }
//     sortedMonths.forEach((month) => {
//       if (!updatedFormData[childIndex].monthFees[month]) {
//         updatedFormData[childIndex].monthFees[month] =
//           updatedFormData[childIndex].classFee || 0;
//       }
//     });

//     // Remove unselected months from monthFees
//     Object.keys(updatedFormData[childIndex].monthFees).forEach((month) => {
//       if (!sortedMonths.includes(month)) {
//         delete updatedFormData[childIndex].monthFees[month];
//       }
//     });

//     updatedFormData[childIndex].selectedMonths = selectedMonths;
//     updatedFormData[childIndex].totalClassFee =
//       (updatedFormData[childIndex].classFee || 0) * selectedMonths.length;

//     setFormData(updatedFormData);
//   };

//   return (
//     <div className="md:min-h-screen md:pl-0 md:px-0">
//       <div className="flex gap-2 py-2">
//         <ReactInput
//                       type="text"
//                       label="Search by name"
//                       onChange={handleSearch}
//                       value={searchTerm}
//                      />
//         <ReactInput
//                       type="text"
//                       label="Search by Adm. No"
//                       onChange={handleSearchbyAdmissionNo}
//                       value={searchTermbyadmissionNo}
//                       // required_field={required}
                     
                     
//                      />
      
//       </div>
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border md:w-1/2 border-gray-300 rounded mb-2">
//           {filteredStudents.map((student, index) => (
//             <h1
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100 hover:bg-red-300"
//               onClick={() => handleStudentClick(student.parentId)}
//             >
//               {student.studentName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </h1>
//           ))}
//         </div>
//       )}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Create Fees`}>
//         <form
//           onSubmit={handleSubmit}
//           className="flex flex-col md:flex-row gap-2 w-full p-4"
//         >
//           {parentData.map((child, index) => (
//             <div key={index} className="bg-white rounded-lg shadow-md p-2">
//               <div className=" w-full flex items-center flex-row gap-2  mb-2 p-2">
//                 <div>
//                   <input
//                     type="checkbox"
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child,index)}
//                     className="mr-2 "
//                   />
//                 </div>
//                 <div>
//                   <span className=" text-[16px] font-semibold text-blue-800">
//                     {child.studentName} ,
//                   </span>
//                   <span className="text-[16px] text-blue-800">
//                     {" "}
//                     Class : {child.class} ,
//                   </span>
//                   <span className="text-[16px] text-red-600">
//                     {" "}
//                     Total Dues : {child.dues}
//                   </span>
//                   <span className="text-[16px] text-red-600">
//                     {" "}
//                     Late Fine : {lateFine?lateFine:0}
//                   </span>
//                 </div>
//               </div>
//               {showForm[index] && (
//                 <>
//                   <div className="mb-2 bg-gray-100 flex items-center p-2 rounded">
//                     <div className="w-full ">
//                       <div className="flex flex-row bg-gray-100 rounded">
//                         <input
//                           type="checkbox"
//                           checked={formData[index]?.includeClassFee || false}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "includeClassFee",
//                               e.target.checked
//                             )
//                           }
//                           className="mr-2"
//                         />
//                         <label
//                           htmlFor=""
//                           className="block text-sm font-medium text-red-700"
//                         >
//                           Class Fee
//                         </label>
//                       </div>
//                       {formData[index]?.includeClassFee && (
//                         <>
//                           <div>
//                             <label className="block text-sm font-medium text-gray-700 mt-2">
//                               Months
//                             </label>
//                             <Select
                             
//                               options={availableMonths.map((month) => ({
//                                 value: month,
//                                 label: month,
//                               }))}
//                               value={formData[index]?.selectedMonths?.map(
//                                 (month) => ({
//                                   value: month,
//                                   label: month,
//                                 })
//                               )}
//                               onChange={(selectedOptions) =>
//                                 handleMonthSelection(selectedOptions, index)
//                               }
//                               isMulti
//                               name="months"
//                               className="basic-multi-select mt-2"
//                               classNamePrefix="select"
//                             />
//                           </div>
//                           <div className="mt-2">
//                             <label className="block text-sm font-medium text-gray-700">
//                               Total Class Fee: ₹
//                               {formData[index]?.totalClassFee || 0}
//                             </label>
//                           </div>
//                           <div className="w-full flex flex-wrap gap-2 px-2">
//                             {formData[index]?.selectedMonths?.map(
//                               (month, monthIndex) => (
//                                 <div
//                                   key={monthIndex}
//                                   className="bg-gray-200 p-1 rounded-sm"
//                                 >
//                                   <label className="block text-[10px] font-medium text-blue-700">
//                                     {month}
//                                   </label>
//                                   <input
//                                     type="number"
//                                     className="w-12 border rounded-sm p-1 text-[10px]"
//                                     value={formData[index]?.monthFees?.[month]}
//                                     onChange={(e) =>
//                                       handleMonthFeeChange(
//                                         index,
//                                         month,
//                                         e.target.value
//                                       )
//                                     }
//                                   />
//                                 </div>
//                               )
//                             )}
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   <div className="mb-2 px-2  rounded">
//                     <div className="flex flex-row ">
//                       <input
//                         type="checkbox"
//                         checked={
//                           formData[index]?.includeAdditionalFees || false
//                         }
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "includeAdditionalFees",
//                             e.target.checked
//                           )
//                         }
//                         className="mr-2"
//                       />
//                       <label className="block text-sm font-medium text-red-700">
//                         Additional Fees
//                       </label>
//                     </div>

//                     {formData[index]?.includeAdditionalFees && (
//                       <>
//                         <label className="block text-[12px] font-medium text-gray-700 mt-2">
//                           Additional Fees Total Amount: ₹
//                           {formData[index]?.additionalFee || 0}
//                         </label>
//                         <Select
//                           isMulti
//                           options={additionalFees}
//                           onChange={(selectedOptions) =>
//                             handleAdditionalFeesChange(index, selectedOptions)
//                           }
//                           className="basic-single "
//                           classNamePrefix="select"
//                         />
//                         {formData[index]?.additionalFeeValues?.map(
//                           (feeData, feeIndex) => (
//                             <div
//                               key={feeIndex}
//                               className=" mt-1 w-full border-gray-900 p-1 flex flex-wrap gap-2 rounded"
//                             >
//                               <div className="w-full">
//                                 <p className="block text-[15px] font-medium text-blue-700">
//                                   {feeData.fee}: {feeData.value}
//                                 </p>
//                               </div>
//                               <div className="w-full bg-gray-100">
//                                 <label className="block text-[10px] font-medium text-gray-700">
//                                   Months
//                                 </label>
//                                 <Select
//                                   options={[
//                                     "April",
//                                     "May",
//                                     "June",
//                                     "July",
//                                     "August",
//                                     "September",
//                                     "October",
//                                     "November",
//                                     "December",
//                                     "January",
//                                     "February",
//                                     "March",
//                                   ].map((month) => ({
//                                     value: month,
//                                     label: month,
//                                   }))}
//                                   value={feeData.selectedMonths?.map(
//                                     (month) => ({
//                                       value: month.month,
//                                       label: month.month,
//                                     })
//                                   )}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       selectedOptions
//                                     )
//                                   }
//                                   isMulti
//                                   name="months"
//                                   className="text-[10px] mt-1 text-blue-700"
//                                   classNamePrefix="select"
//                                 />

//                                 <div className="w-full flex flex-wrap gap-2   px-2">
//                                   {feeData.selectedMonths?.map(
//                                     (monthData, monthIndex) => (
//                                       <div
//                                         key={monthIndex}
//                                         className="bg-gray-200 p-2 rounded"
//                                       >
//                                         <label className="block text-[10px] font-medium text-blue-700">
//                                           {`
                                               
//                                                  ${monthData.month}`}
//                                         </label>
//                                         <input
//                                           type="number"
//                                           className="w-16 border rounded-sm p-1 text-[10px]"
//                                           value={monthData.value || ""}
//                                           onChange={(e) =>
//                                             handleAdditionalFeeChange(
//                                               index,
//                                               feeIndex,
//                                               monthData.month,
//                                               e.target.value
//                                             )
//                                           }
//                                         />
//                                       </div>
//                                     )
//                                   )}
//                                 </div>
//                               </div>
//                             </div>
//                           )
//                         )}
//                       </>
//                     )}
//                   </div>

//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
//                     <div className="px-2 ">
//                       <label className="block text-[14px] font-medium text-gray-600">
//                         Fee Date
//                       </label>
//                       <input
//                         type="date"
//                         value={formData[index]?.feeDate || getCurrentDate()}
//                         onChange={(e) =>
//                           handleInputChange(index, "feeDate", e.target.value)
//                         }
//                         className="w-full border p-1 rounded"
//                       />
//                     </div>
//                     <div className="p-2 ">
//                       <div className="">
//                         <label className="block text-[14px] font-medium text-gray-600">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index]?.paymentMode || "Cash"}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border p-1 rounded"
//                         >
//                           {" "}
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                         </select>
//                       </div>

//                       {formData[index]?.paymentMode === "Online" && (
//                         <div className="mb-4">
//                           <label className="block text-[14px] font-medium text-gray-600">
//                             Transaction ID
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index]?.transactionId || ""}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "transactionId",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border p-1 rounded"
//                           />
//                         </div>
//                       )}

//                       {formData[index]?.paymentMode === "Cheque" && (
//                         <div className="mb-2">
//                           <label className="block text-[14px] font-medium text-gray-600">
//                             Cheque Book No
//                           </label>
//                           <input
//                             type="text"
//                             value={formData[index]?.transactionId || ""}
//                             onChange={(e) =>
//                               handleInputChange(
//                                 index,
//                                 "transactionId",
//                                 e.target.value
//                               )
//                             }
//                             className="w-full border p-1 rounded"
//                           />
//                         </div>
//                       )}
//                     </div>

//                     <div className="px-2">
//                       <label className="block text-[14px] font-medium text-gray-600">
//                         Concession Amount
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="amount"
//                         value={formData[index]?.concessionFee}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "concessionFee",
//                             e.target.value
//                           )
//                         }
//                         className="w-full border p-1 rounded"
//                       />
//                     </div>
//                   </div>
//                   <label className=" px-2 block text-[16px] font-medium text-blue-900">
//                     Total Amount :{" "}
//                     {`${
//                       (formData[index]?.additionalFee || 0) +
//                       (formData[index]?.totalClassFee || 0)
//                     } + ${formData[index]?.previousDues || 0} -
//                                 ${formData[index]?.concessionFee || 0} `}{" "}
//                     = ₹{" "}
//                     {(formData[index]?.additionalFee || 0) +
//                       (formData[index]?.totalClassFee || 0) +
//                       parseFloat(formData[index]?.previousDues || 0) -
//                       (formData[index]?.concessionFee || 0)}
//                   </label>

//                   <div className="p-2">
//                     <label className="block text-[14px] font-medium text-gray-600">
//                       Remarks
//                     </label>
//                     <textarea
//                       type="text"
//                       value={formData[index]?.remarks || ""}
//                       onChange={(e) =>
//                         handleInputChange(index, "remarks", e.target.value)
//                       }
//                       className="w-full border p-1 rounded"
//                     />
//                   </div>
//                 </>
//               )}
//             </div>
//           ))}
//         </form>
//         <>
//           <div className="gap-2 p-2 w-full">
//             <button
//               type="submit"
//               onClick={handleSubmit}
//               className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end my-2"
//             >
//               Submit
//             </button>
//             <button
//               type="button"
//               onClick={() => setModalOpen(false)}
//               className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//             >
//               Cancel
//             </button>
//           </div>
//         </>
//       </Modal>
//       <Table reLoad={reLoad} />
//     </div>
//   );
// };

// export default CreateFees;





// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import { feescreateFeeStatus, feesfeeHistory, getAdditionalfees, getfees, ActiveStudents, parentandchildwithID, LateFines } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";
// import moment from "moment";

// const CreateFees = () => {
//   const session =JSON.parse(localStorage.getItem("session"))
//   const { setIsLoader } = useStateContext();
//   const user = JSON.parse(localStorage.getItem("user"))
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFees, setAdditionalFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [feeHistory, setFeeHistory] = useState([]);
//   const [prevFeeMonths, setPrevFeeMonths] = useState([]);
//   const [lateFine, setLateFine] = useState([]);
 
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [whatsAppMsg, setWhatsAppMsg] = useState("");
//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeDate: "",
//       paymentMode: "Cash",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = localStorage.getItem("token");

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const getFeeHistory = async () => {
//     try {
//       const response = await feesfeeHistory()
      
//       if (response?.success) {
//         setFeeHistory(response?.data);
//       }
//       else {
//         toast?.error(response?.message)
//       }
   
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//   const getLateFine = async () => {
//     try {
//       const response = await LateFines()
      
//       if (response?.success) {
//         // setFeeHistory(response?.data);
//         setLateFine(response?.data)
//       }
//       else {
//         toast?.error(response?.message)
//       }
   
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//   useEffect(() => {
//     getFeeHistory();
//     getLateFine()
//   }, []);

//   const getAllStudent = async () => {
//     setIsLoader(true)
//     try {
//       const response = await ActiveStudents();
//       if (response) {
//         setAllStudent(response?.students?.data);
//       }
//       // console.log("response all student", response?.allStudent);
//     } catch (error) {
//       console.log("error", error)
//     }
//     finally {
//       setIsLoader(false)
//     }
//   };
//   useEffect(() => {
//     getAllStudent();
//   }, []);
//   // console.log("allstudent",allStudent)
//   const handleSearch = (event) => {
//     const searchValue = event?.target?.value?.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent?.filter(
//         (student) =>
//           student?.studentName &&
//           student?.studentName?.toLowerCase()?.includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };
//   const handleSearchbyAdmissionNo = (event) => {
//     const searchValue = event?.target?.value?.toLowerCase()?.trim();
//     setSearchTermbyadmissionNo(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent?.filter(
//         (student) =>
//           student.admissionNumber &&
//           student.admissionNumber?.toLowerCase()?.includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true)
//     try {
//       const response = await parentandchildwithID(parentId)
//       if (response?.success) {
//         setIsLoader(false)
//         const children = response?.children;
//         setParentData(children);

//        // Initialize formData with previousDues
//         const initialFormData = children?.map((child) => ({
//            admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [],
//           feeDate: getCurrentDate(),
//           paymentMode: "Cash",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           previousDues: child.dues || 0,  // Set initial value from child.dues
//         }));

//         setFormData(initialFormData);
//         setIsOpen(true);
//         setModalOpen(true);
//       }
//       else {
//         toast?.error(response?.message)
//       }
//     } catch (error) {
//       console.error("Error", error);
//     }

//   };

//   const handleChildSelection = async (child, index) => {
// // console.log("child",child)
// // console.log("feeHistory",feeHistory)


//     const matchedStudents = feeHistory.filter(
//       (val) => val?.studentId == child?.studentId
//     );

//     const allMonths =
//       matchedStudents.flatMap((student) =>
//         student?.regularFees?.map((fee) => fee?.month)
//       ) || [];
// // console.log("allMonths",allMonths)
//     setPrevFeeMonths(allMonths);

//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;
//     setIsLoader(true)
//     try {
//       const response = await getAdditionalfees()
//       if (response?.success) {
//         setIsLoader(false)

//         const feesData = response?.data
//           .filter((feeType) => feeType.className === studentClass)
//           .map((fee) => {
//             const label = fee.name ? `${fee.name}` : "Unknown Fee";
//             const value = fee.amount ? fee.amount : 0;
//             return {
//               label,
//               value,
//             };
//           });
//         setAdditionalFees(feesData);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }

//     try {
//       const response = await getfees()
//       if (response?.success) {
//         const data = response?.data;

//         if (Array.isArray(data)) {
//           const studentFeeAmount =
//             data
//               .filter((feeType) => feeType.className === studentClass)
//               .map((classData) => classData.amount)[0] || 0;

//           const updatedFormData = [...formData];
//           updatedFormData[index] = {
//             ...updatedFormData[index],
//             classFee: studentFeeAmount,
//             selectedMonths: updatedFormData[index]?.selectedMonths || [],
//             totalRegularFee:
//               studentFeeAmount *
//               (updatedFormData[index]?.selectedMonths.length || 1),
//             additionalFee: updatedFormData[index]?.additionalFee || 0,
//           };
//           setIsLoader(false)
//           setFormData(updatedFormData);
//         }
//       }
//     } catch (error) {

//     }

//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (updatedSelectedChildren.includes(index)) {
//       updatedSelectedChildren.splice(updatedSelectedChildren.indexOf(index), 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setFormData(updatedFormData);
//   };

//   const handleSubmit = async (e) => {
//     setIsLoader(true)
//     e.preventDefault();
//     try {
//       for (const childIndex of selectedChildren) {
//         const child = parentData[childIndex];

//         const childFormData = formData[childIndex] || {};
//         if(!childFormData.paidAmount){
// toast.error("Please fill Paid Amount")
// return
//         }
//         if (!childFormData.paymentMode) {
//           toast.error(`Payment mode is required for ${child.studentName}`);
//           continue;
//         }

//         const selectedMonthsData =
//           (childFormData.selectedMonths || []).map((month) => {
//             const paidAmount = Number(childFormData.monthFees?.[month]) || 0;

//             return {
//               month: month,
//               paidAmount: paidAmount,
//             };
//           }) || [];

//         const totalRegularPaidAmount = selectedMonthsData.reduce(
//           (acc, curr) => acc + curr.paidAmount,
//           0
//         );

//         const additionalFeesData = (
//           childFormData.additionalFeeValues || []
//         ).flatMap((feeData) => {
//           return (feeData.selectedMonths || []).map((month) => ({
//             name: feeData.fee,
//             month: month.month,
//             paidAmount: Number(month.value) || 0,
//           }));
//         });

//         const totalAdditionalPaidAmount = additionalFeesData.reduce(
//           (acc, curr) => acc + curr.paidAmount,
//           0
//         );

//         const totalPaidAmount =
//           totalRegularPaidAmount + totalAdditionalPaidAmount;

//         const totalClassFee = childFormData.totalClassFee || 0;
//         const totalAdditionalFees = childFormData.additionalFee || 0;
//         const totalFeeAmount = parseFloat(totalClassFee + totalAdditionalFees);
//         const concessionFee = parseFloat(childFormData.concessionFee) || 0;
//         const newPaidAmount = totalPaidAmount - concessionFee;
//         const TotalFeeAfterDiscount = concessionFee
//           ? totalFeeAmount - concessionFee
//           : totalFeeAmount;

//         const newFeeData = {

//           studentId: child?.studentId || "",
//           session:session,
//           // admissionNumber: child?.admissionNumber || "",
//           className: child?.class || "",
//           feeHistory: {
//             regularFees: selectedMonthsData,
//             additionalFees: additionalFeesData,
//             // status: childFormData.feeStatus || "Pending",
//             paymentMode: childFormData.paymentMode || "Cash",
//             transactionId: childFormData.transactionId,
//             // previousDues: parseFloat(childFormData.previousDues) || 0,
//             pastDuesPaid: parseFloat(childFormData.previousDues) || 0,
//             remark: childFormData.remarks || "",
//             totalFeeAmount: totalFeeAmount,
//             concessionFee: parseFloat(childFormData.concessionFee || ""),
//             // paidAfterConcession:
//             //   TotalFeeAfterDiscount + parseFloat(childFormData.previousDues) ||
//             //   0,

//             newPaidAmount: parseFloat(childFormData.paidAmount || ""),
//           },
//         };

//         if (childFormData.paymentMode === "Cheque") {
//           newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//         } else if (childFormData.paymentMode === "Online") {
//           newFeeData.transactionId = childFormData.transactionId || "";
//         }

//         try {
//           const response = await feescreateFeeStatus(newFeeData)
//           if (response?.success) {
//             toast.success(
//               `Fee created for ${child?.studentName}: ${response.data?.data?.message} `
//             );

//             setWhatsAppMsg(response);
//             setIsModalOpen(true);
//             getFeeHistory();
//             setReload((preReload) => !preReload);
//             setIsOpen(false);
//             setModalOpen(false);
//             setIsLoader(false)
//           }
//           else {
//             toast?.error(response?.message)
//           }
//         } catch (error) {
//           console.error("Error: ", error);
//           setIsLoader(false)
//         }
//       }
//     } catch (error) {

//       console.error("Error: ", error);
//     } finally {
//       setIsLoader(false)
//     }
//   };

//   const sendWhatsAppMessage = (fee) => { // Add phoneNumber as an argument
//     const receiptCard = `
//     ------------------------------------
//         ✨ *Fee Receipt* ✨
//     ------------------------------------
//     *Admission No:* \`${fee.feeStatus?.admissionNumber}\`
//     *Name:* \`${fee.studentDetails?.studentName}\`
//     *Class:* \`${fee.studentDetails?.class}\`
//     *Receipt No:* \`${fee.feeReceiptNumber}\`
   
//     *Total Amount Paid:* \`₹${fee.totalAmountPaid}\`
//     *Month:* \`${fee.feeHistory?.regularFees?.map((val) => val?.month)}\`
//     *Dues:* \`₹${fee.feeStatus?.dues || "0"}\`
//     *Remarks:* _${fee.remark || 'N/A'}_
//     ------------------------------------
//                 *Thank you!* 🙏
//    If there are any issues, please contact the accountant.
//     ------------------------------------
//     `;

//     const message = `*${user?.schoolName}*\n${user?.address}\n${user?.contact}\n${receiptCard}`; // Add intro text
//     const encodedMessage = encodeURIComponent(message);
//     const whatsappURL = `https://wa.me/${fee?.parentDetails?.contact}?text=${encodedMessage}`;

//     window.open(whatsappURL, "_blank");
//   };
//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//       selectedMonths: [],
//       monthFees: {},
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce((total, fee) => {
//       const monthCount = fee.selectedMonths.length;
//       const feeAmount = parseFloat(fee.value);
//       return total + feeAmount * monthCount;
//     }, 0);

//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       additionalFee: totalAdditionalFee,
//       additionalFeeValues: additionalFeeValues,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeMonthSelection = (
//     index,
//     feeIndex,
//     selectedOptions
//   ) => {
//     const selectedMonths = selectedOptions.map((option) => ({
//       month: option.value,
//       fee: formData[index].additionalFeeValues[feeIndex].fee,
//       value: formData[index].additionalFeeValues[feeIndex].value,
//     }));

//     const updatedFormData = [...formData];
//     updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
//       selectedMonths;

//     const feeValue = updatedFormData[index].additionalFeeValues[feeIndex].value;
//     const monthCount = selectedMonths.length;
//     const totalFeeForCurrent = feeValue * monthCount;
//     updatedFormData[index].additionalFeeValues[feeIndex].totalFee =
//       totalFeeForCurrent;

//     const totalAdditionalFee = updatedFormData[
//       index
//     ].additionalFeeValues.reduce((total, fee) => {
//       return total + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = totalAdditionalFee;
//     setFormData(updatedFormData);
//   };

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

//   // Filtered months (excluding previous fee months)
//   const availableMonths = allMonths?.filter(
//     (month) => !prevFeeMonths?.includes(month)
//   );
// // {console.log("availableMonths",availableMonths)}
//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);
//     const updatedFormData = [...formData];
//     if (!updatedFormData[childIndex].monthFees) {
//       updatedFormData[childIndex].monthFees = {};
//     }

//     const sortedMonths = selectedMonths.sort(
//       (a, b) => availableMonths.indexOf(a) - availableMonths.indexOf(b)
//     );
//     const lastSelectedIndex = availableMonths.indexOf(
//       sortedMonths[sortedMonths.length - 1]
//     );
//     const expectedMonths = availableMonths.slice(0, lastSelectedIndex + 1);
//     const isValidSelection = expectedMonths.every((month) =>
//       selectedMonths.includes(month)
//     );

//     if (!isValidSelection) {
//       toast.warn(
//         "You must select months in sequential order starting from the beginning!"
//       );
//       return; // Stop further execution if invalid selection
//     }
//     sortedMonths.forEach((month) => {
//       if (!updatedFormData[childIndex].monthFees[month]) {
//         updatedFormData[childIndex].monthFees[month] =
//           updatedFormData[childIndex].classFee || 0;
//       }
//     });

//     // Remove unselected months from monthFees
//     Object.keys(updatedFormData[childIndex].monthFees).forEach((month) => {
//       if (!sortedMonths.includes(month)) {
//         delete updatedFormData[childIndex].monthFees[month];
//       }
//     });

//     updatedFormData[childIndex].selectedMonths = selectedMonths;
//     updatedFormData[childIndex].totalClassFee =
//       (updatedFormData[childIndex].classFee || 0) * selectedMonths.length;

//     setFormData(updatedFormData);
//   };

//   return (
//     <div className="md:min-h-screen md:pl-0 md:px-0 p-2">
//       <div className="flex gap-5 py-2">
//         <ReactInput

//           type="text"
//           label="Search by name"
//           onChange={handleSearch}
//           value={searchTerm}
//         />
        
//       </div>
      
//       {filteredStudents?.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border md:w-1/4 border-gray-300 rounded mb-2  shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
//           {filteredStudents?.map((student, index) => (
//             <h1
//               key={index}

//               className="p-2 border-b cursor-pointer hover:shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
//               onClick={() => handleStudentClick(student?.parentId)}
//             >
//               {student?.studentName || "No Name"}, {student?.class},{" "}
//               {student?.fatherName}, {student?.admissionNumber}
//             </h1>
//           ))}
//         </div>
//       )}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Create Fees`} dynamicWidth="50vw">
//         <form
//           onSubmit={handleSubmit}
//           className="flex flex-col md:flex-row gap-2 w-full "
//         >
//           {parentData.map((child, index) => (
//             <div key={index} className="bg-white rounded-lg shadow-md ">
//               <div className=" w-full flex items-center flex-row gap-2   p-2">
//                 <div>
//                   <input
//                     type="checkbox"
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-2 "
//                   />
//                 </div>
//                 <div>
//                   <span className=" text-[16px] font-semibold text-blue-800">
//                     {child.studentName} ,
//                   </span>
//                   <span className="text-[16px] text-blue-800">
//                     {" "}
//                     Class : {child.class} ,
//                   </span>
//                   <span className="text-[16px] text-red-600">
//                     {" "}
//                     Total Dues : {child.dues}
//                   </span>
//                 </div>
//               </div>
//               {showForm[index] && (
//                 <>
//                   <div className="  flex items-center p-2 rounded">
//                     <div className="w-full ">
//                       <div className="flex flex-row  rounded">
//                         <input
//                           type="checkbox"
//                           checked={formData[index]?.includeClassFee || false}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "includeClassFee",
//                               e.target.checked
//                             )
//                           }
//                           className="mr-2"
//                         />
//                         <label
//                           htmlFor=""
//                           className="block text-sm font-medium text-red-700"
//                         >
//                           Class Fee
//                         </label>
//                       </div>
//                       {formData[index]?.includeClassFee && (
//                         <>
//                           <div>
                           
//                             <Select
//                               options={availableMonths.map((month) => ({
//                                 value: month,
//                                 label: month,
//                               }))}
//                               value={formData[index]?.selectedMonths?.map(
//                                 (month) => ({
//                                   value: month,
//                                   label: month,
//                                 })
//                               )}
//                               onChange={(selectedOptions) =>
//                                 handleMonthSelection(selectedOptions, index)
//                               }
//                               isMulti
//                               name="months"
//                               className="basic-multi-select "
//                               classNamePrefix="select"
//                             />

//                           </div>

//                           <div className="w-full  flex flex-wrap gap-1 px-2 bg-[#151b4b]">
//                             {formData[index]?.selectedMonths?.map(
//                               (month, monthIndex) => (
//                                 <div
//                                   key={monthIndex}
//                                   className="shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] p-1 rounded-sm"
//                                 >
//                                   <label className="block text-[10px] font-medium text-white">
//                                     {month} : {formData[index]?.monthFees?.[month]}
//                                   </label>

//                                 </div>
//                               )
//                             )} <span className="text-yellow-700">
//                               = {formData[index]?.totalClassFee || 0}
//                             </span>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   <div className="mb-2 px-2  rounded">
//                     <div className="flex flex-row ">
//                       <input
//                         type="checkbox"
//                         checked={
//                           formData[index]?.includeAdditionalFees || false
//                         }
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "includeAdditionalFees",
//                             e.target.checked
//                           )
//                         }
//                         className="mr-2"
//                       />
//                       <label className="block text-sm font-medium text-red-700">
//                         Additional Fees
//                       </label>
//                     </div>

//                     {formData[index]?.includeAdditionalFees && (
//                       <>

//                         <Select
//                           isMulti
//                           options={additionalFees}
//                           onChange={(selectedOptions) =>
//                             handleAdditionalFeesChange(index, selectedOptions)
//                           }
//                           className="basic-single "
//                           classNamePrefix="select"
//                         />
//                         {formData[index]?.additionalFeeValues?.map(
//                           (feeData, feeIndex) => (
//                             <div
//                               key={feeIndex}
//                               className=" w-full  flex flex-wrap gap-2 rounded"
//                             >
//                               <div className="w-full">
//                                 <p className="block text-[10px] font-medium text-blue-700">
//                                   {feeData.fee}: {feeData.value}
//                                 </p>
//                               </div>
//                               <div className="w-full">

//                                 <Select
//                                   options={[
//                                     "April",
//                                     "May",
//                                     "June",
//                                     "July",
//                                     "August",
//                                     "September",
//                                     "October",
//                                     "November",
//                                     "December",
//                                     "January",
//                                     "February",
//                                     "March",
//                                   ].map((month) => ({
//                                     value: month,
//                                     label: month,
//                                   }))}
//                                   value={feeData.selectedMonths?.map(
//                                     (month) => ({
//                                       value: month.month,
//                                       label: month.month,
//                                     })
//                                   )}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       selectedOptions
//                                     )
//                                   }
//                                   isMulti
//                                   name="months"
//                                   className="text-[10px] mt-1 text-blue-700"
//                                   classNamePrefix="select"
//                                 />

//                                 <div className="w-full flex flex-wrap  items-center gap-2 bg-[#151b4b]  px-2">
//                                   {feeData.selectedMonths?.map(
//                                     (monthData, monthIndex) => (

//                                       <label className="block text-[10px] font-medium text-white">
//                                         {`
                                               
//                                                  ${monthData.month} :${monthData.value || ""}`}
//                                       </label>

//                                     )
//                                   )}
//                                   <span className="text-yellow-700">
//                                     = {formData[index]?.additionalFee || 0}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           )
//                         )}
//                       </>
//                     )}
//                   </div>

//                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
//                   <div className=" bg-[#c25151] rounded-md">
//                   <div className="flex flex-wrap gap-2  ">
//                     <div className="px-2 w-[150px]">
//                       <label className="block text-[14px] font-medium text-white">
//                         Fee Date
//                       </label>
//                       <input
//                         type="date"
//                         value={formData[index]?.feeDate || getCurrentDate()}
//                         onChange={(e) =>
//                           handleInputChange(index, "feeDate", e.target.value)
//                         }
//                         className="w-full border p-1 rounded"
//                       />
//                     </div>
                    
//                       <div className="px-2 w-[150px]">
//                         <label className="block text-[14px] font-medium text-white">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index]?.paymentMode || "Cash"}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border p-1 rounded"
//                         >
//                           {" "}
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                         </select>
//                       </div>

//                       <div className="">
//                         {formData[index]?.paymentMode === "Online" && (
//                           <div className="px-2 w-[150px]">
//                             <label className="block text-[14px] font-medium text-white">
//                               Transaction ID
//                             </label>
//                             <input
//                               type="text"
//                               value={formData[index]?.transactionId || ""}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "transactionId",
//                                   e.target.value
//                                 )
//                               }
//                               className="w-full border p-1 rounded"
//                             />
//                           </div>
//                         )}

//                         {formData[index]?.paymentMode === "Cheque" && (
//                           <div className="px-2 w-[150px]">
//                             <label className="block text-[14px] font-medium text-white">
//                               Cheque Book No
//                             </label>
//                             <input
//                               type="text"
//                               value={formData[index]?.transactionId || ""}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "transactionId",
//                                   e.target.value
//                                 )
//                               }
//                               className="w-full border p-1 rounded"
//                             />
//                           </div>
//                         )}
//                       </div>
                    

//                     <div className="px-2 w-[150px]">
//                       <label className="block text-[14px] font-medium text-white">
//                         Concession Amount
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="amount"
//                         value={formData[index]?.concessionFee}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "concessionFee",
//                             e.target.value
//                           )
//                         }
//                         className="w-full border p-1 rounded"
//                       />
//                     </div>
//                     <div className="px-2">
//                     <label className="block text-[14px] font-medium text-white">
//                       Remarks
//                     </label>
//                     <textarea
//                       type="text"
//                       value={formData[index]?.remarks || ""}
//                       onChange={(e) =>
//                         handleInputChange(index, "remarks", e.target.value)
//                       }
//                       className="w-full border p-1 rounded"
//                       rows="1" // Or any other minimum number of rows
//                       cols="30"
//                     />
//                   </div>

                    
//                   </div>
                  

//                   <div className="w-full flex justify-end mt-2">
//                     <div className="px-2 w-full text-start">
//                       <label className="block text-[14px] font-medium text-white">
//                         Paid Amount
//                       </label>
//                       <input

//                         type="number"
//                         placeholder="amount"
//                         value={formData[index]?.paidAmount}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "paidAmount",
//                             e.target.value
//                           )
//                         }
//                         className="w-full border p-1  bg-[#151b4b] text-yellow-700"
//                       />
//                     </div>
//                   </div>
//                   </div>
//                   <div className=" bg-lime-500 p-4 rounded-lg shadow-md">
//   <table className="w-full border-collapse border border-gray-200 text-left">
//     <thead>
//       <tr className="bg-lime-600 text-white">
//         <th className="px-2 py-1 border">Description</th>
//         <th className="px-2 py-1 border">Amount</th>
//       </tr>
//     </thead>
//     <tbody>
//       <tr className="border">
//         <td className="px-2 py-1 border">Class Fee</td>
//         <td className="px-2 py-1 border">{(formData[index]?.totalClassFee || 0)}.00</td>
//       </tr>
//       <tr className="border">
//         <td className="px-2 py-1 border">Additional Fee</td>
//         <td className="px-2 py-1 border">{(formData[index]?.additionalFee || 0)}.00</td>
//       </tr>
//       <tr className="border">
//          <td className="px-2 py-1 border">Previous Dues</td>
//          <td className="px-2 py-1 border">{formData[index]?.previousDues}.00</td>
//       </tr>
//        <tr className="border">
//         <td className="px-2 py-1 border">Late Fine</td>
//         <td className="px-2 py-1 border">
//           {
//             lateFine
//               .filter((fine) => fine.className === child.class)
//               .reduce((sum, fine) => sum + fine.amount, 0) // Sum late fees for the class
//               .toFixed(2)
//           }
//         </td>
//       </tr>
//       <tr className="border">
//         <td className="px-2 py-1 border">Concession Amt.</td>
//         <td className="px-2 py-1 border">{(formData[index]?.concessionFee || 0)}.00</td>
//       </tr>
//       <tr className="border  font-bold">
//         <td className="px-2 py-1 border">Total Amount</td>
//         <td className="px-2 py-1 border">{(formData[index]?.additionalFee || 0) +
//                       (formData[index]?.totalClassFee || 0) +
//                       parseFloat(formData[index]?.previousDues || 0) +
//                       lateFine
//                       .filter((fine) => fine.className === child.class)
//                       .reduce((sum, fine) => sum + fine.amount, 0) -
//                       (formData[index]?.concessionFee || 0)}.00</td>
//       </tr>
//       <tr className="border  font-bold">
//         <td className="px-2 py-1 border">Paid Amount</td>
//         <td className="px-2 py-1 border">
//           {formData[index]?.paidAmount?formData[index]?.paidAmount:0}.00

//         </td>
//       </tr>
//       <tr className="border  font-bold">
//         <td className="px-2 py-1 border text-red-800">Dues Amount</td>

//         <td className="px-2 py-1 border">
//   {(
//     (formData[index]?.additionalFee || 0) +
//     (formData[index]?.totalClassFee || 0) +
//      parseFloat(formData[index]?.previousDues || 0) +
//     lateFine
//     .filter((fine) => fine.className === child.class)
//     .reduce((sum, fine) => sum + fine.amount, 0) -
//     (formData[index]?.concessionFee || 0) -
//     (formData[index]?.paidAmount || 0)
//   ).toFixed(2)}
// </td>
//       </tr>
//     </tbody>
//   </table>
// </div>

//                  </div>
                  
//                 </>
//               )}
//             </div>
//           ))}
//         </form>
//         <>
//           <div className="gap-2 px-2 my-1 w-full flex justify-center items-center ">
//             <button
//               type="submit"
//               onClick={handleSubmit}
//               className="bg-blue-500 w-full text-white px-4 py-1 rounded self-end "
//             >
//               Submit
//             </button>
//             <button
//               type="button"
//               onClick={() => setModalOpen(false)}
//               className="bg-gray-500 w-full text-white px-4 py-1 rounded self-end"
//               >
//               Cancel
//             </button>
//           </div>
//         </>
//       </Modal>

//       <Table reLoad={reLoad} />
//       <Modal
//         setIsOpen={() => setIsModalOpen(false)}
//         isOpen={isModalOpen} title={"Addmission Successfully!"} maxWidth="100px">
//         <div className="bg-white p-6 rounded-lg shadow-lg">
//           <p>Do you want to send this</p>
//           <p> message to this number?</p>
//           <span className="text-indigo-800">{whatsAppMsg?.contact}</span>
//           <span></span>
//           <div className="mt-4 flex justify-end space-x-4">
//             {/* {console.log("whatsAppMsg",whatsAppMsg)} */}
//             <button
//               onClick={() => sendWhatsAppMessage(whatsAppMsg?.data?.data)}
//               className="bg-green-500 text-white px-4 py-2 rounded w-full"
//             >
//               OK
//             </button>
//             <button
//               onClick={() => setIsModalOpen(false)}
//               className="bg-gray-500 text-white px-4 py-2 rounded w-full"
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




// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import { feescreateFeeStatus, feesfeeHistory, getAdditionalfees, getfees, ActiveStudents, parentandchildwithID, LateFines } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// const CreateFees = () => {
//   const { setIsLoader } = useStateContext();
//   const user = JSON.parse(localStorage.getItem("user"))
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFees, setAdditionalFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [feeHistory, setFeeHistory] = useState([]);
//   const [prevFeeMonths, setPrevFeeMonths] = useState([]);
//   const [lateFine, setLateFine] = useState([]);
//    console.log("lateFine",lateFine)
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [whatsAppMsg, setWhatsAppMsg] = useState("");
//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeDate: "",
//       paymentMode: "Cash",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = localStorage.getItem("token");

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const getFeeHistory = async () => {
//     try {
//       const response = await feesfeeHistory()
      
//       if (response?.success) {
//         setFeeHistory(response?.data);
//       }
//       else {
//         toast?.error(response?.message)
//       }
   
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//   const getLateFine = async () => {
//     try {
//       const response = await LateFines()
      
//       if (response?.success) {
//         // setFeeHistory(response?.data);
//         setLateFine(response?.data)
//       }
//       else {
//         toast?.error(response?.message)
//       }
   
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//   useEffect(() => {
//     getFeeHistory();
//     getLateFine()
//   }, []);

//   const getAllStudent = async () => {
//     setIsLoader(true)
//     try {
//       const response = await ActiveStudents();
//       if (response) {
//         setAllStudent(response?.students?.data);
//       }
//       // console.log("response all student", response?.allStudent);
//     } catch (error) {
//       console.log("error", error)
//     }
//     finally {
//       setIsLoader(false)
//     }
//   };
//   useEffect(() => {
//     getAllStudent();
//   }, []);
//   // console.log("allstudent",allStudent)
//   const handleSearch = (event) => {
//     const searchValue = event?.target?.value?.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent?.filter(
//         (student) =>
//           student?.studentName &&
//           student?.studentName?.toLowerCase()?.includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };
//   const handleSearchbyAdmissionNo = (event) => {
//     const searchValue = event?.target?.value?.toLowerCase()?.trim();
//     setSearchTermbyadmissionNo(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent?.filter(
//         (student) =>
//           student.admissionNumber &&
//           student.admissionNumber?.toLowerCase()?.includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true)
//     try {
//       const response = await parentandchildwithID(parentId)
//       if (response?.success) {
//         setIsLoader(false)
//         const children = response?.children;
//         setParentData(children);
//         const initialFormData = children?.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [],
//           feeDate: getCurrentDate(),
//           paymentMode: "Cash",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//         }));

//         setFormData(initialFormData);
//         setIsOpen(true);
//         setModalOpen(true);
//       }
//       else {
//         toast?.error(response?.message)
//       }
//     } catch (error) {
//       console.error("Error", error);
//     }

//   };

//   const handleChildSelection = async (child, index) => {
// console.log("child",child)


//     const matchedStudents = feeHistory.filter(
//       (val) => val?.admissionNumber == child?.admissionNumber
//     );

//     const allMonths =
//       matchedStudents.flatMap((student) =>
//         student?.regularFees?.map((fee) => fee?.month)
//       ) || [];

//     setPrevFeeMonths(allMonths);

//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;
//     setIsLoader(true)
//     try {
//       const response = await getAdditionalfees()
//       if (response?.success) {
//         setIsLoader(false)

//         const feesData = response?.data
//           .filter((feeType) => feeType.className === studentClass)
//           .map((fee) => {
//             const label = fee.name ? `${fee.name}` : "Unknown Fee";
//             const value = fee.amount ? fee.amount : 0;
//             return {
//               label,
//               value,
//             };
//           });
//         setAdditionalFees(feesData);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }

//     try {
//       const response = await getfees()
//       if (response?.success) {
//         const data = response?.data;

//         if (Array.isArray(data)) {
//           const studentFeeAmount =
//             data
//               .filter((feeType) => feeType.className === studentClass)
//               .map((classData) => classData.amount)[0] || 0;

//           const updatedFormData = [...formData];
//           updatedFormData[index] = {
//             ...updatedFormData[index],
//             classFee: studentFeeAmount,
//             selectedMonths: updatedFormData[index]?.selectedMonths || [],
//             totalRegularFee:
//               studentFeeAmount *
//               (updatedFormData[index]?.selectedMonths.length || 1),
//             additionalFee: updatedFormData[index]?.additionalFee || 0,
//           };
//           setIsLoader(false)
//           setFormData(updatedFormData);
//         }
//       }
//     } catch (error) {

//     }

//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (updatedSelectedChildren.includes(index)) {
//       updatedSelectedChildren.splice(updatedSelectedChildren.indexOf(index), 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setFormData(updatedFormData);
//   };

//   const handleSubmit = async (e) => {
//     setIsLoader(true)
//     e.preventDefault();
//     try {
//       for (const childIndex of selectedChildren) {
//         const child = parentData[childIndex];

//         const childFormData = formData[childIndex] || {};
//         if (!childFormData.paymentMode) {
//           toast.error(`Payment mode is required for ${child.studentName}`);
//           continue;
//         }

//         const selectedMonthsData =
//           (childFormData.selectedMonths || []).map((month) => {
//             const paidAmount = Number(childFormData.monthFees?.[month]) || 0;

//             return {
//               month: month,
//               paidAmount: paidAmount,
//             };
//           }) || [];

//         const totalRegularPaidAmount = selectedMonthsData.reduce(
//           (acc, curr) => acc + curr.paidAmount,
//           0
//         );

//         const additionalFeesData = (
//           childFormData.additionalFeeValues || []
//         ).flatMap((feeData) => {
//           return (feeData.selectedMonths || []).map((month) => ({
//             name: feeData.fee,
//             month: month.month,
//             paidAmount: Number(month.value) || 0,
//           }));
//         });

//         const totalAdditionalPaidAmount = additionalFeesData.reduce(
//           (acc, curr) => acc + curr.paidAmount,
//           0
//         );

//         const totalPaidAmount =
//           totalRegularPaidAmount + totalAdditionalPaidAmount;

//         const totalClassFee = childFormData.totalClassFee || 0;
//         const totalAdditionalFees = childFormData.additionalFee || 0;
//         const totalFeeAmount = parseFloat(totalClassFee + totalAdditionalFees);
//         const concessionFee = parseFloat(childFormData.concessionFee) || 0;
//         const newPaidAmount = totalPaidAmount - concessionFee;
//         const TotalFeeAfterDiscount = concessionFee
//           ? totalFeeAmount - concessionFee
//           : totalFeeAmount;

//         const newFeeData = {
//           studentId: child?.studentId || "",
//           // admissionNumber: child?.admissionNumber || "",
//           className: child?.class || "",
//           feeHistory: {
//             regularFees: selectedMonthsData,
//             additionalFees: additionalFeesData,
//             status: childFormData.feeStatus || "Pending",
//             paymentMode: childFormData.paymentMode || "Cash",
//             transactionId: childFormData.transactionId,
//             previousDues: parseFloat(childFormData.previousDues) || 0,
//             remark: childFormData.remarks || "",
//             totalFeeAmount: totalFeeAmount,
//             concessionFee: parseFloat(childFormData.concessionFee || ""),
//             paidAfterConcession:
//               TotalFeeAfterDiscount + parseFloat(childFormData.previousDues) ||
//               0,

//             newPaidAmount: parseFloat(childFormData.paidAmount || ""),
//           },
//         };

//         if (childFormData.paymentMode === "Cheque") {
//           newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//         } else if (childFormData.paymentMode === "Online") {
//           newFeeData.transactionId = childFormData.transactionId || "";
//         }

//         try {
//           const response = await feescreateFeeStatus(newFeeData)
//           if (response?.success) {
//             toast.success(
//               `Fee created for ${child?.studentName}: ${response.data?.data?.message} `
//             );

//             setWhatsAppMsg(response);
//             setIsModalOpen(true);
//             getFeeHistory();
//             setReload((preReload) => !preReload);
//             setIsOpen(false);
//             setModalOpen(false);
//             setIsLoader(false)
//           }
//           else {
//             toast?.error(response?.message)
//           }
//         } catch (error) {
//           console.error("Error: ", error);
//           setIsLoader(false)
//         }
//       }
//     } catch (error) {

//       console.error("Error: ", error);
//     } finally {
//       setIsLoader(false)
//     }
//   };

//   const sendWhatsAppMessage = (fee) => { // Add phoneNumber as an argument
//     const receiptCard = `
//     ------------------------------------
//         ✨ *Fee Receipt* ✨
//     ------------------------------------
//     *Admission No:* \`${fee.feeStatus?.admissionNumber}\`
//     *Name:* \`${fee.studentDetails?.studentName}\`
//     *Class:* \`${fee.studentDetails?.class}\`
//     *Receipt No:* \`${fee.feeReceiptNumber}\`
   
//     *Total Amount Paid:* \`₹${fee.totalAmountPaid}\`
//     *Month:* \`${fee.feeHistory?.regularFees?.map((val) => val?.month)}\`
//     *Dues:* \`₹${fee.feeStatus?.dues || "0"}\`
//     *Remarks:* _${fee.remark || 'N/A'}_
//     ------------------------------------
//                 *Thank you!* 🙏
//    If there are any issues, please contact the accountant.
//     ------------------------------------
//     `;

//     const message = `*${user?.schoolName}*\n${user?.address}\n${user?.contact}\n${receiptCard}`; // Add intro text
//     const encodedMessage = encodeURIComponent(message);
//     const whatsappURL = `https://wa.me/${fee?.parentDetails?.contact}?text=${encodedMessage}`;

//     window.open(whatsappURL, "_blank");
//   };
//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//       selectedMonths: [],
//       monthFees: {},
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce((total, fee) => {
//       const monthCount = fee.selectedMonths.length;
//       const feeAmount = parseFloat(fee.value);
//       return total + feeAmount * monthCount;
//     }, 0);

//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       additionalFee: totalAdditionalFee,
//       additionalFeeValues: additionalFeeValues,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeMonthSelection = (
//     index,
//     feeIndex,
//     selectedOptions
//   ) => {
//     const selectedMonths = selectedOptions.map((option) => ({
//       month: option.value,
//       fee: formData[index].additionalFeeValues[feeIndex].fee,
//       value: formData[index].additionalFeeValues[feeIndex].value,
//     }));

//     const updatedFormData = [...formData];
//     updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
//       selectedMonths;

//     const feeValue = updatedFormData[index].additionalFeeValues[feeIndex].value;
//     const monthCount = selectedMonths.length;
//     const totalFeeForCurrent = feeValue * monthCount;
//     updatedFormData[index].additionalFeeValues[feeIndex].totalFee =
//       totalFeeForCurrent;

//     const totalAdditionalFee = updatedFormData[
//       index
//     ].additionalFeeValues.reduce((total, fee) => {
//       return total + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = totalAdditionalFee;
//     setFormData(updatedFormData);
//   };

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

//   // Filtered months (excluding previous fee months)
//   const availableMonths = allMonths?.filter(
//     (month) => !prevFeeMonths?.includes(month)
//   );

//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);
//     const updatedFormData = [...formData];
//     if (!updatedFormData[childIndex].monthFees) {
//       updatedFormData[childIndex].monthFees = {};
//     }

//     const sortedMonths = selectedMonths.sort(
//       (a, b) => availableMonths.indexOf(a) - availableMonths.indexOf(b)
//     );
//     const lastSelectedIndex = availableMonths.indexOf(
//       sortedMonths[sortedMonths.length - 1]
//     );
//     const expectedMonths = availableMonths.slice(0, lastSelectedIndex + 1);
//     const isValidSelection = expectedMonths.every((month) =>
//       selectedMonths.includes(month)
//     );

//     if (!isValidSelection) {
//       toast.warn(
//         "You must select months in sequential order starting from the beginning!"
//       );
//       return; // Stop further execution if invalid selection
//     }
//     sortedMonths.forEach((month) => {
//       if (!updatedFormData[childIndex].monthFees[month]) {
//         updatedFormData[childIndex].monthFees[month] =
//           updatedFormData[childIndex].classFee || 0;
//       }
//     });

//     // Remove unselected months from monthFees
//     Object.keys(updatedFormData[childIndex].monthFees).forEach((month) => {
//       if (!sortedMonths.includes(month)) {
//         delete updatedFormData[childIndex].monthFees[month];
//       }
//     });

//     updatedFormData[childIndex].selectedMonths = selectedMonths;
//     updatedFormData[childIndex].totalClassFee =
//       (updatedFormData[childIndex].classFee || 0) * selectedMonths.length;

//     setFormData(updatedFormData);
//   };

//   return (
//     <div className="md:min-h-screen md:pl-0 md:px-0 p-2">
//       <div className="flex gap-5 py-2">
//         <ReactInput

//           type="text"
//           label="Search by name"
//           onChange={handleSearch}
//           value={searchTerm}
//         />
        
//       </div>
      
//       {filteredStudents?.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border md:w-1/4 border-gray-300 rounded mb-2  shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
//           {filteredStudents?.map((student, index) => (
//             <h1
//               key={index}

//               className="p-2 border-b cursor-pointer hover:shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
//               onClick={() => handleStudentClick(student?.parentId)}
//             >
//               {student?.studentName || "No Name"}, {student?.class},{" "}
//               {student?.fatherName}, {student?.admissionNumber}
//             </h1>
//           ))}
//         </div>
//       )}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Create Fees`} dynamicWidth="50vw">
//         <form
//           onSubmit={handleSubmit}
//           className="flex flex-col md:flex-row gap-2 w-full "
//         >
//           {parentData.map((child, index) => (
//             <div key={index} className="bg-white rounded-lg shadow-md ">
//               <div className=" w-full flex items-center flex-row gap-2   p-2">
//                 <div>
//                   <input
//                     type="checkbox"
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-2 "
//                   />
//                 </div>
//                 <div>
//                   <span className=" text-[16px] font-semibold text-blue-800">
//                     {child.studentName} ,
//                   </span>
//                   <span className="text-[16px] text-blue-800">
//                     {" "}
//                     Class : {child.class} ,
//                   </span>
//                   <span className="text-[16px] text-red-600">
//                     {" "}
//                     Total Dues : {child.dues}
//                   </span>
//                 </div>
//               </div>
//               {showForm[index] && (
//                 <>
//                   <div className="  flex items-center p-2 rounded">
//                     <div className="w-full ">
//                       <div className="flex flex-row  rounded">
//                         <input
//                           type="checkbox"
//                           checked={formData[index]?.includeClassFee || false}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "includeClassFee",
//                               e.target.checked
//                             )
//                           }
//                           className="mr-2"
//                         />
//                         <label
//                           htmlFor=""
//                           className="block text-sm font-medium text-red-700"
//                         >
//                           Class Fee
//                         </label>
//                       </div>
//                       {formData[index]?.includeClassFee && (
//                         <>
//                           <div>
                           
//                             <Select
//                               options={availableMonths.map((month) => ({
//                                 value: month,
//                                 label: month,
//                               }))}
//                               value={formData[index]?.selectedMonths?.map(
//                                 (month) => ({
//                                   value: month,
//                                   label: month,
//                                 })
//                               )}
//                               onChange={(selectedOptions) =>
//                                 handleMonthSelection(selectedOptions, index)
//                               }
//                               isMulti
//                               name="months"
//                               className="basic-multi-select "
//                               classNamePrefix="select"
//                             />

//                           </div>

//                           <div className="w-full  flex flex-wrap gap-1 px-2 bg-[#151b4b]">
//                             {formData[index]?.selectedMonths?.map(
//                               (month, monthIndex) => (
//                                 <div
//                                   key={monthIndex}
//                                   className="shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] p-1 rounded-sm"
//                                 >
//                                   <label className="block text-[10px] font-medium text-white">
//                                     {month} : {formData[index]?.monthFees?.[month]}
//                                   </label>

//                                 </div>
//                               )
//                             )} <span className="text-yellow-700">
//                               = {formData[index]?.totalClassFee || 0}
//                             </span>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   <div className="mb-2 px-2  rounded">
//                     <div className="flex flex-row ">
//                       <input
//                         type="checkbox"
//                         checked={
//                           formData[index]?.includeAdditionalFees || false
//                         }
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "includeAdditionalFees",
//                             e.target.checked
//                           )
//                         }
//                         className="mr-2"
//                       />
//                       <label className="block text-sm font-medium text-red-700">
//                         Additional Fees
//                       </label>
//                     </div>

//                     {formData[index]?.includeAdditionalFees && (
//                       <>

//                         <Select
//                           isMulti
//                           options={additionalFees}
//                           onChange={(selectedOptions) =>
//                             handleAdditionalFeesChange(index, selectedOptions)
//                           }
//                           className="basic-single "
//                           classNamePrefix="select"
//                         />
//                         {formData[index]?.additionalFeeValues?.map(
//                           (feeData, feeIndex) => (
//                             <div
//                               key={feeIndex}
//                               className=" w-full  flex flex-wrap gap-2 rounded"
//                             >
//                               <div className="w-full">
//                                 <p className="block text-[10px] font-medium text-blue-700">
//                                   {feeData.fee}: {feeData.value}
//                                 </p>
//                               </div>
//                               <div className="w-full">

//                                 <Select
//                                   options={[
//                                     "April",
//                                     "May",
//                                     "June",
//                                     "July",
//                                     "August",
//                                     "September",
//                                     "October",
//                                     "November",
//                                     "December",
//                                     "January",
//                                     "February",
//                                     "March",
//                                   ].map((month) => ({
//                                     value: month,
//                                     label: month,
//                                   }))}
//                                   value={feeData.selectedMonths?.map(
//                                     (month) => ({
//                                       value: month.month,
//                                       label: month.month,
//                                     })
//                                   )}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       selectedOptions
//                                     )
//                                   }
//                                   isMulti
//                                   name="months"
//                                   className="text-[10px] mt-1 text-blue-700"
//                                   classNamePrefix="select"
//                                 />

//                                 <div className="w-full flex flex-wrap  items-center gap-2 bg-[#151b4b]  px-2">
//                                   {feeData.selectedMonths?.map(
//                                     (monthData, monthIndex) => (

//                                       <label className="block text-[10px] font-medium text-white">
//                                         {`
                                               
//                                                  ${monthData.month} :${monthData.value || ""}`}
//                                       </label>

//                                     )
//                                   )}
//                                   <span className="text-yellow-700">
//                                     = {formData[index]?.additionalFee || 0}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           )
//                         )}
//                       </>
//                     )}
//                   </div>

//                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
//                   <div className=" bg-[#c25151] rounded-md">
//                   <div className="flex flex-wrap gap-2  ">
//                     <div className="px-2 w-[150px]">
//                       <label className="block text-[14px] font-medium text-white">
//                         Fee Date
//                       </label>
//                       <input
//                         type="date"
//                         value={formData[index]?.feeDate || getCurrentDate()}
//                         onChange={(e) =>
//                           handleInputChange(index, "feeDate", e.target.value)
//                         }
//                         className="w-full border p-1 rounded"
//                       />
//                     </div>
                    
//                       <div className="px-2 w-[150px]">
//                         <label className="block text-[14px] font-medium text-white">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index]?.paymentMode || "Cash"}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border p-1 rounded"
//                         >
//                           {" "}
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                         </select>
//                       </div>

//                       <div className="">
//                         {formData[index]?.paymentMode === "Online" && (
//                           <div className="px-2 w-[150px]">
//                             <label className="block text-[14px] font-medium text-white">
//                               Transaction ID
//                             </label>
//                             <input
//                               type="text"
//                               value={formData[index]?.transactionId || ""}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "transactionId",
//                                   e.target.value
//                                 )
//                               }
//                               className="w-full border p-1 rounded"
//                             />
//                           </div>
//                         )}

//                         {formData[index]?.paymentMode === "Cheque" && (
//                           <div className="px-2 w-[150px]">
//                             <label className="block text-[14px] font-medium text-white">
//                               Cheque Book No
//                             </label>
//                             <input
//                               type="text"
//                               value={formData[index]?.transactionId || ""}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "transactionId",
//                                   e.target.value
//                                 )
//                               }
//                               className="w-full border p-1 rounded"
//                             />
//                           </div>
//                         )}
//                       </div>
                    

//                     <div className="px-2 w-[150px]">
//                       <label className="block text-[14px] font-medium text-white">
//                         Concession Amount
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="amount"
//                         value={formData[index]?.concessionFee}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "concessionFee",
//                             e.target.value
//                           )
//                         }
//                         className="w-full border p-1 rounded"
//                       />
//                     </div>
//                     <div className="px-2">
//                     <label className="block text-[14px] font-medium text-white">
//                       Remarks
//                     </label>
//                     <textarea
//                       type="text"
//                       value={formData[index]?.remarks || ""}
//                       onChange={(e) =>
//                         handleInputChange(index, "remarks", e.target.value)
//                       }
//                       className="w-full border p-1 rounded"
//                       rows="1" // Or any other minimum number of rows
//                       cols="30"
//                     />
//                   </div>

                    
//                   </div>
                  

//                   <div className="w-full flex justify-end mt-2">
//                     <div className="px-2 w-full text-start">
//                       <label className="block text-[14px] font-medium text-white">
//                         Paid Amount
//                       </label>
//                       <input

//                         type="number"
//                         placeholder="amount"
//                         value={formData[index]?.paidAmount}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "paidAmount",
//                             e.target.value
//                           )
//                         }
//                         className="w-full border p-1  bg-[#151b4b] text-yellow-700"
//                       />
//                     </div>
//                   </div>
//                   </div>
//                   <div className=" bg-lime-500 p-4 rounded-lg shadow-md">
//   <table className="w-full border-collapse border border-gray-200 text-left">
//     <thead>
//       <tr className="bg-lime-600 text-white">
//         <th className="px-2 py-1 border">Description</th>
//         <th className="px-2 py-1 border">Amount</th>
//       </tr>
//     </thead>
//     <tbody>
//       <tr className="border">
//         <td className="px-2 py-1 border">Class Fee</td>
//         <td className="px-2 py-1 border">{(formData[index]?.totalClassFee || 0).toFixed(2)}</td>
//       </tr>
//       <tr className="border">
//         <td className="px-2 py-1 border">Additional Fee</td>
//         <td className="px-2 py-1 border">{(formData[index]?.additionalFee || 0).toFixed(2)}</td>
//       </tr>
//       <tr className="border">
//         <td className="px-2 py-1 border">Previous Dues</td>
//         <td className="px-2 py-1 border">{(formData[index]?.previousDues || 0).toFixed(2)}</td>
//       </tr>
//           <tr className="border">
//         <td className="px-2 py-1 border">Late Fine</td>
//         <td className="px-2 py-1 border">
//           {lateFine.filter((fine) => fine.className === child.class).length > 0 ? (
//             lateFine
//               .filter((fine) => fine.className === child.class)
//               .reduce((sum, fine) => sum + fine.amount, 0)
//               .toFixed(2)
//           ) : (
//             "No Late Fee"
//           )}
//         </td>
//       </tr>
//       {/* <tr className="border">
//         <td className="px-2 py-1 border">Late Fine</td>
//         <td className="px-2 py-1 border">{(0).toFixed(2)}</td>
//       </tr> */}
//       <tr className="border">
//         <td className="px-2 py-1 border">Concession Amt.</td>
//         <td className="px-2 py-1 border">{(formData[index]?.concessionFee || 0)}.00</td>
//       </tr>
//       <tr className="border  font-bold">
//         <td className="px-2 py-1 border">Total Amount</td>
//         <td className="px-2 py-1 border">{(formData[index]?.additionalFee || 0) +
//                       (formData[index]?.totalClassFee || 0) +
//                       parseFloat(formData[index]?.previousDues || 0) -
//                       (formData[index]?.concessionFee || 0)}.00</td>
//       </tr>
//       <tr className="border  font-bold">
//         <td className="px-2 py-1 border">Paid Amount</td>
//         <td className="px-2 py-1 border">
//           {formData[index]?.paidAmount?formData[index]?.paidAmount:0}.00
       
//         </td>
//       </tr>
//       <tr className="border  font-bold">
//         <td className="px-2 py-1 border text-red-800">Dues Amount</td>
       
//         <td className="px-2 py-1 border">
//   {(
//     (formData[index]?.additionalFee || 0) +
//     (formData[index]?.totalClassFee || 0) +
//     (formData[index]?.previousDues || 0) -
//     (formData[index]?.concessionFee || 0) -
//     (formData[index]?.paidAmount || 0)
//   ).toFixed(2)}
// </td>
//       </tr>
//     </tbody>
//   </table>
// </div>

//                  </div>
                  
//                 </>
//               )}
//             </div>
//           ))}
//         </form>
//         <>
//           <div className="gap-2 px-2 my-1 w-full flex justify-center items-center ">
//             <button
//               type="submit"
//               onClick={handleSubmit}
//               className="bg-blue-500 w-full text-white px-4 py-1 rounded self-end "
//             >
//               Submit
//             </button>
//             <button
//               type="button"
//               onClick={() => setModalOpen(false)}
//               className="bg-gray-500 w-full text-white px-4 py-1 rounded self-end"
//             >
//               Cancel
//             </button>
//           </div>
//         </>
//       </Modal>

//       <Table reLoad={reLoad} />
//       <Modal
//         setIsOpen={() => setIsModalOpen(false)}
//         isOpen={isModalOpen} title={"Addmission Successfully!"} maxWidth="100px">
//         <div className="bg-white p-6 rounded-lg shadow-lg">
//           <p>Do you want to send this</p>
//           <p> message to this number?</p>
//           <span className="text-indigo-800">{whatsAppMsg?.contact}</span>
//           <span></span>
//           <div className="mt-4 flex justify-end space-x-4">
//             {/* {console.log("whatsAppMsg",whatsAppMsg)} */}
//             <button
//               onClick={() => sendWhatsAppMessage(whatsAppMsg?.data?.data)}
//               className="bg-green-500 text-white px-4 py-2 rounded w-full"
//             >
//               OK
//             </button>
//             <button
//               onClick={() => setIsModalOpen(false)}
//               className="bg-gray-500 text-white px-4 py-2 rounded w-full"
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






// import React, { useEffect, useState } from "react";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";
// import { feescreateFeeStatus, feesfeeHistory, getAdditionalfees, getfees, ActiveStudents, parentandchildwithID, LateFines } from "../../Network/AdminApi";
// import Modal from "../../Dynamic/Modal";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { useStateContext } from "../../contexts/ContextProvider";

// const CreateFees = () => {
//   const { setIsLoader } = useStateContext();
//   const user = JSON.parse(localStorage.getItem("user"))
//   const [modalOpen, setModalOpen] = useState(false);
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [additionalFees, setAdditionalFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [feeHistory, setFeeHistory] = useState([]);
//   const [prevFeeMonths, setPrevFeeMonths] = useState([]);
//   const [lateFine, setLateFine] = useState([]);
//    console.log("lateFine",lateFine)
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [whatsAppMsg, setWhatsAppMsg] = useState("");
//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeDate: "",
//       paymentMode: "Cash",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = localStorage.getItem("token");

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   const getFeeHistory = async () => {
//     try {
//       const response = await feesfeeHistory()
      
//       if (response?.success) {
//         setFeeHistory(response?.data);
//       }
//       else {
//         toast?.error(response?.message)
//       }
   
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//   const getLateFine = async () => {
//     try {
//       const response = await LateFines()
      
//       if (response?.success) {
//         // setFeeHistory(response?.data);
//         setLateFine(response?.data)
//       }
//       else {
//         toast?.error(response?.message)
//       }
   
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };
//   useEffect(() => {
//     getFeeHistory();
//     getLateFine()
//   }, []);

//   const getAllStudent = async () => {
//     setIsLoader(true)
//     try {
//       const response = await ActiveStudents();
//       if (response) {
//         setAllStudent(response?.students?.data);
//       }
//       // console.log("response all student", response?.allStudent);
//     } catch (error) {
//       console.log("error", error)
//     }
//     finally {
//       setIsLoader(false)
//     }
//   };
//   useEffect(() => {
//     getAllStudent();
//   }, []);
//   // console.log("allstudent",allStudent)
//   const handleSearch = (event) => {
//     const searchValue = event?.target?.value?.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent?.filter(
//         (student) =>
//           student?.studentName &&
//           student?.studentName?.toLowerCase()?.includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };
//   const handleSearchbyAdmissionNo = (event) => {
//     const searchValue = event?.target?.value?.toLowerCase()?.trim();
//     setSearchTermbyadmissionNo(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent?.filter(
//         (student) =>
//           student.admissionNumber &&
//           student.admissionNumber?.toLowerCase()?.includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = async (parentId) => {
//     setIsLoader(true)
//     try {
//       const response = await parentandchildwithID(parentId)
//       if (response?.success) {
//         setIsLoader(false)
//         const children = response?.children;
//         setParentData(children);
//         const initialFormData = children?.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [],
//           feeDate: getCurrentDate(),
//           paymentMode: "Cash",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//         }));

//         setFormData(initialFormData);
//         setIsOpen(true);
//         setModalOpen(true);
//       }
//       else {
//         toast?.error(response?.message)
//       }
//     } catch (error) {
//       console.error("Error", error);
//     }

//   };

//   const handleChildSelection = async (child, index) => {
// console.log("child",child)


//     const matchedStudents = feeHistory.filter(
//       (val) => val?.admissionNumber == child?.admissionNumber
//     );

//     const allMonths =
//       matchedStudents.flatMap((student) =>
//         student?.regularFees?.map((fee) => fee?.month)
//       ) || [];

//     setPrevFeeMonths(allMonths);

//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;
//     setIsLoader(true)
//     try {
//       const response = await getAdditionalfees()
//       if (response?.success) {
//         setIsLoader(false)

//         const feesData = response?.data
//           .filter((feeType) => feeType.className === studentClass)
//           .map((fee) => {
//             const label = fee.name ? `${fee.name}` : "Unknown Fee";
//             const value = fee.amount ? fee.amount : 0;
//             return {
//               label,
//               value,
//             };
//           });
//         setAdditionalFees(feesData);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }

//     try {
//       const response = await getfees()
//       if (response?.success) {
//         const data = response?.data;

//         if (Array.isArray(data)) {
//           const studentFeeAmount =
//             data
//               .filter((feeType) => feeType.className === studentClass)
//               .map((classData) => classData.amount)[0] || 0;

//           const updatedFormData = [...formData];
//           updatedFormData[index] = {
//             ...updatedFormData[index],
//             classFee: studentFeeAmount,
//             selectedMonths: updatedFormData[index]?.selectedMonths || [],
//             totalRegularFee:
//               studentFeeAmount *
//               (updatedFormData[index]?.selectedMonths.length || 1),
//             additionalFee: updatedFormData[index]?.additionalFee || 0,
//           };
//           setIsLoader(false)
//           setFormData(updatedFormData);
//         }
//       }
//     } catch (error) {

//     }

//     const updatedSelectedChildren = [...selectedChildren];
//     const updatedShowForm = [...showForm];

//     if (updatedSelectedChildren.includes(index)) {
//       updatedSelectedChildren.splice(updatedSelectedChildren.indexOf(index), 1);
//       updatedShowForm[index] = false;
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true;
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setFormData(updatedFormData);
//   };

//   const handleSubmit = async (e) => {
//     setIsLoader(true)
//     e.preventDefault();
//     try {
//       for (const childIndex of selectedChildren) {
//         const child = parentData[childIndex];

//         const childFormData = formData[childIndex] || {};
//         if (!childFormData.paymentMode) {
//           toast.error(`Payment mode is required for ${child.studentName}`);
//           continue;
//         }

//         const selectedMonthsData =
//           (childFormData.selectedMonths || []).map((month) => {
//             const paidAmount = Number(childFormData.monthFees?.[month]) || 0;

//             return {
//               month: month,
//               paidAmount: paidAmount,
//             };
//           }) || [];

//         const totalRegularPaidAmount = selectedMonthsData.reduce(
//           (acc, curr) => acc + curr.paidAmount,
//           0
//         );

//         const additionalFeesData = (
//           childFormData.additionalFeeValues || []
//         ).flatMap((feeData) => {
//           return (feeData.selectedMonths || []).map((month) => ({
//             name: feeData.fee,
//             month: month.month,
//             paidAmount: Number(month.value) || 0,
//           }));
//         });

//         const totalAdditionalPaidAmount = additionalFeesData.reduce(
//           (acc, curr) => acc + curr.paidAmount,
//           0
//         );

//         const totalPaidAmount =
//           totalRegularPaidAmount + totalAdditionalPaidAmount;

//         const totalClassFee = childFormData.totalClassFee || 0;
//         const totalAdditionalFees = childFormData.additionalFee || 0;
//         const totalFeeAmount = parseFloat(totalClassFee + totalAdditionalFees);
//         const concessionFee = parseFloat(childFormData.concessionFee) || 0;
//         const newPaidAmount = totalPaidAmount - concessionFee;
//         const TotalFeeAfterDiscount = concessionFee
//           ? totalFeeAmount - concessionFee
//           : totalFeeAmount;

//         const newFeeData = {
//           studentId: child?.studentId || "",
//           // admissionNumber: child?.admissionNumber || "",
//           className: child?.class || "",
//           feeHistory: {
//             regularFees: selectedMonthsData,
//             additionalFees: additionalFeesData,
//             status: childFormData.feeStatus || "Pending",
//             paymentMode: childFormData.paymentMode || "Cash",
//             transactionId: childFormData.transactionId,
//             previousDues: parseFloat(childFormData.previousDues) || 0,
//             remark: childFormData.remarks || "",
//             totalFeeAmount: totalFeeAmount,
//             concessionFee: parseFloat(childFormData.concessionFee || ""),
//             paidAfterConcession:
//               TotalFeeAfterDiscount + parseFloat(childFormData.previousDues) ||
//               0,

//             newPaidAmount: parseFloat(childFormData.paidAmount || ""),
//           },
//         };

//         if (childFormData.paymentMode === "Cheque") {
//           newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//         } else if (childFormData.paymentMode === "Online") {
//           newFeeData.transactionId = childFormData.transactionId || "";
//         }

//         try {
//           const response = await feescreateFeeStatus(newFeeData)
//           if (response?.success) {
//             toast.success(
//               `Fee created for ${child?.studentName}: ${response.data?.data?.message} `
//             );

//             setWhatsAppMsg(response);
//             setIsModalOpen(true);
//             getFeeHistory();
//             setReload((preReload) => !preReload);
//             setIsOpen(false);
//             setModalOpen(false);
//             setIsLoader(false)
//           }
//           else {
//             toast?.error(response?.message)
//           }
//         } catch (error) {
//           console.error("Error: ", error);
//           setIsLoader(false)
//         }
//       }
//     } catch (error) {

//       console.error("Error: ", error);
//     } finally {
//       setIsLoader(false)
//     }
//   };

//   const sendWhatsAppMessage = (fee) => { // Add phoneNumber as an argument
//     const receiptCard = `
//     ------------------------------------
//         ✨ *Fee Receipt* ✨
//     ------------------------------------
//     *Admission No:* \`${fee.feeStatus?.admissionNumber}\`
//     *Name:* \`${fee.studentDetails?.studentName}\`
//     *Class:* \`${fee.studentDetails?.class}\`
//     *Receipt No:* \`${fee.feeReceiptNumber}\`
   
//     *Total Amount Paid:* \`₹${fee.totalAmountPaid}\`
//     *Month:* \`${fee.feeHistory?.regularFees?.map((val) => val?.month)}\`
//     *Dues:* \`₹${fee.feeStatus?.dues || "0"}\`
//     *Remarks:* _${fee.remark || 'N/A'}_
//     ------------------------------------
//                 *Thank you!* 🙏
//    If there are any issues, please contact the accountant.
//     ------------------------------------
//     `;

//     const message = `*${user?.schoolName}*\n${user?.address}\n${user?.contact}\n${receiptCard}`; // Add intro text
//     const encodedMessage = encodeURIComponent(message);
//     const whatsappURL = `https://wa.me/${fee?.parentDetails?.contact}?text=${encodedMessage}`;

//     window.open(whatsappURL, "_blank");
//   };
//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//       selectedMonths: [],
//       monthFees: {},
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce((total, fee) => {
//       const monthCount = fee.selectedMonths.length;
//       const feeAmount = parseFloat(fee.value);
//       return total + feeAmount * monthCount;
//     }, 0);

//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       additionalFee: totalAdditionalFee,
//       additionalFeeValues: additionalFeeValues,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeeMonthSelection = (
//     index,
//     feeIndex,
//     selectedOptions
//   ) => {
//     const selectedMonths = selectedOptions.map((option) => ({
//       month: option.value,
//       fee: formData[index].additionalFeeValues[feeIndex].fee,
//       value: formData[index].additionalFeeValues[feeIndex].value,
//     }));

//     const updatedFormData = [...formData];
//     updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
//       selectedMonths;

//     const feeValue = updatedFormData[index].additionalFeeValues[feeIndex].value;
//     const monthCount = selectedMonths.length;
//     const totalFeeForCurrent = feeValue * monthCount;
//     updatedFormData[index].additionalFeeValues[feeIndex].totalFee =
//       totalFeeForCurrent;

//     const totalAdditionalFee = updatedFormData[
//       index
//     ].additionalFeeValues.reduce((total, fee) => {
//       return total + (fee.totalFee || 0);
//     }, 0);

//     updatedFormData[index].additionalFee = totalAdditionalFee;
//     setFormData(updatedFormData);
//   };

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

//   // Filtered months (excluding previous fee months)
//   const availableMonths = allMonths?.filter(
//     (month) => !prevFeeMonths?.includes(month)
//   );

//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);
//     const updatedFormData = [...formData];
//     if (!updatedFormData[childIndex].monthFees) {
//       updatedFormData[childIndex].monthFees = {};
//     }

//     const sortedMonths = selectedMonths.sort(
//       (a, b) => availableMonths.indexOf(a) - availableMonths.indexOf(b)
//     );
//     const lastSelectedIndex = availableMonths.indexOf(
//       sortedMonths[sortedMonths.length - 1]
//     );
//     const expectedMonths = availableMonths.slice(0, lastSelectedIndex + 1);
//     const isValidSelection = expectedMonths.every((month) =>
//       selectedMonths.includes(month)
//     );

//     if (!isValidSelection) {
//       toast.warn(
//         "You must select months in sequential order starting from the beginning!"
//       );
//       return; // Stop further execution if invalid selection
//     }
//     sortedMonths.forEach((month) => {
//       if (!updatedFormData[childIndex].monthFees[month]) {
//         updatedFormData[childIndex].monthFees[month] =
//           updatedFormData[childIndex].classFee || 0;
//       }
//     });

//     // Remove unselected months from monthFees
//     Object.keys(updatedFormData[childIndex].monthFees).forEach((month) => {
//       if (!sortedMonths.includes(month)) {
//         delete updatedFormData[childIndex].monthFees[month];
//       }
//     });

//     updatedFormData[childIndex].selectedMonths = selectedMonths;
//     updatedFormData[childIndex].totalClassFee =
//       (updatedFormData[childIndex].classFee || 0) * selectedMonths.length;

//     setFormData(updatedFormData);
//   };

//   return (
//     <div className="md:min-h-screen md:pl-0 md:px-0 p-2">
//       <div className="flex gap-5 py-2">
//         <ReactInput

//           type="text"
//           label="Search by name"
//           onChange={handleSearch}
//           value={searchTerm}
//         />
        
//       </div>
      
//       {filteredStudents?.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border md:w-1/4 border-gray-300 rounded mb-2  shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]">
//           {filteredStudents?.map((student, index) => (
//             <h1
//               key={index}

//               className="p-2 border-b cursor-pointer hover:shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px]"
//               onClick={() => handleStudentClick(student?.parentId)}
//             >
//               {student?.studentName || "No Name"}, {student?.class},{" "}
//               {student?.fatherName}, {student?.admissionNumber}
//             </h1>
//           ))}
//         </div>
//       )}
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Create Fees`} dynamicWidth="50vw">
//         <form
//           onSubmit={handleSubmit}
//           className="flex flex-col md:flex-row gap-2 w-full "
//         >
//           {parentData.map((child, index) => (
//             <div key={index} className="bg-white rounded-lg shadow-md ">
//               <div className=" w-full flex items-center flex-row gap-2   p-2">
//                 <div>
//                   <input
//                     type="checkbox"
//                     checked={selectedChildren.includes(index)}
//                     onChange={() => handleChildSelection(child, index)}
//                     className="mr-2 "
//                   />
//                 </div>
//                 <div>
//                   <span className=" text-[16px] font-semibold text-blue-800">
//                     {child.studentName} ,
//                   </span>
//                   <span className="text-[16px] text-blue-800">
//                     {" "}
//                     Class : {child.class} ,
//                   </span>
//                   <span className="text-[16px] text-red-600">
//                     {" "}
//                     Total Dues : {child.dues}
//                   </span>
//                 </div>
//               </div>
//               {showForm[index] && (
//                 <>
//                   <div className="  flex items-center p-2 rounded">
//                     <div className="w-full ">
//                       <div className="flex flex-row  rounded">
//                         <input
//                           type="checkbox"
//                           checked={formData[index]?.includeClassFee || false}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "includeClassFee",
//                               e.target.checked
//                             )
//                           }
//                           className="mr-2"
//                         />
//                         <label
//                           htmlFor=""
//                           className="block text-sm font-medium text-red-700"
//                         >
//                           Class Fee
//                         </label>
//                       </div>
//                       {formData[index]?.includeClassFee && (
//                         <>
//                           <div>
                           
//                             <Select
//                               options={availableMonths.map((month) => ({
//                                 value: month,
//                                 label: month,
//                               }))}
//                               value={formData[index]?.selectedMonths?.map(
//                                 (month) => ({
//                                   value: month,
//                                   label: month,
//                                 })
//                               )}
//                               onChange={(selectedOptions) =>
//                                 handleMonthSelection(selectedOptions, index)
//                               }
//                               isMulti
//                               name="months"
//                               className="basic-multi-select "
//                               classNamePrefix="select"
//                             />

//                           </div>

//                           <div className="w-full  flex flex-wrap gap-1 px-2 bg-[#151b4b]">
//                             {formData[index]?.selectedMonths?.map(
//                               (month, monthIndex) => (
//                                 <div
//                                   key={monthIndex}
//                                   className="shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] p-1 rounded-sm"
//                                 >
//                                   <label className="block text-[10px] font-medium text-white">
//                                     {month} : {formData[index]?.monthFees?.[month]}
//                                   </label>

//                                 </div>
//                               )
//                             )} <span className="text-yellow-700">
//                               = {formData[index]?.totalClassFee || 0}
//                             </span>
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   </div>

//                   <div className="mb-2 px-2  rounded">
//                     <div className="flex flex-row ">
//                       <input
//                         type="checkbox"
//                         checked={
//                           formData[index]?.includeAdditionalFees || false
//                         }
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "includeAdditionalFees",
//                             e.target.checked
//                           )
//                         }
//                         className="mr-2"
//                       />
//                       <label className="block text-sm font-medium text-red-700">
//                         Additional Fees
//                       </label>
//                     </div>

//                     {formData[index]?.includeAdditionalFees && (
//                       <>

//                         <Select
//                           isMulti
//                           options={additionalFees}
//                           onChange={(selectedOptions) =>
//                             handleAdditionalFeesChange(index, selectedOptions)
//                           }
//                           className="basic-single "
//                           classNamePrefix="select"
//                         />
//                         {formData[index]?.additionalFeeValues?.map(
//                           (feeData, feeIndex) => (
//                             <div
//                               key={feeIndex}
//                               className=" w-full  flex flex-wrap gap-2 rounded"
//                             >
//                               <div className="w-full">
//                                 <p className="block text-[10px] font-medium text-blue-700">
//                                   {feeData.fee}: {feeData.value}
//                                 </p>
//                               </div>
//                               <div className="w-full">

//                                 <Select
//                                   options={[
//                                     "April",
//                                     "May",
//                                     "June",
//                                     "July",
//                                     "August",
//                                     "September",
//                                     "October",
//                                     "November",
//                                     "December",
//                                     "January",
//                                     "February",
//                                     "March",
//                                   ].map((month) => ({
//                                     value: month,
//                                     label: month,
//                                   }))}
//                                   value={feeData.selectedMonths?.map(
//                                     (month) => ({
//                                       value: month.month,
//                                       label: month.month,
//                                     })
//                                   )}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeeMonthSelection(
//                                       index,
//                                       feeIndex,
//                                       selectedOptions
//                                     )
//                                   }
//                                   isMulti
//                                   name="months"
//                                   className="text-[10px] mt-1 text-blue-700"
//                                   classNamePrefix="select"
//                                 />

//                                 <div className="w-full flex flex-wrap  items-center gap-2 bg-[#151b4b]  px-2">
//                                   {feeData.selectedMonths?.map(
//                                     (monthData, monthIndex) => (

//                                       <label className="block text-[10px] font-medium text-white">
//                                         {`
                                               
//                                                  ${monthData.month} :${monthData.value || ""}`}
//                                       </label>

//                                     )
//                                   )}
//                                   <span className="text-yellow-700">
//                                     = {formData[index]?.additionalFee || 0}
//                                   </span>
//                                 </div>
//                               </div>
//                             </div>
//                           )
//                         )}
//                       </>
//                     )}
//                   </div>

//                  <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
//                   <div className=" bg-[#c25151] rounded-md">
//                   <div className="flex flex-wrap gap-2  ">
//                     <div className="px-2 w-[150px]">
//                       <label className="block text-[14px] font-medium text-white">
//                         Fee Date
//                       </label>
//                       <input
//                         type="date"
//                         value={formData[index]?.feeDate || getCurrentDate()}
//                         onChange={(e) =>
//                           handleInputChange(index, "feeDate", e.target.value)
//                         }
//                         className="w-full border p-1 rounded"
//                       />
//                     </div>
                    
//                       <div className="px-2 w-[150px]">
//                         <label className="block text-[14px] font-medium text-white">
//                           Payment Mode
//                         </label>
//                         <select
//                           value={formData[index]?.paymentMode || "Cash"}
//                           onChange={(e) =>
//                             handleInputChange(
//                               index,
//                               "paymentMode",
//                               e.target.value
//                             )
//                           }
//                           className="w-full border p-1 rounded"
//                         >
//                           {" "}
//                           <option value="Cash">Cash</option>
//                           <option value="Online">Online</option>
//                           <option value="Cheque">Cheque</option>
//                         </select>
//                       </div>

//                       <div className="">
//                         {formData[index]?.paymentMode === "Online" && (
//                           <div className="px-2 w-[150px]">
//                             <label className="block text-[14px] font-medium text-white">
//                               Transaction ID
//                             </label>
//                             <input
//                               type="text"
//                               value={formData[index]?.transactionId || ""}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "transactionId",
//                                   e.target.value
//                                 )
//                               }
//                               className="w-full border p-1 rounded"
//                             />
//                           </div>
//                         )}

//                         {formData[index]?.paymentMode === "Cheque" && (
//                           <div className="px-2 w-[150px]">
//                             <label className="block text-[14px] font-medium text-white">
//                               Cheque Book No
//                             </label>
//                             <input
//                               type="text"
//                               value={formData[index]?.transactionId || ""}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "transactionId",
//                                   e.target.value
//                                 )
//                               }
//                               className="w-full border p-1 rounded"
//                             />
//                           </div>
//                         )}
//                       </div>
                    

//                     <div className="px-2 w-[150px]">
//                       <label className="block text-[14px] font-medium text-white">
//                         Concession Amount
//                       </label>
//                       <input
//                         type="number"
//                         placeholder="amount"
//                         value={formData[index]?.concessionFee}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "concessionFee",
//                             e.target.value
//                           )
//                         }
//                         className="w-full border p-1 rounded"
//                       />
//                     </div>
//                     <div className="px-2">
//                     <label className="block text-[14px] font-medium text-white">
//                       Remarks
//                     </label>
//                     <textarea
//                       type="text"
//                       value={formData[index]?.remarks || ""}
//                       onChange={(e) =>
//                         handleInputChange(index, "remarks", e.target.value)
//                       }
//                       className="w-full border p-1 rounded"
//                       rows="1" // Or any other minimum number of rows
//                       cols="30"
//                     />
//                   </div>

                    
//                   </div>
                  

//                   <div className="w-full flex justify-end mt-2">
//                     <div className="px-2 w-full text-start">
//                       <label className="block text-[14px] font-medium text-white">
//                         Paid Amount
//                       </label>
//                       <input

//                         type="number"
//                         placeholder="amount"
//                         value={formData[index]?.paidAmount}
//                         onChange={(e) =>
//                           handleInputChange(
//                             index,
//                             "paidAmount",
//                             e.target.value
//                           )
//                         }
//                         className="w-full border p-1  bg-[#151b4b] text-yellow-700"
//                       />
//                     </div>
//                   </div>
//                   </div>
//                   <div className=" bg-lime-500 p-4 rounded-lg shadow-md">
//   <table className="w-full border-collapse border border-gray-200 text-left">
//     <thead>
//       <tr className="bg-lime-600 text-white">
//         <th className="px-2 py-1 border">Description</th>
//         <th className="px-2 py-1 border">Amount</th>
//       </tr>
//     </thead>
//     <tbody>
//       <tr className="border">
//         <td className="px-2 py-1 border">Class Fee</td>
//         <td className="px-2 py-1 border">{(formData[index]?.totalClassFee || 0).toFixed(2)}</td>
//       </tr>
//       <tr className="border">
//         <td className="px-2 py-1 border">Additional Fee</td>
//         <td className="px-2 py-1 border">{(formData[index]?.additionalFee || 0).toFixed(2)}</td>
//       </tr>
//       <tr className="border">
//         <td className="px-2 py-1 border">Previous Dues</td>
//         <td className="px-2 py-1 border">{(formData[index]?.previousDues || 0).toFixed(2)}</td>
//       </tr>
//       <tr className="border">
//         <td className="px-2 py-1 border">Late Fine</td>
//         <td className="px-2 py-1 border">{(0).toFixed(2)}</td>
//       </tr>
//       <tr className="border">
//         <td className="px-2 py-1 border">Concession Amt.</td>
//         <td className="px-2 py-1 border">{(formData[index]?.concessionFee || 0)}.00</td>
//       </tr>
//       <tr className="border  font-bold">
//         <td className="px-2 py-1 border">Total Amount</td>
//         <td className="px-2 py-1 border">{(formData[index]?.additionalFee || 0) +
//                       (formData[index]?.totalClassFee || 0) +
//                       parseFloat(formData[index]?.previousDues || 0) -
//                       (formData[index]?.concessionFee || 0)}.00</td>
//       </tr>
//       <tr className="border  font-bold">
//         <td className="px-2 py-1 border">Paid Amount</td>
//         <td className="px-2 py-1 border">
//           {formData[index]?.paidAmount?formData[index]?.paidAmount:0}.00
       
//         </td>
//       </tr>
//       <tr className="border  font-bold">
//         <td className="px-2 py-1 border text-red-800">Dues Amount</td>
       
//         <td className="px-2 py-1 border">
//   {(
//     (formData[index]?.additionalFee || 0) +
//     (formData[index]?.totalClassFee || 0) +
//     (formData[index]?.previousDues || 0) -
//     (formData[index]?.concessionFee || 0) -
//     (formData[index]?.paidAmount || 0)
//   ).toFixed(2)}
// </td>
//       </tr>
//     </tbody>
//   </table>
// </div>

//                  </div>
                  
//                 </>
//               )}
//             </div>
//           ))}
//         </form>
//         <>
//           <div className="gap-2 px-2 my-1 w-full flex justify-center items-center ">
//             <button
//               type="submit"
//               onClick={handleSubmit}
//               className="bg-blue-500 w-full text-white px-4 py-1 rounded self-end "
//             >
//               Submit
//             </button>
//             <button
//               type="button"
//               onClick={() => setModalOpen(false)}
//               className="bg-gray-500 w-full text-white px-4 py-1 rounded self-end"
//             >
//               Cancel
//             </button>
//           </div>
//         </>
//       </Modal>

//       <Table reLoad={reLoad} />
//       <Modal
//         setIsOpen={() => setIsModalOpen(false)}
//         isOpen={isModalOpen} title={"Addmission Successfully!"} maxWidth="100px">
//         <div className="bg-white p-6 rounded-lg shadow-lg">
//           <p>Do you want to send this</p>
//           <p> message to this number?</p>
//           <span className="text-indigo-800">{whatsAppMsg?.contact}</span>
//           <span></span>
//           <div className="mt-4 flex justify-end space-x-4">
//             {/* {console.log("whatsAppMsg",whatsAppMsg)} */}
//             <button
//               onClick={() => sendWhatsAppMessage(whatsAppMsg?.data?.data)}
//               className="bg-green-500 text-white px-4 py-2 rounded w-full"
//             >
//               OK
//             </button>
//             <button
//               onClick={() => setIsModalOpen(false)}
//               className="bg-gray-500 text-white px-4 py-2 rounded w-full"
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
