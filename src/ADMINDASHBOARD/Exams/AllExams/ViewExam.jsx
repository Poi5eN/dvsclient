import React, { useEffect, useState, useRef } from "react";
import { FaTrash, FaBook, FaCalendar, FaClock, FaEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import Tables from "../../../Dynamic/Tables";
import { useStateContext } from "../../../contexts/ContextProvider";
import { deleteExam, getAdminRouteExams } from "../../../Network/AdminApi";
import moment from "moment";

const ViewExam = ({ onEdit, loader }) => {
  const { currentColor,setIsLoader } = useStateContext();
  const [examData, setExamData] = useState([]);
  const isMobile = window.innerWidth <= 768;
  const tableRef = useRef();

  const getExams = async () => {
    setIsLoader(true)
    try {
      const response = await getAdminRouteExams()
      if (response?.success) {
        setExamData(response?.exams);
        setIsLoader(false)
      }
    } catch (error) {
      console.log("error", error)
    }
    finally{
      setIsLoader(false)
    }
  }

  const handleDelete = async (examId) => {
    setIsLoader(true)

    try {
      const response = await deleteExam(examId)
      if (response.success) {
        toast?.success("Deleted")
        getExams()
      }
    } catch (error) {
      console.log("error", error)
    }

    finally{
      setIsLoader(false)
    }
  };
  useEffect(() => {
    getExams()
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
    "Class",
    "Exam Name",
    "Exam Type",
    "Grade System",
    "Subjects",
    "Action",
  ];
  console.log("examData",examData)
  const renderMobileExamCards = () => {
    return (
      <div className="grid gap-4 sm:grid-cols-1 ">
        {examData?.map((exam, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md p-4 transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold mb-2">{exam.classNames.map((val)=>val)}-{exam?.sections.map((val)=>val)}</h3>
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
              {/* <button
                onClick={() => onEdit(exam)}
                className="text-blue-500 hover:text-blue-700 focus:outline-none"

              >
                <FaEdit size={20} />
              </button> */}
              <button
                onClick={() => handleDelete(exam.examId)}
                className="text-red-500 hover:text-red-700 focus:outline-none"

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
      {/* <Button name="Print"  onClick={handlePrint}  /> */}
      <h1 className="text-xl text-center font-bold uppercase"
        style={{ color: currentColor }}
      >All exam </h1>
      <div ref={tableRef}>
        {isMobile ? (
          renderMobileExamCards()
        ) : (

          <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 text-left">
            {/* Table Head */}
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Class</th>
                <th className="p-2 border">Start-End Exams</th>
                <th className="p-2 border">Exam Name</th>
                <th className="p-2 border">Exam Type</th>
                <th className="p-2 border">Grade System</th>
                <th className="p-2 border">Subjects</th>
                <th className="p-2 border">Actions</th>
              </tr>
            </thead>
    
            {/* Table Body */}
          
            <tbody>
              {examData?.map((val, ind) => (
                <tr key={ind} className="border">
                  {/* Class */}
                  {/* {  console.log("val?.classNames?.mapitem",val?.classNames?.map((item)=>item))} */}
                  <td className="p-2">{val?.classNames?.map((item)=>item) || "N/A"}-
                    {val?.sections?.map((item)=>item)}
                    </td>
                  <td className="p-2">{moment(val?.startDate).format("DD-MMM-YYYY") || "N/A"}<span className="text-red-500 font-extrabold"> TO </span>{moment(val?.endDate).format("DD-MMM-YYYY") || "N/A"}</td>
    
                  {/* Exam Name */}
                  <td className="p-2">{val?.name || "N/A"}</td>
    
                  {/* Exam Type */}
                  <td className="p-2">{val?.examType || "N/A"}</td>
    
                  {/* Grade System */}
                  <td className="p-2">{val?.gradeSystem || "N/A"}</td>
    
                  {/* Subjects */}
                  <td className="p-2">
                    {val?.subjects?.length > 0 ? (
                      <ul>
                        {val?.subjects?.map((subject, subIndex) => (
                          <li key={subIndex} className="flex items-center gap-2">
                            <FaBook className="text-gray-500" />
                            {subject?.name || subject?.subjectName} - {formatDate(subject?.examDate)}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      "No Subjects"
                    )}
                  </td>
    
                  {/* Actions */}
                  <td className="p-2 flex items-center space-x-2">
                    <button
                      onClick={() => onEdit(val)}
                      className="text-blue-500 hover:text-blue-700 focus:outline-none"
                    >
                      <FaEdit size={20} />
                    </button>
                    <button
                      onClick={() => handleDelete(val.examId)}
                      className="text-red-500 hover:text-red-700 focus:outline-none"
                    >
                      <FaTrash size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
//           <Tables
//             thead={THEAD}
//             tbody={examData?.map((val, ind) => ({
//               //  "Class":{`${val?.className} - ${val?.section}`},
//               "Class": `${val?.className}`,
//               "Exam Name": val?.name,
//               "Exam Type": val?.examType,
//               "Grade System": val?.gradeSystem || "N/A",
//               "Subjects": (
//   <ul>
//     {val?.subjects?.map((subject, subIndex) => (
//       <li key={subIndex} className="flex items-center gap-2">
//        { console.log("first   subject",subject)}
//         <FaBook className="text-gray-500" />
//         {subject?.name || subject?.subjectName} - {formatDate(subject?.examDate)}
//         <br />
//         {/* <FaClock className="text-gray-500 text-xs" /> {subject?.startTime} to {subject?.endTime} */}
//       </li>
//     ))}
//   </ul>
// )

//               // "subject":
//               //   val?.subjects?.length > 0 && (
//               //     <table className="w-full border border-gray-300 text-left">
//               //       <thead>
//               //         <tr className="bg-gray-100">
//               //           <th className="p-2 border">Subject</th>
//               //           <th className="p-2 border">Exam Date</th>
//               //           <th className="p-2 border">Time</th>
//               //         </tr>
//               //       </thead>
//               //       <tbody>
//               //         {val?.subjects?.map((subject, subIndex) => (
//               //           <tr key={subIndex} className="border">
//               //             <td className="p-2 flex items-center gap-2">
//               //               <FaBook className="text-gray-500" />
//               //               {subject?.name || subject?.subjectName}
//               //             </td>
//               //             <td className="p-2">
//               //               <div className="flex items-center gap-1">
//               //                 <FaCalendar className="text-gray-500 text-xs" />
//               //                 <span>{formatDate(subject?.examDate)}</span>
//               //               </div>
//               //             </td>
//               //             <td className="p-2">
//               //               <div className="flex items-center gap-1">
//               //                 <FaClock className="text-gray-500 text-xs" />
//               //                 <span>
//               //                   {subject?.startTime} to {subject?.endTime}
//               //                 </span>
//               //               </div>
//               //             </td>
//               //           </tr>
//               //         ))}
//               //       </tbody>
//               //     </table>
//               //   )

//               ,
//               // "Action": <div className="flex items-center space-x-2">

//               //   <button
//               //     onClick={() => handleDelete(val._id)}
//               //     className="text-red-500 hover:text-red-700 focus:outline-none"

//               //   >
//               //     <FaTrash size={20} />
//               //   </button>
//               // </div>
//               "Action": (
//   <div className="flex items-center space-x-2">
//     <button
//       onClick={() => onEdit(val)}
//       className="text-blue-500 hover:text-blue-700 focus:outline-none"
//     >
//       <FaEdit size={20} />
//     </button>
//     <button
//       onClick={() => handleDelete(val._id)}
//       className="text-red-500 hover:text-red-700 focus:outline-none"
//     >
//       <FaTrash size={20} />
//     </button>
//   </div>
// ),

//             }))}

//           />
        )}
      </div>
    </div>
  );
};

export default ViewExam;
