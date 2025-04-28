import React, { useState } from "react";
import { toast } from "react-toastify";
// import { design } from "../Network/AdminApi"; // Assuming API function path is correct
import moment from "moment";
import { design } from "../Network/AdminApi";

const Button = ({ name, onClick, color, style }) => (
    <button style={{ backgroundColor: color || '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', margin: '5px', ...style }} onClick={onClick}>{name}</button>
);

// --- Sample Student Data (using the provided structure) ---
const detailedSampleStudent = {
    "_id": "680836dcc86519be36edb8b1",
    "studentId": "91b2793f-d08d-4c24-92a6-5d95929bc242",
    "schoolId": "ef335693-3a2a-47c2-8dc6-cb8c882075f5",
    "session": "2025-2026",
    "studentName": "dk",
    "email": "dk1234567890@gmail.com",
    "dateOfBirth": "2025-04-23T00:00:00.000Z",
    "motherName": "Mrs. Mother Sample", // Added for completeness
    "fatherName": "dkppppp",
    "parentContact": 1234567890,
    "role": "student",
    "status": "active",
    "gender": "Male",
    "joiningDate": "23-Apr-2025",
    "address": "Delhi ,laxami nagar",
    "contact": 1234567890,
    "class": "I",
    "section": "A",
    "subject": [],
    "guardianName": "Mrs. Guardian Sample",
    "studentImage": {
        "public_id": "students/photos/1745368734538-student_photo_1745368718886.jpeg",
        "url": "https://minio.digitalvidyasaarthi.in/digitalvidyasaarthi/students/photos/1745368734538-student_photo_1745368718886.jpeg"
        // "url": "https://via.placeholder.com/85x95/aabbcc?text=Student" // Alt placeholder
    },
    "fatherImage": { "public_id": "", "url": "https://via.placeholder.com/60x70/ffcccc?text=Father" }, // Added placeholder URL
    "motherImage": { "public_id": "", "url": "https://via.placeholder.com/60x70/ccffcc?text=Mother" }, // Added placeholder URL
    "guardianImage": { "public_id": "", "url": "" }, // Example of missing URL
    "admissionNumber": "DI1151",
    "isGenerated": true,
    "isPrinted": false,
    "approvalStatus": "pending",
    "sessionHistory": [],
    "isNewAdmission": true,
    "assignedThirdParty": "d00d14fb-04c1-4cdb-9143-28d815107d90",
    "photoId": "e4555584-e113-41a4-8e11-0bd4c8d31a03",
    "udisePlusDetails": { "mother_name": "", "father_name": "dkppppp", "guardian_name": "" },
    "createdAt": "2025-04-23T00:39:56.140Z",
    "__v": 0,
    "parentAdmissionNumber": "DI1109",
    "parentId": "680836dcc86519be36edb8b6"
};


const ImageTest = () => {
    const [frontBackgroundImage, setFrontBackgroundImage] = useState("https://via.placeholder.com/204x325/e0f0ff?text=Front+BG");
    const [uploadedFrontImageFile, setUploadedFrontImageFile] = useState(null);

    const [frontTemplate, setFrontTemplate] = useState(`
<div style='background-image:url(\${backgroundImage}); background-position: center;background-repeat: no-repeat;width: 54mm;height: 86mm;position: relative;background-size:cover;border:1px solid #ccc; box-sizing: border-box; overflow: hidden;'>
    <div style='margin-left: 60px; margin-top: 92px; width: 85px; height: 95px; border: 0.5px solid #ff0000; border-radius: 4px; overflow:hidden; position:absolute; background-color: #eee;'>
        <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student"/>
    </div>
    
     <div style='position: absolute; left: 150px; top: 145px; width: calc(54mm - 6px); font-family: sans-serif; '>
   <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>ADM No.</p>
 <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'> \${admissionNumber}</p>
</div/>
    <div style='position: absolute; left: 3px; top: 205px; width: calc(54mm - 6px); font-family: sans-serif; '>
        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>NAME<span style="margin-left: 16px; font-weight: bold;">: \${name}</span></p>
        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>CLASS<span style="margin-left: 13px; font-weight: bold;">: \${class}</span></p>
        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>F.NAME<span style="margin-left: 9px; font-weight: bold;">: \${father_name}</span></p>
        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>PHONE<span style="margin-left: 12px; font-weight: bold;">: \${mobile}</span></p>
        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>DOB<span style="margin-left: 12px; font-weight: bold;">: \${dob}</span></p>
        <p style='font-size:10px; text-transform: uppercase; margin: 0; color:BLACK; font-weight: bold; line-height: 1.2;'>ADDRESS<span style="margin-left: 1px; font-weight: bold;">: \${address}</span></p>
    </div>
</div>`);

    const [backBackgroundImage, setBackBackgroundImage] = useState("https://via.placeholder.com/204x325/cccccc?text=Back+BG");
    const [uploadedBackImageFile, setUploadedBackImageFile] = useState(null);

    // --- Updated Back Template ---
  // --- Updated Back Template ---
const [backTemplate, setBackTemplate] = useState(`
    <div style='background-image:url(\${backgroundImage}); background-position: center; background-repeat: no-repeat; width: 54mm; height: 86mm; position: relative; background-size: cover; border: 1px solid #ccc; box-sizing: border-box; overflow: hidden; font-family: sans-serif;'>
    
        <div style='position: absolute; left: 160px; top: 5px; width: calc(54mm - 6px); font-family: sans-serif; '>
 <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'> \${admissionNumber}</p>
</div/>
        <div style='
            margin-left: 5px;
            margin-top: 165px; 
            width: 60px;
            height: 85px; 
            
            border-radius: 4px;
            overflow: hidden;
            position: absolute;
            background-color: #eee; 
            text-align: center; 
            
        '>
            <img src='\${fatherImage}' style='
                width: 100%; 
                height: 65px; 
                object-fit: cover;
                display: block; 
                margin-bottom: 2px; 
            ' alt="Father"/>
            <p style='
                font-size: 8px;
                color: #333;
                margin: 0;
                line-height: 1.1;
                font-weight: bold;
            '>Father</p>
        </div>
    
   
        <div style='
            margin-left: 70px;
            margin-top: 165px; 
            width: 60px;
            height: 85px; 
            
            border-radius: 4px;
            overflow: hidden;
            position: absolute;
            background-color: #eee;
            text-align: center;
        '>
            <img src='\${motherImage}' style='
                width: 100%;
                height: 65px;
                object-fit: cover;
                display: block;
                margin-bottom: 2px;
            ' alt="Mother"/>
            <p style='
                font-size: 8px;
                color: #333;
                margin: 0;
                line-height: 1.1;
                font-weight: bold;
            '>Mother</p>
        </div>
    
 
        <div style='
            margin-left: 135px;
            margin-top: 165px;
            width: 60px;
            height: 85px; 
            
            border-radius: 4px;
            overflow: hidden;
            position: absolute;
            background-color: #eee;
            text-align: center;
        '>
            <img src='\${guardianImage}' style='
                width: 100%;
                height: 65px;
                object-fit: cover;
                display: block;
                margin-bottom: 2px;
             ' alt="Guardian"/>
             <p style='
                font-size: 8px;
                color: #333;
                margin: 0;
                line-height: 1.1;
                font-weight: bold;
            '>Guardian</p>
        </div>
    
     
       
    
    </div>`);

    // --- Updated Render Template Function ---
    const renderTemplate = (templateString, backgroundUrl, student) => {
        const placeholderPersonImage = "https://via.placeholder.com/80x90.png?text=N/A"; // General placeholder
        const data = {
          backgroundImage: backgroundUrl || '', // Added backgroundImage directly
          studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Img",
          name: student?.studentName?.toUpperCase() || 'N/A',
          class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
          father_name: student?.fatherName?.toUpperCase() || 'N/A',
          mother_name: student?.motherName?.toUpperCase() || 'N/A', // Added mother's name
          mobile: student?.contact || student?.parentContact || 'N/A', // Fallback contact
          dob:   student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
          address: student?.address || 'N/A',
          guardianname: student?.guardianName || 'N/A',
          session: student?.session || 'N/A',
          // --- Data specifically for back template placeholders ---
          fatherImage: student?.fatherImage?.url || placeholderPersonImage,
          motherImage: student?.motherImage?.url || placeholderPersonImage,
          guardianImage: student?.guardianImage?.url || placeholderPersonImage,
          admissionNumber: student?.admissionNumber || 'N/A'
        };

        let renderedHtml = templateString;

        try {
          // Replacement logic using a single regex for efficiency
          renderedHtml = renderedHtml.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
            const cleanKey = key.trim();
            // Check if the key exists in our data object (case-sensitive)
            if (data.hasOwnProperty(cleanKey)) {
              // Return the value, converting null/undefined to empty string
              return String(data[cleanKey] ?? '');
            } else {
              // If placeholder not found in data, return empty string or the placeholder itself for debugging
              console.warn(`Placeholder \${${cleanKey}} not found in data object.`);
              return ''; // Return empty string to avoid showing the placeholder text
            }
          });
        } catch (error) {
          console.error("Error during template placeholder replacement:", error);
          // Provide a clear error message within the preview itself
          return `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; box-sizing: border-box; text-align: center; padding: 5px; page-break-inside: avoid;'>Template Rendering Error: ${error.message}</div>`;
        }
        return renderedHtml;
      };


    const handleFileChange = (e, side) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                if (side === 'front') { setFrontBackgroundImage(reader.result); setUploadedFrontImageFile(file); }
                else if (side === 'back') { setBackBackgroundImage(reader.result); setUploadedBackImageFile(file); }
            };
            reader.onerror = (error) => {
                console.error("FileReader error:", error);
                toast.error(`Error reading ${side} file.`);
                if (side === 'front') { setUploadedFrontImageFile(null); setFrontBackgroundImage("https://via.placeholder.com/204x325/e0f0ff?text=Front+BG"); } // Reset on error
                else { setUploadedBackImageFile(null); setBackBackgroundImage("https://via.placeholder.com/204x325/cccccc?text=Back+BG"); } // Reset on error
            };
            reader.readAsDataURL(file);
        } else {
             if (side === 'front') setUploadedFrontImageFile(null); else setUploadedBackImageFile(null);
        }
        e.target.value = null; // Allow re-uploading the same file
    };

    const handleSaveClick = async () => {
        try {
            const formDataToSend = new FormData();
            const contentArray = [];

            // Helper to safely encode to Base64
            const utf8ToBase64 = (str) => {
                try {
                    // Directly encode the string, assuming it's valid UTF-8 (HTML templates usually are)
                    return btoa(unescape(encodeURIComponent(str)));
                } catch (e) {
                    console.error("Base64 encoding error:", e, "Input string:", str);
                    toast.error("Error encoding template data. Check template content for invalid characters.");
                    return null; // Indicate failure
                }
            };

            // --- Front Side ---
            // No need to JSON.stringify the template string itself
            const frontBase64 = utf8ToBase64(frontTemplate);
            if (frontBase64 === null) return; // Stop if encoding failed
            const frontContent = { data: frontBase64, name: "Front Side" };
            contentArray.push(frontContent);

            // --- Back Side ---
             // No need to JSON.stringify the template string itself
            const backBase64 = utf8ToBase64(backTemplate);
            if (backBase64 === null) return; // Stop if encoding failed
            const backContent = { data: backBase64, name: "Back Side" };
            contentArray.push(backContent);

            // --- Append other data ---
            formDataToSend.append("name", "Student ID Card Design");
            formDataToSend.append("type", "idCard");
            formDataToSend.append("description", "Front/back design template with background");
            formDataToSend.append("isDefault", "true"); // Should likely be controlled by UI state
            formDataToSend.append("isPublic", "false"); // Should likely be controlled by UI state
            formDataToSend.append("content", JSON.stringify(contentArray)); // Stringify the array of content objects

            if (uploadedFrontImageFile instanceof File) {
                formDataToSend.append(`content[0][image]`, uploadedFrontImageFile, uploadedFrontImageFile.name);
                 console.log("Appending Front File:", uploadedFrontImageFile.name);
            }
            if (uploadedBackImageFile instanceof File) {
                formDataToSend.append(`content[1][image]`, uploadedBackImageFile, uploadedBackImageFile.name);
                 console.log("Appending Back File:", uploadedBackImageFile.name);
            }
            const response = await design(formDataToSend); // Use the actual API call

            if (response?.success) {
               toast.success(response.message || "Designs saved successfully!");
            } else {
               // Use warn for non-critical failures, error for critical ones
               toast.warn(response?.message || "Save operation completed with warnings or failed.");
            }
        } catch (error) {
            console.error("Save Error:", error);
            const msg = error?.response?.data?.message || error?.message || 'An unexpected error occurred while saving.';
            toast.error(msg);
        }
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>ID Card Design Editor (Front & Back)</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

                {/* Front Side Editor */}
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                    <h3>Front Side</h3>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        <div style={{ flex: 'none', minWidth: '210px', marginBottom: '10px' }}>
                            <h4>Preview:</h4>
                            <div
                                style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0, verticalAlign: 'top' }}
                                dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, frontBackgroundImage, detailedSampleStudent) }}
                            />
                        </div>
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <div>
                                <label htmlFor="front-bg-upload">Upload Front BG Image:</label>
                                <input type="file" id="front-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
                            </div>
                            <div>
                                <label htmlFor="front-template-edit">Edit Front HTML Template:</label>
                                <textarea
                                    id="front-template-edit"
                                    value={frontTemplate}
                                    onChange={(e) => setFrontTemplate(e.target.value)}
                                    rows={15}
                                    style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Back Side Editor */}
                <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
                     <h3>Back Side</h3>
                     <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                         <div style={{ flex: 'none', minWidth: '210px', marginBottom: '10px' }}>
                             <h4>Preview:</h4>
                             <div
                                 style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0, verticalAlign: 'top' }}
                                 dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, backBackgroundImage, detailedSampleStudent) }} // Use renderTemplate for back
                             />
                         </div>
                         <div style={{ flex: 1, minWidth: '300px' }}>
                             <div>
                                 <label htmlFor="back-bg-upload">Upload Back BG Image:</label>
                                 <input type="file" id="back-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
                             </div>
                             <div>
                                 <label htmlFor="back-template-edit">Edit Back HTML Template:</label>
                                 <textarea
                                     id="back-template-edit"
                                     value={backTemplate}
                                     onChange={(e) => setBackTemplate(e.target.value)}
                                     rows={15}
                                     style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                 />
                             </div>
                         </div>
                     </div>
                </div>
            </div>
            <div style={{ marginTop: '30px', textAlign: 'center' }}>
                 <Button name="Save Both Designs" onClick={handleSaveClick} color="#28a745" />
            </div>
        </div>
    );
};

