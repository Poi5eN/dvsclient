// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import Cookies from "js-cookie";
// import Select from "react-select";
// import { toast } from "react-toastify";

// const StockTable = () => {
//   const [allInventory, setInventory] = useState([]); // State to store fees data
//   const [selectedItems, setSelectedItems] = useState([]); // State for selected items
//   const [totalAmount, setTotalAmount] = useState(0); // State for total amount
//   const [name, setName] = useState(""); // State for name input
// const [allSaleRecords,setSalesRecords]=useState([])
//   const authToken = Cookies.get("token");
//   useEffect(() => {
//     // Fetch all items (fees) when the component mounts
//     axios
//       .get(
//         "https://dvsserver.onrender.com/api/v1/adminRoute/getAllItems",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {

//         const feesData = response.data.listOfAllItems.map((item) => {
//           return {
//             label: item.itemName,
//             category:item.category,
//             value: item._id, // Use ID for internal tracking
//             price: item.price,
//           };
//         });
//         setInventory(feesData);
//       })
//       .catch((error) => {
//         console.error("Error fetching fees data:", error);
//         toast.error("Failed to fetch fees data.");
//       });
//   }, [authToken]);
//   const fetchSalesRecords = () => {
//     axios
//       .get("https://dvsserver.onrender.com/api/v1/inventory/getSalesRecords", {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         console.log("response", response.data.data);
//         setSalesRecords(response.data.data);
//       })
//       .catch((error) => {
//         console.error("Error fetching fees data:", error);
//         toast.error("Failed to fetch sales records.");
//       });
//   };

//   useEffect(() => {
//     // Fetch all items (sales records) when the component mounts
//     fetchSalesRecords();
//   }, [authToken]);
//   const handleSelectChange = (selectedOptions) => {
//     const updatedItems = selectedOptions.map(option => ({
//       ...option,
//       quantity: 1, // Default quantity
//     }));
//     setSelectedItems(updatedItems);
//     updateTotalAmount(updatedItems);
//   };

//   const handleIncrement = (index) => {
//     const updatedItems = [...selectedItems];
//     updatedItems[index].quantity += 1;
//     setSelectedItems(updatedItems);
//     updateTotalAmount(updatedItems);
//   };

//   const handleDecrement = (index) => {
//     const updatedItems = [...selectedItems];
//     if (updatedItems[index].quantity > 1) {
//       updatedItems[index].quantity -= 1;
//       setSelectedItems(updatedItems);
//       updateTotalAmount(updatedItems);
//     }
//   };

//   const updateTotalAmount = (items) => {
//     const amount = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
//     setTotalAmount(amount);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault(); // Prevent default form submission behavior
//     const dataToPost = {
//       items: selectedItems.map(item => ({
//         itemId:item.value,
//         itemName: item.label,
//         category:item.category,
//         price: item.price,
//         sellQuantity: item.quantity,
//         sellAmount: item.price * item.quantity,
//       })),
//       name: name,
//       totalAmount: totalAmount,
//       date: "2024-09-07T10:00:00Z",
//     };

//     // Send POST request
//     axios
//       .post("https://dvsserver.onrender.com/api/v1/inventory/multiItemSell", dataToPost, {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//         },
//       })
//       .then((response) => {
//         toast.success("Data successfully posted.");
//         // Reset form fields
//         setSelectedItems([]);
//         setName("");
//         setTotalAmount(0);
//         fetchSalesRecords();
//       })
//       .catch((error) => {
//         console.error("Error posting data:", error);
//         toast.error("Failed to post data.");
//       });
//   };

