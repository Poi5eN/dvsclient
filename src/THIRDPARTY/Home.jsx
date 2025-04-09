import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ThirdPartyMobile from "./Mobile/ThirdPartyMobile";
import { MdFullscreen, MdFullscreenExit } from "react-icons/md";
import { useStateContext } from "../contexts/ContextProvider";
import { IoLogOutOutline } from "react-icons/io5";

const Home = () => {
  const [schoolId, setSchoolId] = useState(null);
  const {
    isFullScreen,
    setIsFullScreen,
    toggleFullScreen,
  } = useStateContext();
  // const [isFlage,setFlag]=useState(true)
  const [isFlage, setFlag] = useState(() => {
    return JSON.parse(localStorage.getItem("isFlage")) || false;
  });
  useEffect(() => {
    localStorage.setItem("isFlage", JSON.stringify(isFlage));
  }, [isFlage]);
  const [response, setResponse] = useState(null);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    // const storedResponse = sessionStorage.getItem("response");
    const storedResponse = localStorage.getItem("user");
    if (storedResponse) {
      try {
        setResponse(JSON.parse(storedResponse));
      } catch (error) {
        console.error("Error parsing sessionStorage response:", error);
        sessionStorage.removeItem("response");
      }
    }
  }, []);

  const handleLogout = () => {
    axios
      .get("https://dvsserver.onrender.com/api/v1/logout")
      .then(() => {
        sessionStorage.clear();
        localStorage.clear();
        navigate("/");
      })
      .catch((error) => {
        sessionStorage.clear();
        console.error("Logout error:", error);
      });
  };

  const handleSchoolChange = (event) => {
    setSelectedSchoolId(event.target.value);
  };

  const handleRedirect = () => {
    if (selectedSchoolId) {
      setSchoolId(selectedSchoolId);
    
      setFlag(true);
      localStorage.setItem("SchoolID", selectedSchoolId);
    }
  };

  if (!response) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const { name, assignedSchools } = response;
  const handleClicked = () => {
    setIsFullScreen(!isFullScreen);
    toggleFullScreen();
  };
  return (
    <>
      {isFlage ? (
        <ThirdPartyMobile schoolId={schoolId} />
      ) : (
        <>
          <div className="h-[100vh] bg-gray-100  flex flex-col justify-center ">
            <div className="relative py-3 sm:max-w-xl sm:mx-auto">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-[#f0592e] shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
              <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
              <span
                      onClick={handleLogout}
                      title="LogOut"
                      className="text-[#2fa7db] absolute right-5 top-5  hover:text-[#f0592e]  font-bold text-[50px] rounded focus:outline-none focus:shadow-outline "
                    >
                      <IoLogOutOutline />
                    </span>
                <div className="max-w-md mx-auto ">
                  <div className="py-2 text-center flex justify-center items-center gap-10 w-full">
                    <button
                      onClick={() => handleClicked()}
                      className="py-2 border-none"
                      // style={{ color: currentColor }}
                    >
                      {isFullScreen ? (
                        <MdFullscreenExit
                          className="text-[50px] text-[#f0592e]"
                          title="Fullscreen Exit "
                        />
                      ) : (
                        <MdFullscreen
                          className="text-[50px] text-[#f0592e] "
                          title="full screen"
                        />
                      )}
                    </button>
                   
                  </div>

                  <div>
                    <h1 className="text-2xl font-semibold text-gray-800 text-center mb-4">
                      Welcome, {name}!
                    </h1>
                  </div>
                  <div className="divide-y divide-gray-200">
                    <div className="py-4 text-base leading-6 space-y-2 text-gray-700 sm:text-lg sm:leading-7">
                      {/* <p>
              <span className="font-medium">Name:</span> {name}
            </p>
            <p>
              <span className="font-medium">Email:</span> {email}
            </p> */}
                      <div className="mb-4">
                        <select
                          id="schoolSelect"
                          onChange={handleSchoolChange}
                          value={selectedSchoolId || ""}
                          className="shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        >
                          <option value="">-- Select School --</option>
                          {assignedSchools.map((school) => (
                            <option
                              key={school.schoolId}
                              value={school.schoolId}
                            >
                              {school.schoolName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {selectedSchoolId && (
                        <button
                          onClick={handleRedirect}
                          className="shadow bg-[#2fa7db] cursor-pointer text-white appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
                          // className="bg-[#2fa7db] w-full hover:bg-[#f0592e] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline   sm:w-auto" // Added w-full on mobile
                        >
                          Go to School
                        </button>
                      )}

                     
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
        </>
      )}
      ;
    </>
  );
};

export default Home;
