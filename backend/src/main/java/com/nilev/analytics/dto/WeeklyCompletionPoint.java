package com.nilev.analytics.dto;

public class WeeklyCompletionPoint {
    private String dayOfWeek;
    private int completedCount;
    private int possibleCount;
    private double completionRate;
    private Double partnerRate;

    public WeeklyCompletionPoint() {}

    public WeeklyCompletionPoint(String dayOfWeek, int completedCount, int possibleCount, double completionRate, Double partnerRate) {
        this.dayOfWeek = dayOfWeek;
        this.completedCount = completedCount;
        this.possibleCount = possibleCount;
        this.completionRate = Math.round(completionRate * 10.0) / 10.0;
        this.partnerRate = partnerRate != null ? Math.round(partnerRate * 10.0) / 10.0 : null;
    }

    public String getDayOfWeek() { return dayOfWeek; }
    public void setDayOfWeek(String dayOfWeek) { this.dayOfWeek = dayOfWeek; }

    public int getCompletedCount() { return completedCount; }
    public void setCompletedCount(int completedCount) { this.completedCount = completedCount; }

    public int getPossibleCount() { return possibleCount; }
    public void setPossibleCount(int possibleCount) { this.possibleCount = possibleCount; }

    public double getCompletionRate() { return completionRate; }
    public void setCompletionRate(double completionRate) { this.completionRate = completionRate; }

    public Double getPartnerRate() { return partnerRate; }
    public void setPartnerRate(Double partnerRate) { this.partnerRate = partnerRate; }
}
