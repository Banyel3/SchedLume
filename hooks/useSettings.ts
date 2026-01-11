"use client";

import { useState, useEffect, useCallback } from "react";
import { AppSettings, DEFAULT_SETTINGS } from "@/types";
import { getSettings, saveSettings } from "@/lib/db/settingsStore";

interface UseSettingsResult {
  settings: AppSettings;
  loading: boolean;
  error: Error | null;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  refresh: () => Promise<void>;
}

export function useSettings(): UseSettingsResult {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSettings();
      setSettings(data);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to load settings")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const updateSettings = useCallback(async (updates: Partial<AppSettings>) => {
    try {
      setError(null);
      const updated = await saveSettings(updates);
      setSettings(updated);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("Failed to save settings")
      );
      throw err;
    }
  }, []);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refresh: loadSettings,
  };
}
