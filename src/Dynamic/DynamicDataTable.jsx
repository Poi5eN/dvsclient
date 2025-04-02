import React, { useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
function DynamicDataTable({
  data,
  columns,
  idRequired = true,
  tableHeight,
  className,
  itemsPerPage = 15,
  ...rest
}) {
  const [paginationModel, setPaginationModel] = useState({
    pageSize: itemsPerPage,
    page: 0,
  });

  const dataWithIds = Array.isArray(data)
    ? data.map((item, index) => {
        const newItem = { ...item };
        if (idRequired) {
          newItem.id = index + 1;
        }
        return newItem;
      })
    : [];

  // Style customization for the DataGrid
  const CUSTOM_STYLES = {
   
    "& .MuiDataGrid-columnHeaders": {
      backgroundColor: "#f5f5f5",
      color: "#1a237e",
      fontSize: "15px",
      padding:"1px",
      fontWeight: "600",
      minHeight: "40px !important",
      maxHeight: "26px !important",
    //   minHeight: "56px !important",
      // maxHeight: "56px !important",
      // lineHeight: "56px",
      borderBottom: "2px solid #e0e0e0"
    },
    "& .MuiDataGrid-row": {
      // minHeight: "52px !important", // Row height
      // maxHeight: "52px !important",
    //   minHeight: "16px !important",
    //   maxHeight: "26px !important",
      alignItems: "center",
      whiteSpace: "nowrap",
    },
    "& .MuiDataGrid-cell": {
      // padding: "0px 0px !important", 
      padding: "8px 16px", // Cell padding
      whiteSpace: "nowrap",
      // whiteSpace: "normal",
      lineHeight: "1.2"
    },
    "& .MuiDataGrid-virtualScroller": {
      // marginTop: "56px !important" // Should match header height
    },
    "& .MuiDataGrid-footerContainer": {
      minHeight: "12px", // Footer height
      // minHeight: "52px", // Footer height
      borderTop: "1px solid #e0e0e0"
    }
  };

  return (
    <div
      className={
        className ||
        "dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full"
      }
      {...rest}
    >
      <div
        className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto "
        style={{ 
          // height: tableHeight || "75vh",
        //   minHeight: "400px" 
        }}
      >
        <DataGrid
          rows={dataWithIds}
          columns={columns}
          className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white px-4"
          disableColumnFilter
          disableColumnMenu
          disableSelectionOnClick
          disableDensity
          pagination
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          pageSizeOptions={[5, 10, 15, 25, 50]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: itemsPerPage, page: 0 },
            },
          }}
          rowHeight={30} // Adjust row height for visual balance
          headerHeight={30} //
          // sx={CUSTOM_STYLES}
          
        />
      </div>
    </div>
  );
}

export default DynamicDataTable;


