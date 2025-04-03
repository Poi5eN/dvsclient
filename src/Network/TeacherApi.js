import { apiUrls } from './ApiEndpoints';
import makeApiRequest from './makeApiRequest'; // Provide the correct path

export const getAllStudents = async (param) => {
    try {
      const option = {
        method: "GET", // Ensure the method is GET
      };
      const data = await makeApiRequest(`${apiUrls?.getAllStudents}?class=${param?.class}&section=${param?.section}&status=active`, option);
      return data;
    } catch (error) {
      console.error("Error fetching registrations:", error);
      throw error; // Re-throw the error to allow the component to handle it.
    }
  };
export const marksmarks = async (param) => {
    try {
      const option = {
        method: "GET", // Ensure the method is GET
      };
      const data = await makeApiRequest(`${apiUrls?.marksmarks}?className=${param?.class}&section=${param?.section}`, option);
      return data;
    } catch (error) {
      console.error("Error fetching registrations:", error);
      throw error; // Re-throw the error to allow the component to handle it.
    }
  };

  export const getAdminRouteExams = async (param) => {
    try {
      const option = {
        method: "GET", // Ensure the method is GET
      };
      const data = await makeApiRequest(`${apiUrls?.adminRouteexams}?className=${param?.class}&section=${param?.section}`, option);
      return data;
    } catch (error) {
      console.error("Error fetching registrations:", error);
      throw error; // Re-throw the error to allow the component to handle it.
    }
  };

  export const createAttendance = async (payload) => {
    try {
      const option = {
        method: "POST",
        payloadData: payload// Ensure the method is GET
      };
      const data = await makeApiRequest(`${apiUrls.createAttendance}`, option);
      return data;
    } catch (error) {
      console.error(error, "Something Went Wrong");
    }
  };