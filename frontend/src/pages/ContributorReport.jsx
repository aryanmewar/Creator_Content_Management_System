import React, { useEffect, useState, useMemo } from "react";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import Select from "../components/common/Select.jsx";
import { generateMonthOptions, getRealDate } from "../utils/dateUtils.js";
import { Award, AlertTriangle, Activity, TrendingUp, Calendar, CheckCircle } from "lucide-react";
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

  const handleMarkChecked = async (id) => {
    try {
      await contributorService.markAsChecked(id);
      // Update local state in report history
      setReport((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          history: prev.history.map((item) =>
            item._id === id ? { ...item, isCheckedByContributor: true } : item
          ),
        };
      });
    } catch (err) {
      alert("Failed to mark content as checked: " + (err.response?.data?.message || err.message));
    }
  };

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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
              <div className="card p-6">
                <h3 className="section-title mb-6">Status Distribution</h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                    >
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={STATUS_COLORS[entry.status] || "#94a3b8"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend
                        wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="section-title mb-6">Assignments by Month</h3>
                <div className="h-[300px] w-full">
                  <div className="w-full overflow-x-auto no-scrollbar h-full">
                    <div className="min-w-[400px] h-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={barData}
                          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                            stroke="#e2e8f0"
                          />
                          <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b" }}
                          />
                          <YAxis
                            allowDecimals={false}
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: "#64748b" }}
                          />
                          <Tooltip cursor={{ fill: "#f1f5f9" }} />
                          <Bar
                            dataKey="Assignments"
                            fill="#6366f1"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="card p-6">
            <h3 className="section-title mb-4">Historical Assignments</h3>
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
                        <th className="py-3 px-4 font-semibold">Status</th>
                        <th className="py-3 px-4 font-semibold text-right">Action</th>
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
                          <td className="py-3 px-4 text-right">
                            {item.status === "ASSIGNED" && !item.isCheckedByContributor ? (
                              <button
                                onClick={() => handleMarkChecked(item._id)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                              >
                                Mark Checked
                              </button>
                            ) : item.status === "ASSIGNED" && item.isCheckedByContributor ? (
                              <span className="text-green-600 text-xs font-medium flex items-center justify-end gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Checked
                              </span>
                            ) : null}
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
                        {item.status === "ASSIGNED" && !item.isCheckedByContributor ? (
                          <div className="mb-3">
                            <button
                              onClick={() => handleMarkChecked(item._id)}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors w-full"
                            >
                              Mark Checked
                            </button>
                          </div>
                        ) : item.status === "ASSIGNED" && item.isCheckedByContributor ? (
                          <div className="mb-3 text-green-600 text-xs font-medium flex items-center gap-1">
                            <CheckCircle className="w-3.5 h-3.5" /> Checked
                          </div>
                        ) : null}
                        
                        <div className="flex justify-between">
                          <span className="font-medium text-slate-500">Type:</span>
                          <span>{item.contentId?.contentType || "N/A"}</span>
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
