package com.nilev.goal.service.impl;

import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.service.ActivityService;
import com.nilev.exception.NilevApiException;
import com.nilev.goal.dto.*;
import com.nilev.goal.entity.Goal;
import com.nilev.goal.entity.GoalStatus;
import com.nilev.goal.entity.GoalType;
import com.nilev.goal.repository.GoalRepository;
import com.nilev.goal.service.GoalService;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class GoalServiceImpl implements GoalService {

    private static final Logger log = LoggerFactory.getLogger(GoalServiceImpl.class);

    private final GoalRepository goalRepo;
    private final UserRepository userRepo;
    private final PartnerConnectionRepository partnerConnectionRepo;
    private final ActivityService activityService;
    private final com.nilev.companion.service.CompanionService companionService;

    public GoalServiceImpl(GoalRepository goalRepo,
                           UserRepository userRepo,
                           PartnerConnectionRepository partnerConnectionRepo,
                           ActivityService activityService,
                           com.nilev.companion.service.CompanionService companionService) {
        this.goalRepo = goalRepo;
        this.userRepo = userRepo;
        this.partnerConnectionRepo = partnerConnectionRepo;
        this.activityService = activityService;
        this.companionService = companionService;
    }

    @Override
    public GoalResponse createGoal(Long currentUserId, CreateGoalRequest request) {
        User currentUser = userRepo.findById(currentUserId)
                .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));

        User partnerUser = null;
        Long partnerId = resolvePartnerId(currentUserId);
        if (partnerId != null) {
            partnerUser = userRepo.findById(partnerId).orElse(null);
        }

        // If goal is SHARED, partner is linked
        if (request.getType() == GoalType.SHARED && partnerUser == null) {
            log.info("Creating shared goal for user {} without connected partner yet", currentUserId);
        }

        Goal goal = Goal.builder()
                .owner(currentUser)
                .partner(request.getType() == GoalType.SHARED ? partnerUser : null)
                .title(request.getTitle().trim())
                .description(request.getDescription())
                .category(request.getCategory() != null ? request.getCategory() : "GENERAL")
                .type(request.getType())
                .targetValue(request.getTargetValue())
                .currentValue(request.getCurrentValue() != null ? request.getCurrentValue() : 0.0)
                .unit(request.getUnit() != null ? request.getUnit() : "%")
                .startDate(request.getStartDate())
                .targetDate(request.getTargetDate())
                .status(GoalStatus.ACTIVE)
                .isImportant(request.isImportant())
                .icon(request.getIcon() != null ? request.getIcon() : "🎯")
                .color(request.getColor() != null ? request.getColor() : "#8B5CF6")
                .build();

        // Check if initial progress already hits a milestone
        checkAndEmitMilestones(goal, 0.0, goal.getPercentage(), currentUserId);

        goalRepo.save(goal);
        return GoalResponse.fromEntity(goal, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getPersonalGoals(Long currentUserId) {
        return goalRepo.findPersonalGoals(currentUserId).stream()
                .map(g -> GoalResponse.fromEntity(g, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getSharedGoals(Long currentUserId) {
        Long partnerId = resolvePartnerId(currentUserId);
        List<Goal> goals = (partnerId != null)
                ? goalRepo.findSharedGoals(currentUserId, partnerId)
                : goalRepo.findSharedGoalsForSingleUser(currentUserId);

        return goals.stream()
                .map(g -> GoalResponse.fromEntity(g, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getCompletedGoals(Long currentUserId) {
        Long partnerId = resolvePartnerId(currentUserId);
        return goalRepo.findCompletedGoals(currentUserId, partnerId).stream()
                .map(g -> GoalResponse.fromEntity(g, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<GoalResponse> getPartnerPersonalGoals(Long currentUserId) {
        Long partnerId = resolvePartnerId(currentUserId);
        if (partnerId == null) {
            return List.of();
        }
        return goalRepo.findPartnerPersonalGoals(partnerId).stream()
                .map(g -> GoalResponse.fromEntity(g, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public GoalResponse getGoalById(Long currentUserId, Long goalId) {
        Goal goal = requireAccessibleGoal(currentUserId, goalId);
        return GoalResponse.fromEntity(goal, currentUserId);
    }

    @Override
    public GoalResponse updateGoal(Long currentUserId, Long goalId, UpdateGoalRequest request) {
        Goal goal = requireModifiableGoal(currentUserId, goalId);

        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            goal.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            goal.setDescription(request.getDescription());
        }
        if (request.getCategory() != null) {
            goal.setCategory(request.getCategory());
        }
        if (request.getTargetValue() != null && request.getTargetValue() > 0) {
            goal.setTargetValue(request.getTargetValue());
        }
        if (request.getCurrentValue() != null) {
            double oldPct = goal.getPercentage();
            goal.setCurrentValue(request.getCurrentValue());
            double newPct = goal.getPercentage();
            checkAndEmitMilestones(goal, oldPct, newPct, currentUserId);
        }
        if (request.getUnit() != null) {
            goal.setUnit(request.getUnit());
        }
        if (request.getStartDate() != null) {
            goal.setStartDate(request.getStartDate());
        }
        if (request.getTargetDate() != null) {
            goal.setTargetDate(request.getTargetDate());
        }
        if (request.getStatus() != null) {
            goal.setStatus(request.getStatus());
        }
        if (request.getIsImportant() != null) {
            goal.setImportant(request.getIsImportant());
        }
        if (request.getIcon() != null) {
            goal.setIcon(request.getIcon());
        }
        if (request.getColor() != null) {
            goal.setColor(request.getColor());
        }

        goalRepo.save(goal);
        return GoalResponse.fromEntity(goal, currentUserId);
    }

    @Override
    public GoalResponse updateProgress(Long currentUserId, Long goalId, UpdateGoalProgressRequest request) {
        Goal goal = requireContributableGoal(currentUserId, goalId);

        double oldPct = goal.getPercentage();
        double newValue;

        if (request.getIncrement() != null) {
            newValue = goal.getCurrentValue() + request.getIncrement();
        } else if (request.getCurrentValue() != null) {
            newValue = request.getCurrentValue();
        } else {
            throw new NilevApiException("Either currentValue or increment must be provided", HttpStatus.BAD_REQUEST);
        }

        goal.setCurrentValue(Math.max(0.0, newValue));
        double newPct = goal.getPercentage();

        // Check milestones
        checkAndEmitMilestones(goal, oldPct, newPct, currentUserId);

        goalRepo.save(goal);
        return GoalResponse.fromEntity(goal, currentUserId);
    }

    @Override
    public void deleteGoal(Long currentUserId, Long goalId) {
        Goal goal = requireModifiableGoal(currentUserId, goalId);
        goalRepo.delete(goal);
    }

    // ── Milestone Event Logic ────────────────────────────────────────

    private void checkAndEmitMilestones(Goal goal, double oldPct, double newPct, Long currentUserId) {
        // Milestone thresholds
        int[] milestones = {25, 50, 75, 100};

        for (int m : milestones) {
            if (newPct >= m && goal.getLastMilestone() < m) {
                goal.setLastMilestone(m);

                if (m == 100) {
                    goal.setStatus(GoalStatus.COMPLETED);
                    publishGoalCompletedEvent(goal, currentUserId);
                } else {
                    publishGoalProgressEvent(goal, m, currentUserId);
                }
            }
        }
    }

    private void publishGoalProgressEvent(Goal goal, int milestone, Long actorId) {
        try {
            String title = (goal.getType() == GoalType.SHARED ? "Shared Goal: " : "Goal Milestone: ")
                    + milestone + "% Reached! 🎯";
            String description = String.format("Reached %d%% on \"%s\" (%.1f / %.1f %s)",
                    milestone,
                    goal.getTitle(),
                    goal.getCurrentValue(),
                    goal.getTargetValue(),
                    goal.getUnit());
            String metadata = String.format(
                    "{\"goalId\":%d,\"goalTitle\":\"%s\",\"type\":\"%s\",\"progress\":%d,\"current\":%.1f,\"target\":%.1f,\"unit\":\"%s\"}",
                    goal.getId(),
                    goal.getTitle().replace("\"", "\\\""),
                    goal.getType().name(),
                    milestone,
                    goal.getCurrentValue(),
                    goal.getTargetValue(),
                    goal.getUnit()
            );

            activityService.publish(
                    actorId,
                    ActivityType.GOAL_PROGRESS,
                    goal.getId(),
                    title,
                    description,
                    goal.getIcon() != null ? goal.getIcon() : "🎯",
                    metadata
            );

            // Award companion XP for reaching goal milestone
            companionService.addXp(
                    actorId,
                    50,
                    "GOAL_MILESTONE",
                    milestone + "% Goal Milestone 🎯",
                    "Progressed \"" + goal.getTitle() + "\" to " + milestone + "% (+50 XP)",
                    goal.getIcon() != null ? goal.getIcon() : "🎯"
            );
        } catch (Exception e) {
            log.warn("Failed to publish goal progress event: {}", e.getMessage());
        }
    }

    private void publishGoalCompletedEvent(Goal goal, Long actorId) {
        try {
            String title = (goal.getType() == GoalType.SHARED ? "Shared Goal Completed! 🎉" : "Goal Completed! 🏅");
            String description = String.format("Accomplished 100%% of \"%s\" (%.1f %s)",
                    goal.getTitle(),
                    goal.getTargetValue(),
                    goal.getUnit());
            String metadata = String.format(
                    "{\"goalId\":%d,\"goalTitle\":\"%s\",\"type\":\"%s\",\"progress\":100,\"current\":%.1f,\"target\":%.1f,\"unit\":\"%s\",\"completed\":true}",
                    goal.getId(),
                    goal.getTitle().replace("\"", "\\\""),
                    goal.getType().name(),
                    goal.getTargetValue(),
                    goal.getTargetValue(),
                    goal.getUnit()
            );

            activityService.publish(
                    actorId,
                    ActivityType.GOAL_COMPLETED,
                    goal.getId(),
                    title,
                    description,
                    "🏅",
                    metadata
            );

            // Award companion XP for completing goal
            companionService.addXp(
                    actorId,
                    150,
                    "GOAL_COMPLETED",
                    "Goal Accomplished! 🏆",
                    "Achieved 100% on \"" + goal.getTitle() + "\" (+150 XP Bonus)",
                    "🏅"
            );
        } catch (Exception e) {
            log.warn("Failed to publish goal completed event: {}", e.getMessage());
        }
    }

    // ── Authorization & Access Helpers ───────────────────────────────

    /**
     * Accessible for reading: Owner, partner on shared goals, or partner on personal goals (read-only).
     */
    private Goal requireAccessibleGoal(Long currentUserId, Long goalId) {
        Goal goal = goalRepo.findByIdWithUsers(goalId)
                .orElseThrow(() -> new NilevApiException("Goal not found", HttpStatus.NOT_FOUND));

        Long ownerId = goal.getOwner().getId();
        if (ownerId.equals(currentUserId)) {
            return goal;
        }

        Long partnerId = resolvePartnerId(currentUserId);
        boolean isConnectedPartner = partnerId != null &&
                (partnerId.equals(ownerId) || (goal.getPartner() != null && goal.getPartner().getId().equals(currentUserId)));

        if (isConnectedPartner) {
            return goal;
        }

        throw new NilevApiException("Access denied to this goal", HttpStatus.FORBIDDEN);
    }

    /**
     * Contributable: Owner can contribute to any of their goals.
     * Partner can contribute ONLY to SHARED goals.
     * Core Rule: "Do not allow one user to modify the other's personal goals."
     */
    private Goal requireContributableGoal(Long currentUserId, Long goalId) {
        Goal goal = goalRepo.findByIdWithUsers(goalId)
                .orElseThrow(() -> new NilevApiException("Goal not found", HttpStatus.NOT_FOUND));

        Long ownerId = goal.getOwner().getId();
        if (ownerId.equals(currentUserId)) {
            return goal;
        }

        if (goal.getType() == GoalType.SHARED) {
            Long partnerId = resolvePartnerId(currentUserId);
            if (partnerId != null && (partnerId.equals(ownerId) || (goal.getPartner() != null && goal.getPartner().getId().equals(currentUserId)))) {
                return goal;
            }
        }

        throw new NilevApiException("You cannot contribute to another user's personal goal", HttpStatus.FORBIDDEN);
    }

    /**
     * Modifiable / Deletable:
     * Personal goal: strictly owner only.
     * Shared goal: owner or connected partner.
     */
    private Goal requireModifiableGoal(Long currentUserId, Long goalId) {
        Goal goal = goalRepo.findByIdWithUsers(goalId)
                .orElseThrow(() -> new NilevApiException("Goal not found", HttpStatus.NOT_FOUND));

        Long ownerId = goal.getOwner().getId();
        if (ownerId.equals(currentUserId)) {
            return goal;
        }

        if (goal.getType() == GoalType.SHARED) {
            Long partnerId = resolvePartnerId(currentUserId);
            if (partnerId != null && (partnerId.equals(ownerId) || (goal.getPartner() != null && goal.getPartner().getId().equals(currentUserId)))) {
                return goal;
            }
        }

        throw new NilevApiException("You do not have permission to modify this goal", HttpStatus.FORBIDDEN);
    }

    private Long resolvePartnerId(Long userId) {
        return partnerConnectionRepo.findActiveConnectionForUser(userId)
                .map(conn -> {
                    Long u1 = conn.getUser1().getId();
                    Long u2 = conn.getUser2().getId();
                    return userId.equals(u1) ? u2 : u1;
                })
                .orElse(null);
    }
}
