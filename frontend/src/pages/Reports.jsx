import React, { useEffect, useState, useMemo } from "react";
import { TrendingUp, Award, Target, Download, Calendar } from "lucide-react";
import Select from "../components/common/Select.jsx";
import { generateMonthOptions } from "../utils/dateUtils.js";
import ExcelJS from "exceljs";
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
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import { dashboardService } from "../services/dashboardService.js";
import { contentService } from "../services/contentService.js";
import { instructorService } from "../services/instructorService.js";

const formatToDDMMYYYY = (dateString) => {
  if (!dateString) return "N/A";
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "N/A";
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

const isSameMonth = (dateString, selectedMonth) => {
  if (!selectedMonth) return true;
  if (!dateString) return false;
  return dateString.substring(0, 7) === selectedMonth;
};

const Reports = () => {
  const [rawData, setRawData] = useState({
    summary: null,
    allContent: [],
    instructors: [],
  });
  const [selectedMonth, setSelectedMonth] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  useEffect(() => {
    const load = async () => {
      try {
        const [s, allContent, instructors] = await Promise.all([
          dashboardService.getSummary(),
          contentService.getContent({ limit: 1000 }),
          instructorService.getInstructors({ limit: 100 }),
        ]);

        setRawData({
          summary: s.data,
          allContent: allContent.data || [],
          instructors: instructors.data || [],
        });
      } catch (err) {
        console.error("Reports load error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const { summary, contentByType, instructorPerf, deliveredContent, statusData } = useMemo(() => {
    if (!rawData.summary) return { summary: null, contentByType: [], instructorPerf: [], deliveredContent: [], statusData: [] };

    // Filter content by selected month
    const filteredContent = selectedMonth
      ? rawData.allContent.filter((c) => {
          // Prioritize created/published dates for general content filtering
          const dateToCheck = c.publishedDate || c.scheduledDate || c.dueDate || c.createdAt;
          return isSameMonth(dateToCheck, selectedMonth);
        })
      : rawData.allContent;

    // 1. Recompute Summary
    let computedSummary = rawData.summary;
    if (selectedMonth) {
      const scheduled = filteredContent.filter((c) => c.status === "SCHEDULED").length;
      const published = filteredContent.filter((c) => c.status === "PUBLISHED").length;
      const pendingReview = filteredContent.filter((c) => c.status === "SUBMITTED").length;
      const overdue = filteredContent.filter((c) => c.isOverdue).length;

      computedSummary = {
        totalContent: filteredContent.length,
        scheduled,
        published,
        pendingReview,
        overdue,
      };
    }

    // 2. Compute Content by Type & Delivered
    const typeMap = {};
    const delivered = [];

    filteredContent.forEach((c) => {
      typeMap[c.contentType] = (typeMap[c.contentType] || 0) + 1;

      if (c.status === "PUBLISHED" && isSameMonth(c.publishedDate || c.createdAt, selectedMonth)) {
        let byWhom = "Unassigned";
        if (c.contributors?.length > 0)
          byWhom = c.contributors.map((cont) => cont.name).join(", ");
        else if (c.instructor) byWhom = c.instructor.name || "Assigned Instructor";
        else if (c.createdBy) byWhom = c.createdBy.name || "Creator";

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

    delivered.sort((a, b) => new Date(a.publishedDate || 0) - new Date(b.publishedDate || 0));
    const computedContentByType = Object.entries(typeMap).map(([name, count]) => ({ name, count }));

    // 3. Status Distribution
    const computedStatusData = [
      {
        name: "Draft",
        value: Math.max(
          0,
          computedSummary.totalContent -
            computedSummary.scheduled -
            computedSummary.published -
            computedSummary.pendingReview,
        ),
        color: "#94a3b8",
      },
      {
        name: "In Progress",
        value: computedSummary.pendingReview,
        color: "#f59e0b",
      },
      {
        name: "Scheduled",
        value: computedSummary.scheduled,
        color: "#38bdf8",
      },
      {
        name: "Published",
        value: computedSummary.published,
        color: "#4ade80",
      },
    ].filter((d) => d.value > 0);

    // 4. Instructor Performance
    let computedInstructorPerf = [];
    if (selectedMonth) {
      computedInstructorPerf = rawData.instructors.map((i) => {
        let total = 0;
        let completed = 0;
        let overdue = 0;

        filteredContent.forEach((c) => {
          const isAssigned =
            c.contributors?.some((cont) => cont._id === i._id || cont === i._id) ||
            (c.instructor && (c.instructor._id === i._id || c.instructor === i._id));
            
          if (isAssigned) {
            total++;
            if (c.status === "PUBLISHED" || c.status === "APPROVED") completed++;
            if (c.isOverdue) overdue++;
          }
        });

        return {
          name: i.name.split(" ")[0],
          total,
          completed,
          overdue,
        };
      }).filter((p) => p.total > 0);
    } else {
      computedInstructorPerf = rawData.instructors.map((i) => ({
        name: i.name.split(" ")[0],
        total: i.stats?.total || 0,
        completed: i.stats?.completed || 0,
        overdue: i.stats?.overdue || 0,
      })).filter((p) => p.total > 0);
    }

    return {
      summary: computedSummary,
      contentByType: computedContentByType,
      instructorPerf: computedInstructorPerf,
      deliveredContent: delivered,
      statusData: computedStatusData,
    };
  }, [rawData, selectedMonth]);

  const downloadExcel = async () => {
    if (deliveredContent.length === 0) return;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Delivered Content");

    sheet.columns = [
      { header: "Content Title", key: "title", width: 45 },
      { header: "By Whom", key: "byWhom", width: 25 },
      { header: "Published Date", key: "publishedDate", width: 15 },
      { header: "Platform", key: "platforms", width: 35 },
    ];

    sheet.getRow(1).font = { bold: true };

    deliveredContent.forEach((item) => {
      sheet.addRow({
        title: item.title,
        byWhom: item.byWhom,
        publishedDate: formatToDDMMYYYY(item.publishedDate),
        platforms: item.platforms,
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Delivered_Content_Report_${selectedMonth || "All"}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading)
    return (
      <>
        <Loader />
      </>
    );

  return (
    <>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-slate-800">Overview</h2>
        <div className="flex items-center gap-3">
          <Select
            options={monthOptions}
            placeholder="All Months"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="w-40 h-10 [&>div]:rounded-xl [&>div]:h-full"
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
                margin={{ top: 10, right: 30, bottom: 10, left: 10 }}
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
              <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
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
                <Legend
                  wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
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
            <div className="w-full overflow-x-auto no-scrollbar">
              <div className="min-w-[600px] h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={instructorPerf}
                    barSize={20}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
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
              </div>
            </div>
          )}
        </div>

        {/* Delivered Content Table */}
        <div className="card p-6 xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h3 className="section-title">Delivered Content</h3>
            {deliveredContent.length > 0 && (
              <button
                onClick={downloadExcel}
                className="flex items-center justify-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg shadow-sm transition-all hover:shadow hover:-translate-y-0.5"
              >
                <Download className="w-4 h-4" />
                Export to Excel
              </button>
            )}
          </div>
          {deliveredContent.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">
              No delivered content available
            </p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden lg:block overflow-x-auto">
                <div className="max-h-[500px] overflow-y-auto pr-1">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="sticky top-0 bg-white z-10">
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 px-4 font-semibold">
                          Content Title
                        </th>
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
                            {formatToDDMMYYYY(item.publishedDate)}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.platforms}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Card List */}
              <div className="lg:hidden flex flex-col gap-3 max-h-[500px] overflow-y-auto pr-1">
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
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-3 pt-3 border-t border-slate-200 gap-2">
                      <p className="text-xs text-slate-500 shrink-0">
                        {formatToDDMMYYYY(item.publishedDate)}
                      </p>
                      <div className="flex flex-wrap gap-1 justify-end">
                        {item.platforms.split(", ").map((plat, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md whitespace-nowrap"
                          >
                            {plat}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Reports;

