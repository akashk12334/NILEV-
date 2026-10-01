import * as React from "react";
import { cn } from "../../utils/cn";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "rectangle" | "circle" | "text";
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = "rectangle",
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-slate-800/50 before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/[0.05] before:to-transparent",
        variant === "circle" && "rounded-full",
        variant === "text" && "h-3.5 w-full rounded-md",
        variant === "rectangle" && "rounded-xl",
        className
      )}
      {...props}
    />
  );
};
