import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MoreHorizontal, Edit2, Trash2, PowerOff, Eye } from 'lucide-react';
import { getInitials } from '../../utils/formatUtils.js';

const InstructorTable = ({ instructors, onEdit, onToggleStatus }) => {
  const navigate = useNavigate();

  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <table className="w-full text-left text-sm text-slate-700">
        <thead className="text-[11px] uppercase tracking-wider text-slate-500 bg-slate-50 border-b border-slate-200">
          <tr>
            <th scope="col" className="px-4 py-4 font-medium w-12 text-center">#</th>
            <th scope="col" className="px-4 py-4 font-medium">Name</th>
            <th scope="col" className="px-4 py-4 font-medium">Role</th>
            <th scope="col" className="px-4 py-4 font-medium">Email</th>
            <th scope="col" className="px-4 py-4 font-medium">Status</th>
            <th scope="col" className="px-4 py-2 font-medium border-l border-slate-200" colSpan="4">
              <div className="border-b border-slate-200 pb-2 mb-2 w-full text-center">Assignments</div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                <span>Total</span>
                <span>Done</span>
                <span>Pending</span>
                <span>Overdue</span>
              </div>
            </th>
            <th scope="col" className="px-4 py-4 font-medium border-l border-slate-200">Last Active</th>
            <th scope="col" className="px-4 py-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {instructors.map((instructor, index) => {
            const { _id, name, email, designation, profileImage, isActive, stats } = instructor;
            const total = stats?.total ?? 0;
            const completed = stats?.completed ?? 0;
            const pending = stats?.pending ?? 0;
            const overdue = stats?.overdue ?? 0;
            
            return (
              <tr key={_id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-4 py-4 text-center font-medium text-slate-500">{index + 1}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {profileImage?.url ? (
                        <img src={profileImage.url} alt={name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold ring-2 ring-white">
                          {getInitials(name)}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-slate-900">{name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 text-slate-500 text-xs">{designation || 'Instructor'}</td>
                <td className="px-4 py-4 text-slate-500 text-xs">{email}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                    <span className={isActive ? 'text-emerald-600 font-medium text-xs' : 'text-slate-500 font-medium text-xs'}>
                      {isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-center border-l border-slate-100" colSpan="4">
                  <div className="grid grid-cols-4 gap-2 text-sm font-semibold">
                    <span className="text-slate-700">{total}</span>
                    <span className="text-emerald-600">{completed}</span>
                    <span className="text-amber-500">{pending}</span>
                    <span className="text-rose-500">{overdue}</span>
                  </div>
                </td>
                <td className="px-4 py-4 border-l border-slate-100">
                  <span className={isActive ? 'text-emerald-600 text-xs font-medium' : 'text-slate-500 text-xs font-medium'}>
                    {isActive ? 'Online' : '2 days ago'}
                  </span>
                </td>
                <td className="px-4 py-4 text-right relative">
                  <div className="relative group/menu inline-block">
                    <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-full mt-1 w-36 z-50 opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-200 transform origin-top-right translate-y-1 group-hover/menu:translate-y-0">
                      <div className="bg-white border border-slate-200 rounded-xl shadow-lg p-1 overflow-hidden">
                        <button onClick={() => navigate(`/instructors/${_id}`)} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-600 rounded-lg flex items-center transition-colors">
                          <Eye className="w-3.5 h-3.5 mr-2" /> View Profile
                        </button>
                        <button onClick={() => onEdit(instructor)} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-primary-600 rounded-lg flex items-center transition-colors">
                          <Edit2 className="w-3.5 h-3.5 mr-2" /> Edit Details
                        </button>
                        <div className="h-px bg-slate-100 my-1 mx-2" />
                        <button onClick={() => onToggleStatus(instructor)} className={`w-full text-left px-3 py-2 text-xs font-medium rounded-lg flex items-center transition-colors ${isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                          <PowerOff className="w-3.5 h-3.5 mr-2" /> {isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default InstructorTable;
