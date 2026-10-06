import React, { useEffect, useState } from "react";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import { Target, Clock, CheckCircle, AlertCircle, Calendar, ExternalLink } from "lucide-react";
import TodayDeadlines from "../components/dashboard/TodayDeadlines.jsx";
import TodaySchedule from "../components/dashboard/TodaySchedule.jsx";
import OverdueContent from "../components/dashboard/OverdueContent.jsx";
import UpcomingShoots from "../components/dashboard/UpcomingShoots.jsx";
import { contributorService } from "../services/contributorService.js";

const ContributorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const unacknowledgedAssignments = assignments.filter(
    (a) => a.status === "ASSIGNED" && !a.isCheckedByContributor
  );

  const overdueContent = assignments.filter(
    (a) => a.isOverdue && ["ASSIGNED", "DRAFT"].includes(a.status)
  );

  const upcomingShoots = assignments.filter(
    (a) => ["ASSIGNED", "DRAFT"].includes(a.status) && a.isCheckedByContributor && !a.isOverdue
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

  // eslint-disable-next-line -- kept for future use: acknowledge button can be added to UI
  const _handleMarkOverdueAcknowledged = async (id) => {
    try {
      await contributorService.markOverdueAsAcknowledged(id);
      setAssignments((prev) =>
        prev.map((item) =>
          item._id === id ? { ...item, isOverdueAcknowledged: true } : item
        )
      );
    } catch (err) {
      alert("Failed to acknowledge overdue content: " + (err.response?.data?.message || err.message));
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
              <div className="card p-6 mb-6">
                <h3 className="section-title mb-5 flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">
                    <Target className="w-5 h-5" />
                  </div>
                  Action Required: New Assignments
                  <span className="badge bg-indigo-100 text-indigo-700 ml-1">
                    {unacknowledgedAssignments.length}
                  </span>
                </h3>
                
                <div className="space-y-4">
                  {unacknowledgedAssignments.map((item) => (
                    <div key={item._id} className="group flex flex-col md:flex-row md:items-center justify-between gap-5 p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50 transition-all shadow-sm">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider">
                            {item.contentId?.contentType || "CONTENT"}
                          </span>
                          <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">
                            {item.contentId?.title || "Unknown Title"}
                          </h4>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-3 text-sm text-slate-600">
                          {item.contentId?.referenceLink ? (
                            <a href={item.contentId.referenceLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors font-medium">
                               <ExternalLink className="w-4 h-4" />
                               Reference Link
                            </a>
                          ) : (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-400">
                              <ExternalLink className="w-4 h-4 opacity-50" />
                              No Reference Link
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 text-slate-700 font-medium border border-slate-100">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            Target Shoot: <span className="font-bold ml-1">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"}</span>
                          </span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => handleMarkChecked(item._id)}
                        className="shrink-0 flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Acknowledge Now
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {overdueContent.length > 0 && (
              <OverdueContent items={overdueContent} />
            )}
            {/* Show schedule and deadlines for contributor */}
            <TodaySchedule schedules={stats.todaySchedules || []} />
            <TodayDeadlines deadlines={stats.todayDeadlines || []} />
            <UpcomingShoots shoots={upcomingShoots} />
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


    </>
  );
};

export default ContributorDashboard;
