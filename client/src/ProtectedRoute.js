import React, { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = useSelector((state) => state.user.user); // Get the user from Redux
  const [isVerified, setIsVerified] = useState(null);

  useEffect(() => {
    const verifyResetToken = async () => {
      let API_BASE_URL = process.env.REACT_APP_BACKEND_BASE_URL;
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/users/verify-reset-token`,
          {
            withCredentials: true
          }
        );
        if (response.data.message === 'Token is valid') {
          setIsVerified(true);
        }
      } catch (error) {
        setIsVerified(false);
      }
    };

    if (user && user.status === "NOTACTIVE") {
      verifyResetToken();
    } else {
      setIsVerified(true);
    }
  }, [user]);

  if (isVerified === null) {
    return <div>Loading...</div>; // Show a loading state while verifying
  }

  if (!user) {
    // If the user is not logged in, redirect to login
    return <Navigate to="/" replace />;
  }

  if (user.status === "NOTACTIVE" && isVerified) {
    // Redirect to reset password page with reset token in params
    return <Navigate to={`/reset-password/${user.resetToken}`} replace />;
  }


  if (!allowedRoles.includes(user.role)) {
    // If the user's role is not allowed, redirect to an unauthorized page or home
    return <Navigate to="/home" replace />;
  }

  // If the user is authenticated and has the required role, render the children
  return children;
};

export default ProtectedRoute;