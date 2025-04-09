import React from "react";
import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import axios from "axios";

import { useStateContext } from "../../../contexts/ContextProvider";


function DynamicDataTable({ data, updateFetchData }) {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const handleReturn = async (issueId) => {
    try {
       await axios.put(
        `https://dvsserver.onrender.com/api/v1/adminRoute/returnBook/${issueId}`,
        {},
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );


      updateFetchData();
    } catch (error) {
      console.log("Error Message", error.message);
    }
  };

  const columns = [
    { field: "id", headerName: "S. No.", width: 50 },
    { field: "studentId", headerName: "Student Id", flex: 1 },
    { field: "issueDate", headerName: "Issued Date", flex: 1 },

    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      renderCell: (params) => (
        <div>
          <IconButton onClick={() => handleReturn(params.row._id)}>
            <p
              className="text-[16px] text-gray-100 px-2 py-2 rounded-xl "
              style={{ background: currentColor }}
            >
              Return
            </p>
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
    <div className="h-[450px] dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-auto w-full">
      <div style={{ height: 400, width: "100%" }}>
        <DataGrid rows={dataWithIds} columns={columns} />
      </div>
    </div>
  );
}

export default DynamicDataTable;
