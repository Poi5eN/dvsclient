import React, { useState, useCallback, useEffect, useRef } from "react";
import { Camera as CameraIcon, SwitchCamera, Upload, XCircle, Loader2 } from "lucide-react"; // Added Loader2
import Cropper from "react-easy-crop";
import Webcam from "react-webcam";
import { toast } from "react-toastify";
// Ensure this path is correct for your project structure
import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg"; // Assuming this path is correct

// --- Helper to convert Base64/Data URL to File (remains the same) ---
const dataURLtoFile = (dataurl, filename) => {
    if (!dataurl || typeof dataurl !== 'string' || !dataurl.includes(',')) {
        console.error("Invalid data URL provided to dataURLtoFile:", dataurl);
        return null;
    }
    try {
        let arr = dataurl.split(','),
            mimeMatch = arr[0].match(/:(.*?);/);
        let mime = 'image/jpeg';
        if (mimeMatch && mimeMatch[1]) {
            mime = mimeMatch[1];
        } else {
             if (arr[0].includes('/png')) mime = 'image/png';
             else if (arr[0].includes('/webp')) mime = 'image/webp';
        }
        const bstr = atob(arr[arr.length - 1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }
        return new File([u8arr], filename, { type: mime });
    } catch (e) {
        console.error("Error converting data URL to File:", e);
        return null;
    }
};


function ImageCaptureCrop({
    onImageCropped,
    initialImageUrl = null,
    aspectRatio = 1,
    outputFilenamePrefix = "cropped_image",
    label,
    previewSize = 120, // Size of the circular preview area
}) {
    const [showWebcamModal, setShowWebcamModal] = useState(false);
    const [imageForCropper, setImageForCropper] = useState(null);
    const [currentImagePreview, setCurrentImagePreview] = useState(initialImageUrl);

    const [isCropping, setIsCropping] = useState(false);
    const [isFileReading, setIsFileReading] = useState(false);

    const webcamRef = useRef(null);
    const [facingMode, setFacingMode] = useState("user");
    const fileInputRef = useRef(null);

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    useEffect(() => {
        if (initialImageUrl !== currentImagePreview && !(currentImagePreview && currentImagePreview.startsWith('blob:'))) {
             setCurrentImagePreview(initialImageUrl);
        }
    }, [initialImageUrl, currentImagePreview]);

    useEffect(() => {
        const previewUrl = currentImagePreview;
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [currentImagePreview]);

    const openWebcam = useCallback(() => {
        setShowWebcamModal(true);
        setImageForCropper(null);
        setIsFileReading(false);
    }, []);

    const closeWebcamModal = useCallback(() => {
        setShowWebcamModal(false);
    }, []);

    const capturePhoto = useCallback(() => {
        if (!webcamRef.current) {
            toast.error("Webcam not ready.");
            return;
        }
        const imageSrc = webcamRef.current.getScreenshot({ type: 'image/png' });
        if (imageSrc) {
            setShowWebcamModal(false);
            setImageForCropper(imageSrc);
        } else {
            toast.error("Could not capture photo. Check camera permissions.");
            closeWebcamModal();
        }
    }, [webcamRef, closeWebcamModal]);

    const handleSwitchCamera = useCallback(() => {
        setFacingMode(prevMode => (prevMode === "user" ? "environment" : "user"));
    }, []);

    const triggerFileInput = useCallback(() => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    }, []);

    const handleFileSelect = useCallback((event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            toast.error("Invalid file type. Please select an image.");
            return;
        }
        setIsFileReading(true);
        const reader = new FileReader();
        reader.onload = (loadEvent) => {
            const result = loadEvent.target?.result;
            if (typeof result === 'string') setImageForCropper(result);
            else toast.error("Could not read the selected file.");
            setIsFileReading(false);
        };
        reader.onerror = () => {
            toast.error("Error reading file.");
            setIsFileReading(false);
        };
        reader.readAsDataURL(file);
        event.target.value = '';
    }, []);

    const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsValue) => {
        setCroppedAreaPixels(croppedAreaPixelsValue);
    }, []);

    const cancelCrop = useCallback(() => {
        setImageForCropper(null);
        setCroppedAreaPixels(null);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setIsCropping(false);
        setIsFileReading(false);
    }, []);

    const applyCroppedImage = useCallback(async () => {
        if (!imageForCropper || !croppedAreaPixels) {
            toast.warn("Cropping data missing.");
            cancelCrop();
            return;
        }
        setIsCropping(true);
        try {
            const croppedDataUrl = await getCroppedImg(imageForCropper, croppedAreaPixels, 0);
            if (!croppedDataUrl || typeof croppedDataUrl !== 'string' || !croppedDataUrl.startsWith('data:image/')) {
                 throw new Error("Failed to get cropped image data.");
            }
            const fileExtension = croppedDataUrl.substring("data:image/".length, croppedDataUrl.indexOf(";base64"));
            const filename = `${outputFilenamePrefix}_${Date.now()}.${fileExtension || 'jpeg'}`;
            const imageFile = dataURLtoFile(croppedDataUrl, filename);
            if (!imageFile) throw new Error("Failed to process cropped image file.");
            
            if (currentImagePreview && currentImagePreview.startsWith('blob:')) {
                URL.revokeObjectURL(currentImagePreview);
            }
            const newPreviewUrl = URL.createObjectURL(imageFile);
            setCurrentImagePreview(newPreviewUrl);
            onImageCropped(imageFile);
            cancelCrop();
        } catch (error) {
            console.error("Error during image cropping/processing:", error);
            toast.error(`Failed to apply crop: ${error.message || 'Please try again.'}`);
            cancelCrop();
        } finally {
            setIsCropping(false);
        }
    }, [imageForCropper, croppedAreaPixels, cancelCrop, getCroppedImg, onImageCropped, outputFilenamePrefix, currentImagePreview]);

    const handleRemoveImage = () => {
        if (currentImagePreview && currentImagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(currentImagePreview);
        }
        setCurrentImagePreview(null);
        onImageCropped(null);
    };
    
    const isProcessing = isCropping || isFileReading;

    // Button base styles
    const btnBase = "px-4 py-2 rounded-md font-medium text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed";
    const btnPrimary = `${btnBase} bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500`;
    const btnSecondary = `${btnBase} border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-gray-400`;
    const btnText = `${btnBase} text-gray-600 hover:bg-gray-100 focus:ring-gray-400`;


    return (
        <>
            <div className={`flex flex-col items-center ${label ? 'gap-1' : ''} w-fit mx-auto`}>
                {label && (
                    <p className="text-xs text-gray-500 mb-0.5 text-center">
                        {label}
                    </p>
                )}
                <div
                    className="relative mb-1"
                    style={{ width: "80px", height: "90px" }}
                    // style={{ width: previewSize, height: previewSize }}
                >
                    {console.log("currentImagePreview",currentImagePreview)}
                    <div
                        className={`w-full h-full  bg-gray-200 flex items-center justify-center
                                    border-2 ${currentImagePreview ? 'border-gray-300' : 'border-dashed border-gray-400'}
                                    overflow-hidden`}
                    >
                        {currentImagePreview ? (
                            <img src={currentImagePreview || currentImagePreview?.url} alt={label || "Preview"} className="w-full h-full object-cover" />
                        ) : (
                            <CameraIcon size={previewSize * 0.33} className="text-gray-500" />
                        )}
                    </div>

                    {/* Action Buttons Container */}
                    <div
                        className="absolute flex"
                        style={{ bottom: -25, right: 1, gap: '0.4rem' }} // Using gap via style for fine-tuning
                    >
                        <button
                            type="button"
                            onClick={openWebcam}
                            disabled={isProcessing}
                            className="flex items-center justify-center bg-[#FF6F61] text-white rounded-full shadow-md hover:bg-[#E65A50] disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ width: previewSize * 0.3, height: previewSize * 0.3, minWidth: 32, minHeight: 32 }}
                            aria-label="Take Photo"
                        >
                            <CameraIcon size={previewSize * 0.15} />
                        </button>
                        <button
                            type="button"
                            onClick={triggerFileInput}
                            disabled={isProcessing}
                            className="flex items-center justify-center bg-[#007AFF] text-white rounded-full shadow-md hover:bg-[#0056b3] disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{ width: previewSize * 0.3, height: previewSize * 0.3, minWidth: 32, minHeight: 32 }}
                            aria-label="Upload File"
                        >
                            <Upload size={previewSize * 0.15} />
                        </button>
                    </div>

                    {currentImagePreview && (
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            disabled={isProcessing}
                            className="absolute flex items-center justify-center bg-white bg-opacity-90 hover:bg-gray-200 rounded-full shadow-sm text-gray-600 disabled:opacity-60 disabled:cursor-not-allowed"
                            style={{
                                top: `-${previewSize * 0.06}px`,
                                right: `-${previewSize * 0.06}px`,
                                width: previewSize * 0.22, height: previewSize * 0.22,
                                minWidth: 24, minHeight: 24
                            }}
                            aria-label="Remove image"
                        >
                            <XCircle size={previewSize * 0.13} />
                        </button>
                    )}
                </div>
            </div>

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*"
                className="hidden"
                disabled={isProcessing}
            />

            {/* --- Webcam Modal --- */}
            {showWebcamModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4">
                    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-xl w-full max-w-md flex flex-col items-center"> {/* Adjusted max-width from 200px */}
                        <h2 className="text-lg font-semibold mb-3 text-gray-800">Capture Photo</h2>
                        <div className="w-full relative mb-4 border border-gray-300 rounded-md overflow-hidden">
                            <Webcam
                                audio={false} ref={webcamRef} screenshotFormat="image/png"
                                className="w-full h-auto block rounded-md"
                                videoConstraints={{ facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }}
                                mirrored={facingMode === 'user'}
                                onUserMediaError={(err) => { console.error("Webcam UserMedia Error:", err); toast.error(`Camera Error: ${err.name}. Check permissions.`); closeWebcamModal(); }}
                            />
                            <button
                                type="button"
                                onClick={handleSwitchCamera}
                                className="absolute bottom-2 right-2 bg-black bg-opacity-40 text-white p-1.5 rounded-full hover:bg-opacity-60 transition-colors"
                                aria-label="Switch camera"
                            >
                                <SwitchCamera size={20} />
                            </button>
                        </div>
                        <div className="flex justify-around w-full gap-3 mt-1">
                            <button type="button" className={btnSecondary} onClick={closeWebcamModal} disabled={isProcessing}>Cancel</button>
                            <button type="button" className={btnPrimary} onClick={capturePhoto} disabled={!showWebcamModal || isProcessing}>Capture</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Cropper UI (Modal-like Overlay) --- */}
            {imageForCropper && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-85 p-3 sm:p-4"> {/* Increased z-index */}
                    <div className="bg-white p-3 sm:p-5 rounded-lg shadow-xl w-full max-w-sm relative">
                        {(isCropping || isFileReading) && (
                            <div className="absolute inset-0 bg-white bg-opacity-75 flex flex-col items-center justify-center z-10 rounded-lg">
                                <Loader2 size={30} className="mb-1 animate-spin text-blue-600"/>
                                <p className="text-sm font-medium text-gray-700">
                                    {isCropping ? "Processing..." : (isFileReading ? "Loading image..." : "Ready to crop")}
                                </p>
                            </div>
                        )}
                        <h2 className="text-center font-semibold text-lg mb-3 text-gray-800">Crop Your Photo</h2>
                        <div className="relative h-60 sm:h-72 w-full mb-3 bg-gray-200 rounded border border-gray-300 overflow-hidden">
                            <Cropper
                                image={imageForCropper} crop={crop} zoom={zoom} aspect={aspectRatio}
                                onCropChange={setCrop} onZoomChange={setZoom}
                                onCropComplete={onCropComplete} showGrid={true}
                            />
                        </div>
                        <div className="flex items-center mb-4 px-0 sm:px-2">
                            <span className="mr-2 text-xs text-gray-600">Zoom:</span>
                            <input
                                type="range" min="1" max="3" step="0.05" value={zoom}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-60"
                                disabled={isCropping || isFileReading}
                            />
                        </div>
                        <div className="flex justify-end gap-2 sm:gap-3 mt-1">
                            <button type="button" className={btnText} onClick={cancelCrop} disabled={isCropping || isFileReading}>Cancel</button>
                            <button type="button" className={btnPrimary} onClick={applyCroppedImage} disabled={isCropping || isFileReading}>
                                {isCropping ? "Applying..." : "Crop & Use"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

export default ImageCaptureCrop;



// import React, { useState, useCallback, useEffect, useRef } from "react";
// import { Camera as CameraIcon, SwitchCamera, Upload, XCircle } from "lucide-react";
// import Cropper from "react-easy-crop";
// import Webcam from "react-webcam";
// import {
//     Modal,
//     Box,
//     Button,
//     IconButton,
//     CircularProgress,
//     Typography,
//     Avatar, // For the circular preview
// } from "@mui/material";
// import { toast } from "react-toastify";
// // Ensure this path is correct for your project structure
// import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg";

// // --- Modal Style (for Webcam and Cropper) ---
// const modalStyle = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: '90%',
//     maxWidth: 500,
//     bgcolor: 'background.paper',
//     border: '1px solid #ccc',
//     borderRadius: '8px',
//     boxShadow: 24,
//     p: 4, // Padding for modal content
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
// };

// const cropperModalStyle = { // Slightly different for cropper overlay
//     position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.85)',
//     display: 'flex', alignItems: 'center', justifyContent: 'center',
//     p: { xs: 2, sm: 4 }, zIndex: 1500
// };

// const cropperContentStyle = {
//     bgcolor: 'background.paper', borderRadius: 2, p: {xs: 2, sm: 3},
//     width: '100%', maxWidth: 'sm', position: 'relative', boxShadow: 24
// };


// // --- Helper to convert Base64/Data URL to File ---
// const dataURLtoFile = (dataurl, filename) => {
//     if (!dataurl || typeof dataurl !== 'string' || !dataurl.includes(',')) {
//         console.error("Invalid data URL provided to dataURLtoFile:", dataurl);
//         return null;
//     }
//     try {
//         let arr = dataurl.split(','),
//             mimeMatch = arr[0].match(/:(.*?);/);
//         let mime = 'image/jpeg'; // Default fallback
//         if (mimeMatch && mimeMatch[1]) {
//             mime = mimeMatch[1];
//         } else {
//              if (arr[0].includes('/png')) mime = 'image/png';
//              else if (arr[0].includes('/webp')) mime = 'image/webp';
//         }
//         const bstr = atob(arr[arr.length - 1]);
//         let n = bstr.length;
//         const u8arr = new Uint8Array(n);
//         while (n--) {
//             u8arr[n] = bstr.charCodeAt(n);
//         }
//         return new File([u8arr], filename, { type: mime });
//     } catch (e) {
//         console.error("Error converting data URL to File:", e);
//         return null;
//     }
// };


// function ImageCaptureCrop({
//     onImageCropped, // Callback: (file: File | null) => void;
//     initialImageUrl = null,
//     aspectRatio = 1, // For the cropper
//     outputFilenamePrefix = "cropped_image",
//     label, // Optional text label above the component
//     previewSize = 120, // Size of the circular preview area
// }) {
//     // --- UI State ---
//     const [showWebcamModal, setShowWebcamModal] = useState(false);
//     const [imageForCropper, setImageForCropper] = useState(null); // Base64 string for cropper
//     const [currentImagePreview, setCurrentImagePreview] = useState(initialImageUrl);

//     // --- Loading States ---
//     const [isCropping, setIsCropping] = useState(false);
//     const [isFileReading, setIsFileReading] = useState(false);

//     // --- Webcam State ---
//     const webcamRef = useRef(null);
//     const [facingMode, setFacingMode] = useState("user");

//     // --- File Upload State ---
//     const fileInputRef = useRef(null);

//     // --- Cropper State ---
//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

//     // Effect to update preview when initialImageUrl changes from parent
//     useEffect(() => {
//         // Only update if it's truly different and not a blob URL we manage internally
//         if (initialImageUrl !== currentImagePreview && !(currentImagePreview && currentImagePreview.startsWith('blob:'))) {
//              setCurrentImagePreview(initialImageUrl);
//         }
//     }, [initialImageUrl]);

//     // Effect to revoke object URLs to prevent memory leaks
//     useEffect(() => {
//         const previewUrl = currentImagePreview; // Capture value for cleanup
//         return () => {
//             if (previewUrl && previewUrl.startsWith('blob:')) {
//                 URL.revokeObjectURL(previewUrl);
//             }
//         };
//     }, [currentImagePreview]);


//     // --- Webcam Callbacks ---
//     const openWebcam = useCallback(() => {
//         setShowWebcamModal(true);
//         setImageForCropper(null);
//         setIsFileReading(false);
//     }, []);

//     const closeWebcamModal = useCallback(() => {
//         setShowWebcamModal(false);
//     }, []);

//     const capturePhoto = useCallback(() => {
//         if (!webcamRef.current) {
//             toast.error("Webcam not ready.");
//             return;
//         }
//         const imageSrc = webcamRef.current.getScreenshot({ type: 'image/png' });
//         if (imageSrc) {
//             setShowWebcamModal(false);
//             setImageForCropper(imageSrc); // Set base64 for cropper
//         } else {
//             toast.error("Could not capture photo. Check camera permissions.");
//             closeWebcamModal();
//         }
//     }, [webcamRef, closeWebcamModal]);

//     const handleSwitchCamera = useCallback(() => {
//         setFacingMode(prevMode => (prevMode === "user" ? "environment" : "user"));
//     }, []);

//     // --- File Upload Callbacks ---
//     const triggerFileInput = useCallback(() => {
//         if (fileInputRef.current) {
//             fileInputRef.current.click();
//         }
//     }, []);

//     const handleFileSelect = useCallback((event) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         if (!file.type.startsWith('image/')) {
//             toast.error("Invalid file type. Please select an image.");
//             return;
//         }
//         setIsFileReading(true);
//         const reader = new FileReader();
//         reader.onload = (loadEvent) => {
//             const result = loadEvent.target?.result;
//             if (typeof result === 'string') {
//                 setImageForCropper(result); // Set Base64 source for the cropper
//             } else {
//                  toast.error("Could not read the selected file.");
//             }
//             setIsFileReading(false);
//         };
//         reader.onerror = () => {
//             toast.error("Error reading file.");
//             setIsFileReading(false);
//         };
//         reader.readAsDataURL(file);
//         event.target.value = ''; // Reset file input
//     }, []);

//     // --- Cropper Callbacks ---
//     const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsValue) => {
//         setCroppedAreaPixels(croppedAreaPixelsValue);
//     }, []);

//     const cancelCrop = useCallback(() => {
//         setImageForCropper(null);
//         setCroppedAreaPixels(null);
//         setCrop({ x: 0, y: 0 });
//         setZoom(1);
//         setIsCropping(false);
//         setIsFileReading(false);
//     }, []);

//     const applyCroppedImage = useCallback(async () => {
//         if (!imageForCropper || !croppedAreaPixels) {
//             toast.warn("Cropping data missing. Please try again.");
//             cancelCrop();
//             return;
//         }
//         setIsCropping(true);
//         try {
//             const croppedDataUrl = await getCroppedImg(imageForCropper, croppedAreaPixels, 0);
//             if (!croppedDataUrl || typeof croppedDataUrl !== 'string' || !croppedDataUrl.startsWith('data:image/')) {
//                  throw new Error("Failed to get cropped image data.");
//             }

//             const fileExtension = croppedDataUrl.substring("data:image/".length, croppedDataUrl.indexOf(";base64"));
//             const filename = `${outputFilenamePrefix}_${Date.now()}.${fileExtension || 'jpeg'}`;
//             const imageFile = dataURLtoFile(croppedDataUrl, filename);

//             if (!imageFile) {
//                 throw new Error("Failed to process cropped image file.");
//             }
            
//             // Revoke previous blob URL if it exists and is different
//             if (currentImagePreview && currentImagePreview.startsWith('blob:')) {
//                 URL.revokeObjectURL(currentImagePreview);
//             }

//             const newPreviewUrl = URL.createObjectURL(imageFile);
//             setCurrentImagePreview(newPreviewUrl);
//             onImageCropped(imageFile); // Pass File object to parent
//             cancelCrop();

//         } catch (error) {
//             console.error("Error during image cropping/processing:", error);
//             toast.error(`Failed to apply crop: ${error.message || 'Please try again.'}`);
//             cancelCrop();
//         } finally {
//             setIsCropping(false);
//         }
//     }, [imageForCropper, croppedAreaPixels, cancelCrop, getCroppedImg, onImageCropped, outputFilenamePrefix, currentImagePreview]);

//     const handleRemoveImage = () => {
//         if (currentImagePreview && currentImagePreview.startsWith('blob:')) {
//             URL.revokeObjectURL(currentImagePreview);
//         }
//         setCurrentImagePreview(null);
//         onImageCropped(null); // Notify parent that image is removed
//     };
    
//     const isProcessing = isCropping || isFileReading;

//     return (
//         <>
//             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: label ? 0.5 : 0, width: 'fit-content', marginX: 'auto' }}>
//                 {label && (
//                     <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, textAlign: 'center' }}>
//                         {label}
//                     </Typography>
//                 )}
//                 <Box sx={{ position: 'relative', width: previewSize, height: previewSize, mb: 1 }}>
//                     <Avatar
//                         src={currentImagePreview || undefined} // Avatar handles null/undefined gracefully
//                         alt={label || "Image preview"}
//                         sx={{
//                             width: '100%',
//                             height: '100%',
//                             bgcolor: 'grey.200', // Placeholder background
//                             border: `2px ${currentImagePreview ? 'solid lightgrey' : 'dashed grey.400'}`,
//                             '& .MuiAvatar-img': { // Ensure image content covers
//                                 objectFit: 'cover',
//                             }
//                         }}
//                     >
//                         {!currentImagePreview && <CameraIcon size={previewSize * 0.33} style={{ color: 'grey.500' }} />}
//                     </Avatar>

//                     {/* Action Buttons Container */}
//                     <Box
//                         sx={{
//                             position: 'absolute',
//                             bottom: -5, // Adjust for slight overlap/positioning
//                             right: -5,  // Adjust for slight overlap/positioning
//                             display: 'flex',
//                             gap: 0.75, // Space between the two small buttons
//                         }}
//                     >
//                         <IconButton // Camera Button (Orange/Coral)
//                             onClick={openWebcam}
//                             disabled={isProcessing}
//                             size="medium"
//                             sx={{
//                                 bgcolor: '#FF6F61', // Coral color
//                                 color: 'white',
//                                 '&:hover': { bgcolor: '#E65A50' },
//                                 boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
//                                 width: previewSize * 0.3, height: previewSize * 0.3, // Relative to previewSize
//                                 minWidth: 32, minHeight: 32 // Minimum size
//                             }}
//                             aria-label="Take Photo"
//                         >
//                             <CameraIcon size={previewSize * 0.15} />
//                         </IconButton>
//                         <IconButton // Upload Button (Blue)
//                             onClick={triggerFileInput}
//                             disabled={isProcessing}
//                             size="medium"
//                             sx={{
//                                 bgcolor: '#007AFF', // Blue color
//                                 color: 'white',
//                                 '&:hover': { bgcolor: '#0056b3' },
//                                 boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
//                                 width: previewSize * 0.3, height: previewSize * 0.3,
//                                 minWidth: 32, minHeight: 32
//                             }}
//                             aria-label="Upload File"
//                         >
//                             <Upload size={previewSize * 0.15} />
//                         </IconButton>
//                     </Box>

//                     {/* Remove Button (optional but good for UX) */}
//                     {currentImagePreview && (
//                         <IconButton
//                             onClick={handleRemoveImage}
//                             disabled={isProcessing}
//                             size="small"
//                             sx={{
//                                 position: 'absolute',
//                                 top: -previewSize * 0.06, // Adjust based on previewSize
//                                 right: -previewSize * 0.06,
//                                 bgcolor: 'rgba(255, 255, 255, 0.9)',
//                                 '&:hover': { bgcolor: 'grey.200' },
//                                 boxShadow: '0px 1px 3px rgba(0,0,0,0.15)',
//                                 color: 'text.secondary',
//                                 width: previewSize * 0.22, height: previewSize * 0.22,
//                                 minWidth: 24, minHeight: 24
//                             }}
//                             aria-label="Remove image"
//                         >
//                             <XCircle size={previewSize * 0.13} />
//                         </IconButton>
//                     )}
//                 </Box>
//             </Box>

//             {/* Hidden file input for triggering upload */}
//             <input
//                 type="file"
//                 ref={fileInputRef}
//                 onChange={handleFileSelect}
//                 accept="image/*" // Accepts all image types
//                 style={{ display: "none" }}
//                 disabled={isProcessing}
//             />

//             {/* --- Webcam Modal --- */}
//             <Modal open={showWebcamModal} onClose={closeWebcamModal} aria-labelledby="webcam-modal-title">
//                  <Box sx={modalStyle}>
//                     <Typography variant="h6" id="webcam-modal-title" sx={{ mb: 1 }}>Capture Photo</Typography>
//                     {showWebcamModal && (
//                         <Box sx={{ width: '100%', position: 'relative', mb: 2, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
//                             <Webcam
//                                 audio={false} ref={webcamRef} screenshotFormat="image/png"
//                                 width="100%" height="auto"
//                                 videoConstraints={{ facingMode: facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }}
//                                 style={{ display: 'block', borderRadius: '4px' }}
//                                 mirrored={facingMode === 'user'}
//                                 onUserMediaError={(err) => { console.error("Webcam UserMedia Error:", err); toast.error(`Camera Error: ${err.name}. Check permissions.`); closeWebcamModal(); }}
//                             />
//                             <IconButton onClick={handleSwitchCamera} size="small" sx={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' } }} aria-label="Switch camera">
//                                 <SwitchCamera size={20} />
//                             </IconButton>
//                         </Box>
//                     )}
//                     <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', gap: 2, mt:1 }}>
//                         <Button variant="outlined" color="secondary" onClick={closeWebcamModal}>Cancel</Button>
//                         <Button variant="contained" color="primary" onClick={capturePhoto} disabled={!showWebcamModal || isProcessing}>Capture</Button>
//                     </Box>
//                 </Box>
//             </Modal>

//             {/* --- Cropper UI (Modal-like Overlay) --- */}
//             {imageForCropper && (
//                 <Box sx={cropperModalStyle}>
//                     <Box sx={cropperContentStyle}>
//                         {(isCropping || isFileReading) && (
//                             <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 2 }}>
//                                 <CircularProgress size={30} sx={{ mb: 1 }}/>
//                                 <Typography variant="body1" color="text.secondary">
//                                     {isCropping ? "Processing..." : (isFileReading ? "Loading image..." : "Ready to crop")}
//                                 </Typography>
//                             </Box>
//                         )}
//                         <Typography variant="h6" align="center" sx={{ mb: 2 }}>Crop Your Photo</Typography>
//                         <Box sx={{ position: 'relative', height: {xs: 250, sm: 300}, width: '100%', mb: 2, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
//                             <Cropper
//                                 image={imageForCropper} crop={crop} zoom={zoom} aspect={aspectRatio}
//                                 onCropChange={setCrop} onZoomChange={setZoom}
//                                 onCropComplete={onCropComplete} showGrid={true}
//                             />
//                         </Box>
//                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, px: { xs: 0, sm: 2} }}>
//                             <Typography variant="caption" sx={{ mr: 1.5, color: 'text.secondary' }}>Zoom:</Typography>
//                             <input
//                                 type="range" min="1" max="3" step="0.05" value={zoom}
//                                 onChange={(e) => setZoom(Number(e.target.value))}
//                                 style={{ width: '100%', height: '8px', accentColor: '#1976d2', cursor: 'pointer' }}
//                                 disabled={isCropping || isFileReading}
//                             />
//                         </Box>
//                         <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, mt:1 }}>
//                             <Button variant="text" color="secondary" onClick={cancelCrop} disabled={isCropping || isFileReading}>Cancel</Button>
//                             <Button variant="contained" color="primary" onClick={applyCroppedImage} disabled={isCropping || isFileReading}>
//                                 {isCropping ? "Applying..." : "Crop & Use"}
//                             </Button>
//                         </Box>
//                     </Box>
//                 </Box>
//             )}
//         </>
//     );
// }

// export default ImageCaptureCrop;



// import React, { useState, useCallback, useEffect, useRef } from "react";
// import { Camera as CameraIcon, SwitchCamera, Upload, XCircle } from "lucide-react"; // Added XCircle for remove
// import Cropper from "react-easy-crop";
// import Webcam from "react-webcam";
// import {
//     Modal,
//     Box,
//     Button,
//     IconButton,
//     CircularProgress,
//     Typography,
//     Menu, // For a small menu to choose between camera/upload
//     MenuItem,
//     ListItemIcon,
//     ListItemText,
//     Avatar, // For a nice preview
// } from "@mui/material";
// import { toast } from "react-toastify";
// import getCroppedImg from "../Form/Admission/getCroppedImg"; // Ensure this path is correct

// // --- Modal Style --- (Keep existing style)
// const modalStyle = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: '90%',
//     maxWidth: 500,
//     bgcolor: 'background.paper',
//     border: '1px solid #ccc',
//     borderRadius: '8px',
//     boxShadow: 24,
//     p: 4,
//     display: 'flex',
//     flexDirection: 'column',
//     alignItems: 'center',
// };

// // --- Helper to convert Base64/Data URL to File ---
// const dataURLtoFile = (dataurl, filename) => {
//     if (!dataurl || typeof dataurl !== 'string' || !dataurl.includes(',')) {
//         console.error("Invalid data URL provided to dataURLtoFile:", dataurl);
//         return null;
//     }
//     try {
//         let arr = dataurl.split(','),
//             mimeMatch = arr[0].match(/:(.*?);/);
//         let mime = 'image/jpeg';
//         if (mimeMatch && mimeMatch[1]) {
//             mime = mimeMatch[1];
//         } else {
//              if (arr[0].includes('/png')) mime = 'image/png';
//              else if (arr[0].includes('/webp')) mime = 'image/webp';
//         }
//         const bstr = atob(arr[arr.length - 1]);
//         let n = bstr.length;
//         const u8arr = new Uint8Array(n);
//         while (n--) {
//             u8arr[n] = bstr.charCodeAt(n);
//         }
//         return new File([u8arr], filename, { type: mime });
//     } catch (e) {
//         console.error("Error converting data URL to File:", e);
//         return null;
//     }
// };


// // --- The Reusable Image Capture/Crop Component ---
// function ImageCaptureCrop({
//     onImageCropped, // (file: File | null) => void;
//     initialImageUrl = null,
//     aspectRatio = 1,
//     buttonTrigger, // Optional: React.ReactNode for a custom trigger
//     showPreview = true,
//     outputFilenamePrefix = "cropped_image",
// }) {
//     // --- UI State ---
//     const [showWebcamModal, setShowWebcamModal] = useState(false);
//     const [imageForCropper, setImageForCropper] = useState(null); // Base64 string for cropper
//     const [currentImagePreview, setCurrentImagePreview] = useState(initialImageUrl); // URL for the <img> tag or Avatar

//     // --- Loading States ---
//     const [isCropping, setIsCropping] = useState(false);
//     const [isFileReading, setIsFileReading] = useState(false);

//     // --- Webcam State ---
//     const webcamRef = useRef(null);
//     const [facingMode, setFacingMode] = useState("user");

//     // --- File Upload State ---
//     const fileInputRef = useRef(null);

//     // --- Cropper State ---
//     const [crop, setCrop] = useState({ x: 0, y: 0 });
//     const [zoom, setZoom] = useState(1);
//     const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

//     // --- Menu Anchor for Upload/Camera choice ---
//     const [anchorEl, setAnchorEl] = useState(null);
//     const openMenu = Boolean(anchorEl);

//     const handleMenuClick = (event) => {
//         setAnchorEl(event.currentTarget);
//     };
//     const handleMenuClose = () => {
//         setAnchorEl(null);
//     };

//     // Effect to update preview when initialImageUrl changes
//     useEffect(() => {
//         setCurrentImagePreview(initialImageUrl);
//     }, [initialImageUrl]);

//     // Effect to revoke object URLs to prevent memory leaks
//     useEffect(() => {
//         return () => {
//             if (currentImagePreview && currentImagePreview.startsWith('blob:')) {
//                 URL.revokeObjectURL(currentImagePreview);
//             }
//         };
//     }, [currentImagePreview]);


//     // --- Webcam Callbacks ---
//     const openWebcam = useCallback(() => {
//         handleMenuClose();
//         setShowWebcamModal(true);
//         setImageForCropper(null); // Clear previous cropper source
//         setIsFileReading(false);
//     }, []);

//     const closeWebcamModal = useCallback(() => {
//         setShowWebcamModal(false);
//     }, []);

//     const capturePhoto = useCallback(() => {
//         if (!webcamRef.current) {
//             toast.error("Webcam not ready.");
//             return;
//         }
//         const imageSrc = webcamRef.current.getScreenshot({ type: 'image/png' }); // Capture PNG for quality
//         if (imageSrc) {
//             setShowWebcamModal(false);
//             setImageForCropper(imageSrc);
//         } else {
//             toast.error("Could not capture photo. Check camera permissions.");
//             closeWebcamModal();
//         }
//     }, [webcamRef, closeWebcamModal]);

//     const handleSwitchCamera = useCallback(() => {
//         setFacingMode(prevMode => (prevMode === "user" ? "environment" : "user"));
//     }, []);

//     // --- File Upload Callbacks ---
//     const triggerFileInput = useCallback(() => {
//         handleMenuClose();
//         if (fileInputRef.current) {
//             fileInputRef.current.click();
//         }
//     }, []);

//     const handleFileSelect = useCallback((event) => {
//         const file = event.target.files?.[0];
//         if (!file) return;

//         if (!file.type.startsWith('image/')) {
//             toast.error("Invalid file type. Please select an image.");
//             return;
//         }
//         setIsFileReading(true);
//         const reader = new FileReader();
//         reader.onload = (loadEvent) => {
//             const result = loadEvent.target?.result;
//             if (typeof result === 'string') {
//                 setImageForCropper(result);
//             } else {
//                  toast.error("Could not read the selected file.");
//             }
//             setIsFileReading(false);
//         };
//         reader.onerror = () => {
//             toast.error("Error reading file.");
//             setIsFileReading(false);
//         };
//         reader.readAsDataURL(file);
//         event.target.value = ''; // Reset file input
//     }, []);

//     // --- Cropper Callbacks ---
//     const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsValue) => {
//         setCroppedAreaPixels(croppedAreaPixelsValue);
//     }, []);

//     const cancelCrop = useCallback(() => {
//         setImageForCropper(null);
//         setCroppedAreaPixels(null);
//         setCrop({ x: 0, y: 0 });
//         setZoom(1);
//         setIsCropping(false);
//         setIsFileReading(false);
//     }, []);

//     const applyCroppedImage = useCallback(async () => {
//         if (!imageForCropper || !croppedAreaPixels) {
//             toast.warn("Cropping data missing. Please try again.");
//             cancelCrop();
//             return;
//         }
//         setIsCropping(true);
//         try {
//             const croppedDataUrl = await getCroppedImg(imageForCropper, croppedAreaPixels, 0);
//             if (!croppedDataUrl || typeof croppedDataUrl !== 'string' || !croppedDataUrl.startsWith('data:image/')) {
//                  throw new Error("Failed to get cropped image data.");
//             }

//             const fileExtension = croppedDataUrl.substring("data:image/".length, croppedDataUrl.indexOf(";base64"));
//             const filename = `${outputFilenamePrefix}_${Date.now()}.${fileExtension || 'jpeg'}`;
//             const imageFile = dataURLtoFile(croppedDataUrl, filename);

//             if (!imageFile) {
//                 throw new Error("Failed to process cropped image file.");
//             }
            
//             // Revoke previous blob URL if it exists
//             if (currentImagePreview && currentImagePreview.startsWith('blob:')) {
//                 URL.revokeObjectURL(currentImagePreview);
//             }

//             const newPreviewUrl = URL.createObjectURL(imageFile);
//             setCurrentImagePreview(newPreviewUrl); // Update preview with blob URL
//             onImageCropped(imageFile); // Pass File object to parent
//             cancelCrop(); // Close cropper

//         } catch (error) {
//             console.error("Error during image cropping/processing:", error);
//             toast.error(`Failed to apply crop: ${error.message || 'Please try again.'}`);
//             cancelCrop();
//         } finally {
//             setIsCropping(false);
//         }
//     }, [imageForCropper, croppedAreaPixels, cancelCrop, getCroppedImg, onImageCropped, outputFilenamePrefix, currentImagePreview]);

//     const handleRemoveImage = () => {
//         if (currentImagePreview && currentImagePreview.startsWith('blob:')) {
//             URL.revokeObjectURL(currentImagePreview);
//         }
//         setCurrentImagePreview(null);
//         onImageCropped(null); // Notify parent that image is removed
//     };
    
//     const isProcessing = isCropping || isFileReading;

//     return (
//         <>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
//                 {showPreview && (
//                     <Avatar 
//                         src={currentImagePreview || undefined} // Avatar handles null/undefined gracefully
//                         sx={{ width: 80, height: 80, bgcolor: 'grey.300', border: '1px solid lightgrey' }}
//                         imgProps={{ style: { objectFit: 'cover' } }}
//                     >
//                         {!currentImagePreview && <CameraIcon size={32} color="action" />}
//                     </Avatar>
//                 )}
//                 <Box>
//                     {buttonTrigger ? (
//                         React.cloneElement(buttonTrigger, { onClick: handleMenuClick, disabled: isProcessing })
//                     ) : (
//                         <Button
//                             variant="outlined"
//                             onClick={handleMenuClick}
//                             disabled={isProcessing}
//                             startIcon={isProcessing ? <CircularProgress size={20} /> : <Upload size={18} />}
//                         >
//                             {currentImagePreview ? "Change Photo" : "Set Photo"}
//                         </Button>
//                     )}
//                      {currentImagePreview && showPreview && (
//                         <IconButton
//                             onClick={handleRemoveImage}
//                             size="small"
//                             color="error"
//                             sx={{ ml: 1,  }}
//                             aria-label="Remove image"
//                             disabled={isProcessing}
//                         >
//                             <XCircle size={20} />
//                         </IconButton>
//                     )}
//                 </Box>
//                  <input
//                     type="file"
//                     ref={fileInputRef}
//                     onChange={handleFileSelect}
//                     accept="image/*"
//                     style={{ display: "none" }}
//                     disabled={isProcessing}
//                 />
//             </Box>

//             <Menu
//                 anchorEl={anchorEl}
//                 open={openMenu}
//                 onClose={handleMenuClose}
//                 anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
//                 transformOrigin={{ vertical: 'top', horizontal: 'left' }}
//             >
//                 <MenuItem onClick={openWebcam} disabled={isProcessing}>
//                     <ListItemIcon><CameraIcon size={20} /></ListItemIcon>
//                     <ListItemText>Take Photo</ListItemText>
//                 </MenuItem>
//                 <MenuItem onClick={triggerFileInput} disabled={isProcessing}>
//                     <ListItemIcon><Upload size={20} /></ListItemIcon>
//                     <ListItemText>Upload File</ListItemText>
//                 </MenuItem>
//             </Menu>

//             {/* --- Webcam Modal --- */}
//             <Modal open={showWebcamModal} onClose={closeWebcamModal} aria-labelledby="webcam-modal-title">
//                  <Box sx={modalStyle}>
//                     <Typography variant="h6" id="webcam-modal-title" sx={{ mb: 2 }}>Capture Photo</Typography>
//                     {showWebcamModal && ( // Conditionally render Webcam to re-initialize on open
//                         <Box sx={{ width: '100%', position: 'relative', mb: 2, border: '1px solid #ddd', borderRadius: 1, overflow: 'hidden' }}>
//                             <Webcam
//                                 audio={false} ref={webcamRef} screenshotFormat="image/png"
//                                 width="100%" height="auto"
//                                 videoConstraints={{ facingMode: facingMode, width: 1280, height: 720 }} // Added resolution constraints
//                                 style={{ display: 'block', borderRadius: '4px' }}
//                                 mirrored={facingMode === 'user'}
//                                 onUserMediaError={(err) => { console.error("Webcam UserMedia Error:", err); toast.error(`Camera Error: ${err.name}. Check permissions.`); closeWebcamModal(); }}
//                             />
//                             <IconButton onClick={handleSwitchCamera} size="small" sx={{ position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(0,0,0,0.4)', color: 'white', '&:hover': { backgroundColor: 'rgba(0,0,0,0.6)' } }} aria-label="Switch camera">
//                                 <SwitchCamera size={20} />
//                             </IconButton>
//                         </Box>
//                     )}
//                     <Box sx={{ display: 'flex', justifyContent: 'space-around', width: '100%', gap: 2 }}>
//                         <Button variant="outlined" color="secondary" onClick={closeWebcamModal}>Cancel</Button>
//                         <Button variant="contained" color="primary" onClick={capturePhoto} disabled={!showWebcamModal}>Capture</Button>
//                     </Box>
//                 </Box>
//             </Modal>

//             {/* --- Cropper UI (Modal-like Overlay) --- */}
//             {imageForCropper && (
//                 <Box sx={{
//                     position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.85)',
//                     display: 'flex', alignItems: 'center', justifyContent: 'center',
//                     p: { xs: 2, sm: 4 }, zIndex: 1500 // High z-index
//                 }}>
//                     <Box sx={{
//                         bgcolor: 'background.paper', borderRadius: 2, p: {xs: 2, sm: 3},
//                         width: '100%', maxWidth: 'sm', position: 'relative', boxShadow: 24
//                     }}>
//                         {(isCropping || isFileReading) && ( // Show loader inside cropper too if file is still reading for cropper
//                             <Box sx={{ position: 'absolute', inset: 0, bgcolor: 'rgba(255,255,255,0.75)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10, borderRadius: 2 }}>
//                                 <CircularProgress size={30} sx={{ mb: 1 }}/>
//                                 <Typography variant="body1" color="text.secondary">
//                                     {isCropping ? "Processing..." : "Loading image..."}
//                                 </Typography>
//                             </Box>
//                         )}
//                         <Typography variant="h6" align="center" sx={{ mb: 2 }}>Crop Your Photo</Typography>
//                         <Box sx={{ position: 'relative', height: {xs: 250, sm: 300}, width: '100%', mb: 2, bgcolor: 'grey.200', borderRadius: 1, overflow: 'hidden', border: '1px solid #ddd' }}>
//                             <Cropper
//                                 image={imageForCropper} crop={crop} zoom={zoom} aspect={aspectRatio}
//                                 onCropChange={setCrop} onZoomChange={setZoom}
//                                 onCropComplete={onCropComplete} showGrid={true}
//                                 classes={{ containerClassName: 'cropper-container-styles' }} // For custom CSS if needed
//                             />
//                         </Box>
//                         <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, px: { xs: 0, sm: 2} }}>
//                             <Typography variant="caption" sx={{ mr: 1.5, color: 'text.secondary' }}>Zoom:</Typography>
//                             <input
//                                 type="range" min="1" max="3" step="0.05" value={zoom}
//                                 onChange={(e) => setZoom(Number(e.target.value))}
//                                 style={{ width: '100%', height: '8px', accentColor: '#1976d2', cursor: 'pointer' }} // MUI primary color
//                                 disabled={isCropping || isFileReading}
//                             />
//                         </Box>
//                         <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
//                             <Button variant="text" color="secondary" onClick={cancelCrop} disabled={isCropping || isFileReading}>Cancel</Button>
//                             <Button variant="contained" color="primary" onClick={applyCroppedImage} disabled={isCropping || isFileReading}>
//                                 {isCropping ? "Applying..." : "Crop & Use"}
//                             </Button>
//                         </Box>
//                     </Box>
//                 </Box>
//             )}
//         </>
//     );
// }

// export default ImageCaptureCrop;
