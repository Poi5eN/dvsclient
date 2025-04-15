import React, { useState, useEffect } from "react";
import { useStateContext } from "../contexts/ContextProvider";
import { toast } from "react-toastify";
import { thirdpartyadmissions } from "../Network/ThirdPartyApi";

const SchoolDetails = () => {
  const SchoolID = localStorage.getItem("SchoolID");
  const [response, setResponse] = useState(null);
  const [student, setStudent] = useState([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState(null);
  const [isFlage, setFlag] = useState(() => {
    return JSON.parse(localStorage.getItem("isFlage")) || false;
  });

  const SchoolDetail=JSON.parse(localStorage.getItem("SchoolDetails"))
  const { setSchoolDetails, schoolDetails, setIsLoader ,currentColor} = useStateContext();
console.log("schoolDetails",schoolDetails)
  useEffect(() => {
    localStorage.setItem("isFlage", JSON.stringify(isFlage));
  }, [isFlage]);

  useEffect(() => {
    const storedResponse = localStorage.getItem("user");
    if (storedResponse) {
      try {
        setResponse(JSON.parse(storedResponse));
      } catch (error) {
        console.error("Error parsing localStorage user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const handleSchoolChange = (event) => {
    setSelectedSchoolId(event.target.value);
  };

  const handleRedirect = () => {
    if (!selectedSchoolId || !response) return;

    const fileterSchool = response?.assignedSchools?.find(
      (val) => val?.schoolId === selectedSchoolId
    );

    if (fileterSchool) {
      setSchoolDetails(fileterSchool);
      localStorage.setItem("SchoolDetails", JSON.stringify(fileterSchool));
      localStorage.setItem("SchoolID", selectedSchoolId);
      toast.success(`Assigned School: ${fileterSchool?.schoolName}`);
      setSelectedSchoolId(null);




     
      // try {
        // setSchoolId(selectedSchoolId?selectedSchoolId:SchoolID);
      


    }
  };

  useEffect(()=>{
    const fileterSchooldata= response?.assignedSchools?.filter((val)=>val?.schoolId=== selectedSchoolId)
    if(fileterSchooldata){
     console.log("fileterSchooldata",fileterSchooldata)
     setSchoolDetails(fileterSchooldata[0])
    }
  },[SchoolID])
  const getStudent = async () => {
    if (!SchoolID) return;
    setIsLoader(true);
    try {
      const response = await thirdpartyadmissions(SchoolID);
      if (response.success) {
        setStudent(response);
      }
    } catch (error) {
      console.log("error", error);
    } finally {
      setIsLoader(false);
    }
  };

  useEffect(() => {
    if (SchoolID) {
      getStudent();
    }
  }, [SchoolID]);

  const studentdata = student?.data
    ?.filter((val) => val?.studentImage?.url)
    ?.map((val) => val.studentImage.url);

  const details = [
    {
      name: "STUDENTS",
      Count: student?.count || 0,
      logo: "student",
    },
    {
      name: "With Photo",
      Count: studentdata?.length || 0,
      logo: "teacherlogo",
    },
    {
      name: "Without Photo",
      Count: (student?.count || 0) - (studentdata?.length || 0),
      logo: "teacherlogo",
    },
  ];

  if (!response) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  const { assignedSchools } = response;

  return (
    <div className="sm:mt-20 mt-20 md:mt-0 dark:bg-main-dark-bg">
      <div className="divide-y divide-gray-200">
        <div className="text-base leading-6 space-y-2 text-gray-700 sm:text-lg sm:leading-7">
          <div>
            <select
              id="schoolSelect"
              onChange={handleSchoolChange}
              value={selectedSchoolId || ""}
              className="shadow cursor-pointer appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">-- Select School --</option>
              {assignedSchools?.map((school) => (
                <option key={school.schoolId} value={school.schoolId}>
                  {school.schoolName}
                </option>
              ))}
            </select>
          </div>

          {selectedSchoolId && (
            <button
              onClick={handleRedirect}
              className="shadow bg-[#2fa7db] text-white border rounded w-full py-2 px-3 mt-2 focus:outline-none focus:shadow-outline"
            >
              Go to School
            </button>
          )}
        </div>
      </div>
      <h1 className="text-white text-center py-1 "
      style={{background:currentColor}}
      >Selected School : {SchoolDetail?.schoolName}</h1>
      <div className="grid grid-cols-1 gap-2 mt-4 sm:grid-cols-2 lg:grid-cols-4">
       
        {details.map((val, idx) => (
          <div
            key={idx}
            className="p-4 transition-shadow border rounded-lg shadow-sm hover:shadow-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col space-y-2">
                <span className="text-[#33ace0] font-bold">{val?.name}</span>
                <span className="text-lg font-semibold text-[#f05a28]">
                  {val?.Count}
                </span>
              </div>
              <div className="rounded-md">
                <img src={val?.logo} alt="" className="h-20" />
              </div>
            </div>
          </div>
        ))}
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
