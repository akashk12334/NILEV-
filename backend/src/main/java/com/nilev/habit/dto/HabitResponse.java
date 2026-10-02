package com.nilev.habit.dto;

import com.nilev.habit.entity.HabitFrequency;
import com.nilev.habit.entity.HabitTimeOfDay;

import java.time.Instant;
import java.time.LocalDate;

/**
 * Full habit response including runtime stats (streak, completion %).
 */
public class HabitResponse {

    private Long id;
    private Long userId;
    private String name;
    private String description;
    private String icon;
    private String category;
    private String color;
    private HabitFrequency frequency;
    private HabitTimeOfDay timeOfDay;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean active;

    // ── status and partner view ──
    private String dailyStatus; // PENDING, COMPLETED, MISSED, EXPIRED, NOT_STARTED
    private String partnerNickname;
    private String ownerName;
    private boolean readOnly = false;

    // ── runtime stats ──
    private boolean completedToday;
    private int currentStreak;
    private int longestStreak;
    private double completionPercentage;   // last 30 days
    private double weeklyCompletion;       // last 7 days
    private double monthlyCompletion;      // last 30 days
    private int totalCompletions;

    private Instant createdAt;
    private Instant updatedAt;

    // ── getters & setters ──────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public HabitFrequency getFrequency() { return frequency; }
    public void setFrequency(HabitFrequency frequency) { this.frequency = frequency; }

    public HabitTimeOfDay getTimeOfDay() { return timeOfDay; }
    public void setTimeOfDay(HabitTimeOfDay timeOfDay) { this.timeOfDay = timeOfDay; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getDailyStatus() { return dailyStatus; }
    public void setDailyStatus(String dailyStatus) { this.dailyStatus = dailyStatus; }

    public String getPartnerNickname() { return partnerNickname; }
    public void setPartnerNickname(String partnerNickname) { this.partnerNickname = partnerNickname; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public boolean isReadOnly() { return readOnly; }
    public void setReadOnly(boolean readOnly) { this.readOnly = readOnly; }

    public boolean isCompletedToday() { return completedToday; }
    public void setCompletedToday(boolean completedToday) { this.completedToday = completedToday; }

    public int getCurrentStreak() { return currentStreak; }
    public void setCurrentStreak(int currentStreak) { this.currentStreak = currentStreak; }

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    public double getCompletionPercentage() { return completionPercentage; }
    public void setCompletionPercentage(double completionPercentage) { this.completionPercentage = completionPercentage; }

    public double getWeeklyCompletion() { return weeklyCompletion; }
    public void setWeeklyCompletion(double weeklyCompletion) { this.weeklyCompletion = weeklyCompletion; }

    public double getMonthlyCompletion() { return monthlyCompletion; }
    public void setMonthlyCompletion(double monthlyCompletion) { this.monthlyCompletion = monthlyCompletion; }

    public int getTotalCompletions() { return totalCompletions; }
    public void setTotalCompletions(int totalCompletions) { this.totalCompletions = totalCompletions; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
