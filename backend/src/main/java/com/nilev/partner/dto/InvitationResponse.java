package com.nilev.partner.dto;

import com.nilev.partner.entity.PartnerInvitation;
import java.time.Instant;

public class InvitationResponse {

    private Long id;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private String senderAvatarUrl;
    private Long receiverId;
    private String receiverName;
    private String receiverEmail;
    private String receiverAvatarUrl;
    private String status;
    private Instant createdAt;

    public InvitationResponse() {
    }

    public InvitationResponse(Long id, Long senderId, String senderName, String senderEmail, String senderAvatarUrl,
                              Long receiverId, String receiverName, String receiverEmail, String receiverAvatarUrl,
                              String status, Instant createdAt) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.senderEmail = senderEmail;
        this.senderAvatarUrl = senderAvatarUrl;
        this.receiverId = receiverId;
        this.receiverName = receiverName;
        this.receiverEmail = receiverEmail;
        this.receiverAvatarUrl = receiverAvatarUrl;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static InvitationResponse fromEntity(PartnerInvitation invitation) {
        if (invitation == null) return null;
        return new InvitationResponse(
                invitation.getId(),
                invitation.getSender() != null ? invitation.getSender().getId() : null,
                invitation.getSender() != null ? invitation.getSender().getName() : null,
                invitation.getSender() != null ? invitation.getSender().getEmail() : null,
                invitation.getSender() != null ? invitation.getSender().getAvatarUrl() : null,
                invitation.getReceiver() != null ? invitation.getReceiver().getId() : null,
                invitation.getReceiver() != null ? invitation.getReceiver().getName() : null,
                invitation.getReceiver() != null ? invitation.getReceiver().getEmail() : null,
                invitation.getReceiver() != null ? invitation.getReceiver().getAvatarUrl() : null,
                invitation.getStatus() != null ? invitation.getStatus().name() : null,
                invitation.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderEmail() {
        return senderEmail;
    }

    public void setSenderEmail(String senderEmail) {
        this.senderEmail = senderEmail;
    }

    public String getSenderAvatarUrl() {
        return senderAvatarUrl;
    }

    public void setSenderAvatarUrl(String senderAvatarUrl) {
        this.senderAvatarUrl = senderAvatarUrl;
    }

    public Long getReceiverId() {
        return receiverId;
    }

    public void setReceiverId(Long receiverId) {
        this.receiverId = receiverId;
    }

    public String getReceiverName() {
        return receiverName;
    }

    public void setReceiverName(String receiverName) {
        this.receiverName = receiverName;
    }

    public String getReceiverEmail() {
        return receiverEmail;
    }

    public void setReceiverEmail(String receiverEmail) {
        this.receiverEmail = receiverEmail;
    }

    public String getReceiverAvatarUrl() {
        return receiverAvatarUrl;
    }

    public void setReceiverAvatarUrl(String receiverAvatarUrl) {
        this.receiverAvatarUrl = receiverAvatarUrl;
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
}
