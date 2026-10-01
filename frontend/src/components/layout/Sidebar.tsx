import * as React from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  CheckCircle2,
  Activity,
  Target,
  Sparkles,
  Gift,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Heart,
  X,
  Users2,
} from "lucide-react";
import { ROUTES } from "../../constants";
import { cn } from "../../utils/cn";
import { Avatar } from "../ui/Avatar";
import { Badge } from "../ui/Badge";
import { useAuth } from "../../hooks/useAuth";
import { usePartner } from "../../hooks/usePartner";
import { useHabits } from "../../hooks/useHabits";
import { companionService } from "../../services/companion.service";
import { surpriseService } from "../../services/surprise.service";
import type { CompanionResponse } from "../../types";

export interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeVariant?: "violet" | "emerald" | "amber" | "rose" | "indigo";
}

export const baseNavItems: NavItemConfig[] = [
  { label: "Home", href: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Partner", href: ROUTES.PARTNER, icon: Users2 },
  { label: "Habits", href: ROUTES.HABITS, icon: CheckCircle2 },
  { label: "Activity", href: ROUTES.ACTIVITY, icon: Activity },
  { label: "Goals", href: ROUTES.GOALS, icon: Target },
  { label: "Companion", href: ROUTES.COMPANION, icon: Sparkles },
  { label: "Surprises", href: ROUTES.SURPRISES, icon: Gift },
  { label: "Analytics", href: ROUTES.ANALYTICS, icon: BarChart3 },
  { label: "Settings", href: ROUTES.SETTINGS, icon: Settings },
];

export interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onMobileClose,
}) => {
  const location = useLocation();
  const { user } = useAuth();
  const { partnerStatus } = usePartner();
  const { habits } = useHabits();
  const [companion, setCompanion] = React.useState<CompanionResponse | null>(null);
  const [unopenedSurprises, setUnopenedSurprises] = React.useState<number>(0);

  const isConnected = partnerStatus?.status === "CONNECTED";
  const partner = partnerStatus?.partner;

  // Load real companion data
  React.useEffect(() => {
    let isMounted = true;
    companionService
      .getMyCompanion()
      .then((c) => {
        if (isMounted) setCompanion(c);
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, []);

  // Load real surprises count
  React.useEffect(() => {
    if (isConnected) {
      let isMounted = true;
      surpriseService
        .getReceivedSurprises()
        .then((res) => {
          if (isMounted) {
            const count = (res || []).filter((s) => s.status === "DELIVERED").length;
            setUnopenedSurprises(count);
          }
        })
        .catch(() => {});
      return () => {
        isMounted = false;
      };
    } else {
      setUnopenedSurprises(0);
    }
  }, [isConnected]);

  // Compute live dynamic badges based on REAL user data
  const navItems = React.useMemo(() => {
    const pendingHabitsToday = habits.filter((h) => !h.completedToday).length;

    return baseNavItems.map((item) => {
      // Partner badge: only show if actually connected
      if (item.href === ROUTES.PARTNER && isConnected) {
        return { ...item, badge: "Couple", badgeVariant: "violet" as const };
      }

      // Habits badge: only show if user has created habits
      if (item.href === ROUTES.HABITS && habits.length > 0) {
        return {
          ...item,
          badge: pendingHabitsToday > 0 ? `${pendingHabitsToday} today` : "Done",
          badgeVariant: "emerald" as const,
        };
      }

      // Companion badge: show actual real level (e.g. Lvl 1), or nothing if not loaded
      if (item.href === ROUTES.COMPANION && companion?.level) {
        return {
          ...item,
          badge: `Lvl ${companion.level}`,
          badgeVariant: "violet" as const,
        };
      }

      // Surprises badge: only show if there are actual unopened surprises
      if (item.href === ROUTES.SURPRISES && unopenedSurprises > 0) {
        return {
          ...item,
          badge: `${unopenedSurprises} new`,
          badgeVariant: "rose" as const,
        };
      }

      return item;
    });
  }, [isConnected, habits, companion?.level, unopenedSurprises]);

  // Close mobile drawer on route change
  React.useEffect(() => {
    if (isMobileOpen && onMobileClose) {
      onMobileClose();
    }
  }, [location.pathname]);

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between overflow-y-auto select-none">
      {/* Top Section */}
      <div>
        {/* Brand Header */}
        <div
          className={cn(
            "flex h-16 items-center px-4 border-b border-[rgba(147,130,255,0.1)] transition-all",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <NavLink to={ROUTES.DASHBOARD} className="flex items-center space-x-3 group">
            <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 shadow-lg shadow-violet-950/60 ring-1 ring-white/20 group-hover:shadow-violet-600/30 transition-all duration-300">
              <Heart className="h-5 w-5 fill-white text-white transform group-hover:scale-110 transition-transform" />
              <div className="absolute -inset-0.5 rounded-xl bg-gradient-to-tr from-violet-600 to-pink-500 opacity-0 group-hover:opacity-30 blur-sm transition-opacity" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                  NILEV
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Dual
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">
                  Two-Person Sanctuary
                </span>
              </div>
            )}
          </NavLink>

          {/* Mobile Close Button */}
          {isMobileOpen && onMobileClose && (
            <button
              onClick={onMobileClose}
              className="md:hidden flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-white/10"
              aria-label="Close navigation"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          {/* Desktop/Tablet Collapse Button */}
          {!isMobileOpen && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden md:flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:text-white hover:bg-violet-600/15 border border-transparent hover:border-violet-500/25 transition-all"
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-label="Toggle sidebar collapse"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </button>
          )}
        </div>

        {/* Navigation Section */}
        <div className="p-3 space-y-1">
          {!isCollapsed && (
            <p className="px-3 pt-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Platform
            </p>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <NavLink
                key={item.href}
                to={item.href}
                title={isCollapsed ? item.label : undefined}
                className={cn(
                  "group relative flex items-center rounded-xl px-3 py-2.5 text-xs font-semibold transition-all duration-200",
                  isCollapsed ? "justify-center" : "justify-between",
                  isActive
                    ? "bg-gradient-to-r from-violet-600/20 via-indigo-600/15 to-transparent text-white border-l-[3px] border-violet-500 shadow-sm shadow-violet-950/20"
                    : "text-slate-400 hover:text-slate-100 hover:bg-white/[0.04]"
                )}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={cn(
                      "flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "text-violet-300 bg-violet-600/25"
                        : "text-slate-400 group-hover:text-slate-200 group-hover:bg-white/[0.05]"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  {!isCollapsed && <span>{item.label}</span>}
                </div>

                {!isCollapsed && item.badge && (
                  <Badge
                    variant={item.badgeVariant || "violet"}
                    size="sm"
                    className="font-mono"
                  >
                    {item.badge}
                  </Badge>
                )}

                {/* Subtle active glow indicator */}
                {isActive && (
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-4 bg-violet-500 rounded-l-full shadow-[0_0_8px_rgba(139,92,246,0.6)]" />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Bottom Profile & Partner Status Section */}
      <div className="p-3 border-t border-[rgba(147,130,255,0.1)] space-y-2">
        {/* Partner Connection Card */}
        {!isCollapsed && (
          <div className="rounded-xl border border-[rgba(147,130,255,0.12)] bg-[rgba(15,20,38,0.6)] p-2.5 backdrop-blur-md">
            {isConnected && partner ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Avatar
                    fallback={partner.name}
                    src={partner.avatarUrl || undefined}
                    size="xs"
                    partnerRing
                    status="online"
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-white">
                      Partner: {partner.name.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
                      Connected
                    </span>
                  </div>
                </div>
                <span className="text-xs text-pink-400">💜</span>
              </div>
            ) : (
              <Link
                to={ROUTES.PARTNER}
                className="flex items-center justify-between group p-1 text-slate-400 hover:text-white transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <div className="h-6 w-6 rounded-full border border-dashed border-violet-500/40 flex items-center justify-center text-violet-400 text-xs">
                    +
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 group-hover:text-violet-300">
                    Connect Partner
                  </span>
                </div>
                <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              </Link>
            )}
          </div>
        )}

        {/* User Account Card */}
        <div
          className={cn(
            "flex items-center rounded-xl p-2 transition-colors hover:bg-white/[0.04]",
            isCollapsed ? "justify-center" : "justify-between"
          )}
        >
          <div className="flex items-center space-x-2.5">
            <Avatar
              fallback={user?.name || user?.firstName || "Alex"}
              size="sm"
              status="online"
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">
                  {user?.name || (user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Alex Rivera")}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  {user?.email || "alex@nilev.space"}
                </span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <NavLink
              to={ROUTES.SETTINGS}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <Settings className="h-4 w-4" />
            </NavLink>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop / Tablet Sidebar */}
      <aside
        className={cn(
          "hidden md:flex h-screen sticky top-0 flex-col z-30 border-r border-[rgba(147,130,255,0.12)] bg-[rgba(8,11,24,0.85)] backdrop-blur-2xl transition-all duration-300",
          isCollapsed ? "w-[72px]" : "w-64"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Modal slideout) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />
          <div className="relative flex w-72 max-w-[80vw] flex-1 flex-col border-r border-[rgba(147,130,255,0.2)] bg-[rgba(8,11,24,0.98)] backdrop-blur-2xl shadow-2xl animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
