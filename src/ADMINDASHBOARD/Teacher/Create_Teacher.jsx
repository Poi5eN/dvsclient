import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../../Dynamic/Form/FormStyle.css";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaEdit } from "react-icons/fa";
import { AdminGetAllClasses, getAllTeachers } from "../../Network/AdminApi";
import EditTeacher from "./EditTeacher";
import Table from "../../Dynamic/Table";
import moment from "moment";
import Button from "../../Dynamic/utils/Button";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import Modal from "../../Dynamic/Modal";
import ImageCaptureCrop from "../../Dynamic/Camera/ImageCaptureCrop";

const authToken = localStorage.getItem("token");

const toastifyTiming = {
  autoClose: 1000,
};

const initialState = {
  teacherName: "",
  employeeId: "",
  email: "",
  password: "",
  dateOfBirth: "",
  qualification: "",
  salary: "",
  subject: "",
  gender: "",
  joiningDate: "",
  address: "",
  contact: "",
  experience: "",
  section: "",
  classTeacher: "",
  image: null,
};

function CreateTeacher() {
  const { currentColor, setIsLoader } = useStateContext();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
 const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [getClass, setGetClass] = useState([]);

  const toggleModal = () => {
    // setIsOpen(!isOpen);
    setModalOpen(!modalOpen)
    if (modalOpen) {
      setFormData(initialState);
    }
  };

  const getAllClass = async () => {
    try {
      const response = await AdminGetAllClasses();
      if (response?.success) {
        let classes = response.classes;
        setGetClass(classes.sort((a, b) => a - b));
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getAllClass();
  }, []);

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    console.log("Selected Class:", selectedClassName); // Debugging
    const selectedClassObj = getClass?.find((cls) => cls.className === selectedClassName);
    if (selectedClassObj) {
      setAvailableSections(selectedClassObj.sections);
    } else {
      setAvailableSections([]);
    }
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
    console.log("Selected Section:", e.target.value); // Debugging
  };

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));
  const DynamicSection = availableSections?.map((item) => ({
    label: item,
    value: item,
  }));

  const getTeachers = async () => {
    setIsLoader(true);
    try {
      const response = await getAllTeachers();
      if (response?.success) {
        setSubmittedData(response?.data);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to fetch teachers.");
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    getTeachers();
  }, [isEdit]);

  const handleFieldChange = (fieldName, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  const handleSelectChange = (fieldName, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
    const handleImageProcessed = (fileObject, imageFieldName) => {
    setFormData((prevPayload) => ({
        ...prevPayload,
        [imageFieldName]: fileObject, // fileObject will be a File or null
    }));
};

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: file,
      }));
    }
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formDataToSend.append(key, value);
      } else if (value !== null && value !== undefined && value !== "") {
        formDataToSend.append(key, String(value));
      }
    });

    // Explicitly append classTeacher and section
    formDataToSend.append("classTeacher", selectedClass);
    formDataToSend.append("section", selectedSection);

    // Debug output
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    setIsLoader(true);
    try {
      const response = await axios.post(
        "https://dvsserver.onrender.com/api/v1/adminRoute/teacher",
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFormData(initialState);
      getTeachers();
      setModalOpen(false)
      toast.success("Form submitted successfully!");
      // setIsOpen(false);
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data?.message || "Validation error or email already exists.", toastifyTiming);
        return;
      }
      toast.error(
        error.response?.data?.message || "An error occurred while submitting the form.",
        toastifyTiming
      );
    } finally {
      setIsLoader(false);
    }
  };

  const onEdit = (val) => {
    setIsEdit(true);
    setTeacherDetails(val);
  };

  const handleCancel = () => {
    setIsEdit(false);
  };

  const THEAD = [
    { id: "SN", label: "S No.", width: "5" },
    { id: "photo", label: "Photo", width: "7" },
    { id: "employeeID", label: "Employee ID" },
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "class", label: "Class Teacher" },
    { id: "section", label: "Section" },
    { id: "contact", label: "Contact" },
    { id: "joiningDate", label: "Joining Date" },
    { id: "action", label: "Action" },
  ];

  const tBody = submittedData?.map((val, ind) => ({
    SN: ind + 1,
    photo: (
      <img
        src={
          val.image?.url ||
          "https://www.stcroixstoves.com/wp-content/uploads/2020/04/no.png"
        }
        alt="photo"
        className="w-10 h-10 object-cover rounded-md"
      />
    ),
    employeeID: (
      <span className="text-green-800 font-semibold">{val.employeeId}</span>
    ),
    name: val.teacherName,
    email: val.email,
    class: val.classTeacher === "Not a class teacher" || !val.classTeacher ? "N/A" : val.classTeacher,
    section: val.classTeacher === "Not a class teacher" || !val.classTeacher ? "N/A" : val.section,
    contact: val.contact,
    joiningDate: moment(val.joiningDate).format("DD-MMM-YYYY"),
    action: (
      <div className="flex justify-center gap-5">
        <span className="cursor-pointer">
          <FaEdit
            className="text-[20px] text-yellow-700"
            onClick={() => onEdit(val)}
          />
        </span>
      </div>
    ),
  }));

  return (
    <>
      <PageHeaderWithBreadcrumb
        breadcrumbItems={BreadcrumbList.admission}
        title="All Teachers"
      />
      {!isEdit ? (
        <>
          <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2 mb-4">
            <Button onClick={toggleModal} name="Add New Teacher" />
          </div>
          <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create"} maxWidth="500px">
 <div className="p-4 md:p-5">
                     <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-4">

                        <ReactInput
                          type="text"
                          name="teacherName"
                          required={true}
                          label="Full Name"
                          onChange={handleInputChange}
                          value={formData.teacherName}
                        />
                        <ReactInput
                          type="text"
                          name="employeeId"
                          required={true}
                          label="Employee ID"
                          onChange={handleInputChange}
                          value={formData.employeeId}
                        />
                        <ReactInput
                          type="email"
                          name="email"
                          required={true}
                          label="Email"
                          onChange={handleInputChange}
                          value={formData.email}
                        />
                        <ReactInput
                          type="password"
                          name="password"
                          required={true}
                          label="Password"
                          onChange={handleInputChange}
                          value={formData.password}
                        />
                        <ReactInput
                          type="date"
                          name="dateOfBirth"
                          required={true}
                          label="Date of Birth"
                          onChange={handleInputChange}
                          value={formData.dateOfBirth}
                        />
                        <ReactInput
                          type="text"
                          name="qualification"
                          required={true}
                          label="Qualification"
                          onChange={handleInputChange}
                          value={formData.qualification}
                        />
                        <ReactInput
                          type="number"
                          name="salary"
                          required={true}
                          label="Salary"
                          onChange={handleInputChange}
                          value={formData.salary}
                        />
                        <ReactInput
                          type="text"
                          name="subject"
                          required={true}
                          label="Subject Taught"
                          onChange={handleInputChange}
                          value={formData.subject}
                        />
                        <ReactInput
                          type="date"
                          name="joiningDate"
                          required={true}
                          label="Joining Date"
                          onChange={handleInputChange}
                          value={formData.joiningDate}
                        />
                        <ReactInput
                          type="text"
                          name="address"
                          required={true}
                          label="Address"
                          onChange={handleInputChange}
                          value={formData.address}
                        />
                        <ReactInput
                          type="tel"
                          maxLength="10"
                          name="contact"
                          required={true}
                          label="Contact Number"
                          onChange={handleInputChange}
                          value={formData.contact}
                        />
                        <ReactSelect
                          required={true}
                          name="experience"
                          value={formData.experience}
                          handleChange={handleInputChange}
                          label="Years of Experience"
                          dynamicOptions={[
                            { label: "1", value: "1" },
                            { label: "2", value: "2" },
                            { label: "3", value: "3" },
                            { label: "4", value: "4" },
                            { label: "5", value: "5" },
                            { label: "6", value: "6" },
                            { label: "7", value: "7" },
                            { label: "8", value: "8" },
                            { label: "9", value: "9" },
                            { label: "10", value: "10" },
                            { label: "10+", value: "10+" },
                          ]}
                        />
                        <ReactSelect
                          name="gender"
                          value={formData?.gender}
                          handleChange={handleInputChange}
                          label="Gender"
                          dynamicOptions={[
                            { label: "Male", value: "Male" },
                            { label: "Female", value: "Female" },
                            { label: "Other", value: "Other" },
                          ]}
                        />
                        <ReactSelect
                          required={true}
                          name="classTeacher"
                          value={selectedClass}
                          handleChange={handleClassChange}
                          label="Select a Class"
                          dynamicOptions={dynamicOptions}
                        />
                        <ReactSelect
                          required={true}
                          name="section"
                          value={selectedSection}
                          handleChange={handleSectionChange}
                          label="Select a Section"
                          dynamicOptions={DynamicSection}
                        />
                        <ImageCaptureCrop
                                        label="Photo"
                                        onImageCropped={(file) => handleImageProcessed(file, 'image')}
                                        initialImageUrl={typeof formData.image === 'string' ? formData.image : null}
                                        aspectRatio={1}
                                        previewSize={120}
                                    />

                        <ReactInput
                          type="file"
                          name="image"
                          label="Profile Pic"
                          onChange={handleImageChange}
                          accept="image/*"
                        />
                      </div>
                      <div className="flex items-center justify-end gap-3 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 mt-4">
                        <Button
                          name="Submit"
                          onClick={handleSubmit}
                        />
                        <Button
                          name="Cancel"
                          onClick={toggleModal}
                          variant="outlined"
                        />
                      </div>
                    </div>
          </Modal>

          <Table tBody={tBody} tHead={THEAD} />
        </>
      ) : (
        <EditTeacher
          teacherDetails={teacherDetails}
          handleCancel={handleCancel}
          setIsEdit={setIsEdit}
          getTeachers={getTeachers}
        />
      )}
    </>
  );
}

