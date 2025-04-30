// src/ADMINDASHBOARD/Inventory/Sales.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

// --- MOCK Custom Components (Assuming these are imported correctly) ---
const ReactInput = ({ label, value, onChange, placeholder, type = "text", name, required, maxLength, onFocus, onBlur }) => (
    <div className="relative"> {/* Added relative positioning */}
      {/* <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label> */}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder || label}
        required={required}
        maxLength={maxLength}
        onFocus={onFocus} // Pass down focus/blur handlers if needed
        onBlur={onBlur}
        className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        autoComplete="off" // Prevent browser autocomplete from interfering
      />
    </div>
  );

const ReactSelect = ({ label, value, handleChange, options, name, required }) => (
    <div className="">
      {/* <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label> */}
      <select
        id={name}
        name={name}
        value={value}
        onChange={handleChange}
        required={required}
        className="w-full px-3 py-1 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white"
      >
        <option value="" disabled>Select {label}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
// --- END MOCK Custom Components ---


const Sales = () => {
  // State variables for data
  const [students, setStudents] = useState([]);
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]); // For suggestions list
  const [showSuggestions, setShowSuggestions] = useState(false); // Control visibility
  const [selectedStudent, setSelectedStudent] = useState(null); // Store selected student object {id, name, ...} or just ID
  const [selectedStudentDisplay, setSelectedStudentDisplay] = useState(""); // For showing selected student name

  const [selectedItem, setSelectedItem] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [paidAmount, setPaidAmount] = useState("");
  const [dueAmount, setDueAmount] = useState(0);
  const [loading, setLoading] = useState(true); // Overall loading
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission loading
  const [isFetchingReceipt, setIsFetchingReceipt] = useState(false); // Receipt fetch loading
  const [error, setError] = useState(null);

  // States for receipt preview modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptPDFUrl, setReceiptPDFUrl] = useState("");

  // Ref for receipt capture container
  const receiptRef = useRef();
  const searchContainerRef = useRef(); // Ref for the search input + suggestions container

  // --- Data Fetching ---
  useEffect(() => {
    const fetchData = async () => {
      // ... (keep existing fetch logic) ...
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        if (!token) {
            throw new Error("Authentication token not found.");
        }
        const headers = { Authorization: `Bearer ${token}` };

        const [studentResponse, itemResponse, salesResponse] =
          await Promise.all([
            axios.get(
              "https://dvsserver.onrender.com/api/v1/adminRoute/studentparent?fetchAllStudents=true",
              { withCredentials: true, headers }
            ),
            axios.get(
              "https://dvsserver.onrender.com/api/v1/adminRoute/items",
              { withCredentials: true, headers }
            ),
            axios.get(
              "https://dvsserver.onrender.com/api/v1/adminRoute/sales",
              { withCredentials: true, headers }
            ),
          ]);

        if (studentResponse.data.success) {
          setStudents(studentResponse.data.students.data || []);
        } else {
          throw new Error(studentResponse.data.message || "Failed to fetch students");
        }
        if (itemResponse.data.success) {
          setItems(itemResponse.data.listOfAllItems || []);
        } else {
            throw new Error(itemResponse.data.message || "Failed to fetch items");
        }
        if (salesResponse.data.success) {
          setSales(salesResponse.data.sales?.reverse() || []);
        } else {
            throw new Error(salesResponse.data.message || "Failed to fetch sales");
        }

      } catch (error) {
        console.error("Fetch data error:", error);
        const errorMessage = error.response?.data?.message || error.message || "Failed to fetch data.";
        toast.error(errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

   // --- Student Search Logic ---
   useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults([]);
      setShowSuggestions(false);
      return;
    }

    // Filter students based on search term
    const filtered = students.filter(s => {
        const term = searchTerm.toLowerCase();
        const nameMatch = s.studentName.toLowerCase().includes(term);
        const admissionMatch = s.admissionNumber ? String(s.admissionNumber).toLowerCase().includes(term) : false;
        const idMatch = s.studentId.toLowerCase().includes(term);
        return nameMatch || admissionMatch || idMatch;
    }).slice(0, 10); // Limit suggestions

    setSearchResults(filtered);
    setShowSuggestions(true); // Show suggestions if search term exists

  }, [searchTerm, students]);

  // --- Handle clicking outside the search suggestions ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    // Add listener when suggestions are shown
    if (showSuggestions) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      // Clean up listener
      document.removeEventListener("mousedown", handleClickOutside);
    }
    // Cleanup function on component unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSuggestions]); // Re-run when showSuggestions changes


  // --- Handle Student Selection from Suggestions ---
  const handleStudentSelect = (student) => {
    setSelectedStudent(student); // Store the whole student object or just ID
    // Display format for the selected student
    const displayName = `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`;
    setSelectedStudentDisplay(displayName);
    setSearchTerm(student.studentName); // Optionally update search bar for confirmation
    setShowSuggestions(false); // Hide suggestions
    setSearchResults([]); // Clear results after selection
  };


  console.log("Selected Student Data:", selectedStudent); // Log the selected student object/ID

  // --- Item Selection Logic ---
  const itemOptions = items.map(item => ({
    value: item.itemId,
    label: `${item.itemName} - ₹${item.price.toFixed(2)}` // Format price
  }));


  // --- Handlers ---
  // handleAddItem, handleQuantityChange, handleIncreaseQuantity, handleDecreaseQuantity, handleRemoveItem remain the same

  const handleAddItem = () => {
    if (!selectedItem) {
        toast.warn("Please select an item to add.");
        return;
    }
    const itemToAdd = items.find((i) => i.itemId === selectedItem);
    if (itemToAdd) {
        const existingItemIndex = selectedItems.findIndex(i => i.itemId === selectedItem);
        if (existingItemIndex > -1) {
            handleIncreaseQuantity(selectedItem);
        } else {
            setSelectedItems([...selectedItems, { ...itemToAdd, quantity: 1 }]);
        }
      setSelectedItem(""); // Clear item selection after adding
    }
  };

  const handleQuantityChange = (itemId, quantityStr) => {
    const quantity = Math.max(1, parseInt(quantityStr) || 1);
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId ? { ...i, quantity: quantity } : i
      )
    );
  };

  const handleIncreaseQuantity = (itemId) => {
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
      )
    );
  };

  const handleDecreaseQuantity = (itemId) => {
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId && i.quantity > 1
          ? { ...i, quantity: i.quantity - 1 }
          : i
      ).filter(i => !(i.itemId === itemId && i.quantity <= 1))
    );
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
  };


  // Update subtotal and due amount
  useEffect(() => {
    const calculatedSubtotal = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubtotal(calculatedSubtotal);
    const paid = parseFloat(paidAmount) || 0;
    setDueAmount(Math.max(0, calculatedSubtotal - paid));
  }, [selectedItems, paidAmount]);

  // --- Form Submission ---
  const handleSubmit = async () => {
    // Use selectedStudent.studentId if you stored the object, or just selectedStudent if you stored the ID
    if (!selectedStudent || !selectedStudent.studentId) {
        toast.error("Please search and select a student.");
        return;
    }
    if (selectedItems.length === 0) {
        toast.error("Please add items to the sale.");
        return;
    }

    const saleData = {
      studentId: selectedStudent.studentId, // Ensure you pass the ID
      items: selectedItems.map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
        price: i.price
      })),
      totalAmount: subtotal,
      paidAmount: parseFloat(paidAmount) || 0,
      dueAmount: dueAmount,
      paymentStatus: (parseFloat(paidAmount) || 0) >= subtotal ? "paid" : ((parseFloat(paidAmount) || 0) > 0 ? "partial" : "pending"),
    };

    try {
      setIsSubmitting(true); // Start submission loading
      const token = localStorage.getItem("token");
      const response = await axios.post(
        "https://dvsserver.onrender.com/api/v1/adminRoute/sales",
        saleData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.data.success) {
        const newSale = response.data.data.sale;
        // Use the student object we already have for the receipt
        const studentDetailsForReceipt = selectedStudent;

        // Add new sale to the *beginning* of the sales list for visibility
        setSales([newSale, ...sales]);

        // Reset form state
        setSearchTerm("");
        setSelectedStudent(null);
        setSelectedStudentDisplay("");
        setSelectedItems([]);
        setPaidAmount("");
        setSubtotal(0);
        setDueAmount(0);
        setSearchResults([]);
        setShowSuggestions(false);

        toast.success(response.data.message || "Sale created successfully!");

        // Trigger receipt generation using detailed info if available
        if (response.data.data.receiptItems) {
            const receiptData = {
                ...newSale,
                items: response.data.data.receiptItems,
            };
            await generateReceipt(receiptData, studentDetailsForReceipt);
        } else {
             const fallbackReceiptData = {
                ...newSale,
                items: selectedItems.map(item => ({ // Use items from state before clearing
                    itemName: item.itemName,
                    quantity: item.quantity,
                    price: item.price,
                    total: item.price * item.quantity
                })),
            };
            await generateReceipt(fallbackReceiptData, studentDetailsForReceipt);
            toast.info("Receipt preview generated (using cached item names).");
        }

      } else {
        toast.error(response.data.message || "Failed to create sale.");
      }
    } catch (error) {
      console.error("Submit sale error:", error);
      toast.error(error.response?.data?.message || "An error occurred while creating the sale.");
    } finally {
      setIsSubmitting(false); // End submission loading
    }
  };

  // --- Receipt Generation (jsPDF and html2canvas logic) ---
  // generateReceipt, handlePrint, handleDownload remain the same
  const generateReceipt = async (receiptData, student) => {
    const input = receiptRef.current;
    if (!input || !receiptData) return;

    input.innerHTML = ""; // Clear previous content

    // Use student object passed in
    const studentInfo = student
      ? `${student.studentName} (${student.class} - ${student.section})${student.admissionNumber ? ` [Adm: ${student.admissionNumber}]` : ''}`
      : `Student ID: ${receiptData.studentId}`;

    const receiptContent = `
      <div style="padding: 15px; font-family: sans-serif; font-size: 10px; background-color: #ffffff; width: 280px;">
        <h2 style="color: #111827; font-size: 14px; text-align: center; margin-bottom: 10px; font-weight: bold;">INVOICE / RECEIPT</h2>
        <p style="margin-bottom: 4px;"><strong>Student:</strong> ${studentInfo}</p>
        <p style="margin-bottom: 4px;"><strong>Sale ID:</strong> ${receiptData.saleId}</p>
        <p style="margin-bottom: 8px;"><strong>Date:</strong> ${new Date(receiptData.date).toLocaleString()}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 10px 0; font-size: 10px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #d1d5db; padding: 4px; text-align: left;">Item</th>
              <th style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">Qty</th>
              <th style="border: 1px solid #d1d5db; padding: 4px; text-align: right;">Price</th>
              <th style="border: 1px solid #d1d5db; padding: 4px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${(receiptData.items || [])
              .map(
                (item) => `
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 4px;">${item.itemName || 'N/A'}</td>
                <td style="border: 1px solid #d1d5db; padding: 4px; text-align: center;">${item.quantity}</td>
                <td style="border: 1px solid #d1d5db; padding: 4px; text-align: right;">₹${item.price?.toFixed(2)}</td>
                <td style="border: 1px solid #d1d5db; padding: 4px; text-align: right;">₹${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <div style="margin-top: 10px; text-align: right;">
            <p style="margin-bottom: 4px;"><strong>Subtotal:</strong> ₹${receiptData.totalAmount?.toFixed(2)}</p>
            <p style="margin-bottom: 4px;"><strong>Paid:</strong> ₹${receiptData.paidAmount?.toFixed(2)}</p>
            <p style="margin-bottom: 4px; font-weight: bold;"><strong>Due:</strong> ₹${receiptData.dueAmount?.toFixed(2)}</p>
            <p style="margin-bottom: 4px;"><strong>Status:</strong> <span style="text-transform: capitalize;">${receiptData.paymentStatus}</span></p>
        </div>
         <p style="font-size: 8px; text-align: center; margin-top: 15px; color: #6b7280;">Thank you!</p>
      </div>
    `;
    input.innerHTML = receiptContent;

    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      const canvas = await html2canvas(input, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
         format: "a6",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let position = 5;
      pdf.addImage(imgData, "PNG", 5, position, pdfWidth - 10, Math.min(imgHeight, pdfHeight - 10) ); // Adjust height if needed

      const pdfDataUrl = pdf.output("datauristring");
      setReceiptPDFUrl(pdfDataUrl);
      setShowReceiptModal(true);

    } catch (canvasError) {
        console.error("Error generating canvas for PDF:", canvasError);
        toast.error("Failed to generate receipt preview.");
    }
  };

  const handlePrint = () => {
    if (!receiptPDFUrl) return;
    const printWindow = window.open(receiptPDFUrl, "_blank");
    printWindow.addEventListener('load', () => {
        printWindow.focus();
        printWindow.print();
    }, true);
  };

  const handleDownload = () => {
    if (!receiptPDFUrl) return;
    const link = document.createElement("a");
    link.href = receiptPDFUrl;
    const filename = `receipt-${Date.now()}.pdf`; // Simplified filename
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  // --- Print Existing Receipt ---
  const handlePrintReceipt = async (saleId) => {
    // ... (keep existing logic, ensure student lookup happens) ...
    try {
      setIsFetchingReceipt(true); // Show loading indicator for this action
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/receipts/${saleId}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success && response.data.receipt) {
        const receiptDetails = response.data.receipt;
        // Find student details locally (important for accurate name/class/etc.)
        const student = students.find(s => s.studentId === receiptDetails.studentId);
        if (!student) {
            toast.warn(`Student details for ID ${receiptDetails.studentId} not found locally. Receipt may show ID only.`);
        }
        await generateReceipt(receiptDetails, student); // Pass found student or null
        toast.success("Receipt preview ready.");
      } else {
        toast.warning(`Failed to fetch receipt details: ${response.data.message || 'Not found'}`);
      }
    } catch (error) {
      console.error("Error in handlePrintReceipt:", error);
      toast.error(`Error fetching receipt: ${error.response?.data?.message || error.message}`);
    } finally {
        setIsFetchingReceipt(false); // Hide loading indicator
    }
  };

  // --- Render Receipt Modal ---
  // renderReceiptModal remains the same
  const renderReceiptModal = () => (
    showReceiptModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
        <div className="bg-white rounded-lg shadow-xl p-4 md:p-6 w-full max-w-lg max-h-[90vh] flex flex-col">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">Receipt Preview</h2>
          <div className="flex-grow overflow-hidden border border-gray-200 rounded mb-4 bg-gray-50">
            {receiptPDFUrl ? (
              <iframe
                title="Receipt PDF Preview"
                src={receiptPDFUrl}
                className="w-full h-full min-h-[400px]"
                style={{ border: 'none' }}
              />
            ) : (
                <div className="flex items-center justify-center h-full text-gray-500">Generating preview...</div>
            )}
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-150 text-sm font-medium"
            >
              Print
            </button>
            <button
              onClick={handleDownload}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition duration-150 text-sm font-medium"
            >
              Download PDF
            </button>
            <button
              onClick={() => setShowReceiptModal(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-150 text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  );


  // --- Loading and Error States ---
  if (loading && !sales.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-red-600 bg-red-100 border border-red-400 rounded">
        Error: {error}
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="px-4 md:p-6  ">
      {/* Sale Creation Section */}
      <div className=" ">
<div className="grid grid-cols-2 gap-2">
<div>
      

{/* --- Student Search and Selection --- */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
    {/* Search Input and Suggestions Container */}
    <div className="relative mb-4" ref={searchContainerRef}>
        <ReactInput
            // label="Search & Select Student (Name / Adm No / ID)"
            name="studentSearch"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                // If user clears search, also clear selection
                if (e.target.value.trim() === "") {
                    setSelectedStudent(null);
                    setSelectedStudentDisplay("");
                }
            }}
            placeholder="Search & Select Student (Name / Adm No / ID) *"
            onFocus={() => searchTerm.trim() && setSearchResults.length > 0 && setShowSuggestions(true)} // Show suggestions on focus if results exist
            // required={!selectedStudent} // Require search input only if no student is selected
        />
        {/* Suggestions List */}
        {showSuggestions && searchResults.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg overflow-y-auto">
                {searchResults.map(student => (
                    <div
                        key={student.studentId}
                        className="px-4 py-2 text-sm text-gray-700 hover:bg-indigo-100 cursor-pointer"
                        onMouseDown={(e) => { // Use onMouseDown to fire before input's onBlur
                            e.preventDefault(); // Prevent input blur
                            handleStudentSelect(student);
                        }}
                    >
                        {`${student.studentName} (${student.class} - ${student.section})`}
                        {student.admissionNumber && <span className="text-xs text-gray-500 ml-2">[Adm: {student.admissionNumber}]</span>}
                    </div>
                ))}
            </div>
        )}
         {showSuggestions && searchTerm.trim() && searchResults.length === 0 && (
             <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg py-1 text-sm text-gray-500">
                No students found matching "{searchTerm}".
            </div>
         )}
    </div>

    {/* Display Selected Student */}
    <div className=""> {/* Align with input field */}
        {selectedStudentDisplay ? (
            <div className="px-2 border border-green-300 bg-green-50 rounded-md text-sm text-green-800 py-1 flex items-center">
                <span className="font-medium">Selected:</span> {selectedStudentDisplay}
            </div>
        ) : (
            <div className="px-2 border border-gray-300 bg-gray-50 rounded-md text-sm text-gray-500 py-1 flex items-center italic">
                No student selected
            </div>
        )}
    </div>
</div>


{/* --- Item Selection --- */}
<div className="flex items-end space-x-2 ite">
     <div className="flex-grow">
         <ReactSelect
            // label="Select Item"
            name="selectedItem"
            value={selectedItem}
            handleChange={(e) => setSelectedItem(e.target.value)}
            options={itemOptions}
            required={false}
        />
    </div>
    <button
      type="button"
      onClick={handleAddItem}
      className="px-4 py-1 bg-blue-500 text-white text-[12px] rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500  self-end whitespace-nowrap"
      disabled={!selectedItem || isSubmitting}
    >
      Add Item
    </button>
</div>
<div className="mt-2 flex flex-wrap gap-3">
<div className="flex flex-row">
                <span className="text-[16px] font-bold text-gray-600 block">Total : </span>
                <span className="text-[16px] font-bold text-blue-800">₹{subtotal.toFixed(2)}</span>
            </div>
           
<ReactInput
                label="Amount Paid"
                type="number"
                name="paidAmount"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                placeholder="0.00"
                required={false}
            />
              {paidAmount > 0 &&
               <div className={` flex flex-row ${dueAmount > 0 ? '' : 'bg-green-50 border border-green-200'}`}>
               <span className={`text-[13px] font-medium block ${dueAmount > 0 ? 'text-red-600' : 'text-green-600'}`}> Due :</span>
               <span className={`text-[13px] font-bold ${dueAmount > 0 ? 'text-red-700' : 'text-green-700'}`}>₹{dueAmount.toFixed(2)}</span>
           </div>
            }
             <div className="text-center ">
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-8 py-1 bg-green-600 text-white text-[13px] font-bold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 flex items-center justify-center mx-auto ${isSubmitting || !selectedStudent || selectedItems.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isSubmitting || !selectedStudent || selectedItems.length === 0}
            >
              {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                  </>
              ) : 'Create Sale & Generate Receipt'}
            </button>
        </div>
</div>

      </div>


     <div>
         {/* --- Selected Items List --- */}
         {selectedItems.length > 0 && (
          <div className="border rounded-md p-1 bg-gray-50/50">
            <h2 className="text-[13px] font-semibold mb-1 text-gray-700">Cart Items</h2>
            <div className="overflow-x-auto shadow-md rounded-lg"> {/* Added overflow for responsiveness */}
      <table className="w-full text-sm text-left text-gray-500">
        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
          <tr>
            <th scope="col" className="px-4 py-1">
              Item Name
            </th>
            <th scope="col" className="px-4 py-1 text-right w-24"> {/* Added width */}
              Unit Price
            </th>
            <th scope="col" className="px-4 py-1 text-center w-40"> {/* Added width */}
              Quantity
            </th>
            <th scope="col" className="px-4 py-1 text-right w-28"> {/* Added width */}
              Price
            </th>
            <th scope="col" className="px-4 py-1 text-center w-16"> {/* Added width */}
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {selectedItems.length === 0 ? (
            <tr>
                <td colSpan="5" className="px-4 py-4 text-center text-gray-500">
                    No items selected.
                </td>
            </tr>
          ) : (
            selectedItems?.map((item) => (
              <tr key={item.itemId} className="hover:bg-gray-50">
                {/* Item Name */}
                <td className="px-4 py-1 font-medium text-gray-900 whitespace-nowrap">
                  {item.itemName}
                </td>

                {/* Unit Price */}
                <td className="px-4 py-1 text-right text-gray-700">
                  ₹{item.price.toFixed(2)}
                  <span className="text-xs text-gray-500 block sm:inline sm:ml-1">/unit</span> {/* Adjusted for clarity */}
                </td>

                {/* Quantity Controls */}
                <td className="px-4 py-1">
                  <div className="flex items-center justify-center space-x-1"> {/* Centered controls */}
                    <button
                      onClick={() => handleDecreaseQuantity(item.itemId)}
                      className="p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 w-6 h-6 flex items-center justify-center text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={item.quantity <= 1 || isSubmitting}
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
                      className="w-12 h-7 text-center border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                      min="1"
                      disabled={isSubmitting}
                      aria-label={`Quantity for ${item.itemName}`}
                    />
                    <button
                      onClick={() => handleIncreaseQuantity(item.itemId)}
                      className="p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 w-6 h-6 flex items-center justify-center text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={isSubmitting}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                </td>

                {/* Total Price */}
                <td className="px-4 py-1 text-right font-semibold text-gray-900">
                  ₹{(item.price * item.quantity).toFixed(2)}
                </td>

                {/* Remove Action */}
                <td className="px-4 py-1 text-center">
                  <button
                    onClick={() => handleRemoveItem(item.itemId)}
                    className="p-1 text-red-500 hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                    aria-label="Remove item"
                  >
                   
                     🗑️
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
          
          </div>
        )}
     </div>
</div>
      </div>

      <div className="bg-white p-4 md:p-6 rounded-lg shadow-md mt-6">
         <h2 className="text-xl font-semibold text-gray-800 mb-4">Sales History</h2>
        <div className="overflow-x-auto">
           <table className="min-w-full divide-y divide-gray-200 border border-gray-200">
             <thead className="bg-gray-50">
               <tr>
                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                 <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                 <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                 <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Paid</th>
                 <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Due</th>
                 <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                 <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
               </tr>
             </thead>
             <tbody className="bg-white divide-y divide-gray-200">
                {sales.length === 0 && (
                    <tr>
                        <td colSpan="8" className="px-4 py-4 text-center text-sm text-gray-500 italic">No sales records found.</td>
                    </tr>
                )}
               {sales?.map((s) => {
                 const student = students.find((st) => st.studentId === s.studentId);
                 const studentDisplay = student
                   ? `${student.studentName} (${student.class}-${student.section})`
                   : s.studentId;
                 return (
                   <tr key={s._id || s.saleId} className="hover:bg-gray-50">
                     {/* <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{s.saleId}</td>   */}
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{new Date(s.date).toLocaleDateString()}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{studentDisplay}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-right">₹{s.totalAmount.toFixed(2)}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600 text-right">₹{s.paidAmount.toFixed(2)}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600 text-right">₹{s.dueAmount.toFixed(2)}</td>
                     <td className="px-4 py-3 whitespace-nowrap text-center">
                        <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            s.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                            s.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                        }`}>
                            {s.paymentStatus}
                        </span>
                     </td>
                     <td className="px-4 py-3 whitespace-nowrap text-center text-sm font-medium">
                       <button
                         onClick={() => handlePrintReceipt(s.saleId)}
                         className="text-indigo-600 hover:text-indigo-900 disabled:text-gray-400 disabled:cursor-not-allowed p-1 rounded hover:bg-indigo-50"
                         disabled={isFetchingReceipt || isSubmitting} // Disable while any loading
                         title="Print Receipt"
                       >
                         {/* Replace with Print Icon SVG */}
                         📄 Print
                       </button>
                     </td>
                   </tr>
                 );
               })}
             </tbody>
           </table>
        </div>
      </div>


      {/* Offscreen container for receipt generation */}
      <div className="absolute -left-[9999px] top-0" aria-hidden="true">
        <div ref={receiptRef}></div>
      </div>

      {/* Receipt Preview Modal */}
      {renderReceiptModal()}
    </div>
  );
};

