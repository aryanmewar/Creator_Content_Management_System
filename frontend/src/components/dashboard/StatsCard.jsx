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
      bg: "bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/30",
      icon: "text-white",
      ring: "ring-white/20",
      cardBorder: "border-l-blue-500",
    },
    success: {
      bg: "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30",
      icon: "text-white",
      ring: "ring-white/20",
      cardBorder: "border-l-emerald-500",
    },
    warning: {
      bg: "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-500/30",
      icon: "text-white",
      ring: "ring-white/20",
      cardBorder: "border-l-amber-500",
    },
    danger: { 
      bg: "bg-gradient-to-br from-rose-400 to-red-600 shadow-lg shadow-rose-500/30", 
      icon: "text-white", 
      ring: "ring-white/20",
      cardBorder: "border-l-rose-500",
    },
    info: { 
      bg: "bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/30", 
      icon: "text-white", 
      ring: "ring-white/20",
      cardBorder: "border-l-cyan-500",
    },
    purple: {
      bg: "bg-gradient-to-br from-fuchsia-500 to-purple-600 shadow-lg shadow-fuchsia-500/30",
      icon: "text-white",
      ring: "ring-white/20",
      cardBorder: "border-l-fuchsia-500",
    },
  };
  const c = colorMap[color] || colorMap.primary;

  return (
    <div className={`card p-5 border-l-4 ${c.cardBorder} hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group bg-white/70 backdrop-blur-md`}>
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-gradient-to-br from-slate-50 to-slate-100 rounded-full blur-2xl opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="flex items-start justify-between relative z-10">
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
          className={`w-12 h-12 rounded-2xl ${c.bg} ring-2 ${c.ring} flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-300`}
        >
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
