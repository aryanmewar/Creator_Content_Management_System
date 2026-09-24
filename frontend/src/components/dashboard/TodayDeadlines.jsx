import React from "react";
import { Clock, ChevronRight, PartyPopper } from "lucide-react";
import { Link } from "react-router-dom";
import {
  getStatusColor,
  getStatusLabel,
  getPriorityColor,
} from "../../utils/statusUtils.js";
import { getInitials, truncate } from "../../utils/formatUtils.js";

const TodayDeadlines = ({ deadlines = [] }) => {
  if (!deadlines.length) {
    return (
      <div className="card p-6">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Today's Deadlines
        </h3>
        <p className="text-sm text-slate-400 text-center py-8 flex items-center justify-center gap-1.5">
          No deadlines today <PartyPopper className="w-4 h-4 text-amber-500" />
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          Today's Deadlines
          <span className="badge bg-amber-100 text-amber-700 ml-1">
            {deadlines.length}
          </span>
        </h3>
      </div>

      <div className="space-y-3">
        {deadlines.map((assignment) => (
          <div
            key={assignment._id}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
          >
            {/* Instructor avatar */}
            <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
              {assignment.instructorId?.profileImage?.url ? (
                <img
                  src={assignment.instructorId.profileImage.url}
                  alt=""
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <span className="text-primary-700 text-xs font-semibold">
                  {getInitials(assignment.instructorId?.name || "I")}
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {assignment.contentId?.title || "Untitled"}
              </p>
              <p className="text-xs text-slate-500">
                {assignment.instructorId?.name} ·{" "}
                {assignment.contentId?.contentType}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TodayDeadlines;
