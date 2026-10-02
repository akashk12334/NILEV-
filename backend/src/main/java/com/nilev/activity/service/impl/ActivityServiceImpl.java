package com.nilev.activity.service.impl;

import com.nilev.activity.dto.ActivityResponse;
import com.nilev.activity.dto.ReactionResponse;
import com.nilev.activity.entity.Activity;
import com.nilev.activity.entity.ActivityReaction;
import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.repository.ActivityReactionRepository;
import com.nilev.activity.repository.ActivityRepository;
import com.nilev.activity.service.ActivityService;
import com.nilev.exception.NilevApiException;
import com.nilev.partner.repository.PartnerConnectionRepository;
import com.nilev.user.entity.User;
import com.nilev.user.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ActivityServiceImpl implements ActivityService {

    private static final Logger log = LoggerFactory.getLogger(ActivityServiceImpl.class);
    private static final List<String> ALLOWED_EMOJIS = List.of("❤️", "🔥", "👏", "✨");

    private final ActivityRepository activityRepo;
    private final ActivityReactionRepository reactionRepo;
    private final PartnerConnectionRepository partnerConnectionRepo;
    private final UserRepository userRepo;

    public ActivityServiceImpl(ActivityRepository activityRepo,
                               ActivityReactionRepository reactionRepo,
                               PartnerConnectionRepository partnerConnectionRepo,
                               UserRepository userRepo) {
        this.activityRepo = activityRepo;
        this.reactionRepo = reactionRepo;
        this.partnerConnectionRepo = partnerConnectionRepo;
        this.userRepo = userRepo;
    }

    // ── Feed queries ─────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public List<ActivityResponse> getCombinedFeed(Long currentUserId, int limit) {
        Long partnerId = resolvePartnerId(currentUserId);
        List<Activity> activities = (partnerId != null)
                ? activityRepo.findCombinedFeed(currentUserId, partnerId, PageRequest.of(0, limit))
                : activityRepo.findByActorId(currentUserId, PageRequest.of(0, limit));
        return toResponses(activities, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityResponse> getMyFeed(Long currentUserId, int limit) {
        List<Activity> activities = activityRepo.findByActorId(currentUserId, PageRequest.of(0, limit));
        return toResponses(activities, currentUserId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ActivityResponse> getPartnerFeed(Long currentUserId, int limit) {
        Long partnerId = resolvePartnerId(currentUserId);
        if (partnerId == null) {
            return Collections.emptyList();
        }
        List<Activity> activities = activityRepo.findByActorId(partnerId, PageRequest.of(0, limit));
        return toResponses(activities, currentUserId);
    }

    // ── Reaction ──────────────────────────────────────────────────────

    @Override
    public ReactionResponse toggleReaction(Long currentUserId, Long activityId, String emoji) {
        emoji = normalizeEmoji(emoji);
        if (emoji == null || !ALLOWED_EMOJIS.contains(emoji)) {
            throw new NilevApiException("Invalid reaction emoji: " + emoji, HttpStatus.BAD_REQUEST, "INVALID_EMOJI");
        }

        Activity activity = activityRepo.findById(activityId)
                .orElseThrow(() -> new NilevApiException("Activity not found", HttpStatus.NOT_FOUND));

        // Authorization: only actor and connected partner can react
        Long actorId = activity.getActor().getId();
        Long partnerId = resolvePartnerId(currentUserId);
        boolean canReact = currentUserId.equals(actorId) ||
                (partnerId != null && (actorId.equals(partnerId) || currentUserId.equals(partnerId)));
        if (!canReact) {
            throw new NilevApiException("Not authorized to react to this activity", HttpStatus.FORBIDDEN);
        }

        Optional<ActivityReaction> existing = reactionRepo.findByActivityIdAndUserIdAndEmoji(activityId, currentUserId, emoji);
        boolean added;
        if (existing.isPresent()) {
            reactionRepo.delete(existing.get());
            added = false;
        } else {
            User user = userRepo.findById(currentUserId)
                    .orElseThrow(() -> new NilevApiException("User not found", HttpStatus.NOT_FOUND));
            reactionRepo.save(new ActivityReaction(activity, user, emoji));
            added = true;
        }

        Map<String, Long> counts = buildReactionCounts(activityId);
        return new ReactionResponse(activityId, emoji, added, counts);
    }

    // ── Internal publish ──────────────────────────────────────────────

    @Override
    public void publish(Long actorId, ActivityType type, Long referenceId,
                        String title, String description, String icon, String metadata) {
        try {
            User actor = userRepo.findById(actorId).orElse(null);
            if (actor == null) {
                log.warn("ActivityService.publish: actor {} not found, skipping", actorId);
                return;
            }
            Activity activity = Activity.builder()
                    .actor(actor)
                    .type(type)
                    .referenceId(referenceId)
                    .title(title)
                    .description(description)
                    .icon(icon != null ? icon : "✨")
                    .metadata(metadata)
                    .build();
            activityRepo.save(activity);
        } catch (Exception e) {
            // Never fail the caller due to activity publishing
            log.error("Failed to publish activity for actor {}: {}", actorId, e.getMessage(), e);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────

    private Long resolvePartnerId(Long userId) {
        return partnerConnectionRepo.findActiveConnectionForUser(userId)
                .map(conn -> {
                    Long u1 = conn.getUser1().getId();
                    Long u2 = conn.getUser2().getId();
                    return userId.equals(u1) ? u2 : u1;
                })
                .orElse(null);
    }

    private List<ActivityResponse> toResponses(List<Activity> activities, Long currentUserId) {
        return activities.stream()
                .map(a -> toResponse(a, currentUserId))
                .collect(Collectors.toList());
    }

    private ActivityResponse toResponse(Activity a, Long currentUserId) {
        ActivityResponse r = new ActivityResponse();
        r.setId(a.getId());
        r.setActorId(a.getActor().getId());
        String actorDisplayName = (a.getActor().getNickname() != null && !a.getActor().getNickname().isBlank())
                ? a.getActor().getNickname()
                : a.getActor().getName();
        r.setActorName(actorDisplayName);
        String actorAvatar = (a.getActor().getProfileImageUrl() != null && !a.getActor().getProfileImageUrl().isBlank())
                ? a.getActor().getProfileImageUrl()
                : a.getActor().getAvatarUrl();
        r.setActorAvatarUrl(actorAvatar);
        r.setType(a.getType());
        r.setReferenceId(a.getReferenceId());
        r.setTitle(a.getTitle());
        r.setDescription(a.getDescription());
        r.setIcon(a.getIcon());
        r.setMetadata(a.getMetadata());
        r.setCreatedAt(a.getCreatedAt());
        r.setMine(currentUserId.equals(a.getActor().getId()));

        // Reaction totals
        Map<String, Long> counts = buildReactionCounts(a.getId());
        r.setReactions(counts);

        // My reactions (which emojis I already used)
        Map<String, Boolean> mine = new LinkedHashMap<>();
        for (String e : ALLOWED_EMOJIS) {
            mine.put(e, reactionRepo.existsByActivityIdAndUserIdAndEmoji(a.getId(), currentUserId, e));
        }
        r.setMyReactions(mine);

        return r;
    }

    private Map<String, Long> buildReactionCounts(Long activityId) {
        Map<String, Long> counts = new LinkedHashMap<>();
        for (String e : ALLOWED_EMOJIS) counts.put(e, 0L);
        reactionRepo.countByEmojiForActivity(activityId)
                .forEach(row -> counts.put((String) row[0], ((Number) row[1]).longValue()));
        return counts;
    }

    private String normalizeEmoji(String emoji) {
        if (emoji == null) return null;
        emoji = emoji.trim();
        if (emoji.equals("❤️") || emoji.equals("❤") || emoji.equalsIgnoreCase("heart") || emoji.contains("\u2764")) {
            return "❤️";
        }
        if (emoji.equals("🔥") || emoji.equalsIgnoreCase("fire") || emoji.contains("\uD83D\uDD25")) {
            return "🔥";
        }
        if (emoji.equals("👏") || emoji.equalsIgnoreCase("clap") || emoji.contains("\uD83D\uDC4F")) {
            return "👏";
        }
        if (emoji.equals("✨") || emoji.equalsIgnoreCase("sparkles") || emoji.contains("\u2728")) {
            return "✨";
        }
        return emoji;
    }
}
