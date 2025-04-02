import axios from "axios";

const authToken = localStorage.getItem("token");

export const teacherApi = async (email) => {
  const tachapi = await axios.get(
    `https://dvsserver.onrender.com/api/v1/adminRoute/getTeachers?email=${email}`,
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return tachapi;
};

export const getAllStudent = () => {
  const numberOfStudent = axios.get(
    "https://dvsserver.onrender.com/api/v1/adminRoute/getAllStudents",
    {
      withCredentials: true,
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  return numberOfStudent;
};
