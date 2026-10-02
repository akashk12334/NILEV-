package com.nilev.habit.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * A tracked habit belonging to a single user.
 */
@Entity
@Table(name = "habits")
public class Habit extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @NotBlank
    @Size(max = 120)
    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    /** Emoji or icon identifier, e.g. "🏃" or "book" */
    @Column(name = "icon", length = 10)
    private String icon = "⭐";

    @Size(max = 60)
    @Column(name = "category", length = 60)
    private String category = "General";

    /** Hex colour for the card accent, e.g. "#8B5CF6" */
    @Column(name = "color", length = 10)
    private String color = "#8B5CF6";

    @Enumerated(EnumType.STRING)
    @Column(name = "frequency", nullable = false, length = 20)
    private HabitFrequency frequency = HabitFrequency.DAILY;

    @Enumerated(EnumType.STRING)
    @Column(name = "time_of_day", nullable = false, length = 20)
    private HabitTimeOfDay timeOfDay = HabitTimeOfDay.ANYTIME;

    @Column(name = "start_date")
    private LocalDate startDate;

    @Column(name = "end_date")
    private LocalDate endDate;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    /** Cached longest streak — updated when streaks are computed. */
    @Column(name = "longest_streak", nullable = false)
    private int longestStreak = 0;

    public Habit() {}

    // ── getters & setters ──────────────────────────────────────────

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

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

    public int getLongestStreak() { return longestStreak; }
    public void setLongestStreak(int longestStreak) { this.longestStreak = longestStreak; }

    // ── builder ────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User user;
        private String name;
        private String description;
        private String icon = "⭐";
        private String category = "General";
        private String color = "#8B5CF6";
        private HabitFrequency frequency = HabitFrequency.DAILY;
        private HabitTimeOfDay timeOfDay = HabitTimeOfDay.ANYTIME;
        private LocalDate startDate;
        private LocalDate endDate;
        private int longestStreak = 0;

        public Builder user(User user) { this.user = user; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder icon(String icon) { this.icon = icon; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder color(String color) { this.color = color; return this; }
        public Builder frequency(HabitFrequency frequency) { this.frequency = frequency; return this; }
        public Builder timeOfDay(HabitTimeOfDay timeOfDay) { this.timeOfDay = timeOfDay; return this; }
        public Builder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public Builder endDate(LocalDate endDate) { this.endDate = endDate; return this; }
        public Builder longestStreak(int longestStreak) { this.longestStreak = longestStreak; return this; }

        public Habit build() {
            Habit h = new Habit();
            h.user = user;
            h.name = name;
            h.description = description;
            h.icon = icon;
            h.category = category;
            h.color = color;
            h.frequency = frequency;
            h.timeOfDay = timeOfDay;
            h.startDate = startDate;
            h.endDate = endDate;
            h.longestStreak = longestStreak;
            return h;
        }
    }
}
