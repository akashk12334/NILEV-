package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class TokenExpiredException extends NilevApiException {

    public TokenExpiredException(String message) {
        super(message, HttpStatus.UNAUTHORIZED, "TOKEN_EXPIRED");
    }

    public TokenExpiredException() {
        this("Authentication token has expired");
    }
}
