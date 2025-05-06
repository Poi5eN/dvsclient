import React, { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { design, getIDcarddesign } from "../Network/AdminApi"; // Verify path
import PageHeaderWithBreadcrumb from "../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../Dynamic/BreadcrumbList";
const Button = ({ name, onClick, color, style }) => (
    <button style={{ backgroundColor: color || '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', margin: '5px', ...style }} onClick={onClick}>{name}</button>
);
const detailedSampleStudent = {
    "_id": "680836dcc86519be36edb8b1",
    "studentId": "91b2793f-d08d-4c24-92a6-5d95929bc242",
    "schoolId": "ef335693-3a2a-47c2-8dc6-cb8c882075f5",
    "session": "2025-2026",
    "studentName": "dk",
    "email": "dk1234567890@gmail.com",
    "dateOfBirth": "2025-04-23T00:00:00.000Z",
    "motherName": "Mrs. Mother Sample",
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
    },
    "fatherImage": { "public_id": "", "url": "https://via.placeholder.com/60x70/ffcccc?text=Father" },
    "motherImage": { "public_id": "", "url": "https://via.placeholder.com/60x70/ccffcc?text=Mother" },
    "guardianImage": { "public_id": "", "url": "" },
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

// Default Templates
const defaultFrontTemplate = `
<div style='background-image:url(\${backgroundImage}); background-position: center;background-repeat: no-repeat;width: 54mm;height: 86mm;position: relative;background-size:cover;border:1px solid #ccc; box-sizing: border-box; overflow: hidden;'>
    {/* ... rest of default front template ... */}
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
        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>Roll No.<span style="margin-left: 9px; font-weight: bold;">: \${rollNo}</span></p>
        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>PHONE<span style="margin-left: 12px; font-weight: bold;">: \${mobile}</span></p>
        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>DOB<span style="margin-left: 12px; font-weight: bold;">: \${dob}</span></p>
        <p style='font-size:10px; text-transform: uppercase; margin: 0; color:BLACK; font-weight: bold; line-height: 1.2;'>ADDRESS<span style="margin-left: 1px; font-weight: bold;">: \${address}</span></p>
    </div>
</div>`;

const defaultBackTemplate = `
    <div style='background-image:url(\${backgroundImage}); background-position: center; background-repeat: no-repeat; width: 54mm; height: 86mm; position: relative; background-size: cover; border: 1px solid #ccc; box-sizing: border-box; overflow: hidden; font-family: sans-serif;'>
        {/* ... rest of default back template ... */}
         <div style='position: absolute; left: 160px; top: 5px; width: calc(54mm - 6px); font-family: sans-serif; '>
            <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'> \${admissionNumber}</p>
        </div/>
        <div style='margin-left: 5px; margin-top: 165px; width: 60px; height: 85px; border-radius: 4px; overflow: hidden; position: absolute; background-color: #eee; text-align: center;'>
            <img src='\${fatherImage}' style='width: 100%; height: 65px; object-fit: cover; display: block; margin-bottom: 2px;' alt="Father"/>
            <p style='font-size: 8px; color: #333; margin: 0; line-height: 1.1; font-weight: bold;'>Father</p>
        </div>
        <div style='margin-left: 70px; margin-top: 165px; width: 60px; height: 85px; border-radius: 4px; overflow: hidden; position: absolute; background-color: #eee; text-align: center;'>
            <img src='\${motherImage}' style='width: 100%; height: 65px; object-fit: cover; display: block; margin-bottom: 2px;' alt="Mother"/>
            <p style='font-size: 8px; color: #333; margin: 0; line-height: 1.1; font-weight: bold;'>Mother</p>
        </div>
        <div style='margin-left: 135px; margin-top: 165px; width: 60px; height: 85px; border-radius: 4px; overflow: hidden; position: absolute; background-color: #eee; text-align: center;'>
            <img src='\${guardianImage}' style='width: 100%; height: 65px; object-fit: cover; display: block; margin-bottom: 2px;' alt="Guardian"/>
             <p style='font-size: 8px; color: #333; margin: 0; line-height: 1.1; font-weight: bold;'>Guardian</p>
        </div>
    </div>`;


const ImageTest = () => {
    const [idCardData, setIdCardData] = useState(null); // Holds raw API response
    console.log("idCardData",idCardData)
    const [isLoading, setIsLoading] = useState(false); // Loading state
    const [isSaving, setIsSaving] = useState(false); // Saving state
    const [frontTemplate, setFrontTemplate] = useState(defaultFrontTemplate);
    const [backTemplate, setBackTemplate] = useState(defaultBackTemplate);
    const [frontBackgroundImage, setFrontBackgroundImage] = useState("https://via.placeholder.com/204x325/e0f0ff?text=Front+BG");
    const [uploadedFrontImageFile, setUploadedFrontImageFile] = useState(null);
    const [backBackgroundImage, setBackBackgroundImage] = useState(idCardData?.frontImage?.url);
    const [uploadedBackImageFile, setUploadedBackImageFile] = useState(null);

    // --- Base64 Decoding ---
    const decodeBase64 = useCallback((encoded) => {
        try {
            if (!encoded || typeof encoded !== 'string') { return null; }
            // Basic cleaning (remove potential surrounding quotes)
            let cleanEncoded = encoded.trim();
            if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
                cleanEncoded = cleanEncoded.substring(1, cleanEncoded.length - 1);
            }
             const binaryString = window.atob(cleanEncoded);
            const bytes = new Uint8Array(binaryString.length);
            for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
            const decoder = new TextDecoder('utf-8'); // Specify UTF-8
            return decoder.decode(bytes);
        } catch (error) {
            console.error("Error decoding base64 string:", error, "Input:", encoded.substring(0, 50) + "..."); // Log truncated input
            toast.error("Failed to decode template from server.");
            return null; // Return null indicating failure
        }
    }, []);

    const fetchTemplate = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getIDcarddesign();
            if (response?.success && response?.designFormats?.length > 0) {
                const fetchedData = response.designFormats[0];
                setIdCardData(fetchedData); 
                const decodedFront = decodeBase64(fetchedData.frontTemplate);
                const decodedBack = decodeBase64(fetchedData.backTemplate);

                if (decodedFront) {
                    console.log("Setting Front Template from API");
                    setFrontTemplate(decodedFront);
                } else {
                     console.log("Using default Front Template (API decode failed or no template)");
                    setFrontTemplate(defaultFrontTemplate); // Fallback to default if decode fails
                }
                if (decodedBack) {
                     console.log("Setting Back Template from API");
                    setBackTemplate(decodedBack);
                } else {
                     console.log("Using default Back Template (API decode failed or no template)");
                    setBackTemplate(defaultBackTemplate); // Fallback to default
                }

                 if(fetchedData.frontImage) setFrontBackgroundImage(fetchedData?.frontImage?.url);
                //  if(fetchedData.frontImageUrl) setFrontBackgroundImage(fetchedData.frontImageUrl);
                 if(fetchedData.backImage) setBackBackgroundImage(fetchedData.backImage?.url);

            } else {
                console.warn("No custom ID card design found or API error. Using default templates.");
                setIdCardData(null);
                setFrontTemplate(defaultFrontTemplate); // Ensure defaults are set
                setBackTemplate(defaultBackTemplate);
            }
        } catch (error) {
            console.error("Error fetching ID card design:", error);
            toast.error(`Could not load ID card template: ${error.message}`);
            setIdCardData(null);
            setFrontTemplate(defaultFrontTemplate); // Fallback on error
            setBackTemplate(defaultBackTemplate);
        } finally {
            setIsLoading(false);
        }
    }, [decodeBase64]); // decodeBase64 is stable due to useCallback

    // Fetch template on initial mount
    useEffect(() => {
        fetchTemplate();
    }, [fetchTemplate]); // Depend on the stable fetchTemplate function


    // --- Template Rendering ---
    const renderTemplate = useCallback((templateString, backgroundUrl, student) => {
        if (typeof templateString !== 'string') {
            console.error("renderTemplate called with non-string template:", templateString);
            return `<div style='border:1px solid red; color:red; padding:10px;'>Template Error: Invalid template input.</div>`;
        }

        const placeholderPersonImage = "https://via.placeholder.com/80x90.png?text=N/A";
        const data = {
          backgroundImage: backgroundUrl || '',
        //   backgroundImage: backgroundUrl || '',
          studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Img",
          name: student?.studentName?.toUpperCase() || 'N/A',
          class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
          father_name: student?.fatherName?.toUpperCase() || 'N/A',
          mother_name: student?.motherName?.toUpperCase() || 'N/A',
          mobile: student?.contact || student?.parentContact || 'N/A',
          dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
          address: student?.address || 'N/A',
          guardianname: student?.guardianName || 'N/A', // Check if this placeholder exists in templates
          session: student?.session || 'N/A',          // Check if this placeholder exists
          fatherImage: student?.fatherImage?.url || placeholderPersonImage,
          motherImage: student?.motherImage?.url || placeholderPersonImage,
          guardianImage: student?.guardianImage?.url || placeholderPersonImage,
          admissionNumber: student?.admissionNumber || 'N/A'
        };

        let renderedHtml = templateString;
        try {
          renderedHtml = renderedHtml.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
            const cleanKey = key.trim();
            if (data.hasOwnProperty(cleanKey)) {
              return String(data[cleanKey] ?? ''); // Use nullish coalescing for cleaner fallback
            } else {
              console.warn(`Placeholder \${${cleanKey}} not found in data object.`);
              return ''; // Return empty string for missing data
            }
          });
        } catch (error) {
          console.error("Error during template placeholder replacement:", error);
          return `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; box-sizing: border-box; text-align: center; padding: 5px; page-break-inside: avoid;'>Template Rendering Error: ${error.message}</div>`;
        }
        return renderedHtml;
    }, []); 

    // --- File Handling ---
     const handleFileChange = (e, side) => {
        const file = e.target.files[0];
        if (file) {
            // Simple type check
            if (!file.type.startsWith('image/')) {
                toast.error("Please upload a valid image file (jpg, png, gif, etc.).");
                e.target.value = null; // Reset input
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                if (side === 'front') { setFrontBackgroundImage(reader.result); setUploadedFrontImageFile(file); }
                else if (side === 'back') { setBackBackgroundImage(reader.result); setUploadedBackImageFile(file); }
            };
            reader.onerror = (error) => {
                console.error("FileReader error:", error);
                toast.error(`Error reading ${side} file.`);
                if (side === 'front') { setUploadedFrontImageFile(null); /* Optionally reset preview: setFrontBackgroundImage(...) */ }
                else { setUploadedBackImageFile(null); /* Optionally reset preview: setBackBackgroundImage(...) */ }
            };
            reader.readAsDataURL(file);
        } else {
             if (side === 'front') setUploadedFrontImageFile(null); else setUploadedBackImageFile(null);
        }
        
    };

    const handleSaveClick = async () => {
        setIsSaving(true);
        try {
            const formDataToSend = new FormData();
            const utf8ToBase64 = (str) => {
                try {
                     const encoder = new TextEncoder();
                     const uint8Array = encoder.encode(str);
                     const binaryString = String.fromCharCode(...uint8Array); // Convert bytes to binary string
                     return btoa(binaryString);
                } catch (e) {
                    console.error("Base64 encoding error:", e, "Input string:", str.substring(0, 100)+"...");
                    toast.error("Error encoding template data. Check template content.");
                    return null; // Indicate failure
                }
            };

            // Encode the CURRENT templates from state
            const frontBase64 = utf8ToBase64(frontTemplate); // Use state variable
            const backBase64 = utf8ToBase64(backTemplate);   // Use state variable

            if (frontBase64 === null || backBase64 === null) {
                toast.error("Failed to encode templates. Cannot save.");
                setIsSaving(false);
                return; // Stop if encoding failed
            }

            const contentArray = [
                { data: frontBase64, name: "Front Side Template" }, // Changed name for clarity
                { data: backBase64, name: "Back Side Template" }   // Changed name for clarity
            ];
             formDataToSend.append("content", JSON.stringify(contentArray)); // Append the structured data
            formDataToSend.append("name", idCardData?.name || "Student ID Card Design"); // Use fetched name or default
            formDataToSend.append("type", idCardData?.type || "idCard");
            formDataToSend.append("description", idCardData?.description || "Front/back design template");
            formDataToSend.append("isDefault", idCardData?.isDefault?.toString() || "true"); // Send as string
            formDataToSend.append("isPublic", idCardData?.isPublic?.toString() || "false");   // Send as string
             let frontImageAppended = false;
             let backImageAppended = false;
            if (uploadedFrontImageFile instanceof File) {
                 
                formDataToSend.append(`content[0][image]`, uploadedFrontImageFile, uploadedFrontImageFile.name);
                console.log("Appending Front File:", uploadedFrontImageFile.name);
                frontImageAppended = true;
            }
            if (uploadedBackImageFile instanceof File) {
                 
                formDataToSend.append(`content[1][image]`, uploadedBackImageFile, uploadedBackImageFile.name);
                console.log("Appending Back File:", uploadedBackImageFile.name);
                backImageAppended = true;
            }

             for (let [key, value] of formDataToSend.entries()) {
                 console.log(key, value);
             }
               const response = await design(formDataToSend);
            if (response?.success) {
               toast.success(response.message || "Designs saved successfully!");
               
            } else {
               toast.error(response?.message || "Failed to save designs.");
            }
        } catch (error) {
            console.error("Save Error:", error);
           
            const errorMsg = error?.response?.data?.message || error?.message || 'An unexpected error occurred while saving.';
            toast.error(errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading ID Card Template...</div>;
    }

    return (
        <>
         <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID Card Design Editor (Front & Back)"/>
        <div 
    
        >
           
            <div 
        
             className="bg-white p-2 rounded-lg shadow border border-gray-200 grid sm:grid-cols-1 md:grid-cols-2 gap-2"
            >

               
                <div
                  className="bg-white  rounded-lg shadow border border-gray-200 "
              
                 >
                    <h3>Front Side</h3>
                    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                        {/* Front Preview */}
                        <div style={{ flex: 'none', minWidth: '210px', marginBottom: '10px' }}>
                            <h4>Preview:</h4>
                            <div
                                // style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0, verticalAlign: 'top', width: '54mm', height: '86mm' }} // Enforce size
                                dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, frontBackgroundImage, detailedSampleStudent) }}
                                // ^^ CORRECTED: Use frontTemplate state variable for preview
                            />
                        </div>
                        {/* Front Controls */}
                        <div style={{ flex: 1, minWidth: '300px' }}>
                            <div>
                                <label htmlFor="front-bg-upload">Upload Front BG Image:</label>
                                <input type="file" id="front-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
                            </div>
                            <div>
                                <label htmlFor="front-template-edit">Edit Front HTML Template:</label>
                                <textarea
                                    id="front-template-edit"
                                    value={frontTemplate} // Bind to the state variable
                                    onChange={(e) => setFrontTemplate(e.target.value)} // Update the state variable
                                    rows={15}
                                    style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>

               
                <div 
                 className="bg-white p-2 rounded-lg shadow border border-gray-200 "
                
                >
                     <h3>Back Side</h3>
                     <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                         {/* Back Preview */}
                         <div style={{ flex: 'none', minWidth: '210px', marginBottom: '10px' }}>
                             <h4>Preview:</h4>
                             <div
                                 style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0, verticalAlign: 'top', width: '54mm', height: '86mm' }} // Enforce size
                                 dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, backBackgroundImage, detailedSampleStudent) }}
                                 // ^^ CORRECTED: Use backTemplate state variable for preview
                             />
                         </div>
                         {/* Back Controls */}
                         <div style={{ flex: 1, minWidth: '300px' }}>
                             <div>
                                 <label htmlFor="back-bg-upload">Upload Back BG Image:</label>
                                 <input type="file" id="back-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
                             </div>
                             <div>
                                 <label htmlFor="back-template-edit">Edit Back HTML Template:</label>
                                 <textarea
                                     id="back-template-edit"
                                     value={backTemplate} // Bind to the state variable
                                     onChange={(e) => setBackTemplate(e.target.value)} // Update the state variable
                                     rows={15}
                                     style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
                                 />
                             </div>
                         </div>
                     </div>
                </div>
            </div>
            <Button
                    name={isSaving ? "Saving..." : "Save Both Designs"}
                    onClick={handleSaveClick}
                    color="#28a745"
                    disabled={isSaving || isLoading} // Disable while saving or loading
                    style={isSaving || isLoading ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
                />
          
        </div>
        </>
    );
};

