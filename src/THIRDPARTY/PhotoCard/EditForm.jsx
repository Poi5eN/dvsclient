import React, { useState, useCallback, useEffect, useRef } from "react";
// Icons for actions: Camera (Capture/Upload), Upload, SwitchCamera (Webcam)
import { Camera, Upload, SwitchCamera } from "lucide-react";
import Cropper from "react-easy-crop";
import Webcam from "react-webcam"; // Import Webcam
import {
    FormControl,
    InputLabel,
    Select,
    TextField,
    MenuItem,
    IconButton,
    CircularProgress,
    Button as MuiButton,
    Modal as MuiModal, // Renamed MUI Modal
    Box,               // Added Box for Modal styling
} from "@mui/material";

import {
    Admission, // Kept for potential save logic, though update is primary
    thirdpartycompleteadmission,
} from "../../Network/ThirdPartyApi"; // Adjust path as needed
import { toast } from "react-toastify";
import moment from "moment";
import { useStateContext } from "../../contexts/ContextProvider"; // Adjust path as needed
import Button from "../../Dynamic/utils/Button"; // Your custom Button component
import Modal from "../../Dynamic/Modal"; // Your custom Modal component for "More Details"
import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg"; // Adjust path as needed

// --- Modal Style for Webcam ---
const webcamModalStyle = {
    position: 'absolute', top: '50%', left: '50%',
    transform: 'translate(-50%, -50%)', width: '90%',
    maxWidth: 500, bgcolor: 'background.paper', border: '1px solid #ccc',
    borderRadius: '8px', boxShadow: 24, p: 4, display: 'flex',
    flexDirection: 'column', alignItems: 'center',
};


// Helper function: Data URL/Base64 to File
const dataURLtoFile = (dataurl, filename) => {
    if (!dataurl || typeof dataurl !== 'string' || !dataurl.includes(',')) { console.error("Invalid data URL:", dataurl ? dataurl.substring(0, 50) + '...' : dataurl); return null; }
    try {
        let arr = dataurl.split(','), mimeMatch = arr[0].match(/:(.*?);/), mime = (mimeMatch && mimeMatch[1]) ? mimeMatch[1] : 'image/jpeg';
        const bstr = atob(arr[arr.length - 1]); let n = bstr.length; const u8arr = new Uint8Array(n); while (n--) { u8arr[n] = bstr.charCodeAt(n); }
        return new File([u8arr], filename, { type: mime });
    } catch (e) { console.error("Error converting data URL to File:", e); return null; }
};

// Helper function: URL/Blob to File (Used by Cropper logic)
const getFileFromUrl = async (url, fileName = "image.jpeg", mimeType = "image/jpeg", quality = 0.9) => {
    try {
        const response = await fetch(url); const blob = await response.blob();
        return new Promise((resolve, reject) => {
            const reader = new FileReader(); reader.onloadend = () => {
                const img = new Image(); img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas"); canvas.width = img.width; canvas.height = img.height;
                    const ctx = canvas.getContext("2d"); ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob((jpegBlob) => {
                        if (jpegBlob) { resolve(new File([jpegBlob], fileName, { type: mimeType })); } else { reject(new Error("Canvas to Blob failed")); }
                    }, mimeType, quality);
                }; img.onerror = (err) => reject(new Error(`Image load error: ${err}`));
            }; reader.onerror = (err) => reject(new Error(`FileReader error: ${err}`));
            reader.readAsDataURL(blob);
        });
    } catch (error) { console.error("Error fetching/converting URL to File:", error); toast.error("Failed to process image data."); return null; }
};


