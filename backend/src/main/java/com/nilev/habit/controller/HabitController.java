package com.nilev.habit.controller;

import com.nilev.common.ApiResponse;
import com.nilev.habit.dto.*;
import com.nilev.habit.service.HabitService;
import com.nilev.security.UserPrincipal;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Habit CRUD + completion endpoints.
 * All operations are scoped to the authenticated user.
 * Partners can GET habits but cannot POST/PUT/DELETE (enforced at service layer).
 */
@RestController
@RequestMapping({"/api/habits", "/api/v1/habits", "/habits"})
@PreAuthorize("isAuthenticated()")
public class HabitController {

    private final HabitService habitService;

    public HabitController(HabitService habitService) {
        this.habitService = habitService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<HabitResponse>> create(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CreateHabitRequest request) {
        HabitResponse response = habitService.createHabit(principal.getId(), request);
        return new ResponseEntity<>(
                ApiResponse.success("Habit created successfully", response),
                HttpStatus.CREATED
        );
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<HabitResponse>>> list(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<HabitResponse> habits = habitService.getHabits(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Habits retrieved", habits));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitResponse>> get(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        HabitResponse response = habitService.getHabit(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<HabitResponse>> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody UpdateHabitRequest request) {
        HabitResponse response = habitService.updateHabit(principal.getId(), id, request);
        return ResponseEntity.ok(ApiResponse.success("Habit updated", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        habitService.deleteHabit(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Habit deleted", null));
    }

    // ── Completion ──────────────────────────────────────────────────

    @PostMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<HabitResponse>> complete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        HabitResponse response = habitService.completeHabit(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Habit marked complete for today! 🎉", response));
    }

    @DeleteMapping("/{id}/complete")
    public ResponseEntity<ApiResponse<HabitResponse>> uncomplete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        HabitResponse response = habitService.uncompleteHabit(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Today's completion removed", response));
    }

    @GetMapping("/{id}/history")
    public ResponseEntity<ApiResponse<List<HabitCompletionResponse>>> history(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        List<HabitCompletionResponse> history = habitService.getHistory(principal.getId(), id);
        return ResponseEntity.ok(ApiResponse.success("Habit history retrieved", history));
    }
}
