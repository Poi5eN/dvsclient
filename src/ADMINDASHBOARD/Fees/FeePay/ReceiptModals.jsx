import React from "react";
import { useFeePayContext } from "./FeePayContext";
import Modal from "../../../Dynamic/Modal";
import Button from "../../../Dynamic/utils/Button";
import FeeRecipt from "../../Fees/FeeRecipt";
import { FeeResponse } from "../../../Dynamic/utils/Message";
import generatePdf from "../../../Dynamic/utils/pdfGenerator";
import { toast } from "react-toastify";
import axios from "axios";

const ReceiptModals = () => {
  const {
    isMessageModalOpen,
    setIsMessageModalOpen,
    responseData,
    unifiedReceiptData,
    pdfModalOpen,
    setPdfModalOpen,
    unifiedReceiptModalOpen,
    setUnifiedReceiptModalOpen,
    receiptData,
    setReceiptData,
    isPreviewReady,
    setIsPreviewReady,
    setIsLoader,
    authToken,
    resetState,
    handleStudentClick,
    setTriggerRefresh,
  } = useFeePayContext();

  const fetchReceiptData = async (receiptNumber, isUnified = false) => {
    setIsPreviewReady(false);
    setIsLoader(true);
    try {
      const url = isUnified
        ? `${process.env.REACT_APP_BASE_URL || "https://api.digitalvidyasaarthi.in"}/api/v1/fees/unified-receipts?unifiedReceiptNumber=${receiptNumber}`
        : `${process.env.REACT_APP_BASE_URL || "https://api.digitalvidyasaarthi.in"}/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${authToken}` } });
      if (response.data.success) {
        setReceiptData(response.data);
        setIsPreviewReady(true);
        return response.data;
      } else {
        toast.error(`Failed to fetch receipt data: ${response.data.message || "Unknown error"}`);
        return null;
      }
    } catch (error) {
      if (isUnified && error.response?.status === 404) {
        try {
          const fallbackResponse = await axios.get(
            `${process.env.REACT_APP_BASE_URL || "https://api.digitalvidyasaarthi.in"}/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`,
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          if (fallbackResponse.data.success) {
            setReceiptData(fallbackResponse.data);
            setIsPreviewReady(true);
            return fallbackResponse.data;
          } else {
            toast.error(`Fallback receipt fetch failed: ${fallbackResponse.data.message || "Unknown error"}`);
            return null;
          }
        } catch (fallbackError) {
          toast.error("Error fetching receipt data: " + fallbackError.message);
          return null;
        }
      } else {
        toast.error("Error fetching receipt data: " + error.message);
        return null;
      }
    } finally {
      setIsLoader(false);
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
      if (isUnified) {
        sendUnifiedMessage(dataForActions);
      } else {
        sendMessage(dataForActions);
      }
    }

    const tempReceiptNumber = receiptNumber;
    const tempIsUnified = isUnified;
    const tempParentId = responseData?.student?.parentId || unifiedReceiptData?.parentId || null;

    resetState();
    setResponseData(null);
    setUnifiedReceiptData(null);

    if (tempParentId) {
      await handleStudentClick(tempParentId);
    } else {
      setTriggerRefresh((prev) => !prev);
    }

    if (tempReceiptNumber) {
      const fetchedReceiptData = await fetchReceiptData(tempReceiptNumber, tempIsUnified);
      if (fetchedReceiptData) {
        if (tempIsUnified) {
          setUnifiedReceiptModalOpen(true);
        } else {
          setPdfModalOpen(true);
        }
      }
    }
  };

  const handleClosePdfModal = (action = null) => {
    if (action === "download" && receiptData) {
      generatePdf(receiptData.data, [], 0, 0, 0, 0, 0, 0, `fee-receipt-${receiptData.data?.feeReceiptNumber}.pdf`);
    } else if (action === "print" && receiptData) {
      toast.info("Print functionality placeholder: would print receipt " + receiptData.data?.feeReceiptNumber);
    }
    setPdfModalOpen(false);
    setReceiptData(null);
    setIsPreviewReady(false);
  };

  const handleCloseUnifiedReceiptModal = (action = null) => {
    if (action === "download" && receiptData) {
      generatePdf(receiptData.data, [], 0, 0, 0, 0, 0, 0, `unified-receipt-${receiptData.data?.unifiedReceiptNumber}.pdf`);
    } else if (action === "print" && receiptData) {
      toast.info("Print functionality placeholder: would print unified receipt " + receiptData.data?.unifiedReceiptNumber);
    }
    setUnifiedReceiptModalOpen(false);
    setReceiptData(null);
    setIsPreviewReady(false);
  };

  const sendMessage = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No receipt data available to send message.");
      return;
    }
    try {
      FeeResponse(dataToUse);
      toast.info(`SMS function called for ${dataToUse?.student?.studentName}`);
    } catch (error) {
      toast.error("Failed to initiate SMS sending.");
    }
  };

  const sendUnifiedMessage = (dataToUse) => {
    if (!dataToUse) {
      toast.error("No unified receipt data available to send message.");
      return;
    }
    try {
      FeeResponse(dataToUse);
      const studentNames = dataToUse?.students?.map((s) => s.studentName).join(", ") || "selected students";
      toast.info(`SMS function called for ${studentNames}`);
    } catch (error) {
      toast.error("Failed to initiate SMS sending.");
    }
  };

  return (
    <>
      <Modal setIsOpen={setIsMessageModalOpen} isOpen={isMessageModalOpen} title="Send Confirmation?" maxWidth="md">
        <div className="p-5">
          <p className="text-gray-700 mb-4 text-center">
            Fee submitted successfully for{" "}
            <span className="font-semibold">
              {responseData?.student?.studentName || unifiedReceiptData?.students?.map((s) => s.studentName).join(", ") || "student(s)"}
            </span>
            .<br />
            Receipt Number: <span className="font-semibold">{responseData?.feeReceiptNumber || unifiedReceiptData?.unifiedReceiptNumber || "N/A"}</span>
            <br />
            Do you want to send an SMS confirmation to the parent?
            <br />
            (<span className="font-mono text-sm">{responseData?.parent?.fatherPhone || unifiedReceiptData?.parent?.fatherPhone || "Phone number not available"}</span>)
          </p>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <Button
              type="button"
              name="Yes, Send SMS & View Receipt"
              onClick={() => handleCloseMessageModal(true)}
              className="w-full bg-green-600 hover:bg-green-700 text-white sm:col-start-2"
            />
            <Button
              type="button"
              name="No, Just View Receipt"
              onClick={() => handleCloseMessageModal(false)}
              className="w-full bg-gray-500 hover:bg-gray-600 text-white mt-3 sm:mt-0 sm:col-start-1"
            />
          </div>
        </div>
      </Modal>
      <Modal setIsOpen={setPdfModalOpen} isOpen={pdfModalOpen} title="Fee Receipt Preview" maxWidth="lg">
        <div className="p-1">
          {!isPreviewReady || !receiptData ? (
            <p className="text-center p-10 text-gray-600">Loading receipt preview...</p>
          ) : (
            <FeeRecipt
              modalData={receiptData}
              handleCloseModal={() => handleClosePdfModal()}
              handlePrint={() => handleClosePdfModal("print")}
              handleDownload={() => handleClosePdfModal("download")}
              isPreviewReady={isPreviewReady}
              isUnified={false}
            />
          )}
        </div>
      </Modal>
      <Modal setIsOpen={setUnifiedReceiptModalOpen} isOpen={unifiedReceiptModalOpen} title="Unified Fee Receipt Preview" maxWidth="lg">
        <div className="p-1">
          {!isPreviewReady || !receiptData ? (
            <p className="text-center p-10 text-gray-600">Loading unified receipt preview...</p>
          ) : (
            <FeeRecipt
              modalData={receiptData}
              handleCloseModal={() => handleCloseUnifiedReceiptModal()}
              handlePrint={() => handleCloseUnifiedReceiptModal("print")}
              handleDownload={() => handleCloseUnifiedReceiptModal("download")}
              isPreviewReady={isPreviewReady}
              isUnified={true}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default ReceiptModals;