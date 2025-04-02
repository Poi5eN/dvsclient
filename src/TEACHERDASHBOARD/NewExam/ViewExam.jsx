import React, { useEffect, useState, useRef } from "react";
import { useStateContext } from "../../contexts/ContextProvider";
import axios from "axios";

import { FaTrash, FaBook, FaCalendar, FaClock, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import Loading from "../../Loading";
import Tables from "../../Dynamic/Tables";

const ViewExam = ({ onEdit }) => {
    const { currentColor } = useStateContext();
   
    const authToken = localStorage.getItem("token");
    const [examData, setExamData] = useState([]);
    const [loading, setLoading] = useState(false);
    const isMobile = window.innerWidth <= 768;

    const tableRef = useRef();
   
    const getResult = async () => {
        setLoading(true);
        try {
            let response = await axios.get(
                // `https://dvsserver.onrender.com/api/v1/adminRoute/exams?className=${user?.classTeacher}&section=${user?.section}`,
                "https://dvsserver.onrender.com/api/v1/adminRoute/exams",
                // "https://dvsserver.onrender.com/api/v1/exam/getExams",
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            setExamData(response.data.exams);
        } catch (error) {
            console.error("Error fetching exams:", error);
            toast.error(
                `Error: ${error?.response?.data?.message || "Something went wrong!"}`
            );
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (examId) => {
        setLoading(true);
        try {
            await axios.delete(
                `https://dvsserver.onrender.com/api/v1/exam/exams/${examId}`,
                {
                    withCredentials: true,
                    headers: {
                        Authorization: `Bearer ${authToken}`,
                    },
                }
            );
            toast.success("Exam Deleted Successfully");
            getResult(); // Refresh exams after delete
        } catch (error) {
            toast.error(
                `Error: ${error?.response?.data?.message || "Something went wrong!"}`
            );
            console.error("Error deleting exam:", error);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        getResult();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const formatDate = (dateString) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch (e) {
            return "N/A";
        }
    };


    const THEAD = [

        "Exam Name",
        "Exam Type",
        "Grade System",
        "Subjects",
        "Action",
    ];

    if (loading) {
        return <Loading />
    }

   const renderMobileExamCards = () => {
        return (
            <div className="grid gap-4 sm:grid-cols-1 ">
                {examData.map((exam, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-md p-4 transition-transform hover:scale-105">
                        <h3 className="text-lg font-semibold mb-2">{exam.name}</h3>
                        <p><strong>Exam Type:</strong> {exam.examType}</p>
                        <p><strong>Grade System:</strong> {exam.gradeSystem || "N/A"}</p>

                        {exam.subjects && exam.subjects.length > 0 && (
                          <div>
                               <p><strong>Subjects:</strong></p>
                                {exam.subjects.map((subject, subIndex) => (
                                  <div key={subIndex} className="mb-1 borer border-2 ">
                                        <div className="flex items-center gap-1">
                                            <FaBook className="text-gray-500" />
                                            {subject?.name || subject?.subjectName}
                                        </div>
                                          <div className="flex space-x-1 items-center">
                                             <FaCalendar className="text-gray-500 text-xs" />
                                             <span>{formatDate(subject?.examDate)}</span>
                                            <FaClock className="text-gray-500 text-xs" />
                                             <span>
                                              {subject?.startTime} to {subject?.endTime}
                                              </span>
                                         </div>
                                    </div>
                                ))}
                         </div>
                         )}
                           <div className="mt-4 flex items-center space-x-2">
                               <button
                                     onClick={() => onEdit(exam)}
                                     className="text-blue-500 hover:text-blue-700 focus:outline-none"
                                    disabled={loading}
                               >
                                <FaEdit size={20} />
                               </button>
                             <button
                                onClick={() => handleDelete(exam._id)}
                                className="text-red-500 hover:text-red-700 focus:outline-none"
                                disabled={loading}
                             >
                                <FaTrash size={20} />
                            </button>
                        </div>

                    </div>
                ))}
            </div>
        );
    };
    return (
         <div className="p-3">
           
             <h1 className="text-xl text-center font-bold uppercase" 
          style={{color:currentColor}}
          >All exam</h1>
             <div ref={tableRef}>
             {isMobile ? (
                    renderMobileExamCards()
                   ) : (
                     <Tables
                        thead={THEAD}
                        tbody={examData.map((val, ind) => ({

                            "Exam Name": val?.name,
                            "Exam Type": val?.examType,
                            "Grade System": val?.gradeSystem || "N/A",
                            "subject": val?.subjects?.length > 0 && (val?.subjects?.map((subject, subIndex) => (
                                <div key={subIndex} className="mb-1 ">
                                    <div className="flex items-center gap-1">
                                        <FaBook className="text-gray-500" />
                                        {subject?.name || subject?.subjectName}
                                    </div>
                                    <div className="flex space-x-1 items-center">
                                        <FaCalendar className="text-gray-500 text-xs" />
                                        <span>{formatDate(subject?.examDate)}</span>
                                        <FaClock className="text-gray-500 text-xs" />
                                        <span>
                                            {subject?.startTime} to {subject?.endTime}
                                        </span>
                                    </div>
                                </div>
                            ))),
                            "Action": <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => onEdit(val)}
                                    className="text-blue-500 hover:text-blue-700 focus:outline-none"
                                    disabled={loading}
                                >
                                    <FaEdit size={20} />
                                </button>
                                <button
                                    onClick={() => handleDelete(val._id)}
                                    className="text-red-500 hover:text-red-700 focus:outline-none"
                                    disabled={loading}
                                >
                                    <FaTrash size={20} />
                                </button>
                            </div>
                         }))}

                     />
                   )}
                </div>
          </div>
    );
};

export default ViewExam;
