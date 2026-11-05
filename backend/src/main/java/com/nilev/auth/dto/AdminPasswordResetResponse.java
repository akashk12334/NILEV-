package com.nilev.auth.dto;

import java.time.Instant;

/**
 * Public/Admin view of a password reset request.
 * SECURITY: proposedPasswordHash is deliberately EXCLUDED from this DTO
 * to ensure sensitive hash material is never exposed over the API.
 */
public class AdminPasswordResetResponse {

    private Long id;
    private Long userId;
    private String userEmail;
    private String userName;
    private String status;
    private Instant createdAt;
    private Instant expiresAt;
    private Instant processedAt;
    private Long processedByAdminId;
    private String adminNotes;

    public AdminPasswordResetResponse() {
    }

    public AdminPasswordResetResponse(Long id, Long userId, String userEmail, String userName,
                                      String status, Instant createdAt, Instant expiresAt,
                                      Instant processedAt, Long processedByAdminId, String adminNotes) {
        this.id = id;
        this.userId = userId;
        this.userEmail = userEmail;
        this.userName = userName;
        this.status = status;
        this.createdAt = createdAt;
        this.expiresAt = expiresAt;
        this.processedAt = processedAt;
        this.processedByAdminId = processedByAdminId;
        this.adminNotes = adminNotes;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
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

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getProcessedAt() {
        return processedAt;
    }

    public void setProcessedAt(Instant processedAt) {
        this.processedAt = processedAt;
    }

    public Long getProcessedByAdminId() {
        return processedByAdminId;
    }

    public void setProcessedByAdminId(Long processedByAdminId) {
        this.processedByAdminId = processedByAdminId;
    }

    public String getAdminNotes() {
        return adminNotes;
    }

    public void setAdminNotes(String adminNotes) {
        this.adminNotes = adminNotes;
    }
}

