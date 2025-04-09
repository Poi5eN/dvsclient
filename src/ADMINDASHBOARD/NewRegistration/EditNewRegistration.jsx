import React, { useState, useEffect, useRef } from "react";
import { Box, Button, TextField, Select, MenuItem } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { usePDF } from "react-to-pdf";


const EditNewRegistration = () => {
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const { email } = useParams();
  const [studentData, setStudentData] = useState({});
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    // studentEmail: "",
    // studentPassword: "",
    dateOfBirth: "",
    rollNo: "",
    gender: "",
    joiningDate: "",
    address: "",
    contact: "",
    class: "",
    section: "",
    country: "",
    subject: "",
    // fatherName: "",
    // motherName: "",
    // parentEmail: "",
    // parentPassword: "",
    // parentContact: "",
    image: null,
    // parentImage: "",
  });

  const { toPDF, targetRef } = usePDF({ filename: "Student.pdf" });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log("File:", file); // Check if 'file' is not undefined
    if (file) {
      console.log("Updating studentImage with file:", file);
      setFormData({
        ...formData,
        studentImage: file,
      });
      console.log(formData);
    }
  };

  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
        {
          withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
        }
      )
      .then((response) => {
        const data = response.data.allStudent[0];
        console.log("Students", data);
        setStudentData(data);
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
        }));
      })
      .catch((error) => {
        console.error("Error fetching teacher data:", error);
      });
  }, [email]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
  
    const data = new FormData();
  
    // Exclude image from formData
    const { image, ...formDataWithoutImage } = formData;
  
    // Append other form data to the FormData
    for (const key in formDataWithoutImage) {
      data.append(key, formDataWithoutImage[key]);
    }
  
    // Append image as a separate file
    if (image && typeof image === 'object' && image instanceof File) {
      data.append("image", image);
    }
  
    axios
      .put(`https://dvsserver.onrender.com/api/v1/adminRoute/updateStudent`, data, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        }
      })
      .then((response) => {
        console.log("Student data updated successfully", response);
        navigate("/admin/allstudent");
      })
      .catch((error) => {
        console.error("Error updating student data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };
  
  

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "900" }}>
        Edit Student Profile
      </h1>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Box className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white rounded-md shadow-lg">
          <TextField
            label="FullName"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Roll No"
            name="rollNo"
            type="text"
            value={formData.rollNo}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleOnChange}
            required
            readOnly // Ensure 'readOnly' is set here
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="DateOfBirth"
            name="dateOfBirth"
            type="date"
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Subject"
            name="subject"
            value={formData.subject}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Joining Date"
            name="joiningDate"
            value={formData.joiningDate}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Address"
            name="address"
            value={formData.address}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Country"
            name="country"
            value={formData.country}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Class"
            name="class"
            value={formData.class}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Section"
            name="section"
            value={formData.section}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Student Image"
            name="image"
            type="file"
            accept="image/*"
            required
            onChange={handleImageChange}
            style={{ width: "70%", paddingBottom: "20px" }}
          />
        </Box>
        <Link to="/admin/allstudent">
          <div className="button flex w-full" style={{ marginTop: "10px" }}>
            <Button
              variant="contained"
              onClick={handleFormSubmit}
              style={{ width: "50%", marginRight: "10px" }}
            >
              Update
            </Button>
            <Button variant="contained" style={{ width: "50%" }}>
              Cancel
            </Button>
          </div>
        </Link>
      </form>
    </div>
  );
};

export default EditNewRegistration;