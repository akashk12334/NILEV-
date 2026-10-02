package com.nilev.habit.service.impl;

import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.service.ActivityService;
import com.nilev.exception.NilevApiException;
import com.nilev.habit.dto.*;
import com.nilev.habit.entity.Habit;
import com.nilev.habit.entity.HabitCompletion;
import com.nilev.habit.entity.HabitFrequency;
import com.nilev.habit.entity.HabitTimeOfDay;
import com.nilev.habit.repository.HabitCompletionRepository;
import com.nilev.habit.repository.HabitRepository;
import com.nilev.habit.service.HabitService;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import com.nilev.companion.service.CompanionService;
import com.nilev.notification.entity.NotificationType;
import com.nilev.notification.service.NotificationService;
import com.nilev.partner.entity.PartnerConnection;
import com.nilev.partner.repository.PartnerConnectionRepository;
import java.util.stream.Collectors;

@Service
@Transactional
public class HabitServiceImpl implements HabitService {

    private static final Logger log = LoggerFactory.getLogger(HabitServiceImpl.class);

    private final HabitRepository habitRepo;
    private final HabitCompletionRepository completionRepo;
    private final UserRepository userRepo;
    private final ActivityService activityService;
    private final CompanionService companionService;
    private final NotificationService notificationService;
    private final PartnerConnectionRepository partnerConnectionRepo;

    public HabitServiceImpl(HabitRepository habitRepo,
                            HabitCompletionRepository completionRepo,
                            UserRepository userRepo,
                            ActivityService activityService,
                            CompanionService companionService,
                            NotificationService notificationService,
                            PartnerConnectionRepository partnerConnectionRepo) {
        this.habitRepo = habitRepo;
        this.completionRepo = completionRepo;
        this.userRepo = userRepo;
        this.activityService = activityService;
        this.companionService = companionService;
        this.notificationService = notificationService;
        this.partnerConnectionRepo = partnerConnectionRepo;
    }

    // ── CRUD ────────────────────────────────────────────────────────

