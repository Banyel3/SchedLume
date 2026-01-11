import { getAllBaseSchedules } from "../db/scheduleStore";
import { getAllOverrides } from "../db/overrideStore";
import { getAllNotes } from "../db/noteStore";
import { getSettings } from "../db/settingsStore";

interface ExportData {
  version: number;
  exportedAt: string;
  settings: Awaited<ReturnType<typeof getSettings>>;
  baseSchedules: Awaited<ReturnType<typeof getAllBaseSchedules>>;
  overrides: Awaited<ReturnType<typeof getAllOverrides>>;
  notes: Awaited<ReturnType<typeof getAllNotes>>;
}

/**
 * Export all app data as JSON
 */
export async function exportAllData(): Promise<string> {
  const [settings, baseSchedules, overrides, notes] = await Promise.all([
    getSettings(),
    getAllBaseSchedules(),
    getAllOverrides(),
    getAllNotes(),
  ]);

  const exportData: ExportData = {
    version: 1,
    exportedAt: new Date().toISOString(),
    settings,
    baseSchedules,
    overrides,
    notes,
  };

  return JSON.stringify(exportData, null, 2);
}

/**
 * Download data as a JSON file
 */
export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export and download all data
 */
export async function downloadBackup(): Promise<void> {
  const data = await exportAllData();
  const date = new Date().toISOString().split("T")[0];
  downloadJSON(data, `schedlume-backup-${date}.json`);
}
