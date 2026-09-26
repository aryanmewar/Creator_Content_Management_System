import React from "react";
import { CalendarIcon } from "lucide-react";
import { isToday } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { getPlatformColor } from "../../utils/statusUtils.js";
import { formatTime12Hour } from "../../utils/dateUtils.js";

const TodaySchedule = ({ schedules = [] }) => {
  const todaySchedules = schedules.filter((s) =>
    isToday(new Date(s.scheduledDate)),
  );

  return (
    <div className="card p-6">
      <h3 className="section-title mb-4 flex items-center gap-2">
        <CalendarIcon className="w-5 h-5 text-primary-500" />
        Today's Schedule
        <span className="badge bg-primary-100 text-primary-700 ml-1">
          {todaySchedules.length}
        </span>
      </h3>
      <div className="space-y-3">
        {todaySchedules.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-6">
            No content scheduled for today.
          </p>
        ) : (
          todaySchedules.map((s) => (
            <div
              key={s._id}
              className="group flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-slate-50/80 to-white hover:from-primary-50/50 hover:to-white border border-slate-100 hover:border-primary-100/50 transition-all duration-300 shadow-sm hover:shadow-md relative overflow-hidden"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={`font-bold uppercase tracking-wider text-[10px] shrink-0 ${getPlatformColor(s.platform)}`}
                >
                  {s.platform}
                </Badge>
                <Badge
                  variant="secondary"
                  className={`sm:hidden ml-auto ${s.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}
                >
                  {s.status}
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">
                  {s.contentId?.title}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                  <p className="text-xs text-slate-600 font-medium truncate max-w-[150px] sm:max-w-[200px]">
                    {s.contentId?.contributors &&
                    s.contentId.contributors.length > 0
                      ? s.contentId.contributors[0].name
                      : s.contentId?.createdBy?.name || "Owner"}
                  </p>
                  <span className="text-slate-300 text-[10px] hidden sm:inline">
                    •
                  </span>
                  <p className="text-xs text-muted-foreground truncate w-full sm:w-auto">
                    Today
                    {s.scheduledTime
                      ? ` at ${formatTime12Hour(s.scheduledTime)}`
                      : ""}
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className={`hidden sm:inline-flex shrink-0 ${s.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}
              >
                {s.status}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TodaySchedule;
