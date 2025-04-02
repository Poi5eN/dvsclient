import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { DataGrid } from "@mui/x-data-grid";
import { Link, useNavigate } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ModalForm from './ModalForm';

const Home = () => {
  const [data, setData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get("http://localhost:3030/users")
    .then((res) => setData(res.data))
    .catch((err) => console.log(err));
  }, []);

  // const fetchData = () => {
   
  // };


 // Handle opening the update modal when clicking the "Edit" button
  const handleEdit = (id) => {
    setSelectedItemId(id); // Store the selected item ID
    setIsUpdateModalOpen(true); // Open the update modal
  };


  const handleDelete = (id) => {
    const confirm = window.confirm("Do you want to delete this item?");
    if (confirm) {
      axios.delete(`http://localhost:3030/users/${id}`)
        .then(() => {
          // Remove the deleted item from the state
          setData((prevData) => prevData.filter((item) => item.id !== id));
          alert("Record Deleted");
          navigate('/allstudent');
        })
        .catch((err) => console.log(err));
    }
  };

  const columns = [
    { field: "id", headerName: "Serial No.", width: 150 },
    { field: "name", headerName: "Name", width: 150 },
    { field: "username", headerName: "Username", width: 150 },
    { field: "email", headerName: "Email", width: 150 },
    { field: "password", headerName: "Password", width: 150 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      renderCell: (params) => (
        <div>
          <Link to={`/view/${params.row.id}`}>
            <IconButton>
              <VisibilityIcon />
            </IconButton>
          </Link>
          <Link to={`/update/${params.row.id}`}>
            <IconButton>
              <EditIcon />
            </IconButton>
          </Link>
          <IconButton onClick={() => handleDelete(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </div>
      ),
    },
  ];


  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };


  return (
    <div className="h-[400px] w-[900px] mx-auto mt-3">
{/* modal */}
<div className="container mx-auto mt-8">
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none"
      >
        Open Modal
      </button>
      <ModalForm isOpen={isModalOpen} onRequestClose={closeModal} />
    </div>


      <h1>Table</h1>
      {/* <Link to='/create'>create</Link> */}
      <DataGrid
        rows={data}
        columns={columns}
        pageSize={5}
      />
    </div>
  );
}

export default Home;



// import axios from 'axios';
// import React, { useEffect, useState } from 'react';
// import { DataGrid } from "@mui/x-data-grid";
// import { Link, useNavigate } from "react-router-dom";
// import IconButton from "@mui/material/IconButton";
// import VisibilityIcon from "@mui/icons-material/Visibility";
// import EditIcon from "@mui/icons-material/Edit";
// import DeleteIcon from "@mui/icons-material/Delete";

// const Home = () => {
//   const [data, setData] = useState([]);
//   const navigate=useNavigate()

//   useEffect(() => {
//     axios.get("http://localhost:3030/users")
//       .then((res) => setData(res.data))
//       .catch((err) => console.log(err));
//   }, []);

//   const handleDelete = (id) => {
    
//     const confirm=window.confirm("Do you Link to Delete?");
//     if(confirm){
//         axios.delete(`http://localhost:3030/users/${id}`)
//         .then(res=>{
//             alert("Record Deleted")
//             navigate('/allstudent')
//         })
//     }
//   };

//   const columns = [
//     { field: "id", headerName: "Serial No.", width: 150 },
//     { field: "name", headerName: "Name", width: 150 },
//     { field: "username", headerName: "Username", width: 150 },
//     { field: "email", headerName: "Email", width: 150 },
//     { field: "password", headerName: "Password", width: 150 },
//     {
//       field: "actions",
//       headerName: "Actions",
//       width: 150,
//       renderCell: (params) => (
//         <div>
//           <Link to={`/view/${params.row.id}`}>
//             <IconButton>
//               <VisibilityIcon />
//             </IconButton>
//           </Link>
//           <Link to={`/update/${params.row.id}`}>
//             <IconButton>
//               <EditIcon />
//             </IconButton>
//           </Link>
//           <IconButton onClick={() => handleDelete(params.row.id)}>
//             <DeleteIcon />
//           </IconButton>
//         </div>
//       ),
//     },
//   ];

//   return (
//     <div className="h-[400px] w-[900px] mx-auto mt-3">
//       <h1>Table</h1>
//       <Link to='/create'>create</Link>
//       <DataGrid
//         rows={data}
//         columns={columns}
//         pageSize={5}
//       />
//     </div>
//   );
// }

// export default Home;
