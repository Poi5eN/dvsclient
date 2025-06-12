
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import { AdminGetAllClasses } from "../../Network/AdminApi";

const BulkFeesSet = () => {
  const [mode, setMode] = useState("create");
  const [classes, setClasses] = useState([]);
  const [existingFees, setExistingFees] = useState([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [isAdditional, setIsAdditional] = useState(false);
  const [count, setCount] = useState("");

  const [rows, setRows] = useState([{ amount: "", name: "" }]);
  const [loading, setLoading] = useState(false);
  // const [message, setMessage] = useState("");

  const token = localStorage.getItem('token');
  const api = axios.create({
    baseURL: "https://api.digitalvidyasaarthi.in/api/v1/adminRoute",
    headers: {
        Authorization: `Bearer ${token}`
      }
  });

   const getAllClass = async () => {
      try {
        const response = await AdminGetAllClasses();
        if (response?.success) {
          let classes = response.classes;
           setClasses(classes || []);
          // setGetClass(classes.sort((a, b) => a - b));
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    useEffect(()=>{
getAllClass()
    },)
  useEffect(() => {
    const fetchData = async () => {
      
      try {
        const [clsRes, feesRes] = await Promise.all([
          api.get("/class"),
          api.get("/fees"),
        ]);

        // ✅ FIX: Access the correct field from the response
        // setClasses(clsRes.data.classes || []);
        setExistingFees(feesRes.data.data || []);
      } catch (err) {
        console.log("error",err.message)
        // setMessage("Error fetching data: " + err.message);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const validCount = parseInt(count, 10);
    if (!isNaN(validCount) && validCount > 0) {
      let newRows = [];
      for (let i = 0; i < validCount; i++)
        newRows.push(rows[i] || { amount: "", name: "" });
      setRows(newRows);
    }
  }, [count]);

  const updateRow = (idx, field, val) => {
    const tmp = [...rows];
    tmp[idx] = { ...tmp[idx], [field]: val };
    setRows(tmp);
  };

  const loadFee = (fee) => {
    setMode("edit");
    setSelectedClass(fee.className);
    setFrequency(fee.frequency);
    setIsAdditional(fee.additional);
    setCount("1");
    setRows([{ amount: fee.amount, name: fee.name || "" }]);
  };

  const handleSubmit = async () => {
    const validCount = parseInt(count, 10);
    if (!selectedClass) return toast.warn("Please select a class.")
    if (!frequency) return  toast.warn("Please select a frequency.")
    if (!validCount || validCount < 1)
      return  toast.warn("Enter a valid count.")
    // setMessage("Enter a valid count.");
   

    setLoading(true);
    // setMessage("");
    try {
      const payload = {
        fees: rows.map((r) => ({
          className: selectedClass,
          feeType: frequency,
          additional: isAdditional,
          amount: Number(r.amount),
          ...(isAdditional ? { name: r.name } : {}),
        })),
      };
      const method = mode === "create" ? "post" : "put";
      const res = await api[method]("/fees/bulk", payload);
      // setMessage(`Success: ${res.data.message}`);
      toast.success(res.data.message)

      const feesRes = await api.get("/fees");
      setExistingFees(feesRes.data.data || []);

      // setCount("");
      // setRows([{ amount: ""}]);
      // setRows([{ amount: "", name: "" }]);
      setMode("create");
    } catch (err) {
      console.log("error",err.response?.data?.message || err.message)
      // setMessage("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };


  

  return (
    <div className="">
       <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Bulk Fees Setup "/>
                     <div className="bg-white p-2 rounded-lg shadow border border-gray-200">
      {/* <div className=" mx-auto bg-white "> */}
        {/* <h1 className="text-xl font-extrabold text-indigo-700 mb-2 text-center">
          Bulk Fees Setup 
        </h1> */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-full p-1 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select Class</option>
            {classes.map((c) => (
              <option key={c._id} value={c.className}>
                {c.className}
              </option>
            ))}
          </select>

          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value)}
            className="block w-full p-1 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="Monthly">Monthly</option>
            <option value="One Time">One Time</option>
          </select>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={count}
            onChange={(e) => setCount(e.target.value.replace(/\D/, ""))}
            className="block w-full p-1  px-4 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Fees count"
          />
        </div>

        <div className="flex mb-2 rounded-xl overflow-hidden border">
          <button
            onClick={() => setIsAdditional(false)}
            className={`flex-1 p-1 transition-all ${
              !isAdditional
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600"
            }`}
          >
            Regular
          </button>
          <button
            onClick={() => setIsAdditional(true)}
            className={`flex-1 p-1 transition-all ${
              isAdditional
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600"
            }`}
          >
            Additional
          </button>
        </div>

        {/* {message && (
          <div
            className={`p-4 mb-6 rounded-xl transition-all ${
              message.startsWith("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )} */}

        {mode === "edit" && (
          <div className="mb-2">
            <h2 className="text-xl font-semibold mb-4">Existing Fees</h2>
            <div className="space-y-3">
              {existingFees.map((f) => (
                <div
                  key={f.feeStructureId}
                  onClick={() => loadFee(f)}
                  className="p-4 bg-white border hover:shadow-lg cursor-pointer rounded-xl transition-all"
                >
                  <p>
                    <strong>Class:</strong> {f.className}
                  </p>
                  <p>
                    <strong>Freq:</strong> {f.frequency}
                  </p>
                  <p>
                    <strong>Additional:</strong> {f.additional ? "Yes" : "No"}
                  </p>
                  <p>
                    <strong>Amt:</strong> {f.amount}
                  </p>
                  {f.name && (
                    <p>
                      <strong>Name:</strong> {f.name}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="w-full flex flex-wrap  gap-2 mb-2">
          {rows.map((r, i) => (
            <div
              key={i}
              className="gap-2 p-1  rounded-xl"
            >
              <span className="mr-1">
                ({i+1})
              </span>
              {isAdditional && (
                <input
                  type="text"
                  placeholder="Fee Name"
                  value={r.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                  className=" p-1 max-w-[200px] px-4 border text-black bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              )}
              <input
                type="number"
                placeholder="Amount"
                value={r.amount}
                onChange={(e) => updateRow(i, "amount", e.target.value)}
                className=" ml-2 w-[100px] p-1 px-4 border text-black bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
             
            </div>
          ))}
        </div>

        <div className="w-full flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="py-1 px-3 text-sm tet bg-green-600 text-end text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-all"
        >
          {loading
            ? "Processing..."
            : mode === "create"
            ? "Submit"
            : "Update Fee"}
        </button>
        </div>
      </div>
    </div>
  );
};

export default BulkFeesSet;



// import React, { useState, useEffect } from 'react';
// import axios from 'axios';

// // Define API endpoints (better practice than hardcoding)
// const API_BASE_URL = '/api'; // Or your actual base URL (e.g., http://localhost:5000/api)
// const CLASSES_ENDPOINT = `${API_BASE_URL}/classes`;
// const FEES_ENDPOINT = `${API_BASE_URL}/fees`;
// const BULK_CREATE_ENDPOINT = `${API_BASE_URL}/fees/bulk-create`;
// const BULK_EDIT_ENDPOINT = `${API_BASE_URL}/fees/bulk-edit`;

// const BulkFeeManagement = () => {
//     const [mode, setMode] = useState('create'); // 'create' or 'edit'
//     // Initial state for a single empty fee row in create mode
//     const initialFeeRow = { className: '', feeType: '', amount: '', name: '', studentId: '', lateFineDueDay: '' };
//     const [fees, setFees] = useState([initialFeeRow]);
//     const [existingFees, setExistingFees] = useState([]);
//     const [classes, setClasses] = useState([]);
//     // Consider fetching fee types from API if they are dynamic
//     const [feeTypes, setFeeTypes] = useState(['Tuition', 'Transport', 'Library', 'LateFine', 'Admission', 'Exam', 'Miscellaneous']);
//     const [loading, setLoading] = useState(false);
//     const [message, setMessage] = useState('');
//     const [error, setError] = useState('');

//     // --- Helper function to get Auth Headers ---
//     const getAuthHeaders = () => {
//         const token = localStorage.getItem('token');
//         if (!token) {
//             console.error("Authentication token not found.");
//             // Handle missing token scenario, maybe redirect to login
//             setError("Authentication required. Please log in.");
//             return null;
//         }
//         return { Authorization: `Bearer ${token}` };
//     };

//     // --- Fetch initial data (classes and existing fees) ---
//     useEffect(() => {
//         const fetchData = async () => {
//             setLoading(true);
//             setMessage('');
//             setError('');
//             const headers = getAuthHeaders();
//             if (!headers) {
//                 setLoading(false);
//                 return; // Stop if no token
//             }

//             try {
//                 // Fetch classes
//                 const classesResponse = await axios.get(CLASSES_ENDPOINT, { headers });
//                 // Assuming response structure is { data: { data: [...] } } or similar
//                 setClasses(classesResponse.data?.data || classesResponse.data || []);

//                 // Fetch existing fees (needed for edit mode selector)
//                 const feesResponse = await axios.get(FEES_ENDPOINT, { headers });
//                 setExistingFees(feesResponse.data?.data || feesResponse.data || []);

//             } catch (err) {
//                 console.error("Error fetching data:", err);
//                 setError(`Error fetching initial data: ${err.response?.data?.message || err.message}`);
//                 setClasses([]); // Reset on error
//                 setExistingFees([]); // Reset on error
//             } finally {
//                 setLoading(false);
//             }
//         };
//         fetchData();
//         // No dependencies needed if it should only run once on mount
//         // Add dependencies like [authToken] if fetching should re-run when token changes
//     }, []); // Empty dependency array: runs once on mount


//     // --- Form Row Management ---
//     const addFeeRow = () => {
//         setFees([...fees, { ...initialFeeRow }]); // Use spread of initial state
//     };

//     const updateFeeRow = (index, field, value) => {
//         const updatedFees = fees.map((fee, i) => {
//             if (i === index) {
//                 return { ...fee, [field]: value };
//             }
//             return fee;
//         });
//         setFees(updatedFees);
//     };

//     const removeFeeRow = (index) => {
//         // Prevent removing the last row if only one exists in create mode
//         if (mode === 'create' && fees.length === 1) return;
//         setFees(fees.filter((_, i) => i !== index));
//     };


//     // --- Handle Form Submission ---
//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);
//         setMessage('');
//         setError('');
//         const headers = getAuthHeaders();
//         if (!headers) {
//             setLoading(false);
//             return; // Stop if no token
//         }

//         // Basic Validation (Example: check if amount is present)
//         const invalidRow = fees.find(fee => !fee.amount || fee.amount <= 0 || (mode === 'create' && (!fee.className || !fee.feeType)));
//         if (invalidRow) {
//             setError("Please ensure all required fields (Class, Fee Type, Amount) are filled correctly for each row.");
//             setLoading(false);
//             return;
//         }


//         try {
//             let response;
//             if (mode === 'create') {
//                 const payload = { fees }; // Send the array of fee objects
//                 response = await axios.post(BULK_CREATE_ENDPOINT, payload, { headers });
//                 setMessage(`Success: ${response.data?.message || 'Fees created successfully!'}`);
//                 setFees([initialFeeRow]); // Reset form after successful creation
//             } else { // Edit mode
//                 // Ensure feeStructureId exists for editing
//                  if (!fees[0]?.feeStructureId) {
//                     setError("Cannot edit fee. Fee ID is missing. Please select a fee to edit again.");
//                     setLoading(false);
//                     return;
//                  }
//                 // Payload for editing typically includes ID and fields to update
//                 const payload = {
//                     // Assuming bulk edit takes an array, even if we edit one at a time here
//                     fees: fees.map(fee => ({
//                         feeStructureId: fee.feeStructureId, // Crucial for identifying which fee to edit
//                         amount: fee.amount,
//                         lateFineDueDay: fee.lateFineDueDay || null, // Send null if empty/not applicable
//                         // Include other editable fields if your API supports them
//                     }))
//                 };
//                  // In this component's current edit logic, it only edits one fee at a time.
//                  // If your API expects a single object for PUT:
//                  // const singlePayload = {
//                  //     amount: fees[0].amount,
//                  //     lateFineDueDay: fees[0].lateFineDueDay || null,
//                  // };
//                  // response = await axios.put(`${FEES_ENDPOINT}/${fees[0].feeStructureId}`, singlePayload, { headers });

//                 // Using the Bulk Edit endpoint as per the original logic:
//                 response = await axios.put(BULK_EDIT_ENDPOINT, payload, { headers });

//                 setMessage(`Success: ${response.data?.message || 'Fees updated successfully!'}`);
//                 // Refresh existing fees list after successful edit
//                 const feesResponse = await axios.get(FEES_ENDPOINT, { headers });
//                 setExistingFees(feesResponse.data?.data || feesResponse.data || []);
//                  // Optionally reset form or switch back to create mode
//                  setMode('create'); // Switch back to create mode after edit
//                  setFees([initialFeeRow]); // Reset form
//             }


//         } catch (err) {
//             console.error("Error submitting fees:", err);
//             setError(`Error: ${err.response?.data?.message || err.message}`);
//         } finally {
//             setLoading(false);
//         }
//     };

//     // --- Load existing fee data into the form for editing ---
//     const loadExistingFeeForEdit = (feeToEdit) => {
//         setFees([{ // Set fees state to an array containing only the fee to edit
//             feeStructureId: feeToEdit.feeStructureId, // Keep track of the ID
//             className: feeToEdit.className || '',
//             feeType: feeToEdit.feeType || '',
//             amount: feeToEdit.amount || '',
//             name: feeToEdit.name || '',
//             studentId: feeToEdit.studentId || '',
//             lateFineDueDay: feeToEdit.lateFineDueDay || '',
//         }]);
//         setMode('edit'); // Switch to edit mode
//         setMessage(''); // Clear previous messages
//         setError('');
//     };

//     // --- Switch Mode ---
//     const handleModeChange = (newMode) => {
//         setMode(newMode);
//         setFees([initialFeeRow]); // Reset form when switching modes
//         setMessage('');
//         setError('');
//     }

//     // --- Render Logic ---
//     return (
//         // Using min-h-screen ensures the gradient covers the full viewport height
//         <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 md:p-8">
//             <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8">
//                 <h1 className="text-2xl md:text-3xl font-bold text-indigo-700 mb-6 text-center">Bulk Fee Management</h1>

//                 {/* Mode Toggle Buttons */}
//                 <div className="flex justify-center mb-6">
//                     <button
//                         className={`px-4 py-2 rounded-l-lg text-sm md:text-base transition-colors duration-200 ${mode === 'create' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                         onClick={() => handleModeChange('create')}
//                     >
//                         Create New Fees
//                     </button>
//                     <button
//                         className={`px-4 py-2 rounded-r-lg text-sm md:text-base transition-colors duration-200 ${mode === 'edit' ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
//                         onClick={() => handleModeChange('edit')}
//                     >
//                         Edit Existing Fees
//                     </button>
//                 </div>

//                 {/* Message & Error Display */}
//                 {message && (
//                     <div className="mb-4 p-3 rounded-lg bg-green-100 text-green-800 border border-green-200 text-sm">
//                         {message}
//                     </div>
//                 )}
//                 {error && (
//                     <div className="mb-4 p-3 rounded-lg bg-red-100 text-red-800 border border-red-200 text-sm">
//                         {error}
//                     </div>
//                 )}

//                 {/* Existing Fees Selection (Visible only in Edit Mode before selection) */}
//                 {mode === 'edit' && fees.length === 1 && !fees[0].feeStructureId && (
//                      <div className="mb-6 p-4 border rounded-lg bg-gray-50">
//                         <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Select Fee to Edit</h2>
//                         {loading && <p className="text-gray-500">Loading existing fees...</p>}
//                         {!loading && existingFees.length === 0 && <p className="text-gray-500">No existing fees found to edit.</p>}
//                         <div className="max-h-60 overflow-y-auto space-y-2 pr-2">
//                             {existingFees.map((fee) => (
//                                 <div
//                                     key={fee.feeStructureId}
//                                     className="p-3 bg-white rounded-md border border-gray-200 hover:bg-indigo-50 hover:shadow-sm cursor-pointer transition-all duration-150"
//                                     onClick={() => loadExistingFeeForEdit(fee)}
//                                 >
//                                     <p className="font-medium text-gray-700">
//                                         Class: <span className="font-semibold text-indigo-600">{fee.className}</span> | Type: <span className="font-semibold text-indigo-600">{fee.feeType}</span> | Amount: <span className="font-semibold text-green-600">₹{fee.amount}</span>
//                                     </p>
//                                     {(fee.name || fee.studentId || fee.lateFineDueDay) && (
//                                          <p className="text-xs text-gray-500 mt-1">
//                                              {fee.name && `Name: ${fee.name} | `}
//                                              {fee.studentId && `Student ID: ${fee.studentId} | `}
//                                              {fee.lateFineDueDay && `Late Fine Due Day: ${fee.lateFineDueDay}`}
//                                          </p>
//                                     )}
//                                 </div>
//                             ))}
//                         </div>
//                     </div>
//                 )}

//                 {/* Fee Input Form Area (Visible in Create mode or after selecting a fee in Edit mode) */}
//                 { (mode === 'create' || (mode === 'edit' && fees[0]?.feeStructureId)) && (
//                     <form onSubmit={handleSubmit}>
//                         <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">
//                             {mode === 'create' ? 'Enter New Fee Details' : `Editing Fee for Class: ${fees[0]?.className}, Type: ${fees[0]?.feeType}`}
//                         </h2>
//                         {/* Fee Rows */}
//                         <div className="space-y-6">
//                             {fees.map((fee, index) => (
//                                 <div key={index} className="p-4 md:p-6 bg-gray-50 border border-gray-200 rounded-lg relative">
//                                      {/* Remove Button for Create Mode */}
//                                     {mode === 'create' && fees.length > 1 && (
//                                         <button
//                                             type="button" // Prevent form submission
//                                             onClick={() => removeFeeRow(index)}
//                                             className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-medium"
//                                             title="Remove this row"
//                                         >
//                                             × Remove
//                                         </button>
//                                     )}
//                                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//                                         {/* Class Name */}
//                                         <div>
//                                             <label htmlFor={`className-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
//                                             <select
//                                                 id={`className-${index}`}
//                                                 value={fee.className}
//                                                 onChange={(e) => updateFeeRow(index, 'className', e.target.value)}
//                                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
//                                                 required={mode === 'create'}
//                                                 disabled={mode === 'edit'} // Cannot change class in edit mode
//                                             >
//                                                 <option value="">-- Select Class --</option>
//                                                 {classes.map((cls) => (
//                                                     // Assuming classes are strings, adjust if they are objects
//                                                     <option key={cls} value={cls}>{cls}</option>
//                                                 ))}
//                                             </select>
//                                         </div>

//                                         {/* Fee Type */}
//                                         <div>
//                                             <label htmlFor={`feeType-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Fee Type</label>
//                                             <select
//                                                 id={`feeType-${index}`}
//                                                 value={fee.feeType}
//                                                 onChange={(e) => updateFeeRow(index, 'feeType', e.target.value)}
//                                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
//                                                 required={mode === 'create'}
//                                                 disabled={mode === 'edit'} // Cannot change fee type in edit mode
//                                             >
//                                                 <option value="">-- Select Fee Type --</option>
//                                                 {feeTypes.map((type) => (
//                                                     <option key={type} value={type}>{type}</option>
//                                                 ))}
//                                             </select>
//                                         </div>

//                                         {/* Amount */}
//                                         <div>
//                                             <label htmlFor={`amount-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Amount (₹)</label>
//                                             <input
//                                                 id={`amount-${index}`}
//                                                 type="number"
//                                                 value={fee.amount}
//                                                 onChange={(e) => updateFeeRow(index, 'amount', e.target.value)}
//                                                 className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
//                                                 placeholder="e.g., 1500"
//                                                 required
//                                                 min="0" // Prevent negative amounts
//                                             />
//                                         </div>

//                                         {/* Fee Name (Optional, only for 'create') */}
//                                         {mode === 'create' && (
//                                             <div>
//                                                 <label htmlFor={`name-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Fee Name <span className="text-xs text-gray-500">(Optional)</span></label>
//                                                 <input
//                                                     id={`name-${index}`}
//                                                     type="text"
//                                                     value={fee.name}
//                                                     onChange={(e) => updateFeeRow(index, 'name', e.target.value)}
//                                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
//                                                     placeholder="e.g., Annual Sports Fee"
//                                                     disabled={mode === 'edit'} // Typically not editable
//                                                 />
//                                             </div>
//                                         )}

//                                         {/* Student ID (Optional, only for 'create') */}
//                                          {mode === 'create' && (
//                                             <div>
//                                                 <label htmlFor={`studentId-${index}`} className="block text-sm font-medium text-gray-700 mb-1">Student ID <span className="text-xs text-gray-500">(Optional)</span></label>
//                                                 <input
//                                                     id={`studentId-${index}`}
//                                                     type="text"
//                                                     value={fee.studentId}
//                                                     onChange={(e) => updateFeeRow(index, 'studentId', e.target.value)}
//                                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm disabled:bg-gray-200 disabled:cursor-not-allowed"
//                                                     placeholder="For student-specific fee"
//                                                     disabled={mode === 'edit'} // Typically not editable
//                                                 />
//                                             </div>
//                                         )}

//                                         {/* Late Fine Due Day (Conditional) */}
//                                         {/* Show always in edit mode if it exists, show conditionally in create mode */}
//                                         {(fee.feeType === 'LateFine' || (mode === 'edit' && fee.lateFineDueDay)) && (
//                                             <div>
//                                                 <label htmlFor={`lateFineDueDay-${index}`} className="block text-sm font-medium text-gray-700 mb-1">
//                                                     Late Fine Due Day
//                                                     {fee.feeType !== 'LateFine' && mode === 'create' && <span className="text-xs text-gray-500"> (Only for LateFine type)</span>}
//                                                 </label>
//                                                 <input
//                                                     id={`lateFineDueDay-${index}`}
//                                                     type="number"
//                                                     value={fee.lateFineDueDay}
//                                                     onChange={(e) => updateFeeRow(index, 'lateFineDueDay', e.target.value)}
//                                                     className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 text-sm"
//                                                     placeholder="Day of month (e.g., 10)"
//                                                     min="1"
//                                                     max="31"
//                                                     // Only required if the fee type is specifically 'LateFine'
//                                                     required={fee.feeType === 'LateFine'}
//                                                 />
//                                             </div>
//                                         )}
//                                     </div> {/* End grid */}
//                                 </div> // End fee row container
//                             ))}
//                         </div> {/* End space-y container for rows */}

//                         {/* Add Row Button (Create Mode Only) */}
//                         {mode === 'create' && (
//                             <button
//                                 type="button" // Important: type="button"
//                                 onClick={addFeeRow}
//                                 className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
//                             >
//                                 + Add Another Fee Row
//                             </button>
//                         )}

//                         {/* Submit Button */}
//                         <div className="mt-8 pt-5 border-t border-gray-200">
//                              <button
//                                 type="submit" // Default type is submit, explicitly added for clarity
//                                 disabled={loading}
//                                 className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
//                             >
//                                 {loading ? (
//                                     <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                                     </svg>
//                                 ) : null}
//                                 {loading ? 'Processing...' : mode === 'create' ? 'Submit New Fees' : 'Update Selected Fee'}
//                             </button>
//                         </div>
//                     </form>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default BulkFeeManagement;



// // import React from 'react'

// // const BulkSetFees = () => {
// //   return (
// //     <div>BulkSetFees</div>
// //   )
// // }

// // export default BulkSetFees