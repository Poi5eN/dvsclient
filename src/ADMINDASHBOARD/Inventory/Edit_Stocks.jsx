// src/ADMINDASHBOARD/Inventory/Edit_Stocks.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Stack, TextField, Button, Card, CardContent } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { motion } from "framer-motion";
import theme from "../../theme"; // Adjust path as needed
import { ThemeProvider } from "@mui/material/styles";

const EditStocks = () => {
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const { _id } = useParams();
  const [formData, setFormData] = useState({ itemName: "", category: "", quantity: "", price: "", icon: "", color: "" });

  useEffect(() => {
    axios
      .get(`https://dvsserver.onrender.com/api/v1/adminRoute/items?_id=${_id}`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        const item = response.data.items[0];
        setFormData({
          itemName: item.itemName,
          category: item.category,
          quantity: item.quantity,
          price: item.price,
          icon: item.icon,
          color: item.color,
        });
      })
      .catch((error) => toast.error("Failed to fetch item."));
  }, [_id]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.put(`https://dvsserver.onrender.com/api/v1/adminRoute/items/${_id}`, formData, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.data.success) {
        navigate("/admin/stocks");
        toast.success("Item updated");
      } else toast.error(response.data.message);
    } catch (error) {
      toast.error("Failed to update item.");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Box mt={4} maxWidth={900} mx="auto" p={2}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card sx={{ p: 4, background: "linear-gradient(45deg, #fff 0%, #f1f2f6 100%)", borderLeft: `4px solid ${theme.palette.accent.main}` }}>
            <CardContent>
              <Typography variant="h4" gutterBottom sx={{ color: theme.palette.primary.main }}>
                Edit Stock <EditIcon sx={{ verticalAlign: "middle", color: theme.palette.accent.main }} />
              </Typography>
              <Stack spacing={3}>
                <TextField name="itemName" value={formData.itemName} onChange={handleInputChange} fullWidth placeholder="Item Name" variant="outlined" />
                <TextField name="category" value={formData.category} onChange={handleInputChange} fullWidth placeholder="Category" variant="outlined" />
                <TextField type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} fullWidth placeholder="Quantity" variant="outlined" />
                <TextField type="number" name="price" value={formData.price} onChange={handleInputChange} fullWidth placeholder="Price" variant="outlined" />
                <TextField name="icon" value={formData.icon} onChange={handleInputChange} fullWidth placeholder="Icon (e.g., 📓)" variant="outlined" />
                <TextField name="color" value={formData.color} onChange={handleInputChange} fullWidth placeholder="Color (e.g., #FF5733)" variant="outlined" />
                <Stack direction="row" justifyContent="flex-end" spacing={2}>
                  <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ width: 120 }}>
                    Update
                  </Button>
                  <Button variant="outlined" onClick={() => navigate("/admin/stocks")} sx={{ width: 120, color: theme.palette.text.primary }}>
                    Cancel
                  </Button>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </motion.div>
      </Box>
    </ThemeProvider>
  );
};

export default EditStocks;