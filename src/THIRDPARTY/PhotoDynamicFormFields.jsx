import React, { useState, useCallback, useEffect } from "react";
import { Camera } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./getCroppedImg";
import Modal from "../../src/Dynamic/Modal";
import {
  FormControl,
  InputLabel,
  Select,
  TextField,
  MenuItem,
} from "@mui/material";
import Button from "../../src/Dynamic/utils/Button";
import {
  initialstudentphoto,
  thirdpartyphotorecords,
} from "../Network/ThirdPartyApi";
import { toast } from "react-toastify";
import { useStateContext } from "../contexts/ContextProvider";
import imageCompression from "browser-image-compression";

function PhotoDynamicFormFields(props) {
  const { photoData, buttonLabel, setIsOpen, setReRender } = props;
  const { currentColor, isLoader, setIsLoader } = useStateContext();
  const [getClass, setGetClass] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [values, setValues] = useState({
    studentName: "",
    class: "",
    section: "",
    studentImage: null,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageSource, setCroppedImageSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPhotoType, setCurrentPhotoType] = useState(null);

  const schoolID = localStorage.getItem("SchoolID");

  useEffect(() => {
    const classes = JSON.parse(localStorage.getItem("classes"));
    if (classes) {
      setGetClass(classes);
    }
  }, []);

  useEffect(() => {
    if (photoData) {
      const selectedClassObj = getClass.find(
        (cls) => cls.className === photoData.class
      );
      if (selectedClassObj && selectedClassObj.sections) {
        setAvailableSections(selectedClassObj.sections.split(/\s*,\s*/));
      }
      setValues({
        studentName: photoData.studentName || "",
        class: photoData.class || "",
        section: photoData.section || "",
        studentImage: photoData.studentImage?.url || null,
      });
    }
  }, [photoData, getClass]);

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setValues((prevData) => ({
      ...prevData,
      class: selectedClassName,
      section: "",
    }));
    const selectedClassObj = getClass.find(
      (cls) => cls.className === selectedClassName
    );
    if (selectedClassObj && selectedClassObj.sections) {
      setAvailableSections(
        Array.isArray(selectedClassObj.sections)
          ? selectedClassObj.sections
          : selectedClassObj.sections.split(/\s*,\s*/)
      );
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleImageChange = async (e, photoType) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      // Compression options
      const options = {
        maxSizeMB: 1, // Compress to max 1 MB
        maxWidthOrHeight: 1024, // Resize to max 1024px
        useWebWorker: true,
      };
      // Compress the image first
      const compressedFile = await imageCompression(file, options);

      // Check compressed file size
      if (compressedFile.size > 2 * 1024 * 1024) {
        toast.error("Compressed file size is too large! Maximum 2 MB allowed.");
        return;
      }

      // Set photo type and prepare for cropping
      setCurrentPhotoType(photoType);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppedImageSource(reader.result);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      toast.error("Failed to compress image. Please try again.");
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const cancelCrop = useCallback(() => {
    setCroppedImageSource(null);
    setCurrentPhotoType(null);
  }, []);

  const showCroppedImage = async () => {
    try {
      const croppedImageUrl = await getCroppedImg(
        croppedImageSource,
        croppedAreaPixels
      );
      if (!croppedImageUrl) {
        toast.error("Failed to crop image.");
        return;
      }
      setCroppedImageSource(null);

      const getFileFromUrl = async (url, fileName = "image.jpeg") => {
        const data = await fetch(url);
        const blob = await data.blob();
        return new Promise((resolve) => {
          const img = new Image();
          img.src = URL.createObjectURL(blob);
          img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            canvas.toBlob(
              (jpegBlob) => {
                const file = new File([jpegBlob], fileName, {
                  type: "image/jpeg",
                });
                resolve(file);
              },
              "image/jpeg",
              0.9
            );
          };
        });
      };

      const imageFile = await getFileFromUrl(
        croppedImageUrl,
        `${currentPhotoType}.jpeg`
      );
      setValues((prev) => ({ ...prev, studentImage: imageFile }));
      setCurrentPhotoType(null);
    } catch (error) {
      console.error("Error cropping image:", error);
      toast.error("Failed to crop image.");
    }
  };

  const handleSaveClick = async () => {
    if (!values.studentImage) {
      toast.warn("Please upload a student image");
      return;
    }

    setIsLoader(true);
    setLoading(true);

    try {
      const photoData = {
        schoolId: schoolID,
        studentName: values.studentName || "",
        class: values.class || "",
        section: values.section || "",
      };

      const formDataToSend = new FormData();
      Object.entries(photoData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      if (values.studentImage) {
        formDataToSend.append("studentImage", values.studentImage);
      }

      const response = await initialstudentphoto(formDataToSend);

      if (response.success) {
        setIsLoader(false);
        setValues({
          studentName: "",
          class: "",
          section: "",
          studentImage: null,
        });
        toast.success("Photo saved successfully!");
        setReRender(true);
        setIsOpen && setIsOpen(false);
      } else {
        setIsLoader(false);
        toast.error(response?.message || "Failed to save photo");
      }
    } catch (error) {
      setIsLoader(false);
      console.error("Error during photo save:", error);
      toast.error(error?.message || "An error occurred while saving the photo");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateClick = async () => {
    setIsLoader(true);
    setLoading(true);

    try {
      const photoData = {
        schoolId: schoolID,
        studentName: values.studentName || "",
        class: values.class || "",
        section: values.section || "",
      };

      const formDataToSend = new FormData();
      Object.entries(photoData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      if (values.studentImage instanceof File) {
        formDataToSend.append("studentImage", values.studentImage);
      }

      const response = await fetch(
        `https://dvsserver.onrender.com/api/v1/thirdparty/photo/${photoData.photoId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: formDataToSend,
        }
      );

      const result = await response.json();

      if (result.success) {
        setIsLoader(false);
        setReRender(true);
        setIsOpen && setIsOpen(false);
        toast.success("Photo updated successfully!");
        setValues({
          studentName: "",
          class: "",
          section: "",
          studentImage: null,
        });
      } else {
        setIsLoader(false);
        toast.error(result.message || "Failed to update photo");
      }
    } catch (error) {
      setIsLoader(false);
      console.error("Error updating photo:", error);
      toast.error(
        error?.message || "An error occurred while updating the photo"
      );
    } finally {
      setLoading(false);
    }
  };

  if (croppedImageSource) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg p-4 w-full max-w-[90vw]">
          <div className="relative h-64 w-full">
            <Cropper
              image={croppedImageSource}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={cancelCrop}
              className="px-4 py-2 bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={showCroppedImage}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Crop
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="selection:bg-[#2fa7db] selection:text-white">
      <div className="flex justify-center" style={{ minWidth: "90vw" }}>
        <div className="flex-1 m-2">
          <div className="w-full bg-white mx-auto overflow-hidden">
            <div
              className="relative h-[130px] px-5 pt-1 rounded-bl-4xl"
              style={{ background: currentColor }}
            >
              <h1 className="absolute top-0 text-xl font-semibold text-white pl-2">
                Photo Details
              </h1>
              <div className="flex ml-2 mb-6">
                <div className="absolute top-5">
                  {values.studentImage ? (
                    <img
                      src={
                        values.studentImage instanceof File
                          ? URL.createObjectURL(values.studentImage)
                          : values.studentImage
                      }
                      alt="studentImage"
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                      <span className="text-[#ee582c]">NO IMAGE</span>
                    </div>
                  )}
                  <label className="absolute bottom-0 right-0 bg-[#ee582c] text-white p-2 rounded-full cursor-pointer">
                    <Camera size={18} />
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageChange(e, "studentImage")}
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="px-6 pb-8 bg-white rounded-tr-4xl">
              <form className="" action="" method="POST">
                <div className="relative mt-4">
                  <input
                    type="text"
                    name="studentName"
                    placeholder="Student Name"
                    value={values.studentName}
                    onChange={handleInputChange}
                    id="studentName"
                    className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
                  />
                  <label
                    htmlFor="studentName"
                    className="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
                  >
                    Student Name
                  </label>
                </div>
                <div className="flex justify-center items-center gap-2">
                  <FormControl
                    variant="standard"
                    sx={{
                      mt: 1,
                      width: "100%",
                      "& .MuiInputLabel-root": { color: "#ee582c" },
                      "& .MuiSelect-root": { color: "#2fa7db" },
                      "& .MuiSelect-icon": { color: "#ee582c" },
                      "&:before": { borderBottom: "2px solid #ee582c" },
                      "&:after": { borderBottom: "2px solid #ee582c" },
                    }}
                  >
                    <InputLabel id="class-label">Class</InputLabel>
                    <Select
                      value={values.class}
                      labelId="class-label"
                      id="class-select"
                      onChange={handleClassChange}
                      label="Class"
                      name="class"
                      sx={{
                        color: "#2fa7db",
                        "& .MuiSelect-icon": { color: "#ee582c" },
                        "&:before": { borderBottom: "2px solid #ee582c" },
                        "&:after": { borderBottom: "2px solid #ee582c" },
                        "&:hover:not(.Mui-disabled, .Mui-error):before": {
                          borderBottom: "2px solid #ee582c",
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select a Class
                      </MenuItem>
                      {getClass?.map((cls, index) => (
                        <MenuItem key={index} value={cls.className}>
                          {cls.className}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <FormControl
                    variant="standard"
                    sx={{
                      mt: 1,
                      width: "100%",
                      "& .MuiInputLabel-root": { color: "#ee582c" },
                      "& .MuiSelect-root": { color: "#2fa7db" },
                      "& .MuiSelect-icon": { color: "#ee582c" },
                      "&:before": { borderBottom: "2px solid #ee582c" },
                      "&:after": { borderBottom: "2px solid #ee582c" },
                    }}
                  >
                    <InputLabel id="section-label">Section</InputLabel>
                    <Select
                      value={values.section}
                      onChange={handleSectionChange}
                      labelId="section-label"
                      id="section-select"
                      label="Section"
                      name="section"
                      sx={{
                        color: "#2fa7db",
                        "& .MuiSelect-icon": { color: "#ee582c" },
                        "&:before": { borderBottom: "2px solid #ee582c" },
                        "&:after": { borderBottom: "2px solid #ee582c" },
                        "&:hover:not(.Mui-disabled, .Mui-error):before": {
                          borderBottom: "2px solid #ee582c",
                        },
                      }}
                    >
                      <MenuItem value="" disabled>
                        Select a Section
                      </MenuItem>
                      {availableSections.length > 0 ? (
                        availableSections.map((sec, index) => (
                          <MenuItem key={index} value={sec}>
                            {sec}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No Sections Available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </div>
              </form>
            </div>
            <div className="px-4 shadow-xl bg-white">
              {buttonLabel === "Save" ? (
                <button
                  className="w-full bg-[#2fa7db] text-white rounded-md mb-5 py-2"
                  onClick={handleSaveClick}
                  disabled={loading}
                >
                  {loading ? "Saving..." : buttonLabel}
                </button>
              ) : (
                <button
                  className="w-full bg-[#2fa7db] text-white rounded-md mb-14 py-2"
                  onClick={handleUpdateClick}
                  disabled={loading}
                >
                  {loading ? "Updating..." : buttonLabel}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PhotoDynamicFormFields;
