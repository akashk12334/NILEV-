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
  Calendar,
  Layers,
  Heart,
  X,
  User,
  Users,
  Infinity as InfinityIcon,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { useHabits } from "../hooks/useHabits";
import { useAuth } from "../hooks/useAuth";
import { usePartner } from "../hooks/usePartner";
import {
  Button,
  Card,
  Badge,
  ProgressBar,
  useToast,
  Modal,
  StatCard,
} from "../components/ui";
import { BulkCreateHabitsModal } from "../components/habits/BulkCreateHabitsModal";
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
  CUSTOM: "Custom",
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

function categoryBadgeVariant(cat: string) {
  const map: Record<string, string> = {
    Health: "emerald", Fitness: "emerald", Mindfulness: "violet",
    Growth: "indigo", Connection: "rose", Finance: "amber",
    Creativity: "violet", Learning: "indigo",
  };
  return (map[cat] ?? "secondary") as "violet" | "rose" | "indigo" | "secondary" | "amber" | "emerald";
}

function formatHabitDate(dateStr?: string | null) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

// ── Daily Status Badge ───────────────────────────────────────────
function DailyStatusBadge({ status }: { status?: string }) {
  switch (status) {
    case "COMPLETED":
      return (
        <Badge variant="emerald" size="sm" className="font-semibold shadow-[0_0_10px_rgba(16,185,129,0.3)]">
          <Check className="h-3 w-3 mr-1 stroke-[3]" /> Completed
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge variant="secondary" size="sm" className="bg-slate-800 text-slate-400 border-slate-700">
          <X className="h-3 w-3 mr-1" /> Expired
        </Badge>
      );
    case "NOT_STARTED":
      return (
        <Badge variant="indigo" size="sm">
          <Clock className="h-3 w-3 mr-1" /> Starts Soon
        </Badge>
      );
    case "MISSED":
      return (
        <Badge variant="amber" size="sm">
          <AlertCircle className="h-3 w-3 mr-1" /> Missed
        </Badge>
      );
    case "PENDING":
    default:
      return (
        <Badge variant="violet" size="sm" className="bg-violet-950/60 text-violet-300 border-violet-500/30">
          <span className="h-1.5 w-1.5 rounded-full bg-violet-400 mr-1.5 animate-pulse inline-block" /> Pending
        </Badge>
      );
  }
}

