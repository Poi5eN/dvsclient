import React, { useState, useEffect } from "react";
import axios from "axios";

import { GrFormView } from "react-icons/gr";

import { useStateContext } from "../contexts/ContextProvider";
const API_GET_DATA =
  "https://eserver-i5sm.onrender.com/api/v1/adminRoute/getAllNotice";

const StudentNotice = () => {
  const authToken = localStorage.getItem("token");
 
  const [notice, setNotices] = useState([]);
  const { currentColor } = useStateContext();
  useEffect(() => {
    // GET Request to fetch existing notices
    axios
      .get(API_GET_DATA, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      })
      .then((response) => {
        // console.log("yes", response.data);
        const { allNotice } = response.data;
        // console.log("getData--->", allNotice);
        setNotices(allNotice);
      })
      .catch((error) => {
        console.error("Error fetching notices:", error);
      });
  }, []);

  const [isExpanded, setIsExpanded] = useState(false);

  const toggleContent = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <>
      <div className="p-1">
       
        {notice.map((item, index) => (
          <div key={index} className="py-2 px-4 text-black   bg-white mb-2 border  dark:text-white dark:bg-secondary-dark-bg">
            <div className="wrapper" key={index}>
            <p className="" style={{ color: currentColor }}>
                  {item.role}
                </p>
                <h2 className="text-lg font-semibold  mb-2">{item.title}</h2>
              {/* <p className="text-base">
                {isExpanded ? item.content : item.content.substring(0, 200)}
                {item.content.length > 200 && !isExpanded && <span>...</span>}
              </p> */}
               <p className="text-gray-600">{item.content}</p>

              {item.file && (
                <a
                  href={item.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  <GrFormView style={{ color: currentColor,fontSize:"30px" }}  title="View File"   />
                </a>
              )}

              {/* <p className="mt-6">
                <button
                  className="btn btn-primary text-black hover:opacity-75 transition duration-250  dark:text-white "
                  onClick={toggleContent}
                >
                  {isExpanded ? "Read Less" : "Read More"}
                </button>
              </p> */}
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default StudentNotice;
