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
      minHeight: "16px !important",
      maxHeight: "26px !important",
      // minHeight: "56px !important",
      // maxHeight: "56px !important",
      // lineHeight: "56px",
      borderBottom: "2px solid #e0e0e0"
    },
    "& .MuiDataGrid-row": {
      // minHeight: "52px !important", // Row height
      // maxHeight: "52px !important",
      minHeight: "16px !important",
      maxHeight: "26px !important",
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
        className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md w-full overflow-auto"
        style={{ 
          // height: tableHeight || "75vh",
          minHeight: "400px" 
        }}
      >
        <DataGrid
          rows={dataWithIds}
          columns={columns}
          className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
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
          headerHeight={20} //
          sx={CUSTOM_STYLES}
          
        />
      </div>
    </div>
  );
}

export default DynamicDataTable;


// import React, { useState } from "react";
// import { DataGrid } from "@mui/x-data-grid";

// function DynamicDataTable({
//   data,
//   columns,
//   idRequired = true,
//   tableHeight,
//   className,
//   itemsPerPage = 15,
//   ...rest
// }) {
//   const [paginationModel, setPaginationModel] = useState({
//     pageSize: itemsPerPage,
//     page: 0,
//   });

//   const dataWithIds = Array.isArray(data)
//     ? data.map((item, index) => {
//         const newItem = { ...item };
//         if (idRequired) {
//           newItem.id = index + 1;
//         }
//         return newItem;
//       })
//     : [];

//   return (
//     <div
//       className={
//         className ||
//         "dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full"
//       }
//       {...rest}
//     >
//       <div
//         className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md w-full overflow-auto"
//         style={{ 
//           height: tableHeight || "75vh",
//           minHeight: "400px" 
//         }}
//       >
//         <DataGrid
//           rows={dataWithIds}
//           columns={columns}
//           className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//           disableColumnFilter
//           disableColumnMenu
//           disableSelectionOnClick
//           disableDensity
//           pagination
//           paginationModel={paginationModel}
//           onPaginationModelChange={setPaginationModel}
//           pageSizeOptions={[5, 10, 15, 25, 50]}
//           initialState={{
//             pagination: {
//               paginationModel: { pageSize: itemsPerPage, page: 0 },
//             },
//           }}
//         />
//       </div>
//     </div>
//   );
// }

// export default DynamicDataTable;


// import React from "react";
// import { DataGrid } from "@mui/x-data-grid";

// function DynamicDataTable({
//   data,
//   columns,
//   idRequired = true,
//   tableHeight = "h-[75vh]",
//   className,
//   itemsPerPage = 15,
//   ...rest
// }) {
//   console.log("itemsPerPage type:", typeof itemsPerPage);
//   const dataWithIds = Array.isArray(data)
//     ? data.map((item, index) => {
//         const newItem = { ...item };
//         if (idRequired) {
//           newItem.id = index + 1;
//         }
//         return newItem;
//       })
//     : [];

//   return (
//     <div
//       className={
//         className ||
//         "dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full"
//       }
//       {...rest}
//     >
//       <div
//         className={`dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md w-full overflow-auto`}
//         style={{ height: tableHeight === "h-fit" ? "fit-content" : tableHeight }}
//       >
//         <DataGrid
//           rows={dataWithIds}
//           columns={columns}
//           className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//           disableVirtualization
//           disableColumnFilter
//           disableColumnMenu
//           disableSelectionOnClick
//           disableDensity
//           pagination
//           pageSize={itemsPerPage}
//           rowsPerPageOptions={[itemsPerPage]}
//         />
//       </div>
//     </div>
//   );
// }

// export default DynamicDataTable;


// // DynamicDataTable.jsx
// import React from "react";
// import { DataGrid } from "@mui/x-data-grid";

// function DynamicDataTable({
//   data,
//   columns,
//   idRequired = true,
//   tableHeight = "h-[50vh]",
//   className,
//   itemsPerPage = 5,
//   ...rest
// }) {
//   console.log("itemsPerPage", itemsPerPage)
//   const dataWithIds = Array.isArray(data)
//     ? data.map((item, index) => {
//         const newItem = { ...item };
//         if (idRequired) {
//           newItem.id = index + 1;
//         }
//         return newItem;
//       })
//     : [];

//   return (
//     <div
//       className={
//         className ||
//         "dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full"
//       }
//       {...rest}
//     >
//       <div
//         className={`dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md w-full overflow-auto`}
//         style={{ height: tableHeight === "h-fit" ? "fit-content" : tableHeight }}
//       >
//         <DataGrid
//           rows={dataWithIds}
//           columns={columns}
//           className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//           disableVirtualization
//           disableColumnFilter
//           disableColumnMenu
//           disableSelectionOnClick
//           disableDensity
//           pagination
//           pageSize={itemsPerPage}
//           rowsPerPageOptions={[itemsPerPage]}
//         />
//       </div>
//     </div>
//   );
// }

// export default DynamicDataTable;



// // DynamicDataTable.jsx
// import React from "react";
// import { DataGrid } from "@mui/x-data-grid";

// function DynamicDataTable({
//   data,
//   columns,
//   idRequired = true,
//   tableHeight = "h-[75vh]",
//   className,
//   itemsPerPage = 15,
//   ...rest
// }) {
//   const dataWithIds = Array.isArray(data)
//     ? data.map((item, index) => {
//         const newItem = { ...item };
//         if (idRequired) {
//           newItem.id = index + 1;
//         }
//         return newItem;
//       })
//     : [];

