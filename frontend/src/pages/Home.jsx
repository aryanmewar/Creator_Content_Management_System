import React, { useEffect, useState } from "react";
import {
  FileText,
  CalendarCheck,
  AlertCircle,
  Clock,
  CheckCircle2,
  BarChart3,
  Activity,
  Layers,
} from "lucide-react";
import { dashboardService } from "../services/dashboardService.js";
import { scheduleService } from "../services/scheduleService.js";
import { contentService } from "../services/contentService.js";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import TodayDeadlines from "../components/dashboard/TodayDeadlines.jsx";
import TodaySchedule from "../components/dashboard/TodaySchedule.jsx";
import OverdueContent from "../components/dashboard/OverdueContent.jsx";
import RecentPublished from "../components/dashboard/RecentPublished.jsx";
import Loader from "../components/common/Loader.jsx";
import {
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const STATUS_COLORS = {
  DRAFT: "#94a3b8",
  ASSIGNED: "#60a5fa",
  IN_PROGRESS: "#f59e0b",
  SUBMITTED: "#a78bfa",
  APPROVED: "#34d399",
  SCHEDULED: "#38bdf8",
  PUBLISHED: "#4ade80",
  REJECTED: "#f87171",
};

const Home = () => {
  const [summary, setSummary] = useState(null);
  const [deadlines, setDeadlines] = useState([]);
  const [overdue, setOverdue] = useState([]);
  const [recent, setRecent] = useState([]);
  const [activity, setActivity] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const date = new Date();
        const [s, d, o, r, a, schedRes, contentRes] = await Promise.all([
          dashboardService.getSummary(),
          dashboardService.getDeadlines(),
          dashboardService.getOverdue(),
          dashboardService.getRecent(),
          dashboardService.getActivity(),
          scheduleService.getSchedules({
            month: date.getMonth() + 1,
            year: date.getFullYear(),
            limit: 200,
          }),
          contentService.getContent({ status: "SCHEDULED", limit: 200 }),
        ]);

        const realSchedules = schedRes.data || [];
        const scheduledContentList = contentRes.data || [];

        // Deduplicate schedules by content ID to guarantee 100% exact counts
        const existingSchedContentIds = new Set(
          realSchedules
            .map((s) => (s.contentId?._id || s.contentId)?.toString())
            .filter(Boolean),
        );

        const mappedContents = scheduledContentList
          .filter(
            (c) =>
              c.scheduledDate &&
              !existingSchedContentIds.has(c._id.toString()),
          )
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

        setSummary(s.data);
        setDeadlines(d.data || []);
        setOverdue(o.data || []);
        setRecent(r.data || []);
        setActivity(a.data || []);
        setSchedules([...realSchedules, ...mappedContents]);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Build pie chart data from exact status counts
  const pieData = summary?.statusCounts
    ? [
        {
          name: "Published",
          value: summary.statusCounts.PUBLISHED || 0,
          color: STATUS_COLORS.PUBLISHED,
        },
        {
          name: "Assigned",
          value: summary.statusCounts.ASSIGNED || 0,
          color: STATUS_COLORS.ASSIGNED,
        },
        {
          name: "Approved",
          value: summary.statusCounts.APPROVED || 0,
          color: STATUS_COLORS.APPROVED,
        },
        {
          name: "In Progress",
          value: summary.statusCounts.IN_PROGRESS || 0,
          color: STATUS_COLORS.IN_PROGRESS,
        },
        {
          name: "Scheduled",
          value: summary.statusCounts.SCHEDULED || 0,
          color: STATUS_COLORS.SCHEDULED,
        },
        {
          name: "Pending Review",
          value: summary.statusCounts.SUBMITTED || 0,
          color: STATUS_COLORS.SUBMITTED,
        },
        {
          name: "Draft",
          value: summary.statusCounts.DRAFT || 0,
          color: STATUS_COLORS.DRAFT,
        },
        {
          name: "Rejected",
          value: summary.statusCounts.REJECTED || 0,
          color: STATUS_COLORS.REJECTED,
        },
      ].filter((d) => d.value > 0)
    : [];

  if (isLoading)
    return (
      <>
        <Loader text="Loading dashboard..." />
      </>
    );

  return (
    <>
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <StatsCard
          title="Total Content"
          value={summary?.totalContent}
          icon={FileText}
          color="primary"
        />
        <StatsCard
          title="In Pipeline"
          value={summary?.inPipeline}
          icon={Layers}
          color="purple"
        />
        <StatsCard
          title="Scheduled"
          value={summary?.scheduled}
          icon={CalendarCheck}
          color="info"
        />
        <StatsCard
          title="Published"
          value={summary?.published}
          icon={CheckCircle2}
          color="success"
        />
        <StatsCard
          title="Due Today"
          value={summary?.dueToday}
          icon={Clock}
          color="warning"
        />
        <StatsCard
          title="Overdue"
          value={summary?.overdue}
          icon={AlertCircle}
          color="danger"
        />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left: Deadlines + Overdue */}
        <div className="xl:col-span-2 space-y-6">
          <TodaySchedule schedules={schedules} />
          <TodayDeadlines deadlines={deadlines} />
          <OverdueContent items={overdue} />

          {/* Content Status Chart */}
          {pieData.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="section-title flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary-500" />
                  Content Status Overview
                </h3>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {summary?.totalContent ?? pieData.reduce((acc, c) => acc + c.value, 0)} Total
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Donut Chart with Center Total */}
                <div className="md:col-span-5 relative flex items-center justify-center">
                  {/* Center Stat in Donut (behind chart & tooltip) */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
                    <span className="text-2xl font-bold text-slate-800 tracking-tight">
                      {summary?.totalContent ?? pieData.reduce((acc, c) => acc + c.value, 0)}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Contents
                    </span>
                  </div>

                  <ResponsiveContainer width="100%" height={220} className="relative z-10">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={62}
                        outerRadius={85}
                        paddingAngle={2.5}
                        dataKey="value"
                        stroke="#ffffff"
                        strokeWidth={2}
                      >
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        wrapperStyle={{ zIndex: 50, pointerEvents: "none" }}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0];
                            const total =
                              summary?.totalContent ||
                              pieData.reduce((acc, c) => acc + c.value, 0);
                            const percent =
                              total > 0
                                ? ((data.value / total) * 100).toFixed(1)
                                : 0;
                            return (
                              <div className="bg-white px-3 py-2 rounded-xl shadow-xl border border-slate-200/90 flex items-center gap-2 text-xs font-semibold whitespace-nowrap">
                                <span
                                  className="w-2.5 h-2.5 rounded-full shrink-0"
                                  style={{ backgroundColor: data.payload.color }}
                                />
                                <span className="text-slate-700">{data.name}:</span>
                                <span className="text-slate-900 font-bold">{data.value}</span>
                                <span className="text-slate-400 font-normal">({percent}%)</span>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Right: Status Breakdown Grid with counts & percentages */}
                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto pr-1">
                  {pieData.map((item, idx) => {
                    const total =
                      summary?.totalContent ||
                      pieData.reduce((acc, c) => acc + c.value, 0);
                    const percent =
                      total > 0 ? ((item.value / total) * 100).toFixed(0) : 0;
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 transition-colors border border-slate-100"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-xs font-medium text-slate-700 truncate">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0 ml-2">
                          <span className="text-xs font-bold text-slate-800">
                            {item.value}
                          </span>
                          <span
                            className="text-[11px] font-semibold px-1.5 py-0.5 rounded-md"
                            style={{
                              backgroundColor: `${item.color}15`,
                              color: item.color,
                            }}
                          >
                            {percent}%
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Recent + Activity */}
        <div className="space-y-6">
          <RecentPublished publications={recent} />

          {/* Activity Feed */}
          <div className="card p-6 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-full blur-2xl opacity-60 pointer-events-none" />

            <h3 className="section-title mb-6 flex items-center gap-2 relative z-10">
              <div className="p-1.5 bg-indigo-50 rounded-lg">
                <Activity className="w-4 h-4 text-indigo-600" />
              </div>
              Recent Activity
            </h3>

            {activity.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="max-h-[400px] overflow-y-auto pr-2 pb-2 scrollbar-thin scrollbar-thumb-slate-200">
                <div className="relative space-y-4">
                  {/* Timeline vertical line */}
                  <div className="absolute left-[11px] top-3 bottom-0 w-px bg-indigo-200" />

                  {activity.map((log) => {
                    const parts = log.description.split(" ");
                    const highlight =
                      parts.length > 1 ? `${parts[0]} ${parts[1]}` : parts[0];
                    const rest = log.description.substring(highlight.length);

                    return (
                      <div key={log._id} className="relative flex gap-4 group">
                        <div className="relative z-10 w-6 h-6 rounded-full bg-white border-2 border-indigo-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:border-indigo-400 group-hover:scale-110 transition-all shadow-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 group-hover:bg-indigo-600 transition-colors" />
                        </div>
                        <div className="flex-1 bg-white rounded-xl p-3 border border-slate-100 group-hover:border-indigo-100 group-hover:shadow-md group-hover:shadow-indigo-500/5 transition-all relative overflow-hidden">
                          {/* Hover accent line */}
                          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                          <p className="text-xs text-slate-600 leading-relaxed">
                            <span className="font-bold text-slate-800">
                              {highlight}
                            </span>
                            {rest}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1.5 font-semibold uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-300" />
                            {new Date(log.createdAt).toLocaleString(undefined, {
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
