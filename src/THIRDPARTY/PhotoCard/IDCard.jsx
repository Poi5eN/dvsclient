import React, { useState, useCallback, useEffect, useRef } from "react"; // Added useRef
import { FaEdit, FaPrint } from "react-icons/fa"; // Added FaPrint
import { Modal, Box, Typography, IconButton } from "@mui/material";

import {
  thirdpartyadmissions,
  thirdpartyclasses,
  thirdpartyphotorecords,
} from "../../Network/ThirdPartyApi";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import { useStateContext } from "../../contexts/ContextProvider";
// import DynamicFormFileds from "./DynamicFormFileds"; // Not used in current snippet
import EditForm from "./EditForm";
import { toast } from "react-toastify";
import { useReactToPrint } from 'react-to-print'; // Import react-to-print
import PrintableIDCards from './PrintableIDCards'; // Import the new component

function IDCard() {
  const SchoolID = localStorage.getItem("SchoolID");
  const [reRender, setReRender] = useState(false);
  const { currentColor, setIsLoader, schoolDetails } = useStateContext();
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const componentToPrintRef = useRef(null); // Ref for the printable component

  const handlePrint = useReactToPrint({
    content: () => componentToPrintRef.current,
    documentTitle: `Student_ID_Cards_${selectedClass || 'All'}_${selectedSection || 'All'}`,
    onBeforeGetContent: () => {
      setIsLoader(true); // Show loader before content is gathered
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setIsLoader(false); // Hide loader after printing
      toast.info("Print job sent.");
    },
    onPrintError: (error) => {
      setIsLoader(false);
      toast.error("Error during printing. Check console.");
      console.error("Print Error:", error);
    },
    removeAfterPrint: true // Good for performance
  });

  const handleEditClick = useCallback((studentData) => {
    setStudent(studentData);
    setModalOpen(true);
  }, []);

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    setSelectedSection(""); 

    if (selectedClassName === "all") {
      setAvailableSections([]); 
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
    try {
      if (!SchoolID) return;
      const response = await thirdpartyclasses(SchoolID);
    
      if (response.success) {
        let classes = response.classList;
      localStorage.setItem("classes", JSON.stringify(classes.sort((a, b) => a-b)));
        setGetClass([{ className: "all", sections: "" }, ...classes.sort((a, b) => a - b)]); 
      } else {
        console.log("error", response?.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getStudent = async () => {
    if (!SchoolID) return;
    // Do not fetch if "all" classes is selected but no specific section,
    // or if class is selected but no section (unless "all sections" is an option).
    // The current logic seems to fetch if both are selected, or if class is "all" (which might be too broad)
    // Let's adjust the condition to be more specific for fetching.
    // Fetch only if (class is not 'all' AND section is selected) OR (class is 'all' and section is effectively 'all' or empty, depending on API)
    // The API `thirdpartyphotorecords(SchoolID,selectedClass, selectedSection)` will handle 'all' if you pass empty strings or "all".
    // For now, let's assume the API handles selectedClass="all" or selectedSection="all" appropriately.
    
    setIsLoader(true);
    try {
      const classParam = selectedClass === "all" ? "" : selectedClass; // Adjust if your API expects "all" string
      const sectionParam = selectedSection; // Assuming empty means all sections for the selected class, or if class is "all", all sections of all classes.

      const response = await thirdpartyphotorecords(SchoolID, classParam, sectionParam);

      if (response.success) {
        setAllStudents(response?.data || []); // Ensure it's an array
        setFilteredStudents(response?.data || []);
        if((response?.data || []).length <= 0){
          toast.warn("No Data Found for the selected criteria.");
        }
      } else{
        toast.error(response?.message || "Failed to fetch students.");
        setAllStudents([]);
        setFilteredStudents([]);
      }
    } catch (error) {
      console.log("error", error);
      toast.error("An error occurred while fetching students.");
      setAllStudents([]);
      setFilteredStudents([]);
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(()=>{
    // Initial fetch or re-fetch when reRender changes
    // Only call if SchoolID is present.
    // Avoid calling with empty class/section on initial load if that's not desired.
    if (SchoolID) {
        // If you want to load all students initially, call getStudent() here.
        // Otherwise, wait for class/section selection.
        // For this example, I'll keep the existing reRender logic.
        if (reRender && (selectedClass || selectedClass === "all") ) { // Fetch if reRender is true and some class is selected
            getStudent();
            setReRender(false); // Reset reRender
        }
    }
  },[reRender, SchoolID]);


  useEffect(() => {
    if (SchoolID) Getclasses();
  }, [SchoolID]);

  useEffect(()=>{
    // Fetch students when class or section changes, but only if a class is selected.
    if(SchoolID && selectedClass){ // selectedClass can be "all" or a specific class name
      getStudent();
    } else if (!selectedClass) { // If class is reset, clear students
      setAllStudents([]);
      setFilteredStudents([]);
    }
  },[selectedClass, selectedSection, SchoolID]); // Add SchoolID as dependency

  useEffect(() => {
    let filtered = [...allStudents];

    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(student => {
          return (
              student.studentName?.toLowerCase().includes(lowerCaseSearchTerm) ||
              student.photoNo?.toLowerCase().includes(lowerCaseSearchTerm) 
          );
      });
    }
    setFilteredStudents(filtered);
  }, [searchTerm, allStudents]); // Add allStudents as dependency

  if (!SchoolID) {
    return <div className="text-center mt-10 text-red-500 font-semibold">Please Select School</div>;
  }

  return (
    <>
      {/* Filter bar - make it non-printable */}
      <div className="py-[1px] fixed top-[95px] w-full z-10 bg-white no-print">
        <div className="flex justify-around items-center max-w-lg mx-auto gap-1"> {/* Adjusted max-w and added items-center */}
          <input
            type="text"
            placeholder="Search by Name/Photo No..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="text-[#f0592e] border-1 px-2 py-1 outline-none w-[35vw] min-w-[150px]"
          />
          <div className="flex flex-col w-[130px]">
            <select
              name="studentClass"
              className="w-full border-1 outline-none py-[5px] bg-inherit"
              style={{ borderColor: selectedClass ? currentColor : "#ccc" }}
              value={selectedClass}
              onChange={handleClassChange}
            >
              <option value="" disabled>
                Class
              </option>
              {getClass?.map((cls, index) => (
                <option
                  key={index}
                  value={cls.className}
                  className="text-black bg-white hover:bg-gray-100" // Improved option styling
                >
                  {cls?.className === 'all' ? "All Classes" : cls?.className}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col w-[130px]">
            <select
              name="studentSection"
              className="w-full border-1 outline-none py-[5px] bg-inherit"
              style={{ borderColor: selectedSection ? currentColor : "#ccc" }}
              value={selectedSection}
              onChange={handleSectionChange}
              disabled={!selectedClass || selectedClass === "all"} // Often "All Classes" means all sections are implied
            >
              <option value="" disabled>
                Section
              </option>
              {availableSections?.map((item, index) => (
                <option key={index} value={item}
                  className="text-black bg-white hover:bg-gray-100" // Improved option styling
                >
                  {item}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handlePrint}
            disabled={filteredStudents.length === 0}
            title={filteredStudents.length === 0 ? "No students to print" : "Print ID Cards"}
            className="p-2 rounded-md text-white disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: currentColor }}
          >
            <FaPrint size={18} />
          </button>
        </div>
      </div>

      {/* Hidden component for printing */}
      <div 
      style={{ display: "none" }}
      > {/* This div will not be visible on screen */}
        <PrintableIDCards ref={componentToPrintRef} students={filteredStudents} schoolDetails={schoolDetails} />
      </div>

      {/* Main content display area - make it non-printable */}
      <div className="container mx-auto p-4 grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-[60px] no-print"> {/* Added mt, adjusted gap and cols */}
        {filteredStudents.length > 0 ? (
          filteredStudents.map((val, index) => (
            <div
              key={val.studentId || index} // Use a unique studentId if available
              className="bg-white relative shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] rounded-lg p-4 flex items-start justify-between" // items-start
            >
              <div className="flex-grow"> {/* Details take available space */}
                <div className="mb-1">
                  <p className="text-gray-700 font-semibold text-sm">
                  Photo No: <span className="text-green-800">{val?.photoNo}</span>
                  </p>
                  <p className="text-gray-700 font-semibold text-sm">
                    Name: {val?.studentName}
                  </p>
                  <p className="text-gray-700 text-xs">Class: {val?.class}-{val?.section}</p>
                  <p className="text-gray-700 text-xs">
                    Father Name: {val?.udisePlusDetails?.father_name }
                  </p>
                  <p className="text-gray-700 text-xs">
                    DOB: {moment(val?.dateOfBirth).format("DD-MMM-YYYY")}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-center ml-3"> {/* Image and edit button column */}
                <div className="border-1 border-cyan-500 p-[1px] w-[67px] h-[67px] mb-2">
                  <img
                    src={val?.studentImage?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"}
                    alt={val?.studentName || "Student"}
                    className="rounded-sm w-16 h-16 object-cover"
                  />
                </div>
                <div className="text-gray-700 font-semibold text-sm absolute top-[-4px] right-2 flex items-center gap-2">
                  <p>
                    {val?.assignedThirdParty == null ? (<span className="bg-[#f0592e] px-1 py-0.5 text-white shadow-md rounded-md text-[8px]">Admin</span>) : <span className="bg-[#2fa7db] text-[8px] px-1 py-0.5 rounded-md shadow-md text-white">T-Party</span>}
                  </p>
                  <button
                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    onClick={() => handleEditClick(val)}
                    title="Edit Student"
                  >
                    <FaEdit size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          !setIsLoader && <div className="col-span-full text-center text-gray-500 mt-10">No students match your criteria.</div> // Show message if no students
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: { xs: "90%", sm: "80%", md: "50%" },
            maxWidth: "600px",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            // p: 3, // Padding is handled by EditForm or internal Box elements
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" p={2} borderBottom="1px solid #eee">
            <Typography variant="h6">Edit Student</Typography>
            <IconButton onClick={() => setModalOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
          {/* Assuming EditForm handles its own padding */}
          <EditForm studentData={student} buttonLabel="Update" setIsOpen={setModalOpen} setReRender={setReRender} />
        </Box>
      </Modal>
    </>
  );
}

export default IDCard;

// import React, { useState, useCallback, useEffect } from "react";
// import { FaEdit } from "react-icons/fa";
// import { Modal, Box, Typography, IconButton } from "@mui/material";

// import {
//   thirdpartyadmissions,
//   thirdpartyclasses,
//   thirdpartyphotorecords,
// } from "../../Network/ThirdPartyApi";
// import CloseIcon from "@mui/icons-material/Close";
// import moment from "moment";
// import { useStateContext } from "../../contexts/ContextProvider";
// import DynamicFormFileds from "./DynamicFormFileds";
// import EditForm from "./EditForm";
// import { toast } from "react-toastify";

// function IDCard() {
  
//   const SchoolID = localStorage.getItem("SchoolID");
//   const [reRender, setReRender] = useState(false);
//   const { currentColor,setIsLoader,schoolDetails } = useStateContext();
//   const [getClass, setGetClass] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const [availableSections, setAvailableSections] = useState([]);
//   const [allStudents, setAllStudents] = useState([]);
//   const [filteredStudents, setFilteredStudents] = useState([]);
//   const [student, setStudent] = useState(null);
//   const [modalOpen, setModalOpen] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const handleEditClick = useCallback((studentData) => {
//     setStudent(studentData);
//     setModalOpen(true);
//   }, []);

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setSelectedClass(selectedClassName);
//     setSelectedSection(""); // Reset section when class changes

//     if (selectedClassName === "all") {
//       setAvailableSections([]); // No sections when "All Classes" is selected
//     } else {
//       const selectedClassObj = getClass?.find(
//         (cls) => cls.className === selectedClassName
//       );

//       if (selectedClassObj) {
//         setAvailableSections(selectedClassObj.sections.split(", "));
//       } else {
//         setAvailableSections([]);
//       }
//     }
//   };

//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value);
//   };

//   const Getclasses = async () => {
//     try {
//       // setIsLoader(true);
//       if (!SchoolID) return;
//       const response = await thirdpartyclasses(SchoolID);
     
//       if (response.success) {
//         let classes = response.classList;
//       localStorage.setItem("classes", JSON.stringify(classes.sort((a, b) => a-b)));
//         setGetClass([{ className: "all", sections: "" }, ...classes.sort((a, b) => a - b)]); // Add "All Classes" option
//         // setIsLoader(false);
//       } else {
//         console.log("error", response?.message);
//       }
//     } catch (error) {
//       console.log("error", error);
//     }
//   };

//   const getStudent = async () => {
//     if (!SchoolID) return;
//     setIsLoader(true);
//     try {
      
//       const response = await thirdpartyphotorecords(SchoolID,selectedClass, selectedSection);

//       if (response.success) {
//         setAllStudents(response?.data);
//         setFilteredStudents(response?.data);
//         setIsLoader(false);
//        if(response?.data.length<=0){
//         toast.error("No Data Found")
//        }
//       }
//       else{
//         toast.error(response?.message)
//         setIsLoader(false);
//       }
//     } catch (error) {
//       console.log("error", error);
//       setIsLoader(false);
//     }
//   };
// useEffect(()=>{
//   getStudent()
// },[reRender])

//   useEffect(() => {
//     // getStudent();
//     Getclasses();
//   }, [SchoolID]);
//   // }, [reRender,schoolDetails?.schoolId]);

//   useEffect(()=>{
//     if(selectedClass && selectedSection){
//       getStudent()
//     }
//   },[selectedClass, selectedSection])

//   useEffect(() => {
//     let filtered = [...allStudents];

//     if (searchTerm) {
//         const lowerCaseSearchTerm = searchTerm.toLowerCase();
//         filtered = filtered.filter(student => {
//           return (
//               student.studentName?.toLowerCase().includes(lowerCaseSearchTerm) ||
//               student.photoNo?.toLowerCase().includes(lowerCaseSearchTerm) 
//               // (typeof student.contact === "string" && student.contact.includes(searchTerm))
//           );
//       });
      

//     }

//     setFilteredStudents(filtered);
// }, [searchTerm]);
// if (!SchoolID) {
//   return <div className="text-center mt-10 text-red-500 font-semibold">Please Select School</div>;
// }
//   return (
    
//     <>
//    {
//        (
//         <>
//           <div className="py-[1px] fixed top-[95px] w-full  z-10 bg-white"
      
//       >
//         <div className="flex justify-around max-w-md mx-auto gap-1">
//           <input
//             type="text"
//             placeholder="Search..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className=" text-[#f0592e] border-1  px-2  outline-none w-[40vw]"
//           />
//           <div className="flex flex-col w-[160px] ">
//             <select
//               name="studentClass"
//               className=" w-full border-1  outline-none py-[3px] bg-inherit"
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
//                 <option
//                   key={index}
//                   value={cls.className}
//                   className="text-white bg-gray-800"
//                 >
//                   {cls?.className === 'all' ? "All Classes" : cls?.className}
//                 </option>
//               ))}
//             </select>
//           </div>
//           <div className="flex flex-col  w-[160px] ">
//             <select
//               name="studentSection"
//               className=" w-full border-1 outline-none py-[3px] bg-inherit"
//               onFocus={(e) => (e.target.style.borderColor = currentColor)}
//               onBlur={(e) => (e.target.style.borderColor = "#ccc")}
//               value={selectedSection}
//               onChange={handleSectionChange}
//               required
//               // disabled={!selectedClass || selectedClass === "all"} // Disable if no class is selected or "All Classes" is selected
//             >
//               <option value="" disabled>
//                 Section
//               </option>
//               {availableSections?.map((item, index) => (
//                 <option key={index} value={item}
//                   className="text-white bg-gray-800"
//                 >
//                   {item}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </div>
//       <div className="container mx-auto p-4 grid md:grid-cols-3 gap-2 ">
//         {filteredStudents.map((val, index) => (
//           <div
//             key={index}

//             className="bg-white relative shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] rounded-lg p-4  mb-2 flex items-center justify-between"
//           >
//             <div className="text-gray-700 font-semibold text-sm absolute top-2 right-2 gap-2">

//               <div className="flex justify-center items-center gap-3">
//                 <p>
//                   {val?.assignedThirdParty == null ? (<span className="bg-[#f0592e] px-1 text-white shadow-md rounded-md text-[8px]">Admin</span>) : <span className="bg-[#2fa7db] text-[8px] px-1 rounded-md shadow-md text-white">T-Party</span>}

//                 </p>
//                 <button
//                   className="text-blue-500 hover:text-blue-700 focus:outline-none"
//                   onClick={() => handleEditClick(val)}
//                 >
//                   <FaEdit size={20} />
//                 </button>
//               </div>
//             </div>
//             <div className="">

//               <div className="mb-1 ">


//                 <p className="text-gray-700 font-semibold text-sm">
//                 Photo No: <span className="text-green-800">{val?.photoNo}</span>
//                 </p>
//                 <p className="text-gray-700 font-semibold text-sm">
//                   Name: {val?.studentName}
//                 </p>
//                 <p className="text-gray-700 text-[12px]">Class: {val?.class}-{val?.section}</p>
               
//                 <p className="text-gray-700 text-[12px]">
//                   Father Name: {val?.udisePlusDetails?.father_name || "N/A"}
                 
//                 </p>
              
//                 <p className="text-gray-700 text-[12px]">
//                   DOB: {moment(val?.dateOfBirth).format("DD-MMM-YYYY")}
//                 </p>
                
//               </div>
//             </div>
//             <div className="flex items-center border mt-5">
//               <div className="border-1 border-cyan-500 p-[1px] w-[67px] h-[67px]">
//                 <img
//                   src={val?.studentImage?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"}
//                   alt="val"
//                   className="rounded-sm w-16 h-16 object-cover"
//                 />
//               </div>
//             </div>

//           </div>
//         ))}

// <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
//         <Box
//           sx={{
//             position: "absolute",
//             top: "50%",
//             left: "50%",
//             transform: "translate(-50%, -50%)",
//             // width: { xs: "90%", sm: "80%", md: "50%" }, // Responsive width
//             // maxWidth: "600px",
//             bgcolor: "background.paper",
//             boxShadow: 24,
//             borderRadius: 2,
//             // p: 3,
//           }}
//         >
//           <Box display="flex" justifyContent="space-between" alignItems="center" 
//           // mb={2}
//           >
//             <Typography variant="h6">Edit Student</Typography>
//             <IconButton onClick={() => setModalOpen(false)}>
//               <CloseIcon />
//             </IconButton>
//           </Box>

//           <EditForm studentData={student} buttonLabel="Update" setIsOpen={setModalOpen} setReRender={setReRender} />
//         </Box>
//       </Modal>
        
//       </div>
//         </>
//       )
//       }
      
    
     
//     </>
//   );
// }

// export default IDCard;


