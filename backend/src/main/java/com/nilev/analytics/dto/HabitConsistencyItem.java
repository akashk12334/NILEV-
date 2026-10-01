package com.nilev.analytics.dto;

public class HabitConsistencyItem {
    private Long habitId;
    private String name;
    private String icon;
    private String color;
    private String category;
    private String frequency;
    private String timeOfDay;
    private int completionsCount;
    private int expectedCount;
    private double consistencyScore;
    private int currentStreak;
    private int longestStreak;
    private String status; // "THRIVING", "CONSISTENT", "NEEDS_ATTENTION"

    public HabitConsistencyItem() {}

    public Long getHabitId() { return habitId; }
    public void setHabitId(Long habitId) { this.habitId = habitId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }

    public String getTimeOfDay() { return timeOfDay; }
    public void setTimeOfDay(String timeOfDay) { this.timeOfDay = timeOfDay; }

    public int getCompletionsCount() { return completionsCount; }
    public void setCompletionsCount(int completionsCount) { this.completionsCount = completionsCount; }

    public int getExpectedCount() { return expectedCount; }
    public void setExpectedCount(int expectedCount) { this.expectedCount = expectedCount; }

    public double getConsistencyScore() { return consistencyScore; }
    public void setConsistencyScore(double consistencyScore) { this.consistencyScore = Math.round(consistencyScore * 10.0) / 10.0; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
