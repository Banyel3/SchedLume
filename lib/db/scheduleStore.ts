import { SubjectSchedule } from "@/types";
import { STORE_NAMES } from "../constants";
import { initDB } from "./indexedDb";

export async function getAllBaseSchedules(): Promise<SubjectSchedule[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.BASE_SCHEDULES, "readonly");
    const store = tx.objectStore(STORE_NAMES.BASE_SCHEDULES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getBaseSchedulesByWeekday(
  weekday: number
): Promise<SubjectSchedule[]> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.BASE_SCHEDULES, "readonly");
    const store = tx.objectStore(STORE_NAMES.BASE_SCHEDULES);
    const index = store.index("weekday");
    const request = index.getAll(weekday);

    request.onsuccess = () => {
      const results = request.result as SubjectSchedule[];
      resolve(results.sort((a, b) => a.startTime.localeCompare(b.startTime)));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function getBaseScheduleById(
  id: string
): Promise<SubjectSchedule | null> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.BASE_SCHEDULES, "readonly");
    const store = tx.objectStore(STORE_NAMES.BASE_SCHEDULES);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result ?? null);
    request.onerror = () => reject(request.error);
  });
}

export async function addBaseSchedule(
  schedule: SubjectSchedule
): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.BASE_SCHEDULES, "readwrite");
    const store = tx.objectStore(STORE_NAMES.BASE_SCHEDULES);
    const request = store.add(schedule);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function replaceAllBaseSchedules(
  schedules: SubjectSchedule[]
): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.BASE_SCHEDULES, "readwrite");
    const store = tx.objectStore(STORE_NAMES.BASE_SCHEDULES);

    // Clear existing schedules
    store.clear();

    // Add all new schedules
    schedules.forEach((schedule) => {
      store.add(schedule);
    });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteBaseSchedule(id: string): Promise<void> {
  const db = await initDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAMES.BASE_SCHEDULES, "readwrite");
    const store = tx.objectStore(STORE_NAMES.BASE_SCHEDULES);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
