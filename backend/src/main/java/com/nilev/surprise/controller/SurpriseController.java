package com.nilev.surprise.controller;

import com.nilev.common.ApiResponse;
import com.nilev.security.UserPrincipal;
import com.nilev.surprise.dto.CreateSurpriseRequest;
import com.nilev.surprise.dto.SurpriseResponse;
import com.nilev.surprise.dto.UpdateSurpriseRequest;
import com.nilev.surprise.service.SurpriseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/surprises", "/api/v1/surprises", "/surprises"})
@PreAuthorize("isAuthenticated()")
public class SurpriseController {

    private final SurpriseService surpriseService;

    public SurpriseController(SurpriseService surpriseService) {
        this.surpriseService = surpriseService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<SurpriseResponse>> createSurprise(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateSurpriseRequest request) {
        SurpriseResponse response = surpriseService.createSurprise(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Surprise created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SurpriseResponse>>> getSurprises(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false, defaultValue = "RECEIVED") String tab) {
        List<SurpriseResponse> list;
        switch (tab.toUpperCase()) {
            case "SENT" -> list = surpriseService.getSentSurprises(principal.getId());
            case "SCHEDULED" -> list = surpriseService.getScheduledSurprises(principal.getId());
            default -> list = surpriseService.getReceivedSurprises(principal.getId());
        }
        return ResponseEntity.ok(ApiResponse.success("Surprises retrieved successfully", list));
    }

    @GetMapping("/received")
    public ResponseEntity<ApiResponse<List<SurpriseResponse>>> getReceivedSurprises(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SurpriseResponse> list = surpriseService.getReceivedSurprises(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Received surprises retrieved", list));
    }

    @GetMapping("/sent")
    public ResponseEntity<ApiResponse<List<SurpriseResponse>>> getSentSurprises(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SurpriseResponse> list = surpriseService.getSentSurprises(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Sent surprises retrieved", list));
    }

    @GetMapping("/scheduled")
    public ResponseEntity<ApiResponse<List<SurpriseResponse>>> getScheduledSurprises(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<SurpriseResponse> list = surpriseService.getScheduledSurprises(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Scheduled surprises retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SurpriseResponse>> getSurpriseById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        SurpriseResponse response = surpriseService.getSurpriseById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Surprise retrieved", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SurpriseResponse>> updateSurprise(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateSurpriseRequest request) {
        SurpriseResponse response = surpriseService.updateSurprise(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Surprise updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSurprise(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        surpriseService.deleteSurprise(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Surprise deleted successfully", null));
    }

    @PostMapping("/{id}/open")
    public ResponseEntity<ApiResponse<SurpriseResponse>> openSurprise(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        SurpriseResponse response = surpriseService.openSurprise(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Surprise unsealed! ✨", response));
    }

    @PostMapping("/{id}/send")
    public ResponseEntity<ApiResponse<SurpriseResponse>> sendDraft(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        SurpriseResponse response = surpriseService.sendDraft(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Draft dispatched to partner! 💌", response));
    }
}
