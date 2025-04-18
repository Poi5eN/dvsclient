


// import { useStateContext } from '../contexts/ContextProvider';
import { apiUrls } from './ApiEndpoints';
import makeApiRequest from './makeApiRequest'; // Provide the correct path

//  const { currentColor ,setIsLoader} = useStateContext();

// Class Start
export const login = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.login}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

export const updateAdmin = async (payload) => {
  try {
    const option = {
      method: "put", // Ensure the method is GET
      payloadData: payload
    };
    const data = await makeApiRequest(`${apiUrls?.updateAdmin}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};	
export const editBulkstudentparent = async (payload) => {
  try {
    const option = {
      method: "put", // Ensure the method is GET
      payloadData: payload
    };
    const data = await makeApiRequest(`${apiUrls?.editBulkstudentparent}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};	
export const getAdminInfo = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls?.getAdminInfo}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};
export const loginTeachers = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls?.getTeachers}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};
export const createClass = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.classData}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const promotionOfStudent = async (payload) => {
  try {
    const option = {
      method: "PUT",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.promotionOfStudent}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

// export const getStudentsBySession = async ({ session }) => {
//   try {
//     const url = `https://dvsserver.onrender.com/api/v1/adminRoute/getStudentsBySession?session=${encodeURIComponent(session)}`;
//     console.log("API URL:", url); // Debug log
//     const response = await fetch(url, {
//       method: "GET",
//       headers: {
//         'Authorization': `Bearer ${localStorage.getItem('token')}`, // Ensure token is present
//         'Content-Type': 'application/json',
//       },
//     });
//     const data = await response.json();
//     console.log("API response:", data); // Debug log
//     return data;
//   } catch (error) {
//     console.error("Error in getStudentsBySession:", error);
//     throw error; // Re-throw to handle in the calling function
//   }
// };
export const getStudentsBySession = async ({ session }) => {
  try {
    const url = 'https://dvsserver.onrender.com/api/v1/adminRoute/getStudentsBySession';
    console.log("Sending POST request to:", url, "with session:", session); // Debug log
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session }) // Send session in body
    });
    const data = await response.json();
    console.log("API response:", data); // Debug log
    return data;
  } catch (error) {
    console.error("Error in getStudentsBySession:", error);
    throw error;
  }
};

export const createteacher = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.teacherapi}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

// Admission  start 

export const GetAdmissions = async (payload) => {
  try {
    const option = {
      method: "get",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.studentparent}?fetchNewAdmissions=true`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const adminapproveAdmissions = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRouteapproveAdmissions}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
// Admission  end


// Class End
// Registration Start


export const StudentgetRegistrations = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(apiUrls?.getRegistrations, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};
export const getAllTeachers = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(apiUrls?.getTeachers, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};






export const getAllStudents = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls?.getAllStudents}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};
export const adminpendingAdmissions = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(apiUrls?.adminRoutependingAdmissions, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};
export const getStudentAndParent = async (email) => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls?.getStudentAndParent}/${email}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};

// export const StudentgetRegistrations = async () => {
//   try {
//     const option = {
//       method: "GET", // Ensure the method is GET
//     };
//     const data = await makeApiRequest(`${apiUrls?.getRegistrations}`, option);
//     return data;
//   } catch (error) {
//     console.error(error, "Something Went Wrong");
//   }
// };


export const StudentCreateRegistrations = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.createRegistrations}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

export const StudentDeleteRegistrations = async (registrationNumber) => {
  console.log("registrationNumber",registrationNumber)
  try {
    const option = {
      method: "delete",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.deleteRegistrations}/${registrationNumber}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const createBulkRegistrations = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutecreateBulkRegistrations}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};



// Registration End

// Admission Start 
export const ActiveStudents = async () => {

  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.getLastYearStudent}?status=active`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const adminThirdPartystudents = async () => {

  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRouteThirdPartystudents}/filter?schoolId=076e7a68-9190-4616-8bab-3247ab55ac91`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const createBulkStudentParent = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutecreateBulkStudentParent}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

export const createStudentParent = async (payload) => {
  
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.createStudentParent}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

export const admissionbulk = async (payload) => {
  
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.admissionbulk}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

export const editStudentParent = async (_id,payload) => {
  try {
    const option = {
      method: "put", // Ensure the method is GET
      payloadData: payload
    };
    const data = await makeApiRequest(`${apiUrls?.editStudentParent}/${_id}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};	
export const studentsStatus = async (_id) => {
  try {
    const option = {
      method: "put", // Ensure the method is GET
      // payloadData: payload
    };
    const data = await makeApiRequest(`${apiUrls?.adminRoutestudents}/${_id}/toggle`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};	
export const editTeacher = async (_id,payload) => {
  try {
    const option = {
      method: "put", // Ensure the method is GET
      payloadData: payload
    };
    const data = await makeApiRequest(`${apiUrls?.getTeachers}/${_id}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};	

// Admission End 


export const AdminGetAllClasses = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.classData}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const GetClassebyID = async (ID) => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.classData}/${ID}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const deleteClassebyID = async (ID) => {
  try {
    const option = {
      method: "DELETE", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.classData}/${ID}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const editClassebyID = async (payload,ID) => {
  try {
    const option = {
      method: "PUT", // Ensure the method is GET
      payloadData: payload
    };
    const data = await makeApiRequest(`${apiUrls.classData}/${ID}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};


// exam Start 

export const createExam = async (payload) => {
  // console.log("payload",payload)
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.createExam}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const examresult = async (studentId) => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    // const data = await makeApiRequest(`${apiUrls?.examresult}`, option);
    const data = await makeApiRequest(`${apiUrls?.examresult}/${studentId}/report`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};
export const updateReportCard = async (payload,studentId) => {
  try {
    const option = {
      method: "put", // Ensure the method is GET
      payloadData: payload
    };
    // const data = await makeApiRequest(`${apiUrls?.examresult}`, option);
    const data = await makeApiRequest(`${apiUrls?.examresult}/${studentId}/report`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};
export const Allexamresult = async (selectedClass,selectedSection) => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    // const data = await makeApiRequest(`${apiUrls?.examresult}`, option);
    // exam/results/class-report?className=7&section=A
    const data = await makeApiRequest(`${apiUrls?.allexamresult}/class-report?className=${selectedClass}&section=${selectedSection}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};
export const marksmarksbulkupload = async (payload) => {
  // console.log("payload",payload)
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.marksmarksbulkupload}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const getAdminRouteExams = async () => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls?.adminRouteexams}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};
export const deleteExam = async (examId) => {
  try {
    const option = {
      method: "DELETE", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls?.deleteexams}/${examId}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};


export const updateExam = async (payload,ID) => {
  try {
    const option = {
      method: "PUT", // Ensure the method is GET
      payloadData: payload
    };
    const data = await makeApiRequest(`${apiUrls.marksmarks}/${ID}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
// exam End



// Fees start 

export const PastDues = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.feesaddPastDues}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const Latefine = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutefine}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const adminRoutefeesregular = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutefeesregular}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const feesadditional = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.feesadditional}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const cancelFeePayment = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.cancelFeePayment}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};



export const feescreateFeeStatus = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.feescreateFeeStatus}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};


