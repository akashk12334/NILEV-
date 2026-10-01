package com.nilev.partner.repository;

import com.nilev.partner.entity.InvitationStatus;
import com.nilev.partner.entity.PartnerInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PartnerInvitationRepository extends JpaRepository<PartnerInvitation, Long> {

    @Query("SELECT pi FROM PartnerInvitation pi " +
           "LEFT JOIN FETCH pi.sender " +
           "LEFT JOIN FETCH pi.receiver " +
           "WHERE pi.receiver.id = :receiverId AND pi.status = :status " +
           "ORDER BY pi.createdAt DESC")
    List<PartnerInvitation> findByReceiverIdAndStatus(@Param("receiverId") Long receiverId,
                                                      @Param("status") InvitationStatus status);

    @Query("SELECT pi FROM PartnerInvitation pi " +
           "LEFT JOIN FETCH pi.sender " +
           "LEFT JOIN FETCH pi.receiver " +
           "WHERE pi.sender.id = :senderId AND pi.status = :status " +
           "ORDER BY pi.createdAt DESC")
    List<PartnerInvitation> findBySenderIdAndStatus(@Param("senderId") Long senderId,
                                                    @Param("status") InvitationStatus status);

    @Query("SELECT pi FROM PartnerInvitation pi " +
           "LEFT JOIN FETCH pi.sender " +
           "LEFT JOIN FETCH pi.receiver " +
           "WHERE ((pi.sender.id = :userA AND pi.receiver.id = :userB) OR " +
           "       (pi.sender.id = :userB AND pi.receiver.id = :userA)) " +
           "AND pi.status = com.nilev.partner.entity.InvitationStatus.PENDING")
    Optional<PartnerInvitation> findPendingBetween(@Param("userA") Long userA, @Param("userB") Long userB);

    @Query("SELECT pi FROM PartnerInvitation pi " +
           "LEFT JOIN FETCH pi.sender " +
           "LEFT JOIN FETCH pi.receiver " +
           "WHERE pi.id = :id")
    Optional<PartnerInvitation> findByIdWithUsers(@Param("id") Long id);
}
