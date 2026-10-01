package com.nilev.partner.dto;

public class AcceptInvitationRequest {

    private Long invitationId;

    public AcceptInvitationRequest() {
    }

    public AcceptInvitationRequest(Long invitationId) {
        this.invitationId = invitationId;
    }

    public Long getInvitationId() {
        return invitationId;
    }

    public void setInvitationId(Long invitationId) {
        this.invitationId = invitationId;
    }
}
