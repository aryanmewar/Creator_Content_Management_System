import React from "react";
import { Globe } from "lucide-react";
import { formatDate } from "../../utils/dateUtils.js";
import { getPlatformColor } from "../../utils/statusUtils.js";

const RecentPublished = ({ publications = [] }) => {
  if (!publications.length) {
    return (
      <div className="card p-6">
        <h3 className="section-title flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-green-500" />
          Recently Published
        </h3>
        <p className="text-sm text-slate-400 text-center py-6">
          No publications yet
        </p>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="section-title flex items-center gap-2 mb-4">
        <Globe className="w-5 h-5 text-green-500" />
        Recently Published
      </h3>

      <div className="space-y-3">
        {publications.map((pub) => (
          <div
            key={pub._id}
            className="group flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-white hover:from-emerald-50/80 hover:to-white border border-slate-100 hover:border-emerald-200 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-800 truncate">
                {pub.contentId?.title || "Untitled"}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`badge ${getPlatformColor(pub.platform)}`}>
                  {pub.platform}
                </span>
                <span className="text-xs text-slate-400">
                  {formatDate(pub.publishedAt)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPublished;
