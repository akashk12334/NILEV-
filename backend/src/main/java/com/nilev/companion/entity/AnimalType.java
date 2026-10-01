package com.nilev.companion.entity;

/**
 * Initial animals available in NILEV.
 */
public enum AnimalType {
    WOLF,
    RABBIT,
    FOX,
    CAT,
    DOG,
    BEAR,
    PANDA,
    TIGER,
    DEER,
    PENGUIN;

    public String getDisplayName() {
        return name().charAt(0) + name().substring(1).toLowerCase();
    }

    public String getEmoji() {
        return switch (this) {
            case WOLF -> "🐺";
            case RABBIT -> "🐰";
            case FOX -> "🦊";
            case CAT -> "🐱";
            case DOG -> "🐶";
            case BEAR -> "🐻";
            case PANDA -> "🐼";
            case TIGER -> "🐯";
            case DEER -> "🦌";
            case PENGUIN -> "🐧";
        };
    }
}
