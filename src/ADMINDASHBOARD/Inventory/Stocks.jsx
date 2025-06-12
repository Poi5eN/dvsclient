import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Box, Typography, Stack, Button, TextField, Grid, Card, CardContent, CircularProgress, Select, MenuItem, Tabs, Tab, Table, TableHead, TableBody, TableRow, TableCell } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import StockDataTable from "./StockDataTable";
import InventoryDashboard from "./InventoryDashboard";
import { motion } from "framer-motion";
import theme from "../../theme";
import { ThemeProvider } from "@mui/material/styles";

const predefinedItems = [
  { name: "Notebook", icon: "📓", color: "#FF5733" },
  { name: "Pencil", icon: "✏️", color: "#33FF57" },
  { name: "Eraser", icon: "🧼", color: "#3357FF" },
  { name: "Bag", icon: "🎒", color: "#F1C40F" },
  { name: "Pen", icon: "🖊️", color: "#9B59B6" },
  { name: "Ruler", icon: "📏", color: "#E67E22" },
  { name: "Calculator", icon: "🧮", color: "#1ABC9C" },
  { name: "Glue", icon: "🧴", color: "#F39C12" },
];

const predefinedCategories = [
  { name: "Stationery", icon: "📚" },
  { name: "Electronics", icon: "💻" },
  { name: "Furniture", icon: "🪑" },
  { name: "Clothing", icon: "👕" },
  { name: "Sports", icon: "⚽" },
];

