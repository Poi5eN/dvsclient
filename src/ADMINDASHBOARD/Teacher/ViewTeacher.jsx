

// ViewProfile.js
import React, { useEffect, useState, useRef } from "react";
import { Link, useParams } from "react-router-dom";
import { useStateContext } from "../../contexts/ContextProvider";
import axios from "axios";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from '@mui/icons-material/Download';
import "../../Dynamic/Form/FormStyle.css";

import { Button } from "@mui/material";
import { useReactToPrint } from "react-to-print";


const ViewTeacher = () => {
  const authToken = localStorage.getItem("token");
  const componentPDF = useRef();
  const { currentColor } = useStateContext();
  const { email } = useParams();
  const [teacherData, setTeacherData] = useState({});

  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/getTeachers?email=${email}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          }, 
        }
      )
      .then((response) => {
        const data = response.data.data[0];
        console.log(data);
        setTeacherData(data);
      })
      .catch((error) => {
        console.error("Error fetching teacher data:", error);
      });
  }, [email]);

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: `${teacherData.fullName}'s Id Card`,
    onAfterPrint: () => alert("Downloaded"),
  });

  return (
    <>
    <div className="flex justify-between w-[90%] mx-auto">
     <Link  to="/admin/allteachers">
        <Button
          variant="contained"
          startIcon={<ArrowBackIcon />}
          style={{ backgroundColor: currentColor, color: "white" }}
        >
          Back
        </Button>
      </Link>
      <Button
          variant="contained"
          onClick={generatePDF}
          startIcon={<DownloadIcon />}
          style={{ backgroundColor: currentColor, color: "white" }}
        >
          download
        </Button>
     </div>
    
      <div className=" flex items-center justify-center pt-10 ">
        <div
          ref={componentPDF}
          className="bg-white  gap-2 sm:p-4 md:p-4 lg:p-4 p-2 pt-16 grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 shadow-[rgba(0,0,_0,_0.25)_0px_25px_50px-12px]   overflow-y-auto"
        >
          <div className=" bg-[#01a9ac]  p-5   hover:shadow-[rgba(6,24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset] rounded-md">
            
            <div className=" flex justify-center mt-4">
              {teacherData.image && teacherData.image?.url ? (
                <img
                  className="w-[150px] h-[150px] rounded-full border-yellow-400 border-2"
                  src={teacherData.image.url}
                  alt="Image"
                />
              ) : (
                <p>No image available</p>
              )}
            </div>
            <div className="p-8">
              <h2 className="text-center text-lg text-white font-bold  ">
                {" "}
                {teacherData.fullName}
              </h2>
              <h2 className="text-center text-lg text-white font-bold">
                {" Status: "}
                {teacherData.status}
              </h2>
              <h2 className="text-center text-white font-bold">
                {"  "}
                +91{teacherData.contact}
              </h2>
              <hr />
              <div className="h-14 ">
                <p className=" p-2 font-bold">{`Address : ${teacherData.address}`}</p>
              </div>
            
            </div>
          </div>
          <div className="w-[330px] border-1 rounded-md border-[#01a9ac] p-5   hover:shadow-[rgba(6,24,_44,_0.4)_0px_0px_0px_2px,_rgba(6,_24,_44,_0.65)_0px_4px_6px-1px,_rgba(255,_255,_255,_0.08)_0px_1px_0px_inset]">
            <h1 className="text-center mb-3 font-extrabold">
              {" "}
              {teacherData.fullName}'s Details
            </h1>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Employee ID:</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {teacherData.employeeId}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Email :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {teacherData.email}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Gender :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {teacherData.gender}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Qualification :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {teacherData.qualification}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] "> Salary :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {teacherData.salary} / month
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Subject :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {teacherData.subject}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Class :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {teacherData.classTeacher}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Section :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {teacherData.section}
              </span>
            </div>
            <div className="flex gap-2 border-b-1  border-green-300 p-1">
              <h2 className="w-[100px]  text-[14px] ">DOB :</h2>
              <span className="w-[200px] font-semibold text-[#01a9ac]  text-[12px]">
                {new Date(teacherData.dateOfBirth).toLocaleDateString("en-US")}
              </span>
            </div>

            <div className="flex gap-2 border-b-1  border-green-300 p-1">
              <h2 className="w-[100px]  text-[14px] ">Joining Date :</h2>
              <span className="w-[200px] font-semibold text-[#01a9ac]  text-[12px]">
                {new Date(teacherData.joiningDate).toLocaleDateString("en-US")}
              </span>
            </div>

            <div className="flex gap-2 border-b-1  border-green-300 p-1 ">
              <h2 className="w-[100px]  text-[14px] ">Experience :</h2>
              <span className="w-[200px]font-semibold text-[#01a9ac]  text-[12px]">
                {" "}
                {teacherData.experience} yrs
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ViewTeacher;
