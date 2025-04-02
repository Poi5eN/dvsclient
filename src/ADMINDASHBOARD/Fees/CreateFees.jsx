import axios from "axios";
import React, { useEffect, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import Table from "./Table";
import {
  ActiveStudents,
  feesfeeHistory,
  getMonthlyDues,
  getStudentSpecificFee,
  LateFines,
  parentandchildwithID,
} from "../../Network/AdminApi";
import Modal from "../../Dynamic/Modal";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { useStateContext } from "../../contexts/ContextProvider";

// Custom styles for react-select to display dues in dropdown options
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
  const [allLateFines, setAllLateFines] = useState([]);
  const [formData, setFormData] = useState([]);
  const [monthlyDues, setMonthlyDues] = useState({});
  const [mode, setMode] = useState("auto"); // Toggle between auto and manual, default to auto
  const authToken = localStorage.getItem("token");

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

  // Fetch initial data for students and late fines
  const getAllStudent = async () => {
    try {
      const response = await ActiveStudents();
      if (response?.students?.data) {
        setAllStudent(response.students.data);
      } else {
        setAllStudent([]);
      }
    } catch (error) {
      toast.error("Failed to fetch student list.");
      setAllStudent([]);
    }
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
      toast.error("Error fetching late fines.");
      setAllLateFines([]);
    }
  };

  useEffect(() => {
    getAllStudent();
    getLateFinesData();
  }, []);

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
          response.data.message || "Failed to fetch student fee info."
        );
        return null;
      }
    } catch (error) {
      toast.error("Error fetching student fee info: " + error.message);
      return null;
    }
  };

  // Modal and student selection
  const handleStudentClick = async (parentId) => {
    setIsLoader(true);
    try {
      const response = await parentandchildwithID(parentId);
      if (response?.success) {
        const children = response?.children || [];
        setParentData(children);

        // Initialize form data for each child
        const initialFormData = [];
        for (const child of children) {
          const feeInfo = await fetchStudentFeeInfo(child.studentId);
          console.log("feeInfo",feeInfo)
          if (!feeInfo) {
            continue; // Skip if fee info fetch fails
          }

          const regularFeeAmount =
            feeInfo.feeStructure.regularFees[0]?.amount || 0;
          const additionalFees = feeInfo.feeStructure.additionalFees || [];
          const monthlyStatus = feeInfo.monthlyStatus || [];

          // Prepare regular fees with due amounts
          const regularFees = allMonths.map((month) => {
            const monthData = monthlyStatus.find((m) => m.month === month);
            return {
              month,
              paidAmount: "",
              dueAmount: monthData?.regularFee.due || regularFeeAmount,
              totalAmount: regularFeeAmount,
              status: monthData?.regularFee.status || "Unpaid",
            };
          });

          // Prepare additional fees with due amounts
          const additionalFeesData = additionalFees.map((fee) => ({
            name: fee.name,
            type: fee.feeType,
            amount: fee.amount,
            months: allMonths.map((month) => {
              const monthData = monthlyStatus.find((m) => m.month === month);
              const addFee = monthData?.additionalFees.find(
                (af) => af.name === fee.name
              );
              return {
                month,
                paidAmount: "",
                dueAmount: addFee?.due || fee.amount,
                totalAmount: fee.amount,
                status: addFee?.status || "Unpaid",
              };
            }),
          }));

          initialFormData.push({
            admissionNumber: child.admissionNumber,
            studentId: child.studentId,
            className: child.class,
            classFee: regularFeeAmount,
            totalAmount: "",
            selectedMonths: [],
            selectedAdditionalFees: [],
            paymentMode: "Cash",
            transactionId: "",
            chequeBookNo: "",
            lateFine: feeInfo.feeStatus.totalLateFines || 0,
            concession: "",
            duesPaid: "",
            remarks: "",
            monthlyDues: feeInfo.feeStatus.monthlyDues || {
              regularDues: [],
              additionalDues: [],
            },
            additionalFeeDetails: additionalFeesData,
            pastDues: feeInfo.feeStatus.pastDues || 0,
            totalDues: feeInfo.feeStatus.dues || 0,
            regularFees,
            additionalFees: additionalFeesData,
            feeInfo, // Store the full fee info for reference
          });
        }

        setFormData(initialFormData);
        setSelectedChildren([]);
        setShowForm(Array(children.length).fill(false));
        setModalOpen(true);
        setMonthlyDues({});
      } else {
        toast.error(response?.message || "Failed to fetch parent/child data.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching student data.");
    } finally {
      setIsLoader(false);
      setSearchTerm("");
      setSearchTermbyadmissionNo("");
      setFilteredStudents([]);
    }
  };

  // Child selection within modal
  const handleChildSelection = async (child, index) => {



    const isCurrentlySelected = selectedChildren.includes(index);
    const updatedSelectedChildren = [...selectedChildren];
    const updatedShowForm = [...showForm];

    if (isCurrentlySelected) {
      const toBeRemovedIndex = updatedSelectedChildren.indexOf(index);
      updatedSelectedChildren.splice(toBeRemovedIndex, 1);
      updatedShowForm[index] = false;
    } else {
      updatedSelectedChildren.push(index);
      updatedShowForm[index] = true;

      // Fetch additional fees for the student's class
      setIsLoader(true);
      try {
        const additionalFeesResponse = await axios.get(
          "https://dvsserver.onrender.com/api/v1/adminRoute/fees/?additional=true",
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );
        const feesData =
          additionalFeesResponse?.data?.data
            ?.filter((feeType) => feeType.className === child.class)
            .map((fee) => ({
              label: `${fee.name} (${fee.feeType})`,
              value: fee.amount,
              name: fee.name,
              type: fee.feeType,
            })) || [];
        setAdditionalFeesOptions(feesData);
      } catch (error) {
        toast.error(
          `Failed to fetch additional fees for ${child.studentName}.`
        );
      } finally {
        setIsLoader(false);
      }
    }

    setSelectedChildren(updatedSelectedChildren);
    setShowForm(updatedShowForm);
  };

  // Form input handlers
  const handleInputChange = (index, field, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index] = { ...updatedFormData[index], [field]: value };
    setFormData(updatedFormData);
  };

  const handleMonthSelection = (index, selectedOptions) => {
    const selectedMonths = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    const updatedFormData = [...formData];
    updatedFormData[index].selectedMonths = selectedMonths;
    setFormData(updatedFormData);
  };

  const handleAdditionalFeesChange = (index, selectedOptions) => {
    const selectedFees = selectedOptions
      ? selectedOptions.map((opt) => ({
          name: opt.name,
          amount: opt.value,
          type: opt.type,
          months: [],
        }))
      : [];
    const updatedFormData = [...formData];
    updatedFormData[index].selectedAdditionalFees = selectedFees;
    setFormData(updatedFormData);
  };

  const handleAdditionalFeeMonthSelection = (
    index,
    feeIndex,
    selectedOptions
  ) => {
    const selectedMonths = selectedOptions
      ? selectedOptions.map((opt) => opt.value)
      : [];
    const updatedFormData = [...formData];
    updatedFormData[index].selectedAdditionalFees[feeIndex].months =
      selectedMonths;
    setFormData(updatedFormData);
  };

  // Manual mode handlers
  const handleRegularFeeChange = (index, monthIndex, value) => {
    const updatedFormData = [...formData];
    const dueAmount = updatedFormData[index].regularFees[monthIndex].dueAmount;
    const paidAmount = parseFloat(value) || 0;

    if (paidAmount > dueAmount) {
      toast.error(
        `Payment for ${updatedFormData[index].regularFees[monthIndex].month} (₹${paidAmount}) exceeds remaining dues (₹${dueAmount}).`
      );
      return;
    }

    updatedFormData[index].regularFees[monthIndex].paidAmount = value;
    setFormData(updatedFormData);
  };

  const handleAdditionalFeeChange = (index, feeIndex, monthIndex, value) => {
    const updatedFormData = [...formData];
    const dueAmount =
      updatedFormData[index].additionalFees[feeIndex].months[monthIndex]
        .dueAmount;
    const paidAmount = parseFloat(value) || 0;

    if (paidAmount > dueAmount) {
      toast.error(
        `Payment for ${updatedFormData[index].additionalFees[feeIndex].name} (${updatedFormData[index].additionalFees[feeIndex].months[monthIndex].month}) (₹${paidAmount}) exceeds remaining dues (₹${dueAmount}).`
      );
      return;
    }

    updatedFormData[index].additionalFees[feeIndex].months[
      monthIndex
    ].paidAmount = value;
    setFormData(updatedFormData);
  };

  // Calculate Net Payable Amount for Auto Mode
  const calculateNetPayableAmount = (index) => {
    const data = formData[index];
    if (!data) return 0;

    let total = 0;

    // Add late fines
    total += parseFloat(data.lateFine) || 0;

    // Add past dues
    total += parseFloat(data.pastDues) || 0;

    // Add regular fees for selected months (only remaining dues)
    const regularFeeTotal = data.selectedMonths.reduce((sum, month) => {
      const fee = data.regularFees.find((f) => f.month === month);
      return sum + (fee?.dueAmount || 0);
    }, 0);
    total += regularFeeTotal;

    // Add additional fees for selected fees and months (only remaining dues)
    const additionalFeeTotal = data.selectedAdditionalFees.reduce(
      (sum, fee) => {
        const feeData = data.additionalFees.find((f) => f.name === fee.name);
        const monthsTotal = fee.months.reduce((monthSum, month) => {
          const monthData = feeData?.months.find((m) => m.month === month);
          return monthSum + (monthData?.dueAmount || 0);
        }, 0);
        return sum + monthsTotal;
      },
      0
    );
    total += additionalFeeTotal;

    return total;
  };

  // Auto mode payment distribution logic
  const calculateAutoDistribution = (index) => {
    const data = formData[index];
    if (!data.totalAmount || parseFloat(data.totalAmount) <= 0) {
      return {
        lateFinesPaid: 0,
        pastDuesPaid: 0,
        regularFeesPaid: [],
        additionalFeesPaid: [],
        remainingAfterDistribution: 0,
        remainingDues: calculateNetPayableAmount(index),
      };
    }

    let remaining = parseFloat(data.totalAmount);
    const lateFines = parseFloat(data.lateFine) || 0;
    const pastDues = parseFloat(data.pastDues) || 0;

    // Step 1: Pay late fines
    const lateFinesPaid = Math.min(remaining, lateFines);
    remaining -= lateFinesPaid;

    // Step 2: Pay past dues
    const pastDuesPaid = Math.min(remaining, pastDues);
    remaining -= pastDuesPaid;

    // Step 3: Pay regular fees for selected months
    const regularFeesPaid = [];
    data.selectedMonths.forEach((month) => {
      if (remaining > 0) {
        const fee = data.regularFees.find((f) => f.month === month);
        const dueAmount = fee?.dueAmount || 0;
        const payment = Math.min(remaining, dueAmount);
        regularFeesPaid.push({ month, amount: payment });
        remaining -= payment;
      }
    });

    // Step 4: Pay additional fees for selected fees and months
    const additionalFeesPaid = [];
    data.selectedAdditionalFees.forEach((fee) => {
      fee.months.forEach((month) => {
        if (remaining > 0) {
          const feeData = data.additionalFees.find((f) => f.name === fee.name);
          const monthData = feeData?.months.find((m) => m.month === month);
          const dueAmount = monthData?.dueAmount || 0;
          const payment = Math.min(remaining, dueAmount);
          additionalFeesPaid.push({ name: fee.name, month, amount: payment });
          remaining -= payment;
        }
      });
    });

    // Calculate remaining dues
    const netPayable = calculateNetPayableAmount(index);
    const totalPaid = parseFloat(data.totalAmount);
    const remainingDues = Math.max(0, netPayable - totalPaid);

    return {
      lateFinesPaid,
      pastDuesPaid,
      regularFeesPaid,
      additionalFeesPaid,
      remainingAfterDistribution: remaining,
      remainingDues,
    };
  };

  // Calculate total for display
  const calculateTotalForChild = (index) => {
    const data = formData[index];
    if (!data) return 0;

    const total =
      parseFloat(data.totalAmount || 0) -
      parseFloat(data.concession || 0) +
      parseFloat(data.lateFine || 0) +
      parseFloat(data.duesPaid || 0);
    return total < 0 ? 0 : total;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoader(true);

    if (selectedChildren.length === 0) {
      toast.warn("Please select at least one student.");
      setIsLoader(false);
      return;
    }

    // Validate total amount against remaining dues
    for (const childIndex of selectedChildren) {
      const child = parentData[childIndex];
      const childFormData = formData[childIndex];
      const netPayable = calculateNetPayableAmount(childIndex);
      const totalAmount = parseFloat(childFormData.totalAmount) || 0;

      if (totalAmount > netPayable) {
        toast.error(
          `Total amount (₹${totalAmount}) for ${child.studentName} exceeds remaining dues (₹${netPayable}).`
        );
        setIsLoader(false);
        return;
      }
    }

    const feePromises = [];
    for (const childIndex of selectedChildren) {
      const child = parentData[childIndex];
      const childFormData = formData[childIndex];

      if (!childFormData.paymentMode) {
        toast.error(`Payment mode is required for ${child.studentName}`);
        setIsLoader(false);
        return;
      }

      const payload = {
        studentId: child.studentId,
        session,
        mode,
        paymentDetails: {
          regularFees:
            mode === "auto"
              ? childFormData.selectedMonths.map((month) => ({
                  month,
                  paidAmount: 0,
                }))
              : childFormData.regularFees
                  .filter(
                    (fee) => fee.paidAmount && parseFloat(fee.paidAmount) > 0
                  )
                  .map((fee) => ({
                    month: fee.month,
                    paidAmount: parseFloat(fee.paidAmount),
                  })),
          additionalFees:
            mode === "auto"
              ? childFormData.selectedAdditionalFees.flatMap((fee) =>
                  fee.months.map((month) => ({
                    name: fee.name,
                    month,
                    paidAmount: 0,
                  }))
                )
              : childFormData.additionalFees.flatMap((fee) =>
                  fee.months
                    .filter((m) => m.paidAmount && parseFloat(m.paidAmount) > 0)
                    .map((m) => ({
                      name: fee.name,
                      month: m.month,
                      paidAmount: parseFloat(m.paidAmount),
                    }))
                ),
          pastDuesPaid: parseFloat(childFormData.duesPaid) || 0,
          lateFinesPaid: parseFloat(childFormData.lateFine) || 0,
          concession: parseFloat(childFormData.concession) || 0,
          totalAmount: parseFloat(childFormData.totalAmount) || 0,
          paymentMode: childFormData.paymentMode,
          transactionId:
            childFormData.paymentMode === "Online"
              ? childFormData.transactionId
              : "",
          remark: childFormData.remarks || "",
        },
      };

      feePromises.push(
        axios
          .post(
            "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus",
            payload,
            {
              withCredentials: true,
              headers: { Authorization: `Bearer ${authToken}` },
            }
          )
          .then((response) => ({
            success: true,
            studentName: child.studentName,
            message: response.data.message,
          }))
          .catch((error) => ({
            success: false,
            studentName: child.studentName,
            message: error.response?.data?.message || "Server error",
          }))
      );
    }

    try {
      const results = await Promise.all(feePromises);
      let allSuccess = true;

      results.forEach((result) => {
        if (result.success) {
          toast.success(
            `Fee created for ${result.studentName}: ${result.message}`
          );
        } else {
          toast.error(`Error for ${result.studentName}: ${result.message}`);
          allSuccess = false;
        }
      });

      if (allSuccess) {
        setModalOpen(false);
        setReload((prev) => !prev);
      }
    } catch (error) {
      toast.error("An unexpected error occurred during submission.");
    } finally {
      setIsLoader(false);
    }
  };

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
            {filteredStudents.map((student) => (
              <div
                key={student._id}
                className="p-2 border-b cursor-pointer hover:bg-gray-100"
                onClick={() => handleStudentClick(student.parentId)}
              >
                <span className="font-semibold">{student.studentName}</span>
                <span className="text-sm text-gray-600">
                  , Class: {student.class}, AdmNo: {student.admissionNumber},
                  Parent: {student.fatherName}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Fee Creation Modal */}
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title="Create Fees">
        <div className="flex flex-col max-h-[80vh]">
          <div className="flex justify-between p-4 border-b">
            <h2 className="text-lg font-semibold">Fee Payment</h2>
            <div>
              <label className="mr-2">Mode:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="border rounded p-1"
              >
                <option value="auto">Auto</option>
                <option value="manual">Manual</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-2 w-full p-4 overflow-y-auto">
            {parentData.map((child, index) => (
              <div
                key={child._id}
                className={`bg-white rounded-lg shadow-md p-3 border ${
                  selectedChildren.includes(index)
                    ? "border-blue-500"
                    : "border-gray-200"
                } h-full min-w-[300px] mb-3`}
              >
                <div className="flex items-center border-b pb-2 mb-3">
                  <input
                    type="checkbox"
                    id={`child-checkbox-${index}`}
                    checked={selectedChildren.includes(index)}
                    onChange={() => handleChildSelection(child, index)}
                    className="mr-3 h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`child-checkbox-${index}`}
                    className="flex-grow cursor-pointer"
                  >
                    <span className="text-lg font-semibold text-blue-800">
                      {child.studentName}
                    </span>
                    <span className="text-sm text-gray-700">
                      {" / Class: "} {child.class} {" / Adm#: "}{" "}
                      {child.admissionNumber}
                    </span>
                    <div className="flex justify-between text-sm mt-1">
                      <span className="text-red-600 font-medium">
                        Total Dues: ₹{formData[index]?.totalDues || 0}
                      </span>
                      {formData[index]?.lateFine > 0 && (
                        <span className="text-orange-600 font-medium">
                          Late Fine: ₹{formData[index]?.lateFine}
                        </span>
                      )}
                    </div>
                  </label>
                </div>

                {showForm[index] && formData[index] && (
                  <div className="space-y-4">
                    {mode === "auto" ? (
                      <>
                        {/* Auto Mode UI */}
                        <div className="border rounded p-3 bg-gray-50">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Months for Regular Fees (₹
                            {formData[index].classFee}/month)
                          </label>
                          <Select
                            isMulti
                            options={allMonths
                              .map((month) => {
                                const fee = formData[index].regularFees.find(
                                  (f) => f.month === month
                                );
                                return {
                                  value: month,
                                  label: `${month} (₹${fee?.dueAmount || 0})`,
                                  due: fee?.dueAmount || 0,
                                };
                              })
                              .filter((opt) => opt.due > 0)} // Filter out fully paid months
                            value={formData[index].selectedMonths.map((m) => {
                              const fee = formData[index].regularFees.find(
                                (f) => f.month === m
                              );
                              return {
                                value: m,
                                label: `${m} (₹${fee?.dueAmount || 0})`,
                                due: fee?.dueAmount || 0,
                              };
                            })}
                            onChange={(opts) =>
                              handleMonthSelection(index, opts)
                            }
                            placeholder="Select months..."
                            styles={customSelectStyles}
                          />
                        </div>

                        <div className="border rounded p-3 bg-gray-50">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Additional Fees
                          </label>
                          <Select
                            isMulti
                            options={additionalFeesOptions}
                            value={formData[index].selectedAdditionalFees.map(
                              (f) => ({
                                label: `${f.name} (${f.type})`,
                                value: f.amount,
                                name: f.name,
                                type: f.type,
                              })
                            )}
                            onChange={(opts) =>
                              handleAdditionalFeesChange(index, opts)
                            }
                            placeholder="Select additional fees..."
                          />
                          {formData[index].selectedAdditionalFees.map(
                            (fee, feeIndex) => (
                              <div key={feeIndex} className="mt-2">
                                <label className="text-sm text-gray-600">
                                  {fee.name} (₹{fee.amount}) - Select Months
                                </label>
                                <Select
                                  isMulti
                                  options={allMonths
                                    .map((month) => {
                                      const feeData = formData[
                                        index
                                      ].additionalFees.find(
                                        (f) => f.name === fee.name
                                      );
                                      const monthData = feeData?.months.find(
                                        (m) => m.month === month
                                      );
                                      return {
                                        value: month,
                                        label: `${month} (₹${
                                          monthData?.dueAmount || 0
                                        })`,
                                        due: monthData?.dueAmount || 0,
                                      };
                                    })
                                    .filter((opt) => opt.due > 0)} // Filter out fully paid months
                                  value={fee.months.map((m) => {
                                    const feeData = formData[
                                      index
                                    ].additionalFees.find(
                                      (f) => f.name === fee.name
                                    );
                                    const monthData = feeData?.months.find(
                                      (md) => md.month === m
                                    );
                                    return {
                                      value: m,
                                      label: `${m} (₹${
                                        monthData?.dueAmount || 0
                                      })`,
                                      due: monthData?.dueAmount || 0,
                                    };
                                  })}
                                  onChange={(opts) =>
                                    handleAdditionalFeeMonthSelection(
                                      index,
                                      feeIndex,
                                      opts
                                    )
                                  }
                                  placeholder={`Months for ${fee.name}...`}
                                  styles={customSelectStyles}
                                />
                              </div>
                            )
                          )}
                        </div>

                        {/* Fee Breakdown Before Payment */}
                        <div className="border rounded p-3 bg-blue-50">
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            Fee Breakdown
                          </h3>
                          <div className="space-y-2">
                            {formData[index].lateFine > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  Late Fines:
                                </span>
                                <span className="font-medium text-blue-600">
                                  ₹{formData[index].lateFine.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {formData[index].pastDues > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  Past Dues:
                                </span>
                                <span className="font-medium text-blue-600">
                                  ₹{formData[index].pastDues.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {formData[index].selectedMonths.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  Regular Fees:
                                </span>
                                {formData[index].selectedMonths.map(
                                  (month, i) => {
                                    const fee = formData[
                                      index
                                    ].regularFees.find(
                                      (f) => f.month === month
                                    );
                                    return (
                                      <div
                                        key={i}
                                        className="flex justify-between text-sm ml-2"
                                      >
                                        <span>{month}:</span>
                                        <span className="font-medium text-blue-600">
                                          ₹{(fee?.dueAmount || 0).toFixed(2)}
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                            {formData[index].selectedAdditionalFees.length >
                              0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  Additional Fees:
                                </span>
                                {formData[index].selectedAdditionalFees.map(
                                  (fee, i) => (
                                    <div key={i}>
                                      {fee.months.map((month, j) => {
                                        const feeData = formData[
                                          index
                                        ].additionalFees.find(
                                          (f) => f.name === fee.name
                                        );
                                        const monthData = feeData?.months.find(
                                          (m) => m.month === month
                                        );
                                        return (
                                          <div
                                            key={j}
                                            className="flex justify-between text-sm ml-2"
                                          >
                                            <span>
                                              {fee.name} ({month}):
                                            </span>
                                            <span className="font-medium text-blue-600">
                                              ₹
                                              {(
                                                monthData?.dueAmount || 0
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                            <div className="flex justify-between text-sm font-semibold border-t pt-2">
                              <span className="text-gray-700">
                                Net Payable Amount:
                              </span>
                              <span className="text-blue-900">
                                ₹{calculateNetPayableAmount(index).toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="border rounded p-3 bg-gray-50">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Amount to Pay
                          </label>
                          <input
                            type="number"
                            value={formData[index].totalAmount}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "totalAmount",
                                e.target.value
                              )
                            }
                            className="w-full border rounded p-2"
                            placeholder="Enter amount..."
                            min="0"
                          />
                        </div>

                        {/* Auto Mode Payment Distribution */}
                        {formData[index].totalAmount &&
                          parseFloat(formData[index].totalAmount) > 0 && (
                            <div className="border rounded p-3 bg-blue-50">
                              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                                Payment Distribution Breakdown
                              </h3>
                              <div className="space-y-2">
                                {(() => {
                                  const distribution =
                                    calculateAutoDistribution(index);
                                  return (
                                    <>
                                      {distribution.lateFinesPaid > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-700">
                                            Late Fines Paid:
                                          </span>
                                          <span className="font-medium text-green-600">
                                            ₹
                                            {distribution.lateFinesPaid.toFixed(
                                              2
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {distribution.pastDuesPaid > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-700">
                                            Past Dues Paid:
                                          </span>
                                          <span className="font-medium text-green-600">
                                            ₹
                                            {distribution.pastDuesPaid.toFixed(
                                              2
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {distribution.regularFeesPaid.length >
                                        0 && (
                                        <div>
                                          <span className="text-sm font-medium text-gray-700">
                                            Regular Fees Paid:
                                          </span>
                                          {distribution.regularFeesPaid.map(
                                            (fee, i) => (
                                              <div
                                                key={i}
                                                className="flex justify-between text-sm ml-2"
                                              >
                                                <span>{fee.month}:</span>
                                                <span className="font-medium text-green-600">
                                                  ₹{fee.amount.toFixed(2)}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                      {distribution.additionalFeesPaid.length >
                                        0 && (
                                        <div>
                                          <span className="text-sm font-medium text-gray-700">
                                            Additional Fees Paid:
                                          </span>
                                          {distribution.additionalFeesPaid.map(
                                            (fee, i) => (
                                              <div
                                                key={i}
                                                className="flex justify-between text-sm ml-2"
                                              >
                                                <span>
                                                  {fee.name} ({fee.month}):
                                                </span>
                                                <span className="font-medium text-green-600">
                                                  ₹{fee.amount.toFixed(2)}
                                                </span>
                                              </div>
                                            )
                                          )}
                                        </div>
                                      )}
                                      {distribution.remainingAfterDistribution >
                                        0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-700">
                                            Remaining Amount (Not Used):
                                          </span>
                                          <span className="font-medium text-orange-600">
                                            ₹
                                            {distribution.remainingAfterDistribution.toFixed(
                                              2
                                            )}
                                          </span>
                                        </div>
                                      )}
                                      {distribution.remainingDues > 0 && (
                                        <div className="flex justify-between text-sm">
                                          <span className="text-gray-700">
                                            Remaining Dues (Added to Total
                                            Dues):
                                          </span>
                                          <span className="font-medium text-red-600">
                                            ₹
                                            {distribution.remainingDues.toFixed(
                                              2
                                            )}
                                          </span>
                                        </div>
                                      )}
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                      </>
                    ) : (
                      <>
                        {/* Manual Mode UI with Dropdowns */}
                        <div className="border rounded p-3 bg-gray-50">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Months for Regular Fees (₹
                            {formData[index].classFee}/month)
                          </label>
                          <Select
                            isMulti
                            options={allMonths
                              .map((month) => {
                                const fee = formData[index].regularFees.find(
                                  (f) => f.month === month
                                );
                                return {
                                  value: month,
                                  label: `${month} (₹${fee?.dueAmount || 0})`,
                                  due: fee?.dueAmount || 0,
                                };
                              })
                              .filter((opt) => opt.due > 0)} // Filter out fully paid months
                            value={formData[index].selectedMonths.map((m) => {
                              const fee = formData[index].regularFees.find(
                                (f) => f.month === m
                              );
                              return {
                                value: m,
                                label: `${m} (₹${fee?.dueAmount || 0})`,
                                due: fee?.dueAmount || 0,
                              };
                            })}
                            onChange={(opts) =>
                              handleMonthSelection(index, opts)
                            }
                            placeholder="Select months..."
                            styles={customSelectStyles}
                          />
                          {formData[index].selectedMonths.length > 0 && (
                            <div className="mt-2">
                              <span className="text-sm font-medium text-gray-700">
                                Enter Payment for Selected Months:
                              </span>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                                {formData[index].selectedMonths.map(
                                  (month, monthIndex) => {
                                    const feeIndex = formData[
                                      index
                                    ].regularFees.findIndex(
                                      (f) => f.month === month
                                    );
                                    return (
                                      <div
                                        key={monthIndex}
                                        className="flex items-center gap-2"
                                      >
                                        <span className="text-sm">
                                          {month}:
                                        </span>
                                        <input
                                          type="number"
                                          value={
                                            formData[index].regularFees[
                                              feeIndex
                                            ].paidAmount
                                          }
                                          onChange={(e) =>
                                            handleRegularFeeChange(
                                              index,
                                              feeIndex,
                                              e.target.value
                                            )
                                          }
                                          className="w-20 border rounded p-1"
                                          placeholder="0"
                                          min="0"
                                        />
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="border rounded p-3 bg-gray-50">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Additional Fees
                          </label>
                          <Select
                            isMulti
                            options={additionalFeesOptions}
                            value={formData[index].selectedAdditionalFees.map(
                              (f) => ({
                                label: `${f.name} (${f.type})`,
                                value: f.amount,
                                name: f.name,
                                type: f.type,
                              })
                            )}
                            onChange={(opts) =>
                              handleAdditionalFeesChange(index, opts)
                            }
                            placeholder="Select additional fees..."
                          />
                          {formData[index].selectedAdditionalFees.map(
                            (fee, feeIndex) => (
                              <div key={feeIndex} className="mt-2">
                                <label className="text-sm text-gray-600">
                                  {fee.name} (₹{fee.amount}) - Select Months
                                </label>
                                <Select
                                  isMulti
                                  options={allMonths
                                    .map((month) => {
                                      const feeData = formData[
                                        index
                                      ].additionalFees.find(
                                        (f) => f.name === fee.name
                                      );
                                      const monthData = feeData?.months.find(
                                        (m) => m.month === month
                                      );
                                      return {
                                        value: month,
                                        label: `${month} (₹${
                                          monthData?.dueAmount || 0
                                        })`,
                                        due: monthData?.dueAmount || 0,
                                      };
                                    })
                                    .filter((opt) => opt.due > 0)} // Filter out fully paid months
                                  value={fee.months.map((m) => {
                                    const feeData = formData[
                                      index
                                    ].additionalFees.find(
                                      (f) => f.name === fee.name
                                    );
                                    const monthData = feeData?.months.find(
                                      (md) => md.month === m
                                    );
                                    return {
                                      value: m,
                                      label: `${m} (₹${
                                        monthData?.dueAmount || 0
                                      })`,
                                      due: monthData?.dueAmount || 0,
                                    };
                                  })}
                                  onChange={(opts) =>
                                    handleAdditionalFeeMonthSelection(
                                      index,
                                      feeIndex,
                                      opts
                                    )
                                  }
                                  placeholder={`Months for ${fee.name}...`}
                                  styles={customSelectStyles}
                                />
                                {fee.months.length > 0 && (
                                  <div className="mt-2">
                                    <span className="text-sm font-medium text-gray-600">
                                      Enter Payment for {fee.name}:
                                    </span>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                                      {fee.months.map((month, monthIndex) => {
                                        const feeData = formData[
                                          index
                                        ].additionalFees.find(
                                          (f) => f.name === fee.name
                                        );
                                        const monthDataIndex =
                                          feeData?.months.findIndex(
                                            (m) => m.month === month
                                          );
                                        return (
                                          <div
                                            key={monthIndex}
                                            className="flex items-center gap-2"
                                          >
                                            <span className="text-sm">
                                              {month}:
                                            </span>
                                            <input
                                              type="number"
                                              value={
                                                feeData?.months[monthDataIndex]
                                                  .paidAmount
                                              }
                                              onChange={(e) =>
                                                handleAdditionalFeeChange(
                                                  index,
                                                  feeIndex,
                                                  monthDataIndex,
                                                  e.target.value
                                                )
                                              }
                                              className="w-20 border rounded p-1"
                                              placeholder="0"
                                              min="0"
                                            />
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>

                        {/* Manual Mode Fee Breakdown */}
                        <div className="border rounded p-3 bg-blue-50">
                          <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            Fee Breakdown (Manual Mode)
                          </h3>
                          <div className="space-y-2">
                            {formData[index].lateFine > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  Late Fines:
                                </span>
                                <span className="font-medium text-blue-600">
                                  ₹{formData[index].lateFine.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {formData[index].pastDues > 0 && (
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-700">
                                  Past Dues:
                                </span>
                                <span className="font-medium text-blue-600">
                                  ₹{formData[index].pastDues.toFixed(2)}
                                </span>
                              </div>
                            )}
                            {formData[index].selectedMonths.length > 0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  Regular Fees Paid:
                                </span>
                                {formData[index].selectedMonths.map(
                                  (month, i) => {
                                    const fee = formData[
                                      index
                                    ].regularFees.find(
                                      (f) => f.month === month
                                    );
                                    return (
                                      <div
                                        key={i}
                                        className="flex justify-between text-sm ml-2"
                                      >
                                        <span>{month}:</span>
                                        <span className="font-medium text-blue-600">
                                          ₹
                                          {(
                                            parseFloat(fee?.paidAmount) || 0
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    );
                                  }
                                )}
                              </div>
                            )}
                            {formData[index].selectedAdditionalFees.length >
                              0 && (
                              <div>
                                <span className="text-sm font-medium text-gray-700">
                                  Additional Fees Paid:
                                </span>
                                {formData[index].selectedAdditionalFees.map(
                                  (fee, i) => (
                                    <div key={i}>
                                      {fee.months.map((month, j) => {
                                        const feeData = formData[
                                          index
                                        ].additionalFees.find(
                                          (f) => f.name === fee.name
                                        );
                                        const monthData = feeData?.months.find(
                                          (m) => m.month === month
                                        );
                                        return (
                                          <div
                                            key={j}
                                            className="flex justify-between text-sm ml-2"
                                          >
                                            <span>
                                              {fee.name} ({month}):
                                            </span>
                                            <span className="font-medium text-blue-600">
                                              ₹
                                              {(
                                                parseFloat(
                                                  monthData?.paidAmount
                                                ) || 0
                                              ).toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="border rounded p-3 bg-gray-50">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Total Amount to Pay
                          </label>
                          <input
                            type="number"
                            value={formData[index].totalAmount}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "totalAmount",
                                e.target.value
                              )
                            }
                            className="w-full border rounded p-2"
                            placeholder="Enter amount..."
                            min="0"
                          />
                        </div>
                      </>
                    )}

                    {/* Common Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Payment Mode
                        </label>
                        <select
                          value={formData[index].paymentMode}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "paymentMode",
                              e.target.value
                            )
                          }
                          className="w-full border rounded p-2"
                        >
                          <option value="Cash">Cash</option>
                          <option value="Online">Online</option>
                          <option value="Cheque">Cheque</option>
                        </select>
                      </div>

                      {formData[index].paymentMode === "Online" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Transaction ID
                          </label>
                          <input
                            type="text"
                            value={formData[index].transactionId}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "transactionId",
                                e.target.value
                              )
                            }
                            className="w-full border rounded p-2"
                            placeholder="Enter transaction ID"
                          />
                        </div>
                      )}

                      {formData[index].paymentMode === "Cheque" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Cheque Number
                          </label>
                          <input
                            type="text"
                            value={formData[index].chequeBookNo}
                            onChange={(e) =>
                              handleInputChange(
                                index,
                                "chequeBookNo",
                                e.target.value
                              )
                            }
                            className="w-full border rounded p-2"
                            placeholder="Enter cheque number"
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Late Fine
                        </label>
                        <input
                          type="number"
                          value={formData[index].lateFine}
                          onChange={(e) =>
                            handleInputChange(index, "lateFine", e.target.value)
                          }
                          className="w-full border rounded p-2"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Concession
                        </label>
                        <input
                          type="number"
                          value={formData[index].concession}
                          onChange={(e) =>
                            handleInputChange(
                              index,
                              "concession",
                              e.target.value
                            )
                          }
                          className="w-full border rounded p-2"
                          min="0"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Dues Paid
                        </label>
                        <input
                          type="number"
                          value={formData[index].duesPaid}
                          onChange={(e) =>
                            handleInputChange(index, "duesPaid", e.target.value)
                          }
                          className="w-full border rounded p-2"
                          min="0"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Remarks
                        </label>
                        <textarea
                          value={formData[index].remarks}
                          onChange={(e) =>
                            handleInputChange(index, "remarks", e.target.value)
                          }
                          className="w-full border rounded p-2"
                          rows="2"
                          placeholder="Optional remarks..."
                        />
                      </div>

                      <div className="sm:col-span-2 p-2 bg-blue-50 rounded border border-blue-200">
                        <label className="block text-lg font-semibold text-blue-900">
                          Net Amount Payable: ₹{" "}
                          {calculateTotalForChild(index).toFixed(2)}
                        </label>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 p-4 border-t bg-gray-50 sticky bottom-0">
            <button
              type="button"
              onClick={handleSubmit}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Submit Fees
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

      <Table reLoad={reLoad} />
    </div>
  );
};

export default CreateFees;
