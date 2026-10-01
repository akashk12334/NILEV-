package com.nilev.partner.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.partner.dto.AcceptInvitationRequest;
import com.nilev.partner.dto.InvitePartnerRequest;
import com.nilev.partner.repository.PartnerActivityRepository;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.partner.repository.PartnerInvitationRepository;
import com.nilev.partner.security.PartnerSecurityService;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PartnerControllerTest extends com.nilev.BaseIntegrationTest {

    @Autowired
    private PartnerSecurityService partnerSecurityService;

    private User user1;
    private User user2;
    private User user3;
    private String token1;
    private String token2;
    private String token3;

    @BeforeEach
    void setUp() {
        cleanDatabase();

        user1 = userRepository.save(User.builder()
                .name("Alex Rivera")
                .email("alex@nilev.space")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .active(true)
                .xp(500)
                .level(3)
                .streak(7)
                .companionName("Cosmo")
                .companionType("CELESTIAL_FOX")
                .build());

        user2 = userRepository.save(User.builder()
                .name("Maya Lin")
                .email("maya@nilev.space")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .active(true)
                .xp(750)
                .level(4)
                .streak(9)
                .companionName("Nebula")
                .companionType("ASTRAL_OWL")
                .build());

        user3 = userRepository.save(User.builder()
                .name("Third Person")
                .email("third@nilev.space")
                .passwordHash(passwordEncoder.encode("Pass123!"))
                .active(true)
                .build());

        token1 = jwtTokenProvider.generateToken(UserPrincipal.create(user1));
        token2 = jwtTokenProvider.generateToken(UserPrincipal.create(user2));
        token3 = jwtTokenProvider.generateToken(UserPrincipal.create(user3));
    }

    @Test
    @DisplayName("GET /api/partners when uncoupled returns NO_PARTNER")
    void testGetStatusNoPartner() throws Exception {
        mockMvc.perform(get("/api/partners")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("NO_PARTNER")))
                .andExpect(jsonPath("$.data.user.name", is("Alex Rivera")))
                .andExpect(jsonPath("$.data.partner").doesNotExist());
    }

    @Test
    @DisplayName("POST /api/partners/invite to self returns 400 Bad Request")
    void testInviteSelfFails() throws Exception {
        InvitePartnerRequest req = new InvitePartnerRequest("alex@nilev.space");

        mockMvc.perform(post("/api/partners/invite")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode", is("SELF_INVITATION")));
    }

    @Test
    @DisplayName("Full Partner Lifecycle: Invite -> Pending -> Accept -> Connected -> Activity -> Disconnect")
    void testFullPartnerLifecycle() throws Exception {
        // 1. Alex invites Maya
        InvitePartnerRequest inviteReq = new InvitePartnerRequest("maya@nilev.space");
        mockMvc.perform(post("/api/partners/invite")
                        .header("Authorization", "Bearer " + token1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(inviteReq)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.status", is("INVITATION_SENT")))
                .andExpect(jsonPath("$.data.invitation.receiverEmail", is("maya@nilev.space")));

        // 2. Alex checks status -> INVITATION_SENT
        mockMvc.perform(get("/api/partners")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("INVITATION_SENT")));

        // 3. Maya checks status -> INVITATION_RECEIVED
        mockMvc.perform(get("/api/partners")
                        .header("Authorization", "Bearer " + token2))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("INVITATION_RECEIVED")))
                .andExpect(jsonPath("$.data.invitation.senderName", is("Alex Rivera")));

        // 4. Maya accepts the invitation
        mockMvc.perform(post("/api/partners/accept")
                        .header("Authorization", "Bearer " + token2)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new AcceptInvitationRequest())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("CONNECTED")))
                .andExpect(jsonPath("$.data.user.name", is("Maya Lin")))
                .andExpect(jsonPath("$.data.partner.name", is("Alex Rivera")))
                .andExpect(jsonPath("$.data.partner.isPartner", is(true)))
                .andExpect(jsonPath("$.data.partner.readOnly", is(true)))
                .andExpect(jsonPath("$.data.partner.companionName", is("Cosmo")))
                .andExpect(jsonPath("$.data.sharedStreak", is(1)));

        // 5. Alex checks status -> CONNECTED with Maya as partner
        mockMvc.perform(get("/api/partners")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("CONNECTED")))
                .andExpect(jsonPath("$.data.partner.name", is("Maya Lin")))
                .andExpect(jsonPath("$.data.partner.readOnly", is(true)))
                .andExpect(jsonPath("$.data.partner.companionName", is("Nebula")));

        // 6. Third person cannot invite Alex or Maya (409 Conflict - already connected)
        InvitePartnerRequest thirdReq = new InvitePartnerRequest("alex@nilev.space");
        mockMvc.perform(post("/api/partners/invite")
                        .header("Authorization", "Bearer " + token3)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(thirdReq)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.errorCode", is("PARTNER_ALREADY_CONNECTED")));

        // 7. Check activity timeline
        mockMvc.perform(get("/api/partners/activity")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", hasSize(greaterThanOrEqualTo(1))));

        // 8. Test authorization rules in service layer
        // Set SecurityContext as Alex (user1)
        UserPrincipal principal1 = UserPrincipal.create(user1);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(principal1, null, principal1.getAuthorities())
        );

        // Can read Maya's data (connected partner)
        assertTrue(partnerSecurityService.canRead(user2.getId()));
        // Cannot modify Maya's data (partner data is read-only)
        assertFalse(partnerSecurityService.canModify(user2.getId()));
        // Enforcing modification on partner should throw UnauthorizedPartnerAccessException
        assertThrows(com.nilev.exception.UnauthorizedPartnerAccessException.class, () -> {
            partnerSecurityService.enforceCanModifyHabit(user2.getId());
        });
        assertThrows(com.nilev.exception.UnauthorizedPartnerAccessException.class, () -> {
            partnerSecurityService.enforceCanModifyProfile(user2.getId());
        });
        assertThrows(com.nilev.exception.UnauthorizedPartnerAccessException.class, () -> {
            partnerSecurityService.enforceCanModifyGoal(user2.getId());
        });
        assertThrows(com.nilev.exception.UnauthorizedPartnerAccessException.class, () -> {
            partnerSecurityService.enforceCanModifyCompanion(user2.getId());
        });

        // 9. Disconnect partner
        mockMvc.perform(delete("/api/partners/connection")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk());

        // Subsequent check returns NO_PARTNER
        mockMvc.perform(get("/api/partners")
                        .header("Authorization", "Bearer " + token1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("NO_PARTNER")));
    }
}
