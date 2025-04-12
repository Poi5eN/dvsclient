// src/ADMINDASHBOARD/Inventory/StockDataTable.jsx
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Button } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import theme from "../../theme"; // Adjust path as needed
import { ThemeProvider } from "@mui/material/styles";

const StockDataTable = ({ data }) => {
  const handleDelete = async (itemId) => {
    if (window.confirm("Are you sure?")) {
      try {
        const response = await axios.delete(`https://dvsserver.onrender.com/api/v1/adminRoute/items/${itemId}`, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        if (response.data.success) window.location.reload();
        else toast.error(response.data.message);
      } catch (error) {
        toast.error("Failed to delete item.");
      }
    }
  };

  const tableData = Array.isArray(data) ? data : [];

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  return (
    <ThemeProvider theme={theme}>
      <Table sx={{ mt: 4, backgroundColor: "#fff", borderRadius: 2, overflow: "hidden", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <TableHead sx={{ backgroundColor: theme.palette.primary.light }}>
          <TableRow>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>S. No.</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Item Name</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Category</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Quantity</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Price</TableCell>
            <TableCell sx={{ color: "#fff", fontWeight: 600 }}>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.map((item, index) => (
            <motion.tr key={item._id} variants={rowVariants} initial="hidden" animate="visible">
              <TableCell>{index + 1}</TableCell>
              <TableCell>{item.itemName}</TableCell>
              <TableCell>{item.category}</TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>₹{item.price}</TableCell>
              <TableCell>
                <Link to={`/admin/stocks/editstock/${item._id}`}>
                  <Button size="small" variant="outlined" sx={{ mr: 1, color: theme.palette.tertiary.main, "&:hover": { background: theme.palette.tertiary.light } }}>
                    <EditIcon />
                  </Button>
                </Link>
                <Button size="small" color="error" onClick={() => handleDelete(item._id)} sx={{ "&:hover": { background: theme.palette.secondary.light } }}>
                  <DeleteIcon />
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </ThemeProvider>
  );
};

export default StockDataTable;