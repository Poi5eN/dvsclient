import React, { useState, useCallback, useEffect, useRef } from "react";
import { Camera, SwitchCamera } from "lucide-react";
import Cropper from "react-easy-crop";
import Webcam from "react-webcam";
import {
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Modal,
    Box,
    Button,
    IconButton,
} from "@mui/material";
// Assume these imports are correct
import { initialstudentphoto } from "../../Network/ThirdPartyApi";
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider";
import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg";

// --- Modal Style ---
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%', // Responsive width
    maxWidth: 500, // Max width for larger screens
    bgcolor: 'background.paper',
    border: '1px solid #ccc', // Softer border
    borderRadius: '8px', // Rounded corners
    boxShadow: 24,
    p: 4,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
};

// --- Helper to convert Base64/Data URL to Blob/File ---
const dataURLtoFile = (dataurl, filename) => {
    if (!dataurl) return null;
    try {
        let arr = dataurl.split(','),
            mimeMatch = arr[0].match(/:(.*?);/);
        if (!mimeMatch || mimeMatch.length < 2) {
            console.error("Invalid data URL format for MIME type extraction");
            return null; // Or throw an error
        }
        let mime = mimeMatch[1],
            bstr = atob(arr[arr.length - 1]),
            n = bstr.length,
            u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    } catch (e) {
        console.error("Error converting data URL to File:", e);
        toast.error("Error processing image data.");
        return null;
    }
};


