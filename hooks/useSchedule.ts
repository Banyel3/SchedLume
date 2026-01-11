"use client";

import { useState, useEffect, useCallback } from "react";
import { ResolvedClass } from "@/types";
import { getScheduleForDate } from "@/lib/schedule/resolver";

interface UseScheduleResult {
  schedule: ResolvedClass[];
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
}

export function useSchedule(date: string): UseScheduleResult {
  const [schedule, setSchedule] = useState<ResolvedClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getScheduleForDate(date);
      setSchedule(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load schedule")
      );
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const refresh = useCallback(async () => {
    await loadSchedule();
  }, [loadSchedule]);

  return { schedule, loading, error, refresh };
}
