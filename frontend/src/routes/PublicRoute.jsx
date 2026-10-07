import React from "react";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import Loader from "../components/common/Loader.jsx";

const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <Loader fullScreen text="Loading..." />;
  }

  if (isAuthenticated) {
    const redirectPath =
      user?.role === "CONTRIBUTOR" ? "/my-dashboard" : "/";
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

export default PublicRoute;
