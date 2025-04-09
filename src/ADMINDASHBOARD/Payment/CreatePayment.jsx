import React, { useState, useEffect } from "react";
import DynamicDataTable from "./DataTable";
import { useStateContext } from "../../contexts/ContextProvider";
import axios from "axios";
import '../../Dynamic/Form/FormStyle.css'
import InputForm from "../../Dynamic/Form/InputForm";


const modalStyle = {
  content: {
    width: "80%",
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    zIndex: 1000,
  },
};

function CreatePayment() {
  const authToken = localStorage.getItem("token");
  const [loading,setLoading]=useState(false)
  const { currentColor} = useStateContext();
  const [submittedData, setSubmittedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Fetch data from the server when the component mounts
    axios.get('https://dvsserver.onrender.com/api/v1/adminRoute/getTeachers', {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      }, // Set withCredentials to true
    })
    .then((response) => {
      if (Array.isArray(response.data.data)) {
        // Update the state with the array
        setSubmittedData(response.data.data);
      } else {
        console.error("Data format is not as expected:", response.data);
      }
    })
    
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []);



  return (
    <div className=" mt-12 md:mt-1  mx-auto p-3 ">
    <h1    className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
    style={{color:currentColor}}>Payment Status</h1>
      
      <DynamicDataTable
       data={submittedData} 
      // handleDelete={handleDelete}
      />
    </div>
  );
}

export default CreatePayment;