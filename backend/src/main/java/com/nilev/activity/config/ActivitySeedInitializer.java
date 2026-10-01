package com.nilev.activity.config;

import com.nilev.activity.entity.Activity;
import com.nilev.activity.entity.ActivityReaction;
import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.repository.ActivityReactionRepository;
import com.nilev.activity.repository.ActivityRepository;
import com.nilev.partner.entity.PartnerConnection;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

import org.springframework.context.annotation.Profile;

/**
 * Initializes rich showcase activities covering all 8 NILEV activity types
 * when users exist and the activity feed is empty.
 */
@Component
@Profile("!test")
@Order(100)
public class ActivitySeedInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ActivitySeedInitializer.class);

    private final ActivityRepository activityRepo;
    private final ActivityReactionRepository reactionRepo;
    private final UserRepository userRepo;
    private final PartnerConnectionRepository partnerRepo;

    public ActivitySeedInitializer(ActivityRepository activityRepo,
                                   ActivityReactionRepository reactionRepo,
                                   UserRepository userRepo,
                                   PartnerConnectionRepository partnerRepo) {
        this.activityRepo = activityRepo;
        this.reactionRepo = reactionRepo;
        this.userRepo = userRepo;
        this.partnerRepo = partnerRepo;
    }

    @Override
    public void run(String... args) {
        try {
            if (activityRepo.count() > 0) {
                return;
            }

            List<User> users = userRepo.findAll();
            if (users.isEmpty()) {
                return;
            }

            User user1 = users.get(0);
            User user2 = users.size() > 1 ? users.get(1) : user1;

            log.info("Seeding realistic activity events for showcase between {} and {}", user1.getName(), user2.getName());
            Instant now = Instant.now();

            // 1. HABIT_COMPLETED (user1) - 15 mins ago
            Activity a1 = Activity.builder()
                    .actor(user1)
                    .type(ActivityType.HABIT_COMPLETED)
                    .title("Completed Habit")
                    .description("Completed \"Morning Meditation\" (20 mins)")
                    .icon("🧘‍♂️")
                    .metadata("{\"habitName\":\"Morning Meditation\",\"category\":\"MINDFULNESS\",\"streak\":8,\"xp\":30}")
                    .build();
            a1.setCreatedAt(now.minus(15, ChronoUnit.MINUTES));
            activityRepo.save(a1);
            reactionRepo.save(new ActivityReaction(a1, user2, "❤️"));
            reactionRepo.save(new ActivityReaction(a1, user2, "✨"));

            // 2. HABIT_STREAK (user2) - 45 mins ago
            Activity a2 = Activity.builder()
                    .actor(user2)
                    .type(ActivityType.HABIT_STREAK)
                    .title("7-Day Streak Achieved! 🔥")
                    .description("Maintained a 7-day streak on \"Evening Starlight Walk\"")
                    .icon("🔥")
                    .metadata("{\"habitName\":\"Evening Starlight Walk\",\"streak\":7,\"xp\":100,\"badge\":\"Flame Keeper\"}")
                    .build();
            a2.setCreatedAt(now.minus(45, ChronoUnit.MINUTES));
            activityRepo.save(a2);
            reactionRepo.save(new ActivityReaction(a2, user1, "🔥"));
            reactionRepo.save(new ActivityReaction(a2, user1, "👏"));

            // 3. GOAL_PROGRESS (user1) - 2 hours ago
            Activity a3 = Activity.builder()
                    .actor(user1)
                    .type(ActivityType.GOAL_PROGRESS)
                    .title("Goal Milestone Progress")
                    .description("Progressed \"Read 24 Books This Year\" to 18/24 books")
                    .icon("🎯")
                    .metadata("{\"goalTitle\":\"Read 24 Books This Year\",\"progress\":75,\"current\":18,\"target\":24,\"unit\":\"books\"}")
                    .build();
            a3.setCreatedAt(now.minus(2, ChronoUnit.HOURS));
            activityRepo.save(a3);
            reactionRepo.save(new ActivityReaction(a3, user2, "👏"));

            // 4. COMPANION_LEVEL_UP (user2) - 4 hours ago
            Activity a4 = Activity.builder()
                    .actor(user2)
                    .type(ActivityType.COMPANION_LEVEL_UP)
                    .title("Nova Leveled Up to Level 4! ✨")
                    .description("Cosmic Companion reached Level 4 — unlocked \"Celestial Harmony Aura\"")
                    .icon("🌟")
                    .metadata("{\"companionName\":\"Nova\",\"level\":4,\"previousLevel\":3,\"unlockedAbility\":\"Celestial Harmony Aura\",\"totalXp\":1250}")
                    .build();
            a4.setCreatedAt(now.minus(4, ChronoUnit.HOURS));
            activityRepo.save(a4);
            reactionRepo.save(new ActivityReaction(a4, user1, "✨"));
            reactionRepo.save(new ActivityReaction(a4, user1, "❤️"));

            // 5. SURPRISE_SENT (user1) - 6 hours ago
            Activity a5 = Activity.builder()
                    .actor(user1)
                    .type(ActivityType.SURPRISE_SENT)
                    .title("Sent a Hidden Capsule 💌")
                    .description("Tucked away a cosmic love capsule set to open at sunset")
                    .icon("🎁")
                    .metadata("{\"surpriseTitle\":\"Starlight Playlist & Note\",\"locked\":true,\"unlockDate\":\"Today at 7:00 PM\"}")
                    .build();
            a5.setCreatedAt(now.minus(6, ChronoUnit.HOURS));
            activityRepo.save(a5);
            reactionRepo.save(new ActivityReaction(a5, user2, "❤️"));

            // 6. ACHIEVEMENT_UNLOCKED (user2) - Yesterday
            Activity a6 = Activity.builder()
                    .actor(user2)
                    .type(ActivityType.ACHIEVEMENT_UNLOCKED)
                    .title("Achievement Unlocked: Dual Resonance")
                    .description("Completed all shared daily habits together for 7 consecutive days")
                    .icon("🏆")
                    .metadata("{\"achievementName\":\"Dual Resonance\",\"rarity\":\"RARE\",\"xpReward\":250,\"icon\":\"🏆\"}")
                    .build();
            a6.setCreatedAt(now.minus(1, ChronoUnit.DAYS).minus(3, ChronoUnit.HOURS));
            activityRepo.save(a6);
            reactionRepo.save(new ActivityReaction(a6, user1, "🔥"));
            reactionRepo.save(new ActivityReaction(a6, user1, "✨"));

            // 7. GOAL_COMPLETED (user1) - Yesterday
            Activity a7 = Activity.builder()
                    .actor(user1)
                    .type(ActivityType.GOAL_COMPLETED)
                    .title("Goal Completed: 10k Training Phase 1 🎉")
                    .description("Finished the 4-week interval running challenge with flying colors")
                    .icon("🏅")
                    .metadata("{\"goalTitle\":\"10k Training Phase 1\",\"completed\":true,\"durationDays\":28,\"totalKm\":102.5}")
                    .build();
            a7.setCreatedAt(now.minus(1, ChronoUnit.DAYS).minus(8, ChronoUnit.HOURS));
            activityRepo.save(a7);
            reactionRepo.save(new ActivityReaction(a7, user2, "👏"));
            reactionRepo.save(new ActivityReaction(a7, user2, "❤️"));

            // 8. SURPRISE_OPENED (user2) - 2 days ago
            Activity a8 = Activity.builder()
                    .actor(user2)
                    .type(ActivityType.SURPRISE_OPENED)
                    .title("Opened Digital Keepsake 💖")
                    .description("Opened the anniversary countdown capsule: \"Under the Northern Lights\"")
                    .icon("🗝️")
                    .metadata("{\"surpriseTitle\":\"Under the Northern Lights\",\"opened\":true,\"memoriesCount\":4}")
                    .build();
            a8.setCreatedAt(now.minus(2, ChronoUnit.DAYS));
            activityRepo.save(a8);
            reactionRepo.save(new ActivityReaction(a8, user1, "❤️"));

            // 9. PARTNER_CONNECTED - 3 days ago
            Activity a9 = Activity.builder()
                    .actor(user1)
                    .type(ActivityType.PARTNER_CONNECTED)
                    .title("Sanctuary Connected! ❤️")
                    .description("Bond established between " + user1.getName() + " and " + user2.getName())
                    .icon("🌌")
                    .metadata("{\"partnerName\":\"" + user2.getName() + "\",\"connectionType\":\"SANCTUARY\"}")
                    .build();
            a9.setCreatedAt(now.minus(3, ChronoUnit.DAYS));
            activityRepo.save(a9);
            reactionRepo.save(new ActivityReaction(a9, user2, "❤️"));

            log.info("Successfully seeded 9 showcase activities across all activity types.");
        } catch (Exception e) {
            log.warn("Activity seed skipped or failed: {}", e.getMessage());
        }
    }
}
