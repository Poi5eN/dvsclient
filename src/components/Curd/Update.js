// import axios from 'axios'
// import React, { useEffect,useState} from 'react'

// import { useNavigate, useParams } from 'react-router-dom'

// const Update = () => {
 
//     const {id}=useParams()

//     const [inputData,setInputData]=useState({
//         name:"",
//         email:"",
//     })

//     const navigate=useNavigate()
 
//      useEffect(()=>{
//         axios.get("http://localhost:3030/users"+id)
//         .then(res => setInputData(res.data))
//         .catch(err=>console.log(err))
//      })

//     const handleSubmit=(e)=>{
//       e.preventDefault(
//         axios.post("http://localhost:3030/users"+id,inputData)
//         .then(res=>{
//             alert("data updated seccessfully!")
//             navigate("/allstudent")
//         })
//       )
//     }
//   return (
//     <div>
//     <h2>Submit Form</h2>
//     <form onSubmit={handleSubmit}>
//       <div>
//         <label htmlFor="name">Name:</label>
//         <input
//           type="text"
//           id="name"
//           value={inputData.name}
//           onChange={e=>setInputData({...inputData,name:e.target.value})}
//           placeholder="Enter your name"
//         />
//       </div>
//       <div>
//         <label htmlFor="email">Email:</label>
//         <input
//           type="email"
//           id="email"

//           value={inputData.email}
//           onChange={e=>setInputData({...inputData,email:e.target.value})}
//           placeholder="Enter your email"
//         />
//       </div>
//       <button type="submit">Update</button>
//     </form>
//   </div>
//   )
// }

// export default Update




import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const Update = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [inputData, setInputData] = useState({
    name: "",
    email: "",
  });

  useEffect(() => {
    axios.get(`http://localhost:3030/users/${id}`)
      .then((res) => setInputData(res.data))
      .catch((err) => console.log(err));
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    axios.put(`http://localhost:3030/users/${id}`, inputData) // Use axios.put for updating
      .then((res) => {
        alert("Data updated successfully!");
        navigate("/allstudent");
      })
      .catch((err) => console.log(err));
  };

  return (
    <div>
      <h2>Update Form</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={inputData.name}
            onChange={(e) => setInputData({ ...inputData, name: e.target.value })}
            placeholder="Enter your name"
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={inputData.email}
            onChange={(e) => setInputData({ ...inputData, email: e.target.value })}
            placeholder="Enter your email"
          />
        </div>
        <button type="submit">Update</button>
      </form>
    </div>
  );
}

export default Update;
