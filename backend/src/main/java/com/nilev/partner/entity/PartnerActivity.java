package com.nilev.partner.entity;

import com.nilev.common.BaseEntity;
import com.nilev.user.entity.User;
import jakarta.persistence.*;

@Entity
@Table(name = "partner_activities")
public class PartnerActivity extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "activity_type", nullable = false, length = 50)
    private String activityType;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String description;

    @Column(length = 50)
    private String icon = "✨";

    public PartnerActivity() {
    }

    public PartnerActivity(User user, String activityType, String title, String description, String icon) {
        this.user = user;
        this.activityType = activityType;
        this.title = title;
        this.description = description;
        this.icon = icon != null ? icon : "✨";
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getActivityType() {
        return activityType;
    }

    public void setActivityType(String activityType) {
        this.activityType = activityType;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private User user;
        private String activityType;
        private String title;
        private String description;
        private String icon = "✨";

        public Builder user(User user) {
            this.user = user;
            return this;
        }

        public Builder activityType(String activityType) {
            this.activityType = activityType;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder icon(String icon) {
            this.icon = icon;
            return this;
        }

        public PartnerActivity build() {
            return new PartnerActivity(user, activityType, title, description, icon);
        }
    }
}