export default ImageTest;
// import React, { useCallback, useEffect, useMemo, useState } from "react";
// import { toast } from "react-toastify";
// import moment from "moment";
// import { design, getIDcarddesign } from "../Network/AdminApi"; // Verify path
// import PageHeaderWithBreadcrumb from "../Dynamic/PageHeaderWithBreadcrumb";
// import BreadcrumbList from "../Dynamic/BreadcrumbList";
// const Button = ({ name, onClick, color, style }) => (
//     <button style={{ backgroundColor: color || '#007bff', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '1rem', margin: '5px', ...style }} onClick={onClick}>{name}</button>
// );
// const detailedSampleStudent = {
//     "_id": "680836dcc86519be36edb8b1",
//     "studentId": "91b2793f-d08d-4c24-92a6-5d95929bc242",
//     "schoolId": "ef335693-3a2a-47c2-8dc6-cb8c882075f5",
//     "session": "2025-2026",
//     "studentName": "dk",
//     "email": "dk1234567890@gmail.com",
//     "dateOfBirth": "2025-04-23T00:00:00.000Z",
//     "motherName": "Mrs. Mother Sample",
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
//     },
//     "fatherImage": { "public_id": "", "url": "https://via.placeholder.com/60x70/ffcccc?text=Father" },
//     "motherImage": { "public_id": "", "url": "https://via.placeholder.com/60x70/ccffcc?text=Mother" },
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

