package com.nilev.surprise.service.impl;

import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.service.ActivityService;
import com.nilev.exception.NilevApiException;
import com.nilev.partner.entity.PartnerConnection;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.surprise.dto.CreateSurpriseRequest;
import com.nilev.surprise.dto.SurpriseResponse;
import com.nilev.surprise.dto.UpdateSurpriseRequest;
import com.nilev.surprise.entity.Surprise;
import com.nilev.surprise.entity.SurpriseStatus;
import com.nilev.surprise.repository.SurpriseRepository;
import com.nilev.surprise.service.SurpriseService;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SurpriseServiceImpl implements SurpriseService {

    private static final Logger log = LoggerFactory.getLogger(SurpriseServiceImpl.class);

    private final SurpriseRepository surpriseRepo;
    private final UserRepository userRepo;
    private final PartnerConnectionRepository partnerConnectionRepo;
    private final ActivityService activityService;
    private final com.nilev.notification.service.NotificationService notificationService;

    public SurpriseServiceImpl(SurpriseRepository surpriseRepo,
                               UserRepository userRepo,
                               PartnerConnectionRepository partnerConnectionRepo,
                               ActivityService activityService,
                               com.nilev.notification.service.NotificationService notificationService) {
        this.surpriseRepo = surpriseRepo;
        this.userRepo = userRepo;
        this.partnerConnectionRepo = partnerConnectionRepo;
        this.activityService = activityService;
        this.notificationService = notificationService;
    }

    @Override
    public SurpriseResponse createSurprise(Long currentUserId, CreateSurpriseRequest request) {
        User sender = userRepo.findById(currentUserId)
                .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));

        PartnerConnection conn = partnerConnectionRepo.findActiveConnectionForUser(currentUserId)
                .orElseThrow(() -> new NilevApiException("You must be connected with a partner to send surprises.", HttpStatus.BAD_REQUEST));

        User receiver = conn.getPartnerOf(currentUserId);
        if (receiver == null) {
            throw new NilevApiException("Partner not found in active connection.", HttpStatus.BAD_REQUEST);
        }

        SurpriseStatus status;
        if (Boolean.TRUE.equals(request.getIsDraft())) {
            status = SurpriseStatus.DRAFT;
        } else if (request.getScheduledAt() != null && request.getScheduledAt().isAfter(LocalDateTime.now())) {
            status = SurpriseStatus.SCHEDULED;
        } else {
            status = SurpriseStatus.DELIVERED;
        }

        Surprise surprise = Surprise.builder()
                .sender(sender)
                .receiver(receiver)
                .type(request.getType())
                .title(request.getTitle().trim())
                .content(request.getContent().trim())
                .mediaUrl(request.getMediaUrl() != null && !request.getMediaUrl().isBlank() ? request.getMediaUrl().trim() : null)
                .scheduledAt(request.getScheduledAt())
                .status(status)
                .build();

        surprise = surpriseRepo.save(surprise);

        if (status != SurpriseStatus.DRAFT) {
            publishSurpriseSentActivity(surprise, sender, receiver);
        }

        return SurpriseResponse.fromEntity(surprise, currentUserId);
    }

    @Override
    public List<SurpriseResponse> getReceivedSurprises(Long currentUserId) {
        autoDeliverScheduledSurprises();

        List<Surprise> received = surpriseRepo.findReceivedSurprises(currentUserId);
        return received.stream()
                .map(s -> SurpriseResponse.fromEntity(s, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<SurpriseResponse> getSentSurprises(Long currentUserId) {
        autoDeliverScheduledSurprises();

        List<Surprise> sent = surpriseRepo.findSentSurprises(currentUserId);
        return sent.stream()
                .map(s -> SurpriseResponse.fromEntity(s, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public List<SurpriseResponse> getScheduledSurprises(Long currentUserId) {
        autoDeliverScheduledSurprises();

        List<Surprise> scheduled = surpriseRepo.findScheduledSurprises(currentUserId);
        return scheduled.stream()
                .map(s -> SurpriseResponse.fromEntity(s, currentUserId))
                .collect(Collectors.toList());
    }

    @Override
    public SurpriseResponse getSurpriseById(Long currentUserId, Long surpriseId) {
        autoDeliverScheduledSurprises();

        Surprise surprise = surpriseRepo.findByIdWithUsers(surpriseId)
                .orElseThrow(() -> new NilevApiException("Surprise not found with ID: " + surpriseId, HttpStatus.NOT_FOUND));

        boolean isSender = surprise.getSender().getId().equals(currentUserId);
        boolean isReceiver = surprise.getReceiver().getId().equals(currentUserId);

        if (!isSender && !isReceiver) {
            throw new NilevApiException("You do not have permission to view this surprise.", HttpStatus.FORBIDDEN);
        }

        if (isReceiver && surprise.getStatus() == SurpriseStatus.DRAFT) {
            throw new NilevApiException("Surprise not found.", HttpStatus.NOT_FOUND);
        }

        return SurpriseResponse.fromEntity(surprise, currentUserId);
    }

    @Override
    public SurpriseResponse updateSurprise(Long currentUserId, Long surpriseId, UpdateSurpriseRequest request) {
        Surprise surprise = surpriseRepo.findByIdWithUsers(surpriseId)
                .orElseThrow(() -> new NilevApiException("Surprise not found with ID: " + surpriseId, HttpStatus.NOT_FOUND));

        if (!surprise.getSender().getId().equals(currentUserId)) {
            throw new NilevApiException("Only the creator can edit this surprise.", HttpStatus.FORBIDDEN);
        }

        if (surprise.getStatus() == SurpriseStatus.OPENED || surprise.getStatus() == SurpriseStatus.DELIVERED) {
            throw new NilevApiException("Cannot modify a surprise that has already been delivered or unsealed.", HttpStatus.BAD_REQUEST);
        }

        if (request.getType() != null) {
            surprise.setType(request.getType());
        }
        if (request.getTitle() != null && !request.getTitle().isBlank()) {
            surprise.setTitle(request.getTitle().trim());
        }
        if (request.getContent() != null && !request.getContent().isBlank()) {
            surprise.setContent(request.getContent().trim());
        }
        if (request.getMediaUrl() != null) {
            surprise.setMediaUrl(request.getMediaUrl().isBlank() ? null : request.getMediaUrl().trim());
        }
        if (request.getScheduledAt() != null) {
            surprise.setScheduledAt(request.getScheduledAt());
        }

        boolean wasDraft = surprise.getStatus() == SurpriseStatus.DRAFT;
        if (Boolean.TRUE.equals(request.getSendNow())) {
            if (surprise.getScheduledAt() != null && surprise.getScheduledAt().isAfter(LocalDateTime.now())) {
                surprise.setStatus(SurpriseStatus.SCHEDULED);
            } else {
                surprise.setStatus(SurpriseStatus.DELIVERED);
            }
        }

        surprise = surpriseRepo.save(surprise);

        if (wasDraft && surprise.getStatus() != SurpriseStatus.DRAFT) {
            publishSurpriseSentActivity(surprise, surprise.getSender(), surprise.getReceiver());
        }

        return SurpriseResponse.fromEntity(surprise, currentUserId);
    }

    @Override
    public void deleteSurprise(Long currentUserId, Long surpriseId) {
        Surprise surprise = surpriseRepo.findByIdWithUsers(surpriseId)
                .orElseThrow(() -> new NilevApiException("Surprise not found with ID: " + surpriseId, HttpStatus.NOT_FOUND));

        if (!surprise.getSender().getId().equals(currentUserId)) {
            throw new NilevApiException("Only the creator can delete this surprise.", HttpStatus.FORBIDDEN);
        }

        if (surprise.getStatus() == SurpriseStatus.OPENED) {
            throw new NilevApiException("Opened surprises are preserved in the couple's memory chronicle and cannot be deleted.", HttpStatus.BAD_REQUEST);
        }

        surpriseRepo.delete(surprise);
        log.info("Surprise #{} deleted by sender {}", surpriseId, currentUserId);
    }

    @Override
    public SurpriseResponse openSurprise(Long currentUserId, Long surpriseId) {
        Surprise surprise = surpriseRepo.findByIdWithUsers(surpriseId)
                .orElseThrow(() -> new NilevApiException("Surprise not found with ID: " + surpriseId, HttpStatus.NOT_FOUND));

        if (!surprise.getReceiver().getId().equals(currentUserId)) {
            throw new NilevApiException("Only the recipient can open this surprise.", HttpStatus.FORBIDDEN);
        }

        if (surprise.getStatus() == SurpriseStatus.DRAFT) {
            throw new NilevApiException("Surprise not found.", HttpStatus.NOT_FOUND);
        }

        if (surprise.getStatus() == SurpriseStatus.SCHEDULED &&
                surprise.getScheduledAt() != null &&
                surprise.getScheduledAt().isAfter(LocalDateTime.now())) {
            throw new NilevApiException("This surprise is time-locked until " + surprise.getScheduledAt() + "!", HttpStatus.BAD_REQUEST);
        }

        if (surprise.getStatus() != SurpriseStatus.OPENED) {
            surprise.setStatus(SurpriseStatus.OPENED);
            surprise.setOpenedAt(LocalDateTime.now());
            surprise = surpriseRepo.save(surprise);

            publishSurpriseOpenedActivity(surprise, surprise.getReceiver(), surprise.getSender());
            log.info("Surprise #{} unsealed by receiver {}", surpriseId, currentUserId);
        }

        return SurpriseResponse.fromEntity(surprise, currentUserId);
    }

    @Override
    public SurpriseResponse sendDraft(Long currentUserId, Long surpriseId) {
        Surprise surprise = surpriseRepo.findByIdWithUsers(surpriseId)
                .orElseThrow(() -> new NilevApiException("Surprise not found with ID: " + surpriseId, HttpStatus.NOT_FOUND));

        if (!surprise.getSender().getId().equals(currentUserId)) {
            throw new NilevApiException("Only the creator can send this draft.", HttpStatus.FORBIDDEN);
        }

        if (surprise.getStatus() != SurpriseStatus.DRAFT) {
            throw new NilevApiException("Surprise is already dispatched.", HttpStatus.BAD_REQUEST);
        }

        if (surprise.getScheduledAt() != null && surprise.getScheduledAt().isAfter(LocalDateTime.now())) {
            surprise.setStatus(SurpriseStatus.SCHEDULED);
        } else {
            surprise.setStatus(SurpriseStatus.DELIVERED);
        }

        surprise = surpriseRepo.save(surprise);
        publishSurpriseSentActivity(surprise, surprise.getSender(), surprise.getReceiver());

        return SurpriseResponse.fromEntity(surprise, currentUserId);
    }

    private void autoDeliverScheduledSurprises() {
        try {
            List<Surprise> ready = surpriseRepo.findReadyForDelivery(LocalDateTime.now());
            for (Surprise s : ready) {
                s.setStatus(SurpriseStatus.DELIVERED);
                surpriseRepo.save(s);
            }
        } catch (Exception e) {
            log.warn("Failed auto-delivering scheduled surprises: {}", e.getMessage());
        }
    }

    private void publishSurpriseSentActivity(Surprise s, User sender, User receiver) {
        try {
            String title = "Surprise Sent ✨";
            String desc = "Sent a " + s.getType().getDisplayName().toLowerCase() + " to " + receiver.getName();
            String meta = String.format("{\"surpriseId\":%d,\"type\":\"%s\",\"receiverId\":%d}",
                    s.getId(), s.getType().name(), receiver.getId());
            activityService.publish(sender.getId(), ActivityType.SURPRISE_SENT, s.getId(), title, desc, "🎁", meta);

            // Notify receiver of new surprise
            notificationService.sendNotification(
                    receiver,
                    sender,
                    com.nilev.notification.entity.NotificationType.SURPRISE_RECEIVED,
                    "Someone has a surprise for you ✨",
                    sender.getName() + " left a private " + s.getType().getDisplayName().toLowerCase() + " in your sanctuary.",
                    "🎁",
                    s.getId(),
                    "SURPRISE",
                    "/surprises"
            );
        } catch (Exception e) {
            log.warn("Could not publish surprise sent activity: {}", e.getMessage());
        }
    }

    private void publishSurpriseOpenedActivity(Surprise s, User receiver, User sender) {
        try {
            String title = "Surprise Unsealed! 🎁";
            String desc = "Opened a " + s.getType().getDisplayName().toLowerCase() + " from " + sender.getName();
            String meta = String.format("{\"surpriseId\":%d,\"type\":\"%s\",\"senderId\":%d}",
                    s.getId(), s.getType().name(), sender.getId());
            activityService.publish(receiver.getId(), ActivityType.SURPRISE_OPENED, s.getId(), title, desc, "✨", meta);

            // Notify sender that their surprise was unsealed
            notificationService.sendNotification(
                    sender,
                    receiver,
                    com.nilev.notification.entity.NotificationType.SURPRISE_OPENED,
                    "Surprise Unsealed! 💖",
                    receiver.getName() + " opened your " + s.getType().getDisplayName().toLowerCase() + " '" + s.getTitle() + "'.",
                    "✨",
                    s.getId(),
                    "SURPRISE",
                    "/surprises"
            );
        } catch (Exception e) {
            log.warn("Could not publish surprise opened activity: {}", e.getMessage());
        }
    }
}
