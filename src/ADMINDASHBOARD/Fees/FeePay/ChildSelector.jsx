import React from "react";
import { useFeePayContext } from "./FeePayContext";
import ChildFeeForm from "./ChildFeeForm";
import Button from "../Dynamic/utils/Button";
import { toast } from "react-toastify";

const ChildSelector = () => {
  const {
    showChildForms,
    parentData,
    selectedChildrenIndices,
    setSelectedChildrenIndices,
    showFormFlags,
    setShowFormFlags,
    formData,
    setChildFeeHistory,
    handleUnifiedFeePayment,
  } = useFeePayContext();

  const handleChildSelection = (index) => {
    const currentChildData = formData[index];
    if (!currentChildData || currentChildData.error) {
      toast.warn(`Cannot select ${parentData[index]?.studentName || "this student"}. Fee data may be missing or failed to load.`);
      return;
    }

    const isCurrentlySelected = selectedChildrenIndices.includes(index);
    let updatedSelectedChildren;
    let updatedShowFormFlags = [...showFormFlags];

    if (isCurrentlySelected) {
      updatedSelectedChildren = selectedChildrenIndices.filter((i) => i !== index);
      updatedShowFormFlags[index] = false;
    } else {
      updatedSelectedChildren = [...selectedChildrenIndices, index];
      updatedShowFormFlags[index] = true;
    }

    updatedSelectedChildren.sort((a, b) => a - b);
    setSelectedChildrenIndices(updatedSelectedChildren);
    setShowFormFlags(updatedShowFormFlags);

    if (updatedSelectedChildren.length > 0) {
      setChildFeeHistory(formData[updatedSelectedChildren[0]]?.feeInfo || null);
    } else {
      setChildFeeHistory(null);
    }
  };

  if (!showChildForms || parentData.length === 0) return null;

  return (
    <div className="mt-6 pt-4 border-t border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Selected Student(s) Fee Payment</h2>
        {selectedChildrenIndices.length > 1 && (
          <Button
            name="Pay for Siblings Together"
            onClick={handleUnifiedFeePayment}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          />
        )}
      </div>
      <div className="grid grid-cols-1 gap-6">
        {parentData.map((child, index) => (
          <ChildFeeForm
            key={child._id || index}
            child={child}
            index={index}
            isSelected={selectedChildrenIndices.includes(index)}
            showForm={showFormFlags[index]}
            handleChildSelection={handleChildSelection}
          />
        ))}
      </div>
    </div>
  );
};

export default ChildSelector;