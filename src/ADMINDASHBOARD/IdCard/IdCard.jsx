// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg";
// import { ActiveStudents, AdminGetAllClasses } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";

// const IdCard = () => {
//   const { currentColor, setIsLoader } = useStateContext();
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const componentPDF = useRef();

//   // Template for front side
//   const [frontTemplate] = useState(`
//     <div style='background-image:url(\${backgroundImage});
//                 background-position: center;
//                 background-repeat: no-repeat;
//                 width: 54mm;
//                 height: 86mm;
//                 position: relative;
//                 background-size:cover;
//                 border:1px solid'>
      
//       <div style='margin-left: 40px;
//                   margin-top: 82px;
//                   width: 85px;
//                   height: 95px;
//                   border: 0.5px solid #ff0000;
//                   border-radius: 4px;
//                   overflow:hidden;
//                   position:absolute;
//                   background-color: #eee;'> 
//         <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student Photo"/>
//       </div>
    
//       <div style='position: absolute; left: 3px; top: 190px; width: calc(100% - 6px);'> 
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'> 
//           NAME <span style="margin-left: 16px; font-weight: bold;"> : \${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           CLASS <span style="margin-left: 13px; font-weight: bold"> : \${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           F.Name <span style="margin-left: 9px; font-weight: bold"> : \${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           Phone <span style="margin-left: 12px; font-weight: bold"> : \${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; font-weight: bold; text-transform: uppercase;'>
//           Address <span style="margin-left:1px; font-weight: bold"> : \${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success && Array.isArray(response.classes)) {
//         setClassData(response.classes);
//       } else {
//         toast.error("Failed to fetch classes or invalid format");
//         setClassData([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching classes");
//       setClassData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   const fetchAllStudents = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents();
//       if (response?.success && Array.isArray(response?.students?.data)) {
//         setStudentData(response?.students?.data);
//         setFilteredStudentData(response?.students?.data);
//       } else {
//         toast.error("Failed to fetch students or invalid format");
//         setStudentData([]);
//         setFilteredStudentData([]);
//       }
//     } catch (error) {
//       toast.error("Error fetching students");
//       setStudentData([]);
//       setFilteredStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   useEffect(() => {
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchAllClasses, fetchAllStudents]);

//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) filtered = filtered.filter(student => student.class === selectedClass);
//     if (selectedSection) filtered = filtered.filter(student => student.section === selectedSection);
//     if (filterName) {
//       const lower = filterName.toLowerCase();
//       filtered = filtered.filter(student => student.studentName?.toLowerCase().includes(lower));
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, filterName, studentData]);

