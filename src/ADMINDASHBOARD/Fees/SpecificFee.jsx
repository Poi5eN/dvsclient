import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import Modal from "../../Dynamic/Modal";
import { useStateContext } from "../../contexts/ContextProvider";
import { AdminGetAllClasses, createStudentSpecificFee } from "../../Network/AdminApi";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";

function SpecificFee() {

  const { currentColor, setIsLoader } = useStateContext();
  const [formData, setFormData] = useState({ className: "", feeType: "", amount: "",AdmNo:"" });
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
 

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

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  console.log("Payload before submission:", formData); 
  const handleSubmit = async () => {
  const payload={
    "studentId": formData?.AdmNo,
    "feeType": formData?.feeType,
    "amount": Number(formData?.amount),
    "className": formData?.className
  }
    setIsLoader(true);
    try {
      const response = await createStudentSpecificFee(payload);
      if (response?.success) {
        toast.success("Fees set successfully !");
        
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
  
  const closeModal = () => {
    setModalOpen(false);
    setFormData({ className: "", feeType: "", amount: "" ,AdmNo:""});
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
            
            setFormData({ className: "", feeType: "", amount: "",AdmNo:"" });
            setModalOpen(true);
          }}
        >
          Create Fee
        </Button>
      </div>

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={ "Specific Student Fee"}>
        <div className="p-4 space-y-4 bg-gray-50">
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
            <div>
            <ReactInput
              type="text"
              name="AdmNo"
              required={false}
              label="Student ID"
              onChange={handleFieldChange}
              value={formData.AdmNo}
            />
          </div>
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
              { "Submit"}
            </Button>
            <Button variant="contained" onClick={closeModal} style={{ backgroundColor: "#616161", color: "white" }}>
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default SpecificFee;