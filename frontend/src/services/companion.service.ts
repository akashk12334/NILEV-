import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  ApiResponse,
  CompanionResponse,
  ChooseCompanionRequest,
  UpdateCompanionRequest,
  CompanionHistoryResponse,
} from "../types";

export const companionService = {
  async getMyCompanion(): Promise<CompanionResponse> {
    const res = await apiClient.get<ApiResponse<CompanionResponse>>(ENDPOINTS.COMPANION.BASE);
    return res.data.data;
  },

  async chooseCompanion(data: ChooseCompanionRequest): Promise<CompanionResponse> {
    const res = await apiClient.post<ApiResponse<CompanionResponse>>(
      ENDPOINTS.COMPANION.CHOOSE,
      data
    );
    return res.data.data;
  },

  async updateCompanion(data: UpdateCompanionRequest): Promise<CompanionResponse> {
    const res = await apiClient.put<ApiResponse<CompanionResponse>>(
      ENDPOINTS.COMPANION.BASE,
      data
    );
    return res.data.data;
  },

  async getPartnerCompanion(): Promise<CompanionResponse> {
    const res = await apiClient.get<ApiResponse<CompanionResponse>>(
      ENDPOINTS.COMPANION.PARTNER
    );
    return res.data.data;
  },

  async getHistory(limit: number = 20): Promise<CompanionHistoryResponse[]> {
    const res = await apiClient.get<ApiResponse<CompanionHistoryResponse[]>>(
      `${ENDPOINTS.COMPANION.HISTORY}?limit=${limit}`
    );
    return res.data.data;
  },

  async interact(): Promise<CompanionResponse> {
    const res = await apiClient.post<ApiResponse<CompanionResponse>>(
      ENDPOINTS.COMPANION.INTERACT
    );
    return res.data.data;
  },
};
