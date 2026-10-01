package com.nilev.goal.repository;

import com.nilev.goal.entity.Goal;
import com.nilev.goal.entity.GoalStatus;
import com.nilev.goal.entity.GoalType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GoalRepository extends JpaRepository<Goal, Long> {

    @Query("SELECT g FROM Goal g JOIN FETCH g.owner LEFT JOIN FETCH g.partner WHERE g.id = :id")
    Optional<Goal> findByIdWithUsers(@Param("id") Long id);

    /** User's personal goals */
    @Query("SELECT g FROM Goal g JOIN FETCH g.owner " +
           "WHERE g.owner.id = :ownerId AND g.type = 'PERSONAL' " +
           "ORDER BY g.createdAt DESC")
    List<Goal> findPersonalGoals(@Param("ownerId") Long ownerId);

    /** User's personal goals by status */
    @Query("SELECT g FROM Goal g JOIN FETCH g.owner " +
           "WHERE g.owner.id = :ownerId AND g.type = 'PERSONAL' AND g.status = :status " +
           "ORDER BY g.createdAt DESC")
    List<Goal> findPersonalGoalsByStatus(@Param("ownerId") Long ownerId, @Param("status") GoalStatus status);

    /** Shared goals between two partners */
    @Query("SELECT g FROM Goal g JOIN FETCH g.owner LEFT JOIN FETCH g.partner " +
           "WHERE g.type = 'SHARED' AND " +
           "((g.owner.id = :u1 AND (g.partner IS NULL OR g.partner.id = :u2)) OR " +
           " (g.owner.id = :u2 AND (g.partner IS NULL OR g.partner.id = :u1)) OR " +
           " (g.partner.id = :u1 OR g.partner.id = :u2)) " +
           "ORDER BY g.createdAt DESC")
    List<Goal> findSharedGoals(@Param("u1") Long u1, @Param("u2") Long u2);

    /** Shared goals for single user (if not yet connected or creator only) */
    @Query("SELECT g FROM Goal g JOIN FETCH g.owner LEFT JOIN FETCH g.partner " +
           "WHERE g.type = 'SHARED' AND (g.owner.id = :userId OR (g.partner IS NOT NULL AND g.partner.id = :userId)) " +
           "ORDER BY g.createdAt DESC")
    List<Goal> findSharedGoalsForSingleUser(@Param("userId") Long userId);

    /** All completed goals (personal + shared) visible to this user */
    @Query("SELECT g FROM Goal g JOIN FETCH g.owner LEFT JOIN FETCH g.partner " +
           "WHERE g.status = 'COMPLETED' AND " +
           "((g.type = 'PERSONAL' AND g.owner.id = :u1) OR " +
           " (g.type = 'SHARED' AND (g.owner.id = :u1 OR (g.partner IS NOT NULL AND g.partner.id = :u1) " +
           "  OR (:u2 IS NOT NULL AND (g.owner.id = :u2 OR (g.partner IS NOT NULL AND g.partner.id = :u2)))))) " +
           "ORDER BY g.updatedAt DESC")
    List<Goal> findCompletedGoals(@Param("u1") Long userId, @Param("u2") Long partnerId);

    /** Partner's personal goals (read-only viewing) */
    @Query("SELECT g FROM Goal g JOIN FETCH g.owner " +
           "WHERE g.owner.id = :partnerId AND g.type = 'PERSONAL' " +
           "ORDER BY g.createdAt DESC")
    List<Goal> findPartnerPersonalGoals(@Param("partnerId") Long partnerId);

    /** Count active goals */
    long countByOwnerIdAndStatus(Long ownerId, GoalStatus status);
}
