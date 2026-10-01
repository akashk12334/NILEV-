package com.nilev.activity.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;

/**
 * An immutable activity event emitted when a domain action occurs.
 * Never created directly by users — only by domain services via ActivityEventService.
 */
@Entity
@Table(name = "activities",
       indexes = {
           @Index(name = "idx_activity_actor", columnList = "actor_id"),
           @Index(name = "idx_activity_created", columnList = "created_at DESC")
       })
public class Activity extends BaseEntity {

    /** The user who performed the action. */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private ActivityType type;

    /** Optional reference to the domain object (habit id, goal id, etc.) */
    @Column(name = "reference_id")
    private Long referenceId;

    @Size(max = 200)
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Size(max = 500)
    @Column(name = "description", length = 500)
    private String description;

    /** Emoji icon for this event. */
    @Column(name = "icon", length = 10)
    private String icon = "✨";

    /** JSON metadata blob (habit name, streak count, goal %, etc.) stored as plain text. */
    @Column(name = "metadata", columnDefinition = "TEXT")
    private String metadata;

    /** Cached reaction counts as a simple JSON string, e.g. {"❤️":2,"🔥":1} */
    @Column(name = "reaction_summary", length = 200)
    private String reactionSummary = "{}";

    public Activity() {}

    // ── getters & setters ──────────────────────────────────────────

    public User getActor() { return actor; }
    public void setActor(User actor) { this.actor = actor; }

    public ActivityType getType() { return type; }
    public void setType(ActivityType type) { this.type = type; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getIcon() { return icon; }
    public void setIcon(String icon) { this.icon = icon; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }

    public String getReactionSummary() { return reactionSummary; }
    public void setReactionSummary(String reactionSummary) { this.reactionSummary = reactionSummary; }

    // ── builder ────────────────────────────────────────────────────

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private User actor;
        private ActivityType type;
        private Long referenceId;
        private String title;
        private String description;
        private String icon = "✨";
        private String metadata;

        public Builder actor(User actor) { this.actor = actor; return this; }
        public Builder type(ActivityType type) { this.type = type; return this; }
        public Builder referenceId(Long referenceId) { this.referenceId = referenceId; return this; }
        public Builder title(String title) { this.title = title; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder icon(String icon) { this.icon = icon; return this; }
        public Builder metadata(String metadata) { this.metadata = metadata; return this; }

        public Activity build() {
            Activity a = new Activity();
            a.actor = actor;
            a.type = type;
            a.referenceId = referenceId;
            a.title = title;
            a.description = description;
            a.icon = icon;
            a.metadata = metadata;
            return a;
        }
    }
}
