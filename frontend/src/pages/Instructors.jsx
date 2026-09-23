import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Search, Users, ShieldCheck, XCircle, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import InstructorTable from '../components/instructors/InstructorTable.jsx';
import InstructorCard from '../components/instructors/InstructorCard.jsx';
import InstructorForm from '../components/instructors/InstructorForm.jsx';
import ConfirmDialog from '../components/common/ConfirmDialog.jsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Loader from '../components/common/Loader.jsx';
import EmptyState from '../components/common/EmptyState.jsx';
import { useInstructorContext } from '../context/InstructorContext.jsx';
import { instructorService } from '../services/instructorService.js';
import useDebounce from '../hooks/useDebounce.js';
import AnimatedSearch from '../components/common/AnimatedSearch.jsx';

const Instructors = () => {
  const { instructors, isLoading, fetchInstructors, dispatch } = useInstructorContext();
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInstructor, setEditingInstructor] = useState(null);
  const [toggleTarget, setToggleTarget] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  useEffect(() => {
    fetchInstructors({ search: debouncedSearch });
  }, [debouncedSearch, fetchInstructors]);

  const handleCreate = async (formData) => {
    setFormLoading(true);
    try {
      const response = await instructorService.createInstructor(formData);
      dispatch({ type: 'ADD_INSTRUCTOR', payload: response.data });
      toast.success('Contributor created successfully!');
      setIsFormOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create contributor.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (formData) => {
    setFormLoading(true);
    try {
      const response = await instructorService.updateInstructor(editingInstructor._id, formData);
      dispatch({ type: 'UPDATE_INSTRUCTOR', payload: response.data });
      toast.success('Contributor updated successfully!');
      setEditingInstructor(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update contributor.');
    } finally {
      setFormLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!toggleTarget) return;
    setConfirmLoading(true);
    try {
      const newStatus = !toggleTarget.isActive;
      const response = await instructorService.updateStatus(toggleTarget._id, newStatus);
      dispatch({ type: 'UPDATE_INSTRUCTOR', payload: response.data });
      toast.success(`Contributor ${newStatus ? 'activated' : 'deactivated'} successfully.`);
      setToggleTarget(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setConfirmLoading(false);
    }
  };



  const stats = useMemo(() => {
    return {
      total: instructors.length,
      active: instructors.filter(i => i.isActive).length,
      inactive: instructors.filter(i => !i.isActive).length,
      assignments: instructors.reduce((acc, curr) => acc + (curr.stats?.total || 0), 0)
    };
  }, [instructors]);

  return (
    <DashboardLayout>
      <div className="font-sans">
        
        {/* Top Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500 font-medium">Total Contributors</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.active}</p>
              <p className="text-xs text-slate-500 font-medium">Active</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.inactive}</p>
              <p className="text-xs text-slate-500 font-medium">Inactive</p>
            </div>
          </div>
          <div className="bg-white border border-slate-200 shadow-sm rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.assignments}</p>
              <p className="text-xs text-slate-500 font-medium">Total Assignments</p>
            </div>
          </div>
        </div>

        {/* Actions and Search */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <AnimatedSearch
            placeholder="Search by name, email, or designation..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md focus-within:max-w-2xl"
          />
          <Button onClick={() => setIsFormOpen(true)} className="w-full sm:w-auto shrink-0">
            <Plus className="mr-2 h-4 w-4" /> Add Contributor
          </Button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><Loader /></div>
        ) : instructors.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No contributors found"
            description="Try adjusting your filters or add a new contributor."
            action={() => setIsFormOpen(true)}
            actionLabel="Add Contributor"
          />
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden xl:block">
              <InstructorTable 
                instructors={instructors} 
                onEdit={(i) => setEditingInstructor(i)}
                onToggleStatus={(i) => setToggleTarget(i)}
              />
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid xl:hidden grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {instructors.map((instructor) => (
                <InstructorCard
                  key={instructor._id}
                  instructor={instructor}
                  onEdit={(i) => setEditingInstructor(i)}
                  onToggleStatus={(i) => setToggleTarget(i)}
                />
              ))}
            </div>
          </>
        )}

        {/* Modals remain the same */}
        <InstructorForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          onSubmit={handleCreate}
          isLoading={formLoading}
        />

        <InstructorForm
          isOpen={!!editingInstructor}
          onClose={() => setEditingInstructor(null)}
          onSubmit={handleUpdate}
          instructor={editingInstructor}
          isLoading={formLoading}
        />

        <ConfirmDialog
          isOpen={!!toggleTarget}
          onClose={() => setToggleTarget(null)}
          onConfirm={handleToggleStatus}
          loading={confirmLoading}
          title={toggleTarget?.isActive ? 'Deactivate Contributor' : 'Activate Contributor'}
          message={
            toggleTarget?.isActive
              ? `Deactivating "${toggleTarget?.name}" will prevent new content from being assigned to them. Historical data will be preserved.`
              : `This will allow "${toggleTarget?.name}" to receive new content assignments.`
          }
          confirmLabel={toggleTarget?.isActive ? 'Deactivate' : 'Activate'}
          variant={toggleTarget?.isActive ? 'destructive' : 'default'}
        />
      </div>
    </DashboardLayout>
  );
};

export default Instructors;
