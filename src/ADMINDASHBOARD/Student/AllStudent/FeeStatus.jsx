import axios from "axios";
import React, { useEffect, useState } from "react";

const FeeStatus = ({ admissionNumber }) => {
  const authToken = localStorage.getItem("token");
  console.log("firstadmissionNumber", admissionNumber);
  const [studentFee, setStudentFee] = useState([]);
  useEffect(() => {
    const fee = async () => {
      try {
        const response = await axios.get(
          `https://eserver-i5sm.onrender.com/api/v1/fees/getFeeHistoryAndDues/${admissionNumber}`,

          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        );

        console.log("response.data", response.data.data.feeStatus.feeHistory);
        setStudentFee(response.data.data.feeStatus);
        // setStudentData(response.data.student || {});
        // setParentDetails(response.data.parent)
      } catch (error) {
        console.log("error", error);
      }
    };

    fee();
  }, []);
  console.log("firststudentFee",studentFee)
  return (
    <div className=" py-4 ">
      
      <div className="inline-block min-w-full shadow-md ">
       {
        studentFee.feeHistory?.length > 0 ? (

            <table class="min-w-full table-auto border border-gray-300 rounded-lg shadow-lg overflow-hidden">
            <thead class="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
              <tr>
                <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Receipt Number
                </th>
                <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Payment Date
                </th>
  
                <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Mode
                </th>
                <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Status
                </th>
  
                <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Total Fee AMount
                </th>
                <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Paid Amount
                </th>
  
                <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Due Amount
                </th>
                <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                  Fee
                </th>
              </tr>
            </thead>
            <tbody class="bg-white">
              {studentFee.feeHistory
                ? studentFee.feeHistory.map((fee, index) => (
                    <tr
                      key={index}
                      class="hover:bg-gray-50 transition-all duration-200"
                    >
                      <td class="p-3 border border-gray-300 text-gray-700">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {fee.feeReceiptNumber}
                        </p>
                      </td>
                      <td class="p-3 border border-gray-300 text-gray-700">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {new Date(fee.date).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </td>
                      <td class="p-3 border border-gray-300 text-gray-700">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {fee.paymentMode}
                        </p>
                      </td>
                      <td class="p-3 border border-gray-300 text-gray-700">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {fee.status}
                        </p>
                      </td>
                      <td class="p-3 border border-gray-300 text-gray-700">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {fee.totalFeeAmount}
                        </p>
                      </td>
                      <td class="p-3 border border-gray-300 text-gray-700">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {fee.totalAmountPaid}
                        </p>
                      </td>
  
                      <td class="p-3 border border-gray-300 text-gray-700">
                        <p className="text-gray-900 whitespace-no-wrap">
                          {fee.totalDues}
                        </p>
                      </td>
  
                      <table class="min-w-full table-auto border border-gray-300 rounded-lg shadow-lg overflow-hidden">
                        <thead class="bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100">
                          <tr>
                            <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                              Name
                            </th>
                            <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                              Month
                            </th>
                            <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                              Amount
                            </th>
                            <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                              Dues
                            </th>
                            <th class="p-3 border border-gray-300 text-sm font-semibold text-gray-800 uppercase tracking-wider">
                              Status
                            </th>
                            <th class="p-3 border border-gray-300"></th>
                          </tr>
                        </thead>
  
                        <tbody class="bg-white">
                          {fee.regularFees?.map((Rfee) => (
                            <tr class="hover:bg-gray-50 transition-all duration-200">
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  Clas Fee
                                </p>
                              </td>
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {Rfee.month}
                                </p>
                              </td>
  
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {Rfee.paidAmount}
                                </p>
                              </td>
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {Rfee.dueAmount}
                                </p>
                              </td>
  
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {Rfee.status}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tbody>
                          {fee.additionalFees?.map((Rfee) => (
                            <tr>
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {Rfee.name}
                                </p>
                              </td>
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {Rfee.month}
                                </p>
                              </td>
  
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {Rfee.paidAmount}
                                </p>
                              </td>
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {Rfee.dueAmount}
                                </p>
                              </td>
  
                              <td class="p-3 border border-gray-300 text-gray-700">
                                <p className="text-gray-900 whitespace-no-wrap">
                                  {Rfee.status}
                                </p>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        ):(<div>
            "NO Fees Created"
        </div>)
       }
      </div>
    </div>
  );
};

export default FeeStatus;
