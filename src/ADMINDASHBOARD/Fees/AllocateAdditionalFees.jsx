import axios from "axios";
import React, { useEffect, useState, useCallback } from "react";
import { toast } from "react-toastify";
import { ActiveStudents, getAdditionalfees } from "../../Network/AdminApi";
import Button from "../../Dynamic/utils/Button";
import { ReactInput } from "../../Dynamic/ReactInput/ReactInput";
import { useStateContext } from "../../contexts/ContextProvider";
import DynamicMultiSelect from "../../Dynamic/DynamicMultiSelect/DynamicMultiSelect";

const AllocateAdditionalFees = () => {
  const { setIsLoader } = useStateContext();
  const authToken = localStorage.getItem("token");
  const session = JSON.parse(localStorage.getItem("session"));
  const [allStudents, setAllStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFeeStructure, setSelectedFeeStructure] = useState(null);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [feeStructures, setFeeStructures] = useState([]);
  const [triggerRefresh, setTriggerRefresh] = useState(false);

  const getAllStudents = useCallback(async () => {
    setIsLoader(true);
    try {
      const response = await ActiveStudents();
      setAllStudents(response?.students?.data || []);
    } catch (error) {
      toast.error("Failed to fetch student list.");
      setAllStudents([]);
    } finally {
      setIsLoader(false);
    }
  }, [setIsLoader]);

  const fetchAdditionalFeeStructures = useCallback(async () => {
    setIsLoader(true);
    try {
         const response = await getAdditionalfees()
    //   const response = await axios.get(
    //     `https://dvsserver.onrender.com/api/v1/fees/getAdditionalFeeStructures?session=${session}`,
    //     {
    //       headers: { Authorization: `Bearer ${authToken}` },
    //     }
    //   );
      if (response.success) {
        setFeeStructures(response?.data || []);
      } else {
        toast.error("Failed to fetch additional fee structures.");
      }
    } catch (error) {
      toast.error(`Error fetching fee structures: ${error.message}`);
    } finally {
      setIsLoader(false);
    }
  }, [authToken, session, setIsLoader]);

  useEffect(() => {
    getAllStudents();
    fetchAdditionalFeeStructures();
  }, [getAllStudents, fetchAdditionalFeeStructures, triggerRefresh]);

  const handleSearch = (event) => {
    const searchValue = event.target.value.toLowerCase().trim();
    setSearchTerm(searchValue);
    if (searchValue === "") {
      setFilteredStudents([]);
    } else {
      const filtered = allStudents.filter(
        (student) =>
          (student.studentName &&
            student.studentName.toLowerCase().includes(searchValue)) ||
          (student.admissionNumber &&
            student.admissionNumber.toLowerCase().includes(searchValue))
      );
      setFilteredStudents(filtered);
    }
  };

  const handleFeeStructureChange = (event) => {
    const feeStructureId = event.target.value;
    const selected = feeStructures.find(
      (fs) => fs.feeStructureId === feeStructureId
    );
    setSelectedFeeStructure(selected || null);
  };

  const handleStudentSelect = (selectedOptions) => {
    setSelectedStudents(
      selectedOptions.map((opt) => ({
        studentId: opt.code,
        studentName: opt.name,
      }))
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFeeStructure) {
      toast.warn("Please select a fee structure.");
      return;
    }
    if (selectedStudents.length === 0) {
      toast.warn("Please select at least one student.");
      return;
    }

    const payload = {
      feeStructureId: selectedFeeStructure.feeStructureId,
      studentIds: selectedStudents.map((s) => s.studentId),
    };

    setIsLoader(true);
    try {
      const response = await axios.post(
        "https://dvsserver.onrender.com/api/v1/fees/allotAdditionalFees",
        payload,
        {
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.data.success) {
        toast.success("Additional fees allotted successfully!");
        setSelectedFeeStructure(null);
        setSelectedStudents([]);
        setSearchTerm("");
        setFilteredStudents([]);
        setTriggerRefresh((prev) => !prev);
      } else {
        toast.error(response.data.message || "Failed to allot fees.");
      }
    } catch (error) {
      toast.error(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setIsLoader(false);
    }
  };

  const studentOptions = allStudents.map((student) => ({
    name: `${student.studentName} (Adm#: ${student.admissionNumber}, Class: ${student.class})`,
    code: student.studentId,
  }));

  return (
    <div className="px-4 py-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Allot Additional Fees to Students
      </h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Additional Fee Structure (*)
          </label>
          <select
            value={selectedFeeStructure?.feeStructureId || ""}
            onChange={handleFeeStructureChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select a fee structure</option>
            {feeStructures.map((fs) => (
              <option key={fs.feeStructureId} value={fs.feeStructureId}>
                {fs.name} (₹{fs.amount}, {fs.frequency})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Students
          </label>
          <ReactInput
            type="text"
            placeholder="Search by name or admission number"
            value={searchTerm}
            onChange={handleSearch}
            containerClassName="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Students (*)
          </label>
          <DynamicMultiSelect
            name="students"
            searchable={true}
            placeholderName="Select students"
            dynamicOptions={studentOptions}
            handleChange={(name, opts) => handleStudentSelect(opts)}
            value={selectedStudents.map((s) => ({
              name: s.studentName,
              code: s.studentId,
            }))}
            requiredClassName="required-fields"
          />
        </div>

        {selectedFeeStructure && (
          <div className="bg-blue-50 p-4 rounded-md">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              Selected Fee Details
            </h3>
            <p className="text-sm text-gray-700">
              <strong>Name:</strong> {selectedFeeStructure.name}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Amount:</strong> ₹{selectedFeeStructure.amount}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Frequency:</strong> {selectedFeeStructure.frequency}
            </p>
            <p className="text-sm text-gray-700">
              <strong>Selected Students:</strong>{" "}
              {selectedStudents.length > 0
                ? selectedStudents.map((s) => s.studentName).join(", ")
                : "None"}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            type="submit"
            name="Allot Fees"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          />
        </div>
      </form>

      {filteredStudents.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Search Results
          </h3>
          <div className="bg-white border rounded-md shadow-sm max-h-60 overflow-y-auto">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Student Name
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Admission No.
                  </th>
                  <th className="p-3 text-left text-sm font-semibold text-gray-700 border-b">
                    Class
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="border-b hover:bg-gray-50"
                    onClick={() =>
                      handleStudentSelect([
                        ...selectedStudents,
                        {
                          studentId: student.studentId,
                          studentName: `${student.studentName} (Adm#: ${student.admissionNumber}, Class: ${student.class})`,
                        },
                      ])
                    }
                  >
                    <td className="p-3 text-sm text-gray-800">
                      {student.studentName}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {student.admissionNumber}
                    </td>
                    <td className="p-3 text-sm text-gray-600">
                      {student.class}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllocateAdditionalFees;