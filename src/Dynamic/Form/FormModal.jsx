import React from "react";
import Modal from "react-modal";
import InputForm from "./InputForm";

Modal.setAppElement("#root");

const CustomModal = ({ isOpen, closeModal, handleSubmit }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={closeModal}
      contentLabel="Add New Data Modal"
      className="modal"
      overlayClassName="overlay"
    >
      <div className="bg-red-500 p-4 rounded shadow-lg ">
        <h2 className="text-lg font-semibold mb-4">Add New Data</h2>
        <InputForm handleSubmit={handleSubmit} />
        <button
          onClick={closeModal}
          className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded mt-4"
        >
          Close
        </button>
      </div>
    </Modal>
  );
};

export default CustomModal;
