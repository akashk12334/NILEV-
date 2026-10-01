package com.nilev.companion.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.companion.dto.ChooseCompanionRequest;
import com.nilev.companion.dto.UpdateCompanionRequest;
import com.nilev.companion.entity.AnimalType;
import com.nilev.companion.entity.Companion;
import com.nilev.companion.repository.CompanionHistoryRepository;
import com.nilev.companion.repository.CompanionRepository;
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

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CompanionControllerTest extends com.nilev.BaseIntegrationTest {

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
        partnerConnectionRepo.save(new PartnerConnection(userA, userB, Instant.now(), true, 7));

        tokenA = jwtTokenProvider.generateToken(UserPrincipal.create(userA));
        tokenB = jwtTokenProvider.generateToken(UserPrincipal.create(userB));
        tokenC = jwtTokenProvider.generateToken(UserPrincipal.create(userC));
    }

    @Test
    @DisplayName("GET /api/companion - Automatically initializes default companion if none exists")
    void testGetDefaultCompanion() throws Exception {
        mockMvc.perform(get("/api/companion")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.name", notNullValue()))
                .andExpect(jsonPath("$.data.level", is(1)))
                .andExpect(jsonPath("$.data.xp", is(0)));
    }

    @Test
    @DisplayName("POST /api/companion/choose - Allows user to choose animal and custom name")
    void testChooseCompanion() throws Exception {
        ChooseCompanionRequest request = new ChooseCompanionRequest();
        request.setAnimalType(AnimalType.FOX);
        request.setName("Kitsune");

        mockMvc.perform(post("/api/companion/choose")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.animalType", is("FOX")))
                .andExpect(jsonPath("$.data.name", is("Kitsune")));
    }

    @Test
    @DisplayName("POST /api/companion/interact - Boosts happiness and energy")
    void testInteractWithCompanion() throws Exception {
        mockMvc.perform(post("/api/companion/interact")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.mood", is("HAPPY")));
    }

    @Test
    @DisplayName("GET /api/companion/partner - Connected partner can view companion (view-only)")
    void testGetPartnerCompanion() throws Exception {
        // User B sets their companion
        companionRepo.save(new Companion(userB, AnimalType.CAT, "Mochi"));

        mockMvc.perform(get("/api/companion/partner")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.animalType", is("CAT")))
                .andExpect(jsonPath("$.data.name", is("Mochi")))
                .andExpect(jsonPath("$.data.userName", is("Maya")));
    }

    @Test
    @DisplayName("CRITICAL: User C without connected partner calling /api/companion/partner returns 404")
    void testUserCWithoutPartnerCannotGetPartnerCompanion() throws Exception {
        mockMvc.perform(get("/api/companion/partner")
                        .header("Authorization", "Bearer " + tokenC))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.errorCode", is("NO_PARTNER")));
    }
}
