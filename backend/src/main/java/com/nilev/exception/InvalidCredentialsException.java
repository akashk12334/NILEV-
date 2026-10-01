package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class InvalidCredentialsException extends NilevApiException {

    public InvalidCredentialsException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS");
    }

    public InvalidCredentialsException() {
        this("Invalid email or password");
    }
}
