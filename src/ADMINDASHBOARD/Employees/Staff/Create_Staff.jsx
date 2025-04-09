import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import '../../../Dynamic/Form/FormStyle.css';
import { useStateContext } from "../../../contexts/ContextProvider";
import DynamicDataTable from "./DataTable";
import Button from "../../../Dynamic/utils/Button";
import Modal from "../../../Dynamic/Modal";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
import { adminRoutestaff, getstaff } from "../../../Network/AdminApi";

function Create_Staff() {
  const authToken = localStorage.getItem("token");
  const { currentColor, setIsLoader } = useStateContext();
  
  const [formData, setFormData] = useState({
    fullName: "",
    // employeeId: "",
    email: "",
    password: "",
    dateOfBirth: "",
    qualification: "",
    salary: "",
    gender: "",
    joiningDate: "",
    address: "",
    contact: "",
    image: null,
  });

  const [submittedData, setSubmittedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all staff on component mount & when data changes


  const fetchEmployees = async () => {
    try {
      const response = await getstaff()
     
      if (response) {
       
        setSubmittedData(response?.employees);
      } else {
        toast.error(response?.error)
      }
    } catch (error) {
      console.error("Error", error);
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, []);
  const handleFieldChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async () => {
    setIsLoader(true);
    const payload={
      "staffName":formData?.fullName,
      "email": formData?.email,
      "password":formData?.password,
      "dateOfBirth": formData?.dateOfBirth,
      "qualification":formData?.qualification,
      "salary":Number(formData?.salary),
      "gender":formData?.gender?.value,
      "address": formData?.address,
      "contact":Number(formData?.contact)
    }

    try {
      const response = await adminRoutestaff(payload);
      if (response?.success) {
        toast.success(response?.message);
        closeModal();
        fetchEmployees(); // Refresh data after submission
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error submitting staff data:", error);
    } finally {
      closeModal();
      setIsLoader(false);
    }
  };

  const handleDelete = async (email) => {
    try {
      await axios.put(`https://dvsserver.onrender.com/api/v1/adminRoute/deactivateEmployee`, 
        { email },
        { withCredentials: true, headers: { Authorization: `Bearer ${authToken}` } }
      );

      setSubmittedData((prevData) => prevData.filter((item) => item.email !== email));
      toast.success("Staff data deleted successfully");
    } catch (error) {
      console.error("Error deleting Staff data:", error);
      toast.error("An error occurred while deleting the staff data.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      fullName: "",
      // employeeId: "",
      email: "",
      password: "",
      dateOfBirth: "",
      qualification: "",
      salary: "",
      gender: {},
      // joiningDate: "",
      address: "",
      contact: "",
      // image: null,
    });
  };

  return (
    <div className="mx-auto p-3">
      <h1 className="text-4xl font-bold mb-4 uppercase text-center hover-text" style={{ color: currentColor }}>
        All Staff Here
      </h1>
      <Button name="Add Staff" onClick={openModal} />

      <Modal setIsOpen={closeModal} isOpen={isModalOpen} title="Create Staff" maxWidth="100px">
        <div className="p-2">
          <ReactInput type="text" name="fullName" label="Name" 
            onChange={(e) => handleFieldChange("fullName", e.target.value)} value={formData.fullName} />

          {/* <ReactInput type="text" name="employeeId" label="Employee ID"
            onChange={(e) => handleFieldChange("employeeId", e.target.value)} value={formData.employeeId} /> */}

          <ReactInput type="email" name="email" label="Email" 
            onChange={(e) => handleFieldChange("email", e.target.value)} value={formData.email} />

          <ReactInput type="password" name="password" label="Password"
            onChange={(e) => handleFieldChange("password", e.target.value)} value={formData.password} />

          <ReactInput type="date" name="dateOfBirth" label="Date of Birth"
            onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)} value={formData.dateOfBirth} />

          <ReactInput type="text" name="qualification" label="Qualification"
            onChange={(e) => handleFieldChange("qualification", e.target.value)} value={formData.qualification} />

          <ReactInput type="number" name="salary" label="Salary"
            onChange={(e) => handleFieldChange("salary", e.target.value)} value={formData.salary} />

          <ReactSelect name="gender" value={formData.gender} handleChange={(e) => handleFieldChange("gender", e)}
            label="Gender" dynamicOptions={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]} />

          <ReactInput type="date" name="joiningDate" label="Joining Date"
            onChange={(e) => handleFieldChange("joiningDate", e.target.value)} value={formData.joiningDate} />

          <ReactInput type="text" name="address" label="Address"
            onChange={(e) => handleFieldChange("address", e.target.value)} value={formData.address} />

          <ReactInput type="tel" name="contact" label="Contact"
            onChange={(e) => handleFieldChange("contact", e.target.value)} value={formData.contact} />

          <ReactInput type="file" name="image" label="Image"
            onChange={handleImageChange} />

          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
            <Button onClick={handleSubmit} name="Submit" />
            <Button onClick={closeModal} name="Cancel" />
          </div>
        </div>
      </Modal>

      <DynamicDataTable data={submittedData} handleDelete={handleDelete} />
    </div>
  );
}

export default Create_Staff;



// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import axios from "axios";
// import '../../../Dynamic/Form/FormStyle.css'
// import { useStateContext } from "../../../contexts/ContextProvider";
// import DynamicDataTable from "./DataTable";
// import Button from "../../../Dynamic/utils/Button";
// import Modal from "../../../Dynamic/Modal";
// import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
// import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
// import { adminRoutestaff } from "../../../Network/AdminApi";

