package com.nilev.analytics.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class XpGrowthAnalytics {
    private int currentTotalXp;
    private int currentLevel;
    private int nextLevelXp;
    private double progressPercent;
    private String companionName;
    private String companionType;
    private String companionMood;
    private List<XpGrowthPoint> timeline = new ArrayList<>();

    public XpGrowthAnalytics() {}

    public int getCurrentTotalXp() { return currentTotalXp; }
    public void setCurrentTotalXp(int currentTotalXp) { this.currentTotalXp = currentTotalXp; }

    public int getCurrentLevel() { return currentLevel; }
    public void setCurrentLevel(int currentLevel) { this.currentLevel = currentLevel; }

    public int getNextLevelXp() { return nextLevelXp; }
    public void setNextLevelXp(int nextLevelXp) { this.nextLevelXp = nextLevelXp; }

    public double getProgressPercent() { return progressPercent; }
    public void setProgressPercent(double progressPercent) { this.progressPercent = Math.round(progressPercent * 10.0) / 10.0; }

    public String getCompanionName() { return companionName; }
    public void setCompanionName(String companionName) { this.companionName = companionName; }

    public String getCompanionType() { return companionType; }
    public void setCompanionType(String companionType) { this.companionType = companionType; }

    public String getCompanionMood() { return companionMood; }
    public void setCompanionMood(String companionMood) { this.companionMood = companionMood; }

    public List<XpGrowthPoint> getTimeline() { return timeline; }
    public void setTimeline(List<XpGrowthPoint> timeline) { this.timeline = timeline; }

    public static class XpGrowthPoint {
        private LocalDate date;
        private String label;
        private int dailyXp;
        private int cumulativeXp;

        public XpGrowthPoint() {}

        public XpGrowthPoint(LocalDate date, String label, int dailyXp, int cumulativeXp) {
            this.date = date;
            this.label = label;
            this.dailyXp = dailyXp;
            this.cumulativeXp = cumulativeXp;
        }

        public LocalDate getDate() { return date; }
        public void setDate(LocalDate date) { this.date = date; }

        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }

        public int getDailyXp() { return dailyXp; }
        public void setDailyXp(int dailyXp) { this.dailyXp = dailyXp; }

        public int getCumulativeXp() { return cumulativeXp; }
        public void setCumulativeXp(int cumulativeXp) { this.cumulativeXp = cumulativeXp; }
    }
}
