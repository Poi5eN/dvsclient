import React, { useState, useCallback, useEffect, useRef } from "react";
import { Camera } from "lucide-react";
import Cropper from "react-easy-crop";
import Webcam from "react-webcam";
import {
  FormControl,
  InputLabel,
  Select,
  // TextField, // Currently not used, can be removed if not needed later
  MenuItem,
  Modal,
  Box,
  Button,
} from "@mui/material";
import { initialstudentphoto } from "../../Network/ThirdPartyApi"; // Ensure this path is correct
import { toast } from "react-toastify";
import { useStateContext } from "../../contexts/ContextProvider"; // Ensure this path is correct
import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg"; // Ensure this path is correct

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

function DynamicFormFileds(props) {
  const { studentData, buttonLabel = "Save", setIsOpen, setReRender } = props; // Added default for buttonLabel
  // console.log("studentData", studentData); // Keep for debugging if needed
  const { currentColor, isLoader, setIsLoader } = useStateContext(); // currentColor is unused here, can be removed if not needed
  const [getClass, setGetClass] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [values, setValues] = useState({
    fullName: "",
    class: "",
    section: "",
    studentImage: null, // Can be a URL string initially, or a File object after capture/crop
  });

  // --- Webcam State ---
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef(null);
  const [currentPhotoType, setCurrentPhotoType] = useState(null);

  // --- Cropper State ---
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageSource, setCroppedImageSource] = useState(null); // Data URL source for Cropper
  const [loading, setLoading] = useState(false); // Local loading state for submit

  useEffect(() => {
    const classes = JSON.parse(localStorage.getItem("classes"));
    if (classes) {
      setGetClass(classes);
    }
  }, []);

  // --- Populate available sections when class changes ---
  useEffect(() => {
    if (values.class && getClass.length > 0) {
        const selectedClassObj = getClass.find((cls) => cls.className === values.class);
        if (selectedClassObj && selectedClassObj.sections) {
            const sectionsArray = Array.isArray(selectedClassObj.sections)
                ? selectedClassObj.sections
                : String(selectedClassObj.sections).split(/\s*,\s*/).filter(Boolean);
            setAvailableSections(sectionsArray);
        } else {
            setAvailableSections([]);
        }
    } else {
      setAvailableSections([]);
    }
  }, [values.class, getClass]);


  // --- Populate form if studentData exists ---
  useEffect(() => {
    if (studentData) {
      const initialStudentImage = studentData.studentImage?.url || studentData.studentImage || null;
      setValues(prev => ({
        ...prev,
        fullName: studentData.fullName || "",
        class: studentData.class || "",
        section: studentData.section || "",
        studentImage: initialStudentImage, // Will be URL string initially
      }));

      // Pre-populate sections if class is loaded from studentData
       if (studentData.class && getClass.length > 0) {
         const selectedClassObj = getClass.find((cls) => cls.className === studentData.class);
         if (selectedClassObj && selectedClassObj.sections) {
             const sectionsArray = Array.isArray(selectedClassObj.sections)
                 ? selectedClassObj.sections
                 : String(selectedClassObj.sections).split(/\s*,\s*/).filter(Boolean);
             setAvailableSections(sectionsArray);
         } else {
             setAvailableSections([]);
         }
       }
    }
     // Cleanup function to revoke object URL if component unmounts while previewing a File
     return () => {
        if (values.studentImage instanceof File) {
          URL.revokeObjectURL(values.studentImage); // Use the correct object to revoke
        }
      };
  }, [studentData, getClass]); // Run when studentData or getClass changes

  // --- Handle input changes ---
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
  };

  const handleSectionChange = (e) => {
    setValues((prevData) => ({
      ...prevData,
      section: e.target.value,
    }));
  };

  const schoolID = localStorage.getItem("SchoolID");

  // --- Webcam Functions ---
  const openWebcam = (photoType) => {
    setCurrentPhotoType(photoType);
    setShowWebcam(true);
  };

  const capturePhoto = useCallback(() => {
    if (webcamRef.current) {
      // Capture as PNG for best quality during cropping
      const imageSrc = webcamRef.current.getScreenshot({ type: 'image/png', quality: 1 });
      if (imageSrc) {
        setShowWebcam(false);
        setCroppedImageSource(imageSrc); // Set PNG data URL for the cropper
      } else {
        console.error("Could not capture screenshot.");
        toast.error("Could not capture photo. Please try again.");
        setShowWebcam(false);
      }
    }
  }, [webcamRef]);

  const closeWebcam = () => {
    setShowWebcam(false);
    setCurrentPhotoType(null);
  };


  // --- Cropper Functions ---
  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const cancelCrop = useCallback(() => {
    setCroppedImageSource(null);
    setCurrentPhotoType(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  // Process Cropped Image (Convert to JPEG File)
  const showCroppedImage = async () => {
    if (!croppedImageSource || !croppedAreaPixels || !currentPhotoType) return;

    setLoading(true); // Show loading state during conversion
    try {
      // Get cropped image data URL (likely base64 PNG from getCroppedImg)
      const croppedImageUrl = await getCroppedImg(
        croppedImageSource,
        croppedAreaPixels
      );

      // Helper function to convert Data URL/Blob URL to a JPEG File object
      const getFileFromUrl = (url, fileName = "image.jpeg", mimeType = 'image/jpeg', quality = 0.9) => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            // Convert canvas to JPEG blob
            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], fileName, { type: mimeType }));
              } else {
                reject(new Error("Canvas toBlob failed to create JPEG."));
              }
            }, mimeType, quality); // Specify JPEG format and quality
          };
          img.onerror = (err) => {
            console.error("Image load error for canvas conversion:", err);
            reject(err);
          };
          img.src = url; // Load the cropped image data URL
        });
      };

      // Generate a filename (e.g., studentImage_1678886400000.jpeg)
      const filename = `${currentPhotoType}_${Date.now()}.jpeg`;

      // Convert cropped image data URL to a JPEG File
      const imageFile = await getFileFromUrl(croppedImageUrl, filename, 'image/jpeg');

      // Clean up previous object URL if it exists and is a File
       if (values[currentPhotoType] instanceof File) {
           URL.revokeObjectURL(values[currentPhotoType]); // Revoke old preview URL
       }


      // Update state with the new JPEG File object
      setValues((prev) => ({ ...prev, [currentPhotoType]: imageFile }));

      // Reset cropper state
      cancelCrop();

    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Failed to process cropped image. Please try again.");
      cancelCrop(); // Ensure cropper closes on error
    } finally {
       setLoading(false);
    }
  };

   // --- Handle Form Submission ---
   const handleSaveClick = async () => {
     setLoading(true);
     setIsLoader(true);

     try {
       // Validation
       if (!values.fullName || !values.class || !values.section || !values.studentImage) {
         toast.warn("Please fill all required fields and add a student photo.");
         setIsLoader(false);
         setLoading(false);
         return;
       }
       // Ensure the image is a File object before sending
       if (!(values.studentImage instanceof File)) {
         toast.error("Invalid student image. Please capture or upload a photo again.");
         setIsLoader(false);
         setLoading(false);
         return;
       }


       const studentPayload = {
         schoolId: schoolID,
         studentName: values.fullName,
         class: values.class,
         section: values.section,
       };

       const formDataToSend = new FormData();

       Object.entries(studentPayload).forEach(([key, value]) => {
         formDataToSend.append(key, String(value));
       });

       // Append the final JPEG File object for the student image
       const studentImageFilename = `${values.fullName.replace(/\s+/g, '_') || 'student'}_image.jpeg`;
       formDataToSend.append("studentImage", values.studentImage, studentImageFilename); // Send as JPEG

       // TODO: Add logic here to append other images (fatherImage, motherImage) if they exist and are Files


       console.log("FormData sending:", /* DON'T log formDataToSend directly */ ); // Can't log FormData directly easily
       // Log entries individually if needed for debugging:
       // for (let pair of formDataToSend.entries()) { console.log(pair[0]+ ', ' + pair[1]); }

       const response = await initialstudentphoto(formDataToSend);

       if (response.success) {
         toast.success("Student data saved successfully!");
         setValues({ // Reset form
           fullName: "",
           class: "",
           section: "",
           studentImage: null,
         });
         if (setReRender) setReRender(prev => !prev); // Trigger re-render in parent
         if (setIsOpen) setIsOpen(false); // Close the parent modal/form
       } else {
         toast.error(response?.message || response?.data?.message || "An error occurred during saving.");
       }
     } catch (error) {
       console.error("Error during saving:", error);
       let errorMessage = "An unexpected error occurred.";
       if (error.response) {
          if (error.response.status === 400) {
           errorMessage = error.response.data?.message || "Invalid data. Please check your inputs.";
          } else if (error.response.status === 500) {
           errorMessage = "Server error. Please try again later.";
          }
       } else if (error.request) {
           errorMessage = "No response from server. Check your network connection.";
       } else if (error.message) {
           errorMessage = error.message;
       }
       toast.error(errorMessage);
     } finally {
       setLoading(false);
       setIsLoader(false);
     }
   };


  // --- Render Cropper UI ---
  if (croppedImageSource) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-4 w-full max-w-md relative"> {/* Adjusted max width */}
         {loading && (
             <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10">
                 <p>Processing...</p> {/* Or use a spinner */}
             </div>
         )}
          <p className="text-center font-semibold mb-2">Crop Your Photo</p>
          <div className="relative h-64 w-full mb-4 bg-gray-200 rounded overflow-hidden">
            <Cropper
              image={croppedImageSource}
              crop={crop}
              zoom={zoom}
              aspect={1} // Square aspect ratio
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex justify-center items-center mb-4 px-4">
               <span className="mr-2 text-sm">Zoom:</span>
               <input
                   type="range"
                   min="1"
                   max="3"
                   step="0.1"
                   value={zoom}
                   onChange={(e) => setZoom(Number(e.target.value))}
                   className="w-full" // Take full width within flex item
               />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outlined" color="secondary" onClick={cancelCrop} disabled={loading}>
              Cancel
            </Button>
            <Button variant="contained" color="primary" onClick={showCroppedImage} disabled={loading}>
              Crop & Save
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Determine the preview source URL
  let imagePreviewUrl = null;
  if (values.studentImage instanceof File) {
    imagePreviewUrl = URL.createObjectURL(values.studentImage);
  } else if (typeof values.studentImage === 'string') {
    imagePreviewUrl = values.studentImage; // Assumes it's a valid URL from initial data
  }


  // --- Render Main Form ---
  return (
    <>
      {/* --- Webcam Modal --- */}
      <Modal
        open={showWebcam}
        onClose={closeWebcam}
        aria-labelledby="webcam-modal-title"
        aria-describedby="webcam-modal-description"
      >
        <Box sx={modalStyle}>
          <h2 id="webcam-modal-title" className="text-lg font-semibold mb-4">
            Capture Photo
          </h2>
          {showWebcam && (
             <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/png" // Capture PNG for quality, convert later
                width="100%"
                height="auto"
                videoConstraints={{ facingMode: "user" }}
                className="rounded" // Add some rounding
             />
          )}
          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-around', width: '100%' }}>
            <Button variant="contained" color="primary" onClick={capturePhoto}>
              Capture
            </Button>
            <Button variant="outlined" color="secondary" onClick={closeWebcam}>
              Cancel
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* --- Main Form Layout --- */}
      <div className="selection:bg-[#2fa7db] selection:text-white">
        {/* Adjusted minWidth for potentially smaller viewports */}
        <div className="flex justify-center" style={{ minWidth: "min(90vw, 600px)" }}>
          <div className="flex-1 m-2 max-w-lg"> {/* Added max-width */}
            <div className="w-full bg-white mx-auto overflow-hidden rounded-lg shadow-md"> {/* Added rounding and shadow */}
              <div className="px-5 pt-4 pb-5"> {/* Adjusted padding */}
                <h1 className="text-xl font-semibold text-gray-700 mb-4">
                  Student Details
                </h1>

                <div className="flex items-center mb-6"> {/* Centered items */}
                  {/* Image Preview and Capture Button */}
                  <div className="relative mr-4"> {/* Added margin */}
                    <div className="relative w-24 h-24">
                        {imagePreviewUrl ? (
                          <img
                            src={imagePreviewUrl}
                            alt="Student Preview"
                            className="w-24 h-24 rounded-full object-cover border-2 border-gray-300"
                            // Clean up object URL when component unmounts or image changes
                            // Handled in useEffect cleanup and showCroppedImage
                          />
                        ) : (
                          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
                            <Camera size={30} className="text-gray-400" />
                          </div>
                        )}
                         {/* Camera Icon Button */}
                         <button
                            type="button"
                            onClick={() => openWebcam('studentImage')}
                            className="absolute bottom-0 right-0 bg-[#ee582c] text-white p-1.5 rounded-full cursor-pointer hover:bg-[#d74f20] transition duration-200 shadow-sm"
                            aria-label="Capture student photo"
                         >
                            <Camera size={16} />
                         </button>
                     </div>
                  </div>
                   {/* Student Name Input (moved next to image) */}
                   <div className="relative flex-grow">
                      <input
                          type="text"
                          name="fullName"
                          placeholder=" " // Important for label animation
                          value={values.fullName}
                          onChange={handleInputChange}
                          id="fullName"
                          className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600 bg-transparent" // Added bg-transparent
                          required
                      />
                      <label
                          htmlFor="fullName"
                          className="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#9ca3af] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
                      >
                          Student Full Name *
                      </label>
                    </div>
                </div>

                {/* Form Fields Below Image/Name */}
                {/* <form className="" action="" method="POST"> */} {/* No need for form tag if using button onClick */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 mt-4"> {/* Grid layout */}
                    {/* Class Select */}
                    <FormControl
                      variant="standard"
                      required
                      fullWidth // Takes full width of its grid cell
                      sx={{
                        // Common styles
                        "& .MuiInputLabel-root": { color: "#ee582c" },
                        "& .MuiInputBase-input": { color: "#2fa7db" }, // Target input text color
                        "& .MuiSelect-icon": { color: "#ee582c" },
                        "& .MuiInput-underline:before": { borderBottom: "2px solid #ee582c" },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: '#d74f20' }, // Darker hover
                        "& .MuiInput-underline:after": { borderBottom: "2px solid #d74f20" }, // Focus underline
                        "& label.Mui-focused": { color: '#ee582c' },
                        "& .MuiInputBase-root": { marginTop: '16px' } // Add margin to align with label transition
                      }}
                    >
                      <InputLabel id="class-select-label">
                        Class *
                      </InputLabel>
                      <Select
                        labelId="class-select-label"
                        id="class-select"
                        value={values.class}
                        onChange={handleClassChange}
                        // label="Class *" // Label provided by InputLabel
                        name="class"
                         sx={{
                           "&:focus": { backgroundColor: 'transparent' }
                         }}
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
                        // Common styles (inherited or slightly adapted)
                        "& .MuiInputLabel-root": { color: "#ee582c" },
                        "& .MuiInputBase-input": { color: "#2fa7db" },
                        "& .MuiSelect-icon": { color: "#ee582c" },
                        "& .MuiInput-underline:before": { borderBottom: "2px solid #ee582c" },
                         "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: '#d74f20' },
                        "& .MuiInput-underline:after": { borderBottom: "2px solid #d74f20" },
                        "& label.Mui-focused": { color: '#ee582c' },
                        "& .MuiInputBase-root": { marginTop: '16px' }, // Align label
                         // Disabled state
                         "&.Mui-disabled": {
                           "& .MuiInput-underline:before": { borderBottom: "2px solid #bdbdbd" },
                           "& .MuiInputLabel-root": { color: "#bdbdbd" },
                           "& .MuiSelect-icon": { color: "#bdbdbd" },
                           "& .MuiInputBase-input": { color: "#bdbdbd" }, // Disabled text color
                         }
                      }}
                    >
                      <InputLabel id="section-select-label">
                        Section *
                      </InputLabel>
                      <Select
                        labelId="section-select-label"
                        id="section-select"
                        value={values.section}
                        onChange={handleSectionChange}
                        // label="Section *"
                        name="section"
                         sx={{
                           "&:focus": { backgroundColor: 'transparent' }
                         }}
                      >
                        <MenuItem value="" disabled><em>Select a Section</em></MenuItem>
                        {availableSections.length > 0 ? (
                          availableSections.map((sec, index) => (
                            <MenuItem key={`${sec}-${index}`} value={sec}>{sec}</MenuItem>
                          ))
                        ) : (
                          <MenuItem disabled sx={{ fontStyle: 'italic', color: '#bdbdbd' }}>
                             {values.class ? 'No Sections Available' : 'Select Class First'}
                          </MenuItem>
                        )}
                      </Select>
                    </FormControl>
                  </div>
                {/* </form> */}
              </div>
              <div className="px-6 pb-6 pt-2 bg-white rounded-b-lg">
                 {/* Submit Button */}
                {buttonLabel && ( // Render button only if label is provided
                  <button
                    type="button"
                    className={`w-full text-white rounded-md py-2.5 transition duration-200 text-base font-medium ${loading || isLoader ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2fa7db] hover:bg-[#248db4]'}`}
                    onClick={handleSaveClick}
                    disabled={loading || isLoader}
                  >
                    {loading ? "Saving..." : buttonLabel}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default DynamicFormFileds;



// import React, { useState, useCallback, useEffect, useRef } from "react"; // Import useRef
// import { Camera } from "lucide-react";
// import Cropper from "react-easy-crop";
// import Webcam from "react-webcam"; // Import Webcam
// import {
//   FormControl,
//   InputLabel,
//   Select,
//   TextField,
//   MenuItem,
//   Modal, // Import Modal for webcam view
//   Box,   // Import Box for modal styling
//   Button // Import Button for modal actions
// } from "@mui/material";
// import { initialstudentphoto } from "../../Network/ThirdPartyApi";
// import { toast } from "react-toastify";
// import { useStateContext } from "../../contexts/ContextProvider";
// import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg";

// // --- Modal Style (adjust as needed) ---
// const modalStyle = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: '90%', // Responsive width
//   maxWidth: 500, // Max width for larger screens
//   bgcolor: 'background.paper',
//   border: '2px solid #000',
//   boxShadow: 24,
//   p: 4,
//   display: 'flex',
//   flexDirection: 'column',
//   alignItems: 'center',
// };

// function DynamicFormFileds(props) {
//   const { studentData, buttonLabel, setIsOpen, setReRender } = props;
//   console.log("studentData", studentData);
//   const { currentColor, isLoader, setIsLoader } = useStateContext(); // Removed unused isLoader here
//   const [getClass, setGetClass] = useState([]);
//   const [availableSections, setAvailableSections] = useState([]);
//   const [values, setValues] = useState({
//     fullName: "",
//     class: "",
//     section: "",
//     studentImage: null, // Initialize studentImage
//     // Add other potential image fields if needed (fatherImage, motherImage, etc.)
//   });

//   // --- Webcam State ---
//   const [showWebcam, setShowWebcam] = useState(false);
//   const webcamRef = useRef(null);
//   const [currentPhotoType, setCurrentPhotoType] = useState(null); // Keep track of which image is being captured/cropped

//   // --- Cropper State ---
//   const [crop, setCrop] = useState({ x: 0, y: 0 });
//   const [zoom, setZoom] = useState(1);
//   const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
//   const [croppedImageSource, setCroppedImageSource] = useState(null); // Source for the Cropper component
//   const [loading, setLoading] = useState(false); // Loading state for submit button

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
//                 : String(selectedClassObj.sections).split(/\s*,\s*/).filter(Boolean); // Ensure it's a string before splitting
//             setAvailableSections(sectionsArray);
//         } else {
//             setAvailableSections([]);
//         }
//     } else {
//       setAvailableSections([]); // Reset if class is cleared or getClass is empty
//     }
//   }, [values.class, getClass]);


//   // --- Populate form if studentData exists (for editing scenarios, if applicable) ---
//   useEffect(() => {
//     if (studentData) {
//       setValues(prev => ({
//         ...prev,
//         fullName: studentData.fullName || "",
//         class: studentData.class || "",
//         section: studentData.section || "",
//         // Assuming studentData might have an image URL initially
//         studentImage: studentData.studentImage?.url || studentData.studentImage || null,
//         // Add other fields from studentData as needed
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
//   }, [studentData, getClass]); // Add getClass dependency


//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;
//     setValues((prevData) => ({
//       ...prevData,
//       class: selectedClassName,
//       section: "", // Reset section when class changes
//     }));
//     // Note: Section options will update via the useEffect hook watching values.class
//   };

//   const handleSectionChange = (e) => {
//     setValues((prevData) => ({
//       ...prevData,
//       section: e.target.value,
//     }));
//   };

//   const schoolID = localStorage.getItem("SchoolID");

//   // --- Open Webcam Modal ---
//   const openWebcam = (photoType) => {
//     setCurrentPhotoType(photoType); // Set which image we're capturing
//     setShowWebcam(true);
//   };

//   // --- Capture Photo from Webcam ---
//   const capturePhoto = useCallback(() => {
//     if (webcamRef.current) {
//       const imageSrc = webcamRef.current.getScreenshot({
//          // width: 1280, // Optional: Specify desired width
//          // height: 720, // Optional: Specify desired height
//          type: 'image/png', // Ensure PNG format
//          quality: 1 // PNG quality is lossless, so 1 is fine
//       });
//       if (imageSrc) {
//         setShowWebcam(false); // Close webcam modal
//         setCroppedImageSource(imageSrc); // Set the captured image as source for cropper
//       } else {
//         console.error("Could not capture screenshot.");
//         toast.error("Could not capture photo. Please try again.");
//         setShowWebcam(false);
//       }
//     }
//   }, [webcamRef]);

//   // --- Close Webcam Modal ---
//   const closeWebcam = () => {
//     setShowWebcam(false);
//     setCurrentPhotoType(null); // Reset photo type
//   };


//   // --- Handle Form Submission ---
//   const handleSaveClick = async () => {
//     setLoading(true);
//     setIsLoader(true); // Use context loader

//     try {
//       // Basic Validation (add more as needed)
//       if (!values.fullName || !values.class || !values.section || !values.studentImage) {
//         toast.warn("Please fill all required fields and add a student photo.");
//         setIsLoader(false);
//         setLoading(false);
//         return;
//       }
//        if (!(values.studentImage instanceof File)) {
//          toast.error("Invalid student image file. Please capture or upload again.");
//          setIsLoader(false);
//          setLoading(false);
//          return;
//        }


//       const studentPayload = {
//         schoolId: schoolID,
//         studentName: values.fullName,
//         class: values.class,
//         section: values.section,
//       };

//       const formDataToSend = new FormData();

//       // Append string/number data
//       Object.entries(studentPayload).forEach(([key, value]) => {
//         formDataToSend.append(key, String(value)); // Ensure values are strings if needed by API
//       });

//       // Append the final File object for the student image
//       if (values.studentImage instanceof File) {
//         formDataToSend.append("studentImage", values.studentImage, `${values.fullName}_student.png`); // Send as PNG
//       }
//       // Add logic here to append fatherImage, motherImage etc. if they exist and are Files


//       const response = await initialstudentphoto(formDataToSend);

//       if (response.success) {
//         toast.success("Student data saved successfully!");
//         setValues({ // Reset form
//           fullName: "",
//           class: "",
//           section: "",
//           studentImage: null,
//         });
//         setReRender(true); // Trigger re-render in parent if needed
//         setIsOpen(false); // Close the parent modal/form container
//       } else {
//         toast.error(response?.message || response?.data?.message || "An error occurred during saving.");
//       }
//     } catch (error) {
//       console.error("Error during saving:", error);
//       let errorMessage = "An unexpected error occurred.";
//       if (error.response) {
//          if (error.response.status === 400) {
//           errorMessage = error.response.data?.message || "Invalid data. Please check your inputs.";
//          } else if (error.response.status === 500) {
//           errorMessage = "Server error. Please try again later.";
//          }
//       } else if (error.message) {
//           errorMessage = error.message;
//       }
//       toast.error(errorMessage);
//     } finally {
//       setLoading(false);
//       setIsLoader(false);
//     }
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setValues({ ...values, [name]: value });
//   };

//   // --- Cropper Callbacks ---
//   const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
//     setCroppedAreaPixels(croppedAreaPixels);
//   }, []);

//   const cancelCrop = useCallback(() => {
//     setCroppedImageSource(null);
//     setCurrentPhotoType(null); // Also reset the type
//   }, []);

//   // --- Process Cropped Image ---
//   const showCroppedImage = async () => {
//     if (!croppedImageSource || !croppedAreaPixels || !currentPhotoType) return;

//     try {
//       const croppedImageUrl = await getCroppedImg(
//         croppedImageSource,
//         croppedAreaPixels
//       );

//       // --- Convert Base64/Blob URL to PNG File ---
//       const getFileFromUrl = async (url, fileName = "image.png", mimeType = 'image/png') => {
//         try {
//             const response = await fetch(url);
//             const blob = await response.blob();

//              // Ensure the blob type is correct, especially if getCroppedImg returns a specific type
//              const finalBlob = blob.type === mimeType ? blob : new Blob([blob], { type: mimeType });

//              return new File([finalBlob], fileName, { type: mimeType });
//         } catch (fetchError) {
//             console.error("Error fetching blob:", fetchError);
//              // Fallback: Try converting via canvas if direct fetch fails or blob type is wrong
//              return new Promise((resolve, reject) => {
//                  const img = new Image();
//                  img.onload = () => {
//                      const canvas = document.createElement('canvas');
//                      canvas.width = img.naturalWidth;
//                      canvas.height = img.naturalHeight;
//                      const ctx = canvas.getContext('2d');
//                      ctx.drawImage(img, 0, 0);
//                      canvas.toBlob((pngBlob) => {
//                          if (pngBlob) {
//                              resolve(new File([pngBlob], fileName, { type: mimeType }));
//                          } else {
//                              reject(new Error("Canvas toBlob failed"));
//                          }
//                      }, mimeType); // Specify PNG format here
//                  };
//                  img.onerror = (err) => {
//                      console.error("Image load error for canvas conversion:", err);
//                      reject(err);
//                  };
//                  img.src = url; // Set source to the cropped image URL (base64 or blob)
//              });
//          }
//       };


//       // Generate a filename (e.g., student_photo.png)
//       const filename = `${currentPhotoType}_${Date.now()}.png`;

//       // Convert cropped image to PNG File
//       const imageFile = await getFileFromUrl(croppedImageUrl, filename, 'image/png');

//       // Update state with the File object
//       setValues((prev) => ({ ...prev, [currentPhotoType]: imageFile }));

//       // Reset cropper state
//       setCroppedImageSource(null);
//       setCurrentPhotoType(null);

//     } catch (error) {
//       console.error("Error cropping image:", error);
//       toast.error("Failed to crop image. Please try again.");
//       setCroppedImageSource(null); // Clear cropper on error
//       setCurrentPhotoType(null);
//     }
//   };

//   // --- Render Cropper UI ---
//   if (croppedImageSource) {
//     return (
//       <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
//         <div className="bg-white rounded-lg p-4 w-full max-w-lg"> {/* Adjusted max width */}
//           <p className="text-center font-semibold mb-2">Crop Your Photo</p>
//           <div className="relative h-64 w-full mb-4 bg-gray-200"> {/* Added background */}
//             <Cropper
//               image={croppedImageSource}
//               crop={crop}
//               zoom={zoom}
//               aspect={1} // Square aspect ratio for profile pics
//               onCropChange={setCrop}
//               onZoomChange={setZoom}
//               onCropComplete={onCropComplete}
//             />
//           </div>
//           <div className="flex justify-center items-center mb-4"> {/* Slider for Zoom */}
//                <span className="mr-2">Zoom:</span>
//                <input
//                    type="range"
//                    min="1"
//                    max="3"
//                    step="0.1"
//                    value={zoom}
//                    onChange={(e) => setZoom(Number(e.target.value))}
//                    className="w-1/2"
//                />
//           </div>
//           <div className="flex justify-end gap-3">
//             <button
//               onClick={cancelCrop} // Use the cancelCrop function
//               className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={showCroppedImage}
//               className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
//             >
//               Crop & Save
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // --- Render Main Form ---
//   return (
//     <>
//       {/* --- Webcam Modal --- */}
//       <Modal
//         open={showWebcam}
//         onClose={closeWebcam} // Close modal on backdrop click
//         aria-labelledby="webcam-modal-title"
//         aria-describedby="webcam-modal-description"
//       >
//         <Box sx={modalStyle}>
//           <h2 id="webcam-modal-title" className="text-lg font-semibold mb-4">
//             Capture Photo
//           </h2>
//           {showWebcam && ( // Conditionally render Webcam to ensure camera initializes properly on open
//              <Webcam
//                 audio={false}
//                 ref={webcamRef}
//                 screenshotFormat="image/png" // Ensure PNG format here too
//                 width="100%" // Make webcam responsive
//                 height="auto"
//                 videoConstraints={{ facingMode: "user" }} // Use front camera
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
//         <div className="flex justify-center" style={{ minWidth: "90vw" }}>
//           <div className="flex-1 m-2">
//             <div className="w-full bg-white mx-auto overflow-hidden ">
//               <div className="relative h-[130px] px-5 pt-1 rounded-bl-4xl">
//                 <h1 className="absolute top-0 text-xl font-semibold text-gray-700 pl-2"> {/* Adjusted text color */}
//                   Student Details
//                 </h1>

//                 <div className="flex ml-2 mb-6">
//                   <div className="absolute top-5">
//                     {/* Display Preview */}
//                     <div className="relative w-24 h-24"> {/* Container for positioning */}
//                         {values.studentImage ? (
//                           <img
//                             src={
//                               values.studentImage instanceof File // Check if it's a File object (post-crop/capture)
//                                 ? URL.createObjectURL(values.studentImage) // Create preview URL for File
//                                 : values.studentImage // Assume it's a URL string initially (e.g., from studentData)
//                             }
//                             alt="Student"
//                             className="w-24 h-24 rounded-full object-cover border-2 border-gray-300" // Added border
//                           />
//                         ) : (
//                           <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center border-2 border-gray-300">
//                             <span className="text-gray-500 text-sm">NO IMAGE</span>
//                           </div>
//                         )}
//                          {/* Camera Icon Button to open Webcam */}
//                          <button
//                             type="button" // Important: prevent form submission
//                             onClick={() => openWebcam('studentImage')} // Pass the key 'studentImage'
//                             className="absolute bottom-0 right-0 bg-[#ee582c] text-white p-2 rounded-full cursor-pointer hover:bg-[#d74f20] transition duration-200"
//                             aria-label="Capture student photo"
//                          >
//                             <Camera size={18} />
//                          </button>
//                      </div>
//                   </div>
//                 </div>
//               </div>
//               <div className="px-6 pb-8 bg-white rounded-tr-4xl">
//                 <form className="" action="" method="POST">
//                   <div className="relative mt-4">
//                     {/* Student Name Input */}
//                     <input
//                       type="text"
//                       name="fullName"
//                       placeholder="Student Name"
//                       value={values.fullName}
//                       onChange={handleInputChange}
//                       id="fullName"
//                       className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
//                       required // Added required
//                     />
//                     <label
//                       htmlFor="fullName"
//                       className="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
//                     >
//                       Student Name
//                     </label>
//                   </div>

//                   <div className="flex justify-center items-center gap-4 mt-4"> {/* Added gap and margin */}
//                     {/* Class Select */}
//                     <FormControl
//                       variant="standard"
//                        required // Added required
//                       sx={{
//                         width: "100%",
//                         "& .MuiInputLabel-root": { color: "#ee582c" },
//                         "& .MuiSelect-root": { color: "#2fa7db" },
//                         "& .MuiSelect-icon": { color: "#ee582c" },
//                         "&:before": { borderBottom: "2px solid #ee582c" },
//                         "&:after": { borderBottom: "2px solid #ee582c" },
//                         "& label.Mui-focused": { color: '#ee582c' }, // Keep label color on focus
//                         "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: '#ee582c' } // Hover underline color
//                       }}
//                     >
//                       <InputLabel id="class-select-label">
//                         Class
//                       </InputLabel>
//                       <Select
//                         labelId="class-select-label"
//                         id="class-select"
//                         value={values.class}
//                         onChange={handleClassChange}
//                         label="Class"
//                         name="class"
//                          sx={{
//                            color: "#2fa7db",
//                            "&:focus": { backgroundColor: 'transparent' } // Prevent background change on focus
//                          }}
//                       >
//                         <MenuItem value="" disabled><em>Select a Class</em></MenuItem>
//                         {getClass?.map((cls, index) => (
//                           <MenuItem key={index} value={cls.className}>
//                             {cls?.className}
//                           </MenuItem>
//                         ))}
//                       </Select>
//                     </FormControl>

//                     {/* Section Select */}
//                     <FormControl
//                       variant="standard"
//                       required // Added required
//                       disabled={!values.class || availableSections.length === 0} // Disable if no class selected or no sections
//                       sx={{
//                         width: "100%",
//                         "& .MuiInputLabel-root": { color: "#ee582c" },
//                         "& .MuiSelect-root": { color: "#2fa7db" }, // Adjusted text color
//                         "& .MuiSelect-icon": { color: "#ee582c" },
//                         "&:before": { borderBottom: "2px solid #ee582c" },
//                         "&:after": { borderBottom: "2px solid #ee582c" },
//                          "& label.Mui-focused": { color: '#ee582c' }, // Keep label color on focus
//                          "& .MuiInput-underline:hover:not(.Mui-disabled):before": { borderBottomColor: '#ee582c' }, // Hover underline color
//                          "&.Mui-disabled": { // Style when disabled
//                            "&:before": { borderBottom: "2px solid #bdbdbd" },
//                            "& .MuiInputLabel-root": { color: "#bdbdbd" },
//                            "& .MuiSelect-icon": { color: "#bdbdbd" },
//                          }
//                       }}
//                     >
//                       <InputLabel id="section-select-label">
//                         Section
//                       </InputLabel>
//                       <Select
//                         labelId="section-select-label"
//                         id="section-select"
//                         value={values.section}
//                         onChange={handleSectionChange}
//                         label="Section"
//                         name="section"
//                          sx={{
//                            color: "#2fa7db",
//                            "&:focus": { backgroundColor: 'transparent' } // Prevent background change on focus
//                          }}
//                       >
//                         <MenuItem value="" disabled><em>Select a Section</em></MenuItem>
//                         {availableSections.length > 0 ? (
//                           availableSections.map((sec, index) => (
//                             <MenuItem key={index} value={sec}>{sec}</MenuItem>
//                           ))
//                         ) : (
//                           <MenuItem disabled>
//                              <em>{values.class ? 'No Sections' : 'Select Class First'}</em>
//                           </MenuItem>
//                         )}
//                       </Select>
//                     </FormControl>
//                   </div>

//                 </form> {/* End of Form Element */}
//               </div>
//               <div className="px-4 shadow-xl bg-white">
//                  {/* Submit Button */}
//                 {buttonLabel === "Save" && (
//                   <button
//                     type="button" // Make sure it doesn't submit the form prematurely
//                     className={`w-full text-white rounded-md mb-5 py-2 transition duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#2fa7db] hover:bg-[#248db4]'}`}
//                     onClick={handleSaveClick}
//                     disabled={loading || isLoader} // Disable if loading or context loader active
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



// import React, { useState, useCallback, useEffect } from "react";
  // import { Camera } from "lucide-react";
  // import Cropper from "react-easy-crop";
  // import { FormControl, InputLabel, Select, TextField,MenuItem  } from "@mui/material";
  // import {
  //   initialstudentphoto,
  // } from "../../Network/ThirdPartyApi";
  // import { toast } from "react-toastify";
  // import { useStateContext } from "../../contexts/ContextProvider";
  // import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg";
  // function DynamicFormFileds(props) {
  //   const { studentData, buttonLabel, setIsOpen, setReRender } = props;
  //   console.log("studentData",studentData)
  //   const { currentColor, isLoader, setIsLoader } = useStateContext();
  //   const [getClass, setGetClass] = useState([]);
  // const [availableSections, setAvailableSections] = useState([]);
  //   const [values, setValues] = useState({
  //     fullName: "",
  //     class: "",
  //     section: "",
    
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
    
  //     setLoading(true);
  //     setIsLoader(true);

  //     try {
  //       const studentData = {
  //         schoolId: schoolID,
  //         studentName: values?.fullName || "",
  //         class: values?.class || "",
  //         section: values?.section || "",
  //       };

  //       const formDataToSend = new FormData();

  //       Object.entries(studentData).forEach(([key, value]) => {
  //         formDataToSend.append(key, String(value));
  //       });

  //       if (values.studentImage) {
  //         formDataToSend.append("studentImage", values.studentImage);
  //       }
      

  //       const response = await initialstudentphoto(formDataToSend);

  //       if (response.success) {
  //         setIsLoader(false);
  //         setValues({
  //           admissionNumber: "",
  //           studentName: "",
  //           class: "",
  //           section: "",
          
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

  //   return (
  //     <>
  //       <div class="selection:bg-[#2fa7db] selection:text-white">
  //         <div class=" flex justify-center "
  //             style={{minWidth:"90vw"}}
          
  //         >
  //           <div class="flex-1 m-2">
  //             <div class="w-full bg-white  mx-auto overflow-hidden ">
  //               <div
  //                 class="relative h-[130px] px-5 pt-1
  //               rounded-bl-4xl"
  //               >
  //                 <h1 class="absolute top-0  text-xl font-semibold text-white pl-2">
  //                   Student Details
  //                 </h1>
              
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
  //                         // accept="image/*"
  //                         capture="environment" // Opens the back camera; use "user" for the front camera
  //                         // capture="user" // Opens the back camera; use "user" for the front camera
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
  //                         value={values.class} 
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
  //                           <MenuItem value="" disabled>Select a Class</MenuItem>
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
                        
  //                           label="Section"
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
  //                   </div>
                    
  //                 </form>
  //               </div>
  //               <div className="px-4  shadow-xl bg-white ">
  //                 {buttonLabel === "Save" && (
  //                   <button
  //                     className="w-full bg-[#2fa7db] text-white  rounded-md mb-5 py-2 "
  //                     onClick={handleSaveClick}
  //                     disabled={loading}
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
