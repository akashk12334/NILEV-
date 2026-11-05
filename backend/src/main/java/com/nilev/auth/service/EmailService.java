package com.nilev.auth.service;

public interface EmailService {

    void sendPasswordResetEmail(String recipientEmail, String recipientName, String rawToken);
}

