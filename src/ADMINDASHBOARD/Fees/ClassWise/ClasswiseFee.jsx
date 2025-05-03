import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa"; // Assuming you want to use FaEdit for edit button
import { MdDelete } from "react-icons/md";

import NoDataFound from "../../../NoDataFound";
import Modal from "../../../Dynamic/Modal";
import { useStateContext } from "../../../contexts/ContextProvider";
import { AdminGetAllClasses, adminRoutefeesregular, deletefees, editFees, getfees } from "../../../Network/AdminApi"; // Make sure adminRoutefeesregular handles PUT/PATCH for updates if needed
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
import Table from "../../../Dynamic/Table";
import Button from "../../../Dynamic/utils/Button";
import PageHeaderWithBreadcrumb from "../../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../../Dynamic/BreadcrumbList";

function ClasswiseFee() {
  const { currentColor, setIsLoader } = useStateContext();
  const initialFormData = { className: "", feeType: "", amount: "" };
  const [formData, setFormData] = useState(initialFormData);
  const [feesData, setFeesData] = useState([]);
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(""); // Keep for modal's class selection
  const [modalOpen, setModalOpen] = useState(false);
  // Removed loading state as setIsLoader from context is used
  const [editMode, setEditMode] = useState(false);
  const [editItemId, setEditItemId] = useState(null);
  // Fetch fees
  const getfee = async () => {
    setIsLoader(true); // Start loader
    try {
      const response = await getfees();
      if (response?.success) {
        setFeesData(response?.data || []); // Ensure it's an array
      } else {
        toast.error(response?.message || "Failed to fetch fees");
      }
    } catch (error) {
      console.error("Error fetching fees:", error);
      
    } finally {
      setIsLoader(false); // Stop loader
    }
  };

  // Fetch classes
  const getAllClasses = async () => {
     // No separate loader needed if getfee covers it initially
    try {
      const response = await AdminGetAllClasses();
      if (response?.success) {
        let classes = response.classes || [];
        // Sort classes if needed, assuming className is sortable
        setGetClass(classes.sort((a, b) => (a.className > b.className ? 1 : -1)));
      } else {
        toast.error(response?.message || "Failed to fetch classes");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("An error occurred while fetching classes.");
    }
  };

  useEffect(() => {
    getfee();
    getAllClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch on mount

  // Handle input changes for the modal form
  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle class selection change specifically for the modal form
   const handleClassChange = (e) => {
     const selectedClassName = e.target.value;
     setSelectedClass(selectedClassName); // Keep track of the selected class string
     setFormData((prev) => ({
       ...prev,
       className: selectedClassName, // Update formData as well
     }));
   };

  // Function to open the modal for creating a new fee
  const handleOpenCreateModal = () => {
    setEditMode(false);
    setEditItemId(null);
    setFormData(initialFormData); // Reset form
    setSelectedClass(""); // Reset selected class
    setModalOpen(true);
  };

  // Function to open the modal for editing an existing fee
  const handleEdit = (item) => {
    setEditMode(true);
    setEditItemId(item.feeStructureId);
    // Pre-fill form data with the item's details
    setFormData({
      className: item.className,
      feeType: item.feeType,
      amount: item.amount,
    });
    setSelectedClass(item.className); // Set the selected class for the dropdown
    setModalOpen(true);
  };

  // Close modal and reset state
  const closeModal = () => {
    setModalOpen(false);
    setEditMode(false);
    setEditItemId(null);
    setFormData(initialFormData);
    setSelectedClass("");
  };

  // Handle form submission (Create or Update)
  const handleFormSubmit = async () => {
    setIsLoader(true);
    try {
        let response;
        if (editMode) {
          const payload = {
                 amount: formData.amount
             };
            response = await editFees(payload, editItemId); // Pass ID for update
        } else {
            // Create requires full data
            if (!formData.className || !formData.feeType || !formData.amount) {
                 toast.error("Please fill all fields.");
                 setIsLoader(false);
                 return;
            }
             response = await adminRoutefeesregular(formData); // No ID for create
        }

      if (response?.success) {
        toast.success(editMode ? "Fee updated successfully!" : "Fee set successfully!");
        getfee(); // Refresh data
        closeModal(); // Close modal on success
      } else {
        toast.error(response?.message || (editMode ? "Failed to update fee." : "Failed to set fee."));
      }
    } catch (error) {
      console.error("Error submitting fee:", error);
      toast.error("An error occurred while saving the fee.");
    } finally {
      setIsLoader(false);
    }
  };


  // Handle deletion
  const handleDelete = async (id) => {
    // Optional: Add confirmation dialog
    if (!window.confirm("Are you sure you want to delete this fee entry?")) {
        return;
    }

    setIsLoader(true);
    const payload = { id: id }; // Ensure API expects { id: id }
    try {
      // Make sure deletefees expects the payload structure { id: id }
      const response = await deletefees(payload);
      if (response?.success) {
        toast.success(response?.message || "Fee deleted successfully!");
        getfee(); // Refresh data
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


  // Prepare class options for ReactSelect
  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className, // Use className as value if that's what formData expects
  }));


  const THEAD = [
    { id: "SN", label: "S No.", width: "5" },
    { id: "class", label: "Class", width: "7" },
    { id: "feetype", label: "Fee Type" },
    { id: "amount", label: "Amount" },
    { id: "action", label: "Action" },
  ];

  // Prepare table body data
  const tBody = feesData.map((val, ind) => ({
    SN: ind + 1,
    class: <span className="font-semibold">{val.className}</span>, // Removed text-green-800 unless needed
    feetype: val.feeType,
    amount: val.amount, // Display static amount, editing happens in modal
    // class: val.className, // This seems redundant if 'class' key already exists
    action: (
      <div className="flex items-center justify-center gap-2"> {/* Use gap for spacing */}
        {/* Edit Button */}
        <span
          onClick={() => handleEdit(val)} // Pass the whole item to handleEdit
          className="cursor-pointer text-blue-600 hover:text-blue-800"
          title="Edit"
        >
          <FaEdit className="text-[20px]" /> {/* Use FaEdit icon */}
        </span>

        {/* Delete Button */}
        <span
          onClick={() => handleDelete(val?.feeStructureId)}
          className="cursor-pointer text-red-600 hover:text-red-800"
          title="Delete"
        >
          <MdDelete className="text-[22px]" />
        </span>
      </div>
    ),
  }));

  return (
    <div className=""> {/* Add some padding */}
      <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.student} title="Class Fee"/>

      <div className="bg-white p-2 rounded-lg shadow border border-gray-200"> {/* Margin bottom and align button */}
        <Button
          name="Set New Fee"
          onClick={handleOpenCreateModal} 
        />
      </div>

      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Class Fee" : "Create Class Fee"}>
        <div className="p-4 space-y-4"> {/* Removed bg-gray-50 unless specifically desired */}
          <div className="grid gap-4 md:grid-cols-2"> {/* Simplified gap */}
            <div>
              {/* Disable Class selection during edit mode */}
              <ReactSelect
                name="className" // Name should match formData key
                value={selectedClass} // Controlled by selectedClass state
                handleChange={handleClassChange}
                label="Select Class"
                dynamicOptions={dynamicOptions}
                isDisabled={editMode} // Disable when editing
              />
            </div>
            <div>
              {/* Disable Fee Type selection during edit mode */}
              <ReactSelect
                name="feeType" // Name should match formData key
                value={formData.feeType} // Controlled by formData
                handleChange={handleFieldChange}
                label="Fee Type"
                dynamicOptions={[
                  { label: "Monthly", value: "Monthly" },
                  { label: "Quarterly", value: "Quarterly" },
                  { label: "Half Yearly", value: "Half Yearly" },
                  { label: "Annually", value: "Annually" },
                ]}
                 isDisabled={editMode} // Disable when editing
              />
            </div>
          </div>

          <div>
            <ReactInput
              type="number"
              name="amount" // Name should match formData key
              required={true} // Amount should likely be required
              label="Amount"
              onChange={handleFieldChange}
              value={formData.amount}
              placeholder="Enter amount"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4"> {/* Added padding top */}
            <Button
              name={editMode ? "Update" : "Submit"}
              onClick={handleFormSubmit} // Single handler for submit/update
             // style={{ backgroundColor: currentColor, color: "white" }}
            />
            <Button
              name="Cancel"
            //   color="gray" // Assuming Button component handles color prop
            //   variant="contained" // Use props your Button understands
              onClick={closeModal}
              // style={{ backgroundColor: "#616161", color: "white" }}
            />
          </div>
        </div>
      </Modal>

      {/* Table or No Data Message */}
      {feesData.length > 0 ? (
        <Table tHead={THEAD} tBody={tBody} />
      ) : (
        // Conditionally render NoDataFound only after initial load attempt
        !setIsLoader && <NoDataFound /> // Check context loader state if available, or manage loading state locally
        // Or simply:
        // <NoDataFound /> // If okay to show immediately if feesData is empty
      )}
    </div>
  );
}

export default ClasswiseFee;
