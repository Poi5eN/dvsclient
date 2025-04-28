// import React, { useState, useEffect } from "react";
// import axios from "axios";

// const BulkFeesSet = () => {
//   const [mode, setMode] = useState("create");
//   const [classList, setClassList] = useState([]);
//   const [existingFees, setExistingFees] = useState([]);

//   const [selectedClass, setSelectedClass] = useState("");
//   const [frequency, setFrequency] = useState("monthly");
//   const [isAdditional, setIsAdditional] = useState(false);
//   const [count, setCount] = useState(1);

//   const [rows, setRows] = useState([{ amount: "", name: "" }]);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   const token = localStorage.getItem("token");
//   const api = axios.create({
//     baseURL: "https://dvsserver.onrender.com/api/v1/adminRoute",
//     headers: { Authorization: `Bearer ${token}` },
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [clsRes, feesRes] = await Promise.all([
//           api.get("/class"),
//           api.get("/fees"),
//         ]);
//         // Set classes from response
//         setClassList(
//           Array.isArray(clsRes.data.classes) ? clsRes.data.classes : []
//         );
//         setExistingFees(feesRes.data.data || []);
//       } catch (err) {
//         setMessage("Error fetching data: " + err.message);
//       }
//     };
//     fetchData();
//   }, []);

//   // Adjust rows when count changes
//   useEffect(() => {
//     const validCount = Number(count) || 1;
//     const newRows = [];
//     for (let i = 0; i < validCount; i++) {
//       newRows.push(rows[i] || { amount: "", name: "" });
//     }
//     setRows(newRows);
//   }, [count]);

//   const updateRow = (idx, field, val) => {
//     setRows((prev) =>
//       prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r))
//     );
//   };

//   const loadFee = (fee) => {
//     setMode("edit");
//     setSelectedClass(fee.className);
//     setFrequency(fee.frequency);
//     setIsAdditional(fee.additional);
//     setCount(1);
//     setRows([{ amount: fee.amount, name: fee.name || "" }]);
//   };

//   const handleSubmit = async () => {
//     const validCount = Number(count);
//     if (!selectedClass) return setMessage("Please select a class.");
//     if (!frequency) return setMessage("Please select a frequency.");
//     if (!validCount || validCount < 1)
//       return setMessage("Enter a valid count.");

//     setLoading(true);
//     setMessage("");
//     try {
//       const payload = {
//         fees: rows.map((r) => ({
//           className: selectedClass,
//           feeType: frequency,
//           additional: isAdditional,
//           amount: Number(r.amount),
//           ...(isAdditional ? { name: r.name } : {}),
//         })),
//       };
//       const method = mode === "create" ? "post" : "put";
//       const res = await api[method]("/fees/bulk", payload);
//       setMessage(`Success: ${res.data.message}`);

//       // Refresh
//       const feesRes = await api.get("/fees");
//       setExistingFees(feesRes.data.data || []);

//       // Reset form
//       setCount(1);
//       setRows([{ amount: "", name: "" }]);
//       setMode("create");
//     } catch (err) {
//       setMessage("Error: " + (err.response?.data?.message || err.message));
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-8">
//       <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl">
//         <h1 className="text-3xl font-extrabold text-indigo-700 mb-8 text-center">
//           Bulk Fees Setup
//         </h1>

//         {/* Top Controls */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <select
//             value={selectedClass}
//             onChange={(e) => setSelectedClass(e.target.value)}
//             className="block w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           >
//             <option value="">Select Class</option>
//             {classList.map((c) => (
//               <option key={c._id} value={c.className}>
//                 {c.className}
//               </option>
//             ))}
//           </select>

//           <select
//             value={frequency}
//             onChange={(e) => setFrequency(e.target.value)}
//             className="block w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
//           >
//             <option value="monthly">Monthly</option>
//             <option value="one-time">One Time</option>
//           </select>

//           <input
//             type="number"
//             min={1}
//             value={count}
//             onChange={(e) => setCount(e.target.value)}
//             className="block w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
//             placeholder="Fees count"
//           />
//         </div>

//         {/* Toggle Regular/Additional */}
//         <div className="flex mb-6 rounded-xl overflow-hidden border">
//           <button
//             onClick={() => setIsAdditional(false)}
//             className={`flex-1 p-3 transition-all ${
//               !isAdditional
//                 ? "bg-indigo-600 text-white"
//                 : "bg-white text-indigo-600"
//             }`}
//           >
//             Regular
//           </button>
//           <button
//             onClick={() => setIsAdditional(true)}
//             className={`flex-1 p-3 transition-all ${
//               isAdditional
//                 ? "bg-indigo-600 text-white"
//                 : "bg-white text-indigo-600"
//             }`}
//           >
//             Additional
//           </button>
//         </div>

//         {/* Feedback */}
//         {message && (
//           <div
//             className={`p-4 mb-6 rounded-xl transition-all ${
//               message.startsWith("Error")
//                 ? "bg-red-100 text-red-700"
//                 : "bg-green-100 text-green-700"
//             }`}
//           >
//             {message}
//           </div>
//         )}

//         {/* Existing Fees (Edit Mode) */}
//         {mode === "edit" && (
//           <div className="mb-6">
//             <h2 className="text-xl font-semibold mb-4">Existing Fees</h2>
//             <div className="space-y-3">
//               {existingFees.map((f) => (
//                 <div
//                   key={f.feeStructureId}
//                   onClick={() => loadFee(f)}
//                   className="p-4 bg-white border hover:shadow-lg cursor-pointer rounded-xl transition-all"
//                 >
//                   <p>
//                     <strong>Class:</strong> {f.className}
//                   </p>
//                   <p>
//                     <strong>Freq:</strong> {f.frequency}
//                   </p>
//                   <p>
//                     <strong>Additional:</strong> {f.additional ? "Yes" : "No"}
//                   </p>
//                   <p>
//                     <strong>Amt:</strong> {f.amount}
//                   </p>
//                   {f.name && (
//                     <p>
//                       <strong>Name:</strong> {f.name}
//                     </p>
//                   )}
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Fee Rows */}
//         <div className="space-y-4 mb-6">
//           {rows.map((r, i) => (
//             <div
//               key={i}
//               className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl"
//             >
//               <input
//                 type="number"
//                 placeholder="Amount"
//                 value={r.amount}
//                 onChange={(e) => updateRow(i, "amount", e.target.value)}
//                 className="w-1/3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
//               />
//               {isAdditional && (
//                 <input
//                   type="text"
//                   placeholder="Fee Name"
//                   value={r.name}
//                   onChange={(e) => updateRow(i, "name", e.target.value)}
//                   className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
//                 />
//               )}
//             </div>
//           ))}
//         </div>

//         {/* Submit Button */}
//         <button
//           onClick={handleSubmit}
//           disabled={loading}
//           className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-all"
//         >
//           {loading
//             ? "Processing..."
//             : mode === "create"
//             ? "Create Fees"
//             : "Update Fee"}
//         </button>
//       </div>
//     </div>
//   );
// };

// export default BulkFeesSet;

import React, { useState, useEffect } from "react";
import axios from "axios";

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
  const [message, setMessage] = useState("");

  const token = localStorage.getItem("token");
  const api = axios.create({
    baseURL: "https://dvsserver.onrender.com/api/v1/adminRoute",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clsRes, feesRes] = await Promise.all([
          api.get("/class"),
          api.get("/fees"),
        ]);

        // ✅ FIX: Access the correct field from the response
        setClasses(clsRes.data.classes || []);
        setExistingFees(feesRes.data.data || []);
      } catch (err) {
        setMessage("Error fetching data: " + err.message);
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
    if (!selectedClass) return setMessage("Please select a class.");
    if (!frequency) return setMessage("Please select a frequency.");
    if (!validCount || validCount < 1)
      return setMessage("Enter a valid count.");

    setLoading(true);
    setMessage("");
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
      setMessage(`Success: ${res.data.message}`);

      const feesRes = await api.get("/fees");
      setExistingFees(feesRes.data.data || []);

      setCount("");
      setRows([{ amount: "", name: "" }]);
      setMode("create");
    } catch (err) {
      setMessage("Error: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-xl">
        <h1 className="text-3xl font-extrabold text-indigo-700 mb-8 text-center">
          Bulk Fees Setup
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="block w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
            className="block w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="monthly">Monthly</option>
            <option value="one-time">One Time</option>
          </select>

          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={count}
            onChange={(e) => setCount(e.target.value.replace(/\D/, ""))}
            className="block w-full p-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="Fees count"
          />
        </div>

        <div className="flex mb-6 rounded-xl overflow-hidden border">
          <button
            onClick={() => setIsAdditional(false)}
            className={`flex-1 p-3 transition-all ${
              !isAdditional
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600"
            }`}
          >
            Regular
          </button>
          <button
            onClick={() => setIsAdditional(true)}
            className={`flex-1 p-3 transition-all ${
              isAdditional
                ? "bg-indigo-600 text-white"
                : "bg-white text-indigo-600"
            }`}
          >
            Additional
          </button>
        </div>

        {message && (
          <div
            className={`p-4 mb-6 rounded-xl transition-all ${
              message.startsWith("Error")
                ? "bg-red-100 text-red-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            {message}
          </div>
        )}

        {mode === "edit" && (
          <div className="mb-6">
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

        <div className="space-y-4 mb-6">
          {rows.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-4 p-4 bg-gray-100 rounded-xl"
            >
              <input
                type="number"
                placeholder="Amount"
                value={r.amount}
                onChange={(e) => updateRow(i, "amount", e.target.value)}
                className="w-1/3 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
              />
              {isAdditional && (
                <input
                  type="text"
                  placeholder="Fee Name"
                  value={r.name}
                  onChange={(e) => updateRow(i, "name", e.target.value)}
                  className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:bg-gray-400 transition-all"
        >
          {loading
            ? "Processing..."
            : mode === "create"
            ? "Create Fees"
            : "Update Fee"}
        </button>
      </div>
    </div>
  );
};

export default BulkFeesSet;
