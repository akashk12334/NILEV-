package com.nilev.activity.repository;

import com.nilev.activity.entity.Activity;
import com.nilev.activity.entity.ActivityType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {

    /** Combined feed: activities by actor1 OR actor2, newest first. */
    @Query("SELECT a FROM Activity a JOIN FETCH a.actor " +
           "WHERE a.actor.id = :u1 OR a.actor.id = :u2 " +
           "ORDER BY a.createdAt DESC")
    List<Activity> findCombinedFeed(@Param("u1") Long userId1,
                                    @Param("u2") Long userId2,
                                    Pageable pageable);

    /** My own activity, newest first. */
    @Query("SELECT a FROM Activity a JOIN FETCH a.actor " +
           "WHERE a.actor.id = :userId " +
           "ORDER BY a.createdAt DESC")
    List<Activity> findByActorId(@Param("userId") Long userId, Pageable pageable);

    /** Filter by actor and type. */
    @Query("SELECT a FROM Activity a JOIN FETCH a.actor " +
           "WHERE (a.actor.id = :u1 OR a.actor.id = :u2) AND a.type = :type " +
           "ORDER BY a.createdAt DESC")
    List<Activity> findCombinedFeedByType(@Param("u1") Long userId1,
                                          @Param("u2") Long userId2,
                                          @Param("type") ActivityType type,
                                          Pageable pageable);

    /** Check duplicate: same actor + type + referenceId on same day (prevent spam). */
    @Query("SELECT COUNT(a) > 0 FROM Activity a " +
           "WHERE a.actor.id = :actorId AND a.type = :type AND a.referenceId = :refId " +
           "AND FUNCTION('DATE', a.createdAt) = FUNCTION('DATE', CURRENT_TIMESTAMP)")
    boolean existsTodayByActorAndTypeAndReference(@Param("actorId") Long actorId,
                                                   @Param("type") ActivityType type,
                                                   @Param("refId") Long refId);
}
