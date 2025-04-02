import { Navigate } from "react-router-dom";

const Authenticated = ({ children }) => {
  const token = localStorage.getItem("userData");
  console.log("token first authenticateed",token)
  return token ? children : <Navigate to="/login" replace />;
};
export default Authenticated;