// // Default Templates
// const defaultFrontTemplate = `
// <div style='background-image:url(\${backgroundImage}); background-position: center;background-repeat: no-repeat;width: 54mm;height: 86mm;position: relative;background-size:cover;border:1px solid #ccc; box-sizing: border-box; overflow: hidden;'>
//     {/* ... rest of default front template ... */}
//     <div style='margin-left: 60px; margin-top: 92px; width: 85px; height: 95px; border: 0.5px solid #ff0000; border-radius: 4px; overflow:hidden; position:absolute; background-color: #eee;'>
//         <img src='\${studentImage}' style='width: 100%; height: 100%; object-fit: cover;' alt="Student"/>
//     </div>
//      <div style='position: absolute; left: 150px; top: 145px; width: calc(54mm - 6px); font-family: sans-serif; '>
//        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>ADM No.</p>
//        <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'> \${admissionNumber}</p>
//     </div/>
//     <div style='position: absolute; left: 3px; top: 205px; width: calc(54mm - 6px); font-family: sans-serif; '>
//         <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>NAME<span style="margin-left: 16px; font-weight: bold;">: \${name}</span></p>
//         <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>CLASS<span style="margin-left: 13px; font-weight: bold;">: \${class}</span></p>
//         <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>F.NAME<span style="margin-left: 9px; font-weight: bold;">: \${father_name}</span></p>
//         <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>Roll No.<span style="margin-left: 9px; font-weight: bold;">: \${rollNo}</span></p>
//         <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>PHONE<span style="margin-left: 12px; font-weight: bold;">: \${mobile}</span></p>
//         <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'>DOB<span style="margin-left: 12px; font-weight: bold;">: \${dob}</span></p>
//         <p style='font-size:10px; text-transform: uppercase; margin: 0; color:BLACK; font-weight: bold; line-height: 1.2;'>ADDRESS<span style="margin-left: 1px; font-weight: bold;">: \${address}</span></p>
//     </div>
// </div>`;