export default Sales;



// // src/ADMINDASHBOARD/Inventory/Sales.jsx
// import React, { useState, useEffect, useRef } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import jsPDF from "jspdf";
// import html2canvas from "html2canvas";
// import {
//   Box,
//   Card,
//   CardContent,
//   Typography,
//   Stack,
//   Button,
//   TextField,
//   Select,
//   MenuItem,
//   Table,
//   TableBody,
//   TableCell,
//   TableHead,
//   TableRow,
//   CircularProgress,
//   IconButton,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from "@mui/material";
// import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
// import DeleteIcon from "@mui/icons-material/Delete";
// import ReceiptIcon from "@mui/icons-material/Receipt";
// import RemoveIcon from "@mui/icons-material/Remove";
// import AddIcon from "@mui/icons-material/Add";
// import PrintIcon from "@mui/icons-material/Print";
// import { motion } from "framer-motion";
// import theme from "../../theme";
// import { ThemeProvider } from "@mui/material/styles";

// const Sales = () => {
//   // State variables for data
//   const [students, setStudents] = useState([]);
//   const [items, setItems] = useState([]);
//   const [sales, setSales] = useState([]);
//   const [selectedStudent, setSelectedStudent] = useState("");
//   const [selectedItem, setSelectedItem] = useState("");
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [subtotal, setSubtotal] = useState(0);
//   const [paidAmount, setPaidAmount] = useState("");
//   const [dueAmount, setDueAmount] = useState(0);
//   const [classFilter, setClassFilter] = useState("");
//   const [sectionFilter, setSectionFilter] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // States for receipt preview modal
//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [receiptPDFUrl, setReceiptPDFUrl] = useState("");

