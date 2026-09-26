import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Briefcase,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Bell,
  AlertTriangle,
} from "lucide-react";
import Loader from "../components/common/Loader.jsx";
import { getStatusColor, getStatusLabel } from "../utils/statusUtils.js";
import { formatDate } from "../utils/dateUtils.js";
import { getInitials, timeAgo } from "../utils/formatUtils.js";
import { instructorService } from "../services/instructorService.js";

const InstructorDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [instructor, setInstructor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await instructorService.getInstructorById(id);
        setInstructor(res.data);
      } catch {
        navigate("/instructors");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (isLoading)
    return (
      <>
        <Loader />
      </>
    );
  if (!instructor) return null;

  const {
    name,
    email,
    designation,
    profileImage,
    isActive,
    lastLoginAt,
    assignments = [],
  } = instructor;

  const published = assignments.filter(
    (a) => a.contentId?.status === "PUBLISHED",
  );
  const overdue = assignments.filter((a) => a.deadlineState === "OVERDUE");
  const pending = assignments.filter(
    (a) => !["PUBLISHED", "APPROVED"].includes(a.contentId?.status),
  );

  return (
    <>
      {/* Back */}
      <button
        onClick={() => navigate("/instructors")}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Instructors
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6">
          <div className="flex flex-col items-center text-center mb-6">
            {profileImage?.url ? (
              <img
                loading="lazy"
                src={profileImage.url}
                alt={name}
                className="w-20 h-20 rounded-full object-cover ring-4 ring-primary-100 mb-3"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ring-4 ring-primary-100 mb-3">
                <span className="text-white text-2xl font-bold">
                  {getInitials(name)}
                </span>
              </div>
            )}
            <h2 className="text-xl font-bold text-slate-900">{name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{designation}</p>
            <span
              className={`badge mt-2 ${isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Briefcase className="w-4 h-4 text-slate-400" />
              <span>{designation}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>
                Last Active: {lastLoginAt ? timeAgo(lastLoginAt) : "Never"}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-100">
            {[
              {
                label: "Total",
                value: assignments.length,
                icon: Calendar,
                color: "text-slate-700",
              },
              {
                label: "Published",
                value: published.length,
                icon: CheckCircle2,
                color: "text-green-600",
              },
              {
                label: "Pending",
                value: pending.length,
                icon: Clock,
                color: "text-amber-600",
              },
              {
                label: "Overdue",
                value: overdue.length,
                icon: AlertCircle,
                color: "text-red-500",
              },
            ].map(({ label, value, icon: Icon, color }) => (
              <div
                key={label}
                className="text-center p-3 rounded-xl bg-slate-50"
              >
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                <p className={`text-xl font-bold ${color}`}>{value}</p>
                <p className="text-xs text-slate-400">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Assignment History */}
        <div className="xl:col-span-2">
          <div className="card p-6">
            <h3 className="section-title mb-4">Content History</h3>
            {assignments.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No content assigned yet.
              </p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {assignments.map((a) => (
                  <div
                    key={a._id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-slate-800 text-sm">
                          {a.contentId?.title || "Unknown Content"}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {a.contentId?.contentType} ·{" "}
                          {formatDate(a.assignedAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`badge ${getStatusColor(a.contentId?.status)}`}
                        >
                          {getStatusLabel(a.contentId?.status)}
                        </span>
                      </div>
                    </div>
                    {a.deadline && (
                      <p
                        className={`text-xs mt-2 font-medium ${
                          a.deadlineState === "OVERDUE"
                            ? "text-red-500"
                            : a.deadlineState === "DUE_TODAY"
                              ? "text-amber-600"
                              : "text-slate-500"
                        }`}
                      >
                        Deadline: {formatDate(a.deadline)}
                        {a.deadlineState === "OVERDUE" && (
                          <span className="inline-flex items-center gap-1">
                            {" "}
                            · <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                        {a.deadlineState === "DUE_TODAY" && (
                          <span className="inline-flex items-center gap-1">
                            {" "}
                            · <Bell className="w-3 h-3" /> Due Today
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default InstructorDetails;
