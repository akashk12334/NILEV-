import * as React from "react";
import { Sparkles } from "lucide-react";
import { cn } from "../../utils/cn";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-[rgba(147,130,255,0.1)] bg-[rgba(12,16,32,0.5)] backdrop-blur-md",
        className
      )}
    >
      <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-violet-600/20 via-indigo-600/10 to-transparent border border-violet-500/20 shadow-[0_0_25px_rgba(139,92,246,0.15)] text-violet-400 mb-4">
        {icon || <Sparkles className="h-7 w-7" />}
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-violet-500" />
        </span>
      </div>

      <h3 className="text-base font-semibold text-white tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-xs text-slate-400 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
};
