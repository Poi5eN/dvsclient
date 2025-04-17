import React, { useState, useCallback, useEffect } from "react";
import { FaEdit } from "react-icons/fa";
import { Modal, Box, Typography, IconButton } from "@mui/material";
import DynamicFormFileds from "../Dynamic/Form/Admission/DynamicFormFields";
import {
  thirdpartyadmissions,
  thirdpartyclasses,
} from "../Network/ThirdPartyApi";
import CloseIcon from "@mui/icons-material/Close";
import moment from "moment";
import { useStateContext } from "../contexts/ContextProvider";

function AllStudent() {
  
  const SchoolID = localStorage.getItem("SchoolID");
  const [reRender, setReRender] = useState(false);
  const { currentColor,setIsLoader,schoolDetails } = useStateContext();
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [student, setStudent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
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
    try {
      // setIsLoader(true);
      if (!SchoolID) return;
      const response = await thirdpartyclasses(SchoolID);
     
      if (response.success) {
        let classes = response.classList;
      localStorage.setItem("classes", JSON.stringify(classes.sort((a, b) => a-b)));
        setGetClass([{ className: "all", sections: "" }, ...classes.sort((a, b) => a - b)]); // Add "All Classes" option
        // setIsLoader(false);
      } else {
        console.log("error", response?.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const getStudent = async () => {
    if (!SchoolID) return;
    setIsLoader(true);
    try {
      
      const response = await thirdpartyadmissions(SchoolID);
console.log("response aaaaa",response)
      if (response.success) {
        setAllStudents(response?.data);
        setFilteredStudents(response?.data);
        setIsLoader(false);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
// useEffect(()=>{
//   getStudent()
// },[reRender])

  useEffect(() => {
    getStudent();
    Getclasses();
  }, [SchoolID,reRender]);
  // }, [reRender,schoolDetails?.schoolId]);

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

    if (searchTerm) {
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        filtered = filtered.filter(student => {
          return (
              student.studentName?.toLowerCase().includes(lowerCaseSearchTerm) ||
              student.admissionNumber?.toLowerCase().includes(lowerCaseSearchTerm) ||
              (typeof student.contact === "string" && student.contact.includes(searchTerm))
          );
      });
      

    }

    setFilteredStudents(filtered);
}, [selectedClass, selectedSection, allStudents, searchTerm]);
if (!SchoolID) {
  return <div className="text-center mt-10 text-red-500 font-semibold">Please Select School</div>;
}
  return (
    
    <>
   {
      filteredStudents?.length>0 ?(
        <>
          <div
        // className="bg-gray-800 py-[1px] fixed top-0 w-full  z-10"
           className="py-[1px] fixed top-[70px] w-full  z-10"
        // style={{ background: "#2fa7db" }}
      >
        <div className="flex justify-around max-w-md mx-auto gap-1">
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className=" text-[#f0592e] border-1  px-2  outline-none w-[40vw]"
          />
          <div className="flex flex-col  w-[160px] ">
            <select
              name="studentClass"
              className=" w-full border-1 bg-gray-800  outline-none py-[3px] bg-inherit"
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
          <div className="flex flex-col  w-[160px] ">
            <select
              name="studentSection"
              className=" w-full border-1  outline-none py-[3px] bg-inherit"
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

            className="bg-white relative shadow-[rgba(0,_0,_0,_0.24)_0px_3px_8px] rounded-lg p-4  mb-2 flex items-center justify-between"
          >
            <div className="text-gray-700 font-semibold text-sm absolute top-2 right-2 gap-2">

              <div className="flex justify-center items-center gap-3">
                <p>
                  {val?.assignedThirdParty == null ? (<span className="bg-[#f0592e] px-1 text-white shadow-md rounded-md text-[8px]">Admin</span>) : <span className="bg-[#2fa7db] text-[8px] px-1 rounded-md shadow-md text-white">T-Party</span>}

                </p>
                <button
                  className="text-blue-500 hover:text-blue-700 focus:outline-none"
                  onClick={() => handleEditClick(val)}
                >
                  <FaEdit size={20} />
                </button>
              </div>
            </div>
            <div className="">

              <div className="mb-1 ">


                <p className="text-gray-700 font-semibold text-sm">
                  Name: {val?.studentName}
                </p>
                <p className="text-gray-700 text-[12px]">Class: {val?.class}-{val?.section}</p>
                <p className="text-gray-700 text-[12px]">
                  Roll No: {val?.rollNo}
                </p>
                <p className="text-gray-700 text-[12px]">
                  Adm No:{" "}
                  <span className="text-[#ee582c] font-bold">
                    {val.admissionNumber}
                  </span>
                </p>
                <p className="text-gray-700 text-[12px]">
                  Father Name: {val?.udisePlusDetails?.father_name || "N/A"}
                  {/* Father Name: {val?.fatherName || "N/A"} */}
                </p>
                <p className="text-gray-700 text-[12px]">
                  Mobile No: {val?.contact}
                </p>
                <p className="text-gray-700 text-[12px]">
                  DOB: {moment(val?.dateOfBirth).format("DD-MMM-YYYY")}
                </p>
                <p className="text-gray-700 text-[12px]">
                  Address: {val?.address}
                </p>
              </div>
            </div>
            <div className="flex items-center border">
              <div className="border-1 border-cyan-500 p-[1px] w-[67px] h-[67px]">
                <img
                  src={val?.studentImage?.url || "https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/1024px-No_image_available.svg.png"}
                  alt="val"
                  className="rounded-sm w-16 h-16 object-cover"
                />
              </div>
            </div>

          </div>
        ))}

<Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            // width: { xs: "90%", sm: "80%", md: "50%" }, // Responsive width
            // maxWidth: "600px",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: 2,
            // p: 3,
          }}
        >
          <Box display="flex" justifyContent="space-between" alignItems="center" 
          // mb={2}
          >
            <Typography variant="h6">Edit Student</Typography>
            <IconButton onClick={() => setModalOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <DynamicFormFileds studentData={student} buttonLabel="Update" setIsOpen={setModalOpen} setReRender={setReRender} />
        </Box>
      </Modal>
        {/* <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`Edit`}>
          <DynamicFormFileds studentData={student} buttonLabel={"Update"} setIsOpen={setModalOpen} setReRender={setReRender} />
        </Modal> */}
      </div>
        </>
      ):(<div className="text-center mt-10 text-red-500 font-semibold">No Students</div>)
    }
      
    
     
    </>
  );
}

export default AllStudent;