const Stocks = () => {
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({ itemName: "", category: "", quantity: "", price: "", icon: "", color: "" });
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // Bundle states
  const [bundles, setBundles] = useState([]);
  const [bundleForm, setBundleForm] = useState({ bundleName: "", price: "" });
  const [bundleItems, setBundleItems] = useState([]);
  const [selectedBundleItemId, setSelectedBundleItemId] = useState("");
  const [bundleItemQuantity, setBundleItemQuantity] = useState(1);
  // Tab state
  const [activeTab, setActiveTab] = useState("stocks");

  useEffect(() => {
    fetchItems();
    fetchBundles();
  }, []);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("https://api.digitalvidyasaarthi.in/api/v1/adminRoute/items", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setItems(response.data.listOfAllItems || []);
      } else {
        toast.error(response.data.message || "Failed to fetch items.");
      }
    } catch (error) {
      toast.error("Failed to fetch items.");
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchBundles = async () => {
    try {
      const response = await axios.get("https://api.digitalvidyasaarthi.in/api/v1/adminRoute/bundles", {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setBundles(response.data.data || []);
      } else {
        toast.error(response.data.message || "Failed to fetch bundles.");
      }
    } catch (error) {
      toast.error("Failed to fetch bundles.");
    }
  };

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    setFormData({ ...formData, itemName: item.name, icon: item.icon, color: item.color });
  };

  const handleCategoryChange = (e) => {
    const category = e.target.value;
    setSelectedCategory(category);
    setFormData({ ...formData, category });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async () => {
    const payload = { ...formData, icon: selectedItem?.icon || "🛒", color: selectedItem?.color || "#000000" };
    try {
      const response = await axios.post("https://api.digitalvidyasaarthi.in/api/v1/adminRoute/items", payload, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setItems((prevItems) => [...prevItems, response.data.data]);
        setFormData({ itemName: "", category: "", quantity: "", price: "", icon: "", color: "" });
        setSelectedItem(null);
        setSelectedCategory("");
        toast.success("Item created");
      } else toast.error(response.data.message);
    } catch (error) {
      toast.error("Failed to create item.");
    }
  };

  // Bundle handlers
  const handleBundleInputChange = (e) => {
    const { name, value } = e.target;
    setBundleForm({ ...bundleForm, [name]: value });
  };

  const handleAddItemToBundle = () => {
    if (!selectedBundleItemId || bundleItemQuantity < 1) {
      toast.error("Please select an item and specify a valid quantity.");
      return;
    }
    const item = items.find(i => i.itemId === selectedBundleItemId);
    if (item) {
      setBundleItems([...bundleItems, { itemId: selectedBundleItemId, quantity: parseInt(bundleItemQuantity) }]);
      setSelectedBundleItemId("");
      setBundleItemQuantity(1);
    }
  };

  const handleRemoveBundleItem = (itemId) => {
    setBundleItems(bundleItems.filter(bi => bi.itemId !== itemId));
  };

  const handleCreateBundle = async () => {
    if (!bundleForm.bundleName || !bundleForm.price || bundleItems.length === 0) {
      toast.error("Bundle name, price, and at least one item are required.");
      return;
    }
    try {
      const response = await axios.post("https://api.digitalvidyasaarthi.in/api/v1/adminRoute/bundles", {
        bundleName: bundleForm.bundleName,
        items: bundleItems,
        price: parseFloat(bundleForm.price),
      }, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      if (response.data.success) {
        setBundles([...bundles, response.data.data]);
        setBundleForm({ bundleName: "", price: "" });
        setBundleItems([]);
        toast.success("Bundle created");
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Failed to create bundle.");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  if (loading) return <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}><CircularProgress /></Box>;
  if (error) return <Typography color="error" sx={{ mt: 4, textAlign: "center" }}>Error: {error}</Typography>;

  return (
    <ThemeProvider theme={theme}>
      <Box p={2} sx={{ backgroundColor: "#fff", borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
        <InventoryDashboard items={items} bundles={bundles} />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card sx={{ p: 2, mt: 2, background: "linear-gradient(45deg, #fff 0%, #f1f2f6 100%)" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Create New Stock <AddIcon /></Typography>
              <Stack direction="row" flexWrap="wrap" spacing={1} mb={2}>
                {predefinedItems.map((item, index) => (
                  <Button
                    key={index}
                    onClick={() => handleSelectItem(item)}
                    sx={{ backgroundColor: item.color, color: "#fff", "&:hover": { opacity: 0.9 } }}
                  >
                    {item.icon} {item.name}
                  </Button>
                ))}
              </Stack>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField name="itemName" value={formData.itemName} onChange={handleInputChange} fullWidth placeholder="Item Name" variant="outlined" />
                </Grid>
                <Grid item xs={6}>
                  <Select value={selectedCategory} onChange={handleCategoryChange} displayEmpty fullWidth>
                    <MenuItem value="">Select Category</MenuItem>
                    {predefinedCategories.map((cat, index) => (
                      <MenuItem key={index} value={cat.name}>{cat.icon} {cat.name}</MenuItem>
                    ))}
                  </Select>
                  <TextField
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    fullWidth
                    placeholder="Or enter custom category"
                    variant="outlined"
                    sx={{ mt: 1 }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField type="number" name="quantity" value={formData.quantity} onChange={handleInputChange} fullWidth placeholder="Quantity" variant="outlined" />
                </Grid>
                <Grid item xs={6}>
                  <TextField type="number" name="price" value={formData.price} onChange={handleInputChange} fullWidth placeholder="Price per unit" variant="outlined" />
                </Grid>
              </Grid>
              <Button onClick={handleSubmit} variant="contained" color="primary" sx={{ mt: 2 }}>Create</Button>
            </CardContent>
          </Card>

          {/* Bundle Creation Section */}
          <Card sx={{ p: 2, mt: 2, background: "linear-gradient(45deg, #fff 0%, #f1f2f6 100%)" }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>Create New Bundle <AddIcon /></Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    name="bundleName"
                    value={bundleForm.bundleName}
                    onChange={handleBundleInputChange}
                    fullWidth
                    placeholder="Bundle Name"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    type="number"
                    name="price"
                    value={bundleForm.price}
                    onChange={handleBundleInputChange}
                    fullWidth
                    placeholder="Bundle Price"
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={8}>
                      <Select
                        value={selectedBundleItemId}
                        onChange={(e) => setSelectedBundleItemId(e.target.value)}
                        displayEmpty
                        fullWidth
                      >
                        <MenuItem value="" disabled>Select Item to Add</MenuItem>
                        {items.map((item) => (
                          <MenuItem key={item.itemId} value={item.itemId}>{item.itemName}</MenuItem>
                        ))}
                      </Select>
                    </Grid>
                    <Grid item xs={2}>
                      <TextField
                        type="number"
                        value={bundleItemQuantity}
                        onChange={(e) => setBundleItemQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        fullWidth
                        placeholder="Qty"
                        variant="outlined"
                        inputProps={{ min: 1 }}
                      />
                    </Grid>
                    <Grid item xs={2}>
                      <Button onClick={handleAddItemToBundle} variant="outlined" fullWidth>Add</Button>
                    </Grid>
                  </Grid>
                  {bundleItems.length > 0 && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1">Selected Items:</Typography>
                      {bundleItems.map((bi, index) => (
                        <Box key={index} sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                          <Typography>
                            {items.find(i => i.itemId === bi.itemId)?.itemName || "Unknown"} - Quantity: {bi.quantity}
                          </Typography>
                          <Button
                            size="small"
                            color="error"
                            onClick={() => handleRemoveBundleItem(bi.itemId)}
                            sx={{ ml: 2 }}
                          >
                            Remove
                          </Button>
                        </Box>
                      ))}
                    </Box>
                  )}
                </Grid>
              </Grid>
              <Button onClick={handleCreateBundle} variant="contained" color="primary" sx={{ mt: 2 }}>Create Bundle</Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Tabbed Interface */}
        <Box sx={{ mt: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="stock and bundle tabs">
            <Tab label="Stocks" value="stocks" />
            <Tab label="Bundles" value="bundles" />
          </Tabs>
          {activeTab === "stocks" && <StockDataTable data={items} />}
          {activeTab === "bundles" && (
            <Table sx={{ mt: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Bundle Name</TableCell>
                  <TableCell>Items</TableCell>
                  <TableCell>Price</TableCell>
                  <TableCell>Created At</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {bundles.map((bundle) => (
                  <TableRow key={bundle.bundleId}>
                    <TableCell>{bundle.bundleName}</TableCell>
                    <TableCell>
                      {bundle.items.map((bi, index) => (
                        <div key={index}>
                          {items.find(i => i.itemId === bi.itemId)?.itemName || "Unknown"} (x{bi.quantity})
                        </div>
                      ))}
                    </TableCell>
                    <TableCell>₹{bundle.price.toFixed(2)}</TableCell>
                    <TableCell>{new Date(bundle.createdAt).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Box>
      </Box>
    </ThemeProvider>
  );
};

export default Stocks;