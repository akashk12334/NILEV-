package com.nilev.auth.dto;

import java.time.Instant;

/**
 * Public User Response DTO.
 * Explicitly excludes passwordHash to guarantee security.
 */
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String nickname;
    private String avatarUrl;
    private String profileImageUrl;
    private Instant createdAt;
    private Instant updatedAt;
    private Instant lastLoginAt;
    private boolean active;

    public UserResponse() {
    }

    public UserResponse(Long id, String name, String email, String avatarUrl,
                        Instant createdAt, Instant updatedAt, Instant lastLoginAt, boolean active) {
        this(id, name, email, null, avatarUrl, createdAt, updatedAt, lastLoginAt, active);
    }

    public UserResponse(Long id, String name, String email, String nickname, String avatarUrl,
                        Instant createdAt, Instant updatedAt, Instant lastLoginAt, boolean active) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.nickname = nickname;
        this.avatarUrl = avatarUrl;
        this.profileImageUrl = avatarUrl;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.lastLoginAt = lastLoginAt;
        this.active = active;
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

    public String getNickname() {
        return nickname;
    }

    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    public String getProfileImageUrl() {
        return profileImageUrl != null ? profileImageUrl : avatarUrl;
    }

    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
        this.avatarUrl = profileImageUrl;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
        this.profileImageUrl = avatarUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
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

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private String name;
        private String email;
        private String nickname;
        private String avatarUrl;
        private String profileImageUrl;
        private Instant createdAt;
        private Instant updatedAt;
        private Instant lastLoginAt;
        private boolean active = true;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder name(String name) {
            this.name = name;
            return this;
        }

        public Builder email(String email) {
            this.email = email;
            return this;
        }

        public Builder nickname(String nickname) {
            this.nickname = nickname;
            return this;
        }

        public Builder avatarUrl(String avatarUrl) {
            this.avatarUrl = avatarUrl;
            this.profileImageUrl = avatarUrl;
            return this;
        }

        public Builder profileImageUrl(String profileImageUrl) {
            this.profileImageUrl = profileImageUrl;
            this.avatarUrl = profileImageUrl;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(Instant updatedAt) {
            this.updatedAt = updatedAt;
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

        public UserResponse build() {
            return new UserResponse(id, name, email, nickname, avatarUrl != null ? avatarUrl : profileImageUrl, createdAt, updatedAt, lastLoginAt, active);
        }
    }
}
