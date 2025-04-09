import React, { useState, useEffect } from "react";
import axios from "axios";

import { DataGrid } from "@mui/x-data-grid";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import StudentFeeDetails from "./StudentFeeDetails";

function DuesTable() {
  const authToken = localStorage.getItem("token");

  const [submittedData, setSubmittedData] = useState([]);
  const [modalData, setModalData] = useState(null); // Holds the row data for modal
  const [isOpen, setIsOpen] = useState(false); // Initially closed modal

  // Function to handle modal open
  const handleOpenModal = (admissionNumber) => {
    console.log("firstadmissionNumber",admissionNumber)
    setModalData(admissionNumber); // Set row data to modal
    setIsOpen(true); // Open the modal
  };

  // Function to toggle modal
  const toggleModal = () => setIsOpen(!isOpen);

  useEffect(() => {
    axios
      .get(`https://dvsserver.onrender.com/api/v1/fees/getAllStudentsFeeStatus`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        setSubmittedData(response.data.data);
        console.log("response", response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);

  const columns = [
    {
      field: "admissionNumber",
      headerName: "Admission No",
      flex: 1,
      minWidth: 70,
    },
    { field: "fullName", headerName: "Name", flex: 1, minWidth: 120 },
    { field: "class", headerName: "Class", flex: 1, minWidth: 120 },
    {
      field: "feeStatus",
      headerName: "Status",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => {
        let color = "";
        switch (params.value) {
          case "Unpaid":
            color = "red";
            break;
          case "Paid":
            color = "green";
            break;
          case "Partial":
            color = "blue";
            break;
          default:
            color = "black";
        }
        return <span style={{ color }}>{params.value}</span>;
      },
    },
    { field: "totalDues", headerName: "Total Dues", flex: 1, minWidth: 120 },
    {
      field: "actions",
      headerName: "Actions",
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <IconButton onClick={() => handleOpenModal(params.row.admissionNumber)}>
          <VisibilityIcon className="text-blue-600" />
        </IconButton>
      ),
    },
  ];

  const dataWithIds = Array.isArray(submittedData)
    ? submittedData.map((item, index) => ({ id: index + 1, ...item }))
    : [];

  return (
    <div className="relative">
    <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
      <div className=" w-full">
        <DataGrid
          className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
          rows={dataWithIds}
          columns={columns}
        />
      </div>

     
    </div>
    {isOpen && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="top-0 right-0 absolute left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
        >
          <div className="relative" data-aos="fade-down">
            <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
              <h3 className="text-xl font-semibold dark:text-white">
                FEE DETAILS
              </h3>
              <button
                onClick={toggleModal}
                type="button"
                className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
              >
                <svg
                  className="w-3 h-3"
                  aria-hidden="true"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 14 14"
                >
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                  />
                </svg>
                <span className="sr-only">Close modal</span>
              </button>
            </div>
            <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh] overflow-y-auto overflow-x-hidden bg-gray-50">
              {modalData ? (
             
                <StudentFeeDetails  modalData={modalData}/>
              ) : (
                <p>No data available</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DuesTable;
