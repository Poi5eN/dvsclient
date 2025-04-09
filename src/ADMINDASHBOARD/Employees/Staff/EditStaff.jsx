import React, { useState, useEffect } from "react";
import { Box, Button, TextField, Select, MenuItem } from "@mui/material";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { editStaff, getstaffBYID } from "../../../Network/AdminApi";
import { toast } from "react-toastify";


const EditStaff = () => {
  const authToken = localStorage.getItem("token");
  const navigate = useNavigate();
  const { email } = useParams();
  const [staffData, setStaffData] = useState({});
  const genders = ["Male", "Female", "Other"];
  const [formData, setFormData] = useState({
    fullName: "",
    employeeId: "",
    email: "",
    dateOfBirth: "",
    qualification: "",
    salary: "",
    gender: "",
    joiningDate: "",
    address: "",
    contact: "",
    image: null,
  });
  const [loading, setLoading] = useState(false)


  const handleOnChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };







  const fetchEmployees = async () => {
    try {
      const response = await getstaffBYID(email)
     console.log("response",response)
      if (response) {
       
        // setSubmittedData(response?.employees[0]);
        setStaffData(response?.employees[0]);
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...response?.employees[0],
        }));
      } else {
        toast.error(response?.error)
      }
    } catch (error) {
      console.error("Error", error);
    }
  };
  useEffect(() => {
    fetchEmployees();
  }, [email]);






  // useEffect(() => {
  //   axios.get(
  //     `https://dvsserver.onrender.com/api/v1/adminRoute/getAllEmployees?email=${email}`,
  //     {
  //       withCredentials: true,
  //       headers: {
  //         Authorization: `Bearer ${authToken}`,
  //       }, // Set withCredentials to true
  //     }
  //   )
  //     .then((response) => {
  //       const data = response.data.allEmployee[0];
  //       setStaffData(data);
  //       setFormData((prevFormData) => ({
  //         ...prevFormData,
  //         ...data,
  //       }));
  //     })
  //     .catch((error) => {
  //       console.error("Error fetching staff data:", error);
  //     });
  // }, []);

  const handleFormSubmit = async(e) => {
 
    e.preventDefault();
    setLoading(true);

    const data = new FormData();

    if (formData.image instanceof File) {
      data.append('image', formData.image);
    }

    // Append the rest of the form data to the FormData
    for (const key in formData) {
      if (key !== 'image' && formData.hasOwnProperty(key)) {
        data.append(key, formData[key]);
      }
    }
const response=await editStaff(data,email)
if(response?.success){
toast.success(response?.message)
navigate("/admin/staff");
}
else{
  toast.error(response?.message)
}
    // axios.put(`https://dvsserver.onrender.com/api/v1/adminRoute/updateEmployee`, data, {
    //   withCredentials: true,
    //   headers: {
    //     Authorization: `Bearer ${authToken}`,
    //     'Content-Type': 'multipart/form-data',
    //   },
    // })
    //   .then((response) => {
       
    //     navigate("/admin/staff");
    //   })
      // .catch((error) => {
      //   console.error("Error updating staff data:", error);
      // })
      // .finally(() => {
      //   setLoading(false);
      // });


  };



  return (

    <div style={{ textAlign: "center", padding: "20px", }}>
      <h1 style={{ fontSize: "30px", fontWeight: "900" }}>Edit Staff Profile</h1>
      <form onSubmit={handleFormSubmit} encType="multipart/form-data">
        <Box className="py-5 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2 p-4 bg-white rounded-md shadow-lg">
          <TextField
            label="FullName"
            name="staffName"
            type="text"
            value={formData.staffName}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          {/* <TextField
            label="EmployeeId"
            name="employeeId"
            type="text"
            value={formData.employeeId}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          /> */}
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleOnChange}
            required
            InputProps={{
              readOnly: true,
            }}
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="DateOfBirth"
            name="dateOfBirth"
            // type="date"
            value={formData.dateOfBirth}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          {/* <Select
            label="Status"
            name="status"
            value={formData.status}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom:"20px" }}
          >
            <MenuItem value="Active">Active</MenuItem>
            <MenuItem value="Inactive">Inactive</MenuItem>
          </Select> */}
          {/* <Select
            label="Qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom:"20px" }}
          >
            {qualifications.map((qualification) => (
              <MenuItem key={qualification} value={qualification}>
                {qualification}
              </MenuItem>
            ))}
          </Select> */}
          <TextField
            label="Qualification"
            name="qualification"
            value={formData.qualification}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            label="Salary"
            name="salary"
            value={formData.salary}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <Select
            label="Gender"
            name="gender"
            value={formData.gender}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          >
            {genders.map((gender) => (
              <MenuItem key={gender} value={gender}>
                {gender}
              </MenuItem>
            ))}
          </Select>
          <TextField
            label="Joining Date"
            name="joiningDate"
            // type="date"
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
            label="Contact"
            name="contact"
            value={formData.contact}
            onChange={handleOnChange}
            required
            style={{ width: "70%", paddingBottom: "20px" }}
          />
          <TextField
            name="image"
            type="file"
            accept="image/*"
            required
            onChange={handleImageChange}
            style={{ width: "70%", paddingBottom: "20px" }}
          // value={formData.image}
          />
        </Box>
        <Link to="/admin/staff">
          <div className="button flex w-full" style={{ marginTop: '10px' }}>
            <Button variant="contained" onClick={handleFormSubmit} style={{ width: '50%', marginRight: '10px' }}>
              {loading ?
                (<svg aria-hidden="true" className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                </svg>) : " Update"
              }
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

export default EditStaff;