//   // Ref for receipt capture container
//   const receiptRef = useRef();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [studentResponse, itemResponse, salesResponse] =
//           await Promise.all([
//             axios.get(
//               "https://dvsserver.onrender.com/api/v1/adminRoute/studentparent?fetchAllStudents=true",
//               {
//                 withCredentials: true,
//                 headers: {
//                   Authorization: `Bearer ${localStorage.getItem("token")}`,
//                 },
//               }
//             ),
//             axios.get(
//               "https://dvsserver.onrender.com/api/v1/adminRoute/items",
//               {
//                 withCredentials: true,
//                 headers: {
//                   Authorization: `Bearer ${localStorage.getItem("token")}`,
//                 },
//               }
//             ),
//             axios.get(
//               "https://dvsserver.onrender.com/api/v1/adminRoute/sales",
//               {
//                 withCredentials: true,
//                 headers: {
//                   Authorization: `Bearer ${localStorage.getItem("token")}`,
//                 },
//               }
//             ),
//           ]);

//         if (studentResponse.data.success)
//           setStudents(studentResponse.data.students.data || []);
//         if (itemResponse.data.success)
//           setItems(itemResponse.data.listOfAllItems || []);
//         if (salesResponse.data.success)
//           setSales(salesResponse.data.sales || []);
//       } catch (error) {
//         toast.error("Failed to fetch data.");
//         setError(error.message);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchData();
//   }, []);

