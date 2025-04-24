import React, { useState, useCallback, useEffect, useRef } from "react";
import { Camera } from "lucide-react"; // For icons
import Webcam from "react-webcam";       // For webcam capture
import Cropper from "react-easy-crop";   // For image cropping
import getCroppedImg from "./getCroppedImg"; // Your utility function for cropping
import Modal from "../../Modal";         // Your Modal component
import { FormControl, InputLabel, Select, TextField, MenuItem, Button as MuiButton } from "@mui/material"; // Material UI components
import Button from "../../utils/Button"; // Your CUSTOM Button component
import { Admission } from "../../../Network/ThirdPartyApi"; // Your API function
import { toast } from "react-toastify"; // For notifications
import moment from "moment";             // For date handling
import { useStateContext } from "../../../contexts/ContextProvider"; // Your context

// --- Helper Component for Image Preview and Object URL Management ---
const ImagePreview = ({ imageSource, alt, defaultText = "NO IMAGE", placeholderSrc = 'placeholder.png' /* Optional: provide a real path */ }) => {
    const [displayUrl, setDisplayUrl] = useState(null);

    useEffect(() => {
        let objectUrl = null;

        if (imageSource instanceof File) {
            // Create an object URL for File objects
            objectUrl = URL.createObjectURL(imageSource);
            setDisplayUrl(objectUrl);
        } else if (typeof imageSource === 'string' && imageSource) {
            // Use the source directly if it's a string (URL)
            setDisplayUrl(imageSource);
        } else {
            // Reset if no valid source
            setDisplayUrl(null);
        }

        // Cleanup function: This runs when the component unmounts
        // or when imageSource changes before the next effect runs.
        return () => {
            if (objectUrl) {
                // console.log("Revoking Object URL:", objectUrl); // For debugging
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [imageSource]); // Re-run the effect only when imageSource changes

    if (!displayUrl) {
        return (
            <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center border border-dashed border-gray-400">
                <span className="text-xs text-gray-500 text-center p-1">{defaultText}</span>
            </div>
        );
    }

    return (
        <img
            src={displayUrl}
            alt={alt}
            className="w-full h-full rounded-full object-cover border-2 border-gray-300 shadow-sm"
            onError={(e) => {
                console.warn(`Error loading image: ${displayUrl}. Falling back to default/placeholder.`);
                e.target.onerror = null; // Prevent infinite loop if placeholder also fails
                // Optionally set to a placeholder image instead of hiding
                // e.target.src = placeholderSrc;
                // For now, just revert to the default text display by resetting state (might cause flicker)
                setDisplayUrl(null); // Revert to the "NO IMAGE" state if src fails
            }}
        />
    );
};
// --- End of ImagePreview Component ---


// Helper to convert Blob URL/Base64 to File object (refined)
const getFileFromSource = async (source, fileName = "image.jpeg", type = "image/jpeg") => {
    try {
        const response = await fetch(source);
        const blob = await response.blob();

        // Use canvas to ensure JPEG format and quality
        return new Promise((resolve) => {
            const img = new Image();
            const reader = new FileReader();

            reader.onloadend = () => {
                img.src = reader.result;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = img.naturalWidth;
                    canvas.height = img.naturalHeight;
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0);
                    canvas.toBlob(
                        (jpegBlob) => {
                            if (jpegBlob) {
                                const file = new File([jpegBlob], fileName, { type: type });
                                resolve(file);
                            } else {
                                console.error("Canvas toBlob failed, using original blob.");
                                resolve(new File([blob], fileName, { type: blob.type || type }));
                            }
                        },
                        type, 0.9 // JPEG quality 90%
                    );
                };
                img.onerror = () => {
                     console.error("Image load error for canvas conversion.");
                     resolve(new File([blob], fileName, { type: blob.type || type }));
                }
            };
             reader.onerror = () => {
                console.error("FileReader error for canvas conversion.");
                resolve(new File([blob], fileName, { type: blob.type || type }));
            }
            reader.readAsDataURL(blob);
        });

    } catch (error) {
        console.error("Error fetching or converting image source:", error);
        toast.error("Failed to process image.");
        return null;
    }
};


function DynamicFormFileds(props) {
    const { studentData, buttonLabel, setIsOpen, setReRender } = props;
    const { isLoader, setIsLoader } = useStateContext();
    const [getClass, setGetClass] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
    const [values, setValues] = useState({
        admissionNumber: "", rollNo: "", fullName: "", class: "", section: "", gender: "",
        DOB: moment("1999-01-01").format("YYYY-MM-DD"), fatherName: "", motherName: "", guardianName: "",
        contact: "", address: "", studentImage: null, motherImage: null, fatherImage: null,
        guardianImage: null, transport: "", remarks: "", parentId: ""
    });

    // --- Cropper State ---
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [croppedImageSource, setCroppedImageSource] = useState(null); // Source for the cropper (Base64 or Object URL)
    const [croppingLoading, setCroppingLoading] = useState(false); // Loading indicator for crop operation
    const [currentPhotoType, setCurrentPhotoType] = useState(null); // Tracks which image is being cropped

    // --- Webcam State ---
    const [showWebcam, setShowWebcam] = useState(false);
    const webcamRef = useRef(null);

    // --- Loading State ---
    const [loading, setLoading] = useState(false); // For form submission

    // --- Modal State ---
    const [modalOpen, setModalOpen] = useState(false);

    // --- Effects ---
    useEffect(() => {
        const classes = JSON.parse(localStorage.getItem("classes"));
        if (classes) {
            setGetClass(classes);
        }
    }, []);

    useEffect(() => {
        // Only populate if getClass has data, prevents race condition
        if (studentData && getClass.length > 0) {
            const selectedClassObj = getClass.find((cls) => cls.className === studentData.class);
            if (selectedClassObj?.sections) {
                 const sectionsArray = Array.isArray(selectedClassObj.sections) ? selectedClassObj.sections : selectedClassObj.sections.split(/\s*,\s*/);
                 setAvailableSections(sectionsArray);
            } else {
                setAvailableSections([]);
            }

            setValues({
                fullName: studentData.studentName || "",
                class: studentData.class || "",
                gender: studentData.gender || "",
                address: studentData.address || "",
                contact: studentData.contact || "",
                rollNo: studentData.rollNo || "",
                section: studentData.section || "", // Populate section
                fatherName: studentData?.fatherName || "",
                motherName: studentData?.motherName || "",
                guardianName: studentData?.udisePlusDetails?.guardian_name || studentData?.guardianName || "",
                // Store URL strings directly. ImagePreview will handle display.
                studentImage: studentData?.studentImage?.url || null,
                fatherImage: studentData?.fatherImage?.url || null,
                motherImage: studentData?.motherImage?.url || null,
                guardianImage: studentData?.guardianImage?.url || null,
                DOB: studentData?.dateOfBirth ? moment(studentData.dateOfBirth).format("YYYY-MM-DD") : moment("1999-01-01").format("YYYY-MM-DD"),
                parentId: studentData?.parentId || "",
                admissionNumber: studentData?.admissionNumber || studentData?.studentAdmissionNumber || "", // Check both possible names
                transport: studentData?.transport || "",
                remarks: studentData?.remarks || "",
            });
        } else if (!studentData) {
             // Reset form if no studentData is provided (e.g., for new admission)
             setValues({
                admissionNumber: "", rollNo: "", fullName: "", class: "", section: "", gender: "",
                DOB: moment("1999-01-01").format("YYYY-MM-DD"), fatherName: "", motherName: "", guardianName: "",
                contact: "", address: "", studentImage: null, motherImage: null, fatherImage: null,
                guardianImage: null, transport: "", remarks: "", parentId: ""
             });
             setAvailableSections([]);
        }
    }, [studentData, getClass]); // Rerun when studentData or getClass changes


    // --- Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setValues({ ...values, [name]: value });
    };

    const handleClassChange = (e) => {
        const selectedClassName = e.target.value;
        setValues((prevData) => ({
            ...prevData,
            class: selectedClassName,
            section: "", // Reset section
        }));
        const selectedClassObj = getClass.find((cls) => cls.className === selectedClassName);
        if (selectedClassObj?.sections) {
             const sectionsArray = Array.isArray(selectedClassObj.sections) ? selectedClassObj.sections : selectedClassObj.sections.split(/\s*,\s*/);
             setAvailableSections(sectionsArray);
        } else {
            setAvailableSections([]);
        }
    };

    const handleSectionChange = (e) => {
        setValues((prevData) => ({
            ...prevData,
            section: e.target.value,
        }));
    };

    // --- Image Handling ---

    // 1. File Input Change
    const handleFileChange = (e, photoType) => {
        const file = e.target.files[0];
        e.target.value = null; // Reset file input immediately
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            toast.warn("File size exceeds 5 MB limit.");
            return;
        }
        if (!file.type.startsWith('image/')) {
            toast.warn("Please select an image file (JPG, PNG, etc.).");
            return;
        }

        setCurrentPhotoType(photoType);
        const reader = new FileReader();
        reader.onloadend = () => {
            setCroppedImageSource(reader.result); // Base64 for cropper
        };
        reader.onerror = () => {
            toast.error("Could not read the selected file.");
        }
        reader.readAsDataURL(file);
    };

    // 2. Open Webcam
    const openWebcam = (photoType) => {
        setCurrentPhotoType(photoType);
        setShowWebcam(true);
        setCroppedImageSource(null); // Close cropper if open
    };

    // 3. Capture from Webcam
    const captureImage = useCallback(() => {
        if (webcamRef.current) {
            const imageSrc = webcamRef.current.getScreenshot({ type: 'image/jpeg' }); // Get base64 JPEG
            if (imageSrc) {
                setCroppedImageSource(imageSrc); // Set base64 source for cropper
                setShowWebcam(false); // Close webcam
            } else {
                toast.error("Could not capture image from webcam.");
            }
        }
    }, [webcamRef]);

    // 4. Cropper Actions
    const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => { // _croppedArea not needed here
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const cancelCrop = useCallback(() => {
        setCroppedImageSource(null);
        setCurrentPhotoType(null);
        setCroppingLoading(false);
        setZoom(1);
        setCrop({ x: 0, y: 0 });
    }, []);

    // 5. Apply Cropped Image
    const showCroppedImage = async () => {
        if (!croppedAreaPixels || !croppedImageSource || !currentPhotoType) {
            toast.error("Cropping failed: Missing required data.");
            return;
        }

        setCroppingLoading(true);
        try {
            const croppedImageUrl = await getCroppedImg(croppedImageSource, croppedAreaPixels);
            if (!croppedImageUrl) throw new Error("Cropping utility failed.");

            const imageFile = await getFileFromSource(croppedImageUrl, `${currentPhotoType}.jpeg`);
            if (!imageFile) throw new Error("Failed to convert cropped image to File.");

            // Update state with the File object
            setValues((prev) => ({ ...prev, [currentPhotoType]: imageFile }));

            // Clean up cropper state
            cancelCrop(); // Use cancelCrop to reset everything

        } catch (error) {
            console.error("Error cropping or processing image:", error);
            toast.error(`Cropping Error: ${error.message || 'Please try again.'}`);
            setCroppingLoading(false); // Ensure loading stops on error
        }
    };

    // --- Form Submission ---
    const schoolID = localStorage.getItem("SchoolID");

    // Basic email generation (use a more robust method in production)
    const generateEmail = (name, contact) => {
        let emailPrefix = name?.toLowerCase() || 'user';
        emailPrefix = emailPrefix.replace(/[^a-z0-9]/g, "").substring(0, 15);
        const contactSuffix = contact?.replace(/[^0-9]/g, "").slice(-4) || Date.now().toString().slice(-4);
        return `${emailPrefix}${contactSuffix}@example.com`; // Use a placeholder domain
    };

    const validateForm = () => {
        const requiredFields = [
            { key: "fullName", message: "Student Name" }, { key: "fatherName", message: "Father Name" },
            { key: "contact", message: "Contact Number" }, { key: "class", message: "Class" },
            { key: "section", message: "Section" }, { key: "gender", message: "Gender" },
            { key: "DOB", message: "Date of Birth" },
        ];

        const missing = requiredFields.filter(f => !values[f.key]).map(f => f.message);
        if (missing.length > 0) {
            toast.warn(`Required fields missing: ${missing.join(', ')}`);
            return false;
        }

        const contactRegex = /^\d{10}$/; // Simple 10 digit check
        if (values.contact && !contactRegex.test(values.contact.replace(/\D/g, ''))) { // Remove non-digits before test
            toast.warn("Please enter a valid 10-digit contact number.");
            return false;
        }
        // Add DOB validation (e.g., not in the future) if needed
        if (moment(values.DOB).isAfter(moment())) {
             toast.warn("Date of Birth cannot be in the future.");
             return false;
        }

        return true;
    }

    // Save (New Admission)
    const handleSaveClick = async () => {
        if (!validateForm()) return;


        setLoading(true);
        setIsLoader(true);

        const studentEmail = generateEmail(values.fullName, values.contact);
        const parentEmail = generateEmail(values.fatherName, values.contact);

        try {
            const studentDataPayload = {
                schoolId: schoolID, studentFullName: values.fullName, studentEmail: studentEmail,
                parentEmail: parentEmail, studentPassword: values.contact, parentPassword: values.contact,
                studentDateOfBirth: moment(values.DOB).format("DD-MMM-YYYY"),
                studentJoiningDate: moment().format("DD-MMM-YYYY"), studentGender: values.gender,
                studentClass: values.class, studentSection: values.section, studentAddress: values.address || "",
                studentContact: values.contact, parentContact: values.contact, fatherName: values.fatherName,
                motherName: values.motherName || "", guardianName: values.guardianName || "",
                studentAdmissionNumber: values.admissionNumber || "", studentRollNo: values.rollNo || "",
                remarks: values.remarks || "", transport: values.transport || "",
            };

            const formDataToSend = new FormData();
            Object.entries(studentDataPayload).forEach(([key, value]) => formDataToSend.append(key, value));

            // Append *only* File objects
            if (values.studentImage instanceof File) formDataToSend.append("studentImage", values.studentImage);
            if (values.fatherImage instanceof File) formDataToSend.append("fatherImage", values.fatherImage);
            if (values.motherImage instanceof File) formDataToSend.append("motherImage", values.motherImage);
            if (values.guardianImage instanceof File) formDataToSend.append("guardianImage", values.guardianImage);

            const response = await Admission(formDataToSend); // Call your API function

            if (response.success) {
                toast.success("Admission successful!");
                setValues({
                    admissionNumber: "", rollNo: "", fullName: "", class: "", section: "", gender: "",
                    DOB: moment("1999-01-01").format("YYYY-MM-DD"), fatherName: "", motherName: "", guardianName: "",
                    contact: "", address: "", studentImage: null, motherImage: null, fatherImage: null,
                    guardianImage: null, transport: "", remarks: "", parentId: ""
                 });
                 setAvailableSections([]);
                setReRender(true);
               
              
            } else {
                toast.error(response?.message || response?.data?.message || "Admission failed.");
            }
        } catch (error) {
            console.error("Error during admission:", error);
            console.error(`An error occurred: ${error?.response?.data?.message || error.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
            setIsLoader(false);
        }
    };

    // Update (Edit Admission)
    const handleUpDateClick = async () => {
    //   debugger
        //  if (!validateForm()) return;

        setIsLoader(true);
        setLoading(true);
        setReRender(false);
        const studentId = studentData?.studentId;

        if (!studentId) {
             toast.error("Student ID is missing. Cannot update.");
             setIsLoader(false); setLoading(false); return;
        }

        try {
            const studentDataForUpdate = {
                schoolId: schoolID, parentId: values.parentId, studentFullName: values.fullName,
                studentDateOfBirth: moment(values.DOB).format("DD-MMM-YYYY"),
                studentGender: values.gender, studentClass: values.class, studentSection: values.section,
                studentAddress: values.address || "", studentContact: values.contact, contact: values.contact, // Keep both if API needs 'contact' too
                fatherName: values.fatherName, motherName: values.motherName || "", guardianName: values.guardianName || "",
                studentAdmissionNumber: values.admissionNumber || "", studentRollNo: values.rollNo || "",
                remarks: values.remarks || "", transport: values.transport || "",
                // Do not send emails or passwords unless they are being explicitly changed
            };

            const formDataToSend = new FormData();
            Object.entries(studentDataForUpdate).forEach(([key, value]) => formDataToSend.append(key, String(value)));

            // Append *only* new File objects
            if (values.studentImage instanceof File) formDataToSend.append("studentImage", values.studentImage);
            if (values.fatherImage instanceof File) formDataToSend.append("fatherImage", values.fatherImage);
            if (values.motherImage instanceof File) formDataToSend.append("motherImage", values.motherImage);
            if (values.guardianImage instanceof File) formDataToSend.append("guardianImage", values.guardianImage);

            const response = await fetch(
                `https://dvsserver.onrender.com/api/v1/thirdparty/admissions/${studentId}`, // Use env variable for base URL ideally
                {
                    method: "PUT",
                    headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
                    body: formDataToSend,
                }
            );

            const result = await response.json();

            if (result.success) {
                toast.success("Update successful!");
                setReRender(true);
                setIsOpen(false);
            } else {
                toast.error(result.message || "Failed to update admission");
            }
        } catch (error) {
            console.error("Error updating student:", error);
            toast.error(`An error occurred during update: ${error.message || 'Please try again.'}`);
        } finally {
            setLoading(false);
            setIsLoader(false);
        }
    };

    // Open "More Details" Modal
    const handleMoreDetails = () => {
        setModalOpen(true);
    };

    // --- Helper Function to Render Image Input (Uses ImagePreview Component) ---
    const renderImageInput = (label, photoType, currentImageValue) => {
        // Removed the problematic useEffect and URL.createObjectURL logic from here
        return (
             <div className="flex flex-col items-center mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                    {label}:
                </label>
                <div className="relative w-24 h-24 mb-2 group">
                    {/* Use the ImagePreview component for display and lifecycle management */}
                    <ImagePreview
                        imageSource={currentImageValue}
                        alt={label}
                        defaultText="NO IMAGE"
                    />

                     {/* Overlay Buttons container */}
                     <div className="absolute bottom-0 right-0 flex flex-col space-y-1 translate-x-1/4 translate-y-1/4">
                         {/* Webcam Capture Button */}
                        <button
                            type="button"
                            onClick={() => openWebcam(photoType)}
                            className="bg-blue-500 text-white p-1.5 rounded-full shadow-md hover:bg-blue-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
                            aria-label={`Capture ${label} from webcam`}
                            title={`Capture ${label} from webcam`}
                        >
                            <Camera size={14} />
                        </button>

                         {/* File Upload Label/Button */}
                        <label className="bg-green-500 text-white p-1.5 rounded-full cursor-pointer shadow-md hover:bg-green-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-opacity-50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, photoType)}
                                aria-label={`Upload ${label}`}
                                title={`Upload ${label}`}
                            />
                        </label>
                    </div>
                </div>
            </div>
        );
    };


    // --- Conditional Rendering for Webcam & Cropper ---

    // 1. Webcam View
    if (showWebcam) {
        return (
            <div className=" min-w-[300px] inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4">
            {/* <div className="fixed min-w-[300px] inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center z-50 p-4"> */}
                 <p className="text-white text-lg mb-3 font-semibold">Position for {currentPhotoType?.replace('Image', ' Photo')}</p>
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full max-w-lg h-auto rounded-lg border-4 border-gray-400 shadow-lg"
                    videoConstraints={{ facingMode: "environment" }} // 'user' for front camera
                />
                <div className="mt-5 flex gap-4">
                    <MuiButton variant="contained" color="primary" onClick={captureImage} size="large">
                        Capture
                    </MuiButton>
                    <MuiButton variant="outlined" sx={{ color: 'white', borderColor: 'white' }} onClick={() => { setShowWebcam(false); setCurrentPhotoType(null); }} size="large">
                        Cancel
                    </MuiButton>
                </div>
            </div>
        );
    }

    // 2. Cropper View
    if (croppedImageSource) {
        return (
            <div className=" min-w-[300px] inset-0 bg-black bg-opacity-80 flex items-center justify-center p-1 z-50">
            {/* <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50"> */}
                <div className="bg-white rounded-lg p-4 w-full max-w-md relative shadow-xl">
                    {croppingLoading && (
                        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="text-lg font-medium ml-3">Processing...</p>
                        </div>
                    )}
                    <p className="text-center font-semibold text-lg mb-3">Crop Your Photo</p>
                    <div className="relative h-64 w-[] mb-4 bg-red-600 rounded overflow-hidden border border-gray-300">
                        <Cropper
                            image={croppedImageSource}
                            crop={crop}
                            zoom={zoom}
                            aspect={1} // Square aspect ratio
                            onCropChange={setCrop}
                            onZoomChange={setZoom}
                            onCropComplete={onCropComplete}
                            showGrid={true}
                        />
                    </div>
                     {/* Zoom Slider */}
                    <div className="flex justify-center items-center mb-4 px-4">
                        <span className="mr-2 text-sm text-gray-600">Zoom:</span>
                        <input
                            type="range" min="1" max="3" step="0.1" value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-[#2fa7db]" // Use accent color
                            disabled={croppingLoading}
                        />
                    </div>
                    <div className="flex justify-end gap-3 mt-2">
                        <MuiButton variant="outlined" color="secondary" onClick={cancelCrop} disabled={croppingLoading}>
                            Cancel
                        </MuiButton>
                        <MuiButton variant="contained" color="primary" onClick={showCroppedImage} disabled={croppingLoading}>
                            {croppingLoading ? "Cropping..." : "Crop & Use"}
                        </MuiButton>
                    </div>
                </div>
            </div>
        );
    }

    // --- Main Form Render ---
    // (The rest of the main return statement remains the same as your original code)
    return (
        <>
            <div className="selection:bg-[#2fa7db] selection:text-white">
                 {/* Adjusted width handling */}
                <div className="flex justify-center p-2">
                    <div className={`w-full max-w-4xl  ${buttonLabel === "Save" ?"": "overflow-scroll h-[70vh]"}`}> {/* Use max-width for better control */}
                        <div className="bg-white mx-auto overflow-hidden shadow-xl rounded-lg border border-gray-200 min-w-[300px]">
                            {/* Header */}
                            <div className="relative px-5 py-1 rounded-t-lg bg-gradient-to-r from-[#2fa7db] to-[#59b3da] text-white">
                                <h1 className="text-md font-semibold text-center sm:text-left">
                                    {buttonLabel === "Save" ? "New Admission" : "Edit Details"}
                                </h1>
                                {/* Your Custom Button for More Details */}
                                <div className="absolute top-0 right-3">
                                     <Button
                                        name=" More Details"
                                        color="gray" // Keep original color or change to 'white' etc.
                                        onClick={() => handleMoreDetails()} // Use onClick (or customFunc if needed)
                                        // className="text-[#ee582c] m-2 bg-white px-3 py-1 rounded shadow hover:bg-gray-100 transition duration-150 text-sm" // Example styling - ADJUST AS NEEDED
                                        // Add other props your Button needs
                                    />
                                </div>
                            </div>

                            {/* Student Image - Centered above form */}
                             <div className="px-6  flex justify-center">
                                {/* This now uses the refactored renderImageInput */}
                                {renderImageInput("Student Photo", "studentImage", values.studentImage)}
                            </div>

                            {/* Form Area */}
                            <div className="px-6 pb-8 pt-1 bg-white rounded-b-lg">
                                <form className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4" noValidate> {/* Added gap-y, noValidate */}

                                    {/* Full Name - Spans 2 columns */}
                                    <div className="relative mt-2 md:col-span-2">
                                        <TextField label={<span>Student Name <span className="text-red-500">*</span></span>} variant="standard" fullWidth required name="fullName" value={values.fullName} onChange={handleInputChange}
                                         InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>
                                    </div>

                                     {/* Father Name */}
                                    <div className="relative mt-2">
                                        <TextField label={<span>Father Name <span className="text-red-500">*</span></span>} variant="standard" fullWidth required name="fatherName" value={values.fatherName} onChange={handleInputChange}
                                         InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>
                                    </div>

                                      {/* Contact No. */}
                                    <div className="relative mt-2">
                                        <TextField label={<span>Contact No. <span className="text-red-500">*</span></span>} variant="standard" fullWidth required name="contact" type="tel" inputProps={{ maxLength: 10, pattern: "[0-9]*" }} value={values.contact} onChange={handleInputChange}
                                         InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>
                                    </div>

                                    {/* Class Select */}
                                    <FormControl variant="standard" required fullWidth sx={{ mt: 1, '& .MuiInputLabel-root': { color: '#ee582c' }, '& .MuiSelect-root': { color: '#2fa7db' }, '& .MuiSelect-icon': { color: '#ee582c' }, '&:before': { borderBottom: '1px solid #ee582c' }, '&:after': { borderBottom: '2px solid #ee582c' }, }}> {/* Adjusted border */}
                                        <InputLabel id="class-select-label">Class <span className="text-red-500">*</span></InputLabel>
                                        <Select labelId="class-select-label" name="class" value={values.class} onChange={handleClassChange} label="Class">
                                            <MenuItem value="" disabled><em>Select a Class</em></MenuItem>
                                            {getClass?.map((cls, index) => ( <MenuItem key={index} value={cls.className}>{cls.className}</MenuItem> ))}
                                        </Select>
                                    </FormControl>

                                     {/* Section Select */}
                                    <FormControl variant="standard" required fullWidth sx={{ mt: 1, '& .MuiInputLabel-root': { color: '#ee582c' }, '& .MuiSelect-root': { color: '#2fa7db' }, '& .MuiSelect-icon': { color: '#ee582c' }, '&:before': { borderBottom: '1px solid #ee582c' }, '&:after': { borderBottom: '2px solid #ee582c' }, }} disabled={!values.class || availableSections.length === 0}> {/* Adjusted border */}
                                        <InputLabel id="section-select-label">Section <span className="text-red-500">*</span></InputLabel>
                                        <Select labelId="section-select-label" name="section" value={values.section} onChange={handleSectionChange} label="Section">
                                            <MenuItem value="" disabled><em>Select a Section</em></MenuItem>
                                            {availableSections.map((sec, index) => ( <MenuItem key={index} value={sec}>{sec}</MenuItem> ))}
                                            {availableSections.length === 0 && values.class && <MenuItem disabled><em>No Sections Available</em></MenuItem>}
                                        </Select>
                                    </FormControl>

                                    {/* Gender Select */}
                                    <FormControl variant="standard" required fullWidth sx={{ mt: 1, '& .MuiInputLabel-root': { color: '#ee582c' }, '& .MuiSelect-root': { color: '#2fa7db' }, '& .MuiSelect-icon': { color: '#ee582c' }, '&:before': { borderBottom: '1px solid #ee582c' }, '&:after': { borderBottom: '2px solid #ee582c' }, }}> {/* Adjusted border */}
                                        <InputLabel id="gender-select-label">Gender <span className="text-red-500">*</span></InputLabel>
                                        <Select labelId="gender-select-label" name="gender" value={values.gender} onChange={handleInputChange} label="Gender">
                                             <MenuItem value="" disabled><em>Select Gender</em></MenuItem>
                                            <MenuItem value="Male">Male</MenuItem>
                                            <MenuItem value="Female">Female</MenuItem>
                                            <MenuItem value="Other">Other</MenuItem>
                                        </Select>
                                    </FormControl>

                                    {/* Date of Birth */}
                                    <div className="relative mt-2">
                                         <TextField id="DOB" label={<span>Date of Birth <span className="text-red-500">*</span></span>} type="date" name="DOB" value={values.DOB} onChange={handleInputChange} variant="standard" required fullWidth
                                            InputLabelProps={{ shrink: true, sx: { color: '#ee582c' } }}
                                            sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }} />
                                    </div>

                                    {/* Roll Number */}
                                    <div className="relative mt-2">
                                        <TextField label="Roll No." variant="standard" fullWidth name="rollNo" inputProps={{ maxLength: 5, pattern:"[0-9]*" }} value={values.rollNo} onChange={handleInputChange}
                                         InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>
                                    </div>

                                     {/* Admission Number */}
                                    <div className="relative mt-2">
                                        <TextField label="Admission No." variant="standard" fullWidth name="admissionNumber" value={values.admissionNumber} onChange={handleInputChange}
                                         InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>
                                    </div>

                                    {/* Address - Spans 2 columns */}
                                    <div className="relative mt-2 md:col-span-2">
                                        <TextField label="Address" variant="standard" fullWidth name="address" value={values.address} onChange={handleInputChange}
                                         InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>
                                    </div>

                                </form> {/* End of form grid */}

                                {/* Submit Button Area */}
                                <div className="mt-8"> {/* Added margin top */}
                                     <MuiButton fullWidth variant="contained"
                                        sx={{ backgroundColor: '#2fa7db', '&:hover': { backgroundColor: '#2996c5' }, py: 1.5, fontSize: '1rem', fontWeight: 'bold' }}
                                        onClick={buttonLabel === "Save" ? handleSaveClick : handleUpDateClick}
                                        disabled={loading || isLoader}
                                    >
                                        {loading ? (buttonLabel === "Save" ? "Saving..." : "Updating...") : buttonLabel}
                                    </MuiButton>
                                </div>
                            </div> {/* End of form content area */}
                        </div>
                    </div>
                </div>
            </div>

            {/* More Details Modal */}
            <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`More Details & Parent Photos`}>
                 <div className="p-5 md:p-6 min-w-[330px] max-w-lg mx-auto">
                    <div className="grid grid-cols-1 gap-y-4 mb-6">
                        <TextField label="Mother Name" variant="standard" fullWidth name="motherName" value={values.motherName} onChange={handleInputChange}
                         InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>

                        <TextField label="Guardian Name" variant="standard" fullWidth name="guardianName" value={values.guardianName} onChange={handleInputChange}
                        InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>

                        <TextField label="Transport Details" variant="standard" fullWidth name="transport" value={values.transport} onChange={handleInputChange}
                        InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>

                        <TextField label="Remarks" variant="standard" fullWidth multiline rows={2} name="remarks" value={values.remarks} onChange={handleInputChange}
                         InputLabelProps={{ sx: { color: '#ee582c' } }} sx={{ '& .MuiInput-input': { color: '#2fa7db' }, '& .MuiInput-underline:before': { borderBottomColor: '#ee582c' }, '& .MuiInput-underline:after': { borderBottomColor: '#ee582c' } }}/>
                    </div>

                    {/* Parent/Guardian Photos */}
                     <p className="text-center text-gray-600 font-medium mb-4">Parent/Guardian Photos</p>
                     <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                         {/* These now use the refactored renderImageInput */}
                        {renderImageInput("Father Photo", "fatherImage", values.fatherImage)}
                        {renderImageInput("Mother Photo", "motherImage", values.motherImage)}
                        {renderImageInput("Guardian Photo", "guardianImage", values.guardianImage)}
                     </div>

                     <div className="mt-6 flex justify-end">
                         <MuiButton onClick={() => setModalOpen(false)} variant="outlined" color="primary">
                            Close
                         </MuiButton>
                     </div>
                 </div>
            </Modal>
        </>
    );
}

