import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import Loader from "../components/common/Loader.jsx";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <Loader fullScreen text="Authenticating..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (
    allowedRoles &&
    user &&
    user.role !== "SUPER_ADMIN" &&
    !allowedRoles.includes(user.role)
  ) {
    // Redirect logic if role is not authorized
    return (
      <Navigate
        to={user.role === "CONTRIBUTOR" ? "/my-dashboard" : "/"}
        replace
      />
    );
  }

  return <Outlet />;
};

export default ProtectedRoute;
