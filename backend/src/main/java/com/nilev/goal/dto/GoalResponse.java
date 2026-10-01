package com.nilev.goal.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nilev.goal.entity.Goal;
import com.nilev.goal.entity.GoalStatus;
import com.nilev.goal.entity.GoalType;

import java.time.Instant;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

public class GoalResponse {

    private Long id;
    private Long ownerId;
    private String ownerName;
    private Long partnerId;
    private String partnerName;
    private String title;
    private String description;
    private String category;
    private GoalType type;
    private Double targetValue;
    private Double currentValue;
    private String unit;
    private LocalDate startDate;
    private LocalDate targetDate;
    private Long daysRemaining;
    private GoalStatus status;
    private Double percentage;
    private boolean isImportant;
    private String icon;
    private String color;
    private boolean isMine;
    private boolean canContribute;
    private Instant createdAt;
    private Instant updatedAt;

    public GoalResponse() {}

    public static GoalResponse fromEntity(Goal g, Long currentUserId) {
        GoalResponse r = new GoalResponse();
        r.setId(g.getId());
        r.setOwnerId(g.getOwner().getId());
        r.setOwnerName(g.getOwner().getName());

        if (g.getPartner() != null) {
            r.setPartnerId(g.getPartner().getId());
            r.setPartnerName(g.getPartner().getName());
        }

        r.setTitle(g.getTitle());
        r.setDescription(g.getDescription());
        r.setCategory(g.getCategory());
        r.setType(g.getType());
        r.setTargetValue(g.getTargetValue());
        r.setCurrentValue(g.getCurrentValue());
        r.setUnit(g.getUnit());
        r.setStartDate(g.getStartDate());
        r.setTargetDate(g.getTargetDate());

        if (g.getTargetDate() != null) {
            r.setDaysRemaining(ChronoUnit.DAYS.between(LocalDate.now(), g.getTargetDate()));
        } else {
            r.setDaysRemaining(null);
        }

        r.setStatus(g.getStatus());
        r.setPercentage(Math.round(g.getPercentage() * 10.0) / 10.0);
        r.setImportant(g.isImportant());
        r.setIcon(g.getIcon());
        r.setColor(g.getColor());

        boolean mine = g.getOwner().getId().equals(currentUserId);
        r.setMine(mine);

        // Can contribute if it's mine OR if it's a shared goal
        boolean partnerUser = g.getPartner() != null && g.getPartner().getId().equals(currentUserId);
        r.setCanContribute(mine || g.getType() == GoalType.SHARED || partnerUser);

        r.setCreatedAt(g.getCreatedAt());
        r.setUpdatedAt(g.getUpdatedAt());
        return r;
    }

    // ── Getters & Setters ───────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }

    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }

    public Long getPartnerId() { return partnerId; }
    public void setPartnerId(Long partnerId) { this.partnerId = partnerId; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

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

    public Long getDaysRemaining() { return daysRemaining; }
    public void setDaysRemaining(Long daysRemaining) { this.daysRemaining = daysRemaining; }

    public GoalStatus getStatus() { return status; }
    public void setStatus(GoalStatus status) { this.status = status; }

    public Double getPercentage() { return percentage; }
    public void setPercentage(Double percentage) { this.percentage = percentage; }

    @JsonProperty("isImportant")
    public boolean isImportant() { return isImportant; }
    public void setImportant(boolean important) { isImportant = important; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getColor() { return color; }
    public void setColor(String color) { this.color = color; }

    @JsonProperty("isMine")
    public boolean isMine() { return isMine; }
    public void setMine(boolean mine) { isMine = mine; }

    public boolean isCanContribute() { return canContribute; }
    public void setCanContribute(boolean canContribute) { this.canContribute = canContribute; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
