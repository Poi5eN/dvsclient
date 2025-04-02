import { DataGrid } from "@mui/x-data-grid";
import { Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DeleteIcon from "@mui/icons-material/Delete";
import { Button } from "@mui/material";
import "./index.css";
import React, { useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider";

import { toast } from "react-toastify";
import * as XLSX from "xlsx";

function DynamicDataTable({ data, handleDelete }) {
  const { currentColor } = useStateContext();
  const componentPDF = useRef();


  const exportToExcel = () => {
    // Prepare data for export
    {console.log("data",data)}
    const excelData = data.map((item, index) => ({
      
      // "S. No.": index + 1,
      // "Admission No.": item.admissionNumber,
      // "Roll No":item.rollNo,
      // "Student Name": item.fullName,
      // "Father Name": item.fatherName,
      // "Mother Name":item.motherName,
      // Gender: item.gender,
      // Email: item.email,
      // Contact: item.contact,
      // "DOB":item.dateOfBirth,
      // "Admission Date": new Date(item.joiningDate).toLocaleDateString(),
      // Class: `${item.class} - ${item.section}`,
      // Address:item.address,
      // City:item.city,
      // State:item.state,
      // Country:item.country,
      // Nationality:item.nationality,
      // Pincode:item.pincode,
      // Religion:item.religion,
      // Caste:item.caste


      "studentFullName": item.studentFullName,
      "studentEmail": item.studentEmail,
      "studentPassword":  item.studentPassword,
      "studentDateOfBirth":  new Date(item.studentDateOfBirth).toLocaleDateString(),
      "studentGender": item.studentGender,
      "studentJoiningDate": new Date(item.studentJoiningDate).toLocaleDateString(),
      "studentAddress": item.studentAddress,
      "studentContact": item.studentContact,
      "studentClass":`${item.class} - ${item.section}`,
      // "studentSection": "A",
      "studentCountry": item.studentCountry,
      "studentSubject": "",
      "fatherName": item.fatherName,
      "motherName": item.motherName,
      "parentEmail": item.parentEmail,
      "parentPassword":  item.parentPassword,
      "parentContact":  item.parentContact,
      "parentIncome":item.parentIncome,
      "parentQualification":item.parentQualification,
      
      "religion": item.religion,
      "caste":item.caste,
      "nationality": item.nationality,
      "pincode": item.pincode,
      "state":  item.state,
      "city": item.city,
      "admissionNumber": item.admissionNumber,
      "studentAdmissionNumber": item.admissionNumber,
      "stu_id": item.admissionNumber,
      "class": `${item.class} - ${item.section}`,
     
      "roll_no": "",
      "student_name":item.studentFullName,
      "gender": item.studentGender,
      "DOB": item.studentDateOfBirth,
      "mother_name": item.motherName,
      "father_name": item.fatherName,
      "gaurdian_name":item.guardian_name,
      // "guardian_name": "N/A",
      "aadhar_no":item.aadhar_no,
      "aadhar_name": item.aadhar_name,
      "paddress": item.studentAddress,
      "mobile_no": item.studentContact,
      "email_id": item.studentEmail,
      "mothere_tougue": item.mothere_tougue,
      "category": item.category,
      "minority": item.minority? item.minority :"No",
      "is_bpl":false,
      "is_aay": item.is_aay?item.is_aay:0,
      "ews_aged_group": "18-30",
      "is_cwsn": 0,
      "cwsn_imp_type": "None",
      "ind_national":item.nationality?item.nationality: "INDIAN",
      "mainstramed_child": item.mainstramed_child?item.mainstramed_child:"No",
      "adm_no": item.admissionNumber,
      "adm_date": item.studentJoiningDate,
      "stu_stream": "Science",
      "pre_year_schl_status": item.pre_year_schl_status?item.pre_year_schl_status:"Passed",
      "pre_year_class": "9",
      "stu_ward": item.stu_ward?item.stu_ward:"N/A",
      "pre_class_exam_app": item.pre_class_exam_app?item.pre_class_exam_app:"N/A",
      "result_pre_exam": item.result_pre_exam?item.result_pre_exam:"Passed",
      "perc_pre_class": 4,
      "att_pre_class": item.att_pre_class?item.att_pre_class:"N/A",
      "fac_free_uniform": item.fac_free_uniform?item.fac_free_uniform:"Yes",
      "fac_free_textbook": "Yes",
      "received_central_scholarship":  true,
      "name_central_scholarship":item.name_central_scholarship?item.name_central_scholarship: "N/A",
      "received_other_scholarship":item.received_other_scholarship?item.received_other_scholarship: true,
      "scholarship_amount": Number(item.scholarship_amount)?Number(item.scholarship_amount):0,
      "fac_provided_cwsn": item.fac_provided_cwsn? item.fac_provided_cwsn:"N/A",
      "SLD_type":item.SLD_type?item.SLD_type: "N/A",
      "aut_spec_disorder":item.aut_spec_disorder?item.aut_spec_disorder: "N/A",
      "ADHD": item.ADHD?item.ADHD:"N/A",
      "inv_ext_curr_activity":item.inv_ext_curr_activity?item.inv_ext_curr_activity: "N/A",
      "vocational_course": item.vocational_course? item.vocational_course:"N/A",
      "trade_sector_id": item.trade_sector_id? item.trade_sector_id:"N/A",
      "job_role_id": item.job_role_id?item.job_role_id:"None",
      "pre_app_exam_vocationalsubject": item.pre_app_exam_vocationalsubject?item.pre_app_exam_vocationalsubject:"None",
      "bpl_card_no": item.bpl_card_no ?item.bpl_card_no:"N/A",
      "ann_card_no":   item.ann_card_no?item.ann_card_no:"N/A",
     
    }));

    // Create a worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Admissions");

    // Trigger download
    XLSX.writeFile(workbook, "Admission_List.xlsx");
    toast.success("Excel File Downloaded");
  };

  const columns = [
    // { 
    //   field: "id", 
    //   headerName: "S. No.", 
    //   minWidth: 50, 
    //   flex: 1, 
    //   renderCell: (params) => (
    //     <span style={{ color: "#1a237e", fontSize: "10px" }}>
    //       {params.value}
    //     </span>
    //   ),
    // },
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
        <span style={{ fontSize: "10px", color: "#ff6d00", }}>
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
            fontSize: "10px",
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
        <span style={{ fontSize: "10px", color: "#1a237e" }}>
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
        <span style={{ fontSize: "10px", color: "#e65100" }}>
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
          <span style={{ fontSize: "10px", color: "#f50057" }}>
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
        <span style={{ fontSize: "10px", color: "#1a237e" }}>
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
              <VisibilityIcon style={{ color: currentColor,fontSize:"14px" }} />
            </IconButton>
          </Link>
          <IconButton onClick={() => handleDelete(params.row.email)}>
            <DeleteIcon style={{ color: "#ef4444",fontSize:"14px" }} />
          </IconButton>
        </div>
      ),
    },
  ];
  
  const dataWithIds = Array.isArray(data)
    ? data.map((item, index) => ({ id: index + 1, ...item })).reverse()
    : [];
  
  return (
    <div className="relative w-full">
      <div className="absolute right-0 -top-[32px] flex gap-2">
        {/* <Button
          variant="contained"
          style={{ backgroundColor: currentColor, color: "white" }}
          onClick={generatePDF}
        >
          Download PDF
        </Button> */}
        <Button
          variant="contained"
          style={{ backgroundColor: currentColor, color: "white",fontSize:"10px", padding:"5px" }}
          onClick={exportToExcel}
        >
          Export to Excel
        </Button>
      </div>
      <DataGrid
        className="max-h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white rounded-md overflow-auto w-full"
        rows={dataWithIds}
        columns={columns}
        ref={componentPDF}

     
        rowHeight={30} // Adjust row height for visual balance
        headerHeight={20} // Adjust header height
      
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: currentColor , // Background color for the headers
            // height: '30px',
          },
          '& .MuiDataGrid-columnHeaderTitle': {
            fontSize: '10px', // Font size for header text
            fontWeight: 'bold', // Font weight for header text
            color: 'white', // Text color for header
           
          },
          '& .MuiDataGrid-cell': {
            fontSize: '14px', // Font size for cell text
            color: '#4a4a4a', // Text color for cells
          },
        }}

      />
    </div>
  );
}

