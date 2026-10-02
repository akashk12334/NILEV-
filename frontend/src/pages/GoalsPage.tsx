import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Target,
  Plus,
  CheckCircle2,
  Calendar,
  Sparkles,
  Users,
  Trophy,
  RefreshCw,
  Pencil,
  Trash2,
  TrendingUp,
  Star,
} from "lucide-react";
import { goalService } from "../services/goal.service";
import { partnerService } from "../services/partner.service";
import type {
  GoalResponse,
  GoalType,
  GoalStatus,
  GoalTab,
  CreateGoalRequest,
  UpdateGoalRequest,
  PartnerStatusResponse,
} from "../types";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ProgressBar } from "../components/ui/ProgressBar";
import { ProgressRing } from "../components/ui/ProgressRing";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { cn } from "../utils/cn";

// Default goal icons & colors
const GOAL_ICONS = ["🎯", "🏃‍♂️", "📚", "✈️", "💰", "🧘‍♀️", "💖", "🌱", "🎨", "🏡"];
const GOAL_COLORS = [
  "#8B5CF6", // Violet
  "#6366F1", // Indigo
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#06B6D4", // Cyan
  "#F43F5E", // Rose
];

const GOAL_CATEGORIES = [
  "HEALTH",
  "FITNESS",
  "LEARNING",
  "CAREER",
  "FINANCE",
  "TRAVEL",
  "RELATIONSHIP",
  "MINDFULNESS",
  "CREATIVITY",
  "HOME",
  "GENERAL",
];

const MILESTONES = [25, 50, 75, 100];

