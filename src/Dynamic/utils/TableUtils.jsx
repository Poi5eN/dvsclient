// utils/tableUtils.jsx
import { IconButton } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
// import { useStateContext } from '../../contexts/ContextProvider';
// Common cell styles
// const { currentColor } = useStateContext();
const cellStyles = {
  admissionNumber: {
    fontSize: "14px",
    color: "#ff6d00"
  },
  name: {
    whiteSpace: "nowrap",
    color: "#01579b"
  },
  email: {
    fontSize: "14px",
    color: "#1a237e"
  }
};

// Column definitions
export const getParentColumns = () => [
  { 
    field: "id", 
    headerName: "S. No.", 
    width: 50 
  },
  {
    field: "admissionNumber",
    headerName: "Admission No.",
    minWidth: 80,
    renderCell: (params) => (
      <span style={cellStyles.admissionNumber}>
        {params.value}
      </span>
    ),
  },
  {
    field: "fullName",
    headerName: "Father Name",
    flex: 1,
    minWidth: 80,
    renderCell: (params) => (
      <div style={cellStyles.name}>
        {params.value}
      </div>
    ),
  },
  {
    field: "motherName",
    headerName: "Mother Name",
    flex: 1,
    minWidth: 80,
    renderCell: (params) => (
      <div style={cellStyles.name}>
        {params.value}
      </div>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    flex: 1,
    minWidth: 200,
    renderCell: (params) => (
      <span
      //  style={cellStyles.email}  
      //  style={{ color: "#9ca3e7", }}
       >
        {params.value}
      </span>
    ),
  },
  { 
    field: "contact", 
    headerName: "Contact", 
    flex: 1, 
    minWidth: 80 
  },
  {
    field: "childName",
    headerName: "Children",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <div style={cellStyles.name}>
        {params.value}
      </div>
    ),
  },
  {
    field: "childAdmissionNo",
    headerName: "Admission No",
    flex: 1,
    minWidth: 100,
    renderCell: (params) => (
      <div style={cellStyles.admissionNumber}>
        {params.value}
      </div>
    ),
  },
];
export const getAdmissionColumns = (handleDelete) => [
  { 
    field: "id", 
    headerName: "S. No.", 
    width: 50 
  },
  {
    field: "image.url",
    headerName: "Photo",
    minWidth: 50,
    maxWidth:60,
    flex: 1,
    renderCell: (params) => (
      params.row.image && params.row.image.url ? (
        <img
          src={params.row.image?.url  }
          alt="Student"
          style={{
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <span><img className="h-[25px] w-[25px] rounded-full object-contain" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png" alt="" /></span>
      )
    ),
  },
  {
    field: "admissionNumber",
    headerName: "Adm. No.",
    minWidth: 60,
    maxWidth:70,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#ff6d00", }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "fullName",
    headerName: "Student Name",
    minWidth: 110,
   
    flex: 1,
    renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "10px" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "fatherName",
    headerName: "Father Name",
    minWidth: 110,
    flex: 1,
    renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "10px" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "gender",
    headerName: "Gender",
    // minWidth: 50,
    maxWidth:60,
    flex: 1,
    renderCell: (params) => (
      <span
        style={{
          color: params.value === "Female" ? "#e91e63" : "#135e83",
          fontSize: "12px",
        }}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    minWidth: 150,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#135e83" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "contact",
    headerName: "Contact",
    minWidth: 90,
    maxWidth: 90,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#e65100" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "joiningDate",
    headerName: "Admission Date",
    minWidth: 100,
    flex: 1,
    renderCell: (params) => {
      const date = new Date(params.value);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      return (
        <span style={{ fontSize: "12px", color: "#f50057" }}>
          {formattedDate}
        </span>
      );
    },
  },
  {
    field: "class",
    headerName: "Class",
    minWidth: 60,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#135e83" }}>
        {`${params.row.class} - ${params.row.section}`}
      </span>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    minWidth: 60,
    flex: 1,
    renderCell: (params) => (
      <div>
        <Link to={`/admin/admission/view-admission/${params.row.admissionNumber}`}>
          <IconButton>
            <VisibilityIcon
             style={{ 
              // color: currentColor,
              fontSize:"14px" }} 
             />
          </IconButton>
        </Link>
        <IconButton onClick={() => handleDelete(params.row.email)}>
          <DeleteIcon style={{ color: "#ef4444",fontSize:"14px" }} />
        </IconButton>
      </div>
    ),
  },
];
export const getAllStudentColumns = (handleDeleteClick) => [
  { 
    field: "id", 
    headerName: "S. No.", 
    width: 50 
  },
  {
    field: "image.url",
    headerName: "Photo",
    minWidth: 50,
    flex: 1,
    renderCell: (params) => (
      params.row.image && params.row.image.url ? (
        <img
          src={params.row.image?.url  }
          alt="Student"
          style={{
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <span><img className="h-[25px] w-[25px] rounded-full object-contain" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png" alt="" /></span>
      )
    ),
  },
  {
    field: "admissionNumber",
    headerName: "Admission No.",
    minWidth: 60,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#ff6d00", }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "fullName",
    headerName: "Student Name",
    minWidth: 100,
    flex: 1,
    renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "10px" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "fatherName",
    headerName: "Father Name",
    minWidth: 100,
    flex: 1,
    renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "10px" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "gender",
    headerName: "Gender",
    // minWidth: 50,
    maxWidth: 40,
    // flex: 1,
    renderCell: (params) => (
      <span
        style={{
          color: params.value === "Female" ? "#e91e63" : "#135e83",
          fontSize: "12px",
        }}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    minWidth: 110,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#135e83" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "contact",
    headerName: "Contact",
    minWidth: 90,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#e65100" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "joiningDate",
    headerName: "Adm. Date",
    minWidth: 100,
    flex: 1,
    renderCell: (params) => {
      const date = new Date(params.value);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      return (
        <span style={{ fontSize: "12px", color: "#f50057" }}>
          {formattedDate}
        </span>
      );
    },
  },
  {
    field: "class",
    headerName: "Class",
    minWidth: 60,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#135e83" }}>
        {`${params.row.class} - ${params.row.section}`}
      </span>
    ),
  },
  {
    field: "actions",
    headerName: "Actions",
    minWidth: 60,
    flex: 1,
    renderCell: (params) => (
      <div>
        <Link to={`/admin/allstudent/viewstudent/view-profile/${params.row._id}`}>
          <IconButton>
            <VisibilityIcon
             style={{ 
              // color: currentColor,
              fontSize:"14px" }} 
             />
          </IconButton>
        </Link>
        <Link
            to={`/admin/allstudent/editstudent/edit-profile/${params.row._id}`}
            // to={`/admin/allstudent/editstudent/edit-profile/${params.row.email}`}
            className=""
          >
            <IconButton>
              <EditIcon
                className="text-green-600 "
                style={{ fontSize: "14px" }}
              />
            </IconButton>
          </Link>
        <IconButton onClick={() => handleDeleteClick(params.row.email)}>

          <DeleteIcon style={{ color: "#ef4444",fontSize:"14px" }} />
        </IconButton>
      </div>
    ),
  },
];
export const getStudentData_TeacherColumns = () => [
  { 
    field: "id", 
    headerName: "#", 
    width: 60 ,
  
  },
  {
    field: "image.url",
    headerName: "Photo",
    minWidth: 50,
    maxWidth:60,
    flex: 1,
    renderCell: (params) => (
      params.row.image && params.row.image.url ? (
        <img
          src={params.row.image?.url  }
          alt="Student"
          style={{
            width: "25px",
            height: "25px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
      ) : (
        <span><img className="h-[25px] w-[25px] rounded-full object-contain" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png" alt="" /></span>
      )
    ),
  },
  {
    field: "admissionNumber",
    headerName: "Admission No.",
    minWidth: 60,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#ff6d00", }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "fullName",
    headerName: "Student Name",
    minWidth: 100,
    flex: 1,
    renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "10px" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "fatherName",
    headerName: "Father Name",
    minWidth: 100,
    flex: 1,
    renderCell: (params) => (
      <span style={{ color: "#01579b", fontSize: "10px" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "gender",
    headerName: "Gender",
    minWidth: 50,
    flex: 1,
    renderCell: (params) => (
      <span
        style={{
          color: params.value === "Female" ? "#e91e63" : "#135e83",
          fontSize: "12px",
        }}
      >
        {params.value}
      </span>
    ),
  },
  {
    field: "email",
    headerName: "Email",
    minWidth: 110,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#1a237e" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "contact",
    headerName: "Contact",
    minWidth: 90,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#e65100" }}>
        {params.value}
      </span>
    ),
  },
  {
    field: "joiningDate",
    headerName: "Admission Date",
    minWidth: 100,
    flex: 1,
    renderCell: (params) => {
      const date = new Date(params.value);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      return (
        <span style={{ fontSize: "12px", color: "#f50057" }}>
          {formattedDate}
        </span>
      );
    },
  },
  {
    field: "class",
    headerName: "Class",
    minWidth: 60,
    flex: 1,
    renderCell: (params) => (
      <span style={{ fontSize: "12px", color: "#1a237e" }}>
        {`${params.row.class} - ${params.row.section}`}
      </span>
    ),
  },
  {
    field: "View",
    headerName: "View",
    minWidth: 60,
    flex: 1,
    renderCell: (params) => (
      <div>
        <Link to={`/teacher/mystudents/view-profile/${params.row.email}`}>
          <IconButton>
            <VisibilityIcon
             style={{ 
              // color: currentColor,
              fontSize:"14px" }} 
             />
          </IconButton>
        </Link>
       
      </div>
    ),
  },
];

// Table styles configuration
export const TABLE_STYLES = {
  header: {
    backgroundColor: "#f5f5f5",
    color: "#1a237e",
    fontSize: "15px",
    fontWeight: "600",
    minHeight: "56px",
    maxHeight: "56px",
    lineHeight: "56px"
  },
  row: {
    minHeight: "52px",
    maxHeight: "52px"
  },
  cell: {
    padding: "8px 16px"
  }
};

