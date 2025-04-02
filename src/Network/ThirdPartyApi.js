


import { apiUrls } from './ApiEndpoints';
import makeApiRequest from './makeApiRequest'; // Provide the correct path


export const thirdpartyadmissions = async (SchoolID) => {
  
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls?.thirdpartyadmissions}?schoolId=${SchoolID}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};	

export const getSudent = async (SchoolID) => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls?.thirdpartyadmissions}?schoolId=${SchoolID}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};	
export const thirdpartyclasses = async (SchoolID) => {
  try {
    const option = {
      method: "GET", // Ensure the method is GET
    };
    const data = await makeApiRequest(`${apiUrls?.thirdpartyclasses}?schoolId=${SchoolID}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};	
export const thirdpartymystudents = async (studentId,studentData) => {
  try {
    const option = {
      method: "put", // Ensure the method is GET
      payloadData: studentData
    };
    const data = await makeApiRequest(`${apiUrls?.thirdpartymystudents}${studentId}`, option);
    return data;
  } catch (error) {
    console.error("Error fetching registrations:", error);
    throw error; // Re-throw the error to allow the component to handle it.
  }
};	








// export const ThirdpartyGetAllStudent = async () => {
//   try {
//     const option = {
//       method: "GET", // Ensure the method is GET
//     };
//     const data = await makeApiRequest(`${apiUrls.getAllstudents}/filter?schoolId=076e7a68-9190-4616-8bab-3247ab55ac91&studentClass=10&studentSection=A&page=1&limit=10`, option);
//     return data;
//   } catch (error) {
//     console.error(error, "Something Went Wrong");
//   }
// };















export const Admission = async (payload) => {
  try {
    const option = {
        method: "POST",
        payloadData: payload// Ensure the method is GET
      };
    const data = await makeApiRequest(`${apiUrls?.thirdpartyadmissions}`, option);
    return data;
  } catch (error) {
    console.error(error, "Something Went Wrong");
  }
};

// export const StudentCreateRegistrations = async (payload) => {
//   try {
//     const option = {
//       method: "POST",
//       payloadData: payload// Ensure the method is GET
//     };
//     const data = await makeApiRequest(`${apiUrls.createRegistrations}`, option);
//     return data;
//   } catch (error) {
//     console.error(error, "Something Went Wrong");
//   }
// };
// export const StudentDeleteRegistrations = async (registrationNumber) => {
//   console.log("registrationNumber",registrationNumber)
//   try {
//     const option = {
//       method: "delete",
//       // payloadData: payload// Ensure the method is GET
//     };
//     const data = await makeApiRequest(`${apiUrls.deleteRegistrations}/${registrationNumber}`, option);
//     return data;
//   } catch (error) {
//     console.error(error, "Something Went Wrong");
//   }
// };

