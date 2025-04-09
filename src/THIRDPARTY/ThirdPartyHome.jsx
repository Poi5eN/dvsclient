

import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import useCustomQuery from "../useCustomQuery";
import SomthingwentWrong from "../SomthingwentWrong";
import Loading from "../Loading";
import Heading2 from "../Dynamic/Heading2";
import ExportToExcel from "../ADMINDASHBOARD/Student/AllStudent/ExportToExcel";
import DynamicDataTable from "../Dynamic/DynamicDataTable";
import PrintTable from "../ADMINDASHBOARD/Student/AllStudent/PrintTable";
import NoDataFound from "../NoDataFound";

function ThirdPartyHome() {
  const authToken = localStorage.getItem("token");
  const [getClass, setGetClass] = useState([]); // All classes
  const [selectedClass, setSelectedClass] = useState(""); // Selected class
  const [selectedSection, setSelectedSection] = useState(""); // Selected section
  const [availableSections, setAvailableSections] = useState([]); // Sections for selected class
  const [submittedData, setSubmittedData] = useState([]); // All student data
  const [filteredData, setFilteredData] = useState([]); // Filtered student data

  const { queryData: studentData, error: studentError, loading: studentLoading } =
    useCustomQuery(
      "https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents"
    );

  const printRef = useRef(); // Ref for the PrintTable component

  // Fetch all classes
  useEffect(() => {
    axios
      .get(`https://dvsserver.onrender.com/api/v1/adminRoute/getAllClasses`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        let classes = response.data.classList;
        setGetClass(classes.sort((a, b) => a - b));
      })
      .catch((error) => {
        console.error("Error fetching classes:", error);
      });
  }, []);

  // Fetch all student data
  useEffect(() => {
    if (studentData) {
      setSubmittedData(studentData.allStudent);
      setFilteredData(studentData.allStudent); // Initially, show all students
    }
  }, [studentData]);

  // Filter data based on class and section
  useEffect(() => {
    let filtered = submittedData;

    if (selectedClass) {
      filtered = filtered.filter((student) => student.class === selectedClass);
    }

    if (selectedSection) {
      filtered = filtered.filter((student) => student.section === selectedSection);
    }

    setFilteredData(filtered);
  }, [selectedClass, selectedSection, submittedData]);

  // Handle class selection
  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);

    const selectedClassObj = getClass?.find(
      (cls) => cls.className === selectedClassName
    );

    if (selectedClassObj) {
      setAvailableSections(selectedClassObj.sections.split(", "));
    } else {
      setAvailableSections([]);
    }

    setSelectedSection(""); // Reset section when class changes
  };

  // Handle section selection
  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  // Handle delete student
  const handleDelete = (email) => {
    axios
      .put(
        `https://dvsserver.onrender.com/api/v1/adminRoute/deactivateStudent`,
        { email },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then(() => {
        const filterData = submittedData.filter((item) => item.email !== email);
        setSubmittedData(filterData);
        toast.success("Student data deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting Student data:", error);
        toast.error("An error occurred while deleting the Student data.");
      });
  };


  if (studentError) {
    return <SomthingwentWrong/>;
  }
  if (studentLoading) {
    return <Loading/>;
  }

  return (
    <div className="md:h-screen mt-12 md:mt-1 mx-auto p-1 overflow-hidden">
      <Heading2 title={"Students"} />
<div className="flex justify-between">
<div className="flex space-x-4 ">
        <select
          name="studentClass"
          className="border px-2 py-1 rounded"
          value={selectedClass}
          onChange={handleClassChange}
        >
          <option value="">Select Class</option>
          {getClass?.map((cls, index) => (
            <option key={index} value={cls.className}>
              {cls.className}
            </option>
          ))}
        </select>
        <select
          name="studentSection"
          className="border px-2 py-1 rounded"
          value={selectedSection}
          onChange={handleSectionChange}
          disabled={!selectedClass}
        >
          <option value="">Select Section</option>
          {availableSections?.map((section, index) => (
            <option key={index} value={section}>
              {section}
            </option>
          ))}
        </select>
      </div>

      {/* Print & Export Buttons */}
      <div className="flex space-x-2">
        {/* <button
          onClick={handlePrint}
          style={{ backgroundColor: currentColor }}
          className="px-4 py-2 text-white rounded shadow-md no-print"
        >
          Print Student Data
        </button> */}
        {/* <img src={pdf} alt=""  className="h-8 cursor-pointer"   onClick={handlePrint} /> */}
       
        <ExportToExcel data={filteredData} fileName="Students_Report" />
      </div>
</div>
      {filteredData.length > 0 ? (
        <DynamicDataTable
          data={filteredData}
        //   columns={getAllStudentColumns(handleDelete)}
          handleDelete={handleDelete}
          className="w-full overflow-auto"
          // itemsPerPage={15}
        />
      ) : (
        <NoDataFound />
      )}

      {/* Hidden Printable Table */}{}
    <div className="hidden"> 
    <PrintTable ref={printRef} data={filteredData} itemsPerPage={25} />
    </div>
    </div>
  );
}

export default ThirdPartyHome;


