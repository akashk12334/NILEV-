import React, { useState } from "react";
import type { CompanionResponse } from "../../types";
import { AnimalArtwork, ANIMAL_DETAILS } from "./AnimalArtwork";
import { Badge, Button, ProgressBar } from "../ui";
import {
  Sparkles,
  Heart,
  Zap,
  Edit3,
  ShieldCheck,
  TrendingUp,
  Smile,
  Lock,
} from "lucide-react";

export interface CompanionHeroCardProps {
  companion: CompanionResponse;
  isPartner?: boolean;
  onInteract?: () => Promise<void> | void;
  onOpenCustomize?: () => void;
  isInteracting?: boolean;
}

export const CompanionHeroCard: React.FC<CompanionHeroCardProps> = ({
  companion,
  isPartner = false,
  onInteract,
  onOpenCustomize,
  isInteracting = false,
}) => {
  const [petAnimation, setPetAnimation] = useState(false);
  const animalMeta = ANIMAL_DETAILS[companion.animalType] || ANIMAL_DETAILS.WOLF;

  const dailyRemaining = companion.dailyInteractionsRemaining !== undefined
    ? companion.dailyInteractionsRemaining
    : 5;
  const isLimitReached = dailyRemaining <= 0;

  const handleBondClick = async () => {
    if (isPartner || isInteracting || !onInteract || isLimitReached) return;
    setPetAnimation(true);
    try {
      await onInteract();
    } finally {
      setTimeout(() => setPetAnimation(false), 1200);
    }
  };

  // Color coding for mood badges
  const getMoodBadgeVariant = (mood: string): "success" | "indigo" | "violet" | "secondary" => {
    switch (mood) {
      case "ECSTATIC":
      case "EXCITED":
        return "success";
      case "HAPPY":
      case "PROUD":
      case "CONTENT":
        return "indigo";
      case "RESTING":
        return "violet";
      default:
        return "secondary";
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-gradient-to-b from-slate-900/95 via-indigo-950/40 to-slate-950 p-6 md:p-8 backdrop-blur-2xl shadow-2xl transition-all duration-300">
      {/* Background Ambient Glows */}
      <div
        className="pointer-events-none absolute -top-32 -left-32 w-80 h-80 rounded-full blur-3xl opacity-30"
        style={{ background: animalMeta.primaryGlow }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -right-32 w-80 h-80 rounded-full blur-3xl opacity-20"
        style={{ background: animalMeta.secondaryGlow }}
      />

      {/* Floating Heart / Sparkle Particles on Pet */}
      {petAnimation && (
        <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center overflow-hidden">
          <span className="text-4xl animate-bounce">💖</span>
          <span className="absolute text-2xl -top-10 left-1/3 animate-ping">✨</span>
          <span className="absolute text-3xl bottom-1/4 right-1/3 animate-pulse">💕</span>
        </div>
      )}

      {/* Top Header Controls */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
        <div className="flex items-center space-x-2.5">
          <Badge variant="indigo" className="px-3 py-1 font-semibold text-xs tracking-wider">
            {animalMeta.emoji} {companion.animalType}
          </Badge>
          <Badge variant="secondary" className="px-3 py-1 font-bold text-xs bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
            LEVEL {companion.level}
          </Badge>
          {isPartner ? (
            <Badge variant="amber" className="px-2.5 py-0.5 text-xs flex items-center space-x-1 bg-amber-500/10 text-amber-300 border-amber-500/30">
              <Lock className="w-3 h-3 mr-1" />
              <span>Partner's Companion</span>
            </Badge>
          ) : (
            <Badge variant="success" className="px-2.5 py-0.5 text-xs flex items-center space-x-1 bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
              <ShieldCheck className="w-3 h-3 mr-1" />
              <span>Your Companion</span>
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Mood Badge */}
          <Badge variant={getMoodBadgeVariant(companion.mood)} className="px-3 py-1 text-xs font-medium">
            <span className="mr-1.5">{companion.moodEmoji}</span>
            <span>{companion.mood}</span>
          </Badge>

          {/* Edit / Customize Trigger (Owner Only) */}
          {!isPartner && onOpenCustomize && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenCustomize}
              className="text-xs border-white/15 bg-white/5 hover:bg-white/10 text-slate-200"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1 text-indigo-400" />
              <span>Customize</span>
            </Button>
          )}
        </div>
      </div>

      {/* Main Hero Showcase */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-6">
        {/* Left Column: Stylized Artwork Pedestal */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          <AnimalArtwork animalType={companion.animalType} size="hero" animate={true} />

          {/* Owner / Lore Subtext */}
          <div className="mt-4 text-center">
            <p className="text-xs uppercase tracking-widest text-indigo-300/80 font-mono font-medium">
              {animalMeta.title}
            </p>
            <p className="mt-1 text-xs text-slate-400 max-w-xs italic line-clamp-2">
              "{animalMeta.lore}"
            </p>
          </div>
        </div>

        {/* Right Column: Name, Stats, XP & Vital Meters */}
        <div className="lg:col-span-7 flex flex-col space-y-6">
          {/* Name & Titles */}
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md">
                {companion.name}
              </h1>
              <span className="text-2xl" title={companion.animalType}>
                {companion.animalEmoji}
              </span>
            </div>
            <p className="text-sm text-slate-300 mt-1">
              {isPartner
                ? `Cherished companion of ${companion.userName}`
                : "Your personal astral companion evolving with your daily actions"}
            </p>
          </div>

          {/* XP Progress Card */}
          <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs mb-2 font-medium">
              <span className="flex items-center text-indigo-300">
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                Level {companion.level} Experience
              </span>
              <span className="text-slate-300 font-mono">
                {companion.levelProgressXp} / {companion.levelTargetXp} XP ({companion.levelProgressPercentage}%)
              </span>
            </div>

            <ProgressBar
              value={companion.levelProgressPercentage}
              max={100}
              variant="indigo"
              size="md"
              className="h-3 rounded-full overflow-hidden bg-slate-800"
            />

            <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
              <span>Total Lifetime: <strong className="text-slate-200">{companion.xp} XP</strong></span>
              <span className="text-indigo-400 font-medium">
                {companion.levelTargetXp - companion.levelProgressXp} XP to Level {companion.level + 1}
              </span>
            </div>
          </div>

          {/* Vitals Grid: Happiness, Energy & Current Mood */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Happiness Metric */}
            <div className="rounded-2xl border border-pink-500/20 bg-pink-950/20 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center text-pink-300 font-medium">
                  <Heart className="w-4 h-4 mr-1.5 text-pink-400 fill-pink-400" />
                  Happiness
                </span>
                <span className="font-bold text-pink-200 font-mono">
                  {companion.happiness}%
                </span>
              </div>
              <div className="w-full bg-pink-950/50 rounded-full h-2 overflow-hidden border border-pink-500/20">
                <div
                  className="h-full bg-gradient-to-r from-pink-500 to-rose-400 transition-all duration-700"
                  style={{ width: `${companion.happiness}%` }}
                />
              </div>
              <span className="text-[10px] text-pink-300/70 mt-1.5">
                {companion.happiness >= 80 ? "Feeling deeply cherished" : "Could use a gentle bond"}
              </span>
            </div>

            {/* Energy Metric */}
            <div className="rounded-2xl border border-cyan-500/20 bg-cyan-950/20 p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="flex items-center text-cyan-300 font-medium">
                  <Zap className="w-4 h-4 mr-1.5 text-cyan-400 fill-cyan-400" />
                  Energy
                </span>
                <span className="font-bold text-cyan-200 font-mono">
                  {companion.energy}%
                </span>
              </div>
              <div className="w-full bg-cyan-950/50 rounded-full h-2 overflow-hidden border border-cyan-500/20">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-400 transition-all duration-700"
                  style={{ width: `${companion.energy}%` }}
                />
              </div>
              <span className="text-[10px] text-cyan-300/70 mt-1.5">
                {companion.energy >= 70 ? "Vibrant and alert" : "Recharging gently"}
              </span>
            </div>
          </div>

          {/* Mood Activity Influence Banner */}
          <div className="flex items-start space-x-3 rounded-2xl border border-indigo-500/15 bg-indigo-950/30 p-3.5 text-xs text-slate-300">
            <span className="text-xl shrink-0 mt-0.5">{companion.moodEmoji}</span>
            <div>
              <p className="font-semibold text-indigo-200">
                Current State: {companion.mood}
              </p>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {companion.moodDescription}
              </p>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="pt-2">
            {!isPartner ? (
              <div className="flex flex-col space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={handleBondClick}
                    disabled={isInteracting || isLimitReached}
                    className={`relative overflow-hidden font-semibold shadow-lg px-6 py-2.5 rounded-xl transition-all duration-300 active:scale-95 ${
                      isLimitReached
                        ? "bg-slate-800 text-slate-400 border border-white/10 cursor-not-allowed opacity-75"
                        : "bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white shadow-indigo-600/30"
                    }`}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    {isInteracting
                      ? "Bonding..."
                      : isLimitReached
                      ? "Daily Limit Reached (5/5) ✨"
                      : `Nurture & Bond with ${companion.name}`}
                  </Button>

                  <span
                    className={`text-xs font-mono px-3 py-1.5 rounded-xl border ${
                      isLimitReached
                        ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-300"
                        : "bg-indigo-950/60 border-indigo-500/30 text-indigo-300"
                    }`}
                  >
                    {isLimitReached
                      ? "All 5 daily bonds completed ✨"
                      : `${dailyRemaining}/5 daily bonds left (+5 XP)`}
                  </span>
                </div>

                <span className="text-xs text-slate-400 flex items-center pt-0.5">
                  <Smile className="w-3.5 h-3.5 mr-1 text-pink-400" />
                  {isLimitReached
                    ? `${companion.name} is deeply cherished today! Complete habits with your partner (+15 XP each) to level up further.`
                    : "Affection boosts mood & happiness (+5 XP per bond, 5 max daily)"}
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 border border-white/5 rounded-xl px-4 py-2.5">
                <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>
                  Partner's companion is read-only. Companions respond exclusively to their owner's personal progress.
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
