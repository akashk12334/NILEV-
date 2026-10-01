import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  ApiResponse,
  HabitResponse,
  CreateHabitRequest,
  UpdateHabitRequest,
  HabitCompletionResponse,
} from "../types";

export const habitService = {
  async getAll(): Promise<HabitResponse[]> {
    const res = await apiClient.get<ApiResponse<HabitResponse[]>>(ENDPOINTS.HABITS.BASE);
    return res.data.data;
  },

  async getById(id: number): Promise<HabitResponse> {
    const res = await apiClient.get<ApiResponse<HabitResponse>>(ENDPOINTS.HABITS.BY_ID(id));
    return res.data.data;
  },

  async create(data: CreateHabitRequest): Promise<HabitResponse> {
    const res = await apiClient.post<ApiResponse<HabitResponse>>(ENDPOINTS.HABITS.BASE, data);
    return res.data.data;
  },

  async update(id: number, data: UpdateHabitRequest): Promise<HabitResponse> {
    const res = await apiClient.put<ApiResponse<HabitResponse>>(ENDPOINTS.HABITS.BY_ID(id), data);
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.HABITS.BY_ID(id));
  },

  async complete(id: number): Promise<HabitResponse> {
    const res = await apiClient.post<ApiResponse<HabitResponse>>(ENDPOINTS.HABITS.COMPLETE(id));
    return res.data.data;
  },

  async uncomplete(id: number): Promise<HabitResponse> {
    const res = await apiClient.delete<ApiResponse<HabitResponse>>(ENDPOINTS.HABITS.COMPLETE(id));
    return res.data.data;
  },

  async getHistory(id: number): Promise<HabitCompletionResponse[]> {
    const res = await apiClient.get<ApiResponse<HabitCompletionResponse[]>>(
      ENDPOINTS.HABITS.HISTORY(id)
    );
    return res.data.data;
  },
};
