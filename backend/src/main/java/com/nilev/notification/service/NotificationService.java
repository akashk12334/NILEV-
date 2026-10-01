package com.nilev.notification.service;

import com.nilev.notification.dto.NotificationResponse;
import com.nilev.notification.dto.NotificationSummaryResponse;
import com.nilev.notification.entity.Notification;
import com.nilev.notification.entity.NotificationType;
import com.nilev.user.entity.User;

public interface NotificationService {

    NotificationSummaryResponse getNotifications(Long currentUserId, Boolean unreadOnly, int limit);

    long getUnreadCount(Long currentUserId);

    NotificationResponse markAsRead(Long currentUserId, Long notificationId);

    void markAllAsRead(Long currentUserId);

    Notification sendNotification(User recipient, User actor, NotificationType type, String title, String message, String icon, Long referenceId, String referenceType, String actionUrl);
}