//   const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   const classOptions = classData.map(cls => ({ label: cls.className, value: cls.className }));
//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({ label: sec, value: sec })) || [];

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID Cards - ${selectedClass || 'All'} ${selectedSection || ''}`,
//     onAfterPrint: () => toast.success("PDF Generated/Printed Successfully!")
//   });

//   const renderTemplate = (template, student) => {
//     const data = {
//       backgroundImage: bg,
//       studentImage: student.studentImage?.url || "https://via.placeholder.com/85x95?text=No+Image",
//       name: student.studentName || '',
//       class: `${student.class}${student.section ? ` - ${student.section}` : ''}`,
//       father_name: student.fatherName || '',
//       mobile: student.contact ? `+91${student.contact}` : 'N/A',
//       address: student.address || ''
//     };
//     return template.replace(/\$\{(.*?)\}/g, (_, key) => data[key.trim()] || '');
//   };

//   return (
//     <>
//       <Box sx={{ padding: 2 }}>
//         <Typography variant="h5" gutterBottom>
//           Generate Student ID Cards
//         </Typography>
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//               placeholder="Select Class"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//               disabled={!selectedClass || sectionOptions.length === 0}
//               placeholder="Select Section"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor }}
//               fullWidth
//               disabled={filteredStudentData.length === 0}
//               sx={{ height: '100%' }}
//             >
//               Download PDF
//             </Button>
//           </Grid>
//         </Grid>

//         <div ref={componentPDF}>
//           <div className="id-card-container flex flex-wrap gap-4">
//           {/* <div className="id-card-container flex flex-wrap justify-center gap-4"> */}
//             {filteredStudentData.length > 0 ? (
//               filteredStudentData.map((student, index) => (
//                 <div
//                   key={student._id || index}
//                   className="id-card"
//                   dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, student) }}
//                 />
//               ))
//             ) : (
//               <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5 }}>
//                 No students found matching the criteria.
//               </Typography>
//             )}
//           </div>
//         </div>
//       </Box>

//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape;
//             margin-top: 20px;
//           }
//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 15px;
//             padding: 10px;
//           }
//           .id-card {
//             page-break-inside: avoid;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default IdCard;






import React, { useEffect, useState, useRef, useCallback } from "react";
import { useStateContext } from "../../contexts/ContextProvider"; // Assuming ContextProvider provides setIsLoader and currentColor
import { useReactToPrint } from "react-to-print";
import { Button, Grid, TextField, Typography, Box } from "@mui/material"; // Added Typography and Box for better layout
import bg from "../../ShikshMitraWebsite/kushidcrad.jpeg"; // Ensure this path is correct
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg"; // Ensure this path is correct
import { ActiveStudents, AdminGetAllClasses, getAllStudents } from "../../Network/AdminApi"; // Ensure these API functions are correct
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Ensure this component exists and works as expected
import { toast } from "react-toastify";
import moment from "moment/moment";

const IdCard = () => {
  // Use context state
  const { currentColor, setIsLoader } = useStateContext();

  // State for data
  const [studentData, setStudentData] = useState([]); // Full list of students
  const [classData, setClassData] = useState([]); // Fetched class data (class name, sections, etc.)
  const [filteredStudentData, setFilteredStudentData] = useState([]); // Students to display/print

  // State for filters
  const [filterName, setFilterName] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Ref for printing
  const componentPDF = useRef();

  // --- Data Fetching ---

  // Fetch Class Data
  const fetchAllClasses = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await AdminGetAllClasses();
      if (response?.success && Array.isArray(response.classes)) {
        // Use 'className' based on your provided structure
        setClassData(response.classes);
      } else {
        toast.error("Failed to fetch classes or invalid format");
        setClassData([]); // Ensure it's an array even on failure
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("Error fetching classes");
      setClassData([]); // Ensure it's an array on error
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader]); // Dependency on setIsLoader

  // Fetch Student Data
  const fetchAllStudents = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents();
      if (response?.success && Array.isArray(response?.students?.data)) {
        setStudentData(response?.students?.data);
        setFilteredStudentData(response?.students?.data); // Initially show all
      } else {
        toast.error("Failed to fetch students or invalid format");
        setStudentData([]);
        setFilteredStudentData([]);
      }
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Error fetching students");
      setStudentData([]);
      setFilteredStudentData([]);
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader]); // Dependency on setIsLoader

  // Initial data fetching on component mount
  useEffect(() => {
    fetchAllClasses();
    fetchAllStudents();
  }, [fetchAllClasses, fetchAllStudents]); // Add fetch functions as dependencies

  // --- Filtering Logic ---

  // Filter students whenever dependencies change
  useEffect(() => {
    console.log("studentData",studentData)
    let filtered = studentData;

    // Filter by Class
    if (selectedClass) {
      filtered = filtered.filter(student => student.class === selectedClass);
    }

    // Filter by Section (only if a class is selected)
    if (selectedClass && selectedSection) {
      filtered = filtered.filter(student => student.section === selectedSection);
    }

    // Filter by Name
    if (filterName) {
      const lowerCaseFilterName = filterName.toLowerCase();
      // Use studentName as per your data structure
      filtered = filtered.filter(student =>
        student.studentName?.toLowerCase().includes(lowerCaseFilterName)
      );
    }
// console.log("filtered",filtered)
    setFilteredStudentData(filtered);

  }, [selectedClass, selectedSection, filterName, studentData]); // Dependencies for filtering

  // --- Event Handlers ---

  const handleFilterByNameChange = (e) => {
    setFilterName(e.target.value);
  };

  const handleClassChange = (e) => {
    const newClass = e.target.value;
    setSelectedClass(newClass);
    setSelectedSection(""); // Reset section when class changes
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
  };

  // --- Dropdown Options ---

  // Prepare class options for ReactSelect
  const classOptions = classData.map(cls => ({
    label: cls.className, // Use className from your data structure
    value: cls.className,
  }));

  // Prepare section options based on selected class
  const selectedClassObj = classData.find(cls => cls.className === selectedClass);
  const sectionOptions = selectedClassObj?.sections?.map(sec => ({
    label: sec,
    value: sec,
  })) || [];

  // --- PDF Generation ---

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: `ID Cards - ${selectedClass || 'All'} ${selectedSection || ''}`, // Dynamic title
    onBeforeGetContent: () => {
      // Optional: Add any temporary changes needed just before printing
      return Promise.resolve();
    },
    onAfterPrint: () => {
      toast.success("PDF Generated/Printed Successfully!");
    },
    // Consider adding error handling if useReactToPrint supports it
  });


  return (
    <>
      <Box sx={{ padding: 2 }}> {/* Add some padding around the controls */}
        <Typography variant="h5" gutterBottom>
          Generate Student ID Cards
        </Typography>

        {/* Filter Controls */}
        <Grid container spacing={2} sx={{ marginBottom: 3 }}>
          {/* Class Select */}
          <Grid item xs={12} sm={6} md={3}>
            <ReactSelect
              name="class"
              value={selectedClass}
              handleChange={handleClassChange}
              label="Select Class"
              dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} // Add "All" option
              placeholder="Select Class" // Add placeholder
            />
          </Grid>

          {/* Section Select */}
          <Grid item xs={12} sm={6} md={3}>
            <ReactSelect
              name="section"
              value={selectedSection}
              handleChange={handleSectionChange}
              label="Select Section"
              dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} // Add "All" option
              disabled={!selectedClass || sectionOptions.length === 0} // Disable if no class or no sections
              placeholder="Select Section" // Add placeholder
            />
          </Grid>

          {/* Name Filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              id="filter-name"
              label="Filter by Name"
              variant="outlined" // Using outlined for consistency, change if needed
              type="text"
              onChange={handleFilterByNameChange}
              value={filterName}
              fullWidth
            />
          </Grid>

          {/* Download Button */}
          <Grid item xs={12} sm={6} md={3}>
            <Button
              variant="contained"
              onClick={generatePDF}
              style={{ backgroundColor: currentColor }} // Use context color
              fullWidth
              disabled={filteredStudentData.length === 0} // Disable if no data to print
              sx={{ height: '100%' }} // Make button height match textfield/select
            >
              Download PDF
            </Button>
          </Grid>
        </Grid>

        {/* ID Card Display Area */}
        {/* Important: Wrap the content to be printed in the ref element */}
        <div ref={componentPDF}>
          <div className="id-card-container flex flex-wrap justify-center gap-4 sm:gap-2 md:gap-3 lg:gap-4">
            {filteredStudentData.length > 0 ? (
               filteredStudentData.map((student, index) => (
                <div
                  key={student._id || index} // Use a unique key like student._id
                  className="id-card"
                  style={{
                    backgroundImage: `url(${bg})`,
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    width: "54mm", // Standard ID card width
                    height: "86mm", // Standard ID card height
                    position: "relative",
                    backgroundSize: "cover",
                    border: "1px solid #ccc", // Light border for visibility
                    overflow: "hidden", // Hide content overflowing the card boundaries
                     pageBreakInside: "avoid", // Try to keep card on one page when printing
                  }}
                >
                  {/* Student Image */}
                   <div
                      style={{
                          position: "absolute",
                          // Adjust positioning based on your background image (bg) template
                          left: "66px", // Example value, adjust as needed
                          top: "105px",  // Example value, adjust as needed
                          width: "85px",  // Example value, adjust as needed
                          height: "95px", // Example value, adjust as needed
                          border: "0.5px solid #ff0000", // Example border, adjust style/color
                          borderRadius: "4px",
                          overflow: "hidden",
                      }}
                  >
                      <img
                          src={student.studentImage?.url || '/path/to/default/avatar.png'} // Provide a fallback image
                          alt={`${student.studentName} profile`}
                          style={{ width: "100%", height: "100%", objectFit: 'cover' }} // Use objectFit
                          // onError={(e) => e.target.src='/path/to/default/avatar.png'} // Handle broken images
                      />
                  </div>


                  {/* Student Details */}
                  {/* Adjust top/left positioning based on your background image template */}
                  {/* <div style={{ position: "absolute", left: "13px", top: "230px", width: "calc(100% - 10px)", paddingRight: "5px" }}>
                    
                    <p style={idCardTextStyle}>
                      NAME <span style={idCardValueStyle}>: {student.studentName?.slice(0, 18)}</span>
                    </p>
                    <p style={idCardTextStyle}>
                      CLASS <span style={idCardValueStyle}>: {student.class} {student.section ? `- ${student.section}` : ''}</span>
                    </p>
                    <p style={idCardTextStyle}>
                      F.NAME <span style={idCardValueStyle}>: {student.fatherName?.slice(0, 15)}</span>
                    </p>
                    <p style={idCardTextStyle}>
                      PHONE <span style={idCardValueStyle}>: {student.contact ? `+91${student.contact}` : 'N/A'}</span>
                    </p>
                    <p style={idCardTextStyle}>
                      ADDRESS <span style={idCardValueStyle}>: {student.address?.slice(0, 25)}</span>
                    </p>
                    
                </div> */}
                <table style={{
  position: "absolute",
  left: "10px",
  top: "212px",
  width: "calc(100% - 10px)",
  paddingRight: "5px",
  fontSize: "12px",
  textTransform: "uppercase",
  fontWeight: "bold",
  lineHeight: "1.1",
  fontFamily: "Arial, sans-serif"
}}>
  <tbody>
    <tr>
      <td style={idCardTextStyle}>Name</td>
      <td style={idCardValueStyle}>: {student.studentName}</td>
    </tr>
    <tr>
      <td style={idCardTextStyle}>Class</td>
      <td style={idCardValueStyle}>: {student.class} {student.section ? `- ${student.section}` : ''}</td>
    </tr>
    <tr>
      <td style={idCardTextStyle}>F.Name</td>
      <td style={idCardValueStyle}>: {student.fatherName}</td>
    </tr>
    <tr>
      <td style={idCardTextStyle}>DOB</td>
      <td style={idCardValueStyle}>: {moment(student.dateOfBirth).format("DD/MM/YYYY")}</td>
    </tr>
    <tr>
      <td style={idCardTextStyle}>Phone</td>
      <td style={idCardValueStyle}>: {student.contact ? `${student.contact}` : 'N/A'}</td>
    </tr>
    <tr>
      <td style={idCardTextStyle}>Address</td>
      <td style={idCardValueStyle}>: {student.address}</td>
    </tr>
  </tbody>
</table>


                </div>
              ))
            ) : (
                <Typography sx={{textAlign: 'center', width: '100%', marginTop: 5}}>
                    No students found matching the criteria.
                </Typography>
            )}
          </div>
        </div> {/* End of ref={componentPDF} */}
      </Box> {/* End of outer padding Box */}

      {/* Print-specific CSS (can be kept as is or moved to a global CSS file) */}
      <style jsx>{`
        @media print {
          @page {
            size: A4 landscape; /* Landscape layout */
            margin-top: 20px; /* Minimal margin for better spacing */
          }

          .id-card-container {
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
            padding:10px
          }

          .id-card {
            page-break-inside: avoid; /* Prevents breaking the card */
          }

          .page-break {
            page-break-after: always; /* Forces page break after 10 cards */
          }
        }
      `}</style>

    </>
  );
};

// Helper function for consistent text styling on the ID card
// const idCardTextStyle = {
//   fontSize: "12px",
//   textTransform: "uppercase",
//   // color: "white", // Adjust color based on your background
//   fontWeight: "bold",
//   margin: "2px 0", // Adjust vertical spacing
//   lineHeight: "1.1",
//   whiteSpace: "wrap", // Prevent wrapping for labels
//   // whiteSpace: "nowrap", // Prevent wrapping for labels
//   overflow: "hidden",
//   textOverflow: "ellipsis", // Add ellipsis if text is too long
// };

// const idCardValueStyle = {
  
//   marginLeft: "4px", // Space between label and value
//   // fontWeight: "normal", // Value might not need to be bold
//   fontWeight: "Bold", // Value might not need to be bold
//   // Allow value to wrap if needed, or use slice as done in the component
//   fontFamily: "Arial, sans-serif", 
  
// };

const idCardTextStyle = {
  fontSize: "8px",
  textTransform: "uppercase",
  fontWeight: "bold",
  // margin: "2px 0",
  lineHeight: "1.1",
  whiteSpace: "nowrap",
  overflow: "hidden",
  textOverflow: "ellipsis",
  verticalAlign: "top"
};

const idCardValueStyle = {
  fontWeight: "bold",
  fontSize: "8px",
  fontFamily: "Arial, sans-serif",
  // paddingLeft: "4px",
  display: "inline-block",
  verticalAlign: "top",
  maxWidth: "120px", // optional
  wordWrap: "break-word",
  whiteSpace: "normal", // allow wrapping
};


export default IdCard;






// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg";
// import { ActiveStudents, AdminGetAllClasses } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";

// const IdCard = () => {
//   const { currentColor, setIsLoader } = useStateContext();
//   const [studentData, setStudentData] = useState([]);
//   const [classData, setClassData] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");
//   const componentPDF = useRef();

//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success && Array.isArray(response.classes)) {
//         setClassData(response.classes);
//       } else {
//         toast.error("Failed to fetch classes or invalid format");
//         setClassData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("Error fetching classes");
//       setClassData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   const fetchAllStudents = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents();
//       if (response?.success && Array.isArray(response?.students?.data)) {
//         setStudentData(response?.students?.data);
//         setFilteredStudentData(response?.students?.data);
//       } else {
//         toast.error("Failed to fetch students or invalid format");
//         setStudentData([]);
//         setFilteredStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("Error fetching students");
//       setStudentData([]);
//       setFilteredStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]);

//   useEffect(() => {
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchAllClasses, fetchAllStudents]);

//   useEffect(() => {
//     let filtered = studentData;
//     if (selectedClass) {
//       filtered = filtered.filter(student => student.class === selectedClass);
//     }
//     if (selectedClass && selectedSection) {
//       filtered = filtered.filter(student => student.section === selectedSection);
//     }
//     if (filterName) {
//       const lowerCaseFilterName = filterName.toLowerCase();
//       filtered = filtered.filter(student =>
//         student.studentName?.toLowerCase().includes(lowerCaseFilterName)
//       );
//     }
//     setFilteredStudentData(filtered);
//   }, [selectedClass, selectedSection, filterName, studentData]);

//   const handleFilterByNameChange = (e) => setFilterName(e.target.value);
//   const handleClassChange = (e) => {
//     setSelectedClass(e.target.value);
//     setSelectedSection("");
//   };
//   const handleSectionChange = (e) => setSelectedSection(e.target.value);

//   const classOptions = classData.map(cls => ({
//     label: cls.className,
//     value: cls.className,
//   }));

//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({
//     label: sec,
//     value: sec,
//   })) || [];

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID Cards - ${selectedClass || 'All'} ${selectedSection || ''}`,
//     onAfterPrint: () => {
//       toast.success("PDF Generated/Printed Successfully!");
//     }
//   });