//   const filteredStudents = students.filter(
//     (s) =>
//       (!classFilter || s.class === classFilter) &&
//       (!sectionFilter || s.section === sectionFilter)
//   );

//   const handleAddItem = () => {
//     const item = items.find((i) => i.itemId === selectedItem);
//     if (item) {
//       setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
//       setSelectedItem("");
//     }
//   };

//   const handleQuantityChange = (itemId, quantity) => {
//     const newQuantity = Math.max(1, parseInt(quantity) || 1);
//     setSelectedItems(
//       selectedItems.map((i) =>
//         i.itemId === itemId ? { ...i, quantity: newQuantity } : i
//       )
//     );
//   };

//   const handleIncreaseQuantity = (itemId) => {
//     setSelectedItems(
//       selectedItems.map((i) =>
//         i.itemId === itemId ? { ...i, quantity: i.quantity + 1 } : i
//       )
//     );
//   };

//   const handleDecreaseQuantity = (itemId) => {
//     setSelectedItems(
//       selectedItems.map((i) =>
//         i.itemId === itemId && i.quantity > 1
//           ? { ...i, quantity: i.quantity - 1 }
//           : i
//       )
//     );
//   };

//   const handleRemoveItem = (itemId) => {
//     setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
//   };

//   useEffect(() => {
//     const calculatedSubtotal = selectedItems.reduce(
//       (sum, item) => sum + item.price * item.quantity,
//       0
//     );
//     setSubtotal(calculatedSubtotal);
//     const paid = parseFloat(paidAmount) || 0;
//     setDueAmount(Math.max(0, calculatedSubtotal - paid));
//   }, [selectedItems, paidAmount]);

