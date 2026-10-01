export type SurpriseType =
  | "MESSAGE"
  | "IMAGE"
  | "CHALLENGE"
  | "REWARD"
  | "MEMORY"
  | "CUSTOM";

export type SurpriseStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "DELIVERED"
  | "OPENED";

export interface SurpriseResponse {
  id: number;
  senderId: number;
  senderName: string;
  receiverId: number;
  receiverName: string;
  type: SurpriseType;
  typeDisplayName: string;
  typeEmoji: string;
  title: string;
  content: string;
  mediaUrl?: string | null;
  scheduledAt?: string | null;
  openedAt?: string | null;
  status: SurpriseStatus;
  statusDisplayName: string;
  isSender: boolean;
  isReceiver: boolean;
  canOpen: boolean;
  canEdit: boolean;
  canDelete: boolean;
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSurpriseRequest {
  type: SurpriseType;
  title: string;
  content: string;
  mediaUrl?: string | null;
  scheduledAt?: string | null;
  isDraft?: boolean;
}

export interface UpdateSurpriseRequest {
  type?: SurpriseType;
  title?: string;
  content?: string;
  mediaUrl?: string | null;
  scheduledAt?: string | null;
  sendNow?: boolean;
}
