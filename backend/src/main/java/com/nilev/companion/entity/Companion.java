package com.nilev.companion.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDate;

/**
 * A personal virtual companion owned by a single user.
 * Exactly one companion per user. Not shared, but viewable by connected partner.
 */
@Entity
@Table(name = "companions", indexes = {
        @Index(name = "idx_companion_user", columnList = "user_id", unique = true)
})
public class Companion extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "animal_type", nullable = false, length = 30)
    private AnimalType animalType = AnimalType.WOLF;

    @NotBlank
    @Size(max = 50)
    @Column(name = "name", nullable = false, length = 50)
    private String name = "Nova";

    @NotNull
    @Min(1)
    @Column(name = "level", nullable = false)
    private int level = 1;

    @NotNull
    @Min(0)
    @Column(name = "xp", nullable = false)
    private int xp = 0;

    @Min(0)
    @Max(100)
    @Column(name = "happiness", nullable = false)
    private int happiness = 85;

    @Min(0)
    @Max(100)
    @Column(name = "energy", nullable = false)
    private int energy = 90;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "mood", nullable = false, length = 30)
    private CompanionMood mood = CompanionMood.HAPPY;

    @Column(name = "last_interaction_date")
    private LocalDate lastInteractionDate = LocalDate.now();

    @Column(name = "daily_interactions_count", nullable = false)
    private Integer dailyInteractionsCount = 0;

    public Companion() {}

    public Companion(User user, AnimalType animalType, String name) {
        this.user = user;
        this.animalType = animalType != null ? animalType : AnimalType.WOLF;
        this.name = name != null && !name.isBlank() ? name : "Nova";
        this.level = 1;
        this.xp = 0;
        this.happiness = 85;
        this.energy = 90;
        this.mood = CompanionMood.HAPPY;
        this.lastInteractionDate = LocalDate.now();
        this.dailyInteractionsCount = 0;
    }

    // ── Getters & Setters ───────────────────────────────────────────

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public AnimalType getAnimalType() { return animalType; }
    public void setAnimalType(AnimalType animalType) { this.animalType = animalType; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getLevel() { return level; }
    public void setLevel(int level) { this.level = level; }

    public int getXp() { return xp; }
    public void setXp(int xp) { this.xp = xp; }

    public int getHappiness() { return happiness; }
    public void setHappiness(int happiness) { this.happiness = Math.min(100, Math.max(0, happiness)); }

    public int getEnergy() { return energy; }
    public void setEnergy(int energy) { this.energy = Math.min(100, Math.max(0, energy)); }

    public CompanionMood getMood() { return mood; }
    public void setMood(CompanionMood mood) { this.mood = mood; }

    public LocalDate getLastInteractionDate() { return lastInteractionDate; }
    public void setLastInteractionDate(LocalDate lastInteractionDate) { this.lastInteractionDate = lastInteractionDate; }

    public int getDailyInteractionsCount() { return dailyInteractionsCount != null ? dailyInteractionsCount : 0; }
    public void setDailyInteractionsCount(Integer dailyInteractionsCount) { this.dailyInteractionsCount = dailyInteractionsCount != null ? dailyInteractionsCount : 0; }

    // ── Builder ─────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User user;
        private AnimalType animalType = AnimalType.WOLF;
        private String name = "Nova";
        private int level = 1;
        private int xp = 0;
        private int happiness = 85;
        private int energy = 90;
        private CompanionMood mood = CompanionMood.HAPPY;

        public Builder user(User user) { this.user = user; return this; }
        public Builder animalType(AnimalType animalType) { this.animalType = animalType; return this; }
        public Builder name(String name) { this.name = name; return this; }
        public Builder level(int level) { this.level = level; return this; }
        public Builder xp(int xp) { this.xp = xp; return this; }
        public Builder happiness(int happiness) { this.happiness = happiness; return this; }
        public Builder energy(int energy) { this.energy = energy; return this; }
        public Builder mood(CompanionMood mood) { this.mood = mood; return this; }

        public Companion build() {
            Companion c = new Companion();
            c.setUser(user);
            c.setAnimalType(animalType != null ? animalType : AnimalType.WOLF);
            c.setName(name != null && !name.isBlank() ? name : "Nova");
            c.setLevel(level > 0 ? level : 1);
            c.setXp(Math.max(0, xp));
            c.setHappiness(Math.min(100, Math.max(0, happiness)));
            c.setEnergy(Math.min(100, Math.max(0, energy)));
            c.setMood(mood != null ? mood : CompanionMood.HAPPY);
            c.setLastInteractionDate(LocalDate.now());
            return c;
        }
    }
}
