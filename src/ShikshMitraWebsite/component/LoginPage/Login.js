

// import React from 'react'
// import ReportCard from './ReportCard'
// import Report2 from './Report2'
// import AdmissionForm from './AdmissionForm'

// const Login = () => {
//   return (
//     <div className=' mt-20'>
//         <ReportCard/>
//         {/* <Report2/> */}
//         {/* <AdmissionForm/> */}
//     </div>
//   )
// }

// export default Login



import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../digitalvidya.png'
import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
import { FaUser } from "react-icons/fa";
import LoadingComp from '../../../Loading';
import { login } from '../../../Network/AdminApi';
import { MdKey } from "react-icons/md";
import { useStateContext } from '../../../contexts/ContextProvider';


const Login = () => {
    
const { loginUser } = useStateContext();
    const [showPassword, setShowPassword] = useState(false);
    const [formdata, setFormdata] = useState({
        Username: '',
        Password: '',
        Role: 'accountants',
        session: '2024-2025' 
    });
    // console.log("formdata",formdata)
    const [loading, setLoading] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [showSessionDropdown, setShowSessionDropdown] = useState(false);
    const Navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormdata(prev => {
            // let newSession = prev.session; // Keep the old session
            if (name === 'Role') {
                setShowSessionDropdown(value === 'admin');
                //  Don't reset session anymore! Let the user set it

            }
            return ({ ...prev, [name]: value, 
                // session: newSession
             });
        });
    };
    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setFormdata(prev => {
    //         let newSession = prev.session; // Keep the old session
    //         if (name === 'Role') {
    //             setShowSessionDropdown(value === 'admin');
    //             //  Don't reset session anymore! Let the user set it

    //         }
    //         return ({ ...prev, [name]: value, session: newSession });
    //     });
    // };

    const submitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            let payload = {
                email: formdata.Username,
                password: formdata.Password,
                role: formdata.Role,
                session: formdata.session || "",
            };
    
            const response = await login(payload);
           console.log("response login",response)
            if (response?.success) {
                // ✅ Store token & role in localStorage
                localStorage.setItem("token", response.token);
                // localStorage.setItem("user", response.user);
                localStorage.setItem("user", JSON.stringify(response.user));
                localStorage.setItem("session", JSON.stringify(response.session));

                localStorage.setItem("userRole", response.user.role);
                // localStorage.setItem("schoolName", response.user.schoolName);
                // localStorage.setItem("session", response.session);
    
                // ✅ Use context API to update global state
                loginUser(response?.token, response?.user.role);  
    
                // ✅ Navigate to the correct dashboard
                Navigate(`/${response.user.role}`);
                // Navigate(`/${response.user.role}`);
            } else {
                toast.error(response?.message || "Login failed");
            }
        } catch (error) {
            console.error("Login Error:", error);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };
    
  const clickPassword = () => {
        setShowPassword((prev) => !prev);
    };
   
    if(loading){
      return  <LoadingComp/>
    }
    return (
        <>
            <div className="flex items-center justify-center min-h-screen bg-gray-100 ">
                <div className=" grid md:grid-cols-5 overflow-hidden  w-full mx-auto p-4 md:p-0">
                    <div
                     className="w-full md:col-span-3 h-[100vh] hidden md:block relative overflow-hidden sm-hidden"
                    
                     >
                        <div className="absolute top-0 left-0 w-1/2 h-8 bg-gradient-to-r from-[#3a9ede] to-[#f05c28] rounded-br-xl">
                        </div>
                        <div className="absolute bottom-0 right-0 w-1/2 h-8 bg-gradient-to-r from-[#f05c28] to-[#3a9ede]  rounded-tl-xl">
                        </div>
                        <div className="flex flex-col items-center justify-center h-full">
                            <div className="relative h-44   overflow-hidden mb-4">
                                <img
                                    src={logo}
                                    alt="TechInnovation Logo"
                                    className="object-cover"
                                />
                            </div>
                            <h1 className="text-3xl font-bold text-[#3a9ede] text-center leading-tight">
                                Vidyalaya  <span className="text-[#f05c28]">MANAGEMENT</span> SOFTWARE
                            </h1>
                        </div>
                    </div>
                    <div 
                    className="w-full md:col-span-2 md:p-8 mx-auto sm:bg-gray-100 bg-gray-100 md:bg-gray-50 flex flex-col items-center justify-center"
                    // className="w-full md:w-1/3 p-8 mx-auto sm:bg-gray-100 bg-gray-100 md:bg-gray-50 flex flex-col items-center justify-center"
                    >
                        <div className="flex justify-center ">
                            <div >
                                <img
                                    src={logo}
                                    alt="TechInnovation Logo"
                                    // className="object-cover"
                                     className="object-cover h-24 "
                                />
                            </div>
                        </div>

                        <h2 className="text-2xl font-semibold text-gray-800 text-center md:text-left">
                            Welcome to <span className="text-red-500">DigitalVidyaSaarthi                                                  </span>
                        </h2>
                        <p className="text-sm text-gray-600 mt-2 text-center md:text-left mb-6">
                            "Efficiency, Transparency, Growth. simple
                            "Innovate, Automate, Educate with ease" "A great Saarthi resolves all problems."
                        </p>

                        <div className="mt-4 w-full">
                            <h3 className="text-lg font-semibold text-gray-700 text-center md:text-left mb-2">
                                Vidyaalay  <span className="text-red-500">ERP</span> <span className="text-[#3a9ede]">ADMIN</span> LOGIN
                            </h3>
                            <div className="">
                                <div className="mb-4">
                                    <select
                                        className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                                        value={formdata.Role}
                                        onChange={handleChange}
                                        name="Role"
                                    >
                                        <option value="admin">Admin</option>
                                        <option value="teacher">Teacher</option>
                                        <option value="receptionist">Receptionist</option>
                                        <option value="accountants">Accountant</option>
                                        <option value="student">Student</option>
                                        <option value="parent">Parent</option>
                                        <option value="thirdparty">Thirdparty</option>
                                    </select>
                                </div>

                                {showSessionDropdown && (
                                    <div className="mb-4">
                                        <select
                                            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                                            value={formdata.session}
                                            onChange={handleChange}
                                            name="session"
                                        >
                                            {/* <option value="">Select Session</option> */}
                                            
                                            <option value="2024-2025">2024-2025</option>
                                            <option value="2025-2026">2025-2026</option>
                                        </select>
                                    </div>
                                )}

                                <div className="mb-4 relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                        <FaUser />
                                    </span>
                                    <input
                                        name="Username"
                                        value={formdata.Username}
                                        onChange={handleChange}
                                        disabled={isClosed}
                                        type="text"
                                        placeholder="Enter Your Userid"
                                        className="w-full px-10 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500 pl-10"
                                    />
                                </div>
                                <div className="mb-4 relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                                        <MdKey />
                                    </span>
                                    <input
                                        name="Password"
                                        value={formdata.Password}
                                        onChange={handleChange}
                                        disabled={isClosed}
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="Enter Your Password"
                                        className="w-full px-10 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500 pl-10"
                                    />
                                    <span
                                        onClick={clickPassword}
                                        className="text-2xl text-gray-600 absolute right-3 top-[10px] cursor-pointer"
                                    >
                                        {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
                                    </span>
                                </div>

                                <button
                                    type="submit"
                                    onClick={submitHandler}
                                    className="w-full py-2 rounded-md bg-gradient-to-r from-[#f0592e] to-[#f0592c] text-white font-semibold hover:from-[#3a9ede] hover:to-[#3a9ede] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                                >
                                    {loading ? 'Logging In...' : 'LOGIN'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Login;



// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import logo from '../../digitalvidya.png'
// import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
// import { FaUser } from "react-icons/fa";
// import LoadingComp from '../../../Loading';
// import { login } from '../../../Network/AdminApi';
// import { MdKey } from "react-icons/md";
// import { useStateContext } from '../../../contexts/ContextProvider';


// const Login = () => {
    
// const { loginUser } = useStateContext();
//     const [showPassword, setShowPassword] = useState(false);
//     const [formdata, setFormdata] = useState({
//         Username: '',
//         Password: '',
//         Role: 'accountants',
//         session: '2024-2025' 
//     });
//     // console.log("formdata",formdata)
//     const [loading, setLoading] = useState(false);
//     const [isClosed, setIsClosed] = useState(false);
//     const [showSessionDropdown, setShowSessionDropdown] = useState(false);
//     const Navigate = useNavigate();
//     const handleChange = (e) => {
//         const { name, value } = e.target;
//         setFormdata(prev => ({ ...prev, [name]: value }));
//         // Show/hide session dropdown based on role
//         if (name === 'Role') {
//             setShowSessionDropdown(value === 'admin');
//             // Reset session value when switching away from admin
//             if (value !== 'admin') {
//                 setFormdata(prev => ({ ...prev, session: '' }));
//             }
//         }
//     };
//     const submitHandler = async (e) => {
//         e.preventDefault();
//         setLoading(true);
    
//         try {
//             let payload = {
//                 email: formdata.Username,
//                 password: formdata.Password,
//                 role: formdata.Role,
//                 session: formdata.session || "",
//             };
    
//             const response = await login(payload);
//            console.log("response login",response)
//             if (response?.success) {
//                 // ✅ Store token & role in localStorage
//                 localStorage.setItem("token", response.token);
//                 // localStorage.setItem("user", response.user);
//                 localStorage.setItem("user", JSON.stringify(response.user));
//                 localStorage.setItem("session", JSON.stringify(response.session));

//                 localStorage.setItem("userRole", response.user.role);
//                 // localStorage.setItem("schoolName", response.user.schoolName);
//                 // localStorage.setItem("session", response.session);
    
//                 // ✅ Use context API to update global state
//                 loginUser(response?.token, response?.user.role);  
    
//                 // ✅ Navigate to the correct dashboard
//                 Navigate(`/${response.user.role}`);
//                 // Navigate(`/${response.user.role}`);
//             } else {
//                 toast.error(response?.message || "Login failed");
//             }
//         } catch (error) {
//             console.error("Login Error:", error);
//             toast.error("Something went wrong");
//         } finally {
//             setLoading(false);
//         }
//     };
    
//   const clickPassword = () => {
//         setShowPassword((prev) => !prev);
//     };
   
//     if(loading){
//       return  <LoadingComp/>
//     }
//     return (
//         <>
//             <div className="flex items-center justify-center min-h-screen bg-gray-100 ">
//                 <div className=" grid md:grid-cols-5 overflow-hidden  w-full mx-auto p-4 md:p-0">
//                     <div
//                      className="w-full md:col-span-3 h-[100vh] hidden md:block relative overflow-hidden sm-hidden"
                    
//                      >
//                         <div className="absolute top-0 left-0 w-1/2 h-8 bg-gradient-to-r from-[#3a9ede] to-[#f05c28] rounded-br-xl">
//                         </div>
//                         <div className="absolute bottom-0 right-0 w-1/2 h-8 bg-gradient-to-r from-[#f05c28] to-[#3a9ede]  rounded-tl-xl">
//                         </div>
//                         <div className="flex flex-col items-center justify-center h-full">
//                             <div className="relative h-44   overflow-hidden mb-4">
//                                 <img
//                                     src={logo}
//                                     alt="TechInnovation Logo"
//                                     className="object-cover"
//                                 />
//                             </div>
//                             <h1 className="text-3xl font-bold text-[#3a9ede] text-center leading-tight">
//                                 Vidyalaya  <span className="text-[#f05c28]">MANAGEMENT</span> SOFTWARE
//                             </h1>
//                         </div>
//                     </div>
//                     <div 
//                     className="w-full md:col-span-2 md:p-8 mx-auto sm:bg-gray-100 bg-gray-100 md:bg-gray-50 flex flex-col items-center justify-center"
//                     // className="w-full md:w-1/3 p-8 mx-auto sm:bg-gray-100 bg-gray-100 md:bg-gray-50 flex flex-col items-center justify-center"
//                     >
//                         <div className="flex justify-center ">
//                             <div >
//                                 <img
//                                     src={logo}
//                                     alt="TechInnovation Logo"
//                                     // className="object-cover"
//                                      className="object-cover h-24 "
//                                 />
//                             </div>
//                         </div>

//                         <h2 className="text-2xl font-semibold text-gray-800 text-center md:text-left">
//                             Welcome to <span className="text-red-500">DigitalVidyaSaarthi                                                  </span>
//                         </h2>
//                         <p className="text-sm text-gray-600 mt-2 text-center md:text-left mb-6">
//                             "Efficiency, Transparency, Growth. simple
//                             "Innovate, Automate, Educate with ease" "A great Saarthi resolves all problems."
//                         </p>

//                         <div className="mt-4 w-full">
//                             <h3 className="text-lg font-semibold text-gray-700 text-center md:text-left mb-2">
//                                 Vidyaalay  <span className="text-red-500">ERP</span> <span className="text-[#3a9ede]">ADMIN</span> LOGIN
//                             </h3>
//                             <div className="">
//                                 <div className="mb-4">
//                                     <select
//                                         className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
//                                         value={formdata.Role}
//                                         onChange={handleChange}
//                                         name="Role"
//                                     >
//                                         <option value="admin">Admin</option>
//                                         <option value="teacher">Teacher</option>
//                                         <option value="receptionist">Receptionist</option>
//                                         <option value="accountants">Accountant</option>
//                                         <option value="student">Student</option>
//                                         <option value="parent">Parent</option>
//                                         <option value="thirdparty">Thirdparty</option>
//                                     </select>
//                                 </div>

//                                 {showSessionDropdown && (
//                                     <div className="mb-4">
//                                         <select
//                                             className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
//                                             value={formdata.session}
//                                             onChange={handleChange}
//                                             name="session"
//                                         >
//                                             {/* <option value="">Select Session</option> */}
                                            
//                                             <option value="2024-2025">2024-2025</option>
//                                             <option value="2025-2026">2025-2026</option>
//                                         </select>
//                                     </div>
//                                 )}

//                                 <div className="mb-4 relative">
//                                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
//                                         <FaUser />
//                                     </span>
//                                     <input
//                                         name="Username"
//                                         value={formdata.Username}
//                                         onChange={handleChange}
//                                         disabled={isClosed}
//                                         type="text"
//                                         placeholder="Enter Your Userid"
//                                         className="w-full px-10 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500 pl-10"
//                                     />
//                                 </div>
//                                 <div className="mb-4 relative">
//                                     <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
//                                         <MdKey />
//                                     </span>
//                                     <input
//                                         name="Password"
//                                         value={formdata.Password}
//                                         onChange={handleChange}
//                                         disabled={isClosed}
//                                         type={showPassword ? 'text' : 'password'}
//                                         placeholder="Enter Your Password"
//                                         className="w-full px-10 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500 pl-10"
//                                     />
//                                     <span
//                                         onClick={clickPassword}
//                                         className="text-2xl text-gray-600 absolute right-3 top-[10px] cursor-pointer"
//                                     >
//                                         {showPassword ? <IoIosEyeOff /> : <IoIosEye />}
//                                     </span>
//                                 </div>

//                                 <button
//                                     type="submit"
//                                     onClick={submitHandler}
//                                     className="w-full py-2 rounded-md bg-gradient-to-r from-[#f0592e] to-[#f0592c] text-white font-semibold hover:from-[#3a9ede] hover:to-[#3a9ede] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
//                                 >
//                                     {loading ? 'Logging In...' : 'LOGIN'}
//                                 </button>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </>
//     );
// };

// export default Login;

