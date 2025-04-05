import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaEdit } from "react-icons/fa";
import {  adminRouteinventory,  getadminRouteinventory } from "../../Network/AdminApi";
import Table from "../../Dynamic/Table";
import Modal from "../../Dynamic/Modal";

import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import Button from "../../Dynamic/utils/Button";


function Create_Sales() {
  const { currentColor, setIsLoader } = useStateContext();
  const [formData, setFormData] = useState({
    category: "",
    price:"",
    itemName:"",
    quantity: "",
  });
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };


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


  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setFormData(() => ({
      ...formData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoader(true)
const payload={
  "itemName": formData?.itemName,
  "category":formData?.category,
  "quantity":formData?.quantity,
  "price": formData?.price
}
      // Ensure subjects and quantity are arrays before converting to strings
     

      const response = await adminRouteinventory(payload)
    
      if (response?.success) {
        getInventory()
        setIsLoader(false)
        toast.success(response?.message)
        setIsOpen(false);
       
      }
      else{
        toast.error(response?.message)
      }

    } catch (error) {
      console.error("Error:", error);

    }
    finally {
      setIsLoader(false)
    }
  };

  const THEAD = [
    { id: "SN", label: "S No.", width: "5" },
    { id: "itemName", label: "itemName", width: "7" },
    { id: "price", label: "price", width: "7" },
    { id: "quantity", label: "quantity" },
    { id: "category", label: "category" },
    { id: "action", label: "Action" },
  ];
 
  const tBody = submittedData?.map((val, ind) => ({
    SN: ind + 1,
    itemName: val?.itemName,
    price: val.price,
    quantity: val.quantity,
    category: val.category,
   action: (<div className="flex gap-5">
     
        <FaEdit className="text-[20px] text-yellow-800" />
     

    </div>
    ),
  }));
  return (
    <>
      {/* <h1
        className="text-xl font-bold mb-4 uppercase text-center hover-text"
        style={{ color: currentColor }}
      >
         Stock
      </h1> */}
      <Button
      name="Add Item"
        onClick={toggleModal}
        // variant="contained"
        // style={{ color: "white", backgroundColor: currentColor }}
      >
       
      </Button>
      <Modal
        setIsOpen={() => setIsOpen(false)}
        isOpen={isOpen} title={"Create Class"} maxWidth="100px">
        <div className="  px-4 py-2 text-center gap-y-3 ">
          <div className="my-2">
          <ReactInput
            type="text"
            name="category"
            // required={true}
            label="Category"
            onChange={handleFieldChange}
            value={Array.isArray(formData.category)
              ? formData.category.join(",")
              : formData.category}
          />
          </div>
        <div className="my-5">
        <ReactInput
            type="text"
            name="itemName"
            // required={true}
            label="Item Name"
            onChange={handleFieldChange}
            value={Array.isArray(formData.itemName)
              ? formData.itemName.join(",")
              : formData.itemName}
          />
        </div>
        <div className="my-5">
        <ReactInput
            type="text"
            name="price"
            // required={true}
            label="Price"
            onChange={handleFieldChange}
            value={Array.isArray(formData.price)
              ? formData.price.join(",")
              : formData.price}
          />
        </div>
          <ReactInput
            type="text"
            name="quantity"
            // required={true}
            label="quantity"
            onChange={handleFieldChange}
            value={Array.isArray(formData.quantity)
              ? formData.quantity.join(",")
              : formData.quantity}
          />
          <div className="flex items-center gap-5  border-t border-gray-200 rounded-b dark:border-gray-600">
            <Button
              // type="submit"
              // variant="contained"
              onClick={handleSubmit}
              name="Submit"
              // style={{
              //   backgroundColor: currentColor,
              //   color: "white",
              //   width: "100%",
              // }}
            >

            </Button>
            <Button
            color="gray"
              // variant="contained"
               name="Cancel"
              onClick={toggleModal}
              // style={{
              //   backgroundColor: "#616161",
              //   color: "white",
              //   width: "100%",
              // }}
            >
              
            </Button>
          </div>
        </div>
      </Modal>

      <div>
        <Table tHead={THEAD} tBody={tBody} />

      </div>
    </>
  );
}

export default Create_Sales;





// import React, { useState, useEffect } from "react";
// import InputForm from "../../Dynamic/Form/InputForm";
// import { toast } from "react-toastify";
// import Modal from "react-modal";
// import axios from "axios";
// import StockTable from "./StockDataTable";
// import { useStateContext } from "../../contexts/ContextProvider";

// import { Link } from "react-router-dom";


// const modalStyle = {
//   content: {
//     width: "80%",
//     margin: "0 auto",
//     zIndex: 1000,
//     borderRadius: "8px",
//     boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
//     border: "none",
//   },
// };

// function Create_Sales() {
//   const authToken = localStorage.getItem("token");
//   const { currentColor } = useStateContext();
//   const [formData, setFormData] = useState({
//     itemName: "",
//     category: "",
//     quantity: "",
//     price: "",
//   });
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [shouldFetchData, setShouldFetchData] = useState(false);

