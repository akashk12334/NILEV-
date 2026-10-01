package com.nilev.companion.service;

/**
 * Deterministic Level and XP calculation utility for NILEV Companions.
 *
 * Progression curve:
 * - Level 1: 0 - 99 XP (100 XP required to level up)
 * - Level 2: 100 - 249 XP (150 XP required to level up)
 * - Level 3: 250 - 449 XP (200 XP required to level up)
 * - Level 4: 450 - 699 XP (250 XP required to level up)
 * - Level 5: 700 - 999 XP (300 XP required to level up)
 *
 * In general: XP required to advance from Level L to L+1 is 100 + (L - 1) * 50.
 */
public final class CompanionLevelCalculator {

    private CompanionLevelCalculator() {}

    /**
     * Total cumulative XP required to reach level L from 0.
     */
    public static int getCumulativeXpForLevel(int level) {
        if (level <= 1) return 0;
        int total = 0;
        for (int l = 1; l < level; l++) {
            total += getXpRequiredForLevel(l);
        }
        return total;
    }

    /**
     * XP required to advance from 'level' to 'level + 1'.
     */
    public static int getXpRequiredForLevel(int level) {
        return 100 + Math.max(0, level - 1) * 50;
    }

    /**
     * Deterministically calculates current level from total cumulative XP.
     */
    public static int calculateLevelFromXp(int totalXp) {
        if (totalXp <= 0) return 1;
        int level = 1;
        while (totalXp >= getCumulativeXpForLevel(level + 1)) {
            level++;
        }
        return level;
    }

    /**
     * Calculates percentage progress towards the next level (0.0 to 100.0).
     */
    public static double calculateProgressPercentage(int totalXp, int currentLevel) {
        int base = getCumulativeXpForLevel(currentLevel);
        int next = getCumulativeXpForLevel(currentLevel + 1);
        int span = next - base;
        if (span <= 0) return 100.0;
        int earnedInCurrentLevel = Math.max(0, totalXp - base);
        double pct = ((double) earnedInCurrentLevel / span) * 100.0;
        return Math.min(100.0, Math.max(0.0, Math.round(pct * 10.0) / 10.0));
    }
}
