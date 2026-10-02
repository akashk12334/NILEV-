import * as React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  Search,
  Menu,
  ChevronRight,
  LogOut,
  User as UserIcon,
  Settings,
  Sparkles,
  Command,
  Heart,
} from "lucide-react";
import { ROUTES } from "../../constants";
import { useAuth } from "../../hooks/useAuth";
import { usePartner } from "../../hooks/usePartner";
import { Avatar } from "../ui/Avatar";
import { Dropdown } from "../ui/Dropdown";
import { Tooltip } from "../ui/Tooltip";
import { NotificationDropdown } from "../notifications";

export interface HeaderProps {
  onMobileMenuToggle?: () => void;
}

const routeTitles: Record<string, { title: string; section: string }> = {
  [ROUTES.DASHBOARD]: { title: "Dashboard Overview", section: "Home" },
  [ROUTES.PARTNER]: { title: "Partner Space", section: "Connection" },
  [ROUTES.HABITS]: { title: "Habit Tracker", section: "Rhythms" },
  [ROUTES.GOALS]: { title: "Shared Goals", section: "Milestones" },
  [ROUTES.ACTIVITY]: { title: "Couples Activity Feed", section: "Memories" },
  [ROUTES.COMPANION]: { title: "Companion Sanctuary", section: "Evolution" },
  [ROUTES.SURPRISES]: { title: "Locked Surprises", section: "Moments" },
  [ROUTES.ANALYTICS]: { title: "Relationship Analytics", section: "Insights" },
  [ROUTES.SETTINGS]: { title: "Space Settings", section: "Preferences" },
};

export const Header: React.FC<HeaderProps> = ({ onMobileMenuToggle }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { partnerStatus } = usePartner();
  const isConnected = partnerStatus?.status === "CONNECTED";
  const partner = partnerStatus?.partner;
  const [searchQuery, setSearchQuery] = React.useState("");

  const currentRouteInfo = routeTitles[location.pathname] || {
    title: "Couple Space",
    section: "Platform",
  };

  return (
    <header className="sticky top-0 z-20 flex h-14 sm:h-16 w-full items-center justify-between border-b border-[rgba(147,130,255,0.12)] bg-[rgba(7,9,19,0.92)] px-2.5 sm:px-6 backdrop-blur-2xl transition-all">
      {/* Left: Mobile Menu Toggle + NILEV Logo + Page Title */}
      <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1 mr-2 sm:mr-0">
        {onMobileMenuToggle && (
          <button
            onClick={onMobileMenuToggle}
            className="flex md:hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[rgba(147,130,255,0.15)] bg-slate-900/60 text-slate-300 hover:text-white hover:bg-violet-600/10 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-violet-500/50 transition-all"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        {/* NILEV Logo on Mobile */}
        <Link
          to={ROUTES.DASHBOARD}
          className="flex md:hidden h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 via-indigo-600 to-pink-500 shadow-sm shadow-violet-950/60 ring-1 ring-white/20 active:scale-95 transition-transform"
          aria-label="NILEV Home"
        >
          <Heart className="h-4 w-4 fill-white text-white" />
        </Link>

        {/* Dynamic Breadcrumbs & Title */}
        <div className="flex flex-col min-w-0 flex-1">
          <div className="flex items-center space-x-1.5 text-[10px] sm:text-[11px] font-medium text-slate-400 truncate">
            <Link to={ROUTES.DASHBOARD} className="hover:text-slate-200 transition-colors">
              NILEV
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-600" />
            <span className="text-violet-400 font-semibold truncate">{currentRouteInfo.section}</span>
          </div>
          <h1 className="text-xs sm:text-sm md:text-base font-bold text-white tracking-tight leading-tight truncate">
            {currentRouteInfo.title}
          </h1>
        </div>
      </div>

      {/* Center: Search input with Command shortcut */}
      <div className="hidden md:flex items-center w-48 lg:w-64 xl:w-72 mx-2">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search habits, memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 sm:h-9 rounded-xl border border-[rgba(147,130,255,0.14)] bg-[rgba(13,17,34,0.65)] pl-9 pr-12 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/30 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden xl:flex items-center space-x-0.5 rounded px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white/5 border border-white/10">
            <Command className="h-2.5 w-2.5" />
            <span>K</span>
          </div>
        </div>
      </div>

      {/* Right: Partner Avatar, Notifications, User Avatar */}
      <div className="flex items-center space-x-2 sm:space-x-3.5 shrink-0">
        {/* Partner Status Pill */}
        {isConnected && partner ? (
          <Tooltip content={`Paired with ${partner.nickname || partner.name} 💜`} position="bottom">
            <div className="hidden sm:flex items-center space-x-2 rounded-full border border-[rgba(168,85,247,0.22)] bg-[rgba(13,17,34,0.7)] px-2.5 py-1 backdrop-blur-md shadow-sm hover:border-violet-500/40 transition-colors">
              <Avatar
                fallback={partner.nickname || partner.name}
                src={partner.avatarUrl || undefined}
                size="xs"
                status="online"
                partnerRing
              />
              <span className="text-xs font-medium text-slate-300">{(partner.nickname || partner.name).split(" ")[0]}</span>
              <Sparkles className="h-3 w-3 text-pink-400" />
            </div>
          </Tooltip>
        ) : (
          <Link
            to={ROUTES.PARTNER}
            className="hidden sm:flex items-center space-x-1.5 rounded-full border border-violet-500/30 bg-violet-600/10 px-3 py-1 text-xs font-medium text-violet-300 hover:bg-violet-600/20 hover:border-violet-500/50 transition-all"
          >
            <Sparkles className="h-3 w-3 text-violet-400" />
            <span>Connect Partner</span>
          </Link>
        )}

        {/* Notifications Dropdown */}
        <NotificationDropdown />

        {/* User Profile Dropdown */}
        <Dropdown
          align="right"
          trigger={
            <div className="flex items-center space-x-2 cursor-pointer group">
              <Avatar
                src={user?.avatarUrl || user?.profileImageUrl || undefined}
                fallback={user?.nickname || user?.name || user?.firstName || "Alex"}
                size="sm"
                status="online"
                className="group-hover:ring-2 group-hover:ring-violet-500/50 transition-all"
              />
            </div>
          }
          items={[
            {
              id: "profile-info",
              label: user?.nickname
                ? `${user.nickname} (You)`
                : (user?.name ? `${user.name} (You)` : (user?.firstName ? `${user.firstName} (You)` : "Alex (You)")),
              badge: (
                <span className="text-[10px] text-violet-400">Coupled</span>
              ),
              disabled: true,
            },
            { divider: true },
            {
              id: "settings",
              label: "Preferences & Space",
              icon: <Settings className="h-4 w-4" />,
              onClick: () => navigate(ROUTES.SETTINGS),
            },
            {
              id: "companion",
              label: "Companion Profile",
              icon: <Sparkles className="h-4 w-4" />,
              onClick: () => navigate(ROUTES.COMPANION),
            },
            {
              id: "profile",
              label: "Profile",
              icon: <UserIcon className="h-4 w-4" />,
              onClick: () => navigate(ROUTES.SETTINGS),
            },
            { divider: true },
            {
              id: "logout",
              label: "Sign Out",
              icon: <LogOut className="h-4 w-4" />,
              destructive: true,
              onClick: logout,
            },
          ]}
        />
      </div>
    </header>
  );
};
