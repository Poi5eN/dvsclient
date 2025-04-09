import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";


function DynamicDataTable() {
  const authToken = localStorage.getItem("token");
  const [submittedData, setSubmittedData] = useState([]);

  useEffect(() => {
    // Fetch data from the server when the component mounts
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAllParents",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          }, // Set withCredentials to true
        }
      )
      .then((response) => {
        console.log(response.data.allParent);
        setSubmittedData(response.data.allParent);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const columns = [
    { field: "id", headerName: "S. No.", width: 50 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "fullName", headerName: "Full Name", flex: 1 },
    { field: "motherName", headerName: "Mother Name", flex: 1 },
    { field: "contact", headerName: "Contact", flex: 1 },
  ];

  const dataWithIds = Array.isArray(submittedData)
    ? submittedData.map((item, index) => ({ id: index + 1, ...item }))
    : [];

  return (
    <div className="h-[450px] m-5 dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
      <div className="min-w-[1000px] w-full">
        <DataGrid rows={dataWithIds} columns={columns} />
      </div>
    </div>
  );
}

export default DynamicDataTable;
