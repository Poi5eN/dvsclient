import React, { useState, useEffect } from "react";
import InputForm from "../Dynamic/Form/InputForm";
import { toast } from "react-toastify";
import DataTable from "../Dynamic/DataTable/DynamicDataTable";
import Modal from "react-modal";
import axios from "axios";


const modalStyle = {
  content: {
    width: "80%",
    margin: "0 auto",
    zIndex: 1000,
    borderRadius: "8px",
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
    border: "none",
  },
};

function Create_Promotion() {
  const authToken = localStorage.getItem("token");
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    password: "",
    dateOfBirth: "",
    status: "",
    qualification: "",
    salary: "",
    subject: "",
    gender: "",
    joiningDate: "",
    address: "",
    contact: "",
    experience: "",
    section: "",
    classOfStudent: "",
    image: null,
  });

  const [submittedData, setSubmittedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    // console.log(file)
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      // if (key === "image") continue;
      // formDataToSend.append(key, String(value));
      if (key !== "image") {
        formDataToSend.append(key, String(value));
      }
    });
    formDataToSend.append("image", formData.image);

    try {
      const response = await axios.post(
        "https://dvsserver.onrender.com/api/v1/adminRoute/createTeacher",
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFormData({
        fullName: "",
        employeeId: "",
        email: "",
        password: "",
        dateOfBirth: "",
        status: "",
        qualification: "",
        salary: "",
        subject: "",
        gender: "",
        joiningDate: "",
        address: "",
        contact: "",
        experience: "",
        section: "",
        classOfStudent: "",
        image: null,
      });
      setSubmittedData([...submittedData, formData]);
      toast.success("Form submitted successfully!");
      closeModal();
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const formFields = [
    {
      label: "Full Name",
      name: "fullName",
      type: "text",
      value: formData.fullName,
      required: true,
    },
    {
      label: "Employee ID",
      name: "employeeId",
      type: "text",
      value: formData.employeeId,
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
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "date",
      value: formData.dateOfBirth,
      required: true,
    },
    {
      label: "Status",
      name: "status",
      type: "text",
      value: formData.status,
      required: true,
    },
    {
      label: "Qualification",
      name: "qualification",
      type: "text",
      value: formData.qualification,
      required: true,
    },
    {
      label: "Salary",
      name: "salary",
      type: "number",
      value: formData.salary,
      required: true,
    },
    {
      label: "Subject",
      name: "subject",
      type: "text",
      value: formData.subject,
      required: true,
    },
    {
      label: "Gender",
      name: "gender",
      type: "text",
      value: formData.gender,
      required: true,
    },
    {
      label: "Joining Date",
      name: "joiningDate",
      type: "date",
      value: formData.joiningDate,
      required: true,
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      value: formData.address,
      required: true,
    },
    {
      label: "Contact",
      name: "contact",
      type: "text",
      value: formData.contact,
      required: true,
    },
    {
      label: "Experience",
      name: "experience",
      type: "text",
      value: formData.experience,
      required: true,
    },
    {
      label: "Section",
      name: "section",
      type: "text",
      value: formData.section,
      required: true,
    },
    {
      label: "Class of Student",
      name: "classOfStudent",
      type: "text",
      value: formData.classOfStudent,
      required: true,
    },
    {
      label: "Profile Pic",
      name: "image",
      type: "file",
      accept: "image/*",
      required: true,
    }
    
  ];

  return (
    <div className=" mt-12  w-[900px] mx-auto p-3">
      <h1 className="text-2xl font-bold mb-4">Create a New Promotion Here</h1>
      <button
        onClick={openModal}
        className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded w-full"
      >
        Create Promotion
      </button>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Create Form"
        style={modalStyle}
        overlayClassName="overlay"
      >
        <h1 style={{ fontSize: 30, fontWeight: 800, textAlign: "center" }}>
          Create Promotion
        </h1>
        <InputForm
          fields={formFields}
          handleChange={handleFieldChange}
          handleImageChange={handleImageChange}
        />
        <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
          >
            Submit
          </button>
          <button onClick={closeModal} className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded">
            Cancel
          </button>
        </div>
      </Modal>

      <DataTable data={submittedData} />
    </div>
  );
}

export default Create_Promotion;
