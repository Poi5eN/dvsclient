import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import Select from "react-select";
import { useStateContext } from "../../../contexts/ContextProvider";

import { Button } from "@mui/material";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const StudentFeeStatus = () => {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const { email } = useParams();
  const [studentData, setStudentData] = useState({});
  const [dues, setDues] = useState([]);
  const [AdditionalFees, setAdditionalFees] = useState([]);
  const studentId = studentData._id;
  const [getFee, setGetFee] = useState({});
  const [loading, setLoading] = useState(false);

  // Get Students
  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents?email=${email}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.allStudent[0];
        setStudentData(data);
      })
      .catch((error) => {
        console.error("error fetching Student data : ", error);
      });
  }, [email]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [examData, setExamData] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [selectedAdditionalFees, setSelectedAdditionalFees] = useState([]);

  const [formData, setFormData] = useState({
    studentId: "",
    feeAmount: "",
    FeeMonth: "",
    feeDate: "",
    feeStatus: "",
  });

  const handleMonthsChange = (selectedOptions) => {
  
    setSelectedMonths(selectedOptions.map((option) => option.value));
  };

  const handleAdditionalFeesChange = (selectedOptions) => {
    setSelectedAdditionalFees(selectedOptions);
  };

  const handleModalOpen = () => {
    axios
      .get(`https://dvsserver.onrender.com/api/v1/adminRoute/getFees`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const data = response.data;
        const feeTypeArray = data;
        const studentClass = studentData.class;
        if (Array.isArray(feeTypeArray)) {
          const studentFeeAmount = feeTypeArray
            .filter((feeType) => feeType.className === studentClass)
            .map((classData) => classData.amount);
          setGetFee(studentFeeAmount);
          setIsModalOpen(true);
        } else {
          console.error("Invalid or undefined feeTypeArray");
        }
      })
      .catch((error) => {
        console.error("Error fetching Fee data: ", error);
      });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, feeDate: e.target.value });
  };
  const handleSubmit = () => {
    if (selectedMonths.length === 0) {
      alert("Please select at least one month for regular fees.");
      return;
    }

    const totalAmount = getTotalFeesAmount();
    const dues = totalAmount - formData.amountSubmitted;
    const feeStatus = dues === 0 ? "Paid" : "Unpaid";

    const newExamData = {
      studentId: studentId,
      feeHistory: selectedMonths.map((month) => ({
        paidAmount: formData.amountSubmitted,
        month: month,
        status: feeStatus,
        date: formData.feeDate,
        studentId: studentId,
      })),
      dues: dues,
    };

    const apiUrl =
      "https://dvsserver.onrender.com/api/v1/fees/createFeeStatus";
    axios
      .post(apiUrl, newExamData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        axios
          .get(
            `https://dvsserver.onrender.com/api/v1/fees/getFeeStatus?studentId=${studentId}`,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          )
          .then((response) => {
            const data = response.data.data;
            console.log("firstresponse.data.data",response.data.data)
            if (Array.isArray(data) && data.length > 0) {
              const feeHistory = data[0].feeHistory;
              const Dues = data[0].dues;
              setDues(Dues);
              setExamData(feeHistory);
            } else {
              setExamData([]);
            }
          })
          .catch((error) => {
            console.error("Error fetching Fee Status data: ", error);
          });
      })
      .catch((error) => {
        console.error("Error Posting Data: ", error);
      });

    setIsModalOpen(false);
  };

  const handleAmountSubmittedChange = (e) => {
    setFormData({ ...formData, amountSubmitted: e.target.value });
  };

  // Fee Status
  useEffect(() => {
    if (studentId && Object.keys(studentData).length > 0) {
      axios
        .get(
          `https://dvsserver.onrender.com/api/v1/fees/getFeeStatus?studentId=${studentId}`,
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        )
        .then((response) => {
          const data = response.data.data;
          if (Array.isArray(data) && data.length > 0) {
            const feeHistory = data[0].feeHistory;
            const Dues = data[0].dues;
            setDues(Dues);
            setExamData(feeHistory);
          } else {
            setExamData([]);
          }
        })
        .catch((error) => {
          console.error("Error fetching Fee Status data: ", error);
        });
    }
  }, [studentId, studentData, !isModalOpen]);

  const getTotalFeesAmount = () => {
    const regularFeesAmount = getFee * selectedMonths.length;
    const additionalFeesAmount = Array.isArray(selectedAdditionalFees)
      ? selectedAdditionalFees.reduce(
          (total, fee) => total + parseFloat(fee.value),
          0
        )
      : 0;

    return regularFeesAmount + additionalFeesAmount;
  };

  // Get  Additional Fee

  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAdditionalFees",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const feesData = response.data.map((fee) => {
          const label =
            fee.name && fee.amount
              ? `${fee.name} (${fee.amount})`
              : "Unknown Fee";
          const value = fee.amount ? fee.amount.toString() : "0";

          return {
            label,
            value,
          };
        });

        setAdditionalFees(feesData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [isModalOpen]);
  const schoolName = sessionStorage.getItem("schoolName");
  const schoolContact = sessionStorage.getItem("schoolContact");
  const schoolAddress = sessionStorage.getItem("schooladdress");

  const schoolLogo = sessionStorage.getItem("image");
  return (
    <div>
      <Link
        to="/admin/allstudent"
        tyle={{ border: `2px solid ${currentColor} `, color: currentColor }}
      >
        <Button
          variant="contained"
          startIcon={<ArrowBackIosIcon />}
          style={{ backgroundColor: currentColor, color: "white" }}
        >
          Back
        </Button>
      </Link>
      <div className="flex justify-start ms-7 mt-5">
       
        <Button
          variant="contained"
          onClick={handleModalOpen}
         
          style={{ backgroundColor: currentColor, color: "white" }}
        >
          Create Fee
        </Button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal p-4 bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2">
            <div className="flex justify-between">
            
              <span className="text-2xl font-semibold mb-4 text-gray-600">
                Fee Amounts: {getFee}
              </span>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600">Regular Fee : {getFee}</label>

             
               <div className="mb-4">
                <label className="block text-gray-600">Dues : {getTotalFeesAmount() - formData.amountSubmitted}</label>
                
              </div>
            </div>
           
            <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="mb-4">
              <label className="block text-gray-600">Months</label>
              <Select
                options={[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month) => ({
                  value: month,
                  label: month,
                }))}
                value={selectedMonths.map((month) => ({
                  value: month,
                  label: month,
                }))}
                onChange={handleMonthsChange}
                isMulti
                placeholder="Select months"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-600">Additional Fees</label>
              <Select
                id="additional-fees"
                options={AdditionalFees}
                value={selectedAdditionalFees}
                onChange={handleAdditionalFeesChange}
                isMulti={true}
                placeholder="Select additional fees"
              />
            </div>
              <div className="mb-4">
                <label className="block text-gray-600">Fee Status</label>
                <select
                  className="w-full border rounded-lg p-2"
                  value={formData.feeStatus || "Unpaid"}
                  onChange={(e) =>
                    setFormData({ ...formData, feeStatus: e.target.value })
                  }
                >
                  <option value="Paid">Paid</option>
                  <option value="Unpaid">Unpaid</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-600">Amount Submitted</label>
                <input
                  type="number"
                  className="w-full border rounded-lg p-2"
                  value={formData.amountSubmitted}
                  onChange={handleAmountSubmittedChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-600">Fee Date</label>
                <input
                  type="date"
                  className="w-full border rounded-lg p-2"
                  value={formData.feeDate}
                  onChange={handleDateChange}
                />
              </div>
              <div className="mt-4">
                <label className="block text-gray-600">Total Fees Amount : {getTotalFeesAmount()}</label>
               
              </div>
             
            </div>
            {/* <div className="flex justify-end mt-4">
              <button
                className="bg-green-500 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded"
                onClick={handleSubmit}
              >
                Submit
              </button>
              <button
                className="bg-red-500 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded"
                onClick={handleModalClose}
              >
                Cancel
              </button>
            </div> */}
             <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
           gap:"10px"
          }}
        >
          <Button
          variant="contained"
            onClick={handleSubmit}
            // className="dark:text-white dark:bg-secondary-dark-bg text-gray-800  neu-btn border-2 "
            style={{ color:"white",backgroundColor:currentColor}}
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
          style={{ color:"white",backgroundColor:"#616161"}}
            onClick={handleModalClose}
       
          >
            Cancel
          </Button>
        </div>
          </div>
        </div>
      )}
      <div className=" w-full overflow-scroll ">
      
        <div className="w-full flex mx-auto px-3   gap-3">
          <div className="  pe-5 border-gray-800   rounded-sm p-2">
            <div className="flex justify-between border-b-2 border-red-600 mb-1 ">
              <div className=" h-24 w-24  rounded-full object-contain">
                <img
                  className="h-[100%] w-[100%]"
                  src={schoolLogo}
                  alt="logo"
                />
              </div>
              <div className="text-end  ">
                <h1 className="font-semibold">{schoolName}</h1>
                <p className="text-sm">Address: {schoolAddress} </p>
                <p className="text-sm">Contact: {schoolContact}</p>
              </div>
            </div>
            <div className="bg-black text-white text-center">
              <h1 className="text-sm">FEE RECEIPT</h1>
            </div>
            <h1 className="text-center text-lg ">Parent Copy</h1>
            <div className="flex justify-between text-[12px]">
              <div>
                <p>
                  <span className="font-bold"> Name : </span>
                  {studentData.fullName}
                </p>
                <p>
                  <span className="font-bold">F/Name : </span>
                  {studentData.fatherName}
                </p>
                <p>
                  <span className="font-bold">Email : </span>
                  {studentData.email}
                </p>
                <p>
                  <span className="font-bold">Class : </span>
                  {studentData.class}
                </p>
                <p>
                  <span className="font-bold">Phone : </span>
                  {studentData.contact}
                </p>
                <p>
                  <span className="font-bold">DOB : </span>
                  {new Date(studentData.dateOfBirth).toLocaleDateString(
                    "en-US"
                  )}
                </p>
                <p>
                  <span className="font-bold">Address : </span>
                  {studentData.address}
                </p>
              </div>
              <div>
                <p>
                  <span className="font-bold">Receipt No. :</span>{" "}
                  {studentData.feeReceiptNumber}
                </p>
                <p>
                  <span className="font-bold">Admission No. :</span>{" "}
                  {studentData.admissionNumber}
                </p>
                <p>
                  <span className="font-bold text-emerald-700">
                    Payment Mode : {studentData.paymentMode}
                  </span>
                </p>
                <p>
                  <span className="font-bold">Collected By :</span>{" "}
                  {new Date(studentData.date).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div>
              <div>
                <div className="-mx-4 sm:-mx-8  sm:px-8 py-4 overflow-x-auto">
                  <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                    <table className="min-w-full leading-normal">
                      <thead>
                        <tr className=" bg-red-400 p-1">
                          <th className="px-1  py-3 border-b-2 border-r-2 border-gray-200 bg-gray-100 text-left text-[10px] text-bold font-semibold text-gray-700 uppercase tracking-wider">
                            Months
                          </th>
                          <th className="px-1  py-3 border-b-2 border-r-2 border-gray-200 bg-gray-100 text-left text-[10px] text-bold font-semibold text-gray-700 uppercase tracking-wider">
                            Fee Type
                          </th>
                          <th className="px-1  py-3 border-b-2 border-r-2 border-gray-200 bg-gray-100 text-left text-[10px] text-bold font-semibold text-gray-700 uppercase tracking-wider">
                            Status
                          </th>

                          <th className="px-1  py-3 border-b-2  border-r-2  border-gray-200 bg-gray-100 text-left text-[10px] text-bold font-semibold text-gray-700 uppercase tracking-wider">
                            Amount
                          </th>
                          <th className="px-1  py-3 border-b-2 border-r-2 border-gray-200 bg-gray-100 text-left text-[10px] text-bold font-semibold text-gray-700 uppercase tracking-wider">
                            {/* Discount */}
                          </th>
                          <th className="px-1  py-3 border-b-2 border-r-2 border-gray-200 bg-gray-100 text-left text-[10px] text-bold font-semibold text-gray-700 uppercase tracking-wider">
                            Due Amount
                          </th>
                          <th className="px-1  py-3 border-b-2 border-r-2 border-gray-200 bg-gray-100 text-left text-[10px] text-bold font-semibold text-gray-700 uppercase tracking-wider">
                            Payment Date
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                      
                        {examData.map((data, index) => (
                          <tr key={index}>
                            <td className="px-1  py-1 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">
                                {data.month}
                              </p>
                            </td>
                            <td className="px-1  py-1 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">
                                {data.paymentMode}
                              </p>
                            </td>
                            <td className="px-1  py-1 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">
                                {data.status}
                              </p>
                            </td>
                            <td className="px-1  py-1 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">
                                {data.paidAmount}
                              </p>
                            </td>
                            <td className="px-1  py-1 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap"></p>
                            </td>
                            <td className="px-1  py-1 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">
                                {+getFee - data.paidAmount}
                              </p>
                            </td>
                            <td className="px-1  py-1 border-b border-gray-200 bg-white text-sm">
                              <p className="text-gray-900 whitespace-no-wrap">
                                {new Date(data.date).toLocaleDateString(
                                  "en-GB"
                                )}
                              </p>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div className="flex justify-between">
                <div>Signature</div>
                
              </div>
            </div>
          </div>
         
        </div>
      </div>
    </div>
  );
};

export default StudentFeeStatus;
