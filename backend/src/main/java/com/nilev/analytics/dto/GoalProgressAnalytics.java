package com.nilev.analytics.dto;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

public class GoalProgressAnalytics {
    private int totalGoals;
    private int activeGoals;
    private int completedGoals;
    private int personalGoals;
    private int sharedGoals;
    private double overallProgress;
    private int milestonesReached;
    private List<GoalSummaryItem> goals = new ArrayList<>();

    public GoalProgressAnalytics() {}

    public int getTotalGoals() { return totalGoals; }
    public void setTotalGoals(int totalGoals) { this.totalGoals = totalGoals; }

    public int getActiveGoals() { return activeGoals; }
    public void setActiveGoals(int activeGoals) { this.activeGoals = activeGoals; }

    public int getCompletedGoals() { return completedGoals; }
    public void setCompletedGoals(int completedGoals) { this.completedGoals = completedGoals; }

    public int getPersonalGoals() { return personalGoals; }
    public void setPersonalGoals(int personalGoals) { this.personalGoals = personalGoals; }

    public int getSharedGoals() { return sharedGoals; }
    public void setSharedGoals(int sharedGoals) { this.sharedGoals = sharedGoals; }

    public double getOverallProgress() { return overallProgress; }
    public void setOverallProgress(double overallProgress) { this.overallProgress = Math.round(overallProgress * 10.0) / 10.0; }

    public int getMilestonesReached() { return milestonesReached; }
    public void setMilestonesReached(int milestonesReached) { this.milestonesReached = milestonesReached; }

    public List<GoalSummaryItem> getGoals() { return goals; }
    public void setGoals(List<GoalSummaryItem> goals) { this.goals = goals; }

    public static class GoalSummaryItem {
        private Long id;
        private String title;
        private String category;
        private String type; // "PERSONAL", "SHARED"
        private double currentValue;
        private double targetValue;
        private String unit;
        private double progressPercentage;
        private LocalDate targetDate;
        private String status;
        private boolean isShared;

        public GoalSummaryItem() {}

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getCategory() { return category; }
        public void setCategory(String category) { this.category = category; }

        public String getType() { return type; }
        public void setType(String type) { this.type = type; }

        public double getCurrentValue() { return currentValue; }
        public void setCurrentValue(double currentValue) { this.currentValue = currentValue; }

        public double getTargetValue() { return targetValue; }
        public void setTargetValue(double targetValue) { this.targetValue = targetValue; }

        public String getUnit() { return unit; }
        public void setUnit(String unit) { this.unit = unit; }

        public double getProgressPercentage() { return progressPercentage; }
        public void setProgressPercentage(double progressPercentage) { this.progressPercentage = Math.round(progressPercentage * 10.0) / 10.0; }

        public LocalDate getTargetDate() { return targetDate; }
        public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public boolean isShared() { return isShared; }
        public void setShared(boolean shared) { isShared = shared; }
    }
}
