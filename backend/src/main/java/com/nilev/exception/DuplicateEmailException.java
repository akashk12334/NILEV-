package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class DuplicateEmailException extends NilevApiException {

    public DuplicateEmailException(String email) {
        super("An account with email '" + email + "' already exists", HttpStatus.CONFLICT, "DUPLICATE_EMAIL");
    }
}