export default ImageTest;
// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import { design } from "../Network/AdminApi"; // Assuming API function path is correct
// import moment from "moment";

// // --- Placeholder Button ---
// const Button = ({ name, onClick, color, style }) => (
//     <button style={{ backgroundColor: color || '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', margin: '5px', ...style }} onClick={onClick}>{name}</button>
// );

// // --- Sample Student Data (using the provided structure) ---
// const detailedSampleStudent = {
//     "_id": "680836dcc86519be36edb8b1",
//     "studentId": "91b2793f-d08d-4c24-92a6-5d95929bc242",
//     "schoolId": "ef335693-3a2a-47c2-8dc6-cb8c882075f5",
//     "session": "2025-2026",
//     "studentName": "dk",
//     "email": "dk1234567890@gmail.com",
//     "dateOfBirth": "2025-04-23T00:00:00.000Z",
//     "motherName": "",
//     "fatherName": "dkppppp",
//     "parentContact": 1234567890,
//     "role": "student",
//     "status": "active",
//     "gender": "Male",
//     "joiningDate": "23-Apr-2025",
//     "address": "Delhi ,laxami nagar",
//     "contact": 1234567890,
//     "class": "I",
//     "section": "A",
//     "subject": [],
//     "guardianName": "Mrs. Guardian Sample",
//     "studentImage": {
//         "public_id": "students/photos/1745368734538-student_photo_1745368718886.jpeg",
//         "url": "https://minio.digitalvidyasaarthi.in/digitalvidyasaarthi/students/photos/1745368734538-student_photo_1745368718886.jpeg"
//         // "url": "https://via.placeholder.com/85x95/aabbcc?text=Student"
//     },
//     "fatherImage": { "public_id": "", "url": "" },
//     "motherImage": { "public_id": "", "url": "" },
//     "guardianImage": { "public_id": "", "url": "" },
//     "admissionNumber": "DI1151",
//     "isGenerated": true,
//     "isPrinted": false,
//     "approvalStatus": "pending",
//     "sessionHistory": [],
//     "isNewAdmission": true,
//     "assignedThirdParty": "d00d14fb-04c1-4cdb-9143-28d815107d90",
//     "photoId": "e4555584-e113-41a4-8e11-0bd4c8d31a03",
//     "udisePlusDetails": { "mother_name": "", "father_name": "dkppppp", "guardian_name": "" },
//     "createdAt": "2025-04-23T00:39:56.140Z",
//     "__v": 0,
//     "parentAdmissionNumber": "DI1109",
//     "parentId": "680836dcc86519be36edb8b6"
// };


// const ImageTest = () => {
//     const [frontBackgroundImage, setFrontBackgroundImage] = useState("https://via.placeholder.com/204x325/e0f0ff?text=Front+BG");
//     const [uploadedFrontImageFile, setUploadedFrontImageFile] = useState(null);

//     const [frontTemplate, setFrontTemplate] = useState(`
//         <div style='background-image:url(\${backgroundImage}); background-position: center;background-repeat: no-repeat;width: 54mm;height: 86mm;position: relative;background-size:cover;border:1px solid'>


//             <div style='margin-left: 60px;margin-top: 92px;width: 85px;height: 95px;border: 0.5px solid #ff0000;border-radius: 4px;overflow:hidden;position:absolute'>
//              <img src='\${studentImage}' style='width: 100%;height: 100%; object-fit: cover;' alt="Student"/>
//             </div>


//             <div style='position: absolute; left: 3px; top: 205px; 
//              width: calc(54mm - 6px);font-family: sans-serif; '>

               
//                 <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>NAME<span style="margin-left: 16px; font-weight: bold;">: \${name}</span></p>
//                 <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>CLASS<span style="margin-left: 13px; font-weight: bold;">: \${class}</span></p>
//                 <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>F.NAME<span style="margin-left: 9px; font-weight: bold;">: \${father_name}</span></p>
//                 <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>PHONE<span style="margin-left: 12px; font-weight: bold;">: \${mobile}</span></p>
//                 <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>DOB<span style="margin-left: 12px; font-weight: bold;">: \${dob}</span></p>
               
//                 <p style='font-size:10px; text-transform: uppercase; margin: 0; color:BLACK; font-weight: bold; line-height: 1.2;'>ADDRESS<span style="margin-left: 1px; font-weight: bold;">: \${address}</span></p>
           

//             </div>
//         </div>
//         `);

//     const [backBackgroundImage, setBackBackgroundImage] = useState("https://via.placeholder.com/204x325/cccccc?text=Back+BG");
//     const [uploadedBackImageFile, setUploadedBackImageFile] = useState(null);
//     const [backTemplate, setBackTemplate] = useState(`
// <div style='background-image:url(\${backgroundImage});
//             background-position: center;
//             background-repeat: no-repeat;
//             width: 54mm;
//             height: 86mm;
//             position: relative;
//             background-size: cover;
//             border: 1px solid #ccc;
//             font-family: Arial, sans-serif;
//             overflow: hidden;
//             box-sizing: border-box;
//             padding: 5mm;'>

//     <h3 style='text-align:center; font-size: 9pt; margin: 0 0 5mm 0; color: #333;'>STUDENT ID CARD</h3>

//     <p style='font-size: 7pt; margin: 0 0 3mm 0; line-height: 1.3;'>
//         This card certifies that <strong>\${name}</strong> is a student of [Your School Name Here].
//     </p>
//     <p style='font-size: 7pt; margin: 0 0 3mm 0;'>
//         Session: \${session}
//     </p>
//     <p style='font-size: 7pt; margin: 0 0 3mm 0;'>
//         Guardian: \${guardianname}
//     </p>
//     <p style='font-size: 7pt; margin: 8mm 0 4mm 0; text-align: center; line-height: 1.3;'>
//         <strong>If found, please return to:</strong><br/>
//         [Your School Address Here]<br/>
//         [Your School Phone Here]
//     </p>

//     <!-- Signature block -->
//     <div style='position: absolute; bottom: 8mm; left: 0; right: 0; text-align: center;'>
//         <p style='font-size: 6pt; margin: 0 0 0.5mm 0;'>Signature:</p>
//         <div style='border-bottom: 1px solid #555; height: 8mm; width: 40mm; margin: 0 auto;'></div>
//         <p style='font-size: 6pt; margin: 0.5mm 0 0 0;'>Principal</p>
//     </div>
// </div>`);

//     const renderTemplate = (templateString, backgroundUrl, student) => {
//         const data = {
//           studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Img",
//           name: student?.studentName?.toUpperCase() || 'N/A',
//           class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//           father_name: student?.fatherName?.toUpperCase() || 'N/A',
//           mobile: student?.contact || 'N/A',
//           dob:   moment(student?.dateOfBirth).format("DD-MM-YYYY")|| 'N/A',
//           address: student?.address || 'N/A',
//           guardianname: student?.guardianName || 'N/A',
//           session: student?.session || 'N/A'
//         };

//         let renderedHtml = templateString;

//         try {
//           renderedHtml = renderedHtml.replace(/\$\{backgroundImage\}/g, backgroundUrl || '');

//           renderedHtml = renderedHtml.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
//             const cleanKey = key.trim();
//             if (data.hasOwnProperty(cleanKey)) {
//               return String(data[cleanKey] ?? '');
//             } else {
//               return '';
//             }
//           });
//         } catch (error) {
//           console.error("Error during template placeholder replacement:", error);
//           renderedHtml = `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; box-sizing: border-box; text-align: center; padding: 5px; page-break-inside: avoid;'>Template Rendering Error</div>`;
//         }
//         return renderedHtml;
//       };


//     const handleFileChange = (e, side) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 if (side === 'front') { setFrontBackgroundImage(reader.result); setUploadedFrontImageFile(file); }
//                 else if (side === 'back') { setBackBackgroundImage(reader.result); setUploadedBackImageFile(file); }
//             };
//             reader.onerror = (error) => {
//                 console.error("FileReader error:", error);
//                 toast.error(`Error reading ${side} file.`);
//                 if (side === 'front') setUploadedFrontImageFile(null); else setUploadedBackImageFile(null);
//             };
//             reader.readAsDataURL(file);
//         } else {
//              if (side === 'front') setUploadedFrontImageFile(null); else setUploadedBackImageFile(null);
//         }
//         e.target.value = null;
//     };

//     const handleSaveClick = async () => {
//         try {
//             const formDataToSend = new FormData();
//             const contentArray = [];

//             const utf8ToBase64 = (str) => {
//                 try {
//                     return btoa(unescape(encodeURIComponent(str)));
//                 } catch (e) {
//                     console.error("Base64 encoding error:", e);
//                     toast.error("Error encoding template data.");
//                     return null;
//                 }
//             };

//             const frontTemplateString = JSON.stringify(frontTemplate);
//             const frontBase64 = utf8ToBase64(frontTemplateString);
//             if (frontBase64 === null) return;
//             contentArray.push({ data: frontBase64, name: "Front Side" });

//             const backTemplateString = JSON.stringify(backTemplate);
//             const backBase64 = utf8ToBase64(backTemplateString);
//             if (backBase64 === null) return;
//             contentArray.push({ data: backBase64, name: "Back Side" });

//             formDataToSend.append("name", "Student ID Card Design");
//             formDataToSend.append("type", "idCard");
//             formDataToSend.append("description", "Front/back design");
//             formDataToSend.append("isDefault", "true");
//             formDataToSend.append("isPublic", "false");
//             formDataToSend.append("content", JSON.stringify(contentArray));

//             if (uploadedFrontImageFile instanceof File) {
//                 formDataToSend.append(`content[0][image]`, uploadedFrontImageFile, uploadedFrontImageFile.name);
//             }
//             if (uploadedBackImageFile instanceof File) {
//                 formDataToSend.append(`content[1][image]`, uploadedBackImageFile, uploadedBackImageFile.name);
//             }

