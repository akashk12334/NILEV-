package com.nilev.activity.controller;

import com.nilev.activity.entity.Activity;
import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.repository.ActivityReactionRepository;
import com.nilev.activity.repository.ActivityRepository;
import com.nilev.partner.entity.PartnerConnection;
import com.nilev.partner.repository.PartnerConnectionRepository;
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

import java.time.Instant;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ActivityControllerTest extends com.nilev.BaseIntegrationTest {

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

        // Connect userA and userB
        partnerConnectionRepo.save(new PartnerConnection(userA, userB, Instant.now(), true, 5));

        tokenA = jwtTokenProvider.generateToken(UserPrincipal.create(userA));
        tokenB = jwtTokenProvider.generateToken(UserPrincipal.create(userB));
        tokenC = jwtTokenProvider.generateToken(UserPrincipal.create(userC));
    }

    @Test
    @DisplayName("GET /api/activity - Combined feed shows activities of both connected partners")
    void testCombinedFeedWhenConnected() throws Exception {
        activityRepo.save(Activity.builder().actor(userA).type(ActivityType.HABIT_COMPLETED).title("Alex Completed Habit").build());
        activityRepo.save(Activity.builder().actor(userB).type(ActivityType.GOAL_PROGRESS).title("Maya Goal Progress").build());

        mockMvc.perform(get("/api/activity")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].title", containsInAnyOrder("Alex Completed Habit", "Maya Goal Progress")));
    }

    @Test
    @DisplayName("GET /api/activity/me - Returns only authenticated user's activities")
    void testMyFeed() throws Exception {
        activityRepo.save(Activity.builder().actor(userA).type(ActivityType.HABIT_COMPLETED).title("Alex Habit").build());
        activityRepo.save(Activity.builder().actor(userB).type(ActivityType.HABIT_COMPLETED).title("Maya Habit").build());

        mockMvc.perform(get("/api/activity/me")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("Alex Habit")));
    }

    @Test
    @DisplayName("GET /api/activity/partner - Returns only connected partner's activities")
    void testPartnerFeedWhenConnected() throws Exception {
        activityRepo.save(Activity.builder().actor(userA).type(ActivityType.HABIT_COMPLETED).title("Alex Habit").build());
        activityRepo.save(Activity.builder().actor(userB).type(ActivityType.HABIT_COMPLETED).title("Maya Habit").build());

        mockMvc.perform(get("/api/activity/partner")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("Maya Habit")));
    }

    @Test
    @DisplayName("CRITICAL: User C (unconnected) cannot view partner feed (returns empty)")
    void testUnconnectedUserPartnerFeedReturnsEmpty() throws Exception {
        activityRepo.save(Activity.builder().actor(userA).type(ActivityType.HABIT_COMPLETED).title("Alex Habit").build());

        mockMvc.perform(get("/api/activity/partner")
                        .header("Authorization", "Bearer " + tokenC))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("POST /api/activity/{id}/react/{emoji} - Connected partner can react to activity")
    void testConnectedPartnerCanReact() throws Exception {
        Activity act = activityRepo.save(Activity.builder().actor(userA).type(ActivityType.HABIT_COMPLETED).title("Alex Milestone").build());

        mockMvc.perform(post("/api/activity/{id}/react/{emoji}", act.getId(), "heart")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.added", is(true)))
                .andExpect(jsonPath("$.data.reactions['❤️']", is(1)));
    }

    @Test
    @DisplayName("CRITICAL: User C (outsider) cannot react to User A's activity -> 403 Forbidden")
    void testOutsiderCannotReactToActivity() throws Exception {
        Activity act = activityRepo.save(Activity.builder().actor(userA).type(ActivityType.HABIT_COMPLETED).title("Alex Milestone").build());

        mockMvc.perform(post("/api/activity/{id}/react/{emoji}", act.getId(), "heart")
                        .header("Authorization", "Bearer " + tokenC))
                .andExpect(status().isForbidden());
    }
}
