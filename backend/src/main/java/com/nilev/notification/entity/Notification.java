package com.nilev.notification.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.Instant;

/**
 * Meaningful partner, habit, and milestone alerts.
 * Not every tiny database change creates a notification — only high-signal couple events.
 */
@Entity
@Table(name = "notifications", indexes = {
        @Index(name = "idx_notif_user_read", columnList = "user_id, is_read"),
        @Index(name = "idx_notif_user_created", columnList = "user_id, created_at DESC")
})
public class Notification extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id")
    private User actor;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 40)
    private NotificationType type;

    @NotBlank
    @Size(max = 150)
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @NotBlank
    @Size(max = 500)
    @Column(name = "message", nullable = false, length = 500)
    private String message;

    @Column(name = "icon", length = 30)
    private String icon = "✨";

    @Column(name = "reference_id")
    private Long referenceId;

    @Column(name = "reference_type", length = 50)
    private String referenceType;

    @Column(name = "action_url", length = 255)
    private String actionUrl;

    @Column(name = "is_read", nullable = false)
    private boolean isRead = false;

    @Column(name = "read_at")
    private Instant readAt;

    public Notification() {}

    public Notification(User user, User actor, NotificationType type, String title, String message, String icon, Long referenceId, String referenceType, String actionUrl) {
        this.user = user;
        this.actor = actor;
        this.type = type;
        this.title = title;
        this.message = message;
        this.icon = icon != null ? icon : (type != null ? type.getEmoji() : "✨");
        this.referenceId = referenceId;
        this.referenceType = referenceType;
        this.actionUrl = actionUrl;
        this.isRead = false;
    }

    // ── Getters & Setters ───────────────────────────────────────────

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getReferenceType() { return referenceType; }
    public void setReferenceType(String referenceType) { this.referenceType = referenceType; }

    public String getActionUrl() { return actionUrl; }
    public void setActionUrl(String actionUrl) { this.actionUrl = actionUrl; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public Instant getReadAt() { return readAt; }
    public void setReadAt(Instant readAt) { this.readAt = readAt; }

    public void markAsRead() {
        this.isRead = true;
        this.readAt = Instant.now();
    }

    // ── Builder Pattern ─────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User user;
        private User actor;
        private NotificationType type;
        private String title;
        private String message;
        private String icon;
        private Long referenceId;
        private String referenceType;
        private String actionUrl;

        public Builder user(User user) { this.user = user; return this; }
        public Builder actor(User actor) { this.actor = actor; return this; }
        public Builder type(NotificationType type) { this.type = type; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder message(String message) { this.message = message; return this; }
        public Builder icon(String icon) { this.icon = icon; return this; }
        public Builder referenceId(Long referenceId) { this.referenceId = referenceId; return this; }
        public Builder referenceType(String referenceType) { this.referenceType = referenceType; return this; }
        public Builder actionUrl(String actionUrl) { this.actionUrl = actionUrl; return this; }

        public Notification build() {
            return new Notification(user, actor, type, title, message, icon, referenceId, referenceType, actionUrl);
        }
    }
}
