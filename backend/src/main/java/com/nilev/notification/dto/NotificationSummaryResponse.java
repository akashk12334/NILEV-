package com.nilev.notification.dto;

import java.util.List;

public class NotificationSummaryResponse {

    private long unreadCount;
    private List<NotificationResponse> notifications;

    public NotificationSummaryResponse() {}

    public NotificationSummaryResponse(long unreadCount, List<NotificationResponse> notifications) {
        this.unreadCount = unreadCount;
        this.notifications = notifications;
    }

    public long getUnreadCount() { return unreadCount; }
    public void setUnreadCount(long unreadCount) { this.unreadCount = unreadCount; }

    public List<NotificationResponse> getNotifications() { return notifications; }
    public void setNotifications(List<NotificationResponse> notifications) { this.notifications = notifications; }
}
