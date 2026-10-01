package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class SelfInvitationException extends NilevApiException {
    public SelfInvitationException(String message) {
        super(message, HttpStatus.BAD_REQUEST, "SELF_INVITATION");
    }

    public SelfInvitationException() {
        this("You cannot invite yourself as a partner.");
    }
}
