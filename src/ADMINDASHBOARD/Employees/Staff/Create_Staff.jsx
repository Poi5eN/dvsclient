import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import '../../../Dynamic/Form/FormStyle.css';
import { useStateContext } from "../../../contexts/ContextProvider";
import DynamicDataTable from "./DataTable";
import Table from "../../../Dynamic/Table";
import Button from "../../../Dynamic/utils/Button";
import Modal from "../../../Dynamic/Modal";
import { ReactSelect } from "../../../Dynamic/ReactSelect/ReactSelect";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";
import { adminRoutestaff, getstaff } from "../../../Network/AdminApi";
  import moment from "moment/moment";
import PageHeaderWithBreadcrumb from "../../../Dynamic/PageHeaderWithBreadcrumb";
import BreadcrumbList from "../../../Dynamic/BreadcrumbList";

function Create_Staff() {
  const authToken = localStorage.getItem("token");
  const { currentColor, setIsLoader } = useStateContext();
  const [formData, setFormData] = useState({
    fullName: "",
    // employeeId: "",
    email: "",
    password: "",
    dateOfBirth: "",
    qualification: "",
    salary: "",
    gender: "",
    joiningDate: "",
    address: "",
    contact: "",
    image: null,
  });

  const [submittedData, setSubmittedData] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch all staff on component mount & when data changes


  const fetchEmployees = async () => {
    try {
      const response = await getstaff()
     
      if (response) {
       
        setSubmittedData(response?.employees);
      } else {
        toast.error(response?.error)
      }
    } catch (error) {
      console.error("Error", error);
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, []);
  const handleFieldChange = (fieldName, value) => {
    setFormData({ ...formData, [fieldName]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
    }
  };

  const handleSubmit = async () => {
    setIsLoader(true);
    const payload={
      "staffName":formData?.fullName,
      "email": formData?.email,
      "password":formData?.password,
      "dateOfBirth": formData?.dateOfBirth,
      "qualification":formData?.qualification,
      "salary":Number(formData?.salary),
      "gender":formData?.gender?.value,
      "address": formData?.address,
      "contact":Number(formData?.contact)
    }

    try {
      const response = await adminRoutestaff(payload);
      if (response?.success) {
        toast.success(response?.message);
        closeModal();
        fetchEmployees(); // Refresh data after submission
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.error("Error submitting staff data:", error);
    } finally {
      closeModal();
      setIsLoader(false);
    }
  };

  const handleDelete = async (email) => {
    try {
      await axios.put(`https://dvsserver.onrender.com/api/v1/adminRoute/deactivateEmployee`, 
        { email },
        { withCredentials: true, headers: { Authorization: `Bearer ${authToken}` } }
      );

      setSubmittedData((prevData) => prevData.filter((item) => item.email !== email));
      toast.success("Staff data deleted successfully");
    } catch (error) {
      console.error("Error deleting Staff data:", error);
      toast.error("An error occurred while deleting the staff data.");
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({
      fullName: "",
      // employeeId: "",
      email: "",
      password: "",
      dateOfBirth: "",
      qualification: "",
      salary: "",
      gender: {},
      // joiningDate: "",
      address: "",
      contact: "",
      // image: null,
    });
  };

   const THEAD = [
    { id: "SN", label: "S No.", width: "2%" },
    { id: "image", label: "Photo", width: "4%" },
    // { id: "admissionNo", label: "Adm No.", width: "5%" },
    { id: "name", label: "Name", width: "10%" },
    { id: "email", label: "Email", width: "20%" },
    { id: "gender", label: "Gender", width: "10%" },
    { id: "joiningDate", label: "Joining Date", width: "5%" },
    { id: "qualification", label: "Qualification", width: "5%" },
    { id: "contact", label: "Contact", width: "5%" },
    { id: "dateOfBirth", label: "DOB", width: "5%" },
    { id: "salary", label: "Salary", width: "5%" },
    { id: "joiningDate", label: "Admission Date", width: "10%" },
    { id: "action", label: "Action", width: "2%" },
  ];
    const tBody = submittedData?.map((val, ind) => ({
    SN: (
      <span className="uppercase">
        {ind + 1}
      </span>
    ),
    image: (
      <img
        src={val?.studentImage?.url || "https://www.stcroixstoves.com/wp-content/uploads/2020/04/no.png"}
        alt="avatar"
        className="relative inline-block object-cover object-center w-6 h-6 rounded-lg"
      />
    ),
    
    name: val.staffName,
    // <span className="uppercase text-deep-purple-500">{val.studentName}</span>,
    email: val.email,
    gender: val.gender,
    // <span className="uppercase">{val.fatherName}</span>,
    joiningDate: <span className="uppercase">{moment(val.joiningDate).format("DD-MM-YYYY")}</span>,
    qualification: <span className="uppercase">{val.qualification}</span>,
    contact:val.contact,
    dateOfBirth:moment(val.dateOfBirth).format("DD-MM-YYYY"),
    //  <span className="uppercase text-cyan-800">{val.contact}</span>,
    salary: <span className="uppercase  text-cyan-800">{val?.salary}</span>,
    // joiningDate: <span className="uppercase  text-deep-purple-700">{moment(val?.joiningDate).format("DD-MMM-YYYY")}</span>,
    // // feeStatus: <span className="uppercase">{val.feeStatus}</span>,
    // action: (
    //   <span onClick={() => handlePrintClick(val)} className="cursor-pointer text-2xl">
    //     🖨️
    //   </span>
    // ),
  }));
  return (
    <div className="">
       <PageHeaderWithBreadcrumb
              breadcrumbItems={BreadcrumbList.admission}
              title="All Staff"
            />

                <div className="bg-white p-2 rounded-lg shadow border border-gray-200 flex flex-wrap md:flex-row gap-2 mb-4">
      <Button name="Add Staff" onClick={openModal} />
</div>
      <Modal setIsOpen={closeModal} isOpen={isModalOpen} title="Create Staff" maxWidth="100px">
        <div className="p-2">
          <ReactInput type="text" name="fullName" label="Name" 
            onChange={(e) => handleFieldChange("fullName", e.target.value)} value={formData.fullName} />

          {/* <ReactInput type="text" name="employeeId" label="Employee ID"
            onChange={(e) => handleFieldChange("employeeId", e.target.value)} value={formData.employeeId} /> */}

          <ReactInput type="email" name="email" label="Email" 
            onChange={(e) => handleFieldChange("email", e.target.value)} value={formData.email} />

          <ReactInput type="password" name="password" label="Password"
            onChange={(e) => handleFieldChange("password", e.target.value)} value={formData.password} />

          <ReactInput type="date" name="dateOfBirth" label="Date of Birth"
            onChange={(e) => handleFieldChange("dateOfBirth", e.target.value)} value={formData.dateOfBirth} />

          <ReactInput type="text" name="qualification" label="Qualification"
            onChange={(e) => handleFieldChange("qualification", e.target.value)} value={formData.qualification} />

          <ReactInput type="number" name="salary" label="Salary"
            onChange={(e) => handleFieldChange("salary", e.target.value)} value={formData.salary} />

          <ReactSelect name="gender" value={formData.gender} handleChange={(e) => handleFieldChange("gender", e)}
            label="Gender" dynamicOptions={[
              { label: "Male", value: "Male" },
              { label: "Female", value: "Female" },
              { label: "Other", value: "Other" },
            ]} />

          <ReactInput type="date" name="joiningDate" label="Joining Date"
            onChange={(e) => handleFieldChange("joiningDate", e.target.value)} value={formData.joiningDate} />

          <ReactInput type="text" name="address" label="Address"
            onChange={(e) => handleFieldChange("address", e.target.value)} value={formData.address} />

          <ReactInput type="tel" name="contact" label="Contact"
            onChange={(e) => handleFieldChange("contact", e.target.value)} value={formData.contact} />

          <ReactInput type="file" name="image" label="Image"
            onChange={handleImageChange} />

          <div style={{ display: "flex", justifyContent: "flex-end", padding: "10px" }}>
            <Button onClick={handleSubmit} name="Submit" />
            <Button onClick={closeModal} name="Cancel" />
          </div>
        </div>
      </Modal>
 <Table tHead={THEAD} tBody={tBody} isSearch={true} title="Students Details" />
      {/* <DynamicDataTable data={submittedData} handleDelete={handleDelete} /> */}
    </div>
  );
}

export default Create_Staff;

