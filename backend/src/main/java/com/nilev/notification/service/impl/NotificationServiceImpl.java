package com.nilev.notification.service.impl;

import com.nilev.exception.NilevApiException;
import com.nilev.notification.dto.NotificationResponse;
import com.nilev.notification.dto.NotificationSummaryResponse;
import com.nilev.notification.entity.Notification;
import com.nilev.notification.entity.NotificationType;
import com.nilev.notification.repository.NotificationRepository;
import com.nilev.notification.service.NotificationService;
import com.nilev.user.entity.User;
import com.nilev.partner.entity.InvitationStatus;
import com.nilev.partner.entity.PartnerInvitation;
import com.nilev.partner.repository.PartnerInvitationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceImpl.class);

    private final NotificationRepository notifRepo;
    private final PartnerInvitationRepository partnerInvitationRepository;

    public NotificationServiceImpl(NotificationRepository notifRepo,
                                   PartnerInvitationRepository partnerInvitationRepository) {
        this.notifRepo = notifRepo;
        this.partnerInvitationRepository = partnerInvitationRepository;
    }

    @Override
    @Transactional
    public NotificationSummaryResponse getNotifications(Long currentUserId, Boolean unreadOnly, int limit) {
        syncPendingInvitations(currentUserId);

        int boundedLimit = Math.max(1, Math.min(limit, 50));
        Pageable pageable = PageRequest.of(0, boundedLimit);

        long unreadCount = notifRepo.countByUserIdAndIsReadFalse(currentUserId);

        List<Notification> list;
        if (Boolean.TRUE.equals(unreadOnly)) {
            list = notifRepo.findUnreadByUserId(currentUserId, pageable);
        } else {
            list = notifRepo.findByUserId(currentUserId, pageable);
        }

        List<NotificationResponse> dtos = list.stream()
                .map(NotificationResponse::fromEntity)
                .collect(Collectors.toList());

        return new NotificationSummaryResponse(unreadCount, dtos);
    }

    @Override
    @Transactional
    public long getUnreadCount(Long currentUserId) {
        syncPendingInvitations(currentUserId);
        return notifRepo.countByUserIdAndIsReadFalse(currentUserId);
    }

    private void syncPendingInvitations(Long currentUserId) {
        if (currentUserId == null || partnerInvitationRepository == null) return;
        try {
            List<PartnerInvitation> pending = partnerInvitationRepository.findByReceiverIdAndStatus(currentUserId, InvitationStatus.PENDING);
            for (PartnerInvitation inv : pending) {
                boolean exists = notifRepo.existsByUserIdAndReferenceIdAndType(currentUserId, inv.getId(), NotificationType.PARTNER_INVITATION);
                if (!exists) {
                    User sender = inv.getSender();
                    String senderName = sender.getNickname() != null && !sender.getNickname().isBlank() ? sender.getNickname() : sender.getName();
                    sendNotification(
                            inv.getReceiver(),
                            sender,
                            NotificationType.PARTNER_INVITATION,
                            "Partner Invitation Received 💌",
                            senderName + " invited you to connect sanctuaries on NILEV!",
                            "💌",
                            inv.getId(),
                            "PARTNER_INVITATION",
                            "/partner"
                    );
                }
            }
        } catch (Exception e) {
            log.warn("Failed to sync pending invitations for user {}: {}", currentUserId, e.getMessage());
        }
    }

    @Override
    public NotificationResponse markAsRead(Long currentUserId, Long notificationId) {
        Notification notif = notifRepo.findById(notificationId)
                .orElseThrow(() -> new NilevApiException("Notification not found with ID: " + notificationId, HttpStatus.NOT_FOUND));

        if (!notif.getUser().getId().equals(currentUserId)) {
            throw new NilevApiException("Access denied: You do not own this notification", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
        }

        if (!notif.isRead()) {
            notif.markAsRead();
            notif = notifRepo.save(notif);
        }

        return NotificationResponse.fromEntity(notif);
    }

    @Override
    public void markAllAsRead(Long currentUserId) {
        notifRepo.markAllAsRead(currentUserId, Instant.now());
        log.info("All notifications marked as read for user {}", currentUserId);
    }

    @Override
    public Notification sendNotification(User recipient, User actor, NotificationType type, String title, String message, String icon, Long referenceId, String referenceType, String actionUrl) {
        if (recipient == null) {
            log.warn("Cannot send notification: recipient is null");
            return null;
        }

        // Do not self-notify if actor and recipient are identical (e.g. your own action)
        if (actor != null && recipient.getId().equals(actor.getId()) && type != NotificationType.HABIT_REMINDER && type != NotificationType.COMPANION_LEVEL_UP) {
            return null;
        }

        Notification notification = Notification.builder()
                .user(recipient)
                .actor(actor)
                .type(type)
                .title(title)
                .message(message)
                .icon(icon != null ? icon : (type != null ? type.getEmoji() : "✨"))
                .referenceId(referenceId)
                .referenceType(referenceType)
                .actionUrl(actionUrl)
                .build();

        notification = notifRepo.save(notification);
        log.debug("Notification [{}] sent to user #{}", type, recipient.getId());
        return notification;
    }
}
