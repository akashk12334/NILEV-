package com.nilev.companion.entity;

import com.nilev.common.BaseEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Historical event log for companion XP gains, evolution/level-ups, and mood shifts.
 */
@Entity
@Table(name = "companion_history", indexes = {
        @Index(name = "idx_companion_history_comp", columnList = "companion_id"),
        @Index(name = "idx_companion_history_created", columnList = "created_at DESC")
})
public class CompanionHistory extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "companion_id", nullable = false)
    private Companion companion;

    @NotNull
    @Column(name = "event_type", nullable = false, length = 50)
    private String eventType;

    @Column(name = "xp_gained", nullable = false)
    private int xpGained = 0;

    @Size(max = 100)
    @Column(name = "title", nullable = false, length = 100)
    private String title;

    @Size(max = 300)
    @Column(name = "description", length = 300)
    private String description;

    @Column(name = "icon", length = 20)
    private String icon = "✨";

    public CompanionHistory() {}

    public CompanionHistory(Companion companion, String eventType, int xpGained, String title, String description, String icon) {
        this.companion = companion;
        this.eventType = eventType;
        this.xpGained = xpGained;
        this.title = title;
        this.description = description;
        this.icon = icon != null ? icon : "✨";
    }

    public Companion getCompanion() { return companion; }
    public void setCompanion(Companion companion) { this.companion = companion; }

    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }

    public int getXpGained() { return xpGained; }
    public void setXpGained(int xpGained) { this.xpGained = xpGained; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }
}
