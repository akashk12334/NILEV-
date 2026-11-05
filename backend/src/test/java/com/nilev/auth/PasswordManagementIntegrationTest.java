package com.nilev.auth;

import com.nilev.BaseIntegrationTest;
import com.nilev.auth.dto.AdminPasswordResetRequest;
import com.nilev.auth.dto.ChangePasswordRequest;
import com.nilev.auth.dto.LoginRequest;
import com.nilev.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PasswordManagementIntegrationTest extends BaseIntegrationTest {

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @Test
    @DisplayName("1. Authenticated user can change password with correct current password")
    void testChangePassword_Success() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        userRepo.save(user);

        String token = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());

        ChangePasswordRequest request = new ChangePasswordRequest("OldPassword123!", "NewSecret456!");

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("Password changed successfully")));

        // Verify old password no longer works
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alex@nilev.space", "OldPassword123!", false))))
                .andExpect(status().isUnauthorized());

        // Verify new password works
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alex@nilev.space", "NewSecret456!", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }

    @Test
    @DisplayName("2. Changing password with incorrect current password fails with 400")
    void testChangePassword_IncorrectCurrentPassword() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .build();
        userRepo.save(user);

        String token = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());

        ChangePasswordRequest request = new ChangePasswordRequest("WrongPass!", "NewSecret456!");

        mockMvc.perform(post("/api/auth/change-password")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @DisplayName("3. Changing password unauthenticated fails with 401")
    void testChangePassword_Unauthenticated() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest("OldPass!", "NewPass123!");

        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("4. Admin password reset request does not change user password in database")
    void testAdminPasswordResetRequest_DoesNotModifyDatabasePassword() throws Exception {
        String originalPasswordHash = passwordEncoder.encode("OriginalSecret123!");
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(originalPasswordHash)
                .active(true)
                .build();
        userRepo.save(user);

        AdminPasswordResetRequest request = new AdminPasswordResetRequest("alex@nilev.space", "AttackerControlledPass123!");

        mockMvc.perform(post("/api/auth/reset-password/admin-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("Password reset request submitted successfully")));

        // Critical safety check: the original password hash MUST NOT be modified
        User reloadedUser = userRepo.findByEmailIgnoreCase("alex@nilev.space").orElseThrow();
        assertEquals(originalPasswordHash, reloadedUser.getPasswordHash());

        // Attacker password MUST NOT be able to log in
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alex@nilev.space", "AttackerControlledPass123!", false))))
                .andExpect(status().isUnauthorized());

        // Original password MUST still work
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alex@nilev.space", "OriginalSecret123!", false))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("5. Admin password reset request for unknown email succeeds generically without leaking user existence")
    void testAdminPasswordResetRequest_UnknownEmail() throws Exception {
        AdminPasswordResetRequest request = new AdminPasswordResetRequest("unknown@nilev.space", "SomePassword123!");

        mockMvc.perform(post("/api/auth/reset-password/admin-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));
    }
}