// ── Completion Check Button ───────────────────────────────────────
function CheckButton({
  done,
  loading,
  disabled,
  onClick,
  color,
  title,
}: {
  done: boolean;
  loading: boolean;
  disabled?: boolean;
  onClick: () => void;
  color: string;
  title?: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      title={title || (done ? "Mark incomplete" : "Mark complete")}
      aria-label={done ? "Mark incomplete" : "Mark complete"}
      className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
        done
          ? "border-transparent text-white shadow-lg"
          : "border-slate-600 bg-transparent hover:border-slate-400 text-transparent"
      } ${
        disabled
          ? "opacity-50 cursor-not-allowed border-slate-700"
          : loading
          ? "opacity-50 cursor-wait"
          : "cursor-pointer"
      }`}
      style={done ? { backgroundColor: color, boxShadow: `0 0 16px ${color}60` } : {}}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      ) : done ? (
        <Check className="h-4.5 w-4.5 stroke-[3]" />
      ) : (
        <Check className="h-4.5 w-4.5 stroke-[3] text-slate-600 group-hover:text-slate-400 transition-colors" />
      )}
      {done && !disabled && (
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-25"
          style={{ backgroundColor: color }}
        />
      )}
    </button>
  );
}

// ── Habit Card (Supports MY HABITS & PARTNER HABITS view-only) ─────
function HabitCard({
  habit,
  isPartner = false,
  partnerDisplayName,
  onToggle,
  onEdit,
  onDelete,
  toggling,
}: {
  habit: HabitResponse;
  isPartner?: boolean;
  partnerDisplayName?: string;
  onToggle?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  toggling?: boolean;
}) {
  const [showStats, setShowStats] = React.useState(false);

  const isExpired = habit.dailyStatus === "EXPIRED";
  const isNotStarted = habit.dailyStatus === "NOT_STARTED";
  const isCompleted = habit.completedToday || habit.dailyStatus === "COMPLETED";

  const startDateFormatted = formatHabitDate(habit.startDate);
  const endDateFormatted = formatHabitDate(habit.endDate);

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-300 overflow-hidden ${
        isCompleted
          ? "border-[color:var(--habit-color)]/40 bg-slate-900/60"
          : isExpired
          ? "border-slate-800/50 bg-slate-950/40 opacity-75"
          : "border-slate-800/70 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-900/60"
      }`}
      style={{ "--habit-color": habit.color } as React.CSSProperties}
    >
      {/* left accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl transition-all duration-300"
        style={{
          backgroundColor: isCompleted ? habit.color : isPartner ? "#EC4899" : "transparent",
          boxShadow: isCompleted ? `0 0 12px ${habit.color}80` : "none",
        }}
      />

      <div className="pl-4 pr-4 pt-4 pb-3">
        {/* partner banner if viewing partner habit */}
        {isPartner && (
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-pink-400 mb-2 bg-pink-950/20 px-2 py-0.5 rounded-md border border-pink-500/20 w-fit">
            <Heart className="h-2.5 w-2.5 fill-pink-400 text-pink-400" />
            <span>{habit.partnerNickname || partnerDisplayName || "Partner"}'s Habit</span>
            <span className="text-slate-500">• View Only</span>
          </div>
        )}

        {/* top row */}
        <div className="flex items-start gap-3">
          {/* check button: disabled for partner habits or expired/unstarted habits */}
          <CheckButton
            done={isCompleted}
            loading={Boolean(toggling)}
            disabled={isPartner || isExpired || isNotStarted}
            title={
              isPartner
                ? `${habit.partnerNickname || partnerDisplayName || "Partner"}'s habit (View-only)`
                : isExpired
                ? "This habit has ended and cannot be completed"
                : isNotStarted
                ? `Starts on ${startDateFormatted}`
                : undefined
            }
            onClick={onToggle || (() => {})}
            color={habit.color}
          />

          {/* icon + name */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span className="text-lg leading-none">{habit.icon}</span>
              <h3
                className={`text-sm font-bold leading-tight transition-colors ${
                  isCompleted ? "text-slate-400 line-through" : isExpired ? "text-slate-500" : "text-white"
                }`}
              >
                {habit.name}
              </h3>
              <DailyStatusBadge status={habit.dailyStatus} />
            </div>

            {habit.description && (
              <p className="text-[11px] text-slate-500 leading-snug line-clamp-1 mb-1.5">
                {habit.description}
              </p>
            )}

            {/* meta row: category, frequency, dates */}
            <div className="flex items-center gap-2 flex-wrap text-[10px] text-slate-400 mt-1">
              <Badge variant={categoryBadgeVariant(habit.category)} size="sm">
                {habit.category}
              </Badge>
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {TOD_LABELS[habit.timeOfDay]}
              </span>
              <span className="text-slate-500">
                {FREQUENCY_LABELS[habit.frequency] || habit.frequency}
              </span>
              {startDateFormatted && (
                <span className="text-slate-500 flex items-center gap-1">
                  <Calendar className="h-2.5 w-2.5 text-violet-400" />
                  {startDateFormatted}
                  {endDateFormatted ? (
                    <span>– {endDateFormatted}</span>
                  ) : (
                    <span className="inline-flex items-center gap-0.5 text-violet-400 font-medium">
                      – <InfinityIcon className="h-2.5 w-2.5 inline" /> Endless
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* streak badge */}
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1 text-xs font-bold font-mono text-amber-400">
              <Flame className="h-3.5 w-3.5 fill-amber-400" />
              <span>{habit.currentStreak || 0}d</span>
            </div>
          </div>
        </div>

        {/* progress bar */}
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
            <span>Weekly Consistency</span>
            <span className="font-mono font-medium">{(habit.weeklyCompletion || 0).toFixed(0)}%</span>
          </div>
          <ProgressBar
            value={habit.weeklyCompletion || 0}
            size="sm"
            variant={
              isCompleted
                ? "emerald"
                : (habit.weeklyCompletion || 0) > 60
                ? "violet"
                : "amber"
            }
            glow={(habit.weeklyCompletion || 0) >= 80}
          />
        </div>

        {/* expandable stats */}
        {showStats && (
          <div className="mt-3 pt-3 border-t border-slate-800/60 grid grid-cols-3 gap-2 animate-in fade-in duration-150">
            {[
              { label: "Streak", value: `${habit.currentStreak || 0}d`, sub: `Best: ${habit.longestStreak || 0}d`, color: "text-amber-400" },
              { label: "Monthly", value: `${(habit.monthlyCompletion || 0).toFixed(0)}%`, sub: "Last 30 days", color: "text-violet-400" },
              { label: "Total", value: habit.totalCompletions || 0, sub: "completions", color: "text-emerald-400" },
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

        {/* Only show Edit/Delete buttons for MY HABITS */}
        {!isPartner && onEdit && onDelete && (
          <div className="ml-auto flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={onEdit}
              className="p-1.5 rounded-lg text-slate-400 hover:text-violet-400 hover:bg-violet-950/30 transition-all"
              aria-label="Edit habit"
              title="Edit habit"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-all"
              aria-label="Delete habit"
              title="Delete habit"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Habit Form (create single & edit) ────────────────────────────
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
  const [startDate, setStartDate] = React.useState(
    initial?.startDate ?? new Date().toISOString().split("T")[0]
  );
  const [endDate, setEndDate] = React.useState(initial?.endDate ?? "");
  const [isEndless, setIsEndless] = React.useState(!initial?.endDate);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return;

    if (!isEndless && startDate && endDate && new Date(endDate) < new Date(startDate)) {
      setError("End date cannot be before start date.");
      return;
    }

    await onSubmit({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      category,
      color,
      frequency,
      timeOfDay,
      startDate: startDate || undefined,
      endDate: isEndless ? undefined : (endDate || undefined),
    });
  };

  const inputCls =
    "w-full rounded-xl border border-slate-700/80 bg-slate-900/80 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 transition-all";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
          {error}
        </div>
      )}

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
          placeholder="e.g. Exercise for 30 minutes..."
          maxLength={500}
        />
      </div>

      {/* Dates: Start Date & End Date (with Endless toggle) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className={labelCls}>Habit Duration</label>
          <div className="flex items-center gap-1 bg-slate-950/60 p-0.5 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setIsEndless(true);
                setEndDate("");
              }}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                isEndless
                  ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <InfinityIcon className="h-3 w-3" />
              <span>Endless</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEndless(false);
                if (!endDate) {
                  const base = startDate ? new Date(startDate) : new Date();
                  base.setDate(base.getDate() + 30);
                  setEndDate(base.toISOString().split("T")[0]);
                }
              }}
              className={`flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-md font-semibold transition-all ${
                !isEndless
                  ? "bg-pink-600 text-white shadow-[0_0_10px_rgba(236,72,153,0.4)]"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>Target End Date</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-violet-400" /> Start Date
              </span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={inputCls}
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3 text-pink-400" /> End Date
                </span>
              </label>
              {!isEndless && (
                <button
                  type="button"
                  onClick={() => {
                    setIsEndless(true);
                    setEndDate("");
                  }}
                  className="text-[11px] font-semibold text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-violet-950/40"
                >
                  <InfinityIcon className="h-3 w-3" />
                  <span>Make Endless</span>
                </button>
              )}
            </div>
            {isEndless ? (
              <button
                type="button"
                onClick={() => {
                  setIsEndless(false);
                  const base = startDate ? new Date(startDate) : new Date();
                  base.setDate(base.getDate() + 30);
                  setEndDate(base.toISOString().split("T")[0]);
                }}
                className="w-full flex items-center justify-between h-[42px] px-3 rounded-xl border border-dashed border-violet-500/40 bg-violet-950/20 text-violet-300 text-xs hover:border-violet-400 hover:bg-violet-950/40 transition-all text-left group"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <InfinityIcon className="h-4 w-4 text-violet-400 group-hover:scale-110 transition-transform" />
                  <span>Endless Routine (No expiration)</span>
                </span>
                <span className="text-[10px] text-slate-500 group-hover:text-violet-300 transition-colors">Set date →</span>
              </button>
            ) : (
              <input
                type="date"
                value={endDate}
                min={startDate || undefined}
                onChange={(e) => setEndDate(e.target.value)}
                className={inputCls}
              />
            )}
          </div>
        </div>
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
        <Button variant="ghost" size="sm" onClick={onClose} className="flex-1" type="button" disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          className="flex-1"
          disabled={submitting || !name.trim()}
          leftIcon={submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : undefined}
        >
          {submitting ? "Saving habit..." : initial ? "Save Changes" : "Create Habit"}
        </Button>
      </div>
    </form>
  );
}

// ── Main HabitsPage Component ─────────────────────────────────────
export const HabitsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { partnerStatus } = usePartner();
  const {
    habits,
    partnerHabits,
    loading,
    loadingPartner,
    error,
    partnerError,
    reload,
    reloadPartner,
    create,
    createBulk,
    update,
    remove,
    complete,
    uncomplete,
  } = useHabits();
  const { toast } = useToast();

  // Active section tab: "my" | "partner"
  const [activeTab, setActiveTab] = React.useState<"my" | "partner">("my");
  const [filter, setFilter] = React.useState<HabitFilter>("all");
  const [togglingId, setTogglingId] = React.useState<number | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Modals
  const [showSingleCreate, setShowSingleCreate] = React.useState(false);
  const [showBulkCreate, setShowBulkCreate] = React.useState(false);
  const [editingHabit, setEditingHabit] = React.useState<HabitResponse | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<HabitResponse | null>(null);

  const isConnected = partnerStatus?.status === "CONNECTED";
  const partner = partnerStatus?.partner;
  const partnerDisplayName = partner?.nickname?.trim() || partner?.name || "Partner";
  const userDisplayName = user?.nickname?.trim() || user?.name?.split(" ")[0] || "You";

  // Filtered habits for My Habits
  const filteredMyHabits = React.useMemo(() => {
    return habits.filter((h) => {
      switch (filter) {
        case "completed": return h.completedToday || h.dailyStatus === "COMPLETED";
        case "pending":   return !h.completedToday && h.dailyStatus === "PENDING";
        case "morning":   return h.timeOfDay === "MORNING";
        case "afternoon": return h.timeOfDay === "AFTERNOON";
        case "evening":   return h.timeOfDay === "EVENING";
        case "today":     return h.dailyStatus !== "EXPIRED" && h.dailyStatus !== "NOT_STARTED";
        default:          return true;
      }
    });
  }, [habits, filter]);

  // Filtered habits for Partner Habits
  const filteredPartnerHabits = React.useMemo(() => {
    return partnerHabits.filter((h) => {
      switch (filter) {
        case "completed": return h.completedToday || h.dailyStatus === "COMPLETED";
        case "pending":   return !h.completedToday && h.dailyStatus === "PENDING";
        case "morning":   return h.timeOfDay === "MORNING";
        case "afternoon": return h.timeOfDay === "AFTERNOON";
        case "evening":   return h.timeOfDay === "EVENING";
        case "today":     return h.dailyStatus !== "EXPIRED" && h.dailyStatus !== "NOT_STARTED";
        default:          return true;
      }
    });
  }, [partnerHabits, filter]);

  // Active counts for today
  const activeMyHabitsToday = habits.filter((h) => h.dailyStatus !== "EXPIRED" && h.dailyStatus !== "NOT_STARTED");
  const doneMyToday = activeMyHabitsToday.filter((h) => h.completedToday || h.dailyStatus === "COMPLETED").length;
  const totalMyToday = activeMyHabitsToday.length;
  const myTodayPct = totalMyToday ? Math.round((doneMyToday / totalMyToday) * 100) : 0;

  const activePartnerHabitsToday = partnerHabits.filter((h) => h.dailyStatus !== "EXPIRED" && h.dailyStatus !== "NOT_STARTED");
  const donePartnerToday = activePartnerHabitsToday.filter((h) => h.completedToday || h.dailyStatus === "COMPLETED").length;
  const totalPartnerToday = activePartnerHabitsToday.length;
  const partnerTodayPct = totalPartnerToday ? Math.round((donePartnerToday / totalPartnerToday) * 100) : 0;

  const avgStreak = habits.length
    ? Math.round(habits.reduce((s, h) => s + (h.currentStreak || 0), 0) / habits.length)
    : 0;

  // Toggle completion for own habit
  async function handleToggle(habit: HabitResponse) {
    if (habit.dailyStatus === "EXPIRED") {
      toast({ type: "error", title: "Habit Expired", description: "This habit has ended and cannot be completed." });
      return;
    }
    if (habit.dailyStatus === "NOT_STARTED") {
      toast({ type: "info", title: "Not Started Yet", description: `This habit starts on ${formatHabitDate(habit.startDate)}.` });
      return;
    }

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
          description: `Streak is now ${updated.currentStreak} day${updated.currentStreak !== 1 ? "s" : ""}. +3 XP earned! 🎉`,
        });
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ type: "error", title: "Error", description: msg ?? "Unable to update completion status." });
    } finally {
      setTogglingId(null);
    }
  }

  // Create single habit
  async function handleCreateSingle(data: CreateHabitRequest) {
    setSubmitting(true);
    try {
      const created = await create(data);
      setShowSingleCreate(false);
      toast({ type: "success", title: "Habit created! ✨", description: `'${created.name}' added to your habits.` });
    } catch {
      toast({ type: "error", title: "Error", description: "Unable to save habit." });
    } finally {
      setSubmitting(false);
    }
  }

  // Create multiple habits
  async function handleCreateBulk(dataList: CreateHabitRequest[]) {
    setSubmitting(true);
    try {
      const created = await createBulk(dataList);
      setShowBulkCreate(false);
      toast({
        type: "success",
        title: "Habits created! ✨",
        description: `Successfully added ${created.length} new habit${created.length > 1 ? "s" : ""} to your list.`,
      });
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast({ type: "error", title: "Error", description: msg ?? "Unable to create habits." });
    } finally {
      setSubmitting(false);
    }
  }

  // Update habit
  async function handleUpdate(data: UpdateHabitRequest) {
    if (!editingHabit) return;
    setSubmitting(true);
    try {
      await update(editingHabit.id, data);
      setEditingHabit(null);
      toast({ type: "success", title: "Habit updated! ✨", description: "Changes saved successfully." });
    } catch {
      toast({ type: "error", title: "Error", description: "Unable to save habit." });
    } finally {
      setSubmitting(false);
    }
  }

  // Delete habit
  async function handleDelete() {
    if (!deleteTarget) return;
    setDeletingId(deleteTarget.id);
    try {
      await remove(deleteTarget.id);
      setDeleteTarget(null);
      toast({ type: "info", title: "Habit Deleted", description: `'${deleteTarget.name}' removed from your active habits.` });
    } catch {
      toast({ type: "error", title: "Error", description: "Unable to delete habit." });
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Habits Sanctuary</span>
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {userDisplayName}'s personal & shared habit rituals · {doneMyToday}/{totalMyToday} completed today
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              reload();
              if (isConnected) reloadPartner();
            }}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>

          {/* + Add Habits (Bulk creation) button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBulkCreate(true)}
            className="border-violet-500/40 text-violet-300 hover:bg-violet-600/10"
            leftIcon={<Layers className="h-3.5 w-3.5" />}
          >
            + Add Habits
          </Button>

          {/* + Add Habit single button */}
          <Button
            variant="glow"
            size="sm"
            onClick={() => setShowSingleCreate(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            Add Habit
          </Button>
        </div>
      </div>

      {/* ── TABS: MY HABITS vs PARTNER HABITS ─────────────────────── */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => setActiveTab("my")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "my"
              ? "border-violet-500 text-white shadow-[0_4px_12px_rgba(139,92,246,0.25)]"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700"
          }`}
        >
          <User className="h-4 w-4 text-violet-400" />
          <span>MY HABITS</span>
          <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-slate-800 text-violet-300 font-mono">
            {habits.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("partner")}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeTab === "partner"
              ? "border-pink-500 text-white shadow-[0_4px_12px_rgba(236,72,153,0.25)]"
              : "border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-700"
          }`}
        >
          <Heart className="h-4 w-4 text-pink-400" />
          <span>PARTNER HABITS</span>
          {isConnected && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-xs bg-pink-950/40 border border-pink-500/30 text-pink-300 font-mono">
              {partnerHabits.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Overview Summary Cards ─────────────────────────────────── */}
      {activeTab === "my" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Progress"
            value={`${myTodayPct}%`}
            subtitle={`${doneMyToday} of ${totalMyToday} active done`}
            icon={<Check className="h-5 w-5" />}
            accentColor="violet"
            progress={myTodayPct}
            trend={{ value: doneMyToday > 0 ? `${doneMyToday} completed` : "Pending", direction: doneMyToday > 0 ? "up" : "neutral" }}
          />
          <StatCard
            title="Total Habits"
            value={String(habits.length)}
            subtitle={`${activeMyHabitsToday.length} active today`}
            icon={<Sparkles className="h-5 w-5" />}
            accentColor="indigo"
            progress={100}
            trend={{ value: "Active", direction: "neutral" }}
          />
          <StatCard
            title="Avg. Streak"
            value={`${avgStreak}d`}
            subtitle="Across your habits"
            icon={<Flame className="h-5 w-5" />}
            accentColor="amber"
            progress={Math.min(avgStreak * 10, 100)}
            trend={{ value: avgStreak > 0 ? `${avgStreak} days` : "Start today!", direction: "up" }}
          />
          <StatCard
            title="Partner Sync"
            value={isConnected ? `${donePartnerToday}/${totalPartnerToday}` : "Not linked"}
            subtitle={isConnected ? `${partnerDisplayName}'s habits done` : "Link your partner"}
            icon={<Users className="h-5 w-5" />}
            accentColor="pink"
            progress={partnerTodayPct}
            trend={{ value: isConnected ? `${partnerTodayPct}% complete` : "Solo", direction: "neutral" }}
          />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title={`${partnerDisplayName}'s Today`}
            value={`${partnerTodayPct}%`}
            subtitle={`${donePartnerToday} of ${totalPartnerToday} habits done`}
            icon={<Heart className="h-5 w-5 text-pink-400" />}
            accentColor="pink"
            progress={partnerTodayPct}
            trend={{ value: `${donePartnerToday} done`, direction: donePartnerToday > 0 ? "up" : "neutral" }}
          />
          <StatCard
            title="Partner Habits"
            value={String(partnerHabits.length)}
            subtitle="View-only partner routines"
            icon={<Sparkles className="h-5 w-5" />}
            accentColor="indigo"
            progress={100}
            trend={{ value: "Live Sync", direction: "neutral" }}
          />
          <StatCard
            title="Shared Today"
            value={`${doneMyToday + donePartnerToday} / ${totalMyToday + totalPartnerToday}`}
            subtitle="Combined couple completion"
            icon={<Users className="h-5 w-5 text-violet-400" />}
            accentColor="violet"
            progress={
              totalMyToday + totalPartnerToday > 0
                ? Math.round(((doneMyToday + donePartnerToday) / (totalMyToday + totalPartnerToday)) * 100)
                : 0
            }
            trend={{ value: "Together", direction: "up" }}
          />
        </div>
      )}

      {/* ── Filter Bar ────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex-wrap">
        {FILTERS.map((f) => {
          const targetList = activeTab === "my" ? habits : partnerHabits;
          const count =
            f.id === "all" ? targetList.length
            : f.id === "completed" ? targetList.filter((h) => h.completedToday || h.dailyStatus === "COMPLETED").length
            : f.id === "pending" ? targetList.filter((h) => !h.completedToday && h.dailyStatus === "PENDING").length
            : f.id === "morning" ? targetList.filter((h) => h.timeOfDay === "MORNING").length
            : f.id === "afternoon" ? targetList.filter((h) => h.timeOfDay === "AFTERNOON").length
            : f.id === "evening" ? targetList.filter((h) => h.timeOfDay === "EVENING").length
            : targetList.filter((h) => h.dailyStatus !== "EXPIRED" && h.dailyStatus !== "NOT_STARTED").length;

          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all shrink-0 ${
                filter === f.id
                  ? activeTab === "my"
                    ? "bg-violet-600 border-violet-500 text-white shadow-[0_0_12px_rgba(139,92,246,0.35)]"
                    : "bg-pink-600 border-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.35)]"
                  : "border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-300"
              }`}
            >
              {f.label}
              <span className="text-[10px] font-mono opacity-80">{count}</span>
            </button>
          );
        })}
      </div>

      {/* ── TAB CONTENT: MY HABITS ─────────────────────────────────── */}
      {activeTab === "my" && (
        <>
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="p-5 space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-800 animate-pulse" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-32 rounded bg-slate-800 animate-pulse" />
                        <div className="h-3 w-20 rounded bg-slate-800/60 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />
                  </div>
                </Card>
              ))}
            </div>
          ) : error ? (
            <Card className="p-8 text-center border-rose-500/20">
              <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" />
              <p className="text-sm text-rose-300 mb-3">{error || "Unable to load habits."}</p>
              <Button variant="outline" size="sm" onClick={reload} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Try Again
              </Button>
            </Card>
          ) : filteredMyHabits.length === 0 ? (
            <Card className="p-12 text-center">
              {habits.length === 0 ? (
                <>
                  <div className="text-5xl mb-4">⭐</div>
                  <h3 className="text-lg font-bold text-white mb-2">No habits yet</h3>
                  <p className="text-sm text-slate-400 mb-5 max-w-sm mx-auto">
                    Create your first habit and start growing together.
                  </p>
                  <div className="flex items-center justify-center gap-3">
                    <Button variant="glow" onClick={() => setShowSingleCreate(true)} leftIcon={<Plus className="h-4 w-4" />}>
                      Create Habit
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowBulkCreate(true)}
                      className="border-violet-500/30 text-violet-300"
                      leftIcon={<Layers className="h-4 w-4" />}
                    >
                      + Add Multiple Habits
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-base font-bold text-white mb-1.5">No habits match this filter</h3>
                  <p className="text-sm text-slate-400 mb-4">Try another filter or add a new routine.</p>
                  <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                    Show All
                  </Button>
                </>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredMyHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isPartner={false}
                  toggling={togglingId === habit.id}
                  onToggle={() => handleToggle(habit)}
                  onEdit={() => setEditingHabit(habit)}
                  onDelete={() => setDeleteTarget(habit)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── TAB CONTENT: PARTNER HABITS (VIEW-ONLY) ────────────────── */}
      {activeTab === "partner" && (
        <>
          {!isConnected ? (
            <Card className="p-10 text-center border-dashed border-pink-500/30 bg-pink-950/10">
              <Heart className="h-10 w-10 text-pink-400 mx-auto mb-3 animate-pulse" />
              <h3 className="text-base font-bold text-white mb-1.5">Partner Not Connected</h3>
              <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
                Connect with your partner to see their habits and track your mutual progress together.
              </p>
              <Button
                variant="glow"
                size="sm"
                className="bg-gradient-to-r from-pink-600 to-rose-600 text-white"
                onClick={() => navigate(ROUTES.PARTNER)}
              >
                Go to Partner Space
              </Button>
            </Card>
          ) : loadingPartner ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2].map((i) => (
                <Card key={i} className="p-5 space-y-4">
                  <div className="h-8 w-32 rounded bg-slate-800 animate-pulse" />
                  <div className="h-4 w-48 rounded bg-slate-800/60 animate-pulse" />
                </Card>
              ))}
            </div>
          ) : partnerError ? (
            <Card className="p-8 text-center border-rose-500/20">
              <AlertCircle className="h-8 w-8 text-rose-400 mx-auto mb-3" />
              <p className="text-sm text-rose-300 mb-3">{partnerError}</p>
              <Button variant="outline" size="sm" onClick={reloadPartner} leftIcon={<RefreshCw className="h-3.5 w-3.5" />}>
                Try Again
              </Button>
            </Card>
          ) : filteredPartnerHabits.length === 0 ? (
            <Card className="p-10 text-center">
              {partnerHabits.length === 0 ? (
                <>
                  <div className="text-4xl mb-3">🌱</div>
                  <h3 className="text-base font-bold text-white mb-1.5">
                    Your partner hasn't added any habits yet.
                  </h3>
                  <p className="text-sm text-slate-400 max-w-sm mx-auto">
                    When {partnerDisplayName} creates and tracks their daily rituals, they will appear here in real-time.
                  </p>
                </>
              ) : (
                <>
                  <div className="text-4xl mb-3">🔍</div>
                  <h3 className="text-base font-bold text-white mb-1.5">No partner habits match this filter</h3>
                  <p className="text-sm text-slate-400 mb-4">Try clearing the filter to see all partner habits.</p>
                  <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                    Show All
                  </Button>
                </>
              )}
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredPartnerHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  isPartner={true}
                  partnerDisplayName={partnerDisplayName}
                />
              ))}
            </div>
          )}
        </>
      )}

      {/* ── Single Create Modal ───────────────────────────────────── */}
      <Modal
        isOpen={showSingleCreate}
        onClose={() => setShowSingleCreate(false)}
        title="Create Habit"
        description="Build a new routine to track consistently."
      >
        <HabitForm
          onSubmit={handleCreateSingle}
          onClose={() => setShowSingleCreate(false)}
          submitting={submitting}
        />
      </Modal>

      {/* ── Bulk Create Modal (+ Add Habits) ───────────────────────── */}
      <BulkCreateHabitsModal
        isOpen={showBulkCreate}
        onClose={() => setShowBulkCreate(false)}
        onSubmit={handleCreateBulk}
        submitting={submitting}
      />

      {/* ── Edit Modal ────────────────────────────────────────────── */}
      <Modal
        isOpen={Boolean(editingHabit)}
        onClose={() => setEditingHabit(null)}
        title="Edit Habit"
        description="Update your habit details. Ownership cannot be changed."
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

      {/* ── Delete Confirmation Modal ─────────────────────────────── */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Habit?"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This will remove the habit from your active habit list.`}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)} disabled={deletingId !== null}>
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-rose-500/50 text-rose-400 hover:bg-rose-950/40"
              onClick={handleDelete}
              disabled={deletingId !== null}
              leftIcon={deletingId ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
            >
              {deletingId ? "Deleting habit..." : "Delete Habit"}
            </Button>
          </>
        }
      >
        {deleteTarget && (
          <div className="flex items-center gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800">
            <span className="text-2xl">{deleteTarget.icon}</span>
            <div>
              <p className="text-sm font-semibold text-white">{deleteTarget.name}</p>
              <p className="text-xs text-slate-400">
                {deleteTarget.totalCompletions || 0} total completions · {deleteTarget.currentStreak || 0}d streak
              </p>
            </div>
          </div>
        )}
      </Modal>

    </div>
  );
};

export default HabitsPage;