export default DynamicDataTable;







// import { DataGrid } from "@mui/x-data-grid";
// import { Link, useNavigate } from "react-router-dom";
// import IconButton from "@mui/material/IconButton";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";
// import { Button } from "@mui/material";
// import React, { useRef } from "react";
// import { useStateContext } from "../../contexts/ContextProvider";
// import { useReactToPrint } from "react-to-print";
// import { toast } from "react-toastify";


// function DynamicDataTable({ data, handleDelete }) {
//   const { currentColor } = useStateContext();
//   const componentPDF = useRef();
//   const generatePDF = useReactToPrint({
//     content: () => componentPDF.current,
//     documentTitle: "Admission List",
//     onAfterPrint: () => toast.success("Download Successfully"),
//   });

//   const columns = [
//     { 
//       field: "id", 
//       headerName: "S. No.", 
//       minWidth: 50, 
//       flex: 1, 
//       renderCell: (params) => (
//         <span style={{ color: "#1a237e", fontSize: "10px" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     {
//       field: "image.url",
//       headerName: "Photo",
//       minWidth: 80,
//       flex: 1,
//       renderCell: (params) => (
//         params.row.image && params.row.image.url ? (
//           <img
//             src={params.row.image?.url  }
//             alt="Student"
//             style={{
//               width: "40px",
//               height: "40px",
//               borderRadius: "50%",
//               objectFit: "cover",
//             }}
//           />
//         ) : (
//           <span><img className="h-10 w-10 rounded-full object-contain" src="https://upload.wikimedia.org/wikipedia/commons/thumb/a/ac/No_image_available.svg/300px-No_image_available.svg.png" alt="" /></span>
//         )
//       ),
//     },
//     {
//       field: "admissionNumber",
//       headerName: "Admission No.",
//       minWidth: 90,
//       flex: 1,
//       renderCell: (params) => (
//         <span style={{ fontSize: "10px", color: "#ff6d00", }}>
//           {params.value}
//         </span>
//       ),
//     },
//     {
//       field: "fullName",
//       headerName: "Student Name",
//       minWidth: 150,
//       flex: 1,
//       renderCell: (params) => (
//         <span style={{ color: "#01579b", fontSize: "10px" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     {
//       field: "fatherName",
//       headerName: "Father Name",
//       minWidth: 150,
//       flex: 1,
//       renderCell: (params) => (
//         <span style={{ color: "#01579b", fontSize: "10px" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     {
//       field: "gender",
//       headerName: "Gender",
//       minWidth: 80,
//       flex: 1,
//       renderCell: (params) => (
//         <span
//           style={{
//             color: params.value === "Female" ? "#e91e63" : "#135e83",
//             fontSize: "10px",
//           }}
//         >
//           {params.value}
//         </span>
//       ),
//     },
//     {
//       field: "email",
//       headerName: "Email",
//       minWidth: 180,
//       flex: 1,
//       renderCell: (params) => (
//         <span style={{ fontSize: "10px", color: "#1a237e" }}>
//           {params.value}
//         </span>
//       ),
//     },
//     {
//       field: "contact",
//       headerName: "Contact",
//       minWidth: 110,
//       flex: 1,
//       renderCell: (params) => (
//         <span style={{ fontSize: "10px", color: "#e65100" }}>
//           {params.value}
//         </span>
//       ),
//     },
   
