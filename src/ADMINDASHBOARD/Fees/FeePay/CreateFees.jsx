import React, { useEffect } from "react";
import { FeePayProvider, useFeePayContext } from "./FeePayContext";
import SearchBar from "./SearchBar";
import StudentList from "./StudentList";
import ChildSelector from "./ChildSelector";
import FeeHistory from "./FeeHistory";
import ReceiptModals from "./ReceiptModals";

const CreateFeesInner = () => {
  const { getAllStudent, triggerRefresh } = useFeePayContext();

  useEffect(() => {
    getAllStudent();
  }, [getAllStudent, triggerRefresh]);

  return (
    <div className="px-4 pb-2 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <SearchBar />
        <StudentList />
        <ChildSelector />
        <FeeHistory />
        <ReceiptModals />
      </div>
    </div>
  );
};

const CreateFees = () => (
  <FeePayProvider>
    <CreateFeesInner />
  </FeePayProvider>
);

export default CreateFees;