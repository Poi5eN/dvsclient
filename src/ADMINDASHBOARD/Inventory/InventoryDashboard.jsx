// src/ADMINDASHBOARD/Inventory/InventoryDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Bar, Pie, Line, Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";
import { Box, Typography, Card, CardContent, Select, MenuItem, Grid, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import InventoryIcon from "@mui/icons-material/Inventory";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import CategoryIcon from "@mui/icons-material/Category";
import EqualizerIcon from "@mui/icons-material/Equalizer";
import WarningIcon from "@mui/icons-material/Warning"; // For low stock
import theme from "../../theme";
import { ThemeProvider } from "@mui/material/styles";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale, PointElement, LineElement);

const InventoryDashboard = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("month");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`https://dvsserver.onrender.com/api/v1/adminRoute/inventory/stats?period=${period}&lowStockThreshold=5`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.success) setStats(response.data.stats);
        else toast.error(response.data.message);
      } catch (error) {
        toast.error("Failed to fetch stats.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [period]);

  if (loading) return (
    <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "80vh" }}>
      <CircularProgress />
    </Box>
  );
  if (!stats) return <Typography color="error">No data available</Typography>;

  const topSellingData = {
    labels: stats.topSellingItems.map((item) => item.itemName),
    datasets: [{
      label: "Items Sold",
      data: stats.topSellingItems.map((item) => item.totalSold),
      backgroundColor: ["#3498db", "#e74c3c", "#2ecc71"],
      borderColor: "#fff",
      borderWidth: 1,
    }],
  };

  const revenueData = {
    labels: ["Revenue"],
    datasets: [{
      data: [stats.totalRevenue],
      backgroundColor: ["#e74c3c"],
      borderColor: "#fff",
      borderWidth: 1,
    }],
  };

  const trendData = {
    labels: ["Jan", "Feb", "Mar", "Apr", "May"], // Placeholder; replace with dynamic data if available
    datasets: [{
      label: "Sales Trend",
      data: [100, 200, 150, 300, 250], // Placeholder
      fill: true,
      backgroundColor: "rgba(46, 204, 113, 0.2)",
      borderColor: "#2ecc71",
      tension: 0.4,
    }],
  };

  const categoryData = {
    labels: ["Stationery", "Bags", "Uniforms"], // Placeholder; replace with dynamic data
    datasets: [{
      data: [40, 30, 30], // Placeholder
      backgroundColor: ["#3498db", "#e74c3c", "#2ecc71"],
      borderColor: "#fff",
      borderWidth: 1,
    }],
  };

  const lowStockData = {
    labels: stats.lowStockItems.map((item) => item.itemName),
    datasets: [{
      label: "Low Stock Items",
      data: stats.lowStockItems.map((item) => item.quantity),
      backgroundColor: "#e74c3c",
      borderColor: "#fff",
      borderWidth: 1,
    }],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: "top", labels: { color: theme.palette.text.primary } },
      tooltip: { backgroundColor: "#fff", titleColor: theme.palette.text.primary, bodyColor: theme.palette.text.secondary },
    },
    scales: {
      y: { beginAtZero: true, ticks: { color: theme.palette.text.primary } },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ p: 4, background: "linear-gradient(135deg, #ecf0f1 0%, #dfe6e9 100%)", minHeight: "100vh", borderRadius: 2 }}>
        <Typography variant="h3" gutterBottom sx={{ mb: 4, textAlign: "center", color: theme.palette.primary.main }}>
          Inventory Records
        </Typography>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)} sx={{ mb: 4, minWidth: 150, background: "#fff", borderRadius: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <MenuItem value="day">Day</MenuItem>
          <MenuItem value="month">Month</MenuItem>
          <MenuItem value="year">Year</MenuItem>
        </Select>
        <Grid container spacing={3}>
          {[
            { label: "Total Quantity", value: stats.totalQuantity, icon: <InventoryIcon /> },
            { label: "Total Items Sold", value: stats.totalItemsSold, icon: <ShoppingCartIcon /> },
            { label: "Total Revenue", value: `₹${stats.totalRevenue.toFixed(2)}`, icon: <MonetizationOnIcon /> },
            { label: "Avg Order Value", value: `₹${stats.avgOrderValue.toFixed(2)}`, icon: <EqualizerIcon /> },
            { label: "Total Categories", value: stats.totalCategories, icon: <CategoryIcon /> },
          ].map((stat, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <motion.div variants={cardVariants} initial="hidden" animate="visible">
                <Card sx={{ p: 3, height: "100%", background: "linear-gradient(45deg, #fff 0%, #f1f2f6 100%)", borderLeft: `4px solid ${theme.palette.tertiary.main}` }}>
                  <CardContent>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      {React.cloneElement(stat.icon, { sx: { color: theme.palette.tertiary.main, fontSize: 30, mr: 2 } })}
                      <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>{stat.label}</Typography>
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>{stat.value}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
        <Grid container spacing={3} sx={{ mt: 4 }}>
          <Grid item xs={12} md={6}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <Card sx={{ p: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>Top Selling Items</Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={topSellingData} options={options} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <Card sx={{ p: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>Revenue Distribution</Typography>
                  <Box sx={{ height: 300 }}>
                    <Pie data={revenueData} options={options} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <Card sx={{ p: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>Sales Trend</Typography>
                  <Box sx={{ height: 300 }}>
                    <Line data={trendData} options={options} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <Card sx={{ p: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>Category Breakdown</Typography>
                  <Box sx={{ height: 300 }}>
                    <Doughnut data={categoryData} options={options} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
          <Grid item xs={12} md={6}>
            <motion.div variants={cardVariants} initial="hidden" animate="visible">
              <Card sx={{ p: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.secondary }}>Low Stock Items (&lt; 25)</Typography>
                  <Box sx={{ height: 300 }}>
                    <Bar data={lowStockData} options={options} />
                  </Box>
                </CardContent>
              </Card>
            </motion.div>
          </Grid>
        </Grid>
      </Box>
    </ThemeProvider>
  );
};

export default InventoryDashboard;