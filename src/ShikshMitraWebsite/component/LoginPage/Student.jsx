
import React, { useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../../digitalvidya.png'
import { IoIosEye, IoIosEyeOff } from 'react-icons/io';
import { FaUser } from "react-icons/fa";
const Student = () => {
    const [showPassword, setShowPassword] = useState(false);
    console.log("showPassword", showPassword)
    const [formdata, setFormdata] = useState({
        Username: '',
        Password: '',
        Role: 'student',
    });
    const [loading, setLoading] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const [isLoggedIn, setisLoggedIn] = useState(false);

    const Navigate = useNavigate();

    const showSuccessToast = (message) => {
        toast.success(message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
        });
    };

    const showErrorToast = (message) => {
        toast.error(message, {
            position: toast.POSITION.TOP_CENTER,
            autoClose: 2000,
        });
    };

    const handleChange = (e) => {
        console.log(`Input Name: ${e.target.name}, Value: ${e.target.value}`); // Debugging line
        setFormdata({ ...formdata, [e.target.name]: e.target.value });
    };

    const submitHandler = async (e) => {
        e.preventDefault();
        setIsClosed(true);
        setLoading(true);

        try {
            const payload = {
                email: formdata.Username,
                password: formdata.Password,
                role: formdata.Role,
            };

            sessionStorage.setItem("userRole", formdata.Role);

            const response = await axios.post("https://eserver-i5sm.onrender.com/api/v1/login", payload);

            setisLoggedIn(formdata.Role);
            Cookies.set("token", response?.data?.token, { expires: 2 });
            const fullName = response.data.user.fullName;
            const image = response.data.user.image.url;
            const email = response.data.user.email;
            sessionStorage.setItem("fullName", fullName);
            sessionStorage.setItem("image", image);
            sessionStorage.setItem("email", email);
            sessionStorage.setItem("response", JSON.stringify(response.data.user));

            // document.cookie = `token=${token}; path=/; max-age=86400`;
            const token = response.data.token
            Cookies.set("token", token, { expires: 1, path: '/' });


            showSuccessToast("Login successful!!!");
            Navigate(`/${formdata.Role}`);

        } catch (error) {
            console.error("Login Error:", error);
            if (error.response) {
                console.error("Response data:", error.response.data);  // Log response data
                console.error("Response status:", error.response.status); // Log status code
                showErrorToast(`Login failed: ${error.response.data.message || "Invalid credentials"}`); // Show backend message if available
            } else if (error.request) {
                console.error("No response received:", error.request);
                showErrorToast("Login failed: No response from server.");
            } else {
                showErrorToast("Login failed: An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
            setIsClosed(false);
        }
    };
    const clickPassword = () => {
        setShowPassword((prev) => !prev);
    };

    return (
        <>
                         <div className="flex items-center justify-center min-h-screen bg-gray-100 ">
    <div className="  overflow-hidden  w-full mx-auto p-4 md:p-0 flex">


        <div className="w-full md:w-1/2  hidden md:block relative overflow-hidden sm-hidden">
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
                    Vidyaalay  <span className="text-[#f05c28]">MANAGEMENT</span> SOFTWARE
                </h1>
            </div>


        </div>
        <div className="w-full md:w-1/3 p-8 mx-auto sm:bg-gray-100 bg-gray-100 md:bg-gray-50 flex flex-col items-center justify-center">  {/* Added flex and centering classes */}
            <div className="flex justify-center mb-6">
                <div className="relative h-28  overflow-hidden">
                    <img
                        src={logo}
                        alt="TechInnovation Logo"
                        className="object-cover"
                    />
                </div>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 text-center md:text-left">
                Welcome to <span className="text-red-500">DigitalVidyaSaarthi                                                  </span>
            </h2>
            <p className="text-sm text-gray-600 mt-2 text-center md:text-left">
                "Efficiency, Transparency, Growth. simple
                "Innovate, Automate, Educate with ease" "A great Saarthi resolves all problems."
            </p>

            <div className="mt-4 w-full"> {/*  Added w-full to make the form take full width */}
                <h3 className="text-lg font-semibold text-gray-700 text-center md:text-left">
                    Vidyaalay  <span className="text-red-500">ERP</span> LOGIN
                </h3>


                <div className="">
                    <div className="mb-4">
                        <select
                            disabled
                            className="w-full px-4 py-2 border rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
                            value={formdata.Role}
                            onChange={handleChange}
                            name="Role"
                        >
                            {/* <option value="admin">Admin</option> */}
                            <option value="student">Student</option>
                            {/* <option value="student">Student</option> */}
                        </select>
                    </div>

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

                            <FaUser />
                        </span>
                        <input
                            name="Password"
                            value={formdata.Password}
                            onChange={handleChange}
                            disabled={isClosed}
                            // type="text"
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

export default Student;