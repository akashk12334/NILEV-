package com.nilev.notification.dto;

import com.nilev.notification.entity.Notification;
import com.nilev.notification.entity.NotificationType;

import java.time.Duration;
import java.time.Instant;

public class NotificationResponse {

    private Long id;
    private NotificationType type;
    private String typeDisplayName;
    private String typeEmoji;
    private String category;
    private String title;
    private String message;
    private String icon;
    private Long actorId;
    private String actorName;
    private Long referenceId;
    private String referenceType;
    private String actionUrl;
    private boolean isRead;
    private Instant readAt;
    private Instant createdAt;
    private String timeAgo;

    public NotificationResponse() {}

    public static NotificationResponse fromEntity(Notification n) {
        NotificationResponse res = new NotificationResponse();
        res.id = n.getId();
        res.type = n.getType();
        res.typeDisplayName = n.getType() != null ? n.getType().getDisplayName() : "Alert";
        res.typeEmoji = n.getType() != null ? n.getType().getEmoji() : "✨";
        res.category = n.getType() != null ? n.getType().getCategory() : "GENERAL";
        res.title = n.getTitle();
        res.message = n.getMessage();
        res.icon = n.getIcon() != null ? n.getIcon() : res.typeEmoji;

        if (n.getActor() != null) {
            res.actorId = n.getActor().getId();
            res.actorName = n.getActor().getName();
        }

        res.referenceId = n.getReferenceId();
        res.referenceType = n.getReferenceType();
        res.actionUrl = n.getActionUrl();
        res.isRead = n.isRead();
        res.readAt = n.getReadAt();
        res.createdAt = n.getCreatedAt();
        res.timeAgo = calculateTimeAgo(n.getCreatedAt());

        return res;
    }

    private static String calculateTimeAgo(Instant createdAt) {
        if (createdAt == null) return "";
        Duration d = Duration.between(createdAt, Instant.now());
        long seconds = d.getSeconds();

        if (seconds < 60) return "Just now";
        long minutes = seconds / 60;
        if (minutes < 60) return minutes + "m ago";
        long hours = minutes / 60;
        if (hours < 24) return hours + "h ago";
        long days = hours / 24;
        if (days == 1) return "Yesterday";
        if (days < 7) return days + "d ago";
        return (days / 7) + "w ago";
    }

    // ── Getters & Setters ───────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public String getTypeDisplayName() { return typeDisplayName; }
    public void setTypeDisplayName(String typeDisplayName) { this.typeDisplayName = typeDisplayName; }

    public String getTypeEmoji() { return typeEmoji; }
    public void setTypeEmoji(String typeEmoji) { this.typeEmoji = typeEmoji; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }

    public String getActorName() { return actorName; }
    public void setActorName(String actorName) { this.actorName = actorName; }

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

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public String getTimeAgo() { return timeAgo; }
    public void setTimeAgo(String timeAgo) { this.timeAgo = timeAgo; }
}
