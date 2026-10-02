// Habit types for the NILEV frontend

export type HabitFrequency = "DAILY" | "WEEKDAYS" | "WEEKENDS" | "WEEKLY" | "MONTHLY" | "CUSTOM";
export type HabitTimeOfDay = "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME";
export type HabitDailyStatus = "PENDING" | "COMPLETED" | "MISSED" | "EXPIRED" | "NOT_STARTED";

export interface HabitResponse {
  id: number;
  userId: number;
  name: string;
  description?: string;
  icon: string;
  category: string;
  color: string;
  frequency: HabitFrequency;
  timeOfDay: HabitTimeOfDay;
  startDate?: string | null;
  endDate?: string | null;
  dailyStatus?: HabitDailyStatus;
  partnerNickname?: string | null;
  ownerName?: string | null;
  readOnly?: boolean;
  active: boolean;
  completedToday: boolean;
  currentStreak: number;
  longestStreak: number;
  completionPercentage: number;
  weeklyCompletion: number;
  monthlyCompletion: number;
  totalCompletions: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHabitRequest {
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  color?: string;
  frequency?: HabitFrequency;
  timeOfDay?: HabitTimeOfDay;
  startDate?: string;
  endDate?: string;
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  icon?: string;
  category?: string;
  color?: string;
  frequency?: HabitFrequency;
  timeOfDay?: HabitTimeOfDay;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}

export interface HabitCompletionResponse {
  id: number;
  habitId: number;
  userId: number;
  completedDate: string;
  createdAt: string;
}

export interface TodayHabitSummaryResponse {
  partnerConnected: boolean;
  partnerName?: string | null;
  partnerNickname?: string | null;
  userCompletedCount: number;
  userTotalCount: number;
  userPercentage: number;
  partnerCompletedCount: number;
  partnerTotalCount: number;
  partnerPercentage: number;
  sharedCompletedCount: number;
  sharedTotalCount: number;
  sharedPercentage: number;
  userHabits: HabitResponse[];
  partnerHabits: HabitResponse[];
}

export type HabitFilter =
  | "all"
  | "today"
  | "completed"
  | "pending"
  | "morning"
  | "afternoon"
  | "evening";
