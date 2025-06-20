import React, { useState, useEffect } from "react";
import { Box, Button, TextField } from "@mui/material";
import { Link, useParams, useNavigate } from "react-router-dom";
import { editClassebyID, GetClassebyID } from "../../Network/AdminApi";
import { toast } from "react-toastify";

const EditClass = () => {
  const navigate = useNavigate();
  const { classId } = useParams(); // Changed from className to classId
  const [formData, setFormData] = useState({
    className: "",
    subjects: "",
    sections: "",
  });

  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const getClass = async () => {
    try {
      const response = await GetClassebyID(classId);
      if (response?.success) {
        setFormData({
          className: response.class.className || "",
          sections: Array.isArray(response.class.sections)
            ? response.class.sections.join(", ")
            : "",
          subjects: Array.isArray(response.class.subjects)
            ? response.class.subjects.join(", ")
            : "",
        });
      } else {
        toast.error(response?.message || "Failed to fetch class data");
      }
    } catch (error) {
      console.error("Error fetching class:", error);
      toast.error("Error fetching class data");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const normalizeCommaString = (str) =>
      str
        ? str
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .join(", ")
        : "";

    // Construct payload, only including fields that have values
    const payload = {};
    if (formData.className.trim()) {
      payload.className = formData.className.trim();
    }
    if (formData.sections.trim()) {
      payload.sections = normalizeCommaString(formData.sections);
    }
    if (formData.subjects.trim()) {
      payload.subjects = normalizeCommaString(formData.subjects);
    }

    // Ensure at least one field is being updated
    if (Object.keys(payload).length === 0) {
      toast.error("Please update at least one field");
      return;
    }

    try {
      const response = await editClassebyID(payload, classId);
      if (response?.success) {
        toast.success("Class updated successfully!");
        navigate("/admin/classes");
      } else {
        toast.error(response?.message || "Failed to update class");
      }
    } catch (error) {
      console.error("Error updating class:", error);
      toast.error("Error updating class");
    }
  };

  useEffect(() => {
    getClass();
  }, [classId]);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1 style={{ fontSize: "30px", fontWeight: "900" }}>Edit Class</h1>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Box className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white">
          <TextField
            label="Class Name"
            name="className"
            type="text"
            value={formData.className}
            onChange={handleOnChange}
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Sections"
            name="sections"
            type="text"
            value={formData.sections}
            onChange={handleOnChange}
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Subjects"
            name="subjects"
            type="text"
            value={formData.subjects}
            onChange={handleOnChange}
            style={{ width: "70%", paddingBottom: "20px" }}
          />
        </Box>
        <div className="button flex w-full gap-5" style={{ marginTop: "10px" }}>
          <Button variant="contained" type="submit">
            Update
          </Button>
          <Link to="/admin/classes">
            <Button variant="contained" style={{ background: "gray" }}>
              Cancel
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
};

export default EditClass;