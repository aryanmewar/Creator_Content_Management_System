import React from "react";
import { Globe, ExternalLink } from "lucide-react";
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
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50"
          >
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
            <a
              href={pub.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentPublished;
