package com.nilev.surprise.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.partner.entity.PartnerConnection;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.security.JwtTokenProvider;
import com.nilev.security.UserPrincipal;
import com.nilev.surprise.dto.CreateSurpriseRequest;
import com.nilev.surprise.dto.UpdateSurpriseRequest;
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

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SurpriseControllerTest extends com.nilev.BaseIntegrationTest {

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
        partnerConnectionRepo.save(new PartnerConnection(userA, userB, Instant.now(), true, 10));

        tokenA = jwtTokenProvider.generateToken(UserPrincipal.create(userA));
        tokenB = jwtTokenProvider.generateToken(UserPrincipal.create(userB));
        tokenC = jwtTokenProvider.generateToken(UserPrincipal.create(userC));
    }

    @Test
    @DisplayName("POST /api/surprises - Sender creates delivered surprise for connected partner")
    void testCreateSurprise() throws Exception {
        CreateSurpriseRequest req = new CreateSurpriseRequest();
        req.setType(SurpriseType.MESSAGE);
        req.setTitle("Sweet Note");
        req.setContent("Thinking of you today!");
        req.setIsDraft(false);

        mockMvc.perform(post("/api/surprises")
                        .header("Authorization", "Bearer " + tokenA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.senderId", is(userA.getId().intValue())))
                .andExpect(jsonPath("$.data.receiverId", is(userB.getId().intValue())))
                .andExpect(jsonPath("$.data.status", is("DELIVERED")));
    }

    @Test
    @DisplayName("POST /api/surprises/{id}/open - Designated receiver unseals surprise successfully")
    void testReceiverCanOpenSurprise() throws Exception {
        Surprise surprise = surpriseRepo.save(Surprise.builder()
                .sender(userA)
                .receiver(userB)
                .type(SurpriseType.REWARD)
                .title("Coffee On Me")
                .content("Free iced latte!")
                .status(SurpriseStatus.DELIVERED)
                .build());

        mockMvc.perform(post("/api/surprises/" + surprise.getId() + "/open")
                        .header("Authorization", "Bearer " + tokenB))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("OPENED")))
                .andExpect(jsonPath("$.data.openedAt", notNullValue()));
    }

    // ── CRITICAL AUTHORIZATION & UNSEALING RULES ─────────────────────

    @Test
    @DisplayName("CRITICAL: Sender (User A) cannot unseal their own surprise -> 403 Forbidden")
    void testSenderCannotOpenOwnSurprise() throws Exception {
        Surprise surprise = surpriseRepo.save(Surprise.builder()
                .sender(userA)
                .receiver(userB)
                .type(SurpriseType.MESSAGE)
                .title("Secret Message")
                .content("Wait until dinner!")
                .status(SurpriseStatus.DELIVERED)
                .build());

        mockMvc.perform(post("/api/surprises/" + surprise.getId() + "/open")
                        .header("Authorization", "Bearer " + tokenA))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CRITICAL: Receiver (User B) cannot edit sender's surprise -> 403 Forbidden")
    void testReceiverCannotEditSenderSurprise() throws Exception {
        Surprise surprise = surpriseRepo.save(Surprise.builder()
                .sender(userA)
                .receiver(userB)
                .type(SurpriseType.MESSAGE)
                .title("Original Title")
                .content("Original Content")
                .status(SurpriseStatus.DRAFT)
                .build());

        UpdateSurpriseRequest update = new UpdateSurpriseRequest();
        update.setTitle("Tampered Title");

        mockMvc.perform(put("/api/surprises/" + surprise.getId())
                        .header("Authorization", "Bearer " + tokenB)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(update)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("CRITICAL: User C (outsider) cannot view or open User A's surprise -> 403 Forbidden")
    void testOutsiderCannotAccessSurprise() throws Exception {
        Surprise surprise = surpriseRepo.save(Surprise.builder()
                .sender(userA)
                .receiver(userB)
                .type(SurpriseType.MEMORY)
                .title("Our Anniversary")
                .content("Private couple memory")
                .status(SurpriseStatus.DELIVERED)
                .build());

        mockMvc.perform(get("/api/surprises/" + surprise.getId())
                        .header("Authorization", "Bearer " + tokenC))
                .andExpect(status().isForbidden());
    }
}
