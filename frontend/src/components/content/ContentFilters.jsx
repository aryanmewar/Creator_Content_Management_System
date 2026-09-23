import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import Select from '../common/Select.jsx';
import AnimatedSearch from '../common/AnimatedSearch.jsx';
import Button from '../common/Button.jsx';
import { CONTENT_TYPES, CONTENT_STATUSES } from '../../utils/constants.js';

const statusOptions = Object.values(CONTENT_STATUSES).map((s) => ({ label: s.replace('_', ' '), value: s }));
const typeOptions = CONTENT_TYPES.map((t) => ({ label: t, value: t }));

const ContentFilters = ({ filters, onChange, instructors = [], hideStatusFilter = false, hideContributorFilter = false }) => {
  const instructorOptions = instructors.map((i) => ({ label: i.name, value: i._id }));

  const hasActiveFilters = filters.status || filters.contentType || filters.instructor || filters.search;

  const clearAll = () => {
    onChange({ search: '', status: '', contentType: '', instructor: '', page: 1 });
  };

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-3 items-stretch w-full">
      <AnimatedSearch
          placeholder="Search content..."
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value, page: 1 })}
          className="w-full sm:w-60 focus-within:sm:w-80 h-[46px] [&>div:last-child]:rounded-xl [&>div:first-child]:rounded-xl"
        />

        {!hideStatusFilter && (
          <Select
            options={statusOptions}
            placeholder="All Statuses"
            value={filters.status || ''}
            onChange={(e) => onChange({ status: e.target.value, page: 1 })}
            className="w-full sm:w-44 h-[46px] [&>div]:rounded-xl [&>div]:h-full"
          />
        )}

        <Select
          options={typeOptions}
          placeholder="All Types"
          value={filters.contentType || ''}
          onChange={(e) => onChange({ contentType: e.target.value, page: 1 })}
          className="w-full sm:w-44 h-[46px] [&>div]:rounded-xl [&>div]:h-full"
        />

        {!hideContributorFilter && instructors.length > 0 && (
          <Select
            options={instructorOptions}
            placeholder="All Contributors"
            value={filters.instructor || ''}
            onChange={(e) => onChange({ instructor: e.target.value, page: 1 })}
            className="w-full sm:w-44 h-[46px] [&>div]:rounded-xl [&>div]:h-full"
          />
        )}

    </div>
  );
};

export default ContentFilters;
