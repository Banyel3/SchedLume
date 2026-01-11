import { AppSettings, DEFAULT_SETTINGS } from "@/types";
import { STORE_NAMES } from "../constants";
import { initDB } from "./indexedDb";

export async function getSettings(): Promise<AppSettings> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.SETTINGS, "readonly");
    const store = tx.objectStore(STORE_NAMES.SETTINGS);
    const request = store.get("app-settings");

    request.onsuccess = () => {
      const result = request.result as AppSettings | undefined;
      resolve(result ?? DEFAULT_SETTINGS);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function saveSettings(
  settings: Partial<AppSettings>
): Promise<AppSettings> {
  const db = await initDB();
  const currentSettings = await getSettings();

  const updatedSettings: AppSettings = {
    ...currentSettings,
    ...settings,
    id: "app-settings",
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.SETTINGS, "readwrite");
    const store = tx.objectStore(STORE_NAMES.SETTINGS);
    const request = store.put(updatedSettings);

    request.onsuccess = () => resolve(updatedSettings);
    request.onerror = () => reject(request.error);
  });
}

export async function updateLastImport(fileName: string): Promise<void> {
  await saveSettings({
    lastImportedFileName: fileName,
    lastImportedAt: new Date().toISOString(),
  });
}
