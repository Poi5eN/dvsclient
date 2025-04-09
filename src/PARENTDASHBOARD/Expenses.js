import axios from "axios";
import React, { useState, useEffect } from "react";
import { Bar } from "react-chartjs-2";


const Expenses = () => {
  const authToken = localStorage.getItem("token");
  const [expensesData, setExpensesData] = useState([]);
  const [additionalFeesData, setAdditionalFeesData] = useState([]);
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const [studentFees, setStudentFees] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(
        `https://dvsserver.onrender.com/api/v1/adminRoute/myKids`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const fees = response.data.data[0].class;
        setStudentFees(fees);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching Student data:", error);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getFees",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const filteredData = response.data.filter(
          (item) => item.className === studentFees
        );

        setExpensesData(filteredData);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, [shouldFetchData, studentFees, authToken]);

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
        setAdditionalFeesData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching additional fees data:", error);
      });
  }, [shouldFetchData, authToken]);

  const mergedData = [...expensesData, ...additionalFeesData];

  const data = {
    labels: mergedData.map((fee) => fee.name),
    datasets: [
      {
        label: "Amount (₹)",
        data: mergedData.map((fee) => fee.amount),
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(255, 159, 64, 0.2)",
          "rgba(255, 205, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          // Add more colors if needed
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(255, 159, 64, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
          // Add more colors if needed
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="flex flex-col items-center justify-center bg-white h-screen">
      <div className="text-3xl font-bold text-cyan-700 mb-8">
        Parent Expenses
      </div>
      <div className="bg-white rounded-lg overflow-hidden shadow-md w-full max-w-xl">
        {mergedData.map((fee, index) => (
          <div
            key={index}
            className={`flex items-center justify-between px-6 py-4 ${
              index % 2 === 0 ? "bg-gray-100" : "bg-gray-200"
            }`}
          >
            <span className="text-lg font-semibold text-gray-800">
              {fee.name}
            </span>
            <span className="text-lg font-semibold text-blue-500">
              ₹{fee.amount}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-8 w-full max-w-xl">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
};

export default Expenses;
