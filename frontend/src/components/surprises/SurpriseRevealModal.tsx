import React, { useState, useEffect } from "react";
import type { SurpriseResponse, SurpriseType } from "../../types";
import { Button, Badge } from "../ui";
import {
  Sparkles,
  Heart,
  CheckCircle2,
  X,
} from "lucide-react";

export interface SurpriseRevealModalProps {
  surprise: SurpriseResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenSurprise: (id: number) => Promise<SurpriseResponse>;
}

const TYPE_THEMES: Record<
  SurpriseType,
  {
    bgGradient: string;
    borderGlow: string;
    accentColor: string;
    icon: string;
    tagline: string;
  }
> = {
  MESSAGE: {
    bgGradient: "from-pink-950/70 via-slate-900/90 to-purple-950/60",
    borderGlow: "rgba(244, 114, 182, 0.4)",
    accentColor: "#f472b6",
    icon: "💌",
    tagline: "A secret love letter whispered from the heart",
  },
  IMAGE: {
    bgGradient: "from-indigo-950/70 via-slate-900/90 to-cyan-950/60",
    borderGlow: "rgba(99, 102, 241, 0.4)",
    accentColor: "#818cf8",
    icon: "📸",
    tagline: "A captured visual memory frozen in cosmic time",
  },
  CHALLENGE: {
    bgGradient: "from-amber-950/70 via-slate-900/90 to-rose-950/60",
    borderGlow: "rgba(251, 146, 60, 0.4)",
    accentColor: "#fb923c",
    icon: "⚡",
    tagline: "A playful couples quest awaiting your courage",
  },
  REWARD: {
    bgGradient: "from-emerald-950/70 via-slate-900/90 to-teal-950/60",
    borderGlow: "rgba(52, 211, 153, 0.4)",
    accentColor: "#34d399",
    icon: "🎟️",
    tagline: "A sacred privilege pass redeemable any time",
  },
  MEMORY: {
    bgGradient: "from-purple-950/70 via-slate-900/90 to-indigo-950/60",
    borderGlow: "rgba(168, 85, 247, 0.4)",
    accentColor: "#c084fc",
    icon: "💫",
    tagline: "A nostalgic memory milestone to cherish together",
  },
  CUSTOM: {
    bgGradient: "from-cyan-950/70 via-slate-900/90 to-fuchsia-950/60",
    borderGlow: "rgba(6, 182, 212, 0.4)",
    accentColor: "#38bdf8",
    icon: "🎁",
    tagline: "A bespoke wonder created exclusively for you",
  },
};

