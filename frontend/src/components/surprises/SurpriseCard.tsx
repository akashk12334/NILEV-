import React from "react";
import type { SurpriseResponse } from "../../types";
import { Badge, Button } from "../ui";
import {
  Sparkles,
  Gift,
  CheckCircle2,
  Clock,
  Send,
  Edit3,
  Trash2,
  Eye,
} from "lucide-react";

export interface SurpriseCardProps {
  surprise: SurpriseResponse;
  onOpen: (surprise: SurpriseResponse) => void;
  onEdit?: (surprise: SurpriseResponse) => void;
  onDelete?: (id: number) => void;
  onSendDraft?: (id: number) => void;
}

export const SurpriseCard: React.FC<SurpriseCardProps> = ({
  surprise,
  onOpen,
  onEdit,
  onDelete,
  onSendDraft,
}) => {
  const isUnopenedDelivered = surprise.status === "DELIVERED" && surprise.isReceiver;
  const isScheduled = surprise.status === "SCHEDULED";
  const isOpened = surprise.status === "OPENED";
  const isDraft = surprise.status === "DRAFT";

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

  const getStatusBadge = () => {
    switch (surprise.status) {
      case "OPENED":
        return (
          <Badge variant="success" className="text-[10px] py-0 px-2">
            <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> Opened
          </Badge>
        );
      case "DELIVERED":
        return (
          <Badge variant="indigo" className="text-[10px] py-0 px-2 bg-indigo-500/20 text-indigo-300">
            <Sparkles className="w-2.5 h-2.5 mr-1 text-pink-400" /> Delivered
          </Badge>
        );
      case "SCHEDULED":
        return (
          <Badge variant="amber" className="text-[10px] py-0 px-2 bg-amber-500/20 text-amber-300">
            <Clock className="w-2.5 h-2.5 mr-1" /> Scheduled
          </Badge>
        );
      case "DRAFT":
        return (
          <Badge variant="secondary" className="text-[10px] py-0 px-2">
            Draft
          </Badge>
        );
    }
  };

  /* ── DELIVERED & UNOPENED HERO CARD FOR RECEIVER ──────────── */
  if (isUnopenedDelivered) {
    return (
      <div className="relative overflow-hidden rounded-3xl border border-pink-500/30 bg-gradient-to-br from-pink-950/40 via-purple-950/30 to-slate-900 p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-pink-500/50 hover:shadow-pink-500/10 hover:-translate-y-1">
        {/* Ambient Glow */}
        <div className="pointer-events-none absolute -top-12 -right-12 w-44 h-44 rounded-full bg-pink-500/20 blur-2xl animate-aura-pulse" />

        <div className="relative z-10 flex items-start justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{surprise.typeEmoji}</span>
            <Badge variant="indigo" className="text-[10px] font-bold uppercase tracking-wider">
              {surprise.typeDisplayName}
            </Badge>
          </div>
          {getStatusBadge()}
        </div>

        {/* Center Mystery Teaser */}
        <div className="relative z-10 my-5 text-center sm:text-left">
          <h3 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center justify-center sm:justify-start">
            <Sparkles className="w-4 h-4 mr-2 text-pink-400 animate-sparkle" />
            Someone has a surprise for you ✨
          </h3>
          <p className="text-xs text-slate-300 mt-1">
            Sent with heartfelt care by <strong className="text-white">{surprise.senderName}</strong>
          </p>
        </div>

        {/* Action Button */}
        <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-[11px] text-slate-400">
            Arrived {formatDate(surprise.createdAt)}
          </span>
          <Button
            size="sm"
            onClick={() => onOpen(surprise)}
            className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-pink-600/30 rounded-xl px-4 py-2"
          >
            <Gift className="w-3.5 h-3.5 mr-1.5" />
            <span>Tap to Unseal 🎁</span>
          </Button>
        </div>
      </div>
    );
  }

  /* ── STANDARD SURPRISE CARD (OPENED, SCHEDULED, DRAFT, SENT) ─── */
  return (
    <div className="relative flex flex-col justify-between rounded-3xl border border-white/10 bg-slate-900/60 p-5 sm:p-6 backdrop-blur-xl shadow-lg transition-all duration-300 hover:border-white/20 hover:bg-slate-900/80 hover:-translate-y-0.5">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <span className="text-xl">{surprise.typeEmoji}</span>
            <Badge variant="secondary" className="text-[10px] font-semibold uppercase tracking-wider">
              {surprise.typeDisplayName}
            </Badge>
          </div>
          {getStatusBadge()}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-white tracking-tight line-clamp-1">
          {surprise.isLocked ? "✨ Mystery Time-Locked ✨" : surprise.title}
        </h3>

        {/* Content Excerpt or Lock Teaser */}
        <p className="mt-1.5 text-xs text-slate-300 line-clamp-2 leading-relaxed">
          {surprise.isLocked
            ? "This surprise is locked in cosmic transit and cannot be viewed until the scheduled date."
            : surprise.content}
        </p>

        {/* Scheduled date banner if applicable */}
        {isScheduled && surprise.scheduledAt && (
          <div className="mt-3 flex items-center space-x-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-[11px] text-amber-300">
            <Clock className="w-3.5 h-3.5 shrink-0" />
            <span>Unlocks on {formatDate(surprise.scheduledAt)}</span>
          </div>
        )}
      </div>

      {/* Footer Info & Actions */}
      <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
        <span className="text-[11px] text-slate-400">
          {surprise.isSender
            ? `To ${surprise.receiverName}`
            : `From ${surprise.senderName}`}
        </span>

        <div className="flex items-center space-x-1.5">
          {/* Can Open / Reveal */}
          {surprise.canOpen && (
            <Button
              size="sm"
              onClick={() => onOpen(surprise)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1.5 rounded-xl"
            >
              <Gift className="w-3.5 h-3.5 mr-1" />
              <span>Unseal</span>
            </Button>
          )}

          {/* View Already Opened */}
          {isOpened && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpen(surprise)}
              className="border-white/10 text-slate-300 hover:text-white text-xs px-2.5 py-1"
            >
              <Eye className="w-3 h-3 mr-1" />
              <span>View</span>
            </Button>
          )}

          {/* Send Draft */}
          {isDraft && surprise.isSender && onSendDraft && (
            <Button
              size="sm"
              onClick={() => onSendDraft(surprise.id)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-3 py-1"
            >
              <Send className="w-3 h-3 mr-1" />
              <span>Send</span>
            </Button>
          )}

          {/* Edit (Drafts & Scheduled) */}
          {surprise.canEdit && onEdit && (
            <button
              type="button"
              onClick={() => onEdit(surprise)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Edit Surprise"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Delete (Drafts & Scheduled) */}
          {surprise.canDelete && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(surprise.id)}
              className="rounded-lg p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
              title="Delete Surprise"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
