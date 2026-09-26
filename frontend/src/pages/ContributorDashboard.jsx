import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import { Target, Clock, CheckCircle, AlertCircle } from "lucide-react";
import TodayDeadlines from "../components/dashboard/TodayDeadlines.jsx";
import TodaySchedule from "../components/dashboard/TodaySchedule.jsx";
import { contributorService } from "../services/contributorService.js";

const ContributorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, assignmentsData] = await Promise.all([
          contributorService.getDashboard(),
          contributorService.getAssignments(),
        ]);
        setStats(statsData);
        setAssignments(assignmentsData);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
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
        <h2 className="text-2xl font-bold text-slate-800">My Dashboard</h2>
        <p className="text-slate-500">View your assigned content and tasks.</p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-lg bg-red-50 text-red-600 text-sm">
          {error}
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
          <div className="xl:col-span-2 space-y-6">
            {/* Show schedule and deadlines for contributor */}
            <TodaySchedule schedules={stats.todaySchedules || []} />
            <TodayDeadlines deadlines={stats.todayDeadlines || []} />
          </div>

          <div className="space-y-6">
            <StatsCard
              title="Total Assigned"
              value={stats.totalAssigned}
              icon={Target}
              color="primary"
            />
            <StatsCard
              title="In Progress"
              value={stats.inProgress}
              icon={Clock}
              color="purple"
            />
            <StatsCard
              title="Completed"
              value={stats.published}
              icon={CheckCircle}
              color="success"
            />
            <StatsCard
              title="Overdue"
              value={stats.overdue}
              icon={AlertCircle}
              color="danger"
            />
          </div>
        </div>
      )}

      <div className="card p-6">
        <h3 className="section-title mb-4">Assigned Content</h3>
        {assignments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">
            You have no assigned content.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-3 px-4 font-semibold">Title</th>
                  <th className="py-3 px-4 font-semibold">Type</th>
                  <th className="py-3 px-4 font-semibold">Target Shoot Date</th>
                  <th className="py-3 px-4 font-semibold">Shoot Completion</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((item) => (
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
    </DashboardLayout>
  );
};

export default ContributorDashboard;
