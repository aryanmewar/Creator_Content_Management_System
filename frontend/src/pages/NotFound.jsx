import React from "react";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const NotFound = () => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div className="text-center">
      <div className="text-8xl font-black text-primary-200 mb-4">404</div>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Page not found</h1>
      <p className="text-slate-500 mb-6">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link to="/" className="btn btn-primary">
        <Home className="w-4 h-4" />
        Go to Dashboard
      </Link>
    </div>
  </div>
);

export default NotFound;
