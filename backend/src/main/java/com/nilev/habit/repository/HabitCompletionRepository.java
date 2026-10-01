package com.nilev.habit.repository;

import com.nilev.habit.entity.HabitCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface HabitCompletionRepository extends JpaRepository<HabitCompletion, Long> {

    Optional<HabitCompletion> findByHabitIdAndCompletedDate(Long habitId, LocalDate date);

    boolean existsByHabitIdAndCompletedDate(Long habitId, LocalDate date);

    List<HabitCompletion> findByHabitIdOrderByCompletedDateDesc(Long habitId);

    /** All completions for a habit within a date range, ascending. */
    @Query("SELECT c FROM HabitCompletion c WHERE c.habit.id = :habitId AND c.completedDate >= :from AND c.completedDate <= :to ORDER BY c.completedDate ASC")
    List<HabitCompletion> findByHabitIdAndDateRange(
            @Param("habitId") Long habitId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /** Count completions within a date window. */
    @Query("SELECT COUNT(c) FROM HabitCompletion c WHERE c.habit.id = :habitId AND c.completedDate >= :from AND c.completedDate <= :to")
    long countByHabitIdAndDateRange(
            @Param("habitId") Long habitId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to
    );

    /** All completions for all habits owned by a user, most recent first. */
    @Query("SELECT c FROM HabitCompletion c JOIN c.habit h WHERE h.user.id = :userId ORDER BY c.completedDate DESC")
    List<HabitCompletion> findByUserId(@Param("userId") Long userId);

    /** Distinct dates a habit was completed in descending order. */
    @Query("SELECT c.completedDate FROM HabitCompletion c WHERE c.habit.id = :habitId ORDER BY c.completedDate DESC")
    List<LocalDate> findCompletedDatesByHabitId(@Param("habitId") Long habitId);
}