function EditForm(props) {
  const { studentData, buttonLabel = "Update", setIsOpen, setReRender } = props;
  const { currentColor, isLoader, setIsLoader } = useStateContext();
  const schoolID = localStorage.getItem("SchoolID");

  // Refs
  const fileInputRef = useRef(null); // For hidden file input
  const webcamRef = useRef(null);    // For Webcam component

  // State for class list and available sections
  const [getClass, setGetClass] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);

  // State for form field values
  const [values, setValues] = useState({
    admissionNumber: "", rollNo: "", fullName: "", class: "", section: "",
    gender: "", DOB: moment("1999-01-01").format("YYYY-MM-DD"), fatherName: "",
    motherName: "", guardianName: "", contact: "", address: "",
    studentImage: null, motherImage: null, fatherImage: null, guardianImage: null,
    transport: "", remarks: "", parentId: "", photoId: "",
  });

  // State for "More Details" modal
  const [moreDetailsModalOpen, setMoreDetailsModalOpen] = useState(false);

  // State for image cropping
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageSource, setCroppedImageSource] = useState(null); // Source for cropper (Data URL)
  const [currentPhotoType, setCurrentPhotoType] = useState(null); // Tracks which image is being processed

  // --- Loading States ---
  const [croppingLoading, setCroppingLoading] = useState(false); // For cropper Apply button
  const [formSubmitting, setFormSubmitting] = useState(false); // For main Update button
  const [fileReadingLoading, setFileReadingLoading] = useState(false); // For Upload button spinner

  // --- Webcam State ---
  const [showWebcamModal, setShowWebcamModal] = useState(false); // Controls webcam modal visibility
  const [facingMode, setFacingMode] = useState("user"); // 'user' (front) or 'environment' (back)


  // --- useEffect Hooks (Keep existing hooks) ---
  useEffect(() => { /* Fetch classes */
    try {
      const classesString = localStorage.getItem("classes");
      setGetClass(classesString ? JSON.parse(classesString) || [] : []);
    } catch (error) { console.error("Failed to parse classes:", error); setGetClass([]); }
  }, []);

  useEffect(() => { /* Populate sections based on class */
    if (values.class && getClass.length > 0) {
        const selectedClassObj = getClass.find((cls) => cls.className === values.class);
        if (selectedClassObj && selectedClassObj.sections) {
            const sectionsArray = Array.isArray(selectedClassObj.sections) ? selectedClassObj.sections : String(selectedClassObj.sections).split(/\s*,\s*/).filter(Boolean);
            setAvailableSections(sectionsArray);
        } else { setAvailableSections([]); }
    } else { setAvailableSections([]); }
  }, [values.class, getClass]);

  useEffect(() => { /* Populate form fields */
    if (studentData) {
      const formattedDOB = studentData.dateOfBirth ? moment(studentData.dateOfBirth).format("YYYY-MM-DD") : moment("1999-01-01").format("YYYY-MM-DD");
      setValues({
        fullName: studentData.studentName ?? "", class: studentData.class ?? "", gender: studentData.gender ?? "",
        address: studentData.address ?? "", contact: studentData.contact ?? "", rollNo: studentData.rollNo ?? "",
        section: studentData.section ?? "", fatherName: studentData.fatherName ?? "", motherName: studentData.motherName ?? "",
        guardianName: studentData.guardianName ?? studentData.udisePlusDetails?.guardian_name ?? "",
        studentImage: studentData.studentImage?.url ?? null, fatherImage: studentData.fatherImage?.url ?? null,
        motherImage: studentData.motherImage?.url ?? null, guardianImage: studentData.guardianImage?.url ?? null,
        DOB: formattedDOB, parentId: studentData.parentId ?? "", photoId: studentData.photoId ?? "",
        transport: studentData.transport ?? "", remarks: studentData.remarks ?? "", admissionNumber: studentData.admissionNumber ?? "",
      
      });
    }
  }, [studentData]);

  // --- Event Handlers ---
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleClassChange = useCallback((e) => {
    const selectedClassName = e.target.value;
    setValues(prev => ({ ...prev, class: selectedClassName, section: "", })); // Reset section
  }, []);

  const handleSectionChange = useCallback((e) => {
    setValues(prev => ({ ...prev, section: e.target.value }));
  }, []);

  // Handle Image File Selection (Upload Button) -> Triggers Cropper
  const handleFileSelect = useCallback((event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { toast.error("Invalid file type."); event.target.value = ''; return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("File size exceeds 5MB."); event.target.value = ''; return; }

    const photoType = currentPhotoType; // Use the type set by triggerFileInput
    if (!photoType) { console.error("currentPhotoType not set before file selection!"); return; }

    setFileReadingLoading(true);
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
        const result = loadEvent.target?.result;
        if (typeof result === 'string') { setCroppedImageSource(result); }
        else { toast.error("Could not read file."); }
        setFileReadingLoading(false);
    };
    reader.onerror = () => { toast.error("Error reading file."); setFileReadingLoading(false); };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset file input
  }, [currentPhotoType]); // Depends on currentPhotoType

  // Trigger hidden file input
  const triggerFileInput = useCallback((photoType) => {
      setCurrentPhotoType(photoType); // Set target image type
      if (fileInputRef.current) { fileInputRef.current.click(); }
  }, []);

  // --- Webcam Handlers ---
  const openWebcam = useCallback((photoType) => {
      setCurrentPhotoType(photoType); // Set target image type
      setShowWebcamModal(true); // Show the modal
      setCroppedImageSource(null); // Hide cropper
      setFileReadingLoading(false); // Turn off file loader
  }, []);

  const closeWebcam = useCallback(() => { setShowWebcamModal(false); }, []);

  const capturePhoto = useCallback(() => {
      if (!webcamRef.current) { toast.error("Webcam not ready."); return; }
      const imageSrc = webcamRef.current.getScreenshot({ type: 'image/png' });
      if (imageSrc) { setShowWebcamModal(false); setCroppedImageSource(imageSrc); }
      else { toast.error("Could not capture photo."); closeWebcam(); }
  }, [webcamRef, closeWebcam]);

  const handleSwitchCamera = useCallback(() => { setFacingMode(prev => (prev === "user" ? "environment" : "user")); }, []);


  // --- Cropper Callbacks ---
  const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsValue) => { setCroppedAreaPixels(croppedAreaPixelsValue); }, []);

  const cancelCrop = useCallback(() => {
    setCroppedImageSource(null); setCroppedAreaPixels(null); setCurrentPhotoType(null);
    setCrop({ x: 0, y: 0 }); setZoom(1); setCroppingLoading(false); setFileReadingLoading(false);
  }, []);

  // Apply the cropped image
  const applyCroppedImage = async () => {
    if (!croppedImageSource || !croppedAreaPixels || !currentPhotoType) { toast.warn("Cropping data is incomplete."); cancelCrop(); return; }
    setCroppingLoading(true);
    try {
      const croppedImageUrl = await getCroppedImg(croppedImageSource, croppedAreaPixels);
      if (!croppedImageUrl) throw new Error("Cropping failed.");
      const imageFile = await getFileFromUrl(croppedImageUrl, `${currentPhotoType}_${Date.now()}.jpeg`);
      if (!imageFile) throw new Error("Image conversion failed.");
      setValues((prev) => ({ ...prev, [currentPhotoType]: imageFile })); // Update main state
      cancelCrop(); // Reset cropper
    } catch (error) { console.error("Error applying crop:", error); toast.error(`Error applying crop: ${error.message}`); cancelCrop(); }
    finally { setCroppingLoading(false); }
  };

  // --- Form Submission Handlers ---
  const handleSaveClick = async () => { toast.info("Save (New Admission) is likely disabled in this Edit Form."); };

  const handleUpDateClick = async () => {
    // Validation
    const requiredFields = [
       { key: "fullName", message: "Name required" }, { key: "contact", message: "Contact required" }, { key: "fatherName", message: "Father Name required" }, { key: "class", message: "Class required" } ];
    let missingFields = requiredFields.filter(f => !values?.[f.key]);
    if (missingFields.length > 0) { toast.warn(`Cannot update. Missing: ${missingFields.map(f => f.message).join(", ")}`); return; }
    const contactRegex = /^[6-9]\d{9}$/; if (!contactRegex.test(values.contact)) { toast.warn("Invalid 10-digit contact."); return; }

    setFormSubmitting(true); setIsLoader(true);
    try {
        // Prepare payload
        const studentDataForUpdate = {
            schoolId: schoolID, photoId: values.photoId, studentFullName: values.fullName || "",
            studentEmail: `${values.fullName.replace(/\s+/g, '')}${values.contact}@example.com`, parentEmail: `${values.fatherName.replace(/\s+/g, '')}${values.contact}@example.com`,
            studentDateOfBirth: values.DOB ? moment(values.DOB).format("DD-MMM-YYYY") : "", studentGender: values.gender || "",
            studentClass: values.class || "", studentSection: values.section || "", studentAddress: values.address || "",
            studentContact: values.contact || "", parentContact: values.contact || "", fatherName: values.fatherName || "",
            motherName: values.motherName || "", guardianName: values.guardianName || "", studentAdmissionNumber: values.admissionNumber || "",
            studentRollNo: values.rollNo || "", remarks: values.remarks || "", transport: values.transport || "",  parentPassword: values.contact, // Example: reset password based on contact
            studentPassword: values.contact,studentJoiningDate: moment().format("DD-MMM-YYYY") || "", 
        };
        const formDataToSend = new FormData();
        Object.entries(studentDataForUpdate).forEach(([key, value]) => { if (value !== null && value !== undefined) formDataToSend.append(key, String(value)); });
        if (values.studentImage instanceof File) formDataToSend.append("studentImage", values.studentImage);
        if (values.fatherImage instanceof File) formDataToSend.append("fatherImage", values.fatherImage);
        if (values.motherImage instanceof File) formDataToSend.append("motherImage", values.motherImage);
        if (values.guardianImage instanceof File) formDataToSend.append("guardianImage", values.guardianImage);

        // Call Update API
        const response = await thirdpartycompleteadmission(formDataToSend);
        if (response?.success) {
            toast.success("Update successful!"); if (setReRender) setReRender(prev => !prev); if (setIsOpen) setIsOpen(false);
        } else { toast.error(response?.message || "Update failed."); }
    } catch (error) {
        console.error("Error updating:", error);
        let msg = "Update error."; if (error.response) msg = `Server Error (${error.response.status}): ${error.response.data?.message || ''}`; else if (error.request) msg = "Network error."; else msg = error.message; toast.error(msg);
    } finally { setFormSubmitting(false); setIsLoader(false); }
  };

  const handleMoreDetails = () => { setMoreDetailsModalOpen(true); };

  // Combine loading states
  const isProcessing = croppingLoading || formSubmitting || isLoader || fileReadingLoading;

  // --- Render Logic ---
  return (
    <>
       {/* --- Webcam Modal --- */}
       <MuiModal open={showWebcamModal} onClose={isProcessing ? undefined : closeWebcam} aria-labelledby="webcam-modal-title" >
           <Box sx={webcamModalStyle}>
               <h2 id="webcam-modal-title" className="text-lg font-semibold mb-4">Capture Photo</h2>
               {showWebcamModal && (
                   <div className="w-full relative mb-4 border border-gray-300 rounded overflow-hidden bg-black">
                       <Webcam audio={false} ref={webcamRef} screenshotFormat="image/png" width="100%" height="auto" videoConstraints={{ facingMode: facingMode }} className="block" mirrored={facingMode === 'user'} onUserMediaError={(err) => { console.error("Webcam Error:", err); toast.error(`Camera Error: ${err.name}.`); closeWebcam(); }} />
                       <IconButton onClick={handleSwitchCamera} size="small" sx={{ position: 'absolute', bottom: 8, right: 8, bgcolor: 'rgba(0,0,0,0.6)', color: 'white', '&:hover': { bgcolor: 'rgba(0,0,0,0.8)' } }} aria-label="Switch camera" title="Switch Camera" disabled={isProcessing}> <SwitchCamera size={20} /> </IconButton>
                   </div>
               )}
               <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                   <MuiButton variant="contained" color="primary" onClick={capturePhoto} disabled={!showWebcamModal || isProcessing}>Capture</MuiButton>
                   <MuiButton variant="outlined" color="secondary" onClick={closeWebcam} disabled={isProcessing}>Cancel</MuiButton>
               </Box>
           </Box>
       </MuiModal>

      {/* --- Cropper UI (Conditionally Rendered) --- */}
      {croppedImageSource && (
          <div className="fixed inset-0 bg-black bg-opacity-85 flex items-center justify-center p-4 z-[99999900]">
              <div className="bg-white rounded-lg p-4 w-full max-w-md relative shadow-xl mx-2">
                  {croppingLoading && ( <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10 rounded-lg"> <CircularProgress size={30} sx={{ mb: 1 }} /> <p className="text-base font-medium text-gray-700">Processing...</p> </div> )}
                  <p className="text-center font-semibold text-lg mb-3">Crop Your Photo</p>
                  <div className="relative h-64 w-full mb-4 bg-gray-200 rounded overflow-hidden border border-gray-300"> <Cropper image={croppedImageSource} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={onCropComplete} showGrid={true} /> </div>
                  <div className="flex justify-center items-center mb-4 px-4"> <span className="mr-2 text-sm text-gray-600">Zoom:</span> <input type="range" min="1" max="3" step="0.1" value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#2fa7db]" disabled={croppingLoading} /> </div>
                  <div className="flex justify-end gap-3 mt-2"> <MuiButton variant="outlined" color="secondary" onClick={cancelCrop} disabled={croppingLoading}>Cancel</MuiButton> <MuiButton variant="contained" color="primary" onClick={applyCroppedImage} disabled={croppingLoading}> {croppingLoading ? "Applying..." : "Crop & Use"} </MuiButton> </div>
              </div>
          </div>
      )}

      {/* --- Main Edit Form --- */}
      <div className="selection:bg-[#2fa7db] selection:text-white">
        <div className="flex justify-center p-1 md:p-2">
          <div className="w-full max-w-3xl min-w-[300px]">
            <div className="bg-white mx-auto overflow-hidden rounded-lg shadow-md border border-gray-200">
              {/* Header */}
              <div className="relative bg-gradient-to-r from-blue-500 to-cyan-500 text-white p-4 rounded-t-lg flex justify-between items-center">
                <h1 className="text-lg md:text-xl font-semibold">Edit Student Details</h1>
                <Button name="More Details" color="green" onClick={handleMoreDetails}
                //  className="text-sm bg-white/20 hover:bg-white/30 px-3 py-1 rounded"
                  type="button"/>
              </div>

              {/* Form Body */}
              <div className="px-4 md:px-6 py-5 bg-white">
                {/* Student Image Preview and Action Buttons */}
                <div className="flex flex-col items-center mb-5">
                    <div className="relative w-24 h-24">
                        {values.studentImage ? ( <img src={values.studentImage instanceof File ? URL.createObjectURL(values.studentImage) : values.studentImage} alt="Student" className="w-full h-full rounded-full object-cover border-2 border-gray-300 shadow-sm" onError={(e) => { e.target.onerror = null; e.target.src = "/path/to/placeholder.png"; }}/> )
                        : ( <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center text-gray-500 border border-gray-300"> <Camera size={40} /> </div> )}
                        <div className="absolute -bottom-2 -right-1 flex items-center gap-1">
                            <IconButton size="small" onClick={() => openWebcam("studentImage")} sx={{ bgcolor: '#ee582c', color: 'white', '&:hover': { bgcolor: '#d74f20' }, boxShadow: 1, }} aria-label="Capture photo" title="Capture Student Photo" disabled={isProcessing} > <Camera size={16} /> </IconButton>
                            <IconButton size="small" onClick={() => triggerFileInput("studentImage")} sx={{ bgcolor: '#2fa7db', color: 'white', '&:hover': { bgcolor: '#248db4' }, boxShadow: 1, position: 'relative', }} aria-label="Upload photo" title="Upload Student Photo" disabled={isProcessing} > {fileReadingLoading && currentPhotoType === 'studentImage' ? <CircularProgress size={16} color="inherit" /> : <Upload size={16} />} </IconButton>
                        </div>
                    </div>
                </div>
                {/* End Student Image */}

                 {/* Hidden File Input - SHARED by all upload buttons */}
                 <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" style={{ display: 'none' }} disabled={isProcessing} />

                {/* Form Fields Grid */}
                <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    {/* Full Name */} <TextField fullWidth required variant="standard" id="fullName" name="fullName" label="Student Full Name" value={values.fullName} onChange={handleInputChange} disabled={isProcessing} InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#d74f20' }, '& .MuiInput-underline:after': { borderBottomColor: '#2fa7db' }, '& .MuiInputBase-input': { color: '#2fa7db' } }}/>
                    {/* Father Name */} <TextField fullWidth required variant="standard" id="fatherName" name="fatherName" label="Father Name" value={values.fatherName} onChange={handleInputChange} disabled={isProcessing} InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#d74f20' }, '& .MuiInput-underline:after': { borderBottomColor: '#2fa7db' }, '& .MuiInputBase-input': { color: '#2fa7db' } }}/>
                    {/* Class Select */}
                    <FormControl variant="standard" required fullWidth disabled={isProcessing} sx={{ '& .MuiInputLabel-root': { color: '#ee582c' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#d74f20' }, '& .MuiInput-underline:after': { borderBottomColor: '#2fa7db' }, '& .MuiSelect-select': { color: '#2fa7db' }, '& .MuiSelect-icon': { color: '#ee582c' } }}>
                        <InputLabel id="class-label">Class</InputLabel>
                        <Select labelId="class-label"
                                value={values.class ?? ""}
                                onChange={handleClassChange} name="class" label="Class">
                            <MenuItem value="" disabled><em>Select Class</em></MenuItem>
                            {getClass?.map((cls, index) => ( <MenuItem key={index} value={cls.className}>{cls?.className}</MenuItem> ))}
                        </Select>
                    </FormControl>
                    {/* Section Select */}
                    <FormControl variant="standard" required fullWidth disabled={isProcessing || !values.class || availableSections.length === 0} sx={{ '& .MuiInputLabel-root': { color: '#ee582c' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#d74f20' }, '& .MuiInput-underline:after': { borderBottomColor: '#2fa7db' }, '& .MuiSelect-select': { color: '#2fa7db' }, '& .MuiSelect-icon': { color: '#ee582c' }, '&.Mui-disabled': { '& .MuiInputLabel-root': { color: 'rgba(0, 0, 0, 0.38)' }, '& .MuiInput-underline:before': { borderBottomStyle: 'dotted' }, '& .MuiSelect-icon': { color: 'rgba(0, 0, 0, 0.26)' } } }}>
                        <InputLabel id="section-label">Section</InputLabel>
                        <Select labelId="section-label"
                                value={values.section ?? ""} 
                                onChange={handleSectionChange} name="section" label="Section">
                            <MenuItem value="" disabled><em>{!values.class ? 'Select Class First' : (availableSections.length > 0 ? 'Select Section' : 'No Sections')}</em></MenuItem>
                            {availableSections.map((sec, index) => ( <MenuItem key={index} value={sec}>{sec}</MenuItem> ))}
                        </Select>
                    </FormControl>
                    {/* Gender Select */}
                    <FormControl variant="standard" required fullWidth disabled={isProcessing} sx={{ '& .MuiInputLabel-root': { color: '#ee582c' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#d74f20' }, '& .MuiInput-underline:after': { borderBottomColor: '#2fa7db' }, '& .MuiSelect-select': { color: '#2fa7db' }, '& .MuiSelect-icon': { color: '#ee582c' } }}>
                        <InputLabel id="gender-label">Gender</InputLabel>
                        <Select labelId="gender-label"
                                value={values.gender ?? ""} 
                                onChange={handleInputChange} name="gender" label="Gender">
                            <MenuItem value="" disabled><em>Select Gender</em></MenuItem>
                            <MenuItem value="Male">Male</MenuItem> <MenuItem value="Female">Female</MenuItem> <MenuItem value="Other">Other</MenuItem>
                        </Select>
                    </FormControl>
                    {/* Date of Birth */} <TextField fullWidth required variant="standard" type="date" id="DOB" name="DOB" label="Date of Birth" value={values.DOB} onChange={handleInputChange} disabled={isProcessing} InputLabelProps={{ shrink: true, sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#d74f20' }, '& .MuiInput-underline:after': { borderBottomColor: '#2fa7db' }, '& .MuiInputBase-input': { color: '#2fa7db' } }}/>
                    {/* Contact Number */} <TextField fullWidth required variant="standard" type="tel" id="contact" name="contact" label="Contact No." value={values.contact} onChange={handleInputChange} disabled={isProcessing} inputProps={{ maxLength: 10, pattern: "[6-9][0-9]{9}" }} InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#d74f20' }, '& .MuiInput-underline:after': { borderBottomColor: '#2fa7db' }, '& .MuiInputBase-input': { color: '#2fa7db' } }}/>
                    {/* Roll Number */} <TextField fullWidth variant="standard" id="rollNo" name="rollNo" label="Roll Number" value={values.rollNo} onChange={handleInputChange} disabled={isProcessing} InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#d74f20' }, '& .MuiInput-underline:after': { borderBottomColor: '#2fa7db' }, '& .MuiInputBase-input': { color: '#2fa7db' } }}/>
                    {/* Address */} <TextField fullWidth variant="standard" className="md:col-span-2" id="address" name="address" label="Address" value={values.address} onChange={handleInputChange} disabled={isProcessing} InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottomColor: '#d74f20' }, '& .MuiInput-underline:after': { borderBottomColor: '#2fa7db' }, '& .MuiInputBase-input': { color: '#2fa7db' } }}/>
                </form>
              </div>

              {/* Action Button Area */}
              <div className="px-6 pb-5 pt-3 bg-gray-50 rounded-b-lg border-t border-gray-200">
                  <button className={`w-full py-2.5 rounded-md text-white transition duration-150 ease-in-out ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#5cb85c] hover:bg-[#4cae4c]'}`} onClick={handleUpDateClick} disabled={isProcessing} type="button" >
                      {formSubmitting ? "Updating..." : buttonLabel}
                  </button>
              </div>
            </div>
          </div>
        </div>
      </div>

       {/* "More Details" Modal */}
       <Modal isOpen={moreDetailsModalOpen} setIsOpen={setMoreDetailsModalOpen} title="More Details & Parent Photos">
           <div className="px-4 pb-4 pt-2 space-y-4" style={{ minWidth: "300px", maxWidth:'90vw', maxHeight: '75vh', overflowY: 'auto' }}>
               {/* Additional Fields */}
                <TextField fullWidth variant="outlined" size="small" id="motherName" name="motherName" label="Mother Name" value={values.motherName} onChange={handleInputChange} disabled={isProcessing}/>
                <TextField fullWidth variant="outlined" size="small" id="guardianName" name="guardianName" label="Guardian Name" value={values.guardianName} onChange={handleInputChange} disabled={isProcessing}/>
                <TextField fullWidth variant="outlined" size="small" id="transport" name="transport" label="Transport (Optional)" value={values.transport} onChange={handleInputChange} disabled={isProcessing}/>
                <TextField fullWidth variant="outlined" size="small" multiline rows={2} id="remarks" name="remarks" label="Remarks (Optional)" value={values.remarks} onChange={handleInputChange} disabled={isProcessing}/>
                <TextField fullWidth variant="outlined" size="small" id="admissionNumber" name="admissionNumber" label="Admission Number" value={values.admissionNumber} onChange={handleInputChange} disabled={isProcessing}/>

               {/* Parent/Guardian Image Uploads - WITH NEW BUTTONS */}
               <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 justify-items-center mt-4 pt-4 border-t">
                   {/* Father Image */}
                   <div className="flex flex-col items-center text-center">
                       <label className="block text-gray-700 text-sm font-medium mb-1">Father Photo</label>
                       <div className="relative w-20 h-20"> {/* Container */}
                           {values.fatherImage ? ( <img src={values.fatherImage instanceof File ? URL.createObjectURL(values.fatherImage) : values.fatherImage} alt="Father" className="w-full h-full rounded-full object-cover border"/> )
                           : ( <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border"><span className="text-xs text-gray-500">No Image</span></div> )}
                           <div className="absolute -bottom-1 right-0 flex items-center gap-1">
                               <IconButton size="small" onClick={() => openWebcam("fatherImage")} sx={{ bgcolor: '#ee582c', color: 'white', '&:hover':{bgcolor: '#d74f20'}, boxShadow:1}} aria-label="Capture Father photo" title="Capture Father Photo" disabled={isProcessing}> <Camera size={14}/> </IconButton>
                               <IconButton size="small" onClick={() => triggerFileInput("fatherImage")} sx={{ bgcolor: '#2fa7db', color: 'white', '&:hover':{bgcolor: '#248db4'}, boxShadow:1, position:'relative'}} aria-label="Upload Father photo" title="Upload Father Photo" disabled={isProcessing}> {(fileReadingLoading && currentPhotoType === 'fatherImage') ? <CircularProgress size={14} color="inherit"/> : <Upload size={14}/>} </IconButton>
                           </div>
                       </div>
                   </div>
                   {/* Mother Image */}
                   <div className="flex flex-col items-center text-center">
                      <label className="block text-gray-700 text-sm font-medium mb-1">Mother Photo</label>
                       <div className="relative w-20 h-20"> {/* Container */}
                           {values.motherImage ? ( <img src={values.motherImage instanceof File ? URL.createObjectURL(values.motherImage) : values.motherImage} alt="Mother" className="w-full h-full rounded-full object-cover border"/> )
                           : ( <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border"><span className="text-xs text-gray-500">No Image</span></div> )}
                           <div className="absolute -bottom-1 right-0 flex items-center gap-1">
                               <IconButton size="small" onClick={() => openWebcam("motherImage")} sx={{ bgcolor: '#ee582c', color: 'white', '&:hover':{bgcolor: '#d74f20'}, boxShadow:1}} aria-label="Capture Mother photo" title="Capture Mother Photo" disabled={isProcessing}> <Camera size={14}/> </IconButton>
                               <IconButton size="small" onClick={() => triggerFileInput("motherImage")} sx={{ bgcolor: '#2fa7db', color: 'white', '&:hover':{bgcolor: '#248db4'}, boxShadow:1, position:'relative'}} aria-label="Upload Mother photo" title="Upload Mother Photo" disabled={isProcessing}> {(fileReadingLoading && currentPhotoType === 'motherImage') ? <CircularProgress size={14} color="inherit"/> : <Upload size={14}/>} </IconButton>
                           </div>
                       </div>
                   </div>
                   {/* Guardian Image */}
                    <div className="flex flex-col items-center text-center">
                       <label className="block text-gray-700 text-sm font-medium mb-1">Guardian Photo</label>
                       <div className="relative w-20 h-20"> {/* Container */}
                           {values.guardianImage ? ( <img src={values.guardianImage instanceof File ? URL.createObjectURL(values.guardianImage) : values.guardianImage} alt="Guardian" className="w-full h-full rounded-full object-cover border"/> )
                           : ( <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border"><span className="text-xs text-gray-500">No Image</span></div> )}
                           <div className="absolute -bottom-1 right-0 flex items-center gap-1">
                               <IconButton size="small" onClick={() => openWebcam("guardianImage")} sx={{ bgcolor: '#ee582c', color: 'white', '&:hover':{bgcolor: '#d74f20'}, boxShadow:1}} aria-label="Capture Guardian photo" title="Capture Guardian Photo" disabled={isProcessing}> <Camera size={14}/> </IconButton>
                               <IconButton size="small" onClick={() => triggerFileInput("guardianImage")} sx={{ bgcolor: '#2fa7db', color: 'white', '&:hover':{bgcolor: '#248db4'}, boxShadow:1, position:'relative'}} aria-label="Upload Guardian photo" title="Upload Guardian Photo" disabled={isProcessing}> {(fileReadingLoading && currentPhotoType === 'guardianImage') ? <CircularProgress size={14} color="inherit"/> : <Upload size={14}/>} </IconButton>
                           </div>
                       </div>
                   </div>
               </div>

                {/* Modal Close Button */}
                <div className="flex justify-end pt-3">
                   <button type="button" onClick={() => setMoreDetailsModalOpen(false)} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm">Close</button>
                </div>
           </div>
       </Modal>
    </>
  );
}

export default EditForm;






// import React, { useState, useCallback, useEffect } from "react";
// import { Camera } from "lucide-react";
// import Cropper from "react-easy-crop";


// import { FormControl, InputLabel, Select, TextField,MenuItem  } from "@mui/material";

// // import {  MenuItem } from "@mui/material";
// // import { TextField, MenuItem } from "@mui/material";
// import {
//   Admission,
//   initialstudentphoto,
//   thirdpartycompleteadmission,
//   thirdpartymystudents,
// } from "../../Network/ThirdPartyApi";
// import { toast } from "react-toastify";
// import moment from "moment";
// import { useStateContext } from "../../contexts/ContextProvider";
// import Button from "../../Dynamic/utils/Button";
// import Modal from "../../Dynamic/Modal";
// import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg";


// function EditForm(props) {
//   const { studentData, buttonLabel, setIsOpen, setReRender } = props;
//   console.log("studentData",studentData)
//   const { currentColor, isLoader, setIsLoader } = useStateContext();
//   const [getClass, setGetClass] = useState([]);
// const [availableSections, setAvailableSections] = useState([]);
//   const [values, setValues] = useState({
//     admissionNumber: "",
//     rollNo: "",
//     fullName: "",
//     class: "",
//     section: "",
//     gender: "",
//     DOB: moment("1999-01-01").format("YYYY-MM-DD"),
//     // DOB: moment("01-01-2010").format("DD-MMM-YYYY"),
//     fatherName: "",
//     motherName: "",
//     guardianName: "",
//     contact: "",
//     address: "",
//     studentImage: null,
//     motherImage: null,
//     fatherImage: null,
//     guardianImage: null,
//     transport: "",
//     remarks: "",
//     parentId:""
//   });
 
//   useEffect(() => {
//     const classes = JSON.parse(localStorage.getItem("classes"));
//     if (classes) {
//       setGetClass(classes);
//     }
//   }, []);

//   useEffect(() => {
//       if (studentData) {
  
//         const selectedClassObj = getClass.find((cls) => cls.className === studentData.class);
//         if (selectedClassObj && selectedClassObj.sections) {
//           setAvailableSections(selectedClassObj.sections.split(/\s*,\s*/));
//         }
//       }
//     }, [studentData, getClass]);
  
//   useEffect(() => {
//     if (studentData) {
//       setValues({
//         fullName: studentData.studentName || "",   // Ensure class is set
//         class: studentData.class || "",   // Ensure class is set
//         gender: studentData.gender || "",
//         address: studentData.address || "",
//         contact: studentData.contact || "",
//         rollNo: studentData.rollNo || "",
//         section: studentData.section || "",
//         fatherName: studentData?.fatherName || "",
//         motherName: studentData?.motherName || "",
//         guardianName: studentData?.udisePlusDetails?.guardian_name || "",
//         studentImage: studentData?.studentImage?.url || null,
//         fatherImage: studentData?.fatherImage?.url || null,
//         motherImage: studentData?.motherImage?.url || null,
//         guardianImage: studentData?.guardianImage?.url || null,
//         DOB: moment(studentData?.dateOfBirth).format("YYYY-MM-DD"),
//         parentId:studentData?.parentId,
//         photoId:studentData?.photoId
//       });
//     }
//   }, [studentData]);
//   useEffect(() => {
//     const classes = JSON.parse(localStorage.getItem("classes"));
//     if (classes) {
//       setGetClass(classes);
//     }
//   }, []);
  
//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
  
//     setValues((prevData) => ({
//       ...prevData,
//       class: selectedClassName,
//       section: "", // Reset section when class changes
//     }));
//     const selectedClassObj = getClass.find((cls) => cls.className === selectedClassName);
//     if (selectedClassObj && selectedClassObj.sections) {
//       setAvailableSections(
//         Array.isArray(selectedClassObj.sections) ? selectedClassObj.sections : selectedClassObj.sections.split(/\s*,\s*/)
//       );
//     } else {
//       setAvailableSections([]);
//     }
//   };
  
//   // 🟢 Section Change Handle Karna
//   const handleSectionChange = (e) => {
//     setValues((prevData) => ({
//       ...prevData,
//       section: e.target.value,
//     }));
//   };
  
  
//   const schoolID = localStorage.getItem("SchoolID");

//   const handleImageChange = (e, photoType) => {
//     const file = e.target.files[0];
//     if (!file) return;
  
//     // File size check (5 MB limit)
//     if (file.size > 5 * 1024 * 1024) {
//       alert("File size is too large! (Max 5 MB)");
//       return;
//     }
  
//     setCurrentPhotoType(photoType);
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       // setCroppedImageSource(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };
  


  

//   const handleSaveClick = async () => {
//     // alert("submit")
//     const requiredFields = [
//       { key: "fullName", message: "Please Enter Name" },
//       { key: "contact", message: "Please Enter Contact" },
//       { key: "fatherName", message: "Please Enter Father Name" },
//     ];

//     let missingFields = [];
//     for (const field of requiredFields) {
//       if (!values?.[field.key]) {
//         missingFields.push(field.message);
//       }
//     }

//     if (missingFields.length > 0) {
//       toast.warn(missingFields.join(", "));
//       return;
//     }

 
//     const contactRegex =
//       /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
//     if (!contactRegex.test(values.contact)) {
//       toast.warn("Please enter a valid contact number.");
//       return;
//     }

    
//   const isValidEmail = (email) => {
//     const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
//     return emailRegex.test(email);
//   };

//   const generateEmail = (name, contact) => {
//     let emailPrefix = name.toLowerCase();
//     emailPrefix = emailPrefix.replace(/[^a-z0-9]/g, "");
//     const email = `${emailPrefix}${contact}@gmail.com`;
//     return email;
//   };
//     // Use the generateEmail function
//     const studentEmail = generateEmail(values.fullName, values.contact);
//     const parentEmail = generateEmail(values.fatherName, values.contact);

//     if (!isValidEmail(studentEmail)) {
//       toast.warn("Please enter a valid student email format.");
//       return;
//     }
//     if (!isValidEmail(parentEmail)) {
//       toast.warn("Please enter a valid parent email format.");
//       return;
//     }

//     setLoading(true);
//     setIsLoader(true);

//     try {
//       const studentData = {
//         schoolId: schoolID,
//         studentFullName: values?.fullName || "",
//         studentEmail: studentEmail, // Use generated email
//         parentEmail: parentEmail, // Use generated email
//         studentPassword: values?.contact || "",
//         parentPassword: values?.contact || "",
//         studentDateOfBirth: moment(values?.DOB).format("DD-MMM-YYYY") || "",
//         studentJoiningDate: moment(new Date()).format("DD-MMM-YYYY") || "",
//         studentGender: values?.gender || "",
//         studentClass: values?.class || "",
//         studentSection: values?.section || "",
//         studentAddress: values?.address || "",
//         studentContact: values?.contact || "",
//         parentContact: values?.contact || "",
//         fatherName: values?.fatherName || "",
//         motherName: values?.motherName || "",
//         studentAdmissionNumber: values?.admissionNumber || "",
//         studentRollNo: values?.rollNo || "",
//         remarks: values?.remarks || "",
//         transport: values?.transport || "",
//          guardianName: values?.guardianName || "",
//       };

//       const formDataToSend = new FormData();

//       Object.entries(studentData).forEach(([key, value]) => {
//         formDataToSend.append(key, String(value));
//       });

//       if (values.studentImage) {
//         formDataToSend.append("studentImage", values.studentImage);
//       }
//       if (values.fatherImage) {
//         formDataToSend.append("fatherImage", values.fatherImage);
//       }
//       if (values.motherImage) {
//         formDataToSend.append("motherImage", values.motherImage);
//       }
//       if (values.guardianImage) {
//         formDataToSend.append("guardianImage", values.guardianImage);
//       }

//       const response = await Admission(formDataToSend);

//       if (response.success) {
//         setIsLoader(false);
//         setValues({
//           admissionNumber: "",
//           fullName: "",
//           class: "",
//           section: "",
//           gender: "",
//           DOB: moment("01-01-2010").format("DD-MMM-YYYY"),
//           fatherName: "",
//           motherName: "",
//           guardianName: "",
//           contact: "",
//           address: "",
//           studentImage: null,
//           motherImage: null,
//           fatherImage: null,
//           guardianImage: null,
//           remarks: "",
//         });
//         toast.success("Admission successfully!");
//         setReRender(true);
//         setIsOpen(false);
//       } else {
//         toast.error(response?.message)
//         setIsLoader(false);
//         toast.error(response?.data?.message);
//       }
//     } catch (error) {
//       setIsLoader(false);
//       console.error("Error during admission:", error);
//       if (error.response && error.response.status === 400) {
//         toast.error("Invalid data. Please check your inputs.");
//       } else if (error.response && error.response.status === 500) {
//         toast.error("Server error. Please try again later.");
//       } else {
//         console.log("An unexpected error occurred.");
//       }
//     } finally {
//       setLoading(false);
//       setIsLoader(false);
//     }
//   };

//   const handleUpDateClick = async () => {
//     // alert("update")
//     setIsLoader(true);
//     setReRender(true);
//     setLoading(true);
//     const studentId = studentData?.studentId;
// // console.log("values?.DOB",values?.DOB)
//     try {
//       const studentDataForUpdate = {
//         schoolId: schoolID,
//         photoId:values?.photoId, 
//         // parentId: values?.parentId,
//         studentFullName: values?.fullName || "",
//         studentEmail: `${values?.fullName}${values?.contact}@gmail.com` || "",
//         parentEmail: `${values?.fatherName}${values?.contact}@gmail.com` || "",
//         parentPassword: values?.contact,
//         studentPassword:values?.contact,
//         studentDateOfBirth: values?.DOB?moment(values?.DOB).format("DD-MMM-YYYY"): "",
//         studentJoiningDate: moment(new Date()).format("DD-MMM-YYYY") || "",
//         studentGender: values?.gender || "",
//         // studentClass: values?.class || "",
//         // studentSection: values?.section || "",
//         studentAddress: values?.address || "",
//         studentContact: values?.contact || "",
//         parentContact: values?.contact || "", // For parent compatibility
//         fatherName: values?.fatherName || "",
//         motherName: values?.motherName || "",
//         guardianName: values?.guardianName || "",
//         studentAdmissionNumber: values?.admissionNumber || "",
//         // remarks: values?.remarks || "", // Assuming this maps to udisePlusDetails or another field if needed
//       };

//       const formDataToSend = new FormData();

//       Object.entries(studentDataForUpdate).forEach(([key, value]) => {
//         formDataToSend.append(key, String(value));
//       });

//       // Conditionally append image files to FormData
//       if (values.studentImage instanceof File) {
//         formDataToSend.append("studentImage", values.studentImage);
//       }
//       if (values.fatherImage instanceof File) {
//         formDataToSend.append("fatherImage", values.fatherImage);
//       }
//       if (values.motherImage instanceof File) {
//         formDataToSend.append("motherImage", values.motherImage);
//       }
//       if (values.guardianImage instanceof File) {
//         formDataToSend.append("guardianImage", values.guardianImage);
//       }

//       // Update API call to match editAdmission endpoint
     
//       const response = await thirdpartycompleteadmission(formDataToSend);
//       // const response = await fetch(
//       //   `https://api.digitalvidyasaarthi.in/api/v1/thirdparty/admissions/${studentId}`,
//       //   {
//       //     method: "PUT",
//       //     headers: {
//       //       Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth setup
//       //     },
//       //     body: formDataToSend,
//       //   }
//       // );

//       // const result = await response.json();

//       if (response.success) {
//         setIsLoader(false);
//         setReRender(false);
//         setIsOpen(false);
//         toast.success("Update successfully!");
//         setValues({
//           admissionNumber: "",
//           fullName: "",
//           class: "",
//           section: "",
//           gender: "",
//           DOB: moment("01-01-2010").format("DD-MM-YYYY"),
//           fatherName: "",
//           motherName: "",
//           guardianName: "",
//           contact: "",
//           address: "",
//           studentImage: null,
//           motherImage: null,
//           fatherImage: null,
//           guardianImage: null,
//           remarks: "",
//         });
//       } else {
//         setIsLoader(false);
//         toast.error(response.message || "Failed to update admission");
//       }
//     } catch (error) {
//       console.error("Error updating student:", error);
//       // toast.error("An error occurred during update.");
//     } finally {
//       setLoading(false);
//       setIsLoader(false);
//     }
//   };
//   const [modalOpen, setModalOpen] = useState(false);
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//   const [croppedImageSource, setCroppedImageSource] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [currentPhotoType, setCurrentPhotoType] = useState(null);
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setValues({ ...values, [name]: value });

//   };
 
//   const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//     setCroppedAreaPixels(croppedAreaPixels);
//   }, []);

//   const cancelCrop = useCallback(() => {
//     setCroppedImageSource(null);
//   }, [setCroppedImageSource]);

//   const showCroppedImage = async () => {
//     try {
//       const croppedImageUrl = await getCroppedImg(
//         croppedImageSource,
//         croppedAreaPixels
//       );
//       setCroppedImageSource(null);
  
//       // Function to convert image URL to JPEG File
//       const getFileFromUrl = async (url, fileName = "image.jpeg") => {
//         const data = await fetch(url);
//         const blob = await data.blob();
  
//         // Convert blob to JPEG format using canvas
//         return new Promise((resolve) => {
//           const img = new Image();
//           img.src = URL.createObjectURL(blob);
//           img.onload = () => {
//             const canvas = document.createElement("canvas");
//             canvas.width = img.width;
//             canvas.height = img.height;
//             const ctx = canvas.getContext("2d");
//             ctx.drawImage(img, 0, 0);
  
//             // Convert canvas to Blob in JPEG format
//             canvas.toBlob((jpegBlob) => {
//               const file = new File([jpegBlob], fileName, {
//                 type: "image/jpeg",
//               });
//               resolve(file);
//             }, "image/jpeg", 0.9); // 0.9 = Image Quality
//           };
//         });
//       };
  
//       // Convert cropped image to JPEG File
//       const imageFile = await getFileFromUrl(croppedImageUrl, `${currentPhotoType}.jpeg`);
  
//       // Update state with image file
//       switch (currentPhotoType) {
//         case "fatherImage":
//           setValues((prev) => ({ ...prev, fatherImage: imageFile }));
//           break;
//         case "motherImage":
//           setValues((prev) => ({ ...prev, motherImage: imageFile }));
//           break;
//         case "guardianImage":
//           setValues((prev) => ({ ...prev, guardianImage: imageFile }));
//           break;
//         default:
//           setValues((prev) => ({ ...prev, studentImage: imageFile }));
//           break;
//       }
  
//       setCurrentPhotoType(null);
//     } catch (error) {
//       console.error("Error cropping image:", error);
//     }
//   };
  
//   const handleMoreDetails = () => {
//     setModalOpen(true);
//   };

//   if (croppedImageSource) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
  
//       >
//         <div className="bg-white rounded-lg p-4 w-full max-[90vw]"
        
//         style={{
//           width:"90vw"
//         }}
//         >
//           <div className="relative h-64 w-full"
//           >
//             <Cropper
//               image={croppedImageSource}
//               crop={crop}
//               zoom={zoom}
//               aspect={1}
//               onCropChange={setCrop}
//               onZoomChange={setZoom}
//               onCropComplete={onCropComplete}
//             />
//           </div>
//           <div className="flex justify-end gap-2 mt-4">
//             <button
//               onClick={() => setCroppedImageSource(null)}
//               className="px-4 py-2 bg-gray-200 rounded-md"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={showCroppedImage}
//               className="px-4 py-2 bg-blue-500 text-white rounded-md"
//             >
//               Crop
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }
// // console.log("values",values)
//   return (
//     <>
//       <div class="selection:bg-[#2fa7db] selection:text-white">
//         <div class=" flex justify-center "
//             style={{minWidth:"90vw"}}
//             // style={{minWidth:"350px"}}
//         >
//           <div class="flex-1 m-2">
//             <div class="w-full bg-white  mx-auto overflow-hidden ">
//               <div
//                 class="relative h-[130px] px-5 pt-1
//                rounded-bl-4xl"
//               >
//                 <h1 class="absolute top-0  text-xl font-semibold text-white pl-2">
//                   Student Details
//                 </h1>
//                 <div className="flex justify-end  items-center mb-6">
//                   {/* <Button
//                     name=" More Details"
//                     color="#59b3da"
//                     onClick={() => handleMoreDetails()}
//                     className="text-[#ee582c] m-2"
//                   /> */}
//                 </div>
//                 {/* {console.log("values",values)} */}
//                 <div className="flex ml-2 mb-6">
//                   <div className="absolute top-5">
//                     {values?.studentImage ? (
//                       <img
//                         src={
//                           values.studentImage instanceof File
//                             ? URL.createObjectURL(values.studentImage)
//                             : values.studentImage
//                             // : values.studentImage?.url
//                         }
//                         alt="studentImage"
//                         className="w-20 h-20 rounded-full object-cover"
//                       />
//                     ) : (
//                       <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
//                         <span className="text-[#ee582c]">NO IMAGE</span>
//                       </div>
//                     )}
//                     {/* <label className="absolute bottom-0 right-0 bg-[#ee582c] text-white p-2 rounded-full cursor-pointer">
//                       <Camera size={18} />
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept="image/*"
//                         capture="environment" // Opens the back camera; use "user" for the front camera
//                         onChange={(e) => handleImageChange(e, "studentImage")}
//                       />
//                     </label> */}
//                   </div>
//                 </div>
//               </div>
//               <div class="px-6 pb-8 bg-white rounded-tr-4xl ">
//                 <form class="" action="" method="POST">
//                   <div class="relative mt-4">
//                     <input
//                       type="text"
//                       name="fullName"
//                       placeholder="Student Name"
//                       value={values?.fullName}
//                       onChange={handleInputChange}
//                       id="fullName"
//                       className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
//                     />
//                     <label
//                       for="fullName"
//                       class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
//                     >
//                       Student Name
//                     </label>
//                   </div>
//                   <div class="relative mt-4">
//                     <input
//                       type="text"
//                       name="fatherName"
//                       placeholder="Father Name"
//                       value={values?.fatherName}
//                       onChange={handleInputChange}
//                       id="fatherName"
//                       className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
//                     />
//                     <label
//                       for="fatherName"
//                       class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
//                     >
//                       Father Name
//                     </label>
//                   </div>
               
//                   {/* <div className="flex justify-center items-center gap-2">
//                       <FormControl
//                         variant="standard"
//                         sx={{
//                           mt: 1,
//                           width: "100%",
//                           "& .MuiInputLabel-root": { color: "#ee582c" },
//                           "& .MuiSelect-root": { color: "#2fa7db" },
//                           "& .MuiSelect-icon": { color: "#ee582c" },
//                           "&:before": { borderBottom: "2px solid #ee582c" },
//                           "&:after": { borderBottom: "2px solid #ee582c" },
//                         }}
//                       >
//                         <InputLabel id="demo-simple-select-standard-label">
//                           Class
//                         </InputLabel>
//                         <Select
//                          value={values.class} 
//                           labelId="demo-simple-select-standard-label"
//                           id="demo-simple-select-standard"
//                           // value={selectedClass}
//                           onChange={handleClassChange}
//                           label="Class"
//                           name="class"
//                           sx={{
//                             color: "#2fa7db",
//                             "& .MuiSelect-icon": { color: "#ee582c" },
//                             "&:before": { borderBottom: "2px solid #ee582c" },
//                             "&:after": { borderBottom: "2px solid #ee582c" },
//                             "&:hover:not(.Mui-disabled, .Mui-error):before": {
//                               borderBottom: "2px solid #ee582c",
//                             },
//                           }}
//                         >
//                            <MenuItem value="" disabled>Select a Class</MenuItem>
//                           {getClass?.map((cls, index) => (
//                             <MenuItem key={index} value={cls.className}>
//                               {cls?.className}
//                             </MenuItem>
//                           ))}
//                         </Select>
//                       </FormControl>
     

//                     <FormControl
//                       variant="standard"
//                       sx={{
//                         mt: 1,
//                         width: "100%",
//                         "& .MuiInputLabel-root": { color: "#ee582c" },
//                         "& .MuiSelect-root": { color: "#ee582c" },
//                         "& .MuiSelect-icon": { color: "#ee582c" },
//                         "&:before": { borderBottom: "2px solid #ee582c" },
//                         "&:after": { borderBottom: "2px solid #ee582c" },
//                       }}
//                     >
//                       <InputLabel id="demo-simple-select-standard-label">
//                         Section 
//                       </InputLabel>
//                       <Select
//                         value={values.section} // Ensure values.section is updated
//                         onChange={handleSectionChange}
//                         labelId="demo-simple-select-standard-label"
//                         id="demo-simple-select-standard"
//                         // value={studentData?.section  || selectedSection}
//                         // onChange={handleSectionChange}
//                            label="Section"
//       name="section"
//                         sx={{
//                           color: "#2fa7db",
//                           "& .MuiSelect-icon": { color: "#ee582c" },
//                           "&:before": { borderBottom: "2px solid #ee582c" },
//                           "&:after": { borderBottom: "2px solid #ee582c" },
//                           "&:hover:not(.Mui-disabled, .Mui-error):before": {
//                             borderBottom: "2px solid #ee582c",
//                           },
//                         }}
//                       >
//                           <MenuItem value="" disabled>Select a Section</MenuItem>
//       {availableSections.length > 0 ? (
//         availableSections.map((sec, index) => (
//           <MenuItem key={index} value={sec}>{sec}</MenuItem>
//         ))
//       ) : (
//         <MenuItem disabled>No Sections Available</MenuItem>
//       )}
                        
//                       </Select>
//                     </FormControl>
//                   </div> */}
//                   <div className="flex justify-center items-center gap-2">
//                     <FormControl
//                       variant="standard"
//                       sx={{
//                         mt: 1,
//                         width: "100%",
//                         "& .MuiInputLabel-root": { color: "#ee582c" },
//                         "& .MuiSelect-root": { color: "#ee582c" },
//                         "& .MuiSelect-icon": { color: "#ee582c" },
//                         "&:before": { borderBottom: "2px solid #ee582c" },
//                         "&:after": { borderBottom: "2px solid #ee582c" },
//                       }}
//                     >
//                       <InputLabel id="demo-simple-select-standard-label">
//                         Gender
//                       </InputLabel>
//                       <Select
//                         labelId="demo-simple-select-standard-label"
//                         id="demo-simple-select-standard"
//                         value={values?.gender}
//                         onChange={handleInputChange}
//                         label="Gender"
//                         name="gender"
//                         sx={{
//                           color: "#2fa7db",
//                           "& .MuiSelect-icon": { color: "#ee582c" },
//                           "&:before": { borderBottom: "2px solid #ee582c" },
//                           "&:after": { borderBottom: "2px solid #ee582c" },
//                           "&:hover:not(.Mui-disabled, .Mui-error):before": {
//                             borderBottom: "2px solid #ee582c",
//                           },
//                         }}
//                       >
//                         <MenuItem value="Male">Male</MenuItem>
//                         <MenuItem value="Female">Female</MenuItem>
//                         <MenuItem value="Other">Other</MenuItem>
//                       </Select>
//                     </FormControl>
                    
//                     <div class="relative mt-4 w-full">
//                       <input
//                         type="date"
//                         name="DOB"
//                         placeholder="Enter DOB (YYYY-MM-DD)"
//                         // value={values.dateOfBirth}
//                         value={values.DOB ? values.DOB.split('T')[0] : ''}
//                         // value={values.DOB ? values.DOB.split('T')[0] : ''}
//                         onChange={handleInputChange}
//                         id="DOB"
//                         className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-gray-400 focus:outline-none focus:border-rose-600"
//                       />
//                       <label
//                         for="DOB"
//                         class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
//                       >
//                         Enter DOB
//                       </label>
//                     </div>
//                   </div>

//                   <div className="flex justify-center items-center gap-2 w-full mt-4">
//                     {/* <div class="relative w-full">
//                       <input
//                         maxLength="3"
//                         type="text"
//                         name="rollNo"
//                         placeholder="Roll Number"
//                         value={values?.rollNo}
//                         onChange={handleInputChange}
//                         id="rollNo"
//                         className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
//                       />
//                       <label
//                         for="rollNo"
//                         class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
//                       >
//                         Roll Number
//                       </label>
//                     </div> */}
//                     <div class="relative  w-full">
//                       <input
//                         type="text"
//                         maxlength="10"
//                         name="contact"
//                         placeholder="Contact No."
//                         value={values?.contact}
//                         onChange={handleInputChange}
//                         id="contact"
//                         pattern="[0-9]*"
//                         className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
//                       />
//                       <label
//                         for="contact"
//                         class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
//                       >
//                         Contact No.
//                       </label>
//                     </div>
//                   </div>
//                   <div class="relative mt-4">
//                     <input
//                       type="text"
//                       name="address"
//                       placeholder="Enter Address"
//                       value={values?.address}
//                       onChange={handleInputChange}
//                       id="address"
//                       className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
//                     />
//                     <label
//                       for="address"
//                       class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
//                     >
//                       Address
//                     </label>
//                   </div>
//                 </form>
//               </div>
//               <div className="px-4  shadow-xl bg-white ">
//                 {buttonLabel === "Save" ? (
//                   <button
//                     className="w-full bg-[#2fa7db] text-white  rounded-md mb-5 py-2 "
//                     onClick={handleSaveClick}
//                     disabled={loading}
//                   >
//                     {loading ? "Saving..." : buttonLabel}
//                   </button>
//                 ) : (
//                   <button
//                     className="w-full bg-[#2fa7db] text-white  rounded-md mb-14 py-2 "
//                     onClick={handleUpDateClick}
//                     disabled={loading}
//                   >
//                     {loading ? "Updating..." : buttonLabel}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//       <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`More Details`}>
//         {croppedImageSource ? (
//           <div className="relative w-full aspect-square"
//           style={{width:"90vw"}}
//           >
//             <Cropper
//               image={croppedImageSource}
//               crop={crop}
//               zoom={zoom}
//               aspect={1}
//               onCropChange={setCrop}
//               onZoomChange={setZoom}
//               onCropComplete={onCropComplete}
//             />
//             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
//               <button
//                 onClick={cancelCrop}
//                 className="bg-red-500 text-white py-2 px-4 rounded"
//               >
//                 Cancel Crop
//               </button>
//               <button
//                 onClick={showCroppedImage}
//                 className="bg-blue-500 text-white py-2 px-4 rounded"
//               >
//                 Crop Image
//               </button>
//             </div>
//           </div>
//         ) : (
//           <div className="px-4 pb-2 min-w-[330px]">
//             <div className="mb-2">
//               <label
//                 className="block text-gray-700 text-sm font-bold mb-2"
//                 htmlFor="transport"
//               >
//                 Guardian Name:
//               </label>
//               <input
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 id="guardianName"
//                 name="guardianName"
//                 type="text"
//                 placeholder="Guardian Name"
//                 onChange={handleInputChange}
//                 value={values?.guardianName}
//               />
//             </div>
//             <div className="mb-2">
//               <label
//                 className="block text-gray-700 text-sm font-bold mb-2"
//                 htmlFor="transport"
//               >
//                 Mother Name:
//               </label>
//               <input
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 id="motherName"
//                 name="motherName"
//                 type="text"
//                 placeholder="Guardian Name"
//                 onChange={handleInputChange}
//                 value={values?.motherName}
//               />
//             </div>
//             <div className="mb-2">
//               <label
//                 className="block text-gray-700 text-sm font-bold mb-2"
//                 htmlFor="transport"
//               >
//                 Transport:
//               </label>
//               <input
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 id="transport"
//                 name="transport"
//                 type="text"
//                 placeholder="Transport"
//                 value={values?.transport}
//                 onChange={handleInputChange}
//               />
//             </div>
//             {/* <div className="mb-2">
//               <label
//                 className="block text-gray-700 text-sm font-bold mb-2"
//                 htmlFor="transport"
//               >
//                 Remarks:
//               </label>

//               <textarea
//                 className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                 id="remarks"
//                 name="remarks"
//                 type="text"
//                 placeholder="Remarks"
//                 value={values?.remarks}
//                 onChange={handleInputChange}
//               />
//             </div> */}

//             <div className="flex justify-center mb-6">
//               <div className="relative">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="transport"
//                 >
//                   Father Photo:
//                 </label>
//                 {values?.fatherImage ? (
//                   <img
//                     src={
//                       values.fatherImage instanceof File
//                       ? URL.createObjectURL(values.fatherImage)
//                       :  values.fatherImage
//                       // :  values.fatherImage?.url
                     
//                     }
//                     alt="mother Image"
//                     className="w-24 h-24 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
//                     <span className="text-[#ee582c]">NO IMAGE</span>
//                   </div>
//                 )}
//                 <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
//                   <Camera size={16} />
//                   <input
//                     type="file"
//                     capture="environment" // Opens the back camera; use "user" for the front camera
//                     className="hidden"
//                     accept="image/*"
//                     name="fatherImage"
//                     onChange={(e) => handleImageChange(e, "fatherImage")}
//                   />
//                 </label>
//               </div>
//             </div>
//             <div className="flex justify-center mb-6">
//               <div className="relative">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="transport"
//                 >
//                   Mother Photo:
//                 </label>
//                 {values?.motherImage ? (
//                   <img
//                     src={
//                       values.motherImage instanceof File
//                       ? URL.createObjectURL(values.motherImage)
//                       :  values.motherImage
                    
//                     }
                   
//                     alt="mother Image"
//                     className="w-24 h-24 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
//                     <span className="text-[#ee582c]">NO IMAGE</span>
//                   </div>
//                 )}
//                 <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
//                   <Camera size={16} />
//                   <input
//                     type="file"
//                     capture="environment" // Opens the back camera; use "user" for the front camera
//                     className="hidden"
//                     accept="image/*"
//                     name="motherImage"
//                     onChange={(e) => handleImageChange(e, "motherImage")}
//                   />
//                 </label>
//               </div>
//             </div>

//             <div className="flex justify-center mb-6">
//               <div className="relative">
//                 <label
//                   className="block text-gray-700 text-sm font-bold mb-2"
//                   htmlFor="transport"
//                 >
//                   Guardian Photo:
//                 </label>

//                 {values?.guardianImage ? (
//                   <img
//                     src={
//                       values.guardianImage instanceof File
//                       ? URL.createObjectURL(values.guardianImage)
//                       :  values.guardianImage
                     
//                     }
                  
//                     alt="Guardian"
//                     className="w-24 h-24 rounded-full object-cover"
//                   />
//                 ) : (
//                   <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
//                     <span className="text-[#ee582c]">NO IMAGE</span>
//                   </div>
//                 )}
//                 <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
//                   <Camera size={16} />
//                   <input
//                     type="file"
//                     capture="environment" // Opens the back camera; use "user" for the front camera
//                     className="hidden"
//                     accept="image/*"
//                     name="guardianImage"
//                     onChange={(e) => handleImageChange(e, "guardianImage")}
//                   />
//                 </label>
//               </div>
//             </div>
//           </div>
//         )}
//       </Modal>
//     </>
//   );
// }

// export default EditForm;
