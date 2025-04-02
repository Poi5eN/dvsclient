import React, { useState, useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { editClassebyID, GetClassebyID } from "../../Network/AdminApi";
import { toast } from "react-toastify";

const EditClass = () => {
  const navigate = useNavigate();
  const { className } = useParams();
  const [formData, setFormData] = useState({
    className: "",
    subjects: "",
    sections: "",
  });
  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData({ 
      ...formData, 
      [name]: value // Ensure subjects remain as a string
    });
  };

  const getClass = async () => {
    try {
      const response = await GetClassebyID(className);
      if (response?.success) {
        setFormData({
          ...response.class,
          subjects: Array.isArray(response.class.subjects)
            ? response.class.subjects.join(", ") // Convert array to comma-separated string
            : response.class.subjects
        });
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      className: formData?.className,
      sections: String(formData?.sections),
      subjects: formData?.subjects, // Already a string
    };

    try {
      const response = await editClassebyID(payload, className);
      if (response?.success) {
        setFormData(response.class);
        toast.success("Class updated successfully!");
        navigate("/admin/classes"); // Redirect after successful update
      } else {
        toast.error(response?.message);
      }
    } catch (error) {
      console.log("error", error);
    }
  };

  useEffect(() => {
    getClass();
  }, [className]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "900" }}>Edit Class</h1>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Box className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white ">
          <TextField
            label="Class Name"
            name="className"
            type="text"
            value={formData?.className}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          
          <TextField
            label="Sections"
            name="sections"
            type="text"
            value={formData.sections}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />

          <TextField
            label="Subjects"
            name="subjects"
            type="text"
            value={formData.subjects}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
        </Box>

        <div className="button flex w-full gap-5" style={{ marginTop: "10px" }}>
          <Button
            variant="contained"
            type="submit"
            // style={{ width: "50%", marginRight: "10px" }}
          >
            Update
          </Button>
          <Link to="/admin/classes">
            <Button variant="contained"
            
            style={{ background:"gray" }}
            >
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditClass;

