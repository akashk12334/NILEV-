export type TimeframeOption = "7d" | "30d" | "90d";

export interface DailyCompletionPoint {
  date: string;
  label: string;
  completedCount: number;
  totalHabits: number;
  completionRate: number;
  xpEarned: number;
}

export interface WeeklyCompletionPoint {
  dayOfWeek: string; // "Mon", "Tue", etc.
  completedCount: number;
  possibleCount: number;
  completionRate: number;
  partnerRate?: number | null;
}

export interface MonthlyCompletionPoint {
  month: string;
  year: number;
  completedCount: number;
  totalExpected: number;
  completionRate: number;
  activeDays: number;
}

export interface HabitConsistencyItem {
  habitId: number;
  name: string;
  icon: string;
  color: string;
  category: string;
  frequency: string;
  timeOfDay: string;
  completionsCount: number;
  expectedCount: number;
  consistencyScore: number;
  currentStreak: number;
  longestStreak: number;
  status: "THRIVING" | "CONSISTENT" | "NEEDS_ATTENTION" | string;
}

export interface CategoryDistributionItem {
  category: string;
  count: number;
  completions: number;
  percentage: number;
  color: string;
}

export interface GoalSummaryItem {
  id: number;
  title: string;
  category: string;
  type: "PERSONAL" | "SHARED" | string;
  currentValue: number;
  targetValue: number;
  unit: string;
  progressPercentage: number;
  targetDate?: string | null;
  status: string;
  isShared: boolean;
}

export interface GoalProgressAnalytics {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  personalGoals: number;
  sharedGoals: number;
  overallProgress: number;
  milestonesReached: number;
  goals: GoalSummaryItem[];
}

export interface StreakDayPoint {
  date: string;
  label: string;
  streak: number;
  completedAll: boolean;
  completedCount: number;
}

export interface StreakHistoryAnalytics {
  currentStreak: number;
  longestStreak: number;
  partnerSharedStreak: number;
  consistencyRate: number;
  totalStreakDays: number;
  streakTimeline: StreakDayPoint[];
}

export interface XpGrowthPoint {
  date: string;
  label: string;
  dailyXp: number;
  cumulativeXp: number;
}

export interface XpGrowthAnalytics {
  currentTotalXp: number;
  currentLevel: number;
  nextLevelXp: number;
  progressPercent: number;
  companionName?: string | null;
  companionType?: string | null;
  companionMood?: string | null;
  timeline: XpGrowthPoint[];
}

export interface PartnerAnalyticsInfo {
  partnerId: number;
  partnerName: string;
  partnerAvatarUrl?: string | null;
  isConnected: boolean;
  relationshipStreak: number;
  daysConnected: number;
}

export interface AnalyticsDashboardResponse {
  userId: number;
  userName: string;
  userAvatarUrl?: string | null;
  isPartner: boolean;
  isViewOnly: boolean;
  timeframe: TimeframeOption | string;
  totalCompletions: number;
  overallConsistency: number;
  currentStreak: number;
  longestStreak: number;
  activeHabitsCount: number;
  dailyCompletions: DailyCompletionPoint[];
  weeklyCompletions: WeeklyCompletionPoint[];
  monthlyCompletions: MonthlyCompletionPoint[];
  habitConsistency: HabitConsistencyItem[];
  habitDistribution: CategoryDistributionItem[];
  goalProgress: GoalProgressAnalytics;
  streakHistory: StreakHistoryAnalytics;
  xpGrowth: XpGrowthAnalytics;
  partnerInfo?: PartnerAnalyticsInfo | null;
}