// const defaultBackTemplate = `
//     <div style='background-image:url(\${backgroundImage}); background-position: center; background-repeat: no-repeat; width: 54mm; height: 86mm; position: relative; background-size: cover; border: 1px solid #ccc; box-sizing: border-box; overflow: hidden; font-family: sans-serif;'>
//         {/* ... rest of default back template ... */}
//          <div style='position: absolute; left: 160px; top: 5px; width: calc(54mm - 6px); font-family: sans-serif; '>
//             <p style='font-size:10px; text-transform: uppercase; margin: 0 0 1px 0; color:BLACK; font-weight: bold; line-height: 1.1;'> \${admissionNumber}</p>
//         </div/>
//         <div style='margin-left: 5px; margin-top: 165px; width: 60px; height: 85px; border-radius: 4px; overflow: hidden; position: absolute; background-color: #eee; text-align: center;'>
//             <img src='\${fatherImage}' style='width: 100%; height: 65px; object-fit: cover; display: block; margin-bottom: 2px;' alt="Father"/>
//             <p style='font-size: 8px; color: #333; margin: 0; line-height: 1.1; font-weight: bold;'>Father</p>
//         </div>
//         <div style='margin-left: 70px; margin-top: 165px; width: 60px; height: 85px; border-radius: 4px; overflow: hidden; position: absolute; background-color: #eee; text-align: center;'>
//             <img src='\${motherImage}' style='width: 100%; height: 65px; object-fit: cover; display: block; margin-bottom: 2px;' alt="Mother"/>
//             <p style='font-size: 8px; color: #333; margin: 0; line-height: 1.1; font-weight: bold;'>Mother</p>
//         </div>
//         <div style='margin-left: 135px; margin-top: 165px; width: 60px; height: 85px; border-radius: 4px; overflow: hidden; position: absolute; background-color: #eee; text-align: center;'>
//             <img src='\${guardianImage}' style='width: 100%; height: 65px; object-fit: cover; display: block; margin-bottom: 2px;' alt="Guardian"/>
//              <p style='font-size: 8px; color: #333; margin: 0; line-height: 1.1; font-weight: bold;'>Guardian</p>
//         </div>
//     </div>`;


