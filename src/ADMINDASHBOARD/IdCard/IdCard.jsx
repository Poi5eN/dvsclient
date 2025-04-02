import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import { useReactToPrint } from "react-to-print";
import { Button, Grid, TextField } from "@mui/material";
import bg from "../../ShikshMitraWebsite/IDCARDBG.jpg";
import { getAllStudents } from "../../Network/AdminApi";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";

const IdCard = () => {
  const { currentColor, setIsLoader,classes } = useStateContext();
  const [filterName, setFilterName] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filteredStudentData, setFilteredStudentData] = useState([]);
  const componentPDF = useRef();

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    onBeforeGetContent: () => {
      document.title = `All ID Cards`;
    },
    onAfterPrint: () => {
      alert("PDF Downloaded Successfully!");
      setTimeout(() => {
        document.title = "OriginalTitle";
      }, 100);
    },
  });

  const [studentData, setStudentData] = useState([]);

  const allStudent = async () => {
   try {
    setIsLoader(true)
    const response = await getAllStudents();
    if (response?.success) {
      setIsLoader(false)
      setStudentData(response?.allStudent);
      setFilteredStudentData(response.allStudent);
    }
    else{
      setIsLoader(false)
    }
   } catch (error) {
    console.log("error",error)
   }
  };

  useEffect(() => {
    allStudent();
  }, []);

  const handleFilterByName = (e) => {
    const value = e.target.value;
    setFilterName(value);
    filterStudents(filterClass, value);
  };

  const handleFilterByClass = (e) => {
    const value = e.target.value;
    setFilterClass(value);
    filterStudents(value, filterName);
  };

  const filterStudents = (filterClass, nameFilter) => {
    let filteredData = studentData;

    if (filterClass) {
      filteredData = filteredData.filter((student) =>
        student.class.includes(filterClass.toLowerCase())
      );
    }

    if (nameFilter) {
      filteredData = filteredData.filter((student) =>
        student.fullName.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    setFilteredStudentData(filteredData);
  };

  // const [values, setValue] = useState({
  //   class: "",
  //   section:""
  // });

  // const handleChange = (e) => {
  //   setValue(e.target.value);
  //   console.log("Selected Class:", e.target.value);
  // };


  const [values, setValues] = useState({
    class: "",
    section: "",
  });

  // Handle Class Change
  const handleClassChange = (e) => {
    const selectedClass = e.target.value;
    setValues((prev) => ({
      ...prev,
      class: selectedClass,
      section: "",
    }));
  };

  // Handle Section Change
  const handleSectionChange = (e) => {
    setValues((prev) => ({
      ...prev,
      section: e.target.value,
    }));
  };

  // Get sections based on selected class
  const selectedClassObj = classes.find((cls) => cls.class === values.class);
  const sections = selectedClassObj?.section || [];

  return (
    <>

      <div>
        <ReactSelect
                      name="class"
                      value={values?.class}
                      handleChange={handleClassChange}
                      label="class"
                      dynamicOptions={classes?.map((val)=>({label:val?.class,value:val?.class}))}
                   
                    />
        <ReactSelect
                      name="section"
                      value={values?.section}
                      handleChange={handleSectionChange}
                      label="Section"
                      dynamicOptions={sections?.map((val)=>({label:val,value:val}))}
                   
                    />
      <label htmlFor="classes">Select Class:</label>
      <select id="classes" value={values.class} onChange={handleSectionChange}>
        <option value="">Select Class</option>
        {classes.map((val, index) => (
          <option key={index} value={val.class}>
            {val.class}
          </option>
        ))}
      </select>

      {/* Section Dropdown */}
      <label htmlFor="sections">Select Section:</label>
      <select
        id="sections"
        value={values.section}
        onChange={handleSectionChange}
        disabled={!sections.length}
      >
        <option value="">Select Section</option>
        {sections.map((sec, index) => (
          <option key={index} value={sec}>
            {sec}
          </option>
        ))}
      </select>

      <p>
        Selected Class: {values.class || "None"}, Selected Section:{" "}
        {values.section || "None"}
      </p>
{/* 
<label htmlFor="classes">Select Class:</label>
      <select id="classes" value={values?.class} onChange={handleChange}>
        <option value="">Select Class</option>
        {classes.map((val, index) => (
          <option key={index} value={val?.class}>
            {val?.class}
          </option>
        ))}
      </select> */}
        <div className="mb-5">
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="filter-class"
                label="Search by Class"
                variant="filled"
                type="text"
                onChange={handleFilterByClass}
                value={filterClass}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={6} md={4}>
              <TextField
                id="filter-name"
                label="Filter by Name"
                variant="filled"
                type="text"
                onChange={handleFilterByName}
                value={filterName}
                fullWidth
              />
            </Grid>

            <Grid item xs={12} sm={12} md={4}>
              <Button
                variant="contained"
                onClick={generatePDF}
                style={{ backgroundColor: currentColor, width: "100%" }}
              >
                Download PDF
              </Button>
            </Grid>
          </Grid>
        </div>

        <div className="id-card-container  flex flex-wrap justify-center sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" ref={componentPDF}>
          {filteredStudentData.map((student, index) => (
            <div
              key={index}
              className="id-card"
              style={{
                backgroundImage: `url(${bg})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                width: "54mm",
                height: "86mm",
                position: "relative",
                backgroundSize: "cover",
                border: "1px solid",
              }}
            >
              <div
                style={{
                  marginLeft: "40px",
                  marginTop: "92px",
                  width: "85px",
                  height: "95px",
                  border: "0.5px solid #ff0000",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "absolute",
                }}
              >
                <img
                  src={student.studentImage?.url}
                  alt="Profile"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              {/* <div
                style={{
                  position: "absolute",
                  left: "3px",
                  top: "190px",
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "6pt",
                }}
              >
                <p  style={{
                    fontSize: "6pt",
                    textTransform: "uppercase",
                    marginTop: "8px",
                    color: "white",
                    fontWeight: "bold",
                  }}>NAME : {student.fullName?.slice(0, 15)}</p>
                <p >CLASS : {student.class}-{student.section}</p>
                <p>F.Name : {student.fatherName?.slice(0, 10)}</p>
                <p>Phone : +91{student.contact}</p>
                <p>Address : {student.address}</p>
              </div> */}
              <div
                style={{
                  marginLeft: "40px",
                  marginTop: "92px",
                  width: "85px",
                  height: "95px",
                  border: "0.5px solid #ff0000",
                  borderRadius: "4px",
                  overflow: "hidden",
                  position: "absolute",
                }}
              >
                <img
                  src={student.studentImage?.url}
                  alt="Profile"
                  style={{ width: "100%", height: "100%" }}
                />
              </div>

              <div style={{ position: "absolute", left: "3px", top: "190px" }}>
                <p
                  style={{
                    fontSize: "6pt",
                    textTransform: "uppercase",
                    marginTop: "8px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  NAME{" "}
                  <span style={{ marginLeft: "16px", fontWeight: "bold" }}>
                    {" "}
                    : {student.fullName?.slice(0, 15)}{" "}
                  </span>
                </p>

                <p
                  style={{
                    fontSize: "6pt",
                    textTransform: "uppercase",
                    marginTop: "4px",
                    color: "white",
                    fontWeight: "bold",
                  }}
                >
                  CLASS{" "}
                  <span style={{ marginLeft: "13px", fontWeight: "bold" }}>
                    {" "}
                    : {student.class}-{student.section}{" "}
                  </span>
                </p>

                <p
                  style={{
                    fontSize: "6pt",
                    marginTop: "4px",
                    color: "white",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  F.Name{" "}
                  <span style={{ marginLeft: "9px", fontWeight: "bold" }}>
                    {" "}
                    : {student.fatherName?.slice(0, 10)}{" "}
                  </span>
                </p>

                <p
                  style={{
                    fontSize: "6pt",
                    marginTop: "4px",
                    color: "white",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  Phone{" "}
                  <span style={{ marginLeft: "12px", fontWeight: "bold" }}>
                    {" "}
                    : +91{student.contact}{" "}
                  </span>
                </p>

                <p
                  style={{
                    fontSize: "6pt",
                    marginTop: "4px",
                    color: "white",
                    fontWeight: "bold",
                    textTransform: "uppercase",
                  }}
                >
                  Address{" "}
                  <span style={{ marginLeft: "1px", fontWeight: "bold" }}>
                    {" "}
                    : {student.address}{" "}
                  </span>
                </p>
              </div>
              {/* Page Break after every 10 items */}
              {(index + 1) % 10 === 0 && <div className="page-break" />}
            </div>
          ))}
        </div>
      </div>

      {/* Print-specific CSS */}
      <style jsx>{`
        @media print {
          @page {
            size: A4 landscape; /* Landscape layout */
            margin: 10mm; /* Minimal margin for better spacing */
          }

          .id-card-container {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
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

export default IdCard;



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
