import * as React from "react";
import {
  Flame,
  Target,
  CheckCircle2,
  Heart,
  Clock,
  Zap,
  Plus,
  ChevronRight,
  Smile,
  Check,
  MoreHorizontal,
  Calendar,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { useAuth } from "../hooks/useAuth";
import {
  Button,
  Card,
  Badge,
  ProgressBar,
  ProgressRing,
  StatCard,
  useToast,
  Tooltip,
} from "../components/ui";

/* ─── helpers ─────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/* ─── static demo data ─────────────────────────────────────────── */
const HABITS = [
  { id: 1, name: "Morning Sun & Walk", category: "Health", time: "7:30 AM", streak: 12, done: true, partnerDone: true },
  { id: 2, name: "Evening Gratitude Exchange", category: "Connection", time: "9:00 PM", streak: 9, done: false, partnerDone: false },
  { id: 3, name: "Read 20 Pages Together", category: "Growth", time: "Anytime", streak: 5, done: false, partnerDone: true },
  { id: 4, name: "Deep Work Session (2 hr)", category: "Personal", time: "10:00 AM", streak: 4, done: true, partnerDone: null },
  { id: 5, name: "Drink 2L Water", category: "Health", time: "All day", streak: 21, done: true, partnerDone: true },
];

const GOALS = [
  { id: 1, title: "Japan Autumn Tour 2026", icon: "✈️", color: "violet", progress: 80, detail: "$6,400 / $8,000" },
  { id: 2, title: "50 Shared Home Recipes", icon: "🍳", color: "rose", progress: 64, detail: "32 / 50 done" },
  { id: 3, title: "Emergency Nest-Egg", icon: "💰", color: "emerald", progress: 100, detail: "Completed!" },
  { id: 4, title: "Learn Spanish Together", icon: "🌎", color: "amber", progress: 38, detail: "Level A2 in progress" },
];

const PARTNER_ACTIVITY = [
  { id: 1, text: "Maya completed Morning Sun & Walk", time: "2 min ago", icon: "☀️", type: "habit" },
  { id: 2, text: "Maya reached a 10-day streak on Gratitude Exchange", time: "1 hr ago", icon: "🔥", type: "streak" },
  { id: 3, text: "Maya completed Read 20 Pages Together", time: "3 hrs ago", icon: "📖", type: "habit" },
  { id: 4, text: "Maya unlocked 'Consistency Queen' achievement", time: "Yesterday", icon: "🏆", type: "achievement" },
  { id: 5, text: "Maya updated Japan Trip goal to 80%", time: "Yesterday", icon: "✈️", type: "goal" },
];

const RECENT_ACTIVITY = [
  { id: 1, who: "You", text: "completed Deep Work Session (2 hr)", time: "Just now", avatar: "A", color: "violet" },
  { id: 2, who: "Maya", text: "completed Morning Sun & Walk", time: "2 min ago", avatar: "M", color: "pink" },
  { id: 3, who: "You", text: "completed Drink 2L Water", time: "8 min ago", avatar: "A", color: "violet" },
  { id: 4, who: "Maya", text: "reached a 10-day streak 🔥", time: "1 hr ago", avatar: "M", color: "pink" },
  { id: 5, who: "You", text: "unlocked 'Early Bird' badge 🌅", time: "2 hrs ago", avatar: "A", color: "violet" },
];

const REACTIONS = ["❤️", "🔥", "👏", "✨"];

const CATEGORY_COLORS: Record<string, string> = {
  Health: "emerald",
  Connection: "pink",
  Growth: "violet",
  Personal: "amber",
};

/* ─── sub-components ───────────────────────────────────────────── */

function SectionHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-0.5">{title}</h2>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function CompanionCard({
  isPartner,
  name,
  animal,
  emoji,
  level,
  xp,
  mood,
  happiness,
  reaction,
}: {
  isPartner?: boolean;
  name: string;
  animal: string;
  emoji: string;
  level: number;
  xp: number;
  mood: string;
  happiness: number;
  reaction: string;
}) {
  return (
    <Card
      glow={!isPartner}
      className={`p-5 flex flex-col items-center text-center relative overflow-hidden ${
        isPartner ? "border-pink-500/20" : "border-violet-500/25"
      }`}
    >
      {/* label */}
      <div className="flex items-center justify-between w-full mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {isPartner ? "Maya's Companion" : "Your Companion"}
        </span>
        <Badge variant={isPartner ? "rose" : "violet"} size="sm">
          Lv. {level}
        </Badge>
      </div>

      {/* ring */}
      <ProgressRing
        value={xp}
        size={110}
        strokeWidth={8}
        startColor={isPartner ? "#ec4899" : "#a855f7"}
        endColor={isPartner ? "#f97316" : "#6366f1"}
      >
        <div className="flex flex-col items-center">
          <span className="text-4xl leading-none mb-1" role="img" aria-label={animal}>
            {emoji}
          </span>
          <span className="text-[9px] font-mono text-slate-400">{xp}% XP</span>
        </div>
      </ProgressRing>

      <h3 className="mt-3 text-base font-bold text-white tracking-tight">{name}</h3>
      <p className="text-[11px] text-slate-400 mt-0.5">{animal}</p>

      {/* stats grid */}
      <div className="w-full mt-4 grid grid-cols-2 gap-2 text-left">
        <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">Mood</span>
          <span className="text-xs font-bold text-emerald-400">{mood}</span>
        </div>
        <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">Happiness</span>
          <span className="text-xs font-bold text-amber-400">{happiness}%</span>
        </div>
      </div>

      {/* recent reaction */}
      <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
        <Smile className="h-3.5 w-3.5 text-violet-400" />
        <span>Recent: <span className="text-white">{reaction}</span></span>
      </div>
    </Card>
  );
}