export default DynamicFormFileds;


















// import React, { useState, useCallback, useEffect } from "react";
// import { Camera } from "lucide-react";
// import Cropper from "react-easy-crop";
// import getCroppedImg from "./getCroppedImg";
// import Modal from "../../Modal";
// import { FormControl, InputLabel, Select, TextField,MenuItem  } from "@mui/material";
// import Button from "../../utils/Button";
// // import {  MenuItem } from "@mui/material";
// // import { TextField, MenuItem } from "@mui/material";
// import {
//   Admission,
//   initialstudentphoto,
//   thirdpartymystudents,
// } from "../../../Network/ThirdPartyApi";
// import { toast } from "react-toastify";
// import moment from "moment";
// import { useStateContext } from "../../../contexts/ContextProvider";


// function DynamicFormFileds(props) {
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
//         parentId:studentData?.parentId
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
//       setCroppedImageSource(reader.result);
//     };
//     reader.readAsDataURL(file);
//   };
  


  
//   const handleSaveClick = async () => {
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
//     setIsLoader(true);
//     setReRender(false);
//     setLoading(true);
//     const studentId = studentData?.studentId;
// // console.log("values?.DOB",values?.DOB)
//     try {
//       const studentDataForUpdate = {
//         schoolId: schoolID, 
//         parentId: values?.parentId,
//         studentFullName: values?.fullName || "",
//         studentEmail: `${values?.fullName}${values?.contact}@gmail.com` || "",
//         studentDateOfBirth: values?.DOB?moment(values?.DOB).format("DD-MMM-YYYY"): "",
//         studentJoiningDate: moment(new Date()).format("DD-MMM-YYYY") || "",
//         studentGender: values?.gender || "",
//         studentClass: values?.class || "",
//         studentSection: values?.section || "",
//         studentAddress: values?.address || "",
//         studentContact: values?.contact || "",
//         contact: values?.contact || "", // For parent compatibility
//         fatherName: values?.fatherName || "",
//         motherName: values?.motherName || "",
//         guardianName: values?.guardianName || "",
//         studentAdmissionNumber: values?.admissionNumber || "",
//         remarks: values?.remarks || "", // Assuming this maps to udisePlusDetails or another field if needed
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
//       const response = await fetch(
//         `https://dvsserver.onrender.com/api/v1/thirdparty/admissions/${studentId}`,
//         {
//           method: "PUT",
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth setup
//           },
//           body: formDataToSend,
//         }
//       );

//       const result = await response.json();

//       if (result.success) {
//         setIsLoader(false);
//         setReRender(true);
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
//         toast.error(result.message || "Failed to update admission");
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
//                   <Button
//                     name=" More Details"
//                     color="#59b3da"
//                     onClick={() => handleMoreDetails()}
//                     className="text-[#ee582c] m-2"
//                   />
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
//                     <label className="absolute bottom-0 right-0 bg-[#ee582c] text-white p-2 rounded-full cursor-pointer">
//                       <Camera size={18} />
//                       <input
//                         type="file"
//                         className="hidden"
//                         accept="image/*"
//                         // capture="environment" // Opens the back camera; use "user" for the front camera
//                         onChange={(e) => handleImageChange(e, "studentImage")}
//                       />
//                     </label>
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
               
//                   <div className="flex justify-center items-center gap-2">
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
//                         {/* {availableSections?.map((item, index) => (
//                           <MenuItem key={index} value={item}>
//                             {item}
//                           </MenuItem>
//                         ))} */}
//                       </Select>
//                     </FormControl>
//                   </div>
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
//                     <div class="relative w-full">
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
//                     </div>
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

// export default DynamicFormFileds;
