  import React, { useState, useCallback, useEffect } from "react";
  import { Camera } from "lucide-react";
  import Cropper from "react-easy-crop";
  import { FormControl, InputLabel, Select, TextField,MenuItem  } from "@mui/material";
  import {
    initialstudentphoto,
  } from "../../Network/ThirdPartyApi";
  import { toast } from "react-toastify";
  import { useStateContext } from "../../contexts/ContextProvider";
  import getCroppedImg from "../../Dynamic/Form/Admission/getCroppedImg";
  function DynamicFormFileds(props) {
    const { studentData, buttonLabel, setIsOpen, setReRender } = props;
    console.log("studentData",studentData)
    const { currentColor, isLoader, setIsLoader } = useStateContext();
    const [getClass, setGetClass] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
    const [values, setValues] = useState({
      fullName: "",
      class: "",
      section: "",
    
    });
  
    useEffect(() => {
      const classes = JSON.parse(localStorage.getItem("classes"));
      if (classes) {
        setGetClass(classes);
      }
    }, []);

    useEffect(() => {
        if (studentData) {
    
          const selectedClassObj = getClass.find((cls) => cls.className === studentData.class);
          if (selectedClassObj && selectedClassObj.sections) {
            setAvailableSections(selectedClassObj.sections.split(/\s*,\s*/));
          }
        }
      }, [studentData, getClass]);
    
    useEffect(() => {
      const classes = JSON.parse(localStorage.getItem("classes"));
      if (classes) {
        setGetClass(classes);
      }
    }, []);
    
    const handleClassChange = (e) => {
      const selectedClassName = e.target.value;
    
      setValues((prevData) => ({
        ...prevData,
        class: selectedClassName,
        section: "", // Reset section when class changes
      }));
      const selectedClassObj = getClass.find((cls) => cls.className === selectedClassName);
      if (selectedClassObj && selectedClassObj.sections) {
        setAvailableSections(
          Array.isArray(selectedClassObj.sections) ? selectedClassObj.sections : selectedClassObj.sections.split(/\s*,\s*/)
        );
      } else {
        setAvailableSections([]);
      }
    };
    
    // 🟢 Section Change Handle Karna
    const handleSectionChange = (e) => {
      setValues((prevData) => ({
        ...prevData,
        section: e.target.value,
      }));
    };
    const schoolID = localStorage.getItem("SchoolID");

    // const handleImageChange = (e, photoType) => {
    //   if (!["image/jpeg", "image/png"].includes(file.type)) {
    //     alert("Please upload a JPEG or PNG image.");
    //     return;
    //   }
    //   const file = e.target.files[0];
    //   if (!file) return;
    
    //   // File size check (5 MB limit)
    //   if (file.size > 5 * 1024 * 1024) {
    //     alert("File size is too large! (Max 5 MB)");
    //     return;
    //   }
    
    //   setCurrentPhotoType(photoType);
    //   const reader = new FileReader();
    //   reader.onloadend = () => {
    //     setCroppedImageSource(reader.result);
    //   };
    //   reader.readAsDataURL(file);
    // };
    const handleImageChange = (e, photoType) => {
      const file = e.target.files[0];
      if (!file) return;
    
      if (!["image/jpeg", "image/png"].includes(file.type)) {
        alert("Please upload a JPEG or PNG image.");
        return;
      }
    
      // File size check (5 MB limit)
      if (file.size > 5 * 1024 * 1024) {
        alert("File size is too large! (Max 5 MB)");
        return;
      }
    
      setCurrentPhotoType(photoType);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCroppedImageSource(reader.result);
      };
      reader.readAsDataURL(file);
    };
    
    const handleSaveClick = async () => {
    
      setLoading(true);
      setIsLoader(true);

      try {
        const studentData = {
          schoolId: schoolID,
          studentName: values?.fullName || "",
          class: values?.class || "",
          section: values?.section || "",
        };

        const formDataToSend = new FormData();

        Object.entries(studentData).forEach(([key, value]) => {
          formDataToSend.append(key, String(value));
        });

        if (values.studentImage) {
          formDataToSend.append("studentImage", values.studentImage);
        }
      

        const response = await initialstudentphoto(formDataToSend);

        if (response.success) {
          setIsLoader(false);
          setValues({
            admissionNumber: "",
            studentName: "",
            class: "",
            section: "",
          
          });
          toast.success("Admission successfully!");
          setReRender(true);
          setIsOpen(false);
        } else {
          toast.error(response?.message)
          setIsLoader(false);
          toast.error(response?.data?.message);
        }
      } catch (error) {
        setIsLoader(false);
        console.error("Error during admission:", error);
        if (error.response && error.response.status === 400) {
          toast.error("Invalid data. Please check your inputs.");
        } else if (error.response && error.response.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          console.log("An unexpected error occurred.");
        }
      } finally {
        setLoading(false);
        setIsLoader(false);
      }
    };

    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [croppedImageSource, setCroppedImageSource] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentPhotoType, setCurrentPhotoType] = useState(null);
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setValues({ ...values, [name]: value });

    };
  
    const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
      setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const cancelCrop = useCallback(() => {
      setCroppedImageSource(null);
    }, [setCroppedImageSource]);

    const showCroppedImage = async () => {
      try {
        const croppedImageUrl = await getCroppedImg(
          croppedImageSource,
          croppedAreaPixels
        );
        setCroppedImageSource(null);
        const getFileFromUrl = async (url, fileName = "image.jpeg") => {
          const data = await fetch(url);
          const blob = await data.blob();
    
          // Convert blob to JPEG format using canvas
          return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(blob);
            img.onload = () => {
              const canvas = document.createElement("canvas");
              canvas.width = img.width;
              canvas.height = img.height;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              canvas.toBlob((jpegBlob) => {
                const file = new File([jpegBlob], fileName, {
                  type: "image/jpeg",
                });
                resolve(file);
              }, "image/jpeg", 0.9); // 0.9 = Image Quality
            };
          });
        };
    
        // Convert cropped image to JPEG File
        const imageFile = await getFileFromUrl(croppedImageUrl, `${currentPhotoType}.jpeg`);
    
        // Update state with image file
        switch (currentPhotoType) {
          case "fatherImage":
            setValues((prev) => ({ ...prev, fatherImage: imageFile }));
            break;
          case "motherImage":
            setValues((prev) => ({ ...prev, motherImage: imageFile }));
            break;
          case "guardianImage":
            setValues((prev) => ({ ...prev, guardianImage: imageFile }));
            break;
          default:
            setValues((prev) => ({ ...prev, studentImage: imageFile }));
            break;
        }
    
        setCurrentPhotoType(null);
      } catch (error) {
        console.error("Error cropping image:", error);
      }
    };
    

    if (croppedImageSource) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4" 
    
        >
          <div className="bg-white rounded-lg p-4 w-full max-[90vw]"
          
          style={{
            width:"90vw"
          }}
          >
            <div className="relative h-64 w-full"
            >
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
                onClick={() => setCroppedImageSource(null)}
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
      <>
        <div class="selection:bg-[#2fa7db] selection:text-white">
          <div class=" flex justify-center "
              style={{minWidth:"90vw"}}
          
          >
            <div class="flex-1 m-2">
              <div class="w-full bg-white  mx-auto overflow-hidden ">
                <div
                  class="relative h-[130px] px-5 pt-1
                rounded-bl-4xl"
                >
                  <h1 class="absolute top-0  text-xl font-semibold text-white pl-2">
                    Student Details
                  </h1>
              
                  <div className="flex ml-2 mb-6">
                    <div className="absolute top-5">
                      {values?.studentImage ? (
                        <img
                          src={
                            values.studentImage instanceof File
                              ? URL.createObjectURL(values.studentImage)
                              : values.studentImage
                              // : values.studentImage?.url
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
  accept="image/jpeg,image/png"
  capture="environment"
  onChange={(e) => handleImageChange(e, "studentImage")}
/>

                        {/* <input
                          type="file"
                          className="hidden"
                          // accept="image/*"
                          capture="environment" // Opens the back camera; use "user" for the front camera
                          // capture="user" // Opens the back camera; use "user" for the front camera
                          onChange={(e) => handleImageChange(e, "studentImage")}
                        /> */}
                      </label>
                    </div>
                  </div>
                </div>
                <div class="px-6 pb-8 bg-white rounded-tr-4xl ">
                  <form class="" action="" method="POST">
                    <div class="relative mt-4">
                      <input
                        type="text"
                        name="fullName"
                        placeholder="Student Name"
                        value={values?.fullName}
                        onChange={handleInputChange}
                        id="fullName"
                        className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
                      />
                      <label
                        for="fullName"
                        class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
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
                          <InputLabel id="demo-simple-select-standard-label">
                            Class
                          </InputLabel>
                          <Select
                          value={values.class} 
                            labelId="demo-simple-select-standard-label"
                            id="demo-simple-select-standard"
                            // value={selectedClass}
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
                            <MenuItem value="" disabled>Select a Class</MenuItem>
                            {getClass?.map((cls, index) => (
                              <MenuItem key={index} value={cls.className}>
                                {cls?.className}
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
                          "& .MuiSelect-root": { color: "#ee582c" },
                          "& .MuiSelect-icon": { color: "#ee582c" },
                          "&:before": { borderBottom: "2px solid #ee582c" },
                          "&:after": { borderBottom: "2px solid #ee582c" },
                        }}
                      >
                        <InputLabel id="demo-simple-select-standard-label">
                          Section 
                        </InputLabel>
                        <Select
                          value={values.section} // Ensure values.section is updated
                          onChange={handleSectionChange}
                          labelId="demo-simple-select-standard-label"
                          id="demo-simple-select-standard"
                        
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
                            <MenuItem value="" disabled>Select a Section</MenuItem>
        {availableSections.length > 0 ? (
          availableSections.map((sec, index) => (
            <MenuItem key={index} value={sec}>{sec}</MenuItem>
          ))
        ) : (
          <MenuItem disabled>No Sections Available</MenuItem>
        )}
                          
                        </Select>
                      </FormControl>
                    </div>
                    
                  </form>
                </div>
                <div className="px-4  shadow-xl bg-white ">
                  {buttonLabel === "Save" && (
                    <button
                      className="w-full bg-[#2fa7db] text-white  rounded-md mb-5 py-2 "
                      onClick={handleSaveClick}
                      disabled={loading}
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
