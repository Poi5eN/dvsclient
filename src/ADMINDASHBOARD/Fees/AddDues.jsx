import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import Table from "../../Dynamic/Table";
import Button from "../../Dynamic/utils/Button";
import { AdminGetAllClasses, feesaddPastDues, getAllStudents, PastDues } from "../../Network/AdminApi";

import { useStateContext } from "../../contexts/ContextProvider";

function AddDues() {
  const session =JSON.parse(localStorage.getItem("session"))
const {  setIsLoader} = useStateContext();
  const [addDues, setAddDues] = useState(false);
  const [submittedData, setSubmittedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // Now an array of objects
  const [allSelect, setAllSelect] = useState(false);
  const [selectedClass, setSelectedClass] = useState("All");
  const [getClass, setGetClass] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("All");



   const getAllStudent = async () => {
      setIsLoader(true)
      try {
        const response = await getAllStudents();
        if (response?.success) {
          setIsLoader(false)
          setSubmittedData(response?.students?.data);
          
          // setSubmittedData(filterApproved);
          // setFilteredData(filterApproved);
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.log("error", error);
      }
    };

    useEffect(()=>{
      getAllStudent()
      getAllClass()
    },[])
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
    
  const handleClassChange = (event) => {
    setSelectedClass(event.target.value);
  };

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
  };

  const filteredData = submittedData?.filter((item) => {
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
        return item.class === selectedClass && item.feeStatus === selectedStatus;
      }
    }
  });

  const handleRowSelect = (row) => {
    setSelectedRows((prevSelectedRows) => {
      const isSelected = prevSelectedRows.some(
        (item) => item.admissionNumber === row.admissionNumber
      );

      if (isSelected) {
        return prevSelectedRows?.filter((item) => item.admissionNumber !== row.admissionNumber);
      } else {
        return [...prevSelectedRows, row];
      }
    });
  };

  const handleAllSelect = () => {
    if (allSelect) {
      setSelectedRows([]); // Deselect all
    } else {
      setSelectedRows(filteredData); // Select all filtered rows
    }
    setAllSelect(!allSelect);
  };

  const handleTotalDuesChange = (e, admissionNumber) => {
    const newAmount = e.target.value;

    setSelectedRows((prevSelectedRows) =>
      prevSelectedRows.map((row) =>
        row.admissionNumber === admissionNumber ? { ...row, totalDues: newAmount } : row
      )
    );
  };

  const tHead = [
    {
      id: "select",
      label: (
        <input type="checkbox" onChange={handleAllSelect} checked={allSelect} />
      ),
    },
    { id: "admissionNo", label: "Admission No" },
    { id: "name", label: "Name" },
    { id: "fatherName", label: "Father Name" },
    { id: "class", label: "Class" },
    { id: "totalDues", label: "Total Dues" },
  ];

  const tBody = filteredData?.map((val) => ({
    select: (
      <input
        type="checkbox"
        checked={selectedRows.some((row) => row.admissionNumber === val.admissionNumber)}
        onChange={() => handleRowSelect(val)}
      />
    ),
    admissionNo: val.admissionNumber,
    name: val.studentName,
    fatherName: val.fatherName,
    class: val.class,
    totalDues: addDues ? (
      <input
      type="number"
        className="border-none outline "
        value={
          selectedRows.find((row) => row.admissionNumber === val.admissionNumber)?.totalDues || ""
        }
        onChange={(e) => handleTotalDuesChange(e, val.admissionNumber)}
      />
    ) : (
      val.totalDues
    ),
  }));

  const handleAddFee = async () => {
    setAddDues(true);

   
  };

  const handleSave = async() => {
    if (selectedRows.length === 0) {
      toast.warn("No students selected.");
      return;
    }
    setIsLoader(true)
    const payload = {
      students: selectedRows.map((val) => ({
        studentId: val?.studentId,
        pastDuesAmount: Number(val?.totalDues),
        session: session,
      })),
    };
  


   
    try {
      const response = await PastDues(payload);
      if (response?.success) {
        setIsLoader(false)
        toast.success(response?.message);
       
        setSelectedRows([]);
        setAllSelect(false);
        setAddDues(false);
      }
      else{
        setIsLoader(false)
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("Error", error);
      setIsLoader(false)
    }
 
  };

  return (
    <div className="relative p-2">
      {/* <h1 className="text-xl text-center font-sans font-bold ">ADD DUES</h1> */}
      <div className="flex space-x-2">
        {/* <div className="mb-2">
          <select
            name="studentClass"
            className="w-full border-1 border-black outline-none py-[1px] bg-inherit text-sm h-7"
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
        </div> */}

        {/* {["All", "Unpaid", "Paid", "Partial"].map((status) => (
          <button
            key={status}
            className="py-0.5 px-2 rounded text-sm leading-none"
            onClick={() => handleStatusChange(status)}
          >
            {status}
          </button>
        ))} */}
      </div>

      <div className="flex gap-2">
      <select
            name="studentClass"
            className=" border-1 border-black outline-none py-[1px] bg-inherit text-sm h-7"
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
        <Button name="Add Dues Fees" onClick={handleAddFee} />
        {addDues && (
          <div className="flex gap-3">
            <Button name="Save" color="green" onClick={handleSave} />
            <Button name="Cancel" color="gray" onClick={() => setAddDues(false)} />
          </div>
        )}
      </div>
    
      {/* <div className=" dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full"> */}
        <Table tHead={tHead} tBody={tBody} />
      {/* </div> */}
    </div>
  );
}