export const feescreateUnifiedFeeStatus = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload,
    };
    const data = await makeApiRequest(`${apiUrls.feescreateUnifiedFeeStatus}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
    throw error; // Rethrow to allow caller to handle
  }
};




export const fetchFeeReceipt = async (feeReceiptNumber) => {
  try {
    const option = {
      method: "GET",
      params: { feeReceiptNumber }, // Pass as URL param
    };
    const data = await makeApiRequest(
      `${apiUrls.fetchFeeReceipt}/${feeReceiptNumber}`,
      option
    );
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
    throw error;
  }
};



export const createStudentSpecificFee = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.createStudentSpecificFee}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const linkStudentToParent = async (payload) => {
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.linkStudentToParent}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const getStudentSpecificFee = async (ID,session) => {
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.getStudentSpecificFee}?studentId=${ID}&session=${session}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const getStudentFeeInfo = async (ID,session) => {
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.getStudentFeeInfo}?studentId=${ID}&session=${session}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const getfees = async (payload) => {
  try {
    const option = {
      method: "GET",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutefees}?additional=false`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const getMonthlyDues = async (studentId,session) => {
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.feesgetMonthlyDues}?studentId=${studentId}&session=${session}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

export const LateFines= async (payload) => {
  try {
    const option = {
      method: "GET",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutefees}/all?onlyLateFines=true`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const AllStudentsFeeStatus= async (payload) => {
  try {
    const option = {
      method: "GET",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.getAllStudentsFeeStatus}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const getAdditionalfees = async (payload) => {
  try {
    const option = {
      method: "GET",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutefees}?additional=true`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const feesfeeHistory = async () => {
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.feesfeeHistory}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const parentandchildwithID = async (ID) => {
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.parentandchild}/${ID}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const parentandchild = async (ID) => {
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.parentandchild}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const feeIncomeMonths = async (ID) => {
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.feeIncomeMonths}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const deletefees = async (payload) => {
  try {
    const option = {
      method: "DELETE",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutefees}/${payload?.id}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
// Fees End


// library start 
export const createbooklibrary = async (payload) => {
  // setIsLoader(true)
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.createbooklibrary}`, option);
    // setIsLoader(false)
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
// library end


// employee start .
export const adminRoutestaff = async (payload) => {
  // setIsLoader(true)
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutestaff}`, option);
    // setIsLoader(false)
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const getstaff = async () => {
  // setIsLoader(true)
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutestaff}`, option);
    // setIsLoader(false)
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const getstaffBYID = async (ID) => {
  // setIsLoader(true)
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutestaff}?staffId=${ID}`, option);
    // setIsLoader(false)
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const editStaff = async (payload,ID) => {
  // setIsLoader(true)
  try {
    const option = {
      method: "PUT",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutestaff}/${ID}`, option);
    // setIsLoader(false)
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const editFees = async (payload,ID) => {
  // setIsLoader(true)
  try {
    const option = {
      method: "PUT",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutefees}/${ID}`, option);
    // setIsLoader(false)
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
// employee end



  // inventory start
export const adminRouteinventory = async (payload) => {
  // setIsLoader(true)
  try {
    const option = {
      method: "POST",
      payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRouteinventory}`, option);
    // setIsLoader(false)
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const getadminRouteinventory = async (payload) => {
  // setIsLoader(true)
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRouteinventory}`, option);
    // setIsLoader(false)
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};
export const adminRoutelibrary = async (payload) => {
  // setIsLoader(true)
  try {
    const option = {
      method: "GET",
      // payloadData: payload// Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls.adminRoutelibrary}`, option);
    // setIsLoader(false)
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};


// inventory end 