import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../utils/cn";

export const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all duration-200 select-none",
  {
    variants: {
      variant: {
        default:
          "border-violet-500/30 bg-violet-500/15 text-violet-200 shadow-sm",
        violet:
          "border-violet-500/35 bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-200 shadow-[0_0_12px_rgba(139,92,246,0.25)]",
        indigo:
          "border-indigo-500/30 bg-indigo-500/15 text-indigo-200 shadow-sm",
        emerald:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        success:
          "border-emerald-500/30 bg-emerald-500/15 text-emerald-200 shadow-[0_0_10px_rgba(16,185,129,0.2)]",
        amber:
          "border-amber-500/30 bg-amber-500/15 text-amber-200 shadow-[0_0_10px_rgba(245,158,11,0.2)]",
        rose:
          "border-rose-500/30 bg-rose-500/15 text-rose-200 shadow-[0_0_10px_rgba(244,63,94,0.2)]",
        secondary:
          "border-slate-700/80 bg-slate-800/60 text-slate-300",
        outline:
          "border-slate-700/80 bg-slate-900/40 text-slate-300",
      },
      size: {
        default: "text-xs px-2.5 py-0.5",
        sm: "text-[10px] px-2 py-0.2 uppercase tracking-wider font-semibold",
        lg: "text-sm px-3 py-1",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  withDot?: boolean;
  pulseDot?: boolean;
}

export function Badge({
  className,
  variant,
  size,
  withDot = false,
  pulseDot = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {withDot && (
        <span className="relative flex h-1.5 w-1.5 mr-1.5">
          {pulseDot && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-current" />
        </span>
      )}
      {children}
    </div>
  );
}
