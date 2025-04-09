// src/ADMINDASHBOARD/Inventory/StockDataTable.jsx
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

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

  // Fallback to empty array if data is undefined
  const tableData = Array.isArray(data) ? data : [];

  return (
    <Table sx={{ mt: 3 }}>
      <TableHead>
        <TableRow>
          <TableCell>S. No.</TableCell>
          <TableCell>Item Name</TableCell>
          <TableCell>Category</TableCell>
          <TableCell>Quantity</TableCell>
          <TableCell>Price</TableCell>
          <TableCell>Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tableData.map((item, index) => (
          <TableRow key={item._id}>
            <TableCell>{index + 1}</TableCell>
            <TableCell>{item.itemName}</TableCell>
            <TableCell>{item.category}</TableCell>
            <TableCell>{item.quantity}</TableCell>
            <TableCell>₹{item.price}</TableCell>
            <TableCell>
              <Link to={`/admin/stocks/editstock/${item._id}`}>
                <Button size="small" variant="outlined" sx={{ mr: 1 }}>Edit</Button>
              </Link>
              <Button size="small" color="error" onClick={() => handleDelete(item._id)}>Delete</Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StockDataTable;