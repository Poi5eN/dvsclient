import React, { useState, useEffect } from "react";
import StudentFeeDetails from "./StudentFeeDetails"; // consider if you still need this
import Table from "../../Dynamic/Table";
import Button from "../../Dynamic/utils/Button";
import DuesPDF from "./DuesPDF";
import { AdminGetAllClasses, AllStudentsFeeStatus } from "../../Network/AdminApi";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";
import PdfGenerate from "./DuesFee/PdfGenerate";
import StaticReceipt from "./StaticReceipt";


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


  const tHead = [
    { id: "admissionNo", label: "Admission No" },
    { id: "name", label: "Name" },
    { id: "fatherName", label: "Father Name" },
    { id: "class", label: "Class" },
    { id: "section", label: "Section" },
    { id: "contact", label: "Contact" },
    { id: "feeStatus", label: "feeStatus" },
    { id: "totalDues", label: "Total Dues" },
 
  ];
  const pdfcolumns = [
  
    { header: 'Admission No.', dataKey: 'admissionNumber' },
    { header: 'Student', dataKey: 'studentName' },
    { header: 'Father Name', dataKey: 'fatherName' },
    { header: 'Class', dataKey: 'class' },
    { header: 'Section', dataKey: 'section' },
    { header: 'Total Dues', dataKey: 'totalDues' },
    { header: 'Status', dataKey: 'feeStatus' },
  ];

  const overallTotalDuesSum = filteredData.reduce((sum, item) => {
    const duesValue = parseFloat(item?.totalDues);
    return sum + (isNaN(duesValue) ? 0 : duesValue);
  }, 0);
  const handleDownloadPdf = () => {


    PdfGenerate(filteredData,pdfcolumns,overallTotalDuesSum,'Dues-report.pdf'); // generatePdf ko call karein
    // generatePdf(tableData,'user-report.pdf'); // generatePdf ko call karein
  };
  const tBody = filteredData.map((val, ind) => ({
    admissionNo: val.admissionNumber,
    name: val.studentName,
    fatherName: val.fatherName,
    class: val.class,
    section: val.section,
    contact: val.contact,
    feeStatus: val.feeStatus,
    totalDues: addDues?<input className="border-none outline-none"/>: val.totalDues  ,
  
  }));


  return (
    <div className="relative px-2">
      
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
        <Button
          onClick={() => handleStatusChange("All")}
          // style={{ lineHeight: "inherit", height: "1.75rem" }}
          name="All"
          color="gray"
        >
          
        </Button>
        <Button
          onClick={() => handleStatusChange("Unpaid")}
          name="Unpaid"
        >
          
        </Button>
        <Button
          onClick={() => handleStatusChange("Paid")}
          name="Paid"
          color="green"
        >
        
        </Button>
        <Button
          color="#69aad8"
          onClick={() => handleStatusChange("Partial")}
          name="Partial"
        >
          
        </Button>
        <Button
        color="teal"
          onClick={handleDownloadPdf}
        name="PDF DOWNLOAD"
        >
         
        </Button>
      </div>

      <div className="flex gap-3">

      </div>
     
          <Table tHead={tHead} tBody={tBody} />


    </div>
  );
}

export default DuesStatus;

