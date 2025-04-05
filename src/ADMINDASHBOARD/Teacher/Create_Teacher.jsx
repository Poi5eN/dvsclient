import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../../Dynamic/Form/FormStyle.css";
import InputForm from "../../Dynamic/Form/InputForm";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaEdit } from "react-icons/fa";
import Heading from "../../Dynamic/Heading";
import { AdminGetAllClasses, getAllTeachers } from "../../Network/AdminApi";
import EditTeacher from "./EditTeacher";
import Table from "../../Dynamic/Table";
import moment from "moment";
import Button from "../../Dynamic/utils/Button";
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
  const { currentColor,setIsLoader } = useStateContext();

  const [isEdit, setIsEdit] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(initialState);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [getClass, setGetClass] = useState([]);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };

    const GetAllClasses=async()=>{
      setIsLoader(true)
      try {
        const response= await AdminGetAllClasses();
        console.log("response class",response)
        if(response?.success){
          // console.log("first")
          // setSubmittedData(response?.data);
          // let classes = response.classes;
          // setGetClass(classes.sort((a, b) => a - b));
          let classes=response?.classes.map((cls)=>cls.className)
      
          setGetClass(classes.sort((a,b)=>a-b));
        }
        else{
          toast.error(response?.message)
        
        }
      } catch (error) {
        console.log("error",error)
      }
      finally{
        setIsLoader(false)
      }
    }
    const getTeachers=async()=>{
      setIsLoader(true)
      try {
        const response= await getAllTeachers()
        if(response?.success){
          setSubmittedData(response?.data);
          
        }
        else{
          toast.error(response?.message)
        
        }
      } catch (error) {
        console.log("error",error)
      }
      finally{
        setIsLoader(false)
      }
    }
  useEffect(() => {
    getTeachers()
    GetAllClasses()
  }, [isEdit]);

  const handleFieldChange = (fieldName, value) => {
    setFormData({
      ...formData,
      [fieldName]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "image") {
        formDataToSend.append(key, String(value));
      }
    });
    formDataToSend.append("image", formData.image);

    try {
      setLoading(true);
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
      setLoading(false);
      getTeachers()
      toast.success("Form submitted successfully!");

      setIsOpen(false);
      
    } catch (error) {
      console.error("Error:", error);
      setLoading(false);

      if (error.response && error.response.status === 400) {
        toast.error("Email already exists.", toastifyTiming);
        return;
      }
      toast.error(
        "An error occurred while submitting the form.",
        toastifyTiming
      );
    }
  };


  const handleDelete = (email) => {
    axios
      .put(
        `https://dvsserver.onrender.com/api/v1/adminRoute/deactivateTeacher`,
        { email },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then(() => {
        const updatedData = submittedData.filter(
          (item) => item.email !== email
        );
        setSubmittedData(updatedData);
        toast.success("Teacher data deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting teacher data:", error);
        toast.error("An error occurred while deleting the teacher data.");
      });
  };

  const formFields = [
    {
      label: "Full Name",
      name: "teacherName",
      type: "text",
      value: formData.teacherName,
   
    },
    {
      label: "Employee ID",
      name: "employeeId",
      type: "text",
      value: formData.employeeId,
   
    },
    {
      label: "Email",
      name: "email",
      type: "email",
      value: formData.email,
   
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      value: formData.password,
   
    },
    {
      label: "Date of Birth",
      name: "dateOfBirth",
      type: "date",
      value: formData.dateOfBirth,
   
    },
    {
      label: "Qualification",
      name: "qualification",
      type: "text",
      value: formData.qualification,
   
    },
    {
      label: "Salary",
      name: "salary",
      type: "number",
      value: formData.salary,
   
    },
    {
      label: "Subject",
      name: "subject",
      type: "text",
      value: formData.subject,
   
    },
    {
      label: "Joining Date",
      name: "joiningDate",
      type: "date",
      value: formData.joiningDate,
   
    },
    {
      label: "Address",
      name: "address",
      type: "text",
      value: formData.address,
   
    },
    {
      label: "Contact",
      name: "contact",
      type: "tel",
      value: formData.contact,
   
    },
    {
      label: "Experience",
      name: "experience",
      type: "select",
      value: formData.experience,
   
      selectOptions: [
        "Experience",
        "0",
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
      ],
    },
    {
      label: "Gender",
      name: "gender",
      type: "select",
      value: formData.gender,
   
      selectOptions: ["Gender", "Male", "Female", "Other"],
    },
    {
      label: "Class Teacher",
      name: "classTeacher",
      type: "select",
      value: formData.classTeacher,
      required: true,

      selectOptions: [
        "Class",
        ...getClass 
      ],
    },
 
    {
      label: "Section",
      name: "section",
      type: "select",
      value: formData.section,
   
      selectOptions: ["Section", "A", "B", "C", "D", "E"],
    },
   
    {
      label: "Profile Pic",
      name: "image",
      type: "file",
      accept: "image/*",
   
    },
  ];
 const onEdit=(val)=>{
  setIsEdit(true)
  setTeacherDetails(val)
 }
const handleCancel=()=>{
  setIsEdit(false)
}


const THEAD = [
  { id: "SN", label: "S No.",width:"5"},
  { id: "photo", label: "Photo",width:"7"},
  { id: "employeeID", label: "Employee ID" },
  { id: "name", label: "Name" },
  { id: "email", label: "Email" },
  { id: "class", label: "Class" },
  { id: "section", label: "Section" },
  { id: "dateOfBirth", label: "DOB" },
  { id: "contact", label: "Contact" },
  { id: "joiningDate", label: "Joining Date" },
  { id: "gender", label: "Gender" },
  { id: "address", label: "Address" },
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
        className="w-5 h-5 object-cover rounded-md"
      />
    ),
    employeeID: (
      <span className="text-green-800 font-semibold">
        {val.employeeId}
      </span>
    ),
    
    name: val.teacherName,
    email: val.email,
    class: val.classTeacher,
    section: val.section,
    dateOfBirth: moment(val.dateOfBirth).format("DD-MMM-YYYY"),
    contact: val.contact,
    joiningDate: moment(val.joiningDate).format("DD-MMM-YYYY"),
    gender: val.gender,
    address: val.address,
    feeStatus: val.feeStatus,
    action: (
      <div className="flex justify-center gap-5">
          <span className="cursor-pointer">
          </span>
        
          <span className="cursor-pointer">
            <FaEdit className="text-[20px] text-yellow-700" onClick={()=>onEdit(val)} />
          </span>
       
      </div>
    ),
  }));
  return (
    <>
    {
      !isEdit?
      (
        <>
        {/* <Heading Name="All Teacher" /> */}
           {/* <div className="mb-4"> */}
             <Button
              //  variant="contained"
              //  style={{ backgroundColor: currentColor }}
               onClick={toggleModal}
               name="Add Teacher"
             >
              
             </Button>
           {/* </div> */}
           {isOpen && (
             <div
               id="default-modal"
               tabIndex="-1"
               aria-hidden="true"
               className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
             >
               <div className="relative p-4 w-full  max-h-full" data-aos="fade-down">
                 <div className="relative  rounded-lg shadow dark:bg-gray-700 overflow-auto ">
                   <div className="flex items-center justify-between p-2 md:p-2 border-b rounded-t dark:border-gray-600 bg-white">
                     <h3 className="text-xl font-semibold  dark:text-white">
                       Add Teacher
                     </h3>
                     <button
                       onClick={toggleModal}
                       type="button"
                       className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                     >
                       <svg
                         className="w-3 h-3"
                         aria-hidden="true"
                         xmlns="http://www.w3.org/2000/svg"
                         fill="none"
                         viewBox="0 0 14 14"
                       >
                         <path
                           stroke="currentColor"
                           strokeLinecap="round"
                           strokeLinejoin="round"
                           strokeWidth="2"
                           d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                         />
                       </svg>
                       <span className="sr-only">Close modal</span>
                     </button>
                   </div>
                   <div className="h-[80vh] sm:h-[70vh] md:h-[70vh] lg:h-[70vh]  overflow-auto  bg-gray-50">
                     <div className="p-4 md:p-5 space-y-4  ">
                       <InputForm
                         fields={formFields}
                         handleChange={handleFieldChange}
                         handleImageChange={handleImageChange}
                       />
     
                       <div className="md:col-span-6 text-right mt-3 ">
                         <div className="flex items-center gap-5 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                           <Button
                             type="submit"
                             variant="contained"
                             onClick={handleSubmit}
                             style={{
                               backgroundColor: currentColor,
                               color: "white",
                               width: "100%",
                             }}
                           >
                             {loading ? (
                               <svg
                                 aria-hidden="true"
                                 className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                 viewBox="0 0 100 101"
                                 fill="none"
                                 xmlns="http://www.w3.org/2000/svg"
                               >
                                 <path
                                   d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                   fill="currentColor"
                                 />
                                 <path
                                   d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                   fill="currentFill"
                                 />
                               </svg>
                             ) : (
                               " Submit"
                             )}
                           </Button>
                           <Button
                             variant="contained"
                             onClick={toggleModal}
                             style={{
                               backgroundColor: "#616161",
                               color: "white",
                               width: "100%",
                             }}
                           >
                             Cancel
                           </Button>
                         </div>
                       </div>
                     </div>
                   </div>
                 </div>
               </div>
             </div>
           )}
     <Table tBody={tBody} tHead={THEAD}/>
  
         </>
      ):(
        <EditTeacher teacherDetails={teacherDetails} handleCancel={handleCancel} setIsEdit={ setIsEdit }/>
      )
    }
    </>
    
   
  );
}

export default CreateTeacher;
