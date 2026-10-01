export type ActivityType =
  | "HABIT_COMPLETED"
  | "HABIT_STREAK"
  | "GOAL_PROGRESS"
  | "GOAL_COMPLETED"
  | "COMPANION_LEVEL_UP"
  | "ACHIEVEMENT_UNLOCKED"
  | "SURPRISE_SENT"
  | "SURPRISE_OPENED"
  | "PARTNER_CONNECTED"
  | "PARTNER_INVITATION_SENT";

export interface ActivityResponse {
  id: number;
  actorId: number;
  actorName: string;
  actorAvatarUrl?: string | null;
  type: ActivityType;
  referenceId?: number | null;
  title: string;
  description?: string | null;
  icon: string;
  metadata?: string | null;
  reactions: Record<string, number>;
  myReactions: Record<string, boolean>;
  isMine: boolean;
  createdAt: string;
}

export interface ReactionResponse {
  activityId: number;
  emoji: string;
  added: boolean;
  reactions: Record<string, number>;
}

export type ActivityFilterType =
  | "ALL"
  | "MINE"
  | "PARTNER"
  | "HABITS"
  | "GOALS"
  | "COMPANION"
  | "ACHIEVEMENTS"
  | "SURPRISES";