export const SurpriseRevealModal: React.FC<SurpriseRevealModalProps> = ({
  surprise,
  isOpen,
  onClose,
  onOpenSurprise,
}) => {
  const [stage, setStage] = useState<"sealed" | "revealing" | "unsealed">("sealed");
  const [currentSurprise, setCurrentSurprise] = useState<SurpriseResponse | null>(surprise);
  const [isOpening, setIsOpening] = useState<boolean>(false);
  const [reacted, setReacted] = useState<boolean>(false);

  useEffect(() => {
    setCurrentSurprise(surprise);
    if (surprise) {
      if (surprise.status === "OPENED") {
        setStage("unsealed");
      } else {
        setStage("sealed");
      }
    }
    setReacted(false);
  }, [surprise, isOpen]);

  if (!isOpen || !currentSurprise) return null;

  const theme = TYPE_THEMES[currentSurprise.type] || TYPE_THEMES.MESSAGE;

  const handleReveal = async () => {
    if (isOpening) return;
    try {
      setIsOpening(true);
      setStage("revealing");

      // Smooth reveal delay for cinematic particle effect
      setTimeout(async () => {
        try {
          const updated = await onOpenSurprise(currentSurprise.id);
          setCurrentSurprise(updated);
          setStage("unsealed");
        } catch (err) {
          console.error("Failed to unseal surprise:", err);
          setStage("sealed");
        } finally {
          setIsOpening(false);
        }
      }, 1000);
    } catch {
      setIsOpening(false);
      setStage("sealed");
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Modal Container */}
      <div
        className={`relative w-full max-w-xl overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b ${theme.bgGradient} p-6 sm:p-8 shadow-2xl backdrop-blur-2xl transition-all duration-500`}
        style={{
          boxShadow: `0 25px 60px -15px ${theme.borderGlow}`,
        }}
      >
        {/* Ambient Top Glow */}
        <div
          className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full blur-3xl opacity-35"
          style={{ background: theme.accentColor }}
        />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 z-20 rounded-full p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* ── STAGE 1: SEALED (BEFORE OPENING) ────────────────── */}
        {stage === "sealed" && (
          <div className="relative z-10 flex flex-col items-center text-center py-6 space-y-6">
            {/* Sealed Cosmic Capsule Artwork */}
            <div className="relative flex items-center justify-center w-36 h-36">
              {/* Outer pulsing ring */}
              <div
                className="absolute inset-0 rounded-full blur-xl animate-aura-pulse"
                style={{ background: theme.borderGlow }}
              />

              {/* Orbital ring */}
              <div className="absolute inset-2 rounded-full border border-dashed border-white/20 animate-seal-spin" />

              {/* Center Mystery Box */}
              <div className="relative z-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-900/80 border border-white/20 shadow-2xl animate-companion-float">
                <span className="text-4xl select-none">🎁</span>

                {/* Sparkling dots */}
                <span className="absolute -top-1 -right-1 text-sm animate-sparkle">✨</span>
                <span className="absolute -bottom-1 -left-1 text-xs animate-sparkle text-pink-300">💖</span>
              </div>
            </div>

            {/* Mystery Headline */}
            <div>
              <div className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 border border-white/15 mb-3">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span>Private Delivery</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight drop-shadow-md">
                Someone has a surprise for you ✨
              </h2>

              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                A private token of affection crafted by{" "}
                <strong className="text-white">{currentSurprise.senderName}</strong> for your eyes only.
              </p>
            </div>

            {/* Type Hint Badge */}
            <div className="flex items-center space-x-2 rounded-2xl bg-slate-900/60 border border-white/10 px-4 py-2 text-xs text-slate-300">
              <span className="text-base">{theme.icon}</span>
              <span className="font-semibold">{currentSurprise.typeDisplayName}</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 italic">"{theme.tagline}"</span>
            </div>

            {/* Unseal CTA */}
            <div className="pt-2 w-full max-w-xs">
              <Button
                onClick={handleReveal}
                disabled={isOpening}
                className="w-full relative overflow-hidden bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-2xl shadow-xl shadow-pink-600/30 transition-all duration-300 active:scale-95 text-sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Break the Seal & Reveal ✨</span>
              </Button>
            </div>
          </div>
        )}

        {/* ── STAGE 2: REVEALING ANIMATION ───────────────────── */}
        {stage === "revealing" && (
          <div className="relative z-10 flex flex-col items-center text-center py-16 space-y-6">
            <div className="relative flex items-center justify-center w-36 h-36">
              <div
                className="absolute inset-0 rounded-full blur-2xl animate-ping"
                style={{ background: theme.accentColor }}
              />
              <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-slate-900 border-2 border-white/40 shadow-2xl scale-110 transition-transform">
                <span className="text-5xl animate-spin">🌟</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white tracking-tight animate-pulse">
                Unsealing Celestial Wonder...
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Preparing your private moment ✨
              </p>
            </div>
          </div>
        )}

        {/* ── STAGE 3: UNSEALED / REVEALED ─────────────────────── */}
        {stage === "unsealed" && (
          <div className="relative z-10 space-y-5 animate-reveal-burst">
            {/* Header info */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center space-x-2.5">
                <span className="text-2xl">{theme.icon}</span>
                <div>
                  <Badge variant="indigo" className="text-[11px] font-bold tracking-wider uppercase">
                    {currentSurprise.typeDisplayName}
                  </Badge>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    From <strong className="text-slate-200">{currentSurprise.senderName}</strong>
                    {currentSurprise.openedAt && (
                      <span> • Unsealed {formatDate(currentSurprise.openedAt)}</span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-3 py-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Unsealed</span>
              </div>
            </div>

            {/* Surprise Title */}
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {currentSurprise.title}
              </h2>
            </div>

            {/* Secret Content Card */}
            <div className="rounded-2xl border border-white/15 bg-slate-900/80 p-5 sm:p-6 backdrop-blur-xl shadow-inner">
              <p className="text-sm sm:text-base text-slate-100 whitespace-pre-wrap leading-relaxed font-sans">
                {currentSurprise.content}
              </p>

              {/* Media Preview (if image provided) */}
              {currentSurprise.mediaUrl && (
                <div className="mt-4 rounded-xl overflow-hidden border border-white/10 bg-slate-950/60 max-h-64 flex items-center justify-center">
                  <img
                    src={currentSurprise.mediaUrl}
                    alt={currentSurprise.title}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <Button
                variant={reacted ? "secondary" : "default"}
                size="sm"
                onClick={() => setReacted(true)}
                className={`text-xs ${
                  reacted
                    ? "bg-pink-500/20 text-pink-300 border-pink-500/30"
                    : "bg-white/10 hover:bg-white/20 text-white"
                }`}
              >
                <Heart className={`w-3.5 h-3.5 mr-1.5 ${reacted ? "fill-pink-400 text-pink-400" : ""}`} />
                {reacted ? "Heart Sent! 💖" : "Send Love Reaction"}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white"
              >
                Close & Cherish
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
