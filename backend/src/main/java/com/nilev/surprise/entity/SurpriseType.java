package com.nilev.surprise.entity;

/**
 * Types of surprises a partner can craft and send.
 */
public enum SurpriseType {
    MESSAGE("Secret Message", "💌", "Heartfelt note or personal words of devotion"),
    IMAGE("Visual Memory", "📸", "A special photo, memory capture, or visual tribute"),
    CHALLENGE("Playful Challenge", "⚡", "Fun couples quest, spontaneous dare, or adventure"),
    REWARD("Couples Reward", "🎟️", "Special coupon, privilege, breakfast in bed, or treat"),
    MEMORY("Nostalgic Memory", "💫", "Remembering a shared milestone or cherished moment"),
    CUSTOM("Custom Wonder", "🎁", "A unique personalized surprise designed just for them");

    private final String displayName;
    private final String emoji;
    private final String description;

    SurpriseType(String displayName, String emoji, String description) {
        this.displayName = displayName;
        this.emoji = emoji;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmoji() {
        return emoji;
    }

    public String getDescription() {
        return description;
    }
}