// const ImageTest = () => {
//     const [idCardData, setIdCardData] = useState(null); // Holds raw API response
//     console.log("idCardData",idCardData)
//     const [isLoading, setIsLoading] = useState(false); // Loading state
//     const [isSaving, setIsSaving] = useState(false); // Saving state
//     const [frontTemplate, setFrontTemplate] = useState(defaultFrontTemplate);
//     const [backTemplate, setBackTemplate] = useState(defaultBackTemplate);
//     const [frontBackgroundImage, setFrontBackgroundImage] = useState("https://via.placeholder.com/204x325/e0f0ff?text=Front+BG");
//     const [uploadedFrontImageFile, setUploadedFrontImageFile] = useState(null);
//     const [backBackgroundImage, setBackBackgroundImage] = useState(idCardData?.frontImage?.url);
//     const [uploadedBackImageFile, setUploadedBackImageFile] = useState(null);

//     // --- Base64 Decoding ---
//     const decodeBase64 = useCallback((encoded) => {
//         try {
//             if (!encoded || typeof encoded !== 'string') { return null; }
//             // Basic cleaning (remove potential surrounding quotes)
//             let cleanEncoded = encoded.trim();
//             if (cleanEncoded.startsWith('"') && cleanEncoded.endsWith('"')) {
//                 cleanEncoded = cleanEncoded.substring(1, cleanEncoded.length - 1);
//             }
//              const binaryString = window.atob(cleanEncoded);
//             const bytes = new Uint8Array(binaryString.length);
//             for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
//             const decoder = new TextDecoder('utf-8'); // Specify UTF-8
//             return decoder.decode(bytes);
//         } catch (error) {
//             console.error("Error decoding base64 string:", error, "Input:", encoded.substring(0, 50) + "..."); // Log truncated input
//             toast.error("Failed to decode template from server.");
//             return null; // Return null indicating failure
//         }
//     }, []);

