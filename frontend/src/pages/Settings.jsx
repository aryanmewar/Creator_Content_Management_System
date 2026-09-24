import React from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import useAuth from "../hooks/useAuth.js";
import { getInitials } from "../utils/formatUtils.js";
import { User, Shield, Database } from "lucide-react";

const Settings = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Profile
          </h3>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-700 text-lg font-bold">
                {getInitials(user?.name || "U")}
              </span>
            </div>
            <div>
              <p className="font-semibold text-slate-900">{user?.name}</p>
              <p className="text-sm text-slate-500">{user?.email}</p>
              <span className="badge bg-primary-100 text-primary-700 mt-1">
                {user?.role?.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-primary" />
            System Info
          </h3>
          <div className="space-y-3">
            {[
              { label: "Application", value: "Createlyt CMS" },
              { label: "Version", value: "1.0.0" },
              { label: "Backend", value: "Node.js + Express + MongoDB" },
              { label: "Frontend", value: "React + Vite + Tailwind CSS" },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0"
              >
                <span className="text-sm text-slate-500">{label}</span>
                <span className="text-sm font-medium text-slate-800">
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Security Info */}
        <div className="card p-6">
          <h3 className="section-title mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </h3>
          <div className="p-4 rounded-xl bg-green-50 border border-green-200">
            <p className="text-sm text-green-700 font-medium">
              Security Features Active
            </p>
            <ul className="text-xs text-green-600 mt-2 space-y-1 list-disc list-inside">
              <li>JWT Authentication with 7-day expiry</li>
              <li>bcrypt password hashing (12 rounds)</li>
              <li>Role Based Access Control (RBAC)</li>
              <li>Rate limiting (100 req/15min)</li>
              <li>CORS protection</li>
              <li>Helmet security headers</li>
              <li>Input validation (Zod)</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Settings;
