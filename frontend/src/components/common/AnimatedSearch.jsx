import React from "react";
import { Search } from "lucide-react";

const AnimatedSearch = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div
      className={`relative group transition-all duration-300 ease-in-out min-w-0 ${className}`}
    >
      {/* Animated Theme Border */}
      <div className="absolute -inset-0.5 bg-primary/40 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-500 group-focus-within:opacity-70 group-focus-within:duration-200"></div>

      <div className="relative flex items-center bg-white rounded-2xl overflow-hidden shadow-sm h-full w-full">
        <div className="pl-3 pr-2 h-full flex items-center justify-center">
          <Search className="h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors duration-300" />
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full h-full pr-4 bg-transparent border-none focus:outline-none text-slate-800 text-sm placeholder:text-slate-400 min-w-0"
        />
        {/* Animated typing indicator */}
        <div
          className={`absolute right-4 top-1/2 -translate-y-1/2 flex gap-1.5 transition-all duration-500 ${value ? "opacity-100 scale-100" : "opacity-0 scale-75"}`}
        >
          <div className="w-1 h-1 rounded-full bg-primary/40 animate-pulse"></div>
          <div className="w-1 h-1 rounded-full bg-primary/70 animate-pulse delay-75"></div>
          <div className="w-1 h-1 rounded-full bg-primary animate-pulse delay-150"></div>
        </div>
      </div>
    </div>
  );
};

export default AnimatedSearch;
