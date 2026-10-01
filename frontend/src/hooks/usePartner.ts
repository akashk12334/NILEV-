import { useState, useEffect, useCallback } from "react";
import { partnerService } from "../services";
import type {
  PartnerStatusResponse,
  PartnerActivityResponse,
} from "../types";

export function usePartner() {
  const [partnerStatus, setPartnerStatus] = useState<PartnerStatusResponse | null>(null);
  const [activities, setActivities] = useState<PartnerActivityResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      setError(null);
      const data = await partnerService.getStatus();
      setPartnerStatus(data);

      // If connected, also load activities
      if (data.status === "CONNECTED") {
        try {
          const acts = await partnerService.getActivities();
          setActivities(acts);
        } catch {
          // Non-critical
        }
      } else {
        setActivities([]);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to load partner status.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const invite = useCallback(
    async (email: string): Promise<PartnerStatusResponse> => {
      setActionLoading(true);
      setError(null);
      try {
        const res = await partnerService.invite({ email });
        setPartnerStatus(res);
        return res;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Failed to send partner invitation.";
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const accept = useCallback(
    async (invitationId?: number): Promise<PartnerStatusResponse> => {
      setActionLoading(true);
      setError(null);
      try {
        const res = await partnerService.accept({ invitationId });
        setPartnerStatus(res);
        // Refresh activities
        const acts = await partnerService.getActivities();
        setActivities(acts);
        return res;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Failed to accept partner invitation.";
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const reject = useCallback(
    async (invitationId?: number): Promise<PartnerStatusResponse> => {
      setActionLoading(true);
      setError(null);
      try {
        const res = await partnerService.reject({ invitationId });
        setPartnerStatus(res);
        return res;
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { message?: string } } })?.response?.data
            ?.message || "Failed to reject partner invitation.";
        setError(msg);
        throw err;
      } finally {
        setActionLoading(false);
      }
    },
    []
  );

  const disconnect = useCallback(async (): Promise<void> => {
    setActionLoading(true);
    setError(null);
    try {
      await partnerService.disconnect();
      await fetchStatus();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Failed to disconnect partner.";
      setError(msg);
      throw err;
    } finally {
      setActionLoading(false);
    }
  }, [fetchStatus]);

  return {
    partnerStatus,
    activities,
    isLoading,
    actionLoading,
    error,
    invite,
    accept,
    reject,
    disconnect,
    refresh: fetchStatus,
  };
}

export default usePartner;