export const GoalsPage: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<GoalTab>("MY");
  const [goals, setGoals] = useState<GoalResponse[]>([]);
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalResponse | null>(null);
  const [progressGoal, setProgressGoal] = useState<GoalResponse | null>(null);
  const [deletingGoalId, setDeletingGoalId] = useState<number | null>(null);

  // Form states
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState("GENERAL");
  const [formType, setFormType] = useState<GoalType>("PERSONAL");
  const [formTargetValue, setFormTargetValue] = useState<number>(100);
  const [formCurrentValue, setFormCurrentValue] = useState<number>(0);
  const [formUnit, setFormUnit] = useState("%");
  const [formTargetDate, setFormTargetDate] = useState("");
  const [formIsImportant, setFormIsImportant] = useState(false);
  const [formIcon, setFormIcon] = useState("🎯");
  const [formColor, setFormColor] = useState("#8B5CF6");
  const [formStatus, setFormStatus] = useState<GoalStatus>("ACTIVE");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick progress log state
  const [progressInput, setProgressInput] = useState<number>(0);
  const [progressMode, setProgressMode] = useState<"ADD" | "SET">("ADD");

  // Load goals
  const loadGoals = useCallback(async (refresh = false) => {
    try {
      if (refresh) setIsRefreshing(true);
      else setIsLoading(true);
      setError(null);

      const [goalsData, pStatus] = await Promise.all([
        goalService.getAll("ALL"),
        partnerService.getStatus().catch(() => null),
      ]);

      setGoals(goalsData || []);
      setPartnerStatus(pStatus);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to load goals";
      setError(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  // Tab Filtering
  const filteredGoals = useMemo(() => {
    if (activeTab === "MY") {
      return goals.filter((g) => g.type === "PERSONAL" && g.status !== "COMPLETED" && g.isMine);
    }
    if (activeTab === "SHARED") {
      return goals.filter((g) => g.type === "SHARED" && g.status !== "COMPLETED");
    }
    if (activeTab === "COMPLETED") {
      return goals.filter((g) => g.status === "COMPLETED");
    }
    return goals;
  }, [goals, activeTab]);

  // Aggregated Stats
  const stats = useMemo(() => {
    const myCount = goals.filter((g) => g.type === "PERSONAL" && g.status !== "COMPLETED" && g.isMine).length;
    const sharedCount = goals.filter((g) => g.type === "SHARED" && g.status !== "COMPLETED").length;
    const completedCount = goals.filter((g) => g.status === "COMPLETED").length;

    let totalPct = 0;
    const activeGoals = goals.filter((g) => g.status !== "COMPLETED");
    if (activeGoals.length > 0) {
      const sum = activeGoals.reduce((acc, curr) => acc + curr.percentage, 0);
      totalPct = Math.round(sum / activeGoals.length);
    }

    return { myCount, sharedCount, completedCount, totalPct };
  }, [goals]);

  // Open Create Modal
  const handleOpenCreate = (defaultType?: GoalType) => {
    setEditingGoal(null);
    setFormTitle("");
    setFormDescription("");
    setFormCategory("GENERAL");
    setFormType(defaultType || (activeTab === "SHARED" ? "SHARED" : "PERSONAL"));
    setFormTargetValue(100);
    setFormCurrentValue(0);
    setFormUnit("%");
    setFormTargetDate("");
    setFormIsImportant(false);
    setFormIcon("🎯");
    setFormColor("#8B5CF6");
    setFormStatus("ACTIVE");
    setIsCreateModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (goal: GoalResponse) => {
    setEditingGoal(goal);
    setFormTitle(goal.title);
    setFormDescription(goal.description || "");
    setFormCategory(goal.category || "GENERAL");
    setFormType(goal.type);
    setFormTargetValue(goal.targetValue);
    setFormCurrentValue(goal.currentValue);
    setFormUnit(goal.unit || "%");
    setFormTargetDate(goal.targetDate || "");
    setFormIsImportant(goal.isImportant);
    setFormIcon(goal.icon || "🎯");
    setFormColor(goal.color || "#8B5CF6");
    setFormStatus(goal.status);
    setIsCreateModalOpen(true);
  };

  // Submit Create or Edit
  const handleSubmitGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    try {
      setIsSubmitting(true);

      if (editingGoal) {
        const updateData: UpdateGoalRequest = {
          title: formTitle.trim(),
          description: formDescription,
          category: formCategory,
          targetValue: formTargetValue,
          currentValue: formCurrentValue,
          unit: formUnit,
          targetDate: formTargetDate || undefined,
          isImportant: formIsImportant,
          icon: formIcon,
          color: formColor,
          status: formStatus,
        };
        await goalService.update(editingGoal.id, updateData);
      } else {
        const createData: CreateGoalRequest = {
          title: formTitle.trim(),
          description: formDescription,
          category: formCategory,
          type: formType,
          targetValue: formTargetValue,
          currentValue: formCurrentValue,
          unit: formUnit,
          targetDate: formTargetDate || undefined,
          isImportant: formIsImportant,
          icon: formIcon,
          color: formColor,
        };
        await goalService.create(createData);
      }

      setIsCreateModalOpen(false);
      loadGoals(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error saving goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Progress Modal
  const handleOpenProgress = (goal: GoalResponse) => {
    setProgressGoal(goal);
    setProgressMode("ADD");
    setProgressInput(1);
  };

  // Submit Progress
  const handleSubmitProgress = async () => {
    if (!progressGoal) return;

    try {
      setIsSubmitting(true);
      if (progressMode === "ADD") {
        await goalService.updateProgress(progressGoal.id, { increment: Number(progressInput) });
      } else {
        await goalService.updateProgress(progressGoal.id, { currentValue: Number(progressInput) });
      }

      setProgressGoal(null);
      loadGoals(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error updating progress");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete Goal
  const handleConfirmDelete = async () => {
    if (!deletingGoalId) return;
    try {
      setIsSubmitting(true);
      await goalService.delete(deletingGoalId);
      setDeletingGoalId(null);
      loadGoals(true);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Error deleting goal");
    } finally {
      setIsSubmitting(false);
    }
  };

  const partnerName = partnerStatus?.partner?.nickname || partnerStatus?.partner?.name || "Partner";

  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-16">
      {/* ── Top Header & Stats ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-violet-500/10 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 shadow-[0_0_15px_rgba(139,92,246,0.15)]">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                  Goals & Milestones
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">
                  <Sparkles className="h-3 w-3" />
                  Milestone Resonance
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Track personal growth and build joint targets with {partnerName}.
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadGoals(true)}
            disabled={isRefreshing}
            className="border-violet-500/20 hover:border-violet-500/40 text-slate-300"
          >
            <RefreshCw className={cn("h-4 w-4 mr-2 text-violet-400", isRefreshing && "animate-spin")} />
            Sync
          </Button>

          <Button
            size="sm"
            variant="glow"
            onClick={() => handleOpenCreate()}
            className="shadow-[0_0_15px_rgba(139,92,246,0.25)]"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Create Goal
          </Button>
        </div>
      </div>

      {/* ── Quick Stats Ribbon ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <Card className="p-4 bg-[#0e1322]/80 border-violet-500/10 hover:border-violet-500/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">My Goals</span>
            <Target className="h-4 w-4 text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-1.5">{stats.myCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active personal targets</div>
        </Card>

        <Card className="p-4 bg-[#0e1322]/80 border-indigo-500/10 hover:border-indigo-500/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Shared Goals</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-indigo-300 mt-1.5">{stats.sharedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Joint targets with partner</div>
        </Card>

        <Card className="p-4 bg-[#0e1322]/80 border-emerald-500/10 hover:border-emerald-500/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Completed</span>
            <Trophy className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 mt-1.5">{stats.completedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Milestones conquered</div>
        </Card>

        <Card className="p-4 bg-[#0e1322]/80 border-amber-500/10 hover:border-amber-500/25 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Avg Progress</span>
            <TrendingUp className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 mt-1.5">{stats.totalPct}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Across active targets</div>
        </Card>
      </div>

      {/* ── Navigation Tabs ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-violet-500/15 overflow-x-auto scrollbar-none">
        <div className="flex items-center space-x-1 sm:space-x-2 -mb-px shrink-0">
          {[
            { id: "MY", label: "My Goals", count: stats.myCount },
            { id: "SHARED", label: "Shared Goals", count: stats.sharedCount, badge: "Couple" },
            { id: "COMPLETED", label: "Completed", count: stats.completedCount },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as GoalTab)}
                className={cn(
                  "flex items-center gap-1.5 sm:gap-2 py-3 px-3 sm:px-4 border-b-2 text-xs sm:text-sm font-medium transition-all select-none shrink-0",
                  isActive
                    ? "border-violet-500 text-white font-semibold"
                    : "border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={cn(
                    "text-[11px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full font-mono font-medium",
                    isActive
                      ? "bg-violet-500/20 text-violet-300"
                      : "bg-slate-800 text-slate-400"
                  )}
                >
                  {tab.count}
                </span>
                {tab.badge && (
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold text-pink-400 bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 rounded">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Goals Grid ───────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-5 space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-xl bg-slate-800/60 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-5 w-36 rounded-md bg-slate-800/60 animate-pulse" />
                    <div className="h-3.5 w-24 rounded-md bg-slate-800/40 animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-14 rounded-lg bg-slate-800/50 animate-pulse" />
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800/60 animate-pulse" />
              <div className="flex justify-between items-center pt-2">
                <div className="h-4 w-28 rounded-md bg-slate-800/40 animate-pulse" />
                <div className="h-4 w-12 rounded-md bg-slate-800/40 animate-pulse" />
              </div>
            </Card>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center bg-red-950/20 border-red-500/20">
          <p className="text-sm text-red-400">{error}</p>
          <Button size="sm" variant="outline" onClick={() => loadGoals()} className="mt-4">
            Try Again
          </Button>
        </Card>
      ) : filteredGoals.length === 0 ? (
        <Card className="py-16 px-4 text-center bg-[#0e1322]/40 border-violet-500/10">
          <div className="h-12 w-12 rounded-2xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mx-auto mb-3 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
            <Target className="h-6 w-6" />
          </div>
          <h3 className="text-base font-semibold text-white">
            {activeTab === "MY"
              ? "No personal goals yet"
              : activeTab === "SHARED"
              ? "No shared goals yet"
              : "No completed goals yet"}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
            {activeTab === "MY"
              ? "Set a milestone for your habits, career, mindfulness, or fitness."
              : activeTab === "SHARED"
              ? "Build a dream target together with your partner, from travel to shared savings."
              : "Complete goals and hit milestones to view your trophy shelf here."}
          </p>
          {activeTab !== "COMPLETED" && (
            <Button
              size="sm"
              variant="glow"
              onClick={() => handleOpenCreate(activeTab === "SHARED" ? "SHARED" : "PERSONAL")}
              className="mt-4 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Create {activeTab === "SHARED" ? "Shared Goal" : "Personal Goal"}
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const isShared = goal.type === "SHARED";
            const isCompleted = goal.status === "COMPLETED";

            return (
              <div
                key={goal.id}
                className={cn(
                  "group relative rounded-2xl bg-[#0e1322]/80 border transition-all duration-300 p-5 shadow-sm hover:shadow-[0_6px_28px_rgba(139,92,246,0.12)] flex flex-col justify-between",
                  goal.isImportant
                    ? "border-violet-500/35 bg-gradient-to-br from-[#0e1322]/90 via-[#121028]/80 to-[#0e1322]/90 shadow-[0_0_20px_rgba(139,92,246,0.08)]"
                    : "border-violet-500/15 hover:border-violet-500/30"
                )}
              >
                {/* Top Row: Icon + Title + Type Badge + Menu */}
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {/* Icon Container */}
                      <div
                        className="h-11 w-11 rounded-xl flex items-center justify-center text-xl shrink-0 border shadow-inner"
                        style={{
                          backgroundColor: `${goal.color || "#8B5CF6"}18`,
                          borderColor: `${goal.color || "#8B5CF6"}35`,
                        }}
                      >
                        {goal.icon || "🎯"}
                      </div>

                      {/* Title & Metadata Badges */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-white tracking-tight leading-snug">
                            {goal.title}
                          </h3>
                          {goal.isImportant && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 shadow-[0_0_8px_rgba(245,158,11,0.2)]">
                              <Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                              Priority
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1 flex-wrap">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium border",
                              isShared
                                ? "bg-pink-500/10 text-pink-300 border-pink-500/25"
                                : "bg-violet-500/10 text-violet-300 border-violet-500/25"
                            )}
                          >
                            {isShared ? <Users className="h-3 w-3 mr-0.5" /> : null}
                            {isShared ? `Shared with ${partnerName}` : "Personal"}
                          </span>

                          <span className="text-[11px] text-slate-500">•</span>
                          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">
                            {goal.category}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="flex items-center gap-1">
                      {goal.canContribute && !isCompleted && (
                        <button
                          onClick={() => handleOpenProgress(goal)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 hover:border-violet-400 transition-all flex items-center gap-1 shadow-sm"
                          title="Record progress towards this goal"
                        >
                          <Plus className="h-3 w-3" />
                          Log
                        </button>
                      )}

                      <button
                        onClick={() => handleOpenEdit(goal)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        title="Edit goal details"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      {goal.isMine && (
                        <button
                          onClick={() => setDeletingGoalId(goal.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete goal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {goal.description && (
                    <p className="text-xs text-slate-300 mt-2.5 leading-relaxed line-clamp-2">
                      {goal.description}
                    </p>
                  )}
                </div>

                {/* Middle: Progress Visualizer */}
                <div className="mt-4 pt-3.5 border-t border-violet-500/10">
                  {goal.isImportant ? (
                    /* Circular progress layout for important goals */
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-xl bg-[#090D16]/60 border border-violet-500/15">
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <ProgressRing
                          value={goal.percentage}
                          size={68}
                          strokeWidth={6}
                          startColor={goal.color || "#8B5CF6"}
                          endColor="#EC4899"
                        >
                          <span className="text-xs font-bold font-mono text-white">
                            {Math.round(goal.percentage)}%
                          </span>
                        </ProgressRing>

                        <div className="min-w-0">
                          <div className="text-xs font-medium text-slate-400">Current Progress</div>
                          <div className="text-base sm:text-lg font-bold text-white font-mono mt-0.5 truncate">
                            {goal.currentValue}
                            <span className="text-xs text-slate-400 font-normal ml-1">
                              / {goal.targetValue} {goal.unit}
                            </span>
                          </div>
                          {isCompleted ? (
                            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
                              <CheckCircle2 className="h-3 w-3" /> Accomplished!
                            </span>
                          ) : (
                            <span className="text-[11px] text-violet-300 mt-0.5 block truncate">
                              {Math.max(0, goal.targetValue - goal.currentValue)} {goal.unit} remaining
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Milestone Badges */}
                      <div className="flex flex-row sm:flex-col gap-1 text-[10px] sm:text-[11px] font-mono flex-wrap sm:flex-nowrap">
                        {MILESTONES.map((m) => {
                          const reached = goal.percentage >= m;
                          return (
                            <span
                              key={m}
                              className={cn(
                                "px-1.5 py-0.5 rounded text-[10px] sm:text-right font-medium transition-colors",
                                reached
                                  ? "text-emerald-400 bg-emerald-500/10 font-bold"
                                  : "text-slate-600"
                              )}
                            >
                              {m}% {reached && "✓"}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Linear progress bar layout for standard goals */
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-400">
                          Progress:{" "}
                          <strong className="text-white font-mono">
                            {goal.currentValue} / {goal.targetValue} {goal.unit}
                          </strong>
                        </span>
                        <span className="font-bold text-white font-mono">{goal.percentage}%</span>
                      </div>

                      {/* Linear Bar */}
                      <ProgressBar
                        value={goal.percentage}
                        variant="violet"
                        size="md"
                        glow={goal.percentage > 70}
                      />

                      {/* 25% / 50% / 75% / 100% Milestone Track Points */}
                      <div className="relative pt-1 flex justify-between text-[10px] font-mono text-slate-500 select-none">
                        {MILESTONES.map((m) => {
                          const isReached = goal.percentage >= m;
                          return (
                            <div key={m} className="flex flex-col items-center">
                              <div
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full mb-1 transition-all",
                                  isReached
                                    ? "bg-violet-400 ring-2 ring-violet-500/40 shadow-[0_0_6px_rgba(139,92,246,0.6)]"
                                    : "bg-slate-700"
                                )}
                              />
                              <span className={cn(isReached && "text-violet-300 font-semibold")}>
                                {m}%
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Bottom Row: Dates + Days remaining + Status */}
                <div className="mt-3.5 pt-3 border-t border-violet-500/10 flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-slate-500" />
                    {goal.targetDate ? (
                      <span>
                        Due {new Date(goal.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    ) : (
                      <span className="text-slate-500">Open-ended</span>
                    )}
                  </div>

                  {/* Days remaining badge */}
                  <div>
                    {isCompleted ? (
                      <Badge variant="emerald" size="sm">Completed</Badge>
                    ) : goal.daysRemaining !== null && goal.daysRemaining !== undefined ? (
                      goal.daysRemaining < 0 ? (
                        <span className="text-rose-400 font-semibold text-[11px]">
                          {Math.abs(goal.daysRemaining)}d overdue
                        </span>
                      ) : goal.daysRemaining === 0 ? (
                        <span className="text-amber-400 font-semibold text-[11px]">Due today</span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">
                          {goal.daysRemaining} days left
                        </span>
                      )
                    ) : (
                      <span className="text-slate-500 text-[11px]">In progress</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Goal Modal ─────────────────────────────────── */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title={editingGoal ? "Edit Goal Details" : "Create New Sanctuary Goal"}
        description={
          editingGoal
            ? "Update targets, milestones, deadlines, and visual priority."
            : "Define a personal achievement or joint target with your partner."
        }
        size="lg"
        footer={
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={handleSubmitGoal}
              disabled={isSubmitting || !formTitle.trim()}
            >
              {isSubmitting ? "Saving..." : editingGoal ? "Save Changes" : "Create Goal"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitGoal} className="space-y-4">
          {/* Goal Type Picker (Personal vs Shared) */}
          {!editingGoal && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Goal Ownership
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setFormType("PERSONAL")}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    formType === "PERSONAL"
                      ? "bg-violet-500/20 border-violet-500/50 shadow-[0_0_12px_rgba(139,92,246,0.2)]"
                      : "bg-[#090D16]/60 border-violet-500/10 text-slate-400 hover:text-white"
                  )}
                >
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Target className="h-4 w-4 text-violet-400" /> Personal Goal
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Belongs to you alone. Partner can view progress in read-only mode.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormType("SHARED")}
                  className={cn(
                    "p-3 rounded-xl border text-left transition-all",
                    formType === "SHARED"
                      ? "bg-pink-500/20 border-pink-500/50 shadow-[0_0_12px_rgba(236,72,153,0.2)]"
                      : "bg-[#090D16]/60 border-violet-500/10 text-slate-400 hover:text-white"
                  )}
                >
                  <div className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-pink-400" /> Shared Goal
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1 leading-tight">
                    Joint target with {partnerName}. Both can contribute and track progress.
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Goal Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Read 24 Books This Year"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-violet-500/20 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              placeholder="Describe the intention or rules for achieving this milestone..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-violet-500/20 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/60 resize-none"
            />
          </div>

          {/* Values & Unit Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Target Value *
              </label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={formTargetValue}
                onChange={(e) => setFormTargetValue(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-violet-500/20 text-sm text-white focus:outline-none focus:border-violet-500/60 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Current Value
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formCurrentValue}
                onChange={(e) => setFormCurrentValue(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-violet-500/20 text-sm text-white focus:outline-none focus:border-violet-500/60 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Unit
              </label>
              <input
                type="text"
                placeholder="e.g. books, km, $, %"
                value={formUnit}
                onChange={(e) => setFormUnit(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-violet-500/20 text-sm text-white focus:outline-none focus:border-violet-500/60"
              />
            </div>
          </div>

          {/* Category & Deadline Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Category
              </label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-violet-500/20 text-xs text-white focus:outline-none focus:border-violet-500/60"
              >
                {GOAL_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Target Deadline
              </label>
              <input
                type="date"
                value={formTargetDate}
                onChange={(e) => setFormTargetDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-violet-500/20 text-xs text-white focus:outline-none focus:border-violet-500/60"
              />
            </div>
          </div>

          {/* Status (if editing) */}
          {editingGoal && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Status
              </label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value as GoalStatus)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-violet-500/20 text-xs text-white focus:outline-none focus:border-violet-500/60"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="PAUSED">PAUSED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
          )}

          {/* Priority / Important toggle */}
          <div className="p-3 rounded-xl bg-[#090D16]/60 border border-violet-500/15 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Star className="h-4 w-4 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-white">Priority Goal Display</div>
                <div className="text-[11px] text-slate-400">
                  Highlights with cosmic circular ProgressRing visualizer
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={formIsImportant}
              onChange={(e) => setFormIsImportant(e.target.checked)}
              className="h-4 w-4 rounded accent-violet-600 cursor-pointer"
            />
          </div>

          {/* Icon & Color Row */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
              Icon & Palette
            </label>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Icon Picker */}
              <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
                {GOAL_ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setFormIcon(ic)}
                    className={cn(
                      "h-8 w-8 rounded-lg flex items-center justify-center text-sm border transition-all",
                      formIcon === ic
                        ? "bg-violet-500/30 border-violet-400 scale-110 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                        : "bg-[#090D16] border-violet-500/15 hover:border-violet-500/30"
                    )}
                  >
                    {ic}
                  </button>
                ))}
              </div>

              {/* Color Picker */}
              <div className="flex items-center gap-1.5 py-1">
                {GOAL_COLORS.map((col) => (
                  <button
                    key={col}
                    type="button"
                    onClick={() => setFormColor(col)}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 transition-transform",
                      formColor === col
                        ? "border-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                        : "border-transparent hover:scale-110"
                    )}
                    style={{ backgroundColor: col }}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>
      </Modal>

      {/* ── Log Progress Modal ───────────────────────────────────────── */}
      <Modal
        isOpen={!!progressGoal}
        onClose={() => setProgressGoal(null)}
        title="Log Progress"
        description={progressGoal ? `Record progress towards "${progressGoal.title}"` : ""}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setProgressGoal(null)}>
              Cancel
            </Button>
            <Button
              variant="glow"
              size="sm"
              onClick={handleSubmitProgress}
              disabled={isSubmitting || progressInput <= 0}
            >
              {isSubmitting ? "Updating..." : "Record Progress"}
            </Button>
          </>
        }
      >
        {progressGoal && (
          <div className="space-y-4">
            {/* Current vs Target banner */}
            <div className="p-3 rounded-xl bg-[#090D16] border border-violet-500/20 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400">Current: </span>
                <span className="font-bold text-white font-mono">
                  {progressGoal.currentValue} {progressGoal.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400">Target: </span>
                <span className="font-bold text-violet-300 font-mono">
                  {progressGoal.targetValue} {progressGoal.unit}
                </span>
              </div>
            </div>

            {/* Mode Picker: ADD vs SET */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setProgressMode("ADD");
                  setProgressInput(1);
                }}
                className={cn(
                  "py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border",
                  progressMode === "ADD"
                    ? "bg-violet-600 text-white border-violet-400"
                    : "bg-[#090D16] text-slate-400 border-violet-500/15"
                )}
              >
                + Add Increment
              </button>
              <button
                type="button"
                onClick={() => {
                  setProgressMode("SET");
                  setProgressInput(progressGoal.currentValue);
                }}
                className={cn(
                  "py-1.5 px-3 rounded-lg text-xs font-semibold transition-all border",
                  progressMode === "SET"
                    ? "bg-violet-600 text-white border-violet-400"
                    : "bg-[#090D16] text-slate-400 border-violet-500/15"
                )}
              >
                Set Exact Value
              </button>
            </div>

            {/* Input */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">
                {progressMode === "ADD" ? "Amount to add:" : "New total value:"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  value={progressInput}
                  onChange={(e) => setProgressInput(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#090D16] border border-violet-500/20 text-base font-mono text-white focus:outline-none focus:border-violet-500/60"
                  autoFocus
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-400">
                  {progressGoal.unit}
                </span>
              </div>
            </div>

            {/* Quick increment pill shortcuts (if mode is ADD) */}
            {progressMode === "ADD" && (
              <div className="flex items-center gap-2">
                {[1, 5, 10, 25].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setProgressInput(val)}
                    className="flex-1 py-1 rounded-lg text-xs font-mono font-medium bg-[#090D16] border border-violet-500/20 hover:border-violet-500/50 text-slate-300 hover:text-white transition-all"
                  >
                    +{val}
                  </button>
                ))}
              </div>
            )}

            {/* Predicted Milestone Warning */}
            {(() => {
              const estimatedNewVal =
                progressMode === "ADD"
                  ? progressGoal.currentValue + Number(progressInput)
                  : Number(progressInput);
              const estimatedPct = Math.min(
                100,
                Math.round((estimatedNewVal / progressGoal.targetValue) * 100)
              );

              const hitMilestone = MILESTONES.find(
                (m) => estimatedPct >= m && progressGoal.percentage < m
              );

              if (hitMilestone) {
                return (
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25 flex items-center gap-2 text-xs text-emerald-300">
                    <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
                    <span>
                      Milestone unlock! Reaching <strong>{hitMilestone}%</strong> will broadcast a sanctuary activity event!
                    </span>
                  </div>
                );
              }
              return null;
            })()}
          </div>
        )}
      </Modal>

      {/* ── Delete Confirmation Dialog ───────────────────────────────── */}
      <ConfirmDialog
        isOpen={deletingGoalId !== null}
        onClose={() => setDeletingGoalId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Goal"
        message="Are you sure you want to delete this goal? All tracked milestone progress will be permanently removed."
        confirmText="Delete Goal"
        isDestructive={true}
        isLoading={isSubmitting}
      />
    </div>
  );
};
