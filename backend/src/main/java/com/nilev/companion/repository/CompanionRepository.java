package com.nilev.companion.repository;

import com.nilev.companion.entity.Companion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanionRepository extends JpaRepository<Companion, Long> {

    @Query("SELECT c FROM Companion c JOIN FETCH c.user WHERE c.user.id = :userId")
    Optional<Companion> findByUserId(@Param("userId") Long userId);

    boolean existsByUserId(Long userId);
}
