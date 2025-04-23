import React, { useCallback } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import DynamicMultiSelect from "../../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
import Button from "../../../Dynamic/utils/Button";
import PaymentSummary from "./PaymentSummary";
import { feescreateFeeStatus } from "../../../Network/AdminApi";

const FeeForm = ({
  child,
  index,
  formData,
  setFormData,
  isSelected,
  showForm,
  handleChildSelection,
  setResponseData,
  setIsMessageModalOpen,
  authToken,
  session,
  isUnifiedPayment,
}) => {
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

  const handleInputChange = (field, value) => {
    const updatedFormData = [...setFormData];
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
    }
  };

  const handleMonthMultiSelectChange = (name, selectedOptions) => {
    const selectedOptionsData = selectedOptions || [];
    const updatedFormData = [...setFormData];
    if (!updatedFormData[index]) return;

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
          `Please select months in a continuous sequence (e.g., April, May, June).`
        );
        return;
      }
    }

    const newSelectedMonths = selectedOptionsData
      .map((opt) => {
        const originalFee = updatedFormData[index].regularFees.find(
          (fee) => fee.month === opt.code
        );
        return originalFee
          ? {
              value: originalFee.month,
              label: originalFee.label,
              due: originalFee.dueAmount,
            }
          : null;
      })
      .filter(Boolean);

    updatedFormData[index].selectedMonths = newSelectedMonths;

    const newSelectedAdditionalFees = [];
    const structuredMonthlyAddFees =
      updatedFormData[index].feeInfo?.feeStructure?.additionalFees?.filter(
        (fee) => fee.feeType === "Monthly"
      ) || [];

    structuredMonthlyAddFees.forEach((fee) => {
      const availableFeeOption = updatedFormData[index].availableAdditionalFees.find(
        (opt) => opt.name === fee.name && opt.type === "Monthly"
      );
      if (availableFeeOption) {
        const feeDetail = updatedFormData[index].additionalFeeDetails.find(
          (fd) => fd.name === fee.name && fd.type === "Monthly"
        );
        if (!feeDetail) return;
        const dueMonths = newSelectedMonths
          .map((m) => {
            const monthData = feeDetail.months.find((fm) => fm.month === m.value);
            return monthData && monthData.dueAmount > 0 ? monthData.month : null;
          })
          .filter(Boolean);

        if (dueMonths.length > 0) {
          const totalAmount = dueMonths.reduce((sum, month) => {
            const monthData = feeDetail.months.find((fm) => fm.month === month);
            return sum + (monthData?.dueAmount || 0);
          }, 0);

          newSelectedAdditionalFees.push({
            id: availableFeeOption.id,
            name: availableFeeOption.name,
            amount: totalAmount,
            type: availableFeeOption.type,
            dueMonths,
          });
        }
      }
    });

    const existingNonMonthlyFees = updatedFormData[index].selectedAdditionalFees.filter(
      (fee) => fee.type !== "Monthly"
    );

    updatedFormData[index].selectedAdditionalFees = [
      ...newSelectedAdditionalFees,
      ...existingNonMonthlyFees,
    ];

    setFormData(updatedFormData);
  };

  const handleDynamicMultiSelectChange = (field, selectedOptions) => {
    const updatedFormData = [...setFormData];
    if (!updatedFormData[index]) return;

    if (field === "selectedAdditionalFees") {
      const newSelectedAdditionalFees = (selectedOptions || [])
        .map((opt) => {
          const originalFee = updatedFormData[index].availableAdditionalFees.find(
            (fee) => fee.id === opt.code
          );
          return originalFee
            ? {
                id: originalFee.id,
                name: originalFee.name,
                amount: originalFee.value,
                type: originalFee.type,
                dueMonths:
                  originalFee.type === "Monthly"
                    ? updatedFormData[index].selectedMonths.map((m) => m.value)
                    : [],
              }
            : null;
        })
        .filter(Boolean);

      const autoSelectedMonthly = updatedFormData[index].selectedAdditionalFees.filter(
        (fee) =>
          fee.type === "Monthly" &&
          !newSelectedAdditionalFees.some((nf) => nf.id === fee.id)
      );

      updatedFormData[index].selectedAdditionalFees = [
        ...newSelectedAdditionalFees,
        ...autoSelectedMonthly,
      ];
    } else if (field === "selectedOneTimeFees") {
      const newSelectedOneTimeFees = (selectedOptions || [])
        .map((opt) => {
          const originalFee = updatedFormData[index].oneTimeFeeOptions.find(
            (fee) => fee.code === opt.code
          );
          return originalFee
            ? { name: originalFee.name, dueAmount: originalFee.dueAmount }
            : null;
        })
        .filter(Boolean);

      updatedFormData[index].selectedOneTimeFees = newSelectedOneTimeFees;
    }

    setFormData(updatedFormData);
  };

  const calculateNetPayableAmount = useCallback(() => {
    if (!formData || formData.error) return 0;
    let total = 0;
    total += parseFloat(formData.pastDues) || 0;
    total += parseFloat(formData.lateFine) || 0;

    total += formData.selectedMonths.reduce(
      (sum, monthState) => sum + (monthState?.due || 0),
      0
    );

    total += formData.selectedAdditionalFees.reduce((sum, fee) => {
      if (fee.type === "Monthly" && fee.dueMonths?.length > 0) {
        return (
          sum +
          fee.dueMonths.reduce((monthSum, month) => {
            const feeDetail = formData.additionalFeeDetails.find(
              (fd) => fd.name === fee.name && fd.type === "Monthly"
            );
            if (feeDetail) {
              const monthData = feeDetail.months.find((m) => m.month === month);
              return monthSum + (monthData?.dueAmount || 0);
            }
            return monthSum;
          }, 0)
        );
      }
      return sum + (parseFloat(fee?.amount) || 0);
    }, 0);

    total += formData.selectedOneTimeFees.reduce(
      (sum, fee) => sum + (parseFloat(fee?.dueAmount) || 0),
      0
    );

    total -= parseFloat(formData.concession) || 0;
    return Math.max(0, total);
  }, [formData]);

  const validateFormData = () => {
    if (!formData || formData.error) {
      toast.error(`Cannot submit for ${child.studentName} due to missing data.`);
      return false;
    }
    const totalAmount = parseFloat(formData.totalAmount) || 0;
    if (totalAmount <= 0) {
      toast.warn(`Please enter a valid amount (> 0) for ${child.studentName}.`);
      return false;
    }
    if (!formData.paymentMode) {
      toast.error(`Payment mode is required for ${child.studentName}.`);
      return false;
    }
    if (
      (formData.paymentMode === "Online" || formData.paymentMode === "Card") &&
      !formData.transactionId
    ) {
      toast.error(`Transaction ID is required for ${child.studentName}.`);
      return false;
    }
    if (formData.paymentMode === "Cheque" && !formData.chequeBookNo) {
      toast.error(`Cheque Number is required for ${child.studentName}.`);
      return false;
    }
    if (!formData.date || !moment(formData.date, "YYYY-MM-DD", true).isValid()) {
      toast.error(`Please select a valid payment date for ${child.studentName}.`);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!validateFormData()) return;

    const additionalFeesPayload = [];
    formData.selectedAdditionalFees.forEach((fee) => {
      if (fee.type === "Monthly" && fee.dueMonths?.length > 0) {
        fee.dueMonths.forEach((monthName) => {
          const monthStatus = formData.feeInfo?.monthlyStatus?.find(
            (m) => m.month === monthName
          );
          const isFeeDueForThisMonth = monthStatus?.additionalFees?.some(
            (mf) => mf.name === fee.name && mf.status !== "Paid"
          );
          if (isFeeDueForThisMonth) {
            additionalFeesPayload.push({ name: fee.name, month: monthName });
          }
        });
      } else if (fee.type !== "One-Time") {
        additionalFeesPayload.push({ name: fee.name });
      }
    });

    formData.selectedOneTimeFees.forEach((fee) => {
      additionalFeesPayload.push({ name: fee.name });
    });

    const payload = {
      studentId: child.studentId,
      session,
      paymentDetails: {
        regularFees: formData.selectedMonths.map((monthState) => ({
          month: monthState.value,
        })),
        additionalFees: additionalFeesPayload,
        pastDuesPaid: 0,
        lateFinesPaid: 0,
        concession: parseFloat(formData.concession) || 0,
        totalAmount: parseFloat(formData.totalAmount) || 0,
        date: moment(formData.date, "YYYY-MM-DD").format("DD-MM-YYYY"),
        paymentMode: formData.paymentMode,
        transactionId: formData.transactionId || undefined,
        chequeNumber: formData.chequeBookNo || undefined,
        remark: formData.remarks || "",
      },
    };

    try {
      const response = await feescreateFeeStatus(payload);
      if (response?.success) {
        toast.success(`Fees submitted successfully for ${child.studentName}!`);
        setResponseData(response?.data);
        setIsMessageModalOpen(true);
      } else {
        toast.error(`Fee submission failed for ${child.studentName}.`);
      }
    } catch (error) {
      toast.error(`Error during submission for ${child.studentName}: ${error.message}`);
    }
  };

  if (!formData || formData.error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative shadow-md">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">
          Could not load fee data for {child.studentName || "this student"} (Adm: {child.admissionNumber || "N/A"}).
        </span>
      </div>
    );
  }

  const monthOptions = formData.regularFees
    .filter((fee) => fee.dueAmount > 0)
    .map((fee) => ({ name: fee.label, code: fee.month }));
  const selectedMonthValues = formData.selectedMonths.map((monthState) => ({
    name: monthState.label,
    code: monthState.value,
  }));

  const additionalFeeOptions = formData.availableAdditionalFees
    .filter((fee) => fee.type !== "One-Time")
    .map((item) => ({ name: item.label, code: item.id }));
  const selectedAdditionalFeeValues = formData.selectedAdditionalFees
    .filter((fee) => fee.type !== "One-Time")
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

  const oneTimeFeeOptions = formData.oneTimeFeeOptions.map((item) => ({
    name: item.label,
    code: item.code,
  }));
  const selectedOneTimeFeeValues = formData.selectedOneTimeFees.map((fee) => {
    const availableOption = oneTimeFeeOptions.find((opt) => opt.code === fee.name);
    return {
      name: availableOption
        ? availableOption.name
        : `${fee.name} (Due: ₹${fee.dueAmount.toFixed(2)})`,
      code: fee.name,
    };
  });

  return (
    <div
      className={`bg-white rounded-lg shadow-md border transition-all duration-300 ${
        isSelected ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200 hover:border-gray-300"
      } overflow-hidden`}
    >
      <div
        className={`flex items-center px-4 py-3 border-b ${
          isSelected ? "bg-blue-50" : "bg-gray-50"
        } cursor-pointer`}
        onClick={() => handleChildSelection(index)}
      >
        <input
          type="checkbox"
          id={`child-checkbox-${index}`}
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            handleChildSelection(index);
          }}
          className="mr-3 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
        <label className="flex-grow cursor-pointer">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-base font-semibold text-blue-800">
                {child.studentName}
              </span>
              <span className="text-sm text-gray-600 ml-2">
                (Class: {child.class} / Adm#: {child.admissionNumber})
              </span>
            </div>
            <span
              className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                isSelected ? "bg-blue-200 text-blue-800" : "bg-gray-200 text-gray-700"
              }`}
            >
              {isSelected ? "SELECTED" : "SELECT"}
            </span>
          </div>
          <div className="flex flex-wrap justify-start items-center gap-x-4 text-xs mt-1">
            <span className="text-red-600 font-medium">
              Total Dues: ₹{formData?.totalDues?.toFixed(2) || "0.00"}
            </span>
            {formData?.pastDues > 0 && (
              <span className="text-purple-600 font-medium">
                Past Dues: ₹{formData?.pastDues?.toFixed(2)}
              </span>
            )}
            {formData?.lateFine > 0 && (
              <span className="text-orange-600 font-medium">
                Late Fine: ₹{formData?.lateFine?.toFixed(2)}
              </span>
            )}
            <span className="text-gray-600 font-medium">
              Base Monthly Fee: ₹{formData?.classFee?.toFixed(2) || "0.00"}
            </span>
          </div>
        </label>
      </div>
      <div
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showForm ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        {showForm && (
          <div className="px-4 py-4 border-t flex flex-col lg:flex-row gap-6 bg-white">
            <form
              onSubmit={handleSubmit}
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
                    handleChange={handleMonthMultiSelectChange}
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
                    Additional Fees
                  </label>
                  <DynamicMultiSelect
                    name={`additionalFees-${index}`}
                    searchable={true}
                    placeholderName="Select additional fee(s)..."
                    dynamicOptions={additionalFeeOptions}
                    handleChange={(name, opts) =>
                      handleDynamicMultiSelectChange("selectedAdditionalFees", opts)
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
                      handleDynamicMultiSelectChange("selectedOneTimeFees", opts)
                    }
                    value={selectedOneTimeFeeValues}
                    requiredClassName={"required-fields"}
                    containerClassName="w-full"
                    menuClassName="w-full min-w-[200px] whitespace-normal"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Select fees currently due.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ReactInput
                  type="number"
                  label="Concession (-)"
                  value={formData.concession}
                  onChange={(e) => handleInputChange("concession", e.target.value)}
                  min="0"
                  step="0.01"
                  containerClassName="sm:col-span-1"
                  className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                <ReactInput
                  type="number"
                  label={`Total Amount to Pay (*) ${isUnifiedPayment ? `(for ${child.studentName})` : ""}`}
                  value={formData.totalAmount}
                  onChange={(e) => handleInputChange("totalAmount", e.target.value)}
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
                    value={formData.paymentMode}
                    onChange={(e) => handleInputChange("paymentMode", e.target.value)}
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
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                  isRequired={true}
                  max={moment().format("YYYY-MM-DD")}
                  className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                />
                {(formData.paymentMode === "Online" || formData.paymentMode === "Card") && (
                  <ReactInput
                    type="text"
                    label="Transaction ID (*)"
                    value={formData.transactionId}
                    onChange={(e) => handleInputChange("transactionId", e.target.value)}
                    isRequired={true}
                    className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
                  />
                )}
                {formData.paymentMode === "Cheque" && (
                  <ReactInput
                    type="text"
                    label="Cheque Number (*)"
                    value={formData.chequeBookNo}
                    onChange={(e) => handleInputChange("chequeBookNo", e.target.value)}
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
                  value={formData.remarks}
                  onChange={(e) => handleInputChange("remarks", e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  rows="2"
                  placeholder="Optional remarks about payment..."
                />
              </div>
              {!isUnifiedPayment && (
                <div className="flex justify-end pt-4 mt-4 border-t">
                  <Button
                    type="submit"
                    name={`Submit Payment for ${child.studentName}`}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  />
                </div>
              )}
            </form>
            <PaymentSummary
              formData={formData}
              calculateNetPayableAmount={calculateNetPayableAmount}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FeeForm;