//   const handleSubmit = async () => {
//     const saleData = {
//       studentId: selectedStudent,
//       items: selectedItems.map((i) => ({
//         itemId: i.itemId,
//         quantity: i.quantity,
//       })),
//       totalAmount: subtotal,
//       paidAmount: parseFloat(paidAmount) || 0,
//       dueAmount: dueAmount,
//       paymentStatus: parseFloat(paidAmount) >= subtotal ? "paid" : "pending",
//     };
//     try {
//       const response = await axios.post(
//         "https://dvsserver.onrender.com/api/v1/adminRoute/sales",
//         saleData,
//         {
//           withCredentials: true,
//           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
//         }
//       );
//       if (response.data.success) {
//         // Add new sale to sales state
//         setSales([...sales, response.data.data.sale]);
//         // If the receipt data is returned, we can open the modal preview
//         if (response.data.receipt) {
//           // Also update student details for the receipt using the local sales state.
//           // Find the new sale record by saleId:
//           const newSale = response.data.data.sale;
//           const student = students.find(
//             (s) => s.studentId === newSale.studentId
//           );
//           await generateReceipt(response.data.receipt, student);
//         } else {
//           toast.warning("Receipt generation failed.");
//         }
//         setSelectedStudent("");
//         setSelectedItems([]);
//         setPaidAmount("");
//         toast.success(response.data.message);
//       } else {
//         toast.error(response.data.message || "Failed to create sale.");
//       }
//     } catch (error) {
//       toast.error(error.response?.data?.message || "Failed to create sale.");
//     }
//   };

