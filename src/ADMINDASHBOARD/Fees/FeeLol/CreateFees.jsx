import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ActiveStudents, parentandchildwithID, feescreateFeeStatus, feescreateUnifiedFeeStatus } from "../../../Network/AdminApi";
import FeeSearch from "./FeeSearch";
import StudentList from "./StudentList";
import ChildSelector from "./ChildSelector";
import ReceiptModal from "./ReceiptModal";
import { FeeResponse } from "../../../Dynamic/utils/Message";
import generatePdf from "../../../Dynamic/utils/pdfGenerator";
import { useStateContext } from "../../../contexts/ContextProvider";

const CreateFees = () => {
  const session = JSON.parse(localStorage.getItem("session"));
  const { setIsLoader } = useStateContext();
  const authToken = localStorage.getItem("token");
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showChildForms, setShowChildForms] = useState(false);
  const [parentData, setParentData] = useState([]);
  const [allStudent, setAllStudent] = useState([]);
  const [formData, setFormData] = useState([]);
  const [selectedChildrenIndices, setSelectedChildrenIndices] = useState([]);
  const [showFormFlags, setShowFormFlags] = useState([]);
  const [triggerRefresh, setTriggerRefresh] = useState(false);
  const [childFeeHistory, setChildFeeHistory] = useState(null);
  const [responseData, setResponseData] = useState(null);
  const [unifiedReceiptData, setUnifiedReceiptData] = useState(null);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [pdfModalOpen, setPdfModalOpen] = useState(false);
  const [unifiedReceiptModalOpen, setUnifiedReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState(null);
  const [isPreviewReady, setIsPreviewReady] = useState(false);

  const getAllStudent = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents();
      setAllStudent(response?.students?.data || []);
    } catch (error) {
      console.error("Failed to fetch student list:", error);
      toast.error("Failed to fetch student list.");
      setAllStudent([]);
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader]);

  useEffect(() => {
    getAllStudent();
  }, [getAllStudent, triggerRefresh]);

  const resetState = () => {
    setSelectedChildrenIndices([]);
    setChildFeeHistory(null);
    setShowFormFlags([]);
    setParentData([]);
    setFormData([]);
    setFilteredStudents([]);
    setShowChildForms(false);
    setResponseData(null);
    setIsMessageModalOpen(false);
    setPdfModalOpen(false);
    setUnifiedReceiptModalOpen(false);
    setUnifiedReceiptData(null);
    setReceiptData(null);
    setIsPreviewReady(false);
  };

  const handleStudentClick = async (parentId) => {
    setIsLoader(true);
    resetState();
    try {
      const parentResponse = await parentandchildwithID(parentId);
      if (!parentResponse?.success) {
        toast.error(parentResponse?.message || "Failed to fetch parent/child data.");
        setIsLoader(false);
        return;
      }

      const children = parentResponse?.children || [];
      if (children.length === 0) {
        toast.info("No children found for this parent.");
        setIsLoader(false);
        return;
      }

      setParentData(children);
      setShowChildForms(true);
    } catch (error) {
      console.error("An error occurred during handleStudentClick:", error);
      toast.error("An error occurred while fetching student data.");
    } finally {
      setIsLoader(false);
    }
  };

  const handleUnifiedFeePayment = async () => {
    if (selectedChildrenIndices.length < 2) {
      toast.warn("Please select at least two students for unified payment.");
      return;
    }
  };

  const handleCloseMessageModal = async (sendMsg = false) => {
    let receiptNumber = null;
    let isUnified = false;
    let dataForActions = null;

    if (responseData) {
      receiptNumber = responseData.feeReceiptNumber;
      isUnified = false;
      dataForActions = responseData;
    } else if (unifiedReceiptData) {
      receiptNumber = unifiedReceiptData.unifiedReceiptNumber;
      isUnified = true;
      dataForActions = unifiedReceiptData;
    }

    if (sendMsg && dataForActions) {
      try {
        FeeResponse(dataForActions);
        toast.info(`SMS function called for ${dataForActions?.student?.studentName || dataForActions?.students?.map(s => s.studentName).join(", ") || "student(s)"}`);
      } catch (error) {
        toast.error("Failed to initiate SMS sending.");
      }
    }

    const tempReceiptNumber = receiptNumber;
    const tempIsUnified = isUnified;
    const tempParentId = responseData?.student?.parentId || unifiedReceiptData?.parentId || null;

    resetState();

    if (tempParentId) {
      await handleStudentClick(tempParentId);
    } else {
      setTriggerRefresh((prev) => !prev);
    }

    if (tempReceiptNumber) {
      setReceiptData({ receiptNumber: tempReceiptNumber, isUnified: tempIsUnified });
      if (tempIsUnified) {
        setUnifiedReceiptModalOpen(true);
      } else {
        setPdfModalOpen(true);
      }
    }
  };

  return (
    <div className="px-4 pb-2 min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto">
        <FeeSearch
          allStudents={allStudent}
          setFilteredStudents={setFilteredStudents}
        />
        {filteredStudents.length > 0 && (
          <StudentList
            students={filteredStudents}
            onStudentClick={handleStudentClick}
            setFilteredStudents={setFilteredStudents}
          />
        )}
        {showChildForms && parentData.length > 0 && (
          <ChildSelector
            parentData={parentData}
            formData={formData}
            setFormData={setFormData}
            selectedChildrenIndices={selectedChildrenIndices}
            setSelectedChildrenIndices={setSelectedChildrenIndices}
            showFormFlags={showFormFlags}
            setShowFormFlags={setShowFormFlags}
            setChildFeeHistory={setChildFeeHistory}
            setResponseData={setResponseData}
            setUnifiedReceiptData={setUnifiedReceiptData}
            setIsMessageModalOpen={setIsMessageModalOpen}
            authToken={authToken}
            session={session}
            onUnifiedPayment={handleUnifiedFeePayment}
          />
        )}
        <ReceiptModal
          isMessageModalOpen={isMessageModalOpen}
          setIsMessageModalOpen={setIsMessageModalOpen}
          pdfModalOpen={pdfModalOpen}
          setPdfModalOpen={setPdfModalOpen}
          unifiedReceiptModalOpen={unifiedReceiptModalOpen}
          setUnifiedReceiptModalOpen={setUnifiedReceiptModalOpen}
          receiptData={receiptData}
          setReceiptData={setReceiptData}
          isPreviewReady={isPreviewReady}
          setIsPreviewReady={setIsPreviewReady}
          responseData={responseData}
          unifiedReceiptData={unifiedReceiptData}
          handleCloseMessageModal={handleCloseMessageModal}
          authToken={authToken}
        />
      </div>
    </div>
  );
};

export default CreateFees;