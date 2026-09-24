import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const StatsCard = ({
  title,
  value,
  icon: Icon,
  color = "primary",
  trend,
  subtitle,
}) => {
  const colorMap = {
    primary: {
      bg: "bg-primary-50",
      icon: "text-primary-600",
      ring: "ring-primary-100",
    },
    success: {
      bg: "bg-green-50",
      icon: "text-green-600",
      ring: "ring-green-100",
    },
    warning: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      ring: "ring-amber-100",
    },
    danger: { bg: "bg-red-50", icon: "text-red-600", ring: "ring-red-100" },
    info: { bg: "bg-sky-50", icon: "text-sky-600", ring: "ring-sky-100" },
    purple: {
      bg: "bg-purple-50",
      icon: "text-purple-600",
      ring: "ring-purple-100",
    },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className="card p-5 hover:shadow-card-hover transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900">{value ?? 0}</p>
          {subtitle && (
            <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend !== undefined && (
            <div
              className={`flex items-center gap-1 mt-2 text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-500"}`}
            >
              {trend >= 0 ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{Math.abs(trend)}% this week</span>
            </div>
          )}
        </div>
        <div
          className={`w-11 h-11 rounded-xl ${c.bg} ring-4 ${c.ring} flex items-center justify-center`}
        >
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
