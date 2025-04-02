import React, { useState, useEffect } from "react";
import axios from "axios";

import { useStateContext } from "../contexts/ContextProvider";


const StudentStudyMaterial = () => {
  const authToken = localStorage.getItem("token");
  const { currentColor } = useStateContext();
  const [fetchData, setFetchData] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    link: "",
    image: null,
  });

  const API_BASE_URL = "https://eserver-i5sm.onrender.com/api/v1/teacher";

  useEffect(() => {
    // Fetch materials from the server using a GET request
    axios
      .get(`${API_BASE_URL}/getStudyMaterial`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        const materialsData = response.data.study;
        setMaterials(materialsData);
      })
      .catch((error) => {
        console.error("Error fetching materials:", error);
      });
  }, [fetchData]);
  console.log(materials);

  return (
    <div className="mt-8 p-3">
      <h1
        className="text-4xl font-bold mb-4 uppercase text-center dark:text-white  hover-text "
        style={{ color: currentColor }}
      >
        Study Materials
      </h1>
      <table className="border-collapse w-full">
        <thead>
          <tr
            style={{ backgroundColor: currentColor }}
            className="bg-cyan-700  text-white"
          >
            <th className="border border-blue-500 px-4 py-2">Title</th>
            <th className="border border-blue-500 px-4 py-2">Type</th>
            <th className="border border-blue-500 px-4 py-2">File</th>
          </tr>
        </thead>
        <tbody className="  ">
          {materials.map((material, index) => (
            <tr
              key={index}
              className="bg-white text-center  dark:text-white dark:bg-secondary-dark-bg  "
            >
              <td className="border border-blue-500 px-4 py-2">
                {material.title}
              </td>
              <td className="border border-blue-500 px-4 py-2">
                {material.type}
              </td>
              <td className="border border-blue-500 px-4 py-2">
                {material.type === "PDF" || material.type === "Notes" ? (
                  <a
                    href={material.file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-lg"
                  >
                    View PDF
                  </a>
                ) : material.type === "Video" || material.type === "YouTube" ? (
                  <a
                    href={material.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline text-lg"
                  >
                    View Video
                  </a>
                ) : (
                  <p className="text-lg text-blue-500 hover:underline">
                    View Notes
                  </p>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default StudentStudyMaterial;
