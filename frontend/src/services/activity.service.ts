import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  ApiResponse,
  ActivityResponse,
  ReactionResponse,
} from "../types";

export const activityService = {
  /** Combined feed: user + partner, newest first */
  async getCombinedFeed(limit: number = 50): Promise<ActivityResponse[]> {
    const res = await apiClient.get<ApiResponse<ActivityResponse[]>>(
      `${ENDPOINTS.ACTIVITY.BASE}?limit=${limit}`
    );
    return res.data.data;
  },

  /** Only the current user's activities */
  async getMyFeed(limit: number = 50): Promise<ActivityResponse[]> {
    const res = await apiClient.get<ApiResponse<ActivityResponse[]>>(
      `${ENDPOINTS.ACTIVITY.ME}?limit=${limit}`
    );
    return res.data.data;
  },

  /** Only the partner's activities */
  async getPartnerFeed(limit: number = 50): Promise<ActivityResponse[]> {
    const res = await apiClient.get<ApiResponse<ActivityResponse[]>>(
      `${ENDPOINTS.ACTIVITY.PARTNER}?limit=${limit}`
    );
    return res.data.data;
  },

  /** Toggle reaction (❤️, 🔥, 👏, ✨) on an activity */
  async toggleReaction(activityId: number, emoji: string): Promise<ReactionResponse> {
    const res = await apiClient.post<ApiResponse<ReactionResponse>>(
      ENDPOINTS.ACTIVITY.REACT(activityId),
      { emoji }
    );
    return res.data.data;
  },
};
