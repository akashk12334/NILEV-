package com.nilev.auth.service.impl;

import com.nilev.auth.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    private final Optional<JavaMailSender> mailSender;
    private final String frontendUrl;
    private final String mailFrom;

    public EmailServiceImpl(
            @Autowired(required = false) JavaMailSender mailSender,
            @Value("${app.frontend-url:http://localhost:5173}") String frontendUrl,
            @Value("${spring.mail.from:${spring.mail.username:}}") String mailFrom) {
        this.mailSender = Optional.ofNullable(mailSender);
        this.frontendUrl = frontendUrl.endsWith("/") ? frontendUrl.substring(0, frontendUrl.length() - 1) : frontendUrl;
        this.mailFrom = mailFrom;
    }

    @Override
    public void sendPasswordResetEmail(String recipientEmail, String recipientName, String rawToken) {
        String resetLink = frontendUrl + "/reset-password?token=" + rawToken;
        String greetingName = (recipientName != null && !recipientName.isBlank()) ? recipientName : "there";
        String maskedEmail = maskEmail(recipientEmail);

        if (mailSender.isEmpty()) {
            log.warn("Password reset requested for [{}] but SMTP is not configured: JavaMailSender bean is not active. Configure SMTP_HOST, SMTP_PORT, SMTP_USERNAME, and SMTP_PASSWORD in Render environment variables.", maskedEmail);
            return;
        }

        if (mailFrom == null || mailFrom.isBlank()) {
            log.warn("Password reset requested for [{}] but sender address is missing: neither MAIL_FROM nor SMTP_USERNAME is set.", maskedEmail);
            return;
        }

        try {
            MimeMessage message = mailSender.get().createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(mailFrom, "NILEV Sanctuary");
            helper.setTo(recipientEmail);
            helper.setSubject("NILEV — Password Reset Request");

            String htmlContent = buildResetEmailHtml(greetingName, resetLink);
            helper.setText(htmlContent, true);

            mailSender.get().send(message);
            log.info("Password reset email successfully dispatched via SMTP to [{}]", maskedEmail);
        } catch (Exception e) {
            log.error("Failed to deliver password reset email to [{}] via SMTP: {}", maskedEmail, e.getMessage());
        }
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return "unknown";
        String[] parts = email.split("@", 2);
        String name = parts[0];
        String domain = parts[1];
        if (name.length() <= 2) {
            return name.charAt(0) + "*@" + domain;
        }
        return name.substring(0, 2) + "***@" + domain;
    }

    private String buildResetEmailHtml(String name, String resetLink) {
        return "<!DOCTYPE html>"
                + "<html>"
                + "<head><meta charset='UTF-8'></head>"
                + "<body style='background-color: #070913; font-family: -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9; padding: 40px 20px; margin: 0;'>"
                + "  <table width='100%' border='0' cellspacing='0' cellpadding='0' style='max-width: 520px; margin: 0 auto; background-color: #0c1022; border: 1px solid rgba(139, 92, 246, 0.25); border-radius: 16px; padding: 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);'>"
                + "    <tr>"
                + "      <td align='center' style='padding-bottom: 24px;'>"
                + "        <div style='display: inline-block; padding: 12px; background: linear-gradient(135deg, #7c3aed, #4f46e5); border-radius: 14px;'>"
                + "          <span style='font-size: 24px;'>💜</span>"
                + "        </div>"
                + "        <h1 style='color: #ffffff; font-size: 22px; font-weight: 800; margin: 16px 0 4px 0; letter-spacing: -0.5px;'>NILEV</h1>"
                + "        <p style='color: #94a3b8; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px;'>Private Couple Sanctuary</p>"
                + "      </td>"
                + "    </tr>"
                + "    <tr>"
                + "      <td>"
                + "        <h2 style='color: #ffffff; font-size: 18px; margin: 0 0 12px 0;'>Reset Your Password</h2>"
                + "        <p style='color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;'>Hello " + name + ",</p>"
                + "        <p style='color: #cbd5e1; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;'>We received a request to reset the password for your NILEV account. Click the button below to choose a new password:</p>"
                + "        <div align='center' style='margin: 28px 0;'>"
                + "          <a href='" + resetLink + "' style='display: inline-block; background: linear-gradient(135deg, #7c3aed, #6366f1); color: #ffffff; text-decoration: none; font-size: 14px; font-weight: 600; padding: 12px 28px; border-radius: 12px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.4);'>Reset Password</a>"
                + "        </div>"
                + "        <p style='color: #94a3b8; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;'>This link will expire in <strong>15 minutes</strong> and can only be used once.</p>"
                + "        <p style='color: #64748b; font-size: 12px; line-height: 1.5; margin: 0 0 8px 0;'>If you did not request a password reset, you can safely ignore this email. Your account remains completely secure.</p>"
                + "        <hr style='border: none; border-top: 1px solid rgba(148, 163, 184, 0.15); margin: 24px 0;' />"
                + "        <p style='color: #475569; font-size: 11px; word-break: break-all; margin: 0;'>Button not working? Copy and paste this URL into your browser:<br /><a href='" + resetLink + "' style='color: #a78bfa; text-decoration: underline;'>" + resetLink + "</a></p>"
                + "      </td>"
                + "    </tr>"
                + "  </table>"
                + "</body>"
                + "</html>";
    }
}

