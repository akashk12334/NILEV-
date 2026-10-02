package com.nilev.notification.entity;

/**
 * All supported notification types in NILEV.
 */
public enum NotificationType {
    PARTNER_CONNECTED("Partner Connected", "💞", "RELATIONSHIP"),
    PARTNER_ACTIVITY("Partner Activity", "✨", "RELATIONSHIP"),
    HABIT_REMINDER("Habit Reminder", "🌱", "HABITS"),
    HABIT_COMPLETED("Habit Completed", "✅", "HABITS"),
    HABIT_DELETED("Habit Removed", "🗑️", "HABITS"),
    GOAL_MILESTONE("Goal Milestone", "🎯", "GOALS"),
    GOAL_COMPLETED("Goal Completed", "🏆", "GOALS"),
    GOAL_DELETED("Goal Removed", "🗑️", "GOALS"),
    COMPANION_LEVEL_UP("Companion Level Up", "⭐", "COMPANION"),
    SURPRISE_RECEIVED("Surprise Received", "🎁", "SURPRISES"),
    SURPRISE_OPENED("Surprise Opened", "💌", "SURPRISES");

    private final String displayName;
    private final String emoji;
    private final String category;

    NotificationType(String displayName, String emoji, String category) {
        this.displayName = displayName;
        this.emoji = emoji;
        this.category = category;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getEmoji() {
        return emoji;
    }

    public String getCategory() {
        return category;
    }
}
