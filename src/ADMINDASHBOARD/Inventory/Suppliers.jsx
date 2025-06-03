import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Box, Typography, Stack, Button, TextField, Grid, Card, CardContent, Table, TableBody, TableCell, TableHead, TableRow, MenuItem } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { motion } from "framer-motion";
import theme from "../../theme";
import { ThemeProvider } from "@mui/material/styles";

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [supplierForm, setSupplierForm] = useState({ name: "", contact: "", address: "" });
  const [paymentForm, setPaymentForm] = useState({ supplierId: "", amount: "", paymentMode: "", description: "" });
  const [payments, setPayments] = useState([]);
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuppliers();
    fetchPayments();
    fetchPurchaseOrders();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://dvsserver.onrender.com/api/v1/adminRoute/suppliers", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) setSuppliers(response.data.data || []);
      else toast.error(response.data.message || "Failed to fetch suppliers.");
    } catch (error) {
      toast.error("Failed to fetch suppliers.");
    } finally {
      setLoading(false);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await axios.get("https://dvsserver.onrender.com/api/v1/adminRoute/supplier-payments", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) setPayments(response.data.data || []);
      else toast.error(response.data.message || "Failed to fetch payments.");
    } catch (error) {
      toast.error("Failed to fetch payments.");
    }
  };

  const fetchPurchaseOrders = async () => {
    try {
      const response = await axios.get("https://dvsserver.onrender.com/api/v1/adminRoute/purchaseorders", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) setPurchaseOrders(response.data.data || []);
      else toast.error(response.data.message || "Failed to fetch purchase orders.");
    } catch (error) {
      toast.error("Failed to fetch purchase orders.");
    }
  };

  const calculateSupplierDues = (supplierId) => {
    const totalOrders = purchaseOrders
      .filter(po => po.supplierId === supplierId)
      .reduce((sum, po) => sum + (po.totalCost || 0), 0);
    const totalPayments = payments
      .filter(p => p.supplierId === supplierId)
      .reduce((sum, p) => sum + (p.amount || 0), 0);
    return Math.max(0, totalOrders - totalPayments);
  };

  const handleSupplierInputChange = (e) => {
    const { name, value } = e.target;
    setSupplierForm({ ...supplierForm, [name]: value });
  };

  const handlePaymentInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentForm({ ...paymentForm, [name]: value });
  };

  const handleCreateSupplier = async () => {
    try {
      const response = await axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/suppliers", supplierForm, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setSuppliers([...suppliers, response.data.data]);
        setSupplierForm({ name: "", contact: "", address: "" });
        toast.success("Supplier created");
      } else toast.error(response.data.message);
    } catch (error) {
      toast.error("Failed to create supplier.");
    }
  };

  const handleDeleteSupplier = async (supplierId) => {
    if (window.confirm("Are you sure?")) {
      try {
        const response = await axios.delete(`https://dvsserver.onrender.com/api/v1/adminRoute/suppliers/${supplierId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.success) {
          setSuppliers(suppliers.filter(s => s.supplierId !== supplierId));
          toast.success("Supplier deleted");
        } else toast.error(response.data.message);
      } catch (error) {
        toast.error("Failed to delete supplier.");
      }
    }
  };

  const handleCreatePayment = async () => {
    try {
      const response = await axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/supplier-payments", paymentForm, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setPayments([...payments, response.data.data]);
        setPaymentForm({ supplierId: "", amount: "", paymentMode: "", description: "" });
        toast.success("Payment recorded");
      } else toast.error(response.data.message);
    } catch (error) {
      toast.error("Failed to record payment.");
    }
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><Typography>Loading...</Typography></Box>;

  return (
    <ThemeProvider theme={theme}>
      <Box p={2} sx={{ backgroundColor: "#fff", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card sx={{ p: 2, mt: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Create New Supplier <AddIcon /></Typography>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <TextField name="name" value={supplierForm.name} onChange={handleSupplierInputChange} fullWidth placeholder="Supplier Name" variant="outlined" />
                </Grid>
                <Grid item xs={4}>
                  <TextField name="contact" value={supplierForm.contact} onChange={handleSupplierInputChange} fullWidth placeholder="Contact" variant="outlined" />
                </Grid>
                <Grid item xs={4}>
                  <TextField name="address" value={supplierForm.address} onChange={handleSupplierInputChange} fullWidth placeholder="Address" variant="outlined" />
                </Grid>
              </Grid>
              <Button onClick={handleCreateSupplier} variant="contained" color="primary" sx={{ mt: 2 }}>Create Supplier</Button>
            </CardContent>
          </Card>

          <Card sx={{ p: 2, mt: 2 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Record Supplier Payment <AddIcon /></Typography>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <TextField
                    select
                    name="supplierId"
                    value={paymentForm.supplierId}
                    onChange={handlePaymentInputChange}
                    fullWidth
                    variant="outlined"
                  >
                    <MenuItem value="">Select Supplier</MenuItem>
                    {suppliers.map(s => (
                      <MenuItem key={s.supplierId} value={s.supplierId}>{s.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={3}>
                  <TextField type="number" name="amount" value={paymentForm.amount} onChange={handlePaymentInputChange} fullWidth placeholder="Amount" variant="outlined" />
                </Grid>
                <Grid item xs={3}>
                  <TextField
                    select
                    name="paymentMode"
                    value={paymentForm.paymentMode}
                    onChange={handlePaymentInputChange}
                    fullWidth
                    variant="outlined"
                  >
                    <MenuItem value="">Select Mode</MenuItem>
                    <MenuItem value="Cash">Cash</MenuItem>
                    <MenuItem value="Card">Card</MenuItem>
                    <MenuItem value="Online">Online</MenuItem>
                    <MenuItem value="Cheque">Cheque</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={3}>
                  <TextField name="description" value={paymentForm.description} onChange={handlePaymentInputChange} fullWidth placeholder="Description" variant="outlined" />
                </Grid>
              </Grid>
              <Button onClick={handleCreatePayment} variant="contained" color="primary" sx={{ mt: 2 }}>Record Payment</Button>
            </CardContent>
          </Card>

          <Table sx={{ mt: 4 }}>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Address</TableCell>
                <TableCell>Dues</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {suppliers.map(s => (
                <TableRow key={s.supplierId}>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.contact}</TableCell>
                  <TableCell>{s.address}</TableCell>
                  <TableCell>₹{calculateSupplierDues(s.supplierId).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button size="small" variant="outlined" sx={{ mr: 1 }}><EditIcon /></Button>
                    <Button size="small" color="error" onClick={() => handleDeleteSupplier(s.supplierId)}><DeleteIcon /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Table sx={{ mt: 4 }}>
            <TableHead>
              <TableRow>
                <TableCell>Supplier</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Mode</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {payments.map(p => (
                <TableRow key={p.paymentId}>
                  <TableCell>{suppliers.find(s => s.supplierId === p.supplierId)?.name || "N/A"}</TableCell>
                  <TableCell>₹{p.amount}</TableCell>
                  <TableCell>{p.paymentMode}</TableCell>
                  <TableCell>{p.description}</TableCell>
                  <TableCell>{new Date(p.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
};

export default Suppliers;