package com.nilev.companion.repository;

import com.nilev.companion.entity.CompanionHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanionHistoryRepository extends JpaRepository<CompanionHistory, Long> {

    @Query("SELECT h FROM CompanionHistory h WHERE h.companion.id = :companionId ORDER BY h.createdAt DESC")
    List<CompanionHistory> findRecentByCompanionId(@Param("companionId") Long companionId, Pageable pageable);

    @Query("SELECT h FROM CompanionHistory h WHERE h.companion.user.id = :userId ORDER BY h.createdAt DESC")
    List<CompanionHistory> findRecentByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COALESCE(SUM(h.xpGained), 0L) FROM CompanionHistory h WHERE h.companion.id = :companionId")
    Long sumXpGainedByCompanionId(@Param("companionId") Long companionId);
}
