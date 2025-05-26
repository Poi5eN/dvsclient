import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "../../Dynamic/Form/FormStyle.css";
import { useStateContext } from "../../contexts/ContextProvider";
import { FaEdit } from "react-icons/fa";
import { AdminGetAllClasses, getAllTeachers } from "../../Network/AdminApi";
import EditTeacher from "./EditTeacher";
import Table from "../../Dynamic/Table";
import moment from "moment";
import Button from "../../Dynamic/utils/Button";
import PageHeaderWithBreadcrumb from "../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../Dynamic/BreadcrumbList";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { ReactSelect } from "../../Dynamic/ReactSelect/ReactSelect";
import Modal from "../../Dynamic/Modal";
import ImageCaptureCrop from "../../Dynamic/Camera/ImageCaptureCrop";
import StudentTable from "../../Dynamic/StudentTable";

const authToken = localStorage.getItem("token");

const toastifyTiming = {
  autoClose: 1000,
};

const initialState = {
  teacherName: "",
  employeeId: "",
  email: "",
  password: "",
  dateOfBirth: "",
  qualification: "",
  salary: "",
  subject: "",
  gender: "",
  joiningDate: "",
  address: "",
  contact: "",
  experience: "",
  section: "",
  classTeacher: "",
  image: null,
};

