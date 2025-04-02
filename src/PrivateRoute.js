import React from "react";
import { Route, Navigate } from "react-router-dom";

const PrivateRoute = ({ element, role, isLoggedIn }) => {
  if (isLoggedIn && isLoggedIn === role) {
    return <Route element={element} />;
  } else {
    return <Navigate to="/login" />;
  }
};

export default PrivateRoute;
