// src/ADMINDASHBOARD/Inventory/Stocks.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Box, Typography, Stack, Button, TextField, Grid } from "@mui/material";
import StockDataTable from "./StockDataTable";
import InventoryDashboard from "./InventoryDashboard";

const predefinedItems = [
  { name: "Notebook", icon: "📓", color: "#FF5733" },
  { name: "Pencil", icon: "✏️", color: "#33FF57" },
  { name: "Eraser", icon: "🧼", color: "#3357FF" },
  { name: "Bag", icon: "🎒", color: "#F1C40F" },
];

const Stocks = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ itemName: "", category: "", quantity: "", price: "", icon: "", color: "" });
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true); // Set loading state
        const response = await axios.get("https://dvsserver.onrender.com/api/v1/adminRoute/items", {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.success) {
          setItems(response.data.items || []); // Default to empty array if items is undefined
        } else {
          toast.error(response.data.message || "Failed to fetch items.");
          setItems([]); // Fallback to empty array on failure
        }
      } catch (error) {
        toast.error("Failed to fetch items.");
        setError(error.message);
        setItems([]); // Fallback to empty array on error
      } finally {
        setLoading(false); // Reset loading state
      }
    };
    fetchItems();
  }, []);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData({ ...formData, itemName: item.name, icon: item.icon, color: item.color });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const payload = { ...formData, icon: selectedItem?.icon || "🛒", color: selectedItem?.color || "#000000" };
    try {
      const response = await axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/items", payload, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setItems([...items, response.data.data]);
        setFormData({ itemName: "", category: "", quantity: "", price: "", icon: "", color: "" });
        setSelectedItem(null);
        toast.success("Item created");
      } else toast.error(response.data.message);
    } catch (error) {
      toast.error("Failed to create item.");
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">Error: {error}</Typography>;

  return (
    <Box p={3}>
      <InventoryDashboard />
      <Box mt={3}>
        <Typography variant="h6" gutterBottom>
          Create Stock
        </Typography>
        <Stack direction="row" flexWrap="wrap" spacing={2} mb={2}>
          {predefinedItems.map((item, index) => (
            <Button
              key={index}
              onClick={() => handleSelectItem(item)}
              sx={{ backgroundColor: item.color, color: "white", marginBottom: "0.5rem" }}
            >
              {item.icon} {item.name}
            </Button>
          ))}
        </Stack>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              name="itemName"
              value={formData.itemName}
              onChange={handleInputChange}
              fullWidth
              placeholder="Item Name"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              fullWidth
              placeholder="Category"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleInputChange}
              fullWidth
              placeholder="Quantity"
              variant="outlined"
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              fullWidth
              placeholder="Price"
              variant="outlined"
            />
          </Grid>
        </Grid>
        <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ mt: 2 }}>
          Create Item
        </Button>
      </Box>
      <StockDataTable data={items} />
    </Box>
  );
};

export default Stocks;