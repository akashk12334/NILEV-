package com.nilev.exception;

import org.springframework.http.HttpStatus;

public class PartnerAlreadyConnectedException extends NilevApiException {
    public PartnerAlreadyConnectedException(String message) {
        super(message, HttpStatus.CONFLICT, "PARTNER_ALREADY_CONNECTED");
    }

    public PartnerAlreadyConnectedException() {
        this("User is already connected with a partner. NILEV supports exactly two connected people.");
    }
}
