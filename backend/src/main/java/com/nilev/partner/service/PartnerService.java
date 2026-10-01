package com.nilev.partner.service;

import com.nilev.partner.dto.*;

import java.util.List;

public interface PartnerService {

    PartnerStatusResponse invitePartner(Long currentUserId, InvitePartnerRequest request);

    PartnerStatusResponse acceptInvitation(Long currentUserId, AcceptInvitationRequest request);

    PartnerStatusResponse rejectInvitation(Long currentUserId, RejectInvitationRequest request);

    void disconnectPartner(Long currentUserId);

    PartnerStatusResponse getPartnerStatus(Long currentUserId);

    List<PartnerActivityResponse> getPartnerActivities(Long currentUserId);
}
