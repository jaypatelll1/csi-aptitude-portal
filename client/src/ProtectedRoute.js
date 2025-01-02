import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.user.user); // Get the user from Redux
  const location = useLocation();

  if (!user) {
    // If the user is not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  if (location.pathname === "/reset-password") {
    if (user.status === "ACTIVE") {
      // If the user is already active, redirect to home or any other page
      return <Navigate to="/home" replace />;
    }
  } else if (!allowedRoles.includes(user.role)) {
    // If the user's role is not allowed, redirect to an unauthorized page or home
    return <Navigate to="/home" replace />;
  }

  // If the user is authenticated and has the required role, render the children
  return children;
};

export default ProtectedRoute;