//   return (
//     <>
//       <Box sx={{ padding: 2 }}>
//         <Typography variant="h5" gutterBottom>
//           Generate Student ID Cards
//         </Typography>

//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]}
//               placeholder="Select Class"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]}
//               disabled={!selectedClass || sectionOptions.length === 0}
//               placeholder="Select Section"
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined"
//               type="text"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//             />
//           </Grid>
//           <Grid item xs={12} sm={6} md={3}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor }}
//               fullWidth
//               disabled={filteredStudentData.length === 0}
//               sx={{ height: '100%' }}
//             >
//               Download PDF
//             </Button>
//           </Grid>
//         </Grid>

//         <div ref={componentPDF}>
//           <div className="id-card-container flex flex-wrap justify-center gap-4 sm:gap-2 md:gap-3 lg:gap-4">
//             {filteredStudentData.length > 0 ? (
//               filteredStudentData.map((student, index) => (
//                 <div
//                   key={student._id || index}
//                   className="id-card"
//                   style={{
//                     backgroundImage: `url(${bg})`,
//                     backgroundPosition: "center",
//                     backgroundRepeat: "no-repeat",
//                     width: "54mm",
//                     height: "86mm",
//                     position: "relative",
//                     backgroundSize: "cover",
//                     border: "1px solid #ccc",
//                     overflow: "hidden",
//                     pageBreakInside: "avoid",
//                   }}
//                 >
//                   <div
//                     style={{
//                       position: "absolute",
//                       left: "40px",
//                       top: "92px",
//                       width: "85px",
//                       height: "95px",
//                       border: "0.5px solid #ff0000",
//                       borderRadius: "4px",
//                       overflow: "hidden",
//                     }}
//                   >
//                     <img
//                       src={student.studentImage?.url || '/path/to/default/avatar.png'}
//                       alt={`${student.studentName} profile`}
//                       style={{ width: "100%", height: "100%", objectFit: 'cover' }}
//                     />
//                   </div>