function CreateTeacher() {
  const { currentColor, setIsLoader } = useStateContext();
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [availableSections, setAvailableSections] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [teacherDetails, setTeacherDetails] = useState([]);
  const [formData, setFormData] = useState(initialState);
  const [submittedData, setSubmittedData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [getClass, setGetClass] = useState([]);

  const toggleModal = () => {
    // setIsOpen(!isOpen);
    setModalOpen(!modalOpen)
    if (modalOpen) {
      setFormData(initialState);
    }
  };

  const getAllClass = async () => {
    try {
      const response = await AdminGetAllClasses();
      if (response?.success) {
        let classes = response.classes;
        setGetClass(classes.sort((a, b) => a - b));
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getAllClass();
  }, []);

  const handleClassChange = (e) => {
    const selectedClassName = e.target.value;
    setSelectedClass(selectedClassName);
    console.log("Selected Class:", selectedClassName); // Debugging
    const selectedClassObj = getClass?.find((cls) => cls.className === selectedClassName);
    if (selectedClassObj) {
      setAvailableSections(selectedClassObj.sections);
    } else {
      setAvailableSections([]);
    }
  };

  const handleSectionChange = (e) => {
    setSelectedSection(e.target.value);
    console.log("Selected Section:", e.target.value); // Debugging
  };

  const dynamicOptions = getClass.map((cls) => ({
    label: cls.className,
    value: cls.className,
  }));
  const DynamicSection = availableSections?.map((item) => ({
    label: item,
    value: item,
  }));

  const getTeachers = async () => {
    setIsLoader(true);
    try {
      const response = await getAllTeachers();
      if (response?.success) {
        setSubmittedData(response?.data);
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error", error);
      toast.error("Failed to fetch teachers.");
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    getTeachers();
  }, [isEdit]);

  const handleFieldChange = (fieldName, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  const handleSelectChange = (fieldName, value) => {
    setFormData((prevFormData) => ({
      ...prevFormData,
      [fieldName]: value,
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  const handleImageProcessed = (fileObject, imageFieldName) => {
    setFormData((prevPayload) => ({
      ...prevPayload,
      [imageFieldName]: fileObject, // fileObject will be a File or null
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        image: file,
      }));
    }
  };

  const handleSubmit = async () => {
    const formDataToSend = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && value instanceof File) {
        formDataToSend.append(key, value);
      } else if (value !== null && value !== undefined && value !== "") {
        formDataToSend.append(key, String(value));
      }
    });

    // Explicitly append classTeacher and section
    formDataToSend.append("classTeacher", selectedClass);
    formDataToSend.append("section", selectedSection);

    // Debug output
    for (let pair of formDataToSend.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    setIsLoader(true);
    try {
      const response = await axios.post(
        "https://dvsserver.onrender.com/api/v1/adminRoute/teacher",
        formDataToSend,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFormData(initialState);
      getTeachers();
      setModalOpen(false)
      toast.success("Form submitted successfully!");
      // setIsOpen(false);
    } catch (error) {
      console.error("Error:", error.response ? error.response.data : error.message);
      if (error.response && error.response.status === 400) {
        toast.error(error.response.data?.message || "Validation error or email already exists.", toastifyTiming);
        return;
      }
      toast.error(
        error.response?.data?.message || "An error occurred while submitting the form.",
        toastifyTiming
      );
    } finally {
      setIsLoader(false);
    }
  };

  const onEdit = (val) => {
    setIsEdit(true);
    setTeacherDetails(val);
  };

  const handleCancel = () => {
    setIsEdit(false);
  };

  const THEAD = [
    { id: "SN", label: "S No.", width: "5" },
    { id: "photo", label: "Photo", width: "7" },
    // { id: "employeeID", label: "Employee ID" },
    { id: "name", label: "Name" },
    { id: "email", label: "Email" },
    { id: "password", label: "Password" },
    { id: "class", label: "Class Teacher" },
    { id: "section", label: "Section" },
    { id: "contact", label: "Contact" },
    { id: "joiningDate", label: "Joining Date" },
    { id: "action", label: "Action" },
  ];

  const tBody = submittedData?.map((val, ind) => ({
    SN: ind + 1,
    photo: (
      <img
        src={
          val.image?.url ||
          "https://www.stcroixstoves.com/wp-content/uploads/2020/04/no.png"
        }
        alt="photo"
        className="w-10 h-10 object-cover rounded-md"
      />
    ),
    // employeeID: (
    //   <span className="text-green-800 font-semibold">{val.employeeId}</span>
    // ),
    name: val.teacherName,
    email: val.email,
    password: val.password,
    class: val.classTeacher === "Not a class teacher" || !val.classTeacher ? "N/A" : val.classTeacher,
    section: val.classTeacher === "Not a class teacher" || !val.classTeacher ? "N/A" : val.section,
    contact: val.contact,
    joiningDate: moment(val.joiningDate).format("DD-MMM-YYYY"),
    action: (
      <div className="flex justify-center gap-5">
        <span className="cursor-pointer">
          <FaEdit
            className="text-[20px] text-yellow-700"
            onClick={() => onEdit(val)}
          />
        </span>
      </div>
    ),
  }));

  return (
    <>

      {!isEdit ? (
        <> <PageHeaderWithBreadcrumb
          breadcrumbItems={BreadcrumbList.admission}
          title="All Teachers"
        />
          <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2 mb-4">
            <Button onClick={toggleModal} name="Add New Teacher" />
          </div>
          <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create"} maxWidth="500px">
            <div className="p-4 md:p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-4">

                <ReactInput
                  type="text"
                  name="teacherName"
                  required={true}
                  label="Full Name"
                  onChange={handleInputChange}
                  value={formData.teacherName}
                />
                <ReactInput
                  type="text"
                  name="employeeId"
                  required={true}
                  label="Employee ID"
                  onChange={handleInputChange}
                  value={formData.employeeId}
                />
                <ReactInput
                  type="email"
                  name="email"
                  required={true}
                  label="Email"
                  onChange={handleInputChange}
                  value={formData.email}
                />
                <ReactInput
                  type="password"
                  name="password"
                  required={true}
                  label="Password"
                  onChange={handleInputChange}
                  value={formData.password}
                />
                <ReactInput
                  type="date"
                  name="dateOfBirth"
                  required={true}
                  label="Date of Birth"
                  onChange={handleInputChange}
                  value={formData.dateOfBirth}
                />
                <ReactInput
                  type="text"
                  name="qualification"
                  required={true}
                  label="Qualification"
                  onChange={handleInputChange}
                  value={formData.qualification}
                />
                <ReactInput
                  type="number"
                  name="salary"
                  required={true}
                  label="Salary"
                  onChange={handleInputChange}
                  value={formData.salary}
                />
                <ReactInput
                  type="text"
                  name="subject"
                  required={true}
                  label="Subject Taught"
                  onChange={handleInputChange}
                  value={formData.subject}
                />
                <ReactInput
                  type="date"
                  name="joiningDate"
                  required={true}
                  label="Joining Date"
                  onChange={handleInputChange}
                  value={formData.joiningDate}
                />
                <ReactInput
                  type="text"
                  name="address"
                  required={true}
                  label="Address"
                  onChange={handleInputChange}
                  value={formData.address}
                />
                <ReactInput
                  type="tel"
                  maxLength="10"
                  name="contact"
                  required={true}
                  label="Contact Number"
                  onChange={handleInputChange}
                  value={formData.contact}
                />
                <ReactSelect
                  required={true}
                  name="experience"
                  value={formData.experience}
                  handleChange={handleInputChange}
                  label="Years of Experience"
                  dynamicOptions={[
                    { label: "1", value: "1" },
                    { label: "2", value: "2" },
                    { label: "3", value: "3" },
                    { label: "4", value: "4" },
                    { label: "5", value: "5" },
                    { label: "6", value: "6" },
                    { label: "7", value: "7" },
                    { label: "8", value: "8" },
                    { label: "9", value: "9" },
                    { label: "10", value: "10" },
                    { label: "10+", value: "10+" },
                  ]}
                />
                <ReactSelect
                  name="gender"
                  value={formData?.gender}
                  handleChange={handleInputChange}
                  label="Gender"
                  dynamicOptions={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                    { label: "Other", value: "Other" },
                  ]}
                />
                <ReactSelect
                  required={true}
                  name="classTeacher"
                  value={selectedClass}
                  handleChange={handleClassChange}
                  label="Select a Class"
                  dynamicOptions={dynamicOptions}
                />
                <ReactSelect
                  required={true}
                  name="section"
                  value={selectedSection}
                  handleChange={handleSectionChange}
                  label="Select a Section"
                  dynamicOptions={DynamicSection}
                />
                <ImageCaptureCrop
                  label="Photo"
                  onImageCropped={(file) => handleImageProcessed(file, 'image')}
                  initialImageUrl={typeof formData.image === 'string' ? formData.image : null}
                  aspectRatio={1}
                  previewSize={120}
                />

                <ReactInput
                  type="file"
                  name="image"
                  label="Profile Pic"
                  onChange={handleImageChange}
                  accept="image/*"
                />
              </div>
              <div className="flex items-center justify-end gap-3 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600 mt-4">
                <Button
                  name="Submit"
                  onClick={handleSubmit}
                />
                <Button
                  name="Cancel"
                  onClick={toggleModal}
                  variant="outlined"
                />
              </div>
            </div>
          </Modal>

          <StudentTable tBody={tBody} tHead={THEAD} />
          {/* <Table tBody={tBody} tHead={THEAD} /> */}
        </>
      ) : (
        <EditTeacher
          teacherDetails={teacherDetails}
          handleCancel={handleCancel}
          setIsEdit={setIsEdit}
          getTeachers={getTeachers}
        />
      )}
    </>
  );
}

export default CreateTeacher;

