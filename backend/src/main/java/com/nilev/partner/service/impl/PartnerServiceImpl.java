package com.nilev.partner.service.impl;

import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.service.ActivityService;
import com.nilev.exception.*;
import org.springframework.http.HttpStatus;
import com.nilev.partner.dto.*;
import com.nilev.partner.entity.*;
import com.nilev.partner.repository.*;
import com.nilev.partner.service.PartnerService;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import com.nilev.companion.entity.Companion;
import com.nilev.companion.repository.CompanionRepository;
import com.nilev.habit.entity.Habit;
import com.nilev.habit.repository.HabitCompletionRepository;
import com.nilev.habit.repository.HabitRepository;
import com.nilev.goal.repository.GoalRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@Transactional
public class PartnerServiceImpl implements PartnerService {

    private final UserRepository userRepository;
    private final PartnerConnectionRepository partnerConnectionRepository;
    private final PartnerInvitationRepository partnerInvitationRepository;
    private final PartnerActivityRepository partnerActivityRepository;
    private final ActivityService activityService;
    private final CompanionRepository companionRepository;
    private final HabitRepository habitRepository;
    private final HabitCompletionRepository habitCompletionRepository;
    private final GoalRepository goalRepository;

    public PartnerServiceImpl(UserRepository userRepository,
                              PartnerConnectionRepository partnerConnectionRepository,
                              PartnerInvitationRepository partnerInvitationRepository,
                              PartnerActivityRepository partnerActivityRepository,
                              ActivityService activityService,
                              CompanionRepository companionRepository,
                              HabitRepository habitRepository,
                              HabitCompletionRepository habitCompletionRepository,
                              GoalRepository goalRepository) {
        this.userRepository = userRepository;
        this.partnerConnectionRepository = partnerConnectionRepository;
        this.partnerInvitationRepository = partnerInvitationRepository;
        this.partnerActivityRepository = partnerActivityRepository;
        this.activityService = activityService;
        this.companionRepository = companionRepository;
        this.habitRepository = habitRepository;
        this.habitCompletionRepository = habitCompletionRepository;
        this.goalRepository = goalRepository;
    }

