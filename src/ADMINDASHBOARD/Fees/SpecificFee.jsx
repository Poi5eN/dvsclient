import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider.js";
import Table from "../../Dynamic/Table.jsx";
import {  FaEye } from "react-icons/fa"; // Changed MdVisibility to FaEye for consistency
import { toast } from "react-toastify";
import Modal from "../../Dynamic/Modal";
import { ActiveStudents, AdminGetAllClasses, createStudentSpecificFee } from "../../Network/AdminApi.js";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import Button from "../../Dynamic/utils/Button.jsx";

function SpecificFee() {
  const { currentColor, setIsLoader } = useStateContext();
  const [getClass, setGetClass] = useState([]);
   
     const [allStudents, setAllStudents] = useState([]); 
     const [modalOpen, setModalOpen] = useState(false);
     const [selectedClass, setSelectedClass] = useState("");
     const [formData, setFormData] = useState({ className: "", feeType: "", amount: "",studentId:"" });
    const allStudent = async () => {
        setIsLoader(true)
        try {
            const response = await ActiveStudents();
            if (response?.success) {
                setIsLoader(false)
                const students = response?.students?.data?.reverse() || [];
                setAllStudents(students); 
            } else {
                toast.error(response?.message)
            }
        } catch (error) {
            console.log("error", error);

        }
        finally {
            setIsLoader(false)
        }
    };
      useEffect(() => {
        allStudent();
    }, []);
    const closeModal = () => {
      setModalOpen(false);
      setFormData({ className: "", feeType: "", amount: "" ,studentId:""});
    };
    const dynamicOptions = getClass.map((cls) => ({
      label: cls.className,
      value: cls.className,
    }));
    const GetAllClasses = async () => {
      try {
        const response = await AdminGetAllClasses();
        if (response?.success) {
          let classes = response.classes;
          setGetClass(classes.sort((a, b) => a - b));
  
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    useEffect(() => {
      GetAllClasses()
    }, [])

    const handleClassChange = (e) => {
      const selectedClassName = e.target.value;
      setSelectedClass(selectedClassName);
      setFormData((prev) => ({
        ...prev,
        className: selectedClassName,  // className update ho raha hai
      }));
    };
    const handleViewClick = (student) => {
      console.log("student",student)
      setModalOpen(true);
        setFormData(
          (preV)=>({
...preV,
 className: student?.class, 
 feeType: "", 
 studentName: student?.studentName, 
 amount: "" ,
 studentId:student?.studentId
          })
        );
             // Ensure edit mode is off
    };
    const handleFieldChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
      const payload={
        "studentId": formData?.studentId,
        "feeType": formData?.feeType,
        "amount": Number(formData?.amount),
        "className": formData?.className
      }
      console.log("payload",payload)
        setIsLoader(true);
        try {
          const response = await createStudentSpecificFee(payload);
          if (response?.success) {
            toast.success("Fees set successfully !");
            
            closeModal();
            setModalOpen(false);
          } else {
            toast.error(response?.message);
          }
        } catch (error) {
          console.error("Error:", error);
        } finally {
          setIsLoader(false);
        }
      };
    const THEAD = [
        { id: "SN", label: "S No.", width: "5" },
        { id: "admissionNo", label: "Admission No" },
        { id: "name", label: "Name" },
        { id: "fatherName", label: "Father Name" },
        { id: "class", label: "Class" },
        { id: "section", label: "Section" },  
        { id: "contact", label: "Contact" },
        { id: "action", label: "Action" },
    ];

    const tBody = allStudents?.map((student, ind) => ({
        SN: ind + 1,
        admissionNo: (
            <span className="text-indigo-700 font-semibold">
                {student.admissionNumber || 'N/A'}
            </span>
        ),
        name: student.studentName || 'N/A',
        fatherName: student.fatherName || 'N/A',
        class: student.class || 'N/A',
        section: student.section || 'N/A',
        contact: student.contact || 'N/A',
        gender: student.gender || 'N/A',
        action: (
            <div className="flex justify-center items-center gap-3">
                <Button  name="Set Fee" onClick={() => handleViewClick(student)} 
                // className="text-blue-600 hover:text-blue-800 text-lg"
                >
               
                </Button>
               
            </div>
        ),
    }));
   
        return (
            <div className="">
{/* Set Specific Fee     */}
        <Table tHead={THEAD} tBody={tBody} isSearch={true} />
        
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={ "Specific Student Fee"}>
        <div className="p-4 space-y-4 bg-gray-50">
          <div className="grid gap-6 mb-6 md:grid-cols-1">
            <div>
           
          <span> Name : 
             {formData?.studentName}
          </span>
          <br />
          <span> clas : 
            {formData?.className}
          </span>
             
            </div>
            <div>
                <ReactSelect
                name="feeType"
                value={formData.feeType}
                handleChange={handleFieldChange}
                label="Fee Type"
                dynamicOptions={[
                  { label: "Monthly", value: "Monthly" },
                  // { label: "Quarterly", value: "Quarterly" },
                  // { label: "Half Yearly", value: "Half Yearly" },
                  // { label: "Annually", value: "Annually" },
                ]}
              />


            </div>
          </div>

          <div>
            <ReactInput
              type="number"
              name="amount"
              required={false}
              label="Amount"
              onChange={handleFieldChange}
              value={formData.amount}
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button name="Submit" onClick={handleSubmit} style={{ backgroundColor: currentColor, color: "white" }}>
              { }
            </Button>
            <Button name="Cancel" color="gray" onClick={closeModal} style={{ backgroundColor: "#616161", color: "white" }}>
              
            </Button>
          </div>
        </div>
      </Modal>
        </div>

        )
}

export default SpecificFee;




// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { Button } from "@mui/material";
// import Modal from "../../Dynamic/Modal";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { AdminGetAllClasses, createStudentSpecificFee } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";

// function SpecificFee() {

//   const { currentColor, setIsLoader } = useStateContext();
//   const [formData, setFormData] = useState({ className: "", feeType: "", amount: "",studentId:"" });
//   const [getClass, setGetClass] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [modalOpen, setModalOpen] = useState(false);
 

//   const GetAllClasses = async () => {
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success) {
//         let classes = response.classes;
//         setGetClass(classes.sort((a, b) => a - b));

//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   };
//   useEffect(() => {
//     GetAllClasses()
//   }, [])

//   const handleFieldChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   console.log("Payload before submission:", formData); 
//   const handleSubmit = async () => {
//   const payload={
//     "studentId": formData?.studentId,
//     "feeType": formData?.feeType,
//     "amount": Number(formData?.amount),
//     "className": formData?.className
//   }
//     setIsLoader(true);
//     try {
//       const response = await createStudentSpecificFee(payload);
//       if (response?.success) {
//         toast.success("Fees set successfully !");
        
//         closeModal();
//         setModalOpen(false);
//       } else {
//         toast.error(response?.message);
//       }
//     } catch (error) {
//       console.error("Error:", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };
  
//   const closeModal = () => {
//     setModalOpen(false);
//     setFormData({ className: "", feeType: "", amount: "" ,studentId:""});
//   };

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     setFormData((prev) => ({
//       ...prev,
//       className: selectedClassName,  // className update ho raha hai
//     }));
//   };
  

//   const dynamicOptions = getClass.map((cls) => ({
//     label: cls.className,
//     value: cls.className,
//   }));


//   return (
//     <div className=" mx-auto ">
//       <h1 className="text-xl font-bold  uppercase text-center" style={{ color: currentColor }}>
//         Create Class Fee
//       </h1>
//       <div className="mb-1">
//         <Button
//           variant="contained"
//           style={{ backgroundColor: currentColor }}
//           onClick={() => {
            
//             setFormData({ className: "", feeType: "", amount: "",studentId:"" });
//             setModalOpen(true);
//           }}
//         >
//           Create Fee
//         </Button>
//       </div>

//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={ "Specific Student Fee"}>
//         <div className="p-4 space-y-4 bg-gray-50">
//           <div className="grid gap-6 mb-6 md:grid-cols-2">
//             <div>
//             <div>
//             <ReactInput
//               type="text"
//               name="studentId"
//               required={false}
//               label="Student ID"
//               onChange={handleFieldChange}
//               value={formData.studentId}
//             />
//           </div>
//               <ReactSelect
//                 name="studentClass"
//                 value={selectedClass}
//                 handleChange={handleClassChange}
//                 label="Select a Class"
//                 dynamicOptions={dynamicOptions}
//               />

//             </div>
//             <div>
//                 <ReactSelect
//                 name="feeType"
//                 value={formData.feeType}
//                 handleChange={handleFieldChange}
//                 label="Fee Type"
//                 dynamicOptions={[
//                   { label: "Monthly", value: "Monthly" },
//                   { label: "Quarterly", value: "Quarterly" },
//                   { label: "Half Yearly", value: "Half Yearly" },
//                   { label: "Annually", value: "Annually" },
//                 ]}
//               />


//             </div>
//           </div>

//           <div>
//             <ReactInput
//               type="number"
//               name="amount"
//               required={false}
//               label="Amount"
//               onChange={handleFieldChange}
//               value={formData.amount}
//             />
//           </div>

//           <div className="flex justify-end gap-3">
//             <Button variant="contained" onClick={handleSubmit} style={{ backgroundColor: currentColor, color: "white" }}>
//               { "Submit"}
//             </Button>
//             <Button variant="contained" onClick={closeModal} style={{ backgroundColor: "#616161", color: "white" }}>
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// }

// export default SpecificFee;