//             const response = await design(formDataToSend);
//             // const response = await new Promise(resolve => setTimeout(() => resolve({ success: true, message: "Designs saved successfully (Mock)" }), 1000)); // Mock Response

//             if (response?.success) {
//                toast.success(response.message || "Saved!");
//             } else {
//                toast.warn(response?.message || "Save failed or warning received.");
//             }
//         } catch (error) {
//             console.error("Save Error:", error);
//             const msg = error?.response?.data?.message || error?.message || 'An error occurred while saving.';
//             toast.error(msg);
//         }
//     };

//     return (
//         <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//             <h2>ID Card Design Editor (Front & Back)</h2>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

//                 <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
//                     <h3>Front Side</h3>
//                     <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
//                         <div style={{ flex: 'none', width: '210px' }}>
//                             <h4>Preview:</h4>
//                             <div
//                                 style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0 }}
//                                 dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, frontBackgroundImage, detailedSampleStudent) }}
//                             />
//                         </div>
//                         <div style={{ flex: 1 }}>
//                             <div>
//                                 <label htmlFor="front-bg-upload">Upload Front BG:</label>
//                                 <input type="file" id="front-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
//                             </div>
//                             <div>
//                                 <label htmlFor="front-template-edit">Edit Front HTML:</label>
//                                 <textarea
//                                     id="front-template-edit"
//                                     value={frontTemplate}
//                                     onChange={(e) => setFrontTemplate(e.target.value)}
//                                     rows={15}
//                                     style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
//                      <h3>Back Side</h3>
//                      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
//                          <div style={{ flex: 'none', width: '210px' }}>
//                              <h4>Preview:</h4>
//                              <div
//                                  style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0 }}
//                                  dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, backBackgroundImage, detailedSampleStudent) }}
//                              />
//                          </div>
//                          <div style={{ flex: 1 }}>
//                              <div>
//                                  <label htmlFor="back-bg-upload">Upload Back BG:</label>
//                                  <input type="file" id="back-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
//                              </div>
//                              <div>
//                                  <label htmlFor="back-template-edit">Edit Back HTML:</label>
//                                  <textarea
//                                      id="back-template-edit"
//                                      value={backTemplate}
//                                      onChange={(e) => setBackTemplate(e.target.value)}
//                                      rows={15}
//                                      style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
//                                  />
//                              </div>
//                          </div>
//                      </div>
//                 </div>
//             </div>
//             <div style={{ marginTop: '30px', textAlign: 'center' }}>
//                  <Button name="Save Both Designs" onClick={handleSaveClick} color="#28a745" />
//             </div>
//         </div>
//     );
// };

// export default ImageTest;


// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import { design } from "../Network/AdminApi"; // Assuming API function path is correct

// // --- Placeholder Button ---
// const Button = ({ name, onClick, color, style }) => (
//     <button style={{ backgroundColor: color || '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', margin: '5px', ...style }} onClick={onClick}>{name}</button>
// );

// // --- Sample Student Data (using the provided structure) ---
// const detailedSampleStudent = {
//     "_id": "680836dcc86519be36edb8b1",
//     "studentId": "91b2793f-d08d-4c24-92a6-5d95929bc242",
//     "schoolId": "ef335693-3a2a-47c2-8dc6-cb8c882075f5",
//     "session": "2025-2026",
//     "studentName": "dk",
//     "email": "dk1234567890@gmail.com",
//     "dateOfBirth": "2025-04-23T00:00:00.000Z",
//     "motherName": "",
//     "fatherName": "dkppppp",
//     "parentContact": 1234567890,
//     "role": "student",
//     "status": "active",
//     "gender": "Male",
//     "joiningDate": "23-Apr-2025",
//     "address": "Delhi ,laxami nagar",
//     "contact": 1234567890,
//     "class": "I",
//     "section": "A",
//     "subject": [],
//     "guardianName": "Mrs. Guardian Sample", // Added for back template testing
//     "studentImage": {
//         "public_id": "students/photos/1745368734538-student_photo_1745368718886.jpeg",
//         "url": "https://minio.digitalvidyasaarthi.in/digitalvidyasaarthi/students/photos/1745368734538-student_photo_1745368718886.jpeg"
//         // Using a placeholder if the above link is broken/inaccessible for testing
//         // "url": "https://via.placeholder.com/85x95/aabbcc?text=Student"
//     },
//     "fatherImage": { "public_id": "", "url": "" },
//     "motherImage": { "public_id": "", "url": "" },
//     "guardianImage": { "public_id": "", "url": "" },
//     "admissionNumber": "DI1151",
//     "isGenerated": true,
//     "isPrinted": false,
//     "approvalStatus": "pending",
//     "sessionHistory": [],
//     "isNewAdmission": true,
//     "assignedThirdParty": "d00d14fb-04c1-4cdb-9143-28d815107d90",
//     "photoId": "e4555584-e113-41a4-8e11-0bd4c8d31a03",
//     "udisePlusDetails": { "mother_name": "", "father_name": "dkppppp", "guardian_name": "" },
//     "createdAt": "2025-04-23T00:39:56.140Z",
//     "__v": 0,
//     "parentAdmissionNumber": "DI1109",
//     "parentId": "680836dcc86519be36edb8b6"
// };


// const ImageTest = () => {
//     // --- State for Front Side ---
//     const [frontBackgroundImage, setFrontBackgroundImage] = useState("https://via.placeholder.com/204x325/e0f0ff?text=Front+BG"); // Lighter BG
//     const [uploadedFrontImageFile, setUploadedFrontImageFile] = useState(null);

//     // *** Using the MM-based layout for frontTemplate ***
//     const [frontTemplate, setFrontTemplate] = useState(`
//       <div style='background-image:url(\${backgroundImage});
//                   background-position: center;
//                   background-repeat: no-repeat;
//                   width: 54mm;
//                   height: 86mm;
//                   position: relative;
//                   background-size: cover;
//                   border: 1px solid #ccc;
//                   font-family: Arial, sans-serif;
//                   overflow: hidden;
//                   box-sizing: border-box;'>

//         {/* --- Student Image Area (Using MM) --- */}
//         <div style='position: absolute;
//                     left: 4mm;
//                     top: 15mm;  /* Position from top in mm */
//                     width: 25mm;
//                     height: 30mm;
//                     border: 0.5px solid #aaa;
//                     border-radius: 3px;
//                     overflow: hidden;
//                     background-color: #eee;'>
//           <img src='\${studentImage}' /* Placeholder handled in renderTemplate */
//                style='width: 100%; height: 100%; object-fit: cover;'
//                alt="Student"/>
//         </div>

//         {/* --- Text Information Area (Using MM) --- */}
//         <div style='position: absolute;
//                     left: 4mm;
//                     top: 48mm; /* Position below image (15mm + 30mm + 3mm gap) */
//                     width: calc(100% - 8mm); /* Full width minus margins */
//                     box-sizing: border-box;'>

//           <p style='font-size: 7pt; text-transform: uppercase; margin: 0 0 1.5mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; line-height: 1.2;'>
//               NAME
//               <span style="float: right; font-weight: normal; width: 65%; text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">: \${name}</span>
//           </p>
//           <p style='font-size: 7pt; text-transform: uppercase; margin: 0 0 1.5mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; line-height: 1.2;'>
//               CLASS
//               <span style="float: right; font-weight: normal; width: 65%; text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">: \${class}</span>
//           </p>
//           <p style='font-size: 7pt; text-transform: uppercase; margin: 0 0 1.5mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; line-height: 1.2;'>
//               F.NAME
//               <span style="float: right; font-weight: normal; width: 65%; text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span>
//           </p>
//           <p style='font-size: 7pt; text-transform: uppercase; margin: 0 0 1.5mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; line-height: 1.2;'>
//               PHONE
//               <span style="float: right; font-weight: normal; width: 65%; text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">: \${mobile}</span>
//           </p>
//           <p style='font-size: 7pt; text-transform: uppercase; margin: 0 0 1.5mm 0; color: BLACK; font-weight: bold; line-height: 1.3;'>
//               ADDRESS
//               <span style="float: right; font-weight: normal; width: 65%; text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: normal;">: \${address}</span>
//           </p>
//         </div>
//       </div>
//       `);

//     // --- State for Back Side ---
//     const [backBackgroundImage, setBackBackgroundImage] = useState("https://via.placeholder.com/204x325/cccccc?text=Back+BG");
//     const [uploadedBackImageFile, setUploadedBackImageFile] = useState(null);
//     const [backTemplate, setBackTemplate] = useState(`
// <div style='background-image:url(\${backgroundImage});
//             background-position: center;
//             background-repeat: no-repeat;
//             width: 54mm;
//             height: 86mm;
//             position: relative;
//             background-size: cover;
//             border: 1px solid #ccc;
//             font-family: Arial, sans-serif;
//             overflow: hidden;
//             box-sizing: border-box;
//             padding: 5mm;'>

//     <h3 style='text-align:center; font-size: 9pt; margin: 0 0 5mm 0; color: #333;'>STUDENT ID CARD</h3>

//     <p style='font-size: 7pt; margin: 0 0 3mm 0; line-height: 1.3;'>
//         This card certifies that <strong>\${name}</strong> is a student of [Your School Name Here].
//     </p>
//     <p style='font-size: 7pt; margin: 0 0 3mm 0;'>
//         Session: \${session} {/* Added session placeholder */}
//     </p>
//     <p style='font-size: 7pt; margin: 0 0 3mm 0;'>
//         Guardian: \${guardianname} {/* Placeholder remains */}
//     </p>
//     <p style='font-size: 7pt; margin: 8mm 0 4mm 0; text-align: center; line-height: 1.3;'>
//         <strong>If found, please return to:</strong><br/>
//         [Your School Address Here]<br/>
//         [Your School Phone Here]
//     </p>

//     <div style='position: absolute; bottom: 8mm; left: 0; right: 0; text-align: center;'>
//         <p style='font-size: 6pt; margin: 0 0 0.5mm 0;'>Signature:</p>
//         <div style='border-bottom: 1px solid #555; height: 8mm; width: 40mm; margin: 0 auto;'></div>
//         <p style='font-size: 6pt; margin: 0.5mm 0 0 0;'>Principal</p>
//     </div>
// </div>`);

//     // --- Refined Template Rendering Function ---
//     const renderTemplate = (templateString, backgroundUrl, student) => {
//         // 1. Prepare the data mapping from the student object
//         const data = {
//           // Background is handled separately now
//           studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Img",
//           name: student?.studentName?.toUpperCase() || 'N/A',
//           // Combine class and section, handle if section is missing
//           class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//           father_name: student?.fatherName?.toUpperCase() || 'N/A',
//           mobile: student?.contact || 'N/A', // Map contact to mobile
//           address: student?.address || 'N/A',
//           guardianname: student?.guardianName || 'N/A', // Map guardianName
//           session: student?.session || 'N/A' // Map session
//           // Add other mappings here if needed for the templates
//         };

//         let renderedHtml = templateString;

//         try {
//           // 2. Replace the background image placeholder first
//           renderedHtml = renderedHtml.replace(/\$\{backgroundImage\}/g, backgroundUrl || ''); // Use provided backgroundUrl

//           // 3. Replace all other placeholders using the data map
//           renderedHtml = renderedHtml.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
//             const cleanKey = key.trim();
//             // Check if the key exists in our prepared data map
//             if (data.hasOwnProperty(cleanKey)) {
//               // Return the value, converting null/undefined to empty string
//               return String(data[cleanKey] ?? '');
//             } else {
//               // console.warn(`Placeholder \${${cleanKey}} not found in data for student ${student?.studentName}`);
//               return ''; // Return empty string if key is not in our map
//             }
//           });
//         } catch (error) {
//           console.error("Error during template placeholder replacement:", error);
//           // Provide a fallback error display matching card dimensions
//           renderedHtml = `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; box-sizing: border-box; text-align: center; padding: 5px; page-break-inside: avoid;'>Template Rendering Error</div>`;
//         }
//         return renderedHtml;
//       };


