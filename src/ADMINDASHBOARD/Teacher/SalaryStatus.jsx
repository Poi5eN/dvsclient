import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import { useStateContext } from "../../contexts/ContextProvider";
import Select from "react-select";

import { Button } from "@mui/material";


const SalaryStatus = () => {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const { email } = useParams();
  const [teacherData, setTeacherData] = useState({});
  const [salaryData, setSalaryData] = useState([]);
  const [teacherId, setTeacherId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [formData, setFormData] = useState({
    feeStatus: "Paid",
    amountSubmitted: "",
    feeDate: "",
  });

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
        const id = response.data.data[0]._id;
        setTeacherId(id);
        setTeacherData(data);
      })
      .catch((error) => {
        console.error("Error fetching Teacher salary data: ", error);
      });
  }, [email]);

  const handleSearch = () => {
    const selectedYearElement = document.getElementById("yearDropdown");
    const selectedYear = selectedYearElement.value;
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/teacher/getPaymentHistory?teacherId=${teacherId}&year=${selectedYear}`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const data = response.data.data;
        console.log("data", data);
        const filteredData = data.map((item) => {
          if (item.year === selectedYear) {
            setSalaryData(item.salaryHistory);
          }
          return item;
        });
      })
      .catch((error) => {
        console.error("Error fetching Teacher salary data: ", error);
      });
  };

  const handleModalOpen = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleMonthsChange = (selectedOptions) => {
    setSelectedMonths(selectedOptions.map((option) => option.value));
  };

  const handleAmountSubmittedChange = (e) => {
    setFormData({ ...formData, amountSubmitted: e.target.value });
  };

  const handleDateChange = (e) => {
    setFormData({ ...formData, feeDate: e.target.value });
  };

  const calculateTotalAmount = () => {
    return teacherData.salary;
  };

  const handleSubmit = () => {
    if (selectedMonths.length === 0) {
      alert("Please select at least one month for salary.");
      return;
    }
    const totalAmount = calculateTotalAmount();
    const newSalaryData = {
      teacherId: teacherData._id,
      salaryHistory: selectedMonths.map((month) => ({
        paidAmount: teacherData.salary,
        // paidAmount: totalAmount,
        month: month,
        status: totalAmount === teacherData.salary ? "Paid" : "Unpaid",
      })),
    };

    const apiUrl = `https://dvsserver.onrender.com/api/v1/teacher/salaryPay`;
    axios
      .post(apiUrl, newSalaryData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        axios
          .get(
            `https://dvsserver.onrender.com/api/v1/teacher/getPaymentHistory?teacherId=${teacherId}`,
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          )
          .then((response) => {
            const data = response.data.data[0];
            console.log("Updated Salary", data);
            setSalaryData(response.data.data[0].salaryHistory);
          })
          .catch((error) => {
            console.error(
              "Error fetching updated Teacher salary data: ",
              error
            );
          });
      })
      .catch((error) => {
        console.error("Error Posting Data: ", error);
      });

    setIsModalOpen(false);
  };

  return (
    <>
      <Link
        to="/admin/payment"
        // className="dark:text-white dark:bg-secondary-dark-bg neu-btn"
        // style={{ color: currentColor, border: `2px solid ${currentColor}` }}
      >
        <Button
          variant="contained"
          style={{ backgroundColor: currentColor, marginRight: "20px" }}
        >
          Back
        </Button>
      </Link>

      <div className="py-8 px-4 md:px-8">
        <div className="dark:text-white ">
          <h2 className="text-[14px]">Name : {teacherData.fullName}</h2>
          <h2 className="text-[14px]">Email : {teacherData.email}</h2>
          <h2 className="text-[14px]">Salary : {teacherData.salary}</h2>
        </div>
        <div className="flex justify-center">
          <Button
            variant="contained"
            style={{ backgroundColor: currentColor, marginRight: "20px" }}
            onClick={handleModalOpen}
          >
            Salary Pay
          </Button>
        </div>

        {isModalOpen && (
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="modal p-4 bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2">
              <div className="flex justify-between">
                <span className="text-2xl font-semibold mb-4 dark:text-white ">
                  Salary Form
                </span>
              </div>
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
              {/* <div className="mb-4">
              <label className="block text-gray-600">Amount Submitted</label>
              <input
                type="number"
                className="w-full border rounded-lg p-2"
                value={formData.amountSubmitted}
                onChange={handleAmountSubmittedChange}
              />
            </div> */}
              {/* <div className="mb-4">
              <label className="block text-gray-600">Salary Date</label>
              <input
                type="date"
                className="w-full border rounded-lg p-2"
                value={formData.feeDate}
                onChange={handleDateChange}
              />
            </div> */}
              <div className="flex justify-end mt-4">
                <Button
                  variant="contained"
                  style={{ backgroundColor: currentColor, marginRight: "20px" }}
                  onClick={handleSubmit}
                >
                  Submit
                </Button>
                <Button
                  variant="contained"
                  style={{ backgroundColor: "gray" }}
                  onClick={handleModalClose}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {salaryData && (
          <div className="mt-8">
            <div className=" items-center ">
              <h2 className="text-xl font-semibold mb-4 dark:text-white ">
                Salary History
              </h2>
              <select id="yearDropdown" className="mr-2 mb-2 md:mb-0 ">
                {/* Populate the dropdown with 5 years starting from 2024 */}
                {[...Array(5).keys()].map((index) => (
                  <option key={index} value={2023 + index}>
                    {2023 + index}
                  </option>
                ))}
              </select>
              <Button
                variant="contained"
                style={{ backgroundColor: currentColor, marginRight: "20px" }}
                onClick={handleSearch}
              >
                Submit
              </Button>
            </div>

            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="border p-2">Month</th>
                  <th className="border p-2">Amount</th>
                  <th className="border p-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {salaryData.map((entry) => (
                  <tr key={entry.month} className="border">
                    <td className="border p-2">{entry.month}</td>
                    <td className="border p-2">{entry.paidAmount}</td>
                    <td className="border p-2">{entry.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
};

export default SalaryStatus;
