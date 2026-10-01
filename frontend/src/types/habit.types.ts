// Habit types for the NILEV frontend

export type HabitFrequency = "DAILY" | "WEEKDAYS" | "WEEKENDS" | "WEEKLY" | "MONTHLY";
export type HabitTimeOfDay = "MORNING" | "AFTERNOON" | "EVENING" | "ANYTIME";

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
}

export interface UpdateHabitRequest {
  name?: string;
  description?: string;
  icon?: string;
  category?: string;
  color?: string;
  frequency?: HabitFrequency;
  timeOfDay?: HabitTimeOfDay;
  active?: boolean;
}

export interface HabitCompletionResponse {
  id: number;
  habitId: number;
  userId: number;
  completedDate: string;
  createdAt: string;
}

export type HabitFilter =
  | "all"
  | "today"
  | "completed"
  | "pending"
  | "morning"
  | "afternoon"
  | "evening";
