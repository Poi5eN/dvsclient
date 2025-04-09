import React, { useEffect, useState } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";

import { format } from "date-fns";
import { useStateContext } from "../contexts/ContextProvider";


const BookManagement = () => {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [submittedData, setSubmittedData] = useState([]);

  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/getIssueBookToMe`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        if (Array.isArray(response.data.listOfBook)) {
          const formattedData = response.data.listOfBook.map((row) => ({
            ...row,
            issueDate: format(new Date(row.issueDate), "yyyy-MM-dd"), // Format the date
          }));
          setSubmittedData(formattedData);
          // console.log(formattedData);
        } else {
          console.error(
            "Data format is not as expected:",
            response.data.listOfBook
          );
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const columns = [
    { field: "_id", headerName: "Student ID", width: 200 },
    { field: "bookId", headerName: "Book ID", width: 200 },
    { field: "bookName", headerName: "Book Name", width: 200 },
    {
      field: "issueDate",
      headerName: "Issue Date",
      width: 200,
      renderCell: (params) => <span>{params.value}</span>,
    },
  ];

  const getRowId = (row) => row._id; // Use the _id property as the row id

  return (
    <div
      className="dark:text-white dark:bg-secondary-dark-bg "
      style={{ height: "90vh", width: "100%" }}
    >
      <DataGrid
        rows={submittedData}
        columns={columns}
        pageSize={5}
        disableSelectionOnClick
        getRowId={getRowId}
        className="dark:text-white dark:bg-secondary-dark-bg "
      />
    </div>
  );
};

export default BookManagement;
