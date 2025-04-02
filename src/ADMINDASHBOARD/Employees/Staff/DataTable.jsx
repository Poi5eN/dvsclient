import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";

function DynamicDataTable({ data, handleDelete }) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  const handleDeleteClick = (item) => {
    setDeletingItem(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDelete(deletingItem);
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingItem(null);
  };

  const columns = [
    { field: "id", headerName: "S. No.", width: 50 },
    { field: "staffName", headerName: "Name", flex: 1 },
    // { field: "employeeId", headerName: "Employee ID", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "salary", headerName: "Salary", flex: 1 },
    {
      field: "joiningDate",
      headerName: "Joining Date",
      flex: 1,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString("en-US"),
    },
    { field: "contact", headerName: "Contact", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div>
          <Link to={`/admin/staff/view-profile/${params.row.email}`}>
            <IconButton>
              <VisibilityIcon className="text-blue-600" />
            </IconButton>
          </Link>
          <Link to={`/admin/staff/edit-profile/${params.row.staffId}`}>
            <IconButton>
              <EditIcon className="text-green-600" />
            </IconButton>
          </Link>
          <IconButton onClick={() => handleDeleteClick(params.row.email)}>
            <DeleteIcon className="text-red-600" />
          </IconButton>
        </div>
      ),
    },
  ];
  const dataWithIds = Array.isArray(data)
    ? data.map((item, index) => ({ id: index + 1, ...item }))
    : [];
  return (
    // <div className="h-[350px]  mx-auto  bg-white mt-2 rounded-md">
    <div className="h-[450px] dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
      <div className=" min-w-[1000px]  w-full">
        <DataGrid rows={dataWithIds} columns={columns} className="dark:text-white dark:bg-secondary-dark-bg  mx-auto bg-white" />
      </div>
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Do you really want to delete this item?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete} color="primary">
            No
          </Button>
          <Button onClick={handleConfirmDelete} color="primary">
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default DynamicDataTable;
