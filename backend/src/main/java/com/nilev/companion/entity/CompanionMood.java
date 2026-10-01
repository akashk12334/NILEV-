package com.nilev.companion.entity;

/**
 * Mood of the companion, influenced by recent user activity.
 */
public enum CompanionMood {
    ECSTATIC("✨", "Floating on pure starlight!"),
    EXCITED("🔥", "Fired up and energized!"),
    HAPPY("😊", "Warm, bright, and cheerful."),
    CONTENT("🌿", "Peaceful and serene."),
    PROUD("🏆", "Standing tall with pride!"),
    RESTING("🌙", "Calmly recharging energy."),
    SLEEPY("💤", "Drowsy, waiting for your next ritual.");

    private final String emoji;
    private final String description;

    CompanionMood(String emoji, String description) {
        this.emoji = emoji;
        this.description = description;
    }

    public String getEmoji() { return emoji; }
    public String getDescription() { return description; }
}
