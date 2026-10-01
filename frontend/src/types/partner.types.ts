export interface PartnerProfileResponse {
  id: number;
  name: string;
  email: string;
  avatarUrl?: string | null;
  xp: number;
  level: number;
  streak: number;
  companionName?: string;
  companionType?: string;
  companionLevel?: number;
  companionMood?: string;
  habitsCompletedCount: number;
  goalsCount: number;
  isPartner: boolean;
  readOnly: boolean;
}

export interface InvitationResponse {
  id: number;
  senderId: number;
  senderName: string;
  senderEmail: string;
  senderAvatarUrl?: string | null;
  receiverId: number;
  receiverName: string;
  receiverEmail: string;
  receiverAvatarUrl?: string | null;
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";
  createdAt: string;
}

export type PartnerConnectionState =
  | "NO_PARTNER"
  | "INVITATION_SENT"
  | "INVITATION_RECEIVED"
  | "CONNECTED";

export interface PartnerStatusResponse {
  status: PartnerConnectionState;
  user: PartnerProfileResponse;
  partner?: PartnerProfileResponse | null;
  invitation?: InvitationResponse | null;
  sharedStreak?: number;
  connectedAt?: string | null;
}

export interface PartnerActivityResponse {
  id: number;
  userId: number;
  userName: string;
  userAvatarUrl?: string | null;
  activityType: string;
  title: string;
  description?: string;
  icon?: string;
  createdAt: string;
  isPartner: boolean;
}

export interface InvitePartnerRequest {
  email: string;
}

export interface AcceptInvitationRequest {
  invitationId?: number;
}

export interface RejectInvitationRequest {
  invitationId?: number;
}
