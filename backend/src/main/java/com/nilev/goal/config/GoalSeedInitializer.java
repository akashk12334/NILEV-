package com.nilev.goal.config;

import com.nilev.goal.entity.Goal;
import com.nilev.goal.entity.GoalStatus;
import com.nilev.goal.entity.GoalType;
import com.nilev.goal.repository.GoalRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Profile("!test")
@Order(110)
public class GoalSeedInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(GoalSeedInitializer.class);

    private final GoalRepository goalRepo;
    private final UserRepository userRepo;

    public GoalSeedInitializer(GoalRepository goalRepo, UserRepository userRepo) {
        this.goalRepo = goalRepo;
        this.userRepo = userRepo;
    }

    @Override
    public void run(String... args) {
        try {
            if (goalRepo.count() > 0) {
                return;
            }

            List<User> users = userRepo.findAll();
            if (users.isEmpty()) {
                return;
            }

            User user1 = users.get(0);
            User user2 = users.size() > 1 ? users.get(1) : user1;

            log.info("Seeding realistic showcase goals for {} and {}", user1.getName(), user2.getName());

            // 1. Shared Goal (Priority / Circular Progress) - 75% milestone reached
            Goal g1 = Goal.builder()
                    .owner(user1)
                    .partner(user2)
                    .type(GoalType.SHARED)
                    .title("Kyoto Autumn Journey Fund")
                    .description("Saving together for flights, traditional ryokan, and tea ceremonies in Kyoto & Osaka.")
                    .category("TRAVEL")
                    .targetValue(5000.0)
                    .currentValue(3750.0)
                    .unit("$")
                    .startDate(LocalDate.now().minusMonths(2))
                    .targetDate(LocalDate.now().plusMonths(3))
                    .status(GoalStatus.ACTIVE)
                    .isImportant(true)
                    .icon("✈️")
                    .color("#EC4899")
                    .lastMilestone(75)
                    .build();
            goalRepo.save(g1);

            // 2. Shared Goal (Linear Progress) - 50% milestone reached
            Goal g2 = Goal.builder()
                    .owner(user1)
                    .partner(user2)
                    .type(GoalType.SHARED)
                    .title("Cook 24 World Recipes Together")
                    .description("Exploring international cuisines every weekend from scratch.")
                    .category("RELATIONSHIP")
                    .targetValue(24.0)
                    .currentValue(14.0)
                    .unit("dishes")
                    .startDate(LocalDate.now().minusMonths(1))
                    .targetDate(LocalDate.now().plusMonths(5))
                    .status(GoalStatus.ACTIVE)
                    .isImportant(false)
                    .icon("🍳")
                    .color("#F59E0B")
                    .lastMilestone(50)
                    .build();
            goalRepo.save(g2);

            // 3. Personal Goal for User 1 (Priority / Circular Progress) - 60%
            Goal g3 = Goal.builder()
                    .owner(user1)
                    .type(GoalType.PERSONAL)
                    .title("Half-Marathon Endurance Training")
                    .description("Building weekly mileage towards the spring 21.1 km race.")
                    .category("FITNESS")
                    .targetValue(100.0)
                    .currentValue(65.0)
                    .unit("km")
                    .startDate(LocalDate.now().minusWeeks(3))
                    .targetDate(LocalDate.now().plusWeeks(6))
                    .status(GoalStatus.ACTIVE)
                    .isImportant(true)
                    .icon("🏃‍♂️")
                    .color("#10B981")
                    .lastMilestone(50)
                    .build();
            goalRepo.save(g3);

            // 4. Personal Goal for User 1 (Linear Progress) - 25% milestone reached
            Goal g4 = Goal.builder()
                    .owner(user1)
                    .type(GoalType.PERSONAL)
                    .title("Master Advanced System Architecture")
                    .description("Deep dive into distributed systems, event sourcing, and high availability design.")
                    .category("LEARNING")
                    .targetValue(20.0)
                    .currentValue(6.0)
                    .unit("modules")
                    .startDate(LocalDate.now().minusWeeks(2))
                    .targetDate(LocalDate.now().plusMonths(2))
                    .status(GoalStatus.ACTIVE)
                    .isImportant(false)
                    .icon("📚")
                    .color("#6366F1")
                    .lastMilestone(25)
                    .build();
            goalRepo.save(g4);

            // 5. Completed Goal (Personal) - 100% milestone reached
            Goal g5 = Goal.builder()
                    .owner(user1)
                    .type(GoalType.PERSONAL)
                    .title("30-Day Morning Meditation Rite")
                    .description("Daily 15-minute mindfulness practice upon waking.")
                    .category("MINDFULNESS")
                    .targetValue(30.0)
                    .currentValue(30.0)
                    .unit("days")
                    .startDate(LocalDate.now().minusMonths(2))
                    .targetDate(LocalDate.now().minusWeeks(1))
                    .status(GoalStatus.COMPLETED)
                    .isImportant(false)
                    .icon("🧘‍♂️")
                    .color("#8B5CF6")
                    .lastMilestone(100)
                    .build();
            goalRepo.save(g5);

            // 6. Completed Goal (Shared) - 100% milestone reached
            Goal g6 = Goal.builder()
                    .owner(user1)
                    .partner(user2)
                    .type(GoalType.SHARED)
                    .title("Sanctuary Alignment & Setup")
                    .description("Connect profiles, agree on mutual rituals, and inaugurate companion space.")
                    .category("GENERAL")
                    .targetValue(10.0)
                    .currentValue(10.0)
                    .unit("steps")
                    .startDate(LocalDate.now().minusMonths(1))
                    .targetDate(LocalDate.now().minusDays(5))
                    .status(GoalStatus.COMPLETED)
                    .isImportant(true)
                    .icon("💖")
                    .color("#EC4899")
                    .lastMilestone(100)
                    .build();
            goalRepo.save(g6);

            log.info("Successfully seeded 6 showcase goals across Personal, Shared, and Completed categories.");
        } catch (Exception e) {
            log.warn("Goal seed skipped: {}", e.getMessage());
        }
    }
}
