package com.nilev.analytics.dto;

public class MonthlyCompletionPoint {
    private String month;
    private int year;
    private int completedCount;
    private int totalExpected;
    private double completionRate;
    private int activeDays;

    public MonthlyCompletionPoint() {}

    public MonthlyCompletionPoint(String month, int year, int completedCount, int totalExpected, double completionRate, int activeDays) {
        this.month = month;
        this.year = year;
        this.completedCount = completedCount;
        this.totalExpected = totalExpected;
        this.completionRate = Math.round(completionRate * 10.0) / 10.0;
        this.activeDays = activeDays;
    }

    public String getMonth() { return month; }
    public void setMonth(String month) { this.month = month; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }

    public int getTotalExpected() { return totalExpected; }
    public void setTotalExpected(int totalExpected) { this.totalExpected = totalExpected; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }

    public int getActiveDays() { return activeDays; }
    public void setActiveDays(int activeDays) { this.activeDays = activeDays; }
}