//   return (
//     <div className="md:min-h-screen px-5 pl-10 md:pl-0 md:px-0">
//       <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
//         <form
//           onSubmit={handleSubmit}
//           className="flex flex-wrap md:flex-row flex-col w-full gap-4"
//         >
//           <div className="mb-2 p-2 bg-gray-100 rounded">
//             <label className="block text-[12px] font-medium text-gray-700 mt-2">
//               Select Items:
//             </label>
//             <Select
//               isMulti
//               options={allInventory}
//               className="basic-single mt-2"
//               classNamePrefix="select"
//               onChange={handleSelectChange}
//             />
//             <div className="mt-2">
//               {selectedItems.map((item, index) => (
//                 <div key={index} className="flex items-center gap-4 mb-2 p-2 border border-gray-300 rounded">
//                   <span>{item.label}</span>
//                   <span>₹{item.price}</span>
//                   <button
//                     onClick={() => handleDecrement(index)}
//                     className="bg-red-500 text-white  rounded-full  h-7 w-7 "
//                     type="button" // Ensure this button doesn't submit the form
//                   >
//                     -
//                   </button>
//                   <span>{item.quantity}</span>
//                   <button
//                     onClick={() => handleIncrement(index)}
//                     className="bg-green-500 text-white h-7 w-7  rounded-full"
//                     type="button" // Ensure this button doesn't submit the form
//                   >
//                     +
//                   </button>
//                   <span>₹{item.price * item.quantity}</span> {/* Display amount for the item */}
//                 </div>
//               ))}
//               <div className="mt-4">
//                 <label className="block text-[12px] font-medium text-gray-700">
//                   Name:
//                 </label>
//                 <input
//                   type="text"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                  className="border border-gray-300 px-2 py-1  rounded"
//                 />
//               </div>
//               <div className="mt-4">
//                 <label className="block text-[12px] font-medium text-gray-700">
//                   Total Amount: ₹{totalAmount}
//                 </label>
//               </div>
//               <div className="mt-4">
//                 <button
//                   type="submit"
//                   className="bg-gray-800 text-white p-2 rounded"
//                 >
//                   Sell
//                 </button>
//               </div>
//             </div>
//           </div>
//         </form>
//       </div>
//       <div className="max-w-full mx-auto bg-white mt-2 rounded-md shadow overflow-x-auto">
//       <table className="min-w-full border-collapse table-auto">
//         <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
//           <tr>
//             <th className="py-3 px-6 text-left border-b">Customer</th>
//             <th className="py-3 px-6 text-left border-b">Date</th>
//             <th className="py-3 px-6 text-left border-b">Total Amount</th>
//             <th className="py-3 px-6 text-left border-b">All Items</th>
//           </tr>
//         </thead>
//         <tbody className="text-gray-700 text-sm">
//           {allSaleRecords.map((saleRecord, index) => (
//             <tr key={index} className="border-b hover:bg-gray-100">
//               <td className="py-3 px-6">{saleRecord.name}</td>
//               <td className="py-3 px-6">{new Date(saleRecord.createdAt).toLocaleDateString()}</td>
//               <td className="py-3 px-6">{saleRecord.totalAmount}</td>
//               <td className="py-3 px-6">
//                 {/* Nested Table for Items */}
//                 <table className="min-w-full border-collapse table-auto">
//                   <thead>
//                     <tr className="bg-gray-100">
//                       <th className="py-2 px-4 text-left border-b">Item Name</th>
//                       <th className="py-2 px-4 text-left border-b">Price</th>
//                       <th className="py-2 px-4 text-left border-b">Quantity</th>
//                       <th className="py-2 px-4 text-left border-b">Amount</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {saleRecord.items.map((item, itemIndex) => (
//                       <tr key={itemIndex} className="hover:bg-gray-50">
//                         <td className="py-2 px-4 border-b">{item.itemName}</td>
//                         <td className="py-2 px-4 border-b">{item.price}</td>
//                         <td className="py-2 px-4 border-b">{item.sellQuantity}</td>
//                         <td className="py-2 px-4 border-b">{item.sellAmount}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//     </div>
//   );
// };

// export default StockTable;