function DynamicFormFileds(props) {
    const { studentData, buttonLabel = "Save", setIsOpen, setReRender } = props;
    const { isLoader, setIsLoader } = useStateContext();
    const [getClass, setGetClass] = useState([]);
    const [availableSections, setAvailableSections] = useState([]);
    const [values, setValues] = useState({
        fullName: "",
        class: "",
        section: "",
        studentImage: null, // Can be File object or URL string initially
    });

    // --- Webcam State ---
    const [showWebcam, setShowWebcam] = useState(false);
    const webcamRef = useRef(null);
    const [currentPhotoType, setCurrentPhotoType] = useState(null); // Keeps track of which image field is being captured (only 'studentImage' here)
    const [facingMode, setFacingMode] = useState("user");

    // --- Cropper State ---
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [croppedImageSource, setCroppedImageSource] = useState(null); // Base64 string from webcam *before* cropping
    const [croppingLoading, setCroppingLoading] = useState(false); // Specific loading state for crop operation

    // --- Derived State for Preview ---
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // URL for the <img> tag

    // --- Effect Hooks ---

    // Fetch classes from localStorage
    useEffect(() => {
        try {
            const classesString = localStorage.getItem("classes");
            if (classesString) {
                const classes = JSON.parse(classesString);
                setGetClass(Array.isArray(classes) ? classes : []);
            }
        } catch (error) {
            console.error("Failed to parse classes from localStorage:", error);
            setGetClass([]);
        }
    }, []);

    // Update available sections when class changes
    useEffect(() => {
        if (values.class && getClass.length > 0) {
            const selectedClassObj = getClass.find((cls) => cls.className === values.class);
            const sectionsRaw = selectedClassObj?.sections;
            const sectionsArray = sectionsRaw
                ? (Array.isArray(sectionsRaw)
                    ? sectionsRaw
                    // Handle comma-separated string, trim whitespace, filter empty
                    : String(sectionsRaw).split(/\s*,\s*/).filter(Boolean))
                : [];
            setAvailableSections(sectionsArray);
            // Reset section if the new class doesn't have the currently selected section
            if (!sectionsArray.includes(values.section)) {
                setValues(prev => ({ ...prev, section: "" }));
            }
        } else {
            setAvailableSections([]);
            // Ensure section is reset if class is cleared
            if (!values.class) {
                 setValues(prev => ({ ...prev, section: "" }));
            }
        }
    // Only re-run if class changes or the source list of classes changes
    }, [values.class, getClass]); // Removed values.section dependency - resetting is handled inside


    // Initialize form with studentData or reset
    useEffect(() => {
        if (studentData) {
            // Determine the initial image source (prefer URL if available)
            const initialStudentImage = studentData.studentImage?.url || studentData.studentImage || null;
            setValues({
                fullName: studentData.fullName || "",
                class: studentData.class || "",
                section: studentData.section || "",
                studentImage: initialStudentImage, // Store the initial source (URL or null)
            });
            // Note: Section will be validated/reset by the effect above if needed after class is set
        } else {
            // Reset form if studentData is not provided
            setValues({
                fullName: "",
                class: "",
                section: "",
                studentImage: null,
            });
        }
        // This effect should run when studentData changes or when classes load (for initial section setting)
    }, [studentData, getClass]);

    // Effect to manage the image preview URL and cleanup blob URLs
    useEffect(() => {
        const currentImageSource = values.studentImage;
        let objectUrl = null;

        if (currentImageSource instanceof File) {
            objectUrl = URL.createObjectURL(currentImageSource);
            setImagePreviewUrl(objectUrl);
        } else if (typeof currentImageSource === 'string' && currentImageSource.startsWith('http')) {
            // Assuming it's a valid web URL
            setImagePreviewUrl(currentImageSource);
        } else {
            setImagePreviewUrl(null); // No valid image source
        }

        // Cleanup function: This runs when the component unmounts OR before the effect runs again
        return () => {
            if (objectUrl) {
                // console.log("Revoking Blob URL:", objectUrl); // Debugging
                URL.revokeObjectURL(objectUrl);
                setImagePreviewUrl(prevUrl => prevUrl === objectUrl ? null : prevUrl); // Optionally clear preview immediately on cleanup if it was the blob url
            }
        };
    }, [values.studentImage]); // Re-run ONLY when the studentImage in values changes

    // --- Callback Hooks ---

    const handleInputChange = useCallback((e) => {
        const { name, value } = e.target;
        setValues(prev => ({ ...prev, [name]: value }));
    }, []);

    const handleClassChange = useCallback((e) => {
        const selectedClassName = e.target.value;
        setValues((prevData) => ({
            ...prevData,
            class: selectedClassName,
            section: "", // Reset section when class changes
        }));
    }, []);

    const handleSectionChange = useCallback((e) => {
        setValues((prevData) => ({
            ...prevData,
            section: e.target.value,
        }));
    }, []);

    const openWebcam = useCallback((photoType) => {
        setCurrentPhotoType(photoType); // Set which image field we are capturing for
        setShowWebcam(true);
        // setFacingMode("user"); // Reset to front camera each time?
    }, []);

    const closeWebcam = useCallback(() => {
        setShowWebcam(false);
        setCurrentPhotoType(null);
    }, []);

    const capturePhoto = useCallback(() => {
        if (!webcamRef.current) {
            console.error("Webcam ref not available.");
            toast.error("Webcam not ready. Please try again.");
            return;
        }
        // Use PNG for potentially better quality capture before cropping
        const imageSrc = webcamRef.current.getScreenshot({ type: 'image/png', quality: 1 });

        if (imageSrc) {
            setShowWebcam(false); // Close webcam modal
            setCroppedImageSource(imageSrc); // Set the base64 source for the cropper
        } else {
            console.error("Could not capture screenshot. Webcam might not be ready or permissions denied.");
            toast.error("Could not capture photo. Please check camera permissions and try again.");
            closeWebcam(); // Close webcam modal on error
        }
    }, [webcamRef, closeWebcam]); // Add dependencies

    const handleSwitchCamera = useCallback(() => {
        setFacingMode(prevMode => (prevMode === "user" ? "environment" : "user"));
    }, []);

    const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsValue) => {
        // Note: react-easy-crop calls this on mouse/touch up. Store the final value.
        setCroppedAreaPixels(croppedAreaPixelsValue);
    }, []);

    const cancelCrop = useCallback(() => {
        setCroppedImageSource(null); // Hide cropper
        setCurrentPhotoType(null);   // Reset photo type context
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });      // Reset crop position
        setZoom(1);                  // Reset zoom
        setCroppingLoading(false);   // Ensure loading state is reset
    }, []);

    const showCroppedImage = useCallback(async () => {
      if (!croppedImageSource || !croppedAreaPixels || !currentPhotoType) {
          console.error("Cropping prerequisites missing.");
          toast.warn("Cannot process crop. Please try capturing again.");
          cancelCrop();
          return;
      }
  
      setCroppingLoading(true);
      try {
          // Call getCroppedImg
          const croppedImageResult = await getCroppedImg(
              croppedImageSource,
              croppedAreaPixels,
              0 // Assuming rotation is 0
          );
  
          // *** ADD THESE LOGS ***
          console.log("Result from getCroppedImg:", croppedImageResult);
          console.log("Type of result:", typeof croppedImageResult);
          if (croppedImageResult instanceof Blob) {
              console.log("Result is a Blob object. Size:", croppedImageResult.size, "Type:", croppedImageResult.type);
          }
          // *** END OF LOGS ***
  
          // Now check the type and act accordingly
          let imageFile = null;
          const filename = `${currentPhotoType}_${Date.now()}.jpeg`;
  
          if (typeof croppedImageResult === 'string' && croppedImageResult.startsWith('data:')) {
              // --- Case 1: It's a Data URL (Expected) ---
              console.log("Result is a Data URL. Converting to File...");
              imageFile = dataURLtoFile(croppedImageResult, filename);
  
          } else if (croppedImageResult instanceof Blob) {
              // --- Case 2: It's a Blob Object ---
              console.log("Result is a Blob. Creating File directly...");
              // Ensure the blob has a type, default if necessary
              const blobType = croppedImageResult.type || 'image/jpeg';
              imageFile = new File([croppedImageResult], filename, { type: blobType });
  
          } else if (typeof croppedImageResult === 'string' && croppedImageResult.startsWith('blob:')) {
              // --- Case 3: It's a Blob URL ---
              console.log("Result is a Blob URL. Fetching Blob...");
              try {
                  const response = await fetch(croppedImageResult);
                  if (!response.ok) {
                      throw new Error(`Failed to fetch blob: ${response.status} ${response.statusText}`);
                  }
                  const blob = await response.blob();
                   // IMPORTANT: Revoke the temporary blob URL after fetching
                  URL.revokeObjectURL(croppedImageResult);
                  const blobType = blob.type || 'image/jpeg';
                  imageFile = new File([blob], filename, { type: blobType });
                  console.log("Blob fetched and File created from Blob URL.");
              } catch (fetchError) {
                  console.error("Error fetching blob from Blob URL:", fetchError);
                  toast.error("Could not retrieve image data. Please try again.");
                  cancelCrop();
                  return; // Exit if fetch fails
              }
          } else {
              // --- Case 4: Unexpected Format ---
              console.error("getCroppedImg returned an unexpected format:", typeof croppedImageResult);
              toast.error("Failed to process cropped image format. Please try again."); // Your original error
              cancelCrop();
              return; // Exit
          }
  
          // --- Process the imageFile if created successfully ---
          if (imageFile) {
              console.log("Image File created successfully:", imageFile.name, imageFile.size, imageFile.type);
              setValues((prev) => ({ ...prev, [currentPhotoType]: imageFile }));
              cancelCrop(); // Close cropper and reset states
          } else {
              // This might happen if dataURLtoFile returned null or File creation failed
              console.error("Failed to create final image file object.");
              toast.error("Error finalizing image processing.");
              cancelCrop();
          }
  
      } catch (error) {
          // Catch errors from getCroppedImg itself or other await calls
          console.error("Error during image cropping process:", error);
          toast.error(`Failed to crop image: ${error.message || 'Please try again.'}`);
          cancelCrop();
      } finally {
          setCroppingLoading(false);
      }
  // Add dependencies properly
  }, [croppedImageSource, croppedAreaPixels, currentPhotoType, cancelCrop, getCroppedImg, dataURLtoFile]); // Ensure dataURLtoFile is stable or memoized if defined inside component
    const schoolID = localStorage.getItem("SchoolID");

    const handleSaveClick = useCallback(async () => {
        setCroppingLoading(true); // Use the same loading state or a general one
        setIsLoader(true);

        // --- Validation ---
        if (!values.fullName || !values.class || !values.section) {
            toast.warn("Please fill in Full Name, Class, and Section.");
            setIsLoader(false);
            setCroppingLoading(false);
            return;
        }
        if (!values.studentImage) {
            toast.warn("Please capture or provide a student photo.");
             setIsLoader(false);
             setCroppingLoading(false);
             return;
        }

        // --- Prepare Data ---
        let imageToSend = null;
        if (values.studentImage instanceof File) {
            imageToSend = values.studentImage;
        } else if (typeof values.studentImage === 'string') {
             // If it's a string, it must be the initial URL from studentData.
             // We require a new capture/crop if any changes are made.
             // Check if it's *exactly* the initial image URL (if editing)
             const initialImageUrl = studentData?.studentImage?.url || studentData?.studentImage;
             if (values.studentImage === initialImageUrl) {
                 // Option 1: Allow saving without image change (backend needs to handle this)
                 // console.log("Image unchanged. Proceeding without file upload.");
                 // imageToSend = null; // Or send a flag

                 // Option 2 (Implemented): Force re-capture if saving/updating
                 toast.error("Please capture or re-capture the student photo before saving.");
                 setIsLoader(false);
                 setCroppingLoading(false);
                 return;
             } else {
                  // This case shouldn't be reachable if state management is correct
                  toast.error("Invalid image state. Please re-capture the photo.");
                  setIsLoader(false);
                  setCroppingLoading(false);
                  return;
             }
        } else {
             // Should not happen, but catch just in case
             toast.error("Invalid student image state. Please capture a photo.");
             setIsLoader(false);
             setCroppingLoading(false);
             return;
        }

        // --- Create FormData ---
        const studentPayload = {
            schoolId: schoolID,
            studentName: values.fullName,
            class: values.class,
            section: values.section,
        };

        const formDataToSend = new FormData();
        Object.entries(studentPayload).forEach(([key, value]) => {
            formDataToSend.append(key, String(value ?? '')); // Ensure values are strings, handle null/undefined
        });

        // Only append image if it's a File object ready for upload
        if (imageToSend) {
            // Use a more robust filename if possible
            const studentImageFilename = `${values.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'student'}_image.jpeg`;
            formDataToSend.append("studentImage", imageToSend, studentImageFilename);
        }
        // If imageToSend is null (Option 1 above), the 'studentImage' field is just not appended.

        // --- API Call ---
        try {
            console.log("Submitting student data..."); // Avoid logging FormData directly in production

            const response = await initialstudentphoto(formDataToSend);

            if (response?.success) {
                toast.success("Student data saved successfully!");
                setValues({ // Reset form
                    fullName: "",
                    class: "",
                    section: "",
                    studentImage: null,
                });
                // imagePreviewUrl will reset via its useEffect
                if (setReRender) setReRender(prev => !prev);
                if (setIsOpen) setIsOpen(false);
            } else {
                // Try to get a meaningful error message
                const message = response?.message || response?.data?.message || response?.error || "An error occurred during saving.";
                toast.error(message);
            }
        } catch (error) {
            console.error("Error during saving API call:", error);
            let errorMessage = "An unexpected error occurred.";
            if (error.response) {
                // Server responded with a status code outside 2xx range
                errorMessage = `Error: ${error.response.status} - ${error.response.data?.message || error.response.statusText || 'Server error'}`;
            } else if (error.request) {
                // Request was made but no response received
                errorMessage = "No response from server. Check network connection or API endpoint.";
            } else {
                // Something else happened in setting up the request
                errorMessage = error.message || "Error setting up the request.";
            }
            toast.error(errorMessage);
        } finally {
            setCroppingLoading(false);
            setIsLoader(false);
        }
    }, [
        values, // Includes fullName, class, section, studentImage
        schoolID,
        setIsLoader,
        setReRender,
        setIsOpen,
        studentData, // Needed to compare initial image URL
        initialstudentphoto, // API function
        isLoader // Include isLoader if used for disabling button
    ]);


    // --- Main Render ---
    return (
        <>
            {/* --- Webcam Modal --- */}
            <Modal
                open={showWebcam}
                onClose={closeWebcam} // Allow closing by clicking backdrop
                aria-labelledby="webcam-modal-title"
                aria-describedby="webcam-modal-description"
            >
                <Box sx={modalStyle}>
                    <h2 id="webcam-modal-title" className="text-lg font-semibold mb-4">
                        Capture Photo
                    </h2>
                    {/* Conditionally render Webcam *only when modal is open* to ensure it initializes correctly */}
                    {showWebcam && (
                        <div className="w-full relative mb-4">
                            <Webcam
                                audio={false}
                                ref={webcamRef}
                                screenshotFormat="image/png" // Capture as PNG
                                width="100%"
                                height="auto"
                                videoConstraints={{ facingMode: facingMode }}
                                className="rounded"
                                mirrored={facingMode === 'user'} // Mirror front camera
                                onUserMediaError={(err) => {
                                    console.error("Webcam UserMedia Error:", err);
                                    toast.error(`Camera Error: ${err.name}. Check permissions.`);
                                    closeWebcam();
                                }}
                                onUserMedia={() => {
                                    console.log("Webcam stream started");
                                    // Optional: Add a brief delay or check if ref is ready before enabling capture
                                }}
                            />
                            <IconButton
                                onClick={handleSwitchCamera}
                                size="small"
                                sx={{
                                    position: 'absolute',
                                    bottom: 8, // Position at bottom-right
                                    right: 8,
                                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                    color: 'white',
                                    '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.7)' },
                                }}
                                aria-label="Switch camera"
                            >
                                <SwitchCamera size={20} />
                            </IconButton>
                        </div>
                    )}
                    <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%' }}>
                        <Button variant="contained" color="primary" onClick={capturePhoto} disabled={!showWebcam}>
                            Capture
                        </Button>
                        <Button variant="outlined" color="secondary" onClick={closeWebcam}>
                            Cancel
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* --- Conditional Rendering: Cropper OR Form --- */}
            {croppedImageSource ? (
                // --- Render Cropper UI ---
                <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
                    {/* Increased z-index and darker overlay */}
                    <div className="bg-white rounded-lg p-4 w-full max-w-md relative shadow-xl">
                        {/* Loading indicator for cropping */}
                        {croppingLoading && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                                <p className="text-lg font-medium">Processing...</p>
                            </div>
                        )}
                        <p className="text-center font-semibold text-lg mb-3">Crop Your Photo</p>
                        {/* Ensure Cropper container has defined height */}
                        <div className="relative h-64 w-full mb-4 bg-gray-200 rounded overflow-hidden border border-gray-300">
                            <Cropper
                                image={croppedImageSource} // Use the base64 source from capture
                                crop={crop}
                                zoom={zoom}
                                aspect={1} // Keep aspect ratio 1:1 (square)
                                onCropChange={setCrop}
                                onZoomChange={setZoom}
                                onCropComplete={onCropComplete} // Sets croppedAreaPixels on interaction end
                                // Consider adding showGrid={false} if preferred
                            />
                        </div>
                        <div className="flex justify-center items-center mb-4 px-4">
                            <span className="mr-2 text-sm text-gray-600">Zoom:</span>
                            <input
                                type="range"
                                min="1"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-600 accent-[#2fa7db]" // Use accent color
                                disabled={croppingLoading}
                            />
                        </div>
                        <div className="flex justify-end gap-3 mt-2">
                            <Button variant="outlined" color="secondary" onClick={cancelCrop} disabled={croppingLoading}>
                                Cancel
                            </Button>
                            <Button variant="contained" color="primary" onClick={showCroppedImage} disabled={croppingLoading}>
                                {croppingLoading ? "Cropping..." : "Crop & Use"}
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                // --- Render Main Form UI ---
                <div className="selection:bg-[#2fa7db] selection:text-white">
                    <div className="flex justify-center" style={{ minWidth: "min(90vw, 500px)" }}> {/* Adjusted minWidth */}
                        <div className="flex-1 m-2 max-w-lg w-full"> {/* Ensure it takes available width up to max */}
                            <div className="w-full bg-white mx-auto overflow-hidden rounded-lg shadow-md border border-gray-200"> {/* Added subtle border */}
                                <div className="px-6 pt-5 pb-6"> {/* Adjusted padding */}
                                    <h1 className="text-xl font-semibold text-gray-800 mb-5 text-center"> {/* Centered title */}
                                        Student Details
                                    </h1>

                                    {/* Image Preview and Name Section */}
                                    <div className="flex items-center mb-6 gap-4"> {/* Added gap */}
                                        {/* Image Preview Area */}
                                        <div className="relative flex-shrink-0"> {/* Prevent shrinking */}
                                            <div className="relative w-24 h-24 group"> {/* Added group for hover effect */}
                                                {imagePreviewUrl ? (
                                                    <img
                                                        src={imagePreviewUrl}
                                                        alt="Student Preview"
                                                        className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                                                        // onError handling can be added if needed
                                                    />
                                                ) : (
                                                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300"> {/* Dashed border */}
                                                        <Camera size={30} className="text-gray-400" />
                                                    </div>
                                                )}
                                                {/* Capture Button */}
                                                <button
                                                    type="button"
                                                    onClick={() => openWebcam('studentImage')}
                                                    className="absolute -bottom-1 -right-1 bg-[#ee582c] text-white p-2 rounded-full cursor-pointer hover:bg-[#d74f20] transition duration-200 shadow-md transform group-hover:scale-110" // Hover effect
                                                    aria-label="Capture or change student photo"
                                                    title="Capture Photo" // Tooltip
                                                >
                                                    <Camera size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        {/* Full Name Input (Floating Label Style) */}
                                        <div className="relative flex-grow">
                                            <input
                                                type="text"
                                                name="fullName"
                                                placeholder=" " // Necessary for floating label effect
                                                value={values.fullName}
                                                onChange={handleInputChange}
                                                id="fullName"
                                                className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600 bg-transparent text-base"
                                                required
                                                autoComplete="name"
                                            />
                                            <label
                                                htmlFor="fullName"
                                                className="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#d74f20] peer-focus:text-sm" // Adjusted focus color
                                            >
                                                Student Full Name *
                                            </label>
                                        </div>
                                    </div>

                                    {/* Class and Section Selects */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-6 mt-4"> {/* Responsive grid and gap */}
                                        {/* Class Select */}
                                        <FormControl
                                            variant="standard"
                                            required
                                            fullWidth
                                            sx={{
                                                "& .MuiInputLabel-root": { color: "#ee582c" },
                                                "& .MuiInputLabel-root.Mui-focused": { color: "#d74f20" }, // Focused label color
                                                "& .MuiInputBase-input": { color: "#2fa7db", pb: 0.5 }, // Input text color + padding bottom
                                                "& .MuiSelect-icon": { color: "#ee582c" },
                                                "& .MuiInput-underline:before": { borderBottom: "2px solid #ee582c" },
                                                "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: '#d74f20' },
                                                "& .MuiInput-underline:after": { borderBottom: "2px solid #d74f20" }, // Focused underline
                                                "& .MuiInputBase-root": { marginTop: '16px' } // Adjust spacing if needed
                                            }}
                                        >
                                            <InputLabel id="class-select-label">Class *</InputLabel>
                                            <Select
                                                labelId="class-select-label"
                                                id="class-select"
                                                value={values.class}
                                                onChange={handleClassChange}
                                                name="class"
                                                label="Class *" // Accessibility
                                                sx={{ "&:focus": { backgroundColor: 'transparent' } }} // Remove focus background
                                            >
                                                <MenuItem value="" disabled><em>Select a Class</em></MenuItem>
                                                {getClass?.map((cls, index) => (
                                                    <MenuItem key={`${cls.className}-${index}`} value={cls.className}>
                                                        {cls?.className}
                                                    </MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>

                                        {/* Section Select */}
                                        <FormControl
                                            variant="standard"
                                            required
                                            fullWidth
                                            disabled={!values.class || availableSections.length === 0}
                                            sx={{
                                                "& .MuiInputLabel-root": { color: "#ee582c" },
                                                 "& .MuiInputLabel-root.Mui-focused": { color: "#d74f20" },
                                                "& .MuiInputBase-input": { color: "#2fa7db", pb: 0.5 },
                                                "& .MuiSelect-icon": { color: "#ee582c" },
                                                "& .MuiInput-underline:before": { borderBottom: "2px solid #ee582c" },
                                                "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: '#d74f20' },
                                                "& .MuiInput-underline:after": { borderBottom: "2px solid #d74f20" },
                                                "& .MuiInputBase-root": { marginTop: '16px' },
                                                // Disabled state styles
                                                "&.Mui-disabled": {
                                                    "& .MuiInput-underline:before": { borderBottomStyle: 'dotted', borderBottomColor: "#bdbdbd" }, // Dotted line when disabled
                                                    "& .MuiInputLabel-root": { color: "#bdbdbd" },
                                                    "& .MuiSelect-icon": { color: "#bdbdbd" },
                                                    "& .MuiInputBase-input": { color: "#bdbdbd" },
                                                }
                                            }}
                                        >
                                            <InputLabel id="section-select-label">Section *</InputLabel>
                                            <Select
                                                labelId="section-select-label"
                                                id="section-select"
                                                value={values.section}
                                                onChange={handleSectionChange}
                                                name="section"
                                                label="Section *" // Accessibility
                                                sx={{ "&:focus": { backgroundColor: 'transparent' } }}
                                            >
                                                {/* Provide clearer placeholder/disabled messages */}
                                                <MenuItem value="" disabled>
                                                    <em>{!values.class ? 'Select Class First' : 'Select a Section'}</em>
                                                </MenuItem>
                                                {availableSections.length > 0 ? (
                                                    availableSections.map((sec, index) => (
                                                        <MenuItem key={`${sec}-${index}`} value={sec}>{sec}</MenuItem>
                                                    ))
                                                ) : (
                                                     values.class && <MenuItem disabled sx={{ fontStyle: 'italic', color: '#9e9e9e' }}>No Sections Available</MenuItem>
                                                )}
                                            </Select>
                                        </FormControl>
                                    </div>
                                </div>
                                {/* Save Button Area */}
                                <div className="px-6 pb-5 pt-3 bg-gray-50 rounded-b-lg border-t border-gray-200"> {/* Subtle background */}
                                    {buttonLabel && (
                                        <Button
                                            type="button"
                                            variant="contained" // Use contained button for primary action
                                            fullWidth
                                            onClick={handleSaveClick}
                                            disabled={croppingLoading || isLoader} // Use combined loading state
                                            sx={{
                                                py: 1.2, // Adjust padding
                                                textTransform: 'none', // Keep button text case
                                                fontSize: '1rem',
                                                backgroundColor: '#2fa7db',
                                                '&:hover': { backgroundColor: '#248db4' },
                                                '&.Mui-disabled': { backgroundColor: '#bdbdbd', color: '#757575' } // Disabled style
                                            }}
                                        >
                                            {croppingLoading || isLoader ? "Saving..." : buttonLabel}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default DynamicFormFileds;




// import React, { useState, useCallback, useEffect, useRef } from "react";
// import { Camera } from "lucide-react";
// import Cropper from "react-easy-crop";
// import Webcam from "react-webcam";
// import {
//   FormControl,
//   InputLabel,
//   Select,
//   // TextField, // Currently not used, can be removed if not needed later
//   MenuItem,
//   Modal,
//   Box,
//   Button,
// } from "@mui/material";
// import { initialstudentphoto } from "../../Network/ThirdPartyApi"; // Ensure this path is correct
// import { toast } from "react-toastify";
// import { useStateContext } from "../../contexts/ContextProvider"; // Ensure this path is correct
// import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg"; // Ensure this path is correct

// // --- Modal Style ---
// const modalStyle = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: '90%', // Responsive width
//   maxWidth: 500, // Max width for larger screens
//   bgcolor: 'background.paper',
//   border: '1px solid #ccc', // Softer border
//   borderRadius: '8px', // Rounded corners
//   boxShadow: 24,
//   p: 4,
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
// };

// function DynamicFormFileds(props) {
//   const { studentData, buttonLabel = "Save", setIsOpen, setReRender } = props; // Added default for buttonLabel
//   // console.log("studentData", studentData); // Keep for debugging if needed
//   const { currentColor, isLoader, setIsLoader } = useStateContext(); // currentColor is unused here, can be removed if not needed
//   const [getClass, setGetClass] = useState([]);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [values, setValues] = useState({
//     fullName: "",
//     class: "",
//     section: "",
//     studentImage: null, // Can be a URL string initially, or a File object after capture/crop
//   });

//   // --- Webcam State ---
//   const [showWebcam, setShowWebcam] = useState(false);
//   const webcamRef = useRef(null);
//   const [currentPhotoType, setCurrentPhotoType] = useState(null);

//   // --- Cropper State ---
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//   const [croppedImageSource, setCroppedImageSource] = useState(null); // Data URL source for Cropper
//   const [loading, setLoading] = useState(false); // Local loading state for submit

//   useEffect(() => {
//     const classes = JSON.parse(localStorage.getItem("classes"));
//     if (classes) {
//       setGetClass(classes);
//     }
//   }, []);

//   // --- Populate available sections when class changes ---
//   useEffect(() => {
//     if (values.class && getClass.length > 0) {
//         const selectedClassObj = getClass.find((cls) => cls.className === values.class);
//         if (selectedClassObj && selectedClassObj.sections) {
//             const sectionsArray = Array.isArray(selectedClassObj.sections)
//                 ? selectedClassObj.sections
//                 : String(selectedClassObj.sections).split(/\s*,\s*/).filter(Boolean);
//             setAvailableSections(sectionsArray);
//         } else {
//             setAvailableSections([]);
//         }
//     } else {
//       setAvailableSections([]);
//     }
//   }, [values.class, getClass]);


//   // --- Populate form if studentData exists ---
//   useEffect(() => {
//     if (studentData) {
//       const initialStudentImage = studentData.studentImage?.url || studentData.studentImage || null;
//       setValues(prev => ({
//         ...prev,
//         fullName: studentData.fullName || "",
//         class: studentData.class || "",
//         section: studentData.section || "",
//         studentImage: initialStudentImage, // Will be URL string initially
//       }));

//       // Pre-populate sections if class is loaded from studentData
//        if (studentData.class && getClass.length > 0) {
//          const selectedClassObj = getClass.find((cls) => cls.className === studentData.class);
//          if (selectedClassObj && selectedClassObj.sections) {
//              const sectionsArray = Array.isArray(selectedClassObj.sections)
//                  ? selectedClassObj.sections
//                  : String(selectedClassObj.sections).split(/\s*,\s*/).filter(Boolean);
//              setAvailableSections(sectionsArray);
//          } else {
//              setAvailableSections([]);
//          }
//        }
//     }
//      // Cleanup function to revoke object URL if component unmounts while previewing a File
//      return () => {
//         if (values.studentImage instanceof File) {
//           URL.revokeObjectURL(values.studentImage); // Use the correct object to revoke
//         }
//       };
//   }, [studentData, getClass]); // Run when studentData or getClass changes

//   // --- Handle input changes ---
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setValues({ ...values, [name]: value });
//   };


//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setValues((prevData) => ({
//       ...prevData,
//       class: selectedClassName,
//       section: "", // Reset section
//     }));
//   };

//   const handleSectionChange = (e) => {
//     setValues((prevData) => ({
//       ...prevData,
//       section: e.target.value,
//     }));
//   };

//   const schoolID = localStorage.getItem("SchoolID");

//   // --- Webcam Functions ---
//   const openWebcam = (photoType) => {
//     setCurrentPhotoType(photoType);
//     setShowWebcam(true);
//   };

//   const capturePhoto = useCallback(() => {
//     if (webcamRef.current) {
//       // Capture as PNG for best quality during cropping
//       const imageSrc = webcamRef.current.getScreenshot({ type: 'image/png', quality: 1 });
//       if (imageSrc) {
//         setShowWebcam(false);
//         setCroppedImageSource(imageSrc); // Set PNG data URL for the cropper
//       } else {
//         console.error("Could not capture screenshot.");
//         toast.error("Could not capture photo. Please try again.");
//         setShowWebcam(false);
//       }
//     }
//   }, [webcamRef]);

//   const closeWebcam = () => {
//     setShowWebcam(false);
//     setCurrentPhotoType(null);
//   };


//   // --- Cropper Functions ---
//   const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
//     setCroppedAreaPixels(croppedAreaPixels);
//   }, []);

//   const cancelCrop = useCallback(() => {
//     setCroppedImageSource(null);
//     setCurrentPhotoType(null);
//     setCroppedAreaPixels(null);
//     setCrop({ x: 0, y: 0 });
//     setZoom(1);
//   }, []);

//   // Process Cropped Image (Convert to JPEG File)
//   const showCroppedImage = async () => {
//     if (!croppedImageSource || !croppedAreaPixels || !currentPhotoType) return;

//     setLoading(true); // Show loading state during conversion
//     try {
//       // Get cropped image data URL (likely base64 PNG from getCroppedImg)
//       const croppedImageUrl = await getCroppedImg(
//         croppedImageSource,
//         croppedAreaPixels
//       );

//       // Helper function to convert Data URL/Blob URL to a JPEG File object
//       const getFileFromUrl = (url, fileName = "image.jpeg", mimeType = 'image/jpeg', quality = 0.9) => {
//         return new Promise((resolve, reject) => {
//           const img = new Image();
//           img.onload = () => {
//             const canvas = document.createElement('canvas');
//             canvas.width = img.naturalWidth;
//             canvas.height = img.naturalHeight;
//             const ctx = canvas.getContext('2d');
//             ctx.drawImage(img, 0, 0);
//             // Convert canvas to JPEG blob
//             canvas.toBlob((blob) => {
//               if (blob) {
//                 resolve(new File([blob], fileName, { type: mimeType }));
//               } else {
//                 reject(new Error("Canvas toBlob failed to create JPEG."));
//               }
//             }, mimeType, quality); // Specify JPEG format and quality
//           };
//           img.onerror = (err) => {
//             console.error("Image load error for canvas conversion:", err);
//             reject(err);
//           };
//           img.src = url; // Load the cropped image data URL
//         });
//       };

//       // Generate a filename (e.g., studentImage_1678886400000.jpeg)
//       const filename = `${currentPhotoType}_${Date.now()}.jpeg`;

//       // Convert cropped image data URL to a JPEG File
//       const imageFile = await getFileFromUrl(croppedImageUrl, filename, 'image/jpeg');

//       // Clean up previous object URL if it exists and is a File
//        if (values[currentPhotoType] instanceof File) {
//            URL.revokeObjectURL(values[currentPhotoType]); // Revoke old preview URL
//        }


//       // Update state with the new JPEG File object
//       setValues((prev) => ({ ...prev, [currentPhotoType]: imageFile }));

//       // Reset cropper state
//       cancelCrop();

//     } catch (error) {
//       console.error("Error cropping image:", error);
//       toast.error("Failed to process cropped image. Please try again.");
//       cancelCrop(); // Ensure cropper closes on error
//     } finally {
//        setLoading(false);
//     }
//   };

//    // --- Handle Form Submission ---
//    const handleSaveClick = async () => {
//      setLoading(true);
//      setIsLoader(true);

//      try {
//        // Validation
//        if (!values.fullName || !values.class || !values.section || !values.studentImage) {
//          toast.warn("Please fill all required fields and add a student photo.");
//          setIsLoader(false);
//          setLoading(false);
//          return;
//        }
//        // Ensure the image is a File object before sending
//        if (!(values.studentImage instanceof File)) {
//          toast.error("Invalid student image. Please capture or upload a photo again.");
//          setIsLoader(false);
//          setLoading(false);
//          return;
//        }


//        const studentPayload = {
//          schoolId: schoolID,
//          studentName: values.fullName,
//          class: values.class,
//          section: values.section,
//        };

//        const formDataToSend = new FormData();

//        Object.entries(studentPayload).forEach(([key, value]) => {
//          formDataToSend.append(key, String(value));
//        });

//        // Append the final JPEG File object for the student image
//        const studentImageFilename = `${values.fullName.replace(/\s+/g, '_') || 'student'}_image.jpeg`;
//        formDataToSend.append("studentImage", values.studentImage, studentImageFilename); // Send as JPEG

//        // TODO: Add logic here to append other images (fatherImage, motherImage) if they exist and are Files


//        console.log("FormData sending:", /* DON'T log formDataToSend directly */ ); // Can't log FormData directly easily
//        // Log entries individually if needed for debugging:
//        // for (let pair of formDataToSend.entries()) { console.log(pair[0]+ ', ' + pair[1]); }

//        const response = await initialstudentphoto(formDataToSend);

//        if (response.success) {
//          toast.success("Student data saved successfully!");
//          setValues({ // Reset form
//            fullName: "",
//            class: "",
//            section: "",
//            studentImage: null,
//          });
//          if (setReRender) setReRender(prev => !prev); // Trigger re-render in parent
//          if (setIsOpen) setIsOpen(false); // Close the parent modal/form
//        } else {
//          toast.error(response?.message || response?.data?.message || "An error occurred during saving.");
//        }
//      } catch (error) {
//        console.error("Error during saving:", error);
//        let errorMessage = "An unexpected error occurred.";
//        if (error.response) {
//           if (error.response.status === 400) {
//            errorMessage = error.response.data?.message || "Invalid data. Please check your inputs.";
//           } else if (error.response.status === 500) {
//            errorMessage = "Server error. Please try again later.";
//           }
//        } else if (error.request) {
//            errorMessage = "No response from server. Check your network connection.";
//        } else if (error.message) {
//            errorMessage = error.message;
//        }
//        toast.error(errorMessage);
//      } finally {
//        setLoading(false);
//        setIsLoader(false);
//      }
//    };


//   // --- Render Cropper UI ---
//   if (croppedImageSource) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
//         <div className="bg-white rounded-lg p-4 w-full max-w-md relative"> {/* Adjusted max width */}
//          {loading && (
//              <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
//                  <p>Processing...</p> {/* Or use a spinner */}
//              </div>
//          )}
//           <p className="text-center font-semibold mb-2">Crop Your Photo</p>
//           <div className="relative h-64 w-full mb-4 bg-gray-200 rounded overflow-hidden">
//             <Cropper
//               image={croppedImageSource}
//               crop={crop}
//               zoom={zoom}
//               aspect={1} // Square aspect ratio
//               onCropChange={setCrop}
//               onZoomChange={setZoom}
//               onCropComplete={onCropComplete}
//             />
//           </div>
//           <div className="flex justify-center items-center mb-4 px-4">
//                <span className="mr-2 text-sm">Zoom:</span>
//                <input
//                    type="range"
//                    min="1"
//                    max="3"
//                    step="0.1"
//                    value={zoom}
//                    onChange={(e) => setZoom(Number(e.target.value))}
//                    className="w-full" // Take full width within flex item
//                />
//           </div>
//           <div className="flex justify-end gap-3">
//             <Button variant="outlined" color="secondary" onClick={cancelCrop} disabled={loading}>
//               Cancel
//             </Button>
//             <Button variant="contained" color="primary" onClick={showCroppedImage} disabled={loading}>
//               Crop & Save
//             </Button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // Determine the preview source URL
//   let imagePreviewUrl = null;
//   if (values.studentImage instanceof File) {
//     imagePreviewUrl = URL.createObjectURL(values.studentImage);
//   } else if (typeof values.studentImage === 'string') {
//     imagePreviewUrl = values.studentImage; // Assumes it's a valid URL from initial data
//   }


//   // --- Render Main Form ---
//   return (
//     <>
//       {/* --- Webcam Modal --- */}
//       <Modal
//         open={showWebcam}
//         onClose={closeWebcam}
//         aria-labelledby="webcam-modal-title"
//         aria-describedby="webcam-modal-description"
//       >
//         <Box sx={modalStyle}>
//           <h2 id="webcam-modal-title" className="text-lg font-semibold mb-4">
//             Capture Photo
//           </h2>
//           {showWebcam && (
//              <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/png" // Capture PNG for quality, convert later
//                 width="100%"
//                 height="auto"
//                 videoConstraints={{ facingMode: "user" }}
//                 className="rounded" // Add some rounding
//              />
//           )}
//           <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around', width: '100%' }}>
//             <Button variant="contained" color="primary" onClick={capturePhoto}>
//               Capture
//             </Button>
//             <Button variant="outlined" color="secondary" onClick={closeWebcam}>
//               Cancel
//             </Button>
//           </Box>
//         </Box>
//       </Modal>

//       {/* --- Main Form Layout --- */}
//       <div className="selection:bg-[#2fa7db] selection:text-white">
//         {/* Adjusted minWidth for potentially smaller viewports */}
//         <div className="flex justify-center" style={{ minWidth: "min(90vw, 600px)" }}>
//           <div className="flex-1 m-2 max-w-lg"> {/* Added max-width */}
//             <div className="w-full bg-white mx-auto overflow-hidden rounded-lg shadow-md"> {/* Added rounding and shadow */}
//               <div className="px-5 pt-4 pb-5"> {/* Adjusted padding */}
//                 <h1 className="text-xl font-semibold text-gray-700 mb-4">
//                   Student Details
//                 </h1>

//                 <div className="flex items-center mb-6"> {/* Centered items */}
//                   {/* Image Preview and Capture Button */}
//                   <div className="relative mr-4"> {/* Added margin */}
//                     <div className="relative w-24 h-24">
//                         {imagePreviewUrl ? (
//                           <img
//                             src={imagePreviewUrl}
//                             alt="Student Preview"
//                             className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
//                             // Clean up object URL when component unmounts or image changes
//                             // Handled in useEffect cleanup and showCroppedImage
//                           />
//                         ) : (
//                           <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
//                             <Camera size={30} className="text-gray-400" />
//                           </div>
//                         )}
//                          {/* Camera Icon Button */}
//                          <button
//                             type="button"
//                             onClick={() => openWebcam('studentImage')}
//                             className="absolute bottom-0 right-0 bg-[#ee582c] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#d74f20] transition duration-200 shadow-sm"
//                             aria-label="Capture student photo"
//                          >
//                             <Camera size={16} />
//                          </button>
//                      </div>
//                   </div>
//                    {/* Student Name Input (moved next to image) */}
//                    <div className="relative flex-grow">
//                       <input
//                           type="text"
//                           name="fullName"
//                           placeholder=" " // Important for label animation
//                           value={values.fullName}
//                           onChange={handleInputChange}
//                           id="fullName"
//                           className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600 bg-transparent" // Added bg-transparent
//                           required
//                       />
//                       <label
//                           htmlFor="fullName"
//                           className="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#9ca3af] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
//                       >
//                           Student Full Name *
//                       </label>
//                     </div>
//                 </div>

//                 {/* Form Fields Below Image/Name */}
//                 {/* <form className="" action="" method="POST"> */} {/* No need for form tag if using button onClick */}
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 mt-4"> {/* Grid layout */}
//                     {/* Class Select */}
//                     <FormControl
//                       variant="standard"
//                       required
//                       fullWidth // Takes full width of its grid cell
//                       sx={{
//                         // Common styles
//                         "& .MuiInputLabel-root": { color: "#ee582c" },
//                         "& .MuiInputBase-input": { color: "#2fa7db" }, // Target input text color
//                         "& .MuiSelect-icon": { color: "#ee582c" },
//                         "& .MuiInput-underline:before": { borderBottom: "2px solid #ee582c" },
//                         "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: '#d74f20' }, // Darker hover
//                         "& .MuiInput-underline:after": { borderBottom: "2px solid #d74f20" }, // Focus underline
//                         "& label.Mui-focused": { color: '#ee582c' },
//                         "& .MuiInputBase-root": { marginTop: '16px' } // Add margin to align with label transition
//                       }}
//                     >
//                       <InputLabel id="class-select-label">
//                         Class *
//                       </InputLabel>
//                       <Select
//                         labelId="class-select-label"
//                         id="class-select"
//                         value={values.class}
//                         onChange={handleClassChange}
//                         // label="Class *" // Label provided by InputLabel
//                         name="class"
//                          sx={{
//                            "&:focus": { backgroundColor: 'transparent' }
//                          }}
//                       >
//                         <MenuItem value="" disabled><em>Select a Class</em></MenuItem>
//                         {getClass?.map((cls, index) => (
//                           <MenuItem key={`${cls.className}-${index}`} value={cls.className}>
//                             {cls?.className}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>

//                     {/* Section Select */}
//                     <FormControl
//                       variant="standard"
//                       required
//                       fullWidth
//                       disabled={!values.class || availableSections.length === 0}
//                       sx={{
//                         // Common styles (inherited or slightly adapted)
//                         "& .MuiInputLabel-root": { color: "#ee582c" },
//                         "& .MuiInputBase-input": { color: "#2fa7db" },
//                         "& .MuiSelect-icon": { color: "#ee582c" },
//                         "& .MuiInput-underline:before": { borderBottom: "2px solid #ee582c" },
//                          "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: '#d74f20' },
//                         "& .MuiInput-underline:after": { borderBottom: "2px solid #d74f20" },
//                         "& label.Mui-focused": { color: '#ee582c' },
//                         "& .MuiInputBase-root": { marginTop: '16px' }, // Align label
//                          // Disabled state
//                          "&.Mui-disabled": {
//                            "& .MuiInput-underline:before": { borderBottom: "2px solid #bdbdbd" },
//                            "& .MuiInputLabel-root": { color: "#bdbdbd" },
//                            "& .MuiSelect-icon": { color: "#bdbdbd" },
//                            "& .MuiInputBase-input": { color: "#bdbdbd" }, // Disabled text color
//                          }
//                       }}
//                     >
//                       <InputLabel id="section-select-label">
//                         Section *
//                       </InputLabel>
//                       <Select
//                         labelId="section-select-label"
//                         id="section-select"
//                         value={values.section}
//                         onChange={handleSectionChange}
//                         // label="Section *"
//                         name="section"
//                          sx={{
//                            "&:focus": { backgroundColor: 'transparent' }
//                          }}
//                       >
//                         <MenuItem value="" disabled><em>Select a Section</em></MenuItem>
//                         {availableSections.length > 0 ? (
//                           availableSections.map((sec, index) => (
//                             <MenuItem key={`${sec}-${index}`} value={sec}>{sec}</MenuItem>
//                           ))
//                         ) : (
//                           <MenuItem disabled sx={{ fontStyle: 'italic', color: '#bdbdbd' }}>
//                              {values.class ? 'No Sections Available' : 'Select Class First'}
//                           </MenuItem>
//                         )}
//                       </Select>
//                     </FormControl>
//                   </div>
//                 {/* </form> */}
//               </div>
//               <div className="px-6 pb-6 pt-2 bg-white rounded-b-lg">
//                  {/* Submit Button */}
//                 {buttonLabel && ( // Render button only if label is provided
//                   <button
//                     type="button"
//                     className={`w-full text-white rounded-md py-2.5 transition duration-200 text-base font-medium ${loading || isLoader ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2fa7db] hover:bg-[#248db4]'}`}
//                     onClick={handleSaveClick}
//                     disabled={loading || isLoader}
//                   >
//                     {loading ? "Saving..." : buttonLabel}
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

// export default DynamicFormFileds;





//   import React, { useState, useCallback, useEffect } from "react";
//   import { Camera } from "lucide-react";
//   import Cropper from "react-easy-crop";
//   import { FormControl, InputLabel, Select, TextField,MenuItem  } from "@mui/material";
//   import {
//     initialstudentphoto,
//   } from "../../Network/ThirdPartyApi";
//   import { toast } from "react-toastify";
//   import { useStateContext } from "../../contexts/ContextProvider";
//   import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg";
//   function DynamicFormFileds(props) {
//     const { studentData, buttonLabel, setIsOpen, setReRender } = props;
//     console.log("studentData",studentData)
//     const { currentColor, isLoader, setIsLoader } = useStateContext();
//     const [getClass, setGetClass] = useState([]);
//   const [availableSections, setAvailableSections] = useState([]);
//     const [values, setValues] = useState({
//       fullName: "",
//       class: "",
//       section: "",
    
//     });
  
//     useEffect(() => {
//       const classes = JSON.parse(localStorage.getItem("classes"));
//       if (classes) {
//         setGetClass(classes);
//       }
//     }, []);

//     useEffect(() => {
//         if (studentData) {
    
//           const selectedClassObj = getClass.find((cls) => cls.className === studentData.class);
//           if (selectedClassObj && selectedClassObj.sections) {
//             setAvailableSections(selectedClassObj.sections.split(/\s*,\s*/));
//           }
//         }
//       }, [studentData, getClass]);
    
//     useEffect(() => {
//       const classes = JSON.parse(localStorage.getItem("classes"));
//       if (classes) {
//         setGetClass(classes);
//       }
//     }, []);
    
//     const handleClassChange = (e) => {
//       const selectedClassName = e.target.value;
    
//       setValues((prevData) => ({
//         ...prevData,
//         class: selectedClassName,
//         section: "", // Reset section when class changes
//       }));
//       const selectedClassObj = getClass.find((cls) => cls.className === selectedClassName);
//       if (selectedClassObj && selectedClassObj.sections) {
//         setAvailableSections(
//           Array.isArray(selectedClassObj.sections) ? selectedClassObj.sections : selectedClassObj.sections.split(/\s*,\s*/)
//         );
//       } else {
//         setAvailableSections([]);
//       }
//     };
    
//     // 🟢 Section Change Handle Karna
//     const handleSectionChange = (e) => {
//       setValues((prevData) => ({
//         ...prevData,
//         section: e.target.value,
//       }));
//     };
//     const schoolID = localStorage.getItem("SchoolID");

//     // const handleImageChange = (e, photoType) => {
//     //   if (!["image/jpeg", "image/png"].includes(file.type)) {
//     //     alert("Please upload a JPEG or PNG image.");
//     //     return;
//     //   }
//     //   const file = e.target.files[0];
//     //   if (!file) return;
    
//     //   // File size check (5 MB limit)
//     //   if (file.size > 5 * 1024 * 1024) {
//     //     alert("File size is too large! (Max 5 MB)");
//     //     return;
//     //   }
    
//     //   setCurrentPhotoType(photoType);
//     //   const reader = new FileReader();
//     //   reader.onloadend = () => {
//     //     setCroppedImageSource(reader.result);
//     //   };
//     //   reader.readAsDataURL(file);
//     // };
//     const handleImageChange = (e, photoType) => {
//       const file = e.target.files[0];
//       if (!file) return;
    
//       if (!["image/jpeg", "image/png"].includes(file.type)) {
//         alert("Please upload a JPEG or PNG image.");
//         return;
//       }
    
//       // File size check (5 MB limit)
//       if (file.size > 5 * 1024 * 1024) {
//         alert("File size is too large! (Max 5 MB)");
//         return;
//       }
    
//       setCurrentPhotoType(photoType);
//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setCroppedImageSource(reader.result);
//       };
//       reader.readAsDataURL(file);
//     };
    
//     const handleSaveClick = async () => {
    
//       setLoading(true);
//       setIsLoader(true);

//       try {
//         const studentData = {
//           schoolId: schoolID,
//           studentName: values?.fullName || "",
//           class: values?.class || "",
//           section: values?.section || "",
//         };

//         const formDataToSend = new FormData();

//         Object.entries(studentData).forEach(([key, value]) => {
//           formDataToSend.append(key, String(value));
//         });

//         if (values.studentImage) {
//           formDataToSend.append("studentImage", values.studentImage);
//         }
      

//         const response = await initialstudentphoto(formDataToSend);

//         if (response.success) {
//           setIsLoader(false);
//           setValues({
//             admissionNumber: "",
//             studentName: "",
//             class: "",
//             section: "",
          
//           });
//           toast.success("Admission successfully!");
//           setReRender(true);
//           setIsOpen(false);
//         } else {
//           toast.error(response?.message)
//           setIsLoader(false);
//           toast.error(response?.data?.message);
//         }
//       } catch (error) {
//         setIsLoader(false);
//         console.error("Error during admission:", error);
//         if (error.response && error.response.status === 400) {
//           toast.error("Invalid data. Please check your inputs.");
//         } else if (error.response && error.response.status === 500) {
//           toast.error("Server error. Please try again later.");
//         } else {
//           console.log("An unexpected error occurred.");
//         }
//       } finally {
//         setLoading(false);
//         setIsLoader(false);
//       }
//     };

//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//     const [croppedImageSource, setCroppedImageSource] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [currentPhotoType, setCurrentPhotoType] = useState(null);
//     const handleInputChange = (e) => {
//       const { name, value } = e.target;
//       setValues({ ...values, [name]: value });

//     };
  
//     const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//       setCroppedAreaPixels(croppedAreaPixels);
//     }, []);

//     const cancelCrop = useCallback(() => {
//       setCroppedImageSource(null);
//     }, [setCroppedImageSource]);

//     const showCroppedImage = async () => {
//       try {
//         const croppedImageUrl = await getCroppedImg(
//           croppedImageSource,
//           croppedAreaPixels
//         );
//         setCroppedImageSource(null);
//         const getFileFromUrl = async (url, fileName = "image.jpeg") => {
//           const data = await fetch(url);
//           const blob = await data.blob();
    
//           // Convert blob to JPEG format using canvas
//           return new Promise((resolve) => {
//             const img = new Image();
//             img.src = URL.createObjectURL(blob);
//             img.onload = () => {
//               const canvas = document.createElement("canvas");
//               canvas.width = img.width;
//               canvas.height = img.height;
//               const ctx = canvas.getContext("2d");
//               ctx.drawImage(img, 0, 0);
//               canvas.toBlob((jpegBlob) => {
//                 const file = new File([jpegBlob], fileName, {
//                   type: "image/jpeg",
//                 });
//                 resolve(file);
//               }, "image/jpeg", 0.9); // 0.9 = Image Quality
//             };
//           });
//         };
    
//         // Convert cropped image to JPEG File
//         const imageFile = await getFileFromUrl(croppedImageUrl, `${currentPhotoType}.jpeg`);
    
//         // Update state with image file
//         switch (currentPhotoType) {
//           case "fatherImage":
//             setValues((prev) => ({ ...prev, fatherImage: imageFile }));
//             break;
//           case "motherImage":
//             setValues((prev) => ({ ...prev, motherImage: imageFile }));
//             break;
//           case "guardianImage":
//             setValues((prev) => ({ ...prev, guardianImage: imageFile }));
//             break;
//           default:
//             setValues((prev) => ({ ...prev, studentImage: imageFile }));
//             break;
//         }
    
//         setCurrentPhotoType(null);
//       } catch (error) {
//         console.error("Error cropping image:", error);
//       }
//     };
    

//     if (croppedImageSource) {
//       return (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
    
//         >
//           <div className="bg-white rounded-lg p-4 w-full max-[90vw]"
          
//           style={{
//             width:"90vw"
//           }}
//           >
//             <div className="relative h-64 w-full"
//             >
//               <Cropper
//                 image={croppedImageSource}
//                 crop={crop}
//                 zoom={zoom}
//                 aspect={1}
//                 onCropChange={setCrop}
//                 onZoomChange={setZoom}
//                 onCropComplete={onCropComplete}
//               />
//             </div>
//             <div className="flex justify-end gap-2 mt-4">
//               <button
//                 onClick={() => setCroppedImageSource(null)}
//                 className="px-4 py-2 bg-gray-200 rounded-md"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={showCroppedImage}
//                 className="px-4 py-2 bg-blue-500 text-white rounded-md"
//               >
//                 Crop
//               </button>
//             </div>
//           </div>
//         </div>
//       );
//     }

//     return (
//       <>
//         <div class="selection:bg-[#2fa7db] selection:text-white">
//           <div class=" flex justify-center "
//               style={{minWidth:"90vw"}}
          
//           >
//             <div class="flex-1 m-2">
//               <div class="w-full bg-white  mx-auto overflow-hidden ">
//                 <div
//                   class="relative h-[130px] px-5 pt-1
//                 rounded-bl-4xl"
//                 >
//                   <h1 class="absolute top-0  text-xl font-semibold text-white pl-2">
//                     Student Details
//                   </h1>
              
//                   <div className="flex ml-2 mb-6">
//                     <div className="absolute top-5">
//                       {values?.studentImage ? (
//                         <img
//                           src={
//                             values.studentImage instanceof File
//                               ? URL.createObjectURL(values.studentImage)
//                               : values.studentImage
//                               // : values.studentImage?.url
//                           }
//                           alt="studentImage"
//                           className="w-20 h-20 rounded-full object-cover"
//                         />
//                       ) : (
//                         <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
//                           <span className="text-[#ee582c]">NO IMAGE</span>
//                         </div>
//                       )}
//                       <label className="absolute bottom-0 right-0 bg-[#ee582c] text-white p-2 rounded-full cursor-pointer">
//                         <Camera size={18} />
//                         <input
//   type="file"
//   accept="image/jpeg,image/png"
//   capture="environment"
//   onChange={(e) => handleImageChange(e, "studentImage")}
// />

//                         {/* <input
//                           type="file"
//                           className="hidden"
//                           // accept="image/*"
//                           capture="environment" // Opens the back camera; use "user" for the front camera
//                           // capture="user" // Opens the back camera; use "user" for the front camera
//                           onChange={(e) => handleImageChange(e, "studentImage")}
//                         /> */}
//                       </label>
//                     </div>
//                   </div>
//                 </div>
//                 <div class="px-6 pb-8 bg-white rounded-tr-4xl ">
//                   <form class="" action="" method="POST">
//                     <div class="relative mt-4">
//                       <input
//                         type="text"
//                         name="fullName"
//                         placeholder="Student Name"
//                         value={values?.fullName}
//                         onChange={handleInputChange}
//                         id="fullName"
//                         className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
//                       />
//                       <label
//                         for="fullName"
//                         class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
//                       >
//                         Student Name
//                       </label>
//                     </div>
                  
                
//                     <div className="flex justify-center items-center gap-2">
//                         <FormControl
//                           variant="standard"
//                           sx={{
//                             mt: 1,
//                             width: "100%",
//                             "& .MuiInputLabel-root": { color: "#ee582c" },
//                             "& .MuiSelect-root": { color: "#2fa7db" },
//                             "& .MuiSelect-icon": { color: "#ee582c" },
//                             "&:before": { borderBottom: "2px solid #ee582c" },
//                             "&:after": { borderBottom: "2px solid #ee582c" },
//                           }}
//                         >
//                           <InputLabel id="demo-simple-select-standard-label">
//                             Class
//                           </InputLabel>
//                           <Select
//                           value={values.class} 
//                             labelId="demo-simple-select-standard-label"
//                             id="demo-simple-select-standard"
//                             // value={selectedClass}
//                             onChange={handleClassChange}
//                             label="Class"
//                             name="class"
//                             sx={{
//                               color: "#2fa7db",
//                               "& .MuiSelect-icon": { color: "#ee582c" },
//                               "&:before": { borderBottom: "2px solid #ee582c" },
//                               "&:after": { borderBottom: "2px solid #ee582c" },
//                               "&:hover:not(.Mui-disabled, .Mui-error):before": {
//                                 borderBottom: "2px solid #ee582c",
//                               },
//                             }}
//                           >
//                             <MenuItem value="" disabled>Select a Class</MenuItem>
//                             {getClass?.map((cls, index) => (
//                               <MenuItem key={index} value={cls.className}>
//                                 {cls?.className}
//                               </MenuItem>
//                             ))}
//                           </Select>
//                         </FormControl>
      

//                       <FormControl
//                         variant="standard"
//                         sx={{
//                           mt: 1,
//                           width: "100%",
//                           "& .MuiInputLabel-root": { color: "#ee582c" },
//                           "& .MuiSelect-root": { color: "#ee582c" },
//                           "& .MuiSelect-icon": { color: "#ee582c" },
//                           "&:before": { borderBottom: "2px solid #ee582c" },
//                           "&:after": { borderBottom: "2px solid #ee582c" },
//                         }}
//                       >
//                         <InputLabel id="demo-simple-select-standard-label">
//                           Section 
//                         </InputLabel>
//                         <Select
//                           value={values.section} // Ensure values.section is updated
//                           onChange={handleSectionChange}
//                           labelId="demo-simple-select-standard-label"
//                           id="demo-simple-select-standard"
                        
//                             label="Section"
//         name="section"
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
//                             <MenuItem value="" disabled>Select a Section</MenuItem>
//         {availableSections.length > 0 ? (
//           availableSections.map((sec, index) => (
//             <MenuItem key={index} value={sec}>{sec}</MenuItem>
//           ))
//         ) : (
//           <MenuItem disabled>No Sections Available</MenuItem>
//         )}
                          
//                         </Select>
//                       </FormControl>
//                     </div>
                    
//                   </form>
//                 </div>
//                 <div className="px-4  shadow-xl bg-white ">
//                   {buttonLabel === "Save" && (
//                     <button
//                       className="w-full bg-[#2fa7db] text-white  rounded-md mb-5 py-2 "
//                       onClick={handleSaveClick}
//                       disabled={loading}
//                     >
//                       {loading ? "Saving..." : buttonLabel}
//                     </button>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
      
//       </>
//     );
//   }

//   export default DynamicFormFileds;
