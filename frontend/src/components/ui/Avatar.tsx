import * as React from "react";
import { cn } from "../../utils/cn";
import { API_BASE_URL } from "../../constants";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
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
  "2xl": "h-24 w-24 sm:h-28 sm:w-28 text-2xl",
};

const statusClasses = {
  online: "bg-emerald-500 ring-[#070913]",
  offline: "bg-slate-500 ring-[#070913]",
  away: "bg-amber-500 ring-[#070913]",
  busy: "bg-rose-500 ring-[#070913]",
};

const statusDotSizes = {
  xs: "h-1.5 w-1.5 ring-1",
  sm: "h-2 w-2 ring-1.5",
  md: "h-2.5 w-2.5 ring-2",
  lg: "h-3 w-3 ring-2",
  xl: "h-3.5 w-3.5 ring-2",
  "2xl": "h-4 w-4 ring-2 sm:h-5 sm:w-5",
};

/**
 * Resolves a full, usable image URL for both remote HTTP, local blobs,
 * and backend-hosted avatar paths like `/api/v1/users/avatar/...`.
 */
export const resolveAvatarUrl = (url?: string | null): string | undefined => {
  if (!url) return undefined;
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("blob:") ||
    url.startsWith("data:")
  ) {
    return url;
  }

  try {
    const base = new URL(API_BASE_URL);
    return `${base.origin}${url.startsWith("/") ? "" : "/"}${url}`;
  } catch {
    return url;
  }
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
  const resolvedSrc = React.useMemo(() => resolveAvatarUrl(src), [src]);

  // Reset error state if image src changes
  React.useEffect(() => {
    setImageError(false);
  }, [src]);

  const getInitials = (text: string) => {
    return text
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center rounded-full shrink-0 select-none aspect-square",
        sizeClasses[size],
        partnerRing &&
          "ring-2 ring-violet-500 ring-offset-2 ring-offset-[#070913] shadow-[0_0_14px_rgba(139,92,246,0.4)]",
        glow && "shadow-[0_0_20px_rgba(168,85,247,0.4)]",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "h-full w-full rounded-full overflow-hidden flex items-center justify-center font-semibold font-mono",
          !resolvedSrc || imageError
            ? "bg-gradient-to-tr from-violet-700 via-indigo-700 to-purple-600 text-white"
            : "bg-slate-800"
        )}
      >
        {resolvedSrc && !imageError ? (
          <img
            src={resolvedSrc}
            alt={alt}
            onError={() => setImageError(true)}
            className="h-full w-full object-cover rounded-full pointer-events-none"
          />
        ) : (
          <span>{getInitials(fallback)}</span>
        )}
      </div>

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 block rounded-full pointer-events-none",
            statusDotSizes[size],
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
};
