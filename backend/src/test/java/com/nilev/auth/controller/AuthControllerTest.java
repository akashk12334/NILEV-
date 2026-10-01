package com.nilev.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.auth.dto.LoginRequest;
import com.nilev.auth.dto.RefreshTokenRequest;
import com.nilev.auth.dto.RegisterRequest;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest extends com.nilev.BaseIntegrationTest {

    @BeforeEach
    void setUp() {
        cleanDatabase();
    }

    @Test
    @DisplayName("POST /api/auth/register should create user and return 201 Created with JWT tokens and user without passwordHash")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.data.tokenType", is("Bearer")))
                .andExpect(jsonPath("$.data.user.name", is("Alex Rivera")))
                .andExpect(jsonPath("$.data.user.email", is("alex@nilev.space")))
                .andExpect(jsonPath("$.data.user.active", is(true)))
                .andExpect(jsonPath("$.data.user.passwordHash").doesNotExist())
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/register with duplicate email should return 409 Conflict")
    void testRegisterDuplicateEmail() throws Exception {
        // Pre-create user
        User existing = User.builder()
                .name("Existing User")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("ExistingPass123"))
                .active(true)
                .build();
        userRepository.save(existing);

        RegisterRequest request = RegisterRequest.builder()
                .name("Alex Duplicate")
                .email("alex@nilev.space")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("already exists")));
    }

    @Test
    @DisplayName("POST /api/auth/register with invalid data should return 400 Bad Request")
    void testRegisterValidationErrors() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .name("") // blank name
                .email("not-an-email")
                .password("123") // too short
                .build();

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errors", notNullValue()));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 200 OK and tokens for valid credentials")
    void testLoginSuccess() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .active(true)
                .build();
        userRepository.save(user);

        LoginRequest request = LoginRequest.builder()
                .email("alex@nilev.space")
                .password("Password123!")
                .rememberMe(true)
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()))
                .andExpect(jsonPath("$.data.user.email", is("alex@nilev.space")))
                .andExpect(jsonPath("$.data.user.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/login should return 401 Unauthorized for wrong password")
    void testLoginInvalidCredentials() throws Exception {
        User user = User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .active(true)
                .build();
        userRepository.save(user);

        LoginRequest request = LoginRequest.builder()
                .email("alex@nilev.space")
                .password("WrongPassword999")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.message", containsString("Invalid email or password")));
    }

    @Test
    @DisplayName("POST /api/auth/login should return 403 Forbidden for inactive account")
    void testLoginInactiveAccount() throws Exception {
        User user = User.builder()
                .name("Inactive User")
                .email("inactive@nilev.space")
                .passwordHash(passwordEncoder.encode("Password123!"))
                .active(false)
                .build();
        userRepository.save(user);

        LoginRequest request = LoginRequest.builder()
                .email("inactive@nilev.space")
                .password("Password123!")
                .build();

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errorCode", is("ACCOUNT_INACTIVE")));
    }

    @Test
    @DisplayName("GET /api/auth/me should return current user when authenticated, 401 when not")
    void testGetMe() throws Exception {
        // Unauthenticated request should fail with 401
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());

        // Register and get token
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Maya Lin")
                .email("maya@nilev.space")
                .password("SecurePass123!")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        String accessToken = objectMapper.readTree(responseBody)
                .path("data").path("accessToken").asText();

        // Authenticated request with Bearer token
        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.email", is("maya@nilev.space")))
                .andExpect(jsonPath("$.data.name", is("Maya Lin")))
                .andExpect(jsonPath("$.data.passwordHash").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/auth/refresh should issue new tokens with valid refresh token")
    void testRefreshToken() throws Exception {
        RegisterRequest registerReq = RegisterRequest.builder()
                .name("Alex Refresh")
                .email("refresh@nilev.space")
                .password("SecurePass123!")
                .build();

        MvcResult result = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(registerReq)))
                .andExpect(status().isCreated())
                .andReturn();

        String responseBody = result.getResponse().getContentAsString();
        String refreshToken = objectMapper.readTree(responseBody)
                .path("data").path("refreshToken").asText();

        RefreshTokenRequest refreshReq = new RefreshTokenRequest(refreshToken);

        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(refreshReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andExpect(jsonPath("$.data.refreshToken", notNullValue()));
    }
}
