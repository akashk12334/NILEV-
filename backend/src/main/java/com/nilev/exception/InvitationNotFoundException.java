package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class InvitationNotFoundException extends NilevApiException {
    public InvitationNotFoundException(String message) {
        super(message, HttpStatus.NOT_FOUND, "INVITATION_NOT_FOUND");
    }

    public InvitationNotFoundException() {
        this("Partner invitation was not found or is no longer valid.");
    }
}
