import React, { useState,useEffect } from "react";
import InputForm from "./InputForm";
import { toast } from "react-toastify";
import DataTable from "../DataTable/DynamicDataTable";
import Modal from "react-modal"; // Import react-modal
import  './FormStyle.css'
const modalStyle = {
  content: {
    

    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
    // marginTop:"130px"

    

  },
}

function Form() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    phone: "",
  });

  const [submittedData, setSubmittedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State for the modal


   // Add and remove the "disable-scroll" class on the body element
   useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("disable-scroll");
    } else {
      document.body.classList.remove("disable-scroll");
    }

    // Cleanup effect
    return () => {
      document.body.classList.remove("disable-scroll");
    };
  }, [isModalOpen]);

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const formFields = [
    {
      label: "Name",
      name: "name",
      type: "text",
      value: formData.name,
      required: true,
    },
    {
      label: "Username",
      name: "username",
      type: "text",
      value: formData.username,
      required: true,
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      value: formData.email,
      required: true,
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      value: formData.password,
      required: true,
    },
    {
      label: "Phone",
      name: "phone",
      type: "number",
      value: formData.phone,
      required: true,
    },
    {
      label: "Age",
      name: "age",
      type: "number",
      value: formData.age,
      required: true,
    },
  ];
  
  const handleSubmit = () => {

    const requiredFields = formFields.filter((field) => field.required && !formData[field.name]);
    if (requiredFields.length > 0) {
      requiredFields.forEach((field) => {
        toast.error(`${field.label} is required.`);
      });
      return;
    }
    // console.log("Form submitted:", formData);
    setSubmittedData([...submittedData, formData]);
    toast.success("Form submitted successfully!");
    setFormData({
      name: "",
      username: "",
      email: "",
      password: "",
      phone: "",
    });
    closeModal(); // Close the modal after submission
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  

  return (
    <div className=" p-10 -z-50    overflow-x-auto mt-20 sm:mt-20 md:mt-10">
      <h1 className="text-xl font-bold mb-4">Input Form</h1>
      <button
        onClick={openModal}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-5 rounded w-full"
      >
        Create
      </button>
      {isModalOpen && <div className="modal-blur"></div>}
      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Create Form"
        style={modalStyle}
        overlayClassName="overlay"
      >
        <h1 className="text-2xl font-semibold text-center py-2">Create User</h1>
        <InputForm fields={formFields} handleChange={handleFieldChange} />
        <div className="flex justify-end mt-4">
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Submit
          </button>
          <button
            onClick={closeModal}
            className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </Modal>

<div className=" py-1  -z-20">
<DataTable data={submittedData} />
</div>
    </div>
  );
}

export default Form;

