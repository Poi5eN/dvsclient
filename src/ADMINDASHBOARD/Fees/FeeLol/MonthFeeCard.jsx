import React from "react";

const MonthFeeCard = ({ childFeeHistory }) => {
  if (!childFeeHistory?.monthlyStatus?.length) {
    return (
      <div className="text-center text-gray-600 p-4">
        No fee history available for this student.
      </div>
    );
  }

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {allMonths.map((month, index) => {
        const monthData = childFeeHistory.monthlyStatus.find(
          (m) => m.month === month
        );
        if (!monthData) {
          return (
            <div
              key={index}
              className="bg-gray-100 border border-gray-300 rounded-lg p-4 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800">{month}</h3>
              <p className="text-sm text-gray-500 mt-2">No data available</p>
            </div>
          );
        }

        const regularFee = monthData.regularFee || {};
        const additionalFees = monthData.additionalFees || [];

        return (
          <div
            key={index}
            className={`border rounded-lg p-4 shadow-sm ${
              regularFee.status === "Paid"
                ? "bg-green-50 border-green-300"
                : "bg-red-50 border-red-300"
            }`}
          >
            <h3 className="text-lg font-semibold text-gray-800">{month}</h3>
            <div className="mt-2">
              <p className="text-sm font-medium text-gray-700">
                Regular Fee:
                <span
                  className={`ml-2 ${
                    regularFee.status === "Paid"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {regularFee.status === "Paid"
                    ? "Paid"
                    : `Due: ₹${regularFee.due?.toFixed(2) || "0.00"}`}
                </span>
              </p>
              {regularFee.totalAmount > 0 && (
                <p className="text-xs text-gray-600">
                  Amount: ₹{regularFee.totalAmount.toFixed(2)}
                </p>
              )}
            </div>
            {additionalFees.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700">
                  Additional Fees:
                </p>
                {additionalFees.map((fee, feeIndex) => (
                  <div key={feeIndex} className="ml-2 mt-1">
                    <p className="text-sm text-gray-600">
                      {fee.name}:
                      <span
                        className={`ml-2 ${
                          fee.status === "Paid"
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {fee.status === "Paid"
                          ? "Paid"
                          : `Due: ₹${fee.due?.toFixed(2) || "0.00"}`}
                      </span>
                    </p>
                    {fee.totalAmount > 0 && (
                      <p className="text-xs text-gray-500">
                        Amount: ₹{fee.totalAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default MonthFeeCard;