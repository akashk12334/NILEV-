package com.nilev.analytics.service.impl;

import com.nilev.analytics.dto.*;
import com.nilev.analytics.service.AnalyticsService;
import com.nilev.companion.entity.Companion;
import com.nilev.companion.repository.CompanionRepository;
import com.nilev.exception.NilevApiException;
import com.nilev.goal.entity.Goal;
import com.nilev.goal.entity.GoalStatus;
import com.nilev.goal.repository.GoalRepository;
import com.nilev.habit.entity.Habit;
import com.nilev.habit.entity.HabitCompletion;
import com.nilev.habit.repository.HabitCompletionRepository;
import com.nilev.habit.repository.HabitRepository;
import com.nilev.partner.entity.PartnerConnection;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository userRepo;
    private final HabitRepository habitRepo;
    private final HabitCompletionRepository completionRepo;
    private final GoalRepository goalRepo;
    private final CompanionRepository companionRepo;
    private final PartnerConnectionRepository partnerConnectionRepo;

    public AnalyticsServiceImpl(UserRepository userRepo,
                                HabitRepository habitRepo,
                                HabitCompletionRepository completionRepo,
                                GoalRepository goalRepo,
                                CompanionRepository companionRepo,
                                PartnerConnectionRepository partnerConnectionRepo) {
        this.userRepo = userRepo;
        this.habitRepo = habitRepo;
        this.completionRepo = completionRepo;
        this.goalRepo = goalRepo;
        this.companionRepo = companionRepo;
        this.partnerConnectionRepo = partnerConnectionRepo;
    }

    @Override
    public AnalyticsDashboardResponse getDashboard(Long currentUserId, String timeframe, boolean isPartnerRequested) {
        ResolvedUsers resolved = resolveTargetAndPartner(currentUserId, isPartnerRequested);
        User target = resolved.targetUser;
        User partner = resolved.partnerUser;
        PartnerConnection connection = resolved.connection;

        int days = parseTimeframeDays(timeframe);
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);

        List<Habit> activeHabits = habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(target.getId());
        List<HabitCompletion> allCompletions = completionRepo.findByUserId(target.getId());

        // Completions within the window
        List<HabitCompletion> windowCompletions = allCompletions.stream()
                .filter(c -> !c.getCompletedDate().isBefore(startDate) && !c.getCompletedDate().isAfter(today))
                .collect(Collectors.toList());

        AnalyticsDashboardResponse resp = new AnalyticsDashboardResponse();
        resp.setUserId(target.getId());
        resp.setUserName(target.getName());
        resp.setUserAvatarUrl(target.getAvatarUrl());
        resp.setPartner(isPartnerRequested);
        resp.setViewOnly(isPartnerRequested);
        resp.setTimeframe(days + "d");
        resp.setActiveHabitsCount(activeHabits.size());
        resp.setTotalCompletions(windowCompletions.size());

        // 1. Daily Completions
        List<DailyCompletionPoint> dailyPoints = calculateDailyCompletions(activeHabits, windowCompletions, startDate, today);
        resp.setDailyCompletions(dailyPoints);

        // Overall consistency
        double avgRate = dailyPoints.stream().mapToDouble(DailyCompletionPoint::getCompletionRate).average().orElse(0.0);
        resp.setOverallConsistency(avgRate);

        // 2. Weekly Completions (with partner comparative rate if connected)
        List<HabitCompletion> partnerCompletions = partner != null ? completionRepo.findByUserId(partner.getId()) : Collections.emptyList();
        List<Habit> partnerHabits = partner != null ? habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(partner.getId()) : Collections.emptyList();
        List<WeeklyCompletionPoint> weeklyPoints = calculateWeeklyCompletions(activeHabits, windowCompletions, partnerHabits, partnerCompletions, startDate, today);
        resp.setWeeklyCompletions(weeklyPoints);

        // 3. Monthly Completions (last 6 months)
        List<MonthlyCompletionPoint> monthlyPoints = calculateMonthlyCompletions(activeHabits, allCompletions, today);
        resp.setMonthlyCompletions(monthlyPoints);

        // 4. Habit Consistency & Category Distribution
        List<HabitConsistencyItem> consistencyItems = calculateHabitConsistency(activeHabits, windowCompletions, days, today);
        resp.setHabitConsistency(consistencyItems);
        resp.setHabitDistribution(calculateCategoryDistribution(activeHabits, windowCompletions));

        // 5. Goal Progress
        GoalProgressAnalytics goalProgress = calculateGoalProgress(target.getId(), partner != null ? partner.getId() : null);
        resp.setGoalProgress(goalProgress);

        // 6. Streak History
        StreakHistoryAnalytics streakHistory = calculateStreakHistory(activeHabits, allCompletions, connection, days, today);
        resp.setStreakHistory(streakHistory);
        resp.setCurrentStreak(streakHistory.getCurrentStreak());
        resp.setLongestStreak(streakHistory.getLongestStreak());

        // 7. XP Growth
        XpGrowthAnalytics xpGrowth = calculateXpGrowth(target, dailyPoints);
        resp.setXpGrowth(xpGrowth);

        // 8. Partner Info
        if (connection != null && partner != null) {
            PartnerAnalyticsInfo pInfo = new PartnerAnalyticsInfo();
            pInfo.setPartnerId(partner.getId());
            pInfo.setPartnerName(partner.getName());
            pInfo.setPartnerAvatarUrl(partner.getAvatarUrl());
            pInfo.setConnected(true);
            pInfo.setRelationshipStreak(connection.getSharedStreak());
            if (connection.getConnectedAt() != null) {
                pInfo.setDaysConnected((int) Duration.between(connection.getConnectedAt(), Instant.now()).toDays());
            } else {
                pInfo.setDaysConnected(1);
            }
            resp.setPartnerInfo(pInfo);
        }

        return resp;
    }

    @Override
    public List<DailyCompletionPoint> getDailyCompletions(Long currentUserId, String timeframe, boolean isPartnerRequested) {
        ResolvedUsers resolved = resolveTargetAndPartner(currentUserId, isPartnerRequested);
        int days = parseTimeframeDays(timeframe);
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);

        List<Habit> activeHabits = habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(resolved.targetUser.getId());
        List<HabitCompletion> allCompletions = completionRepo.findByUserId(resolved.targetUser.getId());
        List<HabitCompletion> windowCompletions = allCompletions.stream()
                .filter(c -> !c.getCompletedDate().isBefore(startDate) && !c.getCompletedDate().isAfter(today))
                .collect(Collectors.toList());

        return calculateDailyCompletions(activeHabits, windowCompletions, startDate, today);
    }

    @Override
    public List<WeeklyCompletionPoint> getWeeklyCompletions(Long currentUserId, String timeframe, boolean isPartnerRequested) {
        ResolvedUsers resolved = resolveTargetAndPartner(currentUserId, isPartnerRequested);
        int days = parseTimeframeDays(timeframe);
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);

        List<Habit> targetHabits = habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(resolved.targetUser.getId());
        List<HabitCompletion> targetCompletions = completionRepo.findByUserId(resolved.targetUser.getId()).stream()
                .filter(c -> !c.getCompletedDate().isBefore(startDate) && !c.getCompletedDate().isAfter(today))
                .collect(Collectors.toList());

        List<Habit> partnerHabits = resolved.partnerUser != null ?
                habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(resolved.partnerUser.getId()) : Collections.emptyList();
        List<HabitCompletion> partnerCompletions = resolved.partnerUser != null ?
                completionRepo.findByUserId(resolved.partnerUser.getId()).stream()
                        .filter(c -> !c.getCompletedDate().isBefore(startDate) && !c.getCompletedDate().isAfter(today))
                        .collect(Collectors.toList()) : Collections.emptyList();

        return calculateWeeklyCompletions(targetHabits, targetCompletions, partnerHabits, partnerCompletions, startDate, today);
    }

    @Override
    public List<MonthlyCompletionPoint> getMonthlyCompletions(Long currentUserId, String timeframe, boolean isPartnerRequested) {
        ResolvedUsers resolved = resolveTargetAndPartner(currentUserId, isPartnerRequested);
        List<Habit> activeHabits = habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(resolved.targetUser.getId());
        List<HabitCompletion> allCompletions = completionRepo.findByUserId(resolved.targetUser.getId());
        return calculateMonthlyCompletions(activeHabits, allCompletions, LocalDate.now());
    }

    @Override
    public List<HabitConsistencyItem> getHabitConsistency(Long currentUserId, String timeframe, boolean isPartnerRequested) {
        ResolvedUsers resolved = resolveTargetAndPartner(currentUserId, isPartnerRequested);
        int days = parseTimeframeDays(timeframe);
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);

        List<Habit> activeHabits = habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(resolved.targetUser.getId());
        List<HabitCompletion> windowCompletions = completionRepo.findByUserId(resolved.targetUser.getId()).stream()
                .filter(c -> !c.getCompletedDate().isBefore(startDate) && !c.getCompletedDate().isAfter(today))
                .collect(Collectors.toList());

        return calculateHabitConsistency(activeHabits, windowCompletions, days, today);
    }

    @Override
    public GoalProgressAnalytics getGoalProgress(Long currentUserId, boolean isPartnerRequested) {
        ResolvedUsers resolved = resolveTargetAndPartner(currentUserId, isPartnerRequested);
        Long partnerId = resolved.partnerUser != null ? resolved.partnerUser.getId() : null;
        return calculateGoalProgress(resolved.targetUser.getId(), partnerId);
    }

    @Override
    public StreakHistoryAnalytics getStreakHistory(Long currentUserId, String timeframe, boolean isPartnerRequested) {
        ResolvedUsers resolved = resolveTargetAndPartner(currentUserId, isPartnerRequested);
        int days = parseTimeframeDays(timeframe);
        LocalDate today = LocalDate.now();

        List<Habit> activeHabits = habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(resolved.targetUser.getId());
        List<HabitCompletion> allCompletions = completionRepo.findByUserId(resolved.targetUser.getId());
        return calculateStreakHistory(activeHabits, allCompletions, resolved.connection, days, today);
    }

    @Override
    public XpGrowthAnalytics getXpGrowth(Long currentUserId, String timeframe, boolean isPartnerRequested) {
        ResolvedUsers resolved = resolveTargetAndPartner(currentUserId, isPartnerRequested);
        int days = parseTimeframeDays(timeframe);
        LocalDate today = LocalDate.now();
        LocalDate startDate = today.minusDays(days - 1);

        List<Habit> activeHabits = habitRepo.findByUserIdAndActiveTrueOrderByCreatedAtDesc(resolved.targetUser.getId());
        List<HabitCompletion> windowCompletions = completionRepo.findByUserId(resolved.targetUser.getId()).stream()
                .filter(c -> !c.getCompletedDate().isBefore(startDate) && !c.getCompletedDate().isAfter(today))
                .collect(Collectors.toList());

        List<DailyCompletionPoint> daily = calculateDailyCompletions(activeHabits, windowCompletions, startDate, today);
        return calculateXpGrowth(resolved.targetUser, daily);
    }

    // ── Internal Calculation Helpers ────────────────────────────────

    private List<DailyCompletionPoint> calculateDailyCompletions(List<Habit> activeHabits,
                                                                 List<HabitCompletion> completions,
                                                                 LocalDate startDate,
                                                                 LocalDate today) {
        Map<LocalDate, Long> completionsByDate = completions.stream()
                .collect(Collectors.groupingBy(HabitCompletion::getCompletedDate, Collectors.counting()));

        int totalHabits = Math.max(1, activeHabits.size());
        List<DailyCompletionPoint> result = new ArrayList<>();
        DateTimeFormatter shortFmt = DateTimeFormatter.ofPattern("MMM d");

        LocalDate cursor = startDate;
        while (!cursor.isAfter(today)) {
            int count = completionsByDate.getOrDefault(cursor, 0L).intValue();
            double rate = Math.min(100.0, (count / (double) totalHabits) * 100.0);
            int xpEarned = count * 15;
            String label = cursor.equals(today) ? "Today" : cursor.format(shortFmt);

            result.add(new DailyCompletionPoint(cursor, label, count, totalHabits, rate, xpEarned));
            cursor = cursor.plusDays(1);
        }

        return result;
    }

    private List<WeeklyCompletionPoint> calculateWeeklyCompletions(List<Habit> targetHabits,
                                                                   List<HabitCompletion> targetCompletions,
                                                                   List<Habit> partnerHabits,
                                                                   List<HabitCompletion> partnerCompletions,
                                                                   LocalDate startDate,
                                                                   LocalDate today) {
        Map<DayOfWeek, Integer> targetCompleted = new EnumMap<>(DayOfWeek.class);
        Map<DayOfWeek, Integer> targetTotalDays = new EnumMap<>(DayOfWeek.class);

        Map<DayOfWeek, Integer> partnerCompleted = new EnumMap<>(DayOfWeek.class);
        Map<DayOfWeek, Integer> partnerTotalDays = new EnumMap<>(DayOfWeek.class);

        for (DayOfWeek dow : DayOfWeek.values()) {
            targetCompleted.put(dow, 0);
            targetTotalDays.put(dow, 0);
            partnerCompleted.put(dow, 0);
            partnerTotalDays.put(dow, 0);
        }

        // Count occurrences of each day of week in the timeframe
        LocalDate cursor = startDate;
        while (!cursor.isAfter(today)) {
            DayOfWeek dow = cursor.getDayOfWeek();
            targetTotalDays.put(dow, targetTotalDays.get(dow) + 1);
            partnerTotalDays.put(dow, partnerTotalDays.get(dow) + 1);
            cursor = cursor.plusDays(1);
        }

        // Sum completions by day of week
        for (HabitCompletion c : targetCompletions) {
            DayOfWeek dow = c.getCompletedDate().getDayOfWeek();
            targetCompleted.put(dow, targetCompleted.get(dow) + 1);
        }

        for (HabitCompletion c : partnerCompletions) {
            DayOfWeek dow = c.getCompletedDate().getDayOfWeek();
            partnerCompleted.put(dow, partnerCompleted.get(dow) + 1);
        }

        int targetHabitCount = Math.max(1, targetHabits.size());
        int partnerHabitCount = Math.max(1, partnerHabits.size());

        List<WeeklyCompletionPoint> result = new ArrayList<>();
        // Mon through Sun
        DayOfWeek[] order = {
                DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                DayOfWeek.THURSDAY, DayOfWeek.FRIDAY, DayOfWeek.SATURDAY, DayOfWeek.SUNDAY
        };

        for (DayOfWeek dow : order) {
            int daysOccurred = targetTotalDays.get(dow);
            int possible = Math.max(1, daysOccurred * targetHabitCount);
            int done = targetCompleted.get(dow);
            double rate = Math.min(100.0, (done / (double) possible) * 100.0);

            Double partnerRate = null;
            if (!partnerHabits.isEmpty()) {
                int pPossible = Math.max(1, partnerTotalDays.get(dow) * partnerHabitCount);
                int pDone = partnerCompleted.get(dow);
                partnerRate = Math.min(100.0, (pDone / (double) pPossible) * 100.0);
            }

            String dowLabel = dow.getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
            result.add(new WeeklyCompletionPoint(dowLabel, done, possible, rate, partnerRate));
        }

        return result;
    }

    private List<MonthlyCompletionPoint> calculateMonthlyCompletions(List<Habit> habits,
                                                                     List<HabitCompletion> allCompletions,
                                                                     LocalDate today) {
        int habitCount = Math.max(1, habits.size());
        List<MonthlyCompletionPoint> result = new ArrayList<>();

        // Generate past 6 months
        for (int i = 5; i >= 0; i--) {
            LocalDate monthRef = today.minusMonths(i);
            int year = monthRef.getYear();
            int monthValue = monthRef.getMonthValue();
            String monthName = monthRef.getMonth().getDisplayName(TextStyle.SHORT, Locale.ENGLISH);

            LocalDate monthStart = LocalDate.of(year, monthValue, 1);
            LocalDate rawEnd = monthStart.plusMonths(1).minusDays(1);
            final LocalDate monthEnd = rawEnd.isAfter(today) ? today : rawEnd;

            int daysInPeriod = (int) (java.time.temporal.ChronoUnit.DAYS.between(monthStart, monthEnd) + 1);
            int totalExpected = daysInPeriod * habitCount;

            List<HabitCompletion> monthCompletions = allCompletions.stream()
                    .filter(c -> !c.getCompletedDate().isBefore(monthStart) && !c.getCompletedDate().isAfter(monthEnd))
                    .collect(Collectors.toList());

            int completedCount = monthCompletions.size();
            double rate = totalExpected > 0 ? Math.min(100.0, (completedCount / (double) totalExpected) * 100.0) : 0.0;

            long distinctActiveDays = monthCompletions.stream()
                    .map(HabitCompletion::getCompletedDate)
                    .distinct()
                    .count();

            result.add(new MonthlyCompletionPoint(monthName, year, completedCount, totalExpected, rate, (int) distinctActiveDays));
        }

        return result;
    }

    private List<HabitConsistencyItem> calculateHabitConsistency(List<Habit> habits,
                                                                 List<HabitCompletion> windowCompletions,
                                                                 int days,
                                                                 LocalDate today) {
        Map<Long, List<HabitCompletion>> completionsByHabit = windowCompletions.stream()
                .collect(Collectors.groupingBy(c -> c.getHabit().getId()));

        List<HabitConsistencyItem> items = new ArrayList<>();

        for (Habit h : habits) {
            List<HabitCompletion> habitCompletions = completionsByHabit.getOrDefault(h.getId(), Collections.emptyList());
            int completedCount = habitCompletions.size();
            int expectedCount = Math.max(1, days);
            double score = Math.min(100.0, (completedCount / (double) expectedCount) * 100.0);

            List<LocalDate> datesDesc = habitCompletions.stream()
                    .map(HabitCompletion::getCompletedDate)
                    .sorted(Comparator.reverseOrder())
                    .collect(Collectors.toList());

            int currentStreak = computeCurrentStreak(datesDesc, today);
            int longest = Math.max(h.getLongestStreak(), currentStreak);

            String status = score >= 80 ? "THRIVING" : (score >= 50 ? "CONSISTENT" : "NEEDS_ATTENTION");

            HabitConsistencyItem item = new HabitConsistencyItem();
            item.setHabitId(h.getId());
            item.setName(h.getName());
            item.setIcon(h.getIcon());
            item.setColor(h.getColor());
            item.setCategory(h.getCategory() != null ? h.getCategory() : "General");
            item.setFrequency(h.getFrequency() != null ? h.getFrequency().name() : "DAILY");
            item.setTimeOfDay(h.getTimeOfDay() != null ? h.getTimeOfDay().name() : "ANYTIME");
            item.setCompletionsCount(completedCount);
            item.setExpectedCount(expectedCount);
            item.setConsistencyScore(score);
            item.setCurrentStreak(currentStreak);
            item.setLongestStreak(longest);
            item.setStatus(status);

            items.add(item);
        }

        items.sort(Comparator.comparingDouble(HabitConsistencyItem::getConsistencyScore).reversed());
        return items;
    }

    private List<CategoryDistributionItem> calculateCategoryDistribution(List<Habit> habits, List<HabitCompletion> windowCompletions) {
        Map<String, List<Habit>> habitsByCategory = habits.stream()
                .collect(Collectors.groupingBy(h -> h.getCategory() != null ? h.getCategory() : "General"));

        Map<Long, Long> completionsByHabit = windowCompletions.stream()
                .collect(Collectors.groupingBy(c -> c.getHabit().getId(), Collectors.counting()));

        int totalCompletions = Math.max(1, windowCompletions.size());
        List<CategoryDistributionItem> result = new ArrayList<>();

        Map<String, String> defaultColors = Map.of(
                "Mindfulness", "#8B5CF6",
                "Fitness", "#10B981",
                "Health", "#06B6D4",
                "Knowledge", "#F59E0B",
                "Connection", "#EC4899",
                "General", "#6366F1"
        );

        for (Map.Entry<String, List<Habit>> entry : habitsByCategory.entrySet()) {
            String cat = entry.getKey();
            List<Habit> catHabits = entry.getValue();
            int habitCount = catHabits.size();

            int catCompletions = catHabits.stream()
                    .mapToInt(h -> completionsByHabit.getOrDefault(h.getId(), 0L).intValue())
                    .sum();

            double pct = (catCompletions / (double) totalCompletions) * 100.0;
            String color = catHabits.get(0).getColor();
            if (color == null || color.isBlank() || color.equals("#8B5CF6")) {
                color = defaultColors.getOrDefault(cat, "#8B5CF6");
            }

            result.add(new CategoryDistributionItem(cat, habitCount, catCompletions, pct, color));
        }

        result.sort(Comparator.comparingInt(CategoryDistributionItem::getCompletions).reversed());
        return result;
    }

    private GoalProgressAnalytics calculateGoalProgress(Long targetUserId, Long partnerId) {
        List<Goal> personal = goalRepo.findPersonalGoals(targetUserId);
        List<Goal> shared = partnerId != null ?
                goalRepo.findSharedGoals(targetUserId, partnerId) :
                goalRepo.findSharedGoalsForSingleUser(targetUserId);

        List<Goal> allGoals = new ArrayList<>();
        allGoals.addAll(personal);
        allGoals.addAll(shared);

        int total = allGoals.size();
        int active = (int) allGoals.stream().filter(g -> g.getStatus() == GoalStatus.ACTIVE).count();
        int completed = (int) allGoals.stream().filter(g -> g.getStatus() == GoalStatus.COMPLETED).count();

        double avgProgress = allGoals.isEmpty() ? 0.0 :
                allGoals.stream().mapToDouble(Goal::getPercentage).average().orElse(0.0);

        int milestones = (int) allGoals.stream().filter(g -> g.getPercentage() >= 25.0).count();

        List<GoalProgressAnalytics.GoalSummaryItem> items = allGoals.stream().map(g -> {
            GoalProgressAnalytics.GoalSummaryItem item = new GoalProgressAnalytics.GoalSummaryItem();
            item.setId(g.getId());
            item.setTitle(g.getTitle());
            item.setCategory(g.getCategory());
            item.setType(g.getType().name());
            item.setCurrentValue(g.getCurrentValue());
            item.setTargetValue(g.getTargetValue());
            item.setUnit(g.getUnit());
            item.setProgressPercentage(g.getPercentage());
            item.setTargetDate(g.getTargetDate());
            item.setStatus(g.getStatus().name());
            item.setShared(g.getType().name().equals("SHARED"));
            return item;
        }).sorted(Comparator.comparingDouble(GoalProgressAnalytics.GoalSummaryItem::getProgressPercentage).reversed())
          .collect(Collectors.toList());

        GoalProgressAnalytics res = new GoalProgressAnalytics();
        res.setTotalGoals(total);
        res.setActiveGoals(active);
        res.setCompletedGoals(completed);
        res.setPersonalGoals(personal.size());
        res.setSharedGoals(shared.size());
        res.setOverallProgress(avgProgress);
        res.setMilestonesReached(milestones);
        res.setGoals(items);

        return res;
    }

    private StreakHistoryAnalytics calculateStreakHistory(List<Habit> habits,
                                                          List<HabitCompletion> allCompletions,
                                                          PartnerConnection connection,
                                                          int days,
                                                          LocalDate today) {
        Set<LocalDate> completedDates = allCompletions.stream()
                .map(HabitCompletion::getCompletedDate)
                .collect(Collectors.toSet());

        // Count all-time peak streak and current streak
        List<LocalDate> sortedDatesDesc = completedDates.stream()
                .sorted(Comparator.reverseOrder())
                .collect(Collectors.toList());

        int currentStreak = computeCurrentStreak(sortedDatesDesc, today);

        // Longest habit streak or active days streak
        int longestStreak = habits.stream()
                .mapToInt(Habit::getLongestStreak)
                .max()
                .orElse(currentStreak);
        longestStreak = Math.max(longestStreak, currentStreak);

        int partnerSharedStreak = connection != null ? connection.getSharedStreak() : currentStreak;

        LocalDate startDate = today.minusDays(days - 1);
        Map<LocalDate, Long> completionsByDate = allCompletions.stream()
                .filter(c -> !c.getCompletedDate().isBefore(startDate) && !c.getCompletedDate().isAfter(today))
                .collect(Collectors.groupingBy(HabitCompletion::getCompletedDate, Collectors.counting()));

        int totalHabits = Math.max(1, habits.size());
        List<StreakHistoryAnalytics.StreakDayPoint> timeline = new ArrayList<>();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM d");

        int rollingStreak = 0;
        int activeDaysCount = 0;

        // Iterate forward from startDate to today
        LocalDate cursor = startDate;
        while (!cursor.isAfter(today)) {
            int count = completionsByDate.getOrDefault(cursor, 0L).intValue();
            boolean completedAll = count >= totalHabits;
            if (count > 0) {
                rollingStreak++;
                activeDaysCount++;
            } else {
                rollingStreak = 0;
            }

            String label = cursor.equals(today) ? "Today" : cursor.format(fmt);
            timeline.add(new StreakHistoryAnalytics.StreakDayPoint(cursor, label, rollingStreak, completedAll, count));
            cursor = cursor.plusDays(1);
        }

        double consistencyRate = (activeDaysCount / (double) days) * 100.0;

        StreakHistoryAnalytics result = new StreakHistoryAnalytics();
        result.setCurrentStreak(currentStreak);
        result.setLongestStreak(longestStreak);
        result.setPartnerSharedStreak(partnerSharedStreak);
        result.setConsistencyRate(consistencyRate);
        result.setTotalStreakDays(activeDaysCount);
        result.setStreakTimeline(timeline);

        return result;
    }

    private XpGrowthAnalytics calculateXpGrowth(User targetUser, List<DailyCompletionPoint> dailyPoints) {
        Optional<Companion> companionOpt = companionRepo.findByUserId(targetUser.getId());

        int currentTotalXp = companionOpt.map(Companion::getXp).orElse(targetUser.getXp());
        int currentLevel = companionOpt.map(Companion::getLevel).orElse(targetUser.getLevel());
        String companionName = companionOpt.map(Companion::getName).orElse(targetUser.getCompanionName());
        String companionType = companionOpt.map(c -> c.getAnimalType().name()).orElse(targetUser.getCompanionType());
        String companionMood = companionOpt.map(c -> c.getMood().name()).orElse(targetUser.getCompanionMood());

        // Level threshold: Level 1 = 100, Level 2 = 250, Level 3 = 500, etc.
        int nextLevelXp = (currentLevel + 1) * 200;
        double progressPct = Math.min(100.0, (currentTotalXp / (double) nextLevelXp) * 100.0);

        // Calculate XP curve backward from today to start of window
        // dailyPoints is in chronological order (oldest to newest)
        List<XpGrowthAnalytics.XpGrowthPoint> timeline = new ArrayList<>();

        int totalXpGainedInWindow = dailyPoints.stream().mapToInt(DailyCompletionPoint::getXpEarned).sum();
        int baseStartingXp = Math.max(0, currentTotalXp - totalXpGainedInWindow);

        int runningXp = baseStartingXp;
        for (DailyCompletionPoint pt : dailyPoints) {
            runningXp += pt.getXpEarned();
            timeline.add(new XpGrowthAnalytics.XpGrowthPoint(pt.getDate(), pt.getLabel(), pt.getXpEarned(), runningXp));
        }

        XpGrowthAnalytics res = new XpGrowthAnalytics();
        res.setCurrentTotalXp(currentTotalXp);
        res.setCurrentLevel(currentLevel);
        res.setNextLevelXp(nextLevelXp);
        res.setProgressPercent(progressPct);
        res.setCompanionName(companionName);
        res.setCompanionType(companionType);
        res.setCompanionMood(companionMood);
        res.setTimeline(timeline);

        return res;
    }

    private int computeCurrentStreak(List<LocalDate> sortedDatesDesc, LocalDate today) {
        if (sortedDatesDesc.isEmpty()) return 0;

        LocalDate cursor = today;
        if (!sortedDatesDesc.contains(today)) {
            if (!sortedDatesDesc.contains(today.minusDays(1))) {
                return 0; // Broken streak
            }
            cursor = today.minusDays(1);
        }

        int streak = 0;
        while (sortedDatesDesc.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }

        return streak;
    }

    private int parseTimeframeDays(String timeframe) {
        if (timeframe == null || timeframe.isBlank()) return 30;
        String clean = timeframe.trim().toLowerCase().replace("d", "");
        try {
            int d = Integer.parseInt(clean);
            return (d == 7 || d == 30 || d == 90) ? d : 30;
        } catch (NumberFormatException e) {
            return 30;
        }
    }

    private ResolvedUsers resolveTargetAndPartner(Long currentUserId, boolean isPartnerRequested) {
        User currentUser = userRepo.findById(currentUserId)
                .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));

        Optional<PartnerConnection> connOpt = partnerConnectionRepo.findActiveConnectionForUser(currentUserId);

        if (isPartnerRequested) {
            if (connOpt.isEmpty()) {
                throw new NilevApiException("You do not have an active partner connection.", HttpStatus.NOT_FOUND, "PARTNER_NOT_FOUND");
            }
            PartnerConnection conn = connOpt.get();
            User partner = conn.getPartnerOf(currentUserId);
            if (partner == null) {
                throw new NilevApiException("Partner record not found.", HttpStatus.NOT_FOUND, "PARTNER_NOT_FOUND");
            }
            return new ResolvedUsers(partner, currentUser, conn);
        } else {
            User partner = connOpt.map(c -> c.getPartnerOf(currentUserId)).orElse(null);
            return new ResolvedUsers(currentUser, partner, connOpt.orElse(null));
        }
    }

    private static class ResolvedUsers {
        final User targetUser;
        final User partnerUser;
        final PartnerConnection connection;

        ResolvedUsers(User targetUser, User partnerUser, PartnerConnection connection) {
            this.targetUser = targetUser;
            this.partnerUser = partnerUser;
            this.connection = connection;
        }
    }
}
