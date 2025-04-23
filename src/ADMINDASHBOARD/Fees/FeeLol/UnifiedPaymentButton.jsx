import React from "react";
import Button from "../../../Dynamic/utils/Button";

const UnifiedPaymentButton = ({ selectedChildrenIndices, onUnifiedPayment }) => {
  if (selectedChildrenIndices.length <= 1) return null;

  return (
    <Button
      name="Pay for Siblings Together"
      onClick={onUnifiedPayment}
      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
    />
  );
};

export default UnifiedPaymentButton;