import React from "react";
import { useStateContext } from "../contexts/ContextProvider";

const AboutTeacher = () => {
    // const { currentColor, teacherRoleData } = useStateContext();
  const teacherRoleData = JSON.parse(localStorage.getItem("user"));
  const authToken = localStorage.getItem("token");

    function formattedDate(val) {
        const inputDate = new Date(val);
        const day = String(inputDate.getUTCDate()).padStart(2, "0");
        const month = String(inputDate.getUTCMonth() + 1).padStart(2, "0");
        const year = String(inputDate.getUTCFullYear()).slice(2);
        return `${day}/${month}/${year}`;
    }


  return (
      <div className="w-full flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden max-w-lg w-full">
              
              <div className="flex flex-col items-center bg-cyan-700 p-6 text-white rounded-t-lg">
                  <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white mb-4">
                      {teacherRoleData?.image && teacherRoleData?.image?.url ? (
                          <img
                              className="w-full h-full object-cover"
                              src={teacherRoleData?.image?.url}
                              alt="Teacher"
                          />
                      ) : (
                          <div className="flex items-center justify-center w-full h-full bg-gray-200 text-gray-600">
                              No Image
                          </div>
                      )}
                  </div>
                  <h2 className="text-xl font-bold mb-1">{teacherRoleData.fullName}</h2>
                  <p className="text-sm font-semibold">{`Status: ${teacherRoleData.status}`}</p>
                  <p className="text-sm mt-1">
                      <a href={`tel:+91${teacherRoleData.contact}`} className="hover:text-gray-200">+91 {teacherRoleData.contact}</a>
                      </p>

                  <p className="text-sm mt-2 text-center break-words">{`Address: ${teacherRoleData.address}`}</p>
                
              </div>

            {/* Detailed Info Section */}
          <div className="p-6">
              <h1 className="text-xl text-center font-bold mb-4 text-gray-800">
                {teacherRoleData.fullName}'s Details
              </h1>
              <div className="space-y-3">
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-semibold">Employee ID:</span>
                         <span className="text-gray-800">{teacherRoleData.employeeId}</span>
                    </div>

                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-semibold">Email:</span>
                         <a href={`mailto:${teacherRoleData.email}`} className="text-gray-800 hover:underline">{teacherRoleData.email}</a>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-semibold">Gender:</span>
                        <span className="text-gray-800">{teacherRoleData.gender}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-semibold">Qualification:</span>
                        <span className="text-gray-800">{teacherRoleData.qualification}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-semibold">Salary:</span>
                        <span className="text-gray-800">{teacherRoleData.salary} / month</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-semibold">Subject:</span>
                         <span className="text-gray-800">{teacherRoleData.subject}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-semibold">Class Teacher:</span>
                         <span className="text-gray-800">{teacherRoleData.classTeacher}-{teacherRoleData.section}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                       <span className="text-gray-600 font-semibold">DOB:</span>
                         <span className="text-gray-800">{formattedDate(teacherRoleData.dateOfBirth)}</span>
                    </div>
                    <div className="flex justify-between items-center border-b pb-2">
                        <span className="text-gray-600 font-semibold">Experience:</span>
                        <span className="text-gray-800">{teacherRoleData.experience} yrs</span>
                  </div>
              </div>
            </div>

        </div>
      </div>
  );
};

export default AboutTeacher;

