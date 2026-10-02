import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckCircle2,
  Activity,
  Target,
  Sparkles,
  Menu,
} from "lucide-react";
import { ROUTES } from "../../constants";
import { cn } from "../../utils/cn";

export interface MobileNavProps {
  onOpenDrawer: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenDrawer }) => {
  const location = useLocation();

  const items = [
    { label: "Home", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
    { label: "Habits", href: ROUTES.HABITS, icon: CheckCircle2 },
    { label: "Activity", href: ROUTES.ACTIVITY, icon: Activity },
    { label: "Goals", href: ROUTES.GOALS, icon: Target },
    { label: "Companion", href: ROUTES.COMPANION, icon: Sparkles },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden flex h-16 items-center justify-around border-t border-[rgba(147,130,255,0.12)] bg-[rgba(8,11,24,0.96)] px-1 sm:px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl">
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.href;

        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={cn(
              "flex flex-1 min-w-0 flex-col items-center justify-center space-y-1 py-1 px-0.5 sm:px-1 rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500",
              isActive ? "text-violet-300 font-semibold" : "text-slate-400 hover:text-slate-200"
            )}
          >
            <div
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg transition-colors",
                isActive && "bg-violet-600/25 text-violet-300 shadow-sm shadow-violet-900/30"
              )}
            >
              <Icon className="h-4 w-4" />
            </div>
            <span className="text-[9px] sm:text-[10px] leading-tight tracking-tight truncate max-w-full text-center">
              {item.label}
            </span>
          </NavLink>
        );
      })}

      {/* Menu / Drawer Toggle */}
      <button
        onClick={onOpenDrawer}
        aria-label="Open more menu"
        className="flex flex-1 min-w-0 flex-col items-center justify-center space-y-1 py-1 px-0.5 sm:px-1 rounded-xl text-slate-400 hover:text-slate-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500 transition-all duration-200"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg">
          <Menu className="h-4 w-4" />
        </div>
        <span className="text-[9px] sm:text-[10px] leading-tight tracking-tight truncate max-w-full text-center">
          More
        </span>
      </button>
    </nav>
  );
};