//                   <div style={{ position: "absolute", left: "5px", top: "190px", width: "calc(100% - 10px)", paddingRight: "5px" }}>
//                     <p style={idCardTextStyle}>
//                       NAME <span style={idCardValueStyle}>: {student.studentName?.slice(0, 18)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       CLASS <span style={idCardValueStyle}>: {student.class} {student.section ? `- ${student.section}` : ''}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       F.NAME <span style={idCardValueStyle}>: {student.fatherName?.slice(0, 15)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       PHONE <span style={idCardValueStyle}>: {student.contact ? `+91${student.contact}` : 'N/A'}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       ADDRESS <span style={idCardValueStyle}>: {student.address?.slice(0, 25)}</span>
//                     </p>
//                   </div>
//                 </div>
//               ))
//             ) : (
//               <Typography sx={{ textAlign: 'center', width: '100%', marginTop: 5 }}>
//                 No students found matching the criteria.
//               </Typography>
//             )}
//           </div>
//         </div>
//       </Box>

//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape;
//             margin-top: 20px;
//           }
//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 15px;
//             padding: 10px;
//           }
//           .id-card {
//             page-break-inside: avoid;
//           }
//           .page-break {
//             page-break-after: always;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// const idCardTextStyle = {
//   fontSize: "6pt",
//   textTransform: "uppercase",
//   color: "white",
//   fontWeight: "bold",
//   margin: "2px 0",
//   lineHeight: "1.1",
//   whiteSpace: "nowrap",
//   overflow: "hidden",
//   textOverflow: "ellipsis",
// };

// const idCardValueStyle = {
//   marginLeft: "4px",
//   fontWeight: "normal",
// };

// export default IdCard;


// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider"; // Assuming ContextProvider provides setIsLoader and currentColor
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField, Typography, Box } from "@mui/material"; // Added Typography and Box for better layout
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg"; // Ensure this path is correct
// import { ActiveStudents, AdminGetAllClasses, getAllStudents } from "../../Network/AdminApi"; // Ensure these API functions are correct
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect"; // Ensure this component exists and works as expected
// import { toast } from "react-toastify";

// const IdCard = () => {
//   // Use context state
//   const { currentColor, setIsLoader } = useStateContext();

//   // State for data
//   const [studentData, setStudentData] = useState([]); // Full list of students
//   const [classData, setClassData] = useState([]); // Fetched class data (class name, sections, etc.)
//   const [filteredStudentData, setFilteredStudentData] = useState([]); // Students to display/print

