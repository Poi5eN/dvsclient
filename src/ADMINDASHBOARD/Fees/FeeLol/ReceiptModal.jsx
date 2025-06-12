import React, { useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import Modal from "../../../Dynamic/Modal";
import Button from "../../../Dynamic/utils/Button";
import generatePdf from "../../../Dynamic/utils/pdfGenerator";
import FeeRecipt from "../FeeRecipt";
import { useStateContext } from "../../../contexts/ContextProvider";

const ReceiptModal = ({
  isMessageModalOpen,
  setIsMessageModalOpen,
  pdfModalOpen,
  setPdfModalOpen,
  unifiedReceiptModalOpen,
  setUnifiedReceiptModalOpen,
  receiptData,
  setReceiptData,
  isPreviewReady,
  setIsPreviewReady,
  responseData,
  unifiedReceiptData,
  handleCloseMessageModal,
  authToken,
}) => {
  const { setIsLoader } = useStateContext();

  const fetchReceiptData = async (receiptNumber, isUnified) => {
    setIsPreviewReady(false);
    setIsLoader(true);
    try {
      const url = isUnified
        ? `${
            process.env.REACT_APP_BASE_URL || "https://api.digitalvidyasaarthi.in"
          }/api/v1/fees/unified-receipts?unifiedReceiptNumber=${receiptNumber}`
        : `${
            process.env.REACT_APP_BASE_URL || "https://api.digitalvidyasaarthi.in"
          }/api/v1/fees/generateFeeReceipt?receiptNumber=${receiptNumber}`;
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.success) {
        setReceiptData(response.data);
        setIsPreviewReady(true);
        return response.data;
      } else {
        toast.error(`Failed to fetch receipt data: ${response.data.message}`);
        return null;
      }
    } catch (error) {
      toast.error(`Error fetching receipt data: ${error.message}`);
      return null;
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    if (receiptData?.receiptNumber) {
      fetchReceiptData(receiptData.receiptNumber, receiptData.isUnified);
    }
  }, [receiptData]);

  const handleDownloadPdf = (data) => {
    if (!data?.data) {
      toast.error("No receipt data available to generate PDF.");
      return;
    }
    generatePdf(
      data.data,
      [],
      0,
      0,
      0,
      0,
      0,
      0,
      `fee-receipt-${data.data?.feeReceiptNumber}.pdf`
    );
  };

  const handlePrintReceipt = (data) => {
    if (!data?.data) {
      toast.error("No receipt data available to print.");
      return;
    }
    toast.info(`Print functionality placeholder: would print receipt ${data.data?.feeReceiptNumber}`);
  };

  const handleDownloadUnifiedPdf = (data) => {
    if (!data?.data) {
      toast.error("No unified receipt data available to generate PDF.");
      return;
    }
    generatePdf(
      data.data,
      [],
      0,
      0,
      0,
      0,
      0,
      0,
      `unified-receipt-${data.data?.unifiedReceiptNumber}.pdf`
    );
  };

  const handlePrintUnifiedReceipt = (data) => {
    if (!data?.data) {
      toast.error("No unified receipt data available to print.");
      return;
    }
    toast.info(`Print functionality placeholder: would print unified receipt ${data.data?.unifiedReceiptNumber}`);
  };

  return (
    <>
      <Modal
        setIsOpen={setIsMessageModalOpen}
        isOpen={isMessageModalOpen}
        title="Send Confirmation?"
        maxWidth="md"
      >
        <div className="p-5">
          <p className="text-gray-700 mb-4 text-center">
            Fee submitted successfully for{" "}
            <span className="font-semibold">
              {responseData?.student?.studentName ||
                unifiedReceiptData?.students?.map((s) => s.studentName).join(", ") ||
                "student(s)"}
            </span>
            .<br />
            Receipt Number:{" "}
            <span className="font-semibold">
              {responseData?.feeReceiptNumber ||
                unifiedReceiptData?.unifiedReceiptNumber ||
                "N/A"}
            </span>
            <br />
            Do you want to send an SMS confirmation to the parent?
            <br />
            (<span className="font-mono text-sm">
              {responseData?.parent?.fatherPhone ||
                unifiedReceiptData?.parent?.fatherPhone ||
                "Phone number not available"}
            </span>)
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
      <Modal
        setIsOpen={setPdfModalOpen}
        isOpen={pdfModalOpen}
        title="Fee Receipt Preview"
        maxWidth="lg"
      >
        <div className="p-1">
          {!isPreviewReady || !receiptData ? (
            <p className="text-center p-10 text-gray-600">
              Loading receipt preview...
            </p>
          ) : (
            <FeeRecipt
              modalData={receiptData}
              handleCloseModal={() => setPdfModalOpen(false)}
              handlePrint={() => handlePrintReceipt(receiptData)}
              handleDownload={() => handleDownloadPdf(receiptData)}
              isPreviewReady={isPreviewReady}
              isUnified={false}
            />
          )}
        </div>
      </Modal>
      <Modal
        setIsOpen={setUnifiedReceiptModalOpen}
        isOpen={unifiedReceiptModalOpen}
        title="Unified Fee Receipt Preview"
        maxWidth="lg"
      >
        <div className="p-1">
          {!isPreviewReady || !receiptData ? (
            <p className="text-center p-10 text-gray-600">
              Loading unified receipt preview...
            </p>
          ) : (
            <FeeRecipt
              modalData={receiptData}
              handleCloseModal={() => setUnifiedReceiptModalOpen(false)}
              handlePrint={() => handlePrintUnifiedReceipt(receiptData)}
              handleDownload={() => handleDownloadUnifiedPdf(receiptData)}
              isPreviewReady={isPreviewReady}
              isUnified={true}
            />
          )}
        </div>
      </Modal>
    </>
  );
};

export default ReceiptModal;