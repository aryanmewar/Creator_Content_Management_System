import React, { forwardRef } from "react";

const Input = forwardRef(
  (
    {
      label,
      error,
      helpText,
      icon: Icon,
      iconPosition = "left",
      className = "",
      inputClassName = "",
      required = false,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={className}>
        {label && (
          <label className="form-label">
            {label}
            {required && <span className="text-red-500 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {Icon && iconPosition === "left" && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <input
            ref={ref}
            className={`form-input ${Icon && iconPosition === "left" ? "pl-9" : ""} ${error ? "border-red-400 focus:ring-red-400" : ""} ${inputClassName}`}
            {...props}
          />
          {Icon && iconPosition === "right" && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <Icon className="w-4 h-4 text-slate-400" />
            </div>
          )}
        </div>
        {error && <p className="form-error">{error}</p>}
        {helpText && !error && (
          <p className="text-xs text-slate-500 mt-1">{helpText}</p>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";
export default Input;
