import React, { useState, useEffect } from "react";

import axios from "axios";
import StockTable from "./StockDataTable";

import { useStateContext } from "../../../contexts/ContextProvider";
import { getadminRouteinventory } from "../../../Network/AdminApi";
import { toast } from "react-toastify";

function CreateSell() {
const authToken = localStorage.getItem("token");
const { currentColor, setIsLoader } = useStateContext();
  const [formData, setFormData] = useState({
    itemName: "",
    category: "",
    quantity: "",
    price: "",


  });
  const [submittedData, setSubmittedData] = useState([]);
  const [shouldFetchData, setShouldFetchData] = useState(false);

  const updateDependency = () => {
    setShouldFetchData(!shouldFetchData);
  }
const getInventory = async () => {
    setIsLoader(true)
    try {

      const response = await getadminRouteinventory()
      console.log("response",response)
      if (response?.success) {

        setSubmittedData(response?.items);
      }
      else {
        toast.error(response?.error)
      }

    } catch (error) {
      console.log("error", error)
    }
    finally {
      setIsLoader(false)
    }
  };

  useEffect(() => {
    getInventory()
  }, [])


  // useEffect(() => {

  //   axios.get('https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllItems', {
  //     withCredentials: true,
  //     headers: {
  //       Authorization: `Bearer ${authToken}`,
  //     }, // Set withCredentials to true
  //   })
  //     .then((response) => {
  //       setSubmittedData(response.data.listOfAllItems);
  //     })

  //     .catch((error) => {
  //       console.error("Error fetching data:", error);
  //     });
  // }, [shouldFetchData]);

  return (
    <div className=" mt-12 md:mt-1  mx-auto p-3">
    <h1 
    className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
    style={{color:currentColor}}
    >Products Sell</h1>
    
      <StockTable data={submittedData} updateDependency={updateDependency}
      //  handleDelete={handleDelete}
      />
    </div>
  );
}

export default CreateSell;
