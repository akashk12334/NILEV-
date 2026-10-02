package com.nilev.habit.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.habit.dto.CreateHabitRequest;
import com.nilev.habit.dto.UpdateHabitRequest;
import com.nilev.habit.entity.Habit;
import com.nilev.habit.entity.HabitCompletion;
import com.nilev.habit.entity.HabitFrequency;
import com.nilev.habit.entity.HabitTimeOfDay;
import com.nilev.habit.repository.HabitCompletionRepository;
import com.nilev.habit.repository.HabitRepository;
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

import com.nilev.partner.entity.PartnerConnection;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class HabitControllerTest extends com.nilev.BaseIntegrationTest {

    private User userA;
    private User userB;
    private User userC;
    private String tokenA;
    private String tokenB;
    private String tokenC;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        userA = userRepo.save(User.builder()
                .name("Alex")
                .email("alex@test.com")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .active(true)
                .build());

        userB = userRepo.save(User.builder()
                .name("Maya")
                .email("maya@test.com")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .active(true)
                .build());

        userC = userRepo.save(User.builder()
                .name("Stranger")
                .email("stranger@test.com")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .active(true)
                .build());

        tokenA = jwtTokenProvider.generateToken(UserPrincipal.create(userA));
        tokenB = jwtTokenProvider.generateToken(UserPrincipal.create(userB));
        tokenC = jwtTokenProvider.generateToken(UserPrincipal.create(userC));
    }

    @Test
    @DisplayName("POST /api/habits - Success creates habit for authenticated user")
    void testCreateHabitSuccess() throws Exception {
        CreateHabitRequest request = new CreateHabitRequest();
        request.setName("Morning Meditation");
        request.setDescription("10 minutes of mindfulness");
        request.setIcon("🧘");
        request.setCategory("Mindfulness");
        request.setColor("#8B5CF6");
        request.setFrequency(HabitFrequency.DAILY);
        request.setTimeOfDay(HabitTimeOfDay.MORNING);

        mockMvc.perform(post("/api/habits")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", is("Morning Meditation")))
                .andExpect(jsonPath("$.data.userId", is(userA.getId().intValue())))
                .andExpect(jsonPath("$.data.icon", is("🧘")))
                .andExpect(jsonPath("$.data.completedToday", is(false)))
                .andExpect(jsonPath("$.data.currentStreak", is(0)));
    }

    @Test
    @DisplayName("POST /api/habits - Validation failure on blank name returns 400")
    void testCreateHabitBlankName() throws Exception {
        CreateHabitRequest request = new CreateHabitRequest();
        request.setName("");

        mockMvc.perform(post("/api/habits")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)))
                .andExpect(jsonPath("$.errorCode", is("VALIDATION_FAILED")));
    }

    @Test
    @DisplayName("GET /api/habits - Returns only active habits of authenticated user")
    void testGetHabitsIsolation() throws Exception {
        habitRepo.save(Habit.builder().user(userA).name("Alex Habit 1").build());
        habitRepo.save(Habit.builder().user(userA).name("Alex Habit 2").build());
        habitRepo.save(Habit.builder().user(userB).name("Maya Habit 1").build());

        mockMvc.perform(get("/api/habits")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[*].name", containsInAnyOrder("Alex Habit 1", "Alex Habit 2")));
    }

    @Test
    @DisplayName("PUT /api/habits/{id} - Success when modifying own habit")
    void testUpdateOwnHabit() throws Exception {
        Habit habit = habitRepo.save(Habit.builder().user(userA).name("Old Name").build());

        UpdateHabitRequest update = new UpdateHabitRequest();
        update.setName("New Name");

        mockMvc.perform(put("/api/habits/" + habit.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name", is("New Name")));
    }

    @Test
    @DisplayName("DELETE /api/habits/{id} - Success soft-deletes own habit")
    void testDeleteOwnHabit() throws Exception {
        Habit habit = habitRepo.save(Habit.builder().user(userA).name("To Delete").build());

        mockMvc.perform(delete("/api/habits/" + habit.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk());

        Habit deleted = habitRepo.findById(habit.getId()).orElseThrow();
        org.junit.jupiter.api.Assertions.assertFalse(deleted.isActive());
    }

    @Test
    @DisplayName("POST /api/habits/{id}/complete - Marks habit complete and calculates streak")
    void testCompleteHabit() throws Exception {
        Habit habit = habitRepo.save(Habit.builder().user(userA).name("Drink Water").build());

        mockMvc.perform(post("/api/habits/" + habit.getId() + "/complete")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedToday", is(true)))
                .andExpect(jsonPath("$.data.currentStreak", is(1)));

        // Duplicate completion today should fail with 409 Conflict
        mockMvc.perform(post("/api/habits/" + habit.getId() + "/complete")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode", is("ALREADY_COMPLETED")));
    }

    @Test
    @DisplayName("DELETE /api/habits/{id}/complete - Removes today's completion")
    void testUncompleteHabit() throws Exception {
        Habit habit = habitRepo.save(Habit.builder().user(userA).name("Evening Walk").build());
        completionRepo.save(new HabitCompletion(habit, userA, LocalDate.now()));

        mockMvc.perform(delete("/api/habits/" + habit.getId() + "/complete")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.completedToday", is(false)));
    }

    @Test
    @DisplayName("Streak calculation accounts for consecutive past days")
    void testStreakCalculation() throws Exception {
        Habit habit = habitRepo.save(Habit.builder().user(userA).name("Reading").build());
        LocalDate today = LocalDate.now();

        // 3 consecutive days completed
        completionRepo.save(new HabitCompletion(habit, userA, today.minusDays(2)));
        completionRepo.save(new HabitCompletion(habit, userA, today.minusDays(1)));
        completionRepo.save(new HabitCompletion(habit, userA, today));

        mockMvc.perform(get("/api/habits/" + habit.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.currentStreak", is(3)))
                .andExpect(jsonPath("$.data.longestStreak", is(3)));
    }

    // ── CRITICAL AUTHORIZATION & IDOR TESTS ──────────────────────────

    @Test
    @DisplayName("CRITICAL: User A cannot GET User B's habit by ID -> 403 Forbidden")
    void testUserACannotGetPartnerHabit() throws Exception {
        Habit mayaHabit = habitRepo.save(Habit.builder().user(userB).name("Maya Private Habit").build());

        mockMvc.perform(get("/api/habits/" + mayaHabit.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));
    }

    @Test
    @DisplayName("CRITICAL: User A cannot PUT User B's habit -> 403 Forbidden")
    void testUserACannotModifyPartnerHabit() throws Exception {
        Habit mayaHabit = habitRepo.save(Habit.builder().user(userB).name("Maya Private Habit").build());

        UpdateHabitRequest update = new UpdateHabitRequest();
        update.setName("Alex Hijacked Name");

        mockMvc.perform(put("/api/habits/" + mayaHabit.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));
    }

    @Test
    @DisplayName("CRITICAL: User A cannot DELETE User B's habit -> 403 Forbidden")
    void testUserACannotDeletePartnerHabit() throws Exception {
        Habit mayaHabit = habitRepo.save(Habit.builder().user(userB).name("Maya Habit").build());

        mockMvc.perform(delete("/api/habits/" + mayaHabit.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));
    }

    @Test
    @DisplayName("CRITICAL: User A cannot complete User B's habit -> 403 Forbidden")
    void testUserACannotCompletePartnerHabit() throws Exception {
        Habit mayaHabit = habitRepo.save(Habit.builder().user(userB).name("Maya Habit").build());

        mockMvc.perform(post("/api/habits/" + mayaHabit.getId() + "/complete")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));
    }

    @Test
    @DisplayName("CRITICAL: User C (outsider) cannot access User A's habit -> 403 Forbidden")
    void testUserCCannotAccessUserAHabit() throws Exception {
        Habit alexHabit = habitRepo.save(Habit.builder().user(userA).name("Alex Habit").build());

        mockMvc.perform(get("/api/habits/" + alexHabit.getId())
                        .header("Authorization", "Bearer " + tokenC))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));
    }

    // ── BULK CREATION TESTS ──────────────────────────────────────────

    @Test
    @DisplayName("POST /api/habits/bulk - Creates multiple habits in a single operation")
    void testCreateHabitsBulk() throws Exception {
        CreateHabitRequest h1 = new CreateHabitRequest();
        h1.setName("Morning Workout");
        h1.setDescription("30 mins cardio");
        h1.setFrequency(HabitFrequency.DAILY);
        h1.setStartDate(LocalDate.now());

        CreateHabitRequest h2 = new CreateHabitRequest();
        h2.setName("Read 20 Pages");
        h2.setDescription("Self improvement");
        h2.setFrequency(HabitFrequency.DAILY);
        h2.setStartDate(LocalDate.now());

        mockMvc.perform(post("/api/habits/bulk")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(List.of(h1, h2))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(2)))
                .andExpect(jsonPath("$.data[0].name", is("Morning Workout")))
                .andExpect(jsonPath("$.data[1].name", is("Read 20 Pages")));
    }

    // ── PARTNER VISIBILITY & VIEW-ONLY ACCESS TESTS ──────────────────

    @Test
    @DisplayName("GET /api/habits/partner - Partner can VIEW but CANNOT edit, delete, or complete")
    void testPartnerHabitsVisibilityAndViewOnly() throws Exception {
        // Connect userA and userB as partners
        partnerConnectionRepo.save(new PartnerConnection(userA, userB, Instant.now(), true, 5));

        // User B (Maya) creates a habit
        Habit mayaHabit = habitRepo.save(Habit.builder()
                .user(userB)
                .name("Maya Morning Yoga")
                .description("Stretch and breathwork")
                .startDate(LocalDate.now())
                .build());

        // User A (Alex) views partner's habits -> should succeed and show readOnly
        mockMvc.perform(get("/api/habits/partner")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].name", is("Maya Morning Yoga")))
                .andExpect(jsonPath("$.data[0].readOnly", is(true)))
                .andExpect(jsonPath("$.data[0].partnerNickname", is("Maya")));

        // User A CANNOT edit User B's habit -> 403 Forbidden
        UpdateHabitRequest editReq = new UpdateHabitRequest();
        editReq.setName("Hacked Yoga");
        mockMvc.perform(put("/api/habits/" + mayaHabit.getId())
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(editReq)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));

        // User A CANNOT delete User B's habit -> 403 Forbidden
        mockMvc.perform(delete("/api/habits/" + mayaHabit.getId())
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));

        // User A CANNOT complete User B's habit -> 403 Forbidden
        mockMvc.perform(post("/api/habits/" + mayaHabit.getId() + "/complete")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.errorCode", is("ACCESS_DENIED")));
    }

    // ── TODAY SUMMARY TEST ───────────────────────────────────────────

    @Test
    @DisplayName("GET /api/habits/today - Returns user today + partner today summary")
    void testGetTodaySummary() throws Exception {
        partnerConnectionRepo.save(new PartnerConnection(userA, userB, Instant.now(), true, 3));

        habitRepo.save(Habit.builder().user(userA).name("Alex Habit").startDate(LocalDate.now()).build());
        habitRepo.save(Habit.builder().user(userB).name("Maya Habit").startDate(LocalDate.now()).build());

        mockMvc.perform(get("/api/habits/today")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.partnerConnected", is(true)))
                .andExpect(jsonPath("$.data.userTotalCount", is(1)))
                .andExpect(jsonPath("$.data.partnerTotalCount", is(1)))
                .andExpect(jsonPath("$.data.sharedTotalCount", is(2)));
    }

    // ── START / END DATE & EXPIRATION TESTS ──────────────────────────

    @Test
    @DisplayName("POST /api/habits/{id}/complete - Expired habit cannot be completed -> 400")
    void testExpiredHabitCannotBeCompleted() throws Exception {
        Habit expiredHabit = habitRepo.save(Habit.builder()
                .user(userA)
                .name("Old Challenge")
                .startDate(LocalDate.now().minusDays(10))
                .endDate(LocalDate.now().minusDays(1))
                .build());

        mockMvc.perform(post("/api/habits/" + expiredHabit.getId() + "/complete")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode", is("HABIT_EXPIRED")));
    }

    @Test
    @DisplayName("POST /api/habits/{id}/complete - Future unstarted habit cannot be completed -> 400")
    void testNotStartedHabitCannotBeCompleted() throws Exception {
        Habit futureHabit = habitRepo.save(Habit.builder()
                .user(userA)
                .name("Future Habit")
                .startDate(LocalDate.now().plusDays(5))
                .build());

        mockMvc.perform(post("/api/habits/" + futureHabit.getId() + "/complete")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode", is("HABIT_NOT_STARTED")));
    }
}
