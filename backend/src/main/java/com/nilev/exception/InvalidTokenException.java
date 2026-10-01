package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class InvalidTokenException extends NilevApiException {

    public InvalidTokenException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "INVALID_TOKEN");
    }

    public InvalidTokenException() {
        this("Authentication token is invalid or malformed");
    }
}
