package com.nilev.activity.dto;

import com.nilev.activity.entity.ActivityType;

import java.time.Instant;
import java.util.Map;

/**
 * Full activity response including actor info, reactions, and whether
 * the viewer reacted to it.
 */
public class ActivityResponse {

    private Long id;
    private Long actorId;
    private String actorName;
    private String actorAvatarUrl;
    private ActivityType type;
    private Long referenceId;
    private String title;
    private String description;
    private String icon;
    private String metadata;
    private Map<String, Long> reactions;   // {"❤️": 2, "🔥": 1}
    private Map<String, Boolean> myReactions; // which ones the viewer already reacted with
    private boolean isMine;                 // true if actor == current viewer
    private Instant createdAt;

    // ── getters & setters ──────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

    public String getActorAvatarUrl() { return actorAvatarUrl; }
    public void setActorAvatarUrl(String actorAvatarUrl) { this.actorAvatarUrl = actorAvatarUrl; }

    public ActivityType getType() { return type; }
    public void setType(ActivityType type) { this.type = type; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public Map<String, Long> getReactions() { return reactions; }
    public void setReactions(Map<String, Long> reactions) { this.reactions = reactions; }

    public Map<String, Boolean> getMyReactions() { return myReactions; }
    public void setMyReactions(Map<String, Boolean> myReactions) { this.myReactions = myReactions; }

    @com.fasterxml.jackson.annotation.JsonProperty("isMine")
    public boolean isMine() { return isMine; }
    public void setMine(boolean mine) { isMine = mine; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
