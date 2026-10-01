import { useState, useEffect, useCallback } from "react";
import { habitService } from "../services/habit.service";
import type {
  HabitResponse,
  CreateHabitRequest,
  UpdateHabitRequest,
} from "../types";

export function useHabits() {
  const [habits, setHabits] = useState<HabitResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => { load(); }, [load]);

  const create = useCallback(async (data: CreateHabitRequest) => {
    const created = await habitService.create(data);
    setHabits((prev) => [created, ...prev]);
    return created;
  }, []);

  const update = useCallback(async (id: number, data: UpdateHabitRequest) => {
    const updated = await habitService.update(id, data);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    return updated;
  }, []);

  const remove = useCallback(async (id: number) => {
    await habitService.delete(id);
    setHabits((prev) => prev.filter((h) => h.id !== id));
  }, []);

  const complete = useCallback(async (id: number) => {
    const updated = await habitService.complete(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    return updated;
  }, []);

  const uncomplete = useCallback(async (id: number) => {
    const updated = await habitService.uncomplete(id);
    setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)));
    return updated;
  }, []);

  return { habits, loading, error, reload: load, create, update, remove, complete, uncomplete };
}
