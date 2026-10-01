package com.nilev.analytics.controller;

import com.nilev.analytics.dto.*;
import com.nilev.analytics.service.AnalyticsService;
import com.nilev.common.ApiResponse;
import com.nilev.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/api/analytics", "/api/v1/analytics", "/analytics"})
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * Comprehensive Analytics Dashboard payload.
     * Supports timeframe filters (7d, 30d, 90d) and partner view-only toggle.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsDashboardResponse>> getAnalytics(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "timeframe", defaultValue = "30d") String timeframe,
            @RequestParam(name = "partner", defaultValue = "false") boolean partner) {

        AnalyticsDashboardResponse data = analyticsService.getDashboard(principal.getId(), timeframe, partner);
        return ResponseEntity.ok(ApiResponse.success("Analytics retrieved successfully", data));
    }

    /**
     * View-only Partner Analytics endpoint.
     * Strictly restricted to the connected partner within the couple bond.
     */
    @GetMapping("/partner")
    public ResponseEntity<ApiResponse<AnalyticsDashboardResponse>> getPartnerAnalytics(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "timeframe", defaultValue = "30d") String timeframe) {

        AnalyticsDashboardResponse data = analyticsService.getDashboard(principal.getId(), timeframe, true);
        return ResponseEntity.ok(ApiResponse.success("Partner analytics retrieved successfully (view-only)", data));
    }

    /**
     * Daily Habit Completion metric.
     */
    @GetMapping("/daily-completion")
    public ResponseEntity<ApiResponse<List<DailyCompletionPoint>>> getDailyCompletions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "timeframe", defaultValue = "30d") String timeframe,
            @RequestParam(name = "partner", defaultValue = "false") boolean partner) {

        List<DailyCompletionPoint> data = analyticsService.getDailyCompletions(principal.getId(), timeframe, partner);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * Weekly Habit Completion metric with day-of-week breakdown.
     */
    @GetMapping("/weekly-completion")
    public ResponseEntity<ApiResponse<List<WeeklyCompletionPoint>>> getWeeklyCompletions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "timeframe", defaultValue = "30d") String timeframe,
            @RequestParam(name = "partner", defaultValue = "false") boolean partner) {

        List<WeeklyCompletionPoint> data = analyticsService.getWeeklyCompletions(principal.getId(), timeframe, partner);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * Monthly Habit Completion metric (multi-month trend).
     */
    @GetMapping("/monthly-completion")
    public ResponseEntity<ApiResponse<List<MonthlyCompletionPoint>>> getMonthlyCompletions(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "timeframe", defaultValue = "30d") String timeframe,
            @RequestParam(name = "partner", defaultValue = "false") boolean partner) {

        List<MonthlyCompletionPoint> data = analyticsService.getMonthlyCompletions(principal.getId(), timeframe, partner);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * Habit Consistency breakdown and category distribution.
     */
    @GetMapping("/habit-consistency")
    public ResponseEntity<ApiResponse<List<HabitConsistencyItem>>> getHabitConsistency(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "timeframe", defaultValue = "30d") String timeframe,
            @RequestParam(name = "partner", defaultValue = "false") boolean partner) {

        List<HabitConsistencyItem> data = analyticsService.getHabitConsistency(principal.getId(), timeframe, partner);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * Goal Progress Analytics (Personal & Shared goals).
     */
    @GetMapping("/goal-progress")
    public ResponseEntity<ApiResponse<GoalProgressAnalytics>> getGoalProgress(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "partner", defaultValue = "false") boolean partner) {

        GoalProgressAnalytics data = analyticsService.getGoalProgress(principal.getId(), partner);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * Streak History and Timeline Analytics.
     */
    @GetMapping("/streak-history")
    public ResponseEntity<ApiResponse<StreakHistoryAnalytics>> getStreakHistory(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "timeframe", defaultValue = "30d") String timeframe,
            @RequestParam(name = "partner", defaultValue = "false") boolean partner) {

        StreakHistoryAnalytics data = analyticsService.getStreakHistory(principal.getId(), timeframe, partner);
        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /**
     * XP Growth trajectory and companion XP curve.
     */
    @GetMapping("/xp-growth")
    public ResponseEntity<ApiResponse<XpGrowthAnalytics>> getXpGrowth(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(name = "timeframe", defaultValue = "30d") String timeframe,
            @RequestParam(name = "partner", defaultValue = "false") boolean partner) {

        XpGrowthAnalytics data = analyticsService.getXpGrowth(principal.getId(), timeframe, partner);
        return ResponseEntity.ok(ApiResponse.success(data));
    }
}
