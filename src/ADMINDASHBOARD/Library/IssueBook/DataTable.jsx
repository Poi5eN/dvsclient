import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import { useStateContext } from "../../../contexts/ContextProvider";
import { Link } from "react-router-dom";
import Issue from "./Issue";

function DynamicDataTable({ data, handleDelete, updateIssueDependency }) {

  const { currentColor } = useStateContext();
  const [openModals, setOpenModals] = useState({}); 

  const handleOpenModal = (rowId) => {

    setOpenModals((prevModals) => ({
      ...prevModals,
      [rowId]: true,
    }));

  };

  const handleCloseModal = (rowId) => {

    setOpenModals((prevModals) => ({
      ...prevModals,
      [rowId]: false,
    }));
    
  };

  const columns = [
      { field: "id", headerName: "S. No." , width:50 },
      { field: "bookName", headerName: "Book Name",width:150 },
      { field: "quantity", headerName: "Quantity" ,width:100},
      { field: "category", headerName: "Category",width:150},
      { field: "className", headerName: "Class Name" ,flex:1},
      { field: "subject", headerName: "Subject" ,width:150},
      {
        field: "actions",
        headerName: "Actions"
        ,width:200,
        renderCell: (params) => (
        <div>        
          <IconButton
         
              onClick={() => handleOpenModal(params.row._id)}
              className="bg-blue-600 text-white "
          >
            
          <p  
          // style={{ backgroundColor: currentColor }} className= " text-white p-2 rounded-md"
          className="text-[16px] text-gray-100 px-2 py-2 rounded-xl " 
          style={{ background:currentColor}}
          >  Issue </p>
         
          </IconButton>
          <Issue
            isOpen={openModals[params.row._id] || false}
            onClose={() => handleCloseModal(params.row._id)}
            bookId={params.row._id} 
            bookName={params.row.bookName}
            updateIssueDependency = {updateIssueDependency}
          />

          <Link to={`/admin/books/return-book/${params.row._id}`}>
          <IconButton >
        
       
                <p    
                 className="text-[16px] text-gray-100 px-2 py-2 rounded-xl " 
                 style={{ background:currentColor}}
                >Issued List</p>

          </IconButton>
          </Link>
         
        </div>
      ),
      width:500 ,innerHeight:200
    },
  ];

  const dataWithIds = Array.isArray(data)
    ? data.map((item, index) => ({ id: index + 1, ...item }))
    : [];

  return (
    
    <div className="h-[450px] dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full">
    <div style={{ height: 400, width: "100%" }}>
      <DataGrid rows={dataWithIds} columns={columns} className="dark:text-white dark:bg-secondary-dark-bg  mx-auto bg-white"/>

    </div>
    </div>
  );
}

export default DynamicDataTable;