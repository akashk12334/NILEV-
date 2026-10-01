package com.nilev.surprise.entity;

/**
 * Lifecycle states of a surprise.
 */
public enum SurpriseStatus {
    DRAFT("Draft", "Saved locally, not yet visible or dispatched to partner"),
    SCHEDULED("Scheduled", "Time-locked with a scheduled delivery time in the future"),
    DELIVERED("Delivered", "Ready and waiting for partner to unseal and reveal"),
    OPENED("Opened", "Unsealed and enjoyed by the partner");

    private final String displayName;
    private final String description;

    SurpriseStatus(String displayName, String description) {
        this.displayName = displayName;
        this.description = description;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getDescription() {
        return description;
    }
}
