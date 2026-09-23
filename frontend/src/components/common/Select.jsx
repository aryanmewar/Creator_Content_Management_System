import React, { forwardRef, useState } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

const Select = forwardRef(({
  label,
  error,
  options = [],
  placeholder = 'Select an option',
  className = '',
  required = false,
  value,
  onChange,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => (opt.value ?? opt) === value);
  const displayValue = selectedOption ? (selectedOption.label ?? selectedOption) : placeholder;

  const handleSelect = (val) => {
    if (onChange) onChange({ target: { value: val } });
    setIsOpen(false);
  };

  return (
    <div 
      className={`relative inline-block ${className}`}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {label && (
        <label className="form-label block mb-1">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      
      {/* Trigger */}
      <div 
        className={`form-select flex items-center justify-between cursor-pointer bg-white transition-all duration-300 hover:border-primary/50 hover:shadow-sm ${error ? 'border-red-400 focus:ring-red-400' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        {...props}
      >
        <span className={`block truncate ${!selectedOption ? 'text-slate-400' : 'text-slate-800'}`}>
          {displayValue}
        </span>
        <div className="flex items-center gap-1.5 ml-2 shrink-0">
          {value && (
            <X 
              className="w-4 h-4 text-slate-400 hover:text-red-500 sm:hidden" 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleSelect('');
              }} 
            />
          )}
          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      <div className={`absolute top-full left-0 mt-2 min-w-[220px] w-full z-50 transition-all duration-300 transform origin-top ${isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white p-2 overflow-hidden ring-1 ring-slate-900/5">
          <div className="max-h-[280px] overflow-y-auto no-scrollbar flex flex-col gap-1">
             {placeholder && (
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleSelect(''); }}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${!value ? 'bg-primary text-white shadow-md' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`}
              >
                {placeholder}
                {!value && <Check className="w-4 h-4" />}
              </button>
            )}
            
            {options.length > 0 && placeholder && <div className="h-px bg-slate-200/50 my-1 mx-2" />}

            {options.map((opt) => {
              const optValue = opt.value ?? opt;
              const optLabel = opt.label ?? opt;
              const isSelected = optValue === value;
              
              return (
                <button
                  key={optValue}
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleSelect(optValue); }}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between ${isSelected ? 'bg-primary text-white shadow-md scale-[0.98]' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 hover:scale-[0.98]'}`}
                >
                  <span className="truncate">{optLabel}</span>
                  {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      
      {error && <p className="form-error mt-1">{error}</p>}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
