package com.nilev.partner.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class InvitePartnerRequest {

    @NotBlank(message = "Partner email is required")
    @Email(message = "Must be a valid email address")
    private String email;

    public InvitePartnerRequest() {
    }

    public InvitePartnerRequest(String email) {
        this.email = email;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }
}
