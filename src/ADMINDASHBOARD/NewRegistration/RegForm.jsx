import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider.js";
import axios from "axios";

import { toast } from "react-toastify";

import Modal from "../../Dynamic/Modal.jsx";
import Button from "../../Dynamic/utils/Button.jsx";
import { AdminGetAllClasses, StudentCreateRegistrations } from "../../Network/AdminApi.js";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput.jsx";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect.jsx";
import moment from "moment";

const RegForm = ({ setReload, reload }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  const [whatsAppMsg, setWhatsAppMsg] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const authToken = localStorage.getItem("token");
  const [modalOpen, setModalOpen] = useState(false);
  const { currentColor, setIsLoader } = useStateContext();
  // const [loading, setLoading] = useState(false);
  const [getClass, setGetClass] = useState([]);
  const SchoolDetails = JSON.parse(localStorage.getItem("SchoolDetails"));
  //  const validUser = localStorage.getItem("SchoolDetails");
  //  console.log("first validUser",validUser)
  const initialData = {
    studentFullName: "",
    fatherName: "",

    studentAddress: "",
    mobileNumber: "",
    registerClass: "",
    gender: { label: "Male", value: "Male" },
    amount: "",
    // createdBy:"",
    // dob:new Date()
    dob: moment().format("DD-MMM-YYYY"),
  };
  const [formData, setFormData] = useState(initialData);
  console.log("formData", formData);
  const toggleModal = () => {
    setModalOpen(!modalOpen);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const generateEmail = (name, contact) => {
    let emailPrefix = name?.toLowerCase();
    emailPrefix = emailPrefix?.replace(/[^a-z0-9]/g, "");
    const email = `${emailPrefix}${contact}@gmail.com`;
    return email;
  };
  // Use the generateEmail function
  const studentEmail = generateEmail(
    formData?.studentFullName,
    formData?.mobileNumber
  );
  const parentEmail = generateEmail(
    formData?.fatherName,
    formData?.mobileNumber
  );

  // if (!isValidEmail(studentEmail)) {
  //   toast.warn("Please enter a valid student email format.");
  //   return;
  // }
  // if (!isValidEmail(parentEmail)) {
  //   toast.warn("Please enter a valid parent email format.");
  //   return;
  // }

  const postData = async () => {
    const studentFullName = formData?.studentFullName;
    const fatherName = formData?.fatherName;
    const registerClass = formData?.registerClass;
    const mobileNumber = formData?.mobileNumber;

    if (!registerClass) {
      toast.error("Please fill Class!");

      return;
    }

    try {
      setIsLoader(true);
      const payload = {
        studentFullName: studentFullName || "",
        fatherName: fatherName || "",
        registerClass: registerClass || "",
        studentAddress: formData?.studentAddress || "",
        mobileNumber: Number(mobileNumber) || "",
        studentEmail: studentEmail || "",
        fatherEmail: parentEmail || "",
        gender: formData?.gender?.value || "",
        amount: Number(formData?.amount || "0"),
      };

      const response = await StudentCreateRegistrations(payload);

      if (response.success) {
        setIsLoader(false);
        setWhatsAppMsg(response);
        setIsModalOpen(true);
        console.log("response", response);
        setReload(!reload);
        toast.success(response.message || "Created successfully!");

        setFormData(initialData);
        setModalOpen(false);
        // refreshRegistrations();
      } else {
        setIsLoader(false);
        toast.error(response?.message || "Registration failed."); // Provide a default message
      }
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setIsLoader(false);
      // setLoading(false);  // Ensure loading is set to false, even if there's an error.
    }
  };
  const sendWhatsAppMessage = (val) => {
    // Add phoneNumber as an argument
    // Build the "card" as a string (styled with bold and monospace)
    const receiptCard = `
  --------------------------------------------------------
      ✨ *Registration Receipt* ✨
  --------------------------------------------------------
  *Registration No:* \`${val?.registration?.admissionNo}\`
  *Name:* \`${val?.registration?.studentFullName}\`
  *Class:* \`${val?.registration?.registerClass}\`
  *Father's Name:* \`${val.registration?.fatherName}\`
  *Contact :* \`${val?.registration?.mobileNumber}\`
  --------------------------------------------------------
             
                 *Thank you!* 🙏
              Welcome To Our Family
  ${user?.schoolName}
  --------------------------------------------------------
  `;
    const message = `*${user?.schoolName}*\n${
      user?.address
    }\n${"+91 XXXXXXXXXX"}\n${receiptCard}`; // Add intro text
    const encodedMessage = encodeURIComponent(message);
    const whatsappURL = `https://wa.me/91${val?.registration?.mobileNumber}?text=${encodedMessage}`;
    window.open(whatsappURL, "_blank");
  };

  // useEffect(() => {
  //   axios
  //     .get(
  //       "https://dvsserver.onrender.com/api/v1/adminRoute/getAllClasses",
  //       {
  //         withCredentials: true,
  //         headers: { Authorization: `Bearer ${authToken}` },
  //       }
  //     )
  //     .then((response) => {
  //       setGetClass(response.data.classList || []);
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching data:", error);
  //     });
  // }, []);

  
    const getAllClass = async()=>{
      setIsLoader(true)
    try {
  
      const response =await AdminGetAllClasses()
      // console.log("responseresponse",response)
      if(response?.success){
        setIsLoader(false)
        let classes = response.classes;
        setGetClass(classes.sort((a, b) => a - b));
      }
    } catch (error) {
      console.log("error")
    }
    }
  
    useEffect(()=>{
      getAllClass()
    },[])
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    postData();
    // createStudent()
  };

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));
  return (
    <>
      <Button name=" New Registration" onClick={toggleModal} />
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create "}>
        <form
          onSubmit={handleSubmit}
          className=" dark:text-white dark:bg-secondary-dark-bg bg-gray-50 p-2 "
        >
          <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 ">
            <div className="lg:col-span-6 p-4">
              <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-3  ">
                <ReactInput
                  type="text"
                  name="studentFullName"
                  required={true}
                  label="Student's Name"
                  onChange={handleChange}
                  value={formData.studentFullName}
                />

                <ReactInput
                  type="text"
                  name="fatherName"
                  required={true}
                  label="Father's Name"
                  onChange={handleChange}
                  value={formData.fatherName}
                />

                <ReactInput
                  type="text"
                  name="mobileNumber"
                  required={true}
                  label="Contact"
                  onChange={handleChange}
                  value={formData.mobileNumber}
                />

                <ReactSelect
                  name="registerClass"
                  value={formData.registerClass}
                  required={true}
                  handleChange={handleChange}
                  label="Select a Class"
                  dynamicOptions={dynamicOptions}
                />
                <ReactSelect
                  name="gender"
                  value={formData?.gender?.value}
                  handleChange={handleChange}
                  label="Gender"
                  dynamicOptions={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Other", value: "Other" },
                  ]}
                />
                <ReactInput
                  type="date"
                  name="dob"
                  // required={true}
                  label="DOB"
                  onChange={handleChange}
                  value={formData.dob}
                />
                <ReactInput
                  type="text"
                  name="studentAddress"
                  // required={true}
                  label=" Address / Street"
                  onChange={handleChange}
                  value={formData.studentAddress}
                />
                <ReactInput
                  type="text"
                  name="amount"
                  // required={true}
                  label="Fee Amount"
                  onChange={handleChange}
                  value={formData.amount}
                />
              </div>
            </div>
          </div>
          <div className="p-4">
            <Button
              type="submit"
              name={"Submit"}
              //  name= {loading ? "Submitting..." : "Submit"}
              width="full"
            />
          </div>
          {/* <Button type="submit" variant="contained" style={{ backgroundColor: currentColor }}>
            {loading ? "Submitting..." : "Submit"}
          </Button> */}
        </form>
      </Modal>
      <Modal
        setIsOpen={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
        title={"Registration Successfully!"}
        maxWidth="100px"
      >
        <div className="bg-white p-6 rounded-lg shadow-lg">
          <p>Do you want to send this </p>
          <p>message on WhatsApp</p>

          <div className="mt-4 flex justify-end space-x-4">
            <button
              onClick={() => sendWhatsAppMessage(whatsAppMsg)}
              className="bg-green-500 text-white px-4 py-2 rounded w-full"
            >
              OK
            </button>
            <button
              onClick={() => setIsModalOpen(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded w-full"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default RegForm;

// import React, { useState ,useEffect} from "react";
// import { useStateContext } from "../../contexts/ContextProvider.js";
// import axios from "axios";
// import Cookies from "js-cookie";
// import { toast } from "react-toastify";
// import { Button } from "@mui/material";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import Modal from "../../Dynamic/Modal.jsx";
// AOS.init();

// const RegForm = ({ refreshRegistrations }) => {
//   const authToken = Cookies.get("token");
//   const [isOpen, setIsOpen] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [getClass,setGetClass]=useState({})

//   // console.log("firstgetClass",getClass)
//   const { currentColor } = useStateContext();
//   const initialData = {
//     studentFullName: "",
//     guardianName: "",
//     studentEmail: "@gmail.com",
//     studentAddress: "",
//     mobileNumber: "",
//     registerClass: "NURSERY",
//     gender: "Male",
//     amount: "",
//   };
//   const [formData, setFormData] = useState(initialData);

//   const postData = async () => {
//     try {
//       setLoading(true);
//       await axios
//         .post(
//           "https://dvsserver.onrender.com/api/v1/adminRoute/createRegistration",
//           formData,
//           {
//             withCredentials: true,
//             headers: {
//               Authorization: `Bearer ${authToken}`,
//             },
//           }
//         )
//         .then((response) => {
//           toast.success("Created successfully!");
//           setFormData(initialData);
//           setIsOpen(false);
//           refreshRegistrations();
//           setLoading(false);
//         })
//         .catch((error) => {
//           console.log(error);
//           setLoading(false);
//         });
//     } catch (error) {
//       console.log(error);
//       setLoading(false);
//     }
//   };
//   useEffect(() => {
//     axios
//       .get(
//         `https://dvsserver.onrender.com/api/v1/adminRoute/getAllClasses`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         // setSubmittedData(response.data.classList);
//         setGetClass(response.data.classList)
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData({ ...formData, [name]: value });
//   };
//   const handleSubmit = (e) => {
//     e.preventDefault();
//     postData();
//   };

//   return (
//     <>
//       <Button
//         onClick={toggleModal}
//         variant="contained"
//         className="dark:text-white dark:bg-secondary-dark-bg "
//         style={{ backgroundColor: currentColor }}
//       >
//         New Registration
//       </Button>

//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create Curriculum"}>
//                 <form
//                   onSubmit={handleSubmit}
//                   className=" dark:text-white dark:bg-secondary-dark-bg "
//                 >
//                   <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 ">
//                     <div className="lg:col-span-6">
//                       <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6 ">
//                         <div className="md:col-span-3 ">
//                           <label htmlFor="studentFullName">Full Name</label>
//                           <input
//                             type="text"
//                             name="studentFullName"
//                             id="studentFullName"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.studentFullName}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         <div className="md:col-span-3">
//                           <label htmlFor="fatherName">Guardian's Name</label>
//                           <input
//                             type="text"
//                             name="guardianName"
//                             id="guardianName"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.guardianName}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         <div className="md:col-span-6">
//                           <label htmlFor="studentEmail">Email Address</label>
//                           <input
//                             type="email"
//                             name="studentEmail"
//                             id="studentEmail"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.studentEmail}
//                             onChange={handleChange}
//                             placeholder="email@domain.com"
//                           />
//                         </div>
//                         <div className="md:col-span-3">
//                           <label htmlFor="studentAddress">
//                             Address / Street
//                           </label>
//                           <input
//                             type="text"
//                             name="studentAddress"
//                             id="studentAddress"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.studentAddress}
//                             onChange={handleChange}
//                           />
//                         </div>
//                         <div className="md:col-span-3">
//                           <label htmlFor="mobileNumber">Mobile</label>
//                           <input
//                             type="number"
//                             name="mobileNumber"
//                             id="mobileNumber"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.mobileNumber}
//                             onChange={handleChange}
//                             maxLength="10"
//                           />
//                         </div>

//                         <div className="md:col-span-3">
//                           <label htmlFor="registerClass">Class</label>
//                           <select
//                             name="registerClass"
//                             id="registerClass"
//                             className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                             value={formData.registerClass}
//                             onChange={handleChange}
//                           >
//                             {
//                             getClass &&
//                             getClass.map((className) => (
//                               <option
//                                 key={className._id}
//                                 value={className.className}
//                                 className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                               >
//                                 {className.className}
//                               </option>
//                             ))}

//                           </select>
//                         </div>
//                         <div className="md:col-span-3">
//                           <label htmlFor="gender">Gender</label>
//                           <div className="flex items-center mt-1">
//                             <label className="mr-4">
//                               <input
//                                 type="radio"
//                                 name="gender"
//                                 value="Male"
//                                 checked={formData.gender === "Male"}
//                                 onChange={handleChange}
//                                 className="mr-2"
//                               />
//                               Male
//                             </label>
//                             <label className="mr-4">
//                               <input
//                                 type="radio"
//                                 name="gender"
//                                 value="Female"
//                                 checked={formData.gender === "Female"}
//                                 onChange={handleChange}
//                                 className="mr-2"
//                               />
//                               Female
//                             </label>
//                             <label>
//                               <input
//                                 type="radio"
//                                 name="gender"
//                                 value="Other"
//                                 checked={formData.gender === "Other"}
//                                 onChange={handleChange}
//                                 className="mr-2"
//                               />
//                               Other
//                             </label>
//                           </div>
//                           <div className="md:col-span-3">
//                             <label htmlFor="mobileNumber">Amount</label>
//                             <input
//                               type="amount"
//                               name="amount"
//                               id="amount"
//                               className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
//                               value={formData.amount}
//                               onChange={handleChange}
//                             />
//                           </div>
//                         </div>
//                         <div className="md:col-span-6 text-right mt-3">
//                           <div className="flex items-center gap-5 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
//                             <Button
//                               type="submit"
//                               variant="contained"
//                               style={{
//                                 backgroundColor: currentColor,
//                                 color: "white",
//                                 width: "100%",
//                               }}
//                             >
//                               {loading ? (
//                                 <svg
//                                   aria-hidden="true"
//                                   className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
//                                   viewBox="0 0 100 101"
//                                   fill="none"
//                                   xmlns="http://www.w3.org/2000/svg"
//                                 >
//                                   <path
//                                     d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
//                                     fill="currentColor"
//                                   />
//                                   <path
//                                     d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
//                                     fill="currentFill"
//                                   />
//                                 </svg>
//                               ) : (
//                                 " Submit"
//                               )}
//                             </Button>
//                             <Button
//                               variant="contained"
//                               onClick={toggleModal}
//                               style={{
//                                 backgroundColor: "#616161",
//                                 color: "white",
//                                 width: "100%",
//                               }}
//                             >
//                               Cancel
//                             </Button>
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </form>
//                 <Modal/>

//     </>
//   );
// };

// export default RegForm;