//   // Modify generateReceipt to accept the receipt data and student record;
//   // Instead of downloading the PDF immediately, we generate a PDF data URL and set state
//   const generateReceipt = async (receiptData, student) => {
//     const input = receiptRef.current;
//     input.innerHTML = ""; // Clear previous content
//     // Use student details if found, otherwise fallback to receiptData.studentName
//     const studentInfo = student
//       ? `${student.studentName} (${student.class} - ${student.section})`
//       : receiptData.studentName;
//     const receiptContent = `
//       <div style="padding: 10px; font-size: 10px; background-color: #ffffff;">
//         <h2 style="color: #2c3e50; font-size: 14px; text-align: center;">Receipt</h2>
//         <p><strong>Student:</strong> ${studentInfo}</p>
//         <p><strong>Sale ID:</strong> ${receiptData.saleId}</p>
//         <p><strong>Date:</strong> ${new Date(
//           receiptData.date
//         ).toLocaleDateString()}</p>
//         <table style="width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 10px;">
//           <thead>
//             <tr style="background-color: #ecf0f1;">
//               <th style="border: 1px solid #ddd; padding: 4px;">Item</th>
//               <th style="border: 1px solid #ddd; padding: 4px;">Qty</th>
//               <th style="border: 1px solid #ddd; padding: 4px;">Price</th>
//               <th style="border: 1px solid #ddd; padding: 4px;">Total</th>
//             </tr>
//           </thead>
//           <tbody>
//             ${receiptData.items
//               .map(
//                 (item) => `
//               <tr>
//                 <td style="border: 1px solid #ddd; padding: 4px;">${item.itemName}</td>
//                 <td style="border: 1px solid #ddd; padding: 4px;">${item.quantity}</td>
//                 <td style="border: 1px solid #ddd; padding: 4px;">₹${item.price}</td>
//                 <td style="border: 1px solid #ddd; padding: 4px;">₹${item.total}</td>
//               </tr>
//             `
//               )
//               .join("")}
//           </tbody>
//         </table>
//         <p><strong>Subtotal:</strong> ₹${receiptData.totalAmount}</p>
//         <p><strong>Paid:</strong> ₹${receiptData.paidAmount}</p>
//         <p><strong>Due:</strong> ₹${receiptData.dueAmount}</p>
//         <p><strong>Status:</strong> ${receiptData.paymentStatus}</p>
//       </div>
//     `;
//     input.innerHTML = receiptContent;

