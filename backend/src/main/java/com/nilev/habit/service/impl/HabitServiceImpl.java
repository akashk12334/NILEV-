package com.nilev.habit.service.impl;

import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.service.ActivityService;
import com.nilev.exception.NilevApiException;
import com.nilev.habit.dto.*;
import com.nilev.habit.entity.Habit;
import com.nilev.habit.entity.HabitCompletion;
import com.nilev.habit.repository.HabitCompletionRepository;
import com.nilev.habit.repository.HabitRepository;
import com.nilev.habit.service.HabitService;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import com.nilev.companion.service.CompanionService;
import java.util.stream.Collectors;

@Service
@Transactional
public class HabitServiceImpl implements HabitService {

    private final HabitRepository habitRepo;
    private final HabitCompletionRepository completionRepo;
    private final UserRepository userRepo;
    private final ActivityService activityService;
    private final CompanionService companionService;

    public HabitServiceImpl(HabitRepository habitRepo,
                            HabitCompletionRepository completionRepo,
                            UserRepository userRepo,
                            ActivityService activityService,
                            CompanionService companionService) {
        this.habitRepo = habitRepo;
        this.completionRepo = completionRepo;
        this.userRepo = userRepo;
        this.activityService = activityService;
        this.companionService = companionService;
    }

    // ── CRUD ────────────────────────────────────────────────────────

