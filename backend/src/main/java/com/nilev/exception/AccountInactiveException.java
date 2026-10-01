package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class AccountInactiveException extends NilevApiException {

    public AccountInactiveException(String message) {
        super(message, HttpStatus.FORBIDDEN, "ACCOUNT_INACTIVE");
    }

    public AccountInactiveException() {
        this("This account is inactive or has been disabled. Please contact support.");
    }
}
