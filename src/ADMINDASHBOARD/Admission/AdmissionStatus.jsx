import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import DataTable from "../Admission/DataTable";
import axios from "axios";
import { useStateContext } from "../../contexts/ContextProvider";


function AdmissionStatus({ data }) {
  const { currentColor } = useStateContext();
  const authToken = localStorage.getItem("token");
  const [submittedData, setSubmittedData] = useState([]);
  const [shouldFetchData, setShouldFetchData] = useState(false);

  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getLastYearStudents",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          }, // Set withCredentials to true
        }
      )
      .then((response) => {
        if (Array.isArray(response.data.allStudent)) {
          // Update the state with the array
          setSubmittedData(response.data.allStudent);
          
          toast.success(response.data.message)
        } else {
          console.error("Data format is not as expected:", response.allStudent);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [shouldFetchData]);
  return (
   <div className="p-3">
    <div className=" mt-12 md:mt-1  mx-auto p-3 ">
      <h1 
      className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
      style={{color:currentColor}}
      >
        Admission Status
      </h1>
     
    </div>
    <DataTable data={submittedData} />
   </div>
  );
}

export default AdmissionStatus;
