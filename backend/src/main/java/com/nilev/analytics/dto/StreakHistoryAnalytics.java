package com.nilev.analytics.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class StreakHistoryAnalytics {
    private int currentStreak;
    private int longestStreak;
    private int partnerSharedStreak;
    private double consistencyRate;
    private int totalStreakDays;
    private List<StreakDayPoint> streakTimeline = new ArrayList<>();

    public StreakHistoryAnalytics() {}

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public int getPartnerSharedStreak() { return partnerSharedStreak; }
    public void setPartnerSharedStreak(int partnerSharedStreak) { this.partnerSharedStreak = partnerSharedStreak; }

    public double getConsistencyRate() { return consistencyRate; }
    public void setConsistencyRate(double consistencyRate) { this.consistencyRate = Math.round(consistencyRate * 10.0) / 10.0; }

    public int getTotalStreakDays() { return totalStreakDays; }
    public void setTotalStreakDays(int totalStreakDays) { this.totalStreakDays = totalStreakDays; }

    public List<StreakDayPoint> getStreakTimeline() { return streakTimeline; }
    public void setStreakTimeline(List<StreakDayPoint> streakTimeline) { this.streakTimeline = streakTimeline; }

    public static class StreakDayPoint {
        private LocalDate date;
        private String label;
        private int streak;
        private boolean completedAll;
        private int completedCount;

        public StreakDayPoint() {}

        public StreakDayPoint(LocalDate date, String label, int streak, boolean completedAll, int completedCount) {
            this.date = date;
            this.label = label;
            this.streak = streak;
            this.completedAll = completedAll;
            this.completedCount = completedCount;
        }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public int getStreak() { return streak; }
        public void setStreak(int streak) { this.streak = streak; }

        public boolean isCompletedAll() { return completedAll; }
        public void setCompletedAll(boolean completedAll) { this.completedAll = completedAll; }

        public int getCompletedCount() { return completedCount; }
        public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }
    }
}
