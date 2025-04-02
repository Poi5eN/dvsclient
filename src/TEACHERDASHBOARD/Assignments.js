import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useStateContext } from "../contexts/ContextProvider";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Heading2 from "../Dynamic/Heading2";
import Modal from "../Dynamic/Modal";
import Tables from "../Dynamic/Tables";
import Button from "../Dynamic/utils/Button";
// const authToken = Cookies.get("token");

const Assignments = () => {
  const authToken = localStorage.getItem("token");
const Api_Create =
  "https://dvsserver.onrender.com/api/v1/adminRoute/createAssignment";

  const [modalOpen, setModalOpen] = useState(false);

  const handleOpenModal = () => {
    setModalOpen(true);
  };
  
  const [classData, setClassData] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(false);
  // const { teacherRoleData } = useStateContext();
 
  const teacherDetails = JSON.parse(localStorage.getItem("user"));
  const [assignmentDeleted, setAssignmentDeleted] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    className: "",
    section: [],
    subject: [],
    image: null,
  });
  const [assignmentData, setAssignmentsData] = useState([]);
  const [shouldFetchData, setShouldFetchData] = useState(false);
  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAllClasses",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const { classList } = response.data;
      
        setClassData(classList);
      })
      .catch((error) => {
        console.error("Error fetching class data:", error);
      });
  }, [authToken]);

 

  const handleSubjectChange = (e) => {
    setSelectedSubject(e.target.value);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData({ ...formData, image: file });
  };


  const handleSubmit = (e) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("dueDate", new Date().toISOString().split("T")[0]);
    
    formDataToSend.append("image", formData.image);
   
    formDataToSend.append("className", teacherDetails.classTeacher);
   
    formDataToSend.append("section", teacherDetails.section);
    
    formDataToSend.append("subject", selectedSubject);
    setLoading(true);
    axios
      .post(Api_Create, formDataToSend, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          className: "",
          section: "",
          subject: "",
          image: null,
        });
        setModalOpen(false);
        setShouldFetchData(!shouldFetchData);
       
        setSelectedSubject("");
        setLoading(false);
        toast.success("Created successfully");
      })
      .catch((error) => {
        setLoading(false);
    
        if (error.response && error.response.data && error.response.data.message) {
            toast.error(`Error: ${error.response.data.message}`);
        } else {
            toast.error("Error: Something went wrong!");
        }
        console.error("Error creating assignment:", error);
    });

  };


  useEffect(() => {
    axios
      .get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAllAssignment",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        const { allAssignment } = response.data;
        setAssignmentsData(allAssignment);
      })
      .catch((error) => {
        console.error("Error fetching class data:", error);
      });
  }, [shouldFetchData, assignmentDeleted]);

  const handleDeleteAssignment = (index) => {
    const assignmentId = assignmentData[index]._id;
    axios
      .delete(
        "https://dvsserver.onrender.com/api/v1/adminRoute/deleteAssignment/" +
          assignmentId,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then(() => {
        setAssignmentDeleted(!assignmentDeleted);
        const updatedAssignments = [...assignmentData];
        updatedAssignments.splice(index, 1);
        setAssignmentsData(updatedAssignments);
        toast.success("Deleted Assignment")
      })
      .catch((error) => {
        console.error("Error deleting assignment:", error);
      });
  };

  const THEAD = [
   
    "Title",
    "Description",
    "Date",
    "Class",
    "Section",
    "Subject",
    "File",
    "Actions",
  ];

  return (
    <div className="mx-5">
    <Heading2 title={"Create Homework Assignment"}>

    </Heading2>
    <Button name="Create Assignment" onClick={handleOpenModal}/>
   
    <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={"Create Assignment"}>
      <form onSubmit={handleSubmit} className="bg-gray-100">
        <div className="grid md:grid-cols-3 grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-2 px-5 pb-2">
         

          <div className="">
            <label className="block mb-2">Subject:</label>
            <select
              value={selectedSubject}
              onChange={handleSubjectChange}
              className="p-2 border w-full"
            >
              <option value="">Select Subject</option>
              {classData
                .filter((classItem) => classItem.className === teacherDetails.classTeacher)
                .flatMap((classItem) =>
                  classItem?.subjects?.split(",").map((subject, index) => (
                    <option key={index} value={subject.trim()}>
                      {subject.trim()}
                    </option>
                  ))
                )}
            </select>
          </div>
          

          <div className="">
            <label
              htmlFor="title"
              className="text-sm font-medium text-gray-600 block  mb-3"
            >
              Title
            </label>
            <input
              type="text"
              id="title"
              className="w-full p-2  border  focus:outline-none focus:border-indigo-500"
              placeholder="Enter assignment title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />
          </div>
          <div className="">
            <label
              htmlFor="description"
              className="text-sm font-medium text-gray-600 block  mb-3"
            >
              Description
            </label>
            <textarea
              id="description"
              className="w-full p-2 border  focus:outline-none focus:border-indigo-500"
              placeholder="Enter assignment description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
            />
          </div>
          
          <div className="">
            <label
              htmlFor="pdfFile"
              className="text-sm font-medium text-gray-600 block  mb-3"
            >
              Upload PDF
            </label>
            <input
              type="file"
              accept=".pdf"
              id="pdfFile"
              className="w-full p-2 border focus:outline-none focus:border-indigo-500"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div className=" text-end mb-2 px-5">
        <Button name="Submit" onClick={handleSubmit} type="submit" width="full"/>
          
         
        </div>
      </form>
      </Modal>
    
     
      <div className="">
      

        {/* <div className="overflow-x-auto"> */}
          <Tables
          
          thead={THEAD}
          tbody={assignmentData.map((val, index) => ({
              
            "Title": val?.title,
            "Description": val?.description,
            "Date":(new Date(val.dueDate).toLocaleDateString("en-GB")),
            "Class": val?.className,
            "Section": val?.section,
            "Subject": val?.subject,
            "File":  <a
            href={val.file.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open File
          </a>,
            "Actions": <button
            onClick={() => handleDeleteAssignment(index)}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
          }))}
          />
        </div>
      </div>
    // </div>
  );
};

export default Assignments;
