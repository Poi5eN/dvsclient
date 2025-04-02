import React, { useRef } from "react";
import { Link} from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { useStateContext } from "../../contexts/ContextProvider.js";
import { Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from '@mui/icons-material/Download';
import ReportCard from "./ReportCard.jsx";
function AdmissionForm() {
  const { currentColor } = useStateContext();
 
  const schoolName = sessionStorage.getItem("schoolName");
  const SchoolImage = sessionStorage.getItem("image");
  const SchoolEmail = sessionStorage.getItem("email");
  const schoolAddress = sessionStorage.getItem("schooladdress");
  const schoolContact = sessionStorage.getItem("contact");
 
  const componentPDF = useRef();

 


  const generatePDF = useReactToPrint({
    content: () => componentPDF.current,
    documentTitle: "Admission",
    onAfterPrint: () => alert("Downloaded"),
  });
  return (
    <>
     <div className="flex justify-between w-[90%] mx-auto">
     <Link to="/admin/admission">
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
     
      <div
        ref={componentPDF}
        className="dark:text-white dark:bg-secondary-dark-bg inset-4 border-4 border-black w-10/12 mx-auto bg-cover bg-center bg-no-repeat p-5 mt-3"
      >
        <div class="flex  inset-0 rounded-md z-50">
          <div class="text-center mb-5">
            <img
              src={SchoolImage}
              alt="Citi Ford School Logo"
              class="w-36 h-36 mx-auto rounded-full"
            />
          </div>
          <div class="w-7/12">
            <h1 class="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-white">
              {schoolName}
            </h1>
            <div class="text- leading-5 ">
              <span class="block text-center mb-1 ">{schoolAddress}</span>

              <span class="block text-center mb-1">
                Email:- {SchoolEmail}
                <br />
                Contact :- {schoolContact}
              </span>
            </div>
          </div>
        </div>
        <center>
          <h3 class="text-red-700 font-bold underline">[ENGLISH MEDIUM]</h3>
        </center>
        <center>
          <span class="text-[12px ]">Session : 2024-25</span>
        </center>
        <div class=" m-5 rounded-md flex justify-between">
          <div class="flex flex-col justify-between">
            <span class="border border-black w-52 p-2 mb-4">
              Admission No:- 
            </span>
            <span class="border bg-green-800 text-white p-2">
              APPLICATION FORM RECEIPT
            </span>
          </div>
          <div class="border border-black w-36 h-36 flex items-center justify-center">
           
          
          </div>
        </div>
        <div className="dark:text-white">
          <div className="mb-3">
            <tr class="">
              <th
                scope="row"
                class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
              >
                Name of Student :
              </th>
              <td class="px-6 border-b-2 border-dashed w-full">
              
              </td>
            </tr>
          </div>
          <div className="">
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Gender :
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                 
                </td>
              </tr>
            </div>
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Email :
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                  
                </td>
              </tr>
            </div>
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Date of Birth :
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                  
                </td>
              </tr>
            </div>
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Name of Father :
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                 
                </td>
              </tr>
            </div>
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Name of Mother :
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                
                </td>
              </tr>
            </div>
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Occupation Father :
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                  
                </td>
              </tr>
            </div>
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Address :
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                 
                </td>
              </tr>
            </div>
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Mobile No.
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                 
                </td>
              </tr>
            </div>
            <div className="mb-3 flex w-full">
              <tr class=" ">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Nationality :
                </th>
                <td class="px-6  border-b-2 border-dashed w-full">
                  
                </td>
              </tr>
              <tr class="ml-20">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Religion :
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
              
                </td>
              </tr>
            </div>
            <div className="mb-3">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-900 dark:text-white whitespace-nowrap"
                >
                  Class in which admission sought
                </th>
                <td class="px-6 border-b-2 border-dashed w-full">
                
                </td>
              </tr>
            </div>
            <div className=" flex justify-start mt-4 ">
              <tr class="">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
                >
                  Date : 
                </th>
              </tr>
            </div>
            <div className=" flex justify-end ">
              <tr class="mt-10">
                <th
                  scope="row"
                  class="px-6 font-semibold  text-gray-700 dark:text-white whitespace-nowrap"
                >
                  Principal
                </th>
              </tr>
            </div>
          </div>
        </div>
      </div>


      <ReportCard/>
    </>
  );
}

export default AdmissionForm;
