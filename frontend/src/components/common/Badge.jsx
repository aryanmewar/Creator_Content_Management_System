import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const variants = {
    default: "bg-slate-100 text-slate-600",
    primary: "bg-primary-100 text-primary-700",
    success: "bg-green-100 text-green-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-600",
    info: "bg-blue-100 text-blue-700",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  return (
    <span className={`badge ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;
