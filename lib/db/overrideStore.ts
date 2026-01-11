import { DayOverride } from "@/types";
import { STORE_NAMES } from "../constants";
import { initDB } from "./indexedDb";

export async function getOverridesByDate(date: string): Promise<DayOverride[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.OVERRIDES, "readonly");
    const store = tx.objectStore(STORE_NAMES.OVERRIDES);
    const index = store.index("date");
    const request = index.getAll(date);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getOverrideById(id: string): Promise<DayOverride | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.OVERRIDES, "readonly");
    const store = tx.objectStore(STORE_NAMES.OVERRIDES);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function upsertOverride(override: DayOverride): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.OVERRIDES, "readwrite");
    const store = tx.objectStore(STORE_NAMES.OVERRIDES);
    const request = store.put(override);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function deleteOverride(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.OVERRIDES, "readwrite");
    const store = tx.objectStore(STORE_NAMES.OVERRIDES);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAllOverrides(): Promise<DayOverride[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.OVERRIDES, "readonly");
    const store = tx.objectStore(STORE_NAMES.OVERRIDES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getDatesWithOverrides(
  startDate: string,
  endDate: string
): Promise<Set<string>> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.OVERRIDES, "readonly");
    const store = tx.objectStore(STORE_NAMES.OVERRIDES);
    const dates = new Set<string>();
    const request = store.openCursor();

    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest).result;
      if (cursor) {
        const override = cursor.value as DayOverride;
        if (override.date >= startDate && override.date <= endDate) {
          dates.add(override.date);
        }
        cursor.continue();
      } else {
        resolve(dates);
      }
    };
    request.onerror = () => reject(request.error);
  });
}
