import { toast } from "react-toastify";
import { MdDelete,MdEdit} from "react-icons/md";
import { FaEdit, FaEye, FaUsersCog } from "react-icons/fa";
import Modal from "../../../Dynamic/Modal";
import { useStateContext } from "../../../contexts/ContextProvider";
import { useEffect, useState } from "react";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import { AdminGetAllClasses, deletefees, feesadditional, getAdditionalfees, updateAdditionalFee } from "../../../Network/AdminApi";
import Table from "../../../Dynamic/Table";
import Button from "../../../Dynamic/utils/Button";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
import PageHeaderWithBreadcrumb from "../../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../../Dynamic/BreadcrumbList";


function AdditionalFee() {
  // State for the master list of fees
  const [additionFee, setAdditionalFee] = useState([]);
  // State for the filtered list to display in the table
  const [filteredAdditionFee, setFilteredAdditionFee] = useState([]); // <-- New state for filtered data
  const { currentColor, setIsLoader } = useStateContext();
  // State for the class selected in the filter dropdown
  const [selectedClass, setSelectedClass] = useState(""); // <-- State for the filter value
  const [formData, setFormData] = useState({
    className: "",
    name: "",
    feeType: "",
    amount: "",
  });


  const [modalOpen, setModalOpen] = useState(false);
  const [getClass, setGetClass] = useState([]);
  const [editMode, setEditMode] = useState(false);

  // --- Fetch All Classes ---
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
    GetAllClasses();
  }, []);

  // --- Fetch All Additional Fees ---
  const getfee = async () => {
    setIsLoader(true); // Start loader
    try {
      const response = await getAdditionalfees();
      if (response?.success) {
        setAdditionalFee(response?.data); // Update master list
        // Initialize filtered list (show all initially or based on current filter)
        if (selectedClass) {
           setFilteredAdditionFee(response?.data.filter(fee => fee.className === selectedClass));
        } else {
           setFilteredAdditionFee(response?.data);
        }
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error getting fees", error);
      toast.error("Failed to fetch additional fees.");
    } finally {
      setIsLoader(false); // Stop loader
    }
  };

  useEffect(() => {
    getfee();
  }, []); // Fetch fees on initial mount

  // --- Effect for Filtering based on selectedClass ---
  useEffect(() => {
    if (selectedClass) {
      // If a class is selected, filter the master list
      const filtered = additionFee.filter(fee => fee.className === selectedClass);
      setFilteredAdditionFee(filtered);
    } else {
      // If "All Classes" or no class is selected, show the full list
      setFilteredAdditionFee(additionFee);
    }
  }, [selectedClass, additionFee]); // Re-run filter when selection or master list changes


  // --- Handler for the FILTER dropdown ---
  const handleFilterClassChange = (e) => {
    setSelectedClass(e.target.value); // Only update the filter state
  };

  const filterClassOptions = [
    { label: "All Classes", value: "" }, // Option to clear filter
    ...getClass.map((cls) => ({
      label: cls.className,
      value: cls.className,
    }))
  ];

   const modalClassOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));

  const feeType=[
    { label:"Select Fee Type",value:"" },
    { label:"One Time",value:"One Time" },
    { label:"Monthly",value:"Monthly" },
    
  ];

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };


  const handleSubmit = async () => {
    // Basic Validation (remains the same)
    if (!formData.className || !formData.name || !formData.feeType || !formData.amount) {
      toast.error("Please fill in all required fields.");
      return;
    }
    // Add validation for ID if in edit mode (optional but good practice)
    if (editMode && !formData.id) {
        toast.error("Cannot update fee: Missing fee ID.");
        console.error("Attempted to update fee without an ID in formData:", formData);
        return;
    }


    setIsLoader(true);
    try {
      let response;
      let payload;

      if (editMode) {
        // --- Payload for UPDATE ---
        // id: formData.id,
        payload = {
          // id: formData.id, // Include the ID for the update API
          className: formData.className,
          name: formData.name,
          feeType: formData.feeType,
          amount: formData.amount,
        };
        response = await updateAdditionalFee(payload,formData.id);
      } else {
        // --- Payload for CREATE ---
        payload = {
          // No ID for create
          className: formData.className,
          name: formData.name,
          feeType: formData.feeType,
          amount: formData.amount,
        };
        response = await feesadditional(payload);
      }

      if (response?.success) {
        toast.success(`Fees ${editMode ? 'updated' : 'set'} successfully!`);
        getfee(); // Refresh the master list
        setModalOpen(false);
        // Reset form AND id after successful submission
        setFormData({ id: null, className: "", name: "", feeType: "", amount: "" });
        setEditMode(false); // Reset edit mode
      } else {
        toast.error(response?.message || `Failed to ${editMode ? 'update' : 'set'} fees.`);
      }
    } catch (error) {
      console.error(`Error ${editMode ? 'updating' : 'submitting'} fee:`, error);
      toast.error(`An error occurred while ${editMode ? 'updating' : 'submitting'} the form.`);
    } finally {
      setIsLoader(false);
    }
  };

  // --- Handle Delete ---
  const handleDelete = async (feeId) => { // Changed param name for clarity
     if (!window.confirm("Are you sure you want to delete this fee entry?")) {
        return; // Don't proceed if user cancels
     }
    setIsLoader(true);
    const payload = {
      id: feeId // Use the specific ID of the fee structure
    };
    try {
        const response = await deletefees(payload);
        if (response?.success) {
          toast.success(response?.message || "Fee deleted successfully!");
          getfee(); // Refresh list after delete
        } else {
          toast.error(response?.message || "Failed to delete fee.");
        }
    } catch (error) {
        console.error("Error deleting fee:", error);
        toast.error("An error occurred while deleting the fee.");
    } finally {
       setIsLoader(false);
    }
  };

  const handleEdit = (item) => {
    setEditMode(true);
    setFormData({
      // Assuming your API returns an id or you use feeStructureId
      id: item.feeStructureId, // Make sure item has an identifier
      className: item.className,
      name: item.name,
      feeType: item.feeType,
      amount: item.amount,
    });
    setModalOpen(true);
  };

  // --- Table Configuration ---
  const THEAD = [
    { id: "SN", label: "S No.", width: "5" },
    { id: "class", label: "Class", width: "7" },
    { id: "name", label: "Name", width: "7" },
    { id: "feetype", label: "fee Type" },
    { id: "amount", label: "Amount" },
    { id: "action", label: "Action" },
  ];

  // Generate table body using the FILTERED list
  const tBody = filteredAdditionFee.map((val, ind) => ({
    SN: ind + 1,
    class: (
      <span className="text-green-800 font-semibold">{val.className}</span>
    ),
    name: val.name,
    feetype: val.feeType,
    amount: val.amount,
    action: (
      <div className="flex justify-center gap-2">
         <button
                  title="Edit Student"
                  onClick={() => handleEdit(val)}
                  className="text-yellow-600 hover:text-yellow-800 text-lg"
                >
                  <FaEdit />
                </button>
         {/* <span onClick={() => handleEdit(val)} className="cursor-pointer">
           <MdEdit className="text-[25px] text-blue-700" />
         </span> */}
        
        <span onClick={() => handleDelete(val?.feeStructureId)} className="cursor-pointer">
          <MdDelete className="text-[25px] text-red-700" />
        </span>
      </div>
    ),
  }));


  return (
    <div className=""> {/* Added padding */}
     <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.student} title="Additional Fee"/>
      <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-col md:flex-row  items-center gap-4">
        
        <Button
               name="Set Additional Fee"
               onClick={() => {
                 setEditMode(false);
                 // Reset form when opening for new entry
                 setFormData({ className: "", name: "", feeType: "", amount: "" });
                 setModalOpen(true);
               }}
             />
            <ReactSelect
                name="filterClass" // Different name for clarity
                value={selectedClass} // Bind to filter state
                handleChange={handleFilterClassChange} // Use filter handler
                label="Filter by Class"
                dynamicOptions={filterClassOptions} // Use options with "All Classes"
             />
       
      </div>


      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Additional Fee" : "Create Additional Fee"}>
        <div className="p-4 space-y-4 bg-gray-50">
          <div className="grid gap-6 md:grid-cols-2">

            {/* Modal Class Select */}
            <ReactSelect
              name="className" // Matches formData key
              value={formData.className} // Bind to formData
              handleChange={handleFieldChange} // Use general field handler
              label="Select a Class *"
              dynamicOptions={modalClassOptions} // Use options without "All Classes"
              required={true}
            />
            {/* Modal Fee Type Select */}
            <ReactSelect
              name="feeType" // Matches formData key
              value={formData.feeType} // Bind to formData
              handleChange={handleFieldChange} // Use general field handler
              label="Select Fee Type *"
              dynamicOptions={feeType}
              required={true}
            />

            <ReactInput
              type="text"
              name="name" // Matches formData key
              required={true}
              label="Name *"
              onChange={handleFieldChange} // Use general field handler
              value={formData.name} // Bind to formData
              disabled={editMode?true:false}
            />
             <ReactInput
              type="number"
              name="amount" // Matches formData key
              required={true}
              label="Amount *"
              onChange={handleFieldChange} // Use general field handler
              value={formData.amount} // Bind to formData
            />

          </div>

          <div className="flex justify-end pt-2"> {/* Align button */}
             <Button
                name={editMode ? "Update Fee" : "Submit Fee"}
                // variant="contained"
                // style={{ backgroundColor: currentColor }}
                onClick={handleSubmit}
              />
          </div>
        </div>
      </Modal>
      <Table tHead={THEAD} tBody={tBody} />
      {filteredAdditionFee.length === 0 && !setIsLoader && ( // Show message if table is empty and not loading
         <p className="text-center text-gray-500 mt-4">No additional fees found{selectedClass ? ` for class ${selectedClass}` : ''}.</p>
      )}
    </div>
  );
}

export default AdditionalFee;

