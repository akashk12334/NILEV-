package com.nilev.activity.dto;

import java.util.Map;

/** Response after toggling a reaction on an activity. */
public class ReactionResponse {
    private Long activityId;
    private String emoji;
    private boolean added;           // true = reaction added, false = removed
    private Map<String, Long> reactions; // updated totals

    public ReactionResponse() {}

    public ReactionResponse(Long activityId, String emoji, boolean added, Map<String, Long> reactions) {
        this.activityId = activityId;
        this.emoji = emoji;
        this.added = added;
        this.reactions = reactions;
    }

    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }

    public boolean isAdded() { return added; }
    public void setAdded(boolean added) { this.added = added; }

    public Map<String, Long> getReactions() { return reactions; }
    public void setReactions(Map<String, Long> reactions) { this.reactions = reactions; }
}
