import * as React from "react";
import {
  Plus,
  Flame,
  Check,
  Clock,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
  ChevronDown,
  BarChart2,
  Pencil,
  Sparkles,
} from "lucide-react";
import { useHabits } from "../hooks/useHabits";
import { useAuth } from "../hooks/useAuth";
import {
  Button,
  Card,
  Badge,
  ProgressBar,
  ProgressRing,
  useToast,
  Modal,
  StatCard,
} from "../components/ui";
import type {
  HabitResponse,
  HabitFilter,
  HabitFrequency,
  HabitTimeOfDay,
  CreateHabitRequest,
  UpdateHabitRequest,
} from "../types";

// ── constants ────────────────────────────────────────────────────

const FREQUENCY_LABELS: Record<HabitFrequency, string> = {
  DAILY: "Daily",
  WEEKDAYS: "Weekdays",
  WEEKENDS: "Weekends",
  WEEKLY: "Weekly",
  MONTHLY: "Monthly",
};

const TOD_LABELS: Record<HabitTimeOfDay, string> = {
  MORNING: "Morning",
  AFTERNOON: "Afternoon",
  EVENING: "Evening",
  ANYTIME: "Anytime",
};

const CATEGORY_OPTIONS = [
  "General", "Health", "Fitness", "Mindfulness", "Growth",
  "Connection", "Finance", "Creativity", "Learning", "Sleep",
];

const ICON_OPTIONS = [
  "⭐", "🏃", "📖", "🧘", "💧", "🌅", "💪", "🎯",
  "🍎", "😴", "✍️", "🎨", "🧠", "❤️", "🌱", "🔥",
];

const COLOR_OPTIONS = [
  { label: "Violet", value: "#8B5CF6" },
  { label: "Indigo", value: "#6366F1" },
  { label: "Pink", value: "#EC4899" },
  { label: "Emerald", value: "#10B981" },
  { label: "Amber", value: "#F59E0B" },
  { label: "Sky", value: "#0EA5E9" },
  { label: "Rose", value: "#F43F5E" },
  { label: "Teal", value: "#14B8A6" },
];

const FILTERS: { id: HabitFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "completed", label: "Completed" },
  { id: "pending", label: "Pending" },
  { id: "morning", label: "Morning" },
  { id: "afternoon", label: "Afternoon" },
  { id: "evening", label: "Evening" },
];

// ── helper to decide badge colour from category ───────────────────
function categoryBadgeVariant(cat: string) {
  const map: Record<string, string> = {
    Health: "emerald", Fitness: "emerald", Mindfulness: "violet",
    Growth: "indigo", Connection: "rose", Finance: "amber",
    Creativity: "violet", Learning: "indigo",
  };
  return (map[cat] ?? "secondary") as "violet" | "rose" | "indigo" | "secondary" | "amber" | "emerald";
}

// ── Completion Check Button ───────────────────────────────────────
function CheckButton({
  done,
  loading,
  onClick,
  color,
}: {
  done: boolean;
  loading: boolean;
  onClick: () => void;
  color: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      aria-label={done ? "Mark incomplete" : "Mark complete"}
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
        done
          ? "border-transparent text-white shadow-lg"
          : "border-slate-600 bg-transparent hover:border-slate-400 text-transparent"
      } ${loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      style={done ? { backgroundColor: color, boxShadow: `0 0 16px ${color}60` } : {}}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      ) : done ? (
        <Check className="h-4.5 w-4.5 stroke-[3]" />
      ) : (
        <Check className="h-4.5 w-4.5 stroke-[3] text-slate-600 group-hover:text-slate-400 transition-colors" />
      )}
      {/* ripple on complete */}
      {done && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ backgroundColor: color }}
        />
      )}
    </button>
  );
}