//   // State for filters
//   const [filterName, setFilterName] = useState("");
//   const [selectedClass, setSelectedClass] = useState("");
//   const [selectedSection, setSelectedSection] = useState("");

//   // Ref for printing
//   const componentPDF = useRef();

//   // --- Data Fetching ---

//   // Fetch Class Data
//   const fetchAllClasses = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await AdminGetAllClasses();
//       if (response?.success && Array.isArray(response.classes)) {
//         // Use 'className' based on your provided structure
//         setClassData(response.classes);
//       } else {
//         toast.error("Failed to fetch classes or invalid format");
//         setClassData([]); // Ensure it's an array even on failure
//       }
//     } catch (error) {
//       console.error("Error fetching classes:", error);
//       toast.error("Error fetching classes");
//       setClassData([]); // Ensure it's an array on error
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]); // Dependency on setIsLoader

//   // Fetch Student Data
//   const fetchAllStudents = useCallback(async () => {
//     setIsLoader(true);
//     try {
//       const response = await ActiveStudents();
//       if (response?.success && Array.isArray(response?.students?.data)) {
//         setStudentData(response?.students?.data);
//         setFilteredStudentData(response?.students?.data); // Initially show all
//       } else {
//         toast.error("Failed to fetch students or invalid format");
//         setStudentData([]);
//         setFilteredStudentData([]);
//       }
//     } catch (error) {
//       console.error("Error fetching students:", error);
//       toast.error("Error fetching students");
//       setStudentData([]);
//       setFilteredStudentData([]);
//     } finally {
//       setIsLoader(false);
//     }
//   }, [setIsLoader]); // Dependency on setIsLoader

//   // Initial data fetching on component mount
//   useEffect(() => {
//     fetchAllClasses();
//     fetchAllStudents();
//   }, [fetchAllClasses, fetchAllStudents]); // Add fetch functions as dependencies

//   // --- Filtering Logic ---

//   // Filter students whenever dependencies change
//   useEffect(() => {
//     console.log("studentData",studentData)
//     let filtered = studentData;

//     // Filter by Class
//     if (selectedClass) {
//       filtered = filtered.filter(student => student.class === selectedClass);
//     }

//     // Filter by Section (only if a class is selected)
//     if (selectedClass && selectedSection) {
//       filtered = filtered.filter(student => student.section === selectedSection);
//     }

//     // Filter by Name
//     if (filterName) {
//       const lowerCaseFilterName = filterName.toLowerCase();
//       // Use studentName as per your data structure
//       filtered = filtered.filter(student =>
//         student.studentName?.toLowerCase().includes(lowerCaseFilterName)
//       );
//     }
// console.log("filtered",filtered)
//     setFilteredStudentData(filtered);

//   }, [selectedClass, selectedSection, filterName, studentData]); // Dependencies for filtering

//   // --- Event Handlers ---

//   const handleFilterByNameChange = (e) => {
//     setFilterName(e.target.value);
//   };

//   const handleClassChange = (e) => {
//     const newClass = e.target.value;
//     setSelectedClass(newClass);
//     setSelectedSection(""); // Reset section when class changes
//   };

//   const handleSectionChange = (e) => {
//     setSelectedSection(e.target.value);
//   };

//   // --- Dropdown Options ---

//   // Prepare class options for ReactSelect
//   const classOptions = classData.map(cls => ({
//     label: cls.className, // Use className from your data structure
//     value: cls.className,
//   }));

//   // Prepare section options based on selected class
//   const selectedClassObj = classData.find(cls => cls.className === selectedClass);
//   const sectionOptions = selectedClassObj?.sections?.map(sec => ({
//     label: sec,
//     value: sec,
//   })) || [];

//   // --- PDF Generation ---

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: `ID Cards - ${selectedClass || 'All'} ${selectedSection || ''}`, // Dynamic title
//     onBeforeGetContent: () => {
//       // Optional: Add any temporary changes needed just before printing
//       return Promise.resolve();
//     },
//     onAfterPrint: () => {
//       toast.success("PDF Generated/Printed Successfully!");
//     },
//     // Consider adding error handling if useReactToPrint supports it
//   });


//   return (
//     <>
//       <Box sx={{ padding: 2 }}> {/* Add some padding around the controls */}
//         <Typography variant="h5" gutterBottom>
//           Generate Student ID Cards
//         </Typography>

//         {/* Filter Controls */}
//         <Grid container spacing={2} sx={{ marginBottom: 3 }}>
//           {/* Class Select */}
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="class"
//               value={selectedClass}
//               handleChange={handleClassChange}
//               label="Select Class"
//               dynamicOptions={[{ label: "All Classes", value: "" }, ...classOptions]} // Add "All" option
//               placeholder="Select Class" // Add placeholder
//             />
//           </Grid>

//           {/* Section Select */}
//           <Grid item xs={12} sm={6} md={3}>
//             <ReactSelect
//               name="section"
//               value={selectedSection}
//               handleChange={handleSectionChange}
//               label="Select Section"
//               dynamicOptions={[{ label: "All Sections", value: "" }, ...sectionOptions]} // Add "All" option
//               disabled={!selectedClass || sectionOptions.length === 0} // Disable if no class or no sections
//               placeholder="Select Section" // Add placeholder
//             />
//           </Grid>

//           {/* Name Filter */}
//           <Grid item xs={12} sm={6} md={3}>
//             <TextField
//               id="filter-name"
//               label="Filter by Name"
//               variant="outlined" // Using outlined for consistency, change if needed
//               type="text"
//               onChange={handleFilterByNameChange}
//               value={filterName}
//               fullWidth
//             />
//           </Grid>

//           {/* Download Button */}
//           <Grid item xs={12} sm={6} md={3}>
//             <Button
//               variant="contained"
//               onClick={generatePDF}
//               style={{ backgroundColor: currentColor }} // Use context color
//               fullWidth
//               disabled={filteredStudentData.length === 0} // Disable if no data to print
//               sx={{ height: '100%' }} // Make button height match textfield/select
//             >
//               Download PDF
//             </Button>
//           </Grid>
//         </Grid>

