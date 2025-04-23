import React, { useState } from "react";
import { ReactInput } from "../../../Dynamic/ReactInput/ReactInput";

const FeeSearch = ({ allStudents, setFilteredStudents }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermByAdmissionNo, setSearchTermByAdmissionNo] = useState("");

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredStudents([]);
    } else {
      const filtered = allStudents.filter(
        (student) =>
          student.studentName &&
          student.studentName.toLowerCase().includes(searchValue)
      );
      setFilteredStudents(filtered);
    }
    setSearchTermByAdmissionNo("");
  };

  const handleSearchByAdmissionNo = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTermByAdmissionNo(searchValue);
    if (searchValue === "") {
      setFilteredStudents([]);
    } else {
      const filtered = allStudents.filter(
        (student) =>
          student.admissionNumber &&
          student.admissionNumber.toLowerCase().includes(searchValue)
      );
      setFilteredStudents(filtered);
    }
    setSearchTerm("");
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      <ReactInput
        type="text"
        label="Search by Name"
        onChange={handleSearch}
        value={searchTerm}
        containerClassName="flex-1 min-w-[200px]"
        className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      />
      <ReactInput
        type="text"
        label="Search by Adm. No"
        onChange={handleSearchByAdmissionNo}
        value={searchTermByAdmissionNo}
        containerClassName="flex-1 min-w-[200px]"
        className="w-full rounded-md border-gray-300 focus:ring-blue-500 focus:border-blue-500"
      />
    </div>
  );
};

export default FeeSearch;