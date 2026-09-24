import React from "react";
import { Loader2 } from "lucide-react";

const Loader = ({ size = "md", text = "Loading...", fullScreen = false }) => {
  const sizes = { sm: "w-4 h-4", md: "w-8 h-8", lg: "w-12 h-12" };

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className={`${sizes[size]} text-primary-600 animate-spin`} />
          {text && <p className="text-sm text-slate-500">{text}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${sizes[size]} text-primary-600 animate-spin`} />
        {text && <p className="text-sm text-slate-500">{text}</p>}
      </div>
    </div>
  );
};

export default Loader;
