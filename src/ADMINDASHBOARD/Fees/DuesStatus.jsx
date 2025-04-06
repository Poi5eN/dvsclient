import React, { useState, useEffect } from "react";
import StudentFeeDetails from "./StudentFeeDetails"; // consider if you still need this
import Table from "../../Dynamic/Table";
import Button from "../../Dynamic/utils/Button";
import DuesPDF from "./DuesPDF";
import { AdminGetAllClasses, AllStudentsFeeStatus } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";

function DuesStatus() {
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
      
      <div className="flex flex-wrap gap-2">
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
        <DuesPDF tBody={tBody} />
      </div>

      <div className="flex gap-3">

      {/* <Button name="Add Dues Fees" onClick={()=>handleAddFee()} /> */}

 {/* {
  addDues &&  <div className="flex gap-3">  <Button name="Save" color="green" />  <Button name="cancel" color="gray " onClick={()=>setAddDues(false)} /></div>
 } */}
      </div>
      {/* <div id="printContent">
          <DuesPDF tBody={tBody} />
        </div> */}

      {/* <div className="md:h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white mt-2 rounded-md overflow-scroll w-full">
        <div className="w-full"> */}
          <Table tHead={tHead} tBody={tBody} />
        {/* </div>
      </div> */}
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

export default DuesStatus;

