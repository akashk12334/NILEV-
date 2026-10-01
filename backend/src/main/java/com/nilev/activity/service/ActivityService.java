package com.nilev.activity.service;

import com.nilev.activity.entity.ActivityType;
import com.nilev.activity.dto.ActivityResponse;
import com.nilev.activity.dto.ReactionResponse;

import java.util.List;

public interface ActivityService {

    // ── Feed queries ─────────────────────────────────────────────

    /** Combined feed: caller + partner, newest first. */
    List<ActivityResponse> getCombinedFeed(Long currentUserId, int limit);

    /** Only the caller's activity. */
    List<ActivityResponse> getMyFeed(Long currentUserId, int limit);

    /** Only the partner's activity — requires an active connection. */
    List<ActivityResponse> getPartnerFeed(Long currentUserId, int limit);

    // ── Reaction ─────────────────────────────────────────────────

    /**
     * Toggle a reaction on an activity.
     * Both connected users can react to each other's activities.
     */
    ReactionResponse toggleReaction(Long currentUserId, Long activityId, String emoji);

    // ── Internal publish (used by domain services only) ──────────

    /**
     * Publish a new activity event.
     * Must only be called from trusted domain services, never from controllers.
     *
     * @param actorId      User who performed the action
     * @param type         Type of event
     * @param referenceId  ID of the related domain object (may be null)
     * @param title        Short display title
     * @param description  Longer description
     * @param icon         Emoji icon
     * @param metadata     Optional JSON metadata string
     */
    void publish(Long actorId, ActivityType type, Long referenceId,
                 String title, String description, String icon, String metadata);
}
