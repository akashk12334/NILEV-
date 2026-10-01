package com.nilev.analytics.dto;

import java.util.ArrayList;
import java.util.List;

public class AnalyticsDashboardResponse {
    private Long userId;
    private String userName;
    private String userAvatarUrl;
    private boolean isPartner;
    private boolean isViewOnly;
    private String timeframe; // "7d", "30d", "90d"
    private int totalCompletions;
    private double overallConsistency;
    private int currentStreak;
    private int longestStreak;
    private int activeHabitsCount;

    private List<DailyCompletionPoint> dailyCompletions = new ArrayList<>();
    private List<WeeklyCompletionPoint> weeklyCompletions = new ArrayList<>();
    private List<MonthlyCompletionPoint> monthlyCompletions = new ArrayList<>();
    private List<HabitConsistencyItem> habitConsistency = new ArrayList<>();
    private List<CategoryDistributionItem> habitDistribution = new ArrayList<>();
    private GoalProgressAnalytics goalProgress;
    private StreakHistoryAnalytics streakHistory;
    private XpGrowthAnalytics xpGrowth;
    private PartnerAnalyticsInfo partnerInfo;

    public AnalyticsDashboardResponse() {}

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public String getUserAvatarUrl() { return userAvatarUrl; }
    public void setUserAvatarUrl(String userAvatarUrl) { this.userAvatarUrl = userAvatarUrl; }

    public boolean isPartner() { return isPartner; }
    public void setPartner(boolean partner) { isPartner = partner; }

    public boolean isViewOnly() { return isViewOnly; }
    public void setViewOnly(boolean viewOnly) { isViewOnly = viewOnly; }

    public String getTimeframe() { return timeframe; }
    public void setTimeframe(String timeframe) { this.timeframe = timeframe; }

    public int getTotalCompletions() { return totalCompletions; }
    public void setTotalCompletions(int totalCompletions) { this.totalCompletions = totalCompletions; }

    public double getOverallConsistency() { return overallConsistency; }
    public void setOverallConsistency(double overallConsistency) { this.overallConsistency = Math.round(overallConsistency * 10.0) / 10.0; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public int getActiveHabitsCount() { return activeHabitsCount; }
    public void setActiveHabitsCount(int activeHabitsCount) { this.activeHabitsCount = activeHabitsCount; }

    public List<DailyCompletionPoint> getDailyCompletions() { return dailyCompletions; }
    public void setDailyCompletions(List<DailyCompletionPoint> dailyCompletions) { this.dailyCompletions = dailyCompletions; }

    public List<WeeklyCompletionPoint> getWeeklyCompletions() { return weeklyCompletions; }
    public void setWeeklyCompletions(List<WeeklyCompletionPoint> weeklyCompletions) { this.weeklyCompletions = weeklyCompletions; }

    public List<MonthlyCompletionPoint> getMonthlyCompletions() { return monthlyCompletions; }
    public void setMonthlyCompletions(List<MonthlyCompletionPoint> monthlyCompletions) { this.monthlyCompletions = monthlyCompletions; }

    public List<HabitConsistencyItem> getHabitConsistency() { return habitConsistency; }
    public void setHabitConsistency(List<HabitConsistencyItem> habitConsistency) { this.habitConsistency = habitConsistency; }

    public List<CategoryDistributionItem> getHabitDistribution() { return habitDistribution; }
    public void setHabitDistribution(List<CategoryDistributionItem> habitDistribution) { this.habitDistribution = habitDistribution; }

    public GoalProgressAnalytics getGoalProgress() { return goalProgress; }
    public void setGoalProgress(GoalProgressAnalytics goalProgress) { this.goalProgress = goalProgress; }

    public StreakHistoryAnalytics getStreakHistory() { return streakHistory; }
    public void setStreakHistory(StreakHistoryAnalytics streakHistory) { this.streakHistory = streakHistory; }

    public XpGrowthAnalytics getXpGrowth() { return xpGrowth; }
    public void setXpGrowth(XpGrowthAnalytics xpGrowth) { this.xpGrowth = xpGrowth; }

    public PartnerAnalyticsInfo getPartnerInfo() { return partnerInfo; }
    public void setPartnerInfo(PartnerAnalyticsInfo partnerInfo) { this.partnerInfo = partnerInfo; }
}
