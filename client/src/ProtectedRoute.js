import React from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.user.user); // Get the user from Redux

  if (!user) {
    // If the user is not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // If the user's role is not allowed, redirect to an unauthorized page or home
    return <Navigate to="/home" replace />;
  }

  // If the user is authenticated and has the required role, render the children
  return children;
};

export default ProtectedRoute;