//     // --- Unified File Change Handler ---
//     const handleFileChange = (e, side) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 if (side === 'front') { setFrontBackgroundImage(reader.result); setUploadedFrontImageFile(file); }
//                 else if (side === 'back') { setBackBackgroundImage(reader.result); setUploadedBackImageFile(file); }
//             };
//             reader.onerror = (error) => {
//                 console.error("FileReader error:", error);
//                 toast.error(`Error reading ${side} file.`);
//                 if (side === 'front') setUploadedFrontImageFile(null); else setUploadedBackImageFile(null);
//             };
//             reader.readAsDataURL(file);
//         } else {
//              if (side === 'front') setUploadedFrontImageFile(null); else setUploadedBackImageFile(null);
//         }
//         // Reset file input value to allow re-uploading the same file
//         e.target.value = null;
//     };

//     // --- Save Handler (Updated btoa encoding) ---
//     const handleSaveClick = async () => {
//         try {
//             const formDataToSend = new FormData();
//             const contentArray = [];

//             // --- Correct Base64 Encoding for UTF-8 ---
//             // Function to handle potential UTF-8 characters in templates safely
//             const utf8ToBase64 = (str) => {
//                 try {
//                     // 1. Encode URI components to handle special chars -> %xx format
//                     // 2. Decode these %xx sequences into their byte representation using unescape
//                     // 3. Encode the byte string into Base64
//                     return btoa(unescape(encodeURIComponent(str)));
//                 } catch (e) {
//                     console.error("Base64 encoding error:", e);
//                     toast.error("Error encoding template data.");
//                     return null; // Indicate error
//                 }
//             };

//             // Stringify first, then encode
//             const frontTemplateString = JSON.stringify(frontTemplate);
//             const frontBase64 = utf8ToBase64(frontTemplateString);
//             if (frontBase64 === null) return; // Stop if encoding failed
//             contentArray.push({ data: frontBase64, name: "Front Side" });

//             const backTemplateString = JSON.stringify(backTemplate);
//             const backBase64 = utf8ToBase64(backTemplateString);
//             if (backBase64 === null) return; // Stop if encoding failed
//             contentArray.push({ data: backBase64, name: "Back Side" });

//             // Append other form data
//             formDataToSend.append("name", "Student ID Card Design");
//             formDataToSend.append("type", "idCard");
//             formDataToSend.append("description", "Front/back design");
//             formDataToSend.append("isDefault", "true"); // Consider if this should be dynamic
//             formDataToSend.append("isPublic", "false"); // Consider if this should be dynamic
//             formDataToSend.append("content", JSON.stringify(contentArray));

//             // Append files if they exist
//             if (uploadedFrontImageFile instanceof File) {
//                 formDataToSend.append(`content[0][image]`, uploadedFrontImageFile, uploadedFrontImageFile.name);
//             }
//             if (uploadedBackImageFile instanceof File) {
//                 formDataToSend.append(`content[1][image]`, uploadedBackImageFile, uploadedBackImageFile.name);
//             }

//             // console.log("--- FormData Being Sent ---");
//             // for (let [key, value] of formDataToSend.entries()) {
//             //     console.log(key, value instanceof File ? value.name : value);
//             // }
//             // console.log("---------------------------");


//             // --- API Call ---
//             // const response = await design(formDataToSend); // Uncomment for actual API call
//             // Mock Response for testing UI flow
//             const response = await new Promise(resolve => setTimeout(() => resolve({ success: true, message: "Designs saved successfully (Mock)" }), 1000));

//             if (response?.success) {
//                toast.success(response.message || "Saved!");
//             } else {
//                toast.warn(response?.message || "Save failed or warning received.");
//             }
//         } catch (error) {
//             console.error("Save Error:", error);
//             const msg = error?.response?.data?.message || error?.message || 'An error occurred while saving.';
//             toast.error(msg);
//         }
//     };

//     // --- JSX ---
//     return (
//         <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//             <h2>ID Card Design Editor (Front & Back)</h2>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

//                 {/* === Front Section === */}
//                 <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
//                     <h3>Front Side</h3>
//                     <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
//                         {/* Preview: Pass template, BG URL, and student data */}
//                         <div style={{ flex: 'none', width: '210px' }}>
//                             <h4>Preview:</h4>
//                             <div
//                                 style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0 /* Prevents extra space below div */ }}
//                                 dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, frontBackgroundImage, detailedSampleStudent) }}
//                             />
//                         </div>
//                         {/* Controls */}
//                         <div style={{ flex: 1 }}>
//                             <div>
//                                 <label htmlFor="front-bg-upload">Upload Front BG:</label>
//                                 <input type="file" id="front-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
//                             </div>
//                             <div>
//                                 <label htmlFor="front-template-edit">Edit Front HTML:</label>
//                                 <textarea
//                                     id="front-template-edit"
//                                     value={frontTemplate}
//                                     onChange={(e) => setFrontTemplate(e.target.value)}
//                                     rows={15}
//                                     style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* === Back Section === */}
//                 <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
//                      <h3>Back Side</h3>
//                      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
//                          {/* Preview: Pass template, BG URL, and student data */}
//                          <div style={{ flex: 'none', width: '210px' }}>
//                              <h4>Preview:</h4>
//                              <div
//                                  style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0 }}
//                                  dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, backBackgroundImage, detailedSampleStudent) }}
//                              />
//                          </div>
//                          {/* Controls */}
//                          <div style={{ flex: 1 }}>
//                              <div>
//                                  <label htmlFor="back-bg-upload">Upload Back BG:</label>
//                                  <input type="file" id="back-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
//                              </div>
//                              <div>
//                                  <label htmlFor="back-template-edit">Edit Back HTML:</label>
//                                  <textarea
//                                      id="back-template-edit"
//                                      value={backTemplate}
//                                      onChange={(e) => setBackTemplate(e.target.value)}
//                                      rows={15}
//                                      style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
//                                  />
//                              </div>
//                          </div>
//                      </div>
//                 </div>
//             </div>
//             {/* Save Button */}
//             <div style={{ marginTop: '30px', textAlign: 'center' }}>
//                  <Button name="Save Both Designs" onClick={handleSaveClick} color="#28a745" />
//             </div>
//         </div>
//     );
// };

// export default ImageTest;


// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import { design } from "../Network/AdminApi"; // Assuming API function path is correct

// // --- Placeholder Button ---
// const Button = ({ name, onClick, color, style }) => (
//     <button style={{ backgroundColor: color || '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', margin: '5px', ...style }} onClick={onClick}>{name}</button>
// );

// const ImageTest = () => {
//     // --- State for Front Side ---
//     const [frontBackgroundImage, setFrontBackgroundImage] = useState("https://via.placeholder.com/204x325?text=Front+BG");
//     const [uploadedFrontImageFile, setUploadedFrontImageFile] = useState(null);
    
//     const [frontTemplate, setFrontTemplate] = useState(`
//       <div style='background-image:url(\${backgroundImage});
//                   background-position: center;
//                   background-repeat: no-repeat;
//                   width: 54mm;
//                   height: 86mm;
//                   position: relative;
//                   background-size: cover;
//                   border: 1px solid #ccc; 
//                   font-family: Arial, sans-serif; 
//                   overflow: hidden;
//                   box-sizing: border-box;'>
      
       
//         <div style='position: absolute;
//                     left: 82px;
//                     top: 90px;
//                     width: 85px;   
//                     height: 95px;  
//                     border: 0.5px solid #aaa; 
//                     border-radius: 3px;
//                     overflow: hidden;
//                     background-color: #eee;'> 
//           <img src='\${studentImage || "https://via.placeholder.com/85x95?text=No+Img"}'
//                style='width: 100%; height: 100%; object-fit: cover;'
//                alt="Student"/>
//         </div>
       
       
//         <div style='position: absolute;
//                     left: 4mm;
//                     top: 200px; 
//                     width: calc(100% - 8mm);
//                     box-sizing: border-box;'>
      
         
//           <p style='font-size: 7pt; 
//                     text-transform: uppercase;
//                     margin: 0 0 1.5mm 0; 
//                     color: BLACK;
//                     font-weight: bold;
//                     white-space: nowrap;
//                     overflow: hidden;
//                     line-height: 1.2;'>
//               NAME
              
//               <span style="float: right; font-weight: normal; width: 65%;  text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">: \${name}</span>
//           </p>
//           <p style='font-size: 7pt; text-transform: uppercase; margin: 0 0 1.5mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; line-height: 1.2;'>
//               CLASS
//               <span style="float: right; font-weight: normal; width: 65%; text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">: \${class}</span>
//           </p>
//           <p style='font-size: 7pt; text-transform: uppercase; margin: 0 0 1.5mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; line-height: 1.2;'>
//               F.NAME
//               <span style="float: right; font-weight: normal; width: 65%; text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">: \${father_name}</span>
//           </p>
//           <p style='font-size: 7pt; text-transform: uppercase; margin: 0 0 1.5mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; line-height: 1.2;'>
//               PHONE
//               <span style="float: right; font-weight: normal; width: 65%; text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">: \${mobile}</span>
//           </p>
//           <p style='font-size: 7pt; text-transform: uppercase; margin: 0 0 1.5mm 0; color: BLACK; font-weight: bold;  line-height: 1.3;'> 
//               ADDRESS
             
//               <span style="float: right; font-weight: normal; width: 65%; text-align: left; padding-left: 2mm; box-sizing: border-box; white-space: normal;">: \${address}</span>
//           </p>
//         </div>
//       </div>
//       `);

//     const [backBackgroundImage, setBackBackgroundImage] = useState("https://via.placeholder.com/204x325/cccccc?text=Back+BG");
//     const [uploadedBackImageFile, setUploadedBackImageFile] = useState(null);
//     // ***** Using the NEW Simplified and Cleaned backTemplate *****
//     const [backTemplate, setBackTemplate] = useState(`
// <div style='background-image:url(\${backgroundImage});
//             background-position: center;
//             background-repeat: no-repeat;
//             width: 54mm;
//             height: 86mm;
//             position: relative;
//             background-size: cover;
//             border: 1px solid #ccc;
//             font-family: Arial, sans-serif;
//             overflow: hidden; /* Crucial */
//             box-sizing: border-box;
//             padding: 5mm;'>

//     <h3 style='text-align:center; font-size: 9pt; margin: 0 0 5mm 0; color: #333;'>STUDENT ID CARD</h3>

//     <p style='font-size: 7pt; margin: 0 0 3mm 0; line-height: 1.3;'>
//         This card certifies that <strong>\${name}</strong> is a student of [Your School Name Here].
//     </p>

//     <p style='font-size: 7pt; margin: 0 0 3mm 0;'>
//         Session: 2024-2025
//     </p>

//     <p style='font-size: 7pt; margin: 0 0 3mm 0;'>
//         Guardian: \${guardianname}
//     </p>

//     <p style='font-size: 7pt; margin: 8mm 0 4mm 0; text-align: center; line-height: 1.3;'>
//         <strong>If found, please return to:</strong><br/>
//         [Your School Address Here]<br/>
//         [Your School Phone Here]
//     </p>

//     <!-- Signature block -->
//     <div style='position: absolute; bottom: 8mm;  left: 0; right: 0; text-align: center;'>
//         <p style='font-size: 6pt; margin: 0 0 0.5mm 0;'>Signature:</p>
//         <div style='border-bottom: 1px solid #555; height: 8mm; width: 40mm; margin: 0 auto;'></div>
//         <p style='font-size: 6pt; margin: 0.5mm 0 0 0;'>Principal</p>
//     </div>

// </div>`); // Ensure closing backtick

//     // --- Sample Student Data ---
//     const sampleStudent = { id: 1, name: "Alice Wonderland", class: "Grade 5 - A", father_name: "Mr. Hatter", mobile: "111-222-3333", address: "1st Rabbit Hole, Wonderland Lane", guardianname: "Queen Hearts", studentImage: "https://via.placeholder.com/85x95/aabbcc?text=Alice" };

//     // --- Template Rendering Function ---
//     // const renderTemplate = (template, backgroundUrl, data) => {
//     //     let rendered = template.replace(/\${backgroundImage}/g, backgroundUrl);
//     //     rendered = rendered.replace(/\${(\w+)}/g, (match, key) => {
//     //         if (key === 'studentImage') return data[key] || "https://via.placeholder.com/85x95?text=No+Image";
//     //         return data[key] || "";
//     //     });
//     //     // console.log("Rendered HTML:", rendered); // DEBUG: Log the final HTML
//     //     return rendered;
//     // };

