import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { FaEdit } from "react-icons/fa"; // Assuming you want to use FaEdit for edit button
import { MdDelete } from "react-icons/md";
// Remove useCustomQuery if not used elsewhere
// import useCustomQuery from "../../../useCustomQuery";

import NoDataFound from "../../../NoDataFound";
import Modal from "../../../Dynamic/Modal";
import { useStateContext } from "../../../contexts/ContextProvider";
import { AdminGetAllClasses, adminRoutefeesregular, deletefees, editFees, getfees } from "../../../Network/AdminApi"; // Make sure adminRoutefeesregular handles PUT/PATCH for updates if needed
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
import Table from "../../../Dynamic/Table";
import Button from "../../../Dynamic/utils/Button";

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
console.log("editMode",editMode)
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
      toast.error("An error occurred while fetching fees.");
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
        // *** Crucial Check: Ensure API function handles update correctly ***
        // Assuming adminRoutefeesregular can handle both create (POST) and update (PUT/PATCH)
        // If they are different API calls, you'll need separate functions.
        // If update needs only specific fields, adjust the payload.

        if (editMode) {
            // Update requires ID and potentially only the fields changed
            // Adjust payload based on your API's update requirement
             const payload = {
                 // Include fields your update API expects. Often just the changed ones.
                 // If only amount is updatable:
                 amount: formData.amount
                 // If className/feeType are also updatable (unlikely for structure ID based update):
                 // className: formData.className,
                 // feeType: formData.feeType,
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
    <div className="p-4"> {/* Add some padding */}
      <div className="mb-4 flex justify-end"> {/* Margin bottom and align button */}
        <Button
          name="Set New Fee"
          onClick={handleOpenCreateModal} // Use specific handler for clarity
          // style={{ backgroundColor: currentColor }} // Apply context color if needed
        />
      </div>

      {/* Modal for Create/Edit */}
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



// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";

// import { FaEdit } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";
// import useCustomQuery from "../../../useCustomQuery";

// import NoDataFound from "../../../NoDataFound";
// import Modal from "../../../Dynamic/Modal";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import { AdminGetAllClasses, adminRoutefeesregular, deletefees, getfees } from "../../../Network/AdminApi";
// import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
// import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
// import Table from "../../../Dynamic/Table";
// import Button from "../../../Dynamic/utils/Button";
// function ClasswiseFee() {
//   const { currentColor, setIsLoader } = useStateContext();
//   const [formData, setFormData] = useState({ className: "", feeType: "", amount: "" });
//   const [feesData, setFeesData] = useState([])
//   const [getClass, setGetClass] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [editItemId, setEditItemId] = useState(null);

//   const getfee = async () => {
//     try {
//       const response = await getfees()
//       if (response?.success) {
//         setFeesData(response?.data)
//       }
//       else {
//         toast.error(response?.message)
//       }
//     } catch (error) {
//       console.log("error", error)
//     }
//   }
//   useEffect(() => {
//     getfee()
//   }, [])

//   const GetAllClasses = async () => {
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         let classes = response.classes;
//         setGetClass(classes.sort((a, b) => a - b));
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   };
//   useEffect(() => {
//     GetAllClasses()
//   }, [])
//   const handleFieldChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     setIsLoader(true);
//     try {
//       const response = await adminRoutefeesregular(formData);
//       if (response?.success) {
//         toast.success("Fees set successfully !");
//         getfee();  // Refresh data
//         closeModal();
//         setModalOpen(false);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };
//   const handlUpdate = async () => {
//     setIsLoader(true);
//     const payload={
//         "amount": formData.amount
   
//     }
//     try {
//       const response = await adminRoutefeesregular(payload,editItemId);
//       if (response?.success) {
//         toast.success("Fees set successfully !");
//         getfee();  // Refresh data
//         closeModal();
//         setModalOpen(false);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };
  
//   const handleDelete = async (id) => {
//     const payload = {
//       id: id
//     }
//     try {
//       const response = await deletefees(payload)
//       if (response?.success) {
//         toast.success(response?.message)
//         getfee()
//       } else {
//         toast?.error(response?.message)
//       }
//     } catch (error) {
//       console.log("error", error)
//     }
//   }

//   const handleEdit = (ID) => {
//     setEditMode(true);
//     setEditItemId(ID);
//     // setFormData({
//     //   className: item.className,
//     //   feeType: item.feeType,
//     //   amount: item.amount,
//     // });
//     // setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setEditMode(false);
//     setEditItemId(null);
//     setFormData({ className: "", feeType: "", amount: "" });
//   };

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     setFormData((prev) => ({
//       ...prev,
//       className: selectedClassName,  // className update ho raha hai
//     }));
//   };
  

//   const dynamicOptions = getClass.map((cls) => ({
//     label: cls.className,
//     value: cls.className,
//   }));


//   const THEAD = [
//     { id: "SN", label: "S No.", width: "5" },
//     { id: "class", label: "Class", width: "7" },
//     { id: "feetype", label: "fee Type" },
//     { id: "amount", label: "Amount" },
//     { id: "action", label: "Action" },

//   ];

//   const tBody = feesData.map((val, ind) => ({
//     SN: ind + 1,

//     class: (
//       <span className="text-green-800 font-semibold">{val.className}</span>
//     ),
//     feetype: val.feeType,
//     amount: editMode?(<input type="number" name="amount" value={val?.amount} onChange={handleFieldChange}/>):val.amount,
//     class: val.className,

//     action: (<div className="flex justify-center">
//       <span onClick={() => handleEdit(val?.feeStructureId)} className="cursor-pointer">
//         {/* <MdDelete className="text-[25px] text-red-700" /> */}
//         edit
//       </span>
//       {
//         editMode && (<div>
//           <span onClick={() => handlUpdate()} className="cursor-pointer">Save</span>
//           <span onClick={() => setEditMode(false)} className="cursor-pointer">Cancel</span>
//         </div>)
//       }
//       <span onClick={() => handleDelete(val?.feeStructureId)} className="cursor-pointer">
//         <MdDelete className="text-[25px] text-red-700" />
//       </span>

//     </div>
//     ),
//   }));
//   return (
//     <div className="">

//       <div className="">
//         <Button
//         name="Set Fee"
//           // variant="contained"
//           // style={{ backgroundColor: currentColor }}
//           onClick={() => {
//             setEditMode(false);
//             setEditItemId(null);
//             setFormData({ className: "", feeType: "", amount: "" });
//             setModalOpen(true);
//           }}
//         />
          
        
//       </div>

//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Class Fee" : "Create Class Fee"}>
//         <div className="p-4 space-y-4 bg-gray-50">
//           <div className="grid gap-6 mb-6 md:grid-cols-2">
//             <div>
//               <ReactSelect
//                 name="studentClass"
//                 value={selectedClass}
//                 handleChange={handleClassChange}
//                 label="Select a Class"
//                 dynamicOptions={dynamicOptions}
//               />

//             </div>
//             <div>
//                 <ReactSelect
//                 name="feeType"
//                 value={formData.feeType}
//                 handleChange={handleFieldChange}
//                 label="Fee Type"
//                 dynamicOptions={[
//                   { label: "Monthly", value: "Monthly" },
//                   { label: "Quarterly", value: "Quarterly" },
//                   { label: "Half Yearly", value: "Half Yearly" },
//                   { label: "Annually", value: "Annually" },
//                 ]}
//               />


//             </div>
//           </div>

//           <div>
//             <ReactInput
//               type="number"
//               name="amount"
//               required={false}
//               label="Amount"
//               onChange={handleFieldChange}
//               value={formData.amount}
//             />
//           </div>

//           <div className="flex justify-end gap-3">
//             <Button 
//             // variant="contained"
//             name="Submit"
//              onClick={handleSubmit}
//               // style={{ backgroundColor: currentColor, color: "white" }}
//               >
//               {/* {loading ? "Processing..." : editMode ? "Update" : "Submit"} */}
//             </Button>
//             <Button 
//             name="Cancel"
//             color="gray"
//             // variant="contained"
//              onClick={closeModal}
//               // style={{ backgroundColor: "#616161", color: "white" }}
//               >
              
//             </Button>
//           </div>
//         </div>
//       </Modal>


//       {tBody.length > 0 ? (
//         <Table tHead={THEAD} tBody={tBody} />
//       ) : (
//         <NoDataFound />
//       )}
//     </div>
//   );
// }

// export default ClasswiseFee;


// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";

// import { FaEdit } from "react-icons/fa";
// import { MdDelete } from "react-icons/md";
// import useCustomQuery from "../../../useCustomQuery";

// import NoDataFound from "../../../NoDataFound";
// import Modal from "../../../Dynamic/Modal";
// import { useStateContext } from "../../../contexts/ContextProvider";
// import { AdminGetAllClasses, adminRoutefeesregular, deletefees, getfees } from "../../../Network/AdminApi";
// import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
// import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
// import Table from "../../../Dynamic/Table";
// import Button from "../../../Dynamic/utils/Button";
// function ClasswiseFee() {
//   const { currentColor, setIsLoader } = useStateContext();
//   const [formData, setFormData] = useState({ className: "", feeType: "", amount: "" });
//   const [feesData, setFeesData] = useState([])
//   const [getClass, setGetClass] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [editMode, setEditMode] = useState(false);
//   const [editItemId, setEditItemId] = useState(null);

//   const getfee = async () => {
//     try {
//       const response = await getfees()
//       if (response?.success) {
//         setFeesData(response?.data)
//       }
//       else {
//         toast.error(response?.message)
//       }
//     } catch (error) {
//       console.log("error", error)
//     }
//   }
//   useEffect(() => {
//     getfee()
//   }, [])

//   const GetAllClasses = async () => {
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         let classes = response.classes;
//         setGetClass(classes.sort((a, b) => a - b));
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   };
//   useEffect(() => {
//     GetAllClasses()
//   }, [])
//   const handleFieldChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async () => {
//     setIsLoader(true);
//     try {
//       const response = await adminRoutefeesregular(formData);
//       if (response?.success) {
//         toast.success("Fees set successfully !");
//         getfee();  // Refresh data
//         closeModal();
//         setModalOpen(false);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };
  
//   const handleDelete = async (id) => {
//     const payload = {
//       id: id
//     }
//     try {
//       const response = await deletefees(payload)
//       if (response?.success) {
//         toast.success(response?.message)
//         getfee()
//       } else {
//         toast?.error(response?.message)
//       }
//     } catch (error) {
//       console.log("error", error)
//     }
//   }

//   const handleEdit = (item) => {
//     setEditMode(true);
//     setEditItemId(item._id);
//     setFormData({
//       className: item.className,
//       feeType: item.feeType,
//       amount: item.amount,
//     });
//     setModalOpen(true);
//   };

//   const closeModal = () => {
//     setModalOpen(false);
//     setEditMode(false);
//     setEditItemId(null);
//     setFormData({ className: "", feeType: "", amount: "" });
//   };

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     setFormData((prev) => ({
//       ...prev,
//       className: selectedClassName,  // className update ho raha hai
//     }));
//   };
  

//   const dynamicOptions = getClass.map((cls) => ({
//     label: cls.className,
//     value: cls.className,
//   }));


//   const THEAD = [
//     { id: "SN", label: "S No.", width: "5" },
//     { id: "class", label: "Class", width: "7" },
//     { id: "feetype", label: "fee Type" },
//     { id: "amount", label: "Amount" },
//     { id: "action", label: "Action" },

//   ];

//   const tBody = feesData.map((val, ind) => ({
//     SN: ind + 1,

//     class: (
//       <span className="text-green-800 font-semibold">{val.className}</span>
//     ),
//     feetype: val.feeType,
//     amount: val.amount,
//     class: val.className,

//     action: (<div className="flex justify-center">
//       <span onClick={() => handleDelete(val?.feeStructureId)} className="cursor-pointer">
//         <MdDelete className="text-[25px] text-red-700" />
//       </span>

//     </div>
//     ),
//   }));
//   return (
//     <div className="">

//       <div className="">
//         <Button
//         name="Set Fee"
//           // variant="contained"
//           // style={{ backgroundColor: currentColor }}
//           onClick={() => {
//             setEditMode(false);
//             setEditItemId(null);
//             setFormData({ className: "", feeType: "", amount: "" });
//             setModalOpen(true);
//           }}
//         />
          
        
//       </div>

//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Class Fee" : "Create Class Fee"}>
//         <div className="p-4 space-y-4 bg-gray-50">
//           <div className="grid gap-6 mb-6 md:grid-cols-2">
//             <div>
//               <ReactSelect
//                 name="studentClass"
//                 value={selectedClass}
//                 handleChange={handleClassChange}
//                 label="Select a Class"
//                 dynamicOptions={dynamicOptions}
//               />

//             </div>
//             <div>
//                 <ReactSelect
//                 name="feeType"
//                 value={formData.feeType}
//                 handleChange={handleFieldChange}
//                 label="Fee Type"
//                 dynamicOptions={[
//                   { label: "Monthly", value: "Monthly" },
//                   { label: "Quarterly", value: "Quarterly" },
//                   { label: "Half Yearly", value: "Half Yearly" },
//                   { label: "Annually", value: "Annually" },
//                 ]}
//               />


//             </div>
//           </div>

//           <div>
//             <ReactInput
//               type="number"
//               name="amount"
//               required={false}
//               label="Amount"
//               onChange={handleFieldChange}
//               value={formData.amount}
//             />
//           </div>

//           <div className="flex justify-end gap-3">
//             <Button 
//             // variant="contained"
//             name="Submit"
//              onClick={handleSubmit}
//               // style={{ backgroundColor: currentColor, color: "white" }}
//               >
//               {/* {loading ? "Processing..." : editMode ? "Update" : "Submit"} */}
//             </Button>
//             <Button 
//             name="Cancel"
//             color="gray"
//             // variant="contained"
//              onClick={closeModal}
//               // style={{ backgroundColor: "#616161", color: "white" }}
//               >
              
//             </Button>
//           </div>
//         </div>
//       </Modal>


//       {tBody.length > 0 ? (
//         <Table tHead={THEAD} tBody={tBody} />
//       ) : (
//         <NoDataFound />
//       )}
//     </div>
//   );
// }

// export default ClasswiseFee;