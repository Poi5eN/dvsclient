import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import { useStateContext } from "../../contexts/ContextProvider";
import { Button } from "@mui/material";

function DataTable({data , handleDelete}) {
  const { currentColor } = useStateContext();
  const navigate = useNavigate();

    const columns = [
      { field: "id", headerName: "S. No." , width:50 },
      { field: "fullName", headerName: "Full Name" ,flex:1 },
      { field: "employeeId", headerName: "Employee ID", flex:1 },
      { field: "email", headerName: "Email", flex:1 },
      { field: "contact", headerName: "Contact", flex:1 },
      { field: "actions", headerName: "Actions", flex:1,
      renderCell: (params) => (
        <Link to={`/admin/allteachers/salaryStatus/${params.row.email}`}>
          <IconButton>
          <Button
                variant="contained"
                style={{ backgroundColor: currentColor, marginRight: "20px" }}
               
              >
               Salary status
              </Button>
            {/* <p className="text-[16px] text-gray-100 px-2 py-2 rounded-xl " 
            style={{border:`2px solid ${currentColor} `,color:currentColor}}
            >Salary status</p> */}
          </IconButton>
        </Link>
      ),
    },
      ];

  const dataWithIds = Array.isArray(data) ? data.map((item, index) => ({ id: index + 1, ...item})) : [];
  return (
   
    // <div className="h-[350px]  mx-auto  bg-white mt-2 rounded-md">
    <div className="h-[450px] dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full">
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid
        rows={dataWithIds}
        columns={columns}
        className="dark:text-white dark:bg-secondary-dark-bg  mx-auto bg-white"
      />
    </div>
    </div>
  );
}

export default DataTable;