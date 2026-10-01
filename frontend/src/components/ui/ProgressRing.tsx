import * as React from "react";
import { cn } from "../../utils/cn";

export interface ProgressRingProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 - 100
  size?: number; // diameter in px
  strokeWidth?: number;
  gradientId?: string;
  glow?: boolean;
  startColor?: string;
  endColor?: string;
  children?: React.ReactNode;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  size = 96,
  strokeWidth = 8,
  gradientId = "cosmicRingGradient",
  glow = true,
  startColor = "#8b5cf6",
  endColor = "#ec4899",
  children,
  className,
  ...props
}) => {
  const percentage = Math.min(Math.max(0, value), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center select-none", className)}
      style={{ width: size, height: size }}
      {...props}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
          {glow && (
            <filter id={`${gradientId}-glow`} x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          )}
        </defs>

        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(147, 130, 255, 0.12)"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress fill circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          filter={glow ? `url(#${gradientId}-glow)` : undefined}
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {/* Centered content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children ? (
          children
        ) : (
          <span className="font-mono text-sm font-bold text-white">
            {Math.round(percentage)}%
          </span>
        )}
      </div>
    </div>
  );
};
