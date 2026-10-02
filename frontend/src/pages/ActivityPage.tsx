import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity as ActivityIcon,
  Flame,
  Heart,
  Sparkles,
  Trophy,
  Target,
  Gift,
  CheckCircle2,
  RefreshCw,
  Search,
  Users,
  Clock,
  Calendar,
  Lock,
  MessageCircleHeart,
} from "lucide-react";
import { activityService } from "../services/activity.service";
import { partnerService } from "../services/partner.service";
import type {
  ActivityResponse,
  ActivityType,
  ActivityFilterType,
  PartnerStatusResponse,
} from "../types";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { cn } from "../utils/cn";

// Allowed reaction emojis
const REACTION_EMOJIS = ["❤️", "🔥", "👏", "✨"] as const;

// Activity type badges & styles configuration
const TYPE_CONFIG: Record<
  ActivityType,
  { label: string; badgeClass: string; iconBg: string; fallbackIcon: string }
> = {
  HABIT_COMPLETED: {
    label: "Habit Completed",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    iconBg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    fallbackIcon: "✅",
  },
  HABIT_STREAK: {
    label: "Streak Milestone",
    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    iconBg: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    fallbackIcon: "🔥",
  },
  GOAL_PROGRESS: {
    label: "Goal Progress",
    badgeClass: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    iconBg: "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
    fallbackIcon: "🎯",
  },
  GOAL_COMPLETED: {
    label: "Goal Reached",
    badgeClass: "bg-purple-500/10 text-purple-300 border-purple-500/20",
    iconBg: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    fallbackIcon: "🏅",
  },
  COMPANION_LEVEL_UP: {
    label: "Companion Evolution",
    badgeClass: "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20",
    iconBg: "bg-fuchsia-500/15 text-fuchsia-400 border-fuchsia-500/30",
    fallbackIcon: "🌟",
  },
  ACHIEVEMENT_UNLOCKED: {
    label: "Achievement Unlocked",
    badgeClass: "bg-yellow-500/10 text-yellow-300 border-yellow-500/20",
    iconBg: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30",
    fallbackIcon: "🏆",
  },
  SURPRISE_SENT: {
    label: "Surprise Sent",
    badgeClass: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    iconBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    fallbackIcon: "🎁",
  },
  SURPRISE_OPENED: {
    label: "Surprise Opened",
    badgeClass: "bg-pink-500/10 text-pink-300 border-pink-500/20",
    iconBg: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    fallbackIcon: "💖",
  },
  PARTNER_CONNECTED: {
    label: "Sanctuary Bond",
    badgeClass: "bg-rose-500/10 text-rose-300 border-rose-500/20",
    iconBg: "bg-rose-500/15 text-rose-400 border-rose-500/30",
    fallbackIcon: "❤️",
  },
  PARTNER_INVITATION_SENT: {
    label: "Invitation Sent",
    badgeClass: "bg-violet-500/10 text-violet-300 border-violet-500/20",
    iconBg: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    fallbackIcon: "💌",
  },
};

