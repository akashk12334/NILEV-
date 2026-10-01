package com.nilev.habit.service;

import com.nilev.habit.dto.*;

import java.util.List;

public interface HabitService {

    HabitResponse createHabit(Long userId, CreateHabitRequest request);

    List<HabitResponse> getHabits(Long userId);

    HabitResponse getHabit(Long userId, Long habitId);

    HabitResponse updateHabit(Long userId, Long habitId, UpdateHabitRequest request);

    void deleteHabit(Long userId, Long habitId);

    HabitResponse completeHabit(Long userId, Long habitId);

    HabitResponse uncompleteHabit(Long userId, Long habitId);

    List<HabitCompletionResponse> getHistory(Long userId, Long habitId);
}
