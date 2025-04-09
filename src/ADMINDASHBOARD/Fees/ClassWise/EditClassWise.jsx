import React, { useState, useEffect } from "react";
import InputForm from "../../../Dynamic/Form/InputForm";
import { toast } from "react-toastify";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";


function Edit_Classwise_Fees() {
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const { _id } = useParams();
  const [formData, setFormData] = useState({
    className: "",
    feeType: "",
    amount: "",
  });

  const [submittedData, setSubmittedData] = useState({});
  const [loading, setLoading] = useState(false);

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleClose = () => {
    navigate("/admin/classwise");
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "image") {
        formDataToSend.append(key, String(value));
      }
    });

    try {
      setLoading(true);
      const response = await axios.put(
        `https://dvsserver.onrender.com/api/v1/adminRoute/updateFees/${_id}`,
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setFormData(response.data);
      setLoading(false);
      navigate("/admin/classwise");
      toast.success("Fees Updated Successfully!!!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while updating the fees.");
    }
  };

  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/getFees?_id=${_id}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data[0];
        setSubmittedData(data);
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
        }));
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [_id]);

  const formFields = [
    {
      label: "Class",
      name: "className",
      type: "text",
      value: formData.className,
      required: true,
      
      // selectOptions: [
      //   "Class",
      //   "1",
      //   "2",
      //   "3",
      //   "4",
      //   "5",
      //   "6",
      //   "7",
      //   "8",
      //   "9",
      //   "10",
      //   "11",
      //   "12",
      // ],
    },
    {
      label: "Fee Type",
      name: "feeType",
      type: "select",
      value: formData.feeType,
      required: true,
      selectOptions: [
        "Fee Type",
        "Monthly",
        "Quarterly",
        "Half Yearly",
        "Annually",
      ],
    },
    {
      label: "Amount",
      name: "amount",
      type: "number",
      value: formData.amount,
      required: true,
    },
  ];

  return (
    // <div className="mt-12 w-[900px] mx-auto p-3 bg-gray-200 over-text">
    <div className="mt-20 sm:mt-10  md:mt-5 md:w-[400px] mx-auto p-3 bg-gray-200 over-text">
      <h1 className="hover-text text-center text-2xl">Update Fee</h1>
      <InputForm fields={formFields} handleChange={handleFieldChange} />

      <div
        style={{ display: "flex", justifyContent: "flex-end",  }}
      >
        <button
          onClick={handleSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
        >
          Update Fees
        </button>
        <button
          onClick={handleClose}
          className="ml-2 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Edit_Classwise_Fees;
