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
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
  const [prevSelectedDate, setPrevSelectedDate] = useState(selectedDate);

  // Keep viewDate synchronized when selected date changes externally
  if (selectedDate !== prevSelectedDate) {
    setPrevSelectedDate(selectedDate);
    if (selectedDate) {
      setViewDate(selectedDate);
    }
  }

  // Exact fixed coordinates for the portal popup
  const [coords, setCoords] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const popupWidth = 305;
    const popupHeight = 365;

    // By default, align popup to the left edge of the input (extends to the right)
    let left = rect.left;

    // If opening to the right would overflow the screen edge, shift left
    if (left + popupWidth > window.innerWidth - 16) {
      left = window.innerWidth - popupWidth - 16;
    }

    // Never let it go off-screen to the left (behind sidebar or viewport edge)
    if (left < 16) {
      left = 16;
    }

    // By default open below the input
    let top = rect.bottom + 6;

    // If not enough room below and room above exists, flip to open above
    if (
      top + popupHeight > window.innerHeight - 12 &&
      rect.top > popupHeight + 12
    ) {
      top = rect.top - popupHeight - 6;
    }

    setCoords({ top, left });
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();

    const handleUpdate = () => {
      updatePosition();
    };

    window.addEventListener("scroll", handleUpdate, true);
    window.addEventListener("resize", handleUpdate);
    return () => {
      window.removeEventListener("scroll", handleUpdate, true);
      window.removeEventListener("resize", handleUpdate);
    };
  }, [isOpen, updatePosition]);

  // Click outside listener to close popup (works cleanly across portal boundary)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      const inTrigger =
        containerRef.current && containerRef.current.contains(e.target);
      const inDropdown =
        dropdownRef.current && dropdownRef.current.contains(e.target);

      if (!inTrigger && !inDropdown) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
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
    const today = new Date();
    handleSelectDate(today);
  };

  const isDateDisabled = (date) => {
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) return true;
    if (maxDate && date > new Date(maxDate.setHours(23, 59, 59, 999)))
      return true;
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
        className={`w-full min-h-[44px] h-[44px] px-3.5 bg-slate-50 border rounded-xl flex items-center justify-between cursor-pointer transition-all duration-200 select-none group text-sm ${
          error
            ? "border-rose-400 ring-2 ring-rose-200 bg-rose-50/20"
            : isOpen
              ? "border-[#2D4396] ring-2 ring-[#2D4396]/20 bg-white shadow-sm"
              : "border-slate-200 hover:border-slate-300 hover:bg-white"
        } ${disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : ""}`}
      >
        <div className="flex items-center gap-2.5 truncate">
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
            {selectedDate ? format(selectedDate, "dd MMM, yyyy") : placeholder}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-2">
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

      {/* Custom Portal Calendar Popup — 100% Solid, Fully Opaque, Z-Index 99999 */}
      {isOpen &&
        createPortal(
          <div
            ref={dropdownRef}
            style={{
              position: "fixed",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
              zIndex: 99999,
            }}
            className="bg-white border border-slate-200 shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35),0_0_0_1px_rgba(15,23,42,0.08)] rounded-2xl p-4 w-[305px] max-w-[calc(100vw-32px)] animate-in fade-in zoom-in-95 duration-150 select-none"
          >
            {/* Real-Time Live Status Bar */}
            <div className="mb-3 pb-2.5 border-b border-slate-100 flex items-center justify-between px-1 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-medium text-slate-600">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Real Time:
              </span>
              <span className="font-semibold text-[#2D4396] tabular-nums flex items-center gap-1 bg-indigo-50/80 px-2.5 py-0.5 rounded-full border border-indigo-100/80 text-[11px]">
                <Clock className="w-3 h-3 text-[#2D4396]" />
                {format(currentLiveTime, "hh:mm:ss a")}
              </span>
            </div>

            {/* Header Month / Year & Nav */}
            <div className="flex items-center justify-between mb-3 px-1">
              <h4 className="text-sm font-bold text-slate-800 tracking-wide">
                {format(viewDate, "MMMM yyyy")}
              </h4>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handlePrevMonth}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMonth}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
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
                  className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider py-1"
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
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs px-1">
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
