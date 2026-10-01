package com.nilev.goal.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * Goal Entity.
 * Represents a personal target or a shared couple milestone in NILEV.
 */
@Entity
@Table(name = "goals", indexes = {
        @Index(name = "idx_goal_owner", columnList = "owner_id"),
        @Index(name = "idx_goal_partner", columnList = "partner_id"),
        @Index(name = "idx_goal_type", columnList = "type"),
        @Index(name = "idx_goal_status", columnList = "status")
})
public class Goal extends BaseEntity {

    /** The user who created/owns the goal. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    /** For SHARED goals: the connected partner user. Null for personal goals. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "partner_id")
    private User partner;

    @NotBlank
    @Size(max = 150)
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    @Size(max = 50)
    @Column(name = "category", length = 50)
    private String category = "GENERAL";

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 20)
    private GoalType type = GoalType.PERSONAL;

    @NotNull
    @Positive
    @Column(name = "target_value", nullable = false)
    private Double targetValue = 100.0;

    @NotNull
    @Column(name = "current_value", nullable = false)
    private Double currentValue = 0.0;

    @Size(max = 30)
    @Column(name = "unit", length = 30)
    private String unit = "%";

    @Column(name = "start_date")
    private LocalDate startDate = LocalDate.now();

    @Column(name = "target_date")
    private LocalDate targetDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private GoalStatus status = GoalStatus.ACTIVE;

    @Column(name = "is_important", nullable = false)
    private boolean isImportant = false;

    @Column(name = "icon", length = 20)
    private String icon = "🎯";

    @Column(name = "color", length = 30)
    private String color = "#8B5CF6";

    /**
     * Highest milestone reached so far: 0, 25, 50, 75, or 100.
     * Prevents duplicate activity notifications.
     */
    @Column(name = "last_milestone", nullable = false)
    private int lastMilestone = 0;

    public Goal() {}

    // ── Getters & Setters ───────────────────────────────────────────

    public User getOwner() { return owner; }
    public void setOwner(User owner) { this.owner = owner; }

    public User getPartner() { return partner; }
    public void setPartner(User partner) { this.partner = partner; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public GoalType getType() { return type; }
    public void setType(GoalType type) { this.type = type; }

    public Double getTargetValue() { return targetValue; }
    public void setTargetValue(Double targetValue) { this.targetValue = targetValue; }

    public Double getCurrentValue() { return currentValue; }
    public void setCurrentValue(Double currentValue) { this.currentValue = currentValue; }

    public String getUnit() { return unit; }
    public void setUnit(String unit) { this.unit = unit; }

    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }

    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }

    public GoalStatus getStatus() { return status; }
    public void setStatus(GoalStatus status) { this.status = status; }

    public boolean isImportant() { return isImportant; }
    public void setImportant(boolean important) { isImportant = important; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    public int getLastMilestone() { return lastMilestone; }
    public void setLastMilestone(int lastMilestone) { this.lastMilestone = lastMilestone; }

    // ── Helpers ─────────────────────────────────────────────────────

    public double getPercentage() {
        if (targetValue == null || targetValue <= 0) return 0.0;
        double current = currentValue != null ? currentValue : 0.0;
        return Math.min(100.0, Math.max(0.0, (current / targetValue) * 100.0));
    }

    // ── Builder ─────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User owner;
        private User partner;
        private String title;
        private String description;
        private String category = "GENERAL";
        private GoalType type = GoalType.PERSONAL;
        private Double targetValue = 100.0;
        private Double currentValue = 0.0;
        private String unit = "%";
        private LocalDate startDate = LocalDate.now();
        private LocalDate targetDate;
        private GoalStatus status = GoalStatus.ACTIVE;
        private boolean isImportant = false;
        private String icon = "🎯";
        private String color = "#8B5CF6";
        private int lastMilestone = 0;

        public Builder owner(User owner) { this.owner = owner; return this; }
        public Builder partner(User partner) { this.partner = partner; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder category(String category) { this.category = category; return this; }
        public Builder type(GoalType type) { this.type = type; return this; }
        public Builder targetValue(Double targetValue) { this.targetValue = targetValue; return this; }
        public Builder currentValue(Double currentValue) { this.currentValue = currentValue; return this; }
        public Builder unit(String unit) { this.unit = unit; return this; }
        public Builder startDate(LocalDate startDate) { this.startDate = startDate; return this; }
        public Builder targetDate(LocalDate targetDate) { this.targetDate = targetDate; return this; }
        public Builder status(GoalStatus status) { this.status = status; return this; }
        public Builder isImportant(boolean isImportant) { this.isImportant = isImportant; return this; }
        public Builder icon(String icon) { this.icon = icon; return this; }
        public Builder color(String color) { this.color = color; return this; }
        public Builder lastMilestone(int lastMilestone) { this.lastMilestone = lastMilestone; return this; }

        public Goal build() {
            Goal g = new Goal();
            g.setOwner(owner);
            g.setPartner(partner);
            g.setTitle(title);
            g.setDescription(description);
            g.setCategory(category != null ? category : "GENERAL");
            g.setType(type != null ? type : GoalType.PERSONAL);
            g.setTargetValue(targetValue != null ? targetValue : 100.0);
            g.setCurrentValue(currentValue != null ? currentValue : 0.0);
            g.setUnit(unit != null ? unit : "%");
            g.setStartDate(startDate != null ? startDate : LocalDate.now());
            g.setTargetDate(targetDate);
            g.setStatus(status != null ? status : GoalStatus.ACTIVE);
            g.setImportant(isImportant);
            g.setIcon(icon != null ? icon : "🎯");
            g.setColor(color != null ? color : "#8B5CF6");
            g.setLastMilestone(lastMilestone);
            return g;
        }
    }
}
