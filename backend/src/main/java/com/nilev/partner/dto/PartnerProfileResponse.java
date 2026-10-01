package com.nilev.partner.dto;

import com.nilev.user.entity.User;

public class PartnerProfileResponse {

    private Long id;
    private String name;
    private String email;
    private String avatarUrl;
    private int xp;
    private int level;
    private int streak;
    private String companionName;
    private String companionType;
    private int companionLevel;
    private String companionMood;
    private int habitsCompletedCount;
    private int goalsCount;

    @com.fasterxml.jackson.annotation.JsonProperty("isPartner")
    private boolean isPartner;
    private boolean readOnly;

    public PartnerProfileResponse() {
    }

    public PartnerProfileResponse(Long id, String name, String email, String avatarUrl,
                                  int xp, int level, int streak,
                                  String companionName, String companionType, int companionLevel, String companionMood,
                                  int habitsCompletedCount, int goalsCount,
                                  boolean isPartner, boolean readOnly) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.avatarUrl = avatarUrl;
        this.xp = xp;
        this.level = level;
        this.streak = streak;
        this.companionName = companionName;
        this.companionType = companionType;
        this.companionLevel = companionLevel;
        this.companionMood = companionMood;
        this.habitsCompletedCount = habitsCompletedCount;
        this.goalsCount = goalsCount;
        this.isPartner = isPartner;
        this.readOnly = readOnly;
    }

    public static PartnerProfileResponse fromUser(User user, boolean isPartner) {
        if (user == null) return null;
        return new PartnerProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getAvatarUrl(),
                user.getXp(),
                user.getLevel(),
                user.getStreak(),
                user.getCompanionName(),
                user.getCompanionType(),
                user.getCompanionLevel(),
                user.getCompanionMood(),
                user.getHabitsCompletedCount(),
                user.getGoalsCount(),
                isPartner,
                isPartner // If isPartner == true, readOnly == true!
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
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

    @com.fasterxml.jackson.annotation.JsonProperty("isPartner")
    public boolean isPartner() {
        return isPartner;
    }

    public void setPartner(boolean partner) {
        isPartner = partner;
    }

    public boolean isReadOnly() {
        return readOnly;
    }

    public void setReadOnly(boolean readOnly) {
        this.readOnly = readOnly;
    }
}
