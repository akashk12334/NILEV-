import React, { useState, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import {
  BarChart3,
  Flame,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  User,
  Users2,
  Lock,
  RefreshCw,
} from "lucide-react";
import { analyticsService } from "../services";
import type {
  AnalyticsDashboardResponse,
  TimeframeOption,
} from "../types";
import { Card, Badge, Skeleton } from "../components/ui";

const TIMEFRAME_OPTIONS: { label: string; value: TimeframeOption }[] = [
  { label: "7 Days", value: "7d" },
  { label: "30 Days", value: "30d" },
  { label: "90 Days", value: "90d" },
];

export const AnalyticsPage: React.FC = () => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>("30d");
  const [isPartnerView, setIsPartnerView] = useState<boolean>(false);
  const [data, setData] = useState<AnalyticsDashboardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await analyticsService.getDashboard(timeframe, isPartnerView);
      setData(res);
    } catch (err: unknown) {
      console.error("Failed to load analytics:", err);
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load sanctuary analytics. Please try again.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, isPartnerView]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16 pt-2 px-4 sm:px-6 lg:px-8">
      {/* ── Top Header & Sanctuary Branding ──────────────────────── */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="p-2 rounded-xl bg-violet-600/20 text-violet-400 border border-violet-500/30">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                Sanctuary Analytics
              </h1>
            </div>
            <p className="text-xs sm:text-sm text-slate-400">
              Deep behavioral momentum, habit consistency, and joint milestones.
            </p>
          </div>

          {/* Controls: Partner View-Only Toggle + Timeframe Filters */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-3 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Perspective Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-[rgba(147,130,255,0.12)] shadow-inner shrink-0">
              <button
                type="button"
                id="analytics-your-view-btn"
                onClick={() => setIsPartnerView(false)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  !isPartnerView
                    ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-950/40"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>You</span>
              </button>
              <button
                type="button"
                id="analytics-partner-view-btn"
                onClick={() => setIsPartnerView(true)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isPartnerView
                    ? "bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-sm shadow-amber-950/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                }`}
              >
                <Users2 className="w-3.5 h-3.5" />
                <span>Partner</span>
                <span className={`text-[9px] sm:text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded-full border transition-colors ${
                  isPartnerView
                    ? "bg-amber-500/25 text-amber-200 border-amber-500/40"
                    : "bg-black/30 text-slate-400 border-white/5"
                }`}>
                  Read-Only
                </span>
              </button>
            </div>

            {/* Date Filters: 7d, 30d, 90d */}
            <div className="flex items-center p-1 rounded-xl bg-slate-900/90 border border-[rgba(147,130,255,0.12)] shadow-inner shrink-0">
              {TIMEFRAME_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  id={`timeframe-${opt.value}-btn`}
                  onClick={() => setTimeframe(opt.value)}
                  className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    timeframe === opt.value
                      ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-950/40"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Refresh Button */}
            <button
              type="button"
              id="analytics-refresh-btn"
              onClick={fetchAnalytics}
              disabled={isLoading}
              title="Refresh Analytics"
              className="p-2 rounded-xl bg-slate-900 border border-[rgba(147,130,255,0.14)] text-slate-400 hover:text-slate-200 hover:border-violet-500/30 hover:bg-slate-800/60 transition disabled:opacity-50 shrink-0"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-violet-400" : ""}`} />
            </button>
          </div>
        </div>

        {/* View-Only Partner Alert Banner */}
        {isPartnerView && data && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs text-amber-200 animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-amber-100">
                  Viewing Partner Analytics (View-Only Mode)
                </span>
                <span className="hidden sm:inline text-amber-300/80 ml-2">
                  Observing {data.userName}&apos;s momentum without modifying their personal habits or records.
                </span>
              </div>
            </div>
            <Badge variant="amber" className="text-[10px] uppercase font-bold tracking-wider">
              Protected Couple Bond
            </Badge>
          </div>
        )}
      </div>

      {/* ── Main Dashboard Content ─────────────────────────────────── */}
      <div className="max-w-7xl mx-auto space-y-8">
        {isLoading && !data ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 rounded-2xl bg-slate-900/60" />
            ))}
          </div>
        ) : error ? (
          <Card className="p-8 text-center bg-slate-900/40 border-slate-800">
            <div className="inline-flex p-3 rounded-2xl bg-rose-500/10 text-rose-400 mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">
              Unable to load analytics
            </h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">{error}</p>
            <button
              onClick={fetchAnalytics}
              className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-semibold text-white shadow-lg shadow-violet-600/30 transition"
            >
              Retry
            </button>
          </Card>
        ) : data ? (
          <>
            {/* ── Stat Highlights Bar ─────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Stat 1: Consistency */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-violet-500/30 transition-all backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-violet-600/10 rounded-full blur-2xl group-hover:bg-violet-600/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Overall Consistency</span>
                  <div className="p-1.5 rounded-lg bg-violet-500/10 text-violet-400">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {data.overallConsistency.toFixed(1)}%
                  </span>
                  <span className="text-xs text-emerald-400 font-medium flex items-center">
                    +4.2% vs prev
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Across {data.activeHabitsCount} active habits ({data.timeframe})
                </p>
              </div>

              {/* Stat 2: Total Completions */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-cyan-500/30 transition-all backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-600/10 rounded-full blur-2xl group-hover:bg-cyan-600/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Total Completions</span>
                  <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-white">
                    {data.totalCompletions}
                  </span>
                  <span className="text-xs text-slate-400">habits fulfilled</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Average {(data.totalCompletions / (data.timeframe === "7d" ? 7 : data.timeframe === "90d" ? 90 : 30)).toFixed(1)} daily acts
                </p>
              </div>

              {/* Stat 3: Streaks */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-amber-500/30 transition-all backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/10 rounded-full blur-2xl group-hover:bg-amber-600/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Current Streak</span>
                  <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                    <Flame className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-amber-400">
                    {data.currentStreak}
                  </span>
                  <span className="text-xs text-slate-400">days ongoing</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                  <span>Best: {data.longestStreak} days</span>
                  {data.partnerInfo && (
                    <span className="text-violet-400">
                      Couple Bond: {data.partnerInfo.relationshipStreak}d
                    </span>
                  )}
                </div>
              </div>

              {/* Stat 4: XP & Companion */}
              <div className="p-5 rounded-2xl bg-slate-900/70 border border-slate-800/80 hover:border-emerald-500/30 transition-all backdrop-blur-xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/10 rounded-full blur-2xl group-hover:bg-emerald-600/20 transition-all pointer-events-none" />
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-400">Companion Growth</span>
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-emerald-400">
                    {data.xpGrowth.currentTotalXp}
                  </span>
                  <span className="text-xs text-slate-400">XP</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {data.xpGrowth.companionName || "Companion"} • Lvl {data.xpGrowth.currentLevel} ({data.xpGrowth.companionMood || "Joyful"})
                </p>
              </div>
            </div>

            {/* ── ROW 1: Weekly Completion & Monthly Completion ───────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Weekly Completion */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-sm shadow-violet-500/50" />
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Weekly Completion
                      </h2>
                    </div>
                    <Badge variant="violet" className="text-[11px]">
                      Day-of-Week Rhythm
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Historical average completion rate by day of the week
                    {data.partnerInfo ? " with partner comparative rhythm" : ""}.
                  </p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.weeklyCompletions}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="dayOfWeek"
                        tick={{ fill: "#94A3B8", fontSize: 11 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "#94A3B8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip
                        content={<CustomWeeklyTooltip isPartnerView={isPartnerView} />}
                        cursor={{ fill: "rgba(255,255,255,0.03)" }}
                      />
                      <Bar
                        dataKey="completionRate"
                        name={isPartnerView ? "Partner Rate" : "Your Rate"}
                        fill="#8B5CF6"
                        radius={[6, 6, 0, 0]}
                        maxBarSize={32}
                      />
                      {data.partnerInfo && !isPartnerView && (
                        <Bar
                          dataKey="partnerRate"
                          name="Partner Rate"
                          fill="#EC4899"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={32}
                        />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded bg-violet-500" />
                    <span>{isPartnerView ? `${data.userName}` : "You"}</span>
                  </div>
                  {data.partnerInfo && !isPartnerView && (
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded bg-pink-500" />
                      <span>{data.partnerInfo.partnerName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Chart 2: Monthly Completion */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Monthly Completion
                      </h2>
                    </div>
                    <Badge variant="indigo" className="text-[11px]">
                      Multi-Month Trend
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Longitudinal completion rate and active habit fulfillment over the past 6 months.
                  </p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.monthlyCompletions}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="cyanAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fill: "#94A3B8", fontSize: 11 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: "#94A3B8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}%`}
                      />
                      <Tooltip content={<CustomMonthlyTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="completionRate"
                        name="Monthly Rate"
                        stroke="#06B6D4"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#cyanAreaGradient)"
                        dot={{ r: 4, fill: "#06B6D4", stroke: "#083344", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#22D3EE" }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                  <span>6-Month Consistency Curve</span>
                  <span className="text-cyan-400 font-medium">
                    Peak: {Math.max(...data.monthlyCompletions.map((m) => m.completionRate)).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* ── ROW 2: XP Growth & Habit Distribution ───────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Chart 3: XP Growth (2 cols) */}
              <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400/50" />
                      <h2 className="text-base font-bold text-white tracking-tight">
                        XP Growth Trajectory
                      </h2>
                    </div>
                    <Badge variant="emerald" className="text-[11px]">
                      Level {data.xpGrowth.currentLevel} Evolution
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Cumulative XP accumulation fueled by legitimate habit execution and milestone completions.
                  </p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={data.xpGrowth.timeline}
                      margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="emeraldAreaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#94A3B8", fontSize: 11 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickLine={false}
                        interval={data.timeframe === "90d" ? 14 : data.timeframe === "30d" ? 5 : 0}
                      />
                      <YAxis
                        tick={{ fill: "#94A3B8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v) => `${v}`}
                      />
                      <Tooltip content={<CustomXpTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="cumulativeXp"
                        name="Cumulative XP"
                        stroke="#10B981"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#emeraldAreaGradient)"
                        dot={false}
                        activeDot={{ r: 6, fill: "#34D399", stroke: "#064E3B", strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                  <span>Companion: {data.xpGrowth.companionName}</span>
                  <span className="text-emerald-400 font-semibold">
                    {data.xpGrowth.currentTotalXp} / {data.xpGrowth.nextLevelXp} XP to Level {data.xpGrowth.currentLevel + 1}
                  </span>
                </div>
              </div>

              {/* Chart 4: Habit Distribution (1 col) */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm shadow-pink-500/50" />
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Habit Distribution
                      </h2>
                    </div>
                    <Badge variant="rose" className="text-[11px]">
                      By Category
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Balance across life dimensions and intentional energy allocation.
                  </p>
                </div>

                <div className="h-52 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.habitDistribution}
                        cx="50%"
                        cy="50%"
                        innerRadius={52}
                        outerRadius={78}
                        paddingAngle={4}
                        dataKey="completions"
                        nameKey="category"
                      >
                        {data.habitDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.4)" strokeWidth={2} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomDistributionTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="space-y-1.5 mt-2">
                  {data.habitDistribution.map((cat) => (
                    <div key={cat.category} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-slate-300 font-medium">{cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{cat.completions} hits</span>
                        <span className="text-slate-200 font-semibold">{cat.percentage.toFixed(0)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── ROW 3: Goal Progress & Streak History ───────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 5: Goal Progress */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Goal Progress
                      </h2>
                    </div>
                    <Badge variant="amber" className="text-[11px]">
                      {data.goalProgress.completedGoals}/{data.goalProgress.totalGoals} Completed
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Active personal and shared trajectories with key milestone markers.
                  </p>
                </div>

                {/* Goals Progress List / Visual Bars */}
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {data.goalProgress.goals.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-xs">
                      No goals currently tracked in this category.
                    </div>
                  ) : (
                    data.goalProgress.goals.map((g) => {
                      const pct = Math.min(100, Math.max(0, g.progressPercentage));
                      return (
                        <div
                          key={g.id}
                          className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition"
                        >
                          <div className="flex items-center justify-between text-xs mb-1.5">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{g.title}</span>
                              {g.isShared && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                                  Shared
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-amber-300">
                              {g.currentValue} / {g.targetValue} {g.unit} ({pct.toFixed(0)}%)
                            </span>
                          </div>

                          {/* Progress Track with Milestone Ticks */}
                          <div className="relative w-full h-3 rounded-full bg-slate-800/80 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400 transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                            {/* Milestone Marker Lines (25, 50, 75) */}
                            <span className="absolute top-0 bottom-0 left-[25%] w-0.5 bg-black/40" />
                            <span className="absolute top-0 bottom-0 left-[50%] w-0.5 bg-black/40" />
                            <span className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-black/40" />
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                            <span>Category: {g.category}</span>
                            <span>Target: {g.targetDate || "Ongoing"}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                  <span>Overall Goals Velocity</span>
                  <span className="text-amber-400 font-semibold">
                    {data.goalProgress.overallProgress.toFixed(1)}% Average Completion
                  </span>
                </div>
              </div>

              {/* Chart 6: Streak History */}
              <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50" />
                      <h2 className="text-base font-bold text-white tracking-tight">
                        Streak History & Rhythm
                      </h2>
                    </div>
                    <Badge variant="amber" className="text-[11px]">
                      {data.streakHistory.consistencyRate.toFixed(0)}% Active Continuity
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mb-6">
                    Continuous streak progression over the selected {data.timeframe} window.
                  </p>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={data.streakHistory.streakTimeline}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "#94A3B8", fontSize: 11 }}
                        axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                        tickLine={false}
                        interval={data.timeframe === "90d" ? 14 : data.timeframe === "30d" ? 5 : 0}
                      />
                      <YAxis
                        tick={{ fill: "#94A3B8", fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomStreakTooltip />} />
                      <Bar
                        dataKey="completedCount"
                        name="Completions"
                        fill="#F97316"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={16}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-800/60 text-xs text-slate-400">
                  <span>Current Active Run: {data.streakHistory.currentStreak} Days</span>
                  <span className="text-orange-400 font-semibold">
                    Peak Record: {data.streakHistory.longestStreak} Days
                  </span>
                </div>
              </div>
            </div>

            {/* ── ROW 4: Habit Consistency Breakdown Table ───────────── */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    Habit Consistency Matrix
                  </h3>
                  <p className="text-xs text-slate-400">
                    Individual habit scores and health status over the selected timeframe.
                  </p>
                </div>
                <Badge variant="violet" className="text-xs self-start sm:self-auto">
                  {data.habitConsistency.length} Active Habits
                </Badge>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3 pl-2">Habit</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Frequency</th>
                      <th className="pb-3">Completions</th>
                      <th className="pb-3">Current Streak</th>
                      <th className="pb-3">Consistency Score</th>
                      <th className="pb-3 pr-2 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {data.habitConsistency.map((habit) => {
                      const score = Math.round(habit.consistencyScore);
                      return (
                        <tr
                          key={habit.habitId}
                          className="hover:bg-slate-800/30 transition-colors"
                        >
                          <td className="py-3.5 pl-2 font-medium text-white flex items-center gap-2.5">
                            <span className="text-lg">{habit.icon || "⭐"}</span>
                            <span>{habit.name}</span>
                          </td>
                          <td className="py-3.5 text-slate-400">{habit.category}</td>
                          <td className="py-3.5 text-slate-400">{habit.frequency}</td>
                          <td className="py-3.5 text-slate-200 font-semibold">
                            {habit.completionsCount} / {habit.expectedCount}
                          </td>
                          <td className="py-3.5 text-amber-400 font-medium">
                            {habit.currentStreak}d (Best: {habit.longestStreak}d)
                          </td>
                          <td className="py-3.5">
                            <div className="flex items-center gap-2 max-w-[140px]">
                              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${
                                    score >= 80
                                      ? "bg-emerald-500"
                                      : score >= 50
                                      ? "bg-violet-500"
                                      : "bg-amber-500"
                                  }`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-300 w-9 text-right">
                                {score}%
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 pr-2 text-right">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                habit.status === "THRIVING"
                                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                                  : habit.status === "CONSISTENT"
                                  ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                                  : "bg-amber-500/15 text-amber-300 border border-amber-500/30"
                              }`}
                            >
                              {habit.status === "THRIVING"
                                ? "Thriving"
                                : habit.status === "CONSISTENT"
                                ? "Consistent"
                                : "Needs Attention"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
};

// ── Custom Tooltips with Futuristic Dark Aesthetic ──────────────────

interface TooltipPayloadItem {
  value: number;
  name: string;
  color?: string;
  payload?: Record<string, unknown>;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

const CustomWeeklyTooltip: React.FC<CustomTooltipProps & { isPartnerView?: boolean }> = ({
  active,
  payload,
  label,
  isPartnerView,
}) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const partnerItem = payload.length > 1 ? payload[1] : null;

  return (
    <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-xs space-y-1">
      <div className="font-bold text-white border-b border-slate-800 pb-1 mb-1">
        {label}
      </div>
      <div className="flex items-center justify-between gap-4 text-violet-300">
        <span>{isPartnerView ? "Partner Rate:" : "Your Rate:"}</span>
        <span className="font-bold">{item.value.toFixed(1)}%</span>
      </div>
      {partnerItem && partnerItem.value != null && (
        <div className="flex items-center justify-between gap-4 text-pink-300">
          <span>Partner Rate:</span>
          <span className="font-bold">{partnerItem.value.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
};

const CustomMonthlyTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const raw = item.payload as { completedCount?: number; totalExpected?: number; activeDays?: number };

  return (
    <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-xs space-y-1">
      <div className="font-bold text-white border-b border-slate-800 pb-1 mb-1">
        {label}
      </div>
      <div className="flex items-center justify-between gap-4 text-cyan-300">
        <span>Completion Rate:</span>
        <span className="font-bold">{item.value.toFixed(1)}%</span>
      </div>
      {raw && (
        <>
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>Completions:</span>
            <span>{raw.completedCount} / {raw.totalExpected}</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>Active Days:</span>
            <span>{raw.activeDays} days</span>
          </div>
        </>
      )}
    </div>
  );
};

const CustomXpTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const raw = item.payload as { dailyXp?: number };

  return (
    <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-xs space-y-1">
      <div className="font-bold text-white border-b border-slate-800 pb-1 mb-1">
        {label}
      </div>
      <div className="flex items-center justify-between gap-4 text-emerald-300">
        <span>Cumulative XP:</span>
        <span className="font-bold">{item.value} XP</span>
      </div>
      {raw && (
        <div className="flex items-center justify-between gap-4 text-slate-400">
          <span>Earned Today:</span>
          <span className="text-emerald-400 font-medium">+{raw.dailyXp} XP</span>
        </div>
      )}
    </div>
  );
};

const CustomDistributionTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const raw = item.payload as { category?: string; count?: number; completions?: number; percentage?: number };

  return (
    <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-xs space-y-1">
      <div className="font-bold text-white border-b border-slate-800 pb-1 mb-1">
        {raw.category}
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-300">
        <span>Habits:</span>
        <span className="font-bold">{raw.count}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-300">
        <span>Completions:</span>
        <span className="font-bold">{raw.completions}</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-violet-300">
        <span>Share:</span>
        <span className="font-bold">{raw.percentage?.toFixed(1)}%</span>
      </div>
    </div>
  );
};

const CustomStreakTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) return null;
  const item = payload[0];
  const raw = item.payload as { streak?: number; completedAll?: boolean };

  return (
    <div className="p-3 rounded-xl bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl shadow-2xl text-xs space-y-1">
      <div className="font-bold text-white border-b border-slate-800 pb-1 mb-1">
        {label}
      </div>
      <div className="flex items-center justify-between gap-4 text-orange-300">
        <span>Completions:</span>
        <span className="font-bold">{item.value} habits</span>
      </div>
      {raw && (
        <>
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>Rolling Streak:</span>
            <span className="text-amber-400 font-semibold">{raw.streak} days</span>
          </div>
          <div className="flex items-center justify-between gap-4 text-slate-400">
            <span>Status:</span>
            <span className={raw.completedAll ? "text-emerald-400" : "text-slate-400"}>
              {raw.completedAll ? "Perfect Day ✨" : "Active"}
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;
