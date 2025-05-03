import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";

import Table from "../../Dynamic/Table";
import Button from "../../Dynamic/utils/Button";
import { AdminGetAllClasses, feesaddPastDues, getAllStudents, PastDues } from "../../Network/AdminApi";

import { useStateContext } from "../../contexts/ContextProvider";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";

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
    <div className="">
      <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="Add Dues"/>
      <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex gap-2">

      {/* <div className="flex gap-2"> */}
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
      </div>       <Table tHead={tHead} tBody={tBody} isSearch={true}/>
    </div>
  );
}

export default AddDues;

