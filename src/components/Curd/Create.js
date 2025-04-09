// import axios from 'axios'
// import React, { useState } from 'react'
// import { useNavigate } from 'react-router-dom'

// const Create = () => {
//     const [inputData,setInputData]=useState({
//         name:"",
//         email:"",
//     })

//     const navigate=useNavigate()
//     const handleSubmit=(e)=>{
//       e.preventDefault(
//         axios.post("http://localhost:3030/users",inputData)
//         // axios.post("https://dvsserver.onrender.com/api/v1/adminRoute/createBook",inputData)
//         .then(res=>{
//             alert("data post seccessfully!")
//             navigate("/allstudent")
//         })
//       )
//     }
//   return (
//     <div>
//     <h2>Submit Form</h2>
//     <form onSubmit={handleSubmit} className='overlay'>
//       <div>
//         <label htmlFor="name">Name:</label>
//         <input
//           type="text"
//           id="name"
//         //   value={name}
//           onChange={e=>setInputData({...inputData,name:e.target.value})}
//           placeholder="Enter your name"
//         />
//       </div>
//       <div>
//         <label htmlFor="email">Email:</label>
//         <input
//           type="email"
//           id="email"

//         //   value={email}
//           onChange={e=>setInputData({...inputData,email:e.target.value})}
//           placeholder="Enter your email"
//         />
//       </div>
//       <button type="submit">Submit</button>
//     </form>
//   </div>

//   )
// }

// export default Create