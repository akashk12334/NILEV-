import React, { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { notificationService } from "../../services/notification.service";
import type { NotificationResponse } from "../../types";
import { Badge } from "../ui";
import {
  Bell,
  Check,
  CheckCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState<boolean>(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Load notifications from backend
  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications(false, 30);
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();

    // Subtle background poll every 45s for fresh partner updates
    const interval = setInterval(() => {
      notificationService
        .getUnreadCount()
        .then((count) => setUnreadCount(count))
        .catch(() => {});
    }, 45000);

    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Mark single notification as read
  const handleMarkAsRead = async (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  // Mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Click on a notification item
  const handleItemClick = (n: NotificationResponse) => {
    if (!n.isRead) {
      handleMarkAsRead(n.id);
    }
    setIsOpen(false);
    if (n.actionUrl) {
      navigate(n.actionUrl);
    }
  };

  // Filtered notifications
  const displayedNotifications = useMemo(() => {
    if (filterUnreadOnly) {
      return notifications.filter((n) => !n.isRead);
    }
    return notifications;
  }, [notifications, filterUnreadOnly]);

  // Group notifications by relative date: "Today", "Yesterday", "Earlier"
  const groupedNotifications = useMemo(() => {
    const groups: { [key: string]: NotificationResponse[] } = {
      Today: [],
      Yesterday: [],
      Earlier: [],
    };

    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    displayedNotifications.forEach((n) => {
      try {
        const itemDate = new Date(n.createdAt);
        const itemDateStr = itemDate.toDateString();

        if (itemDateStr === todayStr) {
          groups.Today.push(n);
        } else if (itemDateStr === yesterdayStr) {
          groups.Yesterday.push(n);
        } else {
          groups.Earlier.push(n);
        }
      } catch {
        groups.Earlier.push(n);
      }
    });

    return groups;
  }, [displayedNotifications]);

  const hasAnyInGroups =
    groupedNotifications.Today.length > 0 ||
    groupedNotifications.Yesterday.length > 0 ||
    groupedNotifications.Earlier.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── TRIGGER BUTTON ────────────────────────────────────────── */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchNotifications();
          }
        }}
        className={`relative flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200 ${
          isOpen
            ? "border-violet-500/50 bg-violet-600/20 text-white shadow-lg shadow-violet-500/20 ring-1 ring-violet-500/40"
            : "border-[rgba(147,130,255,0.12)] bg-[rgba(13,17,34,0.6)] text-slate-300 hover:text-white hover:border-violet-500/30 hover:bg-violet-600/10"
        }`}
        aria-label="Notifications"
        title="Couple Notifications"
      >
        <Bell className="h-4 w-4" />

        {/* Unread Counter Badge with Ambient Glow */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] px-1 items-center justify-center rounded-full bg-gradient-to-r from-pink-600 to-violet-600 text-[9px] font-bold text-white shadow-[0_0_10px_rgba(236,72,153,0.8)] animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* ── DROPDOWN POPUP PANEL ─────────────────────────────────── */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-[rgba(147,130,255,0.2)] bg-slate-950/95 shadow-2xl backdrop-blur-2xl z-50 overflow-hidden animate-fadeIn">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3 bg-slate-900/60">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-bold text-white">Notifications</span>
              {unreadCount > 0 ? (
                <Badge variant="indigo" className="text-[10px] py-0 px-2 font-bold bg-pink-500/20 text-pink-300 border-pink-500/30">
                  {unreadCount} unread
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-[10px] py-0 px-1.5">
                  All caught up
                </Badge>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllAsRead}
                className="flex items-center space-x-1 text-[11px] text-violet-400 hover:text-violet-300 font-medium transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* Filter Bar */}
          <div className="flex items-center justify-between border-b border-white/5 px-4 py-2 bg-slate-900/30 text-xs">
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={() => setFilterUnreadOnly(false)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors text-[11px] ${
                  !filterUnreadOnly
                    ? "bg-white/10 text-white"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterUnreadOnly(true)}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors text-[11px] ${
                  filterUnreadOnly
                    ? "bg-violet-600/30 text-violet-300 border border-violet-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            <span className="text-[10px] text-slate-500 italic">High-Signal Couple Alerts</span>
          </div>

          {/* Notifications Scroll Container */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5">
            {!hasAnyInGroups ? (
              <div className="py-12 px-6 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/10 text-indigo-400 mb-3">
                  <Sparkles className="w-6 h-6" />
                </div>
                <p className="text-xs font-semibold text-white">No Notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {filterUnreadOnly
                    ? "You have read all your alerts."
                    : "Meaningful milestone and partner actions will appear here."}
                </p>
              </div>
            ) : (
              (["Today", "Yesterday", "Earlier"] as const).map((groupKey) => {
                const items = groupedNotifications[groupKey];
                if (items.length === 0) return null;

                return (
                  <div key={groupKey} className="py-1">
                    {/* Group Header */}
                    <div className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-white/[0.02]">
                      {groupKey}
                    </div>

                    {/* Group Items */}
                    {items.map((n) => {
                      return (
                        <div
                          key={n.id}
                          onClick={() => handleItemClick(n)}
                          className={`relative flex items-start space-x-3 px-4 py-3 transition-colors cursor-pointer group ${
                            !n.isRead
                              ? "bg-violet-950/20 hover:bg-violet-950/30"
                              : "hover:bg-white/[0.03]"
                          }`}
                        >
                          {/* Unread Glowing Dot */}
                          {!n.isRead && (
                            <span className="absolute left-1.5 top-5 h-1.5 w-1.5 rounded-full bg-pink-500 shadow-[0_0_6px_rgba(236,72,153,0.9)]" />
                          )}

                          {/* Icon Container */}
                          <div className="relative shrink-0 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 border border-white/10 text-base shadow-sm group-hover:scale-105 transition-transform">
                            <span>{n.icon || n.typeEmoji || "✨"}</span>
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-0.5">
                              <span
                                className={`text-xs font-bold truncate leading-tight ${
                                  !n.isRead ? "text-white" : "text-slate-300"
                                }`}
                              >
                                {n.title}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono shrink-0">
                                {n.timeAgo}
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                              {n.message}
                            </p>

                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-[9px] font-semibold uppercase tracking-wider text-violet-400">
                                {n.category}
                              </span>

                              {/* Mark read button on hover */}
                              {!n.isRead && (
                                <button
                                  type="button"
                                  onClick={(e) => handleMarkAsRead(n.id, e)}
                                  className="text-[10px] text-slate-400 hover:text-white flex items-center space-x-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Mark as read"
                                >
                                  <Check className="w-3 h-3 text-emerald-400" />
                                  <span>read</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Dropdown Footer Quick Links */}
          <div className="flex items-center justify-between border-t border-white/10 px-4 py-2.5 bg-slate-900/60 text-[11px]">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/activity");
              }}
              className="text-slate-400 hover:text-white transition-colors flex items-center"
            >
              <span>Activity Feed</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/surprises");
              }}
              className="text-pink-400 hover:text-pink-300 font-medium transition-colors flex items-center"
            >
              <span>Surprises</span>
              <ChevronRight className="w-3 h-3 ml-0.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
