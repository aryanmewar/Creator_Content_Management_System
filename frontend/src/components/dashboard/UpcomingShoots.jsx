import React from "react";
import { Calendar, CheckCircle2, Video, ExternalLink } from "lucide-react";
import { sanitizeUrl } from "../../utils/formatUtils.js";

const UpcomingShoots = ({ shoots = [] }) => {
  if (!shoots.length) {
    return (
      <div className="card p-6">
        <h3 className="section-title mb-4 flex items-center gap-2">
          <Video className="w-5 h-5 text-indigo-500" />
          Upcoming Shoots
          <span className="badge bg-indigo-100 text-indigo-700 ml-1">0</span>
        </h3>
        <p className="text-sm text-slate-400 text-center py-8">
          No upcoming shoots scheduled
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="section-title flex items-center gap-2">
          <Video className="w-5 h-5 text-indigo-500" />
          Upcoming Shoots
          <span className="badge bg-indigo-100 text-indigo-700 ml-1">
            {shoots.length}
          </span>
        </h3>
      </div>

      <div className="space-y-3">
        {shoots.map((shoot) => (
          <div
            key={shoot._id}
            className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-indigo-50/80 to-white hover:from-indigo-100/50 hover:to-white border border-indigo-100 hover:border-indigo-200 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] bg-green-100 text-green-700 font-bold tracking-wider uppercase flex items-center gap-1 border border-green-200">
                  <CheckCircle2 className="w-3 h-3" />
                  You Acknowledged
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-50 text-indigo-700 font-semibold uppercase tracking-wider">
                  {shoot.contentId?.contentType || "CONTENT"}
                </span>
              </div>
              <p className="text-sm font-semibold text-slate-800 truncate">
                {shoot.contentId?.title || "Untitled"}
              </p>
              <div className="flex items-center gap-4 mt-2">
                <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {shoot.dueDate ? new Date(shoot.dueDate).toLocaleDateString() : "No Date"}
                </p>
                {shoot.contentId?.referenceLink ? (
                  <a
                    href={sanitizeUrl(shoot.contentId.referenceLink)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium ml-2"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Reference Link
                  </a>
                ) : (
                  <span className="text-xs text-slate-400 flex items-center gap-1 font-medium ml-2">
                    <ExternalLink className="w-3 h-3 opacity-50" />
                    No Reference Link
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UpcomingShoots;
