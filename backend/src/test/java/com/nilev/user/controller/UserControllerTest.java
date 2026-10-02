package com.nilev.user.controller;

import com.nilev.BaseIntegrationTest;
import com.nilev.user.dto.DeleteAccountRequest;
import com.nilev.user.dto.UpdateUserRequest;
import com.nilev.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class UserControllerTest extends BaseIntegrationTest {

    private User testUser;
    private String token;

    @BeforeEach
    void setUp() {
        cleanDatabase();
        testUser = userRepo.save(User.builder()
                .name("Alex Rivers")
                .email("alex.test@nilev.com")
                .passwordHash("hashed")
                .role("USER")
                .active(true)
                .build());
        token = jwtTokenProvider.generateAccessToken(testUser.getId(), testUser.getEmail());
    }

    @Test
    @DisplayName("GET /api/v1/users/me should return current user details")
    void testGetCurrentUser() throws Exception {
        mockMvc.perform(get("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.email").value("alex.test@nilev.com"))
                .andExpect(jsonPath("$.data.name").value("Alex Rivers"));
    }

    @Test
    @DisplayName("PUT /api/v1/users/me should update full name and nickname")
    void testUpdateCurrentUser() throws Exception {
        UpdateUserRequest request = new UpdateUserRequest("Alex R. Updated", "ShadowFox", null);

        mockMvc.perform(put("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Alex R. Updated"))
                .andExpect(jsonPath("$.data.nickname").value("ShadowFox"));
    }

    @Test
    @DisplayName("POST /api/v1/users/me/profile-picture should upload image and update avatarUrl")
    void testUploadProfilePicture() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                new byte[]{1, 2, 3, 4}
        );

        mockMvc.perform(multipart("/api/v1/users/me/profile-picture")
                        .file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.avatarUrl", containsString("/api/v1/users/avatar/avatar_")));
    }

    @Test
    @DisplayName("DELETE /api/v1/users/me/profile-picture should clear avatarUrl")
    void testRemoveProfilePicture() throws Exception {
        testUser.setAvatarUrl("https://example.com/pic.jpg");
        userRepo.save(testUser);

        mockMvc.perform(delete("/api/v1/users/me/profile-picture")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.avatarUrl").doesNotExist());
    }

    @Test
    @DisplayName("DELETE /api/v1/users/me without DELETE keyword should fail")
    void testDeleteAccountWithoutConfirmation() throws Exception {
        DeleteAccountRequest request = new DeleteAccountRequest("wrong");

        mockMvc.perform(delete("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("DELETE /api/v1/users/me with DELETE keyword should permanently delete account")
    void testDeleteAccountSuccess() throws Exception {
        DeleteAccountRequest request = new DeleteAccountRequest("DELETE");

        mockMvc.perform(delete("/api/v1/users/me")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        assertFalse(userRepo.findById(testUser.getId()).isPresent());
    }
}
