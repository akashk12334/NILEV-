package com.nilev.analytics.dto;

public class PartnerAnalyticsInfo {
    private Long partnerId;
    private String partnerName;
    private String partnerAvatarUrl;
    private boolean isConnected;
    private int relationshipStreak;
    private int daysConnected;

    public PartnerAnalyticsInfo() {}

    public Long getPartnerId() { return partnerId; }
    public void setPartnerId(Long partnerId) { this.partnerId = partnerId; }

    public String getPartnerName() { return partnerName; }
    public void setPartnerName(String partnerName) { this.partnerName = partnerName; }

    public String getPartnerAvatarUrl() { return partnerAvatarUrl; }
    public void setPartnerAvatarUrl(String partnerAvatarUrl) { this.partnerAvatarUrl = partnerAvatarUrl; }

    public boolean isConnected() { return isConnected; }
    public void setConnected(boolean connected) { isConnected = connected; }

    public int getRelationshipStreak() { return relationshipStreak; }
    public void setRelationshipStreak(int relationshipStreak) { this.relationshipStreak = relationshipStreak; }

    public int getDaysConnected() { return daysConnected; }
    public void setDaysConnected(int daysConnected) { this.daysConnected = daysConnected; }
}
