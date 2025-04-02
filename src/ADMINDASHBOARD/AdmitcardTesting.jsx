import React, { useState } from "react";

const ImageTest = () => {
  // Use String.raw to preserve backslashes
  const [frontTemplate, setFrontTemplate] = useState(String.raw`
<div style='background-image:url(\\\${PuchSheelIcard}); background-position: center; background-repeat: no-repeat; width: 190mm; height: 84mm; position: relative; background-size:cover; border:1px solid'>
  <div style='margin-left: 570px; margin-top: 122px; width: 110px; height: 110px; border: 0.5px solid #ff0000; border-radius: 4px; overflow:hidden; position:absolute'>
    <img src='\\\${NO_IMAGE}' style='width: 100%; height: 100%;'/>
  </div>

  <div style='position: absolute; left: 120px; top: 135px;'>
    <p style='font-size:13pt; text-transform: uppercase; margin-top: 8px; color: BLACK; font-weight: bold;'>
      <span style="margin-left: 16px; font-weight: bold;"> \\\${name} </span>
    </p>
    <p style='font-size:13pt; margin-top: 18px; color: BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase;'>
      <span style="margin-left: 130px; font-weight: bold;"> \\\${father_name} </span>
    </p>
    <p style='font-size:13pt; text-transform: uppercase; margin-top: 20px; color: BLACK; margin-right: 1px; font-weight: bold;'>
      <span style="margin-left: 29px; font-weight: bold;"> \\\${class} </span>
    </p>
    <p style='font-size:13pt; margin-top: 19px; color: BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase;'>
      <span style="margin-left:110px; font-weight: bold;"> Final semester (24-2025) </span>
    </p>
  </div>
</div>
`);

  // Student details to fill the placeholders
  // const [student, setStudent] = useState({
  //   name: "John Doe",
  //   father_name: "Mr. Doe",
  //   class: "10th Grade",
  //   PuchSheelIcard: "https://via.placeholder.com/190x84?text=Card+BG",
  //   NO_IMAGE: "https://via.placeholder.com/110?text=Photo",
  // });

  // Render the template by replacing placeholders with student data
  const renderTemplate = (template, data) => {
    return template.replace(/\\\${(\w+)}/g, (_, key) => data[key] || "");
  };

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>ID Card Preview</h1>
      <div
        dangerouslySetInnerHTML={{
          __html: renderTemplate(frontTemplate),
        }}
      />

      <h2>Edit Template</h2>
      <textarea
        style={{
          width: "100%",
          height: "300px",
          padding: "1rem",
          fontFamily: "monospace",
          whiteSpace: "pre-wrap",
        }}
        value={frontTemplate}
        onChange={(e) => setFrontTemplate(e.target.value)}
      />
    </div>
  );
};

export default ImageTest;



// import React, { useState } from "react";

// const ImageTest = () => {
//   // Using String.raw to help preserve the backslashes
//   const [frontTemplate, setFrontTemplate] = useState(String.raw`
// <div style='background-image:url(\\\${PuchSheelIcard}); background-position: center; background-repeat: no-repeat; width: 190mm; height: 84mm; position: relative; background-size: cover; border:1px solid'>
//   <div style='margin-left: 570px; margin-top: 122px; width: 110px; height: 110px; border: 0.5px solid #ff0000; border-radius: 4px; overflow:hidden; position:absolute'>
//     <img src='\\\${NO_IMAGE}' style='width: 100%; height: 100%;'/>
//   </div>
//   <div style='position: absolute; left: 120px; top: 135px;'>
//     <p style='font-size:13pt; text-transform: uppercase; margin-top: 8px; color: BLACK; font-weight: bold;'>
//       <span style="margin-left: 16px; font-weight: bold;"> \\\${name} </span>
//     </p>
//     <p style='font-size:13pt; margin-top: 18px; color: BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase;'>
//       <span style="margin-left: 130px; font-weight: bold;"> \\\${father_name} </span>
//     </p>
//     <p style='font-size:13pt; text-transform: uppercase; margin-top: 20px; color: BLACK; margin-right: 1px; font-weight: bold;'>
//       <span style="margin-left: 29px; font-weight: bold;"> \\\${class} </span>
//     </p>
//     <p style='font-size:13pt; margin-top: 19px; color: BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase;'>
//       <span style="margin-left: 110px; font-weight: bold;"> Final semester (24-2025) </span>
//     </p>
//   </div>
// </div>
// `);