//   return (
//     <div
//       className={
//         className ||
//         "dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full"
//       }
//       {...rest}
//     >
//       <div
//         className={`dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md w-full overflow-auto`}
//         style={{ height: tableHeight === "h-fit" ? "fit-content" : tableHeight }}
//       >
//         <DataGrid
//           rows={dataWithIds}
//           columns={columns}
//           className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//           disableVirtualization
//           disableColumnFilter
//           disableColumnMenu
//           disableSelectionOnClick
//           disableDensity
//           pagination
//           pageSize={itemsPerPage}
//           rowsPerPageOptions={[itemsPerPage]}
//         />
//       </div>
//     </div>
//   );
// }

// export default DynamicDataTable;


// import React from "react";
// import { DataGrid } from "@mui/x-data-grid";

// function DynamicDataTable({
//   data,
//   columns,
//   idRequired = true,
//   tableHeight = "h-[45vh]",
//   className,
//   itemsPerPage = 15,
  
//   ...rest
// }) {
//   const dataWithIds = Array.isArray(data)
//     ? data.map((item, index) => {
//       const newItem = { ...item }; // Copy the original item
//       if (idRequired) {
//          newItem.id = index + 1
//       }
//       return newItem
//       })
//     : [];

//   return (
    
 
// <div
//       className={
//         className ||
//         "dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full"
//       }
//       {...rest}
//     >
//       <div
//         className={`dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md w-full overflow-auto`}
//         style={{ height: tableHeight === "h-fit" ? "fit-content" : tableHeight }}
//       >
//         <DataGrid
//           rows={dataWithIds}
//           columns={columns}
//           className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//           disableVirtualization
//           disableColumnFilter
//           disableColumnMenu
//           disableSelectionOnClick
//           disableDensity
//           pagination
//           pageSize={itemsPerPage}
//           rowsPerPageOptions={[itemsPerPage]}
//         />
//       </div>
//     </div>

// <DynamicDataTable
// data={modifiedData}
// columns={parentColumns}
// handleDelete={handleDelete}
// tableHeight="h-[45vh]"
// className="w-full overflow-auto"
// />
// // or
// <DynamicDataTable
// data={modifiedData}
// columns={parentColumns}
// handleDelete={handleDelete}
// tableHeight="h-fit"
// className="w-full overflow-auto"
// />
//   );
// }

// export default DynamicDataTable;



// import React from "react";
// import { DataGrid } from "@mui/x-data-grid";
// function DynamicDataTable({data , handleDelete}) {
//     const columns = [
//       { field: "id", headerName: "S. No." , width:50 },
//       { field: "admissionNumber", headerName: "Admission No." ,  minWidth:80,
//         renderCell: (params) => (
//           <span style={{ fontSize: "14px", color: "#ff6d00", }}>
//             {params.value}
//           </span>
//         ),
//       },
     
//       { field: "fullName", headerName: "Father Name" ,flex:1, minWidth:80,
//         renderCell: (params) => (
//           <div style={{ whiteSpace: 'pre-line', color: "#01579b", }}>
//             {params.value}
//           </div>
//         ) 
//         },
//       { field: "motherName", headerName: "Mother Name" , flex:1, minWidth:80,
//         renderCell: (params) => (
//           <div style={{ whiteSpace: 'pre-line', color: "#01579b", }}>
//             {params.value}
//           </div>
//         ) 
//         },
//       { field: "email", headerName: "Email", flex:1, minWidth:200,
//         renderCell: (params) => (
//           <span style={{ fontSize: "14px", color: "#1a237e" }}>
//             {params.value}
//           </span>
//         ),
//        },
//       { field: "contact", headerName: "Contact", flex:1, minWidth:80  },
//       { 
//         field: "childName", 
//         headerName: "Children", 
//         flex: 1, 
//          minWidth:100 ,
//         renderCell: (params) => (
//           <div style={{ whiteSpace: 'pre-line', color: "#01579b", }}>
//             {params.value}
//           </div>
//         ) 
//       },
//       { 
//         field: "childAdmissionNo", 
//         headerName: "Admission No", 
//         flex: 1, 
//         minWidth:100 ,
//         renderCell: (params) => (
//           <div style={{ whiteSpace: 'pre-line',color: "#ff6d00", }}>
//             {params.value}
//           </div>
//         ) 
//       },
//       ];

//   const dataWithIds = Array.isArray(data) ? data.map((item, index) => ({
//     id: index + 1, 
//     admissionNumber:item.admissionNumber,
//     email: item.email,
//     fullName: item.fullName,
//     motherName: item.motherName,
//     contact: item.contact,
//     childName: item.children.map((child) => child.fullName).join("\n"),  
//     childAdmissionNo: item.children.map((child) => child.admissionNumber).join("\n"), 
//   })) : [];
//   return (
//     <div className="h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full">
//     <div className="h-[75%] dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full">
//       <DataGrid
//         rows={dataWithIds}
//         columns={columns}
//         className="dark:text-white dark:bg-secondary-dark-bg  mx-auto bg-white"
//       />
//     </div>
//     </div>
//   );
// }

// export default DynamicDataTable;