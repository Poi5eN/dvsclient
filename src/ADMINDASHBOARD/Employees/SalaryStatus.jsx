import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Select from "react-select";


const EmployeeSalaryStatus = () => {
  const authToken = localStorage.getItem("token");
  const { email } = useParams();
  const [employeeData, setEmployeeData] = useState({});
  const [dues, setDues] = useState([]);
  const [salaryData, setSalaryData] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMonths, setSelectedMonths] = useState([]);
  const [formData, setFormData] = useState({
    feeStatus: "Paid",
    amountSubmitted: "",
    feeDate: "",
  });

  useEffect(() => {
    axios
      .get(`https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllEmployees?email=${email}`, {
        withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      })
      .then((response) => {
        const data = response.data.allEmployee[0];
        const id = response.data.allEmployee[0]._id;
       
        setEmployeeId(id)
        setEmployeeData(data);
      })
      .catch((error) => {
        console.error("Error fetching Teacher salary data: ", error);
      });
  }, [email]);

  useEffect(() => {
    if (employeeId) {
      axios
        .get(`https://eserver-i5sm.onrender.com/api/v1/employee/getPaymentHistory?employeeId=${employeeId}`, {
          withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
        })
        .then((response) => {
          const data = response.data.data[0];
         
          setSalaryData(response.data.data[0].salaryHistory);
        })
        .catch((error) => {
          console.error("Error fetching Teacher salary data: ", error);
        });
    }
  }, [employeeId]);

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
    // Add your logic to calculate the total amount
    // For now, assuming the total amount is the teacher's salary
    return employeeData.salary;
  };

  const handleSubmit = () => {
    if (selectedMonths.length === 0) {
      alert("Please select at least one month for salary.");
      return;
    }

    const totalAmount = calculateTotalAmount();

    const newSalaryData = {
      employeeId: employeeData._id,
      salaryHistory: selectedMonths.map((month) => ({
        paidAmount: totalAmount,
        month: month,
        status: totalAmount === employeeData.salary ? "Paid" : "Unpaid",
        // Add other salary details if needed
      })),
    };

    const apiUrl = `https://eserver-i5sm.onrender.com/api/v1/employee/salaryPay`;
    axios
      .post(apiUrl, newSalaryData, {
        withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
      })
      .then((response) => {

        axios
          .get(`https://eserver-i5sm.onrender.com/api/v1/employee/getPaymentHistory?employeeId=${employeeId}`, {
            withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
          })
          .then((response) => {
            const data = response.data.data[0];
           
            setSalaryData(response.data.data[0].salaryHistory);
           
          })
          .catch((error) => {
            console.error("Error fetching updated Teacher salary data: ", error);
          });
      })
      .catch((error) => {
        console.error("Error Posting Data: ", error);
      });

    setIsModalOpen(false);
  };

  return (
    <div className="py-8 px-4 md:px-8">
      {/* ... (rest of the code remains the same) */}
      <div className=" ">
        <h2 className="text-[14px]">Name : {employeeData.fullName}</h2>
        <h2 className="text-[14px]">Email : {employeeData.email}</h2>
        <h2 className="text-[14px]">Salary : {employeeData.salary}</h2>
        {/* Add other teacher details if needed */}
      </div>
      <div className="flex justify-center">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          onClick={handleModalOpen}
        >
          Record Salary
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="modal p-4 bg-white rounded-lg shadow-lg md:w-2/3 lg:w-1/2">
            <div className="flex justify-between">
              <span className="text-2xl font-semibold mb-4 text-indigo-600">Salary Form</span>
            </div>
            <div className="mb-4">
              <label className="block text-gray-600">Months</label>
              <Select
                options={[
                  "January", "February", "March", "April", "May", "June",
                  "July", "August", "September", "October", "November", "December"
                ].map((month) => ({
                  value: month,
                  label: month,
                }))}
                value={selectedMonths.map((month) => ({ value: month, label: month }))}
                onChange={handleMonthsChange}
                isMulti
                placeholder="Select months"
              />
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
            </div>
          </div>
        </div>
      )}

      {salaryData && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Salary History</h2>
          <table className="w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border p-2">Month</th>
                <th className="border p-2">Amount</th>
                <th className="border p-2">Status</th>
                <th className="border p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {salaryData.map((entry) => (
                <tr key={entry.month} className="border">
                  {console.log("first",entry)}
                  <td className="border p-2">{entry.month}</td>
                  <td className="border p-2">{entry.paidAmount}</td>
                  <td className="border p-2">{entry.status}</td>
                  <td className="border p-2">{new Date(entry.date).toLocaleDateString('en-GB')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default EmployeeSalaryStatus;