//         {/* ID Card Display Area */}
//         {/* Important: Wrap the content to be printed in the ref element */}
//         <div ref={componentPDF}>
//           <div className="id-card-container flex flex-wrap justify-center gap-4 sm:gap-2 md:gap-3 lg:gap-4">
//             {filteredStudentData.length > 0 ? (
//                filteredStudentData.map((student, index) => (
//                 <div
//                   key={student._id || index} // Use a unique key like student._id
//                   className="id-card"
//                   style={{
//                     backgroundImage: `url(${bg})`,
//                     backgroundPosition: "center",
//                     backgroundRepeat: "no-repeat",
//                     width: "54mm", // Standard ID card width
//                     height: "86mm", // Standard ID card height
//                     position: "relative",
//                     backgroundSize: "cover",
//                     border: "1px solid #ccc", // Light border for visibility
//                     overflow: "hidden", // Hide content overflowing the card boundaries
//                      pageBreakInside: "avoid", // Try to keep card on one page when printing
//                   }}
//                 >
//                   {/* Student Image */}
//                    <div
//                       style={{
//                           position: "absolute",
//                           // Adjust positioning based on your background image (bg) template
//                           left: "40px", // Example value, adjust as needed
//                           top: "92px",  // Example value, adjust as needed
//                           width: "85px",  // Example value, adjust as needed
//                           height: "95px", // Example value, adjust as needed
//                           border: "0.5px solid #ff0000", // Example border, adjust style/color
//                           borderRadius: "4px",
//                           overflow: "hidden",
//                       }}
//                   >
//                       <img
//                           src={student.studentImage?.url || '/path/to/default/avatar.png'} // Provide a fallback image
//                           alt={`${student.studentName} profile`}
//                           style={{ width: "100%", height: "100%", objectFit: 'cover' }} // Use objectFit
//                           // onError={(e) => e.target.src='/path/to/default/avatar.png'} // Handle broken images
//                       />
//                   </div>


//                   {/* Student Details */}
//                   {/* Adjust top/left positioning based on your background image template */}
//                   <div style={{ position: "absolute", left: "5px", top: "190px", width: "calc(100% - 10px)", paddingRight: "5px" }}>
//                     {/* Use studentName from API data */}
//                     <p style={idCardTextStyle}>
//                       NAME <span style={idCardValueStyle}>: {student.studentName?.slice(0, 18)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       CLASS <span style={idCardValueStyle}>: {student.class} {student.section ? `- ${student.section}` : ''}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       F.NAME <span style={idCardValueStyle}>: {student.fatherName?.slice(0, 15)}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       PHONE <span style={idCardValueStyle}>: {student.contact ? `+91${student.contact}` : 'N/A'}</span>
//                     </p>
//                     <p style={idCardTextStyle}>
//                       ADDRESS <span style={idCardValueStyle}>: {student.address?.slice(0, 25)}</span>
//                     </p>
                    
//                   </div>

//                 </div>
//               ))
//             ) : (
//                 <Typography sx={{textAlign: 'center', width: '100%', marginTop: 5}}>
//                     No students found matching the criteria.
//                 </Typography>
//             )}
//           </div>
//         </div> {/* End of ref={componentPDF} */}
//       </Box> {/* End of outer padding Box */}

//       {/* Print-specific CSS (can be kept as is or moved to a global CSS file) */}
//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape; /* Landscape layout */
//             margin-top: 20px; /* Minimal margin for better spacing */
//           }

//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 15px;
//             padding:10px
//           }

//           .id-card {
//             page-break-inside: avoid; /* Prevents breaking the card */
//           }

//           .page-break {
//             page-break-after: always; /* Forces page break after 10 cards */
//           }
//         }
//       `}</style>

//     </>
//   );
// };

// // Helper function for consistent text styling on the ID card
// const idCardTextStyle = {
//   fontSize: "6pt",
//   textTransform: "uppercase",
//   color: "white", // Adjust color based on your background
//   fontWeight: "bold",
//   margin: "2px 0", // Adjust vertical spacing
//   lineHeight: "1.1",
//   whiteSpace: "nowrap", // Prevent wrapping for labels
//   overflow: "hidden",
//   textOverflow: "ellipsis", // Add ellipsis if text is too long
// };

// const idCardValueStyle = {
//   marginLeft: "4px", // Space between label and value
//   fontWeight: "normal", // Value might not need to be bold
//   // Allow value to wrap if needed, or use slice as done in the component
// };


// export default IdCard;



// import React, { useEffect, useState, useRef, useCallback } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg";
// import { ActiveStudents, AdminGetAllClasses, getAllStudents } from "../../Network/AdminApi";
// import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
// import { toast } from "react-toastify";

// const IdCard = () => {
//   const { currentColor, setIsLoader,classes } = useStateContext();
//   const [filterName, setFilterName] = useState("");
//   const [filterClass, setFilterClass] = useState("");
//     const [getClass, setGetClass] = useState([]);
//   const [filteredStudentData, setFilteredStudentData] = useState([]);
//   const componentPDF = useRef();

//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     onBeforeGetContent: () => {
//       document.title = `All ID Cards`;
//     },
//     onAfterPrint: () => {
//       alert("PDF Downloaded Successfully!");
//       setTimeout(() => {
//         document.title = "OriginalTitle";
//       }, 100);
//     },
//   });

//   const [studentData, setStudentData] = useState([]);
// console.log("studentData",studentData)
//     const fetchAllClasses = useCallback(async () => {
//       setIsLoader(true);
//       try {
//         const response = await AdminGetAllClasses();
//         if (response?.success) {
//           setGetClass(response.classes || []);
//         } else {
//           toast.error("Failed to fetch classes");
//         }
//       } catch (error) {
//         toast.error("Error fetching classes");
//       } finally {
//         setIsLoader(false);
//       }
//     }, [setIsLoader]);
  
 
//   const allStudent = async () => {
//    try {
//     setIsLoader(true)
//     const response = await ActiveStudents();
//     if (response?.success) {
//       setIsLoader(false)
//       setStudentData(response?.students?.data);
//       setFilteredStudentData(response.allStudent);
//     }
//     else{
//       setIsLoader(false)
//     }
//    } catch (error) {
//     console.log("error",error)
//    }
//   };

