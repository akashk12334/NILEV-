package com.nilev.companion.service.impl;

import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.service.ActivityService;
import com.nilev.companion.dto.*;
import com.nilev.companion.entity.*;
import com.nilev.companion.repository.CompanionHistoryRepository;
import com.nilev.companion.repository.CompanionRepository;
import com.nilev.companion.service.CompanionLevelCalculator;
import com.nilev.companion.service.CompanionService;
import com.nilev.exception.NilevApiException;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompanionServiceImpl implements CompanionService {

    private static final Logger log = LoggerFactory.getLogger(CompanionServiceImpl.class);

    private final CompanionRepository companionRepo;
    private final CompanionHistoryRepository historyRepo;
    private final UserRepository userRepo;
    private final PartnerConnectionRepository partnerConnectionRepo;
    private final ActivityService activityService;

    public CompanionServiceImpl(CompanionRepository companionRepo,
                                CompanionHistoryRepository historyRepo,
                                UserRepository userRepo,
                                PartnerConnectionRepository partnerConnectionRepo,
                                ActivityService activityService) {
        this.companionRepo = companionRepo;
        this.historyRepo = historyRepo;
        this.userRepo = userRepo;
        this.partnerConnectionRepo = partnerConnectionRepo;
        this.activityService = activityService;
    }

    @Override
    public CompanionResponse getMyCompanion(Long currentUserId) {
        Companion companion = companionRepo.findByUserId(currentUserId)
                .orElseGet(() -> createDefaultCompanion(currentUserId));
        return CompanionResponse.fromEntity(companion, currentUserId);
    }

    @Override
    public CompanionResponse chooseCompanion(Long currentUserId, ChooseCompanionRequest request) {
        Companion companion = companionRepo.findByUserId(currentUserId)
                .orElseGet(() -> {
                    User user = userRepo.findById(currentUserId)
                            .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));
                    return new Companion(user, request.getAnimalType(), request.getName());
                });

        companion.setAnimalType(request.getAnimalType());
        if (request.getName() != null && !request.getName().isBlank()) {
            companion.setName(request.getName().trim());
        }

        companionRepo.save(companion);

        // Record history
        historyRepo.save(new CompanionHistory(
                companion,
                "ANIMAL_CHOSEN",
                0,
                "Bond Chosen",
                "Chose " + companion.getAnimalType().getDisplayName() + " named \"" + companion.getName() + "\"",
                companion.getAnimalType().getEmoji()
        ));

        return CompanionResponse.fromEntity(companion, currentUserId);
    }

    @Override
    public CompanionResponse updateCompanion(Long currentUserId, UpdateCompanionRequest request) {
        Companion companion = companionRepo.findByUserId(currentUserId)
                .orElseThrow(() -> new NilevApiException("Companion not found", HttpStatus.NOT_FOUND));

        if (request.getAnimalType() != null) {
            companion.setAnimalType(request.getAnimalType());
        }
        if (request.getName() != null && !request.getName().isBlank()) {
            companion.setName(request.getName().trim());
        }

        companionRepo.save(companion);
        return CompanionResponse.fromEntity(companion, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanionResponse getPartnerCompanion(Long currentUserId) {
        Long partnerId = resolvePartnerId(currentUserId);
        if (partnerId == null) {
            throw new NilevApiException("No active partner connection", HttpStatus.NOT_FOUND, "NO_PARTNER");
        }

        Companion companion = companionRepo.findByUserId(partnerId)
                .orElseThrow(() -> new NilevApiException("Partner has not chosen a companion yet", HttpStatus.NOT_FOUND));

        return CompanionResponse.fromEntity(companion, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanionHistoryResponse> getCompanionHistory(Long currentUserId, int limit) {
        Companion companion = companionRepo.findByUserId(currentUserId)
                .orElseGet(() -> createDefaultCompanion(currentUserId));

        return historyRepo.findRecentByCompanionId(companion.getId(), PageRequest.of(0, Math.min(limit, 50)))
                .stream()
                .map(CompanionHistoryResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public CompanionResponse interact(Long currentUserId) {
        Companion companion = companionRepo.findByUserId(currentUserId)
                .orElseGet(() -> createDefaultCompanion(currentUserId));

        companion.setHappiness(Math.min(100, companion.getHappiness() + 10));
        companion.setEnergy(Math.min(100, companion.getEnergy() + 5));
        companion.setMood(CompanionMood.HAPPY);
        companion.setLastInteractionDate(LocalDate.now());

        companionRepo.save(companion);

        historyRepo.save(new CompanionHistory(
                companion,
                "INTERACTION",
                5,
                "Affection & Care",
                "Shared a loving moment with " + companion.getName(),
                "💖"
        ));

        return CompanionResponse.fromEntity(companion, currentUserId);
    }

    @Override
    public Companion addXp(Long userId, int xpAmount, String eventType, String title, String description, String icon) {
        try {
            Companion companion = companionRepo.findByUserId(userId)
                    .orElseGet(() -> createDefaultCompanion(userId));

            int oldLevel = companion.getLevel();
            int newXp = companion.getXp() + Math.max(0, xpAmount);
            int newLevel = CompanionLevelCalculator.calculateLevelFromXp(newXp);

            companion.setXp(newXp);
            companion.setHappiness(Math.min(100, companion.getHappiness() + 5));

            boolean leveledUp = newLevel > oldLevel;
            if (leveledUp) {
                companion.setLevel(newLevel);
                companion.setMood(CompanionMood.PROUD);
                companion.setHappiness(100);

                // Publish Activity Event for companion level up!
                publishLevelUpActivity(companion, oldLevel, newLevel, userId);

                // History for level up
                historyRepo.save(new CompanionHistory(
                        companion,
                        "LEVEL_UP",
                        xpAmount,
                        companion.getName() + " reached Level " + newLevel + "! ✨",
                        "Evolved to Level " + newLevel + " through steady sanctuary dedication.",
                        "🌟"
                ));
            } else {
                // Update mood based on activity type
                if ("HABIT_STREAK".equals(eventType) || "GOAL_COMPLETED".equals(eventType)) {
                    companion.setMood(CompanionMood.ECSTATIC);
                } else {
                    companion.setMood(CompanionMood.EXCITED);
                }

                // Normal history entry
                historyRepo.save(new CompanionHistory(
                        companion,
                        eventType != null ? eventType : "XP_EARNED",
                        xpAmount,
                        title != null ? title : ("+" + xpAmount + " XP"),
                        description,
                        icon != null ? icon : "✨"
                ));
            }

            return companionRepo.save(companion);
        } catch (Exception e) {
            log.error("Failed to add XP to companion for user {}: {}", userId, e.getMessage(), e);
            return null;
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private Companion createDefaultCompanion(Long userId) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));

        Companion c = Companion.builder()
                .user(user)
                .animalType(AnimalType.WOLF)
                .name("Nova")
                .level(1)
                .xp(0)
                .happiness(85)
                .energy(90)
                .mood(CompanionMood.HAPPY)
                .build();

        c = companionRepo.save(c);

        historyRepo.save(new CompanionHistory(
                c,
                "BOND_INITIATED",
                0,
                "Companion Bond Awakened",
                "Met your loyal companion Nova for the first time.",
                "🐺"
        ));

        return c;
    }

    private void publishLevelUpActivity(Companion companion, int oldLevel, int newLevel, Long userId) {
        try {
            String title = companion.getName() + " Leveled Up to Level " + newLevel + "! ✨";
            String desc = companion.getAnimalType().getDisplayName() + " companion reached Level " + newLevel + "!";
            String metadata = String.format(
                    "{\"companionName\":\"%s\",\"animalType\":\"%s\",\"level\":%d,\"previousLevel\":%d,\"totalXp\":%d}",
                    companion.getName().replace("\"", "\\\""),
                    companion.getAnimalType().name(),
                    newLevel,
                    oldLevel,
                    companion.getXp()
            );

            activityService.publish(
                    userId,
                    ActivityType.COMPANION_LEVEL_UP,
                    companion.getId(),
                    title,
                    desc,
                    "🌟",
                    metadata
            );
        } catch (Exception e) {
            log.warn("Failed to publish companion level up activity: {}", e.getMessage());
        }
    }

    private Long resolvePartnerId(Long userId) {
        return partnerConnectionRepo.findActiveConnectionForUser(userId)
                .map(conn -> {
                    Long u1 = conn.getUser1().getId();
                    Long u2 = conn.getUser2().getId();
                    return userId.equals(u1) ? u2 : u1;
                })
                .orElse(null);
    }
}