    @Override
    public HabitResponse createHabit(Long userId, CreateHabitRequest request) {
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));

        if (request.getStartDate() != null && request.getEndDate() != null
                && request.getEndDate().isBefore(request.getStartDate())) {
            throw new NilevApiException("End date cannot be before start date", HttpStatus.BAD_REQUEST);
        }

        Habit habit = Habit.builder()
                .user(user)
                .name(request.getName().trim())
                .description(request.getDescription())
                .icon(request.getIcon() != null && !request.getIcon().isBlank() ? request.getIcon() : "⭐")
                .category(request.getCategory() != null && !request.getCategory().isBlank() ? request.getCategory() : "General")
                .color(request.getColor() != null && !request.getColor().isBlank() ? request.getColor() : "#8B5CF6")
                .frequency(request.getFrequency() != null ? request.getFrequency() : HabitFrequency.DAILY)
                .timeOfDay(request.getTimeOfDay() != null ? request.getTimeOfDay() : HabitTimeOfDay.ANYTIME)
                .startDate(request.getStartDate() != null ? request.getStartDate() : LocalDate.now())
                .endDate(request.getEndDate())
                .build();

        habitRepo.save(habit);
        return toResponse(habit);
    }

    @Override
    public List<HabitResponse> createHabitsBulk(Long userId, List<CreateHabitRequest> requests) {
        if (requests == null || requests.isEmpty()) {
            throw new NilevApiException("Habit list cannot be empty", HttpStatus.BAD_REQUEST);
        }
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));

        List<Habit> toSave = new ArrayList<>();
        LocalDate today = LocalDate.now();

        for (int i = 0; i < requests.size(); i++) {
            CreateHabitRequest req = requests.get(i);
            if (req.getName() == null || req.getName().trim().isEmpty()) {
                throw new NilevApiException("Habit #" + (i + 1) + " must have a name", HttpStatus.BAD_REQUEST);
            }
            if (req.getStartDate() != null && req.getEndDate() != null
                    && req.getEndDate().isBefore(req.getStartDate())) {
                throw new NilevApiException("Habit '" + req.getName() + "' end date cannot be before start date", HttpStatus.BAD_REQUEST);
            }

            Habit habit = Habit.builder()
                    .user(user)
                    .name(req.getName().trim())
                    .description(req.getDescription())
                    .icon(req.getIcon() != null && !req.getIcon().isBlank() ? req.getIcon() : "⭐")
                    .category(req.getCategory() != null && !req.getCategory().isBlank() ? req.getCategory() : "General")
                    .color(req.getColor() != null && !req.getColor().isBlank() ? req.getColor() : "#8B5CF6")
                    .frequency(req.getFrequency() != null ? req.getFrequency() : HabitFrequency.DAILY)
                    .timeOfDay(req.getTimeOfDay() != null ? req.getTimeOfDay() : HabitTimeOfDay.ANYTIME)
                    .startDate(req.getStartDate() != null ? req.getStartDate() : today)
                    .endDate(req.getEndDate())
                    .build();

            toSave.add(habit);
        }

        List<Habit> saved = habitRepo.saveAll(toSave);
        return saved.stream().map(this::toResponse).collect(Collectors.toList());
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
    public List<HabitResponse> getPartnerHabits(Long currentUserId) {
        User currentUser = userRepo.findById(currentUserId)
                .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));

        return partnerConnectionRepo.findActiveConnectionForUser(currentUserId)
                .map(conn -> {
                    User partner = conn.getPartnerOf(currentUserId);
                    if (partner == null) return List.<HabitResponse>of();
                    return habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(partner.getId())
                            .stream()
                            .map(h -> toResponse(h, currentUser))
                            .collect(Collectors.toList());
                })
                .orElseGet(List::of);
    }

    @Override
    @Transactional(readOnly = true)
    public TodayHabitSummaryResponse getTodaySummary(Long currentUserId) {
        User currentUser = userRepo.findById(currentUserId)
                .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));

        TodayHabitSummaryResponse summary = new TodayHabitSummaryResponse();

        // 1. Current user active habits for today
        List<Habit> allUserHabits = habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(currentUserId);
        List<HabitResponse> userTodayHabits = allUserHabits.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
        summary.setUserHabits(userTodayHabits);

        // Active today counts (exclude not-started and expired habits from today's active count)
        List<HabitResponse> userEligibleToday = userTodayHabits.stream()
                .filter(h -> !"NOT_STARTED".equals(h.getDailyStatus()) && !"EXPIRED".equals(h.getDailyStatus()))
                .collect(Collectors.toList());
        int userTotal = userEligibleToday.size();
        int userDone = (int) userEligibleToday.stream().filter(HabitResponse::isCompletedToday).count();
        summary.setUserTotalCount(userTotal);
        summary.setUserCompletedCount(userDone);
        summary.setUserPercentage(userTotal > 0 ? (int) Math.round(((double) userDone / userTotal) * 100) : 0);

        // 2. Partner habits if connected
        partnerConnectionRepo.findActiveConnectionForUser(currentUserId).ifPresent(conn -> {
            User partner = conn.getPartnerOf(currentUserId);
            if (partner != null) {
                summary.setPartnerConnected(true);
                summary.setPartnerName(partner.getName());
                String pNickname = (partner.getNickname() != null && !partner.getNickname().isBlank())
                        ? partner.getNickname() : partner.getName();
                summary.setPartnerNickname(pNickname);

                List<Habit> allPartnerHabits = habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(partner.getId());
                List<HabitResponse> partnerTodayHabits = allPartnerHabits.stream()
                        .map(h -> toResponse(h, currentUser))
                        .collect(Collectors.toList());
                summary.setPartnerHabits(partnerTodayHabits);

                List<HabitResponse> partnerEligibleToday = partnerTodayHabits.stream()
                        .filter(h -> !"NOT_STARTED".equals(h.getDailyStatus()) && !"EXPIRED".equals(h.getDailyStatus()))
                        .collect(Collectors.toList());
                int partnerTotal = partnerEligibleToday.size();
                int partnerDone = (int) partnerEligibleToday.stream().filter(HabitResponse::isCompletedToday).count();
                summary.setPartnerTotalCount(partnerTotal);
                summary.setPartnerCompletedCount(partnerDone);
                summary.setPartnerPercentage(partnerTotal > 0 ? (int) Math.round(((double) partnerDone / partnerTotal) * 100) : 0);
            }
        });

        // 3. Shared progress
        int sharedTotal = summary.getUserTotalCount() + summary.getPartnerTotalCount();
        int sharedDone = summary.getUserCompletedCount() + summary.getPartnerCompletedCount();
        summary.setSharedTotalCount(sharedTotal);
        summary.setSharedCompletedCount(sharedDone);
        summary.setSharedPercentage(sharedTotal > 0 ? (int) Math.round(((double) sharedDone / sharedTotal) * 100) : 0);

        return summary;
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

        if (request.getName() != null && !request.getName().isBlank()) habit.setName(request.getName().trim());
        if (request.getDescription() != null) habit.setDescription(request.getDescription());
        if (request.getIcon() != null) habit.setIcon(request.getIcon());
        if (request.getCategory() != null) habit.setCategory(request.getCategory());
        if (request.getColor() != null) habit.setColor(request.getColor());
        if (request.getFrequency() != null) habit.setFrequency(request.getFrequency());
        if (request.getTimeOfDay() != null) habit.setTimeOfDay(request.getTimeOfDay());
        if (request.getStartDate() != null) habit.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) habit.setEndDate(request.getEndDate());
        if (habit.getStartDate() != null && habit.getEndDate() != null
                && habit.getEndDate().isBefore(habit.getStartDate())) {
            throw new NilevApiException("End date cannot be before start date", HttpStatus.BAD_REQUEST);
        }
        if (request.getActive() != null) habit.setActive(request.getActive());

        return toResponse(habitRepo.save(habit));
    }

    @Override
    public void deleteHabit(Long userId, Long habitId) {
        Habit habit = requireOwned(userId, habitId);
        User user = habit.getUser();
        // Soft-delete: mark inactive
        habit.setActive(false);
        habitRepo.save(habit);

        // Notify connected partner
        try {
            partnerConnectionRepo.findActiveConnectionForUser(userId).ifPresent(conn -> {
                User partner = conn.getPartnerOf(userId);
                if (partner != null) {
                    String actorName = (user.getNickname() != null && !user.getNickname().isBlank())
                            ? user.getNickname() : user.getName();
                    notificationService.sendNotification(
                            partner,
                            user,
                            NotificationType.HABIT_DELETED,
                            actorName + " removed a habit",
                            actorName + " removed the habit \"" + habit.getName() + "\".",
                            "🗑️",
                            habit.getId(),
                            "HABIT",
                            "/habits"
                    );
                }
            });
        } catch (Exception e) {
            log.warn("Failed to send habit deletion notification to partner: {}", e.getMessage());
        }
    }

    // ── Completion ──────────────────────────────────────────────────

    @Override
    public HabitResponse completeHabit(Long userId, Long habitId) {
        Habit habit = requireOwned(userId, habitId);
        LocalDate today = LocalDate.now();

        if (habit.getStartDate() != null && today.isBefore(habit.getStartDate())) {
            throw new NilevApiException("Cannot complete a habit before its start date", HttpStatus.BAD_REQUEST, "HABIT_NOT_STARTED");
        }
        if (habit.getEndDate() != null && today.isAfter(habit.getEndDate())) {
            throw new NilevApiException("Cannot complete an expired habit", HttpStatus.BAD_REQUEST, "HABIT_EXPIRED");
        }

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
                    3,
                    "HABIT_COMPLETED",
                    "Habit Completed",
                    "Completed \"" + habit.getName() + "\" for today (+3 XP)",
                    habit.getIcon() != null && !habit.getIcon().isBlank() ? habit.getIcon() : "✨"
            );

            if (response.getCurrentStreak() > 1 && (response.getCurrentStreak() % 3 == 0 || response.getCurrentStreak() == 7)) {
                companionService.addXp(
                        userId,
                        3,
                        "HABIT_STREAK",
                        response.getCurrentStreak() + "-Day Streak! 🔥",
                        "Maintained a " + response.getCurrentStreak() + "-day streak on \"" + habit.getName() + "\" (+3 XP Bonus)",
                        "🔥"
                );
            }

            // Notify connected partner
            partnerConnectionRepo.findActiveConnectionForUser(userId).ifPresent(conn -> {
                User partner = conn.getPartnerOf(userId);
                if (partner != null) {
                    String actorName = (user.getNickname() != null && !user.getNickname().isBlank())
                            ? user.getNickname() : user.getName();
                    notificationService.sendNotification(
                            partner,
                            user,
                            NotificationType.HABIT_COMPLETED,
                            actorName + " completed a habit! 🌱",
                            actorName + " completed \"" + habit.getName() + "\" (" + response.getCurrentStreak() + "-day streak) ✨",
                            habit.getIcon() != null && !habit.getIcon().isBlank() ? habit.getIcon() : "🌱",
                            habit.getId(),
                            "HABIT",
                            "/partner"
                    );
                }
            });
        } catch (Exception e) {
            log.warn("Failed to publish habit completion event or notification: {}", e.getMessage());
        }

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
        return toResponse(habit, null);
    }

    private HabitResponse toResponse(Habit habit, User partnerViewer) {
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
        r.setStartDate(habit.getStartDate());
        r.setEndDate(habit.getEndDate());
        r.setActive(habit.isActive());
        r.setCreatedAt(habit.getCreatedAt());
        r.setUpdatedAt(habit.getUpdatedAt());

        User owner = habit.getUser();
        String ownerNickname = (owner.getNickname() != null && !owner.getNickname().isBlank())
                ? owner.getNickname() : owner.getName();
        r.setOwnerName(owner.getName());
        r.setPartnerNickname(ownerNickname);

        if (partnerViewer != null && !owner.getId().equals(partnerViewer.getId())) {
            r.setReadOnly(true);
        } else {
            r.setReadOnly(false);
        }

        LocalDate today = LocalDate.now();
        Long habitId = habit.getId();

        // completedToday
        boolean doneToday = completionRepo.existsByHabitIdAndCompletedDate(habitId, today);
        r.setCompletedToday(doneToday);

        // dailyStatus: PENDING, COMPLETED, MISSED, EXPIRED, NOT_STARTED
        if (habit.getStartDate() != null && today.isBefore(habit.getStartDate())) {
            r.setDailyStatus("NOT_STARTED");
        } else if (habit.getEndDate() != null && today.isAfter(habit.getEndDate())) {
            r.setDailyStatus("EXPIRED");
        } else if (doneToday) {
            r.setDailyStatus("COMPLETED");
        } else {
            r.setDailyStatus("PENDING");
        }

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
