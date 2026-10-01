import * as React from "react";
import { cn } from "../../utils/cn";

export interface ProgressBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  max?: number;
  size?: "sm" | "md" | "lg";
  variant?: "violet" | "indigo" | "emerald" | "amber" | "rose";
  showLabel?: boolean;
  label?: string;
  glow?: boolean;
  striped?: boolean;
}

const sizeClasses = {
  sm: "h-1.5",
  md: "h-2.5",
  lg: "h-4",
};

const variantClasses = {
  violet: "bg-gradient-to-r from-violet-600 via-purple-500 to-indigo-500",
  indigo: "bg-gradient-to-r from-indigo-600 to-cyan-500",
  emerald: "bg-gradient-to-r from-emerald-600 to-teal-400",
  amber: "bg-gradient-to-r from-amber-500 to-orange-400",
  rose: "bg-gradient-to-r from-rose-600 to-pink-500",
};

const glowClasses = {
  violet: "shadow-[0_0_12px_rgba(139,92,246,0.5)]",
  indigo: "shadow-[0_0_12px_rgba(99,102,241,0.5)]",
  emerald: "shadow-[0_0_12px_rgba(16,185,129,0.5)]",
  amber: "shadow-[0_0_12px_rgba(245,158,11,0.5)]",
  rose: "shadow-[0_0_12px_rgba(244,63,94,0.5)]",
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  size = "md",
  variant = "violet",
  showLabel = false,
  label,
  glow = false,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max(0, (value / max) * 100), 100);

  return (
    <div className={cn("w-full space-y-1.5", className)} {...props}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-300">{label}</span>
          {showLabel && (
            <span className="font-mono text-slate-400 font-semibold">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          "w-full overflow-hidden rounded-full bg-slate-900/90 border border-slate-800/80 p-0.5",
          sizeClasses[size]
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500 ease-out",
            variantClasses[variant],
            glow && glowClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
