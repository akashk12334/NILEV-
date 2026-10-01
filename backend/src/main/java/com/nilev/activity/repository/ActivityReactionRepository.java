package com.nilev.activity.repository;

import com.nilev.activity.entity.ActivityReaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ActivityReactionRepository extends JpaRepository<ActivityReaction, Long> {

    Optional<ActivityReaction> findByActivityIdAndUserIdAndEmoji(Long activityId, Long userId, String emoji);

    boolean existsByActivityIdAndUserIdAndEmoji(Long activityId, Long userId, String emoji);

    List<ActivityReaction> findByActivityId(Long activityId);

    /** Count each emoji for a given activity. */
    @Query("SELECT r.emoji, COUNT(r) FROM ActivityReaction r WHERE r.activity.id = :activityId GROUP BY r.emoji")
    List<Object[]> countByEmojiForActivity(@Param("activityId") Long activityId);

    void deleteByActivityIdAndUserIdAndEmoji(Long activityId, Long userId, String emoji);
}
