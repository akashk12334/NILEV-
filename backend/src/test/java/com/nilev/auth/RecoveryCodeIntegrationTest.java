package com.nilev.auth;

import com.nilev.BaseIntegrationTest;
import com.nilev.auth.dto.LoginRequest;
import com.nilev.auth.dto.RegisterRequest;
import com.nilev.auth.dto.ResetPasswordWithRecoveryCodeRequest;
import com.nilev.auth.entity.RecoveryCode;
import com.nilev.auth.util.RecoveryCodeUtils;
import com.nilev.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class RecoveryCodeIntegrationTest extends BaseIntegrationTest {

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @Test
    @DisplayName("1. User registration generates an initial recovery code and stores only its hash")
    void testRegistrationGeneratesRecoveryCode() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("Maya Lin", "maya@nilev.space", "OriginalPass123!");

        var mvcResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()))
                .andExpect(jsonPath("$.data.recoveryCode", startsWith("NLV-")))
                .andReturn();

        String responseJson = mvcResult.getResponse().getContentAsString();
        String rawRecoveryCode = objectMapper.readTree(responseJson).path("data").path("recoveryCode").asText();
        assertNotNull(rawRecoveryCode);
        assertTrue(rawRecoveryCode.startsWith("NLV-"));

        User user = userRepo.findByEmailIgnoreCase("maya@nilev.space").orElseThrow();
        RecoveryCode savedCode = recoveryCodeRepo.findByUser(user).orElseThrow();

        // Plaintext must never be stored in database
        assertNotEquals(rawRecoveryCode, savedCode.getCodeHash());
        assertEquals(64, savedCode.getCodeHash().length());
        assertNull(savedCode.getUsedAt());

        // Verify SHA-256 match
        String expectedHash = RecoveryCodeUtils.hashCode(RecoveryCodeUtils.normalizeCode(rawRecoveryCode));
        assertEquals(expectedHash, savedCode.getCodeHash());
    }

    @Test
    @DisplayName("2. Successful password reset using valid recovery code: old password rejected, new password accepted")
    void testResetPasswordWithValidRecoveryCode() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        user = userRepo.save(user);

        String rawRecoveryCode = "NLV-4X7K-9P2M-8W3Q-5Y9Z";
        String codeHash = RecoveryCodeUtils.hashCode(RecoveryCodeUtils.normalizeCode(rawRecoveryCode));
        RecoveryCode rc = new RecoveryCode(null, user, codeHash, null, null);
        recoveryCodeRepo.save(rc);

        ResetPasswordWithRecoveryCodeRequest resetReq = ResetPasswordWithRecoveryCodeRequest.builder()
                .email("alex@nilev.space")
                .recoveryCode(rawRecoveryCode)
                .newPassword("BrandNewPassword999!")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/recovery-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        // Verify code is marked as used
        RecoveryCode updatedRc = recoveryCodeRepo.findByUser(user).orElseThrow();
        assertNotNull(updatedRc.getUsedAt());

        // Login with old password must fail
        LoginRequest oldLogin = new LoginRequest("alex@nilev.space", "OldPassword123!", false);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oldLogin)))
                .andExpect(status().isUnauthorized());

        // Login with new password must succeed
        LoginRequest newLogin = new LoginRequest("alex@nilev.space", "BrandNewPassword999!", false);
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.token", notNullValue()));
    }

    @Test
    @DisplayName("3. Reused recovery code is rejected (one-time use only)")
    void testReusedRecoveryCodeRejected() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        user = userRepo.save(user);

        String rawRecoveryCode = "NLV-4X7K-9P2M-8W3Q-5Y9Z";
        String codeHash = RecoveryCodeUtils.hashCode(RecoveryCodeUtils.normalizeCode(rawRecoveryCode));
        RecoveryCode rc = new RecoveryCode(null, user, codeHash, null, null);
        recoveryCodeRepo.save(rc);

        ResetPasswordWithRecoveryCodeRequest firstReset = ResetPasswordWithRecoveryCodeRequest.builder()
                .email("alex@nilev.space")
                .recoveryCode(rawRecoveryCode)
                .newPassword("BrandNewPassword999!")
                .build();

        // First attempt succeeds
        mockMvc.perform(post("/api/auth/reset-password/recovery-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(firstReset)))
                .andExpect(status().isOk());

        // Second attempt with same code must fail
        ResetPasswordWithRecoveryCodeRequest secondReset = ResetPasswordWithRecoveryCodeRequest.builder()
                .email("alex@nilev.space")
                .recoveryCode(rawRecoveryCode)
                .newPassword("AnotherNewPassword111!")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/recovery-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(secondReset)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid email or recovery code")));
    }

    @Test
    @DisplayName("4. Invalid recovery code is rejected with generic error")
    void testInvalidRecoveryCodeRejected() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        userRepo.save(user);

        ResetPasswordWithRecoveryCodeRequest resetReq = ResetPasswordWithRecoveryCodeRequest.builder()
                .email("alex@nilev.space")
                .recoveryCode("NLV-WRONG-CODE-0000-0000")
                .newPassword("BrandNewPassword999!")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/recovery-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid email or recovery code")));
    }

    @Test
    @DisplayName("5. Non-existent email returns generic error without leaking account existence")
    void testNonExistentEmailRejectedGenerically() throws Exception {
        ResetPasswordWithRecoveryCodeRequest resetReq = ResetPasswordWithRecoveryCodeRequest.builder()
                .email("ghost@nilev.space")
                .recoveryCode("NLV-ANYC-ODEE-1234-5678")
                .newPassword("BrandNewPassword999!")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/recovery-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(resetReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid email or recovery code")));
    }

    @Test
    @DisplayName("6. Authenticated user can check status and regenerate recovery code, invalidating previous code")
    void testAuthenticatedRecoveryCodeStatusAndRegeneration() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        user = userRepo.save(user);

        String token = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());

        // 1. Initial status: No recovery code
        mockMvc.perform(get("/api/auth/recovery-code/status")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.hasRecoveryCode", is(false)));

        // 2. Generate recovery code
        var genResult = mockMvc.perform(post("/api/auth/recovery-code/generate")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.recoveryCode", startsWith("NLV-")))
                .andReturn();

        String firstCode = objectMapper.readTree(genResult.getResponse().getContentAsString())
                .path("data").path("recoveryCode").asText();

        // 3. Status now true
        mockMvc.perform(get("/api/auth/recovery-code/status")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.hasRecoveryCode", is(true)))
                .andExpect(jsonPath("$.data.createdAt", notNullValue()));

        // 4. Regenerate a new code
        var regenResult = mockMvc.perform(post("/api/auth/recovery-code/generate")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.recoveryCode", startsWith("NLV-")))
                .andReturn();

        String secondCode = objectMapper.readTree(regenResult.getResponse().getContentAsString())
                .path("data").path("recoveryCode").asText();

        assertNotEquals(firstCode, secondCode);

        // 5. Attempt reset with old firstCode must fail
        ResetPasswordWithRecoveryCodeRequest oldCodeReset = ResetPasswordWithRecoveryCodeRequest.builder()
                .email("alex@nilev.space")
                .recoveryCode(firstCode)
                .newPassword("NewPassViaOldCode123!")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/recovery-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(oldCodeReset)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("Invalid email or recovery code")));

        // 6. Reset with secondCode must succeed
        ResetPasswordWithRecoveryCodeRequest newCodeReset = ResetPasswordWithRecoveryCodeRequest.builder()
                .email("alex@nilev.space")
                .recoveryCode(secondCode)
                .newPassword("NewPassViaSecondCode123!")
                .build();

        mockMvc.perform(post("/api/auth/reset-password/recovery-code")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(newCodeReset)))
                .andExpect(status().isOk());
    }
}

