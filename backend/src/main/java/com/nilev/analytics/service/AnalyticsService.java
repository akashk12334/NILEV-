package com.nilev.analytics.service;

import com.nilev.analytics.dto.*;

import java.util.List;

public interface AnalyticsService {

    AnalyticsDashboardResponse getDashboard(Long currentUserId, String timeframe, boolean isPartnerRequested);

    List<DailyCompletionPoint> getDailyCompletions(Long currentUserId, String timeframe, boolean isPartnerRequested);

    List<WeeklyCompletionPoint> getWeeklyCompletions(Long currentUserId, String timeframe, boolean isPartnerRequested);

    List<MonthlyCompletionPoint> getMonthlyCompletions(Long currentUserId, String timeframe, boolean isPartnerRequested);

    List<HabitConsistencyItem> getHabitConsistency(Long currentUserId, String timeframe, boolean isPartnerRequested);

    GoalProgressAnalytics getGoalProgress(Long currentUserId, boolean isPartnerRequested);

    StreakHistoryAnalytics getStreakHistory(Long currentUserId, String timeframe, boolean isPartnerRequested);

    XpGrowthAnalytics getXpGrowth(Long currentUserId, String timeframe, boolean isPartnerRequested);
}
