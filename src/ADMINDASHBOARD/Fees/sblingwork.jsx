import axios from "axios";
import React, { useEffect, useState } from "react";

import Select from "react-select";
import { toast } from "react-toastify";
import Table from "./Table";

const NewCheckFee2 = () => {
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showForm, setShowForm] = useState([]);
  const [reLoad, setReload] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
  const [allFees, setAllFees] = useState([]);
  const [parentData, setParentData] = useState([]);
  const [allStudent, setAllStudent] = useState([]);
  const getCurrentMonth = () => {
    const today = new Date();
    const month = today.toLocaleString("default", { month: "long" });
    return month;
  };
  const [formData, setFormData] = useState(
    parentData.map(() => ({
      classFee: "",
      additionalFeeValues: [],
      feeStatus: "Unpaid",
      feeDate: "",
      paymentMode: "Cash",
      selectedMonths: [],
      previousDues: "",
      remarks: "",
      transactionId: "",
      chequeBookNo: "",
    }))
  );

  const authToken = localStorage.getItem("token");

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  useEffect(() => {
    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        setAllStudent(response.data.allStudent);
      });
  }, [authToken]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredStudents([]);
    } else {
      const filtered = allStudent.filter(
        (student) =>
          student.fullName &&
          student.fullName.toLowerCase().includes(searchValue)
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

  const handleStudentClick = (admissionNumber) => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const children = response.data.children;
        console.log("Fetched children data:", children); // Debugging line
        setParentData(children);
        const initialFormData = children.map((child) => ({
          admissionNumber: child.admissionNumber,
          feeAmount: "",
          selectedMonths: [],
          //   selectedMonths: [getCurrentMonth()],
          feeDate: getCurrentDate(),
          feeStatus: "Paid",
          paymentMode: "Online",
          selectedAdditionalFees: [],
          amountSubmitted: 0,
          //   getFee: 0,
        }));

        console.log("Initial form data:", initialFormData); // Debugging line
        setFormData(initialFormData);
        setIsOpen(true);
      })
      .catch((error) => {
        console.error("Error fetching parent data:", error);
      });
  };
  const handleChildSelection = (index) => {
    const selectedChild = parentData[index];
    const studentClass = selectedChild.class;

    axios
      .get(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const feesData = response.data.map((fee) => {
          const label =
            fee.name && fee.amount
              ? `${fee.name} (${fee.amount})`
              : "Unknown Fee";
          const value = fee.amount ? fee.amount.toString() : "0";

          return {
            label,
            value,
          };
        });
        setAllFees(feesData);
      });

    axios
      .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const data = response.data;

        if (Array.isArray(data)) {
          const studentFeeAmount =
            data
              .filter((feeType) => feeType.className === studentClass)
              .map((classData) => classData.amount)[0] || 0;

          const updatedFormData = [...formData];
          updatedFormData[index] = {
            ...updatedFormData[index],
            classFee: studentFeeAmount,
            selectedMonths: updatedFormData[index]?.selectedMonths || [],
            totalRegularFee:
              studentFeeAmount *
              (updatedFormData[index]?.selectedMonths.length || 1),
            additionalFee: updatedFormData[index]?.additionalFee || 0, // Add this line
          };

          setFormData(updatedFormData);
          //   setClassFee(studentFeeAmount);
        } else {
          console.error("Invalid or undefined feeTypeArray");
        }
      })
      .catch((error) => {
        console.log(error);
      });

    const updatedSelectedChildren = [...selectedChildren];
    const updatedShowForm = [...showForm];

    if (updatedSelectedChildren.includes(index)) {
      updatedSelectedChildren.splice(updatedSelectedChildren.indexOf(index), 1);
      updatedShowForm[index] = false; // Hide the form when unchecked
    } else {
      updatedSelectedChildren.push(index);
      updatedShowForm[index] = true; // Show the form when checked
    }

    setSelectedChildren(updatedSelectedChildren);
    setShowForm(updatedShowForm);
  };

  const handleMonthSelection = (selectedOptions, childIndex) => {
    const selectedMonths = selectedOptions.map((option) => option.value);

    // Initialize fee amounts for selected months
    const updatedFormData = [...formData];
    selectedMonths.forEach((month) => {
      if (!updatedFormData[childIndex].monthFees) {
        updatedFormData[childIndex].monthFees = {};
      }
      if (!updatedFormData[childIndex].monthFees[month]) {
        updatedFormData[childIndex].monthFees[month] =
          updatedFormData[childIndex].classFee || 0;
      }
    });

    updatedFormData[childIndex].selectedMonths = selectedMonths;

    // Calculate the total class fee based on selected months
    const totalClassFee =
      (updatedFormData[childIndex].classFee || 0) * selectedMonths.length;
    updatedFormData[childIndex].totalClassFee = totalClassFee;

    setFormData(updatedFormData);
  };

  const handleMonthFeeChange = (index, month, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index].monthFees[month] = parseFloat(value);

    // Recalculate the total class fee whenever an input changes
    const totalClassFee =
      (updatedFormData[index].classFee || 0) *
      updatedFormData[index].selectedMonths.length;
    updatedFormData[index].totalClassFee = totalClassFee;

    setFormData(updatedFormData);
  };

  const handleInputChange = (index, field, value) => {
    const updatedFormData = [...formData];
    updatedFormData[index] = {
      ...updatedFormData[index],
      [field]: value,
    };
    setFormData(updatedFormData);
  };

  const toggleModal = () => {
    setIsOpen(!isOpen);

    if (isOpen) {
      setSelectedChildren([]);
    }
  };

  const handleAdditionalFeeChange = (index, feeIndex, month, value) => {
    const updatedFormData = [...formData];
    const feeData = updatedFormData[index].additionalFeeValues[feeIndex];

    // Update specific month fee value
    feeData.monthFees[month] = parseFloat(value) || 0;

    // Recalculate total for this fee
    const totalFeeForCurrent = feeData.selectedMonths.reduce(
      (total, month) => total + (feeData.monthFees[month] || 0),
      0
    );
    feeData.totalFee = totalFeeForCurrent;

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const childIndex of selectedChildren) {
        const child = parentData[childIndex];
        const childFormData = formData[childIndex] || {}; // Ensure formData exists

        // Basic validation: Check if required fields are filled
        if (!childFormData.paymentMode) {
          toast.error(`Payment mode is required for ${child.fullName}`);
          continue; // Skip to next iteration
        }

        // const selectedMonthsData =
        //   (childFormData.selectedMonths || []).map((month) => ({
        //     month: month,
        //     paidAmount: Number(childFormData.monthFees?.[month]) || 0,
        //     // status: "Paid",
        //   })) || [];
        const selectedMonthsData =
  (childFormData.selectedMonths || []).map((month) => {
    const paidAmount = Number(childFormData.monthFees?.[month]) || 0;
    console.log(typeof paidAmount); // This should log 'number'
    
    return {
      month: month,
      paidAmount: paidAmount,
      // status: "Paid",
    };
  }) || [];


        const additionalFeesData = (
          childFormData.additionalFeeValues || []
        ).flatMap((feeData) => {
          console.log("feeData", feeData);

          // Flatten selected months into separate objects
          return (feeData.selectedMonths || []).map((month) => ({
            name: feeData.fee || "", // Fee name
            month: month, // Month
            paidAmount: feeData.monthFees ? feeData.monthFees[month] || 0 : 0, // Correctly use monthFees for paidAmount
            // status: "Paid", // Assuming status is static; adjust if needed
          }));
        });

        // Calculate Total Class Fee
        const totalClassFee = childFormData.totalClassFee || 0;
        console.log("totalClassFee", childFormData);

        // Calculate Total Additional Fees
        const totalAdditionalFees = childFormData.additionalFee || 0;
        console.log("totalAdditionalFees", totalAdditionalFees);

        // Calculate Total Fee Amount (Class Fee + Additional Fees)
        let previousDues = parseFloat(childFormData.previousDues) || 0;
        const totalFeeAmount = parseFloat(
          totalClassFee + totalAdditionalFees + previousDues
        );

        const newFeeData = {
          admissionNumber: child?.admissionNumber || "",
          className: child?.class || "",
          feeHistory: {
            regularFees: selectedMonthsData,
            additionalFees: additionalFeesData,
            status: childFormData.feeStatus || "Pending",
            paymentMode: childFormData.paymentMode || "Cash",
            // transactionId: "TX12345",

            transactionId: childFormData.transactionId,
            previousDues: parseFloat(childFormData.previousDues) || 0,
            remark: childFormData.remarks || "",
            totalFeeAmount: totalFeeAmount, // Include total fee amount here
          },
        };

        // Conditional data based on payment mode
        if (childFormData.paymentMode === "Cheque") {
          newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
        } else if (childFormData.paymentMode === "Online") {
          newFeeData.transactionId = childFormData.transactionId || "";
        }

        // API Call inside try-catch
        try {
          const response = await axios.post(
            "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
            newFeeData,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );

          toast.success(
            `Fee created for ${child.fullName}: ${response.data.message}`
          );
          setReload((preReload) => !preReload);
        } catch (error) {
          console.error("Error Posting Data: ", error);
          toast.error(
            `Error creating fee for ${child.fullName}: ${
              error.response?.data?.message || "Server error"
            }`
          );
        }
      }
    } catch (error) {
      console.error("Unhandled Error: ", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsOpen(false);
    }
  };

  const handleAdditionalFeesChange = (index, selectedOptions) => {
    const additionalFeeValues = selectedOptions.map((option) => ({
      fee: option.label,
      value: option.value, // Initialize value to 0
      // value: 0, // Initialize value to 0
      selectedMonths: [], // Initialize selectedMonths as an empty array
      monthFees: {}, // Initialize monthFees as an empty object
    }));

    const totalAdditionalFee = additionalFeeValues.reduce((total, fee) => {
      const monthCount = fee.selectedMonths.length; // Count of selected months
      const feeAmount = parseFloat(fee.value); // Base fee value
      return total + feeAmount * monthCount; // Calculate total based on month count
    }, 0);

    const updatedFormData = [...formData];
    updatedFormData[index] = {
      ...updatedFormData[index],
      additionalFee: totalAdditionalFee,

      additionalFeeValues: additionalFeeValues,
    };
    // console.log("updatedFormData",updatedFormData)

    setFormData(updatedFormData);
  };

  const handleAdditionalFeeMonthSelection = (
    index,
    feeIndex,
    selectedOptions
  ) => {
    const selectedMonths = selectedOptions.map((option) => option.value);

    const updatedFormData = [...formData];
    updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
      selectedMonths;

    const feeValue = updatedFormData[index].additionalFeeValues[feeIndex].value;
    const monthCount = selectedMonths.length;
    const totalFeeForCurrent = feeValue * monthCount;
    updatedFormData[index].additionalFeeValues[feeIndex].totalFee =
      totalFeeForCurrent;

    // Recalculate total additional fees based on the updated values
    const totalAdditionalFee = updatedFormData[
      index
    ].additionalFeeValues.reduce((total, fee) => {
      return total + (fee.totalFee || 0);
    }, 0);
    console.log("totalAdditionalFee", totalAdditionalFee);

    updatedFormData[index].additionalFee = totalAdditionalFee;
    setFormData(updatedFormData);
  };

  return (
    <div className="md:min-h-screen px-5 pl-10 md:pl-0 md:px-0">
      <div className="">
        <input
          type="text"
          placeholder="Search by name"
          value={searchTerm}
          onChange={handleSearch}
          className="p-1 border border-gray-300 rounded mb-4 mr-2"
        />
        <input
          type="text"
          placeholder="Search by Admission No"
          value={searchTermbyadmissionNo}
          onChange={handleSearchbyAdmissionNo}
          className="p-1 border border-gray-300 rounded mb-4"
        />
      </div>
      {filteredStudents.length > 0 && (
        <div className="max-h-60 overflow-y-auto border md:w-1/2 border-gray-300 rounded mb-2">
          {filteredStudents.map((student, index) => (
            <h1
              key={index}
              className="p-2 border-b cursor-pointer hover:bg-gray-100"
              onClick={() => handleStudentClick(student.parentAdmissionNumber)}
            >
              {student.fullName || "No Name"}, {student.class},{" "}
              {student.fatherName}, {student.admissionNumber}
            </h1>
          ))}
        </div>
      )}
      {isOpen && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
        >
          <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  School Fees
                </h3>
                <button
                  onClick={toggleModal}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                  data-modal-toggle="default-modal"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l12 12M13 1L1 13"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-wrap md:flex-row flex-col w-full gap-4"
                >
                  {parentData.map((child, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-lg shadow-md p-2 w-full md:w-[48%] lg:w-[32%]"
                    >
                      <div className=" w-full flex items-center flex-row gap-2 bg-gray-100 mb-2 p-2">
                        <div>
                          <input
                            type="checkbox"
                            checked={selectedChildren.includes(index)}
                            onChange={() => handleChildSelection(index)}
                            className="mr-2 "
                          />
                        </div>
                        <div>
                          <span className=" text-[16px] font-semibold text-gray-800">
                            Student : {child.fullName} ,
                          </span>
                          <span className="text-[16px] text-gray-600">
                            {" "}
                            Class : {child.class}
                          </span>
                        </div>
                      </div>
                      {showForm[index] && (
                        <>
                          <div className="mb-2 bg-gray-100 flex items-center p-2 rounded">
                            <div className="w-full ">
                              <div className="flex flex-row bg-gray-100 rounded">
                                <input
                                  type="checkbox"
                                  checked={
                                    formData[index]?.includeClassFee || false
                                  }
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "includeClassFee",
                                      e.target.checked
                                    )
                                  }
                                  className="mr-2"
                                />
                                <label
                                  htmlFor=""
                                  className="block text-sm font-medium text-red-700"
                                >
                                  Class Fee
                                </label>
                              </div>
                              {formData[index]?.includeClassFee && (
                                <>
                                  <div>
                                    <label className="block text-sm font-medium text-gray-700 mt-2">
                                      Months
                                    </label>
                                    <Select
                                      options={[
                                        "January",
                                        "February",
                                        "March",
                                        "April",
                                        "May",
                                        "June",
                                        "July",
                                        "August",
                                        "September",
                                        "October",
                                        "November",
                                        "December",
                                      ].map((month) => ({
                                        value: month,
                                        label: month,
                                      }))}
                                      value={formData[
                                        index
                                      ]?.selectedMonths?.map((month) => ({
                                        value: month,
                                        label: month,
                                      }))}
                                      onChange={(selectedOptions) =>
                                        handleMonthSelection(
                                          selectedOptions,
                                          index
                                        )
                                      }
                                      isMulti
                                      name="months"
                                      className="basic-multi-select mt-2"
                                      classNamePrefix="select"
                                    />
                                  </div>
                                  {/* Display the total class fee above month inputs */}
                                  <div className="mt-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                      Total Class Fee: ₹
                                      {formData[index]?.totalClassFee || 0}
                                    </label>
                                  </div>
                                  <div className="w-full flex flex-wrap gap-2 p-2">
                                    {formData[index]?.selectedMonths?.map(
                                      (month, monthIndex) => (
                                        <div
                                          key={monthIndex}
                                          className="bg-gray-200 p-2 rounded"
                                        >
                                          <label className="block text-[10px] font-medium text-gray-700">
                                            {month}' Fee : ₹
                                          </label>
                                          <input
                                            type="number"
                                            className="w-20 border rounded-sm p-1 text-[10px]"
                                            value={
                                              formData[index]?.monthFees?.[
                                                month
                                              ]
                                            }
                                            onChange={(e) =>
                                              handleMonthFeeChange(
                                                index,
                                                month,
                                                e.target.value
                                              )
                                            }
                                          />
                                        </div>
                                      )
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="mb-2 p-2 bg-gray-100 rounded">
                            <div className="flex flex-row ">
                              <input
                                type="checkbox"
                                checked={
                                  formData[index]?.includeAdditionalFees ||
                                  false
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "includeAdditionalFees",
                                    e.target.checked
                                  )
                                }
                                className="mr-2"
                              />
                              <label className="block text-sm font-medium text-red-700">
                                Additional Fees
                              </label>
                            </div>
                            {formData[index]?.includeAdditionalFees && (
                              <>
                                <label className="block text-[12px] font-medium text-gray-700 mt-2">
                                  Additional Fees Total Amount: ₹
                                  {formData[index]?.additionalFee || 0}
                                </label>
                                <Select
                                  isMulti
                                  options={allFees}
                                  onChange={(selectedOptions) =>
                                    handleAdditionalFeesChange(
                                      index,
                                      selectedOptions
                                    )
                                  }
                                  className="basic-single mt-2"
                                  classNamePrefix="select"
                                />
                                {formData[index]?.additionalFeeValues?.map(
                                  (feeData, feeIndex) => (
                                    <div
                                      key={feeIndex}
                                      className="bg-gray-200 mt-1 w-full flex flex-wrap gap-2 p-2 rounded"
                                    >
                                      <div className="w-full">
                                        <p className="block text-[10px] font-medium text-gray-700">
                                          {feeData.fee}
                                        </p>
                                      </div>
                                      <div className="w-full">
                                        <label className="block text-[10px] font-medium text-gray-700">
                                          Months
                                        </label>
                                        <Select
                                          options={[
                                            "January",
                                            "February",
                                            "March",
                                            "April",
                                            "May",
                                            "June",
                                            "July",
                                            "August",
                                            "September",
                                            "October",
                                            "November",
                                            "December",
                                          ].map((month) => ({
                                            value: month,
                                            label: month,
                                          }))}
                                          value={feeData.selectedMonths.map(
                                            (month) => ({
                                              value: month,
                                              label: month,
                                            })
                                          )}
                                          onChange={(selectedOptions) =>
                                            handleAdditionalFeeMonthSelection(
                                              index,
                                              feeIndex,
                                              selectedOptions
                                            )
                                          }
                                          isMulti
                                          name="months"
                                          className="text-[10px] mt-1"
                                          classNamePrefix="select"
                                        />
                                        {feeData.selectedMonths?.map(
                                          (month) => (
                                            <div
                                              key={month}
                                              className="bg-gray-200 p-2 rounded"
                                            >
                                              <label className="block text-[10px] font-medium text-gray-700">
                                                {`${feeData.fee} (${month}) Fee: ₹`}
                                              </label>
                                              <input
                                                type="number"
                                                className="w-20 border rounded-sm p-1 text-[10px]"
                                                value={feeData.monthFees[month]}
                                                onChange={(e) =>
                                                  handleAdditionalFeeChange(
                                                    index,
                                                    feeIndex,
                                                    month,
                                                    e.target.value
                                                  )
                                                }
                                              />
                                            </div>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  )
                                )}
                              </>
                            )}
                          </div>

                          {/* Fee Status */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
                            <div className=" p-2 bg-gray-100 rounded">
                              <label className="block text-[14px] font-medium text-gray-600">
                                Fee Status
                              </label>
                              <select
                                className="w-full border p-1 rounded"
                                value={formData[index]?.feeStatus || "Unpaid"}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "feeStatus",
                                    e.target.value
                                  )
                                }
                              >
                                <option value="Paid">Paid</option>
                                <option value="Unpaid">Unpaid</option>
                              </select>
                            </div>

                            {/* Fee Date */}
                            <div className="p-2 bg-gray-100 rounded">
                              <label className="block text-[14px] font-medium text-gray-600">
                                Fee Date
                              </label>
                              <input
                                type="date"
                                value={
                                  formData[index]?.feeDate || getCurrentDate()
                                }
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "feeDate",
                                    e.target.value
                                  )
                                }
                                className="w-full border p-1 rounded"
                              />
                            </div>
                            {/* Payment Mode */}
                            <div className="p-2 bg-gray-100 rounded">
                              <div className="">
                                <label className="block text-[14px] font-medium text-gray-600">
                                  Payment Mode
                                </label>
                                <select
                                  value={formData[index]?.paymentMode || "Cash"}
                                  onChange={(e) =>
                                    handleInputChange(
                                      index,
                                      "paymentMode",
                                      e.target.value
                                    )
                                  }
                                  className="w-full border p-1 rounded"
                                >
                                  {" "}
                                  <option value="Cash">Cash</option>
                                  <option value="Online">Online</option>
                                  <option value="Cheque">Cheque</option>
                                </select>
                              </div>

                              {/* Conditional Fields based on Payment Mode */}
                              {formData[index]?.paymentMode === "Online" && (
                                <div className="mb-4">
                                  <label className="block text-[14px] font-medium text-gray-600">
                                    Transaction ID
                                  </label>
                                  <input
                                    type="text"
                                    value={formData[index]?.transactionId || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        "transactionId",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border p-1 rounded"
                                  />
                                </div>
                              )}

                              {formData[index]?.paymentMode === "Cheque" && (
                                <div className="mb-2">
                                  <label className="block text-[14px] font-medium text-gray-600">
                                    Cheque Book No
                                  </label>
                                  <input
                                    type="text"
                                    value={formData[index]?.chequeBookNo || ""}
                                    onChange={(e) =>
                                      handleInputChange(
                                        index,
                                        "chequeBookNo",
                                        e.target.value
                                      )
                                    }
                                    className="w-full border p-1 rounded"
                                  />
                                </div>
                              )}
                            </div>

                            {/* Previous Dues */}
                            <div className="p-2 bg-gray-100 rounded">
                              <label className="block text-[14px] font-medium text-gray-600">
                                Previous Dues Paid
                              </label>
                              <input
                                type="number"
                                placeholder="Enter previous dues"
                                value={formData[index]?.previousDues || ""}
                                onChange={(e) =>
                                  handleInputChange(
                                    index,
                                    "previousDues",
                                    e.target.value
                                  )
                                }
                                className="w-full border p-1 rounded"
                              />
                            </div>
                          </div>

                          {/* Remarks */}
                          <div className="p-2">
                            <label className="block text-[14px] font-medium text-gray-600">
                              Remarks
                            </label>
                            <textarea
                              type="text"
                              value={formData[index]?.remarks || ""}
                              onChange={(e) =>
                                handleInputChange(
                                  index,
                                  "remarks",
                                  e.target.value
                                )
                              }
                              className="w-full border p-1 rounded"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
                    >
                      Submit
                    </button>
                    <button
                      type="button"
                      onClick={toggleModal}
                      className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="">
        <Table reLoad={reLoad} />
      </div>
    </div>
  );
};

export default NewCheckFee2;



// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [reLoad, setReload] = useState(false);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [searchTermbyadmissionNo, setSearchTermbyadmissionNo] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };
//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeStatus: "Unpaid",
//       feeDate: "",
//       paymentMode: "Cash",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = Cookies.get("token");

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
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

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [],
//           //   selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           //   getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };
//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });
//         setAllFees(feesData);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

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
//             additionalFee: updatedFormData[index]?.additionalFee || 0, // Add this line
//           };

//           setFormData(updatedFormData);
//           //   setClassFee(studentFeeAmount);
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
//       updatedShowForm[index] = false; // Hide the form when unchecked
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true; // Show the form when checked
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     // Initialize fee amounts for selected months
//     const updatedFormData = [...formData];
//     selectedMonths.forEach((month) => {
//       if (!updatedFormData[childIndex].monthFees) {
//         updatedFormData[childIndex].monthFees = {};
//       }
//       if (!updatedFormData[childIndex].monthFees[month]) {
//         updatedFormData[childIndex].monthFees[month] =
//           updatedFormData[childIndex].classFee || 0;
//       }
//     });

//     updatedFormData[childIndex].selectedMonths = selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const handleMonthFeeChange = (childIndex, month, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[childIndex].monthFees[month] = value;
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

//   const handleAdditionalFeeMonthValueChange = (
//     index,
//     feeIndex,
//     month,
//     value
//   ) => {
//     const updatedFormData = [...formData];

//     // Check if additionalFeeValues and selectedMonths exist for the given index and feeIndex
//     if (
//       updatedFormData[index] &&
//       updatedFormData[index].additionalFeeValues &&
//       updatedFormData[index].additionalFeeValues[feeIndex]
//     ) {
//       const feeData = updatedFormData[index].additionalFeeValues[feeIndex];

//       // Update the month value if it exists
//       if (feeData.selectedMonths.includes(month)) {
//         const updatedMonthFees = {
//           ...feeData.monthFees,
//           [month]: value,
//         };

//         updatedFormData[index].additionalFeeValues[feeIndex] = {
//           ...feeData,
//           monthFees: updatedMonthFees,
//         };
//       }
//     }

//     setFormData(updatedFormData);
//   };

//   const toggleModal = () => {
//     setIsOpen(!isOpen);

//     if (isOpen) {
//       setSelectedChildren([]);
//     }
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       for (const childIndex of selectedChildren) {
//         const child = parentData[childIndex];
//         const childFormData = formData[childIndex] || {}; // Ensure formData exists

//         // Basic validation: Check if required fields are filled
//         if (!childFormData.paymentMode) {
//           toast.error(`Payment mode is required for ${child.fullName}`);
//           continue; // Skip to next iteration
//         }

//         // Prepare data
//         const selectedMonthsData =
//           (childFormData.selectedMonths || []).map((month) => ({
//             month: month,
//             paidAmount: childFormData.monthFees?.[month] || 0,
//             status: "Paid",
//           })) || [];

//         const additionalFeesData = (
//           childFormData.additionalFeeValues || []
//         ).flatMap((feeData) => {
//           // Flatten selected months into separate objects
//           return (feeData.selectedMonths || []).map((month) => ({
//             name: feeData.fee || "", // Fee name
//             month: month, // Month
//             paidAmount: feeData.value || 0, // Fee amount
//             status: "Paid", // Assuming status is static; adjust if needed
//           }));
//         });

//         const newFeeData = {
//           admissionNumber: child?.admissionNumber || "",
//           className: child?.class || "",
//           feeHistory: {
//             regularFees: selectedMonthsData,
//             additionalFees: additionalFeesData,

//             status: childFormData.feeStatus || "Pending",
//             paymentMode: childFormData.paymentMode || "Cash",
//             transactionId: childFormData.transactionId,
//             previousDues: parseFloat(childFormData.previousDues) || 0,
//             remark: childFormData.remarks || "",
//           },
//         };
//         // Conditional data based on payment mode
//         if (childFormData.paymentMode === "Cheque") {
//           newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//         } else if (childFormData.paymentMode === "Online") {
//           newFeeData.transactionId = childFormData.transactionId || "";
//         }
//         // API Call inside try-catch
//         try {
//           const response = await axios.post(
//             "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//             newFeeData,
//             {
//               withCredentials: true,
//               headers: {
//                 Authorization: `Bearer ${authToken}`,
//               },
//             }
//           );

//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//           setReload((preReload) => !preReload);
//         } catch (error) {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${
//               error.response?.data?.message || "Server error"
//             }`
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Unhandled Error: ", error);
//       toast.error("An unexpected error occurred. Please try again later.");
//     } finally {
//       setIsOpen(false);
//     }
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: 0, // Initialize value to 0
//       selectedMonths: [], // Initialize selectedMonths as an empty array
//       monthFees: {}, // Initialize monthFees as an empty object
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce(
//       (total, fee) => total + parseFloat(fee.value),
//       0
//     );

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
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     const updatedFormData = [...formData];
//     updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
//       selectedMonths;

//     // Recalculate month fees if necessary
//     const totalAdditionalFee = updatedFormData[
//       index
//     ].additionalFeeValues.reduce((total, fee) => total + fee.value, 0);
//     updatedFormData[index].additionalFee = totalAdditionalFee;

//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, month, value) => {
//     const updatedFormData = [...formData];
//     const feeData = updatedFormData[index].additionalFeeValues.find(
//       (f) => f.fee === fee
//     );

//     if (feeData) {
//       feeData.monthFees[month] = parseFloat(value); // Update the month-specific fee
//       feeData.value = Object.values(feeData.monthFees).reduce(
//         (sum, val) => sum + val,
//         0
//       ); // Update total value based on month-specific fees

//       // Recalculate total additional fee
//       updatedFormData[index].additionalFee = updatedFormData[
//         index
//       ].additionalFeeValues.reduce((total, fee) => total + fee.value, 0);

//       setFormData(updatedFormData);
//     }
//   };

//   return (
//     <div className="md:min-h-screen px-5 pl-10 md:pl-0 md:px-0">
//       <div className="">
//         <input
//           type="text"
//           placeholder="Search by name"
//           value={searchTerm}
//           onChange={handleSearch}
//           className="p-1 border border-gray-300 rounded mb-4 mr-2"
//         />
//         <input
//           type="text"
//           placeholder="Search by Admission No"
//           value={searchTermbyadmissionNo}
//           onChange={handleSearchbyAdmissionNo}
//           className="p-1 border border-gray-300 rounded mb-4"
//         />
//       </div>
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border md:w-1/2 border-gray-300 rounded mb-2">
//           {filteredStudents.map((student, index) => (
//             <h1
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </h1>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   School Fees
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                 <form
//                   onSubmit={handleSubmit}
//                   className="flex flex-wrap md:flex-row flex-col w-full gap-4"
//                 >
//                   {parentData.map((child, index) => (
//                     <div
//                       key={index}
//                       className="bg-white rounded-lg shadow-md p-2 w-full md:w-[48%] lg:w-[32%]"
//                     >
//                       <div className=" w-full flex items-center flex-row gap-2 bg-gray-100 mb-2 p-2">
//                         <div>
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                             className="mr-2 "
//                           />
//                         </div>
//                         <div>
//                           <span className=" text-[16px] font-semibold text-gray-800">
//                             Student : {child.fullName} ,
//                           </span>
//                           <span className="text-[16px] text-gray-600">
//                             {" "}
//                             Class : {child.class}
//                           </span>
//                         </div>
//                       </div>
//                       {showForm[index] && (
//                         <>
//                           <div className="mb-2 bg-gray-100  flex items-center p-2 rounded">
//                             <div className="w-full ">
//                               <div className="flex flex-row bg-gray-100 rounded">
//                                 <input
//                                   type="checkbox"
//                                   checked={
//                                     formData[index]?.includeClassFee || false
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "includeClassFee",
//                                       e.target.checked
//                                     )
//                                   }
//                                   className="mr-2"
//                                 />
//                                 <label
//                                   htmlFor=""
//                                   className="block text-sm font-medium text-red-700"
//                                 >
//                                   Class Fee
//                                 </label>
//                               </div>
//                               {formData[index]?.includeClassFee && (
//                                 <>
//                                   <div>
//                                     <label className="block text-sm font-medium text-gray-700 mt-2">
//                                       Months
//                                     </label>
//                                     <Select
//                                       options={[
//                                         "January",
//                                         "February",
//                                         "March",
//                                         "April",
//                                         "May",
//                                         "June",
//                                         "July",
//                                         "August",
//                                         "September",
//                                         "October",
//                                         "November",
//                                         "December",
//                                       ].map((month) => ({
//                                         value: month,
//                                         label: month,
//                                       }))}
//                                       value={formData[
//                                         index
//                                       ]?.selectedMonths?.map((month) => ({
//                                         value: month,
//                                         label: month,
//                                       }))}
//                                       onChange={(selectedOptions) =>
//                                         handleMonthSelection(
//                                           selectedOptions,
//                                           index
//                                         )
//                                       }
//                                       isMulti
//                                       name="months"
//                                       className="basic-multi-select mt-2"
//                                       classNamePrefix="select"
//                                     />
//                                   </div>
//                                   <div className="w-full flex flex-wrap gap-2  p-2">
//                                     {formData[index]?.selectedMonths?.map(
//                                       (month, monthIndex) => (
//                                         <div
//                                           key={monthIndex}
//                                           className=" bg-gray-200 p-2 rounded"
//                                         >
//                                           <label className="block text-[10px] font-medium text-gray-700">
//                                             {month}' Fee : ₹
//                                           </label>
//                                           <input
//                                             type="number"
//                                             className="w-20 border rounded-sm p-1  text-[10px]"
//                                             value={
//                                               formData[index]?.monthFees?.[
//                                                 month
//                                               ]
//                                             }
//                                             onChange={(e) =>
//                                               handleMonthFeeChange(
//                                                 index,
//                                                 month,
//                                                 e.target.value
//                                               )
//                                             }
//                                           />
//                                         </div>
//                                       )
//                                     )}
//                                   </div>
//                                 </>
//                               )}
//                             </div>
//                           </div>

//                           <div className="mb-2 p-2 bg-gray-100 rounded">
//                             <div className="flex flex-row ">
//                               <input
//                                 type="checkbox"
//                                 checked={
//                                   formData[index]?.includeAdditionalFees ||
//                                   false
//                                 }
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "includeAdditionalFees",
//                                     e.target.checked
//                                   )
//                                 }
//                                 className="mr-2"
//                               />
//                               <label className="block text-sm font-medium text-red-700">
//                                 Additional Fees
//                               </label>
//                             </div>
//                             {formData[index]?.includeAdditionalFees && (
//                               <>
//                                 <label className="block text-[12px] font-medium text-gray-700 mt-2">
//                                   Additional Fees Total Amount: ₹
//                                   {formData[index]?.additionalFee || 0}
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single mt-2"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div
//                                       key={feeIndex}
//                                       className="bg-gray-200 mt-1 w-full flex flex-wrap gap-2 p-2 rounded"
//                                     >
//                                       <div className="w-full">
//                                         <p className="block text-[10px] font-medium text-gray-700">
//                                           {feeData.fee}
//                                         </p>
//                                       </div>
//                                       <div className="w-full">
//                                         <label className="block text-[10px] font-medium text-gray-700">
//                                           Months
//                                         </label>
//                                         <Select
//                                           options={[
//                                             "January",
//                                             "February",
//                                             "March",
//                                             "April",
//                                             "May",
//                                             "June",
//                                             "July",
//                                             "August",
//                                             "September",
//                                             "October",
//                                             "November",
//                                             "December",
//                                           ].map((month) => ({
//                                             value: month,
//                                             label: month,
//                                           }))}
//                                           value={feeData.selectedMonths.map(
//                                             (month) => ({
//                                               value: month,
//                                               label: month,
//                                             })
//                                           )}
//                                           onChange={(selectedOptions) =>
//                                             handleAdditionalFeeMonthSelection(
//                                               index,
//                                               feeIndex,
//                                               selectedOptions
//                                             )
//                                           }
//                                           isMulti
//                                           name="months"
//                                           className="text-[10px] mt-1"
//                                           classNamePrefix="select"
//                                         />
//                                         {/* Display month-wise fee input fields */}
//                                         {feeData.selectedMonths.map(
//                                           (month, monthIndex) => (
//                                             <div
//                                               key={monthIndex}
//                                               className="bg-gray-200 p-2 mt-1 rounded"
//                                             >
//                                               <label className="block text-[10px] font-medium text-gray-700">
//                                                 {month} Fee : ₹
//                                               </label>
//                                               <input
//                                                 type="number"
//                                                 className="w-20 border rounded-sm p-1 text-[10px]"
//                                                 value={feeData.monthFees[month]}
//                                                 onChange={(e) =>
//                                                   handleFeeValueChange(
//                                                     index,
//                                                     feeData.fee,
//                                                     month,
//                                                     e.target.value
//                                                   )
//                                                 }
//                                               />
//                                             </div>
//                                           )
//                                         )}
//                                       </div>
//                                     </div>
//                                   )
//                                 )}
//                               </>
//                             )}
//                           </div>

//                           {/* Fee Status */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
//                             <div className=" p-2 bg-gray-100 rounded">
//                               <label className="block text-[14px] font-medium text-gray-600">
//                                 Fee Status
//                               </label>
//                               <select
//                                 className="w-full border p-1 rounded"
//                                 value={formData[index]?.feeStatus || "Unpaid"}
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "feeStatus",
//                                     e.target.value
//                                   )
//                                 }
//                               >
//                                 <option value="Paid">Paid</option>
//                                 <option value="Unpaid">Unpaid</option>
//                               </select>
//                             </div>

//                             {/* Fee Date */}
//                             <div className="p-2 bg-gray-100 rounded">
//                               <label className="block text-[14px] font-medium text-gray-600">
//                                 Fee Date
//                               </label>
//                               <input
//                                 type="date"
//                                 value={
//                                   formData[index]?.feeDate || getCurrentDate()
//                                 }
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "feeDate",
//                                     e.target.value
//                                   )
//                                 }
//                                 className="w-full border p-1 rounded"
//                               />
//                             </div>
//                             {/* Payment Mode */}
//                             <div className="p-2 bg-gray-100 rounded">
//                               <div className="">
//                                 <label className="block text-[14px] font-medium text-gray-600">
//                                   Payment Mode
//                                 </label>
//                                 <select
//                                   value={
//                                     formData[index]?.paymentMode || "Online"
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "paymentMode",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="w-full border p-1 rounded"
//                                 >
//                                   {" "}
//                                   <option value="Cash">Cash</option>
//                                   <option value="Online">Online</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {/* Conditional Fields based on Payment Mode */}
//                               {formData[index]?.paymentMode === "Online" && (
//                                 <div className="mb-4">
//                                   <label className="block text-[14px] font-medium text-gray-600">
//                                     Transaction ID
//                                   </label>
//                                   <input
//                                     type="text"
//                                     value={formData[index]?.transactionId || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "transactionId",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="w-full border p-1 rounded"
//                                   />
//                                 </div>
//                               )}

//                               {formData[index]?.paymentMode === "Cheque" && (
//                                 <div className="mb-2">
//                                   <label className="block text-[14px] font-medium text-gray-600">
//                                     Cheque Book No
//                                   </label>
//                                   <input
//                                     type="text"
//                                     value={formData[index]?.chequeBookNo || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "chequeBookNo",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="w-full border p-1 rounded"
//                                   />
//                                 </div>
//                               )}
//                             </div>

//                             {/* Previous Dues */}
//                             <div className="p-2 bg-gray-100 rounded">
//                               <label className="block text-[14px] font-medium text-gray-600">
//                                 Previous Dues Paid
//                               </label>
//                               <input
//                                 type="number"
//                                 placeholder="Enter previous dues"
//                                 value={formData[index]?.previousDues || ""}
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "previousDues",
//                                     e.target.value
//                                   )
//                                 }
//                                 className="w-full border p-1 rounded"
//                               />
//                             </div>
//                           </div>

//                           {/* Remarks */}
//                           <div className="p-2">
//                             <label className="block text-[14px] font-medium text-gray-600">
//                               Remarks
//                             </label>
//                             <textarea
//                               type="text"
//                               value={formData[index]?.remarks || ""}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "remarks",
//                                   e.target.value
//                                 )
//                               }
//                               className="w-full border p-1 rounded"
//                             />
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   ))}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="button"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="">
//         <Table reLoad={reLoad} />
//       </div>
//     </div>
//   );
// };

// export default NewCheckFee2;



// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";
// import Table from "./Table";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };
//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeStatus: "Unpaid",
//       feeDate: "",
//       paymentMode: "Cash",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = Cookies.get("token");

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [],
//           //   selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           //   getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };
//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });
//         setAllFees(feesData);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

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
//             additionalFee: updatedFormData[index]?.additionalFee || 0, // Add this line
//           };

//           setFormData(updatedFormData);
//           //   setClassFee(studentFeeAmount);
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
//       updatedShowForm[index] = false; // Hide the form when unchecked
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true; // Show the form when checked
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     // Initialize fee amounts for selected months
//     const updatedFormData = [...formData];
//     selectedMonths.forEach((month) => {
//       if (!updatedFormData[childIndex].monthFees) {
//         updatedFormData[childIndex].monthFees = {};
//       }
//       if (!updatedFormData[childIndex].monthFees[month]) {
//         updatedFormData[childIndex].monthFees[month] =
//           updatedFormData[childIndex].classFee || 0;
//       }
//     });

//     updatedFormData[childIndex].selectedMonths = selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const handleMonthFeeChange = (childIndex, month, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[childIndex].monthFees[month] = value;
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

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//       selectedMonths: [], // Initialize selectedMonths as an empty array
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce(
//       (total, fee) => total + parseFloat(fee.value),
//       0
//     );

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
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     const updatedFormData = [...formData];
//     updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
//       selectedMonths;

//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const toggleModal = () => {
//     setIsOpen(!isOpen);

//     if (isOpen) {
//       setSelectedChildren([]);
//     }
//   };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       for (const childIndex of selectedChildren) {
//         const child = parentData[childIndex];
//         const childFormData = formData[childIndex] || {}; // Ensure formData exists

//         // Basic validation: Check if required fields are filled
//         if (!childFormData.paymentMode) {
//           toast.error(`Payment mode is required for ${child.fullName}`);
//           continue; // Skip to next iteration
//         }

//         // Prepare data
//         const selectedMonthsData =
//           (childFormData.selectedMonths || []).map((month) => ({
//             month: month,
//             paidAmount: childFormData.monthFees?.[month] || 0,
//             status: "Paid",
//           })) || [];

//         const additionalFeesData =
//           (childFormData.additionalFeeValues || []).map((feeData) => ({
//             name: feeData?.fee || "",
//             paidAmount: feeData?.value || 0,
//             month: feeData?.selectedMonths || [],
//             status: "Paid",
//           })) || [];

//         // const newFeeData = {
//         //   admissionNumber: child?.admissionNumber || "",
//         //   className: child?.class || "",
//         //   feeHistory: [
//         //     {
//         //       regularFees: selectedMonthsData,
//         //       additionalFees: additionalFeesData,
//         //     },
//         //   ],
//         //   status: childFormData.feeStatus || "Pending",
//         //   date: childFormData.feeDate || new Date().toISOString(),
//         //   paymentMode: childFormData.paymentMode || "Cash",
//         //   remark: childFormData.remarks || "",
//         //   previousDues: parseFloat(childFormData.previousDues) || 0,
//         // };

//         const newFeeData = {
//           admissionNumber: child?.admissionNumber || "",
//           className: child?.class || "",
//           feeHistory: {
//             regularFees: selectedMonthsData,
//             additionalFees: additionalFeesData,
//             // "regularFees": [
//             //   {
//             //     "month": "January",
//             //     "paidAmount": 1000,
//             //     "status": "Paid"
//             //   },

//             // ],
//             // "additionalFees": [
//             //   {
//             //     "name": "Sports Fee",
//             //     "month": "January",
//             //     "paidAmount": 100,
//             //     "status": "Paid"
//             //   },
//             //   {
//             //     "name": "Lab Fee",
//             //     "month": "February",
//             //     "paidAmount": 800,
//             //     "status": "Unpaid"
//             //   }
//             // ],
//             status: childFormData.feeStatus || "Pending",
//             paymentMode: childFormData.paymentMode || "Cash",
//             transactionId: childFormData.transactionId,
//             previousDues: parseFloat(childFormData.previousDues) || 0,
//             remark: childFormData.remarks || "",
//           },
//         };
//         // Conditional data based on payment mode
//         if (childFormData.paymentMode === "Cheque") {
//           newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//         } else if (childFormData.paymentMode === "Online") {
//           newFeeData.transactionId = childFormData.transactionId || "";
//         }
//         // API Call inside try-catch
//         try {
//           const response = await axios.post(
//             "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//             newFeeData,
//             {
//               withCredentials: true,
//               headers: {
//                 Authorization: `Bearer ${authToken}`,
//               },
//             }
//           );

//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         } catch (error) {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${
//               error.response?.data?.message || "Server error"
//             }`
//           );
//         }
//       }
//     } catch (error) {
//       console.error("Unhandled Error: ", error);
//       toast.error("An unexpected error occurred. Please try again later.");
//     } finally {
//       setIsOpen(false);
//     }
//   };

//   return (
//     <div className="md:min-h-screen">
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-1 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border md:w-1/2 border-gray-300 rounded mb-2">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   School Fees
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                 <form
//                   onSubmit={handleSubmit}
//                   className="flex flex-wrap md:flex-row flex-col w-full gap-4"
//                 >
//                   {parentData.map((child, index) => (
//                     <div
//                       key={index}
//                       className="bg-white rounded-lg shadow-md p-2 w-full md:w-[48%] lg:w-[32%]"
//                     >
//                       <div className=" w-full flex items-center flex-row gap-2 bg-gray-100 mb-2 p-2">
//                         <div>
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                             className="mr-2 "
//                           />
//                         </div>
//                         <div>
//                           <span className=" text-[16px] font-semibold text-gray-800">
//                             Student : {child.fullName} ,
//                           </span>
//                           <span className="text-[16px] text-gray-600">
//                             {" "}
//                             Class : {child.class}
//                           </span>
//                         </div>
//                       </div>
//                       {showForm[index] && (
//                         <>
//                           <div className="mb-2 bg-gray-100  flex items-center p-2 rounded">
//                             <div className="w-full ">
//                               <div className="flex flex-row bg-gray-100 rounded">
//                                 <input
//                                   type="checkbox"
//                                   checked={
//                                     formData[index]?.includeClassFee || false
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "includeClassFee",
//                                       e.target.checked
//                                     )
//                                   }
//                                   className="mr-2"
//                                 />
//                                 <label
//                                   htmlFor=""
//                                   className="block text-sm font-medium text-red-700"
//                                 >
//                                   Class Fee
//                                 </label>
//                               </div>
//                               {formData[index]?.includeClassFee && (
//                                 <>
//                                   <div>
//                                     <label className="block text-sm font-medium text-gray-700 mt-2">
//                                       Months
//                                     </label>
//                                     <Select
//                                       options={[
//                                         "January",
//                                         "February",
//                                         "March",
//                                         "April",
//                                         "May",
//                                         "June",
//                                         "July",
//                                         "August",
//                                         "September",
//                                         "October",
//                                         "November",
//                                         "December",
//                                       ].map((month) => ({
//                                         value: month,
//                                         label: month,
//                                       }))}
//                                       value={formData[
//                                         index
//                                       ]?.selectedMonths?.map((month) => ({
//                                         value: month,
//                                         label: month,
//                                       }))}
//                                       onChange={(selectedOptions) =>
//                                         handleMonthSelection(
//                                           selectedOptions,
//                                           index
//                                         )
//                                       }
//                                       isMulti
//                                       name="months"
//                                       className="basic-multi-select mt-2"
//                                       classNamePrefix="select"
//                                     />
//                                   </div>
//                                   <div className="w-full flex flex-wrap gap-2  p-2">
//                                     {formData[index]?.selectedMonths?.map(
//                                       (month, monthIndex) => (
//                                         <div
//                                           key={monthIndex}
//                                           className=" bg-gray-200 p-2 rounded"
//                                         >
//                                           <label className="block text-[10px] font-medium text-gray-700">
//                                             {month}' Fee : ₹
//                                           </label>
//                                           <input
//                                             type="number"
//                                             className="w-20 border rounded-sm p-1  text-[10px]"
//                                             value={
//                                               formData[index]?.monthFees?.[
//                                                 month
//                                               ] || 0
//                                             }
//                                             onChange={(e) =>
//                                               handleMonthFeeChange(
//                                                 index,
//                                                 month,
//                                                 e.target.value
//                                               )
//                                             }
//                                           />
//                                         </div>
//                                       )
//                                     )}
//                                   </div>
//                                 </>
//                               )}
//                             </div>
//                           </div>

//                           {/* Additional Fees */}
//                           <div className="mb-2 p-2 bg-gray-100 rounded">
//                             <div className="flex flex-row ">
//                               <input
//                                 type="checkbox"
//                                 checked={
//                                   formData[index]?.includeAdditionalFees ||
//                                   false
//                                 }
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "includeAdditionalFees",
//                                     e.target.checked
//                                   )
//                                 }
//                                 className="mr-2"
//                               />
//                               <label className="block text-sm font-medium text-red-700">
//                                 Additional Fees
//                               </label>
//                             </div>
//                             {formData[index]?.includeAdditionalFees && (
//                               <>
//                                 <label className="block text-[12px] font-medium text-gray-700 mt-2">
//                                   Additional Fees total Amount: ₹
//                                   {formData[index]?.additionalFee || 0}
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single mt-2"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div
//                                       key={feeIndex}
//                                       className="bg-gray-200 mt-1 w-full  flex flex-row justify-between p-2"
//                                     >
//                                       <div className="w-full">
//                                         <label className="block text-[10px] font-medium text-gray-700">
//                                           {feeData.fee}
//                                         </label>
//                                         <input
//                                           type="number"
//                                           value={feeData.value}
//                                           onChange={(e) =>
//                                             handleFeeValueChange(
//                                               index,
//                                               feeData.fee,
//                                               e.target.value
//                                             )
//                                           }
//                                           className="px-2 text-[12px] border rounded p-2 mt-1"
//                                         />
//                                       </div>
//                                       <div className=" w-full">
//                                         <label className="block text-[10px] font-medium text-gray-700">
//                                           Months
//                                         </label>
//                                         <Select
//                                           options={[
//                                             "January",
//                                             "February",
//                                             "March",
//                                             "April",
//                                             "May",
//                                             "June",
//                                             "July",
//                                             "August",
//                                             "September",
//                                             "October",
//                                             "November",
//                                             "December",
//                                           ].map((month) => ({
//                                             value: month,
//                                             label: month,
//                                           }))}
//                                           value={feeData.selectedMonths.map(
//                                             (month) => ({
//                                               value: month,
//                                               label: month,
//                                             })
//                                           )}
//                                           onChange={(selectedOptions) =>
//                                             handleAdditionalFeeMonthSelection(
//                                               index,
//                                               feeIndex,
//                                               selectedOptions
//                                             )
//                                           }
//                                           isMulti
//                                           name="months"
//                                           className="text-[10px] mt-1"
//                                           // className="basic-multi-select mt-2 w-20"
//                                           classNamePrefix="select"
//                                         />
//                                       </div>
//                                     </div>
//                                   )
//                                 )}
//                               </>
//                             )}
//                           </div>

//                           {/* Fee Status */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
//                             <div className=" p-2 bg-gray-100 rounded">
//                               <label className="block text-[14px] font-medium text-gray-600">
//                                 Fee Status
//                               </label>
//                               <select
//                                 className="w-full border p-1 rounded"
//                                 value={formData[index]?.feeStatus || "Unpaid"}
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "feeStatus",
//                                     e.target.value
//                                   )
//                                 }
//                               >
//                                 <option value="Paid">Paid</option>
//                                 <option value="Unpaid">Unpaid</option>
//                               </select>
//                             </div>

//                             {/* Fee Date */}
//                             <div className="p-2 bg-gray-100 rounded">
//                               <label className="block text-[14px] font-medium text-gray-600">
//                                 Fee Date
//                               </label>
//                               <input
//                                 type="date"
//                                 value={
//                                   formData[index]?.feeDate || getCurrentDate()
//                                 }
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "feeDate",
//                                     e.target.value
//                                   )
//                                 }
//                                 className="w-full border p-1 rounded"
//                               />
//                             </div>
//                             {/* Payment Mode */}
//                             <div className="p-2 bg-gray-100 rounded">
//                               <div className="">
//                                 <label className="block text-[14px] font-medium text-gray-600">
//                                   Payment Mode
//                                 </label>
//                                 <select
//                                   value={
//                                     formData[index]?.paymentMode || "Online"
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "paymentMode",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="w-full border p-1 rounded"
//                                 >
//                                   {" "}
//                                   <option value="Cash">Cash</option>
//                                   <option value="Online">Online</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {/* Conditional Fields based on Payment Mode */}
//                               {formData[index]?.paymentMode === "Online" && (
//                                 <div className="mb-4">
//                                   <label className="block text-[14px] font-medium text-gray-600">
//                                     Transaction ID
//                                   </label>
//                                   <input
//                                     type="text"
//                                     value={formData[index]?.transactionId || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "transactionId",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="w-full border p-1 rounded"
//                                   />
//                                 </div>
//                               )}

//                               {formData[index]?.paymentMode === "Cheque" && (
//                                 <div className="mb-2">
//                                   <label className="block text-[14px] font-medium text-gray-600">
//                                     Cheque Book No
//                                   </label>
//                                   <input
//                                     type="text"
//                                     value={formData[index]?.chequeBookNo || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "chequeBookNo",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="w-full border p-1 rounded"
//                                   />
//                                 </div>
//                               )}
//                             </div>

//                             {/* Previous Dues */}
//                             <div className="p-2 bg-gray-100 rounded">
//                               <label className="block text-[14px] font-medium text-gray-600">
//                                 Previous Dues
//                               </label>
//                               <input
//                                 type="number"
//                                 placeholder="Enter previous dues"
//                                 value={formData[index]?.previousDues || ""}
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "previousDues",
//                                     e.target.value
//                                   )
//                                 }
//                                 className="w-full border p-1 rounded"
//                               />
//                             </div>
//                           </div>

//                           {/* Remarks */}
//                           <div className="p-2">
//                             <label className="block text-[14px] font-medium text-gray-600">
//                               Remarks
//                             </label>
//                             <textarea
//                               type="text"
//                               value={formData[index]?.remarks || ""}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "remarks",
//                                   e.target.value
//                                 )
//                               }
//                               className="w-full border p-1 rounded"
//                             />
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   ))}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="button"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="">
//         <Table />
//       </div>
//     </div>
//   );
// };

// export default NewCheckFee2;

// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };
//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeStatus: "Unpaid",
//       feeDate: "",
//       paymentMode: "Cash",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = Cookies.get("token");


//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [],
//           //   selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           //   getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };
//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });
//         setAllFees(feesData);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

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
//             additionalFee: updatedFormData[index]?.additionalFee || 0, // Add this line
//           };

//           setFormData(updatedFormData);
//           //   setClassFee(studentFeeAmount);
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
//       updatedShowForm[index] = false; // Hide the form when unchecked
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true; // Show the form when checked
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleMonthSelection = (selectedOptions, childIndex) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     // Initialize fee amounts for selected months
//     const updatedFormData = [...formData];
//     selectedMonths.forEach((month) => {
//       if (!updatedFormData[childIndex].monthFees) {
//         updatedFormData[childIndex].monthFees = {};
//       }
//       if (!updatedFormData[childIndex].monthFees[month]) {
//         updatedFormData[childIndex].monthFees[month] =
//           updatedFormData[childIndex].classFee || 0;
//       }
//     });

//     updatedFormData[childIndex].selectedMonths = selectedMonths;
//     setFormData(updatedFormData);
//   };

//   const handleMonthFeeChange = (childIndex, month, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[childIndex].monthFees[month] = value;
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

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//       selectedMonths: [], // Initialize selectedMonths as an empty array
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce(
//       (total, fee) => total + parseFloat(fee.value),
//       0
//     );

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
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     const updatedFormData = [...formData];
//     updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
//       selectedMonths;

//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const toggleModal = () => {
//     setIsOpen(!isOpen);

//     if (isOpen) {
//       setSelectedChildren([]);
//     }
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     selectedChildren.forEach((childIndex) => {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];

//       const selectedMonthsData =
//         childFormData.selectedMonths?.map((month) => ({
//           month,
//           paidAmount: childFormData.monthFees[month] || 0, // Get fee amount for each selected month
//         })) || [];
//       const newFeeData = {
//         admissionNumber: child.admissionNumber,
//         className: child.class,

//         feeHistory: [
//           {
//             regularFees: selectedMonthsData,
//             additionalFees: childFormData.additionalFeeValues.map(
//               (feeData) => ({
//                 name: feeData.fee,
//                 paidAmount: feeData.value,
//                 months: feeData.selectedMonths, // Make sure 'selectedMonths' is properly populated
//               })
//             ),
//           },
//         ],
//         // classFee: childFormData.includeClassFee ? childFormData.classFee : 0,

//         status: childFormData.feeStatus,
//         date: childFormData.feeDate,
//         paymentMode: childFormData.paymentMode,
//         remark: childFormData.remarks || "",
//         previousDues: parseFloat(childFormData.previousDues) || 0,
//         // totalAmount: "",
//       };
//       console.log("newFeeData", newFeeData);

//       if (childFormData.paymentMode === "Cheque") {
//         newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//       } else if (childFormData.paymentMode === "Online") {
//         newFeeData.transactionId = childFormData.transactionId || "";
//       }

//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//           newFeeData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         })
//         .catch((error) => {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
//           );
//         });
//     });

//     setIsOpen(false);
//   };

//   return (
//     <div className="md:min-h-screen">
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-1 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border md:w-1/2 border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   School Fees
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                 <form
//                   onSubmit={handleSubmit}
//                   className="flex flex-wrap md:flex-row flex-col w-full gap-4"
//                 >
//                   {parentData.map((child, index) => (
//                     <div
//                       key={index}
//                       className="bg-white rounded-lg shadow-md p-2 w-full md:w-[48%] lg:w-[32%]"
//                     >
//                       <div className=" w-full flex items-center flex-row gap-2 bg-gray-100 mb-2 p-2">
//                         <div>
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                             className="mr-2 "
//                           />
//                         </div>
//                         <div>
//                           <span className=" text-[16px] font-semibold text-gray-800">
//                             Student : {child.fullName} ,
//                           </span>
//                           <span className="text-[16px] text-gray-600">
//                             {" "}
//                             Class : {child.class}
//                           </span>
//                         </div>
//                       </div>
//                       {showForm[index] && (
//                         <>
//                           <div className="mb-2 bg-gray-100  flex items-center p-2 rounded">
//                             <div className="w-full ">
//                               <div className="flex flex-row bg-gray-100 rounded">
//                                 <input
//                                   type="checkbox"
//                                   checked={
//                                     formData[index]?.includeClassFee || false
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "includeClassFee",
//                                       e.target.checked
//                                     )
//                                   }
//                                   className="mr-2"
//                                 />
//                                 <label
//                                   htmlFor=""
//                                   className="block text-sm font-medium text-red-700"
//                                 >
//                                   Class Fee
//                                 </label>
//                               </div>
//                               {formData[index]?.includeClassFee && (
//                                 <>
//                                   <div>
//                                     <label className="block text-sm font-medium text-gray-700 mt-2">
//                                       Months
//                                     </label>
//                                     <Select
//                                       options={[
//                                         "January",
//                                         "February",
//                                         "March",
//                                         "April",
//                                         "May",
//                                         "June",
//                                         "July",
//                                         "August",
//                                         "September",
//                                         "October",
//                                         "November",
//                                         "December",
//                                       ].map((month) => ({
//                                         value: month,
//                                         label: month,
//                                       }))}
//                                       value={formData[
//                                         index
//                                       ]?.selectedMonths?.map((month) => ({
//                                         value: month,
//                                         label: month,
//                                       }))}
//                                       onChange={(selectedOptions) =>
//                                         handleMonthSelection(
//                                           selectedOptions,
//                                           index
//                                         )
//                                       }
//                                       isMulti
//                                       name="months"
//                                       className="basic-multi-select mt-2"
//                                       classNamePrefix="select"
//                                     />
//                                   </div>
//                                   <div className="w-full flex flex-wrap gap-2  p-2">
//                                     {formData[index]?.selectedMonths?.map(
//                                       (month, monthIndex) => (
//                                         <div
//                                           key={monthIndex}
//                                           className=" bg-gray-200 p-2 rounded"
//                                         >
//                                           <label className="block text-[10px] font-medium text-gray-700">
//                                             {month}' Fee : ₹
//                                           </label>
//                                           <input
//                                             type="number"
//                                             className="w-20 border rounded-sm p-1  text-[10px]"
//                                             value={
//                                               formData[index]?.monthFees?.[
//                                                 month
//                                               ] || 0
//                                             }
//                                             onChange={(e) =>
//                                               handleMonthFeeChange(
//                                                 index,
//                                                 month,
//                                                 e.target.value
//                                               )
//                                             }
//                                           />
//                                         </div>
//                                       )
//                                     )}
//                                   </div>
//                                 </>
//                               )}
//                             </div>
//                           </div>

//                           {/* Additional Fees */}
//                           <div className="mb-2 p-2 bg-gray-100 rounded">
//                             <div className="flex flex-row ">
//                               <input
//                                 type="checkbox"
//                                 checked={
//                                   formData[index]?.includeAdditionalFees ||
//                                   false
//                                 }
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "includeAdditionalFees",
//                                     e.target.checked
//                                   )
//                                 }
//                                 className="mr-2"
//                               />
//                               <label className="block text-sm font-medium text-red-700">
//                                 Additional Fees
//                               </label>
//                             </div>
//                             {formData[index]?.includeAdditionalFees && (
//                               <>
//                                 <label className="block text-[12px] font-medium text-gray-700 mt-2">
//                                   Additional Fees total Amount: ₹
//                                   {formData[index]?.additionalFee || 0}
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single mt-2"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div
//                                       key={feeIndex}
//                                       className="bg-gray-200 mt-1 w-full  flex flex-row justify-between p-2"
//                                     >
//                                       <div className="w-full">
//                                         <label className="block text-[10px] font-medium text-gray-700">
//                                           {feeData.fee}
//                                         </label>
//                                         <input
//                                           type="number"
//                                           value={feeData.value}
//                                           onChange={(e) =>
//                                             handleFeeValueChange(
//                                               index,
//                                               feeData.fee,
//                                               e.target.value
//                                             )
//                                           }
//                                           className="px-2 text-[12px] border rounded p-2 mt-1"
//                                         />
//                                       </div>
//                                       <div className=" w-full">
//                                         <label className="block text-[10px] font-medium text-gray-700">
//                                           Months
//                                         </label>
//                                         <Select
//                                           options={[
//                                             "January",
//                                             "February",
//                                             "March",
//                                             "April",
//                                             "May",
//                                             "June",
//                                             "July",
//                                             "August",
//                                             "September",
//                                             "October",
//                                             "November",
//                                             "December",
//                                           ].map((month) => ({
//                                             value: month,
//                                             label: month,
//                                           }))}
//                                           value={feeData.selectedMonths.map(
//                                             (month) => ({
//                                               value: month,
//                                               label: month,
//                                             })
//                                           )}
//                                           onChange={(selectedOptions) =>
//                                             handleAdditionalFeeMonthSelection(
//                                               index,
//                                               feeIndex,
//                                               selectedOptions
//                                             )
//                                           }
//                                           isMulti
//                                           name="months"
//                                           className="text-[10px] mt-1"
//                                           // className="basic-multi-select mt-2 w-20"
//                                           classNamePrefix="select"
//                                         />
//                                       </div>
//                                     </div>
//                                   )
//                                 )}
//                               </>
//                             )}
//                           </div>

//                           {/* Fee Status */}
//                           <div className="grid grid-cols-1 md:grid-cols-2 gap-2 ">
//                             <div className=" p-2 bg-gray-100 rounded">
//                               <label className="block text-[14px] font-medium text-gray-600">
//                                 Fee Status
//                               </label>
//                               <select
//                                 className="w-full border p-1 rounded"
//                                 value={formData[index]?.feeStatus || "Unpaid"}
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "feeStatus",
//                                     e.target.value
//                                   )
//                                 }
//                               >
//                                 <option value="Paid">Paid</option>
//                                 <option value="Unpaid">Unpaid</option>
//                               </select>
//                             </div>

//                             {/* Fee Date */}
//                             <div className="p-2 bg-gray-100 rounded">
//                               <label className="block text-[14px] font-medium text-gray-600">
//                                 Fee Date
//                               </label>
//                               <input
//                                 type="date"
//                                 value={
//                                   formData[index]?.feeDate || getCurrentDate()
//                                 }
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "feeDate",
//                                     e.target.value
//                                   )
//                                 }
//                                 className="w-full border p-1 rounded"
//                               />
//                             </div>
//                             {/* Payment Mode */}
//                             <div className="p-2 bg-gray-100 rounded">
//                               <div className="">
//                                 <label className="block text-[14px] font-medium text-gray-600">
//                                   Payment Mode
//                                 </label>
//                                 <select
//                                   value={
//                                     formData[index]?.paymentMode || "Online"
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "paymentMode",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="w-full border p-1 rounded"
//                                 >
//                                   {" "}
//                                   <option value="Cash">Cash</option>
//                                   <option value="Online">Online</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {/* Conditional Fields based on Payment Mode */}
//                               {formData[index]?.paymentMode === "Online" && (
//                                 <div className="mb-4">
//                                   <label className="block text-[14px] font-medium text-gray-600">
//                                     Transaction ID
//                                   </label>
//                                   <input
//                                     type="text"
//                                     value={formData[index]?.transactionId || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "transactionId",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="w-full border p-1 rounded"
//                                   />
//                                 </div>
//                               )}

//                               {formData[index]?.paymentMode === "Cheque" && (
//                                 <div className="mb-2">
//                                   <label className="block text-[14px] font-medium text-gray-600">
//                                     Cheque Book No
//                                   </label>
//                                   <input
//                                     type="text"
//                                     value={formData[index]?.chequeBookNo || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "chequeBookNo",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="w-full border p-1 rounded"
//                                   />
//                                 </div>
//                               )}
//                             </div>

//                             {/* Previous Dues */}
//                             <div className="p-2 bg-gray-100 rounded">
//                               <label className="block text-[14px] font-medium text-gray-600">
//                                 Previous Dues
//                               </label>
//                               <input
//                                 type="number"
//                                 placeholder="Enter previous dues"
//                                 value={formData[index]?.previousDues || ""}
//                                 onChange={(e) =>
//                                   handleInputChange(
//                                     index,
//                                     "previousDues",
//                                     e.target.value
//                                   )
//                                 }
//                                 className="w-full border p-1 rounded"
//                               />
//                             </div>
//                           </div>

//                           {/* Remarks */}
//                           <div className="p-2">
//                             <label className="block text-[14px] font-medium text-gray-600">
//                               Remarks
//                             </label>
//                             <textarea
//                               type="text"
//                               value={formData[index]?.remarks || ""}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "remarks",
//                                   e.target.value
//                                 )
//                               }
//                               className="w-full border p-1 rounded"
//                             />
//                           </div>
//                         </>
//                       )}
//                     </div>
//                   ))}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="button"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee2;






// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeStatus: "Unpaid",
//       feeDate: "",
//       paymentMode: "Online",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = Cookies.get("token");
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [],
//           //   selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           //   getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };
//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });
//         setAllFees(feesData);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

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
//             additionalFee: updatedFormData[index]?.additionalFee || 0, // Add this line
//           };

//           setFormData(updatedFormData);
//           //   setClassFee(studentFeeAmount);
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
//       updatedShowForm[index] = false; // Hide the form when unchecked
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true; // Show the form when checked
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   //   const handleMonthSelection = (selectedOptions, index) => {
//   //     const selectedMonths = selectedOptions.map((option) => option.value);

//   //     const updatedFormData = [...formData];
//   //     const classFee = updatedFormData[index]?.classFee || 0;

//   //     updatedFormData[index] = {
//   //       ...updatedFormData[index],
//   //       selectedMonths,
//   //       totalRegularFee: classFee * selectedMonths.length,
//   //     };

//   //     setFormData(updatedFormData);
//   //   };
//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//       selectedMonths: [], // Initialize selectedMonths as an empty array
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce(
//       (total, fee) => total + parseFloat(fee.value),
//       0
//     );

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
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     const updatedFormData = [...formData];
//     updatedFormData[index].additionalFeeValues[feeIndex].selectedMonths =
//       selectedMonths;

//     setFormData(updatedFormData);
//   };

//   //   const handleAdditionalFeesChange = (index, selectedOptions) => {
//   //     const additionalFeeValues = selectedOptions.map((option) => ({
//   //       fee: option.label,
//   //       value: option.value,
//   //     }));

//   //     const totalAdditionalFee = additionalFeeValues.reduce(
//   //       (total, fee) => total + parseFloat(fee.value),
//   //       0
//   //     );

//   //     const updatedFormData = [...formData];
//   //     updatedFormData[index] = {
//   //       ...updatedFormData[index],
//   //       additionalFee: totalAdditionalFee,
//   //       additionalFeeValues: additionalFeeValues,
//   //     };

//   //     setFormData(updatedFormData);
//   //   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const toggleModal = () => {
//     setIsOpen(!isOpen);

//     if (isOpen) {
//       setSelectedChildren([]);
//     }
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     selectedChildren.forEach((childIndex) => {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];

//       //   if (childFormData.selectedMonths.length === 0) {
//       //     alert(
//       //       `Please select at least one month for regular fees for ${child.fullName}.`
//       //     );
//       //     return;
//       //   }
//       const feeHistoryData = childFormData.selectedMonths.map((month) => ({
//         paidAmount: childFormData.additionalFeeValues
//           ? childFormData.additionalFeeValues.map((feeData) => ({
//               name: feeData.fee,
//               amount: feeData.value,
//               month: month,
//             }))
//           : [],
//       }));

//       const newFeeData = {
//         admissionNumber: child.admissionNumber,
//         className: child.class,
//         classFee: childFormData.includeClassFee ? childFormData.classFee : 0,
//         additionalFee: childFormData.additionalFeeValues.map((feeData) => ({
//             name: feeData.fee,
//             amount: feeData.value,
//             months: feeData.selectedMonths, // Make sure 'selectedMonths' is properly populated
//           })),
//         status: childFormData.feeStatus,
//         date: childFormData.feeDate,
//         paymentMode: childFormData.paymentMode,
//         remark: childFormData.remarks || "",
//         previousDues: parseFloat(childFormData.previousDues) || 0,
//         totalAmount: "",
//       };
//       console.log("newFeeData", newFeeData);

//       if (childFormData.paymentMode === "Cheque") {
//         newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//       } else if (childFormData.paymentMode === "Online") {
//         newFeeData.transactionId = childFormData.transactionId || "";
//       }

//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//           newFeeData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         })
//         .catch((error) => {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
//           );
//         });
//     });

//     setIsOpen(false);
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-2 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   Fees Form
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className=" w-full ">
//                 <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                   {parentData.length > 0 ? (
//                     <form
//                       onSubmit={handleSubmit}
//                       className="flex md:flex-row flex-col w-full"
//                     >
//                       {parentData.map((child, index) => (
//                         <div key={index} className="bg-gray-200 m-3 w-full p-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                           />
//                           <p>
//                             <strong>Student:</strong> {child.fullName}
//                           </p>
//                           <p>
//                             <strong>Class:</strong> {child.class}
//                           </p>
//                           {showForm[index] && (
//                             <>
//                               <div className="md:mb-4">
//                                 <label htmlFor="">Class Fee</label>
//                                 <input
//                                   type="checkbox"
//                                   checked={
//                                     formData[index]?.includeClassFee || false
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "includeClassFee",
//                                       e.target.checked
//                                     )
//                                   }
//                                   className="mr-2"
//                                 />

//                                 {formData[index]?.includeClassFee && (
//                                   <>
//                                     <label className="block">
//                                       Class Fee for{" "}
//                                       {formData[index]?.selectedMonths.length ||
//                                         0}{" "}
//                                       months: ₹
//                                       {formData[index]?.totalRegularFee || 0}
//                                     </label>
//                                     <input
//                                       type="number"
//                                       className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                       value={formData[index]?.classFee}
//                                       onChange={(e) =>
//                                         handleInputChange(
//                                           index,
//                                           "classFee",
//                                           e.target.value
//                                         )
//                                       }
//                                     />
//                                   </>
//                                 )}
//                               </div>

//                               {/* Additional Fees Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`additionalFees-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Include Additional Fees
//                                 </label>
//                                 <input
//                                   type="checkbox"
//                                   checked={
//                                     formData[index]?.includeAdditionalFees ||
//                                     false
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "includeAdditionalFees",
//                                       e.target.checked
//                                     )
//                                   }
//                                   className="mr-2"
//                                 />

//                                 {formData[index]?.includeAdditionalFees && (
//                                   <>
//                                     <label className="block text-sm font-medium text-gray-700">
//                                       Additional Fees total Amount: ₹
//                                       {formData[index]?.additionalFee || 0}
//                                     </label>
//                                     <Select
//                                       isMulti
//                                       options={allFees}
//                                       onChange={(selectedOptions) =>
//                                         handleAdditionalFeesChange(
//                                           index,
//                                           selectedOptions
//                                         )
//                                       }
//                                       className="basic-single"
//                                       classNamePrefix="select"
//                                     />
//                                     {formData[index]?.additionalFeeValues?.map(
//                                       (feeData, feeIndex) => (
//                                         <div key={feeIndex} className="mt-2">
//                                           <label className="block">{`Fee: ${feeData.fee}`}</label>
//                                           <input
//                                             type="number"
//                                             value={feeData.value}
//                                             onChange={(e) =>
//                                               handleFeeValueChange(
//                                                 index,
//                                                 feeData.fee,
//                                                 e.target.value
//                                               )
//                                             }
//                                             className="p-2 border border-gray-300 rounded w-full"
//                                           />

//                                           <Select
//                                             options={[
//                                               "January",
//                                               "February",
//                                               "March",
//                                               "April",
//                                               "May",
//                                               "June",
//                                               "July",
//                                               "August",
//                                               "September",
//                                               "October",
//                                               "November",
//                                               "December",
//                                             ].map((month) => ({
//                                               value: month,
//                                               label: month,
//                                             }))}
//                                             value={feeData.selectedMonths.map(
//                                               (month) => ({
//                                                 value: month,
//                                                 label: month,
//                                               })
//                                             )}
//                                             onChange={(selectedOptions) =>
//                                               handleAdditionalFeeMonthSelection(
//                                                 index,
//                                                 feeIndex,
//                                                 selectedOptions
//                                               )
//                                             }
//                                             isMulti
//                                             name="months"
//                                             className="basic-multi-select"
//                                             classNamePrefix="select"
//                                           />
//                                         </div>
//                                       )
//                                     )}
//                                   </>
//                                 )}
//                               </div>

//                               {/* <div className="mb-4">
//                                 <label
//                                   htmlFor={`additionalFees-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Include Additional Fees
//                                 </label>
//                                 <input
//                                   type="checkbox"
//                                   checked={
//                                     formData[index]?.includeAdditionalFees ||
//                                     false
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "includeAdditionalFees",
//                                       e.target.checked
//                                     )
//                                   }
//                                   className="mr-2"
//                                 />

//                                 {formData[index]?.includeAdditionalFees && (
//                                   <>
//                                     <label className="block text-sm font-medium text-gray-700">
//                                       Additional Fees total Amount: ₹
//                                       {formData[index]?.additionalFee || 0}
//                                     </label>
//                                     <Select
//                                       isMulti
//                                       options={allFees}
//                                       onChange={(selectedOptions) =>
//                                         handleAdditionalFeesChange(
//                                           index,
//                                           selectedOptions
//                                         )
//                                       }
//                                       className="basic-single"
//                                       classNamePrefix="select"
//                                     />
//                                     {formData[index]?.additionalFeeValues?.map(
//                                       (feeData, feeIndex) => (
//                                         <div key={feeIndex} className="mt-2">
//                                           <label className="block">{`Fee: ${feeData.fee}`}</label>
//                                           <input
//                                             type="number"
//                                             value={feeData.value}
//                                             onChange={(e) =>
//                                               handleFeeValueChange(
//                                                 index,
//                                                 feeData.fee,
//                                                 e.target.value
//                                               )
//                                             }
//                                             className="p-2 border border-gray-300 rounded w-full"
//                                           />
                                          
//                                         </div>
//                                       )
//                                     )}
//                                   </>
//                                 )}
//                               </div> */}

//                               {/* Fee Status Field */}
//                               <div className="">
//                                 <label className="block">Fee Status</label>
//                                 <select
//                                   className="w-full border p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                   value={formData[index]?.feeStatus || "Unpaid"}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeStatus",
//                                       e.target.value
//                                     )
//                                   }
//                                 >
//                                   <option
//                                     value="Paid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Paid
//                                   </option>
//                                   <option
//                                     value="Unpaid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Unpaid
//                                   </option>
//                                 </select>
//                               </div>

//                               {/* Fee Date Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`feeDate-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Fee Date
//                                 </label>
//                                 <input
//                                   id={`feeDate-${index}`}
//                                   type="date"
//                                   value={
//                                     formData[index]?.feeDate || getCurrentDate()
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeDate",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="">
//                                 <label className="block">Payment Mode</label>
//                                 <select
//                                   value={
//                                     formData[index]?.paymentMode || "Online"
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "paymentMode",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 >
//                                   <option value="Online">Online</option>
//                                   <option value="Cash">Cash</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {formData[index]?.paymentMode === "Online" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`transactionId-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Transaction ID
//                                   </label>
//                                   <input
//                                     id={`transactionId-${index}`}
//                                     type="text"
//                                     value={formData[index]?.transactionId || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "transactionId",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {formData[index]?.paymentMode === "Cheque" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`chequeBookNo-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Cheque Book No
//                                   </label>
//                                   <input
//                                     id={`chequeBookNo-${index}`}
//                                     type="text"
//                                     value={formData[index]?.chequeBookNo || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "chequeBookNo",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {/* Months Field */}
//                               {/* <div className="mb-4">
//                                 <label className="block text-white">
//                                   Months
//                                 </label>
//                                 <Select
//                                   options={[
//                                     "January",
//                                     "February",
//                                     "March",
//                                     "April",
//                                     "May",
//                                     "June",
//                                     "July",
//                                     "August",
//                                     "September",
//                                     "October",
//                                     "November",
//                                     "December",
//                                   ].map((month) => ({
//                                     value: month,
//                                     label: month,
//                                   }))}
//                                   value={formData[index]?.selectedMonths?.map(
//                                     (month) => ({
//                                       value: month,
//                                       label: month,
//                                     })
//                                   )}
//                                   onChange={(selectedOptions) =>
//                                     handleMonthSelection(selectedOptions, index)
//                                   }
//                                   isMulti
//                                   name="months"
//                                   className="basic-multi-select"
//                                   classNamePrefix="select"
//                                 />
//                               </div> */}

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`previousDues-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Previous Dues
//                                 </label>
//                                 <input
//                                   id={`previousDues-${index}`}
//                                   type="number"
//                                   placeholder="add previousDues in number"
//                                   value={formData[index]?.previousDues || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "previousDues",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`remarks-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Remarks
//                                 </label>
//                                 <input
//                                   id={`remarks-${index}`}
//                                   type="text"
//                                   value={formData[index]?.remarks || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "remarks",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       ))}
//                     </form>
//                   ) : (
//                     <p>No parent or children data available.</p>
//                   )}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="button"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee2;





// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);

//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeStatus: "Unpaid",
//       feeDate: "",
//       paymentMode: "Online",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = Cookies.get("token");
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           //   getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };
//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });
//         setAllFees(feesData);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

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
//             additionalFee: updatedFormData[index]?.additionalFee || 0, // Add this line
//           };

//           setFormData(updatedFormData);
//           //   setClassFee(studentFeeAmount);
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
//       updatedShowForm[index] = false; // Hide the form when unchecked
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true; // Show the form when checked
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleMonthSelection = (selectedOptions, index) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     const updatedFormData = [...formData];
//     const classFee = updatedFormData[index]?.classFee || 0;

//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       selectedMonths,
//       totalRegularFee: classFee * selectedMonths.length,
//     };

//     setFormData(updatedFormData);
//   };

// //   const handleInputChange = (index, field, value) => {
// //     const updatedFormData = [...formData];
// //     updatedFormData[index][field] = value;
// //     setFormData(updatedFormData);
// //   };

// const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       [field]: value,
//     };
//     setFormData(updatedFormData);
//   };
  
//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce(
//       (total, fee) => total + parseFloat(fee.value),
//       0
//     );

//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       additionalFee: totalAdditionalFee,
//       additionalFeeValues: additionalFeeValues,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const toggleModal = () => {
//     setIsOpen(!isOpen);

//     if (isOpen) {
//       setSelectedChildren([]);
//     }
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     selectedChildren.forEach((childIndex) => {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
  
//       if (childFormData.selectedMonths.length === 0) {
//         alert(
//           `Please select at least one month for regular fees for ${child.fullName}.`
//         );
//         return;
//       }
  
//     //   const feeStatus =
//     //     childFormData.amountSubmitted === totalAmount ? "Paid" : "Unpaid";
//       const feeHistoryData = childFormData.selectedMonths.map((month) => ({
//         paidAmount: childFormData.additionalFeeValues
//           ? childFormData.additionalFeeValues.map((feeData) => ({
//               name: feeData.fee,
//               amount: feeData.value,
//             }))
//           : [],
//       }));
  
//       const newFeeData = {
//         admissionNumber: child.admissionNumber,
//         className: child.class,
//         classFee: childFormData.includeClassFee ? childFormData.classFee : 0,
//         additionalFee: feeHistoryData,
//         month: childFormData.selectedMonths.map((month) => month),
//         status: feeStatus,
//         date: childFormData.feeDate,
//         paymentMode: childFormData.paymentMode,
//         remark: childFormData.remarks || "",
//         previousDues: parseFloat(childFormData.previousDues) || 0,
//         totalAmount: "",
//         dues:
//           totalAmount -
//           (childFormData.additionalFeeValues?.reduce(
//             (sum, feeData) => sum + parseFloat(feeData.value || 0),
//             0
//           ) || 0),
//       };
  
//       if (childFormData.paymentMode === "Cheque") {
//         newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//       } else if (childFormData.paymentMode === "Online") {
//         newFeeData.transactionId = childFormData.transactionId || "";
//       }
  
//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//           newFeeData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         })
//         .catch((error) => {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
//           );
//         });
//     });
  
//     setIsOpen(false);
//   };
  
// //   const handleSubmit = (e) => {
// //     e.preventDefault();
// //     selectedChildren.forEach((childIndex) => {
// //       const child = parentData[childIndex];
// //       const childFormData = formData[childIndex];
// //       if (childFormData.selectedMonths.length === 0) {
// //         alert(
// //           `Please select at least one month for regular fees for ${child.fullName}.`
// //         );
// //         return;
// //       }

// //       const feeStatus =
// //         childFormData.amountSubmitted === totalAmount ? "Paid" : "Unpaid";
// //       const feeHistoryData = childFormData.selectedMonths.map((month) => ({
// //         paidAmount: childFormData.additionalFeeValues
// //           ? childFormData.additionalFeeValues.map((feeData) => ({
// //               name: feeData.fee,
// //               amount: feeData.value,
// //             }))
// //           : [],
// //       }));
// //       const newFeeData = {
// //         admissionNumber: child.admissionNumber,
// //         className: child.class,
// //         classFee: childFormData.classFee,
// //         additionalFee: feeHistoryData,
// //         month: childFormData.selectedMonths.map((month) => month),
// //         status: feeStatus,
// //         date: childFormData.feeDate,
// //         paymentMode: childFormData.paymentMode,
// //         remark: childFormData.remarks || "", // Add this line
// //         previousDues: parseFloat(childFormData.previousDues) || 0,
// //         totalAmount: "",
// //         dues:
// //           totalAmount -
// //           (childFormData.additionalFeeValues?.reduce(
// //             (sum, feeData) => sum + parseFloat(feeData.value || 0),
// //             0
// //           ) || 0),
// //       };

// //       if (childFormData.paymentMode === "Cheque") {
// //         newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
// //       } else if (childFormData.paymentMode === "Online") {
// //         newFeeData.transactionId = childFormData.transactionId || "";
// //       }

// //       axios
// //         .post(
// //           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
// //           newFeeData,
// //           {
// //             withCredentials: true,
// //             headers: {
// //               Authorization: `Bearer ${authToken}`,
// //             },
// //           }
// //         )
// //         .then((response) => {
// //           toast.success(
// //             `Fee created for ${child.fullName}: ${response.data.message}`
// //           );
// //         })
// //         .catch((error) => {
// //           console.error("Error Posting Data: ", error);
// //           toast.error(
// //             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
// //           );
// //         });
// //     });

// //     setIsOpen(false);
// //   };
 

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-2 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   Fees Form
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className=" w-full ">
//                 <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                   {parentData.length > 0 ? (
//                     <form
//                       onSubmit={handleSubmit}
//                       className="flex md:flex-row flex-col w-full"
//                     >
//                       {parentData.map((child, index) => (
//                         <div key={index} className="bg-gray-200 m-3 w-full p-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                           />
//                           <p>
//                             <strong>Student:</strong> {child.fullName}
//                           </p>
//                           <p>
//                             <strong>Class:</strong> {child.class}
//                           </p>
//                           {showForm[index] && (
//                             <>
//                               {/* Existing Fields */}
//                               {/* <div className="md:mb-4">
//                                 <label className="block">
//                                   Class Fee for{" "}
//                                   {formData[index]?.selectedMonths.length || 0}{" "}
//                                   months: ₹
//                                   {formData[index]?.totalRegularFee || 0}
//                                 </label>
//                                 <input
//                                   type="number"
//                                   className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                   value={formData[index]?.classFee}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "classFee",
//                                       e.target.value
//                                     )
//                                   }
//                                 />
//                               </div> */}
//                               <div className="md:mb-4">
//   <input
//     type="checkbox"
//     checked={formData[index]?.includeClassFee || false}
//     onChange={(e) =>
//       handleInputChange(index, "includeClassFee", e.target.checked)
//     }
//     className="mr-2"
//   />
//   <label className="block">
//     Class Fee for {formData[index]?.selectedMonths.length || 0} months: ₹
//     {formData[index]?.totalRegularFee || 0}
//   </label>
//   {formData[index]?.includeClassFee && (
//     <input
//       type="number"
//       className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//       value={formData[index]?.classFee}
//       onChange={(e) =>
//         handleInputChange(index, "classFee", e.target.value)
//       }
//     />
//   )}
// </div>


//                               {/* Additional Fees Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`additionalFees-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Additional Fees total Amount: ₹
//                                   {formData[index]?.additionalFee || 0}
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div key={feeIndex} className="mt-2">
//                                       <label className="block">{`Fee: ${feeData.fee}`}</label>
//                                       <input
//                                         type="number"
//                                         value={feeData.value}
//                                         onChange={(e) =>
//                                           handleFeeValueChange(
//                                             index,
//                                             feeData.fee,
//                                             e.target.value
//                                           )
//                                         }
//                                         className="p-2 border border-gray-300 rounded w-full"
//                                       />
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                               {/* <div className="mb-4">
//                                 <label
//                                   htmlFor={`additionalFees-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Additional Fees total Amount:{additionalFee},
//                                   {formData[index]?.additionalFee || 0}
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div key={feeIndex} className="mt-2">
//                                       <label className="block">{`Fee: ${feeData.fee}`}</label>

//                                       <input
//                                         type="number"
//                                         value={feeData.value}
//                                         onChange={(e) =>
//                                           handleFeeValueChange(
//                                             index,
//                                             feeData.fee,
//                                             e.target.value
//                                           )
//                                         }
//                                         className="p-2 border border-gray-300 rounded w-full"
//                                       />
//                                     </div>
//                                   )
//                                 )}
//                               </div> */}

//                               {/* Fee Status Field */}
//                               <div className="">
//                                 <label className="block">Fee Status</label>
//                                 <select
//                                   className="w-full border p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                   value={formData[index]?.feeStatus || "Unpaid"}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeStatus",
//                                       e.target.value
//                                     )
//                                   }
//                                 >
//                                   <option
//                                     value="Paid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Paid
//                                   </option>
//                                   <option
//                                     value="Unpaid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Unpaid
//                                   </option>
//                                 </select>
//                               </div>

//                               {/* Fee Date Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`feeDate-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Fee Date
//                                 </label>
//                                 <input
//                                   id={`feeDate-${index}`}
//                                   type="date"
//                                   value={
//                                     formData[index]?.feeDate || getCurrentDate()
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeDate",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="">
//                                 <label className="block">Payment Mode</label>
//                                 <select
//                                   value={
//                                     formData[index]?.paymentMode || "Online"
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "paymentMode",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 >
//                                   <option value="Online">Online</option>
//                                   <option value="Cash">Cash</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {formData[index]?.paymentMode === "Online" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`transactionId-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Transaction ID
//                                   </label>
//                                   <input
//                                     id={`transactionId-${index}`}
//                                     type="text"
//                                     value={formData[index]?.transactionId || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "transactionId",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {formData[index]?.paymentMode === "Cheque" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`chequeBookNo-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Cheque Book No
//                                   </label>
//                                   <input
//                                     id={`chequeBookNo-${index}`}
//                                     type="text"
//                                     value={formData[index]?.chequeBookNo || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "chequeBookNo",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {/* Months Field */}
//                               <div className="mb-4">
//                                 <label className="block text-white">
//                                   Months
//                                 </label>
//                                 <Select
//                                   options={[
//                                     "January",
//                                     "February",
//                                     "March",
//                                     "April",
//                                     "May",
//                                     "June",
//                                     "July",
//                                     "August",
//                                     "September",
//                                     "October",
//                                     "November",
//                                     "December",
//                                   ].map((month) => ({
//                                     value: month,
//                                     label: month,
//                                   }))}
//                                   value={formData[index]?.selectedMonths?.map(
//                                     (month) => ({
//                                       value: month,
//                                       label: month,
//                                     })
//                                   )}
//                                   onChange={(selectedOptions) =>
//                                     handleMonthSelection(selectedOptions, index)
//                                   }
//                                   isMulti
//                                   name="months"
//                                   className="basic-multi-select"
//                                   classNamePrefix="select"
//                                 />
//                               </div>

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`previousDues-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Previous Dues
//                                 </label>
//                                 <input
//                                   id={`previousDues-${index}`}
//                                   type="number"
//                                   placeholder="add previousDues in number"
//                                   value={formData[index]?.previousDues || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "previousDues",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`remarks-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Remarks
//                                 </label>
//                                 <input
//                                   id={`remarks-${index}`}
//                                   type="text"
//                                   value={formData[index]?.remarks || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "remarks",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       ))}
//                     </form>
//                   ) : (
//                     <p>No parent or children data available.</p>
//                   )}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="button"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee2;



// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);

//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeStatus: "Unpaid",
//       feeDate: "",
//       paymentMode: "Online",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = Cookies.get("token");
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           //   getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };
//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });
//         setAllFees(feesData);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

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
//             additionalFee: updatedFormData[index]?.additionalFee || 0, // Add this line
//           };

//           setFormData(updatedFormData);
//           //   setClassFee(studentFeeAmount);
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
//       updatedShowForm[index] = false; // Hide the form when unchecked
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true; // Show the form when checked
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleMonthSelection = (selectedOptions, index) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     const updatedFormData = [...formData];
//     const classFee = updatedFormData[index]?.classFee || 0;

//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       selectedMonths,
//       totalRegularFee: classFee * selectedMonths.length,
//     };

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

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce(
//       (total, fee) => total + parseFloat(fee.value),
//       0
//     );

//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       additionalFee: totalAdditionalFee,
//       additionalFeeValues: additionalFeeValues,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const toggleModal = () => {
//     setIsOpen(!isOpen);

//     if (isOpen) {
//       setSelectedChildren([]);
//     }
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     selectedChildren.forEach((childIndex) => {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];

//       if (childFormData.selectedMonths.length === 0) {
//         alert(
//           `Please select at least one month for regular fees for ${child.fullName}.`
//         );
//         return;
//       }

//       //   const feeStatus =
//       // childFormData.amountSubmitted === totalAmount ? "Paid" : "Unpaid";

//       const feeHistoryData = childFormData.selectedMonths.map((month) => ({
//         paidAmount: childFormData.additionalFeeValues
//           ? childFormData.additionalFeeValues.map((feeData) => ({
//               name: feeData.fee,
//               amount: feeData.value,
//             }))
//           : [],
//       }));

//       // Construct newFeeData dynamically
//       const newFeeData = {
//         admissionNumber: child.admissionNumber,
//         className: child.class,
//         additionalFee: feeHistoryData,
//         month: childFormData.selectedMonths.map((month) => month),
//         date: childFormData.feeDate,
//         paymentMode: childFormData.paymentMode,
//         remark: childFormData.remarks || "",
//         previousDues: parseFloat(childFormData.previousDues) || 0,
//         totalAmount: "",
//         ...(childFormData.includeClassFee && {
//           classFee: childFormData.classFee,
//         }),
//         // If you need feeStatus, include it here or elsewhere as required
//       };

//       if (childFormData.paymentMode === "Cheque") {
//         newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//       } else if (childFormData.paymentMode === "Online") {
//         newFeeData.transactionId = childFormData.transactionId || "";
//       }

//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//           newFeeData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         })
//         .catch((error) => {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
//           );
//         });
//     });

//     setIsOpen(false);
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-2 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   Fees Form
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className=" w-full ">
//                 <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                   {parentData.length > 0 ? (
//                     <form
//                       onSubmit={handleSubmit}
//                       className="flex md:flex-row flex-col w-full"
//                     >
//                       {parentData.map((child, index) => (
//                         <div key={index} className="bg-gray-200 m-3 w-full p-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                           />
//                           <p>
//                             <strong>Student:</strong> {child.fullName}
//                           </p>
//                           <p>
//                             <strong>Class:</strong> {child.class}
//                           </p>
//                           {showForm[index] && (
//                             <>
//                               <div className="md:mb-4">
//                                 <input
//                                   type="checkbox"
//                                   checked={
//                                     formData[index]?.includeClassFee || false
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "includeClassFee",
//                                       e.target.checked
//                                     )
//                                   }
//                                   className="mr-2"
//                                 />
//                                 <label className="block">
//                                   Class Fee for{" "}
//                                   {formData[index]?.selectedMonths.length || 0}{" "}
//                                   months: ₹
//                                   {formData[index]?.totalRegularFee || 0}
//                                 </label>
//                                 {formData[index]?.includeClassFee && (
//                                   <input
//                                     type="number"
//                                     className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                     value={formData[index]?.classFee}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "classFee",
//                                         e.target.value
//                                       )
//                                     }
//                                   />
//                                 )}
//                               </div>

//                               {/* Additional Fees Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`additionalFees-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Additional Fees total Amount: ₹
//                                   {formData[index]?.additionalFee || 0}
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div key={feeIndex} className="mt-2">
//                                       <label className="block">{`Fee: ${feeData.fee}`}</label>
//                                       <input
//                                         type="number"
//                                         value={feeData.value}
//                                         onChange={(e) =>
//                                           handleFeeValueChange(
//                                             index,
//                                             feeData.fee,
//                                             e.target.value
//                                           )
//                                         }
//                                         className="p-2 border border-gray-300 rounded w-full"
//                                       />
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                               {/* <div className="mb-4">
//                                 <label
//                                   htmlFor={`additionalFees-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Additional Fees total Amount:{additionalFee},
//                                   {formData[index]?.additionalFee || 0}
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div key={feeIndex} className="mt-2">
//                                       <label className="block">{`Fee: ${feeData.fee}`}</label>

//                                       <input
//                                         type="number"
//                                         value={feeData.value}
//                                         onChange={(e) =>
//                                           handleFeeValueChange(
//                                             index,
//                                             feeData.fee,
//                                             e.target.value
//                                           )
//                                         }
//                                         className="p-2 border border-gray-300 rounded w-full"
//                                       />
//                                     </div>
//                                   )
//                                 )}
//                               </div> */}

//                               {/* Fee Status Field */}
//                               <div className="">
//                                 <label className="block">Fee Status</label>
//                                 <select
//                                   className="w-full border p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                   value={formData[index]?.feeStatus || "Unpaid"}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeStatus",
//                                       e.target.value
//                                     )
//                                   }
//                                 >
//                                   <option
//                                     value="Paid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Paid
//                                   </option>
//                                   <option
//                                     value="Unpaid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Unpaid
//                                   </option>
//                                 </select>
//                               </div>

//                               {/* Fee Date Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`feeDate-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Fee Date
//                                 </label>
//                                 <input
//                                   id={`feeDate-${index}`}
//                                   type="date"
//                                   value={
//                                     formData[index]?.feeDate || getCurrentDate()
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeDate",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="">
//                                 <label className="block">Payment Mode</label>
//                                 <select
//                                   value={
//                                     formData[index]?.paymentMode || "Online"
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "paymentMode",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 >
//                                   <option value="Online">Online</option>
//                                   <option value="Cash">Cash</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {formData[index]?.paymentMode === "Online" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`transactionId-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Transaction ID
//                                   </label>
//                                   <input
//                                     id={`transactionId-${index}`}
//                                     type="text"
//                                     value={formData[index]?.transactionId || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "transactionId",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {formData[index]?.paymentMode === "Cheque" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`chequeBookNo-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Cheque Book No
//                                   </label>
//                                   <input
//                                     id={`chequeBookNo-${index}`}
//                                     type="text"
//                                     value={formData[index]?.chequeBookNo || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "chequeBookNo",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {/* Months Field */}
//                               <div className="mb-4">
//                                 <label className="block text-white">
//                                   Months
//                                 </label>
//                                 <Select
//                                   options={[
//                                     "January",
//                                     "February",
//                                     "March",
//                                     "April",
//                                     "May",
//                                     "June",
//                                     "July",
//                                     "August",
//                                     "September",
//                                     "October",
//                                     "November",
//                                     "December",
//                                   ].map((month) => ({
//                                     value: month,
//                                     label: month,
//                                   }))}
//                                   value={formData[index]?.selectedMonths?.map(
//                                     (month) => ({
//                                       value: month,
//                                       label: month,
//                                     })
//                                   )}
//                                   onChange={(selectedOptions) =>
//                                     handleMonthSelection(selectedOptions, index)
//                                   }
//                                   isMulti
//                                   name="months"
//                                   className="basic-multi-select"
//                                   classNamePrefix="select"
//                                 />
//                               </div>

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`previousDues-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Previous Dues
//                                 </label>
//                                 <input
//                                   id={`previousDues-${index}`}
//                                   type="number"
//                                   placeholder="add previousDues in number"
//                                   value={formData[index]?.previousDues || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "previousDues",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`remarks-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Remarks
//                                 </label>
//                                 <input
//                                   id={`remarks-${index}`}
//                                   type="text"
//                                   value={formData[index]?.remarks || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "remarks",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       ))}
//                     </form>
//                   ) : (
//                     <p>No parent or children data available.</p>
//                   )}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="button"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee2;



// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [showForm, setShowForm] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);

//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [parentData, setParentData] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);

//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeStatus: "Unpaid",
//       feeDate: "",
//       paymentMode: "Online",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );

//   const authToken = Cookies.get("token");
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           //   getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };
//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });
//         setAllFees(feesData);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

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
//             additionalFee: updatedFormData[index]?.additionalFee || 0, // Add this line
//           };

//           setFormData(updatedFormData);
//           //   setClassFee(studentFeeAmount);
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
//       updatedShowForm[index] = false; // Hide the form when unchecked
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true; // Show the form when checked
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleMonthSelection = (selectedOptions, index) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     const updatedFormData = [...formData];
//     const classFee = updatedFormData[index]?.classFee || 0;

//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       selectedMonths,
//       totalRegularFee: classFee * selectedMonths.length,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index][field] = value;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const additionalFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: option.value,
//     }));

//     const totalAdditionalFee = additionalFeeValues.reduce(
//       (total, fee) => total + parseFloat(fee.value),
//       0
//     );

//     const updatedFormData = [...formData];
//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       additionalFee: totalAdditionalFee,
//       additionalFeeValues: additionalFeeValues,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const toggleModal = () => {
//     setIsOpen(!isOpen);

//     if (isOpen) {
//       setSelectedChildren([]);
//     }
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     selectedChildren.forEach((childIndex) => {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       if (childFormData.selectedMonths.length === 0) {
//         alert(
//           `Please select at least one month for regular fees for ${child.fullName}.`
//         );
//         return;
//       }

//       const feeStatus =
//         childFormData.amountSubmitted === totalAmount ? "Paid" : "Unpaid";
//       const feeHistoryData = childFormData.selectedMonths.map((month) => ({
//         paidAmount: childFormData.additionalFeeValues
//           ? childFormData.additionalFeeValues.map((feeData) => ({
//               name: feeData.fee,
//               amount: feeData.value,
//             }))
//           : [],
//       }));
//       const newFeeData = {
//         admissionNumber: child.admissionNumber,
//         className: child.class,
//         classFee: childFormData.classFee,
//         additionalFee: feeHistoryData,
//         month: childFormData.selectedMonths.map((month) => month),
//         status: feeStatus,
//         date: childFormData.feeDate,
//         paymentMode: childFormData.paymentMode,
//         remark: childFormData.remarks || "", // Add this line
//         previousDues: parseFloat(childFormData.previousDues) || 0,
//         totalAmount: "",
//         dues:
//           totalAmount -
//           (childFormData.additionalFeeValues?.reduce(
//             (sum, feeData) => sum + parseFloat(feeData.value || 0),
//             0
//           ) || 0),
//       };

//       if (childFormData.paymentMode === "Cheque") {
//         newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//       } else if (childFormData.paymentMode === "Online") {
//         newFeeData.transactionId = childFormData.transactionId || "";
//       }

//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//           newFeeData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         })
//         .catch((error) => {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
//           );
//         });
//     });

//     setIsOpen(false);
//   };
 

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-2 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   Fees Form
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className=" w-full ">
//                 <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                   {parentData.length > 0 ? (
//                     <form
//                       onSubmit={handleSubmit}
//                       className="flex md:flex-row flex-col w-full"
//                     >
//                       {parentData.map((child, index) => (
//                         <div key={index} className="bg-gray-200 m-3 w-full p-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                           />
//                           <p>
//                             <strong>Student:</strong> {child.fullName}
//                           </p>
//                           <p>
//                             <strong>Class:</strong> {child.class}
//                           </p>
//                           {showForm[index] && (
//                             <>
//                               {/* Existing Fields */}
//                               <div className="md:mb-4">
//                                 <label className="block">
//                                   Class Fee for{" "}
//                                   {formData[index]?.selectedMonths.length || 0}{" "}
//                                   months: ₹
//                                   {formData[index]?.totalRegularFee || 0}
//                                 </label>
//                                 <input
//                                   type="number"
//                                   className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                   value={formData[index]?.classFee}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "classFee",
//                                       e.target.value
//                                     )
//                                   }
//                                 />
//                               </div>

//                               {/* Additional Fees Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`additionalFees-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Additional Fees total Amount: ₹
//                                   {formData[index]?.additionalFee || 0}
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div key={feeIndex} className="mt-2">
//                                       <label className="block">{`Fee: ${feeData.fee}`}</label>
//                                       <input
//                                         type="number"
//                                         value={feeData.value}
//                                         onChange={(e) =>
//                                           handleFeeValueChange(
//                                             index,
//                                             feeData.fee,
//                                             e.target.value
//                                           )
//                                         }
//                                         className="p-2 border border-gray-300 rounded w-full"
//                                       />
//                                     </div>
//                                   )
//                                 )}
//                               </div>
//                               {/* <div className="mb-4">
//                                 <label
//                                   htmlFor={`additionalFees-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Additional Fees total Amount:{additionalFee},
//                                   {formData[index]?.additionalFee || 0}
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div key={feeIndex} className="mt-2">
//                                       <label className="block">{`Fee: ${feeData.fee}`}</label>

//                                       <input
//                                         type="number"
//                                         value={feeData.value}
//                                         onChange={(e) =>
//                                           handleFeeValueChange(
//                                             index,
//                                             feeData.fee,
//                                             e.target.value
//                                           )
//                                         }
//                                         className="p-2 border border-gray-300 rounded w-full"
//                                       />
//                                     </div>
//                                   )
//                                 )}
//                               </div> */}

//                               {/* Fee Status Field */}
//                               <div className="">
//                                 <label className="block">Fee Status</label>
//                                 <select
//                                   className="w-full border p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                   value={formData[index]?.feeStatus || "Unpaid"}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeStatus",
//                                       e.target.value
//                                     )
//                                   }
//                                 >
//                                   <option
//                                     value="Paid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Paid
//                                   </option>
//                                   <option
//                                     value="Unpaid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Unpaid
//                                   </option>
//                                 </select>
//                               </div>

//                               {/* Fee Date Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`feeDate-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Fee Date
//                                 </label>
//                                 <input
//                                   id={`feeDate-${index}`}
//                                   type="date"
//                                   value={
//                                     formData[index]?.feeDate || getCurrentDate()
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeDate",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="">
//                                 <label className="block">Payment Mode</label>
//                                 <select
//                                   value={
//                                     formData[index]?.paymentMode || "Online"
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "paymentMode",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 >
//                                   <option value="Online">Online</option>
//                                   <option value="Cash">Cash</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {formData[index]?.paymentMode === "Online" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`transactionId-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Transaction ID
//                                   </label>
//                                   <input
//                                     id={`transactionId-${index}`}
//                                     type="text"
//                                     value={formData[index]?.transactionId || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "transactionId",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {formData[index]?.paymentMode === "Cheque" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`chequeBookNo-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Cheque Book No
//                                   </label>
//                                   <input
//                                     id={`chequeBookNo-${index}`}
//                                     type="text"
//                                     value={formData[index]?.chequeBookNo || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "chequeBookNo",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {/* Months Field */}
//                               <div className="mb-4">
//                                 <label className="block text-white">
//                                   Months
//                                 </label>
//                                 <Select
//                                   options={[
//                                     "January",
//                                     "February",
//                                     "March",
//                                     "April",
//                                     "May",
//                                     "June",
//                                     "July",
//                                     "August",
//                                     "September",
//                                     "October",
//                                     "November",
//                                     "December",
//                                   ].map((month) => ({
//                                     value: month,
//                                     label: month,
//                                   }))}
//                                   value={formData[index]?.selectedMonths?.map(
//                                     (month) => ({
//                                       value: month,
//                                       label: month,
//                                     })
//                                   )}
//                                   onChange={(selectedOptions) =>
//                                     handleMonthSelection(selectedOptions, index)
//                                   }
//                                   isMulti
//                                   name="months"
//                                   className="basic-multi-select"
//                                   classNamePrefix="select"
//                                 />
//                               </div>

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`previousDues-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Previous Dues
//                                 </label>
//                                 <input
//                                   id={`previousDues-${index}`}
//                                   type="number"
//                                   placeholder="add previousDues in number"
//                                   value={formData[index]?.previousDues || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "previousDues",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`remarks-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Remarks
//                                 </label>
//                                 <input
//                                   id={`remarks-${index}`}
//                                   type="text"
//                                   value={formData[index]?.remarks || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "remarks",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       ))}
//                     </form>
//                   ) : (
//                     <p>No parent or children data available.</p>
//                   )}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="button"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee2;





// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [parentData, setParentData] = useState([]);
//   const [formData, setFormData] = useState(
//     parentData.map(() => ({
//       classFee: "",
//       additionalFeeValues: [],
//       feeStatus: "Unpaid",
//       feeDate: "",
//       paymentMode: "Online",
//       selectedMonths: [],
//       previousDues: "",
//       remarks: "",
//       transactionId: "",
//       chequeBookNo: "",
//     }))
//   );
//   const [showForm, setShowForm] = useState([]);
//   const authToken = Cookies.get("token");
//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });
//         setAllFees(feesData);
//       });
//   }, [authToken]);

//   const getTotalFeesAmount = (childFormData) => {
//     const regularFeesAmount =
//       childFormData.getFee * childFormData.selectedMonths.length;
//     const additionalFeesAmount = Array.isArray(
//       childFormData.selectedAdditionalFees
//     )
//       ? childFormData.selectedAdditionalFees.reduce(
//           (total, fee) => total + parseFloat(fee.value),
//           0
//         )
//       : 0;

//     return regularFeesAmount + additionalFeesAmount;
//   };

//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

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
//       updatedShowForm[index] = false; // Hide the form when unchecked
//     } else {
//       updatedSelectedChildren.push(index);
//       updatedShowForm[index] = true; // Show the form when checked
//     }

//     setSelectedChildren(updatedSelectedChildren);
//     setShowForm(updatedShowForm);
//   };

//   const handleMonthSelection = (selectedOptions, index) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     const updatedFormData = [...formData];
//     const classFee = updatedFormData[index]?.classFee || 0;

//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       selectedMonths,
//       totalRegularFee: classFee * selectedMonths.length,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index][field] = value;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedOptions;

//     const updatedFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: "",
//     }));

//     updatedFormData[index].additionalFeeValues = updatedFeeValues;
//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     selectedChildren.forEach((childIndex) => {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       if (childFormData.selectedMonths.length === 0) {
//         alert(
//           `Please select at least one month for regular fees for ${child.fullName}.`
//         );
//         return;
//       }

//       const totalAmount = getTotalFeesAmount(childFormData);
//       const feeStatus =
//         childFormData.amountSubmitted === totalAmount ? "Paid" : "Unpaid";
//       const feeHistoryData = childFormData.selectedMonths.map((month) => ({
//         paidAmount: childFormData.additionalFeeValues
//           ? childFormData.additionalFeeValues.map((feeData) => ({
//               name: feeData.fee,
//               amount: feeData.value,
//             }))
//           : [],
//       }));
//       const newFeeData = {
//         admissionNumber: child.admissionNumber,
//         className: child.class,
//         classFee: childFormData.classFee,
//         additionalFee: feeHistoryData,
//         month: childFormData.selectedMonths.map((month) => month),
//         status: feeStatus,
//         date: childFormData.feeDate,
//         paymentMode: childFormData.paymentMode,
//         remark: childFormData.remarks || "", // Add this line
//         previousDues: parseFloat(childFormData.previousDues) || 0,
//         totalAmount: "",
//         dues:
//           totalAmount -
//           (childFormData.additionalFeeValues?.reduce(
//             (sum, feeData) => sum + parseFloat(feeData.value || 0),
//             0
//           ) || 0),
//       };

//       if (childFormData.paymentMode === "Cheque") {
//         newFeeData.chequeBookNo = childFormData.chequeBookNo || "";
//       } else if (childFormData.paymentMode === "Online") {
//         newFeeData.transactionId = childFormData.transactionId || "";
//       }

//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//           newFeeData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         })
//         .catch((error) => {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
//           );
//         });
//     });

//     setIsOpen(false);
//   };
//   const toggleModal = () => {
//     setIsOpen(!isOpen);

//     if (isOpen) {
//       setSelectedChildren([]);
//     }
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-2 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   Fees Form
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className=" w-full ">
//                 <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                   {parentData.length > 0 ? (
//                     <form
//                       onSubmit={handleSubmit}
//                       className="flex md:flex-row flex-col w-full"
//                     >
//                       {parentData.map((child, index) => (
//                         <div key={index} className="bg-gray-200 m-3 w-full p-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                           />
//                           <p>
//                             <strong>Student:</strong> {child.fullName}
//                           </p>
//                           <p>
//                             <strong>Class:</strong> {child.class}
//                           </p>
//                           {showForm[index] && (
//                             <>
//                               {/* Existing Fields */}
//                               <div className="md:mb-4">
//                                 <label className="block">
//                                   Class Fee for{" "}
//                                   {formData[index]?.selectedMonths.length || 0}{" "}
//                                   months: ₹
//                                   {formData[index]?.totalRegularFee || 0}
//                                 </label>
//                                 <input
//                                   type="number"
//                                   className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                   value={formData[index]?.classFee}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "classFee",
//                                       e.target.value
//                                     )
//                                   }
//                                 />
//                               </div>

//                               {/* Additional Fees Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`additionalFees-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Additional Fees
//                                 </label>
//                                 <Select
//                                   isMulti
//                                   options={allFees}
//                                   onChange={(selectedOptions) =>
//                                     handleAdditionalFeesChange(
//                                       index,
//                                       selectedOptions
//                                     )
//                                   }
//                                   className="basic-single"
//                                   classNamePrefix="select"
//                                 />
//                                 {formData[index]?.additionalFeeValues?.map(
//                                   (feeData, feeIndex) => (
//                                     <div key={feeIndex} className="mt-2">
//                                       <label className="block">{`Fee: ${feeData.fee}`}</label>

//                                       <input
//                                         type="number"
//                                         value={feeData.value}
//                                         onChange={(e) =>
//                                           handleFeeValueChange(
//                                             index,
//                                             feeData.fee,
//                                             e.target.value
//                                           )
//                                         }
//                                         className="p-2 border border-gray-300 rounded w-full"
//                                       />
//                                     </div>
//                                   )
//                                 )}
//                               </div>

//                               {/* Fee Status Field */}
//                               <div className="">
//                                 <label className="block">Fee Status</label>
//                                 <select
//                                   className="w-full border p-2 dark:bg-secondary-dark-bg dark:text-white"
//                                   value={formData[index]?.feeStatus || "Unpaid"}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeStatus",
//                                       e.target.value
//                                     )
//                                   }
//                                 >
//                                   <option
//                                     value="Paid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Paid
//                                   </option>
//                                   <option
//                                     value="Unpaid"
//                                     className="dark:bg-secondary-dark-bg dark:text-white"
//                                   >
//                                     Unpaid
//                                   </option>
//                                 </select>
//                               </div>

//                               {/* Fee Date Field */}
//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`feeDate-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Fee Date
//                                 </label>
//                                 <input
//                                   id={`feeDate-${index}`}
//                                   type="date"
//                                   value={
//                                     formData[index]?.feeDate || getCurrentDate()
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "feeDate",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="">
//                                 <label className="block">Payment Mode</label>
//                                 <select
//                                   value={
//                                     formData[index]?.paymentMode || "Online"
//                                   }
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "paymentMode",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 >
//                                   <option value="Online">Online</option>
//                                   <option value="Cash">Cash</option>
//                                   <option value="Cheque">Cheque</option>
//                                 </select>
//                               </div>

//                               {formData[index]?.paymentMode === "Online" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`transactionId-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Transaction ID
//                                   </label>
//                                   <input
//                                     id={`transactionId-${index}`}
//                                     type="text"
//                                     value={formData[index]?.transactionId || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "transactionId",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {formData[index]?.paymentMode === "Cheque" && (
//                                 <div className="mb-4">
//                                   <label
//                                     htmlFor={`chequeBookNo-${index}`}
//                                     className="block text-sm font-medium text-gray-700"
//                                   >
//                                     Cheque Book No
//                                   </label>
//                                   <input
//                                     id={`chequeBookNo-${index}`}
//                                     type="text"
//                                     value={formData[index]?.chequeBookNo || ""}
//                                     onChange={(e) =>
//                                       handleInputChange(
//                                         index,
//                                         "chequeBookNo",
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )}

//                               {/* Months Field */}
//                               <div className="mb-4">
//                                 <label className="block text-white">
//                                   Months
//                                 </label>
//                                 <Select
//                                   options={[
//                                     "January",
//                                     "February",
//                                     "March",
//                                     "April",
//                                     "May",
//                                     "June",
//                                     "July",
//                                     "August",
//                                     "September",
//                                     "October",
//                                     "November",
//                                     "December",
//                                   ].map((month) => ({
//                                     value: month,
//                                     label: month,
//                                   }))}
//                                   value={formData[index]?.selectedMonths?.map(
//                                     (month) => ({
//                                       value: month,
//                                       label: month,
//                                     })
//                                   )}
//                                   onChange={(selectedOptions) =>
//                                     handleMonthSelection(selectedOptions, index)
//                                   }
//                                   isMulti
//                                   name="months"
//                                   className="basic-multi-select"
//                                   classNamePrefix="select"
//                                 />
//                               </div>

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`previousDues-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Previous Dues
//                                 </label>
//                                 <input
//                                   id={`previousDues-${index}`}
//                                   type="number"
//                                   placeholder="add previousDues in number"
//                                   value={formData[index]?.previousDues || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "previousDues",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>

//                               <div className="mb-4">
//                                 <label
//                                   htmlFor={`remarks-${index}`}
//                                   className="block text-sm font-medium text-gray-700"
//                                 >
//                                   Remarks
//                                 </label>
//                                 <input
//                                   id={`remarks-${index}`}
//                                   type="text"
//                                   value={formData[index]?.remarks || ""}
//                                   onChange={(e) =>
//                                     handleInputChange(
//                                       index,
//                                       "remarks",
//                                       e.target.value
//                                     )
//                                   }
//                                   className="p-2 border border-gray-300 rounded w-full"
//                                 />
//                               </div>
//                             </>
//                           )}
//                         </div>
//                       ))}
//                     </form>
//                   ) : (
//                     <p>No parent or children data available.</p>
//                   )}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="button"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee2;

// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [allStudent, setAllStudent] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [parentData, setParentData] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const authToken = Cookies.get("token");

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });

//         setAllFees(feesData);
//         // setSelectedAdditionalFees(feesData);
//       });
//   }, [authToken]);

//   const getTotalFeesAmount = (childFormData) => {
//     const regularFeesAmount =
//       childFormData.getFee * childFormData.selectedMonths.length;
//     const additionalFeesAmount = Array.isArray(
//       childFormData.selectedAdditionalFees
//     )
//       ? childFormData.selectedAdditionalFees.reduce(
//           (total, fee) => total + parseFloat(fee.value),
//           0
//         )
//       : 0;

//     return regularFeesAmount + additionalFeesAmount;
//   };

//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

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
//     if (updatedSelectedChildren.includes(index)) {
//       updatedSelectedChildren.splice(updatedSelectedChildren.indexOf(index), 1);
//     } else {
//       updatedSelectedChildren.push(index);
//     }
//     setSelectedChildren(updatedSelectedChildren);
//   };

//   const handleMonthSelection = (selectedOptions, index) => {
//     const selectedMonths = selectedOptions.map((option) => option.value);

//     const updatedFormData = [...formData];
//     const classFee = updatedFormData[index]?.classFee || 0;

//     updatedFormData[index] = {
//       ...updatedFormData[index],
//       selectedMonths,
//       totalRegularFee: classFee * selectedMonths.length,
//     };

//     setFormData(updatedFormData);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index][field] = value;
//     setFormData(updatedFormData);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedOptions;

//     const updatedFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: 0,
//     }));

//     updatedFormData[index].additionalFeeValues = updatedFeeValues;
//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) || 0 } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     selectedChildren.forEach((childIndex) => {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       if (childFormData.selectedMonths.length === 0) {
//         alert(
//           `Please select at least one month for regular fees for ${child.fullName}.`
//         );
//         return;
//       }

//       const totalAmount = getTotalFeesAmount(childFormData);

//       const feeStatus =
//         childFormData.amountSubmitted === totalAmount ? "Paid" : "Unpaid";

//       const feeHistoryData = childFormData.selectedMonths.map((month) => ({
//         paidAmount: childFormData.additionalFeeValues
//           ? childFormData.additionalFeeValues.map((feeData) => ({
//               name: feeData.fee,
//               amount: feeData.value,
//             }))
//           : [], // Return an empty array if additionalFeeValues is undefined
//         month: month,
//         status: feeStatus,
//         date: childFormData.feeDate,
//         paymentMode: childFormData.paymentMode,
//       }));
//       const newFeeData = {
//         admissionNumber: child.admissionNumber,
//         className: child.class,
//         regularFee: childFormData.classFee,
//         feeHistory: feeHistoryData,
//         dues:
//           totalAmount -
//           (childFormData.additionalFeeValues?.reduce(
//             (sum, feeData) => sum + parseFloat(feeData.value || 0),
//             0
//           ) || 0),
//       };

//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//           newFeeData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         })
//         .catch((error) => {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
//           );
//         });
//     });

//     setIsOpen(false);
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-2 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   Fees Form
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className=" w-full ">
//                 <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                   {parentData.length > 0 ? (
//                     <form
//                       onSubmit={handleSubmit}
//                       className="flex md:flex-row flex-col w-full"
//                     >
//                       {parentData.map((child, index) => (
//                         <div key={index} className="bg-gray-200 m-3 w-full p-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                           />

//                           <p>
//                             <strong>Student:</strong> {child.fullName}
//                           </p>
//                           <p>
//                             <strong>Class:</strong> {child.class}
//                           </p>

//                           <div></div>
//                           <div className="md:mb-4">
//                             <label className="block ">
//                               Class Fee for{" "}
//                               {formData[index]?.selectedMonths.length || 0}{" "}
//                               months: ₹{formData[index]?.totalRegularFee || 0}
//                             </label>
//                             <input
//                               type="number"
//                               className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                               value={formData[index]?.classFee}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "classFee",
//                                   e.target.value
//                                 )
//                               }
//                             />
//                           </div>

//                           <div className="mb-4">
//                             <label
//                               htmlFor={`additionalFees-${index}`}
//                               className="block text-sm font-medium text-gray-700"
//                             >
//                               AdditionalFees Fees
//                             </label>
//                             <Select
//                               isMulti
//                               options={allFees}
//                               onChange={(selectedOptions) =>
//                                 handleAdditionalFeesChange(
//                                   index,
//                                   selectedOptions
//                                 )
//                               }
//                               className="basic-single"
//                               classNamePrefix="select"
//                             />
//                             {formData[index]?.additionalFeeValues?.map(
//                               (feeData, feeIndex) => (
//                                 <div key={feeIndex} className="mt-2">
//                                   <label className="block">{`Fee: ${feeData.fee}`}</label>

//                                   <input
//                                     type="number"
//                                     value={feeData.value || 0}
//                                     onChange={(e) =>
//                                       handleFeeValueChange(
//                                         index,
//                                         feeData.fee,
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )
//                             )}
//                           </div>

//                           <div className="">
//                             <label className="block">Fee Status</label>
//                             <select
//                               className="w-full border p-2 dark:bg-secondary-dark-bg dark:text-white"
//                               value={formData[index]?.feeStatus || "Unpaid"}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "feeStatus",
//                                   e.target.value
//                                 )
//                               }
//                             >
//                               <option
//                                 value="Paid"
//                                 className="dark:bg-secondary-dark-bg dark:text-white"
//                               >
//                                 Paid
//                               </option>
//                               <option
//                                 value="Unpaid"
//                                 className="dark:bg-secondary-dark-bg dark:text-white"
//                               >
//                                 Unpaid
//                               </option>
//                             </select>
//                           </div>

//                           <div className="mb-4">
//                             <label
//                               htmlFor={`feeDate-${index}`}
//                               className="block text-sm font-medium text-gray-700"
//                             >
//                               Fee Date
//                             </label>
//                             <input
//                               id={`feeDate-${index}`}
//                               type="date"
//                               value={
//                                 formData[index]?.feeDate || getCurrentDate()
//                               }
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "feeDate",
//                                   e.target.value
//                                 )
//                               }
//                               className="p-2 border border-gray-300 rounded w-full"
//                             />
//                           </div>

//                           <div className="">
//                             <label className="block">Payment Mode</label>
//                             <select
//                               value={formData[index]?.paymentMode || "Online"}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "paymentMode",
//                                   e.target.value
//                                 )
//                               }
//                               className="p-2 border border-gray-300 rounded w-full"
//                             >
//                               <option value="Online">Online</option>
//                               <option value="Cash">Cash</option>
//                               <option value="Cheque">Cheque</option>
//                             </select>
//                           </div>

//                           {/* <div className="">
//                             <label className="block">Months</label>
//                             <Select
//                               options={[
//                                 "January",
//                                 "February",
//                                 "March",
//                                 "April",
//                                 "May",
//                                 "June",
//                                 "July",
//                                 "August",
//                                 "September",
//                                 "October",
//                                 "November",
//                                 "December",
//                               ].map((month) => ({
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
//                                 handleInputChange(
//                                   index,
//                                   "selectedMonths",
//                                   selectedOptions.map((option) => option.value)
//                                 )
//                               }
//                               isMulti
//                               name="months"
//                               className="basic-multi-select"
//                               classNamePrefix="select"
//                             />
//                           </div> */}

//                           <div className="mb-4">
//                             <label className="block text-white">Months</label>
//                             <Select
//                               options={[
//                                 "January",
//                                 "February",
//                                 "March",
//                                 "April",
//                                 "May",
//                                 "June",
//                                 "July",
//                                 "August",
//                                 "September",
//                                 "October",
//                                 "November",
//                                 "December",
//                               ].map((month) => ({
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
//                               className="basic-multi-select"
//                               classNamePrefix="select"
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </form>
//                   ) : (
//                     <p>No parent or children data available.</p>
//                   )}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="submit"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee2;





// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [feeAmount, setFeeAmount] = useState();
//   const [allStudent, setAllStudent] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [parentData, setParentData] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const authToken = Cookies.get("token");

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAdditionalFees",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });

//         setAllFees(feesData);
//         setSelectedAdditionalFees(feesData);
//       });
//   }, [authToken]);

//   const getTotalFeesAmount = (childFormData) => {
//     const regularFeesAmount =
//       childFormData.getFee * childFormData.selectedMonths.length;
//     const additionalFeesAmount = Array.isArray(
//       childFormData.selectedAdditionalFees
//     )
//       ? childFormData.selectedAdditionalFees.reduce(
//           (total, fee) => total + parseFloat(fee.value),
//           0
//         )
//       : 0;

//     return regularFeesAmount + additionalFeesAmount;
//   };

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         console.log("Fetched children data:", children); // Debugging line
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           getFee: 0,
//         }));

//         console.log("Initial form data:", initialFormData); // Debugging line
//         setFormData(initialFormData);
//         setIsOpen(true);
//       })
//       .catch((error) => {
//         console.error("Error fetching parent data:", error);
//       });
//   };

//   const handleChildSelection = (index) => {
//     const selectedChild = parentData[index];
//     const studentClass = selectedChild.class;

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getFees`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const data = response.data;

//         if (Array.isArray(data)) {
//           const studentFeeAmount =
//             data
//               .filter((feeType) => feeType.className === studentClass)
//               .map((classData) => classData.amount)[0] || 0;

//           // Update the formData state with the fee amount for the selected child
//           const updatedFormData = [...formData];
//           updatedFormData[index] = {
//             ...updatedFormData[index],
//             classFee: studentFeeAmount,
//           };
//           setFormData(updatedFormData);
//         } else {
//           console.error("Invalid or undefined feeTypeArray");
//         }
//       })
//       .catch((error) => {
//         console.log(error);
//       });

//     // Toggle the selection of the child
//     const updatedSelectedChildren = [...selectedChildren];
//     if (updatedSelectedChildren.includes(index)) {
//       updatedSelectedChildren.splice(updatedSelectedChildren.indexOf(index), 1);
//     } else {
//       updatedSelectedChildren.push(index);
//     }
//     setSelectedChildren(updatedSelectedChildren);
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index][field] = value;
//     setFormData(updatedFormData);
//   };

//   const handleCloseModal = () => {
//     setIsOpen(false);
//     setParentData([]);
//     setFormData([]);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedOptions;

//     const updatedFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: 0,
//     }));

//     updatedFormData[index].additionalFeeValues = updatedFeeValues;
//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) || 0 } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     selectedChildren.forEach((childIndex) => {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       if (childFormData.selectedMonths.length === 0) {
//         alert(
//           `Please select at least one month for regular fees for ${child.fullName}.`
//         );
//         return;
//       }

//       const totalAmount = getTotalFeesAmount(childFormData);
//       setFeeAmount(totalAmount);

//       const feeStatus =
//         childFormData.amountSubmitted === totalAmount ? "Paid" : "Unpaid";

//       const feeHistoryData = childFormData.selectedMonths.map((month) => ({
//         paidAmount: childFormData.additionalFeeValues
//           ? childFormData.additionalFeeValues.map((feeData) => ({
//               name: feeData.fee,
//               amount: feeData.value,
//             }))
//           : [], // Return an empty array if additionalFeeValues is undefined
//         month: month,
//         status: feeStatus,
//         date: childFormData.feeDate,
//         paymentMode: childFormData.paymentMode,
//       }));
//       const newFeeData = {
//         admissionNumber: child.admissionNumber,
//         className: child.class,
//         regularFee: childFormData.classFee,
//         feeHistory: feeHistoryData,
//         dues:
//           totalAmount -
//           (childFormData.additionalFeeValues?.reduce(
//             (sum, feeData) => sum + parseFloat(feeData.value || 0),
//             0
//           ) || 0),
//       };

//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//           newFeeData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         })
//         .catch((error) => {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
//           );
//         });
//     });

//     setIsOpen(false);
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-2 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   Fees Form
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className=" w-full ">
//                 <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//                   {parentData.length > 0 ? (
//                     <form
//                       onSubmit={handleSubmit}
//                       className="flex md:flex-row flex-col w-full"
//                     >
//                       {parentData.map((child, index) => (
//                         <div key={index} className="bg-gray-200 m-3 w-full p-3">
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                           />
//                           <p>
//                             <strong>Student:</strong> {child.fullName}
//                           </p>
//                           <p>
//                             <strong>Class:</strong> {child.class}
//                           </p>

//                           <p>
//                             <strong>total Fee amount:</strong> {feeAmount}
//                           </p>
//                           <div className="md:mb-4">
//                             <label className="block text-white">
//                               Regular Fee: ₹{formData[index]?.classFee || 0}
//                             </label>
//                             <input
//                               type="number"
//                               className="w-full border rounded-lg p-2 dark:bg-secondary-dark-bg dark:text-white"
//                               value={formData[index]?.classFee || 0}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "classFee",
//                                   e.target.value
//                                 )
//                               }
//                             />
//                           </div>

//                           <div className="mb-4">
//                             <label
//                               htmlFor={`additionalFees-${index}`}
//                               className="block text-sm font-medium text-gray-700"
//                             >
//                               AdditionalFees Fees
//                             </label>
//                             <Select
//                               isMulti
//                               options={allFees}
//                               onChange={(selectedOptions) =>
//                                 handleAdditionalFeesChange(
//                                   index,
//                                   selectedOptions
//                                 )
//                               }
//                               className="basic-single"
//                               classNamePrefix="select"
//                             />
//                             {formData[index]?.additionalFeeValues?.map(
//                               (feeData, feeIndex) => (
//                                 <div key={feeIndex} className="mt-2">
//                                   <label className="block">{`Fee: ${feeData.fee}`}</label>

//                                   <input
//                                     type="number"
//                                     value={feeData.value || 0}
//                                     onChange={(e) =>
//                                       handleFeeValueChange(
//                                         index,
//                                         feeData.fee,
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )
//                             )}
//                           </div>

//                           <div className="">
//                             <label className="block">Fee Status</label>
//                             <select
//                               className="w-full border p-2 dark:bg-secondary-dark-bg dark:text-white"
//                               value={formData[index]?.feeStatus || "Unpaid"}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "feeStatus",
//                                   e.target.value
//                                 )
//                               }
//                             >
//                               <option
//                                 value="Paid"
//                                 className="dark:bg-secondary-dark-bg dark:text-white"
//                               >
//                                 Paid
//                               </option>
//                               <option
//                                 value="Unpaid"
//                                 className="dark:bg-secondary-dark-bg dark:text-white"
//                               >
//                                 Unpaid
//                               </option>
//                             </select>
//                           </div>

//                           <div className="mb-4">
//                             <label
//                               htmlFor={`feeDate-${index}`}
//                               className="block text-sm font-medium text-gray-700"
//                             >
//                               Fee Date
//                             </label>
//                             <input
//                               id={`feeDate-${index}`}
//                               type="date"
//                               value={
//                                 formData[index]?.feeDate || getCurrentDate()
//                               }
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "feeDate",
//                                   e.target.value
//                                 )
//                               }
//                               className="p-2 border border-gray-300 rounded w-full"
//                             />
//                           </div>

//                           <div className="">
//                             <label className="block">Payment Mode</label>
//                             <select
//                               value={formData[index]?.paymentMode || "Online"}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "paymentMode",
//                                   e.target.value
//                                 )
//                               }
//                               className="p-2 border border-gray-300 rounded w-full"
//                             >
//                               <option value="Online">Online</option>
//                               <option value="Cash">Cash</option>
//                               <option value="Cheque">Cheque</option>
//                             </select>
//                           </div>

//                           <div className="">
//                             <label className="block">Months</label>
//                             <Select
//                               options={[
//                                 "January",
//                                 "February",
//                                 "March",
//                                 "April",
//                                 "May",
//                                 "June",
//                                 "July",
//                                 "August",
//                                 "September",
//                                 "October",
//                                 "November",
//                                 "December",
//                               ].map((month) => ({
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
//                                 handleInputChange(
//                                   index,
//                                   "selectedMonths",
//                                   selectedOptions.map((option) => option.value)
//                                 )
//                               }
//                               isMulti
//                               name="months"
//                               className="basic-multi-select"
//                               classNamePrefix="select"
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </form>
//                   ) : (
//                     <p>No parent or children data available.</p>
//                   )}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="submit"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee2;






// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const NewCheckFee2 = () => {
//   const [selectedChildren, setSelectedChildren] = useState([]);
//   const [feeAmount, setFeeAmount] = useState();
//   const [allStudent, setAllStudent] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [allFees, setAllFees] = useState([]);
//   const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [parentData, setParentData] = useState([]);
//   const [formData, setFormData] = useState([]);
//   const authToken = Cookies.get("token");

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//   const getCurrentMonth = () => {
//     const today = new Date();
//     const month = today.toLocaleString("default", { month: "long" });
//     return month;
//   };

//   const getCurrentDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };

//   useEffect(() => {
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         setAllStudent(response.data.allStudent);
//       });
//   }, [authToken]);

//   useEffect(() => {
//     axios
//       .get("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllFees", {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         const feesData = response.data.map((fee) => {
//           const label =
//             fee.name && fee.amount
//               ? `${fee.name} (${fee.amount})`
//               : "Unknown Fee";
//           const value = fee.amount ? fee.amount.toString() : "0";

//           return {
//             label,
//             value,
//           };
//         });

//         setAllFees(feesData);
//         setSelectedAdditionalFees(feesData);
//       });
//   }, [authToken]);

//   const handleChildSelection = (childIndex) => {
//     setSelectedChildren((prevSelected) =>
//       prevSelected.includes(childIndex)
//         ? prevSelected.filter((index) => index !== childIndex)
//         : [...prevSelected, childIndex]
//     );
//   };

//   const getTotalFeesAmount = (childFormData) => {
//     const regularFeesAmount =
//       childFormData.getFee * childFormData.selectedMonths.length;
//     const additionalFeesAmount = Array.isArray(
//       childFormData.selectedAdditionalFees
//     )
//       ? childFormData.selectedAdditionalFees.reduce(
//           (total, fee) => total + parseFloat(fee.value),
//           0
//         )
//       : 0;

//     return regularFeesAmount + additionalFeesAmount;
//   };

//   const handleSearch = (event) => {
//     const searchValue = event.target.value.toLowerCase().trim();
//     setSearchTerm(searchValue);
//     if (searchValue === "") {
//       setFilteredStudents([]);
//     } else {
//       const filtered = allStudent.filter(
//         (student) =>
//           student.fullName &&
//           student.fullName.toLowerCase().includes(searchValue)
//       );
//       setFilteredStudents(filtered);
//     }
//   };

//   const handleStudentClick = (admissionNumber) => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getParentWithChildren/${admissionNumber}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         const children = response.data.children;
//         setParentData(children);
//         const initialFormData = children.map((child) => ({
//           admissionNumber: child.admissionNumber,
//           feeAmount: "",
//           selectedMonths: [getCurrentMonth()],
//           feeDate: getCurrentDate(),
//           feeStatus: "Paid",
//           paymentMode: "Online",
//           selectedAdditionalFees: [],
//           amountSubmitted: 0,
//           getFee: 0,
//         }));

//         setFormData(initialFormData);
//         setIsOpen(true);
//       });
//   };

//   const handleInputChange = (index, field, value) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index][field] = value;
//     setFormData(updatedFormData);
//   };

//   const handleCloseModal = () => {
//     setIsOpen(false);
//     setParentData([]);
//     setFormData([]);
//   };

//   const handleAdditionalFeesChange = (index, selectedOptions) => {
//     const updatedFormData = [...formData];
//     updatedFormData[index].selectedAdditionalFees = selectedOptions;

//     const updatedFeeValues = selectedOptions.map((option) => ({
//       fee: option.label,
//       value: 0,
//     }));

//     updatedFormData[index].additionalFeeValues = updatedFeeValues;
//     setFormData(updatedFormData);
//   };

//   const handleFeeValueChange = (index, fee, value) => {
//     const updatedFormData = [...formData];
//     const feeValues = updatedFormData[index].additionalFeeValues.map((item) =>
//       item.fee === fee ? { ...item, value: parseFloat(value) || 0 } : item
//     );
//     updatedFormData[index].additionalFeeValues = feeValues;
//     setFormData(updatedFormData);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     selectedChildren.forEach((childIndex) => {
//       const child = parentData[childIndex];
//       const childFormData = formData[childIndex];
//       if (childFormData.selectedMonths.length === 0) {
//         alert(
//           `Please select at least one month for regular fees for ${child.fullName}.`
//         );
//         return;
//       }

//       const totalAmount = getTotalFeesAmount(childFormData);
//       setFeeAmount(totalAmount);
//       const feeStatus =
//         childFormData.amountSubmitted === totalAmount ? "Paid" : "Unpaid";
//       const feeHistoryData = childFormData.selectedMonths.map((month) => ({
//         paidAmount: childFormData.additionalFeeValues.map((feeData) => ({
//           name: feeData.fee,
//           amount: feeData.value,
//         })),
//         month: month,
//         status: feeStatus,
//         date: childFormData.feeDate,
//         paymentMode: childFormData.paymentMode,
//       }));

//       const newFeeData = {
//         admissionNumber: child.admissionNumber,
//         className: child.class,
//         feeHistory: feeHistoryData,
//         dues:
//           totalAmount -
//           childFormData.additionalFeeValues.map((feeData) => feeData.value),
//       };
//       console.log("newFeeData", newFeeData);
//       axios
//         .post(
//           "https://eserver-i5sm.onrender.com/api/v1/fees/createFeeStatus",
//           newFeeData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success(
//             `Fee created for ${child.fullName}: ${response.data.message}`
//           );
//         })
//         .catch((error) => {
//           console.error("Error Posting Data: ", error);
//           toast.error(
//             `Error creating fee for ${child.fullName}: ${error.response.data.message}`
//           );
//         });
//     });

//     setIsOpen(false);
//   };

//   return (
//     <div>
//       <input
//         type="text"
//         placeholder="Search by name"
//         value={searchTerm}
//         onChange={handleSearch}
//         className="p-2 border border-gray-300 rounded mb-4"
//       />
//       {filteredStudents.length > 0 && (
//         <div className="max-h-60 overflow-y-auto border border-gray-300 rounded">
//           {filteredStudents.map((student, index) => (
//             <div
//               key={index}
//               className="p-2 border-b cursor-pointer hover:bg-gray-100"
//               onClick={() => handleStudentClick(student.parentAdmissionNumber)}
//             >
//               {student.fullName || "No Name"}, {student.class},{" "}
//               {student.fatherName}, {student.admissionNumber}
//             </div>
//           ))}
//         </div>
//       )}
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative p-4 w-full max-h-full" data-aos="fade-down">
//             <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
//               <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
//                 <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
//                   Fees Form
//                 </h3>
//                 <button
//                   onClick={toggleModal}
//                   type="button"
//                   className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                   data-modal-toggle="default-modal"
//                 >
//                   <svg
//                     className="w-3 h-3"
//                     aria-hidden="true"
//                     xmlns="http://www.w3.org/2000/svg"
//                     fill="none"
//                     viewBox="0 0 14 14"
//                   >
//                     <path
//                       stroke="currentColor"
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth="2"
//                       d="M1 1l12 12M13 1L1 13"
//                     />
//                   </svg>
//                   <span className="sr-only">Close modal</span>
//                 </button>
//               </div>
//               <div className=" w-full ">
//                 <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh]  overflow-auto ">
//                   {parentData.length > 0 && formData.length > 0 ? (
//                     <form
//                       onSubmit={handleSubmit}
//                       className=" flex md:flex-row flex-col w-full "
//                     >
//                       {parentData.map((child, index) => (
//                         <div
//                           key={index}
//                           className="bg-gray-200  m-3 w-full p-3"
//                         >
//                           <input
//                             type="checkbox"
//                             checked={selectedChildren.includes(index)}
//                             onChange={() => handleChildSelection(index)}
//                           />
//                           <p>
//                             <strong>Student:</strong> {child.fullName}
//                           </p>
//                           <p>
//                             <strong>Class:</strong> {child.class}
//                           </p>

//                           <p>
//                             <strong>total Fee amount:</strong> {feeAmount}
//                           </p>

//                           <div className="mb-4">
//                             <label
//                               htmlFor={`additionalFees-${index}`}
//                               className="block text-sm font-medium text-gray-700"
//                             >
//                               AdditionalFees Fees
//                             </label>
//                             <Select
//                               isMulti
//                               options={allFees}
//                               onChange={(selectedOptions) =>
//                                 handleAdditionalFeesChange(
//                                   index,
//                                   selectedOptions
//                                 )
//                               }
//                               className="basic-single"
//                               classNamePrefix="select"
//                             />
//                             {formData[index]?.additionalFeeValues?.map(
//                               (feeData, feeIndex) => (
//                                 <div key={feeIndex} className="mt-2">
//                                   <label className="block">{`Fee: ${feeData.fee}`}</label>
//                                   <input
//                                     type="number"
//                                     value={feeData.value || 0}
//                                     onChange={(e) =>
//                                       handleFeeValueChange(
//                                         index,
//                                         feeData.fee,
//                                         e.target.value
//                                       )
//                                     }
//                                     className="p-2 border border-gray-300 rounded w-full"
//                                   />
//                                 </div>
//                               )
//                             )}
//                           </div>
//                           {/* <div className="">
//                             <label className="block ">Fee Status</label>
//                             <select
//                               className="w-full border p-2  dark:bg-secondary-dark-bg  dark:text-white"
//                               value={formData.feeStatus || "Unpaid"}
//                               onChange={(e) =>
//                                 setFormData({
//                                   ...formData,
//                                   feeStatus: e.target.value,
//                                 })
//                               }
//                             >
//                               <option
//                                 value="Paid"
//                                 className=" dark:bg-secondary-dark-bg  dark:text-white"
//                               >
//                                 Paid
//                               </option>
//                               <option
//                                 value="Unpaid"
//                                 className=" dark:bg-secondary-dark-bg  dark:text-white"
//                               >
//                                 Unpaid
//                               </option>
//                             </select>
//                           </div> */}
//                           <div className="mb-4">
//                             <label
//                               htmlFor={`feeDate-${index}`}
//                               className="block text-sm font-medium text-gray-700"
//                             >
//                               Fee Date
//                             </label>
//                             <input
//                               id={`feeDate-${index}`}
//                               type="date"
//                               value={
//                                 formData[index]?.feeDate || getCurrentDate()
//                               }
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "feeDate",
//                                   e.target.value
//                                 )
//                               }
//                               className="p-2 border border-gray-300 rounded w-full"
//                             />
//                           </div>
//                           <div className="">
//                             <label className="block">Payment Mode</label>
//                             <select
//                               value={formData[index]?.paymentMode || "Online"}
//                               onChange={(e) =>
//                                 handleInputChange(
//                                   index,
//                                   "paymentMode",
//                                   e.target.value
//                                 )
//                               }
//                               className="p-2 border border-gray-300 rounded w-full"
//                             >
//                               <option value="Online">Online</option>
//                               <option value="Cash">Cash</option>
//                               <option value="Cheque">Cheque</option>
//                             </select>
//                           </div>

//                           <div className="">
//                             <label className="block">Months</label>
//                             <Select
//                               options={[
//                                 "January",
//                                 "February",
//                                 "March",
//                                 "April",
//                                 "May",
//                                 "June",
//                                 "July",
//                                 "August",
//                                 "September",
//                                 "October",
//                                 "November",
//                                 "December",
//                               ].map((month) => ({
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
//                                 handleInputChange(
//                                   index,
//                                   "selectedMonths",
//                                   selectedOptions.map((option) => option.value)
//                                 )
//                               }
//                               isMulti
//                               name="months"
//                               className="basic-multi-select"
//                               classNamePrefix="select"
//                             />
//                           </div>
//                         </div>
//                       ))}
//                     </form>
//                   ) : (
//                     <p>No parent or children data available.</p>
//                   )}
//                   <div className="w-full gap-5 grid grid-cols-1 md:grid-cols-2 p-4">
//                     <button
//                       type="submit"
//                       onClick={handleSubmit}
//                       className="bg-blue-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Submit
//                     </button>
//                     <button
//                       type="submit"
//                       onClick={toggleModal}
//                       className="bg-gray-500 w-full text-white px-4 py-2 rounded self-end"
//                     >
//                       Cancel
//                     </button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default NewCheckFee2;
