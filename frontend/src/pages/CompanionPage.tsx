import React, { useState, useEffect, useCallback } from "react";
import { companionService } from "../services/companion.service";
import { partnerService } from "../services/partner.service";
import type {
  CompanionResponse,
  CompanionHistoryResponse,
  AnimalType,
} from "../types";
import {
  CompanionHeroCard,
  ChooseCompanionModal,
  CompanionHistoryTimeline,
} from "../components/companion";
import { Button, Badge } from "../components/ui";
import {
  Sparkles,
  Users,
  Flame,
  Target,
  Heart,
  RefreshCw,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants";

type CompanionTab = "mine" | "partner";

export const CompanionPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<CompanionTab>("mine");
  const [myCompanion, setMyCompanion] = useState<CompanionResponse | null>(null);
  const [partnerCompanion, setPartnerCompanion] = useState<CompanionResponse | null>(null);
  const [history, setHistory] = useState<CompanionHistoryResponse[]>([]);
  const [hasPartner, setHasPartner] = useState<boolean>(true);
  const [partnerName, setPartnerName] = useState<string>("Partner");

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInteracting, setIsInteracting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Customization modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Fetch companion & partner data
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load my companion & history in parallel
      const [mineRes, historyRes] = await Promise.all([
        companionService.getMyCompanion(),
        companionService.getHistory(25),
      ]);
      setMyCompanion(mineRes);
      setHistory(historyRes);

      // Try loading partner info and partner's companion
      try {
        const partnerRes = await partnerService.getStatus();
        if (partnerRes && partnerRes.status === "CONNECTED" && partnerRes.partner) {
          setHasPartner(true);
          setPartnerName(partnerRes.partner.name || "Partner");
          try {
            const partnerComp = await companionService.getPartnerCompanion();
            setPartnerCompanion(partnerComp);
          } catch (pErr) {
            console.log("No partner companion found yet:", pErr);
            setPartnerCompanion(null);
          }
        } else {
          setHasPartner(false);
          setPartnerCompanion(null);
        }
      } catch {
        setHasPartner(false);
        setPartnerCompanion(null);
      }
    } catch (err: any) {
      console.error("Failed to load companion data:", err);
      setError(err?.response?.data?.message || "Failed to load companion data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Pet / Nurture Companion
  const handleInteract = async () => {
    if (!myCompanion || isInteracting) return;
    try {
      setIsInteracting(true);
      const updated = await companionService.interact();
      setMyCompanion(updated);
      setToastMessage(`✨ You nurtured ${updated.name}! Happiness and bond reinforced.`);

      // Refresh history to include bonding record
      const refreshedHistory = await companionService.getHistory(25);
      setHistory(refreshedHistory);

      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      console.error("Interaction failed:", err);
    } finally {
      setIsInteracting(false);
    }
  };

  // Choose / Customize Companion
  const handleSaveCompanion = async (animalType: AnimalType, name: string) => {
    const updated = await companionService.chooseCompanion({
      animalType,
      name,
    });
    setMyCompanion(updated);
    setToastMessage(`🌟 You have bonded with ${updated.name} the ${updated.animalType}!`);

    // Refresh history
    const refreshedHistory = await companionService.getHistory(25);
    setHistory(refreshedHistory);

    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="min-h-screen pb-16 space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-2xl border border-indigo-500/30 bg-slate-900/95 px-5 py-3 text-sm text-indigo-200 shadow-2xl backdrop-blur-xl animate-slideUp">
          <Sparkles className="h-4 w-4 text-pink-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NILEV Bonded Spirits</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Astral Companion
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-xl">
            Each partner bonds with an independent companion that grows alongside your real habit completions, streaks, and milestone breakthroughs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            className="border-white/10 bg-slate-900/40 text-slate-300 hover:text-white"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {activeTab === "mine" && myCompanion && (
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsModalOpen(true)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              Change Animal
            </Button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs text-red-300 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={loadData} className="text-red-300">
            Retry
          </Button>
        </div>
      )}

      {/* View Switcher Tabs (My Companion vs Partner's Companion) */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab("mine")}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 shrink-0 ${
            activeTab === "mine"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <span>{myCompanion ? myCompanion.animalEmoji : "🐺"}</span>
          <span>My Companion {myCompanion ? `(${myCompanion.name})` : ""}</span>
          <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">
            Level {myCompanion?.level || 1}
          </Badge>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("partner")}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 shrink-0 ${
            activeTab === "partner"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{partnerName}'s Companion</span>
          {partnerCompanion ? (
            <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5 bg-purple-500/20 text-purple-300">
              Level {partnerCompanion.level}
            </Badge>
          ) : (
            <span className="text-[10px] text-slate-500">Read-Only</span>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 h-96 flex flex-col items-center justify-center animate-pulse">
            <div className="w-36 h-36 rounded-full bg-slate-800 mb-4" />
            <div className="w-48 h-6 bg-slate-800 rounded-md mb-2" />
            <div className="w-32 h-4 bg-slate-800 rounded-md" />
          </div>
        </div>
      ) : activeTab === "mine" ? (
        /* MY COMPANION VIEW */
        <div className="space-y-8">
          {myCompanion && (
            <CompanionHeroCard
              companion={myCompanion}
              isPartner={false}
              onInteract={handleInteract}
              onOpenCustomize={() => setIsModalOpen(true)}
              isInteracting={isInteracting}
            />
          )}

          {/* XP & Evolution Lore / Mechanics Card */}
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-6 md:p-7 backdrop-blur-xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-300 flex items-center mb-4">
              <Sparkles className="w-4 h-4 mr-2 text-indigo-400" />
              How Your Companion Gains XP & Evolves
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                <div className="flex items-center space-x-2 text-indigo-300 font-semibold mb-1">
                  <span>🧘</span>
                  <span>Habit Completed</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Each daily check-in grants <strong className="text-emerald-400">+25 XP</strong> to nourish your companion.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                <div className="flex items-center space-x-2 text-amber-300 font-semibold mb-1">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Habit Streak</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Unbroken streaks unlock bonus <strong className="text-amber-300">+50 XP</strong> and elevate your companion's mood.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                <div className="flex items-center space-x-2 text-cyan-300 font-semibold mb-1">
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Goal Milestones</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Reaching 25%, 50%, 75% yields <strong className="text-cyan-300">+50 XP</strong>; completion awards <strong className="text-pink-300">+150 XP</strong>.
                </p>
              </div>

              <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4">
                <div className="flex items-center space-x-2 text-pink-300 font-semibold mb-1">
                  <Heart className="w-3.5 h-3.5 text-pink-400" />
                  <span>Daily Bonding</span>
                </div>
                <p className="text-slate-400 text-[11px]">
                  Nurturing and interacting replenishes energy, restores happiness, and lifts mood.
                </p>
              </div>
            </div>
          </div>

          {/* History Timeline */}
          <CompanionHistoryTimeline
            history={history}
            companionName={myCompanion?.name}
          />
        </div>
      ) : (
        /* PARTNER'S COMPANION VIEW (READ-ONLY) */
        <div className="space-y-8">
          {!hasPartner ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center backdrop-blur-xl max-w-xl mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No Connected Partner Yet</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Connect with your partner to observe their animal spirit flourish alongside yours in real time. Companion data is strictly read-only between partners.
              </p>
              <div className="mt-6">
                <Link to={ROUTES.PARTNER}>
                  <Button variant="default" className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs">
                    <span>Connect with Partner</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ) : partnerCompanion ? (
            <div className="space-y-6">
              {/* Partner View Protection Notice */}
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-center space-x-3 text-xs text-amber-200">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <div>
                  <span className="font-bold">Sacred Individual Bond:</span> You can view {partnerName}'s companion progress, level, and mood, but you cannot edit, rename, or complete actions on their behalf.
                </div>
              </div>

              <CompanionHeroCard
                companion={partnerCompanion}
                isPartner={true}
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-10 text-center backdrop-blur-xl max-w-xl mx-auto">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-bold text-white">{partnerName} has not bonded with a companion yet</h3>
              <p className="mt-2 text-xs text-slate-400">
                Once {partnerName} logs in and chooses their companion, you will see their stats and evolution right here!
              </p>
            </div>
          )}
        </div>
      )}

      {/* Animal Customization Modal */}
      {myCompanion && (
        <ChooseCompanionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          currentAnimal={myCompanion.animalType}
          currentName={myCompanion.name}
          onSave={handleSaveCompanion}
        />
      )}
    </div>
  );
};
