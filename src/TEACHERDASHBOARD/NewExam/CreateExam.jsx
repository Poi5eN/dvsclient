


import React, { useState, useEffect } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { FaPlus, FaTimesCircle } from "react-icons/fa";
import ViewExam from "./ViewExam";
import Modal from "../../Dynamic/Modal";
import Heading2 from "../../Dynamic/Heading2";
import Input from "../../Dynamic/Input";

export default function CreateExam() {
  const { currentColor } = useStateContext();
  const [modalOpen, setModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [examId, setExamId] = useState(null);
  const [examCreated, setExamCreated] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalFormData, setModalFormData] = useState({
    examName: "",
    examType: "",
    className: "",
    section: "",
    startDate: "",
    endDate: "",
    Grade: "",
    resultPublishDate: "",
    subjects: [],
  });

  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const teacherDetails = JSON.parse(localStorage.getItem("user"));
  const authToken = localStorage.getItem("token");


  useEffect(() => {
    if (modalOpen) {
      getAllClasses();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modalOpen]);


  const handleEditExam = (exam) => {
    console.log("exam", exam)
    setEditMode(true);
    setExamId(exam?._id);
    setModalOpen(true);
    setModalFormData({
      examName: exam?.name || "",
      examType: exam?.examType || "",
      className: exam?.className || "",
      section: exam?.section || "",
      startDate: exam?.startDate || "",
      endDate: exam?.endDate || "",
      Grade: exam?.gradeSystem || "",
      resultPublishDate: exam?.resultPublishDate || "",
      subjects: exam?.subjects?.map(subject => ({
        name: subject?.name,
        examDate: subject?.examDate,
        startTime: subject?.startTime,
        endTime: subject?.endTime,
        totalMarks: subject?.totalMarks,
        passingMarks: subject?.passingMarks,
      })) || [],
    });
  };


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setModalFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubjectChange = (index, field, value) => {
    setModalFormData((prevData) => {
      const updatedSubjects = [...prevData.subjects];
      updatedSubjects[index] = { ...updatedSubjects[index], [field]: value };
      return { ...prevData, subjects: updatedSubjects };
    });
  };

  const addSubject = () => {
    setModalFormData((prevData) => ({
      ...prevData,
      subjects: [
        ...prevData.subjects,
        {
          name: "",
          examDate: "",
          startTime: "",
          endTime: "",
          totalMarks: "",
          passingMarks: "",
        },
      ],
    }));
  };

  const removeSubject = (index) => {
    setModalFormData((prevData) => {
      const updatedSubjects = prevData.subjects.filter((_, i) => i !== index);
      return { ...prevData, subjects: updatedSubjects };
    });
  };

  const getAllClasses = async () => {
    try {
      let response = await axios.get(
        "https://dvsserver.onrender.com/api/v1/adminRoute/getAllClasses",
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      if (response?.data?.success) {
        if (teacherDetails && response.data.classList?.length > 0) {
          const filteredClass = response.data.classList.find(
            (cls) =>
              cls.className === teacherDetails.classTeacher &&
              cls.sections.includes(teacherDetails.section)
          );

          if (filteredClass) {
            const subjectsArray = filteredClass.subjects
              .split(",")
              .map((subject) => subject.trim());
            setFilteredSubjects(subjectsArray);

            if (!editMode) {
              const initialSubjects = subjectsArray.map(subjectName => ({
                name: subjectName,
                examDate: "",
                startTime: "",
                endTime: "",
                totalMarks: "",
                passingMarks: "",
              }));
              setModalFormData((prevData) => ({ ...prevData, subjects: initialSubjects }));
            }
          }
          else {
            setFilteredSubjects([]);
            setModalFormData((prevData) => ({ ...prevData, subjects: [] }));
          }
        }
      }

    } catch (error) {
      console.error("Error fetching classes:", error);
    }
  };


  const handleOpenModal = () => {
    setModalOpen(true);
    setEditMode(false);
    setModalFormData({
      examName: "",
      examType: "",
      className: "",
      section: "",
      startDate: "",
      endDate: "",
      Grade: "",
      resultPublishDate: "",
      subjects: [],
    });
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (
      !modalFormData?.examName ||
      !modalFormData?.examType ||
      !teacherDetails?.classTeacher ||
      !teacherDetails?.section ||
      !modalFormData?.Grade ||
      !modalFormData?.startDate ||
      !modalFormData?.endDate ||
      !modalFormData?.resultPublishDate
    ) {
      toast.error("Please fill in all the required fields!");
      setLoading(false);
      return;
    }
    let payload = {
      name: modalFormData?.examName,
      examType: modalFormData?.examType,
      className: teacherDetails?.classTeacher,
      section: teacherDetails?.section,
      gradeSystem: modalFormData?.Grade,
      startDate: modalFormData?.startDate,
      endDate: modalFormData?.endDate,
      resultPublishDate: modalFormData?.resultPublishDate,
      subjects: modalFormData?.subjects,
    };

    let apiUrl = "https://dvsserver.onrender.com/api/v1/exam/createExams";
    let method = "post";
    if (editMode) {
      apiUrl = `https://dvsserver.onrender.com/api/v1/exam/updateExam/${examId}`;
      method = "put";
    }
    try {
      await axios[method](
        apiUrl,
        payload,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      setModalFormData({
        examName: "",
        examType: "",
        className: "",
        section: "",
        startDate: "",
        endDate: "",
        Grade: "",
        resultPublishDate: "",
        subjects: [],
      });
      setEditMode(false);
      setExamId(null);
      toast.success(editMode ? "Exam Updated Successfully!" : "Exam Created Successfully!");
      setExamCreated(!examCreated);
      setLoading(false);
      setModalOpen(false);
    } catch (error) {
      setLoading(false);
      console.log("error", error);
      toast.error(
        `Error: ${error?.response?.data?.message || "Something went wrong!"}`
      );
    }
  };


  return (
    <div className="px-5">
      <Heading2 title={"All EXAMS"}>
        <button
          onClick={handleOpenModal}
          className="py-1 p-3 shadow-md  rounded-tl-lg rounded-tr-lg  flex items-center space-x-1 text-white"
          style={{ background: currentColor }}
        >
          {" "}
          <FaPlus />
          <span>Create Exam</span>
        </button>
      </Heading2>
      <Modal isOpen={modalOpen} setIsOpen={setModalOpen} title={editMode ? "Edit Exam" : "Create Exam"}>
        <div className=" mx-auto bg-gray-50 p-6  ">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="mt-2 grid sm:grid-cols-3  md:grid-cols-4  lg:grid-cols-3 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md ">
              <Input
                type="text"
                name="examName"
                required={true}
                onChange={handleInputChange}
                value={modalFormData?.examName}
                placeholder="Exam Name"
              />

              <div className="flex flex-col space-y-1 mt-1">
                <select
                  name="examType"
                  value={modalFormData?.examType}
                  onChange={handleInputChange}
                  required
                  className=" w-full border-1 border-black outline-none py-2 bg-inherit"
                >
                  <option value="">Select Exam Type</option>
                  <option value="TERM">Term</option>
                  <option value="UNIT_TEST">Unit Test</option>
                  <option value="FINAL">Final</option>
                  <option value="ENTRANCE">Entrance</option>
                  <option value="COMPETITIVE">Competitive</option>
                </select>
              </div>

              <div>
                <select
                  name="Grade"
                  value={modalFormData?.Grade}
                  onChange={handleInputChange}
                  required
                  className=" w-full border-1 border-black outline-none py-2 bg-inherit"
                >
                  <option value="">Grade System</option>
                  <option value="Percentage">Percentage</option>
                  <option value="Grade">Grade</option>
                  <option value="CGPA">CGPA</option>
                </select>
              </div>
              <Input
                type="date"
                name="startDate"
                required={true}
                onChange={handleInputChange}
                value={modalFormData?.startDate}
                placeholder=" Start Date"
              />

              <Input
                type="date"
                name="endDate"
                required={true}
                onChange={handleInputChange}
                value={modalFormData?.endDate}
                placeholder="End Date"
              />

              <Input
                type="date"
                name="resultPublishDate"
                required={true}
                onChange={handleInputChange}
                value={modalFormData?.resultPublishDate}
                placeholder="Result Publish Date"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-bold text-gray-800">Subjects</h3>
                <button
                  type="button"
                  onClick={addSubject}
                  className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded flex items-center space-x-1"
                >
                  <FaPlus />
                  <span>Add Subject</span>
                </button>
              </div>
              {modalFormData?.subjects?.map((subject, index) => (
                <div
                  key={index}
                  className="mt-2 grid sm:grid-cols-3  md:grid-cols-6  lg:grid-cols-6 grid-cols-2 gap-3 px-2  mx-auto bg-gray-100 rounded-md "
                >
                  <div>
                      {subject?.name}
                  </div>
                  <Input
                    type="date"
                    name="examDate"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "examDate", e.target.value)
                    }
                    value={subject?.examDate}
                    placeholder="Exam Date"
                  />

                  <Input
                    type="time"
                    name="startTime"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "startTime", e.target.value)
                    }
                    value={subject?.startTime}
                    placeholder="Start Time"
                  />
                  <Input
                    type="time"
                    name="endTime"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "endTime", e.target.value)
                    }
                    value={subject?.endTime}
                    placeholder="End Time"
                  />

                  <Input
                    type="number"
                    name="totalMarks"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "totalMarks", e.target.value)
                    }
                    value={subject.totalMarks}
                    placeholder="Total Marks"
                  />

                  <Input
                    type="number"
                    name="passingMarks"
                    required={true}
                    onChange={(e) =>
                      handleSubjectChange(index, "passingMarks", e.target.value)
                    }
                    value={subject.passingMarks}
                    placeholder="Passing Marks"
                  />

                  {/* <div className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeSubject(index)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <FaTimesCircle size={20} />
                    </button>
                  </div> */}
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-md focus:outline-none disabled:bg-indigo-300 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (editMode ? "Updating Exam..." : "Saving Exam...") : (editMode ? "Update Exam" : "Save Exam")}
            </button>
          </form>
        </div>
      </Modal>
      <ViewExam onEdit={handleEditExam} />
    </div>
  );
}
