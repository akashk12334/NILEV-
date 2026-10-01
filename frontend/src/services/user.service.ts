import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { ApiResponse, User } from "../types";

export const userService = {
  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>(ENDPOINTS.USERS.ME);
    return res.data.data;
  },

  async getUserById(id: number | string): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>(ENDPOINTS.USERS.BY_ID(id));
    return res.data.data;
  },
};
