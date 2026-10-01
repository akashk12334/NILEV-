package com.nilev.exception;

import org.springframework.http.HttpStatus;

/**
 * Base unchecked application exception.
 */
public class NilevApiException extends RuntimeException {

    private final HttpStatus status;
    private final String errorCode;

    public NilevApiException(String message, HttpStatus status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public NilevApiException(String message, HttpStatus status) {
        this(message, status, status.name());
    }

    public HttpStatus getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