function HabitRow({
  habit,
  checked,
  onToggle,
}: {
  habit: (typeof HABITS)[0];
  checked: boolean;
  onToggle: () => void;
}) {
  const catColor = CATEGORY_COLORS[habit.category] ?? "violet";
  const partnerLabel =
    habit.partnerDone === null
      ? "Personal"
      : habit.partnerDone
      ? "Maya ✓"
      : "Maya pending";

  return (
    <div
      className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-200 ${
        checked
          ? "bg-violet-950/20 border-violet-500/30"
          : "bg-slate-900/40 border-slate-800/60 hover:border-violet-500/25 hover:bg-slate-900/60"
      }`}
    >
      {/* checkbox */}
      <button
        onClick={onToggle}
        aria-label={`Toggle ${habit.name}`}
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
          checked
            ? "bg-gradient-to-tr from-violet-600 to-indigo-600 border-violet-400 text-white shadow-[0_0_10px_rgba(139,92,246,0.45)]"
            : "border-slate-700 bg-slate-900/60 hover:border-violet-500"
        }`}
      >
        <Check className={`h-3.5 w-3.5 stroke-[3] ${checked ? "text-white" : "text-transparent"}`} />
      </button>

      {/* text */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-tight ${checked ? "text-slate-400 line-through" : "text-white"}`}>
          {habit.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-[10px] text-slate-500 flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {habit.time}
          </span>
          <span className="text-[10px] text-slate-600">•</span>
          <span
            className={`text-[10px] font-medium ${
              habit.partnerDone ? "text-emerald-400" : habit.partnerDone === null ? "text-slate-500" : "text-amber-400"
            }`}
          >
            {partnerLabel}
          </span>
        </div>
      </div>

      {/* right badges */}
      <div className="flex items-center gap-2 shrink-0">
        <Badge variant={catColor as "violet" | "rose" | "indigo" | "secondary" | "amber" | "emerald"} size="sm">
          {habit.category}
        </Badge>
        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400 font-mono">
          <Flame className="h-3.5 w-3.5 fill-amber-400" />
          {habit.streak}d
        </span>
      </div>
    </div>
  );
}

function PartnerActivityItem({
  item,
  reactions,
  onReact,
}: {
  item: (typeof PARTNER_ACTIVITY)[0];
  reactions: string[];
  onReact: (emoji: string) => void;
}) {
  const [showReactions, setShowReactions] = React.useState(false);

  return (
    <div className="flex gap-3 group">
      {/* timeline dot */}
      <div className="flex flex-col items-center pt-0.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-sm">
          {item.icon}
        </div>
        <div className="flex-1 w-px bg-slate-800/60 mt-1.5 mb-0" />
      </div>

      <div className="flex-1 pb-4">
        <p className="text-xs text-slate-300 leading-relaxed">{item.text}</p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-[10px] text-slate-500">{item.time}</span>

          {/* reaction chips */}
          {reactions.length > 0 && (
            <div className="flex gap-1">
              {reactions.map((r) => (
                <span key={r} className="text-sm leading-none">{r}</span>
              ))}
            </div>
          )}

          {/* react button */}
          <div className="relative">
            <button
              onClick={() => setShowReactions((v) => !v)}
              className="text-[10px] text-slate-500 hover:text-violet-400 transition-colors opacity-0 group-hover:opacity-100 flex items-center gap-0.5"
            >
              <Smile className="h-3 w-3" /> React
            </button>
            {showReactions && (
              <div className="absolute left-0 bottom-6 bg-slate-800 border border-slate-700 rounded-xl p-1.5 flex gap-1.5 shadow-xl z-10 animate-in fade-in slide-in-from-bottom-2 duration-150">
                {REACTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => {
                      onReact(emoji);
                      setShowReactions(false);
                    }}
                    className="text-base hover:scale-125 transition-transform leading-none"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── main page ─────────────────────────────────────────────────── */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const firstName = (user?.name ?? "Alex").split(" ")[0];
  const [checkedIds, setCheckedIds] = React.useState<Set<number>>(new Set([1, 4, 5]));
  const [reactions, setReactions] = React.useState<Record<number, string[]>>({});

  const completedToday = checkedIds.size;
  const totalHabits = HABITS.length;
  const todayPct = Math.round((completedToday / totalHabits) * 100);

  function toggleHabit(id: number, name: string) {
    setCheckedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast({ type: "info", title: "Habit unmarked", description: `'${name}' removed from today.` });
      } else {
        next.add(id);
        toast({ type: "success", title: "Habit done! 🌟", description: `+15 XP and companion affinity for '${name}'.` });
      }
      return next;
    });
  }

  function addReaction(activityId: number, emoji: string) {
    setReactions((prev) => ({ ...prev, [activityId]: [...(prev[activityId] ?? []), emoji] }));
    toast({ type: "info", title: `Reacted with ${emoji}`, description: "Maya will see your reaction!" });
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-8">

      {/* ── GREETING ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#1a1438]/90 via-[#0f1429]/85 to-[#0d1122]/80 p-7 shadow-xl shadow-black/50 backdrop-blur-2xl">
        {/* ambient glows */}
        <div className="pointer-events-none absolute -top-16 -right-16 h-72 w-72 rounded-full bg-violet-600/12 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-56 w-56 rounded-full bg-pink-600/8 blur-3xl" />

        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="text-2xl">👋</span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {getGreeting()}, {firstName}
              </h1>
            </div>
            <p className="text-sm text-slate-400 mt-1 mb-2">
              Here's how you and your partner are doing today.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate()}</span>
              <span className="text-slate-700">•</span>
              <span className="text-pink-400 font-medium flex items-center gap-1">
                <Heart className="h-3 w-3 fill-pink-400 text-pink-400" /> Day 142 together
              </span>
            </div>
          </div>

          {/* Duo avatars */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex -space-x-3">
              <Tooltip content={`${firstName} (You)`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-base border-2 border-[#0f1429] shadow-lg shadow-violet-900/40 cursor-default">
                  {firstName[0]}
                </div>
              </Tooltip>
              <Tooltip content="Maya (Partner)">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold text-base border-2 border-[#0f1429] shadow-lg cursor-default">
                  M
                </div>
              </Tooltip>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{firstName} & Maya</p>
              <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                Both online
              </p>
            </div>
          </div>
        </div>

        {/* today overview strip */}
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Today's Progress", value: `${completedToday}/${totalHabits}`, sub: `${todayPct}% complete`, color: "text-violet-400", icon: <CheckCircle2 className="h-4 w-4" /> },
            { label: "Current Streak", value: "14 days", sub: "Best: 28 days", color: "text-amber-400", icon: <Flame className="h-4 w-4" /> },
            { label: "Total XP", value: "2,840 XP", sub: "+120 today", color: "text-emerald-400", icon: <Zap className="h-4 w-4" /> },
            { label: "Goals", value: "3 / 4", sub: "75% complete", color: "text-pink-400", icon: <Target className="h-4 w-4" /> },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-2.5 bg-slate-900/50 rounded-xl p-3 border border-slate-800/80">
              <div className={`${s.color} opacity-80`}>{s.icon}</div>
              <div>
                <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── YOUR STATS (4 StatCards) ──────────────────────────── */}
      <div>
        <SectionHeader title="Your Stats" subtitle="Personal metrics for today" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Today's Progress"
            value={`${todayPct}%`}
            subtitle={`${completedToday} of ${totalHabits} habits done`}
            icon={<CheckCircle2 className="h-5 w-5" />}
            accentColor="violet"
            progress={todayPct}
            trend={{ value: "+2 vs yesterday", direction: "up" }}
          />
          <StatCard
            title="Current Streak"
            value="14 Days"
            subtitle="All-time best: 28 days"
            icon={<Flame className="h-5 w-5" />}
            accentColor="amber"
            progress={50}
            trend={{ value: "+1 day", direction: "up" }}
          />
          <StatCard
            title="Total XP"
            value="2,840"
            subtitle="+120 XP earned today"
            icon={<Zap className="h-5 w-5" />}
            accentColor="emerald"
            progress={68}
            trend={{ value: "+15%", direction: "up" }}
          />
          <StatCard
            title="Goals Progress"
            value="75%"
            subtitle="3 of 4 goals on track"
            icon={<Target className="h-5 w-5" />}
            accentColor="pink"
            progress={75}
            glow
            trend={{ value: "+8%", direction: "up" }}
          />
        </div>
      </div>

      {/* ── PARTNER COMPARISON ────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Progress Comparison"
          subtitle="Side by side with your partner"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.PARTNER)} rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
              Partner Space
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {/* YOUR PROGRESS */}
          <Card className="p-5 border-violet-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm">
                  {firstName[0]}
                </div>
                <div>
                  <p className="text-sm font-bold text-white">{firstName}</p>
                  <p className="text-[10px] text-slate-500">Your Progress</p>
                </div>
              </div>
              <Badge variant="violet" size="sm" withDot>You</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Today's Completion</span>
                  <span className="font-bold text-violet-400">{todayPct}%</span>
                </div>
                <ProgressBar value={todayPct} variant="violet" glow size="sm" />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: "Habits", value: `${completedToday}/${totalHabits}`, color: "text-violet-400" },
                  { label: "Streak", value: "14d", color: "text-amber-400" },
                  { label: "XP", value: "2,840", color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800/60">
                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* PARTNER'S PROGRESS */}
          <Card className="p-5 border-pink-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                  M
                </div>
                <div>
                  <p className="text-sm font-bold text-white">Maya</p>
                  <p className="text-[10px] text-slate-500">Partner Progress</p>
                </div>
              </div>
              <Badge variant="rose" size="sm" withDot>Partner</Badge>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Today's Completion</span>
                  <span className="font-bold text-pink-400">80%</span>
                </div>
                <ProgressBar value={80} variant="rose" size="sm" />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                {[
                  { label: "Habits", value: "4/5", color: "text-pink-400" },
                  { label: "Streak", value: "10d", color: "text-amber-400" },
                  { label: "XP", value: "2,610", color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800/60">
                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* ── COMPANIONS ────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Companion Sanctuaries"
          subtitle="Your virtual companions powered by your consistency"
          action={
            <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.COMPANION)} rightIcon={<ChevronRight className="h-3.5 w-3.5" />}>
              View All
            </Button>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <CompanionCard
            name="Nova"
            animal="Celestial Fox · Starlight Sprout"
            emoji="🦊"
            level={4}
            xp={78}
            mood="Radiant ✨"
            happiness={94}
            reaction="Purred and glowed softly 🌟"
          />
          <CompanionCard
            isPartner
            name="Luna"
            animal="Moon Rabbit · Crescent Bloom"
            emoji="🐰"
            level={3}
            xp={62}
            mood="Cheerful 🌙"
            happiness={88}
            reaction="Did a happy moonhop 🌙"
          />
        </div>
      </div>

      {/* ── HABITS & PARTNER ACTIVITY (2-col on desktop) ─────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* TODAY'S HABITS (3/5) */}
        <div className="lg:col-span-3">
          <SectionHeader
            title="Today's Habits"
            subtitle={`${completedToday} of ${totalHabits} complete`}
            action={
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => toast({ type: "info", title: "Coming soon", description: "Habit creation is part of the next phase!" })}
              >
                Add Habit
              </Button>
            }
          />
          <Card className="p-5">
            {/* progress strip */}
            <div className="mb-4">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-slate-400">Daily completion</span>
                <span className="font-bold text-violet-400">{todayPct}%</span>
              </div>
              <ProgressBar value={todayPct} variant="violet" glow size="sm" />
            </div>

            <div className="space-y-2">
              {HABITS.map((h) => (
                <HabitRow
                  key={h.id}
                  habit={h}
                  checked={checkedIds.has(h.id)}
                  onToggle={() => toggleHabit(h.id, h.name)}
                />
              ))}
            </div>
          </Card>
        </div>

        {/* PARTNER ACTIVITY (2/5) */}
        <div className="lg:col-span-2">
          <SectionHeader title="Partner Activity" subtitle="What Maya did recently" />
          <Card className="p-5 h-full">
            <div>
              {PARTNER_ACTIVITY.map((item) => (
                <PartnerActivityItem
                  key={item.id}
                  item={item}
                  reactions={reactions[item.id] ?? []}
                  onReact={(emoji) => addReaction(item.id, emoji)}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-1"
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
              onClick={() => navigate(ROUTES.PARTNER)}
            >
              View Full Timeline
            </Button>
          </Card>
        </div>
      </div>

      {/* ── GOALS & RECENT ACTIVITY (2-col on desktop) ──────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* GOALS */}
        <div>
          <SectionHeader
            title="Active Goals"
            subtitle="Long-term goals you're tracking together"
            action={
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />} onClick={() => navigate(ROUTES.GOALS)}>
                All Goals
              </Button>
            }
          />
          <Card className="p-5 space-y-4">
            {GOALS.map((g) => (
              <div key={g.id}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <span>{g.icon}</span>
                    {g.title}
                  </span>
                  <span
                    className={`text-xs font-bold font-mono ${
                      g.color === "violet"
                        ? "text-violet-400"
                        : g.color === "rose"
                        ? "text-pink-400"
                        : g.color === "emerald"
                        ? "text-emerald-400"
                        : "text-amber-400"
                    }`}
                  >
                    {g.progress}%
                  </span>
                </div>
                <ProgressBar
                  value={g.progress}
                  variant={g.color as "violet" | "rose" | "emerald" | "amber"}
                  size="sm"
                  glow={g.progress === 100}
                />
                <p className="text-[10px] text-slate-500 mt-1">{g.detail}</p>
              </div>
            ))}

            <Button
              variant="outline"
              size="sm"
              className="w-full mt-2"
              leftIcon={<Plus className="h-3.5 w-3.5" />}
              onClick={() => toast({ type: "info", title: "Coming soon", description: "Goal creation is part of the next phase!" })}
            >
              Add New Goal
            </Button>
          </Card>
        </div>

        {/* RECENT ACTIVITY */}
        <div>
          <SectionHeader
            title="Recent Activity"
            subtitle="Combined timeline of both partners"
            action={
              <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />} onClick={() => navigate(ROUTES.ACTIVITY)}>
                Full Log
              </Button>
            }
          />
          <Card className="p-5">
            <div className="space-y-1">
              {RECENT_ACTIVITY.map((a, idx) => (
                <div key={a.id} className="flex gap-3 group">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white border-2 border-[#0f1429] ${
                        a.color === "violet"
                          ? "bg-gradient-to-br from-violet-600 to-indigo-600"
                          : "bg-gradient-to-br from-pink-500 to-rose-500"
                      }`}
                    >
                      {a.avatar}
                    </div>
                    {idx < RECENT_ACTIVITY.length - 1 && (
                      <div className="flex-1 w-px bg-slate-800/60 mt-1 mb-0" />
                    )}
                  </div>

                  <div className="pb-3 flex-1">
                    <p className="text-xs text-slate-300 leading-snug">
                      <span className={`font-semibold ${a.color === "violet" ? "text-violet-300" : "text-pink-300"}`}>{a.who}</span>{" "}
                      {a.text}
                    </p>
                    <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {a.time}
                    </p>
                  </div>

                  <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-slate-600 hover:text-slate-400">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* live indicator */}
            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-center gap-2 text-[10px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live sync active · updates every 30s
            </div>
          </Card>
        </div>
      </div>

    </div>
  );
};

export default DashboardPage;
