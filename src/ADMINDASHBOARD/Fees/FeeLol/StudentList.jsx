import React from "react";

const StudentList = ({ students, onStudentClick, setFilteredStudents }) => {
  return (
    <div className="relative">
      <div className="absolute z-30 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto w-full">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 sticky top-0 z-20">
            <tr>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                Student Name
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                Admission No.
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                Class
              </th>
              <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b border-gray-300">
                Parent Name
              </th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr
                key={student._id}
                className="cursor-pointer hover:bg-gray-100 transition duration-150 ease-in-out border-b border-gray-300"
                onClick={() => {
                  onStudentClick(student.parentId);
                  setFilteredStudents([]);
                }}
              >
                <td className="p-3 font-semibold text-gray-800">
                  {student.studentName}
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {student.admissionNumber}
                </td>
                <td className="p-3 text-sm text-gray-600">{student.class}</td>
                <td className="p-3 text-sm text-gray-600">
                  {student.fatherName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;