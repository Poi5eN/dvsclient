import React, { useState, useCallback, useEffect } from "react";
import { Camera } from "lucide-react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./getCroppedImg";
import Modal from "../../Modal";
import { FormControl, InputLabel, Select, TextField,MenuItem  } from "@mui/material";
import Button from "../../utils/Button";
// import {  MenuItem } from "@mui/material";
// import { TextField, MenuItem } from "@mui/material";
import {
  Admission,
  thirdpartymystudents,
} from "../../../Network/ThirdPartyApi";
import { toast } from "react-toastify";
import moment from "moment";
import { useStateContext } from "../../../contexts/ContextProvider";


function DynamicFormFileds(props) {
  const { studentData, buttonLabel, setIsOpen, setReRender } = props;
  console.log("studentData",studentData)
  const { currentColor, isLoader, setIsLoader } = useStateContext();
  const [getClass, setGetClass] = useState([]);
const [availableSections, setAvailableSections] = useState([]);
  const [values, setValues] = useState({
    admissionNumber: "",
    rollNo: "",
    fullName: "",
    class: "",
    section: "",
    gender: "",
    DOB: moment("1999-01-01").format("YYYY-MM-DD"),
    // DOB: moment("01-01-2010").format("DD-MMM-YYYY"),
    fatherName: "",
    motherName: "",
    guardianName: "",
    contact: "",
    address: "",
    studentImage: null,
    motherImage: null,
    fatherImage: null,
    guardianImage: null,
    transport: "",
    remarks: "",
    parentId:""
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
    if (studentData) {
      setValues({
        fullName: studentData.studentName || "",   // Ensure class is set
        class: studentData.class || "",   // Ensure class is set
        gender: studentData.gender || "",
        address: studentData.address || "",
        contact: studentData.contact || "",
        rollNo: studentData.rollNo || "",
        section: studentData.section || "",
        fatherName: studentData?.fatherName || "",
        motherName: studentData?.motherName || "",
        guardianName: studentData?.udisePlusDetails?.guardian_name || "",
        studentImage: studentData?.studentImage?.url || null,
        fatherImage: studentData?.fatherImage?.url || null,
        motherImage: studentData?.motherImage?.url || null,
        guardianImage: studentData?.guardianImage?.url || null,
        DOB: moment(studentData?.dateOfBirth).format("YYYY-MM-DD"),
        parentId:studentData?.parentId
      });
    }
  }, [studentData]);
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

  const handleImageChange = (e, photoType) => {
    const file = e.target.files[0];
    if (!file) return;
  
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
    const requiredFields = [
      { key: "fullName", message: "Please Enter Name" },
      { key: "contact", message: "Please Enter Contact" },
      { key: "fatherName", message: "Please Enter Father Name" },
    ];

    let missingFields = [];
    for (const field of requiredFields) {
      if (!values?.[field.key]) {
        missingFields.push(field.message);
      }
    }

    if (missingFields.length > 0) {
      toast.warn(missingFields.join(", "));
      return;
    }

 
    const contactRegex =
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/;
    if (!contactRegex.test(values.contact)) {
      toast.warn("Please enter a valid contact number.");
      return;
    }

    
  const isValidEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const generateEmail = (name, contact) => {
    let emailPrefix = name.toLowerCase();
    emailPrefix = emailPrefix.replace(/[^a-z0-9]/g, "");
    const email = `${emailPrefix}${contact}@gmail.com`;
    return email;
  };
    // Use the generateEmail function
    const studentEmail = generateEmail(values.fullName, values.contact);
    const parentEmail = generateEmail(values.fatherName, values.contact);

    if (!isValidEmail(studentEmail)) {
      toast.warn("Please enter a valid student email format.");
      return;
    }
    if (!isValidEmail(parentEmail)) {
      toast.warn("Please enter a valid parent email format.");
      return;
    }

    setLoading(true);
    setIsLoader(true);

    try {
      const studentData = {
        schoolId: schoolID,
        studentFullName: values?.fullName || "",
        studentEmail: studentEmail, // Use generated email
        parentEmail: parentEmail, // Use generated email
        studentPassword: values?.contact || "",
        parentPassword: values?.contact || "",
        studentDateOfBirth: moment(values?.DOB).format("DD-MMM-YYYY") || "",
        studentJoiningDate: moment(new Date()).format("DD-MMM-YYYY") || "",
        studentGender: values?.gender || "",
        studentClass: values?.class || "",
        studentSection: values?.section || "",
        studentAddress: values?.address || "",
        studentContact: values?.contact || "",
        parentContact: values?.contact || "",
        fatherName: values?.fatherName || "",
        motherName: values?.motherName || "",
        studentAdmissionNumber: values?.admissionNumber || "",
        studentRollNo: values?.rollNo || "",
        remarks: values?.remarks || "",
        transport: values?.transport || "",
         guardianName: values?.guardianName || "",
      };

      const formDataToSend = new FormData();

      Object.entries(studentData).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      if (values.studentImage) {
        formDataToSend.append("studentImage", values.studentImage);
      }
      if (values.fatherImage) {
        formDataToSend.append("fatherImage", values.fatherImage);
      }
      if (values.motherImage) {
        formDataToSend.append("motherImage", values.motherImage);
      }
      if (values.guardianImage) {
        formDataToSend.append("guardianImage", values.guardianImage);
      }

      const response = await Admission(formDataToSend);

      if (response.success) {
        setIsLoader(false);
        setValues({
          admissionNumber: "",
          fullName: "",
          class: "",
          section: "",
          gender: "",
          DOB: moment("01-01-2010").format("DD-MMM-YYYY"),
          fatherName: "",
          motherName: "",
          guardianName: "",
          contact: "",
          address: "",
          studentImage: null,
          motherImage: null,
          fatherImage: null,
          guardianImage: null,
          remarks: "",
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

  const handleUpDateClick = async () => {
    setIsLoader(true);
    setReRender(false);
    setLoading(true);
    const studentId = studentData?.studentId;

    try {
      const studentDataForUpdate = {
        schoolId: schoolID,
        parentId: values?.parentId,
        studentFullName: values?.fullName || "",
        studentEmail: `${values?.fullName}${values?.contact}@gmail.com` || "",
        studentDateOfBirth: moment(values?.DOB).format("DD-MMM-YYYY") || "",
        studentJoiningDate: moment(new Date()).format("DD-MMM-YYYY") || "",
        studentGender: values?.gender || "",
        studentClass: values?.class || "",
        studentSection: values?.section || "",
        studentAddress: values?.address || "",
        studentContact: values?.contact || "",
        contact: values?.contact || "", // For parent compatibility
        fatherName: values?.fatherName || "",
        motherName: values?.motherName || "",
        guardianName: values?.guardianName || "",
        studentAdmissionNumber: values?.admissionNumber || "",
        remarks: values?.remarks || "", // Assuming this maps to udisePlusDetails or another field if needed
      };

      const formDataToSend = new FormData();

      Object.entries(studentDataForUpdate).forEach(([key, value]) => {
        formDataToSend.append(key, String(value));
      });

      // Conditionally append image files to FormData
      if (values.studentImage instanceof File) {
        formDataToSend.append("studentImage", values.studentImage);
      }
      if (values.fatherImage instanceof File) {
        formDataToSend.append("fatherImage", values.fatherImage);
      }
      if (values.motherImage instanceof File) {
        formDataToSend.append("motherImage", values.motherImage);
      }
      if (values.guardianImage instanceof File) {
        formDataToSend.append("guardianImage", values.guardianImage);
      }

      // Update API call to match editAdmission endpoint
      const response = await fetch(
        `https://dvsserver.onrender.com/api/v1/thirdparty/admissions/${studentId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`, // Adjust based on your auth setup
          },
          body: formDataToSend,
        }
      );

      const result = await response.json();

      if (result.success) {
        setIsLoader(false);
        setReRender(true);
        setIsOpen(false);
        toast.success("Update successfully!");
        setValues({
          admissionNumber: "",
          fullName: "",
          class: "",
          section: "",
          gender: "",
          DOB: moment("01-01-2010").format("DD-MM-YYYY"),
          fatherName: "",
          motherName: "",
          guardianName: "",
          contact: "",
          address: "",
          studentImage: null,
          motherImage: null,
          fatherImage: null,
          guardianImage: null,
          remarks: "",
        });
      } else {
        setIsLoader(false);
        toast.error(result.message || "Failed to update admission");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      // toast.error("An error occurred during update.");
    } finally {
      setLoading(false);
      setIsLoader(false);
    }
  };
  const [modalOpen, setModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImageSource, setCroppedImageSource] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPhotoType, setCurrentPhotoType] = useState(null);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
    // if (name === "DOB") {
    
    //   const formattedDate = moment(
    //     value,
    //     ["YYYY-MM-DD", "DD/MM/YYYY", "MM/DD/YYYY"],
    //     true
    //   );

    //   setValues({
    //     ...values,
    //     [name]: formattedDate.isValid()
    //       ? formattedDate.format("YYYY-MM-DD")
    //       : value,
    //   });
    // } else {
    //   setValues({ ...values, [name]: value });
    // }
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
  
      // Function to convert image URL to JPEG File
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
  
            // Convert canvas to Blob in JPEG format
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
  
  const handleMoreDetails = () => {
    setModalOpen(true);
  };



  // const handleSectionChange = (e) => {
  //   setSelectedSection(e.target.value);
  // };

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
// console.log("values",values)
  return (
    <>
      <div class="selection:bg-[#2fa7db] selection:text-white">
        <div class=" flex justify-center "
            style={{minWidth:"90vw"}}
            // style={{minWidth:"350px"}}
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
                <div className="flex justify-end  items-center mb-6">
                  <Button
                    name=" More Details"
                    color="#59b3da"
                    onClick={() => handleMoreDetails()}
                    className="text-[#ee582c] m-2"
                  />
                </div>
                {/* {console.log("values",values)} */}
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
                        className="hidden"
                        accept="image/*"
                        capture="environment" // Opens the back camera; use "user" for the front camera
                        onChange={(e) => handleImageChange(e, "studentImage")}
                      />
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
                  <div class="relative mt-4">
                    <input
                      type="text"
                      name="fatherName"
                      placeholder="Father Name"
                      value={values?.fatherName}
                      onChange={handleInputChange}
                      id="fatherName"
                      className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
                    />
                    <label
                      for="fatherName"
                      class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
                    >
                      Father Name
                    </label>
                  </div>
                  {/* <TextField
      label="Class"
      name="class"
      select
      value={values.class} // Yahan ensure karein ki values.class mil raha ho
      onChange={handleClassChange}
      required
      style={{ width: "100%", paddingBottom: "20px" }}
    >
      <MenuItem value="" disabled>Select a Class</MenuItem>
      {getClass.length > 0 ? (
        getClass.map((cls, index) => (
          <MenuItem key={index} value={cls.className}>{cls.className}</MenuItem>
        ))
      ) : (
        <MenuItem disabled>No Classes Available</MenuItem>
      )}
    </TextField> */}

    {/* <TextField
      label="Section"
      name="section"
      select
      value={values.section} // Ensure values.section is updated
      onChange={handleSectionChange}
      required
      style={{ width: "100%", paddingBottom: "20px" }}
    >
      <MenuItem value="" disabled>Select a Section</MenuItem>
      {availableSections.length > 0 ? (
        availableSections.map((sec, index) => (
          <MenuItem key={index} value={sec}>{sec}</MenuItem>
        ))
      ) : (
        <MenuItem disabled>No Sections Available</MenuItem>
      )}
    </TextField> */}
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
                   
{/* <FormControl fullWidth style={{ marginBottom: "20px" }}>
  <InputLabel>Class</InputLabel>
  <Select
    name="class"
    value={values.class} // Ensure value is set properly
    onChange={handleClassChange}
    required
  >
    <MenuItem value="" disabled>Select a Class</MenuItem>
    {getClass.length > 0 ? (
      getClass.map((cls, index) => (
        <MenuItem key={index} value={cls.className}>{cls.className}</MenuItem>
      ))
    ) : (
      <MenuItem disabled>No Classes Available</MenuItem>
    )}
  </Select>
</FormControl>

<FormControl fullWidth style={{ marginBottom: "20px" }}>
  <InputLabel>Section</InputLabel>
  <Select
    name="section"
    value={values.section} // Ensure value is set properly
    onChange={handleSectionChange}
    required
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
</FormControl> */}

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
                        // value={studentData?.section  || selectedSection}
                        // onChange={handleSectionChange}
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
                        {/* {availableSections?.map((item, index) => (
                          <MenuItem key={index} value={item}>
                            {item}
                          </MenuItem>
                        ))} */}
                      </Select>
                    </FormControl>
                  </div>
                  <div className="flex justify-center items-center gap-2">
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
                        Gender
                      </InputLabel>
                      <Select
                        labelId="demo-simple-select-standard-label"
                        id="demo-simple-select-standard"
                        value={values?.gender}
                        onChange={handleInputChange}
                        label="Gender"
                        name="gender"
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
                        <MenuItem value="Male">Male</MenuItem>
                        <MenuItem value="Female">Female</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                    
                    <div class="relative mt-4 w-full">
                      <input
                        type="date"
                        name="DOB"
                        placeholder="Enter DOB (YYYY-MM-DD)"
                        // value={values.dateOfBirth}
                        value={values.DOB ? values.DOB.split('T')[0] : ''}
                        // value={values.DOB ? values.DOB.split('T')[0] : ''}
                        onChange={handleInputChange}
                        id="DOB"
                        className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-gray-400 focus:outline-none focus:border-rose-600"
                      />
                      <label
                        for="DOB"
                        class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
                      >
                        Enter DOB
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-center items-center gap-2 w-full mt-4">
                    <div class="relative w-full">
                      <input
                        maxLength="3"
                        type="text"
                        name="rollNo"
                        placeholder="Roll Number"
                        value={values?.rollNo}
                        onChange={handleInputChange}
                        id="rollNo"
                        className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
                      />
                      <label
                        for="rollNo"
                        class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
                      >
                        Roll Number
                      </label>
                    </div>
                    <div class="relative  w-full">
                      <input
                        type="text"
                        maxlength="10"
                        name="contact"
                        placeholder="Contact No."
                        value={values?.contact}
                        onChange={handleInputChange}
                        id="contact"
                        pattern="[0-9]*"
                        className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
                      />
                      <label
                        for="contact"
                        class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
                      >
                        Contact No.
                      </label>
                    </div>
                  </div>
                  <div class="relative mt-4">
                    <input
                      type="text"
                      name="address"
                      placeholder="Enter Address"
                      value={values?.address}
                      onChange={handleInputChange}
                      id="address"
                      className="peer h-10 w-full border-b-2 border-[#ee582c] text-[#2fa7db] placeholder-transparent focus:outline-none focus:border-rose-600"
                    />
                    <label
                      for="address"
                      class="absolute left-0 -top-3.5 text-[#ee582c] text-sm transition-all peer-placeholder-shown:text-base peer-placeholder-shown:text-[#ee582c] peer-placeholder-shown:top-2 peer-focus:-top-3.5 peer-focus:text-[#ee582c] peer-focus:text-sm"
                    >
                      Address
                    </label>
                  </div>
                </form>
              </div>
              <div className="px-4  shadow-xl bg-white ">
                {buttonLabel === "Save" ? (
                  <button
                    className="w-full bg-[#2fa7db] text-white  rounded-md mb-5 py-2 "
                    onClick={handleSaveClick}
                    disabled={loading}
                  >
                    {loading ? "Saving..." : buttonLabel}
                  </button>
                ) : (
                  <button
                    className="w-full bg-[#2fa7db] text-white  rounded-md mb-14 py-2 "
                    onClick={handleUpDateClick}
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
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={`More Details`}>
        {croppedImageSource ? (
          <div className="relative w-full aspect-square"
          style={{width:"90vw"}}
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
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
              <button
                onClick={cancelCrop}
                className="bg-red-500 text-white py-2 px-4 rounded"
              >
                Cancel Crop
              </button>
              <button
                onClick={showCroppedImage}
                className="bg-blue-500 text-white py-2 px-4 rounded"
              >
                Crop Image
              </button>
            </div>
          </div>
        ) : (
          <div className="px-4 pb-2 min-w-[330px]">
            <div className="mb-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="transport"
              >
                Guardian Name:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="guardianName"
                name="guardianName"
                type="text"
                placeholder="Guardian Name"
                onChange={handleInputChange}
                value={values?.guardianName}
              />
            </div>
            <div className="mb-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="transport"
              >
                Mother Name:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="motherName"
                name="motherName"
                type="text"
                placeholder="Guardian Name"
                onChange={handleInputChange}
                value={values?.motherName}
              />
            </div>
            <div className="mb-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="transport"
              >
                Transport:
              </label>
              <input
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="transport"
                name="transport"
                type="text"
                placeholder="Transport"
                value={values?.transport}
                onChange={handleInputChange}
              />
            </div>
            {/* <div className="mb-2">
              <label
                className="block text-gray-700 text-sm font-bold mb-2"
                htmlFor="transport"
              >
                Remarks:
              </label>

              <textarea
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                id="remarks"
                name="remarks"
                type="text"
                placeholder="Remarks"
                value={values?.remarks}
                onChange={handleInputChange}
              />
            </div> */}

            <div className="flex justify-center mb-6">
              <div className="relative">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="transport"
                >
                  Father Photo:
                </label>
                {values?.fatherImage ? (
                  <img
                    src={
                      values.fatherImage instanceof File
                      ? URL.createObjectURL(values.fatherImage)
                      :  values.fatherImage
                      // :  values.fatherImage?.url
                     
                    }
                    alt="mother Image"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-[#ee582c]">NO IMAGE</span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                  <Camera size={16} />
                  <input
                    type="file"
                    capture="environment" // Opens the back camera; use "user" for the front camera
                    className="hidden"
                    accept="image/*"
                    name="fatherImage"
                    onChange={(e) => handleImageChange(e, "fatherImage")}
                  />
                </label>
              </div>
            </div>
            <div className="flex justify-center mb-6">
              <div className="relative">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="transport"
                >
                  Mother Photo:
                </label>
                {values?.motherImage ? (
                  <img
                    src={
                      values.motherImage instanceof File
                      ? URL.createObjectURL(values.motherImage)
                      :  values.motherImage
                    
                    }
                   
                    alt="mother Image"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-[#ee582c]">NO IMAGE</span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                  <Camera size={16} />
                  <input
                    type="file"
                    capture="environment" // Opens the back camera; use "user" for the front camera
                    className="hidden"
                    accept="image/*"
                    name="motherImage"
                    onChange={(e) => handleImageChange(e, "motherImage")}
                  />
                </label>
              </div>
            </div>

            <div className="flex justify-center mb-6">
              <div className="relative">
                <label
                  className="block text-gray-700 text-sm font-bold mb-2"
                  htmlFor="transport"
                >
                  Guardian Photo:
                </label>

                {values?.guardianImage ? (
                  <img
                    src={
                      values.guardianImage instanceof File
                      ? URL.createObjectURL(values.guardianImage)
                      :  values.guardianImage
                     
                    }
                  
                    alt="Guardian"
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
                    <span className="text-[#ee582c]">NO IMAGE</span>
                  </div>
                )}
                <label className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full cursor-pointer">
                  <Camera size={16} />
                  <input
                    type="file"
                    capture="environment" // Opens the back camera; use "user" for the front camera
                    className="hidden"
                    accept="image/*"
                    name="guardianImage"
                    onChange={(e) => handleImageChange(e, "guardianImage")}
                  />
                </label>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}

export default DynamicFormFileds;