// function Create_Staff() {
//   const authToken = localStorage.getItem("token");
//   const { currentColor,setIsLoader } = useStateContext();
//   const [formData, setFormData] = useState({
//     fullName: "",
//     employeeId: "",
//     email: "",
//     password: "",
//     dateOfBirth: "",
//     qualification: "",
//     salary: "",
//     gender: "",
//     joiningDate: "",
//     address: "",
//     contact: "",
//     image: null,
//   });
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isModalOpen, setIsModalOpen] = useState(false);

//   useEffect(() => {
//     // Fetch data from the server when the component mounts
//     axios.get('https://dvsserver.onrender.com/api/v1/adminRoute/getAllEmployees', {
//       withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       }, // Set withCredentials to true
//     })
//       .then((response) => {

//         if (Array.isArray(response.data.allEmployee)) {
//           // Update the state with the array
//           setSubmittedData(response.data.allEmployee);
//         } else {
//           console.error("Data format is not as expected:", response.data);
//         }
//       })

//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);

//   const handleFieldChange = (fieldName, value) => {
//     setFormData({
//       ...formData,
//       [fieldName]: value,
//     });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData({
//         ...formData,
//         image: file,
//       });
//     }
//   };

//   const handleSubmit = async () => {
//     setIsLoader(true)
//     const formDataToSend = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       if (key !== "image") {
//         formDataToSend.append(key, String(value));
//       }
//     });
//     formDataToSend.append("image", formData.image);


//     try {
//       const response = await adminRoutestaff(formDataToSend)
//       if(response?.success){
//         toast.success(response?.message)
//         closeModal();
//       }
//       else{
//         toast.error(response?.message)
//       }
//     } catch (error) {
//       console.log("error",error)
//     }finally{
//       closeModal();
//       setIsLoader(false)
//     }

//   };
 
//   const handleDelete = (email) => {
//     axios.put(`https://dvsserver.onrender.com/api/v1/adminRoute/deactivateEmployee`, { email }, {
//       withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//       },
//     })
//       .then((response) => {
//         const updatedData = submittedData.filter((item) => item.email !== email);
//         setSubmittedData(updatedData);

//         toast.success("Staff data deleted successfully");
//       })
//       .catch((error) => {

//         console.error("Error deleting Staff data:", error);
//         toast.error("An error occurred while deleting the staff data.");
//       });
//   };

//   const openModal = () => {
//     setIsModalOpen(true);
//   };

//   const closeModal = () => {
//     setIsModalOpen(false);
//   };



//   return (
//     <div className="  mx-auto p-3">
//       <h1
//         className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
//         style={{ color: currentColor }}
//       >All Staff Here</h1>
//       <Button name="Add Staff"
//         onClick={openModal}
//       />


//       <Modal
//         setIsOpen={() => setIsModalOpen(false)}
//         isOpen={isModalOpen} title={" Create Staff"} maxWidth="100px">
//         <div className="p-2">
       
//          <ReactInput
//                       type="text"
//                       name="fullName"
//                       // required={true}
//                       label="Name"
//                       onChange={handleChange}
//                       value={payload?.fullName}
//                     />
//          <ReactInput
//                       type="text"
//                       name="employeeId"
//                       // required={true}
//                       label="Employee ID"
//                       onChange={handleChange}
//                       value={payload?.employeeId}
//                     />
//          <ReactInput
//                       type="email"
//                       name="email"
//                       // required={true}
//                       label="Email"
//                       onChange={handleChange}
//                       value={payload?.email}
//                     />
//          <ReactInput
//                       type="password"
//                       name="password"
//                       // required={true}
//                       label="Password"
//                       onChange={handleChange}
//                       value={payload?.password}
//                     />
//          <ReactInput
//                       type="date"
//                       name="dateOfBirth"
//                       // required={true}
//                       label="Date of Birth"
//                       onChange={handleChange}
//                       value={payload?.dateOfBirth}
//                     />
//          <ReactInput
//                       type="text"
//                       name="qualification"
//                       // required={true}
//                       label="Qualification"
//                       onChange={handleChange}
//                       value={payload?.qualification}
//                     />
//          <ReactInput
//                       type="number"
//                       name="salary"
//                       // required={true}
//                       label="Salary"
//                       onChange={handleChange}
//                       value={payload?.salary}
//                     />
//          <ReactSelect
//                       name="Gender"
//                       value={payload?.gender}
//                       handleChange={handleChange}
//                       label="Gender"
//                       dynamicOptions={[
//                         { label: "Male", value: "Male" },
//                         { label: "Female", value: "Female" },
//                         { label: "Other", value: "Other" },
//                       ]}
//                     />
//                     <ReactInput
//                       type="date"
//                       name="joiningDate"
//                       // required={true}
//                       label="Joining Date"
//                       onChange={handleChange}
//                       value={payload?.joiningDate}
//                     />
//                     <ReactInput
//                       type="text"
//                       name="address"
//                       // required={true}
//                       label="Address"
//                       onChange={handleChange}
//                       value={payload?.address}
//                     />
//                     <ReactInput
//                       type="tel"
//                       name="contact"
//                       // required={true}
//                       label="Contact"
//                       onChange={handleChange}
//                       value={payload?.contact}
//                     />
//                     <ReactInput
//                       type="file"
//                       name="image"
//                       // required={true}
//                       label="Image"
//                       // accept: "image/*"
//                       onChange={handleChange}
//                       value={payload?.image}
//                     />
//         <div
//           style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}
//         >
//           <Button
//             onClick={handleSubmit}

//             name="Submit"

//           />

//           <Button onClick={closeModal}

//             name="Cancel"
//           />

//         </div>
//         </div>
//       </Modal>


//       <DynamicDataTable data={submittedData} handleDelete={handleDelete} />
//     </div>
//   );
// }

// export default Create_Staff;