//   useEffect(() => {
//     allStudent();
//     fetchAllClasses()
//   }, []);

//   const handleFilterByName = (e) => {
//     const value = e.target.value;
//     setFilterName(value);
//     filterStudents(filterClass, value);
//   };

//   const handleFilterByClass = (e) => {
//     const value = e.target.value;
//     setFilterClass(value);
//     filterStudents(value, filterName);
//   };

//   const filterStudents = (filterClass, nameFilter) => {
//     let filteredData = studentData;

//     if (filterClass) {
//       filteredData = filteredData.filter((student) =>
//         student.class.includes(filterClass.toLowerCase())
//       );
//     }

//     if (nameFilter) {
//       filteredData = filteredData.filter((student) =>
//         student.fullName.toLowerCase().includes(nameFilter.toLowerCase())
//       );
//     }

//     setFilteredStudentData(filteredData);
//   };


//   const [values, setValues] = useState({
//     class: "",
//     section: "",
//   });

//   // Handle Class Change
//   const handleClassChange = (e) => {
//     const selectedClass = e.target.value;
//     setValues((prev) => ({
//       ...prev,
//       class: selectedClass,
//       section: "",
//     }));
//   };

//   // Handle Section Change
//   const handleSectionChange = (e) => {
//     setValues((prev) => ({
//       ...prev,
//       section: e.target.value,
//     }));
//   };

//   // Get sections based on selected class
//   const selectedClassObj = getClass?.find((cls) => cls.class === values.class);
//   const sections = selectedClassObj?.section || [];

//   return (
//     <>

//       <div>
//         <ReactSelect
//                       name="class"
//                       value={values?.class}
//                       handleChange={handleClassChange}
//                       label="class"
//                       dynamicOptions={classes?.map((val)=>({label:val?.class,value:val?.class}))}
                   
//                     />
//         <ReactSelect
//                       name="section"
//                       value={values?.section}
//                       handleChange={handleSectionChange}
//                       label="Section"
//                       dynamicOptions={sections?.map((val)=>({label:val,value:val}))}
                   
//                     />
//       <label htmlFor="classes">Select Class:</label>
//       <select id="classes" value={values.class} onChange={handleSectionChange}>
//         <option value="">Select Class</option>
//         {classes?.map((val, index) => (
//           <option key={index} value={val.class}>
//             {val.class}
//           </option>
//         ))}
//       </select>

//       {/* Section Dropdown */}
//       <label htmlFor="sections">Select Section:</label>
//       <select
//         id="sections"
//         value={values.section}
//         onChange={handleSectionChange}
//         disabled={!sections.length}
//       >
//         <option value="">Select Section</option>
//         {sections?.map((sec, index) => (
//           <option key={index} value={sec}>
//             {sec}
//           </option>
//         ))}
//       </select>

//       <p>
//         Selected Class: {values.class || "None"}, Selected Section:{" "}
//         {values.section || "None"}
//       </p>
// {/* 
// <label htmlFor="classes">Select Class:</label>
//       <select id="classes" value={values?.class} onChange={handleChange}>
//         <option value="">Select Class</option>
//         {classes.map((val, index) => (
//           <option key={index} value={val?.class}>
//             {val?.class}
//           </option>
//         ))}
//       </select> */}
//         <div className="mb-5">
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filter-class"
//                 label="Search by Class"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterByClass}
//                 value={filterClass}
//                 fullWidth
//               />
//             </Grid>

//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filter-name"
//                 label="Filter by Name"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterByName}
//                 value={filterName}
//                 fullWidth
//               />
//             </Grid>

//             <Grid item xs={12} sm={12} md={4}>
//               <Button
//                 variant="contained"
//                 onClick={generatePDF}
//                 style={{ backgroundColor: currentColor, width: "100%" }}
//               >
//                 Download PDF
//               </Button>
//             </Grid>
//           </Grid>
//         </div>

//         <div className="id-card-container  flex flex-wrap justify-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" ref={componentPDF}>
//           {filteredStudentData?.map((student, index) => (
//             <div
//               key={index}
//               className="id-card"
//               style={{
//                 backgroundImage: `url(${bg})`,
//                 backgroundPosition: "center",
//                 backgroundRepeat: "no-repeat",
//                 width: "54mm",
//                 height: "86mm",
//                 position: "relative",
//                 backgroundSize: "cover",
//                 border: "1px solid",
//               }}
//             >
//               <div
//                 style={{
//                   marginLeft: "40px",
//                   marginTop: "92px",
//                   width: "85px",
//                   height: "95px",
//                   border: "0.5px solid #ff0000",
//                   borderRadius: "4px",
//                   overflow: "hidden",
//                   position: "absolute",
//                 }}
//               >
//                 <img
//                   src={student.studentImage?.url}
//                   alt="Profile"
//                   style={{ width: "100%", height: "100%" }}
//                 />
//               </div>

//               <div
//                 style={{
//                   marginLeft: "40px",
//                   marginTop: "92px",
//                   width: "85px",
//                   height: "95px",
//                   border: "0.5px solid #ff0000",
//                   borderRadius: "4px",
//                   overflow: "hidden",
//                   position: "absolute",
//                 }}
//               >
//                 <img
//                   src={student.studentImage?.url}
//                   alt="Profile"
//                   style={{ width: "100%", height: "100%" }}
//                 />
//               </div>

