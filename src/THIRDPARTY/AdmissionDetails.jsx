import React, { useState, useCallback, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import Modal from "../Dynamic/Modal";
import { useStateContext } from "../contexts/ContextProvider";
import DynamicFormFileds from "../Dynamic/Form/Admission/DynamicFormFields";
import {
  getSudent,
  thirdpartyadmissions,
  thirdpartyclasses,
  thirdpartymyadmissionStudent,
} from "../Network/ThirdPartyApi";

function AdmissionDetails() {
  const SchoolID = localStorage.getItem("SchoolID");
  const [reRender, setReRender] = useState(false);
  const { currentColor ,setIsLoader} = useStateContext();
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const handleEditClick = useCallback((studentData) => {
    setStudent(studentData);
    setModalOpen(true);
  }, []);

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    setSelectedSection(""); // Reset section when class changes

    if (selectedClassName === "all") {
      setAvailableSections([]); // No sections when "All Classes" is selected
    } else {
      const selectedClassObj = getClass?.find(
        (cls) => cls.className === selectedClassName
      );

      if (selectedClassObj) {
        setAvailableSections(selectedClassObj.sections.split(", "));
      } else {
        setAvailableSections([]);
      }
    }
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };
 
  const Getclasses = async () => {
    setIsLoader(true)
    try {
      const response = await thirdpartyclasses(SchoolID);
      if (response.success) {
        let classes = response.classList;
        setIsLoader(false)
        setGetClass([{ className: "all", sections: "" }, ...classes.sort((a, b) => a - b)]); // Add "All Classes" option
      } else {
        console.log("error", response?.message);
      }
    } catch (error) {
      console.log("error", error);
      setIsLoader(false)
    }
  };

  const getStudent = async () => {
    setIsLoader(true)
    try {
      const response = await getSudent(SchoolID);
console.log("response student",response)
      if (response.success) {
      
        setAllStudents(response?.data);
        setFilteredStudents(response?.data);
        setIsLoader(false)
      }
    } catch (error) {
      setIsLoader(false)
      console.log("error", error);
    }
  };
  

  // useEffect(() => {
  //   setReRender(false)
  //   getStudent();
    
  // }, [reRender]);

  useEffect(() => {
    getStudent();
    Getclasses();
  }, []);

  useEffect(() => {
    let filtered = [...allStudents];

    if (selectedClass && selectedClass !== "all") {
      filtered = filtered.filter((student) => student.class === selectedClass);
    }

    if (selectedSection) {
      filtered = filtered.filter(
        (student) => student.section === selectedSection
      );
    }

    setFilteredStudents(filtered);
  }, [selectedClass, selectedSection, allStudents]);


  return (
    <>
      <div
        className="bg-gray-800 p-2 fixed top-0 w-full"
        style={{ background: "#f0592e" }}
      >
        <div className="flex justify-around max-w-md mx-auto">
          <input type="text" />
          <div className="flex flex-col space-y-1 mt-[2px]">
            <select
              name="studentClass"
              className=" w-full border-1 bg-gray-800 border-white text-white outline-none py-[3px] bg-inherit"
              onFocus={(e) => (e.target.style.borderColor = currentColor)}
              onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              value={selectedClass}
              onChange={handleClassChange}
              required
            >
              <option value="" disabled>
                Class
              </option>
              {getClass?.map((cls, index) => (
                <option
                  key={index}
                  value={cls.className}
                  className="text-white bg-gray-800"
                >
                  {cls?.className === 'all' ? "All Classes" : cls?.className}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col space-y-1 mt-[2px]">
            <select
              name="studentSection"
              className=" w-full border-1 border-white text-white outline-none py-[3px] bg-inherit"
              onFocus={(e) => (e.target.style.borderColor = currentColor)}
              onBlur={(e) => (e.target.style.borderColor = "#ccc")}
              value={selectedSection}
              onChange={handleSectionChange}
              required
              disabled={!selectedClass || selectedClass === "all"} // Disable if no class is selected or "All Classes" is selected
            >
              <option value="" disabled>
                Section
              </option>
              {availableSections?.map((item, index) => (
                <option key={index} value={item}
                
                 className="text-white bg-gray-800"
                >
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4 grid md:grid-cols-3 gap-2 mt-10">
        {filteredStudents.map((val, index) => (
          <div
            key={index}
            className="bg-white shadow-md rounded-lg p-4  mb-2 flex items-center justify-between"
          >
            <div>
              <div className="mb-1">
                <p className="text-gray-700 font-semibold text-sm">
                  Name: {val?.studentName}
                </p>
                <p className="text-gray-700 text-[12px]">Class: {val.class}</p>
                <p className="text-gray-700 text-[12px]">
                  Roll No: {val.rollNo}
                </p>
                <p className="text-gray-700 text-[12px]">
                  Adm No:{" "}
                  <span className="text-[#ee582c] font-bold">
                    {val.admissionNumber}
                  </span>
                </p>
                <p className="text-gray-700 text-[12px]">
                  Father Name: {val.fatherName || "N/A"}
                </p>
                <p className="text-gray-700 text-[12px]">
                  Mobile No: {val.contact}
                </p>
                <p className="text-gray-700 text-[12px]">
                  Address: {val.address}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="mr-4">
                <img
                  src={val.photo}
                  alt="val"
                  className="rounded-sm w-24 h-24 object-cover"
                />
              </div>
            </div>
            <button
              className="text-blue-500 hover:text-blue-700 focus:outline-none"
              onClick={() => handleEditClick(val)}
            >
              <FaEdit size={20} />
            </button>
          </div>
        ))}

        <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Edit`}>
          <DynamicFormFileds studentData={student} buttonLabel={"Update"}  setIsOpen={setModalOpen} setReRender={setReRender}/>
        </Modal>
      </div>
    </>
  );
}

export default AdmissionDetails;

// import React, { useState, useCallback, useEffect } from "react";
// import { FaEdit } from "react-icons/fa"; // Import edit icon
// import Modal from "../Dynamic/Modal";
// import axios from "axios";
// import { useStateContext } from "../contexts/ContextProvider";
// import Cookies from "js-cookie";
// import DynamicFormFileds from "../Dynamic/Form/Admission/DynamicFormFields";
// import { ThirdpartyGetAllStudent, thirdpartymyadmissionStudent } from "../Network/ThirdPartyApi";
// function AdmissionDetails() {
//   const SchoolID=localStorage.getItem("SchoolID")
//   const authToken = Cookies.get("token");
//   const [loading, setReRender] = useState(false);
//   const { currentColor } = useStateContext();
//   const [getClass, setGetClass] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);
//   const [student, setStudent] = useState([]);
//   const [values, setValues] = useState([]);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [editingIndex, setEditingIndex] = useState(null);

//   const handleEditClick = useCallback((index) => {
//     setEditingIndex(index);
//     // setValues(index);
//     setStudent(index)
//     setModalOpen(true);
//   }, []);
//   useEffect(() => {
//     if (editingIndex !== null) {
//     }
//   }, [editingIndex]);

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     const selectedClassObj = getClass?.find(
//       (cls) => cls.className === selectedClassName
//     );

//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections.split(", "));
//     } else {
//       setAvailableSections([]);
//     }
//   };

//   useEffect(() => {
//     axios
//       .get(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses`,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         let classes = response.data.classList;

//         setGetClass(classes.sort((a, b) => a - b));
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//       });
//   }, []);

//   const getStudent = async () => {
//     try {
//       const response = await thirdpartymyadmissionStudent(SchoolID);
//       console.log("response thirdpartymyadmissionStudent", response);
//       if (response.success) {
//         setValues(response?.data);
//       }
   
//       // const student = response.data.student
//     } catch (error) {
//       console.log("error", error);
//     }
//   };
//   useEffect(() => {
//     getStudent();
//   }, []);

//   return (
//     <>
//       <div
//         className="bg-gray-800 p-2 fixed top-0 w-full"
//         style={{ background: "#f0592e" }}
//       >
//         <div className="flex justify-around max-w-md mx-auto">
//           <input type="text" />
//           <div className="flex flex-col space-y-1 mt-[2px]">
//             <select
//               name="studentClass"
//               className=" w-full border-1 border-white text-white outline-none py-[3px] bg-inherit"
//               onFocus={(e) => (e.target.style.borderColor = currentColor)}
//               onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//               value={selectedClass}
//               onChange={handleClassChange}
//               required
//             >
//               <option value="" disabled>
//                 Class
//               </option>
//               {getClass?.map((cls, index) => (
//                 <option key={index} value={cls.className}>
//                   {cls?.className}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-col space-y-1 mt-[2px]">
//             <select
//               name="studentSection"
//               className=" w-full border-1 border-white text-white outline-none py-[3px] bg-inherit"
//               onFocus={(e) => (e.target.style.borderColor = currentColor)}
//               onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//               value={selectedClass}
//               onChange={handleClassChange}
//               required
//             >
//               <option value="" disabled>
//                 Section
//               </option>
//               {availableSections?.map((item, index) => (
//                 <option key={index} value={item}>
//                   {item}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>
//       <div className="container mx-auto p-4 grid md:grid-cols-3 gap-2 mt-10">
//         {values.map((val, index) => (
//           <div
//             key={index}
//             className="bg-white shadow-md rounded-lg p-4  mb-2 flex items-center justify-between"
//           >
//             <div>
//               <div className="mb-1">
//                 <p className="text-gray-700 font-semibold text-sm">
//                   Name: {val?.fullName}
//                 </p>
//                 <p className="text-gray-700 text-[12px]">Class: {val.class}</p>
//                 <p className="text-gray-700 text-[12px]">
//                   Roll No: {val.rollNo}
//                 </p>
//                 <p className="text-gray-700 text-[12px]">
//                   Adm No:{" "}
//                   <span className="text-[#ee582c] font-bold">
//                     {val.admissionNumber}
//                   </span>
//                 </p>
//                 <p className="text-gray-700 text-[12px]">
//                   Father Name: {val.fatherName || "N/A"}
//                 </p>
//                 <p className="text-gray-700 text-[12px]">
//                   Mobile No: {val.contact}
//                 </p>
//                 <p className="text-gray-700 text-[12px]">
//                   Address: {val.address}
//                 </p>
//               </div>
//             </div>
//             <div className="flex items-center">
//               <div className="mr-4">
//                 <img
//                   src={val.photo}
//                   alt="val"
//                   className="rounded-sm w-24 h-24 object-cover"
//                 />
//               </div>
//             </div>
//             <button
//               className="text-blue-500 hover:text-blue-700 focus:outline-none"
//               onClick={() => handleEditClick(val)}
//             >
//               <FaEdit size={20} />
//             </button>
//           </div>
//         ))}

//         <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Edit`}>
//           <DynamicFormFileds
//            studentData={student}
//            buttonLabel={'Edit'}
//         //    setStudent={setStudent} 
//            />

//           {/* <div className="px-4  shadow-xl bg-wh ">
//             <button
//               className="w-full bg-[#2fa7db] text-white  rounded-md mb-5 py-2 "
//               // onClick={handleSaveClick}
//               disabled={loading}
//             >
//               {loading ? "Updating..." : "Update"}
//             </button>
//           </div> */}
//         </Modal>
//       </div>
//     </>
//   );
// }

// export default AdmissionDetails;
