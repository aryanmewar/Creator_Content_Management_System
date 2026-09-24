import React, { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Award, Target } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import { dashboardService } from "../services/dashboardService.js";
import { contentService } from "../services/contentService.js";
import { instructorService } from "../services/instructorService.js";

const Reports = () => {
  const [summary, setSummary] = useState(null);
  const [contentByType, setContentByType] = useState([]);
  const [instructorPerf, setInstructorPerf] = useState([]);
  const [deliveredContent, setDeliveredContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, allContent, instructors] = await Promise.all([
          dashboardService.getSummary(),
          contentService.getContent({ limit: 1000 }),
          instructorService.getInstructors({ limit: 100 }),
        ]);
        setSummary(s.data);

        // Group by content type and extract delivered content
        const typeMap = {};
        const delivered = [];
        (allContent.data || []).forEach((c) => {
          typeMap[c.contentType] = (typeMap[c.contentType] || 0) + 1;

          if (c.status === "PUBLISHED") {
            let byWhom = "Unassigned";
            if (c.contributors?.length > 0)
              byWhom = c.contributors.map((cont) => cont.name).join(", ");
            else if (c.instructor) byWhom = c.instructor.name;
            else if (c.createdBy) byWhom = c.createdBy.name;

            const platforms = [];
            if (c.publishedLinks) {
              if (c.publishedLinks.youtube) platforms.push("YouTube");
              if (c.publishedLinks.instagram) platforms.push("Instagram");
              if (c.publishedLinks.linkedin) platforms.push("LinkedIn");
              if (c.publishedLinks.facebook) platforms.push("Facebook");
            }

            delivered.push({
              title: c.title,
              byWhom,
              publishedDate: c.publishedDate,
              platforms: platforms.join(", ") || "N/A",
            });
          }
        });

        delivered.sort(
          (a, b) =>
            new Date(a.publishedDate || 0) - new Date(b.publishedDate || 0),
        );
        setContentByType(
          Object.entries(typeMap).map(([name, count]) => ({ name, count })),
        );
        setDeliveredContent(delivered);

        // Instructor performance
        const perfData = (instructors.data || []).map((i) => ({
          name: i.name.split(" ")[0],
          total: i.stats?.total || 0,
          completed: i.stats?.completed || 0,
          overdue: i.stats?.overdue || 0,
        }));
        setInstructorPerf(perfData.filter((p) => p.total > 0));
      } catch (err) {
        console.error("Reports load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const statusData = summary
    ? [
        { name: "Scheduled", value: summary.scheduled, color: "#0ea5e9" }, // sky-500
        { name: "Published", value: summary.published, color: "#10b981" }, // emerald-500
        {
          name: "Pending Review",
          value: summary.pendingReview,
          color: "#8b5cf6",
        }, // violet-500
        { name: "Overdue", value: summary.overdue, color: "#ef4444" }, // red-500
        { name: "Due Today", value: summary.dueToday, color: "#f59e0b" }, // amber-500
      ].filter((d) => d.value > 0)
    : [];

  if (isLoading)
    return (
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatsCard
          title="Total Content"
          value={summary?.totalContent}
          icon={Target}
          color="primary"
        />
        <StatsCard
          title="Published"
          value={summary?.published}
          icon={Award}
          color="success"
        />
        <StatsCard
          title="Overdue"
          value={summary?.overdue}
          icon={TrendingUp}
          color="danger"
        />
        <StatsCard
          title="Pending Review"
          value={summary?.pendingReview}
          icon={BarChart3}
          color="purple"
        />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Content by Type */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Content by Type</h3>
          {contentByType.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={contentByType}
                layout="vertical"
                margin={{ left: 20 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  type="number"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#475569", fontWeight: 500 }}
                  width={100}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="#3b82f6"
                  radius={[0, 4, 4, 0]}
                  barSize={32}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Status Distribution */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Status Distribution</h3>
          {statusData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={{ stroke: "#cbd5e1", strokeWidth: 1 }}
                  stroke="none"
                >
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Instructor Performance */}
        <div className="card p-6 xl:col-span-2">
          <h3 className="section-title mb-4">Instructor Performance</h3>
          {instructorPerf.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No instructor data available
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={instructorPerf} barSize={20}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={{ stroke: "#e2e8f0" }}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ fontSize: "12px", color: "#475569" }}
                />
                <Bar
                  dataKey="total"
                  name="Total"
                  fill="#94a3b8"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="completed"
                  name="Published"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="overdue"
                  name="Overdue"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Delivered Content Table */}
        <div className="card p-6 xl:col-span-2">
          <h3 className="section-title mb-4">Delivered Content</h3>
          {deliveredContent.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No delivered content available
            </p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 px-4 font-semibold">Content Title</th>
                      <th className="py-3 px-4 font-semibold">By Whom</th>
                      <th className="py-3 px-4 font-semibold">
                        Published Date
                      </th>
                      <th className="py-3 px-4 font-semibold">Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveredContent.map((item, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {item.title}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.byWhom}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.publishedDate
                            ? new Date(item.publishedDate).toLocaleDateString()
                            : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.platforms}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List */}
              <div className="lg:hidden flex flex-col gap-3">
                {deliveredContent.map((item, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-xl border border-slate-100 bg-slate-50"
                  >
                    <p className="font-semibold text-slate-800 mb-1">
                      {item.title}
                    </p>
                    <p className="text-xs text-slate-500 mb-2">
                      By:{" "}
                      <span className="font-medium text-slate-700">
                        {item.byWhom}
                      </span>
                    </p>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-200">
                      <p className="text-xs text-slate-500">
                        {item.publishedDate
                          ? new Date(item.publishedDate).toLocaleDateString()
                          : "N/A"}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md">
                        {item.platforms}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Reports;
