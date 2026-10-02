import { useState, useEffect, useCallback } from "react";
import { habitService } from "../services/habit.service";
import type {
  HabitResponse,
  CreateHabitRequest,
  UpdateHabitRequest,
  TodayHabitSummaryResponse,
} from "../types";

export function useHabits() {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [partnerHabits, setPartnerHabits] = useState<HabitResponse[]>([]);
  const [todaySummary, setTodaySummary] = useState<TodayHabitSummaryResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingPartner, setLoadingPartner] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await habitService.getAll();
      setHabits(data);
    } catch {
      setError("Failed to load habits");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadPartner = useCallback(async () => {
    setLoadingPartner(true);
    setPartnerError(null);
    try {
      const data = await habitService.getPartnerHabits();
      setPartnerHabits(data || []);
    } catch {
      setPartnerError("Failed to load partner habits");
    } finally {
      setLoadingPartner(false);
    }
  }, []);

  const loadSummary = useCallback(async () => {
    setLoadingSummary(true);
    try {
      const data = await habitService.getTodaySummary();
      setTodaySummary(data);
    } catch {
      // non-critical error
    } finally {
      setLoadingSummary(false);
    }
  }, []);

  useEffect(() => {
    load();
    loadPartner();
    loadSummary();
  }, [load, loadPartner, loadSummary]);

  const create = useCallback(async (data: CreateHabitRequest) => {
    const created = await habitService.create(data);
    setHabits((prev) => [created, ...prev]);
    loadSummary();
    return created;
  }, [loadSummary]);

  const createBulk = useCallback(async (data: CreateHabitRequest[]) => {
    const createdList = await habitService.createBulk(data);
    setHabits((prev) => [...createdList, ...prev]);
    loadSummary();
    return createdList;
  }, [loadSummary]);

  const update = useCallback(async (id: number, data: UpdateHabitRequest) => {
    const updated = await habitService.update(id, data);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    loadSummary();
    return updated;
  }, [loadSummary]);

  const remove = useCallback(async (id: number) => {
    await habitService.delete(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
    loadSummary();
  }, [loadSummary]);

  const complete = useCallback(async (id: number) => {
    const updated = await habitService.complete(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    loadSummary();
    return updated;
  }, [loadSummary]);

  const uncomplete = useCallback(async (id: number) => {
    const updated = await habitService.uncomplete(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    loadSummary();
    return updated;
  }, [loadSummary]);

  return {
    habits,
    partnerHabits,
    todaySummary,
    loading,
    loadingPartner,
    loadingSummary,
    error,
    partnerError,
    reload: load,
    reloadPartner: loadPartner,
    reloadSummary: loadSummary,
    create,
    createBulk,
    update,
    remove,
    complete,
    uncomplete,
  };
}
