package com.nilev.surprise.dto;

import com.nilev.surprise.entity.Surprise;
import com.nilev.surprise.entity.SurpriseStatus;
import com.nilev.surprise.entity.SurpriseType;

import java.time.Instant;
import java.time.LocalDateTime;

public class SurpriseResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private Long receiverId;
    private String receiverName;
    private SurpriseType type;
    private String typeDisplayName;
    private String typeEmoji;
    private String title;
    private String content;
    private String mediaUrl;
    private LocalDateTime scheduledAt;
    private LocalDateTime openedAt;
    private SurpriseStatus status;
    private String statusDisplayName;
    private boolean isSender;
    private boolean isReceiver;
    private boolean canOpen;
    private boolean canEdit;
    private boolean canDelete;
    private boolean isLocked;
    private Instant createdAt;
    private Instant updatedAt;

    public SurpriseResponse() {}

    public static SurpriseResponse fromEntity(Surprise s, Long currentUserId) {
        SurpriseResponse res = new SurpriseResponse();
        res.id = s.getId();
        res.senderId = s.getSender() != null ? s.getSender().getId() : null;
        res.senderName = s.getSender() != null ? s.getSender().getName() : "Partner";
        res.receiverId = s.getReceiver() != null ? s.getReceiver().getId() : null;
        res.receiverName = s.getReceiver() != null ? s.getReceiver().getName() : "Partner";
        res.type = s.getType();
        res.typeDisplayName = s.getType() != null ? s.getType().getDisplayName() : "Surprise";
        res.typeEmoji = s.getType() != null ? s.getType().getEmoji() : "✨";
        res.title = s.getTitle();

        boolean sender = currentUserId.equals(res.senderId);
        boolean receiver = currentUserId.equals(res.receiverId);
        res.isSender = sender;
        res.isReceiver = receiver;

        // Is it time-locked for the receiver?
        boolean locked = false;
        if (receiver && s.getStatus() == SurpriseStatus.SCHEDULED) {
            locked = s.getScheduledAt() != null && s.getScheduledAt().isAfter(LocalDateTime.now());
        }
        res.isLocked = locked;

        // Redact secret message / media if time-locked for receiver
        if (locked) {
            res.content = "✨ Mystery Locked ✨ Unlocks at " + (s.getScheduledAt() != null ? s.getScheduledAt().toString() : "scheduled time");
            res.mediaUrl = null;
        } else {
            res.content = s.getContent();
            res.mediaUrl = s.getMediaUrl();
        }

        res.scheduledAt = s.getScheduledAt();
        res.openedAt = s.getOpenedAt();
        res.status = s.getStatus();
        res.statusDisplayName = s.getStatus() != null ? s.getStatus().getDisplayName() : "";

        // Permissions
        res.canOpen = receiver && (s.getStatus() == SurpriseStatus.DELIVERED || 
                      (s.getStatus() == SurpriseStatus.SCHEDULED && !locked));
        res.canEdit = sender && (s.getStatus() == SurpriseStatus.DRAFT || s.getStatus() == SurpriseStatus.SCHEDULED);
        res.canDelete = sender && (s.getStatus() == SurpriseStatus.DRAFT || s.getStatus() == SurpriseStatus.SCHEDULED);

        res.createdAt = s.getCreatedAt();
        res.updatedAt = s.getUpdatedAt();
        return res;
    }

    // ── Getters & Setters ───────────────────────────────────────────

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getSenderId() { return senderId; }
    public void setSenderId(Long senderId) { this.senderId = senderId; }

    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }

    public Long getReceiverId() { return receiverId; }
    public void setReceiverId(Long receiverId) { this.receiverId = receiverId; }

    public String getReceiverName() { return receiverName; }
    public void setReceiverName(String receiverName) { this.receiverName = receiverName; }

    public SurpriseType getType() { return type; }
    public void setType(SurpriseType type) { this.type = type; }

    public String getTypeDisplayName() { return typeDisplayName; }
    public void setTypeDisplayName(String typeDisplayName) { this.typeDisplayName = typeDisplayName; }

    public String getTypeEmoji() { return typeEmoji; }
    public void setTypeEmoji(String typeEmoji) { this.typeEmoji = typeEmoji; }

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

    public String getStatusDisplayName() { return statusDisplayName; }
    public void setStatusDisplayName(String statusDisplayName) { this.statusDisplayName = statusDisplayName; }

    public boolean isSender() { return isSender; }
    public void setSender(boolean sender) { isSender = sender; }

    public boolean isReceiver() { return isReceiver; }
    public void setReceiver(boolean receiver) { isReceiver = receiver; }

    public boolean isCanOpen() { return canOpen; }
    public void setCanOpen(boolean canOpen) { this.canOpen = canOpen; }

    public boolean isCanEdit() { return canEdit; }
    public void setCanEdit(boolean canEdit) { this.canEdit = canEdit; }

    public boolean isCanDelete() { return canDelete; }
    public void setCanDelete(boolean canDelete) { this.canDelete = canDelete; }

    public boolean isLocked() { return isLocked; }
    public void setLocked(boolean locked) { isLocked = locked; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
