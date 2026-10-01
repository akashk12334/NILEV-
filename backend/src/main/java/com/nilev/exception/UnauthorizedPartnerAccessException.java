package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class UnauthorizedPartnerAccessException extends NilevApiException {
    public UnauthorizedPartnerAccessException(String message) {
        super(message, HttpStatus.FORBIDDEN, "PARTNER_DATA_READ_ONLY");
    }

    public UnauthorizedPartnerAccessException() {
        this("Partner data is strictly read-only. Modification operations are forbidden.");
    }
}
