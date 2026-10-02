import React, { useState, useEffect, useCallback } from "react";
import { surpriseService } from "../services/surprise.service";
import { partnerService } from "../services/partner.service";
import type {
  SurpriseResponse,
  CreateSurpriseRequest,
} from "../types";
import {
  SurpriseCard,
  SurpriseRevealModal,
  CreateSurpriseModal,
} from "../components/surprises";
import { Button, Badge, ConfirmDialog } from "../components/ui";
import {
  Sparkles,
  Gift,
  Send,
  Clock,
  Inbox,
  RefreshCw,
  Plus,
  AlertCircle,
  Users,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { ROUTES } from "../constants";

type SurpriseTab = "received" | "sent" | "scheduled";

export const SurprisesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SurpriseTab>("received");
  const [receivedSurprises, setReceivedSurprises] = useState<SurpriseResponse[]>([]);
  const [sentSurprises, setSentSurprises] = useState<SurpriseResponse[]>([]);
  const [scheduledSurprises, setScheduledSurprises] = useState<SurpriseResponse[]>([]);

  const [hasPartner, setHasPartner] = useState<boolean>(true);
  const [partnerName, setPartnerName] = useState<string>("Partner");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState<boolean>(false);
  const [activeRevealSurprise, setActiveRevealSurprise] = useState<SurpriseResponse | null>(null);
  const [isRevealOpen, setIsRevealOpen] = useState<boolean>(false);
  const [deleteSurpriseId, setDeleteSurpriseId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check partner connection
      try {
        const partnerRes = await partnerService.getStatus();
        if (partnerRes && partnerRes.status === "CONNECTED" && partnerRes.partner) {
          setHasPartner(true);
          setPartnerName(partnerRes.partner.name || "Partner");
        } else {
          setHasPartner(false);
        }
      } catch {
        setHasPartner(false);
      }

      // Load all 3 sections in parallel
      const [recRes, sentRes, schRes] = await Promise.all([
        surpriseService.getReceivedSurprises(),
        surpriseService.getSentSurprises(),
        surpriseService.getScheduledSurprises(),
      ]);

      setReceivedSurprises(recRes);
      setSentSurprises(sentRes);
      setScheduledSurprises(schRes);
    } catch (err: any) {
      console.error("Failed to load surprises:", err);
      setError(err?.response?.data?.message || "Failed to load surprises. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open / Unseal Surprise Handler
  const handleOpenSurprise = async (surpriseId: number): Promise<SurpriseResponse> => {
    const updated = await surpriseService.openSurprise(surpriseId);

    // Update local state
    setReceivedSurprises((prev) =>
      prev.map((s) => (s.id === surpriseId ? updated : s))
    );
    setToastMessage(`✨ Wonder unsealed! Cherish this moment together.`);
    setTimeout(() => setToastMessage(null), 3500);

    return updated;
  };

  // Create Surprise Handler
  const handleSaveSurprise = async (data: CreateSurpriseRequest, isDraft: boolean) => {
    const created = await surpriseService.createSurprise(data);
    if (isDraft) {
      setSentSurprises((prev) => [created, ...prev]);
      setToastMessage("📝 Surprise saved to drafts.");
    } else if (created.status === "SCHEDULED") {
      setScheduledSurprises((prev) => [created, ...prev]);
      setToastMessage("⏰ Surprise scheduled for future delivery!");
    } else {
      setSentSurprises((prev) => [created, ...prev]);
      setToastMessage("💌 Surprise dispatched to your partner!");
    }
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Dispatch Draft Handler
  const handleSendDraft = async (id: number) => {
    try {
      const dispatched = await surpriseService.sendDraft(id);
      setSentSurprises((prev) =>
        prev.map((s) => (s.id === id ? dispatched : s))
      );
      setToastMessage("💌 Draft dispatched to your partner!");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to dispatch draft.");
    }
  };

  // Delete Surprise Handler
  const confirmDelete = async () => {
    if (!deleteSurpriseId) return;
    try {
      await surpriseService.deleteSurprise(deleteSurpriseId);
      setSentSurprises((prev) => prev.filter((s) => s.id !== deleteSurpriseId));
      setScheduledSurprises((prev) => prev.filter((s) => s.id !== deleteSurpriseId));
      setToastMessage("Surprise deleted.");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to delete surprise.");
    } finally {
      setDeleteSurpriseId(null);
    }
  };

  // Trigger reveal modal
  const handleTriggerReveal = (s: SurpriseResponse) => {
    setActiveRevealSurprise(s);
    setIsRevealOpen(true);
  };

  // Count unsealed received surprises
  const unopenedCount = receivedSurprises.filter((s) => s.status === "DELIVERED").length;

  return (
    <div className="min-h-screen pb-16 space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center space-x-3 rounded-2xl border border-pink-500/30 bg-slate-900/95 px-5 py-3 text-sm text-pink-200 shadow-2xl backdrop-blur-xl animate-slideUp">
          <Sparkles className="h-4 w-4 text-pink-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-widest text-pink-400 mb-1">
            <Gift className="w-3.5 h-3.5" />
            <span>Private Couple Vault</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
            Surprise Sanctuaries
          </h1>
          <p className="mt-1 text-sm text-slate-400 max-w-xl">
            Send spontaneous tokens of affection, time-locked love letters, and playful quests to {partnerName}.
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 sm:gap-3">
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

          <Button
            variant="default"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-medium shadow-lg shadow-pink-600/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            <span>Create Surprise</span>
          </Button>
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

      {/* Partner Warning if not connected */}
      {!hasPartner && (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-200">
          <div className="flex items-center space-x-2.5">
            <Users className="w-4 h-4 text-amber-400 shrink-0" />
            <span>
              Connect with your partner in order to exchange private surprises and time-locked moments.
            </span>
          </div>
          <Link to={ROUTES.PARTNER}>
            <Button size="sm" variant="default" className="bg-amber-600 hover:bg-amber-500 text-white text-xs">
              <span>Connect</span>
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          </Link>
        </div>
      )}

      {/* Section Navigation Tabs (Received, Sent, Scheduled) */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-2 overflow-x-auto scrollbar-none">
        {/* RECEIVED TAB */}
        <button
          type="button"
          onClick={() => setActiveTab("received")}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 shrink-0 ${
            activeTab === "received"
              ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Inbox className="w-3.5 h-3.5" />
          <span>Received</span>
          <Badge
            variant="secondary"
            className={`ml-1 text-[10px] py-0 px-1.5 ${
              unopenedCount > 0 ? "bg-pink-500 text-white font-bold animate-pulse" : ""
            }`}
          >
            {receivedSurprises.length}
          </Badge>
        </button>

        {/* SENT TAB */}
        <button
          type="button"
          onClick={() => setActiveTab("sent")}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 shrink-0 ${
            activeTab === "sent"
              ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Send className="w-3.5 h-3.5" />
          <span>Sent</span>
          <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">
            {sentSurprises.length}
          </Badge>
        </button>

        {/* SCHEDULED TAB */}
        <button
          type="button"
          onClick={() => setActiveTab("scheduled")}
          className={`flex items-center space-x-2 px-4 sm:px-5 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all duration-200 shrink-0 ${
            activeTab === "scheduled"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Scheduled</span>
          <Badge variant="secondary" className="ml-1 text-[10px] py-0 px-1.5">
            {scheduledSurprises.length}
          </Badge>
        </button>
      </div>

      {/* Main Content Grid Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-56 rounded-3xl border border-white/10 bg-slate-900/60 p-6 animate-pulse"
            />
          ))}
        </div>
      ) : activeTab === "received" ? (
        /* ── RECEIVED SECTION ────────────────────────────────── */
        receivedSurprises.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center backdrop-blur-xl max-w-lg mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/10 border border-pink-500/20 text-pink-400 mb-4">
              <Gift className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-white">No Received Surprises Yet</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              When {partnerName} crafts a surprise note, coupon, or quest for you, it will arrive here in a sealed capsule!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Unopened Delivered Surprises Header Notice */}
            {unopenedCount > 0 && (
              <div className="rounded-2xl border border-pink-500/30 bg-gradient-to-r from-pink-950/40 to-purple-950/40 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-pink-200">
                <div className="flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-pink-400 animate-sparkle" />
                  <span>
                    You have <strong className="text-white">{unopenedCount} unopened surprise{unopenedCount > 1 ? "s" : ""}</strong> waiting for you!
                  </span>
                </div>
                <Badge variant="indigo" className="bg-pink-500 text-white font-bold">
                  Ready to Unseal
                </Badge>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {receivedSurprises.map((s) => (
                <SurpriseCard
                  key={s.id}
                  surprise={s}
                  onOpen={handleTriggerReveal}
                />
              ))}
            </div>
          </div>
        )
      ) : activeTab === "sent" ? (
        /* ── SENT SECTION ────────────────────────────────────── */
        sentSurprises.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center backdrop-blur-xl max-w-lg mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 mb-4">
              <Send className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-white">You Haven't Sent Any Surprises</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Brighten {partnerName}'s day with a heartfelt message, couples reward coupon, or nostalgic photo!
            </p>
            <div className="mt-5">
              <Button
                variant="default"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                <span>Craft Your First Surprise</span>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sentSurprises.map((s) => (
              <SurpriseCard
                key={s.id}
                surprise={s}
                onOpen={handleTriggerReveal}
                onDelete={(id) => setDeleteSurpriseId(id)}
                onSendDraft={handleSendDraft}
              />
            ))}
          </div>
        )
      ) : (
        /* ── SCHEDULED SECTION ───────────────────────────────── */
        scheduledSurprises.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-12 text-center backdrop-blur-xl max-w-lg mx-auto">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-4">
              <Clock className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-white">No Scheduled Surprises</h3>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed">
              Plan ahead for anniversaries, birthdays, or weekend getaways with time-locked surprises that reveal automatically.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {scheduledSurprises.map((s) => (
              <SurpriseCard
                key={s.id}
                surprise={s}
                onOpen={handleTriggerReveal}
                onDelete={(id) => setDeleteSurpriseId(id)}
              />
            ))}
          </div>
        )
      )}

      {/* Create Surprise Modal */}
      <CreateSurpriseModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveSurprise}
        partnerName={partnerName}
      />

      {/* Premium Reveal Modal */}
      <SurpriseRevealModal
        surprise={activeRevealSurprise}
        isOpen={isRevealOpen}
        onClose={() => {
          setIsRevealOpen(false);
          setActiveRevealSurprise(null);
        }}
        onOpenSurprise={handleOpenSurprise}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteSurpriseId !== null}
        onClose={() => setDeleteSurpriseId(null)}
        onConfirm={confirmDelete}
        title="Delete Surprise"
        message="Are you sure you want to delete this surprise? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
    </div>
  );
};
