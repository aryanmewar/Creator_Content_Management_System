import React, { useEffect, useState } from "react";
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
      <>
        <Loader />
      </>
    );

  return (
    <>

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
          <>
            {/* Desktop View: Table */}
            <div className="hidden md:block overflow-x-auto">
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

            {/* Mobile View: Cards */}
            <div className="md:hidden space-y-4">
              {assignments.map((item) => (
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
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default ContributorDashboard;