//   const [student, setStudent] = useState({
//     name: "John Doe",
//     father_name: "Mr. Doe",
//     class: "10th Grade",
//     PuchSheelIcard: "https://via.placeholder.com/190x84?text=Card+BG",
//     NO_IMAGE: "https://via.placeholder.com/110?text=Photo",
//   });

//   // This function will replace the placeholders with the corresponding student data.
//   const renderTemplate = (template, data) => {
//     // The regex looks for \\\${...} in the template string
//     return template.replace(/\\\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   return (
//     <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
//       <h1>ID Card Preview</h1>
//       <div
//         dangerouslySetInnerHTML={{
//           __html: renderTemplate(frontTemplate, student),
//         }}
//       />

//       <h2>Edit Template</h2>
//       <textarea
//         style={{
//           width: "100%",
//           height: "300px",
//           padding: "1rem",
//           fontFamily: "monospace",
//           whiteSpace: "pre-wrap",
//         }}
//         value={frontTemplate}
//         onChange={(e) => setFrontTemplate(e.target.value)}
//       />
//     </div>
//   );
// };

// export default ImageTest;



// import React, { useState } from "react";

// const ImageTest = () => {
//   // Front template with escaped placeholders using String.raw
//   const [frontTemplate, setFrontTemplate] = useState(String.raw`
// <div style='background-image:url(\\\${PuchSheelIcard}); background-position: center; background-repeat: no-repeat; width: 190mm; height: 84mm; position: relative; background-size: cover; border:1px solid'>
//   <div style='margin-left: 570px; margin-top: 122px; width: 110px; height: 110px; border: 0.5px solid #ff0000; border-radius: 4px; overflow:hidden; position:absolute'>
//     <img src='\\\${NO_IMAGE}' style='width: 100%; height: 100%;'/>
//   </div>
//   <div style='position: absolute; left: 120px; top: 135px;'>
//     <p style='font-size:13pt; text-transform: uppercase; margin-top: 8px; color: BLACK; font-weight: bold;'>
//       <span style="margin-left: 16px; font-weight: bold;"> \\${name} </span>
//     </p>
//     <p style='font-size:13pt; margin-top: 18px; color: BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase;'>
//       <span style="margin-left: 130px; font-weight: bold;"> \\${father_name} </span>
//     </p>
//     <p style='font-size:13pt; text-transform: uppercase; margin-top: 20px; color: BLACK; margin-right: 1px; font-weight: bold;'>
//       <span style="margin-left: 29px; font-weight: bold;"> \\${class} </span>
//     </p>
//     <p style='font-size:13pt; margin-top: 19px; color: BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase;'>
//       <span style="margin-left: 110px; font-weight: bold;"> Final semester (24-2025) </span>
//     </p>
//   </div>
// </div>
//   `);

//   // Student object with details & placeholder values for images
//   const [student, setStudent] = useState({
//     name: "John Doe",
//     father_name: "Mr. Doe",
//     class: "10th Grade",
//     PuchSheelIcard: "https://via.placeholder.com/190x84?text=Card+BG",
//     NO_IMAGE: "https://via.placeholder.com/110?text=Photo",
//   });

//   // Function to replace escaped placeholders with student data
//   const renderTemplate = (template, data) => {
//     // Regex: Matches \${...} in the template
//     return template.replace(/\\\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   return (
//     <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
//       <h1>ID Card Preview</h1>
//       <div
//         dangerouslySetInnerHTML={{
//           __html: renderTemplate(frontTemplate, student),
//         }}
//       />

//       <h2>Edit Template</h2>
//       <textarea
//         style={{
//           width: "100%",
//           height: "300px",
//           padding: "1rem",
//           fontFamily: "monospace",
//           whiteSpace: "pre-wrap",
//         }}
//         value={frontTemplate}
//         onChange={(e) => setFrontTemplate(e.target.value)}
//       />
//     </div>
//   );
// };

// export default ImageTest;
