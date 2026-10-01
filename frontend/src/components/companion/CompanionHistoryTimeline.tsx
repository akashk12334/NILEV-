import React from "react";
import type { CompanionHistoryResponse } from "../../types";
import { Badge } from "../ui";
import { History, Trophy, Calendar } from "lucide-react";

export interface CompanionHistoryTimelineProps {
  history: CompanionHistoryResponse[];
  companionName?: string;
}

export const CompanionHistoryTimeline: React.FC<CompanionHistoryTimelineProps> = ({
  history,
  companionName = "Companion",
}) => {
  if (!history || history.length === 0) {
    return (
      <div className="rounded-3xl border border-white/10 bg-slate-900/40 p-8 text-center backdrop-blur-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
          <History className="h-6 w-6" />
        </div>
        <h4 className="text-base font-semibold text-white">No Chronicle Recorded Yet</h4>
        <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
          As you complete daily habits, achieve streaks, and reach goal milestones, {companionName}'s journey will be documented here.
        </p>
      </div>
    );
  }

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const getEventBadge = (type: string, xp: number) => {
    if (xp > 0) {
      return (
        <span className="inline-flex items-center rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/25">
          +{xp} XP
        </span>
      );
    }
    if (type === "LEVEL_UP") {
      return (
        <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-300 border border-amber-500/25">
          <Trophy className="w-3 h-3 mr-1" /> Level Up
        </span>
      );
    }
    if (type === "INTERACTION") {
      return (
        <span className="inline-flex items-center rounded-full bg-pink-500/15 px-2.5 py-0.5 text-xs font-semibold text-pink-300 border border-pink-500/25">
          Bonding
        </span>
      );
    }
    return null;
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-6 md:p-7 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 border border-indigo-500/20">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Companion Journey & Chronicle
            </h3>
            <p className="text-xs text-slate-400">
              Historical record of XP earned from habits, streaks, and milestones
            </p>
          </div>
        </div>

        <Badge variant="secondary" className="text-xs">
          {history.length} Events
        </Badge>
      </div>

      {/* Vertical Timeline */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500/40 before:via-purple-500/20 before:to-transparent">
        {history.map((event) => (
          <div key={event.id} className="relative group">
            {/* Timeline node icon */}
            <div className="absolute -left-6 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border border-indigo-500/40 shadow-sm text-xs group-hover:scale-110 transition-transform">
              <span>{event.icon || "✨"}</span>
            </div>

            {/* Event Content Card */}
            <div className="rounded-2xl border border-white/5 bg-slate-950/40 p-4 transition-all duration-200 hover:border-indigo-500/20 hover:bg-slate-900/60">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <span className="text-sm font-semibold text-white group-hover:text-indigo-200 transition-colors">
                  {event.title}
                </span>
                <div className="flex items-center space-x-2">
                  {getEventBadge(event.eventType, event.xpGained)}
                  <span className="text-[11px] text-slate-500 flex items-center">
                    <Calendar className="w-3 h-3 mr-1" />
                    {formatDate(event.createdAt)}
                  </span>
                </div>
              </div>

              {event.description && (
                <p className="text-xs text-slate-400 mt-1">
                  {event.description}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
