export type GoalType = "PERSONAL" | "SHARED";

export type GoalStatus = "ACTIVE" | "COMPLETED" | "PAUSED" | "CANCELLED";

export interface GoalResponse {
  id: number;
  ownerId: number;
  ownerName: string;
  partnerId?: number | null;
  partnerName?: string | null;
  title: string;
  description?: string | null;
  category: string;
  type: GoalType;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate?: string | null;
  targetDate?: string | null;
  daysRemaining?: number | null;
  status: GoalStatus;
  percentage: number;
  isImportant: boolean;
  icon: string;
  color: string;
  isMine: boolean;
  canContribute: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  category?: string;
  type: GoalType;
  targetValue: number;
  currentValue?: number;
  unit?: string;
  startDate?: string;
  targetDate?: string;
  isImportant?: boolean;
  icon?: string;
  color?: string;
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  category?: string;
  targetValue?: number;
  currentValue?: number;
  unit?: string;
  startDate?: string;
  targetDate?: string;
  status?: GoalStatus;
  isImportant?: boolean;
  icon?: string;
  color?: string;
}

export interface UpdateGoalProgressRequest {
  currentValue?: number;
  increment?: number;
  note?: string;
}

export type GoalTab = "MY" | "SHARED" | "COMPLETED";
