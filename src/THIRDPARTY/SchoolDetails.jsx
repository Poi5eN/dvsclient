import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Step 1: Import Link
import { useStateContext } from "../contexts/ContextProvider";
import { toast } from "react-toastify";
import { thirdpartyadmissions } from "../Network/ThirdPartyApi";

const SchoolDetails = () => {
  // State to hold the current SchoolID from localStorage, helps in triggering effects
  const [currentSchoolID, setCurrentSchoolID] = useState(localStorage.getItem("SchoolID"));
  
  const [response, setResponse] = useState(null); // For user's assigned schools list
  const [student, setStudent] = useState([]); // For student data of selected school
  const [selectedSchoolIdInDropdown, setSelectedSchoolIdInDropdown] = useState(null); // For the dropdown selection

  // isFlage seems unused in the core logic shown, but kept as per your original code.
  // If it's not used elsewhere, consider removing it.
  const [isFlage, setFlag] = useState(() => {
    return JSON.parse(localStorage.getItem("isFlage")) || false;
  });

  const { setSchoolDetails, schoolDetails, setIsLoader, currentColor } = useStateContext();

  useEffect(() => {
    localStorage.setItem("isFlage", JSON.stringify(isFlage));
  }, [isFlage]);

  // Effect to keep currentSchoolID state in sync with localStorage.getItem("SchoolID")
  // This is useful if SchoolID can be changed by other means (e.g., another tab, or programmatically elsewhere)
  useEffect(() => {
    const updateCurrentSchoolIdFromStorage = () => {
      const storedSchoolID = localStorage.getItem("SchoolID");
      if (storedSchoolID !== currentSchoolID) {
        setCurrentSchoolID(storedSchoolID);
      }
    };
    
    updateCurrentSchoolIdFromStorage(); // Check on mount/update

    window.addEventListener('storage', updateCurrentSchoolIdFromStorage); // Listen for storage events
    return () => {
      window.removeEventListener('storage', updateCurrentSchoolIdFromStorage);
    };
  }, [currentSchoolID]); // Re-run if currentSchoolID changes internally

  const handleSchoolChange = (event) => {
    setSelectedSchoolIdInDropdown(event.target.value);
  };

  const handleRedirect = () => {
    if (!selectedSchoolIdInDropdown || !response?.assignedSchools) return;

    const filteredSchool = response.assignedSchools.find(
      (val) => val?.schoolId === selectedSchoolIdInDropdown
    );

    if (filteredSchool) {
      setSchoolDetails(filteredSchool); // Update context
      localStorage.setItem("SchoolDetails", JSON.stringify(filteredSchool));
      localStorage.setItem("SchoolID", selectedSchoolIdInDropdown);
      setCurrentSchoolID(selectedSchoolIdInDropdown); // Update local state tracker for SchoolID
      toast.success(`Switched to School: ${filteredSchool?.schoolName}`);
      setSelectedSchoolIdInDropdown(null); // Clear dropdown selection after switching
    }
  };
  
  // Renamed for clarity: This function initializes school data on component mount.
  const initializeSchoolData = async () => {
    setIsLoader(true);
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      console.error("User data not found in localStorage.");
      // Potentially show a message or redirect
      setResponse(null); // Ensure response is null if no user data
      setIsLoader(false);
      return;
    }

    const userData = JSON.parse(storedUser);
    setResponse(userData); // Set the list of assigned schools

    const initialSchoolIDFromStorage = localStorage.getItem("SchoolID");
    let schoolToActivate = null;

    if (userData?.assignedSchools?.length === 1) {
      // If only one school is assigned, make it the active one by default
      schoolToActivate = userData.assignedSchools[0];
    } else if (initialSchoolIDFromStorage && userData?.assignedSchools) {
      // If a SchoolID is already in localStorage, try to find its details
      schoolToActivate = userData.assignedSchools.find(s => s.schoolId === initialSchoolIDFromStorage);
    }
    
    if (schoolToActivate) {
      if (!schoolDetails || schoolDetails.schoolId !== schoolToActivate.schoolId) {
        setSchoolDetails(schoolToActivate);
      }
      localStorage.setItem("SchoolDetails", JSON.stringify(schoolToActivate));
      localStorage.setItem("SchoolID", schoolToActivate.schoolId);
      setCurrentSchoolID(schoolToActivate.schoolId);
      if (!initialSchoolIDFromStorage || initialSchoolIDFromStorage !== schoolToActivate.schoolId) {
        // Only toast if it's a new auto-assignment or a change
        // toast.success(`Current School: ${schoolToActivate.schoolName}`);
      }
    } else if (userData?.assignedSchools?.length > 1 && !initialSchoolIDFromStorage) {
      // Multiple schools, none selected yet - user needs to pick
      // Clear any potentially stale schoolDetails from context
      if(schoolDetails) setSchoolDetails(null); 
    }
    setIsLoader(false);
  };

  useEffect(() => {
    initializeSchoolData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  // Effect to ensure schoolDetails in context is consistent with currentSchoolID
  useEffect(() => {
    if (response?.assignedSchools && currentSchoolID) {
      const activeSchoolData = response.assignedSchools.find(
        (school) => school.schoolId === currentSchoolID
      );
      if (activeSchoolData) {
        if (!schoolDetails || schoolDetails.schoolId !== activeSchoolData.schoolId) {
          setSchoolDetails(activeSchoolData);
          localStorage.setItem("SchoolDetails", JSON.stringify(activeSchoolData)); // Keep localStorage in sync
        }
      } else {
        // If currentSchoolID doesn't match any in response, clear context
        // This might happen if localStorage has a stale SchoolID
        if(schoolDetails) {
            setSchoolDetails(null);
            localStorage.removeItem("SchoolDetails");
            // localStorage.removeItem("SchoolID"); // Optionally clear SchoolID too
            // setCurrentSchoolID(null);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSchoolID, response, setSchoolDetails]); // schoolDetails removed from deps to prevent potential loops if setSchoolDetails itself triggers it


  const getStudent = async () => {
    if (!currentSchoolID) return;
    setIsLoader(true);
    try {
      const studentApiResponse = await thirdpartyadmissions(currentSchoolID);
      if (studentApiResponse.success) {
        setStudent(studentApiResponse);
      } else {
        setStudent([]); // Clear previous student data on failure or no data
      }
    } catch (error) {
      console.error("Error fetching student data:", error);
      setStudent([]);
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    if (currentSchoolID) {
      // getStudent();
    } else {
      setStudent([]); // Clear student data if no school is selected
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSchoolID]); // Re-fetch students when currentSchoolID changes

  const studentdata = student?.data
    ?.filter((val) => val?.studentImage?.url)
    ?.map((val) => val.studentImage.url);

  const details = [
    {
      name: "TOTAL STUDENTS", // Changed for clarity
      Count: student?.count || 0,
      logo: "student",
    },
    {
      name: "STUDENTS WITH PHOTO", // Changed for clarity
      Count: studentdata?.length || 0,
      logo: "teacherlogo",
    },
    {
      name: "STUDENTS WITHOUT PHOTO", // Changed for clarity
      Count: (student?.count || 0) - (studentdata?.length || 0),
      logo: "teacherlogo",
    },
  ];

  // Step 2: Define navigation buttons data
  const navButtons = [
    { label: "Dashboard", path: "/thirdparty", icon: "📊" }, // Example icons
    { label: "Students", path: "/thirdparty/all-student", icon: "👥" },
    { label: "Admissions", path: "/thirdparty/admision-form", icon: "📝" },
    { label: "Photo", path: "/thirdparty/photo", icon: "🗓️" }, // Example: Changed one
    { label: "Details", path: "thirdparty/card", icon: "🗓️" }, // Example: Changed one
  ];

  // Improved loading state: wait for response (user data) OR if schoolDetails are already loaded (from context)
  if (!response && !schoolDetails) {
    return (
      <div className="flex justify-center items-center h-screen dark:text-white">
        Loading User and School Data...
      </div>
    );
  }

  const assignedSchools = response?.assignedSchools;

  return (
    <div className=" md:mt-0 dark:bg-main-dark-bg min-h-screen">
      <div className="p-4 space-y-6"> {/* Added overall padding and space between elements */}
        {/* School Selection Dropdown Area */}
        {assignedSchools && assignedSchools.length > 1 && (
          <div className="bg-white dark:bg-secondary-dark-bg p-4 rounded-lg shadow">
            <label htmlFor="schoolSelect" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Select a School to View:
            </label>
            <select
              id="schoolSelect"
              onChange={handleSchoolChange}
              value={selectedSchoolIdInDropdown || ""}
              className="shadow-sm cursor-pointer appearance-none border dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 leading-tight focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-500"
            >
              <option value="">-- Choose a School --</option>
              {assignedSchools.map((school) => (
                <option key={school.schoolId} value={school.schoolId}>
                  {school.schoolName}
                </option>
              ))}
            </select>
            {selectedSchoolIdInDropdown && (
              <button
                onClick={handleRedirect}
                className="mt-3 w-full shadow bg-[#2fa7db] hover:bg-[#2586ac] text-white font-semibold border-transparent rounded py-2 px-3 focus:outline-none focus:shadow-outline transition-colors duration-150"
              >
                Go to {assignedSchools.find(s => s.schoolId === selectedSchoolIdInDropdown)?.schoolName || 'Selected School'}
              </button>
            )}
          </div>
        )}

        {/* Display Active School Name and Navigation Buttons */}
        {schoolDetails && schoolDetails.schoolId ? (
          <>
            <h1
              className="text-white text-center py-3 text-xl font-semibold shadow-md"
              style={{ background: currentColor }}
            >
              {schoolDetails.schoolName}
            </h1>

            {/* Step 3: Render Navigation Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {navButtons.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex flex-col items-center justify-center p-4 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 ease-in-out text-center text-white"
                  style={{ backgroundColor: currentColor }}
                >
                  <span className="text-3xl mb-1.5">{item.icon}</span>
                  <span className="text-xs sm:text-sm font-semibold tracking-wide">{item.label}</span>
                </Link>
              ))}
            </div>

            {/* Student Statistics Display */}
            <div className="mt-2 p-1 bg-white dark:bg-secondary-dark-bg rounded-lg shadow">
                <h2 className="text-lg font-semibold text-center p-2 text-gray-700 dark:text-gray-200 border-b dark:border-gray-700">Student Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
                {details.map((item, index) => (
                    <div key={index} className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg shadow-inner text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.name}</p>
                        <p className="text-3xl font-bold text-gray-800 dark:text-gray-100 mt-1">{item.Count}</p>
                    </div>
                ))}
                </div>
            </div>
          </>
        ) : (
          // Prompt to select a school if multiple are available and none is active
          assignedSchools && assignedSchools.length > 0 && (
            <div className="p-6 text-center bg-white dark:bg-secondary-dark-bg rounded-lg shadow text-gray-600 dark:text-gray-300">
              <p className="text-lg">Kindly  select a school from the dropdown above to see more options.</p>
            </div>
          )
        )}

        {/* Case: No schools assigned to the user */}
        {(!assignedSchools || assignedSchools.length === 0) && !schoolDetails && (
          <div className="p-6 text-center bg-red-100 dark:bg-red-800 dark:text-red-100 text-red-700 rounded-lg shadow">
            <p className="font-semibold text-lg">No schools are currently assigned to your account.</p>
            <p className="text-sm">Please contact support if you believe this is an error.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDetails;




// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../contexts/ContextProvider";
// import { toast } from "react-toastify";
// import { thirdpartyadmissions } from "../Network/ThirdPartyApi";

// const SchoolDetails = () => {
//   const SchoolID = localStorage.getItem("SchoolID");
//   const [response, setResponse] = useState(null);
//   const [student, setStudent] = useState([]);
//   const [selectedSchoolId, setSelectedSchoolId] = useState(null);
//   const [isFlage, setFlag] = useState(() => {
//     return JSON.parse(localStorage.getItem("isFlage")) || false;
//   });

//   const SchoolDetail=JSON.parse(localStorage.getItem("SchoolDetails"))
//   const { setSchoolDetails, schoolDetails, setIsLoader ,currentColor} = useStateContext();
// // console.log("schoolDetails",schoolDetails)
//   useEffect(() => {
//     localStorage.setItem("isFlage", JSON.stringify(isFlage));
//   }, [isFlage]);


//   const handleSchoolChange = (event) => {
//     setSelectedSchoolId(event.target.value);
//   };

//   const handleRedirect = () => {
//     if (!selectedSchoolId || !response) return;

//     const fileterSchool = response?.assignedSchools?.find(
//       (val) => val?.schoolId === selectedSchoolId
//     );

//     if (fileterSchool) {
//       setSchoolDetails(fileterSchool);
//       localStorage.setItem("SchoolDetails", JSON.stringify(fileterSchool));
//       localStorage.setItem("SchoolID", selectedSchoolId);
//       toast.success(`Assigned School: ${fileterSchool?.schoolName}`);
//       setSelectedSchoolId(null);




     
//       // try {
//         // setSchoolId(selectedSchoolId?selectedSchoolId:SchoolID);
      


//     }
//   };


//   console.log("response.length",response?.assignedSchools.length)
//   const newfunctionforschool=async()=>{
//     const storedResponse = localStorage.getItem("user");
//     const data=JSON.parse(storedResponse)
//     setResponse(data);
// try {
//   if( data?.assignedSchools.length===1){
//     const fileterSchool = await data?.assignedSchools[0]
//     const schoolId = await data?.assignedSchools[0]?.schoolId
//     console.log("fileterSchool",fileterSchool)
//     console.log("schoolId",schoolId)
//     localStorage.setItem("SchoolID", schoolId);
//     // const fileterSchool = response?.assignedSchools?.find(
//     //   (val) => val?.schoolId === selectedSchoolId
//     // );

//     // if (fileterSchool) {
//       setSchoolDetails(fileterSchool);
//       localStorage.setItem("SchoolDetails", JSON.stringify(fileterSchool));
     
//       toast.success(`Assigned School: ${fileterSchool?.schoolName}`);
//       setSelectedSchoolId(null);


//   // }
//   }
// } catch (error) {
  
// }
//   }

//   useEffect(()=>{
//     newfunctionforschool()
   
//   },[])

//   useEffect(()=>{
//     const fileterSchooldata= response?.assignedSchools?.filter((val)=>val?.schoolId=== selectedSchoolId)
//     if(fileterSchooldata){
//      console.log("fileterSchooldata",fileterSchooldata)
//      setSchoolDetails(fileterSchooldata[0])
//     }
//   },[SchoolID])
//   const getStudent = async () => {
//     if (!SchoolID) return;
//     setIsLoader(true);
//     try {
//       const response = await thirdpartyadmissions(SchoolID);
//       if (response.success) {
//         setStudent(response);
//       }
//     } catch (error) {
//       console.log("error", error);
//     } finally {
//       setIsLoader(false);
//     }
//   };

//   // useEffect(() => {
//   //   if (SchoolID) {
//   //     getStudent();
//   //   }
//   // }, [SchoolID]);

//   const studentdata = student?.data
//     ?.filter((val) => val?.studentImage?.url)
//     ?.map((val) => val.studentImage.url);

//   const details = [
//     {
//       name: "STUDENTS",
//       Count: student?.count || 0,
//       logo: "student",
//     },
//     {
//       name: "With Photo",
//       Count: studentdata?.length || 0,
//       logo: "teacherlogo",
//     },
//     {
//       name: "Without Photo",
//       Count: (student?.count || 0) - (studentdata?.length || 0),
//       logo: "teacherlogo",
//     },
//   ];

//   if (!response) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         Loading...
//       </div>
//     );
//   }

//   const { assignedSchools } = response;

//   return (
//     <div className="sm:mt-20 mt-20 md:mt-0 dark:bg-main-dark-bg">
//       <div className="divide-y divide-gray-200">
//         <div className="text-base leading-6 space-y-2 text-gray-700 sm:text-lg sm:leading-7">
//           {
//             assignedSchools?.length>1 &&
//             <div>
//             <select
//               id="schoolSelect"
//               onChange={handleSchoolChange}
//               value={selectedSchoolId || ""}
//               className="shadow cursor-pointer bg-red-600 appearance-none border rounded w-full py-2 px-3 text-white leading-tight focus:outline-none focus:shadow-outline"
//             >
//               <option value="" className="">-- Select School --</option>
//               {assignedSchools?.map((school) => (
//                 <option key={school.schoolId} value={school.schoolId}>
//                   {school.schoolName}
//                 </option>
//               ))}
//             </select>
//           </div>
//           }
         

//           {selectedSchoolId && (
//             <button
//               onClick={handleRedirect}
//               className="shadow bg-[#2fa7db] text-white border rounded w-full py-2 px-3 mt-2 focus:outline-none focus:shadow-outline"
//             >
//               Go to School
//             </button>
//           )}
//         </div>
//       </div>
//       <h1 className="text-white text-center py-1 "
//       style={{background:currentColor}}
//       >Selected School : {SchoolDetail?.schoolName}</h1>
//       {/* a */}
//     </div>
//   );
// };

// export default SchoolDetails;


// import React, { useState, useEffect } from "react";
// import { useStateContext } from "../contexts/ContextProvider";
// import { toast } from "react-toastify";
// import { thirdpartyadmissions } from "../Network/ThirdPartyApi";

// const SchoolDetails = () => {
//   const SchoolID = localStorage.getItem("SchoolID");
//   const [schoolId, setSchoolId] = useState();
//   const {

//     setSchoolDetails,schoolDetails,setIsLoader 
//   } = useStateContext();
//   // const [isFlage,setFlag]=useState(true)
//   const [isFlage, setFlag] = useState(() => {
//     return JSON.parse(localStorage.getItem("isFlage")) || false;
//   });
//   useEffect(() => {
//     localStorage.setItem("isFlage", JSON.stringify(isFlage));
//   }, [isFlage]);
//   const [response, setResponse] = useState(null);
//   const [student, setStudent] = useState([]);
//   const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  
//   useEffect(() => {
//     // const storedResponse = sessionStorage.getItem("response");
//     const storedResponse = localStorage.getItem("user");
//     if (storedResponse) {
//       try {
//         setResponse(JSON.parse(storedResponse));
//       } catch (error) {
//         console.error("Error parsing sessionStorage response:", error);
//         sessionStorage.removeItem("response");
//       }
//     }
//   }, []);



//   const handleSchoolChange = (event) => {
//     // console.log("first event",event)
//     setSelectedSchoolId(event.target.value);
//   };

//   const handleRedirect = () => {
//     if (!selectedSchoolId) return;
//     const { name, assignedSchools } = response;
//     try {
//       setSchoolId(selectedSchoolId?selectedSchoolId:SchoolID);
//      const fileterSchool= assignedSchools?.filter((val)=>val?.schoolId=== selectedSchoolId)
//      if(fileterSchool){
//       setSchoolDetails(fileterSchool[0])
//      }
   
//      localStorage.setItem("SchoolDetails", JSON?.stringify(fileterSchool[0]));
//       // setFlag(true);
//       // console.log("schoolName = ",fileterSchool[0]?.schoolName)
    
//       localStorage.setItem("SchoolID", selectedSchoolId);
//       toast.success(`Assigned School: ${fileterSchool[0]?.schoolName}`);
//       // navigate("/thirdparty");
//       setSelectedSchoolId(null)
//     } catch (error) {
//       console.error("Redirection failed:", error);
//     }
//   };
//     const getStudent = async () => {
//       if (!schoolDetails?.schoolId) return;
//       setIsLoader(true);
//       try {
        
//         const response = await thirdpartyadmissions(schoolId);
//   console.log("response aaaaa",response)
//         if (response.success) {
//           setStudent(response);
//           // setFilteredStudents(response?.data);
//           setIsLoader(false);
//         }
//       } catch (error) {
//         console.log("error", error);
//       }
//     };

//     useEffect(() => {
//       getStudent();
//       // Getclasses();
//     }, [schoolId]);
  
//     const studentdata = student?.data
//     ?.filter(val => val?.studentImage?.url) // filters out falsy (empty) URLs
//     ?.map(val => val.studentImage.url);
//     console.log("studentdata",studentdata?.length)
//   const details=[
  
//     {
//       name:"STUDENTS",
//       Count:student?.count || 0,
//       logo:"student"
    
//     },
//     {
//       name:"Width Photo",
//       Count:studentdata?.length,
//       logo:"teacherlogo"
//     },
//     {
//       name:"WidthOut Photo",
//       Count:student?.count- studentdata?.length,
//       logo:"teacherlogo"
//     },
 
//   ]
  
//   if (!response) {
//     return (
//       <div className="flex justify-center items-center h-screen">
//         Loading...
//       </div>
//     );
//   }

//   const { name, assignedSchools } = response;
  
//   return (
   
//         <>
//          <div className="sm:mt-20 mt-20 md:mt-0  dark:bg-main-dark-bg">
//          <div className="divide-y divide-gray-200">
//                     <div className=" text-base leading-6 space-y-2 text-gray-700 sm:text-lg sm:leading-7">
                     
//                       <div className="">
//                         <select
//                           id="schoolSelect"
//                           onChange={handleSchoolChange}
//                           value={selectedSchoolId || ""}
//                           className="shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
//                         >
//                           <option value="">-- Select School --</option>
//                           {assignedSchools?.map((school) => (
//                             <option
//                               key={school.schoolId}
//                               value={school.schoolId}
//                             >
//                               {school.schoolName}
//                             </option>
//                           ))}
//                         </select>
//                       </div>

//                       {selectedSchoolId && (
//                         <button
//                           onClick={handleRedirect}
//                           className="shadow bg-[#2fa7db] cursor-pointer text-white appearance-none border rounded w-full py-2 px-3  leading-tight focus:outline-none focus:shadow-outline"
//                           // className="bg-[#2fa7db] w-full hover:bg-[#f0592e] text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline   sm:w-auto" // Added w-full on mobile
//                         >
//                           Go to School
//                         </button>
//                       )}

                     
//                     </div>
//                   </div>
//       <div class="grid grid-cols-1 gap-2 mt-2 sm:grid-cols-2 lg:grid-cols-4">
//             {/* <template x-for="i in 4"> */}
//             {
//               details?.map((val)=>(
//                 <div class="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-lg">
//                 <div class="flex items-start justify-between">
//                   <div class="flex flex-col space-y-2">
//                     <span class="text-[#33ace0] font-bold">{val?.name}</span>
//                     <span class="text-lg font-semibold text-[#f05a28]">{val?.Count}</span>
//                   </div>
//                   <div class="rounded-md  ">
//                     <img src={val?.logo} alt="" className=" h-20" />
//                   </div>
//                 </div>
                
//               </div>
            
//               ))
//             }
//   </div>
//           </div>
         
          
//         </>
  
//   );
// };

// export default SchoolDetails;
