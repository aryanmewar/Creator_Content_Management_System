import React, { useState, useEffect } from "react";
import {
  Plus,
  Copy,
  Trash2,
  Edit,
  ExternalLink,
  CalendarDays,
} from "lucide-react";
import toast from "react-hot-toast";
import DashboardLayout from "../components/layout/DashboardLayout";
import savedLinkService from "../services/savedLinkService";
import Loader from "../components/common/Loader";
import EmptyState from "../components/common/EmptyState";
import Button from "../components/common/Button";

const FutureProjects = () => {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    link: "",
    assignee: "",
  });
  const [editId, setEditId] = useState(null);

  const fetchLinks = async () => {
    try {
      setIsLoading(true);
      const data = await savedLinkService.getSavedLinks();
      setLinks(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load future projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.link) {
      return toast.error("Please fill in title and link");
    }

    try {
      setIsSubmitting(true);
      if (editId) {
        const updated = await savedLinkService.updateSavedLink(
          editId,
          formData,
        );
        setLinks(links.map((l) => (l._id === editId ? updated : l)));
        toast.success("Project updated successfully");
      } else {
        const created = await savedLinkService.createSavedLink(formData);
        setLinks([created, ...links]);
        toast.success("Project saved successfully");
      }
      closeForm();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this project?"))
      return;
    try {
      await savedLinkService.deleteSavedLink(id);
      setLinks(links.filter((l) => l._id !== id));
      toast.success("Project deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete project");
    }
  };

  const openEdit = (linkObj) => {
    setFormData({
      title: linkObj.title,
      link: linkObj.link,
      assignee: linkObj.assignee || "",
    });
    setEditId(linkObj._id);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setFormData({ title: "", link: "", assignee: "" });
    setEditId(null);
    setIsFormOpen(false);
  };

  const handleCopy = (link) => {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(link)
        .then(() => toast.success("Link copied to clipboard!"))
        .catch(() => fallbackCopyTextToClipboard(link));
    } else {
      fallbackCopyTextToClipboard(link);
    }
  };

  const fallbackCopyTextToClipboard = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        toast.success("Link copied to clipboard!");
      } else {
        toast.error("Browser blocked copying. Please copy manually.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to copy link");
    }
    document.body.removeChild(textArea);
  };

  return (
    <DashboardLayout>
      <div className="flex justify-end items-center mb-6">
        <Button onClick={() => setIsFormOpen(true)} className="h-10 rounded-xl">
          <Plus className="mr-2 h-4 w-4" /> Save New Project
        </Button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-5 rounded-2xl shadow-card border border-slate-200 mb-6 animate-in slide-in-from-top-4 duration-300">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">
            {editId ? "Edit Project" : "Add New Future Project"}
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-12 gap-4"
          >
            <div className="md:col-span-4">
              <label className="form-label block mb-1">
                Project Title <span className="text-red-500">*</span>
              </label>
              <input
                className="form-input"
                placeholder="e.g. Next Big Video Idea"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                autoFocus
              />
            </div>
            <div className="md:col-span-5">
              <label className="form-label block mb-1">
                Resource Link <span className="text-red-500">*</span>
              </label>
              <input
                className="form-input"
                placeholder="https://..."
                value={formData.link}
                onChange={(e) =>
                  setFormData({ ...formData, link: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-3">
              <label className="form-label block mb-1">Future Assignee</label>
              <input
                className="form-input"
                placeholder="e.g. John Doe"
                value={formData.assignee}
                onChange={(e) =>
                  setFormData({ ...formData, assignee: e.target.value })
                }
              />
            </div>
            <div className="md:col-span-12 flex justify-end gap-3 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={closeForm}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Project"}
              </Button>
            </div>
          </form>
        </div>
      )}

      {isLoading ? (
        <Loader />
      ) : links.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="No future projects yet"
          description="Save ideas and resource links for your upcoming content projects."
          action={() => setIsFormOpen(true)}
          actionText="Add your first project"
        />
      ) : (
        <div className="space-y-4">
          {/* Mobile Card View */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {links.map((linkObj) => (
              <div key={linkObj._id} className="card p-5 space-y-4">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-base">
                      {linkObj.title}
                    </h3>
                    <div className="mt-2">
                      {linkObj.assignee ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {linkObj.assignee}
                        </span>
                      ) : (
                        <span className="text-sm text-slate-400 italic">
                          Unassigned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(linkObj)}
                      className="p-2 text-slate-400 hover:text-primary bg-slate-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(linkObj._id)}
                      className="p-2 text-slate-400 hover:text-red-600 bg-slate-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  <p className="text-xs text-slate-500 font-medium mb-2">
                    LINK
                  </p>
                  <div className="flex items-center justify-between gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <div className="truncate text-sm text-slate-600 font-medium max-w-[200px]">
                      {linkObj.link}
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleCopy(linkObj.link)}
                        className="p-1.5 text-slate-500 hover:text-primary hover:bg-white rounded-md transition-colors shadow-sm bg-white"
                        title="Copy Link"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={linkObj.link}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 text-slate-500 hover:text-blue-500 hover:bg-white rounded-md transition-colors shadow-sm bg-white"
                        title="Open Link"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold w-1/3">Title</th>
                    <th className="px-6 py-4 font-semibold w-1/4">
                      Future Assignee
                    </th>
                    <th className="px-6 py-4 font-semibold flex-1">Link</th>
                    <th className="px-6 py-4 font-semibold text-right w-24">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {links.map((linkObj) => (
                    <tr
                      key={linkObj._id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {linkObj.title}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        {linkObj.assignee ? (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {linkObj.assignee}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400 italic">
                            Unassigned
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="max-w-[200px] sm:max-w-[300px] truncate text-sm text-slate-600">
                            {linkObj.link}
                          </div>
                          <button
                            onClick={() => handleCopy(linkObj.link)}
                            className="p-1.5 text-slate-400 hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                            title="Copy Link"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <a
                            href={linkObj.link}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                            title="Open Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => openEdit(linkObj)}
                            className="p-1.5 text-slate-400 hover:text-primary bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg shadow-sm"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(linkObj._id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 bg-white hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg shadow-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default FutureProjects;
