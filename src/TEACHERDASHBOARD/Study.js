import React, { useState, useEffect } from "react";
import axios from "axios";

import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Heading2 from "../Dynamic/Heading2";
import Modal from "../Dynamic/Modal";
import Button from "../Dynamic/utils/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import Tables from "../Dynamic/Tables";

const Study = () => {
  const authToken = localStorage.getItem("token");
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const [loading, setLoading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [shouldFetchData, setShouldFetchData] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    type: "",
    link: "",
    image: null,
  });

  const API_BASE_URL = "https://dvsserver.onrender.com/api/v1/teacher";

  const closeModal = () => { };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    console.log(file);
    if (file) {
      setFormData({
        ...formData,
        image: file,
      });
    }
  };

  const addMaterial = () => {
    setLoading(true);
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key !== "image") {
        formDataToSend.append(key, String(value));
      }
    });
    formDataToSend.append("image", formData.image);

    axios
      .post(`${API_BASE_URL}/createStudyMaterial`, formDataToSend, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        toast.success("Added successfully!");
        const createdMaterial = response.data;
        setMaterials([...materials, createdMaterial]);
        setFormData({ title: "", type: "", link: "", image: null });
        closeModal();
        setModalOpen(false);
        setShouldFetchData(!shouldFetchData);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error adding material:", error.response.data.error);
        toast.error(`Error: ${error.response.data.error}`);
        setLoading(false);
      });
  };

  const deleteMaterial = (material, index) => {
    axios
      .delete(`${API_BASE_URL}/deleteStudyMaterial/${material._id}`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then(() => {
        const updatedMaterials = [...materials];
        updatedMaterials.splice(index, 1);
        setMaterials(updatedMaterials);
        toast.success("deleted successfully!");
      })
      .catch((error) => {
        console.error("Error deleting material:", error);
      });
  };

  useEffect(() => {
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
  }, [shouldFetchData]);

  const THEAD = [

    "Title",
    "Type",
    "Files",
    "Action",

  ];
  return (
    <div className="p-5">
      <Heading2 title={"Study Materials"}>
      </Heading2>
      <Button
        onClick={handleOpenModal}
        name="Create"
      />
      <Modal
        isOpen={modalOpen}
        setIsOpen={setModalOpen}
        title={"Add New Material"}
      >
        <div className="bg-gray-50 p-6  shadow-lg w-96">
          <input
            type="text"
            placeholder="Title"
            className="w-full border rounded p-2 mb-2"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <div className="mb-2">
            <label htmlFor="materialType">Material Type</label>
            <select
              id="materialType"
              className="w-full border rounded p-2"
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
            >
              <option>Select Type</option>
              <option value="video">Video</option>
              <option value="PDF">PDF</option>
              <option value="youtube">YouTube</option>
              <option value="Notes">Notes</option>
            </select>
          </div>
          {(formData.type === "PDF" || formData.type === "Notes") && (
            <input
              type="file"
              className="w-full border rounded p-2 mb-4"
              onChange={handleImageChange}
            />
          )}
          {(formData.type === "Video" || formData.type === "youtube") && (
            <input
              type="text"
              placeholder={`Link (e.g., YouTube URL)`}
              className="w-full border rounded p-2 mb-4"
              value={formData.link}
              onChange={(e) =>
                setFormData({ ...formData, link: e.target.value })
              }
            />
          )}
          <div className="flex justify-end">
            <Button
              onClick={addMaterial}
              loading={loading}
              width="full"
              name="submit"
            />

          </div>
        </div>
      </Modal>
      <Tables
        thead={THEAD}
        tbody={materials.map((val, index) => ({
          "Title": val?.title,
          "Type": val?.type,
          "Files": val.type === "PDF" || val.type === "Notes" ? (
            <a
              href={val.file.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-lg"
            >
              View PDF
            </a>
          ) : val.type === "video" ||
            val.type === "youtube" ? (
            <a
              href={val.link}
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
          ),

          "Actions":

            <DeleteIcon

              onClick={() => deleteMaterial(val)}
              className="text-red-600 cursor-pointer" />

        }))}
      />

    </div>
  );
};

export default Study;
