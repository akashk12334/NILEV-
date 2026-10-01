import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "../../utils/cn";

export const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#070913] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-600 bg-[length:200%_auto] text-white shadow-md shadow-violet-950/40 hover:bg-[position:right_center] hover:shadow-violet-900/30 active:scale-[0.98] border border-violet-400/25",
        glow:
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-[0_0_16px_rgba(139,92,246,0.3)] hover:shadow-[0_0_20px_rgba(139,92,246,0.45)] hover:brightness-105 active:scale-[0.98] border border-violet-300/30",
        secondary:
          "bg-slate-800/80 hover:bg-slate-700/80 text-slate-100 shadow-sm border border-slate-700/60 active:scale-[0.98] hover:border-slate-600",
        outline:
          "border border-violet-500/25 bg-violet-500/10 text-violet-200 hover:bg-violet-500/20 hover:border-violet-500/50 shadow-sm active:scale-[0.98]",
        ghost:
          "text-slate-300 hover:text-white hover:bg-white/[0.06] active:scale-[0.98]",
        destructive:
          "bg-rose-600/90 hover:bg-rose-600 text-white shadow-sm border border-rose-500/40 active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-4 py-2 rounded-xl",
        sm: "h-8 px-3 text-xs rounded-lg gap-1.5",
        lg: "h-12 px-6 text-base rounded-xl font-semibold gap-2",
        icon: "h-10 w-10 p-0 rounded-xl",
        "icon-sm": "h-8 w-8 p-0 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-current" />
        ) : (
          leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="inline-flex shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
