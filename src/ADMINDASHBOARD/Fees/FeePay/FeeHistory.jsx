import React from "react";
import { useFeePayContext } from "./FeePayContext";
import MonthFeeCard from "./";

const FeeHistory = () => {
  const { showChildForms, childFeeHistory, selectedChildrenIndices, session } = useFeePayContext();

  if (!showChildForms || !childFeeHistory?.monthlyStatus?.length || selectedChildrenIndices.length === 0) return null;

  return (
    <div className="mt-8 border-t border-gray-300 pt-6">
      <h2 className="text-xl font-semibold text-center text-gray-800 mb-4">
        Fee History for {childFeeHistory?.studentName || "Selected Student"} ({childFeeHistory?.session || session})
      </h2>
      <div className="max-w-4xl mx-auto bg-white p-4 rounded shadow">
        <MonthFeeCard childFeeHistory={childFeeHistory} />
      </div>
    </div>
  );
};

export default FeeHistory;