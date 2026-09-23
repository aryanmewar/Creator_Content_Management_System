import React, { useEffect, useState } from 'react';
import { Plus, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import ContentCard from '../components/content/ContentCard.jsx';
import ContentForm from '../components/content/ContentForm.jsx';
import ContentFilters from '../components/content/ContentFilters.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { Button } from '@/components/ui/button';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useContentContext } from '../context/ContentContext.jsx';
import { contentService } from '../services/contentService.js';
import { instructorService } from '../services/instructorService.js';
import { useNavigate } from 'react-router-dom';

const STATUS_TABS = ['All', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'APPROVED', 'SCHEDULED', 'PUBLISHED'];

const AssignContent = () => {
  const navigate = useNavigate();
  const { contents, isLoading, filters, dispatch, fetchContent } = useContentContext();
  const [activeTab, setActiveTab] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContent, setEditingContent] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [instructors, setInstructors] = useState([]);

  useEffect(() => {
    const params = activeTab === 'All' ? { ...filters, status: '' } : { ...filters, status: activeTab };
    fetchContent(params);
  }, [activeTab, filters.search, filters.contentType, filters.instructor, filters.page]);

  useEffect(() => {
    instructorService.getInstructors({ limit: 100 }).then((r) => setInstructors(r.data || []));
  }, []);

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      const response = await contentService.createContent(data);
      dispatch({ type: 'ADD_CONTENT', payload: response.data });
      toast.success('Content created!');
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create content.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      const response = await contentService.updateContent(editingContent._id, data);
      dispatch({ type: 'UPDATE_CONTENT', payload: response.data });
      toast.success('Content updated!');
      setEditingContent(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update content.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusChange = async (contentId, newStatus, extraData = {}) => {
    try {
      const response = await contentService.updateContentStatus(contentId, newStatus, null, extraData);
      dispatch({ type: 'UPDATE_CONTENT', payload: response.data });
      setActiveTab(newStatus);
      toast.success('Status updated!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await contentService.deleteContent(deleteTarget._id);
      dispatch({ type: 'REMOVE_CONTENT', payload: deleteTarget._id });
      toast.success('Content deleted.');
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete content.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleFilterChange = (newFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: newFilters });
  };

  // Filter content to ONLY show items that have additional contributors
  const assignedContents = contents.filter(c => c.contributors && c.contributors.length > 0);

  return (
    <DashboardLayout>
      {/* Tabs, Filters, and Actions */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mb-5">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1 overflow-x-auto no-scrollbar w-full xl:w-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${activeTab === tab
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                }`}
            >
              {tab === 'All' ? 'All Content' : tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          <ContentFilters
            filters={filters}
            onChange={handleFilterChange}
            instructors={instructors}
            hideStatusFilter={true}
          />
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto shrink-0 h-[46px] rounded-xl">
            <Plus className="mr-2 h-4 w-4" /> Add New Content
          </Button>
        </div>
      </div>

      {/* Content Grid */}
      {isLoading ? (
        <Loader />
      ) : assignedContents.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title="No contributors content found"
          description="There is currently no content assigned to additional contributors."
          action={() => setIsFormOpen(true)}
          actionLabel="Add New Content"
        />
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {assignedContents.map((c) => (
              <ContentCard
                key={c._id}
                content={c}
                onEdit={() => setEditingContent(c)}
                onDelete={() => setDeleteTarget(c)}
                onStatusChange={handleStatusChange}
                onViewDetails={() => navigate(`/content/${c._id}`)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modals */}
      <ContentForm isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSubmit={handleCreate} isLoading={formLoading} instructors={instructors} />
      <ContentForm isOpen={!!editingContent} onClose={() => setEditingContent(null)} onSubmit={handleUpdate} content={editingContent} isLoading={formLoading} instructors={instructors} />

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
    </DashboardLayout>
  );
};

export default AssignContent;
