package com.nilev.companion.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.nilev.companion.entity.AnimalType;
import com.nilev.companion.entity.Companion;
import com.nilev.companion.entity.CompanionMood;
import com.nilev.companion.service.CompanionLevelCalculator;

import java.time.Instant;

public class CompanionResponse {

    private Long id;
    private Long userId;
    private String userName;
    private AnimalType animalType;
    private String animalEmoji;
    private String name;
    private int level;
    private int xp;
    private int currentLevelBaseXp;
    private int nextLevelXp;
    private int levelProgressXp;
    private int levelTargetXp;
    private double levelProgressPercentage;
    private int happiness;
    private int energy;
    private CompanionMood mood;
    private String moodEmoji;
    private String moodDescription;
    private boolean isMine;
    private Instant createdAt;
    private Instant updatedAt;

    public CompanionResponse() {}

    public static CompanionResponse fromEntity(Companion c, Long currentUserId) {
        CompanionResponse r = new CompanionResponse();
        r.setId(c.getId());
        r.setUserId(c.getUser().getId());
        r.setUserName(c.getUser().getName());
        r.setAnimalType(c.getAnimalType());
        r.setAnimalEmoji(c.getAnimalType().getEmoji());
        r.setName(c.getName());

        int lvl = c.getLevel();
        int totalXp = c.getXp();
        int baseXp = CompanionLevelCalculator.getCumulativeXpForLevel(lvl);
        int nextXp = CompanionLevelCalculator.getCumulativeXpForLevel(lvl + 1);

        r.setLevel(lvl);
        r.setXp(totalXp);
        r.setCurrentLevelBaseXp(baseXp);
        r.setNextLevelXp(nextXp);
        r.setLevelProgressXp(Math.max(0, totalXp - baseXp));
        r.setLevelTargetXp(nextXp - baseXp);
        r.setLevelProgressPercentage(CompanionLevelCalculator.calculateProgressPercentage(totalXp, lvl));

        r.setHappiness(c.getHappiness());
        r.setEnergy(c.getEnergy());
        r.setMood(c.getMood());
        r.setMoodEmoji(c.getMood().getEmoji());
        r.setMoodDescription(c.getMood().getDescription());

        r.setMine(c.getUser().getId().equals(currentUserId));
        r.setCreatedAt(c.getCreatedAt());
        r.setUpdatedAt(c.getUpdatedAt());
        return r;
    }

    // ── Getters & Setters ───────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public AnimalType getAnimalType() { return animalType; }
    public void setAnimalType(AnimalType animalType) { this.animalType = animalType; }

    public String getAnimalEmoji() { return animalEmoji; }
    public void setAnimalEmoji(String animalEmoji) { this.animalEmoji = animalEmoji; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }

    public int getCurrentLevelBaseXp() { return currentLevelBaseXp; }
    public void setCurrentLevelBaseXp(int currentLevelBaseXp) { this.currentLevelBaseXp = currentLevelBaseXp; }

    public int getNextLevelXp() { return nextLevelXp; }
    public void setNextLevelXp(int nextLevelXp) { this.nextLevelXp = nextLevelXp; }

    public int getLevelProgressXp() { return levelProgressXp; }
    public void setLevelProgressXp(int levelProgressXp) { this.levelProgressXp = levelProgressXp; }

    public int getLevelTargetXp() { return levelTargetXp; }
    public void setLevelTargetXp(int levelTargetXp) { this.levelTargetXp = levelTargetXp; }

    public double getLevelProgressPercentage() { return levelProgressPercentage; }
    public void setLevelProgressPercentage(double levelProgressPercentage) { this.levelProgressPercentage = levelProgressPercentage; }

    public int getHappiness() { return happiness; }
    public void setHappiness(int happiness) { this.happiness = happiness; }

    public int getEnergy() { return energy; }
    public void setEnergy(int energy) { this.energy = energy; }

    public CompanionMood getMood() { return mood; }
    public void setMood(CompanionMood mood) { this.mood = mood; }

    public String getMoodEmoji() { return moodEmoji; }
    public void setMoodEmoji(String moodEmoji) { this.moodEmoji = moodEmoji; }

    public String getMoodDescription() { return moodDescription; }
    public void setMoodDescription(String moodDescription) { this.moodDescription = moodDescription; }

    @JsonProperty("isMine")
    public boolean isMine() { return isMine; }
    public void setMine(boolean mine) { isMine = mine; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