import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import Select from "react-select";
import { toast } from "react-toastify";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../../contexts/ContextProvider";
import { getadminRouteinventory } from "../../../Network/AdminApi";
const StockTable = () => {
  const { currentColor, setIsLoader } = useStateContext();
  const [allInventory, setInventory] = useState([]); // State to store fees data
  const [selectedItems, setSelectedItems] = useState([]); // State for selected items
  const [totalAmount, setTotalAmount] = useState(0); // State for total amount
  const [name, setName] = useState(""); // State for name input
  const [allSaleRecords, setSalesRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const authToken = Cookies.get("token");
  const receiptRef = useRef();
  const schoolName = sessionStorage.getItem("schoolName");
  const schoolContact = sessionStorage.getItem("schoolContact");
  const schoolAddress = sessionStorage.getItem("schooladdress");
  const SchoolImage = sessionStorage.getItem("image");
  // useEffect(() => {
  //   axios
  //     .get(
  //       "https://dvsserver.onrender.com/api/v1/adminRoute/getAllItems",
  //       {
  //         withCredentials: true,
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     )
  //     .then((response) => {
  //       const feesData = response.data.listOfAllItems.map((item) => {
  //         return {
  //           label: item.itemName,
  //           category: item.category,
  //           value: item._id, // Use ID for internal tracking
  //           price: item.price,
  //         };
  //       });
  //       setInventory(feesData);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching fees data:", error);
  //       toast.error("Failed to fetch fees data.");
  //     });
  // }, [authToken]);
 
 const getInventory = async () => {
     setIsLoader(true)
     try {
 
       const response = await getadminRouteinventory()
       console.log("response",response)
       if (response?.success) {
 
        //  setSubmittedData(response?.items);
         const feesData = response?.items?.map((item) => {
                  return {
                    label: item.itemName,
                    category: item.category,
                    value: item._id, // Use ID for internal tracking
                    price: item.price,
                  };
                });
                setInventory(feesData);
                console.log("feesData",feesData)
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
 
  const fetchSalesRecords = () => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/inventory/getSalesRecords",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        console.log("response", response.data.data);
        setSalesRecords(response.data.data);
      })
      .catch((error) => {
        console.error("Error fetching fees data:", error);
        toast.error("Failed to fetch sales records.");
      });
  };

  useEffect(() => {
    // Fetch all items (sales records) when the component mounts
    fetchSalesRecords();
  }, [authToken]);
  const handleSelectChange = (selectedOptions) => {
    const updatedItems = selectedOptions.map((option) => ({
      ...option,
      quantity: 1, // Default quantity
    }));
    setSelectedItems(updatedItems);
    updateTotalAmount(updatedItems);
  };

  const handleIncrement = (index) => {
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity += 1;
    setSelectedItems(updatedItems);
    updateTotalAmount(updatedItems);
  };

  const handleDecrement = (index) => {
    const updatedItems = [...selectedItems];
    if (updatedItems[index].quantity > 1) {
      updatedItems[index].quantity -= 1;
      setSelectedItems(updatedItems);
      updateTotalAmount(updatedItems);
    }
  };

  const updateTotalAmount = (items) => {
    const amount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setTotalAmount(amount);
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    const dataToPost = {
      items: selectedItems.map((item) => ({
        itemId: item.value,
        itemName: item.label,
        category: item.category,
        price: item.price,
        sellQuantity: item.quantity,
        sellAmount: item.price * item.quantity,
      })),
      name: name,
      totalAmount: totalAmount,
      date: "2024-09-07T10:00:00Z",
    };

    // Send POST request
    axios
      .post(
        "https://dvsserver.onrender.com/api/v1/inventory/multiItemSell",
        dataToPost,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        toast.success("Data successfully posted.");
        // Reset form fields
        setSelectedItems([]);
        setName("");
        setTotalAmount(0);
        fetchSalesRecords();
      })
      .catch((error) => {
        console.error("Error posting data:", error);
        toast.error("Failed to post data.");
      });
  };

  const handlePrint = useReactToPrint({
    content: () => receiptRef.current,
  });

  const printRecord = (record) => {
    setCurrentRecord(record); // Set current record to print
    handlePrint(); // Trigger print
  };
  return (
    <div className="md:min-h-screen px-5 pl-10 md:pl-0 md:px-0">
      <div className="flex-grow max-h-[80vh] sm:max-h-[80vh] md:max-h-[80vh] lg:max-h-[80vh] overflow-auto">
        <form
          onSubmit={handleSubmit}
          className="flex flex-wrap md:flex-row flex-col w-full gap-4"
        >
          <div className="mb-2 p-2 bg-gray-100 rounded">
            <label className="block text-[12px] font-medium text-gray-700 mt-2">
              Select Items:
            </label>
            <Select
              isMulti
              options={allInventory}
              className="basic-single mt-2"
              classNamePrefix="select"
              onChange={handleSelectChange}
            />
            <div className="mt-2">
              {selectedItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center gap-4 mb-2 p-2 border border-gray-300 rounded"
                >
                  <span>{item.label}</span>
                  <span>₹{item.price}</span>
                  <button
                    onClick={() => handleDecrement(index)}
                    className="bg-red-500 text-white  rounded-full  h-7 w-7 "
                    type="button" // Ensure this button doesn't submit the form
                  >
                    -
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    onClick={() => handleIncrement(index)}
                    className="bg-green-500 text-white h-7 w-7  rounded-full"
                    type="button" // Ensure this button doesn't submit the form
                  >
                    +
                  </button>
                  <span>₹{item.price * item.quantity}</span>{" "}
                  {/* Display amount for the item */}
                </div>
              ))}
              <div className="mt-4">
                <label className="block text-[12px] font-medium text-gray-700">
                  Name:
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-gray-300 px-2 py-1  rounded"
                />
              </div>
              <div className="mt-4">
                <label className="block text-[12px] font-medium text-gray-700">
                  Total Amount: ₹{totalAmount}
                </label>
              </div>
              <div className="mt-4">
                <button
                  type="submit"
                  className="bg-gray-800 text-white p-2 rounded"
                >
                  Sell
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="max-w-full mx-auto bg-white mt-2 rounded-md shadow overflow-x-auto">
        <table className="min-w-full border-collapse table-auto">
          <thead className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
            <tr>
              <th className="py-3 px-6 text-left border-b">Customer</th>
              <th className="py-3 px-6 text-left border-b">Date</th>
              <th className="py-3 px-6 text-left border-b">Total Amount</th>
              <th className="py-3 px-6 text-left border-b">All Items</th>
              <th className="py-3 px-6 text-left border-b">Action</th>
            </tr>
          </thead>
          <tbody className="text-gray-700 text-sm">
            {allSaleRecords.map((saleRecord, index) => (
              <tr key={index} className="border-b hover:bg-gray-100">
                <td className="py-3 px-6">{saleRecord.name}</td>
                <td className="py-3 px-6">
                  {new Date(saleRecord.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-6">{saleRecord.totalAmount}</td>
                <td className="py-3 px-6">
                  {/* Nested Table for Items */}
                  <table className="min-w-full border-collapse table-auto">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 text-left border-b">
                          Item Name
                        </th>
                        <th className="py-2 px-4 text-left border-b">Price</th>
                        <th className="py-2 px-4 text-left border-b">
                          Quantity
                        </th>
                        <th className="py-2 px-4 text-left border-b">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {saleRecord.items.map((item, itemIndex) => (
                        <tr key={itemIndex} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">
                            {item.itemName}
                          </td>
                          <td className="py-2 px-4 border-b">{item.price}</td>
                          <td className="py-2 px-4 border-b">
                            {item.sellQuantity}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {item.sellAmount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </td>
                <td className="py-3 px-6 text-left">
                  <button
                    onClick={() => printRecord(saleRecord)} // Pass the current record to print
                    className="bg-gray-800 text-white p-2 rounded"
                  >
                    Download Receipt
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Hidden div for printing */}
      {currentRecord && (
        <div style={{ display: "none" }}>
          {/* <div ref={receiptRef} className="w-[250px] p-1 border-1">
           
          <h1 className="text-xl font-semibold">{currentRecord.name}</h1>
          
            <p>Date:  {new Date(currentRecord.date).toLocaleDateString()}</p>
            <p className="text-center py-1 border-b-1 border-black">RECEIPT</p>

          
            <ul>
              {currentRecord.items.map((item, index) => (
                <li key={index} className=" flex justify-between items-center border-b-1 pb-1 p-1 bg-gray-50 rounded shadow-sm">
                <div>
                  <span className="font-medium">{item.itemName}</span>
                  <p className="text-sm text-gray-500">Quantity: {item.sellQuantity}</p>
                </div>
                <span className="font-bold text-blue-600">₹{item.sellAmount}</span>
              </li>
                
              ))}
            </ul>
            <div className=" border-t pt-4">
              <p className="text-xl font-semibold text-right">Total Amount: ₹{currentRecord.totalAmount}</p>
            </div>
          </div> */}
          <div ref={receiptRef} className="w-1/2 p-1 border-1 ml-1">
            {/* <h1 className="text-xl font-semibold">{currentRecord.name}</h1>

            <p>Date: {new Date(currentRecord.date).toLocaleDateString()}</p>
            <p className="text-center py-1 border-b-1 border-black">RECEIPT</p>

            <ul>
              {currentRecord.items.map((item, index) => (
                <li
                  key={index}
                  className=" flex justify-between items-center border-b-1 pb-1 p-1 bg-gray-50 rounded shadow-sm"
                >
                  <div>
                    <span className="font-medium">{item.itemName}</span>
                    <p className="text-sm text-gray-500">
                      Quantity: {item.sellQuantity}
                    </p>
                  </div>
                  <span className="font-bold text-blue-600">
                    ₹{item.sellAmount}
                  </span>
                </li>
              ))}
            </ul>
            <div className=" border-t pt-4">
              <p className="text-xl font-semibold text-right">
                Total Amount: ₹{currentRecord.totalAmount}
              </p>
            </div> */}
            {/* <div class="max-w-lg mx-auto p-6 border border-gray-300 shadow-lg rounded-lg bg-white"> */}
  {/* <div class="flex justify-between items-center border-b pb-4 mb-4">
    <div class="flex items-center">
      <img src="logo_url" alt="School Logo" class="h-12 w-12 object-contain" />
    </div>
    <h2 class="text-xl font-bold uppercase">Inventory Receipt</h2>
    <div class="text-right">
      <p class="text-sm">School Name</p>
    </div>
  </div> */}
<div className="flex justify-between ">
              <div className=" h-auto w-[150px]  dark:text-white  ">
                <img
                  className="h-12 w-12 rounded-full "
                  src={SchoolImage}
                  alt="logo"
                />
              </div>
              <div className="text-end  dark:text-white">
                <h1 className="font-semibold">{schoolName}</h1>
                <p className="text-sm">Address: {schoolAddress} </p>
                <p className="text-sm">Contact: {schoolContact}</p>
              </div>
            </div>
            <hr />
  <div class="mb-4">
    <p class="text-sm"><strong>User Name:</strong> {currentRecord.name}</p>
    <p class="text-sm"><strong>Date:</strong> {new Date(currentRecord.date).toLocaleDateString()}</p>
  </div>
<hr />
  <div class="border-b-2 border-gray-200 mb-2 py-2">
    <div class="grid grid-cols-3 gap-4 text-sm font-bold">
      <div>Item</div>
      <div>Quantity</div>
      <div>Price</div>
    </div>
  </div>

  <div class="divide-y divide-gray-200 text-sm">
 { currentRecord.items.map((item, index) => (
 <div class="grid grid-cols-3 gap-4 py-2">
 <div>{item.itemName}</div>
 <div>{item.sellQuantity}</div>
 <div>₹{item.sellAmount}</div>
</div>

 ))}
   
  </div>

  <div class="flex justify-between mt-4 pt-4 border-t">
    <div class="text-lg font-bold">Total Amount:</div>
    <div class="text-lg font-bold"> ₹{currentRecord.totalAmount}</div>
  </div>
</div>

          </div>
        // </div>
      )}
    </div>
  );
};

export default StockTable;