// ── Habit Card ────────────────────────────────────────────────────
function HabitCard({
  habit,
  onToggle,
  onEdit,
  onDelete,
  toggling,
}: {
  habit: HabitResponse;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
  toggling: boolean;
}) {
  const [showStats, setShowStats] = React.useState(false);

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
        habit.completedToday
          ? "border-[color:var(--habit-color)]/40 bg-slate-900/60"
          : "border-slate-800/70 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
      }`}
      style={{ "--habit-color": habit.color } as React.CSSProperties}
    >
      {/* left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300"
        style={{
          backgroundColor: habit.completedToday ? habit.color : "transparent",
          boxShadow: habit.completedToday ? `0 0 12px ${habit.color}80` : "none",
        }}
      />

      <div className="pl-4 pr-4 pt-4 pb-3">
        {/* top row */}
        <div className="flex items-start gap-3">
          {/* check button */}
          <CheckButton
            done={habit.completedToday}
            loading={toggling}
            onClick={onToggle}
            color={habit.color}
          />

          {/* icon + name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-lg leading-none">{habit.icon}</span>
              <h3
                className={`text-sm font-bold leading-tight transition-colors ${
                  habit.completedToday ? "text-slate-400 line-through" : "text-white"
                }`}
              >
                {habit.name}
              </h3>
            </div>
            {habit.description && (
              <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 mb-1.5">
                {habit.description}
              </p>
            )}

            {/* meta row */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant={categoryBadgeVariant(habit.category)} size="sm">
                {habit.category}
              </Badge>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {TOD_LABELS[habit.timeOfDay]}
              </span>
              <span className="text-[10px] text-slate-500">
                {FREQUENCY_LABELS[habit.frequency]}
              </span>
            </div>
          </div>

          {/* streak badge */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 text-xs font-bold font-mono text-amber-400">
              <Flame className="h-3.5 w-3.5 fill-amber-400" />
              <span>{habit.currentStreak}d</span>
            </div>
            {habit.completedToday && (
              <Badge variant="emerald" size="sm" withDot>
                Done
              </Badge>
            )}
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>Weekly</span>
            <span className="font-mono font-medium">{habit.weeklyCompletion.toFixed(0)}%</span>
          </div>
          <ProgressBar
            value={habit.weeklyCompletion}
            size="sm"
            variant={
              habit.completedToday
                ? "emerald"
                : habit.weeklyCompletion > 60
                ? "violet"
                : "amber"
            }
            glow={habit.weeklyCompletion >= 80}
          />
        </div>

        {/* expandable stats */}
        {showStats && (
          <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-3 gap-2 animate-in fade-in duration-150">
            {[
              { label: "Streak", value: `${habit.currentStreak}d`, sub: `Best: ${habit.longestStreak}d`, color: "text-amber-400" },
              { label: "Monthly", value: `${habit.monthlyCompletion.toFixed(0)}%`, sub: "Last 30 days", color: "text-violet-400" },
              { label: "Total", value: habit.totalCompletions, sub: "completions", color: "text-emerald-400" },
            ].map((s) => (
              <div key={s.label} className="bg-slate-950/50 rounded-xl p-2 text-center border border-slate-800/40">
                <p className={`text-xs font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-slate-600 mt-0.5">{s.label}</p>
                <p className="text-[8px] text-slate-700">{s.sub}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* actions footer */}
      <div className="flex items-center border-t border-slate-800/50 px-4 py-2">
        <button
          onClick={() => setShowStats((v) => !v)}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-violet-400 transition-colors"
        >
          <BarChart2 className="h-3 w-3" />
          <span>{showStats ? "Hide" : "Stats"}</span>
          <ChevronDown className={`h-3 w-3 transition-transform ${showStats ? "rotate-180" : ""}`} />
        </button>

        <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onEdit}
            className="p-1.5 rounded-lg text-slate-500 hover:text-violet-400 hover:bg-violet-950/30 transition-all"
            aria-label="Edit habit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
            aria-label="Delete habit"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Habit Form (create & edit) ────────────────────────────────────
