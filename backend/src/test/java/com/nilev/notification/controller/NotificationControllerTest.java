package com.nilev.notification.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.notification.entity.Notification;
import com.nilev.notification.entity.NotificationType;
import com.nilev.notification.repository.NotificationRepository;
import com.nilev.security.JwtTokenProvider;
import com.nilev.security.UserPrincipal;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NotificationControllerTest extends com.nilev.BaseIntegrationTest {

    private User userA;
    private User userB;
    private User userC;
    private String tokenA;
    private String tokenB;
    private String tokenC;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        userA = userRepo.save(User.builder().name("Alex").email("alex@test.com").passwordHash(passwordEncoder.encode("Pass123!")).active(true).build());
        userB = userRepo.save(User.builder().name("Maya").email("maya@test.com").passwordHash(passwordEncoder.encode("Pass123!")).active(true).build());
        userC = userRepo.save(User.builder().name("Stranger").email("stranger@test.com").passwordHash(passwordEncoder.encode("Pass123!")).active(true).build());

        tokenA = jwtTokenProvider.generateToken(UserPrincipal.create(userA));
        tokenB = jwtTokenProvider.generateToken(UserPrincipal.create(userB));
        tokenC = jwtTokenProvider.generateToken(UserPrincipal.create(userC));
    }

    @Test
    @DisplayName("GET /api/notifications - Returns only notifications belonging to authenticated user")
    void testGetNotificationsIsolation() throws Exception {
        notifRepo.save(Notification.builder().user(userA).actor(userB).type(NotificationType.PARTNER_ACTIVITY).title("Maya finished habit").message("Way to go").build());
        notifRepo.save(Notification.builder().user(userB).actor(userA).type(NotificationType.SURPRISE_RECEIVED).title("Surprise for Maya").message("Open now").build());

        mockMvc.perform(get("/api/notifications")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.notifications", hasSize(1)))
                .andExpect(jsonPath("$.data.notifications[0].title", is("Maya finished habit")))
                .andExpect(jsonPath("$.data.unreadCount", is(1)));
    }

    @Test
    @DisplayName("PATCH /api/notifications/{id}/read - Owner can mark notification as read")
    void testMarkAsReadSuccess() throws Exception {
        Notification notif = notifRepo.save(Notification.builder()
                .user(userA)
                .actor(userB)
                .type(NotificationType.HABIT_REMINDER)
                .title("Reminder")
                .message("Drink water")
                .build());

        mockMvc.perform(patch("/api/notifications/" + notif.getId() + "/read")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.read", is(true)));
    }

    @Test
    @DisplayName("PATCH /api/notifications/read-all - Marks all user notifications as read")
    void testMarkAllAsRead() throws Exception {
        notifRepo.save(Notification.builder().user(userA).actor(userB).type(NotificationType.HABIT_REMINDER).title("1").message("m1").build());
        notifRepo.save(Notification.builder().user(userA).actor(userB).type(NotificationType.HABIT_REMINDER).title("2").message("m2").build());

        mockMvc.perform(patch("/api/notifications/read-all")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/notifications/unread-count")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.unreadCount", is(0)));
    }

    // ── CRITICAL IDOR NOTIFICATION TESTS ─────────────────────────────

    @Test
    @DisplayName("CRITICAL: User B cannot mark User A's notification as read -> 403 Forbidden")
    void testUserBCannotMarkUserANotification() throws Exception {
        Notification notif = notifRepo.save(Notification.builder()
                .user(userA)
                .actor(userC)
                .type(NotificationType.HABIT_REMINDER)
                .title("Private Alert")
                .message("Private message")
                .build());

        mockMvc.perform(patch("/api/notifications/" + notif.getId() + "/read")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));
    }

    @Test
    @DisplayName("CRITICAL: User C (outsider) cannot mark User A's notification -> 403 Forbidden")
    void testOutsiderCannotMarkUserANotification() throws Exception {
        Notification notif = notifRepo.save(Notification.builder()
                .user(userA)
                .actor(userB)
                .type(NotificationType.PARTNER_CONNECTED)
                .title("Sanctuary Bond")
                .message("Private")
                .build());

        mockMvc.perform(patch("/api/notifications/" + notif.getId() + "/read")
                        .header("Authorization", "Bearer " + tokenC))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));
    }
}
