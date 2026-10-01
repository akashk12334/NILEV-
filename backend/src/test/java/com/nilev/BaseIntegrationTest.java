package com.nilev;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.nilev.activity.repository.ActivityReactionRepository;
import com.nilev.activity.repository.ActivityRepository;
import com.nilev.companion.repository.CompanionHistoryRepository;
import com.nilev.companion.repository.CompanionRepository;
import com.nilev.goal.repository.GoalRepository;
import com.nilev.habit.repository.HabitCompletionRepository;
import com.nilev.habit.repository.HabitRepository;
import com.nilev.notification.repository.NotificationRepository;
import com.nilev.partner.repository.PartnerActivityRepository;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.partner.repository.PartnerInvitationRepository;
import com.nilev.security.JwtTokenProvider;
import com.nilev.surprise.repository.SurpriseRepository;
import com.nilev.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
public abstract class BaseIntegrationTest {

    @Autowired
    protected MockMvc mockMvc;

    @Autowired
    protected ObjectMapper objectMapper;

    @Autowired
    protected UserRepository userRepo;

    @Autowired
    protected UserRepository userRepository;

    @Autowired
    protected HabitRepository habitRepo;

    @Autowired
    protected HabitCompletionRepository completionRepo;

    @Autowired
    protected GoalRepository goalRepo;

    @Autowired
    protected CompanionRepository companionRepo;

    @Autowired
    protected CompanionHistoryRepository companionHistoryRepo;

    @Autowired
    protected SurpriseRepository surpriseRepo;

    @Autowired
    protected NotificationRepository notifRepo;

    @Autowired
    protected ActivityRepository activityRepo;

    @Autowired
    protected ActivityReactionRepository reactionRepo;

    @Autowired
    protected PartnerConnectionRepository partnerConnectionRepo;

    @Autowired
    protected PartnerConnectionRepository partnerRepo;

    @Autowired
    protected PartnerInvitationRepository partnerInvitationRepo;

    @Autowired
    protected PartnerActivityRepository partnerActivityRepo;

    @Autowired
    protected PasswordEncoder passwordEncoder;

    @Autowired
    protected JwtTokenProvider jwtTokenProvider;

    protected void cleanDatabase() {
        reactionRepo.deleteAll();
        activityRepo.deleteAll();
        notifRepo.deleteAll();
        surpriseRepo.deleteAll();
        goalRepo.deleteAll();
        completionRepo.deleteAll();
        habitRepo.deleteAll();
        companionHistoryRepo.deleteAll();
        companionRepo.deleteAll();
        partnerActivityRepo.deleteAll();
        partnerInvitationRepo.deleteAll();
        partnerConnectionRepo.deleteAll();
        userRepo.deleteAll();
    }
}
