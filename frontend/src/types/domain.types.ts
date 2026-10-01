/**
 * Foundational domain interfaces for NILEV
 */

export interface Habit {
  id: number;
  userId: number;
  partnerId?: number | null;
  title: string;
  description?: string;
  frequency: "DAILY" | "WEEKLY" | "CUSTOM";
  streakCount: number;
  isShared: boolean;
  createdAt: string;
}

export interface Goal {
  id: number;
  title: string;
  description?: string;
  targetDate?: string;
  progressPercent: number;
  isJointGoal: boolean;
  completed: boolean;
  createdAt: string;
}

export interface Activity {
  id: number;
  title: string;
  category: string;
  activityDate: string;
  notes?: string;
  isShared: boolean;
  createdAt: string;
}

export interface Companion {
  id: number;
  name: string;
  avatarType: string;
  level: number;
  happinessScore: number;
  lastInteractionAt: string;
}

export interface Surprise {
  id: number;
  senderId: number;
  receiverId: number;
  title: string;
  message?: string;
  unlockAt: string;
  isUnlocked: boolean;
  createdAt: string;
}
