import React, { useEffect, useState } from "react";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import { Target, Clock, CheckCircle, AlertCircle, Calendar, ExternalLink } from "lucide-react";
import TodayDeadlines from "../components/dashboard/TodayDeadlines.jsx";
import TodaySchedule from "../components/dashboard/TodaySchedule.jsx";
import { contributorService } from "../services/contributorService.js";

const ContributorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const unacknowledgedAssignments = assignments.filter(
    (a) => a.status === "ASSIGNED" && !a.isCheckedByContributor
  );

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsData, assignmentsData] = await Promise.all([
          contributorService.getDashboard(),
          contributorService.getAssignments(),
        ]);
        
        // Sort assignments so that ASSIGNED status appears at the top
        assignmentsData.sort((a, b) => {
          if (a.status === "ASSIGNED" && b.status !== "ASSIGNED") return -1;
          if (a.status !== "ASSIGNED" && b.status === "ASSIGNED") return 1;
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
        
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

  const handleMarkChecked = async (id) => {
    try {
      await contributorService.markAsChecked(id);
      // Update local state
      setAssignments((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isCheckedByContributor: true } : item
        )
      );
    } catch (err) {
      alert("Failed to mark content as checked: " + (err.response?.data?.message || err.message));
    }
  };

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
            {unacknowledgedAssignments.length > 0 && (
              <div className="card p-6 border-l-4 border-l-blue-500 bg-white/70 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full blur-2xl opacity-50 pointer-events-none" />
                <h3 className="section-title text-slate-800 mb-4 flex items-center gap-2 relative z-10">
                  <Target className="w-5 h-5 text-blue-500" />
                  New Assignments ({unacknowledgedAssignments.length})
                </h3>
                <div className="space-y-4 relative z-10">
                  {unacknowledgedAssignments.map((item) => (
                    <div key={item._id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-base">{item.contentId?.title || "Unknown Title"}</h4>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-slate-600">
                          {item.contentId?.referenceLink ? (
                            <a href={item.contentId.referenceLink} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1 font-medium">
                               <ExternalLink className="w-3.5 h-3.5" />
                               Reference Link
                            </a>
                          ) : (
                            <span className="text-slate-400">No Reference Link</span>
                          )}
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Target Shoot Date: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => handleMarkChecked(item._id)}
                        className="btn btn-primary shrink-0 flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 transition-all shadow-md shadow-blue-500/20"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Acknowledge
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
              title="Assigned (New)"
              value={stats.assigned}
              icon={Target}
              color="info"
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
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
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
