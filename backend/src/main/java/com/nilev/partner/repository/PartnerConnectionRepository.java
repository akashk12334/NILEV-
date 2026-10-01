package com.nilev.partner.repository;

import com.nilev.partner.entity.PartnerConnection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PartnerConnectionRepository extends JpaRepository<PartnerConnection, Long> {

    @Query("SELECT pc FROM PartnerConnection pc " +
           "LEFT JOIN FETCH pc.user1 " +
           "LEFT JOIN FETCH pc.user2 " +
           "WHERE (pc.user1.id = :userId OR pc.user2.id = :userId) AND pc.active = true")
    Optional<PartnerConnection> findActiveConnectionForUser(@Param("userId") Long userId);

    @Query("SELECT COUNT(pc) > 0 FROM PartnerConnection pc " +
           "WHERE (pc.user1.id = :userId OR pc.user2.id = :userId) AND pc.active = true")
    boolean existsActiveConnectionForUser(@Param("userId") Long userId);

    @Query("SELECT pc FROM PartnerConnection pc " +
           "LEFT JOIN FETCH pc.user1 " +
           "LEFT JOIN FETCH pc.user2 " +
           "WHERE ((pc.user1.id = :userA AND pc.user2.id = :userB) OR " +
           "       (pc.user1.id = :userB AND pc.user2.id = :userA)) AND pc.active = true")
    Optional<PartnerConnection> findActiveConnectionBetween(@Param("userA") Long userA, @Param("userB") Long userB);
}
