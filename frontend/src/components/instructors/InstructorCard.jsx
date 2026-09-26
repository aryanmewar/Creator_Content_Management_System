import React from "react";
import { useNavigate } from "react-router-dom";
import { Mail, PowerOff, Edit, Eye, Trash2 } from "lucide-react";
import { getInitials } from "../../utils/formatUtils.js";

const InstructorCard = ({ instructor, onEdit, onToggleStatus, onDelete }) => {
  const navigate = useNavigate();
  const { _id, name, email, designation, profileImage, isActive, stats } =
    instructor;

  return (
    <div
      onClick={() => navigate(`/instructors/${_id}`)}
      className="card p-5 hover:shadow-card-hover transition-all duration-200 group cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="relative">
            {profileImage?.url ? (
              <img
                loading="lazy"
                src={profileImage.url}
                alt={name}
                className="w-12 h-12 rounded-full object-cover ring-2 ring-slate-100"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center ring-2 ring-slate-100">
                <span className="text-white font-bold text-sm">
                  {getInitials(name)}
                </span>
              </div>
            )}
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white ${isActive ? "bg-green-500" : "bg-slate-400"}`}
            />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 text-sm">{name}</h3>
            <p className="text-xs text-slate-500">
              {designation || "Instructor"}
            </p>
          </div>
        </div>

        <span
          className={`badge ${isActive ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      </div>

      {/* Email */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <Mail className="w-3.5 h-3.5" />
        <span className="truncate">{email}</span>
      </div>

      {/* Actions */}
      <div
        className="flex gap-2 pt-3 border-t border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => onEdit(instructor)}
          className="btn btn-secondary btn-sm flex-1"
        >
          <Edit className="w-3.5 h-3.5" />
          Edit
        </button>
        <button
          onClick={() => onToggleStatus(instructor)}
          className={`btn btn-sm px-2 ${isActive ? "btn-ghost text-amber-500 hover:bg-amber-50" : "btn-ghost text-green-600 hover:bg-green-50"}`}
          title={isActive ? "Deactivate" : "Activate"}
        >
          <PowerOff className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(instructor)}
          className="btn btn-sm px-2 btn-ghost text-red-500 hover:bg-red-50"
          title="Remove"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default InstructorCard;
