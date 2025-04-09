
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@mui/material";
import { useStateContext } from "../../contexts/ContextProvider.js";
import Cookies from "js-cookie";

const authToken = Cookies.get("token");

const EditAdmission = () => {
  const { currentColor } = useStateContext();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    dateOfBirth: "",
    rollNo: "",
    gender: "",
    joiningDate: "",
    address: "",
    contact: "",
    class: "",
    section: "",
    country: "",

    city: "",
    state: "",
    pincode: "",
    nationality: "",
    caste: "",
    religion: "",
    image: null,
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    const { image, ...formDataWithoutImage } = formData;

    for (const key in formDataWithoutImage) {
      data.append(key, formDataWithoutImage[key]);
    }

    if (image && image instanceof File) {
      data.append("image", image);
    }
    // console.log("data",data)

    axios
      .put(
        `https://dvsserver.onrender.com/api/v1/adminRoute/updateStudent`,
        data,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        navigate("/admin/admission");
      })
      .catch((error) => {
        console.error("Error updating student data:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="text-center p-5">
      <h1 className="text-3xl font-bold mb-5">Edit Student's Details</h1>
      
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 bg-white rounded-md shadow-lg">
          <div>
            <label htmlFor="fullName">Full Name</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="fullName"
              name="fullName"
              value={formData.fullName}
              onChange={handleOnChange}
              placeholder="Full Name"
            />
          </div>
          <div>
            <label htmlFor="rollNo">Roll No</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="rollNo"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleOnChange}
              placeholder="Roll No"
            />
          </div>
          <div>
            <label htmlFor="email">Email</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="email"
              id="email"
              name="email"
              value={formData.email}
              readOnly
              placeholder="Email"
            />
          </div>
          <div>
            <label htmlFor="dateOfBirth">Date of Birth</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="date"
              id="dateOfBirth"
              name="dateOfBirth"
              value={
                formData.dateOfBirth
                  ? new Date(formData.dateOfBirth).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleOnChange}
            />
          </div>
          <div>
            <label htmlFor="gender">Gender</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleOnChange}
              placeholder="Gender"
            />
          </div>
         
          <div>
            <label htmlFor="subject">Subject</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleOnChange}
              placeholder="Subject"
            />
          </div>
          <div>
            <label htmlFor="joiningDate">Joining Date</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="date"
              id="joiningDate"
              name="joiningDate"
              // value={formData.joiningDate}
              value={
                formData.joiningDate
                  ? new Date(formData.joiningDate).toISOString().split("T")[0]
                  : ""
              }
              onChange={handleOnChange}
              placeholder="Joining Date"
            />
          </div>
          <div>
            <label htmlFor="address">Address</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleOnChange}
              placeholder="Address"
            />
          </div>
          <div>
            <label htmlFor="country">Country</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="country"
              name="country"
              value={formData.country}
              onChange={handleOnChange}
              placeholder="Country"
            />
          </div>
          <div>
            <label htmlFor="contact">Contact</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="contact"
              name="contact"
              value={formData.contact}
              onChange={handleOnChange}
              placeholder="Contact"
            />
          </div>
          <div>
            <label htmlFor="city">City</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="city"
              name="city"
              value={formData.city}
              onChange={handleOnChange}
              placeholder="City"
            />
          </div>
          <div>
            <label htmlFor="state">State</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="state"
              name="state"
              value={formData.state}
              onChange={handleOnChange}
              placeholder="State"
            />
          </div>
          <div>
            <label htmlFor="pincode">Pincode</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="pincode"
              name="pincode"
              value={formData.pincode}
              onChange={handleOnChange}
              placeholder="Pincode"
            />
          </div>
          <div>
            <label htmlFor="nationality">Nationality</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleOnChange}
              placeholder="Nationality"
            />
          </div>
          <div>
            <label htmlFor="caste">Caste</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="caste"
              name="caste"
              value={formData.caste}
              onChange={handleOnChange}
              placeholder="Caste"
            />
          </div>
          <div>
            <label htmlFor="religion">Religion</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="religion"
              name="religion"
              value={formData.religion}
              onChange={handleOnChange}
              placeholder="Religion"
            />
          </div>
          <div>
            <label htmlFor="class">Class</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="class"
              name="class"
              value={formData.class}
              onChange={handleOnChange}
              placeholder="Class"
            />
          </div>
          <div>
            <label htmlFor="section">Section</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="section"
              name="section"
              value={formData.section}
              onChange={handleOnChange}
              placeholder="Section"
            />
          </div>
          <div>
            <label htmlFor="image">Image</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
          <div>
            <label htmlFor="section">Father's Name</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="fatherName"
              name="fatherName"
              value={formData.fatherName}
              onChange={handleOnChange}
              placeholder="fatherName"
            />
          </div>
          <div>
            <label htmlFor="section">Mother's Name</label>
            <input
              className="w-full p-2 border border-gray-300 rounded"
              type="text"
              id="motherName"
              name="motherName"
              value={formData.motherName}
              onChange={handleOnChange}
              placeholder="motherName"
            />
          </div>
        </div>
        <div className="flex justify-between gap-5 mt-5">
          <Button
            className="w-full text-white font-bold py-2 px-4 rounded mr-2"
            type="submit"
            variant="contained"
            disabled={loading}
            style={{
              backgroundColor: currentColor,
              color: "white",
            }}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
          <Link className="w-full" to="/admin/admission">
            <Button
              variant="contained"
              className="w-full text-white font-bold py-2 px-4 rounded mr-2"
              style={{
                backgroundColor: "#616161",
                color: "white",
              }}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditAdmission;
