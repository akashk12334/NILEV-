package com.nilev.surprise.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

/**
 * Surprise entity sent from one partner to another in a connected relationship.
 */
@Entity
@Table(name = "surprises", indexes = {
        @Index(name = "idx_surprise_receiver", columnList = "receiver_id, status"),
        @Index(name = "idx_surprise_sender", columnList = "sender_id, status"),
        @Index(name = "idx_surprise_scheduled", columnList = "scheduled_at")
})
public class Surprise extends BaseEntity {

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 30)
    private SurpriseType type = SurpriseType.MESSAGE;

    @NotBlank
    @Size(max = 150)
    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @NotBlank
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Size(max = 500)
    @Column(name = "media_url", length = 500)
    private String mediaUrl;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    private SurpriseStatus status = SurpriseStatus.DELIVERED;

    public Surprise() {}

    public Surprise(User sender, User receiver, SurpriseType type, String title, String content, String mediaUrl, LocalDateTime scheduledAt, SurpriseStatus status) {
        this.sender = sender;
        this.receiver = receiver;
        this.type = type != null ? type : SurpriseType.MESSAGE;
        this.title = title;
        this.content = content;
        this.mediaUrl = mediaUrl;
        this.scheduledAt = scheduledAt;
        this.status = status != null ? status : SurpriseStatus.DELIVERED;
    }

    // ── Getters & Setters ───────────────────────────────────────────

    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }

    public User getReceiver() { return receiver; }
    public void setReceiver(User receiver) { this.receiver = receiver; }

    public SurpriseType getType() { return type; }
    public void setType(SurpriseType type) { this.type = type; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public LocalDateTime getOpenedAt() { return openedAt; }
    public void setOpenedAt(LocalDateTime openedAt) { this.openedAt = openedAt; }

    public SurpriseStatus getStatus() { return status; }
    public void setStatus(SurpriseStatus status) { this.status = status; }

    public boolean isOpened() {
        return this.status == SurpriseStatus.OPENED;
    }

    // ── Builder Pattern ─────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User sender;
        private User receiver;
        private SurpriseType type = SurpriseType.MESSAGE;
        private String title;
        private String content;
        private String mediaUrl;
        private LocalDateTime scheduledAt;
        private LocalDateTime openedAt;
        private SurpriseStatus status = SurpriseStatus.DELIVERED;

        public Builder sender(User sender) { this.sender = sender; return this; }
        public Builder receiver(User receiver) { this.receiver = receiver; return this; }
        public Builder type(SurpriseType type) { this.type = type; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder content(String content) { this.content = content; return this; }
        public Builder mediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; return this; }
        public Builder scheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; return this; }
        public Builder openedAt(LocalDateTime openedAt) { this.openedAt = openedAt; return this; }
        public Builder status(SurpriseStatus status) { this.status = status; return this; }

        public Surprise build() {
            Surprise s = new Surprise();
            s.setSender(sender);
            s.setReceiver(receiver);
            s.setType(type != null ? type : SurpriseType.MESSAGE);
            s.setTitle(title);
            s.setContent(content);
            s.setMediaUrl(mediaUrl);
            s.setScheduledAt(scheduledAt);
            s.setOpenedAt(openedAt);
            s.setStatus(status != null ? status : SurpriseStatus.DELIVERED);
            return s;
        }
    }
}