export default CreateTeacher;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "../../Dynamic/Form/FormStyle.css";
// // import InputForm from "../../Dynamic/Form/InputForm"; // Removed InputForm
// import { useStateContext } from "../../contexts/ContextProvider";
// import { FaEdit } from "react-icons/fa";
// // import Heading from "../../Dynamic/Heading"; // Not used directly, can be removed if not needed elsewhere
// import { AdminGetAllClasses, getAllTeachers } from "../../Network/AdminApi";
// import EditTeacher from "./EditTeacher";
// import Table from "../../Dynamic/Table";
// import moment from "moment";
// import Button from "../../Dynamic/utils/Button";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";

// const authToken = localStorage.getItem("token");

// const toastifyTiming = {
//   autoClose: 1000,
// };

// const initialState = {
//   teacherName: "",
//   employeeId: "",
//   email: "",
//   password: "",
//   dateOfBirth: "",
//   qualification: "",
//   salary: "",
//   subject: "",
//   gender: "",
//   joiningDate: "",
//   address: "",
//   contact: "",
//   experience: "",
//   section: "",
//   classTeacher: "",
//   image: null,
// };

// // Options for select inputs (can be defined outside if static)
// const experienceOptions = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10+"];
// const genderOptions = ["Male", "Female", "Other"];
// const sectionOptions = ["A", "B", "C", "D", "E"];


// function CreateTeacher() {
//   const { currentColor, setIsLoader } = useStateContext();
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);



//   const [isEdit, setIsEdit] = useState(false);
//   const [teacherDetails, setTeacherDetails] = useState([]);
//   // const [loading, setLoading] = useState(false); // Not explicitly used for buttons anymore
//   const [formData, setFormData] = useState(initialState);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [getClass, setGetClass] = useState([]);

//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//     if (isOpen) { // If closing modal, reset form
//       setFormData(initialState);
//     }
//   };

//    const getAllClass = async () => {
//       try {
//         const response = await AdminGetAllClasses();
//         if (response?.success) {
//           let classes = response.classes;
//           setGetClass(classes.sort((a, b) => a - b));
//         }
//       } catch (error) {
//         console.log("error", error);
//       }
//     };
  
//     useEffect(() => {
//       getAllClass();
//     }, []);
//      const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass?.find((cls) => cls.className === selectedClassName);
//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections);
//     } else {
//       setAvailableSections([]);
//     }
//   };

//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value);
//   };
//   const dynamicOptions = getClass.map((cls) => ({
//     label: cls.className,
//     value: cls.className,
//   }));
//   const DynamicSection = availableSections?.map((item) => ({
//     label: item,
//     value: item,
//   }));

//   // const GetAllClasses = async () => {
//   //   setIsLoader(true);
//   //   try {
//   //     const response = await AdminGetAllClasses();
//   //     if (response?.success) {
//   //       let classes = response?.classes.map((cls) => cls.className);
//   //       setGetClass(classes.sort((a, b) => a - b));
//   //     } else {
//   //       toast.error(response?.message);
//   //     }
//   //   } catch (error) {
//   //     console.log("error", error);
//   //     toast.error("Failed to fetch classes.");
//   //   } finally {
//   //     setIsLoader(false);
//   //   }
//   // };

