import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosCall } from "react-icons/io";
import { MdEmail } from "react-icons/md";


const Queries = () => {
  const [adminInfoData, setAdminInfoData] = useState([]);
  const authToken = localStorage.getItem("token");
  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAdminInfo",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.admin;
        console.log("AdminInfo---ResultData--->", response.data.admin);
        setAdminInfoData(data);
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  console.log("Queries---->", adminInfoData);

  return (
    <div className="mt-20">
      <h2 className=" mb-1 text-4xl mx-auto text-center font-bold text-cyan-700 uppercase ">
        {adminInfoData.schoolName}
      </h2>
      <div className="relative">
        {adminInfoData.image && (
          <img
            src="https://img.freepik.com/free-vector/large-school-building-scene_1308-32058.jpg?w=996&t=st=1701324472~exp=1701325072~hmac=87021bbda05997a9f1c521abef4a4fe169a8c8c177eab299012b02afc3bf5505"
            alt=""
            className="object-cover w-full h-[70vh] pt-0 opacity-30"
          />
        )}
        <div className="absolute inset-0 bg-black opacity-0"></div>

        <div className="absolute right-0 bottom-0 ">
          <div className=" text-black-600 ">
            {/* <h2 className=" mb-5 text-4xl mx-auto text-center font-bold ">{adminInfoData.schoolName}</h2> */}
            {/* <p className="text-lg">{adminInfoData.address}</p> */}
            <div className="flex flex-wrap lg:justify-between ">
              <div className="w-full  md:mx-auto sm:mx-auto">
                <div className="max-w-[570px] lg:mb-0">
                  <div className="flex items-start">
                    <div className="mt-1">
                      <IoIosCall className="text-cyan-600 text-2xl" />
                    </div>
                    <a href={`tel:+91${adminInfoData.contact}`}>
                      <div className="">
                        <h1 className="font-bold text-2xl text-cyan-700">
                          Phone Number
                        </h1>
                        <p className="text-xl font-bold">
                          (+91){adminInfoData.contact}
                        </p>
                      </div>
                    </a>
                  </div>
                  <div className="flex items-start">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        adminInfoData.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="mt-1">
                        <FaLocationDot className="text-cyan-600 text-2xl" />
                      </div>
                    </a>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        adminInfoData.address
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div className="">
                        <h1 className="font-bold text-2xl text-cyan-700">
                          {" "}
                          Our Location
                        </h1>
                        <p className="text-xl font-bold">
                          {adminInfoData.address}
                        </p>
                      </div>
                    </a>
                  </div>
                  <div className="flex items-start">
                    <a href={`mailto:${adminInfoData.email}`}>
                      <div className="mt-1">
                        <MdEmail className="text-cyan-600 text-2xl" />
                      </div>
                    </a>
                    <a href={`mailto:${adminInfoData.email}`}>
                      <div className="">
                        <h1 className="font-bold text-2xl text-cyan-700">
                          {" "}
                          Email Address
                        </h1>
                        <p className="text-xl font-bold">
                          {adminInfoData.email}
                        </p>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Queries;
