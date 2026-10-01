package com.nilev.partner.dto;

import com.nilev.partner.entity.PartnerActivity;
import java.time.Instant;

public class PartnerActivityResponse {

    private Long id;
    private Long userId;
    private String userName;
    private String userAvatarUrl;
    private String activityType;
    private String title;
    private String description;
    private String icon;
    private Instant createdAt;

    @com.fasterxml.jackson.annotation.JsonProperty("isPartner")
    private boolean isPartner;

    public PartnerActivityResponse() {
    }

    public PartnerActivityResponse(Long id, Long userId, String userName, String userAvatarUrl,
                                   String activityType, String title, String description,
                                   String icon, Instant createdAt, boolean isPartner) {
        this.id = id;
        this.userId = userId;
        this.userName = userName;
        this.userAvatarUrl = userAvatarUrl;
        this.activityType = activityType;
        this.title = title;
        this.description = description;
        this.icon = icon;
        this.createdAt = createdAt;
        this.isPartner = isPartner;
    }

    public static PartnerActivityResponse fromEntity(PartnerActivity activity, Long currentUserId) {
        if (activity == null) return null;
        Long activityUserId = activity.getUser() != null ? activity.getUser().getId() : null;
        boolean isPartner = activityUserId != null && !activityUserId.equals(currentUserId);

        return new PartnerActivityResponse(
                activity.getId(),
                activityUserId,
                activity.getUser() != null ? activity.getUser().getName() : null,
                activity.getUser() != null ? activity.getUser().getAvatarUrl() : null,
                activity.getActivityType(),
                activity.getTitle(),
                activity.getDescription(),
                activity.getIcon(),
                activity.getCreatedAt(),
                isPartner
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserAvatarUrl() {
        return userAvatarUrl;
    }

    public void setUserAvatarUrl(String userAvatarUrl) {
        this.userAvatarUrl = userAvatarUrl;
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

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("isPartner")
    public boolean isPartner() {
        return isPartner;
    }

    public void setPartner(boolean partner) {
        isPartner = partner;
    }
}
