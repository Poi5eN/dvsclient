import React from "react";
import { useFeePayContext } from "./FeePayContext";

const PaymentSummary = ({ index, calculateNetPayableAmount }) => {
  const { formData } = useFeePayContext();
  const currentFormData = formData[index];

  const calculateAutoDistribution = () => {
    const data = currentFormData;
    if (!data || data.error) return { remainingAfterDistribution: 0, remainingDues: 0 };
    const netPayable = calculateNetPayableAmount();
    const totalAmountPaid = parseFloat(data.totalAmount) || 0;
    const remainingDues = Math.max(0, netPayable - totalAmountPaid);
    const remainingAfterDistribution = Math.max(0, totalAmountPaid - netPayable);
    return { remainingAfterDistribution, remainingDues };
  };

  return (
    <div className="flex-shrink-0 lg:w-1/3 border rounded-md p-3 bg-blue-50 lg:ml-4 mt-4 lg:mt-0">
      <h3 className="text-base font-semibold text-blue-900 border-b border-blue-200 pb-2 mb-3">Payment Summary</h3>
      <table className="w-full text-sm">
        <tbody>
          {currentFormData.pastDues > 0 && (
            <tr className="border-b border-blue-100">
              <td className="text-gray-700 py-1.5">Past Dues:</td>
              <td className="font-medium text-purple-700 py-1.5 text-right">₹{currentFormData.pastDues.toFixed(2)}</td>
            </tr>
          )}
          {currentFormData.lateFine > 0 && (
            <tr className="border-b border-blue-100">
              <td className="text-gray-700 py-1.5">Late Fines:</td>
              <td className="font-medium text-orange-700 py-1.5 text-right">₹{currentFormData.lateFine.toFixed(2)}</td>
            </tr>
          )}
          {currentFormData.selectedMonths.length > 0 && (
            <>
              <tr className="border-b border-blue-100 font-medium text-gray-800">
                <td colSpan="2" className="py-1.5">Regular Fees:</td>
              </tr>
              {currentFormData.selectedMonths.map((monthState, i) => (
                <tr key={`reg-sum-${index}-${i}`} className="border-b border-blue-100">
                  <td className="text-gray-600 py-1 pl-3">{monthState.value}:</td>
                  <td className="font-medium text-blue-700 py-1 text-right">₹{(monthState?.due || 0).toFixed(2)}</td>
                </tr>
              ))}
            </>
          )}
          {currentFormData.selectedAdditionalFees.length > 0 && (
            <>
              <tr className="border-b border-blue-100 font-medium text-gray-800">
                <td colSpan="2" className="pt-2 pb-1">Additional Fees:</td>
              </tr>
              {currentFormData.selectedAdditionalFees.map((fee, i) => (
                <tr key={`add-sum-${index}-${i}`} className="border-b border-blue-100">
                  <td className="text-gray-600 py-1 pl-3">
                    {fee.name} {fee.type === "Monthly" ? `(${fee.type}, ${fee.dueMonths?.join(", ") || "Selected Months"})` : ""}
                  </td>
                  <td className="font-medium text-blue-700 py-1 text-right">₹{fee.amount.toFixed(2)}</td>
                </tr>
              ))}
            </>
          )}
          {currentFormData.selectedOneTimeFees.length > 0 && (
            <>
              <tr className="border-b border-blue-100 font-medium text-gray-800">
                <td colSpan="2" className="pt-2 pb-1">One-Time Fees:</td>
              </tr>
              {currentFormData.selectedOneTimeFees.map((fee, i) => (
                <tr key={`one-time-sum-${index}-${i}`} className="border-b border-blue-100">
                  <td className="text-gray-600 py-1 pl-3">{fee.name}:</td>
                  <td className="font-medium text-blue-700 py-1 text-right">₹{(fee?.dueAmount || 0).toFixed(2)}</td>
                </tr>
              ))}
            </>
          )}
          {currentFormData.concession > 0 && (
            <tr className="border-b border-blue-100">
              <td className="text-green-700 py-1.5">Concession:</td>
              <td className="font-medium text-green-700 py-1.5 text-right">- ₹{parseFloat(currentFormData.concession).toFixed(2)}</td>
            </tr>
          )}
        </tbody>
        <tfoot className="border-t-2 border-blue-200 mt-2 pt-2">
          <tr>
            <td className="pt-2 font-semibold text-blue-900 py-1.5">Total Payable Now</td>
            <td className="pt-2 font-bold text-blue-900 py-1.5 text-right">₹{calculateNetPayableAmount().toFixed(2)}</td>
          </tr>
          {parseFloat(currentFormData.totalAmount) > 0 && (() => {
            const distribution = calculateAutoDistribution();
            return (
              <>
                <tr>
                  <td className="text-gray-700 py-1.5">Amount Paying:</td>
                  <td className="font-medium text-black py-1.5 text-right">₹{parseFloat(currentFormData.totalAmount).toFixed(2)}</td>
                </tr>
                <tr>
                  <td className="font-semibold text-red-700 py-1.5">Remaining Dues:</td>
                  <td className="font-bold text-red-700 py-1.5 text-right">₹{distribution.remainingDues.toFixed(2)}</td>
                </tr>
                {distribution.remainingAfterDistribution > 0 && (
                  <tr>
                    <td className="font-semibold text-green-700 py-1 text-xs">(Advance/Excess):</td>
                    <td className="font-semibold text-green-700 py-1 text-right text-xs">₹{distribution.remainingAfterDistribution.toFixed(2)}</td>
                  </tr>
                )}
              </>
            );
          })()}
        </tfoot>
      </table>
    </div>
  );
};

export default PaymentSummary;