//     const fetchTemplate = useCallback(async () => {
//         setIsLoading(true);
//         try {
//             const response = await getIDcarddesign();
//             if (response?.success && response?.designFormats?.length > 0) {
//                 const fetchedData = response.designFormats[0];
//                 setIdCardData(fetchedData); 
//                 const decodedFront = decodeBase64(fetchedData.frontTemplate);
//                 const decodedBack = decodeBase64(fetchedData.backTemplate);

//                 if (decodedFront) {
//                     console.log("Setting Front Template from API");
//                     setFrontTemplate(decodedFront);
//                 } else {
//                      console.log("Using default Front Template (API decode failed or no template)");
//                     setFrontTemplate(defaultFrontTemplate); // Fallback to default if decode fails
//                 }
//                 if (decodedBack) {
//                      console.log("Setting Back Template from API");
//                     setBackTemplate(decodedBack);
//                 } else {
//                      console.log("Using default Back Template (API decode failed or no template)");
//                     setBackTemplate(defaultBackTemplate); // Fallback to default
//                 }

//                  if(fetchedData.frontImage) setFrontBackgroundImage(fetchedData?.frontImage?.url);
//                 //  if(fetchedData.frontImageUrl) setFrontBackgroundImage(fetchedData.frontImageUrl);
//                  if(fetchedData.backImage) setBackBackgroundImage(fetchedData.backImage?.url);

//             } else {
//                 console.warn("No custom ID card design found or API error. Using default templates.");
//                 setIdCardData(null);
//                 setFrontTemplate(defaultFrontTemplate); // Ensure defaults are set
//                 setBackTemplate(defaultBackTemplate);
//             }
//         } catch (error) {
//             console.error("Error fetching ID card design:", error);
//             toast.error(`Could not load ID card template: ${error.message}`);
//             setIdCardData(null);
//             setFrontTemplate(defaultFrontTemplate); // Fallback on error
//             setBackTemplate(defaultBackTemplate);
//         } finally {
//             setIsLoading(false);
//         }
//     }, [decodeBase64]); // decodeBase64 is stable due to useCallback

//     // Fetch template on initial mount
//     useEffect(() => {
//         fetchTemplate();
//     }, [fetchTemplate]); // Depend on the stable fetchTemplate function


//     // --- Template Rendering ---
//     const renderTemplate = useCallback((templateString, backgroundUrl, student) => {
//         if (typeof templateString !== 'string') {
//             console.error("renderTemplate called with non-string template:", templateString);
//             return `<div style='border:1px solid red; color:red; padding:10px;'>Template Error: Invalid template input.</div>`;
//         }

//         const placeholderPersonImage = "https://via.placeholder.com/80x90.png?text=N/A";
//         const data = {
//           backgroundImage: backgroundUrl || '',
//         //   backgroundImage: backgroundUrl || '',
//           studentImage: student?.studentImage?.url || "https://via.placeholder.com/85x95.png?text=No+Img",
//           name: student?.studentName?.toUpperCase() || 'N/A',
//           class: student?.class ? `${student.class}${student.section ? ` - ${student.section}` : ''}` : 'N/A',
//           father_name: student?.fatherName?.toUpperCase() || 'N/A',
//           mother_name: student?.motherName?.toUpperCase() || 'N/A',
//           mobile: student?.contact || student?.parentContact || 'N/A',
//           dob: student?.dateOfBirth ? moment(student.dateOfBirth).format("DD-MM-YYYY") : 'N/A',
//           address: student?.address || 'N/A',
//           guardianname: student?.guardianName || 'N/A', // Check if this placeholder exists in templates
//           session: student?.session || 'N/A',          // Check if this placeholder exists
//           fatherImage: student?.fatherImage?.url || placeholderPersonImage,
//           motherImage: student?.motherImage?.url || placeholderPersonImage,
//           guardianImage: student?.guardianImage?.url || placeholderPersonImage,
//           admissionNumber: student?.admissionNumber || 'N/A'
//         };

