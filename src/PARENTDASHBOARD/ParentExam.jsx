import React, { useState, useEffect } from "react";
import axios from "axios";

import { useStateContext } from "../contexts/ContextProvider";


const ParentExam= () => {
  const authToken = localStorage.getItem("token");
  const { currentColor} = useStateContext();
  const [examData, setExamData] = useState([]);
  const data = JSON.parse(sessionStorage.getItem("response"));
  console.log("sessionStorage-->", data);

  const [studentData, setStudentData] = useState({});
  // const data = JSON.parse(sessionStorage.getItem("response")); // Uncomment this line if needed
  // console.log("sessionStorage-->", data);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(
       ` https://eserver-i5sm.onrender.com/api/v1/adminRoute/myKids`,
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      )
      .then((response) => {
        console.log("My KIds ", response.data);
        const data = response.data.data[0];
        setStudentData(data);
        console.log("ParentDashBoard--->", data);
        setLoading(false); // Set loading to false once data is received
      })
      .catch((error) => {
        console.error("Error fetching Student data:", error);
        setLoading(false); // Set loading to false in case of an error
      });
  }, []);

  console.log(studentData);

  


  useEffect(() => {
    if (studentData.class && studentData.section) {
      axios
        .get(
         ` https://eserver-i5sm.onrender.com/api/v1/exam/getAllExams?className=${studentData.class}&section=${studentData.section}`,
          {
            withCredentials: true,
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
          }
        )
        .then((response) => {
          const examData = response.data.examData;
          setExamData(examData);
          console.log("ADMIN----Exam-Data---> check1", examData);
        })
        .catch((error) => {
          console.log(error.message);
        });
    }
  }, [studentData.class, studentData.section]);

  return (
    <div>
      
      <div className="mt-8">
  <h2 
  className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
  style={{color:currentColor}}
  >Exam</h2>
  <div className="overflow-x-auto bg-gray-100 rounded-lg p-4">
    <table className="w-full border-collapse table-auto">
      <thead>
        <tr className="bg-cyan-700 text-white">
          <th className="border text-left  p-2">Class</th>
          <th className="border text-left  p-2">Exam Name</th>
          <th className="border text-left px-4 py-2"></th>
          {/* <th className="border text-left px-4 py-2">Action</th> */}
         
          
        </tr>
      </thead>
      <tbody>
        {console.log("first", examData)}
        {examData.map((data, index) => (
          <tr key={index}>
            <td className="border  p-2">{data.className}-{data.section}</td>
            {/* <td className="border px-4 py-2">{data.section}</td> */}
            <td className="border p-2">{data.examName}</td>
            <div className="border p-2">
             <tr className=" bg-cyan-600 border-2 text-white border-gray-500 w-full flex justify-around">
             <th className="w-[100px]">Subject</th>
             <th className="w-[100px]">Date</th>
             <th className="w-[100px]">Timimg</th>
             <th className="w-[100px]">Total Marks</th>
             </tr>
              {data.examInfo.map((subject, i) => (
                  <>
              
                <div key={i}>
               
             
                  <tr className="  border-2 border-gray-500 w-full flex justify-around">

                   <td  className="w-[100px] text-center">{subject.subjectName}</td> 
                   <td  className="w-[100px] text-center">{subject.examDate ? subject.examDate.split("T")[0] : ""}</td>
               <td  className="w-[100px] text-center">{subject.startTime} - {subject.endTime}</td>
                   <td  className="w-[100px] text-center">{subject.subjectTotalMarks}</td>
                
                  
                  </tr>
                 
                </div>
                  </>
              ))}
            </div>
           
           
            {/* <td className='text-center'>
            <button className='bg-red-600 p-3 text-center text-white' onClick={() => handleDelete(data._id)}>Delete</button>
            </td> */}
          </tr>
        
        ))}
        
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
};

export default ParentExam;