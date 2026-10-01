package com.nilev.partner.controller;

import com.nilev.common.ApiResponse;
import com.nilev.partner.dto.*;
import com.nilev.partner.service.PartnerService;
import com.nilev.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/partners", "/api/v1/partners", "/partners"})
@PreAuthorize("isAuthenticated()")
public class PartnerController {

    private final PartnerService partnerService;

    public PartnerController(PartnerService partnerService) {
        this.partnerService = partnerService;
    }

    @PostMapping("/invite")
    public ResponseEntity<ApiResponse<PartnerStatusResponse>> invite(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InvitePartnerRequest request) {
        PartnerStatusResponse response = partnerService.invitePartner(principal.getId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Invitation sent successfully", response),
                HttpStatus.CREATED
        );
    }

    @PostMapping("/accept")
    public ResponseEntity<ApiResponse<PartnerStatusResponse>> accept(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) AcceptInvitationRequest request) {
        PartnerStatusResponse response = partnerService.acceptInvitation(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Partner invitation accepted! You are now connected.", response));
    }

    @PostMapping("/reject")
    public ResponseEntity<ApiResponse<PartnerStatusResponse>> reject(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestBody(required = false) RejectInvitationRequest request) {
        PartnerStatusResponse response = partnerService.rejectInvitation(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Partner invitation rejected.", response));
    }

    @DeleteMapping("/connection")
    public ResponseEntity<ApiResponse<Void>> disconnect(
            @AuthenticationPrincipal UserPrincipal principal) {
        partnerService.disconnectPartner(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Partner connection dissolved successfully.", null));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PartnerStatusResponse>> getStatus(
            @AuthenticationPrincipal UserPrincipal principal) {
        PartnerStatusResponse response = partnerService.getPartnerStatus(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Partner status retrieved", response));
    }

    @GetMapping("/activity")
    public ResponseEntity<ApiResponse<List<PartnerActivityResponse>>> getActivity(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PartnerActivityResponse> activities = partnerService.getPartnerActivities(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Partner activity timeline retrieved", activities));
    }
}
