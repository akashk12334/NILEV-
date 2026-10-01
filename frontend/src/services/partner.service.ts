import { apiClient } from "../api/client";
import { ENDPOINTS } from "../api/endpoints";
import type {
  ApiResponse,
  PartnerStatusResponse,
  PartnerActivityResponse,
  InvitePartnerRequest,
  AcceptInvitationRequest,
  RejectInvitationRequest,
} from "../types";

export const partnerService = {
  async getStatus(): Promise<PartnerStatusResponse> {
    const res = await apiClient.get<ApiResponse<PartnerStatusResponse>>(
      ENDPOINTS.PARTNERS.BASE
    );
    return res.data.data;
  },

  async invite(data: InvitePartnerRequest): Promise<PartnerStatusResponse> {
    const res = await apiClient.post<ApiResponse<PartnerStatusResponse>>(
      ENDPOINTS.PARTNERS.INVITE,
      data
    );
    return res.data.data;
  },

  async accept(data?: AcceptInvitationRequest): Promise<PartnerStatusResponse> {
    const res = await apiClient.post<ApiResponse<PartnerStatusResponse>>(
      ENDPOINTS.PARTNERS.ACCEPT,
      data || {}
    );
    return res.data.data;
  },

  async reject(data?: RejectInvitationRequest): Promise<PartnerStatusResponse> {
    const res = await apiClient.post<ApiResponse<PartnerStatusResponse>>(
      ENDPOINTS.PARTNERS.REJECT,
      data || {}
    );
    return res.data.data;
  },

  async disconnect(): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(ENDPOINTS.PARTNERS.CONNECTION);
  },

  async getActivities(): Promise<PartnerActivityResponse[]> {
    const res = await apiClient.get<ApiResponse<PartnerActivityResponse[]>>(
      ENDPOINTS.PARTNERS.ACTIVITY
    );
    return res.data.data || [];
  },
};