    @Override
    public HabitResponse createHabit(Long userId, CreateHabitRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));

        Habit habit = Habit.builder()
                .user(user)
                .name(request.getName())
                .description(request.getDescription())
                .icon(request.getIcon() != null ? request.getIcon() : "⭐")
                .category(request.getCategory() != null ? request.getCategory() : "General")
                .color(request.getColor() != null ? request.getColor() : "#8B5CF6")
                .frequency(request.getFrequency())
                .timeOfDay(request.getTimeOfDay())
                .build();

        habitRepo.save(habit);
        return toResponse(habit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitResponse> getHabits(Long userId) {
        return habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public HabitResponse getHabit(Long userId, Long habitId) {
        Habit habit = requireOwned(userId, habitId);
        return toResponse(habit);
    }

    @Override
    public HabitResponse updateHabit(Long userId, Long habitId, UpdateHabitRequest request) {
        Habit habit = requireOwned(userId, habitId);

        if (request.getName() != null) habit.setName(request.getName());
        if (request.getDescription() != null) habit.setDescription(request.getDescription());
        if (request.getIcon() != null) habit.setIcon(request.getIcon());
        if (request.getCategory() != null) habit.setCategory(request.getCategory());
        if (request.getColor() != null) habit.setColor(request.getColor());
        if (request.getFrequency() != null) habit.setFrequency(request.getFrequency());
        if (request.getTimeOfDay() != null) habit.setTimeOfDay(request.getTimeOfDay());
        if (request.getActive() != null) habit.setActive(request.getActive());

        return toResponse(habitRepo.save(habit));
    }

    @Override
    public void deleteHabit(Long userId, Long habitId) {
        Habit habit = requireOwned(userId, habitId);
        // Soft-delete: mark inactive
        habit.setActive(false);
        habitRepo.save(habit);
    }

    // ── Completion ──────────────────────────────────────────────────

    @Override
    public HabitResponse completeHabit(Long userId, Long habitId) {
        Habit habit = requireOwned(userId, habitId);
        LocalDate today = LocalDate.now();

        if (completionRepo.existsByHabitIdAndCompletedDate(habitId, today)) {
            throw new NilevApiException("Habit already completed today", HttpStatus.CONFLICT, "ALREADY_COMPLETED");
        }

        User user = habit.getUser();
        HabitCompletion completion = new HabitCompletion(habit, user, today);
        completionRepo.save(completion);

        // Update longest streak cache
        HabitResponse response = toResponse(habit);
        if (response.getCurrentStreak() > habit.getLongestStreak()) {
            habit.setLongestStreak(response.getCurrentStreak());
            habitRepo.save(habit);
            response.setLongestStreak(response.getCurrentStreak());
        }

        // Publish activity
        try {
            activityService.publish(
                    userId,
                    ActivityType.HABIT_COMPLETED,
                    habit.getId(),
                    "Habit Completed",
                    "Completed \"" + habit.getName() + "\" for today",
                    habit.getIcon() != null && !habit.getIcon().isBlank() ? habit.getIcon() : "✨",
                    String.format("{\"habitName\":\"%s\",\"streak\":%d,\"category\":\"%s\"}",
                            habit.getName().replace("\"", "\\\""),
                            response.getCurrentStreak(),
                            habit.getCategory() != null ? habit.getCategory().replace("\"", "\\\"") : "General")
            );

            if (response.getCurrentStreak() > 1 && (response.getCurrentStreak() % 3 == 0 || response.getCurrentStreak() == 7 || response.getCurrentStreak() == 14 || response.getCurrentStreak() == 30)) {
                activityService.publish(
                        userId,
                        ActivityType.HABIT_STREAK,
                        habit.getId(),
                        response.getCurrentStreak() + "-Day Streak! 🔥",
                        "Hit a " + response.getCurrentStreak() + "-day streak on \"" + habit.getName() + "\"!",
                        "🔥",
                        String.format("{\"habitName\":\"%s\",\"streak\":%d}",
                                habit.getName().replace("\"", "\\\""),
                                response.getCurrentStreak())
                );
            }

            // Award Companion XP
            companionService.addXp(
                    userId,
                    25,
                    "HABIT_COMPLETED",
                    "Habit Completed",
                    "Completed \"" + habit.getName() + "\" for today (+25 XP)",
                    habit.getIcon() != null && !habit.getIcon().isBlank() ? habit.getIcon() : "✨"
            );

            if (response.getCurrentStreak() > 1 && (response.getCurrentStreak() % 3 == 0 || response.getCurrentStreak() == 7)) {
                companionService.addXp(
                        userId,
                        50,
                        "HABIT_STREAK",
                        response.getCurrentStreak() + "-Day Streak! 🔥",
                        "Maintained a " + response.getCurrentStreak() + "-day streak on \"" + habit.getName() + "\" (+50 XP Bonus)",
                        "🔥"
                );
            }
        } catch (Exception ignored) {}

        return response;
    }

    @Override
    public HabitResponse uncompleteHabit(Long userId, Long habitId) {
        requireOwned(userId, habitId);
        LocalDate today = LocalDate.now();

        HabitCompletion completion = completionRepo.findByHabitIdAndCompletedDate(habitId, today)
                .orElseThrow(() -> new NilevApiException("Habit not completed today", HttpStatus.NOT_FOUND, "NOT_COMPLETED"));

        completionRepo.delete(completion);
        Habit habit = habitRepo.findById(habitId).orElseThrow();
        return toResponse(habit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<HabitCompletionResponse> getHistory(Long userId, Long habitId) {
        requireOwned(userId, habitId);
        return completionRepo.findByHabitIdOrderByCompletedDateDesc(habitId)
                .stream()
                .map(this::toCompletionResponse)
                .collect(Collectors.toList());
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private Habit requireOwned(Long userId, Long habitId) {
        Habit habit = habitRepo.findById(habitId)
                .orElseThrow(() -> new NilevApiException("Habit not found", HttpStatus.NOT_FOUND, "HABIT_NOT_FOUND"));
        if (!habit.getUser().getId().equals(userId)) {
            throw new NilevApiException("Access denied: You do not own this habit", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }
        if (!habit.isActive()) {
            throw new NilevApiException("Habit not found", HttpStatus.NOT_FOUND, "HABIT_NOT_FOUND");
        }
        return habit;
    }

    /** Map entity → response DTO, computing live stats. */
    private HabitResponse toResponse(Habit habit) {
        HabitResponse r = new HabitResponse();
        r.setId(habit.getId());
        r.setUserId(habit.getUser().getId());
        r.setName(habit.getName());
        r.setDescription(habit.getDescription());
        r.setIcon(habit.getIcon());
        r.setCategory(habit.getCategory());
        r.setColor(habit.getColor());
        r.setFrequency(habit.getFrequency());
        r.setTimeOfDay(habit.getTimeOfDay());
        r.setActive(habit.isActive());
        r.setCreatedAt(habit.getCreatedAt());
        r.setUpdatedAt(habit.getUpdatedAt());

        LocalDate today = LocalDate.now();
        Long habitId = habit.getId();

        // completedToday
        r.setCompletedToday(completionRepo.existsByHabitIdAndCompletedDate(habitId, today));

        // streak & longest
        List<LocalDate> dates = completionRepo.findCompletedDatesByHabitId(habitId);
        int currentStreak = computeCurrentStreak(dates, today);
        r.setCurrentStreak(currentStreak);
        r.setLongestStreak(Math.max(habit.getLongestStreak(), currentStreak));
        r.setTotalCompletions(dates.size());

        // weekly (last 7 days)
        long weekDone = completionRepo.countByHabitIdAndDateRange(habitId, today.minusDays(6), today);
        r.setWeeklyCompletion(Math.round((weekDone / 7.0) * 1000.0) / 10.0);

        // monthly (last 30 days)
        long monthDone = completionRepo.countByHabitIdAndDateRange(habitId, today.minusDays(29), today);
        r.setMonthlyCompletion(Math.round((monthDone / 30.0) * 1000.0) / 10.0);

        // general completion % (all time, normalized to days since creation)
        if (habit.getCreatedAt() != null) {
            long daysSinceCreation = java.time.temporal.ChronoUnit.DAYS.between(
                    habit.getCreatedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate(), today) + 1;
            double pct = (dates.size() / (double) daysSinceCreation) * 100.0;
            r.setCompletionPercentage(Math.min(100.0, Math.round(pct * 10.0) / 10.0));
        } else {
            r.setCompletionPercentage(r.getMonthlyCompletion());
        }

        return r;
    }

    /**
     * Counts consecutive days ending on or before today where a completion exists.
     * Dates list must be DESCENDING (newest first).
     */
    private int computeCurrentStreak(List<LocalDate> dates, LocalDate today) {
        if (dates.isEmpty()) return 0;

        // streak starts from today or yesterday (grace period)
        LocalDate cursor = today;
        if (!dates.contains(today)) {
            if (!dates.contains(today.minusDays(1))) {
                return 0; // broken streak
            }
            cursor = today.minusDays(1);
        }

        int streak = 0;
        for (LocalDate date : dates) {
            if (date.equals(cursor)) {
                streak++;
                cursor = cursor.minusDays(1);
            } else if (date.isBefore(cursor)) {
                break; // gap found
            }
        }
        return streak;
    }

    private HabitCompletionResponse toCompletionResponse(HabitCompletion c) {
        HabitCompletionResponse r = new HabitCompletionResponse();
        r.setId(c.getId());
        r.setHabitId(c.getHabit().getId());
        r.setUserId(c.getUser().getId());
        r.setCompletedDate(c.getCompletedDate());
        r.setCreatedAt(c.getCreatedAt());
        return r;
    }
}
