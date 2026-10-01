package com.nilev.activity.controller;

import com.nilev.activity.dto.ActivityResponse;
import com.nilev.activity.dto.ReactionResponse;
import com.nilev.activity.service.ActivityService;
import com.nilev.common.ApiResponse;
import com.nilev.security.UserPrincipal;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Activity feed endpoints.
 *
 * GET  /api/activity          - combined feed (you + partner)
 * GET  /api/activity/me       - your own activity only
 * GET  /api/activity/partner  - partner's activity only (requires active connection)
 * POST /api/activity/{id}/react/{emoji} - toggle a reaction
 */
@RestController
@RequestMapping({"/api/activity", "/api/v1/activity", "/activity"})
@PreAuthorize("isAuthenticated()")
public class ActivityController {

    private static final int DEFAULT_LIMIT = 50;

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getCombinedFeed(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "50") int limit) {
        List<ActivityResponse> feed = activityService.getCombinedFeed(principal.getId(), Math.min(limit, 100));
        return ResponseEntity.ok(ApiResponse.success("Combined activity feed retrieved", feed));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getMyFeed(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "50") int limit) {
        List<ActivityResponse> feed = activityService.getMyFeed(principal.getId(), Math.min(limit, 100));
        return ResponseEntity.ok(ApiResponse.success("Your activity feed retrieved", feed));
    }

    @GetMapping("/partner")
    public ResponseEntity<ApiResponse<List<ActivityResponse>>> getPartnerFeed(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(defaultValue = "50") int limit) {
        List<ActivityResponse> feed = activityService.getPartnerFeed(principal.getId(), Math.min(limit, 100));
        return ResponseEntity.ok(ApiResponse.success("Partner activity feed retrieved", feed));
    }

    @PostMapping("/{id}/react/{emoji}")
    public ResponseEntity<ApiResponse<ReactionResponse>> react(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @PathVariable String emoji) {
        ReactionResponse response = activityService.toggleReaction(principal.getId(), id, emoji);
        String msg = response.isAdded() ? "Reaction added" : "Reaction removed";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }

    @PostMapping("/{id}/react")
    public ResponseEntity<ApiResponse<ReactionResponse>> reactWithBody(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody java.util.Map<String, String> body) {
        String emoji = body != null ? body.get("emoji") : null;
        ReactionResponse response = activityService.toggleReaction(principal.getId(), id, emoji);
        String msg = response.isAdded() ? "Reaction added" : "Reaction removed";
        return ResponseEntity.ok(ApiResponse.success(msg, response));
    }
}
