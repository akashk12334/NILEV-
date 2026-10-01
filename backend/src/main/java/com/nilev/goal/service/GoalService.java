package com.nilev.goal.service;

import com.nilev.goal.dto.*;

import java.util.List;

public interface GoalService {

    GoalResponse createGoal(Long currentUserId, CreateGoalRequest request);

    List<GoalResponse> getPersonalGoals(Long currentUserId);

    List<GoalResponse> getSharedGoals(Long currentUserId);

    List<GoalResponse> getCompletedGoals(Long currentUserId);

    List<GoalResponse> getPartnerPersonalGoals(Long currentUserId);

    GoalResponse getGoalById(Long currentUserId, Long goalId);

    GoalResponse updateGoal(Long currentUserId, Long goalId, UpdateGoalRequest request);

    GoalResponse updateProgress(Long currentUserId, Long goalId, UpdateGoalProgressRequest request);

    void deleteGoal(Long currentUserId, Long goalId);
}
