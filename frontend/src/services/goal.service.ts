import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  ApiResponse,
  GoalResponse,
  CreateGoalRequest,
  UpdateGoalRequest,
  UpdateGoalProgressRequest,
} from "../types";

export const goalService = {
  async getAll(tab?: string): Promise<GoalResponse[]> {
    const url = tab ? `${ENDPOINTS.GOALS.BASE}?tab=${tab}` : ENDPOINTS.GOALS.BASE;
    const res = await apiClient.get<ApiResponse<GoalResponse[]>>(url);
    return res.data.data;
  },

  async getPersonal(): Promise<GoalResponse[]> {
    const res = await apiClient.get<ApiResponse<GoalResponse[]>>(ENDPOINTS.GOALS.PERSONAL);
    return res.data.data;
  },

  async getShared(): Promise<GoalResponse[]> {
    const res = await apiClient.get<ApiResponse<GoalResponse[]>>(ENDPOINTS.GOALS.SHARED);
    return res.data.data;
  },

  async getCompleted(): Promise<GoalResponse[]> {
    const res = await apiClient.get<ApiResponse<GoalResponse[]>>(ENDPOINTS.GOALS.COMPLETED);
    return res.data.data;
  },

  async getPartner(): Promise<GoalResponse[]> {
    const res = await apiClient.get<ApiResponse<GoalResponse[]>>(ENDPOINTS.GOALS.PARTNER);
    return res.data.data;
  },

  async getById(id: number): Promise<GoalResponse> {
    const res = await apiClient.get<ApiResponse<GoalResponse>>(ENDPOINTS.GOALS.BY_ID(id));
    return res.data.data;
  },

  async create(data: CreateGoalRequest): Promise<GoalResponse> {
    const res = await apiClient.post<ApiResponse<GoalResponse>>(ENDPOINTS.GOALS.BASE, data);
    return res.data.data;
  },

  async update(id: number, data: UpdateGoalRequest): Promise<GoalResponse> {
    const res = await apiClient.put<ApiResponse<GoalResponse>>(ENDPOINTS.GOALS.BY_ID(id), data);
    return res.data.data;
  },

  async updateProgress(id: number, data: UpdateGoalProgressRequest): Promise<GoalResponse> {
    const res = await apiClient.patch<ApiResponse<GoalResponse>>(
      ENDPOINTS.GOALS.PROGRESS(id),
      data
    );
    return res.data.data;
  },

  async delete(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.GOALS.BY_ID(id));
  },
};
