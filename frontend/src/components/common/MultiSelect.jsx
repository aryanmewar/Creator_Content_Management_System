import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown } from "lucide-react";

const MultiSelect = ({
  label,
  error,
  options = [],
  value = [],
  onChange,
  placeholder = "Select options...",
  className = "",
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, []);

  const handleSelect = (val) => {
    if (!value.includes(val)) {
      onChange([...value, val]);
    }
    setIsOpen(false);
  };

  const handleRemove = (e, val) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  const getOptionLabel = (val) => {
    const opt = options.find((o) => (o.value ?? o) === val);
    return opt ? (opt.label ?? opt) : val;
  };

  const availableOptions = options.filter(
    (opt) => !value.includes(opt.value ?? opt),
  );

  return (
    <div className={className} ref={containerRef}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div
        className={`form-input relative min-h-[42px] flex flex-wrap gap-1.5 items-center cursor-pointer pb-1 pt-1 px-3 pr-9 ${error ? "border-red-400 focus:ring-red-400" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {!value || value.length === 0 ? (
          <span className="text-slate-400 text-sm">{placeholder}</span>
        ) : (
          value.map((val) => (
            <span
              key={val}
              className="badge bg-primary-50 text-primary-700 border border-primary-100 flex items-center gap-1 text-xs py-0.5 pl-2 pr-1"
            >
              {getOptionLabel(val)}
              <X
                className="w-3 h-3 hover:text-red-500 cursor-pointer transition-colors"
                onClick={(e) => handleRemove(e, val)}
              />
            </span>
          ))
        )}

        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />

        {isOpen && availableOptions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
            {availableOptions.map((opt) => (
              <div
                key={opt.value ?? opt}
                className="px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelect(opt.value ?? opt);
                }}
              >
                {opt.label ?? opt}
              </div>
            ))}
          </div>
        )}
      </div>

      {error && <p className="form-error mt-1">{error}</p>}
    </div>
  );
};

export default MultiSelect;
