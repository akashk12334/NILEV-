package com.nilev.habit.config;

import com.nilev.habit.entity.Habit;
import com.nilev.habit.entity.HabitCompletion;
import com.nilev.habit.entity.HabitFrequency;
import com.nilev.habit.entity.HabitTimeOfDay;
import com.nilev.habit.repository.HabitCompletionRepository;
import com.nilev.habit.repository.HabitRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@Profile("!test")
@Order(20)
public class HabitSeedInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(HabitSeedInitializer.class);

    private final HabitRepository habitRepo;
    private final HabitCompletionRepository completionRepo;
    private final UserRepository userRepo;

    public HabitSeedInitializer(HabitRepository habitRepo,
                                HabitCompletionRepository completionRepo,
                                UserRepository userRepo) {
        this.habitRepo = habitRepo;
        this.completionRepo = completionRepo;
        this.userRepo = userRepo;
    }

    @Override
    public void run(String... args) {
        try {
            if (habitRepo.count() > 0) {
                return;
            }

            List<User> users = userRepo.findAll();
            if (users.isEmpty()) {
                return;
            }

            User alex = users.get(0);
            User maya = users.size() > 1 ? users.get(1) : alex;

            log.info("Seeding realistic showcase habits and 90-day completion histories for {} and {}", alex.getName(), maya.getName());

            // ── Alex's Habits ───────────────────────────────────────────
            Habit h1 = Habit.builder()
                    .user(alex)
                    .name("Morning Deep Meditation")
                    .description("15 minutes of mindful silence, deep breathwork, and intention setting.")
                    .icon("🧘")
                    .category("Mindfulness")
                    .color("#8B5CF6")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.MORNING)
                    .longestStreak(28)
                    .build();

            Habit h2 = Habit.builder()
                    .user(alex)
                    .name("Hydrate & Electrolytes")
                    .description("Drink 2.5L filtered water with Himalayan salts and lemon.")
                    .icon("💧")
                    .category("Health")
                    .color("#06B6D4")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.ANYTIME)
                    .longestStreak(35)
                    .build();

            Habit h3 = Habit.builder()
                    .user(alex)
                    .name("Sunset Cardio & Movement")
                    .description("5km outdoor run or high-tempo zone 2 cardio in the park.")
                    .icon("🏃")
                    .category("Fitness")
                    .color("#10B981")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.EVENING)
                    .longestStreak(19)
                    .build();

            Habit h4 = Habit.builder()
                    .user(alex)
                    .name("Read 25 Pages")
                    .description("Deep focus non-fiction and science reading before dinner.")
                    .icon("📚")
                    .category("Knowledge")
                    .color("#F59E0B")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.AFTERNOON)
                    .longestStreak(14)
                    .build();

            Habit h5 = Habit.builder()
                    .user(alex)
                    .name("Nightly Gratitude & Note")
                    .description("Write three moments of gratitude and leave a loving note for Maya.")
                    .icon("✨")
                    .category("Connection")
                    .color("#EC4899")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.EVENING)
                    .longestStreak(42)
                    .build();

            List<Habit> alexHabits = habitRepo.saveAll(List.of(h1, h2, h3, h4, h5));

            // ── Maya's Habits ───────────────────────────────────────────
            Habit m1 = Habit.builder()
                    .user(maya)
                    .name("Vinyasa Morning Flow")
                    .description("Dynamic 25-minute yoga sequence for mobility and core strength.")
                    .icon("🧘‍♀️")
                    .category("Fitness")
                    .color("#8B5CF6")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.MORNING)
                    .longestStreak(32)
                    .build();

            Habit m2 = Habit.builder()
                    .user(maya)
                    .name("Ceremonial Matcha & Journal")
                    .description("Slow whisked Uji matcha with morning diary and creative stream.")
                    .icon("🍵")
                    .category("Mindfulness")
                    .color("#10B981")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.MORNING)
                    .longestStreak(24)
                    .build();

            Habit m3 = Habit.builder()
                    .user(maya)
                    .name("Biophilic Design Research")
                    .description("Review sustainable architecture case studies and blueprints.")
                    .icon("📐")
                    .category("Knowledge")
                    .color("#3B82F6")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.AFTERNOON)
                    .longestStreak(18)
                    .build();

            Habit m4 = Habit.builder()
                    .user(maya)
                    .name("Digital Sunset 10 PM")
                    .description("Phone in charging dock, blue light blockers on, warm lighting.")
                    .icon("🌙")
                    .category("Health")
                    .color("#6366F1")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.EVENING)
                    .longestStreak(21)
                    .build();

            Habit m5 = Habit.builder()
                    .user(maya)
                    .name("Heartfelt Check-in with Alex")
                    .description("Uninterrupted evening tea conversation and connection.")
                    .icon("💌")
                    .category("Connection")
                    .color("#EC4899")
                    .frequency(HabitFrequency.DAILY)
                    .timeOfDay(HabitTimeOfDay.EVENING)
                    .longestStreak(45)
                    .build();

            List<Habit> mayaHabits = habitRepo.saveAll(List.of(m1, m2, m3, m4, m5));

            // ── Generate 90 Days of Realistic Completions ────────────────
            LocalDate today = LocalDate.now();
            List<HabitCompletion> completionsToSave = new ArrayList<>();

            // Seed completions for Alex
            seedCompletionsForUser(alex, alexHabits, today, completionsToSave, 0.88);

            // Seed completions for Maya
            seedCompletionsForUser(maya, mayaHabits, today, completionsToSave, 0.92);

            completionRepo.saveAll(completionsToSave);
            log.info("Successfully seeded {} habit completions across 90 days for Alex & Maya.", completionsToSave.size());

        } catch (Exception e) {
            log.error("Failed to seed showcase habits: {}", e.getMessage(), e);
        }
    }

    private void seedCompletionsForUser(User user,
                                        List<Habit> habits,
                                        LocalDate today,
                                        List<HabitCompletion> result,
                                        double baseProbability) {
        for (int dayOffset = 0; dayOffset <= 90; dayOffset++) {
            LocalDate date = today.minusDays(dayOffset);
            int dayOfWeek = date.getDayOfWeek().getValue(); // 1=Mon .. 7=Sun

            for (int i = 0; i < habits.size(); i++) {
                Habit habit = habits.get(i);
                // Slight deterministic variance based on habit index and day
                double factor = ((dayOffset * 7 + i * 13 + dayOfWeek * 5) % 100) / 100.0;
                double threshold = baseProbability;

                // Make recent 14 days especially strong to ensure current active streaks
                if (dayOffset <= 14) {
                    threshold = 0.95;
                } else if (dayOfWeek >= 6) { // weekend slight change
                    threshold = baseProbability - 0.05;
                }

                if (factor <= threshold) {
                    result.add(new HabitCompletion(habit, user, date));
                }
            }
        }
    }
}
