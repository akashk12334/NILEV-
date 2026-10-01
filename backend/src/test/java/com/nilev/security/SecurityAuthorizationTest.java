package com.nilev.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.activity.entity.Activity;
import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.repository.ActivityRepository;
import com.nilev.companion.entity.AnimalType;
import com.nilev.companion.entity.Companion;
import com.nilev.companion.repository.CompanionRepository;
import com.nilev.goal.entity.Goal;
import com.nilev.goal.entity.GoalStatus;
import com.nilev.goal.entity.GoalType;
import com.nilev.goal.repository.GoalRepository;
import com.nilev.habit.dto.UpdateHabitRequest;
import com.nilev.habit.entity.Habit;
import com.nilev.habit.repository.HabitRepository;
import com.nilev.notification.entity.Notification;
import com.nilev.notification.entity.NotificationType;
import com.nilev.notification.repository.NotificationRepository;
import com.nilev.partner.entity.PartnerConnection;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.surprise.entity.Surprise;
import com.nilev.surprise.entity.SurpriseStatus;
import com.nilev.surprise.entity.SurpriseType;
import com.nilev.surprise.repository.SurpriseRepository;
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

import java.time.Instant;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Cross-module security regression suite testing multi-tenant isolation,
 * IDOR prevention, 403 Forbidden enforcement, and connected-partner boundary rules.
 */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAuthorizationTest extends com.nilev.BaseIntegrationTest {

    private User userA;
    private User userB;
    private User userC;
    private String tokenA;
    private String tokenB;
    private String tokenC;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        userA = userRepo.save(User.builder().name("User A (Alex)").email("a@nilev.com").passwordHash(passwordEncoder.encode("Pass123!")).active(true).build());
        userB = userRepo.save(User.builder().name("User B (Maya)").email("b@nilev.com").passwordHash(passwordEncoder.encode("Pass123!")).active(true).build());
        userC = userRepo.save(User.builder().name("User C (Stranger)").email("c@nilev.com").passwordHash(passwordEncoder.encode("Pass123!")).active(true).build());

        // Connect userA and userB as exclusive partners
        partnerRepo.save(new PartnerConnection(userA, userB, Instant.now(), true, 12));

        tokenA = jwtTokenProvider.generateToken(UserPrincipal.create(userA));
        tokenB = jwtTokenProvider.generateToken(UserPrincipal.create(userB));
        tokenC = jwtTokenProvider.generateToken(UserPrincipal.create(userC));
    }

    @Test
    @DisplayName("RULE 1: User A cannot modify User B's habit -> 403 Forbidden")
    void testUserACannotModifyUserBHabit() throws Exception {
        Habit habitB = habitRepo.save(Habit.builder().user(userB).name("B's Habit").build());

        UpdateHabitRequest update = new UpdateHabitRequest();
        update.setName("A's Tampered Habit");

        mockMvc.perform(put("/api/habits/" + habitB.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));
    }

    @Test
    @DisplayName("RULE 2: User A cannot modify User B's goal -> 403 Forbidden")
    void testUserACannotModifyUserBGoal() throws Exception {
        Goal goalB = goalRepo.save(Goal.builder()
                .owner(userB)
                .title("B's Personal Ambition")
                .type(GoalType.PERSONAL)
                .targetValue(100.0)
                .status(GoalStatus.ACTIVE)
                .build());

        mockMvc.perform(patch("/api/goals/" + goalB.getId() + "/progress")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"increment\":10.0}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RULE 3: User A can view User B's activity ONLY when connected")
    void testActivityVisibilityByConnection() throws Exception {
        activityRepo.save(Activity.builder().actor(userB).type(ActivityType.HABIT_COMPLETED).title("Maya Morning Ritual").build());

        // Connected Partner (User A) CAN view User B's activity
        mockMvc.perform(get("/api/activity/partner")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("Maya Morning Ritual")));

        // Unconnected Outsider (User C) CANNOT view User B's activity
        mockMvc.perform(get("/api/activity/partner")
                        .header("Authorization", "Bearer " + tokenC))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(0)));
    }

    @Test
    @DisplayName("RULE 4: User A cannot access User C's private data across all domains")
    void testUserACannotAccessUserCData() throws Exception {
        // User C's resources
        Habit habitC = habitRepo.save(Habit.builder().user(userC).name("C's Private Habit").build());
        Goal goalC = goalRepo.save(Goal.builder().owner(userC).title("C's Goal").type(GoalType.PERSONAL).targetValue(50.0).status(GoalStatus.ACTIVE).build());
        Surprise surpriseC = surpriseRepo.save(Surprise.builder().sender(userC).receiver(userC).type(SurpriseType.MESSAGE).title("C Surprise").content("Text").status(SurpriseStatus.DRAFT).build());
        Notification notifC = notifRepo.save(Notification.builder().user(userC).actor(userC).type(NotificationType.HABIT_REMINDER).title("C Alert").message("Msg").build());

        // 1. Habit access by ID
        mockMvc.perform(get("/api/habits/" + habitC.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());

        // 2. Goal access by ID
        mockMvc.perform(get("/api/goals/" + goalC.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());

        // 3. User profile scraping by ID
        mockMvc.perform(get("/api/v1/users/" + userC.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));

        // 4. Surprise access by ID
        mockMvc.perform(get("/api/surprises/" + surpriseC.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());

        // 5. Notification tampering by ID
        mockMvc.perform(patch("/api/notifications/" + notifC.getId() + "/read")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RULE 5: Unauthenticated access rejected with 401 across endpoints")
    void testUnauthenticatedAccessRejected() throws Exception {
        mockMvc.perform(get("/api/habits")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/goals")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/companion")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/activity")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/surprises")).andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/notifications")).andExpect(status().isUnauthorized());
    }
}
