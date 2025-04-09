// src/ADMINDASHBOARD/Inventory/InventoryDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from "chart.js";
import { Box, Typography, Stack, Card, CardContent, Select, MenuItem, Grid } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const InventoryDashboard = () => {
  const [stats, setStats] = useState(null);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`https://dvsserver.onrender.com/api/v1/adminRoute/inventory/stats?period=${period}&lowStockThreshold=5`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.success) setStats(response.data.stats);
        else toast.error(response.data.message);
      } catch (error) {
        toast.error("Failed to fetch stats.");
      }
    };
    fetchStats();
  }, [period]);

  if (!stats) return <div>Loading...</div>;

  const topSellingData = {
    labels: stats.topSellingItems.map((item) => item.itemName),
    datasets: [{ label: "Items Sold", data: stats.topSellingItems.map((item) => item.totalSold), backgroundColor: stats.topSellingItems.map((item) => item.color) }],
  };

  const revenueData = {
    labels: ["Revenue"],
    datasets: [{ data: [stats.totalRevenue], backgroundColor: ["#36A2EB"] }],
  };

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Inventory Dashboard
      </Typography>
      <Select value={period} onChange={(e) => setPeriod(e.target.value)} style={{ marginBottom: "1rem" }}>
        <MenuItem value="day">Day</MenuItem>
        <MenuItem value="month">Month</MenuItem>
        <MenuItem value="year">Year</MenuItem>
      </Select>
      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>Total Quantity: {stats.totalQuantity}</CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>Total Items Sold: {stats.totalItemsSold}</CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>Total Revenue: ₹{stats.totalRevenue}</CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>Avg Order Value: ₹{stats.avgOrderValue.toFixed(2)}</CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card><CardContent>Total Categories: {stats.totalCategories}</CardContent></Card>
        </Grid>
      </Grid>
      <Grid container spacing={3} mt={3}>
        <Grid item xs={12} sm={6}>
          <Card><CardContent><Bar data={topSellingData} /></CardContent></Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card><CardContent><Pie data={revenueData} /></CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default InventoryDashboard;