package com.nilev.auth.entity;

import com.nilev.user.entity.User;
import jakarta.persistence.*;

import java.time.Instant;

/**
 * Entity representing an admin-assisted password reset request.
 * Contains the BCrypt-encoded proposed password hash. Plain-text passwords
 * are NEVER stored in this entity or anywhere in the database.
 */
@Entity
@Table(name = "password_reset_requests", indexes = {
        @Index(name = "idx_password_reset_req_status", columnList = "status"),
        @Index(name = "idx_password_reset_req_user", columnList = "user_id"),
        @Index(name = "idx_password_reset_req_expires", columnList = "expires_at")
})
public class PasswordResetRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "proposed_password_hash", nullable = false, length = 255)
    private String proposedPasswordHash;

    @Column(name = "status", nullable = false, length = 20)
    private String status; // PENDING, COMPLETED, REJECTED, EXPIRED, SUPERSEDED

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    @Column(name = "processed_at")
    private Instant processedAt;

    @Column(name = "processed_by_admin_id")
    private Long processedByAdminId;

    @Column(name = "admin_notes", length = 500)
    private String adminNotes;

    public PasswordResetRequest() {
    }

    public PasswordResetRequest(Long id, User user, String proposedPasswordHash, String status,
                                Instant createdAt, Instant expiresAt, Instant processedAt,
                                Long processedByAdminId, String adminNotes) {
        this.id = id;
        this.user = user;
        this.proposedPasswordHash = proposedPasswordHash;
        this.status = status;
        this.createdAt = createdAt != null ? createdAt : Instant.now();
        this.expiresAt = expiresAt;
        this.processedAt = processedAt;
        this.processedByAdminId = processedByAdminId;
        this.adminNotes = adminNotes;
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }

    public boolean isPending() {
        return "PENDING".equalsIgnoreCase(status);
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

    public String getProposedPasswordHash() {
        return proposedPasswordHash;
    }

    public void setProposedPasswordHash(String proposedPasswordHash) {
        this.proposedPasswordHash = proposedPasswordHash;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    public Long getProcessedByAdminId() {
        return processedByAdminId;
    }

    public void setProcessedByAdminId(Long processedByAdminId) {
        this.processedByAdminId = processedByAdminId;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private User user;
        private String proposedPasswordHash;
        private String status;
        private Instant createdAt;
        private Instant expiresAt;
        private Instant processedAt;
        private Long processedByAdminId;
        private String adminNotes;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder proposedPasswordHash(String proposedPasswordHash) {
            this.proposedPasswordHash = proposedPasswordHash;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder createdAt(Instant createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder expiresAt(Instant expiresAt) {
            this.expiresAt = expiresAt;
            return this;
        }

        public Builder processedAt(Instant processedAt) {
            this.processedAt = processedAt;
            return this;
        }

        public Builder processedByAdminId(Long processedByAdminId) {
            this.processedByAdminId = processedByAdminId;
            return this;
        }

        public Builder adminNotes(String adminNotes) {
            this.adminNotes = adminNotes;
            return this;
        }

        public PasswordResetRequest build() {
            return new PasswordResetRequest(id, user, proposedPasswordHash, status,
                    createdAt, expiresAt, processedAt, processedByAdminId, adminNotes);
        }
    }
}

