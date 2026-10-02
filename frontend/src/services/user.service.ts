import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type { ApiResponse, User, UpdateUserRequest, DeleteAccountRequest } from "../types";

export const userService = {
  async getCurrentUser(): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>(ENDPOINTS.USERS.ME);
    return res.data.data;
  },

  async getUserById(id: number | string): Promise<User> {
    const res = await apiClient.get<ApiResponse<User>>(ENDPOINTS.USERS.BY_ID(id));
    return res.data.data;
  },

  async updateUser(data: UpdateUserRequest): Promise<User> {
    const res = await apiClient.put<ApiResponse<User>>(ENDPOINTS.USERS.ME, data);
    return res.data.data;
  },

  async uploadProfilePicture(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("file", file);

    const res = await apiClient.post<ApiResponse<User>>(
      ENDPOINTS.USERS.PROFILE_PICTURE,
      formData
    );
    return res.data.data;
  },

  async removeProfilePicture(): Promise<User> {
    const res = await apiClient.delete<ApiResponse<User>>(
      ENDPOINTS.USERS.PROFILE_PICTURE
    );
    return res.data.data;
  },

  async deleteAccount(confirmation: string): Promise<void> {
    const payload: DeleteAccountRequest = { confirmation };
    await apiClient.delete<ApiResponse<void>>(ENDPOINTS.USERS.ME, {
      data: payload,
    });
  },
};
