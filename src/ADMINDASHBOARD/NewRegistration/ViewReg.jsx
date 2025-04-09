import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../contexts/ContextProvider.js";
import { toast } from "react-toastify";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
const ViewReg = () => {
  const authToken = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"))
  const { currentColor } = useStateContext();
  const componentPDF = useRef();
  const { registrationNumber } = useParams();

  const [studentData, setStudentData] = useState({});
  const date = new Date(studentData.createdAt);
  const formattedDate = `${
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`;

  const schoolName = sessionStorage.getItem("schoolName");
  const schoolimage = sessionStorage.getItem("image");
  const schoolAddress = sessionStorage.getItem("schooladdress");
  const schoolContact = sessionStorage.getItem("contact");
  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/getRegistration/${registrationNumber}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.data;
        setStudentData(data);
      })
      .catch((error) => {
        console.error("Error fetching Student data:", error);
      });
  }, []);

  // for printOut...................

  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: `${studentData.studentFullName}'s Reg.Receipt`,
    onAfterPrint: () => toast.success("Download Successfully"),
  });
  return (
    <div className="pb-10">
      <div className="flex justify-between w-[90%] mx-auto">
        <Link to="/admin/registration">
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

      <div ref={componentPDF} style={{ width: "100%" }}>
        <div className="max-w-2xl mx-auto p-4 border border-black bg-yellow-100 mt-3">
         <div className="relative">
         <div className="absolute top-0 left-0 flex justify-between h-[100px] w-[100px] object-cover">
            <img
              className="w-full h-full"
              src={schoolimage}
              alt="school logo"
            />
            
          </div>
         <div className="absolute top-0 right-0">
         <span >Reg.No. {studentData.registrationNumber}</span>
         </div>
         </div>
          
          <div className="text-center font-bold text-xl mb-4 w-[60%] mx-auto">
            {schoolName}
            <p className="text-sm text-gray-700 ">{schoolAddress}</p>
            <p className="text-sm text-gray-700 ">
              Mobile No. : {schoolContact}
            </p>
            <div className="text-center  text-sm mb-4"> Registration Receipt</div>
          </div>
          <div className="mb-4">
            <div className="flex justify-between border-b-1 border-black border-dashed">
              <span>Reg. Date : {studentData?.createdAt ||"N/A"} </span>
              <span>Session : 2024-25</span>
            </div>
          </div>
          <div className="flex flex-col">
            <span>Student's Name : {studentData.studentFullName}</span>
            <span>guardian's Name : {studentData.guardianName}</span>
            <span>Email: {studentData.studentEmail}</span>
            <span>Gender: {studentData.gender}</span>
            <span>Class : {studentData.registerClass}</span>
            <span>Mob : {studentData.mobileNumber}</span>
            <span>Address : {studentData.studentAddress}</span>
          </div>
          <div className="my-4">
            <div className="flex justify-end border-b-1 border-black border-dashed">
              {/* <span>Date of payment : {formattedDate} </span> */}
            </div>
          </div>
          <table className="w-full mb-4">
            <thead>
              <tr>
                <th className="border border-black p-2">Sr. No.</th>
                <th className="border border-black p-2">Particulars</th>
                <th className="border border-black p-2">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-black p-2 text-center">1</td>
                <td className="border border-black p-2 text-center">
                  Admission Fee
                </td>
                <td className="border border-black p-2 text-center">
                  {studentData.amount}
                </td>
              </tr>
            </tbody>
          </table>
          <div className="flex justify-end mb-4">
            <span>{studentData.amount}/-</span>
          </div>
          <div className="flex justify-between mb-4 my-10">
            <span>Signature of Centre Head</span>
            <span>Signature of Student</span>
          </div>
          <div className="text-center text-sm">
            All above mentioned Amount once paid are non refundable in any case
            whatsoever.
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewReg;
