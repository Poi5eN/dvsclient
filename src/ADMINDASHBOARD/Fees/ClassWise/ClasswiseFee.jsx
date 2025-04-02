import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

import { FaEdit } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import { Button } from "@mui/material";
import useCustomQuery from "../../../useCustomQuery";

import NoDataFound from "../../../NoDataFound";
import Modal from "../../../Dynamic/Modal";
import { useStateContext } from "../../../contexts/ContextProvider";
import { AdminGetAllClasses, adminRoutefeesregular, deletefees, getfees } from "../../../Network/AdminApi";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
import Table from "../../../Dynamic/Table";



function ClasswiseFee() {

  const { currentColor, setIsLoader } = useStateContext();
  const [formData, setFormData] = useState({ className: "", feeType: "", amount: "" });
  const [feesData, setFeesData] = useState([])
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);

  const getfee = async () => {
    try {
      const response = await getfees()
      console.log("response fees", response)
      if (response?.success) {
        setFeesData(response?.data)
      }
      else {
        toast.error(response?.message)
      }
    } catch (error) {
      console.log("error", error)
    }
  }
  useEffect(() => {
    getfee()
  }, [])

  const GetAllClasses = async () => {
 
    try {
      const response = await AdminGetAllClasses();

      if (response?.success) {

        let classes = response.classes;
        setGetClass(classes.sort((a, b) => a - b));

      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    GetAllClasses()
  }, [])
  console.log("formdata",formData)
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // const handleSubmit = async () => {
  //   console.log("formData",formData)
  //   setIsLoader(true)
  //   try {
  //     const response = await adminRoutefeesregular(formData)
  //     if (response?.success) {
  //       toast.success("Fees set successfully !")
  //       closeModal();
  //       setIsLoader(false)
  //     }
  //     else {
  //       setIsLoader(false)
  //       toast.error(response?.message)
  //     }

  //   } catch (error) {
  //     console.error("Error:", error);
  //     setLoading(false);
  //     // toast.error("An error occurred while submitting the form.");
  //   }
  // };

  console.log("Payload before submission:", formData); 
  const handleSubmit = async () => {
     // Debugging ke liye
  
    setIsLoader(true);
    try {
      const response = await adminRoutefeesregular(formData);
      if (response?.success) {
        toast.success("Fees set successfully !");
        getfee();  // Refresh data
        closeModal();
        setModalOpen(false);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsLoader(false);
    }
  };
  
  const handleDelete = async (id) => {
    const payload = {
      id: id
    }
    try {
      const response = await deletefees(payload)
      if (response?.success) {
        toast.success(response?.message)
        getfee()
      } else {
        toast?.error(response?.message)
      }
    } catch (error) {
      console.log("error", error)
    }
  }

  const handleEdit = (item) => {
    setEditMode(true);
    setEditItemId(item._id);
    setFormData({
      className: item.className,
      feeType: item.feeType,
      amount: item.amount,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setEditItemId(null);
    setFormData({ className: "", feeType: "", amount: "" });
  };

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    setFormData((prev) => ({
      ...prev,
      className: selectedClassName,  // className update ho raha hai
    }));
  };
  

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));


  const THEAD = [
    { id: "SN", label: "S No.", width: "5" },
    { id: "class", label: "Class", width: "7" },
    { id: "feetype", label: "fee Type" },
    { id: "amount", label: "Amount" },
    { id: "action", label: "Action" },

  ];

  const tBody = feesData.map((val, ind) => ({
    SN: ind + 1,

    class: (
      <span className="text-green-800 font-semibold">{val.className}</span>
    ),
    feetype: val.feeType,
    amount: val.amount,
    class: val.className,

    action: (<div className="flex justify-center">
      {/* <span onClick={() => handlePrintClick(val)} className="cursor-pointer">
        <FaEdit className="text-[25px] " />
      </span> */}
      <span onClick={() => handleDelete(val?.feeStructureId)} className="cursor-pointer">
        <MdDelete className="text-[25px] text-red-700" />
      </span>

    </div>
    ),
  }));
  return (
    <div className=" mx-auto ">
      <h1 className="text-xl font-bold  uppercase text-center" style={{ color: currentColor }}>
        Create Class Fee
      </h1>
      <div className="mb-1">
        <Button
          variant="contained"
          style={{ backgroundColor: currentColor }}
          onClick={() => {
            setEditMode(false);
            setEditItemId(null);
            setFormData({ className: "", feeType: "", amount: "" });
            setModalOpen(true);
          }}
        >
          Create Fee
        </Button>
      </div>

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Class Fee" : "Create Class Fee"}>
        <div className="p-4 space-y-4 bg-gray-50">
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <ReactSelect
                name="studentClass"
                value={selectedClass}
                handleChange={handleClassChange}
                label="Select a Class"
                dynamicOptions={dynamicOptions}
              />

            </div>
            <div>
                <ReactSelect
                name="feeType"
                value={formData.feeType}
                handleChange={handleFieldChange}
                label="Fee Type"
                dynamicOptions={[
                  { label: "Monthly", value: "Monthly" },
                  { label: "Quarterly", value: "Quarterly" },
                  { label: "Half Yearly", value: "Half Yearly" },
                  { label: "Annually", value: "Annually" },
                ]}
              />


            </div>
          </div>

          <div>
            <ReactInput
              type="number"
              name="amount"
              required={false}
              label="Amount"
              onChange={handleFieldChange}
              value={formData.amount}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="contained" onClick={handleSubmit} style={{ backgroundColor: currentColor, color: "white" }}>
              {loading ? "Processing..." : editMode ? "Update" : "Submit"}
            </Button>
            <Button variant="contained" onClick={closeModal} style={{ backgroundColor: "#616161", color: "white" }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>


      {tBody.length > 0 ? (
        <Table tHead={THEAD} tBody={tBody} />
      ) : (
        <NoDataFound />
      )}
    </div>
  );
}

export default ClasswiseFee;