package com.nilev.partner.repository;

import com.nilev.partner.entity.PartnerActivity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartnerActivityRepository extends JpaRepository<PartnerActivity, Long> {

    @Query("SELECT pa FROM PartnerActivity pa " +
           "LEFT JOIN FETCH pa.user " +
           "WHERE pa.user.id = :user1Id OR pa.user.id = :user2Id " +
           "ORDER BY pa.createdAt DESC")
    List<PartnerActivity> findRecentActivitiesForCouple(@Param("user1Id") Long user1Id,
                                                        @Param("user2Id") Long user2Id,
                                                        Pageable pageable);

    @Query("SELECT pa FROM PartnerActivity pa " +
           "LEFT JOIN FETCH pa.user " +
           "WHERE pa.user.id = :userId " +
           "ORDER BY pa.createdAt DESC")
    List<PartnerActivity> findByUserIdOrderByCreatedAtDesc(@Param("userId") Long userId,
                                                           Pageable pageable);
}
