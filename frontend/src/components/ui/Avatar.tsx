import * as React from "react";
import { cn } from "../../utils/cn";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "away" | "busy" | null;
  glow?: boolean;
  partnerRing?: boolean;
}

const sizeClasses = {
  xs: "h-6 w-6 text-[10px]",
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const statusClasses = {
  online: "bg-emerald-500 ring-2 ring-[#070913]",
  offline: "bg-slate-500 ring-2 ring-[#070913]",
  away: "bg-amber-500 ring-2 ring-[#070913]",
  busy: "bg-rose-500 ring-2 ring-[#070913]",
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "Avatar",
  fallback = "U",
  size = "md",
  status = null,
  glow = false,
  partnerRing = false,
  className,
  ...props
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (text: string) => {
    return text
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={cn("relative inline-block shrink-0", className)} {...props}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full overflow-hidden select-none font-semibold font-mono",
          sizeClasses[size],
          partnerRing &&
            "ring-2 ring-violet-500 ring-offset-2 ring-offset-[#070913] shadow-[0_0_12px_rgba(139,92,246,0.35)]",
          glow && "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
          !src || imageError
            ? "bg-gradient-to-tr from-violet-700 via-indigo-700 to-purple-600 text-white"
            : "bg-slate-800"
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover"
          />
        ) : (
          <span>{getInitials(fallback)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full",
            size === "xs" ? "h-1.5 w-1.5" : size === "sm" ? "h-2 w-2" : "h-2.5 w-2.5",
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
};
