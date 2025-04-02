import React, { useState, useEffect } from "react";
import axios from "axios";
import { DataGrid } from "@mui/x-data-grid";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { useStateContext } from "../../../contexts/ContextProvider.js";
import { toast } from "react-toastify";
import { ActiveStudents, AdminGetAllClasses } from "../../../Network/AdminApi.js";

const Promotion = () => {

  const authToken = localStorage.getItem("token");
  const {  currentColor,setIsLoader } = useStateContext();
  const [allstudentdata,setAllStudentData]=useState([])

  const [selectionModel, setSelectionModel] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [classAnchorEl, setClassAnchorEl] = useState(null);
  const [sectionAnchorEl, setSectionAnchorEl] = useState(null);
  const [promoteClass, setPromoteClass] = useState("");
  const [promoteSection, setPromoteSection] = useState("");
  const [promoteClassAnchorEl, setPromoteClassAnchorEl] = useState(null);
  const [promoteSectionAnchorEl, setPromoteSectionAnchorEl] = useState(null);
  const [error, setError] = useState(null);
  // const [apiData, setApiData] = useState([]);
    const [getClass, setGetClass] = useState([]);
  const [apisection, setApisection] = useState([]); // State for sections of selected class
  const [studentData, setStudentData] = useState([]);



   const allStudent =async() => {
      setIsLoader(true);
      try {
        const response = await ActiveStudents();
        if (response?.students?.data) {
         
          setAllStudentData(response?.students?.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Error fetching students.");
      } finally {
        setIsLoader(false);
      }
    };



   const getAllClass = async () => {
      setIsLoader(true)
      try {
  
        const response = await AdminGetAllClasses()
        if (response?.success) {
          setIsLoader(false)
          let classes = response.classes;
          setGetClass(classes.sort((a, b) => a - b));
        }
      } catch (error) {
        console.log("error")
      }
    }

    useEffect(()=>{
      allStudent()
      getAllClass()
    },[])

  const customButtonStyle = { backgroundColor: currentColor };

  const handleClassChange = (event, classData) => {
    const selectedClassData = getClass.find((data) => data.className === classData);
    console.log("selectedClassData",selectedClassData)
    setSelectedClass(classData);
    setApisection(selectedClassData ? selectedClassData.sections : []); // Update sections based on selected class
    // setApisection(selectedClassData ? selectedClassData.sections.split(", ") : []); // Update sections based on selected class
    setSectionAnchorEl(event.currentTarget);
  };

  const handleSectionChange = (section) => {
    const filteredData = allstudentdata
      .filter((student) => student.class === selectedClass && student.section === section)
      .map((student) => ({
        id: student._id,
        name: student.studentName,
        rollNumber: student.rollNo,
        class: student.class,
      }));
      console.log("allstudentdata",allstudentdata)
    setStudentData(filteredData);
    setSelectedSection(section);
    setSectionAnchorEl(null);
  };

  const handlePromoteClassChange = (event, classData) => {
    setPromoteClass(classData.className);
    setPromoteSectionAnchorEl(event.currentTarget);
  };

  const handlePromoteSectionChange = (section) => {
    setPromoteSection(section);
    setPromoteSectionAnchorEl(null);
  };

  const handleMenuClose = () => {
    setClassAnchorEl(null);
    setSectionAnchorEl(null);
    setPromoteClassAnchorEl(null);
    setPromoteSectionAnchorEl(null);
  };

  const handleSelectionModelChange = (newSelection) => {
    setSelectionModel(newSelection);
  };

  const handlePromoteClick = async () => {
    if (selectionModel.length === 0) {
      toast.error("No students selected for promotion");
      return;
    }

    const dataToUpdate = {
      students: selectionModel,
      promotedClass: promoteClass,
      promotedSection: promoteSection,
    };

    try {
      await axios.put(
        "https://dvsserver.onrender.com/api/v1/adminRoute/promotionOfStudent",
        dataToUpdate,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Student promotion successful");
      setStudentData((prevData) => prevData.filter((student) => !selectionModel.includes(student.id)));
    } catch (error) {
      toast.error("Student promotion failed");
      console.error("Promotion Failed:", error);
    }
  };

  const columns = [
    { field: "id", headerName: "Select All", type: "checkbox", flex: 0.5 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "rollNumber", headerName: "Roll Number", flex: 1 },
    { field: "class", headerName: "Class", flex: 1 },
  ];

  return (
    <div className="mt-12 md:mt-1 mx-auto p-3">
      <h1 className="text-4xl font-bold mb-4 uppercase text-center hover-text" style={{ color: currentColor }}>
        Student Promotion
      </h1>

      <div className="flex space-x-4">
        <div className="w-1/2">
          <h3 className="text-lg font-semibold dark:text-white">Class</h3>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            style={customButtonStyle}
            onClick={(event) => setClassAnchorEl(event.currentTarget)}
          >
            {selectedClass ? `${selectedClass} - ${selectedSection}` : "Select Class and Section"}
          </Button>
          <Popover anchorEl={classAnchorEl} open={Boolean(classAnchorEl)} onClose={handleMenuClose}>
            <List>
              {getClass.map((classData) => (
                <ListItem key={classData.className} onClick={(event) => handleClassChange(event, classData.className)}>
                  <ListItemText primary={classData.className} />
                </ListItem>
              ))}
            </List>
          </Popover>
          <Popover anchorEl={sectionAnchorEl} open={Boolean(sectionAnchorEl)} onClose={handleMenuClose}>
            <List>
              {apisection.map((section) => (
                <ListItem key={section} onClick={() => handleSectionChange(section)}>
                  <ListItemText primary={section} />
                </ListItem>
              ))}
            </List>
          </Popover>
        </div>

        <div className="w-1/2">
          <h3 className="text-lg font-semibold dark:text-white">Promote</h3>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            style={customButtonStyle}
            onClick={(event) => setPromoteClassAnchorEl(event.currentTarget)}
          >
            {promoteClass ? `${promoteClass} - ${promoteSection}` : "Select Promote Class and Section"}
          </Button>
          <Popover anchorEl={promoteClassAnchorEl} open={Boolean(promoteClassAnchorEl)} onClose={handleMenuClose}>
            <List>
              {getClass.map((classData) => (
                <ListItem key={classData.className} onClick={(event) => handlePromoteClassChange(event, classData)}>
                  <ListItemText primary={classData.className} />
                </ListItem>
              ))}
            </List>
          </Popover>
          <Popover anchorEl={promoteSectionAnchorEl} open={Boolean(promoteSectionAnchorEl)} onClose={handleMenuClose}>
            <List>
              {getClass
                .find((data) => data.className === promoteClass)
                ?.sections
                // ?.sections.split(", ")
                .map((section) => (
                  <ListItem key={section} onClick={() => handlePromoteSectionChange(section)}>
                    <ListItemText primary={section} />
                  </ListItem>
                ))}
            </List>
          </Popover>
        </div>
      </div>

      <div style={{ height: 400, width: "100%", backgroundColor: "white", borderRadius: "10px" }}>
        <div className="dark:bg-[#999b9e]">
          <DataGrid
            rows={studentData}
            columns={columns}
            checkboxSelection
            selectionModel={selectionModel}
            onRowSelectionModelChange={handleSelectionModelChange}
          />
        </div>
      </div>

      <div className="w-1/2">
        <Button
          variant="contained"
          color="primary"
          fullWidth
          style={customButtonStyle}
          onClick={handlePromoteClick}
          disabled={!promoteClass || !promoteSection}
        >
          Promote Selected Students
        </Button>
      </div>
    </div>
  );
};

export default Promotion;






// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { DataGrid } from "@mui/x-data-grid";
// import Button from "@mui/material/Button";
// import Popover from "@mui/material/Popover";
// import List from "@mui/material/List";
// import ListItem from "@mui/material/ListItem";
// import ListItemText from "@mui/material/ListItemText";
// import { useStateContext } from "../../../contexts/ContextProvider.js";
// import { toast } from "react-toastify";
// import Cookies from "js-cookie";


// const Promotion = () => {
//   const authToken = Cookies.get("token");
//   const { allstudentdata, currentColor } = useStateContext();

//   const [selectionModel, setSelectionModel] = useState([]);
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState([]);
//   const [classAnchorEl, setClassAnchorEl] = useState(null);
//   const [sectionAnchorEl, setSectionAnchorEl] = useState(null);

//   const [promoteClass, setPromoteClass] = useState("");
//   const [promoteSection, setPromoteSection] = useState("");
//   const [promoteClassAnchorEl, setPromoteClassAnchorEl] = useState(null);
//   const [promoteSectionAnchorEl, setPromoteSectionAnchorEl] = useState(null);
//   const [error, setError] = useState(null);

//   // const [class, setClass] = useState([]);
//   const [apiclass, setApiclass] = useState([]);
//   const [apisection, setApisection] = useState([]);
//   const [shouldFetchData, setShouldFetchData] = useState(false);

//   // Created for testing
//   const [meta, setMeta] = useState();
//   const [apiData, setApiData] = useState([]);
//   // set the studentdata
//   const [studentData, setStudentData] = useState([]);

//   useEffect(() => {
//     // Fetch data from the server when the component mounts
//     axios
//       .get(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClasses",
//         // "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllClass",
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//           },
//         }
//       )
//       .then((response) => {
//         // console.log(response);
//         if (Array.isArray(response.data.classList)) {
//           //   // Extract class names from the response
//           const classNames = response.data.classList.map(
//             (classData) => classData.className
//           );
//           // const classNames = response.data.classList;
//           const classSection = response.data.classList.map(
//             (classData) => classData.section
//           );
        
//           setApiData(response.data.classList);

//           setApiclass(classNames);
//           setApisection(classSection);
//           console.log(response);
//         } else {
//           setError("Data format is not as expected.");
//         }
//       })
//       .catch((error) => {
//         console.error("Error fetching data:", error);
//         setError("Error fetching data.");
//       });
//   }, [shouldFetchData]);

//   // Extra console in useEffects
//   // console.log("All student data created by admin ", allstudentdata);
//   // console.log("Api data that for selecting class and sectio ", apiData);
//   // console.log("To set api class dynamically ", apiclass);
//   // console.log("To set api class section  dynamically ", apisection);

//   const customButtonStyle = {
//     backgroundColor: currentColor, // Change this to the color you desire
  
//   };

  
//   const classSections = apiData.map((data) => (
   
//     {
   
//     class: data.className,
//     sections: data.sections,
//   }
// ));

//   // Static columns
//   const columns = [
//     { field: "id", headerName: "Select All", type: "checkbox", flex: 0.5 },
//     { field: "name", headerName: "Name", flex: 1 },
//     { field: "rollNumber", headerName: "Roll Number", flex: 1 },
//     { field: "class", headerName: "Class", flex: 1 },
//   ];

//   const handleClassChange = (event, classData) => {
//     // set the section if it the classdata match with apidata and the section in the api data related to the classs other wise set it to null
//     const selectedSection = getSelectedSection(classData);
   
//     setApisection(selectedSection);
  
//     setSelectedClass(classData);
//     setSectionAnchorEl(event.currentTarget);
//   };

//   function getSelectedSection(classData) {
//     const matchingData = apiData.find((data) => data.className === classData);
//     if (matchingData) {
//       // If a matching class is found, return its section
//       const filteredStudentData = allstudentdata.filter(
//         (student) => student.className === classData
//       );
//       setStudentData(filteredStudentData);
//       return matchingData.section; // Assuming there is only one section in the array
//     }
//     // If no matching class is found, return null or a default value
//     return null;
//   }

//   const handleSectionChange = (section, selectedClass) => {

//     const matchingData = allstudentdata.filter((object) => {
//       return object.class === selectedClass && object.section === section;
//     });


//     const formattedData = matchingData.map((object) => ({
//       id: object._id,
//       name: object.fullName,
//       rollNumber: object.rollNo,
//       class: object.class,
//     }));

//     setStudentData(formattedData);
   

  
//     setSelectedSection(section);
//     // Close the section anchor element (if you're using a dropdown or popover)
//     setSectionAnchorEl(null);
//   };

//   const handlePromoteClassChange = (event, classData) => {
//     setPromoteClass(classData.class);
//     setPromoteSectionAnchorEl(event.currentTarget);
//   };

//   const handlePromoteSectionChange = (section) => {
//     setPromoteSection(section);
//     setPromoteSectionAnchorEl(null);
//   };

//   const handleMenuClose = () => {
//     setClassAnchorEl(null);
//     setSectionAnchorEl(null);
//     setPromoteClassAnchorEl(null);
//     setPromoteSectionAnchorEl(null);
//   };
//   const handleSelectionModelChange = (newSelection) => {
//     setSelectionModel(newSelection);
    
//   };
  
//   const handlePromoteClick = async () => {
//     // Get the selected student's ID, promoted section, and promoted class
//     const studentId = selectionModel; // Replace this with the actual way you obtain the selected student's ID
//     const promotedSection = promoteSection; // Replace with your logic to get the promoted section
//     const promotedClass = promoteClass; // Replace with your logic to get the promoted class

//     if (studentId.length === 0) {
//       console.error("No students selected for promotion");
//       return;
//     }
//     // Prepare the data to send in the PUT request
//     const dataToUpdate = {
//       students: studentId,
//       promotedClass: promotedClass,
//       promotedSection: promotedSection,
//     };

//     // Make the PUT request
//     await axios
//       .put(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/promotionOfStudent",
//         dataToUpdate,
//         {
//           withCredentials: true,
//       headers: {
//         Authorization: `Bearer ${authToken}`,
//         "Content-Type": "application/json"
//       },
//         }
//       )
//       .then((response) => {
//         toast.success("Student promotion successfully");

//         const unMatchingData = studentData.filter((object) => {
//           return !dataToUpdate.students.includes(object.id);
//         });

//         setStudentData(unMatchingData);

//         // console.log(
//         //   "Promotion Successful:",
//         //   response.data,
//         //   "Promoted class",
//         //   promoteClass,
//         //   "Promoted Section ",
//         //   promotedSection
//         // );
//       })
//       .catch((error) => {
//         // Handle errorscd c
//         toast.error("Student promotion  failed");
//         console.error("Promotion Failed:", error);
//       });
//   };

//   return (
//     <div className=" mt-12 md:mt-1  mx-auto p-3">
//       <h1 
//       className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
//       style={{color:currentColor}}
//       >
//         Student Promotion
//       </h1>

//       <div className="flex space-x-4">
//         <div className="w-1/2">
//           <h3 className="text-lg font-semibold dark:text-white  ">Class</h3>
//           <Button
//             variant="contained"
//             color="primary"
//             fullWidth
//             style={customButtonStyle}
//             onClick={(event) => {
//               setClassAnchorEl(event.currentTarget);
//               setSectionAnchorEl(null);
              
//             }}
//           >
//             {selectedClass
//               ? `${selectedClass} - ${selectedSection}`
//               : "Select Class and Section"}
//           </Button>
//           <Popover
//             anchorEl={classAnchorEl}
//             open={Boolean(classAnchorEl)}
//             onClose={handleMenuClose}
//           >
//             <List>
//               {apiclass.map((classData) => (
//                 <ListItem
//                   key={classData}
//                   onClick={(event) => handleClassChange(event, classData)}
//                 >
//                   <ListItemText primary={classData} />
//                 </ListItem>
//               ))}
//             </List>
//           </Popover>
//           <Popover
//             anchorEl={sectionAnchorEl}
//             open={Boolean(sectionAnchorEl)}
//             onClose={handleMenuClose}
//           >
//             <List>
              
//               {apisection.map((section) => (
//                 <ListItem
//                   key={section}
//                   onClick={() => handleSectionChange(section, selectedClass)}
//                 >
//                   <ListItemText primary={section} />
//                 </ListItem>
//               ))}
//             </List>
//           </Popover>
//         </div>
//         <div className="w-1/2">
//           <h3 className="text-lg font-semibold  dark:text-white ">Promote</h3>
//           <Button
//             variant="contained"
//             color="primary"
//             style={customButtonStyle}
//             fullWidth
//             onClick={(event) => {
//               setPromoteClassAnchorEl(event.currentTarget);
//               setPromoteSectionAnchorEl(null);
//             }}
//           >
//             {promoteClass
//               ? `${promoteClass} - ${promoteSection}`
//               : "Select Promote Class and Section"}
//           </Button>
//           <Popover
//             anchorEl={promoteClassAnchorEl}
//             open={Boolean(promoteClassAnchorEl)}
//             onClose={handleMenuClose}
//           >
//             <List>
//               {classSections.map((classData) => (
//                 <ListItem
//                   button
//                   key={classData.class}
//                   onClick={(event) =>
//                     handlePromoteClassChange(event, classData)
//                   }
//                 >
//                   <ListItemText primary={classData.class} />
//                 </ListItem>
//               ))}
//             </List>
//           </Popover>
//           <Popover
//             anchorEl={promoteSectionAnchorEl}
//             open={Boolean(promoteSectionAnchorEl)}
//             onClose={handleMenuClose}
//           >
//             <List>
//               {classSections
//                 .find((classData) => classData.class === promoteClass)
//                 ?.sections.map((section) => (
//                   <ListItem
//                     button
//                     key={section}
//                     onClick={() => handlePromoteSectionChange(section)}
//                   >
//                     <ListItemText primary={section} />
//                   </ListItem>
//                 ))}
//             </List>
//           </Popover>
//         </div>
//       </div>
//       <div
//         style={{
//           height: 400,
//           width: "100%",
//           backgroundColor: "white",
//           borderRadius: "10px",
//         }}
//       >
//         <div className=" dark:bg-[#999b9e] ">
//           <DataGrid
//             rows={studentData}
//             columns={columns}
//             checkboxSelection
//             selectionModel={selectionModel}
//             onRowSelectionModelChange={handleSelectionModelChange}
//           />
//         </div>
//       </div>

//       <div className="w-1/2">
//         <Button
//           variant="contained"
//           color="primary"
//           style={customButtonStyle}
//           fullWidth
//           onClick={handlePromoteClick}
//         >
//           Update Session
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Promotion;