//         let renderedHtml = templateString;
//         try {
//           renderedHtml = renderedHtml.replace(/\$\{\s*([a-zA-Z0-9_]+)\s*\}/g, (match, key) => {
//             const cleanKey = key.trim();
//             if (data.hasOwnProperty(cleanKey)) {
//               return String(data[cleanKey] ?? ''); // Use nullish coalescing for cleaner fallback
//             } else {
//               console.warn(`Placeholder \${${cleanKey}} not found in data object.`);
//               return ''; // Return empty string for missing data
//             }
//           });
//         } catch (error) {
//           console.error("Error during template placeholder replacement:", error);
//           return `<div style='width: 54mm; height: 86mm; border: 1px solid red; display: flex; align-items: center; justify-content: center; font-size: 8pt; color: red; box-sizing: border-box; text-align: center; padding: 5px; page-break-inside: avoid;'>Template Rendering Error: ${error.message}</div>`;
//         }
//         return renderedHtml;
//     }, []); 

//     // --- File Handling ---
//      const handleFileChange = (e, side) => {
//         const file = e.target.files[0];
//         if (file) {
//             // Simple type check
//             if (!file.type.startsWith('image/')) {
//                 toast.error("Please upload a valid image file (jpg, png, gif, etc.).");
//                 e.target.value = null; // Reset input
//                 return;
//             }
//             const reader = new FileReader();
//             reader.onloadend = () => {
//                 if (side === 'front') { setFrontBackgroundImage(reader.result); setUploadedFrontImageFile(file); }
//                 else if (side === 'back') { setBackBackgroundImage(reader.result); setUploadedBackImageFile(file); }
//             };
//             reader.onerror = (error) => {
//                 console.error("FileReader error:", error);
//                 toast.error(`Error reading ${side} file.`);
//                 if (side === 'front') { setUploadedFrontImageFile(null); /* Optionally reset preview: setFrontBackgroundImage(...) */ }
//                 else { setUploadedBackImageFile(null); /* Optionally reset preview: setBackBackgroundImage(...) */ }
//             };
//             reader.readAsDataURL(file);
//         } else {
//              if (side === 'front') setUploadedFrontImageFile(null); else setUploadedBackImageFile(null);
//         }
        
//     };

//     const handleSaveClick = async () => {
//         setIsSaving(true);
//         try {
//             const formDataToSend = new FormData();
//             const utf8ToBase64 = (str) => {
//                 try {
//                      const encoder = new TextEncoder();
//                      const uint8Array = encoder.encode(str);
//                      const binaryString = String.fromCharCode(...uint8Array); // Convert bytes to binary string
//                      return btoa(binaryString);
//                 } catch (e) {
//                     console.error("Base64 encoding error:", e, "Input string:", str.substring(0, 100)+"...");
//                     toast.error("Error encoding template data. Check template content.");
//                     return null; // Indicate failure
//                 }
//             };

//             // Encode the CURRENT templates from state
//             const frontBase64 = utf8ToBase64(frontTemplate); // Use state variable
//             const backBase64 = utf8ToBase64(backTemplate);   // Use state variable

//             if (frontBase64 === null || backBase64 === null) {
//                 toast.error("Failed to encode templates. Cannot save.");
//                 setIsSaving(false);
//                 return; // Stop if encoding failed
//             }

//             const contentArray = [
//                 { data: frontBase64, name: "Front Side Template" }, // Changed name for clarity
//                 { data: backBase64, name: "Back Side Template" }   // Changed name for clarity
//             ];
//              formDataToSend.append("content", JSON.stringify(contentArray)); // Append the structured data
//             formDataToSend.append("name", idCardData?.name || "Student ID Card Design"); // Use fetched name or default
//             formDataToSend.append("type", idCardData?.type || "idCard");
//             formDataToSend.append("description", idCardData?.description || "Front/back design template");
//             formDataToSend.append("isDefault", idCardData?.isDefault?.toString() || "true"); // Send as string
//             formDataToSend.append("isPublic", idCardData?.isPublic?.toString() || "false");   // Send as string
//              let frontImageAppended = false;
//              let backImageAppended = false;
//             if (uploadedFrontImageFile instanceof File) {
                 
//                 formDataToSend.append(`content[0][image]`, uploadedFrontImageFile, uploadedFrontImageFile.name);
//                 console.log("Appending Front File:", uploadedFrontImageFile.name);
//                 frontImageAppended = true;
//             }
//             if (uploadedBackImageFile instanceof File) {
                 
//                 formDataToSend.append(`content[1][image]`, uploadedBackImageFile, uploadedBackImageFile.name);
//                 console.log("Appending Back File:", uploadedBackImageFile.name);
//                 backImageAppended = true;
//             }