//     const renderTemplate = (template, student) => {
//         const data = {
//           backgroundImage: template?.frontImage?.url || "",
//           studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Image",
//           name: student?.studentName?.toUpperCase() || 'N/A',
//           class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//           father_name: student?.fatherName?.toUpperCase() || 'N/A',
//           mobile: student?.contact || 'N/A',
//           address: student?.address || 'N/A'
//         };
      
//         let renderedHtml = template;
//         try {
//           renderedHtml = template.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
//             const cleanKey = key.trim();
//             if (data.hasOwnProperty(cleanKey)) {
//               return String(data[cleanKey] ?? '');
//             } else {
//               // console.warn(`Placeholder \${${cleanKey}} not found in data for student ${student?.studentName}`);
//               return ''; // Agar key nahi mili to empty string
//             }
//           });
//         } catch (error) {
//           console.error("Error during template placeholder replacement:", error);
//           renderedHtml = `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; page-break-inside: avoid;'>Template Error</div>`;
//         }
//         return renderedHtml;
//       };
      

//     // --- Unified File Change Handler ---
//     const handleFileChange = (e, side) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 if (side === 'front') { setFrontBackgroundImage(reader.result); setUploadedFrontImageFile(file); }
//                 else if (side === 'back') { setBackBackgroundImage(reader.result); setUploadedBackImageFile(file); }
//             };
//             reader.onerror = (error) => { console.error("FileReader error:", error); toast.error(`Error reading ${side} file.`); if (side === 'front') setUploadedFrontImageFile(null); else setUploadedBackImageFile(null); };
//             reader.readAsDataURL(file);
//         } else { if (side === 'front') setUploadedFrontImageFile(null); else setUploadedBackImageFile(null); }
//         e.target.value = null;
//     };

//     // --- Save Handler ---
//     const handleSaveClick = async () => {
//         try {
//             const formDataToSend = new FormData();
//             const contentArray = [];
//             const frontTemplateString = JSON.stringify(frontTemplate);
//              const frontBase64 = btoa(unescape(encodeURIComponent(frontTemplateString))); contentArray.push({ data: frontBase64, name: "Front Side" });
//             const backTemplateString = JSON.stringify(backTemplate);
//              const backBase64 = btoa(unescape(encodeURIComponent(backTemplateString))); contentArray.push({ data: backBase64, name: "Back Side" });
//             formDataToSend.append("name", "Student ID Card Design");
//              formDataToSend.append("type", "idCard");
//               formDataToSend.append("description", "Front/back design");
//                formDataToSend.append("isDefault", "true"); 
//                formDataToSend.append("isPublic", "false"); 
//                formDataToSend.append("content", JSON.stringify(contentArray));
//             if (uploadedFrontImageFile instanceof File) formDataToSend.append(`content[0][image]`, uploadedFrontImageFile, uploadedFrontImageFile.name);
//             if (uploadedBackImageFile instanceof File) formDataToSend.append(`content[1][image]`, uploadedBackImageFile, uploadedBackImageFile.name);
//             const response = await design(formDataToSend);
//             // const response = await new Promise(resolve => setTimeout(() => resolve({ success: true, message: "Designs saved successfully (Mock)" }), 1000)); // Mock
//             if (response?.success)
//                toast.success(response.message || "Saved!");
//                else toast.warn(response?.message || "Save failed/warned.");
//         } catch (error) { console.error("Save Error:", error); const msg = error?.response?.data?.message || error?.message || 'Save error.'; toast.error(msg); }
//     };

//     // --- JSX ---
//     return (
//         <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//             <h2>ID Card Design Editor (Front & Back)</h2>
//             <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>

//                 {/* === Front Section === */}
//                 <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
//                     <h3>Front Side</h3>
//                     <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
//                         {/* Preview */} <div style={{ flex: 'none', width: '210px' }}> <h4>Preview:</h4> <div style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, frontBackgroundImage, sampleStudent) }} /> </div>
//                         {/* Controls */} <div style={{ flex: 1 }}> <div> <label htmlFor="front-bg-upload">Upload Front BG:</label> <input type="file" id="front-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} style={{ display: 'block', margin: '5px 0 15px 0' }} /> </div> <div> <label htmlFor="front-template-edit">Edit Front HTML:</label> <textarea id="front-template-edit" value={frontTemplate} onChange={(e) => setFrontTemplate(e.target.value)} rows={15} style={{ width: '100%', minHeight: '250px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }} /> </div> </div>
//                     </div>
//                 </div>

//                 {/* === Back Section === */}
//                 <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px' }}>
//                      <h3>Back Side</h3>
//                      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
//                          {/* Preview */} <div style={{ flex: 'none', width: '210px' }}> <h4>Preview:</h4> <div style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0 }} dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, backBackgroundImage, sampleStudent) }} /> </div>
//                          {/* Controls */} <div style={{ flex: 1 }}> <div> <label htmlFor="back-bg-upload">Upload Back BG:</label> <input type="file" id="back-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} style={{ display: 'block', margin: '5px 0 15px 0' }} /> </div> <div> <label htmlFor="back-template-edit">Edit Back HTML:</label> <textarea id="back-template-edit" value={backTemplate} onChange={(e) => setBackTemplate(e.target.value)} rows={15} style={{ width: '100%', minHeight: '250px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }} /> </div> </div>
//                      </div>
//                 </div>
//             </div>
//             {/* Save Button */}
//             <div style={{ marginTop: '30px', textAlign: 'center' }}> <Button name="Save Both Designs" onClick={handleSaveClick} color="#28a745" /> </div>
//         </div>
//     );
// };

// export default ImageTest;


// import React, { useState } from "react";
// import { toast } from "react-toastify";
// import { design } from "../Network/AdminApi"; // Assuming API function path is correct

// // --- Placeholder Button (replace with your actual Button component) ---
// const Button = ({ name, onClick, color, style }) => (
//     <button
//         style={{
//             backgroundColor: color || '#007bff', // Default blue
//             color: 'white',
//             padding: '10px 15px',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: 'pointer',
//             fontSize: '1rem',
//             margin: '5px',
//             ...style // Allow overriding styles
//         }}
//         onClick={onClick}
//     >
//         {name}
//     </button>
// );
// // --- End Placeholder Button ---


// const ImageTest = () => {
//     // --- State for Front Side ---
//     const [frontBackgroundImage, setFrontBackgroundImage] = useState(
//         "https://via.placeholder.com/204x325?text=Front+BG" // Placeholder for 54x86mm ratio approx
//     );
//     const [uploadedFrontImageFile, setUploadedFrontImageFile] = useState(null);
//     const [frontTemplate, setFrontTemplate] = useState(`
// <div style='background-image:url(\${backgroundImage});
//             background-position: center;
//             background-repeat: no-repeat;
//             width: 54mm; /* Standard ID card size */
//             height: 86mm; /* Standard ID card size */
//             position: relative;
//             background-size: cover;
//             border: 1px solid #ccc;
//             font-family: Arial, sans-serif;
//             overflow: hidden;
//             box-sizing: border-box;'>

//   <!-- Student Image Area -->
//   <div style='margin-left: 4mm;  /* Adjust positioning as needed */
//               margin-top: 15mm; /* Adjust positioning as needed */
//               width: 25mm;      /* Adjust size */
//               height: 30mm;     /* Adjust size */
//               border: 0.5px solid #aaa;
//               border-radius: 3px;
//               overflow: hidden;
//               position: absolute;
//               background-color: #eee;'>
//     <img src='\${studentImage || "https://via.placeholder.com/85x95?text=No+Img"}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student"/>
//   </div>

//   <!-- Text Area -->
//   <div style='position: absolute; left: 3mm; top: 50mm; width: calc(100% - 6mm);'>
//     <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//       NAME<span style="float: right; margin-right: 1mm;">: \${name}</span>
//     </p>
//     <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//       CLASS<span style="float: right; margin-right: 1mm;">: \${class}</span>
//     </p>
//     <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//       F.NAME<span style="float: right; margin-right: 1mm;">: \${father_name}</span>
//     </p>
//     <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//       PHONE<span style="float: right; margin-right: 1mm;">: \${mobile}</span>
//     </p>
//     <p style='font-size: 7pt; text-transform: uppercase; margin: 1mm 0; color: BLACK; font-weight: bold; line-height: 1.2;'>
//       ADDR.<span style="float: right; width: 65%; text-align: right; white-space: normal; margin-right: 1mm;">: \${address}</span>
//     </p>
//   </div>
// </div>
//   `);

//     // --- State for Back Side ---
//     const [backBackgroundImage, setBackBackgroundImage] = useState(
//         "https://via.placeholder.com/204x325/cccccc?text=Back+BG"
//     );
//     const [uploadedBackImageFile, setUploadedBackImageFile] = useState(null);
//     const [backTemplate, setBackTemplate] = useState(`
// <div style='background-image:url(\${backgroundImage});
//             background-position: center;
//             background-repeat: no-repeat;
//             width: 54mm;
//             height: 86mm;
//             position: relative;
//             background-size: cover;
//             border: 1px solid #ccc;
//             font-family: Arial, sans-serif;
//             overflow: hidden;
//             box-sizing: border-box;
//             padding: 5mm;'>

//     <h3 style='text-align:center; font-size: 9pt; margin-top: 5mm; margin-bottom: 5mm; color: #333;'>STUDENT ID CARD</h3>
//     <p style='font-size: 7pt; margin: 2mm 0;'>
//         This card certifies that <strong>\${name}</strong> is a student of [Your School Name Here].
//     </p>
//     <p style='font-size: 7pt; margin: 2mm 0;'>
//         Session: 2024-2025
//     </p>
//     <p style='font-size: 7pt; margin: 2mm 0;'>
//         Guardian: \${guardianname}
//     </p>
//     <p style='font-size: 7pt; margin: 10mm 0 2mm 0; text-align: center;'>
//         <strong>If found, please return to:</strong><br/>
//         [Your School Address Here]<br/>
//         [Your School Phone Here]
//     </p>

//     <div style='position: absolute; bottom: 10mm; left: 5mm; /* Or use text-align center */'>
//         <p style='font-size: 6pt; margin: 0;'>Signature:</p>
//         <div style='border-bottom: 1px solid #555; height: 10mm; width: 40mm; margin-top: 1mm;'></div>
//         <p style='font-size: 6pt; margin: 0.5mm 0 0 0; text-align: center;'>Principal</p>
//     </div>

//     </div>
//     `);

//     // --- Sample Student Data (shared for both previews) ---
//     const sampleStudent = {
//         id: 1,
//         name: "Alice Wonderland",
//         class: "Grade 5 - A",
//         father_name: "Mr. Hatter",
//         mobile: "111-222-3333",
//         address: "1st Rabbit Hole, Wonderland Lane, Imagination City",
//         guardianname: "Queen Hearts", // Added for back card
//         studentImage: "https://via.placeholder.com/85x95/aabbcc?text=Alice"
//     };

//     // --- Template Rendering Function (Reusable) ---
//     const renderTemplate = (template, backgroundUrl, data) => {
//         // Replace background image placeholder first
//         let rendered = template.replace(/\${backgroundImage}/g, backgroundUrl); // Use specific background URL

//         // Replace other placeholders (\${key})
//         rendered = rendered.replace(/\${(\w+)}/g, (match, key) => {
//             if (key === 'studentImage') {
//                 // Use student image from data, or a default if null/undefined
//                 return data[key] || "https://via.placeholder.com/85x95?text=No+Image";
//             }
//             // Use data value or provide empty string as fallback
//             return data[key] || "";
//         });
//         return rendered;
//     };


