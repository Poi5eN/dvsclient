import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import Button from "../../../Dynamic/utils/Button";
import moment from "moment";
import {
  AdminGetAllClasses,
  editStudentParent,
} from "../../../Network/AdminApi";
import { useStateContext } from "../../../contexts/ContextProvider";

const EditStudent = ({ studentDetails, onFinished }) => {
  const { setIsLoader } = useStateContext();
  const [getClass, setGetClass] = useState([]);
  const [availableSections, setAvailableSections] = useState([]);
  const [studentData, setStudentData] = useState({}); // Single source of truth for form data
  const [imagePreviews, setImagePreviews] = useState({ // Optional: for showing previews
    studentImage: studentDetails?.studentImage?.url || null,
    fatherImage: studentDetails?.fatherImage?.url || null,
    motherImage: studentDetails?.motherImage?.url || null,
    guardianImage: studentDetails?.guardianImage?.url || null,
  });

  // --- Initialize State ---
  useEffect(() => {
    if (studentDetails) {
        // Initialize studentData with details, ensure section is included
      setStudentData({
        ...studentDetails,
        section: studentDetails?.section || "", // Ensure section is initialized
        class: studentDetails?.class || "",   // Ensure class is initialized
         // Initialize image fields as null or existing URL, not the File object yet
         studentImage: null,
         fatherImage: null,
         motherImage: null,
         guardianImage: null,
      });

       // Set initial image previews
       setImagePreviews({
        studentImage: studentDetails?.studentImage?.url || null,
        fatherImage: studentDetails?.fatherImage?.url || null,
        motherImage: studentDetails?.motherImage?.url || null,
        guardianImage: studentDetails?.guardianImage?.url || null,
      });
    }
  }, [studentDetails]); // Dependency: studentDetails


  // --- Fetch Classes and Set Initial Sections ---
  const fetchClassesAndSetSections = useCallback(async (initialClassName) => {
    setIsLoader(true);
    try {
      const response = await AdminGetAllClasses();
      if (response?.success) {
        const classes = response.classes || [];
        setGetClass(classes.sort((a, b) => a.className.localeCompare(b.className))); // Sort alphabetically or numerically as needed

        if (initialClassName) {
          const initialClassObj = classes.find(cls => cls.className === initialClassName);
          setAvailableSections(initialClassObj?.sections || []);
        } else {
            setAvailableSections([]); // Clear sections if no initial class
        }

      } else {
        toast.error(response?.message || "Failed to fetch classes.");
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast.error("An error occurred while fetching classes.");
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader]); // Dependency: setIsLoader

  useEffect(() => {
    if (studentDetails?.class) {
        fetchClassesAndSetSections(studentDetails.class);
    } else {
        fetchClassesAndSetSections(null); // Fetch classes even if no initial class
    }
  }, [studentDetails?.class, fetchClassesAndSetSections]); // Dependencies


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
             setImagePreviews(prev => ({...prev, [name]: studentDetails?.[name]?.url || null}));
        }

    } else {
        setStudentData((prevData) => ({ ...prevData, [name]: value }));
    }
  };

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;

    setStudentData((prevData) => ({
      ...prevData,
      class: selectedClassName,
      section: "" // Reset section when class changes
    }));

    const selectedClassObj = getClass.find(cls => cls.className === selectedClassName);
    setAvailableSections(selectedClassObj?.sections || []);
  };

  const handleSectionChange = (e) => {
    const newSection = e.target.value;
    setStudentData(prevData => ({
      ...prevData,
      section: newSection
    }));
  };


  // --- Options for Select ---
  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));

  const DynamicSection = availableSections.map((item) => ({
    label: item,
    value: item,
  }));


  // --- Handle Form Submission ---
  const handleUpdate = async () => {
    setIsLoader(true);
    const formDataToSend = new FormData();

    // Define the fields to include in the FormData
    const fieldsToInclude = [
      "studentName", "email", "password", "fatherName", "motherName","admissionNumber",
      "class", "section", "dateOfBirth", "transport", "rollNo", "gender",
      "address", "contact", "country", "caste", "nationality", "pincode",
      "state", "city", "guardian", "parentcontact", "parentemail", // Added missing parent fields if needed
      "religion",
      // Image fields
      "studentImage", "fatherImage", "motherImage", "guardianImage"
    ];

    fieldsToInclude.forEach(key => {
      const value = studentData[key];

      // Handle File Inputs specifically
      if (["studentImage", "fatherImage", "motherImage", "guardianImage"].includes(key)) {
        if (value instanceof File) { // Only append if it's a NEW File object
          formDataToSend.append(key, value);
        }
        // NOTE: We do NOT append the existing URL string here.
        // The backend should handle logic like: if no new file is sent, keep the old one.
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

     // --- DEBUGGING: Log FormData contents ---
    // console.log("FormData to be sent:");
    // for (let [key, value] of formDataToSend.entries()) {
    //   console.log(`${key}:`, value);
    // }
    // --- End Debugging ---


    try {
        // Ensure studentDetails.studentId is available
        if (!studentDetails?.studentId) {
            toast.error("Student ID is missing. Cannot update.");
            setIsLoader(false);
            return;
        }

      const response = await editStudentParent(studentDetails.studentId, formDataToSend);

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
    <div className="p-4 sm:p-6 bg-white rounded-lg shadow-md max-w-6xl mx-auto my-4">
      <h1 className="text-xl font-semibold text-gray-700 mb-6 border-b pb-2">Edit Student Profile</h1>

        {/* Use studentData for values and ensure names match state keys */}
      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <ReactInput type="text" name="studentName" label="Student's Name" onChange={handleOnChange} value={studentData?.studentName || ""} />
        <ReactInput type="email" name="email" label="Student's Email" onChange={handleOnChange} value={studentData?.email || ""} />
        <ReactInput type="number" name="contact" label="Student's Contact" onChange={handleOnChange} value={studentData?.contact || ""} />
        <ReactInput
          // readOnly={true}
          // disabled={true} // Use disabled visually and functionally
          type="text" name="admissionNumber" label="Admission Number"  onChange={handleOnChange} value={studentData?.admissionNumber || ""} />
        <ReactInput
            type="date"
            label="Date Of Birth"
            onChange={handleOnChange}
            name="dateOfBirth"
            value={studentData?.dateOfBirth ? moment(studentData.dateOfBirth).format("YYYY-MM-DD") : ""} // Format for display
            max={moment().format("YYYY-MM-DD")} // Prevent future dates
            />
        <ReactSelect name="gender" value={studentData?.gender || ""} handleChange={handleOnChange} label="Gender" dynamicOptions={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }]} />
        <ReactSelect
          required={true}
          name="class"
          value={studentData?.class || ""} // Get value from studentData
          handleChange={handleClassChange} // Use correct handler
          label="Select a Class"
          dynamicOptions={dynamicOptions}
        />
        <ReactSelect
          name="section"
          value={studentData?.section || ""} // Get value from studentData
          handleChange={handleSectionChange} // Use correct handler
          label="Select a Section"
          dynamicOptions={DynamicSection}
          disabled={!studentData?.class || availableSections.length === 0} // Disable if no class or sections
        />
        <ReactInput type="text" name="country" label="Country" onChange={handleOnChange} value={studentData?.country || ""} />
        <ReactInput type="text" name="address" label="Address" onChange={handleOnChange} value={studentData?.address || ""} />
        <ReactInput type="text" name="state" label="State" onChange={handleOnChange} value={studentData?.state || ""} />
        <ReactInput type="text" name="city" label="City" onChange={handleOnChange} value={studentData?.city || ""} />
        <ReactInput type="text" name="pincode" label="Pin Code" onChange={handleOnChange} value={studentData?.pincode || ""} />
        <ReactInput type="text" name="fatherName" label="Father's Name" onChange={handleOnChange} value={studentData?.fatherName || ""} />
        <ReactInput type="text" name="motherName" label="Mother's Name" onChange={handleOnChange} value={studentData?.motherName || ""} />
        <ReactInput type="text" name="guardian" label="Guardian's Name" onChange={handleOnChange} value={studentData?.guardian || ""} />
        <ReactInput type="text" name="parentcontact" label="Parent's Contact" onChange={handleOnChange} value={studentData?.parentcontact || ""} />
        <ReactInput type="email" name="parentemail" label="Parent's Email" onChange={handleOnChange} value={studentData?.parentemail || ""} />
        <ReactSelect name="transport" label="Transport Required" value={studentData?.transport || "no"} handleChange={handleOnChange} dynamicOptions={[{ label: "Yes", value: "yes" }, { label: "No", value: "no" }]} />
        <ReactInput type="text" name="password" placeholder="Leave blank to keep unchanged" label="New Password (Optional)" onChange={handleOnChange} value={studentData?.password || ""} />
        {/* Removed duplicate parentContact */}
        <ReactInput type="text" name="rollNo" label="Roll No" onChange={handleOnChange} value={studentData?.rollNo || ""} />
        <ReactInput type="text" name="religion" label="Religion" onChange={handleOnChange} value={studentData?.religion || ""} />
        <ReactInput type="text" name="caste" label="Caste" onChange={handleOnChange} value={studentData?.caste || ""} />
        <ReactInput type="text" name="nationality" label="Nationality" onChange={handleOnChange} value={studentData?.nationality || ""} />

        {/* Image Inputs with Previews */}
        <div className="flex flex-col">
            <ReactInput
            type="file" label="Student Image" accept="image/*"
            onChange={handleOnChange} name="studentImage" />
            {imagePreviews.studentImage && (<img src={imagePreviews.studentImage} alt="Student Preview" className="mt-2 w-16 h-16 object-cover rounded-md border" />)}
        </div>
         <div className="flex flex-col">
             <ReactInput
                type="file" label="Father Image" accept="image/*"
                onChange={handleOnChange} name="fatherImage" />
            {imagePreviews.fatherImage && (<img src={imagePreviews.fatherImage} alt="Father Preview" className="mt-2 w-16 h-16 object-cover rounded-md border" />)}
        </div>
         <div className="flex flex-col">
            <ReactInput
                type="file" label="Mother Image" accept="image/*"
                onChange={handleOnChange} name="motherImage" />
            {imagePreviews.motherImage && (<img src={imagePreviews.motherImage} alt="Mother Preview" className="mt-2 w-16 h-16 object-cover rounded-md border" />)}
        </div>
         <div className="flex flex-col">
            <ReactInput
                type="file" label="Guardian Image" accept="image/*"
                onChange={handleOnChange} name="guardianImage" />
            {imagePreviews.guardianImage && (<img src={imagePreviews.guardianImage} alt="Guardian Preview" className="mt-2 w-16 h-16 object-cover rounded-md border" />)}
        </div>

      </div>
      <div className="flex justify-end gap-4 mt-6 pt-4 border-t">
         {/* Pass false to onFinished for Cancel to indicate no refetch needed */}
        <Button name="Cancel" onClick={() => onFinished(false)} variant="secondary" />
        <Button name="Update Student" onClick={handleUpdate} variant="primary" />
      </div>
    </div>
  );
};

export default EditStudent;




// import React, { useState, useEffect } from "react";
// import { toast } from "react-toastify";
// import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
// import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
// import Button from "../../../Dynamic/utils/Button";
// import moment from "moment";
// import {
//   AdminGetAllClasses,
//   editStudentParent,
// } from "../../../Network/AdminApi";
// import { useStateContext } from "../../../contexts/ContextProvider";

// const EditStudent = ({ studentDetails, onFinished }) => {
//   const { setIsLoader } = useStateContext();
//   const [getClass, setGetClass] = useState([]);
//   const [selectedClass, setSelectedClass] = useState(studentDetails?.class || "");
//   const [selectedSection, setSelectedSection] = useState(studentDetails?.section || ""); // Initialize with existing section
//   const [availableSections, setAvailableSections] = useState([]);
//   const [studentData, setStudentData] = useState({});

//   useEffect(() => {
//     if (studentDetails) {
//       setStudentData(() => ({
//         ...studentDetails,
//          section:studentDetails?.section || ""
//       }));

//         setSelectedClass(studentDetails.class);
//         setSelectedSection(studentDetails.section);


//       // setStudentData(studentDetails);
//     }
//   }, [studentDetails]);

//   useEffect(() => {
//     const getAllClasses = async () => {
//       setIsLoader(true)
//       try {
//         const response = await AdminGetAllClasses();
//         if (response?.success) {
//           let classes = response.classes;
//           setGetClass(classes.sort((a, b) => a - b));
//            if (studentDetails?.class) {
//             const initialClass = classes.find(cls => cls.className === studentDetails.class);
//                 setAvailableSections(initialClass?.sections || []);
//             }
//         } else {
//           toast.error(response?.message);
//         }
//       } catch (error) {
//         console.log("error", error);
//       }
//       finally{
//         setIsLoader(false)
//       }
//     };
//     getAllClasses();
//   }, [studentDetails?.class]);

//   const handleOnChange = (e) => {
//     const { name, value } = e.target;
//     setStudentData((prevData) => ({ ...prevData, [name]: value }));
//   };

//   const handleClassChange = (e) => {
//     const selectedClassName = e.target.value;

//     setSelectedClass(selectedClassName);
//     setStudentData((prevData) => ({
//       ...prevData,
//       class: selectedClassName,
//       section: ""  // Reset section when class changes
//     }));

//     const selectedClassObj = getClass?.find(
//       (cls) => cls.className === selectedClassName
//     );

//     if (selectedClassObj) {
//       setAvailableSections(selectedClassObj.sections);
//       setSelectedSection(""); // Also clear the selected section
//     } else {
//       setAvailableSections([]);
//       setSelectedSection("");
//     }
//   };

//   const handleSectionChange = (e) => {
//     const newSection = e.target.value;
//     setSelectedSection(newSection);
//     setStudentData(prevData => ({
//       ...prevData,
//       section: newSection
//     }));
//   };

//   const dynamicOptions = getClass.map((cls) => ({
//     label: cls.className,
//     value: cls.className,
//   }));

//   const DynamicSection = availableSections?.map((item) => ({
//     label: item,
//     value: item,
//   }));

//   const handleUpdate = async () => {
//     try {
//       setIsLoader(true);
//       const payload = {
//         "studentName": studentData?.studentName || "",
//         "email": studentData?.email || "",
//         "password": studentData?.password || "",
//         "fatherName": studentData?.fatherName || "",
//         "motherName": studentData?.motherName || "",
//         "class": selectedClass || "",
//         "section": selectedSection || "",
//         "dateOfBirth": studentData?.dateOfBirth || "",
//         "transport": studentData?.transport || "yes",
//         // "parentContact": "9876543210",
//         "rollNo": studentData?.rollNo || "",
//         "gender": studentData?.gender || "",
//         "address": studentData?.address || "",
//         "contact": studentData?.contact || "",
//         "country": studentData?.Country || "",
//         // "religion": "Hindu",
//         "caste": studentData?.caste || "",
//         "nationality": studentData?.nationality || "",
//         "pincode": studentData?.pincode || "",
//         "state": studentData?.state || "",
//         "city": studentData?.city || "",
//       };

//       const formDataToSend = new FormData();

//       Object.entries(payload).forEach(([key, value]) => {
//         if (["studentImage", "fatherImage", "motherImage", "guardianImage"].includes(key)) {
//           if (value && value instanceof File) {
//             formDataToSend.append(key, value); // Only append if it's a new file
//           }
//         } else {
//           formDataToSend.append(key, String(value));
//         }
//       });

//       const response = await editStudentParent(studentDetails?.studentId, formDataToSend);

//       if (response?.success) {
//         onFinished();
//         toast.success("Updated successfully!");
//       } else {
//         toast.error(response?.message || "Update failed.");
//       }
//     } catch (error) {
//       console.error("Error in handleUpdate:", error);

//     } finally {
//       setIsLoader(false);
//     }
//   };

//   return (
//     <div className="text-center p-5 bg-white">
//       <h1 className="text-xl font-bold mb-6">Edit Student Profile</h1>

//       <div className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white ">
//         <ReactInput type="text" name="studentName" label="Student's Name" onChange={handleOnChange} value={studentData?.studentName || ""} />
//         <ReactInput type="text" name="email" label="Student's Email" onChange={handleOnChange} value={studentData?.email || ""} />
//         <ReactInput type="number" name="contact" label="Student's contact" onChange={handleOnChange} value={studentData?.contact || ""} />
//         <ReactInput
//           readOnly={true}

//           type="text" name="admissionNumber" label="Admission Number" onChange={handleOnChange} value={studentData?.admissionNumber || ""} />
//         <ReactInput type="date" label="Date Of Birth" onChange={handleOnChange} name="dateOfBirth" value={moment(studentData?.dateOfBirth, "YYYY-MM-DD").format("YYYY-MM-DD")} />
//         <ReactSelect name="gender" value={studentData?.gender || ""} handleChange={handleOnChange} label="Gender" dynamicOptions={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }]} />
//         <ReactSelect
//           required={true}
//           name="class"
//           value={selectedClass}
//           // value={studentData?.class}

//           handleChange={handleClassChange}
//           label="Select a Class"
//           dynamicOptions={dynamicOptions}
//         />
//         <ReactSelect
//           name="section"
//           value={selectedSection} // Use selectedSection state
//           // value={studentData?.section} // Use selectedSection state
//           handleChange={handleSectionChange} // Use the handleSectionChange function
//           label="Select a Section"
//           dynamicOptions={DynamicSection}
//         />
//         <ReactInput type="text" name="country" label="Country" onChange={handleOnChange} value={studentData?.country || ""} />
//         <ReactInput type="text" name="address" label="Address" onChange={handleOnChange} value={studentData?.address || ""} />
//         <ReactInput type="text" name="state" label="State" onChange={handleOnChange} value={studentData?.state || ""} />
//         <ReactInput type="text" name="city" label="City" onChange={handleOnChange} value={studentData?.city || ""} />
//         <ReactInput type="text" name="pincode" label="Pin Code" onChange={handleOnChange} value={studentData?.pincode || ""} />
//         <ReactInput type="text" name="fatherName" label="Father's Name" onChange={handleOnChange} value={studentData?.fatherName || ""} />
//         <ReactInput type="text" name="motherName" label="Mother's Name" onChange={handleOnChange} value={studentData?.motherName || ""} />
//         <ReactInput type="text" name="guardian" label="Guardian's Name" onChange={handleOnChange} value={studentData?.guardian || ""} />
//         <ReactInput type="text" name="parentcontact" label="Parent's Contact" onChange={handleOnChange} value={studentData?.parentcontact || ""} />
//         <ReactInput type="email" name="parentemail" label="Parent's Email" onChange={handleOnChange} value={studentData?.parentemail || ""} />
//         <ReactInput type="text" name="transport" label="Transport" onChange={handleOnChange} value={studentData?.transport || ""} />
//         <ReactInput type="text" name="password" label="Password" onChange={handleOnChange} value={studentData?.password || ""} />
//         <ReactInput type="text" name="parentContact" label="Parent Contact" onChange={handleOnChange} value={studentData?.parentContact || ""} />
//         <ReactInput type="text" name="rollNo" label="Roll No" onChange={handleOnChange} value={studentData?.rollNo || ""} />
//         <ReactInput type="text" name="religion" label="Religion" onChange={handleOnChange} value={studentData?.religion || ""} />
//         <ReactInput type="text" name="caste" label="Caste" onChange={handleOnChange} value={studentData?.caste || ""} />
//         <ReactInput type="text" name="nationality" label="Nationality" onChange={handleOnChange} value={studentData?.nationality || ""} />

//         <ReactInput
//           type="file"
//           label="Student Image"
//           accept="image/*"
//           onChange={(e) => setStudentData(prevData => ({
//             ...prevData,
//             studentImage: e.target.files[0]
//           }))}
//           name="studentImage"
//         />
//         {/* {studentData?.studentImage && (<img src={studentData?.studentImage?.url || URL?.createObjectURL(studentData?.studentImage)} alt="Preview" className="w-10 h-10 object-cover rounded-md" />)} */}

//         <ReactInput
//           type="file"
//           label="Father Image"
//           accept="image/*"
//           onChange={(e) => setStudentData(prevData => ({
//             ...prevData,
//             fatherImage: e.target.files[0] // Store the selected file
//           }))}
//           name="fatherImage"
//         />

//         <ReactInput
//           type="file"
//           label="Mother Image"
//           accept="image/*"
//           onChange={(e) => setStudentData(prevData => ({
//             ...prevData,
//             motherImage: e.target.files[0]
//           }))}
//           name="motherImage"
//         />
//         <ReactInput
//           type="file"
//           label="Guardian Image"
//           accept="image/*"
//           onChange={(e) => setStudentData(prevData => ({
//             ...prevData,
//             guardianImage: e.target.files[0]
//           }))}
//           name="guardianImage"
//         />
//       </div>
//       <div className="flex gap-3 mt-6">
//         <Button name="Update" onClick={handleUpdate}  width="full" />
//         <Button name="Cancel" onClick={() => onFinished()} width="full" />
//       </div>
//     </div>
//   );
// };

// export default EditStudent;
