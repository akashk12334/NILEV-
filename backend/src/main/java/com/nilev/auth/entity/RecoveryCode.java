package com.nilev.auth.entity;

import com.nilev.user.entity.User;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Entity representing an account recovery code.
 * For maximum security, only the SHA-256 hash of the recovery code is persisted.
 */
@Entity
@Table(name = "user_recovery_codes", indexes = {
        @Index(name = "idx_recovery_codes_hash", columnList = "code_hash", unique = true),
        @Index(name = "idx_recovery_codes_user", columnList = "user_id", unique = true)
})
public class RecoveryCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "code_hash", nullable = false, length = 64, unique = true)
    private String codeHash;

    @Column(name = "used_at")
    private Instant usedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public RecoveryCode() {
    }

    public RecoveryCode(Long id, User user, String codeHash, Instant usedAt, Instant createdAt) {
        this.id = id;
        this.user = user;
        this.codeHash = codeHash;
        this.usedAt = usedAt;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public void setCodeHash(String codeHash) {
        this.codeHash = codeHash;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(Instant usedAt) {
        this.usedAt = usedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private String codeHash;
        private Instant usedAt;
        private Instant createdAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder codeHash(String codeHash) {
            this.codeHash = codeHash;
            return this;
        }

        public Builder usedAt(Instant usedAt) {
            this.usedAt = usedAt;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public RecoveryCode build() {
            return new RecoveryCode(id, user, codeHash, usedAt, createdAt);
        }
    }
}

