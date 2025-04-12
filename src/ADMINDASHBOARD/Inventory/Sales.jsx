// src/ADMINDASHBOARD/Inventory/Sales.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Button,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";
import DeleteIcon from "@mui/icons-material/Delete";
import ReceiptIcon from "@mui/icons-material/Receipt";
import RemoveIcon from "@mui/icons-material/Remove";
import AddIcon from "@mui/icons-material/Add";
import PrintIcon from "@mui/icons-material/Print";
import { motion } from "framer-motion";
import theme from "../../theme";
import { ThemeProvider } from "@mui/material/styles";

const Sales = () => {
  // State variables for data
  const [students, setStudents] = useState([]);
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [paidAmount, setPaidAmount] = useState("");
  const [dueAmount, setDueAmount] = useState(0);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States for receipt preview modal
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptPDFUrl, setReceiptPDFUrl] = useState("");

  // Ref for receipt capture container
  const receiptRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [studentResponse, itemResponse, salesResponse] =
          await Promise.all([
            axios.get(
              "https://dvsserver.onrender.com/api/v1/adminRoute/studentparent?fetchAllStudents=true",
              {
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            ),
            axios.get(
              "https://dvsserver.onrender.com/api/v1/adminRoute/items",
              {
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            ),
            axios.get(
              "https://dvsserver.onrender.com/api/v1/adminRoute/sales",
              {
                withCredentials: true,
                headers: {
                  Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
              }
            ),
          ]);

        if (studentResponse.data.success)
          setStudents(studentResponse.data.students.data || []);
        if (itemResponse.data.success)
          setItems(itemResponse.data.listOfAllItems || []);
        if (salesResponse.data.success)
          setSales(salesResponse.data.sales || []);
      } catch (error) {
        toast.error("Failed to fetch data.");
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter(
    (s) =>
      (!classFilter || s.class === classFilter) &&
      (!sectionFilter || s.section === sectionFilter)
  );

  const handleAddItem = () => {
    const item = items.find((i) => i.itemId === selectedItem);
    if (item) {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
      setSelectedItem("");
    }
  };

  const handleQuantityChange = (itemId, quantity) => {
    const newQuantity = Math.max(1, parseInt(quantity) || 1);
    setSelectedItems(
      selectedItems.map((i) =>
        i.itemId === itemId ? { ...i, quantity: newQuantity } : i
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
      )
    );
  };

  const handleRemoveItem = (itemId) => {
    setSelectedItems(selectedItems.filter((i) => i.itemId !== itemId));
  };

  useEffect(() => {
    const calculatedSubtotal = selectedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setSubtotal(calculatedSubtotal);
    const paid = parseFloat(paidAmount) || 0;
    setDueAmount(Math.max(0, calculatedSubtotal - paid));
  }, [selectedItems, paidAmount]);

  const handleSubmit = async () => {
    const saleData = {
      studentId: selectedStudent,
      items: selectedItems.map((i) => ({
        itemId: i.itemId,
        quantity: i.quantity,
      })),
      totalAmount: subtotal,
      paidAmount: parseFloat(paidAmount) || 0,
      dueAmount: dueAmount,
      paymentStatus: parseFloat(paidAmount) >= subtotal ? "paid" : "pending",
    };
    try {
      const response = await axios.post(
        "https://dvsserver.onrender.com/api/v1/adminRoute/sales",
        saleData,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      if (response.data.success) {
        // Add new sale to sales state
        setSales([...sales, response.data.data.sale]);
        // If the receipt data is returned, we can open the modal preview
        if (response.data.receipt) {
          // Also update student details for the receipt using the local sales state.
          // Find the new sale record by saleId:
          const newSale = response.data.data.sale;
          const student = students.find(
            (s) => s.studentId === newSale.studentId
          );
          await generateReceipt(response.data.receipt, student);
        } else {
          toast.warning("Receipt generation failed.");
        }
        setSelectedStudent("");
        setSelectedItems([]);
        setPaidAmount("");
        toast.success(response.data.message);
      } else {
        toast.error(response.data.message || "Failed to create sale.");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create sale.");
    }
  };

  // Modify generateReceipt to accept the receipt data and student record;
  // Instead of downloading the PDF immediately, we generate a PDF data URL and set state
  const generateReceipt = async (receiptData, student) => {
    const input = receiptRef.current;
    input.innerHTML = ""; // Clear previous content
    // Use student details if found, otherwise fallback to receiptData.studentName
    const studentInfo = student
      ? `${student.studentName} (${student.class} - ${student.section})`
      : receiptData.studentName;
    const receiptContent = `
      <div style="padding: 10px; font-size: 10px; background-color: #ffffff;">
        <h2 style="color: #2c3e50; font-size: 14px; text-align: center;">Receipt</h2>
        <p><strong>Student:</strong> ${studentInfo}</p>
        <p><strong>Sale ID:</strong> ${receiptData.saleId}</p>
        <p><strong>Date:</strong> ${new Date(
          receiptData.date
        ).toLocaleDateString()}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 5px 0; font-size: 10px;">
          <thead>
            <tr style="background-color: #ecf0f1;">
              <th style="border: 1px solid #ddd; padding: 4px;">Item</th>
              <th style="border: 1px solid #ddd; padding: 4px;">Qty</th>
              <th style="border: 1px solid #ddd; padding: 4px;">Price</th>
              <th style="border: 1px solid #ddd; padding: 4px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${receiptData.items
              .map(
                (item) => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.itemName}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">₹${item.price}</td>
                <td style="border: 1px solid #ddd; padding: 4px;">₹${item.total}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>
        <p><strong>Subtotal:</strong> ₹${receiptData.totalAmount}</p>
        <p><strong>Paid:</strong> ₹${receiptData.paidAmount}</p>
        <p><strong>Due:</strong> ₹${receiptData.dueAmount}</p>
        <p><strong>Status:</strong> ${receiptData.paymentStatus}</p>
      </div>
    `;
    input.innerHTML = receiptContent;

    // Wait briefly so that the content is rendered. Note: Use an offscreen container.
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Capture the receipt to a canvas with a white background
    const canvas = await html2canvas(input, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/png");

    // Generate PDF using jsPDF
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a6",
    });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

    // Instead of auto-downloading, get PDF as data URL and show preview modal
    const pdfDataUrl = pdf.output("datauristring");
    setReceiptPDFUrl(pdfDataUrl);
    setShowReceiptModal(true);
  };

  // Function to handle printing from the modal
  const handlePrint = () => {
    // Open the PDF in a new window and trigger print
    const printWindow = window.open(pdfDataUrl, "_blank");
    printWindow.focus();
    printWindow.print();
  };

  // Function to handle downloading the PDF from the modal
  const handleDownload = () => {
    // Create a temporary link and trigger download
    const link = document.createElement("a");
    link.href = receiptPDFUrl;
    link.download = "receipt.pdf";
    link.click();
  };

  // Modified receipt modal render using MUI Dialog
  const renderReceiptModal = () => (
    <Dialog
      open={showReceiptModal}
      onClose={() => setShowReceiptModal(false)}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Receipt Preview</DialogTitle>
      <DialogContent dividers>
        {/* Display PDF using an iframe */}
        {receiptPDFUrl && (
          <iframe
            title="Receipt PDF Preview"
            src={receiptPDFUrl}
            style={{ width: "100%", height: "400px", border: "none" }}
          />
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePrint} color="primary" variant="outlined">
          Print
        </Button>
        <Button onClick={handleDownload} color="primary" variant="contained">
          Download
        </Button>
        <Button onClick={() => setShowReceiptModal(false)} color="secondary">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Function for printing receipt based on saleId
  const handlePrintReceipt = async (saleId) => {
    try {
      // Find the sale record from the sales state
      const saleRecord = sales.find((s) => s.saleId === saleId);
      if (!saleRecord) {
        toast.error("Sale record not found.");
        return;
      }
      // Retrieve receipt details from the API
      const response = await axios.get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/receipts/${saleId}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      if (response.data.success && response.data.receipt) {
        // Find student data for this sale from state
        const student = students.find(
          (s) => s.studentId === saleRecord.studentId
        );
        await generateReceipt(response.data.receipt, student);
        toast.success("Receipt preview generated.");
      } else {
        toast.warning("Failed to generate receipt: " + response.data.message);
      }
    } catch (error) {
      console.error("Error in handlePrintReceipt:", error);
      toast.error("Error generating receipt: " + error.message);
    }
  };

  if (loading)
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  if (error)
    return (
      <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>
        Error: {error}
      </Typography>
    );

  return (
    <ThemeProvider theme={theme}>
      <Box
        p={2}
        sx={{
          backgroundColor: "#fff",
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card sx={{ p: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                Sales Management
              </Typography>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2}>
                  <Select
                    value={classFilter}
                    onChange={(e) => setClassFilter(e.target.value)}
                    displayEmpty
                    fullWidth
                  >
                    <MenuItem value="">Filter by Class</MenuItem>
                    {[...new Set(students.map((s) => s.class))].map((cls) => (
                      <MenuItem key={cls} value={cls}>
                        {cls}
                      </MenuItem>
                    ))}
                  </Select>
                  <Select
                    value={sectionFilter}
                    onChange={(e) => setSectionFilter(e.target.value)}
                    displayEmpty
                    fullWidth
                  >
                    <MenuItem value="">Filter by Section</MenuItem>
                    {[...new Set(students.map((s) => s.section))].map((sec) => (
                      <MenuItem key={sec} value={sec}>
                        {sec}
                      </MenuItem>
                    ))}
                  </Select>
                </Stack>
                <Select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  displayEmpty
                  fullWidth
                >
                  <MenuItem value="">Select Student</MenuItem>
                  {filteredStudents.map((s) => (
                    <MenuItem key={s.studentId} value={s.studentId}>
                      {s.studentName} ({s.class} - {s.section})
                    </MenuItem>
                  ))}
                </Select>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Select
                    value={selectedItem}
                    onChange={(e) => setSelectedItem(e.target.value)}
                    displayEmpty
                    fullWidth
                  >
                    <MenuItem value="">Select Item</MenuItem>
                    {items.map((item) => (
                      <MenuItem key={item.itemId} value={item.itemId}>
                        {item.itemName} - ₹{item.price}
                      </MenuItem>
                    ))}
                  </Select>
                  <Button
                    variant="contained"
                    onClick={handleAddItem}
                    startIcon={<AddShoppingCartIcon />}
                  >
                    Add
                  </Button>
                </Stack>
                {selectedItems.map((item) => (
                  <Stack
                    key={item.itemId}
                    direction="row"
                    alignItems="center"
                    spacing={1}
                  >
                    <Typography>{item.itemName}</Typography>
                    <IconButton
                      onClick={() => handleDecreaseQuantity(item.itemId)}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <TextField
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleQuantityChange(item.itemId, e.target.value)
                      }
                      size="small"
                      sx={{ width: 60 }}
                    />
                    <IconButton
                      onClick={() => handleIncreaseQuantity(item.itemId)}
                    >
                      <AddIcon />
                    </IconButton>
                    <Typography>₹{item.price * item.quantity}</Typography>
                    <IconButton onClick={() => handleRemoveItem(item.itemId)}>
                      <DeleteIcon />
                    </IconButton>
                  </Stack>
                ))}
                <Typography variant="h6">Subtotal: ₹{subtotal}</Typography>
                <TextField
                  type="number"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  placeholder="Amount Paid"
                  variant="outlined"
                  size="small"
                />
                <Typography>Due: ₹{dueAmount}</Typography>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  startIcon={<ReceiptIcon />}
                >
                  Create Sale
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
        <Table sx={{ mt: 2 }}>
          <TableHead>
            <TableRow>
              <TableCell>Sale ID</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Paid</TableCell>
              <TableCell>Due</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((s) => {
              // Lookup student details from local state using sale.studentId
              const student = students.find(
                (st) => st.studentId === s.studentId
              );
              const studentDisplay = student
                ? `${student.studentName} (${student.class} - ${student.section})`
                : "Unknown";
              return (
                <TableRow key={s._id}>
                  <TableCell>{s.saleId}</TableCell>
                  <TableCell>{new Date(s.date).toLocaleDateString()}</TableCell>
                  <TableCell>{studentDisplay}</TableCell>
                  <TableCell>₹{s.totalAmount}</TableCell>
                  <TableCell>₹{s.paidAmount}</TableCell>
                  <TableCell>₹{s.dueAmount}</TableCell>
                  <TableCell>{s.paymentStatus}</TableCell>
                  <TableCell>
                    <IconButton
                      color="primary"
                      onClick={() => handlePrintReceipt(s.saleId)}
                    >
                      <PrintIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
        {/* Offscreen container for receipt generation */}
        <Box sx={{ position: "absolute", left: "-10000px", top: 0 }}>
          <Box ref={receiptRef} />
        </Box>
        {/* Receipt Preview Modal */}
        {renderReceiptModal()}
      </Box>
    </ThemeProvider>
  );
};

export default Sales;