export default AddDues;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// import Table from "../../Dynamic/Table";
// import Button from "../../Dynamic/utils/Button";
// import { feesaddPastDues } from "../../Network/AdminApi";

// function AddDues() {
//   const authToken = localStorage.getItem("token");
//   const [addDues, setAddDues] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [selectedRows, setSelectedRows] = useState([]); // Now an array of objects
//   const [allSelect, setAllSelect] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("All");
//   const [getClass, setGetClass] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("All");

//   console.log("selectedRows", selectedRows);

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const feesResponse = await axios.get(
//           `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents`,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
//         setSubmittedData(feesResponse?.data?.allStudent);
//       } catch (error) {
//         console.error("Error fetching fees data:", error);
//       }

//       try {
//         const classesResponse = await axios.get(
//           `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
//         let classes = classesResponse.data.classList;
//         setGetClass(classes.sort((a, b) => a - b));
//       } catch (error) {
//         console.error("Error fetching classes:", error);
//       }
//     };

//     fetchData();
//   }, [authToken]);

//   const handleClassChange = (event) => {
//     setSelectedClass(event.target.value);
//   };

//   const handleStatusChange = (status) => {
//     setSelectedStatus(status);
//   };

//   const filteredData = submittedData?.filter((item) => {
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
//         return item.class === selectedClass && item.feeStatus === selectedStatus;
//       }
//     }
//   });

//   const getStatusButtonClasses = (status) => {
//     switch (status) {
//       case "Unpaid":
//         return selectedStatus === status
//           ? "bg-red-500 text-white"
//           : "bg-[#f9d4d4] text-gray-700 hover:bg-gray-300";
//       case "Paid":
//         return selectedStatus === status
//           ? "bg-green-500 text-white"
//           : "bg-green-500 text-gray-700 hover:bg-gray-300";
//       case "Partial":
//         return selectedStatus === status
//           ? "bg-blue-500 text-white"
//           : "bg-blue-500 text-gray-700 hover:bg-gray-300";
//       default:
//         return selectedStatus === "All"
//           ? "bg-blue-500 text-white"
//           : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//     }
//   };

//   const handleRowSelect = (row) => {
//     setSelectedRows((prevSelectedRows) => {
//       const isSelected = prevSelectedRows.some(
//         (item) => item.admissionNumber === row.admissionNumber
//       );

//       if (isSelected) {
//         return prevSelectedRows.filter((item) => item.admissionNumber !== row.admissionNumber);
//       } else {
//         return [...prevSelectedRows, row];
//       }
//     });
//   };

//   const handleAllSelect = () => {
//     if (allSelect) {
//       setSelectedRows([]); // Deselect all
//     } else {
//       setSelectedRows(filteredData); // Select all filtered rows
//     }
//     setAllSelect(!allSelect);
//   };

//   const tHead = [
//     {
//       id: "select",
//       label: (
//         <input type="checkbox" onChange={handleAllSelect} checked={allSelect} />
//       ),
//     },
//     { id: "admissionNo", label: "Admission No" },
//     { id: "name", label: "Name" },
//     { id: "fatherName", label: "Father Name" },
//     { id: "class", label: "Class" },
//     { id: "totalDues", label: "Total Dues" },
//   ];

//   const tBody = filteredData.map((val) => ({
//     select: (
//       <input
//         type="checkbox"
//         checked={selectedRows.some((row) => row.admissionNumber === val.admissionNumber)}
//         onChange={() => handleRowSelect(val)}
//       />
//     ),
//     admissionNo: val.admissionNumber,
//     name: val.fullName,
//     fatherName: val.fatherName,
//     class: val.class,
//     totalDues: addDues ? (
//       <input
//         className="border-none outline-none bg-red-300"
//         value={
//           selectedRows.some((row) => row.admissionNumber === val.admissionNumber)
//             ? val.totalDues
//             : ""
//         }
//       />
//     ) : (
//       val.totalDues
//     ),
//   }));

//   const handleAddFee = async () => {
//     setAddDues(true);

//     if (selectedRows.length === 0) {
//       toast.warn("No students selected.");
//       return;
//     }

//     console.log("Selected Rows Data:", selectedRows);

//     const payload = {
//       admissionNumber: "ABC123",
//       pastDuesAmount: 5000,
//       year: "2025",
//     };

//     try {
//       const response = await feesaddPastDues(payload);
//       if (response?.success) {
//         toast.success(response?.message);
//       }
//     } catch (error) {
//       console.log("Error", error);
//     }
//   };

//   const handleSave = () => {
//     console.log("Saving data for selected rows:", selectedRows);
//     setSelectedRows([]);
//     setAllSelect(false);
//     setAddDues(false);
//   };

//   return (
//     <div className="relative">
//       <div className="flex space-x-2">
//         <div className="mb-2">
//           <select
//             name="studentClass"
//             className="w-full border-1 border-black outline-none py-[1px] bg-inherit text-sm h-7"
//             value={selectedClass}
//             onChange={handleClassChange}
//           >
//             <option value="All">All Classes</option>
//             {getClass?.map((cls, index) => (
//               <option key={index} value={cls.className}>
//                 {cls?.className}
//               </option>
//             ))}
//           </select>
//         </div>

//         {["All", "Unpaid", "Paid", "Partial"].map((status) => (
//           <button
//             key={status}
//             className={`py-0.5 px-2 rounded text-sm leading-none ${getStatusButtonClasses(status)}`}
//             onClick={() => handleStatusChange(status)}
//             style={{ lineHeight: "inherit", height: "1.75rem" }}
//           >
//             {status}
//           </button>
//         ))}
//       </div>

//       <div className="flex gap-3">
//         <Button name="Add Dues Fees" onClick={handleAddFee} />
//         {addDues && (
//           <div className="flex gap-3">
//             <Button name="Save" color="green" onClick={handleSave} />
//             <Button name="Cancel" color="gray" onClick={() => setAddDues(false)} />
//           </div>
//         )}
//       </div>

//       <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
//         <Table tHead={tHead} tBody={tBody} />
//       </div>
//     </div>
//   );
// }

// export default AddDues;


// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";

// import Table from "../../Dynamic/Table";
// import Button from "../../Dynamic/utils/Button";
// import { feesaddPastDues } from "../../Network/AdminApi";

// function AddDues() {
//   const authToken = localStorage.getItem("token");
//   const [addDues, setAddDues] = useState(false);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [selectedRows, setSelectedRows] = useState({}); // Track selected rows
//   console.log("selectedRows",selectedRows)
//   const [allSelect, setAllSelect] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("All");
//   const [getClass, setGetClass] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("All");

//    const handleClassChange = (event) => {
//     setSelectedClass(event.target.value);
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const feesResponse = await axios.get(
//           `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents`,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
//         setSubmittedData(feesResponse?.data?.allStudent);
//       } catch (error) {
//         console.error("Error fetching fees data:", error);
//       }

//       try {
//         const classesResponse = await axios.get(
//           `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
//         let classes = classesResponse.data.classList;
//         setGetClass(classes.sort((a, b) => a - b));
//       } catch (error) {
//         console.error("Error fetching classes:", error);
//       }
//     };

//     fetchData();
//   }, [authToken]);

//   const filteredData = submittedData?.filter((item) => {
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

//   const getStatusButtonClasses = (status) => {
//     switch (status) {
//       case "Unpaid":
//         return selectedStatus === status
//           ? "bg-red-500 text-white"
//           : "bg-[#f9d4d4] text-gray-700 hover:bg-gray-300";
//       case "Paid":
//         return selectedStatus === status
//           ? "bg-green-500 text-white"
//           : "bg-green-500 text-gray-700 hover:bg-gray-300";
//       case "Partial":
//         return selectedStatus === status
//           ? "bg-blue-500 text-white"
//           : "bg-blue-500 text-gray-700 hover:bg-gray-300";
//       default:
//         return selectedStatus === "All"
//           ? "bg-blue-500 text-white"
//           : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//     }
//   };

//   const handleRowSelect = (val) => {
//     setSelectedRows((prevSelectedRows) => ({
//       ...prevSelectedRows,
//       [val]: !prevSelectedRows[val],
//     }));
//   };

//   const handleAllSelect = () => {
//     setAllSelect(!allSelect);
//     const newSelectedRows = {};
//     if (!allSelect) {
//       filteredData.forEach((item) => {
//         newSelectedRows[item.val] = true;
//       });
//     }
//     setSelectedRows(newSelectedRows);
//   };

//   const tHead = [
//     {
//       id: "select",
//       label: (
//         <input
//           type="checkbox"
//           onChange={handleAllSelect}
//           checked={allSelect}
//         />
//       ),
//     },
//     { id: "admissionNo", label: "Admission No" },
//     { id: "name", label: "Name" },
//     { id: "fatherName", label: "Father Name" },
//     { id: "class", label: "Class" },
//     { id: "totalDues", label: "Total Dues" },
//   ];

//   const tBody = filteredData.map((val, ind) => ({
//     select: (
//       <input
//         type="checkbox"
//         checked={!!selectedRows[val]}
//         onChange={() => handleRowSelect(val)}
//       />
//     ),
//     admissionNo: val.admissionNumber,
//     name: val.fullName,
//     fatherName: val.fatherName,
//     class: val.class,
//     totalDues: addDues ? (
//       <input
//         className="border-none outline-none bg-red-300"
//         value={selectedRows[val.admissionNumber] ? val.totalDues : ""} // Conditionally show value
//       />
//     ) : (
//       val.totalDues
//     ),
//   }));

//   const handleAddFee = async () => {
//     setAddDues(true);
//     const payload = {
//       admissionNumber: "ABC123",
//       pastDuesAmount: 5000,
//       year: "2025",
//     };
//     try {
//       const response = await feesaddPastDues(payload);
//       if (response?.success) {
//         toast.success(response?.message);
//       }
//     } catch (error) {
//       console.log("Error", error);
//     }
//   };

//   return (
//     <div className="relative">
//       <div className="flex space-x-2">
//         <div className="mb-2">
//           <select
//             name="studentClass"
//             className="w-full border-1 border-black outline-none py-[1px] bg-inherit text-sm h-7"
//             value={selectedClass}
//             onChange={handleClassChange}
//           >
//             <option value="All">All Classes</option>
//             {getClass?.map((cls, index) => (
//               <option key={index} value={cls.className}>
//                 {cls?.className}
//               </option>
//             ))}
//           </select>
//         </div>
//         <button
//           className={`py-0.5 px-2 rounded text-sm leading-none ${getStatusButtonClasses(
//             "All"
//           )}`}
//           onClick={() => handleStatusChange("All")}
//           style={{ lineHeight: "inherit", height: "1.75rem" }}
//         >
//           All
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded text-sm bg-[#eb4962] leading-none ${getStatusButtonClasses(
//             "Unpaid"
//           )}`}
//           onClick={() => handleStatusChange("Unpaid")}
//           style={{ lineHeight: "inherit", height: "1.75rem", background: "bg-[#eb4962]" }}
//         >
//           Unpaid
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded bg-[#01f315] text-sm leading-none ${getStatusButtonClasses(
//             "Paid"
//           )}`}
//           onClick={() => handleStatusChange("Paid")}
//           style={{ lineHeight: "inherit", height: "1.75rem" }}
//         >
//           Paid
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded text-sm bg-[#69aad8] leading-none ${getStatusButtonClasses(
//             "Partial"
//           )}`}
//           onClick={() => handleStatusChange("Partial")}
//           style={{ lineHeight: "inherit", height: "1.75rem" }}
//         >
//           Partial
//         </button>
//       </div>
//       <div className="flex gap-3">
//         <Button name="  Add Dues Fees" onClick={() => handleAddFee()} />

//         {addDues && (
//           <div className="flex gap-3">
//             <Button name="Save" color="green" />
//             <Button name="cancel" color="gray " onClick={() => setAddDues(false)} />
//           </div>
//         )}
//       </div>

//       <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
//         <div className="w-full">
//           <Table tHead={tHead} tBody={tBody} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AddDues;


// import React, { useState, useEffect } from "react";
// import axios from "axios";

// import Table from "../../Dynamic/Table";
// import Button from "../../Dynamic/utils/Button";
// import { feesaddPastDues } from "../../Network/AdminApi";
// import { toast } from "react-toastify";

// function AddDues() {
//   const authToken = localStorage.getItem("token");
// const [addDues,setAddDues]=useState(false)
//   const [submittedData, setSubmittedData] = useState([]);
//   const [modalData, setModalData] = useState(null);
//   const [isOpen, setIsOpen] = useState(false);
//   const [selectedClass, setSelectedClass] = useState("All");
//   const [getClass, setGetClass] = useState([]);
//   const [selectedStatus, setSelectedStatus] = useState("All");

//   const handleOpenModal = (admissionNumber) => {  // Consider if you still need this
//    setModalData(admissionNumber);
//    setIsOpen(true);
//   };

//   const toggleModal = () => setIsOpen(!isOpen); // Consider if you still need this

//   const handleClassChange = (event) => {
//     setSelectedClass(event.target.value);
//   };

//   const handleStatusChange = (status) => {
//     setSelectedStatus(status);
//   };

//   useEffect(() => {
//     const fetchData = async () => {  // use async/await for cleaner code
//       try {
//         const feesResponse = await axios.get(
//           `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents`,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
//         console.log("feesResponse",feesResponse)
//         setSubmittedData(feesResponse?.data?.allStudent);
//         console.log("response", feesResponse.data.data);
//       } catch (error) {
//         console.error("Error fetching fees data:", error);
//       }

//       try {
//         const classesResponse = await axios.get(
//           `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         );
//         let classes = classesResponse.data.classList;
//         setGetClass(classes.sort((a, b) => a - b));
//       } catch (error) {
//         console.error("Error fetching classes:", error);
//       }
//     };

//     fetchData();
//   }, [authToken]);

//   const filteredData = submittedData?.filter((item) => {
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


//   const getStatusButtonClasses = (status) => {
//     switch (status) {
//       case "Unpaid":
//         return selectedStatus === status
//           ? "bg-red-500 text-white"
//           : "bg-[#f9d4d4] text-gray-700 hover:bg-gray-300";
//       case "Paid":
//         return selectedStatus === status
//           ? "bg-green-500 text-white"
//           : "bg-green-500 text-gray-700 hover:bg-gray-300";
//       case "Partial":
//         return selectedStatus === status
//           ? "bg-blue-500 text-white"
//           : "bg-blue-500 text-gray-700 hover:bg-gray-300";
//       default:
//         return selectedStatus === "All"
//           ? "bg-blue-500 text-white"
//           : "bg-gray-200 text-gray-700 hover:bg-gray-300";
//     }
//   };

//   const tHead = [
//     { id: "admissionNo", label: "Admission No" },
//     { id: "name", label: "Name" },
//     { id: "fatherName", label: "Father Name" },
//     { id: "class", label: "Class" },
//     // { id: "contact", label: "Contact" },
//     // { id: "feeStatus", label: "feeStatus" },
//     { id: "totalDues", label: "Total Dues" },
//     // { id: "action", label: "Action" },
//   ];
//   const tBody = filteredData.map((val, ind) => ({
//     admissionNo: val.admissionNumber,
//     name: val.fullName,
//     fatherName: val.fatherName,
//     class: val.class,
//     totalDues: addDues?<input className="border-none outline-none bg-red-300"/>: val.totalDues  ,
//   }));
//   const handleAddFee=async()=>{
//     setAddDues(true)
//     const payload={
//       "admissionNumber": "ABC123",
//       "pastDuesAmount": 5000,
//       "year": "2025"
//     }
//     try {
//       const response= await feesaddPastDues(payload);
//       if(response?.success){
//         toast.success(response?.message)
//       }
//     } catch (error) {
//       console.log("Error",error)
      
//     }

//   }

//   return (
//     <div className="relative">
      
//       <div className="flex space-x-2">
//         <div className="mb-2">
//           <select
//             name="studentClass"
//             className="w-full border-1 border-black outline-none py-[1px] bg-inherit text-sm h-7" // Added text-sm for smaller text, Reduced padding, set height
//             value={selectedClass}
//             onChange={handleClassChange}
//           >
//             <option value="All">All Classes</option>
//             {getClass?.map((cls, index) => (
//               <option key={index} value={cls.className}>
//                 {cls?.className}
//               </option>
//             ))}
//           </select>
//         </div>
//         <button
//           className={`py-0.5 px-2 rounded text-sm leading-none ${getStatusButtonClasses(
//             "All"
//           )}`} // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("All")}
//           style={{ lineHeight: "inherit", height: "1.75rem" }}
//         >
//           All
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded text-sm bg-[#eb4962] leading-none ${getStatusButtonClasses(
//             "Unpaid"
//           )}`} // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("Unpaid")}
//           style={{ lineHeight: "inherit", height: "1.75rem",background:"bg-[#eb4962]" }}
//         >
//           Unpaid
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded bg-[#01f315] text-sm leading-none ${getStatusButtonClasses(
//             "Paid"
//           )}`} // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("Paid")}
//           style={{ lineHeight: "inherit", height: "1.75rem" }}
//         >
//           Paid
//         </button>
//         <button
//           className={`py-0.5 px-2 rounded text-sm bg-[#69aad8] leading-none ${getStatusButtonClasses(
//             "Partial"
//           )}`} // Reduced padding, added text-sm and leading-none
//           onClick={() => handleStatusChange("Partial")}
//           style={{ lineHeight: "inherit", height: "1.75rem" }}
//         >
//           Partial
//         </button>
//       </div>
//       <div className="flex gap-3">

//       <Button name="  Add Dues Fees" onClick={()=>handleAddFee()} />

//  {
//   addDues &&  <div className="flex gap-3">  <Button name="Save" color="green" />  <Button name="cancel" color="gray " onClick={()=>setAddDues(false)} /></div>
//  }
//       </div>


//       <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
//         <div className="w-full">
//           <Table tHead={tHead} tBody={tBody} />
//         </div>
        
//       </div>
//     </div>
//   );
// }

// export default AddDues;
