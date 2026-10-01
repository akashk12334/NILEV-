import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  ApiResponse,
  AnalyticsDashboardResponse,
  TimeframeOption,
  DailyCompletionPoint,
  WeeklyCompletionPoint,
  MonthlyCompletionPoint,
  HabitConsistencyItem,
  GoalProgressAnalytics,
  StreakHistoryAnalytics,
  XpGrowthAnalytics,
} from "../types";

export const analyticsService = {
  /**
   * Fetch complete Analytics Dashboard payload.
   */
  async getDashboard(
    timeframe: TimeframeOption = "30d",
    partner: boolean = false
  ): Promise<AnalyticsDashboardResponse> {
    const res = await apiClient.get<ApiResponse<AnalyticsDashboardResponse>>(
      `${ENDPOINTS.ANALYTICS.BASE}?timeframe=${timeframe}&partner=${partner}`
    );
    return res.data.data;
  },

  /**
   * View-only Partner Analytics payload.
   */
  async getPartnerAnalytics(
    timeframe: TimeframeOption = "30d"
  ): Promise<AnalyticsDashboardResponse> {
    const res = await apiClient.get<ApiResponse<AnalyticsDashboardResponse>>(
      `${ENDPOINTS.ANALYTICS.PARTNER}?timeframe=${timeframe}`
    );
    return res.data.data;
  },

  /**
   * Daily habit completions.
   */
  async getDailyCompletions(
    timeframe: TimeframeOption = "30d",
    partner: boolean = false
  ): Promise<DailyCompletionPoint[]> {
    const res = await apiClient.get<ApiResponse<DailyCompletionPoint[]>>(
      `${ENDPOINTS.ANALYTICS.DAILY}?timeframe=${timeframe}&partner=${partner}`
    );
    return res.data.data;
  },

  /**
   * Weekly day-of-week completions.
   */
  async getWeeklyCompletions(
    timeframe: TimeframeOption = "30d",
    partner: boolean = false
  ): Promise<WeeklyCompletionPoint[]> {
    const res = await apiClient.get<ApiResponse<WeeklyCompletionPoint[]>>(
      `${ENDPOINTS.ANALYTICS.WEEKLY}?timeframe=${timeframe}&partner=${partner}`
    );
    return res.data.data;
  },

  /**
   * Monthly trend completions.
   */
  async getMonthlyCompletions(
    timeframe: TimeframeOption = "30d",
    partner: boolean = false
  ): Promise<MonthlyCompletionPoint[]> {
    const res = await apiClient.get<ApiResponse<MonthlyCompletionPoint[]>>(
      `${ENDPOINTS.ANALYTICS.MONTHLY}?timeframe=${timeframe}&partner=${partner}`
    );
    return res.data.data;
  },

  /**
   * Habit consistency items.
   */
  async getHabitConsistency(
    timeframe: TimeframeOption = "30d",
    partner: boolean = false
  ): Promise<HabitConsistencyItem[]> {
    const res = await apiClient.get<ApiResponse<HabitConsistencyItem[]>>(
      `${ENDPOINTS.ANALYTICS.HABIT_CONSISTENCY}?timeframe=${timeframe}&partner=${partner}`
    );
    return res.data.data;
  },

  /**
   * Goal progress breakdown.
   */
  async getGoalProgress(
    partner: boolean = false
  ): Promise<GoalProgressAnalytics> {
    const res = await apiClient.get<ApiResponse<GoalProgressAnalytics>>(
      `${ENDPOINTS.ANALYTICS.GOAL_PROGRESS}?partner=${partner}`
    );
    return res.data.data;
  },

  /**
   * Streak history and timeline.
   */
  async getStreakHistory(
    timeframe: TimeframeOption = "30d",
    partner: boolean = false
  ): Promise<StreakHistoryAnalytics> {
    const res = await apiClient.get<ApiResponse<StreakHistoryAnalytics>>(
      `${ENDPOINTS.ANALYTICS.STREAK_HISTORY}?timeframe=${timeframe}&partner=${partner}`
    );
    return res.data.data;
  },

  /**
   * XP growth trajectory.
   */
  async getXpGrowth(
    timeframe: TimeframeOption = "30d",
    partner: boolean = false
  ): Promise<XpGrowthAnalytics> {
    const res = await apiClient.get<ApiResponse<XpGrowthAnalytics>>(
      `${ENDPOINTS.ANALYTICS.XP_GROWTH}?timeframe=${timeframe}&partner=${partner}`
    );
    return res.data.data;
  },
};
