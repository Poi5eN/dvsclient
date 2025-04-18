
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";

import Modal from "../../../Dynamic/Modal";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useEffect, useState } from "react";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import { AdminGetAllClasses, deletefees, feesadditional, getAdditionalfees } from "../../../Network/AdminApi";
import Table from "../../../Dynamic/Table";
import Button from "../../../Dynamic/utils/Button";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";


function AdditionalFee() {
  const [additionFee, setAdditionalFee] = useState([])
  const { currentColor, setIsLoader } = useStateContext();
  const [selectedClass, setSelectedClass] = useState("");
  const [formData, setFormData] = useState({
    className: "",
    name: "",
    feeType: "",
    amount: "",
  });


  const [modalOpen, setModalOpen] = useState(false);
  const [getClass, setGetClass] = useState([]);
  const [editMode, setEditMode] = useState(false);
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
  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    setFormData((preV) => (
      {
        preV,
        className: selectedClassName
      }
    ))

  }

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));

  const feeType=[
    {
      label:"Select Fee Type",value:""
    },
    {
      label:"Exam Fee",value:"Exam Fee"
    },
    {
      label:"One Time",value:"One Time"
    },
    {
      label:"Monthly",value:"Monthly"
    },
    {
      label:"Quarterly",value:"Quarterly"
    },
    {
      label:"Half Yearly",value:"Half Yearly"
    },
    {
      label:"Annually",value:"Annually"
    },
  ]
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const getfee = async () => {
    try {
      const response = await getAdditionalfees()

      if (response?.success) {
        setAdditionalFee(response?.data)

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
  const handleSubmit = async () => {
    setIsLoader(true)
    try {
      const response = await feesadditional(formData)
      if (response?.success) {
        toast.success("Fees set successfully !")
        setIsLoader(false)
        getfee()
        setModalOpen(false);
        setSelectedClass("")
      }
      else {
        setIsLoader(false)
        toast.error(response?.message)
      }

    } catch (error) {
      console.error("Error:", error);
      // setLoading(false);
      // toast.error("An error occurred while submitting the form.");
    }
    finally {
      setIsLoader(false)
    }
  };

  const handleDelete = async (feeStructureIda) => {
    const payload = {
      id: feeStructureIda
    }
    const response = await deletefees(payload);
    if (response?.success) {
      toast?.success(response?.message)
      getfee()
    }

  };

  const handleEdit = (item) => {
    setEditMode(true);

    setFormData({
      className: item.className,
      name: item.name,
      feeType: item.feeType,
      amount: item.amount,
    });
    setModalOpen(true);
  };

  const THEAD = [
    { id: "SN", label: "S No.", width: "5" },
    { id: "class", label: "Class", width: "7" },
    { id: "name", label: "Name", width: "7" },
    { id: "feetype", label: "fee Type" },
    { id: "amount", label: "Amount" },
    { id: "action", label: "Action" },

  ];

  const tBody = additionFee.map((val, ind) => ({
    SN: ind + 1,

    class: (
      <span className="text-green-800 font-semibold">{val.className}</span>
    ),
    name: val.name,
    feetype: val.feeType,
    amount: val.amount,
 

    action: (<div className="flex justify-center">

      <span onClick={() => handleDelete(val?.feeStructureId)} className="cursor-pointer">
        <MdDelete className="text-[25px] text-red-700" />
      </span>

    </div>
    ),
  }));

  return (
    <div className="mx-auto">
     
      <div className="">
        <Button
        name="Set Additional Fee"
          // variant="contained"
          // style={{ backgroundColor: currentColor }}
          onClick={() => {
            setEditMode(false);

            setFormData({ className: "", name: "", feeType: "", amount: "" });
            setModalOpen(true);
          }}
        >
          
        </Button>
      </div>

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Additional Fee" : "Create Additional Fee"}>
        <div className="p-4 space-y-4 bg-gray-50">
          <div className="grid gap-6  md:grid-cols-2">

            <ReactSelect
              name="studentClass"
              value={selectedClass}
              handleChange={handleClassChange}
              label="Select a Class"
              dynamicOptions={dynamicOptions}
            />
            <ReactSelect
              name="feeType"
              value={formData.feeType}
              handleChange={handleFieldChange}
              label="Select a Class"
              dynamicOptions={feeType}
            />
 
  <ReactInput
              // resPClass="grid grid-cols-2 md:grid-cols-5"
              type="text"
              name="name"
              required={true}
              label="Name"
              onChange={handleFieldChange}
              value={formData.name}
            />
             <ReactInput
              // resPClass="grid grid-cols-2 md:grid-cols-5"
              type="number"
              name="amount"
              required={true}
              label="Amount"
              onChange={handleFieldChange}
              value={formData.amount}
            />
            
          </div>

          

          <Button
          name="Submit"
          // variant="contained" style={{ backgroundColor: currentColor }} 
          onClick={handleSubmit}>
            {/* {editMode ? "Update" : "Submit"} */}
          </Button>
        </div>
      </Modal>
      <Table tHead={THEAD} tBody={tBody} />
    </div>
  );
}

export default AdditionalFee;
