import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from "date-fns";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  X,
  Clock,
} from "lucide-react";
import { getRealDate } from "../../utils/dateUtils.js";

/**
 * Parses any date value (YYYY-MM-DD string, ISO string, Date object) into a safe Date or null.
 */
const parseDateValue = (val) => {
  if (!val) return null;
  if (val instanceof Date && !isNaN(val.getTime())) return val;
  if (typeof val === "string") {
    const parts = val.split("T")[0].split("-");
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);
      if (!isNaN(d.getTime())) return d;
    }
    const d = new Date(val);
    if (!isNaN(d.getTime())) return d;
  }
  return null;
};

const DatePicker = ({
  value,
  onChange,
  name,
  id,
  placeholder = "Select date...",
  min,
  max,
  disabled = false,
  error = false,
  className = "",
  style = {},
  allowClear = true,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const dropdownRef = useRef(null);

  const selectedDate = useMemo(() => parseDateValue(value), [value]);
  const minDate = useMemo(() => parseDateValue(min), [min]);
  const maxDate = useMemo(() => parseDateValue(max), [max]);

  // Live real-time clock inside DatePicker
  const [currentLiveTime, setCurrentLiveTime] = useState(() => getRealDate());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setCurrentLiveTime(getRealDate());
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  // Current viewed month in calendar
  const [viewDate, setViewDate] = useState(() => selectedDate || getRealDate());
  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);

  // Keep viewDate synchronized when selected date changes externally
  if (selectedDate !== prevSelectedDate) {
    setPrevSelectedDate(selectedDate);
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }

  // Positioning calculations for Portal popup (fixed position relative to viewport)
  const [coords, setCoords] = useState({
    top: 0,
    left: 0,
    dropUp: false,
  });

  const updatePlacement = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current?.offsetHeight || 370;
    const dropdownWidth = dropdownRef.current?.offsetWidth || 308;
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const spaceBelow = viewportHeight - rect.bottom - 8;
    const spaceAbove = rect.top - 8;

    // Prefer dropping up if insufficient room below AND more room above than below
    const dropUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;

    let top = 0;
    if (dropUp) {
      top = rect.top - dropdownHeight - 6;
      if (top < 8) top = 8;
    } else {
      top = rect.bottom + 6;
      if (top + dropdownHeight > viewportHeight - 8) {
        top = Math.max(8, viewportHeight - dropdownHeight - 8);
      }
    }

    let left = rect.left;
    if (left + dropdownWidth > viewportWidth - 12) {
      left = rect.right - dropdownWidth;
    }
    left = Math.max(8, Math.min(left, viewportWidth - dropdownWidth - 8));

    setCoords({
      top: Math.round(top),
      left: Math.round(left),
      dropUp,
    });
  }, []);

  // Update placement on open, scroll, or resize
  useEffect(() => {
    if (!isOpen) return;

    updatePlacement();

    const handleScrollOrResize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        // If trigger has scrolled completely off-screen, close the dropdown
        if (rect.bottom < 5 || rect.top > window.innerHeight - 5) {
          setIsOpen(false);
          return;
        }
      }
      updatePlacement();
    };

    window.addEventListener("scroll", handleScrollOrResize, true);
    window.addEventListener("resize", handleScrollOrResize);

    return () => {
      window.removeEventListener("scroll", handleScrollOrResize, true);
      window.removeEventListener("resize", handleScrollOrResize);
    };
  }, [isOpen, updatePlacement]);

  // Recalculate accurately once dropdown DOM is mounted
  useEffect(() => {
    if (isOpen) {
      const raf = requestAnimationFrame(() => {
        updatePlacement();
      });
      return () => cancelAnimationFrame(raf);
    }
  }, [isOpen, updatePlacement]);

  // Click outside and escape key listeners to close popup
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Calendar dates generation
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [viewDate]);

  const handleSelectDate = (date) => {
    if (disabled) return;
    const formatted = format(date, "yyyy-MM-dd");

    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || id,
          value: formatted,
        },
        value: formatted,
      };
      onChange(syntheticEvent);
    }
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    if (disabled) return;
    if (onChange) {
      const syntheticEvent = {
        target: {
          name: name || id,
          value: "",
        },
        value: "",
      };
      onChange(syntheticEvent);
    }
  };

  const handlePrevMonth = (e) => {
    e.stopPropagation();
    setViewDate((prev) => subMonths(prev, 1));
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    setViewDate((prev) => addMonths(prev, 1));
  };

  const handleTodayClick = (e) => {
    e.stopPropagation();
    const today = getRealDate();
    handleSelectDate(today);
  };

  const isDateDisabled = (date) => {
    if (minDate) {
      const minD = new Date(minDate);
      minD.setHours(0, 0, 0, 0);
      if (date < minD) return true;
    }
    if (maxDate) {
      const maxD = new Date(maxDate);
      maxD.setHours(23, 59, 59, 999);
      if (date > maxD) return true;
    }
    return false;
  };

  const weekDayLabels = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

  return (
    <div
      ref={containerRef}
      className={`relative inline-block w-full ${className}`}
      style={style}
    >
      {/* Trigger Button */}
      <div
        id={id}
        tabIndex={disabled ? -1 : 0}
        onClick={() => {
          if (!disabled) setIsOpen((prev) => !prev);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            if (!disabled) setIsOpen((prev) => !prev);
          }
        }}
        className={`w-full min-h-[44px] h-[44px] px-3 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 select-none group text-xs sm:text-sm ${
          error
            ? "border-rose-400 ring-2 ring-rose-200 bg-rose-50/20"
            : isOpen
              ? "border-[#2D4396] ring-2 ring-[#2D4396]/20 bg-white shadow-sm"
              : "border-slate-200 hover:border-slate-300 hover:bg-white"
        } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <CalendarIcon
            className={`w-4 h-4 shrink-0 transition-colors ${
              selectedDate
                ? "text-[#2D4396]"
                : "text-slate-400 group-hover:text-slate-600"
            }`}
          />
          <span
            className={`truncate font-medium ${
              selectedDate ? "text-slate-800" : "text-slate-400"
            }`}
          >
            {selectedDate ? format(selectedDate, "dd MMM yyyy") : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1 shrink-0 ml-1">
          {allowClear && selectedDate && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors"
              title="Clear date"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Calendar Popup Dropdown rendered into Portal to escape modal overflow clipping */}
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={dropdownRef}
            data-datepicker-portal="true"
            className="fixed z-[99999] bg-white border border-slate-200/90 shadow-[0_20px_50px_rgba(15,23,42,0.25),0_0_0_1px_rgba(15,23,42,0.06)] rounded-2xl p-4 w-[308px] max-w-[calc(100vw-24px)] animate-in fade-in zoom-in-95 duration-150 select-none backdrop-blur-sm"
            style={{
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
          >
            {/* Real-Time Live Status Bar */}
            <div className="mb-2.5 pb-2 border-b border-slate-100 flex items-center justify-between px-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Real Time:
              </span>
              <span className="font-semibold text-[#2D4396] tabular-nums flex items-center gap-1 bg-indigo-50/80 px-2 py-0.5 rounded-full border border-indigo-100/80 text-[11px]">
                <Clock className="w-3 h-3 text-[#2D4396]" />
                {format(currentLiveTime, "hh:mm:ss a")}
              </span>
            </div>

            {/* Header Month / Year & Nav */}
            <div className="flex items-center justify-between mb-2 px-1">
              <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                {format(viewDate, "MMMM yyyy")}
              </h4>
              <div className="flex items-center gap-0.5">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Labels Header */}
            <div className="grid grid-cols-7 gap-1 mb-1 text-center">
              {weekDayLabels.map((day) => (
                <span
                  key={day}
                  className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-0.5"
                >
                  {day}
                </span>
              ))}
            </div>

            {/* Dates Grid */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {calendarDays.map((date) => {
                const isCurrentMonth = isSameMonth(date, viewDate);
                const isSelected =
                  selectedDate && isSameDay(date, selectedDate);
                const isCurrentDay = isToday(date);
                const disabledDay = isDateDisabled(date);

                return (
                  <button
                    key={date.toISOString()}
                    type="button"
                    disabled={disabledDay}
                    onClick={() => handleSelectDate(date)}
                    className={`h-8 w-8 mx-auto flex items-center justify-center text-xs font-medium rounded-xl transition-all relative ${
                      disabledDay
                        ? "opacity-25 cursor-not-allowed text-slate-400"
                        : isSelected
                          ? "bg-[#2D4396] text-white font-bold shadow-md shadow-indigo-600/30 scale-105"
                          : isCurrentMonth
                            ? isCurrentDay
                              ? "text-[#2D4396] font-bold bg-indigo-50/80 hover:bg-[#2D4396] hover:text-white"
                              : "text-slate-700 hover:bg-indigo-50/70 hover:text-[#2D4396]"
                            : "text-slate-300 hover:bg-slate-50 hover:text-slate-500"
                    }`}
                  >
                    {format(date, "d")}
                    {isCurrentDay && !isSelected && (
                      <span className="absolute bottom-1 w-1 h-1 rounded-full bg-[#2D4396]" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Footer Actions (Today / Clear) */}
            <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs px-1">
              <button
                type="button"
                onClick={handleClear}
                className="text-slate-500 hover:text-rose-600 font-semibold transition-colors py-1 px-2 rounded-lg hover:bg-slate-50"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={handleTodayClick}
                className="text-[#2D4396] hover:text-indigo-800 font-semibold transition-colors bg-indigo-50/80 hover:bg-indigo-100/80 py-1.5 px-3 rounded-xl flex items-center gap-1"
              >
                <span>Today</span>
                <span className="text-[11px] opacity-75">
                  ({format(currentLiveTime, "dd MMM")})
                </span>
              </button>
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
};

export default DatePicker;
