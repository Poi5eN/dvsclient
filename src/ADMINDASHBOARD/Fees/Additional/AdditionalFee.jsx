
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { Button } from "@mui/material";
import Modal from "../../../Dynamic/Modal";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useEffect, useState } from "react";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import { AdminGetAllClasses, deletefees, feesadditional, getAdditionalfees } from "../../../Network/AdminApi";
import Table from "../../../Dynamic/Table";


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
    // class: val.className,

    action: (<div className="flex justify-center">

      <span onClick={() => handleDelete(val?.feeStructureId)} className="cursor-pointer">
        <MdDelete className="text-[25px] text-red-700" />
      </span>

    </div>
    ),
  }));

  return (
    <div className="mx-auto">
      <h1 className="text-xl font-bold  uppercase text-center" style={{ color: currentColor }}>
        Additional Fee
      </h1>
      <div className="mb-1">
        <Button
          variant="contained"
          style={{ backgroundColor: currentColor }}
          onClick={() => {
            setEditMode(false);

            setFormData({ className: "", name: "", feeType: "", amount: "" });
            setModalOpen(true);
          }}
        >
          Create Fee
        </Button>
      </div>

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Additional Fee" : "Create Additional Fee"}>
        <div className="p-4 space-y-4 bg-gray-50">
          <div className="grid gap-6 mb-6 md:grid-cols-2">

            <ReactSelect
              name="studentClass"
              value={selectedClass}
              handleChange={handleClassChange}
              label="Select a Class"
              dynamicOptions={dynamicOptions}
            />

            <div>
              <label className="block mb-2 text-sm font-medium">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFieldChange}
                className="border rounded p-2 w-full"
              />
            </div>
          </div>

          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <div>
              <label className="block mb-2 text-sm font-medium">Fee Type</label>
              <select
                name="feeType"
                value={formData.feeType}
                onChange={handleFieldChange}
                className="border rounded p-2 w-full"
              >
                <option value="">Select Fee Type</option>
                <option value="Exam Fee">Exam Fee</option>
                <option value="One Time">One Time</option>
                <option value="Monthly">Monthly</option>
                <option value="Quarterly">Quarterly</option>
                <option value="Half Yearly">Half Yearly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">Amount</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleFieldChange}
                className="border rounded p-2 w-full"
              />
            </div>
          </div>

          <Button variant="contained" style={{ backgroundColor: currentColor }} onClick={handleSubmit}>
            {editMode ? "Update" : "Submit"}
          </Button>
        </div>
      </Modal>
      <Table tHead={THEAD} tBody={tBody} />
    </div>
  );
}

export default AdditionalFee;
