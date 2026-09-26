import React, { useMemo } from "react";
import Select from "../common/Select.jsx";
import AnimatedSearch from "../common/AnimatedSearch.jsx";
import { CONTENT_TYPES, CONTENT_STATUSES } from "../../utils/constants.js";
import { generateMonthOptions } from "../../utils/dateUtils.js";

const statusOptions = Object.values(CONTENT_STATUSES).map((s) => ({
  label: s.replace("_", " "),
  value: s,
}));
const typeOptions = CONTENT_TYPES.map((t) => ({ label: t, value: t }));

const ContentFilters = ({
  filters,
  onChange,
  instructors = [],
  hideStatusFilter = false,
  hideContributorFilter = false,
}) => {
  const instructorOptions = instructors.map((i) => ({
    label: i.name,
    value: i._id,
  }));

  const _hasActiveFilters =
    filters.status ||
    filters.contentType ||
    filters.instructor ||
    filters.search;

  const _clearAll = () => {
    onChange({
      search: "",
      status: "",
      contentType: "",
      instructor: "",
      month: "",
      page: 1,
    });
  };

  const monthOptions = useMemo(() => generateMonthOptions(), []);

  return (
    <div className="flex flex-row flex-wrap gap-2 items-center p-1.5 w-full sm:w-auto">
      <AnimatedSearch
        placeholder="Search..."
        value={filters.search || ""}
        onChange={(e) => onChange({ search: e.target.value, page: 1 })}
        className="flex-1 min-w-[45%] sm:min-w-0 sm:flex-none sm:w-40 h-10 [&>div:last-child]:rounded-xl [&>div:first-child]:rounded-xl"
      />

      {!hideStatusFilter && (
        <Select
          options={statusOptions}
          placeholder="All Statuses"
          value={filters.status || ""}
          onChange={(e) => onChange({ status: e.target.value, page: 1 })}
          className="flex-1 min-w-[45%] sm:min-w-0 sm:flex-none sm:w-40 h-10 [&>div]:rounded-xl [&>div]:h-full"
        />
      )}

      <Select
        options={monthOptions}
        placeholder="All Months"
        value={filters.month || ""}
        onChange={(e) => onChange({ month: e.target.value, page: 1 })}
        className="flex-1 min-w-[45%] sm:min-w-0 sm:flex-none sm:w-40 h-10 [&>div]:rounded-xl [&>div]:h-full"
      />

      <Select
        options={typeOptions}
        placeholder="All Types"
        value={filters.contentType || ""}
        onChange={(e) => onChange({ contentType: e.target.value, page: 1 })}
        className="flex-1 min-w-[45%] sm:min-w-0 sm:flex-none sm:w-40 h-10 [&>div]:rounded-xl [&>div]:h-full"
      />

      {!hideContributorFilter && instructors.length > 0 && (
        <Select
          options={instructorOptions}
          placeholder="Contributors"
          value={filters.instructor || ""}
          onChange={(e) => onChange({ instructor: e.target.value, page: 1 })}
          className="flex-1 min-w-[45%] sm:min-w-0 sm:flex-none sm:w-40 h-10 [&>div]:rounded-xl [&>div]:h-full"
        />
      )}
    </div>
  );
};

export default ContentFilters;
