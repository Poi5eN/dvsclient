import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Link} from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useStateContext } from "../../contexts/ContextProvider";


function DynamicDataTable({data , handleDelete}) {
  const {currentColor}=useStateContext()

    const columns = [
      { field: "id", headerName: "S. No." , width:50 },
      { field: "fullName", headerName: "Student Name" , flex:1 },
      { field: "email", headerName: "Email", flex:1 },
      { field: "rollNo", headerName: "Roll No", flex:1 },
      { field: "contact", headerName: "Contact", flex:1 },
      { field: "class", headerName: "Class",  flex:1 },
      { field: "section", headerName: "Section",  flex:1 },
        { field: "actions", headerName: "Actions", flex:1,
          renderCell: (params) => (
            <div>
                  <Link to={`/admin/viewadmitcard/${params.row.email}`}>
                <IconButton>
                  <VisibilityIcon  
                  style={{color:currentColor}}
                  />
                </IconButton>
              </Link>
            </div>
          ),
        },
      ];


  const dataWithIds = Array.isArray(data) ? data.map((item, index) => ({ id: index + 1, ...item})) : [];
  return (
  
    // <div className="h-[350px]  mx-auto  bg-white mt-2 rounded-md">
    <div className="h-[450px] dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
    <div className=" min-w-[1000px]  w-full">
      <DataGrid
        rows={dataWithIds}
        columns={columns}
        className="dark:text-white dark:bg-secondary-dark-bg  mx-auto bg-white"
      />

    </div>
    </div>
  );
}

export default DynamicDataTable;