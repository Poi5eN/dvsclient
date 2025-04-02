import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import moment from "moment";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import Button from "../../Dynamic/utils/Button";
import { AdminGetAllClasses, editTeacher } from "../../Network/AdminApi";
import { useStateContext } from "../../contexts/ContextProvider";


const EditTeacher = ({ teacherDetails, handleCancel, setIsEdit }) => {
   const { setIsLoader } = useStateContext();
  const [getClass, setGetClass] = useState([]);
  const [selectedClass, setSelectedClass] = useState(teacherDetails?.classTeacher || "");
  const [selectedSection, setSelectedSection] = useState(teacherDetails?.section || ""); // Initialize with existing section
  const [availableSections, setAvailableSections] = useState([]);
  const [teacherData, setTeacherData] = useState({});

  useEffect(() => {
    if (teacherDetails) {
      setTeacherData(teacherDetails);
      setSelectedClass(teacherDetails.classTeacher || "");  // Initialize selectedClass
      setSelectedSection(teacherDetails.section || ""); // Initialize selectedSection
     
    }
  }, [teacherDetails]);


  useEffect(() => {
    setIsLoader(true)
    const getAllClasses = async () => {
      try {
        const response = await AdminGetAllClasses();
        if (response?.success) {
          let classes = response.classes;
          setGetClass(classes.sort((a, b) => a - b));

          // Set initial available sections based on the teacher's class
          if (teacherDetails?.classTeacher) {
            const initialClass = classes.find(cls => cls.className === teacherDetails.classTeacher);
            setAvailableSections(initialClass?.sections || []);
          }
        } else {
          toast.error(response?.message);
        }
      } catch (error) {
        console.log("error", error);
      }
      finally{
        setIsLoader(false)
      }
    };
    getAllClasses();
  }, [teacherDetails?.classTeacher]);

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setTeacherData({ ...teacherData, [name]: value });
  };

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);  // Update selectedClass state
    setTeacherData(prevData => ({
      ...prevData,
      classTeacher: selectedClassName, // Update class in teacherData
      section: ""           // Reset section when class changes
    }));

    const selectedClassObj = getClass?.find(
      (cls) => cls.className === selectedClassName
    );

    if (selectedClassObj) {
      setAvailableSections(selectedClassObj.sections);
      setSelectedSection(""); // Clear selected section as well
      
    } else {
      setAvailableSections([]);
      setSelectedSection("");
      
    }
  };

  const handleSectionChange = (e) => {
    const newSection = e.target.value;
    setSelectedSection(newSection);  // Update selectedSection state
    setTeacherData(prevData => ({
      ...prevData,
      section: newSection  // Update section in teacherData
    }));
 
  };

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));

  const DynamicSection = availableSections?.map((item) => ({
    label: item,
    value: item,
  }));
  const handleUpdate = async(e) => {
    setIsLoader(true)
    e.preventDefault();
    const payload = {
      "teacherName": teacherData?.teacherName,
      "employeeId":  teacherData?.employeeId,
      "email":  teacherData?.email,
      "dateOfBirth": teacherData?.dateOfBirth,
      // "status": teacherData?.teacherName,
      "qualification":  teacherData?.qualification,
      "salary": Number( teacherData?.salary),
      // "subject": ["Physics", "Mathematics"],
      "gender": teacherData?.gender,
      // "joiningDate": "2010-01-01",
      "address":  teacherData?.address,
      "contact":Number( teacherData?.contact),
      "experience":  teacherData?.experience,
      "section":  teacherData?.section,
      "classTeacher":  teacherData?.classTeacher,
      "image":  teacherData?.image,
      // "role": "teacher"
    }
    
    const formDataToSend = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (["image"].includes(key)) {
        if (value && value instanceof File) {
          formDataToSend.append(key, value); // Only append if it's a new file
        }
      } else {
        formDataToSend.append(key, String(value));
      }
    });
   
try {
  const response =await editTeacher(teacherData?.teacherId,formDataToSend)
  if(response?.success){
    toast.success(response?.message)
    setIsEdit(false)
    handleCancel()
  }
  else{
    toast.error(response?.message)
  }
} catch (error) {
  console.log("error",error)
}
finally{
  setIsLoader(false)
}

  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTeacherData({
        ...teacherData,
        image: file,
      });
    }}

  return (
    <div className="text-center p-5 bg-white">
      <h1 className="text-xl font-bold mb-6">Edit Teacher Profile</h1>

      <div className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white ">
        <ReactInput type="text" name="teacherName" label="Teacher's Name" onChange={handleOnChange} value={teacherData?.teacherName || ""} />
        <ReactInput type="text" name="employeeId" label="Employee Id" onChange={handleOnChange} value={teacherData?.employeeId || ""} />
        <ReactInput type="text" name="email" label="Teacher's Email" onChange={handleOnChange} value={teacherData?.email || ""} />
        <ReactInput type="number" name="contact" label="Teacher's contact" onChange={handleOnChange} value={teacherData?.contact || ""} />
        <ReactInput type="text" name="admissionNumber" label="Admission Number" onChange={handleOnChange} value={teacherData?.admissionNumber || ""} />
        <ReactInput type="date" label="Date Of Birth" onChange={handleOnChange} name="dateOfBirth" value={moment(teacherData?.dateOfBirth, "YYYY-MM-DD").format("YYYY-MM-DD")} />
        <ReactInput type="text" label="Qualification" onChange={handleOnChange} name="qualification" value={teacherData?.qualification} />
        <ReactInput type="number" label="Salary" onChange={handleOnChange} name="salary" value={teacherData?.salary} />
        <ReactInput type="text" label="Subject" onChange={handleOnChange} name="subject" value={teacherData?.subject} />
        <ReactInput type="text" label="Address" onChange={handleOnChange} name="address" value={teacherData?.address} />
        <ReactInput type="text" label="Experience" onChange={handleOnChange} name="experience" value={teacherData?.experience} />
        <ReactSelect name="gender" value={teacherData?.gender || ""} handleChange={handleOnChange} label="Gender" dynamicOptions={[{ label: "Male", value: "Male" }, { label: "Female", value: "Female" }, { label: "Other", value: "Other" }]} />
        <ReactSelect
          required={true}
          name="classTeacher"  // Corrected name attribute
          value={selectedClass}
          handleChange={handleClassChange}
          label="Select a Class"
          dynamicOptions={dynamicOptions}
        />
        <ReactSelect
          name="section"  // Corrected name attribute
          value={selectedSection} // Use selectedSection state
          handleChange={handleSectionChange} // Use the handleSectionChange function
          label="Select a Section"
          dynamicOptions={DynamicSection}
        />
          <ReactInput
            type="file"
            label="Teacher Image"
            accept="image/*"
            onChange={handleImageChange}  // Use new handler
            name="image" // Keep this name
          />
          
        {teacherData.image && (<img src={teacherData?.image?.url || URL.createObjectURL(teacherData.image)} alt="Preview" className="w-10 h-10 object-cover rounded-md" />)}
      </div>

      <div className="flex gap-3 mt-6">
        <Button name="Update" onClick={handleUpdate}  width="full" />
        <Button name="Cancel" onClick={() => setIsEdit(false)} width="full" />
       
      </div>
    </div>
  );
};

export default EditTeacher;

