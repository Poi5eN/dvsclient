import React, { useState, useEffect, useCallback } from "react";

import axios from "axios";
import DynamicDataTable from "./DataTable";
import { useStateContext } from "../../contexts/ContextProvider";
import { toast } from "react-toastify";
import { ActiveStudents } from "../../Network/AdminApi";


const AdmitCard = () => {
  const session = JSON.parse(localStorage.getItem("session"));
  const authToken = localStorage.getItem("token");
  const { currentColor ,setIsLoader} = useStateContext();
  const modalStyle = {
    content: {
      // width: "80%",
      // top: "50%",
      // left: "50%",
      // right: "auto",
      // bottom: "auto",
      // marginRight: "-50%",
      // transform: "translate(-50%, -50%)",
      zIndex: 1000,
      // background:currentColor
    },
  };
  const [students, setStudents] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);

  // useEffect(() => {
  //   axios
  //     .get(
  //       "https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents",
  //       {
  //         withCredentials: true,
  //         headers: {
  //           Authorization: `Bearer ${authToken}`,
  //         },
  //       }
  //     )
  //     .then((response) => {
  //       const allStudent = response.data.allStudent;

  //       setSubmittedData(response.data.allStudent);
  //       setStudents(allStudent);
  //     })
  //     .catch((error) => {
  //       console.error(error);
  //     });
  // }, []);

  const allStudent = useCallback(async () => {
      setIsLoader(true);
      try {
        const response = await ActiveStudents(session);
        if (response?.students?.data) {
          // const filterStudent = response?.students?.data?.filter(
          //   (val) => val.class === selectedClass && val.section === selectedSection
          // );
          setSubmittedData( response.students.data);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
        toast.error("Error fetching students.");
      } finally {
        setIsLoader(false);
      }
    }, []);
  
    useEffect(() => {
      allStudent();
    }, [allStudent]);
  return (
    <div className=" mt-12 md:mt-1  mx-auto p-3 ">
      <h1
        className="text-4xl font-bold mb-4 uppercase text-center  hover-text "
        style={{ color: currentColor }}
      >
        admit card
      </h1>

      <DynamicDataTable data={submittedData} />
    </div>
  );
};

export default AdmitCard;
