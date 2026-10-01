package com.nilev.activity.entity;

/**
 * All supported activity event types in NILEV.
 * Activities are generated automatically from domain actions — never manually.
 */
public enum ActivityType {
    HABIT_COMPLETED,
    HABIT_STREAK,
    GOAL_PROGRESS,
    GOAL_COMPLETED,
    COMPANION_LEVEL_UP,
    ACHIEVEMENT_UNLOCKED,
    SURPRISE_SENT,
    SURPRISE_OPENED,
    PARTNER_CONNECTED,
    PARTNER_INVITATION_SENT
}
