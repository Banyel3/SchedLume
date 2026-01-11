"use client";

import { useState, useEffect, useCallback } from "react";
import { ClassNote } from "@/types";
import { getNotesForDate, getDatesWithNotes } from "@/lib/db/noteStore";

interface UseNotesResult {
  notes: ClassNote[];
  noteMap: Map<string, ClassNote>;
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  hasNote: (classInstanceKey: string) => boolean;
}

export function useNotes(date: string): UseNotesResult {
  const [notes, setNotes] = useState<ClassNote[]>([]);
  const [noteMap, setNoteMap] = useState<Map<string, ClassNote>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotesForDate(date);
      setNotes(data);

      const map = new Map<string, ClassNote>();
      data.forEach((note) => {
        if (note.noteText.trim()) {
          map.set(note.classInstanceKey, note);
        }
      });
      setNoteMap(map);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load notes"));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const refresh = useCallback(async () => {
    await loadNotes();
  }, [loadNotes]);

  const hasNote = useCallback(
    (classInstanceKey: string) => {
      return noteMap.has(classInstanceKey);
    },
    [noteMap]
  );

  return { notes, noteMap, loading, error, refresh, hasNote };
}

interface UseDatesWithNotesResult {
  datesWithNotes: Set<string>;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useDatesWithNotes(
  startDate: string,
  endDate: string
): UseDatesWithNotesResult {
  const [datesWithNotes, setDatesWithNotes] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  const loadDates = useCallback(async () => {
    try {
      setLoading(true);
      const dates = await getDatesWithNotes(startDate, endDate);
      setDatesWithNotes(dates);
    } catch (err) {
      console.error("Failed to load dates with notes:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    loadDates();
  }, [loadDates]);

  return { datesWithNotes, loading, refresh: loadDates };
}
