package com.nilev.auth;

import com.nilev.BaseIntegrationTest;
import com.nilev.auth.dto.ForgotPasswordRequest;
import com.nilev.auth.dto.LoginRequest;
import com.nilev.auth.dto.ResetPasswordRequest;
import com.nilev.auth.entity.PasswordResetToken;
import com.nilev.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.HexFormat;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PasswordResetIntegrationTest extends BaseIntegrationTest {

    private String hashToken(String rawToken) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        byte[] hash = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @Test
    @DisplayName("1. Valid forgot password request should return 200 generic message and persist hashed token")
    void testForgotPassword_ValidUser() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        userRepo.save(user);

        ForgotPasswordRequest request = new ForgotPasswordRequest("alex@nilev.space");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("If an account with that email exists")));

        List<PasswordResetToken> tokens = passwordResetTokenRepo.findAll();
        assertEquals(1, tokens.size());
        PasswordResetToken token = tokens.get(0);
        assertEquals(user.getId(), token.getUser().getId());
        assertNotNull(token.getTokenHash());
        assertEquals(64, token.getTokenHash().length());
        assertNull(token.getUsedAt());
        assertTrue(token.getExpiresAt().isAfter(Instant.now()));
    }

    @Test
    @DisplayName("2. Unknown email should return exact same 200 generic message without account enumeration")
    void testForgotPassword_UnknownEmail() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("unknown@nilev.space");

        mockMvc.perform(post("/api/auth/forgot-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("If an account with that email exists")));

        List<PasswordResetToken> tokens = passwordResetTokenRepo.findAll();
        assertTrue(tokens.isEmpty());
    }

    @Test
    @DisplayName("3. Successful password reset, login with new password succeeds, login with old password fails")
    void testPasswordResetAndLoginFlow() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        user = userRepo.save(user);

        String rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(Duration.ofMinutes(15)))
                .build();
        passwordResetTokenRepo.save(resetToken);

        // Perform reset password
        ResetPasswordRequest resetReq = new ResetPasswordRequest(rawToken, "NewSecurePassword456!");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("Password has been successfully reset")));

        // Verify login with new password succeeds
        LoginRequest newLoginReq = new LoginRequest("alex@nilev.space", "NewSecurePassword456!", false);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLoginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()));

        // Verify login with old password fails
        LoginRequest oldLoginReq = new LoginRequest("alex@nilev.space", "OldPassword123!", false);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oldLoginReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("4. Reset password with expired token should be rejected")
    void testResetPassword_ExpiredToken() throws Exception {
        User user = User.builder()
                .name("Maya Lin")
                .email("maya@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        user = userRepo.save(user);

        String rawToken = "expiredrawtoken1234567890abcdef1234567890abcdef1234567890abcdef12";
        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().minus(Duration.ofMinutes(5))) // already expired
                .build();
        passwordResetTokenRepo.save(resetToken);

        ResetPasswordRequest resetReq = new ResetPasswordRequest(rawToken, "NewPassword123!");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("expired")));
    }

    @Test
    @DisplayName("5. Reset password with invalid token should be rejected")
    void testResetPassword_InvalidToken() throws Exception {
        ResetPasswordRequest resetReq = new ResetPasswordRequest("completely_nonexistent_token", "NewPassword123!");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Invalid or unrecognized")));
    }

    @Test
    @DisplayName("6. Reset password with already used token should be rejected")
    void testResetPassword_ReusedToken() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        user = userRepo.save(user);

        String rawToken = "alreadyusedrawtoken1234567890abcdef1234567890abcdef1234567890abcd";
        String tokenHash = hashToken(rawToken);

        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(Duration.ofMinutes(15)))
                .usedAt(Instant.now().minus(Duration.ofMinutes(1))) // already marked used
                .build();
        passwordResetTokenRepo.save(resetToken);

        ResetPasswordRequest resetReq = new ResetPasswordRequest(rawToken, "NewPassword123!");

        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("already been used")));
    }

    @Test
    @DisplayName("7. Pre-existing JWT tokens must be invalidated after password reset")
    void testPreExistingSessionInvalidatedAfterPasswordReset() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        user = userRepo.save(user);

        // Generate an active token before password reset
        String activeJwt = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());

        // Verify active token works before reset
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + activeJwt))
                .andExpect(status().isOk());

        // Now perform password reset
        String rawToken = "validtokentochangeoldpassword1234567890abcdef1234567890abcdef12";
        String tokenHash = hashToken(rawToken);
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiresAt(Instant.now().plus(Duration.ofMinutes(15)))
                .build();
        passwordResetTokenRepo.save(resetToken);

        // Sleep briefly to ensure instant difference
        Thread.sleep(1100);

        ResetPasswordRequest resetReq = new ResetPasswordRequest(rawToken, "NewPassword987!");
        mockMvc.perform(post("/api/auth/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk());

        // Pre-existing JWT should now fail because password was changed
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + activeJwt))
                .andExpect(status().isUnauthorized());
    }
}

