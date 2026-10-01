package com.nilev.companion.dto;

import com.nilev.companion.entity.CompanionHistory;

import java.time.Instant;

public class CompanionHistoryResponse {

    private Long id;
    private String eventType;
    private int xpGained;
    private String title;
    private String description;
    private String icon;
    private Instant createdAt;

    public CompanionHistoryResponse() {}

    public static CompanionHistoryResponse fromEntity(CompanionHistory h) {
        CompanionHistoryResponse r = new CompanionHistoryResponse();
        r.setId(h.getId());
        r.setEventType(h.getEventType());
        r.setXpGained(h.getXpGained());
        r.setTitle(h.getTitle());
        r.setDescription(h.getDescription());
        r.setIcon(h.getIcon());
        r.setCreatedAt(h.getCreatedAt());
        return r;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