//     // --- Unified File Change Handler ---
//     const handleFileChange = (e, side) => {
//         const file = e.target.files[0];
//         if (file) {
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 if (side === 'front') {
//                     setFrontBackgroundImage(reader.result); // Update preview
//                     setUploadedFrontImageFile(file);      // Store file object
//                 } else if (side === 'back') {
//                     setBackBackgroundImage(reader.result);
//                     setUploadedBackImageFile(file);
//                 }
//             };
//             reader.onerror = (error) => {
//                 console.error("FileReader error:", error);
//                 toast.error(`Error reading ${side} file for preview.`);
//                 // Clear state on error
//                 if (side === 'front') {
//                     setUploadedFrontImageFile(null);
//                 } else {
//                     setUploadedBackImageFile(null);
//                 }
//             };
//             reader.readAsDataURL(file);
//         } else {
//              // Clear state if no file selected
//              if (side === 'front') {
//                 setUploadedFrontImageFile(null);
//             } else {
//                 setUploadedBackImageFile(null);
//             }
//         }
//          // Reset input value to allow re-uploading the same file name
//         e.target.value = null;
//     };

//     // --- Save Handler ---
//     const handleSaveClick = async () => {
//         try {
//             const formDataToSend = new FormData();

//             // --- Prepare Content Array ---
//             const contentArray = [];

//             // 1. Front Side Data
//             const frontTemplateString = JSON.stringify(frontTemplate); // Stringify the HTML template itself
//             const frontBase64 = btoa(unescape(encodeURIComponent(frontTemplateString))); // Encode the stringified template
//             contentArray.push({ data: frontBase64, name: "Front Side" });

//             // 2. Back Side Data
//             const backTemplateString = JSON.stringify(backTemplate);
//             const backBase64 = btoa(unescape(encodeURIComponent(backTemplateString)));
//             contentArray.push({ data: backBase64, name: "Back Side" });


//             // --- Append Base Fields ---
//             formDataToSend.append("name", "Student ID Card Design"); // More descriptive name
//             formDataToSend.append("type", "idCard");
//             formDataToSend.append("description", "Front and back design for student ID cards");
//             formDataToSend.append("isDefault", "true"); // Send as string
//             formDataToSend.append("isPublic", "false"); // Send as string

//             // --- Append Content Array (as string) ---
//             // IMPORTANT: The API needs to parse this string back into an array of objects
//             formDataToSend.append("content", JSON.stringify(contentArray));

//             // --- Append Files (using indexed keys matching the content array) ---
//             if (uploadedFrontImageFile instanceof File) {
//                 // Key should match the backend expectation for the image associated with content[0]
//                 formDataToSend.append(`content[0][image]`, uploadedFrontImageFile, uploadedFrontImageFile.name);
//                 console.log("Appending Front Image:", uploadedFrontImageFile.name);
//             } else {
//                 console.log("No new front background image file was uploaded.");
//             }

//             if (uploadedBackImageFile instanceof File) {
//                  // Key should match the backend expectation for the image associated with content[1]
//                 formDataToSend.append(`content[1][image]`, uploadedBackImageFile, uploadedBackImageFile.name);
//                 console.log("Appending Back Image:", uploadedBackImageFile.name);
//             } else {
//                 console.log("No new back background image file was uploaded.");
//             }


//             // --- Log FormData for Debugging ---
//             console.log("--- FormData to be sent ---");
//             for (let [key, value] of formDataToSend.entries()) {
//                 // Don't log file content, just its presence/name
//                 if (value instanceof File) {
//                     console.log(`${key}:`, `File: ${value.name}, Type: ${value.type}, Size: ${value.size}`);
//                 } else {
//                     console.log(`${key}:`, value); // Log other fields (like the stringified content array)
//                 }
//             }
//             console.log("---------------------------");

//             // --- Make API Call ---
//             // Set isLoading(true) here if using a loader
//             // const response = await design(formDataToSend);
//             // Set isLoading(false) here

//             // --- Mock Response (Remove when using actual API) ---
//             const response = await new Promise(resolve => setTimeout(() => resolve({ success: true, message: "Designs saved successfully (Mock)" }), 1500));
//             // --- End Mock Response ---


//             if (response?.success) {
//                 toast.success(response.message || "Designs saved successfully!");
//                 // Optionally reset state or navigate away
//                 // setUploadedFrontImageFile(null);
//                 // setUploadedBackImageFile(null);
//             } else {
//                 // Handle potential errors or warnings from the API response
//                 toast.warn(response?.message || "Save operation completed with warnings or failed.");
//             }

//         } catch (error) {
//             // Set isLoading(false) here in case of error
//             console.error("Error during handleSaveClick:", error);
//             const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred during save. Please check console and try again.';
//             toast.error(errorMessage);
//         }
//     };


//     // --- JSX ---
//     return (
//         <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
//             <h2>ID Card Design Editor (Front & Back)</h2>

//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '30px' }}>

//                 {/* --- Front Side Section --- */}
//                 <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '350px' }}>
//                     <h3>Front Side</h3>
//                     <div>
//                         <label htmlFor="front-bg-upload">Upload Front Background Image:</label>
//                         <input
//                             type="file"
//                             id="front-bg-upload"
//                             accept="image/*"
//                             onChange={(e) => handleFileChange(e, 'front')}
//                             style={{ display: 'block', margin: '10px 0' }}
//                         />
//                     </div>
//                     <div>
//                         <label htmlFor="front-template-edit">Edit Front Template HTML:</label>
//                         <textarea
//                             id="front-template-edit"
//                             value={frontTemplate}
//                             onChange={(e) => setFrontTemplate(e.target.value)}
//                             rows={15}
//                             style={{ width: '100%', minHeight: '200px', display: 'block', margin: '10px 0', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
//                         />
//                     </div>
//                     <h4>Front Preview:</h4>
//                     <div
//                         style={{ border: '1px dashed grey', display: 'inline-block', margin: '10px 0' }}
//                         dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, frontBackgroundImage, sampleStudent) }}
//                     />
//                 </div>

//                 {/* --- Back Side Section --- */}
//                 <div style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', flex: 1, minWidth: '350px' }}>
//                     <h3>Back Side</h3>
//                      <div>
//                         <label htmlFor="back-bg-upload">Upload Back Background Image:</label>
//                         <input
//                             type="file"
//                             id="back-bg-upload"
//                             accept="image/*"
//                             onChange={(e) => handleFileChange(e, 'back')}
//                             style={{ display: 'block', margin: '10px 0' }}
//                         />
//                     </div>
//                      <div>
//                         <label htmlFor="back-template-edit">Edit Back Template HTML:</label>
//                         <textarea
//                             id="back-template-edit"
//                             value={backTemplate}
//                             onChange={(e) => setBackTemplate(e.target.value)}
//                             rows={15}
//                             style={{ width: '100%', minHeight: '200px', display: 'block', margin: '10px 0', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px' }}
//                         />
//                     </div>
//                     <h4>Back Preview:</h4>
//                      <div
//                         style={{ border: '1px dashed grey', display: 'inline-block', margin: '10px 0' }}
//                         dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, backBackgroundImage, sampleStudent) }}
//                     />
//                 </div>

//             </div>

//             {/* --- Save Button --- */}
//             <div style={{ marginTop: '30px', textAlign: 'center' }}>
//                 <Button
//                     name="Save Both Designs"
//                     onClick={handleSaveClick}
//                     color="#28a745" // Green color for save
//                 />
//             </div>
//         </div>
//     );
// };

// export default ImageTest;



// import React, { useState } from "react";
// import Button from "../Dynamic/utils/Button"; // Assuming this path is correct
// import { toast } from "react-toastify"; // Assuming react-toastify is installed and configured
// import { design, dynamicIDCArd } from "../Network/AdminApi";

// // Placeholder component for Button if not available
// // const Button = ({ name, onClick, color }) => <button style={{ backgroundColor: color, color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={onClick}>{name}</button>;

// const ImageTest = () => {
//   // State for the background image URL/DataURL (for preview)
//   const [backgroundImage, setBackgroundImage] = useState(
//     "https://via.placeholder.com/300"
//   );
//   // State to store the actual uploaded File object
//   const [uploadedImageFile, setUploadedImageFile] = useState(null);

//   const [frontTemplate, setFrontTemplate] = useState(`
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
        
//         <img src='\${studentImage || "https://via.placeholder.com/85x95?text=No+Image"}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student Photo"/>
//       </div>
    
//       <div style='position: absolute; left: 3px; top: 190px; width: calc(100% - 6px);'> 
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'> 
//           NAME <span style="margin-left: 16px; font-weight: bold;"> : \${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           CLASS <span style="margin-left: 13px; font-weight: bold"> : \${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           F.Name <span style="margin-left: 9px; font-weight: bold"> : \${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           Phone <span style="margin-left: 12px; font-weight: bold"> : \${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase; /* Removed white-space nowrap for address */'>
//           Address <span style="margin-left:1px; font-weight: bold"> : \${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

//   // 2. Student details state (Example - typically fetched or passed as props)
//   // Using allStudent array for rendering multiple cards
//   const allStudents = [
//     {
//       id: 1,
//       name: "Alice Wonderland",
//       class: "Grade 5",
//       father_name: "Mr. Hatter",
//       mobile: "111222333",
//       address: "1st Rabbit Hole, Wonderland",
//       guardianname: "Queen Hearts",
//       studentImage: "https://via.placeholder.com/85x95/aabbcc?text=Alice" // Example student image
//     },
//     {
//       id: 2,
//       name: "Bob The Builder",
//       class: "Construction 101",
//       father_name: "Mr. Builder Sr.",
//       mobile: "444555666",
//       address: "Building Site #5, Townsville",
//       guardianname: "Wendy",
//       studentImage: null // Example of no image
//     },
//   ];

//   // 3. Template rendering function
//   const renderTemplate = (template, data) => {
//     // Replace background image placeholder first
//     let rendered = template.replace(/\${backgroundImage}/g, backgroundImage); // Use the state for preview

//     // Replace other placeholders (\${key})
//     rendered = rendered.replace(/\${(\w+)}/g, (match, key) => {
//         // Provide default empty string if key doesn't exist in data
//         // Handle specific cases like studentImage which might be null
//         if (key === 'studentImage') {
//             return data[key] || "https://via.placeholder.com/85x95?text=No+Image"; // Default placeholder
//         }
//         return data[key] || "";
//     });
//     return rendered;
//   };


//   // 4. Handle background file change
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Store the actual file object for upload
//       setUploadedImageFile(file);

//       // Read the file as Data URL for preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setBackgroundImage(reader.result); // Update preview state
//       };
//       reader.onerror = (error) => {
//         console.error("FileReader error:", error);
//         toast.error("Error reading file for preview.");
//         setUploadedImageFile(null); // Clear file state on error
//       };
//       reader.readAsDataURL(file);
//     } else {
  
//       setUploadedImageFile(null);
     
//     }
//   };

//   const handleSaveClick = async () => {
//     try {
//       const formDataToSend = new FormData();
  
//       const jsonString = JSON.stringify(frontTemplate);
//       const base64String = btoa(unescape(encodeURIComponent(jsonString)));
  
//       // Append payload fields
//       formDataToSend.append("name", "IDCARD");
//       formDataToSend.append("type", "idCard");
      
//       // formDataToSend.append("content", [{"data":base64String, "name": "Front Side"}]);
//       formDataToSend.append("description", "description");
//       formDataToSend.append("isDefault", true); // boolean ko string me convert karna padta hai FormData me
//       formDataToSend.append("isPublic", false); // boolean ko string me convert karna padta hai FormData me
  
//       if (uploadedImageFile instanceof File) {
//         formDataToSend.append("content[0][image]", uploadedImageFile, uploadedImageFile.name);
//       } else {
//         console.log("No new background image file was uploaded.");
//       }
  
//       for (let [key, value] of formDataToSend.entries()) {
//         console.log(`${key}:`, value);
//       }
  
//       const response = await design(formDataToSend);
  
//       if (response?.success) {
//         toast.success("Data saved successfully!");
//       } else {
//         toast.warn(response?.message || "Partial success or warning from server.");
//       }
  
//     } catch (error) {
//       console.error("Error during handleSaveClick:", error);
//       const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred during save. Please try again.';
//       toast.error(errorMessage);
//     }
//   };
  

//   async function dynamicIDCArd(formData) {
//     console.log("Simulating API call with FormData...");
  
//     await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
//     return { success: true, message: "Data processed successfully" };
  
   
//   }
  

//   return (
//     <div style={{ margin: "2rem auto", fontFamily: "sans-serif", padding: "1rem" }}>
//       <h1>ID Card Generator</h1>

//       <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "2rem" }}>
//         {/* Preview Area */}
//         <div style={{ flex: "1 1 500px", border: "2px solid #ccc", borderRadius: "8px", padding: "1rem", minWidth: "300px" }}>
//           <h2>Preview</h2>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//             {allStudents.map((student) => (
//               <div
//                 key={student.id}
//                 dangerouslySetInnerHTML={{
                 
//                   __html: renderTemplate(frontTemplate, student),
//                 }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Controls Area */}
//         <div style={{ flex: "1 1 400px", backgroundColor: "#f0f0f0", padding: "1rem", borderRadius: "8px", minWidth: "300px" }}>
//           <Button color={"green"} name="Log Payload to Console" onClick={handleSaveClick} />
//           <h2 style={{ marginTop: '1rem' }}>Edit Front Template</h2>
//           <textarea
//             rows={15}
//             style={{ width: "100%", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", padding: "1rem", border: "2px solid gray", boxSizing: 'border-box', fontSize: '0.8em' }}
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//             aria-label="Front Template Editor"
//           />
//           <h3>Change Background Image</h3>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem", boxSizing: 'border-box' }}
//             aria-label="Background Image Upload"
//           />
        
//           {uploadedImageFile ? (
//              <p style={{fontSize: '0.8em', marginTop: '5px', wordBreak: 'break-all'}}><i>Using uploaded file: {uploadedImageFile.name}</i></p>
//           ) : (
//              <p style={{fontSize: '0.8em', marginTop: '5px', wordBreak: 'break-all'}}><i>Using default/previous background: {backgroundImage.substring(0, 50)}...</i></p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;





// import React, { useState } from "react";
// import Button from "../Dynamic/utils/Button"; // Assuming this path is correct
// import { toast } from "react-toastify"; // Assuming react-toastify is installed and configured
// import { design, dynamicIDCArd } from "../Network/AdminApi";

// // Placeholder component for Button if not available
// // const Button = ({ name, onClick, color }) => <button style={{ backgroundColor: color, color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={onClick}>{name}</button>;

// const ImageTest = () => {
//   // State for the background image URL/DataURL (for preview)
//   const [backgroundImage, setBackgroundImage] = useState(
//     "https://via.placeholder.com/300"
//   );
//   // State to store the actual uploaded File object
//   const [uploadedImageFile, setUploadedImageFile] = useState(null);

//   const [frontTemplate, setFrontTemplate] = useState(`
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
        
//         <img src='\${studentImage || "https://via.placeholder.com/85x95?text=No+Image"}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student Photo"/>
//       </div>
    
//       <div style='position: absolute; left: 3px; top: 190px; width: calc(100% - 6px);'> 
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'> 
//           NAME <span style="margin-left: 16px; font-weight: bold;"> : \${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           CLASS <span style="margin-left: 13px; font-weight: bold"> : \${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           F.Name <span style="margin-left: 9px; font-weight: bold"> : \${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           Phone <span style="margin-left: 12px; font-weight: bold"> : \${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase; /* Removed white-space nowrap for address */'>
//           Address <span style="margin-left:1px; font-weight: bold"> : \${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

//   // 2. Student details state (Example - typically fetched or passed as props)
//   // Using allStudent array for rendering multiple cards
//   const allStudents = [
//     {
//       id: 1,
//       name: "Alice Wonderland",
//       class: "Grade 5",
//       father_name: "Mr. Hatter",
//       mobile: "111222333",
//       address: "1st Rabbit Hole, Wonderland",
//       guardianname: "Queen Hearts",
//       studentImage: "https://via.placeholder.com/85x95/aabbcc?text=Alice" // Example student image
//     },
//     {
//       id: 2,
//       name: "Bob The Builder",
//       class: "Construction 101",
//       father_name: "Mr. Builder Sr.",
//       mobile: "444555666",
//       address: "Building Site #5, Townsville",
//       guardianname: "Wendy",
//       studentImage: null // Example of no image
//     },
//   ];

//   // 3. Template rendering function
//   const renderTemplate = (template, data) => {
//     // Replace background image placeholder first
//     let rendered = template.replace(/\${backgroundImage}/g, backgroundImage); // Use the state for preview

//     // Replace other placeholders (\${key})
//     rendered = rendered.replace(/\${(\w+)}/g, (match, key) => {
//         // Provide default empty string if key doesn't exist in data
//         // Handle specific cases like studentImage which might be null
//         if (key === 'studentImage') {
//             return data[key] || "https://via.placeholder.com/85x95?text=No+Image"; // Default placeholder
//         }
//         return data[key] || "";
//     });
//     return rendered;
//   };


//   // 4. Handle background file change
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Store the actual file object for upload
//       setUploadedImageFile(file);

//       // Read the file as Data URL for preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setBackgroundImage(reader.result); // Update preview state
//       };
//       reader.onerror = (error) => {
//         console.error("FileReader error:", error);
//         toast.error("Error reading file for preview.");
//         setUploadedImageFile(null); // Clear file state on error
//       };
//       reader.readAsDataURL(file);
//     } else {
  
//       setUploadedImageFile(null);
     
//     }
//   };

//   // import { toast } from 'react-toastify'; // Assuming you use react-toastify
//   // Assuming dynamicIDCArd is your API call function
//   // import { dynamicIDCArd } from './api'; 
  
//   // Assuming frontTemplate and uploadedImageFile are defined in your component's state or scope
//   // let frontTemplate = { ... };
//   // let uploadedImageFile = null; // or a File object
  
//   const handleSaveClick = async () => {
//     try {
//       const formDataToSend = new FormData();
  
//       // 1. Stringify the object to JSON
//       const jsonString = JSON.stringify(frontTemplate);
  
//       // 2. Encode the JSON string to Base64, handling potential Unicode characters
//       //    The `unescape(encodeURIComponent(str))` pattern ensures UTF-8 characters are handled correctly before btoa
//       const base64String = btoa(unescape(encodeURIComponent(jsonString)));
  
//       // 3. Append the Base64 string
//       formDataToSend.append("frontTemplate", base64String);
//       console.log("Appended frontTemplate as Base64 string."); // Log confirmation
  
//       // Append the background image if it exists
//       if (uploadedImageFile instanceof File) {
//         formDataToSend.append("backgroundImage", uploadedImageFile, uploadedImageFile.name);
//         console.log("Appended background image file:", uploadedImageFile);
//       } else {
//         console.log("No new background image file was uploaded.");
//       }
  
//       // Log the final FormData content (for debugging)
//       console.log("--- FormData Content ---");
//       for (let [key, value] of formDataToSend.entries()) {
//         if (value instanceof File) {
//           console.log(`${key}:`, value); // Log File details
//         } else {
//            // Log the beginning of the base64 string for confirmation, avoid logging the whole potentially huge string
//            console.log(`${key}:`, typeof value === 'string' && value.length > 100 ? value.substring(0, 50) + '... [Base64 String]' : value);
//         }
//       }
//       console.log("------------------------");
  
//       toast.info("Payload prepared (check console). Sending request...");
  
//       // Make the API call
//       const response = await design(formDataToSend); // Replace with your actual API call function
  
//       if (response?.success) {
//         toast.success("Data saved successfully!"); // Use toast for success too
//         // alert("save"); // Consider using toast instead of alert
//       } else {
//          // Handle non-successful but non-error responses if your API does that
//          toast.warn(response?.message || "Save operation completed, but server indicated partial success or a warning.");
//       }
  
//     } catch (error) {
//       console.error("Error during handleSaveClick:", error);
//       // Attempt to parse API error messages if available
//       const errorMessage = error?.response?.data?.message || error?.message || 'An error occurred during save. Please try again.';
//       toast.error(errorMessage);
//     } finally {
//       // Any cleanup code, like resetting a loading state
//     }
//   };
  
//   // --- Helper / Placeholder for the API call ---
//   // Replace this with your actual API call implementation
//   async function dynamicIDCArd(formData) {
//     console.log("Simulating API call with FormData...");
//     // Example: using fetch
//     // const response = await fetch('/api/your-endpoint', {
//     //   method: 'POST',
//     //   body: formData,
//     //   // Headers might not be needed for FormData with fetch,
//     //   // the browser sets Content-Type to multipart/form-data automatically
//     // });
//     // if (!response.ok) {
//     //   const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
//     //   throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
//     // }
//     // return await response.json();
  
//     // Placeholder success response for testing:
//     await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
//     return { success: true, message: "Data processed successfully" };
  
   
//   }
//   // const handleSaveClick = async () => {
//   //   try {
//   //     const formDataToSend = new FormData();
//   //     formDataToSend.append("frontTemplate", JSON.stringify(frontTemplate));
//   //     if (uploadedImageFile instanceof File) {
//   //       formDataToSend.append("backgroundImage", uploadedImageFile, uploadedImageFile.name);
//   //        console.log("Appended background image file:", uploadedImageFile);
//   //     } else {
//   //        console.log("No new background image file was uploaded. The existing URL/default will be used in the template string, but no file is being sent.");
        
//   //     }

//   //     for (let [key, value] of formDataToSend.entries()) {
//   //         if (value instanceof File) {
//   //             console.log(`${key}:`, value); 
//   //         } else {
//   //             console.log(`${key}:`, value); 
//   //         }
//   //     }
     
//   //     toast.info("Payload logged to console. Check developer tools.");

//   //     const response=await dynamicIDCArd(formDataToSend)
//   //     if(response?.success){
//   //       alert("save")
//   //     }
      
//   //   } catch (error) {
//   //     console.error("Error during handleSaveClick:", error);
//   //     toast.error(error?.message || 'An error occurred. Please try again.');
//   //   } finally {
      
//   //   }
//   // };

//   return (
//     <div style={{ margin: "2rem auto", fontFamily: "sans-serif", padding: "1rem" }}>
//       <h1>ID Card Generator</h1>

//       <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "2rem" }}>
//         {/* Preview Area */}
//         <div style={{ flex: "1 1 500px", border: "2px solid #ccc", borderRadius: "8px", padding: "1rem", minWidth: "300px" }}>
//           <h2>Preview</h2>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//             {allStudents.map((student) => (
//               <div
//                 key={student.id}
//                 dangerouslySetInnerHTML={{
                 
//                   __html: renderTemplate(frontTemplate, student),
//                 }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Controls Area */}
//         <div style={{ flex: "1 1 400px", backgroundColor: "#f0f0f0", padding: "1rem", borderRadius: "8px", minWidth: "300px" }}>
//           <Button color={"green"} name="Log Payload to Console" onClick={handleSaveClick} />
//           <h2 style={{ marginTop: '1rem' }}>Edit Front Template</h2>
//           <textarea
//             rows={15}
//             style={{ width: "100%", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", padding: "1rem", border: "2px solid gray", boxSizing: 'border-box', fontSize: '0.8em' }}
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//             aria-label="Front Template Editor"
//           />
//           <h3>Change Background Image</h3>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem", boxSizing: 'border-box' }}
//             aria-label="Background Image Upload"
//           />
        
//           {uploadedImageFile ? (
//              <p style={{fontSize: '0.8em', marginTop: '5px', wordBreak: 'break-all'}}><i>Using uploaded file: {uploadedImageFile.name}</i></p>
//           ) : (
//              <p style={{fontSize: '0.8em', marginTop: '5px', wordBreak: 'break-all'}}><i>Using default/previous background: {backgroundImage.substring(0, 50)}...</i></p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;

// import React, { useState } from "react";
// import Button from "../Dynamic/utils/Button"; // Assuming this path is correct
// import { toast } from "react-toastify"; // Assuming react-toastify is installed and configured
// import { dynamicIDCArd } from "../Network/AdminApi";

// // Placeholder component for Button if not available
// // const Button = ({ name, onClick, color }) => <button style={{ backgroundColor: color, color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer' }} onClick={onClick}>{name}</button>;

// const ImageTest = () => {
//   // State for the background image URL/DataURL (for preview)
//   const [backgroundImage, setBackgroundImage] = useState(
//     "https://via.placeholder.com/300"
//   );
//   // State to store the actual uploaded File object
//   const [uploadedImageFile, setUploadedImageFile] = useState(null);

//   const [frontTemplate, setFrontTemplate] = useState(`
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
        
//         <img src='\${studentImage || "https://via.placeholder.com/85x95?text=No+Image"}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student Photo"/>
//       </div>
    
//       <div style='position: absolute; left: 3px; top: 190px; width: calc(100% - 6px);'> 
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 8px; color:BLACK; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'> 
//           NAME <span style="margin-left: 16px; font-weight: bold;"> : \${name} </span>
//         </p>
//         <p style='font-size:6pt; text-transform: uppercase; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           CLASS <span style="margin-left: 13px; font-weight: bold"> : \${class} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           F.Name <span style="margin-left: 9px; font-weight: bold"> : \${father_name} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 1px; font-weight: bold; text-transform: uppercase; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;'>
//           Phone <span style="margin-left: 12px; font-weight: bold"> : \${mobile} </span>
//         </p>
//         <p style='font-size:6pt; margin-top: 4px; color:BLACK; margin-right: 15px; font-weight: bold; text-transform: uppercase; /* Removed white-space nowrap for address */'>
//           Address <span style="margin-left:1px; font-weight: bold"> : \${address} </span>
//         </p>
//       </div>
//     </div>
//   `);

//   // 2. Student details state (Example - typically fetched or passed as props)
//   // Using allStudent array for rendering multiple cards
//   const allStudents = [
//     {
//       id: 1,
//       name: "Alice Wonderland",
//       class: "Grade 5",
//       father_name: "Mr. Hatter",
//       mobile: "111222333",
//       address: "1st Rabbit Hole, Wonderland",
//       guardianname: "Queen Hearts",
//       studentImage: "https://via.placeholder.com/85x95/aabbcc?text=Alice" // Example student image
//     },
//     {
//       id: 2,
//       name: "Bob The Builder",
//       class: "Construction 101",
//       father_name: "Mr. Builder Sr.",
//       mobile: "444555666",
//       address: "Building Site #5, Townsville",
//       guardianname: "Wendy",
//       studentImage: null // Example of no image
//     },
//   ];

//   // 3. Template rendering function
//   const renderTemplate = (template, data) => {
//     // Replace background image placeholder first
//     let rendered = template.replace(/\${backgroundImage}/g, backgroundImage); // Use the state for preview

//     // Replace other placeholders (\${key})
//     rendered = rendered.replace(/\${(\w+)}/g, (match, key) => {
//         // Provide default empty string if key doesn't exist in data
//         // Handle specific cases like studentImage which might be null
//         if (key === 'studentImage') {
//             return data[key] || "https://via.placeholder.com/85x95?text=No+Image"; // Default placeholder
//         }
//         return data[key] || "";
//     });
//     return rendered;
//   };


//   // 4. Handle background file change
//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       // Store the actual file object for upload
//       setUploadedImageFile(file);

//       // Read the file as Data URL for preview
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setBackgroundImage(reader.result); // Update preview state
//       };
//       reader.onerror = (error) => {
//         console.error("FileReader error:", error);
//         toast.error("Error reading file for preview.");
//         setUploadedImageFile(null); // Clear file state on error
//       };
//       reader.readAsDataURL(file);
//     } else {
//       // If the user cancels file selection, reset the file state
//       setUploadedImageFile(null);
//       // Optional: Reset preview to default or keep the last one?
//       // setBackgroundImage("https://via.placeholder.com/300"); // Reset to default
//     }
//   };

//   // 5. Handle Save Click - Construct FormData and log
//   const handleSaveClick = async () => {
//     try {
//       const formDataToSend = new FormData();

//       // 1. Append the template string
//       // Note: JSON.stringify might not be necessary if the backend expects a plain string.
//       // If it expects JSON, then keep stringify. Let's keep it as in your original code.
//       formDataToSend.append("frontTemplate", JSON.stringify(frontTemplate));

//       // 2. Append the background image file *if* one was uploaded
//       if (uploadedImageFile instanceof File) {
//         // The key "backgroundImage" should match what the backend expects for the file upload.
//         formDataToSend.append("backgroundImage", uploadedImageFile, uploadedImageFile.name);
//          console.log("Appended background image file:", uploadedImageFile);
//       } else {
//          console.log("No new background image file was uploaded. The existing URL/default will be used in the template string, but no file is being sent.");
//          // Decide if you need to send the current `backgroundImage` URL string under a different key,
//          // e.g., formDataToSend.append("backgroundImageUrl", backgroundImage);
//          // This depends entirely on your backend API design.
//       }

//       // --- Console Logging the Payload ---
//       console.log("--- Payload to be sent (FormData entries) ---");
//       // FormData is tricky to log directly. Iterate through its entries:
//       for (let [key, value] of formDataToSend.entries()) {
//           if (value instanceof File) {
//               console.log(`${key}:`, value); // Logs File object details
//           } else {
//               console.log(`${key}:`, value); // Logs the string value
//           }
//       }
//       console.log("------------------------------------------");
//       toast.info("Payload logged to console. Check developer tools.");

//       const response=await dynamicIDCArd(formDataToSend)
//       if(response?.success){
//         alert("save")
//       }
//       // --- Mock API Call (Commented out) ---
//       // console.log("Simulating API call with FormData...");
//       // const response = await fetch('/your-api-endpoint', { // Replace with your actual endpoint
//       //   method: 'POST',
//       //   body: formDataToSend,
//       //   // Headers might be needed depending on backend (e.g., Authorization)
//       //   // Don't set 'Content-Type': 'multipart/form-data', browser does it automatically with FormData
//       // });
//       //
//       // if (!response.ok) {
//       //    // Try to get error message from response body
//       //    let errorData;
//       //    try {
//       //        errorData = await response.json();
//       //    } catch (e) {
//       //        errorData = { message: 'Failed to parse error response.' };
//       //    }
//       //    throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
//       // }
//       //
//       // const result = await response.json();
//       // console.log("API Response:", result);
//       //
//       // if (result.success) { // Adjust based on your actual API response structure
//       //   toast.success("Data saved successfully!");
//       // } else {
//       //   toast.error(result?.message || "Save failed.");
//       // }
//       // --- End Mock API Call ---


//     } catch (error) {
//       console.error("Error during handleSaveClick:", error);
//       toast.error(error?.message || 'An error occurred. Please try again.');
//     } finally {
//       // Optional: Add loading state handling (e.g., setLoading(false))
//     }
//   };

//   return (
//     <div style={{ margin: "2rem auto", fontFamily: "sans-serif", padding: "1rem" }}>
//       <h1>ID Card Generator</h1>

//       <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", marginBottom: "2rem" }}>
//         {/* Preview Area */}
//         <div style={{ flex: "1 1 500px", border: "2px solid #ccc", borderRadius: "8px", padding: "1rem", minWidth: "300px" }}>
//           <h2>Preview</h2>
//           <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
//             {allStudents.map((student) => (
//               <div
//                 key={student.id}
//                 dangerouslySetInnerHTML={{
//                   // Pass student data AND the current background image URL/DataURL
//                   __html: renderTemplate(frontTemplate, student),
//                 }}
//               />
//             ))}
//           </div>
//         </div>

//         {/* Controls Area */}
//         <div style={{ flex: "1 1 400px", backgroundColor: "#f0f0f0", padding: "1rem", borderRadius: "8px", minWidth: "300px" }}>
//           <Button color={"green"} name="Log Payload to Console" onClick={handleSaveClick} />
//           <h2 style={{ marginTop: '1rem' }}>Edit Front Template</h2>
//           <textarea
//             rows={15}
//             style={{ width: "100%", fontFamily: "monospace", whiteSpace: "pre-wrap", wordBreak: "break-all", padding: "1rem", border: "2px solid gray", boxSizing: 'border-box', fontSize: '0.8em' }}
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//             aria-label="Front Template Editor"
//           />
//           <h3>Change Background Image</h3>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem", boxSizing: 'border-box' }}
//             aria-label="Background Image Upload"
//           />
//           {/* Display current background image source for clarity */}
//           {uploadedImageFile ? (
//              <p style={{fontSize: '0.8em', marginTop: '5px', wordBreak: 'break-all'}}><i>Using uploaded file: {uploadedImageFile.name}</i></p>
//           ) : (
//              <p style={{fontSize: '0.8em', marginTop: '5px', wordBreak: 'break-all'}}><i>Using default/previous background: {backgroundImage.substring(0, 50)}...</i></p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;


// import React, { useState } from "react";
// import Button from "../Dynamic/utils/Button";
// import { toast } from "react-toastify";

// const ImageTest = () => {
//   // 1. Front & Back Templates
//   const [backgroundImage, setBackgroundImage] = useState("https://via.placeholder.com/300");

//   const [frontTemplate, setFrontTemplate] = useState(`
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


//   // 2. Student details state
//   const [student, setStudent] = useState({
//     name: "John Doe",
//     class: "10th Grade",
//     father_name: "Mr. Doe",
//     mobile: "9876543210",
//     address: "123 Main St",
//     guardianname: "Uncle Joe",
//   });
//   const allStudent=[
//     {
//       name: "John Doe1",
//       class: "10th Grade1",
//       father_name: "Mr. Doe1",
//       mobile: "9876543210",
//       address: "123 Main St",
//       guardianname: "Uncle Joe",
//     },{
//       name: "John Doe",
//       class: "10th Grade",
//       father_name: "Mr. Doe",
//       mobile: "9876543210",
//       address: "123 Main St",
//       guardianname: "Uncle Joe",
//     }
//   ]

//   // 3. Template rendering function
//   const renderTemplate = (template, data) => {
//     return template.replace(/\${(\w+)}/g, (_, key) => data[key] || "");
//   };

//   // 4. Update student details
//   const handleStudentChange = (e) => {
//     const { name, value } = e.target;
//     setStudent((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setBackgroundImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   const handleSaveClick = async () => {
//     try {
//         const formDataToSend = new FormData();

//         const payload = {
//             frontTemplate: JSON.stringify(frontTemplate),
//         };

//         Object.entries(payload).forEach(([key, value]) =>
//             formDataToSend.append(key, value)
//         );

//         if (backgroundImage instanceof File) {
//             formDataToSend.append("backgroundImage", backgroundImage);
//         }
// console.log("payload",payload)
//         // const response = await Admission(formDataToSend);

//         if (response.success) {
//             toast.success("successful!");
//         } else {
//             toast.error(response?.message || response?.data?.message || " failed.");
//         }
//     } catch (error) {
//         console.error("Error during :", error);
//         toast.error(error?.response?.data?.message || error.message || 'Please try again.');
//     } finally {
      
//     }
// };

//   return (
//     <div style={{ margin: "2rem auto", fontFamily: "sans-serif" }}>
//       <h1>ID Card Generator</h1>

//       <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
//         {/* Front Side Preview */}
//         <div style={{ flex: 1, border: "2px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
//           <h2>Front Side</h2>
//           {
//             allStudent.map((item)=> <div dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, { ...item, backgroundImage }) }} />)
//           }
         
//         </div>
       
//         <div style={{ flex: 1 ,backgroundColor:"gray"}} >
//           <Button color={"green"} name="Submit"  onClick={handleSaveClick}/>
//           <h2>Edit Front Template</h2>
//           <textarea
//             rows={12}
//             style={{ width: "100%", fontFamily: "monospace", whiteSpace: "pre", padding: "1rem",border:"2px solid gray" }}
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//           />
//           <h3>Change Background Image</h3>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ImageTest;



// import React, { useState } from "react";

// const ImageTest = () => {
//   // 1. Front & Back Templates
//   const [frontTemplate, setFrontTemplate] = useState(`
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

//   const [backgroundImage, setBackgroundImage] = useState("https://via.placeholder.com/300");

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

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setBackgroundImage(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   return (
//     <div style={{ margin: "2rem auto", fontFamily: "sans-serif" }}>
//       <h1>ID Card Generator</h1>

//       <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem" }}>
//         {/* Front Side Preview */}
//         <div style={{ flex: 1, border: "2px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
//           <h2>Front Side</h2>
//           <div dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, { ...student, backgroundImage }) }} />
//         </div>

//         {/* Front Template Editor */}
//         <div style={{ flex: 1 ,backgroundColor:"gray"}} >
//           <h2>Edit Front Template</h2>
//           <textarea
//             rows={12}
//             style={{ width: "100%", fontFamily: "monospace", whiteSpace: "pre", padding: "1rem",border:"2px solid gray" }}
//             value={frontTemplate}
//             onChange={(e) => setFrontTemplate(e.target.value)}
//           />
//           <h3>Change Background Image</h3>
//           <input
//             type="file"
//             accept="image/*"
//             onChange={handleFileChange}
//             style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
//           />
//         </div>
//       </div>

//       <div style={{ display: "flex", gap: "2rem" }}>
//         {/* Back Side Preview */}
//         <div style={{ flex: 1, border: "2px solid #ccc", borderRadius: "8px", padding: "1rem" }}>
//           <h2>Back Side</h2>
//           <div dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, student) }} />
//         </div>

      
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




