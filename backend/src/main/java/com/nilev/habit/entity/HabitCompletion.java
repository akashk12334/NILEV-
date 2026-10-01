package com.nilev.habit.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDate;

/**
 * Records one completion of a habit on a specific calendar date.
 * One record per (habit, date) is enforced by the unique constraint.
 */
@Entity
@Table(
    name = "habit_completions",
    uniqueConstraints = @UniqueConstraint(
        name = "uq_habit_completion_date",
        columnNames = {"habit_id", "completed_date"}
    )
)
public class HabitCompletion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "habit_id", nullable = false)
    private Habit habit;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** The calendar date (in user's local date, stored as ISO date). */
    @Column(name = "completed_date", nullable = false)
    private LocalDate completedDate;

    public HabitCompletion() {}

    public HabitCompletion(Habit habit, User user, LocalDate completedDate) {
        this.habit = habit;
        this.user = user;
        this.completedDate = completedDate;
    }

    public Habit getHabit() { return habit; }
    public void setHabit(Habit habit) { this.habit = habit; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public LocalDate getCompletedDate() { return completedDate; }
    public void setCompletedDate(LocalDate completedDate) { this.completedDate = completedDate; }
}
