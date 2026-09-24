import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import { Award, AlertTriangle, Activity, TrendingUp } from "lucide-react";
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
      <DashboardLayout>
        <Loader />
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
                      <th className="py-3 px-4 font-semibold">Due Date</th>
                      <th className="py-3 px-4 font-semibold">Completion Date</th>
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
                          {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.deadline ? new Date(item.deadline).toLocaleDateString() : "-"}
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
    </DashboardLayout>
  );
};

export default ContributorReport;
