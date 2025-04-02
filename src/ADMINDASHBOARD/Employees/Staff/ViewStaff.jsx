// ViewProfile.js
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";

import { FcLeft } from "react-icons/fc";
import "../../../Dynamic/Form/FormStyle.css";


const ViewStaff = () => {
  const authToken = localStorage.getItem("token");
  const { email } = useParams();
  const [staffData, setStaffData] = useState({});

  useEffect(() => {
    axios
      .get(
        `https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllEmployees?email=${email}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
       
        const data = response.data.allEmployee[0];
       
        setStaffData(data);
      })
      .catch((error) => {
        console.error("Error fetching staff data:", error);
      });
  }, [email]);

  return (
    <>
      <div className=" w-full   flex items-center justify-center pt-10 ">
        <div className="bg-white rounded-md  gap-2 sm:p-4 md:p-4 lg:p-4 p-2 pt-16 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 shadow-[rgba(0,_0,_0,_0.25)_0px_25px_50px_-12px]   overflow-y-auto">
          <div className="w-[330px]  bg-[#01a9ac]  p-5   hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
            <div className=" flex justify-center mt-4">
              {staffData.image && staffData.image.url ? (
                <img
                  className="w-[150px] h-[150px] rounded-full"
                  src={staffData.image.url}
                  alt="Image"
                />
              ) : (
                <p>No image available</p>
              )}
            </div>
            <div className="p-8">
              <h2 className="text-center text-lg text-white font-bold  ">
                {" "}
                {staffData.fullName}
              </h2>
              <h2 className="text-center text-lg text-white font-bold">
                {" Status: "}
                {staffData.status}
              </h2>
              <h2 className="text-center text-white font-bold">
                {"  "}
                +91{staffData.contact}
              </h2>
              <hr />
              <div className="h-14 ">
                <p className=" p-2 font-bold">{`Address : ${staffData.address}`}</p>
              </div>
              {/* <div className="flex justify-center mt-3 ">
                <button className=" bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded inline-flex items-center">
                  <svg
                    className="fill-current w-4 h-4 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                  >
                    <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                  </svg>
                  <span className="">Download</span>
                </button>
              </div> */}
            </div>
          </div>
          <div className="w-[330px] border-1 rounded-md border-[#01a9ac] p-5   hover:shadow-[rgba(6,_24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px_-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
            <h1 className="text-center mb-3 font-extrabold">
              {" "}
              {staffData.fullName}'s Details
            </h1>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Employee ID:</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {staffData.employeeId}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Email :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {staffData.email}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Gender :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {staffData.gender}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Qualification :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {staffData.qualification}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] "> Salary :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {staffData.salary} / month
              </span>
            </div>

            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">DOB :</h2>
              <span className="w-[200px] font-semibold text-[#01a9ac]  text-[12px]">
                {new Date(staffData.dateOfBirth).toLocaleDateString("en-US")}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Joining Date :</h2>
              <span className="w-[200px] font-semibold text-[#01a9ac]  text-[12px]">
                {new Date(staffData.joiningDate).toLocaleDateString("en-US")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewStaff;
