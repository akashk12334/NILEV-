export type NotificationType =
  | "PARTNER_CONNECTED"
  | "PARTNER_ACTIVITY"
  | "HABIT_REMINDER"
  | "HABIT_COMPLETED"
  | "HABIT_DELETED"
  | "GOAL_MILESTONE"
  | "GOAL_COMPLETED"
  | "GOAL_DELETED"
  | "COMPANION_LEVEL_UP"
  | "SURPRISE_RECEIVED"
  | "SURPRISE_OPENED";

export interface NotificationResponse {
  id: number;
  type: NotificationType;
  typeDisplayName: string;
  typeEmoji: string;
  category: string;
  title: string;
  message: string;
  icon?: string | null;
  actorId?: number | null;
  actorName?: string | null;
  referenceId?: number | null;
  referenceType?: string | null;
  actionUrl?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
  timeAgo: string;
}

export interface NotificationSummaryResponse {
  unreadCount: number;
  notifications: NotificationResponse[];
}
