import { Navigate } from "react-router-dom";

const Guest = ({ children }) => {
  const token = localStorage.getItem("userData");
console.log("token first guest",token)
  return token ? <Navigate to="/dashboard" replace /> : children;
};
export default Guest;
