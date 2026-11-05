package com.nilev.auth.controller;

import com.nilev.auth.dto.AdminApprovalRequest;
import com.nilev.auth.dto.AdminPasswordResetResponse;
import com.nilev.auth.dto.AdminRejectionRequest;
import com.nilev.auth.service.AdminPasswordResetService;
import com.nilev.common.ApiResponse;
import com.nilev.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/admin/password-resets", "/api/v1/admin/password-resets"})
@PreAuthorize("hasRole('ADMIN')")
public class AdminPasswordResetController {

    private final AdminPasswordResetService adminPasswordResetService;

    public AdminPasswordResetController(AdminPasswordResetService adminPasswordResetService) {
        this.adminPasswordResetService = adminPasswordResetService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminPasswordResetResponse>>> getPendingRequests() {
        List<AdminPasswordResetResponse> responses = adminPasswordResetService.getPendingPasswordResets();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AdminPasswordResetResponse>>> getAllRequests() {
        List<AdminPasswordResetResponse> responses = adminPasswordResetService.getAllPasswordResets();
        return ResponseEntity.ok(ApiResponse.success(responses));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> approveRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentAdmin,
            @Valid @RequestBody AdminApprovalRequest request) {
        adminPasswordResetService.approvePasswordReset(id, currentAdmin.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset request approved successfully. User credentials have been updated."));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentAdmin,
            @Valid @RequestBody(required = false) AdminRejectionRequest request) {
        adminPasswordResetService.rejectPasswordReset(id, currentAdmin.getId(), request);
        return ResponseEntity.ok(ApiResponse.ok("Password reset request rejected."));
    }
}