//     {
//       field: "joiningDate",
//       // field: "createdAt",
//       headerName: "Admission Date",
//       minWidth: 130,
//       flex: 1,
    
//       renderCell: (params) => {
//         // console.log(params.value); 
//         const date = new Date(params.value);
//         const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
//         return (
//           <span style={{ fontSize: "10px", color: "#f50057" }}>
            
//             {formattedDate}
//           </span>
//         );
//       },
//     },
//     {
//       field: "class",
//       headerName: "Class",
//       minWidth: 100,
//       flex: 1,
//       renderCell: (params) => (
//         <span style={{ fontSize: "10px", color: "#1a237e" }}>
//           {`${params.row.class} - ${params.row.section}`}
//         </span>
//       ),
//     },
//     {
//       field: "actions",
//       headerName: "Actions",
//       minWidth: 150,
//       flex: 1,
//       renderCell: (params) => (
//         <div>
//           <Link to={`/admin/admission/view-admission/${params.row.admissionNumber}`}>
//             <IconButton>
//               <VisibilityIcon style={{ color: currentColor }} />
//             </IconButton>
//           </Link>
//           {/* <Link to={`/admin/admission/edit-admission/${params.row.email}`}>
//             <IconButton>
//               <EditIcon style={{ color: "#10b981" }} />
//             </IconButton>
//           </Link> */}
//           <IconButton onClick={() => handleDelete(params.row.email)}>
//             <DeleteIcon style={{ color: "#ef4444" }} />
//           </IconButton>
//         </div>
//       ),
//     },
//   ];
  
//   const dataWithIds = Array.isArray(data)
//     ? data.map((item, index) => ({ id: index + 1, ...item })).reverse()
//     : [];
  
//   return (
//     <div className="relative w-full">
//       <div className="absolute right-0 -top-[52px]">
//         <Button
//           variant="contained"
//           style={{ backgroundColor: currentColor, color: "white" }}
//           onClick={generatePDF}
//         >
//           Download PDF
//         </Button>
//       </div>
//       <DataGrid
//         className="max-h-screen dark:text-white dark:bg-secondary-dark-bg mx-auto bg-white rounded-md overflow-auto w-full"
//         rows={dataWithIds}
//         columns={columns}
//         ref={componentPDF}
//       />
//     </div>
//   );
// }

// export default DynamicDataTable;


