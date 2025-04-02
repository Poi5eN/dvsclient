import React, { useState } from 'react';

const GenerateReport = () => {
  const [selectedExams, setSelectedExams] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');
  const [reportData, setReportData] = useState([]);

  // Static data for exams and students
  const exams = [
    { id: '1', name: 'Mid-Term Exam' },
    { id: '2', name: 'Final Exam' },
  ];

  const students = [
    { id: '1', name: 'John Doe', rollNo: '101', class: '10', section: 'A' },
    { id: '2', name: 'Jane Smith', rollNo: '102', class: '10', section: 'A' },
    { id: '3', name: 'Bob Brown', rollNo: '103', class: '10', section: 'B' },
  ];

  const filterStudents = () => {
    let filtered = students;
    if (searchTerm) {
      filtered = filtered.filter(
        (student) =>
          student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.rollNo.includes(searchTerm)
      );
    }
    if (classFilter) {
      filtered = filtered.filter((student) => student.class === classFilter);
    }
    if (sectionFilter) {
      filtered = filtered.filter((student) => student.section === sectionFilter);
    }
    return filtered;
  };

  const handleExamSelection = (examId) => {
    setSelectedExams((prev) =>
      prev.includes(examId) ? prev.filter((id) => id !== examId) : [...prev, examId]
    );
  };

  const handleStudentSelection = (studentId) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  const handleSelectAllStudents = () => {
    const filteredStudents = filterStudents();
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map((student) => student.id));
    }
  };

  const handleGenerateReport = (e) => {
    e.preventDefault();

    const reports = selectedStudents.map((studentId) => {
      const student = students.find((s) => s.id === studentId);
      return {
        student,
        exams: selectedExams.map((examId) => exams.find((e) => e.id === examId)),
      };
    });

    setReportData(reports);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      <form onSubmit={handleGenerateReport} className="space-y-4 bg-white shadow p-4 rounded-md">
        <h2 className="text-2xl font-bold text-gray-700">Generate Report</h2>

        {/* Exam Selection */}
        <div>
          <h3 className="text-lg font-semibold text-gray-700">Select Exams</h3>
          <div className="mt-2 space-y-2">
            {exams.map((exam) => (
              <label key={exam.id} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  value={exam.id}
                  checked={selectedExams.includes(exam.id)}
                  onChange={() => handleExamSelection(exam.id)}
                  className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                />
                <span>{exam.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Search Students</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or roll number"
            className="mt-1 w-full border rounded-md p-2"
          />
        </div>
        <div className="flex space-x-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter by Class</label>
            <input
              type="text"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              placeholder="Enter class"
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Filter by Section</label>
            <input
              type="text"
              value={sectionFilter}
              onChange={(e) => setSectionFilter(e.target.value)}
              placeholder="Enter section"
              className="mt-1 w-full border rounded-md p-2"
            />
          </div>
        </div>

        {/* Student Selection */}
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={
                selectedStudents.length === filterStudents().length &&
                filterStudents().length > 0
              }
              onChange={handleSelectAllStudents}
              className="h-4 w-4 text-blue-500 border-gray-300 rounded"
            />
            <span>Select All Students</span>
          </label>
          <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-2">
            {filterStudents().map((student) => (
              <label key={student.id} className="flex items-center space-x-2 mb-1">
                <input
                  type="checkbox"
                  value={student.id}
                  checked={selectedStudents.includes(student.id)}
                  onChange={() => handleStudentSelection(student.id)}
                  className="h-4 w-4 text-blue-500 border-gray-300 rounded"
                />
                <span>
                  {student.name} - Roll No: {student.rollNo} - Class: {student.class}{' '}
                  {student.section}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Generate Report
        </button>
      </form>

      {/* Report Cards */}
      {reportData.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-700">Generated Reports</h3>
          {reportData.map((data, index) => (
            <div
              key={index}
              className="bg-white shadow rounded-md p-4 border border-gray-200"
            >
              <h4 className="text-lg font-bold text-gray-800">
                {data.student.name} (Roll No: {data.student.rollNo})
              </h4>
              <ul className="mt-2 space-y-1">
                {data.exams.map((exam) => (
                  <li key={exam.id} className="text-gray-700">
                    Exam: {exam.name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GenerateReport;


