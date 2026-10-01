import * as React from "react";
import { cn } from "../../utils/cn";

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  disabled?: boolean;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: "pills" | "underline" | "cosmic";
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = "cosmic",
  className,
}) => {
  return (
    <div
      className={cn(
        "flex items-center",
        variant === "cosmic" &&
          "rounded-xl border border-[rgba(147,130,255,0.12)] bg-[rgba(10,14,28,0.7)] p-1 backdrop-blur-md",
        variant === "pills" && "gap-2",
        variant === "underline" && "border-b border-slate-800 gap-6",
        className
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;

        if (variant === "cosmic") {
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={cn(
                "relative flex items-center space-x-2 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all duration-200 cursor-pointer select-none",
                isActive
                  ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-950/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5",
                tab.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {tab.icon && <span className="h-3.5 w-3.5 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && <span className="ml-1.5">{tab.badge}</span>}
            </button>
          );
        }

        if (variant === "underline") {
          return (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.id)}
              className={cn(
                "relative flex items-center space-x-2 pb-3 pt-1 text-sm font-medium transition-all border-b-2 cursor-pointer select-none",
                isActive
                  ? "border-violet-500 text-violet-300 font-semibold"
                  : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700",
                tab.disabled && "opacity-40 cursor-not-allowed"
              )}
            >
              {tab.icon && <span className="h-4 w-4 shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge && <span className="ml-1.5">{tab.badge}</span>}
            </button>
          );
        }

        // pills
        return (
          <button
            key={tab.id}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.id)}
            className={cn(
              "flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-medium transition-all cursor-pointer select-none border",
              isActive
                ? "border-violet-500/40 bg-violet-600/20 text-violet-200 shadow-sm shadow-violet-900/30"
                : "border-slate-800 bg-slate-900/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800/60",
              tab.disabled && "opacity-40 cursor-not-allowed"
            )}
          >
            {tab.icon && <span className="h-3.5 w-3.5 shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge && <span className="ml-1.5">{tab.badge}</span>}
          </button>
        );
      })}
    </div>
  );
};
