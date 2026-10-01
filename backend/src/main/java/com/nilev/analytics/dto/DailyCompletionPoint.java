package com.nilev.analytics.dto;

import java.time.LocalDate;

public class DailyCompletionPoint {
    private LocalDate date;
    private String label;
    private int completedCount;
    private int totalHabits;
    private double completionRate;
    private int xpEarned;

    public DailyCompletionPoint() {}

    public DailyCompletionPoint(LocalDate date, String label, int completedCount, int totalHabits, double completionRate, int xpEarned) {
        this.date = date;
        this.label = label;
        this.completedCount = completedCount;
        this.totalHabits = totalHabits;
        this.completionRate = Math.round(completionRate * 10.0) / 10.0;
        this.xpEarned = xpEarned;
    }

    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }

    public String getLabel() { return label; }
    public void setLabel(String label) { this.label = label; }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }

    public int getTotalHabits() { return totalHabits; }
    public void setTotalHabits(int totalHabits) { this.totalHabits = totalHabits; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }

    public int getXpEarned() { return xpEarned; }
    public void setXpEarned(int xpEarned) { this.xpEarned = xpEarned; }
}
