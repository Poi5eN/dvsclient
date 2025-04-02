import React, { useState, useEffect } from "react";
import Tables from "../../Dynamic/Tables";
import useCustomQuery from "../../useCustomQuery";

import axios from "axios";

const Udise = () => {
  const authToken = localStorage.getItem("token");
  const [submittedData, setSubmittedData] = useState([]);
  const [bodyData, setBodyData] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state
  
  const {
    queryData: studentData,
    error: studentError,
    loading: studentLoading,
  } = useCustomQuery(
    "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents"
  );

  useEffect(() => {
    if (studentData) {
      const transformedData = studentData.allStudent.map((student, index) => ({
        id: student._id,
        index: index,
        fullName: student.fullName,
        class: student.class,
        bpl: student.udisePlusDetails?.is_bpl ? "Yes" : "No",
        aadhar: student.udisePlusDetails?.aadhar_no,
        scrollership: student.udisePlusDetails?.name_central_scholarship || "N/A",
        pan: "N/A",
        category: student.udisePlusDetails?.category,
        motherTougue: student.udisePlusDetails?.mothere_tougue,
        minority: student.udisePlusDetails?.minority,
        sld_type: student.udisePlusDetails?.SLD_type,
        resultPreExam: student.udisePlusDetails?.result_pre_exam,
      }));

      setBodyData(transformedData);
      setSubmittedData(studentData.allStudent);

      const classes = Array.from(
        new Set(studentData.allStudent.map((student) => student.class))
      ).sort();
      setAvailableClasses(classes);
    }
  }, [studentData]);

  const THEAD = [
    "Select",
    "S.No.",
    "Student Name",
    "Class",
    "BPL",
    "Aadhar",
    "Scrollership",
    "PAN",
    "Category",
    "Mother Tongue",
    "Minority",
    "Sld_type",
    "Result preExam",
  ];

  const [selectedColumn, setSelectedColumn] = useState("BPL");
  const [selectedValue, setSelectedValue] = useState("Yes");

  const handleRowSelection = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedRows([]);
    } else {
      setSelectedRows(bodyData.map((_, index) => index));
    }
    setSelectAll(!selectAll);
  };
  const updateSelectedRows = async () => {
    if (selectedRows.length === 0) {
      console.warn("No rows selected for update.");
      return;
    }

    setLoading(true); // Set loading to true before making the API request

    const selectedStudentIds = selectedRows.map((index) => bodyData[index].id);
    let updateFields = {};

    if (selectedColumn === "BPL") {
      updateFields["udisePlusDetails.is_bpl"] = selectedValue === "Yes" ? true : false;
    } else if (selectedColumn === "Class") {
       updateFields["class"] = selectedValue;
    } else if (selectedColumn === "Category") {
      updateFields["udisePlusDetails.category"] = selectedValue;
    }

   

    const requestBody = {
      studentIds: selectedStudentIds,
      updateFields: updateFields,
    };


    try {
      const response = await axios.put(
        "https://eserver-i5sm.onrender.com/api/v1/adminRoute/bulkUpdateStudents",
        requestBody,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("Update successful:", response.data);

      // Update local state
      setBodyData((prevData) =>
        prevData.map((row) =>
          selectedRows.includes(row.index)
            ? { ...row, [selectedColumn.toLowerCase()]: selectedValue }
            : row
        )
      );
    } catch (error) {
      console.error("Error updating students:", error);
    } finally {
      setLoading(false); // Set loading to false after the API request is completed
      setSelectedRows([]);
      setSelectAll(false);
    }
  };
  
  return (
    <div>
        {loading && (
            <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-gray-200 bg-opacity-70 z-50">
              <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
      <div className="flex gap-4 mb-4">
        <select
          value={selectedColumn}
          onChange={(e) => setSelectedColumn(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {["BPL", "Class", "Category"].map((column) => (
            <option key={column} value={column}>
              {column}
            </option>
          ))}
        </select>

        <select
          value={selectedValue}
          onChange={(e) => setSelectedValue(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {selectedColumn === "BPL" && (
            <>
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </>
          )}
          {selectedColumn === "Class" &&
            availableClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          {selectedColumn === "Category" && (
            <>
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
            </>
          )}
        </select>

        <button
          onClick={updateSelectedRows}
          className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
        >
          Update
        </button>
      </div>

      <Tables
        thead={[
          {
            name: (
              <input
                type="checkbox"
                checked={selectAll}
                onChange={handleSelectAll}
              />
            ),
          },
          ...THEAD.slice(1),
        ]}
        tbody={bodyData.map((val) => ({
          select: (
            <input
              type="checkbox"
              checked={selectedRows.includes(val.index)}
              onChange={() => handleRowSelection(val.index)}
            />
          ),
          Sno: val.index + 1,
          "Student Name": val.fullName,
          Class: val.class,
          BPL: val.bpl,
          Aadhar: val.aadhar,
          Scrollership: val.scrollership,
          PAN: val.pan,
          Category: val.category,
          "Mother Tongue": val.motherTougue,
          Minority: val.minority,
          Sld_type: val.sld_type,
          "Result preExam": val.resultPreExam,
        }))}
      />
    </div>
  );
};

export default Udise;


// import React, { useState, useEffect } from "react";
// import Tables from "../../Dynamic/Tables";
// import useCustomQuery from "../../useCustomQuery";
// import Cookies from "js-cookie";
// import axios from "axios"; // Import axios for API call
// // import { useAuth } from "../../../contexts/AuthContext"; // Assuming your AuthContext path

// const Udise = () => {
//   const authToken = Cookies.get("token");
//   const [submittedData, setSubmittedData] = useState([]);
//   const [bodyData, setBodyData] = useState([]);
//   const [availableClasses, setAvailableClasses] = useState([]);
//   const [selectedRows, setSelectedRows] = useState([]);
//   const [selectAll, setSelectAll] = useState(false);
  
//   const {
//     queryData: studentData,
//     error: studentError,
//     loading: studentLoading,
//   } = useCustomQuery(
//     "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents"
//   );

//   useEffect(() => {
//     if (studentData) {
//       const transformedData = studentData.allStudent.map((student, index) => ({
//         id: student._id,
//         index: index,
//         fullName: student.fullName,
//         class: student.class,
//         bpl: student.udisePlusDetails?.is_bpl ? "Yes" : "No",
//         aadhar: student.udisePlusDetails?.aadhar_no,
//         scrollership: student.udisePlusDetails?.name_central_scholarship || "N/A",
//         pan: "N/A",
//         category: student.udisePlusDetails?.category,
//         motherTougue: student.udisePlusDetails?.mothere_tougue,
//         minority: student.udisePlusDetails?.minority,
//         sld_type: student.udisePlusDetails?.SLD_type,
//         resultPreExam: student.udisePlusDetails?.result_pre_exam,
//       }));

//       setBodyData(transformedData);
//       setSubmittedData(studentData.allStudent);

//       const classes = Array.from(
//         new Set(studentData.allStudent.map((student) => student.class))
//       ).sort();
//       setAvailableClasses(classes);
//     }
//   }, [studentData]);

//   const THEAD = [
//     "Select",
//     "S.No.",
//     "Student Name",
//     "Class",
//     "BPL",
//     "Aadhar",
//     "Scrollership",
//     "PAN",
//     "Category",
//     "Mother Tongue",
//     "Minority",
//     "Sld_type",
//     "Result preExam",
//   ];

//   const [selectedColumn, setSelectedColumn] = useState("BPL");
//   const [selectedValue, setSelectedValue] = useState("Yes");

//   const handleRowSelection = (index) => {
//     if (selectedRows.includes(index)) {
//       setSelectedRows(selectedRows.filter((i) => i !== index));
//     } else {
//       setSelectedRows([...selectedRows, index]);
//     }
//   };

//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedRows([]);
//     } else {
//       setSelectedRows(bodyData.map((_, index) => index));
//     }
//     setSelectAll(!selectAll);
//   };
//   const updateSelectedRows = async () => {
//     if (selectedRows.length === 0) {
//       console.warn("No rows selected for update.");
//       return;
//     }

//     const selectedStudentIds = selectedRows.map((index) => bodyData[index].id);
//     let updateFields = {};

//     if (selectedColumn === "BPL") {
//       updateFields["udisePlusDetails.is_bpl"] = selectedValue === "Yes" ? true : false;
//     } else if (selectedColumn === "Class") {
//        updateFields["class"] = selectedValue;
//     } else if (selectedColumn === "Category") {
//       updateFields["udisePlusDetails.category"] = selectedValue;
//     }

   

//     const requestBody = {
//       studentIds: selectedStudentIds,
//       updateFields: updateFields,
//     };


//     try {
//       const response = await axios.put(
//         "https://eserver-i5sm.onrender.com/api/v1/adminRoute/bulkUpdateStudents",
//         requestBody,
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
//             "Content-Type": "application/json",
//           },
//         }
//       );

//       console.log("Update successful:", response.data);

//       // Update local state
//       setBodyData((prevData) =>
//         prevData.map((row) =>
//           selectedRows.includes(row.index)
//             ? { ...row, [selectedColumn.toLowerCase()]: selectedValue }
//             : row
//         )
//       );
//     } catch (error) {
//       console.error("Error updating students:", error);
//     } finally {
//       setSelectedRows([]);
//       setSelectAll(false);
//     }
//   };

//   // const updateSelectedRows = async () => {
//   //   if (selectedRows.length === 0) {
//   //       console.warn("No rows selected for update.");
//   //       return;
//   //   }

//   //   const selectedStudentIds = selectedRows.map(index => bodyData[index].id);
//   //   let updateFields = {};

//   //   if(selectedColumn === 'bpl') {
//   //       updateFields["udisePlusDetails.is_bpl"] = selectedValue === 'Yes' ? true : false;
//   //   }else if (selectedColumn === "class") {
//   //       updateFields["class"] = selectedValue;
//   //     } else if (selectedColumn === "category") {
//   //       updateFields["udisePlusDetails.category"] = selectedValue;
//   //     }

//   //   const requestBody = {
//   //       studentIds: selectedStudentIds,
//   //       updateFields: updateFields,
//   //   };

//   //   try {
//   //     const response = await axios.put(
//   //       "https://eserver-i5sm.onrender.com/api/v1/adminRoute/bulkUpdateStudents",
//   //       requestBody,
//   //       {
//   //         withCredentials: true,
//   //         headers: {
//   //           Authorization: `Bearer ${authToken}`,
//   //           "Content-Type": "application/json",
//   //         },
//   //       }
//   //     );

//   //       console.log("Update successful:", response.data);


//   //       // Update local state
//   //       setBodyData((prevData) =>
//   //         prevData.map((row) =>
//   //           selectedRows.includes(row.index)
//   //           ? { ...row, [selectedColumn.toLowerCase()]: selectedValue }
//   //           : row
//   //         )
//   //       );


//   //   } catch (error) {
//   //     console.error("Error updating students:", error);
//   //   } finally {
//   //       setSelectedRows([]);
//   //       setSelectAll(false);
//   //   }
//   // };


//   return (
//     <div>
//       <div className="flex gap-4 mb-4">
//         <select
//           value={selectedColumn}
//           onChange={(e) => setSelectedColumn(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           {["BPL", "Class", "Category"].map((column) => (
//             <option key={column} value={column}>
//               {column}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedValue}
//           onChange={(e) => setSelectedValue(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           {selectedColumn === "BPL" && (
//             <>
//               <option value="Yes">Yes</option>
//               <option value="No">No</option>
//             </>
//           )}
//           {selectedColumn === "Class" &&
//             availableClasses.map((cls) => (
//               <option key={cls} value={cls}>
//                 {cls}
//               </option>
//             ))}
//           {selectedColumn === "Category" && (
//             <>
//               <option value="General">General</option>
//               <option value="OBC">OBC</option>
//               <option value="SC">SC</option>
//               <option value="ST">ST</option>
//             </>
//           )}
//         </select>

//         <button
//           onClick={updateSelectedRows}
//           className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
//         >
//           Update
//         </button>
//       </div>

//       <Tables
//         thead={[
//           {
//             name: (
//               <input
//                 type="checkbox"
//                 checked={selectAll}
//                 onChange={handleSelectAll}
//               />
//             ),
//           },
//           ...THEAD.slice(1),
//         ]}
//         tbody={bodyData.map((val) => ({
//           select: (
//             <input
//               type="checkbox"
//               checked={selectedRows.includes(val.index)}
//               onChange={() => handleRowSelection(val.index)}
//             />
//           ),
//           Sno: val.index + 1,
//           "Student Name": val.fullName,
//           Class: val.class,
//           BPL: val.bpl,
//           Aadhar: val.aadhar,
//           Scrollership: val.scrollership,
//           PAN: val.pan,
//           Category: val.category,
//           "Mother Tongue": val.motherTougue,
//           Minority: val.minority,
//           Sld_type: val.sld_type,
//           "Result preExam": val.resultPreExam,
//         }))}
//       />
//     </div>
//   );
// };

// export default Udise;



// import React, { useState, useEffect } from "react";
// import Tables from "../../Dynamic/Tables";
// import useCustomQuery from "../../useCustomQuery";

// const Udise = () => {
//   const [submittedData, setSubmittedData] = useState([]);
//   const [bodyData, setBodyData] = useState([]); // To store data for the table
//   const [availableClasses, setAvailableClasses] = useState([]); // For dynamic class dropdown
//   const [selectedRows, setSelectedRows] = useState([]); // Store selected rows
//   const [selectAll, setSelectAll] = useState(false); // Manage "All" selection

//   const {
//     queryData: studentData,
//     error: studentError,
//     loading: studentLoading,
//   } = useCustomQuery(
//     "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents"
//   );


//   const editstudent=async()=>{
//     try {
//       const response = await axios.put(
//         `https://eserver-i5sm.onrender.com/api/v1/adminRoute/bulkUpdateStudents`,
//         data, 
//         {
//           withCredentials: true,
//           headers: {
//             Authorization: `Bearer ${authToken}`,
            
//             "Content-Type": "multipart/form-data",
        
//           },
//         }
//       );
//     } catch (error) {
      
//     }
      

//   }

//   useEffect(() => {
//     if (studentData) {
//         // Correctly extract and transform data for the table
//         const transformedData = studentData.allStudent.map((student, index) => ({
//             id: student._id, // Using ID to keep track of which row is associated to each object.
//             index: index,
//             fullName: student.fullName,
//             class: student.class,
//             bpl: student.udisePlusDetails?.is_bpl ? "Yes" : "No",
//             aadhar: student.udisePlusDetails?.aadhar_no,
//             scrollership: student.udisePlusDetails?.name_central_scholarship || "N/A",
//             pan: "N/A", // Pan is not provided in the response
//             category: student.udisePlusDetails?.category,
//             motherTougue: student.udisePlusDetails?.mothere_tougue,
//             minority: student.udisePlusDetails?.minority,
//             sld_type: student.udisePlusDetails?.SLD_type,
//             resultPreExam: student.udisePlusDetails?.result_pre_exam,
//         }));


//         setBodyData(transformedData); // Update bodyData with transformed data
//         setSubmittedData(studentData.allStudent); // Still setting for other uses

//         // Extract unique classes for the dynamic dropdown
//         const classes = Array.from(
//             new Set(studentData.allStudent.map((student) => student.class))
//         ).sort();
//         setAvailableClasses(classes);
//     }
//   }, [studentData]);

//   const THEAD = [
//     "Select",
//     "S.No.",
//     "Student Name",
//     "Class",
//     "BPL",
//     "Aadhar",
//     "Scrollership",
//     "PAN",
//     "Category",
//     "Mother Tongue",
//     "Minority",
//     "Sld_type",
//     "Result preExam",
//   ];

//     // Default values for selectors
//     const [selectedColumn, setSelectedColumn] = useState("BPL");
//     const [selectedValue, setSelectedValue] = useState("Yes");


//   // Function to handle checkbox selection
//   const handleRowSelection = (index) => {
//     if (selectedRows.includes(index)) {
//       setSelectedRows(selectedRows.filter((i) => i !== index));
//     } else {
//       setSelectedRows([...selectedRows, index]);
//     }
//   };

//   // Handle "Select All" checkbox
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedRows([]); // Deselect all
//     } else {
//       setSelectedRows(bodyData.map((_, index) => index)); // Select all rows
//     }
//     setSelectAll(!selectAll);
//   };

//   // Function to update selected rows based on selector
//   const updateSelectedRows = () => {
//     setBodyData((prevData) =>
//       prevData.map((row) =>
//         selectedRows.includes(row.index) // Ensure you're comparing with the index for each row
//           ? { ...row, [selectedColumn.toLowerCase()]: selectedValue }
//           : row
//       )
//     );
//     setSelectedRows([]); // Reset selection after update
//     setSelectAll(false); // Reset "Select All"
//   };

//   return (
//     <div>
//       {/* Selectors */}
//       <div className="flex gap-4 mb-4">
//         {/* Column Selector */}
//         <select
//           value={selectedColumn}
//           onChange={(e) => setSelectedColumn(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           {["BPL", "Class", "Category"].map((column) => (
//             <option key={column} value={column}>
//               {column}
//             </option>
//           ))}
//         </select>

//         {/* Value Selector */}
//         <select
//           value={selectedValue}
//           onChange={(e) => setSelectedValue(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           {selectedColumn === "BPL" && (
//             <>
//               <option value="Yes">Yes</option>
//               <option value="No">No</option>
//             </>
//           )}
//           {selectedColumn === "Class" &&
//             availableClasses.map((cls) => (
//                 <option key={cls} value={cls}>{cls}</option>
//               ))
//             }
//           {selectedColumn === "Category" && (
//             <>
//               <option value="General">General</option>
//               <option value="OBC">OBC</option>
//               <option value="SC">SC</option>
//               <option value="ST">ST</option>
//             </>
//           )}
//         </select>

//         {/* Update Button */}
//         <button
//           onClick={updateSelectedRows}
//           className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
//         >
//           Update
//         </button>
//       </div>

//       {/* Table */}
//       <Tables
//         thead={[
//           {
//             name: (
//               <input
//                 type="checkbox"
//                 checked={selectAll}
//                 onChange={handleSelectAll}
//               />
//             ),
//           },
//           ...THEAD.slice(1),
//         ]}
//         tbody={bodyData.map((val) => ({
//             select: (
//               <input
//                 type="checkbox"
//                 checked={selectedRows.includes(val.index)}
//                 onChange={() => handleRowSelection(val.index)}
//               />
//             ),
//             Sno: val.index + 1,
//             "Student Name": val.fullName,
//             Class: val.class,
//             BPL: val.bpl,
//             Aadhar: val.aadhar,
//             Scrollership: val.scrollership,
//             PAN: val.pan,
//             Category: val.category,
//             "Mother Tongue": val.motherTougue,
//             Minority: val.minority,
//             Sld_type: val.sld_type,
//             "Result preExam": val.resultPreExam,
//           }))}
//       />
//     </div>
//   );
// };

// export default Udise;



// import React, { useState } from "react";
// import Tables from "../../Dynamic/Tables";

// const Udise = () => {

//   const [submittedData, setSubmittedData] = useState([]);

//   const { queryData: studentData, error: studentError, loading: studentLoading } = useCustomQuery("https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllStudents");
  
//   useEffect(()=>{
//     if(studentData){
//       setSubmittedData(studentData.allStudent);
//     }
//   },[studentData])


//   const [bodyData, setBodyData] = useState([
//     { fullName: "Aman Kumar", class: "10", bpl: "Yes", aadhar: "1234-5678-9101", scrollership: "Scholarship A", pan: "ABCDE1234F", category: "General", motherTougue: "Hindi", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Suman Gupta", class: "9", bpl: "No", aadhar: "2345-6789-0123", scrollership: "Scholarship B", pan: "FGHIJ5678K", category: "OBC", motherTougue: "Bengali", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Ravi Singh", class: "8", bpl: "Yes", aadhar: "3456-7890-1234", scrollership: "Scholarship C", pan: "KLMNO1234P", category: "SC", motherTougue: "Hindi", minority: "No", sld_type: "None", resultPreExam: "Fail" },
//     { fullName: "Pooja Sharma", class: "7", bpl: "No", aadhar: "4567-8901-2345", scrollership: "Scholarship D", pan: "PQRST6789U", category: "ST", motherTougue: "Punjabi", minority: "Yes", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Rahul Verma", class: "6", bpl: "Yes", aadhar: "5678-9012-3456", scrollership: "Scholarship E", pan: "UVWXY1234Z", category: "General", motherTougue: "Gujarati", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Anjali Yadav", class: "5", bpl: "No", aadhar: "6789-0123-4567", scrollership: "Scholarship F", pan: "ABCXY6789Z", category: "OBC", motherTougue: "Kannada", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Vikas Choudhary", class: "4", bpl: "Yes", aadhar: "7890-1234-5678", scrollership: "Scholarship G", pan: "PQRMN6789A", category: "General", motherTougue: "Hindi", minority: "No", sld_type: "None", resultPreExam: "Fail" },
//     { fullName: "Sneha Mehta", class: "3", bpl: "No", aadhar: "8901-2345-6789", scrollership: "Scholarship H", pan: "LMNOP5678F", category: "General", motherTougue: "English", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Karan Kapoor", class: "2", bpl: "Yes", aadhar: "9012-3456-7890", scrollership: "Scholarship I", pan: "ZXYUV6789G", category: "SC", motherTougue: "Marathi", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Priya Desai", class: "1", bpl: "No", aadhar: "0123-4567-8901", scrollership: "Scholarship J", pan: "TUVWQ6789H", category: "ST", motherTougue: "Telugu", minority: "Yes", sld_type: "None", resultPreExam: "Pass" },

//   ]);

//   const THEAD = [
//     "Select",
//     "S.No.",
//     "Student Name",
//     "Class",
//     "BPL",
//     "Aadhar",
//     "Scrollership",
//     "PAN",
//     "Category",
//     "Mother Tongue",
//     "Minority",
//     "Sld_type",
//     "Result preExam",
//   ];

//   const [selectedColumn, setSelectedColumn] = useState("BPL"); // Default column
//   const [selectedValue, setSelectedValue] = useState("Yes"); // Default value
//   const [selectedRows, setSelectedRows] = useState([]); // Store selected rows
//   const [selectAll, setSelectAll] = useState(false); // Manage "All" selection

//   // Function to handle checkbox selection
//   const handleRowSelection = (index) => {
//     if (selectedRows.includes(index)) {
//       setSelectedRows(selectedRows.filter((i) => i !== index));
//     } else {
//       setSelectedRows([...selectedRows, index]);
//     }
//   };

//   // Handle "Select All" checkbox
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedRows([]); // Deselect all
//     } else {
//       setSelectedRows(bodyData.map((_, index) => index)); // Select all rows
//     }
//     setSelectAll(!selectAll);
//   };

//   // Function to update selected rows based on selector
//   const updateSelectedRows = () => {
//     setBodyData((prevData) =>
//       prevData.map((row, index) =>
//         selectedRows.includes(index)
//           ? { ...row, [selectedColumn.toLowerCase()]: selectedValue }
//           : row
//       )
//     );
//     setSelectedRows([]); // Reset selection after update
//     setSelectAll(false); // Reset "Select All"
//   };

//   return (
//     <div>
//       {/* Selectors */}
//       <div className="flex gap-4 mb-4">
//         {/* Column Selector */}
//         <select
//           value={selectedColumn}
//           onChange={(e) => setSelectedColumn(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           {["BPL", "Class", "Category"].map((column) => (
//             <option key={column} value={column}>
//               {column}
//             </option>
//           ))}
//         </select>

//         {/* Value Selector */}
//         <select
//           value={selectedValue}
//           onChange={(e) => setSelectedValue(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
          
//           {selectedColumn === "BPL" && (
//             <>
//               <option value="Yes">Yes</option>
//               <option value="No">No</option>
//             </>
//           )}
//           {selectedColumn === "Class" &&
//             Array.from({ length: 10 }, (_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 {i + 1}
//               </option>
//             ))}
//           {selectedColumn === "Category" && (
//             <>
//               <option value="General">General</option>
//               <option value="OBC">OBC</option>
//               <option value="SC">SC</option>
//               <option value="ST">ST</option>
//             </>
//           )}
//         </select>

//         {/* Update Button */}
//         <button
//           onClick={updateSelectedRows}
//           className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
//         >
//           Update
//         </button>
//       </div>

//       {/* Table */}
//       <Tables
//         thead={[
//           {
//             name: (
//               <input
//                 type="checkbox"
//                 checked={selectAll}
//                 onChange={handleSelectAll}
//               />
//             ),
//           },
//           ...THEAD.slice(1),
//         ]}
//         tbody={bodyData.map((val, ind) => ({
//           select: (
//             <input
//               type="checkbox"
//               checked={selectedRows.includes(ind)}
//               onChange={() => handleRowSelection(ind)}
//             />
//           ),
//           Sno: ind + 1,
//           "Student Name": val.fullName,
//           Class: val.class,
//           BPL: val.bpl,
//           Aadhar: val.aadhar,
//           Scrollership: val.scrollership,
//           PAN: val.pan,
//           Category: val.category,
//           "Mother Tongue": val.motherTougue,
//           Minority: val.minority,
//           Sld_type: val.sld_type,
//           "Result preExam": val.resultPreExam,
//         }))}
//       />
//     </div>
//   );
// };

// export default Udise;



// import React, { useState } from "react";
// import Tables from "../../Dynamic/Tables";

// const Udise = () => {
//   const [bodyData, setBodyData] = useState([
//     { fullName: "Aman Kumar", class: "10", bpl: "Yes", aadhar: "1234-5678-9101", scrollership: "Scholarship A", pan: "ABCDE1234F", category: "General", motherTougue: "Hindi", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Suman Gupta", class: "9", bpl: "No", aadhar: "2345-6789-0123", scrollership: "Scholarship B", pan: "FGHIJ5678K", category: "OBC", motherTougue: "Bengali", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     // Add more data as required...
//   ]);

//   const THEAD = [
//     "Select",
//     "S.No.",
//     "Student Name",
//     "Class",
//     "BPL",
//     "Aadhar",
//     "Scrollership",
//     "PAN",
//     "Category",
//     "Mother Tongue",
//     "Minority",
//     "Sld_type",
//     "Result preExam",
//   ];

//   const [selectedColumn, setSelectedColumn] = useState("BPL"); // Default column
//   const [selectedValue, setSelectedValue] = useState("Yes"); // Default value
//   const [selectedRows, setSelectedRows] = useState([]); // Store selected rows
//   const [selectAll, setSelectAll] = useState(false); // Manage "All" selection

//   // Function to handle checkbox selection
//   const handleRowSelection = (index) => {
//     if (selectedRows.includes(index)) {
//       setSelectedRows(selectedRows.filter((i) => i !== index));
//     } else {
//       setSelectedRows([...selectedRows, index]);
//     }
//   };

//   // Handle "Select All" checkbox
//   const handleSelectAll = () => {
//     if (selectAll) {
//       setSelectedRows([]); // Deselect all
//     } else {
//       setSelectedRows(bodyData.map((_, index) => index)); // Select all rows
//     }
//     setSelectAll(!selectAll);
//   };

//   // Function to update selected rows based on selector
//   const updateSelectedRows = () => {
//     setBodyData((prevData) =>
//       prevData.map((row, index) =>
//         selectedRows.includes(index)
//           ? { ...row, [selectedColumn.toLowerCase()]: selectedValue }
//           : row
//       )
//     );
//     setSelectedRows([]); // Reset selection after update
//     setSelectAll(false); // Reset "Select All"
//   };

//   return (
//     <div>
//       {/* Selectors */}
//       <div className="flex gap-4 mb-4">
//         {/* Column Selector */}
//         <select
//           value={selectedColumn}
//           onChange={(e) => setSelectedColumn(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           {["BPL", "Class", "Category"].map((column) => (
//             <option key={column} value={column}>
//               {column}
//             </option>
//           ))}
//         </select>

//         {/* Value Selector */}
//         <select
//           value={selectedValue}
//           onChange={(e) => setSelectedValue(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           
//           {selectedColumn === "BPL" && (
//             <>
//               <option value="Yes">Yes</option>
//               <option value="No">No</option>
//             </>
//           )}
//           {selectedColumn === "Class" &&
//             Array.from({ length: 10 }, (_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 {i + 1}
//               </option>
//             ))}
//           {selectedColumn === "Category" && (
//             <>
//               <option value="General">General</option>
//               <option value="OBC">OBC</option>
//               <option value="SC">SC</option>
//               <option value="ST">ST</option>
//             </>
//           )}
//         </select>

//         {/* Update Button */}
//         <button
//           onClick={updateSelectedRows}
//           className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
//         >
//           Update
//         </button>
//       </div>

//       {/* Table */}
//       <Tables
//         thead={THEAD}
//         tbody={[
//           {
//             select: (
//               <input
//                 type="checkbox"
//                 checked={selectAll}
//                 onChange={handleSelectAll}
//               />
//             ),
//             Sno: "All",
//             "Student Name": "All Rows",
//             Class: "",
//             BPL: "",
//             Aadhar: "",
//             Scrollership: "",
//             PAN: "",
//             Category: "",
//             "Mother Tongue": "",
//             Minority: "",
//             Sld_type: "",
//             "Result preExam": "",
//           },
//           ...bodyData.map((val, ind) => ({
//             select: (
//               <input
//                 type="checkbox"
//                 checked={selectedRows.includes(ind)}
//                 onChange={() => handleRowSelection(ind)}
//               />
//             ),
//             Sno: ind + 1,
//             "Student Name": val.fullName,
//             Class: val.class,
//             BPL: val.bpl,
//             Aadhar: val.aadhar,
//             Scrollership: val.scrollership,
//             PAN: val.pan,
//             Category: val.category,
//             "Mother Tongue": val.motherTougue,
//             Minority: val.minority,
//             Sld_type: val.sld_type,
//             "Result preExam": val.resultPreExam,
//           })),
//         ]}
//       />
//     </div>
//   );
// };

// export default Udise;




// import React, { useState } from "react";
// import Tables from "../../Dynamic/Tables";

// const Udise = () => {
//   const [bodyData, setBodyData] = useState([
//     { fullName: "Aman Kumar", class: "10", bpl: "Yes", aadhar: "1234-5678-9101", scrollership: "Scholarship A", pan: "ABCDE1234F", category: "General", motherTougue: "Hindi", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Suman Gupta", class: "9", bpl: "No", aadhar: "2345-6789-0123", scrollership: "Scholarship B", pan: "FGHIJ5678K", category: "OBC", motherTougue: "Bengali", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     // Add more data as required...
//   ]);

//   const THEAD = [
//     "Select",
//     "S.No.",
//     "Student Name",
//     "Class",
//     "BPL",
//     "Aadhar",
//     "Scrollership",
//     "PAN",
//     "Category",
//     "Mother Tongue",
//     "Minority",
//     "Sld_type",
//     "Result preExam",
//   ];

//   const [selectedColumn, setSelectedColumn] = useState("BPL"); // Default column
//   const [selectedValue, setSelectedValue] = useState("Yes"); // Default value
//   const [selectedRows, setSelectedRows] = useState([]); // Store selected rows

//   // Function to handle checkbox selection
//   const handleRowSelection = (index) => {
//     if (selectedRows.includes(index)) {
//       setSelectedRows(selectedRows.filter((i) => i !== index));
//     } else {
//       setSelectedRows([...selectedRows, index]);
//     }
//   };

//   // Function to update selected rows based on selector
//   const updateSelectedRows = () => {
//     setBodyData((prevData) =>
//       prevData.map((row, index) =>
//         selectedRows.includes(index)
//           ? { ...row, [selectedColumn.toLowerCase()]: selectedValue }
//           : row
//       )
//     );
//     setSelectedRows([]); // Reset selection after update
//   };

//   return (
//     <div>
//       {/* Selectors */}
//       <div className="flex gap-4 mb-4">
//         {/* Column Selector */}
//         <select
//           value={selectedColumn}
//           onChange={(e) => setSelectedColumn(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           {["BPL", "Class", "Category"].map((column) => (
//             <option key={column} value={column}>
//               {column}
//             </option>
//           ))}
//         </select>

//         {/* Value Selector */}
//         <select
//           value={selectedValue}
//           onChange={(e) => setSelectedValue(e.target.value)}
//           className="border border-gray-300 rounded px-2 py-1"
//         >
//           {selectedColumn === "BPL" && (
//             <>
//               <option value="Yes">Yes</option>
//               <option value="No">No</option>
//             </>
//           )}
//           {selectedColumn === "Class" &&
//             Array.from({ length: 10 }, (_, i) => (
//               <option key={i + 1} value={i + 1}>
//                 {i + 1}
//               </option>
//             ))}
//           {selectedColumn === "Category" && (
//             <>
//               <option value="General">General</option>
//               <option value="OBC">OBC</option>
//               <option value="SC">SC</option>
//               <option value="ST">ST</option>
//             </>
//           )}
//         </select>

//         {/* Update Button */}
//         <button
//           onClick={updateSelectedRows}
//           className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
//         >
//           Update
//         </button>
//       </div>

//       {/* Table */}
//       <Tables
//         thead={THEAD}
//         tbody={bodyData?.map((val, ind) => ({
//           select: (
//             <input
//               type="checkbox"
//               checked={selectedRows.includes(ind)}
//               onChange={() => handleRowSelection(ind)}
//             />
//           ),
//           Sno: ind + 1,
//           "Student Name": val.fullName,
//           Class: val.class,
//           BPL: val.bpl,
//           Aadhar: val.aadhar,
//           Scrollership: val.scrollership,
//           PAN: val.pan,
//           Category: val.category,
//           "Mother Tongue": val.motherTougue,
//           Minority: val.minority,
//           Sld_type: val.sld_type,
//           "Result preExam": val.resultPreExam,
//         }))}
//       />
//     </div>
//   );
// };

// export default Udise;




// import React, { useState } from "react";
// import Tables from "../../Dynamic/Tables";

// const Udise = () => {
//   const [bodyData, setBodyData] = useState([
//     { fullName: "Aman Kumar", class: "10", bpl: "Yes", aadhar: "1234-5678-9101", scrollership: "Scholarship A", pan: "ABCDE1234F", category: "General", motherTougue: "Hindi", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Suman Gupta", class: "9", bpl: "No", aadhar: "2345-6789-0123", scrollership: "Scholarship B", pan: "FGHIJ5678K", category: "OBC", motherTougue: "Bengali", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Ravi Singh", class: "8", bpl: "Yes", aadhar: "3456-7890-1234", scrollership: "Scholarship C", pan: "KLMNO1234P", category: "SC", motherTougue: "Hindi", minority: "No", sld_type: "None", resultPreExam: "Fail" },
//     { fullName: "Pooja Sharma", class: "7", bpl: "No", aadhar: "4567-8901-2345", scrollership: "Scholarship D", pan: "PQRST6789U", category: "ST", motherTougue: "Punjabi", minority: "Yes", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Rahul Verma", class: "6", bpl: "Yes", aadhar: "5678-9012-3456", scrollership: "Scholarship E", pan: "UVWXY1234Z", category: "General", motherTougue: "Gujarati", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Anjali Yadav", class: "5", bpl: "No", aadhar: "6789-0123-4567", scrollership: "Scholarship F", pan: "ABCXY6789Z", category: "OBC", motherTougue: "Kannada", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Vikas Choudhary", class: "4", bpl: "Yes", aadhar: "7890-1234-5678", scrollership: "Scholarship G", pan: "PQRMN6789A", category: "General", motherTougue: "Hindi", minority: "No", sld_type: "None", resultPreExam: "Fail" },
//     { fullName: "Sneha Mehta", class: "3", bpl: "No", aadhar: "8901-2345-6789", scrollership: "Scholarship H", pan: "LMNOP5678F", category: "General", motherTougue: "English", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Karan Kapoor", class: "2", bpl: "Yes", aadhar: "9012-3456-7890", scrollership: "Scholarship I", pan: "ZXYUV6789G", category: "SC", motherTougue: "Marathi", minority: "No", sld_type: "None", resultPreExam: "Pass" },
//     { fullName: "Priya Desai", class: "1", bpl: "No", aadhar: "0123-4567-8901", scrollership: "Scholarship J", pan: "TUVWQ6789H", category: "ST", motherTougue: "Telugu", minority: "Yes", sld_type: "None", resultPreExam: "Pass" },
//   ]);

//   const THEAD = [
//     "Select",
//     "S.No.",
//     "Student Name",
//     "Class",
//     "BPL",
//     "Aadhar",
//     "Scrollership",
//     "PAN",
//     "Category",
//     "Mother Tongue",
//     "Minority",
//     "Sld_type",
//     "Result preExam",
//   ];

//   return (
//     <div>
//       <Tables
//         thead={THEAD}
//         tbody={bodyData?.map((val, ind) => ({
//           select: <input type="checkbox" />,
//           Sno: ind + 1,
//           "Student Name": val.fullName,
//           Class: val.class,
//           BPL: val.bpl,
//           Aadhar: val.aadhar,
//           Scrollership: val.scrollership,
//           PAN: val.pan,
//           Category: val.category,
//           "Mother Tongue": val.motherTougue,
//           Minority: val.minority,
//           Sld_type: val.sld_type,
//           "Result preExam": val.resultPreExam,
//         }))}
//       />
//     </div>
//   );
// };

// export default Udise;


// import React, { useState } from 'react'
// import Tables from '../../Dynamic/Tables'

// const Udise = () => {
//     const [bodyData, setBodyData] = useState([
//         { Sno: 1, ItemName: "", Qty: "", CurStock: "", Unit: "" },
//         { Sno: 1, ItemName: "", Qty: "", CurStock: "", Unit: "" },
//         { Sno: 1, ItemName: "", Qty: "", CurStock: "", Unit: "" },
//         { Sno: 1, ItemName: "", Qty: "", CurStock: "", Unit: "" },
//         { Sno: 1, ItemName: "", Qty: "", CurStock: "", Unit: "" },
//       ]);
//     const THEAD = [
//         "",
//         "S.No.",
//         "Student Name",
//         "Class",
//         "BPL",
//         "Aadhar",
//         "Scrollership",
//         "PAN",
//         "Category",
//         "Mother Tougue",
//         "Minority",
//         "Sld_type",
//         "Result preExam",
       
//       ];
//   return (
//     <div>
//      <Tables
//               thead={THEAD}
//               tbody={bodyData?.map((val, ind) => ({
//                 select: <input type='checkbox'/>,
//                 Sno: ind + 1,
//             "Student Name":val.fullName,
//             "Class":val.class,
//             "BPL":val.bpl,
//             "Aadhar":val.aadhar,
//             "Scrollership":val.scrollership,
//             "PAN":val.pan,
//             "Category":val.category,
//             "Mother Tougue":val.motherTougue,
//             "Minority":val.minority,
//             "Sld_type":val.sld_type,
//             "Result preExam":val.resultPreExam

//             }))}
//         />
//     </div>
//   )
// }

// export default Udise