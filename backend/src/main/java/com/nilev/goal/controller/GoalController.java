package com.nilev.goal.controller;

import com.nilev.common.ApiResponse;
import com.nilev.goal.dto.*;
import com.nilev.goal.service.GoalService;
import com.nilev.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller for personal targets and couple shared milestones.
 */
@RestController
@RequestMapping({"/api/goals", "/api/v1/goals", "/goals"})
@PreAuthorize("isAuthenticated()")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateGoalRequest request) {
        GoalResponse response = goalService.createGoal(principal.getId(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Goal created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getGoals(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false, defaultValue = "MY") String tab) {
        List<GoalResponse> list;
        switch (tab.toUpperCase()) {
            case "SHARED" -> list = goalService.getSharedGoals(principal.getId());
            case "COMPLETED" -> list = goalService.getCompletedGoals(principal.getId());
            case "PARTNER" -> list = goalService.getPartnerPersonalGoals(principal.getId());
            case "ALL" -> {
                List<GoalResponse> my = goalService.getPersonalGoals(principal.getId());
                List<GoalResponse> sh = goalService.getSharedGoals(principal.getId());
                my.addAll(sh);
                list = my;
            }
            default -> list = goalService.getPersonalGoals(principal.getId());
        }
        return ResponseEntity.ok(ApiResponse.success("Goals retrieved successfully", list));
    }

    @GetMapping("/personal")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getPersonalGoals(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<GoalResponse> list = goalService.getPersonalGoals(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Personal goals retrieved", list));
    }

    @GetMapping("/shared")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getSharedGoals(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<GoalResponse> list = goalService.getSharedGoals(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Shared goals retrieved", list));
    }

    @GetMapping("/completed")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getCompletedGoals(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<GoalResponse> list = goalService.getCompletedGoals(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Completed goals retrieved", list));
    }

    @GetMapping("/partner")
    public ResponseEntity<ApiResponse<List<GoalResponse>>> getPartnerGoals(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<GoalResponse> list = goalService.getPartnerPersonalGoals(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Partner goals retrieved", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> getGoalById(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        GoalResponse response = goalService.getGoalById(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Goal details retrieved", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<GoalResponse>> updateGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateGoalRequest request) {
        GoalResponse response = goalService.updateGoal(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Goal updated successfully", response));
    }

    @RequestMapping(value = "/{id}/progress", method = {RequestMethod.PATCH, RequestMethod.POST})
    public ResponseEntity<ApiResponse<GoalResponse>> updateProgress(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @RequestBody UpdateGoalProgressRequest request) {
        GoalResponse response = goalService.updateProgress(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Goal progress recorded", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteGoal(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        goalService.deleteGoal(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Goal deleted successfully", null));
    }
}