    @Override
    public PartnerStatusResponse invitePartner(Long currentUserId, InvitePartnerRequest request) {
        User currentUser = getCurrentUser(currentUserId);

        // Core Rule: User cannot already be in a relationship
        if (partnerConnectionRepository.existsActiveConnectionForUser(currentUserId)) {
            throw new PartnerAlreadyConnectedException(
                    "You are already in a partner connection. NILEV strictly allows exactly two connected people."
            );
        }

        String targetEmail = request.getEmail().trim();
        User targetUser = userRepository.findByEmailIgnoreCase(targetEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User with email '" + targetEmail + "' not found."));

        // Rule: Cannot invite self
        if (targetUser.getId().equals(currentUserId)) {
            throw new SelfInvitationException("You cannot invite yourself to be your partner.");
        }

        // Rule: Target must be active
        if (!targetUser.isActive()) {
            throw new AccountInactiveException("The invited user's account is currently inactive.");
        }

        // Rule: Target cannot already be in a relationship
        if (partnerConnectionRepository.existsActiveConnectionForUser(targetUser.getId())) {
            throw new PartnerAlreadyConnectedException(
                    targetUser.getName() + " is already connected with a partner. Connections are strictly 1-on-1."
            );
        }

        // Rule: Check existing pending invitation between them
        Optional<PartnerInvitation> pendingBetween = partnerInvitationRepository.findPendingBetween(currentUserId, targetUser.getId());
        if (pendingBetween.isPresent()) {
            throw new PendingInvitationExistsException(
                    "A pending invitation already exists between you and " + targetUser.getName() + "."
            );
        }

        // Cancel any previous pending invitations sent by currentUser to others
        List<PartnerInvitation> existingSent = partnerInvitationRepository.findBySenderIdAndStatus(currentUserId, InvitationStatus.PENDING);
        for (PartnerInvitation old : existingSent) {
            old.setStatus(InvitationStatus.CANCELLED);
            partnerInvitationRepository.save(old);
        }

        // Create new invitation
        PartnerInvitation invitation = PartnerInvitation.builder()
                .sender(currentUser)
                .receiver(targetUser)
                .status(InvitationStatus.PENDING)
                .build();
        partnerInvitationRepository.save(invitation);

        // Record Activity
        PartnerActivity activity = PartnerActivity.builder()
                .user(currentUser)
                .activityType("PARTNER_INVITATION_SENT")
                .title("Partner Invitation Sent 💌")
                .description("Sent partnership invitation to " + targetUser.getName())
                .icon("💌")
                .build();
        partnerActivityRepository.save(activity);

        activityService.publish(
                currentUser.getId(),
                ActivityType.PARTNER_INVITATION_SENT,
                invitation.getId(),
                "Partner Invitation Sent 💌",
                "Sent partnership invitation to " + targetUser.getName(),
                "💌",
                String.format("{\"targetEmail\":\"%s\"}", targetUser.getEmail())
        );

        return PartnerStatusResponse.invitationSent(
                buildPartnerProfile(currentUser, false),
                InvitationResponse.fromEntity(invitation)
        );
    }

    @Override
    public PartnerStatusResponse acceptInvitation(Long currentUserId, AcceptInvitationRequest request) {
        User currentUser = getCurrentUser(currentUserId);

        // Core Rule: User cannot already be connected
        if (partnerConnectionRepository.existsActiveConnectionForUser(currentUserId)) {
            throw new PartnerAlreadyConnectedException(
                    "You are already connected with a partner. Connections cannot exceed two people."
            );
        }

        PartnerInvitation invitation;
        if (request != null && request.getInvitationId() != null) {
            invitation = partnerInvitationRepository.findByIdWithUsers(request.getInvitationId())
                    .orElseThrow(() -> new InvitationNotFoundException("Invitation with ID " + request.getInvitationId() + " not found."));
            if (!invitation.getReceiver().getId().equals(currentUserId)) {
                throw new NilevApiException("You are not authorized to accept this invitation.", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
            }
            if (invitation.getStatus() != InvitationStatus.PENDING) {
                throw new InvitationNotFoundException("This invitation is no longer pending.");
            }
        } else {
            List<PartnerInvitation> pending = partnerInvitationRepository.findByReceiverIdAndStatus(currentUserId, InvitationStatus.PENDING);
            if (pending.isEmpty()) {
                throw new InvitationNotFoundException("No pending partner invitation found to accept.");
            }
            invitation = pending.get(0);
        }

        User sender = invitation.getSender();

        // Core Rule: Sender cannot already be connected
        if (partnerConnectionRepository.existsActiveConnectionForUser(sender.getId())) {
            invitation.setStatus(InvitationStatus.CANCELLED);
            partnerInvitationRepository.save(invitation);
            throw new PartnerAlreadyConnectedException(
                    sender.getName() + " has already connected with another partner."
            );
        }

        // Accept invitation
        invitation.setStatus(InvitationStatus.ACCEPTED);
        partnerInvitationRepository.save(invitation);

        // Cancel any other pending invitations for both users
        cancelPendingInvitations(currentUserId);
        cancelPendingInvitations(sender.getId());

        // Create exactly two-person connection
        PartnerConnection connection = PartnerConnection.builder()
                .user1(sender)
                .user2(currentUser)
                .connectedAt(Instant.now())
                .active(true)
                .sharedStreak(1)
                .build();
        partnerConnectionRepository.save(connection);

        // Activity for couple
        PartnerActivity act1 = PartnerActivity.builder()
                .user(currentUser)
                .activityType("PARTNER_CONNECTED")
                .title("Sanctuary Connected! ❤️")
                .description("Connected with " + sender.getName() + " in NILEV.")
                .icon("❤️")
                .build();
        partnerActivityRepository.save(act1);

        PartnerActivity act2 = PartnerActivity.builder()
                .user(sender)
                .activityType("PARTNER_CONNECTED")
                .title("Sanctuary Connected! ❤️")
                .description("Connected with " + currentUser.getName() + " in NILEV.")
                .icon("❤️")
                .build();
        partnerActivityRepository.save(act2);

        activityService.publish(
                currentUser.getId(),
                ActivityType.PARTNER_CONNECTED,
                connection.getId(),
                "Sanctuary Connected! ❤️",
                "Connected with " + sender.getName() + " in NILEV.",
                "❤️",
                String.format("{\"partnerName\":\"%s\"}", sender.getName())
        );

        activityService.publish(
                sender.getId(),
                ActivityType.PARTNER_CONNECTED,
                connection.getId(),
                "Sanctuary Connected! ❤️",
                "Connected with " + currentUser.getName() + " in NILEV.",
                "❤️",
                String.format("{\"partnerName\":\"%s\"}", currentUser.getName())
        );

        int sharedStreak = computeSharedStreak(currentUser.getId(), sender.getId(), LocalDate.now());
        if (sharedStreak == 0 && connection.getSharedStreak() > 0) {
            sharedStreak = connection.getSharedStreak();
        }

        return PartnerStatusResponse.connected(
                buildPartnerProfile(currentUser, false),
                buildPartnerProfile(sender, true),
                sharedStreak,
                connection.getConnectedAt()
        );
    }

    @Override
    public PartnerStatusResponse rejectInvitation(Long currentUserId, RejectInvitationRequest request) {
        User currentUser = getCurrentUser(currentUserId);

        PartnerInvitation invitation;
        if (request != null && request.getInvitationId() != null) {
            invitation = partnerInvitationRepository.findByIdWithUsers(request.getInvitationId())
                    .orElseThrow(() -> new InvitationNotFoundException("Invitation with ID " + request.getInvitationId() + " not found."));
            if (!invitation.getReceiver().getId().equals(currentUserId)) {
                throw new NilevApiException("You are not authorized to reject this invitation.", HttpStatus.FORBIDDEN, "ACCESS_DENIED");
            }
        } else {
            List<PartnerInvitation> pending = partnerInvitationRepository.findByReceiverIdAndStatus(currentUserId, InvitationStatus.PENDING);
            if (pending.isEmpty()) {
                throw new InvitationNotFoundException("No pending invitation found to reject.");
            }
            invitation = pending.get(0);
        }

        invitation.setStatus(InvitationStatus.REJECTED);
        partnerInvitationRepository.save(invitation);

        return PartnerStatusResponse.noPartner(buildPartnerProfile(currentUser, false));
    }

    @Override
    public void disconnectPartner(Long currentUserId) {
        PartnerConnection connection = partnerConnectionRepository.findActiveConnectionForUser(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("No active partner connection found."));

        connection.setActive(false);
        partnerConnectionRepository.save(connection);

        User currentUser = getCurrentUser(currentUserId);
        PartnerActivity activity = PartnerActivity.builder()
                .user(currentUser)
                .activityType("PARTNER_DISCONNECTED")
                .title("Connection Dissolved")
                .description("Ended partner connection.")
                .icon("💔")
                .build();
        partnerActivityRepository.save(activity);
    }

    @Override
    @Transactional(readOnly = true)
    public PartnerStatusResponse getPartnerStatus(Long currentUserId) {
        User currentUser = getCurrentUser(currentUserId);

        // 1. Check if connected
        Optional<PartnerConnection> connectionOpt = partnerConnectionRepository.findActiveConnectionForUser(currentUserId);
        if (connectionOpt.isPresent()) {
            PartnerConnection conn = connectionOpt.get();
            User partner = conn.getPartnerOf(currentUserId);
            int sharedStreak = computeSharedStreak(currentUser.getId(), partner.getId(), LocalDate.now());
            if (sharedStreak == 0 && conn.getSharedStreak() > 0) {
                sharedStreak = conn.getSharedStreak();
            }
            return PartnerStatusResponse.connected(
                    buildPartnerProfile(currentUser, false),
                    buildPartnerProfile(partner, true),
                    sharedStreak,
                    conn.getConnectedAt()
            );
        }

        // 2. Check if user received an invitation
        List<PartnerInvitation> received = partnerInvitationRepository.findByReceiverIdAndStatus(currentUserId, InvitationStatus.PENDING);
        if (!received.isEmpty()) {
            return PartnerStatusResponse.invitationReceived(
                    buildPartnerProfile(currentUser, false),
                    InvitationResponse.fromEntity(received.get(0))
            );
        }

        // 3. Check if user sent an invitation
        List<PartnerInvitation> sent = partnerInvitationRepository.findBySenderIdAndStatus(currentUserId, InvitationStatus.PENDING);
        if (!sent.isEmpty()) {
            return PartnerStatusResponse.invitationSent(
                    buildPartnerProfile(currentUser, false),
                    InvitationResponse.fromEntity(sent.get(0))
            );
        }

        // 4. No partner
        return PartnerStatusResponse.noPartner(buildPartnerProfile(currentUser, false));
    }

    public PartnerProfileResponse buildPartnerProfile(User user, boolean isPartner) {
        if (user == null) return null;

        Long userId = user.getId();

        // 1. Live companion data from companions table
        Optional<Companion> companionOpt = companionRepository.findByUserId(userId);
        String compName = companionOpt.map(Companion::getName).orElse(user.getCompanionName());
        String compType = companionOpt.map(c -> c.getAnimalType().name()).orElse(user.getCompanionType());
        int compLevel = companionOpt.map(Companion::getLevel).orElse(user.getCompanionLevel());
        String compMood = companionOpt.map(c -> c.getMood().name()).orElse(user.getCompanionMood());
        int currentXp = companionOpt.map(Companion::getXp).orElse(user.getXp());
        int currentLevel = companionOpt.map(Companion::getLevel).orElse(user.getLevel());

        // 2. Live habit completions & streak
        List<Habit> activeHabits = habitRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(userId);
        LocalDate today = LocalDate.now();
        int maxStreak = 0;
        int totalCompletedCount = 0;
        for (Habit h : activeHabits) {
            List<LocalDate> dates = habitCompletionRepository.findCompletedDatesByHabitId(h.getId());
            totalCompletedCount += dates.size();
            int hStreak = computeHabitStreak(dates, today);
            if (hStreak > maxStreak) {
                maxStreak = hStreak;
            }
        }
        if (maxStreak == 0 && user.getStreak() > 0 && activeHabits.isEmpty()) {
            maxStreak = user.getStreak();
        }
        if (totalCompletedCount == 0 && user.getHabitsCompletedCount() > 0 && activeHabits.isEmpty()) {
            totalCompletedCount = user.getHabitsCompletedCount();
        }

        // 3. Live personal goals count
        int goalsCount = goalRepository.findPersonalGoals(userId).size();
        if (goalsCount == 0 && user.getGoalsCount() > 0) {
            goalsCount = user.getGoalsCount();
        }

        PartnerProfileResponse res = new PartnerProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getNickname(),
                user.getAvatarUrl(),
                currentXp,
                currentLevel,
                maxStreak,
                compName,
                compType,
                compLevel,
                compMood,
                totalCompletedCount,
                goalsCount,
                isPartner,
                isPartner
        );
        res.setProfileImageUrl(user.getProfileImageUrl() != null ? user.getProfileImageUrl() : user.getAvatarUrl());
        return res;
    }

    private int computeHabitStreak(List<LocalDate> dates, LocalDate today) {
        if (dates == null || dates.isEmpty()) return 0;
        int streak = 0;
        LocalDate cursor = today;
        if (!dates.contains(today)) {
            cursor = today.minusDays(1);
        }
        while (dates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int computeSharedStreak(Long u1, Long u2, LocalDate today) {
        List<Habit> habits1 = habitRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(u1);
        List<Habit> habits2 = habitRepository.findByUserIdAndActiveTrueOrderByCreatedAtDesc(u2);

        Set<LocalDate> dates1 = new HashSet<>();
        for (Habit h : habits1) {
            dates1.addAll(habitCompletionRepository.findCompletedDatesByHabitId(h.getId()));
        }
        Set<LocalDate> dates2 = new HashSet<>();
        for (Habit h : habits2) {
            dates2.addAll(habitCompletionRepository.findCompletedDatesByHabitId(h.getId()));
        }

        dates1.retainAll(dates2);
        if (dates1.isEmpty()) return 0;

        int streak = 0;
        LocalDate cursor = today;
        if (!dates1.contains(today)) {
            cursor = today.minusDays(1);
        }
        while (dates1.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PartnerActivityResponse> getPartnerActivities(Long currentUserId) {
        Optional<PartnerConnection> connectionOpt = partnerConnectionRepository.findActiveConnectionForUser(currentUserId);

        List<PartnerActivity> activities;
        if (connectionOpt.isPresent()) {
            User partner = connectionOpt.get().getPartnerOf(currentUserId);
            activities = partnerActivityRepository.findRecentActivitiesForCouple(
                    currentUserId,
                    partner.getId(),
                    PageRequest.of(0, 30)
            );
        } else {
            activities = partnerActivityRepository.findByUserIdOrderByCreatedAtDesc(
                    currentUserId,
                    PageRequest.of(0, 20)
            );
        }

        return activities.stream()
                .map(a -> PartnerActivityResponse.fromEntity(a, currentUserId))
                .toList();
    }

    private User getCurrentUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User with ID " + userId + " not found."));
    }

    private void cancelPendingInvitations(Long userId) {
        List<PartnerInvitation> received = partnerInvitationRepository.findByReceiverIdAndStatus(userId, InvitationStatus.PENDING);
        for (PartnerInvitation inv : received) {
            inv.setStatus(InvitationStatus.CANCELLED);
            partnerInvitationRepository.save(inv);
        }
        List<PartnerInvitation> sent = partnerInvitationRepository.findBySenderIdAndStatus(userId, InvitationStatus.PENDING);
        for (PartnerInvitation inv : sent) {
            inv.setStatus(InvitationStatus.CANCELLED);
            partnerInvitationRepository.save(inv);
        }
    }
}
