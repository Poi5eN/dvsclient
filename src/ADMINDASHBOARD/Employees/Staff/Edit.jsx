import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import Button from "../../../Dynamic/utils/Button";
import moment from "moment";
import {
  AdminGetAllClasses,
  editStaff,
  editStaffNew,
  
} from "../../../Network/AdminApi";
import { useStateContext } from "../../../contexts/ContextProvider";
import DatePicker from "../../../Dynamic/DatePicker/DatePicker";
import ImageCaptureCrop from "../../../Dynamic/Camera/ImageCaptureCrop";
import PageHeaderWithBreadcrumb from "../../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../../Dynamic/BreadcrumbList";

const Edit = ({ staffDetails, onFinished }) => {
  const { setIsLoader } = useStateContext();

 console.log("staffDetails",staffDetails)
  const [studentData, setStudentData] = useState({}); // Single source of truth for form data
  const [imagePreviews, setImagePreviews] = useState({ // Optional: for showing previews
    studentImage: staffDetails?.studentImage?.url || null,
 
  });

  useEffect(() => {
    if (staffDetails) {
        // Initialize studentData with details, ensure section is included
      setStudentData({
        ...staffDetails,
        section: staffDetails?.section || "", // Ensure section is initialized
        class: staffDetails?.class || "",   // Ensure class is initialized
        
      });

       // Set initial image previews
    //    setImagePreviews({
    //     studentImage: staffDetails?.studentImage?.url || null,
       
    //   });
    }
  }, [staffDetails]); // Dependency: staffDetails


  // --- Input Handlers ---
  const handleOnChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === "file") {
        const file = files[0];
        setStudentData((prevData) => ({
            ...prevData,
            [name]: file || null // Store the File object or null if cleared
        }));
        // Optional: Update preview
        if (file) {
            setImagePreviews(prev => ({...prev, [name]: URL.createObjectURL(file)}));
        } else {
            // Handle case where file input is cleared (might need original URL)
             setImagePreviews(prev => ({...prev, [name]: staffDetails?.[name]?.url || null}));
        }

    } else {
        setStudentData((prevData) => ({ ...prevData, [name]: value }));
    }
  };



    const handleImageProcessed = (fileObject, imageFieldName) => {
    setStudentData((prevPayload) => ({
        ...prevPayload,
        [imageFieldName]: fileObject, // fileObject will be a File or null
    }));
};


  const handleDateCange = (dateValue, name) => {
    console.log(`Updating state for ${name}:`, dateValue); // For debugging
    setStudentData((prevFormData) => ({
        ...prevFormData,
        [name]: dateValue, // Update the state with the received date object (or null)
    }));
};


  // --- Handle Form Submission ---
  const handleUpdate = async () => {
    setIsLoader(true);
    const formDataToSend = new FormData();

    // Define the fields to include in the FormData
    const fieldsToInclude = [
      "staffName", "email","staffId",
      "dateOfBirth", "gender","address","qualification","salary","joiningDate","contact","status",
    //    "contact", "country", "caste", "nationality", "pincode",
    //   "state", "city", "guardian", "parentcontact", , 
    //   "religion",
    //   "Image", 
    ];

    fieldsToInclude.forEach(key => {
      const value = studentData[key];

      // Handle File Inputs specifically
      if (["Image"].includes(key)) {
        if (value instanceof File) { // Only append if it's a NEW File object
          formDataToSend.append(key, value);
        }
        
      }
      // Handle Date - ensure correct format if necessary, but API might handle ISO strings
      else if (key === 'dateOfBirth' && value) {
         formDataToSend.append(key, moment(value).isValid() ? moment(value).format('YYYY-MM-DD') : ''); // Format date
      }
      // Handle other fields (convert null/undefined to empty string)
      else {
        formDataToSend.append(key, value ?? ""); // Append non-file fields
      }
    });
try {
        // Ensure staffDetails.studentId is available
        if (!staffDetails) {
            toast.error("Student ID is missing. Cannot update.");
            setIsLoader(false);
            return;
        }
const staffId=staffDetails.staffId
      const response = await editStaffNew( formDataToSend,staffId);

      if (response?.success) {
        toast.success("Student updated successfully!");
        onFinished(true); // Pass true to indicate success and trigger refetch
      } else {
        toast.error(response?.message || "Update failed. Please try again.");
      }
    } catch (error) {
      console.error("Error updating student:", error);
      toast.error("An error occurred during the update.");
       // More specific error logging if available
       if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Response Status:", error.response.status);
      }
    } finally {
      setIsLoader(false);
    }
  };


  // --- Render ---
  return (
    <div className="">
          <PageHeaderWithBreadcrumb
                      breadcrumbItems={BreadcrumbList.admission}
                      title="Staff Update"
                    />

      <div className="bg-white p-2 rounded-lg shadow border border-gray-200 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <ReactInput type="text" name="staffName" label="Staff Name" onChange={handleOnChange} value={studentData?.staffName || ""} />
        <ReactInput type="email" name="email" label="Staff's Email" onChange={handleOnChange} value={studentData?.email || ""} />
        <ReactInput type="number" name="contact" label="Staff's Contact" onChange={handleOnChange} value={studentData?.contact || ""} />
         <DatePicker
                            className="custom-calendar"
                            placeholder="" // Can be left empty, DatePicker default is DD/MM/YYYY
                            label={"DOB"} // Corrected typo
                            respclass={"col-xl-2 col-md-3 col-sm-6 col-12"}
                            name="dateOfBirth"
                            id="dateOfBirth"
                            // value={studentData?.dateOfBirth}
                            // value={studentData?.dateOfBirth ?moment(studentData.dateOfBirth).format("DD-mm-yyyy") : ""}
                            value={studentData?.dateOfBirth ? new Date(studentData.dateOfBirth) : null}

                            // value={studentData?.dateOfBirth ? moment(studentData.dateOfBirth).format("DD-MM-YYYY") : ""}
                            // Pass an arrow function to adapt PrimeReact's onChange event
                            // PrimeReact's event 'e' has the date in 'e.value'
                            handleChange={(e) => handleDateCange(e.value, "dateOfBirth")}
                            // showaTime // Pass prop
                            hourFormat="12" // Pass prop
                            // removed duplicate/incorrect handleChange props
                        />
           
        <ReactSelect name="gender" value={studentData?.gender || ""} handleChange={handleOnChange} label="Gender" dynamicOptions={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }]} />
        
        <ReactInput type="text" name="salary" label="salary" onChange={handleOnChange} value={studentData?.salary || ""} />
        <ReactInput type="text" name="country" label="Country" onChange={handleOnChange} value={studentData?.country || ""} />
        <ReactInput type="text" name="address" label="Address" onChange={handleOnChange} value={studentData?.address || ""} />
        <ReactInput type="text" name="state" label="State" onChange={handleOnChange} value={studentData?.state || ""} />
        <ReactInput type="text" name="city" label="City" onChange={handleOnChange} value={studentData?.city || ""} />
        <ReactInput type="text" name="pincode" label="Pin Code" onChange={handleOnChange} value={studentData?.pincode || ""} />
        <ReactInput type="text" name="fatherName" label="Father's Name" onChange={handleOnChange} value={studentData?.fatherName || ""} />
        <ReactInput type="text" name="motherName" label="Mother's Name" onChange={handleOnChange} value={studentData?.motherName || ""} />
        <ReactInput type="text" name="religion" label="Religion" onChange={handleOnChange} value={studentData?.religion || ""} />
        <ReactInput type="text" name="caste" label="Caste" onChange={handleOnChange} value={studentData?.caste || ""} />
        <ReactInput type="text" name="nationality" label="Nationality" onChange={handleOnChange} value={studentData?.nationality || ""} />

       

      </div>
      <div className="flex ">

                    <ImageCaptureCrop
                        label="Photo"
                        onImageCropped={(file) => handleImageProcessed(file, 'studentImage')}
                        initialImageUrl={typeof studentData.studentImage === 'string' ? studentData.studentImage : studentData.studentImage?.url}
                        aspectRatio={1}
                        previewSize={120}
                    />
        
                    </div>
      <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
              <Button name="Update " onClick={handleUpdate} variant="primary" />

        <Button name="Cancel" color="gray" onClick={() => onFinished(false)} variant="secondary" />
      </div>
    </div>
  );
};

export default Edit;

