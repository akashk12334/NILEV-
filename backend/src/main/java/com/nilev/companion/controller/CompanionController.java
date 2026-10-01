package com.nilev.companion.controller;

import com.nilev.common.ApiResponse;
import com.nilev.companion.dto.*;
import com.nilev.companion.service.CompanionService;
import com.nilev.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/companion", "/api/v1/companion", "/companion"})
@PreAuthorize("isAuthenticated()")
public class CompanionController {

    private final CompanionService companionService;

    public CompanionController(CompanionService companionService) {
        this.companionService = companionService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<CompanionResponse>> getMyCompanion(
            @AuthenticationPrincipal UserPrincipal principal) {
        CompanionResponse companion = companionService.getMyCompanion(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Companion retrieved", companion));
    }

    @PostMapping("/choose")
    public ResponseEntity<ApiResponse<CompanionResponse>> chooseCompanion(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ChooseCompanionRequest request) {
        CompanionResponse companion = companionService.chooseCompanion(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Companion chosen successfully", companion));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<CompanionResponse>> updateCompanion(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UpdateCompanionRequest request) {
        CompanionResponse companion = companionService.updateCompanion(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success("Companion updated successfully", companion));
    }

    @GetMapping("/partner")
    public ResponseEntity<ApiResponse<CompanionResponse>> getPartnerCompanion(
            @AuthenticationPrincipal UserPrincipal principal) {
        CompanionResponse companion = companionService.getPartnerCompanion(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Partner's companion retrieved", companion));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<CompanionHistoryResponse>>> getHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "20") int limit) {
        List<CompanionHistoryResponse> history = companionService.getCompanionHistory(principal.getId(), limit);
        return ResponseEntity.ok(ApiResponse.success("Companion history retrieved", history));
    }

    @PostMapping("/interact")
    public ResponseEntity<ApiResponse<CompanionResponse>> interact(
            @AuthenticationPrincipal UserPrincipal principal) {
        CompanionResponse companion = companionService.interact(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Interacted with companion", companion));
    }
}
