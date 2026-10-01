package com.nilev.habit.repository;

import com.nilev.habit.entity.Habit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HabitRepository extends JpaRepository<Habit, Long> {

    List<Habit> findByUserIdAndActiveTrueOrderByCreatedAtDesc(Long userId);

    Optional<Habit> findByIdAndUserId(Long id, Long userId);

    boolean existsByIdAndUserId(Long id, Long userId);

    /** Fetch all active habits for a user, loading the user eagerly. */
    @Query("SELECT h FROM Habit h JOIN FETCH h.user WHERE h.user.id = :userId AND h.active = true ORDER BY h.createdAt DESC")
    List<Habit> findActiveByUserIdWithUser(@Param("userId") Long userId);
}
