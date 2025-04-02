
import { toast } from "react-toastify";
import { MdDelete } from "react-icons/md";
import { Button } from "@mui/material";
import Modal from "../../Dynamic/Modal";
import { useEffect, useState } from "react";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import { AdminGetAllClasses, getAdditionalfees, Latefine, LateFines } from "../../Network/AdminApi";
import { useStateContext } from "../../contexts/ContextProvider";
import Table from "../../Dynamic/Table";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";


function LateFine() {
   const [allLateFines, setAllLateFines] = useState([]); // Store all late fine rules
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


   const getLateFinesData = async () => {
      try {
        const response = await LateFines();
        if (response?.success) {
          setAllLateFines(response.data || []);
        } else {
          toast.error(response?.message || "Failed to get late fine data.");
          setAllLateFines([]);
        }
      } catch (error) {
        console.error("Error fetching late fines:", error);
        toast.error("Error fetching late fines.");
        setAllLateFines([]);
      }
    };
  useEffect(() => {
    getfee()
    getLateFinesData()
  }, [])
  const handleSubmit = async () => {
    const payload = {
      "className": formData?.className,
      "amount": Number(formData?.amount),
      "lateFineDueDay": Number(formData?.day)
    }
    setIsLoader(true)
    try {
      const response = await Latefine(payload)
      if (response?.success) {
        toast.success("Fees set successfully !")
        setIsLoader(false)
        setModalOpen(false);
        setFormData([])
      }
      else {
        setIsLoader(false)
        toast.error(response?.message)
      }

    } catch (error) {
      console.error("Error:", error);
    }
    finally {
      setIsLoader(false)
    }
  };

  const handleDelete = (itemId) => {

  };

  const handleEdit = (item) => {

  };

  const THEAD = [
    { id: "SN", label: "S No.", width: "5" },
    { id: "class", label: "Class", width: "7" },
    { id: "name", label: "Name", width: "7" },
    { id: "feetype", label: "fee Type" },
    { id: "amount", label: "Amount" },
    { id: "action", label: "Action" },

  ];

  const tBody = allLateFines.map((val, ind) => ({
    SN: ind + 1,

    class: (
      <span className="text-green-800 font-semibold">{val.className}</span>
    ),
    name: val.name,
    feetype: val.feeType,
    amount: val.amount,
    class: val.className,
    action: (<div className="flex justify-center">
      <span onClick={() => handleDelete(val?._id)} className="cursor-pointer">
        <MdDelete className="text-[25px] text-red-700" />
      </span>

    </div>
    ),
  }));

  return (
    <div className="mx-auto">
      <h1 className="text-xl font-bold  uppercase text-center" style={{ color: currentColor }}>
        Late Fine Fee
      </h1>
      <div className="mb-1">
        <Button
          variant="contained"
          style={{ backgroundColor: currentColor }}
          onClick={() => {
           
           

            setModalOpen(true);
          }}
        >
          Create Fee
        </Button>
      </div>

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Late Fine"}>
        <div className="p-4 space-y-4 bg-gray-50">
          <div className="grid gap-2 md:grid-cols-1">
            <ReactSelect
              required={true}
              name="studentClass"
              value={selectedClass}
              handleChange={handleClassChange}
              label="Select a Class"
              dynamicOptions={dynamicOptions}
            />
            <ReactInput
              type="number"
              name="day"
              required={true}
              label="Days"
              onChange={handleFieldChange}
              value={formData.day}
            />
            <ReactInput
              type="number"
              name="amount"
              required={true}
              label="Amount"
              onChange={handleFieldChange}
              value={formData.amount}
            />
          </div>
          <Button variant="contained" style={{ backgroundColor: currentColor, width: "100%" }} onClick={handleSubmit}>
            Submit
          </Button>
        </div>
      </Modal>
      <Table tHead={THEAD} tBody={tBody} />
    </div>
  );
}

export default LateFine;
