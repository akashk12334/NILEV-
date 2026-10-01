package com.nilev.surprise.repository;

import com.nilev.surprise.entity.Surprise;
import com.nilev.surprise.entity.SurpriseStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface SurpriseRepository extends JpaRepository<Surprise, Long> {

    @Query("SELECT s FROM Surprise s JOIN FETCH s.sender JOIN FETCH s.receiver WHERE s.id = :id")
    Optional<Surprise> findByIdWithUsers(@Param("id") Long id);

    @Query("SELECT s FROM Surprise s JOIN FETCH s.sender JOIN FETCH s.receiver " +
           "WHERE s.receiver.id = :receiverId AND s.status != 'DRAFT' " +
           "ORDER BY s.createdAt DESC")
    List<Surprise> findReceivedSurprises(@Param("receiverId") Long receiverId);

    @Query("SELECT s FROM Surprise s JOIN FETCH s.sender JOIN FETCH s.receiver " +
           "WHERE s.sender.id = :senderId " +
           "ORDER BY s.createdAt DESC")
    List<Surprise> findSentSurprises(@Param("senderId") Long senderId);

    @Query("SELECT s FROM Surprise s JOIN FETCH s.sender JOIN FETCH s.receiver " +
           "WHERE (s.sender.id = :userId OR (s.receiver.id = :userId AND s.status != 'DRAFT')) " +
           "AND s.status = 'SCHEDULED' " +
           "ORDER BY s.scheduledAt ASC")
    List<Surprise> findScheduledSurprises(@Param("userId") Long userId);

    @Query("SELECT s FROM Surprise s " +
           "WHERE s.status = 'SCHEDULED' AND s.scheduledAt <= :now")
    List<Surprise> findReadyForDelivery(@Param("now") LocalDateTime now);
}
