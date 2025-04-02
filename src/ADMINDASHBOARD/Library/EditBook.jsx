
import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Select, MenuItem } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";


const EditBook = () => {
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const { _id } = useParams();

  const [classData, setClassData] = useState({});
  const [formData, setFormData] = useState({
    bookName: "",
    authorName: "",
    quantity: "",
    category: "",
    className: "",
    subject: ""
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

  useEffect(() => {
    axios
    .get(
      `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllBooks?_id=${_id}`,
      {withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },}
    )
      .then((response) => {
        const  data  = response.data.listOfAllBooks[0];
        setClassData(data);
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...data,
        }));
      })
      .catch((error) => {
        console.error("Error fetching teacher data:", error);
      });
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    axios
      .put(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/updateBook/${_id}`, formData, 
      {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        }
      }
      )
      .then((response) => {
        
        navigate("/admin/books");
      })
      .catch((error) => {
        console.error("Error updating Book:", error);
      });
  };

  return (

    <div style={{textAlign: "center", padding: "20px", }}>
      <h1 style={{ fontSize: "30px", fontWeight: "900" }}>Edit Book Detail</h1>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Box className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white rounded-md shadow-lg">
          <TextField
            label="Book Name"
            name="bookName"
            type="text"
            value={formData.bookName}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom:"20px" }}
          />
          <TextField
            label="Author Name"
            name="authorName"
            type="text"
            value={formData.authorName}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom:"20px" }}
          />
          <TextField
            label="Quantity"
            name="quantity"
            type="Number"
            value={formData.quantity}
            onChange={handleOnChange}
            required
            readOnly
            style={{ width: "70%", paddingBottom:"20px" }}
          />
          <TextField
            label="Category"
            name="category"
            type="text"
            value={formData.category}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom:"20px" }}
          />
          <TextField
            label="Class Name"
            name="className"
            type="text"
            value={formData.className}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom:"20px" }}
          />
          <TextField
            label="Subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom:"20px" }}
          />
        </Box>
          <Link to="/admin/books">
          <div className="button flex w-full" style={{ marginTop: '10px' }}>
  <Button variant="contained" onClick={handleFormSubmit} style={{ width: '50%', marginRight: '10px' }}>
    Update
  </Button>
  <Button variant="contained" style={{ width: '50%' }}>
    Cancel
  </Button>
</div>
          </Link>
      </form>
    </div>
  );
};

export default EditBook;
