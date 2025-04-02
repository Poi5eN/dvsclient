import React, { useState, useEffect } from "react";
import StudentFeeDetails from "./StudentFeeDetails"; // consider if you still need this
import Table from "../../Dynamic/Table";
import Button from "../../Dynamic/utils/Button";
import DuesPDF from "./DuesPDF";
import { AdminGetAllClasses, AllStudentsFeeStatus } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";

function DuesFees() {
  const {  setIsLoader} = useStateContext();
const [addDues,setAddDues]=useState(false)
  const [submittedData, setSubmittedData] = useState([]);
  const [modalData, setModalData] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState("All");
  const [getClass, setGetClass] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");

  const handleOpenModal = (admissionNumber) => {  // Consider if you still need this
   setModalData(admissionNumber);
   setIsOpen(true);
  };

  const toggleModal = () => setIsOpen(!isOpen); // Consider if you still need this

  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };


  const studentsFeeStatus = async () => {
    setIsLoader(true)
    try {
      const response=await AllStudentsFeeStatus()
      if(response?.success){
        setIsLoader(false)
        setSubmittedData(response?.data);
      }
      else{
        setIsLoader(false)
        toast.error(response?.message)
      }
    } catch (error) {
      setIsLoader(false)
      console.log("error",error)
    }
  }

 
   const getAllClass = async () => {
      setIsLoader(true)
      try {
  
        const response = await AdminGetAllClasses()
        if (response?.success) {
          setIsLoader(false)
          let classes = response.classes;
          setGetClass(classes.sort((a, b) => a - b));
        }
      } catch (error) {
        console.log("error")
      }
    }
  
    useEffect(() => {
      getAllClass()
      studentsFeeStatus()
    }, [])

  const filteredData = submittedData.filter((item) => {
    if (selectedClass === "All") {
      if (selectedStatus === "All") {
        return true;
      } else {
        return item.feeStatus === selectedStatus;
      }
    } else {
      if (selectedStatus === "All") {
        return item.class === selectedClass;
      } else {
        return (
          item.class === selectedClass && item.feeStatus === selectedStatus
        );
      }
    }
  });

  const getStatusButtonClasses = (status) => {
    switch (status) {
      case "Unpaid":
        return selectedStatus === status
          ? "bg-red-500 text-white"
          : "bg-[#f9d4d4] text-gray-700 hover:bg-gray-300";
      case "Paid":
        return selectedStatus === status
          ? "bg-green-500 text-white"
          : "bg-green-500 text-gray-700 hover:bg-gray-300";
      case "Partial":
        return selectedStatus === status
          ? "bg-blue-500 text-white"
          : "bg-blue-500 text-gray-700 hover:bg-gray-300";
      default:
        return selectedStatus === "All"
          ? "bg-blue-500 text-white"
          : "bg-gray-200 text-gray-700 hover:bg-gray-300";
    }
  };

  const tHead = [
    { id: "admissionNo", label: "Admission No" },
    { id: "name", label: "Name" },
    { id: "fatherName", label: "Father Name" },
    { id: "class", label: "Class" },
    { id: "contact", label: "Contact" },
    { id: "feeStatus", label: "feeStatus" },
    { id: "totalDues", label: "Total Dues" },
    { id: "action", label: "Action" },
  ];

  // Correctly format the data for the Table component
  const tBody = filteredData.map((val, ind) => ({
    admissionNo: val.admissionNumber,
    name: val.studentName,
    fatherName: val.fatherName,
    class: val.class,
    contact: val.contact,
    feeStatus: val.feeStatus,
    totalDues: addDues?<input className="border-none outline-none"/>: val.totalDues  ,
    // totalDues: val.totalDues ,
    // onClick={() => handleOpenModal(params.row.admissionNumber)}>
    action:  <button onClick={()=>handleOpenModal(val?.admissionNumber)}>View</button>, // Or a button/link with an onClick handler
  }));
  const handleAddFee=()=>{
    setAddDues(true)
  }

  return (
    <div className="relative p-2">
      
      <div className="flex space-x-2">
        <div className="mb-2">
          <select
            name="studentClass"
            className="w-full border-1 border-black outline-none py-[1px] bg-inherit text-sm h-7" // Added text-sm for smaller text, Reduced padding, set height
            value={selectedClass}
            onChange={handleClassChange}
          >
            <option value="All">All Classes</option>
            {getClass?.map((cls, index) => (
              <option key={index} value={cls.className}>
                {cls?.className}
              </option>
            ))}
          </select>
        </div>
        <button
          className={`py-0.5 px-2 rounded text-sm leading-none ${getStatusButtonClasses(
            "All"
          )}`} // Reduced padding, added text-sm and leading-none
          onClick={() => handleStatusChange("All")}
          style={{ lineHeight: "inherit", height: "1.75rem" }}
        >
          All
        </button>
        <button
          className={`py-0.5 px-2 rounded text-sm bg-[#eb4962] leading-none ${getStatusButtonClasses(
            "Unpaid"
          )}`} // Reduced padding, added text-sm and leading-none
          onClick={() => handleStatusChange("Unpaid")}
          style={{ lineHeight: "inherit", height: "1.75rem",background:"bg-[#eb4962]" }}
        >
          Unpaid
        </button>
        <button
          className={`py-0.5 px-2 rounded bg-[#01f315] text-sm leading-none ${getStatusButtonClasses(
            "Paid"
          )}`} // Reduced padding, added text-sm and leading-none
          onClick={() => handleStatusChange("Paid")}
          style={{ lineHeight: "inherit", height: "1.75rem" }}
        >
          Paid
        </button>
        <button
          className={`py-0.5 px-2 rounded text-sm bg-[#69aad8] leading-none ${getStatusButtonClasses(
            "Partial"
          )}`} // Reduced padding, added text-sm and leading-none
          onClick={() => handleStatusChange("Partial")}
          style={{ lineHeight: "inherit", height: "1.75rem" }}
        >
          Partial
        </button>
      </div>
      <div className="flex gap-3">

      {/* <Button name="Add Dues Fees" onClick={()=>handleAddFee()} /> */}

 {/* {
  addDues &&  <div className="flex gap-3">  <Button name="Save" color="green" />  <Button name="cancel" color="gray " onClick={()=>setAddDues(false)} /></div>
 } */}
      </div>
      <div id="printContent">
          <DuesPDF tBody={tBody} />
        </div>

      <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
        <div className="w-full">
          <Table tHead={tHead} tBody={tBody} />
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
                <StudentFeeDetails modalData={modalData} />
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

export default DuesFees;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import IconButton from "@mui/material/IconButton";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import StudentFeeDetails from "./StudentFeeDetails";
// import Table from "../../Dynamic/Table";

// function DuesFees() {
//   const authToken = Cookies.get("token");

//   const [submittedData, setSubmittedData] = useState([]);
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("All");
//   const [getClass, setGetClass] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("All");

//   const handleOpenModal = (admissionNumber) => {
//     setModalData(admissionNumber);
//     setIsOpen(true);
//   };

//   const toggleModal = () => setIsOpen(!isOpen);

//   const handleClassChange = (event) => {
//     setSelectedClass(event.target.value);
//   };

//   const handleStatusChange = (status) => {
//     setSelectedStatus(status);
//   };

//   useEffect(() => {
//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/fees/getAllStudentsFeeStatus`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         setSubmittedData(response.data.data);
//         console.log("response", response.data.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         let classes = response.data.classList;
//         setGetClass(classes.sort((a, b) => a - b));
//       })
//       .catch((error) => {
//         console.error("Error fetching classes:", error);
//       });
//   }, [authToken]);

//   const filteredData = submittedData.filter((item) => {
//     if (selectedClass === "All") {
//       if (selectedStatus === "All") {
//         return true;
//       } else {
//         return item.feeStatus === selectedStatus;
//       }
//     } else {
//       if (selectedStatus === "All") {
//         return item.class === selectedClass;
//       } else {
//         return (
//           item.class === selectedClass && item.feeStatus === selectedStatus
//         );
//       }
//     }
//   });
// console.log("filteredData",filteredData)

 

//     const getStatusButtonClasses = (status) => {
//       switch (status) {
//         case "Unpaid":
//           return selectedStatus === status ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         case "Paid":
//           return selectedStatus === status ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         case "Partial":
//           return selectedStatus === status ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         default:
//           return selectedStatus === "All" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//       }
//     };

// const tHead = [
//   { id: "admissionNo", label: "Admission No" },
//   { id: "name", label: "Name" },
//   { id: "fatherName", label: "Father Name" },
//   { id: "class", label: "Class" },
//   { id: "contact", label: "Contact" },
//   { id: "status", label: "Status" },
//   { id: "totalDues", label: "Total Dues" },
//   { id: "action", label: "Action" }
// ];

//   return (
//     <div className="relative">
// <div className="flex space-x-2">  
//          <div className="mb-2"> 
//         <select
//           name="studentClass"
//           className="w-full border-1 border-black outline-none py-[1px] bg-inherit text-sm h-7"  // Added text-sm for smaller text, Reduced padding, set height
//           value={selectedClass}
//           onChange={handleClassChange}
//         >
//           <option value="All">All Classes</option>
//           {getClass?.map((cls, index) => (
//             <option key={index} value={cls.className}>
//               {cls?.className}
//             </option>
//           ))}
//         </select>
//       </div>
//         <button
//           className={`py-0.5 px-2 rounded text-sm leading-none ${getStatusButtonClasses("All")}`}  // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("All")}
//           style={{ lineHeight: 'inherit', height: '1.75rem' }}
//         >
//           All
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded text-sm bg-[#eb4962] leading-none ${getStatusButtonClasses("Unpaid")}`}  // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("Unpaid")}
//           style={{ lineHeight: 'inherit', height: '1.75rem' }}
//         >
//           Unpaid
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded bg-[#01f315] text-sm leading-none ${getStatusButtonClasses("Paid")}`}  // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("Paid")}
//           style={{ lineHeight: 'inherit', height: '1.75rem' }}
//         >
//           Paid
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded text-sm bg-[#69aad8] leading-none ${getStatusButtonClasses("Partial")}`}  // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("Partial")}
//           style={{ lineHeight: 'inherit', height: '1.75rem' }}
//         >
//           Partial
//         </button>
//       </div>

//       <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
//         <div className="w-full">
        
//           <Table
//           tHead={tHead}
//            tBody={
//             filteredData?.map((val,ind)=>({
//              "admissionNo":val.admissionNumber,
//              "name":val.fullName,
//              "fatherName":val.fatherName,
//              "class":val.class,
//              "contact":val.contact,
//              "status":val.feeStatus,
//              "totalDues":val.totalDues,
//              "action":"",
            
//             }))
//           }
//             />
           
//         </div>
//       </div>

//     </div>
//   );
// }

// export default DuesFees;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { DataGrid, GridToolbar } from "@mui/x-data-grid";
// import IconButton from "@mui/material/IconButton";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import StudentFeeDetails from "./StudentFeeDetails";

// function DuesFees() {
//   const authToken = Cookies.get("token");

//   const [submittedData, setSubmittedData] = useState([]);
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("All");
//   const [getClass, setGetClass] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("All");

//   const handleOpenModal = (admissionNumber) => {
//     setModalData(admissionNumber);
//     setIsOpen(true);
//   };

//   const toggleModal = () => setIsOpen(!isOpen);

//   const handleClassChange = (event) => {
//     setSelectedClass(event.target.value);
//   };

//   const handleStatusChange = (status) => {
//     setSelectedStatus(status);
//   };

//   useEffect(() => {
//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/fees/getAllStudentsFeeStatus`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         setSubmittedData(response.data.data);
//         console.log("response", response.data.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         let classes = response.data.classList;
//         setGetClass(classes.sort((a, b) => a - b));
//       })
//       .catch((error) => {
//         console.error("Error fetching classes:", error);
//       });
//   }, [authToken]);

//   const filteredData = submittedData.filter((item) => {
//     if (selectedClass === "All") {
//       if (selectedStatus === "All") {
//         return true;
//       } else {
//         return item.feeStatus === selectedStatus;
//       }
//     } else {
//       if (selectedStatus === "All") {
//         return item.class === selectedClass;
//       } else {
//         return (
//           item.class === selectedClass && item.feeStatus === selectedStatus
//         );
//       }
//     }
//   });

//   const getRowClassName = (params) => {
//     switch (params.row.feeStatus) {
//       case "Unpaid":
//         return "row-unpaid";
//       case "Paid":
//         return "row-paid";
//       case "Partial":
//         return "row-partial";
//       default:
//         return "";
//     }
//   };

//   const columns = [
//     {
//       field: "admissionNumber",
//       headerName: "Admission No",
//       flex: 1,
//       minWidth: 70,
//     },
//     { field: "fullName", headerName: "Name", flex: 1, minWidth: 120 },
//     { field: "fatherName", headerName: "Father Name", flex: 1, minWidth: 120 },
//     { field: "class", headerName: "Class", flex: 1, minWidth: 120 },
//     { field: "contact", headerName: "Contact", flex: 1, minWidth: 120 },
//     {
//       field: "feeStatus",
//       headerName: "Status",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => {
//         let color = "";
//         switch (params.value) {
//           case "Unpaid":
//             color = "red";
//             break;
//           case "Paid":
//             color = "green";
//             break;
//           case "Partial":
//             color = "blue";
//             break;
//           default:
//             color = "black";
//         }
//         return <span style={{ color }}>{params.value}</span>;
//       },
//     },
//     { field: "totalDues", headerName: "Total Dues", flex: 1, minWidth: 120 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => (
//         <IconButton onClick={() => handleOpenModal(params.row.admissionNumber)}>
//           <VisibilityIcon className="text-blue-600" />
//         </IconButton>
//       ),
//     },
//   ];

//   const dataWithIds = Array.isArray(filteredData)
//     ? filteredData.map((item, index) => ({ id: index + 1, ...item }))
//     : [];

//     const getStatusButtonClasses = (status) => {
//       switch (status) {
//         case "Unpaid":
//           return selectedStatus === status ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         case "Paid":
//           return selectedStatus === status ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         case "Partial":
//           return selectedStatus === status ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         default:
//           return selectedStatus === "All" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//       }
//     };

//   return (
//     <div className="relative">
      

// <div className="flex space-x-2">  
//          <div className="mb-2"> 
//         <select
//           name="studentClass"
//           className="w-full border-1 border-black outline-none py-[1px] bg-inherit text-sm h-7"  // Added text-sm for smaller text, Reduced padding, set height
//           value={selectedClass}
//           onChange={handleClassChange}
//         >
//           <option value="All">All Classes</option>
//           {getClass?.map((cls, index) => (
//             <option key={index} value={cls.className}>
//               {cls?.className}
//             </option>
//           ))}
//         </select>
//       </div>
//         <button
//           className={`py-0.5 px-2 rounded text-sm leading-none ${getStatusButtonClasses("All")}`}  // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("All")}
//           style={{ lineHeight: 'inherit', height: '1.75rem' }}
//         >
//           All
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded text-sm bg-[#eb4962] leading-none ${getStatusButtonClasses("Unpaid")}`}  // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("Unpaid")}
//           style={{ lineHeight: 'inherit', height: '1.75rem' }}
//         >
//           Unpaid
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded bg-[#01f315] text-sm leading-none ${getStatusButtonClasses("Paid")}`}  // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("Paid")}
//           style={{ lineHeight: 'inherit', height: '1.75rem' }}
//         >
//           Paid
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded text-sm bg-[#69aad8] leading-none ${getStatusButtonClasses("Partial")}`}  // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("Partial")}
//           style={{ lineHeight: 'inherit', height: '1.75rem' }}
//         >
//           Partial
//         </button>
//       </div>

//       <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
//         <div className="w-full">
//           {/* <DataGrid
//             className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//             rows={dataWithIds}
//             columns={columns}
//             getRowClassName={getRowClassName}
//             sx={{
//               "& .MuiDataGrid-cell": {
//                 py: 0, // Removes padding from cells
//               },
//               "& .MuiDataGrid-columnHeader": {
//                 position: "sticky",
//                 top: 0,
//                 zIndex: 1,
//                 backgroundColor: "#fff", // Or your preferred background color
//               },
//             }}
//             components={{
//                 Toolbar: GridToolbar,
//               }}
//           /> */}
//            <DataGrid
//             className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//             rows={dataWithIds}
//             columns={columns}
//             getRowClassName={getRowClassName}
//             sx={{
//               "& .MuiDataGrid-cell": {
//                 py: 0.2, // Reduces vertical padding in cells, the lower the value the smaller the space.
//               },
//               "& .MuiDataGrid-columnHeader": {
//                 position: "sticky",
//                 top: 0,
//                 zIndex: 1,
//                 backgroundColor: "#fff", // Or your preferred background color
//               },
//             }}
//             components={{
//                 Toolbar: GridToolbar,
//               }}
//           />
//         </div>
//       </div>
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="top-0 right-0 absolute left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative" data-aos="fade-down">
//             <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
//               <h3 className="text-xl font-semibold dark:text-white">
//                 FEE DETAILS
//               </h3>
//               <button
//                 onClick={toggleModal}
//                 type="button"
//                 className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//               >
//                 <svg
//                   className="w-3 h-3"
//                   aria-hidden="true"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 14 14"
//                 >
//                   <path
//                     stroke="currentColor"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                   />
//                 </svg>
//                 <span className="sr-only">Close modal</span>
//               </button>
//             </div>
//             <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh] overflow-y-auto overflow-x-hidden bg-gray-50">
//               {modalData ? (
//                 <StudentFeeDetails modalData={modalData} />
//               ) : (
//                 <p>No data available</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DuesFees;




// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { DataGrid } from "@mui/x-data-grid";
// import IconButton from "@mui/material/IconButton";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import StudentFeeDetails from "./StudentFeeDetails";

// function DuesFees() {
//   const authToken = Cookies.get("token");

//   const [submittedData, setSubmittedData] = useState([]);
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("All");
//   const [getClass, setGetClass] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("All");

//   const handleOpenModal = (admissionNumber) => {
//     setModalData(admissionNumber);
//     setIsOpen(true);
//   };

//   const toggleModal = () => setIsOpen(!isOpen);

//   const handleClassChange = (event) => {
//     setSelectedClass(event.target.value);
//   };

//   const handleStatusChange = (status) => {
//     setSelectedStatus(status);
//   };

//   useEffect(() => {
//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/fees/getAllStudentsFeeStatus`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         setSubmittedData(response.data.data);
//         console.log("response", response.data.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         let classes = response.data.classList;
//         setGetClass(classes.sort((a, b) => a - b));
//       })
//       .catch((error) => {
//         console.error("Error fetching classes:", error);
//       });
//   }, [authToken]);

//   const filteredData = submittedData.filter((item) => {
//     if (selectedClass === "All") {
//       if (selectedStatus === "All") {
//         return true;
//       } else {
//         return item.feeStatus === selectedStatus;
//       }
//     } else {
//       if (selectedStatus === "All") {
//         return item.class === selectedClass;
//       } else {
//         return (
//           item.class === selectedClass && item.feeStatus === selectedStatus
//         );
//       }
//     }
//   });

//   const getRowClassName = (params) => {
//     switch (params.row.feeStatus) {
//       case "Unpaid":
//         return "row-unpaid";
//       case "Paid":
//         return "row-paid";
//       case "Partial":
//         return "row-partial";
//       default:
//         return "";
//     }
//   };

//   const columns = [
//     {
//       field: "admissionNumber",
//       headerName: "Admission No",
//       flex: 1,
//       minWidth: 70,
//     },
//     { field: "fullName", headerName: "Name", flex: 1, minWidth: 120 },
//     { field: "class", headerName: "Class", flex: 1, minWidth: 120 },
//     {
//       field: "feeStatus",
//       headerName: "Status",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => {
//         let color = "";
//         switch (params.value) {
//           case "Unpaid":
//             color = "red";
//             break;
//           case "Paid":
//             color = "green";
//             break;
//           case "Partial":
//             color = "blue";
//             break;
//           default:
//             color = "black";
//         }
//         return <span style={{ color }}>{params.value}</span>;
//       },
//     },
//     { field: "totalDues", headerName: "Total Dues", flex: 1, minWidth: 120 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => (
//         <IconButton onClick={() => handleOpenModal(params.row.admissionNumber)}>
//           <VisibilityIcon className="text-blue-600" />
//         </IconButton>
//       ),
//     },
//   ];

//   const dataWithIds = Array.isArray(filteredData)
//     ? filteredData.map((item, index) => ({ id: index + 1, ...item }))
//     : [];

//     const getStatusButtonClasses = (status) => {
//       switch (status) {
//         case "Unpaid":
//           return selectedStatus === status ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         case "Paid":
//           return selectedStatus === status ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         case "Partial":
//           return selectedStatus === status ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         default:
//           return selectedStatus === "All" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//       }
//     };

//   return (
//     <div className="relative">
//       <div className="flex space-x-4 mb-4">
//         <button
//           className={`py-2 px-4 rounded ${getStatusButtonClasses("All")}`}
//           onClick={() => handleStatusChange("All")}
//         >
//           All
//         </button>
//         <button
//           className={`py-2 px-4 rounded ${getStatusButtonClasses("Unpaid")}`}
//           onClick={() => handleStatusChange("Unpaid")}
//         >
//           Unpaid
//         </button>
//         <button
//           className={`py-2 px-4 rounded ${getStatusButtonClasses("Paid")}`}
//           onClick={() => handleStatusChange("Paid")}
//         >
//           Paid
//         </button>
//         <button
//           className={`py-2 px-4 rounded ${getStatusButtonClasses("Partial")}`}
//           onClick={() => handleStatusChange("Partial")}
//         >
//           Partial
//         </button>
//       </div>

//       <div className="mb-4">
//         <select
//           name="studentClass"
//           className="w-full border-1 border-black outline-none py-[3px] bg-inherit"
//           value={selectedClass}
//           onChange={handleClassChange}
//         >
//           <option value="All">All Classes</option>
//           {getClass?.map((cls, index) => (
//             <option key={index} value={cls.className}>
//               {cls?.className}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
//         <div className="w-full">
//           <DataGrid
//             className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//             rows={dataWithIds}
//             columns={columns}
//             getRowClassName={getRowClassName}
//           />
          
//         </div>
//       </div>
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="top-0 right-0 absolute left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative" data-aos="fade-down">
//             <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
//               <h3 className="text-xl font-semibold dark:text-white">
//                 FEE DETAILS
//               </h3>
//               <button
//                 onClick={toggleModal}
//                 type="button"
//                 className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//               >
//                 <svg
//                   className="w-3 h-3"
//                   aria-hidden="true"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 14 14"
//                 >
//                   <path
//                     stroke="currentColor"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                   />
//                 </svg>
//                 <span className="sr-only">Close modal</span>
//               </button>
//             </div>
//             <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh] overflow-y-auto overflow-x-hidden bg-gray-50">
//               {modalData ? (
//                 <StudentFeeDetails modalData={modalData} />
//               ) : (
//                 <p>No data available</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DuesFees;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { DataGrid } from "@mui/x-data-grid";
// import IconButton from "@mui/material/IconButton";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import StudentFeeDetails from "./StudentFeeDetails";

// function DuesFees() {
//   const authToken = Cookies.get("token");

//   const [submittedData, setSubmittedData] = useState([]);
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("All");
//   const [getClass, setGetClass] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("All");

//   const handleOpenModal = (admissionNumber) => {
//     setModalData(admissionNumber);
//     setIsOpen(true);
//   };

//   const toggleModal = () => setIsOpen(!isOpen);

//   const handleClassChange = (event) => {
//     setSelectedClass(event.target.value);
//   };

//   const handleStatusChange = (status) => {
//     setSelectedStatus(status);
//   };

//   useEffect(() => {
//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/fees/getAllStudentsFeeStatus`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         setSubmittedData(response.data.data);
//         console.log("response", response.data.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         let classes = response.data.classList;
//         setGetClass(classes.sort((a, b) => a - b));
//       })
//       .catch((error) => {
//         console.error("Error fetching classes:", error);
//       });
//   }, [authToken]);

//   const filteredData = submittedData.filter((item) => {
//     if (selectedClass === "All") {
//       if (selectedStatus === "All") {
//         return true;
//       } else {
//         return item.feeStatus === selectedStatus;
//       }
//     } else {
//       if (selectedStatus === "All") {
//         return item.class === selectedClass;
//       } else {
//         return (
//           item.class === selectedClass && item.feeStatus === selectedStatus
//         );
//       }
//     }
//   });

//   const columns = [
//     {
//       field: "admissionNumber",
//       headerName: "Admission No",
//       flex: 1,
//       minWidth: 70,
//     },
//     { field: "fullName", headerName: "Name", flex: 1, minWidth: 120 },
//     { field: "class", headerName: "Class", flex: 1, minWidth: 120 },
//     {
//       field: "feeStatus",
//       headerName: "Status",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => {
//         let color = "";
//         switch (params.value) {
//           case "Unpaid":
//             color = "red";
//             break;
//           case "Paid":
//             color = "green";
//             break;
//           case "Partial":
//             color = "blue";
//             break;
//           default:
//             color = "black";
//         }
//         return <span style={{ color }}>{params.value}</span>;
//       },
//     },
//     { field: "totalDues", headerName: "Total Dues", flex: 1, minWidth: 120 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => (
//         <IconButton onClick={() => handleOpenModal(params.row.admissionNumber)}>
//           <VisibilityIcon className="text-blue-600" />
//         </IconButton>
//       ),
//     },
//   ];

//   const dataWithIds = Array.isArray(filteredData)
//     ? filteredData.map((item, index) => ({ id: index + 1, ...item }))
//     : [];

//     const getStatusButtonClasses = (status) => {
//       switch (status) {
//         case "Unpaid":
//           return selectedStatus === status ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         case "Paid":
//           return selectedStatus === status ? "bg-green-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         case "Partial":
//           return selectedStatus === status ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//         default:
//           return selectedStatus === "All" ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//       }
//     };

//   return (
//     <div className="relative">
//       <div className="flex space-x-4 mb-4">
//         <button
//           className={`py-2 px-4 rounded ${getStatusButtonClasses("All")}`}
//           onClick={() => handleStatusChange("All")}
//         >
//           All
//         </button>
//         <button
//           className={`py-2 px-4 rounded ${getStatusButtonClasses("Unpaid")}`}
//           onClick={() => handleStatusChange("Unpaid")}
//         >
//           Unpaid
//         </button>
//         <button
//           className={`py-2 px-4 rounded ${getStatusButtonClasses("Paid")}`}
//           onClick={() => handleStatusChange("Paid")}
//         >
//           Paid
//         </button>
//         <button
//           className={`py-2 px-4 rounded ${getStatusButtonClasses("Partial")}`}
//           onClick={() => handleStatusChange("Partial")}
//         >
//           Partial
//         </button>
//       </div>

//       <div className="mb-4">
//         <select
//           name="studentClass"
//           className="w-full border-1 border-black outline-none py-[3px] bg-inherit"
//           value={selectedClass}
//           onChange={handleClassChange}
//         >
//           <option value="All">All Classes</option>
//           {getClass?.map((cls, index) => (
//             <option key={index} value={cls.className}>
//               {cls?.className}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
//         <div className="w-full">
//           <DataGrid
//             className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//             rows={dataWithIds}
//             columns={columns}
//           />
//         </div>
//       </div>
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="top-0 right-0 absolute left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative" data-aos="fade-down">
//             <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
//               <h3 className="text-xl font-semibold dark:text-white">
//                 FEE DETAILS
//               </h3>
//               <button
//                 onClick={toggleModal}
//                 type="button"
//                 className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//               >
//                 <svg
//                   className="w-3 h-3"
//                   aria-hidden="true"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 14 14"
//                 >
//                   <path
//                     stroke="currentColor"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                   />
//                 </svg>
//                 <span className="sr-only">Close modal</span>
//               </button>
//             </div>
//             <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh] overflow-y-auto overflow-x-hidden bg-gray-50">
//               {modalData ? (
//                 <StudentFeeDetails modalData={modalData} />
//               ) : (
//                 <p>No data available</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DuesFees;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { DataGrid } from "@mui/x-data-grid";
// import IconButton from "@mui/material/IconButton";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import StudentFeeDetails from "./StudentFeeDetails";

// function DuesFees() {
//   const authToken = Cookies.get("token");

//   const [submittedData, setSubmittedData] = useState([]);
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("All"); // "All" means no class filter
//   const [getClass, setGetClass] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("All"); // "All" means no status filter

//   const handleOpenModal = (admissionNumber) => {
//     setModalData(admissionNumber);
//     setIsOpen(true);
//   };

//   const toggleModal = () => setIsOpen(!isOpen);

//   const handleClassChange = (event) => {
//     setSelectedClass(event.target.value);
//   };

//   const handleStatusChange = (status) => {
//     setSelectedStatus(status);
//   };

//   useEffect(() => {
//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/fees/getAllStudentsFeeStatus`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         setSubmittedData(response.data.data);
//         console.log("response", response.data.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });

//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         let classes = response.data.classList;
//         setGetClass(classes.sort((a, b) => a - b));
//       })
//       .catch((error) => {
//         console.error("Error fetching classes:", error);
//       });
//   }, [authToken]);

//   const filteredData = submittedData.filter((item) => {
//     if (selectedClass === "All") {
//       // No class filter
//       if (selectedStatus === "All") {
//         return true; // No class or status filter
//       } else {
//         return item.feeStatus === selectedStatus; // Only status filter
//       }
//     } else {
//       // Class filter applied
//       if (selectedStatus === "All") {
//         return item.class === selectedClass; // Only class filter
//       } else {
//         return (
//           item.class === selectedClass && item.feeStatus === selectedStatus
//         ); // Both class and status filter
//       }
//     }
//   });

//   const columns = [
//     {
//       field: "admissionNumber",
//       headerName: "Admission No",
//       flex: 1,
//       minWidth: 70,
//     },
//     { field: "fullName", headerName: "Name", flex: 1, minWidth: 120 },
//     { field: "class", headerName: "Class", flex: 1, minWidth: 120 },
//     {
//       field: "feeStatus",
//       headerName: "Status",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => {
//         let color = "";
//         switch (params.value) {
//           case "Unpaid":
//             color = "red";
//             break;
//           case "Paid":
//             color = "green";
//             break;
//           case "Partial":
//             color = "blue";
//             break;
//           default:
//             color = "black";
//         }
//         return <span style={{ color }}>{params.value}</span>;
//       },
//     },
//     { field: "totalDues", headerName: "Total Dues", flex: 1, minWidth: 120 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => (
//         <IconButton onClick={() => handleOpenModal(params.row.admissionNumber)}>
//           <VisibilityIcon className="text-blue-600" />
//         </IconButton>
//       ),
//     },
//   ];

//   const dataWithIds = Array.isArray(filteredData)
//     ? filteredData.map((item, index) => ({ id: index + 1, ...item }))
//     : [];

//   return (
//     <div className="relative">
//       <div className="flex space-x-4 mb-4">
//         <button
//           className={`py-2 px-4 rounded ${
//             selectedStatus === "All"
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//           onClick={() => handleStatusChange("All")}
//         >
//           All
//         </button>
//         <button
//           className={`py-2 px-4 rounded ${
//             selectedStatus === "Unpaid"
//               ? "bg-red-500 text-white"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//           onClick={() => handleStatusChange("Unpaid")}
//         >
//           Unpaid
//         </button>
//         <button
//           className={`py-2 px-4 rounded ${
//             selectedStatus === "Paid"
//               ? "bg-green-500 text-white"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//           onClick={() => handleStatusChange("Paid")}
//         >
//           Paid
//         </button>
//         <button
//           className={`py-2 px-4 rounded ${
//             selectedStatus === "Partial"
//               ? "bg-blue-500 text-white"
//               : "bg-gray-200 text-gray-700 hover:bg-gray-300"
//           }`}
//           onClick={() => handleStatusChange("Partial")}
//         >
//           Partial
//         </button>
//       </div>

//       <div className="mb-4">
//         <select
//           name="studentClass"
//           className="w-full border-1 border-black outline-none py-[3px] bg-inherit"
//           value={selectedClass}
//           onChange={handleClassChange}
//         >
//           <option value="All">All Classes</option>
//           {getClass?.map((cls, index) => (
//             <option key={index} value={cls.className}>
//               {cls?.className}
//             </option>
//           ))}
//         </select>
//       </div>

//       <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
//         <div className="w-full">
//           <DataGrid
//             className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//             rows={dataWithIds}
//             columns={columns}
//           />
//         </div>
//       </div>
//       {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="top-0 right-0 absolute left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative" data-aos="fade-down">
//             <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
//               <h3 className="text-xl font-semibold dark:text-white">
//                 FEE DETAILS
//               </h3>
//               <button
//                 onClick={toggleModal}
//                 type="button"
//                 className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//               >
//                 <svg
//                   className="w-3 h-3"
//                   aria-hidden="true"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 14 14"
//                 >
//                   <path
//                     stroke="currentColor"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                   />
//                 </svg>
//                 <span className="sr-only">Close modal</span>
//               </button>
//             </div>
//             <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh] overflow-y-auto overflow-x-hidden bg-gray-50">
//               {modalData ? (
//                 <StudentFeeDetails modalData={modalData} />
//               ) : (
//                 <p>No data available</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DuesFees;




// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { DataGrid } from "@mui/x-data-grid";
// import IconButton from "@mui/material/IconButton";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import StudentFeeDetails from "./StudentFeeDetails";

// function DuesFees() {
//   const authToken = Cookies.get("token");

//   const [submittedData, setSubmittedData] = useState([]);
//   const [modalData, setModalData] = useState(null); // Holds the row data for modal
//   const [isOpen, setIsOpen] = useState(false); // Initially closed modal

//   // Function to handle modal open
//   const handleOpenModal = (admissionNumber) => {
//     console.log("firstadmissionNumber",admissionNumber)
//     setModalData(admissionNumber); // Set row data to modal
//     setIsOpen(true); // Open the modal
//   };

//   // Function to toggle modal
//   const toggleModal = () => setIsOpen(!isOpen);

//   useEffect(() => {
//     axios
//       .get(`https://eserver-i5sm.onrender.com/api/v1/fees/getAllStudentsFeeStatus`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         setSubmittedData(response.data.data);
//         console.log("response", response.data.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);

//   const columns = [
//     {
//       field: "admissionNumber",
//       headerName: "Admission No",
//       flex: 1,
//       minWidth: 70,
//     },
//     { field: "fullName", headerName: "Name", flex: 1, minWidth: 120 },
//     { field: "class", headerName: "Class", flex: 1, minWidth: 120 },
//     {
//       field: "feeStatus",
//       headerName: "Status",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => {
//         let color = "";
//         switch (params.value) {
//           case "Unpaid":
//             color = "red";
//             break;
//           case "Paid":
//             color = "green";
//             break;
//           case "Partial":
//             color = "blue";
//             break;
//           default:
//             color = "black";
//         }
//         return <span style={{ color }}>{params.value}</span>;
//       },
//     },
//     { field: "totalDues", headerName: "Total Dues", flex: 1, minWidth: 120 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       flex: 1,
//       minWidth: 120,
//       renderCell: (params) => (
//         <IconButton onClick={() => handleOpenModal(params.row.admissionNumber)}>
//           <VisibilityIcon className="text-blue-600" />
//         </IconButton>
//       ),
//     },
//   ];

//   const dataWithIds = Array.isArray(submittedData)
//     ? submittedData.map((item, index) => ({ id: index + 1, ...item }))
//     : [];

//   return (
//     <div className="relative">
//     <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
//       <div className="w-full">
//         <DataGrid
//           className="dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white"
//           rows={dataWithIds}
//           columns={columns}
//         />
//       </div>
//     </div>
//     {isOpen && (
//         <div
//           id="default-modal"
//           tabIndex="-1"
//           aria-hidden="true"
//           className="top-0 right-0 absolute left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//         >
//           <div className="relative" data-aos="fade-down">
//             <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
//               <h3 className="text-xl font-semibold dark:text-white">
//                 FEE DETAILS
//               </h3>
//               <button
//                 onClick={toggleModal}
//                 type="button"
//                 className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//               >
//                 <svg
//                   className="w-3 h-3"
//                   aria-hidden="true"
//                   xmlns="http://www.w3.org/2000/svg"
//                   fill="none"
//                   viewBox="0 0 14 14"
//                 >
//                   <path
//                     stroke="currentColor"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth="2"
//                     d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                   />
//                 </svg>
//                 <span className="sr-only">Close modal</span>
//               </button>
//             </div>
//             <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh] overflow-y-auto overflow-x-hidden bg-gray-50">
//               {modalData ? (
             
//                 <StudentFeeDetails  modalData={modalData}/>
//               ) : (
//                 <p>No data available</p>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }

// export default DuesFees;