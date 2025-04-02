import React, { useState, useEffect } from "react";
import InputForm from "../../Dynamic/Form/InputForm";
import { toast } from "react-toastify";
import Modal from "react-modal";
import axios from "axios";
import StockTable from "./StockDataTable";
import { useStateContext } from "../../contexts/ContextProvider";

import { Link } from "react-router-dom";


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

function Create_Sales() {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    quantity: "",
    price: "",
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [shouldFetchData, setShouldFetchData] = useState(false);

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "image") {
        formDataToSend.append(key, String(value));
      }
    });
   

    try {
      // setLoading(true)
     await axios.post(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/createItem",
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
     
      setSubmittedData([...submittedData, formData]);
      
      setFormData({
        itemName: "",
        category: "",
        quantity: "",
        price: "",
      });
      // setLoading(false)
      toast.success("Form submitted successfully!");
      setShouldFetchData(!shouldFetchData);
      closeModal();
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while submitting the form.");
    }
  };

  const handleDelete = (itemId) => {
    axios
      .delete(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/deleteItem/${itemId}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {

        const updatedData = submittedData.filter((item) => item._id !== itemId);
        setSubmittedData(updatedData);

        toast.success("Item deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting Item:", error);
        toast.error("An error occurred while deleting the Item.");
      });
  };

  const openModal = () => {
    // console.log("clicked the ");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const formFields = [
    {
      label: "Item Name",
      name: "itemName",
      type: "text",
      value: formData.itemName,
      required: true,
    },
    // {
    //   label: "Category",
    //   name: "category",
    //   type: "text",
    //   value: formData.category,
    //   required: true,
    // },
    {
      label: "Category",
      name: "category",
      type: "select",
      value: formData.category,
      required: true,
      selectOptions: [" Select Category", "Stationary", "Uniform", "Other"],
    },
    {
      label: "Quantity",
      name: "quantity",
      type: "number",
      value: formData.quantity,
      required: true,
    },
    {
      label: "Price",
      name: "price",
      type: "number",
      value: formData.price,
      required: true,
    },
  ];

  useEffect(() => {
    // Fetch data from the server when the component mounts
    axios
      .get("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllItems", {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        }, // Set withCredentials to true
      })
      .then((response) => {

        setSubmittedData(response.data.listOfAllItems);

      })

      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [shouldFetchData]);

  return (
    <div className=" mt-12 md:mt-1  mx-auto p-3 ">
    <h1 
     className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
     style={{color:currentColor}}
    >All Stock </h1>

<div className="flex justify-between items-center mb-4">
        <Link
          to="/admin"
         
          className="dark:text-white dark:bg-secondary-dark-bg neu-btn"
          style={{ color: currentColor, border: `2px solid ${currentColor}` }}
        >
          Back
        </Link>
        <button
       className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 "
       style={{border:`2px solid ${currentColor} `,color:currentColor}}
      onClick={openModal}
     >
        Add Stock
      </button>
      </div>
     

      {/* Modal */}
      {isModalOpen && <div className="modal-blur"></div>}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        contentLabel="Create Form"
        style={modalStyle}
        overlayClassName="overlay"
      >
        <h1 
         className="text-xl font-bold mb-4 uppercase text-center  hover-text "
         style={{color:currentColor}}
        >
          Create Stock
        </h1>
        <InputForm
          fields={formFields}
          handleChange={handleFieldChange}
        // handleImageChange={handleImageChange}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            padding: "10px",
          }}
        >
          <button
            onClick={handleSubmit}
            className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 "
        style={{border:`2px solid ${currentColor} `,color:currentColor}}
          >
            Submit
          </button>
          <button
            onClick={closeModal}
            className="dark:text-white dark:bg-secondary-dark-bg text-red-800  ml-2 neu-btn border-2 "
        style={{border:`2px solid red `}}
          >
            Cancel
          </button>
        </div>
      </Modal>

      <StockTable data={submittedData} handleDelete={handleDelete} />
    </div>
  );
}

export default Create_Sales;
