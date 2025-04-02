import React, { useState } from "react";
import { motion } from "framer-motion";
import { FaHome,FaUser } from "react-icons/fa";
import UserDetails from "../UserDetails";
import { IoMdPersonAdd } from "react-icons/io";
import AllStudent from "../AllStudent";
import AdmissionForm from "../AdmissionForm";
import AdmissionDetails from "../AdmissionDetails";

const ThirdPartyMobile = () => {
    const [activeComponent, setActiveComponent] = useState(null);
    const buttonVariants = {
        hover: { scale: 1.1, boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.2)" },
        tap: { scale: 0.95 },
        initial: { scale: 1 },
    };

    const fixedMenuItems = [

        {
            icon: <FaHome className="text-2xl " />,
            title: "Home",
            name: "Home", // Added name property
        },
        {
            icon: <IoMdPersonAdd className="text-2xl " />,
            title: "Admission",
            name: "Admission" // Added name property
        },
        // {
        //     icon: <FaUserPlus className="text-2xl " />,
        //     title: "Admission",
        //     name: "Admission" // Added name property
        // },
        {
            icon: <FaUser  />,
            title: "About ",
            name: "About", // Added name property
        },
        // {
        //     icon: <FiUser />,
        //     title: "My Student ",
        //     name: "MyStudent", // Added name property
        // },
    ];

    const handleClick = (componentName) => {
        if (componentName === "Student") {
           
        } else {
            setActiveComponent(componentName);  // For other components
        }
    };

    const renderActiveComponent = () => {
        switch (activeComponent) {
            case "Admission":
                return <AdmissionForm />;
            case "About":
                return <UserDetails />;
            case "Home":
                return   <AllStudent/>;
            case "MyStudent":
                return   <AdmissionDetails/>;
               
            default:
                return<AllStudent/>;
        }
    };

    return (
        <div className="flex flex-col h-[89vh] ">

            <div className="flex-grow overflow-y-auto">
                {renderActiveComponent()}
            </div>

            <div className="bg-gray-800 p-1 fixed bottom-0 w-full"
                style={{ background: "#2fa7db" }}
                // style={{ background: currentColor }}
            >
                <div className="flex justify-around max-w-md mx-auto">
                    {fixedMenuItems.map((item, index) => (
                        <motion.button
                            key={index}
                            variants={buttonVariants}
                            whileTap="tap"
                            initial="initial"
                            className="text-white hover:text-white focus:outline-none flex justify-center items-center flex-col"
                            onClick={() => handleClick(item.name)}
                        >
                            <span className="text-2xl "> {item.icon}</span>
                            <span className="text-[10px] ">{item.title}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ThirdPartyMobile;

