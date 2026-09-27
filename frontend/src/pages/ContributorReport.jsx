import React, { useEffect, useState, useMemo } from "react";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import Select from "../components/common/Select.jsx";
import { generateMonthOptions, getRealDate } from "../utils/dateUtils.js";
import { Award, AlertTriangle, Activity, TrendingUp, Calendar, CheckCircle } from "lucide-react";
import { FaYoutube, FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { contributorService } from "../services/contributorService.js";

const ContributorReport = () => {
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  useEffect(() => {
    const loadReport = async () => {
      try {
        const data = await contributorService.getReport();
        setReport(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load report.");
      } finally {
        setIsLoading(false);
      }
    };
    loadReport();
  }, []);

  const STATUS_COLORS = {
    ASSIGNED: "#3b82f6",
    IN_PROGRESS: "#eab308",
    SUBMITTED: "#a855f7",
    APPROVED: "#22c55e",
    SCHEDULED: "#0ea5e9",
    PUBLISHED: "#10b981",
  };

  let pieData = [];
  let barData = [];
  let typeData = [];

  const { filteredHistory, filteredMetrics } = useMemo(() => {
    if (!report) return { filteredHistory: [], filteredMetrics: null };

    const isSameMonth = (dateString, selectedMonth) => {
      if (!selectedMonth) return true;
      if (!dateString) return false;
      return dateString.substring(0, 7) === selectedMonth;
    };

    const filtered = selectedMonth
      ? report.history.filter((item) => {
          const dateToCheck = item.submittedAt || item.deadline || item.dueDate;
          return isSameMonth(dateToCheck, selectedMonth);
        })
      : report.history;

    const total = filtered.length;
    const published = filtered.filter((a) => a.status === "PUBLISHED").length;
    const overdue = filtered.filter(
      (a) =>
        a.dueDate &&
        new Date(a.dueDate).setHours(0, 0, 0, 0) < new Date(getRealDate()).setHours(0, 0, 0, 0) &&
        ["ASSIGNED", "DRAFT"].includes(a.status),
    ).length;

    const completed = filtered.filter((a) =>
      ["SUBMITTED", "PUBLISHED", "APPROVED", "SCHEDULED"].includes(a.status),
    );
    const onTime = completed.filter((a) => !a.isOverdue).length;
    const onTimeRate =
      completed.length > 0 ? (onTime / completed.length) * 100 : 0;

    return {
      filteredHistory: filtered,
      filteredMetrics: {
        total,
        published,
        overdue,
        onTimeRate: onTimeRate.toFixed(1),
      },
    };
  }, [report, selectedMonth]);

  if (report && filteredHistory) {
    const statusCounts = filteredHistory.reduce((acc, item) => {
      const s = item.status;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    pieData = Object.keys(statusCounts).map((status) => ({
      name: status.replace("_", " "),
      status,
      value: statusCounts[status],
    }));

    // Group by month for completion
    const monthCounts = filteredHistory.reduce((acc, item) => {
      const dateString = item.submittedAt || item.deadline || item.dueDate;
      if (dateString) {
        const d = new Date(dateString);
        const month = d.toLocaleString("default", { month: "short" });
        acc[month] = (acc[month] || 0) + 1;
      }
      return acc;
    }, {});

    barData = Object.keys(monthCounts).map((month) => ({
      name: month,
      Assignments: monthCounts[month],
    }));

    // Group by content type
    const typeCounts = filteredHistory.reduce((acc, item) => {
      const t = item.contentId?.contentType || "Unknown";
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});

    typeData = Object.keys(typeCounts).map((type) => ({
      name: type,
      value: typeCounts[type],
    }));
  }

  if (isLoading) {
    return <Loader />;
  }

  return (
    <>
      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {report && (
        <>
          <div className="flex justify-end mb-6">
            <div className="w-full sm:w-64">
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                options={monthOptions}
                placeholder="All Time"
                icon={Calendar}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Handled"
              value={filteredMetrics.total}
              icon={Activity}
              color="primary"
            />
            <StatsCard
              title="Total Published"
              value={filteredMetrics.published}
              icon={Award}
              color="success"
            />
            <StatsCard
              title="Currently Overdue"
              value={filteredMetrics.overdue}
              icon={AlertTriangle}
              color="danger"
            />
            <StatsCard
              title="On-Time Rate"
              value={`${filteredMetrics.onTimeRate}%`}
              icon={TrendingUp}
              color="purple"
            />
          </div>

          {pieData.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Chart 1: Status Distribution (Improved Pie/Donut Chart) */}
              <div className="card p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="section-title mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  Status Distribution
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <defs>
                        {pieData.map((entry, index) => (
                          <linearGradient key={`grad-${index}`} id={`colorUv-${index}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={STATUS_COLORS[entry.status] || "#94a3b8"} stopOpacity={1}/>
                            <stop offset="95%" stopColor={STATUS_COLORS[entry.status] || "#94a3b8"} stopOpacity={0.7}/>
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={90}
                        paddingAngle={8}
                        cornerRadius={6}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#colorUv-${index})`}
                            style={{ filter: `drop-shadow(0px 4px 6px ${STATUS_COLORS[entry.status]}40)` }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontWeight: 600 }}
                      />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "20px", fontWeight: 500 }}
                        iconType="circle"
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Assignments Over Time (Area Chart) */}
              <div className="card p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="section-title mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                  Productivity Trend
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={barData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorAssignments" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#94a3b8", fontSize: 12 }} 
                        dy={10}
                      />
                      <YAxis 
                        allowDecimals={false} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#94a3b8", fontSize: 12 }} 
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Assignments" 
                        stroke="#6366f1" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorAssignments)" 
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#4f46e5" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 3: Content Types (Bar Chart) */}
              <div className="card p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="section-title mb-6 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                  Content Format
                </h3>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={typeData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis 
                        type="number"
                        allowDecimals={false} 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#94a3b8", fontSize: 12 }} 
                      />
                      <YAxis 
                        dataKey="name"
                        type="category"
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: "#64748b", fontSize: 12, fontWeight: 500 }} 
                        width={80}
                      />
                      <Tooltip 
                        cursor={{ fill: "#f8fafc" }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar 
                        dataKey="value" 
                        radius={[0, 6, 6, 0]}
                        barSize={24}
                      >
                        {typeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={["#f43f5e", "#8b5cf6", "#10b981", "#f59e0b", "#0ea5e9"][index % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h3 className="section-title mb-4">Assigned Content</h3>
            {filteredHistory.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No assignment history found.
              </p>
            ) : (
              <>
                {/* Desktop View: Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500">
                        <th className="py-3 px-4 font-semibold">Title</th>
                        <th className="py-3 px-4 font-semibold">Type</th>
                        <th className="py-3 px-4 font-semibold">
                          Target Shoot Date
                        </th>
                        <th className="py-3 px-4 font-semibold">
                          Shoot Completion
                        </th>
                        <th className="py-3 px-4 font-semibold">Submitted At</th>
                        <th className="py-3 px-4 font-semibold">Platforms</th>
                        <th className="py-3 px-4 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredHistory.map((item) => (
                        <tr
                          key={item._id}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="py-3 px-4 font-medium text-slate-800">
                            {item.contentId?.title || "Unknown Title"}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.contentId?.contentType || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.dueDate
                              ? new Date(item.dueDate).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.deadline
                              ? new Date(item.deadline).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {item.submittedAt
                              ? new Date(item.submittedAt).toLocaleDateString()
                              : "-"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 items-center text-slate-400">
                              {item.publishedLinks?.youtube ? (
                                <a href={item.publishedLinks.youtube} target="_blank" rel="noreferrer" className="text-red-500 hover:text-red-600 transition-colors" title="YouTube">
                                  <FaYoutube className="w-4 h-4" />
                                </a>
                              ) : null}
                              {item.publishedLinks?.instagram ? (
                                <a href={item.publishedLinks.instagram} target="_blank" rel="noreferrer" className="text-pink-500 hover:text-pink-600 transition-colors" title="Instagram">
                                  <FaInstagram className="w-4 h-4" />
                                </a>
                              ) : null}
                              {item.publishedLinks?.facebook ? (
                                <a href={item.publishedLinks.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors" title="Facebook">
                                  <FaFacebook className="w-4 h-4" />
                                </a>
                              ) : null}
                              {item.publishedLinks?.linkedin ? (
                                <a href={item.publishedLinks.linkedin} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors" title="LinkedIn">
                                  <FaLinkedin className="w-4 h-4" />
                                </a>
                              ) : null}
                              {!item.publishedLinks?.youtube && !item.publishedLinks?.instagram && !item.publishedLinks?.facebook && !item.publishedLinks?.linkedin && (
                                <span className="text-xs">-</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                                item.status === "PUBLISHED" ||
                                item.status === "APPROVED"
                                  ? "bg-green-100 text-green-700"
                                  : item.status === "SUBMITTED"
                                    ? "bg-purple-100 text-purple-700"
                                    : "bg-blue-100 text-blue-700"
                              }`}
                            >
                              {item.status.replace("_", " ")}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile View: Cards */}
                <div className="md:hidden space-y-4">
                  {filteredHistory.map((item) => (
                    <div
                      key={item._id}
                      className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm"
                    >
                      <div className="flex justify-between items-start mb-3 gap-2">
                        <h4 className="font-semibold text-slate-800 line-clamp-2">
                          {item.contentId?.title || "Unknown Title"}
                        </h4>
                        <span
                          className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${
                            item.status === "PUBLISHED" ||
                            item.status === "APPROVED"
                              ? "bg-green-100 text-green-700"
                              : item.status === "SUBMITTED"
                                ? "bg-purple-100 text-purple-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {item.status.replace("_", " ")}
                        </span>
                      </div>
                      
                      <div className="space-y-2 text-sm text-slate-600">
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-500">Type:</span>
                          <span>{item.contentId?.contentType || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-500">Platforms:</span>
                          <div className="flex gap-2 items-center text-slate-400">
                            {item.publishedLinks?.youtube ? (
                              <a href={item.publishedLinks.youtube} target="_blank" rel="noreferrer" className="text-red-500 hover:text-red-600 transition-colors" title="YouTube">
                                <FaYoutube className="w-4 h-4" />
                              </a>
                            ) : null}
                            {item.publishedLinks?.instagram ? (
                              <a href={item.publishedLinks.instagram} target="_blank" rel="noreferrer" className="text-pink-500 hover:text-pink-600 transition-colors" title="Instagram">
                                <FaInstagram className="w-4 h-4" />
                              </a>
                            ) : null}
                            {item.publishedLinks?.facebook ? (
                              <a href={item.publishedLinks.facebook} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors" title="Facebook">
                                <FaFacebook className="w-4 h-4" />
                              </a>
                            ) : null}
                            {item.publishedLinks?.linkedin ? (
                              <a href={item.publishedLinks.linkedin} target="_blank" rel="noreferrer" className="text-blue-500 hover:text-blue-600 transition-colors" title="LinkedIn">
                                <FaLinkedin className="w-4 h-4" />
                              </a>
                            ) : null}
                            {!item.publishedLinks?.youtube && !item.publishedLinks?.instagram && !item.publishedLinks?.facebook && !item.publishedLinks?.linkedin && (
                              <span className="text-xs">-</span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-500">Target Shoot Date:</span>
                          <span>
                            {item.dueDate
                              ? new Date(item.dueDate).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-500">Shoot Completion:</span>
                          <span>
                            {item.deadline
                              ? new Date(item.deadline).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-500">Submitted At:</span>
                          <span>
                            {item.submittedAt
                              ? new Date(item.submittedAt).toLocaleDateString()
                              : "-"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ContributorReport;
