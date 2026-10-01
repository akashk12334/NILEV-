package com.nilev.activity.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;

/**
 * A single reaction (❤️ 🔥 👏 ✨) left by a user on an activity.
 * One user can only react once per activity with a given emoji.
 */
@Entity
@Table(name = "activity_reactions",
       uniqueConstraints = @UniqueConstraint(
           name = "uq_reaction_activity_user_emoji",
           columnNames = {"activity_id", "user_id", "emoji"}
       ))
public class ActivityReaction extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "emoji", nullable = false, length = 10)
    private String emoji;

    public ActivityReaction() {}

    public ActivityReaction(Activity activity, User user, String emoji) {
        this.activity = activity;
        this.user = user;
        this.emoji = emoji;
    }

    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
}
