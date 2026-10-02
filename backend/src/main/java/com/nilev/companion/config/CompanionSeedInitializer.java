package com.nilev.companion.config;

import com.nilev.companion.entity.AnimalType;
import com.nilev.companion.entity.Companion;
import com.nilev.companion.entity.CompanionHistory;
import com.nilev.companion.entity.CompanionMood;
import com.nilev.companion.repository.CompanionHistoryRepository;
import com.nilev.companion.repository.CompanionRepository;
import com.nilev.companion.service.CompanionLevelCalculator;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Profile("!test")
@Order(120)
public class CompanionSeedInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(CompanionSeedInitializer.class);

    private final CompanionRepository companionRepo;
    private final CompanionHistoryRepository historyRepo;
    private final UserRepository userRepo;

    public CompanionSeedInitializer(
            CompanionRepository companionRepo,
            CompanionHistoryRepository historyRepo,
            UserRepository userRepo) {
        this.companionRepo = companionRepo;
        this.historyRepo = historyRepo;
        this.userRepo = userRepo;
    }

    @Override
    public void run(String... args) {
        try {
            if (companionRepo.count() > 0) {
                // Clear XP for all existing companions to ensure everyone's XP is reset
                List<Companion> existingCompanions = companionRepo.findAll();
                boolean updated = false;
                for (Companion c : existingCompanions) {
                    if (c.getXp() > 0 || c.getLevel() > 1) {
                        c.setXp(0);
                        c.setLevel(1);
                        companionRepo.save(c);
                        updated = true;
                    }
                }
                if (updated) {
                    log.info("Reset XP to 0 and level to 1 for all existing companions.");
                }
                return;
            }

            List<User> users = userRepo.findAll();
            if (users.isEmpty()) {
                return;
            }

            User user1 = users.get(0);
            User user2 = users.size() > 1 ? users.get(1) : user1;

            log.info("Seeding realistic companions for {} and {}", user1.getName(), user2.getName());

            // Companion 1: Alex's Wolf "Nova"
            int alexXp = 0;
            int alexLevel = 1;
            Companion alexComp = Companion.builder()
                    .user(user1)
                    .animalType(AnimalType.WOLF)
                    .name("Nova")
                    .xp(alexXp)
                    .level(alexLevel)
                    .happiness(92)
                    .energy(88)
                    .mood(CompanionMood.HAPPY)
                    .build();
            alexComp = companionRepo.save(alexComp);

            historyRepo.save(new CompanionHistory(alexComp, "ANIMAL_CHOSEN", 0, "Bond Forged", "You bonded with Nova the Wolf.", "🐺"));
            historyRepo.save(new CompanionHistory(alexComp, "INTERACTION", 0, "Bonds of Warmth", "Shared a gentle moment of care and affection.", "💖"));

            // Companion 2: Maya's Rabbit "Luna" (if distinct partner exists)
            if (!user1.getId().equals(user2.getId())) {
                int mayaXp = 0;
                int mayaLevel = 1;
                Companion mayaComp = Companion.builder()
                        .user(user2)
                        .animalType(AnimalType.RABBIT)
                        .name("Luna")
                        .xp(mayaXp)
                        .level(mayaLevel)
                        .happiness(96)
                        .energy(94)
                        .mood(CompanionMood.HAPPY)
                        .build();
                mayaComp = companionRepo.save(mayaComp);

                historyRepo.save(new CompanionHistory(mayaComp, "ANIMAL_CHOSEN", 0, "Bond Forged", "Luna the Rabbit joined your journey.", "🐇"));
                historyRepo.save(new CompanionHistory(mayaComp, "INTERACTION", 0, "Bonds of Warmth", "Shared a gentle moment of care and affection.", "💖"));
            }

            log.info("Companion seeding successfully completed with 0 XP.");
        } catch (Exception e) {
            log.error("Failed to seed companions: {}", e.getMessage(), e);
        }
    }
}