function HabitForm({
  initial,
  onSubmit,
  onClose,
  submitting,
}: {
  initial?: HabitResponse;
  onSubmit: (data: CreateHabitRequest) => Promise<void>;
  onClose: () => void;
  submitting: boolean;
}) {
  const [name, setName] = React.useState(initial?.name ?? "");
  const [description, setDescription] = React.useState(initial?.description ?? "");
  const [icon, setIcon] = React.useState(initial?.icon ?? "⭐");
  const [category, setCategory] = React.useState(initial?.category ?? "General");
  const [color, setColor] = React.useState(initial?.color ?? "#8B5CF6");
  const [frequency, setFrequency] = React.useState<HabitFrequency>(initial?.frequency ?? "DAILY");
  const [timeOfDay, setTimeOfDay] = React.useState<HabitTimeOfDay>(initial?.timeOfDay ?? "ANYTIME");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({ name: name.trim(), description, icon, category, color, frequency, timeOfDay });
  };

  const inputCls =
    "w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className={labelCls}>Habit Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputCls}
          placeholder="e.g. Morning Workout"
          required
          maxLength={120}
        />
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${inputCls} resize-none`}
          rows={2}
          placeholder="Optional short description..."
          maxLength={500}
        />
      </div>

      {/* Icon picker */}
      <div>
        <label className={labelCls}>Icon</label>
        <div className="flex flex-wrap gap-2">
          {ICON_OPTIONS.map((em) => (
            <button
              key={em}
              type="button"
              onClick={() => setIcon(em)}
              className={`flex h-9 w-9 items-center justify-center rounded-xl text-lg border transition-all ${
                icon === em
                  ? "border-violet-500 bg-violet-950/50 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                  : "border-slate-700 bg-slate-900/60 hover:border-slate-500"
              }`}
            >
              {em}
            </button>
          ))}
        </div>
      </div>

      {/* Color picker */}
      <div>
        <label className={labelCls}>Accent Color</label>
        <div className="flex flex-wrap gap-2">
          {COLOR_OPTIONS.map((c) => (
            <button
              key={c.value}
              type="button"
              onClick={() => setColor(c.value)}
              title={c.label}
              className={`h-7 w-7 rounded-full border-2 transition-all ${
                color === c.value ? "border-white scale-110" : "border-transparent hover:scale-105"
              }`}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>
      </div>

      {/* Category & Frequency */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelCls}>Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={inputCls}
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
            className={inputCls}
          >
            {(Object.keys(FREQUENCY_LABELS) as HabitFrequency[]).map((k) => (
              <option key={k} value={k}>{FREQUENCY_LABELS[k]}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Time of Day */}
      <div>
        <label className={labelCls}>Time of Day</label>
        <div className="grid grid-cols-4 gap-2">
          {(["MORNING", "AFTERNOON", "EVENING", "ANYTIME"] as HabitTimeOfDay[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTimeOfDay(t)}
              className={`py-2 rounded-xl text-[11px] font-semibold border transition-all ${
                timeOfDay === t
                  ? "border-violet-500 bg-violet-950/50 text-violet-300"
                  : "border-slate-700 bg-slate-900/60 text-slate-400 hover:border-slate-600"
              }`}
            >
              {TOD_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      {/* Footer buttons */}
      <div className="flex gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onClose} className="flex-1" type="button">
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="flex-1"
          disabled={submitting || !name.trim()}
          leftIcon={submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : undefined}
        >
          {submitting ? "Saving…" : initial ? "Save Changes" : "Create Habit"}
        </Button>
      </div>
    </form>
  );
}

// ── Main HabitsPage ───────────────────────────────────────────────
export const HabitsPage: React.FC = () => {
  const { user } = useAuth();
  const { habits, loading, error, reload, create, update, remove, complete, uncomplete } = useHabits();
  const { toast } = useToast();

  const [filter, setFilter] = React.useState<HabitFilter>("all");
  const [togglingId, setTogglingId] = React.useState<number | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // modal states
  const [showCreate, setShowCreate] = React.useState(false);
  const [editingHabit, setEditingHabit] = React.useState<HabitResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<HabitResponse | null>(null);

  // ── filter habits ────────────────────────────────────────────────
  const filtered = React.useMemo(() => {
    return habits.filter((h) => {
      switch (filter) {
        case "completed": return h.completedToday;
        case "pending":   return !h.completedToday;
        case "morning":   return h.timeOfDay === "MORNING";
        case "afternoon": return h.timeOfDay === "AFTERNOON";
        case "evening":   return h.timeOfDay === "EVENING";
        case "today":     return true; // all active are for today
        default:          return true;
      }
    });
  }, [habits, filter]);

  // ── summary stats ─────────────────────────────────────────────────
  const totalHabits = habits.length;
  const doneToday = habits.filter((h) => h.completedToday).length;
  const todayPct = totalHabits ? Math.round((doneToday / totalHabits) * 100) : 0;
  const avgStreak = totalHabits
    ? Math.round(habits.reduce((s, h) => s + h.currentStreak, 0) / totalHabits)
    : 0;
  const avgCompletion = totalHabits
    ? Math.round(habits.reduce((s, h) => s + h.weeklyCompletion, 0) / totalHabits)
    : 0;

  // ── toggle completion ─────────────────────────────────────────────
  async function handleToggle(habit: HabitResponse) {
    setTogglingId(habit.id);
    try {
      if (habit.completedToday) {
        await uncomplete(habit.id);
        toast({ type: "info", title: "Unmarked", description: `'${habit.name}' unmarked for today.` });
      } else {
        const updated = await complete(habit.id);
        toast({
          type: "success",
          title: `Habit complete! ${habit.icon}`,
          description: `Streak is now ${updated.currentStreak} day${updated.currentStreak !== 1 ? "s" : ""}. +15 XP 🎉`,
        });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ type: "error", title: "Error", description: msg ?? "Could not update habit." });
    } finally {
      setTogglingId(null);
    }
  }

  // ── create ────────────────────────────────────────────────────────
  async function handleCreate(data: CreateHabitRequest) {
    setSubmitting(true);
    try {
      const created = await create(data);
      setShowCreate(false);
      toast({ type: "success", title: "Habit created! ✨", description: `'${created.name}' added to your habits.` });
    } catch {
      toast({ type: "error", title: "Error", description: "Failed to create habit." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── update ────────────────────────────────────────────────────────
  async function handleUpdate(data: UpdateHabitRequest) {
    if (!editingHabit) return;
    setSubmitting(true);
    try {
      await update(editingHabit.id, data);
      setEditingHabit(null);
      toast({ type: "success", title: "Updated!", description: "Habit saved successfully." });
    } catch {
      toast({ type: "error", title: "Error", description: "Failed to update habit." });
    } finally {
      setSubmitting(false);
    }
  }

  // ── delete ────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
      toast({ type: "info", title: "Deleted", description: `'${deleteTarget.name}' removed.` });
    } catch {
      toast({ type: "error", title: "Error", description: "Failed to delete habit." });
    } finally {
      setDeletingId(null);
    }
  }

  // ── render ────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-8">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Your Habits</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {(user?.nickname?.trim() || user?.name?.split(" ")[0] || "You")}'s personal habit tracker · {doneToday}/{totalHabits} done today
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={reload}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
          <Button
            variant="glow"
            size="sm"
            onClick={() => setShowCreate(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Habit
          </Button>
        </div>
      </div>

      {/* ── Summary StatCards ────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Progress"
          value={`${todayPct}%`}
          subtitle={`${doneToday} of ${totalHabits} habits done`}
          icon={<Check className="h-5 w-5" />}
          accentColor="violet"
          progress={todayPct}
          trend={{ value: doneToday > 0 ? `${doneToday} done` : "None yet", direction: doneToday > 0 ? "up" : "neutral" }}
        />
        <StatCard
          title="Active Habits"
          value={String(totalHabits)}
          subtitle={`${filtered.length} matching filter`}
          icon={<Sparkles className="h-5 w-5" />}
          accentColor="indigo"
          progress={(filtered.length / Math.max(totalHabits, 1)) * 100}
          trend={{ value: "Active", direction: "neutral" }}
        />
        <StatCard
          title="Avg. Streak"
          value={`${avgStreak}d`}
          subtitle="Across all habits"
          icon={<Flame className="h-5 w-5" />}
          accentColor="amber"
          progress={Math.min(avgStreak * 5, 100)}
          trend={{ value: avgStreak > 0 ? `${avgStreak} days` : "Start today!", direction: avgStreak > 3 ? "up" : "neutral" }}
        />
        <StatCard
          title="Weekly Completion"
          value={`${avgCompletion}%`}
          subtitle="Last 7 days average"
          icon={<BarChart2 className="h-5 w-5" />}
          accentColor="emerald"
          progress={avgCompletion}
          glow={avgCompletion >= 80}
          trend={{ value: avgCompletion >= 80 ? "Excellent!" : avgCompletion >= 50 ? "Good" : "Needs work", direction: avgCompletion >= 60 ? "up" : "neutral" }}
        />
      </div>

      {/* ── Overall progress ring + bar ──────────────────────── */}
      {totalHabits > 0 && (
        <Card className="p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <ProgressRing
              value={todayPct}
              size={90}
              strokeWidth={7}
              startColor={todayPct === 100 ? "#10B981" : "#8B5CF6"}
              endColor={todayPct === 100 ? "#14B8A6" : "#EC4899"}
            >
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-white">{todayPct}%</span>
                <span className="text-[9px] text-slate-500">today</span>
              </div>
            </ProgressRing>
            <div className="flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-white">Today's Overall Progress</span>
                <span className="font-mono text-violet-400">{doneToday}/{totalHabits} habits</span>
              </div>
              <ProgressBar value={todayPct} variant={todayPct === 100 ? "emerald" : "violet"} glow={todayPct >= 80} size="md" />
              {todayPct === 100 && (
                <p className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" />
                  Perfect day! All habits completed 🎉
                </p>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── Filter Bar ───────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
        {FILTERS.map((f) => {
          const count =
            f.id === "all" ? habits.length
            : f.id === "completed" ? habits.filter((h) => h.completedToday).length
            : f.id === "pending" ? habits.filter((h) => !h.completedToday).length
            : f.id === "morning" ? habits.filter((h) => h.timeOfDay === "MORNING").length
            : f.id === "afternoon" ? habits.filter((h) => h.timeOfDay === "AFTERNOON").length
            : f.id === "evening" ? habits.filter((h) => h.timeOfDay === "EVENING").length
            : habits.length;

          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                filter === f.id
                  ? "bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              {f.label}
              <span
                className={`text-[10px] font-mono ${filter === f.id ? "text-violet-200" : "text-slate-600"}`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Habit Grid ───────────────────────────────────────── */}
      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-slate-800/60 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-32 rounded-md bg-slate-800/60 animate-pulse" />
                    <div className="h-3 w-20 rounded-md bg-slate-800/40 animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-slate-800/50 animate-pulse" />
              </div>
              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                <div className="h-3.5 w-24 rounded-md bg-slate-800/40 animate-pulse" />
                <div className="h-3.5 w-16 rounded-md bg-slate-800/40 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center border-rose-500/20">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" />
          <p className="text-sm text-rose-300 mb-3">{error}</p>
          <Button variant="outline" size="sm" onClick={reload} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
            Try Again
          </Button>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          {totalHabits === 0 ? (
            <>
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-lg font-bold text-white mb-2">No habits yet</h3>
              <p className="text-sm text-slate-400 mb-5 max-w-sm mx-auto">
                Start building your routines. Add your first habit and begin tracking your progress.
              </p>
              <Button variant="glow" onClick={() => setShowCreate(true)} leftIcon={<Plus className="h-4 w-4" />}>
                Create Your First Habit
              </Button>
            </>
          ) : (
            <>
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="text-base font-bold text-white mb-1.5">No habits match this filter</h3>
              <p className="text-sm text-slate-400 mb-4">Try a different filter or add a new habit.</p>
              <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                Show All
              </Button>
            </>
          )}
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              toggling={togglingId === habit.id}
              onToggle={() => handleToggle(habit)}
              onEdit={() => setEditingHabit(habit)}
              onDelete={() => setDeleteTarget(habit)}
            />
          ))}
        </div>
      )}

      {/* ── Create Modal ─────────────────────────────────────── */}
      <Modal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create New Habit"
        description="Build a new routine to track consistently."
      >
        <HabitForm
          onSubmit={handleCreate}
          onClose={() => setShowCreate(false)}
          submitting={submitting}
        />
      </Modal>

      {/* ── Edit Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={!!editingHabit}
        onClose={() => setEditingHabit(null)}
        title="Edit Habit"
        description="Update the details for this habit."
      >
        {editingHabit && (
          <HabitForm
            initial={editingHabit}
            onSubmit={(d) => handleUpdate(d as UpdateHabitRequest)}
            onClose={() => setEditingHabit(null)}
            submitting={submitting}
          />
        )}
      </Modal>

      {/* ── Delete Confirm Modal ─────────────────────────────── */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Habit"
        description={`Are you sure you want to delete '${deleteTarget?.name}'? This will archive the habit and all its completion history.`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-rose-500/50 text-rose-400 hover:bg-rose-950/30"
              onClick={handleDelete}
              disabled={deletingId !== null}
              leftIcon={deletingId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            >
              {deletingId ? "Deleting…" : "Delete Habit"}
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-2xl">{deleteTarget.icon}</span>
            <div>
              <p className="text-sm font-semibold text-white">{deleteTarget.name}</p>
              <p className="text-xs text-slate-400">{deleteTarget.totalCompletions} total completions · {deleteTarget.currentStreak}d streak</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default HabitsPage;
