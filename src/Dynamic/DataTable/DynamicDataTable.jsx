

import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const handleDelete = (id)=>{

}

function DynamicDataTable({ data }) {
    const columns = [
      { field: "fullName", headerName: "Full Name" , width:150 },
      { field: "employeeId", headerName: "Employee ID", width:150 },
      { field: "email", headerName: "Email",  width:150 },
      { field: "dateOfBirth", headerName: "Date of Birth",  width:150 },
      { field: "status", headerName: "Status",  width:150 },
      { field: "qualification", headerName: "Qualification",  width:150 },
      { field: "salary", headerName: "Salary",  width:150 },
      { field: "subject", headerName: "Subject",  width:150 },
      { field: "gender", headerName: "Gender",  width:150 },
      { field: "joiningDate", headerName: "Joining Date",  width:150 },
      { field: "address", headerName: "Address",  width:150 },
      { field: "contact", headerName: "Contact",  width:150 },
      { field: "experience", headerName: "Experience",  width:150 },
      { field: "section", headerName: "Section",  width:150 },
      { field: "classOfStudent", headerName: "Class of Student",  width:150 },
        { field: "actions", headerName: "Actions", width: 150,
          renderCell: (params) => (
            <div>
              <Link to={`/view/${params.row.id}`}>
                <IconButton>
                  <VisibilityIcon />
                </IconButton>
              </Link>
              <Link to={`/edit/${params.row.id}`}>
                <IconButton>
                  <EditIcon />
                </IconButton>
              </Link>
              <IconButton onClick={() => handleDelete(params.row.id)}>
                <DeleteIcon />
              </IconButton>
            </div>
          ),
        },
      ];
      

  const dataWithIds = data.map((item, index) => ({ id: index + 1, ...item }));

  // Hide "No rows" overlay
  const NoRowsOverlay = () => null;

  return (
    // <div className="h-[400px] w-[900px] mx-auto mt-3">
    <div className="h-[350px]  mx-auto  bg-gray-400">
      <DataGrid
        rows={dataWithIds}
        columns={columns}
       
      
      />
    </div>
  );
}

export default DynamicDataTable;