//     // Wait briefly so that the content is rendered. Note: Use an offscreen container.
//     await new Promise((resolve) => setTimeout(resolve, 200));

//     // Capture the receipt to a canvas with a white background
//     const canvas = await html2canvas(input, {
//       scale: 2,
//       useCORS: true,
//       backgroundColor: "#ffffff",
//     });

//     const imgData = canvas.toDataURL("image/png");

//     // Generate PDF using jsPDF
//     const pdf = new jsPDF({
//       orientation: "portrait",
//       unit: "mm",
//       format: "a6",
//     });
//     const imgProps = pdf.getImageProperties(imgData);
//     const pdfWidth = pdf.internal.pageSize.getWidth();
//     const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
//     pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

//     // Instead of auto-downloading, get PDF as data URL and show preview modal
//     const pdfDataUrl = pdf.output("datauristring");
//     setReceiptPDFUrl(pdfDataUrl);
//     setShowReceiptModal(true);
//   };

//   // Function to handle printing from the modal
//   const handlePrint = () => {
//     // Open the PDF in a new window and trigger print
//     const printWindow = window.open(receiptPDFUrl, "_blank");
//     printWindow.focus();
//     printWindow.print();
//   };

//   // Function to handle downloading the PDF from the modal
//   const handleDownload = () => {
//     // Create a temporary link and trigger download
//     const link = document.createElement("a");
//     link.href = receiptPDFUrl;
//     link.download = "receipt.pdf";
//     link.click();
//   };

//   // Modified receipt modal render using MUI Dialog
//   const renderReceiptModal = () => (
//     <Dialog
//       open={showReceiptModal}
//       onClose={() => setShowReceiptModal(false)}
//       fullWidth
//       maxWidth="sm"
//     >
//       <DialogTitle>Receipt Preview</DialogTitle>
//       <DialogContent dividers>
//         {/* Display PDF using an iframe */}
//         {receiptPDFUrl && (
//           <iframe
//             title="Receipt PDF Preview"
//             src={receiptPDFUrl}
//             style={{ width: "100%", height: "400px", border: "none" }}
//           />
//         )}
//       </DialogContent>
//       <DialogActions>
//         <Button onClick={handlePrint} color="primary" variant="outlined">
//           Print
//         </Button>
//         <Button onClick={handleDownload} color="primary" variant="contained">
//           Download
//         </Button>
//         <Button onClick={() => setShowReceiptModal(false)} color="secondary">
//           Close
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );

//   // Function for printing receipt based on saleId
//   const handlePrintReceipt = async (saleId) => {
//     try {
//       // Find the sale record from the sales state
//       const saleRecord = sales.find((s) => s.saleId === saleId);
//       if (!saleRecord) {
//         toast.error("Sale record not found.");
//         return;
//       }
//       // Retrieve receipt details from the API
//       const response = await axios.get(
//         `https://dvsserver.onrender.com/api/v1/adminRoute/receipts/${saleId}`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`,
//           },
//         }
//       );
//       if (response.data.success && response.data.receipt) {
//         // Find student data for this sale from state
//         const student = students.find(
//           (s) => s.studentId === saleRecord.studentId
//         );
//         await generateReceipt(response.data.receipt, student);
//         toast.success("Receipt preview generated.");
//       } else {
//         toast.warning("Failed to generate receipt: " + response.data.message);
//       }
//     } catch (error) {
//       console.error("Error in handlePrintReceipt:", error);
//       toast.error("Error generating receipt: " + error.message);
//     }
//   };

//   if (loading)
//     return (
//       <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
//         <CircularProgress />
//       </Box>
//     );
//   if (error)
//     return (
//       <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
//         Error: {error}
//       </Typography>
//     );

