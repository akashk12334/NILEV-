import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  ApiResponse,
  NotificationResponse,
  NotificationSummaryResponse,
} from "../types";

export const notificationService = {
  async getNotifications(
    unreadOnly: boolean = false,
    limit: number = 25
  ): Promise<NotificationSummaryResponse> {
    const res = await apiClient.get<ApiResponse<NotificationSummaryResponse>>(
      `${ENDPOINTS.NOTIFICATIONS.BASE}?unreadOnly=${unreadOnly}&limit=${limit}`
    );
    const data = res.data.data;
    if (data && data.notifications) {
      data.notifications = data.notifications.map((n) => ({
        ...n,
        isRead: n.isRead ?? (n as unknown as { read?: boolean }).read ?? false,
      }));
    }
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const res = await apiClient.get<ApiResponse<{ unreadCount: number }>>(
      ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT
    );
    return res.data.data.unreadCount;
  },

  async markAsRead(id: number): Promise<NotificationResponse> {
    const res = await apiClient.patch<ApiResponse<NotificationResponse>>(
      ENDPOINTS.NOTIFICATIONS.READ(id)
    );
    const n = res.data.data;
    if (n) {
      n.isRead = n.isRead ?? (n as unknown as { read?: boolean }).read ?? true;
    }
    return n;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.patch<ApiResponse<void>>(
      ENDPOINTS.NOTIFICATIONS.READ_ALL
    );
  },
};