//               <div style={{ position: "absolute", left: "3px", top: "190px" }}>
//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     textTransform: "uppercase",
//                     marginTop: "8px",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   NAME{" "}
//                   <span style={{ marginLeft: "16px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.fullName?.slice(0, 15)}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     textTransform: "uppercase",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   CLASS{" "}
//                   <span style={{ marginLeft: "13px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.class}-{student.section}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   F.Name{" "}
//                   <span style={{ marginLeft: "9px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.fatherName?.slice(0, 10)}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Phone{" "}
//                   <span style={{ marginLeft: "12px", fontWeight: "bold" }}>
//                     {" "}
//                     : +91{student.contact}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Address{" "}
//                   <span style={{ marginLeft: "1px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.address}{" "}
//                   </span>
//                 </p>
//               </div>
//               {/* Page Break after every 10 items */}
//               {(index + 1) % 10 === 0 && <div className="page-break" />}
//             </div>
//           ))}
//         </div>
//       </div>

//       {/* Print-specific CSS */}
//       <style jsx>{`
//         @media print {
//           @page {
//             size: A4 landscape; /* Landscape layout */
//             margin: 10mm; /* Minimal margin for better spacing */
//           }

//           .id-card-container {
//             display: flex;
//             flex-wrap: wrap;
//             gap: 5px;
//             padding:10px
//           }

//           .id-card {
//             page-break-inside: avoid; /* Prevents breaking the card */
//           }

//           .page-break {
//             page-break-after: always; /* Forces page break after 10 cards */
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default IdCard;



// import React, { useEffect, useState, useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { Button, Grid, TextField } from "@mui/material";
// import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg";
// import { getAllStudents } from "../../Network/AdminApi";
// const IdCard = () => {
//   const { currentColor } = useStateContext();
//   const [filterName, setFilterName] = useState("");
//   const [filterClass, setFilterClass] = useState("");
//   const [filteredStudentData, setFilterdStudentData] = useState([]);
//   const componentPDF = useRef();
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     onBeforeGetContent: () => {
//       document.title = `All ID Card`;
//     },
//     onAfterPrint: () => {
//       alert("modalData saved in PDF");
//       setTimeout(() => {
//         document.title = "OriginalTitle";
//       }, 100);
//     },
//   });

//   const [studentData, setStudentData] = useState([]);
//   const allStudent = async () => {
//     const response = await getAllStudents();
//     if (response?.success) {
//       setStudentData(response?.allStudent);
//       setFilterdStudentData(response.allStudent);
//     }
    
//   };
//   useEffect(() => {
//     allStudent();
//   }, []);

//   const handleFilterbyname = (e) => {
//     const value = e.target.value;
//     setFilterName(value);
//     filterStudents(filterClass, value);
//   };

//   const handleFilterByClass = (e) => {
//     let value = e.target.value;
//     setFilterClass(value);
//     filterStudents(value, filterName);
//   };

//   const filterStudents = (filterClass, nameFilter) => {
//     let filteredData = studentData;

//     if (filterClass) {
//       filteredData = filteredData.filter((student) =>
//         student.class.includes(filterClass.toLowerCase())
//       );
//     }
//     if (nameFilter) {
//       filteredData = filteredData.filter((student) =>
//         student.fullName.toLowerCase().includes(nameFilter)
//       );
//     }
//     setFilterdStudentData(filteredData);
//   };

//   return (
//     <>
//       <div className="">
//         <div className="mb-5">
//           <Grid container spacing={2}>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filled-basic"
//                 label="searchBy class"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterByClass}
//                 value={filterClass}
//                 fullWidth
//               />
//             </Grid>
//             <Grid item xs={12} sm={6} md={4}>
//               <TextField
//                 id="filled-basic"
//                 label="filterBy Name"
//                 variant="filled"
//                 type="text"
//                 onChange={handleFilterbyname}
//                 value={filterName}
//                 fullWidth
//               />
//             </Grid>
//             <Grid item xs={12} sm={12} md={4}>
//               <Button
//                 variant="contained"
//                 onClick={generatePDF}
//                 style={{ backgroundColor: currentColor, width: "100%" }}
//                 className="h-12"
//               >
//                 Download
//               </Button>
//             </Grid>
//           </Grid>
//         </div>

//         <div className="w-full flex flex-wrap gap-2" ref={componentPDF}>
//           {filteredStudentData.map((student, index) => (
//             <div
//               style={{
//                 backgroundImage: `url(${bg})`,
//                 backgroundPosition: "center",
//                 backgroundRepeat: "no-repeat",
//                 width: "54mm",
//                 height: "86mm",
//                 position: "relative",
//                 backgroundSize: "cover",
//                 border: "1px solid",
//               }}
//             >
//               <div
//                 style={{
//                   marginLeft: "40px",
//                   marginTop: "92px",
//                   width: "85px",
//                   height: "95px",
//                   border: "0.5px solid #ff0000",
//                   borderRadius: "4px",
//                   overflow: "hidden",
//                   position: "absolute",
//                 }}
//               >
//                 <img
//                   src={student.studentImage?.url}
//                   alt="Profile"
//                   style={{ width: "100%", height: "100%" }}
//                 />
//               </div>

//               <div style={{ position: "absolute", left: "3px", top: "190px" }}>
//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     textTransform: "uppercase",
//                     marginTop: "8px",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   NAME{" "}
//                   <span style={{ marginLeft: "16px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.fullName?.slice(0, 15)}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     textTransform: "uppercase",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                   }}
//                 >
//                   CLASS{" "}
//                   <span style={{ marginLeft: "13px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.class}-{student.section}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   F.Name{" "}
//                   <span style={{ marginLeft: "9px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.fatherName?.slice(0, 10)}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Phone{" "}
//                   <span style={{ marginLeft: "12px", fontWeight: "bold" }}>
//                     {" "}
//                     : +91{student.contact}{" "}
//                   </span>
//                 </p>

//                 <p
//                   style={{
//                     fontSize: "6pt",
//                     marginTop: "4px",
//                     color: "white",
//                     fontWeight: "bold",
//                     textTransform: "uppercase",
//                   }}
//                 >
//                   Address{" "}
//                   <span style={{ marginLeft: "1px", fontWeight: "bold" }}>
//                     {" "}
//                     : {student.address}{" "}
//                   </span>
//                 </p>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

// export default IdCard;
