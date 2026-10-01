package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class PendingInvitationExistsException extends NilevApiException {
    public PendingInvitationExistsException(String message) {
        super(message, HttpStatus.CONFLICT, "PENDING_INVITATION_EXISTS");
    }

    public PendingInvitationExistsException() {
        this("A pending partner invitation already exists between these users.");
    }
}
