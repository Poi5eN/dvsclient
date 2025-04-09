import React, { useState, useEffect } from "react";
import axios from "axios";

const Api_GetAll =
  "https://dvsserver.onrender.com/api/v1/adminRoute/getAllClass";

const CreateCurriculum = () => {
  const authToken = localStorage.getItem("token");
  const [selectedGrade, setSelectedGrade] = useState("Select Class");
  const [selectedAcademicYear, setSelectedAcademicYear] = useState("2023-2024");
  const [data, setData] = useState([]);
  const [curriculumData, setCurriculumData] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleGradeChange = (e) => {
    setSelectedGrade(e.target.value);
  };

  const handleAcademicYearChange = (e) => {
    setSelectedAcademicYear(e.target.value);
  };

  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAllClass",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const { classList } = response.data;
        setData(classList);
      })
      .catch((error) => {
        console.error("Error fetching class data:", error);
      });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (selectedGrade) {
        setLoading(true);
        try {
          const response = await axios.get(
            "https://dvsserver.onrender.com/api/v1/adminRoute/getAllCurriculum",
            {
              withCredentials: true,
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
              params: {
                className: selectedGrade,
              },
            }
          );
          setCurriculumData(response.data.allCurriculum);
        } catch (error) {
          console.error("Error fetching curriculum data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        setCurriculumData([]);
      }
    };

    fetchData();
  }, [selectedGrade]);

  const filteredByClass = selectedGrade
    ? curriculumData.filter((item) => item.className === selectedGrade)
    : curriculumData;

  return (
    <div
      className="
      dark:text-gray-200 dark:bg-secondary-dark-bg min-h-screen p-8 flex flex-col items-center justify-center"
    >
      <div className=" bg-white  dark:text-gray-200 dark:bg-black rounded-lg shadow-lg p-6 w-full max-w-md text-center">
        <h1 className="text-2xl font-bold text-cyan-700 text-center mb-4 dark:text-white">
          School Curriculum
        </h1>

        <div className="w-full flex gap-2">
          <div className="mb-4">
            <label className="text-xl font-semibold mb-2">Class</label>
            <select
              value={selectedGrade}
              onChange={handleGradeChange}
              className="text-gray-600 bg-gray-100 p-2 rounded-md w-full"
            >
              <option value="Select Class">Select Class</option>

              {data
                .slice()
                .sort(
                  (a, b) =>
                    parseInt(a.className, 10) - parseInt(b.className, 10)
                )
                .map((item) => (
                  <option key={item.className} value={item.className}>
                    {item.className}
                  </option>
                ))}
            </select>
          </div>

          <div className="mb-4">
            <label className="text-xl font-semibold mb-2 ">
              Academic Year:
            </label>
            <select
              value={selectedAcademicYear}
              onChange={handleAcademicYearChange}
              className="text-gray-600 bg-gray-100 p-2 rounded-md w-full"
            >
              <option value="2023-2024">2023-2024</option>
              <option value="2024-2025">2024-2025</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-xl font-semibold mb-2 text-cyan-700">
            Curriculum
          </h2>
          {filteredByClass.length > 0 ? (
            filteredByClass.map((curriculum, index) => (
              <div key={index} className="mb-2 w-full h-[100px]">
                <h3 className="text-lg font-bold mb-1">
                  Class {curriculum.className} - {curriculum.academicYear}
                </h3>
                <a
                  href={curriculum.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg text-blue-400 font-semibold mt-2"
                >
                  View Curriculum
                </a>
              </div>
            ))
          ) : (
            <p>No curriculum found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateCurriculum;
