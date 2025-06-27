import React, { useEffect, useState, useRef } from "react";
import { FaTrashAlt, FaBook, FaCalendarAlt, FaEdit, FaEye } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip } from "react-tooltip";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useStateContext } from "../../../contexts/ContextProvider";
import { deleteExam, getAdminRouteExams } from "../../../Network/AdminApi";
import moment from "moment";
import { debounce } from "lodash";

// Bind modal to app element for accessibility
Modal.setAppElement("#root");

const ViewExam = ({ onEdit, loader, showExamList, setShowExamList }) => {
  const { currentColor, setIsLoader, currentMode } = useStateContext();
  const [examData, setExamData] = useState([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const tableRef = useRef();

  const getExams = async () => {
    setIsLoader(true);
    try {
      const response = await getAdminRouteExams();
      if (response?.success) {
        setExamData(response?.exams);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoader(false);
    }
  };

  const handleDelete = async (examId) => {
    setIsLoader(true);
    try {
      const response = await deleteExam(examId);
      if (response.success) {
        toast?.success("Deleted");
        getExams();
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    getExams();
    const debouncedHandleResize = debounce(() => {}, 100);
    window.addEventListener("resize", debouncedHandleResize);
    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
    };
  }, [loader]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = moment(dateString, "DD-MM-YYYY");
    return date.isValid() ? date.format("DD MMM YYYY") : "N/A";
  };

  const openModal = (exam) => {
    setSelectedExam(exam);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedExam(null);
  };

  const renderExamCards = () => {
    return (
      <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence>
          {examData?.map((exam, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className={`p-6 rounded-2xl shadow-xl transition-all hover:shadow-2xl ${currentMode === "Dark" ? "bg-gray-800 text-light" : "bg-gradient-to-br from-gray-100 to-gray-200"}`}
            >
              <div className="flex items-center justify-between">
                <h3 className={`text-base font-bold ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`}>{exam.name}</h3>
                <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
                  <FaBook className={`${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                </motion.div>
              </div>
              <div className="mt-3 space-y-2">
                <p className={`text-sm flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                  <FaCalendarAlt className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                  <span><strong>Class:</strong> {exam.classNames.join(", ")} - {exam.sections.join(", ")}</span>
                </p>
                <p className={`text-sm flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                  <FaCalendarAlt className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                  <span><strong>Dates:</strong> {formatDate(exam.startDate)} to {formatDate(exam.endDate)}</span>
                </p>
                <p className={`text-sm flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                  <FaBook className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                  <span><strong>Type:</strong> {exam.examType}</span>
                </p>
                <p className={`text-sm flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                  <FaBook className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                  <span><strong>Grade:</strong> {exam.gradeSystem || "N/A"}</span>
                </p>
                <p className={`text-sm flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                  <FaBook className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                  <span><strong>Subjects:</strong> {exam.subjects.length} subject{exam.subjects.length !== 1 ? "s" : ""}</span>
                </p>
              </div>
              <div className="mt-4 flex items-center justify-end space-x-4">
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openModal(exam)}
                  className={`${currentMode === "Dark" ? "text-accent" : "text-indigo-600"} hover:opacity-80`}
                  data-tooltip-id={`view-exam-${index}`}
                >
                  <FaEye size={16} />
                </motion.button>
                <Tooltip id={`view-exam-${index}`} content="View full details" />
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onEdit(exam)}
                  className={`${currentMode === "Dark" ? "text-accent" : "text-indigo-600"} hover:opacity-80`}
                  data-tooltip-id={`edit-exam-${index}`}
                >
                  <FaEdit size={16} />
                </motion.button>
                <Tooltip id={`edit-exam-${index}`} content="Edit this exam" />
                <motion.button
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleDelete(exam.examId)}
                  className="text-red-500 hover:text-red-700"
                  data-tooltip-id={`delete-exam-${index}`}
                >
                  <FaTrashAlt size={16} />
                </motion.button>
                <Tooltip id={`delete-exam-${index}`} content="Delete this exam" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className={`p-6 my-8 ${currentMode === "Dark" ? "bg-dark text-light" : "bg-gradient-to-b from-gray-200 to-gray-400"}`}>
      <div className="flex justify-between items-center mb-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold uppercase"
          style={{ color: currentColor }}
        >
          Exams List
        </motion.h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowExamList(!showExamList)}
          className={`px-4 py-2 rounded-lg flex items-center ${currentMode === "Dark" ? "bg-gray-600 text-light" : "bg-gray-500 text-white"} hover:opacity-80 transition-all`}
        >
          <FaBook className="mr-2" />
          {showExamList ? "Hide Exams" : "Show Exams"}
        </motion.button>
      </div>
      <div ref={tableRef}>
        {showExamList && renderExamCards()}
      </div>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        className={`modal-content w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-4 p-6 rounded-2xl ${currentMode === "Dark" ? "bg-gray-800 text-light" : "bg-white"}`}
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center"
        contentLabel="Exam Details Modal"
      >
        {selectedExam && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className={`text-2xl font-bold mb-4 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`}>{selectedExam.name}</h2>
            <div className="space-y-3">
              <p className={`flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                <FaCalendarAlt className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                <strong>Class:</strong> {selectedExam.classNames.join(", ")} - {selectedExam.sections.join(", ")}
              </p>
              <p className={`flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                <FaCalendarAlt className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                <strong>Dates:</strong> {formatDate(selectedExam.startDate)} to {formatDate(selectedExam.endDate)}
              </p>
              <p className={`flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                <FaBook className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                <strong>Type:</strong> {selectedExam.examType}
              </p>
              <p className={`flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                <FaBook className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                <strong>Grade System:</strong> {selectedExam.gradeSystem || "N/A"}
              </p>
              <p className={`flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                <FaCalendarAlt className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                <strong>Result Publish:</strong> {formatDate(selectedExam.resultPublishDate)}
              </p>
              <div>
                <p className={`font-bold ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`}>Subjects:</p>
                <div className="mt-2 space-y-3">
                  {selectedExam.subjects.map((subject, subIndex) => (
                    <div key={subIndex} className={`p-3 rounded-lg ${currentMode === "Dark" ? "bg-gray-700" : "bg-gray-50"}`}>
                      <p className={`font-semibold flex items-center ${currentMode === "Dark" ? "text-light" : "text-gray-700"}`}>
                        <FaBook className={`mr-2 ${currentMode === "Dark" ? "text-accent" : "text-indigo-600"}`} />
                        {subject.name}
                      </p>
                      <div className="ml-6 space-y-2">
                        {subject.assessments.map((ass, assIndex) => (
                          <div key={assIndex} className="text-sm">
                            <p className={currentMode === "Dark" ? "text-light" : "text-gray-600"}><strong>{ass.name}</strong></p>
                            <p className={currentMode === "Dark" ? "text-light" : "text-gray-600"}>Date: {formatDate(ass.examDate)}</p>
                            <p className={currentMode === "Dark" ? "text-light" : "text-gray-600"}>Time: {ass.startTime} to {ass.endTime}</p>
                            <p className={currentMode === "Dark" ? "text-light" : "text-gray-600"}>Total Marks: {ass.totalMarks}</p>
                            <p className={currentMode === "Dark" ? "text-light" : "text-gray-600"}>Passing Marks: {ass.passingMarks}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={closeModal}
                className={`px-4 py-2 rounded-lg ${currentMode === "Dark" ? "bg-gray-600 text-white" : "bg-gray-500 text-white"} hover:bg-gray-400 transition-colors`}
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        )}
      </Modal>
    </div>
  );
};

export default ViewExam;
