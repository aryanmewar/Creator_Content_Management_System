import React, { useEffect, useState } from "react";
import { Plus, FileText } from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../components/layout/DashboardLayout.jsx";
import ContentCard from "../components/content/ContentCard.jsx";
import ContentForm from "../components/content/ContentForm.jsx";
import ContentFilters from "../components/content/ContentFilters.jsx";
import ConfirmDialog from "../components/common/ConfirmDialog.jsx";
import { Button } from "@/components/ui/button";
import Loader from "../components/common/Loader.jsx";
import EmptyState from "../components/common/EmptyState.jsx";
import { useContentContext } from "../context/ContentContext.jsx";
import { contentService } from "../services/contentService.js";
import { instructorService } from "../services/instructorService.js";
import { useNavigate } from "react-router-dom";

const STATUS_TABS = [
  "All",
  "ASSIGNED",
  "IN_PROGRESS",
  "COMPLETED",
  "APPROVED",
  "SCHEDULED",
  "PUBLISHED",
];

const Content = () => {
  const navigate = useNavigate();
  const { contents, isLoading, statusCounts, filters, dispatch, fetchContent } =
    useContentContext();
  const [activeTab, setActiveTab] = useState("All");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    let dateFrom = "";
    let dateTo = "";
    
    if (filters.month) {
      const [year, month] = filters.month.split('-');
      dateFrom = new Date(year, parseInt(month) - 1, 1).toISOString();
      dateTo = new Date(year, parseInt(month), 0, 23, 59, 59, 999).toISOString();
    }

    const params =
      activeTab === "All"
        ? { ...filters, status: "", isOwnerContent: true, dateFrom, dateTo }
        : { ...filters, status: activeTab, isOwnerContent: true, dateFrom, dateTo };
    fetchContent(params);
  }, [activeTab, filters, fetchContent]);

  useEffect(() => {
    instructorService
      .getInstructors({ limit: 100 })
      .then((r) => setInstructors(r.data || []));
  }, []);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      const response = await contentService.createContent(data);
      dispatch({ type: "ADD_CONTENT", payload: response.data });
      toast.success("Content created!");
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create content.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      const response = await contentService.updateContent(
        editingContent._id,
        data,
      );
      dispatch({ type: "UPDATE_CONTENT", payload: response.data });
      toast.success("Content updated!");
      setEditingContent(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update content.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (contentId, newStatus, extraData = {}) => {
    try {
      const response = await contentService.updateContentStatus(
        contentId,
        newStatus,
        null,
        extraData,
      );
      dispatch({ type: "UPDATE_CONTENT", payload: response.data });
      toast.success("Status updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await contentService.deleteContent(deleteTarget._id);
      dispatch({ type: "REMOVE_CONTENT", payload: deleteTarget._id });
      toast.success("Content deleted.");
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete content.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    dispatch({ type: "SET_FILTERS", payload: newFilters });
  };

  // Show only contents created via Owners Content page
  const ownersContents = contents.filter(c => c.isOwnerContent === true);

  return (
    <DashboardLayout>
      <div className="sm:pb-0">
      {/* Tabs, Filters, and Actions */}
      <div className="flex flex-col gap-5 mb-6 w-full">
        {/* Tab Bar */}
        <div className="w-full xl:w-auto bg-white border border-slate-200 p-1.5 rounded-2xl shadow-sm overflow-x-auto no-scrollbar">
          <div className="flex gap-1 bg-slate-50 rounded-xl p-1 shrink-0 w-max">
            {STATUS_TABS.map((tab) => {
              const count = tab === "All" ? statusCounts?.All || 0 : statusCounts?.[tab] || 0;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    activeTab === tab
                      ? "bg-white text-primary shadow-sm"
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {tab === "All" ? "All Content" : tab.replace("_", " ")}
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${activeTab === tab ? "bg-primary/10 text-primary" : "bg-slate-200/50 text-slate-500"}`}>
                    {count}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Filters & Actions */}
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 w-full">
          <div className="w-full sm:w-auto">
            <ContentFilters
              filters={filters}
              onChange={handleFilterChange}
              instructors={instructors}
              hideStatusFilter={true}
              hideContributorFilter={true}
            />
          </div>
          <Button
            onClick={() => setIsFormOpen(true)}
            className="w-full sm:w-auto shrink-0 h-[46px] xl:h-10 rounded-xl px-4 whitespace-nowrap"
          >
            <Plus className="mr-2 h-4 w-4" /> Add New Content
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <Loader />
      ) : ownersContents.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No content found"
          description="Create your first piece of content or adjust your filters."
          action={() => setIsFormOpen(true)}
          actionLabel="Add New Content"
        />
      ) : (
        <>
          <div className="flex flex-col gap-2">
            {ownersContents.map((c) => (
              <ContentCard
                key={c._id}
                content={c}
                onEdit={() => setEditingContent(c)}
                onDelete={() => setDeleteTarget(c)}
                onStatusChange={handleStatusChange}
                onViewDetails={() => navigate(`/content/${c._id}`)}
                hideDueDate={true}
                isOwnerView={true}
              />
            ))}
          </div>


        </>
      )}

      {/* Modals */}
      <ContentForm
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleCreate}
        isLoading={formLoading}
        instructors={instructors}
        isOwnerView={true}
      />
      <ContentForm
        isOpen={!!editingContent}
        onClose={() => setEditingContent(null)}
        onSubmit={handleUpdate}
        content={editingContent}
        isLoading={formLoading}
        instructors={instructors}
        isOwnerView={true}
      />

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleteLoading}
        title="Delete Content"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
      </div>
    </DashboardLayout>
  );
};
export default Content;
