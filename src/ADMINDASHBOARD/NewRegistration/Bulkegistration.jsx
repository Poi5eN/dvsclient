import React, { useState } from "react";
import { useStateContext } from "../../contexts/ContextProvider.js";
import axios from "axios";

import { toast } from "react-toastify";
import { Button } from "@mui/material";
import AOS from "aos";
import * as XLSX from "xlsx";
import "aos/dist/aos.css";
import { createBulkRegistrations } from "../../Network/AdminApi.js";
AOS.init();

const Bulkegistration = ({ refreshRegistrations }) => {
  const authToken = localStorage.getItem("token");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const toggleModal = () => {
    setIsOpen(!isOpen);
  };
  const { currentColor } = useStateContext();
  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    setFile(uploadedFile);
  };

  const processFile = async () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        try {
          const response= await createBulkRegistrations({ registrations: worksheet })
          if(response){
console.log("first response",response)
          }
        } catch (error) {
          
        }
        // try {
          
        //     setLoading(true);
        //   await axios.post(
        //     "https://dvsserver.onrender.com/api/v1/adminRoute/createBulkRegistrations",
        //     { registrations: worksheet },
        //     {
        //       withCredentials: true,
        //       headers: {
        //         Authorization: `Bearer ${authToken}`,
        //       },
        //     }
        //   );
        //   toast.success("Bulk registration created successfully!");
        //   setLoading(false);
        //   refreshRegistrations();
        
        // } catch (error) {
        //   console.error("Error creating bulk registration:", error);
        //   toast.error("Failed to create bulk registration.");
        //   setLoading(false);
        // }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  return (
    <>
      <Button
        onClick={toggleModal}
        variant="contained"
        className="dark:text-white dark:bg-secondary-dark-bg"
        style={{ backgroundColor: currentColor }}
      >
        Bulk Registration
      </Button>
      {isOpen && (
        <div
          id="default-modal"
          tabIndex="-1"
          aria-hidden="true"
          className="fixed top-0 right-0 left-0 z-[99999999] flex justify-center items-center w-full h-screen bg-gray-900 bg-opacity-50"
          // data-aos="fade-down"
        >
          <div className="relative p-4 w-full max-w-2xl max-h-full"
            data-aos="fade-down"
          >
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700"
           
            >
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Registration Form
                </h3>
                <button
                  onClick={toggleModal}
                  type="button"
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-4 md:p-5 space-y-4">
              <div className="bg-white rounded  p-4 px-4 mb-6">
          <h2
            className="text-2xl font-bold mb-4 uppercase text-center  hover-text "
            style={{ color: currentColor }}
          >
            Upload Bulk Registration
          </h2>
          <div className="flex items-center gap-5 flex-wrap">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".xlsx, .xls"
              className="h-10 border w-full mt-1 rounded px-4  bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
            />
            <Button
              variant="contained"
              onClick={processFile}
              style={{ backgroundColor: currentColor, color: "white",width: "100%", }}
              className="ml-4"
            >
                {loading ? (
                                <svg
                                  aria-hidden="true"
                                  className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                  viewBox="0 0 100 101"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                  />
                                </svg>
                              ) : (
                                "Upload"
                              )}
            
            </Button>
           
          <Button
            variant="contained"
            onClick={toggleModal}
            style={{ backgroundColor: "#616161", color: "white",width:"100%" }}
          >
            Back
          </Button>
       
          </div>
        </div>
                {/* <form
                  onSubmit={handleSubmit}
                  className=" dark:text-white dark:bg-secondary-dark-bg "
                >
                  <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 lg:grid-cols-3 ">
                    <div className="lg:col-span-6">
                      <div className="grid gap-4 gap-y-2 text-sm grid-cols-1 md:grid-cols-6 ">
                        <div className="md:col-span-3 ">
                          <label htmlFor="studentFullName">Full Name</label>
                          <input
                            type="text"
                            name="studentFullName"
                            id="studentFullName"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.studentFullName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label htmlFor="fatherName">Guardian's Name</label>
                          <input
                            type="text"
                            name="guardianName"
                            id="guardianName"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.guardianName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="md:col-span-6">
                          <label htmlFor="studentEmail">Email Address</label>
                          <input
                            type="email"
                            name="studentEmail"
                            id="studentEmail"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.studentEmail}
                            onChange={handleChange}
                            placeholder="email@domain.com"
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label htmlFor="studentAddress">
                            Address / Street
                          </label>
                          <input
                            type="text"
                            name="studentAddress"
                            id="studentAddress"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.studentAddress}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="md:col-span-3">
                          <label htmlFor="mobileNumber">Mobile</label>
                          <input
                            type="number"
                            name="mobileNumber"
                            id="mobileNumber"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.mobileNumber}
                            onChange={handleChange}
                            maxLength="10"
                          />
                        </div>

                        <div className="md:col-span-3">
                          <label htmlFor="registerClass">Class</label>
                          <select
                            name="registerClass"
                            id="registerClass"
                            className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                            value={formData.registerClass}
                            onChange={handleChange}
                          >
                            {classes.map((className) => (
                              <option
                                key={className}
                                value={className}
                                className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                              >
                                {className}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="md:col-span-3">
                          <label htmlFor="gender">Gender</label>
                          <div className="flex items-center mt-1">
                            <label className="mr-4">
                              <input
                                type="radio"
                                name="gender"
                                value="Male"
                                checked={formData.gender === "Male"}
                                onChange={handleChange}
                                className="mr-2"
                              />
                              Male
                            </label>
                            <label className="mr-4">
                              <input
                                type="radio"
                                name="gender"
                                value="Female"
                                checked={formData.gender === "Female"}
                                onChange={handleChange}
                                className="mr-2"
                              />
                              Female
                            </label>
                            <label>
                              <input
                                type="radio"
                                name="gender"
                                value="Other"
                                checked={formData.gender === "Other"}
                                onChange={handleChange}
                                className="mr-2"
                              />
                              Other
                            </label>
                          </div>
                          <div className="md:col-span-3">
                            <label htmlFor="mobileNumber">Amount</label>
                            <input
                              type="amount"
                              name="amount"
                              id="amount"
                              className="h-10 border mt-1 rounded px-4 w-full bg-gray-50 dark:text-white dark:bg-secondary-dark-bg"
                              value={formData.amount}
                              onChange={handleChange}
                            />
                          </div>
                        </div>
                        <div className="md:col-span-6 text-right mt-3">
                          <div className="flex items-center gap-5 p-4 md:p-5 border-t border-gray-200 rounded-b dark:border-gray-600">
                            <Button
                              type="submit"
                              variant="contained"
                              style={{
                                backgroundColor: currentColor,
                                color: "white",
                                width: "100%",
                              }}
                            >
                              {loading ? (
                                <svg
                                  aria-hidden="true"
                                  className="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                                  viewBox="0 0 100 101"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                    fill="currentColor"
                                  />
                                  <path
                                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                    fill="currentFill"
                                  />
                                </svg>
                              ) : (
                                " Submit"
                              )}
                            </Button>
                            <Button
                              variant="contained"
                              onClick={toggleModal}
                              style={{
                                backgroundColor: "#616161",
                                color: "white",
                                width: "100%",
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </form> */}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Bulkegistration;