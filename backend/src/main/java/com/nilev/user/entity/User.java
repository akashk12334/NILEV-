package com.nilev.user.entity;

import com.nilev.common.BaseEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users")
public class User extends BaseEntity {

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 150)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Column(name = "avatar_url", length = 500)
    private String avatarUrl;

    @Column(name = "last_login_at")
    private Instant lastLoginAt;

    @Column(nullable = false)
    private boolean active = true;

    @Column(length = 30)
    private String role = "USER";

    @Column(nullable = false)
    private int xp = 150;

    @Column(nullable = false)
    private int level = 1;

    @Column(nullable = false)
    private int streak = 3;

    @Column(name = "companion_name", length = 50)
    private String companionName = "Starlight";

    @Column(name = "companion_type", length = 50)
    private String companionType = "CELESTIAL_FOX";

    @Column(name = "companion_level", nullable = false)
    private int companionLevel = 1;

    @Column(name = "companion_mood", length = 50)
    private String companionMood = "Joyful";

    @Column(name = "habits_completed_count", nullable = false)
    private int habitsCompletedCount = 12;

    @Column(name = "goals_count", nullable = false)
    private int goalsCount = 3;

    public User() {
    }

    public User(String name, String email, String passwordHash, String avatarUrl,
                Instant lastLoginAt, boolean active, String role) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.avatarUrl = avatarUrl;
        this.lastLoginAt = lastLoginAt;
        this.active = active;
        this.role = role != null ? role : "USER";
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public int getXp() {
        return xp;
    }

    public void setXp(int xp) {
        this.xp = xp;
    }

    public int getLevel() {
        return level;
    }

    public void setLevel(int level) {
        this.level = level;
    }

    public int getStreak() {
        return streak;
    }

    public void setStreak(int streak) {
        this.streak = streak;
    }

    public String getCompanionName() {
        return companionName;
    }

    public void setCompanionName(String companionName) {
        this.companionName = companionName;
    }

    public String getCompanionType() {
        return companionType;
    }

    public void setCompanionType(String companionType) {
        this.companionType = companionType;
    }

    public int getCompanionLevel() {
        return companionLevel;
    }

    public void setCompanionLevel(int companionLevel) {
        this.companionLevel = companionLevel;
    }

    public String getCompanionMood() {
        return companionMood;
    }

    public void setCompanionMood(String companionMood) {
        this.companionMood = companionMood;
    }

    public int getHabitsCompletedCount() {
        return habitsCompletedCount;
    }

    public void setHabitsCompletedCount(int habitsCompletedCount) {
        this.habitsCompletedCount = habitsCompletedCount;
    }

    public int getGoalsCount() {
        return goalsCount;
    }

    public void setGoalsCount(int goalsCount) {
        this.goalsCount = goalsCount;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private String name;
        private String email;
        private String passwordHash;
        private String avatarUrl;
        private Instant lastLoginAt;
        private boolean active = true;
        private String role = "USER";
        private int xp = 150;
        private int level = 1;
        private int streak = 3;
        private String companionName = "Starlight";
        private String companionType = "CELESTIAL_FOX";
        private int companionLevel = 1;
        private String companionMood = "Joyful";
        private int habitsCompletedCount = 12;
        private int goalsCount = 3;

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder passwordHash(String passwordHash) {
            this.passwordHash = passwordHash;
            return this;
        }

        public Builder avatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
            return this;
        }

        public Builder lastLoginAt(Instant lastLoginAt) {
            this.lastLoginAt = lastLoginAt;
            return this;
        }

        public Builder active(boolean active) {
            this.active = active;
            return this;
        }

        public Builder role(String role) {
            this.role = role;
            return this;
        }

        public Builder xp(int xp) {
            this.xp = xp;
            return this;
        }

        public Builder level(int level) {
            this.level = level;
            return this;
        }

        public Builder streak(int streak) {
            this.streak = streak;
            return this;
        }

        public Builder companionName(String companionName) {
            this.companionName = companionName;
            return this;
        }

        public Builder companionType(String companionType) {
            this.companionType = companionType;
            return this;
        }

        public Builder companionLevel(int companionLevel) {
            this.companionLevel = companionLevel;
            return this;
        }

        public Builder companionMood(String companionMood) {
            this.companionMood = companionMood;
            return this;
        }

        public Builder habitsCompletedCount(int habitsCompletedCount) {
            this.habitsCompletedCount = habitsCompletedCount;
            return this;
        }

        public Builder goalsCount(int goalsCount) {
            this.goalsCount = goalsCount;
            return this;
        }

        public User build() {
            User user = new User(name, email, passwordHash, avatarUrl, lastLoginAt, active, role);
            user.setXp(this.xp);
            user.setLevel(this.level);
            user.setStreak(this.streak);
            user.setCompanionName(this.companionName);
            user.setCompanionType(this.companionType);
            user.setCompanionLevel(this.companionLevel);
            user.setCompanionMood(this.companionMood);
            user.setHabitsCompletedCount(this.habitsCompletedCount);
            user.setGoalsCount(this.goalsCount);
            return user;
        }
    }
}
