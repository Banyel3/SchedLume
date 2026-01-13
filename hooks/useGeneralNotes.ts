"use client";

import { useState, useEffect, useCallback } from "react";
import {
  getGeneralNotesByDate,
  saveGeneralNote,
  deleteGeneralNote,
  getDatesWithGeneralNotes,
} from "@/lib/db/generalNoteStore";
import { deleteNotificationRecordsForNote } from "@/lib/db/notificationRecordStore";
import type { GeneralNote } from "@/types";

interface UseGeneralNotesReturn {
  notes: GeneralNote[];
  loading: boolean;
  error: string | null;
  saveNote: (
    note: Omit<GeneralNote, "id" | "createdAt" | "updatedAt"> & { id?: string }
  ) => Promise<GeneralNote>;
  removeNote: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useGeneralNotes(date: string): UseGeneralNotesReturn {
  const [notes, setNotes] = useState<GeneralNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const fetchedNotes = await getGeneralNotesByDate(date);
      // Sort by updatedAt (newest first)
      fetchedNotes.sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setNotes(fetchedNotes);
    } catch (err) {
      console.error("[useGeneralNotes] Failed to load notes:", err);
      setError("Failed to load notes");
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  const saveNote = useCallback(
    async (
      note: Omit<GeneralNote, "id" | "createdAt" | "updatedAt"> & { id?: string }
    ): Promise<GeneralNote> => {
      const savedNote = await saveGeneralNote(note);
      // Optimistic update
      setNotes((prev) => {
        const existing = prev.find((n) => n.id === savedNote.id);
        if (existing) {
          return prev.map((n) => (n.id === savedNote.id ? savedNote : n));
        }
        return [savedNote, ...prev];
      });
      return savedNote;
    },
    []
  );

  const removeNote = useCallback(async (id: string): Promise<void> => {
    await deleteGeneralNote(id);
    await deleteNotificationRecordsForNote(id);
    setNotes((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const refresh = useCallback(async () => {
    await loadNotes();
  }, [loadNotes]);

  return { notes, loading, error, saveNote, removeNote, refresh };
}

// Hook for getting dates with general notes (for calendar indicators)
export function useDatesWithGeneralNotes(
  startDate: string,
  endDate: string
): Set<string> {
  const [dates, setDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    getDatesWithGeneralNotes(startDate, endDate)
      .then(setDates)
      .catch((err) => {
        console.error("[useDatesWithGeneralNotes] Failed to load dates:", err);
      });
  }, [startDate, endDate]);

  return dates;
}
