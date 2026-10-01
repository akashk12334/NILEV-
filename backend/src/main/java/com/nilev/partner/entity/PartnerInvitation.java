package com.nilev.partner.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "partner_invitations")
public class PartnerInvitation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "receiver_id", nullable = false)
    private User receiver;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private InvitationStatus status = InvitationStatus.PENDING;

    public PartnerInvitation() {
    }

    public PartnerInvitation(User sender, User receiver, InvitationStatus status) {
        this.sender = sender;
        this.receiver = receiver;
        this.status = status != null ? status : InvitationStatus.PENDING;
    }

    public User getSender() {
        return sender;
    }

    public void setSender(User sender) {
        this.sender = sender;
    }

    public User getReceiver() {
        return receiver;
    }

    public void setReceiver(User receiver) {
        this.receiver = receiver;
    }

    public InvitationStatus getStatus() {
        return status;
    }

    public void setStatus(InvitationStatus status) {
        this.status = status;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private User sender;
        private User receiver;
        private InvitationStatus status = InvitationStatus.PENDING;

        public Builder sender(User sender) {
            this.sender = sender;
            return this;
        }

        public Builder receiver(User receiver) {
            this.receiver = receiver;
            return this;
        }

        public Builder status(InvitationStatus status) {
            this.status = status;
            return this;
        }

        public PartnerInvitation build() {
            return new PartnerInvitation(sender, receiver, status);
        }
    }
}
