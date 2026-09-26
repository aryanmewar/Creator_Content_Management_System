import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
} from "date-fns";
import Loader from "../components/common/Loader.jsx";
import { scheduleService } from "../services/scheduleService.js";
import { contentService } from "../services/contentService.js";
import { getPlatformColor } from "../utils/statusUtils.js";
import { formatTime12Hour } from "../utils/dateUtils.js";
import { PLATFORMS } from "../utils/constants.js";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import Select from "../components/common/Select.jsx";
import { Badge } from "@/components/ui/badge";

const Schedule = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvedContent, setApprovedContent] = useState([]);
  const [form, setForm] = useState({
    contentId: "",
    platform: "",
    scheduledDate: "",
    scheduledTime: "09:00",
  });
  const [formLoading, setFormLoading] = useState(false);

  const loadSchedules = async (date) => {
    setIsLoading(true);
    try {
      const [res, contentRes] = await Promise.all([
        scheduleService.getSchedules({
          month: date.getMonth() + 1,
          year: date.getFullYear(),
          limit: 200,
        }),
        contentService.getContent({ status: "SCHEDULED", limit: 200 }),
      ]);

      const realSchedules = res.data || [];
      const scheduledContentList = contentRes.data || [];

      const mappedContents = scheduledContentList
        .filter((c) => {
          if (!c.scheduledDate) return false;
          const d = new Date(c.scheduledDate);
          return (
            d.getMonth() === date.getMonth() &&
            d.getFullYear() === date.getFullYear()
          );
        })
        .map((c) => {
          let cType = Array.isArray(c.contentType)
            ? c.contentType[0]
            : c.contentType;
          if (cType === "Others" && c.otherContentType)
            cType = c.otherContentType;

          return {
            _id: `content-${c._id}`,
            contentId: c,
            platform: cType || "General",
            scheduledDate: c.scheduledDate,
            scheduledTime: c.scheduledTime || "",
            status: "SCHEDULED",
          };
        });

      setSchedules([...realSchedules, ...mappedContents]);
    } catch (err) {
      console.error("Failed to load schedules:", err);
      toast.error(
        err.response?.data?.message ||
          err.message ||
          "Failed to load schedules.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules(currentDate);
    contentService.getContent({ status: "APPROVED", limit: 100 }).then((r) => {
      setApprovedContent(r.data || []);
    });
  }, [currentDate]);

  const handleSchedule = async () => {
    setFormLoading(true);
    try {
      await scheduleService.createSchedule(form);
      toast.success("Content scheduled!");
      setIsModalOpen(false);
      setForm({
        contentId: "",
        platform: "",
        scheduledDate: "",
        scheduledTime: "09:00",
      });
      await loadSchedules(currentDate);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to schedule content.");
    } finally {
      setFormLoading(false);
    }
  };

  const prevMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () =>
    setCurrentDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const firstDayOfWeek = monthStart.getDay();
  const paddedDays = Array(firstDayOfWeek).fill(null).concat(days);

  const getSchedulesForDay = (day) =>
    schedules.filter((s) => isSameDay(new Date(s.scheduledDate), day));

  return (
    <>
      <Card className="p-6 mb-6 border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h3 className="text-lg font-semibold text-slate-900">
            {format(currentDate, "MMMM yyyy")}
          </h3>
          <Button variant="ghost" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        <div className="w-full">
          <div className="w-full">
            <div className="grid grid-cols-7 mb-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-slate-500 py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {isLoading ? (
              <Loader />
            ) : (
              <div className="grid grid-cols-7 gap-1">
                {paddedDays.map((day, idx) => {
                  if (!day)
                    return <div key={`empty-${idx}`} className="h-24" />;

                  const daySchedules = getSchedulesForDay(day);
                  const inMonth = isSameMonth(day, currentDate);
                  const todayFlag = isToday(day);

                  return (
                    <div
                      key={day.toISOString()}
                      className={`h-24 p-1.5 rounded-xl border transition-colors ${
                        !inMonth ? "opacity-40" : ""
                      } ${todayFlag ? "border-primary bg-primary/5" : "border-slate-100 hover:border-slate-200 hover:bg-slate-50"}`}
                    >
                      <div
                        className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
                          todayFlag
                            ? "bg-primary text-primary-foreground"
                            : "text-slate-700"
                        }`}
                      >
                        {format(day, "d")}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {daySchedules.slice(0, 3).map((s) => (
                          <div
                            key={s._id}
                            className={`text-[10px] px-1.5 py-0.5 rounded font-medium truncate ${getPlatformColor(s.platform)}`}
                            title={`${s.contentId?.title} on ${s.platform} at ${s.scheduledTime ? formatTime12Hour(s.scheduledTime) : ""}`}
                          >
                            {s.scheduledTime
                              ? formatTime12Hour(s.scheduledTime)
                              : ""}{" "}
                            {s.contentId?.title}
                          </div>
                        ))}
                        {daySchedules.length > 3 && (
                          <div className="text-[10px] text-muted-foreground pl-1 font-medium">
                            +{daySchedules.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          This Month's Schedule
        </h3>
        {(() => {
          const currentMonthSchedules = schedules.filter((s) => {
            const d = new Date(s.scheduledDate);
            return (
              d.getMonth() === currentDate.getMonth() &&
              d.getFullYear() === currentDate.getFullYear()
            );
          });

          return currentMonthSchedules.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              No schedules this month.
            </p>
          ) : (
            <div className="space-y-2">
              {currentMonthSchedules.map((s) => (
                <div
                  key={s._id}
                  className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 border border-transparent transition-colors"
                >
                  <Badge
                    variant="outline"
                    className={`font-bold uppercase tracking-wider text-[10px] ${getPlatformColor(s.platform)}`}
                  >
                    {s.platform}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">
                      {s.contentId?.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(s.scheduledDate), "MMM d, yyyy")}
                      {s.scheduledTime
                        ? ` at ${formatTime12Hour(s.scheduledTime)}`
                        : ""}
                    </p>
                  </div>
                  <Badge
                    variant="secondary"
                    className={`${s.status === "PUBLISHED" ? "bg-emerald-100 text-emerald-700" : "bg-sky-100 text-sky-700"}`}
                  >
                    {s.status}
                  </Badge>
                </div>
              ))}
            </div>
          );
        })()}
      </Card>

      <Dialog
        open={isModalOpen}
        onOpenChange={(open) => !open && setIsModalOpen(false)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Content</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {approvedContent.length === 0 ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-sm text-amber-700 font-medium">
                No approved content available. Content must be in APPROVED
                status before scheduling.
              </div>
            ) : (
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">
                  Content <span className="text-destructive">*</span>
                </label>
                <Select
                  value={form.contentId}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, contentId: e.target.value }))
                  }
                  options={approvedContent.map((c) => ({
                    label: c.title,
                    value: c._id,
                  }))}
                  placeholder="Select content..."
                  className="w-full"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-sm font-semibold">
                Platform <span className="text-destructive">*</span>
              </label>
              <Select
                value={form.platform}
                onChange={(e) =>
                  setForm((f) => ({ ...f, platform: e.target.value }))
                }
                options={PLATFORMS.map((p) => ({ label: p, value: p }))}
                placeholder="Select platform..."
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">
                  Date <span className="text-destructive">*</span>
                </label>
                <Input
                  type="date"
                  value={form.scheduledDate}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledDate: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold">
                  Time <span className="text-destructive">*</span>
                </label>
                <Input
                  type="time"
                  value={form.scheduledTime}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, scheduledTime: e.target.value }))
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSchedule}
              disabled={
                !form.contentId ||
                !form.platform ||
                !form.scheduledDate ||
                formLoading
              }
            >
              {formLoading ? "Scheduling..." : "Schedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Schedule;
