import * as React from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { Card } from "./Card";
import { Badge } from "./Badge";
import { cn } from "../../utils/cn";

export interface StatCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string | number;
    direction: "up" | "down" | "neutral";
    label?: string;
  };
  glow?: boolean;
  accentColor?: "violet" | "indigo" | "pink" | "emerald" | "amber";
  progress?: number; // 0 - 100
}

const accentIconBg = {
  violet: "bg-violet-600/15 text-violet-400 border-violet-500/25 shadow-[0_0_15px_rgba(139,92,246,0.2)]",
  indigo: "bg-indigo-600/15 text-indigo-400 border-indigo-500/25 shadow-[0_0_15px_rgba(99,102,241,0.2)]",
  pink: "bg-pink-600/15 text-pink-400 border-pink-500/25 shadow-[0_0_15px_rgba(236,72,153,0.2)]",
  emerald: "bg-emerald-600/15 text-emerald-400 border-emerald-500/25 shadow-[0_0_15px_rgba(16,185,129,0.2)]",
  amber: "bg-amber-600/15 text-amber-400 border-amber-500/25 shadow-[0_0_15px_rgba(245,158,11,0.2)]",
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  glow = false,
  accentColor = "violet",
  progress,
  className,
  ...props
}) => {
  return (
    <Card
      glow={glow}
      className={cn(
        "p-4 sm:p-6 flex flex-col justify-between h-full overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-violet-500/30 hover:shadow-lg hover:shadow-violet-950/20 group min-w-0",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 group-hover:text-slate-300 transition-colors truncate pr-2">
          {title}
        </span>
        {icon && (
          <div
            className={cn(
              "flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border",
              accentIconBg[accentColor]
            )}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 sm:mt-4 flex items-baseline justify-between gap-2">
        <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono truncate">
          {value}
        </div>
        {trend && (
          <Badge
            variant={
              trend.direction === "up"
                ? "emerald"
                : trend.direction === "down"
                ? "rose"
                : "outline"
            }
            size="sm"
            className="flex items-center space-x-1"
          >
            {trend.direction === "up" ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : trend.direction === "down" ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : (
              <Minus className="h-3 w-3" />
            )}
            <span>{trend.value}</span>
          </Badge>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs text-slate-400 leading-normal flex items-center">
          {subtitle}
        </p>
      )}

      {typeof progress === "number" && (
        <div className="mt-4 w-full bg-slate-900/90 rounded-full h-1.5 overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </Card>
  );
};
