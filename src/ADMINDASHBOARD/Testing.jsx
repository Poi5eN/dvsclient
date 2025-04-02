import React, { useState } from "react";

const ImageTest = () => {
  // 1. Front & Back Templates
  const [frontTemplate, setFrontTemplate] = useState(`
    <div style='background-image:url(\${backgroundImage}); 
                background-position: center; 
                background-repeat: no-repeat; 
                width: 54mm; 
                height: 86mm; 
                position: relative; 
                background-size:cover; 
                border:1px solid'>
      <div style='margin-left: 40px; 
                  margin-top: 82px; 
                  width: 85px; 
                  height: 95px; 
                  border: 0.5px solid #ff0000; 
                  border-radius: 4px; 
                  overflow:hidden; 
                  position:absolute'>
        <img src='\${NO_IMAGE}' style='width: 100%; height: 100%;'/>
      </div>
      <div style='position: absolute; left: 3px; top: 190px;'>
        <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold;'>
          NAME <span style="margin-left: 16px; font-weight: bold;"> : \${name} </span>
        </p>
        <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold'>
          CLASS <span style="margin-left: 13px; font-weight: bold"> : \${class} </span>
        </p>
        <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase;'>
          F.Name <span style="margin-left: 9px; font-weight: bold"> : \${father_name} </span>
        </p>
        <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase'>
          Phone <span style="margin-left: 12px; font-weight: bold"> : \${mobile} </span>
        </p>
        <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase;'>
          Address <span style="margin-left:1px; font-weight: bold"> : \${address} </span>
        </p>
      </div>
    </div>
  `);

  const [backTemplate, setBackTemplate] = useState(`
    <p>Guardian: \${guardianname}</p>
    <p>Contact: \${mobile}</p>
    <p>Address: \${address}</p>
  `);

  const [backgroundImage, setBackgroundImage] = useState("https://via.placeholder.com/300");

  // 2. Student details state
  const [student, setStudent] = useState({
    name: "John Doe",
    class: "10th Grade",
    father_name: "Mr. Doe",
    mobile: "9876543210",
    address: "123 Main St",
    guardianname: "Uncle Joe",
  });

  // 3. Template rendering function
  const renderTemplate = (template, data) => {
    return template.replace(/\${(\w+)}/g, (_, key) => data[key] || "");
  };

  // 4. Update student details
  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div style={{ margin: "2rem auto", fontFamily: "sans-serif" }}>
      <h1>ID Card Generator</h1>

      <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
        {/* Front Side Preview */}
        <div style={{ flex: 1, border: "2px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
          <h2>Front Side</h2>
          <div dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, { ...student, backgroundImage }) }} />
        </div>

        {/* Front Template Editor */}
        <div style={{ flex: 1 }}>
          <h2>Edit Front Template</h2>
          <textarea
            rows={12}
            style={{ width: "100%", fontFamily: "monospace", whiteSpace: "pre", padding: "1rem" }}
            value={frontTemplate}
            onChange={(e) => setFrontTemplate(e.target.value)}
          />
          <h3>Change Background Image</h3>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "2rem" }}>
        {/* Back Side Preview */}
        <div style={{ flex: 1, border: "2px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
          <h2>Back Side</h2>
          <div dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, student) }} />
        </div>

        {/* Back Template Editor */}
        <div style={{ flex: 1 }}>
          <h2>Edit Back Template</h2>
          <textarea
            rows={8}
            style={{ width: "100%", fontFamily: "monospace", whiteSpace: "pre", padding: "1rem" }}
            value={backTemplate}
            onChange={(e) => setBackTemplate(e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageTest;




// import React, { useState } from "react";

// const ImageTest = () => {
//   // 1. Front & Back Templates
//   const [frontTemplate, setFrontTemplate] = useState(`
//     <div style='background-image:url(\${PuchSheelIcard}); 
//                 background-position: center; 
//                 background-repeat: no-repeat; 
//                 width: 54mm; 
//                 height: 86mm; 
//                 position: relative; 
//                 background-size:cover; 
//                 border:1px solid'>
//       <div style='margin-left: 40px; 
//                   margin-top: 52px; 
//                   width: 85px; 
//                   height: 95px; 
//                   border: 0.5px solid #ff0000; 
//                   border-radius: 4px; 
//                   overflow:hidden; 
//                   position:absolute'>
//         <img src='\${NO_IMAGE}' style='width: 100%; height: 100%;'/>
//       </div>
//       <div style='position: absolute; left: 3px; top: 190px;'>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold;'>
//           NAME <span style="margin-left: 16px; font-weight: bold;"> : \${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold'>
//           CLASS <span style="margin-left: 13px; font-weight: bold"> : \${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase;'>
//           F.Name <span style="margin-left: 9px; font-weight: bold"> : \${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase'>
//           Phone <span style="margin-left: 12px; font-weight: bold"> : \${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase;'>
//           Address <span style="margin-left:1px; font-weight: bold"> : \${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

//   const [backTemplate, setBackTemplate] = useState(`
//     <p>Guardian: \${guardianname}</p>
//     <p>Contact: \${mobile}</p>
//     <p>Address: \${address}</p>
//   `);

//   // 2. Student details state
//   const [student, setStudent] = useState({
//     name: "John Doe",
//     class: "10th Grade",
//     father_name: "Mr. Doe",
//     mobile: "9876543210",
//     address: "123 Main St",
//     guardianname: "Uncle Joe",
//   });

//   // 3. Template rendering function
//   const renderTemplate = (template, data) => {
//     return template.replace(/\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   // 4. Update student details
//   const handleStudentChange = (e) => {
//     const { name, value } = e.target;
//     setStudent((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div style={{ margin: "2rem auto", fontFamily: "sans-serif" }}>
//       <h1>ID Card Generator</h1>

//       <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
//         {/* Front Side Preview */}
//         <div style={{ flex: 1, border: "2px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
//           <h2>Front Side</h2>
//           <div dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, student) }} />
//         </div>

//         {/* Front Template Editor */}
//         <div style={{ flex: 1 }}>
//           <h2>Edit Front Template</h2>
//           <textarea
//             rows={12}
//             style={{ width: "100%", fontFamily: "monospace", whiteSpace: "pre", padding: "1rem" }}
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//           />
//         </div>
//       </div>

//       <div style={{ display: "flex", gap: "2rem" }}>
//         {/* Back Side Preview */}
//         <div style={{ flex: 1, border: "2px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
//           <h2>Back Side</h2>
//           <div dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, student) }} />
//         </div>

//         {/* Back Template Editor */}
//         <div style={{ flex: 1 }}>
//           <h2>Edit Back Template</h2>
//           <textarea
//             rows={8}
//             style={{ width: "100%", fontFamily: "monospace", whiteSpace: "pre", padding: "1rem" }}
//             value={backTemplate}
//             onChange={(e) => setBackTemplate(e.target.value)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;


// import React, { useState } from "react";
// import AdmitcardTesting from './AdmitcardTesting';
// const ImageTest = () => {
//   // 1. Front & Back Templates (placeholders escaped)
//   const [frontTemplate, setFrontTemplate] = useState(`
//     <div style='background-image:url(\\\${PuchSheelIcard}); 
//                 background-position: center; 
//                 background-repeat: no-repeat; 
//                 width: 54mm; 
//                 height: 86mm; 
//                 position: relative; 
//                 background-size:cover; 
//                 border:1px solid'>
//       <div style='margin-left: 40px; 
//                   margin-top: 52px; 
//                   width: 85px; 
//                   height: 95px; 
//                   border: 0.5px solid #ff0000; 
//                   border-radius: 4px; 
//                   overflow:hidden; 
//                   position:absolute'>
//         <img src='\\\${NO_IMAGE}' style='width: 100%; height: 100%;'/>
//       </div>
//       <div style='position: absolute; left: 3px; top: 190px;'>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold;'>
//           NAME <span style=\"margin-left: 16px; font-weight: bold;\"> : \\\${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold'>
//           CLASS <span style=\"margin-left: 13px; font-weight: bold\"> : \\\${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase;'>
//           F.Name <span style=\"margin-left: 9px; font-weight: bold\"> : \\\${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase'>
//           Phone <span style=\"margin-left: 12px; font-weight: bold\"> : \\\${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase;'>
//           Address <span style=\"margin-left:1px; font-weight: bold\"> : \\\${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

// //   const [backTemplate, setBackTemplate] = useState(`
// //     <div style='border:1px dashed #666; width:200px; height:200px;'>
// //       <p>Guardian: \\${guardianname}</p>
// //       <p>Contact: \\${mobile}</p>
// //       <p>Address: \\${address}</p>
// //     </div>
// //   `);

// const [backTemplate, setBackTemplate] = useState(`
//     <p>Guardian: \\\${guardianname}</p>
//     <p>Contact: \\\${mobile}</p>
//     <p>Address: \\\${address}</p>
//   `);
  
//   // 2. Student details state (edit from the form)
//   const [student, setStudent] = useState({
//     name: "John Doe",
//     class: "10th Grade",
//     father_name: "Mr. Doe",
//     mobile: "9876543210",
//     address: "123 Main St",
//     guardianname: "Uncle Joe", // used in backTemplate
//   });

//   // 3. Regex-based placeholder replacement
//   const renderTemplate = (template, data) => {
//     // Yeh regex \${...} ko dhoond kar data se replace karega
//     // \\\${  => actual placeholder in the string
//     // (\\w+) => captures the key (e.g., name, class, father_name)
//     return template.replace(/\\?\\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   // 4. Update student details from the form
//   const handleStudentChange = (e) => {
//     const { name, value } = e.target;
//     setStudent((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div style={{
//         //  maxWidth: 1200,
//           margin: "2rem auto", fontFamily: "sans-serif" }}>
//       <h1>ID Card Generator</h1>

    
//       <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
//         {/* Front Side */}
//         <div
//           style={{
//             border: "2px solid #ccc",
//             padding: "1rem",
//             borderRadius: "8px",
//             flex: 1,
//           }}
//         >
//           <h2>Front Side</h2>
//           <div
//             dangerouslySetInnerHTML={{
//               __html: renderTemplate(frontTemplate, student),
//             }}
//           />
//         </div>

//         {/* Back Side */}
//         <div>
//         <h2>Edit Front Template</h2>
//         <textarea
//           rows={8}
//           style={{
//             width: "100%",
//             fontFamily: "monospace",
//             whiteSpace: "pre",
//             padding: "1rem",
//           }}
//           value={frontTemplate}
//           onChange={(e) => setFrontTemplate(e.target.value)}
//         />
//       </div>
//       </div>

  
     
//       <div
//           style={{
//             border: "2px solid #ccc",
//             padding: "1rem",
//             borderRadius: "8px",
//             flex: 1,
//           }}
//         >
//           <h2>Back Side</h2>
//           <div
//             dangerouslySetInnerHTML={{
//               __html: renderTemplate(backTemplate, student),
//             }}
//           />
//         </div>
//       <div style={{ marginTop: "1rem" }}>
//         <h2>Edit Back Template</h2>
//         <textarea
//           rows={8}
//           style={{
//             width: "100%",
//             fontFamily: "monospace",
//             whiteSpace: "pre",
//             padding: "1rem",
//           }}
//           value={backTemplate}
//           onChange={(e) => setBackTemplate(e.target.value)}
//         />
//       </div>
     
//     </div>
//   );
// };

// export default ImageTest;


// import React, { useState } from "react";

// const ImageTest = () => {
//   // Note: Har placeholder se pehle ek backslash: \${...}
//   const [frontTemplate, setFrontTemplate] = useState(`
//     <div style='background-image:url(\\\${PuchSheelIcard}); 
//                 background-position: center;
//                 background-repeat: no-repeat;
//                 width: 54mm;
//                 height: 86mm;
//                 position: relative;
//                 background-size:cover;
//                 border:1px solid'>

//       <div style='margin-left: 40px;
//                   margin-top: 52px;
//                   width: 85px;
//                   height: 95px;
//                   border: 0.5px solid #ff0000;
//                   border-radius: 4px;
//                   overflow:hidden;
//                   position:absolute'>
//         <img src='\\\${NO_IMAGE}' style='width: 100%; height: 100%;'/>
//       </div>

//       <div style='position: absolute; left: 3px; top: 190px;'>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold;'>
//           NAME <span style=\"margin-left: 16px; font-weight: bold;\"> : \\\${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold'>
//           CLASS <span style=\"margin-left: 13px; font-weight: bold\"> : \\\${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase;'>
//           F.Name <span style=\"margin-left: 9px; font-weight: bold\"> : \\\${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase'>
//           Phone <span style=\"margin-left: 12px; font-weight: bold\"> : \\\${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase;'>
//           Address <span style=\"margin-left:1px; font-weight: bold\"> : \\\${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

//   // Example back side template (with placeholders escaped if needed)
//   const [backTemplate, setBackTemplate] = useState("<p>Guardian: \\${guardianname}</p>");

//   // Student data
//   const student = {
//     name: "John Doe",
//     class: "10th Grade",
//     father_name: "Mr. Doe",
//     mobile: "9876543210",
//     address: "123 Main St",
//   };

//   // Render function to replace placeholders with student data
//   const renderTemplate = (template, data) => {
//     // Regex: matches ${...} (without backslash)
//     return template.replace(/\\?\\${(\\w+)}/g, (_, key) => data[key] || "");
//   };

//   return (
//     <div>
//       <h2>Front Side</h2>
//       <div
//         dangerouslySetInnerHTML={{
//           __html: renderTemplate(frontTemplate, student),
//         }}
//       ></div>

//       <h2>Back Side</h2>
//       <div
//         dangerouslySetInnerHTML={{
//           __html: renderTemplate(backTemplate, student),
//         }}
//       ></div>

//       <h3>Edit Front Template:</h3>
//       <textarea
//         value={frontTemplate}
//         onChange={(e) => setFrontTemplate(e.target.value)}
//         rows={10}
//         cols={80}
//       />

//       <h3>Edit Back Template:</h3>
//       <textarea
//         value={backTemplate}
//         onChange={(e) => setBackTemplate(e.target.value)}
//         rows={5}
//         cols={80}
//       />
//     </div>
//   );
// };

// export default ImageTest;



// import React, { useState } from "react";

// const ImageTest = () => {
//   const [frontTemplate, setFrontTemplate] = useState(`
//     <div style='background-image:url(\\\${PuchSheelIcard}); background-position: center;background-repeat: no-repeat;width: 54mm;height: 86mm;position: relative;background-size:cover;border:1px solid'>
//       <div style='margin-left: 40px;margin-top: 52px;width: 85px;height: 95px;border: 0.5px solid #ff0000;border-radius: 4px;overflow:hidden;position:absolute'>
//         <img src='\\\${NO_IMAGE}' style='width: 100%;height: 100%;'/>
//       </div>
//       <div style='position: absolute;left: 3px; top: 190px;'>
//         <p style='font-size:6pt;text-transform: uppercase;margin-top: 8px;color:BLACK;font-weight: bold;'>
//           NAME <span style="margin-left: 16px;font-weight: bold;"> : \\\${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase;margin-top: 4px;color:BLACK;margin-right: 1px;font-weight: bold'>
//           CLASS <span style="margin-left: 13px;font-weight: bold"> : \\\${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px;color:BLACK;margin-right: 1px;font-weight: bold;text-transform: uppercase;'>
//           F.Name <span style="margin-left: 9px;font-weight: bold"> : \\\${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px;color:BLACK;margin-right: 1px;font-weight: bold;text-transform: uppercase'>
//           Phone <span style="margin-left: 12px;font-weight: bold"> : \\\${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px;color:BLACK;margin-right: 15px;font-weight: bold;text-transform: uppercase;'>
//           Address <span style="margin-left:1px;font-weight: bold"> : \\\${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

//   const [backTemplate, setBackTemplate] = useState("<p>Guardian: \\${guardianname}</p><p>Contact: \\${mobile}</p><p>Address: \\${address}</p>");

//   const [customStyles, setCustomStyles] = useState({
//     color: "#000000",
//     fontSize: "16px",
//     border: "2px solid #3b82f6",
//     backgroundColor: "#ffffff",
//     padding: "10px",
//     margin: "10px",
//     textAlign: "left",
//     fontFamily: "Arial, sans-serif",
//   });

//   const [templateStyles, setTemplateStyles] = useState({
//     color: "#000000",
//     backgroundColor: "#ffffff",
//     fontSize: "14px",
//     padding: "8px",
//     border: "1px solid #000",
//     fontFamily: "Courier, monospace",
//   });

//   const student = {
//     name: "John Doe",
//     class: "10th Grade",
//     section: "A",
//     admission_id: "12345",
//     father_name: "Mr. Doe",
//     mothername: "Mrs. Doe",
//     rollno: "21",
//     dob: "2008-05-14",
//     transport: "Bus 12",
//     guardianname: "Uncle Joe",
//     mobile: "9876543210",
//     address: "123 Main St, Springfield",
//   };

//   const renderTemplate = (template, data) => {
//     return template.replace(/\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   return (
//     <div className="flex flex-col items-center bg-gray-100 min-h-screen p-5">
//       <div className="flex gap-5 mb-8">
//         <div className="rounded-2xl p-5 shadow-md w-96" style={customStyles}>
//           <h1 className="text-2xl font-bold mb-4" style={customStyles}>
//             Front Side
//           </h1>
//           <div
//             style={customStyles}
//             dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, student) }}
//           ></div>
//         </div>
//         <div className="rounded-2xl p-5 shadow-md w-96" style={customStyles}>
//           <h1 className="text-2xl font-bold mb-4" style={customStyles}>
//             Back Side
//           </h1>
//           <div
//             style={customStyles}
//             dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, student) }}
//           ></div>
//         </div>
//       </div>

//       <div className="w-full max-w-4xl space-y-6">
//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Front Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border rounded-lg"
//             style={templateStyles}
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//           />
//         </div>
//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Back Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border rounded-lg"
//             style={templateStyles}
//             value={backTemplate}
//             onChange={(e) => setBackTemplate(e.target.value)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;



// import React, { useState } from "react";

// const ImageTest = () => {
//   const [frontTemplate, setFrontTemplate] = useState("<p>Name: ${name}</p><p>Class: ${class}</p><p>Section: ${section}</p><p>Roll No: ${rollno}</p>");
//   const [backTemplate, setBackTemplate] = useState("<p>Guardian: ${guardianname}</p><p>Contact: ${mobile}</p><p>Address: ${address}</p>");

//   const [customStyles, setCustomStyles] = useState({
//     color: "#000000",
//     fontSize: "16px",
//     border: "2px solid #3b82f6",
//     backgroundColor: "#ffffff",
//     padding: "10px",
//     margin: "10px",
//     textAlign: "left",
//     fontFamily: "Arial, sans-serif",
//   });

//   const [templateStyles, setTemplateStyles] = useState({
//     color: "#000000",
//     backgroundColor: "#ffffff",
//     fontSize: "14px",
//     padding: "8px",
//     border: "1px solid #000",
//     fontFamily: "Courier, monospace",
//   });

//   const student = {
//     name: "John Doe",
//     class: "10th Grade",
//     section: "A",
//     admission_id: "12345",
//     father_name: "Mr. Doe",
//     mothername: "Mrs. Doe",
//     rollno: "21",
//     dob: "2008-05-14",
//     transport: "Bus 12",
//     guardianname: "Uncle Joe",
//     mobile: "9876543210",
//     address: "123 Main St, Springfield",
//   };

//   const renderTemplate = (template, data) => {
//     return template.replace(/\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   const handleStyleChange = (e) => {
//     const { name, value } = e.target;
//     setCustomStyles((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleTemplateStyleChange = (e) => {
//     const { name, value } = e.target;
//     setTemplateStyles((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="flex flex-col items-center bg-gray-100 min-h-screen p-5">
//       <div className="flex gap-5 mb-8">
//         <div
//           className="rounded-2xl p-5 shadow-md w-96"
//           style={customStyles}
//         >
//           <h1 className="text-2xl font-bold mb-4" style={customStyles}>
//             Front Side
//           </h1>
//           <div
//             style={customStyles}
//             dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, student) }}
//           ></div>
//         </div>

//         <div
//           className="rounded-2xl p-5 shadow-md w-96"
//           style={customStyles}
//         >
//           <h1 className="text-2xl font-bold mb-4" style={customStyles}>
//             Back Side
//           </h1>
//           <div
//             style={customStyles}
//             dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, student) }}
//           ></div>
//         </div>
//       </div>

//       <div className="w-full max-w-4xl space-y-6">
//         <div className="flex gap-4 flex-wrap">
//           <label>Color:</label>
//           <input type="color" name="color" value={customStyles.color} onChange={handleStyleChange} />

//           <label>Font Size:</label>
//           <input
//             type="text"
//             name="fontSize"
//             value={customStyles.fontSize}
//             onChange={handleStyleChange}
//             placeholder="e.g., 16px"
//           />

//           <label>Border:</label>
//           <input
//             type="text"
//             name="border"
//             value={customStyles.border}
//             onChange={handleStyleChange}
//             placeholder="e.g., 2px solid #000"
//           />

//           <label>Background:</label>
//           <input
//             type="color"
//             name="backgroundColor"
//             value={customStyles.backgroundColor}
//             onChange={handleStyleChange}
//           />

//           <label>Padding:</label>
//           <input
//             type="text"
//             name="padding"
//             value={customStyles.padding}
//             onChange={handleStyleChange}
//             placeholder="e.g., 10px"
//           />

//           <label>Margin:</label>
//           <input
//             type="text"
//             name="margin"
//             value={customStyles.margin}
//             onChange={handleStyleChange}
//             placeholder="e.g., 10px"
//           />

//           <label>Text Align:</label>
//           <select name="textAlign" value={customStyles.textAlign} onChange={handleStyleChange}>
//             <option value="left">Left</option>
//             <option value="center">Center</option>
//             <option value="right">Right</option>
//           </select>

//           <label>Font Family:</label>
//           <input
//             type="text"
//             name="fontFamily"
//             value={customStyles.fontFamily}
//             onChange={handleStyleChange}
//             placeholder="e.g., Arial"
//           />
//         </div>

//         <div className="flex gap-4 flex-wrap">
//           <label>Textarea Color:</label>
//           <input type="color" name="color" value={templateStyles.color} onChange={handleTemplateStyleChange} />

//           <label>Textarea Background:</label>
//           <input type="color" name="backgroundColor" value={templateStyles.backgroundColor} onChange={handleTemplateStyleChange} />
//         </div>

//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Front Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border rounded-lg"
//             style={templateStyles}
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Back Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border rounded-lg"
//             style={templateStyles}
//             value={backTemplate}
//             onChange={(e) => setBackTemplate(e.target.value)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;




// import React, { useState } from "react";

// const ImageTest = () => {
//   const [frontTemplate, setFrontTemplate] = useState("<p>Name: ${name}</p><p>Class: ${class}</p><p>Section: ${section}</p><p>Roll No: ${rollno}</p>");
//   const [backTemplate, setBackTemplate] = useState("<p>Guardian: ${guardianname}</p><p>Contact: ${mobile}</p><p>Address: ${address}</p>");

//   const [customStyles, setCustomStyles] = useState({
//     color: "#000000",
//     fontSize: "16px",
//     border: "2px solid #3b82f6",
//     backgroundColor: "#ffffff",
//     padding: "10px",
//     margin: "10px",
//     textAlign: "left",
//     fontFamily: "Arial, sans-serif",
//   });

//   const student = {
//     name: "John Doe",
//     class: "10th Grade",
//     section: "A",
//     admission_id: "12345",
//     father_name: "Mr. Doe",
//     mothername: "Mrs. Doe",
//     rollno: "21",
//     dob: "2008-05-14",
//     transport: "Bus 12",
//     guardianname: "Uncle Joe",
//     mobile: "9876543210",
//     address: "123 Main St, Springfield",
//   };

//   const renderTemplate = (template, data) => {
//     return template.replace(/\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   const handleStyleChange = (e) => {
//     const { name, value } = e.target;
//     setCustomStyles((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="flex flex-col items-center bg-gray-100 min-h-screen p-5">
//       <div className="flex gap-5 mb-8">
//         <div
//           className="rounded-2xl p-5 shadow-md w-96"
//           style={customStyles}
//         >
//           <h1 className="text-2xl font-bold mb-4" style={customStyles}>
//             Front Side
//           </h1>
//           <div
//             style={customStyles}
//             dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, student) }}
//           ></div>
//         </div>

//         <div
//           className="rounded-2xl p-5 shadow-md w-96"
//           style={customStyles}
//         >
//           <h1 className="text-2xl font-bold mb-4" style={customStyles}>
//             Back Side
//           </h1>
//           <div
//             style={customStyles}
//             dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, student) }}
//           ></div>
//         </div>
//       </div>

//       <div className="w-full max-w-4xl space-y-6">
//         <div className="flex gap-4 flex-wrap">
//           <label>Color:</label>
//           <input type="color" name="color" value={customStyles.color} onChange={handleStyleChange} />

//           <label>Font Size:</label>
//           <input
//             type="text"
//             name="fontSize"
//             value={customStyles.fontSize}
//             onChange={handleStyleChange}
//             placeholder="e.g., 16px"
//           />

//           <label>Border:</label>
//           <input
//             type="text"
//             name="border"
//             value={customStyles.border}
//             onChange={handleStyleChange}
//             placeholder="e.g., 2px solid #000"
//           />

//           <label>Background:</label>
//           <input
//             type="color"
//             name="backgroundColor"
//             value={customStyles.backgroundColor}
//             onChange={handleStyleChange}
//           />

//           <label>Padding:</label>
//           <input
//             type="text"
//             name="padding"
//             value={customStyles.padding}
//             onChange={handleStyleChange}
//             placeholder="e.g., 10px"
//           />

//           <label>Margin:</label>
//           <input
//             type="text"
//             name="margin"
//             value={customStyles.margin}
//             onChange={handleStyleChange}
//             placeholder="e.g., 10px"
//           />

//           <label>Text Align:</label>
//           <select name="textAlign" value={customStyles.textAlign} onChange={handleStyleChange}>
//             <option value="left">Left</option>
//             <option value="center">Center</option>
//             <option value="right">Right</option>
//           </select>

//           <label>Font Family:</label>
//           <input
//             type="text"
//             name="fontFamily"
//             value={customStyles.fontFamily}
//             onChange={handleStyleChange}
//             placeholder="e.g., Arial"
//           />
//         </div>

//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Front Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border rounded-lg"
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Back Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border rounded-lg"
//             value={backTemplate}
//             onChange={(e) => setBackTemplate(e.target.value)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;

// import React, { useState } from "react";

// const ImageTest = () => {
//   const [frontTemplate, setFrontTemplate] = useState("<p>Name: ${name}</p><p>Class: ${class}</p><p>Section: ${section}</p><p>Roll No: ${rollno}</p>");
//   const [backTemplate, setBackTemplate] = useState("<p>Guardian: ${guardianname}</p><p>Contact: ${mobile}</p><p>Address: ${address}</p>");

//   const [customStyles, setCustomStyles] = useState({
//     color: "#000000",
//     fontSize: "16px",
//     border: "2px solid #3b82f6",
//     backgroundColor: "#ffffff",
//   });

//   const student = {
//     name: "John Doe",
//     class: "10th Grade",
//     section: "A",
//     admission_id: "12345",
//     father_name: "Mr. Doe",
//     mothername: "Mrs. Doe",
//     rollno: "21",
//     dob: "2008-05-14",
//     transport: "Bus 12",
//     guardianname: "Uncle Joe",
//     mobile: "9876543210",
//     address: "123 Main St, Springfield",
//   };

//   const renderTemplate = (template, data) => {
//     return template.replace(/\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   const handleStyleChange = (e) => {
//     const { name, value } = e.target;
//     setCustomStyles((prev) => ({ ...prev, [name]: value }));
//   };

//   return (
//     <div className="flex flex-col items-center bg-gray-100 min-h-screen p-5">
//       <div className="flex gap-5 mb-8">
//         <div
//           className="rounded-2xl p-5 shadow-md w-96"
//           style={{ border: customStyles.border, backgroundColor: customStyles.backgroundColor }}
//         >
//           <h1 className="text-2xl font-bold mb-4" style={{ color: customStyles.color, fontSize: customStyles.fontSize }}>
//             Front Side
//           </h1>
//           <div
//             style={{ color: customStyles.color, fontSize: customStyles.fontSize }}
//             dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, student) }}
//           ></div>
//         </div>

//         <div
//           className="rounded-2xl p-5 shadow-md w-96"
//           style={{ border: customStyles.border, backgroundColor: customStyles.backgroundColor }}
//         >
//           <h1 className="text-2xl font-bold mb-4" style={{ color: customStyles.color, fontSize: customStyles.fontSize }}>
//             Back Side
//           </h1>
//           <div
//             style={{ color: customStyles.color, fontSize: customStyles.fontSize }}
//             dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, student) }}
//           ></div>
//         </div>
//       </div>

//       <div className="w-full max-w-4xl space-y-6">
//         <div className="flex gap-4">
//           <label>Color:</label>
//           <input type="color" name="color" value={customStyles.color} onChange={handleStyleChange} />

//           <label>Font Size:</label>
//           <input
//             type="text"
//             name="fontSize"
//             value={customStyles.fontSize}
//             onChange={handleStyleChange}
//             placeholder="e.g., 16px"
//           />

//           <label>Border:</label>
//           <input
//             type="text"
//             name="border"
//             value={customStyles.border}
//             onChange={handleStyleChange}
//             placeholder="e.g., 2px solid #000"
//           />

//           <label>Background:</label>
//           <input
//             type="color"
//             name="backgroundColor"
//             value={customStyles.backgroundColor}
//             onChange={handleStyleChange}
//           />
//         </div>

//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Front Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border rounded-lg"
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Back Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border rounded-lg"
//             value={backTemplate}
//             onChange={(e) => setBackTemplate(e.target.value)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;

// import React, { useState } from "react";

// const ImageTest = () => {
//   const [frontTemplate, setFrontTemplate] = useState("<p>Name: ${name}</p><p>Class: ${class}</p><p>Section: ${section}</p><p>Roll No: ${rollno}</p>");
//   const [backTemplate, setBackTemplate] = useState("<p>Guardian: ${guardianname}</p><p>Contact: ${mobile}</p><p>Address: ${address}</p>");

//   const student = {
//     name: "John Doe",
//     class: "10th Grade",
//     section: "A",
//     admission_id: "12345",
//     father_name: "Mr. Doe",
//     mothername: "Mrs. Doe",
//     rollno: "21",
//     dob: "2008-05-14",
//     transport: "Bus 12",
//     guardianname: "Uncle Joe",
//     mobile: "9876543210",
//     address: "123 Main St, Springfield",
//   };

//   const renderTemplate = (template, data) => {
//     return template.replace(/\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   return (
//     <div className="flex flex-col items-center bg-gray-100 min-h-screen p-5">
//       <div className="flex gap-5 mb-8">
//         <div className="border-2 border-blue-500 rounded-2xl p-5 bg-white shadow-md w-96">
//           <h1 className="text-2xl font-bold text-blue-500 mb-4">Front Side</h1>
//           <div dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, student) }}></div>
//         </div>

//         <div className="border-2 border-blue-500 rounded-2xl p-5 bg-white shadow-md w-96">
//           <h1 className="text-2xl font-bold text-blue-500 mb-4">Back Side</h1>
//           <div dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, student) }}></div>
//         </div>
//       </div>

//       <div className="w-full max-w-4xl space-y-6">
//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Front Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border border-blue-500 rounded-lg"
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//           />
//         </div>

//         <div>
//           <label className="block text-lg font-medium mb-2">Edit Back Side Template:</label>
//           <textarea
//             className="w-full h-32 p-3 border border-blue-500 rounded-lg"
//             value={backTemplate}
//             onChange={(e) => setBackTemplate(e.target.value)}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;


// import React from 'react'

// const Testing = () => {
//   return (
//     <div>Testing</div>
//   )
// }

// export default Testing

// import React, { useEffect, useRef, useState } from "react";
// // import {
// //   AllTemplate,
// //   CreateTemplate,
// //   UpdateTemplate,
// // } from "../Store/Slice/TemplateSlice";
// // import { Toast } from "primereact/toast";
// // import { Checkbox } from "primereact/checkbox";
// // import { FileUpload } from "primereact/fileupload";
// import Compressor from "compressorjs";
// import axios from "axios";
// // import { useDispatch, useSelector } from "react-redux";
// const ImageTest = ({ data }) => {
//   const [formData, setFormData] = useState();
//   const [checked, setChecked] = useState(false);
//   const [template, setTemplate] = useState(``);
//   const [temp, setTemp] = useState();
//   const [template2, setTemplate2] = useState(``);
//   const [temp2, setTemp2] = useState();
//   const [student, setStudent] = useState(``);
// //   const dispatch = useDispatch();
//   const toast = useRef();
// //   const { Templates } = useSelector((state) => state.Templete);

// //   useEffect(() => {
// //     axios
// //       .get("https://655302f75449cfda0f2dfe0f.mockapi.io/student")
// //       .then((response) => {
// //         setStudent(response.data[0]);
// //       });
// //     dispatch(AllTemplate(data)).then((doc) => {
// //       setFormData(doc.payload[0]);
// //       setTemplate(doc.payload[0]?.temp);
// //       setTemp(doc.payload[0]?.tempimage);
// //       setTemplate2(doc.payload[0]?.temp2);
// //       setTemp2(doc.payload[0]?.tempimage2);
// //       setChecked(doc.payload[0]?.status);
// //     });
// //   }, [dispatch]);

// //   useEffect(() => {
// //     dispatch(AllTemplate(data)).then((doc) => {
// //       setFormData(doc.payload[0]);
// //       setTemplate(doc.payload[0]?.temp);
// //       setTemp(doc.payload[0]?.tempimage);
// //       setTemplate2(doc.payload[0]?.temp2);
// //       setTemp2(doc.payload[0]?.tempimage2);

// //       setChecked(doc.payload[0]?.status);
// //     });
// //   }, [dispatch]);

// //   const showSuccessToast = (message) => {
// //     toast.current.show({
// //       severity: "success",
// //       summary: "Success Message",
// //       detail: message,
// //       life: 3000,
// //     });
// //   };

//   // Replace placeholders in template with student data
//   const renderTemplate = () => {
//     let modifiedTemplate = template || "";
//     modifiedTemplate = modifiedTemplate.replace("${name}", student?.name);
//     modifiedTemplate = modifiedTemplate.replace("${class}", student?.class);
//     modifiedTemplate = modifiedTemplate.replace("${section}", student?.section);
//     modifiedTemplate = modifiedTemplate.replace(
//       "${admission_id}",
//       student?.admission_id
//     );
//     modifiedTemplate = modifiedTemplate.replace(
//       "${father_name}",
//       student?.father_name
//     );
//     modifiedTemplate = modifiedTemplate.replace(
//       "${admission_id}",
//       student?.admission_id
//     );
//     modifiedTemplate = modifiedTemplate.replace("${dob}", student?.dob);
//     modifiedTemplate = modifiedTemplate.replace(
//       "${transport}",
//       student?.transport
//     );
//     modifiedTemplate = modifiedTemplate.replace(
//       "${mothername}",
//       student?.mothername
//     );
//     modifiedTemplate = modifiedTemplate.replace("${rollno}", student?.rollno);
//     modifiedTemplate = modifiedTemplate.replace("${remark}", student?.remark);
//     modifiedTemplate = modifiedTemplate.replace("${mobile}", student?.mobile);
//     modifiedTemplate = modifiedTemplate.replace("${address}", student?.address);
//     modifiedTemplate = modifiedTemplate.replace("${PuchSheelIcard}", temp);
//     return modifiedTemplate;
//   };

//   const renderTemplate2 = (data) => {
//     let modifiedTemplate = template2 || "";
//     modifiedTemplate = modifiedTemplate.replace("${PuchSheelIcard}", temp2);
//     modifiedTemplate = modifiedTemplate.replace(
//       "${fathername}",
//       student?.father_name
//     );
//     modifiedTemplate = modifiedTemplate.replace(
//       "${fatherimage}",
//       student?.fatherimage
//     );  modifiedTemplate = modifiedTemplate.replace(
//       "${admission_id}",
//       student?.admission_id
//     );
//     modifiedTemplate = modifiedTemplate.replace(
//       "${mothername}",
//       student?.mothername
//     );
//     modifiedTemplate = modifiedTemplate.replace(
//       "${motherimage}",
//       student?.motherimage
//     );
//     modifiedTemplate = modifiedTemplate.replace(
//       "${guardianname}",
//       student?.guardianname
//     );
//     modifiedTemplate = modifiedTemplate.replace(
//       "${guardianimage}",
//       student?.guardianimage
//     );

//     modifiedTemplate = modifiedTemplate.replace(
//       "${mothername}",
//       student?.mothername
//     );
//     return modifiedTemplate;
//   };

// //   const onSave = () => {
// //     dispatch(
// //       CreateTemplate({
// //         ...formData,
// //         tempimage: temp,
// //         tempimage2: temp2,
// //         status: checked,
// //         temp: template,
// //         temp2: template2,
// //         schoolid: data,
// //       })
// //     ).then((e) => showSuccessToast(e.payload?.message));
// //   };

// //   const onUpdate = () => {
// //     dispatch(
// //       UpdateTemplate({
// //         ...formData,
// //         tempimage: temp,
// //         tempimage2: temp2,
// //         status: checked,
// //         temp: template,
// //         temp2: template2,
// //         schoolid: data,
// //       })
// //     ).then((e) => showSuccessToast(e.payload?.message));
// //   };

// //   const handleFileChange = async (event) => {
// //     const file = event.target.files[0];
// //     if (file) {
// //       const reader = new FileReader();
// //       reader.onload = async (event) => {
// //         const blob = await fetch(event.target.result).then((res) => res.blob());
// //         const compressedFile = await compressFile(blob);
// //         const base64 = await convertToBase64(compressedFile);
// //         setTemp("data:image/png;base64," + base64); // Prepend data URI prefix
// //       };
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   const handleFileChange2 = async (event) => {
// //     const file = event.target.files[0];
// //     if (file) {
// //       const reader = new FileReader();
// //       reader.onload = async (event) => {
// //         const blob = await fetch(event.target.result).then((res) => res.blob());
// //         const compressedFile = await compressFile(blob);
// //         const base64 = await convertToBase64(compressedFile);
// //         setTemp2("data:image/png;base64," + base64); // Prepend data URI prefix
// //       };
// //       reader.readAsDataURL(file);
// //     }
// //   };

// //   const compressFile = async (fileData) => {
// //     return new Promise((resolve, reject) => {
// //       new Compressor(fileData, {
// //         // maxWidth: 800, // Change this as per your requirements
// //         // maxHeight: 600, // Change this as per your requirements
// //         quality: 0.8, // Change this as per your requirements
// //         success(result) {
// //           resolve(result);
// //         },
// //         error(error) {
// //           reject(error);
// //         },
// //       });
// //     });
// //   };

// //   const convertToBase64 = (fileData) => {
// //     return new Promise((resolve, reject) => {
// //       const reader = new FileReader();
// //       reader.onload = () => resolve(reader.result.split(",")[1]);
// //       reader.onerror = (error) => reject(error);
// //       reader.readAsDataURL(fileData);
// //     });
// //   };

//   return (
//     <>
//       {/* <Toast ref={toast} /> */}
//       <div className="flex gap-3">
//         <div className="w-full">
//           <h1 className="py-2 font-bold">Front Side</h1>
//           <div dangerouslySetInnerHTML={{ __html: renderTemplate() }}></div>
//           <span className="flex items-center gap-3">
//             <label className="capitalize font-medium">
//               select Icard template
//             </label>
//             <input type="file" 
//             // onChange={handleFileChange} 
//             accept="image/*" />
//           </span>
//           <span className="flex flex-col gap-3">
//             <label className="capitalize font-medium">Paste Template</label>
//             <textarea
//               name="temp"
//               value={template}
//             //   onChange={(e) => setTemplate(e.target.value)}
//               className="border border-black h-32"
//             ></textarea>
//           </span>
//         </div>
//         <div className="w-full">
//           <h1 className="py-2 font-bold">Back Side</h1>
//           <div dangerouslySetInnerHTML={{ __html: renderTemplate2() }}></div>
//           <span className="flex items-center gap-3">
//             <label className="capitalize font-medium">
//               select Icard template
//             </label>
//             <input type="file" 
//             // onChange={handleFileChange2} 
//             accept="image/*" />
//           </span>
//           <span className="flex flex-col gap-3">
//             <label className="capitalize font-medium">Paste Template</label>
//             <textarea
//               name="temp2"
//               value={template2}
//             //   onChange={(e) => setTemplate2(e.target.value)}
//               className="border border-black h-32"
//             ></textarea>
//           </span>
//         </div>
//       </div>
//       {/* <span className="flex items-center gap-3 my-3">
//         <Checkbox
//           type="checkbox"
//           className="outline outline-1 rounded-md"
//           name="status"
//         //   onChange={(e) => setChecked(e.checked)}
//           checked={checked}
//         ></Checkbox>
//         <label className="capitalize font-medium">Active Template</label>
//       </span> */}
//       {/* <span className="flex flex-col">
//         {!Templates[0] ? (
//           <button
//             onClick={onSave}
//             className="bg-cyan-500 text-white py-3 rounded-lg"
//           >
//             Create
//           </button>
//         ) : (
//           <button
//             onClick={onUpdate}
//             className="bg-cyan-500 text-white py-3 rounded-lg"
//           >
//             Update
//           </button>
//         )}
//       </span> */}
//     </>
//   );
// };

// export default ImageTest;