//              for (let [key, value] of formDataToSend.entries()) {
//                  console.log(key, value);
//              }
//                const response = await design(formDataToSend);
//             if (response?.success) {
//                toast.success(response.message || "Designs saved successfully!");
               
//             } else {
//                toast.error(response?.message || "Failed to save designs.");
//             }
//         } catch (error) {
//             console.error("Save Error:", error);
           
//             const errorMsg = error?.response?.data?.message || error?.message || 'An unexpected error occurred while saving.';
//             toast.error(errorMsg);
//         } finally {
//             setIsSaving(false);
//         }
//     };

//     if (isLoading) {
//         return <div style={{ padding: '20px', textAlign: 'center' }}>Loading ID Card Template...</div>;
//     }

//     return (
//         <>
//          <PageHeaderWithBreadcrumb breadcrumbItems={BreadcrumbList.admission} title="ID Card Design Editor (Front & Back)"/>
//         <div 
    
//         >
           
//             <div 
        
//              className="bg-white p-2 rounded-lg shadow border border-gray-200 grid sm:grid-cols-1 md:grid-cols-2 gap-2"
//             >

               
//                 <div
//                   className="bg-white  rounded-lg shadow border border-gray-200 "
              
//                  >
//                     <h3>Front Side</h3>
//                     <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
//                         {/* Front Preview */}
//                         <div style={{ flex: 'none', minWidth: '210px', marginBottom: '10px' }}>
//                             <h4>Preview:</h4>
//                             <div
//                                 style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0, verticalAlign: 'top', width: '54mm', height: '86mm' }} // Enforce size
//                                 dangerouslySetInnerHTML={{ __html: renderTemplate(frontTemplate, frontBackgroundImage, detailedSampleStudent) }}
//                                 // ^^ CORRECTED: Use frontTemplate state variable for preview
//                             />
//                         </div>
//                         {/* Front Controls */}
//                         <div style={{ flex: 1, minWidth: '300px' }}>
//                             <div>
//                                 <label htmlFor="front-bg-upload">Upload Front BG Image:</label>
//                                 <input type="file" id="front-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'front')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
//                             </div>
//                             <div>
//                                 <label htmlFor="front-template-edit">Edit Front HTML Template:</label>
//                                 <textarea
//                                     id="front-template-edit"
//                                     value={frontTemplate} // Bind to the state variable
//                                     onChange={(e) => setFrontTemplate(e.target.value)} // Update the state variable
//                                     rows={15}
//                                     style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
//                                 />
//                             </div>
//                         </div>
//                     </div>
//                 </div>

               
//                 <div 
//                  className="bg-white p-2 rounded-lg shadow border border-gray-200 "
                
//                 >
//                      <h3>Back Side</h3>
//                      <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
//                          {/* Back Preview */}
//                          <div style={{ flex: 'none', minWidth: '210px', marginBottom: '10px' }}>
//                              <h4>Preview:</h4>
//                              <div
//                                  style={{ border: '1px dashed grey', display: 'inline-block', lineHeight: 0, verticalAlign: 'top', width: '54mm', height: '86mm' }} // Enforce size
//                                  dangerouslySetInnerHTML={{ __html: renderTemplate(backTemplate, backBackgroundImage, detailedSampleStudent) }}
//                                  // ^^ CORRECTED: Use backTemplate state variable for preview
//                              />
//                          </div>
//                          {/* Back Controls */}
//                          <div style={{ flex: 1, minWidth: '300px' }}>
//                              <div>
//                                  <label htmlFor="back-bg-upload">Upload Back BG Image:</label>
//                                  <input type="file" id="back-bg-upload" accept="image/*" onChange={(e) => handleFileChange(e, 'back')} style={{ display: 'block', margin: '5px 0 15px 0' }} />
//                              </div>
//                              <div>
//                                  <label htmlFor="back-template-edit">Edit Back HTML Template:</label>
//                                  <textarea
//                                      id="back-template-edit"
//                                      value={backTemplate} // Bind to the state variable
//                                      onChange={(e) => setBackTemplate(e.target.value)} // Update the state variable
//                                      rows={15}
//                                      style={{ width: '100%', minHeight: '300px', display: 'block', marginTop: '5px', fontFamily: 'monospace', fontSize: '0.8rem', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
//                                  />
//                              </div>
//                          </div>
//                      </div>
//                 </div>
//             </div>
//             <Button
//                     name={isSaving ? "Saving..." : "Save Both Designs"}
//                     onClick={handleSaveClick}
//                     color="#28a745"
//                     disabled={isSaving || isLoading} // Disable while saving or loading
//                     style={isSaving || isLoading ? { cursor: 'not-allowed', opacity: 0.6 } : {}}
//                 />
          
//         </div>
//         </>
//     );
// };

// export default ImageTest;
