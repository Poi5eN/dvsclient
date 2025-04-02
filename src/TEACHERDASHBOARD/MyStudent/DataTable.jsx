import React, { useState,useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useStateContext } from "../../contexts/ContextProvider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { useReactToPrint } from "react-to-print";
import { toast } from "react-toastify";
function DynamicDataTable({ data, handleDelete }) {
  const { currentColor } = useStateContext();
  const componentPDF = useRef();
  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: "Admission List",
    onAfterPrint: () => toast.success("Download Successfully"),
  });

const student = JSON.parse(sessionStorage.response);
const classTeacherClass = student.classTeacher;
const classTeacherSection = student.section; // Assuming 'section' is also available in your student data
const filteredData = data.filter(
  (student) => student.class == classTeacherClass && student.section == classTeacherSection
);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);
  const handleDeleteClick = (itemId) => {
    setDeletingItemId(itemId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    handleDelete(deletingItemId);
    setDeleteDialogOpen(false);
    setDeletingItemId(null);
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setDeletingItemId(null);
  };

  const columns = [
    { 
      field: "id", 
      headerName: "S. No.", 
      minWidth: 50, 
      flex: 1, 
      renderCell: (params) => (
        <span style={{ color: "#1a237e", fontSize: "14px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "image.url",
      headerName: "Photo",
      minWidth: 80,
      flex: 1,
      renderCell: (params) => (
        params.row.image && params.row.image.url ? (
          <img
            src={params.row.image?.url  }
            alt="Student"
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              objectFit: "cover",
            }}
          />
        ) : (
          <span><img className="h-10 w-10 rounded-full object-contain" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png" alt="" /></span>
        )
      ),
    },

    {
      field: "fullName",
      headerName: "Student Name",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#01579b", fontSize: "14px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "email",
      headerName: "email",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#01579b", fontSize: "14px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "rollNo",
      headerName: "Roll No.",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <span style={{ color: "#01579b", fontSize: "14px" }}>
          {params.value}
        </span>
      ),
    },
    {
      field: "gender",
      headerName: "Gender",
      minWidth: 80,
      flex: 1,
      renderCell: (params) => (
        <span
          style={{
            color: params.value === "Female" ? "#e91e63" : "#135e83",
            fontSize: "14px",
          }}
        >
          {params.value}
        </span>
      ),
    },
   
    {
      field: "class",
      headerName: "Class",
      minWidth: 100,
      flex: 1,
      renderCell: (params) => (
        <span style={{ fontSize: "14px", color: "#1a237e" }}>
          {`${params.row.class} - ${params.row.section}`}
        </span>
      ),
    },

    {
      field: "actions",
      headerName: "Actions",
      minWidth: 150,
      flex: 1,
      renderCell: (params) => (
        <div>
          <Link to={`/teacher/mystudents/view-profile/${params.row.email}`}>
            <IconButton>
              <VisibilityIcon className="text-blue-600" />
            </IconButton>
          </Link>
          <Link to={`/teacher/mystudents/edit-profile/${params.row.email}`}>
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

  const dataWithIds = Array.isArray(filteredData)
    ? filteredData.map((item, index) => ({ id: index + 1, ...item }))
    : [];

  return (
    <>
     <div className="relative w-full">
      <div className="absolute right-0 -top-[52px]">
        <Button
          variant="contained"
          style={{ backgroundColor: currentColor, color: "white" }}
          onClick={generatePDF}
        >
          Download PDF
        </Button>
      </div>
      <DataGrid
        rows={dataWithIds}
        columns={columns}
        ref={componentPDF}
        className="max-h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white rounded-md overflow-auto w-full"
      />
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
    </>
  );
}

export default DynamicDataTable;

