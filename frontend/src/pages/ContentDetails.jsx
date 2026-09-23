import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Calendar, User, CheckCircle, XCircle, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import Loader from '../components/common/Loader.jsx';
import Button from '../components/common/Button.jsx';
import Badge from '../components/common/Badge.jsx';
import Modal from '../components/common/Modal.jsx';
import Select from '../components/common/Select.jsx';
import Input from '../components/common/Input.jsx';
import { contentService } from '../services/contentService.js';
import { publicationService } from '../services/publicationService.js';
import { getStatusColor, getStatusLabel, getPriorityColor, getPlatformColor, getAllowedTransitions } from '../utils/statusUtils.js';
import { formatDate, formatRelative } from '../utils/dateUtils.js';
import { PLATFORMS } from '../utils/constants.js';

const ContentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [content, setContent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statusLoading, setStatusLoading] = useState(false);
  const [pubModalOpen, setPubModalOpen] = useState(false);
  const [pubForm, setPubForm] = useState({ platform: '', postUrl: '', publishedAt: '' });
  const [pubLoading, setPubLoading] = useState(false);

  const loadContent = async () => {
    try {
      const res = await contentService.getContentById(id);
      setContent(res.data);
    } catch {
      navigate('/content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadContent(); }, [id]);

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true);
    try {
      await contentService.updateContentStatus(id, newStatus);
      await loadContent();
      toast.success(`Status updated to ${newStatus}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Status update failed.');
    } finally {
      setStatusLoading(false);
    }
  };

  const handlePublish = async () => {
    setPubLoading(true);
    try {
      await publicationService.createPublication({ contentId: id, ...pubForm });
      await loadContent();
      toast.success(`Published on ${pubForm.platform}!`);
      setPubModalOpen(false);
      setPubForm({ platform: '', postUrl: '', publishedAt: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to log publication.');
    } finally {
      setPubLoading(false);
    }
  };

  if (isLoading) return <DashboardLayout><Loader /></DashboardLayout>;
  if (!content) return null;

  const allowedTransitions = getAllowedTransitions(content.status);

  return (
    <DashboardLayout>
      <button onClick={() => navigate('/content')} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Content
      </button>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="xl:col-span-2 space-y-6">
          <div className="card p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">{content.title}</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="badge bg-slate-100 text-slate-600">{content.contentType}</span>
                  <span className={`badge ${getStatusColor(content.status)}`}>{getStatusLabel(content.status)}</span>
                </div>
              </div>
            </div>

            {content.referenceLink && (
              <a href={content.referenceLink} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-primary-600 hover:text-primary-700 mb-4">
                <ExternalLink className="w-4 h-4" />
                {content.referenceLink}
              </a>
            )}

            {content.notes && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-sm text-slate-600 whitespace-pre-wrap">{content.notes}</p>
              </div>
            )}

            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
              <span>Created by {content.createdBy?.name}</span>
              <span>{formatDate(content.createdAt)}</span>
            </div>
          </div>

          {/* Assignment Info */}
          {content.assignment && (
            <div className="card p-6">
              <h3 className="section-title mb-4">Assignment Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Instructor</p>
                  <p className="text-sm font-medium text-slate-800">{content.instructor?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Assigned Date</p>
                  <p className="text-sm font-medium text-slate-800">{formatDate(content.assignment.assignedAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Deadline</p>
                  <p className={`text-sm font-medium ${content.assignment.deadlineState === 'OVERDUE' ? 'text-red-500' : 'text-slate-800'}`}>
                    {formatDate(content.assignment.deadline)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Publications */}
          {content.publications?.length > 0 && (
            <div className="card p-6">
              <h3 className="section-title mb-4">Publication History</h3>
              <div className="space-y-3">
                {content.publications.map((pub) => (
                  <div key={pub._id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
                    <span className={`badge ${getPlatformColor(pub.platform)}`}>{pub.platform}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-500">{formatDate(pub.publishedAt)}</p>
                    </div>
                    <a href={pub.postUrl} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                      <ExternalLink className="w-3 h-3" />
                      View
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          {/* Status transitions */}
          {allowedTransitions.length > 0 && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Update Status</h3>
              <div className="space-y-2">
                {allowedTransitions.map((status) => (
                  <Button
                    key={status}
                    variant="secondary"
                    className="w-full justify-start"
                    loading={statusLoading}
                    onClick={() => handleStatusChange(status)}
                  >
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Move to {getStatusLabel(status)}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Log Publication */}
          {['APPROVED', 'SCHEDULED', 'PUBLISHED'].includes(content.status) && (
            <div className="card p-5">
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Log Publication</h3>
              <Button variant="primary" className="w-full" icon={Globe} onClick={() => setPubModalOpen(true)}>
                Add Publication URL
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Publication Modal */}
      <Modal isOpen={pubModalOpen} onClose={() => setPubModalOpen(false)} title="Log Publication"
        footer={
          <>
            <Button variant="secondary" onClick={() => setPubModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handlePublish} loading={pubLoading}
              disabled={!pubForm.platform || !pubForm.postUrl || !pubForm.publishedAt}>
              Save Publication
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Select
            label="Platform" required
            options={PLATFORMS.map((p) => ({ label: p, value: p }))}
            value={pubForm.platform}
            onChange={(e) => setPubForm((f) => ({ ...f, platform: e.target.value }))}
          />
          <Input
            label="Post URL" type="url" required
            placeholder="https://instagram.com/p/..."
            value={pubForm.postUrl}
            onChange={(e) => setPubForm((f) => ({ ...f, postUrl: e.target.value }))}
          />
          <Input
            label="Published Date" type="date" required
            value={pubForm.publishedAt}
            onChange={(e) => setPubForm((f) => ({ ...f, publishedAt: e.target.value }))}
          />
        </div>
      </Modal>
    </DashboardLayout>
  );
};

export default ContentDetails;