//   const handleFieldChange = (fieldName, value) => {
//     setFormData({
//       ...formData,
//       [fieldName]: value,
//     });
//   };

//   const handleSubmit = async () => {
//     const formDataToSend = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       if (key !== "image") {
//         formDataToSend.append(key, String(value));
//       }
//     });
   

//     try {
//       // setLoading(true)
//      await axios.post(
//         "https://dvsserver.onrender.com/api/v1/adminRoute/inventory",
//         // "https://dvsserver.onrender.com/api/v1/adminRoute/createItem",
//         formDataToSend,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );
     
//       setSubmittedData([...submittedData, formData]);
      
//       setFormData({
//         itemName: "",
//         category: "",
//         quantity: "",
//         price: "",
//       });
//       // setLoading(false)
//       toast.success("Form submitted successfully!");
//       setShouldFetchData(!shouldFetchData);
//       closeModal();
//     } catch (error) {
//       console.error("Error:", error);
//       toast.error("An error occurred while submitting the form.");
//     }
//   };

//   const handleDelete = (itemId) => {
//     axios
//       .delete(`https://dvsserver.onrender.com/api/v1/adminRoute/deleteItem/${itemId}`, {
//       // .delete(`https://dvsserver.onrender.com/api/v1/adminRoute/deleteItem/${itemId}`, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {

//         const updatedData = submittedData.filter((item) => item._id !== itemId);
//         setSubmittedData(updatedData);

//         toast.success("Item deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting Item:", error);
//         toast.error("An error occurred while deleting the Item.");
//       });
//   };

//   const openModal = () => {
//     // console.log("clicked the ");
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };

//   const formFields = [
//     {
//       label: "Item Name",
//       name: "itemName",
//       type: "text",
//       value: formData.itemName,
//       required: true,
//     },
//     // {
//     //   label: "Category",
//     //   name: "category",
//     //   type: "text",
//     //   value: formData.category,
//     //   required: true,
//     // },
//     {
//       label: "Category",
//       name: "category",
//       type: "select",
//       value: formData.category,
//       required: true,
//       selectOptions: [" Select Category", "Stationary", "Uniform", "Other"],
//     },
//     {
//       label: "Quantity",
//       name: "quantity",
//       type: "number",
//       value: formData.quantity,
//       required: true,
//     },
//     {
//       label: "Price",
//       name: "price",
//       type: "number",
//       value: formData.price,
//       required: true,
//     },
//   ];

//   useEffect(() => {
//     // Fetch data from the server when the component mounts
//     axios
//       .get("https://dvsserver.onrender.com/api/v1/adminRoute/inventory", {
//       // .get("https://dvsserver.onrender.com/api/v1/adminRoute/getAllItems", {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         }, // Set withCredentials to true
//       })
//       .then((response) => {

//         setSubmittedData(response.data.listOfAllItems);

//       })

//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, [shouldFetchData]);

//   return (
//     <div className=" mt-12 md:mt-1  mx-auto p-3 ">
//     <h1 
//      className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
//      style={{color:currentColor}}
//     >All Stock </h1>

// <div className="flex justify-between items-center mb-4">
//         <Link
//           to="/admin"
         
//           className="dark:text-white dark:bg-secondary-dark-bg neu-btn"
//           style={{ color: currentColor, border: `2px solid ${currentColor}` }}
//         >
//           Back
//         </Link>
//         <button
//        className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 "
//        style={{border:`2px solid ${currentColor} `,color:currentColor}}
//       onClick={openModal}
//      >
//         Add Stock
//       </button>
//       </div>
     

//       {/* Modal */}
//       {isModalOpen && <div className="modal-blur"></div>}
//       <Modal
//         isOpen={isModalOpen}
//         onRequestClose={closeModal}
//         contentLabel="Create Form"
//         style={modalStyle}
//         overlayClassName="overlay"
//       >
//         <h1 
//          className="text-xl font-bold mb-4 uppercase text-center  hover-text "
//          style={{color:currentColor}}
//         >
//           Create Stock
//         </h1>
//         <InputForm
//           fields={formFields}
//           handleChange={handleFieldChange}
//         // handleImageChange={handleImageChange}
//         />
//         <div
//           style={{
//             display: "flex",
//             justifyContent: "flex-end",
//             padding: "10px",
//           }}
//         >
//           <button
//             onClick={handleSubmit}
//             className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 "
//         style={{border:`2px solid ${currentColor} `,color:currentColor}}
//           >
//             Submit
//           </button>
//           <button
//             onClick={closeModal}
//             className="dark:text-white dark:bg-secondary-dark-bg text-red-800  ml-2 neu-btn border-2 "
//         style={{border:`2px solid red `}}
//           >
//             Cancel
//           </button>
//         </div>
//       </Modal>

//       <StockTable data={submittedData} handleDelete={handleDelete} />
//     </div>
//   );
// }

// export default Create_Sales;
