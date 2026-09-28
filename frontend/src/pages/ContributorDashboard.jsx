import React, { useEffect, useState } from "react";
import StatsCard from "../components/dashboard/StatsCard.jsx";
import Loader from "../components/common/Loader.jsx";
import { Target, Clock, CheckCircle, AlertCircle, Calendar, ExternalLink } from "lucide-react";
import TodayDeadlines from "../components/dashboard/TodayDeadlines.jsx";
import TodaySchedule from "../components/dashboard/TodaySchedule.jsx";
import OverdueContent from "../components/dashboard/OverdueContent.jsx";
import { contributorService } from "../services/contributorService.js";

const ContributorDashboard = () => {
  const [stats, setStats] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const unacknowledgedAssignments = assignments.filter(
    (a) => a.status === "ASSIGNED" && !a.isCheckedByContributor
  );

  const unacknowledgedOverdue = assignments.filter(
    (a) => a.isOverdue && !a.isOverdueAcknowledged && ["ASSIGNED", "DRAFT"].includes(a.status)
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

  const handleMarkOverdueAcknowledged = async (id) => {
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
            {unacknowledgedOverdue.length > 0 && (
              <OverdueContent 
                items={unacknowledgedOverdue} 
                onAcknowledge={handleMarkOverdueAcknowledged} 
              />
            )}

            {unacknowledgedAssignments.length > 0 && (
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-fuchsia-500 p-[1px] shadow-lg shadow-indigo-500/20 mb-6 group/container">
                <div className="relative bg-white/95 backdrop-blur-xl rounded-[15px] p-6">
                  {/* Decorative background flare */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-indigo-500/10 via-purple-500/5 to-transparent rounded-bl-full pointer-events-none" />
                  
                  <h3 className="section-title text-transparent bg-clip-text bg-gradient-to-r from-indigo-700 to-purple-700 mb-5 flex items-center gap-3 relative z-10">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shadow-inner">
                      <Target className="w-5 h-5 animate-pulse" />
                    </div>
                    Action Required: New Assignments ({unacknowledgedAssignments.length})
                  </h3>
                  
                  <div className="space-y-4 relative z-10">
                    {unacknowledgedAssignments.map((item) => (
                      <div key={item._id} className="group bg-gradient-to-r from-slate-50 to-white p-5 rounded-xl border border-indigo-100/50 hover:border-indigo-300 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
                        {/* Hover Left Border effect */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-l-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                        
                        <div className="flex-1 pl-2">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              {item.contentId?.contentType || "CONTENT"}
                            </span>
                            <h4 className="font-bold text-slate-800 text-lg group-hover:text-indigo-700 transition-colors">
                              {item.contentId?.title || "Unknown Title"}
                            </h4>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 mt-3 text-sm text-slate-600">
                            {item.contentId?.referenceLink ? (
                              <a href={item.contentId.referenceLink} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 hover:bg-blue-500 hover:text-white hover:shadow-md transition-all font-medium">
                                 <ExternalLink className="w-4 h-4" />
                                 Reference Link
                              </a>
                            ) : (
                              <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-400">
                                <ExternalLink className="w-4 h-4 opacity-50" />
                                No Reference Link
                              </span>
                            )}
                            
                            <span className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-purple-50 border border-purple-100 text-purple-700 font-medium">
                              <Calendar className="w-4 h-4 text-purple-500" />
                              Target Shoot: <span className="font-bold text-purple-900 ml-1">{item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "-"}</span>
                            </span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleMarkChecked(item._id)}
                          className="shrink-0 flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-500 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 group-hover:scale-[1.02] active:scale-95 border border-white/10"
                        >
                          <CheckCircle className="w-5 h-5" />
                          Acknowledge Now
                        </button>
                      </div>
                    ))}
                  </div>
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


    </>
  );
};

export default ContributorDashboard;
