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
  Calendar,
  Sparkles,
  Lock,
  UserPlus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constants";
import { useAuth } from "../hooks/useAuth";
import { usePartner } from "../hooks/usePartner";
import { useHabits } from "../hooks/useHabits";
import { companionService } from "../services/companion.service";
import { goalService } from "../services/goal.service";
import type { CompanionResponse, GoalResponse, AnimalType } from "../types";
import { ChooseCompanionModal } from "../components/companion/ChooseCompanionModal";
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

function calculateDaysTogether(connectedAt?: string | null): number {
  if (!connectedAt) return 1;
  const start = new Date(connectedAt).getTime();
  const now = Date.now();
  const diff = Math.floor((now - start) / (1000 * 60 * 60 * 24));
  return Math.max(1, diff);
}

const CATEGORY_COLORS: Record<string, "emerald" | "rose" | "violet" | "amber"> = {
  Health: "emerald",
  HEALTH: "emerald",
  Connection: "rose",
  CONNECTION: "rose",
  Growth: "violet",
  GROWTH: "violet",
  Personal: "amber",
  PERSONAL: "amber",
};

/* ─── Section Header ───────────────────────────────────────────── */
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

/* ─── main page ─────────────────────────────────────────────────── */
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { partnerStatus, activities } = usePartner();
  const { habits, complete, uncomplete } = useHabits();
  const { toast } = useToast();

  const [goals, setGoals] = React.useState<GoalResponse[]>([]);
  const [myCompanion, setMyCompanion] = React.useState<CompanionResponse | null>(null);
  const [partnerCompanion, setPartnerCompanion] = React.useState<CompanionResponse | null>(null);
  const [isChooseModalOpen, setIsChooseModalOpen] = React.useState(false);
  const [hasChosenCompanion, setHasChosenCompanion] = React.useState<boolean>(() => {
    if (!user?.id) return true;
    return localStorage.getItem(`nilev_has_chosen_companion_${user.id}`) === "true";
  });

  // Prompt new users to choose their companion character
  React.useEffect(() => {
    if (user?.id) {
      const isChosen = localStorage.getItem(`nilev_has_chosen_companion_${user.id}`) === "true";
      setHasChosenCompanion(isChosen);
      if (!isChosen) {
        const timer = setTimeout(() => setIsChooseModalOpen(true), 800);
        return () => clearTimeout(timer);
      }
    }
  }, [user?.id]);

  const handleSaveCompanion = async (animalType: AnimalType, name: string) => {
    const updated = await companionService.chooseCompanion({ animalType, name });
    setMyCompanion(updated);
    if (user?.id) {
      localStorage.setItem(`nilev_has_chosen_companion_${user.id}`, "true");
      setHasChosenCompanion(true);
    }
    toast({
      type: "success",
      title: "Companion Bonded! 🌟",
      description: `You are now bonded with ${updated.name} the ${animalType === "RABBIT" ? "Bunny" : animalType}!`,
    });
  };

  const isConnected = partnerStatus?.status === "CONNECTED";
  const partner = partnerStatus?.partner;
  const firstName = user?.nickname?.trim() || (user?.name || "Friend").split(" ")[0];
  const partnerName = partner?.nickname?.trim() || (partner ? partner.name.split(" ")[0] : "Partner");

  // Load goals & companions dynamically
  React.useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const goalsData = await goalService.getAll();
        if (isMounted) setGoals(goalsData || []);
      } catch {
        // Non-critical if goals fail to load
      }

      try {
        const companionData = await companionService.getMyCompanion();
        if (isMounted) setMyCompanion(companionData);
      } catch {
        // Companion might not be initialized yet
      }

      if (isConnected) {
        try {
          const partnerCompData = await companionService.getPartnerCompanion();
          if (isMounted) setPartnerCompanion(partnerCompData);
        } catch {
          // Non-critical
        }
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, [isConnected]);

  // Derived habit calculations from REAL habits
  const completedToday = habits.filter((h) => h.completedToday).length;
  const totalHabits = habits.length;
  const todayPct = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
  const currentStreak = habits.length > 0 ? Math.max(...habits.map((h) => h.currentStreak || 0), 0) : 0;
  const totalXp = myCompanion?.xp || (completedToday * 15);
  const goalsCompleted = goals.filter((g) => g.status === "COMPLETED").length;
  const daysTogether = calculateDaysTogether(partnerStatus?.connectedAt);

  async function handleToggleHabit(habitId: number, name: string, isCompleted: boolean) {
    try {
      if (isCompleted) {
        await uncomplete(habitId);
        toast({ type: "info", title: "Habit unmarked", description: `'${name}' uncompleted for today.` });
      } else {
        await complete(habitId);
        toast({ type: "success", title: "Habit done! 🌟", description: `+3 XP earned for '${name}'. Keep the streak alive!` });
      }
    } catch {
      toast({ type: "error", title: "Update failed", description: "Could not update habit. Please try again." });
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300 pb-8">

      {/* ── GREETING HERO ──────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-[#1a1438]/90 via-[#0f1429]/85 to-[#0d1122]/80 p-7 shadow-xl shadow-black/50 backdrop-blur-2xl">
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
              {isConnected
                ? `Here's how you and ${partnerName} are tracking today.`
                : "Welcome to your sanctuary. Build healthy habits, unlock companion growth, and link with your partner."}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate()}</span>
              {isConnected ? (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="text-pink-400 font-medium flex items-center gap-1">
                    <Heart className="h-3 w-3 fill-pink-400 text-pink-400" /> Day {daysTogether} together
                  </span>
                </>
              ) : (
                <>
                  <span className="text-slate-700">•</span>
                  <span className="text-violet-400 font-medium flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Solo Mode (Partner not linked)
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Avatars status */}
          <div className="flex items-center gap-3 shrink-0">
            {isConnected && partner ? (
              <>
                <div className="flex -space-x-3">
                  <Tooltip content={`${firstName} (You)`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-indigo-600 text-white font-bold text-base border-2 border-[#0f1429] shadow-lg shadow-violet-900/40 cursor-default">
                      {firstName[0]}
                    </div>
                  </Tooltip>
                  <Tooltip content={`${partner.name} (Partner)`}>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 text-white font-bold text-base border-2 border-[#0f1429] shadow-lg cursor-default">
                      {partner.name[0]}
                    </div>
                  </Tooltip>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{firstName} & {partnerName}</p>
                  <p className="text-[11px] text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    Connected
                  </p>
                </div>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="border-violet-500/30 hover:border-violet-500 bg-violet-600/10 text-violet-300"
                leftIcon={<UserPlus className="h-4 w-4 text-violet-400" />}
                onClick={() => navigate(ROUTES.PARTNER)}
              >
                Connect Partner
              </Button>
            )}
          </div>
        </div>

        {/* Today Overview Strip */}
        <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Today's Progress",
              value: totalHabits > 0 ? `${completedToday}/${totalHabits}` : "0/0",
              sub: `${todayPct}% complete`,
              color: "text-violet-400",
              icon: <CheckCircle2 className="h-4 w-4" />,
            },
            {
              label: "Current Streak",
              value: `${currentStreak} days`,
              sub: currentStreak > 0 ? "Daily rhythm active" : "Start today",
              color: "text-amber-400",
              icon: <Flame className="h-4 w-4" />,
            },
            {
              label: "Total XP",
              value: `${totalXp} XP`,
              sub: myCompanion ? `Level ${myCompanion.level}` : "Growth score",
              color: "text-emerald-400",
              icon: <Zap className="h-4 w-4" />,
            },
            {
              label: "Goals",
              value: `${goalsCompleted} / ${goals.length}`,
              sub: goals.length > 0 ? `${Math.round((goalsCompleted / goals.length) * 100)}% complete` : "Set your first goal",
              color: "text-pink-400",
              icon: <Target className="h-4 w-4" />,
            },
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

      {/* ── NEW USER COMPANION SELECTION BANNER ───────────────────── */}
      {!hasChosenCompanion && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-slate-900 p-5 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-3 shrink-0">
              <img src="/companions/fox.png" alt="Fox" className="w-12 h-12 object-contain filter drop-shadow-[0_4px_10px_rgba(249,115,22,0.4)]" />
              <img src="/companions/bunny.png" alt="Bunny" className="w-12 h-12 object-contain filter drop-shadow-[0_4px_10px_rgba(244,114,182,0.4)]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" /> Choose Your Astral Spirit Companion
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                Select your 3D Fox, Bunny, or other spirit guide to embark on your daily habit journey!
              </p>
            </div>
          </div>
          <Button
            variant="glow"
            size="sm"
            onClick={() => setIsChooseModalOpen(true)}
            className="shrink-0 bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold"
          >
            Select Character
          </Button>
        </div>
      )}

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
            trend={{ value: totalHabits > 0 ? `${completedToday} completed` : "No habits", direction: "up" }}
          />
          <StatCard
            title="Current Streak"
            value={`${currentStreak} Days`}
            subtitle={currentStreak > 0 ? "Keep the momentum going" : "Complete a habit to begin"}
            icon={<Flame className="h-5 w-5" />}
            accentColor="amber"
            progress={Math.min(100, currentStreak * 10)}
            trend={{ value: `${currentStreak}d streak`, direction: currentStreak > 0 ? "up" : "neutral" }}
          />
          <StatCard
            title="Total XP"
            value={`${totalXp}`}
            subtitle={myCompanion ? `${myCompanion.name} evolution` : "Habit consistency XP"}
            icon={<Zap className="h-5 w-5" />}
            accentColor="emerald"
            progress={myCompanion?.levelProgressPercentage || 20}
            trend={{ value: myCompanion ? `Lv. ${myCompanion.level}` : "+3 XP per habit", direction: "up" }}
          />
          <StatCard
            title="Goals Progress"
            value={goals.length > 0 ? `${Math.round((goalsCompleted / goals.length) * 100)}%` : "0%"}
            subtitle={`${goals.length} active goals`}
            icon={<Target className="h-5 w-5" />}
            accentColor="pink"
            progress={goals.length > 0 ? Math.round((goalsCompleted / goals.length) * 100) : 0}
            glow
            trend={{ value: `${goalsCompleted} finished`, direction: "up" }}
          />
        </div>
      </div>

      {/* ── PARTNER COMPARISON ────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Progress Comparison"
          subtitle={isConnected ? `Side by side with ${partnerName}` : "Connect your partner to compare mutual progress"}
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
                  { label: "Streak", value: `${currentStreak}d`, color: "text-amber-400" },
                  { label: "XP", value: `${totalXp}`, color: "text-emerald-400" },
                ].map((s) => (
                  <div key={s.label} className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800/60">
                    <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* PARTNER'S PROGRESS / CONNECT BANNER */}
          {isConnected && partner ? (
            <Card className="p-5 border-pink-500/20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center text-white font-bold text-sm">
                    {partner.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{partner.name}</p>
                    <p className="text-[10px] text-slate-500">Partner Progress</p>
                  </div>
                </div>
                <Badge variant="rose" size="sm" withDot>Partner</Badge>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Partner Status</span>
                    <span className="font-bold text-pink-400">Active</span>
                  </div>
                  <ProgressBar value={100} variant="rose" size="sm" />
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {[
                    { label: "Partner", value: partnerName, color: "text-pink-400" },
                    { label: "Shared", value: `${partnerStatus?.sharedStreak || 0}d`, color: "text-amber-400" },
                    { label: "Status", value: "Online", color: "text-emerald-400" },
                  ].map((s) => (
                    <div key={s.label} className="bg-slate-900/60 rounded-lg p-2 text-center border border-slate-800/60">
                      <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[9px] text-slate-500 mt-0.5 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-5 border-dashed border-violet-500/30 bg-violet-950/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="h-8 w-8 rounded-full border border-violet-500/40 bg-violet-600/20 flex items-center justify-center text-violet-300">
                    <Heart className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Partner Space Locked</h3>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  NILEV is built for pairs. Link with your partner to compare daily habit completion, maintain shared streaks, and evolve together.
                </p>
              </div>
              <Button
                variant="glow"
                size="sm"
                className="mt-4 w-full"
                leftIcon={<UserPlus className="h-3.5 w-3.5" />}
                onClick={() => navigate(ROUTES.PARTNER)}
              >
                Send Partner Invitation
              </Button>
            </Card>
          )}
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
          {/* USER COMPANION */}
          <Card glow className="p-5 flex flex-col items-center text-center relative overflow-hidden border-violet-500/25">
            <div className="flex items-center justify-between w-full mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Your Companion
              </span>
              <Badge variant="violet" size="sm">
                Lv. {myCompanion?.level || 1}
              </Badge>
            </div>

            <ProgressRing
              value={myCompanion?.levelProgressPercentage || 25}
              size={110}
              strokeWidth={8}
              startColor="#a855f7"
              endColor="#6366f1"
            >
              <div
                className="flex flex-col items-center justify-center cursor-pointer group"
                onClick={() => setIsChooseModalOpen(true)}
                title="Click to customize character"
              >
                {myCompanion?.animalType === "FOX" ? (
                  <img
                    src="/companions/fox.png"
                    alt="Solar Ember Fox"
                    className="w-14 h-14 object-contain filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.5)] transform group-hover:scale-110 transition-transform mb-0.5"
                  />
                ) : myCompanion?.animalType === "RABBIT" ? (
                  <img
                    src="/companions/bunny.png"
                    alt="Moonlit Bunny"
                    className="w-14 h-14 object-contain filter drop-shadow-[0_4px_12px_rgba(244,114,182,0.5)] transform group-hover:scale-110 transition-transform mb-0.5"
                  />
                ) : (
                  <span className="text-4xl leading-none mb-1 group-hover:scale-110 transition-transform" role="img" aria-label="companion">
                    {myCompanion?.animalEmoji || "🦊"}
                  </span>
                )}
                <span className="text-[9px] font-mono text-slate-400">{myCompanion?.xp || 0} XP</span>
              </div>
            </ProgressRing>

            <h3 className="mt-3 text-base font-bold text-white tracking-tight">
              {myCompanion?.name || "Ember"}
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {myCompanion?.animalType === "RABBIT"
                ? "Moonlit Bunny Spirit"
                : myCompanion?.animalType === "FOX"
                ? "Solar Ember Fox Spirit"
                : myCompanion?.animalType
                ? `${myCompanion.animalType} Companion`
                : "Spirit Guide"}
            </p>

            <div className="w-full mt-4 grid grid-cols-2 gap-2 text-left">
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">Mood</span>
                <span className="text-xs font-bold text-emerald-400">
                  {myCompanion?.moodEmoji || "✨"} {myCompanion?.mood || "Cheerful"}
                </span>
              </div>
              <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">Happiness</span>
                <span className="text-xs font-bold text-amber-400">{myCompanion?.happiness || 100}%</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChooseModalOpen(true)}
              className="mt-3.5 w-full border-violet-500/30 text-violet-300 hover:bg-violet-600/10 text-xs font-semibold py-1.5"
              leftIcon={<Sparkles className="h-3.5 w-3.5 text-amber-400" />}
            >
              Choose / Customize Character
            </Button>
          </Card>

          {/* PARTNER COMPANION */}
          {isConnected && partner ? (
            <Card className="p-5 flex flex-col items-center text-center relative overflow-hidden border-pink-500/20">
              <div className="flex items-center justify-between w-full mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {partnerName}'s Companion
                </span>
                <Badge variant="rose" size="sm">
                  Lv. {partnerCompanion?.level || 1}
                </Badge>
              </div>

              <ProgressRing
                value={partnerCompanion?.levelProgressPercentage || 20}
                size={110}
                strokeWidth={8}
                startColor="#ec4899"
                endColor="#f97316"
              >
                <div className="flex flex-col items-center justify-center">
                  {partnerCompanion?.animalType === "FOX" ? (
                    <img
                      src="/companions/fox.png"
                      alt="Solar Ember Fox"
                      className="w-14 h-14 object-contain filter drop-shadow-[0_4px_12px_rgba(249,115,22,0.5)] mb-0.5"
                    />
                  ) : partnerCompanion?.animalType === "RABBIT" ? (
                    <img
                      src="/companions/bunny.png"
                      alt="Moonlit Bunny"
                      className="w-14 h-14 object-contain filter drop-shadow-[0_4px_12px_rgba(244,114,182,0.5)] mb-0.5"
                    />
                  ) : (
                    <span className="text-4xl leading-none mb-1" role="img" aria-label="partner companion">
                      {partnerCompanion?.animalEmoji || "🐰"}
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-slate-400">{partnerCompanion?.xp || 0} XP</span>
                </div>
              </ProgressRing>

              <h3 className="mt-3 text-base font-bold text-white tracking-tight">
                {partnerCompanion?.name || `${partnerName}'s Guide`}
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {partnerCompanion?.animalType === "RABBIT"
                  ? "Moonlit Bunny Spirit"
                  : partnerCompanion?.animalType === "FOX"
                  ? "Solar Ember Fox Spirit"
                  : partnerCompanion?.animalType
                  ? `${partnerCompanion.animalType} Companion`
                  : "Caretaker Spirit"}
              </p>

              <div className="w-full mt-4 grid grid-cols-2 gap-2 text-left">
                <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">Mood</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {partnerCompanion?.moodEmoji || "🌙"} {partnerCompanion?.mood || "Peaceful"}
                  </span>
                </div>
                <div className="bg-slate-900/60 rounded-xl p-2.5 border border-slate-800/80">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block mb-0.5">Happiness</span>
                  <span className="text-xs font-bold text-amber-400">{partnerCompanion?.happiness || 100}%</span>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-400">
                <Smile className="h-3.5 w-3.5 text-pink-400" />
                <span>Nurtured by {partnerName}'s progress</span>
              </div>
            </Card>
          ) : (
            <Card className="p-5 flex flex-col items-center justify-center text-center relative overflow-hidden border-dashed border-slate-800 bg-slate-900/30">
              <div className="h-16 w-16 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-500 mb-3">
                <Lock className="h-7 w-7 text-slate-500" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Partner Companion Sanctuary</h3>
              <p className="text-xs text-slate-400 max-w-xs mb-4">
                Connect with your partner to unlock side-by-side companion growth, joint evolution stages, and mutual affinity boosts.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="border-violet-500/30 hover:border-violet-500 text-violet-300"
                onClick={() => navigate(ROUTES.PARTNER)}
              >
                Link Partner Sanctuary
              </Button>
            </Card>
          )}
        </div>
      </div>

      {/* ── HABITS & PARTNER ACTIVITY (2-col on desktop) ─────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* TODAY'S HABITS */}
        <div className="lg:col-span-3">
          <SectionHeader
            title="Today's Habits"
            subtitle={`${completedToday} of ${totalHabits} complete`}
            action={
              <Button
                variant="glow"
                size="sm"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => navigate(ROUTES.HABITS)}
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

            {totalHabits > 0 ? (
              <div className="space-y-2">
                {habits.map((h) => {
                  const catColor = CATEGORY_COLORS[h.category] || "violet";
                  const checked = h.completedToday;

                  return (
                    <div
                      key={h.id}
                      className={`flex items-center gap-3.5 p-3.5 rounded-xl border transition-all duration-200 ${
                        checked
                          ? "bg-violet-950/20 border-violet-500/30"
                          : "bg-slate-900/40 border-slate-800/60 hover:border-violet-500/25 hover:bg-slate-900/60"
                      }`}
                    >
                      <button
                        onClick={() => handleToggleHabit(h.id, h.name, checked)}
                        aria-label={`Toggle ${h.name}`}
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border transition-all ${
                          checked
                            ? "bg-gradient-to-tr from-violet-600 to-indigo-600 border-violet-400 text-white shadow-[0_0_10px_rgba(139,92,246,0.45)]"
                            : "border-slate-700 bg-slate-900/60 hover:border-violet-500"
                        }`}
                      >
                        <Check className={`h-3.5 w-3.5 stroke-[3] ${checked ? "text-white" : "text-transparent"}`} />
                      </button>

                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold leading-tight ${checked ? "text-slate-400 line-through" : "text-white"}`}>
                          {h.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5" />
                            {h.timeOfDay || "Anytime"}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant={catColor} size="sm">
                          {h.category}
                        </Badge>
                        <span className="flex items-center gap-0.5 text-xs font-bold text-amber-400 font-mono">
                          <Flame className="h-3.5 w-3.5 fill-amber-400" />
                          {h.currentStreak || 0}d
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl">
                <CheckCircle2 className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">No habits tracked yet</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Create your first habit ritual to start building your daily streak and earn XP!
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3.5 border-violet-500/30 text-violet-300 hover:border-violet-500"
                  leftIcon={<Plus className="h-3.5 w-3.5" />}
                  onClick={() => navigate(ROUTES.HABITS)}
                >
                  Create Habit
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* PARTNER ACTIVITY */}
        <div className="lg:col-span-2">
          <SectionHeader
            title="Partner Activity"
            subtitle={isConnected ? `What ${partnerName} did recently` : "Partner activity feed"}
          />
          <Card className="p-5 h-full flex flex-col justify-between">
            {isConnected && activities.length > 0 ? (
              <div className="space-y-3">
                {activities.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-800 border border-slate-700 text-sm">
                      {item.icon || "✨"}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-slate-300 leading-relaxed">{item.title}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        {new Date(item.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center border border-dashed border-slate-800 rounded-xl">
                <Heart className="h-8 w-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-300">
                  {isConnected ? "No partner activity yet today" : "No partner connected"}
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  {isConnected
                    ? `When ${partnerName} completes habits or goals, their progress appears here!`
                    : "Connect with your partner in Partner Space to unlock your shared live timeline."}
                </p>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-4"
              rightIcon={<ChevronRight className="h-3.5 w-3.5" />}
              onClick={() => navigate(ROUTES.PARTNER)}
            >
              {isConnected ? "View Partner Space" : "Connect in Partner Space"}
            </Button>
          </Card>
        </div>
      </div>

      {/* ── GOALS ───────────────────────────────────────────── */}
      <div>
        <SectionHeader
          title="Active Goals"
          subtitle="Long-term milestones you're tracking"
          action={
            <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-3.5 w-3.5" />} onClick={() => navigate(ROUTES.GOALS)}>
              All Goals
            </Button>
          }
        />
        <Card className="p-5">
          {goals.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {goals.slice(0, 4).map((g) => (
                <div key={g.id} className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                      <span>{g.icon || "🎯"}</span>
                      {g.title}
                    </span>
                    <span className="text-xs font-bold font-mono text-violet-400">
                      {g.percentage || 0}%
                    </span>
                  </div>
                  <ProgressBar
                    value={g.percentage || 0}
                    variant="violet"
                    size="sm"
                    glow={g.percentage === 100}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    {g.currentValue} / {g.targetValue} {g.unit || ""}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center border border-dashed border-slate-800 rounded-xl">
              <Target className="h-8 w-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-300">No active goals yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Set personal or shared couple milestones to work towards together!
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-3.5 border-violet-500/30 text-violet-300 hover:border-violet-500"
                leftIcon={<Plus className="h-3.5 w-3.5" />}
                onClick={() => navigate(ROUTES.GOALS)}
              >
                Create Goal
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* ── CHOOSE COMPANION MODAL ─────────────────────────────── */}
      <ChooseCompanionModal
        isOpen={isChooseModalOpen}
        onClose={() => setIsChooseModalOpen(false)}
        currentAnimal={myCompanion?.animalType || "FOX"}
        currentName={myCompanion?.name || "Ember"}
        onSave={handleSaveCompanion}
      />

    </div>
  );
};

export default DashboardPage;