export const ActivityPage: React.FC = () => {
  // State
  const [activities, setActivities] = useState<ActivityResponse[]>([]);
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [streamFilter, setStreamFilter] = useState<"ALL" | "MINE" | "PARTNER">("ALL");
  const [categoryFilter, setCategoryFilter] = useState<ActivityFilterType>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Optimistic reaction states
  const [animatingReaction, setAnimatingReaction] = useState<{ id: number; emoji: string } | null>(null);

  // Fetch activities and partner info
  const loadActivities = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      // Load partner status and activity feed concurrently
      const [feedData, pStatus] = await Promise.all([
        activityService.getCombinedFeed(100),
        partnerService.getStatus().catch(() => null),
      ]);

      setActivities(feedData || []);
      setPartnerStatus(pStatus);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load activities";
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Handle reaction toggle with optimistic UI
  const handleReaction = async (activityId: number, emoji: string) => {
    setAnimatingReaction({ id: activityId, emoji });
    setTimeout(() => setAnimatingReaction(null), 600);

    // Optimistically update local state
    setActivities((prev) =>
      prev.map((item) => {
        if (item.id !== activityId) return item;

        const currentActive = !!item.myReactions?.[emoji];
        const newActive = !currentActive;
        const currentCount = item.reactions?.[emoji] || 0;
        const newCount = newActive ? currentCount + 1 : Math.max(0, currentCount - 1);

        return {
          ...item,
          myReactions: {
            ...item.myReactions,
            [emoji]: newActive,
          },
          reactions: {
            ...item.reactions,
            [emoji]: newCount,
          },
        };
      })
    );

    try {
      const res = await activityService.toggleReaction(activityId, emoji);
      // Sync with server authoritative numbers
      setActivities((prev) =>
        prev.map((item) =>
          item.id === activityId
            ? {
                ...item,
                reactions: res.reactions,
                myReactions: {
                  ...item.myReactions,
                  [emoji]: res.added,
                },
              }
            : item
        )
      );
    } catch (err) {
      // Revert on error
      loadActivities();
    }
  };

  // Filter activities
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      // Stream filter
      if (streamFilter === "MINE" && !act.isMine) return false;
      if (streamFilter === "PARTNER" && act.isMine) return false;

      // Category filter
      if (categoryFilter === "HABITS") {
        if (act.type !== "HABIT_COMPLETED" && act.type !== "HABIT_STREAK") return false;
      } else if (categoryFilter === "GOALS") {
        if (act.type !== "GOAL_PROGRESS" && act.type !== "GOAL_COMPLETED") return false;
      } else if (categoryFilter === "COMPANION") {
        if (act.type !== "COMPANION_LEVEL_UP") return false;
      } else if (categoryFilter === "ACHIEVEMENTS") {
        if (act.type !== "ACHIEVEMENT_UNLOCKED") return false;
      } else if (categoryFilter === "SURPRISES") {
        if (act.type !== "SURPRISE_SENT" && act.type !== "SURPRISE_OPENED") return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = act.title?.toLowerCase().includes(query);
        const matchesDesc = act.description?.toLowerCase().includes(query);
        const matchesActor = act.actorName?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesActor) return false;
      }

      return true;
    });
  }, [activities, streamFilter, categoryFilter, searchQuery]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = activities.length;
    const mineCount = activities.filter((a) => a.isMine).length;
    const partnerCount = total - mineCount;
    let totalReactions = 0;
    activities.forEach((a) => {
      if (a.reactions) {
        Object.values(a.reactions).forEach((cnt) => {
          totalReactions += Number(cnt) || 0;
        });
      }
    });

    return { total, mineCount, partnerCount, totalReactions };
  }, [activities]);

  // Group activities by date bucket
  const groupedActivities = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    const groups: { label: string; items: ActivityResponse[] }[] = [
      { label: "Today", items: [] },
      { label: "Yesterday", items: [] },
      { label: "Earlier this week", items: [] },
      { label: "Previous Moments", items: [] },
    ];

    filteredActivities.forEach((act) => {
      const actDate = new Date(act.createdAt);
      const diffDays = Math.floor((now.getTime() - actDate.getTime()) / (1000 * 60 * 60 * 24));

      if (actDate.toDateString() === todayStr) {
        groups[0].items.push(act);
      } else if (actDate.toDateString() === yesterdayStr) {
        groups[1].items.push(act);
      } else if (diffDays <= 7) {
        groups[2].items.push(act);
      } else {
        groups[3].items.push(act);
      }
    });

    return groups.filter((g) => g.items.length > 0);
  }, [filteredActivities]);

  // Format relative time
  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  // Helper to parse JSON metadata safely
  const parseMetadata = (raw?: string | null) => {
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };

  const partnerName = partnerStatus?.partner?.nickname || partnerStatus?.partner?.name || "Partner";
  const hasPartner = partnerStatus?.status === "CONNECTED";

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-16">
      {/* ── Top Header & Stats ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-violet-500/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <ActivityIcon className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Partner Activity
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.15)]">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                A shared chronological stream of habits, milestones, and moments between you and {partnerName}.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadActivities(true)}
            disabled={isRefreshing}
            className="border-violet-500/20 hover:border-violet-500/40 text-slate-300 hover:text-white"
          >
            <RefreshCw
              className={cn("h-4 w-4 mr-2 text-violet-400", isRefreshing && "animate-spin")}
            />
            {isRefreshing ? "Syncing..." : "Refresh"}
          </Button>
        </div>
      </div>

      {/* ── Quick Stats Ribbon ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-[#0e1322]/80 border-violet-500/10 hover:border-violet-500/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Moments</span>
            <ActivityIcon className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{stats.total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Shared in sanctuary</div>
        </Card>

        <Card className="p-4 bg-[#0e1322]/80 border-emerald-500/10 hover:border-emerald-500/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Your Actions</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">{stats.mineCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Milestones achieved</div>
        </Card>

        <Card className="p-4 bg-[#0e1322]/80 border-indigo-500/10 hover:border-indigo-500/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">{partnerName}</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 mt-1.5">{stats.partnerCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Partner updates</div>
        </Card>

        <Card className="p-4 bg-[#0e1322]/80 border-rose-500/10 hover:border-rose-500/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Reactions</span>
            <Heart className="h-4 w-4 text-rose-400 fill-rose-500/20" />
          </div>
          <div className="text-2xl font-bold text-rose-400 mt-1.5">{stats.totalReactions}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Love & cheers given</div>
        </Card>
      </div>

      {/* ── Partner Connection Notice (if not connected) ─────────────── */}
      {!hasPartner && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-violet-950/40 via-indigo-950/30 to-slate-900/40 border border-violet-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-violet-500/15 border border-violet-500/30 flex items-center justify-center text-violet-300">
              <MessageCircleHeart className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Connect with your partner for the full two-person feed</div>
              <div className="text-xs text-slate-400">Send an invitation to see their habit progress, streaks, and milestones in realtime.</div>
            </div>
          </div>
          <Button
            size="sm"
            variant="glow"
            onClick={() => (window.location.href = "/partner")}
            className="whitespace-nowrap"
          >
            Go to Partner Space
          </Button>
        </div>
      )}

      {/* ── Filters & Controls ───────────────────────────────────────── */}
      <div className="space-y-3.5">
        {/* Stream switch & search row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Stream selector tabs */}
          <div className="inline-flex p-1 rounded-xl bg-[#0B0F19] border border-violet-500/15">
            <button
              onClick={() => setStreamFilter("ALL")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                streamFilter === "ALL"
                  ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                  : "text-slate-400 hover:text-white"
              )}
            >
              All Activity
            </button>
            <button
              onClick={() => setStreamFilter("MINE")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                streamFilter === "MINE"
                  ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                  : "text-slate-400 hover:text-white"
              )}
            >
              You ({stats.mineCount})
            </button>
            <button
              onClick={() => setStreamFilter("PARTNER")}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-medium transition-all",
                streamFilter === "PARTNER"
                  ? "bg-violet-600 text-white shadow-[0_0_12px_rgba(139,92,246,0.3)]"
                  : "text-slate-400 hover:text-white"
              )}
            >
              {partnerName} ({stats.partnerCount})
            </button>
          </div>

          {/* Search box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search feed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-[#0B0F19] border border-violet-500/15 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: "ALL", label: "All Types" },
            { id: "HABITS", label: "Habits & Streaks", icon: CheckCircle2 },
            { id: "GOALS", label: "Goals", icon: Target },
            { id: "COMPANION", label: "Companion", icon: Sparkles },
            { id: "ACHIEVEMENTS", label: "Achievements", icon: Trophy },
            { id: "SURPRISES", label: "Surprises", icon: Gift },
          ].map((cat) => {
            const Icon = cat.icon;
            const isSelected = categoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id as ActivityFilterType)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap border",
                  isSelected
                    ? "bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                    : "bg-[#0e1322]/60 text-slate-400 border-violet-500/10 hover:border-violet-500/25 hover:text-slate-200"
                )}
              >
                {Icon && <Icon className="h-3 w-3" />}
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Timeline Activity Feed ───────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-800/60 animate-pulse" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 w-40 rounded-md bg-slate-800/60 animate-pulse" />
                  <div className="h-3 w-24 rounded-md bg-slate-800/40 animate-pulse" />
                </div>
                <div className="h-6 w-20 rounded-full bg-slate-800/50 animate-pulse" />
              </div>
              <div className="h-3.5 w-3/4 rounded-md bg-slate-800/40 animate-pulse sm:ml-12" />
              <div className="pt-2 border-t border-slate-800/50 flex gap-2 sm:ml-12">
                <div className="h-7 w-12 rounded-lg bg-slate-800/40 animate-pulse" />
                <div className="h-7 w-12 rounded-lg bg-slate-800/40 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center bg-red-950/20 border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => loadActivities()}
            className="mt-4 border-red-500/30 text-red-300"
          >
            Try Again
          </Button>
        </Card>
      ) : filteredActivities.length === 0 ? (
        <Card className="py-16 px-4 text-center bg-[#0e1322]/40 border-violet-500/10">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto mb-3 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <ActivityIcon className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">No activities match your filters</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            Complete daily habits, make goal progress, or unlock achievements together to grow your shared feed.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setStreamFilter("ALL");
                setCategoryFilter("ALL");
                setSearchQuery("");
              }}
              className="text-xs border-violet-500/20"
            >
              Clear Filters
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-8">
          {groupedActivities.map((group) => (
            <div key={group.label} className="space-y-4">
              {/* Date Group Heading */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold uppercase tracking-wider text-violet-400/90 flex items-center gap-1.5">
                  <Calendar className="h-3 w-3" />
                  {group.label}
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-violet-500/20 to-transparent" />
              </div>

              {/* Feed Cards */}
              <div className="space-y-3 relative pl-3.5 sm:pl-6 before:absolute before:left-0 sm:before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-violet-500/30 before:via-violet-500/15 before:to-transparent">
                {group.items.map((act) => {
                  const conf = TYPE_CONFIG[act.type] || {
                    label: act.type,
                    badgeClass: "bg-slate-500/10 text-slate-300 border-slate-500/20",
                    iconBg: "bg-slate-500/15 text-slate-300 border-slate-500/30",
                    fallbackIcon: "✨",
                  };
                  const meta = parseMetadata(act.metadata);

                  return (
                    <div
                      key={act.id}
                      className="group relative rounded-2xl bg-[#0e1322]/80 border border-violet-500/15 hover:border-violet-500/35 transition-all duration-300 p-3.5 sm:p-4 shadow-sm hover:shadow-[0_4px_24px_rgba(139,92,246,0.1)]"
                    >
                      {/* Timeline dot */}
                      <div
                        className={cn(
                          "absolute -left-3.5 sm:-left-6 top-5 -translate-x-1/2 h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full border-2 border-[#090D16] transition-transform duration-300 group-hover:scale-125",
                          act.isMine ? "bg-emerald-400 ring-2 ring-emerald-500/30" : "bg-violet-400 ring-2 ring-violet-500/30"
                        )}
                      />

                      {/* Header Row: Actor + Type Badge + Time */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          {/* Avatar */}
                          <div className="relative">
                            <Avatar
                              fallback={act.actorName}
                              alt={act.actorName}
                              src={act.actorAvatarUrl || undefined}
                              size="md"
                              className={cn(
                                "ring-2",
                                act.isMine ? "ring-emerald-500/40" : "ring-violet-500/40"
                              )}
                            />
                            <span
                              className={cn(
                                "absolute -bottom-1 -right-1 text-[11px] px-1 rounded-full border border-black/40",
                                act.isMine ? "bg-emerald-600 text-white" : "bg-violet-600 text-white"
                              )}
                            >
                              {act.isMine ? "You" : "❤️"}
                            </span>
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-semibold text-white">
                                {act.isMine ? "You" : act.actorName}
                              </span>
                              <span
                                className={cn(
                                  "inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border",
                                  conf.badgeClass
                                )}
                              >
                                {conf.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                              <Clock className="h-3 w-3" />
                              <span>{formatTime(act.createdAt)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card Content Row */}
                      <div className="mt-3.5 flex items-start gap-3.5">
                        {/* Glowing Icon Box */}
                        <div
                          className={cn(
                            "h-10 w-10 shrink-0 rounded-xl flex items-center justify-center text-lg border shadow-[0_0_12px_rgba(139,92,246,0.12)]",
                            conf.iconBg
                          )}
                        >
                          {act.icon || conf.fallbackIcon}
                        </div>

                        {/* Title & Description */}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-bold text-white tracking-tight leading-snug">
                            {act.title}
                          </h4>
                          {act.description && (
                            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                              {act.description}
                            </p>
                          )}

                          {/* ── Related Progress Widget ──────────────── */}
                          {meta && (
                            <div className="mt-2.5 p-2.5 rounded-xl bg-[#090D16]/70 border border-violet-500/10 space-y-1.5">
                              {/* Streak Milestone */}
                              {meta.streak && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold">
                                    <Flame className="h-3.5 w-3.5 fill-amber-500/20" />
                                    {meta.streak}-Day Streak
                                  </span>
                                  {meta.xp && (
                                    <span className="text-[11px] text-violet-300 font-medium bg-violet-500/15 px-2 py-0.5 rounded-md border border-violet-500/20">
                                      +{meta.xp} XP
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Goal Progress Bar */}
                              {typeof meta.progress === "number" && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[11px] text-slate-400">
                                    <span>Milestone Progress</span>
                                    <span className="font-semibold text-white">
                                      {meta.current ?? meta.progress}
                                      {meta.target ? ` / ${meta.target}` : "%"} {meta.unit || ""}
                                    </span>
                                  </div>
                                  <ProgressBar
                                    value={meta.progress}
                                    variant="violet"
                                    size="sm"
                                  />
                                </div>
                              )}

                              {/* Companion Level Up */}
                              {meta.companionName && meta.level && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="inline-flex items-center gap-1 text-fuchsia-400 font-semibold">
                                    <Sparkles className="h-3.5 w-3.5" />
                                    {meta.companionName} • Level {meta.level}
                                  </span>
                                  {meta.unlockedAbility && (
                                    <span className="text-[11px] text-slate-400 italic">
                                      "{meta.unlockedAbility}"
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Achievement Banner */}
                              {meta.achievementName && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="inline-flex items-center gap-1 text-yellow-300 font-semibold">
                                    <Trophy className="h-3.5 w-3.5" />
                                    {meta.achievementName}
                                  </span>
                                  {meta.xpReward && (
                                    <span className="text-[11px] text-amber-300 font-medium">
                                      +{meta.xpReward} Resonance XP
                                    </span>
                                  )}
                                </div>
                              )}

                              {/* Surprise / Gift */}
                              {meta.surpriseTitle && (
                                <div className="flex items-center justify-between text-xs">
                                  <span className="inline-flex items-center gap-1 text-rose-400 font-semibold">
                                    <Gift className="h-3.5 w-3.5" />
                                    {meta.surpriseTitle}
                                  </span>
                                  {meta.unlockDate && (
                                    <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
                                      <Lock className="h-3 w-3" />
                                      {meta.unlockDate}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* ── Reaction Bar ─────────────────────────────── */}
                      <div className="mt-3.5 pt-3 border-t border-violet-500/10 flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-medium mr-1 hidden sm:inline">
                            React:
                          </span>
                          {REACTION_EMOJIS.map((emoji) => {
                            const count = act.reactions?.[emoji] || 0;
                            const isMineReaction = !!act.myReactions?.[emoji];
                            const isPulsing =
                              animatingReaction?.id === act.id && animatingReaction?.emoji === emoji;

                            return (
                              <button
                                key={emoji}
                                onClick={() => handleReaction(act.id, emoji)}
                                className={cn(
                                  "inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-xs transition-all duration-200 border select-none active:scale-90",
                                  isMineReaction
                                    ? "bg-violet-500/25 text-white border-violet-400/50 shadow-[0_0_12px_rgba(139,92,246,0.3)] font-semibold"
                                    : "bg-[#090D16]/60 text-slate-400 border-violet-500/10 hover:border-violet-500/30 hover:text-slate-200",
                                  isPulsing && "scale-125 duration-100"
                                )}
                                title={`React with ${emoji}`}
                              >
                                <span className={cn(isPulsing && "animate-bounce")}>{emoji}</span>
                                {count > 0 && <span className="text-[11px]">{count}</span>}
                              </button>
                            );
                          })}
                        </div>

                        {/* Subtle Right indicator */}
                        <div className="text-[10px] sm:text-[11px] text-slate-500 flex items-center gap-1 ml-auto">
                          {act.isMine ? (
                            <span className="text-emerald-400/80">Your action</span>
                          ) : (
                            <span className="text-violet-400/80">{act.actorName}'s moment</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
