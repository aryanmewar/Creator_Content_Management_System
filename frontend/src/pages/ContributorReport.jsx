import React, { useEffect, useState } from "react";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import { Award, AlertTriangle, Activity, TrendingUp } from "lucide-react";
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

  if (isLoading)
    return (
      <>
        <Loader />
      </>
    );

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

  if (report && report.history) {
    const statusCounts = report.history.reduce((acc, item) => {
      const s = item.status;
      acc[s] = (acc[s] || 0) + 1;
      return acc;
    }, {});

    pieData = Object.keys(statusCounts).map((status) => ({
      name: status.replace("_", " "),
      status,
      value: statusCounts[status],
    }));

    // Group by month for completion (using submittedAt or deadline as a fallback for grouping if they exist)
    const monthCounts = report.history.reduce((acc, item) => {
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

  return (
    <>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">
          My Performance Report
        </h2>
        <p className="text-slate-500">
          Track your completed content and on-time rate.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {report && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            <StatsCard
              title="Total Handled"
              value={report.metrics.total}
              icon={Activity}
              color="primary"
            />
            <StatsCard
              title="Total Published"
              value={report.metrics.published}
              icon={Award}
              color="success"
            />
            <StatsCard
              title="Currently Overdue"
              value={report.metrics.overdue}
              icon={AlertTriangle}
              color="danger"
            />
            <StatsCard
              title="On-Time Rate"
              value={`${report.metrics.onTimeRate}%`}
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
            {report.history.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">
                No assignment history found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 px-4 font-semibold">Title</th>
                      <th className="py-3 px-4 font-semibold">
                        Target Shoot Date
                      </th>
                      <th className="py-3 px-4 font-semibold">
                        Shoot Completion
                      </th>
                      <th className="py-3 px-4 font-semibold">Submitted At</th>
                      <th className="py-3 px-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.history.map((item) => (
                      <tr
                        key={item._id}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {item.contentId?.title || "Unknown Title"}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ContributorReport;
