import React, { useState, useEffect } from 'react';
import Modal from '../Dynamic/Modal';
import axios from 'axios';
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from 'js-cookie';
import Heading2 from '../Dynamic/Heading2';
import Button from '../Dynamic/utils/Button';
import Tables from '../Dynamic/Tables';
const authToken = Cookies.get('token');
const Curriculum = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const handleOpenModal = () => {
    setModalOpen(true);
  };
  const [loading, setLoading] = useState(false);
  const classdata = JSON.parse(sessionStorage.getItem("response"));
  const [formData, setFormData] = useState({
    academicYear: '2023-2024',
    className: '',
    course: '',
    image: null,
  });

  const [curriculumData, setCurriculumData] = useState([]);
  const [shouldFetchData, setShouldFetchData] = useState(false)
  const handlePDFUpload = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setLoading(true)
    const formDataToSend = new FormData();
    formDataToSend.append("academicYear", formData.academicYear);
    formDataToSend.append("className", classdata.classTeacher);
    formDataToSend.append("course", formData.course);
    formDataToSend.append("image", formData.image);

    axios
      .post("https://dvsserver.onrender.com/api/v1/adminRoute/createCurriculum", formDataToSend, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data"
        }
      })
      .then((response) => {
        setModalOpen(false);
        setFormData({ academicYear: '2023-2024', className: '', course: '', image: null });
        setShouldFetchData(!shouldFetchData);
        setLoading(false)
        toast.success(`Created Successufully!`)
      })
      .catch((error) => {

        setLoading(false);
        toast.error(`Error: ${error.response.data.error}`)
        console.error('Error creating curriculum:', error);
      });
  };

  useEffect(() => {
    axios.get("https://dvsserver.onrender.com/api/v1/adminRoute/getAllCurriculum", {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response) => {
        const { allCurriculum } = response.data;
        setCurriculumData(allCurriculum);
      })
      .catch((error) => {
        console.error('Error fetching class data:', error);
      });
  }, [shouldFetchData]);

  const handleDeleteCurriculum = (index) => {
    const curriculumId = curriculumData[index]._id;
    axios
      .delete("https://dvsserver.onrender.com/api/v1/adminRoute/deleteCurriculum/" + curriculumId, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then(() => {
        const updatedCurriculum = [...curriculumData];
        updatedCurriculum.splice(index, 1);
        setCurriculumData(updatedCurriculum);
        toast.success(`Deleted successufully!`)
      })
      .catch((error) => {
        console.error('Error deleting curriculumData:', error);
      });
  };
  const THEAD = [

    "  Academic Year",
    "Class",
    "Files",
    "Action",

  ];
  return (
    <div className='p-5'>
      <Heading2 title={"Curriculum"}>

      </Heading2>
      <Button name="Create" onClick={handleOpenModal} />
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create Curriculum"}>
        <form onSubmit={handleFormSubmit}>
          <div className="grid md:grid-cols-1 grid-cols-1 gap-2 p-5 bg-gray-50">
            <div className="mb-4">
              <label className="text-xl font-semibold mb-2">
                Academic Year:
              </label>
              <select
                className="text-gray-600 bg-gray-100 p-2 rounded-md w-full"
                value={formData.academicYear}
                onChange={(e) =>
                  setFormData({ ...formData, academicYear: e.target.value })
                }
              >
                <option value="2023-2024">2023-2024</option>
                <option value="2024-2025">2024-2025</option>
                <option value="2025-2026">2025-2026</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="text-xl font-semibold mb-2">Upload PDF:</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handlePDFUpload}
                className="text-gray-600 bg-gray-100 p-2 rounded-md w-full"
              />
            </div>
            <Button loading={loading} width="full" name="Submit" type="submit" />
          </div>
        </form>
      </Modal>
      <Tables
        thead={THEAD}
        tbody={curriculumData.map((val, index) => ({
          "Year": val?.academicYear,
          "Class": val?.className,
          "Files": val?.file && (<a
            href={val.file.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            View
          </a>
          ),

          "Actions": <IconButton
            onClick={() => handleDeleteCurriculum(index)}
            className=" border px-3 py-2 mt-2 w-full "
          >
            <DeleteIcon className="text-red-600" />
          </IconButton>
        }))}
      />

    </div>
  );

};

export default Curriculum;