//   const getTeachers = async () => {
//     setIsLoader(true);
//     try {
//       const response = await getAllTeachers();
//       if (response?.success) {
//         setSubmittedData(response?.data);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//       toast.error("Failed to fetch teachers.");
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   useEffect(() => {
//     getTeachers();
//     // GetAllClasses();
//   }, [isEdit]);

//   const handleFieldChange = (fieldName, value) => {
//     setFormData((prevFormData) => ({ // Use functional update for safety
//       ...prevFormData,
//       [fieldName]: value,
//     }));
//   };
  
//   // Specific handler for ReactSelect if it passes value directly
//   const handleSelectChange = (fieldName, value) => {
//     setFormData((prevFormData) => ({
//         ...prevFormData,
//         [fieldName]: value,
//     }));
//   };
  
//   // Handler for standard input elements (like ReactInput)
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prevFormData) => ({
//         ...prevFormData,
//         [name]: value,
//     }));
//   };


//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setFormData((prevFormData) => ({
//         ...prevFormData,
//         image: file,
//       }));
//     }
//   };

//   // const handleSubmit = async () => {
//   //   const formDataToSend = new FormData();
//   //   Object.entries(formData).forEach(([key, value]) => {
//   //     if (key === "image" && value instanceof File) { // Check if it's a File object
//   //       formDataToSend.append(key, value);
//   //     } else if (key !== "image" && value !== null && value !== undefined && value !== "") {
//   //       formDataToSend.append(key, String(value));
//   //     }
//   //   });
    
//   //   // Log FormData entries for debugging
//   //   // for (let pair of formDataToSend.entries()) {
//   //   //   console.log(pair[0]+ ', ' + pair[1]); 
//   //   // }


//   //   setIsLoader(true);
//   //   try {
//   //     const response = await axios.post(
//   //       "https://dvsserver.onrender.com/api/v1/adminRoute/teacher",
//   //       formDataToSend,
//   //       {
//   //         withCredentials: true,
//   //         headers: {
//   //           Authorization: `Bearer ${authToken}`,
//   //           "Content-Type": "multipart/form-data",
//   //         },
//   //       }
//   //     );
//   //     setFormData(initialState);
//   //     getTeachers();
//   //     toast.success("Form submitted successfully!");
//   //     setIsOpen(false);
//   //   } catch (error) {
//   //     console.error("Error:", error.response ? error.response.data : error.message);
//   //     if (error.response && error.response.status === 400) {
//   //       toast.error(error.response.data?.message || "Validation error or email already exists.", toastifyTiming);
//   //       return;
//   //     }
//   //     toast.error(
//   //       error.response?.data?.message || "An error occurred while submitting the form.",
//   //       toastifyTiming
//   //     );
//   //   } finally {
//   //     setIsLoader(false);
//   //   }
//   // };



//   const handleSubmit = async () => {
//   const formDataToSend = new FormData();

//   // Append general form fields
//   Object.entries(formData).forEach(([key, value]) => {
//     if (key === "image" && value instanceof File) {
//       formDataToSend.append(key, value);
//     } else if (value !== null && value !== undefined && value !== "") {
//       formDataToSend.append(key, String(value));
//     }
//   });

//   // ✅ Explicitly append classTeacher and section (in case they are not present or differently structured)
//   if (formData.classTeacher) {
//     formDataToSend.append("classTeacher", selectedClass);
//   }
//   if (formData.section) {
//     formDataToSend.append("section", selectedSection);
//   }

//   // Optional: Debug output
//   // for (let pair of formDataToSend.entries()) {
//   //   console.log(pair[0]+ ': ' + pair[1]); 
//   // }

//   setIsLoader(true);
//   try {
//     const response = await axios.post(
//       "https://dvsserver.onrender.com/api/v1/adminRoute/teacher",
//       formDataToSend,
//       {
//         withCredentials: true,
//         headers: {
//           Authorization: `Bearer ${authToken}`,
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//     setFormData(initialState);
//     getTeachers();
//     toast.success("Form submitted successfully!");
//     setIsOpen(false);
//   } catch (error) {
//     console.error("Error:", error.response ? error.response.data : error.message);
//     if (error.response && error.response.status === 400) {
//       toast.error(error.response.data?.message || "Validation error or email already exists.", toastifyTiming);
//       return;
//     }
//     toast.error(
//       error.response?.data?.message || "An error occurred while submitting the form.",
//       toastifyTiming
//     );
//   } finally {
//     setIsLoader(false);
//   }
// };

//   const onEdit = (val) => {
//     setIsEdit(true);
//     setTeacherDetails(val);
//   };

//   const handleCancel = () => {
//     setIsEdit(false);
//   };

//   const THEAD = [
//     { id: "SN", label: "S No.", width: "5" },
//     { id: "photo", label: "Photo", width: "7" },
//     { id: "employeeID", label: "Employee ID" },
//     { id: "name", label: "Name" },
//     { id: "email", label: "Email" },
//     { id: "class", label: "Class Teacher For" },
//     { id: "section", label: "Section" },
//     { id: "contact", label: "Contact" },
//     { id: "joiningDate", label: "Joining Date" },
//     { id: "action", label: "Action" },
//   ];

//   const tBody = submittedData?.map((val, ind) => ({
//     SN: ind + 1,
//     photo: (
//       <img
//         src={
//           val.image?.url ||
//           "https://www.stcroixstoves.com/wp-content/uploads/2020/04/no.png"
//         }
//         alt="photo"
//         className="w-10 h-10 object-cover rounded-md"
//       />
//     ),
//     employeeID: (
//       <span className="text-green-800 font-semibold">{val.employeeId}</span>
//     ),
//     name: val.teacherName,
//     email: val.email,
//     class: val.classTeacher === "Not a class teacher" || !val.classTeacher ? "N/A" : val.classTeacher,
//     section: val.classTeacher === "Not a class teacher" || !val.classTeacher ? "N/A" : val.section,
//     contact: val.contact,
//     joiningDate: moment(val.joiningDate).format("DD-MMM-YYYY"),
//     action: (
//       <div className="flex justify-center gap-5">
//         <span className="cursor-pointer">
//           <FaEdit
//             className="text-[20px] text-yellow-700"
//             onClick={() => onEdit(val)}
//           />
//         </span>
//       </div>
//     ),
//   }));

//   return (
//     <>
//       <PageHeaderWithBreadcrumb
//         breadcrumbItems={BreadcrumbList.admission}
//         title="All Teachers"
//       />
//       {!isEdit ? (
//         <>
//           <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2 mb-4">
//             <Button onClick={toggleModal} name="Add New Teacher" />
//           </div>
//           {isOpen && (
//             <div
//               id="default-modal"
//               tabIndex="-1"
//               aria-hidden="true"
//               className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//             >
//               <div
//                 className="relative p-4 w-full max-w-3xl max-h-full"
//                 data-aos="fade-down"
//               >
//                 <div className="relative rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//                   <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
//                     <h3 className="text-xl font-semibold dark:text-white">
//                       Add New Teacher
//                     </h3>
//                     <button
//                       onClick={toggleModal}
//                       type="button"
//                       className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                     >
//                       <svg
//                         className="w-3 h-3"
//                         aria-hidden="true"
//                         xmlns="http://www.w3.org/2000/svg"
//                         fill="none"
//                         viewBox="0 0 14 14"
//                       >
//                         <path
//                           stroke="currentColor"
//                           strokeLinecap="round"
//                           strokeLinejoin="round"
//                           strokeWidth="2"
//                           d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                         />
//                       </svg>
//                       <span className="sr-only">Close modal</span>
//                     </button>
//                   </div>
//                   <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh] overflow-auto bg-gray-50">
//                     <div className="p-4 md:p-5">
//                       <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
//                         {/* Explicitly written inputs */}
//                         <ReactInput
//                           type="text"
//                           name="teacherName"
//                           required={true}
//                           label="Full Name"
//                           onChange={handleInputChange} // Use general input handler
//                           value={formData.teacherName}
//                         />
//                         <ReactInput
//                           type="text"
//                           name="employeeId"
//                           required={true}
//                           label="Employee ID"
//                           onChange={handleInputChange}
//                           value={formData.employeeId}
//                         />
//                         <ReactInput
//                           type="email"
//                           name="email"
//                           required={true}
//                           label="Email"
//                           onChange={handleInputChange}
//                           value={formData.email}
//                         />
//                         <ReactInput
//                           type="password"
//                           name="password"
//                           required={true}
//                           label="Password"
//                           onChange={handleInputChange}
//                           value={formData.password}
//                         />
//                         <ReactInput
//                           type="date"
//                           name="dateOfBirth"
//                           required={true}
//                           label="Date of Birth"
//                           onChange={handleInputChange}
//                           value={formData.dateOfBirth}
//                         />
//                         <ReactInput
//                           type="text"
//                           name="qualification"
//                           required={true}
//                           label="Qualification"
//                           onChange={handleInputChange}
//                           value={formData.qualification}
//                         />
//                         <ReactInput
//                           type="number"
//                           name="salary"
//                           required={true}
//                           label="Salary"
//                           onChange={handleInputChange}
//                           value={formData.salary}
//                         />
//                         <ReactInput
//                           type="text"
//                           name="subject"
//                           required={true}
//                           label="Subject Taught"
//                           onChange={handleInputChange}
//                           value={formData.subject}
//                         />
//                         <ReactInput
//                           type="date"
//                           name="joiningDate"
//                           required={true}
//                           label="Joining Date"
//                           onChange={handleInputChange}
//                           value={formData.joiningDate}
//                         />
//                         <ReactInput
//                           type="text" // Or textarea if ReactInput supports it
//                           name="address"
//                           required={true}
//                           label="Address"
//                           onChange={handleInputChange}
//                           value={formData.address}
//                         />
//                         <ReactInput
//                           type="tel"
//                           maxLength="10"
//                           name="contact"
//                           required={true}
//                           label="Contact Number"
//                           onChange={handleInputChange}
//                           value={formData.contact}
//                         />
//                         <ReactSelect
//                           required={true}
//                           name="experience"
//                           value={formData.experience}
//                           // Assuming ReactSelect's handleChange passes (name, value) or just value.
//                           // If it passes just value: handleChange={(value) => handleSelectChange("experience", value)}
//                           // If it passes event: handleChange={handleInputChange} and ensure ReactSelect sets event.target.name and event.target.value
//                           handleChange={handleInputChange} // Adjust if ReactSelect passes (name, value) or event
//                           // handleChange={(value) => handleSelectChange("experience", value)} // Adjust if ReactSelect passes (name, value) or event
//                           label="Years of Experience"
//                           dynamicOptions={[
//                                         { label: "1", value: "1" },
//                                         { label: "2", value: "2" },
//                                         { label: "3", value: "3" },
//                                         { label: "4", value: "4" },
//                                         { label: "5", value: "5" },
//                                         { label: "6", value: "6" },
//                                         { label: "7", value: "7" },
//                                         { label: "8", value: "8" },
//                                         { label: "9", value: "9" },
//                                         { label: "10", value: "10" },
//                                         { label: "10+", value: "10+" },
//                                       ]}
//                           // dynamicOptions={experienceOptions} // Pass the array directly
//                         />
//                         {/* <ReactSelect
//                           required={true}
//                           name="gender"
//                           value={formData.gender}
//                           handleChange={(value) => handleSelectChange("gender", value)}
//                           label="Gender"
//                           dynamicOptions={genderOptions}
//                         /> */}
//                          <ReactSelect
//                                       required={true}
//                                       name="classTeacher"
//                                       value={selectedClass}
//                                       handleChange={handleClassChange}
//                                       label="Select a Class"
//                                       dynamicOptions={dynamicOptions}
//                                     />
//                                     <ReactSelect
//                                       required={true}
//                                       name="section"
//                                       value={selectedSection}
//                                       handleChange={handleSectionChange}
//                                       label="Select a Section"
//                                       dynamicOptions={DynamicSection}
//                                     />
//                          <ReactSelect
//                                       name="studentGender"
//                                       value={formData?.studentGender}
//                                       handleChange={handleSelectChange}
//                                       label="Gender"
//                                       dynamicOptions={[
//                                         { label: "Male", value: "Male" },
//                                         { label: "Female", value: "Female" },
//                                         { label: "Other", value: "Other" },
//                                       ]}
//                                     />
                       
//                         <ReactInput
//                           type="file"
//                           name="image"
//                           // required={true} // Profile pic might be optional
//                           label="Profile Pic"
//                           onChange={handleImageChange} // Specific handler for file
//                           accept="image/*"
//                           // File inputs don't typically use a 'value' prop
//                         />
//                       </div>
//                       <div className="flex items-center justify-end gap-3 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 mt-4">
//                         <Button
//                           name="Submit"
//                           onClick={handleSubmit}
//                           // isLoading={loading} // If you have a loading state for the button
//                         />
//                         <Button
//                           name="Cancel"
//                           onClick={toggleModal}
//                           variant="outlined" // Example
//                         />
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}
//           <Table tBody={tBody} tHead={THEAD} />
//         </>
//       ) : (
//         <EditTeacher
//           teacherDetails={teacherDetails}
//           handleCancel={handleCancel}
//           setIsEdit={setIsEdit}
//           getTeachers={getTeachers} // Pass getTeachers for refresh after edit
//         />
//       )}
//     </>
//   );
// }

// export default CreateTeacher;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "../../Dynamic/Form/FormStyle.css";
// // import InputForm from "../../Dynamic/Form/InputForm"; // Removed InputForm
// import { useStateContext } from "../../contexts/ContextProvider";
// import { FaEdit } from "react-icons/fa";
// import Heading from "../../Dynamic/Heading";
// import { AdminGetAllClasses, getAllTeachers } from "../../Network/AdminApi";
// import EditTeacher from "./EditTeacher";
// import Table from "../../Dynamic/Table";
// import moment from "moment";
// import Button from "../../Dynamic/utils/Button";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";

// const authToken = localStorage.getItem("token");

// const toastifyTiming = {
//   autoClose: 1000,
// };

// const initialState = {
//   teacherName: "",
//   employeeId: "",
//   email: "",
//   password: "",
//   dateOfBirth: "",
//   qualification: "",
//   salary: "",
//   subject: "",
//   gender: "",
//   joiningDate: "",
//   address: "",
//   contact: "",
//   experience: "",
//   section: "",
//   classTeacher: "",
//   image: null,
// };

// function CreateTeacher() {
//   const { currentColor,setIsLoader } = useStateContext();

//   const [isEdit, setIsEdit] = useState(false);
//   const [teacherDetails, setTeacherDetails] = useState([]);
//   const [loading, setLoading] = useState(false); // Keep this if used by buttons or other parts
//   const [formData, setFormData] = useState(initialState);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [getClass, setGetClass] = useState([]);
  
//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//     if (isOpen) { // If closing modal, reset form
//         setFormData(initialState);
//     }
//   };

//     const GetAllClasses=async()=>{
//       setIsLoader(true)
//       try {
//         const response= await AdminGetAllClasses();
//         console.log("response class",response)
//         if(response?.success){
//           let classes=response?.classes.map((cls)=>cls.className)
//           setGetClass(classes.sort((a,b)=>a-b));
//         }
//         else{
//           toast.error(response?.message)
//         }
//       } catch (error) {
//         console.log("error",error)
//       }
//       finally{
//         setIsLoader(false)
//       }
//     }

//     const getTeachers=async()=>{
//       setIsLoader(true)
//       try {
//         const response= await getAllTeachers()
//         if(response?.success){
//           setSubmittedData(response?.data);
//         }
//         else{
//           toast.error(response?.message)
//         }
//       } catch (error) {
//         console.log("error",error)
//       }
//       finally{
//         setIsLoader(false)
//       }
//     }

//   useEffect(() => {
//     getTeachers()
//     GetAllClasses()
//   }, [isEdit]); // Re-fetch when edit mode changes or after updates

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
//     const formDataToSend = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       if (key === "image" && value) {
//         formDataToSend.append(key, value);
//       } else if (key !== "image" && value !== null && value !== undefined) {
//         formDataToSend.append(key, String(value));
//       }
//     });
//     // Ensure image is appended if present
//     // if (formData.image) {
//     //   formDataToSend.append("image", formData.image);
//     // }


//     try {
//       // setLoading(true); // This loading state is not used for submit button, but keep if intended for whole form
//       setIsLoader(true); // Use context loader
//       const response = await axios.post(
//         "https://dvsserver.onrender.com/api/v1/adminRoute/teacher",
//         formDataToSend,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       setFormData(initialState);
//       // setLoading(false);
//       getTeachers(); // Refresh teacher list
//       toast.success("Form submitted successfully!");
//       setIsOpen(false); // Close modal on success
      
//     } catch (error) {
//       console.error("Error:", error);
//       // setLoading(false);
//       if (error.response && error.response.status === 400) {
//         toast.error(error.response.data?.message || "Email already exists.", toastifyTiming);
//         return;
//       }
//       toast.error(
//         error.response?.data?.message || "An error occurred while submitting the form.",
//         toastifyTiming
//       );
//     } finally {
//         setIsLoader(false);
//     }
//   };


//   const handleDelete = (email) => { // This function is not used in the current table, but kept for completeness
//     axios
//       .put(
//         `https://dvsserver.onrender.com/api/v1/adminRoute/deactivateTeacher`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then(() => {
//         const updatedData = submittedData.filter(
//           (item) => item.email !== email
//         );
//         setSubmittedData(updatedData);
//         toast.success("Teacher data deactivated successfully"); // Changed to deactivated
//       })
//       .catch((error) => {
//         console.error("Error deactivating teacher data:", error);
//         toast.error("An error occurred while deactivating the teacher data.");
//       });
//   };

//   // formFields definition remains the same, but how it's used changes
//   const formFields = [
//     {
//       label: "Full Name",
//       name: "teacherName",
//       type: "text",
//       value: formData.teacherName, // value is actually handled by formData state directly in ReactInput/ReactSelect
//       required: true,
//     },
//     {
//       label: "Employee ID",
//       name: "employeeId",
//       type: "text",
//       value: formData.employeeId,
//       required: true,
//     },
//     {
//       label: "Email",
//       name: "email",
//       type: "email",
//       value: formData.email,
//       required: true,
//     },
//     {
//       label: "Password",
//       name: "password",
//       type: "password",
//       value: formData.password,
//       required: true,
//     },
//     {
//       label: "Date of Birth",
//       name: "dateOfBirth",
//       type: "date",
//       value: formData.dateOfBirth,
//       required: true,
//     },
//     {
//       label: "Qualification",
//       name: "qualification",
//       type: "text",
//       value: formData.qualification,
//       required: true,
//     },
//     {
//       label: "Salary",
//       name: "salary",
//       type: "number",
//       value: formData.salary,
//       required: true,
//     },
//     {
//       label: "Subject Taught", // Made label more descriptive
//       name: "subject",
//       type: "text",
//       value: formData.subject,
//       required: true,
//     },
//     {
//       label: "Joining Date",
//       name: "joiningDate",
//       type: "date",
//       value: formData.joiningDate,
//       required: true,
//     },
//     {
//       label: "Address",
//       name: "address",
//       type: "text", // Could be textarea if ReactInput supports it or use a different component
//       value: formData.address,
//       required: true,
//     },
//     {
//       label: "Contact Number",
//       name: "contact",
//       type: "tel",
//       value: formData.contact,
//       maxLength: 10, // Example of an additional prop ReactInput might use
//       required: true,
//     },
//     {
//       label: "Years of Experience",
//       name: "experience",
//       type: "select",
//       value: formData.experience,
//       required: true,
//       selectOptions: [
//         "Experience", // Placeholder, will be sliced off for dynamicOptions
//         "0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "10+"
//       ],
//     },
//     {
//       label: "Gender",
//       name: "gender",
//       type: "select",
//       value: formData.gender,
//       required: true,
//       selectOptions: ["Gender", "Male", "Female", "Other"], // Placeholder
//     },
//     {
//       label: "Assign Class (as Class Teacher)",
//       name: "classTeacher",
//       type: "select",
//       value: formData.classTeacher,
//       // required: true, // This field might be optional if teacher is not a class teacher
//       selectOptions: [
//         "Not a class teacher", // Placeholder / Default option
//         ...getClass 
//       ],
//     },
//     {
//       label: "Assign Section (as Class Teacher)",
//       name: "section",
//       type: "select",
//       value: formData.section,
//       // required: formData.classTeacher && formData.classTeacher !== "Not a class teacher", // Conditionally required
//       selectOptions: ["Section", "A", "B", "C", "D", "E"], // Placeholder
//     },
//     {
//       label: "Profile Pic",
//       name: "image",
//       type: "file",
//       accept: "image/*", // Prop for ReactInput type="file"
//       // No value prop for file input in controlled sense
//     },
//   ];

//  const onEdit=(val)=>{
//   setIsEdit(true)
//   setTeacherDetails(val)
//  }
// const handleCancel=()=>{
//   setIsEdit(false)
// }


// const THEAD = [
//   { id: "SN", label: "S No.",width:"5"},
//   { id: "photo", label: "Photo",width:"7"},
//   { id: "employeeID", label: "Employee ID" },
//   { id: "name", label: "Name" },
//   { id: "email", label: "Email" },
//   { id: "class", label: "Class Teacher For" },
//   { id: "section", label: "Section" },
//   // { id: "dateOfBirth", label: "DOB" }, // Removed for brevity, can be added back
//   { id: "contact", label: "Contact" },
//   { id: "joiningDate", label: "Joining Date" },
//   // { id: "gender", label: "Gender" },
//   // { id: "address", label: "Address" },
//   { id: "action", label: "Action" },
// ];

//  const tBody = submittedData?.map((val, ind) => ({
//     SN: ind + 1,
//     photo: (
//       <img
//         src={
//           val.image?.url ||
//           "https://www.stcroixstoves.com/wp-content/uploads/2020/04/no.png"
//         }
//         alt="photo"
//         className="w-10 h-10 object-cover rounded-md" // Increased size slightly
//       />
//     ),
//     employeeID: (
//       <span className="text-green-800 font-semibold">
//         {val.employeeId}
//       </span>
//     ),
//     name: val.teacherName,
//     email: val.email,
//     class: val.classTeacher === "Not a class teacher" || !val.classTeacher ? "N/A" : val.classTeacher,
//     section: val.classTeacher === "Not a class teacher" || !val.classTeacher ? "N/A" : val.section,
//     // dateOfBirth: moment(val.dateOfBirth).format("DD-MMM-YYYY"),
//     contact: val.contact,
//     joiningDate: moment(val.joiningDate).format("DD-MMM-YYYY"),
//     // gender: val.gender,
//     // address: val.address,
//     // feeStatus: val.feeStatus, // This property does not seem to belong to teacher data
//     action: (
//       <div className="flex justify-center gap-5">
//           {/* Delete button can be added here if needed, using val.email for handleDelete */}
//           {/* <span className="cursor-pointer" onClick={() => handleDelete(val.email)}>
//             <FaTrash className="text-[20px] text-red-700" />
//           </span> */}
//           <span className="cursor-pointer">
//             <FaEdit className="text-[20px] text-yellow-700" onClick={()=>onEdit(val)} />
//           </span>
//       </div>
//     ),
//   }));

//   return (
//     <>
//      <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="All Teachers"/>
//         {
//       !isEdit?
//       (
//         <>
//         <div
//        className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2 mb-4" // Added margin-bottom
//   >
//              <Button
//                onClick={toggleModal}
//                name="Add New Teacher" // Changed name for clarity
//                // Add other Button props if needed: e.g. color, icon
//              />
//            </div>
//            {isOpen && (
//              <div
//                id="default-modal"
//                tabIndex="-1"
//                aria-hidden="true"
//                className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//              >
//                <div className="relative p-4 w-full max-w-3xl max-h-full" data-aos="fade-down"> {/* Increased max-width */}
//                  <div className="relative rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//                    <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
//                      <h3 className="text-xl font-semibold dark:text-white">
//                        Add New Teacher
//                      </h3>
//                      <button
//                        onClick={toggleModal}
//                        type="button"
//                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                      >
//                        <svg
//                          className="w-3 h-3"
//                          aria-hidden="true"
//                          xmlns="http://www.w3.org/2000/svg"
//                          fill="none"
//                          viewBox="0 0 14 14"
//                        >
//                          <path
//                            stroke="currentColor"
//                            strokeLinecap="round"
//                            strokeLinejoin="round"
//                            strokeWidth="2"
//                            d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                          />
//                        </svg>
//                        <span className="sr-only">Close modal</span>
//                      </button>
//                    </div>
//                    <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh] overflow-auto bg-gray-50">
//                      <div className="p-4 md:p-5">
//                         <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4"> {/* Grid for form fields */}
//                           {formFields.map((field) => {
//                             if (field.type === "select") {
//                               // Prepare options for ReactSelect: remove the first item (placeholder)
//                               const dynamicOptions = field.selectOptions.slice(1);
//                               return (
//                                 <ReactSelect
//                                   key={field.name}
//                                   label={field.label}
//                                   name={field.name}
//                                   value={formData[field.name]}
//                                   // Assuming ReactSelect's handleChange passes the selected value directly
//                                   handleChange={(value) => handleFieldChange(field.name, value)}
//                                   dynamicOptions={dynamicOptions}
//                                   required={field.required || false}
//                                   // You might need a placeholder prop in ReactSelect or handle it internally
//                                   // For now, the label acts as a placeholder if value is ""
//                                 />
//                               );
//                             } else if (field.type === "file") {
//                               return (
//                                 <ReactInput
//                                   key={field.name}
//                                   label={field.label}
//                                   name={field.name}
//                                   type={field.type}
//                                   onChange={handleImageChange} // Specific handler for file input
//                                   accept={field.accept}
//                                   required={field.required || false}
//                                   // File inputs don't use the 'value' prop for control in React
//                                 />
//                               );
//                             } else {
//                               return (
//                                 <ReactInput
//                                   key={field.name}
//                                   label={field.label}
//                                   name={field.name}
//                                   type={field.type}
//                                   value={formData[field.name]}
//                                   onChange={(e) => handleFieldChange(field.name, e.target.value)}
//                                   required={field.required || false}
//                                   maxLength={field.maxLength} // Pass maxLength if defined
//                                 />
//                               );
//                             }
//                           })}
//                         </div>
//                        <div className="flex items-center justify-end gap-3 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 mt-4">
//                          <Button 
//                             name="Submit" 
//                             onClick={handleSubmit} 
//                             // Add loading state to button if desired:
//                             // isLoading={loading} 
//                             // disabled={loading}
//                             />
//                          <Button 
//                             name="Cancel" 
//                             onClick={toggleModal} 
//                             variant="outlined" // Example: if your Button supports variants
//                             />
//                        </div>
//                      </div>
//                    </div>
//                  </div>
//                </div>
//              </div>
//            )}
//      <Table tBody={tBody} tHead={THEAD}/>
  
//          </>
//       ):(
//         <EditTeacher teacherDetails={teacherDetails} handleCancel={handleCancel} setIsEdit={ setIsEdit } getTeachers={getTeachers} />
//       )
//     }
//     </>
//   );
// }

// export default CreateTeacher;



// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { toast } from "react-toastify";
// import "../../Dynamic/Form/FormStyle.css";
// import InputForm from "../../Dynamic/Form/InputForm";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { FaEdit } from "react-icons/fa";
// import Heading from "../../Dynamic/Heading";
// import { AdminGetAllClasses, getAllTeachers } from "../../Network/AdminApi";
// import EditTeacher from "./EditTeacher";
// import Table from "../../Dynamic/Table";
// import moment from "moment";
// import Button from "../../Dynamic/utils/Button";
// import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../../Dynamic/BreadcrumbList";
// const authToken = localStorage.getItem("token");

// const toastifyTiming = {
//   autoClose: 1000,
// };

// const initialState = {
//   teacherName: "",
//   employeeId: "",
//   email: "",
//   password: "",
//   dateOfBirth: "",
//   qualification: "",
//   salary: "",
//   subject: "",
//   gender: "",
//   joiningDate: "",
//   address: "",
//   contact: "",
//   experience: "",
//   section: "",
//   classTeacher: "",
//   image: null,
// };

// function CreateTeacher() {
//   const { currentColor,setIsLoader } = useStateContext();

//   const [isEdit, setIsEdit] = useState(false);
//   const [teacherDetails, setTeacherDetails] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState(initialState);
//   const [submittedData, setSubmittedData] = useState([]);
//   const [isOpen, setIsOpen] = useState(false);
//   const [getClass, setGetClass] = useState([]);
//   const toggleModal = () => {
//     setIsOpen(!isOpen);
//   };

//     const GetAllClasses=async()=>{
//       setIsLoader(true)
//       try {
//         const response= await AdminGetAllClasses();
//         console.log("response class",response)
//         if(response?.success){
//           // console.log("first")
//           // setSubmittedData(response?.data);
//           // let classes = response.classes;
//           // setGetClass(classes.sort((a, b) => a - b));
//           let classes=response?.classes.map((cls)=>cls.className)
      
//           setGetClass(classes.sort((a,b)=>a-b));
//         }
//         else{
//           toast.error(response?.message)
        
//         }
//       } catch (error) {
//         console.log("error",error)
//       }
//       finally{
//         setIsLoader(false)
//       }
//     }
//     const getTeachers=async()=>{
//       setIsLoader(true)
//       try {
//         const response= await getAllTeachers()
//         if(response?.success){
//           setSubmittedData(response?.data);
          
//         }
//         else{
//           toast.error(response?.message)
        
//         }
//       } catch (error) {
//         console.log("error",error)
//       }
//       finally{
//         setIsLoader(false)
//       }
//     }
//   useEffect(() => {
//     getTeachers()
//     GetAllClasses()
//   }, [isEdit]);

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
//     const formDataToSend = new FormData();
//     Object.entries(formData).forEach(([key, value]) => {
//       if (key !== "image") {
//         formDataToSend.append(key, String(value));
//       }
//     });
//     formDataToSend.append("image", formData.image);

//     try {
//       setLoading(true);
//       const response = await axios.post(
//         "https://dvsserver.onrender.com/api/v1/adminRoute/teacher",
//         formDataToSend,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "multipart/form-data",
//           },
//         }
//       );
//       setFormData(initialState);
//       setLoading(false);
//       getTeachers()
//       toast.success("Form submitted successfully!");

//       setIsOpen(false);
      
//     } catch (error) {
//       console.error("Error:", error);
//       setLoading(false);

//       if (error.response && error.response.status === 400) {
//         toast.error("Email already exists.", toastifyTiming);
//         return;
//       }
//       toast.error(
//         "An error occurred while submitting the form.",
//         toastifyTiming
//       );
//     }
//   };


//   const handleDelete = (email) => {
//     axios
//       .put(
//         `https://dvsserver.onrender.com/api/v1/adminRoute/deactivateTeacher`,
//         { email },
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then(() => {
//         const updatedData = submittedData.filter(
//           (item) => item.email !== email
//         );
//         setSubmittedData(updatedData);
//         toast.success("Teacher data deleted successfully");
//       })
//       .catch((error) => {
//         console.error("Error deleting teacher data:", error);
//         toast.error("An error occurred while deleting the teacher data.");
//       });
//   };

//   const formFields = [
//     {
//       label: "Full Name",
//       name: "teacherName",
//       type: "text",
//       value: formData.teacherName,
   
//     },
//     {
//       label: "Employee ID",
//       name: "employeeId",
//       type: "text",
//       value: formData.employeeId,
   
//     },
//     {
//       label: "Email",
//       name: "email",
//       type: "email",
//       value: formData.email,
   
//     },
//     {
//       label: "Password",
//       name: "password",
//       type: "password",
//       value: formData.password,
   
//     },
//     {
//       label: "Date of Birth",
//       name: "dateOfBirth",
//       type: "date",
//       value: formData.dateOfBirth,
   
//     },
//     {
//       label: "Qualification",
//       name: "qualification",
//       type: "text",
//       value: formData.qualification,
   
//     },
//     {
//       label: "Salary",
//       name: "salary",
//       type: "number",
//       value: formData.salary,
   
//     },
//     {
//       label: "Subject",
//       name: "subject",
//       type: "text",
//       value: formData.subject,
   
//     },
//     {
//       label: "Joining Date",
//       name: "joiningDate",
//       type: "date",
//       value: formData.joiningDate,
   
//     },
//     {
//       label: "Address",
//       name: "address",
//       type: "text",
//       value: formData.address,
   
//     },
//     {
//       label: "Contact",
//       name: "contact",
//       type: "tel",
//       value: formData.contact,
   
//     },
//     {
//       label: "Experience",
//       name: "experience",
//       type: "select",
//       value: formData.experience,
   
//       selectOptions: [
//         "Experience",
//         "0",
//         "1",
//         "2",
//         "3",
//         "4",
//         "5",
//         "6",
//         "7",
//         "8",
//         "9",
//         "10",
//       ],
//     },
//     {
//       label: "Gender",
//       name: "gender",
//       type: "select",
//       value: formData.gender,
   
//       selectOptions: ["Gender", "Male", "Female", "Other"],
//     },
//     {
//       label: "Class Teacher",
//       name: "classTeacher",
//       type: "select",
//       value: formData.classTeacher,
//       required: true,

//       selectOptions: [
//         "Class",
//         ...getClass 
//       ],
//     },
 
//     {
//       label: "Section",
//       name: "section",
//       type: "select",
//       value: formData.section,
   
//       selectOptions: ["Section", "A", "B", "C", "D", "E"],
//     },
   
//     {
//       label: "Profile Pic",
//       name: "image",
//       type: "file",
//       accept: "image/*",
   
//     },
//   ];
//  const onEdit=(val)=>{
//   setIsEdit(true)
//   setTeacherDetails(val)
//  }
// const handleCancel=()=>{
//   setIsEdit(false)
// }


// const THEAD = [
//   { id: "SN", label: "S No.",width:"5"},
//   { id: "photo", label: "Photo",width:"7"},
//   { id: "employeeID", label: "Employee ID" },
//   { id: "name", label: "Name" },
//   { id: "email", label: "Email" },
//   { id: "class", label: "Class" },
//   { id: "section", label: "Section" },
//   { id: "dateOfBirth", label: "DOB" },
//   { id: "contact", label: "Contact" },
//   { id: "joiningDate", label: "Joining Date" },
//   { id: "gender", label: "Gender" },
//   { id: "address", label: "Address" },
//   { id: "action", label: "Action" },
// ];
//  const tBody = submittedData?.map((val, ind) => ({
//     SN: ind + 1,
//     photo: (
//       <img
//         src={
//           val.image?.url ||
//           "https://www.stcroixstoves.com/wp-content/uploads/2020/04/no.png"
//         }
//         alt="photo"
//         className="w-5 h-5 object-cover rounded-md"
//       />
//     ),
//     employeeID: (
//       <span className="text-green-800 font-semibold">
//         {val.employeeId}
//       </span>
//     ),
    
//     name: val.teacherName,
//     email: val.email,
//     class: val.classTeacher,
//     section: val.section,
//     dateOfBirth: moment(val.dateOfBirth).format("DD-MMM-YYYY"),
//     contact: val.contact,
//     joiningDate: moment(val.joiningDate).format("DD-MMM-YYYY"),
//     gender: val.gender,
//     address: val.address,
//     feeStatus: val.feeStatus,
//     action: (
//       <div className="flex justify-center gap-5">
//           <span className="cursor-pointer">
//           </span>
        
//           <span className="cursor-pointer">
//             <FaEdit className="text-[20px] text-yellow-700" onClick={()=>onEdit(val)} />
//           </span>
       
//       </div>
//     ),
//   }));
//   return (
//     <>
//      <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="All Teacher"/>
//         {
//       !isEdit?
//       (
//         <>
//         <div
//        className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2"
//   >
//              <Button
             
//                onClick={toggleModal}
//                name="Add Teacher"
//              >
              
//              </Button>
//            </div>
//            {isOpen && (
//              <div
//                id="default-modal"
//                tabIndex="-1"
//                aria-hidden="true"
//                className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
//              >
//                <div className="relative p-4 w-full  max-h-full" data-aos="fade-down">
//                  <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
//                    <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
//                      <h3 className="text-xl font-semibold  dark:text-white">
//                        Add Teacher
//                      </h3>
//                      <button
//                        onClick={toggleModal}
//                        type="button"
//                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
//                      >
//                        <svg
//                          className="w-3 h-3"
//                          aria-hidden="true"
//                          xmlns="http://www.w3.org/2000/svg"
//                          fill="none"
//                          viewBox="0 0 14 14"
//                        >
//                          <path
//                            stroke="currentColor"
//                            strokeLinecap="round"
//                            strokeLinejoin="round"
//                            strokeWidth="2"
//                            d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
//                          />
//                        </svg>
//                        <span className="sr-only">Close modal</span>
//                      </button>
//                    </div>
//                    <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50">
//                      <div className="p-4 md:p-5 space-y-4  ">
//                        <InputForm
//                          fields={formFields}
//                          handleChange={handleFieldChange}
//                          handleImageChange={handleImageChange}
//                        />
     
//                        <div className="md:col-span-6 text-right mt-3 ">
//                          <div className="flex items-center gap-5 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
//                          <Button name="Submit" onClick={handleSubmit} />
//                          <Button name="Cancel" onClick={toggleModal} />
                           
//                          </div>
//                        </div>
//                      </div>
//                    </div>
//                  </div>
//                </div>
//              </div>
//            )}
//      <Table tBody={tBody} tHead={THEAD}/>
  
//          </>
//       ):(
//         <EditTeacher teacherDetails={teacherDetails} handleCancel={handleCancel} setIsEdit={ setIsEdit }/>
//       )
//     }
//     </>
    
   
//   );
// }

// export default CreateTeacher;
