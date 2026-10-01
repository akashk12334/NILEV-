package com.nilev.partner.dto;

public class RejectInvitationRequest {

    private Long invitationId;

    public RejectInvitationRequest() {
    }

    public RejectInvitationRequest(Long invitationId) {
        this.invitationId = invitationId;
    }

    public Long getInvitationId() {
        return invitationId;
    }

    public void setInvitationId(Long invitationId) {
        this.invitationId = invitationId;
    }
}
