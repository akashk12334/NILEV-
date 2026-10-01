package com.nilev.goal.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.goal.dto.CreateGoalRequest;
import com.nilev.goal.dto.UpdateGoalProgressRequest;
import com.nilev.goal.dto.UpdateGoalRequest;
import com.nilev.goal.entity.Goal;
import com.nilev.goal.entity.GoalStatus;
import com.nilev.goal.entity.GoalType;
import com.nilev.goal.repository.GoalRepository;
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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.time.LocalDate;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GoalControllerTest extends com.nilev.BaseIntegrationTest {

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

        // Connect userA and userB as partners
        partnerConnectionRepo.save(new PartnerConnection(userA, userB, Instant.now(), true, 10));

        tokenA = jwtTokenProvider.generateToken(UserPrincipal.create(userA));
        tokenB = jwtTokenProvider.generateToken(UserPrincipal.create(userB));
        tokenC = jwtTokenProvider.generateToken(UserPrincipal.create(userC));
    }

    @Test
    @DisplayName("POST /api/goals - Success creates personal goal for authenticated user")
    void testCreatePersonalGoal() throws Exception {
        CreateGoalRequest request = new CreateGoalRequest();
        request.setTitle("Run 100km");
        request.setDescription("Monthly running milestone");
        request.setType(GoalType.PERSONAL);
        request.setTargetValue(100.0);
        request.setCurrentValue(10.0);
        request.setUnit("km");

        mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.title", is("Run 100km")))
                .andExpect(jsonPath("$.data.ownerId", is(userA.getId().intValue())))
                .andExpect(jsonPath("$.data.type", is("PERSONAL")))
                .andExpect(jsonPath("$.data.percentage", is(10.0)));
    }

    @Test
    @DisplayName("POST /api/goals - Success creates shared goal between partners")
    void testCreateSharedGoal() throws Exception {
        CreateGoalRequest request = new CreateGoalRequest();
        request.setTitle("Cook 20 Dinners Together");
        request.setType(GoalType.SHARED);
        request.setTargetValue(20.0);
        request.setCurrentValue(0.0);
        request.setUnit("meals");

        mockMvc.perform(post("/api/goals")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.type", is("SHARED")))
                .andExpect(jsonPath("$.data.partnerId", notNullValue()));
    }

    @Test
    @DisplayName("GET /api/goals - Lists user goals by tab")
    void testListGoals() throws Exception {
        goalRepo.save(Goal.builder().owner(userA).title("Personal Goal").type(GoalType.PERSONAL).targetValue(100.0).currentValue(0.0).status(GoalStatus.ACTIVE).build());
        goalRepo.save(Goal.builder().owner(userA).partner(userB).title("Shared Goal").type(GoalType.SHARED).targetValue(50.0).currentValue(0.0).status(GoalStatus.ACTIVE).build());

        // My goals tab
        mockMvc.perform(get("/api/goals?tab=MY")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("Personal Goal")));

        // Shared goals tab
        mockMvc.perform(get("/api/goals?tab=SHARED")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title", is("Shared Goal")));
    }

    @Test
    @DisplayName("PATCH /api/goals/{id}/progress - Updates progress and detects milestones")
    void testUpdateGoalProgress() throws Exception {
        Goal goal = goalRepo.save(Goal.builder()
                .owner(userA)
                .title("Save $1000")
                .type(GoalType.PERSONAL)
                .targetValue(1000.0)
                .currentValue(200.0) // 20%
                .unit("$")
                .status(GoalStatus.ACTIVE)
                .build());

        UpdateGoalProgressRequest progress = new UpdateGoalProgressRequest();
        progress.setIncrement(100.0); // Now 300 (30% -> crosses 25% milestone!)

        mockMvc.perform(patch("/api/goals/" + goal.getId() + "/progress")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(progress)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentValue", is(300.0)))
                .andExpect(jsonPath("$.data.percentage", is(30.0)));
    }

    @Test
    @DisplayName("Shared Goal: Partner User B can contribute progress to shared goal")
    void testPartnerCanContributeToSharedGoal() throws Exception {
        Goal sharedGoal = goalRepo.save(Goal.builder()
                .owner(userA)
                .partner(userB)
                .title("Save for Vacation")
                .type(GoalType.SHARED)
                .targetValue(500.0)
                .currentValue(100.0)
                .unit("$")
                .status(GoalStatus.ACTIVE)
                .build());

        UpdateGoalProgressRequest progress = new UpdateGoalProgressRequest();
        progress.setIncrement(50.0);

        mockMvc.perform(patch("/api/goals/" + sharedGoal.getId() + "/progress")
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(progress)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentValue", is(150.0)));
    }

    // ── CRITICAL AUTHORIZATION & IDOR TESTS ──────────────────────────

    @Test
    @DisplayName("CRITICAL: User A cannot modify User B's personal goal -> 403 Forbidden")
    void testUserACannotModifyPartnerPersonalGoal() throws Exception {
        Goal mayaPersonalGoal = goalRepo.save(Goal.builder()
                .owner(userB)
                .title("Maya Secret Solo Project")
                .type(GoalType.PERSONAL)
                .targetValue(50.0)
                .currentValue(10.0)
                .status(GoalStatus.ACTIVE)
                .build());

        UpdateGoalRequest update = new UpdateGoalRequest();
        update.setTitle("Alex Modified Title");

        mockMvc.perform(put("/api/goals/" + mayaPersonalGoal.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CRITICAL: User A cannot contribute to User B's personal goal -> 403 Forbidden")
    void testUserACannotContributeToPartnerPersonalGoal() throws Exception {
        Goal mayaPersonalGoal = goalRepo.save(Goal.builder()
                .owner(userB)
                .title("Maya Personal Target")
                .type(GoalType.PERSONAL)
                .targetValue(100.0)
                .currentValue(10.0)
                .status(GoalStatus.ACTIVE)
                .build());

        UpdateGoalProgressRequest req = new UpdateGoalProgressRequest();
        req.setIncrement(15.0);

        mockMvc.perform(patch("/api/goals/" + mayaPersonalGoal.getId() + "/progress")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CRITICAL: User C (outsider) cannot access or read User A's goals -> 403 Forbidden")
    void testUserCCannotAccessUserAGoal() throws Exception {
        Goal alexGoal = goalRepo.save(Goal.builder()
                .owner(userA)
                .title("Alex Private Goal")
                .type(GoalType.PERSONAL)
                .targetValue(100.0)
                .status(GoalStatus.ACTIVE)
                .build());

        mockMvc.perform(get("/api/goals/" + alexGoal.getId())
                        .header("Authorization", "Bearer " + tokenC))
                .andExpect(status().isForbidden());
    }
}
