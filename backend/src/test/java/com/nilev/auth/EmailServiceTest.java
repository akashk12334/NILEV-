package com.nilev.auth;

import com.nilev.auth.service.impl.EmailServiceImpl;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.MailSendException;
import org.springframework.mail.javamail.JavaMailSender;

import java.util.Properties;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Test
    @DisplayName("When JavaMailSender is configured, sendPasswordResetEmail dispatches message")
    void testSendEmail_Success() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        EmailServiceImpl emailService = new EmailServiceImpl(
                mailSender,
                "https://nilev.space",
                "noreply@nilev.space"
        );

        assertDoesNotThrow(() ->
                emailService.sendPasswordResetEmail("alex@nilev.space", "Alex", "dummy-raw-token")
        );

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("When SMTP throws an exception, error is handled safely without throwing or crashing")
    void testSendEmail_SmtpFailure_HandledGracefully() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);
        doThrow(new MailSendException("SMTP connection timed out")).when(mailSender).send(any(MimeMessage.class));

        EmailServiceImpl emailService = new EmailServiceImpl(
                mailSender,
                "https://nilev.space",
                "noreply@nilev.space"
        );

        assertDoesNotThrow(() ->
                emailService.sendPasswordResetEmail("alex@nilev.space", "Alex", "dummy-raw-token")
        );

        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("When JavaMailSender is not present, emailService logs warning without crashing")
    void testSendEmail_NoMailSender_NoCrash() {
        EmailServiceImpl emailService = new EmailServiceImpl(
                null,
                "https://nilev.space",
                "noreply@nilev.space"
        );

        assertDoesNotThrow(() ->
                emailService.sendPasswordResetEmail("alex@nilev.space", "Alex", "dummy-raw-token")
        );
    }
}

