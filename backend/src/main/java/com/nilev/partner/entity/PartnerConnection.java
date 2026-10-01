package com.nilev.partner.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "partner_connections")
public class PartnerConnection extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user1_id", nullable = false)
    private User user1;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user2_id", nullable = false)
    private User user2;

    @Column(name = "connected_at", nullable = false)
    private Instant connectedAt = Instant.now();

    @Column(name = "active", nullable = false)
    private boolean active = true;

    @Column(name = "shared_streak", nullable = false)
    private int sharedStreak = 1;

    public PartnerConnection() {
    }

    public PartnerConnection(User user1, User user2, Instant connectedAt, boolean active, int sharedStreak) {
        this.user1 = user1;
        this.user2 = user2;
        this.connectedAt = connectedAt != null ? connectedAt : Instant.now();
        this.active = active;
        this.sharedStreak = sharedStreak;
    }

    public boolean containsUser(Long userId) {
        if (userId == null) return false;
        return (user1 != null && userId.equals(user1.getId())) ||
               (user2 != null && userId.equals(user2.getId()));
    }

    public User getPartnerOf(Long userId) {
        if (userId == null) return null;
        if (user1 != null && userId.equals(user1.getId())) {
            return user2;
        } else if (user2 != null && userId.equals(user2.getId())) {
            return user1;
        }
        return null;
    }

    public User getUser1() {
        return user1;
    }

    public void setUser1(User user1) {
        this.user1 = user1;
    }

    public User getUser2() {
        return user2;
    }

    public void setUser2(User user2) {
        this.user2 = user2;
    }

    public Instant getConnectedAt() {
        return connectedAt;
    }

    public void setConnectedAt(Instant connectedAt) {
        this.connectedAt = connectedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public int getSharedStreak() {
        return sharedStreak;
    }

    public void setSharedStreak(int sharedStreak) {
        this.sharedStreak = sharedStreak;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private User user1;
        private User user2;
        private Instant connectedAt = Instant.now();
        private boolean active = true;
        private int sharedStreak = 1;

        public Builder user1(User user1) {
            this.user1 = user1;
            return this;
        }

        public Builder user2(User user2) {
            this.user2 = user2;
            return this;
        }

        public Builder connectedAt(Instant connectedAt) {
            this.connectedAt = connectedAt;
            return this;
        }

        public Builder active(boolean active) {
            this.active = active;
            return this;
        }

        public Builder sharedStreak(int sharedStreak) {
            this.sharedStreak = sharedStreak;
            return this;
        }

        public PartnerConnection build() {
            return new PartnerConnection(user1, user2, connectedAt, active, sharedStreak);
        }
    }
}
