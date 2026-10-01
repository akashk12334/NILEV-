package com.nilev.partner.dto;

import java.time.Instant;

public class PartnerStatusResponse {

    private String status; // "NO_PARTNER", "INVITATION_SENT", "INVITATION_RECEIVED", "CONNECTED"
    private PartnerProfileResponse user;
    private PartnerProfileResponse partner;
    private InvitationResponse invitation;
    private Integer sharedStreak;
    private Instant connectedAt;

    public PartnerStatusResponse() {
    }

    public PartnerStatusResponse(String status, PartnerProfileResponse user, PartnerProfileResponse partner,
                                 InvitationResponse invitation, Integer sharedStreak, Instant connectedAt) {
        this.status = status;
        this.user = user;
        this.partner = partner;
        this.invitation = invitation;
        this.sharedStreak = sharedStreak;
        this.connectedAt = connectedAt;
    }

    public static PartnerStatusResponse noPartner(PartnerProfileResponse user) {
        return new PartnerStatusResponse("NO_PARTNER", user, null, null, 0, null);
    }

    public static PartnerStatusResponse invitationSent(PartnerProfileResponse user, InvitationResponse invitation) {
        return new PartnerStatusResponse("INVITATION_SENT", user, null, invitation, 0, null);
    }

    public static PartnerStatusResponse invitationReceived(PartnerProfileResponse user, InvitationResponse invitation) {
        return new PartnerStatusResponse("INVITATION_RECEIVED", user, null, invitation, 0, null);
    }

    public static PartnerStatusResponse connected(PartnerProfileResponse user, PartnerProfileResponse partner,
                                                 int sharedStreak, Instant connectedAt) {
        return new PartnerStatusResponse("CONNECTED", user, partner, null, sharedStreak, connectedAt);
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public PartnerProfileResponse getUser() {
        return user;
    }

    public void setUser(PartnerProfileResponse user) {
        this.user = user;
    }

    public PartnerProfileResponse getPartner() {
        return partner;
    }

    public void setPartner(PartnerProfileResponse partner) {
        this.partner = partner;
    }

    public InvitationResponse getInvitation() {
        return invitation;
    }

    public void setInvitation(InvitationResponse invitation) {
        this.invitation = invitation;
    }

    public Integer getSharedStreak() {
        return sharedStreak;
    }

    public void setSharedStreak(Integer sharedStreak) {
        this.sharedStreak = sharedStreak;
    }

    public Instant getConnectedAt() {
        return connectedAt;
    }

    public void setConnectedAt(Instant connectedAt) {
        this.connectedAt = connectedAt;
    }
}
