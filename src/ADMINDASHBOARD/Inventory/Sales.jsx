// src/ADMINDASHBOARD/Inventory/Sales.jsx
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Box, Typography, Stack, Button, TextField, Select, MenuItem, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";

const Sales = () => {
  const [students, setStudents] = useState([]);
  const [items, setItems] = useState([]);
  const [sales, setSales] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [selectedItems, setSelectedItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [paidAmount, setPaidAmount] = useState(0);
  const [classFilter, setClassFilter] = useState("");
  const [sectionFilter, setSectionFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const receiptRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading state
        const [studentResponse, itemResponse, salesResponse] = await Promise.all([
          axios.get("https://dvsserver.onrender.com/api/v1/adminRoute/studentparent?fetchAllStudents=true", {
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("https://dvsserver.onrender.com/api/v1/adminRoute/items", {
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
          axios.get("https://dvsserver.onrender.com/api/v1/adminRoute/sales", {
            withCredentials: true,
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          }),
        ]);

        if (studentResponse.data.success) setStudents(studentResponse.data.students.data || []);
        else toast.error(studentResponse.data.message || "Failed to fetch students.");
        
        if (itemResponse.data.success) setItems(itemResponse.data.items || []);
        else toast.error(itemResponse.data.message || "Failed to fetch items.");

        if (salesResponse.data.success) setSales(salesResponse.data.sales || []);
        else toast.error(salesResponse.data.message || "Failed to fetch sales.");
      } catch (error) {
        toast.error("Failed to fetch data.");
        setError(error.message);
      } finally {
        setLoading(false); // Reset loading state
      }
    };
    fetchData();
  }, []);

  const filteredStudents = students.filter((s) => (!classFilter || s.class === classFilter) && (!sectionFilter || s.section === sectionFilter));

  const handleAddItem = (item) => {
    const existing = selectedItems.find((i) => i.itemId === item.itemId);
    if (existing) setSelectedItems(selectedItems.map((i) => (i.itemId === item.itemId ? { ...i, quantity: i.quantity + 1 } : i)));
    else setSelectedItems([...selectedItems, { ...item, quantity: 1 }]);
  };

  const handleQuantityChange = (itemId, quantity) => {
    setSelectedItems(selectedItems.map((i) => (i.itemId === itemId ? { ...i, quantity: parseInt(quantity) || 1 } : i)));
  };

  useEffect(() => {
    setTotalAmount(selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0));
  }, [selectedItems]);

  const handleSubmit = async () => {
    const saleData = { studentId: selectedStudent, items: selectedItems.map((i) => ({ itemId: i.itemId, quantity: i.quantity })), paymentStatus, paidAmount: parseFloat(paidAmount) || 0 };
    try {
      const response = await axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/sales", saleData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setSales([...sales, response.data.data]);
        generateReceipt(response.data.data);
        setSelectedStudent("");
        setSelectedItems([]);
        setPaymentStatus("pending");
        setPaidAmount(0);
        toast.success("Sale created");
      } else toast.error(response.data.message);
    } catch (error) {
      toast.error("Failed to create sale.");
    }
  };

  const generateReceipt = async (sale) => {
    const input = receiptRef.current;
    html2canvas(input).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF();
      pdf.addImage(imgData, "PNG", 0, 0);
      pdf.save(`receipt_${sale.receiptId}.pdf`);
    });
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Sales
      </Typography>
      <Stack spacing={2}>
        <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} displayEmpty>
          <MenuItem value="">Filter by Class</MenuItem>
          {[...new Set(students.map((s) => s.class))].map((cls) => (
            <MenuItem key={cls} value={cls}>{cls}</MenuItem>
          ))}
        </Select>
        <Select value={sectionFilter} onChange={(e) => setSectionFilter(e.target.value)} displayEmpty>
          <MenuItem value="">Filter by Section</MenuItem>
          {[...new Set(students.map((s) => s.section))].map((sec) => (
            <MenuItem key={sec} value={sec}>{sec}</MenuItem>
          ))}
        </Select>
        <Select value={selectedStudent} onChange={(e) => setSelectedStudent(e.target.value)} displayEmpty>
          <MenuItem value="">Select Student</MenuItem>
          {filteredStudents.map((s) => (
            <MenuItem key={s.studentId} value={s.studentId}>{s.studentName}</MenuItem>
          ))}
        </Select>
        <Stack direction="row" flexWrap="wrap" spacing={1}>
          {items.map((item) => (
            <Button
              key={item.itemId}
              onClick={() => handleAddItem(item)}
              sx={{ backgroundColor: item.color, color: "white", marginBottom: "0.5rem" }}
            >
              {item.icon} {item.itemName} - ₹{item.price}
            </Button>
          ))}
        </Stack>
        {selectedItems.map((item) => (
          <Box key={item.itemId} display="flex" alignItems="center" gap={2} mb={1}>
            <Typography>{item.itemName}</Typography>
            <TextField
              type="number"
              value={item.quantity}
              onChange={(e) => handleQuantityChange(item.itemId, e.target.value)}
              size="small"
              sx={{ width: "60px" }}
            />
            <Typography>₹{item.price * item.quantity}</Typography>
          </Box>
        ))}
        <Typography>Total Amount: ₹{totalAmount}</Typography>
        <Select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value)}>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="paid">Paid</MenuItem>
        </Select>
        {paymentStatus === "pending" && (
          <TextField
            type="number"
            value={paidAmount}
            onChange={(e) => setPaidAmount(e.target.value)}
            placeholder="Paid Amount"
            variant="outlined"
            size="small"
          />
        )}
        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ mt: 2 }}>
          Create Sale
        </Button>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Student</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Due</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sales.map((s) => (
              <TableRow key={s._id}>
                <TableCell>{new Date(s.date).toLocaleDateString()}</TableCell>
                <TableCell>{s.studentId}</TableCell>
                <TableCell>₹{s.totalAmount}</TableCell>
                <TableCell>{s.paymentStatus}</TableCell>
                <TableCell>₹{s.dueAmount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Stack>
      <Box display="none">
        <Box ref={receiptRef} p={2} sx={{ border: "1px solid #ccc" }}>
          <Typography variant="h6">Receipt</Typography>
          <Typography>
            Student: {students.find((s) => s.studentId === selectedStudent)?.studentName}
          </Typography>
          <Typography>Date: {new Date().toLocaleDateString()}</Typography>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Item</TableCell>
                <TableCell>Qty</TableCell>
                <TableCell>Price</TableCell>
                <TableCell>Total</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {selectedItems.map((i) => (
                <TableRow key={i.itemId}>
                  <TableCell>{i.itemName}</TableCell>
                  <TableCell>{i.quantity}</TableCell>
                  <TableCell>₹{i.price}</TableCell>
                  <TableCell>₹{i.price * i.quantity}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Typography>Total: ₹{totalAmount}</Typography>
          <Typography>Status: {paymentStatus}</Typography>
          {paymentStatus === "pending" && <Typography>Due: ₹{totalAmount - paidAmount}</Typography>}
        </Box>
      </Box>
    </Box>
  );
};

export default Sales;