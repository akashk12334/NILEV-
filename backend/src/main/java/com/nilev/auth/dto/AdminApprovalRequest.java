package com.nilev.auth.dto;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request payload for administrator password reset approval.
 * Requires explicit confirmation that the user's identity was out-of-band verified.
 */
public class AdminApprovalRequest {

    @NotBlank(message = "Verification note is required explaining how user identity was confirmed")
    @Size(min = 5, max = 500, message = "Verification note must be between 5 and 500 characters")
    private String verificationNote;

    @AssertTrue(message = "Administrator must explicitly confirm that the user's identity has been verified")
    private boolean confirmedIdentity;

    public AdminApprovalRequest() {
    }

    public AdminApprovalRequest(String verificationNote, boolean confirmedIdentity) {
        this.verificationNote = verificationNote;
        this.confirmedIdentity = confirmedIdentity;
    }

    public String getVerificationNote() {
        return verificationNote;
    }

    public void setVerificationNote(String verificationNote) {
        this.verificationNote = verificationNote;
    }

    public boolean isConfirmedIdentity() {
        return confirmedIdentity;
    }

    public void setConfirmedIdentity(boolean confirmedIdentity) {
        this.confirmedIdentity = confirmedIdentity;
    }
}

