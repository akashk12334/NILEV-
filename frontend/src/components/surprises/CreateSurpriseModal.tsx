import React, { useState, useEffect } from "react";
import type { SurpriseType, CreateSurpriseRequest } from "../../types";
import { Modal, Button, Input } from "../ui";
import {
  Clock,
  Save,
  Send,
} from "lucide-react";

export interface CreateSurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CreateSurpriseRequest, isDraft: boolean) => Promise<void>;
  partnerName?: string;
}

const SURPRISE_TYPES: {
  type: SurpriseType;
  label: string;
  emoji: string;
  desc: string;
}[] = [
  { type: "MESSAGE", label: "Secret Message", emoji: "💌", desc: "Heartfelt note or personal words of love" },
  { type: "REWARD", label: "Couples Reward", emoji: "🎟️", desc: "Special coupon, privilege, breakfast in bed" },
  { type: "CHALLENGE", label: "Playful Quest", emoji: "⚡", desc: "Fun spontaneous dare or mini adventure" },
  { type: "MEMORY", label: "Shared Memory", emoji: "💫", desc: "Recalling a cherished milestone together" },
  { type: "IMAGE", label: "Visual Tribute", emoji: "📸", desc: "Photo link or visual memory capture" },
  { type: "CUSTOM", label: "Custom Wonder", emoji: "🎁", desc: "Bespoke personalized surprise" },
];

const SUGGESTIONS: Record<SurpriseType, string[]> = {
  MESSAGE: ["Midnight Starlight Note 💌", "Why I Appreciate You Today 💖", "A Secret Confession ✨"],
  REWARD: ["Good for 1 Back Massage 💆‍♂️", "Breakfast in Bed with Matcha 🥞", "Movie Night Pick Without Veto 🎬"],
  CHALLENGE: ["Sunset No-Phone Walk Dare ⚡", "Blindfolded Dessert Taste Test 🍓", "Cook Dinner from Scratch Together 🍝"],
  MEMORY: ["The Rainy Afternoon in Shinjuku 🌧️", "Our First Road Trip Stargazing 🌌", "The Day We First Cooked Together 🍳"],
  IMAGE: ["A Snapshot from Our Favorite Trip 📸", "Our First Photo Together 🌅", "Something That Made Me Think of You 🌿"],
  CUSTOM: ["A Little Token Just Because 🎁", "Pack a Weekend Bag for Friday ✈️", "Secret Evening Coordinates 🗺️"],
};

export const CreateSurpriseModal: React.FC<CreateSurpriseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  partnerName = "Partner",
}) => {
  const [selectedType, setSelectedType] = useState<SurpriseType>("MESSAGE");
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState<string>("");
  const [isScheduled, setIsScheduled] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setContent("");
      setMediaUrl("");
      setIsScheduled(false);
      setScheduledDate("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = async (isDraft: boolean) => {
    if (!title.trim()) {
      setError("Please provide a title for the surprise.");
      return;
    }
    if (!content.trim()) {
      setError("Please write the secret content or message.");
      return;
    }
    if (isScheduled && !scheduledDate) {
      setError("Please select a date and time for scheduled delivery.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const payload: CreateSurpriseRequest = {
        type: selectedType,
        title: title.trim(),
        content: content.trim(),
        mediaUrl: mediaUrl.trim() ? mediaUrl.trim() : null,
        scheduledAt: isScheduled && scheduledDate ? scheduledDate : null,
        isDraft,
      };

      await onSave(payload, isDraft);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create surprise.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Craft a Private Surprise"
      description={`Send a spontaneous token of affection, time-locked note, or fun dare to ${partnerName}.`}
      size="xl"
    >
      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(false); }} className="space-y-6 pt-2">
        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
            {error}
          </div>
        )}

        {/* 1. Surprise Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
            Select Wonder Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {SURPRISE_TYPES.map((t) => {
              const isSelected = selectedType === t.type;
              return (
                <button
                  key={t.type}
                  type="button"
                  onClick={() => setSelectedType(t.type)}
                  className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all duration-200 ${
                    isSelected
                      ? "border-pink-500/60 bg-pink-950/40 ring-1 ring-pink-500/50 shadow-md shadow-pink-500/10"
                      : "border-white/10 bg-slate-900/40 hover:bg-slate-800/50 hover:border-white/20"
                  }`}
                >
                  <span className="text-xl mb-1">{t.emoji}</span>
                  <span className="text-xs font-bold text-white">{t.label}</span>
                  <span className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {t.desc}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Title & Inspiration Chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Surprise Title
            </label>
            <span className="text-[11px] text-slate-400">
              {title.length}/150
            </span>
          </div>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Midnight Starlight Note, Golden Soufflé Pass..."
            maxLength={150}
            required
            className="bg-slate-900/90 border-slate-700 text-white placeholder-slate-500"
          />

          {/* Inspiration Chips */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] text-slate-400 font-medium">Ideas:</span>
            {SUGGESTIONS[selectedType].map((sug) => (
              <button
                key={sug}
                type="button"
                onClick={() => setTitle(sug)}
                className="rounded-full bg-white/5 border border-white/10 px-2.5 py-0.5 text-[10px] text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Content Textarea */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Secret Message / Instructions
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your secret words, dare rules, or coupon terms. This remains completely sealed until your partner opens it..."
            rows={4}
            required
            className="w-full rounded-2xl border border-slate-700 bg-slate-900/90 p-3.5 text-xs text-white placeholder-slate-500 focus:border-pink-500 focus:outline-none focus:ring-1 focus:ring-pink-500 transition-colors"
          />
        </div>

        {/* 4. Media URL (Optional) */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Image / Media URL <span className="text-slate-500 font-normal lowercase">(optional)</span>
          </label>
          <Input
            value={mediaUrl}
            onChange={(e) => setMediaUrl(e.target.value)}
            placeholder="https://example.com/photo.jpg"
            maxLength={500}
            className="bg-slate-900/90 border-slate-700 text-white placeholder-slate-500"
          />
        </div>

        {/* 5. Schedule Delivery Options */}
        <div className="rounded-2xl border border-white/10 bg-slate-900/40 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-white">Time-Locked Delivery</span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isScheduled}
                onChange={(e) => setIsScheduled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-600"></div>
            </label>
          </div>

          <p className="text-[11px] text-slate-400">
            {isScheduled
              ? "Your partner will see a mystery locked capsule that cannot be opened until the designated time."
              : "Delivered immediately upon sending so your partner can unseal it whenever they are ready."}
          </p>

          {isScheduled && (
            <div className="pt-2">
              <input
                type="datetime-local"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 p-2.5 text-xs text-white focus:border-amber-500 focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* 6. Action Buttons */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/10">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-white text-xs"
          >
            Cancel
          </Button>

          <div className="flex items-center space-x-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="border-white/10 bg-slate-800/40 text-slate-300 hover:text-white text-xs"
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              <span>Save Draft</span>
            </Button>

            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-semibold text-xs shadow-md shadow-pink-600/20"
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              <span>{isScheduled ? "Schedule Surprise ⏰" : "Send Surprise ✨"}</span>
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
