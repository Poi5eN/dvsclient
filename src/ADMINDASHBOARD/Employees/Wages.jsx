import React, { useState, useEffect } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import axios from "axios";

import { useStateContext } from "../../contexts/ContextProvider";


function DynamicDataTable({ data, handleDelete }) {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState(null);

  useEffect(() => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllEmployees`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.allEmployee;
       
        setData(data.map((item, index) => ({ id: index + 1, ...item })));
      })
      .catch((error) => {
        console.error("Error fetching staff data:", error);
      });
  }, []);

  const [dataWithIds, setData] = useState(
    Array.isArray(data)
      ? data.map((item, index) => ({ id: index + 1, ...item }))
      : []
  );

  const columns = [
    { field: "id", headerName: "S. No.", width: 50 },
    { field: "fullName", headerName: "Full Name", flex: 1 },
    { field: "employeeId", headerName: "Employee ID", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "salary", headerName: "Salary", flex: 1 },
    {
      field: "joiningDate",
      headerName: "Joining Date",
      flex: 1,
      valueFormatter: (params) =>
        new Date(params.value).toLocaleDateString("en-US"),
    },
    // { field: "joiningDate", headerName: "Joining Date", flex: 1 },
    { field: "contact", headerName: "Contact", flex: 1 },
    {
      field: "actions",
      headerName: "Status",
      flex: 1,
      renderCell: (params) => (
        <div>
          <Link to={`/admin/staff/salaryStatus/${params.row.email}`}>
            <IconButton>
              <p
                className="text-[16px] text-gray-100 px-2 py-2 rounded-xl "
                style={{ background: currentColor }}
              >
                Salary status
              </p>
            </IconButton>
          </Link>
        </div>
      ),
    },
  ];

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

  return (
    // <div className="h-[350px]  mx-auto  bg-white mt-2 rounded-md">
    <div className="h-[450px] mx-auto bg-white mt-2 rounded-md overflow-scroll w-full p-3   dark:text-white dark:bg-secondary-dark-bg  ">
      <div className=" min-w-[1000px]  w-full dark:text-white  ">
        <DataGrid rows={dataWithIds} columns={columns} />
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
