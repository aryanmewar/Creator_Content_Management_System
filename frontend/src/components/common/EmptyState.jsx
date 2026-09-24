import React from "react";
import { InboxIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
const EmptyState = ({
  title = "No results found",
  description = "Try adjusting your search or filters.",
  icon: Icon = InboxIcon,
  action,
  actionLabel,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-slate-400" />
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm">{description}</p>
      {action && actionLabel && (
        <div className="mt-5">
          <Button onClick={action}>{actionLabel}</Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
