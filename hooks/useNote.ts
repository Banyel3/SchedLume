"use client";

import { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { ClassNote } from "@/types";
import { getNote, saveNote } from "@/lib/db/noteStore";
import { useDebounce } from "./useDebounce";
import { DEBOUNCE_MS } from "@/lib/constants";

interface UseNoteResult {
  noteText: string;
  setNoteText: (text: string) => void;
  lastSaved: string | null;
  saving: boolean;
  error: Error | null;
}

export function useNote(
  date: string,
  classInstanceKey: string,
  subjectName: string,
  startTime: string
): UseNoteResult {
  const [noteText, setNoteText] = useState("");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [initialized, setInitialized] = useState(false);

  const debouncedText = useDebounce(noteText, DEBOUNCE_MS);
  const noteIdRef = useRef<string | null>(null);

  // Load existing note
  useEffect(() => {
    setInitialized(false);

    getNote(classInstanceKey)
      .then((note) => {
        if (note) {
          setNoteText(note.noteText);
          setLastSaved(note.updatedAt);
          noteIdRef.current = note.id;
        } else {
          setNoteText("");
          setLastSaved(null);
          noteIdRef.current = null;
        }
        setInitialized(true);
      })
      .catch((err) => {
        setError(err instanceof Error ? err : new Error("Failed to load note"));
        setInitialized(true);
      });
  }, [classInstanceKey]);

  // Autosave on debounced change
  useEffect(() => {
    if (!initialized) return;

    // Don't save empty notes that never existed
    if (debouncedText === "" && !noteIdRef.current) return;

    const save = async () => {
      try {
        setSaving(true);
        setError(null);

        const note: ClassNote = {
          id: noteIdRef.current || uuidv4(),
          date,
          classInstanceKey,
          subjectName,
          startTime,
          noteText: debouncedText,
          updatedAt: new Date().toISOString(),
        };

        await saveNote(note);
        noteIdRef.current = note.id;
        setLastSaved(note.updatedAt);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to save note"));
      } finally {
        setSaving(false);
      }
    };

    save();
  }, [
    debouncedText,
    initialized,
    date,
    classInstanceKey,
    subjectName,
    startTime,
  ]);

  return {
    noteText,
    setNoteText,
    lastSaved,
    saving,
    error,
  };
}
