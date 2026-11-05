package com.nilev.auth;

import com.nilev.BaseIntegrationTest;
import com.nilev.auth.dto.*;
import com.nilev.auth.entity.PasswordResetRequest;
import com.nilev.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PasswordManagementIntegrationTest extends BaseIntegrationTest {

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @Test
    @DisplayName("1. Public registration always creates USER role and cannot register ADMIN")
    void testRegistrationCannotCreateAdminRole() throws Exception {
        RegisterRequest registerReq = new RegisterRequest("Test User", "testuser@nilev.space", "SecurePass123!");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)));

        User created = userRepo.findByEmailIgnoreCase("testuser@nilev.space").orElseThrow();
        assertEquals("USER", created.getRole());
    }

    @Test
    @DisplayName("2. Authenticated user can change password with correct current password")
    void testChangePassword_Success() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .role("USER")
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
    @DisplayName("3. Changing password with incorrect current password fails with 400")
    void testChangePassword_IncorrectCurrentPassword() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .role("USER")
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
    @DisplayName("4. Changing password unauthenticated fails with 401")
    void testChangePassword_Unauthenticated() throws Exception {
        ChangePasswordRequest request = new ChangePasswordRequest("OldPass!", "NewPass123!");

        mockMvc.perform(post("/api/auth/change-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("5. Admin password reset request persists PENDING request with BCrypt hash; does not alter active password")
    void testAdminPasswordResetRequest_PersistsPendingRequestSafely() throws Exception {
        String originalPasswordHash = passwordEncoder.encode("OriginalSecret123!");
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(originalPasswordHash)
                .active(true)
                .role("USER")
                .build();
        userRepo.save(user);

        AdminPasswordResetRequest request = new AdminPasswordResetRequest("alex@nilev.space", "PendingNewPass123!");

        mockMvc.perform(post("/api/auth/reset-password/admin-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("Password reset request submitted successfully")));

        // Critical safety check: the original password hash in user record MUST NOT be modified yet
        User reloadedUser = userRepo.findByEmailIgnoreCase("alex@nilev.space").orElseThrow();
        assertEquals(originalPasswordHash, reloadedUser.getPasswordHash());

        // Verify request was persisted with status PENDING, 24h expiry, and BCrypt-encoded proposed hash
        List<PasswordResetRequest> pending = passwordResetRequestRepo.findByUserAndStatus(reloadedUser, "PENDING");
        assertEquals(1, pending.size());
        PasswordResetRequest req = pending.get(0);
        assertEquals("PENDING", req.getStatus());
        assertTrue(passwordEncoder.matches("PendingNewPass123!", req.getProposedPasswordHash()));
        assertNotEquals("PendingNewPass123!", req.getProposedPasswordHash()); // Never plain text
        assertTrue(req.getExpiresAt().isAfter(Instant.now()));

        // Pre-approval login attempt with proposed new password MUST fail
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alex@nilev.space", "PendingNewPass123!", false))))
                .andExpect(status().isUnauthorized());

        // Original password MUST still work
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alex@nilev.space", "OriginalSecret123!", false))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("6. Multiple reset requests by the same user supersede prior pending requests")
    void testMultipleResetRequests_SupersedesPriorPending() throws Exception {
        String originalPasswordHash = passwordEncoder.encode("OriginalSecret123!");
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(originalPasswordHash)
                .active(true)
                .role("USER")
                .build();
        userRepo.save(user);

        // Submit first request
        mockMvc.perform(post("/api/auth/reset-password/admin-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AdminPasswordResetRequest("alex@nilev.space", "FirstProposedPass123!"))))
                .andExpect(status().isOk());

        // Submit second request
        mockMvc.perform(post("/api/auth/reset-password/admin-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AdminPasswordResetRequest("alex@nilev.space", "SecondProposedPass456!"))))
                .andExpect(status().isOk());

        List<PasswordResetRequest> allRequests = passwordResetRequestRepo.findAll();
        assertEquals(2, allRequests.size());

        List<PasswordResetRequest> activePending = passwordResetRequestRepo.findByUserAndStatus(user, "PENDING");
        assertEquals(1, activePending.size());
        assertTrue(passwordEncoder.matches("SecondProposedPass456!", activePending.get(0).getProposedPasswordHash()));

        // First request is SUPERSEDED
        PasswordResetRequest superseded = allRequests.stream()
                .filter(r -> "SUPERSEDED".equals(r.getStatus()))
                .findFirst()
                .orElseThrow();
        assertTrue(passwordEncoder.matches("FirstProposedPass123!", superseded.getProposedPasswordHash()));
    }

    @Test
    @DisplayName("7. Admin password reset request for unknown email succeeds generically without creating a record")
    void testAdminPasswordResetRequest_UnknownEmail() throws Exception {
        AdminPasswordResetRequest request = new AdminPasswordResetRequest("unknown@nilev.space", "SomePassword123!");

        mockMvc.perform(post("/api/auth/reset-password/admin-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        assertEquals(0, passwordResetRequestRepo.count());
    }

    @Test
    @DisplayName("8. Admin endpoints reject unauthenticated requests with 401")
    void testAdminEndpoints_Unauthenticated() throws Exception {
        mockMvc.perform(get("/api/admin/password-resets"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/admin/password-resets/1/approve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AdminApprovalRequest("Verified via phone", true))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("9. Admin endpoints reject regular USER role with 403 Forbidden")
    void testAdminEndpoints_RegularUserForbidden() throws Exception {
        User user = User.builder()
                .name("Regular User")
                .email("user@nilev.space")
                .passwordHash(passwordEncoder.encode("UserPass123!"))
                .active(true)
                .role("USER")
                .build();
        userRepo.save(user);

        String userToken = jwtTokenProvider.generateAccessToken(user.getId(), user.getEmail());

        mockMvc.perform(get("/api/admin/password-resets")
                        .header("Authorization", "Bearer " + userToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/admin/password-resets/1/approve")
                        .header("Authorization", "Bearer " + userToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AdminApprovalRequest("Verified via phone", true))))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("10. Admin can list pending reset requests; proposedPasswordHash is NEVER exposed")
    void testAdmin_ListPendingRequests_NoHashExposed() throws Exception {
        String originalPasswordHash = passwordEncoder.encode("OriginalSecret123!");
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(originalPasswordHash)
                .active(true)
                .role("USER")
                .build();
        userRepo.save(user);

        User admin = User.builder()
                .name("Sanctuary Admin")
                .email("admin@nilev.space")
                .passwordHash(passwordEncoder.encode("AdminSecret123!"))
                .active(true)
                .role("ADMIN")
                .build();
        userRepo.save(admin);

        String adminToken = jwtTokenProvider.generateAccessToken(admin.getId(), admin.getEmail());

        // Submit reset request
        mockMvc.perform(post("/api/auth/reset-password/admin-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AdminPasswordResetRequest("alex@nilev.space", "NewDesiredPassword123!"))))
                .andExpect(status().isOk());

        // Admin lists pending requests
        mockMvc.perform(get("/api/admin/password-resets")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].userEmail", is("alex@nilev.space")))
                .andExpect(jsonPath("$.data[0].userName", is("Alex Rivera")))
                .andExpect(jsonPath("$.data[0].status", is("PENDING")))
                .andExpect(jsonPath("$.data[0].proposedPasswordHash").doesNotExist()) // Never exposed!
                .andExpect(jsonPath("$.data[0].passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("11. Admin approval fails if identity verification confirmation is missing")
    void testAdminApproval_FailsWithoutIdentityConfirmation() throws Exception {
        String originalPasswordHash = passwordEncoder.encode("OriginalSecret123!");
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(originalPasswordHash)
                .active(true)
                .role("USER")
                .build();
        userRepo.save(user);

        User admin = User.builder()
                .name("Sanctuary Admin")
                .email("admin@nilev.space")
                .passwordHash(passwordEncoder.encode("AdminSecret123!"))
                .active(true)
                .role("ADMIN")
                .build();
        userRepo.save(admin);

        String adminToken = jwtTokenProvider.generateAccessToken(admin.getId(), admin.getEmail());

        // Create pending request
        PasswordResetRequest resetReq = PasswordResetRequest.builder()
                .user(user)
                .proposedPasswordHash(passwordEncoder.encode("ApprovedPass123!"))
                .status("PENDING")
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plus(Duration.ofHours(24)))
                .build();
        passwordResetRequestRepo.save(resetReq);

        // Approval attempt with confirmedIdentity = false
        AdminApprovalRequest invalidApproval = new AdminApprovalRequest("Note without checking", false);

        mockMvc.perform(post("/api/admin/password-resets/" + resetReq.getId() + "/approve")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidApproval)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));

        // Verify request remains PENDING
        PasswordResetRequest reloaded = passwordResetRequestRepo.findById(resetReq.getId()).orElseThrow();
        assertEquals("PENDING", reloaded.getStatus());
    }

    @Test
    @DisplayName("12. Authorized admin approval atomically updates user password hash and enables successful login")
    void testAdminApproval_FullWorkflow_Success() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("OldPassword123!"))
                .active(true)
                .role("USER")
                .build();
        userRepo.save(user);

        User admin = User.builder()
                .name("Sanctuary Admin")
                .email("admin@nilev.space")
                .passwordHash(passwordEncoder.encode("AdminSecret123!"))
                .active(true)
                .role("ADMIN")
                .build();
        userRepo.save(admin);

        String adminToken = jwtTokenProvider.generateAccessToken(admin.getId(), admin.getEmail());

        // 1. User submits forgot password request
        mockMvc.perform(post("/api/auth/reset-password/admin-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AdminPasswordResetRequest("alex@nilev.space", "NewlyApprovedPass456!"))))
                .andExpect(status().isOk());

        PasswordResetRequest resetReq = passwordResetRequestRepo.findByUserAndStatus(user, "PENDING").get(0);

        // 2. Admin verifies identity out-of-band and approves request
        AdminApprovalRequest approval = new AdminApprovalRequest("Identity verified via direct audio call on 2026-11-05", true);

        mockMvc.perform(post("/api/admin/password-resets/" + resetReq.getId() + "/approve")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approval)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.message", containsString("approved successfully")));

        // 3. Verify request is COMPLETED and processedByAdminId is set
        PasswordResetRequest updatedReq = passwordResetRequestRepo.findById(resetReq.getId()).orElseThrow();
        assertEquals("COMPLETED", updatedReq.getStatus());
        assertEquals(admin.getId(), updatedReq.getProcessedByAdminId());
        assertNotNull(updatedReq.getProcessedAt());

        // 4. Verify old password is now rejected
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alex@nilev.space", "OldPassword123!", false))))
                .andExpect(status().isUnauthorized());

        // 5. Verify user CAN NOW LOG IN with the newly approved password!
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alex@nilev.space", "NewlyApprovedPass456!", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.token", notNullValue()));
    }

    @Test
    @DisplayName("13. Approving an expired request (>24 hours) fails and marks it EXPIRED")
    void testAdminApproval_ExpiredRequest_Fails() throws Exception {
        String originalPasswordHash = passwordEncoder.encode("OriginalSecret123!");
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(originalPasswordHash)
                .active(true)
                .role("USER")
                .build();
        userRepo.save(user);

        User admin = User.builder()
                .name("Sanctuary Admin")
                .email("admin@nilev.space")
                .passwordHash(passwordEncoder.encode("AdminSecret123!"))
                .active(true)
                .role("ADMIN")
                .build();
        userRepo.save(admin);

        String adminToken = jwtTokenProvider.generateAccessToken(admin.getId(), admin.getEmail());

        // Create request expired 25 hours ago
        PasswordResetRequest expiredReq = PasswordResetRequest.builder()
                .user(user)
                .proposedPasswordHash(passwordEncoder.encode("ExpiredPass123!"))
                .status("PENDING")
                .createdAt(Instant.now().minus(Duration.ofHours(26)))
                .expiresAt(Instant.now().minus(Duration.ofHours(2)))
                .build();
        passwordResetRequestRepo.save(expiredReq);

        AdminApprovalRequest approval = new AdminApprovalRequest("Identity verified via phone", true);

        mockMvc.perform(post("/api/admin/password-resets/" + expiredReq.getId() + "/approve")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(approval)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("expired")));

        // User password must NOT be updated
        User reloadedUser = userRepo.findById(user.getId()).orElseThrow();
        assertEquals(originalPasswordHash, reloadedUser.getPasswordHash());

        // Expired requests must not appear in pending list
        mockMvc.perform(get("/api/admin/password-resets")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("14. Admin rejection marks request REJECTED and leaves user password unchanged")
    void testAdminRejection_LeavesPasswordUnchanged() throws Exception {
        String originalPasswordHash = passwordEncoder.encode("OriginalSecret123!");
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(originalPasswordHash)
                .active(true)
                .role("USER")
                .build();
        userRepo.save(user);

        User admin = User.builder()
                .name("Sanctuary Admin")
                .email("admin@nilev.space")
                .passwordHash(passwordEncoder.encode("AdminSecret123!"))
                .active(true)
                .role("ADMIN")
                .build();
        userRepo.save(admin);

        String adminToken = jwtTokenProvider.generateAccessToken(admin.getId(), admin.getEmail());

        PasswordResetRequest resetReq = PasswordResetRequest.builder()
                .user(user)
                .proposedPasswordHash(passwordEncoder.encode("RejectedPass123!"))
                .status("PENDING")
                .createdAt(Instant.now())
                .expiresAt(Instant.now().plus(Duration.ofHours(24)))
                .build();
        passwordResetRequestRepo.save(resetReq);

        AdminRejectionRequest rejection = new AdminRejectionRequest("Identity could not be verified");

        mockMvc.perform(post("/api/admin/password-resets/" + resetReq.getId() + "/reject")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(rejection)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message", containsString("rejected")));

        PasswordResetRequest reloadedReq = passwordResetRequestRepo.findById(resetReq.getId()).orElseThrow();
        assertEquals("REJECTED", reloadedReq.getStatus());

        User reloadedUser = userRepo.findById(user.getId()).orElseThrow();
        assertEquals(originalPasswordHash, reloadedUser.getPasswordHash());

        // Old password still works
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("alex@nilev.space", "OriginalSecret123!", false))))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("15. Admin can list all requests including completed, rejected, and pending via /api/admin/password-resets/all")
    void testAdmin_ListAllRequests() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("Secret123!"))
                .active(true)
                .role("USER")
                .build();
        userRepo.save(user);

        User admin = User.builder()
                .name("Sanctuary Admin")
                .email("admin@nilev.space")
                .passwordHash(passwordEncoder.encode("AdminSecret123!"))
                .active(true)
                .role("ADMIN")
                .build();
        userRepo.save(admin);

        String adminToken = jwtTokenProvider.generateAccessToken(admin.getId(), admin.getEmail());

        // Create 1 pending and 1 rejected request
        PasswordResetRequest req1 = PasswordResetRequest.builder()
                .user(user)
                .proposedPasswordHash(passwordEncoder.encode("Pass1!"))
                .status("PENDING")
                .createdAt(Instant.now().minusSeconds(100))
                .expiresAt(Instant.now().plus(Duration.ofHours(24)))
                .build();
        PasswordResetRequest req2 = PasswordResetRequest.builder()
                .user(user)
                .proposedPasswordHash(passwordEncoder.encode("Pass2!"))
                .status("REJECTED")
                .createdAt(Instant.now().minusSeconds(200))
                .expiresAt(Instant.now().plus(Duration.ofHours(24)))
                .build();
        passwordResetRequestRepo.saveAll(List.of(req1, req2));

        mockMvc.perform(get("/api/admin/password-resets/all")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)));
    }

    @Test
    @DisplayName("16. User login response exposes role for frontend authorization checks")
    void testLoginResponse_ExposesRole() throws Exception {
        User admin = User.builder()
                .name("Sanctuary Admin")
                .email("admin_role@nilev.space")
                .passwordHash(passwordEncoder.encode("AdminSecret123!"))
                .active(true)
                .role("ADMIN")
                .build();
        userRepo.save(admin);

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("admin_role@nilev.space", "AdminSecret123!", false))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.user.role", is("ADMIN")));
    }
}