//   return (
//     <ThemeProvider theme={theme}>
//       <Box
//         p={2}
//         sx={{
//           backgroundColor: "#fff",
//           borderRadius: 2,
//           boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
//         }}
//       >
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.5 }}
//         >
//           <Card sx={{ p: 2 }}>
//             <CardContent>
//               <Typography variant="h5" gutterBottom>
//                 Sales Management
//               </Typography>
//               <Stack spacing={2}>
//                 <Stack direction="row" spacing={2}>
//                   <Select
//                     value={classFilter}
//                     onChange={(e) => setClassFilter(e.target.value)}
//                     displayEmpty
//                     fullWidth
//                   >
//                     <MenuItem value="">Filter by Class</MenuItem>
//                     {[...new Set(students.map((s) => s.class))].map((cls) => (
//                       <MenuItem key={cls} value={cls}>
//                         {cls}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   <Select
//                     value={sectionFilter}
//                     onChange={(e) => setSectionFilter(e.target.value)}
//                     displayEmpty
//                     fullWidth
//                   >
//                     <MenuItem value="">Filter by Section</MenuItem>
//                     {[...new Set(students.map((s) => s.section))].map((sec) => (
//                       <MenuItem key={sec} value={sec}>
//                         {sec}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                 </Stack>
//                 <Select
//                   value={selectedStudent}
//                   onChange={(e) => setSelectedStudent(e.target.value)}
//                   displayEmpty
//                   fullWidth
//                 >
//                   <MenuItem value="">Select Student</MenuItem>
//                   {filteredStudents.map((s) => (
//                     <MenuItem key={s.studentId} value={s.studentId}>
//                       {s.studentName} ({s.class} - {s.section})
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 <Stack direction="row" spacing={1} alignItems="center">
//                   <Select
//                     value={selectedItem}
//                     onChange={(e) => setSelectedItem(e.target.value)}
//                     displayEmpty
//                     fullWidth
//                   >
//                     <MenuItem value="">Select Item</MenuItem>
//                     {items.map((item) => (
//                       <MenuItem key={item.itemId} value={item.itemId}>
//                         {item.itemName} - ₹{item.price}
//                       </MenuItem>
//                     ))}
//                   </Select>
//                   <Button
//                     variant="contained"
//                     onClick={handleAddItem}
//                     startIcon={<AddShoppingCartIcon />}
//                   >
//                     Add
//                   </Button>
//                 </Stack>
//                 {selectedItems.map((item) => (
//                   <Stack
//                     key={item.itemId}
//                     direction="row"
//                     alignItems="center"
//                     spacing={1}
//                   >
//                     <Typography>{item.itemName}</Typography>
//                     <IconButton
//                       onClick={() => handleDecreaseQuantity(item.itemId)}
//                     >
//                       <RemoveIcon />
//                     </IconButton>
//                     <TextField
//                       type="number"
//                       value={item.quantity}
//                       onChange={(e) =>
//                         handleQuantityChange(item.itemId, e.target.value)
//                       }
//                       size="small"
//                       sx={{ width: 60 }}
//                     />
//                     <IconButton
//                       onClick={() => handleIncreaseQuantity(item.itemId)}
//                     >
//                       <AddIcon />
//                     </IconButton>
//                     <Typography>₹{item.price * item.quantity}</Typography>
//                     <IconButton onClick={() => handleRemoveItem(item.itemId)}>
//                       <DeleteIcon />
//                     </IconButton>
//                   </Stack>
//                 ))}
//                 <Typography variant="h6">Subtotal: ₹{subtotal}</Typography>
//                 <TextField
//                   type="number"
//                   value={paidAmount}
//                   onChange={(e) => setPaidAmount(e.target.value)}
//                   placeholder="Amount Paid"
//                   variant="outlined"
//                   size="small"
//                 />
//                 <Typography>Due: ₹{dueAmount}</Typography>
//                 <Button
//                   variant="contained"
//                   onClick={handleSubmit}
//                   startIcon={<ReceiptIcon />}
//                 >
//                   Create Sale
//                 </Button>
//               </Stack>
//             </CardContent>
//           </Card>
//         </motion.div>
//         <Table sx={{ mt: 2 }}>
//           <TableHead>
//             <TableRow>
//               <TableCell>Sale ID</TableCell>
//               <TableCell>Date</TableCell>
//               <TableCell>Student</TableCell>
//               <TableCell>Total</TableCell>
//               <TableCell>Paid</TableCell>
//               <TableCell>Due</TableCell>
//               <TableCell>Status</TableCell>
//               <TableCell>Action</TableCell>
//             </TableRow>
//           </TableHead>
//           <TableBody>
//             {sales.map((s) => {
//               // Lookup student details from local state using sale.studentId
//               const student = students.find(
//                 (st) => st.studentId === s.studentId
//               );
//               const studentDisplay = student
//                 ? `${student.studentName} (${student.class} - ${student.section})`
//                 : "Unknown";
//               return (
//                 <TableRow key={s._id}>
//                   <TableCell>{s.saleId}</TableCell>
//                   <TableCell>{new Date(s.date).toLocaleDateString()}</TableCell>
//                   <TableCell>{studentDisplay}</TableCell>
//                   <TableCell>₹{s.totalAmount}</TableCell>
//                   <TableCell>₹{s.paidAmount}</TableCell>
//                   <TableCell>₹{s.dueAmount}</TableCell>
//                   <TableCell>{s.paymentStatus}</TableCell>
//                   <TableCell>
//                     <IconButton
//                       color="primary"
//                       onClick={() => handlePrintReceipt(s.saleId)}
//                     >
//                       <PrintIcon />
//                     </IconButton>
//                   </TableCell>
//                 </TableRow>
//               );
//             })}
//           </TableBody>
//         </Table>
//         {/* Offscreen container for receipt generation */}
//         <Box sx={{ position: "absolute", left: "-10000px", top: 0 }}>
//           <Box ref={receiptRef} />
//         </Box>
//         {/* Receipt Preview Modal */}
//         {renderReceiptModal()}
//       </Box>
//     </ThemeProvider>
//   );
// };

// export default Sales;
