import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  ApiResponse,
  SurpriseResponse,
  CreateSurpriseRequest,
  UpdateSurpriseRequest,
} from "../types";

export const surpriseService = {
  async getReceivedSurprises(): Promise<SurpriseResponse[]> {
    const res = await apiClient.get<ApiResponse<SurpriseResponse[]>>(
      ENDPOINTS.SURPRISES.RECEIVED
    );
    return res.data.data;
  },

  async getSentSurprises(): Promise<SurpriseResponse[]> {
    const res = await apiClient.get<ApiResponse<SurpriseResponse[]>>(
      ENDPOINTS.SURPRISES.SENT
    );
    return res.data.data;
  },

  async getScheduledSurprises(): Promise<SurpriseResponse[]> {
    const res = await apiClient.get<ApiResponse<SurpriseResponse[]>>(
      ENDPOINTS.SURPRISES.SCHEDULED
    );
    return res.data.data;
  },

  async getSurpriseById(id: number): Promise<SurpriseResponse> {
    const res = await apiClient.get<ApiResponse<SurpriseResponse>>(
      ENDPOINTS.SURPRISES.BY_ID(id)
    );
    return res.data.data;
  },

  async createSurprise(data: CreateSurpriseRequest): Promise<SurpriseResponse> {
    const res = await apiClient.post<ApiResponse<SurpriseResponse>>(
      ENDPOINTS.SURPRISES.BASE,
      data
    );
    return res.data.data;
  },

  async updateSurprise(
    id: number,
    data: UpdateSurpriseRequest
  ): Promise<SurpriseResponse> {
    const res = await apiClient.put<ApiResponse<SurpriseResponse>>(
      ENDPOINTS.SURPRISES.BY_ID(id),
      data
    );
    return res.data.data;
  },

  async deleteSurprise(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(ENDPOINTS.SURPRISES.BY_ID(id));
  },

  async openSurprise(id: number): Promise<SurpriseResponse> {
    const res = await apiClient.post<ApiResponse<SurpriseResponse>>(
      ENDPOINTS.SURPRISES.OPEN(id)
    );
    return res.data.data;
  },

  async sendDraft(id: number): Promise<SurpriseResponse> {
    const res = await apiClient.post<ApiResponse<SurpriseResponse>>(
      ENDPOINTS.SURPRISES.SEND_DRAFT(id)
    );
    return res.data.data;
  },
};
